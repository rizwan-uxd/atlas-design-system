import type { Metadata } from "next"
import { RuntimeDemo } from "./RuntimeDemo"

export const metadata: Metadata = { title: "Atlas runtime demo" }

export default function Page() {
  return <RuntimeDemo />
}
