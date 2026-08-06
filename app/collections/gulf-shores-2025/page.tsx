import { SiteHeader } from "../../SiteHeader";
import { Gallery } from "../Gallery";

const displayOrder = [4, 9, 6, 3, 2, 7, 8, 10, 11, 12, 13, 5, 14, 15, 16, 17, 1];

const photographData = [
  {
    "caption": "September 14, 2025 — Battleship Big Guns 2",
    "altText": "Battleship Big Guns 2",
    "width": 2200,
    "height": 687
  },
  {
    "caption": "September 14, 2025 — Ben and Christian in sand 1",
    "altText": "Ben and Christian in sand 1",
    "width": 2200,
    "height": 1571
  },
  {
    "caption": "September 23, 2025 — Ben, Christian, Katie 2",
    "altText": "Ben, Christian, Katie 2",
    "width": 2200,
    "height": 1875
  },
  {
    "caption": "September 14, 2025 — Boardwalk 1",
    "altText": "Boardwalk 1",
    "width": 2200,
    "height": 1489
  },
  {
    "caption": "September 14, 2025 — Christian Katie Ben looks out at oil rig 1",
    "altText": "Christian Katie Ben looks out at oil rig 1",
    "width": 2200,
    "height": 1308
  },
  {
    "caption": "September 14, 2025 — Christian Katie Janet 1",
    "altText": "Christian Katie Janet 1",
    "width": 2200,
    "height": 1388
  },
  {
    "caption": "September 14, 2025 — Christian pllays in sand 3",
    "altText": "Christian pllays in sand 3",
    "width": 1427,
    "height": 2200
  },
  {
    "caption": "September 18, 2025 — Christian starts tpo fall 1",
    "altText": "Christian starts tpo fall 1",
    "width": 2200,
    "height": 1628
  },
  {
    "caption": "September 14, 2025 — Gate and fence 1",
    "altText": "Gate and fence 1",
    "width": 2200,
    "height": 1487
  },
  {
    "caption": "September 18, 2025 — Kaqtie runs in waves 1",
    "altText": "Kaqtie runs in waves 1",
    "width": 2200,
    "height": 1549
  },
  {
    "caption": "September 14, 2025 — Katie, Ben, Christian in waves 1",
    "altText": "Katie, Ben, Christian in waves 1",
    "width": 2200,
    "height": 1660
  },
  {
    "caption": "September 18, 2025 — Katie, Janet, Christian in wavess 1",
    "altText": "Katie, Janet, Christian in wavess 1",
    "width": 2200,
    "height": 1549
  },
  {
    "caption": "September 18, 2025 — Katie, Janet, Christian in wavess 3",
    "altText": "Katie, Janet, Christian in wavess 3",
    "width": 2200,
    "height": 1628
  },
  {
    "caption": "September 14, 2025 — Sunset-2p 1",
    "altText": "Sunset-2p 1",
    "width": 1909,
    "height": 2200
  },
  {
    "caption": "September 18, 2025 — in pool 1",
    "altText": "in pool 1",
    "width": 1466,
    "height": 2200
  },
  {
    "caption": "September 23, 2025 — all in pool overhead",
    "altText": "all in pool overhead",
    "width": 2200,
    "height": 1817
  },
  {
    "caption": "September 18, 2025 — Pool Overhead all 4",
    "altText": "Pool Overhead all 4",
    "width": 2200,
    "height": 2082
  }
];

const photographs = displayOrder.map((number) => ({
  ...photographData[number - 1],
  src: `/galleries/gulf-shores-2025/gulf-shores-2025-${String(number).padStart(2, "0")}.jpg`,
}));

export default function GulfShoresPage() {
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Collections</a>
        <h1>Gulf Shores 2025</h1>
        <p>September 2025&nbsp; · &nbsp;17 photographs</p>
      </header>
      <Gallery name="Gulf Shores 2025" photographs={photographs} />
    </main>
  );
}
