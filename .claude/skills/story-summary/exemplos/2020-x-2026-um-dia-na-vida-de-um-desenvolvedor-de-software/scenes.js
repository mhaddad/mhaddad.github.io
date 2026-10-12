/* S0: 400 linhas × cerca de 100 */
const s0=$('s0svg');
const B0=[[2020,400,A,.6,2.6],[2026,100,DIM,3.4,4.4]].map(([y,n,c,a,b],i)=>{const Y=60+i*230;
 const k=S(s0,'text',{x:0,y:Y,fill:MUTED,'font-size':26});k.textContent=String(y);
 S(s0,'rect',{x:0,y:Y+24,width:900,height:100,rx:2,fill:DEEP,stroke:BORDER,'stroke-width':1});
 const r=S(s0,'rect',{x:0,y:Y+24,width:0,height:100,rx:2,fill:c});
 const v=S(s0,'text',{x:900,y:Y,'text-anchor':'end',fill:i?TXT:A,'font-size':30});
 return {k,r,v,n,a,b,Y,i}});
function r0(t){
 fadeUp($('s0t'),t,-.15,.45,30);
 B0.forEach(o=>{o.k.style.opacity=pr(t,o.a-.4,o.a);const p=eio(pr(t,o.a,o.b));const w=900*o.n/400*p;o.r.setAttribute('width',w);
  o.v.textContent=(o.i?'~':'')+Math.round(o.n*p)+' LINHAS';o.v.style.opacity=pr(t,o.a,o.a+.2)});
}
/* S1: onze decisões */
const s1=$('s1svg');
const D1=[...Array(11)].map((_,i)=>{const row=i<6?0:1,col=row?i-6:i,x=75+col*150+(row?75:0),y=150+row*170;
 const g=S(s1,'g',{});S(g,'rect',{x:x-42,y:y-42,width:84,height:84,rx:4,fill:SURF,stroke:A,'stroke-width':3,transform:`rotate(45 ${x} ${y})`});
 S(g,'path',{d:`M${x-16} ${y} l11 12 l22 -24`,fill:'none',stroke:A,'stroke-width':5,'stroke-linecap':'round','stroke-linejoin':'round'});g._c=[x,y];return g});
function r1(t){
 fadeUp($('s1t'),t,.05,.5,24);
 D1.forEach((g,i)=>pop(g,back(pr(t,.3+i*.12,.6+i*.12))));
}
/* S2: quinze minutos, metade do escopo */
const s2=$('s2svg');
const L2=S(s2,'rect',{x:0,y:40,width:450,height:170,rx:4,fill:hexA(A,.18),stroke:A,'stroke-width':2});
const R2=S(s2,'rect',{x:450,y:40,width:450,height:170,rx:4,fill:hexA(A,.18),stroke:A,'stroke-width':2});
const e2=S(s2,'text',{x:225,y:136,'text-anchor':'middle',fill:TXT,'font-size':28});e2.textContent='ESCOPO';
const cut2=S(s2,'line',{x1:450,y1:20,x2:450,y2:230,stroke:TXT,'stroke-width':3,'stroke-dasharray':'10 8',opacity:0});
const m2=S(s2,'text',{x:675,y:136,'text-anchor':'middle',fill:A,'font-size':34,class:'lbl'});m2.textContent='−50%';
const C2=[450,400],RR=80,LL=2*Math.PI*RR;
S(s2,'circle',{cx:C2[0],cy:C2[1],r:RR,fill:'none',stroke:BORDER,'stroke-width':10});
const arc2=S(s2,'circle',{cx:C2[0],cy:C2[1],r:RR,fill:'none',stroke:A,'stroke-width':10,'stroke-dasharray':LL,'stroke-dashoffset':LL,transform:`rotate(-90 ${C2[0]} ${C2[1]})`});
const c2t=S(s2,'text',{x:C2[0],y:C2[1]+9,'text-anchor':'middle',fill:TXT,'font-size':24});c2t.textContent='15 MIN';
function r2(t){
 fadeUp($('s2t'),t,.1,.5,24);
 const a=eo(pr(t,.2,.7));L2.style.opacity=a;R2.style.opacity=a;e2.style.opacity=a;
 arc2.setAttribute('stroke-dashoffset',LL*(1-.25*eio(pr(t,.6,2.2))));c2t.style.opacity=pr(t,.6,1);
 cut2.setAttribute('opacity',pr(t,2.0,2.3));
 const d=eio(pr(t,2.4,3.4));R2.setAttribute('transform',`translate(${d*60} ${d*40})`);R2.style.opacity=a*(1-.8*d);
 m2.setAttribute('x',675+d*60);m2.setAttribute('y',136+d*40);m2.style.opacity=pr(t,2.8,3.2);
}
/* S3: duas terças, hora a hora; o que não mudou? */
const s3=$('s3svg');
const COLS=[[200,'2020'],[700,'2026']].map(([x,y],ci)=>{const k=S(s3,'text',{x,y:40,'text-anchor':'middle',fill:MUTED,'font-size':26});k.textContent=y;
 const blocks=[...Array(6)].map((_,j)=>S(s3,'rect',{x:x-140,y:70+j*72,width:280,height:56,rx:3,fill:SURF,stroke:BORDER,'stroke-width':1.5}));return {k,blocks}});
const KEEP=[1,4];
const links3=KEEP.map(j=>S(s3,'line',{x1:340,y1:98+j*72,x2:560,y2:98+j*72,stroke:A,'stroke-width':3,'stroke-dasharray':'8 8',opacity:0}));
const q3=KEEP.flatMap(j=>[200,700].map(x=>{const q=S(s3,'text',{x,y:110+j*72,'text-anchor':'middle',fill:A,'font-size':34,style:'font-family:Fraunces;font-weight:600;letter-spacing:0',opacity:0});q.textContent='?';return q}));
function r3(t){
 fadeUp($('s3t'),t,.1,.5,24);
 COLS.forEach((c,ci)=>{c.k.style.opacity=pr(t,.3,.6);c.blocks.forEach((b,j)=>{b.style.opacity=eo(pr(t,.4+j*.12+ci*.3,.7+j*.12+ci*.3));
  const keep=KEEP.includes(j)&&t>3.0;b.setAttribute('stroke',keep?A:BORDER);b.setAttribute('fill',keep?hexA(A,.15):SURF)})});
 links3.forEach((l,k)=>l.setAttribute('opacity',pr(t,3.2+k*.2,3.5+k*.2)));
 q3.forEach((q,k)=>q.setAttribute('opacity',pr(t,3.3+k*.1,3.6+k*.1)));
}
const SCENE_FNS=[r0,r1,r2,r3];
