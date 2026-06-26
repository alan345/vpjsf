const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatDate = (date: Date): string => dateFormatter.format(date);
