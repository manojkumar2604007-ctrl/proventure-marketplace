"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token || !email) {
        setLoading(false);
        setErrorMessage("Invalid or missing verification parameters.");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok && data.success) {
          setSuccess(true);
        } else {
          setErrorMessage(data.error || "Email verification failed.");
        }
      } catch (err: any) {
        setLoading(false);
        setErrorMessage(err.message || "Failed to verify email.");
      }
    }

    verify();
  }, [token, email]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            P
          </div>
          <span className="text-xl font-black text-foreground tracking-tight">
            PROVENTURE
          </span>
        </Link>

        <div className="p-8 rounded-3xl border bg-card shadow-sm space-y-4">
          {loading ? (
            <div className="py-8 space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Verifying your email token...</p>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-black text-foreground">Email Verified Successfully!</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Thank you for verifying <span className="font-semibold text-foreground">{email}</span>.
                Your account is now fully active with complete customer privileges.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/customer">
                  <Button size="lg" className="w-full text-xs font-bold rounded-xl gap-2">
                    <span>Go to Customer Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="sm" className="w-full text-xs rounded-xl">
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-black text-foreground">Verification Failed</h2>
              <p className="text-xs text-muted-foreground">{errorMessage}</p>
              <div className="pt-2">
                <Link href="/login">
                  <Button size="sm" className="w-full text-xs rounded-xl">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
