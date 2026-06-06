import React from "react";
import Styles from "./IconButton.module.css";

/**
 * Round icon button. Pass a FontAwesome class via `icon`, or arbitrary children.
 * variant: undefined | "blue" | "like" | "repost" | "danger" — controls hover tint.
 */
export default function IconButton({ icon, variant, active, className = "", title, children, ...rest }) {
  const classes = `${Styles.iconButton} ${variant ? Styles[variant] : ""} ${
    active ? Styles.active : ""
  } ${className}`;
  return (
    <button type="button" className={classes} title={title} aria-label={title} {...rest}>
      {children || <i className={icon} />}
    </button>
  );
}
