import * as React from "react";
import { ColumnDefinition, CombatLogTable } from "./CombatLogTable";
import {
  CombatLogParsedData,
  CombatLogShip,
  GameData,
  getShipName,
  getHullType,
} from "../util/combatLog";
import { RawCombatLog } from "../util/inputTypes";
import { getStats } from "../util/combatLogStats";
import { roundTo2Digits, infinityToEmpty, shortNumber } from "../util/format";

export interface OverviewProps {
  parsedData: CombatLogParsedData;
  input: RawCombatLog;
  data: GameData;
  csv: boolean;
}

const bridgeSetup = (ship: CombatLogShip) =>
  ship.officers
    .slice(0, 3)
    .map((o) => o?.officerName || "<Empty>")
    .join(" + ");

const belowDeckSetup = (ship: CombatLogShip) =>
  ship.officers
    .slice(3, 16)
    .flatMap((o) => (o?.details?.below_decks_ability !== undefined ? [o?.officerName] : []))
    .join(" + ");

const buffs = (ship: CombatLogShip) => {
  const result = [];
  if (ship.fleetInfo.is_cloaked) {
    result.push("Cloak");
  }
  if (ship.fleetInfo.is_supported) {
    result.push("Cerritos");
  }
  if (ship.fleetInfo.is_armada_supported) {
    result.push("Defiant");
  }
  if (ship.fleetInfo.is_system_wide_buffed) {
    result.push("Titan");
  }
  if (ship.fleetInfo.is_system_wide_supreme_buffed) {
    result.push("TitanMax");
  }
  if (ship.fleetInfo.is_debuffed) {
    result.push("Mantis");
  }
  return result.join(" + ");
};

const formatPercentage = (x: number) => (isNaN(x) ? "" : `${(100 * x).toFixed(2)}%`);
const formatMultiplier = (x: number) => (isNaN(x) ? "" : `${x.toFixed(3)}`);
const formatNumber = (x: number) => (isNaN(x) ? "" : shortNumber(x));

const stdMitigation = (ship: CombatLogShip, parsedData: CombatLogParsedData) => {
  const std_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => true,
    (x) => x.std_damage,
  ).sum;
  const std_mitigated = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => true,
    (x) => x.std_mitigated,
  ).sum;

  return std_damage > 0 ? std_mitigated / std_damage : NaN;
};

const isoMitigation = (ship: CombatLogShip, parsedData: CombatLogParsedData) => {
  const iso_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => true,
    (x) => x.iso_damage,
  ).sum;
  const iso_mitigated = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => true,
    (x) => x.iso_mitigated,
  ).sum;

  return iso_damage > 0 ? iso_mitigated / iso_damage : NaN;
};

const shieldMitigation = (ship: CombatLogShip, parsedData: CombatLogParsedData) => {
  const total_unmitigated_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => true,
    (x) => x.hhp + x.shp,
  ).sum;
  const total_shp_damage_taken = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => true,
    (x) => x.shp,
  ).sum;

  return total_unmitigated_damage > 0 ? total_shp_damage_taken / total_unmitigated_damage : NaN;
};

const stdDamageMultiplier = (
  ship: CombatLogShip,
  parsedData: CombatLogParsedData,
  crit: boolean,
) => {
  const std_min_base_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.crit == crit,
    (x) => x.base_min,
  ).sum;
  const std_max_base_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.crit == crit,
    (x) => x.base_max,
  ).sum;
  const std_base_damage = (std_min_base_damage + std_max_base_damage) / 2;
  const std_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.crit == crit,
    (x) => x.std_damage,
  ).sum;

  return std_base_damage > 0 ? std_damage / std_base_damage : NaN;
};

const isoDamageMultiplier = (ship: CombatLogShip, parsedData: CombatLogParsedData) => {
  const std_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.std_damage,
  ).sum;
  const iso_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.iso_damage,
  ).sum;

  return std_damage > 0 ? iso_damage / std_damage : NaN;
};

const totalDamageMultiplier = (ship: CombatLogShip, parsedData: CombatLogParsedData) => {
  const std_min_base_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.base_min,
  ).sum;
  const std_max_base_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.base_max,
  ).sum;
  const std_base_damage = (std_min_base_damage + std_max_base_damage) / 2;
  const total_damage = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.std_damage + x.iso_damage,
  ).sum;

  return total_damage > 0 ? total_damage / std_base_damage : NaN;
};

const shotsOut = (
  ship: CombatLogShip,
  parsedData: CombatLogParsedData,
  crit: boolean | undefined = undefined,
) => {
  const count = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => crit == undefined || x.crit == crit,
    (x) => 1,
  ).count;

  return count;
};

const shotsIn = (
  ship: CombatLogShip,
  parsedData: CombatLogParsedData,
  crit: boolean | undefined = undefined,
) => {
  const count = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => crit == undefined || x.crit == crit,
    (x) => 1,
  ).count;

  return count;
};

const critDamage = (ship: CombatLogShip, parsedData: CombatLogParsedData) => {
  const noncrit_multiplier = stdDamageMultiplier(ship, parsedData, false);
  const crit_multiplier = stdDamageMultiplier(ship, parsedData, true);

  return !isNaN(noncrit_multiplier) && !isNaN(crit_multiplier)
    ? crit_multiplier / noncrit_multiplier
    : NaN;
};

const hullDamageOut = (ship: CombatLogShip, parsedData: CombatLogParsedData) => {
  return getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.hhp,
  ).sum;
};

const hullDamageIn = (ship: CombatLogShip, parsedData: CombatLogParsedData) => {
  return getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => true,
    (x) => x.hhp,
  ).sum;
};

const shpDepleted = (ship: CombatLogShip, parsedData: CombatLogParsedData) => {
  const round = getStats(
    parsedData.stats.ships[ship.shipId].hitPoints,
    (x) => x.shp <= 0,
    (x) => x.t.round,
  ).min;
  return round !== Infinity ? round : NaN;
};

const hhpDepleted = (ship: CombatLogShip, parsedData: CombatLogParsedData) => {
  const round = getStats(
    parsedData.stats.ships[ship.shipId].hitPoints,
    (x) => x.hhp <= 0,
    (x) => x.t.round,
  ).min;
  return round !== Infinity ? round : NaN;
};

export const Overview = ({ parsedData, input, data, csv }: OverviewProps) => {
  const allShips = parsedData.allShips;

  return (
    <CombatLogTable
      csv={csv}
      columns={[
        { label: "", align: "left" },
        ...allShips.map((ship) => ({ label: ship.displayName, align: "left" }) as ColumnDefinition),
      ]}
      data={[
        { cells: ["Ship name", ...allShips.map((ship) => getShipName(ship, input, data))] },
        {
          cells: [
            "Ship class",
            ...allShips.map((ship) => (ship.details ? getHullType(ship.details.hull_type) : "")),
          ],
        },
        { cells: ["Bridge setup", ...allShips.map((ship) => bridgeSetup(ship))] },
        { cells: ["Below deck setup", ...allShips.map((ship) => belowDeckSetup(ship))] },
        { cells: ["Buffs", ...allShips.map((ship) => buffs(ship))] },
        { cells: ["", ...allShips.map((ship) => "")] },
        { cells: ["OFFENSE", ...allShips.map((ship) => "")] },
        {
          cells: [
            "Shots fired",
            ...allShips.map((ship) => formatNumber(shotsOut(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Crits fired",
            ...allShips.map((ship) => formatNumber(shotsOut(ship, parsedData, true))),
          ],
        },
        {
          cells: [
            "Hull damage done",
            ...allShips.map((ship) => formatNumber(hullDamageOut(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Std damage multiplier (non-crit)",
            ...allShips.map((ship) =>
              formatMultiplier(stdDamageMultiplier(ship, parsedData, false)),
            ),
          ],
        },
        {
          cells: [
            "Std damage multiplier (crit)",
            ...allShips.map((ship) =>
              formatMultiplier(stdDamageMultiplier(ship, parsedData, true)),
            ),
          ],
        },
        {
          cells: [
            "Crit damage multiplier",
            ...allShips.map((ship) => formatMultiplier(critDamage(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Iso damage multiplier",
            ...allShips.map((ship) => formatMultiplier(isoDamageMultiplier(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Total damage multiplier",
            ...allShips.map((ship) => formatMultiplier(totalDamageMultiplier(ship, parsedData))),
          ],
        },
        { cells: ["", ...allShips.map((ship) => "")] },
        { cells: ["DEFENSE", ...allShips.map((ship) => "")] },
        {
          cells: [
            "Shots taken",
            ...allShips.map((ship) => formatNumber(shotsIn(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Crits taken",
            ...allShips.map((ship) => formatNumber(shotsIn(ship, parsedData, true))),
          ],
        },
        {
          cells: [
            "Hull damage taken",
            ...allShips.map((ship) => formatNumber(hullDamageIn(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Round SHP depleted",
            ...allShips.map((ship) => formatNumber(shpDepleted(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Round HHP depleted",
            ...allShips.map((ship) => formatNumber(hhpDepleted(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Std mitigation",
            ...allShips.map((ship) => formatPercentage(stdMitigation(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Iso mitigation",
            ...allShips.map((ship) => formatPercentage(isoMitigation(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Shield mitigation",
            ...allShips.map((ship) => formatPercentage(shieldMitigation(ship, parsedData))),
          ],
        },
      ]}
      /*data2={allShips.map((ship) => ({
        cells: [
          ship.displayName,
          getShipName(ship, input, data),
          setup(ship),
          buffs(ship),
          `${roundTo2Digits(
            100 *
              getStats(
                parsedData.stats.ships[ship.shipId].damageIn,
                (x) => true,
                (x) => x.mitigation,
              ).max,
          )}%`,
          `${shortNumber(
            getStats(
              parsedData.stats.ships[ship.shipId].damageOut,
              (x) => true,
              (x) => x.hhp,
            ).sum,
          )}`,
          `${shortNumber(
            getStats(
              parsedData.stats.ships[ship.shipId].damageIn,
              (x) => true,
              (x) => x.hhp,
            ).sum,
          )}`,
          `${infinityToEmpty(
            getStats(
              parsedData.stats.ships[ship.shipId].shpDepleted,
              (x) => true,
              (x) => x.t.round,
            ).min,
          )}`,
          `${infinityToEmpty(
            getStats(
              parsedData.stats.ships[ship.shipId].hhpDepleted,
              (x) => true,
              (x) => x.t.round,
            ).min,
          )}`,
        ],
      }))}*/
    ></CombatLogTable>
  );
};
