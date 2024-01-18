import axios from 'axios'
import url from 'url'
import path from 'path'
import moment from 'moment'


export class Markdown {
    #config


    constructor( config ) {
        this.#config = config
    }

    createDeployedContractGroupTables( { environment, contract, encryption } ) {
        const deployedContracts = environment.getDeployedContracts( {
            contract,
            encryption
        } )

        let strs = ''
        strs += Object
            .entries( deployedContracts )
            .reduce( ( acc, a, index ) => {
                const [ groupName, contractGroup ] = a
                acc += `**ProjectName:** ${groupName}  \n`
                acc += "\n"
                acc += this.#createDeployedContractGroupTable( {
                    groupName,
                    contractGroup
                } )
                acc += `  \n`
                acc += `  \n`

                return acc
            }, '' )

        return strs
    }


    createAccountGroupTables( { environment, account, encryption } ) {
        const accounts = environment.getAccounts( { 
            account, 
            encryption 
        } )

        let strs = ''
        strs += Object
            .entries( accounts )
            .reduce( ( acc, a, index ) => {
                const [ groupName, accountGroup ] = a
                acc += `**GroupName:** ${groupName}  \n`
                acc += "\n"
                acc += this.#createAccountGroupTable( {
                    groupName,
                    accountGroup
                } )
                acc += `  \n`
                acc += `  \n`

                return acc
            }, '' )


        return strs
    }


    createProjects( { environment, projectName } ) {
        const contractGroup = environment.getDevelopmentContracts()
        const scripts = environment.getScripts()

        let strs = ''
        strs += `  \n`
        strs += `  \n`
        strs += Object
            .entries( contractGroup )
            .filter( a => a[ 0 ] === projectName )
            .reduce( ( acc, a, index ) => {
                const [ projectName, contracts ] = a
                acc += `<details open><summary>  \n`
                acc += `  \n`
                acc += `## ${projectName}  \n`
                acc += `</summary>  \n`
                // acc += `  \n`
                // acc += this.#createProjectContractTable( { contracts, projectName } )
                acc += `  \n`
                acc += this.#createProjectBackendTable( { scripts, projectName, 'key': 'backend' } )
                acc += `  \n`
                acc += this.#createProjectFrontendTable( { scripts, projectName } )
                acc += `  \n`
                acc += `</details>  \n`
                return acc
            }, '' ) + '  '

        return strs
    }


    #createDeployedContractGroupTable( { groupName, contractGroup } ) {
        const columns = [ 'Name', 'Address', 'Created', 'Status', 'Balance', 'Nonce', 'Network', 'Tx' ]

        let strs = ''
        strs += Object
            .entries( contractGroup )
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a
                if( index === 0 ) {
                    acc += `| ${columns.join( ' | ')} |  \n`
                    acc += `| ${columns.map( a => ':--' ).join( ' | ')} |  \n`
                }

                acc += `| `
                acc += columns
                    .map( column => {
                        let str = ''
                        switch( column ) {
                            case 'Name':
                                str = value['name']
                                break
                            case 'Address':
                                str += `[`
                                str += value['addressShort']
                                str += `]`
                                str += `(${value['explorer']})`
                                // str = value['addressShort']
                                break
                            case 'Network':
                                str = value['networkName']
                                break
                            case 'Created': 
                                const durationInMilliseconds = moment().diff(
                                    moment.unix( value['createdUnix'] )
                                )
                                const duration = moment.duration( durationInMilliseconds )
                                const formattedDuration = duration.humanize()
                                str = formattedDuration
                                break
                            case 'Status': 
                                str = ''
                                str += `<div id="status--${value['addressFull']}">`
                                str += ''
                                str += '</div>'
                                break
                            case 'Balance': 
                                str = ''
                                str += `<div id="balance--${value['addressFull']}">`
                                str += ''
                                str += '</div>'
                                break
                            case 'Nonce': 
                                // str = '<div>5</div>'
                                str = ''
                                str += `<div id="nonce--${value['addressFull']}">`
                                str += ''
                                str += '</div>'
                                break
                            case 'Tx': 
                                str += `[`
                                str += `X`
                                str += `]`
                                str += `(${value['txHashExplorer']})`
                                break
                            case 'Explorer':
                                const parsedUrl = url.parse( value['explorer'] )
                                let hostname = parsedUrl.hostname
                                if( hostname.split( '.' ).length > 2 ) {
                                    hostname = hostname.split( '.' ).slice( -2 ).join( '.' )
                                }

                                str += `[`
                                str += `X`
                                str += `]`
                                str += `(${value['explorer']})`
                                break
                            case 'Import':
                                // str = ` \`${JSON.stringify( { name: value['name'], groupName } )}\` `
                                break
                            default:
                                break
                        }

                        return str
                    } )
                    .join( ' | ' )

                acc += ` |  \n`
                return acc
            }, '' )
            
        return strs
    }


    #createProjectBackendTable( { scripts, projectName, key } ) {
        let strs = ''
        const columns = [ 'Name', 'Npm run', 'Readme' ]
        const table = Object
            .entries( scripts[ projectName ]['backend'] )
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a
                if( index === 0 ) {
                    strs += `**Scripts**  \n`
                    strs += `  \n`
                    acc += `| ${columns.join( ' | ' )} |  \n`
                    acc += `| ${columns.map( a => `:--` ).join( ' | ' )} |  \n`
                }

                acc += `| `
                acc += columns
                    .map( column => {
                        let row = ''
                        switch( column ) {
                            case 'Name':
                                row = `${key}`
                                break
                            case 'Npm run': 
                                row = `\`${value['npm']}\``
                                break
                            case 'Readme':
                                if( value['md'] !== '' ) {
                                    row = `[X](${value['mdUrl']})`
                                } else {
                                    row = ''
                                }
                                
                                break
                            default:
                                row = 'undefined'
                                break
                        }
                        return row
                    } )
                    .join( ' | ' )
                acc += ` |  \n`

                return acc
            }, '')

        strs += table
        return strs
    }


    #createProjectFrontendTable( { scripts, projectName, key='frontend' } ) {
        let strs = ''

        const str = key
            .split( '' )
            .map( ( char, index ) => {
                if( index === 0 ) {
                    return char.charAt( 0 ).toUpperCase()
                } else {
                    return char.charAt( 0 ).toLowerCase()
                }
            } )
            .join( '' )

        const columns = [ 'Name', 'Url' ]
        const table = Object
            .entries( scripts[ projectName ][ key ] )
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a
                if( index === 0 ) {
                    strs += `**${str}**  \n`
                    strs += `  \n`
                    acc += `| ${columns.join( ' | ' )} |  \n`
                    acc += `| ${columns.map( a => `:--` ).join( ' | ' )} |  \n`
                }

                acc += `| `
                acc += columns
                    .map( column => {
                        let row = ''
                        switch( column ) {
                            case 'Name':
                                row = `${key}`
                                break
                            case 'Url':
                                row = `[X](${value['sourceUrl']})`
                                break
                            case 'Readme':
                                if( value['md'] !== '' ) {
                                    row = `[X](${value['mdUrl']})`
                                } else {
                                    row = ''
                                }
                                
                                break
                            default:
                                row = 'undefined'
                                break
                        }
                        return row
                    } )
                    .join( ' | ' )
                acc += ` |  \n`

                return acc
            }, '')

        strs += table

        return strs
    }


    #createProjectContractTable( { contracts, projectName } ) {
        let strs = ''
        // strs += `#### ${projectName}  \n`
        const columns = [ 'Name', 'Methods', 'Typescript', 'Javascript' ]
        const tables = Object
            .entries( contracts )
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a 
                if( index === 0 ) {
                    strs += `**Contracts**  \n`
                    strs += `  \n`
                    acc += `| ${columns.join( ' | ' )} |  \n`
                    acc += `| ${columns.map( a => `:--` ).join( ` | ` )} |  \n`
                }

                acc += `| `
                acc += [
                    [ `${key}`, 'name' ],
                    [ ``, 'methods' ],
                    [ `${value['ts']}`, 'file' ],
                    [ `${value['js']}`, 'file' ],
                    // [ `${JSON.stringify({'name': key, 'groupName': projectName })}`, 'import' ]
                ]
                    .map( a => {
                        const [ value, type ] = a
                        let str = ''
                        switch( type ) {
                            case 'name':
                                str = `${value}`
                                break
                            case 'methods':
                                str = ``
                                break
                            case 'file':
                                if( value === '' ) {
                                    str = ``
                                } else {
                                    str = `[file](${value})`
                                }
                                break
                            case 'import':
                                // str = `\`${value}\``
                                break
                            default:
                                break
                        }

                        return str
                    } )
                    .join( ` | ` )
                acc += ` |  \n`

                return acc
            }, '')

        strs += tables + "  \n"
        strs += `Run typescript compile with: \`tsc -p '...'\`  \n`

        return strs
    }


    #createAccountGroupTable( { groupName, accountGroup } ) {
        const columns = [ 'Name', 'Address', 'Created', 'Status', 'Balance', 'Nonce', 'Network', 'Faucet' ]

        let strs = ''
        strs += Object
            .entries( accountGroup )
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a
                if( index === 0 ) {
                    acc += `| ${columns.join( ' | ')} |  \n`
                    acc += `| ${columns.map( a => ':--' ).join( ' | ')} |  \n`
                }

                acc += `| `
                acc += columns
                    .map( column => {
                        let str = ''
                        switch( column ) {
                            case 'Name':
                                str = value['name']
                                break
                            case 'Address':
                                str += `[`
                                str += value['addressShort']
                                str += `]`
                                str += `(${value['explorer']})`
                                // str = value['addressShort']
                                break
                            case 'Network':
                                str = value['networkName']
                                break
                            case 'Created': 
                                const durationInMilliseconds = moment().diff(
                                    moment.unix( value['createdUnix'] )
                                )
                                const duration = moment.duration( durationInMilliseconds )
                                const formattedDuration = duration.humanize()
                                str = formattedDuration
                                break
                            case 'Status': 
                                str = ''
                                str += `<div id="status--${value['addressFull']}">`
                                str += ''
                                str += '</div>'
                                break
                            case 'Balance': 
                                str = ''
                                str += `<div id="balance--${value['addressFull']}">`
                                str += ''
                                str += '</div>'
                                break
                            case 'Nonce': 
                                // str = '<div>5</div>'
                                str = ''
                                str += `<div id="nonce--${value['addressFull']}">`
                                str += ''
                                str += '</div>'
                                break
                            case 'Faucet': 
                                str += `[`
                                str += `X`
                                str += `]`
                                str += `(${value['faucetTxHashExplorer']})`
                                break
                            case 'Explorer':
                                const parsedUrl = url.parse( value['explorer'] )
                                let hostname = parsedUrl.hostname
                                if( hostname.split( '.' ).length > 2 ) {
                                    hostname = hostname.split( '.' ).slice( -2 ).join( '.' )
                                }

                                str += `[`
                                str += `X`
                                str += `]`
                                str += `(${value['explorer']})`
                                break
                            case 'Import':
                                // str = ` \`${JSON.stringify( { name: value['name'], groupName } )}\` `
                                break
                            default:
                                break
                        }

                        return str
                    } )
                    .join( ' | ' )

                acc += ` |  \n`
                return acc
            }, '' )
            
        return strs
    }
}