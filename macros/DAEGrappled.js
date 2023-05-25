console.log("GRAPPLED", args)
let lastArg = args[args.length -1];
let grappled = game.dfreds.effectInterface.hasEffectApplied("Grappled", lastArg.tokenUuid);
let restrained = game.dfreds.effectInterface.hasEffectApplied("Restrained", lastArg.tokenUuid);
if (!grappled && !restrained) return;

let skillRef = (lastArg.actor.system.skills.ath.value >= lastArg.actor.system.skills.acr.value) ? 'ath' : 'acr';
let tokenTarget = await fromUuid(lastArg.tokenUuid)

if (args[0] == "each"){
    const dialog = new Dialog({
        title: "Agarrado/Restringido",
        content: '',
        buttons: {
            escapeath: {
                label: `1 Ação Escapar - Athletics (${lastArg.actor.system.skills.ath.value})`,
                callback: async () => {
                    let result = await game.MonksTokenBar.requestRoll([tokenTarget], {
                        request: 'skill:ath', dc: args[1], silent: true, fastForward: false, rollMode: 'requestRoll', callback: async () => {
                            let mTokenbar = await result.data.flags["monks-tokenbar"][`token${lastArg.tokenId}`];
                            if (mTokenbar.passed) {
                                if (grappled) {
                                    await game.dfreds.effectInterface.removeEffect({
                                        effectName: "Grappled", uuid: lastArg.tokenUuid
                                    });
                                }
                                if (restrained) {
                                    await game.dfreds.effectInterface.removeEffect({
                                        effectName: "Restrained", uuid: lastArg.tokenUuid
                                    });
                                }
                            }
                        }
                    })
                }
            },
            escapeacr: {
                label: `1 Ação Escapar - Acrobatics (${lastArg.actor.system.skills.acr.value})`,
                callback: async () => {
                    let result = await game.MonksTokenBar.requestRoll([tokenTarget], {
                        request: 'skill:acr', dc: args[1], silent: true, fastForward: false, rollMode: 'requestRoll', callback: async () => {
                            let mTokenbar = await result.data.flags["monks-tokenbar"][`token${lastArg.tokenId}`];
                            if (mTokenbar.passed) {
                                if (grappled) {
                                    await game.dfreds.effectInterface.removeEffect({
                                        effectName: "Grappled", uuid: lastArg.tokenUuid
                                    });
                                }
                                if (restrained) {
                                    await game.dfreds.effectInterface.removeEffect({
                                        effectName: "Restrained", uuid: lastArg.tokenUuid
                                    });
                                }
                            }
                        }
                    })
                }
            },
            close: {
                label: "Fechar",
                callback: () => { }
            }
        }
    }).render(true);

}


