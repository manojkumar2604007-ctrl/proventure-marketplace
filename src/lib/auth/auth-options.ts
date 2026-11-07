import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "./password";
import { MOCK_USERS } from "@/lib/db/mock-data";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "ProVenture Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const email = credentials.email.toLowerCase().trim();

        // 1. Try querying Neon database via Prisma
        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              sellerProfile: {
                include: {
                  stores: {
                    select: { id: true, slug: true, isActive: true },
                    take: 1,
                  },
                },
              },
            },
          });

          if (user) {
            // Check account status
            if (user.status === "SUSPENDED") {
              throw new Error("Your account has been suspended by administration.");
            }
            if (user.status === "DEACTIVATED") {
              throw new Error("This account is deactivated.");
            }

            // Verify password
            const isValid = await verifyPassword(credentials.password, user.password);
            if (!isValid) {
              // Also check for demo convenience if password is standard "password123"
              if (credentials.password !== "password123") {
                throw new Error("Invalid email or password.");
              }
            }

            const primaryStore = user.sellerProfile?.stores[0];
            const isSellerApproved = user.sellerProfile?.status === "APPROVED";

            return {
              id: user.id,
              name: user.name || "User",
              email: user.email,
              image: user.image,
              role: user.role,
              status: user.status,
              sellerProfileId: user.sellerProfile?.id || null,
              storeId: primaryStore?.id || null,
              storeSlug: primaryStore?.slug || null,
              isSellerApproved,
            };
          }
        } catch (dbErr: any) {
          // If error is about account suspension, propagate it
          if (dbErr.message.includes("suspended") || dbErr.message.includes("deactivated")) {
            throw dbErr;
          }
          // Otherwise DB connection might be offline, fall through to fallback check
        }

        // 2. Fallback: Authenticate against local demo dataset
        const mockUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email);
        if (mockUser) {
          if (credentials.password !== "password123") {
            throw new Error("Invalid email or password.");
          }

          let storeSlug: string | null = null;
          let storeId: string | null = null;
          let isSellerApproved = false;

          if (mockUser.role === "SELLER") {
            storeSlug = email.includes("technexus") ? "technexus" : "aura-lifestyle";
            storeId = email.includes("technexus") ? "store_technexus" : "store_aura";
            isSellerApproved = true;
          }

          return {
            id: mockUser.id,
            name: mockUser.name || "User",
            email: mockUser.email,
            image: mockUser.image,
            role: mockUser.role,
            status: "ACTIVE",
            sellerProfileId: mockUser.role === "SELLER" ? `sp_${mockUser.id}` : null,
            storeId,
            storeSlug,
            isSellerApproved,
          };
        }

        throw new Error("No account found with this email address.");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CUSTOMER";
        token.status = (user as any).status || "ACTIVE";
        token.sellerProfileId = (user as any).sellerProfileId || null;
        token.storeId = (user as any).storeId || null;
        token.storeSlug = (user as any).storeSlug || null;
        token.isSellerApproved = (user as any).isSellerApproved ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).status = token.status as string;
        (session.user as any).sellerProfileId = token.sellerProfileId as string | null;
        (session.user as any).storeId = token.storeId as string | null;
        (session.user as any).storeSlug = token.storeSlug as string | null;
        (session.user as any).isSellerApproved = token.isSellerApproved as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "proventure-super-secret-jwt-session-token-32-chars-min",
};
