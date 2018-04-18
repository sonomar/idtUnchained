const EC = require('elliptic').ec;
const createKeccakHash = require('keccak')

let ec = new EC('secp256k1');
let key = ec.genKeyPair();

let a = key.getPrivate('hex');
let b = key.getPublic('hex');

let c = b.substring(2);

let d = createKeccakHash('keccak256').update(Buffer.from(c, 'hex')).digest('hex');

let e = `0x${d.substr(-40)}`;

console.log('priv:', a);
console.log('pub:', b);
console.log('addr:', e);