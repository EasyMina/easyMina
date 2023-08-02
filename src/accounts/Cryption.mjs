/*
    Name
        Cryption.js
    Description
        Encrypts and decrypts user credentials
    Blocks
        {}
    Public:
        Variables
        Methods
            .init( { silent, secret } )
            .encrypt( { text } ) 
            .decrypt( { })
*/


import crypto from 'crypto'


export class Cryption {
    #config
    #state
    #silent

    constructor() {
        this.#config = {
            'algorithm': 'aes-256-cbc'
        }
        this.#state
        this.#silent
    }


    init( { silent=false, secret=null } ) {
        this.#silent = silent
        this.#state = {
            'secret': null
        }

        this.#addSecret( { secret } )

        return this
    }


    encrypt( { text } ) {
        const iv = crypto.randomBytes( 16 )

        const cipher = crypto.createCipheriv( 
            this.#config['algorithm'], 
            this.#state['secret'], 
            iv 
        )
        const encrypted = Buffer.concat( [ 
            cipher.update( text ), 
            cipher.final() 
        ] )

        const content = encrypted
            .toString( 'hex' )

        const result = {
            'iv': iv.toString('hex'),
            'content': content
        }
      
        return result
    }


    decrypt( { hash } ) {
        const decipher = crypto.createDecipheriv(
            this.#config['algorithm'], 
            this.#state['secret'],
            Buffer.from( hash['iv'], 'hex' ) 
        )

        const decrypted = Buffer.concat( [
            decipher.update( Buffer.from( hash['content'], 'hex' ) ), 
            decipher.final()
        ] )
      
        return decrypted.toString()
    }


    #addSecret( { secret } ) {
        if ( typeof secret === 'string' || secret instanceof String ) {
            const str = this.#hashString( { 'string': secret } )
            this.#state['secret'] = str

        } else {
            console.log( 'Secret is not a string.' )
            process.exit( 1 )
        }
    }


    #hashString( { string } ) {
        const hash = crypto.createHash( 'sha256' )
        hash.update( string )
        const bytes32 = hash.digest()

        return bytes32
    }
}