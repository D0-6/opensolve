import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/problems/(.*)/submit',
  '/problems/(.*)/apply',
  '/problems/(.*)/team',
  '/organizations/new',
])

// Onboarding sub-routes that must remain accessible regardless of cookie state
const ONBOARDING_SETUP_ROUTES = [
  '/onboarding/routing',
  '/onboarding/role-selection',
  '/onboarding/organization',
  '/onboarding/student',
  '/onboarding/sync-role',
  '/terms',
  '/privacy',
]

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (userId) {
    const pathname = req.nextUrl.pathname;
    const isApi = pathname.startsWith('/api');

    // --- Gate 1: TOS / onboarding_complete cookie ---
    const hasTOSCookie = req.cookies.has('onboarding_complete');
    const isOnboardingRoot = pathname === '/onboarding' || pathname === '/onboarding/';
    const isOnboardingSetup = ONBOARDING_SETUP_ROUTES.some(r => pathname.startsWith(r));
    const isAnyOnboarding = pathname.startsWith('/onboarding');

    // Redirect to TOS page if not yet accepted and not already in onboarding
    if (!hasTOSCookie && !isAnyOnboarding && !isApi) {
      return Response.redirect(new URL('/onboarding', req.url));
    }

    // Block TOS page if already accepted (let sub-routes pass)
    if (hasTOSCookie && isOnboardingRoot && !isOnboardingSetup) {
      return Response.redirect(new URL('/', req.url));
    }

    // --- Gate 2: Student profile_complete cookie ---
    // Students who have accepted TOS but haven't filled their profile
    // are gated to the onboarding/student page until they complete it.
    // We read the Clerk publicMetadata role from the session claims.
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as Record<string, string> | undefined)?.role
      || (sessionClaims?.publicMetadata as Record<string, string> | undefined)?.role;

    if (
      hasTOSCookie &&
      role === 'student' &&
      !req.cookies.has('profile_complete') &&
      !isOnboardingSetup &&
      !isApi &&
      // Allow home and problem browsing without a complete profile
      // so users can still explore before being forced through the form
      pathname.startsWith('/dashboard')
    ) {
      return Response.redirect(new URL('/onboarding/student', req.url));
    }
  }

  // Enforce protected routes require auth
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/__clerk/:path*',
    '/(api|trpc)(.*)',
  ],
}
