import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CircleDollarSign,
  Cpu,
  Github,
  LayoutGrid,
  LineChart,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/auth/session";
import { IS_DEMO } from "@/lib/demo/demo-mode";
import { img, PHOTOS } from "@/lib/images";
import { SiteHeader } from "@/components/marketing/site-header";

export default async function Home() {
  // In a real deployment, signed-in users skip the marketing site.
  // In demo mode we always show the landing page (auth is bypassed).
  if (!IS_DEMO) {
    const session = await getCurrentSession();
    if (session?.user) redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 antialiased selection:bg-indigo-500/30">
      <SiteHeader />
      <Hero />
      <LogoStrip />
      <Modules />
      <AIBand />
      <Features />
      <Security />
      <Metrics />
      <CTA />
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Cinematic 4K backdrop */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={img("hero", { w: 2600, q: 80 })}
          alt={PHOTOS.hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07080c]/70 via-[#07080c]/80 to-[#07080c]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.25),transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-36 sm:pt-44 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 backdrop-blur">
            <Sparkles className="size-3.5 text-indigo-300" />
            The Autonomous Enterprise System
          </span>

          <h1 className="mt-7 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Run your entire company on{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              one intelligent grid
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-zinc-300/90">
            CoreGrid unifies HR, CRM, inventory, finance and projects into a single
            workspace — with private, on-device AI that turns operational data into
            decisions. No spreadsheets. No silos.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-12 bg-white px-7 text-base font-medium text-zinc-900 hover:bg-zinc-200"
            >
              <Link href={IS_DEMO ? "/dashboard" : "/auth/register"}>
                {IS_DEMO ? "Explore the live demo" : "Start free"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/15 bg-white/5 px-7 text-base text-white backdrop-blur hover:bg-white/10 hover:text-white"
            >
              <Link href="#modules">See what's inside</Link>
            </Button>
          </div>

          <p className="mt-5 text-sm text-zinc-400">
            Live demo · no signup · sample company pre-loaded
          </p>
        </div>

        {/* Floating product frame */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute -inset-x-10 -top-10 -z-10 h-40 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(56,189,248,0.18),transparent)]" />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/60 ring-1 ring-white/5 backdrop-blur">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.02] px-4 py-3">
              <span className="size-3 rounded-full bg-red-400/70" />
              <span className="size-3 rounded-full bg-amber-400/70" />
              <span className="size-3 rounded-full bg-emerald-400/70" />
              <span className="ml-3 text-xs text-zinc-400">
                app.coregrid.io / dashboard
              </span>
            </div>
            <Image
              src={img("finance", { w: 2000, q: 80 })}
              alt="CoreGrid analytics workspace"
              width={2000}
              height={1100}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Logo / trust strip                                                  */
/* ------------------------------------------------------------------ */
function LogoStrip() {
  const stats = [
    { label: "Operational modules", value: "6" },
    { label: "Data models orchestrated", value: "30+" },
    { label: "AI runs locally", value: "100%" },
    { label: "Setup to first insight", value: "<5 min" },
  ];
  return (
    <section className="border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-6 py-2 lg:grid-cols-4 lg:px-8">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-8 text-center">
            <div className="text-3xl font-semibold tracking-tight text-white">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-zinc-400">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Modules showcase                                                    */
/* ------------------------------------------------------------------ */
const MODULES = [
  {
    key: "hr" as const,
    eyebrow: "People",
    title: "HR that runs itself",
    body: "Employee records, departments, attendance, payroll and leave — with AI that screens resumes and flags workforce risk before it becomes a problem.",
    points: ["Org-wide directory & org chart", "Payroll & leave workflows", "AI resume parsing"],
    icon: Users,
    href: "/hr",
  },
  {
    key: "crm" as const,
    eyebrow: "Revenue",
    title: "A CRM your pipeline trusts",
    body: "Track customers, contacts and deals through every stage. CoreGrid drafts follow-up emails and forecasts which deals will actually close.",
    points: ["Visual deal pipeline", "Contact & activity timeline", "AI email drafting"],
    icon: LineChart,
    href: "/crm",
  },
  {
    key: "ops" as const,
    eyebrow: "Supply",
    title: "Inventory without surprises",
    body: "Real-time stock levels, suppliers and purchase orders with automated reorder points so you never sell what you can't ship.",
    points: ["Stock & movement tracking", "Supplier scorecards", "Automated reordering"],
    icon: Boxes,
    href: "/inventory",
  },
];

function Modules() {
  return (
    <section id="modules" className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
      <SectionHeading
        eyebrow="One platform"
        title="Every department, finally on the same grid"
        sub="Each module is fully featured on its own — and exponentially more useful together, because the data is shared."
      />

      <div className="mt-20 space-y-28">
        {MODULES.map((m, i) => (
          <div
            key={m.key}
            className="grid items-center gap-12 lg:grid-cols-2"
          >
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-300">
                <m.icon className="size-4" />
                {m.eyebrow}
              </div>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {m.title}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-zinc-400">{m.body}</p>
              <ul className="mt-6 space-y-3">
                {m.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-zinc-300">
                    <span className="grid size-5 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <Zap className="size-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant="link"
                className="mt-6 h-auto p-0 text-indigo-300 hover:text-indigo-200"
              >
                <Link href={m.href}>
                  Open {m.eyebrow.toLowerCase()} module
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#07080c]/40 to-transparent" />
                <Image
                  src={img(m.key, { w: 1400, q: 80 })}
                  alt={PHOTOS[m.key].alt}
                  width={1400}
                  height={1000}
                  className="h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[420px]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* AI band                                                             */
/* ------------------------------------------------------------------ */
function AIBand() {
  return (
    <section id="ai" className="relative isolate overflow-hidden border-y border-white/5">
      <div className="absolute inset-0 -z-10">
        <Image
          src={img("ai", { w: 2400, q: 80 })}
          alt={PHOTOS.ai.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#07080c]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080c] via-[#07080c]/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-sky-300">
            <Cpu className="size-4" />
            Private AI, built in
          </div>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Intelligence that never leaves your walls
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-zinc-300">
            CoreGrid runs language models locally through Ollama. Financial figures,
            employee records and customer data are analyzed on your own
            infrastructure — so you get the upside of AI with none of the exposure.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, t: "Zero data egress", d: "Prompts and records stay on-prem." },
              { icon: Workflow, t: "Context-aware", d: "Insights drawn from live module data." },
              { icon: BarChart3, t: "Analyst on tap", d: "Plain-language summaries & risk flags." },
              { icon: Lock, t: "Role-scoped", d: "AI only sees what the user can." },
            ].map((f) => (
              <div
                key={f.t}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur"
              >
                <f.icon className="size-5 text-sky-300" />
                <div className="mt-3 font-medium text-white">{f.t}</div>
                <div className="mt-1 text-sm text-zinc-400">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Feature grid                                                        */
/* ------------------------------------------------------------------ */
function Features() {
  const features = [
    { icon: BarChart3, t: "Live analytics", d: "Cross-module dashboards update as the business moves." },
    { icon: CircleDollarSign, t: "Finance & invoicing", d: "Invoices, expenses, approvals and collection tracking." },
    { icon: Workflow, t: "Project delivery", d: "Boards, tasks and time logs tied to real departments." },
    { icon: ShieldCheck, t: "Role-based access", d: "Seven roles, granular permissions, full audit trail." },
    { icon: LayoutGrid, t: "Universal data tables", d: "Sort, filter, paginate and export across every record." },
    { icon: Zap, t: "Production-ready", d: "Dockerized, typed end-to-end, deploy in minutes." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
      <SectionHeading
        eyebrow="Built for operators"
        title="Serious software, without the bloat"
        sub="Everything you expect from enterprise tooling, designed to feel light."
      />
      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.t}
            className="group bg-[#0a0c12] p-8 transition-colors hover:bg-[#0d1018]"
          >
            <div className="grid size-11 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-sky-500/10 text-indigo-300 ring-1 ring-white/10">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-5 text-lg font-medium text-white">{f.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Security band                                                       */
/* ------------------------------------------------------------------ */
function Security() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-10 sm:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Security isn't a feature. It's the foundation.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-400">
              Bcrypt-hashed credentials, server-side sessions, role-based route
              guards and a complete audit log of every critical action. Your data
              model is yours alone.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["RBAC", "7 roles"],
              ["Audit log", "Every action"],
              ["Sessions", "Server-side"],
              ["Hashing", "Bcrypt"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl border border-white/10 bg-[#0a0c12] p-5"
              >
                <div className="text-sm text-zinc-400">{k}</div>
                <div className="mt-1 text-lg font-medium text-white">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Metrics                                                             */
/* ------------------------------------------------------------------ */
function Metrics() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/[0.02] p-10 sm:grid-cols-3 sm:p-14 text-center">
        {[
          ["$4.2M", "Pipeline tracked in the demo workspace"],
          ["60", "Employees managed end-to-end"],
          ["98%", "Of routine reporting automated"],
        ].map(([v, l]) => (
          <div key={l}>
            <div className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-5xl font-semibold tracking-tight text-transparent">
              {v}
            </div>
            <p className="mx-auto mt-3 max-w-xs text-sm text-zinc-400">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA                                                                 */
/* ------------------------------------------------------------------ */
function CTA() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image src={img("grid", { w: 2400, q: 80 })} alt={PHOTOS.grid.alt} fill sizes="100vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-[#07080c]/85" />
      </div>
      <div className="mx-auto max-w-3xl px-6 py-28 text-center lg:px-8">
        <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Step inside the grid
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-300">
          A complete sample company is loaded and waiting. Explore the full product
          in seconds — no signup, nothing to install.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 bg-white px-7 text-base text-zinc-900 hover:bg-zinc-200">
            <Link href="/dashboard">
              Launch the workspace
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 border-white/15 bg-white/5 px-7 text-base text-white hover:bg-white/10 hover:text-white">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */
function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#06070a]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-lg font-semibold text-white">CoreGrid</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              The autonomous enterprise system. HR, CRM, inventory, finance and
              projects — unified, with private AI built in.
            </p>
            <a
              href="https://github.com/"
              className="mt-5 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
            >
              <Github className="size-4" /> Star on GitHub
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                ["Dashboard", "/dashboard"],
                ["Modules", "#modules"],
                ["Private AI", "#ai"],
                ["Features", "#features"],
              ]}
            />
            <FooterCol
              title="Workspace"
              links={[
                ["HR", "/hr"],
                ["CRM", "/crm"],
                ["Inventory", "/inventory"],
                ["Finance", "/finance"],
              ]}
            />
            <FooterCol
              title="Account"
              links={[
                ["Sign in", "/auth/login"],
                ["Register", "/auth/register"],
                ["About", "/about"],
                ["Support", "/support"],
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-zinc-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CoreGrid. Crafted for operators.</p>
          <p>
            Photography via{" "}
            <a href="https://unsplash.com" className="text-zinc-400 hover:text-white">
              Unsplash
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-white">{title}</h4>
      <ul className="mt-4 space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-zinc-400 transition-colors hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */
function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-sm font-medium uppercase tracking-widest text-indigo-300/80">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-zinc-400">{sub}</p>
    </div>
  );
}

export function Logo() {
  return (
    <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/30">
      <LayoutGrid className="size-4" />
    </span>
  );
}
