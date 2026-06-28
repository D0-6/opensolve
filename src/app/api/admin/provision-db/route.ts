import { NextResponse } from "next/server";
import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const TABLES = [
  {
    TableName: process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions",
    KeySchema: [
      { AttributeName: "problemId", KeyType: "HASH" },
      { AttributeName: "rankKey", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "problemId", AttributeType: "S" },
      { AttributeName: "rankKey", AttributeType: "S" }
    ]
  },
  {
    TableName: process.env.DYNAMODB_TABLE_APPLICATIONS || "OpenSolve_Applications",
    KeySchema: [
      { AttributeName: "problemId", KeyType: "HASH" },
      { AttributeName: "userId", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "problemId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" }
    ]
  },
  {
    TableName: process.env.DYNAMODB_TABLE_NOTIFICATIONS || "OpenSolve_Notifications",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "createdAt", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" }
    ]
  },
  {
    TableName: process.env.DYNAMODB_TABLE_TEAMS || "OpenSolve_Teams",
    KeySchema: [
      { AttributeName: "teamId", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "teamId", AttributeType: "S" }
    ]
  },
  {
    TableName: process.env.DYNAMODB_TABLE_MESSAGES || "OpenSolve_Messages",
    KeySchema: [
      { AttributeName: "threadId", KeyType: "HASH" },
      { AttributeName: "createdAt", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "threadId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" }
    ]
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== (process.env.ADMIN_SETUP_SECRET || "super-secret-admin-key")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = [];
  
  for (const table of TABLES) {
    try {
      await client.send(new CreateTableCommand({
        ...table,
        BillingMode: "PROVISIONED",
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
      }));
      results.push({ table: table.TableName, status: "Created" });
    } catch (err: any) {
      if (err.name === "ResourceInUseException") {
        results.push({ table: table.TableName, status: "Already Exists" });
      } else {
        results.push({ table: table.TableName, status: "Error", error: err.message });
      }
    }
  }

  return NextResponse.json({ success: true, results });
}
