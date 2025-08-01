import { SidebarInset } from "@rallly/ui/sidebar";
import { redirect } from "next/navigation";
import { requireUser } from "@/auth/data";
import { LicenseLimitWarning } from "@/features/licensing/components/license-limit-warning";
import { CommandMenu } from "@/features/navigation/command-menu";
import { isUserOnboarded } from "@/features/setup/utils";
import { SpaceSidebar } from "./components/sidebar/space-sidebar";
import { SpaceSidebarProvider } from "./components/sidebar/space-sidebar-provider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!isUserOnboarded(user)) {
    redirect("/setup");
  }

  return (
    <SpaceSidebarProvider>
      <CommandMenu />
      <SpaceSidebar />
      <SidebarInset className="min-w-0">
        <LicenseLimitWarning />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </SidebarInset>
    </SpaceSidebarProvider>
  );
}
