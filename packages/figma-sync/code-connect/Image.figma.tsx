import figma from "@figma/code-connect"
import { Image } from "@atlas/ui-web/primitives/Image/Image"

/**
 * Atlas Image — Code Connect
 * Figma node: 534:35 (Image)
 *
 * Figma properties: Ratio (1:1 | 4:3 | 3:2 | 16:9 | 16:10 | 9:16 | 3:4 | 2:3 | 4:5 | auto),
 * State (loaded | loading | error). State is derived from the image in code, so it is not mapped.
 */
figma.connect(
  Image,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=534-35",
  {
    props: {
      ratio: figma.enum("Ratio", {
        "1:1": "1:1",
        "4:3": "4:3",
        "3:2": "3:2",
        "16:9": "16:9",
        "16:10": "16:10",
        "9:16": "9:16",
        "3:4": "3:4",
        "2:3": "2:3",
        "4:5": "4:5",
        auto: "auto",
      }),
    },
    example: ({ ratio }) => <Image src="/photo.jpg" alt="Describe the picture" ratio={ratio} />,
  }
)
