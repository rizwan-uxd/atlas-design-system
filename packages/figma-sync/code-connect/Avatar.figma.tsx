import figma from "@figma/code-connect"
import { Avatar, AvatarGroup } from "@atlas/ui-web/primitives/Avatar/Avatar"

/**
 * Atlas Avatar — Code Connect
 * Figma node: 487:720 (Avatar) · 488:452 (Avatar Group, same page)
 *
 * Figma properties: Type (Image | Text | Icon) · Size · Shape · Show status · Show badge icon · Text
 * Type is derived in code: `src` → Image, `initials` → Text, neither → Icon.
 */
figma.connect(
  Avatar,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=487-720",
  {
    props: {
      type: figma.enum("Type", { Image: "image", Text: "text", Icon: "icon" }),
      size: figma.enum("Size", { xs: "xs", sm: "sm", md: "md", lg: "lg", xl: "xl" }),
      shape: figma.enum("Shape", { circle: "circle", squircle: "squircle" }),
      showStatus: figma.boolean("Show status"),
      showBadgeIcon: figma.boolean("Show badge icon"),
      initials: figma.string("Text"),
    },
    example: ({ type, size, shape, showStatus, showBadgeIcon, initials }) => (
      <Avatar
        size={size}
        shape={shape}
        alt="Jane Cooper"
        src={type === "image" ? "/avatar.jpg" : undefined}
        initials={type === "text" ? initials : undefined}
        showStatus={showStatus}
        statusLabel="Online"
        showBadgeIcon={showBadgeIcon}
      />
    ),
  }
)

figma.connect(
  AvatarGroup,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=488-452",
  {
    props: {
      size: figma.enum("Size", { xs: "xs", sm: "sm", md: "md", lg: "lg", xl: "xl" }),
      shape: figma.enum("Shape", { circle: "circle", squircle: "squircle" }),
      showAdd: figma.boolean("Show add avatar"),
    },
    example: ({ size, shape, showAdd }) => (
      <AvatarGroup size={size} shape={shape} showAdd={showAdd} aria-label="Project members">
        <Avatar alt="Jane Cooper" initials="JC" />
        <Avatar alt="Dev Patel" initials="DP" />
        <Avatar alt="Sam Lee" initials="SL" />
      </AvatarGroup>
    ),
  }
)
