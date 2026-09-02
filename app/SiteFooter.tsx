export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <div className="site-footer">
      <p>
        {`© ${year} Clay Carson. These photos are shared for the personal enjoyment of family and friends — please don't repost or share them publicly without asking first.`}
      </p>
      <p className="site-footer-links">
        <a href="/privacy-policy">Privacy Policy</a>
        {" · "}
        <a href="/terms">Terms &amp; Conditions</a>
        {" · "}
        <a href="/sms-alerts">Site Alert Texts</a>
      </p>
    </div>
  );
}
