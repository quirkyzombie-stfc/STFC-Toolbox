import * as React from "react";
import {
  Table,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  Collapse,
  Box,
  Paper,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { styled } from "@mui/material/styles";

const TableRowWithoutBottom = styled(TableRow)(({ theme }) => ({
  "& > *": {
    borderBottom: "unset",
  },
}));

export interface CollapsibleTableRowData {
  cells: string[];
  details: string | JSX.Element;
}

export interface CollapsibleTableColumnData {
  label: string;
  align: "inherit" | "left" | "center" | "right" | "justify";
}

export interface CollapsibleTableProps {
  columns: CollapsibleTableColumnData[];
  data: CollapsibleTableRowData[];
}

function Row(props: {
  row: CollapsibleTableRowData;
  columns: CollapsibleTableColumnData[];
  i: number;
}) {
  const { row, columns, i } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRowWithoutBottom key={i}>
        <TableCell key={"collapse-icon"}>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)} key="i">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {row.cells.map((cell, j) => (
          <TableCell component="th" scope="row" key={j} align={columns[j].align}>
            {cell}
          </TableCell>
        ))}
      </TableRowWithoutBottom>
      <TableRow key={i + "-details"}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length + 1}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>{row.details}</Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export function CollapsibleTable(props: CollapsibleTableProps): JSX.Element {
  const { columns, data } = props;

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell />
            {columns.map((col, i) => (
              <TableCell align={col.align} key={i}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <Row row={row} columns={columns} i={i} key={i} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
