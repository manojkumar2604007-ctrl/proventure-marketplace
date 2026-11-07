"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { Lock, Mail, ArrowRight, ShieldCheck, Store, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      addToast({
        title: "Signed In Successfully",
        description: `Welcome back! Signed in as ${email}.`,
        type: "success",
      });

      if (email.includes("admin")) {
        router.push("/admin");
      } else if (email.includes("seller")) {
        router.push("/seller");
      } else {
        router.push("/customer");
      }
    }, 600);
  };

  const handleQuickRole = (role: "customer" | "seller" | "admin") => {
    if (role === "customer") {
      setEmail("customer@example.com");
      setPassword("password123");
      router.push("/customer");
    } else if (role === "seller") {
      setEmail("seller@technexus.com");
      setPassword("password123");
      router.push("/seller");
    } else {
      setEmail("admin@proventure.com");
      setPassword("password123");
      router.push("/admin");
    }

    addToast({
      title: `Switched to ${role.toUpperCase()} Persona`,
      description: `Logged in to ${role} portal.`,
      type: "success",
    });
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
            Access your customer orders, vendor dashboard, or platform administration
          </p>
        </div>

        {/* Demo Fast Logins for instant evaluation */}
        <div className="p-4 rounded-2xl border bg-muted/40 space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block text-center">
            ⚡ Quick Demo Portal Access
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
              <Link href="#" className="text-[11px] text-primary hover:underline">
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
            <span>{isSubmitting ? "Authenticating..." : "Sign In"}</span>
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
