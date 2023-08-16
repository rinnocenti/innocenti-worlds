console.log("Crush", args)
let lastArg = args[args.length - 1];
if (lastArg.advantage == true) {
	await game.dfreds.effectInterface.addEffect({ effectName: `Sufocando`, uuid: lastArg.targetUuids[0] });
	await game.dfreds.effectInterface.addEffect({ effectName: `Blinded`, uuid: lastArg.targetUuids[0] });
}