// ----------------------------------------------------------------------------
// Constants from the client
// ----------------------------------------------------------------------------

export const enum BattleType {
  FLEET = 0,
  BASE = 1,
  PASSIVE_MARAUDER = 2,
  NPC_INSTANTIATED = 3,
  DOCKING_POINT = 4,
  ACTIVE_MARAUDER_MARAUDER_INITIATOR = 5,
  ACTIVE_MARAUDER_PLAYER_INITIATOR = 6,
  ARMADA_BASE = 7,
  ARMADA_MARAUDER = 8,
  PVE_DOCKING_POINT = 9,
  ARMADA_ASB = 10,
  ARMADA_MTA = 11,
}

export const enum BattleUnitState {
  Invalid = 0,
  None = 1,
  OnFire = 2,
  Breached = 4,
  HighMorale = 8,
  LowMorale = 16,
  Taunting = 32,
  Assimilated = 64,
}

export const enum BuffSource {
  Officer = 0,
  CaptureObject = 1,
  Consumable = 2,
  ShipBonus = 3,
  ShipTierBonus = 4,
  ShipLevelBonus = 5,
  StarbaseModule = 6,
  Research = 7,
}

export const enum FactionID {
  ExBorgFactionId = 4138978039,
  BajoranFactionId = 1874961561,
  AllianceFactionId = 2441672062,
  RogueFactionId = 2143656960,
  KhanFactionId = 2113010081,
  RomulanFactionId = 669838839,
  KlingonFactionId = 415366714,
  FederationFactionId = 2064723306,
}

export const enum FleetStateAttributes {
  None = 0,
  Damaged = 1,
  HasCargo = 2,
  CargoFull = 4,
  NoCaptain = 8,
  NoShip = 16,
  AttackingShip = 32,
  AttackingBase = 64,
  AttackingMine = 128,
  Home = 256,
  MineDepleted = 512,
  UnableToMine = 1024,
  PreBattle = 2048,
  BattleQueued = 4096,
  ReadyToCollect = 8192,
  FreeToSkip = 16384,
  InArmada = 32768,
  TieringUp = 65536,
  CanCancelWarp = 131072,
  IsCloaking = 262144,
  CannotLaunch = 24,
  CannotMove = 24,
  NotMining = 1540,
  CannotPerformFleetAction = 1,
}

export const enum HullType {
  Any = -1,
  Destroyer = 0,
  Survey = 1,
  Explorer = 2,
  Battleship = 3,
  Defense = 4,
  ArmadaTarget = 5,
}

export const enum StatusEffectType {
  NoEffect = -1,
  Invalid = 0,
  Cloaked = 1,
  Supported = 2,
  Debuffed = 3,
  WarShieldActivated = 4,
  ArmadaSupported = 5,
  WeaponDamageActivated = 6,
  WeaponPenetrationActivated = 7,
  WeaponShotsActivated = 8,
  CriticalDamageActivated = 9,
  Detected = 10,
  SystemWideBuffed = 11,
  SystemWideSupremeBuffed = 12,
}

export const enum ClientModifierType {
  ModEnergyDamage = 0,
  ModKineticDamage = 1,
  ModAllDamage = 2,
  ModShotsPerAttack = 3,
  ModAllLoadSpeed = 4,
  ModAllReloadSpeed = 5,
  ModAccuracy = 6,
  ModArmorPiercing = 7,
  ModShieldPiercing = 8,
  ModCritChance = 9,
  ModCritDamage = 10,
  ModShipDodge = 11,
  ModShipArmor = 12,
  ModShields = 13,
  ModCptManeuverEffect = 14,
  ModOffAbilityEffect = 15,
  ModShieldHpRepair = 16,
  ModHullHpRepair = 17,
  ModAddState = 18,
  ModRemoveState = 19,
  ModParsteelProtection = 20,
  ModTritaniumProtection = 21,
  ModDilithiumProtection = 22,
  ModCombatParsteelReward = 23,
  ModCombatTritaniumReward = 24,
  ModCombatDilithiumReward = 25,
  ModCombatIntelReward = 26,
  ModCombatLootDropChance = 27,
  ModCombatLootDropQuantity = 28,
  ModCombatXpReward = 29,
  ModMissionsParsteelReward = 30,
  ModMissionsTritaniumReward = 31,
  ModMissionsDilithiumReward = 32,
  ModMissionsIntelReward = 33,
  ModMissionsLootDropChance = 34,
  ModMissionsLootDropQuantity = 35,
  ModMissionsXpReward = 36,
  ModFactionPointsFederationReward = 37,
  ModFactionPointsKlingonReward = 38,
  ModFactionPointsRomulanReward = 39,
  ModFactionPointsAllReward = 40,
  ModMiningRateParsteel = 41,
  ModMiningRateTritanium = 42,
  ModMiningRateDilithium = 43,
  ModMiningRateOre = 44,
  ModMiningRateHydrocarbon = 45,
  ModMiningRewardParsteel = 46,
  ModMiningRewardTritanium = 47,
  ModMiningRewardDilithium = 48,
  ModMiningRewardOre = 49,
  ModMiningRewardHydrocarbon = 50,
  ModRepairCostsParsteel = 51,
  ModRepairCostsTritanium = 52,
  ModRepairCostsDilithium = 53,
  ModRepairCostsAll = 54,
  ModRepairTime = 55,
  ModOfficerStatAttack = 56,
  ModOfficerStatDefense = 57,
  ModOfficerStatHealth = 58,
  ModOfficerStatAll = 59,
  ModShieldHpMax = 60,
  ModHullHpMax = 61,
  ModImpulseSpeed = 62,
  ModWarpSpeed = 63,
  ModWarpDistance = 64,
  ModEnterWarpDelay = 65,
  ModCargoCapacity = 66,
  ModCargoProtection = 67,
  ModAutoRecall = 68,
  ModEnergyLoadSpeed = 69,
  ModKineticLoadSpeed = 70,
  ModEnergyReloadSpeed = 71,
  ModKineticReloadSpeed = 72,
  ModAllDefenses = 73,
  ModAllPiercing = 74,
  ModShieldRegenTime = 75,
  ModShieldMitigation = 76,
  ModResourceProtection = 100,
  ModCombatResourceReward = 101,
  ModMissionResourceReward = 102,
  ModFactionPointsRewards = 103,
  ModFactionPointsLosses = 104,
  ModMiningRate = 105,
  ModMiningReward = 106,
  ModRepairCosts = 107,
  ModStarbaseModuleConstructionSpeed = 108,
  ModStarbaseModuleConstructionCost = 109,
  ModResearchSpeed = 110,
  ModResearchCost = 111,
  ModResourceGeneration = 112,
  ModResourceStorage = 113,
  ModForcefieldRechargeSpeed = 114,
  ModForcefieldHp = 115,
  ModComponentCost = 116,
  ModShipConstructionSpeed = 117,
  ModShipConstructionCost = 118,
  ModTierUpSpeed = 119,
  ModFactionPointsPenaltyRecution = 120,
  ModFactionStoreLootBonus = 121,
  ModOfficerLevelUpCost = 122,
  ModOfficerPromoteCost = 123,
  ModScanShip = 124,
  ModScanStation = 125,
  ModScanSystem = 126,
  ModIncomingStationAttackInformation = 127,
  ModIncomingStationAttackAdvancedWarning = 128,
  ModShipScrapResourceBonus = 129,
  ModShipScrapLootBonus = 130,
  ModShipScrapSpeed = 131,
  ModAwayMissionSpeed = 132,
  ModAwayMissionResourceRewards = 133,
  ModAwayMissionLootBonus = 134,
  ModResourceProducerResourceStorage = 135,
  ModWarehouseResourceStorage = 136,
  ModVaultResourceStorage = 137,
  ModHullId = 138,
  ModShipInventorySize = 139,
  ModScanCost = 140,
  ModTradeTax = 141,
  ModRepairStation = 142,
  ModArmadaSize = 143,
  ModSkillCloakingCooldown = 150,
  ModSkillCloakingDuration = 151,
  ModSkillCloakingCost = 152,
  ModSkillCloakingSneakChance = 153,
  ModBdAbilityEffect = 154,
  ModSkillSupportShipAbilityCooldown = 157,
  ModSkillSupportShipAbilityDuration = 158,
  ModSkillSupportShipAbilityCost = 159,
  ModSkillSupportShipAbilityDurationPercentage = 160,
  ModJumpAndTowCostEff = 147,
  ModSkillDebuffAbilityCooldown = 161,
  ModSkillDebuffDuration = 162,
  ModSkillDebuffCost = 163,
  ModSkillDebuffDurationPercentage = 164,
  ModDepositoryStorage = 165,
  ModRelocationRange = 166,
  ModNone = -1000,
  ShipDamagePerRound = -1,
  ShipAbsorption = -2,
  ShipPlating = -3,
  FleetMiningBonus = -4,
  ShipHullDamage = -5,
  ShipShieldDamage = -6,
  FleetGrade = -7,
  FleetOffenseRating = -8,
  FleetDefenseRating = -9,
  FleetHealthRating = -10,
  FleetDeflectorRating = -11,
  FleetSensorRating = -12,
  FleetOfficerRating = -13,
  FleetStrength = -14,
  FleetOfficerBonusAttack = -15,
  FleetOfficerBonusDefense = -16,
  FleetOfficerBonusHealth = -17,
}

export const enum BattleLogEvents {
  START_ROUND = -96,
  END_ROUND = -97,
  START_ATTACK = -98,
  END_ATTACK = -99,
  ATTACK_CHARGE = -95,
  START_SUB_ROUND = -90,
  END_SUB_ROUND = -89,
  OFFICER_ABILITIES_FIRING = -93,
  OFFICER_ABILITIES_FIRED = -94,
  OFFICER_ABILITY_START = -91,
  OFFICER_ABILITY_END = -92,
  OFFICER_ABILITIES_APPLIED_START = -88,
  OFFICER_ABILITIES_APPLIED_END = -87,
  OFFICER_ABILITY_APPLIED_START = -86,
  OFFICER_ABILITY_APPLIED_END = -85,
  FORBIDDEN_TECH_BUFFS_APPLIED_START = -84,
  FORBIDDEN_TECH_BUFFS_APPLIED_END = -83,
  FORBIDDEN_TECH_BUFF_APPLIED_START = -82,
  FORBIDDEN_TECH_BUFF_APPLIED_END = -81,
  HULL_REPAIR_START = -80,
  HULL_REPAIR_END = -79,
}
