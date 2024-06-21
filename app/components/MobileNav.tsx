import { Link, type LinkProps, useNavigate } from "@remix-run/react";
import { useState } from "react";

import { Button } from "~/components/ui/button.tsx";
import { Icon } from "~/components/ui/icon.tsx";
import { ScrollArea } from "~/components/ui/scroll-area.tsx";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet.tsx";
import { siteConfig } from "~/config/site.ts";
import { cn } from "~/lib/utils.ts";

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
}
function MobileLink({
  to,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const navigate = useNavigate();

  return (
    <Link
      to={to}
      onClick={() => {
        navigate(to);
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Icon name="view-vertical" className="h-5 w-5">
            <span className="sr-only">Toggle Menu</span>
          </Icon>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <MobileLink to="/" className="flex items-center" onOpenChange={setOpen}>
          <img
            src="/img/logo.webp"
            alt="Logo"
            height="128"
            width="128"
            className="mr-2 h-4 w-4"
          />
          <span className="font-bold">{siteConfig.name}</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6" />
      </SheetContent>
    </Sheet>
  );
}
