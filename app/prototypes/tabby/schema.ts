/**
 * Tabby flow — shared types, constants, and step list.
 */

export type Country = {
  code: string
  name: string
  flag: string
  dialCode: string
}

export const COUNTRIES: Country[] = [
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dialCode: "+965" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", dialCode: "+973" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dialCode: "+20" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dialCode: "+974" },
]

export type TabbyData = {
  country: Country | null
  phone: string
  otp: string
  pin: string
  trustedDevice: boolean
  agreedPrivacy: boolean
}

export const TABBY_INITIAL: TabbyData = {
  country: null,
  phone: "",
  otp: "",
  pin: "",
  trustedDevice: false,
  agreedPrivacy: false,
}

/** Step order — order of indices the user moves through */
export const TABBY_STEPS = [
  "splash",
  "country",
  "marketing",
  "phone",
  "otp",
  "pin",
  "trust",
  "privacy",
  "success",
] as const

export type TabbyStepKey = (typeof TABBY_STEPS)[number]

/** Props every Tabby step receives */
export type TabbyStepProps = {
  data: TabbyData
  patch: (partial: Partial<TabbyData>) => void
  next: () => void
  back: () => void
  goTo: (index: number) => void
}
