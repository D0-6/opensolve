# OpenSolve

A platform aggregating real funded problems (YC Requests for Startups, Indian government innovation challenges, industry-posted problems). Students submit public, verifiable solutions. Organizations view ranked submissions, see student profiles, and contact top performers.

Built as an Open Innovation Platform prototype.

## Tech Stack
- Next.js 14 (App Router)
- React, Tailwind CSS, Framer Motion
- AWS DynamoDB (AWS SDK v3)
- TypeScript

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (`.env.local`):
   ```env
   # AWS Credentials for DynamoDB
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret

   # Table Names (Optional, defaults exist)
   DYNAMODB_TABLE_PROBLEMS=OpenSolve_Problems
   DYNAMODB_TABLE_SUBMISSIONS=OpenSolve_Submissions
   DYNAMODB_TABLE_ORGANIZATIONS=OpenSolve_Organizations
   DYNAMODB_TABLE_QATHREADS=OpenSolve_QAThreads
   DYNAMODB_TABLE_PROFILES=OpenSolve_Profiles
   ```

3. Run the application:
   ```bash
   npm run dev
   ```

4. Seed the database with mock data (if running a local DynamoDB instance or wanting to populate a dev table):
   ```bash
   node scripts/seed.js
   ```

## MVP Simplifications
- **Auth**: Uses a mocked "Magic Link" claim system. In production, this would use NextAuth or Clerk.
- **Database**: Schemas are simplified single-table-design concepts mapped across multiple tables for prototyping velocity.
- **Rate Limiting**: Currently uses an in-memory JS map. Production would use Redis.
- **Ingestion Pipeline**: Currently simulated via `scripts/seed.js`. See `docs/ingestion-pipeline-design.md` for the full architecture.

## Automated Ingestion
OpenSolve includes an automated problem-ingestion scraper pipeline designed to run as a background Vercel Cron Job. 

- **Schedule**: Runs daily at midnight (`0 0 * * *`). This complies with Vercel's Hobby tier limits and avoids aggressively hitting source sites.
- **Scrapers**: 
  - YC Requests for Startups
  - UK Innovation Funding
  - SPRIND
- **Deduplication**: The scraper uses a `sourceUrl-index` Global Secondary Index in DynamoDB to check if a problem has already been ingested, preventing duplicates.
- **Verification**: Ingested problems are explicitly marked as `verified: false` and attributed to an `aggregated` system user. Organizations can claim their listings to add the verified badge.
- **Security**: The ingestion endpoint (`/api/cron/ingest`) is protected via the `CRON_SECRET` environment variable, which Vercel Cron Jobs securely pass as a Bearer token.
- **Limitations**: HTML scraping is inherently fragile. If the source sites update their layout significantly, the cheerio parsers will gracefully log an error and skip ingestion rather than crashing. A more robust production version would utilize official APIs when available.
