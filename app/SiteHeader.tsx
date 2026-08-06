export function SiteHeader({ showHome = false }: { showHome?: boolean }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Clay Carson Photography, home">
        Clay Carson <small>PHOTOGRAPHY</small>
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        {showHome && <a href="/">Home</a>}
        <a href="/collections">Collections</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
  );
}
