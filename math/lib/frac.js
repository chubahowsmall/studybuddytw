/* 數學互動教室：分數運算與「一步一步算」引擎（2-3 分數的四則運算、2-4 指數律共用） */
(function(){
'use strict';
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t;}return a;};
const lcm=(a,b)=>a/gcd(a,b)*b;

/* ---------- 分數 ---------- */
function F(n,d){
  if(d===undefined)d=1;
  if(d===0)throw new Error('分母不能是 0');
  if(d<0){n=-n;d=-d;}
  const g=gcd(n,d)||1;
  return {n:n/g,d:d/g};
}
F.add=(a,b)=>F(a.n*b.d+b.n*a.d,a.d*b.d);
F.sub=(a,b)=>F(a.n*b.d-b.n*a.d,a.d*b.d);
F.mul=(a,b)=>F(a.n*b.n,a.d*b.d);
F.div=(a,b)=>{if(b.n===0)throw new Error('不能除以 0');return F(a.n*b.d,a.d*b.n);};
F.neg=a=>F(-a.n,a.d);
F.abs=a=>F(Math.abs(a.n),a.d);
F.inv=a=>{if(a.n===0)throw new Error('0 沒有倒數');return F(a.d,a.n);};
F.pow=(a,k)=>{if(k===0){if(a.n===0)throw new Error('0 的 0 次方沒有意義');return F(1);}
  if(k<0)return F.pow(F.inv(a),-k);
  let n=1,d=1;for(let i=0;i<k;i++){n*=a.n;d*=a.d;}
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d))throw new Error('數字太大了');return F(n,d);};
F.cmp=(a,b)=>a.n*b.d-b.n*a.d;
F.eq=(a,b)=>a.n===b.n&&a.d===b.d;
F.val=a=>a.n/a.d;
F.isInt=a=>a.d===1;
const MINUS='−';
const sgn=n=>n<0?MINUS:'';
/* 分數 HTML（上下排），可指定不約分的分子分母 */
F.html=function(a,opt){opt=opt||{};
  const n=opt.n!==undefined?opt.n:a.n,d=opt.d!==undefined?opt.d:a.d;
  if(d===1)return sgn(n)+Math.abs(n);
  return sgn(n)+'<span class="frac"><span>'+Math.abs(n)+'</span><span>'+d+'</span></span>';};
/* 帶分數 HTML */
F.mixed=function(a){
  if(a.d===1||Math.abs(a.n)<a.d)return F.html(a);
  const w=Math.trunc(Math.abs(a.n)/a.d),r=Math.abs(a.n)%a.d;
  return sgn(a.n)+w+'<span class="frac"><span>'+r+'</span><span>'+a.d+'</span></span>';};
F.text=a=>a.d===1?String(a.n).replace('-',MINUS):(sgn(a.n)+Math.abs(a.n)+'/'+a.d);

/* 讀一個數：整數、分數 3/4、帶分數「2 1/3」或「2又1/3」、小數 0.75，可以有負號 */
function normalize(s){
  return String(s).trim()
    .replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248))
    .replace(/[－—–−﹣]/g,'-').replace(/[＋]/g,'+').replace(/[／]/g,'/').replace(/[．]/g,'.')
    .replace(/[（]/g,'(').replace(/[）]/g,')').replace(/[［]/g,'[').replace(/[］]/g,']').replace(/[｜]/g,'|').replace(/[＾]/g,'^')
    .replace(/又/g,' ').replace(/[＊*xX]/g,'×').replace(/[:：]/g,'÷');
}
function parseNum(s){
  s=normalize(s).replace(/\s+/g,' ');
  let m;
  if((m=s.match(/^([+-]?)\s*(\d+) (\d+)\/(\d+)$/))){const w=+m[2],n=+m[3],d=+m[4];if(d===0)return null;const v=F(w*d+n,d);return {v:m[1]==='-'?F.neg(v):v,kind:'mixed',w,n,d,neg:m[1]==='-'};}
  if((m=s.match(/^([+-]?)\s*(\d+)\/(\d+)$/))){const n=+m[2],d=+m[3];if(d===0)return null;const v=F(n,d);return {v:m[1]==='-'?F.neg(v):v,kind:'frac',n,d,neg:m[1]==='-'};}
  if((m=s.match(/^([+-]?)\s*(\d*)\.(\d+)$/))){const k=m[3].length,n=+(m[2]+m[3]),d=Math.pow(10,k);const v=F(n,d);return {v:m[1]==='-'?F.neg(v):v,kind:'dec',src:(m[1]==='-'?'-':'')+(m[2]||'0')+'.'+m[3],raw:{n,d},neg:m[1]==='-'};}
  if((m=s.match(/^([+-]?)\s*(\d+)$/))){const v=F(+m[2]);return {v:m[1]==='-'?F.neg(v):v,kind:'int',neg:m[1]==='-'};}
  return null;
}

/* ---------- 運算式：解析 ---------- */
/* 節點：num{v,kind,lit}、bin{op:+ - × ÷,a,b}、neg{a}、par{a,br}、abs{a}、pow{a,k} */
let uid=0;
function tokenize(src){
  const s=normalize(src);const T=[];let i=0;
  while(i<s.length){
    const c=s[i];
    if(c===' '){i++;continue;}
    if(/\d|\./.test(c)){
      /* 數字字面：帶分數「2 1/3」、分數「3/4」、小數、整數 */
      let m=s.slice(i).match(/^(\d+) (\d+)\/(\d+)/)||s.slice(i).match(/^(\d+)\/(\d+)/)||s.slice(i).match(/^\d*\.\d+/)||s.slice(i).match(/^\d+/);
      const t=m[0];T.push({t:'num',s:t});i+=t.length;continue;
    }
    if('+-×÷()[]|^'.includes(c)){T.push({t:c});i++;continue;}
    throw new Error('看不懂的符號「'+c+'」');
  }
  return T;
}
function parse(src){
  const T=tokenize(src);let p=0;const absStack=[];
  const peek=()=>T[p],eat=t=>{if(!T[p]||T[p].t!==t)throw new Error('少了「'+t+'」');p++;};
  function expr(){let a=term();while(peek()&&(peek().t==='+'||peek().t==='-')){const op=T[p++].t;const b=term();a={t:'bin',op:op==='-'?'−':'+',a,b,id:++uid};}return a;}
  function term(){let a=unary();while(peek()&&(peek().t==='×'||peek().t==='÷')){const op=T[p++].t;const b=unary();a={t:'bin',op,a,b,id:++uid};}return a;}
  function unary(){
    if(peek()&&peek().t==='-'){p++;const a=unary();
      if(a.t==='num'&&!a.neg&&!a.wrapped){const r=Object.assign({},a,{v:F.neg(a.v),neg:true});return r;}
      return {t:'neg',a,id:++uid};}
    if(peek()&&peek().t==='+'){p++;return unary();}
    return power();
  }
  function power(){
    const a=atom();
    if(peek()&&peek().t==='^'){p++;let neg=false;let k;
      if(peek()&&peek().t==='('){p++;if(peek()&&peek().t==='-'){p++;neg=true;}const n=peek();if(!n||n.t!=='num'||!/^\d+$/.test(n.s))throw new Error('次方要是整數');p++;eat(')');k=+n.s;}
      else{const n=peek();if(!n||n.t!=='num'||!/^\d+$/.test(n.s))throw new Error('次方要是整數，例如 2^3');p++;k=+n.s;}
      if(neg)k=-k;
      if(a.t==='num'&&(a.neg||a.kind==='frac'||a.kind==='mixed'))throw new Error('負數、分數的次方要加括號，例如 (−2)^3、(2/3)^2');
      return {t:'pow',a,k,id:++uid};}
    return a;
  }
  function atom(){
    const t=peek();if(!t)throw new Error('算式不完整');
    if(t.t==='num'){p++;const r=parseNum(t.s);if(!r)throw new Error('看不懂「'+t.s+'」');return Object.assign({t:'num',lit:t.s,id:++uid},r);}
    if(t.t==='('||t.t==='['){p++;const a=expr();eat(t.t==='('?')':']');return {t:'par',a,br:t.t,id:++uid};}
    if(t.t==='|'){p++;const a=expr();eat('|');return {t:'abs',a,id:++uid};}
    throw new Error('「'+t.t+'」的位置不對');
  }
  const r=expr();if(p<T.length)throw new Error('「'+T[p].t+'」的位置不對');
  return r;
}

/* ---------- 運算式：顯示 ---------- */
function numHTML(nd,first){
  let h;
  if(nd.kind==='mixed'&&!nd.conv)h=(nd.neg?MINUS:'')+nd.w+'<span class="frac"><span>'+nd.n+'</span><span>'+nd.d+'</span></span>';
  else if(nd.kind==='dec'&&!nd.conv)h=nd.src.replace('-',MINUS);
  else if(nd.show)h=F.html(nd.v,nd.show);
  else h=F.html(nd.v);
  const neg=nd.v.n<0;
  if(neg&&!first)h='('+h+')';
  return nd.hl?'<span class="hl">'+h+'</span>':h;
}
function render(nd,first){
  if(first===undefined)first=true;
  switch(nd.t){
    case 'num':return numHTML(nd,first);
    case 'bin':return render(nd.a,first)+' '+nd.op+' '+render(nd.b,false);
    case 'neg':return MINUS+render(nd.a,false);
    case 'par':return (nd.br==='['?'[':'(')+render(nd.a,true)+(nd.br==='['?']':')');
    case 'abs':return '|'+render(nd.a,true)+'|';
    case 'pow':{const A=nd.a;const wrap=A.t==='num'&&(A.v.n<0||A.v.d>1||(A.kind==='mixed'&&!A.conv)||(A.kind==='dec'&&!A.conv));
      const base=wrap?'('+numHTML(Object.assign({},A,{hl:false}),true)+')':render(A,first);
      const bh=wrap&&A.hl?'<span class="hl">'+base+'</span>':base;
      return bh+'<sup>'+String(nd.k).replace('-',MINUS)+'</sup>';}
  }
}

/* ---------- 運算式：一步一步算 ---------- */
function clone(nd){return JSON.parse(JSON.stringify(nd));}
function clearHL(nd){if(!nd||typeof nd!=='object')return;delete nd.hl;delete nd.show;['a','b'].forEach(k=>nd[k]&&clearHL(nd[k]));}
/* 找下一個要算的節點：括號越深越先、再看優先順序（次方 > 乘除 > 加減）、同級由左往右 */
function findNext(root){
  let best=null,order=0;
  (function walk(nd,depth,parent,key){
    if(!nd||nd.t==='num')return;
    const d2=depth+((nd.t==='par'||nd.t==='abs')?1:0);
    if(nd.t==='bin'){walk(nd.a,d2,nd,'a');walk(nd.b,d2,nd,'b');}else walk(nd.a,d2,nd,'a');
    const ready=nd.t==='bin'?(nd.a.t==='num'&&nd.b.t==='num'):nd.a.t==='num';
    if(!ready)return;
    const prec=nd.t==='par'?9:nd.t==='abs'?8:nd.t==='pow'?3:nd.t==='neg'?2.5:(nd.op==='×'||nd.op==='÷')?2:1;
    const o=order++;
    const cand={nd,depth:d2,prec,o,parent,key};
    if(!best||cand.depth>best.depth||(cand.depth===best.depth&&(cand.prec>best.prec||(cand.prec===best.prec&&cand.o<best.o))))best=cand;
  })(root,0,null,null);
  return best;
}
function replace(root,c,newNode){
  if(!c.parent)return newNode;
  c.parent[c.key]=newNode;return root;
}
const R=v=>({t:'num',v,kind:'f',id:++uid});
function steps(src){
  let root=parse(src);
  const out=[{html:render(root),note:'題目'}];
  /* 先把帶分數、小數化成假分數 */
  let conv=[];
  (function walk(nd){if(!nd)return;if(nd.t==='num'&&(nd.kind==='mixed'||nd.kind==='dec')){conv.push(nd.kind);}['a','b'].forEach(k=>nd[k]&&walk(nd[k]));})(root);
  if(conv.length){
    (function walk(nd){if(!nd)return;if(nd.t==='num'&&(nd.kind==='mixed'||nd.kind==='dec')){nd.conv=true;nd.hl=true;}['a','b'].forEach(k=>nd[k]&&walk(nd[k]));})(root);
    const parts=[];if(conv.includes('mixed'))parts.push('帶分數化成假分數');if(conv.includes('dec'))parts.push('小數化成分數');
    out.push({html:render(root),note:parts.join('、')+'（帶分數不能把整數和分數部分分開算）'});
    clearHL(root);
  }
  for(let guard=0;guard<60;guard++){
    if(root.t==='num')break;
    const c=findNext(root);if(!c)break;
    const nd=c.nd;let v,note,show=null;
    if(nd.t==='par'){
      /* 括號裡已經是一個數：拿掉括號，不算一步 */
      const nn=Object.assign({},nd.a);root=replace(root,c,nn);continue;
    }
    if(nd.t==='abs'){v=F.abs(nd.a.v);note='絕對值：|'+F.html(nd.a.v)+'|＝'+F.html(v)+'（括號、絕對值裡面先算）';}
    else if(nd.t==='neg'){v=F.neg(nd.a.v);note='去掉前面的負號：'+MINUS+'('+F.html(nd.a.v)+')＝'+F.html(v);}
    else if(nd.t==='pow'){v=F.pow(nd.a.v,nd.k);
      const b=nd.a.v;const bs=(b.n<0||b.d>1)?'('+F.html(b)+')':F.html(b);
      note='次方：'+bs+'<sup>'+nd.k+'</sup>＝'+(nd.k>0&&nd.k<=6?Array(nd.k).fill(bs).join('×')+'＝':'')+F.html(v)+(b.n<0?(nd.k%2===0?'（負數的偶數次方是正的）':'（負數的奇數次方是負的）'):'')+(nd.k===0?'（不是 0 的數，0 次方都是 1）':'');}
    else{
      const a=nd.a.v,b=nd.b.v;
      if(nd.op==='+'||nd.op==='−'){
        v=nd.op==='+'?F.add(a,b):F.sub(a,b);
        if(a.d!==b.d&&!(a.d===1&&b.d===1)){const L=lcm(a.d,b.d);
          note='加減要先通分（分母取 '+a.d+' 和 '+b.d+' 的最小公倍數 '+L+'）：'+F.html(a,{n:a.n*L/a.d,d:L})+' '+nd.op+' '+(b.n<0?'('+F.html(b,{n:b.n*L/b.d,d:L})+')':F.html(b,{n:b.n*L/b.d,d:L}))+'＝'+F.html(v,{n:(nd.op==='+'?a.n*L/a.d+b.n*L/b.d:a.n*L/a.d-b.n*L/b.d),d:L})+(v.d!==L?'＝'+F.html(v):'');}
        else note=(nd.op==='+'?'加法':'減法')+'：'+F.html(a)+' '+nd.op+' '+(b.n<0?'('+F.html(b)+')':F.html(b))+'＝'+F.html(v);
      }else if(nd.op==='×'){
        v=F.mul(a,b);
        const pn=a.n*b.n,pd=a.d*b.d;
        note='乘法（分子乘分子、分母乘分母，能約分先約分）：'+F.html(a)+'×'+(b.n<0?'('+F.html(b)+')':F.html(b))+'＝'+(pd!==1&&(pn!==v.n||pd!==v.d)?F.html(F(1),{n:pn,d:pd})+'＝':'')+F.html(v);
      }else{
        if(b.n===0)throw new Error('不能除以 0');
        const ib=F.inv(b);v=F.div(a,b);
        note='除法改成乘倒數：'+F.html(a)+'÷'+(b.n<0?'('+F.html(b)+')':F.html(b))+'＝'+F.html(a)+'×'+(ib.n<0?'('+F.html(ib)+')':F.html(ib))+'＝'+F.html(v);
      }
      const precTxt=c.depth>0?'括號裡面先算。':(c.prec===2?'先乘除，由左往右。':'再加減，由左往右。');
      note=precTxt+note;
    }
    const nn=R(v);nn.hl=true;
    root=replace(root,c,nn);
    /* 被包在括號裡、而且括號裡只剩這個數：一併拿掉括號 */
    (function unwrap(){let changed=true;while(changed){changed=false;
      const c2=findNext(root);if(c2&&c2.nd.t==='par'&&c2.nd.a.t==='num'&&c2.nd.a.hl){root=replace(root,c2,Object.assign({},c2.nd.a));changed=true;}}})();
    out.push({html:render(root),note});
    clearHL(root);
  }
  if(root.t!=='num')throw new Error('算不完，請檢查算式');
  return {steps:out,value:root.v};
}

window.FR={F,gcd,lcm,parseNum,parse,render,steps,normalize};
})();
