import React from "react";
import Link from "next/link";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight and secure inline markdown renderer for AI chat messages.
 * Supports: headings, bold, italic, links [text](/href), inline code `code`, lists, rules, and paragraphs.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  const lines = content.split("\n");

  const renderInline = (text: string): React.ReactNode[] => {
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
              className="inline-flex items-center gap-1 font-semibold text-teal-700 bg-teal-50/90 hover:bg-teal-100/90 border border-teal-200/70 px-2 py-0.5 rounded-lg text-[13px] transition-all hover:shadow-2xs group my-0.5 align-baseline"
            >
              <span>{label}</span>
              <span className="text-[10px] text-teal-500 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          );
        }
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-teal-700 bg-teal-50/90 hover:bg-teal-100/90 border border-teal-200/70 px-2 py-0.5 rounded-lg text-[13px] transition-all hover:shadow-2xs group my-0.5 align-baseline"
          >
            <span>{label}</span>
            <span className="text-[10px] text-teal-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
          </a>
        );
      }

      // Bold: **text**
      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return <strong key={index} className="font-bold text-slate-900">{boldMatch[1]}</strong>;
      }

      // Code: `code`
      const codeMatch = part.match(/^`([^`]+)`$/);
      if (codeMatch) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-[12px] text-slate-800 font-medium border border-slate-200/70 shadow-2xs">
            {codeMatch[1]}
          </code>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`space-y-1.5 leading-relaxed text-[13.5px] ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Horizontal Rule
        if (trimmed === "---" || trimmed === "***") {
          return <hr key={idx} className="my-2 border-slate-200" />;
        }

        // Heading 3
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-slate-900 text-[14px] mt-2.5 mb-1 tracking-tight">
              {renderInline(trimmed.slice(4))}
            </h4>
          );
        }

        // Heading 2
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-extrabold text-slate-900 text-[15px] mt-3 mb-1.5 tracking-tight">
              {renderInline(trimmed.slice(3))}
            </h3>
          );
        }

        // Bullet list item
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-0.5 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0 select-none shadow-2xs" />
              <div className="flex-1 leading-relaxed text-slate-700">{renderInline(trimmed.slice(2))}</div>
            </div>
          );
        }

        // Numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 my-0.5">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-50 border border-teal-200/90 text-teal-800 font-bold text-[10px] shrink-0 mt-0.5 select-none">
                {numMatch[1]}
              </span>
              <div className="flex-1 leading-relaxed text-slate-700">{renderInline(numMatch[2])}</div>
            </div>
          );
        }

        return <p key={idx} className="text-slate-800 leading-relaxed">{renderInline(line)}</p>;
      })}
    </div>
  );
};
