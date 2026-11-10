import type { Rarity } from "../types/Rarity.js";
import { Item } from "./Item.js";


export class Weapon extends Item {
    damage: number

    constructor(id: number, name: string, weight: number, rarity: Rarity, damage: number) {
        super(id, name, weight, rarity)
        this.damage = damage
    }

    describe(): string {
        return `${this.name} (${this.rarity}) - dano ${this.damage}`
    }

}