// Agent text must be copy, never markup: this is how "0 outputs containing CSS, HTML or JSX" is enforced before an
// agent exists. Patterns are ordered; the first match names the finding. Plain prose with a colon ("Email:
// required") passes because only CSS property names count as declarations.
const PATTERNS: Array<[string, RegExp]> = [
  ["html comment", /<!--/],
  ["html tag", /<\/?[A-Za-z][\w:-]*(\s[^<>]*)?\/?>/],
  ["css declaration", /(?:^|[\s;{"'])(?:color|background(?:-[a-z]+)?|margin(?:-[a-z]+)?|padding(?:-[a-z]+)?|font(?:-[a-z]+)?|display|position|width|height|border(?:-[a-z]+)?|top|left|right|bottom|z-index|opacity|transform)\s*:\s*\S/i],
  ["css declaration", /(?:^|\s)(?:style|class|className)\s*=/],
  ["jsx expression", /\{[^{}]*\}/],
  ["script url", /javascript\s*:/i],
  ["css function", /\b(?:url|expression)\s*\(/i],
]

export function findMarkup(text: string): string | null {
  for (const [kind, re] of PATTERNS) if (re.test(text)) return kind
  return null
}
