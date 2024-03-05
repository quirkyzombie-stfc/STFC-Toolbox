import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormState } from "react-use-form-state";
import {
  Box,
  Button,
  Table,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TablePagination,
  TextField,
  Paper,
  Toolbar,
  Typography,
  InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled, darken, Theme } from "@mui/material/styles";
import { Frame } from "../components/Frame";
import {
  CombatLogDatabase,
  CombatLogDatabaseEntry,
  CombatLogDatabaseShip,
} from "../util/combatLog";

const SearchDiv = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: darken(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: darken(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconDiv = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

/*
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
        width: '20ch',
        },
    },
    },
  }),
);
*/

export interface CombatLogsProps {}

function getIndexNameFromUrl(): string {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("indexName") || "";
  } catch {
    return "";
  }
}

export function CombatLogs(props: CombatLogsProps): JSX.Element {
  const [data, setData] = useState<CombatLogDatabase>([]);
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [indexName, setIndexName] = React.useState(getIndexNameFromUrl());
  const handleIndexNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIndexName(event.target.value);
  };

  async function fetchData() {
    const response = await fetch(`/data/combatlogs-index/${indexName}.json`);
    const json = await response.json();
    setData(json);
  }

  function handleClick(id: string) {
    navigate(`/combatlogs/${id}`);
  }
  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const allRows = data
    .filter((row) => {
      if (search.length === 0) {
        return true;
      } else {
        return [
          row.type,
          ...row.ships.map((s) => s.name),
          ...row.ships.flatMap((s) => s.officers),
        ].some((text) => text.search(search) >= 0);
      }
    })
    .sort((a, b) => (a.time > b.time ? -1 : a.time < b.time ? 1 : 0));
  const tableRows = allRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, allRows.length - page * rowsPerPage);

  const initiatorDisplayName = (s: CombatLogDatabaseShip) => `T${s.tier} ${s.name}`;

  const targetDisplayName = (s: CombatLogDatabaseShip) => s.name;

  const hhpLostPercentage = (row: CombatLogDatabaseEntry, side: string) => {
    const hhp = row.ships
      .filter((s) => s.side === side)
      .reduce((p, c) => [p[0] + c.hhp_lost, p[1] + c.hhp_max], [0, 0]);
    return hhp[0] / hhp[1];
  };

  if (data.length === 0) {
    return (
      <Frame title="Combat log explorer">
        <Toolbar>
          <Typography
            sx={(theme) => ({
              flexGrow: 1,
              display: "none",
              [theme.breakpoints.up("sm")]: {
                display: "block",
              },
            })}
            variant="h6"
            noWrap
          >
            Combat logs
          </Typography>
        </Toolbar>
        <p>This page is not public. Enter the database name to load combat logs.</p>
        <form noValidate autoComplete="off">
          <TextField
            id="combatlogs-index-name"
            label="Database name"
            variant="outlined"
            fullWidth
            value={indexName}
            onChange={handleIndexNameChange}
          />
          <div style={{ paddingTop: "12px" }}>
            <Button
              variant="contained"
              color="primary"
              component="span"
              onClick={() => fetchData()}
            >
              Load
            </Button>
          </div>
        </form>
      </Frame>
    );
  } else {
    return (
      <Frame title="Combat log explorer">
        <Toolbar>
          <Typography
            sx={(theme) => ({
              flexGrow: 1,
              display: "none",
              [theme.breakpoints.up("sm")]: {
                display: "block",
              },
            })}
            variant="h6"
            noWrap
          >
            Combat logs
          </Typography>
          <SearchDiv>
            <SearchIconDiv>
              <SearchIcon />
            </SearchIconDiv>
            <InputBase
              placeholder="Search…"
              classes={{
                root: "classes.inputRoot",
                input: "classes.inputInput",
              }}
              inputProps={{ "aria-label": "search" }}
              value={search}
              onChange={handleSearch}
            />
          </SearchDiv>
        </Toolbar>
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell key={"target"}>Target</TableCell>
                  <TableCell key={"initiator"}>Initiator</TableCell>
                  <TableCell key={"outcome"}>Outcome</TableCell>
                  <TableCell key={"damage"}>Hull Damage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row, i) => (
                  <TableRow key={i} hover onClick={() => handleClick(row.id)}>
                    <TableCell key={"target"}>
                      {row.ships
                        .filter((s) => s.side === "target")
                        .map(targetDisplayName)
                        .join(", ")}
                    </TableCell>
                    <TableCell key={"initiator"}>
                      {row.ships
                        .filter((s) => s.side === "initiator")
                        .map(initiatorDisplayName)
                        .join(", ")}
                    </TableCell>
                    <TableCell key={"outcome"}>{row.intiator_wins ? "Win" : "Defeat"}</TableCell>
                    <TableCell key={"damage"}>{`${(hhpLostPercentage(row, "target") * 100).toFixed(
                      1,
                    )}%`}</TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={allRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Frame>
    );
  }
}
