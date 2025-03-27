import * as React from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";
import { makeStyles } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Drawer,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Flight as FlightIcon,
  FlashOn as FlashOnIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { alpha, styled } from "@mui/material/styles";

const drawerWidth = 240;

interface ListItemLinkProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
}

function ListItemLink(props: ListItemLinkProps) {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, "to">>((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to],
  );

  return (
    <li>
      <ListItemButton component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItemButton>
    </li>
  );
}

export interface FrameProps {
  children?: React.ReactNode;
  title: string;
}

export function Frame(props: FrameProps) {
  const { children, title } = props;

  return (
    <div style={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
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
            <ListItemLink to="/mitigation" primary="Mitigation" icon={<FlashOnIcon />} />
            <ListItemLink to="/combatlog" primary="Raw combat Logs" icon={<FlashOnIcon />} />
            <ListItemLink to="/simulator" primary="Simulator" icon={<FlashOnIcon />} />
            <ListItemLink to="/origin-sector" primary="Origin Sector" icon={<FlashOnIcon />} />
            <ListItemLink to="/leslie" primary="Leslie" icon={<FlashOnIcon />} />
            <ListItemLink to="/scrapping" primary="Scrapping" icon={<FlashOnIcon />} />
            <ListItemLink to="/ship-comparison" primary="Ship Comparison" icon={<FlashOnIcon />} />
            <ListItemLink to="/game-mechanics" primary="Game Mechanics" icon={<FlashOnIcon />} />
          </List>
          <Divider />
          <List>
            <ListItemLink to="/about" primary="About" icon={<InfoIcon />} />
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </div>
  );
}
