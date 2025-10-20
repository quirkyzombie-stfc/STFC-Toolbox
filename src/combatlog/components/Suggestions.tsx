import * as React from "react";
import { useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";
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
  Alert,
  AlertTitle,
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
import { ComponentLookupResult, getWeaponDamageType } from "../util/gameData";
import { ShipComponentWeapon } from "../../util/gameData";
import { SimpleTable } from "../../components/SimpleTable";
import { CollapsibleTable } from "../../components/CollapsibleTable";

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

const isFiring = (round: number, warm_up: number, cool_down: number) =>
  round >= warm_up - 1 && (round - warm_up + 1) % cool_down === 0;

const Content = ({ ship, parsedData, csv }: TableProps) => {
  const colorEnergy = "#0088FE";
  const colorKinetic = "#00C49F";
  const colorIsolitic = "#FFBB28";
  const colorNone = "#ffffff";

  const avgIsoMultiplier = average(isoDamageMultiplierStats(ship, parsedData));
  const avgApexMitigation = average(apexMitigationStats(ship, parsedData));
  const avgIsoMitigation = average(isoMitigationStats(ship, parsedData));
  const avgStdMitigation = average(stdMitigationStats(ship, parsedData));
  const avdDmgMultiplier = average(stdDamageMultiplierStats(ship, parsedData, 0.5, false));

  const shipWeapons: ShipComponentWeapon[] = ship.components.flatMap((c, i) =>
    c?.component.data.tag === "Weapon" ? [c.component.data] : [],
  );

  const energyBaseDamage = shipWeapons
    .filter((c) => getWeaponDamageType(c) === "ENERGY")
    .reduce((p, c) => p + (((c.minimum_damage + c.maximum_damage) / 2) * c.shots) / c.cool_down, 0);
  const kineticBaseDamage = shipWeapons
    .filter((c) => getWeaponDamageType(c) === "KINETIC")
    .reduce((p, c) => p + (((c.minimum_damage + c.maximum_damage) / 2) * c.shots) / c.cool_down, 0);
  const isoBaseDamage = (energyBaseDamage + kineticBaseDamage) * avgIsoMultiplier;

  const shipWeaponsBySubround: (
    | { c: ComponentLookupResult; d: ShipComponentWeapon }
    | undefined
  )[] = ship.components
    .slice(7, 13)
    .map((c, i) =>
      c?.component.data.tag === "Weapon" ? { c: c, d: c.component.data } : undefined,
    );
  const damageByRound = shipWeaponsBySubround.flatMap((w, i) =>
    w === undefined
      ? []
      : [
          {
            data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].flatMap((r) =>
              isFiring(r, w.d.warm_up, w.d.cool_down)
                ? [
                    {
                      x: r,
                      y: 1,
                      c: getWeaponDamageType(w.d) === "ENERGY" ? colorEnergy : colorKinetic,
                      z: Math.pow(
                        (((w.d.maximum_damage + w.d.maximum_damage) / 2) * w.d.shots) / 1000,
                        2,
                      ),
                    },
                  ]
                : [
                    {
                      x: r,
                      y: 1,
                      c: colorNone,
                      z: 0,
                    },
                  ],
            ),
            subround: i,
            name: `W${i}`,
          },
        ],
  );

  const firingPatternZDomain = [
    0,
    Math.max.apply(
      null,
      damageByRound.flatMap((s) => s.data.map((r) => r.z)),
    ),
  ];
  const firingPatternZRange: [number, number] = [10, 300];

  const dataDamageTypes = [
    { name: "Standard Energy", value: energyBaseDamage },
    { name: "Standard Kinetic", value: kineticBaseDamage },
    { name: "Isolitic", value: isoBaseDamage },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={"middle"} dominantBaseline="central">
        {`${((percent ?? 1) * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <>
      <Grid size={{ xs: 3 }}>
        <h2>Damage types</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart responsive width={400} height={400}>
            <Pie
              data={dataDamageTypes}
              labelLine={false}
              label={renderCustomizedLabel}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
            >
              <Cell key={`cell-std-energy`} fill={colorEnergy} />
              <Cell key={`cell-std-kinetic`} fill={colorKinetic} />
              <Cell key={`cell-isolitic`} fill={colorIsolitic} />
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <h2>Firing pattern</h2>

        <div style={{ width: "100%" }}>
          {damageByRound.map((data, i) => (
            <ResponsiveContainer width="100%" height={60}>
              <ScatterChart
                margin={{
                  top: 10,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
              >
                <XAxis
                  type="category"
                  domain={[0, 15]}
                  dataKey="x"
                  interval={0}
                  tick={{ fontSize: 0 }}
                  tickLine={{ transform: "translate(0, -6)" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={`subround${i}`}
                  height={10}
                  width={80}
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: data.name, position: "insideRight" }}
                />
                <ZAxis
                  type="number"
                  dataKey="z"
                  domain={firingPatternZDomain}
                  range={firingPatternZRange}
                  scale="linear"
                />
                <Scatter name={`subround${i}`} fill="#8884d8" data={data.data}>
                  {data.data.map((r) => (
                    <Cell key={`cell-${r.x}`} fill={r.c} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ))}
        </div>
      </Grid>
      <Grid size={{ xs: 3 }}>
        <h2>Observed stats</h2>
        <SimpleTable
          minWidth={200}
          columns={[
            { label: "Stat", align: "left" },
            { label: "Value", align: "right" },
          ]}
          data={[
            { cells: ["Iso multiplier", formatNumber(avgIsoMultiplier)] },
            { cells: ["Apex mitigation", formatNumber(avgApexMitigation)] },
            { cells: ["Iso mitigation", formatNumber(avgIsoMitigation)] },
            { cells: ["Std mitigation", formatNumber(avgStdMitigation)] },
            { cells: ["Damage multiplier", formatNumber(avdDmgMultiplier)] },
          ]}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <h2>Crew suggestions</h2>
        <Alert severity="warning">
          <AlertTitle>How suggestions are ranked</AlertTitle>
          The table below shows the upper bound for the relative change to effective hit points.
          E.g., if "Std mitigation" shows a value of 1.2, it means that you can survive up to 20%
          longer if you max your std mitigation. If might not be feasible to reach the maximum,
          expand the row for more information.
        </Alert>
        <CollapsibleTable
          columns={[
            { label: "Effect", align: "left" },
            { label: "Example officers", align: "right" },
            { label: "Upper bound", align: "right" },
          ]}
          data={[
            { cells: ["Round begin shield absorption", "SNW Pike", "4.0"], details: "Test" },
            { cells: ["On hit shield absorption", "Janeway, WoK Carol", "3.5"], details: "Test" },
            { cells: ["Reload delay", "Chang", "2.0"], details: "Test" },
            { cells: ["Energy damage reduction", "Chen", "1.3"], details: "Test" },
            { cells: ["Kinetic damage reduction", "Cath", "1.3"], details: "Test" },
            { cells: ["Isolitic defense", "Joachim", "1.2"], details: "Test" },
            { cells: ["Std mitigation", "Joachim", "1.1"], details: "Test" },
          ]}
        />
      </Grid>
    </>
  );
};

export const Suggestions = ({ parsedData, input, data, csv }: StatsProps) => {
  const [shipId, setShipId] = useState<number | undefined>(parsedData.allShips[0]?.shipId);

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
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
        {shipId === undefined ? null : (
          <Content ship={parsedData.shipById[shipId]} parsedData={parsedData} csv={csv} />
        )}
      </Grid>
    </React.Fragment>
  );
};
