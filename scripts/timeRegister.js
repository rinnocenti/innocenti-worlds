/// Registra um encontro na cena atual
export class TimeRegister {
    constructor(RegisterSceneFlag = "TimeRegister") {
        this.flagName = RegisterSceneFlag;
        game.Gametime.queue();
    }
    async RegisterScene(minutes, callback = (() => {})) {
        //remove todos os eventos de encontro desta scena
        this.RemoveAllRegister();
        // Adiciona registro no AboutTime
        this.gameTimeid = await game.Gametime.doEvery({ minutes: minutes }, callback);
        game.scenes.active.setFlag(`world`, `${this.flagName}.${this.gameTimeid}`, true);
        await this._onDisableScene(this.gameTimeid);
        console.log(this);
        game.Gametime.queue();
    }
    GetRegister(idEncounter) {
        let flag = game.scenes.active.getFlag(`world`, `${this.flagName}`) ? game.scenes.active.getFlag(`world`, `${this.flagName}`) : false;
        if (!flag) return false;
        return flag[idEncounter];
    }
    async RemoveRegister(idEncounter) {
        let flag = GetEncounterRegister(idEncounter);
        if (flag) {
            await game.Gametime.clearTimeout(flag);
            await game.scenes.active.unsetFlag(`world`, `${this.flagName}.${flag}`);
        }
    }
    async RemoveAllRegister() {
        let flag = game.scenes.active.getFlag(`world`, `${this.flagName}`) ? game.scenes.active.getFlag(`world`, `${this.flagName}`) : false;
        if (flag) {
            for (let i = 0; i < flag.length; i++) {
                await game.Gametime.clearTimeout(flag[i]);
            }
            await game.scenes.active.unsetFlag(`world`, `${this.flagName}`);
        }
    }
    async _onDisableScene(gameTimeid) {
        Hooks.once("preUpdateScene", () => {
            ui.notifications.info(`A Agora Descarregou ${gameTimeid}`);
            game.Gametime.clearTimeout(gameTimeid);
        });
    }
}