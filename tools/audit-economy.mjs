import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const memory = new Map();
const context = vm.createContext({
  console,
  Math,
  Date,
  setTimeout,
  clearTimeout,
  localStorage: {
    getItem:key => memory.get(key) ?? null,
    setItem:(key,value) => memory.set(key,String(value))
  },
  document: { addEventListener(){}, dispatchEvent(){} },
  CustomEvent: class { constructor(type,options){ this.type=type; this.detail=options?.detail; } }
});

const source = fs.readFileSync(path.resolve(import.meta.dirname,'../assets/js/progress.js'),'utf8');
vm.runInContext(source,context);

function evaluate(expression){ return vm.runInContext(expression,context); }
function expect(actual,expected,label){
  if(actual !== expected) throw new Error(`${label}: attendu ${expected}, reçu ${actual}`);
}

expect(evaluate('crownBalance()'),120,'solde initial');
evaluate('addXP(40)');
expect(evaluate('crownBalance()'),120,'XP sans création cachée de couronnes');
evaluate('addCrowns(10,"test")');
expect(evaluate('crownBalance()'),130,'gain explicite');
evaluate("bumpDailyCounter('puzzlesSolvedToday'); bumpDailyCounter('puzzlesSolvedToday'); bumpDailyCounter('puzzlesSolvedToday')");
expect(evaluate('crownBalance()'),165,'récompense quotidienne unique');
evaluate("bumpDailyCounter('puzzlesSolvedToday')");
expect(evaluate('crownBalance()'),165,'défi quotidien non duplicable');
evaluate("bumpDailyCounter('gamesPlayedToday')");
expect(evaluate('crownBalance()'),185,'bonus de partie quotidien');
evaluate("bumpDailyCounter('gamesPlayedToday')");
expect(evaluate('crownBalance()'),185,'bonus de partie non duplicable');
expect(evaluate("purchaseStoreItem('board-amethyst').ok"),true,'achat autorisé');
expect(evaluate('crownBalance()'),5,'débit exact de la boutique');

console.log('Économie validée : XP séparé, récompenses uniques et achat débité exactement.');
