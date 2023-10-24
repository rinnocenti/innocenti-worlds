console.log("Condotion", args);
//DAETokenTerrain arctic walk true
const moduleName = game.modules.get("enhanced-terrain-layer");
if (moduleName) {
	const lastArg = args[args.length - 1];
	const terrainType = args[1];
	const moveType = args[2];
	let activate = args[3];
	const xtarget = await fromUuid(lastArg.tokenUuid);
	console.log("ALVO", xtarget);
	const configuredEnvironments = xtarget.getFlag('elevation-drag-ruler', 'ignoredEnvironments') || { 'all': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'arctic': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'coast': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'desert': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'forest': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'grassland': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'jungle': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'mountain': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': true, 'climb': true }, 'swamp': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'underdark': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'urban': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'water': { 'any': false, 'walk': false, 'swim': true, 'fly': false, 'burrow': false, 'climb': false } };

	if (args[0] == "on" && lastArg.tokenId != null) {
		configuredEnvironments[`${terrainType}`][`${moveType}`] = activate
		xtarget.setFlag('elevation-drag-ruler', 'ignoredEnvironments', configuredEnvironments);
	}

	if (args[0] == "off" && lastArg.tokenId != null) {
		configuredEnvironments[`${terrainType}`][`${moveType}`] = !activate
		xtarget.setFlag('elevation-drag-ruler', 'ignoredEnvironments', configuredEnvironments);
	}
}

//console.log("AAAA", args)
const lastArg = args[args.length - 1];
const moduleName = game.modules.get("enhanced-terrain-layer");
if (moduleName) {
const tokens = await fromUuid(lastArg.tokenUuid, "Token");
//console.log("AAAA", tokens)
	if (args[0] == "on" || args[0] == "off" && lastArg.tokenId != null) {
		const configuredEnvironments = tokens.getFlag('elevation-drag-ruler', 'ignoredEnvironments') || { 'all': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'arctic': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'coast': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'desert': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'forest': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'grassland': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'jungle': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'mountain': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': true, 'climb': true }, 'swamp': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'underdark': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'urban': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'water': { 'any': false, 'walk': false, 'swim': true, 'fly': false, 'burrow': false, 'climb': false } };
		//Toggle the setting to ignore all terrain for any movemement speed.
		if (configuredEnvironments.all.any) configuredEnvironments.all.any = false;
		else configuredEnvironments.all.any = true;
		//Update the token flag.
		tokens.setFlag('elevation-drag-ruler', 'ignoredEnvironments', configuredEnvironments);
	}
}