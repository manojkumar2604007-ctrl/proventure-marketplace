import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// In-memory mock addresses for resilient local development / offline demo
let inMemoryAddresses: Array<{
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: "addr_1",
    userId: "usr_cust_1",
    fullName: "Priya Sharma",
    phone: "+91 91234 56789",
    street: "Flat 402, Oakwood Greens, 100 Feet Rd, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560038",
    country: "India",
    isDefault: true,
    type: "SHIPPING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "addr_2",
    userId: "usr_cust_1",
    fullName: "Priya Sharma (Office)",
    phone: "+91 91234 56789",
    street: "EcoWorld Technology Park, Tower 6, Outer Ring Road",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560103",
    country: "India",
    isDefault: false,
    type: "SHIPPING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "usr_cust_1";

    // Try fetching from database if available
    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const addresses = await prisma.address.findMany({
          where: { userId },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });
        return NextResponse.json({ success: true, data: addresses });
      }
    } catch {
      // Fall through to in-memory store
    }

    const addresses = inMemoryAddresses.filter((a) => a.userId === userId);
    return NextResponse.json({ success: true, data: addresses });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "usr_cust_1";
    const body = await request.json();

    const { fullName, phone, street, city, state, postalCode, country = "India", isDefault = false, type = "SHIPPING" } = body;

    if (!fullName || !phone || !street || !city || !postalCode) {
      return NextResponse.json(
        { success: false, error: "Missing required address fields" },
        { status: 400 }
      );
    }

    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        if (isDefault) {
          await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
          });
        }

        const newAddress = await prisma.address.create({
          data: {
            userId,
            fullName,
            phone,
            street,
            city,
            state: state || "Karnataka",
            postalCode,
            country,
            isDefault: Boolean(isDefault),
            type: type as any,
          },
        });
        return NextResponse.json({ success: true, data: newAddress }, { status: 201 });
      }
    } catch {
      // Fall through to in-memory store
    }

    if (isDefault) {
      inMemoryAddresses.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    const newAddr = {
      id: `addr_${Date.now()}`,
      userId,
      fullName,
      phone,
      street,
      city,
      state: state || "Karnataka",
      postalCode,
      country,
      isDefault: Boolean(isDefault),
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryAddresses.push(newAddr);
    return NextResponse.json({ success: true, data: newAddr }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create address" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "usr_cust_1";
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Address ID is required" }, { status: 400 });
    }

    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        // Ownership check
        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
          return NextResponse.json({ success: false, error: "Address not found or unauthorized" }, { status: 404 });
        }

        if (updates.isDefault) {
          await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
          });
        }

        const updated = await prisma.address.update({
          where: { id },
          data: updates,
        });
        return NextResponse.json({ success: true, data: updated });
      }
    } catch {
      // Fall through to in-memory store
    }

    const idx = inMemoryAddresses.findIndex((a) => a.id === id && a.userId === userId);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Address not found or unauthorized" }, { status: 404 });
    }

    if (updates.isDefault) {
      inMemoryAddresses.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    inMemoryAddresses[idx] = {
      ...inMemoryAddresses[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: inMemoryAddresses[idx] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update address" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "usr_cust_1";
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Address ID is required" }, { status: 400 });
    }

    try {
      if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "true") {
        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
          return NextResponse.json({ success: false, error: "Address not found or unauthorized" }, { status: 404 });
        }

        await prisma.address.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Address deleted successfully" });
      }
    } catch {
      // Fall through to in-memory store
    }

    const idx = inMemoryAddresses.findIndex((a) => a.id === id && a.userId === userId);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Address not found or unauthorized" }, { status: 404 });
    }

    inMemoryAddresses.splice(idx, 1);
    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete address" },
      { status: 500 }
    );
  }
}
