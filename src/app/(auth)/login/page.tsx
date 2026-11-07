"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { Lock, Mail, ArrowRight, ShieldCheck, Store, User, AlertCircle } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const errorParam = searchParams.get("error");
  const { addToast } = useUIStore();

  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    errorParam === "AdminAccessDenied"
      ? "Access Denied: Administrator role required to enter the Admin Console."
      : errorParam === "AccountSuspended"
      ? "Your account has been suspended by administration."
      : ""
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      setIsSubmitting(false);

      if (res?.error) {
        setErrorMessage(res.error);
        addToast({
          title: "Sign In Failed",
          description: res.error,
          type: "error",
        });
        return;
      }

      addToast({
        title: "Signed In Successfully",
        description: `Welcome back, ${email}!`,
        type: "success",
      });

      // Role-based routing
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (email.includes("admin")) {
        router.push("/admin");
      } else if (email.includes("seller")) {
        router.push("/seller");
      } else {
        router.push("/customer");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  const handleQuickRole = (role: "customer" | "seller" | "admin") => {
    setErrorMessage("");
    if (role === "customer") {
      setEmail("customer@example.com");
      setPassword("password123");
    } else if (role === "seller") {
      setEmail("seller@technexus.com");
      setPassword("password123");
    } else {
      setEmail("admin@proventure.com");
      setPassword("password123");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
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
            Sign In to Your Account
          </h1>
          <p className="text-xs text-muted-foreground">
            Multi-portal secure authentication powered by Auth.js & Neon
          </p>
        </div>

        {/* Demo Fast Logins for instant evaluation */}
        <div className="p-4 rounded-2xl border bg-muted/40 space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block text-center">
            ⚡ Quick Demo Portal Switcher
          </span>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickRole("customer")}
              className="text-xs h-8 bg-background flex items-center gap-1"
            >
              <User className="h-3 w-3 text-primary" />
              <span>Customer</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickRole("seller")}
              className="text-xs h-8 bg-background flex items-center gap-1"
            >
              <Store className="h-3 w-3 text-amber-500" />
              <span>Seller</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickRole("admin")}
              className="text-xs h-8 bg-background flex items-center gap-1"
            >
              <ShieldCheck className="h-3 w-3 text-indigo-500" />
              <span>Admin</span>
            </Button>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 rounded-3xl border bg-card shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-xs h-9 pl-9"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-primary font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <span>{isSubmitting ? "Authenticating..." : "Sign In with Auth.js"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Create customer account
            </Link>{" "}
            or{" "}
            <Link href="/seller/register" className="text-amber-600 font-bold hover:underline">
              apply as merchant
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
