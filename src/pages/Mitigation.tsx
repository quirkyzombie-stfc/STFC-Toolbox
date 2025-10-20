import * as React from "react";
import { useFormState } from "react-use-form-state";
import AutoSizer from "react-virtualized-auto-sizer";
import { styled, Theme } from "@mui/material/styles";
import {
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  Typography,
  Switch,
  Slider,
} from "@mui/material";
import { Frame } from "../components/Frame";
import { ShipTypeSelect } from "../components/ShipTypeSelect";
import { SimpleTable } from "../components/SimpleTable";
import { getMitigation, getMitigationComponent, getDMitigation } from "../util/mechanics";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
} from "recharts";

const FormField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1),
}));
const ShipTypeSelectField = styled(ShipTypeSelect)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const defenseData = Array(80)
  .fill(0)
  .map((_, idx) => idx / 10)
  .map((v) => ({
    ratio: v,
    mitigation: getMitigationComponent(v, 1),
  }));

const marks = [
  {
    value: -5,
    label: "-100k",
  },
  {
    value: -4,
    label: "-10k",
  },
  {
    value: -3,
    label: "-1k",
  },
  {
    value: -2,
    label: "-100",
  },
  {
    value: 0,
    label: "0",
  },
  {
    value: 2,
    label: "100",
  },
  {
    value: 3,
    label: "1k",
  },
  {
    value: 4,
    label: "10k",
  },
  {
    value: 5,
    label: "100k",
  },
];

export function Mitigation() {
  const [formState, { number, raw, text }] = useFormState({
    attackerArmorPiercing: 15000,
    attackerShieldPiercing: 94000,
    attackerAccuracy: 15000,
    defenderArmor: 400,
    defenderShield: 400,
    defenderDodge: 35000,
    defenderType: "Interceptor",
  });
  const [scenarioBonusE, setScenarioBonusE] = React.useState<number>(3.0);
  const [scenarioAttacker, setScenarioAttacker] = React.useState<boolean>(false);
  const scenarioBonus = Math.round(
    scenarioBonusE > 0 ? Math.pow(10, scenarioBonusE) : -Math.pow(10, -scenarioBonusE),
  );
  const scenarioBonusStr = scenarioBonus > 0 ? "+" + scenarioBonus : "" + scenarioBonus;

  const mitigation = getMitigation(
    +formState.values.defenderArmor,
    +formState.values.defenderShield,
    +formState.values.defenderDodge,
    +formState.values.attackerArmorPiercing,
    +formState.values.attackerShieldPiercing,
    +formState.values.attackerAccuracy,
    formState.values.defenderType,
  );
  /*const dMitigation = getDMitigation(
        +formState.values.defenderArmor, 
        +formState.values.defenderShield,
        +formState.values.defenderDodge,
        +formState.values.attackerArmorPiercing,
        +formState.values.attackerShieldPiercing,
        +formState.values.attackerAccuracy,
        formState.values.defenderType,
    );*/

  const scenarioRow = (name: string, originalMitigation: number, bonuses: any) => {
    const mitigation = getMitigation(
      +formState.values.defenderArmor + (bonuses.defenderArmor || 0.0),
      +formState.values.defenderShield + (bonuses.defenderShield || 0.0),
      +formState.values.defenderDodge + (bonuses.defenderDodge || 0.0),
      +formState.values.attackerArmorPiercing + (bonuses.attackerArmorPiercing || 0.0),
      +formState.values.attackerShieldPiercing + (bonuses.attackerShieldPiercing || 0.0),
      +formState.values.attackerAccuracy + (bonuses.attackerAccuracy || 0.0),
      formState.values.defenderType,
    );
    const relDmg = (1 - mitigation) / (1 - originalMitigation) - 1;
    const relDmgStr =
      relDmg < 0 ? `${(100 * relDmg).toFixed(1)}%` : `+${(100 * relDmg).toFixed(1)}%`;
    return [name, (100 * mitigation).toFixed(2) + "%", relDmgStr];
  };

  return (
    <Frame title="Mitigation toolbox">
      <h2>Mitigation calculator</h2>
      <p>
        Estimates the damage mitigation, based on defense and piercing values. Should be accurate to
        1%.
      </p>
      <form noValidate autoComplete="off">
        <Grid container spacing={4}>
          <Grid size={{ xs: 4 }}>
            <h4>Attacker</h4>
            <FormField
              required
              fullWidth
              label="Armor piercing"
              {...number("attackerArmorPiercing")}
            />
            <FormField
              required
              fullWidth
              label="Shield piercing"
              {...number("attackerShieldPiercing")}
            />
            <FormField required fullWidth label="Accuracy" {...number("attackerAccuracy")} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <h4>Defender</h4>
            <FormField required fullWidth label="Armor" {...number("defenderArmor")} />
            <FormField required fullWidth label="Shield deflection" {...number("defenderShield")} />
            <FormField required fullWidth label="Dodge" {...number("defenderDodge")} />
            <ShipTypeSelectField required fullWidth label="Ship type" {...raw("defenderType")} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <h4>Mitigation</h4>
            <Typography variant="h4" display="block" gutterBottom>
              {(mitigation * 100).toFixed(4) + "%"}
            </Typography>
          </Grid>
        </Grid>
      </form>
      <h2>Scenarios</h2>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <p>
            Quickly inspect how mitigation would change if you have more defense or piercing values.
          </p>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography id="attacker-switch" gutterBottom>
                Attacker/Defender
              </Typography>
              <Switch
                checked={scenarioAttacker}
                onChange={(_, value) => setScenarioAttacker(value)}
                color="default"
                inputProps={{ "aria-label": "attacker-switch" }}
              />
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Typography id="bonus-slider" gutterBottom>
                Absolute bonus: {scenarioBonus}
              </Typography>
              <Slider
                step={0.01}
                min={-6}
                max={6}
                marks={marks}
                value={scenarioBonusE}
                onChange={(_, value) => setScenarioBonusE(value as number)}
                aria-labelledby="bonus-slider"
              />
            </Grid>
          </Grid>
          <SimpleTable
            columns={[
              { label: "Scenario", align: "left" },
              { label: "Mitigation", align: "right" },
              {
                label: scenarioAttacker ? "Damage done" : "Damage taken",
                align: "right",
              },
            ]}
            data={
              scenarioAttacker
                ? [
                    {
                      cells: scenarioRow(`${scenarioBonusStr} to armor piercing`, mitigation, {
                        attackerArmorPiercing: scenarioBonus,
                      }),
                    },
                    {
                      cells: scenarioRow(`${scenarioBonusStr} to shield piercing`, mitigation, {
                        attackerShieldPiercing: scenarioBonus,
                      }),
                    },
                    {
                      cells: scenarioRow(`${scenarioBonusStr} to accuracy`, mitigation, {
                        attackerAccuracy: scenarioBonus,
                      }),
                    },
                    {
                      cells: scenarioRow(`${scenarioBonusStr} to all piercing`, mitigation, {
                        attackerArmorPiercing: scenarioBonus,
                        attackerShieldPiercing: scenarioBonus,
                        attackerAccuracy: scenarioBonus,
                      }),
                    },
                  ]
                : [
                    {
                      cells: scenarioRow(`${scenarioBonusStr} to armor`, mitigation, {
                        defenderArmor: scenarioBonus,
                      }),
                    },
                    {
                      cells: scenarioRow(`${scenarioBonusStr} to shield deflection`, mitigation, {
                        defenderShield: scenarioBonus,
                      }),
                    },
                    {
                      cells: scenarioRow(`${scenarioBonusStr} to dodge`, mitigation, {
                        defenderDodge: scenarioBonus,
                      }),
                    },
                    {
                      cells: scenarioRow(`${scenarioBonusStr} to all defenses`, mitigation, {
                        defenderArmor: scenarioBonus,
                        defenderShield: scenarioBonus,
                        defenderDodge: scenarioBonus,
                      }),
                    },
                  ]
            }
          />
        </Grid>
      </Grid>

      <h2>How it works</h2>
      <p>
        Damage mitigation has 3 components: armor, shield deflection, and dodge. For each component,
        divide the corresponding defense value by the corresponding piercing value and look up the
        mitigation in the chart below. Finally, weight each individual mitigation value by 0.3
        (surveys), 0.55 (combat ship primary defense), or 0.2 (combat ship secondary defense) and
        combine them multiplicatively.
      </p>
      <p>
        More precisely: Given defender armor <code>dA</code>, defender shield deflection{" "}
        <code>dS</code>, defender dodge <code>dD</code>, attacker armor piercing <code>pA</code>,
        attacker shield piercing <code>pS</code>, and attacker accuracy <code>pD</code>, mitigation
        is <code>1 - (1 - cA * f(dA / pA)) * (1 - cS * f(dS / pS)) * (1 - cD * f(dD / pD)) </code>
        where <code>f</code> is a nonlinear function and <code>[cA, cS, cD]</code> is equal to{" "}
        <code>[0.3, 0.3, 0.3]</code> for surveys, <code>[0.55, 0.2, 0.2]</code> for battleships,{" "}
        <code>[0.2, 0.55, 0.2]</code> for explorers, and <code>[0.2, 0.2, 0.55]</code> for
        interceptors.
      </p>
      <p>
        The logistic function <code>y = 1 / (1 + 4^(1.1 - x)))</code> (shown below) provides an
        almost perfect fit for <code>f</code> (accurate to 0.1%).
      </p>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <AutoSizer disableHeight>
            {({ width }) => (
              <ComposedChart
                width={width}
                height={400}
                data={defenseData}
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
                  dataKey="ratio"
                  type="number"
                  label={{
                    value: "Defense / Piercing",
                    position: "insideBottom",
                    offset: 0,
                  }}
                  domain={[0, 8]}
                />
                <YAxis
                  type="number"
                  label={{
                    value: "Mitigation",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  domain={[0, 1]}
                />
                {/*<Scatter name="red" dataKey="red" fill="red" />
                            <Scatter name="blue" dataKey="blue" fill="blue" />*/}
                <Line
                  dataKey="mitigation"
                  stroke="blue"
                  type="monotone"
                  dot={false}
                  activeDot={false}
                  legendType="none"
                />
              </ComposedChart>
            )}
          </AutoSizer>
        </Grid>
      </Grid>
    </Frame>
  );
}
