/* 國七上地理・第二次段考 3D 教材：共用程式 */
(function(){
'use strict';
const NAV=[
  ['index.html','首頁'],
  ['forces.html','3-1 內外營力'],
  ['contour.html','3-2 等高線'],
  ['taiwan.html','3-3 臺灣地形'],
  ['coast.html','4-1・4-2 海岸'],
  ['islands.html','4-3 離島'],
  ['quiz.html','小測驗']
];
const qs=new URLSearchParams(location.search);
const EMBED=qs.has('embed');
if(EMBED)document.documentElement.classList.add('embed');
const here=(location.pathname.split('/').pop()||'index.html');

function withEmbed(href){
  if(!EMBED||!/\.html(#.*)?$/.test(href)||/^https?:/.test(href))return href;
  const [p,h]=href.split('#');return p+'?embed=1'+(h?'#'+h:'');
}

document.addEventListener('DOMContentLoaded',()=>{
  const head=document.getElementById('site-head');
  if(head){
    head.className='site-head';
    head.innerHTML='<div class="wrap"><a class="brand" href="index.html">地理 3D 教室<small>國七上・第二次段考<span style="color:#f5c84c;font-weight:700">（翰林版）</span></small></a><nav class="nav">'+
      NAV.map(([h,t])=>'<a href="'+h+'"'+(h===here?' class="on" aria-current="page"':'')+'>'+t+'</a>').join('')+'</nav></div>';
  }
  const foot=document.getElementById('site-foot');
  if(foot){
    foot.className='site-foot';
    foot.innerHTML='<div class="wrap">自編複習教材，依 108 課綱國中地理第一冊（翰林版）第 3～4 章範圍編寫，非出版社或學校官方資料。3D 模型與地圖皆為示意，高度經垂直誇大。</div>';
  }
  const pg=document.getElementById('pager');
  if(pg){
    const i=NAV.findIndex(n=>n[0]===here);
    const prev=NAV[i-1],next=NAV[i+1];
    pg.className='pager';
    pg.innerHTML=(prev?'<a href="'+prev[0]+'">← '+prev[1]+'</a>':'<span></span>')+(next?'<a href="'+next[0]+'">'+next[1]+' →</a>':'');
  }
  if(EMBED)document.querySelectorAll('a[href]').forEach(a=>a.setAttribute('href',withEmbed(a.getAttribute('href'))));
  /* 被 iframe 嵌入時，把頁面高度告訴外層網頁（Blogger 可用來自動調整 iframe 高度） */
  if(window.parent!==window){
    let last=0;const send=()=>{const h=Math.ceil(document.documentElement.scrollHeight);if(Math.abs(h-last)>4){last=h;try{window.parent.postMessage({type:'g3-height',h:h,page:here},'*');}catch(e){}}};
    if(window.ResizeObserver)new ResizeObserver(send).observe(document.body);window.addEventListener('load',send);setTimeout(send,800);
  }
});

/* ---------- 3D 視窗 ---------- */
function View(el,o){
  o=o||{};
  const R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:!!o.keep});
  R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  el.appendChild(R.domElement);
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(o.fov||36,1,0.05,200);
  scene.add(new THREE.HemisphereLight(0xffffff,0x6f6656,0.62));
  const sun=new THREE.DirectionalLight(0xffffff,0.72);sun.position.set(-3,5,2.5);scene.add(sun);
  const st={az:o.az??0.6,el:o.el??0.62,dist:o.dist??3.4,tx:o.target?o.target[0]:0,ty:o.target?o.target[1]:0.1,tz:o.target?o.target[2]:0};
  const goal={az:st.az,el:st.el,dist:st.dist};
  const home={az:st.az,el:st.el,dist:st.dist};
  const tags=[],frames=[];
  let drag=null,visible=true;

  if(o.hint!==false){const h=document.createElement('div');h.className='hint';h.textContent=o.hint||'拖曳旋轉・右下可放大縮小';el.appendChild(h);}
  const zb=document.createElement('div');
  zb.style.cssText='position:absolute;right:8px;bottom:8px;display:flex;gap:4px';
  [['＋',-1],['－',1],['重設',0]].forEach(([t,d])=>{const b=document.createElement('button');b.className='btn';b.textContent=t;b.style.cssText='padding:2px 10px;font-size:13px';
    b.onclick=e=>{e.stopPropagation();if(d===0){goal.az=home.az;goal.el=home.el;goal.dist=home.dist;}else goal.dist=Math.max(o.minDist||1.2,Math.min(o.maxDist||9,goal.dist*(d<0?0.82:1.22)));};
    b.addEventListener('pointerdown',e=>e.stopPropagation());zb.appendChild(b);});
  el.appendChild(zb);
  if(o.compass!==false){
    const c=document.createElement('div');c.className='compass';
    c.innerHTML='<svg viewBox="-20 -20 40 40" width="40" height="40"><circle r="18" fill="rgba(255,255,255,.85)" stroke="#c6c1b2"/><g id="cn"><path d="M0,-14 L5,2 L0,-1 L-5,2Z" fill="#a33a4a"/><text y="13" text-anchor="middle" font-size="9" fill="#1f2a24">北</text></g></svg>';
    el.appendChild(c);st.compass=c.querySelector('#cn');
  }
  el.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;drag={x:e.clientX,y:e.clientY};el.classList.add('grabbing');el.setPointerCapture(e.pointerId);});
  el.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
    goal.az-=dx*0.008;goal.el=Math.max(o.minEl??0.08,Math.min(1.555,goal.el+dy*0.006));st.az=goal.az;st.el=goal.el;});
  const end=()=>{drag=null;el.classList.remove('grabbing');};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);

  function resize(){const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;R.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();}
  resize();
  if(window.ResizeObserver)new ResizeObserver(resize).observe(el);else window.addEventListener('resize',resize);
  if(window.IntersectionObserver)new IntersectionObserver(es=>{visible=es[0].isIntersecting;}).observe(el);

  const v=new THREE.Vector3();
  function loop(t){
    requestAnimationFrame(loop);
    if(!visible)return;
    st.az+=(goal.az-st.az)*0.12;st.el+=(goal.el-st.el)*0.12;st.dist+=(goal.dist-st.dist)*0.12;
    const ce=Math.cos(st.el);
    cam.position.set(st.tx+st.dist*ce*Math.sin(st.az),st.ty+st.dist*Math.sin(st.el),st.tz+st.dist*ce*Math.cos(st.az));
    cam.lookAt(st.tx,st.ty,st.tz);
    frames.forEach(f=>f(t));
    R.render(scene,cam);
    if(st.compass)st.compass.setAttribute('transform','rotate('+(st.az*180/Math.PI)+')');
    const w=el.clientWidth,h=el.clientHeight;
    for(const g of tags){
      if(!g.show){g.el.style.display='none';continue;}
      v.copy(g.pos).project(cam);
      if(v.z>1||v.x<-1.1||v.x>1.1||v.y<-1.1||v.y>1.1){g.el.style.display='none';continue;}
      g.el.style.display='block';g.el.style.left=((v.x+1)/2*w)+'px';g.el.style.top=((1-v.y)/2*h)+'px';
    }
  }
  requestAnimationFrame(loop);

  return {
    el,scene,cam,renderer:R,
    view(az,elv,dist){if(az!=null)goal.az=az;if(elv!=null)goal.el=elv;if(dist!=null)goal.dist=dist;},
    home(az,elv,dist){home.az=az;home.el=elv;home.dist=dist;goal.az=az;goal.el=elv;goal.dist=dist;},
    target(x,y,z){st.tx=x;st.ty=y;st.tz=z;},
    tag(text,x,y,z,cls){const d=document.createElement('div');d.className='tag'+(cls?' '+cls:'');d.innerHTML=text;el.appendChild(d);
      const g={el:d,pos:new THREE.Vector3(x,y,z),show:true};tags.push(g);return g;},
    clearTags(){tags.forEach(g=>g.el.remove());tags.length=0;},
    showTags(b){tags.forEach(g=>g.show=b);},
    onFrame(f){frames.push(f);},
    clear(keep){for(let i=scene.children.length-1;i>=0;i--){const c=scene.children[i];if(c.isLight||(keep&&keep.includes(c)))continue;scene.remove(c);c.traverse&&c.traverse(n=>{n.geometry&&n.geometry.dispose();});}}
  };
}

/* ---------- 高度場地形 ---------- */
/* h(x,z) 傳回「公尺」高度；ys 為每公尺換算的 3D 單位 */
function Terrain(o){
  const size=o.size||2,n=o.n||140,sx=o.sx||size,sz=o.sz||size;
  const geo=new THREE.PlaneGeometry(sx,sz,n,o.nz||n);geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position,cnt=pos.count;
  const col=new Float32Array(cnt*3);geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  const H=new Float32Array(cnt);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(geo,mat);
  const group=new THREE.Group();group.add(mesh);
  let side=null;const base=o.base??-0.18;
  const c=new THREE.Color();
  const api={mesh,group,H,n,nz:o.nz||n,sx,sz,ys:o.ys||0.0006,
    set(hf){for(let i=0;i<cnt;i++){H[i]=hf(pos.getX(i),pos.getZ(i));}return api.apply();},
    apply(){
      for(let i=0;i<cnt;i++)pos.setY(i,H[i]*api.ys);
      pos.needsUpdate=true;geo.computeVertexNormals();api.paint();if(o.sides)api.sides();return api;},
    paint(cf){cf=cf||o.color;for(let i=0;i<cnt;i++){c.set(cf(H[i],pos.getX(i),pos.getZ(i)));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}geo.attributes.color.needsUpdate=true;},
    sides(){
      if(side){group.remove(side);side.geometry.dispose();}
      const nx=n,nz=api.nz,p=[],cl=[],idx=[];
      const rim=[];for(let i=0;i<=nx;i++)rim.push(i);for(let j=1;j<=nz;j++)rim.push(j*(nx+1)+nx);
      for(let i=nx-1;i>=0;i--)rim.push(nz*(nx+1)+i);for(let j=nz-1;j>=1;j--)rim.push(j*(nx+1));rim.push(0);
      const top=new THREE.Color(o.sideTop||'#9a7a55'),bot=new THREE.Color(o.sideBot||'#5e4a36');
      rim.forEach((k,m)=>{const x=pos.getX(k),z=pos.getZ(k),y=pos.getY(k);
        p.push(x,y,z,x,base,z);cl.push(top.r,top.g,top.b,bot.r,bot.g,bot.b);
        if(m>0){const a=(m-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}});
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));g.setIndex(idx);g.computeVertexNormals();
      side=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));group.add(side);
    },
    at(x,z){const fx=(x+sx/2)/sx*n,fz=(z+sz/2)/sz*api.nz;const i=Math.max(0,Math.min(n,Math.round(fx))),j=Math.max(0,Math.min(api.nz,Math.round(fz)));return H[j*(n+1)+i];}
  };
  return api;
}

/* 等高線（marching squares），傳回 LineSegments */
function Contours(T,levels,opt){
  opt=opt||{};const n=T.n,nz=T.nz,H=T.H,sx=T.sx,sz=T.sz,pts=[],pts2=[];
  const X=i=>-sx/2+sx*i/n,Z=j=>-sz/2+sz*j/nz,v=(i,j)=>H[j*(n+1)+i];
  for(const L of levels){
    const arr=(opt.index&&opt.index(L))?pts2:pts;
    for(let j=0;j<nz;j++)for(let i=0;i<n;i++){
      const c=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],cr=[];
      for(let e=0;e<4;e++){const a=c[e],b=c[(e+1)%4],va=v(a[0],a[1]),vb=v(b[0],b[1]);
        if((va-L)*(vb-L)<0){const t=(L-va)/(vb-va);cr.push([X(a[0])+t*(X(b[0])-X(a[0])),Z(a[1])+t*(Z(b[1])-Z(a[1]))]);}}
      const y=L*T.ys+(opt.lift||0.004);
      for(let m=0;m+1<cr.length;m+=2)arr.push(cr[m][0],y,cr[m][1],cr[m+1][0],y,cr[m+1][1]);
    }
  }
  const g=new THREE.Group();
  [[pts,opt.color||0x4a3a2a],[pts2,opt.indexColor||0x1a120a]].forEach(([a,cl])=>{if(!a.length)return;
    const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(a,3));
    g.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:cl})));});
  return g;
}

function Water(sx,sz,y,o){
  o=o||{};
  const mat=new THREE.MeshLambertMaterial({color:o.color||0x3f86bf,transparent:true,opacity:o.opacity??0.55,depthWrite:false,side:o.base!=null?THREE.FrontSide:THREE.DoubleSide});
  let m;
  if(o.base!=null){
    m=new THREE.Mesh(new THREE.BoxGeometry(sx*1.001,1,sz*1.001),mat);
    m.setLevel=lv=>{const hgt=Math.max(0.0005,lv-o.base);m.scale.y=hgt;m.position.y=o.base+hgt/2;m.visible=lv>o.base;};
    m.setLevel(y);
  }else{
    m=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),mat);m.rotation.x=-Math.PI/2;m.position.y=y;
    m.setLevel=lv=>{m.position.y=lv;};
  }
  m.renderOrder=2;return m;
}

/* 地圖用分層設色（公尺） */
const BANDS=[[-4000,'#2f5f8a'],[-200,'#4f86b3'],[-50,'#79abd1'],[0,'#a9cde6'],[1,'#86b97a'],[100,'#a4c985'],[200,'#c4d88f'],[500,'#e3dc95'],[1000,'#e2c27e'],[1500,'#d3a067'],[2000,'#bb8656'],[3000,'#9a6c47'],[3500,'#efe9df']];
function bandColor(m,bands){bands=bands||BANDS;let c=bands[0][1];for(const b of bands){if(m>=b[0])c=b[1];else break;}return c;}
function smooth(e0,e1,x){const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t);}
function lerpColor(a,b,t){const A=new THREE.Color(a),B=new THREE.Color(b);return '#'+A.lerp(B,t).getHexString();}

/* ---------- 臺灣 2D 地圖 ---------- */
function TwMap(canvas,o){
  o=o||{};
  const bb=o.bbox||[119.9,122.15,21.85,25.4];
  const k0=Math.cos(23.7*Math.PI/180);
  const ctx=canvas.getContext('2d');
  let W=0,Hh=0,s=1,ox=0,oy=0;const hits=[];
  function size(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    W=canvas.clientWidth;const ar=((bb[3]-bb[2]))/((bb[1]-bb[0])*k0);Hh=Math.round(W*ar);
    if(o.maxH&&Hh>o.maxH){Hh=o.maxH;}
    canvas.style.height=Hh+'px';canvas.width=W*dpr;canvas.height=Hh*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    s=Math.min(W/((bb[1]-bb[0])*k0),Hh/(bb[3]-bb[2]));ox=(W-(bb[1]-bb[0])*k0*s)/2;oy=(Hh-(bb[3]-bb[2])*s)/2;
  }
  const P=(lon,lat)=>[ox+(lon-bb[0])*k0*s,oy+(bb[3]-lat)*s];
  function poly(pts,fill,stroke,lw){ctx.beginPath();pts.forEach((c,i)=>{const p=P(c[0],c[1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||1;ctx.stroke();}}
  function line(pts,stroke,lw,dash){ctx.beginPath();pts.forEach((c,i)=>{const p=P(c[0],c[1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.strokeStyle=stroke;ctx.lineWidth=lw||1;ctx.setLineDash(dash||[]);ctx.stroke();ctx.setLineDash([]);}
  function label(t,lon,lat,opt){opt=opt||{};const p=P(lon,lat);ctx.font=(opt.bold?'700 ':'500 ')+(opt.size||12)+'px '+getComputedStyle(document.body).fontFamily;
    ctx.textAlign=opt.align||'left';ctx.textBaseline='middle';const dx=opt.dx??6,dy=opt.dy??0;
    if(opt.halo!==false){ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.strokeText(t,p[0]+dx,p[1]+dy);}
    ctx.fillStyle=opt.color||'#1f2a24';ctx.fillText(t,p[0]+dx,p[1]+dy);}
  function dot(lon,lat,r,fill,stroke,hit){const p=P(lon,lat);ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}if(hit)hits.push({x:p[0],y:p[1],r:Math.max(r,10),d:hit});}
  function draw(){
    size();hits.length=0;
    ctx.fillStyle='#dcebf5';ctx.fillRect(0,0,W,Hh);
    (GEO.cn||[]).forEach(l=>line(l,'#9aa79c',1));
    if(o.mainland)o.mainland(api);
    const tw=GEO.tw;Object.keys(tw).forEach(k=>poly(tw[k],o.land||'#f4f1e6','#8d978c',1));
    if(o.draw)o.draw(api);
  }
  canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    let best=null,bd=1e9;for(const h of hits){const d=Math.hypot(h.x-x,h.y-y);if(d<h.r&&d<bd){bd=d;best=h;}}
    if(best&&o.onPick)o.onPick(best.d);});
  canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    canvas.style.cursor=hits.some(h=>Math.hypot(h.x-x,h.y-y)<h.r)?'pointer':'default';});
  const api={draw,P,poly,line,label,dot,ctx,get W(){return W},get H(){return Hh}};
  if(window.ResizeObserver){let lw=0;new ResizeObserver(()=>{if(canvas.clientWidth!==lw){lw=canvas.clientWidth;draw();}}).observe(canvas);}
  window.addEventListener('load',draw);
  return api;
}

/* 按鈕群組：同組只亮一個 */
function radio(btns,cb){btns.forEach(b=>b.addEventListener('click',()=>{btns.forEach(x=>x.classList.toggle('on',x===b));cb(b);}));}

window.G3={View,Terrain,Contours,Water,bandColor,BANDS,smooth,lerpColor,TwMap,radio,EMBED};
})();
