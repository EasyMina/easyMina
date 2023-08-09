/*
    Name
        Workspace.mjs
    Description
        This class creates the workspace folders.
    Blocks
        { 
            'environment': { ...config['environment'] },
            'meta': { ...config['meta'] },
            'typescript': { ...config['typescript'] },
            'validations': { ...config['validations'] }
        }
    Public
        Variables
        Methods
            .init( { config } )
            .start() (async)
*/


import fs from 'fs'
import axios from 'axios'
import { keyPathToValue } from './../helpers/mixed.mjs'


export class Workspace {
    #config

    constructor() {}


    init( { config={} } ) {
        this.#config = { ...config }

        return true
    }


    async start() {
        this.#addWorkDir()

        await this.#checkWorkFiles()
        this.#addGitIgnore()
        this.#addConfig()
        // await this.#addTemplate()

        return true
    }


    #addGitIgnore() {
        // process.stdout.write( '  Gitignore            ' )

        let exists = true
        let correct = false

        const path = this.#config['environment']['workspace']['gitignore']
        if( !fs.existsSync( path ) ) {
            exists = false
            fs.writeFileSync( 
                path, 
                `${this.#config['environment']['addresses']['root']}`, 
                'utf-8' 
            )
        } else {
            const raw = fs.readFileSync( path, 'utf-8' )
            const test = raw
                .split( "\n" )
                .map( a => a.trim() )
                .map( a => a === this.#config['environment']['addresses']['root'] )
                .some( a => a )
            
            if( !test ) {
                console.log( `Please insert in ${path} following line: ${this.#config['environment']['addresses']['root']}`)
                process.exit( 1 )
            } else {
                correct = true
            }
        }

        let msg = ''
        msg += '  ├── .gitignore'
        msg += exists ? '' : '*'
        msg += correct ? ` (${this.#config['environment']['addresses']['root']} included)` : ''
        console.log( msg )

        return true
    }


    #addConfig() {
        // console.log( '  Typescript           ')
        // process.stdout.write( '    Config             ' )

        const path = this.#config['typescript']['fileName']
        let exists = true

        if( !fs.existsSync( path ) ) {
            exists = false
            fs.writeFileSync( 
                path, 
                JSON.stringify( this.#config['typescript']['template'], null, 4 ),
                'utf-8'
            )
        } 

        let msg = ''
        msg += '  └── tsconfig.json'
        msg += exists ? '' : '*'

        console.log( msg )

        return true
    }


    #addWorkDir() {
        // process.stdout.write( '    Folder             ' )

        let exists = true

        const result = [
            'typescript', 'build'
        ]
            .reduce( ( acc, key, index ) => {
                const dir = this.#config['environment']['workspace']['contracts'][ key ]['full']
                if( !fs.existsSync( dir ) ) {
                    exists = false
                    fs.mkdirSync( dir, { 'recursive': true } )
                }

                return acc
            }, {} )


        let msg = ''
        msg += '  ├── '
        msg += `${this.#config['environment']['workspace']['contracts']['root']}`
        msg += exists ? '' : '*'
        console.log( msg )

        return true
    }


    async #checkWorkFiles() {
        const keys = [ 'typescript', 'build' ]
        for( const key of keys ) {
            const dir = this.#config['environment']['workspace']['contracts'][ key ]['full']
            const files = fs
                .readdirSync( dir )
                .filter( ( file ) => !file.startsWith( '.' ) )
            const folder = this.#config['environment']['workspace']['contracts'][ key ]['folder']
            const str = `  │   ├── ${folder} (${files.length})`
            console.log( str )
            if( key === 'typescript' ) {
                await this.#addTemplate()
            }
        }
/*
            .join( ', ' ) 

        let msg = ''
        msg += '🟩 '
        // msg += result !== '' ? 'Found! ' : ''
        msg += result
        console.log( msg )
*/
        return true
    }
    


    async #addTemplate() {
        // process.stdout.write( '    Template           ' )

        const cmd = this.#addTemplatePrepare()

        let path = ''
        path += this.#config['environment']['workspace']['contracts']['typescript']['full']
        path += cmd['fileName']

        let exists = true
        if( !fs.existsSync( path ) ) {
            exists = false
            const content = await this.#setTemplateContent( { cmd } )
            await this.#addTemplateStore( { path, content } )
        }

        let msg = ''
        msg += '  │   │   └── '
        msg += exists ? '' : '*'
        msg += `${cmd['fileName']}`
        console.log( msg )

        return true
    }


    #addTemplatePrepare() {
        const keys = [ '{{one}}', '{{two}}', '{{three}}', '{{four}}' ]
        const result = {
            'type': null,
            'url': null,
            'content': null,
            'fileName': null
        }

        const vars = Object
            .entries( this.#config['environment']['template']['regexs'] )
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a

                const regex = keyPathToValue( { 
                    'data': this.#config['validations']['regexs'], 
                    'keyPath': value
                } )

                const content = this.#config['environment']['template']['source']['content']
                const matches = content.match( regex['regex'] )

                if( matches ) {
                    result['type'] = key
                    matches
                        .forEach( ( match, rindex ) => 
                            acc[ keys[ rindex ] ] = match 
                        )
                }
                return acc
            }, {} )

        result['fileName'] = this.#config['environment']['workspace']['contracts']['typescript']['fileName']

        result['url'] = Object
            .entries( vars )
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a
                index === 0 ? acc = this.#config['environment']['template']['parse'][ result['type'] ] : ''
                acc = acc.replace( key, value )
                return acc
            }, '' )

        return result
    }


    async #setTemplateContent( { cmd } ) {
        let fileContent = ''
        try {
            switch( cmd['type'] ) {
                case 'gist':
                    const raw1 = await this.#request( { 'url': cmd['url'] } )
                    const fileKey1 = Object.keys( raw1.data.files )[ 0 ]
                    fileContent = raw1.data.files[ fileKey1 ].content
                    break
                case 'https':
                    const raw2 = await this.#request( { 'url': cmd['url'] } )
                    const fileKey2 = Object.keys( raw2.data.files )[ 0 ]
                    fileContent = raw2.data.files[ fileKey2 ].content
                    break
                case 'plain':
                    fileContent = this.#config['environment']['template']['source']['content']
                    break
                default:
                    console.log( `Add Template: ${cmd} someting went wrong`)
                    break
            }
        } catch( e ) {
            console.error( 'Error parsings the file:', e )
        }

        return fileContent
    }


    #addTemplateStore( { path, content } ) {
        fs.writeFileSync( path, content, 'utf-8' )

        return true
    }


    async #request( { url } ) {
        let fileContent = ''
        let response = null
        try {
          response = await axios.get( url )
        } catch ( e ) {
          console.error( 'Error fetching the file:', e.message )
        }

        return response
    }
}