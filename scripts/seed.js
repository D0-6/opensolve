const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// NOTE: Since this is outside the Next.js build, we use raw require and standard AWS SDK.
// Run this via `node scripts/seed.js`

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "mock-key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "mock-secret",
  },
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
});

const docClient = DynamoDBDocumentClient.from(client);

const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const ORGS_TABLE = process.env.DYNAMODB_TABLE_ORGANIZATIONS || "OpenSolve_Organizations";

async function seed() {
  console.log("Seeding DynamoDB with mock data...");

  const orgId1 = "org-yc-ycombinator";
  const orgId2 = "org-gov-india";

  const orgs = [
    {
      orgId: orgId1,
      orgName: "Y Combinator",
      orgType: "YC_STARTUP",
      contactEmail: "contact@ycombinator.com",
      website: "https://ycombinator.com",
      verified: true,
      postedProblemIds: [],
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Y_Combinator_logo.svg",
      joinedAt: new Date().toISOString()
    },
    {
      orgId: orgId2,
      orgName: "Indian Gov Innovation Cell",
      orgType: "GOVERNMENT",
      contactEmail: "innovation@gov.in",
      website: "https://innovateindia.mygov.in/",
      verified: false,
      postedProblemIds: [],
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg",
      joinedAt: new Date().toISOString()
    }
  ];

  for (const org of orgs) {
    await docClient.send(new PutCommand({ TableName: ORGS_TABLE, Item: org }));
    console.log(`Created Org: ${org.orgName}`);
  }

  const problems = [
    {
      problemId: "prob-1-india-ai",
      title: "IndiaAI Innovation Challenge: AI for Agriculture",
      description: "Develop AI models to provide precise crop disease detection, yield estimation, and weather-based advisory for Indian farmers. The model must perform effectively on mobile devices and support local languages. We are funding pilot implementations.",
      source: "GOVERNMENT",
      sourceUrl: "https://innovateindia.mygov.in/indiaai-innovation-challenge/",
      prizeAmount: 100000, // example amount in USD equivalent
      prizeType: "PILOT_FUNDING",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      domain: "AI / Agriculture",
      postedAt: new Date().toISOString(),
      postedByOrgId: orgId2,
      verified: true,
      status: "OPEN"
    },
    {
      problemId: "prob-2-bioe3",
      title: "BioE3 Biomanufacturing Process Optimization",
      description: "We are seeking computational models or software solutions to optimize metabolic pathways in microbial fermentation for sustainable biomaterial production. Looking for high yield, reduced emissions, and scalable pathways.",
      source: "INDUSTRY",
      sourceUrl: "https://www.biomanufacturing.example.com",
      prizeAmount: 250000,
      prizeType: "CONTRACT",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      domain: "Biotech / SynBio",
      postedAt: new Date().toISOString(),
      postedByOrgId: orgId1,
      verified: false,
      status: "OPEN"
    }
  ];

  for (const prob of problems) {
    await docClient.send(new PutCommand({ TableName: PROBLEMS_TABLE, Item: prob }));
    console.log(`Created Problem: ${prob.title}`);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
