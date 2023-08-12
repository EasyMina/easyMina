/*

2023 EasyMina

Disclaimer:
The use of this code is at your own risk. The entire code is licensed under the Apache License 2.0, which means you are granted certain rights to use, modify, and distribute the code under the terms of the license. However, please be aware that this module was created for learning purposes and testing smart contracts.
This module is intended to provide a platform for educational and testing purposes only. It may not be suitable for use in production environments or for handling real-world financial transactions. The authors or contributors shall not be liable for any damages or consequences arising from the use of this module in production or critical applications.
Before using this module in any capacity, including educational or testing purposes, it is strongly recommended to review and understand its functionality thoroughly. Furthermore, it is advised to refrain from using this module for any sensitive or production-related tasks.
By using this code, you agree to the terms of the Apache License 2.0 and acknowledge that the authors or contributors shall not be held responsible for any issues or damages that may arise from its use, including educational or testing purposes.
Please read the full Apache License 2.0 for more details on your rights and responsibilities regarding the usage of this code.


    Name
        EasyMina.mjs
    Description
        This class serves as a wrapper to connect the classes mentioned below. It also stores the state of EasyMina globally.
    Tree
        config.mjs
            |--- PrintConsole.mjs
            |--- EasyMina.mjs
                |--- Account.mjs
                    |--- Cryption.mjs
                    |--- Faucet.mjs    
                        |--- PrintConsole.mjs
            |--- Credentials.mjs
            |--- SmartContract.mjs
            |--- Workspace.mjs
                |--- mixed.mjs
            |--- GraphQl.mjs
                |--- PrintConsole.mjs
    Blocks
        {
            'console': { ...config['console'] },
            'docs': { ...config['docs'] },
            'environment': { ...config['environment'] },
            'graphQl': { ...config['graphQl'] },
            'messages': { ...config['messages'] },
            'meta': { ...config['meta'] },
            'network': { ...config['network'] },
            'print': { ...config['print'] },
            'typescript': { ...config['typescript'] },
            'validations': { ...config['validations'] },
        }
    Public
        Variables
            state
            account
        Methods
            .setEnvironment( { silent=false }={} )
            .deployContract( {} )
            .health()
            .getConfig()
*/



import moment from 'moment'
import fs from 'fs'

import { GraphQl } from './interactions/GraphQl.mjs'

import { configImported } from './data/config.mjs'
import { Credentials } from './environment/Credentials.mjs'
import { Workspace } from './environment/Workspace.mjs'
import { SmartContract } from './environment/SmartContract.mjs'

import { Account } from './accounts/Account.mjs'
import { PrintConsole } from './helpers/PrintConsole.mjs'
import { findClosestString, keyPathToValue } from './helpers/mixed.mjs'


export class EasyMina {

    #printConsole
    #config
    state
    account


    constructor() {
        this.#setConfig()
        return true
    }


    #setConfig() {
        const config = configImported
        const n = [
            'deployers', 
            'contracts'
        ]
            .forEach( key => {
                config['environment']['addresses'][ key ]['fullFolder'] = ''
                config['environment']['addresses'][ key ]['fullFolder'] += process.cwd() + '/'
                config['environment']['addresses'][ key ]['fullFolder'] += config['environment']['addresses']['root']
                config['environment']['addresses'][ key ]['fullFolder'] += config['environment']['addresses'][ key ]['folder']
            } )

        const m = [ 
            'typescript', 
            'build'
        ]
            .forEach( key => {
                let path = ''
                // path += process.cwd() + '/'
                path += config['environment']['workspace']['contracts']['root']
                path += config['environment']['workspace']['contracts'][ key ]['folder']
                config['environment']['workspace']['contracts'][ key ]['fullRelative'] = path

                config['environment']['workspace']['contracts'][ key ]['full'] = ''
                config['environment']['workspace']['contracts'][ key ]['full'] += process.cwd() + '/'
                config['environment']['workspace']['contracts'][ key ]['full'] += 
                    config['environment']['workspace']['contracts'][ key ]['fullRelative']
            } )

        config['typescript']['template']['compilerOptions']['outDir'] = 
            config['environment']['workspace']['contracts']['build']['fullRelative']

        config['typescript']['template']['compilerOptions']['rootDir'] = 
            config['environment']['workspace']['contracts']['typescript']['fullRelative']

        config['typescript']['template']['include'] = [
            config['environment']['workspace']['contracts']['typescript']['fullRelative']
        ]

        config['environment']['workspace']['contracts']['typescript']['fileName'] = [
            [ '{{name}}', config['meta']['name'] ],
            [ '{{splitter}}', config['environment']['addresses']['splitter'] ]
        ]
            .reduce( ( acc, a, index ) => {
                const [ search, value ] = a
                acc = acc.replace( search, value )
                return acc
            }, config['environment']['template']['source']['name'] )

        config['environment']['addresses']['deployers']['fileName'] = [ 
            [ '{{name}}', config['meta']['name'] ],
            [ '{{splitter}}', config['environment']['addresses']['splitter'] ],
            [ '{{unix}}', config['meta']['unix'] ]
        ]
            .reduce( ( acc, a ) => {
                const [ one, two ] = a
                acc = acc.replace( one, two )
                return acc
            }, config['environment']['addresses']['deployers']['fileNameStruct'] )

        this.#config = config
        
        return true
    }


    async setEnvironment( { silent=false }={} ) {

        this.#validUserInput( { 'method':'setEnvironment', 'args': arguments } )
        this.#setConfig()

        const logo = `
     -- - - - - - --*-- - - - - - --
    |       ___           ___       |
    |      /\\  \\         /\\__\\      |
    |     /::\\  \\       /::|  |     |
    |    /:/\\:\\  \\     /:|:|  |     |
    |   /::\\~\\:\\  \\   /:/|:|__|__   |
    |  /:/\\:\\ \\:\\__\\ /:/ |::::\\__\\  |
    |  \\:\\~\\:\\ \\/__/ \\/__/~~/:/  /  |
    |   \\:\\ \\:\\__\\         /:/  /   |
    |    \\:\\ \\/__/        /:/  /    |
    |     \\:\\__\\         /:/  /     |
    |      \\/__/         \\/__/      |
    |                               |
     -- - -- E a s y M i n a -- - -- 
    | change the world with zk tech |  
    ---------------------------------  
`
        console.log( logo )
        console.log( 'PROJECT' )
        console.log( `  Name                 🟩 ${this.#config['meta']['name']}` )
        console.log( `  ClassName            🟩 ${this.#config['environment']['template']['source']['className']}` )
        console.log( `  Timestamp            🟩 ${this.#config['meta']['unix']}` )
        console.log( 'ENVIRONMENT' )

        this.state = {
            'accounts': {
                'deployers': [],
                'contracts': []
            },
            'account': false
        }

        this.#printConsole = new PrintConsole()
        this.#printConsole.init( {
            'config': {
                'print': { ...this.#config['print'] },
                'messages': { ...this.#config['messages'] }
            }
        } )

        this.#addEnvironmentCredentials()

        await this.#addEnvironmentWorkspace() 

        console.log( 'CREDENTIALS' )
        const { status, transactionHash }= await this.#addDeployers()

        if( status === 'pending' || status === 'new' ) {
            const graphQl = new GraphQl()
            const config = {
                'network': { ...this.#config['network'] },
                'graphQl': { ...this.#config['graphQl'] },
                'messages': { ...this.#config['messages'] },
                'print': { ...this.#config['print'] }
            }
            graphQl.init( { config } )

            const cmd = 'transactionByHash'
            const vars = {
                'hash': transactionHash
            }

            await graphQl.waitForSignal( { cmd, vars } )
            console.log( `  Faucet               🟩 Found` )
            process.exit( 1 )
        }


        console.log()
        return this
    }


    async deployContract( {} ) {
        console.log( 'Deploy Contract' )
        
        this.#validUserInput( { 'method':'deployContract', 'args': arguments } ) 
        this.#setConfig()

        let _accountPath = null
        if( this.account ) {
            _accountPath = this.account['state']['path']
        } else {
        }

        let [ accountPath, smartContractPath ] = this.#validUserInputTypescript( { 'accountPath': _accountPath } )

        if( this.account ) {
            process.stdout.write( '  Acccount             ' )
            this.account = await this.#initAccount( { 'mode': 'read', 'path': accountPath } ) 
            console.log( `🟩 ${accountPath}` )
        }

        const config = {
            'meta': { ...this.#config['meta'] },
            'docs': { ...this.#config['docs'] },
            'environment': { ...this.#config['environment'] },
            'network': { ...this.#config['network'] },
            'console': { ...this.#config['console'] }
        }

        const smartContractClassName = this.#config['environment']['template']['source']['className']
        const smartContract = new SmartContract()
        await smartContract.init( { config, smartContractPath, smartContractClassName } )
        await smartContract.deploy( { accountPath } )

        return this
    }


    health() {
        return this.#config['meta']['easyMinaVersion']
    }


    getConfig() {
        return this.#config
    }


    #validUserInputTypescript( { accountPath=null}) {
        const messages = []
        const paths = {
            'deployerFileName': null,
            'smartContractFileName': null,
            'smartContractFileNameModule': null
        }

        if( accountPath === null ) {
            paths['deployerFileName'] = ''
            paths['deployerFileName'] += this.#config['environment']['addresses']['deployers']['fullFolder']
            paths['deployerFileName'] += this.#config['environment']['addresses']['deployers']['fileName']
        } else {
            paths['deployerFileName'] = accountPath
        }
/*
        if( !fs.existsSync( paths['deployerFileName'] ) ) {
            messages.push( `Path to "deployerFileName" does not exist:  ${paths['deployerFileName']}` )
        }
*/
        paths['smartContractFileName'] = ''
        paths['smartContractFileName'] += this.#config['environment']['workspace']['contracts']['build']['full']
        paths['smartContractFileName'] += this.#config['environment']['workspace']['contracts']['typescript']['fileName']
            .replace( '.ts', '.js' )

        paths['smartContractFileNameModule'] = paths['smartContractFileName']
            .replace( '.js', '.mjs' )

        if( !fs.existsSync( paths['smartContractFileName'] ) ) {
            messages.push( `Build path from "smartContractFileName" does not exist. Did you forget to run "tsc"?` )
        }

        if( messages.length === 0 ) {
            const fileContents = fs.readFileSync( paths['smartContractFileName'] )
            fs.writeFileSync( paths['smartContractFileNameModule'], fileContents )
        }

        messages
            .forEach( ( msg, index, all ) => {
                index === 0 ? console.log( `  .deployContract(): ❗ Input error` ) : ''
                console.log( `    - ${msg}` )
    
                if( index === all.length -1 ) {
                    let url = ''
                    url += this.#config['docs']['url']
                    url += this.#config['docs']['deployContract']
                    url += '#' + this.#config['docs']['options']
    
                    console.log()
                    console.log( `  For more information visit: ${url}`)
                }
            } )

        if( messages.length === 0 ) {
            return [ paths['deployerFileName'], paths['smartContractFileNameModule'] ]
        } else {
            process.exit( 1 )
        }
    }


    #validUserInput( { method='', args={} } ) {
        const messages = []

        const language = 'en'
        const lookUp = Object
            .entries( this.#config['validations']['keyPaths'] )
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a
                value['methods']
                    .forEach( method => {
                        !Object.hasOwn( acc, method ) ? acc[ method ] = {} : ''

                        const niceName = value['userPath'][ language ]
                        acc[ method ][ niceName ] = key
                    } )
                return acc
            }, {} ) 

        const methodValid = Object
            .keys( lookUp )
            .includes( method )

        if( !methodValid ) {
            messages.push( `Method: "${method}" is not valid`)
        } else {
            Object
            .entries( args[ '0' ] )
            .forEach( a => {
                const [ key, value ] = a

                const validate = {
                    'key': null,
                    'value': false
                }

                validate['key'] = Object.hasOwn( lookUp[ method ], key )

                if( validate['key'] ) {
                    const keyPath = lookUp[ method ][ key ]
                    const regexPath = this.#config['validations']['keyPaths'][ keyPath ]['validation']
                    const regex = keyPathToValue( { 'data': this.#config, 'keyPath': `validations__regexs__${regexPath}` } )
                    validate['value'] = value.match( regex['regex'] )
                    if( validate['value'] === null ) {
                        messages.push( `"${key}": ${regex['message'][ language] }` )
                    } else {
                        const keys = lookUp[ method ][ key ].split( '__' )
                        switch( keys.length ) {
                            case 1:
                                this.#config[ keys[ 0 ] ] = value
                                break
                            case 2:
                                this.#config[ keys[ 0 ] ][ keys[ 1 ] ] = value
                                break
                            case 3:
                                this.#config[ keys[ 0 ] ][ keys[ 1 ] ][ keys[ 2 ] ] = value
                                break
                            case 4:
                                this.#config[ keys[ 0 ] ][ keys[ 1 ] ][ keys[ 2 ] ][ keys[ 3 ] ] = value
                                break
                            case 5:
                                this.#config[ keys[ 0 ] ][ keys[ 1 ] ][ keys[ 2 ] ][ keys[ 3 ] ][ keys[ 4 ] ] = value
                                break
                            default:
                                console.log( 'Key Length not found' )
                                process.exit( 1 )
                                break
                        }
                    }
                } else {
                    const nearest = findClosestString( { 'input': key, 'keys': Object.keys( lookUp[ method ] ) } )
                    messages.push( `"${key}": Key is unknown. Did you mean: ${nearest}?` )
                }
            } )
        }

        messages.forEach( ( msg, index, all ) => {
            index === 0 ? console.log( `.${method}(): Input validation error` ) : ''
            console.log( `  - ${msg}` )

            if( index === all.length -1 ) {

                let url = ''
                url += this.#config['docs']['url']
                url += this.#config['docs'][ method ]
                url += '#' + this.#config['docs']['options']

                console.log( `  For more information visit: ${url}`)
            }
        } )

        if( messages.length === 0 ) {
            return true
        } else {
            process.exit( 1 )
        }
    }


    async #addEnvironmentWorkspace() {
        // console.log( '  Workspace' )

        const config = { 
            'meta': { ...this.#config['meta'] },
            'environment': { ...this.#config['environment'] },
            'typescript': { ...this.#config['typescript'] },
            'validations': { ...this.#config['validations'] }
        }

        const workspace = new Workspace()
        workspace.init( { 'config': { ...config } } )
        await workspace.start()

        return true
    }


    #addEnvironmentCredentials() {
        // console.log( '  Credentials' )
        const credentials = new Credentials()

        credentials
            .init( { 'config': this.#config['environment']['addresses'] } )

        credentials
            .checkEnvironment()

        this.state['addresses'] = credentials
            .checkAccounts()

        return true
    }


    async #deployersValidate() {
        const availableDeployers = this.state['addresses']['deployers']
            .filter( a => a['name'] === this.#config['meta']['name'] )
            .filter( a => a.hasOwnProperty( 'unix' ) )
            .map( a => {
                a['unix'] = parseInt( a['unix'] )
                return a 
            } )
            .sort( ( a, b ) => a['unix'] - b['unix'] )

        const deployerAccounts = await Promise.all( 
            availableDeployers
                .map( async( item, index ) => {
                    const { path } = item
                    const account = await this.#initAccount( { 'mode': 'read', path } )
                    return account
                } )
        )

        const valids = deployerAccounts
            .filter( a => a.state['valid'] )

        return valids
    }


    async #deployerAccounts( { valids } ) {
        const accounts = await Promise.all(
            valids
                .map( async( account ) => {
                    await account.fetchAccount()
                    return account
                } )
        )

        let now = moment()
        const list = accounts
            .map( ( a, index ) => {
                const result = {
                    'index': index,
                    'name': a.content['meta']['fileName'],
                    'balance': a.state['balance']['balance'],
                    'transactionsLeft': a.state['balance']['transactionsLeft'],
                    'useable': null
                }

                result['useable'] = result['balance'] === null ? false : true
                result['faucets'] = a.content['data']['faucets']
                    .map( ( b, index ) => {
                        const network = this.#config['network'][ this.#config['network']['use'] ]['faucet']['network']
                        const dateFromTimestamp = moment.unix( b['timestamp'] )
                        let now = moment()
                        let differenceInMinutes = now.diff(dateFromTimestamp, 'minutes' )
                        const result = {
                            'requestedInMinutes': differenceInMinutes,
                            'network': b['network'] === network
                        }

                        return result
                    } )

                return result
            } )

        const readyToUse = list
            .filter( a => a['useable'] )
            .sort( ( a, b ) => b['transactionsLeft'] - a['transactionsLeft'] )
            .filter( a => a['transactionsLeft'] > 0 && a['useable'] )

        const faucetPending = list
            .filter( a => {
                const one = a['faucets']
                    .some( b => b['network'] && ( b['requestedInMinutes'] < 11 ) && true )
                const two = !a['useable']
                return one && two
            } )

        return [ readyToUse, faucetPending, accounts ]
    }


    async #initAccount( { mode, path } ) {
        const secret = 'abc'
        const config = {
            'meta': { ...this.#config['meta'] },
            'network': { ...this.#config['network'] },
            'console': { ...this.#config['console'] },
            'graphQl': { ...this.#config['graphQl'] },
            'console': { ...this.#config['console'] },
            'print': { ...this.#config['print'] },
            'messages': { ...this.#config['messages'] },
            'environment': { ...this.#config['environment'] }
        }

        const newAccount = new Account() 
        await newAccount.init(  { secret, config } )
        const currentPath = ( mode === 'new' ) ? await newAccount.createDeployer() : path
        newAccount.readDeployer( { 'path': currentPath } )

        return newAccount
    }


    async #deployerSelectAccount( { readyToUse, faucetPending, accounts } ) {
        let modes = [ 'known', 'pending', 'new' ]
        let status = null

        if( readyToUse.length > 0 ) {
            status = 'known'
        } else if( faucetPending.length > 0 ) {
            status = 'pending'
        } else {
            status = 'new'
        }

        let chooseAccount
        let newAccount
        let graphQl
        let transactionHash

        if( status === 'new' ) {
            // console.log( '🟩 Create Account' )
            newAccount = await this.#initAccount( { 'mode': 'new' } )
        }

        switch( status ) {
            case 'known':
                // console.log( '🟩 Use funded account' )
                chooseAccount = accounts[ readyToUse[ 0 ]['index'] ]
                break
            case 'pending':
                // console.log( '🟩 Wait for pending faucet' )

                const faucet1 = accounts[ faucetPending[ 0 ]['index'] ]['content']['data']['faucets']
                    .find( a => a['network'] === this.#config['network'][ this.#config['network']['use'] ]['faucet']['network'] )
                transactionHash = faucet1['transaction']
                chooseAccount = accounts[ faucetPending[ 0 ]['index'] ]
                break
            case 'new':
                const faucet2 = newAccount['content']['data']['faucets']
                    .find( a => a['network'] === this.#config['network'][ this.#config['network']['use'] ]['faucet']['network'] )

                transactionHash = faucet2['transaction']
                chooseAccount = newAccount
                break
            default:
                console.log( 'Status not known' )
                process.exit( 1 )
                break
        }

/*
        if( status !== 'known' ) {
            const graphQl = new GraphQl()
            const config = {
                'network': { ...this.#config['network'] },
                'graphQl': { ...this.#config['graphQl'] },
                'messages': { ...this.#config['messages'] },
                'print': { ...this.#config['print'] }
            }
            graphQl.init( { config } )

            const cmd = 'transactionByHash'
            const vars = {
                'hash': transactionHash
            }

            await graphQl.waitForSignal( { cmd, vars } )

            if( status === 'new' ) {
                await newAccount.fetchAccount()
                chooseAccount = newAccount
            }
        }
*/

        return [ chooseAccount, status, transactionHash ]
    }


    async #addDeployers() {
        // process.stdout.write( '  Overall              ' )
        const valids = await this.#deployersValidate()
        const [ readyToUse, faucetPending, accounts ] = await
            this.#deployerAccounts( { valids } )

        const [ account, status, transactionHash ] = await this.#deployerSelectAccount( { readyToUse, faucetPending, accounts } )
        this.account = account

        // process.stdout.write( '  Status               ' )

        console.log( '  Accounts ' )
        const m = [
            [ 'Funded', readyToUse.length, 'new' ],
            [ 'Pending', faucetPending.length, 'pending' ],
            [ 'Empty', ( valids.length - readyToUse.length ) - faucetPending.length, 'empty' ]
        ]
            .forEach( ( a, index, all ) => {
                let msg = ''
                if( index === all.length - 1 ) {
                    msg += '  │   └── '
                } else {
                    msg += '  │   ├── '
                }
                msg += `${a[ 0 ]} (${a[ 1 ]})`

                console.log( msg )
            } )

        console.log( `  └── ${this.account['content']['data']['address']['public']} (${status})` )

        let use = this.#config['network']['use']
        let url = ''
        url += this.#config['network'][ use ]['explorer']['wallet']
        url += this.account['content']['data']['address']['public']

        const n = [
            [ 'File', `${this.account.content['meta']['fileName']}` ],
            [ 'Explorer', url ],
        ]

        transactionHash ? n.push( [ 'Transaction', transactionHash ] ) : ''

        n
            .forEach( ( a, index, all ) => {
                let msg = ''
                if( index === all.length - 1 ) {
                    msg += '      └── '
                } else {
                    msg += '      ├── '
                }
                msg += `${a[ 1 ]}`
                console.log( msg )
            } )

/*
        let use = this.#config['network']['use']
        let url = ''
        url += this.#config['network'][ use ]['explorer']['wallet']
        url += this.account['content']['data']['address']['public']


            .join( ', ' )

        console.log( `🟩 ${msg}` )
*/

      //  process.stdout.write( '  Selection            ' )
/*
        this.#deployerSelectAccount( { readyToUse, faucetPending, accounts } )
*/

/*
        msg = ''
        msg += '  Choose               '
        msg += '🟩 '
        msg += `${this.account.content['meta']['fileName']}`
        console.log( msg )

        let _public = ''
        _public += '  Public Key           '
        _public += '🟩 '
        _public += this.account['content']['data']['address']['public']
        console.log( `${_public}` )

        let use = this.#config['network']['use']
        let url = ''
        url += '  Explorer             '
        url += '🟩 '
        url += this.#config['network'][ use ]['explorer']['wallet']
        url += this.account['content']['data']['address']['public']
        console.log( `${url}` )

        let msg1 = ''
        msg1 += '  Balance              '
        msg1 += '🟩 '
        msg1 += Object
            .entries( this.account.state['balance'] )
            .map( a => `${a[ 0 ]}: ${a[ 1 ]}` )
            .join( ', ' ) 

        console.log( msg1 )
*/

        return { status, transactionHash }
    }
}