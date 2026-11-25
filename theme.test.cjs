const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const elements=new Map(),calls=[];
const context2d=new Proxy({}, {get:(o,k)=>k in o?o[k]:(...args)=>{
  for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`${String(k)} invalid coordinate`);
  calls.push(k);if(k==='createRadialGradient')return {addColorStop(){}};
},set:(o,k,v)=>(o[k]=v,true)});
const element=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'<button id="start">입장</button>',getContext:()=>context2d,style:{},classList:{add(){},remove(){},toggle(){}}});return elements.get(s);};
const sandbox=vm.createContext({assert,Date,Intl,console,performance:{now:()=>100},document:{querySelector:element,documentElement:{style:{setProperty(){}}},addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},localStorage:{getItem(){},setItem(){}}});
vm.runInContext(fs.readFileSync('theme-art.js','utf8')+'\n'+fs.readFileSync('game.js','utf8'),sandbox);
vm.runInContext(`
assert.equal(DUNGEON_THEMES.length,7);
assert.equal(new Set(DUNGEON_THEMES.map(t=>t.id)).size,7);
const schema=Object.keys(DUNGEON_THEMES[0]).sort();
for(const t of DUNGEON_THEMES){assert.deepEqual(Object.keys(t).sort(),schema);for(const key of ['floor','enemy','names','skills'])assert.equal(t[key].length,3);assert.equal(t.hero.length,2);}
assert.equal(dailyThemeIndex(new Date('2026-11-29T14:59:59Z')),6);
assert.equal(dailyThemeIndex(new Date('2026-11-29T15:00:00Z')),0);
for(let i=0;i<7;i++)assert.equal(dailyThemeIndex(new Date(Date.UTC(2026,10,23+i))),i);
console.log('PASS seven equal resource schemas and Korean midnight/week rollover');
const configBefore=JSON.stringify(CONFIG),scores=[];
for(let i=0;i<7;i++){
  $('#themeSelect').value=String(i);$('#themeSelect').onchange();
  assert.equal(themeIndex,i);assert.equal(state,'ready');
  assert.equal($('.heading h1').textContent,theme.name);
  start();assert.equal($('#themeSelect').disabled,true);
  const current=themeIndex;$('#themeSelect').onchange();assert.equal(themeIndex,current);
  draw();player.buff=8;player.inv=.2;
  for(let stage=1;stage<=3;stage++){
    for(const enemy of enemies){enemy.action={kind:'melee',x:400,y:300};draw();enemy.action.kind='skill';draw();enemy.action.kind='ultimate';enemy.phase=true;draw();damage(enemy,10000);}
    update(.01);
  }
  assert.equal(state,'won');assert.equal($('#themeSelect').disabled,false);scores.push(calculateScore(true).total);
  shots=[{x:100,y:100,r:8,friendly:true},{x:200,y:100,r:8}];
  effects=['slash','burst','ultimate','danger'].map(kind=>({kind,x:300,y:300,r:80,t:.3,max:.6,dx:1,dy:0,angle:1}));draw();
  $('#themeSelect').onchange();assert.equal(state,'ready');assert.equal($('#overlay').innerHTML,'<button id="start">입장</button>');
}
assert.equal(new Set(scores).size,1);assert.equal(JSON.stringify(CONFIG),configBefore);
console.log('PASS seven theme render paths, UI selection, battle locking, results and unchanged combat config');
`,sandbox);
assert.ok(calls.includes('quadraticCurveTo'));
console.log('Canvas calls validated (mock context; not browser visual QA).');
