"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { adminService, AdminUserRecord } from "@/services/admin.service";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/store/ui-store";
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  ExternalLink,
  Mail,
  Phone,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

export default function AdminUsersPage() {
  const { addToast } = useUIStore();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await adminService.getUsers();
      setUsers(res);
      setLoading(false);
    }
    load();
  }, []);

  const handleToggleStatus = async (user: AdminUserRecord) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const updated = await adminService.updateUserStatus(user.id, nextStatus);

    if (updated) {
      setUsers(users.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, status: nextStatus });
      }

      addToast({
        title: nextStatus === "SUSPENDED" ? "User Suspended" : "User Reactivated",
        description: `Account access for ${user.email} is now ${nextStatus.toLowerCase()}.`,
        type: nextStatus === "SUSPENDED" ? "error" : "success",
      });
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
    if (
      search &&
      !u.name?.toLowerCase().includes(search.toLowerCase()) &&
      !u.email.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Platform-wide identity registry across Buyers, Merchants, and Administrators
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by full name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 text-xs font-medium mr-1">Role:</span>
          {["ALL", "CUSTOMER", "SELLER", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}

          <span className="text-slate-400 text-xs font-medium ml-2 mr-1">Status:</span>
          {["ALL", "ACTIVE", "SUSPENDED"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">User Identity</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Order Metrics</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden relative">
                        {user.image ? (
                          <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                        ) : (
                          (user.name || "U")[0]
                        )}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <span className="font-bold text-white block truncate">{user.name || "Unverified User"}</span>
                        <span className="text-[11px] text-slate-400 truncate block">{user.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        user.role === "ADMIN"
                          ? "default"
                          : user.role === "SELLER"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {user.role}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={user.status === "ACTIVE" ? "success" : "destructive"}
                      className="text-[10px]"
                    >
                      {user.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                    {user.totalOrders || 0} orders
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {formatPrice(user.totalSpent || 0)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="text-xs h-7 text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        Inspect
                      </Button>

                      {user.role !== "ADMIN" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          className={`text-xs h-7 px-2 font-bold ${
                            user.status === "ACTIVE"
                              ? "text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                              : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40"
                          }`}
                        >
                          {user.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} users
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono font-bold text-white px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title="User Account Telemetry"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden relative">
              {selectedUser?.image ? (
                <Image src={selectedUser.image} alt={selectedUser.name || "User"} fill className="object-cover" />
              ) : (
                (selectedUser?.name || "U")[0]
              )}
            </div>
            <div>
              <p className="font-bold text-white text-sm">{selectedUser?.name}</p>
              <p className="text-xs text-slate-400">{selectedUser?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" className="text-[10px]">{selectedUser?.role}</Badge>
                <Badge variant={selectedUser?.status === "ACTIVE" ? "success" : "destructive"} className="text-[10px]">
                  {selectedUser?.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Total Orders Placed:</span>
              <span className="font-mono font-bold text-white text-base">
                {selectedUser?.totalOrders || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Lifetime GMV Contributed:</span>
              <span className="font-mono font-bold text-emerald-400 text-base">
                {formatPrice(selectedUser?.totalSpent || 0)}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="flex justify-between">
              <span>Contact Phone:</span>
              <strong className="text-white">{selectedUser?.phone || "Not provided"}</strong>
            </p>
            <p className="flex justify-between">
              <span>Account Registered:</span>
              <strong className="text-white">{selectedUser?.createdAt ? formatDate(selectedUser.createdAt) : "Verified"}</strong>
            </p>
            <p className="flex justify-between">
              <span>Last Active:</span>
              <strong className="text-white">{selectedUser?.lastLogin || "Today"}</strong>
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {selectedUser && selectedUser.role !== "ADMIN" && (
              <Button
                variant={selectedUser.status === "ACTIVE" ? "destructive" : "default"}
                size="sm"
                onClick={() => handleToggleStatus(selectedUser)}
                className="text-xs font-bold"
              >
                {selectedUser.status === "ACTIVE" ? "Suspend Account" : "Reactivate Account"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUser(null)}
              className="text-xs border-slate-700 text-slate-300 ml-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
