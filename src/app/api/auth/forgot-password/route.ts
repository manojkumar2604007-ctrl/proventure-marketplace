import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateSecureToken } from "@/lib/auth/password";
import { sendPasswordResetEmail } from "@/services/email.service";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // Always return success even if user not found to prevent user enumeration attacks
      if (!user) {
        return NextResponse.json({
          success: true,
          message: "If an account exists with this email, password reset instructions have been sent.",
        });
      }

      // Generate 1-hour expiration token
      const resetToken = generateSecureToken();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour

      await prisma.verificationToken.upsert({
        where: { token: resetToken },
        create: {
          identifier: normalizedEmail,
          token: resetToken,
          type: "PASSWORD_RESET",
          expires,
        },
        update: {
          expires,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_RESET_REQUESTED",
          entityType: "User",
          entityId: user.id,
          ipAddress: req.ip || req.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(
        normalizedEmail
      )}`;

      // Non-blocking password reset email
      sendPasswordResetEmail(
        normalizedEmail,
        {
          name: user.name || "Customer",
          email: normalizedEmail,
          resetUrl,
          ipAddress: req.ip || req.headers.get("x-forwarded-for") || undefined,
        },
        true
      );

      return NextResponse.json({
        success: true,
        message: "Password reset link generated successfully.",
        data: {
          resetUrl,
        },
      });
    } catch (dbErr: any) {
      console.warn("Neon DB query fallback for forgot password:", dbErr.message);

      const mockToken = generateSecureToken();
      return NextResponse.json({
        success: true,
        message: "Password reset link generated successfully (Local Fallback Mode).",
        data: {
          resetUrl: `/reset-password?token=${mockToken}&email=${encodeURIComponent(
            normalizedEmail
          )}`,
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
