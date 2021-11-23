import { Visitar } from './scripts/visitar.js';
import { Encounters } from './scripts/encounter.js';

Hooks.once("init", async () => {
    game.socket.on(`module.innocenti-worlds`, (data) => {
        if (game.user.isGM) {
            let actor = game.actors.entities.find(a => a.name === data.actorName);
            if (!actor) return ui.notifications.error(`Permission: Actor of ${data.targetName} not found`);
            if (data.permission) {
                let newpermissions = duplicate(actor.data.permission);
                newpermissions[`${data.userid}`] = 2;
                let permissions = new PermissionControl(actor);
                permissions._updateObject(event, newpermissions);
            }            
            ChatMessage.create({
                //user: ChatMessage.getSpeaker({ actor: data.userid }),
                content: `<h3><img src=\"${actor.img}\" width=\"50px\" /> @Actor[${actor.data._id}]{${data.targetName}}</h3> <p>Responsavel: ${data.actorName}</p><hr /${actor.data.data.details.biography.value}`,
                speaker: data.speaker,
                whisper: ChatMessage.getWhisperRecipients("GM"),
                blind: true
            });
        }
    });
});
window.InnocentiWorld = {
    Visitar: Visitar,
    Encounters: Encounters
}