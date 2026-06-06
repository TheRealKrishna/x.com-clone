/**
 * Best-effort country lookup via IP, used to help parse phone numbers.
 * Returns a country code string or undefined. Never throws.
 */
let cached;

export async function getCountry() {
  if (cached !== undefined) return cached;
  try {
    const res = await fetch("https://ipapi.co/json/");
    const json = await res.json();
    cached = json.country || undefined;
  } catch {
    cached = undefined;
  }
  return cached;
}
