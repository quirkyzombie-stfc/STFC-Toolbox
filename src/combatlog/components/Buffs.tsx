import * as React from "react";
import { ColumnDefinition, CombatLogTable } from "./CombatLogTable";
import { ShipComponentWeapon } from "../../util/gameData";
import {
  BuffLookupResult,
  CombatLogParsedData,
  GameData,
  getShipName,
  lookupBuff,
  RawCombatLog,
} from "../util/combatLog";

export interface BuffsProps {
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
      return `4.${buff.activator_id}.${buff.buff_id}`;
    case "other":
      return `8.${buff.activator_id}.${buff.buff_id}`;
    case undefined:
      return `9.${buff.activator_id}.${buff.buff_id}`;
  }
}

export const Buffs = ({ parsedData, input, data, csv }: BuffsProps) => {
  const tableData: (string | number | undefined)[][] = [];
  const ships = parsedData.allShips;

  const allBuffs = ships
    .flatMap((s) =>
      s.fleetInfo.active_buffs.map((b) => ({ buff_id: b.buff_id, activator_id: b.activator_id })),
    )
    .filter(
      (v, i, a) =>
        a.find((v2) => v.buff_id == v2.buff_id && v.activator_id == v2.activator_id) === v,
    )
    .map(({ buff_id, activator_id }) => lookupBuff(buff_id, activator_id, data))
    .sort((a, b) => {
      const keyA = sortKey(a);
      const keyB = sortKey(b);
      if (keyA < keyB) return -1;
      else if (keyA > keyB) return 1;
      else return 0;
    });

  tableData.push(["", "", "", ...ships.map((s) => getShipName(s, input, data))]);
  allBuffs.forEach((buff) => {
    tableData.push([
      buff.data?.type?.toUpperCase(),
      buff.activatorDisplayName,
      buff.buffDisplayName,
      ...ships.map((s) => {
        const shipBuff = s.fleetInfo.active_buffs.find(
          (ab) => ab.buff_id === buff.buff_id && ab.activator_id === buff.activator_id,
        );
        if (shipBuff !== undefined) {
          const maxRank = shipBuff.ranks.reduce((acc, r) => Math.max(acc, r + 1), 0);
          switch (buff.data?.type) {
            case "research":
              return `${maxRank}/${buff.data.details.levels.length}`;
            case "officer":
              return `${maxRank}`;
            case "building":
              return `${maxRank}`;
            case "other":
              return `${maxRank}`;
            case "consumable":
              return `${maxRank}`;
            case "forbidden_tech":
              return `${maxRank}/${
                buff.data.details.tiers[buff.data.details.tiers.length - 1].max_level
              }`;
            case undefined:
              return `${maxRank}`;
          }
        } else {
          return "";
        }
      }),
    ]);
  });

  const columns: ColumnDefinition[] = [
    { label: "Category", align: "left" },
    { label: "Activator", align: "left" },
    { label: "Buff", align: "left" },
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
