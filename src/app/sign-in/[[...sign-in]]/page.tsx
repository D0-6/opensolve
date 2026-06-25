import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-display-lg font-bold mb-2 text-white">
          Welcome back
        </h1>
        <p className="text-zinc-400 text-sm">
          Sign in to access your dashboard and submissions
        </p>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#0a0a0a",
            colorText: "#ffffff",
            colorTextSecondary: "#a1a1aa",
            colorInputBackground: "#000000",
            colorInputText: "#ffffff",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
          elements: {
            card: {
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            },
            formButtonPrimary: {
              background: "#ffffff",
              fontWeight: 600,
              color: "#000000",
            },
          },
        }}
      />
    </div>
  );
}
