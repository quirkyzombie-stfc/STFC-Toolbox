declare enum AbilityFlag {
  BuildingCost = 0,
  BuildingSpeed = 1,
  ResearchCost = 2,
  ResearchSpeed = 3,
  ComponentCost = 4,
  ShipBuildSpeed = 5,
  ShipBuildCost = 6,
  ShipTierUpSpeed = 7,
  WeaponAllDamage = 8,
  WeaponShots = 9,
  WwaponWarmup = 10,
  WeaponCooldown = 11,
  Accuracy = 12,
  Peneration = 13,
  Modulation = 14,
  Dodge = 15,
  Armor = 16,
  Absorption = 17,
  CritChance = 18,
  CritDamage = 19,
  MiningRate = 20,
  ImpulseSpeed = 21,
  WarpSpeed = 22,
  WarpRange = 23,
  Defense = 24,
  Piercing = 25,
  RepairTime = 26,
  RepairCost = 27,
  CargoCapacity = 28,
  CargoProtection = 29,
  ShieldHp = 30,
  HullHp = 31,
  ShieldRegenTime = 32,
  ShieldMitigation = 33,
  XpReward = 34,
  OfficerStats = 35,
  ResourceProduction = 36,
  ResourceProductionStorage = 37,
  WarehouseStorage = 38,
  VaulStorage = 39,
  ScrapSpeed = 40,
  FactionPointRewards = 41,
  FactionPointLossReductionFed = 42,
  FactionPointLossReductionKlg = 43,
  FactionPointLossReductionRom = 44,
  ArmadaSize = 45,
  DiscoEfficiency = 46,
  CloakCooldown = 47,
  CloakDuration = 48,
  CloakCost = 49,
  CloakHiddenChance = 50,
  CerritosCooldown = 51,
  CerritosDuration = 52,
  BelowDeckAbility = 53,
  AmalgamBonus = 54,
  RepairCostEfficiency = 55,
  FactionPointGainFed = 56,
  FactionPointGainKlg = 57,
  FactionPointGainRom = 58,
  HostileCargo = 59,
  StellaBonus = 60,
  NanoprobeLootBonus = 61,
  ArmadaCargo = 62,
  AmalgamHostileLoot = 63,
  SupportDuration = 64,
  HangarSize = 65,
  InternalUnused = 66,
  AddState = 67,
  RemoveState = 68,
  CaptainValue = 69,
  OfficerValue = 70,
  Invalid = 71,
}

export declare interface AllData {
  version: string;
  translations: {
    officers: ApiTranslation[];
    officer_names: ApiTranslation[];
    officer_flavor_text: ApiTranslation[];
    officer_buffs: ApiTranslation[];
    research: ApiTranslation[];
    traits: ApiTranslation[];
    starbase_modules: ApiTranslation[];
    ship_components: ApiTranslation[];
    consumables: ApiTranslation[];
    systems: ApiTranslation[];
    factions: ApiTranslation[];
    mission_titles: ApiTranslation[];
    blueprints: ApiTranslation[];
    ship_buffs: ApiTranslation[];
    forbidden_tech: ApiTranslation[];
    navigation: ApiTranslation[];
    loyalty: ApiTranslation[];
    player_avatars: ApiTranslation[];
    materials: ApiTranslation[];
    ships: ApiTranslation[];
  };
  officer: { [id: number]: OfficerDetail };
  ship: { [id: number]: ShipDetail };
  skins: { [id: number]: unknown };
  research: { [id: number]: ResearchDetail };
  system: { [id: number]: SystemDetail };
  building: { [id: number]: BuildingDetail };
  hostile: { [id: number]: HostileDetail };
  consumable: { [id: number]: unknown };
  //mission: { [id: number]: unknown };
  forbidden_tech: { [id: number]: ForbiddenTechDetail };
  resource: { [id: number]: unknown };
  office_summary: Officer[];
  ship_summary: Ship[];
  skins_summary: unknown[];
  research_summary: Research[];
  system_summary: System[];
  building_summary: Building[];
  hostile_summary: Hostile[];
  consumable_summary: Consumable[];
  //mission_summary: unknown[];
  forbidden_tech_summary: ForbiddenTech[];
  resource_summary: Resource[];
}

export declare interface ApiTranslation {
  id: number;
  text: string;
  key: string;
}

declare interface Buff {
  id: number;
  value_is_percentage: boolean;
  values: BuffValue[];
  art_id: number;
  loca_id: number;
  show_percentage: boolean;
  value_type: number | boolean;
}

declare interface BuffValue {
  value: number;
  chance: number;
}

declare interface BuildCost {
  resource_id: number;
  amount: number;
}

export declare interface Building {
  id: number;
  max_level: number;
  unlock_level: number;
  first_level_requirements: Requirement[];
  buffs: OfficerAbility[];
}

export declare interface BuildingDetail {
  id: number;
  levels: BuildingDetailLevel[];
  buffs: Buff[];
  unlock_level?: number;
}

declare interface BuildingDetailLevel {
  id: number;
  strength: number;
  strength_increase: number;
  build_time_in_seconds: number;
  costs: BuildCost[];
  hard_currency_cost: number;
  requirements: Requirement[];
  required_by?: Requirement[];
  rewards: Reward[];
  weapons?: ShipDetailComponent[];
  stats?: {
    [key: string]: number;
  } | null;
}

export declare interface Consumable {
  id: number;
  rarity: Rarity;
  grade: number;
  requires_slot: boolean;
  buff: Buff;
  duration_seconds: number;
  category: ConsumableCategory;
  art_id: number;
  loca_id: number;
}

declare enum ConsumableCategory {
  Station = 2950573209,
  Galaxy = 1056678826,
  Combat = 1870147103,
}

declare interface CrewSlot {
  slots: number;
  unlock_level: number;
}

export declare interface Hostile {
  id: number;
  faction: number;
  level: number;
  ship_type: number;
  is_scout: boolean;
  loca_id: number;
  hull_type: number;
  rarity: number;
  count: number;
  strength?: number;
  systems: number[];
  warp: number;
  resources?: ResourceRewardRange[];
}

export declare interface HostileDetail {
  id: number;
  loca_id: number;
  faction: number;
  level: number;
  ship_type: HostileShipType;
  is_scout: boolean;
  hull_type: number;
  rarity: Rarity;
  strength: number;
  systems: number[];
  warp: number;
  components: ShipDetailComponent[];
  resources: ResourceRewardRange[];
  ability: ShipDetailAbility;
  stats?: {
    [key: string]: number;
  };
}

declare enum HostileShipType {
  Antaak = 0,
  ArmadaTarget = 1,
  Battleship = 2,
  Boss = 3,
  Combat = 4,
  Destroyer = 5,
  Elite = 6,
  Explorer = 7,
  Patrol = 8,
  Revenge = 9,
  Survey = 10,
  Trader = 11,
  Transport = 12,
  WarFleet = 13,
}

declare enum ItemType {
  Component = 0,
  Blueprint = 1,
  Resource = 3,
  Mission = 5,
  Connection = 6,
  Consumable = 8,
  Officer = 9,
  OfficerShard = 11,
  Cosmetic = 12,
  Shield = 103,
}

declare interface Mine {
  id: number;
  resource: number;
  rate: number;
  amount: number;
  coords_x: number;
  coords_y: number;
}

export declare interface Officer {
  id: number;
  art_id: number;
  faction: number;
  class: number;
  rarity: Rarity;
  synergy_id: number;
  max_rank: number;
  ability: OfficerAbility;
  captain_ability: OfficerAbility;
  below_decks_ability?: OfficerAbility;
}

declare interface OfficerAbility {
  id: number;
  index: null;
  value_is_percentage: boolean;
  show_percentage: boolean;
  max_level: number;
  art_id: number;
  loca_id: number;
  value_type: number;
}

declare interface OfficerBonus {
  attack: OfficerBonusValue[];
  defense: OfficerBonusValue[];
  health: OfficerBonusValue[];
}

declare interface OfficerBonusValue {
  value: number;
  bonus: number;
}

export declare interface OfficerDetail {
  id: number;
  art_id: number;
  loca_id: number;
  faction: {
    id: number;
    loca_id: number;
  };
  class: number;
  rarity: Rarity;
  synergy_id: number;
  max_rank: number;
  ability: Buff;
  captain_ability: Buff;
  below_decks_ability?: Buff;
  levels: OfficerDetailLevel[];
  stats: Stat[];
  ranks: Rank[];
  trait_config?: OfficerTraitConfig;
}

declare interface OfficerDetailLevel {
  level: number;
  xp: number;
}

declare interface OfficerTrait {
  trait_id: number;
  cost: OfficerTraitCost[];
}

declare interface OfficerTraitConfig {
  progression: OfficerTraitProgression[];
  traits: OfficerTrait[];
}

declare interface OfficerTraitCost {
  level: number;
  costs: BuildCost[];
}

declare interface OfficerTraitProgression {
  required_rank: number;
  trait_id: number;
}

declare interface Planet {
  id: number;
  missions?: number[];
  coords_x: number;
  coords_y: number;
  slots?: number;
}

declare interface Rank {
  rank: number;
  max_level: number;
  shards_required: number;
  rating_factor: number;
  costs: BuildCost[];
}

declare enum Rarity {
  Base = 0,
  Common = 1,
  Uncommon = 2,
  Rare = 3,
  Epic = 4,
}

declare interface Requirement {
  requirement_type: RequirementType;
  requirement_id: number;
  requirement_level: number;
  power_gain?: number;
}

declare enum RequirementType {
  BuildingLevel = "BuildingLevel",
  FactionRank = "FactionRank",
  ResearchLevel = "ResearchLevel",
  AllianceLevel = "AllianceLevel",
}

export declare interface Research {
  id: number;
  unlock_level: number;
  art_id: number;
  view_level: number;
  max_level: number;
  research_tree: number;
  buffs: OfficerAbility[];
  first_level_requirements: Requirement[];
  row: number;
  column: number;
}

export declare interface ResearchDetail {
  id: number;
  art_id: number;
  loca_id: number;
  view_level: number;
  research_tree: {
    id: number;
    loca_id: number;
  };
  buffs: Buff[];
  levels: ResearchDetailLevel[];
  row: number;
  column: number;
  unlock_level: number;
}

export declare interface ResearchDetailLevel {
  id: number;
  strength: number;
  strength_increase: number;
  research_time_in_seconds: number;
  costs: BuildCost[];
  hard_currency_cost: number;
  requirements: Requirement[];
  required_by: Requirement[];
  rewards: Reward[];
}

export declare interface Resource {
  id: number;
  grade: number;
  rarity: Rarity;
  resource_id: string;
  art_id: number;
  loca_id: number;
  sorting_index: number;
}

declare interface ResourceRewardRange {
  resource_id: number;
  min: number;
  max: number;
}

declare interface Reward {
  amount: number;
  type: ItemType;
  resource_id: number;
}

declare interface Scrap {
  hull_id: number;
  scrap_time_seconds: number;
  level: number;
  resources: BuildCost[];
}

export declare interface Ship {
  id: number;
  max_tier: number;
  grade: number;
  rarity: Rarity;
  scrap_level: number;
  build_time_in_seconds: number;
  faction: number;
  blueprints_required: number;
  hull_type: number;
  max_level: number;
  build_cost: BuildCost[];
  build_requirements: Requirement[];
  art_id: number;
  loca_id: number;
}

export declare type ShipComponentArmor = {
  tag: "Armor";
  plating: number;
  hp: number;
};

export declare type ShipComponentCargo = {
  tag: "Cargo";
  max_resources: number;
  protected: number;
};

export declare type ShipComponentDeflector = {
  tag: "Deflector";
  deflection: number;
};

export declare type ShipComponentImpulse = {
  tag: "Impulse";
  impulse: number;
  dodge: number;
};

export declare type ShipComponentSensor = {
  tag: "Sensor";
};

export declare type ShipComponentShield = {
  tag: "Shield";
  absorption: number;
  mitigation: number;
  hp: number;
  regen_time: number;
};

export declare type ShipComponentSpecial = {
  tag: "Special";
  mining_speed: number;
};

export declare type ShipComponentWarp = {
  tag: "Warp";
  speed: number;
  distance: number;
  tow_multiplier?: number;
  instant_warp_cost?: number;
  abilities: ShipComponentWarpAbility[];
};

export declare interface ShipComponentWarpAbility {
  InstantWarp?: {
    base_cost: number;
    cost_resource_id: number;
    cost_multiplier: number;
  };
  Towing?: {
    cost_multiplier: number;
    unlock_research_id: number;
  };
  Cloaking?: {
    base_cost: number;
    cooldown: number;
    duration: number;
    cost_resource_id: number;
    unlock_research_id: number;
  };
}

export declare type ShipComponentWeapon = {
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
  weapon_type: number;
};

export declare interface ShipDetail {
  id: number;
  art_id: number;
  loca_id: number;
  max_tier: number;
  rarity: Rarity;
  grade: number;
  scrap_level: number;
  build_time_in_seconds: number;
  faction: number;
  blueprints_required: number;
  hull_type: number;
  max_level: number;
  build_cost: BuildCost[];
  repair_cost: BuildCost[];
  repair_time: number;
  build_requirements: Requirement[];
  officer_bonus: OfficerBonus;
  crew_slots: CrewSlot[];
  tiers: Tier[];
  levels: ShipDetailLevel[];
  ability: ShipDetailAbility;
  scrap: Scrap[];
  base_scrap: BuildCost[];
}

declare interface ShipDetailAbility {
  id: number;
  value_is_percentage: boolean;
  values: Value[];
  art_id: number;
  loca_id: number;
  show_percentage: boolean;
  value_type: number;
  flag: AbilityFlag;
}

export declare interface ShipDetailComponent {
  id: number;
  art_id: number;
  loca_id: number;
  build_cost: BuildCost[];
  repair_cost: BuildCost[];
  repair_time: number;
  scrap: BuildCost[];
  data: ShipDetailComponentData;
  order: number;
  build_time_in_seconds: number;
}

export declare type ShipDetailComponentData =
  | ShipComponentArmor
  | ShipComponentCargo
  | ShipComponentDeflector
  | ShipComponentImpulse
  | ShipComponentShield
  | ShipComponentSensor
  | ShipComponentSpecial
  | ShipComponentWarp
  | ShipComponentWeapon;

export declare interface ShipDetailLevel {
  level: number;
  xp: number;
  shield: number;
  health: number;
}

export declare interface SpawnPoint {
  id: number;
  coords_x: number;
  coords_y: number;
}

export declare interface Stat {
  level: number;
  attack: number;
  defense: number;
  health: number;
}

export declare interface System {
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
  num_station_slots: number;
  has_missions: boolean;
  mine_resources: number[];
  hostiles: Hostile[];
  node_sizes: number[];
}

export declare interface SystemDetail {
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
  num_station_slots: number;
  has_missions: boolean;
  mines: Mine[];
  planets: Planet[];
  player_container: Planet[];
  spawn_points?: SpawnPoint[];
  missions: number[];
  hostiles: Hostile[];
  node_sizes: number[];
}

export declare interface Tier {
  tier: number;
  buffs: TierBuffs;
  duration: number;
  components: ShipDetailComponent[];
}

declare interface TierBuffs {
  cargo: number;
  protected: number;
}

export declare interface Value {
  value: number;
  chance: number;
}

export interface ForbiddenTech {
  id: number;
  art_id: number;
  loca_id: number;
  rarity: Rarity;
  type: number;
  subtype: number;
  tier_max: number;
  buffs: Buff[];
}

export interface ForbiddenTechDetail {
  id: number;
  art_id: number;
  loca_id: number;
  rarity: Rarity;
  type: number;
  subtype: number;
  tier_max: number;
  buffs: { tier: number; buffs: Buff[] }[];
  tiers: ForbiddenTechTier[];
  levels: ForbiddenTechLevel[];
}

export interface ForbiddenTechTier {
  max_level: number;
  rank: number;
  rating_factor: number;
  cost: BuildCost[];
}

export interface ForbiddenTechLevel {
  level: number;
  cost: BuildCost[];
}
