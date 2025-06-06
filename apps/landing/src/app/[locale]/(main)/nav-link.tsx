"use client";

import { cn } from "@rallly/ui";
import { Button } from "@rallly/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NavLink = ({
  className,
  ...props
}: React.ComponentProps<typeof Link>) => {
  const pathname = usePathname();
  const isActive = pathname === props.href;
  return (
    <Button
      className={cn(isActive ? "bg-gray-200 text-foreground" : "", className)}
      asChild
      variant="ghost"
    >
      <Link {...props} />
    </Button>
  );
};
