import inquirer from 'inquirer'
import figlet from 'figlet'
import chalk from 'chalk'

import * as o1js from 'o1js'

import { config } from './data/config.mjs'
import { EasyMina } from './EasyMina.mjs'
import readline from 'readline'
import fs from 'fs'

import { exec } from 'child_process'
import util from 'util'
import open from 'open'


export class CLI {
    #config
    #easyMina

    constructor() {
        this.#config = {}
        this.#easyMina = new EasyMina( { 
            encryption: true,
            setSecret: false,
            networkName: 'berkeley',
            o1js
        } )

        return true
    }

    
    async start() {
        this.#addHeadline2()

        await this.#createEnvironment()
        await this.#checkNpm()

        await this.#checkDeployer()
        await this.#checkProject()
        await this.#checkTsConfig() 

        console.log( '' )
        await this.#isOkMenu()

        // await this.start()
        return true
    }


    async #isOkMenu() {
        const options = [
            'Add Accounts',
            'Add a Template',
            'Export Project', 
            'Import Project',
            'Start Server'
        ]

        const questions = [
            {
                'type': 'list',
                'name': 'generalOption',
                'message': 'Choose an action:',
                'choices': options,
            }
        ]
          
        const response = await inquirer
            .prompt( questions )

        switch( response['generalOption'] ) {
            case 'Add Accounts':
                await this.#addAccounts()
                break
            case 'Add a Template':
                await this.#addTemplate()
                break
            case 'Export Project':
                await this.#exportProject()
                break
            case 'Import Project':
                await this.#importProject()
                break
            case 'Start Server':
                await this.#addServer()
                break
            default:
                break
        }


        return true
    }


    async #addTemplate() {
        const templates = this.#easyMina.getTemplateNames()

        const { template } = await inquirer.prompt( [
            {
                'type': 'list',
                'name': 'template',
                'choices': templates,
                'message': 'Choose project name:',
              }
        ] )

        const { projectName } = await inquirer.prompt( [
            {
                'type': 'input',
                'name': 'projectName',
                'message': 'Enter your project name:',
                'default': template,
                'validate': ( name ) => {
                    name = name.trim()
                    const regex = config['validate']['values']['stringsAndDash']['regex']
                    return regex.test( name ) ? true : config['validate']['values']['stringsAndDash']['description']
                }
            }
        ] )

        const result = await this.#easyMina.importProject( { 
            'url': `local://${template}`,
            'phrase': 'change the world with zk tech',
            projectName
            //'url': 'https://gist.githubusercontent.com/a6b8/a05d605f04972e67eccf998587b9471a/raw/089553e6e8e071f3e149be02bbacb7e42b727483/gistfile1.txt',
            // 'phrase': 'test'
        } )
        this.#easyMina.createScriptsKeyValuePairs()
        console.log( )

        return true
    }


    async #addAccounts() {

        let { names } = await inquirer
            .prompt( [
                {
                    'type': 'input',
                    'name': 'names',
                    'message': 'Enter names (comma-separated):',
                    'validate': ( input ) => {
                        const namesArray = input
                            .split( ',' )
                            .reduce( ( acc, name, index ) => {
                                name = name.trim()
                                if( name !== '' ) {
                                    acc.push( name )
                                } 

                                return acc
                            }, [] )

                        const test = namesArray
                            .map( name => {
                                const regex = config['validate']['values']['stringsAndDash']['regex']
                                return regex.test( name )
                            } )
                            .every( a => a )

                        let status = true
                        let message = ''
                        if( namesArray.length === 0 ) {
                            status = false
                            message = 'Please enter at least one name.' 
                        } else if( !test ) {
                            status = false
                            message = config['validate']['values']['stringsAndDash']['description']
                        }

                        return status ? true : message
                    }
                }
            ] )
          
        const { groupName } = await inquirer
            .prompt( [
                {
                    'type': 'input',
                    'name': 'groupName',
                    'message': 'Enter the group name:',
                    'default': names,
                    'validate': ( name ) => {
                        name = name.trim()
                        const regex = config['validate']['values']['stringsAndDash']['regex']
                        return regex.test( name ) ? true : config['validate']['values']['stringsAndDash']['description']
                  },
                }
            ] )

        names = names
            .split( ',' )
            .map( name => name.trim() )
            .filter( a => a !== '' )

        await this.#easyMina
            .createAccounts( { names, 'networkName': 'berkeley', groupName } )

        return true
    }


    async #addServer() {
        this.#easyMina.setSecret()
        const projectNames = this.#easyMina.getProjectNames()
        const questions = [
            {
              type: 'list',
              name: 'projectName',
              choices: projectNames,
              message: 'Enter the project name:',
            }
        ]

        const { projectName } = await inquirer.prompt( questions )
        const url = this.#easyMina.startServer( { projectName } )
        open( url )

        return true
    }


    async #exportProject() {
        const projectNames = this.#easyMina.getProjectNames()

        const questions = [
            {
                type: 'list',
                name: 'projectName',
                choices: projectNames,
                message: 'Enter the project name:'
            },
            {
                type: 'input',
                name: 'name',
                message: 'Enter your name (optional):',
                default: ''
            },
            {
                type: 'input',
                name: 'description',
                message: 'Enter a project description (optional):',
                default: ''
            },
            {
                type: 'confirm',
                name: 'encrypt',
                message: 'Do you want to encrypt the file?',
                default: true
            }
        ]

        const answers = await inquirer.prompt( questions )
        const { projectName, name, description, encrypt } = answers

        let phrase = undefined
        if( encrypt ) {
            const resp = await inquirer.prompt( [
                {
                    type: 'password',
                    name: 'phrase',
                    message: 'Enter an export phrase:',
                    validate: function (input) {
                      return input.trim() !== '' ? true : 'Please enter a non-empty export phrase.';
                    },
                },
                {
                    type: 'password',
                    name: 'phraseRepeat',
                    message: 'Repeat your export phrase:',
                    validate: function (input) {
                      return input.trim() !== '' ? true : 'Please enter a non-empty export phrase.';
                    },
                }
            ] )

            if( resp.phrase !== resp.phraseRepeat ) {
                console.log( 'The phrases are not identical.' )
                process.exit( 1 )
            }

            phrase = resp['phrase']
        } 

        this.#easyMina.exportProject( { projectName, name, description, phrase, encrypt } )
        return true
    }


    async #importProject() {
        const { type } = await inquirer.prompt( [
            {
                'type': 'list',
                'name': 'type',
                'choices': [ 'url', 'local', 'dataurl (experimental)' ]
            }
        ] )

        let  url
        switch( type ) {
            case 'local': 
            const folderContents = fs.readdirSync( `${process.cwd()}` )
                .filter( a => a.indexOf( '--') !== -1 && a.endsWith( '.txt' ) )

                if( folderContents.length === 0 ) {
                    console.log( 'No importable projects found.' )
                    process.exit( 1 )
                }
                
                const resp1 = await inquirer.prompt( [
                    {
                        'type': 'list',
                        'name': 'url',
                        'choices': folderContents,
                        'message': 'Filename: : ',
                        'default': ''
                    }
                ] )
                url = resp1.url
                break
            case 'url':
                const res2 = await inquirer.prompt( [
                    {
                        'type': 'input',
                        'name': 'url',
                        'message': 'URL: ',
                        'default': ''
                    }
                ] )
                url = res2.url
                break
            case 'dataurl':
                function questionAsync( question ) {
                    return new Promise( ( resolve ) => {
                        const rl = readline.createInterface( {
                            'input': process.stdin,
                            'output': process.stdout
                        } )
                  
                        rl.question( 
                            question, 
                            ( answer ) => {
                                rl.close()
                                resolve( answer )
                            } 
                        )
                    } )
                }

                url =  await questionAsync( 'Enter a long data URL string:\n' )
                break
        }

        const questions = [
            {
                'type': 'password',
                'name': 'phrase',
                'message': 'Enter your decryption phrase:',
                'default': ''
            },
            {
                'type': 'input',
                'name': 'projectName',
                'message': 'Enter a Project Name:',
                'default': '',
                validate: function ( input ) {
                    return input.trim() !== '' ? true : 'Project Name can not be empty.'
                }
            }
        ]
          
        const response = await inquirer.prompt( questions )
        const { phrase, projectName } = response

        this.#easyMina.importProject( { url, phrase, projectName } )
        this.#easyMina.createScriptsKeyValuePairs()
        return true 
    }


    async #checkNpm() {
        const execAsync = util.promisify( exec )
        const p = `${process.cwd()}/package.json`
        if( fs.existsSync( p ) ) {
            const msg = '✔ package.json file found.'
            const msgColor = chalk.green( msg )
            console.log( msgColor )
            return true
        }

        const questions = [
            {
              type: 'input',
              name: 'npm',
              message: 'Install npm and easymina?',
            }
        ]

        const { npm } = await inquirer.prompt( questions )
        await execAsync( 'npm init -y --default-type=module && npm i o1js easymina' )

        return true
    }


    async #checkProject() {
        const projects = this.#easyMina.getProjectNames()
        if( projects.length !== 0 ) {
            const msg = `✔ ${projects.length} Project${projects.length === 1 ? '' : 's' } found.`
            const msgColor = chalk.green( msg )
            console.log( msgColor )
            return true
        }

        console.log( '' )
        const msg = `No project found. Would you like to load an example?`
        const msgColor = chalk.green( msg )
        console.log( msgColor )

        await this.#addTemplate()
        return true
    }


    async #checkTsConfig() {
        this.#easyMina.createTsConfigs()
        this.#easyMina.createScriptsKeyValuePairs()

        const msg = `✔ tsconfig.json files found.`
        const msgColor = chalk.green( msg )
        console.log( msgColor )

        return true
    }


    async #checkDeployer() {
        const accounts = this.#easyMina.getAccounts()
        if( Object.keys( accounts ).length !== 0 ) {
            const accountsArr = Object
                .entries( accounts )
                .reduce( ( acc, a, index ) => {
                    const [ groupName, value ] = a
                    Object
                        .entries( value )
                        .forEach( b => {
                            const [ name, v ] = b
                            acc.push( `${name} (${groupName})` )
                        } )
                    return acc
                }, [] )
                .sort()

            const msg = `✔ ${accountsArr.length} Account${accountsArr.length===1 ? '' : 's'} found.`
            const msgColor = chalk.green( msg )
            console.log( msgColor )
            return true
        }

        console.log( '' )
        const msg = `No accounts found. Should test accounts be created?`
        const msgColor = chalk.green( msg )
        console.log( msgColor )
        const response = await inquirer.prompt( [
            {
                'type': 'confirm',
                'name': 'sure',
                'message': 'Yes/No',
                'default': true
            }
        ] )

        if( !response['sure'] ) {
            return true
        }

        await this.#easyMina.createAccounts( {
            'names': [ 'alice', 'bob', 'charlie' ],
            'networkName': 'berkeley',
            'groupName': 'a'
        } )

        console.log( '' )

        return response
    }


    async #createEnvironment() {
        const status = this.#easyMina.getEnvironmentStatus()
        if( status['environmentReady'] ) {
            this.#easyMina.setEnvironment()
            const msg = '✔ Environment ready.'
            const msgColor = chalk.green( msg )
            console.log( msgColor )
        } else {
            const msg = 'The following directories are missing, should they be created?'
            const msgColor = chalk.green( msg )
            console.log( msgColor )
            Object
                .entries( status['folders'] )
                .filter( a => !a[ 1 ]['status'] )
                .forEach( ( a, index, all ) => {
                    if( all.length - 1 !== index ) {
                        console.log( `  ├── ${a[ 1 ]['path']}` )
                    } else {
                        console.log( `  └── ${a[ 1 ]['path']}` )
                    }
                } )
            
            const response = await inquirer.prompt( [
                {
                    'type': 'confirm',
                    'name': 'sure',
                    'message': 'Yes/No',
                    'default': true
                }
            ] )

            !response['sure'] ? process.exit( 1 ) : console.log( '' )
            this.#easyMina.setEnvironment()
            return true
        }


        console.lo
    }


    async #areYouSure( { msg } ) {
        const response = await inquirer.prompt( [
            {
              'type': 'confirm',
              'name': 'sure',
              'message': msg,
              'default': true
            }
        ] )
        return response
    }


    #addHealine() {
        console.log(
            figlet.textSync(
                "Easy Mina", 
                {
                    font: "big",
                    horizontalLayout: "default",
                    verticalLayout: "default",
                    width: 100,
                    whitespaceBreak: true,
                } 
            )
        )
        return true
    }


    #addHeadline2() {
        console.log(
            `
-- - - - - - --*-- - - - - - --
|       ___           ___       |
|      /\\  \\         /\\__\\      |
|     /::\\  \\       /::|  |     |
|    /:/\\:\\  \\     /:|:|  |     |
|   /::\\~\\:\\  \\   /:/|:|__|__   |
|  /:/\\:\\ \\:\\__\\ /:/ |::::\\__\\  |
|  \\:\\~\\:\\ \\/__/ \\/__/~~/:/  /  |
|   \\:\\ \\:\\__\\         /:/  /   |
|    \\:\\ \\/__/        /:/  /    |
|     \\:\\__\\         /:/  /     |
|      \\/__/         \\/__/      |
|                               |
-- - -- E a s y M i n a -- - -- 
| change the world with zk tech |  
---------------------------------  
`
        )
    }
}