/*
    Name
        PrintConsole.mjs
    Description
        Here, internationalized messages can be output to the console. Additionally, a variety of formatting options have been implemented.
    Blocks
        { 
            'print': { ...config['print'] }, 
            'messages': { ...config['messages'] },
            // 'network': { ...config['network'] } optional
        }
    Public
        Variables
        Methods
            .init( { config } )
            .print( { vars={}, key, status=null } ) (async)
            .printQuestionExperimental() (async)
*/


import readline from 'readline'


export class PrintConsole {
    #state
    #config
    #readline

    constructor() {
        this.#config = {}
        return true
    }


    init( { config } ) {
        this.#config = { ...config }

        this.#state = {
            'index': 0,
            'levels': {
                '0': 0,
                '1': 0,
                '2': 0,
                '3': 0
            },
            'userInteractions': {
                'input': null,
                'output': null
            },
            'status': 'progress',
            'question': {
                'use': false,
                'pointer': null
            },
            'lastLevel': 0
        }

        this.#readline = readline.createInterface( {
            'input': process.stdin,
            'output': process.stdout
        } )

        this.#setStructCmds()

        return true
    }


    async print( { vars={}, key, status=null } ) {
        if( !Object.hasOwn( this.#config['print']['structs'], key ) ) {
            const language = this.#config['messages']['use']
 
            const msg = this.#config['messages'][ language ]['errorKeyNotFound'][ 0 ]
                .replace( this.#config['print']['insertManual'], key )

            console.log( msg )
            console.log()
            process.exit( 1 )
            return true
        }

        !Object.hasOwn( vars, 'levels' ) ? vars['levels'] = 0 : ''
        key !== 'newLine' ? this.#updateLevels( { vars, status } ) : ''

        this.#setStatus( { status, key } )
        

        const struct = this.#messageStruct( { vars, key } )
        this.#messagePrintStandard( { vars, struct } )
        status === 'progress' ? this.#state['index']++ : this.#state['index'] = 0
        return true
    }


    async printQuestionExperimental() {
        this.#setQuestion( { key } )
        const r = await this.#messagePrintQuestion( { vars, struct } )

        const str = r
            .filter( a => a['status'] === 'finished' )[ 0 ]['str']

        console.log( str )
        console.log()

        return true
    }


    #setQuestion( { key } ) {
        if( this.#config['print']['structs'][ key ]['question'] !== null ) {
            this.#state['question']['use'] = true
            this.#state['question']['pointer'] = this.#config['print']['structs'][ key ]['question']
        } else {
            this.#state['question']['use'] = false
        }

        return true
    }


    #setStatus( { status, key } ) {
        if( this.#config['print']['structs'][ key ]['question'] !== null ) {
            this.#state['status'] = 'progress'
        } else {
            if( status !== null ) {
                this.#state['status'] = status
            }
        }

        return true
    }


    #updateLevels( { vars } ) {
        const status = this.#state['status']
        if( Object.hasOwn( vars, 'levels' ) && ( status === 'finished' || status === 'failed' ) ) {
            let reset = []
            let plusOne = []

            switch( vars['levels'] ) {
                case 0:
                    plusOne = [ '0' ]
                    break
                case 1:
                    if( this.#state['lastLevel'] > vars['levels'] ) {
                        plusOne = [ '1' ]  
                    } else if( this.#state['lastLevel'] < vars['levels'] ) {
                    }
                    
                    reset = [ '2', '3' ]
                    break
                case 2:
                    if( this.#state['lastLevel'] === vars['levels'] ) {
                        plusOne = [ '2' ]
                    }

                    break
                case 3:
                    break
                default:
                    console.log( `Level: ${levels} is not usable` )
                    break
            }


            this.#state['lastLevel'] = vars['levels']

            plusOne.forEach( key => this.#state['levels'][ key ]++ )
            reset.forEach( key => this.#state['levels'][ key ] = 0 )
        }

        return true
     }


    #questionPrint( { question } ) {
        return new Promise( ( resolve, reject ) => {
            this.#readline.question( 
                question, 
                ( answer ) => {
                    resolve( answer ) 
                } 
            )
        } )
    }


    async #questionValidate( { vars, str } ) {
        const [ type, key ] = this.#getTypeKey( { 
            'str': this.#state['question']['pointer'] 
        } )

        this.#state['userInteractions']['input'] = str + ''
        let selection = {
            'status': 'failed',
            ...this.#config['print'][ type ][ key ]['failed']
        }

        this.#config['print'][ type ][ key ]['validations']
            .forEach( ( a, index ) => {
                const [ _type, _key ] = this.#getTypeKey( { 
                    'str': a['validation']
                } )

                switch( _type ) {
                    case 'regexs':
                        const regex = this.#config['print'][ _type ][ _key ]
                        const check = this.#state['userInteractions']['input'].match( regex )
                        if( check !== null ) {
                            if( check.length === 1 ) {
                                selection = {
                                    'status': 'finished',
                                    ...a['finished']
                                }
                            }
                        }
                        break
                    case 'messages':
                        break
                }

                return true
            } )

        this.#state['status'] = selection['status']
        switch( this.#state['status'] ) {
            case 'progress':
                break
            case 'finished':
                const [ _type, _key ] =  this.#getTypeKey( { 
                    'str': selection['output']
                } )

                this.#state['userInteractions']['output'] = this.#getVariables( { 
                    vars,
                    'type': _type, 
                    'key': _key 
                } )
                break
            case 'failed':
                this.#state['userInteractions']['output'] = selection['output']
                break
        }

        const format = selection['format']
        const cmds = this.#structCreateCmds( { format } )
        const result = this.#messageStruct( { vars, key, cmds } )
            .join( '' )

        return {
            'status':  this.#state['status'],
            'str': result
        }
    }


    #messagePrintStandard( { vars, struct } ) {
        if( this.#state['index'] > 0 ) {
            this.#clearLine()
        }

        const str = struct.join( '' )
        let result = ''
        console.log( str )

        return true
    }


    async #messagePrintQuestion( { vars, struct, acc=[] } ) {
        const str = struct.join( '' )
        const input = await this.#questionPrint( { 'question': str } )

        this.#clearLine()
        let result = await this.#questionValidate( { vars, 'str': input } )
        acc.push( result )

        if( this.#state['status'] === 'failed' ) {
            this.#state['status'] = 'progress'
            await this.#messagePrintQuestion( { vars, struct, acc } )
        }

        return acc
    }


    #clearLine() {
        process.stdout.moveCursor( 0, -1 )
        process.stdout.clearLine( 1 )
    }


    #setStructCmds() {
        const language = this.#config['messages']['language']

        this.#config['print']['structs'] = Object
            .entries( this.#config['print']['structs'] )
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a
                acc[ key ] = {}
                acc[ key ]['question'] = value['question']
                acc[ key ]['format'] = value['format']
                acc[ key ]['cmds'] = Object
                    .entries( value['format'] )
                    .reduce( ( abb, b, rindex ) => {
                        const [ _key, format ] = b
                        abb[ _key ] = this.#structCreateCmds( { format } )
                        return abb
                    }, {} )
                return acc
            }, {} )

        return true
    }


    #structCreateCmds( { format } ) {
        format = format + ''
        let matches = format
            .match( this.#config['print']['regexs']['format'] )

        matches === null ? matches = [ '' ] : ''

        const results = matches
            .reduce( ( abb, tag, rindex, all ) => {
                const tmp = {
                    'before': '',
                    'tag': tag,
                    'after': ''
                }
        
                if( rindex === 0 ) {
                    tmp['before'] = format.substring( 0, format.indexOf( tmp['tag'] ) )
                    if( all.length === 1 ) {
                        const start2 = format.indexOf( tmp['tag'] ) + tmp['tag'].length
                        tmp['after'] = format.substring( start2, format.length )
                    }
                } else if( rindex === all.length - 1 ) {
                    const start2 = format.indexOf( tmp['tag'] ) + tmp['tag'].length
                    const start = format.indexOf( all[ rindex - 1 ] ) +  all[ rindex - 1 ].length 
                    tmp['before'] = format.substring( start, format.indexOf( tmp['tag'] ) )
                    tmp['after'] = format.substring( start2, format.length )
                } else {
                    const start = format.indexOf( all[ rindex - 1 ] ) +  all[ rindex - 1 ].length 
                    tmp['before'] = format.substring( start, format.indexOf( tmp['tag'] ) )
                }

                Object
                    .entries( tmp )
                    .forEach( c => {
                        const [ key, value ] = c
                        const struct = {
                            'type': key === 'tag' ? 'cmd': 'str',
                            'value': value
                        }

                        struct['value'] !== '' ? abb.push( struct ) : ''
                    } )

                return abb
            }, [] )

        return results
    }


    #messageStruct( { vars, key, cmds=null } ) {
        const status = this.#state['status']
        cmds === null ? cmds = this.#config['print']['structs'][ key ]['cmds'][ status ] : ''
        let acc = ''
        const transforms = cmds
            .map( ( a, index, all ) => {
                let str
                switch( a['type'] ) {
                    case 'cmd':
                        const [ _type, _key ] = this.#getTypeKey( { 
                            'str': a['value'] 
                        } )

                        const transform = this.#getVariables( { 
                            vars, 
                            'type': _type, 
                            'key': _key, 
                            index, 
                            acc 
                        } )

                        str = transform
                        break
                    case 'str':
                        str = a['value']
                        break
                }
                acc += str
                return str
            } )

        return transforms
    }


    #getVariables( { vars, type, key, acc, recursive=0 } ) {
        const status = this.#state['status']
        const language = this.#config['messages']['use']
        let result
        switch( type ) {
            case 'spaces':
                const tmp = this.#config['print']['spaces'][ key ] - acc.length
                const spaces = tmp < 0 ? 0 : tmp

                result = new Array( spaces )
                    .fill( '' )
                    .join( ' ' )
                break
            case 'status':
                result = this.#config['print']['status'][ key ][ status ][
                    this.#state['index'] % this.#config['print']['status'][ key ][ status ].length
                ]
                break
            case 'levels':
                const level = vars['levels']
                const format = this.#config['print']['levels'][ vars['levels'] ]
                result = this.#structCreateCmds( { 'format': format } )
                    .map( a => {
                        if( a['type'] === 'cmd' ) {
                            const [ _type, _key ] = this.#getTypeKey( { 
                                'str': a['value'] 
                            } )

                            let str
                            if( this.#state['levels'][ _key ] > this.#config['print']['enumerations'][ _key ].length - 1 ) {
                                str = this.#config['print']['enumerations']['notFound']
                            } else {
                                str = this.#config['print']['enumerations'][ _key ][ this.#state['levels'][ _key ] ]
                            }

                            return str
                        } else {
                            return a['value']
                        }
                    } )
                    .join( '' )
                break
            case 'messages':
                let message = ''
                try{
                    message = this.#config['messages'][ language ][ key ][ 
                        this.#state['index'] % this.#config['messages'][ language ][ key ].length
                    ]
                } catch( e ) {
                    console.log( `messages__${key} not found` )
                    console.log( )
                }

                if( recursive === 0 ) {
                    result = this
                        .#structCreateCmds( { 'format': message } )
                        .map( a => {
                            let modified = ''
                            switch( a['type'] ) {
                                case 'str':
                                    modified = a['value']
                                    break
                                case 'cmd':
                                    const [ _type, _key ] = this.#getTypeKey( { 
                                        'str': a['value'] 
                                    } )

                                    modified = this.#getVariables( { 
                                        vars, 
                                        'type': _type, 
                                        'key': _key, 
                                        'recursive': 1 
                                    } )
                                    break
                                default:
                                    break
                            }
                            return modified
                        } )
                        .join( '' )
                } else {
                    result = 'n/a'
                }

                break
            case 'external':
                if( vars[ key ] === undefined ) {
                    const msg = this.#config['messages'][ language ]['errorKeyNotFound'][ 0 ]
                        .replace( this.#config['print']['insertManual'], key )

                    console.log( msg )
                    console.log()
                    result = ''
                } else {
                    result = vars[ key ]                   
                }
                break
            case 'custom':
                switch( key ) {
                    case 'networkExplorerTransaction':
                        const network = this.#config['network']['use']
                        result = this.#config['network'][ network ]['explorer']['transaction']
                        break
                    default:
                        const msg = this.#config['messages'][ language ]['errorKeyNotFound'][ 0 ]
                            .replace( this.#config['print']['insertManual'], key )

                        console.log( msg )
                        console.log()
                        break
                }
                break
            case 'userInteractions':
                result = this.#state[ type ][ key ]
                break
            default:
                const msg = this.#config['messages'][ language ]['errorTypeNotFound'][ 0 ]
                    .replace( this.#config['print']['insertManual'], type )

                console.log( 'abc>>', msg )
                console.log()
                break
        }

        return result
    }


    #getTypeKey( { str } ) {
        const result = str
            .replace( '{{', '' )
            .replace( '}}', '' )
            .split( this.#config['print']['split'] ) 

        return result
    }
}