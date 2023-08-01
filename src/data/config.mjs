import moment from 'moment'


export const configImported = {
    'meta': {
        'name': 'default',
        'unix': moment().unix(),
        'format': moment().format(),
        'easyMinaVersion': '0.01',
    },
    'docs': {
        'url': 'https://easymina.github.io/',
        'options': 'options',
        'setEnvironment': 'features/setEnvironment.html',
        'fetchInformation': 'features/fetchEnvironment.html',
        'deployContract': 'features/deployContract.html'
    },
    'environment': {
        'addresses': {
            'splitter': '--',
            'root': '.mina/',
            'deployers': {
                'folder': 'deployers/',
                'fullFolder': null,
                'fileNameStruct': '{{name}}{{splitter}}{{unix}}.json',
                'fileName': null
            },
            'contracts': {
                'folder': 'contracts/',
                'fullFolder': null,
                'fileNameStruct': '{{name}}{{splitter}}{{unix}}.json'
            },
            'structs': {
                'split': '__', 
                'minaAddressRegex': /^B62[a-km-zA-HJ-NP-Z1-9]{52}$/,
                'deployer': {
                    'name': [ 'String' ],
                    'type': [ 'String' ],
                    'time__unix': [ 'Int' ],
                    'time__format': [ 'String' ],
                    'address__private': [ 'String' ],
                    'address__public': [ 'MinaPublicAddress' ],
                    'comment': [ 'String' ],
                    'faucets': [ 'Array' ]
                }
            },
        },
        'workspace': {
            'contracts': {
                'root': 'workdir/',
                'typescript': {
                    'folder': 'typescript/',
                    'full': null,
                    'fullRelative': null,
                    'fileName': null
                },
                'build': {
                    'folder': 'build/',
                    'full': null,
                    'fullRelative': null
                }
            },
            'gitignore': '.gitignore'
        },
        'template': {
            'regexs': {
                'gist':  'string__gistTemplate',
                'https': 'string__urlHttps',
                'plain': 'string__plainTemplate'
            },
            'source': {
                //'source': 'https://gist.github.com/a6b8/e6baafbad2e42e4a259c10b6a3dcc836'
                'content': "import {\n  Field,\n  SmartContract,\n  state,\n  State,\n  method,\n} from 'snarkyjs';\n\n\nexport class Square extends SmartContract {\n    @state(Field) num = State<Field>();\n    \n    \n    init() {\n        super.init();\n        this.num.set( Field( 3 ) );\n    }\n\n\n    @method update( square: Field ) {\n        const currentState = this.num.get();\n        this.num.assertEquals( currentState );\n        square.assertEquals( currentState.mul( currentState ) );\n        this.num.set( square );\n    }\n}",
                'name': '{{name}}.ts',
            },
            'parse': {
                'gist': 'https://api.github.com/gists/{{three}}',
                'https': '{{one}}',
                'plain': '{{one}}'
            }
        }
    },
/*
    'structs': {
        'split': '__', 
        'minaAddressRegex': /^B62[a-km-zA-HJ-NP-Z1-9]{52}$/,
        'deployer': {
            'name': [ 'String' ],
            'type': [ 'String' ],
            'time__unix': [ 'Int' ],
            'time__format': [ 'String' ],
            'address__private': [ 'String' ],
            'address__public': [ 'MinaPublicAddress' ],
            'comment': [ 'String' ],
            'faucet__transaction': [ 'String' ],
            'faucet__network': [ 'String' ]
        }
    },
*/
    'network': {
        'use': 'berkeley', 
        'berkeley': {
            'explorer': {
                'transaction': 'https://berkeley.minaexplorer.com/transaction/',
                'wallet': 'https://berkeley.minaexplorer.com/wallet/'
            },
            'node': 'https://berkeley.graphql.minaexplorer.com',
            'nodeProxy': 'https://proxy.berkeley.minaexplorer.com/graphql',
            'graphQl': 'https://berkeley.graphql.minaexplorer.com',
            'faucet': {
                'api': 'https://faucet.minaprotocol.com/api/v1/faucet',
                'web': 'https://faucet.minaprotocol.com/?address={{address}}',
                'network': 'berkeley-qanet'
            },
            'transaction_fee': 100_000_000,
        }
    },
    'console': {
        'symbols': {
            'neutral': '⬛',
            'onProgress1': '🔄',
            'onProgress2': '🔥',
            'ok1': '🟩',
            'ok2': '🟪',
            'split': '',
            'failed': '❌'
        },
        'space': 30,
        'messages': {
            'accountComment': 'Do not share this file with someone.'
        }
    },
    'graphQl': {
        'render': {
            'frameInterval': 1000,
            'delayBetweenRequests': 10000,
            'singleMaxInSeconds': 30
        },
        'presets': {
            'singleRequest': {
                'mode': 'maxTries',
                'maxTries': 1,
                'requestInterval': 0
            },
            'newTransaction': {
                'mode': 'maxMinutes',
                'maxMinutes': 3,
                'requestIntervalInSeconds': 0
            }
        },
        'transactionByHash': {
            'key': 'transaction',
            'type': 'hash',
            'cmd': {
                'query': "query q($hash: String!) {\n  transaction(query: {hash: $hash}) {\n    hash\n    dateTime\n    blockHeight\n    from\n    nonce\n    to\n    toAccount {\n      token\n    }\n  }\n}",
                'variables': {
                    'hash': '5Jv6t2eyPZgGNWxct5kkhRwmF5jkEYNZ7JCe1iq6DMusvXGmJwiD'
                },
                'operationName': 'q'
              }
        },
        'latestBlockHeight': {
            'key': 'block',
            'type': 'hash',
            'cmd': {
                'query': "query q($blockHeight_lt: Int) {\n  block(query: {blockHeight_lt: $blockHeight_lt}) {\n    blockHeight\n    dateTime\n  }\n}",
                'variables': {
                    'blockHeight_lt': 999999999 
                },
                'operationName': 'q'
            }
        },
        'latestBlockHeights': {
            'key': 'blocks',
            'type': 'array',
            'cmd': {
                'query': "query q($limit: Int) {\n  blocks(limit: $limit, sortBy: BLOCKHEIGHT_DESC) {\n    blockHeight\n    protocolState {\n      consensusState {\n        slotSinceGenesis\n        slot\n      }\n    }\n    dateTime\n    receivedTime\n  }\n}",
                'variables': {
                    'limit': 10
                },
                'operationName': 'q'
              }
        },
        'latestEventsFromContract': {
            'key': 'events',
            'type': 'array',
            'cmd': {
                'query': "query q($limit: Int!, $blockHeight_lt: Int!, $creator: String!) {\n events(query: {blockHeight_lt: $blockHeight_lt, blockStateHash: {creator: $creator}}, sortBy: BLOCKHEIGHT_DESC, limit: $limit) {\n blockHeight\n dateTime\n event\n blockStateHash {\n creatorAccount {\n publicKey\n }\n }\n }\n}",
                'variables': {
                    'limit': 10,
                    'blockHeight_lt': 999999999,
                    'creator': 'B62qnLVz8wM7MfJsuYbjFf4UWbwrUBEL5ZdawExxxFhnGXB6siqokyM'
                },
                'operationName': 'q'
            }
        },
        'latestEventsFromContractByBlockHeight': {
            'key': 'events',
            'type': 'array',
            'cmd': {
                'query': "query q($limit: Int!, $blockHeight: Int!, $publicKey: String!) {\n events(limit: $limit, query: {blockHeight: $blockHeight, blockStateHash: {creatorAccount: {publicKey: $publicKey}}}) {\n blockHeight\n dateTime\n event\n blockStateHash {\n creatorAccount {\n publicKey\n }\n }\n }\n}",
                'variables': {
                    'limit': 10, 
                    'blockHeight': 2785, 
                    'publicKey': 'B62qnLVz8wM7MfJsuYbjFf4UWbwrUBEL5ZdawExxxFhnGXB6siqokyM' 
                },
                'operationName': 'q'
            }
        }
    },
    'print': {
        'split': '__',
        'insertManual': '<<insert>>', 
        'regexs': {
            'format': /{{[a-zA-Z0-9_]+}}/g,
            'minaAddress': /^B62[a-km-zA-HJ-NP-Z1-9]{52}$/
        },
        'levels': [ '', '  {{enumerations__1}}.   ', '  {{enumerations__1}}.{{enumerations__2}}. ', '  ' ],
        'spaces': {
            'standard': 24,
            'extended': 40
        },
        'enumerations': {
            '1': [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ],
            '2': [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26' ],
            'notFound': ''
        },
        'userInteractions': {
            'yesNo': {
                'validatons': [
                    {
                        'validation': 'messages__yes',
                        'finished': { 'format': '{{messages__validationIsSetTo}}', 'output': true },
                    },
                    {
                        'validation': 'messages__no',
                        'finished': { 'format': '{{messages__validationIsSetTo}}', 'output': true },
                    }
                ],
                'failed': { 
                    'format': '{{messages__validationIsSetTo}}', 
                    'output': null 
                }
            },
            'minaAddress': {
                'validations': [
                    {
                        'validation': 'regexs__minaAddress',
                        'finished': { 
                            'format': '{{levels}}{{messages__transaction}}{{spaces__standard}}{{status__standard}} {{messages__validationSuccess}}', 
                            'output': 'userInteractions__input' 
                        }
                    }
                ],
                'failed': { 
                    'format': '{{levels}}{{messages__transaction}}{{spaces__standard}}{{status__standard}} {{messages__validationFailed}}',
                    'output': null 
                }
            }
        },
        'status': {
            'standard': {
                'finished': [ '🟩' ],
                'failed': [ '❌' ],
                'progress': [ '🔄' ]
            },
            'loading': {
                'finished': [],
                'failed': [],
                'progress': [
                    "▰▱▱",
                    "▰▰▱",
                    "▰▰▰",
                    "▱▰▰",
                    "▱▱▰",
                    "▱▱▱",
                ]
                /*
                'progress': [
                    "▰▱▱▱▱▱▱",
                    "▰▰▱▱▱▱▱",
                    "▰▰▰▱▱▱▱",
                    "▰▰▰▰▱▱▱",
                    "▰▰▰▰▰▱▱",
                    "▰▰▰▰▰▰▱",
                    "▰▰▰▰▰▰▰",
                    "▰▰▰▰▰▰▱",
                    "▰▰▰▰▰▱▱",
                    "▰▰▰▰▱▱▱",
                    "▰▰▰▱▱▱▱",
                    "▰▰▱▱▱▱▱"
                ]
                */
            }
        },
        'structs': {
            'newLine': {
                'question':  null,
                'format': {
                    'finished': ''
                },
                'cmds': null
            },
            'title': {
                'question':  null,
                'format': {
                    'finished': '{{levels}}{{external__title}}'
                },
                'cmds': null
            },
            'standard': {
                'question': null,
                'format': {
                    'progress': '{{levels}}{{messages__standardFront}} {{spaces__standard}}{{status__standard}} {{status__loading}} {{messages__standardProgress}} {{messages__didYouKnow}}',
                    'finished': '{{levels}}{{messages__standardFront}} {{spaces__standard}}{{status__standard}} {{messages__standardFinished}}',
                    'failed': '{{levels}}{{messages__standardFront}} {{spaces__standard}}{{status__standard}} {{messages__standardFailed}}'
                },
                'cmds': null
            },
            'addDeployers': {
                'question': null,
                'format': {
                    'progress': '{{levels}}{{messages__addDeployersFront}} {{spaces__standard}}{{status__standard}} {{status__loading}} {{messages__addDeployersProgress}}',
                    'finished': '{{levels}}{{messages__addDeployersFront}} {{spaces__standard}}{{status__standard}} {{messages__addDeployersSuccess}}',
                    'failed': '{{levels}}{{messages__addDeployersFront}} {{spaces__standard}}{{status__standard}} {{messages__addDeployersFailed}}'
                },
                'cmds': null
            },
            'addEnvironmentAddresses': {
                'question': null,
                'format': {
                    'progress': '{{levels}}{{messages__addEnvironmentAddressesFront}} {{spaces__standard}}{{status__standard}} {{status__loading}} {{messages__addEnvironmentAddressesProgress}}',
                    'finished': '{{levels}}{{messages__addEnvironmentAddressesFront}} {{spaces__standard}}{{status__standard}} {{messages__addEnvironmentAddressesSuccess}}',
                    'failed': '{{levels}}{{messages__addEnvironmentAddressesFront}} {{spaces__standard}}{{status__standard}} {{messages__addEnvironmentAddressesFailed}}'
                },
                'cmds': null
            },
            'getFaucet': {
                'question': null,
                'format': {
                    'progress': '{{levels}}{{messages__getFaucetFront}} {{spaces__standard}}{{status__standard}} {{status__loading}} {{messages__getFaucetProgress}}',
                    'finished': '{{levels}}{{messages__getFaucetFront}} {{spaces__standard}}{{status__standard}} {{messages__getFaucetSuccess}}',
                    'failed': '{{levels}}{{messages__getFaucetFront}} {{spaces__standard}}{{status__standard}} {{messages__getFaucetFailed}}'
                },
                'cmds': null
            },
            'transactionByHash': {
                'question': null,
                'format': {
                    'progress': '{{levels}}{{messages__transactionByHashFront}} {{spaces__standard}}{{status__standard}} {{status__loading}} {{messages__transactionByHashProgress}}',
                    'finished': '{{levels}}{{messages__transactionByHashFront}} {{spaces__standard}}{{status__standard}} {{messages__transactionByHashSuccess}}',
                    'failed': '{{levels}}{{messages__transactionByHashFront}} {{spaces__standard}}{{status__standard}} {{messages__transactionByHashFailed}}'
                },
                'cmds': null
            },
            'latestBlockHeight': {
                'question': null,
                'format': {
                    'progress': '{{levels}}{{messages__latestBlockHeightFront}} {{spaces__standard}}{{status__standard}} {{messages__latestBlockHeightProgress}}',
                    'finished': '{{levels}}{{messages__latestBlockHeightFront}} {{spaces__standard}}{{status__standard}} {{messages__latestBlockHeightSuccess}}',
                    'failed': '{{levels}}{{messages__latestBlockHeightFront}} {{spaces__standard}}{{status__standard}} {{messages__latestBlockHeightFailed}}'
                },
                'cmds': null
            },
            'latestBlockHeights': {
                'question': null,
                'format': {
                    'progress': '{{levels}}{{messages__latestBlockHeightsFront}} {{spaces__standard}}{{status__standard}} {{messages__latestBlockHeightsProgress}}',
                    'finished': '{{levels}}{{messages__latestBlockHeightsFront}} {{spaces__standard}}{{status__standard}} {{messages__latestBlockHeightsSuccess}}',
                    'failed': '{{levels}}{{messages__latestBlockHeightsFront}} {{spaces__standard}}{{status__standard}} {{messages__latestBlockHeightsFailed}}'
                },
                'cmds': null
            },
            'latestEventsFromContract': {
                'question': null,
                'format': {
                    'progress': '{{levels}}{{messages__latestEventsFromContractFront}} {{spaces__standard}}{{status__standard}} {{messages__latestEventsFromContractProgress}}',
                    'finished': '{{levels}}{{messages__latestEventsFromContractFront}} {{spaces__standard}}{{status__standard}} {{messages__latestEventsFromContractSuccess}}',
                    'failed': '{{levels}}{{messages__latestEventsFromContractFront}} {{spaces__standard}}{{status__standard}} {{messages__latestEventsFromContractFailed}}'
                },
                'cmds': null
            },
            'latestEventsFromContractByBlockHeight': {
                'question': null,
                'format': {
                    'progress': '{{levels}}{{messages__latestEventsFromContractByBlockHeightFront}} {{spaces__standard}}{{status__standard}} {{messages__latestEventsFromContractByBlockHeightProgress}}',
                    'finished': '{{levels}}{{messages__latestEventsFromContractByBlockHeightFront}} {{spaces__standard}}{{status__standard}} {{messages__latestEventsFromContractByBlockHeightSuccess}}',
                    'failed': '{{levels}}{{messages__latestEventsFromContractByBlockHeightFront}} {{spaces__standard}}{{status__standard}} {{messages__latestEventsFromContractByBlockHeightFailed}}'
                },
                'cmds': null
            }
        }
    },
    'messages': {
        'use': 'en',
        'en': {
            'transactionByHashFront': [ 'Get Transaction by Hash' ],
            'transactionByHashProgress': [ 'Waiting for Transaction ID: {{external__hash}}' ],
            'transactionByHashSuccess': [ 'Success! {{custom__networkExplorerTransaction}}{{external__hash}}' ],
            'transactionByHashFailed': [ 'Transaction not found ({{external__hash}})' ],
    
            'latestBlockHeightFront': [ 'Get Latest Block Height' ],
            'latestBlockHeightProgress': [ 'Wait for response.' ],
            'latestBlockHeightSuccess': [ 'Success! Current Block Height is: {{external__blockHeight}}' ],
            'latestBlockHeightFailed': [ 'Unable to fetch results.' ],
            
            'latestBlockHeightsFront': [ 'Get Latest Blocks' ],
            'latestBlockHeightsProgress': [ 'Waiting for the latest Blocks.' ],
            'latestBlockHeightsSuccess': [ 'Success! Received {{external__count}} blocks.' ],
            'latestBlockHeightsFailed': [ 'Unable to fetch results.' ],
    
            'latestEventsFromContractFront': [ 'Get Events from Contract' ],
            'latestEventsFromContractProgress': [ 'Waiting for Events from ({{external__creator}})' ],
            'latestEventsFromContractSuccess': [ 'Success! Received {{external__count}} Events.' ],
            'latestEventsFromContractFailed': [ 'Unable to fetch results.' ],
    
            'latestEventsFromContractByBlockHeightFront': [ 'Get Events by Contract/Block Height' ],
            'latestEventsFromContractByBlockHeightProgress': [ 'Waiting for confirmation, {{external__receiver}}' ],
            'latestEventsFromContractByBlockHeightSuccess': [ 'Success! Received {{external__count}} Events, ({{external__publicKey}}, {{external__blockHeight}})' ],
            'latestEventsFromContractByBlockHeightFailed': [ 'Failed! Creator: {{external__publicKey}}, Block Height {{external__blockHeight}}' ],

            'getFaucetFront': [ 'Get Faucet' ],
            'getFaucetProgress': [ 'Waiting for confirmation! {{external__receiver}}' ],
            'getFaucetSuccess': [ 'Success! {{external__explorer}}' ],
            'getFaucetFailed': [ 'Failed!' ],

            'addEnvironmentAddressesFront': [ 'Scan Environment' ],
            'addEnvironmentAddressesProgress': [ 'Scan folders!' ],
            'addEnvironmentAddressesSuccess': [ 'Found {{external__deployers}} Deployers, {{external__contracts}} Contracts' ],
            'addEnvironmentAddressesFailed': [ 'Failed!' ],

            'addDeployersFront': [ 'Deployers' ],
            'addDeployersProgress': [ 'Scanning!' ],
            'addDeployersSuccess': [ 'Ready to use: {{external__readyToUse}}, Pending: {{external__pending}}.' ],
            'addDeployersFailed': [ 'Failed!' ],

            'errorKeyNotFound': [ 'Key: "<<insert>>" not found' ],
            'errorTypeNotFound': [ 'Type: "<<insert>>" not found' ],

            'standardFront': [ '{{external__front}}' ],
            'standardProgress': [ 'Next slot: {{external__progress}}.' ],
            'standardFinished': [ '{{external__progress}}.' ],
            'standardSuccess': [ '{{external__success}}' ],
            'standardFailed': [ '{{external__failed}}' ],

            'didYouKnow': [ '' ]
        }
    },
    'typescript': {
        'template': {
            'compilerOptions': {
                'target': 'ES2019',
                'module': 'es2022',
                'lib': [ 'dom', 'esnext' ],
                'outDir': null,
                'rootDir': null,
                'strict': true,
                'strictPropertyInitialization': false, // to enable generic constructors, e.g. on CircuitValue
                'skipLibCheck': true,
                'forceConsistentCasingInFileNames': true,
                'esModuleInterop': true,
                'resolveJsonModule': true,
                'moduleResolution': 'node',
                'experimentalDecorators': true,
                'emitDecoratorMetadata': true,
                'allowJs': true,
                'declaration': false,
                'sourceMap': false,
                'noFallthroughCasesInSwitch': true,
                'allowSyntheticDefaultImports': true,
                'isolatedModules': true,
                // 'outFile': null
            },
            'include': null,
            'exclude': []
        },
        'fileName': 'tsconfig.json'
    },
    "validations": {
        "keyPaths": {
            "meta__name": {
                "userPath": {
                    "en": "projectName"
                },
                "validation": "string__hyphenAsSpace",
                "category": "general",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "environment__addresses__splitter": {
                "userPath": {
                    "en": "fileNameSplitter"
                },
                "validation": "string__splitters",
                "category": "account",
                "methods": [ 'setEnvironment' ]
            },
            "environment__addresses__root": {
                "userPath": {
                    "en": "credentialsRootFolderName"
                },
                "validation": "string__folderNameInvisible",
                "category": "account",
                "methods": [ 'setEnvironment' ]
            },
            "environment__addresses__deployers__folder": {
                "userPath": {
                    "en": "accountsFolderName"
                },
                "validation": "string__folderName",
                "category": "account",
                "methods": [ 'setEnvironment' ]
            },
            "environment__addresses__deployers__fileName": {
                "userPath": {
                    "en": "deployerFileName"
                },
                "validation": "string__fileNameCredentials",
                "category": "account",
                "methods": [ 'deployContract' ]
            },
            "environment__addresses__contracts__folder": {
                "userPath": {
                    "en": "contractsFolderName"
                },
                "validation": "string__folderName",
                "category": "account",
                "methods": [ 'setEnvironment' ]
            },
            "environment__workspace__contracts__root": {
                "userPath": {
                    "en": "workspaceRootFolderName"
                },
                "validation": "string__folderName",
                "category": "workspace",
                "methods": [ 'setEnvironment' ]
            },
            "environment__workspace__contracts__typescript__folder": {
                "userPath": {
                    "en": "workspaceTypescriptFolderName"
                },
                "validation": "string__folderName",
                "category": "workspace",
                "methods": [ 'setEnvironment' ]
            },
            "environment__workspace__contracts__typescript__fileName": {
                "userPath": {
                    "en": "smartContractFileName"
                },
                "validation": "string__typescriptFileName",
                "category": "workspace",
                "methods": [ 'deployContract' ]
            },
            "environment__workspace__contracts__build__folder": {
                "userPath": {
                    "en": "workspaceBuildFolderName"
                },
                "validation": "string__folderName",
                "category": "workspace",
                "methods": [ 'setEnvironment' ]
            },
            "environment__template__source__content": {
                "userPath": {
                    "en": "smartContractContentDefault"
                },
                "validation": "string__plainTemplate",
                "category": "workspace",
                "methods": [ 'setEnvironment' ]
            },
            "environment__template__source__name": {
                "userPath": {
                    "en": "smartContractNameDefault"
                },
                "validation": "string__typescriptFileNamePlaceholder",
                "category": "workspace",
                "methods": [ 'setEnvironment' ]
            },
            "network__use": {
                "userPath": {
                    "en": "networkName"
                },
                "validation": "string__networkName",
                "category": "network",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "network__berkeley__explorer__transaction": {
                "userPath": {
                    "en": "transactionExplorer"
                },
                "validation": "string__urlHttps",
                "category": "network",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "network__berkeley__explorer__wallet": {
                "userPath": {
                    "en": "walletExplorer"
                },
                "validation": "string__urlHttps",
                "category": "network",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "network__berkeley__node": {
                "userPath": {
                    "en": "berkeleyNode"
                },
                "validation": "string__urlHttps",
                "category": "network",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "network__berkeley__nodeProxy": {
                "userPath": {
                    "en": "berkeleyNodeProxy"
                },
                "validation": "string__urlHttps",
                "category": "network",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "network__berkeley__graphQl": {
                "userPath": {
                    "en": "berkeleyGraphQl"
                },
                "validation": "string__urlHttps",
                "category": "network",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "network__berkeley__transaction_fee": {
                "userPath": {
                    "en": "transactionFee"
                },
                "validation": "string__urlHttps",
                "category": "network",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "console__messages__accountComment": {
                "userPath": {
                    "en": "accountMessage"
                },
                "validation": "string__default",
                "category": "general",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "print__spaces__standard": {
                "userPath": {
                    "en": "consoleSpacesStandard"
                },
                "validation": "integer__positiveNumber",
                "category": "general",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "print__spaces__extended": {
                "userPath": {
                    "en": "consoleSpacesStandard"
                },
                "validation": "integer__positiveNumber",
                "category": "general",
                "methods": [ 'setEnvironment', 'deployContract' ]
            },
            "messages__use": {
                "userPath": {
                    "en": "consoleLanguage"
                },
                "validation": "string__language",
                "category": "general",
                "methods": [ 'setEnvironment', 'deployContract' ]
            }
        },
        "regexs": {
            "string": {
                "default": {
                    "description": {
                        "en": "Allow A-Z, a-b and 0-9 as value."
                    },
                    "regex": "^[a-zA-Z0-9\\s.-]*$",
                    "message": {
                        "en": "Please use only letters (A-Z, a-z), numbers (0-9), spaces, periods, or hyphens."
                    }
                },
                "hyphenAsSpace": {
                    "description": {
                        "en": "Allow A-Z, a-b and 0-9 as value, use '-' for space."
                    },
                    "regex": "^[a-zA-Z0-9-]*$",
                    "message": {
                        "en": "You can use only letters (A-Z, a-z), numbers (0-9), and hyphens. Replace spaces with hyphens."
                    }
                },
                "fileNameCredentials": {
                    "description": {
                        "en": "Allows file names with the structure \"{{name}}--{{unix}}.json\". {{name}} can contain alphanumerics and hyphens, and {{unix}} is a Unix timestamp."
                    },
                    "regex": "^[a-zA-Z0-9-]+--\\d+\\.json$",
                    "message": {
                        "en": "The file name should follow the pattern \"{{name}}--{{unix}}.json\", where {{name}} contains alphanumerics and hyphens, and {{unix}} is a Unix timestamp."
                    }
                },
                "splitters": {
                    "description": {
                        "en": "Matches strings containing either \"__\" without consecutive occurrences or \"--\" without consecutive occurrences"
                    },
                    "regex": "^(__(?!--)|--(?!__))*$",
                    "message": {
                        "en": "The string can contain either \"__\" or \"--\" without consecutive occurrences."
                    }
                },
                "folderName": {
                    "description": {
                        "en": "The first character must be from 'a' to 'z', followed by a combination of 'a' to 'z', '0' to '9' and '-' or '_' . The last character must be a '/'."
                    },
                    "regex": "^[a-z](?!.*[-_]{2})[a-z0-9-_]*[a-z0-9]\\/$",
                    "message": {
                        "en": "The folder name must start with a lowercase letter, followed by letters (a-z), numbers (0-9), hyphens, or underscores. It must end with a '/'."
                    }
                },
                "folderNameInvisible": {
                    "description": {
                        "en": "start with a \".\", followed by a lowercase letter, and may contain alphanumeric characters, hyphens, and underscores, ending with an alphanumeric character and a \"/\""
                    },
                    "regex": "^[.][a-z](?!.*[-_]{2})[a-z0-9-_]*[a-z0-9]\\/$",
                    "message": {
                        "en": "The folder name must start with a \".\" and a lowercase letter, followed by letters (a-z), numbers (0-9), hyphens, or underscores. It must end with a '/'."
                    }
                },
                "networkName": {
                    "description": {
                        "en": "Currently only \"berkeley\" is valid"
                    },
                    "regex": "^(berkeley|none)$",
                    "message": {
                        "en": "The network name can only be \"berkeley\" or \"none\"."
                    }
                },
                "language": {
                    "description": {
                        "en": "Currently only \"en\" is valid"
                    },
                    "regex": "^(en|none)$",
                    "message": {
                        "en": "The language can only be \"en\" or \"none\"."
                    }
                },
                "urlHttps": {
                    "description": {
                        "en": "URLs with optional \"http://\" or \"https://\", followed by a domain name, a top-level domain (TLD) of at least two letters, and an optional path segment at the end"
                    },
                    "regex": "(https?:\\/\\/)?([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})(\\/\\S*)?$",
                    "message": {
                        "en": "Please enter a valid URL with optional \"http://\" or \"https://\" and a valid domain name followed by a top-level domain (TLD) of at least two letters."
                    }
                },
                "gistTemplate": {
                    "description": {
                        "en": "Matches strings with two words separated by '::'"
                    },
                    "regex": "^(\w+)::(\w+)$",
                    "message": {
                        "en": "The input should consist of two words separated by '::'."
                    }
                },
                "plainTemplate": {
                    "description": {
                        "en": "Matches any sequence of characters, including newlines, in a single line"
                    },
                    "regex": "[\s\S]*",
                    "message": {
                        "en": "The input should contain any sequence of characters, including whitespace and non-whitespace characters, and can be of any length, including an empty string"
                    }
                },
                "typescriptFileName": {
                    "description": {
                        "en": "Matches file names starting with a lowercase letter, potentially containing multiple occurrences of alphanumerics, hyphens, or underscores, with an optional period, and ending with the extension \".ts\"."
                    },
                    "regex": "^[a-z](?:[a-z0-9_-]*\\.?)+\\.ts",
                    "message": {
                        "en": "The file name must start with a lowercase letter and can include multiple occurrences of alphanumerics, hyphens, or underscores, with an optional period before ending with the extension \".ts\"."
                    }
                },
                "typescriptFileNamePlaceholder": {
                    "description": {
                        "en": "match strings starting with a lowercase letter, potentially containing multiple occurrences of regular characters or \"{{a-z}}\" input followed by an optional period, and ending with the extension.ts"
                    },
                    "regex": "^[a-z](?:([a-z0-9_-]*|\{\{[a-z]+\}\})*\.?)+\.ts",
                    "message": {
                        "en": "The filename must start with a lowercase letter and can include multiple occurrences of regular characters or \"{{a-z}}\" input, with an optional period before ending with the extension.ts"
                    }
                }
            },
            "integer": {
                "positiveNumber": {
                    "description": {
                        "en": "This regular expression matches any positive integer with one or more digits."
                    },
                    "regex": "^[1-9]\\d*$",
                    "message": {
                        "en": "Please enter a positive integer greater than zero."
                    }
                }
            }
        }
    }
}