import * as React from "react";
import { ColumnDefinition, CombatLogTable } from "./CombatLogTable";
import { ShipComponentWeapon } from "../../util/gameData";
import {
  BuffLookupResult,
  CombatLogParsedData,
  GameData,
  getShipName,
  lookupBuff,
  lookupItem,
  RawCombatLog,
} from "../util/combatLog";

export interface LootProps {
  parsedData: CombatLogParsedData;
  input: RawCombatLog;
  data: GameData;
  csv: boolean;
}
function sortKey(buff: BuffLookupResult): string {
  switch (buff.data?.type) {
    case "officer":
      return `0.${buff.activatorDisplayName}.${buff.data.subtype}`;
    case "building":
      return `1.${buff.activatorDisplayName}.${buff.buffDisplayName}`;
    case "research":
      return `2.${buff.activatorDisplayName}.${buff.data.details.column}.${buff.data.details.row}`;
    case "forbidden_tech":
      return `3.${buff.activator_id}.${buff.buff_id}`;
    case "consumable":
      return `3.${buff.activator_id}.${buff.buff_id}`;
    case "other":
      return `8.${buff.activator_id}.${buff.buff_id}`;
    case undefined:
      return `9.${buff.activator_id}.${buff.buff_id}`;
  }
}

export const Loot = ({ parsedData, input, data, csv }: LootProps) => {
  const tableData: (string | number)[][] = [];
  const ships = parsedData.allShips;

  const allLoot = ships
    .flatMap((s) => [
      ...Object.keys(s.fleetData.initial_cargo.resources || {}),
      ...Object.keys(s.fleetData.final_cargo.resources || {}),
      ...Object.keys(s.fleetData.initial_cargo_list[s.infoIndex]?.resources || {}),
      ...Object.keys(s.fleetData.final_cargo_list[s.infoIndex]?.resources || {}),
    ])
    .filter((v, i, a) => a.findIndex((v2) => v == v2) === i)
    .map((item_id) => lookupItem(+item_id, data))
    .sort((a, b) => {
      const sA = a.data?.sorting_index || 0;
      const sB = b.data?.sorting_index || 0;
      return sA - sB;
    });

  tableData.push(["", ...ships.map((s) => getShipName(s, input, data))]);

  tableData.push([""]);
  tableData.push(["INITIAL CARGO"]);
  allLoot.forEach((item) => {
    tableData.push([
      item.displayName,
      ...ships.map((s) => {
        const shipAmount =
          (s.fleetData.initial_cargo.resources?.[item.item_id] || 0) +
          (s.fleetData.initial_cargo_list[s.infoIndex]?.resources?.[item.item_id] || 0);
        return shipAmount != 0 ? shipAmount : "";
      }),
    ]);
  });

  tableData.push([""]);
  tableData.push(["FINAL CARGO"]);
  allLoot.forEach((item) => {
    tableData.push([
      item.displayName,
      ...ships.map((s) => {
        const shipAmount =
          (s.fleetData.final_cargo.resources?.[item.item_id] || 0) +
          (s.fleetData.final_cargo_list[s.infoIndex]?.resources?.[item.item_id] || 0);
        return shipAmount != 0 ? shipAmount : "";
      }),
    ]);
  });

  const columns: ColumnDefinition[] = [
    { label: "Item", align: "left" },
    ...ships.map((ps) => ({ label: ps.displayName, align: "left" }) as const),
  ];

  return (
    <CombatLogTable
      csv={csv}
      columns={columns}
      data={tableData
        .filter(
          (rowData) =>
            rowData.length <= 1 ||
            rowData
              .slice(1)
              .reduce<number>((acc, x) => acc + (typeof x == "number" ? x : x.length), 0) > 0,
        )
        .map((rowData) => {
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
