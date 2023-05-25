//Divindade do canal: Harness Divine Power

//Paladino de 3o nível recurso opcional

//Você pode gastar o uso da sua Divindade do Canal para alimentar seus feitiços.Como ação bônus, você toca seu símbolo sagrado, faz uma oração e recupera um slot de feitiço gasto, cujo nível não pode ser superior à metade do seu bônus de proficiência(arredondado para cima).O número de vezes que você pode usar esse recurso é baseado no nível atingido nesta classe: 3o nível, uma vez; 7o nível, duas vezes; e 15o nível, três vezes.Você recupera todos os usos gastos quando termina um longo descanso.

//Version 1.0
console.log("DEBUG MACRO", args);
let lastArg = args[0];
let maxSpellSlot = Math.round(lastArg.actor.system.attributes.prof / 2);

function SpellSlotList(maxSpellSlot) {
    let def = '';
    for (var i = 0; i < maxSpellSlot; i++) {
        //Checar se foi gasto slot deste nivel
        if (lastArg.actor.system.spells[`spell${i + 1}`].value != lastArg.actor.system.spells[`spell${i + 1}`].max)
        def +=`<option value="${i+1}">${i+1} Nivel</option>`
    }
    return def;
}

if (lastArg.tag == "OnUse" && lastArg.macroPass == "postActiveEffects") {

    spellOptions = SpellSlotList(maxSpellSlot);
    if (spellOptions == "") 
        return ui.notifications.warn("Não há espaço de magia para recuperar");

    let formulario =
        `<div><h3>Escolha o ciclo da magia</h3></div>
    <div>
        <label for="spellSelect"> Ciclo da Magia:
            <select id="spellSelect" name="spellSelect">
                    ${spellOptions}
            </select>
        </label>
    </div>`;

    const dialog = new Dialog({
        title: "Recuperar slot de feitiço",
        content: formulario,
        buttons: {
            use: {
                label: "Apply",
                callback: async () => {
                    const recoverySpellSlot = $(`#spellSelect option:selected`).val();;
                    let newvalue = lastArg.actor.system.spells[`spell${recoverySpellSlot}`].value + 1;
                    let spellString = `system.spells.spell${recoverySpellSlot}.value`;

                    let chatData = {
                        speaker: ChatMessage.getSpeaker(),
                        title: lastArg.item.name,
                        content: `One level spell slot was regained: <strong>${recoverySpellSlot}</strong>`
                    };
                    ChatMessage.create(chatData, {});

                    await lastArg.actor.update({ [spellString]:newvalue});
                }
            }
        }
    }).render(true);
}