
import * as o1js from 'o1js'
import { EasyMina } from './../src/EasyMina.mjs'

const easyMina = new EasyMina( {
    'networkName': 'berkeley',
    o1js
} )
const test = easyMina.health()

console.log( 'Test', test )
if( test !== null || test !== undefined ) {
    process.exit( 0 )
} else {
    process.exit( 1 )
}