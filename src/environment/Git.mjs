import { printMessages } from './../helpers/mixed.mjs'
import fs from 'fs'


export class Git {
    #config

    constructor( { git, validate } ) {
        this.#config = { git, validate }
        return true
    }


    addIgnoreFile() {
        const path = [
            process.cwd(),
            this.#config['git']['fileName']
        ].join( '/' )

        if( !fs.existsSync( path ) ) {
            fs.writeFileSync( 
                path, 
                `${this.#config['validate']['folders']['credentials']['name']}`,
                'utf-8'
            )
        } else {
            const [ messages, comments ] = this.#validateConfig( { path } )
            printMessages( { messages, comments } )
        }

        return true
    }


    #validateConfig( { path } ) {
        const messages = []
        const comments = []
        const file = fs.readFileSync( path, 'utf-8' )
        const test = file
            .split( "\n" )
            .map( a => {
                const search = this.#config['validate']['folders']['credentials']['name']
                return search === a.trim()
            } )
            .some( a => a )

        return [ messages, comments ]
    }
}