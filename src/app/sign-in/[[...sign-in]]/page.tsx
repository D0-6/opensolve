import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: "8px",
            background: "linear-gradient(135deg, #818cf8, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Welcome back
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>
          Sign in to access your dashboard and submissions
        </p>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#6366f1",
            colorBackground: "#0d0d1a",
            colorText: "rgba(255,255,255,0.9)",
            colorTextSecondary: "rgba(255,255,255,0.5)",
            colorInputBackground: "rgba(255,255,255,0.05)",
            colorInputText: "rgba(255,255,255,0.9)",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
          elements: {
            card: {
              background: "#0d0d1a",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            },
            formButtonPrimary: {
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              fontWeight: 600,
            },
          },
        }}
      />
    </div>
  );
}
