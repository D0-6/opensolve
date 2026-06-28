import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  // By omitting the explicit `credentials` block, the AWS SDK v3 automatically
  // utilizes the Default Credential Provider Chain. This means it will securely use
  // IAM Roles (on AWS), OIDC, or securely injected environment variables (on Vercel),
  // which is an AWS Security Best Practice.
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
