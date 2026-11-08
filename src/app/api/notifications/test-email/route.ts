import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as emailService from "@/services/email.service";
import { NotificationService } from "@/services/notification.service";
import { NotificationType } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/test-email
 * Returns audit log of sent emails and list of available test templates
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    return NextResponse.json({
      auditLog: emailService.sentEmailsAuditLog,
      availableTemplates: [
        "welcome",
        "verification",
        "password_reset",
        "order_confirmation",
        "payment_confirmation",
        "shipping_notification",
        "seller_approval",
        "seller_rejection",
        "refund_notification",
      ],
      resendConfigured: !!(
        process.env.RESEND_API_KEY &&
        !process.env.RESEND_API_KEY.startsWith("re_mock") &&
        process.env.RESEND_API_KEY !== "re_your_api_key_here"
      ),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/notifications/test-email
 * Triggers a test email with specified template and optional in-app notification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { template, to = "test@example.com", name = "Alex Morgan", createInApp = true } = body;

    let dispatchResult: any;

    switch (template) {
      case "welcome": {
        dispatchResult = await emailService.sendWelcomeEmail(
          to,
          { name, email: to },
          false // await for direct testing response
        );
        if (createInApp) {
          await NotificationService.createNotification({
            userId: "usr_customer_1",
            title: "Welcome to ProVenture Marketplace",
            message: `Hello ${name}, explore curated collections from independent artisans.`,
            type: NotificationType.INFO,
          });
        }
        break;
      }

      case "verification": {
        dispatchResult = await emailService.sendVerificationEmail(
          to,
          {
            name,
            email: to,
            verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=test_token_123`,
            verificationCode: "748291",
          },
          false
        );
        break;
      }

      case "password_reset": {
        dispatchResult = await emailService.sendPasswordResetEmail(
          to,
          {
            name,
            email: to,
            resetUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=test_reset_999`,
            ipAddress: "103.21.244.0",
          },
          false
        );
        break;
      }

      case "order_confirmation": {
        dispatchResult = await emailService.sendOrderConfirmationEmail(
          to,
          {
            name,
            orderId: "ord-test-101",
            orderNumber: "PV-8921-A",
            items: [
              {
                title: "AuraWave Pro Spatial ANC Studio Headphones",
                quantity: 1,
                price: 18499,
                sellerName: "TechNexus Innovations",
              },
              {
                title: "Handcrafted Vegetable Tanned Leather Cable Organizer",
                quantity: 2,
                price: 1499,
                sellerName: "LuxeCraft Leatherworks",
              },
            ],
            subtotal: 21497,
            tax: 3869,
            shipping: 0,
            total: 25366,
            shippingAddress: {
              fullName: name,
              street: "42 Residency Road, Ashok Nagar",
              city: "Bengaluru",
              state: "Karnataka",
              postalCode: "560025",
            },
            trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/customer/orders/ord-test-101`,
          },
          false
        );
        if (createInApp) {
          await NotificationService.createNotification({
            userId: "usr_customer_1",
            title: "Order Confirmed: #PV-8921-A",
            message: "Your payment of ₹25,366 was received. Sellers have been notified.",
            type: NotificationType.ORDER_UPDATE,
            data: { orderId: "ord-test-101", orderNumber: "PV-8921-A" },
          });
        }
        break;
      }

      case "payment_confirmation": {
        dispatchResult = await emailService.sendPaymentConfirmationEmail(
          to,
          {
            name,
            orderNumber: "PV-8921-A",
            paymentId: "pay_RZP882910471",
            paymentMethod: "UPI (Google Pay / HDFC)",
            amount: 25366,
            date: new Date().toLocaleString("en-IN"),
            invoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/customer/orders`,
          },
          false
        );
        if (createInApp) {
          await NotificationService.createNotification({
            userId: "usr_customer_1",
            title: "Payment Receipt Confirmed — ₹25,366",
            message: "Razorpay transaction pay_RZP882910471 confirmed. Tax invoice ready.",
            type: NotificationType.PAYMENT,
          });
        }
        break;
      }

      case "shipping_notification": {
        dispatchResult = await emailService.sendShippingNotificationEmail(
          to,
          {
            name,
            orderNumber: "PV-8921-A",
            carrier: "Blue Dart Express",
            trackingNumber: "BD-982189401-IN",
            estimatedDelivery: "Thursday, Nov 12, 2026",
            trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/customer/orders/ord-test-101`,
            items: [
              { title: "AuraWave Pro Spatial ANC Studio Headphones", quantity: 1 },
            ],
          },
          false
        );
        if (createInApp) {
          await NotificationService.createNotification({
            userId: "usr_customer_1",
            title: "Shipment Dispatched: Blue Dart BD-982189401-IN",
            message: "Your order PV-8921-A has been handed over to Blue Dart Express.",
            type: NotificationType.ORDER_UPDATE,
            data: { trackingNumber: "BD-982189401-IN" },
          });
        }
        break;
      }

      case "seller_approval": {
        dispatchResult = await emailService.sendSellerApprovalEmail(
          to,
          {
            sellerName: name,
            storeName: "Artisanal Studio Guild",
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/seller/dashboard`,
          },
          false
        );
        if (createInApp) {
          await NotificationService.createNotification({
            userId: "usr_seller_1",
            title: "Merchant Application Approved 🎉",
            message: "Your store Artisanal Studio Guild is now verified and active on ProVenture.",
            type: NotificationType.SYSTEM,
          });
        }
        break;
      }

      case "seller_rejection": {
        dispatchResult = await emailService.sendSellerRejectionEmail(
          to,
          {
            sellerName: name,
            storeName: "Unknown Retail",
            reason: "Store catalog details did not meet marketplace quality standards.",
            appealUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/seller/register`,
          },
          false
        );
        break;
      }

      case "refund_notification": {
        dispatchResult = await emailService.sendRefundNotificationEmail(
          to,
          {
            name,
            orderNumber: "PV-8921-A",
            refundAmount: 18499,
            refundId: "rfnd_RZP7721840",
            reason: "Return approved: Defective item verified by seller.",
            timeline: "5 to 7 banking business days",
          },
          false
        );
        if (createInApp) {
          await NotificationService.createNotification({
            userId: "usr_customer_1",
            title: "Refund Processed: ₹18,499",
            message: "Refund rfnd_RZP7721840 credited back for order PV-8921-A.",
            type: NotificationType.PAYMENT,
          });
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown template: ${template}. Refer to GET for available templates.` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      template,
      recipient: to,
      dispatchResult,
      auditLogLength: emailService.sentEmailsAuditLog.length,
    });
  } catch (err: any) {
    console.error("[POST /api/notifications/test-email] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
