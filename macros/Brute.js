console.log("Brute", args)
let lastArg = args[args.length - 1];

let dice = lastArg.damageRoll.dice;

if (lastArg.macroPass == "DamageBonus") {
    for (var i = 0; i < dice.length; i++) {
        let diceNumber = dice[i].number;
        let diceFace = dice[i].faces;
        let damageType = dice[i].flavor;
        console.log("Brute", diceNumber, diceFace);
        const damageFormula = new CONFIG.Dice.DamageRoll(`${diceNumber}d${diceFace}[${damageType}]`, {}, {}).formula
        // How to check that we've already done one this turn?
        return { damageRoll: damageFormula, flavor: "Brute" };
    }    
}

