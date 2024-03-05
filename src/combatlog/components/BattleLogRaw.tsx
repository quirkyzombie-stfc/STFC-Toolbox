import * as React from "react";
import { ColumnDefinition } from "./CombatLogTable";
import { extractTags, RawCombatLog } from "../util/combatLog";
import { Input } from "@mui/material";

export interface BattleLogProps {
  input: RawCombatLog;
  csv: boolean;
}

export const BattleLogRaw = ({ input, csv }: BattleLogProps) => {
  const data: string = extractTags(input.battle_log).join("\n");

  return (
    <code>
      <pre>{data}</pre>
    </code>
  );
};
