import { SiteHeader } from "../SiteHeader";

export default function CollectionsPage() {
  return (
    <main className="subpage collections-page">
      <SiteHeader showHome />
      <section className="collections-layout">
        <h1 className="page-title">Collections</h1>

        <div className="collection-index">
          <a className="collection-card" href="/collections/christian">
            <div className="collection-cover">
              <img
                src="/gallery-thumbnails/christian/christian-01.jpg"
                alt="Christian collection"
              />
            </div>
            <div className="collection-details">
              <div>
                <p className="collection-date">Personal</p>
                <h2>Christian</h2>
              </div>
              <p className="collection-count">16 photographs</p>
              <span className="collection-link">View collection&nbsp; →</span>
            </div>
          </a>

          <a className="collection-card" href="/collections/gulf-shores-2025">
            <div className="collection-cover">
              <img
                src="/gallery-thumbnails/gulf-shores-2025/gulf-shores-2025-14.jpg"
                alt="Gulf Shores 2025 collection"
              />
            </div>
            <div className="collection-details">
              <div>
                <p className="collection-date">September 2025</p>
                <h2>Gulf Shores 2025</h2>
              </div>
              <p className="collection-count">17 photographs</p>
              <span className="collection-link">View collection&nbsp; →</span>
            </div>
          </a>

          <a className="collection-card" href="/collections/norway">
            <div className="collection-cover">
              <img
                src="/gallery-thumbnails/norway/norway-13.jpg"
                alt="Norway collection"
              />
            </div>
            <div className="collection-details">
              <div>
                <p className="collection-date">Travel</p>
                <h2>Norway</h2>
              </div>
              <p className="collection-count">42 photographs</p>
              <span className="collection-link">View collection&nbsp; →</span>
            </div>
          </a>
        </div>
      </section>
    </main>
  );
}
