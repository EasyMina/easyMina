import { EasyMina } from '../../../src/EasyMina.mjs'

console.log('✨ Adding EasyMina...')
const easyMina = new EasyMina( { 'networkName': 'berkeley' })

console.log('🔑 Creating Accounts...')
const deployers = await easyMina.createAccounts({
    'names': ['testing', 'bob', 'charlie'],
    'groupName': 'a'
})

console.log('🚀 Deployers Ready.')
// deployers.forEach( a => console.log('   Explorer:', a['explorer']))
