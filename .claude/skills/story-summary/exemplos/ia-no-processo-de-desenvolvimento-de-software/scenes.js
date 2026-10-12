/* S0: vapor → eletricidade, mesmo eixo, produtividade parada */
const s0=$('s0svg');const SY=110;
const motor=S(s0,'g',{});const mR=S(motor,'rect',{x:0,y:40,width:230,height:140,rx:6,fill:SURF,stroke:DIM,'stroke-width':3});motor._c=[115,110];
const mV=S(motor,'text',{x:115,y:119,'text-anchor':'middle',fill:MUTED,'font-size':24});mV.textContent='VAPOR';
const mE=S(motor,'text',{x:115,y:119,'text-anchor':'middle',fill:A,'font-size':24,opacity:0});mE.textContent='ELÉTRICO';
const shaft0=line(s0,230,SY,900,SY,DIM,6);
const spin0=S(s0,'line',{x1:230,y1:SY,x2:900,y2:SY,stroke:MUTED,'stroke-width':6,'stroke-dasharray':'14 22',opacity:0});
const MX=[320,520,720];
const belts0=MX.map(x=>line(s0,x+70,SY,x+70,260,DIM,3));
const mach0=MX.map(x=>{const g=S(s0,'g',{});S(g,'rect',{x,y:260,width:140,height:110,rx:4,fill:SURF,stroke:BORDER,'stroke-width':1.5});g._c=[x+70,315];return g});
const pl0=S(s0,'text',{x:0,y:455,fill:MUTED,'font-size':22});pl0.textContent='PRODUTIVIDADE';
const pline0=line(s0,0,490,900,490,TXT,4);
const pd0=S(s0,'text',{x:900,y:455,'text-anchor':'end',fill:A,'font-size':22});pd0.textContent='DÉCADAS';
function r0(t){
 fadeUp($('s0t'),t,-.15,.45,30);
 pop(motor,back(pr(t,0,.45)));
 draw(shaft0,eio(pr(t,.3,.9)));
 belts0.forEach((b,i)=>draw(b,eio(pr(t,.6+i*.1,1.0+i*.1))));
 mach0.forEach((g,i)=>pop(g,back(pr(t,.8+i*.12,1.2+i*.12))));
 spin0.style.opacity=pr(t,1.0,1.3);spin0.setAttribute('stroke-dashoffset',-t*120);
 const sw=eio(pr(t,2.4,3.0));mV.style.opacity=1-sw;mE.style.opacity=sw;mR.setAttribute('stroke',sw>.5?A:DIM);
 pl0.style.opacity=pr(t,3.6,4.0);draw(pline0,eio(pr(t,3.8,5.4)));pd0.style.opacity=pr(t,5.0,5.4);
}
/* S1: o mesmo gesto, com a IA */
const s1=$('s1svg');
const M1=[[0,'ELETRICIDADE','SÉC. XIX'],[520,'IA','HOJE']].map(([x,l,k],i)=>{const g=S(s1,'g',{});
 S(g,'rect',{x,y:110,width:380,height:200,rx:6,fill:SURF,stroke:A,'stroke-width':3});
 const tx=S(g,'text',{x:x+190,y:222,'text-anchor':'middle',fill:TXT,'font-size':i?40:28});tx.textContent=l;
 const kk=S(g,'text',{x:x+190,y:370,'text-anchor':'middle',fill:MUTED,'font-size':22,class:'lbl'});kk.textContent=k;g._c=[x+190,210];return g});
const eq1=S(s1,'text',{x:450,y:240,'text-anchor':'middle',fill:A,'font-size':96,style:'font-family:Fraunces;font-weight:600;letter-spacing:0'});eq1.textContent='=';
function r1(t){
 fadeUp($('s1t'),t,.05,.5,24);
 pop(M1[0],back(pr(t,.3,.8)));pop(M1[1],back(pr(t,1.9,2.4)));
 eq1.style.opacity=pr(t,2.5,2.9);
}
/* S2: licenças, uso alto... e o resultado? */
const s2=$('s2svg');
const R2=[['LICENÇAS',.3,1],['USO ALTO',1.3,1],['O QUE MUDOU?',2.4,0]].map(([l,a,ok],i)=>{const y=20+i*150,g=S(s2,'g',{});
 S(g,'rect',{x:0,y,width:900,height:120,rx:4,fill:SURF,stroke:ok?BORDER:A,'stroke-width':ok?1.5:2.5});
 const tx=S(g,'text',{x:44,y:y+70,fill:ok?TXT:A,'font-size':30});tx.textContent=l;
 let ic;if(ok)ic=S(g,'path',{d:`M${806} ${y+60} l14 15 l30 -32`,fill:'none',stroke:A,'stroke-width':6,'stroke-linecap':'round','stroke-linejoin':'round'});
 else{ic=S(g,'text',{x:836,y:y+86,'text-anchor':'middle',fill:A,'font-size':72,style:'font-family:Fraunces;font-weight:600;letter-spacing:0'});ic.textContent='?'}
 return {g,ic,a,ok}});
function r2(t){
 fadeUp($('s2t'),t,.1,.5,24);
 R2.forEach(r=>{fadeUp(r.g,t,r.a,.5,24);if(!r.ok)r.ic.style.opacity=t<r.a+.6?0:(.55+.45*Math.cos((t-r.a)*5))});
}
/* S3: quatro modos, nomes só no artigo */
const s3=$('s3svg');const NP=[0,1,2,3].map(i=>[80+i*245,400-i*115]);
const ed3=NP.slice(1).map((p,i)=>line(s3,...NP[i],...p,A,3));
const n3=NP.map(([x,y],i)=>{const g=S(s3,'g',{});S(g,'circle',{cx:x,cy:y,r:50,fill:BG,stroke:A,'stroke-width':3});
 const n=S(g,'text',{x,y:y+9,'text-anchor':'middle',fill:A,'font-size':26});n.textContent='0'+(i+1);g._c=[x,y];return g});
const rd3=NP.map(([x,y])=>S(s3,'rect',{x:x-70,y:y+74,width:140,height:22,rx:3,fill:GRAY,opacity:0}));
function r3(t){
 fadeUp($('s3t'),t,.1,.5,24);
 n3.forEach((g,i)=>pop(g,back(pr(t,.4+i*.35,.8+i*.35))));
 ed3.forEach((l,i)=>draw(l,eio(pr(t,.5+i*.35,.9+i*.35))));
 rd3.forEach((r,i)=>{r.setAttribute('opacity',pr(t,.9+i*.35,1.2+i*.35));r.setAttribute('fill',Math.sin(t*4-i)>.6?SHIM:GRAY)});
}
const SCENE_FNS=[r0,r1,r2,r3];
