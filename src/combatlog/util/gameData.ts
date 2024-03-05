import type {
  AllData as GameData,
  ApiTranslation,
  OfficerDetail,
  ShipDetailComponent,
  ShipComponentWeapon,
  Tier,
  ShipDetail,
  ResearchDetail,
  BuildingDetail,
  Resource,
  ForbiddenTechDetail,
} from "../../util/gameData";
import { HullType } from "./constants";

export type { AllData as GameData } from "../../util/gameData";

export function lookupTranslation(
  data: ApiTranslation[],
  id: number | undefined,
  key: string,
): string | undefined {
  const entry = data.find((x) => x.key === key && x.id == id);
  return entry?.text;
}

export function lookupShipName(
  hullId: number | undefined,
  locaId: number | undefined,
  level: number,
  data: GameData,
): string | undefined {
  if (!!locaId) {
    const hostileName =
      lookupTranslation(data.translations.ships, locaId, "ship_name") ||
      lookupTranslation(data.translations.officer_names, locaId, "officer_name") || // WTF Scopely
      undefined;
    return `${hostileName} (${level})`;
  } else if (!!hullId) {
    const loca_id = data.ship[hullId]?.loca_id;
    return lookupTranslation(data.translations.ships, loca_id, "ship_name") || undefined;
  } else {
    return undefined;
  }
}

export function lookupShipDetails(
  hullId: number | undefined,
  locaId: number | undefined,
  level: number,
  data: GameData,
): ShipDetail | undefined {
  if (!!locaId) {
    const hostileName =
      lookupTranslation(data.translations.ships, locaId, "ship_name") ||
      lookupTranslation(data.translations.officer_names, locaId, "officer_name") || // WTF Scopely
      undefined;
    return undefined;
  } else if (!!hullId) {
    return data.ship[hullId];
  } else {
    return undefined;
  }
}

export function lookupSystemName(locaId: number, data: GameData): string | undefined {
  return lookupTranslation(data.translations.systems, locaId, "title");
}

export function lookupComponentName(locaId: number, data: GameData): string | undefined {
  return lookupTranslation(data.translations.ship_components, locaId, "component_name")
    ?.replace(" [ENERGY]", "")
    .replace(" [KINETIC]", "");
}

export interface ComponentLookupResult {
  component: ShipDetailComponent;
  displayName: string;
}

export function lookupComponent(id: number, data: GameData): ComponentLookupResult | undefined {
  for (const ship_id in data.ship) {
    const ship = data.ship[ship_id];
    for (let t = 0; t < ship.tiers.length; ++t) {
      const tier = ship.tiers[t];
      for (let c = 0; c < tier.components.length; ++c) {
        const component = tier.components[c];
        if (component.id == id) {
          return {
            component,
            displayName: `Mk${tier.tier} ${
              lookupComponentName(component.loca_id, data) || component.data.tag
            }`,
          };
        }
      }
    }
  }
  for (let hostile_id in data.hostile) {
    const hostile = data.hostile[hostile_id];
    for (let c = 0; c < hostile.components.length; ++c) {
      const component = hostile.components[c];
      if (component.id == id) {
        const index = hostile.components.filter(
          (c2, i2) => c2.data.tag === component.data.tag && i2 <= c,
        ).length;
        return {
          component,
          displayName: `${component.data.tag} ${index}`,
        };
      }
    }
  }
  return undefined;
}

export interface ItemLookupResult {
  item_id: number;
  displayName: string;
  data: Resource | undefined;
}

export function lookupItem(item_id: number, data: GameData): ItemLookupResult {
  const details = data.resource_summary.find((r) => r.id == item_id);
  const displayName =
    lookupTranslation(data.translations.materials, details?.loca_id, "resource_name") ||
    unknownId(item_id);
  return {
    item_id,
    displayName,
    data: details,
  };
}

export interface BuffLookupResult {
  buff_id: number;
  activator_id: number;
  buffDisplayName: string;
  activatorDisplayName: string;
  data:
    | BuffLookupResultResearch
    | BuffLookupResultOfficer
    | BuffLookupResultBuilding
    | BuffLookupResultOther
    | BuffLookupResultConsumable
    | BuffLookupResultForbiddenTech
    | undefined;
}

interface BuffLookupResultOther {
  type: "other";
  details: undefined;
}

interface BuffLookupResultConsumable {
  type: "consumable";
  details: undefined;
}

interface BuffLookupResultResearch {
  type: "research";
  details: ResearchDetail;
}

interface BuffLookupResultOfficer {
  type: "officer";
  subtype: "captain_ability" | "officer_ability" | "below_decks_ability" | "other";
  details: OfficerDetail;
}

interface BuffLookupResultBuilding {
  type: "building";
  details: BuildingDetail;
}

interface BuffLookupResultForbiddenTech {
  type: "forbidden_tech";
  details: ForbiddenTechDetail;
}

export function lookupBuff(
  buff_id: number,
  activator_id: number,
  data: GameData,
): BuffLookupResult {
  // Research: translation contains research name, but not buff name
  const research = data.research[activator_id];
  if (research !== undefined) {
    const activatorDisplayName =
      lookupTranslation(
        data.translations.research,
        research.research_tree.loca_id,
        "research_tree_name",
      ) || unknownId(research.research_tree.loca_id);
    const buffDisplayName =
      lookupTranslation(data.translations.research, research.loca_id, "research_project_name") ||
      unknownId(buff_id);
    return {
      buff_id,
      activator_id,
      buffDisplayName,
      activatorDisplayName,
      data: {
        type: "research",
        details: research,
      },
    };
  }

  // Buildings: translation contains both building name and buff name (as a research)
  const building = data.building[activator_id];
  if (building !== undefined) {
    const activatorDisplayName =
      lookupTranslation(data.translations.starbase_modules, activator_id, "starbase_module_name") ||
      unknownId(activator_id);
    for (let bb = 0; bb < building.buffs.length; ++bb) {
      const buildingBuff = building.buffs[bb];
      if (buildingBuff.id === buff_id) {
        const buffDisplayName =
          lookupTranslation(
            data.translations.starbase_modules,
            buildingBuff.loca_id,
            "starbase_module_buff_name",
          ) || unknownId(buff_id);
        return {
          buff_id,
          activator_id,
          activatorDisplayName,
          buffDisplayName,
          data: {
            type: "building",
            details: building,
          },
        };
      }
    }
    return {
      buff_id,
      activator_id,
      activatorDisplayName,
      buffDisplayName: unknownId(buff_id),
      data: {
        type: "building",
        details: building,
      },
    };
  }

  // Officers
  const officer = data.officer[activator_id];
  if (officer !== undefined) {
    const activatorDisplayName =
      lookupTranslation(data.translations.officer_names, officer.loca_id, "officer_name") ||
      unknownId(activator_id);

    if (officer.captain_ability.id === buff_id) {
      const buffDisplayName =
        lookupTranslation(
          data.translations.officer_buffs,
          officer.captain_ability.loca_id,
          "officer_ability_name",
        ) || unknownId(buff_id);
      return {
        buff_id,
        activator_id,
        activatorDisplayName,
        buffDisplayName,
        data: {
          type: "officer",
          subtype: "captain_ability",
          details: officer,
        },
      };
    } else if (officer.ability.id === buff_id) {
      const buffDisplayName =
        lookupTranslation(
          data.translations.officer_buffs,
          officer.ability.loca_id,
          "officer_ability_name",
        ) || unknownId(buff_id);
      return {
        buff_id,
        activator_id,
        activatorDisplayName,
        buffDisplayName,
        data: {
          type: "officer",
          subtype: "officer_ability",
          details: officer,
        },
      };
    } else if (officer.below_decks_ability?.id === buff_id) {
      const buffDisplayName =
        lookupTranslation(
          data.translations.officer_buffs,
          officer.below_decks_ability.loca_id,
          "officer_ability_name",
        ) || unknownId(buff_id);
      return {
        buff_id,
        activator_id,
        activatorDisplayName,
        buffDisplayName,
        data: {
          type: "officer",
          subtype: "below_decks_ability",
          details: officer,
        },
      };
    } else {
      return {
        buff_id,
        activator_id,
        activatorDisplayName,
        buffDisplayName: unknownId(buff_id),
        data: {
          type: "officer",
          subtype: "other",
          details: officer,
        },
      };
    }
  }

  // Forbidden tech
  const forbidden_tech = data.forbidden_tech[activator_id];
  if (forbidden_tech !== undefined) {
    const activatorDisplayName =
      lookupTranslation(
        data.translations.forbidden_tech,
        forbidden_tech.loca_id,
        "forbidden_tech_name",
      ) || unknownId(activator_id);

    const buffDisplayName =
      lookupTranslation(
        data.translations.officers,
        forbidden_tech.loca_id,
        "forbidden_tech_buff_name",
      ) || unknownId(buff_id);
    return {
      buff_id,
      activator_id,
      activatorDisplayName,
      buffDisplayName,
      data: {
        type: "forbidden_tech",
        details: forbidden_tech,
      },
    };
  }

  // Other: try to find activator in research (e.g., Bajoran favors)
  {
    const buffDisplayName = lookupTranslation(data.translations.research, activator_id, "name");
    if (buffDisplayName !== undefined) {
      return {
        buff_id,
        activator_id,
        activatorDisplayName: "RESEARCH?",
        buffDisplayName,
        data: {
          type: "other",
          details: undefined,
        },
      };
    }
  }

  // Consumables
  const consumable = data.consumable_summary.find((c) => c.id == buff_id);
  if (consumable !== undefined) {
    const buffDisplayName =
      lookupTranslation(data.translations.consumables, consumable.loca_id, "consumable_name") ||
      unknownId(buff_id);
    return {
      buff_id,
      activator_id,
      activatorDisplayName: activator_id === -1 ? "CONSUMABLE?" : unknownId(activator_id),
      buffDisplayName,
      data: {
        type: "consumable",
        details: undefined,
      },
    };
  }

  return {
    buff_id,
    activator_id,
    activatorDisplayName: unknownId(activator_id),
    buffDisplayName: unknownId(buff_id),
    data: undefined,
  };
}

export function getWeaponDamageType(weapon: ShipComponentWeapon) {
  return weapon.weapon_type === 1 ? "ENERGY" : "KINETIC";
}

export function getHullType(id: number) {
  switch (id) {
    case HullType.ArmadaTarget:
      return "ARMADA";
    case HullType.Battleship:
      return "BATTLESHIP";
    case HullType.Destroyer:
      return "INTERCEPTOR";
    case HullType.Explorer:
      return "EXPLORER";
    case HullType.Defense:
      return "DEFENSE";
    case HullType.Survey:
      return "SURVEY";
    default:
      return `??? (${id})`;
  }
}

export interface LookupOfficerResult {
  id: number;
  officerName: string;
  details: OfficerDetail | undefined;
}

export function lookupOfficer(id: number, data: GameData): LookupOfficerResult {
  const details = data.officer[id];
  if (details !== undefined) {
    const officerName =
      lookupTranslation(data.translations.officer_names, details.loca_id, "officer_name") ||
      unknownId(id);
    return {
      id,
      officerName,
      details,
    };
  } else {
    return {
      id,
      officerName: unknownId(id),
      details: undefined,
    };
  }
}

interface LookupBattleLogAbilityResult {
  sourceDisplayName: string;
  abilityDisplayName: string;
  source: string;
}

export function lookupBattleLogAbility(
  id1: number,
  id2: number,
  data: GameData,
): LookupBattleLogAbilityResult | undefined {
  const officer = data.officer[id2];
  if (officer !== undefined) {
    const sourceDisplayName =
      lookupTranslation(data.translations.officer_names, officer.loca_id, "officer_name") ||
      unknownId(id1);
    if (officer.captain_ability.id === id1) {
      const abilityDisplayName =
        lookupTranslation(
          data.translations.officer_buffs,
          officer.captain_ability.loca_id,
          "officer_ability_name",
        ) || unknownId(id2);
      return {
        sourceDisplayName,
        abilityDisplayName,
        source: "CAPTAIN MANEUVER",
      };
    } else if (officer.ability.id === id1) {
      const abilityDisplayName =
        lookupTranslation(
          data.translations.officer_buffs,
          officer.ability.loca_id,
          "officer_ability_name",
        ) || unknownId(id2);
      return {
        sourceDisplayName,
        abilityDisplayName,
        source: "OFFICER ABILITY",
      };
    } else if (officer.below_decks_ability?.id === id1) {
      const abilityDisplayName =
        lookupTranslation(
          data.translations.officer_buffs,
          officer.below_decks_ability?.loca_id,
          "officer_ability_name",
        ) || unknownId(id2);
      return {
        sourceDisplayName,
        abilityDisplayName,
        source: "BELOW DECK ABILITY",
      };
    } else {
      return {
        sourceDisplayName,
        abilityDisplayName: unknownId(id2),
        source: "UNKNOWN OFFICER ABILITY",
      };
    }
  }

  // Ship abilities
  const ship = data.ship[id1];
  if (ship !== undefined) {
    const sourceDisplayName =
      lookupTranslation(data.translations.ships, ship.loca_id, "ship_name") || unknownId(id1);
    if (ship.ability.id === id2) {
      return {
        sourceDisplayName,
        abilityDisplayName:
          lookupTranslation(
            data.translations.ship_buffs,
            ship.ability.loca_id,
            "ship_ability_name",
          ) || unknownId(id2),
        source: "SHIP ABILITY",
      };
    } else {
      return {
        sourceDisplayName,
        abilityDisplayName: unknownId(id2),
        source: "UNKONWN SHIP ABILITY",
      };
    }
  }

  // Forbidden tech
  const forbiddenTech = data.forbidden_tech[id2];
  if (forbiddenTech !== undefined) {
    const sourceDisplayName =
      lookupTranslation(
        data.translations.forbidden_tech,
        forbiddenTech.loca_id,
        "forbidden_tech_name",
      ) || unknownId(id1);
    const buff = forbiddenTech.buffs.flatMap((b) => b.buffs).find((b) => b.id == id1);
    const abilityDisplayName =
      lookupTranslation(
        data.translations.forbidden_tech,
        buff?.loca_id,
        "forbidden_tech_buff_name",
      ) || unknownId(id2);
    return {
      sourceDisplayName,
      abilityDisplayName,
      source: "FORBIDDEN TECH",
    };
  }

  // Unknown
  return {
    sourceDisplayName: unknownId(id1),
    abilityDisplayName: unknownId(id2),
    source: "UNKNOWN ABILITY",
  };
}

export function unknownId(id: number) {
  return `??? [${id}]`;
}
