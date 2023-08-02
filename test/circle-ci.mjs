import { EasyMina } from './../src/EasyMina.mjs'

const easyMina = new EasyMina()
const test = easyMina.health()

console.log( 'Test', test )
if( test !== null || test !== undefined ) {
    process.exit( 0 )
} else {
    process.exit( 1 )
}