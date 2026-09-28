import figma from "@figma/code-connect"
import { Chart, ChartHeader, ChartTitle, ChartDescription, ChartContent } from "@atlas/ui-web/compositions/Chart/Chart"

figma.connect(
  Chart,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=660-247",
  {
    props: {
      state:       figma.enum("State", { default: "default", loading: "loading", empty: "empty" }),
      title:       figma.string("Title"),
      description: figma.string("Description"),
    },
    example: ({ state, title, description }) => (
      <Chart state={state}>
        <ChartHeader>
          <ChartTitle>{title}</ChartTitle>
          <ChartDescription>{description}</ChartDescription>
        </ChartHeader>
        <ChartContent>{/* <ChartBar aria-label="…" data={rows} xKey="date" dataKey="value" label="Series" /> */}</ChartContent>
      </Chart>
    ),
  }
)
