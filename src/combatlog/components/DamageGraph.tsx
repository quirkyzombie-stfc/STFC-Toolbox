import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { CombatLogParsedData, GameData, RawCombatLog } from "../util/combatLog";
import { getStats } from "../util/combatLogStats";
import { roundTo2Digits, infinityToEmpty, shortNumber } from "../util/format";
import * as d3 from "d3";

export interface DamageGraphProps {
  parsedData: CombatLogParsedData;
  input: RawCombatLog;
  data: GameData;
  csv: boolean;
}

const percent = (x: number) => `${roundTo2Digits(100 * x)}%`;

export const DamageGraph = ({ parsedData, input, data, csv }: DamageGraphProps) => {
  const ships = parsedData.allShips;

  const [currentShip, setCurrentShip] = useState(ships[0]);

  const svgRef = useRef(null);

  //draws chart
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const attacks = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => true,
      (x) => 1,
    ).sum;
    const hits = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => !x.crit,
      (x) => 1,
    ).sum;
    const crits = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => x.crit,
      (x) => 1,
    ).sum;
    const hitBaseDmg = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => !x.crit,
      (x) => (x.base_min + x.base_max) / 2,
    ).sum;
    const critBaseDmg = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => x.crit,
      (x) => (x.base_min + x.base_max) / 2,
    ).sum;
    const hitStdDmg = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => !x.crit,
      (x) => x.std_damage,
    ).sum;
    const critStdDmg = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => x.crit,
      (x) => x.std_damage,
    ).sum;
    const stdDamage = hitStdDmg + critStdDmg;
    const stdMitigated = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => true,
      (x) => x.std_mitigated,
    ).sum;
    const isoDamage = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => true,
      (x) => x.iso_damage,
    ).sum;
    const totalDamage = stdDamage + isoDamage;
    const isoMitigated = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => true,
      (x) => x.iso_mitigated,
    ).sum;
    const nonMitigated = stdDamage - stdMitigated + isoDamage - isoMitigated;
    const hhpDamage = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => true,
      (x) => x.hhp,
    ).sum;
    const shpDamage = getStats(
      parsedData.stats.ships[currentShip.shipId].damageOut,
      (x) => true,
      (x) => x.shp,
    ).sum;

    const x0 = 100;
    const y0 = 100;
    const m = 20;
    const minNodeHeight = 40;
    const s = 800 / Math.max(stdDamage + isoDamage, 1e-6);

    interface NodeCoords {
      x0: number;
      x1: number;
      y0: number;
      y1: number;
    }
    interface LinkCoords {
      leftX: number;
      leftY0: number;
      leftY1: number;
      rightX: number;
      rightY0: number;
      rightY1: number;
    }
    function nodeAt(x: number, y0: number, h: number): NodeCoords {
      return {
        x0: x,
        x1: x + 100,
        y0: y0,
        y1: y0 + Math.max(h, minNodeHeight),
      };
    }
    function linkBetween(
      left: NodeCoords,
      leftY0: number,
      leftY1: number,
      right: NodeCoords,
      rightY0: number,
      rightY1: number,
    ): LinkCoords {
      const leftH = left.y1 - left.y0;
      const rightH = right.y1 - right.y0;
      return {
        leftX: left.x1,
        leftY0: left.y0 + leftY0 * leftH,
        leftY1: left.y0 + leftY1 * leftH,
        rightX: right.x0,
        rightY0: right.y0 + rightY0 * rightH,
        rightY1: right.y0 + rightY1 * rightH,
      };
    }
    function drawNode(c: NodeCoords, label1: string, label2: string) {
      const xM = (c.x0 + c.x1) / 2;
      const yM = (c.y0 + c.y1) / 2;

      const context = d3.path();
      context.moveTo(c.x0, c.y0);
      context.lineTo(c.x1, c.y0);
      context.lineTo(c.x1, c.y1);
      context.lineTo(c.x0, c.y1);
      context.closePath();

      svg
        .append("path")
        .attr("fill", "#9ecae1")
        .style("stroke", "black")
        .attr("d", context as any);
      svg
        .append("text")
        .text(label1)
        .attr("text-anchor", "middle")
        .attr("x", xM)
        .attr("y", yM)
        .attr("dy", -10);
      svg
        .append("text")
        .text(label2)
        .attr("text-anchor", "middle")
        .attr("x", xM)
        .attr("y", yM)
        .attr("dy", 10);
    }
    function drawLink(c: LinkCoords, label: string) {
      const context = d3.path();
      const xM = (c.leftX + c.rightX) / 2;
      const yM = (c.leftY0 + c.leftY1 + c.rightY0 + c.rightY1) / 4;
      context.moveTo(c.leftX, c.leftY0);
      context.bezierCurveTo(xM, c.leftY0, xM, c.rightY0, c.rightX, c.rightY0);
      context.lineTo(c.rightX, c.rightY1);
      context.bezierCurveTo(xM, c.rightY1, xM, c.leftY1, c.leftX, c.leftY1);
      context.closePath();

      svg
        .append("path")
        .attr("fill", "#deebf7")
        .style("stroke", "black")
        .attr("d", context as any);
      svg.append("text").text(label).attr("text-anchor", "middle").attr("x", xM).attr("y", yM);
    }

    const width = 1500;
    const height = 1200;
    const format = d3.format(",.0f");

    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const nodeHitDmg = nodeAt(400, y0, hitStdDmg * s);
    const nodeCritDmg = nodeAt(400, nodeHitDmg.y1 + m, critStdDmg * s);
    const nodeHitBase = nodeAt(200, (nodeHitDmg.y0 + nodeHitDmg.y1) / 2 - 100, 200);
    const nodeCritBase = nodeAt(200, (nodeCritDmg.y0 + nodeCritDmg.y1) / 2 - 100, 200);
    const nodeAttacks = nodeAt(0, (nodeHitBase.y1 + nodeCritBase.y0) / 2 - 100, 200);
    const nodeStdDmg = nodeAt(600, y0, stdDamage * s);
    const nodeIsoDmg = nodeAt(600, nodeStdDmg.y1 + 4 * m, isoDamage * s);
    const nodeStdMit = nodeAt(1200, y0, stdMitigated * s);
    const nodeStdNonMit = nodeAt(800, nodeStdMit.y1 + m, (stdDamage - stdMitigated) * s);
    const nodeIsoNonMit = nodeAt(800, nodeStdNonMit.y1 + 2 * m, (isoDamage - isoMitigated) * s);
    const nodeIsoMit = nodeAt(1200, nodeIsoNonMit.y1 + m, isoMitigated * s);
    const nodeNonMit = nodeAt(1000, nodeStdNonMit.y0 + m / 2, nonMitigated * s);
    const nodeShp = nodeAt(1200, nodeStdNonMit.y0, shpDamage * s);
    const nodeHhp = nodeAt(1200, nodeShp.y1 + m, hhpDamage * s);

    drawNode(nodeAttacks, `${attacks}`, `shots`);

    drawLink(
      linkBetween(nodeAttacks, 0, hits / attacks, nodeHitBase, 0, 1),
      percent(hits / attacks),
    );
    drawLink(
      linkBetween(nodeAttacks, hits / attacks, 1, nodeCritBase, 0, 1),
      percent(crits / attacks),
    );

    drawNode(nodeHitBase, `${shortNumber(hitBaseDmg)}`, `hit base dmg`);
    drawNode(nodeCritBase, `${shortNumber(critBaseDmg)}`, `crit base dmg`);

    drawLink(
      linkBetween(nodeHitBase, 0, 1, nodeHitDmg, 0, 1),
      `x${(hitStdDmg / hitBaseDmg).toFixed(3)}`,
    );
    drawLink(
      linkBetween(nodeCritBase, 0, 1, nodeCritDmg, 0, 1),
      `x${(critStdDmg / critBaseDmg).toFixed(3)}`,
    );

    drawNode(nodeHitDmg, `${shortNumber(hitStdDmg)}`, `hit std dmg`);
    drawNode(nodeCritDmg, `${shortNumber(critStdDmg)}`, `crit std dmg`);

    drawLink(linkBetween(nodeHitDmg, 0, 1, nodeStdDmg, 0, hitStdDmg / stdDamage), "");
    drawLink(linkBetween(nodeCritDmg, 0, 1, nodeStdDmg, hitStdDmg / stdDamage, 1), "");

    drawNode(nodeStdDmg, `${shortNumber(stdDamage)}`, `std dmg`);
    //drawLink(undefined, `x${(isoDamage/stdDamage).toFixed(3)}`);
    drawNode(nodeIsoDmg, `${shortNumber(isoDamage)}`, `iso dmg`);

    drawLink(
      linkBetween(nodeStdDmg, 0, stdMitigated / stdDamage, nodeStdMit, 0, 1),
      percent(stdMitigated / stdDamage),
    );
    drawLink(
      linkBetween(nodeStdDmg, stdMitigated / stdDamage, 1, nodeStdNonMit, 0, 1),
      percent(1 - stdMitigated / stdDamage),
    );
    if (isoDamage > 0)
      drawLink(
        linkBetween(nodeIsoDmg, 0, 1 - isoMitigated / isoDamage, nodeIsoNonMit, 0, 1),
        percent(1 - isoMitigated / isoDamage),
      );
    if (isoDamage > 0)
      drawLink(
        linkBetween(nodeIsoDmg, 1 - isoMitigated / isoDamage, 1, nodeIsoMit, 0, 1),
        percent(isoMitigated / isoDamage),
      );

    drawNode(nodeStdMit, `${shortNumber(stdMitigated)}`, `std mitigated`);
    drawNode(nodeStdNonMit, `${shortNumber(stdDamage - stdMitigated)}`, `non mitigated`);
    if (isoDamage > 0)
      drawNode(nodeIsoNonMit, `${shortNumber(isoDamage - isoMitigated)}`, `non mitigated`);
    if (isoDamage > 0) drawNode(nodeIsoMit, `${shortNumber(isoMitigated)}`, `iso mitigated`);

    const nonMitigatedLM =
      (stdDamage - stdMitigated) / (stdDamage - stdMitigated + isoDamage - isoMitigated);
    drawLink(linkBetween(nodeStdNonMit, 0, 1, nodeNonMit, 0, nonMitigatedLM), "");
    if (isoDamage > 0)
      drawLink(linkBetween(nodeIsoNonMit, 0, 1, nodeNonMit, nonMitigatedLM, 1), "");

    drawNode(nodeNonMit, `${shortNumber(nonMitigated)}`, `non mitigated`);

    const nonMitigatedRM = shpDamage / nonMitigated;
    drawLink(
      linkBetween(nodeNonMit, 0, nonMitigatedRM, nodeShp, 0, 1),
      percent(shpDamage / nonMitigated),
    );
    drawLink(
      linkBetween(nodeNonMit, nonMitigatedRM, 1, nodeHhp, 0, 1),
      percent(hhpDamage / nonMitigated),
    );

    drawNode(nodeShp, `${shortNumber(shpDamage)}`, `shp dmg`);
    drawNode(nodeHhp, `${shortNumber(hhpDamage)}`, `hhp dmg`);
  }, [currentShip]);

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="damage-graph-ship-label">Ship</InputLabel>
        <Select
          labelId="damage-graph-ship-label"
          id="damage-graph-ship-select"
          value={"" + currentShip.shipId}
          label={currentShip.displayName}
          onChange={(event: SelectChangeEvent) =>
            setCurrentShip(ships.find((s) => "" + s.shipId === event.target.value)!)
          }
        >
          {ships.map((ship) => (
            <MenuItem value={"" + ship.shipId} key={ship.shipId}>
              {ship.displayName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <svg ref={svgRef}></svg>
    </div>
  );
};
