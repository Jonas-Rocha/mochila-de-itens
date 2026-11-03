import { Item } from "./domain/items/Item.js"
import { Bag } from "./domain/bag/Bag.js"
import { BagError } from "./domain/errors/BagError.js"

const sword = new Item(1, 'Excalibur', 100, 'epic')
const potion = new Item(2, 'Potion of life', 2, 'common')
const shield = new Item(3, "Silver Shield", 70, 'rare')
const trash = new Item(4, "Weight test", 48, 'common')

const mainBag = new Bag(150)


console.log(mainBag.totalWeight())

console.log(mainBag.list())

mainBag.add(sword)

mainBag.add(potion)

try {
    mainBag.add(trash)
} catch (error) {
    if(error instanceof BagError) {
        console.log(error.message)
    } else {
        console.log(`Erro inesperado: ${error}`)
    }
}








console.log(mainBag.list())

console.log(sword)

console.log(potion.name)

console.log(shield)

console.log(mainBag.totalWeight())