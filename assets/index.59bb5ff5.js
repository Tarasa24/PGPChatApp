import{S as t,i as e,s,a as r,e as a,b as l,c as n,d as o,f as i,g as c,h as u,l as p,n as h,j as d,r as m,k as g,I as f,m as x,o as b,p as w,q as y,t as $,u as v,v as k,w as C,x as L,y as P,z as T,A as M,B as j,C as H,D as S,E as U,F as O,G as z,H as A,J as B,K as D,L as F,M as G}from"./vendor.0cf67519.js";!function(){const t=document.createElement("link").relList;if(!(t&&t.supports&&t.supports("modulepreload"))){for(const t of document.querySelectorAll('link[rel="modulepreload"]'))e(t);new MutationObserver((t=>{for(const s of t)if("childList"===s.type)for(const t of s.addedNodes)"LINK"===t.tagName&&"modulepreload"===t.rel&&e(t)})).observe(document,{childList:!0,subtree:!0})}function e(t){if(t.ep)return;t.ep=!0;const e=function(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerpolicy&&(e.referrerPolicy=t.referrerpolicy),"use-credentials"===t.crossorigin?e.credentials="include":"anonymous"===t.crossorigin?e.credentials="omit":e.credentials="same-origin",e}(t);fetch(t.href,e)}}();const{window:E}=g;function V(t){let e,s,g,f,x,b,w,y,$,v,k=!1,C=()=>{k=!1};return r(t[1]),{c(){s=a("nav"),g=a("div"),f=l(),x=a("div"),b=a("img"),n(g,"class","absolute w-[100%] h-[100%] bg-primaryLight transition-all "),o(g,"filter","brightness("+(t[0]>0?.75:1)+")"),i(b.src,w="./assets/Logo.cd8bbff0.svg")||n(b,"src","./assets/Logo.cd8bbff0.svg"),n(b,"alt","Logo"),n(b,"class","block h-[100%] w-auto"),n(x,"class",y="rounded-[25%] bg-white mx-auto "+(t[0]>0?"p-1":"p-3")+" transition-all z-20"),o(x,"height",(t[0]>0?7.5:20)+"vh"),n(s,"class","fixed top-0 w-[100%] flex justify-center items-center cursor-pointer z-10"),o(s,"height",(t[0]>0?10:35)+"vh")},m(r,a){c(r,s,a),u(s,g),u(s,f),u(s,x),u(x,b),$||(v=[p(E,"scroll",(()=>{k=!0,clearTimeout(e),e=setTimeout(C,100),t[1]()})),p(s,"click",t[2])],$=!0)},p(t,[r]){1&r&&!k&&(k=!0,clearTimeout(e),scrollTo(E.pageXOffset,t[0]),e=setTimeout(C,100)),1&r&&o(g,"filter","brightness("+(t[0]>0?.75:1)+")"),1&r&&y!==(y="rounded-[25%] bg-white mx-auto "+(t[0]>0?"p-1":"p-3")+" transition-all z-20")&&n(x,"class",y),1&r&&o(x,"height",(t[0]>0?7.5:20)+"vh"),1&r&&o(s,"height",(t[0]>0?10:35)+"vh")},i:h,o:h,d(t){t&&d(s),$=!1,m(v)}}}function I(t,e,s){let r;return[r,function(){s(0,r=E.pageYOffset)},()=>{window.scrollTo(0,0),history.replaceState(null,null," ")}]}class N extends t{constructor(t){super(),e(this,t,I,V,s,{})}}function q(t){let e,s,r,o,i,p,m,g,C,L,P,T,M,j,H;return L=new f({props:{data:x,scale:"3.25",class:"text-white mr-3"}}),j=new b({props:{src:"./assets/Waves.b789415d.svg",class:"w-[100%] h-[100%]"}}),{c(){e=a("header"),s=a("div"),r=a("h1"),r.textContent="Chat Securely Through The Power Of PGP Encryption",o=l(),i=a("h2"),i.innerHTML="Meet <b>PGPChatApp</b>, open-source privacy-first feature-rich experience.",p=l(),m=a("div"),g=a("a"),C=a("div"),w(L.$$.fragment),P=l(),T=a("div"),T.innerHTML='<span class="text-white text-xs">Download exclusively on</span> \n            <b class="text-white text-3xl">GitHub</b>',M=l(),w(j.$$.fragment),n(r,"class","text-center text-white font-bold lg:text-6xl text-4xl mx-2.5 mb-10"),n(i,"class","text-center text-borderLight lg:text-3xl text-2xl font-light mx-2.5 mb-5"),n(T,"class","flex flex-col justify-center items-center mr-2"),n(C,"class","bg-black px-2 py-1 rounded-3xl flex cursor-pointer transition-transform hover:scale-105"),n(g,"href","https://github.com/Tarasa24/PGPChatApp/releases"),n(g,"target","_blank"),n(g,"class","mx-auto mt-20"),n(m,"class","flex lg:mb-0 mb-6"),n(s,"class","bg-primaryLight w-100 flex flex-col z-10 pt-[35vh]")},m(t,a){c(t,e,a),u(e,s),u(s,r),u(s,o),u(s,i),u(s,p),u(s,m),u(m,g),u(g,C),y(L,C,null),u(C,P),u(C,T),u(e,M),y(j,e,null),H=!0},p:h,i(t){H||($(L.$$.fragment,t),$(j.$$.fragment,t),H=!0)},o(t){v(L.$$.fragment,t),v(j.$$.fragment,t),H=!1},d(t){t&&d(e),k(L),k(j)}}}class K extends t{constructor(t){super(),e(this,t,null,q,s,{})}}function Z(t){let e,s,r,i,g,x,b,S,U,O,z,A,B,D,F,G,E,V,I,N,q,K,Z,_,J,W,X,Y;return N=new f({props:{data:C,scale:"1.75"}}),J=new f({props:{data:L,scale:"1.75"}}),{c(){e=a("div"),s=a("div"),r=P("svg"),i=P("rect"),g=P("rect"),x=P("mask"),b=P("rect"),S=P("g"),U=P("g"),O=P("image"),z=P("g"),A=P("image"),B=P("path"),D=P("circle"),F=P("rect"),G=P("path"),E=l(),V=a("div"),I=a("button"),w(N.$$.fragment),q=l(),K=a("div"),K.innerHTML='<span class="rounded-full border-black border-opacity-20 border-2 h-3 w-3 inline-block absolute top-3.5 left-0.5 opacity-0"></span> \n      <span class="rounded-full border-black border-opacity-20 border-2 h-3 w-3 inline-block relative top-1.5"></span> \n      <span class="rounded-full border-black border-opacity-40 border-2 h-4 w-4 inline-block relative top-0.5 mx-1"></span> \n      <span class="rounded-full border-black border-opacity-0 border-2 bg-primaryLight h-5 w-5 inline-block"></span> \n      <span class="rounded-full border-black border-opacity-40 border-2 bg-white h-4 w-4 inline-block relative top-0.5 mx-1"></span> \n      <span class="rounded-full border-black border-opacity-20 border-2 h-3 w-3 inline-block relative top-1.5"></span> \n      <span class="rounded-full border-black border-opacity-20 border-2 h-3 w-3 inline-block absolute top-3.5 right-0.5 opacity-0"></span>',Z=l(),_=a("button"),w(J.$$.fragment),n(i,"x","355.032"),n(i,"y","139.932"),n(i,"width","9.76171"),n(i,"height","43.4034"),n(i,"rx","4"),n(i,"fill","black"),n(g,"x","355.032"),n(g,"y","184.369"),n(g,"width","9.76171"),n(g,"height","43.4034"),n(g,"rx","4"),n(g,"fill","black"),n(b,"width","362"),n(b,"height","789"),n(b,"rx","63"),n(b,"fill","#FF0000"),n(x,"id","mask0"),o(x,"mask-type","alpha"),n(x,"maskUnits","userSpaceOnUse"),n(x,"x","0"),n(x,"y","0"),n(x,"width","362"),n(x,"height","789"),n(O,"x","3.25%"),n(O,"y","1.2%"),n(O,"width","93%"),n(O,"height","96.5%"),n(O,"mask","url(#mask0)"),T(O,"xlink:href","./assets/screenshot-dark.3360e65a.jpg"),n(U,"id","two"),n(A,"x","3.25%"),n(A,"y","1.2%"),n(A,"width","93%"),n(A,"height","96.5%"),n(A,"mask","url(#mask0)"),T(A,"xlink:href","./assets/screenshot-light.17aa2f7d.jpg"),n(z,"id","one"),n(B,"fill-rule","evenodd"),n(B,"clip-rule","evenodd"),n(B,"d","M-0.226929 63.6215C-0.226929 28.5515 28.203 0.121521 63.2731 0.121521H298.92C333.99 0.121521 362.42 28.5514 362.42 63.6215V725.716C362.42 760.786 333.99 789.216 298.92 789.216H63.2731C28.203 789.216 -0.226929 760.786 -0.226929 725.716V63.6215ZM63.2731 13.1215C35.3827 13.1215 12.7731 35.7311 12.7731 63.6215V725.716C12.7731 753.606 35.3827 776.216 63.2731 776.216H298.92C326.81 776.216 349.42 753.606 349.42 725.716V63.6215C349.42 35.7311 326.81 13.1215 298.92 13.1215H63.2731Z"),n(B,"fill","black"),n(D,"cx","181.299"),n(D,"cy","27.0926"),n(D,"r","8.41"),n(D,"fill","#282828"),n(D,"stroke","black"),n(D,"stroke-width","2"),n(F,"x","131.401"),n(F,"y","4.03796"),n(F,"width","99.392"),n(F,"height","5.16707"),n(F,"rx","2.58354"),n(F,"fill","#282828"),n(G,"d","M19.9175 763.895C31.2095 773.036 31.2095 773.036 47.4618 773.036H314.731C330.983 773.036 330.983 773.036 342.275 763.895"),n(G,"stroke","black"),n(G,"stroke-width","12"),n(G,"stroke-linecap","round"),n(S,"mask","url(#mask0)"),n(r,"width","365"),n(r,"height","789"),n(r,"viewBox","0 0 365 789"),n(r,"fill","none"),n(r,"xmlns","http://www.w3.org/2000/svg"),n(r,"class","mx-auto"),n(s,"class","xl:scale-90 scale-[.85]"),n(I,"class","justify-self-end text-borderDark"),n(K,"class","mx-5 w-28 h-7 relative"),n(K,"id","bubbles"),n(_,"class","justify-self-start text-borderDark"),n(V,"class","grid grid-flow-col w-full justify-items-center items-center xl:-mt-4 -mt-10"),n(e,"class","xl:-mt-4 -mt-24 overflow-hidden")},m(a,l){c(a,e,l),u(e,s),u(s,r),u(r,i),u(r,g),u(r,x),u(x,b),u(r,S),u(S,U),u(U,O),u(S,z),u(z,A),u(S,B),u(S,D),u(S,F),u(S,G),u(e,E),u(e,V),u(V,I),y(N,I,null),u(V,q),u(V,K),u(V,Z),u(V,_),y(J,_,null),W=!0,X||(Y=[p(window,"keydown",t[2]),M(j.exports.swipe.call(null,s)),p(s,"swipeleft",t[0]),p(s,"swiperight",t[1]),p(I,"click",H(t[1])),p(_,"click",H(t[0]))],X=!0)},p:h,i(t){W||($(N.$$.fragment,t),$(J.$$.fragment,t),W=!0)},o(t){v(N.$$.fragment,t),v(J.$$.fragment,t),W=!1},d(t){t&&d(e),k(N),k(J),X=!1,m(Y)}}}function _(t,e,s){const r=S.timeline({defaults:{duration:.75,ease:"power2.inOut"}}),a=["g#one","g#two"];let l=0;function n(){const t=a[Math.abs(l)%a.length],e=a[Math.abs(l+1)%a.length];r.set(e,{x:"100%"}).to(t,{x:"-100%"}).to(e,{x:0},"<").to("#bubbles span:nth-of-type(2)",{y:10,x:-15,opacity:0},"<").to("#bubbles span:nth-of-type(3)",{width:"0.75rem",height:"0.75rem",border:"2px rgba(0, 0, 0, .2) solid",y:4,x:-20.25},"<").to("#bubbles span:nth-of-type(4)",{width:"1rem",height:"1rem",backgroundColor:"white",border:"2px rgba(0, 0, 0, .4) solid",y:2,x:-20.25},"<").to("#bubbles span:nth-of-type(5)",{width:"1.25rem",height:"1.25rem",backgroundColor:"#512da8",borderColor:"transparent",y:-2,x:-20.5},"<").to("#bubbles span:nth-of-type(6)",{width:"1rem",height:"1rem",border:"2px rgba(0, 0, 0, .4) solid",y:-4,x:-20.25},"<").fromTo("#bubbles span:nth-of-type(7)",{y:10,x:15},{opacity:1,y:0,x:-.25},"<").set("#bubbles span",{clearProps:"all"}),l+=1}function o(){const t=a[Math.abs(l)%a.length],e=a[Math.abs(l-1)%a.length];r.set(e,{x:"-100%"}).to(t,{x:"100%"}).to(e,{x:0},"<").to("#bubbles span:nth-of-type(6)",{y:10,x:15,opacity:0},"<").to("#bubbles span:nth-of-type(5)",{width:"0.75rem",height:"0.75rem",border:"2px rgba(0, 0, 0, .2) solid",y:4,x:20.5},"<").to("#bubbles span:nth-of-type(4)",{width:"1rem",height:"1rem",backgroundColor:"white",border:"2px rgba(0, 0, 0, .4) solid",y:2,x:20.75},"<").to("#bubbles span:nth-of-type(3)",{width:"1.25rem",height:"1.25rem",backgroundColor:"#512da8",borderColor:"transparent",y:-2,x:20.25},"<").to("#bubbles span:nth-of-type(2)",{width:"1rem",height:"1rem",border:"2px rgba(0, 0, 0, .4) solid",y:-4,x:20.25},"<").fromTo("#bubbles span:nth-of-type(1)",{y:10,x:-15},{opacity:1,y:0,x:-2},"<").set("#bubbles span",{clearProps:"all"}),l-=1}return[n,o,function(t){switch(t.keyCode){case 39:n();break;case 37:o()}}]}class J extends t{constructor(t){super(),e(this,t,_,Z,s,{nextScreenshot:0,previousScreenshot:1})}get nextScreenshot(){return this.$$.ctx[0]}get previousScreenshot(){return this.$$.ctx[1]}}const{window:W}=g;function X(t){let e,s,r,o,i,h,m,g,x,b,C,L,P,T,M,j,H,S,G,E,V,I,q,Z,_,X,Y,Q,R,tt,et,st,rt,at,lt,nt,ot,it,ct,ut,pt,ht,dt,mt,gt,ft,xt,bt,wt,yt,$t,vt,kt,Ct,Lt,Pt,Tt,Mt,jt,Ht,St,Ut,Ot;s=new N({}),o=new K({}),x=new f({props:{data:U,scale:"3",class:t[0]&&"text-borderLight"}}),M=new f({props:{data:O,scale:"5",class:"text-primaryLight"}}),I=new f({props:{data:z,scale:"4",class:"text-primaryLight"}}),R=new f({props:{data:A,scale:"4",class:"text-primaryLight"}});return nt=new J({props:{}}),t[3](nt),ut=new f({props:{data:B,scale:"5",class:"text-primaryLight"}}),xt=new f({props:{data:D,scale:"4",class:"text-primaryLight"}}),Ct=new f({props:{data:F,scale:"4",class:"text-primaryLight"}}),{c(){e=a("main"),w(s.$$.fragment),r=l(),w(o.$$.fragment),i=l(),h=a("div"),m=a("div"),g=a("a"),w(x.$$.fragment),C=l(),L=a("div"),P=a("div"),T=a("div"),w(M.$$.fragment),j=l(),H=a("h3"),H.textContent="Chat",S=l(),G=a("p"),G.textContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.",E=l(),V=a("div"),w(I.$$.fragment),q=l(),Z=a("h3"),Z.textContent="Call",_=l(),X=a("p"),X.textContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.",Y=l(),Q=a("div"),w(R.$$.fragment),tt=l(),et=a("h3"),et.textContent="Dark mode",st=l(),rt=a("p"),rt.textContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.",at=l(),lt=a("div"),w(nt.$$.fragment),ot=l(),it=a("div"),ct=a("div"),w(ut.$$.fragment),pt=l(),ht=a("h3"),ht.textContent="Anonymity",dt=l(),mt=a("p"),mt.textContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.",gt=l(),ft=a("div"),w(xt.$$.fragment),bt=l(),wt=a("h3"),wt.textContent="Privacy",yt=l(),$t=a("p"),$t.textContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.",vt=l(),kt=a("div"),w(Ct.$$.fragment),Lt=l(),Pt=a("h3"),Pt.textContent="Open-source",Tt=l(),Mt=a("p"),Mt.textContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.",jt=l(),Ht=a("footer"),Ht.innerHTML='<span class="text-white">Made with ❤️ by <a href="https://tarasa24.dev" target="_blank" class="font-bold">Tarasa24</a></span>',n(g,"href","#Features"),n(m,"class",b="text-center mx-auto mb-14 xl:mt-0 mt-5 "+(!t[0]&&"animate-bounce")),n(H,"class","text-3xl font-bold mt-2"),n(G,"class","text-lg font-light leading-tight mt-3"),n(Z,"class","text-3xl font-bold mt-2"),n(X,"class","text-lg font-light leading-tight mt-3"),n(et,"class","text-3xl font-bold mt-2"),n(rt,"class","text-lg font-light leading-tight mt-3"),n(P,"class","xl:justify-self-end xl:text-right xl:max-w-none max-w-lg mx-auto justify-center text-center flex flex-col gap-y-10"),n(lt,"class","mx-auto xl:my-0 my-20 flex flex-col"),n(lt,"id","Phone"),n(ht,"class","text-3xl font-bold mt-2"),n(mt,"class","text-lg font-light leading-tight mt-3"),n(wt,"class","text-3xl font-bold mt-2"),n($t,"class","text-lg font-light leading-tight mt-3"),n(Pt,"class","text-3xl font-bold mt-2"),n(Mt,"class","text-lg font-light leading-tight mt-3"),n(it,"class","xl:justify-self-start xl:text-left xl:max-w-none max-w-lg mx-auto justify-center text-center flex flex-col gap-y-10"),n(L,"class","flex xl:flex-row flex-col gap-x-10 mt-14 max-w-6xl mx-auto items-center"),n(h,"id","Features"),n(Ht,"class","bg-primaryLight text-center py-5 mt-20")},m(a,l){c(a,e,l),y(s,e,null),u(e,r),y(o,e,null),u(e,i),u(e,h),u(h,m),u(m,g),y(x,g,null),u(h,C),u(h,L),u(L,P),u(P,T),y(M,T,null),u(T,j),u(T,H),u(T,S),u(T,G),u(P,E),u(P,V),y(I,V,null),u(V,q),u(V,Z),u(V,_),u(V,X),u(P,Y),u(P,Q),y(R,Q,null),u(Q,tt),u(Q,et),u(Q,st),u(Q,rt),u(L,at),u(L,lt),y(nt,lt,null),u(L,ot),u(L,it),u(it,ct),y(ut,ct,null),u(ct,pt),u(ct,ht),u(ct,dt),u(ct,mt),u(it,gt),u(it,ft),y(xt,ft,null),u(ft,bt),u(ft,wt),u(ft,yt),u(ft,$t),u(it,vt),u(it,kt),y(Ct,kt,null),u(kt,Lt),u(kt,Pt),u(kt,Tt),u(kt,Mt),u(e,jt),u(e,Ht),St=!0,Ut||(Ot=p(W,"hashchange",t[2]),Ut=!0)},p(t,[e]){const s={};1&e&&(s.class=t[0]&&"text-borderLight"),x.$set(s),(!St||1&e&&b!==(b="text-center mx-auto mb-14 xl:mt-0 mt-5 "+(!t[0]&&"animate-bounce")))&&n(m,"class",b);nt.$set({})},i(t){St||($(s.$$.fragment,t),$(o.$$.fragment,t),$(x.$$.fragment,t),$(M.$$.fragment,t),$(I.$$.fragment,t),$(R.$$.fragment,t),$(nt.$$.fragment,t),$(ut.$$.fragment,t),$(xt.$$.fragment,t),$(Ct.$$.fragment,t),St=!0)},o(t){v(s.$$.fragment,t),v(o.$$.fragment,t),v(x.$$.fragment,t),v(M.$$.fragment,t),v(I.$$.fragment,t),v(R.$$.fragment,t),v(nt.$$.fragment,t),v(ut.$$.fragment,t),v(xt.$$.fragment,t),v(Ct.$$.fragment,t),St=!1},d(r){r&&d(e),k(s),k(o),k(x),k(M),k(I),k(R),t[3](null),k(nt),k(ut),k(xt),k(Ct),Ut=!1,Ot()}}}function Y(t,e,s){let r,a=Boolean(window.location.hash);return[a,r,()=>s(0,a=Boolean(window.location.hash)),function(t){G[t?"unshift":"push"]((()=>{r=t,s(1,r)}))}]}new class extends t{constructor(t){super(),e(this,t,Y,X,s,{})}}({target:document.getElementById("app")});
