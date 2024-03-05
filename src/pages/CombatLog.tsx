import * as React from "react";
import { useState, memo, useEffect } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { Frame } from "../components/Frame";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AttackIcon, OfficerIcon, ChargeIcon } from "../components/GameIcon";
import {
  CombatLog,
  CombatLogRound,
  CombatLogRoundEvent,
  CombatLogShip,
  CombatLogOfficer,
} from "../util/combatLog";
import { CombatLogStats, gatherStats } from "../util/combatLogStats";
import { SimpleTable } from "../components/SimpleTable";
import { CollapsibleTable } from "../components/CollapsibleTable";

import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const AttackInlineDataHead = styled("div")(({ theme }) => ({
  display: "inline-block",
  minWidth: "180px",
  textAlign: "left",
}));

const AttackInlineData = styled("div")(({ theme }) => ({
  display: "inline-block",
  minWidth: "180px",
  textAlign: "right",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flex: "1 0 auto",
  paddingBottom: 0,
}));

const combatLogUrl = (id: string) => `combatlogs/${id}.json`;

function abbreviateNumber(x: number | undefined): string {
  if (x === undefined) {
    return "";
  }
  const tier = (Math.log10(x) / 3) | 0;
  if (tier == 0) return "" + x;
  const suffix = ["", "k", "M", "B", "T", "Qa", "Qi"][tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = x / scale;
  return scaled.toFixed(2) + suffix;
}

function isUsefulNumber(x: number | undefined | null): x is number {
  return x !== undefined && x !== null && !isNaN(x) && x !== Infinity && x !== -Infinity;
}

const formatNumber = (x: number) =>
  isUsefulNumber(x) ? (Math.round((x + Number.EPSILON) * 100) / 100).toLocaleString() : "";
const formatInt = (x: number | undefined) =>
  isUsefulNumber(x) ? Math.round(x).toLocaleString() : "";
const formatPercent = (x: number) => (isUsefulNumber(x) ? (x * 100).toFixed(2) + "%" : "");

interface ExpandingListRowProps {
  icon?: JSX.Element;
  text: string | JSX.Element;
  details: string | JSX.Element;
  className?: string;
  side: "initiator" | "target";
}

function ExpandingListRow(props: ExpandingListRowProps): JSX.Element {
  const { icon, text, details } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <ListItem
        button
        onClick={() => {
          setOpen(!open);
        }}
      >
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={text} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {details}
      </Collapse>
    </React.Fragment>
  );
}
const StyledExpandingListRow = styled(ExpandingListRow, {
  shouldForwardProp: (prop) => prop !== "side",
})<ExpandingListRowProps>(({ side, theme }) => ({
  ...(side === "initiator" ? { backgroundColor: "#e0f2f1" } : { backgroundColor: "#fce4ec" }),
}));
const ExpandingListRowM = memo(StyledExpandingListRow);

interface CombatRoundEventProps {
  event: CombatLogRoundEvent;
  ships: CombatLogShip[];
}

function CombatRoundEvent(props: CombatRoundEventProps): JSX.Element {
  const { event, ships } = props;

  switch (event.type) {
    case "attack":
      const sideA =
        ships.find((s) => s.ship_id === event.ship)?.side === "initiator" ? "initiator" : "target";
      const damage_total =
        event.damage_taken_hull + event.damage_taken_shield + event.damage_mitigated;
      const mitigation = event.damage_mitigated / damage_total;
      return (
        <ExpandingListRowM
          side={sideA}
          icon={<AttackIcon />}
          text={
            <React.Fragment>
              <AttackInlineDataHead>
                {event.ship} hits {event.target}
                {event.crit ? " (critical)" : ""}
              </AttackInlineDataHead>
              <AttackInlineData>{formatInt(damage_total)} dmg</AttackInlineData>
              <AttackInlineData>{formatInt(event.damage_mitigated)} mitigated</AttackInlineData>
              <AttackInlineData>{formatInt(event.damage_taken_shield)} shield dmg</AttackInlineData>
              <AttackInlineData>{formatInt(event.damage_taken_hull)} hull dmg</AttackInlineData>
            </React.Fragment>
          }
          details={
            <p>
              &emsp;Weapon: {event.weapon}
              <br />
              &emsp;Mitigation: {formatPercent(mitigation)}
              <br />
              &emsp;Remaining shield: {formatInt(event.remaining_shield)}
              <br />
              &emsp;Remaining hull: {formatInt(event.remaining_hull)}
            </p>
          }
        />
      );
    case "charge":
      const sideC =
        ships.find((s) => s.ship_id === event.ship)?.side === "initiator" ? "initiator" : "target";
      return (
        <ExpandingListRowM
          side={sideC}
          icon={<ChargeIcon />}
          text={
            <React.Fragment>
              {event.ship} charges a weapon to {formatPercent(event.charge)}.
            </React.Fragment>
          }
          details={<p>&emsp;Weapon: ${event.weapon}</p>}
        />
      );
    case "ability":
      const sideB =
        ships.find((s) => s.ship_id === event.ship)?.side === "initiator" ? "initiator" : "target";
      return (
        <ExpandingListRowM
          side={sideB}
          icon={<OfficerIcon />}
          text={
            <React.Fragment>
              {event.ship} activates {event.officer}.
            </React.Fragment>
          }
          details={
            <p>
              &emsp;Officer: {event.officer}
              <br />
              &emsp;Ability: {event.ability}
              <br />
              &emsp;Value: {formatNumber(event.value)}
            </p>
          }
        />
      );
    default:
      return (
        <ExpandingListRowM
          side="target"
          icon={<OfficerIcon />}
          text={<React.Fragment>Unknown event.</React.Fragment>}
          details={
            <p>
              &emsp;Type: {(event as any).type}
              <br />
            </p>
          }
        />
      );
  }
}
const CombatRoundEventM = memo(CombatRoundEvent);

interface CombatLogRoundCardProps {
  round: CombatLogRound;
  ships: CombatLogShip[];
}

function CombatLogRoundCard(props: CombatLogRoundCardProps): JSX.Element {
  const { round, ships } = props;

  return (
    <StyledCard>
      <StyledCardContent>
        <Typography gutterBottom variant="h5" component="h2">
          Round {round.round}
        </Typography>
        <List>
          {round.events.map((event, i) => {
            return <CombatRoundEventM event={event} ships={ships} key={i} />;
          })}
        </List>
      </StyledCardContent>
    </StyledCard>
  );
}
const CombatLogRoundCardM = memo(CombatLogRoundCard);

interface CombatLogFleetCardProps {
  ships: CombatLogShip[];
}
function CombatLogFleetCard(props: CombatLogFleetCardProps): JSX.Element {
  const { ships } = props;

  return (
    <StyledCard>
      <StyledCardContent>
        <Typography gutterBottom variant="h5" component="h2">
          Participants
        </Typography>
        <CollapsibleTable
          columns={[
            { label: "Side", align: "left" },
            { label: "Name", align: "left" },
            { label: "Ship", align: "left" },
            { label: "Tier", align: "left" },
            { label: "Level", align: "left" },
            { label: "Officers", align: "left" },
            { label: "Power", align: "left" },
          ]}
          data={ships.map((ship) => ({
            cells: [
              ship.side,
              ship.ship_id,
              ship.hull_name,
              "" + ship.tier,
              "" + ship.level,
              ship.officers
                .slice(0, 3)
                .filter((o): o is CombatLogOfficer => o !== null)
                .map((o) => o.name)
                .join(" + "),
              formatInt(ship.rating.offense + ship.rating.defense + ship.rating.health),
            ],
            details: (
              <React.Fragment>
                Officers - bridge:{" "}
                {ship.officers
                  .slice(0, 3)
                  .filter((o): o is CombatLogOfficer => o !== null)
                  .map((o) => `${o.name} (${o.level})`)
                  .join(", ")}
                <br />
                Officers - below deck:{" "}
                {ship.officers
                  .slice(3)
                  .filter((o): o is CombatLogOfficer => o !== null)
                  .map((o) => `${o.name} (${o.level})`)
                  .join(", ")}
                <br />
                Officer bonus - attack: {formatPercent(ship.officer_bonus.attack)}
                <br />
                Officer bonus - defense: {formatPercent(ship.officer_bonus.defense)}
                <br />
                Officer bonus - health: {formatPercent(ship.officer_bonus.health)}
                <br />
                {/*Piercing - armor: {ship.stats.armor_piercing}<br/>
                            Piercing - shield: {ship.stats.shield_piercing}<br/>
                            Piercing - accuracy: {ship.stats.accuracy}<br/>
                            Defense - armor: {ship.stats.armor}<br/>
                            Defense - shield deflection: {ship.stats.shield_deflection}<br/>
                            Defense - dodge: {ship.stats.dodge}<br/>*/}
              </React.Fragment>
            ),
          }))}
        />
      </StyledCardContent>
    </StyledCard>
  );
}
const CombatLogFleetCardM = memo(CombatLogFleetCard);

interface CombatLogSummaryCardProps {
  combatLog: CombatLog;
  stats: CombatLogStats;
}
function CombatLogSummaryCard(props: CombatLogSummaryCardProps): JSX.Element {
  const { combatLog, stats } = props;

  let winnerHullDamage = 0;
  combatLog.ships.forEach((ship) => {
    const damage = stats.ships[ship.ship_id]?.hullDamageIn?.sum || 0;
    if (ship.side === "initiator" && combatLog.initiator_wins) {
      winnerHullDamage += damage;
    } else if (ship.side === "target" && !combatLog.initiator_wins) {
      winnerHullDamage += damage;
    }
  });
  return (
    <StyledCard>
      <StyledCardContent>
        <Typography gutterBottom variant="h5" component="h2">
          Summary
        </Typography>
        <p>
          {combatLog.initiator_wins ? "Initiator " : "Target "}
          wins in {combatLog.log.length} rounds.
        </p>
        <p>Winner takes {formatInt(winnerHullDamage)} hull damage.</p>
      </StyledCardContent>
    </StyledCard>
  );
}
const CombatLogSummaryCardM = memo(CombatLogSummaryCard);

interface CombatLogStatsDetailsProps {
  combatLog: CombatLog;
  stats: CombatLogStats;
}
function CombatLogDefensiveStats(props: CombatLogStatsDetailsProps): JSX.Element {
  const { combatLog, stats } = props;
  return (
    <SimpleTable
      columns={[
        { label: "Name", align: "left" },
        { label: "Attacks", align: "right" },
        { label: "Total damage", align: "right" },
        { label: "Min mitigation", align: "right" },
        { label: "Max mitigation", align: "right" },
        { label: "Shield dmg", align: "right" },
        { label: "Hull dmg", align: "right" },
        { label: "Shield depleted", align: "right" },
        { label: "Destroyed", align: "right" },
      ]}
      data={combatLog.ships.map((ship) => {
        const shipStats = stats.ships[ship.ship_id];
        return {
          cells: [
            ship.ship_id,
            formatInt(shipStats.totalRawDamageIn.count),
            abbreviateNumber(shipStats.totalRawDamageIn.sum),
            formatPercent(shipStats.mitigationIn.min),
            formatPercent(shipStats.mitigationIn.max),
            abbreviateNumber(shipStats.shieldDamageIn.sum),
            abbreviateNumber(shipStats.hullDamageIn.sum),
            formatInt(shipStats.roundShieldDepleted),
            formatInt(shipStats.roundDestroyed),
          ],
        };
      })}
    />
  );
}

function CombatLogOffensiveStats(props: CombatLogStatsDetailsProps): JSX.Element {
  const { combatLog, stats } = props;
  return (
    <SimpleTable
      columns={[
        { label: "Name", align: "left" },
        { label: "Attacks", align: "right" },
        { label: "Crits", align: "right" },
        { label: "Total damage", align: "right" },
        { label: "Min mitigation", align: "right" },
        { label: "Max mitigation", align: "right" },
        { label: "Shield dmg", align: "right" },
        { label: "Hull dmg", align: "right" },
      ]}
      data={combatLog.ships.map((ship) => {
        const shipStats = stats.ships[ship.ship_id];
        return {
          cells: [
            ship.ship_id,
            formatInt(shipStats.totalRawDamageOut.count),
            formatInt(shipStats.critRawDamageOut.count),
            abbreviateNumber(shipStats.totalRawDamageOut.sum),
            formatPercent(shipStats.mitigationOut.min),
            formatPercent(shipStats.mitigationOut.max),
            abbreviateNumber(shipStats.shieldDamageOut.sum),
            abbreviateNumber(shipStats.hullDamageOut.sum),
          ],
        };
      })}
    />
  );
}

function CombatLogWeaponStats(props: CombatLogStatsDetailsProps): JSX.Element {
  const { combatLog, stats } = props;
  return (
    <SimpleTable
      columns={[
        { label: "Ship", align: "left" },
        { label: "Weapon", align: "left" },
        { label: "Hits", align: "right" },
        { label: "Min hit", align: "right" },
        { label: "Max hit", align: "right" },
        { label: "Crits", align: "right" },
        { label: "Min crit", align: "right" },
        { label: "Max crit", align: "right" },
      ]}
      data={combatLog.ships
        .flatMap((ship) => {
          const shipStats = stats.ships[ship.ship_id];
          if (shipStats === undefined) {
            return [];
          }
          return Object.keys(shipStats.weapons).map((weaponId) => [
            ship.ship_id,
            weaponId,
            formatInt(shipStats.weapons[weaponId].hitRawDamageOut.count),
            formatInt(shipStats.weapons[weaponId].hitRawDamageOut.min),
            formatInt(shipStats.weapons[weaponId].hitRawDamageOut.max),
            formatInt(shipStats.weapons[weaponId].critRawDamageOut.count),
            formatInt(shipStats.weapons[weaponId].critRawDamageOut.min),
            formatInt(shipStats.weapons[weaponId].critRawDamageOut.max),
          ]);
        })
        .map((rowData) => ({ cells: rowData }))}
    />
  );
}

function CombatLoBurningStats(props: CombatLogStatsDetailsProps): JSX.Element {
  const { combatLog, stats } = props;
  return (
    <React.Fragment>
      <p>
        "Hit point changes" are changes to remaining hull or shield hit points that do not originate
        from weapon attacks.
        <br />
        Those changes can come from burning effects (e.g., Nero, Vemet), healing effects (e.g.,
        Spock), or dynamic changes to officer health stats (e.g., Kirk, Kumak).
      </p>
      <SimpleTable
        columns={[
          { label: "Name", align: "left" },
          { label: "Max HHP", align: "right" },
          { label: "HHP change", align: "right" },
          { label: "Max SHP", align: "right" },
          { label: "SHP change", align: "right" },
        ]}
        data={combatLog.ships.map((ship) => {
          const shipStats = stats.ships[ship.ship_id];
          return {
            cells: [
              ship.ship_id,
              formatInt(ship.hit_points.hhp_max),
              formatInt(shipStats.directDamageHull.sum),
              formatInt(ship.hit_points.shp_max),
              formatInt(shipStats.directDamageShield.sum),
            ],
          };
        })}
      />
    </React.Fragment>
  );
}

function allStats(obj: any) {
  const isObject = (val: any) => typeof val === "object";
  const isStat = (val: any) => typeof val === "object" && Array.isArray(val["data"]);

  const addDelimiter = (a: string, b: string) =>
    a ? (a[0] > "a" && a[0] <= "Z" ? `${a}.${b}` : `${a}["${b}"]`) : b;

  const paths = (obj: any, head: string = ""): string[] => {
    return Object.entries(obj).reduce<string[]>((product, [key, value]) => {
      const fullPath = addDelimiter(head, key);

      if (isStat(value)) {
        return product.concat(fullPath);
      } else if (isObject(value)) {
        return product.concat(paths(value, fullPath));
      } else {
        return product;
      }
    }, []);
  };

  return paths(obj);
}

function CombatLogCharts(props: CombatLogStatsDetailsProps): JSX.Element {
  const { stats } = props;
  const [ship, setShip] = useState<string>(props.combatLog.ships[0].ship_id);
  const [stat, setStat] = useState<string>("");

  const getData = (ship: string, stat: string) => {
    try {
      return eval(`stats.ships["${ship}"].${stat}.data`);
    } catch {
      return [];
    }
  };
  const data = getData(ship, stat);

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TextField
            id="select"
            label="Ship"
            fullWidth
            value={ship}
            select
            onChange={(event) => setShip(event.target.value)}
          >
            {Object.keys(props.stats.ships).map((shipId) => (
              <MenuItem value={shipId} key={shipId}>
                {shipId}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="select"
            label="Data"
            fullWidth
            value={stat}
            select
            onChange={(event) => setStat(event.target.value)}
          >
            {allStats(stats.ships[ship]).map((statName) => (
              <MenuItem value={statName} key={statName}>
                {statName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
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
                <Tooltip />
                <Legend />

                <XAxis
                  dataKey="t"
                  type="number"
                  label={{
                    value: "Round",
                    position: "insideBottom",
                    offset: 0,
                  }}
                />
                <YAxis
                  dataKey="value"
                  type="number"
                  label={{ value: "Value", angle: -90, position: "insideLeft" }}
                />
                <Line
                  dataKey="value"
                  stroke="blue"
                  type="monotone"
                  dot={true}
                  activeDot={false}
                  legendType="none"
                />
              </ComposedChart>
            )}
          </AutoSizer>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

interface CombatLogStatsCardProps {
  combatLog: CombatLog;
  stats: CombatLogStats;
}
function CombatLogStatsCard(props: CombatLogStatsCardProps): JSX.Element {
  const { combatLog, stats } = props;

  return (
    <StyledCard>
      <StyledCardContent>
        <Typography gutterBottom variant="h5" component="h2">
          Analysis
        </Typography>
        <ExpandingListRowM
          side="initiator"
          text="Incoming attacks"
          details={<CombatLogDefensiveStats combatLog={combatLog} stats={stats} />}
        />
        <ExpandingListRowM
          side="initiator"
          text="Outgoing attacks"
          details={<CombatLogOffensiveStats combatLog={combatLog} stats={stats} />}
        />
        <ExpandingListRowM
          side="initiator"
          text="Weapon damage"
          details={<CombatLogWeaponStats combatLog={combatLog} stats={stats} />}
        />
        <ExpandingListRowM
          side="initiator"
          text="Direct hit point change"
          details={<CombatLoBurningStats combatLog={combatLog} stats={stats} />}
        />
        <ExpandingListRowM side="initiator" text="Officers" details={"TODO"} />
        <ExpandingListRowM
          side="initiator"
          text="Plots"
          details={<CombatLogCharts combatLog={combatLog} stats={stats} />}
        />
      </StyledCardContent>
    </StyledCard>
  );
}
const CombatLogStatsCardM = memo(CombatLogStatsCard);

interface CombatLogImplProps {
  combatLog: CombatLog;
}
function CombatLogImpl(props: CombatLogImplProps) {
  const { combatLog } = props;
  const stats = gatherStats(combatLog);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <CombatLogFleetCardM ships={combatLog.ships} />
      </Grid>
      <Grid item xs={12}>
        <CombatLogSummaryCardM combatLog={combatLog} stats={stats} />
      </Grid>
      <Grid item xs={12}>
        <CombatLogStatsCardM combatLog={combatLog} stats={stats} />
      </Grid>
      {combatLog.log.map((round) => (
        <Grid item xs={12} key={round.round}>
          <CombatLogRoundCardM round={round} ships={combatLog.ships} />
        </Grid>
      ))}
    </Grid>
  );
}
const CombatLogImplM = memo(CombatLogImpl);

export function CombatLog() {
  const { id } = useParams();
  const [combatLog, setCombatLog] = useState<CombatLog | undefined>(undefined);

  async function fetchData() {
    const response = await fetch(`/data/combatlogs/${id}.json`);
    const json = await response.json();
    setCombatLog(json);
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <Frame title={`Combat log ${id}`}>
      {combatLog === undefined ? (
        <p>Loading...</p>
      ) : (
        <ErrorBoundary>
          <CombatLogImplM combatLog={combatLog} />
        </ErrorBoundary>
      )}
    </Frame>
  );
}
