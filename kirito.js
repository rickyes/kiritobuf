'use strict';

const fs = require('fs');
const parser = Symbol.for('kirito#parser');
const tokenizer = Symbol.for('kirito#tokenizer');
const transformer = Symbol.for('kirito#transformer');
const TYPE = {
  KEYWORD: 'keyword',
  VARIABLE: 'variable',
  SYMBOL: 'symbol',
  INDEX: 'index'
};
const EXP = {
  VARIABLE: 'Identifier',
  STRUCT_DECLARATIONL: 'StructDeclaration',
  VAR_DECLARATION: 'VariableDeclaration',
  TYPE: 'DataType',
};

class Kirito {

  constructor() {
  }

  load (path) {
    const ast = this.parse(path);
    return this[transformer](ast);
  }

  parse(path) {
    const proto = fs.readFileSync(path, 'utf8');
    const tokens = this[tokenizer](proto);
    const ast = this[parser](tokens);
    return ast;
  }

  // 词法分析
  [tokenizer] (input) {
    const KEYWORD = ['service', 'struct', 'method'];
    const SYMBOL = ['{', '}', '(', ')', '=', '@', ';'];
    const WHITESPACE = /\s/;
    const LETTERS = /^[a-z]$/i;
    const NUMBER = /\d/;

    const source = input.split('\n');
    const tokens = [];
    source.some(line => {
      let current = 0;
      let isContinue = false;
      while (current < line.length) {
        let char = line[current];

        // 匹配任何空字符
        if (WHITESPACE.test(char)) {
          current++;
          continue;
        }

        // 忽略注释
        if (char === '#') {
          isContinue = true;
          break;
        }

        // 匹配字符(变量/保留字)、字符加数字(参数类型)
        if (LETTERS.test(char)) {
          let value = '';
          while (LETTERS.test(char) || NUMBER.test(char)) {
            value += char;
            char = line[++current];
          }
          if (KEYWORD.indexOf(value) !== -1) {
            // 匹配保留关键字
            tokens.push({
              type: TYPE.KEYWORD,
              value: value
            });
          } else {
            // 匹配变量名
            tokens.push({
              type: TYPE.VARIABLE,
              value: value
            });
          }
          continue;
        }

        // 匹配符号 { } ( ) = @
        if (SYMBOL.indexOf(char) !== -1) {
          tokens.push({
            type: TYPE.SYMBOL,
            value: char
          });
          if (char === '@') {
            char = line[++current];
            // 匹配参数位置
            if (NUMBER.test(char)) {
              let index = '';
              while (NUMBER.test(char)) {
                index += char;
                char = line[++current];
              }
              tokens.push({
                type: TYPE.INDEX,
                value: index
              });
            }
            continue;
          }
          current++;
          continue;
        }
        current++;
      }

      if (isContinue) return false;
    });
    return tokens;
  }


  // 语法分析
  [parser] (tokens) {
    const ast = {
      type: 'Program',
      body: []
    };
    let current = 0;

    function walk() {
      let token = tokens[current];

      // 检查变量
      if (token.type === TYPE.VARIABLE) {
        current++;
        return {
          type: EXP.VARIABLE,
          struct: tokens[current].value === '=' ? false : true,
          value: token.value
        };
      }

      // 检查符号
      if (token.type === TYPE.SYMBOL) {
        // 检查@
        if (token.value === '@') {
          token = tokens[++current];
          let node = {
            type: EXP.VAR_DECLARATION,
            name: '@',
            value: token.value,
            params: []
          };

          token = tokens[++current];
          while (token.value !== ';') {
            node.params.push(walk());
            token = tokens[current];
          }
          current++;
          return node;
        }

        // 检查=
        if (token.value === '=') {
          token = tokens[++current];
          current++;
          return {
            type: EXP.TYPE,
            value: token.value
          };
        }

        current++;
      }

      // 检查保留字
      if (token.type === TYPE.KEYWORD) {
        // 检查service
        if (['struct', 'service'].indexOf(token.value) !== -1) {
          let keywordName = token.value;
          token = tokens[++current];
          let node = {
            type: EXP.STRUCT_DECLARATIONL,
            name: keywordName,
            value: token.value,
            params: []
          };

          token = tokens[++current];
          if (token.type === TYPE.SYMBOL && token.value === '{') {
            token = tokens[++current];
            while (token.value !== '}') {
              node.params.push(walk());
              token = tokens[current];
            }
            current++;
          }
          return node;
        }

        if (token.value === 'method') {
          // 检查method
          token = tokens[++current];
          let node = {
            type: EXP.STRUCT_DECLARATIONL,
            name: 'method',
            value: token.value,
            params: []
          };

          token = tokens[++current];
          if (token.type === TYPE.SYMBOL && token.value === '(') {
            token = tokens[++current];
            while (token.value !== ')') {
              node.params.push(walk());
              token = tokens[current];
            }
            current++;
          }
          return node;

        }
      }

      throw new TypeError(token.type);
    }

    while (current < tokens.length) {
      ast.body.push(walk());
    }

    return ast;
  }

  // 转换器
  [transformer] (ast) {
    const services = {};
    const structs = {};

    function traverseArray(array, parent) {
      array.some((child) => {
        traverseNode(child, parent);
      });
    }

    function traverseNode (node, parent) {

      switch (node.type) {
      case 'Program':
        traverseArray(node.body, parent);
        break;
      case 'StructDeclaration':
        if (node.name === 'service') {
          parent[node.value] = {};
          traverseArray(node.params, parent[node.value]);
        } else if (node.name === 'method') {
          parent[node.value] = function () {};
          parent[node.value].param = {};
          traverseArray(node.params, parent[node.value].param);
        } else if (node.name === 'struct') {
          structs[node.value] = {};
          traverseArray(node.params, structs[node.value]);
        }
        break;
      case 'Identifier':
        parent[node.value] = {};
        break;
      case 'VariableDeclaration':
        traverseArray(node.params, parent);
        break;
      case 'DataType':
        parent[Object.keys(parent).pop()] = node.value;
        break;
      default:
        throw new TypeError(node.type);
      }
    }

    traverseNode(ast, services);

    const serviceKeys = Object.getOwnPropertyNames(services);
    serviceKeys.some(service => {
      const methodKeys = Object.getOwnPropertyNames(services[service]);
      methodKeys.some(method => {
        Object.keys(services[service][method].param).some(p => {
          if (structs[p] !== null) {
            services[service][method].param[p] = structs[p];
            delete structs[p];
          }
        });
      });
    });

    return services;
  }



}

module.exports = Kirito;