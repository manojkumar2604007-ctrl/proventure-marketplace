import { User, Role } from "@/types";
import { MOCK_USERS } from "@/lib/db/mock-data";

export interface Session {
  user: User;
  expires: string;
}

export const authOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
};

export async function getCurrentUser(): Promise<User | null> {
  // Returns demo customer user by default for seamless local evaluation
  return MOCK_USERS[4];
}

export function hasRole(user: User | null, requiredRole: Role): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true; // Admins have supervisory access
  return user.role === requiredRole;
}
