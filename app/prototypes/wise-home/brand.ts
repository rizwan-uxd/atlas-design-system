/**
 * Wise brand colours — the scoped exception for this prototype (decision DEC-008).
 *
 * The cloned Wise home screen uses colours that have no Atlas semantic token. They live
 * here and only here: token-lint and atlas-verify accept non-semantic colours in
 * app/prototypes/<slug>/brand.ts and nowhere else. Everything else on the screen uses
 * semantic --atlas-* tokens.
 */
export const WISE = {
  /** Wise bright green — pills, badges, active tab icon fill */
  green: "#9fe870",
  /** Darker green — active tab stroke and label, links */
  greenDark: "#7acc4e",
  /** Forest ink on green surfaces */
  onGreen: "#1a3300",
  /** Fixed white app background — does not flip in dark mode */
  pageBg: "#ffffff",
  /** "Introducing Interest" promo card */
  promoCard: "oklch(0.18 0.04 25)",
  /** Coral flower artwork on the promo card */
  coralLight: "#e07060",
  coral: "#d45040",
  coralCentre: "#c04030",
  /** Translucent dismiss button on the promo card */
  onPromoOverlay: "rgba(255,255,255,0.15)",
  /** Muted text on the promo card */
  onPromoMuted: "rgba(255,255,255,0.65)",
  /** Singapore flag artwork */
  flagRed: "#EF3340",
  flagWhite: "#fff",
} as const
