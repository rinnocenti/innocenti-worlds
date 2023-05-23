//Divindade do canal: Harness Divine Power

//Paladino de 3o nível recurso opcional

//Você pode gastar o uso da sua Divindade do Canal para alimentar seus feitiços.Como ação bônus, você toca seu símbolo sagrado, faz uma oração e recupera um slot de feitiço gasto, cujo nível não pode ser superior à metade do seu bônus de proficiência(arredondado para cima).O número de vezes que você pode usar esse recurso é baseado no nível atingido nesta classe: 3o nível, uma vez; 7o nível, duas vezes; e 15o nível, três vezes.Você recupera todos os usos gastos quando termina um longo descanso.

//Version 1.0
console.log("Abjurar Inimigo", args);
let lastArgs = args[0];
let maxSpellSlot = Math.round(lastArg.actor.system.attibutes.prof / 2);

function SpellSlotList(maxSpellSlot) {
    for (var i = 0; i < maxSpellSlot; i++) {
        //Checar se foi gasto slot deste nivel
        `<option value="${i}"> Slot: ${i} Nivel</option>`
    }
}

if (lastArgs.tag == "OnUse" && lastArgs.macroPass == "preItemRoll") {

    spellOptions = SpellSlotList(maxSpellSlot);
    let formulario =
        `<div><h3>Escolha o cliclo da magia</h3></div>
    <div>
        <label for="spellSelect"> Ciclo da Magia:
            <select id="spellSelect" name="spellSelect">
                    ${spellOptions}
            </select>
        </label>
    </div>`;

    let dialog = new Dialog({
        title: "Apply poison to Weapon",
        content: formulario,
    });
    dialog.render(true);
}