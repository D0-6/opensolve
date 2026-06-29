import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Only initialize DynamoDB client on the server side
let docClient: DynamoDBDocumentClient | null = null;

function initDynamoDBClient() {
  if (typeof window !== "undefined") {
    throw new Error("DynamoDB client can only be used on the server side");
  }

  if (docClient) {
    return docClient;
  }

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
    maxAttempts: 5, // Increased retries for high-load throttle spikes
    // By omitting the explicit `credentials` block, the AWS SDK v3 automatically
    // utilizes the Default Credential Provider Chain. This means it will securely use
    // IAM Roles (on AWS), OIDC, or securely injected environment variables (on Vercel),
    // which is an AWS Security Best Practice.
    ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
  });

  docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });

  return docClient;
}

export function getDocClient() {
  return initDynamoDBClient();
}
