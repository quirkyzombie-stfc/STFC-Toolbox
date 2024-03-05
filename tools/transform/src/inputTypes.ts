export type Dictionary<Key extends string | number, Value> = {[key in Key]: Value};


// ----------------------------------------------------------------------------
// Input Protobuf
// ----------------------------------------------------------------------------

// Small wrapper around a JSON string, see ../proto/sync.proto
export interface SyncMessage {
    data: {
        data: string,
    },
}

// ----------------------------------------------------------------------------
// Input JSON
// ----------------------------------------------------------------------------
export interface JournalsGetMessage {
    journal: RawCombatLog
}

export interface SyncMessageData {
    battle_results?: RawCombatLog[],
}

// Stable across sessions
export type PlayerId = string;

// Stable across sessions
export type FleetId = number;
export type FleetIdStr = string;

export type ShipId = number;
export type ShipIdStr = string;

// Stable across sessions
export type ShipInfoIdStr = string;

export interface RawActiveBuff {
    expiry_time: any | null,
    ranks: number[],
    buff_id: number,
    activator_id: ShipId,
    attributes: {},
    activation_time: string,
}

export interface RawBridgeOfficer {
    id: number,
    rank: number,
    level: number,
}

export interface RawFleetInfo {
    uid: PlayerId,
    last_update_time: string,
    battle_start_time: string,
    ship_dmg: Dictionary<ShipInfoIdStr, number>, // Total hull damage after the fight (including damage done before this fight)
    ship_shield_dmg: Dictionary<ShipInfoIdStr, number>,
    ship_components: Dictionary<ShipInfoIdStr, number[]>,
    ship_attributes: Dictionary<ShipInfoIdStr, Dictionary<string, number>>,
    ship_stats: Dictionary<ShipInfoIdStr, Dictionary<string, number>>,
    ship_levels: Dictionary<ShipInfoIdStr, number>,
    ship_hps: Dictionary<ShipInfoIdStr, number>, // Max hull hit points
    ship_shield_hps: Dictionary<ShipInfoIdStr, number>,
    ship_level_percentages: Dictionary<ShipInfoIdStr, number>,
    ship_shield_total_regeneration_durations: Dictionary<ShipInfoIdStr, number>,
    ship_tiers: Dictionary<ShipInfoIdStr, number>,
    internal_stats: any,
    officer_rating: number,
    sensor_rating: number,
    deflector_rating: number,
    defense_rating: number,
    offense_rating: number,
    health_rating: number,
    fleet_id: FleetId,
    course_id: number,
    active_buffs: RawActiveBuff[],
    stats: Dictionary<string /* ??? */, number>,
    attributes: Dictionary<string /* ??? */, number>,
    impulse_speed: number,
    pursuit_target_id: any | null,
    pursued_by_num: number,
    state: number,
    ship_ids: ShipId[],
    hull_ids: number[],
    fleet_grade: number,
    is_active: boolean,
    warp_speed: number,
    warp_distance: number,
    latest_course_vector_x: number,
    latest_course_vector_y: number,
    node_address: {
        planet: any | null,
        system: number,
        galaxy: number,
    },
    warp_data: any,
    warp_time: any | null,
    type: number,
    battle_won: boolean,
    battle_opponent_fleet_id: FleetId,
}

export interface RawFleetData {
    // IDs
    fleet_id: number,
    node_id: number,
    ship_ids: ShipId[],
    hull_ids: number[],
    battle_data_type: number,
    ref_ids: {
        art_file_reference: any,
        loca_id: number,
        art_id: number,
    } | null,
    faction_id: number,
    armada_owner_id: number,
    // Loot and non-combat stuff
    initial_cargo: any,
    cargo_max: any,
    cargo_max_list: any[],
    initial_cargo_list: any[],
    final_cargo: any,
    final_cargo_list: any[],
    xp_gained: number | null,
    initial_ship_levels: number[],
    final_ship_levels: number[],
    initial_ship_level_percentages: number[],
    final_ship_level_percentages: number[],
    // Hit points
    max_ship_shps: number[],
    initial_ship_shps: number[],
    final_ship_shps: number[],
    max_ship_hps: number[], // Max hull hit points
    initial_ship_hps: number[],  // ??? Initial hit points minus hull hit points burned during the fight. Can be negative.
    final_ship_hps: number[], // Hull hit points after the fight (including burning damage done after the last attack)
    // Ratings
    officer_rating: number | null,
    offense_rating: number | null,
    defense_rating: number | null,
    health_rating: number | null,
    // Other
    num_drydocks: number
    // Officers
    fleets_officers: Dictionary<string, RawBridgeOfficer[]>,
    bridge_officers: RawBridgeOfficer[],
    // Fleet
    deployed_fleets: Dictionary<FleetIdStr, RawFleetInfo>,
    deployed_fleet: RawFleetInfo,
}

export interface RawCombatLog {
    battle_time: string,
    battle_type: number,
    battle_context_data: {
        context_data: any,
    },
    chest_drop: any,
    battle_duration: number,
    resources_dropped: Dictionary<string, number>,
    resources_transferred: Dictionary<string, number>,
    initiator_fired_first: boolean,
    initiator_wins: boolean,
    target_id: string,
    system_id: number,
    initiator_id: PlayerId,
    coords: {
        y: number,
        x: number,
    },
    id: number, // Does not appear anywhere else
    num_references: number,
    target_fleet_data: RawFleetData,
    initiator_fleet_data: RawFleetData,
    battle_log: number[],
}
