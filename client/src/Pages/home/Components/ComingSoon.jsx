import React from "react";
import { Header, EmptyState } from "../../../ui";

const COPY = {
  lists: { title: "Lists", icon: "fa-list", heading: "Discover new Lists", sub: "Lists are an easy way to organize and keep track of accounts. This feature is on the roadmap." },
  communities: { title: "Communities", icon: "fa-user-group", heading: "Discover new Communities", sub: "Communities bring people together around shared interests. Coming soon." },
  premium: { title: "Premium", icon: "fa-x", heading: "Upgrade to Premium", sub: "Premium unlocks an enhanced experience. This is a portfolio build — billing is not enabled." },
  more: { title: "More", icon: "fa-ellipsis", heading: "More options", sub: "Settings, display preferences, and more would live here." },
};

/**
 * Intentional placeholder for nav items that aren't core features, so links
 * land on a polished screen instead of a dead route.
 */
export default function ComingSoon({ which }) {
  const c = COPY[which] || COPY.more;
  return (
    <div style={{ minHeight: "100vh", borderRight: "1px solid var(--border)" }}>
      <Header title={c.title} showBack />
      <EmptyState icon={`fa-solid ${c.icon}`} title={c.heading} subtitle={c.sub} />
    </div>
  );
}
