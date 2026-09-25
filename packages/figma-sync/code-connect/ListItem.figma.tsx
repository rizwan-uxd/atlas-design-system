import figma from "@figma/code-connect"
import {
  ListItem,
  ListItemMedia,
  ListItemContent,
  ListItemTitle,
  ListItemDescription,
  ListItemActions,
} from "@atlas/ui-web/compositions/ListItem/ListItem"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

/**
 * Atlas ListItem — Code Connect
 * Figma node: 505:124 (List Item) · 504:21 (List Item Media, same page)
 *
 * Figma properties: Direction (horizontal | vertical) · Variant (default | outline | muted) · Size (sm | md)
 *   · Show media · Show title · Show description · Show actions · Title · Description
 * Show* booleans map to omitting the slot; Media and Action are instance swaps, so they stay children.
 */
figma.connect(
  ListItem,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=505-124",
  {
    props: {
      direction: figma.enum("Direction", { horizontal: "horizontal", vertical: "vertical" }),
      variant: figma.enum("Variant", { default: "default", outline: "outline", muted: "muted" }),
      size: figma.enum("Size", { sm: "sm", md: "md" }),
      media: figma.boolean("Show media", {
        true: (
          <ListItemMedia type="tile">
            <svg viewBox="0 0 16 16" />
          </ListItemMedia>
        ),
        false: undefined,
      }),
      title: figma.boolean("Show title", { true: figma.string("Title"), false: undefined }),
      description: figma.boolean("Show description", { true: figma.string("Description"), false: undefined }),
      actions: figma.boolean("Show actions", {
        true: (
          <ListItemActions>
            <Button variant="outline" size="sm">Action</Button>
          </ListItemActions>
        ),
        false: undefined,
      }),
    },
    example: ({ direction, variant, size, media, title, description, actions }) => (
      <ListItem direction={direction} variant={variant} size={size}>
        {media}
        <ListItemContent>
          {title && <ListItemTitle>{title}</ListItemTitle>}
          {description && <ListItemDescription>{description}</ListItemDescription>}
        </ListItemContent>
        {actions}
      </ListItem>
    ),
  }
)

figma.connect(
  ListItemMedia,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=504-21",
  {
    props: {
      type: figma.enum("Type", { icon: "icon", tile: "tile", image: "image" }),
    },
    example: ({ type }) => (
      <ListItemMedia type={type}>
        <svg viewBox="0 0 16 16" />
      </ListItemMedia>
    ),
  }
)
