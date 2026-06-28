/**
 * cleanup-demo-data.ts
 * 
 * Utility script to:
 * 1. List all items in OpenSolve_Problems
 * 2. Allow you to delete specific items by problemId (or all demo data)
 * 
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/cleanup-demo-data.ts --list
 *   npx ts-node -r tsconfig-paths/register scripts/cleanup-demo-data.ts --delete <problemId>
 *   npx ts-node -r tsconfig-paths/register scripts/cleanup-demo-data.ts --delete-demos  (deletes items where verified=false AND source=DEMO)
 * 
 * Make sure AWS credentials are set in .env.local or as environment variables.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

async function listAllProblems() {
  console.log(`\n📋 Scanning all items in: ${TABLE_NAME}\n`);
  
  const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  const items = result.Items || [];
  
  console.log(`Found ${items.length} items:\n`);
  items.forEach((item, i) => {
    const isMeta = item.problemId === "GLOBAL_METADATA";
    console.log(`${i + 1}. [${isMeta ? "🔒 META" : "📌 PROBLEM"}] ${item.problemId}`);
    if (!isMeta) {
      console.log(`   Title: ${item.title || "NO TITLE"}`);
      console.log(`   Source: ${item.source || "UNKNOWN"} | Status: ${item.status || "UNKNOWN"} | Verified: ${item.verified}`);
      console.log(`   Posted by OrgId: ${item.postedByOrgId || "N/A"}`);
    }
    console.log("");
  });
  
  return items;
}

async function deleteItem(problemId: string) {
  if (problemId === "GLOBAL_METADATA") {
    console.error("❌ Cannot delete GLOBAL_METADATA — this is the atomic counter. Use AWS Console if you need to reset it.");
    process.exit(1);
  }
  
  console.log(`🗑️  Deleting: ${problemId}`);
  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { problemId },
  }));
  console.log(`✅ Deleted: ${problemId}`);
}

async function deleteDemos() {
  console.log("\n🔍 Scanning for demo/seed data (source=DEMO or title contains [DEMO])...\n");
  const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  const items = result.Items || [];
  
  const demos = items.filter(item =>
    item.problemId !== "GLOBAL_METADATA" &&
    (
      item.source === "DEMO" ||
      (item.title && String(item.title).toLowerCase().includes("[demo]")) ||
      (item.title && String(item.title).toLowerCase().includes("[test]")) ||
      (item.title && String(item.title).toLowerCase().includes("[seed]")) ||
      // Remove example problems that are clearly fake
      (item.postedByOrgId === "SEED_ORG" || item.postedByOrgId === "example-org")
    )
  );
  
  if (demos.length === 0) {
    console.log("✅ No demo data found.");
    return;
  }
  
  console.log(`Found ${demos.length} demo items to delete:`);
  demos.forEach(d => console.log(`  - ${d.problemId}: "${d.title}"`));
  console.log("\nDeleting...");
  
  for (const item of demos) {
    await deleteItem(item.problemId);
  }
  
  console.log(`\n✅ Cleaned up ${demos.length} demo items.`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes("--list")) {
    await listAllProblems();
  } else if (args.includes("--delete")) {
    const idx = args.indexOf("--delete");
    const id = args[idx + 1];
    if (!id) {
      console.error("❌ Please provide a problemId: --delete <problemId>");
      process.exit(1);
    }
    await deleteItem(id);
  } else if (args.includes("--delete-demos")) {
    await deleteDemos();
  } else {
    console.log(`
OpenSolve DynamoDB Cleanup Script
====================================
Usage:
  npx ts-node scripts/cleanup-demo-data.ts --list               List all items
  npx ts-node scripts/cleanup-demo-data.ts --delete <id>        Delete a specific problem
  npx ts-node scripts/cleanup-demo-data.ts --delete-demos       Delete all demo/seed data

Make sure your AWS credentials are configured in .env.local or as environment variables:
  AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, DYNAMODB_TABLE_PROBLEMS
    `);
  }
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
