import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/problems/(.*)/submit',
  '/organizations/new',
])

// Sub-routes of /onboarding that are safe to visit even after accepting terms.
// These handle role assignment and profile setup which can legitimately happen
// after the TOS cookie is set (e.g. new device, missing role, etc.)
const ONBOARDING_SETUP_ROUTES = [
  '/onboarding/routing',
  '/onboarding/role-selection',
  '/onboarding/organization',
  '/onboarding/student',
  '/onboarding/sync-role',
]

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (userId) {
    const pathname = req.nextUrl.pathname;
    const isApi = pathname.startsWith('/api');
    const hasCookie = req.cookies.has('onboarding_complete');

    // Only the exact /onboarding TOS page should be blocked when cookie exists.
    // Sub-routes (routing, role-selection, organization, student) must remain
    // accessible so users can complete profile/role setup after TOS acceptance.
    const isOnboardingRoot = pathname === '/onboarding' || pathname === '/onboarding/';
    const isOnboardingSetup = ONBOARDING_SETUP_ROUTES.some(r => pathname.startsWith(r));
    const isAnyOnboarding = pathname.startsWith('/onboarding');

    // Redirect to onboarding TOS if cookie is not set and they're not already there
    if (!hasCookie && !isAnyOnboarding && !isApi) {
      return Response.redirect(new URL('/onboarding', req.url));
    }

    // Block the TOS page only (not sub-routes) once the cookie is set
    if (hasCookie && isOnboardingRoot && !isOnboardingSetup) {
      return Response.redirect(new URL('/', req.url));
    }
  }

  // Enforce protected routes
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
