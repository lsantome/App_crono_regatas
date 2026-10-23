const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const leer = (...p) => fs.readFileSync(path.join(raiz, ...p), 'utf8');
const existe = (...p) => fs.existsSync(path.join(raiz, ...p));
function dimsPng(rel) {
  const b = fs.readFileSync(path.join(raiz, rel));
  if (b.slice(1, 4).toString() !== 'PNG') throw new Error(rel + ' no es PNG');
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}
module.exports = { raiz, leer, existe, dimsPng };
