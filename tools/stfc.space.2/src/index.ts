import fs, { mkdirSync } from "fs";
import fetch from "node-fetch";

import stringify from "json-stringify-pretty-compact";

import {
  ApiTranslation,
  ApiTMaterial,
  ApiTShip,
  ApiTOfficer,
  ApiTOfficerSynergy,
  ApiTOfficerDivision,
  ApiTResearch,
  ApiTBuilding,
  ApiTBuildingBuff,
  ApiTFaction,
  ApiTShipType,
  ApiTSystem,
  ApiTShipComponent,
  ApiTConsumable,
  ApiTHostile,
  ApiLResource,
  ApiLShip,
  ApiLOfficer,
  ApiLBuilding,
  ApiLResearch,
  ApiLSystem,
  ApiLHostile,
  ApiLConsumable,
  ApiDShip,
  ApiDHostile,
  ApiDResearch,
  ApiAllData,
  ApiDOfficer,
  ApiDSystem,
} from "./types";

// --------------------------------------------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------------------------------------------

const apiHost = "https://api.stfc.dev/v1/"; // https://staging.api.stfc.dev/v1
const apiLanguage = "en"; // For now only one language supported

// --------------------------------------------------------------------------------------------------------------------
// Implementation - download the whole database
// --------------------------------------------------------------------------------------------------------------------

async function loadVersion(): Promise<string> {
  const url = apiHost + "version";
  return fetch(url).then((res) => res.text());
}

async function loadJson<T>(version: string, endpoint: string): Promise<T> {
  console.info(`Loading /${endpoint}...`);
  const url = `${apiHost}${endpoint}?version=${version}`;
  return fetch(url).then((res) => res.json());
}

async function main() {
  console.info(`Loading STFC data from ${apiHost}`);
  const version = await loadVersion();
  console.info(`Database version ${version}`);

  // Download all translations
  const translationBasePath = `translations/${apiLanguage}/`;
  const tmaterials = await loadJson<ApiTMaterial[]>(
    version,
    translationBasePath + "materials"
  );
  const tships = await loadJson<ApiTShip[]>(
    version,
    translationBasePath + "ships"
  );
  const tofficers = await loadJson<ApiTOfficer[]>(
    version,
    translationBasePath + "officers"
  );
  const tofficers_synergy = await loadJson<ApiTOfficerSynergy[]>(
    version,
    translationBasePath + "officers_synergy"
  );
  const tresearch = await loadJson<ApiTResearch[]>(
    version,
    translationBasePath + "research"
  );
  const tbuildings = await loadJson<ApiTBuilding[]>(
    version,
    translationBasePath + "buildings"
  );
  const tbuilding_buffs = await loadJson<ApiTBuildingBuff[]>(
    version,
    translationBasePath + "building_buffs"
  );
  const tfactions = await loadJson<ApiTFaction[]>(
    version,
    translationBasePath + "factions"
  );
  const tofficer_division = await loadJson<ApiTOfficerDivision[]>(
    version,
    translationBasePath + "officer_division"
  );
  const tship_type = await loadJson<ApiTShipType[]>(
    version,
    translationBasePath + "ship_type"
  );
  const tsystems = await loadJson<ApiTSystem[]>(
    version,
    translationBasePath + "systems"
  );
  const tship_components = await loadJson<ApiTShipComponent[]>(
    version,
    translationBasePath + "ship_components"
  );
  const tconsumables = await loadJson<ApiTConsumable[]>(
    version,
    translationBasePath + "consumables"
  );
  const thostiles = await loadJson<ApiTHostile[]>(
    version,
    translationBasePath + "hostiles"
  );

  // Download all indices
  const lresource = await loadJson<ApiLResource[]>(version, "resource");
  const lship = await loadJson<ApiLShip[]>(version, "ship");
  const lofficer = await loadJson<ApiLOfficer[]>(version, "officer");
  const lbuilding = await loadJson<ApiLBuilding[]>(version, "building");
  const lresearch = await loadJson<ApiLResearch[]>(version, "research");
  const lsystem = await loadJson<ApiLSystem[]>(version, "system");
  const lhostile = await loadJson<ApiLHostile[]>(version, "hostile");
  const lconsumable = await loadJson<ApiLConsumable[]>(version, "consumable");

  // Download all details
  const dship = [] as ApiDShip[];
  for (const l of lship) {
    const d = await loadJson<ApiDShip>(version, `ship/${l.id}`);
    dship.push(d);
  }

  const dhostile = [] as ApiDHostile[];
  for (const l of lhostile) {
    const d = await loadJson<ApiDHostile>(version, `hostile/${l.id}`);
    dhostile.push(d);
  }

  const dresearch = [] as ApiDResearch[];
  for (const l of lresearch) {
    const d = await loadJson<ApiDResearch>(version, `research/${l.id}`);
    dresearch.push(d);
  }

  const dofficer = [] as ApiDOfficer[];
  for (const l of lofficer) {
    const d = await loadJson<ApiDOfficer>(version, `officer/${l.id}`);
    dofficer.push(d);
  }

  const dsystem = [] as ApiDSystem[];
  for (const l of lsystem) {
    const d = await loadJson<ApiDSystem>(version, `system/${l.id}`);
    dsystem.push(d);
  }

  const outPath = `./out/${version}`;
  mkdirSync(outPath, { recursive: true });

  const content: ApiAllData = {
    version,
    tmaterials,
    tships,
    tofficers,
    tofficers_synergy,
    tofficer_division,
    tresearch,
    tbuildings,
    tbuilding_buffs,
    tfactions,
    tship_type,
    tsystems,
    tship_components,
    tconsumables,
    thostiles,
    lresource,
    lship,
    lofficer,
    lbuilding,
    lresearch,
    lsystem,
    lhostile,
    lconsumable,
    dship,
    dhostile,
    dresearch,
    dofficer,
    dsystem,
  };
  fs.writeFileSync(
    `${outPath}/all.json`,
    stringify(content, { maxLength: 120, indent: "  " })
  );
  fs.copyFileSync(`${outPath}/all.json`, "./out/all.json");

  saveNames(tships, `${outPath}/ships.json`, "name", fixShipCase);
  saveNames(
    tofficers,
    `${outPath}/officers.json`,
    "short_name",
    fixOfficerCase
  );
  saveNames(tresearch, `${outPath}/research.json`);
  saveNames(tbuildings, `${outPath}/buildings.json`);
  saveNames(tbuilding_buffs, `${outPath}/building_buffs.json`);
  saveNames(thostiles, `${outPath}/hostiles2.json`);
  saveNames(tship_components, `${outPath}/components2.json`);
  saveNames(tfactions, `${outPath}/factions.json`);
  saveNames(tmaterials, `${outPath}/materials.json`);
  saveNames(tship_type, `${outPath}/ship_type.json`);
  saveNames(tsystems, `${outPath}/systems.json`);

  fs.writeFileSync(`${outPath}/lhostile.json`, stringify(lhostile));
  fs.writeFileSync(`${outPath}/lship.json`, stringify(lship));
  fs.writeFileSync(`${outPath}/lofficer.json`, stringify(lofficer));
  fs.writeFileSync(`${outPath}/lresearch.json`, stringify(lresearch));
  fs.writeFileSync(`${outPath}/lsystem.json`, stringify(lsystem));
  fs.writeFileSync(`${outPath}/lresource.json`, stringify(lresource));
  fs.writeFileSync(`${outPath}/lconsumable.json`, stringify(lconsumable));
  fs.writeFileSync(`${outPath}/dship.json`, stringify(dship));
  fs.writeFileSync(`${outPath}/dhostile.json`, stringify(dhostile));
  fs.writeFileSync(`${outPath}/dofficer.json`, stringify(dofficer));
  fs.writeFileSync(`${outPath}/dsystem.json`, stringify(dsystem));

  const component_data_ships = Object.fromEntries(
    dship.flatMap((ship) =>
      ship.tiers.flatMap((tier, tierIndex) =>
        tier.components.map((component) => [
          component.id,
          {
            name:
              `Mk${tierIndex + 1} ` +
              lookupName(
                tship_components,
                component.loca_id,
                component.data.tag
              ),
            data: component.data,
          },
        ])
      )
    )
  );
  const component_data_hostiles = Object.fromEntries(
    dhostile.flatMap((hostile) =>
      hostile.components.map((component) => {
        const componentName = lookupName(
          tship_components,
          component.loca_id,
          component.data.tag
        );
        return [component.id, { name: componentName, data: component.data }];
      })
    )
  );
  const component_data = {
    ...component_data_hostiles,
    ...component_data_ships,
  };
  fs.writeFileSync(`${outPath}/components.json`, stringify(component_data));

  const hostile_data = Object.fromEntries(
    lhostile.map((hostile) => [
      hostile.id,
      `${lookupName(thostiles, hostile.loca_id, "Hostile")} (${hostile.level})`,
    ])
  );
  fs.writeFileSync(`${outPath}/hostiles.json`, stringify(hostile_data));

  fs.copyFileSync(
    `${outPath}/ships.json`,
    "../transform/src/localization/ships.json"
  );
  fs.copyFileSync(
    `${outPath}/officers.json`,
    "../transform/src/localization/officers.json"
  );
  fs.copyFileSync(
    `${outPath}/research.json`,
    "../transform/src/localization/research.json"
  );
  fs.copyFileSync(
    `${outPath}/components.json`,
    "../transform/src/localization/components.json"
  );
  fs.copyFileSync(
    `${outPath}/hostiles2.json`,
    "../transform/src/localization/hostiles.json"
  );
  fs.copyFileSync(
    `${outPath}/materials.json`,
    "../transform/src/localization/materials.json"
  );
  fs.copyFileSync(
    `${outPath}/building_buffs.json`,
    "../transform/src/localization/building_buffs.json"
  );
  fs.copyFileSync(
    `${outPath}/buildings.json`,
    "../transform/src/localization/buildings.json"
  );
  fs.copyFileSync(
    `${outPath}/factions.json`,
    "../transform/src/localization/factions.json"
  );
  fs.copyFileSync(
    `${outPath}/ship_type.json`,
    "../transform/src/localization/ship_type.json"
  );
}

function lookupName(
  translations: ApiTranslation<string>[],
  key: number | string,
  def: string
) {
  return (
    translations.find((t) => t.id == "" + key && t.key == "name")?.text || def
  );
}

function fixShipCase(o: string): string {
  return o
    .toLowerCase()
    .replace(/\b(\w)/g, (s) => s.toUpperCase())
    .replace("Uss", "USS")
    .replace("Iss", "ISS");
}

function fixOfficerCase(o: string): string {
  return o.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
}

function saveNames(
  translations: ApiTranslation<string>[],
  filename: string,
  key: string = "name",
  transformName: (o: string) => string = (o: string) => o
) {
  const data = Object.fromEntries(
    translations
      .filter((t) => t.key == key)
      .map((t) => [t.id, transformName(t.text)])
  );
  fs.writeFileSync(filename, stringify(data));
}

main();
