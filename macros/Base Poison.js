const version = "11.0.20";
//console.log("TUDO", args);
// 'Base Poison' 1d4 3 10 con
const lastArg = args[args.length - 1];
const poisonName = args[1];
const poisonDamage = args[2];
const ammoQuant = args[3];
const poisonDC = args[4];
const apoisonAtt = args[5];

function listItemOptions(items, itemType, itemDamage, ammoQnt = 1) {

    return items.filter(x => {
        if (x.type == itemType && x.system.damage?.parts) {
            let damage = x.system.damage.parts.flat();
            if (damage.includes(`${itemDamage}`)) {
                if (x.system.consumableType == "ammo" && x.system.quantity > 0) return x;
                if (x.type == "weapon") return x;
            }
        }
    })
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(x => {
            if (x.system.consumableType == "ammo")
                return `<option value="${x.id}">${x.name} (x${x.system.quantity})</option>`
            else
                return `<option value="${x.id}">${x.name} </option>`
        });
}

try {
    var weaponItem = listItemOptions(actor.items, 'weapon', "slashing").concat(listItemOptions(actor.items, 'weapon', "piercing"));
    var ammunitionItem = listItemOptions(actor.items, 'consumable', "slashing").concat(listItemOptions(actor.items, 'consumable', "piercing"));
    var poisoner = actor.items.find(x => x.name == 'Poisoner' && x.type == "feat");

    if (args[0] === "on") {
        let formulario =
            `<div><h3>Character: ${actor.name} - apply poison </h3></div>
    <div>
        <label for="weaponSelect"> Weapon Select:
            <select id="weaponSelect" name="weaponSelect">
		<optgroup label="Weapons">
            		${weaponItem}
		</optgroup>
		<optgroup label="Ammunituoins need to be a group for ${ammoQuant} max">
            		${ammunitionItem}
		</optgroup>
            </select>
        </label>
    </div>`;

        let dialog = new Dialog({
            title: "Apply poison to Weapon",
            content: formulario,
            buttons: {
                one: {
                    icon: '<i class="fas fa-dice-d20"></i>',
                    label: "Usar",
                    callback: async () => {
                        let weaponId = $(`#weaponSelect option:selected`).val();
                        let weaponItem = actor.items.get(weaponId);
                        let copy_item = await duplicate(weaponItem.toObject(false));

                        let typeDamage = (poisoner) ? 'poisoner' : 'poison'

                        if (weaponItem.system.consumableType == "ammo" && weaponItem.system.quantity > ammoQuant) {
                            copy_item.system.quantity = copy_item.system.quantity - ammoQuant;
                            await actor.createEmbeddedDocuments("Item", [copy_item]);
                            copy_item.system.quantity = ammoQuant;
                        }
                        DAE.setFlag(actor, `Poison`, {
                            "_id": weaponId,
                            "system.attackBonus": copy_item.system.attackBonus,
                            "system.formula": copy_item.system.formula,
                            "system.save": copy_item.system.save,
                            "flags.midiProperties": copy_item.flags.midiProperties,
                            "name": copy_item.name

                        }).then(() => {
                            copy_item.name = `${copy_item.name} (${poisonName})`;
                            copy_item.system.formula = `${poisonDamage}[${typeDamage}]`;
                            copy_item.system.save = { "ability": `${apoisonAtt}`, "dc": poisonDC, "scaling": `flat` }
                            copy_item.flags.midiProperties = {
                                "nodam": true,
                                "fulldam": false,
                                "halfdam": false,
                                "rollOther": false,
                                "critOther": false
                            }
                            actor.updateEmbeddedDocuments("Item", [copy_item]);
                            ChatMessage.create({ content: copy_item.name + " is poisoned" });
                        });
                    }
                }
            }
        });
        dialog.render(true);
    }
    if (args[0] === "off") {
        const flag = DAE.getFlag(actor, `Poison`);
        await actor.updateEmbeddedDocuments("Item", [flag]);
        DAE.unsetFlag(actor, `Poison`);
        ChatMessage.create({ content: flag.name + " returns to normal" });
    }
} catch (err) {
    console.error(`Poisons ${version}`, err);
}