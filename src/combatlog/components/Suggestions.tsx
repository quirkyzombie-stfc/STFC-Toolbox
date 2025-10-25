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
  Label,
  AreaChart,
  Area,
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
  Chip,
  Stack,
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
  getStats,
  Stats,
} from "../util/combatLogStats";
import { CombatLogTable } from "./CombatLogTable";
import { shortNumber } from "../util/format";
import { ComponentLookupResult, getWeaponDamageType } from "../util/gameData";
import { ShipComponentWeapon } from "../../util/gameData";
import { SimpleTable } from "../../components/SimpleTable";
import { CollapsibleTable } from "../../components/CollapsibleTable";

export interface SuggestionsProps {
  parsedData: CombatLogParsedData;
  input: RawCombatLog;
  data: GameData;
  csv: boolean;
}

const formatPercentage = (x: number) => (isNaN(x) ? "" : `${(100 * x).toFixed(2)}%`);
const formatMultiplier = (x: number) => (isNaN(x) ? "" : `${x.toFixed(4)}`);
const formatNumber = (x: number) => (isNaN(x) ? "" : shortNumber(x));

interface ContentProps {
  ship: CombatLogShip;
  parsedData: CombatLogParsedData;
  input: RawCombatLog;
  data: GameData;
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

const colorShp = "#66BFFF";
const colorHhp = "#FF69B4";
const colorEnergy = "rgba(0, 136, 254, 1)";
const colorKinetic = "#00C49F";
const colorIsolitic = "#FFBB28";
const colorNone = "#ffffff";

const DamagePieChart = ({ ship, parsedData, csv, input, data }: ContentProps) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={"middle"} dominantBaseline="central">
        {`${((percent ?? 1) * 100).toFixed(1)}%`}
      </text>
    );
  };

  const shipWeapons: ShipComponentWeapon[] = ship.components.flatMap((c, i) =>
    c?.component.data.tag === "Weapon" ? [c.component.data] : [],
  );

  const avgIsoMultiplier = average(isoDamageMultiplierStats(ship, parsedData));

  const rawDamageEnergy = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "ENERGY",
    (x) => x.std_damage,
  ).sum;
  const rawDamageKinetic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "KINETIC",
    (x) => x.std_damage,
  ).sum;
  const rawDamageIsolitic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.iso_damage,
  ).sum;

  const actualDamageEnergy = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "ENERGY" && x.std_damage > 0,
    (x) => (x.std_damage - x.std_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualDamageKinetic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "KINETIC" && x.std_damage > 0,
    (x) => (x.std_damage - x.std_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualDamageIsolitic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.iso_damage > 0,
    (x) => (x.iso_damage - x.iso_mitigated) * (1 - x.apex_mitigation),
  ).sum;

  const totalDamageHhp = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.hhp,
  ).sum;
  const totalDamageShp = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.shp,
  ).sum;

  /*
  const energyBaseDamage = shipWeapons
    .filter((c) => getWeaponDamageType(c) === "ENERGY")
    .reduce((p, c) => p + (((c.minimum_damage + c.maximum_damage) / 2) * c.shots) / c.cool_down, 0);
  const kineticBaseDamage = shipWeapons
    .filter((c) => getWeaponDamageType(c) === "KINETIC")
    .reduce((p, c) => p + (((c.minimum_damage + c.maximum_damage) / 2) * c.shots) / c.cool_down, 0);
  const isoBaseDamage = (energyBaseDamage + kineticBaseDamage) * avgIsoMultiplier;
  */

  const dataDamageRaw = [
    { name: "Energy", value: rawDamageEnergy, fill: colorEnergy },
    { name: "Kinetic", value: rawDamageKinetic, fill: colorKinetic },
    { name: "Isolitic", value: rawDamageIsolitic, fill: colorIsolitic },
  ].filter((r) => r.value > 0);

  const dataDamageActual = [
    { name: "Energy", value: actualDamageEnergy, fill: colorEnergy },
    { name: "Kinetic", value: actualDamageKinetic, fill: colorKinetic },
    { name: "Isolitic", value: actualDamageIsolitic, fill: colorIsolitic },
  ].filter((r) => r.value > 0);
  const dataDamageShpHhp = [
    { name: "SHP", value: totalDamageHhp, fill: colorHhp },
    { name: "HHP", value: totalDamageShp, fill: colorShp },
  ].filter((r) => r.value > 0);

  return (
    <PieChart responsive style={{ height: "210px", width: "520px" }}>
      <Pie
        data={dataDamageRaw}
        label={renderCustomizedLabel}
        labelLine={false}
        dataKey="value"
        nameKey="name"
        cx="90"
        cy="100"
        outerRadius={80}
        innerRadius={30}
        fill="#8884d8"
      >
        {dataDamageRaw.map((r) => (
          <Cell key={`cell-${r.name}`} fill={r.fill} />
        ))}
        <text x={90} y={10} textAnchor="middle" dominantBaseline="middle">
          Raw
        </text>
        <text x={90} y={200} textAnchor="middle" dominantBaseline="middle">
          {shortNumber(rawDamageEnergy + rawDamageKinetic + rawDamageIsolitic)}
        </text>
      </Pie>
      <Pie
        data={dataDamageActual}
        label={renderCustomizedLabel}
        labelLine={false}
        dataKey="value"
        nameKey="name"
        cx="260"
        cy="100"
        outerRadius={80}
        innerRadius={30}
        fill="#8884d8"
      >
        {dataDamageActual.map((r) => (
          <Cell key={`cell-${r.name}`} fill={r.fill} />
        ))}
        <text x={260} y={10} textAnchor="middle" dominantBaseline="middle">
          After mitigation
        </text>
        <text x={260} y={200} textAnchor="middle" dominantBaseline="middle">
          {shortNumber(actualDamageEnergy + actualDamageKinetic + actualDamageIsolitic)}
        </text>
      </Pie>
      <Pie
        data={dataDamageShpHhp}
        label={renderCustomizedLabel}
        labelLine={false}
        dataKey="value"
        nameKey="name"
        cx="430"
        cy="100"
        outerRadius={80}
        innerRadius={30}
        fill="#8884d8"
      >
        {dataDamageShpHhp.map((r) => (
          <Cell key={`cell-${r.name}`} fill={r.fill} />
        ))}
        <text x={430} y={10} textAnchor="middle" dominantBaseline="middle">
          Hit points
        </text>
        <text x={430} y={200} textAnchor="middle" dominantBaseline="middle">
          {shortNumber(totalDamageHhp) + " HHP"}
        </text>
      </Pie>
    </PieChart>
  );
};

const QuickStats = ({ ship, parsedData, csv, input, data }: ContentProps) => {
  const formatStats = (s: Stats, format: (value: number) => string) =>
    s.count === 0 ? "N/A" : format(s.sum / s.count);

  return (
    <SimpleTable
      minWidth={200}
      size="small"
      columns={[
        { label: "Stat", align: "left" },
        { label: "Value", align: "right" },
      ]}
      data={[
        {
          cells: [
            "Damage multiplier",
            formatStats(stdDamageMultiplierStats(ship, parsedData, 0.5, false), formatNumber),
          ],
        },
        {
          cells: [
            "Iso multiplier",
            formatStats(isoDamageMultiplierStats(ship, parsedData), formatNumber),
          ],
        },

        {
          cells: [
            "Apex mitigation",
            formatStats(apexMitigationStats(ship, parsedData), formatPercentage),
          ],
        },
        {
          cells: [
            "Iso mitigation",
            formatStats(isoMitigationStats(ship, parsedData), formatPercentage),
          ],
        },
        {
          cells: [
            "Std mitigation",
            formatStats(stdMitigationStats(ship, parsedData), formatPercentage),
          ],
        },

        {
          cells: [
            "Hull repair",
            formatStats(
              getStats(
                parsedData.stats.ships[ship.shipId].hullRepairs,
                (x) => true,
                (x) => x.fraction,
              ),
              formatNumber,
            ),
          ],
        },
      ]}
    />
  );
};

const SuggestionEnergyDamageReduction = ({ ship, parsedData }: ContentProps) => {
  const actualDamageEnergy = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "ENERGY" && x.std_damage > 0,
    (x) => (x.std_damage - x.std_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualDamageKinetic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "KINETIC" && x.std_damage > 0,
    (x) => (x.std_damage - x.std_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualDamageIsolitic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.iso_damage > 0,
    (x) => (x.iso_damage - x.iso_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualTotalDamage = actualDamageEnergy + actualDamageKinetic + actualDamageIsolitic;

  const damageBonusStats = stdDamageMultiplierStats(ship, parsedData, 0.5, false);
  const damageBonus = damageBonusStats.sum / damageBonusStats.count;

  const rEHP = (reduction: number) => {
    const newActualDamageEnergy = actualDamageEnergy * Math.max(0, damageBonus + reduction) / damageBonus;
    const newActualTotalDamage = newActualDamageEnergy + actualDamageKinetic + actualDamageIsolitic;
    const rEHP = actualTotalDamage / newActualTotalDamage;
    return rEHP;
  };

  return {
    cells: ["Energy damage reduction", "Chen", formatNumber(rEHP(-0.66))],
    details: (
      <>
        <p>
          Assuming the target has a damage bonus of {formatPercentage(damageBonus)} (measured from
          this combat log), reducing the target energy damage bonus will affect your rEHP as
          follows:
        </p>
        <SimpleTable
          columns={[
            { label: "Reduction", align: "left" },
            { label: "Setup", align: "left" },
            { label: "rEHP", align: "right" },
          ]}
          data={[-0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.66].map((reduction) => {
            return {
              cells: [formatNumber(reduction), "TODO", formatNumber(rEHP(reduction))],
            };
          })}
        />
      </>
    ),
  };
};

const SuggestionKineticDamageReduction = ({ ship, parsedData }: ContentProps) => {
  const actualDamageEnergy = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "ENERGY" && x.std_damage > 0,
    (x) => (x.std_damage - x.std_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualDamageKinetic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "KINETIC" && x.std_damage > 0,
    (x) => (x.std_damage - x.std_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualDamageIsolitic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.iso_damage > 0,
    (x) => (x.iso_damage - x.iso_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualTotalDamage = actualDamageEnergy + actualDamageKinetic + actualDamageIsolitic;

  const damageBonusStats = stdDamageMultiplierStats(ship, parsedData, 0.5, false);
  const damageBonus = damageBonusStats.sum / damageBonusStats.count;

  const rEHP = (reduction: number) => {
    const newActualDamageKinetic = actualDamageKinetic * Math.max(0, damageBonus + reduction) / damageBonus;
    const newActualTotalDamage = actualDamageEnergy + newActualDamageKinetic + actualDamageIsolitic;
    const rEHP = actualTotalDamage / newActualTotalDamage;
    return rEHP;
  };

  return {
    cells: ["Kinetic damage reduction", "Cath", formatNumber(rEHP(-0.55))],
    details: (
      <>
        <p>
          Assuming the target has a damage bonus of {formatPercentage(damageBonus)} (measured from
          this combat log), reducing the target kinetic damage bonus will affect your rEHP as
          follows:
        </p>
        <SimpleTable
          columns={[
            { label: "Reduction", align: "left" },
            { label: "Setup", align: "left" },
            { label: "rEHP", align: "right" },
          ]}
          data={[-0.1, -0.2, -0.3, -0.4, -0.5, -0.55].map((reduction) => {
            return {
              cells: [formatNumber(reduction), "TODO", formatNumber(rEHP(reduction))],
            };
          })}
        />
      </>
    ),
  };
};

const SuggestionIsoDefense = ({ ship, parsedData }: ContentProps, playerShip: CombatLogShip) => {
  const isoMitigationS = isoMitigationStats(playerShip, parsedData);
  const isoMitigation = isoMitigationS.sum / isoMitigationS.count;
  const isoDefense = 1 / (1 - isoMitigation) - 1;

  const actualDamageEnergy = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "ENERGY" && x.std_damage > 0,
    (x) => (x.std_damage - x.std_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualDamageKinetic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "KINETIC" && x.std_damage > 0,
    (x) => (x.std_damage - x.std_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualDamageIsolitic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.iso_damage > 0,
    (x) => (x.iso_damage - x.iso_mitigated) * (1 - x.apex_mitigation),
  ).sum;
  const actualTotalDamage = actualDamageEnergy + actualDamageKinetic + actualDamageIsolitic;

  const damageBonusStats = stdDamageMultiplierStats(ship, parsedData, 0.5, false);
  const damageBonus = damageBonusStats.sum / damageBonusStats.count;

  const rEHP = (defense: number) => {
    const newActualDamageIsolitic = actualDamageIsolitic / (1 - isoMitigation) * (1 / (1 + defense + isoDefense));
    const newActualTotalDamage = actualDamageEnergy + actualDamageKinetic + newActualDamageIsolitic;
    const rEHP = actualTotalDamage / newActualTotalDamage;
    return rEHP;
  };

  return {
    cells: ["Isolitic defense", "Joachim", formatNumber(rEHP(100.0))],
    details: (
      <>
        <p>
          Assuming you have a isolitic mitigation of {formatPercentage(isoMitigation)} (measured from
          this combat log), your have a isolitic defense of {formatPercentage(isoDefense)}.
          Adding more isolitic defense will affect your rEHP as follows:
        </p>
        <SimpleTable
          columns={[
            { label: "Iso defense", align: "left" },
            { label: "Source", align: "left" },
            { label: "rEHP", align: "right" },
          ]}
          data={[0.1, 0.2, 0.5, 1.0, 1.5, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0].map((defense) => {
            return {
              cells: [formatPercentage(defense), "TODO", formatNumber(rEHP(defense))],
            };
          })}
        />
      </>
    ),
  };
};

const Content = ({ ship, parsedData, csv, input, data }: ContentProps) => {
  const hostileName = getShipName(ship, input, data);
  const playerShip = parsedData.allShips.filter((s) => s.fleetId != ship.fleetId)[0];
  const playerName = playerShip.displayName;

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

  const remainingHitPoints = parsedData.stats.ships[playerShip.shipId].hitPoints.map((d, i) => ({
    round: d.t.round,
    i: i,
    hhp: d.hhp,
    shp: d.shp,
  }));

  return (
    <>
      <Grid size={{ xs: 12 }}>
        <h1>
          {playerName} vs {hostileName}
        </h1>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Stack direction="row" spacing={1}>
          <Chip label="Isolitic damage" sx={{ bgcolor: colorIsolitic }} />
          <Chip label="Energy damage" sx={{ bgcolor: colorEnergy }} />
          <Chip label="Kinetic damage" sx={{ bgcolor: colorKinetic }} />
          <Chip label="Hull hit points" sx={{ bgcolor: colorHhp }} />
          <Chip label="Shield hit points" sx={{ bgcolor: colorShp }} />
        </Stack>
      </Grid>
      <Grid size={{ xs: 4 }}>
        <h4>{hostileName} damage</h4>
        <DamagePieChart ship={ship} parsedData={parsedData} csv={csv} input={input} data={data} />
      </Grid>
      <Grid size={{ xs: 2 }}>
        <h4>{hostileName} stats</h4>
        <QuickStats ship={ship} parsedData={parsedData} csv={csv} input={input} data={data} />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <h4>{hostileName} firing pattern</h4>

        <div style={{ width: "100%" }}>
          {damageByRound.map((data, i) => (
            <ScatterChart
              style={{ width: "100%", height: "80px" }}
              responsive
              margin={{
                top: 20,
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
          ))}
        </div>
      </Grid>
      <Grid size={{ xs: 4 }}>
        <h4>{playerName} damage</h4>
        <DamagePieChart
          ship={playerShip}
          parsedData={parsedData}
          csv={csv}
          input={input}
          data={data}
        />
      </Grid>
      <Grid size={{ xs: 2 }}>
        <h4>{playerName} stats</h4>
        <QuickStats ship={playerShip} parsedData={parsedData} csv={csv} input={input} data={data} />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <h4>{playerName} hit points over time</h4>

        <div style={{ width: "100%" }}>
          <AreaChart
            style={{ width: "100%", height: "320px" }}
            responsive
            data={remainingHitPoints}
            margin={{
              top: 20,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="i" />
            <YAxis width="auto" />
            <Tooltip />
            <Area type="monotone" dataKey="hhp" stackId="1" stroke={colorHhp} fill={colorHhp} />
            <Area type="monotone" dataKey="shp" stackId="1" stroke={colorShp} fill={colorShp} />
          </AreaChart>
        </div>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <h2>Crew suggestions</h2>
        <Alert severity="warning">
          <AlertTitle>How suggestions are ranked</AlertTitle>
          Suggestions are ranked by the relative change to effective hit points. E.g., if an effect
          shows a value of 1.2, it means that you can survive 20% longer if you apply that effect.
          Some suggestions might not be feasible to apply, expand the rows for more information.
        </Alert>
        <CollapsibleTable
          columns={[
            { label: "Effect", align: "left" },
            { label: "Example officers", align: "right" },
            { label: "rEHP", align: "right" },
          ]}
          data={[
            SuggestionEnergyDamageReduction({ ship, parsedData, csv, input, data }),
            SuggestionKineticDamageReduction({ ship, parsedData, csv, input, data }),
            SuggestionIsoDefense({ ship, parsedData, csv, input, data }, playerShip),
          ].sort((a, b) => +b.cells[2] - +a.cells[2])}
        />
      </Grid>
    </>
  );
};

export const Suggestions = ({ parsedData, input, data, csv }: SuggestionsProps) => {
  const [shipId, setShipId] = useState<number | undefined>(parsedData.allShips[1]?.shipId);

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            id="select"
            label="Hostile"
            placeholder="Select the hostile ship"
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
          <Content
            ship={parsedData.shipById[shipId]}
            parsedData={parsedData}
            csv={csv}
            input={input}
            data={data}
          />
        )}
      </Grid>
    </React.Fragment>
  );
};
