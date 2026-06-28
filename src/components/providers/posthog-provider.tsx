'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize in browser environment and if key is present
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        capture_pageview: false, // We handle this manually in Next.js App Router
        capture_pageleave: true, 
      });
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}

// Separate component for page view tracking to keep the hook inside the provider context
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + '?' + searchParams.toString();
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
