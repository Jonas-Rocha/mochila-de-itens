import type { Rarity } from "../types/Rarity.js";

export abstract class Item {
    //esta é a tipagem que vai ser dentro do objeto que esta sendo criado
    id: number;
    name: string;
    weight: number;
    rarity: Rarity;
    
    //esta é a tipagem que vai vir de quem esta criando o objeto com o "new"
    constructor(id: number, name: string, weight: number, rarity: Rarity) {
        this.id = id
        this.name = name
        this.weight = weight
        this.rarity = rarity

    }
}
