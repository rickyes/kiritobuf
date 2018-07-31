'use strict';

const test = require('ava');
const path = require('path');
const Kirito = require('../kirito');
const kiritoProto = '../kirito/test.kirito';

const k = new Kirito();

test('transformer', t => {
  k.load(path.join(__dirname, kiritoProto));
  t.pass();
});