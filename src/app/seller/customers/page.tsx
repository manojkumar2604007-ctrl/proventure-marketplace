"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Star,
  ExternalLink,
} from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  tier: "VIP" | "Repeat" | "New";
}

const MOCK_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust_1",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 91234 56789",
    city: "Bengaluru, KA",
    totalOrders: 4,
    totalSpent: 38996,
    lastOrderDate: "Today",
    tier: "VIP",
  },
  {
    id: "cust_2",
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    phone: "+91 98765 43210",
    city: "Mumbai, MH",
    totalOrders: 2,
    totalSpent: 18498,
    lastOrderDate: "3 days ago",
    tier: "Repeat",
  },
  {
    id: "cust_3",
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+91 98450 12345",
    city: "Chennai, TN",
    totalOrders: 1,
    totalSpent: 8999,
    lastOrderDate: "1 week ago",
    tier: "New",
  },
  {
    id: "cust_4",
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "+91 97110 54321",
    city: "Delhi, DL",
    totalOrders: 3,
    totalSpent: 26497,
    lastOrderDate: "2 weeks ago",
    tier: "Repeat",
  },
];

export default function SellerCustomersPage() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    if (tierFilter !== "ALL" && c.tier !== tierFilter) return false;
    if (
      search &&
      !c.name.toLowerCase().includes(search.toLowerCase()) &&
      !c.email.toLowerCase().includes(search.toLowerCase()) &&
      !c.city.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Customer Directory & Buyer Loyalty
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View buyers who have purchased items from your shop, their lifetime value, and order frequencies
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customers by name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/80 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="text-muted-foreground text-xs font-medium mr-1">Tier:</span>
          {["ALL", "VIP", "Repeat", "New"].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                tierFilter === tier
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Loyalty Tier</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4 text-right">Last Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">{c.name}</span>
                        <span className="text-[11px] text-muted-foreground">{c.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground">{c.city}</td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        c.tier === "VIP"
                          ? "success"
                          : c.tier === "Repeat"
                          ? "info"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {c.tier} Buyer
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {c.totalOrders} orders
                  </td>

                  <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                    {formatPrice(c.totalSpent)}
                  </td>

                  <td className="py-3.5 px-4 text-right text-muted-foreground font-mono">
                    {c.lastOrderDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
