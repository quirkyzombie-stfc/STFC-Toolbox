import * as React from "react";
import { useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import {
  Card,
  CardContent,
  Collapse,
  Typography,
  Grid2,
  TextField,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  BuffLookupResult,
  CombatLogParsedData,
  CombatLogShip,
  GameData,
  getShipName,
  lookupBuff,
  lookupComponent,
  RawCombatLog,
} from "../util/combatLog";
import {
  CombatLogTime,
  DamageSample,
  HitPointSample,
  HitPointChangeSample,
  ShipStats,
  EmptyEventSample,
  shotsOut,
  stdDamageMultiplierTotal,
  stdDamageMultiplierStats,
  average,
  stdMitigationStats,
  isoMitigationStats,
  Stats as CombatLogStats,
  isoDamageMultiplierStats,
  apexMitigationTotal,
  apexMitigationStats,
} from "../util/combatLogStats";
import { CombatLogTable } from "./CombatLogTable";
import { shortNumber } from "../util/format";

export interface StatsProps {
  parsedData: CombatLogParsedData;
  input: RawCombatLog;
  data: GameData;
  csv: boolean;
}

const formatPercentage = (x: number) => (isNaN(x) ? "" : `${(100 * x).toFixed(3)}%`);
const formatMultiplier = (x: number) => (isNaN(x) ? "" : `${x.toFixed(4)}`);
const formatNumber = (x: number) => (isNaN(x) ? "" : shortNumber(x));

interface TableProps {
  ship: CombatLogShip;
  parsedData: CombatLogParsedData;
  csv: boolean;
}

const row = (s: CombatLogStats, format: (x: number) => string) => [
  formatNumber(s.count),
  format(s.min),
  s.count > 0 ? format(s.sum / s.count) : "",
  format(s.max),
];

const rowWithTf = (s: CombatLogStats, f: (x: number) => number, format: (x: number) => string) => {
  const min = f(s.min);
  const max = f(s.min);
  const avg = s.count > 0 ? f(s.sum / s.count) : NaN;
  return [
    formatNumber(s.count),
    format(max > min ? min : max),
    format(avg),
    format(max > min ? max : min),
  ];
};

const Content = ({ ship, parsedData, csv }: TableProps) => {
  const avgIsoMultiplier = average(isoDamageMultiplierStats(ship, parsedData));
  const avgApexMitigation = average(apexMitigationStats(ship, parsedData));

  return (
    <>
      <Grid2 size={{ xs: 12 }}>
        <h2>Standard damage</h2>
        <CombatLogTable
          csv={csv}
          columns={[
            { label: "Stat", align: "left" },
            { label: "Samples", align: "left" },
            { label: "Min", align: "left" },
            { label: "Average", align: "left" },
            { label: "Max", align: "left" },
          ]}
          data={[
            {
              cells: [
                "Std damage multiplier: (actual std damage / weapon base damage), assuming MIN base roll, non-crits only",
                ...row(stdDamageMultiplierStats(ship, parsedData, 0.0, false), formatMultiplier),
              ],
            },
            {
              cells: [
                "Std damage multiplier: (actual std damage / weapon base damage), assuming AVERAGE base roll, non-crits only",
                ...row(stdDamageMultiplierStats(ship, parsedData, 0.5, false), formatMultiplier),
              ],
            },
            {
              cells: [
                "Std damage multiplier: (actual std damage / weapon base damage), assuming MAX base roll, non-crits only",
                ...row(stdDamageMultiplierStats(ship, parsedData, 1.0, false), formatMultiplier),
              ],
            },
            {
              cells: [
                "Crit std damage multiplier: (actual std damage / weapon base damage), assuming MIN base roll, crits only",
                ...row(stdDamageMultiplierStats(ship, parsedData, 0.0, true), formatMultiplier),
              ],
            },
            {
              cells: [
                "Crit std damage multiplier: (actual std damage / weapon base damage), assuming AVERAGE base roll, crits only",
                ...row(stdDamageMultiplierStats(ship, parsedData, 0.5, true), formatMultiplier),
              ],
            },
            {
              cells: [
                "Crit std damage multiplier: (actual std damage / weapon base damage), assuming MAX base roll, crits only",
                ...row(stdDamageMultiplierStats(ship, parsedData, 1.0, true), formatMultiplier),
              ],
            },
          ]}
        ></CombatLogTable>
      </Grid2>
      <Grid2 size={{ xs: 12 }}>
        <h2>Isolitic damage</h2>
        <CombatLogTable
          csv={csv}
          columns={[
            { label: "Stat", align: "left" },
            { label: "Samples", align: "left" },
            { label: "Min", align: "left" },
            { label: "Average", align: "left" },
            { label: "Max", align: "left" },
          ]}
          data={[
            {
              cells: [
                "Iso damage multiplier: (iso damage / std damage)",
                ...row(isoDamageMultiplierStats(ship, parsedData), formatMultiplier),
              ],
            },
          ]}
        ></CombatLogTable>
        <p>
          The final isolitic damage multiplier depends on the isolitic damage bonus and isolitic
          cascade bonus. Here are different combinations of the two stats that lead to the observed
          average total multiplier of {formatMultiplier(avgIsoMultiplier)}:
        </p>
        <CombatLogTable
          csv={csv}
          columns={[
            { label: "Iso damage multiplier", align: "left" },
            { label: "Iso damage bonus", align: "left" },
            { label: "Iso cascade bonus", align: "left" },
          ]}
          data={[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((x) => {
            return {
              cells: [
                formatMultiplier(avgIsoMultiplier),
                formatPercentage(x * avgIsoMultiplier),
                formatPercentage((avgIsoMultiplier * (1 - x)) / (1 + x * avgIsoMultiplier)),
              ],
            };
          })}
        ></CombatLogTable>
      </Grid2>
      <Grid2 size={{ xs: 12 }}>
        <h2>Mitigation</h2>
        <CombatLogTable
          csv={csv}
          columns={[
            { label: "Stat", align: "left" },
            { label: "Samples", align: "left" },
            { label: "Min", align: "left" },
            { label: "Average", align: "left" },
            { label: "Max", align: "left" },
          ]}
          data={[
            {
              cells: [
                "Std mitigation: (std mitigated damage / std damage)",
                ...row(stdMitigationStats(ship, parsedData), formatPercentage),
              ],
            },
            {
              cells: [
                "Iso mitigation: (iso mitigated damage / iso damage)",
                ...row(isoMitigationStats(ship, parsedData), formatPercentage),
              ],
            },
            {
              cells: [
                "Iso defense: (1 / (iso mitigation) - 1)",
                ...rowWithTf(
                  isoMitigationStats(ship, parsedData),
                  (x) => 1 / (1 - x) - 1,
                  formatPercentage,
                ),
              ],
            },
            {
              cells: [
                "Apex mitigation: (apex mitigated damage / unmitigated damage)",
                ...row(apexMitigationStats(ship, parsedData), formatPercentage),
              ],
            },
          ]}
        ></CombatLogTable>
        <p>
          The final apex mitigation depends on the apex barrier bonus of the defender and the apex
          shred bonus of the attacker. Here are different combinations of the two stats that lead to
          the observed average apex mitigation of {formatPercentage(avgApexMitigation)}:
        </p>
        <CombatLogTable
          csv={csv}
          columns={[
            { label: "Apex mitigation", align: "left" },
            { label: "Apex barrier bonus", align: "left" },
            { label: "Apex shred bonus", align: "left" },
          ]}
          data={[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.5, 1.55, 2.0, 5.0, 10.0].map((x) => {
            return {
              cells: [
                formatPercentage(avgApexMitigation),
                formatMultiplier((10000 / (1 - avgApexMitigation) - 10000) * (1 + x)),
                formatPercentage(x),
              ],
            };
          })}
        ></CombatLogTable>
      </Grid2>
    </>
  );
};

export const Stats = ({ parsedData, input, data, csv }: StatsProps) => {
  const [shipId, setShipId] = useState<number | undefined>(parsedData.allShips[0]?.shipId);

  return (
    <React.Fragment>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            id="select"
            label="Ship"
            placeholder="Select a ship"
            fullWidth
            value={shipId}
            select
            onChange={(event) => setShipId(+event.target.value)}
          >
            {Object.keys(parsedData.stats.ships).map((shipId) => (
              <MenuItem value={shipId} key={shipId}>
                {parsedData.shipById[+shipId].displayName}
              </MenuItem>
            ))}
          </TextField>
        </Grid2>
        {shipId === undefined ? null : (
          <Content ship={parsedData.shipById[shipId]} parsedData={parsedData} csv={csv} />
        )}
      </Grid2>
    </React.Fragment>
  );
};
