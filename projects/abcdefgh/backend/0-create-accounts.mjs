import { EasyMina } from '../../../src/EasyMina.mjs'

console.log('✨ Adding EasyMina...')
const easyMina = new EasyMina( { 'networkName': 'berkeley' })

console.log('🔑 Creating Accounts...')
const deployer = await easyMina.createAccounts({
    'names': ['alice', 'bob', 'charlie'],
    'groupName': 'a'
})

console.log('🚀 Deployer Account:', deployer)
