import { EasyMina } from 'easymina'

console.log('✨ Adding EasyMina...')
const easyMina = new EasyMina( { 'networkName': 'berkeley' })

console.log('🔑 Creating Accounts...')
const deployers = await easyMina.createAccounts({
    'names': ['alice', 'bob', 'charlie'],
    'groupName': 'a'
})

console.log('🚀 Deployers Ready.')
