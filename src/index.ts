import { Bag } from "./domain/bag/Bag.js"
import { BagError } from "./domain/errors/BagError.js"
import { Weapon } from "./domain/items/Weapon.js"
import { Armor } from "./domain/items/Armor.js"
import { Potion } from "./domain/items/Potion.js"
import { Item } from "./domain/items/Item.js"


const bag1 = new Bag(200)

const sword = new Weapon(1, 'Excalibur', 200, 'epic', 100)
const tonic = new Potion(2, 'Tonic of life', 2, 'common', 50)
const lightShield = new Armor(3, 'Light shield', 30, 'rare', 40)

// const newItem = new Item(9, 'Teste', 1, 'common')



bag1.add(tonic)
bag1.add(lightShield)


try {
    bag1.add(sword)
} catch (error) {
    if(error instanceof BagError){
        console.log(error.message)
    } else {
        console.log(`Erro inesperado: ${error}`)
    }
}



console.log(bag1)















// const sword = new Item(1, 'Excalibur', 100, 'epic')
// const potion = new Item(2, 'Potion of life', 2, 'common')
// const shield = new Item(3, "Silver Shield", 48, 'rare')

// const mainBag = new Bag(150)






// mainBag.add(sword)

// mainBag.add(potion)

// try {
//     mainBag.add(shield)
// } catch (error) {
//     if(error instanceof BagError) {
//         console.log(error.message)
//     } else {
//         console.log(`Erro inesperado: ${error}`)
//     }
// }







// console.log(mainBag.remove(1))

// console.log(mainBag)
// console.log(mainBag.list())