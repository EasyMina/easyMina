/*
    Name
        GraphQl.mjs
    Description
        This class establishes a connection to GraphQL and simplifies data interpretation.
    Blocks
        {
            'graphQl': { ...config['graphQl'] },
            'messages': { ...config['messages'] },
            'network': { ...config['network'] },
            'print': { ...config['print'] }
        }
    Public
        Variables
        Methods
            .init( { config } )
            .payload( { cmd, vars } )
            .request( { payload } )
            .waitForSignal( { cmd, vars } )
*/


import axios from 'axios'
import { PrintConsole } from '../helpers/PrintConsole.mjs'
import moment from 'moment'


export class GraphQl {
    #config
    #template
    #state

    constructor() {}


    init( { config={} } ) {
        this.#config = { ...config }

        this.printConsole = new PrintConsole()
        this.printConsole.init( {
            'config': { 
                'print': { ...this.#config['print'] }, 
                'messages': { ...this.#config['messages'] }
            }
        } )

        this.#state = {
            'latestBlock': null
        }

        return true
    }


    payload( { cmd, vars } ) {
        const network = this.#config['network']['use']
        const url = this.#config['network'][ network ]['graphQl']
        const data = { ...this.#config['graphQl'][ cmd ]['cmd'] }

        Object
            .entries( vars )
            .forEach( a => {
                const [ _key, _value ] = a
                data['variables'][ _key ] = _value
            } )

        const struct = {
            'cmd': cmd,
            'key': this.#config['graphQl'][ cmd ]['key'],
            'type': this.#config['graphQl'][ cmd ]['type'],
            'vars': data['variables'],
            'axios': {
                'method': 'post',
                'maxBodyLength': Infinity,
                'url': url,
                'headers': { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json'
                },
                'data': JSON.stringify( data )
            }
        }

        return struct
    }


    async request( { payload } ) {
        const result = {
            'status': false,
            'message': null,
            'response': null
        }

        try {
            const response = await axios.request( payload['axios'] )
            result['status'] = true
            result['message'] = 'success'
            result['response'] = response['data']
        } catch( e ) {
            result['message'] = 'error'
            console.log( 'Error!', e )
        }

        return result
    }


    async waitForSignal( { cmd, vars } ) {
        const before = this.payload( { 'cmd': 'latestBlockHeights', 'vars': { 'limit': 1 } } )
        this.#state['latestBlock'] = await this.request( { 'payload': before } )

        const payload = this.payload( { cmd, vars } )
        
        let msg = ' '
        msg += this.#config['network'][ this.#config['network']['use'] ]['explorer']['transaction']
        msg += vars['hash']


        let tmp = null
        let loop = true
        let result = null

        let first = true
        let lastRequest = new Date()
        while( loop ) {
            const endTime = new Date()
            const diff = endTime - lastRequest

            this.printConsole.print(
                { 
                    'status': 'progress', 
                    'vars': { 'levels': 3, 'front': 'Waiting', 'progress': this.#predictNextSlot() }, 
                    'key': 'standard' 
                }
            )

            if( first || diff > this.#config['graphQl']['render']['delayBetweenRequests'] ) {
                first = false
                
                this.printConsole.print(
                    { 
                        'status': 'progress', 
                        'vars': { 'levels': 3, 'front': 'Waiting', 'progress': this.#predictNextSlot() }, 
                        'key': 'standard' 
                    }
                )

                lastRequest = new Date()
                result = await this.#waitForSingleRequest( { payload } )
                result['found'] ? loop = false : ''
            }

            await new Promise( resolve => 
                setTimeout( resolve, this.#config['graphQl']['render']['frameInterval'] )
            )
        }

        this.printConsole.print(
            { 
                'status': 'finished', 
                'vars': { 'levels': 3, 'front': 'Transaction', 'progress': msg  }, 
                'key': 'standard' 
            }
        )

        return result
    }


    async #waitForSingleRequest( { payload } ) {
        return new Promise( ( outerResolve, outerReject ) => {
            let promiseCompleted = false
            let result
            let status = 'failed'
            let loop = true
    
            const promise = new Promise(
                async ( resolve, reject ) => {
                    try {
                        result = await this.#requestParse( { payload } )
                        result['found'] ? status = 'finished' : ''
                        promiseCompleted = true
                        // process.stdout.write( `${result['response']}` )

                        this.printConsole.print(
                            { 
                                'status': 'progress', 
                                'vars': { 'levels': 3, 'front': 'Waiting', 'progress': this.#predictNextSlot() }, 
                                'key': 'standard' 
                            }
                        )

                        resolve( 'Promise completed!' )
                    } catch( error ) {
                        reject( error )
                    }
                })
    
            const interval = setInterval(
                async () => {
                    if ( promiseCompleted ) {
                        clearInterval( interval )

                        this.printConsole.print(
                            { 
                                'status': 'progress', 
                                'vars': { 'levels': 3, 'front': 'Waiting', 'progress': this.#predictNextSlot() }, 
                                'key': 'standard' 
                            }
                        )

                        loop = false
                        outerResolve( result )
                    } else { 
                        this.printConsole.print(
                            { 
                                'status': 'progress', 
                                'vars': { 'levels': 3, 'front': 'Waiting', 'progress': this.#predictNextSlot() }, 
                                'key': 'standard' 
                            }
                        )
                    }
                },
                this.#config['graphQl']['render']['frameInterval']
            )

        } )
    }


    async #requestParse( { payload } ) {
        let result = {
            'error': false,
            'found': false,
            'response': null,
            'vars': { ...payload['vars'] }
        }

        try {
            const raw = await this.request( { payload } )
            const response = raw['response']['data']
            const key = payload['key']
            switch( payload['type'] ) {
                case 'hash':
                    if( response[ key ] !== null ) {
                        result['response'] = response

                        Object
                            .entries( response[ key ] )
                            .forEach( a => {
                                const [ key, value ] = a
                                result['vars'][ key ] = value
                            } )

                        result['found'] = true
                        break
                    }
                    break
                case 'array':
                    if( response[ key ].length !== 0 ) {
                        result['response'] = response
                        result['found'] = true
                    }

                    result['vars']['count'] = response[ key ].length
                    break
                default:
                    console.log( 'type not found' )
                    break
            }

        } catch( e ) {
            result['error'] = true
        }

        return result
    }


    #predictNextSlot() {
        const response = this.#state['latestBlock']
        const result = {
            'lastBlock': null,
            'offsetSlot': null,
            'slotNumber': null,
            'nextSlot': null,
            'timeUntilNextSlot': null
        }
    
        try {
            result['lastBlock'] = response['response']['data']['blocks'][ 0 ]['dateTime']
            result['slotNumber'] = response['response']['data']['blocks'][ 0 ]['protocolState']['consensusState']['slot']
        } catch( e ) {
            return result
        }
    
        const slotStartTime = moment( result['lastBlock'] )
        const now = moment()
        const slotIntervalMilliseconds = 3 * 60 * 1000
        const timeElapsedMilliseconds = now.diff( slotStartTime )

        let slotNumberOffset = Math.floor( timeElapsedMilliseconds / slotIntervalMilliseconds ) + 1
        slotNumberOffset = ( slotNumberOffset <= 0 ) ? 1 : slotNumberOffset

        const remainingTimeMilliseconds = slotIntervalMilliseconds - ( timeElapsedMilliseconds % slotIntervalMilliseconds )
        const remainingTimeInSeconds = Math.round( remainingTimeMilliseconds / 1000 )
        
        const formattedRemainingTime = `${String( Math.floor( remainingTimeInSeconds / 60 ) ).padStart( 2, '0' )}:${String( remainingTimeInSeconds % 60 ).padStart( 2, '0' )}`
        
        result['offsetSlot'] = slotNumberOffset
        result['nextSlot'] = result['slotNumber'] + slotNumberOffset + 1
        result['timeUntilNextSlot'] = formattedRemainingTime
    
        const format = `${result['timeUntilNextSlot']} (${result['nextSlot']})`

        return format
    }
}

