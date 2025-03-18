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
import {
  allDamageMultiplier,
  apexMitigationTotal,
  critDamage,
  getStats,
  hhpDepleted,
  hullDamageIn,
  hullDamageOut,
  isoDamageMultiplierTotal,
  isoMitigationTotal,
  shieldMitigationTotal,
  shotsIn,
  shotsOut,
  shpDepleted,
  stdDamageMultiplierTotal,
  stdMitigationTotal,
} from "../util/combatLogStats";
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
              formatMultiplier(stdDamageMultiplierTotal(ship, parsedData, 0.5, false)),
            ),
          ],
        },
        {
          cells: [
            "Std damage multiplier (crit)",
            ...allShips.map((ship) =>
              formatMultiplier(stdDamageMultiplierTotal(ship, parsedData, 0.5, true)),
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
            ...allShips.map((ship) => formatMultiplier(isoDamageMultiplierTotal(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Total damage multiplier",
            ...allShips.map((ship) => formatMultiplier(allDamageMultiplier(ship, parsedData))),
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
            ...allShips.map((ship) => formatPercentage(stdMitigationTotal(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Iso mitigation",
            ...allShips.map((ship) => formatPercentage(isoMitigationTotal(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Apex mitigation",
            ...allShips.map((ship) => formatPercentage(apexMitigationTotal(ship, parsedData))),
          ],
        },
        {
          cells: [
            "Shield mitigation",
            ...allShips.map((ship) => formatPercentage(shieldMitigationTotal(ship, parsedData))),
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
