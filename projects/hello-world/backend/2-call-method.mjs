import { Mina, Field } from 'o1js'
import { EasyMina } from 'easymina'

console.log('🌐 Adding Network...')
const Berkeley = Mina.Network( 
    'https://proxy.berkeley.minaexplorer.com/graphql' 
    // 'https://api.minascan.io/node/berkeley/v1/graphql'
)
Mina.setActiveInstance(Berkeley)
 
console.log('✨ Adding EasyMina...')
const easyMina = new EasyMina({ 'networkName': 'berkeley' })

console.log('🔑 Importing Account...')
const deployer = await easyMina.getAccount({
    'name': 'bob',
    'groupName': 'a',
    'checkStatus': true,
    'strict': true
})
console.log('   Explorer:', deployer['explorer'])

console.log('📝 Adding Contract...')
const contract = await easyMina.getDeployedContract({
    'name': 'square',
    'projectName': 'getting-started'
})
console.log('   Explorer:', contract['explorer'])

console.log('📄 Loading Smart Contract Code...')
const { sourceCode } = contract
const { Square } = await easyMina.loadModuleExperimental({ sourceCode })

console.log('🚀 Compiling...')
const zkAppInstance = new Square(contract['publicKey']['field'])

console.log('🧪 Compiling (awaited)...')
await Square.compile()

console.log('📜 Prepare Transactions...')
const tx = await Mina.transaction(
    {
        'feePayerKey': deployer['privateKey']['field'],
        'fee': 100_000_000,
        'memo': 'abc'
    },
    () => {
        zkAppInstance.update( Field( 1853020188851841 ) ) 
    }
)

console.log('🔍 Proving Transaction...')
await tx.prove()

console.log('✍️ Signing Transaction...')
const signedMessage = tx.sign([deployer['privateKey']['field']])

console.log('🚚 Sending Transaction...')
const response = await signedMessage.send()
console.log(`   Explorer URL: https://minascan.io/berkeley/tx/${response.hash()}`)
