import * as React from "react";
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
import { SimpleTable } from "../components/SimpleTable";
import { scrappingData } from "../util/scrapping";

type ModeType = "build_cost" | "scrap_yield";

const modes: {
  [key: string]: {
    type: ModeType;
    grade: string;
    rarity: string;
    material: string;
  };
} = {
  G3CC: {
    type: "build_cost",
    grade: "3★",
    rarity: "Common",
    material: "Refined Crystal",
  },
  G3CG: {
    type: "build_cost",
    grade: "3★",
    rarity: "Common",
    material: "Refined Gas",
  },
  G3CO: {
    type: "build_cost",
    grade: "3★",
    rarity: "Common",
    material: "Refined Ore",
  },

  G3UC: {
    type: "build_cost",
    grade: "3★",
    rarity: "Uncommon",
    material: "Refined Crystal",
  },
  G3UG: {
    type: "build_cost",
    grade: "3★",
    rarity: "Uncommon",
    material: "Refined Gas",
  },
  G3UO: {
    type: "build_cost",
    grade: "3★",
    rarity: "Uncommon",
    material: "Refined Ore",
  },

  G3RC: {
    type: "build_cost",
    grade: "3★",
    rarity: "Rare",
    material: "Refined Crystal",
  },
  G3RG: {
    type: "build_cost",
    grade: "3★",
    rarity: "Rare",
    material: "Refined Gas",
  },
  G3RO: {
    type: "build_cost",
    grade: "3★",
    rarity: "Rare",
    material: "Refined Ore",
  },

  G4CC: {
    type: "scrap_yield",
    grade: "4★",
    rarity: "Common",
    material: "Refined Crystal",
  },
  G4CG: {
    type: "scrap_yield",
    grade: "4★",
    rarity: "Common",
    material: "Refined Gas",
  },
  G4CO: {
    type: "scrap_yield",
    grade: "4★",
    rarity: "Common",
    material: "Refined Ore",
  },

  G4UC: {
    type: "scrap_yield",
    grade: "4★",
    rarity: "Uncommon",
    material: "Refined Crystal",
  },
  G4UG: {
    type: "scrap_yield",
    grade: "4★",
    rarity: "Uncommon",
    material: "Refined Gas",
  },
  G4UO: {
    type: "scrap_yield",
    grade: "4★",
    rarity: "Uncommon",
    material: "Refined Ore",
  },

  G4RC: {
    type: "scrap_yield",
    grade: "4★",
    rarity: "Rare",
    material: "Refined Crystal",
  },
  G4RG: {
    type: "scrap_yield",
    grade: "4★",
    rarity: "Rare",
    material: "Refined Gas",
  },
  G4RO: {
    type: "scrap_yield",
    grade: "4★",
    rarity: "Rare",
    material: "Refined Ore",
  },
};

const invertType = (type: ModeType) =>
  (type === "build_cost" ? "scrap_yield" : "build_cost") as ModeType;

const allBuildMats = Object.values(modes)
  .filter((x) => x.type === "build_cost")
  .map((x) => `${x.grade} ${x.rarity} ${x.material}`);

const allYieldMats = Object.values(modes)
  .filter((x) => x.type === "scrap_yield")
  .map((x) => `${x.grade} ${x.rarity} ${x.material}`);

export function Scrapping() {
  const [modeName, setModeName] = React.useState("G3CC");
  const mode = modes[modeName as keyof typeof modes];

  const inputName = `${mode.grade} ${mode.rarity} ${mode.material}`;
  const outputNames = Object.values(modes)
    .filter((x) => x.type !== mode.type)
    .map((x) => `${x.grade} ${x.rarity} ${x.material}`);

  return (
    <Frame title="Scrapping">
      <h2>Scrapping helper</h2>
      <p>Helps you determine what to scrap. What is your situation?</p>
      <form noValidate autoComplete="off">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              onChange={(event) => setModeName(event.target.value)}
              value={modeName}
              fullWidth
            >
              {Object.keys(modes).map((key) => {
                const mode = modes[key as keyof typeof modes];
                return (
                  <MenuItem key={key} value={key}>
                    I {mode.type === "build_cost" ? "have" : "need"} {mode.grade} {mode.rarity}{" "}
                    {mode.material}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <p>
              Each unit of {inputName} will {mode.type === "build_cost" ? "yield" : "cost"} the
              following materials:
            </p>
            <SimpleTable
              columns={[
                { label: "Ship", align: "right" },
                ...outputNames.map((cn) => ({
                  label: cn,
                  align: "right" as "right",
                })),
              ]}
              data={scrappingData.flatMap((data) => {
                const inputValue: number | undefined = (data[mode.type] as any)[inputName];

                if (inputValue === undefined || inputValue <= 0) {
                  return [];
                } else {
                  return [
                    {
                      cells: [
                        data.name,
                        ...outputNames.map((outputName) => {
                          const outputValue = (data[invertType(mode.type)] as any)[outputName];
                          if (outputValue === undefined || outputValue <= 0) {
                            return "";
                          } else {
                            return "" + (outputValue / inputValue).toFixed(3);
                          }
                        }),
                      ],
                    },
                  ];
                }
              })}
            />
          </Grid>
        </Grid>
      </form>
    </Frame>
  );
}
