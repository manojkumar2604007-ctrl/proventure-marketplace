"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { Lock, Mail, User, ArrowRight, Store, ShieldCheck, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ verificationUrl?: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!name || !email || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to register account.");
        addToast({
          title: "Registration Failed",
          description: data.error,
          type: "error",
        });
        return;
      }

      addToast({
        title: "Account Created!",
        description: "Welcome to ProVenture Marketplace.",
        type: "success",
      });

      // Auto sign in user with Auth.js
      await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (data.data?.verificationUrl) {
        setSuccessInfo({ verificationUrl: data.data.verificationUrl });
      } else {
        router.push("/customer");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "An unexpected error occurred.");
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
            Create Shopper Account
          </h1>
          <p className="text-xs text-muted-foreground">
            Join thousands of shoppers discovering curated verified merchants
          </p>
        </div>

        {/* Separate Merchant Banner */}
        <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-muted-foreground">Are you a merchant?</span>
          </div>
          <Link
            href="/seller/register"
            className="font-bold text-amber-600 hover:underline flex items-center gap-1"
          >
            Apply to Sell <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo ? (
          <div className="p-6 rounded-3xl border bg-card shadow-sm text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-base text-foreground">Welcome to ProVenture!</h3>
            <p className="text-xs text-muted-foreground">
              Your account has been created with customer privileges. Please verify your email to unlock all features.
            </p>
            {successInfo.verificationUrl && (
              <div className="pt-2">
                <Link href={successInfo.verificationUrl}>
                  <Button size="sm" className="w-full text-xs rounded-xl font-semibold">
                    Simulate Email Verification Link
                  </Button>
                </Link>
              </div>
            )}
            <div className="pt-1">
              <Link href="/customer">
                <Button variant="outline" size="sm" className="w-full text-xs rounded-xl">
                  Proceed to Customer Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="p-6 rounded-3xl border bg-card shadow-sm space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-xs h-9 pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Email Address *
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

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Password (6+ characters) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
              <span>{isSubmitting ? "Creating Account..." : "Create Customer Account"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
