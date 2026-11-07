"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const { addToast } = useUIStore();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setIsSubmitting(false);
      setIsSubmitted(true);

      if (data.data?.resetUrl) {
        setResetUrl(data.data.resetUrl);
      }

      addToast({
        title: "Instructions Dispatched",
        description: "Password reset link generated.",
        type: "success",
      });
    } catch {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              P
            </div>
            <span className="text-xl font-black text-foreground tracking-tight">
              PROVENTURE
            </span>
          </Link>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-muted-foreground">
            Enter your email and we&apos;ll send you a secure password recovery link
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-6 rounded-3xl border bg-card shadow-sm text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <KeyRound className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-base text-foreground">Check Your Inbox</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If an account with <span className="font-semibold text-foreground">{email}</span> exists,
              we have issued a secure one-time password reset token valid for 60 minutes.
            </p>

            {resetUrl && (
              <div className="p-4 rounded-2xl bg-muted/40 border text-left space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  ⚡ Development Mode Helper
                </span>
                <p className="text-xs text-muted-foreground">
                  Click below to simulate following the email reset link:
                </p>
                <Link href={resetUrl}>
                  <Button size="sm" className="w-full text-xs rounded-xl font-semibold gap-1.5">
                    Open Password Reset Screen <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link href="/login" className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 rounded-3xl border bg-card shadow-sm space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-xs h-9 pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full rounded-xl text-xs font-bold gap-2 mt-2"
            >
              <span>{isSubmitting ? "Generating Link..." : "Send Reset Instructions"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <div className="pt-2 text-center">
              <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
