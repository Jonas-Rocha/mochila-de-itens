import { Item } from "./domain/items/Item.js"
import { Bag } from "./domain/bag/Bag.js"

const sword = new Item(1, 'Excalibur', 100, 'epic')
const potion = new Item(2, 'Potion of life', 2, 'common')
const shield = new Item(3, "Silver Shield", 70, 'rare')

const mainBag = new Bag()

mainBag.add(sword)
mainBag.add(potion)
mainBag.add(shield)


console.log(mainBag.list())
console.log(sword)
console.log(potion.name)
console.log(shield)