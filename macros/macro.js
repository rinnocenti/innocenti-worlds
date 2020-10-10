// Visitar
InnocentiVisitar.Visitar();
//Enconter
let encounter = new InnocentiEncounters.Encounters();
await encounter.RegistryEncounter(args[0], args[1]);
await encounter.RollTable(args[1]);
await console.log(encounter);
//