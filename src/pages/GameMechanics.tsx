import * as React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  Table,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TextField,
  Typography,
} from "@mui/material";
import { Frame } from "../components/Frame";

import roundsImage1 from "../../assets/StfcCombat.jpg";
import roundsImage2 from "../../assets/StfcCombatExample1.jpg";
import roundsImage3 from "../../assets/StfcCombatExample2.jpg";
import roundsImage4 from "../../assets/StfcCombatExample3.jpg";

const nameToId = (name: string) => name.toLowerCase().replaceAll(" ", "-").replaceAll(":", "");

interface EntryTitle {
  name: string;
  id: string;
}
interface EntryData {
  title: EntryTitle;
  content: React.JSX.Element;
}

function makeTitle(name: string): EntryTitle {
  return {
    name,
    id: nameToId(name),
  };
}

function makeLink(to: EntryTitle, text: string) {
  return <a href={`#${to.id}`}>{text}</a>;
}

const titleGlossary = makeTitle("Glossary");
const titleOfficerAbilities = makeTitle("Officer abilities");
const titleShipOrder = makeTitle("Ship order");
const titleDuplicateOfficers = makeTitle("Duplicate officers");
const titleBugShipHealthBonus = makeTitle("Bug: ship health bonus");
const titleLastSubround = makeTitle("Officer activation at the end of a round");
const titleRoundStructure = makeTitle("Round structure");
const titleEffectStacking = makeTitle("Effect stacking");
const titleEffectDuration = makeTitle("Effect duration");
const titleCombatRoundLimit = makeTitle("Combat round limit");
const titleShipComponents = makeTitle("Ship components");
const titleStatusEffects = makeTitle("Status effects");
const titleHealing = makeTitle("Healing");
const titleMitigation = makeTitle("Damage mitigation");
const titleIsoDamage = makeTitle("Isolitic damage");
const titleIsoMitigation = makeTitle("Isolitic damage mitigation");
const titleShieldMitigation = makeTitle("Shield mitigation");
const titleAttackDamage = makeTitle("Attack damage");
const titleWeaponFiringPattern = makeTitle("Weapon firing pattern");
const titleBorgCubeBeamCharge = makeTitle("Borg cube beam charge");
const titleShipPower = makeTitle("Ship power rating");
const titleClientSideCalculations = makeTitle("Client-side calculations");
const titleEfficiency = makeTitle("Efficiency");
const titleApexBarrier = makeTitle("Apex Barrier");
const titleTodo = makeTitle("TODO");

const entries: EntryData[] = [
  {
    title: titleGlossary,
    content: (
      <>
        <Table sx={{ width: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>HHP</TableCell>
              <TableCell>Hull hit points</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>SHP</TableCell>
              <TableCell>Shield hit points</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>
    ),
  },
  {
    title: titleOfficerAbilities,
    content: (
      <>
        <Typography paragraph>There are three types of officer abilities:</Typography>
        <Typography component="ol" gutterBottom>
          <li>
            Captain maneuver
            <ul>
              <li>Only active if the officer is in the captain seat</li>
              <li>Is not affected by the officer tier or level, only by synergy</li>
              <li>
                Some effects (<a href="https://stfc.space/ships/2919480363">JELLYFISH</a>,{" "}
                <a href="https://stfc.space/officers/1853520303">Cadet Leonard McCoy</a>,{" "}
                <a href="https://stfc.space/officers/1485791413">Next Gen Crusher</a>),{" "}
                <a href="https://stfc.space/officers/2847497836">Kras</a> also boost the effect of
                the maneuver. They stack as follows: <code>(base + synergy) * (1 + boost)</code>
              </li>
              <li>
                For example, <a href="https://stfc.space/officers/989647182">One of Eleven</a>+
                <a href="https://stfc.space/officers/118103052">Two of Eleven</a>+
                <a href="https://stfc.space/officers/1853520303">Cadet Leonard McCoy</a> would
                increase shield mitigation by <code>(0.05 + 0.02) * (1 + 0.12) = 7.84%</code>
              </li>
              <li>
                Not all maneuvers can be boosted. Only those that activate in combat at{" "}
                {makeLink(titleRoundStructure, "combat begin or subround end")} can be boosted
                (TODO: verify this).
              </li>
            </ul>
          </li>
          <li>
            Officer ability
            <ul>
              <li>
                Only active if the officer is in any of the three bridge seats (including the
                captain seat)
              </li>
              <li>Is not affected by the officer level or synergy, only by the officer tier</li>
              <li>
                Some effects (<a href="https://stfc.space/officers/329940464">Christopher Pike</a>,{" "}
                <a href="https://stfc.space/officers/1427486959">Jean-Luc Picard</a>,{" "}
                <a href="https://stfc.space/officers/3923643019">Leonard McCoy</a>) also boost the
                effect of the maneuver. They stack as follows: <code>(base) * (1 + boost)</code>
              </li>
              <li>
                For example, <a href="https://stfc.space/officers/329940464">Christopher Pike</a>+
                <a href="https://stfc.space/officers/3990993357">Marlena Moreau</a>+
                <a href="https://stfc.space/officers/3553398304">T1 John Harrison</a> would decrease
                target shield mitigation by <code>(0.6) * (1 + 0.4 + 0.8) = 132%</code>
              </li>
              <li>
                Not all abilities can be boosted. Only those that activate in combat at{" "}
                {makeLink(titleRoundStructure, "combat begin or subround end")} can be boosted
                (TODO: verify this).
              </li>
            </ul>
          </li>
          <li>
            Below deck ability
            <ul>
              <li>
                Only active if the officer is in any of the unlocked below deck slots. Officers in
                locked (grayed out) below deck slots have no effect.
              </li>
              <li>Is not affected by the officer level or synergy, only by the officer tier</li>
              <li>Below deck abilities can not be boosted</li>
            </ul>
          </li>
        </Typography>
        <Typography paragraph>
          Note: the in-game tooltips for abilities are not reliable. They are written manually,
          almost never corrected, and are more often than not wrong:
        </Typography>
        <Typography component="ol" gutterBottom>
          <li>
            Sometimes the numbers are wrong. T1 Carol says she provides a 20% bonus to damage, in
            fact the bonus is twice as large (40%).
          </li>
          <li>
            Sometimes the description has nothing to do with the ability. For about 3 years, the
            tooltip for DJaoki said he increases piercing stats, in fact he always increased defense
            stats.
          </li>
          <li>
            Sometimes the description does not explain subtle details of the ability. Leslie says he
            restores 5% hull each round, but does not explain that the restored hull is removed at
            the end of combat.
          </li>
        </Typography>
        <Typography paragraph>
          Note: all ability types are affected by the{" "}
          {makeLink(titleDuplicateOfficers, "duplicate officers bug")}.
        </Typography>
      </>
    ),
  },
  {
    title: titleEffectStacking,
    content: (
      <>
        <Typography paragraph>
          Whenever you have multiple effects that provide the same kind of bonus, they stack as
          follows:
        </Typography>
        <Typography paragraph>
          <code>total = (A) * (1 + B) + (C)</code>
        </Typography>
        <Typography paragraph>where</Typography>
        <Typography component="ul" gutterBottom>
          <li>
            <strong>A</strong> is the sum of all bonuses that provide a "base" value{" "}
          </li>
          <li>
            <strong>B</strong> is the sum of all bonuses that provide a "modifier" values{" "}
          </li>
          <li>
            <strong>C</strong> is the sum of all bonuses that provide a "flat bonus" values{" "}
          </li>
        </Typography>
        <Typography paragraph>
          The terms "base", "modifier", and "flat bonus" are mine. STFC is very bad at consistently
          describing effects in the in-game tooltips. The only way to determine which of the 3
          categories a bonus belongs to is reverse engineering it from analyzing combat logs. Common
          examples:
        </Typography>
        <Typography component="ul" gutterBottom>
          <li>
            "base": bonuses from ship components, bonuses to HHP/SHP from ship levels, bonuses to
            defense and piercing values from officers (
            <a href="https://stfc.space/officers/3583932904">Five of Eleven</a>,{" "}
            <a href="https://stfc.space/officers/1608562191">Kang</a>, ...), some research (
            <a href="https://stfc.space/researches/1762164246">Shield Modulation</a>)
          </li>
          <li>"modifier": almost all bonuses from research and officer abilities</li>
          <li>
            "flat bonus": most bonuses to weapon damage (Mirek,{" "}
            <a href="https://stfc.space/researches">Kinetic Guerilla Warefare, ...)</a>, North Star
            ship ability
          </li>
        </Typography>
      </>
    ),
  },
  {
    title: titleShipComponents,
    content: (
      <>
        <Typography paragraph>Every ship has the following ship component slots:</Typography>
        <Typography component="ol" gutterBottom>
          <li>
            <strong>Warp drive</strong>. Provides bonuses to warp range and warp speed.
          </li>
          <li>
            <strong>Impulse drive</strong>. Provides bonuses to impulse speed and the"dodge" defense
            stat.
          </li>
          <li>
            <strong>Shield</strong>. Provides bonuses to shield hit points, the "shield deflection"
            defense stat, and the shield regeneration rate.
          </li>
          <li>
            <strong>Armor</strong>. Provides bonuses to hull hit points and the "armor" defense
            stat.
          </li>
          <li>
            <strong>Sensor Dish</strong>. Currently unused in the game. Leftover from alpha release,
            or placeholder for future content?
          </li>
          <li>
            <strong>Deflector Array</strong>. Currently unused in the game. Leftover from alpha
            release, or placeholder for future content?
          </li>
          <li>
            <strong>Cargo Bay</strong>. Provides bonuses to cargo capacity and protected cargo.
          </li>
          <li>
            <strong>Weapon 1</strong>. Fires in subround 1 (see{" "}
            {makeLink(titleRoundStructure, "round structure")}).{" "}
          </li>
          <li>
            <strong>Weapon 2</strong>. Fires in subround 2 (see{" "}
            {makeLink(titleRoundStructure, "round structure")}).{" "}
          </li>
          <li>
            <strong>Weapon 3</strong>. Fires in subround 3 (see{" "}
            {makeLink(titleRoundStructure, "round structure")}).{" "}
          </li>
          <li>
            <strong>Weapon 4</strong>. Fires in subround 4 (see{" "}
            {makeLink(titleRoundStructure, "round structure")}).{" "}
          </li>
          <li>
            <strong>Weapon 5</strong>. Fires in subround 5 (see{" "}
            {makeLink(titleRoundStructure, "round structure")}).{" "}
          </li>
          <li>
            <strong>Weapon 6</strong>. Fires in subround 6 (see{" "}
            {makeLink(titleRoundStructure, "round structure")}).{" "}
          </li>
          <li>
            <strong>Mining tool</strong>. Provides bonuses to mining speed.
          </li>
        </Typography>
        <Typography paragraph>
          A component slot can be either empty, hidden, or upgradeable:
        </Typography>
        <Typography component="ol" gutterBottom>
          <li>
            Only weapon slots can be empty. That means, a ship can have 1-6 weapons, but otherwise
            every ship has all other components.
          </li>
          <li>
            Some components are hidden in the UI. For example, a Realta has an Armor component that
            is forever stuck at Mk1. You can see such components on{" "}
            <a href="stfc.space">stfc.space</a> when you inspect tier 1 of a ship.
          </li>
          <li>
            The remaining components are upgradeable. They are shown in the ship upgrade UI, and you
            can spend materials and resources to upgrade them.
          </li>
        </Typography>
      </>
    ),
  },
  {
    title: titleShipOrder,
    content: (
      <>
        <Typography paragraph>In combat, ships are sorted as follows:</Typography>
        <Typography component="ol" gutterBottom>
          <li>Defending station guns go before PvP attacker</li>
          <li>Ships of PvP attacker go before ships of PvP defender</li>
          <li>All NPCs (red dots, yellow dots, armadas) go before player ships</li>
          <li>
            The armada leader (the ship that initiated a group armada) goes before allied ships
          </li>
          <li>Starred ships go before unstarred ships</li>
          <li>
            If none of the above rules apply, ships are sorted by{" "}
            {makeLink(titleShipPower, "ship power")}. Note that the ship power displayed in the game
            is unreliable.
          </li>
        </Typography>
        <Typography paragraph>
          This order determines which ships are included in the armada (if there are more players
          than seats in the armada), in which order ships appear in the combat log overview, in
          which order ships fire their weapons, and in which order officer effects are applied.
        </Typography>
      </>
    ),
  },
  {
    title: titleDuplicateOfficers,
    content: (
      <>
        <Typography paragraph>
          If there are two or more instances of the same officer in an armada, then officer
          abilities/maneuvers behave according to the following rules.
        </Typography>
        <Typography component="ol" gutterBottom>
          <li>
            The officer instance on the first ship according to the{" "}
            {makeLink(titleShipOrder, "ship order")} determines the ability boost or maneuver boost
            applied to all other instances of the same officer. Examples:
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
                crit damage reduction of 50%), then all other Gailas in the armada will also provide
                a 50% crit damage reduction, even if all other ships are using Pike+Moreau+Gaila.
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
                If the leader has Spock on the bridge and 10k defense stats, then all other Spocks
                in the armada will restore shield hit points equal to 750% of 10k, no matter how
                much defense stats the other ships have.
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
                There is probably some outdated list of disabled officers floating around. It's a
                good start, but not accurate.
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
                pair him with{" "}
                <a href="https://stfc.space/officers/1853520303">Cadet Leonard McCoy</a>.
              </li>
              <li>
                Abilities/maneuvers that have a chance to apply some effect at combat start tend to
                be not boostable. For example, both the officer ability and captain maneuver of{" "}
                <a href="https://stfc.space/officers/677303054">Harcourt Fenton Mudd</a> have a
                fixed chance to activate, and that chance cannot be modified in any way.
              </li>
            </ul>
          </li>
        </Typography>
        <Typography paragraph>TL;DR</Typography>
        <Typography component="ul" gutterBottom>
          <li>Duplicate officer mechanics apply both to the bridge and below deck officers</li>
          <li>Boosts and stats are passed down</li>
          <li>Tier and synergy are NOT passed down</li>
          <li>Duplicate officers are never displayed in the combat log</li>
        </Typography>
      </>
    ),
  },
  {
    title: titleBugShipHealthBonus,
    content: (
      <Typography paragraph>
        The actual ship health bonus your ship has is likely larger than the ship health bonus
        displayed in the game. It looks like ships need much less officer health stats to reach
        individual health bonus breakpoints than they should.
      </Typography>
    ),
  },
  {
    title: titleLastSubround,
    content: (
      <Typography paragraph>
        Officers never activate the end of a round. Officers that should activate after the last
        shots were fired in a round, activate at the beginning of the following round instead. See{" "}
        {makeLink(titleRoundStructure, "round structure")} for a technical explanation why.
      </Typography>
    ),
  },
  {
    title: titleRoundStructure,
    content: (
      <>
        <Typography paragraph>
          Combat simulation is sequential: events happen one at a time, in a defined order. Combat
          is split into rounds, which are visibly denoted in the in-game combat log UI. Each round
          is split into sub-rounds (the game client does not show where sub-rounds begin and end).
        </Typography>
        <Typography paragraph>Within each sub-round:</Typography>
        <Typography component="ol" gutterBottom>
          <li>
            First, all officer and ship abilities apply their buffs
            <ul>
              <li>
                [Unverified] abilities are applied ship by ship, in the same order as the{" "}
                {makeLink(titleShipOrder, "ship order")}. I.e., first the first ship applies all its
                abilities, then the next ship applies all its abilities.
              </li>
              <li>
                Within each ship, abilities are applied in a fixed order. For example, Kirk always
                applies before Spock.
              </li>
              <li>
                If two or more ships are using the same ability, both apply their effect but only
                one is displayed in the combat log.
              </li>
            </ul>
          </li>
          <li>
            Then, all forbidden technologies apply their buffs
            <ul>
              <li>[Unverified] FTs apply in the same order as abilities</li>
              <li>
                If two or more ships are using the same forbidden tech, both apply their effect but
                only one is displayed in the combat log.
              </li>
            </ul>
          </li>
          <li>
            Then, all ships fire their weapon associated with the current sub-round.
            <li>
              The first weapon of a ship fires in the first sub-round, the second weapon in the
              second sub-round, and so on.
            </li>
            <li>
              Use the "Firing Pattern" section of hostiles and ships on{" "}
              <a href="stfc.space">stfc.space</a> to find out what weapon fires in which sub-round.
            </li>
          </li>
        </Typography>
        <Typography paragraph>
          At the end of each round (or between rounds, as these events are not included in the
          combat log):
        </Typography>
        <Typography component="ol" gutterBottom>
          <li>
            Ships wich are affected by <i>Burning</i> loose 1% of their initial hull hit points.
          </li>
          <li>
            Temporary effects are removed, see {makeLink(titleEffectDuration, "effect duration")}.
          </li>
        </Typography>
        <Typography paragraph>
          Combat has a limit of 100 rounds. See{" "}
          {makeLink(titleCombatRoundLimit, "combat round limit")}.
        </Typography>
        <Typography paragraph>Round structure in charts:</Typography>
        <Typography component="ul" gutterBottom>
          <li>
            <a href={roundsImage1}>Overview</a>
          </li>
          <li>
            <a href={roundsImage2}>Example 1</a>
          </li>
          <li>
            <a href={roundsImage3}>Example 2</a>
          </li>
          <li>
            <a href={roundsImage4}>Example 3</a>
          </li>
        </Typography>
        <Typography paragraph>
          Round structure as is used in the raw combat log data (identifiers extracted from the game
          client):
        </Typography>
        <code>
          <pre>
            {`
    START_ROUND
      START_SUB_ROUND
        OFFICER_ABILITIES_APPLIED_START
          OFFICER_ABILITY_APPLIED_START
          OFFICER_ABILITY_APPLIED_END
          OFFICER_ABILITY_APPLIED_START
          OFFICER_ABILITY_APPLIED_END
        OFFICER_ABILITIES_APPLIED_END
        FORBIDDEN_TECH_BUFFS_APPLIED_START
          FORBIDDEN_TECH_BUFF_APPLIED_START?
          FORBIDDEN_TECH_BUFF_APPLIED_END?
          FORBIDDEN_TECH_BUFF_APPLIED_START?
          FORBIDDEN_TECH_BUFF_APPLIED_END?
        FORBIDDEN_TECH_BUFFS_APPLIED_END
        START_ATTACK
          OFFICER_ABILITIES_FIRING
            OFFICER_ABILITY_START
            OFFICER_ABILITY_END
          OFFICER_ABILITIES_FIRED
        END_ATTACK
        START_ATTACK
          OFFICER_ABILITIES_FIRING
            OFFICER_ABILITY_START
            OFFICER_ABILITY_END
          OFFICER_ABILITIES_FIRED
        END_ATTACK
      END_SUB_ROUND
      START_SUB_ROUND
        ...
      END_SUB_ROUND
    END_ROUND
    START_ROUND
      ...
    END_ROUND
    `}
          </pre>
        </code>
      </>
    ),
  },
  {
    title: titleCombatRoundLimit,
    content: (
      <>
        <Typography paragraph>
          Combat has a limit of 100 rounds. After 100 rounds, the side with more remaining hull hit
          points is declared winner, and receives rewards (including event points) as if it had
          destroyed the other side.
        </Typography>
        <Typography paragraph>
          You can use this repeatedly receive rewards from a target without actually destroying it.
          The Realta and Sarcophagus ships are best for this, due to their low ratio of damage to
          hit points.
        </Typography>
      </>
    ),
  },
  {
    title: titleEffectDuration,
    content: (
      <>
        <Typography paragraph>
          Buffs that only last a fixed number of rounds are removed at the end of a round. So:
        </Typography>
        <Typography component="ul" gutterBottom>
          <li>"Add X for 1 round" means "Add X until the end of the current round"</li>
          <li>"Add X for 2 rounds" means "Add X until the end of the next round"</li>
          <li>...</li>
        </Typography>
      </>
    ),
  },
  {
    title: titleStatusEffects,
    content: (
      <>
        <Typography paragraph>
          Ships can be affected by the following status effects, with unique built-in effects:
        </Typography>
        <Typography component="ul" gutterBottom>
          <li>
            <strong>Burning</strong>. If a ship has the Burning status at the end of a round, its
            hull hit points decrease by 1% of the hull hit points it had at the start of combat.
          </li>
          <li>
            <strong>Hull Breach</strong>. If a ship has the Hull Breach status when it receives a
            critical hit, it takes 50% more damage from that crit. This bonus is applied at the end,
            after all other bonuses have been applied.
          </li>
          <li>
            <strong>Morale</strong>. If a ship has the Morale status when it fires a weapon, all
            piercing stats are increased by 10% for that weapon attack. This bonus is applied at the
            end, after all other bonuses have been applied.
          </li>
          <li>
            <strong>Assimilated</strong>. If a ship has the Assimilated status when it activates its
            officers, officer abilities have their effectiveness reduced by -25% for that
            activation. TODO: test how this stacks with things like Pike.
          </li>
          <li>
            <strong>Taunt</strong>. Enemy weapons will prioritize ships with the Taunt status
            effects when selecting targets to attack.
          </li>
        </Typography>
        <Typography paragraph>
          There are also traces in the game of additional unused status effects "Low Morale" and
          "Taunting".
        </Typography>
      </>
    ),
  },
  {
    title: titleHealing,
    content: (
      <>
        <Typography paragraph>
          There are effects in the game that restore or burn shield or hull hit points. These
          effects are not listed in the combat log, but can be guessed from the raw combat log data,
          which containts the remaining ship hit points after each weapon shot.
        </Typography>
        <Typography paragraph>
          Some effects restore hit points during combat, but the amount of hit points that was
          healed during combat is removed at the end of combat. Other effects restore hit points
          during combat, and the healed hit points persist after combat.
        </Typography>
        <Typography component="ul" gutterBottom>
          <li>
            <strong>Leslie</strong>. Healed hit points are reverted after combat. Your ship may end
            up being destroyed after combat, even if you had remaining hit points at the end of
            combat. Works most likely by increasing your maximum hit points (see below) - should
            only activate if you are below 35% HHP, but in long fights, he keeps activating at
            higher and higher remaining hit points thresholds, up to the point where you end combat
            with more hit points than you started.
          </li>
          <li>
            <strong>Spock</strong>. Healed hit points are not reverted. Can overcharge shields,
            where you end up with more SHP than your maximum SHP. The overcharged shields do not
            decay over time, you keep them until the next combat. Has no effect if you start combat
            with more SHP than your maximum SHP (Spock doesn't regenerate any SHP in that case).
          </li>
          <li>
            <strong>Moreau</strong>. Similar to Spock. Can overcharge shields, but doesn't do
            anything if shields are already overcharged.
          </li>
          <li>
            <strong>Vemet</strong>. TODO.
          </li>
          <li>
            <strong>Eurydice</strong>. TODO.
          </li>
          <li>
            <strong>Enterprise ship ability</strong>. TODO.
          </li>
          <li>
            <strong>Ex-borg combat repair favors</strong>. TODO.
          </li>
          <li>
            <strong>Burning Status</strong>. TODO.
          </li>
          <li>
            <strong>Tal</strong>. TODO.
          </li>
          <li>
            <strong>Severus</strong>. TODO.
          </li>
        </Typography>
        <Typography paragraph>Unconfirmed theory: the game tracks two different stats</Typography>
        <Typography component="ul" gutterBottom>
          <li>
            <strong>Maximum hit points</strong>. Your maximum hit points, calculated from different
            buffs, see {makeLink(titleEffectStacking, "effect stacking")}.
          </li>
          <li>
            <strong>Damage taken</strong>. The cumulative amount of damage taken since you fully
            repaired your ship. Can be negative, which leads for example to overcharging shields
            beyond their maximum shield hit points.
          </li>
        </Typography>
        <Typography paragraph>
          The remaining hit points is simply the difference between those two numbers. Some effects
          "heal" hit points by giving you a temporary buff to maximum hit points. Such buffs are
          removed at the end of combat and the "healed" hit points are lost.
        </Typography>
      </>
    ),
  },
  {
    title: titleIsoDamage,
    content: (
      <>
        <Typography paragraph>The isolitic damage of a weapon attack is given by:</Typography>
        <Typography paragraph>
          <code>isolitic_damage = A*(B + (1 + B)*C)</code>
        </Typography>
        <Typography paragraph>where</Typography>
        <Typography component="ul" gutterBottom>
          <li>
            <strong>A</strong> is the total regular attack damage (after all damage modifiers,
            including the critical damage multiplier, have been applied)
          </li>
          <li>
            <strong>B</strong> is the attackers isolitic damage bonus
          </li>
          <li>
            <strong>C</strong> is the attackers isolitic cascade damage bonus
          </li>
        </Typography>
      </>
    ),
  },
  {
    title: titleMitigation,
    content: (
      <>
        <Typography paragraph>
          Ships "mitigate" a certain portion of incoming damage. Mitigated damage is harmless, a
          ship with 100% mitigation would be immune to regular damage. Incoming damage has two
          components: regular and isolitic damage.
        </Typography>
        <Typography paragraph>
          The portion of regular damage that is mitigated is given by:
        </Typography>
        <Typography paragraph>
          <code>
            mitigation = 1 - (1 - cA * f(dA / pA)) * (1 - cS * f(dS / pS)) * (1 - cD * f(dD / pD))
          </code>
        </Typography>
        <Typography paragraph>where</Typography>
        <Typography component="ul" gutterBottom>
          <li>
            <strong>f</strong> is <code>f(x) = 1 / (1 + 4^(1.1 - x))</code>
          </li>
          <li>
            <strong>dA</strong> is the defenders armor stat
          </li>
          <li>
            <strong>dS</strong> is the defenders shield deflection stat
          </li>
          <li>
            <strong>dD</strong> is the defenders dodge stat
          </li>
          <li>
            <strong>pA</strong> is the attackers armor piercing stat or 0, whichever is higher
          </li>
          <li>
            <strong>pS</strong> is the attackers shield piercing stat or 0, whichever is higher
          </li>
          <li>
            <strong>pD</strong> is the attackers accuracy stat or 0, whichever is higher
          </li>
          <li>
            <strong>[cA, cS, cD]</strong> is equal to <code>[0.3, 0.3, 0.3]</code> for surveys and
            armadas, <code>[0.55, 0.2, 0.2]</code> for battleships, <code>[0.2, 0.55, 0.2]</code>{" "}
            for explorers, and <code>[0.2, 0.2, 0.55]</code> for interceptors.
          </li>
        </Typography>
        <Typography paragraph>
          You can use the <a href="/mitigation">mitigation calculator</a> on this site to compute
          the above for given input values.
        </Typography>
      </>
    ),
  },
  {
    title: titleIsoMitigation,
    content: (
      <>
        <Typography paragraph>
          The portion of isolitic damage that is mitigated is given by:
        </Typography>
        <Typography paragraph>
          <code>isolitic_mitigation = 1 / (1 + isolitic_defense)</code>
        </Typography>
        <Typography paragraph>where</Typography>
        <Typography component="ul" gutterBottom>
          <li>
            <strong>isolitic_defense</strong> is the defenders isolitic defense stat
          </li>
        </Typography>
      </>
    ),
  },
  {
    title: titleApexBarrier,
    content: (
      <>
        <Typography paragraph>
          After mitigated damage has been removed, the remaining unmitigated isolitic and regular is
          added up and reduced by apex barrier. The damage reduction is equal to
        </Typography>
        <Typography paragraph>
          <code>apex_barrier_damage_reduction = 10000 / (10000 + apex_barrier)</code>
        </Typography>
        <Typography paragraph>
          I.e., every 10000 apex barrier, your ship will be able to take 100% more damage.
        </Typography>
      </>
    ),
  },
  {
    title: titleShieldMitigation,
    content: (
      <>
        <Typography paragraph>
          After unmitigated damage has been reduced by apex barrier, the remaining damage is
          distributed to the targets shield and hull hit points:
        </Typography>
        <Typography paragraph>
          <code>shp_damage_taken = S * total_unmitigated_damage</code>
          <br />
          <code>hhp_damage_taken = (1 - S) * total_unmitigated_damage</code>
        </Typography>
        <Typography paragraph>where</Typography>
        <Typography component="ul" gutterBottom>
          <li>
            <strong>S</strong> is the defenders shield mitigation stat
          </li>
        </Typography>
        <Typography paragraph>Notes:</Typography>
        <Typography component="ul" gutterBottom>
          <li>
            "Shield mitigation" has nothing to do with "{makeLink(titleMitigation, "mitigation")}",
            that's just named confusingly.
          </li>
          <li>
            The shield mitigation coefficient is given by the ships shield{" "}
            {makeLink(titleShipComponents, "component")}.
          </li>
          <li>
            For almost all ships in the game, the base shield mitigation coefficient is 0.8, i.e.,
            80% of the unmitigated damage is absorbed by the shields and 20% of the unmitigated
            damage damages the hull. The notable excemption is the Sarcophagus, which only has a 20%
            base shield mitigation.
          </li>
          <li>
            TODO: Effects that affect shield mitigation: Harrison (multiplicative), Fat Mudd
            (additive, fixed 18%), 1of11 (additive), SNW Pike (additive), Janeway (additive),
            Cerritos buff (additive), Titan buff (additive), ST Una (??)
          </li>
        </Typography>
      </>
    ),
  },
  {
    title: titleWeaponFiringPattern,
    content: (
      <>
        <Typography paragraph>
          Weapons have three stats that affect its firing pattern: the load time, the reload time,
          and the number of shots. The load time defines the first round in which the weapon
          performs an attack, and the reload time defines how many rounds have to pass until the
          weapon attacks again. When a weapon attacks, it fires a number of shots, all at the same
          target.
        </Typography>
        <Typography paragraph>
          The load time, the reload time, and the number fo shots are simple stats that are affected
          by {makeLink(titleEffectStacking, "effect stacking")} like any other stat.
        </Typography>
        <Typography paragraph>
          Changing a weapons load or reload time doesn't have any immediate effect. When a weapon
          fires an attack, it inspects the <i>current</i> value of its reload time and schedules the
          next attack according to that value. Any subsequent changes to its reload time do not move
          the next scheduled attack.
        </Typography>
        <Typography paragraph>
          Example: <a href="https://stfc.space/officers/1730335425">Chang</a>'s officer ability is
          poorly described, a better description would be: "On each shot fired by your ship, if that
          shot is a critical hit AND the target has Hull Breach, X% chance to activate Chang for the
          next sub-round. At the start of each sub-round, if Chang is active, add +1 to the reload
          time of ALL target weapons. This effect stacks with itself and lasts until the end of the
          current round.". This allows you to predict all edge cases: Chang has no effect on weapons
          that are currently reloading, Chang can never delay the first weapon of the opponent
          unless he activated in the last sub-round of the previous round, Chang can delay a weapon
          by multiple rounds if he applied his effect multiple times in the same round before the
          weapon fired.
        </Typography>
        <Typography paragraph>
          The number of shots is rounded to the nearest whole number, using "round to half even" to
          break ties. I.e., 0.5 is rounded to 0, 1.5 is rounded to 2, 2.5 is rounded to 2, 3.5 is
          rounded to 4, ...
        </Typography>
      </>
    ),
  },
  {
    title: titleBorgCubeBeamCharge,
    content: (
      <>
        <Typography paragraph>
          After a regular combat against a ship (TODO: does it charge against other kinds of
          targets?), your beam charge increases by
        </Typography>
        <Typography paragraph>
          <code>
            charge_gained = 0.1 * hull_damage_done / beam_damage * (1 + charge_optimization_bonus)
          </code>
        </Typography>
      </>
    ),
  },
  {
    title: titleShipPower,
    content: (
      <>
        <Typography paragraph>
          The power of a ship (both player ships and NPCs) is calculated as
        </Typography>
        <Typography paragraph>
          <code>ship_power = attack_rating + defense_rating + health_rating + ft_rating</code>
          <br />
          <code>
            attack_rating = total_damage_per_round + 0.5 * (armor_piercing + shield_piercing +
            accuracy)
          </code>
          <br />
          <code>defense_rating = 5 * (armor + shield_deflection + dodge)</code>
          <br />
          <code>health_rating = 0.5 * HHP + 0.5 * SHP</code>
          <br />
          <code>
            damage_per_round = (min_damage + max_damage)/2 * shots / reload_time * (1 + crit_chance
            * crit_damage)
          </code>
        </Typography>
        <Typography paragraph>where </Typography>
        <Typography component="ul" gutterBottom>
          <li>
            <strong>damage_per_round</strong> is the estimated damage per round of a single weapon
          </li>
          <li>
            <strong>total_damage_per_round</strong> is the sum of damage_per_round of all weapons
          </li>
          <li>
            <strong>ft_rating</strong> is given by the equipped Forbidden Tech, with the exact
            formula unknown
          </li>
        </Typography>
        <Typography paragraph>Notes:</Typography>
        <Typography component="ul" gutterBottom>
          <li>
            The formula for the damage per round has as bug in it, it overestimates the effect of
            critical hits.
          </li>
          <li>
            The ship power rating only considers effects that apply at all times. Research that
            applies only against specific targets is not included in the power rating.
          </li>
          <li>
            The ship power rating is fully calculated client side, and is affected by several bugs.
          </li>
          <li>The ship power rating is a mostly meaningless number.</li>
        </Typography>
      </>
    ),
  },
  {
    title: titleClientSideCalculations,
    content: (
      <>
        <Typography paragraph>
          Almost all numbers that you see in the game are calculated by your game client. For
          example, if you see an enemy ship in the combat log, the game server doesn't tell you:
        </Typography>
        <Typography paragraph>
          <i>Hey, your target was a T5 Augur with 4.5M ship power and 2M hit points.</i>
        </Typography>
        <Typography paragraph>Instead, the game server tells your game client:</Typography>
        <Typography paragraph>
          <i>
            Hey, I'm going to give you the following information about the target: the tier and
            level of the ship hull, the tier of all ship components, the tier and level of all
            bridge and below deck officers, the complete list of all research that currently affects
            the ship. Now go figure out yourself the actual values of the stats of that ship.
          </i>
        </Typography>
        <Typography paragraph>
          Since this calculation may contain bugs (like the game server and client disagreeing
          whether a given research should apply to a ship), almost all numbers visible in the game
          are not reliable. The only numbers I would personally trust are the damage numbers in
          combat logs (i.e., how much damage an individual weapon shot did). All other stats should
          be reverse engineered from that.
        </Typography>
      </>
    ),
  },
  {
    title: titleEfficiency,
    content: (
      <>
        <Typography paragraph>
          Some effects decrease the cost or speed of upgrading buildings/ships/research or repairing
          ships. They are usually described as something like "Increases the base cost efficiency of
          X by Y%."
        </Typography>
        <Typography paragraph>
          Efficiency is a stat subject to {makeLink(titleEffectStacking, "effect stacking")}, with a
          base value of 1. The actual cost is then
        </Typography>
        <Typography paragraph>
          <code>actual_cost = base_cost/efficiency</code>
        </Typography>
        <Typography paragraph>
          Most (but not all) efficiency bonuses are in stacking category A, so for most cases the
          above simplifies to
        </Typography>
        <Typography paragraph>
          <code>actual_cost = base_cost/(1 + sum of efficiency bonuses)</code>
        </Typography>
      </>
    ),
  },
  {
    title: titleTodo,
    content: (
      <Typography component="ul" gutterBottom>
        <li>Changing officer health bonus in combat</li>
        <li>Warp path mechanics</li>
        <li>Combat simulator prototype in TypeScript</li>
      </Typography>
    ),
  },
];

export function GameMechanics() {
  return (
    <Frame title="STFC Game Mechanics">
      <p>
        This page describes the mechanics of STFC combat. It is presented as a randomly sorted list
        of interesting details, and is meant to be used as a reference, not as an introduction to
        game mechanics.
      </p>
      <Stack spacing={2}>
        {entries.map((entryData) => (
          <Card variant="outlined" id={entryData.title.id} key={entryData.title.id}>
            <CardHeader title={entryData.title.name} />
            <CardContent>{entryData.content}</CardContent>
          </Card>
        ))}
      </Stack>
    </Frame>
  );
}
