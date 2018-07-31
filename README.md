# kiritobuf


Interface Description Language | Kirito

[![Travis](https://img.shields.io/travis/rickyes/kiritobuf.svg?style=for-the-badge)](https://travis-ci.org/rickyes/kiritobuf)
[![Node Version](https://img.shields.io/badge/node-%3E=9.0.0-brightgreen.svg?longCache=true&style=for-the-badge)](https://www.npmjs.com/package/kiritobuf)
[![npm](https://img.shields.io/npm/v/kiritobuf.svg?style=for-the-badge)](https://www.npmjs.com/package/kiritobuf)

## Install
``` shell
$ npm i kiritobuf --save
```

## Get Started
1. Define the `kirito` suffix file
```shell
# test

service testService {
  method ping (reqMsg, resMsg)
}

struct reqMsg {
  @1 age = Int16;
  @2 name = Text;
}

struct resMsg {
  @1 age = Int16;
  @2 name = Text;
}
```
2. Generate `AST`
``` js
'use strict';

const path = require('path');
const kirito = require('kiritobuf');
const kiritoProto = './test.kirito';

const k = new kirito();

const AST = k.parse(path.join(__dirname, kiritoProto));

console.log(JSON.stringify(AST, null, 2));
```
3. AST struct
``` json
{
  "type": "Program",
  "body": [
    {
      "type": "StructDeclaration",
      "name": "service",
      "value": "testService",
      "params": [
        {
          "type": "StructDeclaration",
          "name": "method",
          "value": "ping",
          "params": [
            {
              "type": "Identifier",
              "value": "reqMsg"
            },
            {
              "type": "Identifier",
              "value": "resMsg"
            }
          ]
        }
      ]
    },
    {
      "type": "StructDeclaration",
      "name": "struct",
      "value": "reqMsg",
      "params": [
        {
          "type": "VariableDeclaration",
          "name": "@",
          "value": "1",
          "params": [
            {
              "type": "Identifier",
              "value": "age"
            },
            {
              "type": "DataType",
              "value": "Int16"
            }
          ]
        },
        {
          "type": "VariableDeclaration",
          "name": "@",
          "value": "2",
          "params": [
            {
              "type": "Identifier",
              "value": "name"
            },
            {
              "type": "DataType",
              "value": "Text"
            }
          ]
        }
      ]
    },
    {
      "type": "StructDeclaration",
      "name": "struct",
      "value": "resMsg",
      "params": [
        {
          "type": "VariableDeclaration",
          "name": "@",
          "value": "1",
          "params": [
            {
              "type": "Identifier",
              "value": "age"
            },
            {
              "type": "DataType",
              "value": "Int16"
            }
          ]
        },
        {
          "type": "VariableDeclaration",
          "name": "@",
          "value": "2",
          "params": [
            {
              "type": "Identifier",
              "value": "name"
            },
            {
              "type": "DataType",
              "value": "Text"
            }
          ]
        }
      ]
    }
  ]
}
```

## Author
Polix © [Ricky 泽阳](https://github.com/rickyes), Released under the MIT License. 
