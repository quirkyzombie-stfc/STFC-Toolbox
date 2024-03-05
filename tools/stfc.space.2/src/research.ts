import fs from "fs";
import path from "path";

import stringify from "json-stringify-pretty-compact";

import { lookupName } from "./database";
import { ApiAllData } from "./types";
import { RawActiveBuff, RawCombatLog } from "../../transform/src/inputTypes";

const inputFolderJ = "/Users/crobi/Downloads/exports/journals";
const inputFolderO = "/Users/crobi/Downloads/exports/other";

const playerNames: {[id: string]: string} = {
    /*
    "nf524b0db74c401fb39adcd870d7f245": "Gungan",
    "we70939fe4874780914fa3f31ff4686a": "Bractor",
    "o50f32e8a0754cc08de0e67475acbb9d": "fun74",
    "pfe3e634be784a8dac8aeab6e71567f4": "Cronos",
    "m5731a3271ca43bfa3a768e51e0bec49": "Reim",
    "ue653326b0264e478dfdc5191b990d28": "PrepareUranusWorf",
    "gf5eddf0ba1d42e2ae0907d3f9c88dde": "Chiro",
    "w568e711b6454f2d90191a4979f2e580": "Buttercup",
    "rc52d23ce85f479590be93c96ae75f0e": "Sensai",
    "q39e727f9fd04213aab73995a4b013ab": "Baerchen",
    "v1d8e04f444c444882b42ecb479fe975": "MorbidAngel",
    "red13577d4c24792935b840a2d686997": "Murv",
    "k710af8cd25249d09074bfd5e5ee7819": "Viking",
    "i7636792090f4f04a7699a0c5bf7745e": "KalterKelte",
    "dd33b999c1b34d2181777107e327966d": "RaidBeard",
    "z2268788e99840efb491ba39abef30c4": "Tatalus",
    "d531e402a6fc454a974346690409aa73": "xMando",
    */
}

function getPlayerName(id: string) {
    return playerNames[id] || id;
}

const ignoredPlayers = [
    "x8b59d04264549b0b8b72658e09297c9", // QZ
    "y2bc3ad0a42248f282a7e7ef8435b4d8", // OC
];

function listFiles(dir: string): string[] {
    const files: string[] = fs.readdirSync(dir);
    let result: string[] = [];

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            result = [...result, ...listFiles(filePath)];
        }
        else {
            result = [...result, filePath];
        }
    });

    return result;
};

interface Research {
    id: number,
    name: string,
    buffs: number[],
    max_level: number,
}

function findPlayerNames(file: string) {
    try {
        const data: any = JSON.parse(fs.readFileSync(file, "utf8"));
        if (data.quick_scan_results !== undefined) {
            Object.values(data.quick_scan_results).forEach((v: any) => {
                const id = v?.attributes?.owner_user_id;
                const name = v?.attributes?.owner_name;
                if (id !== undefined && name !== undefined) {
                    playerNames[id] = name;
                }
            })
        }
    } catch(e) {
        console.error(`Error processing ${file}`, e)
    }
}

function listAllResearch(data: ApiAllData): Research[] {
    const entries = data.lresearch.map(r => ({
        id: r.id,
        name: lookupName(data.tresearch, r.id, "name"),
        buffs: r.buffs.map(b => b.id),
        max_level: r.max_level,
    }));
    return entries;
}

function exportResearchFromCombatLog(file: string, allResearch: Research[]) {
    try {
        const log: {journal: RawCombatLog} = JSON.parse(fs.readFileSync(file, "utf8"));
        const j = log.journal;

        return [
            ...exportResearchFrom(j.initiator_fleet_data.deployed_fleet.active_buffs, j.initiator_id, allResearch),
            ...exportResearchFrom(j.target_fleet_data.deployed_fleet.active_buffs, j.target_id, allResearch),
        ]
    } catch(e) {
        console.error(`Error processing ${file}`, e);
        return [];
    }
}

function exportResearchFrom(buffs: RawActiveBuff[], id: string, allResearch: Research[]) {
    const result = allResearch.map(r => {
        const buff = buffs.find(b => r.buffs.includes(b.buff_id));
        const level = (buff !== undefined) ? buff.ranks[buff.ranks.length - 1] + 1 : undefined;
        return level;
    });
    if (id.length < 30 || ignoredPlayers.includes(id)) {
        return [];
    } else {
        return [{id: id, result: result}];
    }
    
}

const data: ApiAllData = JSON.parse(fs.readFileSync("./out/all.json", "utf8"));
const allResearch = listAllResearch(data);

const otherFiles = listFiles(inputFolderO);
otherFiles.forEach(findPlayerNames);
fs.writeFileSync("./out/playerNames.json", stringify(playerNames));

const combatLogs = listFiles(inputFolderJ);
const allPlayers: {[id: string]: (number | undefined)[]} = {};
combatLogs.forEach(x => exportResearchFromCombatLog(x, allResearch).forEach(player => {
    if (allPlayers[player.id] === undefined) {
        allPlayers[player.id] = player.result;
    } else {
        allPlayers[player.id].forEach((oldValue, i) => {
            const newValue = player.result[i];
            if (oldValue === undefined) {
                allPlayers[player.id][i] = newValue;
            } else if (newValue === undefined) {
                allPlayers[player.id][i] = oldValue;
            } else {
                allPlayers[player.id][i] = Math.max(oldValue, newValue);
            }
        })
    }
}));
const columns = Object.keys(allPlayers).map(k => [k, ...allPlayers[k]]);

var result = "";

for (var r=0; r < allResearch.length + 1; ++r) {
    if (r === 0) {
        result += `"Research", `;
        for (var c=0; c < columns.length; ++c) {
            result += `"${getPlayerName(columns[c][r] as string)}", `;
        }
        result += "\n";
    } else {
        var nonEmpty: number = 0;
        for (var c=1; c < columns.length; ++c) {
            const value = columns[c][r];
            if (value !== undefined) nonEmpty++;
        }

        const research = allResearch[r - 1];

        if (nonEmpty > 0) {
            result += `"${research.name}", `;
            for (var c=0; c < columns.length; ++c) {
                const value = columns[c][r];
                result += value === undefined ? `"", ` : `"${value}/${research.max_level}", `;
            }
            result += "\n";
        } else {
            console.log(`Ignoring research ${research.name}`)
        }
    }
}

fs.writeFileSync("./out/enemyResearch.csv", result);
