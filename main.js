import { Visitar } from './scripts/visitar.js';
import { Encounters } from './scripts/encounter.js';

Hooks.once("init", async () => {
    game.socket.on(`module.innocenti-worlds`, (data) => {
        console.log("DATA", data);
        switch (data.action) {
            case "visitar":
                if (game.user.isGM) {
                    let merchantToken = canvas.tokens.get(data.targetId);
                    if (data.permission) {
                        let newpermissions = duplicate(merchantToken.actor.data.permission);
                        newpermissions[`${data.userid}`] = 2;
                        let permissions = new PermissionControl(merchantToken.actor);
                        permissions._updateObject(event, newpermissions);
                        
                    }
                    ChatMessage.create({
                        user: ChatMessage.getSpeaker({ actor: data.userid }),
                        content: `<h3><img src=\"${merchantToken.actor.img}\" width=\"50px\" /> @Actor[${merchantToken.actor.id}]{${merchantToken.name}}</h3> <p>Responsavel: ${merchantToken.actor.name}</p><hr /${merchantToken.actor.data.data.details.biography.value}`,
                        speaker: data.speaker,
                        whisper: ChatMessage.getWhisperRecipients("GM"),
                        blind: true
                    });
                }
                break;
            default:
        }
    });
});
window.InnocentiWorld = {
    Visitar: Visitar,
    Encounters: Encounters
}