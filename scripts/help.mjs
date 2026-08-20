// Prints a plain-English list of the commands you might need, with a one-line
// description of what each one does. Run with: npm run help

const commands = [
  {
    cmd: "npm run dev",
    desc: "Starts the site on your Mac at http://localhost:3000, with the pencil-icon editor and Sync Gallery button turned on.",
  },
  {
    cmd: "npm run gallery:sync",
    desc: "Reads Gallery Originals, resizes any new or changed photos, and rebuilds every gallery page and the Collections index. Run this after adding photos or moving them between collections.",
  },
  {
    cmd: "npm run save",
    desc: "Records what changed in Change Log.md, commits everything, and offers to push it live. This is the normal way to publish any change.",
  },
  {
    cmd: "npm run collection:add",
    desc: "Optional shortcut: creates an empty, named Gallery Originals folder ready for new photos. Usually not needed.",
  },
  {
    cmd: "npm run collection:cover",
    desc: "Terminal alternative to the pencil icon's cover-photo picker — asks which collection, which photo, and how to crop it.",
  },
  {
    cmd: 'npm run trim-filenames -- "Gallery Originals/Some Folder" "word"',
    desc: "Strips a word (and everything after it) from every filename in a folder, one rename at a time so you can accept, edit, or skip each one.",
  },
  {
    cmd: "npm run build",
    desc: "Checks that the site builds cleanly for production, without actually publishing anything. Mainly for troubleshooting.",
  },
  {
    cmd: "npm run lint",
    desc: "Checks the code for style/quality issues. Mainly for troubleshooting.",
  },
  {
    cmd: "npm start",
    desc: "Runs a production build locally, the same way the live site runs. Mainly for troubleshooting.",
  },
];

console.log("\nCommands you might need — run any of these from this same window:\n");

for (const { cmd, desc } of commands) {
  console.log(`  ${cmd}`);
  console.log(`      ${desc}\n`);
}

console.log("Full details are in README.md if you want more.\n");
