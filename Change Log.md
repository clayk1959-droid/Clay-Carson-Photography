# Clay Carson Photography — Change Log

Last updated: Friday, August 21, 2026

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
