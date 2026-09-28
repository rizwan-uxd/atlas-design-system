import figma from "@figma/code-connect"
import { Sidebar, SidebarHeader, SidebarBody, SidebarSection, SidebarFooter, SidebarCollapseToggle } from "@atlas/ui-web/layouts/Sidebar/Sidebar"

figma.connect(Sidebar, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=620-52", {
  props: {
    collapsed: figma.enum("Collapsed", { true: true, false: false }),
  },
  example: ({ collapsed }) => (
    <Sidebar collapsed={collapsed}>
      <SidebarHeader>
        {/* workspace switcher slot */}
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection label="Navigation">
          {/* SidebarMenuRow items */}
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarCollapseToggle />
      </SidebarFooter>
    </Sidebar>
  ),
})
