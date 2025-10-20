import * as React from "react";
import { Frame } from "../components/Frame";
import { SimpleTable } from "../components/SimpleTable";
import { useQuery } from "@tanstack/react-query";
import { GameData, lookupShipName, lookupSystemName } from "../combatlog/util/gameData";

export function HostilesByHhp() {
  const gameData = useQuery({
    queryKey: ["game-data"],
    queryFn: async () => {
      const response = await fetch("/data/game-data/all.json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const body = (await response.json()) as GameData;
      return body;
    },
  });

  const data = gameData.data;
  var tableData: any = [];
  if (data !== undefined) {
    tableData = Object.keys(data.hostile)
      .map((k) => {
        const hostile = data.hostile[+k];
        const name = lookupShipName(undefined, hostile.loca_id, hostile.level, data) || "??? " + k;
        const hhp = hostile.stats?.hull_hp || 0;
        const systems = hostile.systems.map((s: number) => lookupSystemName(s, data)).join(", ");
        return { name, hhp, systems };
      })
      .sort((a, b) => a.hhp - b.hhp)
      .map((row) => ({
        cells: [row.name.replace(" ", "\u00A0"), row.hhp.toLocaleString("en"), row.systems],
      }));
  }

  return (
    <Frame title="Hostiles sorted by hull hit points">
      <SimpleTable
        columns={[
          { label: "Hostile", align: "right" },
          { label: "HHP", align: "right" },
          { label: "Systems", align: "left" },
        ]}
        data={tableData}
      />
    </Frame>
  );
}
