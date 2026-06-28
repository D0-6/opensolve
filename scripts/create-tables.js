require("dotenv").config({ path: ".env.local" });
const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY}});

const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const ORGS_TABLE = process.env.DYNAMODB_TABLE_ORGANIZATIONS || "OpenSolve_Organizations";
const QATHREADS_TABLE = process.env.DYNAMODB_TABLE_QATHREADS || "OpenSolve_QAThreads";
const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";
const NOTIFICATIONS_TABLE = process.env.DYNAMODB_TABLE_NOTIFICATIONS || "OpenSolve_Notifications";
const APPLICATIONS_TABLE = process.env.DYNAMODB_TABLE_APPLICATIONS || "OpenSolve_Applications";
const TEAMS_TABLE = process.env.DYNAMODB_TABLE_TEAMS || "OpenSolve_Teams";
const MESSAGES_TABLE = process.env.DYNAMODB_TABLE_MESSAGES || "OpenSolve_Messages";

async function createTable(params) {
  try {
    const command = new CreateTableCommand(params);
    const result = await client.send(command);
    console.log(`✅ Table created successfully: ${params.TableName}`);
    return result;
  } catch (error) {
    if (error.name === "ResourceInUseException") {
      console.log(`⚠️  Table already exists: ${params.TableName}`);
    } else {
      console.error(`❌ Error creating table ${params.TableName}:`, error.message);
    }
  }
}

async function setupDynamoDB() {
  console.log("Setting up DynamoDB tables...");

  // 1. Problems Table
  await createTable({
    TableName: PROBLEMS_TABLE,
    KeySchema: [
      { AttributeName: "problemId", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "problemId", AttributeType: "S" },
      { AttributeName: "source", AttributeType: "S" },
      { AttributeName: "domain", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
      { AttributeName: "deadline", AttributeType: "S" },
      { AttributeName: "sourceUrl", AttributeType: "S" },
      { AttributeName: "entityType", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "source-deadline-index",
        KeySchema: [
          { AttributeName: "source", KeyType: "HASH" },
          { AttributeName: "deadline", KeyType: "RANGE" }
        ],
        Projection: { ProjectionType: "ALL" }},
      {
        IndexName: "domain-deadline-index",
        KeySchema: [
          { AttributeName: "domain", KeyType: "HASH" },
          { AttributeName: "deadline", KeyType: "RANGE" }
        ],
        Projection: { ProjectionType: "ALL" }},
      {
        IndexName: "status-deadline-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" },
          { AttributeName: "deadline", KeyType: "RANGE" }
        ],
        Projection: { ProjectionType: "ALL" }},
      {
        IndexName: "sourceUrl-index",
        KeySchema: [
          { AttributeName: "sourceUrl", KeyType: "HASH" }
        ],
        Projection: { ProjectionType: "ALL" }},
      {
        IndexName: "entityType-deadline-index",
        KeySchema: [
          { AttributeName: "entityType", KeyType: "HASH" },
          { AttributeName: "deadline", KeyType: "RANGE" }
        ],
        Projection: { ProjectionType: "ALL" }}
    ],
    BillingMode: "PAY_PER_REQUEST"});

  // 2. Submissions Table
  await createTable({
    TableName: SUBMISSIONS_TABLE,
    KeySchema: [
      { AttributeName: "problemId", KeyType: "HASH" },
      { AttributeName: "rankKey", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "problemId", AttributeType: "S" },
      { AttributeName: "rankKey", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "submittedAt", AttributeType: "S" },
      { AttributeName: "entityType", AttributeType: "S" },
      { AttributeName: "score", AttributeType: "N" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "userId-submittedAt-index",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "submittedAt", KeyType: "RANGE" }
        ],
        Projection: { ProjectionType: "ALL" }},
      {
        IndexName: "entityType-score-index",
        KeySchema: [
          { AttributeName: "entityType", KeyType: "HASH" },
          { AttributeName: "score", KeyType: "RANGE" }
        ],
        Projection: { ProjectionType: "ALL" }},
      {
        IndexName: "entityType-submittedAt-index",
        KeySchema: [
          { AttributeName: "entityType", KeyType: "HASH" },
          { AttributeName: "submittedAt", KeyType: "RANGE" }
        ],
        Projection: { ProjectionType: "ALL" }}
    ],
    BillingMode: "PAY_PER_REQUEST"});

  // 3. Organizations Table
  await createTable({
    TableName: ORGS_TABLE,
    KeySchema: [
      { AttributeName: "orgId", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "orgId", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST"});

  // 4. QA Threads Table
  await createTable({
    TableName: QATHREADS_TABLE,
    KeySchema: [
      { AttributeName: "problemId", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "problemId", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST"});

  // 5. Profiles Table
  await createTable({
    TableName: PROFILES_TABLE,
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST"});

  // 6. Notifications Table
  await createTable({
    TableName: NOTIFICATIONS_TABLE,
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "createdAt", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST"});

  // 7. Applications Table
  await createTable({
    TableName: APPLICATIONS_TABLE,
    KeySchema: [
      { AttributeName: "problemId", KeyType: "HASH" },
      { AttributeName: "userId", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "problemId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "userId-index",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" }
        ],
        Projection: { ProjectionType: "ALL" }}
    ],
    BillingMode: "PAY_PER_REQUEST"});

  // 8. Teams Table
  await createTable({
    TableName: TEAMS_TABLE,
    KeySchema: [
      { AttributeName: "teamId", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "teamId", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST"});

  // 9. Messages Table
  await createTable({
    TableName: MESSAGES_TABLE,
    KeySchema: [
      { AttributeName: "threadId", KeyType: "HASH" },
      { AttributeName: "createdAt", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "threadId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST"});

  console.log("\n✅ All table creation requests sent.");
}

setupDynamoDB();
