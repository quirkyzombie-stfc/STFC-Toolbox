import * as React from "react";
import { useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import {
  Card,
  CardContent,
  Collapse,
  Typography,
  Grid,
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
} from "../util/combatLogStats";

export interface BuffsProps {
  parsedData: CombatLogParsedData;
  input: RawCombatLog;
  data: GameData;
  csv: boolean;
}

type DataSeries = [string, DataSample[], (ds: number[]) => number];
type DataSample = { v: number; t: CombatLogTime };
type RechartsSample = { v: number; t: string };

function getAllStats(obj: ShipStats, data: GameData) {
  if (obj == undefined) {
    return [];
  }

  const sum = (ds: number[]) => ds.reduce((a, e) => a + e, 0);
  const avg = (ds: number[]) => ds.reduce((a, e) => a + e, 0) / ds.length;

  const damageSample = (prefix: string, ss: DamageSample[]) => {
    return [
      [prefix + "mitigation", ss.map((s) => ({ v: s.mitigation, t: s.t })), avg],
      [prefix + "hhp", ss.map((s) => ({ v: s.hhp, t: s.t })), avg],
      [prefix + "shp", ss.map((s) => ({ v: s.shp, t: s.t })), avg],
      [prefix + "crit", ss.map((s) => ({ v: s.crit ? 1 : 0, t: s.t })), avg],
      [prefix + "damageMultiplier", ss.map((s) => ({ v: s.damageMultiplier, t: s.t })), avg],
      [prefix + "std_damage", ss.map((s) => ({ v: s.std_damage, t: s.t })), sum],
      [prefix + "std_mitigated", ss.map((s) => ({ v: s.std_mitigated, t: s.t })), sum],
      [prefix + "apex_mitigated", ss.map((s) => ({ v: s.apex_mitigated, t: s.t })), sum],
      [prefix + "base_min", ss.map((s) => ({ v: s.base_min, t: s.t })), sum],
      [prefix + "base_max", ss.map((s) => ({ v: s.base_max, t: s.t })), sum],
    ] as DataSeries[];
  };

  const hitPointSample = (prefix: string, hs: HitPointSample[]) => {
    return [
      [prefix + "hhp", hs.map((s) => ({ v: s.hhp, t: s.t })), avg],
      [prefix + "shp", hs.map((s) => ({ v: s.shp, t: s.t })), avg],
    ] as DataSeries[];
  };

  const hitPointChangeSample = (prefix: string, hs: HitPointChangeSample[]) => {
    return [[prefix, hs.map((s) => ({ v: s.diff, t: s.t })), sum]] as DataSeries[];
  };

  const emptySample = (prefix: string, es: EmptyEventSample[]) => {
    return [[prefix, es.map((s) => ({ v: 1, t: s.t })), sum]] as DataSeries[];
  };

  const weaponSamples = (prefix: string, weapons: { [weaponId: number]: DamageSample[] }) => {
    return Object.entries(weapons).flatMap(([key, value]) => {
      const weapon = lookupComponent(+key, data)?.displayName ?? `weapon '${key}'`;
      return damageSample(prefix + weapon + " -> ", value);
    });
  };

  return [
    ...damageSample("damage in -> ", obj.damageIn),
    ...damageSample("damage out -> ", obj.damageOut),
    ...hitPointSample("hit points -> ", obj.hitPoints),
    ...hitPointChangeSample("hhp change", obj.hhpChange),
    ...hitPointChangeSample("shp change", obj.shpChange),
    ...emptySample("hhp depleted", obj.hhpDepleted),
    ...emptySample("shp depleted", obj.shpDepleted),
    ...weaponSamples("damage out -> ", obj.weapons),
  ];
}

function selectSeries(name: string, series: DataSeries[]): DataSeries | undefined {
  return series.find((s) => s[0] == name);
}

function applyResolution(res: Resolution, series: DataSeries | undefined): RechartsSample[] {
  if (series == undefined) {
    return [];
  }

  switch (res) {
    case "round":
      const byRound = Object.groupBy(series[1], (d) => `${d.t.round}` as string);
      return Object.keys(byRound).map((key) => {
        const ds = byRound[key]!;
        const t = ds[0].t;
        const v = series[2](ds.map((x) => x.v));
        return { v: v, t: `${t.round}` };
      });
    case "subround":
      const bySubround = Object.groupBy(series[1], (d) => `${d.t.round}:${d.t.subRound}` as string);
      return Object.keys(bySubround).map((key) => {
        const ds = bySubround[key]!;
        const t = ds[0].t;
        const v = series[2](ds.map((x) => x.v));
        return { v: v, t: `${t.round}: ${t.subRound}` };
      });
    case "event":
      return series[1].map((d) => ({ v: d.v, t: `${d.t.round}:${d.t.subRound}:${d.t.event}` }));
  }
}

type Resolution = "round" | "subround" | "event";

export const Charts = ({ parsedData, input, data, csv }: BuffsProps) => {
  const [shipId, setShipId] = useState<number | undefined>(parsedData.allShips[0]?.shipId);
  const [stat, setStat] = useState<string>("");
  const [resolution, setResolution] = useState<Resolution>("round");

  const allStats = getAllStats(parsedData.stats.ships[shipId || 0], data);
  const series = selectSeries(stat, allStats);
  const statData = applyResolution(resolution, series);

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item xs={4}>
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
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="select"
            label="Data"
            placeholder="Select data to display for the selected ship"
            fullWidth
            value={stat}
            select
            onChange={(event) => setStat(event.target.value)}
          >
            {allStats.map((stat) => (
              <MenuItem value={stat[0]} key={stat[0]}>
                {stat[0]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="select"
            label="Resolution"
            placeholder="Select data resolution"
            fullWidth
            value={resolution}
            select
            onChange={(event) => setResolution(event.target.value as Resolution)}
          >
            <MenuItem value={"round"} key={"round"}>
              Round
            </MenuItem>
            <MenuItem value={"subround"} key={"subround"}>
              Subround
            </MenuItem>
            <MenuItem value={"event"} key={"event"}>
              Event
            </MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <AutoSizer disableHeight>
            {({ width }) => (
              <ComposedChart
                width={width}
                height={400}
                data={statData}
                margin={{
                  top: 20,
                  right: 80,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <Tooltip />
                <Legend />

                <XAxis
                  dataKey="t"
                  type="category"
                  label={{
                    value: "Round",
                    position: "insideBottom",
                    offset: 0,
                  }}
                />
                <YAxis
                  dataKey="v"
                  type="number"
                  label={{ value: "Value", angle: -90, position: "insideLeft" }}
                />
                <Line
                  dataKey="v"
                  stroke="blue"
                  type="monotone"
                  dot={true}
                  activeDot={false}
                  legendType="none"
                />
              </ComposedChart>
            )}
          </AutoSizer>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
