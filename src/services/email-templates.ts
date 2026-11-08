/**
 * PROVENTURE MARKETPLACE - Transactional Email Templates
 * Brand-aligned, responsive HTML email templates with ProVenture styling:
 * Deep Navy (#0A192F), Royal Blue (#1D4ED8), Emerald (#059669), Slate (#F8FAFC).
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface EmailHeaderOptions {
  preheader?: string;
}

function renderEmailLayout(title: string, bodyContent: string, options?: EmailHeaderOptions): string {
  const preheaderText = options?.preheader || title;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; }
    table { border-collapse: collapse; width: 100%; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(10, 25, 47, 0.06); border: 1px solid #E2E8F0; }
    .header { background: linear-gradient(135deg, #0A192F 0%, #1D4ED8 100%); padding: 32px 28px; text-align: center; }
    .logo-badge { display: inline-block; background-color: #ffffff; color: #0A192F; font-weight: 900; font-size: 20px; width: 38px; height: 38px; line-height: 38px; border-radius: 10px; margin-bottom: 8px; }
    .brand-title { color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 1px; margin: 0; }
    .brand-subtitle { color: #93C5FD; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 2px; }
    .content { padding: 36px 32px; }
    .btn-primary { display: inline-block; background-color: #1D4ED8; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; margin-top: 20px; text-align: center; }
    .btn-primary:hover { background-color: #1E40AF; }
    .badge-pill { display: inline-block; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; }
    .badge-success { background-color: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
    .badge-warning { background-color: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
    .badge-danger { background-color: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
    .card-box { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 32px; text-align: center; font-size: 12px; color: #64748B; }
    .footer a { color: #1D4ED8; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body style="background-color: #F8FAFC; padding: 24px 12px;">
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheaderText}
  </div>
  <table role="presentation" style="width: 100%; border: 0;">
    <tr>
      <td align="center">
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <div class="logo-badge">P</div>
            <div class="brand-title">PROVENTURE</div>
            <div class="brand-subtitle">Curated Multi-Vendor Marketplace</div>
          </div>
          
          <!-- Content -->
          <div class="content">
            ${bodyContent}
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #334155;">
              ProVenture Multi-Vendor Marketplace Inc.
            </p>
            <p style="margin: 0 0 12px 0;">
              Indiranagar 100ft Road, Bengaluru, Karnataka 560038, India
            </p>
            <p style="margin: 0 0 12px 0;">
              <a href="${BASE_URL}/products">Explore Products</a> &bull;
              <a href="${BASE_URL}/customer/orders">Track Orders</a> &bull;
              <a href="${BASE_URL}/customer/settings">Notification Settings</a>
            </p>
            <p style="margin: 0; font-size: 11px; color: #94A3B8;">
              This is an automated transactional notification sent to your verified email.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ==========================================
// 1. Welcome Email
// ==========================================
export function generateWelcomeEmail(data: { name: string; email: string; exploreUrl?: string }) {
  const exploreUrl = data.exploreUrl || `${BASE_URL}/products`;
  const subject = `Welcome to ProVenture Marketplace, ${data.name}!`;

  const html = renderEmailLayout(
    subject,
    `
    <h2 style="font-size: 22px; font-weight: 800; color: #0A192F; margin-top: 0;">Welcome aboard, ${data.name}! 👋</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      Thank you for joining <strong>ProVenture Marketplace</strong>. You are now part of a curated community connecting discerning shoppers with exceptional independent artisans, modern tech innovators, and bespoke lifestyle creators.
    </p>

    <div class="card-box">
      <h3 style="font-size: 14px; font-weight: 700; color: #0A192F; margin-top: 0; margin-bottom: 12px;">What makes ProVenture different?</h3>
      <ul style="padding-left: 20px; margin: 0; font-size: 13px; color: #475569; line-height: 1.7;">
        <li><strong>Curated Independent Stores:</strong> Every vendor is rigorously verified for craftsmanship.</li>
        <li><strong>Atomic Multi-Vendor Cart:</strong> Seamlessly checkout products from multiple artisans in a single payment.</li>
        <li><strong>Verified Purchaser Reviews:</strong> Transparent ratings exclusively from actual buyers.</li>
        <li><strong>Buyer Protection SLA:</strong> 7-day hassle-free returns and direct dispute resolution.</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 28px;">
      <a href="${exploreUrl}" class="btn-primary">Explore Trending Collections &rarr;</a>
    </div>

    <p style="font-size: 13px; color: #64748B; margin-top: 28px; border-top: 1px solid #F1F5F9; pt: 16px;">
      Need help getting started? Visit your <a href="${BASE_URL}/customer" style="color: #1D4ED8; font-weight: 600;">Customer Dashboard</a> to manage your profile, addresses, and wishlist.
    </p>
    `,
    { preheader: "Discover curated independent artisans and premium electronics on ProVenture." }
  );

  const text = `Welcome to ProVenture Marketplace, ${data.name}!\n\nThank you for joining our community. Explore curated independent stores and trending products at: ${exploreUrl}\n\nManage your account at: ${BASE_URL}/customer`;

  return { subject, html, text };
}

// ==========================================
// 2. Email Verification
// ==========================================
export function generateVerificationEmail(data: {
  name: string;
  email: string;
  verificationUrl: string;
  verificationCode?: string;
}) {
  const subject = "Verify your email address - ProVenture Marketplace";

  const html = renderEmailLayout(
    subject,
    `
    <h2 style="font-size: 22px; font-weight: 800; color: #0A192F; margin-top: 0;">Verify Your Email Address 🔒</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      Hello ${data.name}, please confirm that <strong>${data.email}</strong> belongs to you to activate full customer and merchant privileges on ProVenture.
    </p>

    ${
      data.verificationCode
        ? `
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Your 6-Digit Verification Code</span>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1D4ED8; background-color: #F0F7FF; border: 2px dashed #93C5FD; padding: 14px; border-radius: 12px; margin-top: 8px; display: inline-block;">
          ${data.verificationCode}
        </div>
      </div>
      `
        : ""
    }

    <div style="text-align: center; margin-top: 24px;">
      <a href="${data.verificationUrl}" class="btn-primary">Verify Email Address &rarr;</a>
    </div>

    <p style="font-size: 12px; color: #64748B; margin-top: 28px; line-height: 1.5;">
      Or copy and paste this link in your browser:<br />
      <span style="color: #1D4ED8; word-break: break-all;">${data.verificationUrl}</span>
    </p>

    <div class="card-box" style="margin-top: 24px; padding: 14px 18px;">
      <p style="font-size: 12px; color: #64748B; margin: 0;">
        ⚠️ <strong>Security Notice:</strong> This link will expire in 24 hours. If you did not create a ProVenture account, please disregard this email.
      </p>
    </div>
    `,
    { preheader: "Please verify your email address to activate your ProVenture account." }
  );

  const text = `Verify your ProVenture email address:\n\nClick the link below or paste it in your browser:\n${data.verificationUrl}\n${data.verificationCode ? `Verification Code: ${data.verificationCode}\n` : ""}This link expires in 24 hours.`;

  return { subject, html, text };
}

// ==========================================
// 3. Password Reset Email
// ==========================================
export function generatePasswordResetEmail(data: {
  name: string;
  email: string;
  resetUrl: string;
  ipAddress?: string;
}) {
  const subject = "Reset your ProVenture password";

  const html = renderEmailLayout(
    subject,
    `
    <h2 style="font-size: 22px; font-weight: 800; color: #0A192F; margin-top: 0;">Password Reset Request 🔑</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      Hello ${data.name}, we received a request to reset the password for your ProVenture Marketplace account associated with <strong>${data.email}</strong>.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.resetUrl}" class="btn-primary">Choose New Password &rarr;</a>
    </div>

    <p style="font-size: 12px; color: #64748B; line-height: 1.5;">
      Direct link:<br />
      <span style="color: #1D4ED8; word-break: break-all;">${data.resetUrl}</span>
    </p>

    <div class="card-box" style="margin-top: 24px;">
      <h4 style="font-size: 13px; font-weight: 700; color: #991B1B; margin: 0 0 6px 0;">Security Reminder</h4>
      <p style="font-size: 12px; color: #64748B; margin: 0; line-height: 1.5;">
        This password reset link is valid for <strong>60 minutes</strong>. If you did not make this request, your account is still secure; no changes were made.
        ${data.ipAddress ? `<br />Requested from IP: <code>${data.ipAddress}</code>` : ""}
      </p>
    </div>
    `,
    { preheader: "Security notice: Password reset link valid for 60 minutes." }
  );

  const text = `Reset your ProVenture password:\n\nClick the link below to choose a new password:\n${data.resetUrl}\n\nThis link is valid for 60 minutes. If you did not make this request, please ignore this email.`;

  return { subject, html, text };
}

// ==========================================
// 4. Order Confirmation Email
// ==========================================
export function generateOrderConfirmationEmail(data: {
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
}) {
  const subject = `Order Confirmed: #${data.orderNumber} — ProVenture Marketplace`;

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9;">
        <div style="font-weight: 700; font-size: 13px; color: #0F172A;">${item.title}</div>
        ${item.sellerName ? `<div style="font-size: 11px; color: #64748B;">Sold by: ${item.sellerName}</div>` : ""}
        <div style="font-size: 12px; color: #64748B;">Qty: ${item.quantity} &times; ₹${item.price.toLocaleString("en-IN")}</div>
      </td>
      <td align="right" style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; font-weight: 700; font-size: 13px; color: #0F172A; vertical-align: top;">
        ₹${(item.price * item.quantity).toLocaleString("en-IN")}
      </td>
    </tr>
  `
    )
    .join("");

  const html = renderEmailLayout(
    subject,
    `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <h2 style="font-size: 22px; font-weight: 800; color: #0A192F; margin: 0;">Order Confirmed! 🛍️</h2>
      <span class="badge-pill badge-success">Payment Received</span>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-top: 12px;">
      Thank you for your purchase, ${data.name}! We have notified the independent sellers to begin preparing your merchandise.
    </p>

    <div class="card-box" style="padding: 16px;">
      <table style="width: 100%;">
        <tr>
          <td style="font-size: 12px; color: #64748B;">Order Reference</td>
          <td align="right" style="font-size: 12px; font-weight: 700; color: #0A192F;">#${data.orderNumber}</td>
        </tr>
        <tr>
          <td style="font-size: 12px; color: #64748B;">Date Placed</td>
          <td align="right" style="font-size: 12px; font-weight: 600; color: #0A192F;">${new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-size: 15px; font-weight: 700; color: #0A192F; margin: 24px 0 12px 0;">Purchased Items</h3>
    <table style="width: 100%; margin-bottom: 16px;">
      ${itemsHtml}
      <tr>
        <td style="padding: 8px 0; font-size: 12px; color: #64748B;">Subtotal</td>
        <td align="right" style="padding: 8px 0; font-size: 12px; font-weight: 600; color: #0F172A;">₹${data.subtotal.toLocaleString("en-IN")}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 12px; color: #64748B;">Estimated GST (18%)</td>
        <td align="right" style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #0F172A;">₹${data.tax.toLocaleString("en-IN")}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 12px; color: #64748B;">Shipping &amp; Handling</td>
        <td align="right" style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #059669;">${data.shipping === 0 ? "FREE" : `₹${data.shipping.toLocaleString("en-IN")}`}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; font-size: 15px; font-weight: 800; color: #0A192F; border-top: 2px solid #E2E8F0;">Total Paid</td>
        <td align="right" style="padding: 12px 0; font-size: 16px; font-weight: 900; color: #1D4ED8; border-top: 2px solid #E2E8F0;">₹${data.total.toLocaleString("en-IN")}</td>
      </tr>
    </table>

    <div class="card-box">
      <h4 style="font-size: 13px; font-weight: 700; color: #0A192F; margin: 0 0 8px 0;">Shipping Address</h4>
      <p style="font-size: 12px; color: #475569; margin: 0; line-height: 1.6;">
        <strong>${data.shippingAddress.fullName}</strong><br />
        ${data.shippingAddress.street}<br />
        ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.postalCode}
      </p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${data.trackingUrl}" class="btn-primary">View &amp; Track Order #${data.orderNumber} &rarr;</a>
    </div>
    `,
    { preheader: `Your order #${data.orderNumber} has been received and confirmed.` }
  );

  const text = `Order Confirmed: #${data.orderNumber}\n\nThank you for your order, ${data.name}!\nTotal: ₹${data.total.toLocaleString("en-IN")}\nTrack your shipment at: ${data.trackingUrl}`;

  return { subject, html, text };
}

// ==========================================
// 5. Payment Confirmation Email
// ==========================================
export function generatePaymentConfirmationEmail(data: {
  name: string;
  orderNumber: string;
  paymentId: string;
  paymentMethod: string;
  amount: number;
  date: string;
  invoiceUrl?: string;
}) {
  const subject = `Payment Confirmed: ₹${data.amount.toLocaleString("en-IN")} for #${data.orderNumber}`;
  const invoiceUrl = data.invoiceUrl || `${BASE_URL}/customer/orders`;

  const html = renderEmailLayout(
    subject,
    `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; background-color: #ECFDF5; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 28px; margin-bottom: 8px;">
        💳
      </div>
      <h2 style="font-size: 22px; font-weight: 800; color: #0A192F; margin: 0;">Payment Verified Successfully</h2>
      <p style="font-size: 13px; color: #059669; font-weight: 700; margin-top: 4px;">Official Payment Receipt Generated</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      Hello ${data.name}, your payment of <strong>₹${data.amount.toLocaleString("en-IN")}</strong> for order <strong>#${data.orderNumber}</strong> has been processed securely via Razorpay.
    </p>

    <div class="card-box">
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Amount Charged</td>
          <td align="right" style="font-weight: 800; color: #0A192F;">₹${data.amount.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Razorpay Payment ID</td>
          <td align="right" style="font-family: monospace; font-size: 11px; color: #1D4ED8;">${data.paymentId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Payment Mode</td>
          <td align="right" style="font-weight: 600; color: #0F172A;">${data.paymentMethod}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Transaction Timestamp</td>
          <td align="right" style="color: #64748B;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Status</td>
          <td align="right"><span class="badge-pill badge-success">PAID</span></td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${invoiceUrl}" class="btn-primary">Download GST Tax Invoice &rarr;</a>
    </div>

    <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 20px;">
      This email serves as an official electronic payment receipt compliant with Indian GST regulations.
    </p>
    `,
    { preheader: `Payment receipt: ₹${data.amount.toLocaleString("en-IN")} paid via Razorpay.` }
  );

  const text = `Payment Confirmed: ₹${data.amount.toLocaleString("en-IN")} for #${data.orderNumber}\nPayment ID: ${data.paymentId}\nStatus: PAID\nView invoice: ${invoiceUrl}`;

  return { subject, html, text };
}

// ==========================================
// 6. Shipping Notification Email
// ==========================================
export function generateShippingNotificationEmail(data: {
  name: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  trackingUrl: string;
  items: Array<{ title: string; quantity: number }>;
}) {
  const subject = `Your Order #${data.orderNumber} Has Shipped! 🚀`;

  const itemsList = data.items
    .map(
      (item) => `
    <li style="font-size: 13px; color: #475569; padding: 4px 0;">
      <strong>${item.title}</strong> &times; ${item.quantity}
    </li>
  `
    )
    .join("");

  const html = renderEmailLayout(
    subject,
    `
    <h2 style="font-size: 22px; font-weight: 800; color: #0A192F; margin-top: 0;">Package on the Way! 🚚</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      Great news, ${data.name}! Your order <strong>#${data.orderNumber}</strong> has been packaged and handed over to our verified logistics partner.
    </p>

    <div class="card-box" style="background-color: #F0FDF4; border-color: #BBF7D0;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #059669; letter-spacing: 1px;">Logistics Dispatch Details</div>
      <table style="width: 100%; font-size: 13px; margin-top: 8px;">
        <tr>
          <td style="padding: 4px 0; color: #475569;">Carrier</td>
          <td align="right" style="font-weight: 700; color: #0A192F;">${data.carrier}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #475569;">AWB Tracking #</td>
          <td align="right" style="font-weight: 800; font-family: monospace; color: #1D4ED8;">${data.trackingNumber}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #475569;">Estimated Delivery</td>
          <td align="right" style="font-weight: 700; color: #059669;">${data.estimatedDelivery}</td>
        </tr>
      </table>
    </div>

    <div style="margin: 20px 0;">
      <h4 style="font-size: 13px; font-weight: 700; color: #0A192F; margin: 0 0 8px 0;">Items Dispatched in this Shipment</h4>
      <ul style="padding-left: 20px; margin: 0;">
        ${itemsList}
      </ul>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${data.trackingUrl}" class="btn-primary">Track Live Shipment &rarr;</a>
    </div>
    `,
    { preheader: `Your order #${data.orderNumber} is on its way via ${data.carrier}.` }
  );

  const text = `Order Shipped: #${data.orderNumber}\nCarrier: ${data.carrier}\nTracking No: ${data.trackingNumber}\nEstimated Delivery: ${data.estimatedDelivery}\nTrack live: ${data.trackingUrl}`;

  return { subject, html, text };
}

// ==========================================
// 7. Seller Approval Email
// ==========================================
export function generateSellerApprovalEmail(data: {
  storeName: string;
  sellerName: string;
  dashboardUrl?: string;
}) {
  const dashboardUrl = data.dashboardUrl || `${BASE_URL}/seller/dashboard`;
  const subject = `Welcome to ProVenture Verified Merchants: ${data.storeName} is Approved! 🎉`;

  const html = renderEmailLayout(
    subject,
    `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 36px; margin-bottom: 8px;">🎉</div>
      <h2 style="font-size: 22px; font-weight: 800; color: #0A192F; margin: 0;">Congratulations, ${data.storeName}!</h2>
      <p style="font-size: 13px; color: #059669; font-weight: 700; margin-top: 4px;">Your Merchant Application Has Been Approved</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      Hello ${data.sellerName}, our marketplace administration team has verified your credentials and business registration. Your store <strong>${data.storeName}</strong> is now officially active on <strong>ProVenture Marketplace</strong>.
    </p>

    <div class="card-box">
      <h4 style="font-size: 13px; font-weight: 700; color: #0A192F; margin: 0 0 10px 0;">Ready to start selling?</h4>
      <ol style="padding-left: 20px; margin: 0; font-size: 13px; color: #475569; line-height: 1.7;">
        <li><strong>List your products:</strong> Upload high-resolution photos and detailed descriptions.</li>
        <li><strong>Configure inventory:</strong> Set real-time stock levels and variant SKUs.</li>
        <li><strong>Review dispatch SLA:</strong> Ensure standard 48-hour order dispatch compliance.</li>
        <li><strong>Automated payouts:</strong> Settlements processed directly via Razorpay Route.</li>
      </ol>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${dashboardUrl}" class="btn-primary">Go to Seller Portal &rarr;</a>
    </div>
    `,
    { preheader: `Congratulations! Your store ${data.storeName} is now live on ProVenture.` }
  );

  const text = `Merchant Approved!\n\nHello ${data.sellerName}, your store "${data.storeName}" has been approved on ProVenture Marketplace.\nAccess your portal at: ${dashboardUrl}`;

  return { subject, html, text };
}

// ==========================================
// 8. Seller Rejection Email
// ==========================================
export function generateSellerRejectionEmail(data: {
  storeName: string;
  sellerName: string;
  reason: string;
  appealUrl?: string;
}) {
  const appealUrl = data.appealUrl || `${BASE_URL}/seller/register`;
  const subject = `Update Regarding Your Seller Application for ${data.storeName}`;

  const html = renderEmailLayout(
    subject,
    `
    <h2 style="font-size: 22px; font-weight: 800; color: #0A192F; margin-top: 0;">Application Status Update</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      Dear ${data.sellerName}, thank you for your interest in becoming a verified merchant on ProVenture Marketplace. After careful review of your application for <strong>${data.storeName}</strong>, our compliance team is unable to approve your account at this time.
    </p>

    <div class="card-box" style="background-color: #FEF2F2; border-color: #FECACA;">
      <h4 style="font-size: 13px; font-weight: 700; color: #991B1B; margin: 0 0 6px 0;">Review Feedback</h4>
      <p style="font-size: 13px; color: #7F1D1D; margin: 0; line-height: 1.5;">
        ${data.reason}
      </p>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #475569;">
      Common reasons for application rejection include incomplete store information, missing contact details, or brand catalog quality concerns. Once you have resolved the points above, we welcome you to update your profile and resubmit.
    </p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${appealUrl}" class="btn-primary">Review &amp; Resubmit Application &rarr;</a>
    </div>

    <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 20px;">
      If you believe this decision was made in error, you may reply directly to this notification with supporting business documentation.
    </p>
    `,
    { preheader: `Status update regarding your merchant application for ${data.storeName}.` }
  );

  const text = `Application Status Update for ${data.storeName}\n\nDear ${data.sellerName}, your application could not be approved at this time.\nFeedback: ${data.reason}\nResubmit at: ${appealUrl}`;

  return { subject, html, text };
}

// ==========================================
// 9. Refund Notification Email
// ==========================================
export function generateRefundNotificationEmail(data: {
  name: string;
  orderNumber: string;
  refundAmount: number;
  refundId: string;
  reason: string;
  timeline?: string;
}) {
  const timeline = data.timeline || "5 to 7 banking business days";
  const subject = `Refund Processed: ₹${data.refundAmount.toLocaleString("en-IN")} for #${data.orderNumber} 💰`;

  const html = renderEmailLayout(
    subject,
    `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 36px; margin-bottom: 8px;">💰</div>
      <h2 style="font-size: 22px; font-weight: 800; color: #0A192F; margin: 0;">Refund Initiated</h2>
      <p style="font-size: 13px; color: #059669; font-weight: 700; margin-top: 4px;">Credit Directed to Original Payment Source</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      Hello ${data.name}, a refund of <strong>₹${data.refundAmount.toLocaleString("en-IN")}</strong> has been processed for your order <strong>#${data.orderNumber}</strong>.
    </p>

    <div class="card-box">
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Refunded Amount</td>
          <td align="right" style="font-weight: 800; color: #059669; font-size: 15px;">₹${data.refundAmount.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Refund Transaction ID</td>
          <td align="right" style="font-family: monospace; font-size: 11px; color: #1D4ED8;">${data.refundId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Reason</td>
          <td align="right" style="color: #475569;">${data.reason}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Expected Credited Timeline</td>
          <td align="right" style="font-weight: 600; color: #0A192F;">${timeline}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      Depending on your bank or credit card issuer, it typically takes <strong>${timeline}</strong> for the transaction to reflect on your statement.
    </p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${BASE_URL}/customer/orders" class="btn-primary">View Order &amp; Refund History &rarr;</a>
    </div>
    `,
    { preheader: `Refund of ₹${data.refundAmount.toLocaleString("en-IN")} processed for order #${data.orderNumber}.` }
  );

  const text = `Refund Processed: ₹${data.refundAmount.toLocaleString("en-IN")} for #${data.orderNumber}\nRefund ID: ${data.refundId}\nReason: ${data.reason}\nTimeline: ${timeline}`;

  return { subject, html, text };
}
