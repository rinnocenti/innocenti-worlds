// JavaScript source code
console.log("Create", args);

let tokenActor = args[0].actor;
const ITEM_NAME = "Tokens of Soul";

if (args[0].tag == 'OnUse' && args[0].macroPass == "postActiveEffects") {
    if (!args[0].targets[0]) return ui.notifications.warn("Precisa de um Alvo para usar a habilidade");
    let target = args[0].targets[0];
    if (target.actor.system.attributes.hp.value <= 0) {
        const ITEM_TOKEN = {
            name: `${ITEM_NAME} - ${target.name}`,
            img: "icons/commodities/treasure/token-engraved-blue-glowing.webp",
            type: "consumable",
            system: {
                source: target.name,
                price: {
                    value: 0,
                    denomination: "gp"
                },
                quantity: 1,
                consumableType: "trinket",
                uses: {
                    value: 1,
                    max: 1,
                    per: "charges",
                    recovery: "",
                    autoDestroy: true
                },
                actionType: "util",
                activation: {
                    "type": "action",
                    "cost": 1,
                    "condition": ""
                },
                description: {
                    "value": "<p>Quando uma vida termina em sua presen�a, voc� � capaz de arrancar um s�mbolo da alma que parte, uma lasca de sua ess�ncia de vida que assume forma f�sica: como uma rea��o quando uma criatura que voc� pode ver morre a menos de 30 p�s de voc�, voc� pode abrir sua m�o livre e fazer com que uma bugiganga min�scula apare�a l�, uma bugiganga da alma. O DM determina a forma da bugiganga ou voc� rola no Redes tabela no Manual do Jogador para ger�-lo. Voc� pode ter um n�mero m�ximo de bugigangas de alma igual ao seu b�nus de profici�ncia e n�o pode criar um enquanto estiver no m�ximo.</p><p>Voc� pode usar bugigangas de alma das seguintes maneiras:</p><ol><li><p>Enquanto uma bugiganga de alma est� com sua pessoa, voc� tem vantagem em lances de salvar a morte e lances de salvar a Constitui��o, pois sua vitalidade � aprimorada pela ess�ncia da vida dentro do objeto.</p></li><li><p>Quando voc� causa dano com <b>sneak attack</b> no seu turno, pode destruir uma das bugigangas da sua alma que est� na sua pessoa e, em seguida, usar imediatamente o Wails from the Grave, sem gastar o uso desse recurso.</p></li><li><p>Como a��o, voc� pode destruir uma das bugigangas da sua alma, n�o importa onde ela esteja localizada. Ao fazer isso, voc� pode fazer uma pergunta ao esp�rito associado � bugiganga. O esp�rito aparece para voc� e responde em um idioma que conhecia em vida. N�o tem obriga��o de ser sincero e responde da maneira mais concisa poss�vel, ansioso por ser livre. O esp�rito sabe apenas o que sabia na vida, conforme determinado pelo Mestre.</p></li></ol>"
                }
            },

        };
        const TRANSFERRED_EFFECT = {
            label: ITEM_NAME,
            icon: "icons/commodities/treasure/token-engraved-blue-glowing.webp",
            changes:
                [
                    {
                        "key": "flags.midi-qol.advantage.deathSave",
                        "value": "1",
                        "mode": 5,
                        "priority": 20
                    },
                    {
                        "key": "flags.midi-qol.onUseMacroName",
                        "value": "1",
                        "mode": 5,
                        "priority": 20
                    }

                ],
            transfer: true,
        };

        let alreadyTokens = await tokenActor.items.filter(x => x.name.startsWith(ITEM_NAME)).map(y => y.system.uses.value);
        let sumTokens = 0;
        for (var i = 0; i < alreadyTokens.length; i++) {
            sumTokens += alreadyTokens[i];
        }
        if (sumTokens >= tokenActor.system.attributes.prof) return ui.notifications.warn("Voc� atingiu o limite de tokens");

        let hasItem = tokenActor.items.find(x => x.name == `${ITEM_NAME} - ${target.name}` && x.type == "consumable");
        if (!hasItem) {
            let item = await Item.create(ITEM_TOKEN);
            await item.createEmbeddedDocuments("ActiveEffect", [TRANSFERRED_EFFECT]);
            let actor = await game.actors.get(tokenActor._id);
            await actor.createEmbeddedDocuments("Item", [item]);
            item.delete();
        } else {
            tokenActor.updateEmbeddedDocuments("Item", [{ _id: hasItem._id, 'system.uses.value': hasItem.system.uses.value + 1, 'system.uses.max': hasItem.system.uses.max + 1 }]);
        }
        await ChatMessage.create({
            content: `<p>O item: ${ITEM_NAME} - ${target.name} foi criado no ivent�rio</p>`,
            type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
            speaker: ChatMessage.getSpeaker()
        });
    }
}