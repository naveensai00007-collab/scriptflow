export function slugify(text: string, fallback = "untitled-script"): string {
  if (!text || !text.trim()) {
    return fallback;
  }
  const slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}
