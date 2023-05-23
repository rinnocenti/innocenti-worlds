//Divindade do canal: Harness Divine Power

//Paladino de 3o n�vel recurso opcional

//Voc� pode gastar o uso da sua Divindade do Canal para alimentar seus feiti�os.Como a��o b�nus, voc� toca seu s�mbolo sagrado, faz uma ora��o e recupera um slot de feiti�o gasto, cujo n�vel n�o pode ser superior � metade do seu b�nus de profici�ncia(arredondado para cima).O n�mero de vezes que voc� pode usar esse recurso � baseado no n�vel atingido nesta classe: 3o n�vel, uma vez; 7o n�vel, duas vezes; e 15o n�vel, tr�s vezes.Voc� recupera todos os usos gastos quando termina um longo descanso.

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