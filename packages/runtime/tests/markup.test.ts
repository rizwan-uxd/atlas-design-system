import { describe, expect, it } from "vitest"
import { findMarkup } from "@atlas/runtime/markup"

const REJECT: Array<[string, string]> = [
  ["<div>", "html tag"], ["</span>", "html tag"], ["<img src=x onerror=alert(1)>", "html tag"], ["<br/>", "html tag"],
  ["<Button variant=\"primary\" />", "html tag"], ["<!-- hi -->", "html comment"],
  ["color: red", "css declaration"], ["background-color:#fff", "css declaration"], ["padding: 4px", "css declaration"],
  ["style=\"x\"", "css declaration"], ["className=\"p-4\"", "css declaration"],
  ["{user.name}", "jsx expression"], ["javascript:alert(1)", "script url"], ["url(evil.png)", "css function"],
]
const ACCEPT = ["Work email", "Enter a valid work email", "Email: required", "We will email you when access is approved.", "3 < 4 and 5 > 2", "Organisation"]

describe("runtime/markup >", () => {
  it.each(REJECT)("rejects %s as %s", (text, kind) => expect(findMarkup(text)).toBe(kind))
  it.each(ACCEPT)("accepts %s", (text) => expect(findMarkup(text)).toBeNull())
})
