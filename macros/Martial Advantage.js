const version = "10.0.33"
try {
    if (!["mwak", "rwak"].includes(args[0].itemData.system.actionType)) return {}; // weapon attack
    if (args[0].itemData.system.actionType === "mwak" && !args[0].itemData.system.properties?.fin)
        if (args[0].hitTargets.length < 1) return {};
    token = canvas.tokens.get(args[0].tokenId);
    actor = token.actor;
    if (!actor || !token || args[0].hitTargets.length < 1) return {};
    const npcProf = actor.system.attributes.prof;
    if (!rogueLevels) {
        MidiQOL.warn("Martial Advantage Damage: Trying to do martial advantage and not a prof");
        return {}; // rogue only
    }
    let target = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargers[0]._id);
    if (!target) MidiQOL.error("Martial Advantage macro failed");

    if (game.combat) {
        const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;
        const lastTime = actor.getFlag("midi-qol", "martialAdvantageTime");
        if (combatTime === lastTime) {
            MidiQOL.warn("Martial Advantage Damage: Already done a martial advantage this turn");
            return {};
        }
    }
    let foundEnemy = true;
    let isSneak = true;

    if (!isSneak) {
        foundEnemy = false;
        let nearbyEnemy = canvas.tokens.placeables.filter(t => {
            let nearby = (t.actor &&
                t.actor?.id !== args[0].actor._id && // not me
                t.id !== target.id && // not the target
                t.actor?.system.attributes?.hp?.value > 0 && // not incapacitated
                t.document.disposition !== target.document.disposition && // not an ally
                MidiQOL.getDistance(t, target, false) <= 5 // close to the target
            );
            foundEnemy = foundEnemy || (nearby && t.document.disposition === -target.document.disposition)
            return nearby;
        });
        isSneak = nearbyEnemy.length > 0;
    }
    if (!isSneak) {
        MidiQOL.warn("Martial Advantage Damage: No advantage/ally next to target");
        return {};
    }
    let useSneak = true;
    if (!useSneak) {
        let dialog = new Promise((resolve, reject) => {
            new Dialog({
                // localize this text
                title: "Conditional Damage",
                content: `<p>Use Martial Advantage?</p>` + (!foundEnemy ? "<p>Only Nuetral creatures nearby</p>" : ""),
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Confirm",
                        callback: () => resolve(true)
                    },
                    two: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => { resolve(false) }
                    }
                },
                default: "two"
            }).render(true);
        });
        useSneak = await dialog;
    }
    if (!useSneak) return {}
    const baseDice = npcProf;
    if (game.combat) {
        const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;
        const lastTime = actor.getFlag("midi-qol", "martialAdvantageTime");
        if (combatTime !== lastTime) {
            await actor.setFlag("midi-qol", "martialAdvantageTime", combatTime)
        }
    }
    const damageFormula = new CONFIG.Dice.DamageRoll(`${baseDice}d6`, {}, {
        critical: args[0].isCritical ?? false,
        powerfulCritical: game.settings.get("dnd5e", "criticalDamageMaxDice"),
        multiplyNumeric: game.settings.get("dnd5e", "criticalDamageModifiers")
    }).formula
    // How to check that we've already done one this turn?
    return { damageRoll: damageFormula, flavor: "Martial Advantage" };
} catch (err) {
    console.error(`${args[0].itemData.name} - Martial Advantage ${version}`, err);
}