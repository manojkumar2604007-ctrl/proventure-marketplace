import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const subpath = specifier.slice(2);
    const candidates = [
      path.join(srcDir, subpath),
      path.join(srcDir, subpath + ".ts"),
      path.join(srcDir, subpath + ".tsx"),
      path.join(srcDir, subpath + ".js"),
      path.join(srcDir, subpath, "index.ts"),
      path.join(srcDir, subpath, "index.tsx"),
      path.join(srcDir, subpath, "index.js"),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) {
        return nextResolve(pathToFileURL(c).href, context);
      }
    }
  }

  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
    try {
      const parentFilePath = fileURLToPath(context.parentURL);
      const dir = path.dirname(parentFilePath);
      const candidates = [
        path.resolve(dir, specifier + ".ts"),
        path.resolve(dir, specifier + ".tsx"),
        path.resolve(dir, specifier + ".js"),
        path.resolve(dir, specifier, "index.ts"),
        path.resolve(dir, specifier, "index.tsx"),
        path.resolve(dir, specifier, "index.js"),
      ];

      for (const c of candidates) {
        if (fs.existsSync(c) && fs.statSync(c).isFile()) {
          return nextResolve(pathToFileURL(c).href, context);
        }
      }
    } catch {
      // ignore
    }
  }

  return nextResolve(specifier, context);
}
