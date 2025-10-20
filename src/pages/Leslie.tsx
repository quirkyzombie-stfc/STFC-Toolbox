import * as React from "react";
import { useFormState } from "react-use-form-state";
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
import { SimpleTable } from "../components/SimpleTable";
import { Frame } from "../components/Frame";

const FormField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1),
}));

function numberWithSeparators(x: number) {
  return x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function Leslie() {
  const [formState, { number }] = useFormState({
    targetDPR: 2000000,
    armadaPlayers: 5,
    playerLeslie: 5,
    playerKirk: 70,
    playerSpock: 750,
  });

  const moraleChance = +formState.values.playerKirk / 100.0;
  const moraleUptime = 2 / (1 / moraleChance + 2 - 1);
  const defenseToSHP = +formState.values.playerSpock / 100.0;
  const targetDpr = +formState.values.targetDPR;
  const armadaPlayers = +formState.values.armadaPlayers;
  const leslieFactor = +formState.values.playerLeslie / 100.0;

  return (
    <Frame title="Leslie calculator">
      <h2>Leslie calculator</h2>
      <p>
        Calculates minimum hull hit points and defense stats required to survive forever with
        Leslie.
      </p>
      <form noValidate autoComplete="off">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <h4>Settings</h4>
            <FormField
              required
              fullWidth
              label="Target damage per round"
              {...number("targetDPR")}
            />
            <FormField required fullWidth label="Armada players" {...number("armadaPlayers")} />
            <FormField
              required
              fullWidth
              label="Leslie ability (% HHP regenerated per round)"
              {...number("playerLeslie")}
            />
            <FormField
              required
              fullWidth
              label="Kirk ability (% chance to trigger Morale)"
              {...number("playerKirk")}
            />
            <FormField
              required
              fullWidth
              label="Spock ability (% of defense to SHP)"
              {...number("playerSpock")}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <h4>Result</h4>
            <p>The higher your mitigation, the less hit points and defense stats you need.</p>
            <SimpleTable
              columns={[
                { label: "Mitigation", align: "right" },
                { label: "Hull hit points", align: "right" },
                { label: "Defense stats", align: "right" },
              ]}
              data={[0.1616, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.712].map(
                (mitigation) => {
                  const incomingDpr = (targetDpr / armadaPlayers) * (1 - mitigation);
                  if (moraleUptime > 0 && defenseToSHP > 0) {
                    const requiredDefense = (incomingDpr * 0.8) / (defenseToSHP * moraleUptime);
                    const requiredHhp = (incomingDpr * 0.2) / leslieFactor;
                    return {
                      cells: [
                        mitigation.toFixed(2) + "%",
                        numberWithSeparators(requiredHhp),
                        numberWithSeparators(requiredDefense),
                      ],
                    };
                  } else {
                    const requiredHhp = incomingDpr / leslieFactor;
                    return {
                      cells: [
                        mitigation.toFixed(2) + "%",
                        numberWithSeparators(requiredHhp),
                        "N/A",
                      ],
                    };
                  }
                },
              )}
            />
          </Grid>
        </Grid>
      </form>
    </Frame>
  );
}
