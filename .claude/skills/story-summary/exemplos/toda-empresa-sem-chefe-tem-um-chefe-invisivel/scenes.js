/* S0: quem decide? */
const s0=$('s0svg');const X0=[90,270,450,630,810],Y0=250;
const n0=X0.map(x=>{const g=S(s0,'g',{});const c=S(g,'circle',{cx:x,cy:Y0,r:56,fill:SURF,stroke:DIM,'stroke-width':3});g._c=[x,Y0];g._k=c;return g});
const l0=S(s0,'text',{x:450,y:Y0+130,'text-anchor':'middle',fill:TXT,'font-size':24,class:'lbl'});l0.textContent='TODOS DONOS';
const q0=S(s0,'text',{x:90,y:Y0-100,'text-anchor':'middle',fill:A,'font-size':110,style:'font-family:Fraunces;font-weight:600;letter-spacing:0'});q0.textContent='?';
function r0(t){
 fadeUp($('s0t'),t,-.15,.45,30);
 n0.forEach((g,i)=>pop(g,back(pr(t,.1+i*.1,.5+i*.1))));
 l0.style.opacity=pr(t,.6,1);
 const sc=eio(pr(t,1.0,3.4));const x=90+sc*720*(1-.5*eio(pr(t,2.6,3.4)))-0;
 const xs=t<2.6?90+720*eio(pr(t,1.0,2.6)):810-360*eio(pr(t,2.6,3.4));
 q0.setAttribute('x',xs);q0.setAttribute('y',Y0-100-Math.abs(Math.sin(t*6))*14);q0.style.opacity=pr(t,.9,1.2);
 const h=eio(pr(t,3.3,3.7));n0[2]._k.setAttribute('fill',h>.5?A:SURF);n0[2]._k.setAttribute('stroke',h>.1?A:DIM);
}
/* S1: 1970 → IA */
const s1=$('s1svg');
const ln1=line(s1,150,230,750,230,A,4);
const a1=S(s1,'g',{});S(a1,'circle',{cx:150,cy:230,r:70,fill:SURF,stroke:A,'stroke-width':3});a1._c=[150,230];
const a1t=S(a1,'text',{x:150,y:239,'text-anchor':'middle',fill:TXT,'font-size':28});a1t.textContent='1970';
const b1=S(s1,'g',{});const b1c=S(b1,'circle',{cx:750,cy:230,r:70,fill:SURF,stroke:A,'stroke-width':3});b1._c=[750,230];
const b1t=S(b1,'text',{x:750,y:239,'text-anchor':'middle',fill:TXT,'font-size':28});b1t.textContent='IA';
const a1l=S(s1,'text',{x:150,y:370,'text-anchor':'middle',fill:MUTED,'font-size':22,class:'lbl'});a1l.textContent='JO FREEMAN';
const b1l=S(s1,'text',{x:750,y:370,'text-anchor':'middle',fill:A,'font-size':22,class:'lbl'});b1l.textContent='MAIS ATUAL';
function r1(t){
 fadeUp($('s1t'),t,.1,.6,24);
 pop(a1,back(pr(t,.3,.8)));a1l.style.opacity=pr(t,.8,1.2);
 draw(ln1,eio(pr(t,2.0,3.4)));
 pop(b1,back(pr(t,3.3,3.8))*(1+.12*eio(pr(t,4.4,4.9))));b1c.setAttribute('fill',t>4.6?A:SURF);b1t.setAttribute('fill',t>4.6?AC:TXT);
 b1l.style.opacity=pr(t,4.6,5.0);
}
/* S2: as funções mudam de lugar — para onde? */
const s2=$('s2svg');
const box2=S(s2,'rect',{x:560,y:40,width:340,height:420,rx:6,fill:DEEP,stroke:A,'stroke-width':2,'stroke-dasharray':'10 8'});
const q2=S(s2,'text',{x:730,y:300,'text-anchor':'middle',fill:A,'font-size':200,style:'font-family:Fraunces;font-weight:600;letter-spacing:0'});q2.textContent='?';
const ges=S(s2,'g',{});S(ges,'circle',{cx:140,cy:250,r:80,fill:SURF,stroke:TXT,'stroke-width':3});ges._c=[140,250];
const gesL=S(s2,'text',{x:140,y:390,'text-anchor':'middle',fill:TXT,'font-size':22,class:'lbl'});gesL.textContent='GESTOR';
const F2=['ROTEAR','COORDENAR','DISTRIBUIR'].map(l=>{const g=S(s2,'g',{});S(g,'rect',{x:0,y:-32,width:280,height:64,rx:2,fill:SURF,stroke:A,'stroke-width':2});
 const tx=S(g,'text',{x:140,y:9,'text-anchor':'middle',fill:TXT,'font-size':22});tx.textContent=l;return g});
function r2(t){
 fadeUp($('s2t'),t,.1,.6,24);
 pop(ges,back(pr(t,.3,.8)));const gone=eio(pr(t,2.6,3.4));ges.style.opacity=Math.min(cl(pr(t,.3,.8)*2),1-.85*gone);gesL.style.opacity=pr(t,.5,.9)*(1-.85*gone);
 box2.style.opacity=eo(pr(t,1.2,1.8));q2.style.opacity=eo(pr(t,1.4,2.0))*(1-eio(pr(t,3.4,4.0)));
 F2.forEach((g,i)=>{const a=eo(pr(t,.8+i*.15,1.2+i*.15)),m=eio(pr(t,3.4+i*.35,4.4+i*.35));
  g.setAttribute('transform',`translate(${250+m*(590-250)} ${140+i*110})`);g.style.opacity=a});
}
/* S3: a pergunta está no artigo */
const s3=$('s3svg');
const card3=S(s3,'g',{});S(card3,'rect',{x:0,y:40,width:900,height:400,rx:6,fill:SURF,stroke:A,'stroke-width':2});
const k3=S(card3,'text',{x:50,y:120,fill:A,'font-size':26});k3.textContent='A PERGUNTA';
const bars3=redact(card3,50,180,[800,690,460],GRAY,30,62);
function r3(t){
 fadeUp($('s3t'),t,.1,.6,24);
 card3.style.opacity=eo(pr(t,.3,.8));card3.setAttribute('transform',`translate(0 ${(1-eo(pr(t,.3,.8)))*30})`);
 bars3.forEach((b,k)=>{b.setAttribute('width',[800,690,460][k]*eo(pr(t,.8+k*.25,1.4+k*.25)));b.setAttribute('fill',(Math.sin(t*4-k)>.6)?SHIM:GRAY)});
}
const SCENE_FNS=[r0,r1,r2,r3];
