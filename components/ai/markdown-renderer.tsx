import React from "react";
import Link from "next/link";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight and secure inline markdown renderer for AI chat messages.
 * Supports: bold, italic, links [text](/href), inline code `code`, lists, and paragraphs.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Split by line breaks to handle paragraphs and lists
  const lines = content.split("\n");

  const renderInline = (text: string): React.ReactNode[] => {
    // Regex for: links [text](url), bold **text**, inline code `code`
    const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Link: [label](href)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isInternal = href.startsWith("/");
        if (isInternal) {
          return (
            <Link
              key={index}
              href={href}
              className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-900 transition-colors"
            >
              {label}
            </Link>
          );
        }
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-900 transition-colors"
          >
            {label} ↗
          </a>
        );
      }

      // Bold: **text**
      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return <strong key={index} className="font-semibold">{boldMatch[1]}</strong>;
      }

      // Code: `code`
      const codeMatch = part.match(/^`([^`]+)`$/);
      if (codeMatch) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-800 border border-slate-200">
            {codeMatch[1]}
          </code>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`space-y-1.5 leading-relaxed text-sm ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Bullet list item
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1">
              <span className="text-slate-400 select-none mt-0.5">•</span>
              <div className="flex-1">{renderInline(trimmed.slice(2))}</div>
            </div>
          );
        }

        // Numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1">
              <span className="text-slate-500 font-semibold select-none text-xs mt-0.5">{numMatch[1]}.</span>
              <div className="flex-1">{renderInline(numMatch[2])}</div>
            </div>
          );
        }

        return <p key={idx}>{renderInline(line)}</p>;
      })}
    </div>
  );
};
