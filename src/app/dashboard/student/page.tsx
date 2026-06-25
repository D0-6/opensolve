import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import Link from "next/link";
import {
  Trophy,
  GitBranch,
  Search,
  ArrowRight,
  Flame,
  Star,
  Zap,
} from "lucide-react";

const SUBMISSIONS_TABLE =
  process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  if (role && role !== "student") redirect("/dashboard/company");

  // Fetch this user's submissions
  let submissions: any[] = [];
  try {
    const res = await docClient.send(
      new QueryCommand({
        TableName: SUBMISSIONS_TABLE,
        IndexName: "userId-submittedAt-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        ScanIndexForward: false,
        Limit: 10,
      })
    );
    submissions = res.Items || [];
  } catch (err) {
    console.error("Error fetching student submissions:", err);
  }

  const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const firstName = user?.firstName || "Builder";

  return (
    <div style={{ paddingTop: "40px" }}>
      {/* Welcome header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "24px",
          padding: "40px",
          marginBottom: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "200px",
            height: "200px",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "100px",
            padding: "4px 12px",
            width: "fit-content",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#818cf8",
          }}
        >
          <Zap size={12} /> Student Dashboard
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, lineHeight: 1.2 }}>
          Welcome back, {firstName} 👋
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem" }}>
          Keep building. Every submission moves you closer to your next opportunity.
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "8px" }}>
          {[
            { icon: <Trophy size={16} />, label: "Total Score", value: totalScore, color: "#facc15" },
            { icon: <GitBranch size={16} />, label: "Submissions", value: submissions.length, color: "#818cf8" },
            { icon: <Flame size={16} />, label: "Rank", value: submissions.length > 0 ? "Active" : "—", color: "#fb923c" },
          ].map(({ icon, label, value, color }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                padding: "16px 20px",
                minWidth: "120px",
              }}
            >
              <div style={{ color, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "0.8125rem" }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        <Link
          href="/"
          className="glass card-hover"
          style={{
            borderRadius: "16px",
            padding: "24px",
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Search size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: "4px" }}>Browse Challenges</div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)" }}>Find your next problem to solve</div>
          </div>
          <ArrowRight size={16} style={{ color: "rgba(255,255,255,0.3)", marginTop: "auto" }} />
        </Link>

        <Link
          href={`/profile/${userId}`}
          className="glass card-hover"
          style={{
            borderRadius: "16px",
            padding: "24px",
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(139,92,246,0.15)", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Star size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: "4px" }}>My Public Profile</div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)" }}>View how companies see you</div>
          </div>
          <ArrowRight size={16} style={{ color: "rgba(255,255,255,0.3)", marginTop: "auto" }} />
        </Link>
      </div>

      {/* Recent submissions */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "16px" }}>
          Recent Submissions
        </h2>
        {submissions.length === 0 ? (
          <div
            className="glass"
            style={{
              borderRadius: "16px",
              padding: "48px",
              textAlign: "center",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            <Trophy size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontWeight: 600, marginBottom: "8px" }}>No submissions yet</p>
            <p style={{ fontSize: "0.875rem" }}>Start solving problems to build your portfolio</p>
            <Link
              href="/"
              className="btn-primary"
              style={{ marginTop: "20px", padding: "10px 24px", borderRadius: "10px", display: "inline-flex" }}
            >
              Browse Problems
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {submissions.map((sub) => (
              <div
                key={`${sub.problemId}-${sub.submittedAt}`}
                className="glass"
                style={{
                  borderRadius: "16px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <Link
                    href={`/problems/${sub.problemId}`}
                    style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)", textDecoration: "none", fontSize: "0.9375rem" }}
                  >
                    View Problem →
                  </Link>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>
                    {new Date(sub.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      borderRadius: "10px",
                      padding: "8px 16px",
                      fontWeight: 700,
                      color: "#818cf8",
                    }}
                  >
                    Score: {sub.score ?? "—"}
                  </div>
                  {sub.githubUrl && (
                    <a
                      href={sub.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.5)",
                        transition: "all 0.2s",
                      }}
                    >
                      <GitBranch size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
