export let Visitar = async function () {
    if (canvas.tokens.controlled.length === 0)
        return ui.notifications.error("select a token");
    const target = game.user.targets.values().next().value;
    if (!target) {
        ui.notifications.warn("No token is targeted");
        return;
    }
    for (let targetToken of game.user.targets) {
        let flag = targetToken.actor.getFlag('lootsheetnpc5e', 'lootsheettype');// !== 'Merchant'
        //targetToken.actor.sheet.constructor.name !== SHEETVISIT
        if (flag === 'Merchant') {
            if (!game.user.isGM) {
                let targactor = await game.actors.entities.find(a => a.id === targetToken.actor.id);
                let permission = false;
                let perm = targactor.data.permission;
                if (!perm[`${game.user.id}`]) {
                    permission = true;
                }
                await game.socket.emit("module.innocenti-visit", { actorName: targactor.name, userid: game.user.id, targetName: targetToken.name, permission: permission, speaker: ChatMessage.getSpeaker()});
            }
            let img = targetToken.actor.img || targetToken.data.img;
            let imgtk = targetToken.data.img || targetToken.actor.img;
            await ChatMessage.create({
                content: `<h3><img src=\"${img}\" width=\"50px\" /> Bem Vindo ao <strong>${targetToken.name}</strong></h3>`,
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
                speaker: ChatMessage.getSpeaker(),
                flavor: `<h3><img src=\"${imgtk}\" width=\"30px\" /></h3>`
            });
        }
        setTimeout(function () { targetToken._onClickLeft2() }, 500);
    }
    
    //await targetToken._onClickLeft2();
}