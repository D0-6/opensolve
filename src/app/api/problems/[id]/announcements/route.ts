import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

/**
 * POST /api/problems/[id]/announcements
 * Org-only: post an update/announcement to a challenge.
 * Announcements are stored in the problem item as `announcements: Announcement[]`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: problemId } = await params;
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const orgId = user?.publicMetadata?.orgId as string | undefined;

  if (!user || (role !== "organization" && role !== "company")) {
    return NextResponse.json({ error: "Organization account required" }, { status: 401 });
  }

  // Verify the org owns this problem
  const problemRes = await docClient.send(new GetCommand({
    TableName: PROBLEMS_TABLE,
    Key: { problemId },
  }));

  if (!problemRes.Item) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const owns = problemRes.Item.postedByOrgId === orgId || problemRes.Item.postedByOrgId === user.id;
  if (!owns) {
    return NextResponse.json({ error: "You do not own this challenge" }, { status: 403 });
  }

  const body = await request.json();
  const { title, content } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const announcement = {
    id: uuidv4(),
    title: title.trim().slice(0, 200),
    content: content.trim().slice(0, 2000),
    postedAt: new Date().toISOString(),
  };

  // Append to announcements list on the problem item
  await docClient.send(new UpdateCommand({
    TableName: PROBLEMS_TABLE,
    Key: { problemId },
    UpdateExpression: "SET announcements = list_append(if_not_exists(announcements, :emptyList), :newAnnouncement)",
    ExpressionAttributeValues: {
      ":emptyList": [],
      ":newAnnouncement": [announcement],
    },
  }));

  return NextResponse.json({ announcement }, { status: 201 });
}

/**
 * GET /api/problems/[id]/announcements
 * Public: fetch announcements for a challenge.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: problemId } = await params;

  const problemRes = await docClient.send(new GetCommand({
    TableName: PROBLEMS_TABLE,
    Key: { problemId },
  }));

  if (!problemRes.Item) {
    return NextResponse.json({ announcements: [] });
  }

  const announcements = Array.isArray(problemRes.Item.announcements)
    ? problemRes.Item.announcements.sort(
        (a: any, b: any) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      )
    : [];

  return NextResponse.json({ announcements });
}
