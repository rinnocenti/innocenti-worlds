//DAEAutoGrappled 16[grabb DC]

console.log("GRAPPLED", args)
let lastArg = args[args.length - 1];
let grappled = game.dfreds.effectInterface.hasEffectApplied("Grappled", lastArg.tokenUuid);
let restrained = game.dfreds.effectInterface.hasEffectApplied("Restrained", lastArg.tokenUuid);
if (!grappled && !restrained) return;

let skillRef = (lastArg.actor.system.skills.ath.value >= lastArg.actor.system.skills.acr.value) ? 'ath' : 'acr';
let whispers = game.users.filter(u => u.character == lastArg.actor).map(x => x.id);

if (args[0] == "each") {
    await Requestor.request({
        img: 'modules/dfreds-convenient-effects/images/grappled.svg',
        title: 'Grappled',
        description: "Usando sua ação você pode fazer uma tentativa para se libertar do agarramento.",
        //context: { popout: true, autoClose: true },
        limit: Requestor.LIMIT.OPTION,
        speaker: ChatMessage.getSpeaker(),
        whisper: whispers,
        buttonData: [{
            label: "Ação: Escapar",
            skill: skillRef,
            skillCd: args[1],
            dataLabel: lastArg.efData.label,
            action: async () => {
                let result = await actor.rollSkill(`${this.skill}`);
                if (result.total >= this.skillCd) {
                    await game.dfreds.effectInterface.removeEffect({
                        effectName: this.dataLabel, uuid: actor.uuid
                    });
                }
                console.log("RESULTADO", result, this);
            }
        }, {
            label: "Ignorar",
            action: async () => {}
        }]
    });
}