# Interacting with Mina Protocol Using EasyMina

This script demonstrates how to interact with the Mina Protocol blockchain using the `o1js` library and the `EasyMina` module. It performs various tasks, including network configuration, importing an account, working with a deployed smart contract, and executing transactions. Here's a breakdown of the script's key steps:

## Importing Necessary Modules

```javascript
import { Mina, Field } from 'o1js'
import { EasyMina } from '../../../src/EasyMina.mjs'
```

In this section, the script imports required modules and libraries, including `Mina` and `Field` from `o1js`, as well as the custom `EasyMina` module.

## Setting Up the Mina Network

```javascript
console.log('🌐 Adding Network...')
const Berkeley = Mina.Network( 
    'https://proxy.berkeley.minaexplorer.com/graphql' 
    // 'https://api.minascan.io/node/berkeley/v1/graphql'
)
Mina.setActiveInstance(Berkeley)
```

Here, the script sets up the Mina network by specifying the GraphQL endpoint, enabling communication with the Berkeley network of the Mina Protocol.

## Initializing EasyMina

```javascript
console.log('✨ Adding EasyMina...')
const easyMina = new EasyMina({ 'networkName': 'berkeley' })
```

An instance of `EasyMina` is created, simplifying interactions with the Mina Protocol. The network name is set to 'berkeley' to indicate the target network.

## Importing an Account

```javascript
console.log('🔑 Importing Account...')
const deployer = await easyMina.getAccount({
    'name': 'bob',
    'groupName': 'a',
    'checkStatus': true,
    'strict': true
})
console.log('   Explorer:', deployer['explorer'])
```

This section imports an account named 'bob' from the 'a' group using the `getAccount` method. It checks the account's status and logs the account's 'explorer' property.

## Importing a Deployed Contract

```javascript
console.log('📝 Adding Contract...')
const contract = await easyMina.getDeployedContract({
    'name': 'square',
    'projectName': 'getting-started'
})
console.log('   Explorer:', contract['explorer'])
```

The script imports a deployed smart contract named 'square' with the project name 'getting-started' using the `getDeployedContract` method. It logs the contract's 'explorer' property.

## Loading Smart Contract Code

```javascript
console.log('📄 Loading Smart Contract Code...')
const { sourceCode } = contract
const { Square } = await easyMina.loadModuleExperimental({ sourceCode })
```

This part loads the source code of the smart contract and extracts the `Square` class using `loadModuleExperimental`. It prepares the contract code for further use.

## Compiling and Preparing Transactions

```javascript
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
        zkAppInstance.update( Field( 9 ) ) 
    }
)
```

In this section, the script creates an instance of the `Square` class, awaits the compilation of the contract, and prepares a transaction. The transaction includes details such as the fee payer, fee amount, memo, and performs an update operation on the smart contract. Note that with each execution, the number in the `Field` class needs to be adjusted, for example, 9, 81, 6561, 43046721...

## Proving, Signing, and Sending Transactions

```javascript
console.log('🔍 Proving Transaction...')
await tx.prove()

console.log('✍️ Signing Transaction...')
const signedMessage = tx.sign([deployer['privateKey']['field']])

console.log('🚚 Sending Transaction...')
const response = await signedMessage.send()
console.log(`   Explorer URL: https://minascan.io/berkeley/tx/${response.hash()}`)
```

The script proves the transaction, signs it using the deployer's private key, and sends the transaction. It also logs the explorer URL of the transaction for reference.