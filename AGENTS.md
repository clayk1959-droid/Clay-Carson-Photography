# Clay Carson Photography project instructions

## Authoritative locations

- Treat `/Volumes/Samsung_T5/Chatgpt workspace/Clay Carson Photography` as the authoritative website project.
- Treat `/Volumes/Samsung_T5/Chatgpt workspace/Clay Carson Photography/Gallery Originals` as Clay's user-managed working source for new and updated gallery photographs.
- Never optimize, overwrite, rename, move, or delete photographs inside `Gallery Originals`. Read or copy from it to generate the website's optimized files in `public/galleries` and `public/gallery-thumbnails`.
- Treat `/Volumes/Samsung_T5/Website` as the protected source of gallery originals.
- Never alter, overwrite, rename, move, or delete the gallery originals during website synchronization or optimization.
- Write project-generated working, staging, archive, and temporary files to the Samsung drive, never to the startup drive.

## Changelog workflow

- Maintain `Change Log.md` in the project root as part of every Sites version workflow.
- When a Sites version is saved, add its exact version number, date, and a concise description of the changes. Obtain the version number from the Sites response; never guess it.
- Mark a saved version as **Saved, not live** until its production deployment succeeds.
- After a successful deployment, mark that version as **Currently live** and change the previously live version to a normal saved version.
- Record meaningful performance, gallery, content, navigation, or storage changes when relevant.
- Update the changelog before the final handoff to the user.
- Do not report a version as live until Sites confirms that deployment succeeded.

## Live deployment handoff

- After every successful live Sites deployment, show `Change Log.md` in the existing Codex right-side preview pane.
- Load the confirmed live site URL into the current tab of Clay's existing Safari window.
- Do not open a new Safari window for the live-version handoff.
