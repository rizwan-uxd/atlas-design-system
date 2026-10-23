// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Sidebar.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Sidebar } from "@atlas/ui-web/layouts/Sidebar/Sidebar"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Sidebar>

// own props of Sidebar: deleting one, or flipping its optionality, fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Own_collapsed = Assert<Has<P, "collapsed">>
type Optional_collapsed = Assert<Exact<IsOptional<P, "collapsed">, true>>
type Own_onCollapsedChange = Assert<Has<P, "onCollapsedChange">>
type Optional_onCollapsedChange = Assert<Exact<IsOptional<P, "onCollapsedChange">, true>>
