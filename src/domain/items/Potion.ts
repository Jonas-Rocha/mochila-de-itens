import { Item } from "./Item.js";
import type { Rarity } from "../types/Rarity.js";


export class Potion extends Item {

    heal: number


    constructor(id: number, name: string, weight: number, rarity: Rarity, heal: number) {
        super(id, name, weight, rarity)
        this.heal = heal
    }

        describe(): string {
        return `${this.name} (${this.rarity}) - cura ${this.heal}`
    }
}

