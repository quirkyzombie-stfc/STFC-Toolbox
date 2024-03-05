import fs, { mkdirSync } from "fs";
import path from "path";
import fetch from "node-fetch";

// --------------------------------------------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------------------------------------------

const apiHost = "https://assets.stfc.space/data/latest/";
const apiLanguage = "en"; // For now only one language supported

export interface ApiTranslation {
  modified: string;
  id: string;
  text: string;
  key: string;
}

// --------------------------------------------------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------
// Implementation
// --------------------------------------------------------------------------------------------------------------------

async function loadVersion(): Promise<string> {
  const url = apiHost + "version.txt";
  return fetch(url).then((res) => res.text());
}

async function doFetch(url: string): Promise<any> {
  try {
    return await fetch(url).then((res) => res.json());
  } catch (e) {
    console.warn(`Skipping ${url}`, e);
    return null;
  }
}

async function loadJson<T>(
  version: string,
  outPath: string,
  endpoint: string,
): Promise<T> {
  const cacheFilePath = `${outPath}/${endpoint}.json`;
  mkdirSync(path.dirname(cacheFilePath), { recursive: true });

  if (fs.existsSync(cacheFilePath)) {
    console.info(`Loading /${endpoint}... (cached)`);
    const fileContent: string = fs.readFileSync(cacheFilePath, {
      encoding: "utf-8",
    });
    return JSON.parse(fileContent) as T;
  } else {
    console.info(`Loading /${endpoint}...`);
    const url = `${apiHost}${endpoint}.json?version=${version}`;
    const data: T = (await doFetch(url)) as T;
    const fileContent: string = JSON.stringify(data, undefined, "  ");
    fs.writeFileSync(cacheFilePath, fileContent);
    return data;
  }
}

async function loadJson2(data: any, endpoint: string, dataPath: string[]): Promise<any> {
  const version = data.version;
  const outPath = `../data/${version}`;
  const result = await loadJson(version, outPath, endpoint);

  const target = dataPath.slice(0, -1).reduce((prev, field) => {
    prev[field] = prev[field] || {};
    return prev[field];
  }, data);
  target[dataPath[dataPath.length - 1]] = result;
  return result;
}

async function main() {
  console.info(`Loading STFC data from ${apiHost}`);
  const version = await loadVersion();
  console.info(`Database version ${version}`);

  const outPath = `../data/${version}`;
  console.info(`Base output path: ${outPath}`);

  mkdirSync(outPath, { recursive: true });
  fs.writeFileSync(`${outPath}/version.json`, version);

  const content: any = {
    version,
  };

  // Download all translations
  const translations = [
    "officers",
    "officer_names",
    "officer_flavor_text",
    "officer_buffs",
    "research",
    "traits",
    "starbase_modules",
    "ship_components",
    "consumables",
    "systems",
    "factions",
    "mission_titles",
    "blueprints",
    "ship_buffs",
    "forbidden_tech",
    "navigation",
    "loyalty",
    "player_avatars",
    "materials",
    "ships",
  ];
  for (const translation of translations) {
    await loadJson2(content, `translations/${apiLanguage}/${translation}`, ["translations", translation]);
  }

  const summaries = [
    {name: "officer", load_details: true},
    {name: "ship", load_details: true},
    {name: "skins", load_details: false},
    {name: "research", load_details: true},
    {name: "system", load_details: true},
    {name: "building", load_details: true},
    {name: "hostile", load_details: true},
    {name: "consumable", load_details: false},
    // {name: "mission", load_details: -- we don't care about these
    {name: "forbidden_tech", load_details: true},
    {name: "resource", load_details: false},
  ];
  for (const summaryRow of summaries) {
    const summary = summaryRow.name;
    const loadDetails = summaryRow.load_details;
    const list = await loadJson2(content, `${summary}/summary`, [summary + "_summary"]);
    if (loadDetails && list !== null) {
      for (const item of list) {
        await loadJson2(content, `${summary}/${item.id}`, [summary, item.id]);
      }
    }
  }

  console.info(`Writing all.json file to ${outPath}`);
  fs.writeFileSync(`${outPath}/all.json`, JSON.stringify(content));
  fs.writeFileSync(`${outPath}/all-pretty.json`, JSON.stringify(content, undefined, "  "));
}

main();
