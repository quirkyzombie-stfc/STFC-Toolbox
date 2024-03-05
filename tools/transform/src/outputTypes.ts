export type Dictionary<Key extends string | number, Value> = {[key in Key]: Value};

// ----------------------------------------------------------------------------
// Combat log output JSON
// ----------------------------------------------------------------------------

export interface CombatLogOfficer {
    name: string,
    level: number,
    rank: number,
}

export interface CombatLogActiveBuff {
    name: string,
    ranks: number[],
    activator_id: string,
    attributes: {},
    expiry_time: string | null,
    activation_time: string,
}

export interface CombatLogMaterial {
    name: string,
    amount: number,
}

export type CombatLogSide = 'initiator' | 'target';

export interface CombatLogShip {
    ship_id: string,
    fleet_id: string,
    player_id: string,
    info_id: string,
    hull_name: string,
    tier: number,
    level: number,
    side: CombatLogSide,
    hit_points: {
        shp_max: number,
        shp_initial: number,
        shp_final: number,
        hhp_max: number,
        hhp_initial: number,
        hhp_final: number,
    },
    officer_bonus: {
        attack: number,
        defense: number,
        health: number,
    },
    stats: {
        armor: number,
        shield_deflection: number,
        dodge: number,
        armor_piercing: number,
        shield_piercing: number,
        accuracy: number,
    },
    components: CombatLogShipComponent[],
    rating: {
        offense: number,
        defense: number,
        health: number,
        officer: number,
        deflector: number,
        sensor: number,
    },
    active_buffs: CombatLogActiveBuff[],
    officers: (CombatLogOfficer | null)[],
}

export interface CombatLogShipComponent {
    name: string,
    data:
      | {
          tag: "Warp";
          speed: number;
          distance: number;
          instant_warp_cost: number | null;
          tow_multiplier: number | null;
        }
      | {
          tag: "Impulse";
          impulse: number;
          dodge: number;
        }
      | {
          tag: "Shield";
          absorption: number;
          mitigation: number;
          hp: number;
          regen_time: number;
        }
      | {
          tag: "Armor";
          plating: number;
          hp: number;
        }
      | {
          tag: "Sensor";
        }
      | {
          tag: "Deflector";
          deflection: number;
        }
      | {
          tag: "Cargo";
          max_resources: number;
          protected: number;
        }
      | {
          tag: "Weapon";
          shots: number;
          warm_up: number;
          cool_down: number;
          accuracy: number;
          penetration: number;
          modulation: number;
          minimum_damage: number;
          maximum_damage: number;
          crit_chance: number;
          crit_modifier: number;
          weapon_type: 1 | 2; // Energy or Kinetic
        }
      | {
          tag: "Special";
          mining_speed: number;
        };
}

export interface CombatLogRound {
    round: number,
    events: CombatLogRoundEvent[],
}

export interface CombatLogRoundEventAttack {
    type: 'attack',
    weapon: string,
    ship: string,
    target: string,
    f1: number,
    f2: number,
    f3: number,
    crit: boolean,
    damage_mitigated: number,
    damage_taken_hull: number,
    damage_taken_shield: number,
    remaining_hull: number,
    remaining_shield: number,
}

export interface CombatLogRoundEventWeaponCharge {
    type: 'charge',
    ship: string,
    weapon: string,
    charge: number,
}

export interface CombatLogRoundEventAbilityTrigger {
    type: 'ability',
    ship: string,
    officer: string,
    ability: string,
    value: number,
}

export type CombatLogRoundEvent
    = CombatLogRoundEventAttack
    | CombatLogRoundEventWeaponCharge
    | CombatLogRoundEventAbilityTrigger
    ;

export type CombatLogType = 'pve' | 'pvp' | 'armada' | 'station' | '???';

export interface CombatLog {
    time: string,
    type: CombatLogType,
    // Static info
    initiator_fired_first: boolean,
    initiator_wins: boolean,
    // Participating ships
    ships: CombatLogShip[],
    // Combat log
    log: CombatLogRound[],
    loot: {[side: string]: CombatLogMaterial[]},
}

// ----------------------------------------------------------------------------
// List of all combat logs
// ----------------------------------------------------------------------------

export interface CombatLogDatabaseShip {
    name: string,
    tier: number,
    level: number,
    side: CombatLogSide,
    officers: string[],
    hhp_lost: number,
    hhp_max: number,
}

export interface CombatLogDatabaseEntry {
    time: string,
    id: string,
    transformed_id: string,
    ships: CombatLogDatabaseShip[],
    rounds: number,
    intiator_wins: boolean,
    type: CombatLogType,
}

export interface CombatLogDatabase {
    logs: CombatLogDatabaseEntry[],
}