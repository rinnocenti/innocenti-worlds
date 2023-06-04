console.log("SpidyBite", args);
let lastArg = args[args.length - 1];
const POSTPOISON_NAME = "Remaining Venom";
if (args[0] !== "onUpdateActor" && lastArg.actor.system.attributes.hp.value != 0) return;
if (game.dfreds.effectInterface.hasEffectApplied("Poison Spider", lastArg.tokenUuid)) {

    const POSTPOISON_EFFECT = {
        label: POSTPOISON_NAME,
        icon: "icons/skills/toxins/poison-bottle-corked-fire-green.webp",
        duration: {
            "seconds": 3600,
            "type": "seconds",
            "duration": 3600,
            "remaining": 3600,
            "label": "3600 Seconds"
        },
        changes:
            [
                {
                    "key": "StatusEffect",
                    "value": "Convenient Effect: Poisoned",
                    "mode": 0,
                    "priority": 20
                },
                {
                    "key": "StatusEffect",
                    "value": "Convenient Effect: Paralyzed",
                    "mode": 0,
                    "priority": 20
                }
            ],
        transfer: true,
    };

    await lastArgs.targetActor.createEmbeddedDocuments("ActiveEffect", [POSTPOISON_EFFECT]);
}
