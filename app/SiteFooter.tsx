export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <div className="site-footer">
      <p>
        {`© ${year} Clay Carson. These photos are shared for the personal enjoyment of family and friends — please don't repost or share them publicly without asking first.`}
      </p>
    </div>
  );
}
