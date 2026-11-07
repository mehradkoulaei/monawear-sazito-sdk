import sanitize from "sanitize-html";

/** Sazito CMS / description HTML is sanitized on the server before rendering. */
export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "a", "img", "table", "thead", "tbody", "tr", "th", "td",
      "blockquote", "span", "div", "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "width", "height", "loading"],
      "*": ["dir", "class", "style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitize.simpleTransform("a", { rel: "noopener noreferrer" }),
      h1: sanitize.simpleTransform("h2"),
    },
  });
}
