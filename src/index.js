#!/usr/bin/env node

/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import degit from "degit";

// --- Args
const repo = "git@github.com:vuelessjs/vueless-quickstart.git";
const projectName = process.argv[2] || "vueless-quickstart";
const targetDir = path.join(process.cwd(), projectName);

// --- Clone repo
if (fs.existsSync(targetDir)) {
  console.error(`❌ Directory "${projectName}" already exists!`);
  process.exit(1);
}

console.log(`✨ Cloning ${repo} into ${projectName}...`);
const emitter = degit(`${repo}#main`, {
  cache: false,
  force: true,
  verbose: true,
});

await emitter.clone(targetDir);

console.log(`\n✨ Installing dependencies...`);
execSync(`npm install`, { cwd: targetDir, stdio: "inherit" });

console.log(`\n✨ Initializing project...`);
const envTarget = path.join(targetDir, ".env.local");
const envSource = path.join(targetDir, ".env.local.example");

fs.copyFileSync(envSource, envTarget);

// --- Done
console.log(`✅ Project ready!`);
console.log(`cd ${projectName}`);
console.log("npm run dev");
