import { Item } from "./Item.js";
import type { Rarity } from "../types/Rarity.js";


export class Armor extends Item {

    defense: number


    constructor(id: number, name: string, weight: number, rariry: Rarity, defense: number) {
        super(id, name, weight, rariry)
        this.defense = defense
    }
}