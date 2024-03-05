import { ApiAllData, ApiTranslation } from "./types";

export function fixShipCase(o: string): string {
  return o
    .toLowerCase()
    .replace(/\b(\w)/g, (s) => s.toUpperCase())
    .replace("Uss", "USS")
    .replace("Iss", "ISS");
}

export function fixOfficerCase(o: string): string {
  return o.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
}

export function lookupName<T extends string>(
  translations: ApiTranslation<T>[],
  id: number | string,
  key: T,
  defaultValue: string = `<${id}>.${key}`
) {
  return (
    translations.find((t) => t.id == "" + id && t.key === key)?.text ||
    defaultValue
  );
}

export function forEachShip(data: ApiAllData, f: (id: number) => void): void {
  const ids = data.lship.map((x) => x.id);
  ids.forEach(f);
}
