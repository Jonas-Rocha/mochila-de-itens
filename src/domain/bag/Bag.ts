import type { Item } from "../items/Item.js"; // o item tem uma tipagem dentro da classe... será que importar a tipagem de dentro da classe item funciona? e também: não seria melhor guardar a tipagem do item em outro arquivo já que vou usar em mais de um lugar?
import { BagError } from "../errors/BagError.js";




export class Bag {
    private items: Item[] // só os métodos da Bag mexem na lista
    readonly maxWeight: number  // todos leem, ninguém troca
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

        remove(id: number): Item {
            const foundItem = this.items.find((item) => {
                    return item.id === id
            } ) 

            if(!foundItem){
                throw new BagError("Item não encontrado")
            }

            const newBag = this.items.filter((item) => {
                return item.id !== foundItem.id
            })

            this.items = newBag
            return foundItem
        }

        list(): Item[] {
            return [...this.items]
        }

        totalWeight(): number {
            let total = 0
            for(const item of this.items) {
                total = total + item.weight
            }


            return total
        }

        

}