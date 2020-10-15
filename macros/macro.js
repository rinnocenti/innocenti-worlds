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
        let folder = game.folders.find(f => f.name === folderName && f.type === pack.entity) ?.id;
        let type = pack.metadata.entity.toLowerCase();
        type = type === 'journalentry' ? 'journal' : type + 's';
        let extra = folder ? { folder } : null
        if (folderName && !folder) {
            return ui.notifications.error(`Your world does not have any ${type} folders named '${folderName}'.`);
        }
        if (remove) {
            game[type].filter(t => t.data.folder === folder) ?.delete();
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