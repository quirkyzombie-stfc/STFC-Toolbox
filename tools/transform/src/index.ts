import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import moment from 'moment';
import { RawCombatLog, RawFleetData, JournalsGetMessage } from "./inputTypes";
import { CombatLog, CombatLogShip, CombatLogActiveBuff, CombatLogRound, CombatLogDatabase, CombatLogDatabaseEntry, CombatLogDatabaseShip, CombatLogShipComponent } from "./outputTypes";
import * as Constants from "./constants";
import { battleType, activatorName, effectName } from "./constants";

import loc_ships from './localization/ships.json';
import loc_hostiles from './localization/hostiles.json';
import loc_officers from './localization/officers.json';
import loc_lhostiles from './localization/lhostile.json';
import loc_materials from './localization/materials.json';
import loc_research from './localization/research.json';
import loc_building_buffs from './localization/building_buffs.json';
import loc_components from './localization/components.json';

const inputFilePath = "./../data/raw";
const outputFilePathTransformed = "./../data/transformed";
const outputFilePathIndex = "./../data/index";
const outputFilePathOriginal = "./../data/original";

// Only process these input files
const inputFilePathPattern = /(.*)[/]journals_get[/](.*)[.]json$/;

const timePrefix = moment().format('YYYYMMDD');

// Lists all files in a directory in Node.js recursively in a synchronous fashion
function listFiles(dir: string, pattern: RegExp): string[] {
    const files: string[] = fs.readdirSync(dir);
    let result: string[] = [];

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            result = [...result, ...listFiles(filePath, pattern)];
        }
        else if (pattern.test(filePath)) {
            result = [...result, filePath];
        }
    });

    return result;
};

function getHash(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

class IdMapper {
    private shipIds: Map<string, string> = new Map();
    private playerIds: Map<string, string> = new Map();
    private fleetIds: Map<string, string> = new Map();

    private getOrSet(originalName: string, map: Map<string, string>, prefix: string): string {
        if (map.has(originalName)) {
            return map.get(originalName) as string;
        } else {
            const newName = `${prefix} ${map.size + 1}`;
            map.set(originalName, newName);
            return newName;
        }
    }

    shipId(originalName: string): string {
        return this.getOrSet(originalName, this.shipIds, "Ship");
    }

    playerId(originalName: string): string {
        return this.getOrSet(originalName, this.playerIds, "Player");
    }

    fleetId(originalName: string): string {
        return this.getOrSet(originalName, this.fleetIds, "Fleet");
    }
}

function getShipName(hullId: number | undefined, locaId: number | undefined, level: number): string {
    if (!!locaId) {
        const keyS = "" + locaId as (keyof typeof loc_ships);
        const keyH = "" + locaId as (keyof typeof loc_hostiles);
        return `${loc_ships[keyS] || loc_hostiles[keyH] || `#${locaId}`} (${level})`
    } else if (!!hullId) {
        const key = "" + hullId as (keyof typeof loc_ships);
        return `${loc_ships[key] || `#${key}`}`
    } else {
        return "Unknown ship";
    }
}

function getShipLevel(locaId: number | undefined, power: number, level: number): number {
    if (!!locaId) {
        let result = level;
        let bestMatch = Infinity;
        loc_lhostiles.forEach(x => {
            const powerDiff = Math.abs(x.strength - power);
            if (x.loca_id == locaId && powerDiff < bestMatch) {
                bestMatch = powerDiff;
                result = x.level;
            }
        });
        return result;
    } else {
        return level;
    }
}

function getOfficerName(id: number): string {
    const key = "" + id as (keyof typeof loc_officers);
    return `${loc_officers[key] || `#${key}`}`
}

function getMaterialName(id: number): string {
    const key = "" + id as (keyof typeof loc_materials);
    return `${loc_materials[key] || `#${key}`}`
}

function getBuffName(id: number): string {
    const rkey = "" + id as (keyof typeof loc_research);
    const bkey = "" + id as (keyof typeof loc_building_buffs);
    return `${loc_research[rkey] || loc_building_buffs[bkey] || `#${id}`}`
}

function getComponent(id: number): CombatLogShipComponent | null {
    if (id === null || id === undefined || id < 0) {
        return null;
    }
    else {
        const key = "" + id as (keyof typeof loc_components);
        return loc_components[key] as CombatLogShipComponent || null;
    }
}

function addWeaponIndices(components: (CombatLogShipComponent|null)[]): CombatLogShipComponent[] {
    const nonMissing: CombatLogShipComponent[] = components.filter(x => x !== null) as CombatLogShipComponent[];
    return nonMissing.map((component, index) =>
        component.name === "Weapon"
            ? {...component, name: `Weapon ${nonMissing.filter((component2, index2) => component2.name===component.name && index2<=index).length}`}
            : component
    );
}

function gatherShipData(input: RawFleetData, idMapper: IdMapper, side: 'initiator' | 'target'): CombatLogShip[] {
    const result: CombatLogShip[] = [];

    // Ship attributes are indexed in many different ways
    // - Index (e.g., `input.final_ship_hps[i]`)
    // - Ship ID (e.g., appears in `battle_log`)
    // - Fleet ID (e.g., `input.deployed_fleets[fleet_id]`)
    // - Ship Info ID (e.g., `input.deployed_fleets[fleet_id].ship_tiers[info_id]`)
    // It's unclear how those would relate in a multi-ship battle, so just always take
    // the first one.
    for (const fleetId in input.deployed_fleets) {
        const fleetInfo = input.deployed_fleets[fleetId];
        const infoId = Object.keys(fleetInfo.ship_hps)[0];
        const shipId = fleetInfo.ship_ids[0];
        const playerId = fleetInfo.uid;
        const infoIndex = input.ship_ids.findIndex((idx) => idx === shipId);

        const level = getShipLevel(input.ref_ids?.loca_id, fleetInfo.offense_rating + fleetInfo.defense_rating + fleetInfo.health_rating, fleetInfo.ship_levels[infoId]);
        const name = getShipName(fleetInfo.hull_ids[0], input.ref_ids?.loca_id, level);

        result.push({
            ship_id: idMapper.shipId(""+shipId),
            fleet_id: idMapper.fleetId(fleetId),
            player_id: idMapper.playerId(playerId),
            info_id: infoId,
            hull_name: name,
            tier: fleetInfo.ship_tiers[infoId],
            level: level,
            side: side,
            hit_points: {
                shp_max: input.max_ship_shps[infoIndex],
                shp_initial: input.initial_ship_shps[infoIndex],
                shp_final: input.final_ship_shps[infoIndex],
                hhp_max: input.max_ship_hps[infoIndex],
                hhp_initial: input.initial_ship_hps[infoIndex],
                hhp_final: input.final_ship_hps[infoIndex],
            },
            officer_bonus: {
                attack: fleetInfo.attributes[Constants.Attributes.OFFICER_ATTACK_BONUS],
                defense: fleetInfo.attributes[Constants.Attributes.OFFICER_DEFENSE_BONUS],
                health: fleetInfo.attributes[Constants.Attributes.OFFICER_HEALTH_BONUS],
            },
            stats: {
                armor: fleetInfo.ship_stats[infoId][Constants.Stats.ARMOR],
                shield_deflection: fleetInfo.ship_stats[infoId][Constants.Stats.SHIELD_DEFLECTION],
                dodge: fleetInfo.ship_stats[infoId][Constants.Stats.DODGE],
                armor_piercing: fleetInfo.ship_stats[infoId][Constants.Stats.ARMOR_PIERCING],
                shield_piercing: fleetInfo.ship_stats[infoId][Constants.Stats.SHIELD_PIERCING],
                accuracy: fleetInfo.ship_stats[infoId][Constants.Stats.ACCURACY],
            },
            components: addWeaponIndices(fleetInfo.ship_components[infoId].map(getComponent)),
            rating: {
                offense: fleetInfo.offense_rating,
                defense: fleetInfo.defense_rating,
                health: fleetInfo.health_rating,
                officer: fleetInfo.officer_rating,
                deflector: fleetInfo.deflector_rating,
                sensor: fleetInfo.sensor_rating,
            },
            officers: (input.fleets_officers[fleetId] || [])
                //.filter(e => e !== null && e !== undefined)
                .map((rawOfficer) => !!rawOfficer ? {
                    name: getOfficerName(rawOfficer.id),
                    rank: rawOfficer.rank,
                    level: rawOfficer.level,
                } : null),
            active_buffs: (fleetInfo.active_buffs || [])
                .map((ab) => ({
                    name: ""+ab.buff_id,
                    ranks: ab.ranks,
                    activator_id: getBuffName(ab.activator_id),
                    attributes: ab.attributes,
                    expiry_time: ab.expiry_time,
                    activation_time: ab.activation_time,
                } as CombatLogActiveBuff)),
        })
    }
    return result;
}

function parseBattleLog(input: number[], idMapper: IdMapper): CombatLogRound[] {
    let i = 0;
    const readTag = () => {
        const result = input[i];
        i++;
        return result;
    }
    const readData = () => {
        const result = [];
        while (input[i] >= 0 && i < input.length) {
            result.push(input[i]);
            i++;
        }
        return result;
    }

    const state = {
        completedRounds: [] as CombatLogRound[],
        currentRound: {round: 1, events: []} as CombatLogRound,
        shipIds: {} as {[key: number]: string},
        componentId: "",
    }
    const setShipId = (data: number[], forTag: number) => {
        if (data.length > 0) {
            state.shipIds[forTag] = ""+data[0];
        } else {
            state.shipIds[forTag] = "";
        }
    }

    while (i < input.length) {
        const tag = readTag();
        const data = readData();
        switch (tag) {
            case Constants.CombatLogEvent.START_ROUND:
                state.currentRound = {round: state.completedRounds.length + 1, events: []};
                break;
            case Constants.CombatLogEvent.END_ROUND:
                state.completedRounds.push({...state.currentRound});
                break;

            case -85: // for -86
                setShipId(data, 86)
                break;
            case Constants.CombatLogEvent.OFFICER_ABILITIES_APPLIED_START:
                setShipId(data, 86)
                break;
            case -87: // for -98
                setShipId(data, 98)
                break;
            case -99: // for -98
                setShipId(data, 98)
                break;
            case -93: // for -91
                setShipId(data, 91)
                break;

            case Constants.CombatLogEvent.OFFICER_ABILITY_START:
                state.currentRound.events.push({
                    type: 'ability',
                    ship: idMapper.shipId(state.shipIds[91]),
                    officer: activatorName(data[0]),
                    ability: effectName(data[1]),
                    value: data[2],
                })
                break;
            case Constants.CombatLogEvent.OFFICER_ABILITY_APPLIED_START:
                state.currentRound.events.push({
                    type: 'ability',
                    ship: idMapper.shipId(state.shipIds[86]),
                    officer: activatorName(data[0]),
                    ability: effectName(data[1]),
                    value: data[2],
                })
                break;

            case Constants.CombatLogEvent.START_ATTACK:
                if (data.length === 1) {
                    state.componentId = ""+data[0];
                }
                else if (data.length >= 10) {
                    state.currentRound.events.push({
                        type: 'attack',
                        ship: idMapper.shipId(state.shipIds[98]),
                        weapon: ""+data[0],
                        target: idMapper.shipId(""+data[1]),
                        f1: data[2],
                        f2: data[3],
                        f3: data[4],
                        crit: data[5] === 1,
                        damage_taken_hull: data[6],
                        remaining_hull: data[7],
                        damage_taken_shield: data[8],
                        remaining_shield: data[9],
                        damage_mitigated: data[10],
                    })
                }
                break;
            case Constants.CombatLogEvent.ATTACK_CHARGE:
                state.currentRound.events.push({
                    type: 'charge',
                    ship: idMapper.shipId(state.shipIds[98]),
                    weapon: state.componentId,
                    charge: data[0],
                })
                break;
            default:
                if (data.length > 0) {
                    console.warn(`Skipping unknown log entry ${tag} [${data.join(", ")}]`);
                }
        }
    }

    return state.completedRounds;
}

function transform(input: RawCombatLog): CombatLog {
    const idMapper = new IdMapper();

    const initiatorShips = gatherShipData(input.initiator_fleet_data, idMapper, 'initiator');
    const targetShips = gatherShipData(input.target_fleet_data, idMapper, 'target');
    const battleLog = parseBattleLog(input.battle_log, idMapper);


    const initiator_loot = Object.entries<number>(input.initiator_fleet_data.final_cargo?.resources || {})
        .map(row => ({
            name: getMaterialName(+row[0]),
            amount: row[1],
        }));
    const target_loot = Object.entries<number>(input.target_fleet_data.final_cargo?.resources || {})
        .map(row => ({
            name: getMaterialName(+row[0]),
            amount: row[1],
        }));

    return {
        initiator_fired_first: input.initiator_fired_first,
        initiator_wins: input.initiator_wins,
        time: input.battle_time,
        type: battleType(input.battle_type),
        ships: [...initiatorShips, ...targetShips],
        log: battleLog,
        loot: {
            "initiator": initiator_loot,
            "target": target_loot,
        }
    };
}

function saveOriginal(content: Buffer) {
    const hash = getHash(content);
    const outputFile = path.join(outputFilePathOriginal, hash + ".json");
    fs.writeFileSync(outputFile, content);
    return hash;
}

function saveTransformed(data: CombatLog, splitHash: string) {
    const content = JSON.stringify(data, undefined, "  ");
    const hash = getHash(content);
    const outputFile = path.join(outputFilePathTransformed, splitHash + ".json");
    fs.writeFileSync(outputFile, content);
    return hash;
}

function loadCache(): Set<string> {
    try {
        const outputFile = path.join(inputFilePath, 'cache.txt');
        const files = fs.readFileSync(outputFile).toString().split("\n");
        const result: Set<string> = new Set();
        files.forEach((f) => result.add(f));
        return result;
    } catch {
        return new Set();
    }
}

function saveCache(set: Set<string>) {
    const outputFile = path.join(inputFilePath, 'cache.txt');

    const lines: string[] = [];
    set.forEach((f) => lines.push(f));
    fs.writeFileSync(outputFile, lines.join("\n"));
}

function saveDatabase(db: CombatLogDatabase, prefix: string, filter: (e:CombatLogDatabaseEntry) => boolean) {
    // Sort by time by default
    const contentO = db.logs
        .sort((a, b) => a.time > b.time ? -1 : a.time < b.time ? 1 : 0)
        .filter(filter)
        .map((log) => {
            const blinded: Partial<CombatLogDatabaseEntry> = {...log};
            delete blinded.transformed_id;
            return blinded;
        });
    const content = JSON.stringify(contentO, undefined, "  ");
    const hash = getHash(content);
    const outputFile = path.join(outputFilePathIndex, `${timePrefix}-${prefix}-${hash}.json`);
    fs.writeFileSync(outputFile, content);
}
function saveFullDatabase(db: CombatLogDatabase) {
    // Sort by time by default
    const contentO = {...db};
    contentO.logs = contentO.logs.sort((a, b) => a.time > b.time ? -1 : a.time < b.time ? 1 : 0);
    const content = JSON.stringify(contentO, undefined, "  ");
    const hash = getHash(content);
    const outputFile = path.join(outputFilePathIndex, `${timePrefix}-full-${hash}.json`);
    fs.writeFileSync(outputFile, content);
}

function registerLog(combatLog: CombatLog, db: CombatLogDatabase, originalHash: string, transformedHash: string) {
    if (db.logs.some((other) => other.id === originalHash)) {
        return;
    }

    const ships: CombatLogDatabaseShip[] = combatLog.ships.map((ship) => 
        ({
            name: ship.hull_name,
            tier: ship.tier,
            level: ship.level,
            officers: [ship.officers[0], ship.officers[1], ship.officers[2]].map(x => x?.name || ""),
            side: ship.side,
            hhp_lost: ship.hit_points.hhp_initial - ship.hit_points.hhp_final,
            hhp_max: ship.hit_points.hhp_max,
        } as CombatLogDatabaseShip)
    );

    db.logs.push({
        time: combatLog.time,
        id: originalHash,
        transformed_id: transformedHash,
        type: combatLog.type,
        rounds: combatLog.log.length,
        ships: ships,
        intiator_wins: combatLog.initiator_wins,
    })
}

async function main() {
    const skipFiles: Set<string> = loadCache();
    const dataFilesPaths = listFiles(inputFilePath, inputFilePathPattern)
        .filter((dataFilePath) => !skipFiles.has(dataFilePath))
    const database: CombatLogDatabase = { logs: []};

    let exceptions: number = 0;
    dataFilesPaths
        .forEach((dataFilePath) => {
            console.debug(`Transforming file ${dataFilePath}`);
            try {
                const buffer = fs.readFileSync(dataFilePath);
                const originalHash = saveOriginal(buffer);

                const rawLog = (JSON.parse(buffer.toString()) as JournalsGetMessage).journal;
                const combatLog = transform(rawLog);
                const transformedHash = saveTransformed(combatLog, originalHash);
                registerLog(combatLog, database, originalHash, transformedHash)
            } catch (e) {
                exceptions++;
                skipFiles.add(dataFilePath);
                console.warn(`Failed to transform file ${dataFilePath}: ${e}`);
            }
        });
    saveDatabase(database, "all", (_) => true);
    saveDatabase(database, "arm", (e) => e.type == "armada");
    saveDatabase(database, "pvp", (e) => e.type == "pvp");
    saveDatabase(database, "pve", (e) => e.type == "pve");
    saveFullDatabase(database);
    saveCache(skipFiles);
    console.log(`
Summary
-------
- Input files: ${dataFilesPaths.length}
- Failures: ${exceptions}
- Output files: ${database.logs.length}
- Skip files: ${skipFiles.size}
`);
}

main();
