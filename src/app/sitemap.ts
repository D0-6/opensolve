import { MetadataRoute } from 'next';
import { docClient } from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://opensolve.talent";
  
  // Fetch problems for dynamic routing indexing
  const res = await docClient.send(new ScanCommand({
    TableName: process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems",
  }));
  
  const problems = res.Items || [];
  
  const problemUrls = problems.map((p) => ({
    url: `${baseUrl}/problems/${p.problemId}`,
    lastModified: new Date(p.postedAt || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/teams`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    ...problemUrls,
  ];
}
