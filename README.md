# Atlas Design System

**A design system that helps AI agents turn product briefs into consistent, implementation-ready screens.**

[Live demo](https://atlas-design-system-lqyqko9es-rizwans-projects-cb102166.vercel.app/) · [Case study](ADD_CASE_STUDY_LINK) · [Figma library](https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System-v1)

## The challenge

AI can generate interfaces quickly, but without clear design-system guidance, screens can drift from approved components, tokens, and interaction patterns.

Atlas explores how to make that guidance clear, structured, and usable for both designers and AI agents.

## My role

I created and maintain Atlas independently as a personal, white-label design system inspired by shadcn/ui.

My work covers:

- Design-system strategy
- Figma-to-code governance
- Component and pattern architecture
- Semantic token systems
- Agent workflows for screen generation
- Automated compliance checks

## What Atlas does

Atlas connects:

- Figma as the design source of truth
- A React component library
- Semantic design tokens
- Reusable screen patterns
- Governance and usage guidance
- Claude workflows and generated system snapshots

An agent can retrieve the relevant guidance, select approved Atlas components, assemble a screen, and check the result against the system’s rules.

**42 web component modules tracked in source**

## Evidence

- **Pattern adherence:** Increased from **81.2% to 98.1%** across five benchmark tasks, with three runs per task.
- **Consistency:** The same deterministic rule checks were applied to both the baseline and pattern-guided outputs.
- **Cost tradeoff:** Average task cost increased from **$0.447 to $0.474**.
- **Interpretation:** The current evidence demonstrates stronger design-system rule adherence. It does not claim lower cost or overall UX quality.
- **Benchmark scope:** Tasks covered empty states, invoices, dashboards, onboarding, and payment-error recovery.

[Benchmark method](https://github.com/rizwan-uxd/atlas-design-system/tree/main/benchmarks) · [Full results](https://github.com/rizwan-uxd/atlas-design-system/blob/main/benchmarks/results/SUMMARY.md)

## North-star metric

The proposed north-star metric is:

> **Quality-passing screens per 1,000 context tokens**

This metric connects the two goals of the system: producing screens that follow Atlas rules while reducing the amount of context an agent needs to complete the work.

It is a metric I am continuing to develop and validate as the benchmark set grows.

## Explore Atlas

- **Figma:** [Atlas Design System](https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System-v1)
- **Live demo:** [Open the Atlas sandbox](https://atlas-design-system-lqyqko9es-rizwans-projects-cb102166.vercel.app/)
- **Component source:** [React component modules](https://github.com/rizwan-uxd/atlas-design-system/tree/main/packages/ui-web/src)
- **Repository:** [GitHub](https://github.com/rizwan-uxd/atlas-design-system)

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3030](http://localhost:3030).
