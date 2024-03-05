import { JournalsGetMessage, RawCombatLog, RawFleetData, RawFleetInfo } from "./inputTypes";
import {
  ComponentLookupResult,
  GameData,
  getWeaponDamageType,
  lookupComponent,
  lookupComponentName,
  lookupOfficer,
  LookupOfficerResult,
  lookupShipDetails,
  lookupShipName,
} from "./gameData";
import { parseBattleLog, CombatLogRound } from "./battleLog";
import { CombatLogStats, gatherStats } from "./combatLogStats";
import { ShipDetail } from "../../util/gameData";

export * from "./battleLog";
export * from "./inputTypes";
export * from "./gameData";

// ----------------------------------------------------------------------------
// Journal parsing
// ----------------------------------------------------------------------------

export type Side = "initiator" | "target";

export interface CombatLogParsedData {
  allShips: CombatLogShip[];
  shipById: { [id: string]: CombatLogShip };
  battleLog: CombatLogRound[];
  stats: CombatLogStats;
}

// The raw combat log is a mess. Data is indexed using a bunch of different IDs with no apparent system.
export interface CombatLogShip {
  displayName: string;
  shipId: number;
  playerId: string;
  infoId: string;
  infoIndex: number;
  fleetId: string;
  fleetIndex: number;
  side: Side;
  fleetData: RawFleetData;
  fleetInfo: RawFleetInfo;

  officers: (LookupOfficerResult | undefined)[];
  components: (ComponentLookupResult | undefined)[];
  details: ShipDetail | undefined;
}

export function parseAllData(input: JournalsGetMessage, data: GameData): CombatLogParsedData {
  const allShips = listAllShips(input, data);
  const shipById = Object.fromEntries(allShips.map((s) => [s.shipId, s]));
  const battleLog = parseBattleLog(input.journal.battle_log);
  const stats = gatherStats(allShips, battleLog, data);
  return {
    allShips,
    shipById,
    battleLog,
    stats,
  };
}

function getFleetData(ship: CombatLogShip, input: RawCombatLog): RawFleetData {
  return ship.side === "initiator" ? input.initiator_fleet_data : input.target_fleet_data;
}

export function listFleetShips(
  fleetData: RawFleetData,
  side: Side,
  data: GameData,
  names: { [id: string]: string },
): CombatLogShip[] {
  const result: CombatLogShip[] = [];
  Object.keys(fleetData.deployed_fleets).forEach((fleetId, fleetIndex) => {
    const fleetInfo = fleetData.deployed_fleets[fleetId]!;
    const infoId = Object.keys(fleetInfo.ship_hps)[0];
    const shipId = fleetInfo.ship_ids[0];
    const playerId = fleetInfo.uid;
    const infoIndex = fleetData.ship_ids.findIndex((idx) => idx === shipId);
    const displayName =
      names[playerId] !== undefined
        ? names[playerId]
        : side === "initiator"
          ? `Initiator ${fleetIndex + 1}`
          : `Target ${fleetIndex + 1}`;

    const officers =
      fleetData.fleets_officers[fleetId]?.map((officer) => {
        if (!!officer) {
          return lookupOfficer(officer.id, data);
        } else {
          return undefined;
        }
      }) || [];

    const components =
      fleetInfo.ship_components[infoId]?.map((cid) => {
        return lookupComponent(cid, data);
      }) || [];

    const level = fleetInfo.ship_levels[infoId]!;
    const details = lookupShipDetails(
      fleetInfo.hull_ids[0],
      fleetData.ref_ids?.loca_id,
      level,
      data,
    );

    result.push({
      displayName,
      shipId,
      playerId,
      infoId,
      infoIndex,
      fleetId,
      fleetIndex,
      side,
      fleetInfo,
      fleetData,
      officers,
      components,
      details,
    });
  });
  if (result.length === 0) {
    const fleetInfo = fleetData.deployed_fleet;
    const infoId = Object.keys(fleetInfo.ship_hps)[0];
    const shipId = fleetInfo.ship_ids[0];
    const playerId = fleetInfo.uid;
    const infoIndex = fleetData.ship_ids.findIndex((idx) => idx === shipId);
    const displayName = side === "initiator" ? "Initiator" : "Target";

    result.push({
      displayName: displayName,
      shipId: 0,
      playerId,
      infoId,
      infoIndex,
      fleetId: "",
      fleetIndex: 0,
      side,
      fleetInfo,
      fleetData,
      officers: [],
      components: [],
      details: undefined,
    });
  }
  return result;
}

export function listAllShips(input: JournalsGetMessage, data: GameData): CombatLogShip[] {
  const names = input.names || {};
  return [
    ...listFleetShips(input.journal.initiator_fleet_data, "initiator", data, names),
    ...listFleetShips(input.journal.target_fleet_data, "target", data, names),
  ];
}

export function getShipName(ship: CombatLogShip, input: RawCombatLog, data: GameData): string {
  const level = ship.fleetInfo.ship_levels[ship.infoId]!;
  const name = lookupShipName(
    ship.fleetInfo.hull_ids[0],
    ship.fleetData.ref_ids?.loca_id,
    level,
    data,
  );
  return name || "???";
}
