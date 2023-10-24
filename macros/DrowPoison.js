
const version = "11.0.20";
//console.log("TUDO", args);
// 'DAEMakePCondition' 'Convenient Effect: Poisoned' 3600 1 13 con
const lastArg = args[args.length - 1];
const poisonName = lastArg.efData.name;
const poisonIcon = lastArg.efData.icon;
const poisonCondition = args[1];
const poisonTime = {
    "startTime": null,
    "seconds": args[2],
    "rounds": null,
    "turns": null,
    "startRound": null,
    "startTurn": null,
    "type": "seconds",
    "duration": args[2],
    "remaining": args[2],
    "label": `${args[2]} Seconds`
}
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
                        let copy_item = duplicate(weaponItem.toObject(false));
                        if (weaponItem.system.consumableType == "ammo" && weaponItem.system.quantity > ammoQuant) {
                            copy_item.system.quantity = copy_item.system.quantity - ammoQuant;
                            await actor.createEmbeddedDocuments("Item", [copy_item]);
                            copy_item.system.quantity = ammoQuant;
                        }
                        DAE.setFlag(actor, `PoisonCondition`, {
                            "_id": weaponId,
                            "system.save": copy_item.system.save,
                            "system.uses.autoDestroy": copy_item.system.uses.autoDestroy,
                            "name": copy_item.name

                        }).then(() => {
                            const effectData = {
                                changes: [
                                    { key: "StatusEffect", mode: 0, value: `${poisonCondition}`, priority: 20 }
                                ],
                                origin: lastArg.actorUuid, //flag the effect as associated to the spell being cast
                                disabled: false,
                                transfer: false,
                                tint: null,
                                flags: {},
                                duration: poisonTime,
                                icon: poisonIcon,
                                label: poisonName
                            }
                            copy_item.name = `${copy_item.name} (${poisonName})`;
                            copy_item.system.save = { "ability": `${apoisonAtt}`, "dc": poisonDC, "scaling": `flat` }
                            copy_item.system.uses.autoDestroy = true;
                            //console.log("Effect", effectData);
                            copy_item.effects.push(effectData)
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
        const flag = DAE.getFlag(actor, `PoisonCondition`);
        await actor.updateEmbeddedDocuments("Item", [flag]);
        let xitem = actor.items.get(flag._id);
        let xEffect = xitem.effects.map(x => x);
        let lastEffect = xEffect[xEffect.length - 1].id;
        xitem.effects.delete(lastEffect)
        DAE.unsetFlag(actor, `PoisonCondition`);
        ChatMessage.create({ content: flag.name + " returns to normal" });
    }
} catch (err) {
    console.error(`PoisonCondition ${version}`, err);
}