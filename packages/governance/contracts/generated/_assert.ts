// GENERATED — do not hand-edit. registry-build; run npm run registry:build.
// Helpers for the generated contracts. Tuple form ([A] extends [B]) stops a union from distributing,
// so Exact catches a member REMOVED as well as one added — the hole in the hand-written contracts.
export type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
/** Per-prop existence: cannot collapse the way Pick<P, keyof A & keyof P> did when a prop was deleted. */
export type Has<P, K extends PropertyKey> = K extends keyof P ? true : false
export type IsOptional<P, K extends PropertyKey> = K extends keyof P ? ({} extends Pick<P, K> ? true : false) : false
/** A false assertion is a type error on the line that names it (`type Own_iconOnly = Assert<…>`). */
export type Assert<T extends true> = T
