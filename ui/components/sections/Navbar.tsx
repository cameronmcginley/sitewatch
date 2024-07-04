"use client";

import React from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

const gettingStartedLinks: {
  title: string;
  href: string;
  description: string;
}[] = [
  {
    title: "Introduction",
    href: "/docs",
    description: "Re-usable components built using Radix UI and Tailwind CSS.",
  },
  {
    title: "Installation",
    href: "/docs/installation",
    description: "How to install dependencies and structure your app.",
  },
  {
    title: "Typography",
    href: "/docs/primitives/typography",
    description: "Styles for headings, paragraphs, lists...etc",
  },
];

const navigationMenuItems = [
  {
    title: "Getting started",
    links: gettingStartedLinks,
  },
  {
    title: "Components",
    links: components,
  },
  {
    title: "Documentation",
    href: "/docs",
  },
];

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();

  return (
    <div className="w-full justify-center items-center flex border-b py-2">
      <div className="max-w-7xl w-full flex justify-between items-center">
        <NavigationMenu>
          <NavigationMenuList className="">
            {navigationMenuItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                {item.links ? (
                  <>
                    <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        {item.links.map((link) => (
                          <ListItem
                            key={link.title}
                            href={link.href}
                            title={link.title}
                          >
                            {link.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    href={item.href}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.title}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div>
          {status === "loading" ? (
            <></>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={session.user?.image ?? undefined} />
                  <AvatarFallback>{session.user?.email?.[0]}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <div className="flex flex-col">
                    <span className="font-medium">{session.user?.email}</span>
                    <span className="text-sm text-muted-foreground">
                      Free Tier
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !session &&
            !window.location.pathname.includes("/sign-in") && (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={() => signIn()}
              >
                Sign in
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
