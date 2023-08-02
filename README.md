# Easy Mina

Made for zk beginners and busy beavers 🦫

easy mina is a Node.js module that helps you create a bare-bones environment with minimal opinionated pre-configuration.

Helps you set up:  
:heavy_check_mark: Environment variables and folders  
:heavy_check_mark: Your smart contract workspace with a small example  
:heavy_check_mark: TypeScript config file  
:heavy_check_mark: Security checks to minimize the risk of security exploits.  


## Quickstart

node
```
npm init -y
npm i easymina
```

index.mjs

```
import { EasyMina } from 'easymina'

const easyMina = new EasyMina()
await easyMina.setEnvironment( {
    'projectName': 'hello-world'
} )
```


## Table of Contents

1. [Examples](#examples)<br>
2. [Documentation](#documentation)
3. [Contributing](#contributing)<br>
4. [Limitations](#limitations)<br>
5. [Credits](#Credits)<br>
6.  [License](#license)<br>
7.  [Code of Conduct](#code-of-conduct)<br>
8.  [Support my Work](#support-my-work)<br>

## Documentation

Please visit [https//easymina.github.io](https//easymina.github.io)


## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/a6b8/easymina. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [code of conduct](https://github.com/a6b8/easy-mina/CODE_OF_CONDUCT.md).

## Limitations

- Currently in Alpha Stage

## Credits

- This project was supported by the [zkIgnite](https://zkignite.minaprotocol.com) grant program.

## Licence

The module is available as open source under the terms of the [Apache 2.0](https://github.com/a6b8/easy-mina/LICENCE).

## Code of Conduct

Everyone interacting in the AsciiToSvg project's codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/a6b8/easy-mina/CODE_OF_CONDUCT.md).