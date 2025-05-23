import * as React from "react";
import {
  Table,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Paper,
} from "@mui/material";
import { Theme } from "@mui/material/styles";

export interface ColumnDefinition {
  label: string;
  align: "inherit" | "left" | "center" | "right" | "justify";
}

export interface SimpleTableProps {
  columns: ColumnDefinition[];
  data: {
    cells: string[];
  }[];
}

export function SimpleTable(props: SimpleTableProps): JSX.Element {
  const { columns, data } = props;

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {columns.map((col, i) => (
              <TableCell align={col.align} key={i}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {row.cells.map((cell, j) => (
                <TableCell component="th" scope="row" key={j} align={columns[j].align}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
