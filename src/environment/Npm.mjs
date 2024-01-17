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
        this.#state['packageExists'] = this.#isPackageJsonValid()

        console.log( this.#state )
        return true
    }


    createScriptsKeyValuePairs( { environment } ) {
        if( !this.#state['packageExists'] ) {
            console.log( `package.json does not exist or is not valid. ${this.#state['packagePath']}` )
            process.exit( 1 )
        }

        const data = JSON.parse( 
            fs.readFileSync( 
                this.#state['packagePath'], 
                'utf-8' 
            ) 
        )

        const scripts = this.#getScripts( { environment } )
        // console.log( JSON.stringify( scripts, null, 4 ) )
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
                                    acc.push( [ v['npm'].split( ' ' )[2], str ] )
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


    #isPackageJsonValid() {
        let result = false
        try {
            const raw = fs.readFileSync( this.#state['packagePath'] )
            const json = JSON.parse( raw )
            result = [ 
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
        } catch( e ) {
        }
        
        return result
    }
    
}