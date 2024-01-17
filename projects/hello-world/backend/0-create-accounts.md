# Using EasyMina to Create Accounts

This script demonstrates the usage of the `EasyMina` module to create accounts in the context of the Mina Protocol blockchain. The script includes the following steps:

## Importing the EasyMina Module

```javascript
import { EasyMina } from 'easymina'
```

In this line, we import the `EasyMina` class from a module located at `easymina`. The `EasyMina` class is a utility for interacting with the Mina Protocol.

## Initializing EasyMina

```javascript
console.log('✨ Adding EasyMina...')
const easyMina = new EasyMina( { 'networkName': 'berkeley' })
```

Here, we initialize an instance of the `EasyMina` class by providing an object with the `'networkName'` set to `'berkeley'`. This configuration likely specifies the network environment to interact with.

## Creating Accounts

```javascript
console.log('🔑 Creating Accounts...')
const deployers = await easyMina.createAccounts({
    'names': ['alice', 'bob', 'charlie'],
    'groupName': 'a'
})
```

This section initializes the account creation process by utilizing the `createAccounts` method provided by the `easyMina` instance. It creates three accounts named 'alice,' 'bob,' and 'charlie' and assigns them to the 'a' group. If the account already exists, the process is skipped. The use of the `await` keyword indicates that this operation is asynchronous and returns a list of the created accounts.

## Ready to Deploy

```javascript
console.log('🚀 Deployers Ready.')
```

Finally, the script indicates that the deployers (created accounts) are ready for use.