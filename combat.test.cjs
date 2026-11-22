const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const element = {getContext:()=>({}),style:{},classList:{add(){},remove(){},toggle(){}}};
const context = vm.createContext({document:{querySelector:()=>element,addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},localStorage:{getItem(){return null;},setItem(){}},console});
vm.runInContext(fs.readFileSync('game.js','utf8'),context);
function check(name, code){vm.runInContext(code,context);console.log('PASS '+name);}
context.assert=assert;
const setup="reset();state='playing';keys.clear();player.x=400;player.y=300;player.dx=1;player.dy=0;enemies=[];";
check('combo damage, cooldown and one hit per expanding burst',setup+`
const target={x:470,y:300,r:0,hp:1000,def:0};enemies=[target];
attack('z');assert.equal(target.hp,980);assert.equal(player.z,.2);
attack('z');assert.equal(target.hp,980);
player.z=0;attack('z');assert.equal(target.hp,956);assert.equal(player.z,.3);
player.z=0;attack('z');assert.equal(target.hp,956);assert.equal(player.z,.5);
updateEffects(.1);assert.equal(target.hp,926);updateEffects(.4);assert.equal(target.hp,926);assert.equal(player.combo,0);
`);
check('first strike narrower, second keeps original range',setup+`
const far={x:495,y:300,r:0,hp:100,def:0},side={x:420,y:350,r:0,hp:100,def:0};enemies=[far,side];
attack('z');assert.equal(far.hp,100);assert.equal(side.hp,100);
player.z=0;attack('z');assert.equal(far.hp,76);assert.equal(side.hp,76);
`);
check('burst grows to radius 80 at fixed forward center, including rear edge',setup+`
const edge={x:550,y:300,r:0,hp:100,def:0},rear={x:390,y:300,r:0,hp:100,def:0},outside={x:551,y:300,r:0,hp:100,def:0};enemies=[edge,rear,outside];
player.combo=2;attack('z');player.x=700;player.dy=1;player.dx=0;
updateEffects(.25);assert.equal(edge.hp,100);assert.equal(rear.hp,100);
updateEffects(.25);assert.equal(edge.hp,70);assert.equal(rear.hp,70);assert.equal(outside.hp,100);
`);
check('movement lock, resume, combo timeout and pause',setup+`
spawn();keys.add('ArrowRight');keys.add('z');const startX=player.x;update(.02);assert.equal(player.x,startX);
keys.delete('z');update(.04);update(.04);assert.equal(player.x,startX);update(.04);assert.ok(player.x>startX);
state='paused';const timer=player.comboTimer,x=player.x;update(.5);assert.equal(player.comboTimer,timer);assert.equal(player.x,x);
state='playing';keys.clear();update(1.1);assert.equal(player.combo,0);
for(const skill of ['x','c']){player.moveLock=0;attack(skill);assert.equal(player.moveLock,.1);}
`);
check('contact damage, push, invulnerability, overlap and bounds',setup+`
enemies=[{x:430,y:300,r:17,hp:100,atk:28}];contactEnemies();assert.equal(player.hp,312);assert.equal(player.x,379);
player.x=400;contactEnemies();assert.equal(player.hp,312);assert.equal(player.x,400);
player.inv=0;enemies[0].x=400;contactEnemies();assert.ok(Number.isFinite(player.x));assert.equal(player.hp,304);
player.x=45;player.inv=0;enemies[0].x=46;contactEnemies();assert.equal(player.x,45);
enemies[0].hp=0;player.inv=0;const hp=player.hp;contactEnemies();assert.equal(player.hp,hp);
`);
check('wave transition, boss phase, victory, contact death and timeout',setup+`
wave=1;update(.01);assert.equal(wave,2);assert.equal(enemies.length,2);
enemies=[];update(.01);assert.equal(wave,3);enemies[0].hp=enemies[0].maxHp*.3;update(.01);assert.equal(enemies[0].phase,true);
enemies=[];update(.01);assert.equal(state,'won');
reset();state='playing';player.hp=1;enemies[0].x=player.x;enemies[0].y=player.y;update(.01);assert.equal(state,'lost');
reset();state='playing';time=179.99;update(.02);assert.equal(state,'lost');
`);

check('score weights, bounds and failure bonuses',setup+`
killCounts=[3,2,1];time=90;player.hp=256;
assert.equal(calculateScore(true).total,6700);
assert.equal(calculateScore(true).monsterScore,1000);
assert.equal(calculateScore(false).total,1000);
time=0;player.hp=320;assert.equal(calculateScore(true).total,10000);
time=180;player.hp=0;assert.equal(calculateScore(true).total,1000);
time=200;player.hp=-1;assert.equal(calculateScore(true).total,1000);
`);
check('kill rewards counted once, all waves and result breakdown',`
reset();state='playing';
for(let stage=1;stage<=3;stage++){
  for(const enemy of enemies){damage(enemy,10000);damage(enemy,10000);}
  update(.01);
}
assert.equal(state,'won');assert.equal(kills,6);
assert.equal(killCounts.join(','),'3,2,1');assert.equal(calculateScore(true).monsterScore,1000);
assert.ok($('#overlay').innerHTML.includes('총점'));assert.ok(!$('#overlay').innerHTML.includes('score-monsters'));
reset();state='playing';damage(enemies[0],10000);player.hp=1;hurt(100);
assert.equal(state,'lost');assert.equal(calculateScore(false).total,100);
assert.ok($('#overlay').innerHTML.includes('클리어 시에만'));
const frozen=kills;damage(enemies[1],10000);assert.equal(kills,frozen);
reset();assert.equal(kills,0);assert.equal(killCounts.join(','),'0,0,0');
state='playing';time=179.99;update(.02);assert.equal(state,'lost');assert.equal(calculateScore(false).total,0);
`);
