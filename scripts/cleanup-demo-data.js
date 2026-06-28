require('dotenv').config({ path: '.env.local' });
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || 'OpenSolve_Problems';

async function cleanup() {
  console.log(`Scanning table ${TABLE_NAME} for demo problems...`);
  
  const res = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME
  }));

  const items = res.Items || [];
  
  // Define gibberish/test titles you want to delete
  const problemsToDelete = items.filter(p => {
    const title = (p.title || "").toLowerCase();
    return title.includes("ewjebnkje") || 
           title.includes("test") || 
           title.includes("demo") ||
           title === "string" ||
           p.problemId === "49804111-6c8b-435a-8de3-07077780e392"; 
  });

  if (problemsToDelete.length === 0) {
    console.log("✅ No demo problems found to delete!");
    return;
  }

  console.log(`Found ${problemsToDelete.length} demo problems. Deleting...`);

  for (const p of problemsToDelete) {
    console.log(`Deleting: [${p.problemId}] ${p.title}`);
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { problemId: p.problemId }
    }));
  }

  console.log("✅ Cleanup complete!");
}

cleanup().catch(console.error);
