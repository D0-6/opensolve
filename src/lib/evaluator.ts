import { docClient } from "@/lib/dynamodb";
import { UpdateCommand, DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

function formatRankKey(score: number, submittedAt: string, userId: string) {
  const inverseScore = (1000000 - score).toString().padStart(7, "0");
  return `${inverseScore}#${submittedAt}#${userId}`;
}

export async function evaluateSubmissionAsynchronously({
  problemId,
  oldRankKey,
  userId,
  submittedAt,
  githubUrl,
  writeup
}: {
  problemId: string;
  oldRankKey: string;
  userId: string;
  submittedAt: string;
  githubUrl: string;
  writeup: string;
}) {
  try {
    // 1. Simulate pulling the repo and running test suites
    console.log(`[Auto-Scoring] Starting evaluation for ${githubUrl}...`);
    
    // Fake processing time
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 2. Generate a score based on mock heuristics (e.g. length of writeup + random factor)
    // In production, this would be an LLM API call (e.g., OpenAI/Anthropic) analyzing the codebase.
    const baseScore = Math.min(100, Math.floor(writeup.length / 5));
    const randomBonus = Math.floor(Math.random() * 50);
    const finalScore = Math.min(100, baseScore + randomBonus);
    
    console.log(`[Auto-Scoring] Evaluated ${githubUrl} -> Score: ${finalScore}`);

    // 3. Since DynamoDB sort keys (rankKey) cannot be updated directly,
    // we must delete the old submission record and insert a new one with the updated score/rankKey.
    // NOTE: In a real architecture, we might just store score as an attribute and use GSIs, 
    // but the current data model encodes score into the sort key for O(1) leaderboard sorting.
    
    const { GetCommand } = await import("@aws-sdk/lib-dynamodb");
    const getRes = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { problemId, rankKey: oldRankKey }
    }));
    
    if (!getRes.Item) {
      console.error(`[Auto-Scoring] Failed to find original submission record.`);
      return;
    }
    
    const newRankKey = formatRankKey(finalScore, submittedAt, userId);
    const updatedItem = {
      ...getRes.Item,
      score: finalScore,
      rankKey: newRankKey
    };

    // Transactionally swap them if possible, but for simplicity, delete then put
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { problemId, rankKey: oldRankKey }
    }));

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedItem
    }));
    
    console.log(`[Auto-Scoring] Successfully updated leaderboard score for ${userId}.`);

  } catch (err) {
    console.error("[Auto-Scoring] Pipeline failed:", err);
  }
}
