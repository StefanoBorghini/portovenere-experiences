// Congiunzione "and"/"e" — un'unica parola comune, non serve passare
// da Lara per questa: hardcoded per le locale supportate.
const AND_BY_LOCALE: Record<string, string> = {
  en: " and ",
  it: " e ",
};

export function sentenceBuilder(items: string[], locale: string = "en") {

  const and = AND_BY_LOCALE[locale] ?? AND_BY_LOCALE.en;

  if (items.length === 0)
    return "";

  if (items.length === 1)
    return items[0];

  if (items.length === 2)
    return `${items[0]}${and}${items[1]}`;

  return `${items.slice(0, -1).join(", ")}${and}${items.at(-1)}`;

}