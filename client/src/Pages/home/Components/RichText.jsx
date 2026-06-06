import React from "react";
import { Link } from "react-router-dom";

/**
 * Render post text with #hashtags and @mentions turned into links.
 * Splits on a combined regex and rebuilds with <Link> nodes.
 */
export default function RichText({ text, className }) {
  if (!text) return null;
  const parts = text.split(/(#[\p{L}\p{N}_]+|@[a-zA-Z0-9_]+)/gu);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (/^#[\p{L}\p{N}_]+$/u.test(part)) {
          return (
            <Link
              key={i}
              to={`/explore?q=${encodeURIComponent(part)}`}
              style={{ color: "var(--x-blue)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        if (/^@[a-zA-Z0-9_]+$/.test(part)) {
          return (
            <Link
              key={i}
              to={`/${part.slice(1)}`}
              style={{ color: "var(--x-blue)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
