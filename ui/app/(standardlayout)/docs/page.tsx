"use client";

import React from "react";
import MarkdownViewer from "@/components/custom/MarkdownViewer";

const DocsPage = () => {
  return (
    <div>
      <MarkdownViewer filePath="./docs.md" />
    </div>
  );
};

export default DocsPage;
