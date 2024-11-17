/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/combatsimulator/ability.js":
/*!****************************************!*\
  !*** ./src/combatsimulator/ability.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _buff__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./buff */ "./src/combatsimulator/buff.js");
/* harmony import */ var _data_abilityDetailMap_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./data/abilityDetailMap.json */ "./src/combatsimulator/data/abilityDetailMap.json");
/* harmony import */ var _trigger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./trigger */ "./src/combatsimulator/trigger.js");




class Ability {
    constructor(hrid, level, triggers = null) {
        this.hrid = hrid;
        this.level = level;

        let gameAbility = _data_abilityDetailMap_json__WEBPACK_IMPORTED_MODULE_1__[hrid];
        if (!gameAbility) {
            throw new Error("No ability found for hrid: " + this.hrid);
        }

        this.manaCost = gameAbility.manaCost;
        this.cooldownDuration = gameAbility.cooldownDuration;

        this.abilityEffects = [];

        for (const effect of gameAbility.abilityEffects) {
            let abilityEffect = {
                targetType: effect.targetType,
                effectType: effect.effectType,
                combatStyleHrid: effect.combatStyleHrid,
                damageType: effect.damageType,
                damageFlat: effect.baseDamageFlat + (this.level - 1) * effect.baseDamageFlatLevelBonus,
                damageRatio: effect.baseDamageRatio + (this.level - 1) * effect.baseDamageRatioLevelBonus,
                bleedRatio: effect.bleedRatio,
                bleedDuration: effect.bleedDuration,
                stunChance: effect.stunChance,
                stunDuration: effect.stunDuration,
                buffs: null,
            };
            if (effect.buffs) {
                abilityEffect.buffs = [];
                for (const buff of effect.buffs) {
                    abilityEffect.buffs.push(new _buff__WEBPACK_IMPORTED_MODULE_0__["default"](buff, this.level));
                }
            }
            this.abilityEffects.push(abilityEffect);
        }

        if (triggers) {
            this.triggers = triggers;
        } else {
            this.triggers = [];
            for (const defaultTrigger of gameAbility.defaultCombatTriggers) {
                let trigger = new _trigger__WEBPACK_IMPORTED_MODULE_2__["default"](
                    defaultTrigger.dependencyHrid,
                    defaultTrigger.conditionHrid,
                    defaultTrigger.comparatorHrid,
                    defaultTrigger.value
                );
                this.triggers.push(trigger);
            }
        }

        this.lastUsed = Number.MIN_SAFE_INTEGER;
    }

    static createFromDTO(dto) {
        let triggers = dto.triggers.map((trigger) => _trigger__WEBPACK_IMPORTED_MODULE_2__["default"].createFromDTO(trigger));
        let ability = new Ability(dto.hrid, dto.level, triggers);

        return ability;
    }

    shouldTrigger(currentTime, source, target, friendlies, enemies) {
        if (source.isStunned) {
            return false;
        }

        if (this.lastUsed + this.cooldownDuration > currentTime) {
            return false;
        }

        if (this.triggers.length == 0) {
            return true;
        }

        let shouldTrigger = true;
        for (const trigger of this.triggers) {
            if (!trigger.isActive(source, target, friendlies, enemies, currentTime)) {
                shouldTrigger = false;
            }
        }

        return shouldTrigger;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Ability);


/***/ }),

/***/ "./src/combatsimulator/buff.js":
/*!*************************************!*\
  !*** ./src/combatsimulator/buff.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Buff {
    startTime;

    constructor(buff, level = 1) {
        this.sourceHrid = buff.sourceHrid;
        this.typeHrid = buff.typeHrid;
        this.ratioBoost = buff.ratioBoost + (level - 1) * buff.ratioBoostLevelBonus;
        this.flatBoost = buff.flatBoost + (level - 1) * buff.flatBoostLevelBonus;
        this.duration = buff.duration;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Buff);


/***/ }),

/***/ "./src/combatsimulator/combatSimulator.js":
/*!************************************************!*\
  !*** ./src/combatsimulator/combatSimulator.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatUtilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatUtilities */ "./src/combatsimulator/combatUtilities.js");
/* harmony import */ var _events_autoAttackEvent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./events/autoAttackEvent */ "./src/combatsimulator/events/autoAttackEvent.js");
/* harmony import */ var _events_bleedTickEvent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./events/bleedTickEvent */ "./src/combatsimulator/events/bleedTickEvent.js");
/* harmony import */ var _events_checkBuffExpirationEvent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./events/checkBuffExpirationEvent */ "./src/combatsimulator/events/checkBuffExpirationEvent.js");
/* harmony import */ var _events_combatStartEvent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./events/combatStartEvent */ "./src/combatsimulator/events/combatStartEvent.js");
/* harmony import */ var _events_consumableTickEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./events/consumableTickEvent */ "./src/combatsimulator/events/consumableTickEvent.js");
/* harmony import */ var _events_cooldownReadyEvent__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./events/cooldownReadyEvent */ "./src/combatsimulator/events/cooldownReadyEvent.js");
/* harmony import */ var _events_enemyRespawnEvent__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./events/enemyRespawnEvent */ "./src/combatsimulator/events/enemyRespawnEvent.js");
/* harmony import */ var _events_eventQueue__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./events/eventQueue */ "./src/combatsimulator/events/eventQueue.js");
/* harmony import */ var _events_playerRespawnEvent__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./events/playerRespawnEvent */ "./src/combatsimulator/events/playerRespawnEvent.js");
/* harmony import */ var _events_regenTickEvent__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./events/regenTickEvent */ "./src/combatsimulator/events/regenTickEvent.js");
/* harmony import */ var _events_stunExpirationEvent__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./events/stunExpirationEvent */ "./src/combatsimulator/events/stunExpirationEvent.js");
/* harmony import */ var _simResult__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./simResult */ "./src/combatsimulator/simResult.js");














const ONE_SECOND = 1e9;
const HOT_TICK_INTERVAL = 5 * ONE_SECOND;
const DOT_TICK_INTERVAL = 5 * ONE_SECOND;
const REGEN_TICK_INTERVAL = 10 * ONE_SECOND;
const ENEMY_RESPAWN_INTERVAL = 3 * ONE_SECOND;
const PLAYER_RESPAWN_INTERVAL = 150 * ONE_SECOND;

class CombatSimulator extends EventTarget {
    constructor(player, zone) {
        super();
        this.players = [player];
        this.zone = zone;

        this.eventQueue = new _events_eventQueue__WEBPACK_IMPORTED_MODULE_8__["default"]();
        this.simResult = new _simResult__WEBPACK_IMPORTED_MODULE_12__["default"]();
    }

    async simulate(simulationTimeLimit) {
        this.reset();

        let ticks = 0;

        let combatStartEvent = new _events_combatStartEvent__WEBPACK_IMPORTED_MODULE_4__["default"](0);
        this.eventQueue.addEvent(combatStartEvent);

        while (this.simulationTime < simulationTimeLimit) {
            let nextEvent = this.eventQueue.getNextEvent();
            await this.processEvent(nextEvent);

            ticks++;
            if (ticks == 1000) {
                ticks = 0;
                let progressEvent = new CustomEvent("progress", {
                    detail: Math.min(this.simulationTime / simulationTimeLimit, 1),
                });
                this.dispatchEvent(progressEvent);
            }
        }

        this.simResult.simulatedTime = this.simulationTime;

        return this.simResult;
    }

    reset() {
        this.simulationTime = 0;
        this.eventQueue.clear();
        this.simResult = new _simResult__WEBPACK_IMPORTED_MODULE_12__["default"]();
    }

    async processEvent(event) {
        this.simulationTime = event.time;

        // console.log(this.simulationTime / 1e9, event.type, event);

        switch (event.type) {
            case _events_combatStartEvent__WEBPACK_IMPORTED_MODULE_4__["default"].type:
                this.processCombatStartEvent(event);
                break;
            case _events_playerRespawnEvent__WEBPACK_IMPORTED_MODULE_9__["default"].type:
                this.processPlayerRespawnEvent(event);
                break;
            case _events_enemyRespawnEvent__WEBPACK_IMPORTED_MODULE_7__["default"].type:
                this.processEnemyRespawnEvent(event);
                break;
            case _events_autoAttackEvent__WEBPACK_IMPORTED_MODULE_1__["default"].type:
                this.processAutoAttackEvent(event);
                break;
            case _events_consumableTickEvent__WEBPACK_IMPORTED_MODULE_5__["default"].type:
                this.processConsumableTickEvent(event);
                break;
            case _events_bleedTickEvent__WEBPACK_IMPORTED_MODULE_2__["default"].type:
                this.processBleedTickEvent(event);
                break;
            case _events_checkBuffExpirationEvent__WEBPACK_IMPORTED_MODULE_3__["default"].type:
                this.processCheckBuffExpirationEvent(event);
                break;
            case _events_regenTickEvent__WEBPACK_IMPORTED_MODULE_10__["default"].type:
                this.processRegenTickEvent(event);
                break;
            case _events_stunExpirationEvent__WEBPACK_IMPORTED_MODULE_11__["default"].type:
                this.processStunExpirationEvent(event);
                break;
            case _events_cooldownReadyEvent__WEBPACK_IMPORTED_MODULE_6__["default"].type:
                // Only used to check triggers
                break;
        }

        this.checkTriggers();
    }

    processCombatStartEvent(event) {
        this.players[0].reset(this.simulationTime);

        this.players[0].abilities
            .filter((ability) => ability != null)
            .forEach((ability) => {
                let cooldownReadyEvent = new _events_cooldownReadyEvent__WEBPACK_IMPORTED_MODULE_6__["default"](ability.lastUsed + ability.cooldownDuration);
                this.eventQueue.addEvent(cooldownReadyEvent);
            });

        let regenTickEvent = new _events_regenTickEvent__WEBPACK_IMPORTED_MODULE_10__["default"](this.simulationTime + REGEN_TICK_INTERVAL);
        this.eventQueue.addEvent(regenTickEvent);

        this.startNewEncounter();
    }

    processPlayerRespawnEvent(event) {
        this.players[0].combatDetails.currentHitpoints = this.players[0].combatDetails.maxHitpoints;
        this.players[0].combatDetails.currentManapoints = this.players[0].combatDetails.maxManapoints;
        this.players[0].clearBuffs();

        this.startAutoAttacks();
    }

    processEnemyRespawnEvent(event) {
        this.startNewEncounter();
    }

    startNewEncounter() {
        this.enemies = this.zone.getRandomEncounter();

        this.enemies.forEach((enemy) => {
            enemy.reset(this.simulationTime);
            enemy.abilities
                .filter((ability) => ability != null)
                .forEach((ability) => {
                    let cooldownReadyEvent = new _events_cooldownReadyEvent__WEBPACK_IMPORTED_MODULE_6__["default"](ability.lastUsed + ability.cooldownDuration);
                    this.eventQueue.addEvent(cooldownReadyEvent);
                });
            // console.log(enemy.hrid, "spawned");
        });

        this.startAutoAttacks();
    }

    startAutoAttacks() {
        let units = [this.players[0]];
        if (this.enemies) {
            units.push(...this.enemies);
        }

        for (const unit of units) {
            if (unit.combatDetails.currentHitpoints <= 0) {
                continue;
            }

            this.addNextAutoAttackEvent(unit);
        }
    }

    processAutoAttackEvent(event) {
        // console.log("source:", event.source.hrid);

        let target;
        if (event.source.isPlayer) {
            target = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].getTarget(this.enemies);
        } else {
            target = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].getTarget(this.players);
        }

        if (!target) {
            return;
        }

        let attackResult = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].processAttack(event.source, target);

        this.simResult.addAttack(
            event.source,
            target,
            "autoAttack",
            attackResult.didHit ? attackResult.damageDone : "miss"
        );

        if (attackResult.lifeStealHeal > 0) {
            this.simResult.addHitpointsGained(event.source, "lifesteal", attackResult.lifeStealHeal);
        }

        if (attackResult.reflectDamageDone > 0) {
            this.simResult.addAttack(target, event.source, "physicalReflect", attackResult.reflectDamageDone);
        }

        for (const [skill, xp] of Object.entries(attackResult.experienceGained.source)) {
            this.simResult.addExperienceGain(event.source, skill, xp);
        }
        for (const [skill, xp] of Object.entries(attackResult.experienceGained.target)) {
            this.simResult.addExperienceGain(target, skill, xp);
        }

        if (target.combatDetails.currentHitpoints == 0) {
            this.eventQueue.clearEventsForUnit(target);
            this.simResult.addDeath(target);
            // console.log(target.hrid, "died");
        }

        // Could die from reflect damage
        if (event.source.combatDetails.currentHitpoints == 0) {
            this.eventQueue.clearEventsForUnit(event.source);
            this.simResult.addDeath(event.source);
        }

        if (!this.checkEncounterEnd()) {
            this.addNextAutoAttackEvent(event.source);
        }
    }

    checkEncounterEnd() {
        let encounterEnded = false;

        if (this.enemies && !this.enemies.some((enemy) => enemy.combatDetails.currentHitpoints > 0)) {
            this.eventQueue.clearEventsOfType(_events_autoAttackEvent__WEBPACK_IMPORTED_MODULE_1__["default"].type);
            let enemyRespawnEvent = new _events_enemyRespawnEvent__WEBPACK_IMPORTED_MODULE_7__["default"](this.simulationTime + ENEMY_RESPAWN_INTERVAL);
            this.eventQueue.addEvent(enemyRespawnEvent);
            this.enemies = null;

            this.simResult.addEncounterEnd();
            // console.log("All enemies died");

            encounterEnded = true;
        }

        if (
            !this.players.some((player) => player.combatDetails.currentHitpoints > 0) &&
            !this.eventQueue.containsEventOfType(_events_playerRespawnEvent__WEBPACK_IMPORTED_MODULE_9__["default"].type)
        ) {
            this.eventQueue.clearEventsOfType(_events_autoAttackEvent__WEBPACK_IMPORTED_MODULE_1__["default"].type);
            // 120 seconds respawn and 30 seconds traveling to battle
            let playerRespawnEvent = new _events_playerRespawnEvent__WEBPACK_IMPORTED_MODULE_9__["default"](this.simulationTime + PLAYER_RESPAWN_INTERVAL);
            this.eventQueue.addEvent(playerRespawnEvent);
            // console.log("Player died");

            encounterEnded = true;
        }

        return encounterEnded;
    }

    addNextAutoAttackEvent(source) {
        let autoAttackEvent = new _events_autoAttackEvent__WEBPACK_IMPORTED_MODULE_1__["default"](
            this.simulationTime + source.combatDetails.combatStats.attackInterval,
            source
        );
        this.eventQueue.addEvent(autoAttackEvent);
    }

    processConsumableTickEvent(event) {
        if (event.consumable.hitpointRestore > 0) {
            let tickValue = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].calculateTickValue(
                event.consumable.hitpointRestore,
                event.totalTicks,
                event.currentTick
            );
            let hitpointsAdded = event.source.addHitpoints(tickValue);
            this.simResult.addHitpointsGained(event.source, event.consumable.hrid, hitpointsAdded);
            // console.log("Added hitpoints:", hitpointsAdded);
        }

        if (event.consumable.manapointRestore > 0) {
            let tickValue = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].calculateTickValue(
                event.consumable.manapointRestore,
                event.totalTicks,
                event.currentTick
            );
            let manapointsAdded = event.source.addManapoints(tickValue);
            this.simResult.addManapointsGained(event.source, event.consumable.hrid, manapointsAdded);
            // console.log("Added manapoints:", manapointsAdded);
        }

        if (event.currentTick < event.totalTicks) {
            let consumableTickEvent = new _events_consumableTickEvent__WEBPACK_IMPORTED_MODULE_5__["default"](
                this.simulationTime + HOT_TICK_INTERVAL,
                event.source,
                event.consumable,
                event.totalTicks,
                event.currentTick + 1
            );
            this.eventQueue.addEvent(consumableTickEvent);
        }
    }

    processBleedTickEvent(event) {
        let tickDamage = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].calculateTickValue(event.damage, event.totalTicks, event.currentTick);
        let damage = Math.min(tickDamage, event.target.combatDetails.currentHitpoints);

        event.target.combatDetails.currentHitpoints -= damage;
        this.simResult.addAttack(event.sourceRef, event.target, "bleed", damage);

        let targetStaminaExperience = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].calculateStaminaExperience(0, damage);
        this.simResult.addExperienceGain(event.target, "stamina", targetStaminaExperience);
        // console.log(event.target.hrid, "bleed for", damage);

        if (event.currentTick < event.totalTicks) {
            let bleedTickEvent = new _events_bleedTickEvent__WEBPACK_IMPORTED_MODULE_2__["default"](
                this.simulationTime + DOT_TICK_INTERVAL,
                event.sourceRef,
                event.target,
                event.damage,
                event.totalTicks,
                event.currentTick + 1
            );
            this.eventQueue.addEvent(bleedTickEvent);
        }

        if (event.target.combatDetails.currentHitpoints == 0) {
            this.eventQueue.clearEventsForUnit(event.target);
            this.simResult.addDeath(event.target);
        }

        this.checkEncounterEnd();
    }

    processRegenTickEvent(event) {
        let units = [...this.players];
        if (this.enemies) {
            units.push(...this.enemies);
        }

        for (const unit of units) {
            if (unit.combatDetails.currentHitpoints <= 0) {
                continue;
            }

            let hitpointRegen = Math.floor(unit.combatDetails.maxHitpoints * unit.combatDetails.combatStats.HPRegen);
            let hitpointsAdded = unit.addHitpoints(hitpointRegen);
            this.simResult.addHitpointsGained(unit, "regen", hitpointsAdded);
            // console.log("Added hitpoints:", hitpointsAdded);

            let manapointRegen = Math.floor(unit.combatDetails.maxManapoints * unit.combatDetails.combatStats.MPRegen);
            let manapointsAdded = unit.addManapoints(manapointRegen);
            this.simResult.addManapointsGained(unit, "regen", manapointsAdded);
            // console.log("Added manapoints:", manapointsAdded);
        }

        let regenTickEvent = new _events_regenTickEvent__WEBPACK_IMPORTED_MODULE_10__["default"](this.simulationTime + REGEN_TICK_INTERVAL);
        this.eventQueue.addEvent(regenTickEvent);
    }

    processCheckBuffExpirationEvent(event) {
        event.source.removeExpiredBuffs(this.simulationTime);
    }

    processStunExpirationEvent(event) {
        event.source.isStunned = false;
        this.addNextAutoAttackEvent(event.source);
    }

    checkTriggers() {
        let triggeredSomething;

        do {
            triggeredSomething = false;

            this.players
                .filter((player) => player.combatDetails.currentHitpoints > 0)
                .forEach((player) => {
                    if (this.checkTriggersForUnit(player, this.players, this.enemies)) {
                        triggeredSomething = true;
                    }
                });

            if (this.enemies) {
                this.enemies
                    .filter((enemy) => enemy.combatDetails.currentHitpoints > 0)
                    .forEach((enemy) => {
                        if (this.checkTriggersForUnit(enemy, this.enemies, this.players)) {
                            triggeredSomething = true;
                        }
                    });
            }
        } while (triggeredSomething);
    }

    checkTriggersForUnit(unit, friendlies, enemies) {
        if (unit.combatDetails.currentHitpoints <= 0) {
            throw new Error("Checking triggers for a dead unit");
        }

        let triggeredSomething = false;
        let target = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].getTarget(enemies);

        for (const food of unit.food) {
            if (food && food.shouldTrigger(this.simulationTime, unit, target, friendlies, enemies)) {
                let result = this.tryUseConsumable(unit, food);
                if (result) {
                    triggeredSomething = true;
                }
            }
        }

        for (const drink of unit.drinks) {
            if (drink && drink.shouldTrigger(this.simulationTime, unit, target, friendlies, enemies)) {
                let result = this.tryUseConsumable(unit, drink);
                if (result) {
                    triggeredSomething = true;
                }
            }
        }

        for (const ability of unit.abilities) {
            if (ability && ability.shouldTrigger(this.simulationTime, unit, target, friendlies, enemies)) {
                let result = this.tryUseAbility(unit, ability);
                if (result) {
                    triggeredSomething = true;
                }
            }
        }

        return triggeredSomething;
    }

    tryUseConsumable(source, consumable) {
        // console.log("Consuming:", consumable);

        if (source.combatDetails.currentHitpoints <= 0) {
            return false;
        }

        consumable.lastUsed = this.simulationTime;
        let cooldownReadyEvent = new _events_cooldownReadyEvent__WEBPACK_IMPORTED_MODULE_6__["default"](this.simulationTime + consumable.cooldownDuration);
        this.eventQueue.addEvent(cooldownReadyEvent);

        this.simResult.addConsumableUse(source, consumable);

        if (consumable.recoveryDuration == 0) {
            if (consumable.hitpointRestore > 0) {
                let hitpointsAdded = source.addHitpoints(consumable.hitpointRestore);
                this.simResult.addHitpointsGained(source, consumable.hrid, hitpointsAdded);
                // console.log("Added hitpoints:", hitpointsAdded);
            }

            if (consumable.manapointRestore > 0) {
                let manapointsAdded = source.addManapoints(consumable.manapointRestore);
                this.simResult.addManapointsGained(source, consumable.hrid, manapointsAdded);
                // console.log("Added manapoints:", manapointsAdded);
            }
        } else {
            let consumableTickEvent = new _events_consumableTickEvent__WEBPACK_IMPORTED_MODULE_5__["default"](
                this.simulationTime + HOT_TICK_INTERVAL,
                source,
                consumable,
                consumable.recoveryDuration / HOT_TICK_INTERVAL,
                1
            );
            this.eventQueue.addEvent(consumableTickEvent);
        }

        for (const buff of consumable.buffs) {
            source.addBuff(buff, this.simulationTime);
            // console.log("Added buff:", buff);
            let checkBuffExpirationEvent = new _events_checkBuffExpirationEvent__WEBPACK_IMPORTED_MODULE_3__["default"](this.simulationTime + buff.duration, source);
            this.eventQueue.addEvent(checkBuffExpirationEvent);
        }

        return true;
    }

    tryUseAbility(source, ability) {
        if (source.combatDetails.currentHitpoints <= 0) {
            return false;
        }

        if (source.combatDetails.currentManapoints < ability.manaCost) {
            if (source.isPlayer) {
                this.simResult.playerRanOutOfMana = true;
            }
            return false;
        }

        // console.log("Casting:", ability);

        source.combatDetails.currentManapoints -= ability.manaCost;

        let sourceIntelligenceExperience = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].calculateIntelligenceExperience(ability.manaCost);
        this.simResult.addExperienceGain(source, "intelligence", sourceIntelligenceExperience);

        ability.lastUsed = this.simulationTime;
        let cooldownReadyEvent = new _events_cooldownReadyEvent__WEBPACK_IMPORTED_MODULE_6__["default"](this.simulationTime + ability.cooldownDuration);
        this.eventQueue.addEvent(cooldownReadyEvent);

        for (const abilityEffect of ability.abilityEffects) {
            switch (abilityEffect.effectType) {
                case "/ability_effect_types/buff":
                    this.processAbilityBuffEffect(source, ability, abilityEffect);
                    break;
                case "/ability_effect_types/damage":
                    this.processAbilityDamageEffect(source, ability, abilityEffect);
                    break;
                case "/ability_effect_types/heal":
                    this.processAbilityHealEffect(source, ability, abilityEffect);
                    break;
                default:
                    throw new Error("Unsupported effect type for ability: " + ability.hrid);
            }
        }

        // Could die from reflect damage
        if (source.combatDetails.currentHitpoints == 0) {
            this.eventQueue.clearEventsForUnit(source);
            this.simResult.addDeath(source);
        }

        this.checkEncounterEnd();

        return true;
    }

    processAbilityBuffEffect(source, ability, abilityEffect) {
        if (abilityEffect.targetType != "self") {
            throw new Error("Unsupported target type for buff ability effect: " + ability.hrid);
        }

        for (const buff of abilityEffect.buffs) {
            source.addBuff(buff, this.simulationTime);
            // console.log("Added buff:", abilityEffect.buff);
            let checkBuffExpirationEvent = new _events_checkBuffExpirationEvent__WEBPACK_IMPORTED_MODULE_3__["default"](this.simulationTime + buff.duration, source);
            this.eventQueue.addEvent(checkBuffExpirationEvent);
        }
    }

    processAbilityDamageEffect(source, ability, abilityEffect) {
        let targets;
        switch (abilityEffect.targetType) {
            case "enemy":
                targets = source.isPlayer
                    ? [_combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].getTarget(this.enemies)]
                    : [_combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].getTarget(this.players)];
                break;
            case "all enemies":
                targets = source.isPlayer ? this.enemies : this.players;
                break;
            default:
                throw new Error("Unsupported target type for damage ability effect: " + ability.hrid);
        }

        for (const target of targets.filter((unit) => unit && unit.combatDetails.currentHitpoints > 0)) {
            let attackResult = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].processAttack(source, target, abilityEffect);

            if (attackResult.didHit && abilityEffect.buffs) {
                for (const buff of abilityEffect.buffs) {
                    target.addBuff(buff, this.simulationTime);
                    let checkBuffExpirationEvent = new _events_checkBuffExpirationEvent__WEBPACK_IMPORTED_MODULE_3__["default"](
                        this.simulationTime + buff.duration,
                        target
                    );
                    this.eventQueue.addEvent(checkBuffExpirationEvent);
                }
            }

            if (abilityEffect.bleedRatio > 0 && attackResult.damageDone > 0) {
                let bleedTickEvent = new _events_bleedTickEvent__WEBPACK_IMPORTED_MODULE_2__["default"](
                    this.simulationTime + DOT_TICK_INTERVAL,
                    source,
                    target,
                    attackResult.damageDone * abilityEffect.bleedRatio,
                    abilityEffect.bleedDuration / DOT_TICK_INTERVAL,
                    1
                );
                this.eventQueue.addEvent(bleedTickEvent);
            }

            if (attackResult.didHit && abilityEffect.stunChance > 0 && Math.random() < abilityEffect.stunChance) {
                target.isStunned = true;
                target.stunExpireTime = this.simulationTime + abilityEffect.stunDuration;
                this.eventQueue.clearMatching((event) => event.type == _events_autoAttackEvent__WEBPACK_IMPORTED_MODULE_1__["default"].type && event.source == target);
                let stunExpirationEvent = new _events_stunExpirationEvent__WEBPACK_IMPORTED_MODULE_11__["default"](target.stunExpireTime, target);
                this.eventQueue.addEvent(stunExpirationEvent);
            }

            this.simResult.addAttack(
                source,
                target,
                ability.hrid,
                attackResult.didHit ? attackResult.damageDone : "miss"
            );

            if (attackResult.reflectDamageDone > 0) {
                this.simResult.addAttack(target, source, "physicalReflect", attackResult.reflectDamageDone);
            }

            for (const [skill, xp] of Object.entries(attackResult.experienceGained.source)) {
                this.simResult.addExperienceGain(source, skill, xp);
            }
            for (const [skill, xp] of Object.entries(attackResult.experienceGained.target)) {
                this.simResult.addExperienceGain(target, skill, xp);
            }

            if (target.combatDetails.currentHitpoints == 0) {
                this.eventQueue.clearEventsForUnit(target);
                this.simResult.addDeath(target);
                // console.log(target.hrid, "died");
            }
        }
    }

    processAbilityHealEffect(source, ability, abilityEffect) {
        if (abilityEffect.targetType != "self") {
            throw new Error("Unsupported target type for heal ability effect: " + ability.hrid);
        }

        let amountHealed = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].processHeal(source, abilityEffect);
        let experienceGained = _combatUtilities__WEBPACK_IMPORTED_MODULE_0__["default"].calculateMagicExperience(amountHealed);

        this.simResult.addHitpointsGained(source, ability.hrid, amountHealed);
        this.simResult.addExperienceGain(source, "magic", experienceGained);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CombatSimulator);


/***/ }),

/***/ "./src/combatsimulator/combatUnit.js":
/*!*******************************************!*\
  !*** ./src/combatsimulator/combatUnit.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class CombatUnit {
    isPlayer;
    isStunned = false;
    stunExpireTime = null;

    // Base levels which don't change after initialization
    staminaLevel = 1;
    intelligenceLevel = 1;
    attackLevel = 1;
    powerLevel = 1;
    defenseLevel = 1;
    rangedLevel = 1;
    magicLevel = 1;

    abilities = [null, null, null, null];
    food = [null, null, null];
    drinks = [null, null, null];

    // Calculated combat stats including temporary buffs
    combatDetails = {
        staminaLevel: 1,
        intelligenceLevel: 1,
        attackLevel: 1,
        powerLevel: 1,
        defenseLevel: 1,
        rangedLevel: 1,
        magicLevel: 1,
        maxHitpoints: 110,
        currentHitpoints: 110,
        maxManapoints: 110,
        currentManapoints: 110,
        stabAccuracyRating: 11,
        slashAccuracyRating: 11,
        smashAccuracyRating: 11,
        rangedAccuracyRating: 11,
        stabMaxDamage: 11,
        slashMaxDamage: 11,
        smashMaxDamage: 11,
        rangedMaxDamage: 11,
        magicMaxDamage: 11,
        stabEvasionRating: 11,
        slashEvasionRating: 11,
        smashEvasionRating: 11,
        rangedEvasionRating: 11,
        totalArmor: 0.2,
        totalWaterResistance: 0.4,
        totalNatureResistance: 0.4,
        totalFireResistance: 0.4,
        combatStats: {
            combatStyleHrid: "/combat_styles/smash",
            damageType: "/damage_types/physical",
            attackInterval: 3000000000,
            stabAccuracy: 0,
            slashAccuracy: 0,
            smashAccuracy: 0,
            rangedAccuracy: 0,
            stabDamage: 0,
            slashDamage: 0,
            smashDamage: 0,
            rangedDamage: 0,
            magicDamage: 0,
            physicalAmplify: 0,
            waterAmplify: 0,
            natureAmplify: 0,
            fireAmplify: 0,
            healingAmplify: 0,
            stabEvasion: 0,
            slashEvasion: 0,
            smashEvasion: 0,
            rangedEvasion: 0,
            armor: 0,
            waterResistance: 0,
            natureResistance: 0,
            fireResistance: 0,
            maxHitpoints: 0,
            maxManapoints: 0,
            lifeSteal: 0,
            HPRegen: 0.01,
            MPRegen: 0.01,
            physicalReflectPower: 0,
            dropRate: 0,
            dropQuantity: 0,
            experienceRate: 0,
            foodSlots: 1,
            drinkSlots: 1,
        },
    };
    combatBuffs = {};

    constructor() {}

    updateCombatDetails() {
        this.combatDetails.combatStats.HPRegen = 0.01;
        this.combatDetails.combatStats.MPRegen = 0.01;

        ["stamina", "intelligence", "attack", "power", "defense", "ranged", "magic"].forEach((stat) => {
            this.combatDetails[stat + "Level"] = this[stat + "Level"];
            let boosts = this.getBuffBoosts("/buff_types/" + stat + "_level");
            boosts.forEach((buff) => {
                this.combatDetails[stat + "Level"] += Math.floor(this[stat + "Level"] * buff.ratioBoost);
                this.combatDetails[stat + "Level"] += buff.flatBoost;
            });
        });

        this.combatDetails.maxHitpoints =
            10 * (10 + this.combatDetails.staminaLevel) + this.combatDetails.combatStats.maxHitpoints;
        this.combatDetails.maxManapoints =
            10 * (10 + this.combatDetails.intelligenceLevel) + this.combatDetails.combatStats.maxManapoints;

        let accuracyRatioBoost = this.getBuffBoost("/buff_types/accuracy").ratioBoost;
        let damageRatioBoost = this.getBuffBoost("/buff_types/damage").ratioBoost;

        ["stab", "slash", "smash"].forEach((style) => {
            this.combatDetails[style + "AccuracyRating"] =
                (10 + this.combatDetails.attackLevel) *
                (1 + this.combatDetails.combatStats[style + "Accuracy"]) *
                (1 + accuracyRatioBoost);
            this.combatDetails[style + "MaxDamage"] =
                (10 + this.combatDetails.powerLevel) *
                (1 + this.combatDetails.combatStats[style + "Damage"]) *
                (1 + damageRatioBoost);
            this.combatDetails[style + "EvasionRating"] =
                (10 + this.combatDetails.defenseLevel) * (1 + this.combatDetails.combatStats[style + "Evasion"]);
        });

        this.combatDetails.rangedAccuracyRating =
            (10 + this.combatDetails.rangedLevel) *
            (1 + this.combatDetails.combatStats.rangedAccuracy) *
            (1 + accuracyRatioBoost);
        this.combatDetails.rangedMaxDamage =
            (10 + this.combatDetails.rangedLevel) *
            (1 + this.combatDetails.combatStats.rangedDamage) *
            (1 + damageRatioBoost);
        this.combatDetails.rangedEvasionRating =
            (10 + this.combatDetails.defenseLevel) * (1 + this.combatDetails.combatStats.rangedEvasion);

        this.combatDetails.magicMaxDamage =
            (10 + this.combatDetails.magicLevel) *
            (1 + this.combatDetails.combatStats.magicDamage) *
            (1 + damageRatioBoost);

        this.combatDetails.combatStats.physicalAmplify += this.getBuffBoost("/buff_types/physical_amplify").flatBoost;
        this.combatDetails.combatStats.waterAmplify += this.getBuffBoost("/buff_types/water_amplify").flatBoost;
        this.combatDetails.combatStats.natureAmplify += this.getBuffBoost("/buff_types/nature_amplify").flatBoost;
        this.combatDetails.combatStats.fireAmplify += this.getBuffBoost("/buff_types/fire_amplify").flatBoost;

        let attackIntervalBoosts = this.getBuffBoosts("/buff_types/attack_speed");
        let attackIntervalRatioBoost = attackIntervalBoosts
            .map((boost) => boost.ratioBoost)
            .reduce((prev, cur) => prev + cur, 0);
        this.combatDetails.combatStats.attackInterval =
            this.combatDetails.combatStats.attackInterval * (1 / (1 + attackIntervalRatioBoost));

        let baseArmor = 0.2 * this.combatDetails.defenseLevel + this.combatDetails.combatStats.armor;
        this.combatDetails.totalArmor = baseArmor;
        let armorBoosts = this.getBuffBoosts("/buff_types/armor");
        for (const boost of armorBoosts) {
            this.combatDetails.totalArmor += boost.flatBoost;
            this.combatDetails.totalArmor += baseArmor * boost.ratioBoost;
        }

        let baseWaterResistance =
            0.1 * this.combatDetails.defenseLevel +
            0.3 * this.combatDetails.magicLevel +
            this.combatDetails.combatStats.waterResistance;
        this.combatDetails.totalWaterResistance = baseWaterResistance;
        let waterResistanceBoosts = this.getBuffBoosts("/buff_types/water_resistance");
        for (const boost of waterResistanceBoosts) {
            this.combatDetails.totalWaterResistance += boost.flatBoost;
            this.combatDetails.totalWaterResistance += baseWaterResistance * boost.ratioBoost;
        }

        let baseNatureResistance =
            0.1 * this.combatDetails.defenseLevel +
            0.3 * this.combatDetails.magicLevel +
            this.combatDetails.combatStats.natureResistance;
        this.combatDetails.totalNatureResistance = baseNatureResistance;
        let natureResistanceBoosts = this.getBuffBoosts("/buff_types/nature_resistance");
        for (const boost of natureResistanceBoosts) {
            this.combatDetails.totalNatureResistance += boost.flatBoost;
            this.combatDetails.totalNatureResistance += baseNatureResistance * boost.ratioBoost;
        }

        let baseFireResistance =
            0.1 * this.combatDetails.defenseLevel +
            0.3 * this.combatDetails.magicLevel +
            this.combatDetails.combatStats.fireResistance;
        this.combatDetails.totalFireResistance = baseFireResistance;
        let fireResistanceBoosts = this.getBuffBoosts("/buff_types/fire_resistance");
        for (const boost of fireResistanceBoosts) {
            this.combatDetails.totalFireResistance += boost.flatBoost;
            this.combatDetails.totalFireResistance += baseFireResistance * boost.ratioBoost;
        }

        this.combatDetails.combatStats.lifeSteal += this.getBuffBoost("/buff_types/life_steal").flatBoost;
        this.combatDetails.combatStats.HPRegen += this.getBuffBoost("/buff_types/hp_regen").flatBoost;
        this.combatDetails.combatStats.MPRegen += this.getBuffBoost("/buff_types/mp_regen").flatBoost;
        this.combatDetails.combatStats.physicalReflectPower += this.getBuffBoost(
            "/buff_types/physical_reflect_power"
        ).flatBoost;
        this.combatDetails.combatStats.dropRate += this.getBuffBoost("/buff_types/combat_drop_rate").ratioBoost;
        this.combatDetails.combatStats.experienceRate += this.getBuffBoost("/buff_types/wisdom").flatBoost;
    }

    addBuff(buff, currentTime) {
        buff.startTime = currentTime;
        this.combatBuffs[buff.sourceHrid] = buff;

        this.updateCombatDetails();
    }

    removeExpiredBuffs(currentTime) {
        let expiredBuffs = Object.values(this.combatBuffs).filter(
            (buff) => buff.startTime + buff.duration <= currentTime
        );
        expiredBuffs.forEach((buff) => {
            delete this.combatBuffs[buff.sourceHrid];
        });

        this.updateCombatDetails();
    }

    clearBuffs() {
        this.combatBuffs = {};
        this.updateCombatDetails();
    }

    getBuffBoosts(type) {
        let boosts = [];
        Object.values(this.combatBuffs)
            .filter((buff) => buff.typeHrid == type)
            .forEach((buff) => {
                boosts.push({ ratioBoost: buff.ratioBoost, flatBoost: buff.flatBoost });
            });

        return boosts;
    }

    getBuffBoost(type) {
        let boosts = this.getBuffBoosts(type);

        if (boosts.length > 1) {
            throw new Error("Using getBuffBoost with multiple buffs active: " + type);
        }

        let boost = {
            ratioBoost: boosts[0]?.ratioBoost ?? 0,
            flatBoost: boosts[0]?.flatBoost ?? 0,
        };

        return boost;
    }

    reset(currentTime = 0) {
        this.isStunned = false;
        this.stunExpireTime = null;

        this.clearBuffs();
        this.updateCombatDetails();
        this.resetCooldowns(currentTime);

        this.combatDetails.currentHitpoints = this.combatDetails.maxHitpoints;
        this.combatDetails.currentManapoints = this.combatDetails.maxManapoints;
    }

    resetCooldowns(currentTime = 0) {
        this.food.filter((food) => food != null).forEach((food) => (food.lastUsed = Number.MIN_SAFE_INTEGER));
        this.drinks.filter((drink) => drink != null).forEach((drink) => (drink.lastUsed = Number.MIN_SAFE_INTEGER));

        this.abilities
            .filter((ability) => ability != null)
            .forEach((ability) => {
                if (this.isPlayer) {
                    ability.lastUsed = Number.MIN_SAFE_INTEGER;
                } else {
                    ability.lastUsed = currentTime - Math.floor(Math.random() * ability.cooldownDuration);
                }
            });
    }

    addHitpoints(hitpoints) {
        let hitpointsAdded = 0;

        if (this.combatDetails.currentHitpoints >= this.combatDetails.maxHitpoints) {
            return hitpointsAdded;
        }

        let newHitpoints = Math.min(this.combatDetails.currentHitpoints + hitpoints, this.combatDetails.maxHitpoints);
        hitpointsAdded = newHitpoints - this.combatDetails.currentHitpoints;
        this.combatDetails.currentHitpoints = newHitpoints;

        return hitpointsAdded;
    }

    addManapoints(manapoints) {
        let manapointsAdded = 0;

        if (this.combatDetails.currentManapoints >= this.combatDetails.maxManapoints) {
            return manapointsAdded;
        }

        let newManapoints = Math.min(
            this.combatDetails.currentManapoints + manapoints,
            this.combatDetails.maxManapoints
        );
        manapointsAdded = newManapoints - this.combatDetails.currentManapoints;
        this.combatDetails.currentManapoints = newManapoints;

        return manapointsAdded;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CombatUnit);


/***/ }),

/***/ "./src/combatsimulator/combatUtilities.js":
/*!************************************************!*\
  !*** ./src/combatsimulator/combatUtilities.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class CombatUtilities {
    static getTarget(enemies) {
        if (!enemies) {
            return null;
        }
        let target = enemies.find((enemy) => enemy.combatDetails.currentHitpoints > 0);

        return target ?? null;
    }

    static randomInt(min, max) {
        if (max < min) {
            let temp = min;
            min = max;
            max = temp;
        }

        let minCeil = Math.ceil(min);
        let maxFloor = Math.floor(max);

        if (Math.floor(min) == maxFloor) {
            return Math.floor((min + max) / 2 + Math.random());
        }

        let minTail = -1 * (min - minCeil);
        let maxTail = max - maxFloor;

        let balancedWeight = 2 * minTail + (maxFloor - minCeil);
        let balancedAverage = (maxFloor + minCeil) / 2;
        let average = (max + min) / 2;
        let extraTailWeight = (balancedWeight * (average - balancedAverage)) / (maxFloor + 1 - average);
        let extraTailChance = Math.abs(extraTailWeight / (extraTailWeight + balancedWeight));

        if (Math.random() < extraTailChance) {
            if (maxTail > minTail) {
                return Math.floor(maxFloor + 1);
            } else {
                return Math.floor(minCeil - 1);
            }
        }

        if (maxTail > minTail) {
            return Math.floor(min + Math.random() * (maxFloor + minTail - min + 1));
        } else {
            return Math.floor(minCeil - maxTail + Math.random() * (max - (minCeil - maxTail) + 1));
        }
    }

    static processAttack(source, target, abilityEffect = null) {
        let combatStyle = abilityEffect
            ? abilityEffect.combatStyleHrid
            : source.combatDetails.combatStats.combatStyleHrid;
        let damageType = abilityEffect ? abilityEffect.damageType : source.combatDetails.combatStats.damageType;

        let sourceAccuracyRating = 1;
        let sourceAutoAttackMaxDamage = 1;
        let targetEvasionRating = 1;

        switch (combatStyle) {
            case "/combat_styles/stab":
                sourceAccuracyRating = source.combatDetails.stabAccuracyRating;
                sourceAutoAttackMaxDamage = source.combatDetails.stabMaxDamage;
                targetEvasionRating = target.combatDetails.stabEvasionRating;
                break;
            case "/combat_styles/slash":
                sourceAccuracyRating = source.combatDetails.slashAccuracyRating;
                sourceAutoAttackMaxDamage = source.combatDetails.slashMaxDamage;
                targetEvasionRating = target.combatDetails.slashEvasionRating;
                break;
            case "/combat_styles/smash":
                sourceAccuracyRating = source.combatDetails.smashAccuracyRating;
                sourceAutoAttackMaxDamage = source.combatDetails.smashMaxDamage;
                targetEvasionRating = target.combatDetails.smashEvasionRating;
                break;
            case "/combat_styles/ranged":
                sourceAccuracyRating = source.combatDetails.rangedAccuracyRating;
                sourceAutoAttackMaxDamage = source.combatDetails.rangedMaxDamage;
                targetEvasionRating = target.combatDetails.rangedEvasionRating;
                break;
            case "/combat_styles/magic":
                sourceAutoAttackMaxDamage = source.combatDetails.magicMaxDamage;
                break;
            default:
                throw new Error("Unknown combat style: " + combatStyle);
        }

        let sourceDamageMultiplier = 1;
        let sourceResistance = 0;
        let targetResistance = 0;
        let targetReflectPower = 0;

        switch (damageType) {
            case "/damage_types/physical":
                sourceDamageMultiplier = 1 + source.combatDetails.combatStats.physicalAmplify;
                sourceResistance = source.combatDetails.totalArmor;
                targetResistance = target.combatDetails.totalArmor;
                targetReflectPower = target.combatDetails.combatStats.physicalReflectPower;
                break;
            case "/damage_types/water":
                sourceDamageMultiplier = 1 + source.combatDetails.combatStats.waterAmplify;
                sourceResistance = source.combatDetails.totalWaterResistance;
                targetResistance = target.combatDetails.totalWaterResistance;
                break;
            case "/damage_types/nature":
                sourceDamageMultiplier = 1 + source.combatDetails.combatStats.natureAmplify;
                sourceResistance = source.combatDetails.totalNatureResistance;
                targetResistance = target.combatDetails.totalNatureResistance;
                break;
            case "/damage_types/fire":
                sourceDamageMultiplier = 1 + source.combatDetails.combatStats.fireAmplify;
                sourceResistance = source.combatDetails.totalFireResistance;
                targetResistance = target.combatDetails.totalFireResistance;
                break;
            default:
                throw new Error("Unknown damage type: " + damageType);
        }

        let hitChance = 1;
        let critChance = 0;

        if (combatStyle != "/combat_styles/magic") {
            hitChance =
                Math.pow(sourceAccuracyRating, 1.4) /
                (Math.pow(sourceAccuracyRating, 1.4) + Math.pow(targetEvasionRating, 1.4));
        }

        if (combatStyle == "/combat_styles/ranged") {
            critChance = 0.3 * hitChance;
        }

        let baseDamageFlat = abilityEffect ? abilityEffect.damageFlat : 0;
        let baseDamageRatio = abilityEffect ? abilityEffect.damageRatio : 1;

        let sourceMinDamage = sourceDamageMultiplier * (1 + baseDamageFlat);
        let sourceMaxDamage = sourceDamageMultiplier * (baseDamageRatio * sourceAutoAttackMaxDamage + baseDamageFlat);

        if (Math.random() < critChance) {
            sourceMinDamage = sourceMaxDamage;
        }

        let damageRoll = CombatUtilities.randomInt(sourceMinDamage, sourceMaxDamage);
        let maxPremitigatedDamage = Math.min(damageRoll, target.combatDetails.currentHitpoints);

        let damageDone = 0;
        let mitigatedReflectDamage = 0;
        let reflectDamageDone = 0;

        let didHit = false;
        if (Math.random() < hitChance) {
            didHit = true;

            let targetDamageTakenRatio = 100 / (100 + targetResistance);
            if (targetResistance < 0) {
                targetDamageTakenRatio = (100 - targetResistance) / 100;
            }

            let mitigatedDamage = Math.ceil(targetDamageTakenRatio * damageRoll);
            damageDone = Math.min(mitigatedDamage, target.combatDetails.currentHitpoints);
            target.combatDetails.currentHitpoints -= damageDone;
        }

        if (targetReflectPower > 0 && targetResistance > 0) {
            let sourceDamageTakenRatio = 100 / (100 + sourceResistance);
            if (sourceResistance < 0) {
                sourceDamageTakenRatio = (100 - sourceResistance) / 100;
            }

            let reflectDamage = Math.ceil(targetReflectPower * targetResistance);
            mitigatedReflectDamage = Math.ceil(sourceDamageTakenRatio * reflectDamage);
            reflectDamageDone = Math.min(mitigatedReflectDamage, source.combatDetails.currentHitpoints);
            source.combatDetails.currentHitpoints -= reflectDamageDone;
        }

        let lifeStealHeal = 0;
        if (!abilityEffect && didHit && source.combatDetails.combatStats.lifeSteal > 0) {
            lifeStealHeal = source.addHitpoints(Math.floor(source.combatDetails.combatStats.lifeSteal * damageDone));
        }

        let experienceGained = {
            source: {
                attack: 0,
                power: 0,
                ranged: 0,
                magic: 0,
            },
            target: {
                defense: 0,
                stamina: 0,
            },
        };

        switch (combatStyle) {
            case "/combat_styles/stab":
                experienceGained.source.attack = this.calculateAttackExperience(damageDone, combatStyle);
                break;
            case "/combat_styles/slash":
                experienceGained.source.attack = this.calculateAttackExperience(damageDone, combatStyle);
                experienceGained.source.power = this.calculatePowerExperience(damageDone, combatStyle);
                break;
            case "/combat_styles/smash":
                experienceGained.source.power = this.calculatePowerExperience(damageDone, combatStyle);
                break;
            case "/combat_styles/ranged":
                experienceGained.source.ranged = this.calculateRangedExperience(damageDone);
                break;
            case "/combat_styles/magic":
                experienceGained.source.magic = this.calculateMagicExperience(damageDone);
                break;
        }

        let damagePrevented = maxPremitigatedDamage - damageDone;

        experienceGained.target.defense = this.calculateDefenseExperience(damagePrevented);
        experienceGained.target.stamina = this.calculateStaminaExperience(damagePrevented, damageDone);

        if (mitigatedReflectDamage > 0) {
            experienceGained.target.defense += this.calculateDefenseExperience(mitigatedReflectDamage);
        }

        return { damageDone, didHit, reflectDamageDone, lifeStealHeal, experienceGained };
    }

    static processHeal(source, abilityEffect) {
        if (abilityEffect.combatStyleHrid != "/combat_styles/magic") {
            throw new Error("Heal ability effect not supported for combat style: " + abilityEffect.combatStyleHrid);
        }

        let healingAmplify = 1 + source.combatDetails.combatStats.healingAmplify;
        let magicMaxDamage = source.combatDetails.magicMaxDamage;

        let baseHealFlat = abilityEffect.damageFlat;
        let baseHealRatio = abilityEffect.damageRatio;

        let minHeal = healingAmplify * (1 + baseHealFlat);
        let maxHeal = healingAmplify * (baseHealRatio * magicMaxDamage + baseHealFlat);

        let heal = this.randomInt(minHeal, maxHeal);
        let amountHealed = source.addHitpoints(heal);

        return amountHealed;
    }

    static calculateTickValue(totalValue, totalTicks, currentTick) {
        let currentSum = Math.floor((currentTick * totalValue) / totalTicks);
        let previousSum = Math.floor(((currentTick - 1) * totalValue) / totalTicks);

        return currentSum - previousSum;
    }

    static calculateStaminaExperience(damagePrevented, damageTaken) {
        return 0.03 * damagePrevented + 0.3 * damageTaken;
    }

    static calculateIntelligenceExperience(manaUsed) {
        return 0.3 * manaUsed;
    }

    static calculateAttackExperience(damage, combatStyle) {
        switch (combatStyle) {
            case "/combat_styles/stab":
                return 0.6 + 0.15 * damage;
            case "/combat_styles/slash":
                return 0.3 + 0.075 * damage;
            default:
                return 0;
        }
    }

    static calculatePowerExperience(damage, combatStyle) {
        switch (combatStyle) {
            case "/combat_styles/smash":
                return 0.6 + 0.15 * damage;
            case "/combat_styles/slash":
                return 0.3 + 0.075 * damage;
            default:
                return 0;
        }
    }

    static calculateDefenseExperience(damagePrevented) {
        return 0.4 + 0.1 * damagePrevented;
    }

    static calculateRangedExperience(damage) {
        return 0.4 + 0.1 * damage;
    }

    static calculateMagicExperience(damage) {
        return 0.4 + 0.1 * damage;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CombatUtilities);


/***/ }),

/***/ "./src/combatsimulator/consumable.js":
/*!*******************************************!*\
  !*** ./src/combatsimulator/consumable.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _buff__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./buff */ "./src/combatsimulator/buff.js");
/* harmony import */ var _data_itemDetailMap_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./data/itemDetailMap.json */ "./src/combatsimulator/data/itemDetailMap.json");
/* harmony import */ var _trigger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./trigger */ "./src/combatsimulator/trigger.js");




class Consumable {
    constructor(hrid, triggers = null) {
        this.hrid = hrid;

        let gameConsumable = _data_itemDetailMap_json__WEBPACK_IMPORTED_MODULE_1__[this.hrid];
        if (!gameConsumable) {
            throw new Error("No consumable found for hrid: " + this.hrid);
        }

        this.cooldownDuration = gameConsumable.consumableDetail.cooldownDuration;
        this.hitpointRestore = gameConsumable.consumableDetail.hitpointRestore;
        this.manapointRestore = gameConsumable.consumableDetail.manapointRestore;
        this.recoveryDuration = gameConsumable.consumableDetail.recoveryDuration;

        this.buffs = [];
        if (gameConsumable.consumableDetail.buffs) {
            for (const consumableBuff of gameConsumable.consumableDetail.buffs) {
                let buff = new _buff__WEBPACK_IMPORTED_MODULE_0__["default"](consumableBuff);
                this.buffs.push(buff);
            }
        }

        if (triggers) {
            this.triggers = triggers;
        } else {
            this.triggers = [];
            for (const defaultTrigger of gameConsumable.consumableDetail.defaultCombatTriggers) {
                let trigger = new _trigger__WEBPACK_IMPORTED_MODULE_2__["default"](
                    defaultTrigger.dependencyHrid,
                    defaultTrigger.conditionHrid,
                    defaultTrigger.comparatorHrid,
                    defaultTrigger.value
                );
                this.triggers.push(trigger);
            }
        }

        this.lastUsed = Number.MIN_SAFE_INTEGER;
    }

    static createFromDTO(dto) {
        let triggers = dto.triggers.map((trigger) => _trigger__WEBPACK_IMPORTED_MODULE_2__["default"].createFromDTO(trigger));
        let consumable = new Consumable(dto.hrid, triggers);

        return consumable;
    }

    shouldTrigger(currentTime, source, target, friendlies, enemies) {
        if (source.isStunned) {
            return false;
        }

        if (this.lastUsed + this.cooldownDuration > currentTime) {
            return false;
        }

        if (this.triggers.length == 0) {
            return true;
        }

        let shouldTrigger = true;
        for (const trigger of this.triggers) {
            if (!trigger.isActive(source, target, friendlies, enemies, currentTime)) {
                shouldTrigger = false;
            }
        }

        return shouldTrigger;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Consumable);


/***/ }),

/***/ "./src/combatsimulator/equipment.js":
/*!******************************************!*\
  !*** ./src/combatsimulator/equipment.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _data_itemDetailMap_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data/itemDetailMap.json */ "./src/combatsimulator/data/itemDetailMap.json");
/* harmony import */ var _data_enhancementLevelTotalMultiplierTable_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./data/enhancementLevelTotalMultiplierTable.json */ "./src/combatsimulator/data/enhancementLevelTotalMultiplierTable.json");



class Equipment {
    constructor(hrid, enhancementLevel) {
        this.hrid = hrid;
        let gameItem = _data_itemDetailMap_json__WEBPACK_IMPORTED_MODULE_0__[this.hrid];
        if (!gameItem) {
            throw new Error("No equipment found for hrid: " + this.hrid);
        }
        this.gameItem = gameItem;
        this.enhancementLevel = enhancementLevel;
    }

    static createFromDTO(dto) {
        let equipment = new Equipment(dto.hrid, dto.enhancementLevel);

        return equipment;
    }

    getCombatStat(combatStat) {
        let multiplier = _data_enhancementLevelTotalMultiplierTable_json__WEBPACK_IMPORTED_MODULE_1__[this.enhancementLevel];

        let stat =
            this.gameItem.equipmentDetail.combatStats[combatStat] +
            multiplier * this.gameItem.equipmentDetail.combatEnhancementBonuses[combatStat];

        return stat;
    }

    getCombatStyle() {
        return this.gameItem.equipmentDetail.combatStats.combatStyleHrids[0];
    }

    getDamageType() {
        return this.gameItem.equipmentDetail.combatStats.damageType;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Equipment);


/***/ }),

/***/ "./src/combatsimulator/events/autoAttackEvent.js":
/*!*******************************************************!*\
  !*** ./src/combatsimulator/events/autoAttackEvent.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatEvent */ "./src/combatsimulator/events/combatEvent.js");


class AutoAttackEvent extends _combatEvent__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static type = "autoAttack";

    constructor(time, source) {
        super(AutoAttackEvent.type, time);

        this.source = source;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AutoAttackEvent);


/***/ }),

/***/ "./src/combatsimulator/events/bleedTickEvent.js":
/*!******************************************************!*\
  !*** ./src/combatsimulator/events/bleedTickEvent.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatEvent */ "./src/combatsimulator/events/combatEvent.js");


class BleedTickEvent extends _combatEvent__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static type = "bleedTick";

    constructor(time, sourceRef, target, damage, totalTicks, currentTick) {
        super(BleedTickEvent.type, time);

        // Calling it 'source' would wrongly clear bleeds when the source dies
        this.sourceRef = sourceRef;
        this.target = target;
        this.damage = damage;
        this.totalTicks = totalTicks;
        this.currentTick = currentTick;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BleedTickEvent);


/***/ }),

/***/ "./src/combatsimulator/events/checkBuffExpirationEvent.js":
/*!****************************************************************!*\
  !*** ./src/combatsimulator/events/checkBuffExpirationEvent.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatEvent */ "./src/combatsimulator/events/combatEvent.js");


class CheckBuffExpirationEvent extends _combatEvent__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static type = "checkBuffExpiration";

    constructor(time, source) {
        super(CheckBuffExpirationEvent.type, time);

        this.source = source;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CheckBuffExpirationEvent);


/***/ }),

/***/ "./src/combatsimulator/events/combatEvent.js":
/*!***************************************************!*\
  !*** ./src/combatsimulator/events/combatEvent.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class CombatEvent {
    constructor(type, time) {
        this.type = type;
        this.time = time;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CombatEvent);


/***/ }),

/***/ "./src/combatsimulator/events/combatStartEvent.js":
/*!********************************************************!*\
  !*** ./src/combatsimulator/events/combatStartEvent.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatEvent */ "./src/combatsimulator/events/combatEvent.js");


class CombatStartEvent extends _combatEvent__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static type = "combatStart";

    constructor(time) {
        super(CombatStartEvent.type, time);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CombatStartEvent);


/***/ }),

/***/ "./src/combatsimulator/events/consumableTickEvent.js":
/*!***********************************************************!*\
  !*** ./src/combatsimulator/events/consumableTickEvent.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatEvent */ "./src/combatsimulator/events/combatEvent.js");


class ConsumableTickEvent extends _combatEvent__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static type = "consumableTick";

    constructor(time, source, consumable, totalTicks, currentTick) {
        super(ConsumableTickEvent.type, time);

        this.source = source;
        this.consumable = consumable;
        this.totalTicks = totalTicks;
        this.currentTick = currentTick;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConsumableTickEvent);


/***/ }),

/***/ "./src/combatsimulator/events/cooldownReadyEvent.js":
/*!**********************************************************!*\
  !*** ./src/combatsimulator/events/cooldownReadyEvent.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatEvent */ "./src/combatsimulator/events/combatEvent.js");


class CooldownReadyEvent extends _combatEvent__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static type = "cooldownReady";

    constructor(time) {
        super(CooldownReadyEvent.type, time);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CooldownReadyEvent);


/***/ }),

/***/ "./src/combatsimulator/events/enemyRespawnEvent.js":
/*!*********************************************************!*\
  !*** ./src/combatsimulator/events/enemyRespawnEvent.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatEvent */ "./src/combatsimulator/events/combatEvent.js");


class EnemyRespawnEvent extends _combatEvent__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static type = "enemyRespawn";

    constructor(time) {
        super(EnemyRespawnEvent.type, time);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EnemyRespawnEvent);


/***/ }),

/***/ "./src/combatsimulator/events/eventQueue.js":
/*!**************************************************!*\
  !*** ./src/combatsimulator/events/eventQueue.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var heap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! heap-js */ "./node_modules/heap-js/dist/heap-js.es5.js");


class EventQueue {
    constructor() {
        this.minHeap = new heap_js__WEBPACK_IMPORTED_MODULE_0__["default"]((a, b) => a.time - b.time);
    }

    addEvent(event) {
        this.minHeap.push(event);
    }

    getNextEvent() {
        return this.minHeap.pop();
    }

    containsEventOfType(type) {
        let heapEvents = this.minHeap.toArray();

        return heapEvents.some((event) => event.type == type);
    }

    clear() {
        this.minHeap = new heap_js__WEBPACK_IMPORTED_MODULE_0__["default"]((a, b) => a.time - b.time);
    }

    clearEventsForUnit(unit) {
        this.clearMatching((event) => event.source == unit || event.target == unit);
    }

    clearEventsOfType(type) {
        this.clearMatching((event) => event.type == type);
    }

    clearMatching(fn) {
        let heapEvents = this.minHeap.toArray();

        for (const event of heapEvents) {
            if (fn(event)) {
                this.minHeap.remove(event);
            }
        }
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EventQueue);


/***/ }),

/***/ "./src/combatsimulator/events/playerRespawnEvent.js":
/*!**********************************************************!*\
  !*** ./src/combatsimulator/events/playerRespawnEvent.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatEvent */ "./src/combatsimulator/events/combatEvent.js");


class PlayerRespawnEvent extends _combatEvent__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static type = "playerRespawn";

    constructor(time) {
        super(PlayerRespawnEvent.type, time);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PlayerRespawnEvent);


/***/ }),

/***/ "./src/combatsimulator/events/regenTickEvent.js":
/*!******************************************************!*\
  !*** ./src/combatsimulator/events/regenTickEvent.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatEvent */ "./src/combatsimulator/events/combatEvent.js");


class RegenTickEvent extends _combatEvent__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static type = "regenTick";

    constructor(time) {
        super(RegenTickEvent.type, time);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RegenTickEvent);


/***/ }),

/***/ "./src/combatsimulator/events/stunExpirationEvent.js":
/*!***********************************************************!*\
  !*** ./src/combatsimulator/events/stunExpirationEvent.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _combatEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatEvent */ "./src/combatsimulator/events/combatEvent.js");


class StunExpirationEvent extends _combatEvent__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static type = "stunExpiration";

    constructor(time, source) {
        super(StunExpirationEvent.type, time);

        this.source = source;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (StunExpirationEvent);

/***/ }),

/***/ "./src/combatsimulator/monster.js":
/*!****************************************!*\
  !*** ./src/combatsimulator/monster.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ability__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ability */ "./src/combatsimulator/ability.js");
/* harmony import */ var _combatUnit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./combatUnit */ "./src/combatsimulator/combatUnit.js");
/* harmony import */ var _data_combatMonsterDetailMap_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./data/combatMonsterDetailMap.json */ "./src/combatsimulator/data/combatMonsterDetailMap.json");




class Monster extends _combatUnit__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(hrid) {
        super();

        this.isPlayer = false;
        this.hrid = hrid;

        let gameMonster = _data_combatMonsterDetailMap_json__WEBPACK_IMPORTED_MODULE_2__[this.hrid];
        if (!gameMonster) {
            throw new Error("No monster found for hrid: " + this.hrid);
        }

        for (let i = 0; i < gameMonster.abilities.length; i++) {
            this.abilities[i] = new _ability__WEBPACK_IMPORTED_MODULE_0__["default"](gameMonster.abilities[i].abilityHrid, gameMonster.abilities[i].level);
        }
    }

    updateCombatDetails() {
        let gameMonster = _data_combatMonsterDetailMap_json__WEBPACK_IMPORTED_MODULE_2__[this.hrid];

        this.staminaLevel = gameMonster.combatDetails.staminaLevel;
        this.intelligenceLevel = gameMonster.combatDetails.intelligenceLevel;
        this.attackLevel = gameMonster.combatDetails.attackLevel;
        this.powerLevel = gameMonster.combatDetails.powerLevel;
        this.defenseLevel = gameMonster.combatDetails.defenseLevel;
        this.rangedLevel = gameMonster.combatDetails.rangedLevel;
        this.magicLevel = gameMonster.combatDetails.magicLevel;

        this.combatDetails.combatStats.combatStyleHrid = gameMonster.combatDetails.combatStats.combatStyleHrids[0];

        for (const [key, value] of Object.entries(gameMonster.combatDetails.combatStats)) {
            this.combatDetails.combatStats[key] = value;
        }

        super.updateCombatDetails();
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Monster);


/***/ }),

/***/ "./src/combatsimulator/player.js":
/*!***************************************!*\
  !*** ./src/combatsimulator/player.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ability__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ability */ "./src/combatsimulator/ability.js");
/* harmony import */ var _combatUnit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./combatUnit */ "./src/combatsimulator/combatUnit.js");
/* harmony import */ var _consumable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./consumable */ "./src/combatsimulator/consumable.js");
/* harmony import */ var _equipment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./equipment */ "./src/combatsimulator/equipment.js");





class Player extends _combatUnit__WEBPACK_IMPORTED_MODULE_1__["default"] {
    equipment = {
        "/equipment_types/head": null,
        "/equipment_types/body": null,
        "/equipment_types/legs": null,
        "/equipment_types/feet": null,
        "/equipment_types/hands": null,
        "/equipment_types/main_hand": null,
        "/equipment_types/two_hand": null,
        "/equipment_types/off_hand": null,
        "/equipment_types/pouch": null,
    };

    constructor() {
        super();

        this.isPlayer = true;
        this.hrid = "player";
    }

    static createFromDTO(dto) {
        let player = new Player();

        player.staminaLevel = dto.staminaLevel;
        player.intelligenceLevel = dto.intelligenceLevel;
        player.attackLevel = dto.attackLevel;
        player.powerLevel = dto.powerLevel;
        player.defenseLevel = dto.defenseLevel;
        player.rangedLevel = dto.rangedLevel;
        player.magicLevel = dto.magicLevel;

        for (const [key, value] of Object.entries(dto.equipment)) {
            player.equipment[key] = value ? _equipment__WEBPACK_IMPORTED_MODULE_3__["default"].createFromDTO(value) : null;
        }

        player.food = dto.food.map((food) => (food ? _consumable__WEBPACK_IMPORTED_MODULE_2__["default"].createFromDTO(food) : null));
        player.drinks = dto.drinks.map((drink) => (drink ? _consumable__WEBPACK_IMPORTED_MODULE_2__["default"].createFromDTO(drink) : null));
        player.abilities = dto.abilities.map((ability) => (ability ? _ability__WEBPACK_IMPORTED_MODULE_0__["default"].createFromDTO(ability) : null));

        return player;
    }

    updateCombatDetails() {
        if (this.equipment["/equipment_types/main_hand"]) {
            this.combatDetails.combatStats.combatStyleHrid =
                this.equipment["/equipment_types/main_hand"].getCombatStyle();
            this.combatDetails.combatStats.damageType = this.equipment["/equipment_types/main_hand"].getDamageType();
            this.combatDetails.combatStats.attackInterval =
                this.equipment["/equipment_types/main_hand"].getCombatStat("attackInterval");
        } else if (this.equipment["/equipment_types/two_hand"]) {
            this.combatDetails.combatStats.combatStyleHrid =
                this.equipment["/equipment_types/two_hand"].getCombatStyle();
            this.combatDetails.combatStats.damageType = this.equipment["/equipment_types/two_hand"].getDamageType();
            this.combatDetails.combatStats.attackInterval =
                this.equipment["/equipment_types/two_hand"].getCombatStat("attackInterval");
        } else {
            this.combatDetails.combatStats.combatStyleHrid = "/combat_styles/smash";
            this.combatDetails.combatStats.damageType = "/damage_types/physical";
            this.combatDetails.combatStats.attackInterval = 3000000000;
        }

        [
            "stabAccuracy",
            "slashAccuracy",
            "smashAccuracy",
            "rangedAccuracy",
            "stabDamage",
            "slashDamage",
            "smashDamage",
            "rangedDamage",
            "magicDamage",
            "physicalAmplify",
            "waterAmplify",
            "natureAmplify",
            "fireAmplify",
            "healingAmplify",
            "stabEvasion",
            "slashEvasion",
            "smashEvasion",
            "rangedEvasion",
            "armor",
            "waterResistance",
            "natureResistance",
            "fireResistance",
            "maxHitpoints",
            "maxManapoints",
            "lifeSteal",
            "physicalReflectPower",
            "dropRate",
            "dropQuantity",
            "experienceRate",
        ].forEach((stat) => {
            this.combatDetails.combatStats[stat] = Object.values(this.equipment)
                .filter((equipment) => equipment != null)
                .map((equipment) => equipment.getCombatStat(stat))
                .reduce((prev, cur) => prev + cur, 0);
        });

        if (this.equipment["/equipment_types/pouch"]) {
            this.combatDetails.combatStats.foodSlots =
                1 + this.equipment["/equipment_types/pouch"].getCombatStat("foodSlots");
            this.combatDetails.combatStats.drinkSlots =
                1 + this.equipment["/equipment_types/pouch"].getCombatStat("drinkSlots");
        } else {
            this.combatDetails.combatStats.foodSlots = 1;
            this.combatDetails.combatStats.drinkSlots = 1;
        }

        super.updateCombatDetails();
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Player);


/***/ }),

/***/ "./src/combatsimulator/simResult.js":
/*!******************************************!*\
  !*** ./src/combatsimulator/simResult.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class SimResult {
    constructor() {
        this.deaths = {};
        this.experienceGained = {};
        this.encounters = 0;
        this.attacks = {};
        this.consumablesUsed = {};
        this.hitpointsGained = {};
        this.manapointsGained = {};
        this.playerRanOutOfMana = false;
    }

    addDeath(unit) {
        if (!this.deaths[unit.hrid]) {
            this.deaths[unit.hrid] = 0;
        }

        this.deaths[unit.hrid] += 1;
    }

    addExperienceGain(unit, type, experience) {
        if (!unit.isPlayer) {
            return;
        }

        if (!this.experienceGained[unit.hrid]) {
            this.experienceGained[unit.hrid] = {
                stamina: 0,
                intelligence: 0,
                attack: 0,
                power: 0,
                defense: 0,
                ranged: 0,
                magic: 0,
            };
        }

        this.experienceGained[unit.hrid][type] += experience * (1 + unit.combatDetails.combatStats.experienceRate);
    }

    addEncounterEnd() {
        this.encounters++;
    }

    addAttack(source, target, ability, hit) {
        if (!this.attacks[source.hrid]) {
            this.attacks[source.hrid] = {};
        }
        if (!this.attacks[source.hrid][target.hrid]) {
            this.attacks[source.hrid][target.hrid] = {};
        }
        if (!this.attacks[source.hrid][target.hrid][ability]) {
            this.attacks[source.hrid][target.hrid][ability] = {};
        }

        if (!this.attacks[source.hrid][target.hrid][ability][hit]) {
            this.attacks[source.hrid][target.hrid][ability][hit] = 0;
        }

        this.attacks[source.hrid][target.hrid][ability][hit] += 1;
    }

    addConsumableUse(unit, consumable) {
        if (!this.consumablesUsed[unit.hrid]) {
            this.consumablesUsed[unit.hrid] = {};
        }
        if (!this.consumablesUsed[unit.hrid][consumable.hrid]) {
            this.consumablesUsed[unit.hrid][consumable.hrid] = 0;
        }

        this.consumablesUsed[unit.hrid][consumable.hrid] += 1;
    }

    addHitpointsGained(unit, source, amount) {
        if (!this.hitpointsGained[unit.hrid]) {
            this.hitpointsGained[unit.hrid] = {};
        }
        if (!this.hitpointsGained[unit.hrid][source]) {
            this.hitpointsGained[unit.hrid][source] = 0;
        }

        this.hitpointsGained[unit.hrid][source] += amount;
    }

    addManapointsGained(unit, source, amount) {
        if (!this.manapointsGained[unit.hrid]) {
            this.manapointsGained[unit.hrid] = {};
        }
        if (!this.manapointsGained[unit.hrid][source]) {
            this.manapointsGained[unit.hrid][source] = 0;
        }

        this.manapointsGained[unit.hrid][source] += amount;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SimResult);


/***/ }),

/***/ "./src/combatsimulator/trigger.js":
/*!****************************************!*\
  !*** ./src/combatsimulator/trigger.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _data_combatTriggerDependencyDetailMap_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data/combatTriggerDependencyDetailMap.json */ "./src/combatsimulator/data/combatTriggerDependencyDetailMap.json");


class Trigger {
    constructor(dependencyHrid, conditionHrid, comparatorHrid, value = 0) {
        this.dependencyHrid = dependencyHrid;
        this.conditionHrid = conditionHrid;
        this.comparatorHrid = comparatorHrid;
        this.value = value;
    }

    static createFromDTO(dto) {
        let trigger = new Trigger(dto.dependencyHrid, dto.conditionHrid, dto.comparatorHrid, dto.value);

        return trigger;
    }

    isActive(source, target, friendlies, enemies, currentTime) {
        if (_data_combatTriggerDependencyDetailMap_json__WEBPACK_IMPORTED_MODULE_0__[this.dependencyHrid].isSingleTarget) {
            return this.isActiveSingleTarget(source, target, currentTime);
        } else {
            return this.isActiveMultiTarget(friendlies, enemies, currentTime);
        }
    }

    isActiveSingleTarget(source, target, currentTime) {
        let dependencyValue;
        switch (this.dependencyHrid) {
            case "/combat_trigger_dependencies/self":
                dependencyValue = this.getDependencyValue(source, currentTime);
                break;
            case "/combat_trigger_dependencies/targeted_enemy":
                if (!target) {
                    return false;
                }
                dependencyValue = this.getDependencyValue(target, currentTime);
                break;
            default:
                throw new Error("Unknown dependencyHrid in trigger: " + this.dependencyHrid);
        }

        return this.compareValue(dependencyValue);
    }

    isActiveMultiTarget(friendlies, enemies, currentTime) {
        let dependency;
        switch (this.dependencyHrid) {
            case "/combat_trigger_dependencies/all_allies":
                dependency = friendlies;
                break;
            case "/combat_trigger_dependencies/all_enemies":
                if (!enemies) {
                    return false;
                }
                dependency = enemies;
                break;
            default:
                throw new Error("Unknown dependencyHrid in trigger: " + this.dependencyHrid);
        }

        let dependencyValue;
        switch (this.conditionHrid) {
            case "/combat_trigger_conditions/number_of_active_units":
                dependencyValue = dependency.filter((unit) => unit.combatDetails.currentHitpoints > 0).length;
                break;
            default:
                dependencyValue = dependency
                    .map((unit) => this.getDependencyValue(unit, currentTime))
                    .reduce((prev, cur) => prev + cur, 0);
                break;
        }

        return this.compareValue(dependencyValue);
    }

    getDependencyValue(source, currentTime) {
        switch (this.conditionHrid) {
            case "/combat_trigger_conditions/attack_coffee":
            case "/combat_trigger_conditions/berserk":
            case "/combat_trigger_conditions/defense_coffee":
            case "/combat_trigger_conditions/elemental_affinity_fire_amplify":
            case "/combat_trigger_conditions/elemental_affinity_nature_amplify":
            case "/combat_trigger_conditions/elemental_affinity_water_amplify":
            case "/combat_trigger_conditions/frenzy":
            case "/combat_trigger_conditions/intelligence_coffee_max_mp":
            case "/combat_trigger_conditions/intelligence_coffee_mp_regen":
            case "/combat_trigger_conditions/lucky_coffee":
            case "/combat_trigger_conditions/magic_coffee":
            case "/combat_trigger_conditions/power_coffee":
            case "/combat_trigger_conditions/precision":
            case "/combat_trigger_conditions/ranged_coffee":
            case "/combat_trigger_conditions/spike_shell":
            case "/combat_trigger_conditions/stamina_coffee_hp_regen":
            case "/combat_trigger_conditions/stamina_coffee_max_hp":
            case "/combat_trigger_conditions/swiftness_coffee":
            case "/combat_trigger_conditions/toughness_armor":
            case "/combat_trigger_conditions/toughness_fire_resistance":
            case "/combat_trigger_conditions/toughness_nature_resistance":
            case "/combat_trigger_conditions/toughness_water_resistance":
            case "/combat_trigger_conditions/vampirism":
            case "/combat_trigger_conditions/wisdom_coffee":
                let buffHrid = "/buff_sources";
                buffHrid += this.conditionHrid.slice(this.conditionHrid.lastIndexOf("/"));
                return source.combatBuffs[buffHrid];
            case "/combat_trigger_conditions/current_hp":
                return source.combatDetails.currentHitpoints;
            case "/combat_trigger_conditions/current_mp":
                return source.combatDetails.currentManapoints;
            case "/combat_trigger_conditions/missing_hp":
                return source.combatDetails.maxHitpoints - source.combatDetails.currentHitpoints;
            case "/combat_trigger_conditions/missing_mp":
                return source.combatDetails.maxManapoints - source.combatDetails.currentManapoints;
            case "/combat_trigger_conditions/stun_status":
                // Replicate the game's behaviour of "stun status active" triggers activating
                // immediately after the stun has worn off
                return source.isStunned || source.stunExpireTime == currentTime;
            default:
                throw new Error("Unknown conditionHrid in trigger: " + this.conditionHrid);
        }
    }

    compareValue(dependencyValue) {
        switch (this.comparatorHrid) {
            case "/combat_trigger_comparators/greater_than_equal":
                return dependencyValue >= this.value;
            case "/combat_trigger_comparators/less_than_equal":
                return dependencyValue <= this.value;
            case "/combat_trigger_comparators/is_active":
                return !!dependencyValue;
            case "/combat_trigger_comparators/is_inactive":
                return !dependencyValue;
            default:
                throw new Error("Unknown comparatorHrid in trigger: " + this.comparatorHrid);
        }
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Trigger);


/***/ }),

/***/ "./src/combatsimulator/zone.js":
/*!*************************************!*\
  !*** ./src/combatsimulator/zone.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _data_actionDetailMap_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data/actionDetailMap.json */ "./src/combatsimulator/data/actionDetailMap.json");
/* harmony import */ var _monster__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./monster */ "./src/combatsimulator/monster.js");



class Zone {
    constructor(hrid) {
        this.hrid = hrid;

        let gameZone = _data_actionDetailMap_json__WEBPACK_IMPORTED_MODULE_0__[this.hrid];
        this.monsterSpawnInfo = gameZone.monsterSpawnInfo;
    }

    getRandomEncounter() {
        let totalWeight = this.monsterSpawnInfo.spawns.reduce((prev, cur) => prev + cur.rate, 0);

        let encounterHrids = [];
        let totalStrength = 0;

        outer: for (let i = 0; i < this.monsterSpawnInfo.maxSpawnCount; i++) {
            let randomWeight = totalWeight * Math.random();
            let cumulativeWeight = 0;

            for (const spawn of this.monsterSpawnInfo.spawns) {
                cumulativeWeight += spawn.rate;
                if (randomWeight <= cumulativeWeight) {
                    totalStrength += spawn.strength;

                    if (totalStrength <= this.monsterSpawnInfo.maxTotalStrength) {
                        encounterHrids.push(spawn.combatMonsterHrid);
                    } else {
                        break outer;
                    }
                    break;
                }
            }
        }

        return encounterHrids.map((hrid) => new _monster__WEBPACK_IMPORTED_MODULE_1__["default"](hrid));
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Zone);


/***/ }),

/***/ "./src/worker.js":
/*!***********************!*\
  !*** ./src/worker.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _combatsimulator_combatSimulator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combatsimulator/combatSimulator */ "./src/combatsimulator/combatSimulator.js");
/* harmony import */ var _combatsimulator_player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./combatsimulator/player */ "./src/combatsimulator/player.js");
/* harmony import */ var _combatsimulator_zone__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./combatsimulator/zone */ "./src/combatsimulator/zone.js");




onmessage = async function (event) {
    switch (event.data.type) {
        case "start_simulation":
            let player = _combatsimulator_player__WEBPACK_IMPORTED_MODULE_1__["default"].createFromDTO(event.data.player);
            let zone = new _combatsimulator_zone__WEBPACK_IMPORTED_MODULE_2__["default"](event.data.zoneHrid);
            let simulationTimeLimit = event.data.simulationTimeLimit;

            let combatSimulator = new _combatsimulator_combatSimulator__WEBPACK_IMPORTED_MODULE_0__["default"](player, zone);
            combatSimulator.addEventListener("progress", (event) => {
                this.postMessage({ type: "simulation_progress", progress: event.detail });
            });

            try {
                let simResult = await combatSimulator.simulate(simulationTimeLimit);
                this.postMessage({ type: "simulation_result", simResult: simResult });
            } catch (e) {
                this.postMessage({ type: "simulation_error", error: e });
            }
            break;
    }
};


/***/ }),

/***/ "./src/combatsimulator/data/abilityDetailMap.json":
/*!********************************************************!*\
  !*** ./src/combatsimulator/data/abilityDetailMap.json ***!
  \********************************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"/abilities/aqua_arrow":{"hrid":"/abilities/aqua_arrow","name":"Aqua Arrow","description":"Shoots an arrow made of water at the targeted enemy","manaCost":30,"cooldownDuration":20000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/ranged","damageType":"/damage_types/water","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.6,"baseDamageRatioLevelBonus":0.006,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":10},"/abilities/berserk":{"hrid":"/abilities/berserk","name":"Berserk","description":"Greatly increases physical damages for a short time","manaCost":60,"cooldownDuration":30000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"self","effectType":"/ability_effect_types/buff","combatStyleHrid":"","damageType":"","baseDamageFlat":0,"baseDamageFlatLevelBonus":0,"baseDamageRatio":0,"baseDamageRatioLevelBonus":0,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":[{"sourceHrid":"/buff_sources/berserk","typeHrid":"/buff_types/physical_amplify","ratioBoost":0,"ratioBoostLevelBonus":0,"flatBoost":0.24,"flatBoostLevelBonus":0.0024,"startTime":"0001-01-01T00:00:00Z","duration":15000000000}]}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/self","conditionHrid":"/combat_trigger_conditions/berserk","comparatorHrid":"/combat_trigger_comparators/is_inactive","value":0}],"sortIndex":23},"/abilities/cleave":{"hrid":"/abilities/cleave","name":"Cleave","description":"Cleaves all enemies","manaCost":30,"cooldownDuration":20000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"all enemies","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/slash","damageType":"/damage_types/physical","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.3,"baseDamageRatioLevelBonus":0.003,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/all_enemies","conditionHrid":"/combat_trigger_conditions/number_of_active_units","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1},{"dependencyHrid":"/combat_trigger_dependencies/all_enemies","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":5},"/abilities/elemental_affinity":{"hrid":"/abilities/elemental_affinity","name":"Elemental Affinity","description":"Amplifies elemental damage for a short time","manaCost":60,"cooldownDuration":30000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"self","effectType":"/ability_effect_types/buff","combatStyleHrid":"","damageType":"","baseDamageFlat":0,"baseDamageFlatLevelBonus":0,"baseDamageRatio":0,"baseDamageRatioLevelBonus":0,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":[{"sourceHrid":"/buff_sources/elemental_affinity_water_amplify","typeHrid":"/buff_types/water_amplify","ratioBoost":0,"ratioBoostLevelBonus":0,"flatBoost":0.45,"flatBoostLevelBonus":0.0045,"startTime":"0001-01-01T00:00:00Z","duration":15000000000},{"sourceHrid":"/buff_sources/elemental_affinity_nature_amplify","typeHrid":"/buff_types/nature_amplify","ratioBoost":0,"ratioBoostLevelBonus":0,"flatBoost":0.45,"flatBoostLevelBonus":0.0045,"startTime":"0001-01-01T00:00:00Z","duration":15000000000},{"sourceHrid":"/buff_sources/elemental_affinity_fire_amplify","typeHrid":"/buff_types/fire_amplify","ratioBoost":0,"ratioBoostLevelBonus":0,"flatBoost":0.45,"flatBoostLevelBonus":0.0045,"startTime":"0001-01-01T00:00:00Z","duration":15000000000}]}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/self","conditionHrid":"/combat_trigger_conditions/elemental_affinity_water_amplify","comparatorHrid":"/combat_trigger_comparators/is_inactive","value":0}],"sortIndex":27},"/abilities/entangle":{"hrid":"/abilities/entangle","name":"Entangle","description":"Entangles the targeted enemy","manaCost":25,"cooldownDuration":12000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/magic","damageType":"/damage_types/nature","baseDamageFlat":10,"baseDamageFlatLevelBonus":0.1,"baseDamageRatio":0.5,"baseDamageRatioLevelBonus":0.005,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0.4,"stunDuration":3000000000,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":14},"/abilities/fireball":{"hrid":"/abilities/fireball","name":"Fireball","description":"Casts a fireball at the targeted enemy","manaCost":25,"cooldownDuration":10000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/magic","damageType":"/damage_types/fire","baseDamageFlat":10,"baseDamageFlatLevelBonus":0.1,"baseDamageRatio":0.6,"baseDamageRatioLevelBonus":0.006,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":15},"/abilities/flame_arrow":{"hrid":"/abilities/flame_arrow","name":"Flame Arrow","description":"Shoots a flaming arrow at the targeted enemy","manaCost":30,"cooldownDuration":20000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/ranged","damageType":"/damage_types/fire","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.6,"baseDamageRatioLevelBonus":0.006,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":11},"/abilities/flame_blast":{"hrid":"/abilities/flame_blast","name":"Flame Blast","description":"Casts a flame blast at all enemies","manaCost":40,"cooldownDuration":15000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"all enemies","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/magic","damageType":"/damage_types/fire","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.65,"baseDamageRatioLevelBonus":0.0065,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/all_enemies","conditionHrid":"/combat_trigger_conditions/number_of_active_units","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1},{"dependencyHrid":"/combat_trigger_dependencies/all_enemies","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":18},"/abilities/frenzy":{"hrid":"/abilities/frenzy","name":"Frenzy","description":"Greatly increases attack speed for a short time","manaCost":60,"cooldownDuration":30000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"self","effectType":"/ability_effect_types/buff","combatStyleHrid":"","damageType":"","baseDamageFlat":0,"baseDamageFlatLevelBonus":0,"baseDamageRatio":0,"baseDamageRatioLevelBonus":0,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":[{"sourceHrid":"/buff_sources/frenzy","typeHrid":"/buff_types/attack_speed","ratioBoost":0.25,"ratioBoostLevelBonus":0.0025,"flatBoost":0,"flatBoostLevelBonus":0,"startTime":"0001-01-01T00:00:00Z","duration":15000000000}]}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/self","conditionHrid":"/combat_trigger_conditions/frenzy","comparatorHrid":"/combat_trigger_comparators/is_inactive","value":0}],"sortIndex":24},"/abilities/heal":{"hrid":"/abilities/heal","name":"Heal","description":"Casts heal on yourself","manaCost":60,"cooldownDuration":15000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"self","effectType":"/ability_effect_types/heal","combatStyleHrid":"/combat_styles/magic","damageType":"","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.5,"baseDamageRatioLevelBonus":0.005,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/self","conditionHrid":"/combat_trigger_conditions/missing_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":20},"/abilities/ice_spear":{"hrid":"/abilities/ice_spear","name":"Ice Spear","description":"Casts an ice spear at the targeted enemy","manaCost":40,"cooldownDuration":15000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/magic","damageType":"/damage_types/water","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.95,"baseDamageRatioLevelBonus":0.0095,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":[{"sourceHrid":"/buff_sources/ice_spear","typeHrid":"/buff_types/attack_speed","ratioBoost":-0.3,"ratioBoostLevelBonus":-0.003,"flatBoost":0,"flatBoostLevelBonus":0,"startTime":"0001-01-01T00:00:00Z","duration":8000000000}]}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":16},"/abilities/maim":{"hrid":"/abilities/maim","name":"Maim","description":"Maims the targeted enemy and causes bleeding","manaCost":45,"cooldownDuration":20000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/slash","damageType":"/damage_types/physical","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.5,"baseDamageRatioLevelBonus":0.005,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":1,"bleedDuration":15000000000,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":7},"/abilities/minor_heal":{"hrid":"/abilities/minor_heal","name":"Minor Heal","description":"Casts minor heal on yourself","manaCost":30,"cooldownDuration":15000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"self","effectType":"/ability_effect_types/heal","combatStyleHrid":"/combat_styles/magic","damageType":"","baseDamageFlat":10,"baseDamageFlatLevelBonus":0.1,"baseDamageRatio":0.3,"baseDamageRatioLevelBonus":0.003,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/self","conditionHrid":"/combat_trigger_conditions/missing_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":19},"/abilities/pierce":{"hrid":"/abilities/pierce","name":"Pierce","description":"Pierce the targeted enemy","manaCost":30,"cooldownDuration":20000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/stab","damageType":"/damage_types/physical","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.7,"baseDamageRatioLevelBonus":0.007,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":4},"/abilities/poke":{"hrid":"/abilities/poke","name":"Poke","description":"Poke the targeted enemy","manaCost":20,"cooldownDuration":15000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/stab","damageType":"/damage_types/physical","baseDamageFlat":10,"baseDamageFlatLevelBonus":0.1,"baseDamageRatio":0.4,"baseDamageRatioLevelBonus":0.004,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":1},"/abilities/precision":{"hrid":"/abilities/precision","name":"Precision","description":"Greatly increases accuracy for a short time","manaCost":60,"cooldownDuration":30000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"self","effectType":"/ability_effect_types/buff","combatStyleHrid":"","damageType":"","baseDamageFlat":0,"baseDamageFlatLevelBonus":0,"baseDamageRatio":0,"baseDamageRatioLevelBonus":0,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":[{"sourceHrid":"/buff_sources/precision","typeHrid":"/buff_types/accuracy","ratioBoost":0.35,"ratioBoostLevelBonus":0.0035,"flatBoost":0,"flatBoostLevelBonus":0,"startTime":"0001-01-01T00:00:00Z","duration":15000000000}]}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/self","conditionHrid":"/combat_trigger_conditions/precision","comparatorHrid":"/combat_trigger_comparators/is_inactive","value":0}],"sortIndex":22},"/abilities/quick_shot":{"hrid":"/abilities/quick_shot","name":"Quick Shot","description":"A quick shot at the targeted enemy","manaCost":20,"cooldownDuration":15000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/ranged","damageType":"/damage_types/physical","baseDamageFlat":10,"baseDamageFlatLevelBonus":0.1,"baseDamageRatio":0.4,"baseDamageRatioLevelBonus":0.004,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":9},"/abilities/rain_of_arrows":{"hrid":"/abilities/rain_of_arrows","name":"Rain Of Arrows","description":"Shoots a rain of arrows on all enemies","manaCost":30,"cooldownDuration":20000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"all enemies","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/ranged","damageType":"/damage_types/physical","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.3,"baseDamageRatioLevelBonus":0.003,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/all_enemies","conditionHrid":"/combat_trigger_conditions/number_of_active_units","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1},{"dependencyHrid":"/combat_trigger_dependencies/all_enemies","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":12},"/abilities/scratch":{"hrid":"/abilities/scratch","name":"Scratch","description":"Scratch the targeted enemy","manaCost":20,"cooldownDuration":15000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/slash","damageType":"/damage_types/physical","baseDamageFlat":10,"baseDamageFlatLevelBonus":0.1,"baseDamageRatio":0.4,"baseDamageRatioLevelBonus":0.004,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":2},"/abilities/smack":{"hrid":"/abilities/smack","name":"Smack","description":"Smack the targeted enemy","manaCost":20,"cooldownDuration":15000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/smash","damageType":"/damage_types/physical","baseDamageFlat":10,"baseDamageFlatLevelBonus":0.1,"baseDamageRatio":0.4,"baseDamageRatioLevelBonus":0.004,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":3},"/abilities/spike_shell":{"hrid":"/abilities/spike_shell","name":"Spike Shell","description":"Gains physical reflect power for a short time","manaCost":60,"cooldownDuration":30000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"self","effectType":"/ability_effect_types/buff","combatStyleHrid":"","damageType":"","baseDamageFlat":0,"baseDamageFlatLevelBonus":0,"baseDamageRatio":0,"baseDamageRatioLevelBonus":0,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":[{"sourceHrid":"/buff_sources/spike_shell","typeHrid":"/buff_types/physical_reflect_power","ratioBoost":0,"ratioBoostLevelBonus":0,"flatBoost":0.25,"flatBoostLevelBonus":0.0025,"startTime":"0001-01-01T00:00:00Z","duration":15000000000}]}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/self","conditionHrid":"/combat_trigger_conditions/spike_shell","comparatorHrid":"/combat_trigger_comparators/is_inactive","value":0}],"sortIndex":25},"/abilities/stunning_blow":{"hrid":"/abilities/stunning_blow","name":"Stunning Blow","description":"Smashes the targeted enemy and has a chance to stun","manaCost":45,"cooldownDuration":20000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/smash","damageType":"/damage_types/physical","baseDamageFlat":30,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.8,"baseDamageRatioLevelBonus":0.008,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0.7,"stunDuration":3000000000,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":8},"/abilities/sweep":{"hrid":"/abilities/sweep","name":"Sweep","description":"Sweeping attack on all enemies","manaCost":30,"cooldownDuration":20000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"all enemies","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/smash","damageType":"/damage_types/physical","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.3,"baseDamageRatioLevelBonus":0.003,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/all_enemies","conditionHrid":"/combat_trigger_conditions/number_of_active_units","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1},{"dependencyHrid":"/combat_trigger_dependencies/all_enemies","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":6},"/abilities/toughness":{"hrid":"/abilities/toughness","name":"Toughness","description":"Greatly increases armor for a short time","manaCost":60,"cooldownDuration":30000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"self","effectType":"/ability_effect_types/buff","combatStyleHrid":"","damageType":"","baseDamageFlat":0,"baseDamageFlatLevelBonus":0,"baseDamageRatio":0,"baseDamageRatioLevelBonus":0,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":[{"sourceHrid":"/buff_sources/toughness_armor","typeHrid":"/buff_types/armor","ratioBoost":0.25,"ratioBoostLevelBonus":0.0025,"flatBoost":25,"flatBoostLevelBonus":0.25,"startTime":"0001-01-01T00:00:00Z","duration":15000000000},{"sourceHrid":"/buff_sources/toughness_water_resistance","typeHrid":"/buff_types/water_resistance","ratioBoost":0.25,"ratioBoostLevelBonus":0.0025,"flatBoost":25,"flatBoostLevelBonus":0.25,"startTime":"0001-01-01T00:00:00Z","duration":15000000000},{"sourceHrid":"/buff_sources/toughness_nature_resistance","typeHrid":"/buff_types/nature_resistance","ratioBoost":0.25,"ratioBoostLevelBonus":0.0025,"flatBoost":25,"flatBoostLevelBonus":0.25,"startTime":"0001-01-01T00:00:00Z","duration":15000000000},{"sourceHrid":"/buff_sources/toughness_fire_resistance","typeHrid":"/buff_types/fire_resistance","ratioBoost":0.25,"ratioBoostLevelBonus":0.0025,"flatBoost":25,"flatBoostLevelBonus":0.25,"startTime":"0001-01-01T00:00:00Z","duration":15000000000}]}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/self","conditionHrid":"/combat_trigger_conditions/toughness_armor","comparatorHrid":"/combat_trigger_comparators/is_inactive","value":0}],"sortIndex":21},"/abilities/toxic_pollen":{"hrid":"/abilities/toxic_pollen","name":"Toxic Pollen","description":"Casts toxic pollen at all enemies","manaCost":40,"cooldownDuration":18000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"all enemies","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/magic","damageType":"/damage_types/nature","baseDamageFlat":20,"baseDamageFlatLevelBonus":0.2,"baseDamageRatio":0.4,"baseDamageRatioLevelBonus":0.004,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":[{"sourceHrid":"/buff_sources/toxic_pollen_armor","typeHrid":"/buff_types/armor","ratioBoost":0,"ratioBoostLevelBonus":0,"flatBoost":-20,"flatBoostLevelBonus":-0.2,"startTime":"0001-01-01T00:00:00Z","duration":10000000000},{"sourceHrid":"/buff_sources/toxic_pollen_water_resistance","typeHrid":"/buff_types/water_resistance","ratioBoost":0,"ratioBoostLevelBonus":0,"flatBoost":-20,"flatBoostLevelBonus":-0.2,"startTime":"0001-01-01T00:00:00Z","duration":10000000000},{"sourceHrid":"/buff_sources/toxic_pollen_nature_resistance","typeHrid":"/buff_types/nature_resistance","ratioBoost":0,"ratioBoostLevelBonus":0,"flatBoost":-20,"flatBoostLevelBonus":-0.2,"startTime":"0001-01-01T00:00:00Z","duration":10000000000},{"sourceHrid":"/buff_sources/toxic_pollen_fire_resistance","typeHrid":"/buff_types/fire_resistance","ratioBoost":0,"ratioBoostLevelBonus":0,"flatBoost":-20,"flatBoostLevelBonus":-0.2,"startTime":"0001-01-01T00:00:00Z","duration":10000000000}]}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/all_enemies","conditionHrid":"/combat_trigger_conditions/number_of_active_units","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1},{"dependencyHrid":"/combat_trigger_dependencies/all_enemies","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":17},"/abilities/vampirism":{"hrid":"/abilities/vampirism","name":"Vampirism","description":"Gains lifesteal for a short time","manaCost":60,"cooldownDuration":30000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"self","effectType":"/ability_effect_types/buff","combatStyleHrid":"","damageType":"","baseDamageFlat":0,"baseDamageFlatLevelBonus":0,"baseDamageRatio":0,"baseDamageRatioLevelBonus":0,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":[{"sourceHrid":"/buff_sources/vampirism","typeHrid":"/buff_types/life_steal","ratioBoost":0,"ratioBoostLevelBonus":0,"flatBoost":0.1,"flatBoostLevelBonus":0.001,"startTime":"0001-01-01T00:00:00Z","duration":15000000000}]}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/self","conditionHrid":"/combat_trigger_conditions/vampirism","comparatorHrid":"/combat_trigger_comparators/is_inactive","value":0}],"sortIndex":26},"/abilities/water_strike":{"hrid":"/abilities/water_strike","name":"Water Strike","description":"Casts a water strike at the targeted enemy","manaCost":25,"cooldownDuration":10000000000,"hasSpecialEffects":false,"abilityEffects":[{"targetType":"enemy","effectType":"/ability_effect_types/damage","combatStyleHrid":"/combat_styles/magic","damageType":"/damage_types/water","baseDamageFlat":10,"baseDamageFlatLevelBonus":0.1,"baseDamageRatio":0.6,"baseDamageRatioLevelBonus":0.006,"bonusAccuracyRatio":0,"bonusAccuracyRatioLevelBonus":0,"bleedRatio":0,"bleedDuration":0,"stunChance":0,"stunDuration":0,"buffs":null}],"defaultCombatTriggers":[{"dependencyHrid":"/combat_trigger_dependencies/targeted_enemy","conditionHrid":"/combat_trigger_conditions/current_hp","comparatorHrid":"/combat_trigger_comparators/greater_than_equal","value":1}],"sortIndex":13}}');

/***/ }),

/***/ "./src/combatsimulator/data/actionDetailMap.json":
/*!*******************************************************!*\
  !*** ./src/combatsimulator/data/actionDetailMap.json ***!
  \*******************************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"/actions/brewing/artisan_tea":{"hrid":"/actions/brewing/artisan_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Artisan Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":78},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":53},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/emp_tea_leaf","count":2},{"itemHrid":"/items/mooberry","count":2},{"itemHrid":"/items/crimson_milk","count":1}],"outputItems":[{"itemHrid":"/items/artisan_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":37},"/actions/brewing/attack_coffee":{"hrid":"/actions/brewing/attack_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Attack Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":20},"baseTimeCost":9000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":18},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/robusta_coffee_bean","count":1},{"itemHrid":"/items/blackberry","count":1}],"outputItems":[{"itemHrid":"/items/attack_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":9},"/actions/brewing/blessed_tea":{"hrid":"/actions/brewing/blessed_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Blessed Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":88},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":59},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/emp_tea_leaf","count":2},{"itemHrid":"/items/spaceberry","count":2},{"itemHrid":"/items/holy_milk","count":1}],"outputItems":[{"itemHrid":"/items/blessed_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":42},"/actions/brewing/brewing_tea":{"hrid":"/actions/brewing/brewing_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Brewing Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":20},"baseTimeCost":9000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":18},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/black_tea_leaf","count":1},{"itemHrid":"/items/orange","count":1}],"outputItems":[{"itemHrid":"/items/brewing_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":10},"/actions/brewing/cheesesmithing_tea":{"hrid":"/actions/brewing/cheesesmithing_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Cheesesmithing Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":30},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":24},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/burble_tea_leaf","count":1},{"itemHrid":"/items/orange","count":1}],"outputItems":[{"itemHrid":"/items/cheesesmithing_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":14},"/actions/brewing/cooking_tea":{"hrid":"/actions/brewing/cooking_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Cooking Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":15},"baseTimeCost":9000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":15},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/black_tea_leaf","count":1},{"itemHrid":"/items/apple","count":1}],"outputItems":[{"itemHrid":"/items/cooking_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":8},"/actions/brewing/crafting_tea":{"hrid":"/actions/brewing/crafting_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Crafting Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":35},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":27},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/burble_tea_leaf","count":1},{"itemHrid":"/items/plum","count":1}],"outputItems":[{"itemHrid":"/items/crafting_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":16},"/actions/brewing/defense_coffee":{"hrid":"/actions/brewing/defense_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Defense Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":15},"baseTimeCost":9000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":15},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/robusta_coffee_bean","count":1},{"itemHrid":"/items/blueberry","count":1}],"outputItems":[{"itemHrid":"/items/defense_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":7},"/actions/brewing/efficiency_tea":{"hrid":"/actions/brewing/efficiency_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Efficiency Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":68},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":47},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/red_tea_leaf","count":2},{"itemHrid":"/items/marsberry","count":2},{"itemHrid":"/items/rainbow_milk","count":1}],"outputItems":[{"itemHrid":"/items/efficiency_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":33},"/actions/brewing/enhancing_tea":{"hrid":"/actions/brewing/enhancing_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Enhancing Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":25},"baseTimeCost":9000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":21},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/black_tea_leaf","count":1},{"itemHrid":"/items/plum","count":1}],"outputItems":[{"itemHrid":"/items/enhancing_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":12},"/actions/brewing/fermenting_tea":{"hrid":"/actions/brewing/fermenting_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Fermenting Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":53},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":38},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/moolong_tea_leaf","count":2},{"itemHrid":"/items/mooberry","count":2},{"itemHrid":"/items/rainbow_cheese","count":1}],"outputItems":[{"itemHrid":"/items/fermenting_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":26},"/actions/brewing/foraging_tea":{"hrid":"/actions/brewing/foraging_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Foraging Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":9},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/green_tea_leaf","count":1},{"itemHrid":"/items/orange","count":1}],"outputItems":[{"itemHrid":"/items/foraging_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":4},"/actions/brewing/gathering_tea":{"hrid":"/actions/brewing/gathering_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Gathering Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":8},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":11},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/green_tea_leaf","count":2},{"itemHrid":"/items/blueberry","count":2},{"itemHrid":"/items/verdant_milk","count":1}],"outputItems":[{"itemHrid":"/items/gathering_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":5},"/actions/brewing/gourmet_tea":{"hrid":"/actions/brewing/gourmet_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Gourmet Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":23},"baseTimeCost":9000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":20},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/black_tea_leaf","count":2},{"itemHrid":"/items/blackberry","count":2},{"itemHrid":"/items/azure_milk","count":1}],"outputItems":[{"itemHrid":"/items/gourmet_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":11},"/actions/brewing/intelligence_coffee":{"hrid":"/actions/brewing/intelligence_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Intelligence Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":9},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/arabica_coffee_bean","count":1},{"itemHrid":"/items/blackberry","count":1}],"outputItems":[{"itemHrid":"/items/intelligence_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":3},"/actions/brewing/lucky_coffee":{"hrid":"/actions/brewing/lucky_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Lucky Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":53},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":38},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/excelsa_coffee_bean","count":2},{"itemHrid":"/items/peach","count":1},{"itemHrid":"/items/crimson_milk","count":1}],"outputItems":[{"itemHrid":"/items/lucky_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":25},"/actions/brewing/magic_coffee":{"hrid":"/actions/brewing/magic_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Magic Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":40},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":30},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/liberica_coffee_bean","count":1},{"itemHrid":"/items/mooberry","count":1}],"outputItems":[{"itemHrid":"/items/magic_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":19},"/actions/brewing/milking_tea":{"hrid":"/actions/brewing/milking_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Milking Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":6},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/green_tea_leaf","count":1},{"itemHrid":"/items/apple","count":1}],"outputItems":[{"itemHrid":"/items/milking_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":2},"/actions/brewing/power_coffee":{"hrid":"/actions/brewing/power_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Power Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":30},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":24},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/liberica_coffee_bean","count":1},{"itemHrid":"/items/blackberry","count":1}],"outputItems":[{"itemHrid":"/items/power_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":13},"/actions/brewing/ranged_coffee":{"hrid":"/actions/brewing/ranged_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Ranged Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":35},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":27},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/liberica_coffee_bean","count":1},{"itemHrid":"/items/strawberry","count":1}],"outputItems":[{"itemHrid":"/items/ranged_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":15},"/actions/brewing/stamina_coffee":{"hrid":"/actions/brewing/stamina_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Stamina Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":6},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/arabica_coffee_bean","count":1},{"itemHrid":"/items/blueberry","count":1}],"outputItems":[{"itemHrid":"/items/stamina_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":1},"/actions/brewing/super_attack_coffee":{"hrid":"/actions/brewing/super_attack_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Super Attack Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":65},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":45},"dropTable":null,"upgradeItemHrid":"/items/attack_coffee","inputItems":[{"itemHrid":"/items/fieriosa_coffee_bean","count":1},{"itemHrid":"/items/marsberry","count":1}],"outputItems":[{"itemHrid":"/items/super_attack_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":30},"/actions/brewing/super_brewing_tea":{"hrid":"/actions/brewing/super_brewing_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Super Brewing Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":65},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":45},"dropTable":null,"upgradeItemHrid":"/items/brewing_tea","inputItems":[{"itemHrid":"/items/red_tea_leaf","count":1},{"itemHrid":"/items/dragon_fruit","count":1}],"outputItems":[{"itemHrid":"/items/super_brewing_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":31},"/actions/brewing/super_cheesesmithing_tea":{"hrid":"/actions/brewing/super_cheesesmithing_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Super Cheesesmithing Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":75},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":51},"dropTable":null,"upgradeItemHrid":"/items/cheesesmithing_tea","inputItems":[{"itemHrid":"/items/emp_tea_leaf","count":1},{"itemHrid":"/items/peach","count":1}],"outputItems":[{"itemHrid":"/items/super_cheesesmithing_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":36},"/actions/brewing/super_cooking_tea":{"hrid":"/actions/brewing/super_cooking_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Super Cooking Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":60},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":42},"dropTable":null,"upgradeItemHrid":"/items/cooking_tea","inputItems":[{"itemHrid":"/items/red_tea_leaf","count":1},{"itemHrid":"/items/peach","count":1}],"outputItems":[{"itemHrid":"/items/super_cooking_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":29},"/actions/brewing/super_crafting_tea":{"hrid":"/actions/brewing/super_crafting_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Super Crafting Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":80},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":54},"dropTable":null,"upgradeItemHrid":"/items/crafting_tea","inputItems":[{"itemHrid":"/items/emp_tea_leaf","count":1},{"itemHrid":"/items/dragon_fruit","count":1}],"outputItems":[{"itemHrid":"/items/super_crafting_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":39},"/actions/brewing/super_defense_coffee":{"hrid":"/actions/brewing/super_defense_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Super Defense Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":60},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":42},"dropTable":null,"upgradeItemHrid":"/items/defense_coffee","inputItems":[{"itemHrid":"/items/fieriosa_coffee_bean","count":1},{"itemHrid":"/items/mooberry","count":1}],"outputItems":[{"itemHrid":"/items/super_defense_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":28},"/actions/brewing/super_enhancing_tea":{"hrid":"/actions/brewing/super_enhancing_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Super Enhancing Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":70},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":48},"dropTable":null,"upgradeItemHrid":"/items/enhancing_tea","inputItems":[{"itemHrid":"/items/red_tea_leaf","count":1},{"itemHrid":"/items/star_fruit","count":1}],"outputItems":[{"itemHrid":"/items/super_enhancing_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":34},"/actions/brewing/super_foraging_tea":{"hrid":"/actions/brewing/super_foraging_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Super Foraging Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":50},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":36},"dropTable":null,"upgradeItemHrid":"/items/foraging_tea","inputItems":[{"itemHrid":"/items/moolong_tea_leaf","count":1},{"itemHrid":"/items/peach","count":1}],"outputItems":[{"itemHrid":"/items/super_foraging_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":24},"/actions/brewing/super_intelligence_coffee":{"hrid":"/actions/brewing/super_intelligence_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Super Intelligence Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":50},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":36},"dropTable":null,"upgradeItemHrid":"/items/intelligence_coffee","inputItems":[{"itemHrid":"/items/excelsa_coffee_bean","count":1},{"itemHrid":"/items/mooberry","count":1}],"outputItems":[{"itemHrid":"/items/super_intelligence_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":23},"/actions/brewing/super_magic_coffee":{"hrid":"/actions/brewing/super_magic_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Super Magic Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":85},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":57},"dropTable":null,"upgradeItemHrid":"/items/magic_coffee","inputItems":[{"itemHrid":"/items/spacia_coffee_bean","count":1},{"itemHrid":"/items/spaceberry","count":1}],"outputItems":[{"itemHrid":"/items/super_magic_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":40},"/actions/brewing/super_milking_tea":{"hrid":"/actions/brewing/super_milking_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Super Milking Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":45},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":33},"dropTable":null,"upgradeItemHrid":"/items/milking_tea","inputItems":[{"itemHrid":"/items/moolong_tea_leaf","count":1},{"itemHrid":"/items/plum","count":1}],"outputItems":[{"itemHrid":"/items/super_milking_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":22},"/actions/brewing/super_power_coffee":{"hrid":"/actions/brewing/super_power_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Super Power Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":75},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":51},"dropTable":null,"upgradeItemHrid":"/items/power_coffee","inputItems":[{"itemHrid":"/items/spacia_coffee_bean","count":1},{"itemHrid":"/items/mooberry","count":1}],"outputItems":[{"itemHrid":"/items/super_power_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":35},"/actions/brewing/super_ranged_coffee":{"hrid":"/actions/brewing/super_ranged_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Super Ranged Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":80},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":54},"dropTable":null,"upgradeItemHrid":"/items/ranged_coffee","inputItems":[{"itemHrid":"/items/spacia_coffee_bean","count":1},{"itemHrid":"/items/marsberry","count":1}],"outputItems":[{"itemHrid":"/items/super_ranged_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":38},"/actions/brewing/super_stamina_coffee":{"hrid":"/actions/brewing/super_stamina_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Super Stamina Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":45},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":33},"dropTable":null,"upgradeItemHrid":"/items/stamina_coffee","inputItems":[{"itemHrid":"/items/excelsa_coffee_bean","count":1},{"itemHrid":"/items/strawberry","count":1}],"outputItems":[{"itemHrid":"/items/super_stamina_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":21},"/actions/brewing/super_tailoring_tea":{"hrid":"/actions/brewing/super_tailoring_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Super Tailoring Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":85},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":57},"dropTable":null,"upgradeItemHrid":"/items/tailoring_tea","inputItems":[{"itemHrid":"/items/emp_tea_leaf","count":1},{"itemHrid":"/items/star_fruit","count":1}],"outputItems":[{"itemHrid":"/items/super_tailoring_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":41},"/actions/brewing/super_woodcutting_tea":{"hrid":"/actions/brewing/super_woodcutting_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Super Woodcutting Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":55},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":39},"dropTable":null,"upgradeItemHrid":"/items/woodcutting_tea","inputItems":[{"itemHrid":"/items/moolong_tea_leaf","count":1},{"itemHrid":"/items/dragon_fruit","count":1}],"outputItems":[{"itemHrid":"/items/super_woodcutting_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":27},"/actions/brewing/swiftness_coffee":{"hrid":"/actions/brewing/swiftness_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Swiftness Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":68},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":47},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/fieriosa_coffee_bean","count":2},{"itemHrid":"/items/dragon_fruit","count":1},{"itemHrid":"/items/rainbow_milk","count":1}],"outputItems":[{"itemHrid":"/items/swiftness_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":32},"/actions/brewing/tailoring_tea":{"hrid":"/actions/brewing/tailoring_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Tailoring Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":40},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":30},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/burble_tea_leaf","count":1},{"itemHrid":"/items/peach","count":1}],"outputItems":[{"itemHrid":"/items/tailoring_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":20},"/actions/brewing/wisdom_coffee":{"hrid":"/actions/brewing/wisdom_coffee","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/coffee","name":"Wisdom Coffee","levelRequirement":{"skillHrid":"/skills/brewing","level":36},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":29},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/liberica_coffee_bean","count":2},{"itemHrid":"/items/plum","count":1},{"itemHrid":"/items/burble_milk","count":1}],"outputItems":[{"itemHrid":"/items/wisdom_coffee","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":17},"/actions/brewing/wisdom_tea":{"hrid":"/actions/brewing/wisdom_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Wisdom Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":36},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":29},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/burble_tea_leaf","count":2},{"itemHrid":"/items/strawberry","count":2},{"itemHrid":"/items/burble_milk","count":1}],"outputItems":[{"itemHrid":"/items/wisdom_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":18},"/actions/brewing/woodcutting_tea":{"hrid":"/actions/brewing/woodcutting_tea","function":"/action_functions/production","type":"/action_types/brewing","category":"/action_categories/brewing/tea","name":"Woodcutting Tea","levelRequirement":{"skillHrid":"/skills/brewing","level":10},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/brewing","value":12},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/green_tea_leaf","count":1},{"itemHrid":"/items/plum","count":1}],"outputItems":[{"itemHrid":"/items/woodcutting_tea","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":6},"/actions/cheesesmithing/azure_boots":{"hrid":"/actions/cheesesmithing/azure_boots","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/feet","name":"Azure Boots","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":30},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":96},"dropTable":null,"upgradeItemHrid":"/items/verdant_boots","inputItems":[{"itemHrid":"/items/azure_cheese","count":16}],"outputItems":[{"itemHrid":"/items/azure_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":43},"/actions/cheesesmithing/azure_brush":{"hrid":"/actions/cheesesmithing/azure_brush","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Azure Brush","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":168},"dropTable":null,"upgradeItemHrid":"/items/verdant_brush","inputItems":[{"itemHrid":"/items/azure_cheese","count":28}],"outputItems":[{"itemHrid":"/items/azure_brush","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":48},"/actions/cheesesmithing/azure_buckler":{"hrid":"/actions/cheesesmithing/azure_buckler","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/off_hand","name":"Azure Buckler","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":37},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":144},"dropTable":null,"upgradeItemHrid":"/items/verdant_buckler","inputItems":[{"itemHrid":"/items/azure_cheese","count":24}],"outputItems":[{"itemHrid":"/items/azure_buckler","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":60},"/actions/cheesesmithing/azure_bulwark":{"hrid":"/actions/cheesesmithing/azure_bulwark","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/two_hand","name":"Azure Bulwark","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":40},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":288},"dropTable":null,"upgradeItemHrid":"/items/verdant_bulwark","inputItems":[{"itemHrid":"/items/azure_cheese","count":48}],"outputItems":[{"itemHrid":"/items/azure_bulwark","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":63},"/actions/cheesesmithing/azure_cheese":{"hrid":"/actions/cheesesmithing/azure_cheese","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/material","name":"Azure Cheese","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":30},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":12},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/azure_milk","count":2}],"outputItems":[{"itemHrid":"/items/azure_cheese","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":42},"/actions/cheesesmithing/azure_chisel":{"hrid":"/actions/cheesesmithing/azure_chisel","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Azure Chisel","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":168},"dropTable":null,"upgradeItemHrid":"/items/verdant_chisel","inputItems":[{"itemHrid":"/items/azure_cheese","count":28}],"outputItems":[{"itemHrid":"/items/azure_chisel","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":52},"/actions/cheesesmithing/azure_enhancer":{"hrid":"/actions/cheesesmithing/azure_enhancer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Azure Enhancer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":168},"dropTable":null,"upgradeItemHrid":"/items/verdant_enhancer","inputItems":[{"itemHrid":"/items/azure_cheese","count":28}],"outputItems":[{"itemHrid":"/items/azure_enhancer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":56},"/actions/cheesesmithing/azure_gauntlets":{"hrid":"/actions/cheesesmithing/azure_gauntlets","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/hands","name":"Azure Gauntlets","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":31},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":96},"dropTable":null,"upgradeItemHrid":"/items/verdant_gauntlets","inputItems":[{"itemHrid":"/items/azure_cheese","count":16}],"outputItems":[{"itemHrid":"/items/azure_gauntlets","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":44},"/actions/cheesesmithing/azure_hammer":{"hrid":"/actions/cheesesmithing/azure_hammer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Azure Hammer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":168},"dropTable":null,"upgradeItemHrid":"/items/verdant_hammer","inputItems":[{"itemHrid":"/items/azure_cheese","count":28}],"outputItems":[{"itemHrid":"/items/azure_hammer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":51},"/actions/cheesesmithing/azure_hatchet":{"hrid":"/actions/cheesesmithing/azure_hatchet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Azure Hatchet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":168},"dropTable":null,"upgradeItemHrid":"/items/verdant_hatchet","inputItems":[{"itemHrid":"/items/azure_cheese","count":28}],"outputItems":[{"itemHrid":"/items/azure_hatchet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":50},"/actions/cheesesmithing/azure_helmet":{"hrid":"/actions/cheesesmithing/azure_helmet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/head","name":"Azure Helmet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":36},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":120},"dropTable":null,"upgradeItemHrid":"/items/verdant_helmet","inputItems":[{"itemHrid":"/items/azure_cheese","count":20}],"outputItems":[{"itemHrid":"/items/azure_helmet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":59},"/actions/cheesesmithing/azure_mace":{"hrid":"/actions/cheesesmithing/azure_mace","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Azure Mace","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":34},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":216},"dropTable":null,"upgradeItemHrid":"/items/verdant_mace","inputItems":[{"itemHrid":"/items/azure_cheese","count":36}],"outputItems":[{"itemHrid":"/items/azure_mace","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":47},"/actions/cheesesmithing/azure_needle":{"hrid":"/actions/cheesesmithing/azure_needle","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Azure Needle","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":168},"dropTable":null,"upgradeItemHrid":"/items/verdant_needle","inputItems":[{"itemHrid":"/items/azure_cheese","count":28}],"outputItems":[{"itemHrid":"/items/azure_needle","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":53},"/actions/cheesesmithing/azure_plate_body":{"hrid":"/actions/cheesesmithing/azure_plate_body","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/body","name":"Azure Plate Body","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":39},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":192},"dropTable":null,"upgradeItemHrid":"/items/verdant_plate_body","inputItems":[{"itemHrid":"/items/azure_cheese","count":32}],"outputItems":[{"itemHrid":"/items/azure_plate_body","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":62},"/actions/cheesesmithing/azure_plate_legs":{"hrid":"/actions/cheesesmithing/azure_plate_legs","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/legs","name":"Azure Plate Legs","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":38},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":168},"dropTable":null,"upgradeItemHrid":"/items/verdant_plate_legs","inputItems":[{"itemHrid":"/items/azure_cheese","count":28}],"outputItems":[{"itemHrid":"/items/azure_plate_legs","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":61},"/actions/cheesesmithing/azure_pot":{"hrid":"/actions/cheesesmithing/azure_pot","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Azure Pot","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":168},"dropTable":null,"upgradeItemHrid":"/items/verdant_pot","inputItems":[{"itemHrid":"/items/azure_cheese","count":28}],"outputItems":[{"itemHrid":"/items/azure_pot","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":55},"/actions/cheesesmithing/azure_shears":{"hrid":"/actions/cheesesmithing/azure_shears","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Azure Shears","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":168},"dropTable":null,"upgradeItemHrid":"/items/verdant_shears","inputItems":[{"itemHrid":"/items/azure_cheese","count":28}],"outputItems":[{"itemHrid":"/items/azure_shears","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":49},"/actions/cheesesmithing/azure_spatula":{"hrid":"/actions/cheesesmithing/azure_spatula","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Azure Spatula","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":168},"dropTable":null,"upgradeItemHrid":"/items/verdant_spatula","inputItems":[{"itemHrid":"/items/azure_cheese","count":28}],"outputItems":[{"itemHrid":"/items/azure_spatula","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":54},"/actions/cheesesmithing/azure_spear":{"hrid":"/actions/cheesesmithing/azure_spear","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Azure Spear","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":32},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":216},"dropTable":null,"upgradeItemHrid":"/items/verdant_spear","inputItems":[{"itemHrid":"/items/azure_cheese","count":36}],"outputItems":[{"itemHrid":"/items/azure_spear","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":45},"/actions/cheesesmithing/azure_sword":{"hrid":"/actions/cheesesmithing/azure_sword","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Azure Sword","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":33},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":216},"dropTable":null,"upgradeItemHrid":"/items/verdant_sword","inputItems":[{"itemHrid":"/items/azure_cheese","count":36}],"outputItems":[{"itemHrid":"/items/azure_sword","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":46},"/actions/cheesesmithing/black_bear_gloves":{"hrid":"/actions/cheesesmithing/black_bear_gloves","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/feet","name":"Black Bear Shoes","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":10000},"dropTable":null,"upgradeItemHrid":"/items/rainbow_boots","inputItems":[{"itemHrid":"/items/black_bear_fluff","count":10}],"outputItems":[{"itemHrid":"/items/black_bear_shoes","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":124},"/actions/cheesesmithing/burble_boots":{"hrid":"/actions/cheesesmithing/burble_boots","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/feet","name":"Burble Boots","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":45},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":216},"dropTable":null,"upgradeItemHrid":"/items/azure_boots","inputItems":[{"itemHrid":"/items/burble_cheese","count":24}],"outputItems":[{"itemHrid":"/items/burble_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":67},"/actions/cheesesmithing/burble_brush":{"hrid":"/actions/cheesesmithing/burble_brush","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Burble Brush","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":50},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":378},"dropTable":null,"upgradeItemHrid":"/items/azure_brush","inputItems":[{"itemHrid":"/items/burble_cheese","count":42}],"outputItems":[{"itemHrid":"/items/burble_brush","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":72},"/actions/cheesesmithing/burble_buckler":{"hrid":"/actions/cheesesmithing/burble_buckler","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/off_hand","name":"Burble Buckler","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":52},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":324},"dropTable":null,"upgradeItemHrid":"/items/azure_buckler","inputItems":[{"itemHrid":"/items/burble_cheese","count":36}],"outputItems":[{"itemHrid":"/items/burble_buckler","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":82},"/actions/cheesesmithing/burble_bulwark":{"hrid":"/actions/cheesesmithing/burble_bulwark","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/two_hand","name":"Burble Bulwark","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":55},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":648},"dropTable":null,"upgradeItemHrid":"/items/azure_bulwark","inputItems":[{"itemHrid":"/items/burble_cheese","count":72}],"outputItems":[{"itemHrid":"/items/burble_bulwark","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":85},"/actions/cheesesmithing/burble_cheese":{"hrid":"/actions/cheesesmithing/burble_cheese","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/material","name":"Burble Cheese","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":45},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":18},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/burble_milk","count":2}],"outputItems":[{"itemHrid":"/items/burble_cheese","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":66},"/actions/cheesesmithing/burble_chisel":{"hrid":"/actions/cheesesmithing/burble_chisel","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Burble Chisel","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":50},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":378},"dropTable":null,"upgradeItemHrid":"/items/azure_chisel","inputItems":[{"itemHrid":"/items/burble_cheese","count":42}],"outputItems":[{"itemHrid":"/items/burble_chisel","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":76},"/actions/cheesesmithing/burble_enhancer":{"hrid":"/actions/cheesesmithing/burble_enhancer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Burble Enhancer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":50},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":378},"dropTable":null,"upgradeItemHrid":"/items/azure_enhancer","inputItems":[{"itemHrid":"/items/burble_cheese","count":42}],"outputItems":[{"itemHrid":"/items/burble_enhancer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":80},"/actions/cheesesmithing/burble_gauntlets":{"hrid":"/actions/cheesesmithing/burble_gauntlets","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/hands","name":"Burble Gauntlets","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":46},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":216},"dropTable":null,"upgradeItemHrid":"/items/azure_gauntlets","inputItems":[{"itemHrid":"/items/burble_cheese","count":24}],"outputItems":[{"itemHrid":"/items/burble_gauntlets","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":68},"/actions/cheesesmithing/burble_hammer":{"hrid":"/actions/cheesesmithing/burble_hammer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Burble Hammer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":50},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":378},"dropTable":null,"upgradeItemHrid":"/items/azure_hammer","inputItems":[{"itemHrid":"/items/burble_cheese","count":42}],"outputItems":[{"itemHrid":"/items/burble_hammer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":75},"/actions/cheesesmithing/burble_hatchet":{"hrid":"/actions/cheesesmithing/burble_hatchet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Burble Hatchet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":50},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":378},"dropTable":null,"upgradeItemHrid":"/items/azure_hatchet","inputItems":[{"itemHrid":"/items/burble_cheese","count":42}],"outputItems":[{"itemHrid":"/items/burble_hatchet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":74},"/actions/cheesesmithing/burble_helmet":{"hrid":"/actions/cheesesmithing/burble_helmet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/head","name":"Burble Helmet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":51},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":270},"dropTable":null,"upgradeItemHrid":"/items/azure_helmet","inputItems":[{"itemHrid":"/items/burble_cheese","count":30}],"outputItems":[{"itemHrid":"/items/burble_helmet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":81},"/actions/cheesesmithing/burble_mace":{"hrid":"/actions/cheesesmithing/burble_mace","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Burble Mace","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":49},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":486},"dropTable":null,"upgradeItemHrid":"/items/azure_mace","inputItems":[{"itemHrid":"/items/burble_cheese","count":54}],"outputItems":[{"itemHrid":"/items/burble_mace","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":71},"/actions/cheesesmithing/burble_needle":{"hrid":"/actions/cheesesmithing/burble_needle","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Burble Needle","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":50},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":378},"dropTable":null,"upgradeItemHrid":"/items/azure_needle","inputItems":[{"itemHrid":"/items/burble_cheese","count":42}],"outputItems":[{"itemHrid":"/items/burble_needle","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":77},"/actions/cheesesmithing/burble_plate_body":{"hrid":"/actions/cheesesmithing/burble_plate_body","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/body","name":"Burble Plate Body","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":54},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":432},"dropTable":null,"upgradeItemHrid":"/items/azure_plate_body","inputItems":[{"itemHrid":"/items/burble_cheese","count":48}],"outputItems":[{"itemHrid":"/items/burble_plate_body","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":84},"/actions/cheesesmithing/burble_plate_legs":{"hrid":"/actions/cheesesmithing/burble_plate_legs","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/legs","name":"Burble Plate Legs","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":53},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":378},"dropTable":null,"upgradeItemHrid":"/items/azure_plate_legs","inputItems":[{"itemHrid":"/items/burble_cheese","count":42}],"outputItems":[{"itemHrid":"/items/burble_plate_legs","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":83},"/actions/cheesesmithing/burble_pot":{"hrid":"/actions/cheesesmithing/burble_pot","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Burble Pot","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":50},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":378},"dropTable":null,"upgradeItemHrid":"/items/azure_pot","inputItems":[{"itemHrid":"/items/burble_cheese","count":42}],"outputItems":[{"itemHrid":"/items/burble_pot","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":79},"/actions/cheesesmithing/burble_shears":{"hrid":"/actions/cheesesmithing/burble_shears","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Burble Shears","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":50},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":378},"dropTable":null,"upgradeItemHrid":"/items/azure_shears","inputItems":[{"itemHrid":"/items/burble_cheese","count":42}],"outputItems":[{"itemHrid":"/items/burble_shears","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":73},"/actions/cheesesmithing/burble_spatula":{"hrid":"/actions/cheesesmithing/burble_spatula","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Burble Spatula","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":50},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":378},"dropTable":null,"upgradeItemHrid":"/items/azure_spatula","inputItems":[{"itemHrid":"/items/burble_cheese","count":42}],"outputItems":[{"itemHrid":"/items/burble_spatula","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":78},"/actions/cheesesmithing/burble_spear":{"hrid":"/actions/cheesesmithing/burble_spear","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Burble Spear","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":47},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":486},"dropTable":null,"upgradeItemHrid":"/items/azure_spear","inputItems":[{"itemHrid":"/items/burble_cheese","count":54}],"outputItems":[{"itemHrid":"/items/burble_spear","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":69},"/actions/cheesesmithing/burble_sword":{"hrid":"/actions/cheesesmithing/burble_sword","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Burble Sword","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":48},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":486},"dropTable":null,"upgradeItemHrid":"/items/azure_sword","inputItems":[{"itemHrid":"/items/burble_cheese","count":54}],"outputItems":[{"itemHrid":"/items/burble_sword","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":70},"/actions/cheesesmithing/cheese":{"hrid":"/actions/cheesesmithing/cheese","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/material","name":"Cheese","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":4},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/milk","count":2}],"outputItems":[{"itemHrid":"/items/cheese","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":1},"/actions/cheesesmithing/cheese_boots":{"hrid":"/actions/cheesesmithing/cheese_boots","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/feet","name":"Cheese Boots","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":16},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":8}],"outputItems":[{"itemHrid":"/items/cheese_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":2},"/actions/cheesesmithing/cheese_brush":{"hrid":"/actions/cheesesmithing/cheese_brush","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Cheese Brush","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":14}],"outputItems":[{"itemHrid":"/items/cheese_brush","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":7},"/actions/cheesesmithing/cheese_buckler":{"hrid":"/actions/cheesesmithing/cheese_buckler","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/off_hand","name":"Cheese Buckler","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":7},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":24},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":12}],"outputItems":[{"itemHrid":"/items/cheese_buckler","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":17},"/actions/cheesesmithing/cheese_bulwark":{"hrid":"/actions/cheesesmithing/cheese_bulwark","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/two_hand","name":"Cheese Bulwark","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":10},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":48},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":24}],"outputItems":[{"itemHrid":"/items/cheese_bulwark","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":20},"/actions/cheesesmithing/cheese_chisel":{"hrid":"/actions/cheesesmithing/cheese_chisel","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Cheese Chisel","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":14}],"outputItems":[{"itemHrid":"/items/cheese_chisel","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":11},"/actions/cheesesmithing/cheese_enhancer":{"hrid":"/actions/cheesesmithing/cheese_enhancer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Cheese Enhancer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":14}],"outputItems":[{"itemHrid":"/items/cheese_enhancer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":15},"/actions/cheesesmithing/cheese_gauntlets":{"hrid":"/actions/cheesesmithing/cheese_gauntlets","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/hands","name":"Cheese Gauntlets","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":16},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":8}],"outputItems":[{"itemHrid":"/items/cheese_gauntlets","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":3},"/actions/cheesesmithing/cheese_hammer":{"hrid":"/actions/cheesesmithing/cheese_hammer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Cheese Hammer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":14}],"outputItems":[{"itemHrid":"/items/cheese_hammer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":10},"/actions/cheesesmithing/cheese_hatchet":{"hrid":"/actions/cheesesmithing/cheese_hatchet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Cheese Hatchet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":14}],"outputItems":[{"itemHrid":"/items/cheese_hatchet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":9},"/actions/cheesesmithing/cheese_helmet":{"hrid":"/actions/cheesesmithing/cheese_helmet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/head","name":"Cheese Helmet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":6},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":20},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":10}],"outputItems":[{"itemHrid":"/items/cheese_helmet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":16},"/actions/cheesesmithing/cheese_mace":{"hrid":"/actions/cheesesmithing/cheese_mace","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Cheese Mace","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":4},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":36},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":18}],"outputItems":[{"itemHrid":"/items/cheese_mace","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":6},"/actions/cheesesmithing/cheese_needle":{"hrid":"/actions/cheesesmithing/cheese_needle","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Cheese Needle","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":14}],"outputItems":[{"itemHrid":"/items/cheese_needle","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":12},"/actions/cheesesmithing/cheese_plate_body":{"hrid":"/actions/cheesesmithing/cheese_plate_body","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/body","name":"Cheese Plate Body","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":9},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":32},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":16}],"outputItems":[{"itemHrid":"/items/cheese_plate_body","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":19},"/actions/cheesesmithing/cheese_plate_legs":{"hrid":"/actions/cheesesmithing/cheese_plate_legs","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/legs","name":"Cheese Plate Legs","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":8},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":14}],"outputItems":[{"itemHrid":"/items/cheese_plate_legs","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":18},"/actions/cheesesmithing/cheese_pot":{"hrid":"/actions/cheesesmithing/cheese_pot","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Cheese Pot","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":14}],"outputItems":[{"itemHrid":"/items/cheese_pot","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":14},"/actions/cheesesmithing/cheese_shears":{"hrid":"/actions/cheesesmithing/cheese_shears","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Cheese Shears","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":14}],"outputItems":[{"itemHrid":"/items/cheese_shears","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":8},"/actions/cheesesmithing/cheese_spatula":{"hrid":"/actions/cheesesmithing/cheese_spatula","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Cheese Spatula","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":14}],"outputItems":[{"itemHrid":"/items/cheese_spatula","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":13},"/actions/cheesesmithing/cheese_spear":{"hrid":"/actions/cheesesmithing/cheese_spear","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Cheese Spear","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":2},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":36},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":18}],"outputItems":[{"itemHrid":"/items/cheese_spear","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":4},"/actions/cheesesmithing/cheese_sword":{"hrid":"/actions/cheesesmithing/cheese_sword","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Cheese Sword","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":3},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":36},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cheese","count":18}],"outputItems":[{"itemHrid":"/items/cheese_sword","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":5},"/actions/cheesesmithing/crimson_boots":{"hrid":"/actions/cheesesmithing/crimson_boots","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/feet","name":"Crimson Boots","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":60},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":432},"dropTable":null,"upgradeItemHrid":"/items/burble_boots","inputItems":[{"itemHrid":"/items/crimson_cheese","count":36}],"outputItems":[{"itemHrid":"/items/crimson_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":87},"/actions/cheesesmithing/crimson_brush":{"hrid":"/actions/cheesesmithing/crimson_brush","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Crimson Brush","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":65},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":756},"dropTable":null,"upgradeItemHrid":"/items/burble_brush","inputItems":[{"itemHrid":"/items/crimson_cheese","count":63}],"outputItems":[{"itemHrid":"/items/crimson_brush","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":92},"/actions/cheesesmithing/crimson_buckler":{"hrid":"/actions/cheesesmithing/crimson_buckler","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/off_hand","name":"Crimson Buckler","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":67},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":648},"dropTable":null,"upgradeItemHrid":"/items/burble_buckler","inputItems":[{"itemHrid":"/items/crimson_cheese","count":54}],"outputItems":[{"itemHrid":"/items/crimson_buckler","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":102},"/actions/cheesesmithing/crimson_bulwark":{"hrid":"/actions/cheesesmithing/crimson_bulwark","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/two_hand","name":"Crimson Bulwark","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":70},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1296},"dropTable":null,"upgradeItemHrid":"/items/burble_bulwark","inputItems":[{"itemHrid":"/items/crimson_cheese","count":108}],"outputItems":[{"itemHrid":"/items/crimson_bulwark","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":109},"/actions/cheesesmithing/crimson_cheese":{"hrid":"/actions/cheesesmithing/crimson_cheese","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/material","name":"Crimson Cheese","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":24},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/crimson_milk","count":2}],"outputItems":[{"itemHrid":"/items/crimson_cheese","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":86},"/actions/cheesesmithing/crimson_chisel":{"hrid":"/actions/cheesesmithing/crimson_chisel","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Crimson Chisel","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":65},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":756},"dropTable":null,"upgradeItemHrid":"/items/burble_chisel","inputItems":[{"itemHrid":"/items/crimson_cheese","count":63}],"outputItems":[{"itemHrid":"/items/crimson_chisel","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":96},"/actions/cheesesmithing/crimson_enhancer":{"hrid":"/actions/cheesesmithing/crimson_enhancer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Crimson Enhancer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":65},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":756},"dropTable":null,"upgradeItemHrid":"/items/burble_enhancer","inputItems":[{"itemHrid":"/items/crimson_cheese","count":63}],"outputItems":[{"itemHrid":"/items/crimson_enhancer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":100},"/actions/cheesesmithing/crimson_gauntlets":{"hrid":"/actions/cheesesmithing/crimson_gauntlets","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/hands","name":"Crimson Gauntlets","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":61},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":432},"dropTable":null,"upgradeItemHrid":"/items/burble_gauntlets","inputItems":[{"itemHrid":"/items/crimson_cheese","count":36}],"outputItems":[{"itemHrid":"/items/crimson_gauntlets","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":88},"/actions/cheesesmithing/crimson_hammer":{"hrid":"/actions/cheesesmithing/crimson_hammer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Crimson Hammer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":65},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":756},"dropTable":null,"upgradeItemHrid":"/items/burble_hammer","inputItems":[{"itemHrid":"/items/crimson_cheese","count":63}],"outputItems":[{"itemHrid":"/items/crimson_hammer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":95},"/actions/cheesesmithing/crimson_hatchet":{"hrid":"/actions/cheesesmithing/crimson_hatchet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Crimson Hatchet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":65},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":756},"dropTable":null,"upgradeItemHrid":"/items/burble_hatchet","inputItems":[{"itemHrid":"/items/crimson_cheese","count":63}],"outputItems":[{"itemHrid":"/items/crimson_hatchet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":94},"/actions/cheesesmithing/crimson_helmet":{"hrid":"/actions/cheesesmithing/crimson_helmet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/head","name":"Crimson Helmet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":66},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":540},"dropTable":null,"upgradeItemHrid":"/items/burble_helmet","inputItems":[{"itemHrid":"/items/crimson_cheese","count":45}],"outputItems":[{"itemHrid":"/items/crimson_helmet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":101},"/actions/cheesesmithing/crimson_mace":{"hrid":"/actions/cheesesmithing/crimson_mace","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Crimson Mace","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":64},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":972},"dropTable":null,"upgradeItemHrid":"/items/burble_mace","inputItems":[{"itemHrid":"/items/crimson_cheese","count":81}],"outputItems":[{"itemHrid":"/items/crimson_mace","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":91},"/actions/cheesesmithing/crimson_needle":{"hrid":"/actions/cheesesmithing/crimson_needle","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Crimson Needle","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":65},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":756},"dropTable":null,"upgradeItemHrid":"/items/burble_needle","inputItems":[{"itemHrid":"/items/crimson_cheese","count":63}],"outputItems":[{"itemHrid":"/items/crimson_needle","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":97},"/actions/cheesesmithing/crimson_plate_body":{"hrid":"/actions/cheesesmithing/crimson_plate_body","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/body","name":"Crimson Plate Body","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":69},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":864},"dropTable":null,"upgradeItemHrid":"/items/burble_plate_body","inputItems":[{"itemHrid":"/items/crimson_cheese","count":72}],"outputItems":[{"itemHrid":"/items/crimson_plate_body","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":106},"/actions/cheesesmithing/crimson_plate_legs":{"hrid":"/actions/cheesesmithing/crimson_plate_legs","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/legs","name":"Crimson Plate Legs","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":68},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":756},"dropTable":null,"upgradeItemHrid":"/items/burble_plate_legs","inputItems":[{"itemHrid":"/items/crimson_cheese","count":63}],"outputItems":[{"itemHrid":"/items/crimson_plate_legs","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":103},"/actions/cheesesmithing/crimson_pot":{"hrid":"/actions/cheesesmithing/crimson_pot","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Crimson Pot","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":65},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":756},"dropTable":null,"upgradeItemHrid":"/items/burble_pot","inputItems":[{"itemHrid":"/items/crimson_cheese","count":63}],"outputItems":[{"itemHrid":"/items/crimson_pot","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":99},"/actions/cheesesmithing/crimson_shears":{"hrid":"/actions/cheesesmithing/crimson_shears","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Crimson Shears","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":65},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":756},"dropTable":null,"upgradeItemHrid":"/items/burble_shears","inputItems":[{"itemHrid":"/items/crimson_cheese","count":63}],"outputItems":[{"itemHrid":"/items/crimson_shears","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":93},"/actions/cheesesmithing/crimson_spatula":{"hrid":"/actions/cheesesmithing/crimson_spatula","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Crimson Spatula","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":65},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":756},"dropTable":null,"upgradeItemHrid":"/items/burble_spatula","inputItems":[{"itemHrid":"/items/crimson_cheese","count":63}],"outputItems":[{"itemHrid":"/items/crimson_spatula","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":98},"/actions/cheesesmithing/crimson_spear":{"hrid":"/actions/cheesesmithing/crimson_spear","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Crimson Spear","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":62},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":972},"dropTable":null,"upgradeItemHrid":"/items/burble_spear","inputItems":[{"itemHrid":"/items/crimson_cheese","count":81}],"outputItems":[{"itemHrid":"/items/crimson_spear","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":89},"/actions/cheesesmithing/crimson_sword":{"hrid":"/actions/cheesesmithing/crimson_sword","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Crimson Sword","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":63},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":972},"dropTable":null,"upgradeItemHrid":"/items/burble_sword","inputItems":[{"itemHrid":"/items/crimson_cheese","count":81}],"outputItems":[{"itemHrid":"/items/crimson_sword","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":90},"/actions/cheesesmithing/granite_bludgeon":{"hrid":"/actions/cheesesmithing/granite_bludgeon","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Granite Bludgeon","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":48000},"dropTable":null,"upgradeItemHrid":"/items/holy_mace","inputItems":[{"itemHrid":"/items/living_granite","count":20}],"outputItems":[{"itemHrid":"/items/granite_bludgeon","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":149},"/actions/cheesesmithing/grizzly_bear_gloves":{"hrid":"/actions/cheesesmithing/grizzly_bear_gloves","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/feet","name":"Grizzly Bear Shoes","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":10000},"dropTable":null,"upgradeItemHrid":"/items/rainbow_boots","inputItems":[{"itemHrid":"/items/grizzly_bear_fluff","count":10}],"outputItems":[{"itemHrid":"/items/grizzly_bear_shoes","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":125},"/actions/cheesesmithing/holy_boots":{"hrid":"/actions/cheesesmithing/holy_boots","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/feet","name":"Holy Boots","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":80},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1440},"dropTable":null,"upgradeItemHrid":"/items/rainbow_boots","inputItems":[{"itemHrid":"/items/holy_cheese","count":72}],"outputItems":[{"itemHrid":"/items/holy_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":132},"/actions/cheesesmithing/holy_brush":{"hrid":"/actions/cheesesmithing/holy_brush","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Holy Brush","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2520},"dropTable":null,"upgradeItemHrid":"/items/rainbow_brush","inputItems":[{"itemHrid":"/items/holy_cheese","count":126}],"outputItems":[{"itemHrid":"/items/holy_brush","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":138},"/actions/cheesesmithing/holy_buckler":{"hrid":"/actions/cheesesmithing/holy_buckler","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/off_hand","name":"Holy Buckler","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":87},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2160},"dropTable":null,"upgradeItemHrid":"/items/rainbow_buckler","inputItems":[{"itemHrid":"/items/holy_cheese","count":108}],"outputItems":[{"itemHrid":"/items/holy_buckler","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":153},"/actions/cheesesmithing/holy_bulwark":{"hrid":"/actions/cheesesmithing/holy_bulwark","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/two_hand","name":"Holy Bulwark","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":90},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":4320},"dropTable":null,"upgradeItemHrid":"/items/rainbow_bulwark","inputItems":[{"itemHrid":"/items/holy_cheese","count":216}],"outputItems":[{"itemHrid":"/items/holy_bulwark","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":156},"/actions/cheesesmithing/holy_cheese":{"hrid":"/actions/cheesesmithing/holy_cheese","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/material","name":"Holy Cheese","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":80},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":40},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/holy_milk","count":2}],"outputItems":[{"itemHrid":"/items/holy_cheese","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":131},"/actions/cheesesmithing/holy_chisel":{"hrid":"/actions/cheesesmithing/holy_chisel","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Holy Chisel","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2520},"dropTable":null,"upgradeItemHrid":"/items/rainbow_chisel","inputItems":[{"itemHrid":"/items/holy_cheese","count":126}],"outputItems":[{"itemHrid":"/items/holy_chisel","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":142},"/actions/cheesesmithing/holy_enhancer":{"hrid":"/actions/cheesesmithing/holy_enhancer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Holy Enhancer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2520},"dropTable":null,"upgradeItemHrid":"/items/rainbow_enhancer","inputItems":[{"itemHrid":"/items/holy_cheese","count":126}],"outputItems":[{"itemHrid":"/items/holy_enhancer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":146},"/actions/cheesesmithing/holy_gauntlets":{"hrid":"/actions/cheesesmithing/holy_gauntlets","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/hands","name":"Holy Gauntlets","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":81},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1440},"dropTable":null,"upgradeItemHrid":"/items/rainbow_gauntlets","inputItems":[{"itemHrid":"/items/holy_cheese","count":72}],"outputItems":[{"itemHrid":"/items/holy_gauntlets","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":134},"/actions/cheesesmithing/holy_hammer":{"hrid":"/actions/cheesesmithing/holy_hammer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Holy Hammer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2520},"dropTable":null,"upgradeItemHrid":"/items/rainbow_hammer","inputItems":[{"itemHrid":"/items/holy_cheese","count":126}],"outputItems":[{"itemHrid":"/items/holy_hammer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":141},"/actions/cheesesmithing/holy_hatchet":{"hrid":"/actions/cheesesmithing/holy_hatchet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Holy Hatchet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2520},"dropTable":null,"upgradeItemHrid":"/items/rainbow_hatchet","inputItems":[{"itemHrid":"/items/holy_cheese","count":126}],"outputItems":[{"itemHrid":"/items/holy_hatchet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":140},"/actions/cheesesmithing/holy_helmet":{"hrid":"/actions/cheesesmithing/holy_helmet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/head","name":"Holy Helmet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":86},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1800},"dropTable":null,"upgradeItemHrid":"/items/rainbow_helmet","inputItems":[{"itemHrid":"/items/holy_cheese","count":90}],"outputItems":[{"itemHrid":"/items/holy_helmet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":152},"/actions/cheesesmithing/holy_mace":{"hrid":"/actions/cheesesmithing/holy_mace","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Holy Mace","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":84},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":3240},"dropTable":null,"upgradeItemHrid":"/items/rainbow_mace","inputItems":[{"itemHrid":"/items/holy_cheese","count":162}],"outputItems":[{"itemHrid":"/items/holy_mace","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":137},"/actions/cheesesmithing/holy_needle":{"hrid":"/actions/cheesesmithing/holy_needle","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Holy Needle","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2520},"dropTable":null,"upgradeItemHrid":"/items/rainbow_needle","inputItems":[{"itemHrid":"/items/holy_cheese","count":126}],"outputItems":[{"itemHrid":"/items/holy_needle","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":143},"/actions/cheesesmithing/holy_plate_body":{"hrid":"/actions/cheesesmithing/holy_plate_body","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/body","name":"Holy Plate Body","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":89},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2880},"dropTable":null,"upgradeItemHrid":"/items/rainbow_plate_body","inputItems":[{"itemHrid":"/items/holy_cheese","count":144}],"outputItems":[{"itemHrid":"/items/holy_plate_body","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":155},"/actions/cheesesmithing/holy_plate_legs":{"hrid":"/actions/cheesesmithing/holy_plate_legs","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/legs","name":"Holy Plate Legs","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":88},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2520},"dropTable":null,"upgradeItemHrid":"/items/rainbow_plate_legs","inputItems":[{"itemHrid":"/items/holy_cheese","count":126}],"outputItems":[{"itemHrid":"/items/holy_plate_legs","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":154},"/actions/cheesesmithing/holy_pot":{"hrid":"/actions/cheesesmithing/holy_pot","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Holy Pot","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2520},"dropTable":null,"upgradeItemHrid":"/items/rainbow_pot","inputItems":[{"itemHrid":"/items/holy_cheese","count":126}],"outputItems":[{"itemHrid":"/items/holy_pot","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":145},"/actions/cheesesmithing/holy_shears":{"hrid":"/actions/cheesesmithing/holy_shears","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Holy Shears","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2520},"dropTable":null,"upgradeItemHrid":"/items/rainbow_shears","inputItems":[{"itemHrid":"/items/holy_cheese","count":126}],"outputItems":[{"itemHrid":"/items/holy_shears","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":139},"/actions/cheesesmithing/holy_spatula":{"hrid":"/actions/cheesesmithing/holy_spatula","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Holy Spatula","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2520},"dropTable":null,"upgradeItemHrid":"/items/rainbow_spatula","inputItems":[{"itemHrid":"/items/holy_cheese","count":126}],"outputItems":[{"itemHrid":"/items/holy_spatula","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":144},"/actions/cheesesmithing/holy_spear":{"hrid":"/actions/cheesesmithing/holy_spear","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Holy Spear","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":82},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":3240},"dropTable":null,"upgradeItemHrid":"/items/rainbow_spear","inputItems":[{"itemHrid":"/items/holy_cheese","count":162}],"outputItems":[{"itemHrid":"/items/holy_spear","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":135},"/actions/cheesesmithing/holy_sword":{"hrid":"/actions/cheesesmithing/holy_sword","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Holy Sword","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":83},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":3240},"dropTable":null,"upgradeItemHrid":"/items/rainbow_sword","inputItems":[{"itemHrid":"/items/holy_cheese","count":162}],"outputItems":[{"itemHrid":"/items/holy_sword","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":136},"/actions/cheesesmithing/magnetic_gloves":{"hrid":"/actions/cheesesmithing/magnetic_gloves","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/hands","name":"Magnetic Gloves","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":36000},"dropTable":null,"upgradeItemHrid":"/items/holy_gauntlets","inputItems":[{"itemHrid":"/items/magnet","count":15}],"outputItems":[{"itemHrid":"/items/magnetic_gloves","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":147},"/actions/cheesesmithing/panda_gloves":{"hrid":"/actions/cheesesmithing/panda_gloves","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/hands","name":"Panda Gloves","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":10000},"dropTable":null,"upgradeItemHrid":"/items/rainbow_gauntlets","inputItems":[{"itemHrid":"/items/panda_fluff","count":10}],"outputItems":[{"itemHrid":"/items/panda_gloves","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":123},"/actions/cheesesmithing/pincer_gloves":{"hrid":"/actions/cheesesmithing/pincer_gloves","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/hands","name":"Pincer Gloves","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1600},"dropTable":null,"upgradeItemHrid":"/items/azure_gauntlets","inputItems":[{"itemHrid":"/items/crab_pincer","count":2}],"outputItems":[{"itemHrid":"/items/pincer_gloves","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":58},"/actions/cheesesmithing/polar_bear_gloves":{"hrid":"/actions/cheesesmithing/polar_bear_gloves","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/feet","name":"Polar Bear Shoes","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":10000},"dropTable":null,"upgradeItemHrid":"/items/rainbow_boots","inputItems":[{"itemHrid":"/items/polar_bear_fluff","count":10}],"outputItems":[{"itemHrid":"/items/polar_bear_shoes","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":126},"/actions/cheesesmithing/rainbow_boots":{"hrid":"/actions/cheesesmithing/rainbow_boots","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/feet","name":"Rainbow Boots","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":70},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":936},"dropTable":null,"upgradeItemHrid":"/items/crimson_boots","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":52}],"outputItems":[{"itemHrid":"/items/rainbow_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":108},"/actions/cheesesmithing/rainbow_brush":{"hrid":"/actions/cheesesmithing/rainbow_brush","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Rainbow Brush","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1638},"dropTable":null,"upgradeItemHrid":"/items/crimson_brush","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":91}],"outputItems":[{"itemHrid":"/items/rainbow_brush","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":114},"/actions/cheesesmithing/rainbow_buckler":{"hrid":"/actions/cheesesmithing/rainbow_buckler","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/off_hand","name":"Rainbow Buckler","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":77},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1404},"dropTable":null,"upgradeItemHrid":"/items/crimson_buckler","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":78}],"outputItems":[{"itemHrid":"/items/rainbow_buckler","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":128},"/actions/cheesesmithing/rainbow_bulwark":{"hrid":"/actions/cheesesmithing/rainbow_bulwark","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/two_hand","name":"Rainbow Bulwark","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":80},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2808},"dropTable":null,"upgradeItemHrid":"/items/crimson_bulwark","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":156}],"outputItems":[{"itemHrid":"/items/rainbow_bulwark","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":133},"/actions/cheesesmithing/rainbow_cheese":{"hrid":"/actions/cheesesmithing/rainbow_cheese","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/material","name":"Rainbow Cheese","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":70},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":32},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/rainbow_milk","count":2}],"outputItems":[{"itemHrid":"/items/rainbow_cheese","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":107},"/actions/cheesesmithing/rainbow_chisel":{"hrid":"/actions/cheesesmithing/rainbow_chisel","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Rainbow Chisel","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1638},"dropTable":null,"upgradeItemHrid":"/items/crimson_chisel","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":91}],"outputItems":[{"itemHrid":"/items/rainbow_chisel","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":118},"/actions/cheesesmithing/rainbow_enhancer":{"hrid":"/actions/cheesesmithing/rainbow_enhancer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Rainbow Enhancer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1638},"dropTable":null,"upgradeItemHrid":"/items/crimson_enhancer","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":91}],"outputItems":[{"itemHrid":"/items/rainbow_enhancer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":122},"/actions/cheesesmithing/rainbow_gauntlets":{"hrid":"/actions/cheesesmithing/rainbow_gauntlets","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/hands","name":"Rainbow Gauntlets","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":71},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":936},"dropTable":null,"upgradeItemHrid":"/items/crimson_gauntlets","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":52}],"outputItems":[{"itemHrid":"/items/rainbow_gauntlets","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":110},"/actions/cheesesmithing/rainbow_hammer":{"hrid":"/actions/cheesesmithing/rainbow_hammer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Rainbow Hammer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1638},"dropTable":null,"upgradeItemHrid":"/items/crimson_hammer","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":91}],"outputItems":[{"itemHrid":"/items/rainbow_hammer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":117},"/actions/cheesesmithing/rainbow_hatchet":{"hrid":"/actions/cheesesmithing/rainbow_hatchet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Rainbow Hatchet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1638},"dropTable":null,"upgradeItemHrid":"/items/crimson_hatchet","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":91}],"outputItems":[{"itemHrid":"/items/rainbow_hatchet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":116},"/actions/cheesesmithing/rainbow_helmet":{"hrid":"/actions/cheesesmithing/rainbow_helmet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/head","name":"Rainbow Helmet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":76},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1170},"dropTable":null,"upgradeItemHrid":"/items/crimson_helmet","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":65}],"outputItems":[{"itemHrid":"/items/rainbow_helmet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":127},"/actions/cheesesmithing/rainbow_mace":{"hrid":"/actions/cheesesmithing/rainbow_mace","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Rainbow Mace","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":74},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2106},"dropTable":null,"upgradeItemHrid":"/items/crimson_mace","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":117}],"outputItems":[{"itemHrid":"/items/rainbow_mace","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":113},"/actions/cheesesmithing/rainbow_needle":{"hrid":"/actions/cheesesmithing/rainbow_needle","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Rainbow Needle","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1638},"dropTable":null,"upgradeItemHrid":"/items/crimson_needle","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":91}],"outputItems":[{"itemHrid":"/items/rainbow_needle","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":119},"/actions/cheesesmithing/rainbow_plate_body":{"hrid":"/actions/cheesesmithing/rainbow_plate_body","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/body","name":"Rainbow Plate Body","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":79},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1872},"dropTable":null,"upgradeItemHrid":"/items/crimson_plate_body","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":104}],"outputItems":[{"itemHrid":"/items/rainbow_plate_body","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":130},"/actions/cheesesmithing/rainbow_plate_legs":{"hrid":"/actions/cheesesmithing/rainbow_plate_legs","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/legs","name":"Rainbow Plate Legs","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":78},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1638},"dropTable":null,"upgradeItemHrid":"/items/crimson_plate_legs","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":91}],"outputItems":[{"itemHrid":"/items/rainbow_plate_legs","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":129},"/actions/cheesesmithing/rainbow_pot":{"hrid":"/actions/cheesesmithing/rainbow_pot","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Rainbow Pot","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1638},"dropTable":null,"upgradeItemHrid":"/items/crimson_pot","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":91}],"outputItems":[{"itemHrid":"/items/rainbow_pot","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":121},"/actions/cheesesmithing/rainbow_shears":{"hrid":"/actions/cheesesmithing/rainbow_shears","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Rainbow Shears","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1638},"dropTable":null,"upgradeItemHrid":"/items/crimson_shears","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":91}],"outputItems":[{"itemHrid":"/items/rainbow_shears","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":115},"/actions/cheesesmithing/rainbow_spatula":{"hrid":"/actions/cheesesmithing/rainbow_spatula","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Rainbow Spatula","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":75},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1638},"dropTable":null,"upgradeItemHrid":"/items/crimson_spatula","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":91}],"outputItems":[{"itemHrid":"/items/rainbow_spatula","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":120},"/actions/cheesesmithing/rainbow_spear":{"hrid":"/actions/cheesesmithing/rainbow_spear","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Rainbow Spear","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":72},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2106},"dropTable":null,"upgradeItemHrid":"/items/crimson_spear","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":117}],"outputItems":[{"itemHrid":"/items/rainbow_spear","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":111},"/actions/cheesesmithing/rainbow_sword":{"hrid":"/actions/cheesesmithing/rainbow_sword","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Rainbow Sword","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":73},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2106},"dropTable":null,"upgradeItemHrid":"/items/crimson_sword","inputItems":[{"itemHrid":"/items/rainbow_cheese","count":117}],"outputItems":[{"itemHrid":"/items/rainbow_sword","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":112},"/actions/cheesesmithing/snail_shell_helmet":{"hrid":"/actions/cheesesmithing/snail_shell_helmet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/head","name":"Snail Shell Helmet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":35},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":1600},"dropTable":null,"upgradeItemHrid":"/items/azure_helmet","inputItems":[{"itemHrid":"/items/snail_shell","count":2}],"outputItems":[{"itemHrid":"/items/snail_shell_helmet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":57},"/actions/cheesesmithing/snake_fang_dirk":{"hrid":"/actions/cheesesmithing/snake_fang_dirk","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/off_hand","name":"Snake Fang Dirk","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":20},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":600},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/verdant_cheese","count":30},{"itemHrid":"/items/snake_fang","count":10}],"outputItems":[{"itemHrid":"/items/snake_fang_dirk","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":36},"/actions/cheesesmithing/stalactite_spear":{"hrid":"/actions/cheesesmithing/stalactite_spear","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Stalactite Spear","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":48000},"dropTable":null,"upgradeItemHrid":"/items/holy_spear","inputItems":[{"itemHrid":"/items/stalactite_shard","count":20}],"outputItems":[{"itemHrid":"/items/stalactite_spear","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":148},"/actions/cheesesmithing/turtle_shell_body":{"hrid":"/actions/cheesesmithing/turtle_shell_body","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/body","name":"Turtle Shell Body","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":40},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":3000},"dropTable":null,"upgradeItemHrid":"/items/azure_plate_body","inputItems":[{"itemHrid":"/items/turtle_shell","count":3}],"outputItems":[{"itemHrid":"/items/turtle_shell_body","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":65},"/actions/cheesesmithing/turtle_shell_legs":{"hrid":"/actions/cheesesmithing/turtle_shell_legs","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/legs","name":"Turtle Shell Legs","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":40},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":2000},"dropTable":null,"upgradeItemHrid":"/items/azure_plate_legs","inputItems":[{"itemHrid":"/items/turtle_shell","count":2}],"outputItems":[{"itemHrid":"/items/turtle_shell_legs","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":64},"/actions/cheesesmithing/vampire_fang_dirk":{"hrid":"/actions/cheesesmithing/vampire_fang_dirk","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/off_hand","name":"Vampire Fang Dirk","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":48000},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/holy_cheese","count":400},{"itemHrid":"/items/vampire_fang","count":20}],"outputItems":[{"itemHrid":"/items/vampire_fang_dirk","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":150},"/actions/cheesesmithing/verdant_boots":{"hrid":"/actions/cheesesmithing/verdant_boots","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/feet","name":"Verdant Boots","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":15},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":48},"dropTable":null,"upgradeItemHrid":"/items/cheese_boots","inputItems":[{"itemHrid":"/items/verdant_cheese","count":12}],"outputItems":[{"itemHrid":"/items/verdant_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":22},"/actions/cheesesmithing/verdant_brush":{"hrid":"/actions/cheesesmithing/verdant_brush","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Verdant Brush","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":20},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":84},"dropTable":null,"upgradeItemHrid":"/items/cheese_brush","inputItems":[{"itemHrid":"/items/verdant_cheese","count":21}],"outputItems":[{"itemHrid":"/items/verdant_brush","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":27},"/actions/cheesesmithing/verdant_buckler":{"hrid":"/actions/cheesesmithing/verdant_buckler","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/off_hand","name":"Verdant Buckler","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":22},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":72},"dropTable":null,"upgradeItemHrid":"/items/cheese_buckler","inputItems":[{"itemHrid":"/items/verdant_cheese","count":18}],"outputItems":[{"itemHrid":"/items/verdant_buckler","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":38},"/actions/cheesesmithing/verdant_bulwark":{"hrid":"/actions/cheesesmithing/verdant_bulwark","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/two_hand","name":"Verdant Bulwark","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":25},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":144},"dropTable":null,"upgradeItemHrid":"/items/cheese_bulwark","inputItems":[{"itemHrid":"/items/verdant_cheese","count":36}],"outputItems":[{"itemHrid":"/items/verdant_bulwark","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":41},"/actions/cheesesmithing/verdant_cheese":{"hrid":"/actions/cheesesmithing/verdant_cheese","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/material","name":"Verdant Cheese","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":15},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":8},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/verdant_milk","count":2}],"outputItems":[{"itemHrid":"/items/verdant_cheese","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":21},"/actions/cheesesmithing/verdant_chisel":{"hrid":"/actions/cheesesmithing/verdant_chisel","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Verdant Chisel","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":20},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":84},"dropTable":null,"upgradeItemHrid":"/items/cheese_chisel","inputItems":[{"itemHrid":"/items/verdant_cheese","count":21}],"outputItems":[{"itemHrid":"/items/verdant_chisel","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":31},"/actions/cheesesmithing/verdant_enhancer":{"hrid":"/actions/cheesesmithing/verdant_enhancer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Verdant Enhancer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":20},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":84},"dropTable":null,"upgradeItemHrid":"/items/cheese_enhancer","inputItems":[{"itemHrid":"/items/verdant_cheese","count":21}],"outputItems":[{"itemHrid":"/items/verdant_enhancer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":35},"/actions/cheesesmithing/verdant_gauntlets":{"hrid":"/actions/cheesesmithing/verdant_gauntlets","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/hands","name":"Verdant Gauntlets","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":16},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":48},"dropTable":null,"upgradeItemHrid":"/items/cheese_gauntlets","inputItems":[{"itemHrid":"/items/verdant_cheese","count":12}],"outputItems":[{"itemHrid":"/items/verdant_gauntlets","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":23},"/actions/cheesesmithing/verdant_hammer":{"hrid":"/actions/cheesesmithing/verdant_hammer","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Verdant Hammer","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":20},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":84},"dropTable":null,"upgradeItemHrid":"/items/cheese_hammer","inputItems":[{"itemHrid":"/items/verdant_cheese","count":21}],"outputItems":[{"itemHrid":"/items/verdant_hammer","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":30},"/actions/cheesesmithing/verdant_hatchet":{"hrid":"/actions/cheesesmithing/verdant_hatchet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Verdant Hatchet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":20},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":84},"dropTable":null,"upgradeItemHrid":"/items/cheese_hatchet","inputItems":[{"itemHrid":"/items/verdant_cheese","count":21}],"outputItems":[{"itemHrid":"/items/verdant_hatchet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":29},"/actions/cheesesmithing/verdant_helmet":{"hrid":"/actions/cheesesmithing/verdant_helmet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/head","name":"Verdant Helmet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":21},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":60},"dropTable":null,"upgradeItemHrid":"/items/cheese_helmet","inputItems":[{"itemHrid":"/items/verdant_cheese","count":15}],"outputItems":[{"itemHrid":"/items/verdant_helmet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":37},"/actions/cheesesmithing/verdant_mace":{"hrid":"/actions/cheesesmithing/verdant_mace","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Verdant Mace","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":19},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":108},"dropTable":null,"upgradeItemHrid":"/items/cheese_mace","inputItems":[{"itemHrid":"/items/verdant_cheese","count":27}],"outputItems":[{"itemHrid":"/items/verdant_mace","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":26},"/actions/cheesesmithing/verdant_needle":{"hrid":"/actions/cheesesmithing/verdant_needle","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Verdant Needle","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":20},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":84},"dropTable":null,"upgradeItemHrid":"/items/cheese_needle","inputItems":[{"itemHrid":"/items/verdant_cheese","count":21}],"outputItems":[{"itemHrid":"/items/verdant_needle","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":32},"/actions/cheesesmithing/verdant_plate_body":{"hrid":"/actions/cheesesmithing/verdant_plate_body","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/body","name":"Verdant Plate Body","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":24},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":96},"dropTable":null,"upgradeItemHrid":"/items/cheese_plate_body","inputItems":[{"itemHrid":"/items/verdant_cheese","count":24}],"outputItems":[{"itemHrid":"/items/verdant_plate_body","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":40},"/actions/cheesesmithing/verdant_plate_legs":{"hrid":"/actions/cheesesmithing/verdant_plate_legs","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/legs","name":"Verdant Plate Legs","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":23},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":84},"dropTable":null,"upgradeItemHrid":"/items/cheese_plate_legs","inputItems":[{"itemHrid":"/items/verdant_cheese","count":21}],"outputItems":[{"itemHrid":"/items/verdant_plate_legs","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":39},"/actions/cheesesmithing/verdant_pot":{"hrid":"/actions/cheesesmithing/verdant_pot","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Verdant Pot","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":20},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":84},"dropTable":null,"upgradeItemHrid":"/items/cheese_pot","inputItems":[{"itemHrid":"/items/verdant_cheese","count":21}],"outputItems":[{"itemHrid":"/items/verdant_pot","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":34},"/actions/cheesesmithing/verdant_shears":{"hrid":"/actions/cheesesmithing/verdant_shears","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Verdant Shears","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":20},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":84},"dropTable":null,"upgradeItemHrid":"/items/cheese_shears","inputItems":[{"itemHrid":"/items/verdant_cheese","count":21}],"outputItems":[{"itemHrid":"/items/verdant_shears","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":28},"/actions/cheesesmithing/verdant_spatula":{"hrid":"/actions/cheesesmithing/verdant_spatula","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/tool","name":"Verdant Spatula","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":20},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":84},"dropTable":null,"upgradeItemHrid":"/items/cheese_spatula","inputItems":[{"itemHrid":"/items/verdant_cheese","count":21}],"outputItems":[{"itemHrid":"/items/verdant_spatula","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":33},"/actions/cheesesmithing/verdant_spear":{"hrid":"/actions/cheesesmithing/verdant_spear","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Verdant Spear","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":17},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":108},"dropTable":null,"upgradeItemHrid":"/items/cheese_spear","inputItems":[{"itemHrid":"/items/verdant_cheese","count":27}],"outputItems":[{"itemHrid":"/items/verdant_spear","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":24},"/actions/cheesesmithing/verdant_sword":{"hrid":"/actions/cheesesmithing/verdant_sword","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/main_hand","name":"Verdant Sword","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":18},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":108},"dropTable":null,"upgradeItemHrid":"/items/cheese_sword","inputItems":[{"itemHrid":"/items/verdant_cheese","count":27}],"outputItems":[{"itemHrid":"/items/verdant_sword","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":25},"/actions/cheesesmithing/vision_helmet":{"hrid":"/actions/cheesesmithing/vision_helmet","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/head","name":"Vision Helmet","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":68},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":6000},"dropTable":null,"upgradeItemHrid":"/items/crimson_helmet","inputItems":[{"itemHrid":"/items/goggles","count":1}],"outputItems":[{"itemHrid":"/items/vision_helmet","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":104},"/actions/cheesesmithing/vision_shield":{"hrid":"/actions/cheesesmithing/vision_shield","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/off_hand","name":"Vision Shield","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":68},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":7200},"dropTable":null,"upgradeItemHrid":"/items/crimson_buckler","inputItems":[{"itemHrid":"/items/magnifying_glass","count":1}],"outputItems":[{"itemHrid":"/items/vision_shield","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":105},"/actions/cheesesmithing/werewolf_slasher":{"hrid":"/actions/cheesesmithing/werewolf_slasher","function":"/action_functions/production","type":"/action_types/cheesesmithing","category":"/action_categories/cheesesmithing/two_hand","name":"Werewolf Slasher","levelRequirement":{"skillHrid":"/skills/cheesesmithing","level":85},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/cheesesmithing","value":48000},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/holy_cheese","count":600},{"itemHrid":"/items/werewolf_claw","count":20}],"outputItems":[{"itemHrid":"/items/werewolf_slasher","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":151},"/actions/combat/alligator":{"hrid":"/actions/combat/alligator","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/swamp_planet","name":"Sherlock","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/alligator","rate":1,"strength":1}]},"sortIndex":10},"/actions/combat/aqua_planet":{"hrid":"/actions/combat/aqua_planet","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/aqua_planet","name":"Aqua Planet","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":4,"maxTotalStrength":250,"spawns":[{"combatMonsterHrid":"/combat_monsters/sea_snail","rate":1,"strength":40},{"combatMonsterHrid":"/combat_monsters/crab","rate":1,"strength":60},{"combatMonsterHrid":"/combat_monsters/aquahorse","rate":1,"strength":70},{"combatMonsterHrid":"/combat_monsters/nom_nom","rate":1,"strength":70},{"combatMonsterHrid":"/combat_monsters/turtle","rate":1,"strength":100}]},"sortIndex":17},"/actions/combat/aquahorse":{"hrid":"/actions/combat/aquahorse","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/aqua_planet","name":"Aquahorse","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/aquahorse","rate":1,"strength":1}]},"sortIndex":14},"/actions/combat/bear_with_it":{"hrid":"/actions/combat/bear_with_it","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/bear_with_it","name":"Bear With It","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":3,"maxTotalStrength":250,"spawns":[{"combatMonsterHrid":"/combat_monsters/gummy_bear","rate":1,"strength":60},{"combatMonsterHrid":"/combat_monsters/panda","rate":1,"strength":90},{"combatMonsterHrid":"/combat_monsters/black_bear","rate":1,"strength":80},{"combatMonsterHrid":"/combat_monsters/grizzly_bear","rate":1,"strength":90},{"combatMonsterHrid":"/combat_monsters/polar_bear","rate":1,"strength":100}]},"sortIndex":43},"/actions/combat/black_bear":{"hrid":"/actions/combat/black_bear","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/bear_with_it","name":"Black Bear","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/black_bear","rate":1,"strength":1}]},"sortIndex":40},"/actions/combat/centaur_archer":{"hrid":"/actions/combat/centaur_archer","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/jungle_planet","name":"Centaur Archer","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/centaur_archer","rate":1,"strength":1}]},"sortIndex":21},"/actions/combat/crab":{"hrid":"/actions/combat/crab","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/aqua_planet","name":"I Pinch","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/crab","rate":1,"strength":1}]},"sortIndex":13},"/actions/combat/elementalist":{"hrid":"/actions/combat/elementalist","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/sorcerers_tower","name":"Elementalist","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/elementalist","rate":1,"strength":1}]},"sortIndex":36},"/actions/combat/eye":{"hrid":"/actions/combat/eye","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/planet_of_the_eyes","name":"Eye","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/eye","rate":1,"strength":1}]},"sortIndex":29},"/actions/combat/eyes":{"hrid":"/actions/combat/eyes","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/planet_of_the_eyes","name":"Eyes","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/eyes","rate":1,"strength":1}]},"sortIndex":30},"/actions/combat/flame_sorcerer":{"hrid":"/actions/combat/flame_sorcerer","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/sorcerers_tower","name":"Flame Sorcerer","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/flame_sorcerer","rate":1,"strength":1}]},"sortIndex":35},"/actions/combat/fly":{"hrid":"/actions/combat/fly","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/smelly_planet","name":"Fly","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/fly","rate":1,"strength":1}]},"sortIndex":1},"/actions/combat/frog":{"hrid":"/actions/combat/frog","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/swamp_planet","name":"Frogger","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/frog","rate":1,"strength":1}]},"sortIndex":7},"/actions/combat/gobo_boomy":{"hrid":"/actions/combat/gobo_boomy","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/gobo_planet","name":"Boomy","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/gobo_boomy","rate":1,"strength":1}]},"sortIndex":27},"/actions/combat/gobo_planet":{"hrid":"/actions/combat/gobo_planet","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/gobo_planet","name":"Gobo Planet","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":2,"maxTotalStrength":200,"spawns":[{"combatMonsterHrid":"/combat_monsters/gobo_stabby","rate":1,"strength":100},{"combatMonsterHrid":"/combat_monsters/gobo_slashy","rate":1,"strength":100},{"combatMonsterHrid":"/combat_monsters/gobo_smashy","rate":1,"strength":100},{"combatMonsterHrid":"/combat_monsters/gobo_shooty","rate":1,"strength":100},{"combatMonsterHrid":"/combat_monsters/gobo_boomy","rate":1,"strength":100}]},"sortIndex":28},"/actions/combat/gobo_shooty":{"hrid":"/actions/combat/gobo_shooty","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/gobo_planet","name":"Shooty","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/gobo_shooty","rate":1,"strength":1}]},"sortIndex":26},"/actions/combat/gobo_slashy":{"hrid":"/actions/combat/gobo_slashy","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/gobo_planet","name":"Slashy","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/gobo_slashy","rate":1,"strength":1}]},"sortIndex":24},"/actions/combat/gobo_smashy":{"hrid":"/actions/combat/gobo_smashy","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/gobo_planet","name":"Smashy","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/gobo_smashy","rate":1,"strength":1}]},"sortIndex":25},"/actions/combat/gobo_stabby":{"hrid":"/actions/combat/gobo_stabby","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/gobo_planet","name":"Stabby","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/gobo_stabby","rate":1,"strength":1}]},"sortIndex":23},"/actions/combat/golem_cave":{"hrid":"/actions/combat/golem_cave","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/golem_cave","name":"Golem Cave","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":3,"maxTotalStrength":250,"spawns":[{"combatMonsterHrid":"/combat_monsters/magnetic_golem","rate":1,"strength":70},{"combatMonsterHrid":"/combat_monsters/stalactite_golem","rate":1,"strength":85},{"combatMonsterHrid":"/combat_monsters/granite_golem","rate":1,"strength":100}]},"sortIndex":47},"/actions/combat/granite_golem":{"hrid":"/actions/combat/granite_golem","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/golem_cave","name":"Granite Golem","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/granite_golem","rate":1,"strength":1}]},"sortIndex":46},"/actions/combat/grizzly_bear":{"hrid":"/actions/combat/grizzly_bear","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/bear_with_it","name":"Grizzly Bear","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/grizzly_bear","rate":1,"strength":1}]},"sortIndex":41},"/actions/combat/gummy_bear":{"hrid":"/actions/combat/gummy_bear","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/bear_with_it","name":"Gummy Bear","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/gummy_bear","rate":1,"strength":1}]},"sortIndex":38},"/actions/combat/ice_sorcerer":{"hrid":"/actions/combat/ice_sorcerer","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/sorcerers_tower","name":"Ice Sorcerer","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/ice_sorcerer","rate":1,"strength":1}]},"sortIndex":34},"/actions/combat/jungle_planet":{"hrid":"/actions/combat/jungle_planet","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/jungle_planet","name":"Jungle Planet","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":4,"maxTotalStrength":250,"spawns":[{"combatMonsterHrid":"/combat_monsters/jungle_sprite","rate":1,"strength":50},{"combatMonsterHrid":"/combat_monsters/myconid","rate":1,"strength":65},{"combatMonsterHrid":"/combat_monsters/treant","rate":1,"strength":80},{"combatMonsterHrid":"/combat_monsters/centaur_archer","rate":1,"strength":100}]},"sortIndex":22},"/actions/combat/jungle_sprite":{"hrid":"/actions/combat/jungle_sprite","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/jungle_planet","name":"Jungle Sprite","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/jungle_sprite","rate":1,"strength":1}]},"sortIndex":18},"/actions/combat/magnetic_golem":{"hrid":"/actions/combat/magnetic_golem","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/golem_cave","name":"Magnetic Golem","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/magnetic_golem","rate":1,"strength":1}]},"sortIndex":44},"/actions/combat/myconid":{"hrid":"/actions/combat/myconid","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/jungle_planet","name":"Myconid","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/myconid","rate":1,"strength":1}]},"sortIndex":19},"/actions/combat/nom_nom":{"hrid":"/actions/combat/nom_nom","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/aqua_planet","name":"Nom Nom","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/nom_nom","rate":1,"strength":1}]},"sortIndex":15},"/actions/combat/novice_sorcerer":{"hrid":"/actions/combat/novice_sorcerer","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/sorcerers_tower","name":"Novice Sorcerer","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/novice_sorcerer","rate":1,"strength":1}]},"sortIndex":33},"/actions/combat/panda":{"hrid":"/actions/combat/panda","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/bear_with_it","name":"Panda","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/panda","rate":1,"strength":1}]},"sortIndex":39},"/actions/combat/planet_of_the_eyes":{"hrid":"/actions/combat/planet_of_the_eyes","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/planet_of_the_eyes","name":"Planet Of The Eyes","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":3,"maxTotalStrength":250,"spawns":[{"combatMonsterHrid":"/combat_monsters/eye","rate":1,"strength":70},{"combatMonsterHrid":"/combat_monsters/eyes","rate":1,"strength":85},{"combatMonsterHrid":"/combat_monsters/veyes","rate":1,"strength":100}]},"sortIndex":32},"/actions/combat/polar_bear":{"hrid":"/actions/combat/polar_bear","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/bear_with_it","name":"Polar Bear","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/polar_bear","rate":1,"strength":1}]},"sortIndex":42},"/actions/combat/porcupine":{"hrid":"/actions/combat/porcupine","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/smelly_planet","name":"Porcupine","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/porcupine","rate":1,"strength":1}]},"sortIndex":4},"/actions/combat/rat":{"hrid":"/actions/combat/rat","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/smelly_planet","name":"Jerry","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/rat","rate":1,"strength":1}]},"sortIndex":2},"/actions/combat/sea_snail":{"hrid":"/actions/combat/sea_snail","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/aqua_planet","name":"Gary","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/sea_snail","rate":1,"strength":1}]},"sortIndex":12},"/actions/combat/skunk":{"hrid":"/actions/combat/skunk","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/smelly_planet","name":"Skunk","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/skunk","rate":1,"strength":1}]},"sortIndex":3},"/actions/combat/slimy":{"hrid":"/actions/combat/slimy","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/smelly_planet","name":"Slimy","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/slimy","rate":1,"strength":1}]},"sortIndex":5},"/actions/combat/smelly_planet":{"hrid":"/actions/combat/smelly_planet","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/smelly_planet","name":"Smelly Planet","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":4,"maxTotalStrength":250,"spawns":[{"combatMonsterHrid":"/combat_monsters/fly","rate":1,"strength":30},{"combatMonsterHrid":"/combat_monsters/rat","rate":1,"strength":50},{"combatMonsterHrid":"/combat_monsters/skunk","rate":1,"strength":70},{"combatMonsterHrid":"/combat_monsters/porcupine","rate":1,"strength":80},{"combatMonsterHrid":"/combat_monsters/slimy","rate":1,"strength":100}]},"sortIndex":6},"/actions/combat/snake":{"hrid":"/actions/combat/snake","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/swamp_planet","name":"Thnake","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/snake","rate":1,"strength":1}]},"sortIndex":8},"/actions/combat/sorcerers_tower":{"hrid":"/actions/combat/sorcerers_tower","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/sorcerers_tower","name":"Sorcerer\'s Tower","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":4,"maxTotalStrength":250,"spawns":[{"combatMonsterHrid":"/combat_monsters/novice_sorcerer","rate":1,"strength":30},{"combatMonsterHrid":"/combat_monsters/ice_sorcerer","rate":1,"strength":55},{"combatMonsterHrid":"/combat_monsters/flame_sorcerer","rate":1,"strength":60},{"combatMonsterHrid":"/combat_monsters/elementalist","rate":1,"strength":100}]},"sortIndex":37},"/actions/combat/stalactite_golem":{"hrid":"/actions/combat/stalactite_golem","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/golem_cave","name":"Stalactite Golem","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/stalactite_golem","rate":1,"strength":1}]},"sortIndex":45},"/actions/combat/swamp_planet":{"hrid":"/actions/combat/swamp_planet","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/swamp_planet","name":"Swamp Planet","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":4,"maxTotalStrength":250,"spawns":[{"combatMonsterHrid":"/combat_monsters/frog","rate":1,"strength":40},{"combatMonsterHrid":"/combat_monsters/snake","rate":1,"strength":50},{"combatMonsterHrid":"/combat_monsters/swampy","rate":1,"strength":80},{"combatMonsterHrid":"/combat_monsters/alligator","rate":1,"strength":100}]},"sortIndex":11},"/actions/combat/swampy":{"hrid":"/actions/combat/swampy","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/swamp_planet","name":"Swampy","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/swampy","rate":1,"strength":1}]},"sortIndex":9},"/actions/combat/treant":{"hrid":"/actions/combat/treant","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/jungle_planet","name":"Treant","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/treant","rate":1,"strength":1}]},"sortIndex":20},"/actions/combat/turtle":{"hrid":"/actions/combat/turtle","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/aqua_planet","name":"Turuto","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/turtle","rate":1,"strength":1}]},"sortIndex":16},"/actions/combat/twilight_zone":{"hrid":"/actions/combat/twilight_zone","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/twilight_zone","name":"Twilight Zone","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":3,"maxTotalStrength":250,"spawns":[{"combatMonsterHrid":"/combat_monsters/zombie","rate":1,"strength":70},{"combatMonsterHrid":"/combat_monsters/vampire","rate":1,"strength":85},{"combatMonsterHrid":"/combat_monsters/werewolf","rate":1,"strength":100}]},"sortIndex":51},"/actions/combat/vampire":{"hrid":"/actions/combat/vampire","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/twilight_zone","name":"Vampire","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/vampire","rate":1,"strength":1}]},"sortIndex":49},"/actions/combat/veyes":{"hrid":"/actions/combat/veyes","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/planet_of_the_eyes","name":"Veyes","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/veyes","rate":1,"strength":1}]},"sortIndex":31},"/actions/combat/werewolf":{"hrid":"/actions/combat/werewolf","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/twilight_zone","name":"Werewolf","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/werewolf","rate":1,"strength":1}]},"sortIndex":50},"/actions/combat/zombie":{"hrid":"/actions/combat/zombie","function":"/action_functions/combat","type":"/action_types/combat","category":"/action_categories/combat/twilight_zone","name":"Zombie","levelRequirement":{"skillHrid":"","level":0},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":1,"maxTotalStrength":1,"spawns":[{"combatMonsterHrid":"/combat_monsters/zombie","rate":1,"strength":1}]},"sortIndex":48},"/actions/cooking/apple_gummy":{"hrid":"/actions/cooking/apple_gummy","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_mana","name":"Apple Gummy","levelRequirement":{"skillHrid":"/skills/cooking","level":15},"baseTimeCost":6750000000,"experienceGain":{"skillHrid":"/skills/cooking","value":6},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":6},{"itemHrid":"/items/apple","count":1}],"outputItems":[{"itemHrid":"/items/apple_gummy","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":7},"/actions/cooking/apple_yogurt":{"hrid":"/actions/cooking/apple_yogurt","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/mana_over_time","name":"Apple Yogurt","levelRequirement":{"skillHrid":"/skills/cooking","level":15},"baseTimeCost":9000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":10},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":3},{"itemHrid":"/items/verdant_milk","count":1},{"itemHrid":"/items/apple","count":1}],"outputItems":[{"itemHrid":"/items/apple_yogurt","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":8},"/actions/cooking/blackberry_cake":{"hrid":"/actions/cooking/blackberry_cake","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/heal_over_time","name":"Blackberry Cake","levelRequirement":{"skillHrid":"/skills/cooking","level":30},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":15},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":2},{"itemHrid":"/items/azure_milk","count":1},{"itemHrid":"/items/blackberry","count":2}],"outputItems":[{"itemHrid":"/items/blackberry_cake","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":10},"/actions/cooking/blackberry_donut":{"hrid":"/actions/cooking/blackberry_donut","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_heal","name":"Blackberry Donut","levelRequirement":{"skillHrid":"/skills/cooking","level":30},"baseTimeCost":7500000000,"experienceGain":{"skillHrid":"/skills/cooking","value":9},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":4},{"itemHrid":"/items/blackberry","count":2}],"outputItems":[{"itemHrid":"/items/blackberry_donut","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":9},"/actions/cooking/blueberry_cake":{"hrid":"/actions/cooking/blueberry_cake","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/heal_over_time","name":"Blueberry Cake","levelRequirement":{"skillHrid":"/skills/cooking","level":15},"baseTimeCost":9000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":10},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":2},{"itemHrid":"/items/verdant_milk","count":1},{"itemHrid":"/items/blueberry","count":2}],"outputItems":[{"itemHrid":"/items/blueberry_cake","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":6},"/actions/cooking/blueberry_donut":{"hrid":"/actions/cooking/blueberry_donut","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_heal","name":"Blueberry Donut","levelRequirement":{"skillHrid":"/skills/cooking","level":15},"baseTimeCost":6750000000,"experienceGain":{"skillHrid":"/skills/cooking","value":6},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":4},{"itemHrid":"/items/blueberry","count":2}],"outputItems":[{"itemHrid":"/items/blueberry_donut","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":5},"/actions/cooking/cupcake":{"hrid":"/actions/cooking/cupcake","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/heal_over_time","name":"Cupcake","levelRequirement":{"skillHrid":"/skills/cooking","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":5},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":2},{"itemHrid":"/items/milk","count":1}],"outputItems":[{"itemHrid":"/items/cupcake","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":2},"/actions/cooking/donut":{"hrid":"/actions/cooking/donut","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_heal","name":"Donut","levelRequirement":{"skillHrid":"/skills/cooking","level":1},"baseTimeCost":6000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":3},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":4}],"outputItems":[{"itemHrid":"/items/donut","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":1},"/actions/cooking/dragon_fruit_gummy":{"hrid":"/actions/cooking/dragon_fruit_gummy","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_mana","name":"Dragon Fruit Gummy","levelRequirement":{"skillHrid":"/skills/cooking","level":70},"baseTimeCost":10500000000,"experienceGain":{"skillHrid":"/skills/cooking","value":24},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":6},{"itemHrid":"/items/dragon_fruit","count":1}],"outputItems":[{"itemHrid":"/items/dragon_fruit_gummy","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":23},"/actions/cooking/dragon_fruit_yogurt":{"hrid":"/actions/cooking/dragon_fruit_yogurt","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/mana_over_time","name":"Dragon Fruit Yogurt","levelRequirement":{"skillHrid":"/skills/cooking","level":70},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":40},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":3},{"itemHrid":"/items/rainbow_milk","count":1},{"itemHrid":"/items/dragon_fruit","count":1}],"outputItems":[{"itemHrid":"/items/dragon_fruit_yogurt","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":24},"/actions/cooking/gummy":{"hrid":"/actions/cooking/gummy","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_mana","name":"Gummy","levelRequirement":{"skillHrid":"/skills/cooking","level":1},"baseTimeCost":6000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":3},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":6}],"outputItems":[{"itemHrid":"/items/gummy","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":3},"/actions/cooking/marsberry_cake":{"hrid":"/actions/cooking/marsberry_cake","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/heal_over_time","name":"Marsberry Cake","levelRequirement":{"skillHrid":"/skills/cooking","level":70},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":40},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":2},{"itemHrid":"/items/rainbow_milk","count":1},{"itemHrid":"/items/marsberry","count":2}],"outputItems":[{"itemHrid":"/items/marsberry_cake","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":22},"/actions/cooking/marsberry_donut":{"hrid":"/actions/cooking/marsberry_donut","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_heal","name":"Marsberry Donut","levelRequirement":{"skillHrid":"/skills/cooking","level":70},"baseTimeCost":10500000000,"experienceGain":{"skillHrid":"/skills/cooking","value":24},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":4},{"itemHrid":"/items/marsberry","count":2}],"outputItems":[{"itemHrid":"/items/marsberry_donut","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":21},"/actions/cooking/mooberry_cake":{"hrid":"/actions/cooking/mooberry_cake","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/heal_over_time","name":"Mooberry Cake","levelRequirement":{"skillHrid":"/skills/cooking","level":60},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":30},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":2},{"itemHrid":"/items/crimson_milk","count":1},{"itemHrid":"/items/mooberry","count":2}],"outputItems":[{"itemHrid":"/items/mooberry_cake","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":18},"/actions/cooking/mooberry_donut":{"hrid":"/actions/cooking/mooberry_donut","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_heal","name":"Mooberry Donut","levelRequirement":{"skillHrid":"/skills/cooking","level":60},"baseTimeCost":9000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":18},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":4},{"itemHrid":"/items/mooberry","count":2}],"outputItems":[{"itemHrid":"/items/mooberry_donut","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":17},"/actions/cooking/orange_gummy":{"hrid":"/actions/cooking/orange_gummy","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_mana","name":"Orange Gummy","levelRequirement":{"skillHrid":"/skills/cooking","level":30},"baseTimeCost":7500000000,"experienceGain":{"skillHrid":"/skills/cooking","value":9},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":6},{"itemHrid":"/items/orange","count":1}],"outputItems":[{"itemHrid":"/items/orange_gummy","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":11},"/actions/cooking/orange_yogurt":{"hrid":"/actions/cooking/orange_yogurt","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/mana_over_time","name":"Orange Yogurt","levelRequirement":{"skillHrid":"/skills/cooking","level":30},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":15},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":3},{"itemHrid":"/items/azure_milk","count":1},{"itemHrid":"/items/orange","count":1}],"outputItems":[{"itemHrid":"/items/orange_yogurt","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":12},"/actions/cooking/peach_gummy":{"hrid":"/actions/cooking/peach_gummy","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_mana","name":"Peach Gummy","levelRequirement":{"skillHrid":"/skills/cooking","level":60},"baseTimeCost":9000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":18},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":6},{"itemHrid":"/items/peach","count":1}],"outputItems":[{"itemHrid":"/items/peach_gummy","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":19},"/actions/cooking/peach_yogurt":{"hrid":"/actions/cooking/peach_yogurt","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/mana_over_time","name":"Peach Yogurt","levelRequirement":{"skillHrid":"/skills/cooking","level":60},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":30},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":3},{"itemHrid":"/items/crimson_milk","count":1},{"itemHrid":"/items/peach","count":1}],"outputItems":[{"itemHrid":"/items/peach_yogurt","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":20},"/actions/cooking/plum_gummy":{"hrid":"/actions/cooking/plum_gummy","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_mana","name":"Plum Gummy","levelRequirement":{"skillHrid":"/skills/cooking","level":45},"baseTimeCost":8250000000,"experienceGain":{"skillHrid":"/skills/cooking","value":13.5},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":6},{"itemHrid":"/items/plum","count":1}],"outputItems":[{"itemHrid":"/items/plum_gummy","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":15},"/actions/cooking/plum_yogurt":{"hrid":"/actions/cooking/plum_yogurt","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/mana_over_time","name":"Plum Yogurt","levelRequirement":{"skillHrid":"/skills/cooking","level":45},"baseTimeCost":11000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":22.5},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":3},{"itemHrid":"/items/burble_milk","count":1},{"itemHrid":"/items/plum","count":1}],"outputItems":[{"itemHrid":"/items/plum_yogurt","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":16},"/actions/cooking/spaceberry_cake":{"hrid":"/actions/cooking/spaceberry_cake","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/heal_over_time","name":"Spaceberry Cake","levelRequirement":{"skillHrid":"/skills/cooking","level":80},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":50},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":2},{"itemHrid":"/items/holy_milk","count":1},{"itemHrid":"/items/spaceberry","count":2}],"outputItems":[{"itemHrid":"/items/spaceberry_cake","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":26},"/actions/cooking/spaceberry_donut":{"hrid":"/actions/cooking/spaceberry_donut","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_heal","name":"Spaceberry Donut","levelRequirement":{"skillHrid":"/skills/cooking","level":80},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":30},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":4},{"itemHrid":"/items/spaceberry","count":2}],"outputItems":[{"itemHrid":"/items/spaceberry_donut","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":25},"/actions/cooking/star_fruit_gummy":{"hrid":"/actions/cooking/star_fruit_gummy","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_mana","name":"Star Fruit Gummy","levelRequirement":{"skillHrid":"/skills/cooking","level":80},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":30},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":6},{"itemHrid":"/items/star_fruit","count":1}],"outputItems":[{"itemHrid":"/items/star_fruit_gummy","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":27},"/actions/cooking/star_fruit_yogurt":{"hrid":"/actions/cooking/star_fruit_yogurt","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/mana_over_time","name":"Star Fruit Yogurt","levelRequirement":{"skillHrid":"/skills/cooking","level":80},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":50},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":3},{"itemHrid":"/items/holy_milk","count":1},{"itemHrid":"/items/star_fruit","count":1}],"outputItems":[{"itemHrid":"/items/star_fruit_yogurt","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":28},"/actions/cooking/strawberry_cake":{"hrid":"/actions/cooking/strawberry_cake","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/heal_over_time","name":"Strawberry Cake","levelRequirement":{"skillHrid":"/skills/cooking","level":45},"baseTimeCost":11000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":22.5},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":2},{"itemHrid":"/items/burble_milk","count":1},{"itemHrid":"/items/strawberry","count":2}],"outputItems":[{"itemHrid":"/items/strawberry_cake","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":14},"/actions/cooking/strawberry_donut":{"hrid":"/actions/cooking/strawberry_donut","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/instant_heal","name":"Strawberry Donut","levelRequirement":{"skillHrid":"/skills/cooking","level":45},"baseTimeCost":8250000000,"experienceGain":{"skillHrid":"/skills/cooking","value":13.5},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/egg","count":1},{"itemHrid":"/items/wheat","count":1},{"itemHrid":"/items/sugar","count":4},{"itemHrid":"/items/strawberry","count":2}],"outputItems":[{"itemHrid":"/items/strawberry_donut","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":13},"/actions/cooking/yogurt":{"hrid":"/actions/cooking/yogurt","function":"/action_functions/production","type":"/action_types/cooking","category":"/action_categories/cooking/mana_over_time","name":"Yogurt","levelRequirement":{"skillHrid":"/skills/cooking","level":1},"baseTimeCost":7000000000,"experienceGain":{"skillHrid":"/skills/cooking","value":5},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/sugar","count":3},{"itemHrid":"/items/milk","count":1}],"outputItems":[{"itemHrid":"/items/yogurt","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":4},"/actions/crafting/arcane_bow":{"hrid":"/actions/crafting/arcane_bow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/bow","name":"Arcane Bow","levelRequirement":{"skillHrid":"/skills/crafting","level":85},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":4320},"dropTable":null,"upgradeItemHrid":"/items/redwood_bow","inputItems":[{"itemHrid":"/items/arcane_lumber","count":216}],"outputItems":[{"itemHrid":"/items/arcane_bow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":41},"/actions/crafting/arcane_crossbow":{"hrid":"/actions/crafting/arcane_crossbow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/crossbow","name":"Arcane Crossbow","levelRequirement":{"skillHrid":"/skills/crafting","level":80},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":3240},"dropTable":null,"upgradeItemHrid":"/items/redwood_crossbow","inputItems":[{"itemHrid":"/items/arcane_lumber","count":162}],"outputItems":[{"itemHrid":"/items/arcane_crossbow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":38},"/actions/crafting/arcane_fire_staff":{"hrid":"/actions/crafting/arcane_fire_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Arcane Fire Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":86},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":3240},"dropTable":null,"upgradeItemHrid":"/items/redwood_fire_staff","inputItems":[{"itemHrid":"/items/arcane_lumber","count":162}],"outputItems":[{"itemHrid":"/items/arcane_fire_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":42},"/actions/crafting/arcane_lumber":{"hrid":"/actions/crafting/arcane_lumber","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/lumber","name":"Arcane Lumber","levelRequirement":{"skillHrid":"/skills/crafting","level":80},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":40},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/arcane_log","count":2}],"outputItems":[{"itemHrid":"/items/arcane_lumber","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":37},"/actions/crafting/arcane_nature_staff":{"hrid":"/actions/crafting/arcane_nature_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Arcane Nature Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":83},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":3240},"dropTable":null,"upgradeItemHrid":"/items/redwood_nature_staff","inputItems":[{"itemHrid":"/items/arcane_lumber","count":162}],"outputItems":[{"itemHrid":"/items/arcane_nature_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":40},"/actions/crafting/arcane_water_staff":{"hrid":"/actions/crafting/arcane_water_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Arcane Water Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":80},"baseTimeCost":270000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":3240},"dropTable":null,"upgradeItemHrid":"/items/redwood_water_staff","inputItems":[{"itemHrid":"/items/arcane_lumber","count":162}],"outputItems":[{"itemHrid":"/items/arcane_water_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":39},"/actions/crafting/birch_bow":{"hrid":"/actions/crafting/birch_bow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/bow","name":"Birch Bow","levelRequirement":{"skillHrid":"/skills/crafting","level":20},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":144},"dropTable":null,"upgradeItemHrid":"/items/wooden_bow","inputItems":[{"itemHrid":"/items/birch_lumber","count":36}],"outputItems":[{"itemHrid":"/items/birch_bow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":11},"/actions/crafting/birch_crossbow":{"hrid":"/actions/crafting/birch_crossbow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/crossbow","name":"Birch Crossbow","levelRequirement":{"skillHrid":"/skills/crafting","level":15},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":108},"dropTable":null,"upgradeItemHrid":"/items/wooden_crossbow","inputItems":[{"itemHrid":"/items/birch_lumber","count":27}],"outputItems":[{"itemHrid":"/items/birch_crossbow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":8},"/actions/crafting/birch_fire_staff":{"hrid":"/actions/crafting/birch_fire_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Birch Fire Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":21},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":108},"dropTable":null,"upgradeItemHrid":"/items/wooden_fire_staff","inputItems":[{"itemHrid":"/items/birch_lumber","count":27}],"outputItems":[{"itemHrid":"/items/birch_fire_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":12},"/actions/crafting/birch_lumber":{"hrid":"/actions/crafting/birch_lumber","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/lumber","name":"Birch Lumber","levelRequirement":{"skillHrid":"/skills/crafting","level":15},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":8},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/birch_log","count":2}],"outputItems":[{"itemHrid":"/items/birch_lumber","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":7},"/actions/crafting/birch_nature_staff":{"hrid":"/actions/crafting/birch_nature_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Birch Nature Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":18},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":108},"dropTable":null,"upgradeItemHrid":"/items/wooden_nature_staff","inputItems":[{"itemHrid":"/items/birch_lumber","count":27}],"outputItems":[{"itemHrid":"/items/birch_nature_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":10},"/actions/crafting/birch_water_staff":{"hrid":"/actions/crafting/birch_water_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Birch Water Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":15},"baseTimeCost":15000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":108},"dropTable":null,"upgradeItemHrid":"/items/wooden_water_staff","inputItems":[{"itemHrid":"/items/birch_lumber","count":27}],"outputItems":[{"itemHrid":"/items/birch_water_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":9},"/actions/crafting/cedar_bow":{"hrid":"/actions/crafting/cedar_bow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/bow","name":"Cedar Bow","levelRequirement":{"skillHrid":"/skills/crafting","level":35},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":288},"dropTable":null,"upgradeItemHrid":"/items/birch_bow","inputItems":[{"itemHrid":"/items/cedar_lumber","count":48}],"outputItems":[{"itemHrid":"/items/cedar_bow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":17},"/actions/crafting/cedar_crossbow":{"hrid":"/actions/crafting/cedar_crossbow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/crossbow","name":"Cedar Crossbow","levelRequirement":{"skillHrid":"/skills/crafting","level":30},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":216},"dropTable":null,"upgradeItemHrid":"/items/birch_crossbow","inputItems":[{"itemHrid":"/items/cedar_lumber","count":36}],"outputItems":[{"itemHrid":"/items/cedar_crossbow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":14},"/actions/crafting/cedar_fire_staff":{"hrid":"/actions/crafting/cedar_fire_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Cedar Fire Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":36},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":216},"dropTable":null,"upgradeItemHrid":"/items/birch_fire_staff","inputItems":[{"itemHrid":"/items/cedar_lumber","count":36}],"outputItems":[{"itemHrid":"/items/cedar_fire_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":18},"/actions/crafting/cedar_lumber":{"hrid":"/actions/crafting/cedar_lumber","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/lumber","name":"Cedar Lumber","levelRequirement":{"skillHrid":"/skills/crafting","level":30},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":12},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cedar_log","count":2}],"outputItems":[{"itemHrid":"/items/cedar_lumber","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":13},"/actions/crafting/cedar_nature_staff":{"hrid":"/actions/crafting/cedar_nature_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Cedar Nature Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":33},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":216},"dropTable":null,"upgradeItemHrid":"/items/birch_nature_staff","inputItems":[{"itemHrid":"/items/cedar_lumber","count":36}],"outputItems":[{"itemHrid":"/items/cedar_nature_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":16},"/actions/crafting/cedar_water_staff":{"hrid":"/actions/crafting/cedar_water_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Cedar Water Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":30},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":216},"dropTable":null,"upgradeItemHrid":"/items/birch_water_staff","inputItems":[{"itemHrid":"/items/cedar_lumber","count":36}],"outputItems":[{"itemHrid":"/items/cedar_water_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":15},"/actions/crafting/ginkgo_bow":{"hrid":"/actions/crafting/ginkgo_bow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/bow","name":"Ginkgo Bow","levelRequirement":{"skillHrid":"/skills/crafting","level":65},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":1296},"dropTable":null,"upgradeItemHrid":"/items/purpleheart_bow","inputItems":[{"itemHrid":"/items/ginkgo_lumber","count":108}],"outputItems":[{"itemHrid":"/items/ginkgo_bow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":29},"/actions/crafting/ginkgo_crossbow":{"hrid":"/actions/crafting/ginkgo_crossbow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/crossbow","name":"Ginkgo Crossbow","levelRequirement":{"skillHrid":"/skills/crafting","level":60},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":972},"dropTable":null,"upgradeItemHrid":"/items/purpleheart_crossbow","inputItems":[{"itemHrid":"/items/ginkgo_lumber","count":81}],"outputItems":[{"itemHrid":"/items/ginkgo_crossbow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":26},"/actions/crafting/ginkgo_fire_staff":{"hrid":"/actions/crafting/ginkgo_fire_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Ginkgo Fire Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":66},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":972},"dropTable":null,"upgradeItemHrid":"/items/purpleheart_fire_staff","inputItems":[{"itemHrid":"/items/ginkgo_lumber","count":81}],"outputItems":[{"itemHrid":"/items/ginkgo_fire_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":30},"/actions/crafting/ginkgo_lumber":{"hrid":"/actions/crafting/ginkgo_lumber","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/lumber","name":"Ginkgo Lumber","levelRequirement":{"skillHrid":"/skills/crafting","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":24},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/ginkgo_log","count":2}],"outputItems":[{"itemHrid":"/items/ginkgo_lumber","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":25},"/actions/crafting/ginkgo_nature_staff":{"hrid":"/actions/crafting/ginkgo_nature_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Ginkgo Nature Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":63},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":972},"dropTable":null,"upgradeItemHrid":"/items/purpleheart_nature_staff","inputItems":[{"itemHrid":"/items/ginkgo_lumber","count":81}],"outputItems":[{"itemHrid":"/items/ginkgo_nature_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":28},"/actions/crafting/ginkgo_water_staff":{"hrid":"/actions/crafting/ginkgo_water_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Ginkgo Water Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":60},"baseTimeCost":72000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":972},"dropTable":null,"upgradeItemHrid":"/items/purpleheart_water_staff","inputItems":[{"itemHrid":"/items/ginkgo_lumber","count":81}],"outputItems":[{"itemHrid":"/items/ginkgo_water_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":27},"/actions/crafting/lumber":{"hrid":"/actions/crafting/lumber","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/lumber","name":"Lumber","levelRequirement":{"skillHrid":"/skills/crafting","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":4},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/log","count":2}],"outputItems":[{"itemHrid":"/items/lumber","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":1},"/actions/crafting/purpleheart_bow":{"hrid":"/actions/crafting/purpleheart_bow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/bow","name":"Purpleheart Bow","levelRequirement":{"skillHrid":"/skills/crafting","level":50},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":648},"dropTable":null,"upgradeItemHrid":"/items/cedar_bow","inputItems":[{"itemHrid":"/items/purpleheart_lumber","count":72}],"outputItems":[{"itemHrid":"/items/purpleheart_bow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":23},"/actions/crafting/purpleheart_crossbow":{"hrid":"/actions/crafting/purpleheart_crossbow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/crossbow","name":"Purpleheart Crossbow","levelRequirement":{"skillHrid":"/skills/crafting","level":45},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":486},"dropTable":null,"upgradeItemHrid":"/items/cedar_crossbow","inputItems":[{"itemHrid":"/items/purpleheart_lumber","count":54}],"outputItems":[{"itemHrid":"/items/purpleheart_crossbow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":20},"/actions/crafting/purpleheart_fire_staff":{"hrid":"/actions/crafting/purpleheart_fire_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Purpleheart Fire Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":51},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":486},"dropTable":null,"upgradeItemHrid":"/items/cedar_fire_staff","inputItems":[{"itemHrid":"/items/purpleheart_lumber","count":54}],"outputItems":[{"itemHrid":"/items/purpleheart_fire_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":24},"/actions/crafting/purpleheart_lumber":{"hrid":"/actions/crafting/purpleheart_lumber","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/lumber","name":"Purpleheart Lumber","levelRequirement":{"skillHrid":"/skills/crafting","level":45},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":18},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/purpleheart_log","count":2}],"outputItems":[{"itemHrid":"/items/purpleheart_lumber","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":19},"/actions/crafting/purpleheart_nature_staff":{"hrid":"/actions/crafting/purpleheart_nature_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Purpleheart Nature Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":48},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":486},"dropTable":null,"upgradeItemHrid":"/items/cedar_nature_staff","inputItems":[{"itemHrid":"/items/purpleheart_lumber","count":54}],"outputItems":[{"itemHrid":"/items/purpleheart_nature_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":22},"/actions/crafting/purpleheart_water_staff":{"hrid":"/actions/crafting/purpleheart_water_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Purpleheart Water Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":45},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":486},"dropTable":null,"upgradeItemHrid":"/items/cedar_water_staff","inputItems":[{"itemHrid":"/items/purpleheart_lumber","count":54}],"outputItems":[{"itemHrid":"/items/purpleheart_water_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":21},"/actions/crafting/redwood_bow":{"hrid":"/actions/crafting/redwood_bow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/bow","name":"Redwood Bow","levelRequirement":{"skillHrid":"/skills/crafting","level":75},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":2808},"dropTable":null,"upgradeItemHrid":"/items/ginkgo_bow","inputItems":[{"itemHrid":"/items/redwood_lumber","count":156}],"outputItems":[{"itemHrid":"/items/redwood_bow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":35},"/actions/crafting/redwood_crossbow":{"hrid":"/actions/crafting/redwood_crossbow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/crossbow","name":"Redwood Crossbow","levelRequirement":{"skillHrid":"/skills/crafting","level":70},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":2106},"dropTable":null,"upgradeItemHrid":"/items/ginkgo_crossbow","inputItems":[{"itemHrid":"/items/redwood_lumber","count":117}],"outputItems":[{"itemHrid":"/items/redwood_crossbow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":32},"/actions/crafting/redwood_fire_staff":{"hrid":"/actions/crafting/redwood_fire_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Redwood Fire Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":76},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":2106},"dropTable":null,"upgradeItemHrid":"/items/ginkgo_fire_staff","inputItems":[{"itemHrid":"/items/redwood_lumber","count":117}],"outputItems":[{"itemHrid":"/items/redwood_fire_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":36},"/actions/crafting/redwood_lumber":{"hrid":"/actions/crafting/redwood_lumber","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/lumber","name":"Redwood Lumber","levelRequirement":{"skillHrid":"/skills/crafting","level":70},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":32},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/redwood_log","count":2}],"outputItems":[{"itemHrid":"/items/redwood_lumber","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":31},"/actions/crafting/redwood_nature_staff":{"hrid":"/actions/crafting/redwood_nature_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Redwood Nature Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":73},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":2106},"dropTable":null,"upgradeItemHrid":"/items/ginkgo_nature_staff","inputItems":[{"itemHrid":"/items/redwood_lumber","count":117}],"outputItems":[{"itemHrid":"/items/redwood_nature_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":34},"/actions/crafting/redwood_water_staff":{"hrid":"/actions/crafting/redwood_water_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Redwood Water Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":70},"baseTimeCost":130000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":2106},"dropTable":null,"upgradeItemHrid":"/items/ginkgo_water_staff","inputItems":[{"itemHrid":"/items/redwood_lumber","count":117}],"outputItems":[{"itemHrid":"/items/redwood_water_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":33},"/actions/crafting/wooden_bow":{"hrid":"/actions/crafting/wooden_bow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/bow","name":"Wooden Bow","levelRequirement":{"skillHrid":"/skills/crafting","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":48},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/lumber","count":24}],"outputItems":[{"itemHrid":"/items/wooden_bow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":5},"/actions/crafting/wooden_crossbow":{"hrid":"/actions/crafting/wooden_crossbow","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/crossbow","name":"Wooden Crossbow","levelRequirement":{"skillHrid":"/skills/crafting","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":36},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/lumber","count":18}],"outputItems":[{"itemHrid":"/items/wooden_crossbow","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":2},"/actions/crafting/wooden_fire_staff":{"hrid":"/actions/crafting/wooden_fire_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Wooden Fire Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":6},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":36},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/lumber","count":18}],"outputItems":[{"itemHrid":"/items/wooden_fire_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":6},"/actions/crafting/wooden_nature_staff":{"hrid":"/actions/crafting/wooden_nature_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Wooden Nature Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":3},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":36},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/lumber","count":18}],"outputItems":[{"itemHrid":"/items/wooden_nature_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":4},"/actions/crafting/wooden_water_staff":{"hrid":"/actions/crafting/wooden_water_staff","function":"/action_functions/production","type":"/action_types/crafting","category":"/action_categories/crafting/staff","name":"Wooden Water Staff","levelRequirement":{"skillHrid":"/skills/crafting","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/crafting","value":36},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/lumber","count":18}],"outputItems":[{"itemHrid":"/items/wooden_water_staff","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":3},"/actions/enhancing/enhance":{"hrid":"/actions/enhancing/enhance","function":"/action_functions/enhancing","type":"/action_types/enhancing","category":"","name":"Enhance","levelRequirement":{"skillHrid":"/skills/enhancing","level":1},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"","value":0},"dropTable":null,"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":0},"/actions/foraging/apple":{"hrid":"/actions/foraging/apple","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/shimmering_lake","name":"Apple","levelRequirement":{"skillHrid":"/skills/foraging","level":15},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":10},"dropTable":[{"itemHrid":"/items/apple","dropRate":1,"minCount":1,"maxCount":4}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":7},"/actions/foraging/arabica_coffee_bean":{"hrid":"/actions/foraging/arabica_coffee_bean","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/shimmering_lake","name":"Arabica Coffee Bean","levelRequirement":{"skillHrid":"/skills/foraging","level":15},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":10},"dropTable":[{"itemHrid":"/items/arabica_coffee_bean","dropRate":1,"minCount":1,"maxCount":1}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":8},"/actions/foraging/asteroid_belt":{"hrid":"/actions/foraging/asteroid_belt","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/asteroid_belt","name":"Asteroid Belt","levelRequirement":{"skillHrid":"/skills/foraging","level":80},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":50},"dropTable":[{"itemHrid":"/items/spaceberry","dropRate":0.3,"minCount":1,"maxCount":8},{"itemHrid":"/items/star_fruit","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/spacia_coffee_bean","dropRate":0.3,"minCount":1,"maxCount":1},{"itemHrid":"/items/radiant_fiber","dropRate":0.3,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":33},"/actions/foraging/bamboo_branch":{"hrid":"/actions/foraging/bamboo_branch","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/burble_beach","name":"Bamboo Branch","levelRequirement":{"skillHrid":"/skills/foraging","level":45},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":22.5},"dropTable":[{"itemHrid":"/items/bamboo_branch","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":18},"/actions/foraging/blackberry":{"hrid":"/actions/foraging/blackberry","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/misty_forest","name":"Blackberry","levelRequirement":{"skillHrid":"/skills/foraging","level":30},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":15},"dropTable":[{"itemHrid":"/items/blackberry","dropRate":1,"minCount":1,"maxCount":8}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":11},"/actions/foraging/blueberry":{"hrid":"/actions/foraging/blueberry","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/shimmering_lake","name":"Blueberry","levelRequirement":{"skillHrid":"/skills/foraging","level":15},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":10},"dropTable":[{"itemHrid":"/items/blueberry","dropRate":1,"minCount":1,"maxCount":8}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":6},"/actions/foraging/burble_beach":{"hrid":"/actions/foraging/burble_beach","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/burble_beach","name":"Burble Beach","levelRequirement":{"skillHrid":"/skills/foraging","level":45},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":22.5},"dropTable":[{"itemHrid":"/items/strawberry","dropRate":0.3,"minCount":1,"maxCount":8},{"itemHrid":"/items/plum","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/liberica_coffee_bean","dropRate":0.3,"minCount":1,"maxCount":1},{"itemHrid":"/items/bamboo_branch","dropRate":0.3,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":19},"/actions/foraging/cocoon":{"hrid":"/actions/foraging/cocoon","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/silly_cow_valley","name":"Cocoon","levelRequirement":{"skillHrid":"/skills/foraging","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":30},"dropTable":[{"itemHrid":"/items/cocoon","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":23},"/actions/foraging/cotton":{"hrid":"/actions/foraging/cotton","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/farmland","name":"Cotton","levelRequirement":{"skillHrid":"/skills/foraging","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":5},"dropTable":[{"itemHrid":"/items/cotton","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":4},"/actions/foraging/dragon_fruit":{"hrid":"/actions/foraging/dragon_fruit","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/olympus_mons","name":"Dragon Fruit","levelRequirement":{"skillHrid":"/skills/foraging","level":70},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":40},"dropTable":[{"itemHrid":"/items/dragon_fruit","dropRate":1,"minCount":1,"maxCount":4}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":26},"/actions/foraging/egg":{"hrid":"/actions/foraging/egg","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/farmland","name":"Egg","levelRequirement":{"skillHrid":"/skills/foraging","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":5},"dropTable":[{"itemHrid":"/items/egg","dropRate":1,"minCount":1,"maxCount":6}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":1},"/actions/foraging/excelsa_coffee_bean":{"hrid":"/actions/foraging/excelsa_coffee_bean","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/silly_cow_valley","name":"Excelsa Coffee Bean","levelRequirement":{"skillHrid":"/skills/foraging","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":30},"dropTable":[{"itemHrid":"/items/excelsa_coffee_bean","dropRate":1,"minCount":1,"maxCount":1}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":22},"/actions/foraging/farmland":{"hrid":"/actions/foraging/farmland","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/farmland","name":"Farmland","levelRequirement":{"skillHrid":"/skills/foraging","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":5},"dropTable":[{"itemHrid":"/items/egg","dropRate":0.3,"minCount":1,"maxCount":6},{"itemHrid":"/items/wheat","dropRate":0.3,"minCount":1,"maxCount":6},{"itemHrid":"/items/sugar","dropRate":0.3,"minCount":1,"maxCount":14},{"itemHrid":"/items/cotton","dropRate":0.3,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":5},"/actions/foraging/fieriosa_coffee_bean":{"hrid":"/actions/foraging/fieriosa_coffee_bean","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/olympus_mons","name":"Fieriosa Coffee Bean","levelRequirement":{"skillHrid":"/skills/foraging","level":70},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":40},"dropTable":[{"itemHrid":"/items/fieriosa_coffee_bean","dropRate":1,"minCount":1,"maxCount":1}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":27},"/actions/foraging/flax":{"hrid":"/actions/foraging/flax","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/shimmering_lake","name":"Flax","levelRequirement":{"skillHrid":"/skills/foraging","level":15},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":10},"dropTable":[{"itemHrid":"/items/flax","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":9},"/actions/foraging/liberica_coffee_bean":{"hrid":"/actions/foraging/liberica_coffee_bean","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/burble_beach","name":"Liberica Coffee Bean","levelRequirement":{"skillHrid":"/skills/foraging","level":45},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":22.5},"dropTable":[{"itemHrid":"/items/liberica_coffee_bean","dropRate":1,"minCount":1,"maxCount":1}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":17},"/actions/foraging/marsberry":{"hrid":"/actions/foraging/marsberry","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/olympus_mons","name":"Marsberry","levelRequirement":{"skillHrid":"/skills/foraging","level":70},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":40},"dropTable":[{"itemHrid":"/items/marsberry","dropRate":1,"minCount":1,"maxCount":8}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":25},"/actions/foraging/misty_forest":{"hrid":"/actions/foraging/misty_forest","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/misty_forest","name":"Misty Forest","levelRequirement":{"skillHrid":"/skills/foraging","level":30},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":15},"dropTable":[{"itemHrid":"/items/blackberry","dropRate":0.4,"minCount":1,"maxCount":8},{"itemHrid":"/items/orange","dropRate":0.4,"minCount":1,"maxCount":4},{"itemHrid":"/items/robusta_coffee_bean","dropRate":0.4,"minCount":1,"maxCount":1}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":14},"/actions/foraging/mooberry":{"hrid":"/actions/foraging/mooberry","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/silly_cow_valley","name":"Mooberry","levelRequirement":{"skillHrid":"/skills/foraging","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":30},"dropTable":[{"itemHrid":"/items/mooberry","dropRate":1,"minCount":1,"maxCount":8}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":20},"/actions/foraging/olympus_mons":{"hrid":"/actions/foraging/olympus_mons","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/olympus_mons","name":"Olympus Mons","levelRequirement":{"skillHrid":"/skills/foraging","level":70},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":40},"dropTable":[{"itemHrid":"/items/marsberry","dropRate":0.4,"minCount":1,"maxCount":8},{"itemHrid":"/items/dragon_fruit","dropRate":0.4,"minCount":1,"maxCount":4},{"itemHrid":"/items/fieriosa_coffee_bean","dropRate":0.4,"minCount":1,"maxCount":1}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":28},"/actions/foraging/orange":{"hrid":"/actions/foraging/orange","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/misty_forest","name":"Orange","levelRequirement":{"skillHrid":"/skills/foraging","level":30},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":15},"dropTable":[{"itemHrid":"/items/orange","dropRate":1,"minCount":1,"maxCount":4}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":12},"/actions/foraging/peach":{"hrid":"/actions/foraging/peach","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/silly_cow_valley","name":"Peach","levelRequirement":{"skillHrid":"/skills/foraging","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":30},"dropTable":[{"itemHrid":"/items/peach","dropRate":1,"minCount":1,"maxCount":4}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":21},"/actions/foraging/plum":{"hrid":"/actions/foraging/plum","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/burble_beach","name":"Plum","levelRequirement":{"skillHrid":"/skills/foraging","level":45},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":22.5},"dropTable":[{"itemHrid":"/items/plum","dropRate":1,"minCount":1,"maxCount":4}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":16},"/actions/foraging/radiant_fiber":{"hrid":"/actions/foraging/radiant_fiber","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/asteroid_belt","name":"Radiant Fiber","levelRequirement":{"skillHrid":"/skills/foraging","level":80},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":50},"dropTable":[{"itemHrid":"/items/radiant_fiber","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":32},"/actions/foraging/robusta_coffee_bean":{"hrid":"/actions/foraging/robusta_coffee_bean","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/misty_forest","name":"Robusta Coffee Bean","levelRequirement":{"skillHrid":"/skills/foraging","level":30},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":15},"dropTable":[{"itemHrid":"/items/robusta_coffee_bean","dropRate":1,"minCount":1,"maxCount":1}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":13},"/actions/foraging/shimmering_lake":{"hrid":"/actions/foraging/shimmering_lake","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/shimmering_lake","name":"Shimmering Lake","levelRequirement":{"skillHrid":"/skills/foraging","level":15},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":10},"dropTable":[{"itemHrid":"/items/blueberry","dropRate":0.3,"minCount":1,"maxCount":8},{"itemHrid":"/items/apple","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/arabica_coffee_bean","dropRate":0.3,"minCount":1,"maxCount":1},{"itemHrid":"/items/flax","dropRate":0.3,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":10},"/actions/foraging/silly_cow_valley":{"hrid":"/actions/foraging/silly_cow_valley","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/silly_cow_valley","name":"Silly Cow Valley","levelRequirement":{"skillHrid":"/skills/foraging","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":30},"dropTable":[{"itemHrid":"/items/mooberry","dropRate":0.3,"minCount":1,"maxCount":8},{"itemHrid":"/items/peach","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/excelsa_coffee_bean","dropRate":0.3,"minCount":1,"maxCount":1},{"itemHrid":"/items/cocoon","dropRate":0.3,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":24},"/actions/foraging/spaceberry":{"hrid":"/actions/foraging/spaceberry","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/asteroid_belt","name":"Spaceberry","levelRequirement":{"skillHrid":"/skills/foraging","level":80},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":50},"dropTable":[{"itemHrid":"/items/spaceberry","dropRate":1,"minCount":1,"maxCount":8}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":29},"/actions/foraging/spacia_coffee_bean":{"hrid":"/actions/foraging/spacia_coffee_bean","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/asteroid_belt","name":"Spacia Coffee Bean","levelRequirement":{"skillHrid":"/skills/foraging","level":80},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":50},"dropTable":[{"itemHrid":"/items/spacia_coffee_bean","dropRate":1,"minCount":1,"maxCount":1}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":31},"/actions/foraging/star_fruit":{"hrid":"/actions/foraging/star_fruit","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/asteroid_belt","name":"Star Fruit","levelRequirement":{"skillHrid":"/skills/foraging","level":80},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":50},"dropTable":[{"itemHrid":"/items/star_fruit","dropRate":1,"minCount":1,"maxCount":4}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":30},"/actions/foraging/strawberry":{"hrid":"/actions/foraging/strawberry","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/burble_beach","name":"Strawberry","levelRequirement":{"skillHrid":"/skills/foraging","level":45},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":22.5},"dropTable":[{"itemHrid":"/items/strawberry","dropRate":1,"minCount":1,"maxCount":8}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":15},"/actions/foraging/sugar":{"hrid":"/actions/foraging/sugar","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/farmland","name":"Sugar","levelRequirement":{"skillHrid":"/skills/foraging","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":5},"dropTable":[{"itemHrid":"/items/sugar","dropRate":1,"minCount":1,"maxCount":14}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":3},"/actions/foraging/wheat":{"hrid":"/actions/foraging/wheat","function":"/action_functions/gathering","type":"/action_types/foraging","category":"/action_categories/foraging/farmland","name":"Wheat","levelRequirement":{"skillHrid":"/skills/foraging","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/foraging","value":5},"dropTable":[{"itemHrid":"/items/wheat","dropRate":1,"minCount":1,"maxCount":6}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":2},"/actions/milking/azure_cow":{"hrid":"/actions/milking/azure_cow","function":"/action_functions/gathering","type":"/action_types/milking","category":"","name":"Azure Cow","levelRequirement":{"skillHrid":"/skills/milking","level":30},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/milking","value":15},"dropTable":[{"itemHrid":"/items/azure_milk","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":3},"/actions/milking/burble_cow":{"hrid":"/actions/milking/burble_cow","function":"/action_functions/gathering","type":"/action_types/milking","category":"","name":"Burble Cow","levelRequirement":{"skillHrid":"/skills/milking","level":45},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/milking","value":22.5},"dropTable":[{"itemHrid":"/items/burble_milk","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":4},"/actions/milking/cow":{"hrid":"/actions/milking/cow","function":"/action_functions/gathering","type":"/action_types/milking","category":"","name":"Cow","levelRequirement":{"skillHrid":"/skills/milking","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/milking","value":5},"dropTable":[{"itemHrid":"/items/milk","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":1},"/actions/milking/crimson_cow":{"hrid":"/actions/milking/crimson_cow","function":"/action_functions/gathering","type":"/action_types/milking","category":"","name":"Crimson Cow","levelRequirement":{"skillHrid":"/skills/milking","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/milking","value":30},"dropTable":[{"itemHrid":"/items/crimson_milk","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":5},"/actions/milking/holy_cow":{"hrid":"/actions/milking/holy_cow","function":"/action_functions/gathering","type":"/action_types/milking","category":"","name":"Holy Cow","levelRequirement":{"skillHrid":"/skills/milking","level":80},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"/skills/milking","value":50},"dropTable":[{"itemHrid":"/items/holy_milk","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":7},"/actions/milking/unicow":{"hrid":"/actions/milking/unicow","function":"/action_functions/gathering","type":"/action_types/milking","category":"","name":"Unicow","levelRequirement":{"skillHrid":"/skills/milking","level":70},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/milking","value":40},"dropTable":[{"itemHrid":"/items/rainbow_milk","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":6},"/actions/milking/verdant_cow":{"hrid":"/actions/milking/verdant_cow","function":"/action_functions/gathering","type":"/action_types/milking","category":"","name":"Verdant Cow","levelRequirement":{"skillHrid":"/skills/milking","level":15},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/milking","value":10},"dropTable":[{"itemHrid":"/items/verdant_milk","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":2},"/actions/tailoring/bamboo_boots":{"hrid":"/actions/tailoring/bamboo_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Bamboo Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":40},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":224},"dropTable":null,"upgradeItemHrid":"/items/linen_boots","inputItems":[{"itemHrid":"/items/bamboo_fabric","count":28}],"outputItems":[{"itemHrid":"/items/bamboo_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":30},"/actions/tailoring/bamboo_fabric":{"hrid":"/actions/tailoring/bamboo_fabric","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/material","name":"Bamboo Fabric","levelRequirement":{"skillHrid":"/skills/tailoring","level":40},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":16},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/bamboo_branch","count":2}],"outputItems":[{"itemHrid":"/items/bamboo_fabric","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":28},"/actions/tailoring/bamboo_gloves":{"hrid":"/actions/tailoring/bamboo_gloves","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/hands","name":"Bamboo Gloves","levelRequirement":{"skillHrid":"/skills/tailoring","level":43},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":224},"dropTable":null,"upgradeItemHrid":"/items/linen_gloves","inputItems":[{"itemHrid":"/items/bamboo_fabric","count":28}],"outputItems":[{"itemHrid":"/items/bamboo_gloves","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":32},"/actions/tailoring/bamboo_hat":{"hrid":"/actions/tailoring/bamboo_hat","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/head","name":"Bamboo Hat","levelRequirement":{"skillHrid":"/skills/tailoring","level":46},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":280},"dropTable":null,"upgradeItemHrid":"/items/linen_hat","inputItems":[{"itemHrid":"/items/bamboo_fabric","count":35}],"outputItems":[{"itemHrid":"/items/bamboo_hat","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":35},"/actions/tailoring/bamboo_robe_bottoms":{"hrid":"/actions/tailoring/bamboo_robe_bottoms","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Bamboo Robe Bottoms","levelRequirement":{"skillHrid":"/skills/tailoring","level":49},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":392},"dropTable":null,"upgradeItemHrid":"/items/linen_robe_bottoms","inputItems":[{"itemHrid":"/items/bamboo_fabric","count":49}],"outputItems":[{"itemHrid":"/items/bamboo_robe_bottoms","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":37},"/actions/tailoring/bamboo_robe_top":{"hrid":"/actions/tailoring/bamboo_robe_top","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Bamboo Robe Top","levelRequirement":{"skillHrid":"/skills/tailoring","level":52},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":448},"dropTable":null,"upgradeItemHrid":"/items/linen_robe_top","inputItems":[{"itemHrid":"/items/bamboo_fabric","count":56}],"outputItems":[{"itemHrid":"/items/bamboo_robe_top","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":39},"/actions/tailoring/beast_boots":{"hrid":"/actions/tailoring/beast_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Beast Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":60},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":576},"dropTable":null,"upgradeItemHrid":"/items/gobo_boots","inputItems":[{"itemHrid":"/items/beast_leather","count":48}],"outputItems":[{"itemHrid":"/items/beast_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":46},"/actions/tailoring/beast_bracers":{"hrid":"/actions/tailoring/beast_bracers","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/hands","name":"Beast Bracers","levelRequirement":{"skillHrid":"/skills/tailoring","level":63},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":576},"dropTable":null,"upgradeItemHrid":"/items/gobo_bracers","inputItems":[{"itemHrid":"/items/beast_leather","count":48}],"outputItems":[{"itemHrid":"/items/beast_bracers","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":48},"/actions/tailoring/beast_chaps":{"hrid":"/actions/tailoring/beast_chaps","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Beast Chaps","levelRequirement":{"skillHrid":"/skills/tailoring","level":69},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1008},"dropTable":null,"upgradeItemHrid":"/items/gobo_chaps","inputItems":[{"itemHrid":"/items/beast_leather","count":84}],"outputItems":[{"itemHrid":"/items/beast_chaps","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":55},"/actions/tailoring/beast_hood":{"hrid":"/actions/tailoring/beast_hood","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/head","name":"Beast Hood","levelRequirement":{"skillHrid":"/skills/tailoring","level":66},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":720},"dropTable":null,"upgradeItemHrid":"/items/gobo_hood","inputItems":[{"itemHrid":"/items/beast_leather","count":60}],"outputItems":[{"itemHrid":"/items/beast_hood","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":53},"/actions/tailoring/beast_leather":{"hrid":"/actions/tailoring/beast_leather","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/material","name":"Beast Leather","levelRequirement":{"skillHrid":"/skills/tailoring","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":24},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/beast_hide","count":2}],"outputItems":[{"itemHrid":"/items/beast_leather","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":44},"/actions/tailoring/beast_tunic":{"hrid":"/actions/tailoring/beast_tunic","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Beast Tunic","levelRequirement":{"skillHrid":"/skills/tailoring","level":72},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1152},"dropTable":null,"upgradeItemHrid":"/items/gobo_tunic","inputItems":[{"itemHrid":"/items/beast_leather","count":96}],"outputItems":[{"itemHrid":"/items/beast_tunic","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":57},"/actions/tailoring/centaur_boots":{"hrid":"/actions/tailoring/centaur_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Centaur Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":65},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":8000},"dropTable":null,"upgradeItemHrid":"/items/beast_boots","inputItems":[{"itemHrid":"/items/centaur_hoof","count":10}],"outputItems":[{"itemHrid":"/items/centaur_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":50},"/actions/tailoring/cotton_boots":{"hrid":"/actions/tailoring/cotton_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Cotton Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":16},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cotton_fabric","count":8}],"outputItems":[{"itemHrid":"/items/cotton_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":4},"/actions/tailoring/cotton_fabric":{"hrid":"/actions/tailoring/cotton_fabric","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/material","name":"Cotton Fabric","levelRequirement":{"skillHrid":"/skills/tailoring","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":4},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cotton","count":2}],"outputItems":[{"itemHrid":"/items/cotton_fabric","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":2},"/actions/tailoring/cotton_gloves":{"hrid":"/actions/tailoring/cotton_gloves","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/hands","name":"Cotton Gloves","levelRequirement":{"skillHrid":"/skills/tailoring","level":3},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":16},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cotton_fabric","count":8}],"outputItems":[{"itemHrid":"/items/cotton_gloves","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":6},"/actions/tailoring/cotton_hat":{"hrid":"/actions/tailoring/cotton_hat","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/head","name":"Cotton Hat","levelRequirement":{"skillHrid":"/skills/tailoring","level":6},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":20},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cotton_fabric","count":10}],"outputItems":[{"itemHrid":"/items/cotton_hat","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":9},"/actions/tailoring/cotton_robe_bottoms":{"hrid":"/actions/tailoring/cotton_robe_bottoms","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Cotton Robe Bottoms","levelRequirement":{"skillHrid":"/skills/tailoring","level":9},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cotton_fabric","count":14}],"outputItems":[{"itemHrid":"/items/cotton_robe_bottoms","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":11},"/actions/tailoring/cotton_robe_top":{"hrid":"/actions/tailoring/cotton_robe_top","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Cotton Robe Top","levelRequirement":{"skillHrid":"/skills/tailoring","level":12},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":32},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cotton_fabric","count":16}],"outputItems":[{"itemHrid":"/items/cotton_robe_top","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":13},"/actions/tailoring/flaming_robe_bottoms":{"hrid":"/actions/tailoring/flaming_robe_bottoms","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Flaming Robe Bottoms","levelRequirement":{"skillHrid":"/skills/tailoring","level":55},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":4000},"dropTable":null,"upgradeItemHrid":"/items/bamboo_robe_bottoms","inputItems":[{"itemHrid":"/items/flaming_cloth","count":4}],"outputItems":[{"itemHrid":"/items/flaming_robe_bottoms","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":43},"/actions/tailoring/flaming_robe_top":{"hrid":"/actions/tailoring/flaming_robe_top","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Flaming Robe Top","levelRequirement":{"skillHrid":"/skills/tailoring","level":55},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":6000},"dropTable":null,"upgradeItemHrid":"/items/bamboo_robe_top","inputItems":[{"itemHrid":"/items/flaming_cloth","count":6}],"outputItems":[{"itemHrid":"/items/flaming_robe_top","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":42},"/actions/tailoring/giant_pouch":{"hrid":"/actions/tailoring/giant_pouch","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/pouch","name":"Giant Pouch","levelRequirement":{"skillHrid":"/skills/tailoring","level":65},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":24000},"dropTable":null,"upgradeItemHrid":"/items/large_pouch","inputItems":[{"itemHrid":"/items/beast_leather","count":1000},{"itemHrid":"/items/silk_fabric","count":1000},{"itemHrid":"/items/coin","count":5000000}],"outputItems":[{"itemHrid":"/items/giant_pouch","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":52},"/actions/tailoring/gobo_boots":{"hrid":"/actions/tailoring/gobo_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Gobo Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":40},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":224},"dropTable":null,"upgradeItemHrid":"/items/reptile_boots","inputItems":[{"itemHrid":"/items/gobo_leather","count":28}],"outputItems":[{"itemHrid":"/items/gobo_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":29},"/actions/tailoring/gobo_bracers":{"hrid":"/actions/tailoring/gobo_bracers","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/hands","name":"Gobo Bracers","levelRequirement":{"skillHrid":"/skills/tailoring","level":43},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":224},"dropTable":null,"upgradeItemHrid":"/items/reptile_bracers","inputItems":[{"itemHrid":"/items/gobo_leather","count":28}],"outputItems":[{"itemHrid":"/items/gobo_bracers","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":31},"/actions/tailoring/gobo_chaps":{"hrid":"/actions/tailoring/gobo_chaps","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Gobo Chaps","levelRequirement":{"skillHrid":"/skills/tailoring","level":49},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":392},"dropTable":null,"upgradeItemHrid":"/items/reptile_chaps","inputItems":[{"itemHrid":"/items/gobo_leather","count":49}],"outputItems":[{"itemHrid":"/items/gobo_chaps","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":36},"/actions/tailoring/gobo_hood":{"hrid":"/actions/tailoring/gobo_hood","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/head","name":"Gobo Hood","levelRequirement":{"skillHrid":"/skills/tailoring","level":46},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":280},"dropTable":null,"upgradeItemHrid":"/items/reptile_hood","inputItems":[{"itemHrid":"/items/gobo_leather","count":35}],"outputItems":[{"itemHrid":"/items/gobo_hood","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":34},"/actions/tailoring/gobo_leather":{"hrid":"/actions/tailoring/gobo_leather","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/material","name":"Gobo Leather","levelRequirement":{"skillHrid":"/skills/tailoring","level":40},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":16},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/gobo_hide","count":2}],"outputItems":[{"itemHrid":"/items/gobo_leather","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":27},"/actions/tailoring/gobo_tunic":{"hrid":"/actions/tailoring/gobo_tunic","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Gobo Tunic","levelRequirement":{"skillHrid":"/skills/tailoring","level":52},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":448},"dropTable":null,"upgradeItemHrid":"/items/reptile_tunic","inputItems":[{"itemHrid":"/items/gobo_leather","count":56}],"outputItems":[{"itemHrid":"/items/gobo_tunic","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":38},"/actions/tailoring/icy_robe_bottoms":{"hrid":"/actions/tailoring/icy_robe_bottoms","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Icy Robe Bottoms","levelRequirement":{"skillHrid":"/skills/tailoring","level":55},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":4000},"dropTable":null,"upgradeItemHrid":"/items/bamboo_robe_bottoms","inputItems":[{"itemHrid":"/items/icy_cloth","count":4}],"outputItems":[{"itemHrid":"/items/icy_robe_bottoms","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":41},"/actions/tailoring/icy_robe_top":{"hrid":"/actions/tailoring/icy_robe_top","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Icy Robe Top","levelRequirement":{"skillHrid":"/skills/tailoring","level":55},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":6000},"dropTable":null,"upgradeItemHrid":"/items/bamboo_robe_top","inputItems":[{"itemHrid":"/items/icy_cloth","count":6}],"outputItems":[{"itemHrid":"/items/icy_robe_top","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":40},"/actions/tailoring/large_pouch":{"hrid":"/actions/tailoring/large_pouch","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/pouch","name":"Large Pouch","levelRequirement":{"skillHrid":"/skills/tailoring","level":45},"baseTimeCost":42000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":4800},"dropTable":null,"upgradeItemHrid":"/items/medium_pouch","inputItems":[{"itemHrid":"/items/gobo_leather","count":300},{"itemHrid":"/items/bamboo_fabric","count":300},{"itemHrid":"/items/coin","count":500000}],"outputItems":[{"itemHrid":"/items/large_pouch","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":33},"/actions/tailoring/linen_boots":{"hrid":"/actions/tailoring/linen_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Linen Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":20},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":80},"dropTable":null,"upgradeItemHrid":"/items/cotton_boots","inputItems":[{"itemHrid":"/items/linen_fabric","count":16}],"outputItems":[{"itemHrid":"/items/linen_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":17},"/actions/tailoring/linen_fabric":{"hrid":"/actions/tailoring/linen_fabric","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/material","name":"Linen Fabric","levelRequirement":{"skillHrid":"/skills/tailoring","level":20},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":10},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/flax","count":2}],"outputItems":[{"itemHrid":"/items/linen_fabric","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":15},"/actions/tailoring/linen_gloves":{"hrid":"/actions/tailoring/linen_gloves","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/hands","name":"Linen Gloves","levelRequirement":{"skillHrid":"/skills/tailoring","level":23},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":80},"dropTable":null,"upgradeItemHrid":"/items/cotton_gloves","inputItems":[{"itemHrid":"/items/linen_fabric","count":16}],"outputItems":[{"itemHrid":"/items/linen_gloves","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":19},"/actions/tailoring/linen_hat":{"hrid":"/actions/tailoring/linen_hat","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/head","name":"Linen Hat","levelRequirement":{"skillHrid":"/skills/tailoring","level":26},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":100},"dropTable":null,"upgradeItemHrid":"/items/cotton_hat","inputItems":[{"itemHrid":"/items/linen_fabric","count":20}],"outputItems":[{"itemHrid":"/items/linen_hat","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":22},"/actions/tailoring/linen_robe_bottoms":{"hrid":"/actions/tailoring/linen_robe_bottoms","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Linen Robe Bottoms","levelRequirement":{"skillHrid":"/skills/tailoring","level":29},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":140},"dropTable":null,"upgradeItemHrid":"/items/cotton_robe_bottoms","inputItems":[{"itemHrid":"/items/linen_fabric","count":28}],"outputItems":[{"itemHrid":"/items/linen_robe_bottoms","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":24},"/actions/tailoring/linen_robe_top":{"hrid":"/actions/tailoring/linen_robe_top","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Linen Robe Top","levelRequirement":{"skillHrid":"/skills/tailoring","level":32},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":160},"dropTable":null,"upgradeItemHrid":"/items/cotton_robe_top","inputItems":[{"itemHrid":"/items/linen_fabric","count":32}],"outputItems":[{"itemHrid":"/items/linen_robe_top","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":26},"/actions/tailoring/medium_pouch":{"hrid":"/actions/tailoring/medium_pouch","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/pouch","name":"Medium Pouch","levelRequirement":{"skillHrid":"/skills/tailoring","level":25},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1000},"dropTable":null,"upgradeItemHrid":"/items/small_pouch","inputItems":[{"itemHrid":"/items/reptile_leather","count":100},{"itemHrid":"/items/linen_fabric","count":100},{"itemHrid":"/items/coin","count":50000}],"outputItems":[{"itemHrid":"/items/medium_pouch","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":20},"/actions/tailoring/radiant_boots":{"hrid":"/actions/tailoring/radiant_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Radiant Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":75},"baseTimeCost":216000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1296},"dropTable":null,"upgradeItemHrid":"/items/silk_boots","inputItems":[{"itemHrid":"/items/radiant_fabric","count":72}],"outputItems":[{"itemHrid":"/items/radiant_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":62},"/actions/tailoring/radiant_fabric":{"hrid":"/actions/tailoring/radiant_fabric","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/material","name":"Radiant Fabric","levelRequirement":{"skillHrid":"/skills/tailoring","level":75},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":36},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/radiant_fiber","count":2}],"outputItems":[{"itemHrid":"/items/radiant_fabric","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":60},"/actions/tailoring/radiant_gloves":{"hrid":"/actions/tailoring/radiant_gloves","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/hands","name":"Radiant Gloves","levelRequirement":{"skillHrid":"/skills/tailoring","level":78},"baseTimeCost":216000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1296},"dropTable":null,"upgradeItemHrid":"/items/silk_gloves","inputItems":[{"itemHrid":"/items/radiant_fabric","count":72}],"outputItems":[{"itemHrid":"/items/radiant_gloves","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":64},"/actions/tailoring/radiant_hat":{"hrid":"/actions/tailoring/radiant_hat","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/head","name":"Radiant Hat","levelRequirement":{"skillHrid":"/skills/tailoring","level":81},"baseTimeCost":216000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1620},"dropTable":null,"upgradeItemHrid":"/items/silk_hat","inputItems":[{"itemHrid":"/items/radiant_fabric","count":90}],"outputItems":[{"itemHrid":"/items/radiant_hat","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":66},"/actions/tailoring/radiant_robe_bottoms":{"hrid":"/actions/tailoring/radiant_robe_bottoms","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Radiant Robe Bottoms","levelRequirement":{"skillHrid":"/skills/tailoring","level":84},"baseTimeCost":216000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":2268},"dropTable":null,"upgradeItemHrid":"/items/silk_robe_bottoms","inputItems":[{"itemHrid":"/items/radiant_fabric","count":126}],"outputItems":[{"itemHrid":"/items/radiant_robe_bottoms","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":68},"/actions/tailoring/radiant_robe_top":{"hrid":"/actions/tailoring/radiant_robe_top","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Radiant Robe Top","levelRequirement":{"skillHrid":"/skills/tailoring","level":87},"baseTimeCost":216000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":2592},"dropTable":null,"upgradeItemHrid":"/items/silk_robe_top","inputItems":[{"itemHrid":"/items/radiant_fabric","count":144}],"outputItems":[{"itemHrid":"/items/radiant_robe_top","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":70},"/actions/tailoring/reptile_boots":{"hrid":"/actions/tailoring/reptile_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Reptile Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":20},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":80},"dropTable":null,"upgradeItemHrid":"/items/rough_boots","inputItems":[{"itemHrid":"/items/reptile_leather","count":16}],"outputItems":[{"itemHrid":"/items/reptile_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":16},"/actions/tailoring/reptile_bracers":{"hrid":"/actions/tailoring/reptile_bracers","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/hands","name":"Reptile Bracers","levelRequirement":{"skillHrid":"/skills/tailoring","level":23},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":80},"dropTable":null,"upgradeItemHrid":"/items/rough_bracers","inputItems":[{"itemHrid":"/items/reptile_leather","count":16}],"outputItems":[{"itemHrid":"/items/reptile_bracers","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":18},"/actions/tailoring/reptile_chaps":{"hrid":"/actions/tailoring/reptile_chaps","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Reptile Chaps","levelRequirement":{"skillHrid":"/skills/tailoring","level":29},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":140},"dropTable":null,"upgradeItemHrid":"/items/rough_chaps","inputItems":[{"itemHrid":"/items/reptile_leather","count":28}],"outputItems":[{"itemHrid":"/items/reptile_chaps","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":23},"/actions/tailoring/reptile_hood":{"hrid":"/actions/tailoring/reptile_hood","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/head","name":"Reptile Hood","levelRequirement":{"skillHrid":"/skills/tailoring","level":26},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":100},"dropTable":null,"upgradeItemHrid":"/items/rough_hood","inputItems":[{"itemHrid":"/items/reptile_leather","count":20}],"outputItems":[{"itemHrid":"/items/reptile_hood","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":21},"/actions/tailoring/reptile_leather":{"hrid":"/actions/tailoring/reptile_leather","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/material","name":"Reptile Leather","levelRequirement":{"skillHrid":"/skills/tailoring","level":20},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":10},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/reptile_hide","count":2}],"outputItems":[{"itemHrid":"/items/reptile_leather","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":14},"/actions/tailoring/reptile_tunic":{"hrid":"/actions/tailoring/reptile_tunic","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Reptile Tunic","levelRequirement":{"skillHrid":"/skills/tailoring","level":32},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":160},"dropTable":null,"upgradeItemHrid":"/items/rough_tunic","inputItems":[{"itemHrid":"/items/reptile_leather","count":32}],"outputItems":[{"itemHrid":"/items/reptile_tunic","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":25},"/actions/tailoring/rough_boots":{"hrid":"/actions/tailoring/rough_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Rough Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":16},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/rough_leather","count":8}],"outputItems":[{"itemHrid":"/items/rough_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":3},"/actions/tailoring/rough_bracers":{"hrid":"/actions/tailoring/rough_bracers","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/hands","name":"Rough Bracers","levelRequirement":{"skillHrid":"/skills/tailoring","level":3},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":16},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/rough_leather","count":8}],"outputItems":[{"itemHrid":"/items/rough_bracers","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":5},"/actions/tailoring/rough_chaps":{"hrid":"/actions/tailoring/rough_chaps","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Rough Chaps","levelRequirement":{"skillHrid":"/skills/tailoring","level":9},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":28},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/rough_leather","count":14}],"outputItems":[{"itemHrid":"/items/rough_chaps","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":10},"/actions/tailoring/rough_hood":{"hrid":"/actions/tailoring/rough_hood","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/head","name":"Rough Hood","levelRequirement":{"skillHrid":"/skills/tailoring","level":6},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":20},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/rough_leather","count":10}],"outputItems":[{"itemHrid":"/items/rough_hood","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":8},"/actions/tailoring/rough_leather":{"hrid":"/actions/tailoring/rough_leather","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/material","name":"Rough Leather","levelRequirement":{"skillHrid":"/skills/tailoring","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":4},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/rough_hide","count":2}],"outputItems":[{"itemHrid":"/items/rough_leather","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":1},"/actions/tailoring/rough_tunic":{"hrid":"/actions/tailoring/rough_tunic","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Rough Tunic","levelRequirement":{"skillHrid":"/skills/tailoring","level":12},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":32},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/rough_leather","count":16}],"outputItems":[{"itemHrid":"/items/rough_tunic","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":12},"/actions/tailoring/silk_boots":{"hrid":"/actions/tailoring/silk_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Silk Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":60},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":576},"dropTable":null,"upgradeItemHrid":"/items/bamboo_boots","inputItems":[{"itemHrid":"/items/silk_fabric","count":48}],"outputItems":[{"itemHrid":"/items/silk_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":47},"/actions/tailoring/silk_fabric":{"hrid":"/actions/tailoring/silk_fabric","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/material","name":"Silk Fabric","levelRequirement":{"skillHrid":"/skills/tailoring","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":24},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/cocoon","count":2}],"outputItems":[{"itemHrid":"/items/silk_fabric","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":45},"/actions/tailoring/silk_gloves":{"hrid":"/actions/tailoring/silk_gloves","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/hands","name":"Silk Gloves","levelRequirement":{"skillHrid":"/skills/tailoring","level":63},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":576},"dropTable":null,"upgradeItemHrid":"/items/bamboo_gloves","inputItems":[{"itemHrid":"/items/silk_fabric","count":48}],"outputItems":[{"itemHrid":"/items/silk_gloves","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":49},"/actions/tailoring/silk_hat":{"hrid":"/actions/tailoring/silk_hat","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/head","name":"Silk Hat","levelRequirement":{"skillHrid":"/skills/tailoring","level":66},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":720},"dropTable":null,"upgradeItemHrid":"/items/bamboo_hat","inputItems":[{"itemHrid":"/items/silk_fabric","count":60}],"outputItems":[{"itemHrid":"/items/silk_hat","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":54},"/actions/tailoring/silk_robe_bottoms":{"hrid":"/actions/tailoring/silk_robe_bottoms","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Silk Robe Bottoms","levelRequirement":{"skillHrid":"/skills/tailoring","level":69},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1008},"dropTable":null,"upgradeItemHrid":"/items/bamboo_robe_bottoms","inputItems":[{"itemHrid":"/items/silk_fabric","count":84}],"outputItems":[{"itemHrid":"/items/silk_robe_bottoms","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":56},"/actions/tailoring/silk_robe_top":{"hrid":"/actions/tailoring/silk_robe_top","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Silk Robe Top","levelRequirement":{"skillHrid":"/skills/tailoring","level":72},"baseTimeCost":96000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1152},"dropTable":null,"upgradeItemHrid":"/items/bamboo_robe_top","inputItems":[{"itemHrid":"/items/silk_fabric","count":96}],"outputItems":[{"itemHrid":"/items/silk_robe_top","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":58},"/actions/tailoring/small_pouch":{"hrid":"/actions/tailoring/small_pouch","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/pouch","name":"Small Pouch","levelRequirement":{"skillHrid":"/skills/tailoring","level":5},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":120},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/rough_leather","count":30},{"itemHrid":"/items/cotton_fabric","count":30},{"itemHrid":"/items/coin","count":5000}],"outputItems":[{"itemHrid":"/items/small_pouch","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":7},"/actions/tailoring/sorcerer_boots":{"hrid":"/actions/tailoring/sorcerer_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Sorcerer Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":65},"baseTimeCost":60000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":8000},"dropTable":null,"upgradeItemHrid":"/items/silk_boots","inputItems":[{"itemHrid":"/items/sorcerers_sole","count":10}],"outputItems":[{"itemHrid":"/items/sorcerer_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":51},"/actions/tailoring/umbral_boots":{"hrid":"/actions/tailoring/umbral_boots","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/feet","name":"Umbral Boots","levelRequirement":{"skillHrid":"/skills/tailoring","level":75},"baseTimeCost":216000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1296},"dropTable":null,"upgradeItemHrid":"/items/beast_boots","inputItems":[{"itemHrid":"/items/umbral_leather","count":72}],"outputItems":[{"itemHrid":"/items/umbral_boots","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":61},"/actions/tailoring/umbral_bracers":{"hrid":"/actions/tailoring/umbral_bracers","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/hands","name":"Umbral Bracers","levelRequirement":{"skillHrid":"/skills/tailoring","level":78},"baseTimeCost":216000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1296},"dropTable":null,"upgradeItemHrid":"/items/beast_bracers","inputItems":[{"itemHrid":"/items/umbral_leather","count":72}],"outputItems":[{"itemHrid":"/items/umbral_bracers","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":63},"/actions/tailoring/umbral_chaps":{"hrid":"/actions/tailoring/umbral_chaps","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/legs","name":"Umbral Chaps","levelRequirement":{"skillHrid":"/skills/tailoring","level":84},"baseTimeCost":216000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":2268},"dropTable":null,"upgradeItemHrid":"/items/beast_chaps","inputItems":[{"itemHrid":"/items/umbral_leather","count":126}],"outputItems":[{"itemHrid":"/items/umbral_chaps","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":67},"/actions/tailoring/umbral_hood":{"hrid":"/actions/tailoring/umbral_hood","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/head","name":"Umbral Hood","levelRequirement":{"skillHrid":"/skills/tailoring","level":81},"baseTimeCost":216000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":1620},"dropTable":null,"upgradeItemHrid":"/items/beast_hood","inputItems":[{"itemHrid":"/items/umbral_leather","count":90}],"outputItems":[{"itemHrid":"/items/umbral_hood","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":65},"/actions/tailoring/umbral_leather":{"hrid":"/actions/tailoring/umbral_leather","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/material","name":"Umbral Leather","levelRequirement":{"skillHrid":"/skills/tailoring","level":75},"baseTimeCost":24000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":36},"dropTable":null,"upgradeItemHrid":"","inputItems":[{"itemHrid":"/items/umbral_hide","count":2}],"outputItems":[{"itemHrid":"/items/umbral_leather","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":59},"/actions/tailoring/umbral_tunic":{"hrid":"/actions/tailoring/umbral_tunic","function":"/action_functions/production","type":"/action_types/tailoring","category":"/action_categories/tailoring/body","name":"Umbral Tunic","levelRequirement":{"skillHrid":"/skills/tailoring","level":87},"baseTimeCost":216000000000,"experienceGain":{"skillHrid":"/skills/tailoring","value":2592},"dropTable":null,"upgradeItemHrid":"/items/beast_tunic","inputItems":[{"itemHrid":"/items/umbral_leather","count":144}],"outputItems":[{"itemHrid":"/items/umbral_tunic","count":1}],"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":69},"/actions/woodcutting/arcane_tree":{"hrid":"/actions/woodcutting/arcane_tree","function":"/action_functions/gathering","type":"/action_types/woodcutting","category":"","name":"Arcane Tree","levelRequirement":{"skillHrid":"/skills/woodcutting","level":80},"baseTimeCost":30000000000,"experienceGain":{"skillHrid":"/skills/woodcutting","value":50},"dropTable":[{"itemHrid":"/items/arcane_log","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":7},"/actions/woodcutting/birch_tree":{"hrid":"/actions/woodcutting/birch_tree","function":"/action_functions/gathering","type":"/action_types/woodcutting","category":"","name":"Birch Tree","levelRequirement":{"skillHrid":"/skills/woodcutting","level":15},"baseTimeCost":10000000000,"experienceGain":{"skillHrid":"/skills/woodcutting","value":10},"dropTable":[{"itemHrid":"/items/birch_log","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":2},"/actions/woodcutting/cedar_tree":{"hrid":"/actions/woodcutting/cedar_tree","function":"/action_functions/gathering","type":"/action_types/woodcutting","category":"","name":"Cedar Tree","levelRequirement":{"skillHrid":"/skills/woodcutting","level":30},"baseTimeCost":12000000000,"experienceGain":{"skillHrid":"/skills/woodcutting","value":15},"dropTable":[{"itemHrid":"/items/cedar_log","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":3},"/actions/woodcutting/ginkgo_tree":{"hrid":"/actions/woodcutting/ginkgo_tree","function":"/action_functions/gathering","type":"/action_types/woodcutting","category":"","name":"Ginkgo Tree","levelRequirement":{"skillHrid":"/skills/woodcutting","level":60},"baseTimeCost":16000000000,"experienceGain":{"skillHrid":"/skills/woodcutting","value":30},"dropTable":[{"itemHrid":"/items/ginkgo_log","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":5},"/actions/woodcutting/purpleheart_tree":{"hrid":"/actions/woodcutting/purpleheart_tree","function":"/action_functions/gathering","type":"/action_types/woodcutting","category":"","name":"Purpleheart Tree","levelRequirement":{"skillHrid":"/skills/woodcutting","level":45},"baseTimeCost":14000000000,"experienceGain":{"skillHrid":"/skills/woodcutting","value":22.5},"dropTable":[{"itemHrid":"/items/purpleheart_log","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":4},"/actions/woodcutting/redwood_tree":{"hrid":"/actions/woodcutting/redwood_tree","function":"/action_functions/gathering","type":"/action_types/woodcutting","category":"","name":"Redwood Tree","levelRequirement":{"skillHrid":"/skills/woodcutting","level":70},"baseTimeCost":20000000000,"experienceGain":{"skillHrid":"/skills/woodcutting","value":40},"dropTable":[{"itemHrid":"/items/redwood_log","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":6},"/actions/woodcutting/tree":{"hrid":"/actions/woodcutting/tree","function":"/action_functions/gathering","type":"/action_types/woodcutting","category":"","name":"Tree","levelRequirement":{"skillHrid":"/skills/woodcutting","level":1},"baseTimeCost":8000000000,"experienceGain":{"skillHrid":"/skills/woodcutting","value":5},"dropTable":[{"itemHrid":"/items/log","dropRate":1,"minCount":1,"maxCount":3}],"upgradeItemHrid":"","inputItems":null,"outputItems":null,"monsterSpawnInfo":{"maxSpawnCount":0,"maxTotalStrength":0,"spawns":null},"sortIndex":1}}');

/***/ }),

/***/ "./src/combatsimulator/data/combatMonsterDetailMap.json":
/*!**************************************************************!*\
  !*** ./src/combatsimulator/data/combatMonsterDetailMap.json ***!
  \**************************************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"/combat_monsters/alligator":{"hrid":"/combat_monsters/alligator","name":"Sherlock","combatDetails":{"currentHitpoints":300,"maxHitpoints":300,"currentManapoints":300,"maxManapoints":300,"stabAccuracyRating":30,"slashAccuracyRating":30,"smashAccuracyRating":30,"rangedAccuracyRating":10,"stabMaxDamage":37.1,"slashMaxDamage":37.1,"smashMaxDamage":37.1,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":36.4,"slashEvasionRating":36.4,"smashEvasionRating":36.4,"rangedEvasionRating":26,"totalArmor":3.2,"totalWaterResistance":1.6,"totalNatureResistance":1.6,"totalFireResistance":1.6,"staminaLevel":20,"intelligenceLevel":20,"attackLevel":20,"powerLevel":25,"defenseLevel":16,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/slash"],"damageType":"/damage_types/physical","attackInterval":3500000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0.06,"slashDamage":0.06,"smashDamage":0.06,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0.4,"slashEvasion":0.4,"smashEvasion":0.4,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/scratch","level":10}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":50,"maxCount":250},{"itemHrid":"/items/reptile_hide","dropRate":1,"minCount":1,"maxCount":2},{"itemHrid":"/items/blueberry","dropRate":0.1,"minCount":1,"maxCount":6},{"itemHrid":"/items/blackberry","dropRate":0.05,"minCount":1,"maxCount":4},{"itemHrid":"/items/apple","dropRate":0.3,"minCount":1,"maxCount":5},{"itemHrid":"/items/orange","dropRate":0.15,"minCount":1,"maxCount":3},{"itemHrid":"/items/gator_vest","dropRate":0.003,"minCount":1,"maxCount":1},{"itemHrid":"/items/swamp_essence","dropRate":0.4,"minCount":2,"maxCount":6},{"itemHrid":"/items/scratch","dropRate":0.01,"minCount":1,"maxCount":1}]},"/combat_monsters/aquahorse":{"hrid":"/combat_monsters/aquahorse","name":"Aquahorse","combatDetails":{"currentHitpoints":400,"maxHitpoints":400,"currentManapoints":700,"maxManapoints":700,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":50,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":50,"magicMaxDamage":10,"stabEvasionRating":45,"slashEvasionRating":45,"smashEvasionRating":45,"rangedEvasionRating":45,"totalArmor":7,"totalWaterResistance":53.5,"totalNatureResistance":3.5,"totalFireResistance":53.5,"staminaLevel":30,"intelligenceLevel":60,"attackLevel":0,"powerLevel":0,"defenseLevel":35,"rangedLevel":40,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/ranged"],"damageType":"/damage_types/water","attackInterval":3000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":50,"natureResistance":0,"fireResistance":50,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/aqua_arrow","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":60,"maxCount":300},{"itemHrid":"/items/orange","dropRate":0.15,"minCount":1,"maxCount":5},{"itemHrid":"/items/plum","dropRate":0.05,"minCount":1,"maxCount":3},{"itemHrid":"/items/aqua_essence","dropRate":0.2,"minCount":1,"maxCount":4},{"itemHrid":"/items/aqua_arrow","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/black_bear":{"hrid":"/combat_monsters/black_bear","name":"Black Bear","combatDetails":{"currentHitpoints":1300,"maxHitpoints":1300,"currentManapoints":1300,"maxManapoints":1300,"stabAccuracyRating":150,"slashAccuracyRating":150,"smashAccuracyRating":150,"rangedAccuracyRating":10,"stabMaxDamage":150,"slashMaxDamage":150,"smashMaxDamage":150,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":143,"slashEvasionRating":110,"smashEvasionRating":110,"rangedEvasionRating":110,"totalArmor":20,"totalWaterResistance":30,"totalNatureResistance":30,"totalFireResistance":10,"staminaLevel":120,"intelligenceLevel":120,"attackLevel":140,"powerLevel":140,"defenseLevel":100,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/stab"],"damageType":"/damage_types/physical","attackInterval":3000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0.3,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":20,"natureResistance":20,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/frenzy","level":4}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":340,"maxCount":1700},{"itemHrid":"/items/beast_hide","dropRate":1,"minCount":1,"maxCount":1},{"itemHrid":"/items/mooberry","dropRate":0.1,"minCount":1,"maxCount":4},{"itemHrid":"/items/marsberry","dropRate":0.15,"minCount":1,"maxCount":4},{"itemHrid":"/items/spaceberry","dropRate":0.05,"minCount":1,"maxCount":4},{"itemHrid":"/items/black_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/red_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/emp_tea_leaf","dropRate":0.15,"minCount":1,"maxCount":1},{"itemHrid":"/items/black_bear_fluff","dropRate":0.002,"minCount":1,"maxCount":1},{"itemHrid":"/items/bear_essence","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/frenzy","dropRate":0.0006,"minCount":1,"maxCount":1}]},"/combat_monsters/centaur_archer":{"hrid":"/combat_monsters/centaur_archer","name":"Centaur Archer","combatDetails":{"currentHitpoints":1100,"maxHitpoints":1100,"currentManapoints":1100,"maxManapoints":1100,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":90,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":90,"magicMaxDamage":10,"stabEvasionRating":90,"slashEvasionRating":90,"smashEvasionRating":90,"rangedEvasionRating":90,"totalArmor":16,"totalWaterResistance":48,"totalNatureResistance":48,"totalFireResistance":48,"staminaLevel":100,"intelligenceLevel":100,"attackLevel":0,"powerLevel":0,"defenseLevel":80,"rangedLevel":80,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/ranged"],"damageType":"/damage_types/physical","attackInterval":3000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":40,"natureResistance":40,"fireResistance":40,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/quick_shot","level":10},{"abilityHrid":"/abilities/rain_of_arrows","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":200,"maxCount":1000},{"itemHrid":"/items/beast_hide","dropRate":1,"minCount":1,"maxCount":1},{"itemHrid":"/items/black_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/centaur_hoof","dropRate":0.002,"minCount":1,"maxCount":1},{"itemHrid":"/items/jungle_essence","dropRate":0.2,"minCount":1,"maxCount":5},{"itemHrid":"/items/quick_shot","dropRate":0.01,"minCount":1,"maxCount":1},{"itemHrid":"/items/rain_of_arrows","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/crab":{"hrid":"/combat_monsters/crab","name":"I Pinch","combatDetails":{"currentHitpoints":400,"maxHitpoints":400,"currentManapoints":400,"maxManapoints":400,"stabAccuracyRating":35,"slashAccuracyRating":35,"smashAccuracyRating":35,"rangedAccuracyRating":10,"stabMaxDamage":40,"slashMaxDamage":40,"smashMaxDamage":40,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":50,"slashEvasionRating":70,"smashEvasionRating":40,"rangedEvasionRating":50,"totalArmor":8,"totalWaterResistance":54,"totalNatureResistance":4,"totalFireResistance":54,"staminaLevel":30,"intelligenceLevel":30,"attackLevel":25,"powerLevel":30,"defenseLevel":40,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":3500000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0.4,"smashEvasion":-0.2,"rangedEvasion":0,"armor":0,"waterResistance":50,"natureResistance":0,"fireResistance":50,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/smack","level":5}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":60,"maxCount":300},{"itemHrid":"/items/orange","dropRate":0.15,"minCount":1,"maxCount":5},{"itemHrid":"/items/plum","dropRate":0.05,"minCount":1,"maxCount":3},{"itemHrid":"/items/crab_pincer","dropRate":0.005,"minCount":1,"maxCount":1},{"itemHrid":"/items/aqua_essence","dropRate":0.2,"minCount":1,"maxCount":4},{"itemHrid":"/items/smack","dropRate":0.01,"minCount":1,"maxCount":1}]},"/combat_monsters/elementalist":{"hrid":"/combat_monsters/elementalist","name":"Elementalist","combatDetails":{"currentHitpoints":1500,"maxHitpoints":1500,"currentManapoints":1900,"maxManapoints":1900,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":10,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":10,"magicMaxDamage":150,"stabEvasionRating":80,"slashEvasionRating":80,"smashEvasionRating":80,"rangedEvasionRating":80,"totalArmor":14,"totalWaterResistance":139,"totalNatureResistance":139,"totalFireResistance":139,"staminaLevel":140,"intelligenceLevel":180,"attackLevel":0,"powerLevel":0,"defenseLevel":70,"rangedLevel":0,"magicLevel":140,"combatStats":{"combatStyleHrids":["/combat_styles/magic"],"damageType":"/damage_types/fire","attackInterval":7000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0.3,"natureAmplify":0,"fireAmplify":0.3,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":90,"natureResistance":90,"fireResistance":90,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/elemental_affinity","level":1},{"abilityHrid":"/abilities/ice_spear","level":10},{"abilityHrid":"/abilities/flame_blast","level":10}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":240,"maxCount":1200},{"itemHrid":"/items/dragon_fruit","dropRate":0.1,"minCount":1,"maxCount":3},{"itemHrid":"/items/silk_fabric","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/radiant_fiber","dropRate":0.1,"minCount":1,"maxCount":3},{"itemHrid":"/items/sorcerers_sole","dropRate":0.002,"minCount":1,"maxCount":1},{"itemHrid":"/items/tome_of_the_elements","dropRate":0.0002,"minCount":1,"maxCount":1},{"itemHrid":"/items/sorcerer_essence","dropRate":0.3,"minCount":2,"maxCount":6},{"itemHrid":"/items/elemental_affinity","dropRate":0.0008,"minCount":1,"maxCount":1},{"itemHrid":"/items/ice_spear","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/flame_blast","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/eye":{"hrid":"/combat_monsters/eye","name":"Eye","combatDetails":{"currentHitpoints":990,"maxHitpoints":990,"currentManapoints":990,"maxManapoints":990,"stabAccuracyRating":99,"slashAccuracyRating":99,"smashAccuracyRating":99,"rangedAccuracyRating":10,"stabMaxDamage":99,"slashMaxDamage":99,"smashMaxDamage":99,"rangedMaxDamage":10,"magicMaxDamage":99,"stabEvasionRating":74.25,"slashEvasionRating":99,"smashEvasionRating":99,"rangedEvasionRating":74.25,"totalArmor":17.8,"totalWaterResistance":35.6,"totalNatureResistance":35.6,"totalFireResistance":35.6,"staminaLevel":89,"intelligenceLevel":89,"attackLevel":89,"powerLevel":89,"defenseLevel":89,"rangedLevel":0,"magicLevel":89,"combatStats":{"combatStyleHrids":["/combat_styles/slash"],"damageType":"/damage_types/physical","attackInterval":2800000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":-0.25,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":-0.25,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/precision","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":200,"maxCount":1000},{"itemHrid":"/items/azure_cheese","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/burble_cheese","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/crimson_cheese","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/strawberry","dropRate":0.1,"minCount":1,"maxCount":6},{"itemHrid":"/items/mooberry","dropRate":0.1,"minCount":1,"maxCount":6},{"itemHrid":"/items/marsberry","dropRate":0.1,"minCount":1,"maxCount":6},{"itemHrid":"/items/plum","dropRate":0.1,"minCount":1,"maxCount":5},{"itemHrid":"/items/peach","dropRate":0.15,"minCount":1,"maxCount":5},{"itemHrid":"/items/dragon_fruit","dropRate":0.05,"minCount":1,"maxCount":5},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.6,"minCount":1,"maxCount":3},{"itemHrid":"/items/moolong_tea_leaf","dropRate":0.45,"minCount":1,"maxCount":3},{"itemHrid":"/items/red_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/eyessence","dropRate":0.4,"minCount":1,"maxCount":1},{"itemHrid":"/items/precision","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/eyes":{"hrid":"/combat_monsters/eyes","name":"Eyes","combatDetails":{"currentHitpoints":1110,"maxHitpoints":1110,"currentManapoints":1110,"maxManapoints":1110,"stabAccuracyRating":111,"slashAccuracyRating":111,"smashAccuracyRating":111,"rangedAccuracyRating":10,"stabMaxDamage":111,"slashMaxDamage":111,"smashMaxDamage":111,"rangedMaxDamage":10,"magicMaxDamage":111,"stabEvasionRating":83.25,"slashEvasionRating":111,"smashEvasionRating":111,"rangedEvasionRating":83.25,"totalArmor":20.200000000000003,"totalWaterResistance":40.4,"totalNatureResistance":40.4,"totalFireResistance":40.4,"staminaLevel":101,"intelligenceLevel":101,"attackLevel":101,"powerLevel":101,"defenseLevel":101,"rangedLevel":0,"magicLevel":101,"combatStats":{"combatStyleHrids":["/combat_styles/slash"],"damageType":"/damage_types/physical","attackInterval":2800000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":-0.25,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":-0.25,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/precision","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":240,"maxCount":1200},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":1},{"itemHrid":"/items/moolong_tea_leaf","dropRate":0.15,"minCount":1,"maxCount":1},{"itemHrid":"/items/red_tea_leaf","dropRate":0.1,"minCount":1,"maxCount":1},{"itemHrid":"/items/goggles","dropRate":0.0005,"minCount":1,"maxCount":1},{"itemHrid":"/items/eyessence","dropRate":0.4,"minCount":2,"maxCount":2},{"itemHrid":"/items/precision","dropRate":0.0015,"minCount":1,"maxCount":1}]},"/combat_monsters/flame_sorcerer":{"hrid":"/combat_monsters/flame_sorcerer","name":"Flame Sorcerer","combatDetails":{"currentHitpoints":1000,"maxHitpoints":1000,"currentManapoints":1400,"maxManapoints":1400,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":10,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":10,"magicMaxDamage":100,"stabEvasionRating":55,"slashEvasionRating":55,"smashEvasionRating":55,"rangedEvasionRating":55,"totalArmor":9,"totalWaterResistance":61.5,"totalNatureResistance":91.5,"totalFireResistance":91.5,"staminaLevel":90,"intelligenceLevel":130,"attackLevel":0,"powerLevel":0,"defenseLevel":45,"rangedLevel":0,"magicLevel":90,"combatStats":{"combatStyleHrids":["/combat_styles/magic"],"damageType":"/damage_types/fire","attackInterval":7000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0.2,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":30,"natureResistance":60,"fireResistance":60,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/fireball","level":15},{"abilityHrid":"/abilities/flame_blast","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":150,"maxCount":750},{"itemHrid":"/items/peach","dropRate":0.1,"minCount":1,"maxCount":3},{"itemHrid":"/items/bamboo_fabric","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/flaming_cloth","dropRate":0.002,"minCount":1,"maxCount":1},{"itemHrid":"/items/sorcerers_sole","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/sorcerer_essence","dropRate":0.2,"minCount":1,"maxCount":5},{"itemHrid":"/items/fireball","dropRate":0.012,"minCount":1,"maxCount":1},{"itemHrid":"/items/flame_blast","dropRate":0.0008,"minCount":1,"maxCount":1}]},"/combat_monsters/fly":{"hrid":"/combat_monsters/fly","name":"Fly","combatDetails":{"currentHitpoints":30,"maxHitpoints":30,"currentManapoints":30,"maxManapoints":30,"stabAccuracyRating":11,"slashAccuracyRating":11,"smashAccuracyRating":7.699999999999999,"rangedAccuracyRating":10,"stabMaxDamage":11,"slashMaxDamage":11,"smashMaxDamage":7.699999999999999,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":11,"slashEvasionRating":11,"smashEvasionRating":11,"rangedEvasionRating":11,"totalArmor":0.2,"totalWaterResistance":0.1,"totalNatureResistance":0.1,"totalFireResistance":0.1,"staminaLevel":-7,"intelligenceLevel":-7,"attackLevel":1,"powerLevel":1,"defenseLevel":1,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":4000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":-0.3,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":-0.3,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":8,"maxCount":40}]},"/combat_monsters/frog":{"hrid":"/combat_monsters/frog","name":"Frogger","combatDetails":{"currentHitpoints":150,"maxHitpoints":150,"currentManapoints":150,"maxManapoints":150,"stabAccuracyRating":25,"slashAccuracyRating":25,"smashAccuracyRating":25,"rangedAccuracyRating":10,"stabMaxDamage":20,"slashMaxDamage":20,"smashMaxDamage":20,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":25,"slashEvasionRating":25,"smashEvasionRating":25,"rangedEvasionRating":25,"totalArmor":3,"totalWaterResistance":1.5,"totalNatureResistance":1.5,"totalFireResistance":1.5,"staminaLevel":5,"intelligenceLevel":5,"attackLevel":15,"powerLevel":10,"defenseLevel":15,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":3200000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/smack","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":24,"maxCount":120},{"itemHrid":"/items/egg","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/green_tea_leaf","dropRate":0.4,"minCount":1,"maxCount":3},{"itemHrid":"/items/black_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":3},{"itemHrid":"/items/swamp_essence","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/smack","dropRate":0.007,"minCount":1,"maxCount":1}]},"/combat_monsters/gobo_boomy":{"hrid":"/combat_monsters/gobo_boomy","name":"Boomy","combatDetails":{"currentHitpoints":800,"maxHitpoints":800,"currentManapoints":800,"maxManapoints":800,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":10,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":10,"magicMaxDamage":70.8,"stabEvasionRating":50,"slashEvasionRating":50,"smashEvasionRating":50,"rangedEvasionRating":50,"totalArmor":8,"totalWaterResistance":49,"totalNatureResistance":49,"totalFireResistance":49,"staminaLevel":70,"intelligenceLevel":70,"attackLevel":0,"powerLevel":0,"defenseLevel":40,"rangedLevel":0,"magicLevel":50,"combatStats":{"combatStyleHrids":["/combat_styles/magic"],"damageType":"/damage_types/fire","attackInterval":8000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0.18,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0.25,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":30,"natureResistance":30,"fireResistance":30,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/fireball","level":20}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":130,"maxCount":650},{"itemHrid":"/items/gobo_hide","dropRate":1,"minCount":1,"maxCount":1},{"itemHrid":"/items/cotton_fabric","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/linen_fabric","dropRate":0.05,"minCount":1,"maxCount":2},{"itemHrid":"/items/green_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/moolong_tea_leaf","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/gobo_boomstick","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/gobo_essence","dropRate":0.3,"minCount":2,"maxCount":6},{"itemHrid":"/items/fireball","dropRate":0.01,"minCount":1,"maxCount":1}]},"/combat_monsters/gobo_shooty":{"hrid":"/combat_monsters/gobo_shooty","name":"Shooty","combatDetails":{"currentHitpoints":800,"maxHitpoints":800,"currentManapoints":300,"maxManapoints":300,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":71.5,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":85.25,"magicMaxDamage":10,"stabEvasionRating":70,"slashEvasionRating":70,"smashEvasionRating":70,"rangedEvasionRating":70,"totalArmor":12,"totalWaterResistance":56,"totalNatureResistance":56,"totalFireResistance":56,"staminaLevel":70,"intelligenceLevel":20,"attackLevel":0,"powerLevel":0,"defenseLevel":60,"rangedLevel":45,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/ranged"],"damageType":"/damage_types/physical","attackInterval":3200000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0.3,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0.55,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":50,"natureResistance":50,"fireResistance":50,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/flame_arrow","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":130,"maxCount":650},{"itemHrid":"/items/gobo_hide","dropRate":1,"minCount":1,"maxCount":1},{"itemHrid":"/items/orange","dropRate":0.1,"minCount":1,"maxCount":6},{"itemHrid":"/items/plum","dropRate":0.15,"minCount":1,"maxCount":6},{"itemHrid":"/items/peach","dropRate":0.05,"minCount":1,"maxCount":5},{"itemHrid":"/items/green_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/moolong_tea_leaf","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/gobo_shooter","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/gobo_essence","dropRate":0.3,"minCount":2,"maxCount":6},{"itemHrid":"/items/flame_arrow","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/gobo_slashy":{"hrid":"/combat_monsters/gobo_slashy","name":"Slashy","combatDetails":{"currentHitpoints":800,"maxHitpoints":800,"currentManapoints":300,"maxManapoints":300,"stabAccuracyRating":50,"slashAccuracyRating":95,"smashAccuracyRating":50,"rangedAccuracyRating":10,"stabMaxDamage":50,"slashMaxDamage":95,"smashMaxDamage":50,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":70,"slashEvasionRating":70,"smashEvasionRating":70,"rangedEvasionRating":70,"totalArmor":12,"totalWaterResistance":6,"totalNatureResistance":6,"totalFireResistance":6,"staminaLevel":70,"intelligenceLevel":20,"attackLevel":40,"powerLevel":40,"defenseLevel":60,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/slash"],"damageType":"/damage_types/physical","attackInterval":3300000000,"stabAccuracy":0,"slashAccuracy":0.9,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0.9,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/cleave","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":130,"maxCount":650},{"itemHrid":"/items/gobo_hide","dropRate":1,"minCount":1,"maxCount":1},{"itemHrid":"/items/blackberry","dropRate":0.1,"minCount":1,"maxCount":6},{"itemHrid":"/items/strawberry","dropRate":0.15,"minCount":1,"maxCount":6},{"itemHrid":"/items/mooberry","dropRate":0.05,"minCount":1,"maxCount":5},{"itemHrid":"/items/black_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/moolong_tea_leaf","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/gobo_slasher","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/gobo_essence","dropRate":0.3,"minCount":2,"maxCount":6},{"itemHrid":"/items/cleave","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/gobo_smashy":{"hrid":"/combat_monsters/gobo_smashy","name":"Smashy","combatDetails":{"currentHitpoints":800,"maxHitpoints":800,"currentManapoints":300,"maxManapoints":300,"stabAccuracyRating":50,"slashAccuracyRating":50,"smashAccuracyRating":55.00000000000001,"rangedAccuracyRating":10,"stabMaxDamage":55,"slashMaxDamage":55,"smashMaxDamage":145.75,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":70,"slashEvasionRating":70,"smashEvasionRating":70,"rangedEvasionRating":70,"totalArmor":12,"totalWaterResistance":6,"totalNatureResistance":6,"totalFireResistance":6,"staminaLevel":70,"intelligenceLevel":20,"attackLevel":40,"powerLevel":45,"defenseLevel":60,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":3700000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0.1,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":1.65,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/berserk","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":130,"maxCount":650},{"itemHrid":"/items/gobo_hide","dropRate":1,"minCount":1,"maxCount":1},{"itemHrid":"/items/orange","dropRate":0.1,"minCount":1,"maxCount":6},{"itemHrid":"/items/plum","dropRate":0.15,"minCount":1,"maxCount":6},{"itemHrid":"/items/peach","dropRate":0.05,"minCount":1,"maxCount":5},{"itemHrid":"/items/green_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/moolong_tea_leaf","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/gobo_smasher","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/gobo_essence","dropRate":0.3,"minCount":2,"maxCount":6},{"itemHrid":"/items/berserk","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/gobo_stabby":{"hrid":"/combat_monsters/gobo_stabby","name":"Stabby","combatDetails":{"currentHitpoints":800,"maxHitpoints":800,"currentManapoints":300,"maxManapoints":300,"stabAccuracyRating":150,"slashAccuracyRating":50,"smashAccuracyRating":50,"rangedAccuracyRating":10,"stabMaxDamage":44,"slashMaxDamage":40,"smashMaxDamage":40,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":70,"slashEvasionRating":70,"smashEvasionRating":70,"rangedEvasionRating":70,"totalArmor":12,"totalWaterResistance":6,"totalNatureResistance":6,"totalFireResistance":6,"staminaLevel":70,"intelligenceLevel":20,"attackLevel":40,"powerLevel":30,"defenseLevel":60,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/stab"],"damageType":"/damage_types/physical","attackInterval":2500000000,"stabAccuracy":2,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0.1,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/pierce","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":130,"maxCount":650},{"itemHrid":"/items/gobo_hide","dropRate":1,"minCount":1,"maxCount":1},{"itemHrid":"/items/burble_milk","dropRate":0.15,"minCount":2,"maxCount":10},{"itemHrid":"/items/crimson_milk","dropRate":0.05,"minCount":2,"maxCount":10},{"itemHrid":"/items/black_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/moolong_tea_leaf","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/gobo_stabber","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/gobo_essence","dropRate":0.3,"minCount":2,"maxCount":6},{"itemHrid":"/items/pierce","dropRate":0.0015,"minCount":1,"maxCount":1}]},"/combat_monsters/granite_golem":{"hrid":"/combat_monsters/granite_golem","name":"Granite Golem","combatDetails":{"currentHitpoints":1800,"maxHitpoints":1800,"currentManapoints":1800,"maxManapoints":1800,"stabAccuracyRating":200,"slashAccuracyRating":200,"smashAccuracyRating":200,"rangedAccuracyRating":10,"stabMaxDamage":260,"slashMaxDamage":260,"smashMaxDamage":260,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":330,"slashEvasionRating":330,"smashEvasionRating":264,"rangedEvasionRating":461.99999999999994,"totalArmor":64,"totalWaterResistance":112,"totalNatureResistance":62,"totalFireResistance":112,"staminaLevel":170,"intelligenceLevel":170,"attackLevel":190,"powerLevel":250,"defenseLevel":320,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":3200000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":-0.2,"rangedEvasion":0.4,"armor":0,"waterResistance":80,"natureResistance":30,"fireResistance":80,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/sweep","level":20},{"abilityHrid":"/abilities/stunning_blow","level":10}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":750,"maxCount":3750},{"itemHrid":"/items/red_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/emp_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/living_granite","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/golem_essence","dropRate":0.3,"minCount":3,"maxCount":9},{"itemHrid":"/items/sweep","dropRate":0.0025,"minCount":1,"maxCount":1},{"itemHrid":"/items/stunning_blow","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/grizzly_bear":{"hrid":"/combat_monsters/grizzly_bear","name":"Grizzly Bear","combatDetails":{"currentHitpoints":1400,"maxHitpoints":1400,"currentManapoints":1400,"maxManapoints":1400,"stabAccuracyRating":160,"slashAccuracyRating":160,"smashAccuracyRating":160,"rangedAccuracyRating":10,"stabMaxDamage":160,"slashMaxDamage":160,"smashMaxDamage":160,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":120,"slashEvasionRating":156,"smashEvasionRating":120,"rangedEvasionRating":120,"totalArmor":22,"totalWaterResistance":31,"totalNatureResistance":31,"totalFireResistance":11,"staminaLevel":130,"intelligenceLevel":130,"attackLevel":150,"powerLevel":150,"defenseLevel":110,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/slash"],"damageType":"/damage_types/physical","attackInterval":3000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0.3,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":20,"natureResistance":20,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/frenzy","level":7}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":380,"maxCount":1900},{"itemHrid":"/items/beast_hide","dropRate":1,"minCount":1,"maxCount":2},{"itemHrid":"/items/mooberry","dropRate":0.1,"minCount":1,"maxCount":6},{"itemHrid":"/items/marsberry","dropRate":0.15,"minCount":1,"maxCount":6},{"itemHrid":"/items/spaceberry","dropRate":0.05,"minCount":1,"maxCount":6},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/red_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/emp_tea_leaf","dropRate":0.15,"minCount":1,"maxCount":1},{"itemHrid":"/items/grizzly_bear_fluff","dropRate":0.002,"minCount":1,"maxCount":1},{"itemHrid":"/items/bear_essence","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/frenzy","dropRate":0.0008,"minCount":1,"maxCount":1}]},"/combat_monsters/gummy_bear":{"hrid":"/combat_monsters/gummy_bear","name":"Gummy Bear","combatDetails":{"currentHitpoints":1200,"maxHitpoints":1200,"currentManapoints":1200,"maxManapoints":1200,"stabAccuracyRating":150,"slashAccuracyRating":150,"smashAccuracyRating":150,"rangedAccuracyRating":10,"stabMaxDamage":90,"slashMaxDamage":90,"smashMaxDamage":90,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":90,"slashEvasionRating":90,"smashEvasionRating":117,"rangedEvasionRating":90,"totalArmor":16,"totalWaterResistance":28,"totalNatureResistance":28,"totalFireResistance":8,"staminaLevel":110,"intelligenceLevel":110,"attackLevel":140,"powerLevel":80,"defenseLevel":80,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":2600000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0.3,"rangedEvasion":0,"armor":0,"waterResistance":20,"natureResistance":20,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/frenzy","level":1}],"dropTable":[{"itemHrid":"/items/sugar","dropRate":1,"minCount":50,"maxCount":250},{"itemHrid":"/items/apple_gummy","dropRate":0.5,"minCount":1,"maxCount":1},{"itemHrid":"/items/orange_gummy","dropRate":0.5,"minCount":1,"maxCount":1},{"itemHrid":"/items/plum_gummy","dropRate":0.5,"minCount":1,"maxCount":1},{"itemHrid":"/items/peach_gummy","dropRate":0.5,"minCount":1,"maxCount":1},{"itemHrid":"/items/dragon_fruit_gummy","dropRate":0.5,"minCount":1,"maxCount":1},{"itemHrid":"/items/bear_essence","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/frenzy","dropRate":0.0003,"minCount":1,"maxCount":1}]},"/combat_monsters/ice_sorcerer":{"hrid":"/combat_monsters/ice_sorcerer","name":"Ice Sorcerer","combatDetails":{"currentHitpoints":900,"maxHitpoints":900,"currentManapoints":1300,"maxManapoints":1300,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":10,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":10,"magicMaxDamage":90,"stabEvasionRating":50,"slashEvasionRating":50,"smashEvasionRating":50,"rangedEvasionRating":50,"totalArmor":8,"totalWaterResistance":78,"totalNatureResistance":48,"totalFireResistance":78,"staminaLevel":80,"intelligenceLevel":120,"attackLevel":0,"powerLevel":0,"defenseLevel":40,"rangedLevel":0,"magicLevel":80,"combatStats":{"combatStyleHrids":["/combat_styles/magic"],"damageType":"/damage_types/water","attackInterval":7000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0.2,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":50,"natureResistance":20,"fireResistance":50,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/water_strike","level":15},{"abilityHrid":"/abilities/ice_spear","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":120,"maxCount":600},{"itemHrid":"/items/peach","dropRate":0.1,"minCount":1,"maxCount":3},{"itemHrid":"/items/bamboo_fabric","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/icy_cloth","dropRate":0.002,"minCount":1,"maxCount":1},{"itemHrid":"/items/sorcerers_sole","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/sorcerer_essence","dropRate":0.2,"minCount":1,"maxCount":4},{"itemHrid":"/items/water_strike","dropRate":0.012,"minCount":1,"maxCount":1},{"itemHrid":"/items/ice_spear","dropRate":0.0008,"minCount":1,"maxCount":1}]},"/combat_monsters/jungle_sprite":{"hrid":"/combat_monsters/jungle_sprite","name":"Jungle Sprite","combatDetails":{"currentHitpoints":500,"maxHitpoints":500,"currentManapoints":500,"maxManapoints":500,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":10,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":10,"magicMaxDamage":40,"stabEvasionRating":30,"slashEvasionRating":30,"smashEvasionRating":30,"rangedEvasionRating":30,"totalArmor":4,"totalWaterResistance":61,"totalNatureResistance":61,"totalFireResistance":11,"staminaLevel":40,"intelligenceLevel":40,"attackLevel":0,"powerLevel":0,"defenseLevel":20,"rangedLevel":0,"magicLevel":30,"combatStats":{"combatStyleHrids":["/combat_styles/magic"],"damageType":"/damage_types/nature","attackInterval":5000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0.3,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":50,"natureResistance":50,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/entangle","level":10},{"abilityHrid":"/abilities/heal","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":80,"maxCount":400},{"itemHrid":"/items/cotton","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/flax","dropRate":0.1,"minCount":1,"maxCount":3},{"itemHrid":"/items/tome_of_healing","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/jungle_essence","dropRate":0.2,"minCount":1,"maxCount":3},{"itemHrid":"/items/entangle","dropRate":0.01,"minCount":1,"maxCount":1},{"itemHrid":"/items/heal","dropRate":0.0008,"minCount":1,"maxCount":1}]},"/combat_monsters/magnetic_golem":{"hrid":"/combat_monsters/magnetic_golem","name":"Magnetic Golem","combatDetails":{"currentHitpoints":1400,"maxHitpoints":1400,"currentManapoints":1400,"maxManapoints":1400,"stabAccuracyRating":160,"slashAccuracyRating":160,"smashAccuracyRating":160,"rangedAccuracyRating":10,"stabMaxDamage":220,"slashMaxDamage":220,"smashMaxDamage":220,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":290,"slashEvasionRating":290,"smashEvasionRating":232,"rangedEvasionRating":406,"totalArmor":56,"totalWaterResistance":108,"totalNatureResistance":58,"totalFireResistance":108,"staminaLevel":130,"intelligenceLevel":130,"attackLevel":150,"powerLevel":210,"defenseLevel":280,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":3200000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":-0.2,"rangedEvasion":0.4,"armor":0,"waterResistance":80,"natureResistance":30,"fireResistance":80,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/stunning_blow","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":500,"maxCount":2500},{"itemHrid":"/items/red_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/emp_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/magnet","dropRate":0.0015,"minCount":1,"maxCount":1},{"itemHrid":"/items/golem_essence","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/stunning_blow","dropRate":0.0008,"minCount":1,"maxCount":1}]},"/combat_monsters/myconid":{"hrid":"/combat_monsters/myconid","name":"Myconid","combatDetails":{"currentHitpoints":700,"maxHitpoints":700,"currentManapoints":700,"maxManapoints":700,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":10,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":10,"magicMaxDamage":50,"stabEvasionRating":40,"slashEvasionRating":40,"smashEvasionRating":40,"rangedEvasionRating":40,"totalArmor":6,"totalWaterResistance":65,"totalNatureResistance":65,"totalFireResistance":15,"staminaLevel":60,"intelligenceLevel":60,"attackLevel":0,"powerLevel":0,"defenseLevel":30,"rangedLevel":0,"magicLevel":40,"combatStats":{"combatStyleHrids":["/combat_styles/magic"],"damageType":"/damage_types/nature","attackInterval":5000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0.3,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":50,"natureResistance":50,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/toxic_pollen","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":120,"maxCount":600},{"itemHrid":"/items/cocoon","dropRate":0.3,"minCount":1,"maxCount":5},{"itemHrid":"/items/black_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/jungle_essence","dropRate":0.2,"minCount":1,"maxCount":4},{"itemHrid":"/items/toxic_pollen","dropRate":0.0008,"minCount":1,"maxCount":1}]},"/combat_monsters/nom_nom":{"hrid":"/combat_monsters/nom_nom","name":"Nom Nom","combatDetails":{"currentHitpoints":480,"maxHitpoints":480,"currentManapoints":480,"maxManapoints":480,"stabAccuracyRating":44,"slashAccuracyRating":44,"smashAccuracyRating":55,"rangedAccuracyRating":10,"stabMaxDamage":55,"slashMaxDamage":55,"smashMaxDamage":55,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":55,"slashEvasionRating":55,"smashEvasionRating":55,"rangedEvasionRating":55,"totalArmor":9,"totalWaterResistance":54.5,"totalNatureResistance":4.5,"totalFireResistance":54.5,"staminaLevel":38,"intelligenceLevel":38,"attackLevel":45,"powerLevel":45,"defenseLevel":45,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/stab"],"damageType":"/damage_types/physical","attackInterval":3200000000,"stabAccuracy":-0.2,"slashAccuracy":-0.2,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":50,"natureResistance":0,"fireResistance":50,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/pierce","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":90,"maxCount":450},{"itemHrid":"/items/blackberry","dropRate":0.15,"minCount":1,"maxCount":12},{"itemHrid":"/items/strawberry","dropRate":0.05,"minCount":1,"maxCount":8},{"itemHrid":"/items/orange","dropRate":0.15,"minCount":1,"maxCount":10},{"itemHrid":"/items/plum","dropRate":0.05,"minCount":1,"maxCount":6},{"itemHrid":"/items/green_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/black_tea_leaf","dropRate":0.4,"minCount":1,"maxCount":3},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":3},{"itemHrid":"/items/aqua_essence","dropRate":0.4,"minCount":3,"maxCount":9},{"itemHrid":"/items/pierce","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/novice_sorcerer":{"hrid":"/combat_monsters/novice_sorcerer","name":"Novice Sorcerer","combatDetails":{"currentHitpoints":500,"maxHitpoints":500,"currentManapoints":700,"maxManapoints":700,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":10,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":10,"magicMaxDamage":50,"stabEvasionRating":30,"slashEvasionRating":30,"smashEvasionRating":30,"rangedEvasionRating":30,"totalArmor":4,"totalWaterResistance":44,"totalNatureResistance":44,"totalFireResistance":44,"staminaLevel":40,"intelligenceLevel":60,"attackLevel":0,"powerLevel":0,"defenseLevel":20,"rangedLevel":0,"magicLevel":40,"combatStats":{"combatStyleHrids":["/combat_styles/magic"],"damageType":"/damage_types/water","attackInterval":7000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0.1,"natureAmplify":0,"fireAmplify":0.1,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":30,"natureResistance":30,"fireResistance":30,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/water_strike","level":10},{"abilityHrid":"/abilities/fireball","level":10}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":60,"maxCount":300},{"itemHrid":"/items/plum","dropRate":0.1,"minCount":1,"maxCount":3},{"itemHrid":"/items/linen_fabric","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/sorcerers_sole","dropRate":0.0005,"minCount":1,"maxCount":1},{"itemHrid":"/items/sorcerer_essence","dropRate":0.2,"minCount":1,"maxCount":3},{"itemHrid":"/items/water_strike","dropRate":0.008,"minCount":1,"maxCount":1},{"itemHrid":"/items/fireball","dropRate":0.008,"minCount":1,"maxCount":1}]},"/combat_monsters/panda":{"hrid":"/combat_monsters/panda","name":"Panda","combatDetails":{"currentHitpoints":1600,"maxHitpoints":1600,"currentManapoints":1600,"maxManapoints":1600,"stabAccuracyRating":140,"slashAccuracyRating":140,"smashAccuracyRating":140,"rangedAccuracyRating":10,"stabMaxDamage":140,"slashMaxDamage":140,"smashMaxDamage":140,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":140,"slashEvasionRating":140,"smashEvasionRating":182,"rangedEvasionRating":140,"totalArmor":38,"totalWaterResistance":33,"totalNatureResistance":33,"totalFireResistance":13,"staminaLevel":150,"intelligenceLevel":150,"attackLevel":130,"powerLevel":130,"defenseLevel":130,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":3500000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0.3,"rangedEvasion":0,"armor":12,"waterResistance":20,"natureResistance":20,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/toughness","level":10}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":340,"maxCount":1700},{"itemHrid":"/items/beast_hide","dropRate":1,"minCount":1,"maxCount":2},{"itemHrid":"/items/bamboo_branch","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/wheat","dropRate":0.3,"minCount":1,"maxCount":15},{"itemHrid":"/items/egg","dropRate":0.3,"minCount":1,"maxCount":15},{"itemHrid":"/items/peach","dropRate":0.1,"minCount":1,"maxCount":5},{"itemHrid":"/items/dragon_fruit","dropRate":0.15,"minCount":1,"maxCount":5},{"itemHrid":"/items/star_fruit","dropRate":0.05,"minCount":1,"maxCount":5},{"itemHrid":"/items/green_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/red_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/emp_tea_leaf","dropRate":0.15,"minCount":1,"maxCount":1},{"itemHrid":"/items/panda_fluff","dropRate":0.002,"minCount":1,"maxCount":1},{"itemHrid":"/items/bear_essence","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/toughness","dropRate":0.002,"minCount":1,"maxCount":1}]},"/combat_monsters/polar_bear":{"hrid":"/combat_monsters/polar_bear","name":"Polar Bear","combatDetails":{"currentHitpoints":1500,"maxHitpoints":1500,"currentManapoints":1500,"maxManapoints":1500,"stabAccuracyRating":170,"slashAccuracyRating":170,"smashAccuracyRating":170,"rangedAccuracyRating":10,"stabMaxDamage":170,"slashMaxDamage":170,"smashMaxDamage":170,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":140,"slashEvasionRating":140,"smashEvasionRating":182,"rangedEvasionRating":140,"totalArmor":26,"totalWaterResistance":33,"totalNatureResistance":33,"totalFireResistance":13,"staminaLevel":140,"intelligenceLevel":140,"attackLevel":160,"powerLevel":160,"defenseLevel":130,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":3000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0.3,"rangedEvasion":0,"armor":0,"waterResistance":20,"natureResistance":20,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/frenzy","level":10}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":440,"maxCount":2200},{"itemHrid":"/items/beast_hide","dropRate":1,"minCount":1,"maxCount":3},{"itemHrid":"/items/crimson_milk","dropRate":0.1,"minCount":1,"maxCount":4},{"itemHrid":"/items/rainbow_milk","dropRate":0.15,"minCount":1,"maxCount":4},{"itemHrid":"/items/holy_milk","dropRate":0.05,"minCount":1,"maxCount":4},{"itemHrid":"/items/moolong_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/red_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/emp_tea_leaf","dropRate":0.15,"minCount":1,"maxCount":1},{"itemHrid":"/items/polar_bear_fluff","dropRate":0.002,"minCount":1,"maxCount":1},{"itemHrid":"/items/bear_essence","dropRate":0.3,"minCount":1,"maxCount":5},{"itemHrid":"/items/frenzy","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/porcupine":{"hrid":"/combat_monsters/porcupine","name":"Porcupine","combatDetails":{"currentHitpoints":100,"maxHitpoints":100,"currentManapoints":100,"maxManapoints":100,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":20,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":20,"magicMaxDamage":10,"stabEvasionRating":18,"slashEvasionRating":18,"smashEvasionRating":18,"rangedEvasionRating":18,"totalArmor":1.6,"totalWaterResistance":0.8,"totalNatureResistance":0.8,"totalFireResistance":0.8,"staminaLevel":0,"intelligenceLevel":0,"attackLevel":0,"powerLevel":0,"defenseLevel":8,"rangedLevel":10,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/ranged"],"damageType":"/damage_types/physical","attackInterval":3000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/quick_shot","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":16,"maxCount":80},{"itemHrid":"/items/rough_hide","dropRate":1,"minCount":1,"maxCount":2},{"itemHrid":"/items/cotton","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/green_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":3},{"itemHrid":"/items/quick_shot","dropRate":0.005,"minCount":1,"maxCount":1}]},"/combat_monsters/rat":{"hrid":"/combat_monsters/rat","name":"Jerry","combatDetails":{"currentHitpoints":60,"maxHitpoints":60,"currentManapoints":100,"maxManapoints":100,"stabAccuracyRating":14,"slashAccuracyRating":14,"smashAccuracyRating":14,"rangedAccuracyRating":10,"stabMaxDamage":14,"slashMaxDamage":14,"smashMaxDamage":14,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":14,"slashEvasionRating":14,"smashEvasionRating":14,"rangedEvasionRating":14,"totalArmor":0.8,"totalWaterResistance":0.4,"totalNatureResistance":0.4,"totalFireResistance":0.4,"staminaLevel":-4,"intelligenceLevel":0,"attackLevel":4,"powerLevel":4,"defenseLevel":4,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/stab"],"damageType":"/damage_types/physical","attackInterval":3500000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/poke","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":10,"maxCount":50},{"itemHrid":"/items/rough_hide","dropRate":1,"minCount":1,"maxCount":1},{"itemHrid":"/items/wheat","dropRate":0.3,"minCount":1,"maxCount":3},{"itemHrid":"/items/sugar","dropRate":0.3,"minCount":1,"maxCount":6},{"itemHrid":"/items/cheese","dropRate":0.2,"minCount":1,"maxCount":1},{"itemHrid":"/items/verdant_cheese","dropRate":0.1,"minCount":1,"maxCount":1},{"itemHrid":"/items/azure_cheese","dropRate":0.05,"minCount":1,"maxCount":1},{"itemHrid":"/items/poke","dropRate":0.005,"minCount":1,"maxCount":1}]},"/combat_monsters/sea_snail":{"hrid":"/combat_monsters/sea_snail","name":"Gary","combatDetails":{"currentHitpoints":350,"maxHitpoints":350,"currentManapoints":350,"maxManapoints":350,"stabAccuracyRating":32,"slashAccuracyRating":32,"smashAccuracyRating":32,"rangedAccuracyRating":10,"stabMaxDamage":32,"slashMaxDamage":32,"smashMaxDamage":32,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":38,"slashEvasionRating":53.199999999999996,"smashEvasionRating":30.400000000000002,"rangedEvasionRating":38,"totalArmor":5.6000000000000005,"totalWaterResistance":52.8,"totalNatureResistance":2.8000000000000003,"totalFireResistance":52.8,"staminaLevel":25,"intelligenceLevel":25,"attackLevel":22,"powerLevel":22,"defenseLevel":28,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":4000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0.4,"smashEvasion":-0.2,"rangedEvasion":0,"armor":0,"waterResistance":50,"natureResistance":0,"fireResistance":50,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/toughness","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":56,"maxCount":280},{"itemHrid":"/items/wheat","dropRate":0.3,"minCount":1,"maxCount":10},{"itemHrid":"/items/snail_shell","dropRate":0.006,"minCount":1,"maxCount":1},{"itemHrid":"/items/green_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/black_tea_leaf","dropRate":0.4,"minCount":1,"maxCount":2},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/aqua_essence","dropRate":0.3,"minCount":1,"maxCount":2},{"itemHrid":"/items/toughness","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/skunk":{"hrid":"/combat_monsters/skunk","name":"Skunk","combatDetails":{"currentHitpoints":80,"maxHitpoints":80,"currentManapoints":100,"maxManapoints":100,"stabAccuracyRating":18,"slashAccuracyRating":18,"smashAccuracyRating":18,"rangedAccuracyRating":10,"stabMaxDamage":18,"slashMaxDamage":18,"smashMaxDamage":18,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":18,"slashEvasionRating":18,"smashEvasionRating":18,"rangedEvasionRating":18,"totalArmor":1.6,"totalWaterResistance":0.8,"totalNatureResistance":0.8,"totalFireResistance":0.8,"staminaLevel":-2,"intelligenceLevel":0,"attackLevel":8,"powerLevel":8,"defenseLevel":8,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/slash"],"damageType":"/damage_types/physical","attackInterval":3500000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/scratch","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":14,"maxCount":70},{"itemHrid":"/items/rough_hide","dropRate":1,"minCount":1,"maxCount":2},{"itemHrid":"/items/blueberry","dropRate":0.2,"minCount":1,"maxCount":5},{"itemHrid":"/items/green_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":3},{"itemHrid":"/items/scratch","dropRate":0.005,"minCount":1,"maxCount":1}]},"/combat_monsters/slimy":{"hrid":"/combat_monsters/slimy","name":"Slimy","combatDetails":{"currentHitpoints":120,"maxHitpoints":120,"currentManapoints":200,"maxManapoints":200,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":10,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":10,"magicMaxDamage":22,"stabEvasionRating":20,"slashEvasionRating":20,"smashEvasionRating":20,"rangedEvasionRating":20,"totalArmor":2,"totalWaterResistance":4.6,"totalNatureResistance":4.6,"totalFireResistance":4.6,"staminaLevel":2,"intelligenceLevel":10,"attackLevel":0,"powerLevel":0,"defenseLevel":10,"rangedLevel":0,"magicLevel":12,"combatStats":{"combatStyleHrids":["/combat_styles/magic"],"damageType":"/damage_types/water","attackInterval":6000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/water_strike","level":1},{"abilityHrid":"/abilities/minor_heal","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":20,"maxCount":100},{"itemHrid":"/items/apple","dropRate":0.2,"minCount":1,"maxCount":4},{"itemHrid":"/items/green_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":4},{"itemHrid":"/items/water_strike","dropRate":0.005,"minCount":1,"maxCount":1},{"itemHrid":"/items/minor_heal","dropRate":0.005,"minCount":1,"maxCount":1}]},"/combat_monsters/snake":{"hrid":"/combat_monsters/snake","name":"Thnake","combatDetails":{"currentHitpoints":200,"maxHitpoints":200,"currentManapoints":200,"maxManapoints":200,"stabAccuracyRating":24,"slashAccuracyRating":24,"smashAccuracyRating":24,"rangedAccuracyRating":10,"stabMaxDamage":26,"slashMaxDamage":26,"smashMaxDamage":26,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":28,"slashEvasionRating":19.599999999999998,"smashEvasionRating":28,"rangedEvasionRating":28,"totalArmor":3.6,"totalWaterResistance":1.8,"totalNatureResistance":1.8,"totalFireResistance":1.8,"staminaLevel":10,"intelligenceLevel":10,"attackLevel":14,"powerLevel":16,"defenseLevel":18,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/stab"],"damageType":"/damage_types/physical","attackInterval":3200000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":-0.3,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/poke","level":5}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":32,"maxCount":160},{"itemHrid":"/items/reptile_hide","dropRate":1,"minCount":1,"maxCount":1},{"itemHrid":"/items/egg","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/snake_fang","dropRate":0.04,"minCount":1,"maxCount":1},{"itemHrid":"/items/swamp_essence","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/poke","dropRate":0.008,"minCount":1,"maxCount":1}]},"/combat_monsters/stalactite_golem":{"hrid":"/combat_monsters/stalactite_golem","name":"Stalactite Golem","combatDetails":{"currentHitpoints":1600,"maxHitpoints":1600,"currentManapoints":1600,"maxManapoints":1600,"stabAccuracyRating":230,"slashAccuracyRating":230,"smashAccuracyRating":230,"rangedAccuracyRating":10,"stabMaxDamage":160,"slashMaxDamage":160,"smashMaxDamage":160,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":260,"slashEvasionRating":260,"smashEvasionRating":208,"rangedEvasionRating":364,"totalArmor":50,"totalWaterResistance":105,"totalNatureResistance":55,"totalFireResistance":105,"staminaLevel":150,"intelligenceLevel":150,"attackLevel":220,"powerLevel":150,"defenseLevel":250,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/stab"],"damageType":"/damage_types/physical","attackInterval":2800000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":-0.2,"rangedEvasion":0.4,"armor":0,"waterResistance":80,"natureResistance":30,"fireResistance":80,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0.2,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/toughness","level":20},{"abilityHrid":"/abilities/spike_shell","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":600,"maxCount":3000},{"itemHrid":"/items/red_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/emp_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/stalactite_shard","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/golem_essence","dropRate":0.3,"minCount":2,"maxCount":6},{"itemHrid":"/items/toughness","dropRate":0.0025,"minCount":1,"maxCount":1},{"itemHrid":"/items/spike_shell","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/swampy":{"hrid":"/combat_monsters/swampy","name":"Swampy","combatDetails":{"currentHitpoints":260,"maxHitpoints":260,"currentManapoints":260,"maxManapoints":260,"stabAccuracyRating":28,"slashAccuracyRating":28,"smashAccuracyRating":28,"rangedAccuracyRating":10,"stabMaxDamage":26,"slashMaxDamage":26,"smashMaxDamage":26,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":32,"slashEvasionRating":32,"smashEvasionRating":22.4,"rangedEvasionRating":32,"totalArmor":4.4,"totalWaterResistance":2.2,"totalNatureResistance":2.2,"totalFireResistance":2.2,"staminaLevel":16,"intelligenceLevel":16,"attackLevel":18,"powerLevel":16,"defenseLevel":22,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":3000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":-0.3,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/sweep","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":44,"maxCount":220},{"itemHrid":"/items/cocoon","dropRate":0.3,"minCount":1,"maxCount":1},{"itemHrid":"/items/blueberry","dropRate":0.3,"minCount":1,"maxCount":6},{"itemHrid":"/items/blackberry","dropRate":0.15,"minCount":1,"maxCount":4},{"itemHrid":"/items/apple","dropRate":0.1,"minCount":1,"maxCount":5},{"itemHrid":"/items/orange","dropRate":0.05,"minCount":1,"maxCount":3},{"itemHrid":"/items/green_tea_leaf","dropRate":0.4,"minCount":1,"maxCount":4},{"itemHrid":"/items/black_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":4},{"itemHrid":"/items/swamp_essence","dropRate":0.4,"minCount":3,"maxCount":9},{"itemHrid":"/items/sweep","dropRate":0.002,"minCount":1,"maxCount":1}]},"/combat_monsters/treant":{"hrid":"/combat_monsters/treant","name":"Treant","combatDetails":{"currentHitpoints":900,"maxHitpoints":900,"currentManapoints":900,"maxManapoints":900,"stabAccuracyRating":10,"slashAccuracyRating":10,"smashAccuracyRating":10,"rangedAccuracyRating":10,"stabMaxDamage":10,"slashMaxDamage":10,"smashMaxDamage":10,"rangedMaxDamage":10,"magicMaxDamage":70,"stabEvasionRating":70,"slashEvasionRating":70,"smashEvasionRating":70,"rangedEvasionRating":70,"totalArmor":22,"totalWaterResistance":74,"totalNatureResistance":74,"totalFireResistance":24,"staminaLevel":80,"intelligenceLevel":80,"attackLevel":0,"powerLevel":0,"defenseLevel":60,"rangedLevel":0,"magicLevel":60,"combatStats":{"combatStyleHrids":["/combat_styles/magic"],"damageType":"/damage_types/nature","attackInterval":5000000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0.3,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":10,"waterResistance":50,"natureResistance":50,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/entangle","level":10},{"abilityHrid":"/abilities/toxic_pollen","level":5}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":160,"maxCount":800},{"itemHrid":"/items/jungle_essence","dropRate":0.4,"minCount":2,"maxCount":6},{"itemHrid":"/items/log","dropRate":0.25,"minCount":1,"maxCount":5},{"itemHrid":"/items/birch_log","dropRate":0.25,"minCount":1,"maxCount":5},{"itemHrid":"/items/cedar_log","dropRate":0.125,"minCount":1,"maxCount":5},{"itemHrid":"/items/ginkgo_log","dropRate":0.06,"minCount":1,"maxCount":5},{"itemHrid":"/items/purpleheart_log","dropRate":0.03,"minCount":1,"maxCount":5},{"itemHrid":"/items/redwood_log","dropRate":0.015,"minCount":1,"maxCount":5},{"itemHrid":"/items/arcane_log","dropRate":0.01,"minCount":1,"maxCount":5},{"itemHrid":"/items/bamboo_branch","dropRate":0.1,"minCount":1,"maxCount":5},{"itemHrid":"/items/entangle","dropRate":0.01,"minCount":1,"maxCount":1},{"itemHrid":"/items/toxic_pollen","dropRate":0.001,"minCount":1,"maxCount":1}]},"/combat_monsters/turtle":{"hrid":"/combat_monsters/turtle","name":"Turuto","combatDetails":{"currentHitpoints":700,"maxHitpoints":700,"currentManapoints":600,"maxManapoints":600,"stabAccuracyRating":50,"slashAccuracyRating":50,"smashAccuracyRating":50,"rangedAccuracyRating":10,"stabMaxDamage":65,"slashMaxDamage":65,"smashMaxDamage":65,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":65,"slashEvasionRating":91,"smashEvasionRating":52,"rangedEvasionRating":65,"totalArmor":11,"totalWaterResistance":55.5,"totalNatureResistance":5.5,"totalFireResistance":55.5,"staminaLevel":60,"intelligenceLevel":50,"attackLevel":40,"powerLevel":55,"defenseLevel":55,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/smash"],"damageType":"/damage_types/physical","attackInterval":3500000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0.4,"smashEvasion":-0.2,"rangedEvasion":0,"armor":0,"waterResistance":50,"natureResistance":0,"fireResistance":50,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/toughness","level":10}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":120,"maxCount":600},{"itemHrid":"/items/reptile_hide","dropRate":1,"minCount":1,"maxCount":4},{"itemHrid":"/items/egg","dropRate":0.2,"minCount":1,"maxCount":10},{"itemHrid":"/items/orange","dropRate":0.1,"minCount":1,"maxCount":4},{"itemHrid":"/items/plum","dropRate":0.15,"minCount":1,"maxCount":5},{"itemHrid":"/items/peach","dropRate":0.05,"minCount":1,"maxCount":3},{"itemHrid":"/items/turtle_shell","dropRate":0.004,"minCount":1,"maxCount":1},{"itemHrid":"/items/aqua_essence","dropRate":0.4,"minCount":2,"maxCount":6},{"itemHrid":"/items/toughness","dropRate":0.0015,"minCount":1,"maxCount":1}]},"/combat_monsters/vampire":{"hrid":"/combat_monsters/vampire","name":"Vampire","combatDetails":{"currentHitpoints":2200,"maxHitpoints":2200,"currentManapoints":2200,"maxManapoints":2200,"stabAccuracyRating":260,"slashAccuracyRating":260,"smashAccuracyRating":260,"rangedAccuracyRating":10,"stabMaxDamage":210,"slashMaxDamage":210,"smashMaxDamage":210,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":180,"slashEvasionRating":180,"smashEvasionRating":180,"rangedEvasionRating":180,"totalArmor":34,"totalWaterResistance":77,"totalNatureResistance":77,"totalFireResistance":77,"staminaLevel":210,"intelligenceLevel":210,"attackLevel":250,"powerLevel":200,"defenseLevel":170,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/stab"],"damageType":"/damage_types/physical","attackInterval":2800000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":60,"natureResistance":60,"fireResistance":60,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0.02,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/vampirism","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":600,"maxCount":3000},{"itemHrid":"/items/umbral_hide","dropRate":1,"minCount":1,"maxCount":2},{"itemHrid":"/items/red_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/emp_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/vampire_fang","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/twilight_essence","dropRate":0.3,"minCount":2,"maxCount":6},{"itemHrid":"/items/vampirism","dropRate":0.0008,"minCount":1,"maxCount":1}]},"/combat_monsters/veyes":{"hrid":"/combat_monsters/veyes","name":"Veyes","combatDetails":{"currentHitpoints":1230,"maxHitpoints":1230,"currentManapoints":1230,"maxManapoints":1230,"stabAccuracyRating":123,"slashAccuracyRating":123,"smashAccuracyRating":123,"rangedAccuracyRating":10,"stabMaxDamage":123,"slashMaxDamage":123,"smashMaxDamage":123,"rangedMaxDamage":10,"magicMaxDamage":123,"stabEvasionRating":92.25,"slashEvasionRating":123,"smashEvasionRating":123,"rangedEvasionRating":92.25,"totalArmor":22.6,"totalWaterResistance":45.2,"totalNatureResistance":45.2,"totalFireResistance":45.2,"staminaLevel":113,"intelligenceLevel":113,"attackLevel":113,"powerLevel":113,"defenseLevel":113,"rangedLevel":0,"magicLevel":113,"combatStats":{"combatStyleHrids":["/combat_styles/slash"],"damageType":"/damage_types/physical","attackInterval":2800000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":-0.25,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":-0.25,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/precision","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":280,"maxCount":1400},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/moolong_tea_leaf","dropRate":0.15,"minCount":1,"maxCount":2},{"itemHrid":"/items/red_tea_leaf","dropRate":0.1,"minCount":1,"maxCount":2},{"itemHrid":"/items/magnifying_glass","dropRate":0.0005,"minCount":1,"maxCount":1},{"itemHrid":"/items/eyessence","dropRate":0.4,"minCount":5,"maxCount":5},{"itemHrid":"/items/precision","dropRate":0.002,"minCount":1,"maxCount":1}]},"/combat_monsters/werewolf":{"hrid":"/combat_monsters/werewolf","name":"Werewolf","combatDetails":{"currentHitpoints":2500,"maxHitpoints":2500,"currentManapoints":2500,"maxManapoints":2500,"stabAccuracyRating":240,"slashAccuracyRating":240,"smashAccuracyRating":240,"rangedAccuracyRating":10,"stabMaxDamage":240,"slashMaxDamage":240,"smashMaxDamage":240,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":170,"slashEvasionRating":170,"smashEvasionRating":170,"rangedEvasionRating":170,"totalArmor":32,"totalWaterResistance":76,"totalNatureResistance":76,"totalFireResistance":76,"staminaLevel":240,"intelligenceLevel":240,"attackLevel":230,"powerLevel":230,"defenseLevel":160,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/slash"],"damageType":"/damage_types/physical","attackInterval":2800000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":60,"natureResistance":60,"fireResistance":60,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/berserk","level":10},{"abilityHrid":"/abilities/maim","level":10}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":750,"maxCount":3750},{"itemHrid":"/items/umbral_hide","dropRate":1,"minCount":1,"maxCount":2},{"itemHrid":"/items/red_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/emp_tea_leaf","dropRate":0.2,"minCount":1,"maxCount":2},{"itemHrid":"/items/werewolf_claw","dropRate":0.001,"minCount":1,"maxCount":1},{"itemHrid":"/items/twilight_essence","dropRate":0.3,"minCount":3,"maxCount":9},{"itemHrid":"/items/berserk","dropRate":0.002,"minCount":1,"maxCount":1},{"itemHrid":"/items/maim","dropRate":0.0008,"minCount":1,"maxCount":1}]},"/combat_monsters/zombie":{"hrid":"/combat_monsters/zombie","name":"Zombie","combatDetails":{"currentHitpoints":1800,"maxHitpoints":1800,"currentManapoints":1800,"maxManapoints":1800,"stabAccuracyRating":190,"slashAccuracyRating":190,"smashAccuracyRating":190,"rangedAccuracyRating":10,"stabMaxDamage":200,"slashMaxDamage":200,"smashMaxDamage":200,"rangedMaxDamage":10,"magicMaxDamage":10,"stabEvasionRating":160,"slashEvasionRating":160,"smashEvasionRating":160,"rangedEvasionRating":160,"totalArmor":30,"totalWaterResistance":15,"totalNatureResistance":15,"totalFireResistance":15,"staminaLevel":170,"intelligenceLevel":170,"attackLevel":180,"powerLevel":190,"defenseLevel":150,"rangedLevel":0,"magicLevel":0,"combatStats":{"combatStyleHrids":["/combat_styles/slash"],"damageType":"/damage_types/physical","attackInterval":3200000000,"stabAccuracy":0,"slashAccuracy":0,"smashAccuracy":0,"rangedAccuracy":0,"stabDamage":0,"slashDamage":0,"smashDamage":0,"rangedDamage":0,"magicDamage":0,"physicalAmplify":0,"waterAmplify":0,"natureAmplify":0,"fireAmplify":0,"healingAmplify":0,"stabEvasion":0,"slashEvasion":0,"smashEvasion":0,"rangedEvasion":0,"armor":0,"waterResistance":0,"natureResistance":0,"fireResistance":0,"maxHitpoints":0,"maxManapoints":0,"lifeSteal":0,"HPRegen":0.01,"MPRegen":0.01,"physicalReflectPower":0,"dropRate":0,"dropQuantity":0,"experienceRate":0,"foodSlots":0,"drinkSlots":0}},"abilities":[{"abilityHrid":"/abilities/toughness","level":10},{"abilityHrid":"/abilities/maim","level":1}],"dropTable":[{"itemHrid":"/items/coin","dropRate":1,"minCount":500,"maxCount":2500},{"itemHrid":"/items/green_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":5},{"itemHrid":"/items/black_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":5},{"itemHrid":"/items/burble_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/moolong_tea_leaf","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/red_tea_leaf","dropRate":0.4,"minCount":1,"maxCount":3},{"itemHrid":"/items/emp_tea_leaf","dropRate":0.4,"minCount":1,"maxCount":3},{"itemHrid":"/items/twilight_essence","dropRate":0.3,"minCount":1,"maxCount":4},{"itemHrid":"/items/toughness","dropRate":0.002,"minCount":1,"maxCount":1},{"itemHrid":"/items/maim","dropRate":0.0005,"minCount":1,"maxCount":1}]}}');

/***/ }),

/***/ "./src/combatsimulator/data/combatTriggerDependencyDetailMap.json":
/*!************************************************************************!*\
  !*** ./src/combatsimulator/data/combatTriggerDependencyDetailMap.json ***!
  \************************************************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"/combat_trigger_dependencies/all_allies":{"hrid":"/combat_trigger_dependencies/all_allies","name":"Allies\' Total","isSingleTarget":false,"isMultiTarget":true,"sortIndex":5},"/combat_trigger_dependencies/all_enemies":{"hrid":"/combat_trigger_dependencies/all_enemies","name":"Enemies\' Total","isSingleTarget":false,"isMultiTarget":true,"sortIndex":4},"/combat_trigger_dependencies/self":{"hrid":"/combat_trigger_dependencies/self","name":"My","isSingleTarget":true,"isMultiTarget":false,"sortIndex":1},"/combat_trigger_dependencies/targeted_ally":{"hrid":"/combat_trigger_dependencies/targeted_ally","name":"Target Ally\'s","isSingleTarget":true,"isMultiTarget":false,"sortIndex":3},"/combat_trigger_dependencies/targeted_enemy":{"hrid":"/combat_trigger_dependencies/targeted_enemy","name":"Target Enemy\'s","isSingleTarget":true,"isMultiTarget":false,"sortIndex":2}}');

/***/ }),

/***/ "./src/combatsimulator/data/enhancementLevelTotalMultiplierTable.json":
/*!****************************************************************************!*\
  !*** ./src/combatsimulator/data/enhancementLevelTotalMultiplierTable.json ***!
  \****************************************************************************/
/***/ ((module) => {

module.exports = JSON.parse('[0,1,2.1,3.3,4.6,6,7.5,9.1,10.8,12.600000000000001,14.500000000000002,16.5,18.6,20.8,23.1,25.5,28,30.6,33.300000000000004,36.1,39]');

/***/ }),

/***/ "./src/combatsimulator/data/itemDetailMap.json":
/*!*****************************************************!*\
  !*** ./src/combatsimulator/data/itemDetailMap.json ***!
  \*****************************************************/
/***/ ((module) => {


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_heap-js_dist_heap-js_es5_js"], () => (__webpack_require__("./src/worker.js")))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"src_worker_js": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkmwicombatsimulator"] = self["webpackChunkmwicombatsimulator"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("vendors-node_modules_heap-js_dist_heap-js_es5_js").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;
//# sourceMappingURL=src_worker_js.bundle.js.map