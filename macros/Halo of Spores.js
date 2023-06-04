//version 10.0.5
//console.log("halo od Spores", args);
let lastArg = args[args.length - 1];

if (args[0] == 'on' || args[0] == 'each') {
    let tokenTarget = await fromUuid(lastArg.tokenUuid);
    let actorTarget = tokenTarget.actor;
    let tokenOrigin = await canvas.tokens.get(args[1]);
    
    if (tokenOrigin.actor == actorTarget) return;
    if (tokenOrigin.actor.flags['midi-qol'].actions.reaction) return;
    let spores = tokenOrigin.actor.system.scale["circle-of-spores"]["halo-of-spores"];
    if (!spores) return;
    let hasSimbiotic = tokenOrigin.actor.effects.find(x => x.label == 'Symbiotic Entity');
    let simbioticHp = tokenOrigin.actor.system.attributes.hp.temp ?? 0;

    let damage = spores.formula;
    if (hasSimbiotic && simbioticHp >= 1) {
        damage = `${spores.number * 2}d${spores.faces}`;
    }
    
    let whispers = game.users.filter(u => u.character == tokenOrigin.actor).map(x => x.id);

    await Requestor.request({
        img: lastArg.efData.img,
        title: lastArg.efData.label,
        description: `<center><p>Usando Sua Reação, deseja usar seus esporos em: </p><div><img src="${tokenTarget.texture.src}" width="48" height="48" /> <h4>${tokenTarget.name}</h4></div></center>`,
        //context: { popout: true, autoClose: true },
        limit: Requestor.LIMIT.OPTION,
        //speaker: ChatMessage.getSpeaker(),
        whisper: whispers,
        buttonData: [{
            label: "Usar Reação",
            damage: damage,
            origin: tokenOrigin.id,
            tokenTarget: tokenTarget.id,
            dataLabel: lastArg.efData.label,
            action: async () => {
                let tokenOrigin = await canvas.tokens.get(this.origin);
                let tokenTarget = await canvas.tokens.get(this.tokenTarget);

                let result = await tokenTarget.actor.rollAbilitySave('con');
                if (result.total < tokenOrigin.actor.system.attributes.spelldc) {
                    let damageRoll = await new Roll(this.damage).roll({ async: true });
                    new MidiQOL.DamageOnlyWorkflow(tokenOrigin.actor, tokenOrigin, damageRoll.total, "necrotic", tokenTarget ? [tokenTarget] : [], damageRoll, { flavor: "Halo of Spores - Damage Roll (Necrotic)" });
                    tokenOrigin.actor.setFlag('midi-qol', 'actions', {
                        "reactionCombatRound": game.combat.round,
                        "reaction": true
                    });
                    await game.dfreds.effectInterface.addEffect({
                        effectName: 'Reaction', uuid: tokenOrigin.actor.uuid
                    });
                }
            }
        }, {
            label: "Ignorar",
            action: async () => { }
        }]
    });

}
