if (args[0] === "on") {
	const sporesSwirl = "jb2a.particles.swirl.greenyellow.01.01";
	const leavesSwirl = "jb2a.swirling_leaves.loop.02.green";
	const lastArg = args[args.length - 1];
	const actor = game.actors.get(lastArg.actorId);
	const spreadingSporesEffect = lastArg.efData.document;
	const symbioticEntityEffect = actor.effects.find(e => e.data.label === "Symbiotic Entity");
	const config = { size: 2, interval: 1, icon: lastArg.efData.icon, rememberControlled: true };
	const position = await warpgate.crosshairs.show(config);

	if (!symbioticEntityEffect) return ui.notifications.warn("Your Symbiotic Entity feature isn't active.");

	new Sequence()
		.effect()
		.file(sporesSwirl)
		.atLocation(position)
		.size(2.4, { gridUnits: true })
		.persist()
		.fadeIn(2000)
		.fadeOut(2000)
		.tieToDocuments(spreadingSporesEffect)
		.effect()
		.file(leavesSwirl)
		.atLocation(position)
		.size(2.4, { gridUnits: true })
		.persist()
		.fadeIn(2000)
		.fadeOut(2000)
		.tieToDocuments(spreadingSporesEffect)
		.play()
}

//Enter in Template
console.log("Spreading Spores Damage ENTER", this);

let originItem = await fromUuid(template.flags['midi-qol'].originUuid);
let actorOrigin = originItem.actor;

let spores = actorOrigin.system.scale["circle-of-spores"]["halo-of-spores"];
if (!spores) return;
let damage = spores.formula;
let hasSimbiotic = actorOrigin.effects.find(x => x.label == 'Symbiotic Entity');
let simbioticHp = actorOrigin.system.attributes.hp.temp ?? 0;
console.log("Spreading Spores Simbiotic", actorOrigin, hasSimbiotic, simbioticHp);
if (!hasSimbiotic || simbioticHp < 1) return;
console.log("Spreading Spores Simbiotic", this);
if (hasSimbiotic && simbioticHp >= 1) {
	damage = `${spores.number * 2}d${spores.faces}`;
}
let result = await token.actor.rollAbilitySave('con');
if (result.total < actorOrigin.system.attributes.spelldc) {
	let damageRoll = await new Roll(damage).roll({ async: true });
	new MidiQOL.DamageOnlyWorkflow(actorOrigin, actorOrigin, damageRoll.total, "necrotic", token ? [token] : [], damageRoll, { flavor: "Spreading Spore - Damage Roll (Necrotic)" });
}
