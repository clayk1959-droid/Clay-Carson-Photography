# Clay Carson Photography — Change Log

Last updated: Thursday, August 27, 2026

## Current status

- Hosted on Vercel, deployed from GitHub. Every push to the main branch goes
  live automatically within a minute or two.
- Full deployment history and one-click rollback to any previous version are
  available in the Vercel dashboard — that replaces the old "saved, not live"
  / "currently live" tracking below, which was specific to ChatGPT Sites.
- **Site access:** Public
- **Gallery originals:** `Gallery Originals` folder in the project, with
  `/Volumes/Samsung_T5/Website` checked first for metadata when present.

## Version history

### Version 129 — Thursday, August 27, 2026

- Search results can now be edited directly, not just viewed. Searching People/Event tags is mainly useful for finding and fixing a typo, but there was no way to actually edit the photo you found — you had to leave search, find the right gallery, and hunt for the same photo again by sight. A new "Edit this photo" link on a search result now opens straight into that exact photo's edit form.
- Along the way, tracked down a real, older data problem this surfaced: one photo in "Janet Buys a car" is actually a Nova Scotia sunset that's been sitting there, mistagged, since Nova Scotia was first added to the site over a month ago — unrelated to anything recent, just finally visible now that search and editing both work correctly. Belongs in Nova Scotia instead; still needs to be moved and cleaned up.

### Version 128 — Thursday, August 27, 2026

- Photos can now have their People and Event tags edited directly, the same way captions and dates already could — no more needing to go back and fix the original file just to correct a typo or clean up an inconsistent name. New fields in the photo edit form, comma-separated to match how you'd naturally type multiple names.
- Fixed a real bug found while adding those fields: the photo edit window had no way to scroll on a shorter screen, so the Save button (and everything below it) could become completely unreachable. Now scrolls properly regardless of how many fields it holds.

### Version 127 — Thursday, August 27, 2026

- A private gallery's cover photo now shows on its card to every visitor, not just people with access — your call, since a blank card next to real photos on every other gallery looked wrong. The photo is reachable only through a long, random, one-of-a-kind link that has nothing to do with the gallery's name or file names, so nobody can find or guess their way to it — a narrower guarantee than the real login check protecting the rest of the gallery, but nobody stumbles onto it by chance either.

### Version 126 — Thursday, August 27, 2026

- Fixed a real gap: the editor (you, or anyone logged into the remote editor) couldn't actually view or manage a private gallery's own photos without first going through the same family request/approval process as an outside visitor. The editor now always sees every gallery, private or not — the access grant only applies to family visitors on the real site, never to the person managing privacy in the first place.

### Version 125 — Wednesday, August 26, 2026

- Added a self-serve "resend my login link" option to a private gallery's request page. Until now, switching devices or clearing your browser's cookies meant submitting a whole new access request and waiting on approval again, even though you were already granted access — now you just re-enter your email and get a fresh login link immediately, no approval needed.

### Version 124 — Wednesday, August 26, 2026

- Fixed two real bugs found while building private galleries. The admin page's Revoke button (and its new companion, the private-gallery access checkboxes) had been silently broken since Revoke first shipped — clicking it always failed, due to how the login cookie was being read back. Both now work correctly. Also found and replaced an expired Resend sending key that was silently blocking every private-access email — request notifications and approval links — from going out. New key confirmed working with a real test send.

### Version 123 — Wednesday, August 26, 2026

- Private galleries are live. Any gallery can be marked private from the editor — it stays visible in the public Galleries list with no lock icon, but clicking into it asks for a name and email instead of showing photos. You approve access from the request email, or with a new one-click checkbox grid on the admin page for people already registered.
- Closed two real privacy gaps as part of this, not just gating the page itself: a private gallery's photos no longer show up in the sitewide person/event search, and the actual image files moved out of the folder the site serves publicly — there's no way to see them by guessing or sharing a direct link, since every single photo request re-checks who's asking.
- Tested end-to-end against a full copy of the real database before anything went live, then verified again for real on the live site: submitted a real access request, approved it from a real email, and confirmed the login and gallery view worked correctly.

### Version 122 — Tuesday, August 25, 2026

- Hiding a photo used to permanently delete its actual image the next time the site synced, and wiped its caption/date down to nothing — there was no way to see what a hidden photo even was afterward. The only undo, "Reset to auto-detected," only ever worked locally on your own Mac, not the remote editor you and Barry actually use.
- Hidden photos now keep their real image and caption/date, and a new "Hidden Photos" button shows how many are hidden in a gallery and lets you browse and unhide them from wherever you're working — remote or local — without losing any edits, separate from the full reset. Retroactively restored every photo that had already been hidden and deleted across all four galleries.

### Version 121 — Tuesday, August 25, 2026

- Fixed a real bug: a tester submitting the same email with different capitalization on a retry (e.g. a phone auto-capitalizing it) could create a duplicate account instead of being recognized as the same person — caught this actually happening to one tester. Emails are now normalized to lowercase the moment a request comes in, so this can't happen again. Also cleaned out a handful of leftover test rows from earlier debugging sessions that had accumulated in the private-access admin panel.

### Version 120 — Monday, August 24, 2026

- Fixed editor login breaking entirely after switching to email addresses in Version 119 — the session cookie's internal format used a period as a separator, and an email address like "barthur.ar@gmail.com" contains a literal period that corrupted it. Fixed the underlying format so this can't happen regardless of what a login name looks like; verified an email-address login now works correctly start to finish.

### Version 119 — Monday, August 24, 2026

- Editor login names switched from first names to email addresses (clayk1959@gmail.com / barthur.ar@gmail.com), per request.

### Version 118 — Monday, August 24, 2026

- Editor collaborators now get their own name + password instead of sharing your one password. Two real benefits beyond not sharing a password: changing one person's password only signs that person out, not everyone; and every edit made through the editor now records who made it, instead of every action looking identical to your own.

### Version 117 — Monday, August 24, 2026

- Fixed the cover-photo picker silently wiping a gallery's pin/creation-date info (added in Version 115) any time a cover photo was changed afterward — it was overwriting that gallery's whole metadata record instead of updating just the cover fields. Restored the dates that had been wiped; can't recur now.

### Version 116 — Monday, August 24, 2026

- Fixed the "Reorder Photos" grid showing all the thumbnails jumbled and overlapping on mobile, in both orientations — a CSS sizing conflict was collapsing every row down to a sliver instead of the photo's actual height. Switched to a more old-fashioned but bulletproof way of keeping the thumbnails square that doesn't have that problem.
- Fixed dragging to reorder also swallowing ordinary scrolling on touch — any swipe was being treated as picking up a photo, which is what caused the jumbling above to look like it was happening live as you tried to scroll. A quick swipe now scrolls normally; holding still on a photo for a moment is what picks it up to drag.

### Version 115 — Monday, August 24, 2026

- Galleries index now sorts newest gallery first, based on each gallery's actual folder creation date — captured once the first time a gallery is synced and frozen from then on, so it can't shift later even if the folder itself gets touched again. Existing galleries were backfilled from their current folder dates.
- Added a "Nudge to Top" toggle on each gallery card, editor-mode only (not visible on the public site) — for when a significant update to an older gallery should surface it again. Nudged galleries sort above everything else, most-recently-nudged on top; click again to un-nudge.

### Version 114 — Sunday, August 23, 2026

- Fixed the editor's "Reorder Photos" drag-to-sort grid not working at all on touch devices (iPad). It was built on the browser's native drag-and-drop, which is mouse-only and simply never activates on touch — rebuilt on a touch-and-mouse-compatible input system instead. Verified with both a real mouse drag and a simulated touch drag; also hardened against a rare error that could otherwise interrupt a drag mid-gesture.

### Version 113 — Sunday, August 23, 2026

- Refined the Version 112 iPad fix: it helped (button went from fully off-screen to mostly visible) but a real iPad still showed a small residual clip, since iPad Safari's toolbar doesn't collapse as predictably as an iPhone's. Switched to a more conservative measurement (the guaranteed-smallest possible screen size, as if the toolbar is always fully showing) — a few unused pixels when the toolbar happens to be tucked away, but the button can no longer get clipped regardless.

### Version 112 — Sunday, August 23, 2026

- Fixed the homepage "Start Looking" button getting pushed off the bottom of the screen on an iPad. The hero's height was based on a browser measurement that Mobile Safari calculates using the toolbar-collapsed screen size, taller than what's actually visible with the address bar showing — already fixed for phones, but a portrait iPad is wider than the breakpoint that fix was scoped to, so it slipped through. Fixed at the shared root instead of patching another breakpoint, so it can't recur at any width; phone sizing is untouched.

### Version 111 — Sunday, August 23, 2026

- Shrunk the Galleries index cards (cover photo, title, photo count) on desktop — they were oversized, so roughly halved their size (3 columns to 6) with the title and count text scaled down to match. Mobile and landscape-phone are untouched, both already have their own separately-tuned sizing.

### Version 110 — Sunday, August 23, 2026

- Reverted the text alert back to the carrier email-to-text gateway (see Version 108/109) after a push-notification alternative (ntfy) also failed to actually land on the phone, for reasons that weren't worth chasing further. Not guaranteed to arrive, but free, simple, and the email notification remains the real, reliable alert either way.

### Version 109 — Sunday, August 23, 2026

- Tried switching the access-request text alert to a push notification (via a free service called ntfy) after the carrier gateway appeared to silently drop the message. Confirmed the push itself sent successfully, but it didn't reach the phone reliably in practice — reverted in Version 110.

### Version 108 — Sunday, August 23, 2026

- Fixed the text alert added in Version 106 never actually sending: the code fired it off without waiting for it to finish, and the server can shut down the moment it responds — silently killing the send before it went out. Now waits for it properly.

### Version 107 — Sunday, August 23, 2026

- Fixed the approve/deny confirmation page (what you land on after clicking a link in the access-request notification) showing text so small it was unreadable on a phone. That page is built by hand rather than as a normal site page, so it was missing the tag that tells mobile browsers not to render it at desktop width and shrink it to fit — added that, and bumped the text size a bit for good measure.

### Version 106 — Sunday, August 23, 2026

- Access-request notifications now also send a short text message alongside the email, since email alone doesn't trigger a phone alert. Uses the carrier's email-to-text gateway rather than a separate paid service — free, and reuses the sending setup already in place. Best-effort: if it fails for any reason, the regular email notification still goes through as before.

### Version 105 — Sunday, August 23, 2026

- Homepage: added small dots centered under the rotating hero photos, one per photo in the current set, with the active one brighter — a passive indicator of where you are, especially useful once you've paused rotation by swiping or holding a finger on the photo. Not clickable, just a visual marker, and doesn't interfere with the swipe/hold touch handling.

### Version 104 — Sunday, August 23, 2026

- Fixed private-access emails silently failing to send: the code was ignoring the error Resend returns when a send is rejected, so a request or approval could look successful while the person never got anything — this is what happened to the first real tester. The two email sends now check for that error and report it honestly instead of pretending it worked.
- Verified a real sending domain (`mail.carsonmullerfamily.com`) with Resend and switched private-access emails to send from it. The previous sandbox address could only deliver to the site owner's own inbox — every other recipient was silently rejected, which was the actual root cause of the missing email above. Confirmed working end-to-end with a real delivery test.

### Version 103 — Sunday, August 23, 2026

- Added a `.vercelignore` file so deploys stop uploading the 3.2GB "Gallery Originals" folder — it's only used locally for syncing, never read by the live site, but was going out with every single deploy regardless. Speeds up every future deploy, main site and the private-access system alike.
- Shrunk gallery thumbnails from a 1200px max size down to 750px — they never render past ~350px on screen even on the widest desktop layout, so 1200px was serving several times more resolution than any screen actually shows. Cuts total thumbnail weight roughly in half (regenerated all 190 existing photos), with no visible quality difference at any size, including retina screens.

### Version 102 — Saturday, August 22, 2026

- Private-access test system: gave every page a real design (fonts, colors, layout matching the main site) instead of the bare, dev-only look it had — now presentable to invite real people to test. Doesn't touch or affect the public site in any way; the new styling lives entirely in its own file, only loaded on these pages.
- Private-access test system: landing page now uses Clay's own instructions and large folder icons (with a small lock badge on the protected one) instead of plain bordered boxes, and the "success" pages match wording and a closing note to match.

### Version 101 — Saturday, August 22, 2026

- Full-size photo viewer: added an iPad-width size step for the nav arrows (58px) — they'd been jumping straight from phone size to full desktop size, which looked oversized on a tablet screen. Best guess pending a real iPad check.
- Homepage: fixed the rotating hero showing the wrong (horizontal) photos when a large iPad is held upright — it was deciding by screen width alone, and a big iPad in portrait is wider than the phone cutoff. Now checks actual orientation too.
- Fixed the hamburger menu colliding with the banner text on a portrait iPad (the same gap in the phone-only fix that caused the hero bug above) — the header's left spacing now has a permanent minimum instead of a phone-specific patch, so this can't recur at some other in-between screen width later.
- Homepage: on touch devices, you can now swipe the rotating photo to jump to it directly, which pauses the rotation. Holding a finger on the photo keeps it paused; letting go resumes automatic rotation after 5 seconds (touching again before then cancels the resume and keeps it paused).
- Fixed the swipe feature above not actually responding to touch — the text-readability gradient overlay sat on top of the photo and silently absorbed every touch before it could reach the photo underneath.
- Turned off Safari's long-press "save/share this image" menu on the homepage hero photo, so holding a finger there to pause it doesn't also bring up that menu.
- Fixed holding a finger still on the hero photo sometimes jumping backward to the previous photo — a real hold isn't perfectly motionless, and slow natural drift over a couple seconds could accidentally look like a swipe. A swipe now also has to happen quickly to count, so a slow hold-and-drift no longer gets mistaken for one. (This alone didn't fully fix it — see below.)
- Turned off Safari's separate "long-press to pick up and drag this image" gesture on the hero photo — distinct from the save/share menu fixed earlier, this one could silently hijack a held touch partway through and hand back a distorted release event, which was the real cause of the jump above. Fully fixed this on iPad; a phone still needed more room for natural finger jitter, since the same physical drift covers more pixels on a smaller, denser screen — swipe distance now needs to be further to register there too.
- Shortened the pause-after-touch delay before the hero photo resumes auto-rotating (settled on 3.5 seconds) — and fixed it actually taking much longer than whatever this is set to, because the very first photo after resuming waited for a full normal rotation interval on top of the pause delay instead of advancing right away.

### Version 100 — Saturday, August 22, 2026

- Homepage: slowed the rotating hero photos down by half a second (2.75s → 3.25s per photo).
- Fixed photo dates being wrong on many photos — the sync script was reading a "last saved" timestamp instead of the photo's real capture date. Corrected 74 photos across Janet Buys a Car, Nova Scotia, and Rhine River Cruise (any date you've manually corrected yourself was left untouched). Also fixed a crash risk: reading very large scanned TIFFs for their date no longer loads the entire file into memory.

### Version 99 — Friday, August 21, 2026

- Password-protected the private-access admin page, reusing the same password as the pencil-icon editor rather than a separate one.

### Version 98 — Friday, August 21, 2026

- Private-access admin page: a table of every account and pending request, with a revoke/restore action per account, plus the underlying documentation for the whole system (see `Private Access Guide.md`).

### Version 97 — Friday, August 21, 2026

- Built the private-access test system: request → owner-approval email → one-time magic-link login → gated page, backed by its own Postgres database and Vercel Blob storage. Lives in the same codebase but only activates on a second, separate Vercel project — has no effect on the public site.

### Version 96 — Friday, August 21, 2026

- Homepage: Version 95 didn't fully fix it — a leftover minimum-height rule (sized for desktop) was still forcing the hero taller than the screen on some phones. Removed it for mobile, which should actually stop the scroll bounce this time.

### Version 95 — Friday, August 21, 2026

- Homepage: fixed the page feeling "touchy" — a slight scroll bounce would occasionally reveal a sliver of the footer for no reason as Safari's address bar showed/hid itself. The hero now tracks the actual visible screen size live instead of a fixed snapshot of it.

### Version 94 — Friday, August 21, 2026

- Homepage: sped up the rotating hero photos from every 5.5 seconds to every 2.75 seconds.
- Homepage: fixed the rotating photo showing huge/zoomed-in when rotating the phone to landscape — the hero box was being forced to a minimum height sized for portrait, taller than an actual landscape screen.

### Version 93 — Friday, August 21, 2026

- Fixed the longstanding bug where certain thumbnails would bleed full-frame past their intended border on iPhone (a Safari-specific quirk, not something visible in ordinary testing) — thumbnails now get their exact display size calculated directly instead of relying on a percentage Safari sometimes gets wrong.

### Version 92 — Friday, August 21, 2026

- Galleries page: the photo-count line under each gallery now matches the actual font "Galleries" uses on that page (it had been set to the wrong one), a touch smaller, tighter kerning, and tucked flush against the photo instead of floating below it.
- Galleries page: tightened the line spacing on gallery titles that wrap to multiple lines, and pulled the photo-count line much closer up under the title.
- Galleries page: switched gallery titles to a compact serif typeface (Zilla Slab) instead of the sans-serif font they'd been using.

### Version 91 — Friday, August 21, 2026

- Reverted Version 90's reload-flash change — it made the flash worse, not better.

### Version 90 — Friday, August 21, 2026

- Full-size photo viewer: tightened up the flash of the thumbnail grid that briefly showed when reloading or opening a link straight to a photo.

### Version 89 — Friday, August 21, 2026

- Full-size photo viewer: brought the site banner (hamburger menu + logo) into the viewer so it no longer feels like a separate bannerless page, and the photo now sits top-aligned beneath it instead of centered in open space. The banner tucks away again on phone-landscape to keep the photo as large as possible there.
- Nav arrows are now skinny, dark chevrons in a smaller, nearly-see-through white circle sized to fit them closely, overlaid right on the photo itself, and always precisely centered on the photo regardless of its shape or the screen size.
- "Back" and "Edit" moved off the photo into their own row above it, and "Back" is now bold and darker so it doesn't get lost against the page.
- Fixed pinch-to-zoom being blocked on the full-size photo (swipe-to-navigate had accidentally disabled it too).
- Reloading, or opening a link straight to a photo, now reopens that same photo instead of dropping back to the thumbnail grid.
- Bolded the thin labels and captions across the Galleries page, each gallery's thumbnail grid, and the full-size photo viewer (filter labels, photo counts, the "← Galleries" link, photo captions, "Edit") to match "Back" — the serif gallery/page titles were left as-is.
- Fixed a bug where a tall (portrait) photo's caption could get pushed off the bottom of the screen — the photo now always leaves room for its caption.
- Each gallery's page now keeps its banner pinned at the top while scrolling, so you don't have to scroll back up to navigate away.
- The photo count line under each gallery on the Galleries page now uses the same serif font as the "Galleries" heading above it.
- Full-size photo viewer: captions in phone-landscape now match the same size as portrait instead of being tiny.
- Full-size photo viewer: the caption's date now sits on its own line below the description, in smaller type, instead of being crammed onto one line together.
- Removed the Contact page and its hamburger-menu link.
- Shortened "photographs" to "Photos" everywhere it appears on the Galleries page and each gallery's page, to save space — new galleries created from here on will match automatically.

### Version 88 — Thursday, August 20, 2026

- Contact-sheet pages: lightened the thumbnail mat back down, removed the photo-number badges from thumbnails, and made the "← Galleries" link, collection name, and photo count bigger, bold, and darker so they stand out against the new background.

### Version 87 — Thursday, August 20, 2026

- Full-size photo viewer: bigger caption text, moved the previous/next arrows off the middle of the photo to a fixed spot near the top and made them bigger with no more circle behind them, and renamed "Close" to "Back" with the underline removed.
- Contact-sheet pages (an individual gallery's thumbnail grid): darkened the mat each photo sits in, and enlarged the collection title and "← Galleries" link.
- Galleries page and gallery-card titles bumped a bit larger again.

### Version 86 — Thursday, August 20, 2026

- Tightened the Galleries page for mobile: three collections per row, closer/bigger heading, filter dropdowns fit on one line, and everything holds up correctly when the phone is rotated to landscape instead of falling back to desktop sizing.
- Fixed the header hamburger menu colliding with the site name at phone-landscape widths, and moved it back to the left on mobile.
- The full-size photo viewer now uses the same light background as the rest of the site.
- Added two new collections: Norway Cruise and Rhine River Cruise.

### Version 85 — Thursday, August 20, 2026

- Replaced the top-right nav buttons with a hamburger menu (left on desktop, right on mobile), tightened and enlarged the homepage "Start Looking" button, and fixed the copyright footer's background to match the rest of the site.

### Version 84 — Thursday, August 20, 2026

- Going live with rotating home page photos with separate folders to Mobile and Desktop

### Version 83 — Thursday, August 20, 2026

- Redesigned the homepage hero for mobile: replaced the single static hero photo with a rotating, full-bleed set of 4-5 photos that fade into each other every ~7 seconds, plus a short tagline and a "Start Looking" button leading to the Galleries page. Uses two separate photo folders — `public/homepage/desktop` and `public/homepage/mobile` — with a crop and export size tuned to each screen, so phones only ever download the right-sized photo instead of a shrunk-down desktop one. Add, remove, or swap a photo by editing those two folders directly; see the README inside each, or the Site Guide's "Homepage hero photos" section. Removed `npm run hero:set` and the old single hero photo, both superseded by this.

### Version 82 — Tuesday, August 18, 2026

- Built the password-protected remote photo editor: a second Vercel deployment (same repo, `main` branch) where captions, dates, order, hidden status, and cover photos can be edited from anywhere, with saves committing straight to GitHub and going live the same way `npm run save` does today. Adding new photos, moving photos between collections, and full resyncs stay local-only. Production is unaffected unless the new `EDITOR_MODE` variable is deliberately set on that second project — see the README for one-time setup steps.

### Version 81 — Tuesday, August 18, 2026

- Added a simple copyright/usage notice to the bottom of every page — sets expectations that the photos are for family/friends, not for public reposting. Plain-English, not a legal document.

### Version 80 — Tuesday, August 18, 2026

- Galleries page and individual gallery (thumbnail) pages: same left/right alignment treatment as the homepage — the banner and nav now line up exactly with the top row of photos on wide monitors. About and Contact are unaffected.

### Version 79 — Tuesday, August 18, 2026

- Homepage header and photo now share one exact computed width instead of two separate formulas that happened to often match — the brand name's left edge and the nav's right edge always line up exactly with the photo's edges on wide monitors, whatever the window's proportions, and the photo always grows as large as possible without ever cropping or scrolling. Subpages (Galleries, About, Contact) are unaffected — their headers stay on the plain layout they've always had.

### Version 78 — Tuesday, August 18, 2026

- Homepage photo now actually grows to fill the header-aligned width on wide monitors (Versions 76-77 aligned an invisible container box but the photo itself was still shrinking inside it) — it expands to fill whichever dimension, width or height, runs out first, same idea as before but now genuinely matching the header edges whenever there's room

### Version 77 — Tuesday, August 18, 2026

- Lowered the width where the homepage header/photo alignment cap kicks in (Version 76 didn't actually engage until past ~1850px, wider than most stretched windows ever get) — now aligned starting around 1400px

### Version 76 — Tuesday, August 18, 2026

- Homepage header and photo edges now stay aligned on very wide desktop monitors instead of drifting apart — the whole header/photo band stops growing past ~1700px and centers itself, so extra room on huge screens becomes an even margin instead of a mismatch

### Version 75 — Tuesday, August 18, 2026

- Galleries page cards: tucked the title/photo-count text up close to the photo, cutting that gap roughly in half

### Version 74 — Tuesday, August 18, 2026

- Fixed People/Events checkboxes being invisible on iPhone — the checkmark was drawn in a way Safari doesn't support, so the box showed but never the check; it's built differently now so it shows on every browser

### Version 73 — Tuesday, August 18, 2026

- Homepage tagline ("Family photos and Events") now sits tucked directly under the brand wordmark in the header, instead of on its own bar

### Version 72 — Tuesday, August 18, 2026

- People/Events checkbox checkmarks are now solid black instead of the hard-to-see browser default

### Version 71 — Tuesday, August 18, 2026

- Fixed the People/Events checkbox dropdown on the Galleries page closing itself after every tap on iPhone — picking several names in a row now works as intended

### Version 70 — Tuesday, August 18, 2026

- People and Events filters on the Galleries page are now checkbox dropdowns instead of single-select — pick any combination of names and see photos matching any of them, with an "All" option to reset

### Version 69 — Tuesday, August 18, 2026

- Hero eyebrow line ("Family photos and Events") moved off the photo into its own bar under the header — it can never overlap the photo now, and sits tight against the header
- Lightbox caption text reduced 25%
- Untagged photos (no Alt Text) now caption with the gallery's own name instead of a raw camera filename
- Nova Scotia's folder rename, new event tag ("Nova Scotia Trip"), and the "Phyllis" spelling fix are synced in
- Tightened more header spacing on the Galleries index and individual gallery pages, and the gap before the thumbnail grid
- Tightened the line spacing when "Carson & Muller FAMILY" wraps to two lines on narrow screens
- Lightbox arrows are back on touch devices — floating over the photo instead of taking their own column, so they don't shrink it

### Version 68 — Tuesday, August 18, 2026

Functionality:
- Full-size photo viewer no longer loops past the first/last photo — arrows dim and disable at each end instead
- Arrows are hidden on phones/tablets (swipe already works there), which also lets the photo use the space they used to take up
- Renamed "Collection(s)" to "Gallery/Galleries" throughout the site's wording (nav, headings, buttons, etc.) — web addresses are unchanged
- Fixed the caption sitting apart from the photo instead of hugging it in the full-size viewer — this was also why the Janet Buys a Car and Nova Scotia galleries looked inconsistent with each other
- New: picking a person or event now shows an actual search — every matching photo across every gallery, not just which gallery cards to show — with a Clear button to get back to the normal Galleries page

Typography:
- Tightened several gaps (hero-to-header, header-to-title, title-to-grid) and removed the two homepage subtitle lines
- Gallery card names and photo counts are bigger and closer together; the rule line and "View collection" link are gone
- People/Events labels, photo counts, and the gallery back-link are now white instead of gray, with tighter spacing to match

### Version 67 — Tuesday, August 18, 2026

- Fixed the full-size photo appearing smaller instead of bigger when rotating the phone to landscape — the fixed padding/buttons around it were eating a big share of the little height landscape has to work with; they now shrink out of the way when height is scarce, so the photo fills the screen properly

### Version 66 — Monday, August 17, 2026

- Fixed the full-size photo border not fitting the photo on narrow/mobile screens (and not adjusting correctly on rotation) — it now always hugs the true photo edges regardless of screen shape

### Version 65 — Monday, August 17, 2026

- Light-table reorder thumbnails are 50% bigger, easier to see at a glance

### Version 64 — Monday, August 17, 2026

- Added drag-to-reorder: a "Reorder Photos" button opens every visible photo in a collection as small thumbnails, all on screen at once — drag one anywhere and the rest reflow live, like arranging slides on a light table. Click "Save order" to write the new order for all of them at once.

### Version 63 — Monday, August 17, 2026

- The cover-photo crop picker now shows a live preview (a real 4:5 box, same shape as the actual card) as you click each direction, instead of saving blind — a separate "Set as collection cover" button commits it once it looks right

### Version 62 — Monday, August 17, 2026

- Added a "Cover photo" picker to the pencil-icon editor — click a direction (e.g. left, center, top) on any photo to make it the collection's cover, cropped from that side. `npm run collection:cover` (Terminal) got the same upgrade — picks by filename now instead of a photo number, and lets you choose the crop direction too.
- Fixed the Janet Buys a Car collection's cover photo, which was cropping Janet almost entirely out of frame — now framed from the left

### Version 61 — Monday, August 17, 2026

- Extended the white photo border to the full-size lightbox view and the cover image on each Collections-page card, matching the contact sheet thumbnails

### Version 60 — Monday, August 17, 2026

- Contact sheet thumbnails now have a white border hugging each photo's actual edges, plus even breathing room on all sides instead of touching the box edge on the long side

### Version 59 — Monday, August 17, 2026

- Set the Nova Scotia collection's cover photo to the lighthouse shot
- Added `npm run collection:cover` — an interactive command to set a collection's cover photo without editing any code, closing the last gap in doing routine site maintenance without help

### Version 58 — Monday, August 17, 2026

- Deleting a collection's folder from Gallery Originals no longer crashes the sync — it now tears down that collection's page/images and removes it from the site automatically, the same way a new folder gets added automatically
- Added the Nova Scotia collection (73 photos)

### Version 57 — Saturday, August 8, 2026

- Hero photo now displays uncropped instead of cropped-and-scaled, and the fade-in animation no longer has a scale effect that made it look like a white border was fading in
- Collections page People/Events filters are now dropdowns instead of expandable chip rows
- Fixed the "jump"/resize look when a photo first loads in the full-size lightbox view

### Version 56 — Saturday, August 8, 2026

- Added robots.txt, noindex/nofollow meta tags, and an X-Robots-Tag header so search engines and crawlers stay out — this is a private family site, not meant to be indexed or discovered

### Version 55 — Saturday, August 8, 2026

- Darkened the contact sheet thumbnail mat color to 80% black so it blends into the page instead of standing out as a light gray box

### Version 54 — Saturday, August 8, 2026

- Dropping a new, non-empty folder into Gallery Originals now auto-registers it as a collection — no manual collection:add step needed. Empty folders are ignored until they have photos.
- Person/Event tags and captions are now read from each photo's real Photo Mechanic IPTC data (Person, Event, Alt Text) instead of placeholder config, and power the Collections page's People/Events filters
- Added the real "Janet Buys a car" collection and removed the empty "Trip to Nova Scotia" placeholder

### Version 53 — Saturday, August 8, 2026

- Made a lot of font and text changes
- working on shadig to make contact sheet look better
- mapped Event, People and Alt text from Photo Mechanic metadata

### Version 52 — Friday, August 7, 2026

- Added ability to modify captions and dates from a locally viewed page but not publicly

### Version 51 — Thursday, August 6, 2026

- Updated hero for to higher resolution

Entries below Version 50 predate the move off ChatGPT Sites and are kept for
reference. From Version 51 onward, run `npm run save` to add a new entry here
and publish the change — see the "Saving and publishing changes" section in
README.md.

## Saved Sites versions

### Version 50 — Saved, not live

- Corrected spelling, capitalization, stray punctuation, and missing terminal punctuation in all 16 embedded Christian Accessibility Alt Text fields.
- Wrote the corrected metadata to both `Gallery Originals` and the protected website originals after creating reversible backups.
- Verified that the photograph pixel data remained unchanged after every metadata update.
- Resynchronized all galleries so the corrected Alt Text appears in captions and image descriptions.

### Version 49 — Currently live

- Increased About-page text to 16 pixels on phones.
- Refined the homepage “Stories in natural light · Since 1979” line to stay readable on narrow screens.
- Added image dimensions to reserve gallery space before thumbnails load and reduce layout shifting.
- Improved full-photo keyboard accessibility by moving focus into the viewer, keeping focus within it, and returning focus to the opened thumbnail when closed.
- Replaced generic gallery image descriptions with Photo Mechanic Accessibility Alt Text where present and cleaned filename-based descriptions where it is not yet available.
- Added a subtle thumbnail lift, zoom, shadow, tap, and keyboard-focus response while respecting reduced-motion preferences.
- Removed the obsolete internal homepage version marker.

### Version 48

- Redesigned the Contact page with stronger visual hierarchy and restrained spacing.
- Added a “Get in touch” label, prominent name, short invitation, and divided email/text action rows.
- Preserved the existing email and text links while making their purpose clearer.

### Version 47

- Added Clay Carson’s email address and text-message number to the Contact page.
- Made the email address and phone number directly actionable on supported devices.

### Version 46

- Removed the time of day from every generated gallery caption.
- Spelled out all caption month names completely.
- Reduced caption text to match the photo counter size.
- Applied Accessibility Alt Text caption sourcing and date-only formatting to all collections for future resyncs, with filenames as the fallback when Alt Text is absent.

### Version 45 — Saved, not live

- Corrected the Christian caption importer to read Photo Mechanic’s IPTC Accessibility Alt Text field from the protected originals.
- Verified all 16 intended captions, including “Sunshine is his friend.”
- Kept capture date and time at the beginning of every caption and retained the 66% caption-width layout.

### Version 44 — Saved, not live

- Resynchronized the Christian collection from `Gallery Originals` after adding the caption layout changes.
- Replaced Christian lightbox filenames with the Description/Caption field; superseded by Version 45 after the intended Alt Text field was identified.
- Added each photograph’s capture date and time to the beginning of its caption.
- Limited captions to the left 66% of the displayed photograph while keeping the image count flush right.

### Version 43

- Moved the homepage copy higher to reduce the empty space above it by roughly half.
- Increased the homepage eyebrow and family/travel introduction text by 50%.
- Reduced collection-page titles by 50%.
- Reduced full-photo captions and image counts by 50%.
- Aligned full-photo captions flush left and image counts flush right with each displayed photograph.

### Version 42 — Saved, not live

- Removed the lower-right “Based in the Midwest / Available worldwide” homepage text.
- Added subtle letter spacing to “Light is our only tool.”
- Tightened the spacing among the homepage introduction lines and moved the group higher on the photograph.

### Version 41

- Resynchronized all 75 website photographs from the current files in `Gallery Originals`.
- Regenerated separate optimized full-view and thumbnail image sets.
- Refreshed lightbox captions from the current original filenames.
- Preserved the existing collection structure, gallery order, design, navigation, lightbox controls, and mobile swipe behavior.
- Added a repeatable gallery synchronization command for future updates.

### Version 40

- Replaced the lightbox captions on all 75 photographs with their exact original filenames.
- Matched every optimized website photograph to its corresponding file in `Gallery Originals`.
- Changed site access from owner-only to public on August 5, 2026.

### Version 39 — Saved, not live

- Created separate optimized thumbnail and full-view image sets.
- Added 75 gallery thumbnails with a maximum long edge of 1,200 pixels.
- Optimized 75 full-view photographs while retaining higher display quality.
- Updated gallery grids and collection covers to use thumbnails.
- Full-size files now load only when a photograph is opened.
- Reduced the saved deployment package from approximately 88.6 MB to 56 MB.
- Left the high-resolution originals in `/Volumes/Samsung_T5/Website` unchanged.

### Version 38

- Corrected gallery reading order.
- Desktop galleries now read `01, 02, 03` across each row.
- Phone galleries now read `01, 02` across each row.

### Version 37

- Added left and right swipe gestures to the full-size photo viewer on iOS devices.
- Kept the existing previous and next arrows.
- Increased the lightbox caption and photograph counter sizes to 300% of their previous sizes.

### Version 36

- Corrected the homepage copy order.
- Placed “Light is our only tool” above the “Family, travel…” paragraph.

### Version 35

- Changed the homepage date to “Since 1979.”
- Added a line break after “random.”
- Removed the “Get in touch” text and link.
- Rearranged the homepage hero text.

### Version 34

- Changed the homepage introduction to:
  “Family, travel and random stuff, taken close to the heart.”

### Version 33

- Changed the homepage headline to “Light is our only tool.”

### Version 32

- Replaced the earlier memory-themed homepage headline with “light is my only tool.”
- Reduced that headline’s type size by 50%.

### Version 31

- Synchronized the Norway collection.
- Reduced gallery labels.

### Version 30

- Compacted the Collections page grid.

### Version 29

- Synchronized the Christian photo collection.

### Version 28

- Added the Christian and Norway collection pages.

### Version 27

- Rebuilt the galleries from the website master folder.

### Version 26

- Added visible numbering labels to Beach gallery thumbnails.

### Version 25

- Added IPTC captions to the Beach gallery.

### Version 24

- Added the Beach photo collection.

### Version 23

- Reduced paragraph indentation on the About page.

### Version 22

- Increased the readability of the About text.

### Version 21

- Replaced the About biography text.

### Version 20

- Refined the About page’s body typography.

### Version 19

- Corrected spacing in the About text.

### Version 18

- Balanced spacing on the About page.

### Version 17

- Tightened spacing on the About page.

### Version 16

- Updated the opening About paragraphs.

### Version 15

- Tightened the About page typography.

### Version 14

- Refined the About page layout.

### Version 13

- Simplified the About page typography.

### Version 12

- Added a polished About biography.

### Version 11

- Added Home navigation to the interior pages.

### Version 10

- Added the Collections, About, and Contact pages.

### Version 9

- Refreshed the published header build.

### Version 8

- Enlarged the brand name.
- Removed the Inquire button.

### Version 7

- Changed the Photography label to uppercase.

### Version 6

- Added a smaller Photography label after the brand name.

### Version 5

- Shortened the visible brand name to Clay Carson.

### Version 4

- Set the brand name in upright Bookman type.

### Version 3

- Removed content below the lead photograph.

### Version 2

- Added Photography to the displayed title.

### Version 1

- Built the initial Clay Carson photography portfolio.

## Recovery

Any saved Sites version can be deployed again to restore that version as the live site. Deploying an older version does not delete newer saved versions.

## Storage policy

- High-resolution originals remain in `/Volumes/Samsung_T5/Website` and are never altered during website synchronization.
- Website code, optimized images, and local version history remain in the Samsung-drive project folder.
- Task-generated website build and staging files should be written to the Samsung drive, not the startup drive.
