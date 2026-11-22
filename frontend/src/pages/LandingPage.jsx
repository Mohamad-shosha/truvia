import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";

const features = [
  {
    number: "01",
    title: "Asset intelligence",
    text: "Know what you own and keep a clear, current view of your critical assets.",
  },
  {
    number: "02",
    title: "Risk management",
    text: "Bring cyber risk into focus with structured assessments and transparent scoring.",
  },
  {
    number: "03",
    title: "Vulnerability & incident",
    text: "Turn findings into clear next steps. Review vulnerabilities and incidents alongside business impact.",
  },
  {
    number: "04",
    title: "Compliance",
    text: "Keep controls and evidence aligned. Follow your progress using ISO 27001:2022 and PCI DSS v4.0.",
  },
  {
    number: "05",
    title: "AI advisor",
    text: "Explore AI-assisted recommendations and insights to turn risk findings into clear direction.",
  },
  {
    number: "06",
    title: "Reports & workflows",
    text: "Give everyone a clear next step. Follow remediation, review evidence, and track progress.",
  },
];

const faqs = [
  {
    question: "Who is TRUVIA for?",
    answer:
      "TRUVIA is designed for security teams, GRC analysts, compliance teams, and leaders who need to see cyber risk clearly.",
  },
  {
    question: "Does TRUVIA perform active security audits?",
    answer:
      "No. TRUVIA performs assessment and risk-management workflows. It does not replace approved penetration tests or active offensive testing.",
  },
  {
    question: "Does the AI make decisions for us?",
    answer:
      "The AI assistant supports analysis and recommendations. Your team remains in control of decisions and remediation actions.",
  },
  {
    question: "Which compliance frameworks are supported?",
    answer:
      "TRUVIA supports structured control mapping and evidence workflows that can be adapted to frameworks such as ISO 27001 and PCI DSS.",
  },
];

function SectionLabel({ children }) {
  return (
    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-text-accent">
      {children}
    </p>
  );
}

function DashboardPreview() {
  const topAssets = [
    ["API Gateway", "HIGH", "42"],
    ["Customer portal", "MEDIUM", "31"],
    ["Identity service", "HIGH", "28"],
  ];

  return (
    <div className="relative mx-auto mt-10 max-w-[900px] px-2 sm:px-4">
      <div className="absolute -inset-20 -z-10 bg-[radial-gradient(circle,#155e75_0,transparent_58%)] opacity-25 blur-3xl" />

      <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-[0_20px_60px_rgba(0,0,0,.08)]">
        <div className="flex h-10 items-center border-b border-border-default px-3">
          <div className="mr-4 flex gap-1.5">
            <span className="size-2 rounded-full bg-text-muted/50" />
            <span className="size-2 rounded-full bg-text-muted/50" />
            <span className="size-2 rounded-full bg-text-muted/50" />
          </div>
          <span className="text-[11px] font-semibold tracking-wide text-text-secondary">
            TRUVIA / SECURITY DASHBOARD
          </span>
        </div>

        <div className="grid grid-cols-[150px_1fr] max-sm:grid-cols-1">
          <aside className="border-r border-border-default bg-bg-sidebar p-3 max-sm:hidden">
            <div className="mb-5 flex items-center gap-2 text-xs font-bold text-text-primary">
              <span className="grid size-6 place-items-center rounded bg-bg-accent-subtle text-text-accent">
                V
              </span>
              TRUVIA
            </div>

            {[
              "Overview",
              "Risk Management",
              "Asset Intelligence",
              "Assessments",
              "Compliance",
              "Vulnerabilities",
              "Incidents",
              "Reports",
            ].map((item, index) => (
              <div
                key={item}
                className={`mb-1 rounded px-2 py-2 text-[10px] ${
                  index === 0
                    ? "bg-bg-accent-subtle text-text-accent"
                    : "text-text-secondary"
                }`}
              >
                {item}
              </div>
            ))}
          </aside>

          <div className="p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[.18em] text-text-muted">
                  Workspace / Main
                </p>
                <h3 className="mt-1 text-lg font-semibold text-text-primary">
                  Security Dashboard
                </h3>
              </div>
              <div className="flex gap-2">
                <span className="rounded border border-border-default px-2 py-1 text-[10px] text-text-secondary">
                  Last 30 days
                </span>
                <span className="rounded bg-accent-primary px-2 py-1 text-[10px] text-text-on-accent">
                  Export
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-2">
              {[
                ["68 / 100", "Security score"],
                ["142", "Open risks"],
                ["5", "High priority"],
                ["23", "Controls ready"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-lg border border-border-default bg-bg-page p-3"
                >
                  <strong className="text-base text-text-primary">
                    {value}
                  </strong>
                  <p className="mt-1 text-[10px] text-text-muted">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-[1.7fr_1fr] gap-3 max-md:grid-cols-1">
              <div className="overflow-hidden rounded-lg border border-border-default">
                <div className="border-b border-border-default px-3 py-2 text-[11px] font-semibold text-text-primary">
                  Risk heatmap
                </div>
                <div className="grid grid-cols-8 gap-1 p-3">
                  {Array.from({ length: 32 }, (_, i) => (
                    <span
                      key={i}
                      className={`aspect-square rounded-sm ${
                        i % 11 === 0
                          ? "bg-status-critical-fg"
                          : i % 7 === 0
                            ? "bg-status-high-fg"
                            : i % 5 === 0
                              ? "bg-status-low-fg"
                              : "bg-bg-surface-raised"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-border-default">
                <div className="border-b border-border-default px-3 py-2 text-[11px] font-semibold text-text-primary">
                  Top assets
                </div>
                <div className="p-2">
                  {topAssets.map(([name, level, score]) => (
                    <div
                      key={name}
                      className="mb-2 rounded bg-bg-page px-2.5 py-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="text-text-secondary">{name}</span>
                        <span
                          className={
                            level === "HIGH"
                              ? "text-status-critical-fg"
                              : "text-status-medium-fg"
                          }
                        >
                          {level}
                        </span>
                      </div>
                      <div className="mt-2 h-1 rounded bg-bg-surface-raised">
                        <div
                          className="h-full rounded bg-accent-primary"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-border-default p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-text-primary">
                  Risk score trend, last 30 days
                </p>
                <span className="text-[9px] text-text-accent">View report</span>
              </div>
              <div className="flex h-16 items-end gap-1">
                {[
                  38, 43, 41, 39, 45, 52, 49, 55, 57, 61, 59, 66, 70, 68, 75,
                  78,
                ].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-sm bg-accent-primary/70"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="landing-page min-h-screen bg-bg-page text-text-primary">
      {/* NAVBAR */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border-default bg-bg-sidebar/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="TRUVIA home">
            <Logo size={34} />
          </Link>

          <div className="hidden items-center gap-8 text-[13px] font-medium text-text-secondary md:flex">
            <a className="transition hover:text-text-primary" href="#platform">
              Platform
            </a>
            <a
              className="transition hover:text-text-primary"
              href="#how-it-works"
            >
              How it works
            </a>
            <a
              className="transition hover:text-text-primary"
              href="#compliance"
            >
              Compliance
            </a>
            <a className="transition hover:text-text-primary" href="#faq">
              FAQs
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden rounded-md px-3 py-2 text-[13px] font-semibold text-text-secondary transition hover:text-text-primary sm:block"
            >
              Log in
            </Link>
            <Link
              to="/book-a-demo"
              className="rounded-md bg-accent-primary px-4 py-2.5 text-[13px] font-bold text-text-on-accent transition hover:bg-accent-hover"
            >
              Book a demo
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-16">
        {/* HERO */}
        <section className="relative overflow-hidden px-5 pb-12 pt-12 text-center sm:px-8 sm:pt-14">
          <div className="absolute inset-0 -z-0 bg-[linear-gradient(rgba(95,161,178,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(95,161,178,.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />

          <div className="absolute left-1/2 top-10 h-[460px] w-[820px] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(20,105,112,.12),transparent_64%)]" />

          <div className="relative mx-auto max-w-[1120px]">
            <div className="mb-10">
              <p className="inline-flex rounded-full bg-bg-accent-subtle px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-text-accent">
                Cyberrisk connected.
              </p>
            </div>

            <h1 className="mb-6 text-[clamp(44px,5.2vw,72px)] font-semibold leading-[1.12] tracking-[-0.045em] text-text-primary">
              See the risk.
              <br />
              <span className="text-text-accent">Know your next move.</span>
            </h1>

            <div className="mx-auto my-7 max-w-[850px] py-1 text-center sm:my-8">
              <p className="text-[14px] leading-[1.7] text-text-secondary sm:text-[16px]">
                Bring assets, vulnerabilities, and compliance into one clear
                view.
                <br className="hidden sm:block" />
                Turn security complexity into focused, human-led action.
              </p>
            </div>

            <div className="mb-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/book-a-demo"
                className="inline-flex h-11 min-w-[145px] items-center justify-center rounded-md bg-accent-primary px-6 text-[13px] font-bold text-text-on-accent transition hover:bg-accent-hover"
              >
                Book a demo
              </Link>

              <a
                href="#platform"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-md border border-border-strong px-6 text-[13px] font-bold text-text-primary transition hover:border-accent-primary"
              >
                Explore the platform
              </a>
            </div>

            <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted sm:text-xs">
              No setup · Human-led decision support
            </p>
          </div>

          <DashboardPreview />

          <div className="relative mx-auto mt-8 flex max-w-[900px] justify-between border-t border-border-default pt-4 text-[9px] uppercase tracking-[.12em] text-text-muted sm:text-[10px]">
            <span>From signals to actionable intelligence</span>
            <span className="hidden sm:block">ISO/IEC 27001:2022</span>
            <span>PCI DSS v4.0</span>
          </div>
        </section>

        {/* PLATFORM */}
        <section
          id="platform"
          className="border-t border-border-default px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-[1200px]">
            <SectionLabel>01 / Platform</SectionLabel>

            <div className="mb-8 grid gap-5 sm:grid-cols-2">
              <h2 className="max-w-[460px] text-[30px] font-semibold leading-[1.2] tracking-[-0.03em] sm:text-[36px]">
                Less fragmentation.
                <br />
                More clarity.
              </h2>

              <p className="max-w-[430px] self-end text-[13px] leading-[1.7] text-text-secondary sm:justify-self-end sm:text-sm">
                Connect the work of security and governance. Keep assets, risks,
                compliance, and decisions in one coherent system.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.number}
                  className="min-h-[150px] rounded-lg border border-border-default bg-bg-surface px-6 py-6 transition hover:bg-bg-hover"
                >
                  <div className="mb-4 text-[11px] font-bold text-text-accent">
                    {feature.number} /
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-3 max-w-[280px] text-[13px] leading-[1.7] text-text-secondary">
                    {feature.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="border-t border-border-default bg-bg-surface px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-[1200px]">
            <SectionLabel>02 / How it works</SectionLabel>

            <h2 className="mb-9 max-w-[600px] text-[30px] font-semibold leading-[1.2] tracking-[-0.03em] sm:text-[36px]">
              From scattered signals to a clear plan.
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                [
                  "01",
                  "Build your picture",
                  "Connect assets, records, findings and context into one relevant operational view.",
                ],
                [
                  "02",
                  "Focus your attention",
                  "Review risk scores and AI-supported analysis to find the decisions that matter.",
                ],
                [
                  "03",
                  "Move forward together",
                  "Turn priorities into owned actions, evidence, and measurable security progress.",
                ],
              ].map(([number, title, text]) => (
                <article key={number} className="py-2">
                  <span className="text-[24px] font-semibold text-text-accent">
                    {number}
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{title}</h3>
                  <p className="mt-3 max-w-[310px] text-[13px] leading-[1.7] text-text-secondary">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HUMAN IN THE LOOP */}
        <section className="border-t border-border-default px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[.95fr_1.05fr] md:items-center">
            <div>
              <SectionLabel>03 / Human in the loop</SectionLabel>

              <h2 className="text-[30px] font-semibold leading-[1.2] tracking-[-0.03em] sm:text-[36px]">
                An extra perspective.
                <br />
                Not the final word.
              </h2>

              <p className="mt-5 max-w-[460px] text-[13px] leading-[1.8] text-text-secondary sm:text-sm">
                Make room for better decisions. TRUVIA brings together evidence
                and AI-assisted analysis, while your team retains control of
                every decision.
              </p>

              <ul className="mt-6 space-y-3 text-[13px] text-text-secondary">
                <li>— Context alongside data for better judgment</li>
                <li>— Clear AI governance and explainable recommendations</li>
                <li>— Human review before action</li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-[8px] border border-[#173552] bg-[#061426] px-7 py-7 sm:px-8 sm:py-8">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-accent">
                  AI Advisor
                </span>
                <span className="text-[9px] uppercase tracking-[0.12em] text-[#718198]">
                  Illustrative example
                </span>
              </div>

              <p className="mb-6 text-[11px] text-[#718198]">
                AI-generated - Requires human review
              </p>

              <h3 className="max-w-[430px] text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] text-text-primary sm:text-[30px]">
                Start with the exposure
                <br />
                that matters most.
              </h3>

              <p className="mt-5 max-w-[520px] text-[13px] leading-[1.7] text-[#9aabc0] sm:text-[14px]">
                An unpatched payment gateway is linked to a critical finding.
                Review the asset context and confirm the remediation priority
                with its owner.
              </p>

              <div className="mt-7 rounded-md border border-border-default bg-bg-surface-raised px-5 py-5">
                <div className="flex flex-col gap-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#718198]">
                    Related asset
                  </p>
                  <p className="font-mono text-[12px] leading-[1.3] text-[#8ea1b7]">
                    pay-gw-01 <span className="text-[#718198]">/</span> Payment
                    gateway
                  </p>
                  <p className="text-[12px] leading-[1.3] font-semibold text-[#20c7b3]">
                    Suggested next step: review remediation
                  </p>
                </div>
              </div>

              <p className="mt-7 border-t border-border-default pt-5 text-[11px] leading-[1.2] text-[#718198]">
                Decision support only. Your team validates the recommendation.
              </p>
            </div>
          </div>
        </section>

        {/* COMPLIANCE READINESS */}
        <section
          id="compliance"
          className="border-t border-border-default px-5 py-14 sm:px-8 sm:py-16"
        >
          <div className="mx-auto max-w-[1220px]">
            <div className="mb-12 grid gap-10 sm:grid-cols-[1fr_380px] sm:items-end">
              <div>
                <p className="mb-6 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-text-accent">
                  04 / Compliance readiness
                </p>
                <h2 className="text-[34px] font-semibold leading-[1.12] tracking-[-0.035em] text-text-primary sm:text-[38px]">
                  Make readiness
                  <br />
                  part of the everyday.
                </h2>
              </div>

              <p className="mt-6 max-w-[380px] text-left text-[13px] leading-[1.65] text-[#94a4b5] sm:mt-0 sm:justify-self-start">
                Keep your controls, evidence and responsibilities connected. See
                what needs attention and make compliance part of everyday work.
              </p>
            </div>

            <div className="grid gap-12 text-left sm:grid-cols-2 sm:gap-12">
              <article className="max-w-[440px] rounded-lg border border-border-default bg-bg-surface p-6">
                <h3 className="text-left text-[20px] font-semibold leading-[1.2] text-text-accent">
                  ISO/IEC 27001:2022
                </h3>
                <p className="mt-5 border-b border-border-default pb-5 text-[13px] leading-[1.7] text-text-secondary">
                  Information security management.
                </p>
                <p className="mt-5 max-w-[430px] text-[13px] leading-[1.7] text-text-muted">
                  Organize controls and supporting evidence in one workspace.
                  Track ownership, and see how your progress moves forward.
                </p>
              </article>

              <article className="max-w-[440px] rounded-lg border border-border-default bg-bg-surface p-6">
                <h3 className="text-left text-[20px] font-semibold leading-[1.2] text-text-accent">
                  PCI DSS v4.0
                </h3>
                <p className="mt-5 border-b border-border-default pb-5 text-[13px] leading-[1.7] text-text-secondary">
                  Payment card data security.
                </p>
                <p className="mt-5 max-w-[430px] text-[13px] leading-[1.7] text-text-muted">
                  Keep payment-security requirements visible. Connect control
                  evidence with the people responsible for follow-through.
                </p>
              </article>
            </div>

            <p className="mt-14 border-t border-border-default pt-5 text-[9px] text-[#718198]">
              Framework support does not constitute certification.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="border-t border-border-default px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[.9fr_1.1fr]">
            <div>
              <SectionLabel>05 / Frequently asked</SectionLabel>

              <h2 className="text-[30px] font-semibold leading-[1.2] tracking-[-0.03em] sm:text-[36px]">
                Clarity starts
                <br />
                with a question.
              </h2>

              <p className="mt-5 max-w-[380px] text-[13px] leading-[1.8] text-text-secondary">
                A little more about TRUVIA and the way it supports your team.
              </p>
            </div>

            <div className="divide-y divide-border-default border-y border-border-default">
              {faqs.map((faq, index) => (
                <button
                  key={faq.question}
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full py-5 text-left"
                  aria-expanded={openFaq === index}
                >
                  <span className="flex items-center justify-between gap-4 text-[14px] font-semibold">
                    {faq.question}
                    <span className="text-lg text-text-accent">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </span>

                  {openFaq === index && (
                    <p className="max-w-[600px] pr-8 pt-3 text-[13px] leading-[1.8] text-text-secondary">
                      {faq.answer}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
        {/* FINAL CTA */}
        <section className="border-t border-border-default px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto flex min-h-[440px] max-w-[1060px] flex-col items-center justify-center rounded-xl border border-border-default bg-bg-surface px-6 py-16 text-center sm:px-12 sm:py-20">
            <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-accent">
              One workspace. A clearer way forward.
            </p>

            <h2 className="mx-auto max-w-[720px] text-center text-[34px] font-semibold leading-[1.15] tracking-[-0.035em] sm:text-[42px]">
              Your next security decision
              <br />
              starts with a clearer view.
            </h2>

            <p className="mx-auto mt-6 max-w-[530px] text-center text-[14px] leading-[1.7] text-text-secondary">
              See how TRUVIA brings risk, compliance and your team together.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/book-a-demo"
                className="inline-flex h-11 min-w-[145px] items-center justify-center rounded-md bg-accent-primary px-5 text-[13px] font-bold text-text-on-accent transition hover:bg-accent-hover"
              >
                Book a demo
              </Link>

              <a
                href="#platform"
                className="inline-flex h-11 min-w-[190px] items-center justify-center rounded-md border border-border-strong px-5 text-[13px] font-bold text-text-primary transition hover:border-accent-primary"
              >
                Explore platform
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border-default px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-8 sm:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo size={30} />
            <p className="mt-4 max-w-[240px] text-[11px] leading-[1.7] text-text-muted">
              AI-powered cybersecurity risk management &amp; compliance.
            </p>
          </div>

          {[
            ["Platform", "Assets", "Risk", "Compliance"],
            ["Company", "About", "Contact", "Careers"],
            ["Resources", "Documentation", "Security", "Legal"],
          ].map(([title, ...links]) => (
            <div key={title}>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[.14em] text-text-muted">
                {title}
              </p>

              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="mb-3 block text-[12px] text-text-secondary transition hover:text-text-primary"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-[1200px] border-t border-border-default pt-5 text-[10px] text-text-muted">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <span>© 2026 TRUVIA. All rights reserved.</span>
            <span>From risk visibility to informed decisions.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
