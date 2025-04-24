import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/signup',
  '/verify-email',
  '/sign-in(.*)',
  '/api/auth'
])

export default clerkMiddleware(async (auth, req) => {
  // Redirect /sign-up to /signup
  if (req.nextUrl.pathname.startsWith('/sign-up')) {
    const url = req.nextUrl.clone()
    url.pathname = '/signup'
    return NextResponse.redirect(url)
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}