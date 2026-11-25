// Fun1: deterministic input-only simulation; run from repository root.
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const source = fs.readFileSync('game.js', 'utf8');
const plans = [0.15,0.2,0.25,0.3,0.35,0.4].map(reaction=>({mode:'normal',reaction}));
plans.push({mode:'flee',reaction:0.2,clockwise:1},{mode:'flee',reaction:0.3,clockwise:-1},
  {mode:'stationary',reaction:0.2,skills:'z'},{mode:'stationary',reaction:0.2,skills:'zxc'});
const results = plans.map((plan,index)=>{
  const element={getContext:()=>({}),style:{},classList:{add(){},remove(){},toggle(){}}};
  const context=vm.createContext({document:{querySelector:()=>element,addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){},localStorage:{getItem(){return null;},setItem(){}},plan});
  vm.runInContext(fs.readFileSync('theme-art.js','utf8'),context);
  vm.runInContext(source,context);
  return vm.runInContext(`(()=>{
    start();
    const dt=1/60, stats={hits:0,casts:{z:0,x:0,c:0},cTimes:[],waves:[],pushes:0};
    const originalHurt=hurt, originalAttack=attack, originalContact=contactEnemies;
    hurt=function(amount){const hp=player.hp;originalHurt(amount);if(player.hp<hp)stats.hits++;};
    attack=function(kind){const field=kind==='x'?'xcd':kind;if(player[field]<=0){stats.casts[kind]++;if(kind==='c')stats.cTimes.push(time);}originalAttack(kind);};
    contactEnemies=function(){const x=player.x,y=player.y;originalContact();if(x!==player.x||y!==player.y)stats.pushes++;};
    let next=0,waypoint=0,waveStart=0;
    const route=plan.clockwise===-1?[[950,480],[950,120],[170,120],[170,480]]:[[170,480],[170,120],[950,120],[950,480]];
    function direction(x,y){const angle=Math.round(Math.atan2(y,x)/(Math.PI/4))*Math.PI/4;const dx=Math.round(Math.cos(angle)),dy=Math.round(Math.sin(angle));if(dx)keys.add(dx>0?'ArrowRight':'ArrowLeft');if(dy)keys.add(dy>0?'ArrowDown':'ArrowUp');}
    for(let frame=0;state==='playing'&&frame<10810;frame++){
      if(time>=next){
        next=time+plan.reaction;keys.clear();
        const target=enemies.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];
        if(plan.mode==='stationary'){for(const key of plan.skills)keys.add(key);}
        else if(plan.mode==='flee'){
          let point=route[waypoint];if(Math.hypot(point[0]-player.x,point[1]-player.y)<50){waypoint=(waypoint+1)%4;point=route[waypoint];}direction(point[0]-player.x,point[1]-player.y);
        }else if(target){
          const x=target.x-player.x,y=target.y-player.y,d=Math.hypot(x,y);
          const danger=enemies.find(e=>e.action&&((e.action.kind==='ultimate'&&Math.hypot(player.x-e.action.x,player.y-e.action.y)<190)||(e.action.kind==='melee'&&Math.hypot(player.x-e.x,player.y-e.y)<e.r+75)));
          const bullet=shots.find(s=>!s.friendly&&Math.hypot(s.x-player.x,s.y-player.y)<100);
          if(danger){const a=danger.action.kind==='ultimate'?danger.action:danger;direction(player.x-a.x,player.y-a.y);}
          else if(bullet){direction(-bullet.vy,bullet.vx);}
          else{
            direction(x,y);
            if(d<100+target.r)keys.add('z');
            if(d<500)keys.add('x');
            if(d<230)keys.add('c');
          }
        }
      }
      const before=wave;update(dt);
      if(wave!==before||state!=='playing'){stats.waves.push({wave:before,seconds:time-waveStart,complete:wave!==before||state==='won'});waveStart=time;}
    }
    return {...plan,result:state==='won'?'clear':player.hp===0?'death':'timeout',seconds:time,hp:player.hp,wave,kills,...stats};
  })()`,context);
});
const output={version:'v0.3.2',node:process.version,gameSha256:crypto.createHash('sha256').update(source).digest('hex'),dt:1/60,results};
fs.writeFileSync('funqa-results.json',JSON.stringify(output,null,2)+'\n');
console.table(results.map((r,i)=>({run:i+1,mode:r.mode,reaction:r.reaction,result:r.result,seconds:r.seconds.toFixed(2),hp:r.hp,wave:r.wave,hits:r.hits,pushes:r.pushes})));
const wins=results.filter(r=>r.mode==='normal'&&r.result==='clear').map(r=>r.seconds).sort((a,b)=>a-b);
console.log(JSON.stringify({normalWins:wins.length,normalTotal:6,mean:wins.length?wins.reduce((a,b)=>a+b)/wins.length:null,median:wins.length?(wins[Math.floor((wins.length-1)/2)]+wins[Math.floor(wins.length/2)])/2:null}));
