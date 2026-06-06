import React from "react";
import Styles from "./Button.module.css";

/**
 * Standard button used across the app.
 *
 * variant: "primary" | "secondary" | "outline" | "danger" | "following"
 * size:    "sm" | "md" | "lg"
 *
 * The "following" variant shows its label normally and flips to "Unfollow"
 * (red) on hover via the `hoverLabel` prop.
 */
export default function Button({
  variant = "primary",
  size = "md",
  children,
  hoverLabel,
  className = "",
  type = "button",
  ...rest
}) {
  const classes = `${Styles.button} ${Styles[size]} ${Styles[variant]} ${className}`;

  if (hoverLabel) {
    return (
      <button
        type={type}
        className={classes}
        onMouseEnter={(e) => {
          e.currentTarget.dataset.label = e.currentTarget.textContent;
          e.currentTarget.textContent = hoverLabel;
        }}
        onMouseLeave={(e) => {
          if (e.currentTarget.dataset.label) e.currentTarget.textContent = e.currentTarget.dataset.label;
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
