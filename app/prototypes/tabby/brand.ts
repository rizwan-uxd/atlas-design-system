/**
 * Tabby brand colours — the scoped exception for this prototype (decision DEC-008).
 *
 * The cloned Tabby screens use colours that have no Atlas semantic token. They live
 * here and only here: token-lint and atlas-verify accept non-semantic colours in
 * app/prototypes/<slug>/brand.ts and nowhere else. Everything else in the flow uses
 * semantic --atlas-* tokens.
 */
export const TABBY = {
  /** Mint green splash background */
  green: "#3BFFC1",
  /** Black ink for Tabby's CTAs, headlines and filled keys — fixed, does not flip in dark mode */
  ink: "var(--atlas-color-neutral-950)",
  /** Secondary ink on the marketing slides */
  inkSoft: "var(--atlas-color-neutral-800)",
  /** Text on ink */
  onInk: "var(--atlas-color-neutral-0)",
  /** First marketing slide artwork */
  slideGradient: "linear-gradient(140deg, #F2D26E 0%, #5CCFC2 100%)",
  /** Soft shadow under the marketing emoji artwork */
  artworkShadow: "drop-shadow(0 4px 16px rgba(0,0,0,0.08))",
  /** Inactive carousel dot over the artwork */
  dotInactive: "rgba(0,0,0,0.25)",
} as const
