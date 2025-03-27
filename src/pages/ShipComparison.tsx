import * as React from "react";
import { useState } from "react";
import { useQuery } from "react-query";
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
  GameData,
  lookupShipName,
  lookupSystemName,
  lookupTranslation,
} from "../combatlog/util/gameData";
import { Frame } from "../components/Frame";
import AutoSizer from "react-virtualized-auto-sizer";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import {
  ShipComponentArmor,
  ShipComponentCargo,
  ShipComponentImpulse,
  ShipComponentShield,
  ShipComponentWarp,
  ShipComponentWeapon,
  ShipDetail,
  ShipDetailComponentData,
} from "../util/gameData";

const styles = (theme: any) => ({
  multilineColor: {
    color: "red",
  },
});

type RechartsSample = { vA?: number; vB?: number; vC?: number; t: number };

interface ChartProps {
  title: string;
  description: string;
  shipA: ShipDetail | undefined;
  shipB: ShipDetail | undefined;
  shipC: ShipDetail | undefined;
  shipNameA : string | undefined;
  shipNameB : string | undefined;
  shipNameC : string | undefined;
  getValue: (ship: ShipDetail, tier: number) => number;
}

const Chart = ({ title, description, shipA, shipB, shipC, shipNameA, shipNameB, shipNameC, getValue }: ChartProps) => {
  const tiers = [
    ...(shipA ? shipA.tiers.keys() : []),
    ...(shipB ? shipB.tiers.keys() : []),
    ...(shipC ? shipC.tiers.keys() : []),
  ]
    .filter((value, index, array) => array.indexOf(value) === index)
    .map((x) => +x)
    .toSorted((a, b) => a - b);
  const data: RechartsSample[] = tiers.map((t) => ({
    vA: shipA !== undefined && shipA.tiers.length > t ? Math.round(getValue(shipA, t)) : undefined,
    vB: shipB !== undefined && shipB.tiers.length > t ? Math.round(getValue(shipB, t)) : undefined,
    vC: shipC !== undefined && shipC.tiers.length > t ? Math.round(getValue(shipC, t)) : undefined,
    t: t + 1,
  }));
  return (
    <Grid2 size={{ xs: 12, lg: 6, xl: 4 }}>
      <h2>{title}</h2>
      <p>{description}</p>
      <AutoSizer disableHeight>
        {({ width }) => (
          <ComposedChart
            width={width}
            height={400}
            data={data}
            margin={{
              top: 20,
              right: 80,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <Tooltip
            formatter={(value, name, props) => [value.toLocaleString(), name]}
            />
            <Legend />

            <XAxis
              dataKey="t"
              type="number"
              domain={["dataMin", "dataMax"]}
              label={{
                value: "Tier",
                position: "insideBottom",
                offset: 0,
              }}
            />
            <YAxis label={{ value: title, angle: -90, position: "insideLeft" }} />
            <Line
              dataKey="vA"
              stroke="red"
              type="monotone"
              dot={true}
              activeDot={false}
              legendType="none"
              name={shipNameA || "A"}
            />
            <Line
              dataKey="vB"
              stroke="green"
              type="monotone"
              dot={true}
              activeDot={false}
              legendType="none"
              name={shipNameB || "B"}
            />
            <Line
              dataKey="vC"
              stroke="blue"
              type="monotone"
              dot={true}
              activeDot={false}
              legendType="none"
              name={shipNameC || "C"}
            />
          </ComposedChart>
        )}
      </AutoSizer>
    </Grid2>
  );
};

export function ShipComparison() {
  const gameData = useQuery("game-data", async () => {
    const response = await fetch("/data/game-data/all.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const body = (await response.json()) as GameData;
    return body;
  });
  const [shipIdA, setShipIdA] = useState<number | undefined>(3426564736);
  const [shipIdB, setShipIdB] = useState<number | undefined>(701705952);
  const [shipIdC, setShipIdC] = useState<number | undefined>(2195955652);
  const data = gameData.data;

  if (data !== undefined) {
    const shipA = shipIdA === undefined ? undefined : data.ship[shipIdA];
    const shipB = shipIdB === undefined ? undefined : data.ship[shipIdB];
    const shipC = shipIdC === undefined ? undefined : data.ship[shipIdC];

    const shipNameA =
      shipA === undefined
        ? undefined
        : lookupTranslation(data.translations.ships, shipA.loca_id, "ship_name");
    const shipNameB =
      shipB === undefined
        ? undefined
        : lookupTranslation(data.translations.ships, shipB.loca_id, "ship_name");
    const shipNameC =
      shipC === undefined
        ? undefined
        : lookupTranslation(data.translations.ships, shipC.loca_id, "ship_name");
    const rarityToNumber = (r: any) => {
      switch (r) {
        case "Common":
          return 0;
        case "Uncommon":
          return 1;
        case "Rare":
          return 2;
        case "Epic":
          return 3;
        default:
          return 0;
      }
    };
    const sortedShipIds = Object.keys(data.ship).sort((idL, idR) => {
      const l = data.ship[+idL].grade * 10 + rarityToNumber(data.ship[+idL].rarity);
      const r = data.ship[+idR].grade * 10 + rarityToNumber(data.ship[+idR].rarity);
      return l - r;
    });
    return (
      <Frame title="About">
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 4 }}>
            <TextField
              id="select"
              label="Ship A"
              placeholder="Select a ship"
              fullWidth
              value={shipIdA}
              select
              onChange={(event) => setShipIdA(+event.target.value)}
              sx={{
                fieldset: { borderColor: "red" },
              }}
            >
              {sortedShipIds.map((id) => (
                <MenuItem value={id} key={id}>
                  {`G${data.ship[+id].grade} ${lookupTranslation(data.translations.ships, data.ship[+id].loca_id, "ship_name")}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 4 }}>
            <TextField
              id="select"
              label="Ship B"
              placeholder="Select a ship"
              fullWidth
              value={shipIdB}
              select
              onChange={(event) => setShipIdB(+event.target.value)}
              sx={{
                fieldset: { borderColor: "green" },
              }}
            >
              {sortedShipIds.map((id) => (
                <MenuItem value={id} key={id}>
                  {`G${data.ship[+id].grade} ${lookupTranslation(data.translations.ships, data.ship[+id].loca_id, "ship_name")}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 4 }}>
            <TextField
              id="select"
              label="Ship C"
              placeholder="Select a ship"
              fullWidth
              value={shipIdC}
              select
              onChange={(event) => setShipIdC(+event.target.value)}
              sx={{
                fieldset: { borderColor: "blue" },
              }}
            >
              {sortedShipIds.map((id) => (
                <MenuItem value={id} key={id}>
                  {`G${data.ship[+id].grade} ${lookupTranslation(data.translations.ships, data.ship[+id].loca_id, "ship_name")}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Chart
            title="HHP"
            description="Base hull hit points. Value is the sum of the bonus from the armor ship component, and the bonus from the ship level assuming the ship is maximally leveled for its tier. Not including any research."
            shipA={shipA}
            shipB={shipB}
            shipC={shipC}
            shipNameA={shipNameA}
            shipNameB={shipNameB}
            shipNameC={shipNameC}
            getValue={(s, t) =>
              getComponentValue<ShipComponentArmor>(s, t, "Armor", (cs) => cs[0].hp) +
              s.levels[t * 5].health
            }
          />
          <Chart
            title="SHP"
            description="Base hull hit points. Value is the sum of the bonus from the shield ship component, and the bonus from the ship level assuming the ship is maximally leveled for its tier. Not including any research."
            shipA={shipA}
            shipB={shipB}
            shipC={shipC}
            shipNameA={shipNameA}
            shipNameB={shipNameB}
            shipNameC={shipNameC}
            getValue={(s, t) =>
              getComponentValue<ShipComponentShield>(s, t, "Shield", (cs) => cs[0].hp) +
              s.levels[t * 5].shield
            }
          />
          <Chart
            title="Base DPR"
            description="Average base damage per round. Averaged over an infinitely long fight. Assuming no crits, no reload delays, no extra shots. Not including any research."
            shipA={shipA}
            shipB={shipB}
            shipC={shipC}
            shipNameA={shipNameA}
            shipNameB={shipNameB}
            shipNameC={shipNameC}
            getValue={(s, t) =>
              getComponentValue<ShipComponentWeapon>(s, t, "Weapon", (cs) =>
                cs
                  .map((w) => (((w.maximum_damage + w.minimum_damage) / 2) * w.shots) / w.cool_down)
                  .reduce((p, c) => p + c, 0),
              )
            }
          />
          <Chart
            title="Base alpha damage"
            description="Total base damage in round 1. Assuming no crits, no reload delays, no extra shots. Not including any research."
            shipA={shipA}
            shipB={shipB}
            shipC={shipC}
            shipNameA={shipNameA}
            shipNameB={shipNameB}
            shipNameC={shipNameC}
            getValue={(s, t) =>
              getComponentValue<ShipComponentWeapon>(s, t, "Weapon", (cs) =>
                cs
                  .filter((w) => w.warm_up === 1)
                  .map((w) => ((w.maximum_damage + w.minimum_damage) / 2) * w.shots)
                  .reduce((p, c) => p + c, 0),
              )
            }
          />
          <Chart
            title="Base alpha 2 damage"
            description="Total base damage in rounds 1 and 2. Assuming no crits, no reload delays, no extra shots. Not including any research."
            shipA={shipA}
            shipB={shipB}
            shipC={shipC}
            shipNameA={shipNameA}
            shipNameB={shipNameB}
            shipNameC={shipNameC}
            getValue={(s, t) =>
              getComponentValue<ShipComponentWeapon>(s, t, "Weapon", (cs) =>
                cs
                  .filter((w) => w.warm_up <= 2)
                  .map(
                    (w) =>
                      ((w.maximum_damage + w.minimum_damage) / 2) *
                      w.shots *
                      (w.cool_down === 1 ? 2 : 1),
                  )
                  .reduce((p, c) => p + c, 0),
              )
            }
          />
          <Chart
            title="Warp Range"
            description="Base warp range. Value taken from the warp drive ship component. Not including any research."
            shipA={shipA}
            shipB={shipB}
            shipC={shipC}
            shipNameA={shipNameA}
            shipNameB={shipNameB}
            shipNameC={shipNameC}
            getValue={(s, t) =>
              getComponentValue<ShipComponentWarp>(s, t, "Warp", (cs) => cs[0].distance)
            }
          />
          <Chart
            title="Cargo"
            description="Base cargo capacity. Value taken from the cargo drive ship component and the level-up bonus, assuming a maximally leveled up ship for each tier. Not including any research."
            shipA={shipA}
            shipB={shipB}
            shipC={shipC}
            shipNameA={shipNameA}
            shipNameB={shipNameB}
            shipNameC={shipNameC}
            getValue={(s, t) =>
              getComponentValue<ShipComponentCargo>(s, t, "Cargo", (cs) => cs[0].max_resources) +
              s.tiers[t].buffs.cargo
            }
          />
          <Chart
            title="Impulse Speed"
            description="Base impulse speed. Value taken from the impulse drive ship component. Not including any research."
            shipA={shipA}
            shipB={shipB}
            shipC={shipC}
            shipNameA={shipNameA}
            shipNameB={shipNameB}
            shipNameC={shipNameC}
            getValue={(s, t) =>
              getComponentValue<ShipComponentImpulse>(s, t, "Impulse", (cs) => cs[0].impulse)
            }
          />
        </Grid2>
      </Frame>
    );
  } else {
    return <p>Loading...</p>;
  }
}

function getComponentValue<C extends ShipDetailComponentData>(
  ship: ShipDetail,
  tier: number,
  tag: string,
  getValue: (components: C[]) => number,
): number {
  const components = ship.tiers[tier].components
    .filter((c) => c.data.tag === tag)
    .map((c) => c.data) as C[];
  return getValue(components);
}
