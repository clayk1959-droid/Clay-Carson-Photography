# Homepage hero — desktop &amp; iPad photos

Drop 4–5 JPEGs in this folder and they'll rotate on the homepage hero for
anyone on a desktop or iPad-sized screen, fading from one to the next every
few seconds. No code change needed — add, delete, or replace a file here
and it takes effect the next time the site rebuilds (`npm run dev` locally,
or the next push for the live site).

**Crop:** wide, roughly the shape of a browser window (16:9 or a little
wider — your existing homepage photo, ~2600×1759, is a good reference).

**Export size:** 2400–2600px on the long (horizontal) edge, JPEG quality
~80–85. That's sharp on any monitor without producing an oversized file —
the site automatically serves a smaller version to smaller screens.

**Order:** photos rotate in alphabetical order by filename. If you want a
specific order, prefix the filenames: `01-beach.jpg`, `02-porch.jpg`, etc.
