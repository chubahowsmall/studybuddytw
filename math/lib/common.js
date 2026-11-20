/* 國七上數學・第二次段考（康軒版第 2 章）互動教材：共用程式（導覽列、頁尾、上下頁、嵌入模式） */
(function(){
'use strict';
const NAV=[
  ['index.html','數學首頁'],
  ['factors.html','2-1 因數與倍數'],
  ['gcd-lcm.html','2-2 最大公因數與最小公倍數'],
  ['fractions.html','2-3 分數的四則運算'],
  ['exponents.html','2-4 指數律']
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
    head.innerHTML='<div class="wrap"><a class="home" href="../index.html" title="回到伴讀書僮首頁">← 伴讀書僮</a><a class="brand" href="index.html">數學互動教室<small>國七上・第二次段考<span style="color:#f5c84c;font-weight:700">（康軒版）</span></small></a><nav class="nav">'+
      NAV.map(([h,t])=>'<a href="'+h+'"'+(h===here?' class="on" aria-current="page"':'')+'>'+t+'</a>').join('')+'</nav></div>';
  }
  const foot=document.getElementById('site-foot');
  if(foot){
    foot.className='site-foot';
    foot.innerHTML='<div class="wrap">自編複習教材，依 108 課綱國中數學第一冊（康軒版）第 2 章範圍編寫，非出版社或學校官方資料。</div>';
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

/* ---------- 數學小工具 ---------- */
const M={};
/* 質因數分解：回傳 [[質數, 指數], ...]，由小到大 */
M.factorize=function(n){const out=[];let p=2;while(p*p<=n){let e=0;while(n%p===0){n/=p;e++;}if(e)out.push([p,e]);p+=(p===2?1:2);}if(n>1)out.push([n,1]);return out;};
/* 正因數，由小到大 */
M.divisors=function(n){const s=[],b=[];for(let d=1;d*d<=n;d++){if(n%d===0){s.push(d);if(d*d!==n)b.unshift(n/d);}}return s.concat(b);};
M.isPrime=function(n){if(n<2)return false;for(let p=2;p*p<=n;p++)if(n%p===0)return false;return true;};
/* 標準分解式 HTML，例如 2<sup>3</sup>×3<sup>2</sup>×5 */
M.std=function(f){return f.map(([p,e])=>p+(e>1?'<sup>'+e+'</sup>':'')).join('×');};
/* 讀取輸入框的正整數，超出範圍回傳 null */
M.readInt=function(el,min,max){const v=String(el.value).trim().replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));if(!/^\d+$/.test(v))return null;const n=+v;return(n>=min&&n<=max)?n:null;};
/* 最大公因數、最小公倍數（兩數；多數用 reduce） */
M.gcd=function(a,b){a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t;}return a;};
M.lcm=function(a,b){return a/M.gcd(a,b)*b;};
M.gcdAll=function(arr){return arr.reduce((x,y)=>M.gcd(x,y));};
M.lcmAll=function(arr){return arr.reduce((x,y)=>M.lcm(x,y));};
/* 讀取「18, 24, 60」這種用逗號、頓號或空白分開的正整數；個數或範圍不對回傳 null */
M.readList=function(el,min,max,kmin,kmax){const v=String(el.value).trim().replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));if(!v)return null;const parts=v.split(/[\s,，、;；]+/).filter(Boolean);if(parts.length<kmin||parts.length>kmax)return null;const out=[];for(const t of parts){if(!/^\d+$/.test(t))return null;const n=+t;if(n<min||n>max)return null;out.push(n);}return out;};
window.M=M;
})();
