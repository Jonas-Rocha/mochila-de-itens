import type { Item } from "../items/Item.js"; // o item tem uma tipagem dentro da classe... será que importar a tipagem de dentro da classe item funciona? e também: não seria melhor guardar a tipagem do item em outro arquivo já que vou usar em mais de um lugar?
import { BagError } from "../errors/BagError.js";




export class Bag {
    items: Item[]
    maxWeight: number
    constructor(maxWeight: number) {
        this.maxWeight = maxWeight
        this.items = []
    }
        add(item: Item): void {

                if(this.totalWeight() + item.weight > this.maxWeight) {
                throw new BagError("Você excedeu o peso máximo da mochila");

            }
            
            this.items.push(item)
        }

        list(): Item[] {
            return this.items
        }

        totalWeight(): number {
            let total = 0
            for(const item of this.items) {
                total = total + item.weight
            }


            return total
        }

        

}