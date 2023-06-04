console.log("Brute", args);
const version = "10.0.0"
try {
    if (args[0].hitTargets.length < 1) return {};
    token = canvas.tokens.get(args[0].tokenId);
    actor = token.actor;
    if (!actor || !token || args[0].hitTargets.length < 1) return {};
    let npcProf = actor.system.attributes.prof;
    let target = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargers[0]._id);
    if (!target) MidiQOL.error("Fanatic Advantage macro failed");

    if (game.combat) {
        const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;
        const lastTime = actor.getFlag("midi-qol", "fanaticAdvantageTime");
        if (combatTime === lastTime) {
            MidiQOL.warn("Fanatic Advantage Damage: Already done a fanatic advantage this turn");
            return {};
        }
    }
    let foundEnemy = true;
    let isAdvantage = args[0].advantage;

    if (!isAdvantage) {
        MidiQOL.warn("Fanatic Advantage Damage: No advantage to target");
        return {};
    }

    if (game.combat) {
        const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;
        const lastTime = actor.getFlag("midi-qol", "fanaticAdvantageTime");
        if (combatTime !== lastTime) {
            await actor.setFlag("midi-qol", "fanaticAdvantageTime", combatTime)
        }
    }

    const damageFormula = new CONFIG.Dice.DamageRoll(`${npcProf}d6`, {}, {
        critical: args[0].isCritical ?? false,
        powerfulCritical: game.settings.get("dnd5e", "criticalDamageMaxDice"),
        multiplyNumeric: game.settings.get("dnd5e", "criticalDamageModifiers")
    }).formula
    // How to check that we've already done one this turn?
    return { damageRoll: damageFormula, flavor: "Fanatic Advantage" };
   

} catch (e) {
    console.error(`${args[0].itemData.name} - Fanatic Advantage ${version}`, err);
}