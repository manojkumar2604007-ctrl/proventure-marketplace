"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useUIStore();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      addToast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubscribed(true);
      addToast({
        title: "Welcome to ProVenture VIP",
        description: "You've successfully subscribed to curated drops and exclusive seller discounts.",
        type: "success",
      });
      setEmail("");
    }, 600);
  };

  return (
    <section className="py-16 bg-surface/60 border-t border-border/80">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A192F] via-slate-900 to-[#1D4ED8] p-8 sm:p-14 text-white shadow-modal">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md text-emerald-400 border border-white/10">
              <Sparkles className="h-3.5 w-3.5" /> Curated Marketplace Dispatch
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Get weekly insider access to artisan drops & flash sales.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              Join 45,000+ conscious consumers. Receive hand-selected product highlights, exclusive vendor stories, and early access coupon codes straight to your inbox.
            </p>

            {isSubscribed ? (
              <div className="pt-4 flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>You are subscribed to ProVenture Insider drops!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="pt-4 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/20 bg-white/10 text-sm text-white placeholder:text-slate-400 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  size="default"
                  variant="accent"
                  isLoading={loading}
                  className="h-11 rounded-xl px-6 font-bold shadow-md"
                >
                  Subscribe <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </form>
            )}

            <p className="text-[11px] text-slate-400 pt-2">
              Zero spam. Unsubscribe anytime with a single click. Protected by ProVenture Privacy Policy.
            </p>
          </div>

          {/* Decorative mesh background pattern */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none" />
          <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
