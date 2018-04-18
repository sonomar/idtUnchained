const EC = require('elliptic').ec;
const sha256 = require('sha256');
const RIPEMD160 = require('ripemd160');
const bs58 = require('bs58')

let ec = new EC('secp256k1');
let key = ec.genKeyPair();

let a = key.getPrivate('hex');
let b = key.getPublic('hex');

let c = sha256(Buffer.from(b, 'hex'));

let d = new RIPEMD160().update(Buffer.from(c, 'hex')).digest('hex');

// version bytes: livenet '00', testnet '6f'
let e = `6f${d}`;

let f = sha256(Buffer.from(e, 'hex'));
let g = sha256(Buffer.from(f, 'hex'));
let h = g.substring(0, 8);

let i = `${e}${h}`;

let j = bs58.encode(Buffer.from(i, 'hex'));

// version bytes: livenet '80', testnet 'ef'
let k = `ef${a}`;

let l = sha256(Buffer.from(k, 'hex'));

let m = sha256(Buffer.from(l, 'hex'));

let n = m.substring(0, 8);

let o = `${k}${n}`;

let p = bs58.encode(Buffer.from(o, 'hex'));

let q = key.getPublic(true, 'hex');

console.log('pub:', b);
console.log('pub compressed:', q);
console.log('priv:', a);
console.log('priv WIF:', p);
console.log('addr:', j);