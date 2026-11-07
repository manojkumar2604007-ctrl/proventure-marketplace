import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email: string;
  role: Role;
  status: string;
  sellerProfileId?: string | null;
  storeId?: string | null;
  storeSlug?: string | null;
  isSellerApproved?: boolean;
}

/**
 * Retrieves the current session server-side.
 */
export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Returns current authenticated user or null.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerAuthSession();
  if (!session?.user) return null;
  return session.user as unknown as AuthenticatedUser;
}

/**
 * Requires an authenticated user session.
 * Throws an Error with 401 status if unauthenticated.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    const error: any = new Error("Authentication required. Please sign in.");
    error.status = 401;
    throw error;
  }
  if (user.status === "SUSPENDED") {
    const error: any = new Error("Access denied: Your account has been suspended.");
    error.status = 403;
    throw error;
  }
  return user;
}

/**
 * Requires user to have one of the specified roles.
 * Throws 403 Forbidden if user does not possess required role.
 */
export async function requireRole(allowedRoles: Role[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  // Admin possesses supervisory access across all standard roles
  if (user.role === "ADMIN") {
    return user;
  }

  if (!allowedRoles.includes(user.role)) {
    const error: any = new Error(
      `Forbidden: Access denied. Required role: [${allowedRoles.join(", ")}], your role: [${user.role}]`
    );
    error.status = 403;
    throw error;
  }

  return user;
}

/**
 * Requires an approved seller.
 * Blocks pending, suspended, or rejected seller accounts from seller dashboard actions.
 */
export async function requireApprovedSeller(): Promise<AuthenticatedUser> {
  const user = await requireRole(["SELLER"]);

  if (user.role === "ADMIN") return user;

  if (!user.isSellerApproved) {
    // Check live status in database if available
    try {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id },
      });
      if (sellerProfile && sellerProfile.status === "APPROVED") {
        user.isSellerApproved = true;
        return user;
      }
    } catch {
      // Offline fallback
    }

    const error: any = new Error(
      "Seller account is currently pending administrative approval or has been suspended."
    );
    error.status = 403;
    throw error;
  }

  return user;
}

/**
 * Requires administrator privileges.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  return await requireRole(["ADMIN"]);
}

/**
 * Validates that the requested resource belongs to the currently logged in user.
 * Admin users are granted supervisory access.
 * Prevents customers from accessing other customers' orders, addresses, or carts.
 */
export function validateResourceOwnership(
  resourceOwnerUserId: string,
  currentUser: AuthenticatedUser
): boolean {
  if (currentUser.role === "ADMIN") return true;

  if (resourceOwnerUserId !== currentUser.id) {
    const error: any = new Error(
      "Forbidden: You do not have permission to view or modify another user's private records."
    );
    error.status = 403;
    throw error;
  }

  return true;
}

/**
 * Validates that the requested store belongs to the currently logged in seller.
 * Admin users are granted supervisory access.
 * Prevents Seller A from viewing or modifying Seller B's products, inventory, or orders.
 */
export async function validateStoreOwnership(
  storeId: string,
  currentUser: AuthenticatedUser
): Promise<boolean> {
  if (currentUser.role === "ADMIN") return true;

  if (currentUser.storeId && currentUser.storeId === storeId) {
    return true;
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { sellerProfile: true },
    });

    if (store && store.sellerProfile.userId === currentUser.id) {
      return true;
    }
  } catch {
    // Offline fallback: check if store belongs to this user
  }

  const error: any = new Error(
    "Forbidden: You do not possess merchant ownership rights for this store."
  );
  error.status = 403;
  throw error;
}

/**
 * Prevents privilege escalation during public registration.
 * Disallows client-supplied ADMIN role assignment.
 */
export function sanitizeRegistrationRole(requestedRole?: string): Role {
  if (!requestedRole || requestedRole.toUpperCase() === "ADMIN") {
    return "CUSTOMER"; // Hard rule: Never allow public admin registration
  }
  if (requestedRole.toUpperCase() === "SELLER") {
    return "SELLER";
  }
  return "CUSTOMER";
}
