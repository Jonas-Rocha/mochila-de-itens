import { Item } from "./Item.js";
import type { Rarity } from "../types/Rarity.js";
import type { Usable } from "../interfaces/Usable.js";


export class Potion extends Item implements Usable {

    heal: number


    constructor(id: number, name: string, weight: number, rarity: Rarity, heal: number) {
        super(id, name, weight, rarity)
        this.heal = heal
    }

        describe(): string {
        return `${this.name} (${this.rarity}) - cura ${this.heal}`
    }   
        use(): string {
            return `Você usou ${this.name} e recuperou ${this.heal} de vida`
        }
}

