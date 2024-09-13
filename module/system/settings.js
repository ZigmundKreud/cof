export const registerSystemSettings = function () {
  const reload = foundry.utils.debounce(() => window.location.reload(), 250)

  game.settings.register("cof", "useRecovery", {
    name: "SETTINGS.useRecovery.name",
    hint: "SETTINGS.useRecovery.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  })

  game.settings.register("cof", "useFortune", {
    name: "SETTINGS.useFortune.name",
    hint: "SETTINGS.useFortune.hint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  })

  game.settings.register("cof", "useMana", {
    name: "SETTINGS.useMana.name",
    hint: "SETTINGS.useMana.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  })

  game.settings.register("cof", "useDamageResistance", {
    name: "SETTINGS.useDamageResistance.name",
    hint: "SETTINGS.useDamageResistance.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  })

  game.settings.register("cof", "displayDifficulty", {
    name: "SETTINGS.displayDifficulty.name",
    hint: "SETTINGS.displayDifficulty.hint",
    scope: "world",
    config: true,
    default: "none",
    type: String,
    choices: {
      none: "SETTINGS.displayDifficulty.none",
      all: "SETTINGS.displayDifficulty.all",
      gm: "SETTINGS.displayDifficulty.gm",
    },
  })

  game.settings.register("cof", "useComboRolls", {
    name: "SETTINGS.useComboRolls.name",
    hint: "SETTINGS.useComboRolls.hint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  })

  game.settings.register("cof", "useVarInit", {
    name: "SETTINGS.useVarInit.name",
    hint: "SETTINGS.useVarInit.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: reload,
  })

  game.settings.register("cof", "useIncompetentPJ", {
    name: "SETTINGS.useIncompetentPJ.name",
    hint: "SETTINGS.useIncompetentPJ.hint",
    scope: "world",
    config: false,
    default: false,
    type: Boolean,
  })

  game.settings.register("cof", "useOverload", {
    name: "SETTINGS.useOverload.name",
    hint: "SETTINGS.useOverload.hint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  })

  game.settings.register("cof", "displayChatDamageButtonsToAll", {
    name: "SETTINGS.displayChatDamageButtonsToAll.name",
    hint: "SETTINGS.displayChatDamageButtonsToAll.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  })

  game.settings.register("cof", "moveItem", {
    name: "SETTINGS.moveItem.name",
    hint: "SETTINGS.moveItem.hint",
    scope: "world",
    type: String,
    choices: {
      0: "SETTINGS.moveItem.copy",
      1: "SETTINGS.moveItem.move",
    },
    default: "0",
    config: true,
  })

  game.settings.register("cof", "lockItems", {
    name: "SETTINGS.lockItems.name",
    hint: "SETTINGS.lockItems.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  })

  game.settings.register("cof", "lockDuringPause", {
    name: "SETTINGS.lockDuringPause.name",
    hint: "SETTINGS.lockDuringPause.hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  })

  game.settings.register("cof", "checkFreeHandsBeforeEquip", {
    name: "SETTINGS.checkFreeHandsBeforeEquip.name",
    hint: "SETTINGS.checkFreeHandsBeforeEquip.hint",
    scope: "world",
    config: true,
    default: "none",
    type: String,
    choices: {
      none: "SETTINGS.checkFreeHandsBeforeEquip.none",
      all: "SETTINGS.checkFreeHandsBeforeEquip.all",
      gm: "SETTINGS.checkFreeHandsBeforeEquip.gm",
    },
  })

  game.settings.register("cof", "checkArmorSlotAvailability", {
    name: "SETTINGS.checkArmorSlotAvailability.name",
    hint: "SETTINGS.checkArmorSlotAvailability.hint",
    scope: "world",
    config: true,
    default: "none",
    type: String,
    choices: {
      none: "SETTINGS.checkArmorSlotAvailability.none",
      all: "SETTINGS.checkArmorSlotAvailability.all",
      gm: "SETTINGS.checkArmorSlotAvailability.gm",
    },
  })

  game.settings.register("cof", "useActionSound", {
    name: "SETTINGS.useActionSound.name",
    hint: "SETTINGS.useActionSound.hint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  })

  game.settings.register("cof", "worldKey", {
    name: "Unique world key",
    scope: "world",
    config: false,
    type: String,
    default: "",
  })

  game.settings.register("cof", "defaultVisibilityGMRoll", {
    name: "SETTINGS.defaultVisibilityGMRoll.name",
    hint: "SETTINGS.defaultVisibilityGMRoll.hint",
    scope: "world",
    config: true,
    default: "gmroll",
    type: String,
    choices: {
      gmroll: "SETTINGS.defaultVisibilityGMRoll.private",
      publicroll: "SETTINGS.defaultVisibilityGMRoll.public",
    },
    requiresReload: true,
  })
}
