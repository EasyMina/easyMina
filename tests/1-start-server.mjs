import { EasyMina } from './../src/EasyMina.mjs'

const easymina = new EasyMina( {
    'networkName': 'berkeley'
} )
easymina.startServer( { 
    'projectName': 'hello-world' 
} )