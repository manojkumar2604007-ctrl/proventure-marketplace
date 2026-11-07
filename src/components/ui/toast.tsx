"use client";

import React from "react";
import { useUIStore } from "@/store/ui-store";
import { CheckCircle2, AlertCircle, AlertTriangle, X, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-card/95 backdrop-blur-md shadow-lg text-card-foreground"
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === "success" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {toast.type === "error" && (
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                )}
                {toast.type === "warning" && (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                {(!toast.type || toast.type === "default") && (
                  <Info className="h-5 w-5 text-primary" />
                )}
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
                {toast.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground p-0.5 rounded-md transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
