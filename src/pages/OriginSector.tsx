import * as React from "react";
import { Grid } from "@mui/material";
import { Frame } from "../components/Frame";

import bigImage from "../../assets/Origin_Sector.png";
import smallImage from "../../assets/Origin_Sector_Preview.png";
import imageSource from "../../assets/Origin_Sector.drawio";

export function OriginSector() {
  return (
    <Frame title="Origin Sector">
      <h2>Map of origin space territories</h2>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <a target="_blank" href={bigImage}>
            <img src={smallImage} alt="Origin Sector" style={{ width: "100%" }} />
          </a>
        </Grid>
        <Grid size={{ xs: 12 }}>
          Click on the map to view it in full resolution. Click{" "}
          <a href={imageSource} download>
            here
          </a>{" "}
          to download the above map in <a href="https://www.diagrams.net/">draw.io</a> format.
        </Grid>
      </Grid>
    </Frame>
  );
}
