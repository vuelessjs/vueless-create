#!/usr/bin/env node

/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import degit from "degit";
import prompts from "prompts";
import { execSync } from "child_process";

/* --- Config --- */
const repos = {
  js: "git@github.com:vuelessjs/vueless-quickstart.git",
  ts: "git@github.com:vuelessjs/vueless-quickstart-ts.git",
};

/* --- Ask questions --- */
const { projectName, variant, pm } = await prompts([
  {
    type: "text",
    name: "projectName",
    message: "Project name:",
    initial: "vueless-quickstart",
  },
  {
    type: "select",
    name: "variant",
    message: "Choose a starter template:",
    choices: [
      { title: "TypeScript", value: "ts" },
      { title: "JavaScript", value: "js" },
    ],
    initial: 0,
  },
  {
    type: "select",
    name: "pm",
    message: "Choose a package manager:",
    choices: [
      { title: "npm", value: "npm" },
      { title: "yarn", value: "yarn" },
      { title: "pnpm", value: "pnpm" },
      { title: "bun", value: "bun" },
    ],
    initial: 0,
  },
]);

const targetDir = path.join(process.cwd(), projectName);

/* --- Guard: directory exists --- */
if (fs.existsSync(targetDir)) {
  console.error(`❌ Directory "${projectName}" already exists!`);
  process.exit(1);
}

/* --- Clone repo from main branch --- */
console.log(`✨ Cloning "${repos[variant]}" into "${projectName}"...`);
const emitter = degit(`${repos[variant]}#main`, {
  cache: false,
  force: true,
  verbose: true,
});

await emitter.clone(targetDir);

/* --- Install dependencies --- */
console.log(`📦 Installing dependencies with ${pm}...`);
execSync(`${pm} install`, { cwd: targetDir });

/* --- Initialize project --- */
console.log("🚀 Initializing project...");

// Remove vueless config files
const vuelessConfigTs = path.join(targetDir, "vueless.config.ts");
const vuelessConfigJs = path.join(targetDir, "vueless.config.js");

if (fs.existsSync(vuelessConfigTs)) fs.unlinkSync(vuelessConfigTs);
if (fs.existsSync(vuelessConfigJs)) fs.unlinkSync(vuelessConfigJs);

// Remove package-lock.json if not using npm
if (pm !== "npm") {
  const packageLockPath = path.join(targetDir, "package-lock.json");

  if (fs.existsSync(packageLockPath)) fs.unlinkSync(packageLockPath);
}

const initCommands = {
  npm: "npx vueless init",
  yarn: "yarn vueless init --yarn",
  pnpm: "pnpm exec vueless init --pnpm",
  bun: "bunx vueless init",
};

execSync(initCommands[pm], { cwd: targetDir });

// Create .env.local
const envTarget = path.join(targetDir, ".env.local");
const envSource = path.join(targetDir, ".env.local.example");

if (fs.existsSync(envSource)) {
  fs.copyFileSync(envSource, envTarget);
}

/* --- Done --- */
console.log(`\n🎉 Project ready!`);
console.log(`👉 cd ${projectName} && ${pm} run dev`);
