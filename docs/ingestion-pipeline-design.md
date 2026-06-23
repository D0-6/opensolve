# OpenSolve Ingestion Pipeline Design

## Overview
OpenSolve aggregates problems from multiple sources (YC Requests for Startups, Government Innovation Portals, Open Source Foundations). This document outlines the planned Phase 2 ingestion pipeline design.

## Architecture

1. **Scraper Workers (AWS Lambda + EventBridge)**
   - Scheduled Lambda functions scrape configured target domains daily.
   - Outputs raw HTML/JSON to an S3 bucket (Raw Data Lake).

2. **Parsing & Normalization (AWS Step Functions)**
   - Triggered by S3 PUT events.
   - Extracts `title`, `description`, `deadline`, and `prizeType`.
   - Uses an LLM (e.g., Claude 3 or Amazon Bedrock) to categorize the problem domain (e.g., "AI", "Biotech") and estimate urgency.
   - Normalizes data into a standard JSON schema.

3. **Data Verification & Enrichment**
   - Cross-references the posting organization.
   - If the organization exists in the `Organizations` DynamoDB table and is verified, the problem is marked with `verified: true`.
   - If the organization does not exist, a placeholder "unverified" organization is created.

4. **Database Insertion**
   - The final normalized JSON is inserted into the `OpenSolve_Problems` DynamoDB table.

## Data Schema Mapping

| Source Field | OpenSolve Field | Type |
|---|---|---|
| Parsed Title | `title` | String |
| Parsed Body | `description` | String |
| Origin URL | `sourceUrl` | String |
| Extracted Date | `deadline` | ISO Date String |

## Security & Rate Limiting
- Scrapers will respect `robots.txt` and use appropriate headers.
- DynamoDB insertions will be batch-processed to stay within provisioned write capacities.
