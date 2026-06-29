import { NextResponse } from 'next/server';
import { runIngestion } from '@/lib/scrapers/run-ingestion';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // Protect this route from public execution
  // Vercel Cron sends the CRON_SECRET as a Bearer token automatically
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Server misconfiguration: CRON_SECRET not set' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await runIngestion();
    return NextResponse.json(summary);
  } catch (error: unknown) {
    console.error("Ingestion CRON failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
