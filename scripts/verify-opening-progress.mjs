import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const stored = JSON.stringify({ mastered:{}, attempts:{ italienne:2 } });
const context = {
  localStorage:{ getItem:()=>stored, setItem:()=>{} },
  document:{ addEventListener:()=>{}, dispatchEvent:()=>{}, documentElement:{ dataset:{} } },
  CustomEvent:class {},
  console
};
vm.createContext(context);
vm.runInContext(readFileSync(new URL('../assets/js/progress.js', import.meta.url), 'utf8'), context);

const italian = vm.runInContext("isOpeningLessonCompleted('italienne')", context);
const next = vm.runInContext("isOpeningLessonCompleted('quatre_cavaliers')", context);
if(!italian || next) throw new Error('La migration de progression des ouvertures est invalide.');
console.log('Progression rétroactive des ouvertures : OK');
