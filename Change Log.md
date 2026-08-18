# Clay Carson Photography — Change Log

Last updated: Saturday, August 8, 2026

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
