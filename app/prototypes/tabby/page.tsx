"use client"

import React from "react"
import { FlowShell } from "../_shared/FlowShell"
import { useFlowState } from "../_shared/useFlowState"
import { TABBY_INITIAL, TABBY_STEPS, TABBY_GREEN, TabbyData, TabbyStepProps } from "./schema"
import { Splash } from "./steps/Splash"
import { Country } from "./steps/Country"
import { Marketing } from "./steps/Marketing"
import { Phone } from "./steps/Phone"
import { OTP } from "./steps/OTP"
import { PIN } from "./steps/PIN"
import { TrustDevice } from "./steps/TrustDevice"
import { Privacy } from "./steps/Privacy"
import { Success } from "./steps/Success"

export default function TabbyFlowPage() {
  const flow = useFlowState<TabbyData>({
    totalSteps: TABBY_STEPS.length,
    initialData: TABBY_INITIAL,
  })

  const stepProps: TabbyStepProps = {
    data: flow.data,
    patch: flow.patch,
    next: flow.next,
    back: flow.back,
    goTo: flow.goTo,
  }

  const stepKey = TABBY_STEPS[flow.step]

  // Step-specific phone-frame tinting
  const isSplash = stepKey === "splash"
  const phoneBackground = isSplash ? TABBY_GREEN : "var(--atlas-background)"
  const statusBarTint = "dark" as const

  return (
    <FlowShell
      title="Tabby — iOS onboarding"
      step={flow.step}
      totalSteps={TABBY_STEPS.length}
      onReset={flow.reset}
      phoneBackground={phoneBackground}
      statusBarTint={statusBarTint}
      homeIndicatorTint="dark"
    >
      {stepKey === "splash" && <Splash {...stepProps} />}
      {stepKey === "country" && <Country {...stepProps} />}
      {stepKey === "marketing" && <Marketing {...stepProps} />}
      {stepKey === "phone" && <Phone {...stepProps} />}
      {stepKey === "otp" && <OTP {...stepProps} />}
      {stepKey === "pin" && <PIN {...stepProps} />}
      {stepKey === "trust" && <TrustDevice {...stepProps} />}
      {stepKey === "privacy" && <Privacy {...stepProps} />}
      {stepKey === "success" && <Success {...stepProps} />}
    </FlowShell>
  )
}
