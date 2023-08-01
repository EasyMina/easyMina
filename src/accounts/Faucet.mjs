/*
    Name
        Account.js
    Description
        Requests test tokens and displays the response in a structured format.
    Blocks
        {
            'graphQl': { config['graphQl'] },
            'messages': { config['messages'] },
            'network': { config['network'] },
            'print': { config['print'] }, 
        }
    Public:
        Variables
        Methods
            .init( { config } )
            .start( { receiver } )
*/


import axios from 'axios'
// import { GraphQl } from '../interactions/GraphQl.mjs'
import { PrintConsole } from './../helpers/PrintConsole.mjs'
import moment from 'moment'


export class Faucet {
    #config
    #graphql
    #printConsole

    constructor() {
        this.#config = {}
    }


    init( { config={} } ) {
        this.#config = { ...config }

        this.#printConsole = new PrintConsole()
        this.#printConsole.init( {
            'config': { 
                'print': { ...this.#config['print'] }, 
                'messages': { ...this.#config['messages'] },
                'network': { ...this.#config['network'] }
            }
        })

        return true
    }


    async start( { receiver } ) {
        process.stdout.write( '    Faucet             ' )
        const network = this.#config['network']['use']
        const response = await this.#request( { 
            'url': this.#config['network'][ network ]['faucet']['api'],
            'address': receiver,
            'network': this.#config['network'][ network ]['faucet']['network'],
            'transaction': this.#config['network'][ network ]['explorer']['transaction']
        } )

        if( response['status'] ) {
            console.log( `🟩 ${response['faucet']['explorer']}`)
        } else {
            console.log( `❌ ${response['faucet']['explorer']}` )
            process.exit( 1 )
        }

        return response
    }


    async #request( { url, address, network, transaction } ) {
        const result = {
            'status': false,
            'status_str': 'failed',
            'message': null,
            'faucet': {
                'transaction': '',
                'explorer': null,
                'network': network,
                'timestamp': moment().unix()
            }
        }

        try {
            const response = await axios.post(
                url, 
                {
                    'network': network,
                    'address': address
                }, 
                {
                    'headers': {
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    },
                    'maxBodyLength': Infinity
                }
            )

            result['status'] = true
            result['status_str'] = 'finished'
            result['message'] = response.data.status
            result['faucet']['transaction'] = response.data.message.paymentID
            result['faucet']['explorer'] = `${transaction}${result['faucet']['transaction']}`
        } catch( error ) {
            try {
                const status = error['response']['data']['status']
                result['message'] = status
                if( result['message'] === 'rate-limit' ) {
                    result['faucet']['transaction'] = 'manual'
                }
            } catch {
                result['message'] = 'unknwon'
            }
        }

        return result
    }
}