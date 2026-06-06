import React from "react";
import { Link } from "react-router-dom";

const SIZES = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64, xxl: 133 };

/**
 * Circular user avatar. If `username` is given, wraps in a Link to the profile.
 * `referrerPolicy=no-referrer` keeps Google-hosted avatars from 403-ing.
 */
export default function Avatar({ src, alt = "", size = "md", username, onClick, style }) {
  const px = SIZES[size] || size;
  const img = (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onClick={onClick}
      style={{
        width: px,
        height: px,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        cursor: onClick || username ? "pointer" : "default",
        backgroundColor: "var(--bg-input)",
        ...style,
      }}
    />
  );

  if (username) {
    return (
      <Link to={`/${username}`} onClick={(e) => e.stopPropagation()}>
        {img}
      </Link>
    );
  }
  return img;
}
