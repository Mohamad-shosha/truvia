import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";

const benefits = [
  {
    title: "One connected view",
    text: "Bring assets, vulnerabilities and risk into focus.",
  },
  {
    title: "Clearer priorities",
    text: "See how your team can turn findings into action.",
  },
  {
    title: "Compliance with context",
    text: "Explore evidence and reporting that support your goals.",
  },
];

function CheckIcon() {
  return (
    <svg
      className="demo-benefit__check"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16.5 8" />
    </svg>
  );
}

export default function BookDemoPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="demo-page">
      <header className="demo-header">
        <Link to="/" aria-label="TRUVIA home">
          <Logo size={26} />
        </Link>
        <div className="demo-header__tools">
          <span className="demo-header__label">Employee workspace</span>
          <Link className="demo-header__back" to="/">
            Back to home
          </Link>
          <ThemeToggle className="auth-theme-toggle demo-theme-toggle" />
        </div>
      </header>

      <main className="demo-main">
        <section className="demo-introduction" aria-labelledby="demo-title">
          <p className="demo-kicker">PERSONALIZED PRODUCT DEMO</p>
          <h1 id="demo-title" className="demo-title">
            See your risk.
            <span>Plan your next move.</span>
          </h1>
          <p className="demo-lead">
            Discover how TRUVIA connects your security and compliance workflows
            in a demo tailored to your team.
          </p>

          <div className="demo-benefits">
            {benefits.map((benefit) => (
              <article className="demo-benefit" key={benefit.title}>
                <CheckIcon />
                <div>
                  <h2>{benefit.title}</h2>
                  <p>{benefit.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <form className="demo-form" onSubmit={handleSubmit}>
          <div className="demo-form__heading">
            <h2>Request a Demo</h2>
            <p>Tell us a little about your team.</p>
            <small>* Required fields</small>
          </div>

          {submitted ? (
            <div className="demo-success" role="status">
              <CheckIcon />
              <div>
                <h3>Thanks. We will be in touch.</h3>
                <p>Our team will contact you to schedule your demo.</p>
              </div>
            </div>
          ) : (
            <div className="demo-form__fields">
              <label className="demo-field">
                <span>Full Name *</span>
                <input name="fullName" placeholder="e.g. Alex Morgan" required />
              </label>

              <label className="demo-field">
                <span>Work Email *</span>
                <input
                  name="email"
                  type="email"
                  placeholder="alex@company.com"
                  required
                />
                <small>Use your company email address.</small>
              </label>

              <div className="demo-field-row">
                <label className="demo-field">
                  <span>Company Name *</span>
                  <input
                    name="company"
                    placeholder="e.g. Acme Inc."
                    required
                  />
                </label>
                <label className="demo-field">
                  <span>Job Title *</span>
                  <input
                    name="jobTitle"
                    placeholder="e.g. Head of Security"
                    required
                  />
                </label>
              </div>

              <label className="demo-field">
                <span>Company Size *</span>
                <select name="companySize" defaultValue="" required>
                  <option value="" disabled>
                    Select number of employees
                  </option>
                  <option>1-50</option>
                  <option>51-200</option>
                  <option>201-500</option>
                  <option>501-1000</option>
                  <option>1000+</option>
                </select>
              </label>

              <label className="demo-field">
                <span>Message (optional)</span>
                <textarea
                  name="message"
                  placeholder="What would you like to explore with TRUVIA?"
                />
              </label>
            </div>
          )}

          <div className="demo-form__submit">
            {!submitted && (
              <button type="submit">Request a Demo</button>
            )}
            <p>
              By submitting, you agree to be contacted by the TRUVIA team about
              your demo.
            </p>
          </div>
        </form>
      </main>

      <footer className="demo-footer">
        <p>© TRUVIA. All rights reserved.</p>
        <p>Cyber risk. Connected.</p>
      </footer>
    </div>
  );
}
