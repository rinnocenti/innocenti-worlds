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



console.log("potion", args)
try {
    //const lastArg = args[args.length-1];
    let xtarget = MidiQOL.MQFromUuid(args[0].actorUuid);
    let recovery = parseInt(args[0].item.system.formula);
    let exha = xtarget.system.attributes.exhaustion;

    if (args[0].tag == "OnUse") {
        //console.log("rest",exha, recovery)
        if (exha > 0) {
            let nexha = ((exha - recovery) <= 0) ? 0 : (exha - recovery);
            console.log("rest2", exha, nexha)
            await xtarget.update({ 'system.attributes.exhaustion': nexha });
            ChatMessage.create({ content: `${args[0].item.name} reduce exhaustion to ${nexha}` });
        } else {
            ChatMessage.create({ content: `there is no exhaust to reduce with the ${args[0].item.name}` });
        }
    }
} catch (err) {
    console.error(`Recovery Exhaustion`, err);
}




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
                            "id": weaponId,
                            "system.attackBonus": copy_item.system.attackBonus,
                            "system.formula": copy_item.system.formula,
                            "system.save": copy_item.system.save,
                            "system.uses.autoDestroy": copy_item.system.uses.autoDestroy,
                            "flags.midiProperties": copy_item.flags.midiProperties,
                            "name": copy_item.name

                        }).then(() => {
                            copy_item.name = `${copy_item.name} (${poisonName})`;
                            copy_item.system.formula = `${poisonDamage}[poison]`;
                            copy_item.system.save = { "ability": `${apoisonAtt}`, "dc": poisonDC, "scaling": `flat` }
                            copy_item.system.uses.autoDestroy = true;
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


const version = "10.0.17";
//console.log("TUDO", args);
// 'Poisoned' 3600 1 13 con
const lastArg = args[args.length - 1];
const poisonName = lastArg.efData.label;
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
                        DAE.setFlag(actor, `PoisonCondition`, {
                            "_id": weaponId,
                            "system.save": copy_item.system.save,
                            "system.uses.autoDestroy": copy_item.system.uses.autoDestroy,
                            "name": copy_item.name

                        }).then(() => {
                            const effectData = {
                                changes: [
                                    { key: "macro.CE", mode: 0, value: `${poisonCondition}`, priority: 20 }
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



//DAECustomCondition Slippery Ice
console.log("Condotion", args);
const lastArg = args[args.length - 1];
const conditionCustom = args[1];
let customCondition =
    _token.actor.system.traits.ci.custom.split(';').includes(conditionCustom);
if (customCondition == true && args[0] == "on") {
    let efData = { effectName: lastArg.efData.label, uuid: lastArg.actorUuid, origin: lastArg.origin }
    game.dfreds.effectInterface.removeEffect(efData);
}

console.log("AAAA", args)
const lastArg = args[args.length - 1];
const tokens = await fromUuid(lastArg.tokenUuid, "Token");
console.log("AAAA", tokens)
if (args[0] == "on" || args[0] == "off") {
    const configuredEnvironments = tokens.getFlag('elevation-drag-ruler', 'ignoredEnvironments') || { 'all': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'arctic': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'coast': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'desert': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'forest': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'grassland': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'jungle': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'mountain': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': true, 'climb': true }, 'swamp': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'underdark': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'urban': { 'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false }, 'water': { 'any': false, 'walk': false, 'swim': true, 'fly': false, 'burrow': false, 'climb': false } };
    //Toggle the setting to ignore all terrain for any movemement speed.
    if (configuredEnvironments.all.any) configuredEnvironments.all.any = false;
    else configuredEnvironments.all.any = true;
    //Update the token flag.
    tokens.setFlag('elevation-drag-ruler', 'ignoredEnvironments', configuredEnvironments);
}


const version = "10.0.18";
// SizeToken 2 || lg
// Size com multiplicdor
//console.log("SizeToken", args);
const lastArg = args[args.length - 1];
const xtarget = await fromUuid(lastArg.tokenUuid, "Token");
let size = args[1];
let systemSize = Object.keys(CONFIG.DND5E.actorSizes);
let SizeSystem = { "tiny": 0.5, "sm": 1, "med": 1, "lg": 2, "huge": 3, "grg": 4 }

try {
    if (args[0] === "on") {
        xtarget.setFlag('innocenti-worlds', `SizeToken`, {
            "width": xtarget.width,
            "height": xtarget.height,
            "system.traits.size": xtarget.actor.system.traits.size
        }).then(async () => {
            var newSize;
            if (typeof size === 'string') {
                newSize = size;
                size = SizeSystem[newSize];
            } else {
                for (let key in systemSize) {
                    if (systemSize[key] === xtarget.actor.system.traits.size) {
                        let nkey = (size > 0) ? parseInt(key) + (size - 1) : parseInt(key) + size;
                        newSize = systemSize[nkey];
                    }
                }
                size = SizeSystem[newSize];
            }
            var changeData = {
                width: xtarget.width * size,
                height: xtarget.height * size,
            }
            await xtarget.update(changeData);
            await xtarget.actor.update({ 'system.traits.size': newSize });
            ChatMessage.create({ content: xtarget.name + " is change size to: " + CONFIG.DND5E.actorSizes[newSize] });
        });
    }
    if (args[0] === "off") {
        const flag = xtarget.getFlag('innocenti-worlds', `SizeToken`);
        await xtarget.update({ width: flag.width, height: flag.height });
        await xtarget.actor.update({ 'system.traits.size': flag.system.traits.size });
        xtarget.unsetFlag('innocenti-worlds', `SizeToken`);
        ChatMessage.create({ content: xtarget.name + " returns to normal" });
    }
} catch (err) {
}


/*

const version = "10.0.17";
//WeaponsDamages 1/-1 5/-5
//console.log("SizeToken", args);
const lastArg = args[args.length - 1];
let setDamage = args[1] ?? -1;
let destroyOn = args[2] ?? -5;
const xtarget = await fromUuid(lastArg.actorUuid, "Actor");
let listitem = xtarget.items.filter(x => x.type == "weapon" && x.system.properties?.mgc != true)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(x => {
        return `<option value="${x.uuid}">${x.name}</option>`
    });
let formulario =
    `<div>Personagem: ${_token.name} </div>
    <div>
        <label for="weapon"> Seleciona a Arma:
            <select id="weaponDamage" name="weaponDamage">
            ${listitem}
            </select>
        </label>
    </div>
    <div>
        <label for="weaponDamageNum"> Dano:
            <input id="weaponDamageNum" name="weaponDamageNum" type="number" value="${setDamage}"/>
        </label>
    <div>`;
console.log(listitem.join(""));
let dialog = new Dialog({
    title: "Danificar Armas",
    content: formulario,
    buttons: {
        one: {
            icon: '<i class="fas fa-dice-d20"></i>',
            label: "Usar",
            callback: async () => {
                let wDamage = $(`#weaponDamageNum`).val();
                let weapon = $(`#weaponDamage option:selected`).val();
                let weaponName = $(`#weaponDamage option:selected`).text();
                let itemWeapon = await MidiQOL.MQFromUuid(weapon);
                let weaponFlag = itemWeapon.flags?.weapondamage?.hits ?? 0;
                weaponFlag = parseInt(weaponFlag);
                if (weaponFlag <= destroyOn) {
                    xtarget.items.delete(itemWeapon.id);
                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker(),
                        content: `The Weapon: <strong>${weaponName}</strong> of ${xtarget.name} has destroyed`
                    });
                    return;
                }
                weaponFlag += parseInt(wDamage);
                let rDamage = itemWeapon.system?.damage?.parts;
                let nDamage = [];
                if (rDamage.length > 0) {
                    for (var i = 0; i < rDamage.length; i++) {
                        nDamage.push(["(" + rDamage[i][0] + ")" + wDamage, rDamage[i][1]])
                    }
                    await itemWeapon.update({ 'damage.parts': nDamage, 'flags.weapondamage.hits': weaponFlag });
                }
                let chatData = {
                    speaker: ChatMessage.getSpeaker(),
                    content: `The Weapon: <strong>${weaponName}</strong> of ${xtarget.name} took the <strong>${wDamage} </strong> penalty`

                };
                ChatMessage.create(chatData, {});
                console.log("SLE", weaponFlag, itemWeapon.flags);

            }
        }
    }
});

dialog.render(true);


const version = "10.0.17";
//SizeWeapons 3
//console.log("SizeWeapons", args);
const lastArg = args[args.length - 1];
const mTimes = args[1] ?? 3;
const actor = await fromUuid(lastArg.actorUuid, "Actor");

try {
    if (args[0] === "on") {
        const listWeapons = actor.items.filter(x => x.type === "weapon" && x.system.damage?.parts)
            .map(y => {
                let copyItem = duplicate(y.toObject(false));
                return {
                    '_id': copyItem._id, system: {
                        damage: {
                            parts: copyItem.system.damage.parts
                        }
                    }
                }
            });
        console.log("WEAPOPNS", listWeapons);
        DAE.setFlag(actor, `SizeWeapons`, listWeapons)
            .then(() => {
                listWeapons.map(x => {
                    return x.system.damage.parts.forEach(y => {
                        y[0] = y[0].replace(/([0-9]{1,2})(d[0-9]{1,3})/g, function (all, numb, dado) { return `${parseInt(numb) * mTimes}${dado}` });
                        return y;
                    });
                });
                actor.updateEmbeddedDocuments("Item", listWeapons);
                ChatMessage.create({ content: "All weapons and armor increased in size" });
                console.log("WEAPON", listWeapons);
            });
    }
    if (args[0] === "off") {
        const flag = DAE.getFlag(actor, `SizeWeapons`);
        await actor.updateEmbeddedDocuments("Item", flag);
        DAE.unsetFlag(actor, `SizeWeapons`);
        //console.log("WEAPON", actor.items);
    }
} catch (err) {
    console.error(`SizeWeapons ${version}`, err);
}


// JavaScript source code
console.log("Template Entra", this, token);
const MTB = game.MonksTokenBar;
const origem = await fromUuid(template.flags.dnd5e.origin, "Item");
let tokenDc = origem.system.save.dc;
let duration = origem.system.duration.value * 60;
let elevation = template.elevation ?? 0;
let tokenElevation = token.document.elevation ?? 0;
const effectData = {
    changes: [
        {
            key: "flags.midi-qol.OverTime",
            value: `turn=end,\nsaveDC=${tokenDc},\nsaveAbility=dex,\nlabel=Grease,\nsaveRemove=false,\nmacro=AddConditionEffect`,
            mode: 0,
            priority: 20
        },
        {
            key: "flags.midi-qol.optional.Grease.condition",
            value: "prone",
            mode: 0,
            priority: 20
        }
    ],
    origin: template.flags.dnd5e.origin, //flag the effect as associated to the spell being cast
    disabled: false,
    transfer: false,
    tint: null,
    flags: {},
    duration: {
        "startTime": game.time.worldTime,
        "seconds": duration,
        "rounds": null,
        "turns": null,
        "startRound": null,
        "startTurn": null,
        "type": "seconds",
        "duration": duration,
        "remaining": duration,
        "label": `${duration} Seconds`
    },
    icon: "icons/creatures/mammals/livestock-pig-green.webp",
    label: "inGrease"
}

try {
    if (elevation != tokenElevation) return;
    let combatMov = (game.combat.active) ?"combat":"free";
    if (token.actor.type == 'character')
        await MTB.changeMovement("none", [token]);
    await token.document.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    let result = await game.MonksTokenBar.requestRoll([token], {
        request: [{ "type": "save", "key": "dex" }], dc: tokenDc, silent: true, fastForward: false, rollMode: 'roll', callback:
            async () => {
                let tokenResult = result.flags['monks-tokenbar'][`token${token.id}`];
                if (!tokenResult.passed)
                    await game.dfreds.effectInterface.addEffect({ effectName: 'Prone', uuid: token.actor.uuid });
                if (token.actor.type == 'character')
                    await MTB.changeMovement(combatMov, [token]);
            }
    });
} catch (err) {
    console.error(`Template Entra`, err);
}


/// Item MAcro Grease
//console.log("inGrease", args);
const lastArg = args[args.length - 1];
if (lastArg.hitTargets.length < 1) return;
try {
    const token = await fromUuid(lastArg.tokenUuid, "Token");
    let tokenDc = item.system.save.dc;
    let duration = item.system.duration.value * 60;
    const effectData = {
        changes: [
            {
                key: "flags.midi-qol.OverTime",
                value: `turn=end,\nsaveDC=${tokenDc},\nsaveAbility=dex,\nlabel=Grease,\nsaveRemove=false,\nmacro=AddConditionEffect`,
                mode: 0,
                priority: 20
            },
            {
                key: "flags.midi-qol.optional.Grease.condition",
                value: "prone",
                mode: 0,
                priority: 20
            }
        ],
        origin: lastArg.itemUuid, //flag the effect as associated to the spell being cast
        disabled: false,
        transfer: false,
        tint: null,
        flags: {},
        duration: {
            "startTime": game.time.worldTime,
            "seconds": duration,
            "rounds": null,
            "turns": null,
            "startRound": null,
            "startTurn": null,
            "type": "seconds",
            "duration": duration,
            "remaining": duration,
            "label": `${duration} Seconds`
        },
        icon: "icons/creatures/mammals/livestock-pig-green.webp",
        label: "inGrease"
    }

    lastArg.hitTargets.forEach(async target => {
        if (target.elevation != token.elevation) return;
        await target.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    });
} catch (err) {
    console.error(`inGrease`, err);
}


// Sai do template
//console.log("Sai Do template", this, token);
let elevation = template.elevation ?? 0;
let tokenElevation = token.document.elevation ?? 0;
// Compatibilizar com levels;
if (elevation != tokenElevation) return;
try {
    let greaseEffect = token.document.actor.effects.filter(x => x.label == 'inGrease')
    if (greaseEffect.length < 1) return;
    await token.document.actor.deleteEmbeddedDocuments("ActiveEffect", [greaseEffect[0].id]);

} catch (err) {
    console.error(`Saiu`, err);
}


//Macro add Conditions
console.log("PRONE", args);
const lastArg = args[args.length - 1];
if (lastArg.failedSaveUuids.length < 1) return;
const CE = game.dfreds.effectInterface;
let itemName = lastArg.item.name;
const condition = actor.flags['midi-qol'].optional[`${itemName}`]?.condition;
console.log("PRONE", itemName, condition);
lastArg.failedSaveUuids.forEach(async target => {
    CE.addEffect({ effectName: condition, uuid: target, origin: lastArg.itemUuid });
});

// JavaScript source code
console.log("Template Sai sem teste", this, token);
const origem = await fromUuid(template.flags.dnd5e.origin, "Item");
let elevation = template.elevation ?? 0;
let tokenElevation = token.document.elevation ?? 0;
const CE = game.dfreds.effectInterface;
const condition = "Heavily Obscured";
try {
    if (elevation != tokenElevation) return;
    await CE.removeEffect({ effectName: condition, uuid: token.actor.uuid, origin:origem });
} catch (err) {
    console.error(`Template Entra`, err);
}

// JavaScript source code
console.log("Template Entra sem teste", this, token);
const origem = await fromUuid(template.flags.dnd5e.origin, "Item");
let elevation = template.elevation ?? 0;
let tokenElevation = token.document.elevation ?? 0;
const CE = game.dfreds.effectInterface;
const condition = "Heavily Obscured";
try {
    if (elevation != tokenElevation) return;
    await CE.addEffect({ effectName: condition, uuid: token.actor.uuid, origin:origem });
} catch (err) {
    console.error(`Template Entra`, err);
}




//console.log("Frightened", args);
let lastArg = args[args.length - 1];
let itemduration = lastArg.item.system.duration.value * 60;
let tokenDc = lastArg.item.system.save.dc;
const CE = game.dfreds.effectInterface;
let counterEffect = 'No Scary';
let activeEffect = 'Frightened';
let effect = CE.findEffectByName(`${activeEffect}`);
let counter = CE.findEffectByName(`${counterEffect}`);
effect.changes.push({
    key: "flags.midi-qol.OverTime",
    value: `turn=end,\nsaveDC=${tokenDc},\nsaveAbility=wis,\nlabel=${activeEffect},\nmacro=FrightenedImmunity`,
    mode: 0,
    priority: 20
});
effect.seconds = itemduration;
try {
    if (lastArg.hitTargetUuids.length > 0) {
        lastArg.hitTargetUuids.forEach(async uuid => {
            let token = await fromUuid(uuid, "Token");
            let allCounter = await token.actor.effects.filter(x => x.name == counterEffect || x.label == counterEffect);
            let allEffect = await token.actor.effects.filter(x => x.name == activeEffect || x.label == activeEffect);
            if (lastArg.failedSaveUuids.includes(uuid)) {
                if (allEffect.length > 0) {
                    let hasEffect = allEffect.find(x => x.origin == lastArg.itemUuid);
                    if (hasEffect) return;
                }
                if (allCounter.length > 0) {
                    let hasCounter = allCounter.find(x => x.origin === lastArg.itemUuid);
                    if (hasCounter) return;
                }
                if (lastArg.actorUuid == uuid) return;
                await CE.addEffectWith({ effectData: effect, uuid: uuid, origin: lastArg.itemUuid });
                await CE.addEffectWith({ effectData: counter, uuid: uuid, origin: lastArg.itemUuid });
            }
            if (lastArg.saveUuids.includes(uuid)) {
                if (allCounter.length > 0) {
                    let hasCounter = allCounter.find(x => x.origin == lastArg.itemUuid);
                    if (hasCounter) return;
                }
                if (allEffect.length > 0) {
                    let hasEffect = allEffect.find(x => x.origin == lastArg.itemUuid);
                    if (hasEffect) return;
                }                
                if (lastArg.actorUuid == uuid) {
                    if (allEffect.length > 0) {
                        let itemListen = await fromUuid(lastArg.uuid, "Item");
                        if (itemListen != null) return;
                    }
                }                
                await CE.addEffectWith({ effectData: counter, uuid: uuid, origin: lastArg.itemUuid });
            }
        })

    }
} catch (err) {
    console.error(`${activeEffect}`, err);
}

let lastArg = args[args.length - 1];
console.log("PearofPower", args);
try {
    if (lastArg.tag == "OnUse") {
        const tactor = canvas.tokens.get(args[0].tokenId).actor;
        if (lastArg.item.system.equipped == false || lastArg.item.system.attunement != 2) {
            lastArg.item.system.uses.value = lastArg.item.system.uses.value + 1;
            await tactor.updateEmbeddedDocuments("Item", [lastArg.item]);
            return ui.notifications.warn("Pear of Power: not Equipped and Attunned");
        }
        let spells = tactor.system.spells;
        let allowedUse = [];
        for (let spell in spells) {
            if (spells[spell].max > 0 && spells[spell].value < spells[spell].max) {
                if (spell == "pact" || Number(spell.slice(-1)) <= 3)
                allowedUse.push(spell);
            }      
        }
        if (allowedUse.length < 1) {
            lastArg.item.system.uses.value = lastArg.item.system.uses.value + 1;
            await tactor.updateEmbeddedDocuments("Item", [lastArg.item]);
            return ui.notifications.warn("Pear of Power: There are no points to recover");
        }
        let options = "";
        for (var i = 0; i < allowedUse.length; i++) {
            let spellName = allowedUse[i].slice(-1);
            spellName = (spellName != "t") ? game.dnd5e.config.spellLevels[Number(spellName)] : "Pact Slot";
            options += `<option value="${allowedUse[i]}">${spellName}</option>`;
        }
        let formulario =
            `<div><strong>Recover Slot:</strong> ${tactor.name} </div>
        <div>
            <label for="spellSlot"> Spell Slot:
                <select id="spellSlot" name="spellSlot">
            ${options}
                </select>
            </label>
        </div>`;

        const dialog = new Dialog({
            title: `${item.name}`,
            content: formulario,
            buttons: {
                use: {
                    label: "Recovery",
                    callback: async () => {
                        let recovery = $(`#spellSlot option:selected`).val();
                        spells[recovery].value = spells[recovery].value + 1;
                        await tactor.update({ 'system.spells': spells });
                        let recoveryName = game.dnd5e.config.spellLevels[Number(recovery.slice(-1))];
                        ChatMessage.create({ content: `Regained a ${recoveryName} slot using the ${lastArg.tem.name}` });
                    } 
                }
            }
        }).render(true);
    }

} catch (err) {
    console.error(`Pear of Power`, err);
}

const apiTemplate = game.modules.get("templatemacro").api;
const CE = game.dfreds.effectInterface;
let condition = "In Portable Hole";
let inHole = apiTemplate.findContained(template);
if (inHole.length > 1) {
    for (var i = 0; i < inHole.length; i++) {
        let tokens = canvas.tokens.get(inHole[i]);
        await CE.addEffect({ effectName: condition, uuid: tokens.actor.uuid })
    }
}


const apiTemplate = game.modules.get("templatemacro").api;
const CE = game.dfreds.effectInterface;
let condition = "In Portable Hole";
let inHole = apiTemplate.findContained(template);
if (inHole.length > 1) {
    for (var i = 0; i < inHole.length; i++) {
        let tokens = canvas.tokens.get(inHole[i]);
        if(CE.hasEffectApplied(condition, tokens.actor.uuid))
            await CE.removeEffect({ effectName: condition, uuid: tokens.actor.uuid })
    }
}


console.log("BOTAS", args);
let lastArg = args[args.length - 1];
let actorEffects = actor.effects;
let nameEffect = lastArg.efData.label;
let effect = await actorEffects.find(x => x.label == nameEffect);

if (args[0] == "off" && effect) {

    // Off não da pra pegar mais a duration
    //console.log("DESLIGOU A BOTA", effect.duration, game.time.worldTime)
    let remainTime = game.time.worldTime - effect.duration.startTime;
    let remain = effect.duration.duration - remainTime;
    let changes = {
        _id: effect._id,
        duration: {
            startTime: effect.duration.startTime + remainTime,
            duration: remain,
            remaining: remain,
            seconds: remain,
            label: `${remain} Seconds`
        }
    }
    //console.log("Changes", changes, remainTime)
    await actor.updateEmbeddedDocuments("ActiveEffect", [changes])
}

if (args[0] == "on") {
    //console.log("Ligou A BOTA", effect.duration, game.time.worldTime)
    let changes = {
        _id: effect._id,
        duration: {
            startTime: game.time.worldTime,
        }
    }
    //console.log("Changes", changes, remainTime)
    await actor.updateEmbeddedDocuments("ActiveEffect", [changes])
}

===========
console.log("BOTAS Voo", args);
let lastArg = args[args.length - 1];
let actorEffects = actor.effects;
let nameEffect = lastArg.efData.label;
let effect = await actorEffects.find(x => x.label == nameEffect);

if (args[0] == "off" && effect) {

    // Off não da pra pegar mais a duration
    //console.log("DESLIGOU A BOTA", effect.duration, game.time.worldTime)
    let remainTime = game.time.worldTime - effect.duration.startTime;
    let remain = effect.duration.duration - remainTime;
    let changes = {
        _id: effect._id,
        duration: {
            startTime: effect.duration.startTime + remainTime,
            duration: remain,
            remaining: remain,
            seconds: remain,
            startTime: game.time.worldTime,
        }
    }
    //console.log("Changes", changes, remainTime)
    await actor.updateEmbeddedDocuments("ActiveEffect", [changes])
}


console.log("Args", args);
const version = "10.0.18";
//SetSenses "basicSight" 120
let lastArg = args[args.length - 1];
let tokenDetect = token.document.detectionModes;
let newTokenSense =
{
    "id": args[1],
    "enabled": true,
    "range": args[2]
}

try {
    let sansekey = await Object.keys(tokenDetect).find(key => tokenDetect[key].id == newTokenSense.id);
    if (args[0] === "on") {
        if (tokenDetect[sansekey] && tokenDetect[sansekey].enabled == true && tokenDetect[sansekey].range == newTokenSense.range) return;        
        DAE.setFlag(actor, `SetSenses${args[1]}`, tokenDetect[sansekey])
            .then(async () => {
                if (tokenDetect[sansekey])
                    tokenDetect[sansekey] = newTokenSense;
                else
                    tokenDetect.push(newTokenSense);
                await token.document.update({
                    detectionModes: tokenDetect
                });
                ChatMessage.create({ content: token.name + " Recive a new detect mode: " + newTokenSense.id });
                console.log(`SetSenses${args[1]}`, tokenDetect);
            });
    }
    if (args[0] === "off") {
        const flag = DAE.getFlag(token, `SetSenses${args[1]}`);
        if (!flag) {
            delete tokenDetect[sansekey];
        } else {
            tokenDetect[sansekey] = flag;
        }
        await token.document.update({
            detectionModes: tokenDetect
        });
        DAE.unsetFlag(actor, `SetSenses${args[1]}`);
        ChatMessage.create({ content: token.name + " loose detect mode: " + newTokenSense.id });
    }
} catch (err) {
    console.error(`SetSenses${args[1]} ${version}`, err);
}


console.log("Args", args);
const version = "10.0.18";
//DisableCondition Invisible
let lastArg = args[args.length - 1];
let effectName = args[1];
let tokenActor = await fromUuid(lastArg.tokenUuid, "Token");
const CE = game.dfreds.effectInterface;

try {
    if (args[0] === "on") {
        if (CE.hasEffectApplied(effectName, lastArg.tokenUuid)) {
            DAE.setFlag(actor, `DisableCondition${effectName}`, effectName).then(async () => {
                await CE.removeEffect({ effectName: effectName, uuid: lastArg.tokenUuid });
            });
        }            
        ChatMessage.create({ content: token.name + " loose condition: " + effectName });
    }
    if (args[0] === "off") {
        const flag = DAE.getFlag(token, `DisableCondition${effectName}`);
        if (flag == effectName) {
            await CE.addEffect({ effectName: effectName, uuid: lastArg.tokenUuid, origin: lastArg.itemUuid });
            ChatMessage.create({ content: token.name + " regained the condition of: " + effectName });
        }        
    }
} catch (err) {
    console.error(`DisableCondition} ${version}`, err);
}
*/
console.log("PORRADA", args);
const version = "10.0.18";
let lastArg = args[args.length - 1];
if (lastArg.macroPass == "postAttackRoll" && lastArg.hitTargetUuids.length > 0 && lastArg.item.system.attuned == true && lastArg.item.system.equipped == true) {
    try {
        const dialog = new Dialog({
            title: `${item.name}`,
            content: `<div><strong>Apply Effect on Hit: </strong> ${lastArg.item.name} </div>`,
            buttons: {
                drain: {
                    label: "Drain Energy",
                    callback: async () => {
                        let result = await game.MonksTokenBar.requestRoll([target], {
                            request: [{ "type": "save", "key": "con" }], dc: 17, silent: true, fastForward: false, rollMode: 'roll', callback:
                                async () => {
                                    let tokenResult = result.flags['monks-tokenbar'][`token${lastArg.hitTargets[0]._id}`];
                                    if (!tokenResult.passed)
                                        console.log("Errei")
                                        //await game.dfreds.effectInterface.addEffect({ effectName: 'Prone', uuid: token.actor.uuid });
                                    console.log("Passei")
                                }
                        });
                        ChatMessage.create({ content: `Regained a  slot using the ${lastArg.item.name}` });
                    }
                },
                paralyze: {
                    label: "Paralyze",
                    callback: async () => {
                        ChatMessage.create({ content: `Regained a  slot using the ${lastArg.item.name}` });
                    }
                },
                terrify: {
                    label: "Terrify",
                    callback: async () => {
                        ChatMessage.create({ content: `Regained a slot using the ${lastArg.item.name}` });
                    }
                }
            }
        }).render(true);

    } catch (err) {
        console.error(`DisableCondition} ${version}`, err);
    }

}



//Beverage ##stackCount 8
let stack = args[1]
let saveDC = args[2] + (2 * stack);
const lastArg = args[args.length - 1];
let targetx = await fromUuid(lastArg.tokenUuid);
let result;
try {
    if (args[0] === "on") {
        result = await game.MonksTokenBar.requestRoll([{ "token": `${targetx.name}` }], {
            request: [{ "type": "save", "key": "con" }], dc: saveDC, silent: true, fastForward: true, rollMode: 'roll'
        });
        let tokenResult = result.tokenresults[0];
        if (!tokenResult.passed) {
            await game.dfreds.effectInterface.addEffect({ effectName: 'Poisoned', uuid: lastArg.tokenUuid });
            //console.log("Errei")
        }
    }
} catch (err) {
    console.error(`Beverage`, err);
}