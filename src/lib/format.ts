import { marked } from "marked";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatDate = (date: Date): string => dateFormatter.format(date);

marked.setOptions({ breaks: true, gfm: true });

export const renderMarkdown = (markdown: string): string =>
  marked.parse(markdown, { async: false });
