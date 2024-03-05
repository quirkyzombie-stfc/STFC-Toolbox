import * as React from "react";
import { ColumnDefinition, CombatLogTable } from "./CombatLogTable";
import {
  CombatLogParsedData,
  CombatLogShip,
  GameData,
  getShipName,
  lookupOfficer,
  RawCombatLog,
} from "../util/combatLog";

export interface OfficersProps {
  parsedData: CombatLogParsedData;
  input: RawCombatLog;
  data: GameData;
  csv: boolean;
}

function getBaseStats(
  ship: CombatLogShip,
  data: GameData,
): { attack: number; defense: number; health: number } {
  const officers = ship.fleetData.fleets_officers[ship.fleetId];
  if (officers === undefined) {
    return { attack: 0, defense: 0, health: 0 };
  } else {
    return officers
      .filter((o) => o !== null)
      .reduce(
        (acc, o) => {
          const officerDetail = lookupOfficer(o!.id, data);
          if (officerDetail.details !== undefined) {
            const stats = officerDetail.details.stats.find((s) => s.level === o!.level);
            return {
              attack: acc.attack + (stats?.attack || 0),
              defense: acc.defense + (stats?.defense || 0),
              health: acc.health + (stats?.health || 0),
            };
          } else {
            return acc;
          }
        },
        { attack: 0, defense: 0, health: 0 },
      );
  }
}

function officerDescription(ship: CombatLogShip, index: number, data: GameData): string {
  const officer = ship.fleetData.fleets_officers[ship.fleetId]?.[index];
  if (!!officer) {
    const officerDetail = lookupOfficer(officer.id, data);
    return `T${officer.rank} L${officer.level} ${officerDetail.officerName}`;
  } else {
    return "";
  }
}

export const Officers = ({ parsedData, input, data, csv }: OfficersProps) => {
  const tableData: (string | number | undefined)[][] = [];
  const ships = parsedData.allShips;
  tableData.push(["", ...ships.map((s) => getShipName(s, input, data))]);

  tableData.push(["captain", ...ships.map((s) => officerDescription(s, 0, data))]);
  tableData.push(["bridge 1", ...ships.map((s) => officerDescription(s, 1, data))]);
  tableData.push(["bridge 2", ...ships.map((s) => officerDescription(s, 2, data))]);

  tableData.push([""]);

  tableData.push(["below deck 1", ...ships.map((s) => officerDescription(s, 3, data))]);
  tableData.push(["below deck 2", ...ships.map((s) => officerDescription(s, 4, data))]);
  tableData.push(["below deck 3", ...ships.map((s) => officerDescription(s, 5, data))]);
  tableData.push(["below deck 4", ...ships.map((s) => officerDescription(s, 6, data))]);
  tableData.push(["below deck 5", ...ships.map((s) => officerDescription(s, 7, data))]);
  tableData.push(["below deck 6", ...ships.map((s) => officerDescription(s, 8, data))]);
  tableData.push(["below deck 7", ...ships.map((s) => officerDescription(s, 9, data))]);
  tableData.push(["below deck 8", ...ships.map((s) => officerDescription(s, 10, data))]);

  tableData.push([""]);

  tableData.push([
    "base attack",
    ...ships.map((s) => {
      const stats = getBaseStats(s, data);
      return `${Math.round(stats.attack)} (${Math.round(
        (stats.attack / (stats.attack + stats.defense + stats.health)) * 100,
      )}%)`;
    }),
  ]);
  tableData.push([
    "base defense",
    ...ships.map((s) => {
      const stats = getBaseStats(s, data);
      return `${Math.round(stats.defense)} (${Math.round(
        (stats.defense / (stats.attack + stats.defense + stats.health)) * 100,
      )}%)`;
    }),
  ]);
  tableData.push([
    "base health",
    ...ships.map((s) => {
      const stats = getBaseStats(s, data);
      return `${Math.round(stats.health)} (${Math.round(
        (stats.health / (stats.attack + stats.defense + stats.health)) * 100,
      )}%)`;
    }),
  ]);

  const columns: ColumnDefinition[] = [
    { label: "Officer slot", align: "left" },
    ...ships.map((ps) => ({ label: ps.displayName, align: "left" }) as const),
  ];

  return (
    <CombatLogTable
      csv={csv}
      columns={columns}
      data={tableData.map((rowData) => {
        const fillLen = Math.max(0, columns.length - rowData.length);
        const row = [
          ...rowData.map((x) => {
            switch (typeof x) {
              case "string":
                return x;
              case "number":
                return x.toLocaleString();
              case "undefined":
                return "???";
              default:
                return `${x}`;
            }
          }),
          ...Array(fillLen).fill(""),
        ];
        return { cells: row };
      })}
    ></CombatLogTable>
  );
};
