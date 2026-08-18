export function SiteHeader({ showHome = false }: { showHome?: boolean }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Carson & Muller Family, home">
        Carson &amp; Muller <small>FAMILY</small>
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        {showHome && <a href="/">Home</a>}
        <a href="/collections">Galleries</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
  );
}
