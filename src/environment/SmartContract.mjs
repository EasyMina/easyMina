/*
    Name
        SmartContract.js
    Description
        This class contains methods through which one can interact with the Smart Contract. 
    Blocks
        {
            'console': { ...config['console'] },
            'docs': { ...config['docs'] },
            'environment': { ...config['environment'] },
            'meta': { ...config['meta'] },
            'network': { ...config['network'] }
        }
    Public
        Variables
        Methods
            .init( { config, smartContractPath, smartContractClassName } ) (async)
            .deploy( { accountPath } ) (async)
*/


import fs from 'fs'
import moment from 'moment'


export class SmartContract {
    #config
    #contract
    #snarkyjs
    #state

    constructor() {}


    async init( { config={}, smartContractPath, smartContractClassName } ) {
        this.#config = { ...config }
        this.#state = {
            'contract': {
                'path': smartContractPath,
                'className': smartContractClassName
            }
        }


        await this.#addSnarkyjs()
        await this.#addContract()

        return  true
    }


    async deploy( { accountPath } ) {
        let struct

        console.log( `  Smart Contract       🟩 ${this.#state['contract']['path']}` )
        console.log( `  Class Name           🟩 ${this.#state['contract']['className']}` )
        struct = await this.#deployPrepare( { accountPath } )

        process.stdout.write( `  Verification Key    ` )
        const start = new Date()
        await this.#addVerificationKey()
        const end = Math.round( ( new Date() - start ) / 1000 )
        console.log( '', `🟩 ${end} seconds`)

        process.stdout.write( `  Send Transaction     ` )
        struct = await this.#deploySend( { struct } )
        console.log( `🟩 ${struct['transaction']['explorer']}` )

        process.stdout.write( `  Save Contract        ` )
        const data = this.#deploySavePrepare( { struct } )
        const path = this.#deploySave( { data } )
        console.log( `🟩 ${path}` )

        return true
    }


    async #addSnarkyjs() {
        this.#snarkyjs = await import( 'snarkyjs' )

        return true
    }


    async #addContract() {
        const messages = []

        const struct = {
            'source': null,
            'className': null,
            'content': null,
            'verificationKey': null
        }

        struct['source'] = this.#state['contract']['path']
        struct['className'] = this.#state['contract']['className']

        struct['content'] = fs.readFileSync( 
            struct['source'], 
            'utf8' 
        )

        const raw = await import( struct['source'] )
        struct['class'] = raw[ struct['className'] ]
        struct['methods'] = [ struct['className'], '_methods' ]
            .reduce( ( acc, key, index, all ) => {
                try {
                    acc = acc[ key ]
                    if( index === all.length - 1 ) {
                        acc = acc.map( b  => b['methodName'] )
                    }
                } catch( e ) {
                    console.log( e )
                    acc = []
                }
                return acc
            }, raw )

        if( struct['class'] === null || struct['class'] === undefined ) {
            messages.push( `smartContractClass "${smartContractClassName}": is not found` )
        }

        if( messages.length !== 0 ) {
            messages
                .forEach( ( msg, index, all ) => {
                    index === 0 ? console.log( `Load Smart Contract: Input error` ) : ''
                    console.log( `  - ${msg}` )
        
                    if( index === all.length -1 ) {
                        let url = ''
                        url += this.#config['docs']['url']
                        url += this.#config['docs']['deployContract']
                        url += '#' + this.#config['docs']['options']
        
                        console.log( `  For more information visit: ${url}`)
                    }
                } )
            process.exit( 1 )
        } else {
            this.#contract = struct
        }

        return true
    }


    #deploySave( { data } ) {
        let path = ''
        path += this.#config['environment']['addresses']['contracts']['fullFolder']
        path += data['meta']['fileName']

        if( !fs.existsSync( path ) ) {
            fs.writeFileSync( 
                path, 
                JSON.stringify( data, null, 4 ),
                'utf-8'
            )
        }

        return path
    }


    #deploySavePrepare( { struct } ) {
        const result = {
            'meta': {
                'fileName': null,
                'easyMinaVersion': null
            },
            'data': {
                'name': '',
                'type': 'contract',
                'chain': null,
                'time': {
                    'unix': null,
                    'format': null
                },
                'feePayer': {
                    'name': '',
                    'public': null,
                    'explorer': null
                },
                'address': {
                    'public': null,
                    'private': null,
                    'explorer': null
                },
                'verificationKey': null,
                'smartContract': {
                    'className': null,
                    'content': null
                },
                'transaction': {
                    'hash': null,
                    'explorer': null
                }
            },
            'comment': null
        }

        result['meta']['fileName'] = [ 
            [ '{{name}}', this.#config['meta']['name'] ],
            [ '{{splitter}}', this.#config['environment']['addresses']['splitter'] ],
            [ '{{unix}}', this.#config['meta']['unix'] ]
        ]
            .reduce( ( acc, a, index ) => {
                ( index === 0 ) ? acc = this.#config['environment']['addresses']['contracts']['fileNameStruct'] : ''
                acc = acc.replace( a[ 0 ], a[ 1 ] )
                return acc
            }, '' )

        const network = this.#config['network']['use']
        const n = [
            [ 'meta__easyMinaVersion', this.#config['meta']['easyMinaVersion'] ],
            [ 'data__chain', this.#config['network']['use'] ],
            [ 'data__name', this.#config['meta']['name'] ],
            [ 'data__address__public', struct['destination']['public'] ],
            [ 'data__address__private', struct['destination']['private'] ],
            [ 'data__address__explorer', `${this.#config['network'][ network ]['explorer']['wallet']}${struct['destination']['public']}` ],
            [ 'data__feePayer__name', struct['deployer']['name'] ],
            [ 'data__feePayer__public', struct['deployer']['public'] ], 
            [ 'data__feePayer__explorer', `${this.#config['network'][ network ]['explorer']['wallet']}${struct['deployer']['public']}` ],
            [ 'comment', this.#config['console']['messages']['accountComment'] ],
            [ 'data__time__unix', moment().unix() ],
            [ 'data__time__format', moment().format() ],
            [ 'data__verificationKey', this.#contract['verificationKey'] ],
            [ 'data__smartContract__className', this.#contract['className'] ],
            [ 'data__smartContract__methods', this.#contract['methods'] ],
            [ 'data__smartContract__content', this.#contract['content'] ],
            [ 'data__transaction__hash', struct['transaction']['hash'] ],
            [ 'data__transaction__explorer', struct['transaction']['explorer'] ],
        ]
            .forEach( a => {
                const [ key, value ] = a
                const keys = key.split( '__' )

                switch( keys.length ) {
                    case 1:
                        result[ keys[ 0 ] ] = value ? value : ''
                        break
                    case 2:
                        result[ keys[ 0 ] ][ keys[ 1 ] ] = value ? value : ''
                        break
                    case 3:
                        result[ keys[ 0 ] ][ keys[ 1 ] ][ keys[ 2 ] ] = value ? value : ''
                        break
                    default:
                        break
                }
            } )

        return result
    }


    async #deployPrepare( { accountPath, smartContractPath } ) {

        const struct = {
            'deployer': {
                'source': null,
                'name': null,
                'private': null,
                'public': null,
                'encodedPrivate': null
            },
            'destination': {
                'source': null,
                'private': null,
                'public': null,
                'encodedPrivate': null
            },
            'transaction': {
                'status': null,
                'fee': null,
                'hash': null,
                'explorer': null
            }
        }

        const m = [
            [ 'deployer', 'deployers' ],
            [ 'destination', 'deployers' ]
        ]
            .forEach( keys => {
                const [ one, two ] = keys 
                struct[ one ]['source'] = accountPath
            } )

        struct['transaction']['fee'] = 
            this.#config['network'][ this.#config['network']['use'] ]['transaction_fee']

        const n = [
            'deployer', 
            'destination'
        ]
            .forEach( key => {
                let _private
                switch( key ) {
                    case 'deployer':
                        const tmp = fs.readFileSync( struct['deployer']['source'], 'utf-8' )
                        const json = JSON.parse( tmp )
                        _private = json['data']['address']['private']
                        struct['deployer']['name'] = json['meta']['fileName']
                        break
                    case 'destination':
                        _private = this.#snarkyjs.PrivateKey
                            .random()
                            .toBase58()
                        break
                    default:
                        console.log( `Key: ${key} not found` )
                        process.exit( 1 )
                        break
                } 

                struct[ key ]['private'] = _private

                struct[ key ]['encodedPrivate'] = this.#snarkyjs.PrivateKey
                    .fromBase58( struct[ key ]['private'] )

                struct[ key ]['public'] = struct[ key ]['encodedPrivate']
                    .toPublicKey()
                    .toBase58()
            } )

        return struct
    }


    async #addVerificationKey() {
        const compiled = await this.#contract['class'].compile()
        this.#contract['verificationKey'] = compiled['verificationKey']
        return true
    }


    async #deploySend( { struct } ) {
        struct['transaction']['status'] = 'failed'
        try {
            const zkApp = new this.#contract['class']( 
                struct['destination']['encodedPrivate'].toPublicKey()
            )

            const deployTxn = await this.#snarkyjs.Mina.transaction(
                {
                    'feePayerKey': struct['deployer']['encodedPrivate'], 
                    'fee': struct['transaction']['fee']
                },
                () => {
                    this.#snarkyjs.AccountUpdate
                        .fundNewAccount( struct['deployer']['encodedPrivate'] )
    
                    zkApp.deploy( {
                        'zkappKey': struct['destination']['encodedPrivate'], 
                        'verificationKey': this.#contract['verificationKey'],
                        'zkAppUri': 'hello-world'
                    } )
    
                    zkApp.init( 
                        struct['destination']['encodedPrivate'] 
                    )
                }
            )

            const response =  await deployTxn
                .sign( [ 
                    struct['deployer']['encodedPrivate'],
                    struct['destination']['encodedPrivate']
                ] )
                .send()

            struct['transaction']['status'] = 'success'
            struct['transaction']['hash'] = await response.hash()

            struct['transaction']['explorer'] = ''
            struct['transaction']['explorer'] += 
                this.#config['network'][ this.#config['network']['use'] ]['explorer']['transaction']
            struct['transaction']['explorer'] += struct['transaction']['hash']
        } catch( e ) {
            console.log( `Error: Deploy Send ${e}` )
            process.exit( 1 )
        }

        return struct
    }
}