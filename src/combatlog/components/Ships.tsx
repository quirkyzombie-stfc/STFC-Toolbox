import * as React from "react";
import { ColumnDefinition, CombatLogTable } from "./CombatLogTable";
import {
  CombatLogParsedData,
  GameData,
  getShipName,
  lookupComponent,
  RawCombatLog,
} from "../util/combatLog";

export interface ShipsProps {
  parsedData: CombatLogParsedData;
  input: RawCombatLog;
  data: GameData;
  csv: boolean;
}

export const Ships = ({ parsedData, input, data, csv }: ShipsProps) => {
  const tableData: (string | number | undefined)[][] = [];
  const ships = parsedData.allShips;
  tableData.push(["name", ...ships.map((s) => getShipName(s, input, data))]);
  tableData.push(["grade", ...ships.map((s) => `G${s.fleetInfo.fleet_grade}`)]);
  tableData.push(["tier", ...ships.map((s) => s.fleetInfo.ship_tiers[s.infoId])]);
  tableData.push(["level", ...ships.map((s) => s.fleetInfo.ship_levels[s.infoId])]);
  tableData.push([" "]);
  tableData.push(["ACTIVATED BUFFS"]);
  tableData.push(["Cloaked", ...ships.map((s) => (s.fleetInfo.is_cloaked ? "YES" : ""))]);
  tableData.push([
    "Cerritos supported",
    ...ships.map((s) => (s.fleetInfo.is_supported ? "YES" : "")),
  ]);
  tableData.push([
    "Defiant reinforced",
    ...ships.map((s) => (s.fleetInfo.is_armada_supported ? "YES" : "")),
  ]);
  tableData.push([
    "Titan fortified",
    ...ships.map((s) => (s.fleetInfo.is_system_wide_buffed ? "YES" : "")),
  ]);
  tableData.push([
    "Titan max fortified",
    ...ships.map((s) => (s.fleetInfo.is_system_wide_supreme_buffed ? "YES" : "")),
  ]);
  tableData.push(["Mantis debuff", ...ships.map((s) => (s.fleetInfo.is_debuffed ? "YES" : ""))]);
  tableData.push([
    "war shield",
    ...ships.map((s) => (s.fleetInfo.is_war_shield_activated ? "YES" : "")),
  ]);
  tableData.push([
    "weapon damage",
    ...ships.map((s) => (s.fleetInfo.is_weapon_damage_activated ? "YES" : "")),
  ]);
  tableData.push([
    "weapon penetration",
    ...ships.map((s) => (s.fleetInfo.is_weapon_penetration_activated ? "YES" : "")),
  ]);
  tableData.push([
    "weapon shots",
    ...ships.map((s) => (s.fleetInfo.is_weapon_shots_activated ? "YES" : "")),
  ]);
  tableData.push([
    "crit damage",
    ...ships.map((s) => (s.fleetInfo.is_critical_damage_activated ? "YES" : "")),
  ]);
  tableData.push(["detected", ...ships.map((s) => (s.fleetInfo.is_detected ? "YES" : ""))]);
  tableData.push([" "]);
  tableData.push(["COMPONENTS"]);
  const componentName = (ids: number[] | undefined, i: number) =>
    !!ids && ids[i] > 0 ? lookupComponent(ids[i], data)?.displayName : "";
  tableData.push([
    "Component 1",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 0)),
  ]);
  tableData.push([
    "Component 2",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 1)),
  ]);
  tableData.push([
    "Component 3",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 2)),
  ]);
  tableData.push([
    "Component 4",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 3)),
  ]);
  tableData.push([
    "Component 5",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 4)),
  ]);
  tableData.push([
    "Component 6",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 5)),
  ]);
  tableData.push([
    "Component 7",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 6)),
  ]);
  tableData.push([
    "Component 8",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 7)),
  ]);
  tableData.push([
    "Component 9",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 8)),
  ]);
  tableData.push([
    "Component 10",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 9)),
  ]);
  tableData.push([
    "Component 11",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 10)),
  ]);
  tableData.push([
    "Component 12",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 11)),
  ]);
  tableData.push([
    "Component 13",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 12)),
  ]);
  tableData.push([
    "Component 14",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 13)),
  ]);
  tableData.push([
    "Component 15",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 14)),
  ]);
  tableData.push([
    "Component 16",
    ...ships.map((s) => componentName(s.fleetInfo.ship_components[s.infoId], 15)),
  ]);

  const columns: ColumnDefinition[] = [
    { label: "", align: "left" },
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
