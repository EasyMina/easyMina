import { EasyMina } from './../src/EasyMina.mjs'

const easyMina = new EasyMina( {
    'networkName': 'berkeley'
} )

await easyMina.createAccounts( { 
    'names': [ 'alice', 'bob', 'charlie' ],
    'groupName': 'a'
} ) 

/*
easyMina
    .setAccountGroup( 'group-c' )

await easyMina.newPersonas( { 
    names: [ 'zilly' ]
} ) 
*/