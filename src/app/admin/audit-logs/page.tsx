"use client";

import React, { useState, useEffect } from "react";
import { adminService, AdminAuditLog } from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Terminal,
  RefreshCw,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await adminService.getAuditLogs();
    setLogs([...data]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    if (actionFilter !== "ALL" && !log.action.includes(actionFilter)) return false;
    if (
      search &&
      !log.adminName.toLowerCase().includes(search.toLowerCase()) &&
      !log.details.toLowerCase().includes(search.toLowerCase()) &&
      !log.entityType.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Security & Administrative Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of elevated actions, merchant approvals, user suspensions, and policy interventions
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Audit Ledger</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit details, admin operator, or target entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="text-slate-400 text-xs font-medium mr-1">Action:</span>
          {["ALL", "VENDOR", "USER", "PRODUCT", "COMMISSION", "DISPUTE"].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                actionFilter === act
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Administrative Action</th>
                <th className="py-3.5 px-4">Admin Operator</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Action Rationale & Details</th>
                <th className="py-3.5 px-4">Operator Origin IP</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        log.action.includes("APPROVED") || log.action.includes("ACTIVATED")
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : log.action.includes("SUSPENDED") || log.action.includes("REMOVED")
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "bg-blue-950 text-blue-400 border border-blue-800"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-white">
                    {log.adminName}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-300 block">{log.entityType}</span>
                    <span className="text-[10px] font-mono text-slate-500">{log.entityId}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 max-w-sm sm:max-w-md leading-relaxed">
                    {log.details}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {log.ipAddress}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
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
