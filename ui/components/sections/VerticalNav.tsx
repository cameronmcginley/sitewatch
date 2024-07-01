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
  open?: boolean;
};

type VerticalNavProps = {
  links: NavLink[];
};

const NavItem: React.FC<{ link: NavLink; level: number }> = ({
  link,
  level,
}) => {
  const [isOpen, setIsOpen] = useState(link.open || false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <li
      className={`!m-0 relative group ${
        level > 0 ? "border-l-2 border-gray-800 hover:border-white" : "py-1"
      }`}
    >
      {link.sublinks ? (
        <div>
          <button
            onClick={toggleOpen}
            className="w-fit gap-4 flex items-center justify-between hover:font-bold mx-4 py-2"
          >
            {link.name}
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          <Collapsible open={isOpen}>
            <CollapsibleContent
              className={`${isOpen ? "max-h-40" : "max-h-0"}`}
            >
              <ul className="ml-4 space-y-2">
                {link.sublinks.map((sublink, subIndex) => (
                  <NavItem key={subIndex} link={sublink} level={level + 1} />
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ) : (
        <Link
          href={link.href || "#"}
          className={
            "w-fit hover:font-bold block mx-4 py-2 " +
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
          <NavItem key={index} link={link} level={0} />
        ))}
      </ul>
    </div>
  );
};

export default VerticalNav;
