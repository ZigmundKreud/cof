export class Inventory {

    /**
     * Callbacks on increase/decrease item actions
     * @param event
     */
    static onModifyQuantity(actor, event, increment, isDecrease) {
        const li = $(event.currentTarget).closest(".item");
        const item = actor.items.get(li.data("itemId"));
        const stackable = li.data("itemStackable");
        if(stackable){
            let itemData = duplicate(item.data);
            const qty = itemData.data.qty;
            if(isDecrease) itemData.data.qty = qty - increment;
            else  itemData.data.qty = qty + increment;
            if(itemData.data.qty < 0) itemData.data.qty = 0;
            if(itemData.data.stacksize && itemData.data.qty > itemData.data.stacksize) itemData.data.qty = itemData.data.stacksize;
            if(itemData.data.price){
                const qty = (itemData.data.qty) ? itemData.data.qty : 1;
                itemData.data.value = qty * itemData.data.price;
            }
            return item.update(itemData);
        }
    }

    /**
     * Callbacks on consume actions
     * @param event
     */
    static onConsume(actor, event) {
        const li = $(event.currentTarget).closest(".item");
        const item = actor.items.get(li.data("itemId"));
        const consumable = li.data("itemConsumable");
        if(consumable){
            let itemData = duplicate(item.data);
            itemData.data.qty = (itemData.data.qty > 0) ? itemData.data.qty - 1 : 0;
            return item.update(itemData).then(i=> item.applyEffects(actor));
        }
    }
}