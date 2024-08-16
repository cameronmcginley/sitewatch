import React from "react";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-300 py-8">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="text-gray-700">
          <p>See more about me and my projects here!</p>
          <a href="https://cameronmcginley.com" className="text-blue-500">
            cameronmcginley.com
          </a>
        </div>
        <div>
          <a
            href="https://github.com/cameronmcginley/sitewatch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-gray-900"
          >
            <FaGithub size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}
