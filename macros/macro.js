// Visitar
InnocentiVisitar.Visitar();
//Enconter
let encounter = new InnocentiEncounters.Encounters();
await encounter.RegistryEncounter(args[0], args[1]);
await encounter.RollTable(args[1]);
await console.log(encounter);
//

let journalOptions = game.journal.map(journal => `<option value="${journal.id}">${journal.name}</option>`);
let packOptions = game.packs.map(pack => `<option value="${pack.collection}">${pack.title}</option>`);

const form = `
  <div style="display: inline-block; width: 100px; padding: 2em">Folder:</div>
  <input type="string" id="folderName">
  <br />
  <div style="font-size: 80%">leave blank to put into root directory</div>
  <br />

  <div style="display: inline-block; width: 100px">Journal:</div>
  <select id="destinationJournal" />
    ${journalOptions}
  </select>
  <br />
  <label>
    <input type="checkbox" id="delete"/>
    Clear destination first
  </label>
`;
const dialog = new Dialog({
    title: "Import actors from journal",
    content: form,
    buttons: {
        use: {
            label: "Apply",
            callback: importJournal
        }
    }
}).render(true);

function importJournal(html) {
    const folderName = html.find(`input#folderName`)[0].value;
    const journalName = html.find(`select#destinationJournal`)[0].value;
    const remove = html.find(`input#delete`)[0].checked;
    let journal = game.journal.get(journalName);
    let journalContent = journal.data.content;
    let matches = journalContent.match(/@\w*\[([\w.-]+)\]/g);
    let uniqueMatches = matches
        .filter((value, index, self) => self.indexOf(value) === index) //unique matches
    let compendiums = getCompendiums(uniqueMatches);
    for (let compendium in compendiums) {
        let pack = game.packs.get(compendium);
        let folder = game.folders.find(f => f.name === folderName && f.type === pack.entity)?.id;
        let type = pack.metadata.entity.toLowerCase();
        type = type === 'journalentry' ? 'journal' : type + 's';
        let extra = folder ? { folder } : null
        if (folderName && !folder) {
            return ui.notifications.error(`Your world does not have any ${type} folders named '${folderName}'.`);
        }
        if (remove) {
            game[type].filter(t => t.data.folder === folder)?.delete();
        }
        for (let i = 0; i < compendiums[compendium].length; i++) {
            console.log(compendium, compendiums[compendium][i]);

            //if(compendium !== 'innocenti-worlds.oldmaps') return;
            game[type].importFromCollection(compendium, compendiums[compendium][i], extra);
        }
    }

}
function getCompendiums(uniqueMatches) {
    let compendiums = {}
    for (let c of uniqueMatches) {
        let arrayData = c.slice(1, -1).split('[');
        let comp = arrayData[1].split('.');
        if (compendiums[`${comp[0]}.${comp[1]}`])
            compendiums[`${comp[0]}.${comp[1]}`].push(comp[2]);
        else
            compendiums[`${comp[0]}.${comp[1]}`] = [];
    }
    return compendiums;
}
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function getEntityType(entity) {
    switch (entity) {
        case 'JournalEntry': return 'journal';
        case 'RollTable': return 'tables';
        default: return entity.toLowerCase() + 's';
    }
}

function listItemOptions(items, itemType, itemDamage) {

    return items.filter(x => {
        if (x.type == itemType && x.system.damage?.parts) {
            let damage = x.system.damage.parts.flat();
            if (damage.includes(`${itemDamage}`)) return x;
        }
    })
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(x => {
            return `<option value="${x.uuid}">${x.name}</option>`
        });
}

/*
########################################################################

const version = "10.0.17";
//console.log("TUDO", args);
const lastArg = args[args.length - 1];
const itemBonus = args[1];
const ammoQuant = args[2];
function listItemOptions(items, itemType, itemDamage, ammoQnt = 1) {

    return items.filter(x => {
        if (x.type == itemType && x.system.damage?.parts) {
            let damage = x.system.damage.parts.flat();
            if (damage.includes(`${itemDamage}`)) {
                if (x.system.consumableType == "ammo" && x.system.quantity > 0 && x.system.quantity <= ammoQuant) return x;
                if (x.type == "weapon") return x;
            }
        }
    })
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(x => {
            if (x.system.consumableType == "ammo" )
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
            `<div>Character: ${actor.name} </div>
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
            title: "Apply Item to Weapon",
            content: formulario,
            buttons: {
                one: {
                    icon: '<i class="fas fa-dice-d20"></i>',
                    label: "Usar",
                    callback: async () => {
                        let weaponId = $(`#weaponSelect option:selected`).val();
                        let weaponItem = actor.items.get(weaponId);
                        let copy_item = duplicate(weaponItem.toObject(false));
                        DAE.setFlag(actor, `Sharpness`, {
                            "_id": weaponId,
                            "system.attackBonus": copy_item.system.attackBonus,
                            "system.damage.parts": copy_item.system.damage.parts,
                            "name": copy_item.name

                        }).then(() => {
                            copy_item.name = `${copy_item.name} (Sharpness)`;
                            copy_item.system.attackBonus = itemBonus;
                            copy_item.system.damage.parts.forEach(x => {
                                if (["piercing", "slashing"].includes(x[1])) {
                                    let ibonus = itemBonus - weaponItem.system.attackBonus
                                    ibonus = (ibonus < 0) ? 0 : ibonus;
                                    x[0] = `${x[0]} + ${ibonus}`;
                                }
                            });
                            actor.updateEmbeddedDocuments("Item", [copy_item]);
                            ChatMessage.create({ content: copy_item.name + " is sharp" });
                        });
                    }
                }
            }
        });
        dialog.render(true);
    }
    if (args[0] === "off") {
        const flag = DAE.getFlag(actor, `Sharpness`);
        await actor.updateEmbeddedDocuments("Item", [flag]);
        DAE.unsetFlag(actor, `Sharpness`);
        ChatMessage.create({ content: flag.name + " returns to normal" });
    }
} catch (err) {
    console.error(`Potion of Sharpness ${version}`, err);
}


*/
const version = "10.0.17";
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
                if (x.system.consumableType == "ammo" && x.system.quantity > 0 && x.system.quantity <= ammoQuant) return x;
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
                        DAE.setFlag(actor, `Poison`, {
                            "_id": weaponId,
                            "system.attackBonus": copy_item.system.attackBonus,
                            "system.formula": copy_item.system.formula,
                            "system.save": copy_item.system.save,
                            "flags.midiProperties": copy_item.flags.midiProperties,
                            "name": copy_item.name

                        }).then(() => {
                            copy_item.name = `${copy_item.name} (${poisonName})`;
                            copy_item.system.formula = `${poisonDamage}[poison]`;
                            copy_item.system.save = { "ability": `${apoisonAtt}`, "dc": poisonDC, "scaling": `flat` }
                            copy_item.flags.midiProperties = {
                                "nodam": false,
                                "fulldam": false,
                                "halfdam": true,
                                "rollOther": true,
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

