"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { Lock, Mail, User, ArrowRight, Store } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "SELLER">("CUSTOMER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast({
        title: "Missing Fields",
        description: "Please fill in all registration inputs.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast({
        title: "Account Created!",
        description: `Welcome to ProVenture, ${name}!`,
        type: "success",
      });

      if (role === "SELLER") {
        router.push("/seller/register");
      } else {
        router.push("/customer");
      }
    }, 600);
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
            Create Your Account
          </h1>
          <p className="text-xs text-muted-foreground">
            Join thousands of shoppers and verified multi-vendor creators
          </p>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted border">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              role === "CUSTOMER"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Shopper / Customer
          </button>
          <button
            type="button"
            onClick={() => setRole("SELLER")}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              role === "SELLER"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Independent Merchant
          </button>
        </div>

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
            <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
