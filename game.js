'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),W=1120,H=620;
const $=s=>document.querySelector(s),keys=new Set();
const CONFIG={hero:{hp:320,atk:24,def:6,speed:235},monsters:[{hp:140,atk:15,def:3,speed:88,r:17},{hp:520,atk:23,def:6,speed:78,r:23},{hp:2200,atk:28,def:9,speed:62,r:34}],limit:180,combo:[{range:85,angle:1.1,mult:.85,cooldown:.2},{range:100,angle:Math.acos(.25),mult:1,cooldown:.3},{range:80,offset:70,mult:1.25,cooldown:.5}],attackLock:.1,comboReset:1,contactPush:18,score:{time:5000,hp:4000,monsters:[100,200,300]}};
let player,enemies=[],shots=[],effects=[],texts=[],wave=0,time=0,state='ready',last=0,notice=0,kills=0,killCounts=[0,0,0],sound=false,audioCtx;
function reset(){player={...CONFIG.hero,maxHp:320,x:W/2,y:H*.72,dx:0,dy:-1,r:16,z:0,xcd:0,c:0,buff:0,inv:0,combo:0,comboTimer:0,moveLock:0};enemies=[];shots=[];effects=[];texts=[];wave=0;time=0;kills=0;killCounts=[0,0,0];spawn();}
function spawn(){wave++;const positions=wave===1?[[330,160],[560,130],[790,160]]:wave===2?[[380,170],[740,170]]:[[560,180]];enemies=positions.map(([x,y],i)=>({...CONFIG.monsters[wave-1],maxHp:CONFIG.monsters[wave-1].hp,x,y,type:wave-1,id:i,cd:1.2+i*.5,skill:3+i,ult:5,wind:0,action:null,phase:false,flash:0}));announce(['','WAVE 01 · 왕의 척후병','WAVE 02 · 철갑 근위대','WAVE 03 · 타락한 왕'][wave]);}
function announce(t){$('#announcement').textContent=t;notice=3;}
function tone(freq,duration=.08){if(!sound)return;try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.035,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration);}catch{}}
function damage(e,amount){if(state!=='playing'||e.hp<=0)return;const n=Math.max(1,Math.round(amount-e.def));e.hp-=n;if(e.hp<=0){kills++;if(Number.isInteger(e.type)&&e.type>=0&&e.type<3)killCounts[e.type]++;}e.flash=.12;texts.push({x:e.x,y:e.y-e.r,t:.75,text:String(n),color:'#ffe4a9'});tone(180+Math.random()*80);}
function hurt(amount){if(state!=='playing'||player.inv>0)return;const n=Math.max(1,Math.round(amount-player.def));player.hp-=n;player.inv=.65;texts.push({x:player.x,y:player.y-25,t:.8,text:'−'+n,color:'#ff8383'});tone(90,.15);if(player.hp<=0){player.hp=0;finish(false,'용사는 잠시 쓰러졌다.');}}
function attack(kind){
const atk=player.atk*(player.buff>0?1.3:1);
if(kind==='z'&&player.z<=0){
  const step=player.combo,hit=CONFIG.combo[step];
  player.z=hit.cooldown;player.combo=(step+1)%3;player.comboTimer=CONFIG.comboReset;player.moveLock=CONFIG.attackLock;
  if(step===2){
    effects.push({kind:'burst',x:player.x+player.dx*hit.offset,y:player.y+player.dy*hit.offset,r:hit.range,t:.5,max:.5,atk:atk*hit.mult,hit:new Set()});
  }else{
    effects.push({kind:'slash',x:player.x,y:player.y,dx:player.dx,dy:player.dy,r:hit.range,angle:hit.angle,t:.18,max:.18});
    enemies.forEach(e=>{const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy);if(e.hp>0&&d<hit.range+e.r&&(d<30||(dx*player.dx+dy*player.dy)/d>Math.cos(hit.angle)))damage(e,atk*hit.mult);});
  }
  tone(380+step*80);
}
if(kind==='x'&&player.xcd<=0){player.moveLock=CONFIG.attackLock;player.xcd=5;shots.push({x:player.x,y:player.y,vx:player.dx*560,vy:player.dy*560,r:10,t:2,friendly:true,atk:atk*2.5,hit:new Set()});tone(650,.15);}
if(kind==='c'&&player.c<=0){player.moveLock=CONFIG.attackLock;player.c=35;enemies.forEach(e=>{if(e.hp>0&&Math.hypot(e.x-player.x,e.y-player.y)<250+e.r)damage(e,atk*12);});effects.push({kind:'ultimate',x:player.x,y:player.y,r:250,t:.8,max:.8});player.buff=8;announce('천상의 심판 · 8초간 공격력 +30%');tone(220,.5);}
}
function contactEnemies(){
  for(const e of enemies){
    if(state!=='playing')break;
    if(e.hp<=0)continue;
    const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy),min=player.r+e.r;
    if(d>min||player.inv>0)continue;
    const nx=d>0?dx/d:-player.dx,ny=d>0?dy/d:-player.dy;
    hurt(e.atk*.5);
    const push=min-d+CONFIG.contactPush;
    player.x=Math.max(45,Math.min(W-45,player.x+nx*push));
    player.y=Math.max(50,Math.min(H-40,player.y+ny*push));
  }
}
function updateEffects(dt){
  for(const e of effects){
    e.t=Math.max(0,e.t-dt);
    if(e.kind==='burst'){
      const radius=e.r*(1-e.t/e.max);
      for(const target of enemies){
        if(target.hp>0&&!e.hit.has(target)&&Math.hypot(target.x-e.x,target.y-e.y)<=radius+target.r){damage(target,e.atk);e.hit.add(target);}
      }
    }
  }
  effects=effects.filter(e=>e.t>0);
}
function wind(e,kind){e.action={kind,x:player.x,y:player.y};e.wind=kind==='ultimate'?1.5:kind==='skill'?.9:.55;}
function resolve(e){const a=e.action;e.action=null;if(a.kind==='melee'){if(Math.hypot(player.x-e.x,player.y-e.y)<e.r+48)hurt(e.atk);}else if(a.kind==='skill'){const angle=Math.atan2(a.y-e.y,a.x-e.x),count=e.type===2?5:3;for(let i=0;i<count;i++){const v=angle+(i-(count-1)/2)*.2;shots.push({x:e.x,y:e.y,vx:Math.cos(v)*190,vy:Math.sin(v)*190,r:8,t:5,atk:e.atk*1.3});}}else{effects.push({kind:'danger',x:a.x,y:a.y,r:155,t:.6,max:.6});if(Math.hypot(player.x-a.x,player.y-a.y)<155+player.r)hurt(e.atk*2.5);for(let i=0;i<12;i++){const v=i*Math.PI/6;shots.push({x:a.x,y:a.y,vx:Math.cos(v)*140,vy:Math.sin(v)*140,r:7,t:3,atk:e.atk});}}}
function update(dt){if(state!=='playing')return;time+=dt;if(time>=CONFIG.limit){finish(false,'던전의 문이 닫혔다.');return;}notice-=dt;if(notice<=0)$('#announcement').textContent='';for(const k of ['z','xcd','c','buff','inv','moveLock','comboTimer'])player[k]=Math.max(0,player[k]-dt);if(player.comboTimer<=0)player.combo=0;let dx=Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft')),dy=Number(keys.has('ArrowDown'))-Number(keys.has('ArrowUp'));if(dx||dy){const d=Math.hypot(dx,dy);dx/=d;dy/=d;player.dx=dx;player.dy=dy;}for(const k of ['z','x','c'])if(keys.has(k))attack(k);if((dx||dy)&&player.moveLock<=0){player.x=Math.max(45,Math.min(W-45,player.x+dx*player.speed*dt));player.y=Math.max(50,Math.min(H-40,player.y+dy*player.speed*dt));}
for(const e of enemies){if(e.hp<=0)continue;e.flash=Math.max(0,e.flash-dt);if(e.type===2&&!e.phase&&e.hp<=e.maxHp*.3){e.phase=true;e.atk*=1.3;e.speed*=1.2;announce('왕의 분노 · PHASE II');}if(e.wind>0){e.wind-=dt;if(e.wind<=0)resolve(e);continue;}e.cd-=dt;e.skill-=dt;e.ult-=dt;const x=player.x-e.x,y=player.y-e.y,d=Math.hypot(x,y);if(e.phase&&e.ult<=0){wind(e,'ultimate');e.ult=10;}else if(e.type>0&&e.skill<=0){wind(e,'skill');e.skill=e.phase?3.5:5;}else if(d<e.r+43&&e.cd<=0){wind(e,'melee');e.cd=e.type===0?1.5:1.8;}else if(d>e.r+29){e.x+=x/d*e.speed*dt;e.y+=y/d*e.speed*dt;}}
for(let i=0;i<enemies.length;i++)for(let j=i+1;j<enemies.length;j++){const a=enemies[i],b=enemies[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r+6;if(d>0&&d<min){const p=(min-d)*.5;a.x-=dx/d*p;a.y-=dy/d*p;b.x+=dx/d*p;b.y+=dy/d*p;}}
contactEnemies();if(state!=='playing'){hud();return;}
for(const s of shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.t-=dt;if(s.friendly){enemies.forEach(e=>{if(e.hp>0&&!s.hit.has(e)&&Math.hypot(s.x-e.x,s.y-e.y)<s.r+e.r){damage(e,s.atk);s.hit.add(e);}});}else if(Math.hypot(s.x-player.x,s.y-player.y)<s.r+player.r){hurt(s.atk);s.t=0;}}
shots=shots.filter(s=>s.t>0&&s.x>-30&&s.x<W+30&&s.y>-30&&s.y<H+30);updateEffects(dt);texts.forEach(t=>{t.t-=dt;t.y-=dt*30;});texts=texts.filter(t=>t.t>0);enemies=enemies.filter(e=>e.hp>0);if(state==='playing'&&enemies.length===0){shots=shots.filter(s=>s.friendly);effects=effects.filter(e=>e.kind!=='burst');if(wave<3)spawn();else finish(true,'왕의 침묵, 용사의 승리.');}hud();}
function calculateScore(win){
  const remaining=Math.max(0,Math.min(CONFIG.limit,CONFIG.limit-time));
  const health=Math.max(0,Math.min(1,player.hp/player.maxHp));
  const timeScore=win?Math.round(CONFIG.score.time*remaining/CONFIG.limit):0;
  const hpScore=win?Math.round(CONFIG.score.hp*health):0;
  const monsterScore=killCounts.reduce((sum,count,i)=>sum+count*CONFIG.score.monsters[i],0);
  return {timeScore,hpScore,monsterScore,total:timeScore+hpScore+monsterScore,remaining,health};
}
function scoreMarkup(win){
  const score=calculateScore(win),number=n=>n.toLocaleString('ko-KR');
  return `<section class="score-card" aria-label="플레이 점수"><div class="score-total">총점 <strong>${number(score.total)}</strong><span>점</span></div><dl class="score-breakdown"><div><dt>남은 시간 <small>${score.remaining.toFixed(1)}초 / ${CONFIG.limit}초</small></dt><dd>${number(score.timeScore)}점</dd></div><div><dt>남은 체력 <small>${(score.health*100).toFixed(1)}%</small></dt><dd>${number(score.hpScore)}점</dd></div><div><dt>몬스터 처치</dt><dd>${number(score.monsterScore)}점</dd></div></dl>${win?'':'<p class="score-note">시간·체력 보너스는 클리어 시에만 지급됩니다.</p>'}</section>`;
}
function finish(win,title){if(state!=='playing')return;state=win?'won':'lost';let record='';if(win){try{const old=Number(localStorage.getItem('dungeon-best')||Infinity);if(time<old)localStorage.setItem('dungeon-best',String(time));record=' · 최고 '+format(Math.min(time,old));}catch{}}$('#overlay').classList.remove('hidden');$('#overlay').innerHTML=`<div class="crest result-crest">${win?'✦':'III'}</div><div class="eyebrow">${win?'DUNGEON CLEARED':'TRY AGAIN'}</div><h2>${title}</h2><p>${format(time)} 경과 · ${kills}마리 처치${record}<br>${win?'오늘의 시련을 완수했습니다.':'적의 붉은 예고 범위를 피하고 검기를 활용하세요.'}</p>${scoreMarkup(win)}<button id="start" class="primary">다시 도전 ↗</button>`;$('#start').onclick=start;hud();}
function format(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;}
function hud(){$('#timer').textContent=format(Math.max(0,180-time));$('#timer').style.color=time>150?'#ff8888':'';$('#hpText').textContent=`${Math.ceil(player.hp)} / ${player.maxHp}`;$('#hpFill').style.width=100*player.hp/player.maxHp+'%';$('#stats').textContent=`공격력 ${player.buff>0?'31 ↑ ('+Math.ceil(player.buff)+'초)':'24'} · 방어력 6`;for(let i=1;i<=3;i++)$('#w'+i).className=i===wave?'active':i<wave?'done':'';for(const [id,cd]of [['Z',player.z],['X',player.xcd],['C',player.c]]){$('#a'+id).classList.toggle('cooldown',cd>0);$('#a'+id+' em').textContent=cd>0?cd.toFixed(1)+'s':'';}}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#171d28';ctx.fillRect(0,0,W,H);for(let y=0;y<H;y+=52)for(let x=0;x<W;x+=64){ctx.fillStyle=(x/64+y/52)%2?'#1c2330':'#1a212d';ctx.fillRect(x+1,y+1,62,50);}ctx.strokeStyle='#414250';ctx.lineWidth=10;ctx.strokeRect(24,25,W-48,H-50);ctx.strokeStyle='#92744833';ctx.lineWidth=2;ctx.strokeRect(40,41,W-80,H-82);ctx.save();ctx.translate(W/2,H/2);ctx.strokeStyle='#bd9d6630';ctx.lineWidth=2;for(const r of [95,112,150]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}ctx.rotate(Math.PI/4);ctx.strokeRect(-78,-78,156,156);ctx.restore();for(const x of [65,W-65])for(const y of [85,H-85]){const g=ctx.createRadialGradient(x,y,2,x,y,75);g.addColorStop(0,'#ffc77b30');g.addColorStop(1,'#ffc77b00');ctx.fillStyle=g;ctx.fillRect(x-75,y-75,150,150);ctx.fillStyle='#e5b373';ctx.fillRect(x-3,y-7,6,14);}
for(const e of enemies){if(e.action){const a=e.action;if(a.kind==='ultimate')circle(a.x,a.y,155,'#f13c5b25','#ee647a');else if(a.kind==='melee')circle(e.x,e.y,e.r+48,'#f13c5b20','#d26a6a');else{ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(a.y-e.y,a.x-e.x));ctx.fillStyle='#ed685b20';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,250,-.5,.5);ctx.closePath();ctx.fill();ctx.restore();}}entity(e,false);}
for(const s of shots){circle(s.x,s.y,s.r+5,s.friendly?'#91deff20':'#ff6f6830');circle(s.x,s.y,s.r,s.friendly?'#b2edff':'#f8857a');}if(player)entity(player,true);for(const e of effects){ctx.save();ctx.globalAlpha=e.t/e.max;if(e.kind==='slash'){ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(e.dy,e.dx));ctx.beginPath();ctx.arc(0,0,e.r,-e.angle,e.angle);ctx.strokeStyle='#fff0bb';ctx.lineWidth=12;ctx.stroke();}else if(e.kind==='burst'){circle(e.x,e.y,e.r*(1-e.t/e.max),'#a8e5ff44','#d4f4ff');}else{circle(e.x,e.y,e.r,e.kind==='ultimate'?'#ffe6a144':'#ff476a55',e.kind==='ultimate'?'#ffe8a9':'#ff718b');circle(e.x,e.y,e.r*(1-e.t/e.max),'#ffffff10','#fff0c0');}ctx.restore();}for(const t of texts){ctx.globalAlpha=Math.min(1,t.t*2);ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillStyle=t.color;ctx.fillText(t.text,t.x,t.y);}ctx.globalAlpha=1;const boss=enemies.find(e=>e.type===2);if(boss){ctx.fillStyle='#10141de0';ctx.fillRect(315,16,490,43);ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillStyle=boss.phase?'#ff8e8e':'#d5bf9c';ctx.fillText('타락한 왕'+(boss.phase?' · PHASE II':''),560,32);ctx.fillStyle='#49313c';ctx.fillRect(330,42,460,5);ctx.fillStyle=boss.phase?'#ec6571':'#bd8092';ctx.fillRect(330,42,460*boss.hp/boss.maxHp,5);}}
function entity(e,hero){ctx.save();ctx.translate(e.x,e.y);if(hero&&e.inv>0)ctx.globalAlpha=.5+.5*Math.sin(performance.now()/40)**2;ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,e.r*.75,e.r*1.1,e.r*.5,0,0,Math.PI*2);ctx.fill();if(hero){if(e.buff>0)circle(0,0,25,'#edc96a10','#ebcc7660');ctx.fillStyle='#993f4b';ctx.beginPath();ctx.moveTo(-12,-8);ctx.lineTo(-19,22);ctx.lineTo(15,20);ctx.lineTo(12,-8);ctx.fill();ctx.fillStyle='#849aaf';ctx.fillRect(-12,-5,24,23);ctx.fillStyle='#d9b790';ctx.fillRect(-8,-20,16,17);ctx.fillStyle='#5b3929';ctx.fillRect(-9,-22,18,7);ctx.fillRect(-10,-18,5,8);ctx.fillStyle='#d6e0e9';ctx.fillRect(-14,-3,7,10);ctx.fillRect(7,-3,7,10);ctx.fillStyle='#475364';ctx.fillRect(-10,18,7,9);ctx.fillRect(4,18,7,9);ctx.rotate(Math.atan2(e.dy,e.dx));ctx.fillStyle='#e7d09b';ctx.fillRect(17,-8,5,16);ctx.fillStyle='#dbe9ee';ctx.fillRect(22,-3,24,6);ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(46,-3);ctx.lineTo(52,0);ctx.lineTo(46,3);ctx.fill();}else{const c=e.flash>0?'#fff0cf':e.type===0?'#779b8a':e.type===1?'#9b84b3':e.phase?'#c45b6d':'#a77f84';ctx.fillStyle=e.type===0?'#405a52':e.type===1?'#4c3e65':'#642e42';ctx.beginPath();ctx.moveTo(-e.r*.8,-e.r*.5);ctx.lineTo(-e.r, e.r);ctx.lineTo(e.r,e.r);ctx.lineTo(e.r*.8,-e.r*.5);ctx.fill();ctx.fillStyle=c;ctx.fillRect(-e.r*.7,-e.r*.7,e.r*1.4,e.r*1.3);ctx.fillStyle='#20212e';ctx.fillRect(-e.r*.5,-e.r*.4,e.r,.3*e.r);ctx.fillStyle='#ffbc91';ctx.fillRect(-e.r*.4,-e.r*.35,4,3);ctx.fillRect(e.r*.25,-e.r*.35,4,3);if(e.type>0){ctx.fillStyle=e.type===2?'#e8c387':'#b4b8ce';ctx.beginPath();ctx.moveTo(-e.r*.7,-e.r*.7);ctx.lineTo(-e.r*.8,-e.r*1.3);ctx.lineTo(0,-e.r);ctx.lineTo(e.r*.8,-e.r*1.3);ctx.lineTo(e.r*.7,-e.r*.7);ctx.fill();}ctx.fillStyle='#121723';ctx.fillRect(-e.r,e.r+9,e.r*2,4);ctx.fillStyle=c;ctx.fillRect(-e.r,e.r+9,e.r*2*Math.max(0,e.hp/e.maxHp),4);}ctx.restore();}
function start(){keys.clear();reset();state='playing';$('#overlay').classList.add('hidden');$('#pause').textContent='일시정지 ESC';hud();}
function pause(){if(state!=='playing'&&state!=='paused')return;state=state==='playing'?'paused':'playing';keys.clear();$('#pause').textContent=state==='paused'?'계속하기 ESC':'일시정지 ESC';if(state==='paused'){$('#overlay').classList.remove('hidden');$('#overlay').innerHTML='<div class="eyebrow">PAUSED</div><h2>잠시 숨을 고르세요.</h2><p>일시정지 중에는 전투 시간도 멈춥니다.</p><button id="resume" class="primary">계속하기</button>';$('#resume').onclick=pause;}else $('#overlay').classList.add('hidden');}
window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','z','x','c','Escape'].includes(k))e.preventDefault();if(k==='Escape'&&!e.repeat)pause();else keys.add(k);});window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>{keys.clear();if(state==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});$('#start').onclick=start;$('#pause').onclick=pause;$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent='사운드 '+(sound?'ON':'OFF');if(sound)tone(440);};reset();hud();function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;update(dt);draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
