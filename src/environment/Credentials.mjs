import fs from 'fs'


export class Credentials {
    #config
    #state
    #locations

    constructor() {}


    init( { config={} } ) {
        this.#config = { ...config }
        this.#state = {
            'folders': {}
        }

        this.#addLocations()
        return true
    }


    checkEnvironment() {
        process.stdout.write( '    Folder             ' )

        this.#state['folders'] = this.#scanFolder()
        !this.#state['folders']['valid'] ? this.#createFolder() : ''

        let msg = ''
        msg += '🟩 '
        // msg += this.#state['folders']['valid'] ? 'Found! ' : 'Created! '
        msg += this.#config['root']

        console.log( msg )

        return true
    }


    checkAccounts() {
        process.stdout.write( '    Accounts           ' )

        const result = this.#locations['accounts']
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a
                acc[ key ] = this.#scanAccounts( { 'type': key } )
                return acc
            }, {} )

        this.#state = {
            'folders': this.#state['folders'],
            ...result
        }

        const found = Object
            .entries( result )
            .map( ( a, index ) => {
                const key = this.#config[ a[ 0 ] ]['folder']
                const str = `${key}: ${a[ 1 ].length}`
                return str
            } )
            .join( ', ' )

        let msg = ''
        msg += '🟩 '
        // msg += 'Found! '
        msg += found
        console.log( msg )
        
        return result
    }


    #addLocations() {
        this.#locations = {
            'root': [ 'mina', this.#config['root'] ],
            'accounts': [
                [ 'deployers', this.#config['deployers']['fullFolder'] ],
                [ 'contracts', this.#config['contracts']['fullFolder'] ]
            ],
            'both': null
        }

        this.#locations['both'] = Object
            .entries( this.#locations )
            .reduce( ( acc, a, index ) => {
                const [ key, values ] = a
                if( index === 0 ) {
                    acc.push( values )
                } else if( index === 1 ) {
                    values.forEach( b => acc.push( b ) )
                }
                return acc
            }, [] ) 

        return true
    }


    #scanFolder() {
        const result = this.#locations['both']
            .reduce( ( acc, a, index, all ) => {
                const [ key, value ] = a
                try {
                    acc[ key ] = fs.existsSync( value )
                } catch {
                    acc[ key ] = false
                }

                if( index === all.length-1 ) {
                    acc['valid'] = Object
                        .entries( acc )
                        .map( a => a[ 1 ] )
                        .every( a => a )
                }

                return acc
            }, {} )

        return result
    }


    #scanAccounts( { type } ) {

        if( !this.#state['folders']['valid'] ) {
            return []
        }

        const splitter = this.#config['splitter']
        const fileNameStructKeys = this.#config[ type ]['fileNameStruct']
            .replace( '.json', '' )
            .split( '{{splitter}}' )
            .map( a => {
                return a
                    .replace( '{{', '' )
                    .replace( '}}', '' )
            } )

        const valid = fs
            .readdirSync( this.#config[ type ]['fullFolder'] )
            .filter( a => a.endsWith( '.json' ) )
            .map( ( a, index ) => {
                const struct = a
                    .split( splitter )
                    .map( b => b.split( '.json')[ 0 ] )
                    .reduce( ( acc, b, index ) => {
                        acc[ fileNameStructKeys[ index ] ] = b
                        return acc
                    }, {} )

                struct['path'] = ''
                struct['path'] += this.#config[ type ]['fullFolder']
                struct['path'] += a

                return struct
            } )

        return valid
    }


    #createFolder() {
        const n = this.#locations['both']
            .forEach( a => {
                const [ key, value ] = a
                if( !this.#state['folders'][ key ] ) {
                    fs.mkdirSync( value )
                }
            } )

        return true
    }
}