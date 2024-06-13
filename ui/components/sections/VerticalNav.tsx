"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Ensure you have react-icons installed

type NavLink = {
  name: string;
  href?: string;
  sublinks?: NavLink[];
  className?: string;
};

type VerticalNavProps = {
  links: NavLink[];
};

const NavItem: React.FC<{ link: NavLink }> = ({ link }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <li className="!m-0">
      {link.sublinks ? (
        <div>
          <div className="w-fit gap-6 flex items-center justify-between rounded ">
            <Link
              href={link.href || "#"}
              className={
                "w-fit hover:underline block px-4 py-2 " +
                (link.className ? link.className : "")
              }
            >
              {link.name}
            </Link>
            <button
              onClick={toggleOpen}
              className="hover:underline flex items-center justify-center text-left"
            >
              {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          <Collapsible open={isOpen}>
            <CollapsibleContent
              className={`${isOpen ? "max-h-40" : "max-h-0"}`}
            >
              <ul className="pl-4 space-y-2">
                {link.sublinks.map((sublink, subIndex) => (
                  <NavItem key={subIndex} link={sublink} />
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ) : (
        <Link
          href={link.href || "#"}
          className={
            "w-fit hover:underline block px-4 rounded py-2 " +
            (link.className ? link.className : "")
          }
        >
          {link.name}
        </Link>
      )}
    </li>
  );
};

const VerticalNav: React.FC<VerticalNavProps> = ({ links }) => {
  return (
    <div className="w-full h-full">
      <ul className="space-y-2 p-4">
        {links.map((link, index) => (
          <NavItem key={index} link={link} />
        ))}
      </ul>
    </div>
  );
};

export default VerticalNav;
