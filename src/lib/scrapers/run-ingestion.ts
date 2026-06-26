import { scrapeYCRFS } from "./yc-rfs";
import { scrapeUKInnovation } from "./uk-innovation";
import { scrapeSprind } from "./sprind";
import { docClient } from "@/lib/dynamodb";
import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export async function runIngestion() {
  console.log("Starting ingestion process...");
  
  const scrapers = [
    { name: "YC RFS", fn: scrapeYCRFS },
    { name: "UK Innovation", fn: scrapeUKInnovation },
    { name: "SPRIND", fn: scrapeSprind }
  ];

  let added = 0;
  let skipped = 0;
  let errors: string[] = [];

  for (const scraper of scrapers) {
    try {
      console.log(`Running scraper: ${scraper.name}`);
      const problems = await scraper.fn();
      
      console.log(`Scraper ${scraper.name} returned ${problems.length} items`);

      for (const p of problems) {
        // Check if exists
        // The user specified: "if checking by sourceUrl requires a Scan because there's no GSI for it, add a GSI: sourceUrl-index, PK: sourceUrl"
        // We will attempt to query the GSI `sourceUrl-index`. If the GSI is not created yet, it will throw an error,
        // but for local testing, we might fall back to a Scan or just log it. Let's strictly use the Query if possible.
        // Wait, since we can't reliably know if the GSI is created in a hackathon, we will try to Query, and if it fails, fallback to Scan.

        let exists = false;
        try {
          const queryResult = await docClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "sourceUrl-index",
            KeyConditionExpression: "sourceUrl = :url",
            ExpressionAttributeValues: { ":url": p.sourceUrl }
          }));
          
          if (queryResult.Items && queryResult.Items.some(item => item.title === p.title)) {
            exists = true;
          }
        } catch (e: unknown) {
          // If GSI does not exist, fallback to Scan
          console.warn(`Query on sourceUrl-index failed, falling back to Scan for ${p.sourceUrl}. Ensure GSI is created!`);
          const scanResult = await docClient.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "sourceUrl = :url and title = :title",
            ExpressionAttributeValues: {
              ":url": p.sourceUrl,
              ":title": p.title
            }
          }));
          if (scanResult.Items && scanResult.Items.length > 0) {
            exists = true;
          }
        }

        if (exists) {
          skipped++;
        } else {
          const problemId = uuidv4();
          await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              ...p,
              problemId,
              postedAt: new Date().toISOString(),
              postedByOrgId: "aggregated",
              verified: false,
              status: "OPEN"
            }
          }));
          added++;
        }
      }
    } catch (e: unknown) {
      console.error(`Failed to scrape ${scraper.name}:`, e);
      errors.push(`Error in ${scraper.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const summary = { added, skipped, errors };
  console.log("Ingestion complete:", summary);
  return summary;
}
