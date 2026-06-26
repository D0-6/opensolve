"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { UserCircle, Building2 } from "lucide-react";

export default function SignUpPage() {
  const [role, setRole] = useState<"student" | "organization" | null>(null);

  if (!role) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center py-10 px-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-medium tracking-tight mb-3 text-zinc-900">
            Join OpenSolve
          </h1>
          <p className="text-zinc-500 text-sm">
            Select how you'll be using the platform
          </p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => setRole("student")}
            className="w-full bg-white border border-zinc-200 hover:border-[#1a3a5c] p-6 text-left transition-colors flex items-start gap-4 group"
          >
            <div className="w-10 h-10 border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-600 group-hover:text-[#1a3a5c] group-hover:border-[#1a3a5c] transition-colors shrink-0">
              <UserCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-zinc-900 mb-1">I'm a Student / Builder</h2>
              <p className="text-sm text-zinc-500">I want to solve challenges, build my reputation, and get hired.</p>
            </div>
          </button>

          <button
            onClick={() => setRole("organization")}
            className="w-full bg-white border border-zinc-200 hover:border-[#1a3a5c] p-6 text-left transition-colors flex items-start gap-4 group"
          >
            <div className="w-10 h-10 border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-600 group-hover:text-[#1a3a5c] group-hover:border-[#1a3a5c] transition-colors shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-zinc-900 mb-1">I'm an Organization</h2>
              <p className="text-sm text-zinc-500">I want to post challenges and hire top vetted talent.</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center py-10 px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-medium tracking-tight mb-2 text-zinc-900">
          Create Account
        </h1>
        <p className="text-zinc-500 text-sm">
          Signing up as {role === "student" ? "a Builder" : "an Organization"}
        </p>
        <button 
          onClick={() => setRole(null)}
          className="text-xs text-zinc-400 hover:text-zinc-900 underline mt-4"
        >
          Change Role
        </button>
      </div>
      <SignUp
        fallbackRedirectUrl={`/onboarding/sync-role?role=${role}`}
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
