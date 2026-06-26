import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center py-10 px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-medium tracking-tight mb-2 text-zinc-900">
          Welcome back
        </h1>
        <p className="text-zinc-500 text-sm">
          Sign in to access your dashboard and submissions
        </p>
      </div>
      <SignIn
        fallbackRedirectUrl="/onboarding/routing"
        appearance={{
          variables: {
            colorPrimary: "#1a3a5c",
            colorBackground: "#ffffff",
            colorText: "#18181b",
            colorTextSecondary: "#71717a",
            colorInputBackground: "#ffffff",
            colorInputText: "#18181b",
            borderRadius: "4px",
            fontFamily: "Inter, sans-serif",
          },
          elements: {
            card: {
              background: "#ffffff",
              border: "1px solid #e4e4e7",
              boxShadow: "none",
            },
            formButtonPrimary: {
              background: "#1a3a5c",
              fontWeight: 500,
              color: "#ffffff",
            },
          },
        }}
      />
    </div>
  );
}
