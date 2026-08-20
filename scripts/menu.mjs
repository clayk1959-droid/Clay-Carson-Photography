// Numbered menu of the commands you might need. Pick a number, it runs that
// command, then shows the menu again so you can run another one -- pick 0 to
// exit. Run with: npm run menu

import { spawn } from "node:child_process";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const commands = [
  { label: "Start the site on your Mac (npm run dev)", run: ["npm", "run", "dev"] },
  { label: "Sync new/changed photos (npm run gallery:sync)", run: ["npm", "run", "gallery:sync"] },
  { label: "Save & publish your changes (npm run save)", run: ["npm", "run", "save"] },
  { label: "Add a new empty collection (npm run collection:add)", run: ["npm", "run", "collection:add"] },
  { label: "Set a collection's cover photo (npm run collection:cover)", run: ["npm", "run", "collection:cover"] },
  { label: "Clean up filenames in a folder (npm run trim-filenames)", run: "trim" },
  { label: "Check the site builds cleanly (npm run build)", run: ["npm", "run", "build"] },
  { label: "Check code quality (npm run lint)", run: ["npm", "run", "lint"] },
  { label: "Run a local copy of the live site (npm start)", run: ["npm", "start"] },
];

async function ask(question) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

function printMenu() {
  console.log("\nWhat do you want to do?\n");
  commands.forEach((c, i) => console.log(`  ${i + 1}. ${c.label}`));
  console.log("  0. Exit\n");
}

function runChild(args) {
  return new Promise((resolve) => {
    // Ctrl+C during a running command (like npm run dev) should stop that
    // command and return to this menu, not quit the whole menu script.
    const onSigint = () => {};
    process.on("SIGINT", onSigint);

    const child = spawn(args[0], args.slice(1), { stdio: "inherit", cwd: process.cwd() });
    child.on("close", () => {
      process.off("SIGINT", onSigint);
      resolve();
    });
  });
}

async function main() {
  for (;;) {
    printMenu();
    const answer = await ask("Enter a number: ");

    if (answer === "0" || answer.toLowerCase() === "exit") break;

    const choice = commands[Number(answer) - 1];
    if (!choice) {
      console.log("\nNot a valid choice — try again.");
      continue;
    }

    if (choice.run === "trim") {
      const folder = await ask('Which folder (e.g. "Gallery Originals/Some Folder")? ');
      const word = await ask("Strip which word (and everything after it)? ");
      if (!folder || !word) {
        console.log("\nCancelled — need both a folder and a word.");
        continue;
      }
      await runChild(["npm", "run", "trim-filenames", "--", folder, word]);
    } else {
      await runChild(choice.run);
    }
  }

  console.log("\nBye!");
}

main();
