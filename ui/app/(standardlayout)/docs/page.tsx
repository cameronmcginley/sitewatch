import React from "react";
import fs from "fs";
import path from "path";
import MarkdownViewer from "@/components/custom/MarkdownViewer";

const DocsPage = () => {
  const filePath = path.join(process.cwd(), "public", "docs.md");
  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <div>
      <MarkdownViewer content={content} />
    </div>
  );
};

export default DocsPage;
