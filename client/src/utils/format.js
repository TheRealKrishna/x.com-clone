// Relative post age like Twitter: 12s, 5m, 3h, 2d, then "Mar 5" / "Mar 5, 2023".
export function formatPostAge(date) {
  const then = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return `${Math.max(seconds, 0)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d`;

  const options = { month: "short", day: "numeric" };
  if (now - then >= 31536000000) options.year = "numeric";
  return then.toLocaleDateString(undefined, options);
}

// "Joined March 2024"-style month + year.
export function formatJoinedDate(date) {
  return new Date(date).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

// Full timestamp for message tooltips / chat separators.
export function formatTime(date) {
  return new Date(date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
