import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (posthogClient) return posthogClient;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!key) {
    console.warn('PostHog API Key is missing. Server-side telemetry is disabled.');
    return null;
  }

  posthogClient = new PostHog(key, { host });
  return posthogClient;
}
