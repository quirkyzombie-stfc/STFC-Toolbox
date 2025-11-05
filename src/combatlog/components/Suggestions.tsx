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
  shieldMitigationTotal,
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
const formatREHP = (x: number) =>
  isNaN(x) ? "" : x >= 1 ? `+${(100 * (x - 1)).toFixed(2)}%` : `-${(100 * (1 - x)).toFixed(2)}%`;

interface ContentProps {
  playerShip: CombatLogShip;
  targetShip: CombatLogShip;
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
const colorHhp = "#C63739";
const colorEnergy = "rgba(0, 136, 254, 1)";
const colorKinetic = "#00C49F";
const colorIsolitic = "#FFBB28";
const colorNone = "#ffffff";

interface ShipContext {
  ship: CombatLogShip;
  stats: ShipStats;

  // Some precomputed stats for convenience
  sRawDamageEnergy: Stats;
  sRawDamageKinetic: Stats;
  sRawDamageIsolitic: Stats;
  sActualDamageEnergy: Stats;
  sActualDamageKinetic: Stats;
  sActualDamageIsolitic: Stats;
  sTotalDamageHhp: Stats;
  sTotalDamageShp: Stats;
  sIsoMultiplier: Stats;
  sShotsIn: Stats;
  sDamageInRaw: Stats;
  sDamageInShp: Stats;
  sDamageInHhp: Stats;
  sDamageMultiplierStd: Stats;
  sDamageMultiplierIso: Stats;
  sMitigationApex: Stats;
  sMitigationIso: Stats;
  sMitigationStd: Stats;
  sHullRepairPercent: Stats;
}

function createShipContext(ship: CombatLogShip, parsedData: CombatLogParsedData): ShipContext {
  const rawDamageEnergy = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "ENERGY",
    (x) => x.std_damage,
  );
  const rawDamageKinetic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "KINETIC",
    (x) => x.std_damage,
  );
  const rawDamageIsolitic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.iso_damage,
  );

  const actualDamageEnergy = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "ENERGY" && x.std_damage > 0,
    (x) => (x.std_damage - x.std_mitigated) * (1 - x.apex_mitigation),
  );
  const actualDamageKinetic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.std_damage_type === "KINETIC" && x.std_damage > 0,
    (x) => (x.std_damage - x.std_mitigated) * (1 - x.apex_mitigation),
  );
  const actualDamageIsolitic = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => x.iso_damage > 0,
    (x) => (x.iso_damage - x.iso_mitigated) * (1 - x.apex_mitigation),
  );

  const totalDamageHhp = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.hhp,
  );
  const totalDamageShp = getStats(
    parsedData.stats.ships[ship.shipId].damageOut,
    (x) => true,
    (x) => x.shp,
  );

  const shotsIn = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => true,
    (x) => 1,
  );
  const damageInRaw = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => x.std_damage + x.iso_damage > 0,
    (x) => x.std_damage + x.iso_damage,
  );
  const damageInShp = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => x.shp > 0,
    (x) => x.shp,
  );
  const damageInHhp = getStats(
    parsedData.stats.ships[ship.shipId].damageIn,
    (x) => x.hhp > 0,
    (x) => x.hhp,
  );

  const hullRepairPercent = getStats(
    parsedData.stats.ships[ship.shipId].hullRepairs,
    (x) => true,
    (x) => x.fraction,
  );

  return {
    ship: ship,
    stats: parsedData.stats.ships[ship.shipId],
    sRawDamageEnergy: rawDamageEnergy,
    sRawDamageKinetic: rawDamageKinetic,
    sRawDamageIsolitic: rawDamageIsolitic,
    sActualDamageEnergy: actualDamageEnergy,
    sActualDamageKinetic: actualDamageKinetic,
    sActualDamageIsolitic: actualDamageIsolitic,
    sTotalDamageHhp: totalDamageHhp,
    sTotalDamageShp: totalDamageShp,
    sIsoMultiplier: isoDamageMultiplierStats(ship, parsedData),
    sShotsIn: shotsIn,
    sDamageInRaw: damageInRaw,
    sDamageInShp: damageInShp,
    sDamageInHhp: damageInHhp,
    sDamageMultiplierStd: stdDamageMultiplierStats(ship, parsedData, 0.5, false),
    sDamageMultiplierIso: isoDamageMultiplierStats(ship, parsedData),
    sMitigationApex: apexMitigationStats(ship, parsedData),
    sMitigationIso: isoMitigationStats(ship, parsedData),
    sMitigationStd: stdMitigationStats(ship, parsedData),
    sHullRepairPercent: hullRepairPercent,
  };
}

const DamagePieChart = ({ context }: { context: ShipContext }) => {
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

  const dataDamageRaw = [
    { name: "Energy", value: context.sRawDamageEnergy.sum, fill: colorEnergy },
    { name: "Kinetic", value: context.sRawDamageKinetic.sum, fill: colorKinetic },
    { name: "Isolitic", value: context.sRawDamageIsolitic.sum, fill: colorIsolitic },
  ].filter((r) => r.value > 0);

  const dataDamageActual = [
    { name: "Energy", value: context.sActualDamageEnergy.sum, fill: colorEnergy },
    { name: "Kinetic", value: context.sActualDamageKinetic.sum, fill: colorKinetic },
    { name: "Isolitic", value: context.sActualDamageIsolitic.sum, fill: colorIsolitic },
  ].filter((r) => r.value > 0);
  const dataDamageShpHhp = [
    { name: "SHP", value: context.sTotalDamageShp.sum, fill: colorHhp },
    { name: "HHP", value: context.sTotalDamageHhp.sum, fill: colorShp },
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
          {shortNumber(
            context.sRawDamageEnergy.sum +
              context.sRawDamageKinetic.sum +
              context.sRawDamageIsolitic.sum,
          )}
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
          {shortNumber(
            context.sActualDamageEnergy.sum +
              context.sActualDamageKinetic.sum +
              context.sActualDamageIsolitic.sum,
          )}
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
          {shortNumber(context.sTotalDamageHhp.sum) + " HHP"}
        </text>
      </Pie>
    </PieChart>
  );
};

const QuickStats = ({ context }: { context: ShipContext }) => {
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
          cells: ["Damage multiplier", formatStats(context.sDamageMultiplierStd, formatNumber)],
        },
        {
          cells: ["Iso multiplier", formatStats(context.sDamageMultiplierIso, formatNumber)],
        },

        {
          cells: ["Apex mitigation", formatStats(context.sMitigationApex, formatPercentage)],
        },
        {
          cells: ["Iso mitigation", formatStats(context.sMitigationIso, formatPercentage)],
        },
        {
          cells: ["Std mitigation", formatStats(context.sMitigationStd, formatPercentage)],
        },
        {
          cells: ["Hull repair", formatStats(context.sHullRepairPercent, formatPercentage)],
        },
        {
          cells: [
            "Shield uptime",
            formatPercentage(context.sDamageInShp.count / context.sDamageInRaw.count),
          ],
        },
      ]}
    />
  );
};

const FiringPatternChart = ({ context }: { context: ShipContext }) => {
  interface Point {
    x: number; // round
    y: number; // subround
    z: number; // shp + hhp
    c: string; // color
  }
  const points = Object.values(
    context.stats.damageOut
      .filter((d) => d.t.round <= 15)
      .reduce(
        (acc, d) => {
          const key = `${d.t.round}-${d.t.subRound}`;
          if (!acc[key]) {
            acc[key] = {
              x: d.t.round,
              y: d.t.subRound,
              z: d.shp + d.hhp,
              c:
                d.std_damage_type === "ENERGY"
                  ? colorEnergy
                  : d.std_damage_type === "KINETIC"
                    ? colorKinetic
                    : colorIsolitic,
            };
          } else {
            acc[key].z += d.shp + d.hhp;
          }
          return acc;
        },
        {} as { [key: string]: Point },
      ),
  );

  const zDomain = [
    0,
    Math.max.apply(
      null,
      points.map((p) => p.z),
    ),
  ];
  const zRange: [number, number] = [10, 500];

  return (
    <ScatterChart
      style={{ width: "100%", height: "300px" }}
      responsive
      margin={{
        top: 20,
        right: 0,
        bottom: 0,
        left: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        type="number"
        domain={[0, 16]}
        ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}
        name="round"
        label={{
          position: "center",
          value: "Round",
        }}
        dataKey="x"
      />
      <YAxis
        type="number"
        domain={[0, 7]}
        ticks={[1, 2, 3, 4, 5, 6]}
        name="subround"
        label={{
          angle: 90,
          position: "center",
          value: "Subround",
        }}
        dataKey="y"
      />
      <ZAxis
        type="number"
        name="damage"
        dataKey="z"
        domain={zDomain}
        range={zRange}
        scale="linear"
      />
      <Scatter name={`subround`} fill="#8884d8" data={points}>
        {points.map((p) => (
          <Cell key={`cell-${p.x}`} fill={p.c} />
        ))}
      </Scatter>
    </ScatterChart>
  );
};

const SuggestionEnergyDamageReduction = (playerShip: ShipContext, targetShip: ShipContext) => {
  const actualDamageEnergy = targetShip.sActualDamageEnergy.sum;
  const actualDamageKinetic = targetShip.sActualDamageKinetic.sum;
  const actualDamageIsolitic = targetShip.sActualDamageIsolitic.sum;
  const actualTotalDamage = actualDamageEnergy + actualDamageKinetic + actualDamageIsolitic;
  const damageBonus = average(targetShip.sDamageMultiplierStd);

  const rEHP = (reduction: number) => {
    const newActualDamageEnergy =
      (targetShip.sActualDamageEnergy.sum * Math.max(0, damageBonus + reduction)) / damageBonus;
    const newActualTotalDamage = newActualDamageEnergy + actualDamageKinetic + actualDamageIsolitic;
    const rEHP = actualTotalDamage / newActualTotalDamage;
    return rEHP;
  };

  return {
    cells: ["Energy damage reduction", "Chen", formatREHP(rEHP(-0.66))],
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
              cells: [formatNumber(reduction), "TODO", formatREHP(rEHP(reduction))],
            };
          })}
        />
      </>
    ),
  };
};

const SuggestionKineticDamageReduction = (playerShip: ShipContext, targetShip: ShipContext) => {
  const actualDamageEnergy = targetShip.sActualDamageEnergy.sum;
  const actualDamageKinetic = targetShip.sActualDamageKinetic.sum;
  const actualDamageIsolitic = targetShip.sActualDamageIsolitic.sum;
  const actualTotalDamage = actualDamageEnergy + actualDamageKinetic + actualDamageIsolitic;

  const damageBonus = average(targetShip.sDamageMultiplierStd);

  const rEHP = (reduction: number) => {
    const newActualDamageKinetic =
      (actualDamageKinetic * Math.max(0, damageBonus + reduction)) / damageBonus;
    const newActualTotalDamage = actualDamageEnergy + newActualDamageKinetic + actualDamageIsolitic;
    const rEHP = actualTotalDamage / newActualTotalDamage;
    return rEHP;
  };

  return {
    cells: ["Kinetic damage reduction", "Cath", formatREHP(rEHP(-0.55))],
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
              cells: [formatNumber(reduction), "TODO", formatREHP(rEHP(reduction))],
            };
          })}
        />
      </>
    ),
  };
};

const SuggestionIsoDefense = (playerShip: ShipContext, targetShip: ShipContext) => {
  const isoMitigation = average(playerShip.sMitigationIso);
  const isoDefense = 1 / (1 - isoMitigation) - 1;

  // Note: ignoring apex mitigation, as it affects all damage types equally
  const actualDamageEnergy = targetShip.sActualDamageEnergy.sum;
  const actualDamageKinetic = targetShip.sActualDamageKinetic.sum;
  const actualDamageIsolitic = targetShip.sActualDamageIsolitic.sum;
  const actualTotalDamage = actualDamageEnergy + actualDamageKinetic + actualDamageIsolitic;

  const rEHP = (defense: number) => {
    const newActualDamageIsolitic =
      (actualDamageIsolitic / (1 - isoMitigation)) * (1 / (1 + defense + isoDefense));
    const newActualTotalDamage = actualDamageEnergy + actualDamageKinetic + newActualDamageIsolitic;
    const rEHP = actualTotalDamage / newActualTotalDamage;
    return rEHP;
  };

  return {
    cells: ["Isolitic defense", "Joachim", formatREHP(rEHP(100.0))],
    details: (
      <>
        <p>
          Assuming you have a isolitic mitigation of {formatPercentage(isoMitigation)} (measured
          from this combat log), your have a isolitic defense of {formatPercentage(isoDefense)}.
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
              cells: [formatPercentage(defense), "TODO", formatREHP(rEHP(defense))],
            };
          })}
        />
      </>
    ),
  };
};

const SuggestionStdMitigation = (playerShip: ShipContext, targetShip: ShipContext) => {
  const stdMitigation = average(playerShip.sMitigationStd);
  const apexMitigation = average(playerShip.sMitigationApex);

  const rawDamageStd = targetShip.sRawDamageEnergy.sum + targetShip.sRawDamageKinetic.sum;
  const actualDamageStd = targetShip.sActualDamageEnergy.sum + targetShip.sActualDamageKinetic.sum;
  const actualDamageIsolitic = targetShip.sActualDamageIsolitic.sum;
  const actualTotalDamage = actualDamageStd + actualDamageIsolitic;

  const rEHP = (mitigation: number) => {
    const newActualDamageStd = rawDamageStd * (1 - mitigation) * (1 - apexMitigation);
    const newActualTotalDamage = newActualDamageStd + actualDamageIsolitic;
    const rEHP = actualTotalDamage / newActualTotalDamage;
    return rEHP;
  };

  return {
    cells: ["Standard mitigation", "Paris, Moreau", formatREHP(rEHP(0.712))],
    details: (
      <>
        <p>
          Assuming you have a standard mitigation of {formatPercentage(stdMitigation)} (measured
          from this combat log), changing your standard mitigation will affect your rEHP as follows:
        </p>
        <SimpleTable
          columns={[
            { label: "Standard mitigation", align: "left" },
            { label: "rEHP", align: "right" },
          ]}
          data={[0.1616, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.712].map(
            (mitigation) => {
              return {
                cells: [formatPercentage(mitigation), formatREHP(rEHP(mitigation))],
              };
            },
          )}
        />
      </>
    ),
  };
};

const SuggestionShieldMitigation = (playerShip: ShipContext, targetShip: ShipContext) => {
  const damageInShpHhp = playerShip.sDamageInShp.sum + playerShip.sDamageInHhp.sum;
  if (damageInShpHhp === 0) {
    return {
      cells: ["Shield mitigation", "", "N/A"],
      details: (
        <>
          <p>Can't analyze impact of shield mitigation, as you didn't take a single hit.</p>
        </>
      ),
    };
  }

  interface ShieldMitigationBonus {
    firstRound: number; // KSG Shield Mitigation, Fat Mudd
    constantBuff: number; // Cerritos
    constant: number; // SNW Pike, 1of11
    onAttack: number; // WoK Carol, Janeway
    description?: string;
  }

  const baseShieldMitigation =
    playerShip.ship.components.flatMap((c) =>
      c?.component.data.tag === "Shield" ? [c.component.data] : [],
    )[0]?.mitigation ?? 0.8;

  const damageInShp = playerShip.sDamageInShp.sum;
  const shieldMitigation = damageInShp / damageInShpHhp;

  const shieldMitigationForBonus = (bonus: ShieldMitigationBonus) => {
    let newDamageInShp = 0;
    let lastAttackRound = -1;
    let attacksThisRound = 0;
    playerShip.stats.damageIn.forEach((d) => {
      if (d.t.round != lastAttackRound) {
        lastAttackRound = d.t.round;
        attacksThisRound = 0;
      }
      let shieldMitigation = Math.min(
        1.0,
        baseShieldMitigation +
          (d.t.round === 0 ? bonus.firstRound : 0) +
          bonus.constant +
          bonus.constantBuff +
          attacksThisRound * bonus.onAttack,
      );
      newDamageInShp += (d.shp + d.hhp) * shieldMitigation;
      attacksThisRound++;
    });
    return newDamageInShp / damageInShpHhp;
  };

  const rEHP = (bonus: ShieldMitigationBonus) => {
    const newShieldMitigation = shieldMitigationForBonus(bonus);
    const rEHP = (1 - shieldMitigation) / (1 - newShieldMitigation);
    return rEHP;
  };

  const firstRoundValues = [0.025];
  const constantBuffValues = [0, 0.025];

  const bonusValues: ShieldMitigationBonus[] = [];
  for (const firstRound of firstRoundValues) {
    for (const constantBuff of constantBuffValues) {
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (4%)",
        constant: 0.04,
        onAttack: 0,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (9%)",
        constant: 0.09,
        onAttack: 0,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (11%)",
        constant: 0.11,
        onAttack: 0,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (13%)",
        constant: 0.13,
        onAttack: 0,
      });

      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (4%) + T1 WoK Carol (5%)",
        constant: 0.04,
        onAttack: 0.05,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (4%) + T2 WoK Carol (7%)",
        constant: 0.04,
        onAttack: 0.07,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (4%) + T3 WoK Carol (10%)",
        constant: 0.04,
        onAttack: 0.1,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (4%) + T4 WoK Carol (15%)",
        constant: 0.04,
        onAttack: 0.15,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (4%) + T5 WoK Carol (25%)",
        constant: 0.04,
        onAttack: 0.25,
      });

      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (13%) + T1 WoK Carol (5%)",
        constant: 0.13,
        onAttack: 0.05,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "SNW Pike (13%) + T2 WoK Carol (7%)",
        constant: 0.13,
        onAttack: 0.07,
      });

      bonusValues.push({
        firstRound,
        constantBuff,
        description: "Janeway (6%)",
        constant: 0.0,
        onAttack: 0.06,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "Janeway (13%)",
        constant: 0.0,
        onAttack: 0.13,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "Janeway (20%)",
        constant: 0.0,
        onAttack: 0.2,
      });

      bonusValues.push({
        firstRound,
        constantBuff,
        description: "Janeway (6%) + T1 WoK Carol (5%)",
        constant: 0.0,
        onAttack: 0.11,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "Janeway (6%) + T2 WoK Carol (7%)",
        constant: 0.0,
        onAttack: 0.13,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "Janeway (6%) + T3 WoK Carol (10%)",
        constant: 0.0,
        onAttack: 0.16,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "Janeway (6%) + T4 WoK Carol (15%)",
        constant: 0.0,
        onAttack: 0.21,
      });

      bonusValues.push({
        firstRound,
        constantBuff,
        description: "T1 WoK Carol (5%)",
        constant: 0.0,
        onAttack: 0.05,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "T2 WoK Carol (7%)",
        constant: 0.0,
        onAttack: 0.07,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "T3 WoK Carol (10%)",
        constant: 0.0,
        onAttack: 0.1,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "T4 WoK Carol (15%)",
        constant: 0.0,
        onAttack: 0.15,
      });
      bonusValues.push({
        firstRound,
        constantBuff,
        description: "T5 WoK Carol (25%)",
        constant: 0.0,
        onAttack: 0.25,
      });
    }
  }

  return {
    cells: [
      "Shield mitigation",
      "SNW Pike, Janeway, WoK Carol",
      formatREHP(rEHP({ firstRound: 0.025, constantBuff: 0.025, constant: 0.13, onAttack: 0.25 })),
    ],
    details: (
      <>
        <p>
          Your shield component has a base shield mitigation of{" "}
          {formatPercentage(baseShieldMitigation)}.<br />
          In this combat, you had an overall shield mitigation of{" "}
          {formatPercentage(shieldMitigation)} (across all attacks).
          <br />
          Here's how different combinations of shield mitigation bonuses would affect your rEHP.
        </p>
        <SimpleTable
          columns={[
            { label: "KSG Shield Mitigation", align: "left" },
            { label: "Cerritos buff", align: "left" },
            { label: "Officers", align: "left" },
            { label: "Shield mitigation", align: "left" },
            { label: "rEHP", align: "right" },
          ]}
          data={bonusValues
            .map((bonus) => {
              return {
                cells: [
                  formatPercentage(bonus.firstRound),
                  formatPercentage(bonus.constantBuff),
                  bonus.description ?? "",
                  formatPercentage(shieldMitigationForBonus(bonus)),
                  formatREHP(rEHP(bonus)),
                ],
              };
            })
            .sort((a, b) => parseFloat(b.cells[3]) - parseFloat(a.cells[3]))}
        />
      </>
    ),
  };
};

const SuggestionDamageIncrease = (playerShip: ShipContext, targetShip: ShipContext) => {
  const damageBonusStats = playerShip.sDamageMultiplierStd;
  if (damageBonusStats.count === 0) {
    return {
      cells: ["Damage bonus", "", "N/A"],
      details: (
        <>
          <p>
            Could not determine your current damage bonus from this combat log, as none of your
            attacks were non-critical hits.
          </p>
        </>
      ),
    };
  }

  const damageBonus = average(damageBonusStats);
  const rDPR = (increase: number) => {
    const rDPR = (damageBonus + increase) / damageBonus;
    return rDPR;
  };
  return {
    cells: ["Damage bonus", "", formatNumber(rDPR(1000))],
    details: (
      <>
        <p>
          Assuming your current damage bonus is {formatPercentage(damageBonus)} (measured from this
          combat log), increasing your damage bonus will affect your rDPR as follows:
        </p>
        <SimpleTable
          columns={[
            { label: "Additional damage bonus", align: "left" },
            { label: "rDPR", align: "right" },
          ]}
          data={[0.1, 0.2, 0.5, 1.0, 1.5, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0, 200.0, 500.0].map(
            (increase) => {
              return {
                cells: [formatPercentage(increase), formatNumber(rDPR(increase))],
              };
            },
          )}
        />
      </>
    ),
  };
};

const Content = ({ playerShip, targetShip, parsedData, csv, input, data }: ContentProps) => {
  const playerContext = createShipContext(playerShip, parsedData);
  const targetContext = createShipContext(targetShip, parsedData);
  const targetName = `${targetShip.displayName} [${getShipName(targetShip, input, data)}]`;
  const playerName = `${playerShip.displayName} [${getShipName(playerShip, input, data)}]`;

  const playerRemainingHitPoints = playerContext.stats.hitPoints.map((d, i) => ({
    round: d.t.round,
    i: i,
    hhp: d.hhp,
    shp: d.shp,
  }));

  return (
    <>
      <Grid size={{ xs: 12 }}>
        <h1>
          {playerName} vs {targetName}
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
        <h4>{targetName} damage</h4>
        <DamagePieChart context={targetContext} />
      </Grid>
      <Grid size={{ xs: 2 }}>
        <h4>{targetName} stats</h4>
        <QuickStats context={targetContext} />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <h4>{targetName} firing pattern - actual damage after mitigation</h4>
        <FiringPatternChart context={targetContext} />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <h4>{playerName} damage</h4>
        <DamagePieChart context={playerContext} />
      </Grid>
      <Grid size={{ xs: 2 }}>
        <h4>{playerName} stats</h4>
        <QuickStats context={playerContext} />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <h4>{playerName} hit points over time</h4>

        <div style={{ width: "100%" }}>
          <AreaChart
            style={{ width: "100%", height: "320px" }}
            responsive
            data={playerRemainingHitPoints}
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
        <h2>Defensive crew suggestions</h2>
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
            SuggestionEnergyDamageReduction(playerContext, targetContext),
            SuggestionKineticDamageReduction(playerContext, targetContext),
            SuggestionIsoDefense(playerContext, targetContext),
            SuggestionStdMitigation(playerContext, targetContext),
            SuggestionShieldMitigation(playerContext, targetContext),
          ].sort((a, b) => +b.cells[2].replace("%", "") - +a.cells[2].replace("%", ""))}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <h2>Offensive crew suggestions</h2>
        <Alert severity="warning">
          <AlertTitle>How suggestions are ranked</AlertTitle>
          Suggestions are ranked by the relative change to damage dealt per round.
        </Alert>
        <CollapsibleTable
          columns={[
            { label: "Effect", align: "left" },
            { label: "Example officers", align: "right" },
            { label: "rDPR", align: "right" },
          ]}
          data={[SuggestionDamageIncrease(playerContext, targetContext)].sort(
            (a, b) => +b.cells[2] - +a.cells[2],
          )}
        />
      </Grid>
    </>
  );
};

export const Suggestions = ({ parsedData, input, data, csv }: SuggestionsProps) => {
  const [playerShipId, setPlayerShipId] = useState<number | undefined>(
    parsedData.allShips[0]?.shipId,
  );
  const [targetShipId, setTargetShipId] = useState<number | undefined>(
    parsedData.allShips[1]?.shipId,
  );

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField
            id="select"
            label="Your ship"
            placeholder="Select your ship"
            fullWidth
            value={playerShipId}
            select
            onChange={(event) => setPlayerShipId(+event.target.value)}
          >
            {Object.keys(parsedData.stats.ships).map((shipId) => (
              <MenuItem value={shipId} key={shipId}>
                {parsedData.shipById[+shipId].displayName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            id="select"
            label="Target ship"
            placeholder="Select the target ship"
            fullWidth
            value={targetShipId}
            select
            onChange={(event) => setTargetShipId(+event.target.value)}
          >
            {Object.keys(parsedData.stats.ships).map((shipId) => (
              <MenuItem value={shipId} key={shipId}>
                {parsedData.shipById[+shipId].displayName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {playerShipId !== undefined && targetShipId !== undefined ? (
          <Content
            playerShip={parsedData.shipById[playerShipId]}
            targetShip={parsedData.shipById[targetShipId]}
            parsedData={parsedData}
            csv={csv}
            input={input}
            data={data}
          />
        ) : null}
      </Grid>
    </React.Fragment>
  );
};
