export function SiteHeader({
  showHome = false,
  tagline,
}: {
  showHome?: boolean;
  tagline?: string;
}) {
  return (
    <header className="site-header">
      <div className="brand-block">
        <a className="brand" href="/" aria-label="Carson & Muller Family, home">
          Carson &amp; Muller <small>FAMILY</small>
        </a>
        {tagline && <p className="site-tagline">{tagline}</p>}
      </div>
      <nav className="site-nav" aria-label="Main navigation">
        {showHome && <a href="/">Home</a>}
        <a href="/collections">Galleries</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
  );
}
