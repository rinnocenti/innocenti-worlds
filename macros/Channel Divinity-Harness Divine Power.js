//Divindade do canal: Harness Divine Power

//Paladino de 3o n�vel recurso opcional

//Voc� pode gastar o uso da sua Divindade do Canal para alimentar seus feiti�os.Como a��o b�nus, voc� toca seu s�mbolo sagrado, faz uma ora��o e recupera um slot de feiti�o gasto, cujo n�vel n�o pode ser superior � metade do seu b�nus de profici�ncia(arredondado para cima).O n�mero de vezes que voc� pode usar esse recurso � baseado no n�vel atingido nesta classe: 3o n�vel, uma vez; 7o n�vel, duas vezes; e 15o n�vel, tr�s vezes.Voc� recupera todos os usos gastos quando termina um longo descanso.

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
        return ui.notifications.warn("N�o h� espa�o de magia para recuperar");

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
        title: "Recuperar slot de feiti�o",
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