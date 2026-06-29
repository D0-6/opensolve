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
    // 1. Evaluate using deterministic repository stats via GitHub API
    console.log(`[Auto-Scoring] Fetching GitHub stats for ${githubUrl}...`);
    
    let repoScore = 0;
    try {
      const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, '');
        
        // Use a 3-second timeout for the fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: { 'User-Agent': 'OpenSolve-Evaluator' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (ghRes.ok) {
          const repoData = await ghRes.json();
          
          // Deterministic heuristics based on repository quality signals
          if (repoData.description) repoScore += 10;
          if (repoData.has_wiki) repoScore += 5;
          if (repoData.has_pages) repoScore += 5;
          if (repoData.stargazers_count > 0) repoScore += Math.min(20, repoData.stargazers_count * 5); // 5 points per star up to 20
          if (repoData.language) repoScore += 10; // Having a detected primary language
          
          const created = new Date(repoData.created_at).getTime();
          const pushed = new Date(repoData.pushed_at).getTime();
          const daysActive = (pushed - created) / (1000 * 60 * 60 * 24);
          
          // Reward sustained effort (commits over multiple days)
          if (daysActive > 7) repoScore += 15;
          else if (daysActive > 2) repoScore += 10;
          else repoScore += 5;
        }
      }
    } catch (e) {
      console.warn("[Auto-Scoring] Failed to fetch GitHub stats (timeout or invalid URL):", e);
    }

    // 2. Combine with writeup length and clamp to 0-100
    // A comprehensive writeup (e.g. 1500 chars) gives up to 35 points
    const writeupScore = Math.min(35, Math.floor(writeup.length / 42)); 
    const finalScore = Math.min(100, Math.floor(repoScore + writeupScore));
    
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

    const { TransactWriteCommand } = await import("@aws-sdk/lib-dynamodb");
    
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        {
          Delete: {
            TableName: TABLE_NAME,
            Key: { problemId, rankKey: oldRankKey }
          }
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: updatedItem
          }
        }
      ]
    }));
    
    console.log(`[Auto-Scoring] Successfully updated leaderboard score for ${userId}.`);

  } catch (err) {
    console.error("[Auto-Scoring] Pipeline failed:", err);
  }
}
