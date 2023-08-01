import { EasyMina } from './src/EasyMina.mjs'

const easyMina = new EasyMina()

await easyMina
    .setEnvironment( {
        'projectName': 'testing12345678'
    } )

/*
await easyMina 
    .deployContract( {} )
*/


/*
await easyMina
    .deployContract( { 
        'projectName': 'my-latest-project',
        'deployerFileName': 'default--1690747562.json',
        'smartContractFileName': 'hello.ts'
    } )
*/