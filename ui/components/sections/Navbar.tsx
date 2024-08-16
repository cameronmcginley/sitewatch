"use client";

import React, { useEffect, useState } from "react";
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
import { PersonIcon } from "@radix-ui/react-icons";
import {
  USER_TYPE_TO_DISPLAY_TEXT,
  USER_TYPE_TO_LIMITS,
} from "@/lib/constants";
import { FaGithub } from "react-icons/fa";

const navigationMenuItems: {
  title: string;
  href: string;
  links?: { title: string; href: string; description: string }[];
}[] = [
  { title: "Application", href: "/test" },
  { title: "Docs", href: "/docs" },
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
        {/* Left side */}
        <NavigationMenu>
          <NavigationMenuList>
            <Link href="/" className={navigationMenuTriggerStyle() + " flex"}>
              <div className="text-xl font-bold hover:text-blue-500 transition ease-in-out delay-50">
                Site<span className="text-blue-500">Watch</span>
              </div>
            </Link>

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
                            className=""
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

            <a
              href="https://github.com/your-github-username"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 px-4"
            >
              <FaGithub size={24} />
            </a>
          </NavigationMenuList>
        </NavigationMenu>
        {/* Right side */}
        <div>
          {status === "loading" ? (
            <></>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex rounded-full hover:bg-accent w-9 h-9 justify-center items-center cursor-pointer">
                  <PersonIcon className="w-6 h-6 w-max h-max" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="">
                <DropdownMenuItem>
                  <div className="flex flex-col">
                    <span className="font-medium">{session.user?.email}</span>
                    <span className="text-sm text-muted-foreground">
                      {USER_TYPE_TO_DISPLAY_TEXT[session.user?.userType] ?? ""}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Check Limit:{""}
                      {USER_TYPE_TO_LIMITS[session.user?.userType] ?? ""}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer"
                >
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
