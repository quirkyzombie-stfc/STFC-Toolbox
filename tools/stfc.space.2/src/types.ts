// --------------------------------------------------------------------------------------------------------------------
// API types - common types
// --------------------------------------------------------------------------------------------------------------------

export type ApiRarityString = "Common" | "Uncommon" | "Rare" | "Epic";
export type ApiRequirementString = "BuildingLevel" | "ResearchLevel";

export type ApiRequirement = {
  requirement_type: ApiRequirementString;
  requirement_id: number;
  requirement_level: number;
};

export type ApiCost = {
  resource_id: number;
  amount: number;
};

// --------------------------------------------------------------------------------------------------------------------
// API types - translation endpoints
// --------------------------------------------------------------------------------------------------------------------

export type ApiTranslation<Keys> = {
  modified: string;
  id: string;
  text: string;
  key: Keys;
};

export type ApiTMaterial = ApiTranslation<
  "name_short" | "name" | "description"
>;
export type ApiTShip = ApiTranslation<
  "name" | "blueprint_name" | "description" | "bonus_name" | "bonus_description"
>;
export type ApiTOfficer = ApiTranslation<
  | "name"
  | "short_name"
  | "narrative"
  | "tooltip"
  | "tooltip_short"
  | "captain_ability_name"
  | "captain_ability_short_description"
  | "captain_ability_description"
  | "officer_ability_name"
  | "officer_ability_short_description"
  | "officer_ability_description"
>;
export type ApiTOfficerSynergy = ApiTranslation<"name">;
export type ApiTOfficerDivision = ApiTranslation<"name">;
export type ApiTResearch = ApiTranslation<"name" | "description">;
export type ApiTBuilding = ApiTranslation<"name" | "description">;
export type ApiTBuildingBuff = ApiTranslation<"buff_name" | "buff_description">;
export type ApiTFaction = ApiTranslation<"name">;
export type ApiTShipType = ApiTranslation<"name">;
export type ApiTSystem = ApiTranslation<"name">;
export type ApiTShipComponent = ApiTranslation<"name" | "description">;
export type ApiTConsumable = ApiTranslation<
  "name" | "name_short" | "description"
>;
export type ApiTHostile = ApiTranslation<"name">;

// --------------------------------------------------------------------------------------------------------------------
// API types - index endpoints
// --------------------------------------------------------------------------------------------------------------------

export type ApiLResource = {
  id: number;
  grade: number;
  rarity: number;
  resource_id: string;
  art_id: number;
  sorting_index: number;
};

export type ApiLShip = {
  id: number;
  max_tier: number;
  grade: number;
  rarity: ApiRarityString;
  scrap_level: number;
  build_time_in_seconds: number;
  faction: number;
  blueprints_required: number;
  hull_type: number;
  max_level: number;
  build_cost: ApiCost[];
  build_requirements: ApiRequirement[];
  art_id: number;
};

export type ApiLOfficer = {
  id: number;
  art_id: number;
  faction: number;
  class: number;
  rarity: ApiRarityString;
  synergy_id: number;
  max_rank: number;
  ability: {
    id: number;
    value_is_percentage: boolean;
    max_level: number;
    art_id: number;
  };
  captain_ability: {
    id: number;
    value_is_percentage: boolean;
    max_level: number;
    art_id: number;
  };
};

export type ApiLBuilding = {
  id: number;
  max_level: number;
  unlock_level: number;
  first_level_requirements: ApiRequirement[];
  buffs: {
    id: number;
    value_is_percentage: boolean;
    max_level: number;
    art_id: number;
  }[];
};

export type ApiLResearch = {
  id: number;
  unlock_level: number;
  art_id: number;
  view_level: number;
  max_level: number;
  research_tree: number;
  buffs: {
    id: number;
    value_is_percentage: boolean;
    max_level: number;
    art_id: number;
  }[];
  first_level_requirements: ApiRequirement[];
  row: number;
  column: number;
};

export type ApiLSystem = {
  id: number;
  est_warp: number;
  is_deep_space: boolean;
  faction: number;
  level: number;
  coords_x: number;
  coords_y: number;
  has_mines: boolean;
  has_plantes: boolean;
  has_player_containers: boolean;
  has_missions: boolean;
  mine_resources: number[];
  node_sizes: number[];
  hostiles: {
    id: number;
    faction: number;
    level: number;
    ship_type: number;
    is_scout: boolean;
    loca_id: number;
    hull_type: number;
    rarity: number;
    count: number;
  }[];
};

export type ApiLHostile = {
  id: number;
  faction: number;
  level: number;
  ship_type: number;
  is_scout: boolean;
  loca_id: number;
  hull_type: number;
  rarity: number;
  count: number;
  strength: number;
  systems: number[];
  warp: number;
  resources: {
    resource_id: number;
    min: number;
    max: number;
  }[];
};

export type ApiLConsumable = {
  id: number;
  rarity: ApiRarityString;
  grade: number;
  requires_slot: boolean;
  buff: {
    id: number;
    value_is_percentage: boolean;
    values: {
      value: number;
      chance: number;
    }[];
    art_id: number;
    show_percentage: boolean;
    value_type: number;
  } | null;
  duration_seconds: number;
  category: number;
  art_id: number;
};

// --------------------------------------------------------------------------------------------------------------------
// API types - details endpoints
// --------------------------------------------------------------------------------------------------------------------

export type ApiDShipComponent = {
  id: number;
  art_id: number;
  loca_id: number;
  order: number;
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
  build_cost: ApiCost[];
  repair_cost: ApiCost[];
  repair_time: number;
  scrap: ApiCost[];
};

export type ApiDShip = {
  id: number;
  art_id: number;
  max_tier: number;
  rarity: ApiRarityString;
  grade: number;
  scrap_level: number;
  build_time_in_seconds: number;
  faction: number;
  blueprints_required: number;
  hull_type: number;
  max_level: number;
  build_cost: ApiCost[];
  repair_cost: ApiCost[];
  repair_time: number;
  build_requirements: ApiRequirement[];
  officer_bonus: {
    attack: {
      value: number;
      bonus: number;
    }[];
    defense: {
      value: number;
      bonus: number;
    }[];
    health: {
      value: number;
      bonus: number;
    }[];
    crew_slots: {
      slots: number;
      unlock_level: number;
    }[];
  };
  tiers: {
    tier: number;
    buffs: {
      cargo: number;
      protected: number;
    };
    duration: number;
    components: ApiDShipComponent[];
  }[];
  levels: {
    level: number;
    xp: number;
    shield: number;
    health: number;
  }[];
  ability: {
    id: number;
    value_is_percentage: boolean;
    values: {
      value: 0.1;
      chance: 1;
    }[];
    art_id: number;
    show_percentage: boolean;
    value_type: number;
  };
  scrap: {
    hull_id: number;
    scrap_time_seconds: number;
    level: number;
    resources: ApiCost[];
  }[];
  base_scrap: ApiCost[];
};

export type ApiDHostile = {
  id: number;
  faction: number;
  level: number;
  ship_type: number;
  is_scout: boolean;
  loca_id: number;
  hull_type: number;
  rarity: number;
  strength: number;
  systems: number[];
  warp: number;
  stats: {
    dpr: number;
    strength: number;
    hull_hp: number;
    shield_hp: number;
    armor: number;
    absorption: number;
    dodge: number;
    accuracy: number;
    armor_piercing: number;
    shield_piercing: number;
    critical_chance: number;
    critical_damage: number;
  };
  components: ApiDShipComponent[];
  resources: { resource_id: number; min: number; max: number }[];
};

export type ApiDResearch = {
  id: number;
  art_id: number;
  view_level: number;
  unlock_level: number;
  research_tree: number;
  buffs: {
    id: number;
    value_is_percentage: boolean;
    values: { value: number; chance: number }[];
    art_id: number;
    show_percentage: true;
    value_type: number;
  }[];
  levels: {
    id: number;
    strength: number;
    strength_increase: number;
    research_time_in_seconds: number;
    costs: ApiCost[];
    hard_currency_cost: number;
    requirements: ApiRequirement[];
  }[];
  row: number;
  column: number;
};

export type ApiDOfficer = {
  id: number;
  art_id: number;
  faction: number;
  trait_config: {
    officer_id: number;
    progression: {
      required_rank: number;
      trait_id: number;
    }[];
    traits: {
      trait_id: number;
      cost: {
        level: 1;
        costs: ApiCost[];
      }[];
    }[];
  };
  class: number;
  rarity: ApiRarityString;
  synergy_id: number;
  max_rank: number;
  ability: {
    id: number;
    value_is_percentage: boolean;
    values: {
      value: number;
      chance: number;
    }[];
    art_id: number;
    show_percentage: boolean;
    value_type: number;
  };
  captain_ability: {
    id: number;
    value_is_percentage: boolean;
    values: {
      value: number;
      chance: number;
    }[];
    art_id: number;
    show_percentage: boolean;
    value_type: number;
  };
  levels: {
    level: number;
    xp: number;
  }[];
  stats: {
    level: number;
    attack: number;
    defense: number;
    health: number;
  }[];
  ranks: {
    rank: number;
    max_level: number;
    shards_required: number;
    rating_factor: number;
    costs: ApiCost[];
  }[];
};

export type ApiDSystem = {
  id: number;
  est_warp: number;
  is_deep_space: boolean;
  faction: number;
  level: number;
  coords_x: number;
  coords_y: number;
  has_mines: boolean;
  has_planets: boolean;
  has_player_containers: boolean;
  has_missions: boolean;
  mines: {
    id: number;
    resource: number;
    rate: number;
    amount: number;
    coords_x: number;
    coords_y: number;
  }[];
  planets: {
    id: number;
    missions: number[];
    coords_x: number;
    coords_y: number;
  }[];
  player_container: {
    id: number;
    slots: number;
    coords_x: number;
    coords_y: number;
  }[];
  missions: number[];
  hostiles: {
    id: number;
    faction: number;
    level: number;
    ship_type: number;
    is_scout: boolean;
    loca_id: number;
    hull_type: number;
    strength: number;
    rarity: number;
    count: number;
  }[];
  neighbors: {
    system_id: number;
    distance: number;
  }[];
  capture_nodes: {
    id: number;
    coords_x: number;
    coords_y: number;
  }[];
};

export type ApiAllData = {
  version: string;
  tmaterials: ApiTMaterial[];
  tships: ApiTShip[];
  tofficers: ApiTOfficer[];
  tofficers_synergy: ApiTOfficerSynergy[];
  tofficer_division: ApiTOfficerDivision[];
  tresearch: ApiTResearch[];
  tbuildings: ApiTBuilding[];
  tbuilding_buffs: ApiTBuildingBuff[];
  tfactions: ApiTFaction[];
  tship_type: ApiTShipType[];
  tsystems: ApiTSystem[];
  tship_components: ApiTShipComponent[];
  tconsumables: ApiTConsumable[];
  thostiles: ApiTHostile[];
  lresource: ApiLResource[];
  lship: ApiLShip[];
  lofficer: ApiLOfficer[];
  lbuilding: ApiLBuilding[];
  lresearch: ApiLResearch[];
  lsystem: ApiLSystem[];
  lhostile: ApiLHostile[];
  lconsumable: ApiLConsumable[];
  dship: ApiDShip[];
  dhostile: ApiDHostile[];
  dresearch: ApiDResearch[];
  dofficer: ApiDOfficer[];
  dsystem: ApiDSystem[];
};
