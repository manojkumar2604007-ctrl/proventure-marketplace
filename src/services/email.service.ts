/**
 * PROVENTURE MARKETPLACE - Transactional Email Service
 * Powered by Resend with non-blocking background processing.
 * Never exposes API keys to client-side bundles.
 */

import { Resend } from "resend";
import * as templates from "./email-templates";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  id?: string;
  error?: string;
  isMock?: boolean;
}

export interface SentEmailLogItem {
  id: string;
  to: string | string[];
  subject: string;
  dispatchedAt: string;
  isMock: boolean;
  preview: string;
}

// In-memory audit trail of dispatched emails (retains recent 50 emails)
export const sentEmailsAuditLog: SentEmailLogItem[] = [];

let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_your_api_key_here" || apiKey.startsWith("re_mock")) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/**
 * Core sendEmail function
 * Dispatches via Resend if configured, or records in development log if in mock/test mode.
 * Guaranteed never to crash the calling application thread.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailDispatchResult> {
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  
  // Basic email syntax validation
  const validRecipients = recipients.filter((r) => typeof r === "string" && r.includes("@"));
  if (validRecipients.length === 0) {
    console.warn("[Email Service] No valid recipients provided:", options.to);
    return { success: false, error: "Invalid recipient email address" };
  }

  const fromAddress =
    process.env.EMAIL_FROM || "ProVenture Marketplace <onboarding@resend.dev>";

  const resend = getResendClient();

  if (resend) {
    try {
      const response = await resend.emails.send({
        from: fromAddress,
        to: validRecipients,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
        replyTo: options.replyTo,
      });

      if (response.error) {
        console.error("[Email Service] Resend API error:", response.error);
        return { success: false, error: response.error.message };
      }

      const logItem: SentEmailLogItem = {
        id: response.data?.id || `email_${Date.now()}`,
        to: validRecipients,
        subject: options.subject,
        dispatchedAt: new Date().toISOString(),
        isMock: false,
        preview: options.subject,
      };
      sentEmailsAuditLog.unshift(logItem);
      if (sentEmailsAuditLog.length > 50) sentEmailsAuditLog.pop();

      return { success: true, id: logItem.id, isMock: false };
    } catch (err: any) {
      console.error("[Email Service] Exception dispatching via Resend:", err);
      return { success: false, error: err?.message || "Unknown email dispatch failure" };
    }
  }

  // Development / Offline Fallback Mode
  const mockId = `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const logItem: SentEmailLogItem = {
    id: mockId,
    to: validRecipients,
    subject: options.subject,
    dispatchedAt: new Date().toISOString(),
    isMock: true,
    preview: options.subject,
  };

  sentEmailsAuditLog.unshift(logItem);
  if (sentEmailsAuditLog.length > 50) sentEmailsAuditLog.pop();

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[Email Service (Dev Mock)] Dispatched to: ${validRecipients.join(", ")} | Subject: "${options.subject}"`
    );
  }

  return { success: true, id: mockId, isMock: true };
}

/**
 * Non-blocking background email dispatch
 * Executes in a fire-and-forget Promise so critical e-commerce flows (checkout, payments)
 * are NEVER delayed or blocked by email network latency or provider outages.
 */
export function sendEmailInBackground(options: SendEmailOptions): void {
  Promise.resolve()
    .then(async () => {
      try {
        await sendEmail(options);
      } catch (err) {
        console.error("[Email Service] Background execution caught error:", err);
      }
    })
    .catch((err) => {
      console.error("[Email Service] Promise resolution error:", err);
    });
}

// ==========================================
// Specialized Transactional Dispatch Helpers
// ==========================================

export async function sendWelcomeEmail(
  to: string,
  data: { name: string; email: string; exploreUrl?: string },
  background = true
) {
  const { subject, html, text } = templates.generateWelcomeEmail(data);
  if (background) {
    sendEmailInBackground({ to, subject, html, text });
    return { success: true };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendVerificationEmail(
  to: string,
  data: { name: string; email: string; verificationUrl: string; verificationCode?: string },
  background = true
) {
  const { subject, html, text } = templates.generateVerificationEmail(data);
  if (background) {
    sendEmailInBackground({ to, subject, html, text });
    return { success: true };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendPasswordResetEmail(
  to: string,
  data: { name: string; email: string; resetUrl: string; ipAddress?: string },
  background = true
) {
  const { subject, html, text } = templates.generatePasswordResetEmail(data);
  if (background) {
    sendEmailInBackground({ to, subject, html, text });
    return { success: true };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: {
    name: string;
    orderId: string;
    orderNumber: string;
    items: Array<{ title: string; quantity: number; price: number; sellerName?: string }>;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    shippingAddress: { fullName: string; street: string; city: string; state: string; postalCode: string };
    trackingUrl: string;
  },
  background = true
) {
  const { subject, html, text } = templates.generateOrderConfirmationEmail(data);
  if (background) {
    sendEmailInBackground({ to, subject, html, text });
    return { success: true };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendPaymentConfirmationEmail(
  to: string,
  data: {
    name: string;
    orderNumber: string;
    paymentId: string;
    paymentMethod: string;
    amount: number;
    date: string;
    invoiceUrl?: string;
  },
  background = true
) {
  const { subject, html, text } = templates.generatePaymentConfirmationEmail(data);
  if (background) {
    sendEmailInBackground({ to, subject, html, text });
    return { success: true };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendShippingNotificationEmail(
  to: string,
  data: {
    name: string;
    orderNumber: string;
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    trackingUrl: string;
    items: Array<{ title: string; quantity: number }>;
  },
  background = true
) {
  const { subject, html, text } = templates.generateShippingNotificationEmail(data);
  if (background) {
    sendEmailInBackground({ to, subject, html, text });
    return { success: true };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendSellerApprovalEmail(
  to: string,
  data: { storeName: string; sellerName: string; dashboardUrl?: string },
  background = true
) {
  const { subject, html, text } = templates.generateSellerApprovalEmail(data);
  if (background) {
    sendEmailInBackground({ to, subject, html, text });
    return { success: true };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendSellerRejectionEmail(
  to: string,
  data: { storeName: string; sellerName: string; reason: string; appealUrl?: string },
  background = true
) {
  const { subject, html, text } = templates.generateSellerRejectionEmail(data);
  if (background) {
    sendEmailInBackground({ to, subject, html, text });
    return { success: true };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendRefundNotificationEmail(
  to: string,
  data: {
    name: string;
    orderNumber: string;
    refundAmount: number;
    refundId: string;
    reason: string;
    timeline?: string;
  },
  background = true
) {
  const { subject, html, text } = templates.generateRefundNotificationEmail(data);
  if (background) {
    sendEmailInBackground({ to, subject, html, text });
    return { success: true };
  }
  return sendEmail({ to, subject, html, text });
}
