import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-display-lg font-bold mb-2 text-gradient-primary">
          Join OpenSolve
        </h1>
        <p className="text-[#8990a8] text-sm">
          Create an account to start building and hiring
        </p>
      </div>
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#00cbe6",
            colorBackground: "#0c1324",
            colorText: "#dce1fb",
            colorTextSecondary: "#8990a8",
            colorInputBackground: "#020617",
            colorInputText: "#dce1fb",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
          elements: {
            card: {
              background: "#0c1324",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            },
            formButtonPrimary: {
              background: "linear-gradient(135deg, #a078ff, #00cbe6)",
              fontWeight: 600,
              color: "#020617",
            },
          },
        }}
      />
    </div>
  );
}
