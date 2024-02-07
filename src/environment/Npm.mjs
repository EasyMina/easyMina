import fs from 'fs'


export class Npm {
    #config
    #state


    constructor( { validate } ) {
        this.#config = { validate }
        this.init()

        return true
    }


    init() {
        this.#state = {}

        this.#state['packagePath'] = `${process.cwd()}/package.json`
        // this.#state['packageExists'] = this.#isPackageJsonValid()

        return true
    }


    createScriptsKeyValuePairs( { environment } ) {
        const { valid, message } = this.#validatePackageJson()

        if( !valid ) {
            console.log( `${message} ${this.#state['packagePath']}` )
            process.exit( 1 )
        }

        const data = JSON.parse( 
            fs.readFileSync( 
                this.#state['packagePath'], 
                'utf-8' 
            ) 
        )

        const scripts = this.#getScripts( { environment } )
        const keyValues = Object
            .entries( scripts )
            .reduce( ( acc, a, index ) => {
                const [ projectName, values ] = a
                Object
                    .entries( values )
                    .filter( b => b[ 0 ] === 'backend' )
                    .forEach( b => {
                        const [ type, scripts ] = b
                        Object
                            .entries( scripts )
                            .forEach( c => {
                                const [ script, v ] = c                                
                                let str = ''
                                str += `tsc -p ${this.#config['validate']['folders']['workdir']['name']}/${projectName}/tsconfig.json `
                                str += `&& `
                                str += `node ${v['source']}`

                                if( v['npm'] !== '' ) {
                                    acc.push( [ v['npm'].split( ' ' )[ 2 ], str ] )
                                }
                            } )

                    } )

                return acc
            }, [] )

        const scriptKeys = Object.keys( data['scripts'] )
        keyValues
            .forEach( cmd => {
                const [ key, value ] = cmd
                if( !scriptKeys.includes( key ) ) {
                    data['scripts'][ key ] = value
                }
            } )

        data['type'] = 'module'

        fs.writeFileSync( 
            this.#state['packagePath'],
            JSON.stringify( data, null, 2 ),
            'utf-8' 
        )

        return true
    }


    #getScripts( { environment } ) {
        return environment.getScripts()
    }


    #validatePackageJson() {
        let message = 'Unknown error.'
        let valid = false
        try {
            message = 'File is not found.'
            const raw = fs.readFileSync( this.#state['packagePath'] )
            message = 'File is not valid JSON.'
            const json = JSON.parse( raw )

            message = 'package "o1js" is missing.'
            valid = [ 
                'dependencies', 
                'devDependencies' 
            ]
                .map( key => {
                    if( !Object.hasOwn( json, key ) ) {
                        return false
                    }
                    return Object.hasOwn( json[ key ], 'o1js' )
                } )
                .some( a => a )
            message = 'Package "o1js" found.'
        } catch( e ) {
        }

        return { valid, message }
    }
}