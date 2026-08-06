import { SiteHeader } from "../SiteHeader";

export default function ContactPage() {
  return (
    <main className="subpage">
      <SiteHeader showHome />
      <section className="contact-simple">
        <p className="contact-eyebrow">Get in touch</p>
        <div className="contact-intro">
          <h1>Clay Carson</h1>
          <p>Questions, stories, or just want to say hello?</p>
        </div>
        <div className="contact-actions">
          <a href="mailto:clayk1959@gmail.com">
            <span className="contact-label">Email</span>
            <span className="contact-value">clayk1959@gmail.com</span>
            <span className="contact-arrow" aria-hidden="true">→</span>
          </a>
          <a href="sms:+15019408880">
            <span className="contact-label">Text</span>
            <span className="contact-value">(501) 940-8880</span>
            <span className="contact-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </main>
  );
}
