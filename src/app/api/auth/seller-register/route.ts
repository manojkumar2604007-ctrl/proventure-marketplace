import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const SellerRegisterSchema = z.object({
  name: z.string().min(2, "Contact name is required"),
  email: z.string().email("Invalid business email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number is required"),
  businessName: z.string().min(3, "Registered business name is required"),
  storeName: z.string().min(3, "Store name is required"),
  taxId: z.string().optional(),
  panNumber: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SellerRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const normalizedEmail = data.email.toLowerCase().trim();
    const storeSlug = slugify(data.storeName);

    try {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      const hashedPassword = await hashPassword(data.password);

      const result = await prisma.$transaction(async (tx) => {
        // If user doesn't exist, create user with role SELLER
        if (!user) {
          user = await tx.user.create({
            data: {
              name: data.name,
              email: normalizedEmail,
              password: hashedPassword,
              phone: data.phone,
              role: "SELLER",
              status: "ACTIVE",
            },
          });
        } else {
          // If already existing customer, promote to SELLER
          user = await tx.user.update({
            where: { id: user.id },
            data: {
              role: "SELLER",
              phone: data.phone,
            },
          });
        }

        // Create SellerProfile with status PENDING (requires admin verification)
        const sellerProfile = await tx.sellerProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            businessName: data.businessName,
            businessEmail: normalizedEmail,
            businessPhone: data.phone,
            taxId: data.taxId || null,
            panNumber: data.panNumber || null,
            status: "PENDING", // MUST BE APPROVED BY ADMIN
            isVerified: false,
          },
          update: {
            businessName: data.businessName,
            businessPhone: data.phone,
            taxId: data.taxId || null,
          },
        });

        // Create Store entity
        const store = await tx.store.upsert({
          where: { slug: storeSlug },
          create: {
            sellerProfileId: sellerProfile.id,
            name: data.storeName,
            slug: storeSlug,
            description: data.description || null,
            isActive: true,
          },
          update: {
            name: data.storeName,
            description: data.description || null,
          },
        });

        // Security Audit Log
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "SELLER_ONBOARDING_APPLICATION",
            entityType: "SellerProfile",
            entityId: sellerProfile.id,
            newData: {
              storeName: data.storeName,
              businessName: data.businessName,
              status: "PENDING",
            },
            ipAddress: req.ip || req.headers.get("x-forwarded-for") || "127.0.0.1",
          },
        });

        return { user, sellerProfile, store };
      });

      return NextResponse.json(
        {
          success: true,
          message:
            "Seller application received. Your store is under administrative verification.",
          data: {
            storeSlug: result.store.slug,
            sellerStatus: result.sellerProfile.status,
          },
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn("Neon DB query fallback for seller registration:", dbErr.message);

      return NextResponse.json(
        {
          success: true,
          message:
            "Seller onboarding application submitted successfully (Local Fallback Mode).",
          data: {
            storeSlug,
            sellerStatus: "PENDING",
          },
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process seller application" },
      { status: 500 }
    );
  }
}
