# Deploying a Smart Contract on Mina Protocol

This script demonstrates the process of deploying a smart contract on the Mina Protocol blockchain using the `o1js` library. It includes the following steps:

## Importing Necessary Modules

```javascript
import { Mina, AccountUpdate } from 'o1js'
import { EasyMina } from 'easymina'
import { Square } from '../contracts/build/Square.js'
```

In this section, we import the required modules and libraries for interacting with the Mina Protocol. `o1js` provides essential functionality, and we also import the `EasyMina` class and a smart contract class named `Square`.

## Setting Up the Mina Network

```javascript
console.log('🌐 Adding Network')
const Berkeley = Mina.Network( 
     'https://proxy.berkeley.minaexplorer.com/graphql' 
    //'https://api.minascan.io/node/berkeley/v1/graphql'
)
Mina.setActiveInstance(Berkeley)
```

Here, we specify and activate the Mina network by providing the GraphQL endpoint. The script is configured to interact with the Berkeley network of the Mina Protocol.

## Initializing EasyMina

```javascript
console.log('✨ Adding EasyMina')
const easyMina = new EasyMina( { 'networkName': 'berkeley' } )
```

We initialize an instance of the `EasyMina` class, specifying the network name as 'berkeley.' This instance simplifies various interactions with the Mina Protocol.

## Importing Accounts

```javascript
console.log('🔑 Importing Accounts')
const deployer = await easyMina.getAccount( {
    'name': 'alice',
    'groupName': 'a',
    'checkStatus': true, // optional, checks if account has balance
    'strict': true // optional, throw an error if account has no balance
} )
console.log('   Explorer:', deployer['explorer'])
```

This section imports an account named 'alice' from the 'a' group using the `getAccount` method. It optionally checks the account's status and throws an error if the account has no balance. The account information, including the 'explorer' property, is logged.

## Importing and Compiling the Contract

```javascript
console.log('📜 Importing Contract')
const contract = await easyMina.requestContract( {
    'name': 'square',
    'sourcePath': '../contracts/build/Square.js',
    deployer
} )

console.log('🧰 Compiling Class')
const zkApp = new Square(contract['publicKey']['field'])
const { verificationKey } = await Square.compile()
```

In this part, the script imports the 'square' contract and compiles it. The contract's public key is used to initialize the `zkApp` object. The verification key is extracted from the compiled contract.

## Preparing and Proving Transactions

```javascript
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
```

Here, the script prepares and configures a transaction, specifying the fee, fee payer, and memo. It funds the deployer account and deploys the 'zkApp' with its associated keys and a 'zkAppUri.' Afterward, it proves the transaction.

## Signing and Sending Transactions

```javascript
console.log('✍️  Signing Transaction')
const signedMessage = tx.sign([ 
    deployer['privateKey']['field'], 
    contract['privateKey']['field'] 
])

console.log('🚚 Sending Transaction')
const response = await signedMessage.send()
```

This section signs the transaction with the deployer's and contract's private keys. Then, it sends the signed transaction.

## Saving the Deployed Contract

```javascript
console.log('💾 Saving Contract')
const deployedContract = await easyMina.saveContract({ 
    response,
    verificationKey
})

console.log('   Explorer:', deployedContract['header']['txHashExplorer'])
```

Finally, the script saves the deployed contract and logs its associated transaction hash in the explorer.