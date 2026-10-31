import type { Item } from "../items/Item.js"; // o item tem uma tipagem dentro da classe... será que importar a tipagem de dentro da classe item funciona? e também: não seria melhor guardar a tipagem do item em outro arquivo já que vou usar em mais de um lugar?

export class Bag {
    items: Item[]

    constructor() {
        this.items = []
    }
        add(item: Item): void {
            this.items.push(item)
        }

        list(): Item[] {
            return this.items
        }

}