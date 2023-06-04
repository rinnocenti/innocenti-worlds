//game.macros.getName('TemplateMacroEffectCondition').execute(token,20,'Prone')
// Token, DC, Condition
let newtoken = args[0];
let saveDC = args[1];
let effectName = args[2];

let result = await game.MonksTokenBar.requestRoll([newtoken], {
	request: 'save:con', dc: saveDC, silent: true, fastForward: false, rollMode: 'requestRoll', callback: async () => {
		let mTokenbar = result.data.flags["monks-tokenbar"][`token${newtoken.data._id}`];
		if (!mTokenbar.passed) {
			await game.dfreds.effectInterface.addEffect({ effectName: `${effectName}`, uuid: token.data.uuid });
			console.log("RESULT", args);
		}
	}
})