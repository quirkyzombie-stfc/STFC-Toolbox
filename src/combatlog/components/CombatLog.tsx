import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "react-query";
import {
  Alert,
  AlertTitle,
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { Frame } from "../../components/Frame";
import { DropZone } from "../../components/DropZone";

import {
  CombatLogParsedData,
  GameData,
  JournalsGetMessage,
  parseAllData,
  RawCombatLog,
} from "../util/combatLog";
import { Overview } from "./Overview";
import { BattleLog } from "./BattleLog";
import { BattleLogRaw } from "./BattleLogRaw";
import { Ships } from "./Ships";
import { Buffs } from "./Buffs";
import { Officers } from "./Officers";
import { Loot } from "./Loot";
import { DamageGraph } from "./DamageGraph";

import syncServerRustUrl from "../../../assets/sync-server.exe";
import syncServerNodeUrl from "../../../assets/index.mjs.txt";

const drawerWidth = 240;

type LogData =
  | { status: "empty" }
  | { status: "error"; details: string }
  | { status: "success"; data: JournalsGetMessage };

type View =
  | "overview"
  | "battlelog"
  | "battlelograw"
  | "ships"
  | "buffs"
  | "officers"
  | "loot"
  | "damage_graph"
  | "not_implemented";

interface ActiveViewProps {
  activeView: View;
  input: RawCombatLog;
  data: GameData;
  parsedData: CombatLogParsedData;
  csv: boolean;
}
const ActiveView = ({ activeView, input, data, parsedData, csv }: ActiveViewProps) => {
  switch (activeView) {
    case "overview":
      return <Overview input={input} data={data} parsedData={parsedData} csv={csv} />;
    case "battlelog":
      return <BattleLog input={input} data={data} parsedData={parsedData} csv={csv} />;
    case "battlelograw":
      return <BattleLogRaw input={input} csv={csv} />;
    case "ships":
      return <Ships input={input} data={data} parsedData={parsedData} csv={csv} />;
    case "buffs":
      return <Buffs input={input} data={data} parsedData={parsedData} csv={csv} />;
    case "officers":
      return <Officers input={input} data={data} parsedData={parsedData} csv={csv} />;
    case "loot":
      return <Loot input={input} data={data} parsedData={parsedData} csv={csv} />;
    case "damage_graph":
      return <DamageGraph input={input} data={data} parsedData={parsedData} csv={csv} />;
    case "not_implemented":
      return <Overview input={input} data={data} parsedData={parsedData} csv={csv} />;
  }
};

export function CombatLogNew() {
  const [logData, setLogData] = useState<LogData>({ status: "empty" });
  const [activeView, setActiveView] = useState<View>("overview");
  const [csv, setCsv] = React.useState(false);

  // Loading of the combat log
  const loadLogData = useCallback(
    (content: string) => {
      try {
        const parsed = JSON.parse(content);
        let journalData = parsed;
        // Community mod exports arrays of objects
        if (Array.isArray(journalData)) {
          journalData = journalData[0];
        }
        // Server response is wrapped in a `{journal: {...}}` object
        if (!!journalData["battle_log"]) {
          journalData = { journal: journalData };
        }
        // Actual combat log data needs to have a `battle_log` field
        if (!!journalData["journal"]["battle_log"]) {
          setLogData({ status: "success", data: journalData as JournalsGetMessage });
        } else {
          setLogData({
            status: "error",
            details: "This file does not appear to be a raw combat log",
          });
        }
      } catch (error) {
        console.warn(error);
        setLogData({
          status: "error",
          details: "This file does not appear to be a raw combat log",
        });
      }
    },
    [setLogData],
  );

  // Loading of the game data
  const gameData = useQuery(
    "game-data",
    async () => {
      const response = await fetch("/data/game-data/all.json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const body = (await response.json()) as GameData;
      return body;
    },
    { enabled: logData !== undefined },
  );

  // Data transform
  const parsedData = useMemo(() => {
    if (logData.status === "success" && gameData.data !== undefined) {
      return parseAllData(logData.data, gameData.data);
    } else {
      return undefined;
    }
  }, [logData, gameData]);

  // Display
  if (logData.status !== "success" || gameData.data === undefined) {
    return (
      <Frame title="Combat log viewer">
        <h2>Raw combat log viewer</h2>
        <p>This tool can used to view raw combat logs.</p>
        {logData.status === "error" ? (
          <Alert severity="error">Failed to load combat log: {logData.details}</Alert>
        ) : null}
        {logData.status === "success" && gameData.data === undefined ? (
          <Alert severity="success">Wait while game data is loading...</Alert>
        ) : null}
        <DropZone onLoad={(data) => loadLogData(data)} />
        <p />
        <Alert severity="info">
          <AlertTitle>Exporting raw combat logs</AlertTitle>
          Raw combat logs can not officially be exported from the game. They work completely
          differently than the CSV combat logs you can export from the PC game client. Here are your
          options for exporting raw combat logs:
          <ul>
            <li>Use another 3rd party tool that allows you to export raw combat logs.</li>
            <li>
              Use an example file. Click{" "}
              <a
                href="/data/combatlog-data/example_raw_combat_log.json"
                download="example_raw_combat_log.json"
              >
                here
              </a>{" "}
              to download one.
            </li>
            <li>
              Use Rippers mod
              <ul>
                <li>Download and install the mod</li>
                <li>Configure it to sync combat logs (set "battlelogs = true" in the config)</li>
                <li>
                  Run a local server that receives the combat logs exported by the mod. Click{" "}
                  <a href={syncServerNodeUrl} download="index.mjs">
                    here
                  </a>{" "}
                  to download a simple Node server that can be used for this purpose (you need to
                  have Node installed for this), or click{" "}
                  <a href={syncServerRustUrl} download="sync-server.exe">
                    here
                  </a>{" "}
                  to download a self-contained server.
                </li>
              </ul>
            </li>
          </ul>
        </Alert>
        <p />
        <Alert severity="warning">
          <AlertTitle>Use of this tool</AlertTitle>
          This tool was made to enable an in-depth analysis of game mechanics and officer setups. Do
          not use this tool for anything evil, and respect the privacy of anyone involved.
        </Alert>
      </Frame>
    );
  } else {
    const MenuItem = ({ label, view }: { label: string; view: View }) => (
      <ListItemButton selected={activeView === view} onClick={() => setActiveView(view)}>
        <ListItemText primary={label} />
      </ListItemButton>
    );
    return (
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              href="/combatlog"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
              Combat log #{logData.data.journal.id}
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={csv}
                    onChange={(event) => setCsv(event.target.checked)}
                    color="secondary"
                  />
                }
                label="CSV"
              />
            </FormGroup>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <List>
              <MenuItem label="Overview" view="overview" />
              <MenuItem label="Battle Log" view="battlelog" />
              <MenuItem label="Raw Battle Log" view="battlelograw" />
              <MenuItem label="Ships" view="ships" />
              <MenuItem label="Officers" view="officers" />
              <MenuItem label="Buffs" view="buffs" />
              <MenuItem label="Loot" view="loot" />
            </List>
            <Divider />
            <List>
              <MenuItem label="Damage Graph" view="damage_graph" />
              <MenuItem label="Analysis 2" view="not_implemented" />
              <MenuItem label="Analysis 3" view="not_implemented" />
              <MenuItem label="Analysis 4" view="not_implemented" />
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <ActiveView
            csv={csv}
            activeView={activeView}
            input={logData.data.journal}
            data={gameData.data}
            parsedData={parsedData!}
          />
        </Box>
      </Box>
    );
  }
}
