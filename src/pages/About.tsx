import * as React from "react";
import { Frame } from "../components/Frame";

export function About() {
  return (
    <Frame title="About">
      If you have any feedback, contact QuirkyZombie on one of the following discord servers:
      <ul>
        <li>
          <a href="https://discord.gg/6s5dnrg">Official STFC discord</a>
        </li>
        <li>
          <a href="https://discord.gg/SXn4cy3">Crew Setups &amp; Ship Info</a>
        </li>
        <li>
          <a href="https://discord.gg/TalkingTrek">Talking Trek Podcast</a>
        </li>
      </ul>
      Other useful STFC resources:
      <ul>
        <li>
          <a href="https://stfc.space/">stfc.space</a>: STFC database
        </li>
        <li>
          <a href="https://www.talkingtrekstfc.com">talkingtrekstfc.com</a>: Talking Trek Podcasts
        </li>
      </ul>
    </Frame>
  );
}
