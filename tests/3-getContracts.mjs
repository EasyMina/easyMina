import { EasyMina } from './../src/EasyMina.mjs'

const easymina = new EasyMina( {} )
const result = easymina
    .init()
    // .getContracts()
     // .getDevelopmentContracts()
     // .getDeployedContracts()
await easymina
     .getAccount( {
        'name': 'cetris',
        'groupName': 'test-berkeley'
     } )

console.log( 'r', result )