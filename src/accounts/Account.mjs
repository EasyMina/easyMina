/*
    Name
        Account.js

    Description
        Create a Mina Account and fetch account balance.

    Blocks
        {
            'console': { ...config['console'] },
            'environment': { ...config['environment'] }
            'graphQl': { ...config['graphQl'] },
            'messages': { ...config['messages'] },
            'meta': { ...config['meta'] },
            'network': { ...config['network'] },
            'print': { ...config['print'] },
        }

    Public:
        Variables
        Methods
            .init( { secret, config } ) (async)
            .readDeployer( { path } ) 
            .createDeployer()
            .fetchAccount()
*/


import fs from 'fs'
import { Cryption } from './Cryption.mjs'
import { Faucet } from './Faucet.mjs'


export class Account {
    #cryption
    #snarkyjs
    #validation


    constructor() {
        this.config = {}

        this.#cryption
        this.#snarkyjs
        this.#validation

        this.state
        this.content

        this.#cryption = new Cryption()
    }


    async init( { secret, config } ) {
        this.state = {
            'path': null,
            'snarkyIsReady': false,
            'valid': false,
            'useable': false,
            'faucet': false,
            'balance': {}
        }

        this.config = { ...config }

        this.#cryption.init( { secret } )
        this.content = {}   

        if( !this.state['snarkyIsReady'] ) {
            await this.#addSnarkyjs()
        }

        return true
    }


    readDeployer( { path } ) {
        this.state['path'] = path
        this.#checkValidation()

        return true
    }


    async createDeployer() {
        const struct = this.#newAccountStruct( { 'type': 'deployer' } )
        const receiver = struct['data']['address']['public']
        const faucetResponse = await this.#requestFaucet( { receiver } )

        struct['data']['faucets'].push( faucetResponse['faucet'] )
        this.content = struct

        let path = ''
        path += this.config['environment']['addresses']['deployers']['fullFolder']
        path += struct['meta']['fileName']

        if( !fs.existsSync( path ) ) {
            fs.writeFileSync( 
                path, 
                JSON.stringify( struct, null, 4 ), 
                'utf-8' 
            )
        } else {
            console.log( 'Deployer File already exists something went wrong!' )
            process.exit( 1 )
        }

        return path
    }


    async fetchAccount() {
        const status = await this.#accountStatus()
        await this.#accountBalance( { status } )
        return true
    }


    #checkValidation() {
        this.#validation = {
            'validJson': false,
            'encryptionActivated': false,
            'encryptionValid': true,
            'validStruct': false,
        }

        this.#validJson()
        this.#checkEncrypted()
        this.#checkStruct()

        this.state['valid'] = [ 
            'validJson', 
            'encryptionValid', 
            'validStruct' 
        ]
            .map( key  => this.#validation[ key ] )
            .every( a => a )

        return true
    }


    #validJson() {
        try {
            const raw = fs.readFileSync( 
                this.state['path'],
                'utf-8'
            )
    
            this.content = JSON.parse( raw )
            this.#validation['validJson'] = true
        } catch( e ) {
            console.log( 'e', e )
        }

        return true
    }


    #checkEncrypted() {
        if( !this.#validation['validJson'] ) {
            return true
        }

        this.#validation['encryptionActivated'] = [ 'iv', 'content' ]
            .every( item => {
                const result = Object
                    .keys( item )
                    .every( key => {
                        const r = Object
                            .keys( this.content )
                            .some( obj => { 
                                Object
                                    .keys( obj )
                                    .includes( key )
                            } )
                        return r
                    } )
                return result
            } )

        if( this.#validation['encryptionActivated'] ) {
            try {
                const decrypt = this.#cryption
                    .decrypt( { 'hash': this.content } )

                console.log( '>> Decrypt', decrypt )

                this.content = JSON.parse( decrypt['content'])

                console.log( '>>', this.#validation['encrypted'] )
            } catch( e ) {
                console.log( '>> Decrypt Error', e )
                this.#validation['encryptionValid'] = false
            }

        }

        return true
    }


    #checkStruct() {
        if( !this.#validation['validJson'] ) {
            return true
        }

        const checks = Object
            .entries( this.config['environment']['addresses']['structs']['deployer'] )
            .reduce( ( acc, a ) => {
                const [ cmd, tests ] = a
                const keys = cmd
                    .split( this.config['environment']['addresses']['structs']['split'] )

                acc[ cmd ] = {
                    'exists': false,
                    'checks': keys.map( b => false )
                }

                let value = null
                switch( keys.length ) {
                    case 1:
                        value = this.content['data'][ keys[ 0 ] ]
                        break
                    case 2:
                        try {
                            value = this.content['data'][ keys[ 0 ] ][ keys[ 1 ] ]
                        } catch {}
                        break
                    default:
                        /*
                            this.#consolePrintLine( { 
                                'first' : `"${key.length}" not defined` 
                            } )
                        */
                        break
                }

                value === undefined ? value = null : ''
                value !== null ? acc[ cmd ]['exists'] = true : ''

                if( acc[ cmd ]['exists'] ) {
                    acc[ cmd ]['checks'] = tests
                        .map( mode => {
                            let check = false
                            switch( mode ) {
                                case 'String': 
                                    if( typeof value === 'string' || value instanceof String ) {
                                        check = true
                                    }
                                    break
                                case 'Int':
                                    Number.isInteger( value ) ? check = true : ''
                                    break
                                case 'MinaPublicAddress':
                                    if( typeof value === 'string' || value instanceof String ) {
                                        const t = value.match( this.config['environment']['addresses']['structs']['minaAddressRegex'] )
                                        if( t !== undefined && t !== null ) {
                                            check =  true
                                        }
                                    }
                                    break
                                case 'Array':
                                    Array.isArray( value ) ? check = true : ''
                                    break
                            }

                            return check
                        } )            
                }

                return acc
            }, {} )

        this.#validation['validStruct'] = Object
            .entries( checks )
            .map( a => {
                const [ key, value ] = a
                return value['checks']
                    .every( a => a )
            } )
            .every( a => a )
    }


    async #addSnarkyjs() {
        this.#snarkyjs = await import( 'snarkyjs' )

        const node = this.config['network'][ this.config['network']['use'] ]['nodeProxy'] 
        const Berkeley = this.#snarkyjs.Mina.BerkeleyQANet( node )
        this.#snarkyjs.Mina.setActiveInstance( Berkeley )
        this.state['snarkyIsReady'] = true

        return true
    }


    async #accountStatus() {
        const checks = {
            'fetch': false,
            'known': false
        }

        if( this.state['valid'] ) {
            if( !this.state['snarkyIsReady'] ) {
                await this.#addSnarkyjs()
            }
        }

        let account = {}
        try {
            account = await this.#snarkyjs.fetchAccount( {
                'publicKey': this.content['data']['address']['public']
            } )
            checks['fetch'] = true
        } catch( e ) {
            console.log( `Error could not catch Account` )
        }

        if( checks['fetch'] ) {
            if( account['account'] !== undefined ) {
                checks['known'] = true
            }
        }

        const result = {
            'valid': checks['fetch'],
            'known': checks['known'],
            'account': account
        }

        return result
    }
    

    async #accountBalance( { status } ) {
        let balance = {
            'balance': null,
            'transactionsLeft': null,
            'nonce': null
        }

        if( status['valid'] & status['known'] ) {
            balance = [ 'balance', 'nonce' ]
                .reduce( ( acc, key, index ) => {
                    let value
                    try {
                        switch( key ) {
                            case 'balance': 
                                acc['transactionsLeft'] = null
                                value = status['account']['account']['balance']
                                acc[ key ] = parseInt( value )

                                const network = this.config['network']['use']
                                const transactionFee = this.config['network'][ network ]['transaction_fee']
                                
                                if( acc[ key ] > transactionFee ) {
                                    acc['transactionsLeft'] = Math.floor(
                                        acc[ key ] / transactionFee
                                    )
                                } else {
                                    acc['transactionsLeft'] = 0
                                }
                                break
                            case 'nonce':
                                value = status['account']['account']['nonce']['value']
                                acc[ key ] = parseInt( value )
                                break
                            default:
                                console.log( 'Something went wrong' )
                                break
                        }
                    } catch( e ) {
                        acc[ key ] = null
                    }

                    return acc
                }, {} )
        }

        this.state['balance'] = balance

        if( this.state['balance']['transactionsLeft'] !== null ) {
            if( this.state['balance']['transactionsLeft'] !== 0 ) {
                this.state['useable'] = true
            }
        }

        return true
    }


    #newAccountStruct( { type } ) {
        const struct = {
            'meta': {
                'fileName': null,
                'easyMinaVersion': null
            }, 
            'data': {
                'name': this.config['meta']['name'],
                'type': type,
                'time': {
                    'unix': this.config['meta']['unix'],
                    'format': this.config['meta']['format']
                },
                'address': {
                    'public': null,
                    'private': null
                },
                'explorer': {},
                'faucets': [],
                'comment': this.config['console']['messages']['accountComment']
            }
        }

        struct['meta']['easyMinaVersion'] = this.config['meta']['easyMinaVersion']
        struct['data']['address']['private'] = this.#snarkyjs.PrivateKey
            .random()
            .toBase58()

        struct['data']['address']['public'] = this.#snarkyjs.PrivateKey
            .fromBase58( struct['data']['address']['private'] )
            .toPublicKey()
            .toBase58()

        const network = this.config['network']['use']
        struct['data']['explorer'][ network ] = ''
        struct['data']['explorer'][ network ] += this.config['network'][ network ]['explorer']['wallet']
        struct['data']['explorer'][ network ] += struct['data']['address']['public']

        struct['meta']['fileName'] = this.config['environment']['addresses']['deployers']['fileName']

        return struct
    }


    async #requestFaucet( { receiver } ) {
        const config = {
            'network': { ...this.config['network'] },
            'graphQl': { ...this.config['graphQl'] },
            'print': { ...this.config['print'] }, 
            'messages': { ...this.config['messages'] },
        }

        const faucet = new Faucet()
        faucet.init( { config } )
        const response = await faucet.start( { receiver } )

        return response
    }
}