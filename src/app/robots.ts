import { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', 
        '/onboarding/', 
        '/organizations/dashboard/',
        '/problems/*/submit'
      ],
    },
    sitemap: 'https://opensolve.talent/sitemap.xml',
  };
}
