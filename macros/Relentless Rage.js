console.log("Relentless Ragee", args);
let lastArg = args[args.length - 1];
if (args[0] !== "isDamaged" && lastArg.options.actor.system.attributes.hp.value != 0) return;
if (game.dfreds.effectInterface.hasEffectApplied("Rage", lastArg.options.actor.uuid) || game.dfreds.effectInterface.hasEffectApplied("Rage (Totem)", lastArg.options.actor.uuid)) {
	const targetToken = await lastArg.targets.map(x => x.name).filter(y => {

		if (y == lastArg.options.token.name) return y;
	});
	let relentlessRage = await fromUuid(lastArg.sourceItemUuid);
	let tokenActor = await fromUuid(lastArg.options.actor.uuid);
	let saveDC = 0;
	if (relentlessRage.system.uses.value != 0) {
		// primeira vez	
		
		relentlessRage.setFlag('midi-qol','relentlessRage', saveDC);
		console.log("primeira vez", relentlessRage, saveDC);
		await tokenActor.updateEmbeddedDocuments("Item", [{ _id: relentlessRage._id, 'system.uses.value': 0}]);

	} else {
		// Demais vezes.
		saveDC = relentlessRage.flags['midi-qol']['relentlessRage'];
		saveDC = Number(saveDC) + 1;
		console.log("Demais vezes.", relentlessRage, saveDC);
		relentlessRage.setFlag('midi-qol', 'relentlessRage', saveDC);
	}
	let result = await game.MonksTokenBar.requestRoll(targetToken, {
		request: 'save:con', dc: 10 + (saveDC*5), silent: true, fastForward: false, rollMode: 'requestRoll', callback: async () => {
			let mTokenbar = result.data.flags["monks-tokenbar"][`token${lastArg.options.token.id}`];
			if (mTokenbar.passed) {
				await tokenActor.update({ "system.attributes.hp.value": 1 });
				//Chat da habilidade
			}
		}
	})
    
}
