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

/* --- Initialize project --- */
console.log("🚀 Initializing project...");

/* 1. Remove vueless config files */
const vuelessConfigTs = path.join(targetDir, "vueless.config.ts");
const vuelessConfigJs = path.join(targetDir, "vueless.config.js");

if (fs.existsSync(vuelessConfigTs)) fs.unlinkSync(vuelessConfigTs);
if (fs.existsSync(vuelessConfigJs)) fs.unlinkSync(vuelessConfigJs);

/* 2. Install dependencies */
execSync("npm install", { cwd: targetDir });

/* 3. Initialize Vueless */
const initCommands = {
  npm: "npx vueless init",
  yarn: "npx vueless init --yarn",
  pnpm: "npx vueless init --pnpm",
  bun: "npx vueless init",
};

execSync(initCommands[pm], { cwd: targetDir });

/* 4. Add the ` packageManager ` field to package.json */
const packageJsonPath = path.join(targetDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

try {
  const version = execSync(`${pm} --version`, { encoding: "utf8" }).trim();

  packageJson.packageManager = `${pm}@${version}`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  // eslint-disable-next-line no-unused-vars
} catch (error) {
  console.warn(`⚠️ Could not detect ${pm} version, skipping packageManager field`);
}

/* 5. Set environment variable to ensure the correct package manager is used */
const env = { ...process.env, npm_config_user_agent: `${pm}` };

/* 6. Remove `package-lock.json` if not using npm */
if (pm !== "npm") {
  const packageLockPath = path.join(targetDir, "package-lock.json");

  if (fs.existsSync(packageLockPath)) {
    fs.unlinkSync(packageLockPath);
  }
}

/* 7. Create .env.local */
const envTarget = path.join(targetDir, ".env.local");
const envSource = path.join(targetDir, ".env.local.example");

if (fs.existsSync(envSource)) {
  fs.copyFileSync(envSource, envTarget);
}

/* --- Install dependencies --- */
console.log(`📦 Installing dependencies, it may take some time...`);
execSync(`${pm} install`, { cwd: targetDir, env });

/* --- Done --- */
console.log(`\n🎉 Project ready!`);
console.log(`👉 cd ${projectName} && ${pm} run dev`);
