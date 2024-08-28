import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownViewer = ({ filePath }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(filePath)
      .then((response) => response.text())
      .then((text) => setContent(text))
      .catch((error) => console.error("Error loading markdown file:", error));
  }, [filePath]);

  const components = {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-semibold mb-3 mt-5" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-medium mb-2 mt-4" {...props} />
    ),
    p: ({ node, ...props }) => <p className="mb-4 text-gray-700" {...props} />,
    ul: ({ node, ...props }) => (
      <ul className="list-disc pl-5 mb-4" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-5 mb-4" {...props} />
    ),
    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
    a: ({ node, ...props }) => (
      <a className="text-blue-600 hover:underline" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic text-gray-600"
        {...props}
      />
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre className="bg-gray-200 rounded p-3 font-mono text-sm mb-4 overflow-auto">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code
          className="bg-gray-200 text-red-600 rounded px-1.5 py-0 font-mono text-sm border"
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
