import * as React from "react";
import { TextField, MenuItem } from "@mui/material";

export function ShipTypeSelect(props: any) {
  const { onChange, ...rest } = props;
  return (
    <TextField select onChange={(event) => onChange(event.target.value)} {...rest}>
      <MenuItem key="I" value="Interceptor">
        Interceptor
      </MenuItem>
      <MenuItem key="E" value="Explorer">
        Explorer
      </MenuItem>
      <MenuItem key="B" value="Battleship">
        Battleship
      </MenuItem>
      <MenuItem key="S" value="Survey">
        Survey
      </MenuItem>
    </TextField>
  );
}
