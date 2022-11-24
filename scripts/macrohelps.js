
export let ListItemOptions = function (items, itemType, itemDamage) {

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