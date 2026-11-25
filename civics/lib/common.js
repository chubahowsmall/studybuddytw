/* 國七上公民・第二次段考（翰林版 3-1～4-2）互動教材：共用程式（導覽列、頁尾、上下頁、嵌入模式、圖解、分類挑戰、排順序、小測驗） */
(function(){
'use strict';
const NAV=[
  ['index.html','公民首頁'],
  ['kinship.html','3-1 家庭與親屬'],
  ['equality.html','3-2 平權與親權'],
  ['changes.html','4-1 功能與變遷'],
  ['support.html','4-2 政府與家暴防治'],
  ['mindmap.html','全章心智圖']
];
const qs=new URLSearchParams(location.search);
const EMBED=qs.has('embed');
if(EMBED)document.documentElement.classList.add('embed');
const here=(location.pathname.split('/').pop()||'index.html');

function withEmbed(href){
  if(!EMBED||!/\.html(#.*)?$/.test(href)||/^https?:/.test(href))return href;
  const [p,h]=href.split('#');return p+'?embed=1'+(h?'#'+h:'');
}

function showVersion(el){
  if(!el)return;
  const add=(p,tag,cls,text,attrs)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=text;Object.assign(e,attrs||{});p.appendChild(e);return e;};
  const grp=()=>add(el,'span','vgrp','');
  fetch('../version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(v=>{
    el.textContent='';let g=grp();add(g,'span','','版本');
    if(v.tag)add(g,'span','vtag',v.tag);
    if(v.tag&&v.ahead>0)add(g,'span','','（之後 '+v.ahead+' 個更新）');
    if(v.commit)add(v.tag?grp():g,'span','vcommit',v.commit,{title:'commit ID（前六碼）'});
    if(v.deployed){g=grp();add(g,'span','','部署時間');add(g,'span','',v.deployed);}
  }).catch(()=>{el.textContent='本機預覽（沒有版本資訊）';});
}

document.addEventListener('DOMContentLoaded',()=>{
  const head=document.getElementById('site-head');
  if(head){
    head.className='site-head civ';
    head.innerHTML='<div class="wrap"><a class="home" href="../index.html" title="回到伴讀書僮首頁">← 伴讀書僮</a><a class="brand" href="index.html">公民生活館<small>國七上・第二次段考<span style="color:#f5c84c;font-weight:700">（翰林版）</span></small></a><nav class="nav">'+
      NAV.map(([h,t])=>'<a href="'+h+'"'+(h===here?' class="on" aria-current="page"':'')+'>'+t+'</a>').join('')+'</nav></div>';
  }
  const foot=document.getElementById('site-foot');
  if(foot){
    foot.className='site-foot';
    foot.innerHTML='<div class="wrap"><span>伴讀書僮・自編複習教材</span><span class="ver" title="版本以 git tag 為主；括號內為 commit ID 前六碼">版本資訊讀取中…</span><span class="foot-note" style="flex-basis:100%;font-size:12px">自編複習教材，依 108 課綱國中社會第一冊（翰林版）公民第 3～4 章（3-1～4-2）範圍編寫，非出版社或學校官方資料。題目皆為自編練習題，法規以現行條文為準。</span></div>';
    showVersion(foot.querySelector('.ver'));
  }
  const pg=document.getElementById('pager');
  if(pg){
    const i=NAV.findIndex(n=>n[0]===here);
    const prev=NAV[i-1],next=NAV[i+1];
    pg.className='pager';
    pg.innerHTML=(prev?'<a href="'+prev[0]+'">← '+prev[1]+'</a>':'<span></span>')+(next?'<a href="'+next[0]+'">'+next[1]+' →</a>':'');
  }
  if(EMBED)document.querySelectorAll('a[href]').forEach(a=>a.setAttribute('href',withEmbed(a.getAttribute('href'))));
  /* 單元內頁右側垂直置中「回到最上方」浮動按鈕（不含首頁） */
  if(here!=='index.html'&&!EMBED){
    const bt=document.createElement('button');
    bt.type='button';bt.className='back-top civ';bt.setAttribute('aria-label','回到頁面最上方');bt.title='回到最上方';
    bt.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg><span>頂端</span>';
    const sync=()=>bt.classList.toggle('show',(window.scrollY||document.documentElement.scrollTop)>260);
    bt.onclick=()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    document.body.appendChild(bt);
    window.addEventListener('scroll',sync,{passive:true});
    sync();
  }
  if(window.parent!==window){
    let last=0;const send=()=>{const h=Math.ceil(document.documentElement.scrollHeight);if(Math.abs(h-last)>4){last=h;try{window.parent.postMessage({type:'g3-height',h:h,page:here},'*');}catch(e){}}};
    if(window.ResizeObserver)new ResizeObserver(send).observe(document.body);window.addEventListener('load',send);setTimeout(send,800);
  }
});

/* ---------- 公民頁共用互動工具 ---------- */
const C={};
C.$=id=>document.getElementById(id);
C.shuffle=function(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

/* 小測驗：C.quiz({box, score, done, reset, filter, data, names}) */
C.quiz=function(cfg){
  const box=C.$(cfg.box),QZ=cfg.data,names=cfg.names||{};let cur='all';const got=new Array(QZ.length).fill(null);
  function build(){
    box.innerHTML=QZ.map((q,i)=>'<div class="q" data-u="'+q.u+'" data-i="'+i+'"><div class="stem"><span class="no">第 '+(i+1)+' 題</span>'+q.s+(names[q.u]?'<span class="u">'+names[q.u]+'</span>':'')+'</div>'+(q.fig?'<figure>'+q.fig+'</figure>':'')+'<div class="opts">'+
      q.o.map((t,j)=>'<button class="opt" data-j="'+j+'">('+'ABCD'[j]+') '+t+'</button>').join('')+'</div><div class="exp"></div></div>').join('');
    box.querySelectorAll('.q').forEach(d=>{
      const i=+d.dataset.i,q=QZ[i];
      d.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
        const j=+b.dataset.j;
        d.querySelectorAll('.opt').forEach(x=>x.classList.remove('right','wrong'));
        d.querySelectorAll('.opt')[q.a].classList.add('right');if(j!==q.a)b.classList.add('wrong');
        if(got[i]===null)got[i]=(j===q.a);
        const ex=d.querySelector('.exp');ex.innerHTML=(j===q.a?'<b class="ok">答對了！</b> ':'<b class="no">正確答案是 ('+'ABCD'[q.a]+')。</b> ')+q.e;ex.classList.add('show');
        tally();
      });
    });
    flt();tally();
  }
  function tally(){const d=got.filter(x=>x!==null).length,r=got.filter(x=>x).length;C.$(cfg.score).textContent=r+' / '+QZ.length;C.$(cfg.done).textContent='已作答 '+d+' 題'+(d===QZ.length?'，全部完成！錯的題目回到上面的重點再看一次。':'');}
  function flt(){box.querySelectorAll('.q').forEach(d=>d.style.display=(cur==='all'||d.dataset.u===cur)?'':'none');}
  if(cfg.filter)C.$(cfg.filter).querySelectorAll('.chip').forEach(b=>b.onclick=()=>{cur=b.dataset.u;C.$(cfg.filter).querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));flt();});
  C.$(cfg.reset).onclick=()=>{got.fill(null);build();};
  build();
  return QZ;
};

/* 互動 SVG 圖解：懸停聚光、點擊釘選、標籤連動、鎖定標記模式、回合制不重複測驗 */
C.figure=function(cfg){
  const svg=C.$(cfg.svg),out=C.$(cfg.out),parts=cfg.parts;let mode='learn',target=null,pinned=null,ok=0,tot=0,order=[],round=1,roundTotal=0,wrong=[];
  const els=k=>svg.querySelectorAll('[data-part="'+k+'"]');
  const isMarked=()=>(cfg.markBtns||[]).some(id=>{const b=C.$(id);return b&&b.classList.contains('on');});
  function clear(){
    svg.querySelectorAll('[data-part],[data-lbl]').forEach(e=>e.classList.remove('sel','good','bad','hl'));
    svg.classList.remove('dim','mark-lock');
    (cfg.markBtns||[]).forEach(id=>{const b=C.$(id);if(b)b.classList.remove('on');});
    if(cfg.modeBar)C.$(cfg.modeBar).querySelectorAll('.btn[data-m]').forEach(x=>x.classList.toggle('on',x.dataset.m===mode));
  }
  function hlPart(k){clear();svg.classList.add('dim');els(k).forEach(e=>e.classList.add('sel'));svg.querySelectorAll('[data-lbl="'+k+'"]').forEach(e=>e.classList.add('sel'));}
  function show(k){hlPart(k);const p=parts[k];if(p)out.innerHTML='<div class="pname">'+p.n+'</div><div>'+p.d+'</div>';}
  function startRound(){order=C.shuffle(Object.keys(parts).filter(k=>!parts[k].skip));roundTotal=order.length;ok=0;tot=0;wrong=[];nextQ();}
  function showSummary(){
    target=null;clear();
    const pct=roundTotal?Math.round(ok/roundTotal*100):0;
    const msg=wrong.length?'<div style="margin-top:4px">本回合需再複習：<b>'+wrong.join('、')+'</b></div>':'<div style="margin-top:4px;color:var(--moss)">全部答對，這一輪的重點都掌握了！</div>';
    out.innerHTML='<div class="pname" style="color:var(--moss)">第 '+round+' 回合完成！</div><div>本回合答對 <b>'+ok+' / '+roundTotal+'</b> 題（正確率 '+pct+'%）</div>'+msg+'<div class="bar" style="margin-top:10px"><button type="button" class="btn on fig-next">開始第 '+(round+1)+' 回合 →</button></div>';
    const nb=out.querySelector('.fig-next');nb.onclick=()=>{if(mode==='test'){round++;startRound();}};nb.focus({preventScroll:true});
  }
  function nextQ(){
    if(!order.length){showSummary();return;}
    target=order.pop();clear();
    out.innerHTML='<div class="small">第 '+round+' 回合・第 '+(tot+1)+' / '+roundTotal+' 題</div><div class="pname">請在圖上點出：<span class="hot">'+(parts[target].q||parts[target].n)+'</span></div><div class="small">本回合答對 '+ok+' / '+tot+'</div>';
  }
  svg.addEventListener('pointerover',ev=>{
    if(mode==='learn'){
      if(isMarked())return;
      const t=ev.target.closest('[data-part],[data-lbl]');if(!t)return;const k=t.dataset.part||t.dataset.lbl;
      if(k&&parts[k])show(k);
    }else if(mode==='test'&&target){
      const t=ev.target.closest('[data-part]');if(!t)return;const k=t.dataset.part;
      if(k&&parts[k]&&!parts[k].skip)hlPart(k);
    }
  });
  svg.addEventListener('pointerleave',()=>{
    if(mode==='learn'){
      if(isMarked())return;
      if(pinned&&parts[pinned]){show(pinned);return;}
      clear();out.innerHTML=cfg.hint||'移上或點選圖上的節點看說明。';
    }else if(mode==='test'&&target){clear();}
  });
  svg.addEventListener('click',ev=>{
    const t=ev.target.closest('[data-part],[data-lbl]');
    if(mode==='learn'){
      if(isMarked()&&cfg.lockMark)return;
      if(!t){pinned=null;if(isMarked())clear();else clear();out.innerHTML=cfg.hint||'移上或點選圖上的節點看說明。';return;}
      const k=t.dataset.part||t.dataset.lbl;if(k&&parts[k]){pinned=k;show(k);}
      return;
    }
    if(!t)return;const k=t.dataset.part||t.dataset.lbl;if(!k||!parts[k]||!target)return;
    if(parts[k].skip){out.innerHTML='<div class="small">第 '+round+' 回合・第 '+(tot+1)+' / '+roundTotal+' 題</div><div class="pname">請在圖上點出：<span class="hot">'+(parts[target].q||parts[target].n)+'</span></div><div class="small" style="color:var(--civ)">提示：「'+parts[k].n+'」是基準人物，請點選其他親屬節點！</div>';return;}
    tot++;
    if(k===target){ok++;clear();svg.classList.add('dim');els(k).forEach(e=>e.classList.add('good'));svg.querySelectorAll('[data-lbl="'+k+'"]').forEach(e=>e.classList.add('good'));out.innerHTML='<div class="pname" style="color:var(--moss)">答對了！這是'+parts[k].n+'</div><div>'+parts[k].d+'</div>';}
    else{wrong.push(parts[target].n);clear();svg.classList.add('dim');els(k).forEach(e=>e.classList.add('bad'));els(target).forEach(e=>e.classList.add('sel'));svg.querySelectorAll('[data-lbl="'+k+'"]').forEach(e=>e.classList.add('bad'));svg.querySelectorAll('[data-lbl="'+target+'"]').forEach(e=>e.classList.add('sel'));out.innerHTML='<div class="pname" style="color:var(--rose)">不對，你點的是'+parts[k].n+'。</div><div>亮起的地方才是<b>'+parts[target].n+'</b>：'+parts[target].d+'</div>';}
    target=null;
    const isLast=!order.length;
    out.innerHTML+='<div class="small">第 '+round+' 回合・進度 '+tot+' / '+roundTotal+'・答對 '+ok+' 題</div><div class="bar" style="margin-top:8px"><button type="button" class="btn on fig-next">'+(isLast?'查看本回合結果 →':'下一題 →')+'</button></div>';
    const nb=out.querySelector('.fig-next');nb.onclick=()=>{if(mode==='test')isLast?showSummary():nextQ();};nb.focus({preventScroll:true});
  });
  svg.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){const t=ev.target.closest('[data-part],[data-lbl]');if(t){ev.preventDefault();t.dispatchEvent(new MouseEvent('click',{bubbles:true}));}}});
  svg.querySelectorAll('[data-part]').forEach(e=>{e.setAttribute('tabindex','0');e.setAttribute('role','button');e.setAttribute('aria-label',parts[e.dataset.part]?parts[e.dataset.part].n:'');});
  function setMode(m){
    mode=m;pinned=null;if(cfg.modeBar)C.$(cfg.modeBar).querySelectorAll('.btn[data-m]').forEach(x=>x.classList.toggle('on',x.dataset.m===m));
    svg.classList.toggle('testing',mode==='test');
    if(mode==='test'){round=1;startRound();}else{target=null;clear();out.innerHTML=cfg.hint||'移上或點選圖上的節點看說明。';}
  }
  function markGroup(btnId,keys,html){
    if(mode==='test'){mode='learn';svg.classList.remove('testing');target=null;}
    pinned=null;clear();
    if(cfg.modeBar)C.$(cfg.modeBar).querySelectorAll('.btn[data-m]').forEach(x=>x.classList.remove('on'));
    const b=C.$(btnId);if(b)b.classList.add('on');
    C.mark(cfg.svg,keys);
    if(cfg.lockMark)svg.classList.add('mark-lock');
    out.innerHTML=html;
  }
  if(cfg.modeBar)C.$(cfg.modeBar).querySelectorAll('.btn[data-m]').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
  out.innerHTML=cfg.hint||'移上或點選圖上的節點看說明。';
  return {show,setMode,clear,markGroup};
};

C.mark=function(svgId,keys){
  const s=C.$(svgId);
  s.querySelectorAll('[data-part],[data-lbl]').forEach(e=>{
    e.classList.remove('sel','good','bad','hl');
    const k=e.dataset.part||e.dataset.lbl;
    if(keys.includes(k))e.classList.add('hl');
  });
  s.classList.add('dim');
};

/* 回合制分類挑戰：C.classify({meta, qbox, bar, out, choices:[{k,t}], items:[{q,a,e,tag}]}) */
C.classify=function(cfg){
  const meta=C.$(cfg.meta),qbox=C.$(cfg.qbox),bar=C.$(cfg.bar),out=C.$(cfg.out);
  const choices=cfg.choices,items=cfg.items;
  let round=1,order=[],cur=null,ok=0,tot=0,wrong=[],locked=false;
  const labelOf=k=>{const c=choices.find(x=>x.k===k);return c?c.t:k;};
  function startRound(){order=C.shuffle(items.map((_,i)=>i));ok=0;tot=0;wrong=[];next();}
  function showSummary(){
    cur=null;locked=true;
    const pct=items.length?Math.round(ok/items.length*100):0;
    meta.innerHTML='<span>第 '+round+' 回合結算</span><span>答對 <b>'+ok+' / '+items.length+'</b>（'+pct+'%）</span>';
    qbox.innerHTML=wrong.length?'本回合完成！再複習一下這幾個容易搞混的情境：':'太棒了！本回合 '+items.length+' 題全部答對！';
    bar.innerHTML='<button type="button" class="btn on" id="'+cfg.bar+'_next">開始第 '+(round+1)+' 回合 →</button>';
    out.innerHTML=wrong.length?'<ul style="margin:4px 0 0">'+wrong.map(w=>'<li>'+w+'</li>').join('')+'</ul>':'<p style="margin:4px 0 0;color:var(--moss)"><b>全部掌握！</b>可以直接往下做小測驗檢驗實力。</p>';
    C.$(cfg.bar+'_next').onclick=()=>{round++;startRound();};
  }
  function next(){
    if(!order.length){showSummary();return;}
    cur=items[order.pop()];locked=false;
    meta.innerHTML='<span>第 '+round+' 回合・第 <b>'+(tot+1)+' / '+items.length+'</b> 題</span><span>目前答對 <b>'+ok+' / '+tot+'</b></span>';
    qbox.innerHTML=cur.q;
    bar.innerHTML=choices.map(c=>'<button type="button" class="btn" data-k="'+c.k+'">'+c.t+'</button>').join('');
    out.innerHTML='<span class="small">請點選最符合的分類。</span>';
    bar.querySelectorAll('.btn').forEach(b=>b.onclick=()=>pick(b.dataset.k,b));
  }
  function pick(k,btn){
    if(locked||!cur)return;
    locked=true;tot++;
    bar.querySelectorAll('.btn').forEach(x=>{x.disabled=true;if(x.dataset.k===cur.a)x.classList.add('right');});
    if(k===cur.a){
      ok++;
      out.innerHTML='<div style="color:var(--moss);font-weight:700">答對了！答案是「'+labelOf(cur.a)+'」</div><div>'+cur.e+'</div>';
    }else{
      btn.classList.add('wrong');
      wrong.push('<b>'+cur.tag+'</b> → 正解：<b>'+labelOf(cur.a)+'</b>（'+cur.e+'）');
      out.innerHTML='<div style="color:var(--rose);font-weight:700">不對喔！正確答案是「'+labelOf(cur.a)+'」</div><div>'+cur.e+'</div>';
    }
    const isLast=!order.length;
    out.innerHTML+='<div class="bar" style="margin-top:8px"><button type="button" class="btn on cl-next">'+(isLast?'查看本回合結果 →':'下一題 →')+'</button></div>';
    const nb=out.querySelector('.cl-next');nb.onclick=()=>isLast?showSummary():next();nb.focus({preventScroll:true});
  }
  startRound();
};

/* 排順序：items=[{t:文字}]（正確順序） */
C.order=function(cfg){
  const pool=C.$(cfg.pool),ans=C.$(cfg.ans),out=C.$(cfg.out),items=cfg.items;let picked=[];
  function render(){
    const rest=items.map((_,i)=>i).filter(i=>!picked.includes(i));
    pool.innerHTML=C.shuffle(rest).map(i=>'<button class="ocard" data-i="'+i+'">'+items[i].t+'</button>').join('')||'<span class="small">全部排好了</span>';
    ans.innerHTML=picked.map((i,k)=>'<div class="ostep"><b class="ono">'+(k+1)+'</b><span class="otxt">'+items[i].t+'</span></div>').join('')||'<span class="small">依正確順序點選上面的步驟卡片</span>';
    pool.querySelectorAll('.ocard').forEach(b=>b.onclick=()=>{picked.push(+b.dataset.i);render();if(picked.length===items.length)check();});
  }
  function check(){
    const wrong=picked.findIndex((v,k)=>v!==k);
    ans.querySelectorAll('.ostep').forEach((d,k)=>d.classList.add(picked[k]===k?'good':'bad'));
    out.innerHTML=wrong<0?'<b style="color:var(--moss)">全部正確！</b> '+(cfg.done||''):'<b style="color:var(--rose)">第 '+(wrong+1)+' 步開始不對。</b> 正確順序：'+items.map((x,k)=>(k+1)+'. '+x.t.replace(/<[^>]+>/g,'')).join('　');
  }
  C.$(cfg.reset).onclick=()=>{picked=[];out.innerHTML='';render();};
  render();
};

/* 互動心智圖：C.mindmap({stage, detail, data}) */
C.mindmap=function(cfg){
  const stage=C.$(cfg.stage),detail=C.$(cfg.detail),m=cfg.data;
  const PAL={
    civ:{bg:'#faece3',bd:'#a8572f',tx:'#7a3717',sub:'#5d3c2b'},
    moss:{bg:'#e5f0e2',bd:'#3f7a4f',tx:'#204e2d',sub:'#365440'},
    sea:{bg:'#e2eef7',bd:'#2d6f9e',tx:'#1a496b',sub:'#2f526b'},
    plum:{bg:'#efe9f6',bd:'#6a4c93',tx:'#462c6b',sub:'#4e3d66'},
    sun:{bg:'#f8eed2',bd:'#b98516',tx:'#7a5406',sub:'#5e4718'},
    rose:{bg:'#f7e3e6',bd:'#a33a4a',tx:'#7a1f2e',sub:'#612c36'}
  };
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const W=940,leafH=44,leafGap=10,groupGap=24;
  function calcSide(groups){
    let tot=0;groups.forEach(g=>tot+=g.leaves.length);
    return tot*leafH+(tot-groups.length)*leafGap+(groups.length-1)*groupGap;
  }
  const lh=calcSide(m.left),rh=calcSide(m.right),H=Math.max(lh,rh)+52,cx=W/2,cy=H/2;
  const nodesMap={center:{title:m.center.title+m.center.sub,desc:m.center.desc,group:null,color:'civ'}};
  const paths=[],nodes=[];
  function drawSide(groups,dir){
    let y=(H-(dir<0?lh:rh))/2;
    const gW=148,gH=42,lW=188,gx=dir<0?cx-182-gW/2:cx+182-gW/2,lx=dir<0?16:W-16-lW;
    groups.forEach(g=>{
      const pal=PAL[g.color]||PAL.civ,lcs=[];
      g.leaves.forEach(()=>{lcs.push(y+leafH/2);y+=leafH+leafGap;});
      const gCy=(lcs[0]+lcs[lcs.length-1])/2;
      const gIn=dir<0?gx+gW:gx,gOut=dir<0?gx:gx+gW,cA=dir<0?cx-72:cx+72,m1=(cA+gIn)/2;
      paths.push('<path class="mm-branch" data-grp="'+g.id+'" d="M'+cA+','+cy+' C'+m1+','+cy+' '+m1+','+gCy+' '+gIn+','+gCy+'" fill="none" stroke="'+pal.bd+'" stroke-width="2.4" stroke-opacity=".75"/>');
      g.leaves.forEach((lf,idx)=>{
        const lCy=lcs[idx],lA=dir<0?lx+lW:lx,m2=(gOut+lA)/2;
        paths.push('<path class="mm-branch" data-grp="'+g.id+'" data-leaf="'+lf.id+'" d="M'+gOut+','+gCy+' C'+m2+','+gCy+' '+m2+','+lCy+' '+lA+','+lCy+'" fill="none" stroke="'+pal.bd+'" stroke-width="1.8" stroke-opacity=".6"/>');
        nodesMap[lf.id]={title:lf.title,desc:lf.desc,group:g.id,color:g.color};
        nodes.push('<g class="mm-node" data-id="'+lf.id+'" data-grp="'+g.id+'" tabindex="0" role="button" aria-label="'+esc(lf.title)+'">'+
          '<rect x="'+lx+'" y="'+(lCy-leafH/2)+'" width="'+lW+'" height="'+leafH+'" rx="9" fill="#fffdf8" stroke="'+pal.bd+'" stroke-width="1.5"/>'+
          '<text x="'+(lx+lW/2)+'" y="'+(lCy-3)+'" text-anchor="middle" font-size="12.5" font-weight="700" fill="'+pal.tx+'">'+esc(lf.title)+'</text>'+
          '<text class="mm-leaf-sub" x="'+(lx+lW/2)+'" y="'+(lCy+14)+'" text-anchor="middle" font-size="10.8" fill="'+pal.sub+'">'+esc(lf.sub)+'</text>'+
          '<text class="mm-leaf-mask" x="'+(lx+lW/2)+'" y="'+(lCy+14)+'" text-anchor="middle" font-size="10.5" font-weight="700" fill="'+pal.bd+'">點此揭曉重點？</text></g>');
      });
      nodesMap[g.id]={title:g.title,desc:g.desc,group:g.id,color:g.color};
      nodes.push('<g class="mm-node" data-id="'+g.id+'" data-grp="'+g.id+'" tabindex="0" role="button" aria-label="'+esc(g.title)+'">'+
        '<rect x="'+gx+'" y="'+(gCy-gH/2)+'" width="'+gW+'" height="'+gH+'" rx="11" fill="'+pal.bg+'" stroke="'+pal.bd+'" stroke-width="2"/>'+
        '<text x="'+(gx+gW/2)+'" y="'+(gCy+5)+'" text-anchor="middle" font-size="13.5" font-weight="700" fill="'+pal.tx+'">'+esc(g.title)+'</text></g>');
      y+=groupGap-leafGap;
    });
  }
  drawSide(m.left,-1);drawSide(m.right,1);
  const cNode='<g class="mm-node center-node" data-id="center" tabindex="0" role="button" aria-label="'+esc(m.center.title+m.center.sub)+'">'+
    '<rect x="'+(cx-72)+'" y="'+(cy-32)+'" width="144" height="64" rx="16" fill="#a8572f" stroke="#7a3717" stroke-width="2.4"/>'+
    '<text x="'+cx+'" y="'+(cy-5)+'" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">'+esc(m.center.title)+'</text>'+
    '<text x="'+cx+'" y="'+(cy+16)+'" text-anchor="middle" font-size="14" font-weight="700" fill="#fde8d7">'+esc(m.center.sub)+'</text></g>';
  stage.innerHTML='<svg class="mm-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(m.aria||m.center.title+m.center.sub+'互動心智圖')+'" xmlns="http://www.w3.org/2000/svg">'+paths.join('')+nodes.join('')+cNode+'</svg>';
  const svg=stage.querySelector('svg');let pinned=null,recall=false;
  function showDetail(id){
    const info=nodesMap[id]||nodesMap.center,col=(PAL[info.color]||PAL.civ).bd;
    detail.innerHTML='<div class="mm-dtitle"><span class="mm-dot" style="background:'+col+'"></span><span>'+info.title+'</span></div><div>'+info.desc+'</div>';
  }
  function hl(id){
    svg.querySelectorAll('.mm-node,.mm-branch').forEach(e=>e.classList.remove('active'));
    if(!id||id==='center'){svg.classList.remove('dim');showDetail('center');return;}
    const info=nodesMap[id];if(!info)return;
    svg.classList.add('dim');
    const tn=svg.querySelector('.mm-node[data-id="'+id+'"]');if(tn)tn.classList.add('active');
    if(info.group===id){
      svg.querySelectorAll('.mm-node[data-grp="'+id+'"],.mm-branch[data-grp="'+id+'"]').forEach(e=>e.classList.add('active'));
    }else if(info.group){
      svg.querySelectorAll('.mm-node[data-id="'+info.group+'"],.mm-branch[data-grp="'+info.group+'"]:not([data-leaf]),.mm-branch[data-leaf="'+id+'"]').forEach(e=>e.classList.add('active'));
    }
    showDetail(id);
  }
  svg.addEventListener('pointerover',ev=>{if(pinned)return;const n=ev.target.closest('.mm-node');if(n)hl(n.dataset.id);});
  svg.addEventListener('pointerleave',()=>{if(!pinned)hl('center');});
  svg.addEventListener('click',ev=>{
    const n=ev.target.closest('.mm-node');
    if(!n||n.dataset.id==='center'){pinned=null;hl('center');return;}
    if(recall)n.classList.add('revealed');
    pinned=(pinned===n.dataset.id)?null:n.dataset.id;
    hl(pinned||'center');
  });
  svg.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){const n=ev.target.closest('.mm-node');if(n){ev.preventDefault();n.dispatchEvent(new MouseEvent('click',{bubbles:true}));}}});
  showDetail('center');
  return {
    setRecall(on){recall=!!on;svg.classList.toggle('recall',recall);if(!recall)svg.querySelectorAll('.revealed').forEach(e=>e.classList.remove('revealed'));},
    reset(){pinned=null;hl('center');svg.querySelectorAll('.revealed').forEach(e=>e.classList.remove('revealed'));}
  };
};

window.C=C;
})();
