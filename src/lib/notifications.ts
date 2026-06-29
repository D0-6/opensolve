import { getDocClient } from "@/lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const TABLE = process.env.DYNAMODB_TABLE_NOTIFICATIONS || "OpenSolve_Notifications";

export async function createNotification({
  targetUserId,
  type,
  title,
  message,
  problemId,
  threadId
}: {
  targetUserId: string;
  type: string;
  title: string;
  message: string;
  problemId?: string | null;
  threadId?: string | null;
}) {
  const notificationId = uuidv4();
  const now = new Date().toISOString();

  const item = {
    userId: targetUserId,
    createdAt: `${now}#${notificationId}`,
    notificationId,
    type,
    title,
    message,
    problemId: problemId || null,
    threadId: threadId || null,
    read: false,
  };

  await getDocClient().send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}
