import { spawn } from "node:child_process";
import path from "node:path";

const testFiles = [
  "tests/auth.test.ts",
  "tests/authorization-rbac.test.ts",
  "tests/product-crud.test.ts",
  "tests/cart-checkout.test.ts",
  "tests/payment-security.test.ts",
  "tests/order-lifecycle.test.ts",
];

console.log("=================================================");
console.log("🚀 EXECUTING PROVENTURE MARKETPLACE TEST SUITE");
console.log("=================================================\n");

let passedSuites = 0;
let failedSuites = 0;

for (const testFile of testFiles) {
  console.log(`\n▶ Running ${testFile}...`);
  const exitCode = await new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["--experimental-strip-types", "--loader", "./scripts/resolve-hook.mjs", testFile],
      { stdio: "inherit", shell: false }
    );
    child.on("close", resolve);
  });

  if (exitCode === 0) {
    passedSuites++;
  } else {
    failedSuites++;
  }
}

console.log("\n=================================================");
console.log(`TEST RUN COMPLETE: ${passedSuites} Passed, ${failedSuites} Failed`);
console.log("=================================================");

if (failedSuites > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
