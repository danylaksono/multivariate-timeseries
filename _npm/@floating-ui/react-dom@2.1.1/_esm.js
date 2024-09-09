/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@floating-ui/react-dom@2.1.1/dist/floating-ui.react-dom.mjs
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{computePosition as e,offset as t,shift as n,limitShift as r,flip as o,size as i,autoPlacement as s,hide as u,inline as f,arrow as a}from"../dom@1.6.10/_esm.js";export{autoUpdate,computePosition,detectOverflow,getOverflowAncestors,platform}from"../dom@1.6.10/_esm.js";import*as l from"../../react@18.3.1/_esm.js";import{useLayoutEffect as c,useEffect as p}from"../../react@18.3.1/_esm.js";import*as m from"../../react-dom@18.3.1/_esm.js";var d="undefined"!=typeof document?c:p;function g(e,t){if(e===t)return!0;if(typeof e!=typeof t)return!1;if("function"==typeof e&&e.toString()===t.toString())return!0;let n,r,o;if(e&&t&&"object"==typeof e){if(Array.isArray(e)){if(n=e.length,n!==t.length)return!1;for(r=n;0!=r--;)if(!g(e[r],t[r]))return!1;return!0}if(o=Object.keys(e),n=o.length,n!==Object.keys(t).length)return!1;for(r=n;0!=r--;)if(!{}.hasOwnProperty.call(t,o[r]))return!1;for(r=n;0!=r--;){const n=o[r];if(("_owner"!==n||!e.$$typeof)&&!g(e[n],t[n]))return!1}return!0}return e!=e&&t!=t}function y(e){if("undefined"==typeof window)return 1;return(e.ownerDocument.defaultView||window).devicePixelRatio||1}function w(e,t){const n=y(e);return Math.round(t*n)/n}function h(e){const t=l.useRef(e);return d((()=>{t.current=e})),t}function P(t){void 0===t&&(t={});const{placement:n="bottom",strategy:r="absolute",middleware:o=[],platform:i,elements:{reference:s,floating:u}={},transform:f=!0,whileElementsMounted:a,open:c}=t,[p,P]=l.useState({x:0,y:0,strategy:r,placement:n,middlewareData:{},isPositioned:!1}),[x,S]=l.useState(o);g(x,o)||S(o);const[b,R]=l.useState(null),[v,M]=l.useState(null),O=l.useCallback((e=>{e!==A.current&&(A.current=e,R(e))}),[]),k=l.useCallback((e=>{e!==D.current&&(D.current=e,M(e))}),[]),C=s||b,j=u||v,A=l.useRef(null),D=l.useRef(null),$=l.useRef(p),z=null!=a,E=h(a),F=h(i),U=l.useCallback((()=>{if(!A.current||!D.current)return;const t={placement:n,strategy:r,middleware:x};F.current&&(t.platform=F.current),e(A.current,D.current,t).then((e=>{const t={...e,isPositioned:!0};V.current&&!g($.current,t)&&($.current=t,m.flushSync((()=>{P(t)})))}))}),[x,n,r,F]);d((()=>{!1===c&&$.current.isPositioned&&($.current.isPositioned=!1,P((e=>({...e,isPositioned:!1}))))}),[c]);const V=l.useRef(!1);d((()=>(V.current=!0,()=>{V.current=!1})),[]),d((()=>{if(C&&(A.current=C),j&&(D.current=j),C&&j){if(E.current)return E.current(C,j,U);U()}}),[C,j,U,E,z]);const _=l.useMemo((()=>({reference:A,floating:D,setReference:O,setFloating:k})),[O,k]),q=l.useMemo((()=>({reference:C,floating:j})),[C,j]),B=l.useMemo((()=>{const e={position:r,left:0,top:0};if(!q.floating)return e;const t=w(q.floating,p.x),n=w(q.floating,p.y);return f?{...e,transform:"translate("+t+"px, "+n+"px)",...y(q.floating)>=1.5&&{willChange:"transform"}}:{position:r,left:t,top:n}}),[r,f,q.floating,p.x,p.y]);return l.useMemo((()=>({...p,update:U,refs:_,elements:q,floatingStyles:B})),[p,U,_,q,B])}const x=e=>({name:"arrow",options:e,fn(t){const{element:n,padding:r}="function"==typeof e?e(t):e;return n&&(o=n,{}.hasOwnProperty.call(o,"current"))?null!=n.current?a({element:n.current,padding:r}).fn(t):{}:n?a({element:n,padding:r}).fn(t):{};var o}}),S=(e,n)=>({...t(e),options:[e,n]}),b=(e,t)=>({...n(e),options:[e,t]}),R=(e,t)=>({...r(e),options:[e,t]}),v=(e,t)=>({...o(e),options:[e,t]}),M=(e,t)=>({...i(e),options:[e,t]}),O=(e,t)=>({...s(e),options:[e,t]}),k=(e,t)=>({...u(e),options:[e,t]}),C=(e,t)=>({...f(e),options:[e,t]}),j=(e,t)=>({...x(e),options:[e,t]});export{j as arrow,O as autoPlacement,v as flip,k as hide,C as inline,R as limitShift,S as offset,b as shift,M as size,P as useFloating};export default null;
