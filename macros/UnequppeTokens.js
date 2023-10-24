function listItemUnequipped(items) {

    return items.filter(x => {
        if (x.system.equipped == true) {
            return x;
        }
    })
        .map(x => {

            return { _id: x._id, system: { equipped: false } }
        });
}

await canvas.tokens.getDocuments();
let t = await mtokens.forEach(x => {
    let tudo = listItemUnequipped(x.actor.items);
    if (tudo.length > 0) {
        await x.actor.updateEmbeddedDocuments("Item", tudo);
        console.log(tudo)
    }
        
});



let afolder = 'Amphil'
function listItemUnequipped(items) {

    return items.filter(x => {
        if (x.system.equipped == true) {
            return x;
        }
    })
        .map(x => {

            return { _id: x._id, system: { equipped: false } }
        });
}


const updates = [];
for (const actor of game.actors.filter(a => a.type === "npc" && a.folder.name === afolder)) {
    updates.push(actor);
}

updates.forEach(x => {
    let tudo = listItemUnequipped(x.items);
    if (tudo.length > 0) {
        x.updateEmbeddedDocuments("Item", tudo);
        console.log(tudo)
    }
})




game.actors.forEach(x => {
    let tudo = listItemUnequipped(x.items, afolder);
    if (tudo.length > 0) {
        x.updateEmbeddedDocuments("Item", tudo);
        console.log(tudo)
    }

});