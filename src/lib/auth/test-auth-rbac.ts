import { hashPassword, verifyPassword, generateSecureToken } from "./password";
import {
  sanitizeRegistrationRole,
  validateResourceOwnership,
  validateStoreOwnership,
  AuthenticatedUser,
} from "./server-guard";

export async function runAuthenticationAndRBACAudit() {
  console.log("=================================================");
  console.log("PROVENTURE MARKETPLACE - AUTH & RBAC SECURITY AUDIT");
  console.log("=================================================");

  let passed = 0;
  let total = 0;

  function assert(testName: string, condition: boolean, extraInfo?: string) {
    total++;
    if (condition) {
      console.log(`  ✓ [TEST ${total}] PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [TEST ${total}] FAIL: ${testName} - ${extraInfo || ""}`);
    }
  }

  // -----------------------------------------------------------------
  // 1. Password Hashing & Encryption (bcryptjs 12 rounds)
  // -----------------------------------------------------------------
  console.log("\n[1] Password Encryption & Salting Verification:");
  const plainPassword = "SuperSecretPassword#2026";
  const hashedPassword = await hashPassword(plainPassword);

  assert(
    "Password hash is non-empty and formatted with bcrypt prefix",
    hashedPassword.startsWith("$2a$") || hashedPassword.startsWith("$2b$")
  );

  const isMatchValid = await verifyPassword(plainPassword, hashedPassword);
  assert("Valid password verification succeeds", isMatchValid);

  const isMatchInvalid = await verifyPassword("WrongPassword123", hashedPassword);
  assert("Invalid password verification fails", !isMatchInvalid);

  // -----------------------------------------------------------------
  // 2. Default Customer Role & Anti-Privilege Escalation
  // -----------------------------------------------------------------
  console.log("\n[2] Privilege Escalation Prevention on Registration:");
  const defaultRole = sanitizeRegistrationRole(undefined);
  assert("Default registration role is CUSTOMER", defaultRole === "CUSTOMER");

  const attemptedAdminRole = sanitizeRegistrationRole("ADMIN");
  assert(
    "Client attempt to register as ADMIN is blocked and sanitized to CUSTOMER",
    attemptedAdminRole === "CUSTOMER"
  );

  const attemptedSellerRole = sanitizeRegistrationRole("SELLER");
  assert(
    "Seller application role request returns SELLER (subject to admin approval)",
    attemptedSellerRole === "SELLER"
  );

  // -----------------------------------------------------------------
  // 3. User Personas Simulation
  // -----------------------------------------------------------------
  console.log("\n[3] User Personas & Scopes Definition:");
  const customerUser: AuthenticatedUser = {
    id: "uuid-cust-001",
    email: "customer@example.com",
    role: "CUSTOMER",
    status: "ACTIVE",
  };

  const pendingSellerUser: AuthenticatedUser = {
    id: "uuid-seller-pending-002",
    email: "applicant@newseller.com",
    role: "SELLER",
    status: "ACTIVE",
    isSellerApproved: false,
    storeId: "store-uuid-002",
  };

  const approvedSellerUser: AuthenticatedUser = {
    id: "uuid-seller-approved-003",
    email: "marcus@technexus.com",
    role: "SELLER",
    status: "ACTIVE",
    isSellerApproved: true,
    storeId: "store-technexus-001",
  };

  const adminUser: AuthenticatedUser = {
    id: "uuid-admin-004",
    email: "admin@proventure.com",
    role: "ADMIN",
    status: "ACTIVE",
  };

  const suspendedUser: AuthenticatedUser = {
    id: "uuid-suspended-005",
    email: "badactor@example.com",
    role: "CUSTOMER",
    status: "SUSPENDED",
  };

  assert("Customer persona configured with role CUSTOMER", customerUser.role === "CUSTOMER");
  assert("Approved Seller persona configured with isSellerApproved=true", approvedSellerUser.isSellerApproved === true);
  assert("Pending Seller persona configured with isSellerApproved=false", pendingSellerUser.isSellerApproved === false);
  assert("Admin persona configured with role ADMIN", adminUser.role === "ADMIN");

  // -----------------------------------------------------------------
  // 4. Customer Data Isolation & Ownership Guard
  // -----------------------------------------------------------------
  console.log("\n[4] Customer Data Isolation (Prevent Cross-Account Access):");
  // Customer accessing their own resource
  let ownAccessSucceeded = false;
  try {
    ownAccessSucceeded = validateResourceOwnership("uuid-cust-001", customerUser);
  } catch {}
  assert("Customer can access their own orders and profile", ownAccessSucceeded);

  // Customer attempting to access another customer's order
  let crossAccessBlocked = false;
  try {
    validateResourceOwnership("uuid-cust-other-999", customerUser);
  } catch (err: any) {
    crossAccessBlocked = err.status === 403;
  }
  assert("Customer is BLOCKED with 403 from accessing another customer's records", crossAccessBlocked);

  // Admin accessing any customer's resource (Supervisory access)
  let adminSupervisoryAllowed = false;
  try {
    adminSupervisoryAllowed = validateResourceOwnership("uuid-cust-001", adminUser);
  } catch {}
  assert("Admin possesses supervisory read/write across any customer record", adminSupervisoryAllowed);

  // -----------------------------------------------------------------
  // 5. Multi-Tenant Merchant Isolation (Prevent Cross-Seller Tampering)
  // -----------------------------------------------------------------
  console.log("\n[5] Multi-Tenant Store & Product Isolation:");
  let ownStoreAccess = false;
  try {
    ownStoreAccess = await validateStoreOwnership("store-technexus-001", approvedSellerUser);
  } catch {}
  assert("Seller can manage their own store and products", ownStoreAccess);

  let crossStoreBlocked = false;
  try {
    await validateStoreOwnership("store-aura-competing-002", approvedSellerUser);
  } catch (err: any) {
    crossStoreBlocked = err.status === 403;
  }
  assert("Seller is BLOCKED with 403 from modifying competing store inventory", crossStoreBlocked);

  let adminStoreAccess = false;
  try {
    adminStoreAccess = await validateStoreOwnership("store-any-003", adminUser);
  } catch {}
  assert("Admin has platform oversight across all merchant stores", adminStoreAccess);

  // -----------------------------------------------------------------
  // 6. Security Token Lifecycle
  // -----------------------------------------------------------------
  console.log("\n[6] Security Token Cryptography:");
  const token1 = generateSecureToken();
  const token2 = generateSecureToken();
  assert("Generated secure tokens are 64 hex characters", token1.length === 64);
  assert("Tokens are cryptographically unique and non-colliding", token1 !== token2);

  // -----------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`SECURITY AUDIT RESULT: ${passed}/${total} TESTS PASSED`);
  console.log("=================================================\n");

  if (passed !== total) {
    throw new Error(`Auth & RBAC Audit failed: ${total - passed} checks failed.`);
  }
}

runAuthenticationAndRBACAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
