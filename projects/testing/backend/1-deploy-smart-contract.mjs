import { Mina, AccountUpdate } from 'o1js'
import { EasyMina } from '../../../src/EasyMina.mjs'

import { Square } from '../contracts/build/Square.js'


console.log('🌐 Adding Network')
const Berkeley = Mina.Network( 
    // 'https://proxy.berkeley.minaexplorer.com/graphql' 
    'https://api.minascan.io/node/berkeley/v1/graphql'
)
Mina.setActiveInstance(Berkeley)

console.log('✨ Adding EasyMina')
const easyMina = new EasyMina( { 'networkName': 'berkeley' } )

console.log('🔑 Importing Accounts')
const deployer = await easyMina.getAccount({
    'name': 'alice',
    'groupName': 'a',
    'checkStatus': true, // optional, checks if account has balance
    'strict': true // optional, throw an error if account has no balance
})

console.log('📜 Importing Contract')
const contract = await easyMina.requestContract({
    'name': 'square',
    'sourcePath': '../contracts/build/Square.js',
    // 'sourcePath': './../contracts/build/Square.js',
    deployer
})
process.exit( 1 )
console.log('🧰 Compiling Class')
const zkApp = new Square(contract['publicKey']['field'])
const { verificationKey } = await Square.compile()

console.log('🚀 Preparing Transactions')
const tx = await Mina.transaction(
    {
        'feePayerKey': deployer['privateKey']['field'],
        'fee': 100_000_000,
        'memo': 'hello world!'
    },
    () => {
        AccountUpdate.fundNewAccount(deployer['privateKey']['field'])
        zkApp.deploy({
            'zkappKey': contract['privateKey']['field'],
            verificationKey,
            'zkAppUri': 'hello-world'
        })
        zkApp.init()
    }
)

console.log('🔍 Proving Transaction')
await tx.prove()

console.log('✍️ Signing Transaction')
const signedMessage = tx.sign([ 
    deployer['privateKey']['field'], 
    contract['privateKey']['field'] 
])

console.log('🚚 Sending Transaction')
const response = await signedMessage.send()

console.log('💾 Saving Contract')
const deployedContract = await easyMina.saveContract({ 
    response,
    verificationKey
})

console.log(`> Transaction Hash: ${deployedContract['header']['txHashExplorer']}`)
