// JavaScript source code
//Divindade do canal: inimigo de Abjure
//Como ação, você apresenta seu símbolo sagrado e faz uma oração de denúncia, usando sua Divindade do Canal.Escolha uma criatura a menos de 10 metros de você que você possa ver.Essa criatura deve fazer um lance salvador da Sabedoria, a menos que seja imune a ser assustado.Demônios e mortos - vivos têm desvantagens neste arremesso salvador.

//Em uma defesa fracassada, a criatura está assustado por 1 minuto ou até que cause algum dano.Enquanto assustado, a velocidade da criatura é 0 e não pode se beneficiar de nenhum bônus em sua velocidade.

//Em uma defesa bem - sucedida, a velocidade da criatura é reduzida pela metade por 1 minuto ou até que a criatura sofra algum dano.

//Version 1.0
console.log("Abjurar Inimigo", args);
const DISADVANTAGE_TEMP = "DisadvantageTemp"
const SAVE_TEMP = "HalfMoviment"
let lastArgs = args[0];
let targetTypes = ["undead", "fiend"];
const DISADVANTAGE_EFFECT = {
    label: DISADVANTAGE_TEMP,
    icon: "icons/svg/downgrade.svg",
    changes:
        [
            {
                "key": "flags.midi-qol.disadvantage.ability.save.wis",
                "value": "1",
                "mode": 0,
                "priority": 20
            }

        ],
    flags: {
        dae: {
            "specialDuration": [
                "isSave.wis"
            ]
        }
    },
    transfer: true,
};
const SAVE_EFFECT = {
    label: SAVE_TEMP,
    icon: "icons/svg/downgrade.svg",
    changes:
        [
            {
                "key": "system.attributes.movement.all",
                "value": "*0.5",
                "mode": 0,
                "priority": 20
            }

        ],
    duration: {
        "seconds": 60,
        "type": "seconds",
        "duration": 60,
        "remaining": 60,
        "label": "60 Seconds"
    },
    flags: {
        dae: {
            "specialDuration": [
                "1Hit"
            ]
        }
    },
    transfer: true,
};
//checagem de vantagem de rolagem.
if (lastArgs.tag == "OnUse" && lastArgs.macroPass == "preItemRoll") {
    for (var i = 0; i < lastArgs.targets.length; i++) {
        if (targetTypes.includes(lastArgs.targets[i].actor.system.details.type.value)) {
            await lastArgs.targets[i].actor.createEmbeddedDocuments("ActiveEffect", [DISADVANTAGE_EFFECT])
        }
    }
}

//checagem de vantagem de rolagem.
if (lastArgs.tag == "OnUse" && lastArgs.macroPass == "postSave") {
    for (var i = 0; i < lastArgs.saves.length; i++) {
        await lastArgs.saves[i].actor.createEmbeddedDocuments("ActiveEffect", [SAVE_EFFECT])
    }
}
