import * as React from "react";
import { ColumnDefinition, CombatLogTable } from "./CombatLogTable";
import { ShipComponentWeapon } from "../../util/gameData";
import {
  CombatLogParsedData,
  GameData,
  getWeaponDamageType,
  lookupBattleLogAbility,
  lookupComponent,
  RawCombatLog,
} from "../util/combatLog";

export interface BattleLogProps {
  parsedData: CombatLogParsedData;
  input: RawCombatLog;
  data: GameData;
  csv: boolean;
}
const roundTo2Digits = (x: number) => Math.round((x + Number.EPSILON) * 100.0) / 100.0;

export const BattleLog = ({ parsedData, input, data, csv }: BattleLogProps) => {
  const tableData: (string | number | undefined)[][] = parsedData.battleLog.flatMap(
    (round, roundId) => [
      ...round.hullRepairs.flatMap((event, repairId) => [
        [
          roundId + 1,
          0,
          repairId + 1,
          parsedData.shipById[event.ship].displayName,
          "REPAIR",
          "",
          "",
          "",
          event.hull_repaired,
        ],
      ]),
      ...round.subRounds.flatMap((subround, subRoundId) =>
        subround.events.flatMap((event, eventId) => {
          switch (event.type) {
            case "attack": {
              const weapon = lookupComponent(event.weapon, data);
              const weaponData = weapon?.component.data as ShipComponentWeapon | undefined;
              const totalDamage =
                event.damage_mitigated +
                event.damage_taken_shield +
                event.damage_taken_hull +
                event.damage_iso_mitigated +
                event.damage_apex_mitigated;
              return [
                [
                  roundId + 1,
                  subRoundId + 1,
                  eventId + 1,
                  parsedData.shipById[event.ship].displayName,
                  "ATTACK",
                  parsedData.shipById[event.target].displayName,
                  weapon?.displayName,
                  weaponData ? getWeaponDamageType(weaponData) : undefined,
                  roundTo2Digits(
                    totalDamage - event.damage_iso_unmitigated - event.damage_iso_mitigated,
                  ),
                  roundTo2Digits(event.damage_mitigated),
                  roundTo2Digits(event.damage_iso_unmitigated + event.damage_iso_mitigated),
                  roundTo2Digits(event.damage_iso_mitigated),
                  roundTo2Digits(event.damage_apex_mitigated),
                  event.damage_taken_shield,
                  event.damage_taken_hull,
                  event.crit ? "CRIT" : "",
                  event.remaining_shield,
                  event.remaining_hull,
                ],
                ...event.triggers.map((trigger) => {
                  const ability = lookupBattleLogAbility(trigger.ability, trigger.officer, data);
                  return [
                    roundId + 1,
                    subRoundId + 1,
                    eventId + 1,
                    parsedData.shipById[event.ship].displayName,
                    "TRIGGER",
                    ability?.source || "???",
                    ability?.sourceDisplayName || trigger.officer,
                    ability?.abilityDisplayName || trigger.ability,
                    trigger.value,
                  ];
                }),
              ];
            }
            case "charge": {
              const weapon = lookupComponent(event.weapon, data);
              const weaponData = weapon?.component.data as ShipComponentWeapon | undefined;
              return [
                [
                  roundId + 1,
                  subRoundId + 1,
                  eventId + 1,
                  parsedData.shipById[event.ship].displayName,
                  "CHARGE",
                  "",
                  weapon?.displayName,
                  weaponData ? getWeaponDamageType(weaponData) : undefined,
                  `${Math.round(event.charge * 100)}%`,
                ],
              ];
            }
            case "ability": {
              const ability = lookupBattleLogAbility(event.ability, event.officer, data);
              return [
                [
                  roundId + 1,
                  subRoundId + 1,
                  eventId + 1,
                  parsedData.shipById[event.ship].displayName,
                  "APPLY",
                  ability?.source || "???",
                  ability?.sourceDisplayName || event.officer,
                  ability?.abilityDisplayName || event.ability,
                  event.value,
                ],
              ];
            }
            default:
              return [roundId + 1, subRoundId + 1, eventId + 1, "???", (event as any).type, "???"];
          }
        }),
      ),
    ],
  );

  const columns: ColumnDefinition[] = [
    { label: "Round", align: "left" },
    { label: "Subround", align: "left" },
    { label: "Event", align: "left" },
    { label: "Subject", align: "left" },
    { label: "Verb", align: "left" },
    { label: "Object", align: "left" },
    { label: "Weapon", align: "left" },
    { label: "Damage type", align: "left" },
    { label: "Std Damage", align: "left" },
    { label: "Std Damage mitigated", align: "left" },
    { label: "Iso damage", align: "left" },
    { label: "Iso damage mitigated", align: "left" },
    { label: "Damage apex mitigated", align: "left" },
    { label: "Damage to SHP", align: "left" },
    { label: "Damage to HHP", align: "left" },
    { label: "Crit", align: "left" },
    { label: "Remaining SHP", align: "left" },
    { label: "Remaining HHP", align: "left" },
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
