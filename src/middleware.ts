import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/problems/(.*)/submit',
  '/organizations/new',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If user is logged in, check for onboarding cookie
  if (userId) {
    const isOnboarding = req.nextUrl.pathname.startsWith('/onboarding');
    const isApi = req.nextUrl.pathname.startsWith('/api');
    const hasCookie = req.cookies.has('onboarding_complete');

    if (!hasCookie && !isOnboarding && !isApi) {
      return Response.redirect(new URL('/onboarding', req.url));
    }

    if (hasCookie && isOnboarding) {
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
