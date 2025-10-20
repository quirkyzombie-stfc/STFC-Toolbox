import * as React from "react";
import { useFormState } from "react-use-form-state";
import { styled, Theme } from "@mui/material/styles";
import { Button, Grid, TextField } from "@mui/material";
import { Frame } from "../components/Frame";
import { CombatSimulator, CombatData, CombatSimulatorResult } from "../simulator/simulator";
import { SimpleTable } from "../components/SimpleTable";

const FormField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1),
}));
const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const defaultCombatData: CombatData = {
  ships: [
    {
      name: "Saladin",
      side: "Attacker",
      faction: "Federation",
      shipClass: "Interceptor",
      effects: [
        {
          name: "static",
          stats: {
            HHP: [100000, 4, 0],
            SHP: [50000, 4, 0],
            Armor: [1000, 3, 0],
            Shield: [1000, 3, 0],
            Dodge: [1000, 5, 0],
            ArmorPiercing: [1000, 5, 0],
            ShieldPiercing: [1000, 3, 0],
            Accuracy: [1000, 3, 0],
            ShieldAbsorption: [0.8, 0, 0],
            Weapon1MinDamage: [40000, 7, 0],
            Weapon1MaxDamage: [60000, 7, 0],
            Weapon1CritChance: [0.1, 0, 0],
            Weapon1CritDamage: [1.75, 0, 0],
            Weapon1Shots: [1, 0, 0],
            Weapon2MinDamage: [15000, 7, 0],
            Weapon2MaxDamage: [20000, 7, 0],
            Weapon2CritChance: [0.1, 0, 0],
            Weapon2CritDamage: [1.75, 0, 0],
            Weapon2Shots: [1, 0, 0],
          },
        },
      ],
      abilities: [
        {
          name: "Harrison",
          onCombatStart: `ship.target.addEffect({name:"Harrison", stats: {ShieldAbsorption:[0,-0.7,0]}, duration: 1})`,
        },
        {
          name: "Decius",
          onAttackIn: `ship.addEffect({name:"Decius", stats: {Weapon1MinDamage:[0,0.1,0], Weapon1MaxDamage:[0,0.1,0], Weapon2MinDamage:[0,0.1,0], Weapon2MaxDamage:[0,0.1,0]}, onConflict:"Stack"})`,
        },
      ],
      weapons: [
        {
          name: "Big gun",
          damageType: "Kinetic",
          load: 1,
          reload: 4,
        },
        {
          name: "Small gun",
          damageType: "Energy",
          load: 1,
          reload: 1,
        },
      ],
    },
    {
      name: "Federation Trader",
      side: "Defender",
      faction: "Federation",
      shipClass: "Survey",
      effects: [
        {
          name: "base",
          stats: {
            HHP: [2500000, 0, 0],
            SHP: [500000, 0, 0],
            Armor: [30000, 0, 0],
            Shield: [30000, 0, 0],
            Dodge: [30000, 0, 0],
            ArmorPiercing: [20000, 0, 0],
            ShieldPiercing: [20000, 0, 0],
            Accuracy: [20000, 0, 0],
            ShieldAbsorption: [0.8, 0, 0],
            Weapon1MinDamage: [30000, 0, 0],
            Weapon1MaxDamage: [40000, 0, 0],
            Weapon1CritChance: [0.1, 0, 0],
            Weapon1CritDamage: [1.5, 0, 0],
            Weapon1Shots: [1, 0, 0],
          },
        },
      ],
      abilities: [],
      weapons: [
        {
          name: "Trader gun",
          damageType: "Energy",
          load: 1,
          reload: 1,
        },
      ],
    },
  ],
};

export function Simulator() {
  const [formState, { number, text }] = useFormState({
    iterations: 100,
    combatData: JSON.stringify(defaultCombatData, undefined, "  "),
  });
  const [result, setResult] = React.useState<CombatSimulatorResult | undefined>(undefined);

  function onSubmit() {
    const combatData = JSON.parse(formState.values.combatData);
    const iterations = formState.values.iterations;
    const simulationResult = CombatSimulator.run(combatData, iterations);
    setResult(simulationResult);
  }

  return (
    <Frame title="Combat Simulator">
      <h2>Combat simulator</h2>
      <p>Simulates combat</p>
      <form noValidate autoComplete="off">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <h4>Input</h4>
            <FormField
              required
              fullWidth
              multiline
              variant="outlined"
              label="Combat data"
              rows={24}
              {...text("combatData")}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <h4>Simulation</h4>
            <FormField
              required
              fullWidth
              variant="outlined"
              label="Iterations"
              {...number("iterations")}
            />
            <StyledButton variant="contained" color="primary" onClick={() => onSubmit()}>
              Simulate
            </StyledButton>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <h4>Result</h4>
            {result ? (
              <>
                <p>
                  {result.iterations} combats simulated in {result.simulationDuration.toFixed(1)}ms.
                </p>
                <SimpleTable
                  columns={[
                    { label: "Statistic", align: "left" },
                    { label: "Value", align: "left" },
                  ]}
                  data={[
                    {
                      cells: ["Average rounds", result.averageOutcome.rounds.toFixed(2)],
                    },
                    {
                      cells: [
                        "Attacker survives",
                        (result.averageOutcome.attackerWin * 100).toFixed(2) + "%",
                      ],
                    },
                    {
                      cells: [
                        "Attacker average ships lost",
                        result.averageOutcome.attackerLosses.toFixed(2),
                      ],
                    },
                    {
                      cells: [
                        "Attacker average shield damage taken",
                        result.averageOutcome.attackerShieldDamage.toFixed(2),
                      ],
                    },
                    {
                      cells: [
                        "Attacker average hull damage taken",
                        result.averageOutcome.attackerHullDamage.toFixed(2),
                      ],
                    },
                    {
                      cells: [
                        "Defender survives",
                        (result.averageOutcome.defenderWin * 100).toFixed(2) + "%",
                      ],
                    },
                    {
                      cells: [
                        "Defender average ships lost",
                        result.averageOutcome.defenderLosses.toFixed(2),
                      ],
                    },
                    {
                      cells: [
                        "Defender average shield damage taken",
                        result.averageOutcome.defenderShieldDamage.toFixed(2),
                      ],
                    },
                    {
                      cells: [
                        "Defender average hull damage taken",
                        result.averageOutcome.defenderHullDamage.toFixed(2),
                      ],
                    },
                  ]}
                />
                <br />
                <FormField
                  fullWidth
                  multiline
                  variant="outlined"
                  label="Example log"
                  InputProps={{ readOnly: true }}
                  value={result ? result.exampleLog : ""}
                />
              </>
            ) : (
              <p>Press Simulate to run the simulation.</p>
            )}
          </Grid>
        </Grid>
      </form>
    </Frame>
  );
}
