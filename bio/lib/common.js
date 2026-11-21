/* 國七上生物・第二次段考（南一版 2-1～3-3）互動教材：共用程式（導覽列、頁尾、上下頁、嵌入模式、小測驗） */
(function(){
'use strict';
const NAV=[
  ['index.html','生物首頁'],
  ['nutrients.html','2-1・2-2 養分與酵素'],
  ['photosynthesis.html','2-3 光合作用'],
  ['digestion.html','2-4 消化'],
  ['transport.html','3-1 植物的運輸'],
  ['circulation.html','3-2 循環'],
  ['defense.html','3-3 防禦']
];
const qs=new URLSearchParams(location.search);
const EMBED=qs.has('embed');
if(EMBED)document.documentElement.classList.add('embed');
const here=(location.pathname.split('/').pop()||'index.html');

function withEmbed(href){
  if(!EMBED||!/\.html(#.*)?$/.test(href)||/^https?:/.test(href))return href;
  const [p,h]=href.split('#');return p+'?embed=1'+(h?'#'+h:'');
}

/* 頁尾版本資訊：和首頁（根目錄 index.html）同樣的格式；version.json 由部署流程產生，放在網站根目錄 */
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
    head.className='site-head bio';
    head.innerHTML='<div class="wrap"><a class="home" href="../index.html" title="回到伴讀書僮首頁">← 伴讀書僮</a><a class="brand" href="index.html">生物互動實驗室<small>國七上・第二次段考<span style="color:#f5c84c;font-weight:700">（南一版）</span></small></a><nav class="nav">'+
      NAV.map(([h,t])=>'<a href="'+h+'"'+(h===here?' class="on" aria-current="page"':'')+'>'+t+'</a>').join('')+'</nav></div>';
  }
  const foot=document.getElementById('site-foot');
  if(foot){
    foot.className='site-foot';
    foot.innerHTML='<div class="wrap"><span>伴讀書僮・自編複習教材</span><span class="ver" title="版本以 git tag 為主；括號內為 commit ID 前六碼">版本資訊讀取中…</span><span class="foot-note" style="flex-basis:100%;font-size:12px">自編複習教材，依 108 課綱國中自然科學第一冊（南一版）生物 2-1～3-3 範圍編寫，非出版社或學校官方資料。示意圖為簡化繪製，比例與顏色不代表實際情形。</span></div>';
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
  /* 被 iframe 嵌入時，把頁面高度告訴外層網頁 */
  if(window.parent!==window){
    let last=0;const send=()=>{const h=Math.ceil(document.documentElement.scrollHeight);if(Math.abs(h-last)>4){last=h;try{window.parent.postMessage({type:'g3-height',h:h,page:here},'*');}catch(e){}}};
    if(window.ResizeObserver)new ResizeObserver(send).observe(document.body);window.addEventListener('load',send);setTimeout(send,800);
  }
});

/* ---------- 生物頁共用小工具 ---------- */
const B={};
B.$=id=>document.getElementById(id);
/* 洗牌（不改原陣列） */
B.shuffle=function(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

/* 小測驗：B.quiz({box, score, done, reset, filter, data, names})
   data: [{u:重點編號, s:題幹 HTML, o:[選項 HTML...], a:正確選項索引, e:解析 HTML}]
   第一次選的答案才計分；選了立即顯示解析 */
B.quiz=function(cfg){
  const box=B.$(cfg.box),QZ=cfg.data,names=cfg.names||{};let cur='all';const got=new Array(QZ.length).fill(null);
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
  function tally(){const d=got.filter(x=>x!==null).length,r=got.filter(x=>x).length;B.$(cfg.score).textContent=r+' / '+QZ.length;B.$(cfg.done).textContent='已作答 '+d+' 題'+(d===QZ.length?'，全部完成！錯的題目回到上面的重點再看一次。':'');}
  function flt(){box.querySelectorAll('.q').forEach(d=>d.style.display=(cur==='all'||d.dataset.u===cur)?'':'none');}
  if(cfg.filter)B.$(cfg.filter).querySelectorAll('.chip').forEach(b=>b.onclick=()=>{cur=b.dataset.u;B.$(cfg.filter).querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));flt();});
  B.$(cfg.reset).onclick=()=>{got.fill(null);build();};
  build();
  return QZ;
};

/* 點選圖上的部位：svg 內有 [data-part] 的元素；parts={key:{n:名稱,d:說明 HTML}}
   模式：learn（點了看說明）／test（題目給名稱，點出位置） */
B.figure=function(cfg){
  const svg=B.$(cfg.svg),out=B.$(cfg.out),parts=cfg.parts;let mode='learn',target=null,ok=0,tot=0,order=[];
  const els=k=>svg.querySelectorAll('[data-part="'+k+'"]');
  function clear(){svg.querySelectorAll('[data-part]').forEach(e=>e.classList.remove('sel','good','bad','hl'));svg.classList.remove('dim');(cfg.markBtns||[]).forEach(id=>{const b=B.$(id);if(b)b.classList.remove('on');});}
  function show(k){clear();els(k).forEach(e=>e.classList.add('sel'));const p=parts[k];out.innerHTML='<div class="pname">'+p.n+'</div><div>'+p.d+'</div>';}
  function nextQ(){
    if(!order.length)order=B.shuffle(Object.keys(parts).filter(k=>!parts[k].skip));
    target=order.pop();clear();
    out.innerHTML='<div class="pname">請在圖上點出：<span class="hot">'+parts[target].n+'</span></div><div class="small">答對 '+ok+' / '+tot+'</div>';
  }
  svg.addEventListener('click',ev=>{
    const t=ev.target.closest('[data-part]');if(!t)return;const k=t.dataset.part;
    if(mode==='learn'){show(k);return;}
    if(!target)return;
    tot++;
    /* 答完先停在解說，按「下一題」才換題（不自動消失） */
    if(k===target){ok++;clear();els(k).forEach(e=>e.classList.add('good'));out.innerHTML='<div class="pname" style="color:var(--moss)">答對了！這是'+parts[k].n+'</div><div>'+parts[k].d+'</div>';}
    else{clear();els(k).forEach(e=>e.classList.add('bad'));els(target).forEach(e=>e.classList.add('sel'));out.innerHTML='<div class="pname" style="color:var(--rose)">不對，你點的是'+parts[k].n+'。</div><div>閃爍的地方才是<b>'+parts[target].n+'</b>：'+parts[target].d+'</div>';}
    target=null;
    out.innerHTML+='<div class="small">答對 '+ok+' / '+tot+'</div><div class="bar" style="margin-top:8px"><button type="button" class="btn on fig-next">下一題 →</button></div>';
    const nb=out.querySelector('.fig-next');nb.onclick=()=>{if(mode==='test')nextQ();};nb.focus({preventScroll:true});
  });
  svg.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){const t=ev.target.closest('[data-part]');if(t){ev.preventDefault();t.dispatchEvent(new MouseEvent('click',{bubbles:true}));}}});
  svg.querySelectorAll('[data-part]').forEach(e=>{e.setAttribute('tabindex','0');e.setAttribute('role','button');e.setAttribute('aria-label',parts[e.dataset.part]?parts[e.dataset.part].n:'');});
  function setMode(m){mode=m;if(cfg.modeBar)B.$(cfg.modeBar).querySelectorAll('.btn[data-m]').forEach(x=>x.classList.toggle('on',x.dataset.m===m));
    svg.classList.toggle('testing',mode==='test');
    if(mode==='test'){ok=0;tot=0;order=[];nextQ();}else{target=null;clear();out.innerHTML=cfg.hint||'點圖上的部位，看名稱和功能。';}}
  if(cfg.modeBar)B.$(cfg.modeBar).querySelectorAll('.btn[data-m]').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
  out.innerHTML=cfg.hint||'點圖上的部位，看名稱和功能。';
  return {show,setMode,clear};
};

/* 標出一組部位：其他部位變淡（svg 加 dim），指定的部位加 hl；B.figure 的 clear() 會還原 */
B.mark=function(svgId,keys){const s=B.$(svgId);s.querySelectorAll('[data-part]').forEach(e=>{e.classList.remove('sel','good','bad','hl');if(keys.includes(e.dataset.part))e.classList.add('hl');});s.classList.add('dim');};

/* 排順序：items=[{t:文字}]（正確順序），把打散的卡片依序點選 */
B.order=function(cfg){
  const pool=B.$(cfg.pool),ans=B.$(cfg.ans),out=B.$(cfg.out),items=cfg.items;let picked=[];
  function render(){
    const rest=items.map((x,i)=>i).filter(i=>!picked.includes(i));
    pool.innerHTML=B.shuffle(rest).map(i=>'<button class="ocard" data-i="'+i+'">'+items[i].t+'</button>').join('')||'<span class="small">全部排好了</span>';
    ans.innerHTML=picked.map((i,k)=>'<div class="ostep"><b>'+(k+1)+'</b>'+items[i].t+'</div>').join('')||'<span class="small">依順序點上面的卡片</span>';
    pool.querySelectorAll('.ocard').forEach(b=>b.onclick=()=>{picked.push(+b.dataset.i);render();if(picked.length===items.length)check();});
  }
  function check(){
    const wrong=picked.findIndex((v,k)=>v!==k);
    ans.querySelectorAll('.ostep').forEach((d,k)=>d.classList.add(picked[k]===k?'good':'bad'));
    out.innerHTML=wrong<0?'<b style="color:var(--moss)">全部正確！</b> '+(cfg.done||''):'<b style="color:var(--rose)">第 '+(wrong+1)+' 步開始不對。</b> 正確順序：'+items.map((x,k)=>(k+1)+'. '+x.t.replace(/<[^>]+>/g,'')).join('　');
  }
  B.$(cfg.reset).onclick=()=>{picked=[];out.innerHTML='';render();};
  render();
};
window.B=B;
})();
