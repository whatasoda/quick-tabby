#!/usr/bin/env bun
/**
 * Version bump script for QuickTabby
 *
 * Usage:
 *   bun run bump <version>
 *   bun run bump patch|minor|major
 *   bun run bump 1.2.3
 *
 * This script:
 * 1. Updates version in package.json, manifest.json, website/package.json
 * 2. Creates a new branch: release/v<version>
 * 3. Commits the changes
 * 4. Creates a PR using gh CLI
 */

import { $ } from "bun";

const VERSION_FILES = ["package.json", "manifest.json", "website/package.json"];

function parseVersion(version: string): [number, number, number] {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return [
    Number.parseInt(match[1], 10),
    Number.parseInt(match[2], 10),
    Number.parseInt(match[3], 10),
  ];
}

function bumpVersion(current: string, type: "patch" | "minor" | "major"): string {
  const [major, minor, patch] = parseVersion(current);
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}

async function getCurrentVersion(): Promise<string> {
  const pkg = await Bun.file("package.json").json();
  return pkg.version;
}

async function updateVersion(file: string, newVersion: string): Promise<void> {
  const content = await Bun.file(file).json();
  content.version = newVersion;
  await Bun.write(file, `${JSON.stringify(content, null, 2)}\n`);
}

async function main() {
  const arg = process.argv[2];

  if (!arg) {
    console.error("Usage: bun run bump <patch|minor|major|x.y.z>");
    process.exit(1);
  }

  // Ensure working directory is clean
  const status = await $`git status --porcelain`.text();
  if (status.trim()) {
    console.error("Error: Working directory is not clean. Commit or stash changes first.");
    process.exit(1);
  }

  // Ensure on main branch
  const currentBranch = (await $`git branch --show-current`.text()).trim();
  if (currentBranch !== "main") {
    console.error("Error: Must be on main branch to create release.");
    process.exit(1);
  }

  // Pull latest changes
  console.log("Pulling latest changes from main...");
  await $`git pull origin main`;

  const currentVersion = await getCurrentVersion();
  let newVersion: string;

  if (["patch", "minor", "major"].includes(arg)) {
    newVersion = bumpVersion(currentVersion, arg as "patch" | "minor" | "major");
  } else {
    // Validate version format
    parseVersion(arg);
    newVersion = arg;
  }

  console.log(`Bumping version: ${currentVersion} -> ${newVersion}`);

  // Create branch
  const branchName = `release/v${newVersion}`;
  console.log(`Creating branch: ${branchName}`);
  await $`git checkout -b ${branchName}`;

  // Update all version files
  for (const file of VERSION_FILES) {
    console.log(`Updating ${file}...`);
    await updateVersion(file, newVersion);
  }

  // Commit changes
  console.log("Committing changes...");
  await $`git add ${VERSION_FILES}`;
  await $`git commit -m ${`chore: bump version to ${newVersion}`}`;

  // Push branch
  console.log("Pushing branch...");
  await $`git push -u origin ${branchName}`;

  // Create PR
  console.log("Creating PR...");
  const prBody = `## Release v${newVersion}

This PR bumps the version to ${newVersion}.

### Checklist
- [ ] Version numbers updated in all files
- [ ] Ready for release

After merging, the release workflow will:
1. Create git tag v${newVersion}
2. Build extension
3. Create draft GitHub release with ZIP artifact`;

  await $`gh pr create --title ${`chore: release v${newVersion}`} --body ${prBody}`;

  console.log(`\nDone! PR created for release v${newVersion}`);
  console.log("After merging, the release workflow will create the tag and draft release.");
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
