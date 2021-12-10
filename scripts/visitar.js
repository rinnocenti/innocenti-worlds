export let Visitar = async function () {
    if (canvas.tokens.controlled.length === 0)
        return ui.notifications.error("select a token");
    if (!game.user.targets.values().next().value) {
        ui.notifications.warn("No token is targeted");
        return;
    }
    let userid = game.user.id;
    for (let targetToken of game.user.targets) {
        let flag = targetToken.actor.getFlag('lootsheetnpc5e', 'lootsheettype');
        if (flag === 'Merchant') {
            if (!game.user.isGM) {
                let permission = false;
                let perm = targetToken.actor.data.permission;
                if (!perm[`${userid}`]) {
                    permission = true;
                }
                await game.socket.emit("module.innocenti-worlds", { action: "visitar", targetId: targetToken.id, userid: game.user.id, permission: permission, speaker: ChatMessage.getSpeaker()});
            }
            let img = targetToken.actor.img || targetToken.data.img;
            let imgtk = targetToken.img || targetToken.data.img;
            await ChatMessage.create({
                content: `<h3><img src=\"${img}\" width=\"50px\" /> Bem Vindo ao <strong>${targetToken.name}</strong></h3>`,
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
                speaker: ChatMessage.getSpeaker(),
                flavor: `<h3><img src=\"${imgtk}\" width=\"30px\" /></h3>`
            });
        }
        setTimeout(function () { targetToken.actor._sheet.render(true) }, 500);
    }
}