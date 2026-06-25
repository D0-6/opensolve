import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProblems, getSubmissions } from "@/lib/data";
import Link from "next/link";
import {
  PlusCircle,
  ExternalLink,
  Users,
  Trophy,
  BarChart3,
  Building2,
  ArrowRight,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompanyDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  if (role && role !== "company") redirect("/dashboard/student");

  const orgName = user?.firstName ? `${user.firstName}'s Org` : "Your Organization";

  // Fetch all problems and filter by this user's org
  const allProblems = await getProblems();
  const myProblems = allProblems.filter((p: any) => p.postedByOrgId === userId);

  // Fetch submissions for all my problems
  const submissionsByProblem: Record<string, any[]> = {};
  let totalSubmissions = 0;
  for (const p of myProblems) {
    const subs = await getSubmissions(p.problemId);
    submissionsByProblem[p.problemId] = subs;
    totalSubmissions += subs.length;
  }

  return (
    <div style={{ paddingTop: "40px" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(var(--accent-2-rgb),0.12), rgba(var(--accent-rgb),0.08))",
          border: "1px solid rgba(var(--accent-2-rgb),0.2)",
          borderRadius: "24px",
          padding: "40px",
          marginBottom: "32px",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          alignItems: "center",
          justifyContent: "space-between",
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
            background: "radial-gradient(circle, rgba(var(--accent-2-rgb),0.15) 0%, transparent 70%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(var(--accent-2-rgb),0.15)",
              border: "1px solid rgba(var(--accent-2-rgb),0.3)",
              borderRadius: "100px",
              padding: "4px 12px",
              width: "fit-content",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--accent-2)",
              marginBottom: "16px",
            }}
          >
            <Building2 size={12} /> Company Dashboard
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "8px" }}>
            {orgName}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            Manage your challenges and discover top talent.
          </p>
        </div>

        <Link
          href="/organizations/new"
          className="btn-primary"
          style={{ padding: "14px 28px", borderRadius: "14px", position: "relative", zIndex: 1 }}
        >
          <PlusCircle size={18} />
          Post a Challenge
        </Link>
      </div>

      {/* Metric cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {[
          { icon: <Zap size={20} />, label: "Active Challenges", value: myProblems.length, color: "var(--accent)" },
          { icon: <Users size={20} />, label: "Total Submissions", value: totalSubmissions, color: "var(--accent-2)" },
          { icon: <Trophy size={20} />, label: "Top Solvers", value: totalSubmissions > 0 ? "View →" : "—", color: "#facc15" },
          { icon: <BarChart3 size={20} />, label: "Avg. Submissions", value: myProblems.length > 0 ? Math.round(totalSubmissions / myProblems.length) : 0, color: "var(--accent-3)" },
        ].map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="glass"
            style={{ borderRadius: "16px", padding: "20px" }}
          >
            <div style={{ color, marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "4px" }}>{value}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Posted Challenges */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Your Challenges</h2>
          <Link
            href="/organizations/new"
            style={{ fontSize: "0.875rem", color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
          >
            Post New <ArrowRight size={14} />
          </Link>
        </div>

        {myProblems.length === 0 ? (
          <div
            className="glass"
            style={{ borderRadius: "16px", padding: "60px", textAlign: "center" }}
          >
            <Building2 size={40} style={{ margin: "0 auto 16px", opacity: 0.3, color: "var(--text-muted)" }} />
            <p style={{ fontWeight: 700, marginBottom: "8px", fontSize: "1.125rem" }}>No challenges posted yet</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "24px" }}>
              Post your first challenge and start finding top builders
            </p>
            <Link
              href="/organizations/new"
              className="btn-primary"
              style={{ padding: "12px 28px", borderRadius: "12px", display: "inline-flex" }}
            >
              <PlusCircle size={16} /> Post First Challenge
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {myProblems.map((problem: any) => {
              const subs = submissionsByProblem[problem.problemId] || [];
              const topSub = subs.sort((a: any, b: any) => b.score - a.score)[0];
              return (
                <div
                  key={problem.problemId}
                  className="glass"
                  style={{
                    borderRadius: "20px",
                    padding: "24px",
                    borderLeft: "3px solid var(--accent)",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "6px" }}>{problem.title}</h3>
                      <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        Deadline: {new Date(problem.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ background: "rgba(var(--accent-rgb),0.12)", border: "1px solid rgba(var(--accent-rgb),0.2)", borderRadius: "10px", padding: "6px 14px", fontSize: "0.8125rem", color: "var(--accent)", fontWeight: 600 }}>
                        {subs.length} Submission{subs.length !== 1 ? "s" : ""}
                      </div>
                      <Link
                        href={`/problems/${problem.problemId}`}
                        style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8125rem", color: "var(--text-muted)", textDecoration: "none" }}
                      >
                        <ExternalLink size={14} /> View Public
                      </Link>
                    </div>
                  </div>

                  {/* Top submission preview */}
                  {topSub && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "14px 16px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          🥇 Top Submission
                        </div>
                        <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{topSub.studentName || "Anonymous"}</div>
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.2)", borderRadius: "8px", padding: "4px 10px", fontSize: "0.8125rem", color: "#facc15", fontWeight: 700 }}>
                          Score: {topSub.score}
                        </span>
                        <a
                          href={`mailto:${topSub.userId}@placeholder.com?subject=Your solution to: ${problem.title}`}
                          className="btn-primary"
                          style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.8125rem" }}
                        >
                          Contact
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
