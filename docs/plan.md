# Astro + Tailwind Portfolio Plan (Gia Bảo / BaoBG)

## Goal
Build a fast, elegant personal portfolio with a **quiet but intense** vibe: restrained layout, deep contrast, sharp typography, minimal copy, and high craft in motion/detail.

## Working Model (Agents)
- **Planner**: define scope, phases, dependencies, milestones, and decision log.
- **Research**: gather references (portfolio patterns, typography, motion, accessibility) and competitive notes.
- **Content**: produce final copy (VN/EN if needed), project summaries, bio, CTA text, metadata.
- **Layout**: implement Astro page structure, reusable section patterns, responsive composition.
- **Style**: define visual direction, tokens, typography scale, spacing rhythm, animation language.
- **Tailwind**: configure Tailwind theme/tokens/utilities and enforce consistency.
- **Deployment**: CI/CD, environment config, hosting setup, domain/HTTPS.
- **QA**: accessibility, responsive, SEO, performance, regression checks.
- **Synthesis**: merge outputs into coherent final experience and final sign-off package.

## Phases

### Phase 1: Discovery + Direction
Owner: Planner, Research, Style
- Confirm target audience (recruiters, clients, collaborators).
- Define success metrics: Lighthouse targets, contact conversion, load speed.
- Lock visual brief: "quiet but intense" (dark neutrals, one restrained accent, subtle motion).
- Produce moodboard + 2 style options; select one.
Exit criteria:
- Approved creative direction and measurable KPIs.

### Phase 2: Content Architecture
Owner: Planner, Content, Research
- Define information architecture and page hierarchy.
- Draft all copy blocks: hero, about, experience, projects, contact.
- Create project schema (title, role, stack, impact, links, images).
- Draft SEO metadata, Open Graph text, and social links.
Exit criteria:
- Finalized content map and structured content files ready for integration.

### Phase 3: Astro Foundation
Owner: Layout, Tailwind
- Initialize Astro project and add Tailwind integration.
- Set up global layout, base styles, typography tokens, and design variables.
- Configure content collections for projects and experience entries.
- Add shared utilities (formatters, date helpers, constants).
Exit criteria:
- Build runs cleanly with route skeletons and tokenized styling baseline.

### Phase 4: Core UI System
Owner: Layout, Style, Tailwind
- Build reusable primitives: Container, Section, Heading, Button, Tag, Card.
- Implement site shell: header, nav, footer, theme-consistent spacing.
- Define component states (hover/focus/active) and motion timing scale.
- Ensure mobile-first responsiveness at key breakpoints.
Exit criteria:
- Reusable component library supports all planned pages without one-off hacks.

### Phase 5: Page Implementation
Owner: Layout, Content
- Build routes and connect each to structured content sources.
- Implement project listing + project detail templates.
- Integrate social/contact CTAs and optional contact form strategy.
- Add graceful empty states and robust 404 page.
Exit criteria:
- All routes complete, content-complete, and navigable.

### Phase 6: Quality + Optimization
Owner: QA, Tailwind, Layout
- Accessibility pass: landmarks, heading order, contrast, keyboard navigation.
- Performance pass: image optimization, font loading strategy, CSS/JS minimization.
- SEO pass: metadata, canonical URLs, sitemap, robots, structured data.
- Cross-browser and responsive regression tests.
Exit criteria:
- Lighthouse targets met (Perf >= 90, A11y >= 95, SEO >= 95 on key pages).

### Phase 7: Deployment + Launch
Owner: Deployment, QA
- Configure hosting (e.g., Vercel/Netlify/Cloudflare Pages) and build command.
- Set environment variables, analytics, and monitoring.
- Validate preview and production deploys.
- Run launch checklist and rollback plan.
Exit criteria:
- Production site live on custom domain with SSL and monitoring active.

### Phase 8: Synthesis + Handoff
Owner: Synthesis, Planner
- Consolidate docs: architecture decisions, component usage, content editing guide.
- Record known limitations and next-iteration backlog.
- Final stakeholder walkthrough and sign-off.
Exit criteria:
- Handoff package complete and accepted.

## Proposed Directory Structure
```text
/
  public/
    favicon.svg
    og-cover.jpg
    images/
  src/
    components/
      ui/
        Container.astro
        Section.astro
        Heading.astro
        Button.astro
        Tag.astro
      layout/
        Header.astro
        Footer.astro
        Nav.astro
      blocks/
        Hero.astro
        About.astro
        ProjectCard.astro
        ExperienceItem.astro
        ContactCTA.astro
    content/
      projects/
        project-a.md
      experience/
        role-a.md
    layouts/
      MainLayout.astro
      ProjectLayout.astro
    pages/
      index.astro
      about.astro
      projects/index.astro
      projects/[slug].astro
      experience.astro
      contact.astro
      404.astro
    styles/
      global.css
      tokens.css
    lib/
      constants.ts
      seo.ts
      format.ts
  docs/
    plan.md
  astro.config.mjs
  tailwind.config.mjs
  package.json
```

## Route Plan
- `/`: Hero, featured projects, short bio, primary CTA.
- `/about`: narrative profile, strengths, tools, values.
- `/projects`: all projects with filtering by type/stack.
- `/projects/[slug]`: case-study detail (problem, approach, outcome, links).
- `/experience`: timeline of roles/achievements.
- `/contact`: direct channels and collaboration CTA.
- `/404`: branded fallback with path back to home/projects.

## Component Plan
- Layout: `MainLayout`, `Header`, `Nav`, `Footer`.
- UI primitives: `Container`, `Section`, `Heading`, `Button`, `Tag`, `Card`.
- Content blocks: `Hero`, `About`, `ProjectCard`, `ExperienceItem`, `ContactCTA`.
- SEO/utilities: metadata helper, OG tags, JSON-LD helper.

## Acceptance Checklist
- [ ] Visual direction matches "quiet but intense" across all pages.
- [ ] All planned routes implemented and internally linked.
- [ ] Content is complete, accurate, and easy to update from structured files.
- [ ] Responsive behavior validated on mobile, tablet, desktop.
- [ ] Keyboard navigation and focus states work on all interactive controls.
- [ ] Color contrast and semantic HTML pass accessibility checks.
- [ ] Core Web Vitals and Lighthouse targets achieved.
- [ ] Metadata, sitemap, robots, canonical URLs, and OG tags verified.
- [ ] Deployment pipeline and production domain configured.
- [ ] Handoff docs include maintenance + next-iteration backlog.