import * as React from "react";
import { Frame } from "../components/Frame";

export function ArmadaBug() {
  return (
    <Frame title="Duplicate armada officers">
      This page describes the mechanics of duplicate armada officers, also known as the "Spock bug".
      If you want to understand the mechanics, read carefully through this page.
      <h4>Glossary</h4>
      This section describes how I am using the some important words throughout the text on this
      page. It's not necessarily the same language as used in the game.
      <ul>
        <li>
          <strong>Officer</strong>: An entry in the database of officers that can be acquired by
          players. For example, there is only one{" "}
          <a href="https://stfc.space/officers/766809588">Spock</a> in the game.
        </li>
        <li>
          <strong>Officer instance</strong>: A copy of an officer, owned by a player and assigned to
          a given seat in a given ship. For example, the leader ship could have a tier 2{" "}
          <a href="https://stfc.space/officers/766809588">Spock</a> assigned to the captain seat.
        </li>
        <li>
          <strong>Officer stats</strong>: The sums of the Attack, Defense, or Health stats of all
          officer instances on a ship, after applying research. The total Attack, Defense, and
          Health stats are shown in the lower right corner in the UI where you can assign officers
          to ships (although I wouldn't trust the exact numbers shown there).
        </li>
        <li>
          <strong>Ability boost</strong>: An effect that improves the efficiency of other officer
          abilities. The following sources provide ability boosts:
          <ul>
            <li>
              <a href="https://stfc.space/officers/329940464">Christopher Pike</a> captain maneuver
            </li>
            <li>
              <a href="https://stfc.space/officers/1427486959">Jean-Luc Picard</a> captain maneuver
            </li>
            <li>
              <a href="https://stfc.space/officers/3923643019">Leonard McCoy</a> captain maneuver
            </li>
          </ul>
        </li>
        <li>
          <strong>Maneuver boost</strong>: An effect that improves the efficiency of the captain
          maneuver. The following sources provide maneuver boosts:
          <ul>
            <li>
              <a href="https://stfc.space/officers/1853520303">Cadet Leonard McCoy</a> officer
              ability
            </li>
            <li>
              <a href="https://stfc.space/officers/1485791413">Next Gen Crusher</a> officer ability
            </li>
            <li>
              <a href="https://stfc.space/ships/2919480363">JELLYFISH</a> ship ability
            </li>
          </ul>
        </li>
      </ul>
      <h4>Armada order</h4>
      Within an armada, ships are sorted as follows:
      <ol>
        <li>The leader (the ship that initiated the armada).</li>
        <li>
          All starred ships, sorted by power. The game seems to be using a slightly different
          formula for the ship power than what is displayed when you inspect the ship. In some
          cases, you can see a ship with a lower power rating sorted before a ship with a slightly
          higher power rating.
        </li>
        <li>All unstarred ships, sorted by power.</li>
      </ol>
      This order determines which ships are included in the armada (if there are more players than
      seats in the armada), in which order ships appear in the combat log overview, in which order
      ships fire their weapons, and in which order officer effects are applied.
      <h4>Duplicate officer mechanics</h4>
      If there are two or more instances of the same officer in an armada, then officer
      abilities/maneuvers behave according to the following rules.
      <ol>
        <li>
          The officer instance on the first ship according to the armada order determines the
          ability boost or maneuver boost applied to all other instances of the same officer.
          Examples:
          <ul>
            <li>
              The three examles below assume all{" "}
              <a href="https://stfc.space/officers/776602621">Gailas</a> are maxed (tier 5).
            </li>
            <li>
              If the leader has Pike+Moreau+Gaila (Pike's captain maneuver boosting Gaila crit
              damage reduction from 50% to 110%), then all other Gailas in the armada will also
              provide a 110% crit damage reduction.
            </li>
            <li>
              If the leader has just a Gaila on the bridge (with a base crit damage reduction of
              50%), then all other Gailas in the armada will also provide a 50% crit damage
              reduction, even if all other ships are using Pike+Moreau+Gaila.
            </li>
            <li>
              If the leader has no Gaila (neither on bridge nor below deck), and the only starred
              ship has Pike+Moreau+Gaila, then all other Gailas in the armada will also provide a
              110% crit damage reduction.
            </li>
          </ul>
        </li>
        <li>
          The above applies both to bridge and below deck officers. Below deck officers do not
          receive ability or maneuver boosts. Examples:
          <ul>
            <li>
              If the leader has Pike+Moreau+Spock on the bridge and Gaila below deck (with a base
              crit damage reduction of 50%), then all other Gailas in the armada will also provide a
              50% crit damage reduction, even if all other ships are using Pike+Moreau+Gaila.
            </li>
          </ul>
        </li>
        <li>
          The officer instance on the first ship according to the armada order determines the
          officer stats used for abilities that scale with officer stats. Similarly to above, it
          does not matter whether the officer is on the bridge or below deck. Examples:
          <ul>
            <li>
              The two examples below assume all{" "}
              <a href="https://stfc.space/officers/766809588">Spocks</a> are maxed and restore
              shield hit points equal to 750% of total defense stats.
            </li>
            <li>
              If the leader has Spock on the bridge and 10k defense stats, then all other Spocks in
              the armada will restore shield hit points equal to 750% of 10k, no matter how much
              defense stats the other ships have.
            </li>
            <li>
              If the leader has Spock below deck and 200k defense stats, then all other Spocks in
              the armada will restore shield hit points equal to 750% of 200k, no matter how much
              defense stats the other ships have.
            </li>
          </ul>
        </li>
        <li>
          Each officer instance uses its own tier for officer abilities, and its own synergy for
          captain maneuvers. Examples:
          <ul>
            <li>
              If the leader has a T5 Gaila (50% crit damage reduction) and the second ship a T1
              Gaila, then the second ship will only provide a 10% crit damage reduction.
            </li>
            <li>
              If the leader has <a href="https://stfc.space/officers/989647182">One of Eleven</a>{" "}
              with full synergy (+9% shield mitigation) and the second ship One of Eleven with no
              synergy, then the second ship will only get a +5% shield mitigation.
            </li>
          </ul>
        </li>
        <li>
          Some officer abilities/maneuvers do not work in armadas. Examples:
          <ul>
            <li>
              There is probably some outdated list of disabled officers floating around. It's a good
              start, but not accurate.
            </li>
          </ul>
        </li>
        <li>
          Some officer abilities/maneuvers can not be boosted. Examples:
          <ul>
            <li>
              Ability boosting effects and maneuver boosting effects do not affect each other. For
              example, Pike alone will always provide a 40% boost to other officer abilities, even
              if you put him on a <a href="https://stfc.space/ships/2919480363">JELLYFISH</a> and
              pair him with <a href="https://stfc.space/officers/1853520303">Cadet Leonard McCoy</a>
              .
            </li>
            <li>
              Abilities/maneuvers that have a chance to apply some effect at combat start tend to be
              not boostable. For example, both the officer ability and captain maneuver of{" "}
              <a href="https://stfc.space/officers/677303054">Harcourt Fenton Mudd</a> have a fixed
              chance to activate, and that chance cannot be modified in any way.
            </li>
          </ul>
        </li>
      </ol>
      <h4>TL;DR</h4>
      <ul>
        <li>Duplicate officer mechanics apply both the bridge and below deck officers</li>
        <li>Boosts and stats are passed down</li>
        <li>Tier and synergy are NOT passed down</li>
      </ul>
      <h4>How to verify</h4>
      Use officers with deterministic effects where you can easily determine the exact effect of the
      officer from the damage numbers in the combat log. The damage numbers is the only part of the
      combat log that I consider trustworthy. Pretty much any other number or piece of information
      is recomputed by the client which is the most buggy software product in the history of our
      multiverse. Useful officers:
      <ul>
        <li>
          Mirek, Tyler, or similar on a Realta. With enough officer stats, the damage numbers will
          be dominated by the flat damage bonus of the officer.
        </li>
        <li>
          One of Eleven as captain. Inspect your own shield mitigation (proportion between shield
          and hull damage taken).
        </li>
        <li>Tiza against eclipse armadas. Inspect enemy shield mitigation.</li>
        <li>Gaila. Inspect enemy crit damage.</li>
      </ul>
      <h4>History</h4>
      How I learned about the mechanics, not a complete history. I'm sure others found the mechanics
      independently or sooner.
      <ul>
        <li>
          Around January 2021 a player named Riva reported on a community discord irregularities
          when duplicate officers were used in armadas.
        </li>
        <li>
          Within a couple of weeks, players found the mechanics described on this page but kept
          findings to themselves.
        </li>
        <li>
          Half a year later, after Eurydice was added to the transport pattern pool, alliances from
          different servers were using the mechanics to beat armadas beyond what they should have
          been able to beat.
        </li>
        <li>
          Today, almost all difficult armadas are solo armadas, so it's not as relevant as it used
          to be.
        </li>
        <li>
          The bug had been continuously reported by players and mentioned by CCs (as the "Spock
          bug") over the last 2+ years, so at this point it's safe to assume it's never going to be
          fixed.
        </li>
      </ul>
      <h4>The information on this page is wrong</h4>
      If you have a combat log where officers do not behave according to the mechanics described
      here, complain on some discord. Maybe Rev's or DJ's.
    </Frame>
  );
}
