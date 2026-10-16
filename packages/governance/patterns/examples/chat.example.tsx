import * as React from "react"
import { Send } from "lucide-react"
import { Avatar } from "@atlas/ui-web/primitives/Avatar/Avatar"
import { Bubble, BubbleGroup } from "@atlas/ui-web/primitives/Bubble/Bubble"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Textarea } from "@atlas/ui-web/primitives/Textarea/Textarea"

type Message = {
  id: string
  from: "me" | "them"
  text: string
  status?: "sending" | "failed"
}

const muted = { fontSize: "var(--atlas-text-body-sm)", color: "var(--atlas-foreground-muted)" }
const NEAR_BOTTOM = 48

export function ChatThread({ partner, messages, onSend, onRetry }: {
  partner: { name: string; initials: string }
  messages: Message[]
  /** Resolves when the message is accepted. A rejected promise marks it failed. */
  onSend: (text: string) => Promise<void>
  onRetry: (id: string) => void
}) {
  const [draft, setDraft] = React.useState("")
  const [unseen, setUnseen] = React.useState(false)
  const listRef = React.useRef<HTMLDivElement>(null)
  const atBottom = React.useRef(true)

  const scrollToEnd = () => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
    setUnseen(false)
  }

  // New messages follow the user only when they are already at the bottom.
  React.useEffect(() => {
    if (atBottom.current) scrollToEnd()
    else setUnseen(true)
  }, [messages.length])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    // Keep the draft until the message is accepted so a failure never loses the text.
    onSend(text).then(() => setDraft("")).catch(() => {})
  }

  // Group consecutive messages from one sender.
  const groups: Array<{ from: Message["from"]; items: Message[] }> = []
  for (const m of messages) {
    const last = groups[groups.length - 1]
    if (last && last.from === m.from) last.items.push(m)
    else groups.push({ from: m.from, items: [m] })
  }

  return (
    <div style={{ display: "grid", gridTemplateRows: "1fr auto", blockSize: "100%", gap: "var(--atlas-spacing-3)" }}>
      <div
        ref={listRef}
        role="log"
        aria-label={`Conversation with ${partner.name}`}
        onScroll={(e) => {
          const el = e.currentTarget
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM
          if (atBottom.current) setUnseen(false)
        }}
        style={{ overflowY: "auto", display: "grid", alignContent: "start", gap: "var(--atlas-spacing-4)" }}
      >
        {groups.map((g, i) => (
          <div key={i} style={{ display: "grid", gap: "var(--atlas-spacing-1)", justifyItems: g.from === "me" ? "end" : "start" }}>
            {g.from === "them" && (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-2)" }}>
                <Avatar size="sm" initials={partner.initials} alt="" />
                <span style={muted}>{partner.name}</span>
              </div>
            )}
            <BubbleGroup aria-label={g.from === "me" ? "You" : partner.name}>
              {g.items.map((m) => (
                <Bubble
                  key={m.id}
                  align={g.from === "me" ? "end" : "start"}
                  variant={m.status === "failed" ? "destructive" : g.from === "me" ? "primary" : "secondary"}
                >
                  {m.text}
                </Bubble>
              ))}
            </BubbleGroup>
            {g.items.map((m) =>
              m.status === "sending" ? (
                <span key={m.id} style={muted}>Sending</span>
              ) : m.status === "failed" ? (
                <span key={m.id} style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-2)" }}>
                  <span style={muted}>Not sent</span>
                  <Button variant="ghost" size="xs" onClick={() => onRetry(m.id)}>Retry</Button>
                </span>
              ) : null,
            )}
          </div>
        ))}
      </div>

      {unseen && (
        <Button variant="outline" onClick={scrollToEnd}>New messages</Button>
      )}

      <div style={{ display: "flex", alignItems: "end", gap: "var(--atlas-spacing-3)" }}>
        <Textarea
          autoGrow
          maxRows={5}
          aria-label="Message"
          placeholder="Write a message. Enter sends, Shift+Enter adds a line."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() }
          }}
        />
        <Button variant="primary" iconOnly aria-label="Send message" disabled={!draft.trim()} onClick={send}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  )
}
