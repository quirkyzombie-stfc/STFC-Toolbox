import * as React from "react";
import {
  Table,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TextField,
  Paper,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { styled, Theme } from "@mui/material/styles";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export interface ColumnDefinition {
  label: string;
  align: "inherit" | "left" | "center" | "right" | "justify";
}

export interface CombatLogTableProps {
  columns: ColumnDefinition[];
  data: {
    cells: string[];
  }[];
  csv?: boolean;
}

export function CombatLogTable(props: CombatLogTableProps): React.JSX.Element {
  const { columns, data, csv } = props;

  if (csv) {
    const content = [columns.map((c) => c.label), ...data.map((d) => d.cells)]
      .map((row) => row.map((cell) => `"${cell.replace('"', "'")}"`).join(", "))
      .join("\n");

    return (
      <TextField
        defaultValue={content}
        fullWidth
        multiline
        rows={32}
        InputProps={{
          readOnly: true,
        }}
        variant="filled"
      />
    );
  } else {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 650 }} stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col, i) => (
                <StyledTableCell align={col.align} key={i}>
                  {col.label}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {row.cells.map((cell, j) => (
                  <StyledTableCell key={j} align={columns[j].align}>
                    {cell}
                  </StyledTableCell>
                ))}
                {Array(row.cells.length)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}
