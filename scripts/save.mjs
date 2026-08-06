// Interactive helper: asks what changed, adds a numbered entry to
// Change Log.md, commits everything with that same description, and
// pushes to GitHub (which triggers a Vercel deployment automatically).
//
// Run with: npm run save

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const root = process.cwd();
const changelogPath = path.join(root, "Change Log.md");

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

async function nextVersionNumber(changelog) {
  const numbers = [...changelog.matchAll(/^###\s*Version\s*(\d+)/gm)].map((match) => Number(match[1]));
  const highest = numbers.length > 0 ? Math.max(...numbers) : 0;
  return highest + 1;
}

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log("What did you change? Write one line per change; leave a blank line when done.\n");

  const lines = [];
  for (;;) {
    const line = await rl.question(lines.length === 0 ? "> " : "> ");
    if (line.trim() === "") break;
    lines.push(line.trim());
  }

  if (lines.length === 0) {
    console.log("Nothing entered — cancelled. No changes were saved or committed.");
    rl.close();
    return;
  }

  const changelog = await readFile(changelogPath, "utf8");
  const version = await nextVersionNumber(changelog);
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const entry = `### Version ${version} — ${dateLabel}\n\n${lines.map((line) => `- ${line}`).join("\n")}\n\n`;
  const marker = "## Version history\n\n";
  const insertAt = changelog.indexOf(marker);
  const updatedChangelog =
    insertAt === -1
      ? `${changelog.trim()}\n\n${entry}`
      : changelog.slice(0, insertAt + marker.length) + entry + changelog.slice(insertAt + marker.length);

  const relabeledChangelog = updatedChangelog.replace(
    /^Last updated: .+$/m,
    `Last updated: ${dateLabel}`,
  );

  await writeFile(changelogPath, relabeledChangelog);
  console.log(`\nAdded Version ${version} to Change Log.md.`);

  const commitMessage = `Version ${version}: ${lines[0]}`;

  console.log("\nStaging and committing all changes...");
  await runCommand("git", ["add", "-A"]);
  await runCommand("git", ["commit", "-m", commitMessage]);
  console.log(`Committed as: "${commitMessage}"`);

  const wantsPush = (await rl.question("\nPush to GitHub now, to go live? (y/n) ")).trim().toLowerCase();
  rl.close();

  if (wantsPush === "y" || wantsPush === "yes") {
    console.log("\nPushing...");
    try {
      const output = await runCommand("git", ["push"]);
      if (output) console.log(output);
      console.log("\nPushed. Vercel will deploy this automatically — check the Vercel dashboard in a minute or two for the live URL.");
    } catch (error) {
      console.error("\nPush failed. Your commit is saved locally, so nothing is lost.");
      console.error("If this is your first time pushing this repo, you likely need to run:");
      console.error("  git remote add origin <your-github-repo-url>");
      console.error("  git push -u origin main");
      console.error(`\nDetails: ${error.message}`);
    }
  } else {
    console.log("\nCommitted locally but not pushed. Run `git push` yourself whenever you're ready to go live.");
  }
}

main().catch((error) => {
  console.error("\nSomething went wrong:", error.message);
  process.exitCode = 1;
});
