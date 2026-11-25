'use strict';
// Procedural art resources. Shared slots and combat silhouettes across all seven packs.
const DUNGEON_THEMES = [
  {id:'royal',day:'월',name:'잊혀진 왕의 방',mark:'♛',motif:'crown',floor:['#171d28','#1c2330','#1a212d'],wall:'#414250',accent:'#e8c68a',light:'#ffc77b',hero:['#993f4b','#849aaf'],enemy:['#779b8a','#9b84b3','#a77f84'],names:['왕의 척후병','철갑 근위대','타락한 왕'],skills:['3연 검격','빛의 검기','천상의 심판'],magic:'#b2edff',waveform:'triangle',pitch:1,description:'금빛 왕관 아래 잠든 돌의 성채'},
  {id:'forest',day:'화',name:'가시나무 성소',mark:'❧',motif:'leaf',floor:['#101e1b','#162a23','#14261f'],wall:'#355347',accent:'#a7d68a',light:'#b4e78b',hero:['#39694f','#a9b895'],enemy:['#78a565','#90bfab','#b2ba79'],names:['덩굴 정찰병','가시 수호자','고목 군주'],skills:['가시 검격','잎새 검기','숲의 맹세'],magic:'#c5f1ad',waveform:'sine',pitch:1.12,description:'뿌리와 잎맥이 봉인한 고목의 제단'},
  {id:'frost',day:'수',name:'서리 거울궁',mark:'❄',motif:'crystal',floor:['#121d2b','#1b2b3d','#172536'],wall:'#45647c',accent:'#a6dcf4',light:'#b6edff',hero:['#4f78aa','#becfdf'],enemy:['#88bacc','#9daedc','#d5e7f0'],names:['서리 파수병','빙정 기사','백야 여왕'],skills:['빙결 검격','서리 검기','백야의 빛'],magic:'#d5f6ff',waveform:'sine',pitch:1.4,description:'결정과 얼음 거울이 빛나는 푸른 궁전'},
  {id:'ember',day:'목',name:'잿불 대장간',mark:'◆',motif:'flame',floor:['#241a1b','#302022','#291c20'],wall:'#65504a',accent:'#f1b07c',light:'#ffb369',hero:['#a75837','#b6a18e'],enemy:['#bc8b65','#bc786a','#dfa070'],names:['재의 척후병','흑철 집행자','용광로 군왕'],skills:['잿불 검격','불씨 검기','태양의 망치'],magic:'#ffe2ac',waveform:'triangle',pitch:.8,description:'흑철과 잿불이 남은 붉은 용광로'},
  {id:'dunes',day:'금',name:'모래시계 영묘',mark:'◇',motif:'eye',floor:['#25221c','#302c23','#2a271f'],wall:'#726349',accent:'#e4ce89',light:'#ffe29a',hero:['#a08a58','#c9bd99'],enemy:['#b4a16b','#98b5ac','#d0bd83'],names:['사막 망령','황금 근위병','모래 예언자'],skills:['사구 검격','유리 검기','영원의 인장'],magic:'#b9f1e2',waveform:'triangle',pitch:.95,description:'황금 눈 문양이 시간을 지키는 사암 영묘'},
  {id:'abyss',day:'토',name:'심해의 종루',mark:'≈',motif:'shell',floor:['#101e28','#152b36','#122631'],wall:'#365d6b',accent:'#8edbd7',light:'#8ee9dd',hero:['#38687b','#9bbdc6'],enemy:['#73abae','#8c9ec5','#b4c8df'],names:['해무 망령','산호 파수꾼','침몰한 제독'],skills:['파도 검격','해류 검기','심해의 종'],magic:'#b1fff2',waveform:'sine',pitch:.7,description:'조개와 산호가 감싼 침몰 도시의 종루'},
  {id:'astral',day:'일',name:'별빛 관측소',mark:'✦',motif:'star',floor:['#1c192c','#28233d','#221e35'],wall:'#575079',accent:'#c9b6f2',light:'#d6baff',hero:['#69538f','#b5aed2'],enemy:['#9a93c2','#b49ed1','#d4c5e6'],names:['별가루 추적자','궤도 기사','황혼의 관측자'],skills:['성운 검격','별빛 검기','일곱 별의 심판'],magic:'#e5d5ff',waveform:'triangle',pitch:1.25,description:'일곱 별과 궤도가 새겨진 밤하늘 관측소'}
];
function dailyThemeIndex(date=new Date()) {
  const day=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',weekday:'short'}).format(date);
  return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(day);
}
let themeIndex=dailyThemeIndex(), theme=DUNGEON_THEMES[themeIndex];

// Symbols are vector paths, not font glyphs, so the arena art works offline.
function artSymbol(c,m,x,y,r,color){
  c.save();c.translate(x,y);c.strokeStyle=color;c.fillStyle=color;c.lineWidth=Math.max(1.5,r*.06);c.beginPath();
  if(m==='crown'){c.moveTo(-r,r*.5);c.lineTo(-r,-r*.5);c.lineTo(-r*.4,0);c.lineTo(0,-r);c.lineTo(r*.4,0);c.lineTo(r,-r*.5);c.lineTo(r,r*.5);c.closePath();}
  if(m==='leaf'){c.moveTo(-r*.7,r*.8);c.quadraticCurveTo(-r*1.1,-r*.8,r*.7,-r);c.quadraticCurveTo(r*1.2,r*.7,-r*.7,r*.8);c.moveTo(-r*.7,r*.8);c.lineTo(r*.5,-r*.7);}
  if(m==='crystal'){for(let i=0;i<6;i++){const a=i*Math.PI/3;c.moveTo(0,0);c.lineTo(Math.cos(a)*r,Math.sin(a)*r);const x=Math.cos(a)*r*.6,y=Math.sin(a)*r*.6;c.moveTo(Math.cos(a-.4)*r*.85,Math.sin(a-.4)*r*.85);c.lineTo(x,y);c.lineTo(Math.cos(a+.4)*r*.85,Math.sin(a+.4)*r*.85);}}
  if(m==='flame'){c.moveTo(0,-r);c.quadraticCurveTo(r*.2,-r*.1,r*.7,0);c.quadraticCurveTo(r,r,-r*.5,r*.6);c.quadraticCurveTo(-r,r*.2,0,-r);c.moveTo(0,r*.5);c.lineTo(0,0);}
  if(m==='eye'){c.moveTo(-r,0);c.quadraticCurveTo(0,-r,r,0);c.quadraticCurveTo(0,r,-r,0);c.moveTo(r*.25,0);c.arc(0,0,r*.25,0,Math.PI*2);}
  if(m==='shell'){c.arc(0,0,r,Math.PI,Math.PI*2);c.lineTo(0,r*.7);c.closePath();for(let i=1;i<5;i++){const a=Math.PI+i*Math.PI/5;c.moveTo(0,r*.7);c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}}
  if(m==='star'){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.42:r;const x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();}
  c.stroke();c.restore();
}
function artGround(c,w,h){
  c.fillStyle=theme.floor[0];c.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=52)for(let x=0;x<w;x+=64){c.fillStyle=theme.floor[1+(x/64+y/52)%2];c.fillRect(x+1,y+1,62,50);}
  c.strokeStyle=theme.wall;c.lineWidth=10;c.strokeRect(24,25,w-48,h-50);c.strokeStyle=theme.accent+'33';c.lineWidth=2;c.strokeRect(40,41,w-80,h-82);
  c.save();c.globalAlpha=.17;artSymbol(c,theme.motif,w/2,h/2,100,theme.accent);
  c.beginPath();c.arc(w/2,h/2,150,0,Math.PI*2);c.strokeStyle=theme.accent;c.stroke();
  for(let i=0;i<12;i++){const a=i*Math.PI/6;artSymbol(c,theme.motif,w/2+Math.cos(a)*205,h/2+Math.sin(a)*205,9,theme.accent);}c.restore();
  for(const x of [65,w-65])for(const y of [85,h-85]){const g=c.createRadialGradient(x,y,2,x,y,65);g.addColorStop(0,theme.light+'30');g.addColorStop(1,theme.light+'00');c.fillStyle=g;c.fillRect(x-65,y-65,130,130);artSymbol(c,theme.motif,x,y,15,theme.light);}
}
