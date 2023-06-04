
const lastArg = args[args.length - 1];
const sporesTexture = "jb2a.toll_the_dead.green.shockwave";
const zombieSounds = [
	"modules/soundfxlibrary/Creatures/Monsters/Zombie/zombie-2.mp3",
	"modules/soundfxlibrary/Creatures/Monsters/Zombie/zombie-3.mp3",
	"modules/soundfxlibrary/Creatures/Monsters/Zombie/zombie-5.mp3"
];

if ( args[0].tag === "OnUse" ) {
	const originActor = MidiQOL.MQfromActorUuid(args[0].actorUuid);
	const targetTokenDoc = args[0].targets[0];
	const targetActor = targetTokenDoc?.actor;
	const validType = validateActorType(targetActor);
	if ( !validType ) return false;
	await originActor.setFlag("world", "fungalInfestation", {"targetTokenId": targetTokenDoc.object.id});
}

if ( args[0] === "on" ) {
	const originActor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const originToken = MidiQOL.MQfromUuid(lastArg.tokenUuid);
	const {targetTokenId} = originActor.getFlag("world", "fungalInfestation");
	const targetToken = game.canvas.tokens.get(targetTokenId);
	if ( !targetToken ) return ui.notifications.warn("Target token not found.");
	let zombieActor = game.actors.getName("Zombie");
	if ( !zombieActor ) {
		const pack = game.packs.get("dnd5e.monsters");
		const {_id: zombieId} = pack?.index.find(e => e.name === "Zombie");
		zombieActor = await game.actors.importFromCompendium(pack, zombieId);
	}
	if ( !zombieActor ) return ui.notifications.warn("Zombie actor not found.");
	await playEffects("spawn", originToken);
	const zombieTokenId = await spawnZombie(originToken, targetToken, zombieActor);
	originActor.setFlag("world", "fungalInfestation", {[lastArg.effectId]: zombieTokenId});
}

if ( args[0] === "off" ) {
	const originActor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const {[lastArg.effectId]: zombieTokenId} = originActor.getFlag("world", "fungalInfestation");
	const zombieToken = game.canvas.tokens.get(zombieTokenId);
	if ( !zombieToken ) return ui.notifications.warn("Zombie token not found.");
	await playEffects("dismiss");
	await warpgate.dismiss(zombieTokenId);
	originActor.update({[`flags.world.fungalInfestation.-=${lastArg.effectId}`]: null});
}

function validateActorType(actor) {
	if ( !actor ) return ui.notifications.warn("You must target a valid actor.");
	if ( actor.data.data.attributes.hp.value > 0 ) return ui.notifications.warn("Target creature must be dead.");
	if ( !["sm", "med"].includes(actor.data.data.traits.size) ) return ui.notifications.warn("Target creature must be Small or Medium.");
	if (
		// Include "character" validation when type gets added to character actors (https://github.com/foundryvtt/dnd5e/issues/1960)
		(actor.type === "npc" && !["humanoid", "beast"].includes(actor.data.data.details.type.value)) ||
		(actor.type === "vehicle")
	) return ui.notifications.warn("Target creature must be a beast or a humanoid.");
	return true;
}

async function playEffects(action, originToken) {
	switch (action) {
	case "spawn":
		await new Sequence()
			.effect()
				.file(sporesTexture)
				.atLocation(originToken)
				.size(originToken.data.width + 4.5, {gridUnits: true})
				.waitUntilFinished(-500)
			.sound()
				.file(zombieSounds)
				.playIf(() => {return game.modules.get("soundfxlibrary")})
				.waitUntilFinished()
			.play();
		break;
	case "dismiss":
		await new Sequence()
			.sound()
				.file(zombieSounds)
				.playIf(() => {return game.modules.get("soundfxlibrary")})
				.waitUntilFinished()
			.play();
		break;
	}
}

async function spawnZombie(originToken, targetToken, zombieActor) {
	const updates = {
		// "embedded": {"ActiveEffect": {data}} // Add Active Effect to track zombie destruction?
		"actor": {
			"data.attributes.hp.value": 1
		},
		"token": {
			"actorLink": false,
			"displayBars": 0,
			"displayName": 30,
			"disposition": 1,
			// "flags": {"world": {"fungalInfestation": {"effectId": ""}}}, // Add flag?
			"elevation": targetToken.data.elevation,
			"name": `Zombie (${originToken.name})`,
			"vision": true
		}
	};
	const [zombieTokenId] = await warpgate.spawnAt(targetToken.center, await zombieActor.getTokenData(), updates);
	if ( game.combat && originToken.combatant ) {
		const zombieToken = game.canvas.tokens.get(zombieTokenId);
		await zombieToken.toggleCombat();
		zombieToken.combatant.update({"initiative": originToken.combatant.initiative - 0.01});
	}
	return zombieTokenId;
}