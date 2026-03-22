/**
 * Launches Vite without relying on node_modules/.bin shims (breaks when the
 * project path contains & on Windows cmd).
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const frontendDir = path.dirname(fileURLToPath(import.meta.url));
const viteJs = path.join(frontendDir, "..", "node_modules", "vite", "bin", "vite.js");
const extraArgs = process.argv.slice(2);

const child = spawn(process.execPath, [viteJs, ...extraArgs], {
  cwd: frontendDir,
  stdio: "inherit",
  shell: false,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
