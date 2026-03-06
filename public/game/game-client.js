var AD=Object.create;var{getPrototypeOf:CD,defineProperty:uH,getOwnPropertyNames:_D}=Object;var ED=Object.prototype.hasOwnProperty;function PD(J){return this[J]}var jD,SD,TD=(J,Q,$)=>{var Z=J!=null&&typeof J==="object";if(Z){var K=Q?jD??=new WeakMap:SD??=new WeakMap,W=K.get(J);if(W)return W}$=J!=null?AD(CD(J)):{};let X=Q||!J||!J.__esModule?uH($,"default",{value:J,enumerable:!0}):$;for(let H of _D(J))if(!ED.call(X,H))uH(X,H,{get:PD.bind(J,H),enumerable:!0});if(Z)K.set(J,X);return X};var yD=(J,Q)=>()=>(Q||J((Q={exports:{}}).exports,Q),Q.exports);var A=(J,Q)=>()=>(J&&(Q=J(J=0)),Q);var b,OK=(J)=>{if(typeof J==="function"||typeof J==="object"&&J.extension){if(!J.extension)throw Error("Extension class must have an extension object");J={...typeof J.extension!=="object"?{type:J.extension}:J.extension,ref:J}}if(typeof J==="object")J={...J};else throw Error("Invalid extension type");if(typeof J.type==="string")J.type=[J.type];return J},jQ=(J,Q)=>OK(J).priority??Q,n0;var k0=A(()=>{b=((J)=>{return J.Application="application",J.WebGLPipes="webgl-pipes",J.WebGLPipesAdaptor="webgl-pipes-adaptor",J.WebGLSystem="webgl-system",J.WebGPUPipes="webgpu-pipes",J.WebGPUPipesAdaptor="webgpu-pipes-adaptor",J.WebGPUSystem="webgpu-system",J.CanvasSystem="canvas-system",J.CanvasPipesAdaptor="canvas-pipes-adaptor",J.CanvasPipes="canvas-pipes",J.Asset="asset",J.LoadParser="load-parser",J.ResolveParser="resolve-parser",J.CacheParser="cache-parser",J.DetectionParser="detection-parser",J.MaskEffect="mask-effect",J.BlendMode="blend-mode",J.TextureSource="texture-source",J.Environment="environment",J.ShapeBuilder="shape-builder",J.Batcher="batcher",J})(b||{}),n0={_addHandlers:{},_removeHandlers:{},_queue:{},remove(...J){return J.map(OK).forEach((Q)=>{Q.type.forEach(($)=>this._removeHandlers[$]?.(Q))}),this},add(...J){return J.map(OK).forEach((Q)=>{Q.type.forEach(($)=>{let Z=this._addHandlers,K=this._queue;if(!Z[$])K[$]=K[$]||[],K[$]?.push(Q);else Z[$]?.(Q)})}),this},handle(J,Q,$){let Z=this._addHandlers,K=this._removeHandlers;if(Z[J]||K[J])throw Error(`Extension type ${J} already has a handler`);Z[J]=Q,K[J]=$;let W=this._queue;if(W[J])W[J]?.forEach((X)=>Q(X)),delete W[J];return this},handleByMap(J,Q){return this.handle(J,($)=>{if($.name)Q[$.name]=$.ref},($)=>{if($.name)delete Q[$.name]})},handleByNamedList(J,Q,$=-1){return this.handle(J,(Z)=>{if(Q.findIndex((W)=>W.name===Z.name)>=0)return;Q.push({name:Z.name,value:Z.ref}),Q.sort((W,X)=>jQ(X.value,$)-jQ(W.value,$))},(Z)=>{let K=Q.findIndex((W)=>W.name===Z.name);if(K!==-1)Q.splice(K,1)})},handleByList(J,Q,$=-1){return this.handle(J,(Z)=>{if(Q.includes(Z.ref))return;Q.push(Z.ref),Q.sort((K,W)=>jQ(W,$)-jQ(K,$))},(Z)=>{let K=Q.indexOf(Z.ref);if(K!==-1)Q.splice(K,1)})},mixin(J,...Q){for(let $ of Q)Object.defineProperties(J.prototype,Object.getOwnPropertyDescriptors($))}}});var nH=yD((QB,FK)=>{var bD=Object.prototype.hasOwnProperty,$6="~";function B9(){}if(Object.create){if(B9.prototype=Object.create(null),!new B9().__proto__)$6=!1}function vD(J,Q,$){this.fn=J,this.context=Q,this.once=$||!1}function sH(J,Q,$,Z,K){if(typeof $!=="function")throw TypeError("The listener must be a function");var W=new vD($,Z||J,K),X=$6?$6+Q:Q;if(!J._events[X])J._events[X]=W,J._eventsCount++;else if(!J._events[X].fn)J._events[X].push(W);else J._events[X]=[J._events[X],W];return J}function SQ(J,Q){if(--J._eventsCount===0)J._events=new B9;else delete J._events[Q]}function u8(){this._events=new B9,this._eventsCount=0}u8.prototype.eventNames=function(){var Q=[],$,Z;if(this._eventsCount===0)return Q;for(Z in $=this._events)if(bD.call($,Z))Q.push($6?Z.slice(1):Z);if(Object.getOwnPropertySymbols)return Q.concat(Object.getOwnPropertySymbols($));return Q};u8.prototype.listeners=function(Q){var $=$6?$6+Q:Q,Z=this._events[$];if(!Z)return[];if(Z.fn)return[Z.fn];for(var K=0,W=Z.length,X=Array(W);K<W;K++)X[K]=Z[K].fn;return X};u8.prototype.listenerCount=function(Q){var $=$6?$6+Q:Q,Z=this._events[$];if(!Z)return 0;if(Z.fn)return 1;return Z.length};u8.prototype.emit=function(Q,$,Z,K,W,X){var H=$6?$6+Q:Q;if(!this._events[H])return!1;var q=this._events[H],N=arguments.length,Y,U;if(q.fn){if(q.once)this.removeListener(Q,q.fn,void 0,!0);switch(N){case 1:return q.fn.call(q.context),!0;case 2:return q.fn.call(q.context,$),!0;case 3:return q.fn.call(q.context,$,Z),!0;case 4:return q.fn.call(q.context,$,Z,K),!0;case 5:return q.fn.call(q.context,$,Z,K,W),!0;case 6:return q.fn.call(q.context,$,Z,K,W,X),!0}for(U=1,Y=Array(N-1);U<N;U++)Y[U-1]=arguments[U];q.fn.apply(q.context,Y)}else{var V=q.length,z;for(U=0;U<V;U++){if(q[U].once)this.removeListener(Q,q[U].fn,void 0,!0);switch(N){case 1:q[U].fn.call(q[U].context);break;case 2:q[U].fn.call(q[U].context,$);break;case 3:q[U].fn.call(q[U].context,$,Z);break;case 4:q[U].fn.call(q[U].context,$,Z,K);break;default:if(!Y)for(z=1,Y=Array(N-1);z<N;z++)Y[z-1]=arguments[z];q[U].fn.apply(q[U].context,Y)}}}return!0};u8.prototype.on=function(Q,$,Z){return sH(this,Q,$,Z,!1)};u8.prototype.once=function(Q,$,Z){return sH(this,Q,$,Z,!0)};u8.prototype.removeListener=function(Q,$,Z,K){var W=$6?$6+Q:Q;if(!this._events[W])return this;if(!$)return SQ(this,W),this;var X=this._events[W];if(X.fn){if(X.fn===$&&(!K||X.once)&&(!Z||X.context===Z))SQ(this,W)}else{for(var H=0,q=[],N=X.length;H<N;H++)if(X[H].fn!==$||K&&!X[H].once||Z&&X[H].context!==Z)q.push(X[H]);if(q.length)this._events[W]=q.length===1?q[0]:q;else SQ(this,W)}return this};u8.prototype.removeAllListeners=function(Q){var $;if(Q){if($=$6?$6+Q:Q,this._events[$])SQ(this,$)}else this._events=new B9,this._eventsCount=0;return this};u8.prototype.off=u8.prototype.removeListener;u8.prototype.addListener=u8.prototype.on;u8.prefixed=$6;u8.EventEmitter=u8;if(typeof FK<"u")FK.exports=u8});var iH,_8;var O6=A(()=>{iH=TD(nH(),1),_8=iH.default});var fD,W7=function(J){return typeof J=="string"?J.length>0:typeof J=="number"},h8=function(J,Q,$){return Q===void 0&&(Q=0),$===void 0&&($=Math.pow(10,Q)),Math.round($*J)/$+0},L6=function(J,Q,$){return Q===void 0&&(Q=0),$===void 0&&($=1),J>$?$:J>Q?J:Q},$q=function(J){return(J=isFinite(J)?J%360:0)>0?J:J+360},oH=function(J){return{r:L6(J.r,0,255),g:L6(J.g,0,255),b:L6(J.b,0,255),a:L6(J.a)}},zK=function(J){return{r:h8(J.r),g:h8(J.g),b:h8(J.b),a:h8(J.a,3)}},hD,TQ=function(J){var Q=J.toString(16);return Q.length<2?"0"+Q:Q},Zq=function(J){var{r:Q,g:$,b:Z,a:K}=J,W=Math.max(Q,$,Z),X=W-Math.min(Q,$,Z),H=X?W===Q?($-Z)/X:W===$?2+(Z-Q)/X:4+(Q-$)/X:0;return{h:60*(H<0?H+6:H),s:W?X/W*100:0,v:W/255*100,a:K}},Kq=function(J){var{h:Q,s:$,v:Z,a:K}=J;Q=Q/360*6,$/=100,Z/=100;var W=Math.floor(Q),X=Z*(1-$),H=Z*(1-(Q-W)*$),q=Z*(1-(1-Q+W)*$),N=W%6;return{r:255*[Z,H,X,X,q,Z][N],g:255*[q,Z,Z,H,X,X][N],b:255*[X,X,q,Z,Z,H][N],a:K}},aH=function(J){return{h:$q(J.h),s:L6(J.s,0,100),l:L6(J.l,0,100),a:L6(J.a)}},rH=function(J){return{h:h8(J.h),s:h8(J.s),l:h8(J.l),a:h8(J.a,3)}},tH=function(J){return Kq(($=(Q=J).s,{h:Q.h,s:($*=((Z=Q.l)<50?Z:100-Z)/100)>0?2*$/(Z+$)*100:0,v:Z+$,a:Q.a}));var Q,$,Z},R9=function(J){return{h:(Q=Zq(J)).h,s:(K=(200-($=Q.s))*(Z=Q.v)/100)>0&&K<200?$*Z/100/(K<=100?K:200-K)*100:0,l:K/2,a:Q.a};var Q,$,Z,K},xD,gD,pD,mD,MK,eH=function(J,Q){for(var $=0;$<Q.length;$++){var Z=Q[$][0](J);if(Z)return[Z,Q[$][1]]}return[null,void 0]},dD=function(J){return typeof J=="string"?eH(J.trim(),MK.string):typeof J=="object"&&J!==null?eH(J,MK.object):[null,void 0]},DK=function(J,Q){var $=R9(J);return{h:$.h,s:L6($.s+100*Q,0,100),l:$.l,a:$.a}},kK=function(J){return(299*J.r+587*J.g+114*J.b)/1000/255},Jq=function(J,Q){var $=R9(J);return{h:$.h,s:$.s,l:L6($.l+100*Q,0,100),a:$.a}},wK,b6=function(J){return J instanceof wK?J:new wK(J)},Qq,Wq=function(J){J.forEach(function(Q){Qq.indexOf(Q)<0&&(Q(wK,MK),Qq.push(Q))})};var Xq=A(()=>{fD={grad:0.9,turn:360,rad:360/(2*Math.PI)},hD=/^#([0-9a-f]{3,8})$/i,xD=/^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*,\s*([+-]?\d*\.?\d+)%\s*,\s*([+-]?\d*\.?\d+)%\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,gD=/^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s+([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)%\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,pD=/^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,mD=/^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,MK={string:[[function(J){var Q=hD.exec(J);return Q?(J=Q[1]).length<=4?{r:parseInt(J[0]+J[0],16),g:parseInt(J[1]+J[1],16),b:parseInt(J[2]+J[2],16),a:J.length===4?h8(parseInt(J[3]+J[3],16)/255,2):1}:J.length===6||J.length===8?{r:parseInt(J.substr(0,2),16),g:parseInt(J.substr(2,2),16),b:parseInt(J.substr(4,2),16),a:J.length===8?h8(parseInt(J.substr(6,2),16)/255,2):1}:null:null},"hex"],[function(J){var Q=pD.exec(J)||mD.exec(J);return Q?Q[2]!==Q[4]||Q[4]!==Q[6]?null:oH({r:Number(Q[1])/(Q[2]?0.39215686274509803:1),g:Number(Q[3])/(Q[4]?0.39215686274509803:1),b:Number(Q[5])/(Q[6]?0.39215686274509803:1),a:Q[7]===void 0?1:Number(Q[7])/(Q[8]?100:1)}):null},"rgb"],[function(J){var Q=xD.exec(J)||gD.exec(J);if(!Q)return null;var $,Z,K=aH({h:($=Q[1],Z=Q[2],Z===void 0&&(Z="deg"),Number($)*(fD[Z]||1)),s:Number(Q[3]),l:Number(Q[4]),a:Q[5]===void 0?1:Number(Q[5])/(Q[6]?100:1)});return tH(K)},"hsl"]],object:[[function(J){var{r:Q,g:$,b:Z,a:K}=J,W=K===void 0?1:K;return W7(Q)&&W7($)&&W7(Z)?oH({r:Number(Q),g:Number($),b:Number(Z),a:Number(W)}):null},"rgb"],[function(J){var{h:Q,s:$,l:Z,a:K}=J,W=K===void 0?1:K;if(!W7(Q)||!W7($)||!W7(Z))return null;var X=aH({h:Number(Q),s:Number($),l:Number(Z),a:Number(W)});return tH(X)},"hsl"],[function(J){var{h:Q,s:$,v:Z,a:K}=J,W=K===void 0?1:K;if(!W7(Q)||!W7($)||!W7(Z))return null;var X=function(H){return{h:$q(H.h),s:L6(H.s,0,100),v:L6(H.v,0,100),a:L6(H.a)}}({h:Number(Q),s:Number($),v:Number(Z),a:Number(W)});return Kq(X)},"hsv"]]},wK=function(){function J(Q){this.parsed=dD(Q)[0],this.rgba=this.parsed||{r:0,g:0,b:0,a:1}}return J.prototype.isValid=function(){return this.parsed!==null},J.prototype.brightness=function(){return h8(kK(this.rgba),2)},J.prototype.isDark=function(){return kK(this.rgba)<0.5},J.prototype.isLight=function(){return kK(this.rgba)>=0.5},J.prototype.toHex=function(){return Q=zK(this.rgba),$=Q.r,Z=Q.g,K=Q.b,X=(W=Q.a)<1?TQ(h8(255*W)):"","#"+TQ($)+TQ(Z)+TQ(K)+X;var Q,$,Z,K,W,X},J.prototype.toRgb=function(){return zK(this.rgba)},J.prototype.toRgbString=function(){return Q=zK(this.rgba),$=Q.r,Z=Q.g,K=Q.b,(W=Q.a)<1?"rgba("+$+", "+Z+", "+K+", "+W+")":"rgb("+$+", "+Z+", "+K+")";var Q,$,Z,K,W},J.prototype.toHsl=function(){return rH(R9(this.rgba))},J.prototype.toHslString=function(){return Q=rH(R9(this.rgba)),$=Q.h,Z=Q.s,K=Q.l,(W=Q.a)<1?"hsla("+$+", "+Z+"%, "+K+"%, "+W+")":"hsl("+$+", "+Z+"%, "+K+"%)";var Q,$,Z,K,W},J.prototype.toHsv=function(){return Q=Zq(this.rgba),{h:h8(Q.h),s:h8(Q.s),v:h8(Q.v),a:h8(Q.a,3)};var Q},J.prototype.invert=function(){return b6({r:255-(Q=this.rgba).r,g:255-Q.g,b:255-Q.b,a:Q.a});var Q},J.prototype.saturate=function(Q){return Q===void 0&&(Q=0.1),b6(DK(this.rgba,Q))},J.prototype.desaturate=function(Q){return Q===void 0&&(Q=0.1),b6(DK(this.rgba,-Q))},J.prototype.grayscale=function(){return b6(DK(this.rgba,-1))},J.prototype.lighten=function(Q){return Q===void 0&&(Q=0.1),b6(Jq(this.rgba,Q))},J.prototype.darken=function(Q){return Q===void 0&&(Q=0.1),b6(Jq(this.rgba,-Q))},J.prototype.rotate=function(Q){return Q===void 0&&(Q=15),this.hue(this.hue()+Q)},J.prototype.alpha=function(Q){return typeof Q=="number"?b6({r:($=this.rgba).r,g:$.g,b:$.b,a:Q}):h8(this.rgba.a,3);var $},J.prototype.hue=function(Q){var $=R9(this.rgba);return typeof Q=="number"?b6({h:Q,s:$.s,l:$.l,a:$.a}):h8($.h)},J.prototype.isEqual=function(Q){return this.toHex()===b6(Q).toHex()},J}(),Qq=[]});function IK(J,Q){var $={white:"#ffffff",bisque:"#ffe4c4",blue:"#0000ff",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",antiquewhite:"#faebd7",aqua:"#00ffff",azure:"#f0ffff",whitesmoke:"#f5f5f5",papayawhip:"#ffefd5",plum:"#dda0dd",blanchedalmond:"#ffebcd",black:"#000000",gold:"#ffd700",goldenrod:"#daa520",gainsboro:"#dcdcdc",cornsilk:"#fff8dc",cornflowerblue:"#6495ed",burlywood:"#deb887",aquamarine:"#7fffd4",beige:"#f5f5dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkkhaki:"#bdb76b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",peachpuff:"#ffdab9",darkmagenta:"#8b008b",darkred:"#8b0000",darkorchid:"#9932cc",darkorange:"#ff8c00",darkslateblue:"#483d8b",gray:"#808080",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",deeppink:"#ff1493",deepskyblue:"#00bfff",wheat:"#f5deb3",firebrick:"#b22222",floralwhite:"#fffaf0",ghostwhite:"#f8f8ff",darkviolet:"#9400d3",magenta:"#ff00ff",green:"#008000",dodgerblue:"#1e90ff",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",blueviolet:"#8a2be2",forestgreen:"#228b22",lawngreen:"#7cfc00",indianred:"#cd5c5c",indigo:"#4b0082",fuchsia:"#ff00ff",brown:"#a52a2a",maroon:"#800000",mediumblue:"#0000cd",lightcoral:"#f08080",darkturquoise:"#00ced1",lightcyan:"#e0ffff",ivory:"#fffff0",lightyellow:"#ffffe0",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",linen:"#faf0e6",mediumaquamarine:"#66cdaa",lemonchiffon:"#fffacd",lime:"#00ff00",khaki:"#f0e68c",mediumseagreen:"#3cb371",limegreen:"#32cd32",mediumspringgreen:"#00fa9a",lightskyblue:"#87cefa",lightblue:"#add8e6",midnightblue:"#191970",lightpink:"#ffb6c1",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",mintcream:"#f5fffa",lightslategray:"#778899",lightslategrey:"#778899",navajowhite:"#ffdead",navy:"#000080",mediumvioletred:"#c71585",powderblue:"#b0e0e6",palegoldenrod:"#eee8aa",oldlace:"#fdf5e6",paleturquoise:"#afeeee",mediumturquoise:"#48d1cc",mediumorchid:"#ba55d3",rebeccapurple:"#663399",lightsteelblue:"#b0c4de",mediumslateblue:"#7b68ee",thistle:"#d8bfd8",tan:"#d2b48c",orchid:"#da70d6",mediumpurple:"#9370db",purple:"#800080",pink:"#ffc0cb",skyblue:"#87ceeb",springgreen:"#00ff7f",palegreen:"#98fb98",red:"#ff0000",yellow:"#ffff00",slateblue:"#6a5acd",lavenderblush:"#fff0f5",peru:"#cd853f",palevioletred:"#db7093",violet:"#ee82ee",teal:"#008080",slategray:"#708090",slategrey:"#708090",aliceblue:"#f0f8ff",darkseagreen:"#8fbc8f",darkolivegreen:"#556b2f",greenyellow:"#adff2f",seagreen:"#2e8b57",seashell:"#fff5ee",tomato:"#ff6347",silver:"#c0c0c0",sienna:"#a0522d",lavender:"#e6e6fa",lightgreen:"#90ee90",orange:"#ffa500",orangered:"#ff4500",steelblue:"#4682b4",royalblue:"#4169e1",turquoise:"#40e0d0",yellowgreen:"#9acd32",salmon:"#fa8072",saddlebrown:"#8b4513",sandybrown:"#f4a460",rosybrown:"#bc8f8f",darksalmon:"#e9967a",lightgoldenrodyellow:"#fafad2",snow:"#fffafa",lightgrey:"#d3d3d3",lightgray:"#d3d3d3",dimgray:"#696969",dimgrey:"#696969",olivedrab:"#6b8e23",olive:"#808000"},Z={};for(var K in $)Z[$[K]]=K;var W={};J.prototype.toName=function(X){if(!(this.rgba.a||this.rgba.r||this.rgba.g||this.rgba.b))return"transparent";var H,q,N=Z[this.toHex()];if(N)return N;if(X==null?void 0:X.closest){var Y=this.toRgb(),U=1/0,V="black";if(!W.length)for(var z in $)W[z]=new J($[z]).toRgb();for(var D in $){var w=(H=Y,q=W[D],Math.pow(H.r-q.r,2)+Math.pow(H.g-q.g,2)+Math.pow(H.b-q.b,2));w<U&&(U=w,V=D)}return V}},Q.string.push([function(X){var H=X.toLowerCase(),q=H==="transparent"?"#0000":$[H];return q?new J(q).toRgb():null},"name"])}var AJ=class J{constructor(Q=16777215){this._value=null,this._components=new Float32Array(4),this._components.fill(1),this._int=16777215,this.value=Q}get red(){return this._components[0]}get green(){return this._components[1]}get blue(){return this._components[2]}get alpha(){return this._components[3]}setValue(Q){return this.value=Q,this}set value(Q){if(Q instanceof J)this._value=this._cloneSource(Q._value),this._int=Q._int,this._components.set(Q._components);else if(Q===null)throw Error("Cannot set Color#value to null");else if(this._value===null||!this._isSourceEqual(this._value,Q))this._value=this._cloneSource(Q),this._normalize(this._value)}get value(){return this._value}_cloneSource(Q){if(typeof Q==="string"||typeof Q==="number"||Q instanceof Number||Q===null)return Q;else if(Array.isArray(Q)||ArrayBuffer.isView(Q))return Q.slice(0);else if(typeof Q==="object"&&Q!==null)return{...Q};return Q}_isSourceEqual(Q,$){let Z=typeof Q;if(Z!==typeof $)return!1;else if(Z==="number"||Z==="string"||Q instanceof Number)return Q===$;else if(Array.isArray(Q)&&Array.isArray($)||ArrayBuffer.isView(Q)&&ArrayBuffer.isView($)){if(Q.length!==$.length)return!1;return Q.every((W,X)=>W===$[X])}else if(Q!==null&&$!==null){let W=Object.keys(Q),X=Object.keys($);if(W.length!==X.length)return!1;return W.every((H)=>Q[H]===$[H])}return Q===$}toRgba(){let[Q,$,Z,K]=this._components;return{r:Q,g:$,b:Z,a:K}}toRgb(){let[Q,$,Z]=this._components;return{r:Q,g:$,b:Z}}toRgbaString(){let[Q,$,Z]=this.toUint8RgbArray();return`rgba(${Q},${$},${Z},${this.alpha})`}toUint8RgbArray(Q){let[$,Z,K]=this._components;if(!this._arrayRgb)this._arrayRgb=[];return Q||(Q=this._arrayRgb),Q[0]=Math.round($*255),Q[1]=Math.round(Z*255),Q[2]=Math.round(K*255),Q}toArray(Q){if(!this._arrayRgba)this._arrayRgba=[];Q||(Q=this._arrayRgba);let[$,Z,K,W]=this._components;return Q[0]=$,Q[1]=Z,Q[2]=K,Q[3]=W,Q}toRgbArray(Q){if(!this._arrayRgb)this._arrayRgb=[];Q||(Q=this._arrayRgb);let[$,Z,K]=this._components;return Q[0]=$,Q[1]=Z,Q[2]=K,Q}toNumber(){return this._int}toBgrNumber(){let[Q,$,Z]=this.toUint8RgbArray();return(Z<<16)+($<<8)+Q}toLittleEndianNumber(){let Q=this._int;return(Q>>16)+(Q&65280)+((Q&255)<<16)}multiply(Q){let[$,Z,K,W]=J._temp.setValue(Q)._components;return this._components[0]*=$,this._components[1]*=Z,this._components[2]*=K,this._components[3]*=W,this._refreshInt(),this._value=null,this}premultiply(Q,$=!0){if($)this._components[0]*=Q,this._components[1]*=Q,this._components[2]*=Q;return this._components[3]=Q,this._refreshInt(),this._value=null,this}toPremultiplied(Q,$=!0){if(Q===1)return-16777216+this._int;if(Q===0)return $?0:this._int;let Z=this._int>>16&255,K=this._int>>8&255,W=this._int&255;if($)Z=Z*Q+0.5|0,K=K*Q+0.5|0,W=W*Q+0.5|0;return(Q*255<<24)+(Z<<16)+(K<<8)+W}toHex(){let Q=this._int.toString(16);return`#${"000000".substring(0,6-Q.length)+Q}`}toHexa(){let $=Math.round(this._components[3]*255).toString(16);return this.toHex()+"00".substring(0,2-$.length)+$}setAlpha(Q){return this._components[3]=this._clamp(Q),this}_normalize(Q){let $,Z,K,W;if((typeof Q==="number"||Q instanceof Number)&&Q>=0&&Q<=16777215){let X=Q;$=(X>>16&255)/255,Z=(X>>8&255)/255,K=(X&255)/255,W=1}else if((Array.isArray(Q)||Q instanceof Float32Array)&&Q.length>=3&&Q.length<=4)Q=this._clamp(Q),[$,Z,K,W=1]=Q;else if((Q instanceof Uint8Array||Q instanceof Uint8ClampedArray)&&Q.length>=3&&Q.length<=4)Q=this._clamp(Q,0,255),[$,Z,K,W=255]=Q,$/=255,Z/=255,K/=255,W/=255;else if(typeof Q==="string"||typeof Q==="object"){if(typeof Q==="string"){let H=J.HEX_PATTERN.exec(Q);if(H)Q=`#${H[2]}`}let X=b6(Q);if(X.isValid())({r:$,g:Z,b:K,a:W}=X.rgba),$/=255,Z/=255,K/=255}if($!==void 0)this._components[0]=$,this._components[1]=Z,this._components[2]=K,this._components[3]=W,this._refreshInt();else throw Error(`Unable to convert color ${Q}`)}_refreshInt(){this._clamp(this._components);let[Q,$,Z]=this._components;this._int=(Q*255<<16)+($*255<<8)+(Z*255|0)}_clamp(Q,$=0,Z=1){if(typeof Q==="number")return Math.min(Math.max(Q,$),Z);return Q.forEach((K,W)=>{Q[W]=Math.min(Math.max(K,$),Z)}),Q}static isColorLike(Q){return typeof Q==="number"||typeof Q==="string"||Q instanceof Number||Q instanceof J||Array.isArray(Q)||Q instanceof Uint8Array||Q instanceof Uint8ClampedArray||Q instanceof Float32Array||Q.r!==void 0&&Q.g!==void 0&&Q.b!==void 0||Q.r!==void 0&&Q.g!==void 0&&Q.b!==void 0&&Q.a!==void 0||Q.h!==void 0&&Q.s!==void 0&&Q.l!==void 0||Q.h!==void 0&&Q.s!==void 0&&Q.l!==void 0&&Q.a!==void 0||Q.h!==void 0&&Q.s!==void 0&&Q.v!==void 0||Q.h!==void 0&&Q.s!==void 0&&Q.v!==void 0&&Q.a!==void 0}},G6;var A9=A(()=>{Xq();Wq([IK]);AJ.shared=new AJ;AJ._temp=new AJ;AJ.HEX_PATTERN=/^(#|0x)?(([a-f0-9]{3}){1,2}([a-f0-9]{2})?)$/i;G6=AJ});var Hq;var qq=A(()=>{Hq={cullArea:null,cullable:!1,cullableChildren:!0}});var Nq,Yq,Uq;var LK=A(()=>{Nq=Math.PI*2,Yq=180/Math.PI,Uq=Math.PI/180});class O8{constructor(J=0,Q=0){this.x=0,this.y=0,this.x=J,this.y=Q}clone(){return new O8(this.x,this.y)}copyFrom(J){return this.set(J.x,J.y),this}copyTo(J){return J.set(this.x,this.y),J}equals(J){return J.x===this.x&&J.y===this.y}set(J=0,Q=J){return this.x=J,this.y=Q,this}toString(){return`[pixi.js/math:Point x=${this.x} y=${this.y}]`}static get shared(){return GK.x=0,GK.y=0,GK}}var GK;var A7=A(()=>{GK=new O8});class R0{constructor(J=1,Q=0,$=0,Z=1,K=0,W=0){this.array=null,this.a=J,this.b=Q,this.c=$,this.d=Z,this.tx=K,this.ty=W}fromArray(J){this.a=J[0],this.b=J[1],this.c=J[3],this.d=J[4],this.tx=J[2],this.ty=J[5]}set(J,Q,$,Z,K,W){return this.a=J,this.b=Q,this.c=$,this.d=Z,this.tx=K,this.ty=W,this}toArray(J,Q){if(!this.array)this.array=new Float32Array(9);let $=Q||this.array;if(J)$[0]=this.a,$[1]=this.b,$[2]=0,$[3]=this.c,$[4]=this.d,$[5]=0,$[6]=this.tx,$[7]=this.ty,$[8]=1;else $[0]=this.a,$[1]=this.c,$[2]=this.tx,$[3]=this.b,$[4]=this.d,$[5]=this.ty,$[6]=0,$[7]=0,$[8]=1;return $}apply(J,Q){Q=Q||new O8;let{x:$,y:Z}=J;return Q.x=this.a*$+this.c*Z+this.tx,Q.y=this.b*$+this.d*Z+this.ty,Q}applyInverse(J,Q){Q=Q||new O8;let $=this.a,Z=this.b,K=this.c,W=this.d,X=this.tx,H=this.ty,q=1/($*W+K*-Z),N=J.x,Y=J.y;return Q.x=W*q*N+-K*q*Y+(H*K-X*W)*q,Q.y=$*q*Y+-Z*q*N+(-H*$+X*Z)*q,Q}translate(J,Q){return this.tx+=J,this.ty+=Q,this}scale(J,Q){return this.a*=J,this.d*=Q,this.c*=J,this.b*=Q,this.tx*=J,this.ty*=Q,this}rotate(J){let Q=Math.cos(J),$=Math.sin(J),Z=this.a,K=this.c,W=this.tx;return this.a=Z*Q-this.b*$,this.b=Z*$+this.b*Q,this.c=K*Q-this.d*$,this.d=K*$+this.d*Q,this.tx=W*Q-this.ty*$,this.ty=W*$+this.ty*Q,this}append(J){let Q=this.a,$=this.b,Z=this.c,K=this.d;return this.a=J.a*Q+J.b*Z,this.b=J.a*$+J.b*K,this.c=J.c*Q+J.d*Z,this.d=J.c*$+J.d*K,this.tx=J.tx*Q+J.ty*Z+this.tx,this.ty=J.tx*$+J.ty*K+this.ty,this}appendFrom(J,Q){let{a:$,b:Z,c:K,d:W,tx:X,ty:H}=J,q=Q.a,N=Q.b,Y=Q.c,U=Q.d;return this.a=$*q+Z*Y,this.b=$*N+Z*U,this.c=K*q+W*Y,this.d=K*N+W*U,this.tx=X*q+H*Y+Q.tx,this.ty=X*N+H*U+Q.ty,this}setTransform(J,Q,$,Z,K,W,X,H,q){return this.a=Math.cos(X+q)*K,this.b=Math.sin(X+q)*K,this.c=-Math.sin(X-H)*W,this.d=Math.cos(X-H)*W,this.tx=J-($*this.a+Z*this.c),this.ty=Q-($*this.b+Z*this.d),this}prepend(J){let Q=this.tx;if(J.a!==1||J.b!==0||J.c!==0||J.d!==1){let $=this.a,Z=this.c;this.a=$*J.a+this.b*J.c,this.b=$*J.b+this.b*J.d,this.c=Z*J.a+this.d*J.c,this.d=Z*J.b+this.d*J.d}return this.tx=Q*J.a+this.ty*J.c+J.tx,this.ty=Q*J.b+this.ty*J.d+J.ty,this}decompose(J){let Q=this.a,$=this.b,Z=this.c,K=this.d,W=J.pivot,X=-Math.atan2(-Z,K),H=Math.atan2($,Q),q=Math.abs(X+H);if(q<0.00001||Math.abs(Nq-q)<0.00001)J.rotation=H,J.skew.x=J.skew.y=0;else J.rotation=0,J.skew.x=X,J.skew.y=H;return J.scale.x=Math.sqrt(Q*Q+$*$),J.scale.y=Math.sqrt(Z*Z+K*K),J.position.x=this.tx+(W.x*Q+W.y*Z),J.position.y=this.ty+(W.x*$+W.y*K),J}invert(){let J=this.a,Q=this.b,$=this.c,Z=this.d,K=this.tx,W=J*Z-Q*$;return this.a=Z/W,this.b=-Q/W,this.c=-$/W,this.d=J/W,this.tx=($*this.ty-Z*K)/W,this.ty=-(J*this.ty-Q*K)/W,this}isIdentity(){return this.a===1&&this.b===0&&this.c===0&&this.d===1&&this.tx===0&&this.ty===0}identity(){return this.a=1,this.b=0,this.c=0,this.d=1,this.tx=0,this.ty=0,this}clone(){let J=new R0;return J.a=this.a,J.b=this.b,J.c=this.c,J.d=this.d,J.tx=this.tx,J.ty=this.ty,J}copyTo(J){return J.a=this.a,J.b=this.b,J.c=this.c,J.d=this.d,J.tx=this.tx,J.ty=this.ty,J}copyFrom(J){return this.a=J.a,this.b=J.b,this.c=J.c,this.d=J.d,this.tx=J.tx,this.ty=J.ty,this}equals(J){return J.a===this.a&&J.b===this.b&&J.c===this.c&&J.d===this.d&&J.tx===this.tx&&J.ty===this.ty}toString(){return`[pixi.js:Matrix a=${this.a} b=${this.b} c=${this.c} d=${this.d} tx=${this.tx} ty=${this.ty}]`}static get IDENTITY(){return uD.identity()}static get shared(){return cD.identity()}}var cD,uD;var E8=A(()=>{LK();A7();cD=new R0,uD=new R0});class x8{constructor(J,Q,$){this._x=Q||0,this._y=$||0,this._observer=J}clone(J){return new x8(J??this._observer,this._x,this._y)}set(J=0,Q=J){if(this._x!==J||this._y!==Q)this._x=J,this._y=Q,this._observer._onUpdate(this);return this}copyFrom(J){if(this._x!==J.x||this._y!==J.y)this._x=J.x,this._y=J.y,this._observer._onUpdate(this);return this}copyTo(J){return J.set(this._x,this._y),J}equals(J){return J.x===this._x&&J.y===this._y}toString(){return`[pixi.js/math:ObservablePoint x=${this._x} y=${this._y} scope=${this._observer}]`}get x(){return this._x}set x(J){if(this._x!==J)this._x=J,this._observer._onUpdate(this)}get y(){return this._y}set y(J){if(this._y!==J)this._y=J,this._observer._onUpdate(this)}}var BK=()=>{};function i0(J="default"){if(RK[J]===void 0)RK[J]=-1;return++RK[J]}var RK;var W6=A(()=>{RK={default:-1}});var Vq,Z6="8.0.0",CJ,u0=(J,Q,$=3)=>{if(CJ.quiet||Vq.has(Q))return;let Z=Error().stack,K=`${Q}
Deprecated since v${J}`,W=typeof console.groupCollapsed==="function"&&!CJ.noColor;if(typeof Z>"u")console.warn("PixiJS Deprecation Warning: ",K);else if(Z=Z.split(`
`).splice($).join(`
`),W)console.groupCollapsed("%cPixiJS Deprecation Warning: %c%s","color:#614108;background:#fffbe6","font-weight:normal;color:#614108;background:#fffbe6",K),console.warn(Z),console.groupEnd();else console.warn("PixiJS Deprecation Warning: ",K),console.warn(Z);Vq.add(Q)};var F6=A(()=>{Vq=new Set,CJ={quiet:!1,noColor:!1};Object.defineProperties(u0,{quiet:{get:()=>CJ.quiet,set:(J)=>{CJ.quiet=J},enumerable:!0,configurable:!1},noColor:{get:()=>CJ.noColor,set:(J)=>{CJ.noColor=J},enumerable:!0,configurable:!1}})});function v0(...J){if(AK===Oq)return;if(AK++,AK===Oq)console.warn("PixiJS Warning: too many warnings, no more warnings will be reported to the console by PixiJS.");else console.warn("PixiJS Warning: ",...J)}var AK=0,Oq=500;var s8=()=>{};var i6;var _J=A(()=>{i6={_registeredResources:new Set,register(J){this._registeredResources.add(J)},unregister(J){this._registeredResources.delete(J)},release(){this._registeredResources.forEach((J)=>J.clear())},get registeredCount(){return this._registeredResources.size},isRegistered(J){return this._registeredResources.has(J)},reset(){this._registeredResources.clear()}}});class CK{constructor(J,Q){if(this._pool=[],this._count=0,this._index=0,this._classType=J,Q)this.prepopulate(Q)}prepopulate(J){for(let Q=0;Q<J;Q++)this._pool[this._index++]=new this._classType;this._count+=J}get(J){let Q;if(this._index>0)Q=this._pool[--this._index];else Q=new this._classType,this._count++;return Q.init?.(J),Q}return(J){J.reset?.(),this._pool[this._index++]=J}get totalSize(){return this._count}get totalFree(){return this._index}get totalUsed(){return this._count-this._index}clear(){if(this._pool.length>0&&this._pool[0].destroy)for(let J=0;J<this._index;J++)this._pool[J].destroy();this._pool.length=0,this._count=0,this._index=0}}var Fq=()=>{};class zq{constructor(){this._poolsByClass=new Map}prepopulate(J,Q){this.getPool(J).prepopulate(Q)}get(J,Q){return this.getPool(J).get(Q)}return(J){this.getPool(J.constructor).return(J)}getPool(J){if(!this._poolsByClass.has(J))this._poolsByClass.set(J,new CK(J));return this._poolsByClass.get(J)}stats(){let J={};return this._poolsByClass.forEach((Q)=>{let $=J[Q._classType.name]?Q._classType.name+Q._classType.ID:Q._classType.name;J[$]={free:Q.totalFree,used:Q.totalUsed,size:Q.totalSize}}),J}clear(){this._poolsByClass.forEach((J)=>J.clear()),this._poolsByClass.clear()}}var n8;var EJ=A(()=>{_J();Fq();n8=new zq;i6.register(n8)});var Dq;var kq=A(()=>{F6();Dq={get isCachedAsTexture(){return!!this.renderGroup?.isCachedAsTexture},cacheAsTexture(J){if(typeof J==="boolean"&&J===!1)this.disableRenderGroup();else this.enableRenderGroup(),this.renderGroup.enableCacheAsTexture(J===!0?{}:J)},updateCacheTexture(){this.renderGroup?.updateCacheTexture()},get cacheAsBitmap(){return this.isCachedAsTexture},set cacheAsBitmap(J){u0("v8.6.0","cacheAsBitmap is deprecated, use cacheAsTexture instead."),this.cacheAsTexture(J)}}});function yQ(J,Q,$){let Z=J.length,K;if(Q>=Z||$===0)return;$=Q+$>Z?Z-Q:$;let W=Z-$;for(K=Q;K<W;++K)J[K]=J[K+$];J.length=W}var _K=()=>{};var Mq;var wq=A(()=>{_K();F6();Mq={allowChildren:!0,removeChildren(J=0,Q){let $=Q??this.children.length,Z=$-J,K=[];if(Z>0&&Z<=$){for(let X=$-1;X>=J;X--){let H=this.children[X];if(!H)continue;K.push(H),H.parent=null}yQ(this.children,J,$);let W=this.renderGroup||this.parentRenderGroup;if(W)W.removeChildren(K);for(let X=0;X<K.length;++X){let H=K[X];H.parentRenderLayer?.detach(H),this.emit("childRemoved",H,this,X),K[X].emit("removed",this)}if(K.length>0)this._didViewChangeTick++;return K}else if(Z===0&&this.children.length===0)return K;throw RangeError("removeChildren: numeric values are outside the acceptable range.")},removeChildAt(J){let Q=this.getChildAt(J);return this.removeChild(Q)},getChildAt(J){if(J<0||J>=this.children.length)throw Error(`getChildAt: Index (${J}) does not exist.`);return this.children[J]},setChildIndex(J,Q){if(Q<0||Q>=this.children.length)throw Error(`The index ${Q} supplied is out of bounds ${this.children.length}`);this.getChildIndex(J),this.addChildAt(J,Q)},getChildIndex(J){let Q=this.children.indexOf(J);if(Q===-1)throw Error("The supplied Container must be a child of the caller");return Q},addChildAt(J,Q){if(!this.allowChildren)u0(Z6,"addChildAt: Only Containers will be allowed to add children in v8.0.0");let{children:$}=this;if(Q<0||Q>$.length)throw Error(`${J}addChildAt: The index ${Q} supplied is out of bounds ${$.length}`);if(J.parent){let K=J.parent.children.indexOf(J);if(J.parent===this&&K===Q)return J;if(K!==-1)J.parent.children.splice(K,1)}if(Q===$.length)$.push(J);else $.splice(Q,0,J);J.parent=this,J.didChange=!0,J._updateFlags=15;let Z=this.renderGroup||this.parentRenderGroup;if(Z)Z.addChild(J);if(this.sortableChildren)this.sortDirty=!0;return this.emit("childAdded",J,this,Q),J.emit("added",this),J},swapChildren(J,Q){if(J===Q)return;let $=this.getChildIndex(J),Z=this.getChildIndex(Q);this.children[$]=Q,this.children[Z]=J;let K=this.renderGroup||this.parentRenderGroup;if(K)K.structureDidChange=!0;this._didContainerChangeTick++},removeFromParent(){this.parent?.removeChild(this)},reparentChild(...J){if(J.length===1)return this.reparentChildAt(J[0],this.children.length);return J.forEach((Q)=>this.reparentChildAt(Q,this.children.length)),J[0]},reparentChildAt(J,Q){if(J.parent===this)return this.setChildIndex(J,Q),J;let $=J.worldTransform.clone();J.removeFromParent(),this.addChildAt(J,Q);let Z=this.worldTransform.clone();return Z.invert(),$.prepend(Z),J.setFromMatrix($),J},replaceChild(J,Q){J.updateLocalTransform(),this.addChildAt(Q,this.getChildIndex(J)),Q.setFromMatrix(J.localTransform),Q.updateLocalTransform(),this.removeChild(J)}}});var Iq;var Lq=A(()=>{Iq={collectRenderables(J,Q,$){if(this.parentRenderLayer&&this.parentRenderLayer!==$||this.globalDisplayStatus<7||!this.includeInBuild)return;if(this.sortableChildren)this.sortChildren();if(this.isSimple)this.collectRenderablesSimple(J,Q,$);else if(this.renderGroup)Q.renderPipes.renderGroup.addRenderGroup(this.renderGroup,J);else this.collectRenderablesWithEffects(J,Q,$)},collectRenderablesSimple(J,Q,$){let Z=this.children,K=Z.length;for(let W=0;W<K;W++)Z[W].collectRenderables(J,Q,$)},collectRenderablesWithEffects(J,Q,$){let{renderPipes:Z}=Q;for(let K=0;K<this.effects.length;K++){let W=this.effects[K];Z[W.pipe].push(W,this,J)}this.collectRenderablesSimple(J,Q,$);for(let K=this.effects.length-1;K>=0;K--){let W=this.effects[K];Z[W.pipe].pop(W,this,J)}}}});class C7{constructor(){this.pipe="filter",this.priority=1}destroy(){for(let J=0;J<this.filters.length;J++)this.filters[J].destroy();this.filters=null,this.filterArea=null}}var bQ=()=>{};class Gq{constructor(){this._effectClasses=[],this._tests=[],this._initialized=!1}init(){if(this._initialized)return;this._initialized=!0,this._effectClasses.forEach((J)=>{this.add({test:J.test,maskClass:J})})}add(J){this._tests.push(J)}getMaskEffect(J){if(!this._initialized)this.init();for(let Q=0;Q<this._tests.length;Q++){let $=this._tests[Q];if($.test(J))return n8.get($.maskClass,J)}return J}returnMaskEffect(J){n8.return(J)}}var vQ;var Bq=A(()=>{k0();EJ();vQ=new Gq;n0.handleByList(b.MaskEffect,vQ._effectClasses)});var Rq;var Aq=A(()=>{bQ();Bq();Rq={_maskEffect:null,_maskOptions:{inverse:!1},_filterEffect:null,effects:[],_markStructureAsChanged(){let J=this.renderGroup||this.parentRenderGroup;if(J)J.structureDidChange=!0},addEffect(J){if(this.effects.indexOf(J)!==-1)return;this.effects.push(J),this.effects.sort(($,Z)=>$.priority-Z.priority),this._markStructureAsChanged(),this._updateIsSimple()},removeEffect(J){let Q=this.effects.indexOf(J);if(Q===-1)return;this.effects.splice(Q,1),this._markStructureAsChanged(),this._updateIsSimple()},set mask(J){let Q=this._maskEffect;if(Q?.mask===J)return;if(Q)this.removeEffect(Q),vQ.returnMaskEffect(Q),this._maskEffect=null;if(J===null||J===void 0)return;this._maskEffect=vQ.getMaskEffect(J),this.addEffect(this._maskEffect)},get mask(){return this._maskEffect?.mask},setMask(J){if(this._maskOptions={...this._maskOptions,...J},J.mask)this.mask=J.mask;this._markStructureAsChanged()},set filters(J){if(!Array.isArray(J)&&J)J=[J];let Q=this._filterEffect||(this._filterEffect=new C7);J=J;let $=J?.length>0,Z=Q.filters?.length>0,K=$!==Z;if(J=Array.isArray(J)?J.slice(0):J,Q.filters=Object.freeze(J),K)if($)this.addEffect(Q);else this.removeEffect(Q),Q.filters=J??null},get filters(){return this._filterEffect?.filters},set filterArea(J){this._filterEffect||(this._filterEffect=new C7),this._filterEffect.filterArea=J},get filterArea(){return this._filterEffect?.filterArea}}});var Cq;var _q=A(()=>{F6();Cq={label:null,get name(){return u0(Z6,"Container.name property has been removed, use Container.label instead"),this.label},set name(J){u0(Z6,"Container.name property has been removed, use Container.label instead"),this.label=J},getChildByName(J,Q=!1){return this.getChildByLabel(J,Q)},getChildByLabel(J,Q=!1){let $=this.children;for(let Z=0;Z<$.length;Z++){let K=$[Z];if(K.label===J||J instanceof RegExp&&J.test(K.label))return K}if(Q)for(let Z=0;Z<$.length;Z++){let W=$[Z].getChildByLabel(J,!0);if(W)return W}return null},getChildrenByLabel(J,Q=!1,$=[]){let Z=this.children;for(let K=0;K<Z.length;K++){let W=Z[K];if(W.label===J||J instanceof RegExp&&J.test(W.label))$.push(W)}if(Q)for(let K=0;K<Z.length;K++)Z[K].getChildrenByLabel(J,!0,$);return $}}});class G8{constructor(J=0,Q=0,$=0,Z=0){this.type="rectangle",this.x=Number(J),this.y=Number(Q),this.width=Number($),this.height=Number(Z)}get left(){return this.x}get right(){return this.x+this.width}get top(){return this.y}get bottom(){return this.y+this.height}isEmpty(){return this.left===this.right||this.top===this.bottom}static get EMPTY(){return new G8(0,0,0,0)}clone(){return new G8(this.x,this.y,this.width,this.height)}copyFromBounds(J){return this.x=J.minX,this.y=J.minY,this.width=J.maxX-J.minX,this.height=J.maxY-J.minY,this}copyFrom(J){return this.x=J.x,this.y=J.y,this.width=J.width,this.height=J.height,this}copyTo(J){return J.copyFrom(this),J}contains(J,Q){if(this.width<=0||this.height<=0)return!1;if(J>=this.x&&J<this.x+this.width){if(Q>=this.y&&Q<this.y+this.height)return!0}return!1}strokeContains(J,Q,$,Z=0.5){let{width:K,height:W}=this;if(K<=0||W<=0)return!1;let X=this.x,H=this.y,q=$*(1-Z),N=$-q,Y=X-q,U=X+K+q,V=H-q,z=H+W+q,D=X+N,w=X+K-N,F=H+N,O=H+W-N;return J>=Y&&J<=U&&Q>=V&&Q<=z&&!(J>D&&J<w&&Q>F&&Q<O)}intersects(J,Q){if(!Q){let j=this.x<J.x?J.x:this.x;if((this.right>J.right?J.right:this.right)<=j)return!1;let E=this.y<J.y?J.y:this.y;return(this.bottom>J.bottom?J.bottom:this.bottom)>E}let $=this.left,Z=this.right,K=this.top,W=this.bottom;if(Z<=$||W<=K)return!1;let X=fQ[0].set(J.left,J.top),H=fQ[1].set(J.left,J.bottom),q=fQ[2].set(J.right,J.top),N=fQ[3].set(J.right,J.bottom);if(q.x<=X.x||H.y<=X.y)return!1;let Y=Math.sign(Q.a*Q.d-Q.b*Q.c);if(Y===0)return!1;if(Q.apply(X,X),Q.apply(H,H),Q.apply(q,q),Q.apply(N,N),Math.max(X.x,H.x,q.x,N.x)<=$||Math.min(X.x,H.x,q.x,N.x)>=Z||Math.max(X.y,H.y,q.y,N.y)<=K||Math.min(X.y,H.y,q.y,N.y)>=W)return!1;let U=Y*(H.y-X.y),V=Y*(X.x-H.x),z=U*$+V*K,D=U*Z+V*K,w=U*$+V*W,F=U*Z+V*W;if(Math.max(z,D,w,F)<=U*X.x+V*X.y||Math.min(z,D,w,F)>=U*N.x+V*N.y)return!1;let O=Y*(X.y-q.y),G=Y*(q.x-X.x),R=O*$+G*K,B=O*Z+G*K,y=O*$+G*W,C=O*Z+G*W;if(Math.max(R,B,y,C)<=O*X.x+G*X.y||Math.min(R,B,y,C)>=O*N.x+G*N.y)return!1;return!0}pad(J=0,Q=J){return this.x-=J,this.y-=Q,this.width+=J*2,this.height+=Q*2,this}fit(J){let Q=Math.max(this.x,J.x),$=Math.min(this.x+this.width,J.x+J.width),Z=Math.max(this.y,J.y),K=Math.min(this.y+this.height,J.y+J.height);return this.x=Q,this.width=Math.max($-Q,0),this.y=Z,this.height=Math.max(K-Z,0),this}ceil(J=1,Q=0.001){let $=Math.ceil((this.x+this.width-Q)*J)/J,Z=Math.ceil((this.y+this.height-Q)*J)/J;return this.x=Math.floor((this.x+Q)*J)/J,this.y=Math.floor((this.y+Q)*J)/J,this.width=$-this.x,this.height=Z-this.y,this}scale(J,Q=J){return this.x*=J,this.y*=Q,this.width*=J,this.height*=Q,this}enlarge(J){let Q=Math.min(this.x,J.x),$=Math.max(this.x+this.width,J.x+J.width),Z=Math.min(this.y,J.y),K=Math.max(this.y+this.height,J.y+J.height);return this.x=Q,this.width=$-Q,this.y=Z,this.height=K-Z,this}getBounds(J){return J||(J=new G8),J.copyFrom(this),J}containsRect(J){if(this.width<=0||this.height<=0)return!1;let{x:Q,y:$}=J,Z=J.x+J.width,K=J.y+J.height;return Q>=this.x&&Q<this.x+this.width&&$>=this.y&&$<this.y+this.height&&Z>=this.x&&Z<this.x+this.width&&K>=this.y&&K<this.y+this.height}set(J,Q,$,Z){return this.x=J,this.y=Q,this.width=$,this.height=Z,this}toString(){return`[pixi.js/math:Rectangle x=${this.x} y=${this.y} width=${this.width} height=${this.height}]`}}var fQ;var _7=A(()=>{A7();fQ=[new O8,new O8,new O8,new O8]});class B8{constructor(J=1/0,Q=1/0,$=-1/0,Z=-1/0){this.minX=1/0,this.minY=1/0,this.maxX=-1/0,this.maxY=-1/0,this.matrix=Eq,this.minX=J,this.minY=Q,this.maxX=$,this.maxY=Z}isEmpty(){return this.minX>this.maxX||this.minY>this.maxY}get rectangle(){if(!this._rectangle)this._rectangle=new G8;let J=this._rectangle;if(this.minX>this.maxX||this.minY>this.maxY)J.x=0,J.y=0,J.width=0,J.height=0;else J.copyFromBounds(this);return J}clear(){return this.minX=1/0,this.minY=1/0,this.maxX=-1/0,this.maxY=-1/0,this.matrix=Eq,this}set(J,Q,$,Z){this.minX=J,this.minY=Q,this.maxX=$,this.maxY=Z}addFrame(J,Q,$,Z,K){K||(K=this.matrix);let{a:W,b:X,c:H,d:q,tx:N,ty:Y}=K,U=this.minX,V=this.minY,z=this.maxX,D=this.maxY,w=W*J+H*Q+N,F=X*J+q*Q+Y;if(w<U)U=w;if(F<V)V=F;if(w>z)z=w;if(F>D)D=F;if(w=W*$+H*Q+N,F=X*$+q*Q+Y,w<U)U=w;if(F<V)V=F;if(w>z)z=w;if(F>D)D=F;if(w=W*J+H*Z+N,F=X*J+q*Z+Y,w<U)U=w;if(F<V)V=F;if(w>z)z=w;if(F>D)D=F;if(w=W*$+H*Z+N,F=X*$+q*Z+Y,w<U)U=w;if(F<V)V=F;if(w>z)z=w;if(F>D)D=F;this.minX=U,this.minY=V,this.maxX=z,this.maxY=D}addRect(J,Q){this.addFrame(J.x,J.y,J.x+J.width,J.y+J.height,Q)}addBounds(J,Q){this.addFrame(J.minX,J.minY,J.maxX,J.maxY,Q)}addBoundsMask(J){this.minX=this.minX>J.minX?this.minX:J.minX,this.minY=this.minY>J.minY?this.minY:J.minY,this.maxX=this.maxX<J.maxX?this.maxX:J.maxX,this.maxY=this.maxY<J.maxY?this.maxY:J.maxY}applyMatrix(J){let Q=this.minX,$=this.minY,Z=this.maxX,K=this.maxY,{a:W,b:X,c:H,d:q,tx:N,ty:Y}=J,U=W*Q+H*$+N,V=X*Q+q*$+Y;this.minX=U,this.minY=V,this.maxX=U,this.maxY=V,U=W*Z+H*$+N,V=X*Z+q*$+Y,this.minX=U<this.minX?U:this.minX,this.minY=V<this.minY?V:this.minY,this.maxX=U>this.maxX?U:this.maxX,this.maxY=V>this.maxY?V:this.maxY,U=W*Q+H*K+N,V=X*Q+q*K+Y,this.minX=U<this.minX?U:this.minX,this.minY=V<this.minY?V:this.minY,this.maxX=U>this.maxX?U:this.maxX,this.maxY=V>this.maxY?V:this.maxY,U=W*Z+H*K+N,V=X*Z+q*K+Y,this.minX=U<this.minX?U:this.minX,this.minY=V<this.minY?V:this.minY,this.maxX=U>this.maxX?U:this.maxX,this.maxY=V>this.maxY?V:this.maxY}fit(J){if(this.minX<J.left)this.minX=J.left;if(this.maxX>J.right)this.maxX=J.right;if(this.minY<J.top)this.minY=J.top;if(this.maxY>J.bottom)this.maxY=J.bottom;return this}fitBounds(J,Q,$,Z){if(this.minX<J)this.minX=J;if(this.maxX>Q)this.maxX=Q;if(this.minY<$)this.minY=$;if(this.maxY>Z)this.maxY=Z;return this}pad(J,Q=J){return this.minX-=J,this.maxX+=J,this.minY-=Q,this.maxY+=Q,this}ceil(){return this.minX=Math.floor(this.minX),this.minY=Math.floor(this.minY),this.maxX=Math.ceil(this.maxX),this.maxY=Math.ceil(this.maxY),this}clone(){return new B8(this.minX,this.minY,this.maxX,this.maxY)}scale(J,Q=J){return this.minX*=J,this.minY*=Q,this.maxX*=J,this.maxY*=Q,this}get x(){return this.minX}set x(J){let Q=this.maxX-this.minX;this.minX=J,this.maxX=J+Q}get y(){return this.minY}set y(J){let Q=this.maxY-this.minY;this.minY=J,this.maxY=J+Q}get width(){return this.maxX-this.minX}set width(J){this.maxX=this.minX+J}get height(){return this.maxY-this.minY}set height(J){this.maxY=this.minY+J}get left(){return this.minX}get right(){return this.maxX}get top(){return this.minY}get bottom(){return this.maxY}get isPositive(){return this.maxX-this.minX>0&&this.maxY-this.minY>0}get isValid(){return this.minX+this.minY!==1/0}addVertexData(J,Q,$,Z){let K=this.minX,W=this.minY,X=this.maxX,H=this.maxY;Z||(Z=this.matrix);let{a:q,b:N,c:Y,d:U,tx:V,ty:z}=Z;for(let D=Q;D<$;D+=2){let w=J[D],F=J[D+1],O=q*w+Y*F+V,G=N*w+U*F+z;K=O<K?O:K,W=G<W?G:W,X=O>X?O:X,H=G>H?G:H}this.minX=K,this.minY=W,this.maxX=X,this.maxY=H}containsPoint(J,Q){if(this.minX<=J&&this.minY<=Q&&this.maxX>=J&&this.maxY>=Q)return!0;return!1}toString(){return`[pixi.js:Bounds minX=${this.minX} minY=${this.minY} maxX=${this.maxX} maxY=${this.maxY} width=${this.width} height=${this.height}]`}copyFrom(J){return this.minX=J.minX,this.minY=J.minY,this.maxX=J.maxX,this.maxY=J.maxY,this}}var Eq;var v6=A(()=>{E8();_7();Eq=new R0});var T8,z6;var n7=A(()=>{E8();EJ();v6();T8=n8.getPool(R0),z6=n8.getPool(B8)});var sD,Pq;var jq=A(()=>{E8();v6();n7();sD=new R0,Pq={getFastGlobalBounds(J,Q){if(Q||(Q=new B8),Q.clear(),this._getGlobalBoundsRecursive(!!J,Q,this.parentRenderLayer),!Q.isValid)Q.set(0,0,0,0);let $=this.renderGroup||this.parentRenderGroup;return Q.applyMatrix($.worldTransform),Q},_getGlobalBoundsRecursive(J,Q,$){let Z=Q;if(J&&this.parentRenderLayer&&this.parentRenderLayer!==$)return;if(this.localDisplayStatus!==7||!this.measurable)return;let K=!!this.effects.length;if(this.renderGroup||K)Z=z6.get().clear();if(this.boundsArea)Q.addRect(this.boundsArea,this.worldTransform);else{if(this.renderPipeId){let X=this.bounds;Z.addFrame(X.minX,X.minY,X.maxX,X.maxY,this.groupTransform)}let W=this.children;for(let X=0;X<W.length;X++)W[X]._getGlobalBoundsRecursive(J,Z,$)}if(K){let W=!1,X=this.renderGroup||this.parentRenderGroup;for(let H=0;H<this.effects.length;H++)if(this.effects[H].addBounds){if(!W)W=!0,Z.applyMatrix(X.worldTransform);this.effects[H].addBounds(Z,!0)}if(W)Z.applyMatrix(X.worldTransform.copyTo(sD).invert());Q.addBounds(Z),z6.return(Z)}else if(this.renderGroup)Q.addBounds(Z,this.relativeGroupTransform),z6.return(Z)}}});function PJ(J,Q,$){$.clear();let Z,K;if(J.parent)if(!Q)K=T8.get().identity(),Z=hQ(J,K);else Z=J.parent.worldTransform;else Z=R0.IDENTITY;if(Sq(J,$,Z,Q),K)T8.return(K);if(!$.isValid)$.set(0,0,0,0);return $}function Sq(J,Q,$,Z){if(!J.visible||!J.measurable)return;let K;if(!Z)J.updateLocalTransform(),K=T8.get(),K.appendFrom(J.localTransform,$);else K=J.worldTransform;let W=Q,X=!!J.effects.length;if(X)Q=z6.get().clear();if(J.boundsArea)Q.addRect(J.boundsArea,K);else{let H=J.bounds;if(H&&!H.isEmpty())Q.matrix=K,Q.addBounds(H);for(let q=0;q<J.children.length;q++)Sq(J.children[q],Q,K,Z)}if(X){for(let H=0;H<J.effects.length;H++)J.effects[H].addBounds?.(Q);W.addBounds(Q,R0.IDENTITY),z6.return(Q)}if(!Z)T8.return(K)}function hQ(J,Q){let $=J.parent;if($)hQ($,Q),$.updateLocalTransform(),Q.append($.localTransform);return Q}var C9=A(()=>{E8();n7()});function Tq(J,Q){if(J===16777215||!Q)return Q;if(Q===16777215||!J)return J;let $=J>>16&255,Z=J>>8&255,K=J&255,W=Q>>16&255,X=Q>>8&255,H=Q&255,q=$*W/255|0,N=Z*X/255|0,Y=K*H/255|0;return(q<<16)+(N<<8)+Y}var yq=()=>{};function jJ(J,Q){if(J===bq)return Q;if(Q===bq)return J;return Tq(J,Q)}var bq=16777215;var EK=A(()=>{yq()});function _9(J){return((J&255)<<16)+(J&65280)+(J>>16&255)}var vq;var fq=A(()=>{E8();C9();n7();EK();vq={getGlobalAlpha(J){if(J){if(this.renderGroup)return this.renderGroup.worldAlpha;if(this.parentRenderGroup)return this.parentRenderGroup.worldAlpha*this.alpha;return this.alpha}let Q=this.alpha,$=this.parent;while($)Q*=$.alpha,$=$.parent;return Q},getGlobalTransform(J=new R0,Q){if(Q)return J.copyFrom(this.worldTransform);this.updateLocalTransform();let $=hQ(this,T8.get().identity());return J.appendFrom(this.localTransform,$),T8.return($),J},getGlobalTint(J){if(J){if(this.renderGroup)return _9(this.renderGroup.worldColor);if(this.parentRenderGroup)return _9(jJ(this.localColor,this.parentRenderGroup.worldColor));return this.tint}let Q=this.localColor,$=this.parent;while($)Q=jJ(Q,$.localColor),$=$.parent;return _9(Q)}}});function SJ(J,Q,$){if(Q.clear(),$||($=R0.IDENTITY),hq(J,Q,$,J,!0),!Q.isValid)Q.set(0,0,0,0);return Q}function hq(J,Q,$,Z,K){let W;if(!K){if(!J.visible||!J.measurable)return;J.updateLocalTransform();let q=J.localTransform;W=T8.get(),W.appendFrom(q,$)}else W=T8.get(),W=$.copyTo(W);let X=Q,H=!!J.effects.length;if(H)Q=z6.get().clear();if(J.boundsArea)Q.addRect(J.boundsArea,W);else{if(J.renderPipeId)Q.matrix=W,Q.addBounds(J.bounds);let q=J.children;for(let N=0;N<q.length;N++)hq(q[N],Q,W,Z,!1)}if(H){for(let q=0;q<J.effects.length;q++)J.effects[q].addLocalBounds?.(Q,Z);X.addBounds(Q,R0.IDENTITY),z6.return(Q)}T8.return(W)}var xQ=A(()=>{E8();n7()});function PK(J,Q){let $=J.children;for(let Z=0;Z<$.length;Z++){let K=$[Z],W=K.uid,X=(K._didViewChangeTick&65535)<<16|K._didContainerChangeTick&65535,H=Q.index;if(Q.data[H]!==W||Q.data[H+1]!==X)Q.data[Q.index]=W,Q.data[Q.index+1]=X,Q.didChange=!0;if(Q.index=H+2,K.children.length)PK(K,Q)}return Q.didChange}var xq=()=>{};var nD,gq;var pq=A(()=>{E8();v6();C9();xQ();xq();nD=new R0,gq={_localBoundsCacheId:-1,_localBoundsCacheData:null,_setWidth(J,Q){let $=Math.sign(this.scale.x)||1;if(Q!==0)this.scale.x=J/Q*$;else this.scale.x=$},_setHeight(J,Q){let $=Math.sign(this.scale.y)||1;if(Q!==0)this.scale.y=J/Q*$;else this.scale.y=$},getLocalBounds(){if(!this._localBoundsCacheData)this._localBoundsCacheData={data:[],index:1,didChange:!1,localBounds:new B8};let J=this._localBoundsCacheData;if(J.index=1,J.didChange=!1,J.data[0]!==this._didViewChangeTick)J.didChange=!0,J.data[0]=this._didViewChangeTick;if(PK(this,J),J.didChange)SJ(this,J.localBounds,nD);return J.localBounds},getBounds(J,Q){return PJ(this,J,Q||new B8)}}});var mq;var dq=A(()=>{mq={_onRender:null,set onRender(J){let Q=this.renderGroup||this.parentRenderGroup;if(!J){if(this._onRender)Q?.removeOnRender(this);this._onRender=null;return}if(!this._onRender)Q?.addOnRender(this);this._onRender=J},get onRender(){return this._onRender}}});function iD(J,Q){return J._zIndex-Q._zIndex}var lq;var cq=A(()=>{lq={_zIndex:0,sortDirty:!1,sortableChildren:!1,get zIndex(){return this._zIndex},set zIndex(J){if(this._zIndex===J)return;this._zIndex=J,this.depthOfChildModified()},depthOfChildModified(){if(this.parent)this.parent.sortableChildren=!0,this.parent.sortDirty=!0;if(this.parentRenderGroup)this.parentRenderGroup.structureDidChange=!0},sortChildren(){if(!this.sortDirty)return;this.sortDirty=!1,this.children.sort(iD)}}});var uq;var sq=A(()=>{A7();n7();uq={getGlobalPosition(J=new O8,Q=!1){if(this.parent)this.parent.toGlobal(this._position,J,Q);else J.x=this._position.x,J.y=this._position.y;return J},toGlobal(J,Q,$=!1){let Z=this.getGlobalTransform(T8.get(),$);return Q=Z.apply(J,Q),T8.return(Z),Q},toLocal(J,Q,$,Z){if(Q)J=Q.toGlobal(J,$,Z);let K=this.getGlobalTransform(T8.get(),Z);return $=K.applyInverse(J,$),T8.return(K),$}}});class jK{constructor(){this.uid=i0("instructionSet"),this.instructions=[],this.instructionSize=0,this.renderables=[],this.gcTick=0}reset(){this.instructionSize=0}destroy(){this.instructions.length=0,this.renderables.length=0,this.renderPipes=null,this.gcTick=0}add(J){this.instructions[this.instructionSize++]=J}log(){this.instructions.length=this.instructionSize,console.table(this.instructions,["type","action"])}}var nq=A(()=>{W6()});function SK(J){return J+=J===0?1:0,--J,J|=J>>>1,J|=J>>>2,J|=J>>>4,J|=J>>>8,J|=J>>>16,J+1}function TK(J){return!(J&J-1)&&!!J}var yK=()=>{};function iq(J){let Q={};for(let $ in J)if(J[$]!==void 0)Q[$]=J[$];return Q}var oq=()=>{};function oD(J){let Q=aq[J];if(Q===void 0)aq[J]=i0("resource");return Q}var aq,rq,TJ;var gQ=A(()=>{O6();W6();F6();aq=Object.create(null);rq=class J extends _8{constructor(Q={}){super();this._resourceType="textureSampler",this._touched=0,this._maxAnisotropy=1,this.destroyed=!1,Q={...J.defaultOptions,...Q},this.addressMode=Q.addressMode,this.addressModeU=Q.addressModeU??this.addressModeU,this.addressModeV=Q.addressModeV??this.addressModeV,this.addressModeW=Q.addressModeW??this.addressModeW,this.scaleMode=Q.scaleMode,this.magFilter=Q.magFilter??this.magFilter,this.minFilter=Q.minFilter??this.minFilter,this.mipmapFilter=Q.mipmapFilter??this.mipmapFilter,this.lodMinClamp=Q.lodMinClamp,this.lodMaxClamp=Q.lodMaxClamp,this.compare=Q.compare,this.maxAnisotropy=Q.maxAnisotropy??1}set addressMode(Q){this.addressModeU=Q,this.addressModeV=Q,this.addressModeW=Q}get addressMode(){return this.addressModeU}set wrapMode(Q){u0(Z6,"TextureStyle.wrapMode is now TextureStyle.addressMode"),this.addressMode=Q}get wrapMode(){return this.addressMode}set scaleMode(Q){this.magFilter=Q,this.minFilter=Q,this.mipmapFilter=Q}get scaleMode(){return this.magFilter}set maxAnisotropy(Q){if(this._maxAnisotropy=Math.min(Q,16),this._maxAnisotropy>1)this.scaleMode="linear"}get maxAnisotropy(){return this._maxAnisotropy}get _resourceId(){return this._sharedResourceId||this._generateResourceId()}update(){this._sharedResourceId=null,this.emit("change",this)}_generateResourceId(){let Q=`${this.addressModeU}-${this.addressModeV}-${this.addressModeW}-${this.magFilter}-${this.minFilter}-${this.mipmapFilter}-${this.lodMinClamp}-${this.lodMaxClamp}-${this.compare}-${this._maxAnisotropy}`;return this._sharedResourceId=oD(Q),this._resourceId}destroy(){this.destroyed=!0,this.emit("destroy",this),this.emit("change",this),this.removeAllListeners()}};rq.defaultOptions={addressMode:"clamp-to-edge",scaleMode:"linear"};TJ=rq});var tq,Q8;var X6=A(()=>{O6();yK();oq();W6();gQ();tq=class J extends _8{constructor(Q={}){super();if(this.options=Q,this._gpuData=Object.create(null),this._gcLastUsed=-1,this.uid=i0("textureSource"),this._resourceType="textureSource",this._resourceId=i0("resource"),this.uploadMethodId="unknown",this._resolution=1,this.pixelWidth=1,this.pixelHeight=1,this.width=1,this.height=1,this.sampleCount=1,this.mipLevelCount=1,this.autoGenerateMipmaps=!1,this.format="rgba8unorm",this.dimension="2d",this.viewDimension="2d",this.arrayLayerCount=1,this.antialias=!1,this._touched=0,this._batchTick=-1,this._textureBindLocation=-1,Q={...J.defaultOptions,...Q},this.label=Q.label??"",this.resource=Q.resource,this.autoGarbageCollect=Q.autoGarbageCollect,this._resolution=Q.resolution,Q.width)this.pixelWidth=Q.width*this._resolution;else this.pixelWidth=this.resource?this.resourceWidth??1:1;if(Q.height)this.pixelHeight=Q.height*this._resolution;else this.pixelHeight=this.resource?this.resourceHeight??1:1;this.width=this.pixelWidth/this._resolution,this.height=this.pixelHeight/this._resolution,this.format=Q.format,this.dimension=Q.dimensions,this.viewDimension=Q.viewDimension??Q.dimensions,this.arrayLayerCount=Q.arrayLayerCount,this.mipLevelCount=Q.mipLevelCount,this.autoGenerateMipmaps=Q.autoGenerateMipmaps,this.sampleCount=Q.sampleCount,this.antialias=Q.antialias,this.alphaMode=Q.alphaMode,this.style=new TJ(iq(Q)),this.destroyed=!1,this._refreshPOT()}get source(){return this}get style(){return this._style}set style(Q){if(this.style===Q)return;this._style?.off("change",this._onStyleChange,this),this._style=Q,this._style?.on("change",this._onStyleChange,this),this._onStyleChange()}set maxAnisotropy(Q){this._style.maxAnisotropy=Q}get maxAnisotropy(){return this._style.maxAnisotropy}get addressMode(){return this._style.addressMode}set addressMode(Q){this._style.addressMode=Q}get repeatMode(){return this._style.addressMode}set repeatMode(Q){this._style.addressMode=Q}get magFilter(){return this._style.magFilter}set magFilter(Q){this._style.magFilter=Q}get minFilter(){return this._style.minFilter}set minFilter(Q){this._style.minFilter=Q}get mipmapFilter(){return this._style.mipmapFilter}set mipmapFilter(Q){this._style.mipmapFilter=Q}get lodMinClamp(){return this._style.lodMinClamp}set lodMinClamp(Q){this._style.lodMinClamp=Q}get lodMaxClamp(){return this._style.lodMaxClamp}set lodMaxClamp(Q){this._style.lodMaxClamp=Q}_onStyleChange(){this.emit("styleChange",this)}update(){if(this.resource){let Q=this._resolution;if(this.resize(this.resourceWidth/Q,this.resourceHeight/Q))return}this.emit("update",this)}destroy(){if(this.destroyed=!0,this.unload(),this.emit("destroy",this),this._style)this._style.destroy(),this._style=null;this.uploadMethodId=null,this.resource=null,this.removeAllListeners()}unload(){this._resourceId=i0("resource"),this.emit("change",this),this.emit("unload",this);for(let Q in this._gpuData)this._gpuData[Q]?.destroy?.();this._gpuData=Object.create(null)}get resourceWidth(){let{resource:Q}=this;return Q.naturalWidth||Q.videoWidth||Q.displayWidth||Q.width}get resourceHeight(){let{resource:Q}=this;return Q.naturalHeight||Q.videoHeight||Q.displayHeight||Q.height}get resolution(){return this._resolution}set resolution(Q){if(this._resolution===Q)return;this._resolution=Q,this.width=this.pixelWidth/Q,this.height=this.pixelHeight/Q}resize(Q,$,Z){Z||(Z=this._resolution),Q||(Q=this.width),$||($=this.height);let K=Math.round(Q*Z),W=Math.round($*Z);if(this.width=K/Z,this.height=W/Z,this._resolution=Z,this.pixelWidth===K&&this.pixelHeight===W)return!1;return this._refreshPOT(),this.pixelWidth=K,this.pixelHeight=W,this.emit("resize",this),this._resourceId=i0("resource"),this.emit("change",this),!0}updateMipmaps(){if(this.autoGenerateMipmaps&&this.mipLevelCount>1)this.emit("updateMipmaps",this)}set wrapMode(Q){this._style.wrapMode=Q}get wrapMode(){return this._style.wrapMode}set scaleMode(Q){this._style.scaleMode=Q}get scaleMode(){return this._style.scaleMode}_refreshPOT(){this.isPowerOfTwo=TK(this.pixelWidth)&&TK(this.pixelHeight)}static test(Q){throw Error("Unimplemented")}};tq.defaultOptions={resolution:1,format:"bgra8unorm",alphaMode:"premultiply-alpha-on-upload",dimensions:"2d",viewDimension:"2d",arrayLayerCount:1,mipLevelCount:1,autoGenerateMipmaps:!1,sampleCount:1,antialias:!1,autoGarbageCollect:!1};Q8=tq});function aD(){for(let J=0;J<16;J++){let Q=[];bK.push(Q);for(let $=0;$<16;$++){let Z=pQ(i7[J]*i7[$]+a7[J]*o7[$]),K=pQ(o7[J]*i7[$]+r7[J]*o7[$]),W=pQ(i7[J]*a7[$]+a7[J]*r7[$]),X=pQ(o7[J]*a7[$]+r7[J]*r7[$]);for(let H=0;H<16;H++)if(i7[H]===Z&&o7[H]===K&&a7[H]===W&&r7[H]===X){Q.push(H);break}}}for(let J=0;J<16;J++){let Q=new R0;Q.set(i7[J],o7[J],a7[J],r7[J],0,0),eq.push(Q)}}var i7,o7,a7,r7,bK,eq,pQ,Y8;var J1=A(()=>{E8();i7=[1,1,0,-1,-1,-1,0,1,1,1,0,-1,-1,-1,0,1],o7=[0,1,1,1,0,-1,-1,-1,0,1,1,1,0,-1,-1,-1],a7=[0,-1,-1,-1,0,1,1,1,0,1,1,1,0,-1,-1,-1],r7=[1,1,0,-1,-1,-1,0,1,-1,-1,0,1,1,1,0,-1],bK=[],eq=[],pQ=Math.sign;aD();Y8={E:0,SE:1,S:2,SW:3,W:4,NW:5,N:6,NE:7,MIRROR_VERTICAL:8,MAIN_DIAGONAL:10,MIRROR_HORIZONTAL:12,REVERSE_DIAGONAL:14,uX:(J)=>i7[J],uY:(J)=>o7[J],vX:(J)=>a7[J],vY:(J)=>r7[J],inv:(J)=>{if(J&8)return J&15;return-J&7},add:(J,Q)=>bK[J][Q],sub:(J,Q)=>bK[J][Y8.inv(Q)],rotate180:(J)=>J^4,isVertical:(J)=>(J&3)===2,byDirection:(J,Q)=>{if(Math.abs(J)*2<=Math.abs(Q)){if(Q>=0)return Y8.S;return Y8.N}else if(Math.abs(Q)*2<=Math.abs(J)){if(J>0)return Y8.E;return Y8.W}else if(Q>0){if(J>0)return Y8.SE;return Y8.SW}else if(J>0)return Y8.NE;return Y8.NW},matrixAppendRotationInv:(J,Q,$=0,Z=0,K=0,W=0)=>{let X=eq[Y8.inv(Q)],H=X.a,q=X.b,N=X.c,Y=X.d,U=$-Math.min(0,H*K,N*W,H*K+N*W),V=Z-Math.min(0,q*K,Y*W,q*K+Y*W),z=J.a,D=J.b,w=J.c,F=J.d;J.a=H*z+q*w,J.b=H*D+q*F,J.c=N*z+Y*w,J.d=N*D+Y*F,J.tx=U*z+V*w+J.tx,J.ty=U*D+V*F+J.ty},transformRectCoords:(J,Q,$,Z)=>{let{x:K,y:W,width:X,height:H}=J,{x:q,y:N,width:Y,height:U}=Q;if($===Y8.E)return Z.set(K+q,W+N,X,H),Z;else if($===Y8.S)return Z.set(Y-W-H+q,K+N,H,X);else if($===Y8.W)return Z.set(Y-K-X+q,U-W-H+N,X,H);else if($===Y8.N)return Z.set(W+q,U-K-X+N,H,X);return Z.set(K+q,W+N,X,H)}}});var vK=()=>{};var Q1=()=>{};var yJ;var fK=A(()=>{k0();X6();yJ=class yJ extends Q8{constructor(J){let Q=J.resource||new Float32Array(J.width*J.height*4),$=J.format;if(!$)if(Q instanceof Float32Array)$="rgba32float";else if(Q instanceof Int32Array)$="rgba32uint";else if(Q instanceof Uint32Array)$="rgba32uint";else if(Q instanceof Int16Array)$="rgba16uint";else if(Q instanceof Uint16Array)$="rgba16uint";else if(Q instanceof Int8Array)$="bgra8unorm";else $="bgra8unorm";super({...J,resource:Q,format:$});this.uploadMethodId="buffer"}static test(J){return J instanceof Int8Array||J instanceof Uint8Array||J instanceof Uint8ClampedArray||J instanceof Int16Array||J instanceof Uint16Array||J instanceof Int32Array||J instanceof Uint32Array||J instanceof Float32Array}};yJ.extension=b.TextureSource});class E9{constructor(J,Q){if(this.mapCoord=new R0,this.uClampFrame=new Float32Array(4),this.uClampOffset=new Float32Array(2),this._textureID=-1,this._updateID=0,this.clampOffset=0,typeof Q>"u")this.clampMargin=J.width<10?0:0.5;else this.clampMargin=Q;this.isSimple=!1,this.texture=J}get texture(){return this._texture}set texture(J){if(this.texture===J)return;this._texture?.removeListener("update",this.update,this),this._texture=J,this._texture.addListener("update",this.update,this),this.update()}multiplyUvs(J,Q){if(Q===void 0)Q=J;let $=this.mapCoord;for(let Z=0;Z<J.length;Z+=2){let K=J[Z],W=J[Z+1];Q[Z]=K*$.a+W*$.c+$.tx,Q[Z+1]=K*$.b+W*$.d+$.ty}return Q}update(){let J=this._texture;this._updateID++;let Q=J.uvs;this.mapCoord.set(Q.x1-Q.x0,Q.y1-Q.y0,Q.x3-Q.x0,Q.y3-Q.y0,Q.x0,Q.y0);let{orig:$,trim:Z}=J;if(Z)$1.set($.width/Z.width,0,0,$.height/Z.height,-Z.x/Z.width,-Z.y/Z.height),this.mapCoord.append($1);let K=J.source,W=this.uClampFrame,X=this.clampMargin/K._resolution,H=this.clampOffset/K._resolution;return W[0]=(J.frame.x+X+H)/K.width,W[1]=(J.frame.y+X+H)/K.height,W[2]=(J.frame.x+J.frame.width-X+H)/K.width,W[3]=(J.frame.y+J.frame.height-X+H)/K.height,this.uClampOffset[0]=this.clampOffset/K.pixelWidth,this.uClampOffset[1]=this.clampOffset/K.pixelHeight,this.isSimple=J.frame.width===K.width&&J.frame.height===K.height&&J.rotate===0,!0}}var $1;var hK=A(()=>{E8();$1=new R0});var P0;var i8=A(()=>{O6();J1();_7();W6();F6();Q1();fK();X6();hK();P0=class P0 extends _8{constructor({source:J,label:Q,frame:$,orig:Z,trim:K,defaultAnchor:W,defaultBorders:X,rotate:H,dynamic:q}={}){super();if(this.uid=i0("texture"),this.uvs={x0:0,y0:0,x1:0,y1:0,x2:0,y2:0,x3:0,y3:0},this.frame=new G8,this.noFrame=!1,this.dynamic=!1,this.isTexture=!0,this.label=Q,this.source=J?.source??new Q8,this.noFrame=!$,$)this.frame.copyFrom($);else{let{width:N,height:Y}=this._source;this.frame.width=N,this.frame.height=Y}this.orig=Z||this.frame,this.trim=K,this.rotate=H??0,this.defaultAnchor=W,this.defaultBorders=X,this.destroyed=!1,this.dynamic=q||!1,this.updateUvs()}set source(J){if(this._source)this._source.off("resize",this.update,this);this._source=J,J.on("resize",this.update,this),this.emit("update",this)}get source(){return this._source}get textureMatrix(){if(!this._textureMatrix)this._textureMatrix=new E9(this);return this._textureMatrix}get width(){return this.orig.width}get height(){return this.orig.height}updateUvs(){let{uvs:J,frame:Q}=this,{width:$,height:Z}=this._source,K=Q.x/$,W=Q.y/Z,X=Q.width/$,H=Q.height/Z,q=this.rotate;if(q){let N=X/2,Y=H/2,U=K+N,V=W+Y;q=Y8.add(q,Y8.NW),J.x0=U+N*Y8.uX(q),J.y0=V+Y*Y8.uY(q),q=Y8.add(q,2),J.x1=U+N*Y8.uX(q),J.y1=V+Y*Y8.uY(q),q=Y8.add(q,2),J.x2=U+N*Y8.uX(q),J.y2=V+Y*Y8.uY(q),q=Y8.add(q,2),J.x3=U+N*Y8.uX(q),J.y3=V+Y*Y8.uY(q)}else J.x0=K,J.y0=W,J.x1=K+X,J.y1=W,J.x2=K+X,J.y2=W+H,J.x3=K,J.y3=W+H}destroy(J=!1){if(this._source){if(this._source.off("resize",this.update,this),J)this._source.destroy(),this._source=null}this._textureMatrix=null,this.destroyed=!0,this.emit("destroy",this),this.removeAllListeners()}update(){if(this.noFrame)this.frame.width=this._source.width,this.frame.height=this._source.height;this.updateUvs(),this.emit("update",this)}get baseTexture(){return u0(Z6,"Texture.baseTexture is now Texture.source"),this._source}};P0.EMPTY=new P0({label:"EMPTY",source:new Q8({label:"EMPTY"})});P0.EMPTY.destroy=vK;P0.WHITE=new P0({source:new yJ({resource:new Uint8Array([255,255,255,255]),width:1,height:1,alphaMode:"premultiply-alpha-on-upload",label:"WHITE"}),label:"WHITE"});P0.WHITE.destroy=vK});class Z1{constructor(J){this._poolKeyHash=Object.create(null),this._texturePool={},this.textureOptions=J||{},this.enableFullScreen=!1,this.textureStyle=new TJ(this.textureOptions)}createTexture(J,Q,$){let Z=new Q8({...this.textureOptions,width:J,height:Q,resolution:1,antialias:$,autoGarbageCollect:!1});return new P0({source:Z,label:`texturePool_${rD++}`})}getOptimalTexture(J,Q,$=1,Z){let K=Math.ceil(J*$-0.000001),W=Math.ceil(Q*$-0.000001);K=SK(K),W=SK(W);let X=(K<<17)+(W<<1)+(Z?1:0);if(!this._texturePool[X])this._texturePool[X]=[];let H=this._texturePool[X].pop();if(!H)H=this.createTexture(K,W,Z);return H.source._resolution=$,H.source.width=K/$,H.source.height=W/$,H.source.pixelWidth=K,H.source.pixelHeight=W,H.frame.x=0,H.frame.y=0,H.frame.width=J,H.frame.height=Q,H.updateUvs(),this._poolKeyHash[H.uid]=X,H}getSameSizeTexture(J,Q=!1){let $=J.source;return this.getOptimalTexture(J.width,J.height,$._resolution,Q)}returnTexture(J,Q=!1){let $=this._poolKeyHash[J.uid];if(Q)J.source.style=this.textureStyle;this._texturePool[$].push(J)}clear(J){if(J=J!==!1,J)for(let Q in this._texturePool){let $=this._texturePool[Q];if($)for(let Z=0;Z<$.length;Z++)$[Z].destroy(!0)}this._texturePool={}}}var rD=0,g8;var P9=A(()=>{yK();_J();X6();i8();gQ();g8=new Z1;i6.register(g8)});class bJ{constructor(){this.renderPipeId="renderGroup",this.root=null,this.canBundle=!1,this.renderGroupParent=null,this.renderGroupChildren=[],this.worldTransform=new R0,this.worldColorAlpha=4294967295,this.worldColor=16777215,this.worldAlpha=1,this.childrenToUpdate=Object.create(null),this.updateTick=0,this.gcTick=0,this.childrenRenderablesToUpdate={list:[],index:0},this.structureDidChange=!0,this.instructionSet=new jK,this._onRenderContainers=[],this.textureNeedsUpdate=!0,this.isCachedAsTexture=!1,this._matrixDirty=7}init(J){if(this.root=J,J._onRender)this.addOnRender(J);J.didChange=!0;let Q=J.children;for(let $=0;$<Q.length;$++){let Z=Q[$];Z._updateFlags=15,this.addChild(Z)}}enableCacheAsTexture(J={}){this.textureOptions=J,this.isCachedAsTexture=!0,this.textureNeedsUpdate=!0}disableCacheAsTexture(){if(this.isCachedAsTexture=!1,this.texture)g8.returnTexture(this.texture,!0),this.texture=null}updateCacheTexture(){this.textureNeedsUpdate=!0;let J=this._parentCacheAsTextureRenderGroup;if(J&&!J.textureNeedsUpdate)J.updateCacheTexture()}reset(){this.renderGroupChildren.length=0;for(let J in this.childrenToUpdate){let Q=this.childrenToUpdate[J];Q.list.fill(null),Q.index=0}this.childrenRenderablesToUpdate.index=0,this.childrenRenderablesToUpdate.list.fill(null),this.root=null,this.updateTick=0,this.structureDidChange=!0,this._onRenderContainers.length=0,this.renderGroupParent=null,this.disableCacheAsTexture()}get localTransform(){return this.root.localTransform}addRenderGroupChild(J){if(J.renderGroupParent)J.renderGroupParent._removeRenderGroupChild(J);J.renderGroupParent=this,this.renderGroupChildren.push(J)}_removeRenderGroupChild(J){let Q=this.renderGroupChildren.indexOf(J);if(Q>-1)this.renderGroupChildren.splice(Q,1);J.renderGroupParent=null}addChild(J){if(this.structureDidChange=!0,J.parentRenderGroup=this,J.updateTick=-1,J.parent===this.root)J.relativeRenderGroupDepth=1;else J.relativeRenderGroupDepth=J.parent.relativeRenderGroupDepth+1;if(J.didChange=!0,this.onChildUpdate(J),J.renderGroup){this.addRenderGroupChild(J.renderGroup);return}if(J._onRender)this.addOnRender(J);let Q=J.children;for(let $=0;$<Q.length;$++)this.addChild(Q[$])}removeChild(J){if(this.structureDidChange=!0,J._onRender){if(!J.renderGroup)this.removeOnRender(J)}if(J.parentRenderGroup=null,J.renderGroup){this._removeRenderGroupChild(J.renderGroup);return}let Q=J.children;for(let $=0;$<Q.length;$++)this.removeChild(Q[$])}removeChildren(J){for(let Q=0;Q<J.length;Q++)this.removeChild(J[Q])}onChildUpdate(J){let Q=this.childrenToUpdate[J.relativeRenderGroupDepth];if(!Q)Q=this.childrenToUpdate[J.relativeRenderGroupDepth]={index:0,list:[]};Q.list[Q.index++]=J}updateRenderable(J){if(J.globalDisplayStatus<7)return;this.instructionSet.renderPipes[J.renderPipeId].updateRenderable(J),J.didViewUpdate=!1}onChildViewUpdate(J){this.childrenRenderablesToUpdate.list[this.childrenRenderablesToUpdate.index++]=J}get isRenderable(){return this.root.localDisplayStatus===7&&this.worldAlpha>0}addOnRender(J){this._onRenderContainers.push(J)}removeOnRender(J){this._onRenderContainers.splice(this._onRenderContainers.indexOf(J),1)}runOnRender(J){for(let Q=0;Q<this._onRenderContainers.length;Q++)this._onRenderContainers[Q]._onRender(J)}destroy(){this.disableCacheAsTexture(),this.renderGroupParent=null,this.root=null,this.childrenRenderablesToUpdate=null,this.childrenToUpdate=null,this.renderGroupChildren=null,this._onRenderContainers=null,this.instructionSet=null}getChildren(J=[]){let Q=this.root.children;for(let $=0;$<Q.length;$++)this._getChildren(Q[$],J);return J}_getChildren(J,Q=[]){if(Q.push(J),J.renderGroup)return Q;let $=J.children;for(let Z=0;Z<$.length;Z++)this._getChildren($[Z],Q);return Q}invalidateMatrices(){this._matrixDirty=7}get inverseWorldTransform(){if((this._matrixDirty&1)===0)return this._inverseWorldTransform;return this._matrixDirty&=-2,this._inverseWorldTransform||(this._inverseWorldTransform=new R0),this._inverseWorldTransform.copyFrom(this.worldTransform).invert()}get textureOffsetInverseTransform(){if((this._matrixDirty&2)===0)return this._textureOffsetInverseTransform;return this._matrixDirty&=-3,this._textureOffsetInverseTransform||(this._textureOffsetInverseTransform=new R0),this._textureOffsetInverseTransform.copyFrom(this.inverseWorldTransform).translate(-this._textureBounds.x,-this._textureBounds.y)}get inverseParentTextureTransform(){if((this._matrixDirty&4)===0)return this._inverseParentTextureTransform;this._matrixDirty&=-5;let J=this._parentCacheAsTextureRenderGroup;if(J)return this._inverseParentTextureTransform||(this._inverseParentTextureTransform=new R0),this._inverseParentTextureTransform.copyFrom(this.worldTransform).prepend(J.inverseWorldTransform).translate(-J._textureBounds.x,-J._textureBounds.y);return this.worldTransform}get cacheToLocalTransform(){if(this.isCachedAsTexture)return this.textureOffsetInverseTransform;if(!this._parentCacheAsTextureRenderGroup)return null;return this._parentCacheAsTextureRenderGroup.textureOffsetInverseTransform}}var xK=A(()=>{E8();nq();P9()});function K1(J,Q,$={}){for(let Z in Q)if(!$[Z]&&Q[Z]!==void 0)J[Z]=Q[Z]}var W1=()=>{};var gK,mQ,pK,dQ,vJ=1,j9=2,t7=4,R8;var o6=A(()=>{O6();A9();qq();k0();E8();LK();BK();W6();F6();s8();EJ();kq();wq();Lq();Aq();_q();jq();fq();pq();dq();cq();sq();xK();W1();gK=new x8(null),mQ=new x8(null),pK=new x8(null,1,1),dQ=new x8(null);R8=class R8 extends _8{constructor(J={}){super();this.uid=i0("renderable"),this._updateFlags=15,this.renderGroup=null,this.parentRenderGroup=null,this.parentRenderGroupIndex=0,this.didChange=!1,this.didViewUpdate=!1,this.relativeRenderGroupDepth=0,this.children=[],this.parent=null,this.includeInBuild=!0,this.measurable=!0,this.isSimple=!0,this.parentRenderLayer=null,this.updateTick=-1,this.localTransform=new R0,this.relativeGroupTransform=new R0,this.groupTransform=this.relativeGroupTransform,this.destroyed=!1,this._position=new x8(this,0,0),this._scale=pK,this._pivot=mQ,this._origin=dQ,this._skew=gK,this._cx=1,this._sx=0,this._cy=0,this._sy=1,this._rotation=0,this.localColor=16777215,this.localAlpha=1,this.groupAlpha=1,this.groupColor=16777215,this.groupColorAlpha=4294967295,this.localBlendMode="inherit",this.groupBlendMode="normal",this.localDisplayStatus=7,this.globalDisplayStatus=7,this._didContainerChangeTick=0,this._didViewChangeTick=0,this._didLocalTransformChangeId=-1,this.effects=[],K1(this,J,{children:!0,parent:!0,effects:!0}),J.children?.forEach((Q)=>this.addChild(Q)),J.parent?.addChild(this)}static mixin(J){u0("8.8.0","Container.mixin is deprecated, please use extensions.mixin instead."),n0.mixin(R8,J)}set _didChangeId(J){this._didViewChangeTick=J>>12&4095,this._didContainerChangeTick=J&4095}get _didChangeId(){return this._didContainerChangeTick&4095|(this._didViewChangeTick&4095)<<12}addChild(...J){if(!this.allowChildren)u0(Z6,"addChild: Only Containers will be allowed to add children in v8.0.0");if(J.length>1){for(let Z=0;Z<J.length;Z++)this.addChild(J[Z]);return J[0]}let Q=J[0],$=this.renderGroup||this.parentRenderGroup;if(Q.parent===this){if(this.children.splice(this.children.indexOf(Q),1),this.children.push(Q),$)$.structureDidChange=!0;return Q}if(Q.parent)Q.parent.removeChild(Q);if(this.children.push(Q),this.sortableChildren)this.sortDirty=!0;if(Q.parent=this,Q.didChange=!0,Q._updateFlags=15,$)$.addChild(Q);if(this.emit("childAdded",Q,this,this.children.length-1),Q.emit("added",this),this._didViewChangeTick++,Q._zIndex!==0)Q.depthOfChildModified();return Q}removeChild(...J){if(J.length>1){for(let Z=0;Z<J.length;Z++)this.removeChild(J[Z]);return J[0]}let Q=J[0],$=this.children.indexOf(Q);if($>-1){if(this._didViewChangeTick++,this.children.splice($,1),this.renderGroup)this.renderGroup.removeChild(Q);else if(this.parentRenderGroup)this.parentRenderGroup.removeChild(Q);if(Q.parentRenderLayer)Q.parentRenderLayer.detach(Q);Q.parent=null,this.emit("childRemoved",Q,this,$),Q.emit("removed",this)}return Q}_onUpdate(J){if(J){if(J===this._skew)this._updateSkew()}if(this._didContainerChangeTick++,this.didChange)return;if(this.didChange=!0,this.parentRenderGroup)this.parentRenderGroup.onChildUpdate(this)}set isRenderGroup(J){if(!!this.renderGroup===J)return;if(J)this.enableRenderGroup();else this.disableRenderGroup()}get isRenderGroup(){return!!this.renderGroup}enableRenderGroup(){if(this.renderGroup)return;let J=this.parentRenderGroup;J?.removeChild(this),this.renderGroup=n8.get(bJ,this),this.groupTransform=R0.IDENTITY,J?.addChild(this),this._updateIsSimple()}disableRenderGroup(){if(!this.renderGroup)return;let J=this.parentRenderGroup;J?.removeChild(this),n8.return(this.renderGroup),this.renderGroup=null,this.groupTransform=this.relativeGroupTransform,J?.addChild(this),this._updateIsSimple()}_updateIsSimple(){this.isSimple=!this.renderGroup&&this.effects.length===0}get worldTransform(){if(this._worldTransform||(this._worldTransform=new R0),this.renderGroup)this._worldTransform.copyFrom(this.renderGroup.worldTransform);else if(this.parentRenderGroup)this._worldTransform.appendFrom(this.relativeGroupTransform,this.parentRenderGroup.worldTransform);return this._worldTransform}get x(){return this._position.x}set x(J){this._position.x=J}get y(){return this._position.y}set y(J){this._position.y=J}get position(){return this._position}set position(J){this._position.copyFrom(J)}get rotation(){return this._rotation}set rotation(J){if(this._rotation!==J)this._rotation=J,this._onUpdate(this._skew)}get angle(){return this.rotation*Yq}set angle(J){this.rotation=J*Uq}get pivot(){if(this._pivot===mQ)this._pivot=new x8(this,0,0);return this._pivot}set pivot(J){if(this._pivot===mQ){if(this._pivot=new x8(this,0,0),this._origin!==dQ)v0("Setting both a pivot and origin on a Container is not recommended. This can lead to unexpected behavior if not handled carefully.")}typeof J==="number"?this._pivot.set(J):this._pivot.copyFrom(J)}get skew(){if(this._skew===gK)this._skew=new x8(this,0,0);return this._skew}set skew(J){if(this._skew===gK)this._skew=new x8(this,0,0);this._skew.copyFrom(J)}get scale(){if(this._scale===pK)this._scale=new x8(this,1,1);return this._scale}set scale(J){if(this._scale===pK)this._scale=new x8(this,0,0);if(typeof J==="string")J=parseFloat(J);typeof J==="number"?this._scale.set(J):this._scale.copyFrom(J)}get origin(){if(this._origin===dQ)this._origin=new x8(this,0,0);return this._origin}set origin(J){if(this._origin===dQ){if(this._origin=new x8(this,0,0),this._pivot!==mQ)v0("Setting both a pivot and origin on a Container is not recommended. This can lead to unexpected behavior if not handled carefully.")}typeof J==="number"?this._origin.set(J):this._origin.copyFrom(J)}get width(){return Math.abs(this.scale.x*this.getLocalBounds().width)}set width(J){let Q=this.getLocalBounds().width;this._setWidth(J,Q)}get height(){return Math.abs(this.scale.y*this.getLocalBounds().height)}set height(J){let Q=this.getLocalBounds().height;this._setHeight(J,Q)}getSize(J){if(!J)J={};let Q=this.getLocalBounds();return J.width=Math.abs(this.scale.x*Q.width),J.height=Math.abs(this.scale.y*Q.height),J}setSize(J,Q){let $=this.getLocalBounds();if(typeof J==="object")Q=J.height??J.width,J=J.width;else Q??(Q=J);J!==void 0&&this._setWidth(J,$.width),Q!==void 0&&this._setHeight(Q,$.height)}_updateSkew(){let J=this._rotation,Q=this._skew;this._cx=Math.cos(J+Q._y),this._sx=Math.sin(J+Q._y),this._cy=-Math.sin(J-Q._x),this._sy=Math.cos(J-Q._x)}updateTransform(J){return this.position.set(typeof J.x==="number"?J.x:this.position.x,typeof J.y==="number"?J.y:this.position.y),this.scale.set(typeof J.scaleX==="number"?J.scaleX||1:this.scale.x,typeof J.scaleY==="number"?J.scaleY||1:this.scale.y),this.rotation=typeof J.rotation==="number"?J.rotation:this.rotation,this.skew.set(typeof J.skewX==="number"?J.skewX:this.skew.x,typeof J.skewY==="number"?J.skewY:this.skew.y),this.pivot.set(typeof J.pivotX==="number"?J.pivotX:this.pivot.x,typeof J.pivotY==="number"?J.pivotY:this.pivot.y),this.origin.set(typeof J.originX==="number"?J.originX:this.origin.x,typeof J.originY==="number"?J.originY:this.origin.y),this}setFromMatrix(J){J.decompose(this)}updateLocalTransform(){let J=this._didContainerChangeTick;if(this._didLocalTransformChangeId===J)return;this._didLocalTransformChangeId=J;let Q=this.localTransform,$=this._scale,Z=this._pivot,K=this._origin,W=this._position,X=$._x,H=$._y,q=Z._x,N=Z._y,Y=-K._x,U=-K._y;Q.a=this._cx*X,Q.b=this._sx*X,Q.c=this._cy*H,Q.d=this._sy*H,Q.tx=W._x-(q*Q.a+N*Q.c)+(Y*Q.a+U*Q.c)-Y,Q.ty=W._y-(q*Q.b+N*Q.d)+(Y*Q.b+U*Q.d)-U}set alpha(J){if(J===this.localAlpha)return;this.localAlpha=J,this._updateFlags|=vJ,this._onUpdate()}get alpha(){return this.localAlpha}set tint(J){let $=G6.shared.setValue(J??16777215).toBgrNumber();if($===this.localColor)return;this.localColor=$,this._updateFlags|=vJ,this._onUpdate()}get tint(){return _9(this.localColor)}set blendMode(J){if(this.localBlendMode===J)return;if(this.parentRenderGroup)this.parentRenderGroup.structureDidChange=!0;this._updateFlags|=j9,this.localBlendMode=J,this._onUpdate()}get blendMode(){return this.localBlendMode}get visible(){return!!(this.localDisplayStatus&2)}set visible(J){let Q=J?2:0;if((this.localDisplayStatus&2)===Q)return;if(this.parentRenderGroup)this.parentRenderGroup.structureDidChange=!0;this._updateFlags|=t7,this.localDisplayStatus^=2,this._onUpdate()}get culled(){return!(this.localDisplayStatus&4)}set culled(J){let Q=J?0:4;if((this.localDisplayStatus&4)===Q)return;if(this.parentRenderGroup)this.parentRenderGroup.structureDidChange=!0;this._updateFlags|=t7,this.localDisplayStatus^=4,this._onUpdate()}get renderable(){return!!(this.localDisplayStatus&1)}set renderable(J){let Q=J?1:0;if((this.localDisplayStatus&1)===Q)return;if(this._updateFlags|=t7,this.localDisplayStatus^=1,this.parentRenderGroup)this.parentRenderGroup.structureDidChange=!0;this._onUpdate()}get isRenderable(){return this.localDisplayStatus===7&&this.groupAlpha>0}destroy(J=!1){if(this.destroyed)return;this.destroyed=!0;let Q;if(this.children.length)Q=this.removeChildren(0,this.children.length);if(this.removeFromParent(),this.parent=null,this._maskEffect=null,this._filterEffect=null,this.effects=null,this._position=null,this._scale=null,this._pivot=null,this._origin=null,this._skew=null,this.emit("destroyed",this),this.removeAllListeners(),(typeof J==="boolean"?J:J?.children)&&Q)for(let Z=0;Z<Q.length;++Z)Q[Z].destroy(J);this.renderGroup?.destroy(),this.renderGroup=null}};n0.mixin(R8,Mq,Pq,uq,mq,gq,Rq,Cq,lq,Hq,Dq,vq,Iq)});var E7;var lQ=A(()=>{E7=((J)=>{return J[J.INTERACTION=50]="INTERACTION",J[J.HIGH=25]="HIGH",J[J.NORMAL=0]="NORMAL",J[J.LOW=-25]="LOW",J[J.UTILITY=-50]="UTILITY",J})(E7||{})});class S9{constructor(J,Q=null,$=0,Z=!1){this.next=null,this.previous=null,this._destroyed=!1,this._fn=J,this._context=Q,this.priority=$,this._once=Z}match(J,Q=null){return this._fn===J&&this._context===Q}emit(J){if(this._fn)if(this._context)this._fn.call(this._context,J);else this._fn(J);let Q=this.next;if(this._once)this.destroy(!0);if(this._destroyed)this.next=null;return Q}connect(J){if(this.previous=J,J.next)J.next.previous=this;this.next=J.next,J.next=this}destroy(J=!1){if(this._destroyed=!0,this._fn=null,this._context=null,this.previous)this.previous.next=this.next;if(this.next)this.next.previous=this.previous;let Q=this.next;return this.next=J?null:Q,this.previous=null,Q}}var X1=()=>{};var H1=class J{constructor(){this.autoStart=!1,this.deltaTime=1,this.lastTime=-1,this.speed=1,this.started=!1,this._requestId=null,this._maxElapsedMS=100,this._minElapsedMS=0,this._protected=!1,this._lastFrame=-1,this._head=new S9(null,null,1/0),this.deltaMS=1/J.targetFPMS,this.elapsedMS=1/J.targetFPMS,this._tick=(Q)=>{if(this._requestId=null,this.started){if(this.update(Q),this.started&&this._requestId===null&&this._head.next)this._requestId=requestAnimationFrame(this._tick)}}}_requestIfNeeded(){if(this._requestId===null&&this._head.next)this.lastTime=performance.now(),this._lastFrame=this.lastTime,this._requestId=requestAnimationFrame(this._tick)}_cancelIfNeeded(){if(this._requestId!==null)cancelAnimationFrame(this._requestId),this._requestId=null}_startIfPossible(){if(this.started)this._requestIfNeeded();else if(this.autoStart)this.start()}add(Q,$,Z=E7.NORMAL){return this._addListener(new S9(Q,$,Z))}addOnce(Q,$,Z=E7.NORMAL){return this._addListener(new S9(Q,$,Z,!0))}_addListener(Q){let $=this._head.next,Z=this._head;if(!$)Q.connect(Z);else{while($){if(Q.priority>$.priority){Q.connect(Z);break}Z=$,$=$.next}if(!Q.previous)Q.connect(Z)}return this._startIfPossible(),this}remove(Q,$){let Z=this._head.next;while(Z)if(Z.match(Q,$))Z=Z.destroy();else Z=Z.next;if(!this._head.next)this._cancelIfNeeded();return this}get count(){if(!this._head)return 0;let Q=0,$=this._head;while($=$.next)Q++;return Q}start(){if(!this.started)this.started=!0,this._requestIfNeeded()}stop(){if(this.started)this.started=!1,this._cancelIfNeeded()}destroy(){if(!this._protected){this.stop();let Q=this._head.next;while(Q)Q=Q.destroy(!0);this._head.destroy(),this._head=null}}update(Q=performance.now()){let $;if(Q>this.lastTime){if($=this.elapsedMS=Q-this.lastTime,$>this._maxElapsedMS)$=this._maxElapsedMS;if($*=this.speed,this._minElapsedMS){let W=Q-this._lastFrame|0;if(W<this._minElapsedMS)return;this._lastFrame=Q-W%this._minElapsedMS}this.deltaMS=$,this.deltaTime=this.deltaMS*J.targetFPMS;let Z=this._head,K=Z.next;while(K)K=K.emit(this);if(!Z.next)this._cancelIfNeeded()}else this.deltaTime=this.deltaMS=this.elapsedMS=0;this.lastTime=Q}get FPS(){return 1000/this.elapsedMS}get minFPS(){return 1000/this._maxElapsedMS}set minFPS(Q){let $=Math.min(this.maxFPS,Q),Z=Math.min(Math.max(0,$)/1000,J.targetFPMS);this._maxElapsedMS=1/Z}get maxFPS(){if(this._minElapsedMS)return Math.round(1000/this._minElapsedMS);return 0}set maxFPS(Q){if(Q===0)this._minElapsedMS=0;else{let $=Math.max(this.minFPS,Q);this._minElapsedMS=1/($/1000)}}static get shared(){if(!J._shared){let Q=J._shared=new J;Q.autoStart=!0,Q._protected=!0}return J._shared}static get system(){if(!J._system){let Q=J._system=new J;Q.autoStart=!0,Q._protected=!0}return J._system}},l8;var fJ=A(()=>{lQ();X1();H1.targetFPMS=0.06;l8=H1});class mK{constructor(J){if(this._lastTransform="",this._observer=null,this._tickerAttached=!1,this.updateTranslation=()=>{if(!this._canvas)return;let Q=this._canvas.getBoundingClientRect(),$=this._canvas.width,Z=this._canvas.height,K=Q.width/$*this._renderer.resolution,W=Q.height/Z*this._renderer.resolution,X=Q.left,H=Q.top,q=`translate(${X}px, ${H}px) scale(${K}, ${W})`;if(q!==this._lastTransform)this._domElement.style.transform=q,this._lastTransform=q},this._domElement=J.domElement,this._renderer=J.renderer,globalThis.OffscreenCanvas&&this._renderer.canvas instanceof OffscreenCanvas)return;this._canvas=this._renderer.canvas,this._attachObserver()}get canvas(){return this._canvas}ensureAttached(){if(!this._domElement.parentNode&&this._canvas.parentNode)this._canvas.parentNode.appendChild(this._domElement),this.updateTranslation()}_attachObserver(){if("ResizeObserver"in globalThis){if(this._observer)this._observer.disconnect(),this._observer=null;this._observer=new ResizeObserver((J)=>{for(let Q of J){if(Q.target!==this._canvas)continue;let $=this.canvas.width,Z=this.canvas.height,K=Q.contentRect.width/$*this._renderer.resolution,W=Q.contentRect.height/Z*this._renderer.resolution;if(this._lastScaleX!==K||this._lastScaleY!==W)this.updateTranslation(),this._lastScaleX=K,this._lastScaleY=W}}),this._observer.observe(this._canvas)}else if(!this._tickerAttached)l8.shared.add(this.updateTranslation,this,E7.HIGH)}destroy(){if(this._observer)this._observer.disconnect(),this._observer=null;else if(this._tickerAttached)l8.shared.remove(this.updateTranslation);this._domElement=null,this._renderer=null,this._canvas=null,this._tickerAttached=!1,this._lastTransform="",this._lastScaleX=null,this._lastScaleY=null}}var q1=A(()=>{lQ();fJ()});class P7{constructor(J){this.bubbles=!0,this.cancelBubble=!0,this.cancelable=!1,this.composed=!1,this.defaultPrevented=!1,this.eventPhase=P7.prototype.NONE,this.propagationStopped=!1,this.propagationImmediatelyStopped=!1,this.layer=new O8,this.page=new O8,this.NONE=0,this.CAPTURING_PHASE=1,this.AT_TARGET=2,this.BUBBLING_PHASE=3,this.manager=J}get layerX(){return this.layer.x}get layerY(){return this.layer.y}get pageX(){return this.page.x}get pageY(){return this.page.y}get data(){return this}composedPath(){if(this.manager&&(!this.path||this.path[this.path.length-1]!==this.target))this.path=this.target?this.manager.propagationPath(this.target):[];return this.path}initEvent(J,Q,$){throw Error("initEvent() is a legacy DOM API. It is not implemented in the Federated Events API.")}initUIEvent(J,Q,$,Z,K){throw Error("initUIEvent() is a legacy DOM API. It is not implemented in the Federated Events API.")}preventDefault(){if(this.nativeEvent instanceof Event&&this.nativeEvent.cancelable)this.nativeEvent.preventDefault();this.defaultPrevented=!0}stopImmediatePropagation(){this.propagationImmediatelyStopped=!0}stopPropagation(){this.propagationStopped=!0}}var cQ=A(()=>{A7()});function tD(J){return function(Q){return Q.test(J)}}function T9(J){var Q={userAgent:"",platform:"",maxTouchPoints:0};if(!J&&typeof navigator<"u")Q={userAgent:navigator.userAgent,platform:navigator.platform,maxTouchPoints:navigator.maxTouchPoints||0};else if(typeof J==="string")Q.userAgent=J;else if(J&&J.userAgent)Q={userAgent:J.userAgent,platform:J.platform,maxTouchPoints:J.maxTouchPoints||0};var $=Q.userAgent,Z=$.split("[FBAN");if(typeof Z[1]<"u")$=Z[0];if(Z=$.split("Twitter"),typeof Z[1]<"u")$=Z[0];var K=tD($),W={apple:{phone:K(dK)&&!K(X7),ipod:K(N1),tablet:!K(dK)&&(K(Y1)||w1(Q))&&!K(X7),universal:K(U1),device:(K(dK)||K(N1)||K(Y1)||K(U1)||w1(Q))&&!K(X7)},amazon:{phone:K(hJ),tablet:!K(hJ)&&K(uQ),device:K(hJ)||K(uQ)},android:{phone:!K(X7)&&K(hJ)||!K(X7)&&K(lK),tablet:!K(X7)&&!K(hJ)&&!K(lK)&&(K(uQ)||K(V1)),device:!K(X7)&&(K(hJ)||K(uQ)||K(lK)||K(V1))||K(/\bokhttp\b/i)},windows:{phone:K(X7),tablet:K(O1),device:K(X7)||K(O1)},other:{blackberry:K(F1),blackberry10:K(z1),opera:K(D1),firefox:K(M1),chrome:K(k1),device:K(F1)||K(z1)||K(D1)||K(M1)||K(k1)},any:!1,phone:!1,tablet:!1};return W.any=W.apple.device||W.android.device||W.windows.device||W.other.device,W.phone=W.apple.phone||W.android.phone||W.windows.phone,W.tablet=W.apple.tablet||W.android.tablet||W.windows.tablet,W}var dK,N1,Y1,U1,lK,V1,hJ,uQ,X7,O1,F1,z1,D1,k1,M1,w1=function(J){return typeof J<"u"&&J.platform==="MacIntel"&&typeof J.maxTouchPoints==="number"&&J.maxTouchPoints>1&&typeof MSStream>"u"};var cK=A(()=>{dK=/iPhone/i,N1=/iPod/i,Y1=/iPad/i,U1=/\biOS-universal(?:.+)Mac\b/i,lK=/\bAndroid(?:.+)Mobile\b/i,V1=/Android/i,hJ=/(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i,uQ=/Silk/i,X7=/Windows Phone/i,O1=/\bWindows(?:.+)ARM\b/i,F1=/BlackBerry/i,z1=/BB10/i,D1=/Opera Mini/i,k1=/\b(CriOS|Chrome)(?:.+)Mobile/i,M1=/Mobile(?:.+)Firefox\b/i});var I1=A(()=>{cK();cK()});var eD,L1;var G1=A(()=>{I1();eD=T9.default??T9,L1=eD(globalThis.navigator)});var J4=9,B1=100,Q4=0,$4=0,R1=2,A1=1,Z4=-1000,K4=-1000,W4=2,uK=class J{constructor(Q,$=L1){if(this._mobileInfo=$,this.debug=!1,this._activateOnTab=!0,this._deactivateOnMouseMove=!0,this._isActive=!1,this._isMobileAccessibility=!1,this._div=null,this._pools={},this._renderId=0,this._children=[],this._androidUpdateCount=0,this._androidUpdateFrequency=500,this._isRunningTests=!1,this._boundOnKeyDown=this._onKeyDown.bind(this),this._boundOnMouseMove=this._onMouseMove.bind(this),this._hookDiv=null,$.tablet||$.phone)this._createTouchHook();this._renderer=Q}get isActive(){return this._isActive}get isMobileAccessibility(){return this._isMobileAccessibility}get hookDiv(){return this._hookDiv}get div(){return this._div}_createTouchHook(){let Q=document.createElement("button");Q.style.width=`${A1}px`,Q.style.height=`${A1}px`,Q.style.position="absolute",Q.style.top=`${Z4}px`,Q.style.left=`${K4}px`,Q.style.zIndex=W4.toString(),Q.style.backgroundColor="#FF0000",Q.title="select to enable accessibility for this content",Q.addEventListener("focus",()=>{this._isMobileAccessibility=!0,this._activate(),this._destroyTouchHook()}),document.body.appendChild(Q),this._hookDiv=Q}_destroyTouchHook(){if(!this._hookDiv)return;document.body.removeChild(this._hookDiv),this._hookDiv=null}_activate(){if(this._isActive)return;if(this._isActive=!0,!this._div)this._div=document.createElement("div"),this._div.style.position="absolute",this._div.style.top=`${Q4}px`,this._div.style.left=`${$4}px`,this._div.style.pointerEvents="none",this._div.style.zIndex=R1.toString(),this._canvasObserver=new mK({domElement:this._div,renderer:this._renderer});if(this._activateOnTab)globalThis.addEventListener("keydown",this._boundOnKeyDown,!1);if(this._deactivateOnMouseMove)globalThis.document.addEventListener("mousemove",this._boundOnMouseMove,!0);let Q=this._renderer.view.canvas;if(!Q.parentNode){let $=new MutationObserver(()=>{if(Q.parentNode)$.disconnect(),this._canvasObserver.ensureAttached(),this._initAccessibilitySetup()});$.observe(document.body,{childList:!0,subtree:!0})}else this._canvasObserver.ensureAttached(),this._initAccessibilitySetup()}_initAccessibilitySetup(){if(this._renderer.runners.postrender.add(this),this._renderer.lastObjectRendered)this._updateAccessibleObjects(this._renderer.lastObjectRendered)}_deactivate(){if(!this._isActive||this._isMobileAccessibility)return;if(this._isActive=!1,globalThis.document.removeEventListener("mousemove",this._boundOnMouseMove,!0),this._activateOnTab)globalThis.addEventListener("keydown",this._boundOnKeyDown,!1);this._renderer.runners.postrender.remove(this);for(let Q of this._children){if(Q._accessibleDiv?.parentNode)Q._accessibleDiv.parentNode.removeChild(Q._accessibleDiv),Q._accessibleDiv=null;Q._accessibleActive=!1}for(let Q in this._pools)this._pools[Q].forEach((Z)=>{if(Z.parentNode)Z.parentNode.removeChild(Z)}),delete this._pools[Q];if(this._div?.parentNode)this._div.parentNode.removeChild(this._div);this._pools={},this._children=[]}_updateAccessibleObjects(Q){if(!Q.visible||!Q.accessibleChildren)return;if(Q.accessible){if(!Q._accessibleActive)this._addChild(Q);Q._renderId=this._renderId}let $=Q.children;if($)for(let Z=0;Z<$.length;Z++)this._updateAccessibleObjects($[Z])}init(Q){let Z={accessibilityOptions:{...J.defaultOptions,...Q?.accessibilityOptions||{}}};if(this.debug=Z.accessibilityOptions.debug,this._activateOnTab=Z.accessibilityOptions.activateOnTab,this._deactivateOnMouseMove=Z.accessibilityOptions.deactivateOnMouseMove,Z.accessibilityOptions.enabledByDefault)this._activate();this._renderer.runners.postrender.remove(this)}postrender(){let Q=performance.now();if(this._mobileInfo.android.device&&Q<this._androidUpdateCount)return;if(this._androidUpdateCount=Q+this._androidUpdateFrequency,(!this._renderer.renderingToScreen||!this._renderer.view.canvas)&&!this._isRunningTests)return;let $=new Set;if(this._renderer.lastObjectRendered){this._updateAccessibleObjects(this._renderer.lastObjectRendered);for(let Z of this._children)if(Z._renderId===this._renderId)$.add(this._children.indexOf(Z))}for(let Z=this._children.length-1;Z>=0;Z--){let K=this._children[Z];if(!$.has(Z)){if(K._accessibleDiv&&K._accessibleDiv.parentNode)K._accessibleDiv.parentNode.removeChild(K._accessibleDiv),this._getPool(K.accessibleType).push(K._accessibleDiv),K._accessibleDiv=null;K._accessibleActive=!1,yQ(this._children,Z,1)}}if(this._renderer.renderingToScreen)this._canvasObserver.ensureAttached();for(let Z=0;Z<this._children.length;Z++){let K=this._children[Z];if(!K._accessibleActive||!K._accessibleDiv)continue;let W=K._accessibleDiv,X=K.hitArea||K.getBounds().rectangle;if(K.hitArea){let H=K.worldTransform;W.style.left=`${H.tx+X.x*H.a}px`,W.style.top=`${H.ty+X.y*H.d}px`,W.style.width=`${X.width*H.a}px`,W.style.height=`${X.height*H.d}px`}else this._capHitArea(X),W.style.left=`${X.x}px`,W.style.top=`${X.y}px`,W.style.width=`${X.width}px`,W.style.height=`${X.height}px`}this._renderId++}_updateDebugHTML(Q){Q.innerHTML=`type: ${Q.type}</br> title : ${Q.title}</br> tabIndex: ${Q.tabIndex}`}_capHitArea(Q){if(Q.x<0)Q.width+=Q.x,Q.x=0;if(Q.y<0)Q.height+=Q.y,Q.y=0;let{width:$,height:Z}=this._renderer;if(Q.x+Q.width>$)Q.width=$-Q.x;if(Q.y+Q.height>Z)Q.height=Z-Q.y}_addChild(Q){let Z=this._getPool(Q.accessibleType).pop();if(Z)Z.innerHTML="",Z.removeAttribute("title"),Z.removeAttribute("aria-label"),Z.tabIndex=0;else{if(Q.accessibleType==="button")Z=document.createElement("button");else if(Z=document.createElement(Q.accessibleType),Z.style.cssText=`
                        color: transparent;
                        pointer-events: none;
                        padding: 0;
                        margin: 0;
                        border: 0;
                        outline: 0;
                        background: transparent;
                        box-sizing: border-box;
                        user-select: none;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                    `,Q.accessibleText)Z.innerText=Q.accessibleText;if(Z.style.width=`${B1}px`,Z.style.height=`${B1}px`,Z.style.backgroundColor=this.debug?"rgba(255,255,255,0.5)":"transparent",Z.style.position="absolute",Z.style.zIndex=R1.toString(),Z.style.borderStyle="none",navigator.userAgent.toLowerCase().includes("chrome"))Z.setAttribute("aria-live","off");else Z.setAttribute("aria-live","polite");if(navigator.userAgent.match(/rv:.*Gecko\//))Z.setAttribute("aria-relevant","additions");else Z.setAttribute("aria-relevant","text");Z.addEventListener("click",this._onClick.bind(this)),Z.addEventListener("focus",this._onFocus.bind(this)),Z.addEventListener("focusout",this._onFocusOut.bind(this))}if(Z.style.pointerEvents=Q.accessiblePointerEvents,Z.type=Q.accessibleType,Q.accessibleTitle&&Q.accessibleTitle!==null)Z.title=Q.accessibleTitle;else if(!Q.accessibleHint||Q.accessibleHint===null)Z.title=`container ${Q.tabIndex}`;if(Q.accessibleHint&&Q.accessibleHint!==null)Z.setAttribute("aria-label",Q.accessibleHint);if(Q.interactive)Z.tabIndex=Q.tabIndex;else Z.tabIndex=0;if(this.debug)this._updateDebugHTML(Z);Q._accessibleActive=!0,Q._accessibleDiv=Z,Z.container=Q,this._children.push(Q),this._div.appendChild(Q._accessibleDiv)}_dispatchEvent(Q,$){let{container:Z}=Q.target,K=this._renderer.events.rootBoundary,W=Object.assign(new P7(K),{target:Z});K.rootTarget=this._renderer.lastObjectRendered,$.forEach((X)=>K.dispatchEvent(W,X))}_onClick(Q){this._dispatchEvent(Q,["click","pointertap","tap"])}_onFocus(Q){if(!Q.target.getAttribute("aria-live"))Q.target.setAttribute("aria-live","assertive");this._dispatchEvent(Q,["mouseover"])}_onFocusOut(Q){if(!Q.target.getAttribute("aria-live"))Q.target.setAttribute("aria-live","polite");this._dispatchEvent(Q,["mouseout"])}_onKeyDown(Q){if(Q.keyCode!==J4||!this._activateOnTab)return;this._activate()}_onMouseMove(Q){if(Q.movementX===0&&Q.movementY===0)return;this._deactivate()}destroy(){this._deactivate(),this._destroyTouchHook(),this._canvasObserver?.destroy(),this._canvasObserver=null,this._div=null,this._pools=null,this._children=null,this._renderer=null,this._hookDiv=null,globalThis.removeEventListener("keydown",this._boundOnKeyDown),this._boundOnKeyDown=null,globalThis.document.removeEventListener("mousemove",this._boundOnMouseMove,!0),this._boundOnMouseMove=null}setAccessibilityEnabled(Q){if(Q)this._activate();else this._deactivate()}_getPool(Q){if(!this._pools[Q])this._pools[Q]=[];return this._pools[Q]}},C1;var _1=A(()=>{q1();cQ();k0();G1();_K();uK.extension={type:[b.WebGLSystem,b.WebGPUSystem],name:"accessibility"};uK.defaultOptions={enabledByDefault:!1,debug:!1,activateOnTab:!0,deactivateOnMouseMove:!0};C1=uK});var E1;var P1=A(()=>{E1={accessible:!1,accessibleTitle:null,accessibleHint:null,tabIndex:0,accessibleType:"button",accessibleText:null,accessiblePointerEvents:"auto",accessibleChildren:!0,_accessibleActive:!1,_accessibleDiv:null,_renderId:-1}});var j1=A(()=>{k0();o6();_1();P1();n0.add(C1);n0.mixin(R8,E1)});class S1{constructor(){this.interactionFrequency=10,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}init(J){this.removeTickerListener(),this.events=J,this.interactionFrequency=10,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}get pauseUpdate(){return this._pauseUpdate}set pauseUpdate(J){this._pauseUpdate=J}addTickerListener(){if(this._tickerAdded||!this.domElement)return;l8.system.add(this._tickerUpdate,this,E7.INTERACTION),this._tickerAdded=!0}removeTickerListener(){if(!this._tickerAdded)return;l8.system.remove(this._tickerUpdate,this),this._tickerAdded=!1}pointerMoved(){this._didMove=!0}_update(){if(!this.domElement||this._pauseUpdate)return;if(this._didMove){this._didMove=!1;return}let J=this.events._rootPointerEvent;if(this.events.supportsTouchEvents&&J.pointerType==="touch")return;globalThis.document.dispatchEvent(this.events.supportsPointerEvents?new PointerEvent("pointermove",{clientX:J.clientX,clientY:J.clientY,pointerType:J.pointerType,pointerId:J.pointerId}):new MouseEvent("mousemove",{clientX:J.clientX,clientY:J.clientY}))}_tickerUpdate(J){if(this._deltaTime+=J.deltaTime,this._deltaTime<this.interactionFrequency)return;this._deltaTime=0,this._update()}destroy(){this.removeTickerListener(),this.events=null,this.domElement=null,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}}var f6;var sK=A(()=>{lQ();fJ();f6=new S1});var j7;var sQ=A(()=>{A7();cQ();j7=class j7 extends P7{constructor(){super(...arguments);this.client=new O8,this.movement=new O8,this.offset=new O8,this.global=new O8,this.screen=new O8}get clientX(){return this.client.x}get clientY(){return this.client.y}get x(){return this.clientX}get y(){return this.clientY}get movementX(){return this.movement.x}get movementY(){return this.movement.y}get offsetX(){return this.offset.x}get offsetY(){return this.offset.y}get globalX(){return this.global.x}get globalY(){return this.global.y}get screenX(){return this.screen.x}get screenY(){return this.screen.y}getLocalPosition(J,Q,$){return J.worldTransform.applyInverse($||this.global,Q)}getModifierState(J){return"getModifierState"in this.nativeEvent&&this.nativeEvent.getModifierState(J)}initMouseEvent(J,Q,$,Z,K,W,X,H,q,N,Y,U,V,z,D){throw Error("Method not implemented.")}}});var H6;var nK=A(()=>{sQ();H6=class H6 extends j7{constructor(){super(...arguments);this.width=0,this.height=0,this.isPrimary=!1}getCoalescedEvents(){if(this.type==="pointermove"||this.type==="mousemove"||this.type==="touchmove")return[this];return[]}getPredictedEvents(){throw Error("getPredictedEvents is not supported!")}}});var H7;var iK=A(()=>{sQ();H7=class H7 extends j7{constructor(){super(...arguments);this.DOM_DELTA_PIXEL=0,this.DOM_DELTA_LINE=1,this.DOM_DELTA_PAGE=2}};H7.DOM_DELTA_PIXEL=0;H7.DOM_DELTA_LINE=1;H7.DOM_DELTA_PAGE=2});class oK{constructor(J){this.dispatch=new _8,this.moveOnAll=!1,this.enableGlobalMoveEvents=!0,this.mappingState={trackingData:{}},this.eventPool=new Map,this._allInteractiveElements=[],this._hitElements=[],this._isPointerMoveEvent=!1,this.rootTarget=J,this.hitPruneFn=this.hitPruneFn.bind(this),this.hitTestFn=this.hitTestFn.bind(this),this.mapPointerDown=this.mapPointerDown.bind(this),this.mapPointerMove=this.mapPointerMove.bind(this),this.mapPointerOut=this.mapPointerOut.bind(this),this.mapPointerOver=this.mapPointerOver.bind(this),this.mapPointerUp=this.mapPointerUp.bind(this),this.mapPointerUpOutside=this.mapPointerUpOutside.bind(this),this.mapWheel=this.mapWheel.bind(this),this.mappingTable={},this.addEventMapping("pointerdown",this.mapPointerDown),this.addEventMapping("pointermove",this.mapPointerMove),this.addEventMapping("pointerout",this.mapPointerOut),this.addEventMapping("pointerleave",this.mapPointerOut),this.addEventMapping("pointerover",this.mapPointerOver),this.addEventMapping("pointerup",this.mapPointerUp),this.addEventMapping("pointerupoutside",this.mapPointerUpOutside),this.addEventMapping("wheel",this.mapWheel)}addEventMapping(J,Q){if(!this.mappingTable[J])this.mappingTable[J]=[];this.mappingTable[J].push({fn:Q,priority:0}),this.mappingTable[J].sort(($,Z)=>$.priority-Z.priority)}dispatchEvent(J,Q){J.propagationStopped=!1,J.propagationImmediatelyStopped=!1,this.propagate(J,Q),this.dispatch.emit(Q||J.type,J)}mapEvent(J){if(!this.rootTarget)return;let Q=this.mappingTable[J.type];if(Q)for(let $=0,Z=Q.length;$<Z;$++)Q[$].fn(J);else v0(`[EventBoundary]: Event mapping not defined for ${J.type}`)}hitTest(J,Q){f6.pauseUpdate=!0;let Z=this._isPointerMoveEvent&&this.enableGlobalMoveEvents?"hitTestMoveRecursive":"hitTestRecursive",K=this[Z](this.rootTarget,this.rootTarget.eventMode,H4.set(J,Q),this.hitTestFn,this.hitPruneFn);return K&&K[0]}propagate(J,Q){if(!J.target)return;let $=J.composedPath();J.eventPhase=J.CAPTURING_PHASE;for(let Z=0,K=$.length-1;Z<K;Z++)if(J.currentTarget=$[Z],this.notifyTarget(J,Q),J.propagationStopped||J.propagationImmediatelyStopped)return;if(J.eventPhase=J.AT_TARGET,J.currentTarget=J.target,this.notifyTarget(J,Q),J.propagationStopped||J.propagationImmediatelyStopped)return;J.eventPhase=J.BUBBLING_PHASE;for(let Z=$.length-2;Z>=0;Z--)if(J.currentTarget=$[Z],this.notifyTarget(J,Q),J.propagationStopped||J.propagationImmediatelyStopped)return}all(J,Q,$=this._allInteractiveElements){if($.length===0)return;J.eventPhase=J.BUBBLING_PHASE;let Z=Array.isArray(Q)?Q:[Q];for(let K=$.length-1;K>=0;K--)Z.forEach((W)=>{J.currentTarget=$[K],this.notifyTarget(J,W)})}propagationPath(J){let Q=[J];for(let $=0;$<X4&&(J!==this.rootTarget&&J.parent);$++){if(!J.parent)throw Error("Cannot find propagation path to disconnected target");Q.push(J.parent),J=J.parent}return Q.reverse(),Q}hitTestMoveRecursive(J,Q,$,Z,K,W=!1){let X=!1;if(this._interactivePrune(J))return null;if(J.eventMode==="dynamic"||Q==="dynamic")f6.pauseUpdate=!1;if(J.interactiveChildren&&J.children){let N=J.children;for(let Y=N.length-1;Y>=0;Y--){let U=N[Y],V=this.hitTestMoveRecursive(U,this._isInteractive(Q)?Q:U.eventMode,$,Z,K,W||K(J,$));if(V){if(V.length>0&&!V[V.length-1].parent)continue;let z=J.isInteractive();if(V.length>0||z){if(z)this._allInteractiveElements.push(J);V.push(J)}if(this._hitElements.length===0)this._hitElements=V;X=!0}}}let H=this._isInteractive(Q),q=J.isInteractive();if(q&&q)this._allInteractiveElements.push(J);if(W||this._hitElements.length>0)return null;if(X)return this._hitElements;if(H&&(!K(J,$)&&Z(J,$)))return q?[J]:[];return null}hitTestRecursive(J,Q,$,Z,K){if(this._interactivePrune(J)||K(J,$))return null;if(J.eventMode==="dynamic"||Q==="dynamic")f6.pauseUpdate=!1;if(J.interactiveChildren&&J.children){let H=J.children,q=$;for(let N=H.length-1;N>=0;N--){let Y=H[N],U=this.hitTestRecursive(Y,this._isInteractive(Q)?Q:Y.eventMode,q,Z,K);if(U){if(U.length>0&&!U[U.length-1].parent)continue;let V=J.isInteractive();if(U.length>0||V)U.push(J);return U}}}let W=this._isInteractive(Q),X=J.isInteractive();if(W&&Z(J,$))return X?[J]:[];return null}_isInteractive(J){return J==="static"||J==="dynamic"}_interactivePrune(J){if(!J||!J.visible||!J.renderable||!J.measurable)return!0;if(J.eventMode==="none")return!0;if(J.eventMode==="passive"&&!J.interactiveChildren)return!0;return!1}hitPruneFn(J,Q){if(J.hitArea){if(J.worldTransform.applyInverse(Q,y9),!J.hitArea.contains(y9.x,y9.y))return!0}if(J.effects&&J.effects.length)for(let $=0;$<J.effects.length;$++){let Z=J.effects[$];if(Z.containsPoint){if(!Z.containsPoint(Q,this.hitTestFn))return!0}}return!1}hitTestFn(J,Q){if(J.hitArea)return!0;if(J?.containsPoint)return J.worldTransform.applyInverse(Q,y9),J.containsPoint(y9);return!1}notifyTarget(J,Q){if(!J.currentTarget.isInteractive())return;Q??(Q=J.type);let $=`on${Q}`;J.currentTarget[$]?.(J);let Z=J.eventPhase===J.CAPTURING_PHASE||J.eventPhase===J.AT_TARGET?`${Q}capture`:Q;if(this._notifyListeners(J,Z),J.eventPhase===J.AT_TARGET)this._notifyListeners(J,Q)}mapPointerDown(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}let Q=this.createPointerEvent(J);if(this.dispatchEvent(Q,"pointerdown"),Q.pointerType==="touch")this.dispatchEvent(Q,"touchstart");else if(Q.pointerType==="mouse"||Q.pointerType==="pen"){let Z=Q.button===2;this.dispatchEvent(Q,Z?"rightdown":"mousedown")}let $=this.trackingData(J.pointerId);$.pressTargetsByButton[J.button]=Q.composedPath(),this.freeEvent(Q)}mapPointerMove(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}this._allInteractiveElements.length=0,this._hitElements.length=0,this._isPointerMoveEvent=!0;let Q=this.createPointerEvent(J);this._isPointerMoveEvent=!1;let $=Q.pointerType==="mouse"||Q.pointerType==="pen",Z=this.trackingData(J.pointerId),K=this.findMountedTarget(Z.overTargets);if(Z.overTargets?.length>0&&K!==Q.target){let H=J.type==="mousemove"?"mouseout":"pointerout",q=this.createPointerEvent(J,H,K);if(this.dispatchEvent(q,"pointerout"),$)this.dispatchEvent(q,"mouseout");if(!Q.composedPath().includes(K)){let N=this.createPointerEvent(J,"pointerleave",K);N.eventPhase=N.AT_TARGET;while(N.target&&!Q.composedPath().includes(N.target)){if(N.currentTarget=N.target,this.notifyTarget(N),$)this.notifyTarget(N,"mouseleave");N.target=N.target.parent}this.freeEvent(N)}this.freeEvent(q)}if(K!==Q.target){let H=J.type==="mousemove"?"mouseover":"pointerover",q=this.clonePointerEvent(Q,H);if(this.dispatchEvent(q,"pointerover"),$)this.dispatchEvent(q,"mouseover");let N=K?.parent;while(N&&N!==this.rootTarget.parent){if(N===Q.target)break;N=N.parent}if(!N||N===this.rootTarget.parent){let U=this.clonePointerEvent(Q,"pointerenter");U.eventPhase=U.AT_TARGET;while(U.target&&U.target!==K&&U.target!==this.rootTarget.parent){if(U.currentTarget=U.target,this.notifyTarget(U),$)this.notifyTarget(U,"mouseenter");U.target=U.target.parent}this.freeEvent(U)}this.freeEvent(q)}let W=[],X=this.enableGlobalMoveEvents??!0;if(this.moveOnAll?W.push("pointermove"):this.dispatchEvent(Q,"pointermove"),X&&W.push("globalpointermove"),Q.pointerType==="touch")this.moveOnAll?W.splice(1,0,"touchmove"):this.dispatchEvent(Q,"touchmove"),X&&W.push("globaltouchmove");if($)this.moveOnAll?W.splice(1,0,"mousemove"):this.dispatchEvent(Q,"mousemove"),X&&W.push("globalmousemove"),this.cursor=Q.target?.cursor;if(W.length>0)this.all(Q,W);this._allInteractiveElements.length=0,this._hitElements.length=0,Z.overTargets=Q.composedPath(),this.freeEvent(Q)}mapPointerOver(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}let Q=this.trackingData(J.pointerId),$=this.createPointerEvent(J),Z=$.pointerType==="mouse"||$.pointerType==="pen";if(this.dispatchEvent($,"pointerover"),Z)this.dispatchEvent($,"mouseover");if($.pointerType==="mouse")this.cursor=$.target?.cursor;let K=this.clonePointerEvent($,"pointerenter");K.eventPhase=K.AT_TARGET;while(K.target&&K.target!==this.rootTarget.parent){if(K.currentTarget=K.target,this.notifyTarget(K),Z)this.notifyTarget(K,"mouseenter");K.target=K.target.parent}Q.overTargets=$.composedPath(),this.freeEvent($),this.freeEvent(K)}mapPointerOut(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}let Q=this.trackingData(J.pointerId);if(Q.overTargets){let $=J.pointerType==="mouse"||J.pointerType==="pen",Z=this.findMountedTarget(Q.overTargets),K=this.createPointerEvent(J,"pointerout",Z);if(this.dispatchEvent(K),$)this.dispatchEvent(K,"mouseout");let W=this.createPointerEvent(J,"pointerleave",Z);W.eventPhase=W.AT_TARGET;while(W.target&&W.target!==this.rootTarget.parent){if(W.currentTarget=W.target,this.notifyTarget(W),$)this.notifyTarget(W,"mouseleave");W.target=W.target.parent}Q.overTargets=null,this.freeEvent(K),this.freeEvent(W)}this.cursor=null}mapPointerUp(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}let Q=performance.now(),$=this.createPointerEvent(J);if(this.dispatchEvent($,"pointerup"),$.pointerType==="touch")this.dispatchEvent($,"touchend");else if($.pointerType==="mouse"||$.pointerType==="pen"){let X=$.button===2;this.dispatchEvent($,X?"rightup":"mouseup")}let Z=this.trackingData(J.pointerId),K=this.findMountedTarget(Z.pressTargetsByButton[J.button]),W=K;if(K&&!$.composedPath().includes(K)){let X=K;while(X&&!$.composedPath().includes(X)){if($.currentTarget=X,this.notifyTarget($,"pointerupoutside"),$.pointerType==="touch")this.notifyTarget($,"touchendoutside");else if($.pointerType==="mouse"||$.pointerType==="pen"){let H=$.button===2;this.notifyTarget($,H?"rightupoutside":"mouseupoutside")}X=X.parent}delete Z.pressTargetsByButton[J.button],W=X}if(W){let X=this.clonePointerEvent($,"click");if(X.target=W,X.path=null,!Z.clicksByButton[J.button])Z.clicksByButton[J.button]={clickCount:0,target:X.target,timeStamp:Q};let H=Z.clicksByButton[J.button];if(H.target===X.target&&Q-H.timeStamp<200)++H.clickCount;else H.clickCount=1;if(H.target=X.target,H.timeStamp=Q,X.detail=H.clickCount,X.pointerType==="mouse"){let q=X.button===2;this.dispatchEvent(X,q?"rightclick":"click")}else if(X.pointerType==="touch")this.dispatchEvent(X,"tap");this.dispatchEvent(X,"pointertap"),this.freeEvent(X)}this.freeEvent($)}mapPointerUpOutside(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}let Q=this.trackingData(J.pointerId),$=this.findMountedTarget(Q.pressTargetsByButton[J.button]),Z=this.createPointerEvent(J);if($){let K=$;while(K){if(Z.currentTarget=K,this.notifyTarget(Z,"pointerupoutside"),Z.pointerType==="touch")this.notifyTarget(Z,"touchendoutside");else if(Z.pointerType==="mouse"||Z.pointerType==="pen")this.notifyTarget(Z,Z.button===2?"rightupoutside":"mouseupoutside");K=K.parent}delete Q.pressTargetsByButton[J.button]}this.freeEvent(Z)}mapWheel(J){if(!(J instanceof H7)){v0("EventBoundary cannot map a non-wheel event as a wheel event");return}let Q=this.createWheelEvent(J);this.dispatchEvent(Q),this.freeEvent(Q)}findMountedTarget(J){if(!J)return null;let Q=J[0];for(let $=1;$<J.length;$++)if(J[$].parent===Q)Q=J[$];else break;return Q}createPointerEvent(J,Q,$){let Z=this.allocateEvent(H6);if(this.copyPointerData(J,Z),this.copyMouseData(J,Z),this.copyData(J,Z),Z.nativeEvent=J.nativeEvent,Z.originalEvent=J,Z.target=$??this.hitTest(Z.global.x,Z.global.y)??this._hitElements[0],typeof Q==="string")Z.type=Q;return Z}createWheelEvent(J){let Q=this.allocateEvent(H7);return this.copyWheelData(J,Q),this.copyMouseData(J,Q),this.copyData(J,Q),Q.nativeEvent=J.nativeEvent,Q.originalEvent=J,Q.target=this.hitTest(Q.global.x,Q.global.y),Q}clonePointerEvent(J,Q){let $=this.allocateEvent(H6);return $.nativeEvent=J.nativeEvent,$.originalEvent=J.originalEvent,this.copyPointerData(J,$),this.copyMouseData(J,$),this.copyData(J,$),$.target=J.target,$.path=J.composedPath().slice(),$.type=Q??$.type,$}copyWheelData(J,Q){Q.deltaMode=J.deltaMode,Q.deltaX=J.deltaX,Q.deltaY=J.deltaY,Q.deltaZ=J.deltaZ}copyPointerData(J,Q){if(!(J instanceof H6&&Q instanceof H6))return;Q.pointerId=J.pointerId,Q.width=J.width,Q.height=J.height,Q.isPrimary=J.isPrimary,Q.pointerType=J.pointerType,Q.pressure=J.pressure,Q.tangentialPressure=J.tangentialPressure,Q.tiltX=J.tiltX,Q.tiltY=J.tiltY,Q.twist=J.twist}copyMouseData(J,Q){if(!(J instanceof j7&&Q instanceof j7))return;Q.altKey=J.altKey,Q.button=J.button,Q.buttons=J.buttons,Q.client.copyFrom(J.client),Q.ctrlKey=J.ctrlKey,Q.metaKey=J.metaKey,Q.movement.copyFrom(J.movement),Q.screen.copyFrom(J.screen),Q.shiftKey=J.shiftKey,Q.global.copyFrom(J.global)}copyData(J,Q){Q.isTrusted=J.isTrusted,Q.srcElement=J.srcElement,Q.timeStamp=performance.now(),Q.type=J.type,Q.detail=J.detail,Q.view=J.view,Q.which=J.which,Q.layer.copyFrom(J.layer),Q.page.copyFrom(J.page)}trackingData(J){if(!this.mappingState.trackingData[J])this.mappingState.trackingData[J]={pressTargetsByButton:{},clicksByButton:{},overTarget:null};return this.mappingState.trackingData[J]}allocateEvent(J){if(!this.eventPool.has(J))this.eventPool.set(J,[]);let Q=this.eventPool.get(J).pop()||new J(this);return Q.eventPhase=Q.NONE,Q.currentTarget=null,Q.defaultPrevented=!1,Q.path=null,Q.target=null,Q}freeEvent(J){if(J.manager!==this)throw Error("It is illegal to free an event not managed by this EventBoundary!");let Q=J.constructor;if(!this.eventPool.has(Q))this.eventPool.set(Q,[]);this.eventPool.get(Q).push(J)}_notifyListeners(J,Q){let $=J.currentTarget._events[Q];if(!$)return;if("fn"in $){if($.once)J.currentTarget.removeListener(Q,$.fn,void 0,!0);$.fn.call($.context,J)}else for(let Z=0,K=$.length;Z<K&&!J.propagationImmediatelyStopped;Z++){if($[Z].once)J.currentTarget.removeListener(Q,$[Z].fn,void 0,!0);$[Z].fn.call($[Z].context,J)}}}var X4=2048,H4,y9;var T1=A(()=>{O6();A7();s8();sK();sQ();nK();iK();H4=new O8,y9=new O8});var q4=1,N4,aK=class J{constructor(Q){this.supportsTouchEvents="ontouchstart"in globalThis,this.supportsPointerEvents=!!globalThis.PointerEvent,this.domElement=null,this.resolution=1,this.renderer=Q,this.rootBoundary=new oK(null),f6.init(this),this.autoPreventDefault=!0,this._eventsAdded=!1,this._rootPointerEvent=new H6(null),this._rootWheelEvent=new H7(null),this.cursorStyles={default:"inherit",pointer:"pointer"},this.features=new Proxy({...J.defaultEventFeatures},{set:($,Z,K)=>{if(Z==="globalMove")this.rootBoundary.enableGlobalMoveEvents=K;return $[Z]=K,!0}}),this._onPointerDown=this._onPointerDown.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._onPointerUp=this._onPointerUp.bind(this),this._onPointerOverOut=this._onPointerOverOut.bind(this),this.onWheel=this.onWheel.bind(this)}static get defaultEventMode(){return this._defaultEventMode}init(Q){let{canvas:$,resolution:Z}=this.renderer;this.setTargetElement($),this.resolution=Z,J._defaultEventMode=Q.eventMode??"passive",Object.assign(this.features,Q.eventFeatures??{}),this.rootBoundary.enableGlobalMoveEvents=this.features.globalMove}resolutionChange(Q){this.resolution=Q}destroy(){f6.destroy(),this.setTargetElement(null),this.renderer=null,this._currentCursor=null}setCursor(Q){Q||(Q="default");let $=!0;if(globalThis.OffscreenCanvas&&this.domElement instanceof OffscreenCanvas)$=!1;if(this._currentCursor===Q)return;this._currentCursor=Q;let Z=this.cursorStyles[Q];if(Z)switch(typeof Z){case"string":if($)this.domElement.style.cursor=Z;break;case"function":Z(Q);break;case"object":if($)Object.assign(this.domElement.style,Z);break}else if($&&typeof Q==="string"&&!Object.prototype.hasOwnProperty.call(this.cursorStyles,Q))this.domElement.style.cursor=Q}get pointer(){return this._rootPointerEvent}_onPointerDown(Q){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let $=this._normalizeToPointerData(Q);if(this.autoPreventDefault&&$[0].isNormalized){if(Q.cancelable||!("cancelable"in Q))Q.preventDefault()}for(let Z=0,K=$.length;Z<K;Z++){let W=$[Z],X=this._bootstrapEvent(this._rootPointerEvent,W);this.rootBoundary.mapEvent(X)}this.setCursor(this.rootBoundary.cursor)}_onPointerMove(Q){if(!this.features.move)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered,f6.pointerMoved();let $=this._normalizeToPointerData(Q);for(let Z=0,K=$.length;Z<K;Z++){let W=this._bootstrapEvent(this._rootPointerEvent,$[Z]);this.rootBoundary.mapEvent(W)}this.setCursor(this.rootBoundary.cursor)}_onPointerUp(Q){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let $=Q.target;if(Q.composedPath&&Q.composedPath().length>0)$=Q.composedPath()[0];let Z=$!==this.domElement?"outside":"",K=this._normalizeToPointerData(Q);for(let W=0,X=K.length;W<X;W++){let H=this._bootstrapEvent(this._rootPointerEvent,K[W]);H.type+=Z,this.rootBoundary.mapEvent(H)}this.setCursor(this.rootBoundary.cursor)}_onPointerOverOut(Q){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let $=this._normalizeToPointerData(Q);for(let Z=0,K=$.length;Z<K;Z++){let W=this._bootstrapEvent(this._rootPointerEvent,$[Z]);this.rootBoundary.mapEvent(W)}this.setCursor(this.rootBoundary.cursor)}onWheel(Q){if(!this.features.wheel)return;let $=this.normalizeWheelEvent(Q);this.rootBoundary.rootTarget=this.renderer.lastObjectRendered,this.rootBoundary.mapEvent($)}setTargetElement(Q){this._removeEvents(),this.domElement=Q,f6.domElement=Q,this._addEvents()}_addEvents(){if(this._eventsAdded||!this.domElement)return;f6.addTickerListener();let Q=this.domElement.style;if(Q){if(globalThis.navigator.msPointerEnabled)Q.msContentZooming="none",Q.msTouchAction="none";else if(this.supportsPointerEvents)Q.touchAction="none"}if(this.supportsPointerEvents)globalThis.document.addEventListener("pointermove",this._onPointerMove,!0),this.domElement.addEventListener("pointerdown",this._onPointerDown,!0),this.domElement.addEventListener("pointerleave",this._onPointerOverOut,!0),this.domElement.addEventListener("pointerover",this._onPointerOverOut,!0),globalThis.addEventListener("pointerup",this._onPointerUp,!0);else if(globalThis.document.addEventListener("mousemove",this._onPointerMove,!0),this.domElement.addEventListener("mousedown",this._onPointerDown,!0),this.domElement.addEventListener("mouseout",this._onPointerOverOut,!0),this.domElement.addEventListener("mouseover",this._onPointerOverOut,!0),globalThis.addEventListener("mouseup",this._onPointerUp,!0),this.supportsTouchEvents)this.domElement.addEventListener("touchstart",this._onPointerDown,!0),this.domElement.addEventListener("touchend",this._onPointerUp,!0),this.domElement.addEventListener("touchmove",this._onPointerMove,!0);this.domElement.addEventListener("wheel",this.onWheel,{passive:!0,capture:!0}),this._eventsAdded=!0}_removeEvents(){if(!this._eventsAdded||!this.domElement)return;f6.removeTickerListener();let Q=this.domElement.style;if(Q){if(globalThis.navigator.msPointerEnabled)Q.msContentZooming="",Q.msTouchAction="";else if(this.supportsPointerEvents)Q.touchAction=""}if(this.supportsPointerEvents)globalThis.document.removeEventListener("pointermove",this._onPointerMove,!0),this.domElement.removeEventListener("pointerdown",this._onPointerDown,!0),this.domElement.removeEventListener("pointerleave",this._onPointerOverOut,!0),this.domElement.removeEventListener("pointerover",this._onPointerOverOut,!0),globalThis.removeEventListener("pointerup",this._onPointerUp,!0);else if(globalThis.document.removeEventListener("mousemove",this._onPointerMove,!0),this.domElement.removeEventListener("mousedown",this._onPointerDown,!0),this.domElement.removeEventListener("mouseout",this._onPointerOverOut,!0),this.domElement.removeEventListener("mouseover",this._onPointerOverOut,!0),globalThis.removeEventListener("mouseup",this._onPointerUp,!0),this.supportsTouchEvents)this.domElement.removeEventListener("touchstart",this._onPointerDown,!0),this.domElement.removeEventListener("touchend",this._onPointerUp,!0),this.domElement.removeEventListener("touchmove",this._onPointerMove,!0);this.domElement.removeEventListener("wheel",this.onWheel,!0),this.domElement=null,this._eventsAdded=!1}mapPositionToPoint(Q,$,Z){let K=this.domElement.isConnected?this.domElement.getBoundingClientRect():{x:0,y:0,width:this.domElement.width,height:this.domElement.height,left:0,top:0},W=1/this.resolution;Q.x=($-K.left)*(this.domElement.width/K.width)*W,Q.y=(Z-K.top)*(this.domElement.height/K.height)*W}_normalizeToPointerData(Q){let $=[];if(this.supportsTouchEvents&&Q instanceof TouchEvent)for(let Z=0,K=Q.changedTouches.length;Z<K;Z++){let W=Q.changedTouches[Z];if(typeof W.button>"u")W.button=0;if(typeof W.buttons>"u")W.buttons=1;if(typeof W.isPrimary>"u")W.isPrimary=Q.touches.length===1&&Q.type==="touchstart";if(typeof W.width>"u")W.width=W.radiusX||1;if(typeof W.height>"u")W.height=W.radiusY||1;if(typeof W.tiltX>"u")W.tiltX=0;if(typeof W.tiltY>"u")W.tiltY=0;if(typeof W.pointerType>"u")W.pointerType="touch";if(typeof W.pointerId>"u")W.pointerId=W.identifier||0;if(typeof W.pressure>"u")W.pressure=W.force||0.5;if(typeof W.twist>"u")W.twist=0;if(typeof W.tangentialPressure>"u")W.tangentialPressure=0;if(typeof W.layerX>"u")W.layerX=W.offsetX=W.clientX;if(typeof W.layerY>"u")W.layerY=W.offsetY=W.clientY;W.isNormalized=!0,W.type=Q.type,$.push(W)}else if(!globalThis.MouseEvent||Q instanceof MouseEvent&&(!this.supportsPointerEvents||!(Q instanceof globalThis.PointerEvent))){let Z=Q;if(typeof Z.isPrimary>"u")Z.isPrimary=!0;if(typeof Z.width>"u")Z.width=1;if(typeof Z.height>"u")Z.height=1;if(typeof Z.tiltX>"u")Z.tiltX=0;if(typeof Z.tiltY>"u")Z.tiltY=0;if(typeof Z.pointerType>"u")Z.pointerType="mouse";if(typeof Z.pointerId>"u")Z.pointerId=q4;if(typeof Z.pressure>"u")Z.pressure=0.5;if(typeof Z.twist>"u")Z.twist=0;if(typeof Z.tangentialPressure>"u")Z.tangentialPressure=0;Z.isNormalized=!0,$.push(Z)}else $.push(Q);return $}normalizeWheelEvent(Q){let $=this._rootWheelEvent;return this._transferMouseData($,Q),$.deltaX=Q.deltaX,$.deltaY=Q.deltaY,$.deltaZ=Q.deltaZ,$.deltaMode=Q.deltaMode,this.mapPositionToPoint($.screen,Q.clientX,Q.clientY),$.global.copyFrom($.screen),$.offset.copyFrom($.screen),$.nativeEvent=Q,$.type=Q.type,$}_bootstrapEvent(Q,$){if(Q.originalEvent=null,Q.nativeEvent=$,Q.pointerId=$.pointerId,Q.width=$.width,Q.height=$.height,Q.isPrimary=$.isPrimary,Q.pointerType=$.pointerType,Q.pressure=$.pressure,Q.tangentialPressure=$.tangentialPressure,Q.tiltX=$.tiltX,Q.tiltY=$.tiltY,Q.twist=$.twist,this._transferMouseData(Q,$),this.mapPositionToPoint(Q.screen,$.clientX,$.clientY),Q.global.copyFrom(Q.screen),Q.offset.copyFrom(Q.screen),Q.isTrusted=$.isTrusted,Q.type==="pointerleave")Q.type="pointerout";if(Q.type.startsWith("mouse"))Q.type=Q.type.replace("mouse","pointer");if(Q.type.startsWith("touch"))Q.type=N4[Q.type]||Q.type;return Q}_transferMouseData(Q,$){Q.isTrusted=$.isTrusted,Q.srcElement=$.srcElement,Q.timeStamp=performance.now(),Q.type=$.type,Q.altKey=$.altKey,Q.button=$.button,Q.buttons=$.buttons,Q.client.x=$.clientX,Q.client.y=$.clientY,Q.ctrlKey=$.ctrlKey,Q.metaKey=$.metaKey,Q.movement.x=$.movementX,Q.movement.y=$.movementY,Q.page.x=$.pageX,Q.page.y=$.pageY,Q.relatedTarget=null,Q.shiftKey=$.shiftKey}},nQ;var rK=A(()=>{k0();T1();sK();nK();iK();N4={touchstart:"pointerdown",touchend:"pointerup",touchendoutside:"pointerupoutside",touchmove:"pointermove",touchcancel:"pointercancel"};aK.extension={name:"events",type:[b.WebGLSystem,b.CanvasSystem,b.WebGPUSystem],priority:-1};aK.defaultEventFeatures={move:!0,globalMove:!0,click:!0,wheel:!0};nQ=aK});var y1;var b1=A(()=>{rK();cQ();y1={onclick:null,onmousedown:null,onmouseenter:null,onmouseleave:null,onmousemove:null,onglobalmousemove:null,onmouseout:null,onmouseover:null,onmouseup:null,onmouseupoutside:null,onpointercancel:null,onpointerdown:null,onpointerenter:null,onpointerleave:null,onpointermove:null,onglobalpointermove:null,onpointerout:null,onpointerover:null,onpointertap:null,onpointerup:null,onpointerupoutside:null,onrightclick:null,onrightdown:null,onrightup:null,onrightupoutside:null,ontap:null,ontouchcancel:null,ontouchend:null,ontouchendoutside:null,ontouchmove:null,onglobaltouchmove:null,ontouchstart:null,onwheel:null,get interactive(){return this.eventMode==="dynamic"||this.eventMode==="static"},set interactive(J){this.eventMode=J?"static":"passive"},_internalEventMode:void 0,get eventMode(){return this._internalEventMode??nQ.defaultEventMode},set eventMode(J){this._internalEventMode=J},isInteractive(){return this.eventMode==="static"||this.eventMode==="dynamic"},interactiveChildren:!0,hitArea:null,addEventListener(J,Q,$){let Z=typeof $==="boolean"&&$||typeof $==="object"&&$.capture,K=typeof $==="object"?$.signal:void 0,W=typeof $==="object"?$.once===!0:!1,X=typeof Q==="function"?void 0:Q;J=Z?`${J}capture`:J;let H=typeof Q==="function"?Q:Q.handleEvent,q=this;if(K)K.addEventListener("abort",()=>{q.off(J,H,X)});if(W)q.once(J,H,X);else q.on(J,H,X)},removeEventListener(J,Q,$){let Z=typeof $==="boolean"&&$||typeof $==="object"&&$.capture,K=typeof Q==="function"?void 0:Q;J=Z?`${J}capture`:J,Q=typeof Q==="function"?Q:Q.handleEvent,this.off(J,Q,K)},dispatchEvent(J){if(!(J instanceof P7))throw Error("Container cannot propagate events outside of the Federated Events API");return J.defaultPrevented=!1,J.path=null,J.target=this,J.manager.dispatchEvent(J),!J.defaultPrevented}}});var v1=A(()=>{k0();o6();rK();b1();n0.add(nQ);n0.mixin(R8,y1)});var tK;var f1=A(()=>{tK=((J)=>{return J[J.Low=0]="Low",J[J.Normal=1]="Normal",J[J.High=2]="High",J})(tK||{})});var h1;var x1=A(()=>{h1={createCanvas:(J,Q)=>{let $=document.createElement("canvas");return $.width=J,$.height=Q,$},createImage:()=>new Image,getCanvasRenderingContext2D:()=>CanvasRenderingContext2D,getWebGLRenderingContext:()=>WebGLRenderingContext,getNavigator:()=>navigator,getBaseUrl:()=>document.baseURI??window.location.href,getFontFaceSet:()=>document.fonts,fetch:(J,Q)=>fetch(J,Q),parseXML:(J)=>{return new DOMParser().parseFromString(J,"text/xml")}}});var g1,F8;var D6=A(()=>{x1();g1=h1,F8={get(){return g1},set(J){g1=J}}});function h6(J){if(typeof J!=="string")throw TypeError(`Path must be a string. Received ${JSON.stringify(J)}`)}function b9(J){return J.split("?")[0].split("#")[0]}function Y4(J){return J.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function U4(J,Q,$){return J.replace(new RegExp(Y4(Q),"g"),$)}function V4(J,Q){let $="",Z=0,K=-1,W=0,X=-1;for(let H=0;H<=J.length;++H){if(H<J.length)X=J.charCodeAt(H);else if(X===47)break;else X=47;if(X===47){if(K===H-1||W===1);else if(K!==H-1&&W===2){if($.length<2||Z!==2||$.charCodeAt($.length-1)!==46||$.charCodeAt($.length-2)!==46){if($.length>2){let q=$.lastIndexOf("/");if(q!==$.length-1){if(q===-1)$="",Z=0;else $=$.slice(0,q),Z=$.length-1-$.lastIndexOf("/");K=H,W=0;continue}}else if($.length===2||$.length===1){$="",Z=0,K=H,W=0;continue}}if(Q){if($.length>0)$+="/..";else $="..";Z=2}}else{if($.length>0)$+=`/${J.slice(K+1,H)}`;else $=J.slice(K+1,H);Z=H-K-1}K=H,W=0}else if(X===46&&W!==-1)++W;else W=-1}return $}var e7;var eK=A(()=>{D6();e7={toPosix(J){return U4(J,"\\","/")},isUrl(J){return/^https?:/.test(this.toPosix(J))},isDataUrl(J){return/^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i.test(J)},isBlobUrl(J){return J.startsWith("blob:")},hasProtocol(J){return/^[^/:]+:/.test(this.toPosix(J))},getProtocol(J){h6(J),J=this.toPosix(J);let Q=/^file:\/\/\//.exec(J);if(Q)return Q[0];let $=/^[^/:]+:\/{0,2}/.exec(J);if($)return $[0];return""},toAbsolute(J,Q,$){if(h6(J),this.isDataUrl(J)||this.isBlobUrl(J))return J;let Z=b9(this.toPosix(Q??F8.get().getBaseUrl())),K=b9(this.toPosix($??this.rootname(Z)));if(J=this.toPosix(J),J.startsWith("/"))return e7.join(K,J.slice(1));return this.isAbsolute(J)?J:this.join(Z,J)},normalize(J){if(h6(J),J.length===0)return".";if(this.isDataUrl(J)||this.isBlobUrl(J))return J;J=this.toPosix(J);let Q="",$=J.startsWith("/");if(this.hasProtocol(J))Q=this.rootname(J),J=J.slice(Q.length);let Z=J.endsWith("/");if(J=V4(J,!1),J.length>0&&Z)J+="/";if($)return`/${J}`;return Q+J},isAbsolute(J){if(h6(J),J=this.toPosix(J),this.hasProtocol(J))return!0;return J.startsWith("/")},join(...J){if(J.length===0)return".";let Q;for(let $=0;$<J.length;++$){let Z=J[$];if(h6(Z),Z.length>0)if(Q===void 0)Q=Z;else{let K=J[$-1]??"";if(this.joinExtensions.includes(this.extname(K).toLowerCase()))Q+=`/../${Z}`;else Q+=`/${Z}`}}if(Q===void 0)return".";return this.normalize(Q)},dirname(J){if(h6(J),J.length===0)return".";J=this.toPosix(J);let Q=J.charCodeAt(0),$=Q===47,Z=-1,K=!0,W=this.getProtocol(J),X=J;J=J.slice(W.length);for(let H=J.length-1;H>=1;--H)if(Q=J.charCodeAt(H),Q===47){if(!K){Z=H;break}}else K=!1;if(Z===-1)return $?"/":this.isUrl(X)?W+J:W;if($&&Z===1)return"//";return W+J.slice(0,Z)},rootname(J){h6(J),J=this.toPosix(J);let Q="";if(J.startsWith("/"))Q="/";else Q=this.getProtocol(J);if(this.isUrl(J)){let $=J.indexOf("/",Q.length);if($!==-1)Q=J.slice(0,$);else Q=J;if(!Q.endsWith("/"))Q+="/"}return Q},basename(J,Q){if(h6(J),Q)h6(Q);J=b9(this.toPosix(J));let $=0,Z=-1,K=!0,W;if(Q!==void 0&&Q.length>0&&Q.length<=J.length){if(Q.length===J.length&&Q===J)return"";let X=Q.length-1,H=-1;for(W=J.length-1;W>=0;--W){let q=J.charCodeAt(W);if(q===47){if(!K){$=W+1;break}}else{if(H===-1)K=!1,H=W+1;if(X>=0)if(q===Q.charCodeAt(X)){if(--X===-1)Z=W}else X=-1,Z=H}}if($===Z)Z=H;else if(Z===-1)Z=J.length;return J.slice($,Z)}for(W=J.length-1;W>=0;--W)if(J.charCodeAt(W)===47){if(!K){$=W+1;break}}else if(Z===-1)K=!1,Z=W+1;if(Z===-1)return"";return J.slice($,Z)},extname(J){h6(J),J=b9(this.toPosix(J));let Q=-1,$=0,Z=-1,K=!0,W=0;for(let X=J.length-1;X>=0;--X){let H=J.charCodeAt(X);if(H===47){if(!K){$=X+1;break}continue}if(Z===-1)K=!1,Z=X+1;if(H===46){if(Q===-1)Q=X;else if(W!==1)W=1}else if(Q!==-1)W=-1}if(Q===-1||Z===-1||W===0||W===1&&Q===Z-1&&Q===$+1)return"";return J.slice(Q,Z)},parse(J){h6(J);let Q={root:"",dir:"",base:"",ext:"",name:""};if(J.length===0)return Q;J=b9(this.toPosix(J));let $=J.charCodeAt(0),Z=this.isAbsolute(J),K,W="";if(Q.root=this.rootname(J),Z||this.hasProtocol(J))K=1;else K=0;let X=-1,H=0,q=-1,N=!0,Y=J.length-1,U=0;for(;Y>=K;--Y){if($=J.charCodeAt(Y),$===47){if(!N){H=Y+1;break}continue}if(q===-1)N=!1,q=Y+1;if($===46){if(X===-1)X=Y;else if(U!==1)U=1}else if(X!==-1)U=-1}if(X===-1||q===-1||U===0||U===1&&X===q-1&&X===H+1){if(q!==-1)if(H===0&&Z)Q.base=Q.name=J.slice(1,q);else Q.base=Q.name=J.slice(H,q)}else{if(H===0&&Z)Q.name=J.slice(1,X),Q.base=J.slice(1,q);else Q.name=J.slice(H,X),Q.base=J.slice(H,q);Q.ext=J.slice(X,q)}if(Q.dir=this.dirname(J),W)Q.dir=W+Q.dir;return Q},sep:"/",delimiter:":",joinExtensions:[".html"]}});var S7=(J,Q,$=!1)=>{if(!Array.isArray(J))J=[J];if(!Q)return J;return J.map((Z)=>{if(typeof Z==="string"||$)return Q(Z);return Z})};var JW=()=>{};function p1(J,Q,$,Z,K){let W=Q[$];for(let X=0;X<W.length;X++){let H=W[X];if($<Q.length-1)p1(J.replace(Z[$],H),Q,$+1,Z,K);else K.push(J.replace(Z[$],H))}}function m1(J){let Q=/\{(.*?)\}/g,$=J.match(Q),Z=[];if($){let K=[];$.forEach((W)=>{let X=W.substring(1,W.length-1).split(",");K.push(X)}),p1(J,K,0,$,Z)}else Z.push(J);return Z}var d1=()=>{};var QW=(J)=>!Array.isArray(J);var l1=()=>{};class iQ{constructor(){this._defaultBundleIdentifierOptions={connector:"-",createBundleAssetId:(J,Q)=>`${J}${this._bundleIdConnector}${Q}`,extractAssetIdFromBundle:(J,Q)=>Q.replace(`${J}${this._bundleIdConnector}`,"")},this._bundleIdConnector=this._defaultBundleIdentifierOptions.connector,this._createBundleAssetId=this._defaultBundleIdentifierOptions.createBundleAssetId,this._extractAssetIdFromBundle=this._defaultBundleIdentifierOptions.extractAssetIdFromBundle,this._assetMap={},this._preferredOrder=[],this._parsers=[],this._resolverHash={},this._bundles={}}setBundleIdentifier(J){if(this._bundleIdConnector=J.connector??this._bundleIdConnector,this._createBundleAssetId=J.createBundleAssetId??this._createBundleAssetId,this._extractAssetIdFromBundle=J.extractAssetIdFromBundle??this._extractAssetIdFromBundle,this._extractAssetIdFromBundle("foo",this._createBundleAssetId("foo","bar"))!=="bar")throw Error("[Resolver] GenerateBundleAssetId are not working correctly")}prefer(...J){J.forEach((Q)=>{if(this._preferredOrder.push(Q),!Q.priority)Q.priority=Object.keys(Q.params)}),this._resolverHash={}}set basePath(J){this._basePath=J}get basePath(){return this._basePath}set rootPath(J){this._rootPath=J}get rootPath(){return this._rootPath}get parsers(){return this._parsers}reset(){this.setBundleIdentifier(this._defaultBundleIdentifierOptions),this._assetMap={},this._preferredOrder=[],this._resolverHash={},this._rootPath=null,this._basePath=null,this._manifest=null,this._bundles={},this._defaultSearchParams=null}setDefaultSearchParams(J){if(typeof J==="string")this._defaultSearchParams=J;else{let Q=J;this._defaultSearchParams=Object.keys(Q).map(($)=>`${encodeURIComponent($)}=${encodeURIComponent(Q[$])}`).join("&")}}getAlias(J){let{alias:Q,src:$}=J;return S7(Q||$,(K)=>{if(typeof K==="string")return K;if(Array.isArray(K))return K.map((W)=>W?.src??W);if(K?.src)return K.src;return K},!0)}addManifest(J){if(this._manifest)v0("[Resolver] Manifest already exists, this will be overwritten");this._manifest=J,J.bundles.forEach((Q)=>{this.addBundle(Q.name,Q.assets)})}addBundle(J,Q){let $=[],Z=Q;if(!Array.isArray(Q))Z=Object.entries(Q).map(([K,W])=>{if(typeof W==="string"||Array.isArray(W))return{alias:K,src:W};return{alias:K,...W}});Z.forEach((K)=>{let{src:W,alias:X}=K,H;if(typeof X==="string"){let q=this._createBundleAssetId(J,X);$.push(q),H=[X,q]}else{let q=X.map((N)=>this._createBundleAssetId(J,N));$.push(...q),H=[...X,...q]}this.add({...K,...{alias:H,src:W}})}),this._bundles[J]=$}add(J){let Q=[];if(Array.isArray(J))Q.push(...J);else Q.push(J);let $;$=(K)=>{if(this.hasKey(K))v0(`[Resolver] already has key: ${K} overwriting`)},S7(Q).forEach((K)=>{let{src:W}=K,{data:X,format:H,loadParser:q,parser:N}=K,Y=S7(W).map((D)=>{if(typeof D==="string")return m1(D);return Array.isArray(D)?D:[D]}),U=this.getAlias(K);Array.isArray(U)?U.forEach($):$(U);let V=[],z=(D)=>{let w=this._parsers.find((F)=>F.test(D));return{src:D,...w?.parse(D)}};Y.forEach((D)=>{D.forEach((w)=>{let F={};if(typeof w!=="object")F=z(w);else{if(X=w.data??X,H=w.format??H,w.loadParser||w.parser)q=w.loadParser??q,N=w.parser??N;F={...z(w.src),...w}}if(!U)throw Error(`[Resolver] alias is undefined for this asset: ${F.src}`);F=this._buildResolvedAsset(F,{aliases:U,data:X,format:H,loadParser:q,parser:N,progressSize:K.progressSize}),V.push(F)})}),U.forEach((D)=>{this._assetMap[D]=V})})}resolveBundle(J){let Q=QW(J);J=S7(J);let $={};return J.forEach((Z)=>{let K=this._bundles[Z];if(K){let W=this.resolve(K),X={};for(let H in W){let q=W[H];X[this._extractAssetIdFromBundle(Z,H)]=q}$[Z]=X}}),Q?$[J[0]]:$}resolveUrl(J){let Q=this.resolve(J);if(typeof J!=="string"){let $={};for(let Z in Q)$[Z]=Q[Z].src;return $}return Q.src}resolve(J){let Q=QW(J);J=S7(J);let $={};return J.forEach((Z)=>{if(!this._resolverHash[Z])if(this._assetMap[Z]){let K=this._assetMap[Z],W=this._getPreferredOrder(K);W?.priority.forEach((X)=>{W.params[X].forEach((H)=>{let q=K.filter((N)=>{if(N[X])return N[X]===H;return!1});if(q.length)K=q})}),this._resolverHash[Z]=K[0]}else this._resolverHash[Z]=this._buildResolvedAsset({alias:[Z],src:Z},{});$[Z]=this._resolverHash[Z]}),Q?$[J[0]]:$}hasKey(J){return!!this._assetMap[J]}hasBundle(J){return!!this._bundles[J]}_getPreferredOrder(J){for(let Q=0;Q<J.length;Q++){let $=J[Q],Z=this._preferredOrder.find((K)=>K.params.format.includes($.format));if(Z)return Z}return this._preferredOrder[0]}_appendDefaultSearchParams(J){if(!this._defaultSearchParams)return J;let Q=/\?/.test(J)?"&":"?";return`${J}${Q}${this._defaultSearchParams}`}_buildResolvedAsset(J,Q){let{aliases:$,data:Z,loadParser:K,parser:W,format:X,progressSize:H}=Q;if(this._basePath||this._rootPath)J.src=e7.toAbsolute(J.src,this._basePath,this._rootPath);if(J.alias=$??J.alias??[J.src],J.src=this._appendDefaultSearchParams(J.src),J.data={...Z||{},...J.data},J.loadParser=K??J.loadParser,J.parser=W??J.parser,J.format=X??J.format??O4(J.src),H!==void 0)J.progressSize=H;return J}}function O4(J){return J.split(".").pop().split("?").shift().split("#").shift()}var c1=A(()=>{s8();eK();JW();d1();l1();iQ.RETINA_PREFIX=/@([0-9\.]+)x/});var $W=(J,Q)=>{let $=Q.split("?")[1];if($)J+=`?${$}`;return J};var u1=()=>{};var s1=class J{constructor(Q,$){this.linkedSheets=[];let Z=Q;if(Q?.source instanceof Q8)Z={texture:Q,data:$};let{texture:K,data:W,cachePrefix:X=""}=Z;this.cachePrefix=X,this._texture=K instanceof P0?K:null,this.textureSource=K.source,this.textures={},this.animations={},this.data=W;let H=parseFloat(W.meta.scale);if(H)this.resolution=H,K.source.resolution=this.resolution;else this.resolution=K.source._resolution;this._frames=this.data.frames,this._frameKeys=Object.keys(this._frames),this._batchIndex=0,this._callback=null}parse(){return new Promise((Q)=>{if(this._callback=Q,this._batchIndex=0,this._frameKeys.length<=J.BATCH_SIZE)this._processFrames(0),this._processAnimations(),this._parseComplete();else this._nextBatch()})}parseSync(){return this._processFrames(0,!0),this._processAnimations(),this.textures}_processFrames(Q,$=!1){let Z=Q,K=$?1/0:J.BATCH_SIZE;while(Z-Q<K&&Z<this._frameKeys.length){let W=this._frameKeys[Z],X=this._frames[W],H=X.frame;if(H){let q=null,N=null,Y=X.trimmed!==!1&&X.sourceSize?X.sourceSize:X.frame,U=new G8(0,0,Math.floor(Y.w)/this.resolution,Math.floor(Y.h)/this.resolution);if(X.rotated)q=new G8(Math.floor(H.x)/this.resolution,Math.floor(H.y)/this.resolution,Math.floor(H.h)/this.resolution,Math.floor(H.w)/this.resolution);else q=new G8(Math.floor(H.x)/this.resolution,Math.floor(H.y)/this.resolution,Math.floor(H.w)/this.resolution,Math.floor(H.h)/this.resolution);if(X.trimmed!==!1&&X.spriteSourceSize)N=new G8(Math.floor(X.spriteSourceSize.x)/this.resolution,Math.floor(X.spriteSourceSize.y)/this.resolution,Math.floor(H.w)/this.resolution,Math.floor(H.h)/this.resolution);this.textures[W]=new P0({source:this.textureSource,frame:q,orig:U,trim:N,rotate:X.rotated?2:0,defaultAnchor:X.anchor,defaultBorders:X.borders,label:W.toString()})}Z++}}_processAnimations(){let Q=this.data.animations||{};for(let $ in Q){this.animations[$]=[];for(let Z=0;Z<Q[$].length;Z++){let K=Q[$][Z];this.animations[$].push(this.textures[K])}}}_parseComplete(){let Q=this._callback;this._callback=null,this._batchIndex=0,Q.call(this,this.textures)}_nextBatch(){this._processFrames(this._batchIndex*J.BATCH_SIZE),this._batchIndex++,setTimeout(()=>{if(this._batchIndex*J.BATCH_SIZE<this._frameKeys.length)this._nextBatch();else this._processAnimations(),this._parseComplete()},0)}destroy(Q=!1){for(let $ in this.textures)this.textures[$].destroy();if(this._frames=null,this._frameKeys=null,this.data=null,this.textures=null,Q)this._texture?.destroy(),this.textureSource.destroy();this._texture=null,this.textureSource=null,this.linkedSheets=[]}},ZW;var n1=A(()=>{_7();X6();i8();s1.BATCH_SIZE=1000;ZW=s1});function i1(J,Q,$){let Z={};if(J.forEach((K)=>{Z[K]=Q}),Object.keys(Q.textures).forEach((K)=>{Z[`${Q.cachePrefix}${K}`]=Q.textures[K]}),!$){let K=e7.dirname(J[0]);Q.linkedSheets.forEach((W,X)=>{let H=i1([`${K}/${Q.data.meta.related_multi_packs[X]}`],W,!0);Object.assign(Z,H)})}return Z}var F4,o1;var a1=A(()=>{f1();c1();u1();k0();i8();eK();n1();F4=["jpg","png","jpeg","avif","webp","basis","etc2","bc7","bc6h","bc5","bc4","bc3","bc2","bc1","eac","astc"];o1={extension:b.Asset,cache:{test:(J)=>J instanceof ZW,getCacheableAssets:(J,Q)=>i1(J,Q,!1)},resolver:{extension:{type:b.ResolveParser,name:"resolveSpritesheet"},test:(J)=>{let $=J.split("?")[0].split("."),Z=$.pop(),K=$.pop();return Z==="json"&&F4.includes(K)},parse:(J)=>{let Q=J.split(".");return{resolution:parseFloat(iQ.RETINA_PREFIX.exec(J)?.[1]??"1"),format:Q[Q.length-2],src:J}}},loader:{name:"spritesheetLoader",id:"spritesheet",extension:{type:b.LoadParser,priority:tK.Normal,name:"spritesheetLoader"},async testParse(J,Q){return e7.extname(Q.src).toLowerCase()===".json"&&!!J.frames},async parse(J,Q,$){let{texture:Z,imageFilename:K,textureOptions:W,cachePrefix:X}=Q?.data??{},H=e7.dirname(Q.src);if(H&&H.lastIndexOf("/")!==H.length-1)H+="/";let q;if(Z instanceof P0)q=Z;else{let U=$W(H+(K??J.meta.image),Q.src);q=(await $.load([{src:U,data:W}]))[U]}let N=new ZW({texture:q.source,data:J,cachePrefix:X});await N.parse();let Y=J?.meta?.related_multi_packs;if(Array.isArray(Y)){let U=[];for(let z of Y){if(typeof z!=="string")continue;let D=H+z;if(Q.data?.ignoreMultiPack)continue;D=$W(D,Q.src),U.push($.load({src:D,data:{textureOptions:W,ignoreMultiPack:!0}}))}let V=await Promise.all(U);N.linkedSheets=V,V.forEach((z)=>{z.linkedSheets=[N].concat(N.linkedSheets.filter((D)=>D!==z))})}return N},async unload(J,Q,$){await $.unload(J.textureSource._sourceOrigin),J.destroy(!1)}}}});var oQ=A(()=>{k0();a1();n0.add(o1)});function r1(J,Q,$){let{width:Z,height:K}=$.orig,W=$.trim;if(W){let{width:X,height:H}=W;J.minX=W.x-Q._x*Z,J.maxX=J.minX+X,J.minY=W.y-Q._y*K,J.maxY=J.minY+H}else J.minX=-Q._x*Z,J.maxX=J.minX+Z,J.minY=-Q._y*K,J.maxY=J.minY+K}var t1=()=>{};var KW;var e1=A(()=>{v6();o6();KW=class KW extends R8{constructor(J){super(J);this.canBundle=!0,this.allowChildren=!1,this._roundPixels=0,this._lastUsed=-1,this._gpuData=Object.create(null),this.autoGarbageCollect=!0,this._gcLastUsed=-1,this._bounds=new B8(0,1,0,0),this._boundsDirty=!0,this.autoGarbageCollect=J.autoGarbageCollect??!0}get bounds(){if(!this._boundsDirty)return this._bounds;return this.updateBounds(),this._boundsDirty=!1,this._bounds}get roundPixels(){return!!this._roundPixels}set roundPixels(J){this._roundPixels=J?1:0}containsPoint(J){let Q=this.bounds,{x:$,y:Z}=J;return $>=Q.minX&&$<=Q.maxX&&Z>=Q.minY&&Z<=Q.maxY}onViewUpdate(){if(this._didViewChangeTick++,this._boundsDirty=!0,this.didViewUpdate)return;this.didViewUpdate=!0;let J=this.renderGroup||this.parentRenderGroup;if(J)J.onChildViewUpdate(this)}unload(){this.emit("unload",this);for(let J in this._gpuData)this._gpuData[J]?.destroy();this._gpuData=Object.create(null),this.onViewUpdate()}destroy(J){this.unload(),super.destroy(J),this._bounds=null}collectRenderablesSimple(J,Q,$){let{renderPipes:Z}=Q;Z.blendMode.pushBlendMode(this,this.groupBlendMode,J);let W=Z[this.renderPipeId];if(W?.addRenderable)W.addRenderable(this,J);this.didViewUpdate=!1;let X=this.children,H=X.length;for(let q=0;q<H;q++)X[q].collectRenderables(J,Q,$);Z.blendMode.popBlendMode(J)}}});var x6;var aQ=A(()=>{BK();i8();t1();F6();e1();x6=class x6 extends KW{constructor(J=P0.EMPTY){if(J instanceof P0)J={texture:J};let{texture:Q=P0.EMPTY,anchor:$,roundPixels:Z,width:K,height:W,...X}=J;super({label:"Sprite",...X});if(this.renderPipeId="sprite",this.batched=!0,this._visualBounds={minX:0,maxX:1,minY:0,maxY:0},this._anchor=new x8({_onUpdate:()=>{this.onViewUpdate()}}),$)this.anchor=$;else if(Q.defaultAnchor)this.anchor=Q.defaultAnchor;if(this.texture=Q,this.allowChildren=!1,this.roundPixels=Z??!1,K!==void 0)this.width=K;if(W!==void 0)this.height=W}static from(J,Q=!1){if(J instanceof P0)return new x6(J);return new x6(P0.from(J,Q))}set texture(J){J||(J=P0.EMPTY);let Q=this._texture;if(Q===J)return;if(Q&&Q.dynamic)Q.off("update",this.onViewUpdate,this);if(J.dynamic)J.on("update",this.onViewUpdate,this);if(this._texture=J,this._width)this._setWidth(this._width,this._texture.orig.width);if(this._height)this._setHeight(this._height,this._texture.orig.height);this.onViewUpdate()}get texture(){return this._texture}get visualBounds(){return r1(this._visualBounds,this._anchor,this._texture),this._visualBounds}get sourceBounds(){return u0("8.6.1","Sprite.sourceBounds is deprecated, use visualBounds instead."),this.visualBounds}updateBounds(){let J=this._anchor,Q=this._texture,$=this._bounds,{width:Z,height:K}=Q.orig;$.minX=-J._x*Z,$.maxX=$.minX+Z,$.minY=-J._y*K,$.maxY=$.minY+K}destroy(J=!1){if(super.destroy(J),typeof J==="boolean"?J:J?.texture){let $=typeof J==="boolean"?J:J?.textureSource;this._texture.destroy($)}this._texture=null,this._visualBounds=null,this._bounds=null,this._anchor=null}get anchor(){return this._anchor}set anchor(J){typeof J==="number"?this._anchor.set(J):this._anchor.copyFrom(J)}get width(){return Math.abs(this.scale.x)*this._texture.orig.width}set width(J){this._setWidth(J,this._texture.orig.width),this._width=J}get height(){return Math.abs(this.scale.y)*this._texture.orig.height}set height(J){this._setHeight(J,this._texture.orig.height),this._height=J}getSize(J){return J||(J={}),J.width=Math.abs(this.scale.x)*this._texture.orig.width,J.height=Math.abs(this.scale.y)*this._texture.orig.height,J}setSize(J,Q){if(typeof J==="object")Q=J.height??J.width,J=J.width;else Q??(Q=J);J!==void 0&&this._setWidth(J,this._texture.orig.width),Q!==void 0&&this._setHeight(Q,this._texture.orig.height)}}});function rQ(J,Q,$){let Z=z4;J.measurable=!0,PJ(J,$,Z),Q.addBoundsMask(Z),J.measurable=!1}var z4;var WW=A(()=>{v6();C9();z4=new B8});function tQ(J,Q,$){let Z=z6.get();J.measurable=!0;let K=T8.get().identity(),W=JN(J,$,K);SJ(J,Z,W),J.measurable=!1,Q.addBoundsMask(Z),T8.return(K),z6.return(Z)}function JN(J,Q,$){if(!J)return v0("Mask bounds, renderable is not inside the root container"),$;if(J!==Q)JN(J.parent,Q,$),J.updateLocalTransform(),$.append(J.localTransform);return $}var XW=A(()=>{xQ();n7();s8()});class eQ{constructor(J){if(this.priority=0,this.inverse=!1,this.pipe="alphaMask",J?.mask)this.init(J.mask)}init(J){this.mask=J,this.renderMaskToTexture=!(J instanceof x6),this.mask.renderable=this.renderMaskToTexture,this.mask.includeInBuild=!this.renderMaskToTexture,this.mask.measurable=!1}reset(){if(this.mask===null)return;this.mask.measurable=!0,this.mask=null}addBounds(J,Q){if(!this.inverse)rQ(this.mask,J,Q)}addLocalBounds(J,Q){tQ(this.mask,J,Q)}containsPoint(J,Q){let $=this.mask;return Q($,J)}destroy(){this.reset()}static test(J){return J instanceof x6}}var QN=A(()=>{k0();aQ();WW();XW();eQ.extension=b.MaskEffect});class J${constructor(J){if(this.priority=0,this.pipe="colorMask",J?.mask)this.init(J.mask)}init(J){this.mask=J}destroy(){}static test(J){return typeof J==="number"}}var $N=A(()=>{k0();J$.extension=b.MaskEffect});class Q${constructor(J){if(this.priority=0,this.pipe="stencilMask",J?.mask)this.init(J.mask)}init(J){this.mask=J,this.mask.includeInBuild=!1,this.mask.measurable=!1}reset(){if(this.mask===null)return;this.mask.measurable=!0,this.mask.includeInBuild=!0,this.mask=null}addBounds(J,Q){rQ(this.mask,J,Q)}addLocalBounds(J,Q){tQ(this.mask,J,Q)}containsPoint(J,Q){let $=this.mask;return Q($,J)}destroy(){this.reset()}static test(J){return J instanceof R8}}var ZN=A(()=>{k0();o6();WW();XW();Q$.extension=b.MaskEffect});var k6;var v9=A(()=>{D6();k0();X6();k6=class k6 extends Q8{constructor(J){if(!J.resource)J.resource=F8.get().createCanvas();if(!J.width){if(J.width=J.resource.width,!J.autoDensity)J.width/=J.resolution}if(!J.height){if(J.height=J.resource.height,!J.autoDensity)J.height/=J.resolution}super(J);this.uploadMethodId="image",this.autoDensity=J.autoDensity,this.resizeCanvas(),this.transparent=!!J.transparent}resizeCanvas(){if(this.autoDensity&&"style"in this.resource)this.resource.style.width=`${this.width}px`,this.resource.style.height=`${this.height}px`;if(this.resource.width!==this.pixelWidth||this.resource.height!==this.pixelHeight)this.resource.width=this.pixelWidth,this.resource.height=this.pixelHeight}resize(J=this.width,Q=this.height,$=this._resolution){let Z=super.resize(J,Q,$);if(Z)this.resizeCanvas();return Z}static test(J){return globalThis.HTMLCanvasElement&&J instanceof HTMLCanvasElement||globalThis.OffscreenCanvas&&J instanceof OffscreenCanvas}get context2D(){return this._context2D||(this._context2D=this.resource.getContext("2d"))}};k6.extension=b.TextureSource});var $$;var KN=A(()=>{k0();X6();$$=class $$ extends Q8{constructor(J){super(J);this.uploadMethodId="image",this.autoGarbageCollect=!0}static test(J){return globalThis.HTMLImageElement&&J instanceof HTMLImageElement||typeof ImageBitmap<"u"&&J instanceof ImageBitmap||globalThis.VideoFrame&&J instanceof VideoFrame}};$$.extension=b.TextureSource});async function WN(){return HW??(HW=(async()=>{let Q=F8.get().createCanvas(1,1).getContext("webgl");if(!Q)return"premultiply-alpha-on-upload";let $=await new Promise((X)=>{let H=document.createElement("video");H.onloadeddata=()=>X(H),H.onerror=()=>X(null),H.autoplay=!1,H.crossOrigin="anonymous",H.preload="auto",H.src="data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAHTEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggG97AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBArqBApqBAlPAgQFVsIRVuYEBElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dcfngQCgwqGggQAAAIJJg0IAABAAFgA4JBwYSgAAICAAEb///4r+AAB1oZ2mm+6BAaWWgkmDQgAAEAAWADgkHBhKAAAgIABIQBxTu2uRu4+zgQC3iveBAfGCAXHwgQM=",H.load()});if(!$)return"premultiply-alpha-on-upload";let Z=Q.createTexture();Q.bindTexture(Q.TEXTURE_2D,Z);let K=Q.createFramebuffer();Q.bindFramebuffer(Q.FRAMEBUFFER,K),Q.framebufferTexture2D(Q.FRAMEBUFFER,Q.COLOR_ATTACHMENT0,Q.TEXTURE_2D,Z,0),Q.pixelStorei(Q.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),Q.pixelStorei(Q.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q.NONE),Q.texImage2D(Q.TEXTURE_2D,0,Q.RGBA,Q.RGBA,Q.UNSIGNED_BYTE,$);let W=new Uint8Array(4);return Q.readPixels(0,0,1,1,Q.RGBA,Q.UNSIGNED_BYTE,W),Q.deleteFramebuffer(K),Q.deleteTexture(Z),Q.getExtension("WEBGL_lose_context")?.loseContext(),W[0]<=W[3]?"premultiplied-alpha":"premultiply-alpha-on-upload"})()),HW}var HW;var XN=A(()=>{D6()});var Z$,HN;var qN=A(()=>{k0();fJ();XN();X6();Z$=class J extends Q8{constructor(Q){super(Q);if(this.isReady=!1,this.uploadMethodId="video",Q={...J.defaultOptions,...Q},this._autoUpdate=!0,this._isConnectedToTicker=!1,this._updateFPS=Q.updateFPS||0,this._msToNextUpdate=0,this.autoPlay=Q.autoPlay!==!1,this.alphaMode=Q.alphaMode??"premultiply-alpha-on-upload",this._videoFrameRequestCallback=this._videoFrameRequestCallback.bind(this),this._videoFrameRequestCallbackHandle=null,this._load=null,this._resolve=null,this._reject=null,this._onCanPlay=this._onCanPlay.bind(this),this._onCanPlayThrough=this._onCanPlayThrough.bind(this),this._onError=this._onError.bind(this),this._onPlayStart=this._onPlayStart.bind(this),this._onPlayStop=this._onPlayStop.bind(this),this._onSeeked=this._onSeeked.bind(this),Q.autoLoad!==!1)this.load()}updateFrame(){if(this.destroyed)return;if(this._updateFPS){let Q=l8.shared.elapsedMS*this.resource.playbackRate;this._msToNextUpdate=Math.floor(this._msToNextUpdate-Q)}if(!this._updateFPS||this._msToNextUpdate<=0)this._msToNextUpdate=this._updateFPS?Math.floor(1000/this._updateFPS):0;if(this.isValid)this.update()}_videoFrameRequestCallback(){if(this.updateFrame(),this.destroyed)this._videoFrameRequestCallbackHandle=null;else this._videoFrameRequestCallbackHandle=this.resource.requestVideoFrameCallback(this._videoFrameRequestCallback)}get isValid(){return!!this.resource.videoWidth&&!!this.resource.videoHeight}async load(){if(this._load)return this._load;let Q=this.resource,$=this.options;if((Q.readyState===Q.HAVE_ENOUGH_DATA||Q.readyState===Q.HAVE_FUTURE_DATA)&&Q.width&&Q.height)Q.complete=!0;if(Q.addEventListener("play",this._onPlayStart),Q.addEventListener("pause",this._onPlayStop),Q.addEventListener("seeked",this._onSeeked),!this._isSourceReady()){if(!$.preload)Q.addEventListener("canplay",this._onCanPlay);Q.addEventListener("canplaythrough",this._onCanPlayThrough),Q.addEventListener("error",this._onError,!0)}else this._mediaReady();return this.alphaMode=await WN(),this._load=new Promise((Z,K)=>{if(this.isValid)Z(this);else{if(this._resolve=Z,this._reject=K,$.preloadTimeoutMs!==void 0)this._preloadTimeout=setTimeout(()=>{this._onError(new ErrorEvent(`Preload exceeded timeout of ${$.preloadTimeoutMs}ms`))});Q.load()}}),this._load}_onError(Q){if(this.resource.removeEventListener("error",this._onError,!0),this.emit("error",Q),this._reject)this._reject(Q),this._reject=null,this._resolve=null}_isSourcePlaying(){let Q=this.resource;return!Q.paused&&!Q.ended}_isSourceReady(){return this.resource.readyState>2}_onPlayStart(){if(!this.isValid)this._mediaReady();this._configureAutoUpdate()}_onPlayStop(){this._configureAutoUpdate()}_onSeeked(){if(this._autoUpdate&&!this._isSourcePlaying())this._msToNextUpdate=0,this.updateFrame(),this._msToNextUpdate=0}_onCanPlay(){this.resource.removeEventListener("canplay",this._onCanPlay),this._mediaReady()}_onCanPlayThrough(){if(this.resource.removeEventListener("canplaythrough",this._onCanPlay),this._preloadTimeout)clearTimeout(this._preloadTimeout),this._preloadTimeout=void 0;this._mediaReady()}_mediaReady(){let Q=this.resource;if(this.isValid)this.isReady=!0,this.resize(Q.videoWidth,Q.videoHeight);if(this._msToNextUpdate=0,this.updateFrame(),this._msToNextUpdate=0,this._resolve)this._resolve(this),this._resolve=null,this._reject=null;if(this._isSourcePlaying())this._onPlayStart();else if(this.autoPlay)this.resource.play()}destroy(){this._configureAutoUpdate();let Q=this.resource;if(Q)Q.removeEventListener("play",this._onPlayStart),Q.removeEventListener("pause",this._onPlayStop),Q.removeEventListener("seeked",this._onSeeked),Q.removeEventListener("canplay",this._onCanPlay),Q.removeEventListener("canplaythrough",this._onCanPlayThrough),Q.removeEventListener("error",this._onError,!0),Q.pause(),Q.src="",Q.load();super.destroy()}get autoUpdate(){return this._autoUpdate}set autoUpdate(Q){if(Q!==this._autoUpdate)this._autoUpdate=Q,this._configureAutoUpdate()}get updateFPS(){return this._updateFPS}set updateFPS(Q){if(Q!==this._updateFPS)this._updateFPS=Q,this._configureAutoUpdate()}_configureAutoUpdate(){if(this._autoUpdate&&this._isSourcePlaying())if(!this._updateFPS&&this.resource.requestVideoFrameCallback){if(this._isConnectedToTicker)l8.shared.remove(this.updateFrame,this),this._isConnectedToTicker=!1,this._msToNextUpdate=0;if(this._videoFrameRequestCallbackHandle===null)this._videoFrameRequestCallbackHandle=this.resource.requestVideoFrameCallback(this._videoFrameRequestCallback)}else{if(this._videoFrameRequestCallbackHandle!==null)this.resource.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle),this._videoFrameRequestCallbackHandle=null;if(!this._isConnectedToTicker)l8.shared.add(this.updateFrame,this),this._isConnectedToTicker=!0,this._msToNextUpdate=0}else{if(this._videoFrameRequestCallbackHandle!==null)this.resource.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle),this._videoFrameRequestCallbackHandle=null;if(this._isConnectedToTicker)l8.shared.remove(this.updateFrame,this),this._isConnectedToTicker=!1,this._msToNextUpdate=0}}static test(Q){return globalThis.HTMLVideoElement&&Q instanceof HTMLVideoElement}};Z$.extension=b.TextureSource;Z$.defaultOptions={...Q8.defaultOptions,autoLoad:!0,autoPlay:!0,updateFPS:0,crossorigin:!0,loop:!1,muted:!0,playsinline:!0,preload:!1};Z$.MIME_TYPES={ogv:"video/ogg",mov:"video/quicktime",m4v:"video/mp4"};HN=Z$});class NN{constructor(){this._parsers=[],this._cache=new Map,this._cacheMap=new Map}reset(){this._cacheMap.clear(),this._cache.clear()}has(J){return this._cache.has(J)}get(J){let Q=this._cache.get(J);if(!Q)v0(`[Assets] Asset id ${J} was not found in the Cache`);return Q}set(J,Q){let $=S7(J),Z;for(let H=0;H<this.parsers.length;H++){let q=this.parsers[H];if(q.test(Q)){Z=q.getCacheableAssets($,Q);break}}let K=new Map(Object.entries(Z||{}));if(!Z)$.forEach((H)=>{K.set(H,Q)});let W=[...K.keys()],X={cacheKeys:W,keys:$};$.forEach((H)=>{this._cacheMap.set(H,X)}),W.forEach((H)=>{let q=Z?Z[H]:Q;if(this._cache.has(H)&&this._cache.get(H)!==q)v0("[Cache] already has key:",H);this._cache.set(H,K.get(H))})}remove(J){if(!this._cacheMap.has(J)){v0(`[Assets] Asset id ${J} was not found in the Cache`);return}let Q=this._cacheMap.get(J);Q.cacheKeys.forEach((Z)=>{this._cache.delete(Z)}),Q.keys.forEach((Z)=>{this._cacheMap.delete(Z)})}get parsers(){return this._parsers}}var JJ;var YN=A(()=>{s8();JW();JJ=new NN});function UN(J={}){let Q=J&&J.resource,$=Q?J.resource:J,Z=Q?J:{resource:J};for(let K=0;K<qW.length;K++){let W=qW[K];if(W.test($))return new W(Z)}throw Error(`Could not find a source type for resource: ${Z.resource}`)}function VN(J={},Q=!1){let $=J&&J.resource,Z=$?J.resource:J,K=$?J:{resource:J};if(!Q&&JJ.has(Z))return JJ.get(Z);let W=new P0({source:UN(K)});if(W.on("destroy",()=>{if(JJ.has(Z))JJ.remove(Z)}),!Q)JJ.set(Z,W);return W}function ON(J,Q=!1){if(typeof J==="string")return JJ.get(J);else if(J instanceof Q8)return new P0({source:J});return VN(J,Q)}var qW;var NW=A(()=>{YN();k0();X6();i8();qW=[];n0.handleByList(b.TextureSource,qW);P0.from=ON;Q8.from=UN});var K$=A(()=>{k0();QN();$N();ZN();fK();v9();KN();qN();NW();n0.add(eQ,J$,Q$,HN,$$,k6,yJ)});class W${constructor(J){this._renderer=J}push(J,Q,$){this._renderer.renderPipes.batch.break($),$.add({renderPipeId:"filter",canBundle:!1,action:"pushFilter",container:Q,filterEffect:J})}pop(J,Q,$){this._renderer.renderPipes.batch.break($),$.add({renderPipeId:"filter",action:"popFilter",canBundle:!1})}execute(J){if(J.action==="pushFilter")this._renderer.filter.push(J);else if(J.action==="popFilter")this._renderer.filter.pop()}destroy(){this._renderer=null}}var FN=A(()=>{k0();W$.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"filter"}});function xJ(J,Q){let $=zN[J];if($===void 0){if(YW[Q]===void 0)YW[Q]=1;zN[J]=$=YW[Q]++}return $}var YW,zN;var X$=A(()=>{YW=Object.create(null),zN=Object.create(null)});function q$(){if(!H$||H$?.isContextLost())H$=F8.get().createCanvas().getContext("webgl",{});return H$}var H$;var UW=A(()=>{D6()});function DN(){if(!N$){N$="mediump";let J=q$();if(J){if(J.getShaderPrecisionFormat)N$=J.getShaderPrecisionFormat(J.FRAGMENT_SHADER,J.HIGH_FLOAT).precision?"highp":"mediump"}}return N$}var N$;var kN=A(()=>{UW()});function MN(J,Q,$){if(Q)return J;if($)return J=J.replace("out vec4 finalColor;",""),`

        #ifdef GL_ES // This checks if it is WebGL1
        #define in varying
        #define finalColor gl_FragColor
        #define texture texture2D
        #endif
        ${J}
        `;return`

        #ifdef GL_ES // This checks if it is WebGL1
        #define in attribute
        #define out varying
        #endif
        ${J}
        `}var wN=()=>{};function IN(J,Q,$){let Z=$?Q.maxSupportedFragmentPrecision:Q.maxSupportedVertexPrecision;if(J.substring(0,9)!=="precision"){let K=$?Q.requestedFragmentPrecision:Q.requestedVertexPrecision;if(K==="highp"&&Z!=="highp")K="mediump";return`precision ${K} float;
${J}`}else if(Z!=="highp"&&J.substring(0,15)==="precision highp")return J.replace("precision highp","precision mediump");return J}var LN=()=>{};function GN(J,Q){if(!Q)return J;return`#version 300 es
${J}`}var BN=()=>{};function RN(J,{name:Q="pixi-program"},$=!0){Q=Q.replace(/\s+/g,"-"),Q+=$?"-fragment":"-vertex";let Z=$?D4:k4;if(Z[Q])Z[Q]++,Q+=`-${Z[Q]}`;else Z[Q]=1;if(J.indexOf("#define SHADER_NAME")!==-1)return J;return`${`#define SHADER_NAME ${Q}`}
${J}`}var D4,k4;var AN=A(()=>{D4={},k4={}});function CN(J,Q){if(!Q)return J;return J.replace("#version 300 es","")}var _N=()=>{};var VW,f9,EN=class J{constructor(Q){Q={...J.defaultOptions,...Q};let $=Q.fragment.indexOf("#version 300 es")!==-1,Z={stripVersion:$,ensurePrecision:{requestedFragmentPrecision:Q.preferredFragmentPrecision,requestedVertexPrecision:Q.preferredVertexPrecision,maxSupportedVertexPrecision:"highp",maxSupportedFragmentPrecision:DN()},setProgramName:{name:Q.name},addProgramDefines:$,insertVersion:$},K=Q.fragment,W=Q.vertex;Object.keys(VW).forEach((X)=>{let H=Z[X];K=VW[X](K,H,!0),W=VW[X](W,H,!1)}),this.fragment=K,this.vertex=W,this.transformFeedbackVaryings=Q.transformFeedbackVaryings,this._key=xJ(`${this.vertex}:${this.fragment}`,"gl-program")}destroy(){this.fragment=null,this.vertex=null,this._attributeData=null,this._uniformData=null,this._uniformBlockData=null,this.transformFeedbackVaryings=null,f9[this._cacheKey]=null}static from(Q){let $=`${Q.vertex}:${Q.fragment}`;if(!f9[$])f9[$]=new J(Q),f9[$]._cacheKey=$;return f9[$]}},B6;var QJ=A(()=>{X$();kN();wN();LN();BN();AN();_N();VW={stripVersion:CN,ensurePrecision:IN,addProgramDefines:MN,setProgramName:RN,insertVersion:GN},f9=Object.create(null);EN.defaultOptions={preferredVertexPrecision:"highp",preferredFragmentPrecision:"mediump"};B6=EN});function q7(J){return PN[J]??PN.float32}var PN;var h9=A(()=>{PN={uint8x2:{size:2,stride:2,normalised:!1},uint8x4:{size:4,stride:4,normalised:!1},sint8x2:{size:2,stride:2,normalised:!1},sint8x4:{size:4,stride:4,normalised:!1},unorm8x2:{size:2,stride:2,normalised:!0},unorm8x4:{size:4,stride:4,normalised:!0},snorm8x2:{size:2,stride:2,normalised:!0},snorm8x4:{size:4,stride:4,normalised:!0},uint16x2:{size:2,stride:4,normalised:!1},uint16x4:{size:4,stride:8,normalised:!1},sint16x2:{size:2,stride:4,normalised:!1},sint16x4:{size:4,stride:8,normalised:!1},unorm16x2:{size:2,stride:4,normalised:!0},unorm16x4:{size:4,stride:8,normalised:!0},snorm16x2:{size:2,stride:4,normalised:!0},snorm16x4:{size:4,stride:8,normalised:!0},float16x2:{size:2,stride:4,normalised:!1},float16x4:{size:4,stride:8,normalised:!1},float32:{size:1,stride:4,normalised:!1},float32x2:{size:2,stride:8,normalised:!1},float32x3:{size:3,stride:12,normalised:!1},float32x4:{size:4,stride:16,normalised:!1},uint32:{size:1,stride:4,normalised:!1},uint32x2:{size:2,stride:8,normalised:!1},uint32x3:{size:3,stride:12,normalised:!1},uint32x4:{size:4,stride:16,normalised:!1},sint32:{size:1,stride:4,normalised:!1},sint32x2:{size:2,stride:8,normalised:!1},sint32x3:{size:3,stride:12,normalised:!1},sint32x4:{size:4,stride:16,normalised:!1}}});function SN(J,Q){let $;while(($=jN.exec(J))!==null){let Z=M4[$[3]]??"float32";Q[$[2]]={location:parseInt($[1],10),format:Z,stride:q7(Z).stride,offset:0,instance:!1,start:0}}jN.lastIndex=0}function w4(J){return J.replace(/\/\/.*$/gm,"").replace(/\/\*[\s\S]*?\*\//g,"")}function TN({source:J,entryPoint:Q}){let $={},Z=w4(J),K=Z.indexOf(`fn ${Q}(`);if(K===-1)return $;let W=Z.indexOf("->",K);if(W===-1)return $;let X=Z.substring(K,W);if(SN(X,$),Object.keys($).length===0){let H=X.match(/\(\s*\w+\s*:\s*(\w+)/);if(H){let q=H[1],N=new RegExp(`struct\\s+${q}\\s*\\{([^}]+)\\}`,"s"),Y=Z.match(N);if(Y)SN(Y[1],$)}}return $}var M4,jN;var yN=A(()=>{h9();M4={f32:"float32","vec2<f32>":"float32x2","vec3<f32>":"float32x3","vec4<f32>":"float32x4",vec2f:"float32x2",vec3f:"float32x3",vec4f:"float32x4",i32:"sint32","vec2<i32>":"sint32x2","vec3<i32>":"sint32x3","vec4<i32>":"sint32x4",vec2i:"sint32x2",vec3i:"sint32x3",vec4i:"sint32x4",u32:"uint32","vec2<u32>":"uint32x2","vec3<u32>":"uint32x3","vec4<u32>":"uint32x4",vec2u:"uint32x2",vec3u:"uint32x3",vec4u:"uint32x4",bool:"uint32","vec2<bool>":"uint32x2","vec3<bool>":"uint32x3","vec4<bool>":"uint32x4"},jN=/@location\((\d+)\)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)(?:,|\s|\)|$)/g});function Y$(J){let Q=/(^|[^/])@(group|binding)\(\d+\)[^;]+;/g,$=/@group\((\d+)\)/,Z=/@binding\((\d+)\)/,K=/var(<[^>]+>)? (\w+)/,W=/:\s*([\w<>]+)/,X=/struct\s+(\w+)\s*{([^}]+)}/g,H=/(\w+)\s*:\s*([\w\<\>]+)/g,q=/struct\s+(\w+)/,N=J.match(Q)?.map((U)=>({group:parseInt(U.match($)[1],10),binding:parseInt(U.match(Z)[1],10),name:U.match(K)[2],isUniform:U.match(K)[1]==="<uniform>",type:U.match(W)[1]}));if(!N)return{groups:[],structs:[]};let Y=J.match(X)?.map((U)=>{let V=U.match(q)[1],z=U.match(H).reduce((D,w)=>{let[F,O]=w.split(":");return D[F.trim()]=O.trim(),D},{});if(!z)return null;return{name:V,members:z}}).filter(({name:U})=>N.some((V)=>V.type===U||V.type.includes(`<${U}>`)))??[];return{groups:N,structs:Y}}var bN=()=>{};var T7;var vN=A(()=>{T7=((J)=>{return J[J.VERTEX=1]="VERTEX",J[J.FRAGMENT=2]="FRAGMENT",J[J.COMPUTE=4]="COMPUTE",J})(T7||{})});function fN({groups:J}){let Q=[];for(let $=0;$<J.length;$++){let Z=J[$];if(!Q[Z.group])Q[Z.group]=[];if(Z.isUniform)Q[Z.group].push({binding:Z.binding,visibility:T7.VERTEX|T7.FRAGMENT,buffer:{type:"uniform"}});else if(Z.type==="sampler")Q[Z.group].push({binding:Z.binding,visibility:T7.FRAGMENT,sampler:{type:"filtering"}});else if(Z.type==="texture_2d"||Z.type.startsWith("texture_2d<"))Q[Z.group].push({binding:Z.binding,visibility:T7.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d",multisampled:!1}});else if(Z.type==="texture_2d_array"||Z.type.startsWith("texture_2d_array<"))Q[Z.group].push({binding:Z.binding,visibility:T7.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d-array",multisampled:!1}});else if(Z.type==="texture_cube"||Z.type.startsWith("texture_cube<"))Q[Z.group].push({binding:Z.binding,visibility:T7.FRAGMENT,texture:{sampleType:"float",viewDimension:"cube",multisampled:!1}})}for(let $=0;$<Q.length;$++)Q[$]||(Q[$]=[]);return Q}var hN=A(()=>{vN()});function xN({groups:J}){let Q=[];for(let $=0;$<J.length;$++){let Z=J[$];if(!Q[Z.group])Q[Z.group]={};Q[Z.group][Z.name]=Z.binding}return Q}var gN=()=>{};function pN(J,Q){let $=new Set,Z=new Set,K=[...J.structs,...Q.structs].filter((X)=>{if($.has(X.name))return!1;return $.add(X.name),!0}),W=[...J.groups,...Q.groups].filter((X)=>{let H=`${X.name}-${X.binding}`;if(Z.has(H))return!1;return Z.add(H),!0});return{structs:K,groups:W}}var mN=()=>{};class R6{constructor(J){this._layoutKey=0,this._attributeLocationsKey=0;let{fragment:Q,vertex:$,layout:Z,gpuLayout:K,name:W}=J;if(this.name=W,this.fragment=Q,this.vertex=$,Q.source===$.source){let X=Y$(Q.source);this.structsAndGroups=X}else{let X=Y$($.source),H=Y$(Q.source);this.structsAndGroups=pN(X,H)}this.layout=Z??xN(this.structsAndGroups),this.gpuLayout=K??fN(this.structsAndGroups),this.autoAssignGlobalUniforms=this.layout[0]?.globalUniforms!==void 0,this.autoAssignLocalUniforms=this.layout[1]?.localUniforms!==void 0,this._generateProgramKey()}_generateProgramKey(){let{vertex:J,fragment:Q}=this,$=J.source+Q.source+J.entryPoint+Q.entryPoint;this._layoutKey=xJ($,"program")}get attributeData(){return this._attributeData??(this._attributeData=TN(this.vertex)),this._attributeData}destroy(){this.gpuLayout=null,this.layout=null,this.structsAndGroups=null,this.fragment=null,this.vertex=null,x9[this._cacheKey]=null}static from(J){let Q=`${J.vertex.source}:${J.fragment.source}:${J.fragment.entryPoint}:${J.vertex.entryPoint}`;if(!x9[Q])x9[Q]=new R6(J),x9[Q]._cacheKey=Q;return x9[Q]}}var x9;var gJ=A(()=>{X$();yN();bN();hN();gN();mN();x9=Object.create(null)});class N7{constructor(J){this.resources=Object.create(null),this._dirty=!0;let Q=0;for(let $ in J){let Z=J[$];this.setResource(Z,Q++)}this._updateKey()}_updateKey(){if(!this._dirty)return;this._dirty=!1;let J=[],Q=0;for(let $ in this.resources)J[Q++]=this.resources[$]._resourceId;this._key=J.join("|")}setResource(J,Q){let $=this.resources[Q];if(J===$)return;if($)J.off?.("change",this.onResourceChange,this);J.on?.("change",this.onResourceChange,this),this.resources[Q]=J,this._dirty=!0}getResource(J){return this.resources[J]}_touch(J,Q){let $=this.resources;for(let Z in $)$[Z]._gcLastUsed=J,$[Z]._touched=Q}destroy(){let J=this.resources;for(let Q in J)J[Q]?.off?.("change",this.onResourceChange,this);this.resources=null}onResourceChange(J){if(this._dirty=!0,J.destroyed){let Q=this.resources;for(let $ in Q)if(Q[$]===J)Q[$]=null}else this._updateKey()}}var U$=()=>{};var q6;var $J=A(()=>{q6=((J)=>{return J[J.WEBGL=1]="WEBGL",J[J.WEBGPU=2]="WEBGPU",J[J.CANVAS=4]="CANVAS",J[J.BOTH=3]="BOTH",J})(q6||{})});var OW,dN;var lN=A(()=>{OW=["f32","i32","vec2<f32>","vec3<f32>","vec4<f32>","mat2x2<f32>","mat3x3<f32>","mat4x4<f32>","mat3x2<f32>","mat4x2<f32>","mat2x3<f32>","mat4x3<f32>","mat2x4<f32>","mat3x4<f32>","vec2<i32>","vec3<i32>","vec4<i32>"],dN=OW.reduce((J,Q)=>{return J[Q]=!0,J},{})});function cN(J,Q){switch(J){case"f32":return 0;case"vec2<f32>":return new Float32Array(2*Q);case"vec3<f32>":return new Float32Array(3*Q);case"vec4<f32>":return new Float32Array(4*Q);case"mat2x2<f32>":return new Float32Array([1,0,0,1]);case"mat3x3<f32>":return new Float32Array([1,0,0,0,1,0,0,0,1]);case"mat4x4<f32>":return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}return null}var uN=()=>{};var sN=class J{constructor(Q,$){this._touched=0,this.uid=i0("uniform"),this._resourceType="uniformGroup",this._resourceId=i0("resource"),this.isUniformGroup=!0,this._dirtyId=0,this.destroyed=!1,$={...J.defaultOptions,...$},this.uniformStructures=Q;let Z={};for(let K in Q){let W=Q[K];if(W.name=K,W.size=W.size??1,!dN[W.type]){let X=W.type.match(/^array<(\w+(?:<\w+>)?),\s*(\d+)>$/);if(X){let[,H,q]=X;throw Error(`Uniform type ${W.type} is not supported. Use type: '${H}', size: ${q} instead.`)}throw Error(`Uniform type ${W.type} is not supported. Supported uniform types are: ${OW.join(", ")}`)}W.value??(W.value=cN(W.type,W.size)),Z[K]=W.value}this.uniforms=Z,this._dirtyId=1,this.ubo=$.ubo,this.isStatic=$.isStatic,this._signature=xJ(Object.keys(Z).map((K)=>`${K}-${Q[K].type}`).join("-"),"uniform-group")}update(){this._dirtyId++}},o8;var Y7=A(()=>{W6();X$();lN();uN();sN.defaultOptions={ubo:!1,isStatic:!1};o8=sN});var A6;var pJ=A(()=>{O6();W6();QJ();U$();gJ();$J();Y7();A6=class A6 extends _8{constructor(J){super();this.uid=i0("shader"),this._uniformBindMap=Object.create(null),this._ownedBindGroups=[],this._destroyed=!1;let{gpuProgram:Q,glProgram:$,groups:Z,resources:K,compatibleRenderers:W,groupMap:X}=J;if(this.gpuProgram=Q,this.glProgram=$,W===void 0){if(W=0,Q)W|=q6.WEBGPU;if($)W|=q6.WEBGL}this.compatibleRenderers=W;let H={};if(!K&&!Z)K={};if(K&&Z)throw Error("[Shader] Cannot have both resources and groups");else if(!Q&&Z&&!X)throw Error("[Shader] No group map or WebGPU shader provided - consider using resources instead.");else if(!Q&&Z&&X)for(let q in X)for(let N in X[q]){let Y=X[q][N];H[Y]={group:q,binding:N,name:Y}}else if(Q&&Z&&!X){let q=Q.structsAndGroups.groups;X={},q.forEach((N)=>{X[N.group]=X[N.group]||{},X[N.group][N.binding]=N.name,H[N.name]=N})}else if(K){if(Z={},X={},Q)Q.structsAndGroups.groups.forEach((Y)=>{X[Y.group]=X[Y.group]||{},X[Y.group][Y.binding]=Y.name,H[Y.name]=Y});let q=0;for(let N in K){if(H[N])continue;if(!Z[99])Z[99]=new N7,this._ownedBindGroups.push(Z[99]);H[N]={group:99,binding:q,name:N},X[99]=X[99]||{},X[99][q]=N,q++}for(let N in K){let Y=N,U=K[N];if(!U.source&&!U._resourceType)U=new o8(U);let V=H[Y];if(V){if(!Z[V.group])Z[V.group]=new N7,this._ownedBindGroups.push(Z[V.group]);Z[V.group].setResource(U,V.binding)}}}this.groups=Z,this._uniformBindMap=X,this.resources=this._buildResourceAccessor(Z,H)}addResource(J,Q,$){var Z,K;if((Z=this._uniformBindMap)[Q]||(Z[Q]={}),(K=this._uniformBindMap[Q])[$]||(K[$]=J),!this.groups[Q])this.groups[Q]=new N7,this._ownedBindGroups.push(this.groups[Q])}_buildResourceAccessor(J,Q){let $={};for(let Z in Q){let K=Q[Z];Object.defineProperty($,K.name,{get(){return J[K.group].getResource(K.binding)},set(W){J[K.group].setResource(W,K.binding)}})}return $}destroy(J=!1){if(this._destroyed)return;if(this._destroyed=!0,this.emit("destroy",this),J)this.gpuProgram?.destroy(),this.glProgram?.destroy();this.gpuProgram=null,this.glProgram=null,this.removeAllListeners(),this._uniformBindMap=null,this._ownedBindGroups.forEach((Q)=>{Q.destroy()}),this._ownedBindGroups=null,this.resources=null,this.groups=null}static from(J){let{gpu:Q,gl:$,...Z}=J,K,W;if(Q)K=R6.from(Q);if($)W=B6.from($);return new A6({gpuProgram:K,glProgram:W,...Z})}}});var I4,FW=class J{constructor(){this.data=0,this.blendMode="normal",this.polygonOffset=0,this.blend=!0,this.depthMask=!0}get blend(){return!!(this.data&1)}set blend(Q){if(!!(this.data&1)!==Q)this.data^=1}get offsets(){return!!(this.data&2)}set offsets(Q){if(!!(this.data&2)!==Q)this.data^=2}set cullMode(Q){if(Q==="none"){this.culling=!1;return}this.culling=!0,this.clockwiseFrontFace=Q==="front"}get cullMode(){if(!this.culling)return"none";return this.clockwiseFrontFace?"front":"back"}get culling(){return!!(this.data&4)}set culling(Q){if(!!(this.data&4)!==Q)this.data^=4}get depthTest(){return!!(this.data&8)}set depthTest(Q){if(!!(this.data&8)!==Q)this.data^=8}get depthMask(){return!!(this.data&32)}set depthMask(Q){if(!!(this.data&32)!==Q)this.data^=32}get clockwiseFrontFace(){return!!(this.data&16)}set clockwiseFrontFace(Q){if(!!(this.data&16)!==Q)this.data^=16}get blendMode(){return this._blendMode}set blendMode(Q){this.blend=Q!=="none",this._blendMode=Q,this._blendModeId=I4[Q]||0}get polygonOffset(){return this._polygonOffset}set polygonOffset(Q){this.offsets=!!Q,this._polygonOffset=Q}toString(){return`[pixi.js/core:State blendMode=${this.blendMode} clockwiseFrontFace=${this.clockwiseFrontFace} culling=${this.culling} depthMask=${this.depthMask} polygonOffset=${this.polygonOffset}]`}static for2d(){let Q=new J;return Q.depthTest=!1,Q.blend=!0,Q}},a6;var mJ=A(()=>{I4={normal:0,add:1,multiply:2,screen:3,overlay:4,erase:5,"normal-npm":6,"add-npm":7,"screen-npm":8,min:9,max:10};FW.default2d=FW.for2d();a6=FW});var nN,V$;var zW=A(()=>{QJ();gJ();pJ();mJ();nN=class J extends A6{constructor(Q){Q={...J.defaultOptions,...Q};super(Q);if(this.enabled=!0,this._state=a6.for2d(),this.blendMode=Q.blendMode,this.padding=Q.padding,typeof Q.antialias==="boolean")this.antialias=Q.antialias?"on":"off";else this.antialias=Q.antialias;if(this.resolution=Q.resolution,this.blendRequired=Q.blendRequired,this.clipToViewport=Q.clipToViewport,this.addResource("uTexture",0,1),Q.blendRequired)this.addResource("uBackTexture",0,3)}apply(Q,$,Z,K){Q.applyFilter(this,$,Z,K)}get blendMode(){return this._state.blendMode}set blendMode(Q){this._state.blendMode=Q}static from(Q){let{gpu:$,gl:Z,...K}=Q,W,X;if($)W=R6.from($);if(Z)X=B6.from(Z);return new J({gpuProgram:W,glProgram:X,...K})}};nN.defaultOptions={blendMode:"normal",resolution:1,padding:0,antialias:"off",blendRequired:!1,clipToViewport:!0};V$=nN});var iN=`in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;var oN=()=>{};var aN=`in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
void main() {
    finalColor = texture(uTexture, vTextureCoord);
}
`;var rN=()=>{};var DW=`struct GlobalFilterUniforms {
  uInputSize: vec4<f32>,
  uInputPixel: vec4<f32>,
  uInputClamp: vec4<f32>,
  uOutputFrame: vec4<f32>,
  uGlobalFrame: vec4<f32>,
  uOutputTexture: vec4<f32>,
};

@group(0) @binding(0) var <uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;

struct VSOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>
};

fn filterVertexPosition(aPosition: vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord(aPosition: vec2<f32>) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(
  @location(0) aPosition: vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
) -> @location(0) vec4<f32> {
    return textureSample(uTexture, uSampler, uv);
}
`;var tN=()=>{};var kW;var eN=A(()=>{QJ();gJ();zW();oN();rN();tN();kW=class kW extends V${constructor(){let J=R6.from({vertex:{source:DW,entryPoint:"mainVertex"},fragment:{source:DW,entryPoint:"mainFragment"},name:"passthrough-filter"}),Q=B6.from({vertex:iN,fragment:aN,name:"passthrough-filter"});super({gpuProgram:J,glProgram:Q})}}});var M8;var dJ=A(()=>{M8=((J)=>{return J[J.MAP_READ=1]="MAP_READ",J[J.MAP_WRITE=2]="MAP_WRITE",J[J.COPY_SRC=4]="COPY_SRC",J[J.COPY_DST=8]="COPY_DST",J[J.INDEX=16]="INDEX",J[J.VERTEX=32]="VERTEX",J[J.UNIFORM=64]="UNIFORM",J[J.STORAGE=128]="STORAGE",J[J.INDIRECT=256]="INDIRECT",J[J.QUERY_RESOLVE=512]="QUERY_RESOLVE",J[J.STATIC=1024]="STATIC",J})(M8||{})});var C6;var g9=A(()=>{O6();W6();dJ();C6=class C6 extends _8{constructor(J){let{data:Q,size:$}=J,{usage:Z,label:K,shrinkToFit:W}=J;super();if(this._gpuData=Object.create(null),this._gcLastUsed=-1,this.autoGarbageCollect=!0,this.uid=i0("buffer"),this._resourceType="buffer",this._resourceId=i0("resource"),this._touched=0,this._updateID=1,this._dataInt32=null,this.shrinkToFit=!0,this.destroyed=!1,Q instanceof Array)Q=new Float32Array(Q);this._data=Q,$??($=Q?.byteLength);let X=!!Q;this.descriptor={size:$,usage:Z,mappedAtCreation:X,label:K},this.shrinkToFit=W??!0}get data(){return this._data}set data(J){this.setDataWithSize(J,J.length,!0)}get dataInt32(){if(!this._dataInt32)this._dataInt32=new Int32Array(this.data.buffer);return this._dataInt32}get static(){return!!(this.descriptor.usage&M8.STATIC)}set static(J){if(J)this.descriptor.usage|=M8.STATIC;else this.descriptor.usage&=~M8.STATIC}setDataWithSize(J,Q,$){if(this._updateID++,this._updateSize=Q*J.BYTES_PER_ELEMENT,this._data===J){if($)this.emit("update",this);return}let Z=this._data;if(this._data=J,this._dataInt32=null,!Z||Z.length!==J.length){if(!this.shrinkToFit&&Z&&J.byteLength<Z.byteLength){if($)this.emit("update",this)}else this.descriptor.size=J.byteLength,this._resourceId=i0("resource"),this.emit("change",this);return}if($)this.emit("update",this)}update(J){this._updateSize=J??this._updateSize,this._updateID++,this.emit("update",this)}unload(){this.emit("unload",this);for(let J in this._gpuData)this._gpuData[J]?.destroy();this._gpuData=Object.create(null)}destroy(){this.destroyed=!0,this.unload(),this.emit("destroy",this),this.emit("change",this),this._data=null,this.descriptor=null,this.removeAllListeners()}}});function MW(J,Q){if(!(J instanceof C6)){let $=Q?M8.INDEX:M8.VERTEX;if(J instanceof Array)if(Q)J=new Uint32Array(J),$=M8.INDEX|M8.COPY_DST;else J=new Float32Array(J),$=M8.VERTEX|M8.COPY_DST;J=new C6({data:J,label:Q?"index-mesh-buffer":"vertex-mesh-buffer",usage:$})}return J}var JY=A(()=>{g9();dJ()});function QY(J,Q,$){let Z=J.getAttribute(Q);if(!Z)return $.minX=0,$.minY=0,$.maxX=0,$.maxY=0,$;let K=Z.buffer.data,W=1/0,X=1/0,H=-1/0,q=-1/0,N=K.BYTES_PER_ELEMENT,Y=(Z.offset||0)/N,U=(Z.stride||8)/N;for(let V=Y;V<K.length;V+=U){let z=K[V],D=K[V+1];if(z>H)H=z;if(D>q)q=D;if(z<W)W=z;if(D<X)X=D}return $.minX=W,$.minY=X,$.maxX=H,$.maxY=q,$}var $Y=()=>{};function L4(J){if(J instanceof C6||Array.isArray(J)||J.BYTES_PER_ELEMENT)J={buffer:J};return J.buffer=MW(J.buffer,!1),J}var ZJ;var O$=A(()=>{O6();v6();W6();g9();JY();$Y();ZJ=class ZJ extends _8{constructor(J={}){super();this._gpuData=Object.create(null),this.autoGarbageCollect=!0,this._gcLastUsed=-1,this.uid=i0("geometry"),this._layoutKey=0,this.instanceCount=1,this._bounds=new B8,this._boundsDirty=!0;let{attributes:Q,indexBuffer:$,topology:Z}=J;if(this.buffers=[],this.attributes={},Q)for(let K in Q)this.addAttribute(K,Q[K]);if(this.instanceCount=J.instanceCount??1,$)this.addIndex($);this.topology=Z||"triangle-list"}onBufferUpdate(){this._boundsDirty=!0,this.emit("update",this)}getAttribute(J){return this.attributes[J]}getIndex(){return this.indexBuffer}getBuffer(J){return this.getAttribute(J).buffer}getSize(){for(let J in this.attributes){let Q=this.attributes[J];return Q.buffer.data.length/(Q.stride/4||Q.size)}return 0}addAttribute(J,Q){let $=L4(Q);if(this.buffers.indexOf($.buffer)===-1)this.buffers.push($.buffer),$.buffer.on("update",this.onBufferUpdate,this),$.buffer.on("change",this.onBufferUpdate,this);this.attributes[J]=$}addIndex(J){this.indexBuffer=MW(J,!0),this.buffers.push(this.indexBuffer)}get bounds(){if(!this._boundsDirty)return this._bounds;return this._boundsDirty=!1,QY(this,"aPosition",this._bounds)}unload(){this.emit("unload",this);for(let J in this._gpuData)this._gpuData[J]?.destroy();this._gpuData=Object.create(null)}destroy(J=!1){if(this.emit("destroy",this),this.removeAllListeners(),J)this.buffers.forEach((Q)=>Q.destroy());this.unload(),this.indexBuffer?.destroy(),this.attributes=null,this.buffers=null,this.indexBuffer=null,this._bounds=null}}});function KY(J,Q){Q.clear();let $=Q.matrix;for(let Z=0;Z<J.length;Z++){let K=J[Z];if(K.globalDisplayStatus<7)continue;let W=K.renderGroup??K.parentRenderGroup;if(W?.isCachedAsTexture)Q.matrix=ZY.copyFrom(W.textureOffsetInverseTransform).append(K.worldTransform);else if(W?._parentCacheAsTextureRenderGroup)Q.matrix=ZY.copyFrom(W._parentCacheAsTextureRenderGroup.inverseWorldTransform).append(K.groupTransform);else Q.matrix=K.worldTransform;Q.addBounds(K.bounds)}return Q.matrix=$,Q}var ZY;var WY=A(()=>{E8();ZY=new R0});class XY{constructor(){this.skip=!1,this.inputTexture=null,this.backTexture=null,this.filters=null,this.bounds=new B8,this.container=null,this.blendRequired=!1,this.outputRenderSurface=null,this.globalFrame={x:0,y:0,width:0,height:0},this.firstEnabledIndex=-1,this.lastEnabledIndex=-1}}class F${constructor(J){this._filterStackIndex=0,this._filterStack=[],this._filterGlobalUniforms=new o8({uInputSize:{value:new Float32Array(4),type:"vec4<f32>"},uInputPixel:{value:new Float32Array(4),type:"vec4<f32>"},uInputClamp:{value:new Float32Array(4),type:"vec4<f32>"},uOutputFrame:{value:new Float32Array(4),type:"vec4<f32>"},uGlobalFrame:{value:new Float32Array(4),type:"vec4<f32>"},uOutputTexture:{value:new Float32Array(4),type:"vec4<f32>"}}),this._globalFilterBindGroup=new N7({}),this.renderer=J}get activeBackTexture(){return this._activeFilterData?.backTexture}push(J){let Q=this.renderer,$=J.filterEffect.filters,Z=this._pushFilterData();Z.skip=!1,Z.filters=$,Z.container=J.container,Z.outputRenderSurface=Q.renderTarget.renderSurface;let K=Q.renderTarget.renderTarget.colorTexture.source,W=K.resolution,X=K.antialias;if($.every((V)=>!V.enabled)){Z.skip=!0;return}let H=Z.bounds;if(this._calculateFilterArea(J,H),this._calculateFilterBounds(Z,Q.renderTarget.rootViewPort,X,W,1),Z.skip)return;let q=this._getPreviousFilterData(),N=this._findFilterResolution(W),Y=0,U=0;if(q)Y=q.bounds.minX,U=q.bounds.minY;this._calculateGlobalFrame(Z,Y,U,N,K.width,K.height),this._setupFilterTextures(Z,H,Q,q)}generateFilteredTexture({texture:J,filters:Q}){let $=this._pushFilterData();this._activeFilterData=$,$.skip=!1,$.filters=Q;let Z=J.source,K=Z.resolution,W=Z.antialias;if(Q.every((V)=>!V.enabled))return $.skip=!0,J;let X=$.bounds;if(X.addRect(J.frame),this._calculateFilterBounds($,X.rectangle,W,K,0),$.skip)return J;let H=K,q=0,N=0;this._calculateGlobalFrame($,q,N,H,Z.width,Z.height),$.outputRenderSurface=g8.getOptimalTexture(X.width,X.height,$.resolution,$.antialias),$.backTexture=P0.EMPTY,$.inputTexture=J,this.renderer.renderTarget.finishRenderPass(),this._applyFiltersToTexture($,!0);let U=$.outputRenderSurface;return U.source.alphaMode="premultiplied-alpha",U}pop(){let J=this.renderer,Q=this._popFilterData();if(Q.skip)return;if(J.globalUniforms.pop(),J.renderTarget.finishRenderPass(),this._activeFilterData=Q,this._applyFiltersToTexture(Q,!1),Q.blendRequired)g8.returnTexture(Q.backTexture);g8.returnTexture(Q.inputTexture)}getBackTexture(J,Q,$){let Z=J.colorTexture.source._resolution,K=g8.getOptimalTexture(Q.width,Q.height,Z,!1),W=Q.minX,X=Q.minY;if($)W-=$.minX,X-=$.minY;W=Math.floor(W*Z),X=Math.floor(X*Z);let H=Math.ceil(Q.width*Z),q=Math.ceil(Q.height*Z);return this.renderer.renderTarget.copyToTexture(J,K,{x:W,y:X},{width:H,height:q},{x:0,y:0}),K}applyFilter(J,Q,$,Z){let K=this.renderer,W=this._activeFilterData,H=W.outputRenderSurface===$,q=K.renderTarget.rootRenderTarget.colorTexture.source._resolution,N=this._findFilterResolution(q),Y=0,U=0;if(H){let z=this._findPreviousFilterOffset();Y=z.x,U=z.y}this._updateFilterUniforms(Q,$,W,Y,U,N,H,Z);let V=J.enabled?J:this._getPassthroughFilter();this._setupBindGroupsAndRender(V,Q,K)}calculateSpriteMatrix(J,Q){let $=this._activeFilterData,Z=J.set($.inputTexture._source.width,0,0,$.inputTexture._source.height,$.bounds.minX,$.bounds.minY),K=Q.worldTransform.copyTo(R0.shared),W=Q.renderGroup||Q.parentRenderGroup;if(W&&W.cacheToLocalTransform)K.prepend(W.cacheToLocalTransform);return K.invert(),Z.prepend(K),Z.scale(1/Q.texture.orig.width,1/Q.texture.orig.height),Z.translate(Q.anchor.x,Q.anchor.y),Z}destroy(){this._passthroughFilter?.destroy(!0),this._passthroughFilter=null}_getPassthroughFilter(){return this._passthroughFilter??(this._passthroughFilter=new kW),this._passthroughFilter}_setupBindGroupsAndRender(J,Q,$){if($.renderPipes.uniformBatch){let Z=$.renderPipes.uniformBatch.getUboResource(this._filterGlobalUniforms);this._globalFilterBindGroup.setResource(Z,0)}else this._globalFilterBindGroup.setResource(this._filterGlobalUniforms,0);if(this._globalFilterBindGroup.setResource(Q.source,1),this._globalFilterBindGroup.setResource(Q.source.style,2),J.groups[0]=this._globalFilterBindGroup,$.encoder.draw({geometry:G4,shader:J,state:J._state,topology:"triangle-list"}),$.type===q6.WEBGL)$.renderTarget.finishRenderPass()}_setupFilterTextures(J,Q,$,Z){if(J.backTexture=P0.EMPTY,J.inputTexture=g8.getOptimalTexture(Q.width,Q.height,J.resolution,J.antialias),J.blendRequired){$.renderTarget.finishRenderPass();let K=$.renderTarget.getRenderTarget(J.outputRenderSurface);J.backTexture=this.getBackTexture(K,Q,Z?.bounds)}$.renderTarget.bind(J.inputTexture,!0),$.globalUniforms.push({offset:Q})}_calculateGlobalFrame(J,Q,$,Z,K,W){let X=J.globalFrame;X.x=Q*Z,X.y=$*Z,X.width=K*Z,X.height=W*Z}_updateFilterUniforms(J,Q,$,Z,K,W,X,H){let q=this._filterGlobalUniforms.uniforms,N=q.uOutputFrame,Y=q.uInputSize,U=q.uInputPixel,V=q.uInputClamp,z=q.uGlobalFrame,D=q.uOutputTexture;if(X)N[0]=$.bounds.minX-Z,N[1]=$.bounds.minY-K;else N[0]=0,N[1]=0;N[2]=J.frame.width,N[3]=J.frame.height,Y[0]=J.source.width,Y[1]=J.source.height,Y[2]=1/Y[0],Y[3]=1/Y[1],U[0]=J.source.pixelWidth,U[1]=J.source.pixelHeight,U[2]=1/U[0],U[3]=1/U[1],V[0]=0.5*U[2],V[1]=0.5*U[3],V[2]=J.frame.width*Y[2]-0.5*U[2],V[3]=J.frame.height*Y[3]-0.5*U[3];let w=this.renderer.renderTarget.rootRenderTarget.colorTexture;if(z[0]=Z*W,z[1]=K*W,z[2]=w.source.width*W,z[3]=w.source.height*W,Q instanceof P0)Q.source.resource=null;let F=this.renderer.renderTarget.getRenderTarget(Q);if(this.renderer.renderTarget.bind(Q,!!H),Q instanceof P0)D[0]=Q.frame.width,D[1]=Q.frame.height;else D[0]=F.width,D[1]=F.height;D[2]=F.isRoot?-1:1,this._filterGlobalUniforms.update()}_findFilterResolution(J){let Q=this._filterStackIndex-1;while(Q>0&&this._filterStack[Q].skip)--Q;return Q>0&&this._filterStack[Q].inputTexture?this._filterStack[Q].inputTexture.source._resolution:J}_findPreviousFilterOffset(){let J=0,Q=0,$=this._filterStackIndex;while($>0){$--;let Z=this._filterStack[$];if(!Z.skip){J=Z.bounds.minX,Q=Z.bounds.minY;break}}return{x:J,y:Q}}_calculateFilterArea(J,Q){if(J.renderables)KY(J.renderables,Q);else if(J.filterEffect.filterArea)Q.clear(),Q.addRect(J.filterEffect.filterArea),Q.applyMatrix(J.container.worldTransform);else J.container.getFastGlobalBounds(!0,Q);if(J.container){let Z=(J.container.renderGroup||J.container.parentRenderGroup).cacheToLocalTransform;if(Z)Q.applyMatrix(Z)}}_applyFiltersToTexture(J,Q){let{inputTexture:$,bounds:Z,filters:K,firstEnabledIndex:W,lastEnabledIndex:X}=J;if(this._globalFilterBindGroup.setResource($.source.style,2),this._globalFilterBindGroup.setResource(J.backTexture.source,3),W===X)K[W].apply(this,$,J.outputRenderSurface,Q);else{let H=J.inputTexture,q=g8.getOptimalTexture(Z.width,Z.height,H.source._resolution,!1),N=q;for(let Y=W;Y<X;Y++){let U=K[Y];if(!U.enabled)continue;U.apply(this,H,N,!0);let V=H;H=N,N=V}K[X].apply(this,H,J.outputRenderSurface,Q),g8.returnTexture(q)}}_calculateFilterBounds(J,Q,$,Z,K){let W=this.renderer,X=J.bounds,H=J.filters,q=1/0,N=0,Y=!0,U=!1,V=!1,z=!0,D=-1,w=-1;for(let F=0;F<H.length;F++){let O=H[F];if(!O.enabled)continue;if(D===-1)D=F;if(w=F,q=Math.min(q,O.resolution==="inherit"?Z:O.resolution),N+=O.padding,O.antialias==="off")Y=!1;else if(O.antialias==="inherit")Y&&(Y=$);if(!O.clipToViewport)z=!1;if(!(O.compatibleRenderers&W.type)){V=!1;break}if(O.blendRequired&&!(W.backBuffer?.useBackBuffer??!0)){v0("Blend filter requires backBuffer on WebGL renderer to be enabled. Set `useBackBuffer: true` in the renderer options."),V=!1;break}V=!0,U||(U=O.blendRequired)}if(!V){J.skip=!0;return}if(z)X.fitBounds(0,Q.width/Z,0,Q.height/Z);if(X.scale(q).ceil().scale(1/q).pad((N|0)*K),!X.isPositive){J.skip=!0;return}J.antialias=Y,J.resolution=q,J.blendRequired=U,J.firstEnabledIndex=D,J.lastEnabledIndex=w}_popFilterData(){return this._filterStackIndex--,this._filterStack[this._filterStackIndex]}_getPreviousFilterData(){let J,Q=this._filterStackIndex-1;while(Q>0)if(Q--,J=this._filterStack[Q],!J.skip)break;return J}_pushFilterData(){let J=this._filterStack[this._filterStackIndex];if(!J)J=this._filterStack[this._filterStackIndex]=new XY;return this._filterStackIndex++,J}}var G4;var HY=A(()=>{k0();eN();E8();U$();O$();Y7();i8();P9();$J();v6();WY();s8();G4=new ZJ({attributes:{aPosition:{buffer:new Float32Array([0,0,1,0,1,1,0,1]),format:"float32x2",stride:8,offset:0}},indexBuffer:new Uint32Array([0,1,2,0,2,3])});F$.extension={type:[b.WebGLSystem,b.WebGPUSystem],name:"filter"}});var wW=A(()=>{k0();FN();HY();n0.add(F$);n0.add(W$)});var B4={};var qY=A(()=>{j1();v1();oQ();K$();wW()});var R4={};var YY=A(()=>{oQ();K$();wW()});async function VY(J){if(J)return;for(let Q=0;Q<IW.length;Q++){let $=IW[Q];if($.value.test()){await $.value.load();return}}}var IW;var OY=A(()=>{k0();IW=[];n0.handleByNamedList(b.Environment,IW)});function z$(){if(typeof p9==="boolean")return p9;try{p9=Function("param1","param2","param3","return param1[param2] === param3;")({a:"b"},"a","b")===!0}catch(J){p9=!1}return p9}var p9;var LW=()=>{};var _6;var m9=A(()=>{_6=((J)=>{return J[J.NONE=0]="NONE",J[J.COLOR=16384]="COLOR",J[J.STENCIL=1024]="STENCIL",J[J.DEPTH=256]="DEPTH",J[J.COLOR_DEPTH=16640]="COLOR_DEPTH",J[J.COLOR_STENCIL=17408]="COLOR_STENCIL",J[J.DEPTH_STENCIL=1280]="DEPTH_STENCIL",J[J.ALL=17664]="ALL",J})(_6||{})});class d9{constructor(J){this.items=[],this._name=J}emit(J,Q,$,Z,K,W,X,H){let{name:q,items:N}=this;for(let Y=0,U=N.length;Y<U;Y++)N[Y][q](J,Q,$,Z,K,W,X,H);return this}add(J){if(J[this._name])this.remove(J),this.items.push(J);return this}remove(J){let Q=this.items.indexOf(J);if(Q!==-1)this.items.splice(Q,1);return this}contains(J){return this.items.indexOf(J)!==-1}removeAll(){return this.items.length=0,this}destroy(){this.removeAll(),this.items=null,this._name=null}get empty(){return this.items.length===0}get name(){return this._name}}var GW=()=>{};var A4,FY,zY;var DY=A(()=>{A9();OY();o6();LW();W6();F6();_J();m9();GW();O6();A4=["init","destroy","contextChange","resolutionChange","resetState","renderEnd","renderStart","render","update","postrender","prerender"],FY=class J extends _8{constructor(Q){super();this.tick=0,this.uid=i0("renderer"),this.runners=Object.create(null),this.renderPipes=Object.create(null),this._initOptions={},this._systemsHash=Object.create(null),this.type=Q.type,this.name=Q.name,this.config=Q;let $=[...A4,...this.config.runners??[]];this._addRunners(...$),this._unsafeEvalCheck()}async init(Q={}){let $=Q.skipExtensionImports===!0?!0:Q.manageImports===!1;await VY($),this._addSystems(this.config.systems),this._addPipes(this.config.renderPipes,this.config.renderPipeAdaptors);for(let Z in this._systemsHash)Q={...this._systemsHash[Z].constructor.defaultOptions,...Q};Q={...J.defaultOptions,...Q},this._roundPixels=Q.roundPixels?1:0;for(let Z=0;Z<this.runners.init.items.length;Z++)await this.runners.init.items[Z].init(Q);this._initOptions=Q}render(Q,$){this.tick++;let Z=Q;if(Z instanceof R8){if(Z={container:Z},$)u0(Z6,"passing a second argument is deprecated, please use render options instead"),Z.target=$.renderTexture}if(Z.target||(Z.target=this.view.renderTarget),Z.target===this.view.renderTarget)this._lastObjectRendered=Z.container,Z.clearColor??(Z.clearColor=this.background.colorRgba),Z.clear??(Z.clear=this.background.clearBeforeRender);if(Z.clearColor){let K=Array.isArray(Z.clearColor)&&Z.clearColor.length===4;Z.clearColor=K?Z.clearColor:G6.shared.setValue(Z.clearColor).toArray()}if(!Z.transform)Z.container.updateLocalTransform(),Z.transform=Z.container.localTransform;if(!Z.container.visible)return;Z.container.enableRenderGroup(),this.runners.prerender.emit(Z),this.runners.renderStart.emit(Z),this.runners.render.emit(Z),this.runners.renderEnd.emit(Z),this.runners.postrender.emit(Z)}resize(Q,$,Z){let K=this.view.resolution;if(this.view.resize(Q,$,Z),this.emit("resize",this.view.screen.width,this.view.screen.height,this.view.resolution),Z!==void 0&&Z!==K)this.runners.resolutionChange.emit(Z)}clear(Q={}){let $=this;Q.target||(Q.target=$.renderTarget.renderTarget),Q.clearColor||(Q.clearColor=this.background.colorRgba),Q.clear??(Q.clear=_6.ALL);let{clear:Z,clearColor:K,target:W,mipLevel:X,layer:H}=Q;G6.shared.setValue(K??this.background.colorRgba),$.renderTarget.clear(W,Z,G6.shared.toArray(),X??0,H??0)}get resolution(){return this.view.resolution}set resolution(Q){this.view.resolution=Q,this.runners.resolutionChange.emit(Q)}get width(){return this.view.texture.frame.width}get height(){return this.view.texture.frame.height}get canvas(){return this.view.canvas}get lastObjectRendered(){return this._lastObjectRendered}get renderingToScreen(){return this.renderTarget.renderingToScreen}get screen(){return this.view.screen}_addRunners(...Q){Q.forEach(($)=>{this.runners[$]=new d9($)})}_addSystems(Q){let $;for($ in Q){let Z=Q[$];this._addSystem(Z.value,Z.name)}}_addSystem(Q,$){let Z=new Q(this);if(this[$])throw Error(`Whoops! The name "${$}" is already in use`);this[$]=Z,this._systemsHash[$]=Z;for(let K in this.runners)this.runners[K].add(Z);return this}_addPipes(Q,$){let Z=$.reduce((K,W)=>{return K[W.name]=W.value,K},{});Q.forEach((K)=>{let{value:W,name:X}=K,H=Z[X];this.renderPipes[X]=new W(this,H?new H:null),this.runners.destroy.add(this.renderPipes[X])})}destroy(Q=!1){if(this.runners.destroy.items.reverse(),this.runners.destroy.emit(Q),Q===!0||typeof Q==="object"&&Q.releaseGlobalResources)i6.release();Object.values(this.runners).forEach(($)=>{$.destroy()}),this._systemsHash=null,this.renderPipes=null}generateTexture(Q){return this.textureGenerator.generateTexture(Q)}get roundPixels(){return!!this._roundPixels}_unsafeEvalCheck(){if(!z$())throw Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}resetState(){this.runners.resetState.emit()}};FY.defaultOptions={resolution:1,failIfMajorPerformanceCaveat:!1,roundPixels:!1};zY=FY});var lJ="8.16.0";var BW=A(()=>{O6()});class kY{static init(){globalThis.__PIXI_APP_INIT__?.(this,lJ)}static destroy(){}}class D${constructor(J){this._renderer=J}init(){globalThis.__PIXI_RENDERER_INIT__?.(this._renderer,lJ)}destroy(){this._renderer=null}}var MY=A(()=>{k0();BW();kY.extension=b.Application;D$.extension={type:[b.WebGLSystem,b.WebGPUSystem],name:"initHook",priority:-10}});class k${constructor(J){if(typeof J==="number")this.rawBinaryData=new ArrayBuffer(J);else if(J instanceof Uint8Array)this.rawBinaryData=J.buffer;else this.rawBinaryData=J;this.uint32View=new Uint32Array(this.rawBinaryData),this.float32View=new Float32Array(this.rawBinaryData),this.size=this.rawBinaryData.byteLength}get int8View(){if(!this._int8View)this._int8View=new Int8Array(this.rawBinaryData);return this._int8View}get uint8View(){if(!this._uint8View)this._uint8View=new Uint8Array(this.rawBinaryData);return this._uint8View}get int16View(){if(!this._int16View)this._int16View=new Int16Array(this.rawBinaryData);return this._int16View}get int32View(){if(!this._int32View)this._int32View=new Int32Array(this.rawBinaryData);return this._int32View}get float64View(){if(!this._float64Array)this._float64Array=new Float64Array(this.rawBinaryData);return this._float64Array}get bigUint64View(){if(!this._bigUint64Array)this._bigUint64Array=new BigUint64Array(this.rawBinaryData);return this._bigUint64Array}view(J){return this[`${J}View`]}destroy(){this.rawBinaryData=null,this.uint32View=null,this.float32View=null,this.uint16View=null,this._int8View=null,this._uint8View=null,this._int16View=null,this._int32View=null,this._float64Array=null,this._bigUint64Array=null}static sizeOf(J){switch(J){case"int8":case"uint8":return 1;case"int16":case"uint16":return 2;case"int32":case"uint32":case"float32":return 4;default:throw Error(`${J} isn't a valid view type`)}}}var wY=()=>{};function RW(J,Q,$,Z){if($??($=0),Z??(Z=Math.min(J.byteLength-$,Q.byteLength)),!($&7)&&!(Z&7)){let K=Z/8;new Float64Array(Q,0,K).set(new Float64Array(J,$,K))}else if(!($&3)&&!(Z&3)){let K=Z/4;new Float32Array(Q,0,K).set(new Float32Array(J,$,K))}else new Uint8Array(Q).set(new Uint8Array(J,$,Z))}var IY=()=>{};var LY,j8;var l9=A(()=>{LY={normal:"normal-npm",add:"add-npm",screen:"screen-npm"},j8=((J)=>{return J[J.DISABLED=0]="DISABLED",J[J.RENDERING_MASK_ADD=1]="RENDERING_MASK_ADD",J[J.MASK_ACTIVE=2]="MASK_ACTIVE",J[J.INVERSE_MASK_ACTIVE=3]="INVERSE_MASK_ACTIVE",J[J.RENDERING_MASK_REMOVE=4]="RENDERING_MASK_REMOVE",J[J.NONE=5]="NONE",J})(j8||{})});function AW(J,Q){if(Q.alphaMode==="no-premultiply-alpha")return LY[J]||J;return J}var GY=A(()=>{l9()});function _4(J){let Q="";for(let $=0;$<J;++$){if($>0)Q+=`
else `;if($<J-1)Q+=`if(test == ${$}.0){}`}return Q}function M$(J,Q){if(J===0)throw Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");let $=Q.createShader(Q.FRAGMENT_SHADER);try{while(!0){let Z=C4.replace(/%forloop%/gi,_4(J));if(Q.shaderSource($,Z),Q.compileShader($),!Q.getShaderParameter($,Q.COMPILE_STATUS))J=J/2|0;else break}}finally{Q.deleteShader($)}return J}var C4;var CW=A(()=>{C4=["precision mediump float;","void main(void){","float test = 0.1;","%forloop%","gl_FragColor = vec4(0.0);","}"].join(`
`)});function BY(){if(cJ)return cJ;let J=q$();return cJ=J.getParameter(J.MAX_TEXTURE_IMAGE_UNITS),cJ=M$(cJ,J),J.getExtension("WEBGL_lose_context")?.loseContext(),cJ}var cJ=null;var RY=A(()=>{UW();CW()});class _W{constructor(){this.ids=Object.create(null),this.textures=[],this.count=0}clear(){for(let J=0;J<this.count;J++){let Q=this.textures[J];this.textures[J]=null,this.ids[Q.uid]=null}this.count=0}}var AY=()=>{};class EY{constructor(){this.renderPipeId="batch",this.action="startBatch",this.start=0,this.size=0,this.textures=new _W,this.blendMode="normal",this.topology="triangle-strip",this.canBundle=!0}destroy(){this.textures=null,this.gpuBindGroup=null,this.bindGroup=null,this.batcher=null,this.elements=null}}function CY(){return w$>0?u9[--w$]:new EY}function _Y(J){J.elements=null,u9[w$++]=J}var u9,w$=0,c9=0,PY=class J{constructor(Q){if(this.uid=i0("batcher"),this.dirty=!0,this.batchIndex=0,this.batches=[],this._elements=[],Q={...J.defaultOptions,...Q},!Q.maxTextures)u0("v8.8.0","maxTextures is a required option for Batcher now, please pass it in the options"),Q.maxTextures=BY();let{maxTextures:$,attributesInitialSize:Z,indicesInitialSize:K}=Q;this.attributeBuffer=new k$(Z*4),this.indexBuffer=new Uint16Array(K),this.maxTextures=$}begin(){this.elementSize=0,this.elementStart=0,this.indexSize=0,this.attributeSize=0;for(let Q=0;Q<this.batchIndex;Q++)_Y(this.batches[Q]);this.batchIndex=0,this._batchIndexStart=0,this._batchIndexSize=0,this.dirty=!0}add(Q){this._elements[this.elementSize++]=Q,Q._indexStart=this.indexSize,Q._attributeStart=this.attributeSize,Q._batcher=this,this.indexSize+=Q.indexSize,this.attributeSize+=Q.attributeSize*this.vertexSize}checkAndUpdateTexture(Q,$){let Z=Q._batch.textures.ids[$._source.uid];if(!Z&&Z!==0)return!1;return Q._textureId=Z,Q.texture=$,!0}updateElement(Q){this.dirty=!0;let $=this.attributeBuffer;if(Q.packAsQuad)this.packQuadAttributes(Q,$.float32View,$.uint32View,Q._attributeStart,Q._textureId);else this.packAttributes(Q,$.float32View,$.uint32View,Q._attributeStart,Q._textureId)}break(Q){let $=this._elements;if(!$[this.elementStart])return;let Z=CY(),K=Z.textures;K.clear();let W=$[this.elementStart],X=AW(W.blendMode,W.texture._source),H=W.topology;if(this.attributeSize*4>this.attributeBuffer.size)this._resizeAttributeBuffer(this.attributeSize*4);if(this.indexSize>this.indexBuffer.length)this._resizeIndexBuffer(this.indexSize);let q=this.attributeBuffer.float32View,N=this.attributeBuffer.uint32View,Y=this.indexBuffer,U=this._batchIndexSize,V=this._batchIndexStart,z="startBatch",D=[],w=this.maxTextures;for(let F=this.elementStart;F<this.elementSize;++F){let O=$[F];$[F]=null;let R=O.texture._source,B=AW(O.blendMode,R),y=X!==B||H!==O.topology;if(R._batchTick===c9&&!y){if(O._textureId=R._textureBindLocation,U+=O.indexSize,O.packAsQuad)this.packQuadAttributes(O,q,N,O._attributeStart,O._textureId),this.packQuadIndex(Y,O._indexStart,O._attributeStart/this.vertexSize);else this.packAttributes(O,q,N,O._attributeStart,O._textureId),this.packIndex(O,Y,O._indexStart,O._attributeStart/this.vertexSize);O._batch=Z,D.push(O);continue}if(R._batchTick=c9,K.count>=w||y)this._finishBatch(Z,V,U-V,K,X,H,Q,z,D),z="renderBatch",V=U,X=B,H=O.topology,Z=CY(),K=Z.textures,K.clear(),D=[],++c9;if(O._textureId=R._textureBindLocation=K.count,K.ids[R.uid]=K.count,K.textures[K.count++]=R,O._batch=Z,D.push(O),U+=O.indexSize,O.packAsQuad)this.packQuadAttributes(O,q,N,O._attributeStart,O._textureId),this.packQuadIndex(Y,O._indexStart,O._attributeStart/this.vertexSize);else this.packAttributes(O,q,N,O._attributeStart,O._textureId),this.packIndex(O,Y,O._indexStart,O._attributeStart/this.vertexSize)}if(K.count>0)this._finishBatch(Z,V,U-V,K,X,H,Q,z,D),V=U,++c9;this.elementStart=this.elementSize,this._batchIndexStart=V,this._batchIndexSize=U}_finishBatch(Q,$,Z,K,W,X,H,q,N){Q.gpuBindGroup=null,Q.bindGroup=null,Q.action=q,Q.batcher=this,Q.textures=K,Q.blendMode=W,Q.topology=X,Q.start=$,Q.size=Z,Q.elements=N,++c9,this.batches[this.batchIndex++]=Q,H.add(Q)}finish(Q){this.break(Q)}ensureAttributeBuffer(Q){if(Q*4<=this.attributeBuffer.size)return;this._resizeAttributeBuffer(Q*4)}ensureIndexBuffer(Q){if(Q<=this.indexBuffer.length)return;this._resizeIndexBuffer(Q)}_resizeAttributeBuffer(Q){let $=Math.max(Q,this.attributeBuffer.size*2),Z=new k$($);RW(this.attributeBuffer.rawBinaryData,Z.rawBinaryData),this.attributeBuffer=Z}_resizeIndexBuffer(Q){let $=this.indexBuffer,Z=Math.max(Q,$.length*1.5);Z+=Z%2;let K=Z>65535?new Uint32Array(Z):new Uint16Array(Z);if(K.BYTES_PER_ELEMENT!==$.BYTES_PER_ELEMENT)for(let W=0;W<$.length;W++)K[W]=$[W];else RW($.buffer,K.buffer);this.indexBuffer=K}packQuadIndex(Q,$,Z){Q[$]=Z+0,Q[$+1]=Z+1,Q[$+2]=Z+2,Q[$+3]=Z+0,Q[$+4]=Z+2,Q[$+5]=Z+3}packIndex(Q,$,Z,K){let{indices:W,indexSize:X,indexOffset:H,attributeOffset:q}=Q;for(let N=0;N<X;N++)$[Z++]=K+W[N+H]-q}destroy(Q={}){if(this.batches===null)return;for(let $=0;$<this.batchIndex;$++)_Y(this.batches[$]);if(this.batches=null,this.geometry.destroy(!0),this.geometry=null,Q.shader)this.shader?.destroy(),this.shader=null;for(let $=0;$<this._elements.length;$++)if(this._elements[$])this._elements[$]._batch=null;this._elements=null,this.indexBuffer=null,this.attributeBuffer.destroy(),this.attributeBuffer=null}},jY;var SY=A(()=>{W6();wY();F6();_J();IY();GY();RY();AY();u9=[];i6.register({clear:()=>{if(u9.length>0){for(let J of u9)if(J)J.destroy()}u9.length=0,w$=0}});PY.defaultOptions={maxTextures:null,attributesInitialSize:4,indicesInitialSize:6};jY=PY});var E4,P4,EW;var TY=A(()=>{g9();dJ();O$();E4=new Float32Array(1),P4=new Uint32Array(1);EW=class EW extends ZJ{constructor(){let Q=new C6({data:E4,label:"attribute-batch-buffer",usage:M8.VERTEX|M8.COPY_DST,shrinkToFit:!1}),$=new C6({data:P4,label:"index-batch-buffer",usage:M8.INDEX|M8.COPY_DST,shrinkToFit:!1}),Z=24;super({attributes:{aPosition:{buffer:Q,format:"float32x2",stride:24,offset:0},aUV:{buffer:Q,format:"float32x2",stride:24,offset:8},aColor:{buffer:Q,format:"unorm8x4",stride:24,offset:16},aTextureIdAndRound:{buffer:Q,format:"uint16x2",stride:24,offset:20}},indexBuffer:$})}}});function PW(J,Q,$){if(J)for(let Z in J){let K=Z.toLocaleLowerCase(),W=Q[K];if(W){let X=J[Z];if(Z==="header")X=X.replace(/@in\s+[^;]+;\s*/g,"").replace(/@out\s+[^;]+;\s*/g,"");if($)W.push(`//----${$}----//`);W.push(X)}else v0(`${Z} placement hook does not exist in shader`)}}var yY=A(()=>{s8()});function jW(J){let Q={};return(J.match(j4)?.map((Z)=>Z.replace(/[{()}]/g,""))??[]).forEach((Z)=>{Q[Z]=[]}),Q}var j4;var bY=A(()=>{j4=/\{\{(.*?)\}\}/g});function vY(J,Q){let $,Z=/@in\s+([^;]+);/g;while(($=Z.exec(J))!==null)Q.push($[1])}function SW(J,Q,$=!1){let Z=[];vY(Q,Z),J.forEach((H)=>{if(H.header)vY(H.header,Z)});let K=Z;if($)K.sort();let W=K.map((H,q)=>`       @location(${q}) ${H},`).join(`
`),X=Q.replace(/@in\s+[^;]+;\s*/g,"");return X=X.replace("{{in}}",`
${W}
`),X}var fY=()=>{};function hY(J,Q){let $,Z=/@out\s+([^;]+);/g;while(($=Z.exec(J))!==null)Q.push($[1])}function S4(J){let $=/\b(\w+)\s*:/g.exec(J);return $?$[1]:""}function T4(J){let Q=/@.*?\s+/g;return J.replace(Q,"")}function xY(J,Q){let $=[];hY(Q,$),J.forEach((q)=>{if(q.header)hY(q.header,$)});let Z=0,K=$.sort().map((q)=>{if(q.indexOf("builtin")>-1)return q;return`@location(${Z++}) ${q}`}).join(`,
`),W=$.sort().map((q)=>`       var ${T4(q)};`).join(`
`),X=`return VSOutput(
            ${$.sort().map((q)=>` ${S4(q)}`).join(`,
`)});`,H=Q.replace(/@out\s+[^;]+;\s*/g,"");return H=H.replace("{{struct}}",`
${K}
`),H=H.replace("{{start}}",`
${W}
`),H=H.replace("{{return}}",`
${X}
`),H}var gY=()=>{};function TW(J,Q){let $=J;for(let Z in Q){let K=Q[Z];if(K.join(`
`).length)$=$.replace(`{{${Z}}}`,`//-----${Z} START-----//
${K.join(`
`)}
//----${Z} FINISH----//`);else $=$.replace(`{{${Z}}}`,"")}return $}var pY=()=>{};function mY({template:J,bits:Q}){let $=lY(J,Q);if(y7[$])return y7[$];let{vertex:Z,fragment:K}=b4(J,Q);return y7[$]=cY(Z,K,Q),y7[$]}function dY({template:J,bits:Q}){let $=lY(J,Q);if(y7[$])return y7[$];return y7[$]=cY(J.vertex,J.fragment,Q),y7[$]}function b4(J,Q){let $=Q.map((X)=>X.vertex).filter((X)=>!!X),Z=Q.map((X)=>X.fragment).filter((X)=>!!X),K=SW($,J.vertex,!0);K=xY($,K);let W=SW(Z,J.fragment,!0);return{vertex:K,fragment:W}}function lY(J,Q){return Q.map(($)=>{if(!yW.has($))yW.set($,y4++);return yW.get($)}).sort(($,Z)=>$-Z).join("-")+J.vertex+J.fragment}function cY(J,Q,$){let Z=jW(J),K=jW(Q);return $.forEach((W)=>{PW(W.vertex,Z,W.name),PW(W.fragment,K,W.name)}),{vertex:TW(J,Z),fragment:TW(Q,K)}}var y7,yW,y4=0;var uY=A(()=>{yY();bY();fY();gY();pY();y7=Object.create(null),yW=new Map});var sY=`
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}

        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);

        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`,nY=`
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;

    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {

        {{start}}

        var outColor:vec4<f32>;

        {{main}}

        var finalColor:vec4<f32> = outColor * vColor;

        {{end}}

        return finalColor;
      };
`,iY=`
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;

        {{start}}

        vColor = vec4(1.);

        {{main}}

        vUV = uv;

        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`,oY=`

    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {

        {{start}}

        vec4 outColor;

        {{main}}

        finalColor = outColor * vColor;

        {{end}}
    }
`;var aY=()=>{};var rY,tY;var eY=A(()=>{rY={name:"global-uniforms-bit",vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}},tY={name:"global-uniforms-bit",vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}}});function JU({bits:J,name:Q}){let $=mY({template:{fragment:nY,vertex:sY},bits:[rY,...J]});return R6.from({name:Q,vertex:{source:$.vertex,entryPoint:"main"},fragment:{source:$.fragment,entryPoint:"main"}})}function uJ({bits:J,name:Q}){return new B6({name:Q,...dY({template:{vertex:iY,fragment:oY},bits:[tY,...J]})})}var I$=A(()=>{QJ();gJ();uY();aY();eY()});var QU,L$;var bW=A(()=>{QU={name:"color-bit",vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},L$={name:"color-bit",vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}}});function v4(J){let Q=[];if(J===1)Q.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;"),Q.push("@group(1) @binding(1) var textureSampler1: sampler;");else{let $=0;for(let Z=0;Z<J;Z++)Q.push(`@group(1) @binding(${$++}) var textureSource${Z+1}: texture_2d<f32>;`),Q.push(`@group(1) @binding(${$++}) var textureSampler${Z+1}: sampler;`)}return Q.join(`
`)}function f4(J){let Q=[];if(J===1)Q.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");else{Q.push("switch vTextureId {");for(let $=0;$<J;$++){if($===J-1)Q.push("  default:{");else Q.push(`  case ${$}:{`);Q.push(`      outColor = textureSampleGrad(textureSource${$+1}, textureSampler${$+1}, vUV, uvDx, uvDy);`),Q.push("      break;}")}Q.push("}")}return Q.join(`
`)}function $U(J){if(!vW[J])vW[J]={name:"texture-batch-bit",vertex:{header:`
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `},fragment:{header:`
                @in @interpolate(flat) vTextureId: u32;

                ${v4(J)}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${f4(J)}
            `}};return vW[J]}function h4(J){let Q=[];for(let $=0;$<J;$++){if($>0)Q.push("else");if($<J-1)Q.push(`if(vTextureId < ${$}.5)`);Q.push("{"),Q.push(`	outColor = texture(uTextures[${$}], vUV);`),Q.push("}")}return Q.join(`
`)}function G$(J){if(!fW[J])fW[J]={name:"texture-batch-bit",vertex:{header:`
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `},fragment:{header:`
                in float vTextureId;

                uniform sampler2D uTextures[${J}];

            `,main:`

                ${h4(J)}
            `}};return fW[J]}var vW,fW;var hW=A(()=>{vW={};fW={}});var ZU,sJ;var B$=A(()=>{ZU={name:"round-pixels-bit",vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},sJ={name:"round-pixels-bit",vertex:{header:`
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}}});function R$(J){let Q=KU[J];if(Q)return Q;let $=new Int32Array(J);for(let Z=0;Z<J;Z++)$[Z]=Z;return Q=KU[J]=new o8({uTextures:{value:$,type:"i32",size:J}},{isStatic:!0}),Q}var KU;var xW=A(()=>{Y7();KU={}});var A$;var WU=A(()=>{I$();bW();hW();B$();xW();pJ();A$=class A$ extends A6{constructor(J){let Q=uJ({name:"batch",bits:[L$,G$(J),sJ]}),$=JU({name:"batch",bits:[QU,$U(J),ZU]});super({glProgram:Q,gpuProgram:$,resources:{batchSamplers:R$(J)}});this.maxTextures=J}}});var s9=null,XU,gW;var HU=A(()=>{k0();SY();TY();WU();XU=class J extends jY{constructor(Q){super(Q);this.geometry=new EW,this.name=J.extension.name,this.vertexSize=6,s9??(s9=new A$(Q.maxTextures)),this.shader=s9}packAttributes(Q,$,Z,K,W){let X=W<<16|Q.roundPixels&65535,H=Q.transform,q=H.a,N=H.b,Y=H.c,U=H.d,V=H.tx,z=H.ty,{positions:D,uvs:w}=Q,F=Q.color,O=Q.attributeOffset,G=O+Q.attributeSize;for(let R=O;R<G;R++){let B=R*2,y=D[B],C=D[B+1];$[K++]=q*y+Y*C+V,$[K++]=U*C+N*y+z,$[K++]=w[B],$[K++]=w[B+1],Z[K++]=F,Z[K++]=X}}packQuadAttributes(Q,$,Z,K,W){let{texture:X,transform:H}=Q,q=H.a,N=H.b,Y=H.c,U=H.d,V=H.tx,z=H.ty,D=Q.bounds,w=D.maxX,F=D.minX,O=D.maxY,G=D.minY,R=X.uvs,B=Q.color,y=W<<16|Q.roundPixels&65535;$[K+0]=q*F+Y*G+V,$[K+1]=U*G+N*F+z,$[K+2]=R.x0,$[K+3]=R.y0,Z[K+4]=B,Z[K+5]=y,$[K+6]=q*w+Y*G+V,$[K+7]=U*G+N*w+z,$[K+8]=R.x1,$[K+9]=R.y1,Z[K+10]=B,Z[K+11]=y,$[K+12]=q*w+Y*O+V,$[K+13]=U*O+N*w+z,$[K+14]=R.x2,$[K+15]=R.y2,Z[K+16]=B,Z[K+17]=y,$[K+18]=q*F+Y*O+V,$[K+19]=U*O+N*F+z,$[K+20]=R.x3,$[K+21]=R.y3,Z[K+22]=B,Z[K+23]=y}_updateMaxTextures(Q){if(this.shader.maxTextures===Q)return;s9=new A$(Q),this.shader=s9}destroy(){this.shader=null,super.destroy()}};XU.extension={type:[b.Batcher],name:"default"};gW=XU});class KJ{constructor(J){this.items=Object.create(null);let{renderer:Q,type:$,onUnload:Z,priority:K,name:W}=J;this._renderer=Q,Q.gc.addResourceHash(this,"items",$,K??0),this._onUnload=Z,this.name=W}add(J){if(this.items[J.uid])return!1;return this.items[J.uid]=J,J.once("unload",this.remove,this),J._gcLastUsed=this._renderer.gc.now,!0}remove(J,...Q){if(!this.items[J.uid])return;let $=J._gpuData[this._renderer.uid];if(!$)return;this._onUnload?.(J,...Q),$.destroy(),J._gpuData[this._renderer.uid]=null,this.items[J.uid]=null}removeAll(...J){Object.values(this.items).forEach((Q)=>Q&&this.remove(Q,...J))}destroy(...J){this.removeAll(...J),this.items=Object.create(null),this._renderer=null,this._onUnload=null}}var C$=()=>{};var qU=`in vec2 vMaskCoord;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;

uniform float uAlpha;
uniform vec4 uMaskClamp;
uniform float uInverse;

out vec4 finalColor;

void main(void)
{
    float clip = step(3.5,
        step(uMaskClamp.x, vMaskCoord.x) +
        step(uMaskClamp.y, vMaskCoord.y) +
        step(vMaskCoord.x, uMaskClamp.z) +
        step(vMaskCoord.y, uMaskClamp.w));

    // TODO look into why this is needed
    float npmAlpha = uAlpha;
    vec4 original = texture(uTexture, vTextureCoord);
    vec4 masky = texture(uMaskTexture, vMaskCoord);
    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);

    float a = alphaMul * masky.r * npmAlpha * clip;

    if (uInverse == 1.0) {
        a = 1.0 - a;
    }

    finalColor = original * a;
}
`;var NU=()=>{};var YU=`in vec2 aPosition;

out vec2 vTextureCoord;
out vec2 vMaskCoord;


uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
uniform mat3 uFilterMatrix;

vec4 filterVertexPosition(  vec2 aPosition )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
       
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(  vec2 aPosition )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

vec2 getFilterCoord( vec2 aPosition )
{
    return  ( uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}   

void main(void)
{
    gl_Position = filterVertexPosition(aPosition);
    vTextureCoord = filterTextureCoord(aPosition);
    vMaskCoord = getFilterCoord(aPosition);
}
`;var UU=()=>{};var pW=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct MaskUniforms {
  uFilterMatrix:mat3x3<f32>,
  uMaskClamp:vec4<f32>,
  uAlpha:f32,
  uInverse:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> filterUniforms : MaskUniforms;
@group(1) @binding(1) var uMaskTexture: texture_2d<f32>;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) filterUv : vec2<f32>,
};

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);
}

fn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>
{
  return ( filterUniforms.uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}

fn getSize() -> vec2<f32>
{
  return gfu.uGlobalFrame.zw;
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
   getFilterCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) filterUv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var maskClamp = filterUniforms.uMaskClamp;
    var uAlpha = filterUniforms.uAlpha;

    var clip = step(3.5,
      step(maskClamp.x, filterUv.x) +
      step(maskClamp.y, filterUv.y) +
      step(filterUv.x, maskClamp.z) +
      step(filterUv.y, maskClamp.w));

    var mask = textureSample(uMaskTexture, uSampler, filterUv);
    var source = textureSample(uTexture, uSampler, uv);
    var alphaMul = 1.0 - uAlpha * (1.0 - mask.a);

    var a: f32 = alphaMul * mask.r * uAlpha * clip;

    if (filterUniforms.uInverse == 1.0) {
        a = 1.0 - a;
    }

    return source * a;
}
`;var VU=()=>{};var mW;var OU=A(()=>{E8();QJ();gJ();Y7();hK();zW();NU();UU();VU();mW=class mW extends V${constructor(J){let{sprite:Q,...$}=J,Z=new E9(Q.texture),K=new o8({uFilterMatrix:{value:new R0,type:"mat3x3<f32>"},uMaskClamp:{value:Z.uClampFrame,type:"vec4<f32>"},uAlpha:{value:1,type:"f32"},uInverse:{value:J.inverse?1:0,type:"f32"}}),W=R6.from({vertex:{source:pW,entryPoint:"mainVertex"},fragment:{source:pW,entryPoint:"mainFragment"}}),X=B6.from({vertex:YU,fragment:qU,name:"mask-filter"});super({...$,gpuProgram:W,glProgram:X,clipToViewport:!1,resources:{filterUniforms:K,uMaskTexture:Q.texture.source}});this.sprite=Q,this._textureMatrix=Z}set inverse(J){this.resources.filterUniforms.uniforms.uInverse=J?1:0}get inverse(){return this.resources.filterUniforms.uniforms.uInverse===1}apply(J,Q,$,Z){this._textureMatrix.texture=this.sprite.texture,J.calculateSpriteMatrix(this.resources.filterUniforms.uniforms.uFilterMatrix,this.sprite).prepend(this._textureMatrix.mapCoord),this.resources.uMaskTexture=this.sprite.texture.source,J.applyFilter(this,Q,$,Z)}}});function FU(J,Q,$){let Z=(J>>24&255)/255;Q[$++]=(J&255)/255*Z,Q[$++]=(J>>8&255)/255*Z,Q[$++]=(J>>16&255)/255*Z,Q[$++]=Z}var zU=()=>{};var dW,wS,_$;var lW=A(()=>{dW={name:"local-uniform-bit",vertex:{header:`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `}},wS={...dW,vertex:{...dW.vertex,header:dW.vertex.header.replace("group(1)","group(2)")}},_$={name:"local-uniform-bit",vertex:{header:`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `}}});class n9{constructor(){this.batcherName="default",this.topology="triangle-list",this.attributeSize=4,this.indexSize=6,this.packAsQuad=!0,this.roundPixels=0,this._attributeStart=0,this._batcher=null,this._batch=null}get blendMode(){return this.renderable.groupBlendMode}get color(){return this.renderable.groupColorAlpha}reset(){this.renderable=null,this.texture=null,this._batcher=null,this._batch=null,this.bounds=null}destroy(){this.reset()}}var cW=()=>{};function DU(){let{userAgent:J}=F8.get().getNavigator();return/^((?!chrome|android).)*safari/i.test(J)}var kU=A(()=>{D6()});class E${constructor(){this._tempState=a6.for2d(),this._didUploadHash={}}init(J){J.renderer.runners.contextChange.add(this)}contextChange(){this._didUploadHash={}}start(J,Q,$){let Z=J.renderer,K=this._didUploadHash[$.uid];if(Z.shader.bind($,K),!K)this._didUploadHash[$.uid]=!0;Z.shader.updateUniformGroup(Z.globalUniforms.uniformGroup),Z.geometry.bind(Q,$.glProgram)}execute(J,Q){let $=J.renderer;this._tempState.blendMode=Q.blendMode,$.state.set(this._tempState);let Z=Q.textures.textures;for(let K=0;K<Q.textures.count;K++)$.texture.bind(Z[K],K);$.geometry.draw(Q.topology,Q.size,Q.start)}}var MU=A(()=>{k0();mJ();E$.extension={type:[b.WebGLPipesAdaptor],name:"batch"}});var uW=class J{constructor(Q,$){this.state=a6.for2d(),this._batchersByInstructionSet=Object.create(null),this._activeBatches=Object.create(null),this.renderer=Q,this._adaptor=$,this._adaptor.init?.(this)}static getBatcher(Q){return new this._availableBatchers[Q]}buildStart(Q){let $=this._batchersByInstructionSet[Q.uid];if(!$)$=this._batchersByInstructionSet[Q.uid]=Object.create(null),$.default||($.default=new gW({maxTextures:this.renderer.limits.maxBatchableTextures}));this._activeBatches=$,this._activeBatch=this._activeBatches.default;for(let Z in this._activeBatches)this._activeBatches[Z].begin()}addToBatch(Q,$){if(this._activeBatch.name!==Q.batcherName){this._activeBatch.break($);let Z=this._activeBatches[Q.batcherName];if(!Z)Z=this._activeBatches[Q.batcherName]=J.getBatcher(Q.batcherName),Z.begin();this._activeBatch=Z}this._activeBatch.add(Q)}break(Q){this._activeBatch.break(Q)}buildEnd(Q){this._activeBatch.break(Q);let $=this._activeBatches;for(let Z in $){let K=$[Z],W=K.geometry;W.indexBuffer.setDataWithSize(K.indexBuffer,K.indexSize,!0),W.buffers[0].setDataWithSize(K.attributeBuffer.float32View,K.attributeSize,!1)}}upload(Q){let $=this._batchersByInstructionSet[Q.uid];for(let Z in $){let K=$[Z],W=K.geometry;if(K.dirty)K.dirty=!1,W.buffers[0].update(K.attributeSize*4)}}execute(Q){if(Q.action==="startBatch"){let $=Q.batcher,Z=$.geometry,K=$.shader;this._adaptor.start(this,Z,K)}this._adaptor.execute(this,Q)}destroy(){this.state=null,this.renderer=null,this._adaptor=null;for(let Q in this._activeBatches)this._activeBatches[Q].destroy();this._activeBatches=null}},sW;var wU=A(()=>{k0();mJ();HU();uW.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"batch"};uW._availableBatchers=Object.create(null);sW=uW;n0.handleByMap(b.Batcher,sW._availableBatchers);n0.add(gW)});var IU;var LU=A(()=>{IU={name:"texture-bit",vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;


        `,main:`
            outColor = texture(uTexture, vUV);
        `}}});class P${constructor(J){this._activeMaskStage=[],this._renderer=J}push(J,Q,$){let Z=this._renderer;if(Z.renderPipes.batch.break($),$.add({renderPipeId:"alphaMask",action:"pushMaskBegin",mask:J,inverse:Q._maskOptions.inverse,canBundle:!1,maskedContainer:Q}),J.inverse=Q._maskOptions.inverse,J.renderMaskToTexture){let K=J.mask;K.includeInBuild=!0,K.collectRenderables($,Z,null),K.includeInBuild=!1}Z.renderPipes.batch.break($),$.add({renderPipeId:"alphaMask",action:"pushMaskEnd",mask:J,maskedContainer:Q,inverse:Q._maskOptions.inverse,canBundle:!1})}pop(J,Q,$){this._renderer.renderPipes.batch.break($),$.add({renderPipeId:"alphaMask",action:"popMaskEnd",mask:J,inverse:Q._maskOptions.inverse,canBundle:!1})}execute(J){let Q=this._renderer,$=J.mask.renderMaskToTexture;if(J.action==="pushMaskBegin"){let Z=n8.get(GU);if(Z.inverse=J.inverse,$){J.mask.mask.measurable=!0;let K=PJ(J.mask.mask,!0,x4);J.mask.mask.measurable=!1,K.ceil();let W=Q.renderTarget.renderTarget.colorTexture.source,X=g8.getOptimalTexture(K.width,K.height,W._resolution,W.antialias);Q.renderTarget.push(X,!0),Q.globalUniforms.push({offset:K,worldColor:4294967295});let H=Z.sprite;H.texture=X,H.worldTransform.tx=K.minX,H.worldTransform.ty=K.minY,this._activeMaskStage.push({filterEffect:Z,maskedContainer:J.maskedContainer,filterTexture:X})}else Z.sprite=J.mask.mask,this._activeMaskStage.push({filterEffect:Z,maskedContainer:J.maskedContainer})}else if(J.action==="pushMaskEnd"){let Z=this._activeMaskStage[this._activeMaskStage.length-1];if($){if(Q.type===q6.WEBGL)Q.renderTarget.finishRenderPass();Q.renderTarget.pop(),Q.globalUniforms.pop()}Q.filter.push({renderPipeId:"filter",action:"pushFilter",container:Z.maskedContainer,filterEffect:Z.filterEffect,canBundle:!1})}else if(J.action==="popMaskEnd"){Q.filter.pop();let Z=this._activeMaskStage.pop();if($)g8.returnTexture(Z.filterTexture);n8.return(Z.filterEffect)}}destroy(){this._renderer=null,this._activeMaskStage=null}}var x4,GU;var BU=A(()=>{k0();bQ();OU();v6();C9();aQ();EJ();i8();P9();$J();x4=new B8;GU=class GU extends C7{constructor(){super();this.filters=[new mW({sprite:new x6(P0.EMPTY),inverse:!1,resolution:"inherit",antialias:"inherit"})]}get sprite(){return this.filters[0].sprite}set sprite(J){this.filters[0].sprite=J}get inverse(){return this.filters[0].inverse}set inverse(J){this.filters[0].inverse=J}};P$.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"alphaMask"}});class j${constructor(J){this._colorStack=[],this._colorStackIndex=0,this._currentColor=0,this._renderer=J}buildStart(){this._colorStack[0]=15,this._colorStackIndex=1,this._currentColor=15}push(J,Q,$){this._renderer.renderPipes.batch.break($);let K=this._colorStack;K[this._colorStackIndex]=K[this._colorStackIndex-1]&J.mask;let W=this._colorStack[this._colorStackIndex];if(W!==this._currentColor)this._currentColor=W,$.add({renderPipeId:"colorMask",colorMask:W,canBundle:!1});this._colorStackIndex++}pop(J,Q,$){this._renderer.renderPipes.batch.break($);let K=this._colorStack;this._colorStackIndex--;let W=K[this._colorStackIndex-1];if(W!==this._currentColor)this._currentColor=W,$.add({renderPipeId:"colorMask",colorMask:W,canBundle:!1})}execute(J){this._renderer.colorMask.setMask(J.colorMask)}destroy(){this._renderer=null,this._colorStack=null}}var RU=A(()=>{k0();j$.extension={type:[b.WebGLPipes,b.WebGPUPipes],name:"colorMask"}});class S${constructor(J){this._maskStackHash={},this._maskHash=new WeakMap,this._renderer=J}push(J,Q,$){var Z;let K=J,W=this._renderer;W.renderPipes.batch.break($),W.renderPipes.blendMode.setBlendMode(K.mask,"none",$),$.add({renderPipeId:"stencilMask",action:"pushMaskBegin",mask:J,inverse:Q._maskOptions.inverse,canBundle:!1});let X=K.mask;if(X.includeInBuild=!0,!this._maskHash.has(K))this._maskHash.set(K,{instructionsStart:0,instructionsLength:0});let H=this._maskHash.get(K);H.instructionsStart=$.instructionSize,X.collectRenderables($,W,null),X.includeInBuild=!1,W.renderPipes.batch.break($),$.add({renderPipeId:"stencilMask",action:"pushMaskEnd",mask:J,inverse:Q._maskOptions.inverse,canBundle:!1});let q=$.instructionSize-H.instructionsStart-1;H.instructionsLength=q;let N=W.renderTarget.renderTarget.uid;(Z=this._maskStackHash)[N]??(Z[N]=0)}pop(J,Q,$){let Z=J,K=this._renderer;K.renderPipes.batch.break($),K.renderPipes.blendMode.setBlendMode(Z.mask,"none",$),$.add({renderPipeId:"stencilMask",action:"popMaskBegin",inverse:Q._maskOptions.inverse,canBundle:!1});let W=this._maskHash.get(J);for(let X=0;X<W.instructionsLength;X++)$.instructions[$.instructionSize++]=$.instructions[W.instructionsStart++];$.add({renderPipeId:"stencilMask",action:"popMaskEnd",canBundle:!1})}execute(J){var Q;let $=this._renderer,Z=$,K=$.renderTarget.renderTarget.uid,W=(Q=this._maskStackHash)[K]??(Q[K]=0);if(J.action==="pushMaskBegin")Z.renderTarget.ensureDepthStencil(),Z.stencil.setStencilMode(j8.RENDERING_MASK_ADD,W),W++,Z.colorMask.setMask(0);else if(J.action==="pushMaskEnd"){if(J.inverse)Z.stencil.setStencilMode(j8.INVERSE_MASK_ACTIVE,W);else Z.stencil.setStencilMode(j8.MASK_ACTIVE,W);Z.colorMask.setMask(15)}else if(J.action==="popMaskBegin"){if(Z.colorMask.setMask(0),W!==0)Z.stencil.setStencilMode(j8.RENDERING_MASK_REMOVE,W);else Z.renderTarget.clear(null,_6.STENCIL),Z.stencil.setStencilMode(j8.DISABLED,W);W--}else if(J.action==="popMaskEnd"){if(J.inverse)Z.stencil.setStencilMode(j8.INVERSE_MASK_ACTIVE,W);else Z.stencil.setStencilMode(j8.MASK_ACTIVE,W);Z.colorMask.setMask(15)}this._maskStackHash[K]=W}destroy(){this._renderer=null,this._maskStackHash=null,this._maskHash=null}}var AU=A(()=>{k0();m9();l9();S$.extension={type:[b.WebGLPipes,b.WebGPUPipes],name:"stencilMask"}});class T${constructor(J){this._renderer=J}updateRenderable(){}destroyRenderable(){}validateRenderable(){return!1}addRenderable(J,Q){this._renderer.renderPipes.batch.break(Q),Q.add(J)}execute(J){if(!J.isRenderable)return;J.render(this._renderer)}destroy(){this._renderer=null}}var CU=A(()=>{k0();T$.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"customRender"}});function i9(J,Q){let $=J.instructionSet,Z=$.instructions;for(let K=0;K<$.instructionSize;K++){let W=Z[K];Q[W.renderPipeId].execute(W)}}var nW=()=>{};class y${constructor(J){this._renderer=J}addRenderGroup(J,Q){if(J.isCachedAsTexture)this._addRenderableCacheAsTexture(J,Q);else this._addRenderableDirect(J,Q)}execute(J){if(!J.isRenderable)return;if(J.isCachedAsTexture)this._executeCacheAsTexture(J);else this._executeDirect(J)}destroy(){this._renderer=null}_addRenderableDirect(J,Q){if(this._renderer.renderPipes.batch.break(Q),J._batchableRenderGroup)n8.return(J._batchableRenderGroup),J._batchableRenderGroup=null;Q.add(J)}_addRenderableCacheAsTexture(J,Q){let $=J._batchableRenderGroup??(J._batchableRenderGroup=n8.get(n9));$.renderable=J.root,$.transform=J.root.relativeGroupTransform,$.texture=J.texture,$.bounds=J._textureBounds,Q.add(J),this._renderer.renderPipes.blendMode.pushBlendMode(J,J.root.groupBlendMode,Q),this._renderer.renderPipes.batch.addToBatch($,Q),this._renderer.renderPipes.blendMode.popBlendMode(Q)}_executeCacheAsTexture(J){if(J.textureNeedsUpdate){J.textureNeedsUpdate=!1;let Q=new R0().translate(-J._textureBounds.x,-J._textureBounds.y);this._renderer.renderTarget.push(J.texture,!0,null,J.texture.frame),this._renderer.globalUniforms.push({worldTransformMatrix:Q,worldColor:4294967295,offset:{x:0,y:0}}),i9(J,this._renderer.renderPipes),this._renderer.renderTarget.finishRenderPass(),this._renderer.renderTarget.pop(),this._renderer.globalUniforms.pop()}J._batchableRenderGroup._batcher.updateElement(J._batchableRenderGroup),J._batchableRenderGroup._batcher.geometry.buffers[0].update()}_executeDirect(J){this._renderer.globalUniforms.push({worldTransformMatrix:J.inverseParentTextureTransform,worldColor:J.worldColorAlpha}),i9(J,this._renderer.renderPipes),this._renderer.globalUniforms.pop()}}var _U=A(()=>{k0();E8();EJ();cW();nW();y$.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"renderGroup"}});class b${constructor(J){this._renderer=J}addRenderable(J,Q){let $=this._getGpuSprite(J);if(J.didViewUpdate)this._updateBatchableSprite(J,$);this._renderer.renderPipes.batch.addToBatch($,Q)}updateRenderable(J){let Q=this._getGpuSprite(J);if(J.didViewUpdate)this._updateBatchableSprite(J,Q);Q._batcher.updateElement(Q)}validateRenderable(J){let Q=this._getGpuSprite(J);return!Q._batcher.checkAndUpdateTexture(Q,J._texture)}_updateBatchableSprite(J,Q){Q.bounds=J.visualBounds,Q.texture=J._texture}_getGpuSprite(J){return J._gpuData[this._renderer.uid]||this._initGPUSprite(J)}_initGPUSprite(J){let Q=new n9;return Q.renderable=J,Q.transform=J.groupTransform,Q.texture=J._texture,Q.bounds=J.visualBounds,Q.roundPixels=this._renderer._roundPixels|J._roundPixels,J._gpuData[this._renderer.uid]=Q,Q}destroy(){this._renderer=null}}var EU=A(()=>{k0();cW();b$.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"sprite"}});class v${constructor(J){this._blendModeStack=[],this._isAdvanced=!1,this._filterHash=Object.create(null),this._renderer=J,this._renderer.runners.prerender.add(this)}prerender(){this._activeBlendMode="normal",this._isAdvanced=!1}pushBlendMode(J,Q,$){this._blendModeStack.push(Q),this.setBlendMode(J,Q,$)}popBlendMode(J){this._blendModeStack.pop();let Q=this._blendModeStack[this._activeBlendMode.length-1]??"normal";this.setBlendMode(null,Q,J)}setBlendMode(J,Q,$){let Z=J instanceof bJ;if(this._activeBlendMode===Q){if(this._isAdvanced&&J&&!Z)this._renderableList?.push(J);return}if(this._isAdvanced)this._endAdvancedBlendMode($);if(this._activeBlendMode=Q,!J)return;if(this._isAdvanced=!!o9[Q],this._isAdvanced)this._beginAdvancedBlendMode(J,$)}_beginAdvancedBlendMode(J,Q){this._renderer.renderPipes.batch.break(Q);let $=this._activeBlendMode;if(!o9[$]){v0(`Unable to assign BlendMode: '${$}'. You may want to include: import 'pixi.js/advanced-blend-modes'`);return}let Z=this._ensureFilterEffect($),K=J instanceof bJ,W={renderPipeId:"filter",action:"pushFilter",filterEffect:Z,renderables:K?null:[J],container:K?J.root:null,canBundle:!1};this._renderableList=W.renderables,Q.add(W)}_ensureFilterEffect(J){let Q=this._filterHash[J];if(!Q)Q=this._filterHash[J]=new C7,Q.filters=[new o9[J]];return Q}_endAdvancedBlendMode(J){this._isAdvanced=!1,this._renderableList=null,this._renderer.renderPipes.batch.break(J),J.add({renderPipeId:"filter",action:"popFilter",canBundle:!1})}buildStart(){this._isAdvanced=!1}buildEnd(J){if(!this._isAdvanced)return;this._endAdvancedBlendMode(J)}destroy(){this._renderer=null,this._renderableList=null;for(let J in this._filterHash)this._filterHash[J].destroy();this._filterHash=null}}var o9;var PU=A(()=>{k0();bQ();xK();s8();o9={};n0.handle(b.BlendMode,(J)=>{if(!J.name)throw Error("BlendMode extension must have a name property");o9[J.name]=J.ref},(J)=>{delete o9[J.name]});v$.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"blendMode"}});function a9(J,Q){Q||(Q=0);for(let $=Q;$<J.length;$++)if(J[$])J[$]=null;else break}var iW=()=>{};function oW(J,Q=!1){p4(J);let $=J.childrenToUpdate,Z=J.updateTick++;for(let K in $){let W=Number(K),X=$[K],H=X.list,q=X.index;for(let N=0;N<q;N++){let Y=H[N];if(Y.parentRenderGroup===J&&Y.relativeRenderGroupDepth===W)TU(Y,Z,0)}a9(H,q),X.index=0}if(Q)for(let K=0;K<J.renderGroupChildren.length;K++)oW(J.renderGroupChildren[K],Q)}function p4(J){let Q=J.root,$;if(J.renderGroupParent){let Z=J.renderGroupParent;J.worldTransform.appendFrom(Q.relativeGroupTransform,Z.worldTransform),J.worldColor=jJ(Q.groupColor,Z.worldColor),$=Q.groupAlpha*Z.worldAlpha}else J.worldTransform.copyFrom(Q.localTransform),J.worldColor=Q.localColor,$=Q.localAlpha;$=$<0?0:$>1?1:$,J.worldAlpha=$,J.worldColorAlpha=J.worldColor+(($*255|0)<<24)}function TU(J,Q,$){if(Q===J.updateTick)return;J.updateTick=Q,J.didChange=!1;let Z=J.localTransform;J.updateLocalTransform();let K=J.parent;if(K&&!K.renderGroup){if($|=J._updateFlags,J.relativeGroupTransform.appendFrom(Z,K.relativeGroupTransform),$&jU)SU(J,K,$)}else if($=J._updateFlags,J.relativeGroupTransform.copyFrom(Z),$&jU)SU(J,g4,$);if(!J.renderGroup){let W=J.children,X=W.length;for(let N=0;N<X;N++)TU(W[N],Q,$);let H=J.parentRenderGroup,q=J;if(q.renderPipeId&&!H.structureDidChange)H.updateRenderable(q)}}function SU(J,Q,$){if($&vJ){J.groupColor=jJ(J.localColor,Q.groupColor);let Z=J.localAlpha*Q.groupAlpha;Z=Z<0?0:Z>1?1:Z,J.groupAlpha=Z,J.groupColorAlpha=J.groupColor+((Z*255|0)<<24)}if($&j9)J.groupBlendMode=J.localBlendMode==="inherit"?Q.groupBlendMode:J.localBlendMode;if($&t7)J.globalDisplayStatus=J.localDisplayStatus&Q.globalDisplayStatus;J._updateFlags=0}var g4,jU;var yU=A(()=>{o6();iW();EK();g4=new R8,jU=t7|vJ|j9});function bU(J,Q){let{list:$}=J.childrenRenderablesToUpdate,Z=!1;for(let K=0;K<J.childrenRenderablesToUpdate.index;K++){let W=$[K];if(Z=Q[W.renderPipeId].validateRenderable(W),Z)break}return J.structureDidChange=Z,Z}var vU=()=>{};class f${constructor(J){this._renderer=J}render({container:J,transform:Q}){let $=J.parent,Z=J.renderGroup.renderGroupParent;J.parent=null,J.renderGroup.renderGroupParent=null;let K=this._renderer,W=m4;if(Q)W.copyFrom(J.renderGroup.localTransform),J.renderGroup.localTransform.copyFrom(Q);let X=K.renderPipes;if(this._updateCachedRenderGroups(J.renderGroup,null),this._updateRenderGroups(J.renderGroup),K.globalUniforms.start({worldTransformMatrix:Q?J.renderGroup.localTransform:J.renderGroup.worldTransform,worldColor:J.renderGroup.worldColorAlpha}),i9(J.renderGroup,X),X.uniformBatch)X.uniformBatch.renderEnd();if(Q)J.renderGroup.localTransform.copyFrom(W);J.parent=$,J.renderGroup.renderGroupParent=Z}destroy(){this._renderer=null}_updateCachedRenderGroups(J,Q){if(J._parentCacheAsTextureRenderGroup=Q,J.isCachedAsTexture){if(!J.textureNeedsUpdate)return;Q=J}for(let $=J.renderGroupChildren.length-1;$>=0;$--)this._updateCachedRenderGroups(J.renderGroupChildren[$],Q);if(J.invalidateMatrices(),J.isCachedAsTexture){if(J.textureNeedsUpdate){let $=J.root.getLocalBounds(),Z=this._renderer,K=J.textureOptions.resolution||Z.view.resolution,W=J.textureOptions.antialias??Z.view.antialias,X=J.textureOptions.scaleMode??"linear",H=J.texture;if($.ceil(),J.texture)g8.returnTexture(J.texture,!0);let q=g8.getOptimalTexture($.width,$.height,K,W);if(q._source.style=new TJ({scaleMode:X}),J.texture=q,J._textureBounds||(J._textureBounds=new B8),J._textureBounds.copyFrom($),H!==J.texture){if(J.renderGroupParent)J.renderGroupParent.structureDidChange=!0}}}else if(J.texture)g8.returnTexture(J.texture,!0),J.texture=null}_updateRenderGroups(J){let Q=this._renderer,$=Q.renderPipes;if(J.runOnRender(Q),J.instructionSet.renderPipes=$,!J.structureDidChange)bU(J,$);else a9(J.childrenRenderablesToUpdate.list,0);if(oW(J),J.structureDidChange)J.structureDidChange=!1,this._buildInstructions(J,Q);else this._updateRenderables(J);if(J.childrenRenderablesToUpdate.index=0,Q.renderPipes.batch.upload(J.instructionSet),J.isCachedAsTexture&&!J.textureNeedsUpdate)return;for(let Z=0;Z<J.renderGroupChildren.length;Z++)this._updateRenderGroups(J.renderGroupChildren[Z])}_updateRenderables(J){let{list:Q,index:$}=J.childrenRenderablesToUpdate;for(let Z=0;Z<$;Z++){let K=Q[Z];if(K.didViewUpdate)J.updateRenderable(K)}a9(Q,$)}_buildInstructions(J,Q){let{root:$,instructionSet:Z}=J;Z.reset();let K=Q.renderPipes?Q:Q.batch.renderer,W=K.renderPipes;if(W.batch.buildStart(Z),W.blendMode.buildStart(),W.colorMask.buildStart(),$.sortableChildren)$.sortChildren();$.collectRenderablesWithEffects(Z,K,null),W.batch.buildEnd(Z),W.blendMode.buildEnd(Z)}}var m4;var fU=A(()=>{k0();E8();P9();gQ();v6();iW();nW();yU();vU();m4=new R0;f$.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"renderGroup"}});var aW=class J{constructor(){this.clearBeforeRender=!0,this._backgroundColor=new G6(0),this.color=this._backgroundColor,this.alpha=1}init(Q){Q={...J.defaultOptions,...Q},this.clearBeforeRender=Q.clearBeforeRender,this.color=Q.background||Q.backgroundColor||this._backgroundColor,this.alpha=Q.backgroundAlpha,this._backgroundColor.setAlpha(Q.backgroundAlpha)}get color(){return this._backgroundColor}set color(Q){if(G6.shared.setValue(Q).alpha<1&&this._backgroundColor.alpha===1)v0("Cannot set a transparent background on an opaque canvas. To enable transparency, set backgroundAlpha < 1 when initializing your Application.");this._backgroundColor.setValue(Q)}get alpha(){return this._backgroundColor.alpha}set alpha(Q){this._backgroundColor.setAlpha(Q)}get colorRgba(){return this._backgroundColor.toArray()}destroy(){}},hU;var xU=A(()=>{A9();k0();s8();aW.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"background",priority:0};aW.defaultOptions={backgroundAlpha:1,backgroundColor:0,clearBeforeRender:!0};hU=aW});var rW,tW=class J{constructor(Q){this._renderer=Q}_normalizeOptions(Q,$={}){if(Q instanceof R8||Q instanceof P0)return{target:Q,...$};return{...$,...Q}}async image(Q){let $=F8.get().createImage();return $.src=await this.base64(Q),$}async base64(Q){Q=this._normalizeOptions(Q,J.defaultImageOptions);let{format:$,quality:Z}=Q,K=this.canvas(Q);if(K.toBlob!==void 0)return new Promise((W,X)=>{K.toBlob((H)=>{if(!H){X(Error("ICanvas.toBlob failed!"));return}let q=new FileReader;q.onload=()=>W(q.result),q.onerror=X,q.readAsDataURL(H)},rW[$],Z)});if(K.toDataURL!==void 0)return K.toDataURL(rW[$],Z);if(K.convertToBlob!==void 0){let W=await K.convertToBlob({type:rW[$],quality:Z});return new Promise((X,H)=>{let q=new FileReader;q.onload=()=>X(q.result),q.onerror=H,q.readAsDataURL(W)})}throw Error("Extract.base64() requires ICanvas.toDataURL, ICanvas.toBlob, or ICanvas.convertToBlob to be implemented")}canvas(Q){Q=this._normalizeOptions(Q);let $=Q.target,Z=this._renderer;if($ instanceof P0)return Z.texture.generateCanvas($);let K=Z.textureGenerator.generateTexture(Q),W=Z.texture.generateCanvas(K);return K.destroy(!0),W}pixels(Q){Q=this._normalizeOptions(Q);let $=Q.target,Z=this._renderer,K=$ instanceof P0?$:Z.textureGenerator.generateTexture(Q),W=Z.texture.getPixels(K);if($ instanceof R8)K.destroy(!0);return W}texture(Q){if(Q=this._normalizeOptions(Q),Q.target instanceof P0)return Q.target;return this._renderer.textureGenerator.generateTexture(Q)}download(Q){Q=this._normalizeOptions(Q);let $=this.canvas(Q),Z=document.createElement("a");Z.download=Q.filename??"image.png",Z.href=$.toDataURL("image/png"),document.body.appendChild(Z),Z.click(),document.body.removeChild(Z)}log(Q){let $=Q.width??200;Q=this._normalizeOptions(Q);let Z=this.canvas(Q),K=Z.toDataURL();console.log(`[Pixi Texture] ${Z.width}px ${Z.height}px`);let W=["font-size: 1px;",`padding: ${$}px 300px;`,`background: url(${K}) no-repeat;`,"background-size: contain;"].join(" ");console.log("%c ",W)}destroy(){this._renderer=null}},gU;var pU=A(()=>{D6();k0();o6();i8();rW={png:"image/png",jpg:"image/jpeg",webp:"image/webp"};tW.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"extract"};tW.defaultImageOptions={format:"png",quality:1};gU=tW});var h$;var mU=A(()=>{X6();i8();h$=class h$ extends P0{static create(J){let{dynamic:Q,...$}=J;return new h$({source:new Q8($),dynamic:Q??!1})}resize(J,Q,$){return this.source.resize(J,Q,$),this}}});class x${constructor(J){this._renderer=J}generateTexture(J){if(J instanceof R8)J={target:J,frame:void 0,textureSourceOptions:{},resolution:void 0};let Q=J.resolution||this._renderer.resolution,$=J.antialias||this._renderer.view.antialias,Z=J.target,K=J.clearColor;if(K)K=Array.isArray(K)&&K.length===4?K:G6.shared.setValue(K).toArray();else K=c4;let W=J.frame?.copyTo(d4)||SJ(Z,l4).rectangle;W.width=Math.max(W.width,1/Q)|0,W.height=Math.max(W.height,1/Q)|0;let X=h$.create({...J.textureSourceOptions,width:W.width,height:W.height,resolution:Q,antialias:$}),H=R0.shared.translate(-W.x,-W.y);return this._renderer.render({container:Z,transform:H,target:X,clearColor:K}),X.source.updateMipmaps(),X}destroy(){this._renderer=null}}var d4,l4,c4;var dU=A(()=>{A9();k0();E8();_7();v6();xQ();o6();mU();d4=new G8,l4=new B8,c4=[0,0,0,0];x$.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"textureGenerator"}});function lU(J){let Q=!1;for(let Z in J)if(J[Z]==null){Q=!0;break}if(!Q)return J;let $=Object.create(null);for(let Z in J){let K=J[Z];if(K)$[Z]=K}return $}function cU(J){let Q=0;for(let $=0;$<J.length;$++)if(J[$]==null)Q++;else J[$-Q]=J[$];return J.length-=Q,J}var uU=()=>{};var eW=class J{constructor(Q){this._managedResources=[],this._managedResourceHashes=[],this._managedCollections=[],this._ready=!1,this._renderer=Q}init(Q){Q={...J.defaultOptions,...Q},this.maxUnusedTime=Q.gcMaxUnusedTime,this._frequency=Q.gcFrequency,this.enabled=Q.gcActive,this.now=performance.now()}get enabled(){return!!this._handler}set enabled(Q){if(this.enabled===Q)return;if(Q)this._handler=this._renderer.scheduler.repeat(()=>{this._ready=!0},this._frequency,!1),this._collectionsHandler=this._renderer.scheduler.repeat(()=>{for(let $ of this._managedCollections){let{context:Z,collection:K,type:W}=$;if(W==="hash")Z[K]=lU(Z[K]);else Z[K]=cU(Z[K])}},this._frequency);else this._renderer.scheduler.cancel(this._handler),this._renderer.scheduler.cancel(this._collectionsHandler),this._handler=0,this._collectionsHandler=0}prerender({container:Q}){this.now=performance.now(),Q.renderGroup.gcTick=this._renderer.tick++,this._updateInstructionGCTick(Q.renderGroup,Q.renderGroup.gcTick)}postrender(){if(!this._ready||!this.enabled)return;this.run(),this._ready=!1}_updateInstructionGCTick(Q,$){Q.instructionSet.gcTick=$,Q.gcTick=$;for(let Z of Q.renderGroupChildren)this._updateInstructionGCTick(Z,$)}addCollection(Q,$,Z){this._managedCollections.push({context:Q,collection:$,type:Z})}addResource(Q,$){if(Q._gcLastUsed!==-1){Q._gcLastUsed=this.now,Q._onTouch?.(this.now);return}let Z=this._managedResources.length;Q._gcData={index:Z,type:$},Q._gcLastUsed=this.now,Q._onTouch?.(this.now),Q.once("unload",this.removeResource,this),this._managedResources.push(Q)}removeResource(Q){let $=Q._gcData;if(!$)return;let Z=$.index,K=this._managedResources.length-1;if(Z!==K){let W=this._managedResources[K];this._managedResources[Z]=W,W._gcData.index=Z}this._managedResources.length--,Q._gcData=null,Q._gcLastUsed=-1}addResourceHash(Q,$,Z,K=0){this._managedResourceHashes.push({context:Q,hash:$,type:Z,priority:K}),this._managedResourceHashes.sort((W,X)=>W.priority-X.priority)}run(){let Q=performance.now(),$=this._managedResourceHashes;for(let K of $)this.runOnHash(K,Q);let Z=0;for(let K=0;K<this._managedResources.length;K++){let W=this._managedResources[K];Z=this.runOnResource(W,Q,Z)}this._managedResources.length=Z}updateRenderableGCTick(Q,$){let Z=Q.renderGroup??Q.parentRenderGroup,K=Z?.instructionSet?.gcTick??-1;if((Z?.gcTick??0)===K)Q._gcLastUsed=$,Q._onTouch?.($)}runOnResource(Q,$,Z){let K=Q._gcData;if(K.type==="renderable")this.updateRenderableGCTick(Q,$);if($-Q._gcLastUsed<this.maxUnusedTime||!Q.autoGarbageCollect)this._managedResources[Z]=Q,K.index=Z,Z++;else Q.unload(),Q._gcData=null,Q._gcLastUsed=-1,Q.off("unload",this.removeResource,this);return Z}_createHashClone(Q,$){let Z=Object.create(null);for(let K in Q){if(K===$)break;if(Q[K]!==null)Z[K]=Q[K]}return Z}runOnHash(Q,$){let{context:Z,hash:K,type:W}=Q,X=Z[K],H=null,q=0;for(let N in X){let Y=X[N];if(Y===null){if(q++,q===1e4&&!H)H=this._createHashClone(X,N);continue}if(Y._gcLastUsed===-1){if(Y._gcLastUsed=$,Y._onTouch?.($),H)H[N]=Y;continue}if(W==="renderable")this.updateRenderableGCTick(Y,$);if(!($-Y._gcLastUsed<this.maxUnusedTime)&&Y.autoGarbageCollect){if(!H)if(q+1!==1e4)X[N]=null,q++;else H=this._createHashClone(X,N);if(W==="renderable"){let V=Y,z=V.renderGroup??V.parentRenderGroup;if(z)z.structureDidChange=!0}Y.unload(),Y._gcData=null,Y._gcLastUsed=-1}else if(H)H[N]=Y}if(H)Z[K]=H}destroy(){this.enabled=!1,this._managedResources.forEach((Q)=>{Q.off("unload",this.removeResource,this)}),this._managedResources.length=0,this._managedResourceHashes.length=0,this._managedCollections.length=0,this._renderer=null}},sU;var nU=A(()=>{k0();uU();eW.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"gc",priority:0};eW.defaultOptions={gcActive:!0,gcMaxUnusedTime:60000,gcFrequency:30000};sU=eW});class g${constructor(J){this._stackIndex=0,this._globalUniformDataStack=[],this._uniformsPool=[],this._activeUniforms=[],this._bindGroupPool=[],this._activeBindGroups=[],this._renderer=J}reset(){this._stackIndex=0;for(let J=0;J<this._activeUniforms.length;J++)this._uniformsPool.push(this._activeUniforms[J]);for(let J=0;J<this._activeBindGroups.length;J++)this._bindGroupPool.push(this._activeBindGroups[J]);this._activeUniforms.length=0,this._activeBindGroups.length=0}start(J){this.reset(),this.push(J)}bind({size:J,projectionMatrix:Q,worldTransformMatrix:$,worldColor:Z,offset:K}){let W=this._renderer.renderTarget.renderTarget,X=this._stackIndex?this._globalUniformDataStack[this._stackIndex-1]:{projectionData:W,worldTransformMatrix:new R0,worldColor:4294967295,offset:new O8},H={projectionMatrix:Q||this._renderer.renderTarget.projectionMatrix,resolution:J||W.size,worldTransformMatrix:$||X.worldTransformMatrix,worldColor:Z||X.worldColor,offset:K||X.offset,bindGroup:null},q=this._uniformsPool.pop()||this._createUniforms();this._activeUniforms.push(q);let N=q.uniforms;N.uProjectionMatrix=H.projectionMatrix,N.uResolution=H.resolution,N.uWorldTransformMatrix.copyFrom(H.worldTransformMatrix),N.uWorldTransformMatrix.tx-=H.offset.x,N.uWorldTransformMatrix.ty-=H.offset.y,FU(H.worldColor,N.uWorldColorAlpha,0),q.update();let Y;if(this._renderer.renderPipes.uniformBatch)Y=this._renderer.renderPipes.uniformBatch.getUniformBindGroup(q,!1);else Y=this._bindGroupPool.pop()||new N7,this._activeBindGroups.push(Y),Y.setResource(q,0);H.bindGroup=Y,this._currentGlobalUniformData=H}push(J){this.bind(J),this._globalUniformDataStack[this._stackIndex++]=this._currentGlobalUniformData}pop(){if(this._currentGlobalUniformData=this._globalUniformDataStack[--this._stackIndex-1],this._renderer.type===q6.WEBGL)this._currentGlobalUniformData.bindGroup.resources[0].update()}get bindGroup(){return this._currentGlobalUniformData.bindGroup}get globalUniformData(){return this._currentGlobalUniformData}get uniformGroup(){return this._currentGlobalUniformData.bindGroup.resources[0]}_createUniforms(){return new o8({uProjectionMatrix:{value:new R0,type:"mat3x3<f32>"},uWorldTransformMatrix:{value:new R0,type:"mat3x3<f32>"},uWorldColorAlpha:{value:new Float32Array(4),type:"vec4<f32>"},uResolution:{value:[0,0],type:"vec2<f32>"}},{isStatic:!0})}destroy(){this._renderer=null,this._globalUniformDataStack.length=0,this._uniformsPool.length=0,this._activeUniforms.length=0,this._bindGroupPool.length=0,this._activeBindGroups.length=0,this._currentGlobalUniformData=null}}var iU=A(()=>{k0();E8();A7();zU();U$();$J();Y7();g$.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"globalUniforms"}});class p${constructor(){this._tasks=[],this._offset=0}init(){l8.system.add(this._update,this)}repeat(J,Q,$=!0){let Z=u4++,K=0;if($)this._offset+=1000,K=this._offset;return this._tasks.push({func:J,duration:Q,start:performance.now(),offset:K,last:performance.now(),repeat:!0,id:Z}),Z}cancel(J){for(let Q=0;Q<this._tasks.length;Q++)if(this._tasks[Q].id===J){this._tasks.splice(Q,1);return}}_update(){let J=performance.now();for(let Q=0;Q<this._tasks.length;Q++){let $=this._tasks[Q];if(J-$.offset-$.last>=$.duration){let Z=J-$.start;$.func(Z),$.last=J}}}destroy(){l8.system.remove(this._update,this),this._tasks.length=0}}var u4=1;var oU=A(()=>{k0();fJ();p$.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"scheduler",priority:0}});function rU(J){if(aU)return;if(F8.get().getNavigator().userAgent.toLowerCase().indexOf("chrome")>-1){let Q=[`%c  %c  %c  %c  %c PixiJS %c v${lJ} (${J}) http://www.pixijs.com/

`,"background: #E72264; padding:5px 0;","background: #6CA2EA; padding:5px 0;","background: #B5D33D; padding:5px 0;","background: #FED23F; padding:5px 0;","color: #FFFFFF; background: #E72264; padding:5px 0;","color: #E72264; background: #FFFFFF; padding:5px 0;"];globalThis.console.log(...Q)}else if(globalThis.console)globalThis.console.log(`PixiJS ${lJ} - ${J} - http://www.pixijs.com/`);aU=!0}var aU=!1;var tU=A(()=>{D6();BW()});class r9{constructor(J){this._renderer=J}init(J){if(J.hello){let Q=this._renderer.name;if(this._renderer.type===q6.WEBGL)Q+=` ${this._renderer.context.webGLVersion}`;rU(Q)}}}var eU=A(()=>{k0();tU();$J();r9.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"hello",priority:-2};r9.defaultOptions={hello:!1}});var J5=class J{constructor(Q){this._renderer=Q}init(Q){Q={...J.defaultOptions,...Q},this.maxUnusedTime=Q.renderableGCMaxUnusedTime}get enabled(){return u0("8.15.0","RenderableGCSystem.enabled is deprecated, please use the GCSystem.enabled instead."),this._renderer.gc.enabled}set enabled(Q){u0("8.15.0","RenderableGCSystem.enabled is deprecated, please use the GCSystem.enabled instead."),this._renderer.gc.enabled=Q}addManagedHash(Q,$){u0("8.15.0","RenderableGCSystem.addManagedHash is deprecated, please use the GCSystem.addCollection instead."),this._renderer.gc.addCollection(Q,$,"hash")}addManagedArray(Q,$){u0("8.15.0","RenderableGCSystem.addManagedArray is deprecated, please use the GCSystem.addCollection instead."),this._renderer.gc.addCollection(Q,$,"array")}addRenderable(Q){u0("8.15.0","RenderableGCSystem.addRenderable is deprecated, please use the GCSystem instead."),this._renderer.gc.addResource(Q,"renderable")}run(){u0("8.15.0","RenderableGCSystem.run is deprecated, please use the GCSystem instead."),this._renderer.gc.run()}destroy(){this._renderer=null}},JV;var QV=A(()=>{k0();F6();J5.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"renderableGC",priority:0};J5.defaultOptions={renderableGCActive:!0,renderableGCMaxUnusedTime:60000,renderableGCFrequency:30000};JV=J5});var Q5=class J{get count(){return this._renderer.tick}get checkCount(){return this._checkCount}set checkCount(Q){u0("8.15.0","TextureGCSystem.run is deprecated, please use the GCSystem instead."),this._checkCount=Q}get maxIdle(){return this._renderer.gc.maxUnusedTime/1000*60}set maxIdle(Q){u0("8.15.0","TextureGCSystem.run is deprecated, please use the GCSystem instead."),this._renderer.gc.maxUnusedTime=Q/60*1000}get checkCountMax(){return Math.floor(this._renderer.gc._frequency/1000)}set checkCountMax(Q){u0("8.15.0","TextureGCSystem.run is deprecated, please use the GCSystem instead.")}get active(){return this._renderer.gc.enabled}set active(Q){u0("8.15.0","TextureGCSystem.run is deprecated, please use the GCSystem instead."),this._renderer.gc.enabled=Q}constructor(Q){this._renderer=Q,this._checkCount=0}init(Q){if(Q.textureGCActive!==J.defaultOptions.textureGCActive)this.active=Q.textureGCActive;if(Q.textureGCMaxIdle!==J.defaultOptions.textureGCMaxIdle)this.maxIdle=Q.textureGCMaxIdle;if(Q.textureGCCheckCountMax!==J.defaultOptions.textureGCCheckCountMax)this.checkCountMax=Q.textureGCCheckCountMax}run(){u0("8.15.0","TextureGCSystem.run is deprecated, please use the GCSystem instead."),this._renderer.gc.run()}destroy(){this._renderer=null}},$V;var ZV=A(()=>{k0();F6();Q5.extension={type:[b.WebGLSystem,b.WebGPUSystem],name:"textureGC"};Q5.defaultOptions={textureGCActive:!0,textureGCAMaxIdle:null,textureGCMaxIdle:3600,textureGCCheckCountMax:600};$V=Q5});var KV=class J{constructor(Q={}){if(this.uid=i0("renderTarget"),this.colorTextures=[],this.dirtyId=0,this.isRoot=!1,this._size=new Float32Array(2),this._managedColorTextures=!1,Q={...J.defaultOptions,...Q},this.stencil=Q.stencil,this.depth=Q.depth,this.isRoot=Q.isRoot,typeof Q.colorTextures==="number"){this._managedColorTextures=!0;for(let $=0;$<Q.colorTextures;$++)this.colorTextures.push(new Q8({width:Q.width,height:Q.height,resolution:Q.resolution,antialias:Q.antialias}))}else{this.colorTextures=[...Q.colorTextures.map((Z)=>Z.source)];let $=this.colorTexture.source;this.resize($.width,$.height,$._resolution)}if(this.colorTexture.source.on("resize",this.onSourceResize,this),Q.depthStencilTexture||this.stencil)if(Q.depthStencilTexture instanceof P0||Q.depthStencilTexture instanceof Q8)this.depthStencilTexture=Q.depthStencilTexture.source;else this.ensureDepthStencilTexture()}get size(){let Q=this._size;return Q[0]=this.pixelWidth,Q[1]=this.pixelHeight,Q}get width(){return this.colorTexture.source.width}get height(){return this.colorTexture.source.height}get pixelWidth(){return this.colorTexture.source.pixelWidth}get pixelHeight(){return this.colorTexture.source.pixelHeight}get resolution(){return this.colorTexture.source._resolution}get colorTexture(){return this.colorTextures[0]}onSourceResize(Q){this.resize(Q.width,Q.height,Q._resolution,!0)}ensureDepthStencilTexture(){if(!this.depthStencilTexture)this.depthStencilTexture=new Q8({width:this.width,height:this.height,resolution:this.resolution,format:"depth24plus-stencil8",autoGenerateMipmaps:!1,antialias:!1,mipLevelCount:1})}resize(Q,$,Z=this.resolution,K=!1){if(this.dirtyId++,this.colorTextures.forEach((W,X)=>{if(K&&X===0)return;W.source.resize(Q,$,Z)}),this.depthStencilTexture)this.depthStencilTexture.source.resize(Q,$,Z)}destroy(){if(this.colorTexture.source.off("resize",this.onSourceResize,this),this._managedColorTextures)this.colorTextures.forEach((Q)=>{Q.destroy()});if(this.depthStencilTexture)this.depthStencilTexture.destroy(),delete this.depthStencilTexture}},t9;var $5=A(()=>{W6();X6();i8();KV.defaultOptions={width:0,height:0,resolution:1,colorTextures:1,stencil:!1,depth:!1,antialias:!1,isRoot:!1};t9=KV});function m$(J,Q){if(!nJ.has(J)){let $=new P0({source:new k6({resource:J,...Q})}),Z=()=>{if(nJ.get(J)===$)nJ.delete(J)};$.once("destroy",Z),$.source.once("destroy",Z),nJ.set(J,$)}return nJ.get(J)}var nJ;var Z5=A(()=>{_J();v9();i8();nJ=new Map;i6.register(nJ)});var K5=class J{get autoDensity(){return this.texture.source.autoDensity}set autoDensity(Q){this.texture.source.autoDensity=Q}get resolution(){return this.texture.source._resolution}set resolution(Q){this.texture.source.resize(this.texture.source.width,this.texture.source.height,Q)}init(Q){if(Q={...J.defaultOptions,...Q},Q.view)u0(Z6,"ViewSystem.view has been renamed to ViewSystem.canvas"),Q.canvas=Q.view;this.screen=new G8(0,0,Q.width,Q.height),this.canvas=Q.canvas||F8.get().createCanvas(),this.antialias=!!Q.antialias,this.texture=m$(this.canvas,Q),this.renderTarget=new t9({colorTextures:[this.texture],depth:!!Q.depth,isRoot:!0}),this.texture.source.transparent=Q.backgroundAlpha<1,this.resolution=Q.resolution}resize(Q,$,Z){this.texture.source.resize(Q,$,Z),this.screen.width=this.texture.frame.width,this.screen.height=this.texture.frame.height}destroy(Q=!1){if((typeof Q==="boolean"?Q:!!Q?.removeView)&&this.canvas.parentNode)this.canvas.parentNode.removeChild(this.canvas);this.texture.destroy()}},WV;var XV=A(()=>{D6();k0();_7();F6();$5();Z5();K5.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"view",priority:0};K5.defaultOptions={width:800,height:600,autoDensity:!1,antialias:!1};WV=K5});var HV,qV;var NV=A(()=>{CU();_U();fU();EU();MY();wU();BU();RU();AU();xU();PU();pU();dU();nU();iU();oU();eU();QV();ZV();XV();HV=[hU,g$,r9,WV,f$,sU,$V,x$,gU,D$,JV,p$],qV=[v$,sW,b$,y$,P$,S$,j$,T$]});function YV(J,Q,$,Z,K,W){let X=W?1:-1;return J.identity(),J.a=1/Z*2,J.d=X*(1/K*2),J.tx=-1-Q*J.a,J.ty=-X-$*J.d,J}var UV=()=>{};function VV(J){let Q=J.colorTexture.source.resource;return globalThis.HTMLCanvasElement&&Q instanceof HTMLCanvasElement&&document.body.contains(Q)}var OV=()=>{};class W5{constructor(J){this.rootViewPort=new G8,this.viewport=new G8,this.mipLevel=0,this.layer=0,this.onRenderTargetChange=new d9("onRenderTargetChange"),this.projectionMatrix=new R0,this.defaultClearColor=[0,0,0,0],this._renderSurfaceToRenderTargetHash=new Map,this._gpuRenderTargetHash=Object.create(null),this._renderTargetStack=[],this._renderer=J,J.gc.addCollection(this,"_gpuRenderTargetHash","hash")}finishRenderPass(){this.adaptor.finishRenderPass(this.renderTarget)}renderStart({target:J,clear:Q,clearColor:$,frame:Z,mipLevel:K,layer:W}){this._renderTargetStack.length=0,this.push(J,Q,$,Z,K??0,W??0),this.rootViewPort.copyFrom(this.viewport),this.rootRenderTarget=this.renderTarget,this.renderingToScreen=VV(this.rootRenderTarget),this.adaptor.prerender?.(this.rootRenderTarget)}postrender(){this.adaptor.postrender?.(this.rootRenderTarget)}bind(J,Q=!0,$,Z,K=0,W=0){let X=this.getRenderTarget(J),H=this.renderTarget!==X;this.renderTarget=X,this.renderSurface=J;let q=this.getGpuRenderTarget(X);if(X.pixelWidth!==q.width||X.pixelHeight!==q.height)this.adaptor.resizeGpuRenderTarget(X),q.width=X.pixelWidth,q.height=X.pixelHeight;let N=X.colorTexture,Y=this.viewport,U=N.arrayLayerCount||1;if((W|0)!==W)W|=0;if(W<0||W>=U)throw Error(`[RenderTargetSystem] layer ${W} is out of bounds (arrayLayerCount=${U}).`);this.mipLevel=K|0,this.layer=W|0;let V=Math.max(N.pixelWidth>>K,1),z=Math.max(N.pixelHeight>>K,1);if(!Z&&J instanceof P0)Z=J.frame;if(Z){let D=N._resolution,w=1<<Math.max(K|0,0),F=Z.x*D+0.5|0,O=Z.y*D+0.5|0,G=Z.width*D+0.5|0,R=Z.height*D+0.5|0,B=Math.floor(F/w),y=Math.floor(O/w),C=Math.ceil(G/w),j=Math.ceil(R/w);B=Math.min(Math.max(B,0),V-1),y=Math.min(Math.max(y,0),z-1),C=Math.min(Math.max(C,1),V-B),j=Math.min(Math.max(j,1),z-y),Y.x=B,Y.y=y,Y.width=C,Y.height=j}else Y.x=0,Y.y=0,Y.width=V,Y.height=z;if(YV(this.projectionMatrix,0,0,Y.width/N.resolution,Y.height/N.resolution,!X.isRoot),this.adaptor.startRenderPass(X,Q,$,Y,K,W),H)this.onRenderTargetChange.emit(X);return X}clear(J,Q=_6.ALL,$,Z=this.mipLevel,K=this.layer){if(!Q)return;if(J)J=this.getRenderTarget(J);this.adaptor.clear(J||this.renderTarget,Q,$,this.viewport,Z,K)}contextChange(){this._gpuRenderTargetHash=Object.create(null)}push(J,Q=_6.ALL,$,Z,K=0,W=0){let X=this.bind(J,Q,$,Z,K,W);return this._renderTargetStack.push({renderTarget:X,frame:Z,mipLevel:K,layer:W}),X}pop(){this._renderTargetStack.pop();let J=this._renderTargetStack[this._renderTargetStack.length-1];this.bind(J.renderTarget,!1,null,J.frame,J.mipLevel,J.layer)}getRenderTarget(J){if(J.isTexture)J=J.source;return this._renderSurfaceToRenderTargetHash.get(J)??this._initRenderTarget(J)}copyToTexture(J,Q,$,Z,K){if($.x<0)Z.width+=$.x,K.x-=$.x,$.x=0;if($.y<0)Z.height+=$.y,K.y-=$.y,$.y=0;let{pixelWidth:W,pixelHeight:X}=J;return Z.width=Math.min(Z.width,W-$.x),Z.height=Math.min(Z.height,X-$.y),this.adaptor.copyToTexture(J,Q,$,Z,K)}ensureDepthStencil(){if(!this.renderTarget.stencil)this.renderTarget.stencil=!0,this.adaptor.startRenderPass(this.renderTarget,!1,null,this.viewport,0,this.layer)}destroy(){this._renderer=null,this._renderSurfaceToRenderTargetHash.forEach((J,Q)=>{if(J!==Q)J.destroy()}),this._renderSurfaceToRenderTargetHash.clear(),this._gpuRenderTargetHash=Object.create(null)}_initRenderTarget(J){let Q=null;if(k6.test(J))J=m$(J).source;if(J instanceof t9)Q=J;else if(J instanceof Q8){if(Q=new t9({colorTextures:[J]}),J.source instanceof k6)Q.isRoot=!0;J.once("destroy",()=>{Q.destroy(),this._renderSurfaceToRenderTargetHash.delete(J);let $=this._gpuRenderTargetHash[Q.uid];if($)this._gpuRenderTargetHash[Q.uid]=null,this.adaptor.destroyGpuRenderTarget($)})}return this._renderSurfaceToRenderTargetHash.set(J,Q),Q}getGpuRenderTarget(J){return this._gpuRenderTargetHash[J.uid]||(this._gpuRenderTargetHash[J.uid]=this.adaptor.initGpuRenderTarget(J))}resetState(){this.renderTarget=null,this.renderSurface=null}}var FV=A(()=>{E8();_7();m9();UV();GW();v9();X6();i8();Z5();OV();$5()});var e9;var zV=A(()=>{e9=((J)=>{return J[J.ELEMENT_ARRAY_BUFFER=34963]="ELEMENT_ARRAY_BUFFER",J[J.ARRAY_BUFFER=34962]="ARRAY_BUFFER",J[J.UNIFORM_BUFFER=35345]="UNIFORM_BUFFER",J})(e9||{})});class X5{constructor(J,Q){this._lastBindBaseLocation=-1,this._lastBindCallId=-1,this.buffer=J||null,this.updateID=-1,this.byteLength=-1,this.type=Q}destroy(){this.buffer=null,this.updateID=-1,this.byteLength=-1,this.type=-1,this._lastBindBaseLocation=-1,this._lastBindCallId=-1}}var DV=()=>{};class d${constructor(J){this._boundBufferBases=Object.create(null),this._minBaseLocation=0,this._nextBindBaseIndex=this._minBaseLocation,this._bindCallId=0,this._renderer=J,this._managedBuffers=new KJ({renderer:J,type:"resource",onUnload:this.onBufferUnload.bind(this),name:"glBuffer"})}destroy(){this._managedBuffers.destroy(),this._renderer=null,this._gl=null,this._boundBufferBases={}}contextChange(){this._gl=this._renderer.gl,this.destroyAll(!0),this._maxBindings=this._renderer.limits.maxUniformBindings}getGlBuffer(J){return J._gcLastUsed=this._renderer.gc.now,J._gpuData[this._renderer.uid]||this.createGLBuffer(J)}bind(J){let{_gl:Q}=this,$=this.getGlBuffer(J);Q.bindBuffer($.type,$.buffer)}bindBufferBase(J,Q){let{_gl:$}=this;if(this._boundBufferBases[Q]!==J)this._boundBufferBases[Q]=J,J._lastBindBaseLocation=Q,$.bindBufferBase($.UNIFORM_BUFFER,Q,J.buffer)}nextBindBase(J){if(this._bindCallId++,this._minBaseLocation=0,J){if(this._boundBufferBases[0]=null,this._minBaseLocation=1,this._nextBindBaseIndex<1)this._nextBindBaseIndex=1}}freeLocationForBufferBase(J){let Q=this.getLastBindBaseLocation(J);if(Q>=this._minBaseLocation)return J._lastBindCallId=this._bindCallId,Q;let $=0,Z=this._nextBindBaseIndex;while($<2){if(Z>=this._maxBindings)Z=this._minBaseLocation,$++;let K=this._boundBufferBases[Z];if(K&&K._lastBindCallId===this._bindCallId){Z++;continue}break}if(Q=Z,this._nextBindBaseIndex=Z+1,$>=2)return-1;return J._lastBindCallId=this._bindCallId,this._boundBufferBases[Q]=null,Q}getLastBindBaseLocation(J){let Q=J._lastBindBaseLocation;if(this._boundBufferBases[Q]===J)return Q;return-1}bindBufferRange(J,Q,$,Z){let{_gl:K}=this;$||($=0),Q||(Q=0),this._boundBufferBases[Q]=null,K.bindBufferRange(K.UNIFORM_BUFFER,Q||0,J.buffer,$*256,Z||256)}updateBuffer(J){let{_gl:Q}=this,$=this.getGlBuffer(J);if(J._updateID===$.updateID)return $;$.updateID=J._updateID,Q.bindBuffer($.type,$.buffer);let Z=J.data,K=J.descriptor.usage&M8.STATIC?Q.STATIC_DRAW:Q.DYNAMIC_DRAW;if(Z)if($.byteLength>=Z.byteLength)Q.bufferSubData($.type,0,Z,0,J._updateSize/Z.BYTES_PER_ELEMENT);else $.byteLength=Z.byteLength,Q.bufferData($.type,Z,K);else $.byteLength=J.descriptor.size,Q.bufferData($.type,$.byteLength,K);return $}destroyAll(J=!1){this._managedBuffers.removeAll(J)}onBufferUnload(J,Q=!1){let $=J._gpuData[this._renderer.uid];if(!$)return;if(!Q)this._gl.deleteBuffer($.buffer)}createGLBuffer(J){let{_gl:Q}=this,$=e9.ARRAY_BUFFER;if(J.descriptor.usage&M8.INDEX)$=e9.ELEMENT_ARRAY_BUFFER;else if(J.descriptor.usage&M8.UNIFORM)$=e9.UNIFORM_BUFFER;let Z=new X5(Q.createBuffer(),$);return J._gpuData[this._renderer.uid]=Z,this._managedBuffers.add(J),Z}resetState(){this._boundBufferBases=Object.create(null)}}var kV=A(()=>{k0();C$();dJ();zV();DV();d$.extension={type:[b.WebGLSystem],name:"buffer"}});var H5=class J{constructor(Q){this.supports={uint32Indices:!0,uniformBufferObject:!0,vertexArrayObject:!0,srgbTextures:!0,nonPowOf2wrapping:!0,msaa:!0,nonPowOf2mipmaps:!0},this._renderer=Q,this.extensions=Object.create(null),this.handleContextLost=this.handleContextLost.bind(this),this.handleContextRestored=this.handleContextRestored.bind(this)}get isLost(){return!this.gl||this.gl.isContextLost()}contextChange(Q){this.gl=Q,this._renderer.gl=Q}init(Q){Q={...J.defaultOptions,...Q};let $=this.multiView=Q.multiView;if(Q.context&&$)v0("Renderer created with both a context and multiview enabled. Disabling multiView as both cannot work together."),$=!1;if($)this.canvas=F8.get().createCanvas(this._renderer.canvas.width,this._renderer.canvas.height);else this.canvas=this._renderer.view.canvas;if(Q.context)this.initFromContext(Q.context);else{let Z=this._renderer.background.alpha<1,K=Q.premultipliedAlpha??!0,W=Q.antialias&&!this._renderer.backBuffer.useBackBuffer;this.createContext(Q.preferWebGLVersion,{alpha:Z,premultipliedAlpha:K,antialias:W,stencil:!0,preserveDrawingBuffer:Q.preserveDrawingBuffer,powerPreference:Q.powerPreference??"default"})}}ensureCanvasSize(Q){if(!this.multiView){if(Q!==this.canvas)v0("multiView is disabled, but targetCanvas is not the main canvas");return}let{canvas:$}=this;if($.width<Q.width||$.height<Q.height)$.width=Math.max(Q.width,Q.width),$.height=Math.max(Q.height,Q.height)}initFromContext(Q){this.gl=Q,this.webGLVersion=Q instanceof F8.get().getWebGLRenderingContext()?1:2,this.getExtensions(),this.validateContext(Q),this._renderer.runners.contextChange.emit(Q);let $=this._renderer.view.canvas;$.addEventListener("webglcontextlost",this.handleContextLost,!1),$.addEventListener("webglcontextrestored",this.handleContextRestored,!1)}createContext(Q,$){let Z,K=this.canvas;if(Q===2)Z=K.getContext("webgl2",$);if(!Z){if(Z=K.getContext("webgl",$),!Z)throw Error("This browser does not support WebGL. Try using the canvas renderer")}this.gl=Z,this.initFromContext(this.gl)}getExtensions(){let{gl:Q}=this,$={anisotropicFiltering:Q.getExtension("EXT_texture_filter_anisotropic"),floatTextureLinear:Q.getExtension("OES_texture_float_linear"),s3tc:Q.getExtension("WEBGL_compressed_texture_s3tc"),s3tc_sRGB:Q.getExtension("WEBGL_compressed_texture_s3tc_srgb"),etc:Q.getExtension("WEBGL_compressed_texture_etc"),etc1:Q.getExtension("WEBGL_compressed_texture_etc1"),pvrtc:Q.getExtension("WEBGL_compressed_texture_pvrtc")||Q.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),atc:Q.getExtension("WEBGL_compressed_texture_atc"),astc:Q.getExtension("WEBGL_compressed_texture_astc"),bptc:Q.getExtension("EXT_texture_compression_bptc"),rgtc:Q.getExtension("EXT_texture_compression_rgtc"),loseContext:Q.getExtension("WEBGL_lose_context")};if(this.webGLVersion===1)this.extensions={...$,drawBuffers:Q.getExtension("WEBGL_draw_buffers"),depthTexture:Q.getExtension("WEBGL_depth_texture"),vertexArrayObject:Q.getExtension("OES_vertex_array_object")||Q.getExtension("MOZ_OES_vertex_array_object")||Q.getExtension("WEBKIT_OES_vertex_array_object"),uint32ElementIndex:Q.getExtension("OES_element_index_uint"),floatTexture:Q.getExtension("OES_texture_float"),floatTextureLinear:Q.getExtension("OES_texture_float_linear"),textureHalfFloat:Q.getExtension("OES_texture_half_float"),textureHalfFloatLinear:Q.getExtension("OES_texture_half_float_linear"),vertexAttribDivisorANGLE:Q.getExtension("ANGLE_instanced_arrays"),srgb:Q.getExtension("EXT_sRGB")};else{this.extensions={...$,colorBufferFloat:Q.getExtension("EXT_color_buffer_float")};let Z=Q.getExtension("WEBGL_provoking_vertex");if(Z)Z.provokingVertexWEBGL(Z.FIRST_VERTEX_CONVENTION_WEBGL)}}handleContextLost(Q){if(Q.preventDefault(),this._contextLossForced)this._contextLossForced=!1,setTimeout(()=>{if(this.gl.isContextLost())this.extensions.loseContext?.restoreContext()},0)}handleContextRestored(){this.getExtensions(),this._renderer.runners.contextChange.emit(this.gl)}destroy(){let Q=this._renderer.view.canvas;this._renderer=null,Q.removeEventListener("webglcontextlost",this.handleContextLost),Q.removeEventListener("webglcontextrestored",this.handleContextRestored),this.gl.useProgram(null),this.extensions.loseContext?.loseContext()}forceContextLoss(){this.extensions.loseContext?.loseContext(),this._contextLossForced=!0}validateContext(Q){let $=Q.getContextAttributes();if($&&!$.stencil)v0("Provided WebGL context does not have a stencil buffer, masks may not render correctly");let Z=this.supports,K=this.webGLVersion===2,W=this.extensions;if(Z.uint32Indices=K||!!W.uint32ElementIndex,Z.uniformBufferObject=K,Z.vertexArrayObject=K||!!W.vertexArrayObject,Z.srgbTextures=K||!!W.srgb,Z.nonPowOf2wrapping=K,Z.nonPowOf2mipmaps=K,Z.msaa=K,!Z.uint32Indices)v0("Provided WebGL context does not support 32 index buffer, large scenes may not render correctly")}},MV;var wV=A(()=>{D6();k0();s8();H5.extension={type:[b.WebGLSystem],name:"context"};H5.defaultOptions={context:null,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:void 0,preferWebGLVersion:2,multiView:!1};MV=H5});function IV(J,Q){for(let $ in J.attributes){let Z=J.attributes[$],K=Q[$];if(K)Z.format??(Z.format=K.format),Z.offset??(Z.offset=K.offset),Z.instance??(Z.instance=K.instance);else v0(`Attribute ${$} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`)}s4(J)}function s4(J){let{buffers:Q,attributes:$}=J,Z={},K={};for(let W in Q){let X=Q[W];Z[X.uid]=0,K[X.uid]=0}for(let W in $){let X=$[W];Z[X.buffer.uid]+=q7(X.format).stride}for(let W in $){let X=$[W];X.stride??(X.stride=Z[X.buffer.uid]),X.start??(X.start=K[X.buffer.uid]),K[X.buffer.uid]+=q7(X.format).stride}}var LV=A(()=>{s8();h9()});var l$,JQ,o0;var c$=A(()=>{l$=((J)=>{return J[J.RGBA=6408]="RGBA",J[J.RGB=6407]="RGB",J[J.RG=33319]="RG",J[J.RED=6403]="RED",J[J.RGBA_INTEGER=36249]="RGBA_INTEGER",J[J.RGB_INTEGER=36248]="RGB_INTEGER",J[J.RG_INTEGER=33320]="RG_INTEGER",J[J.RED_INTEGER=36244]="RED_INTEGER",J[J.ALPHA=6406]="ALPHA",J[J.LUMINANCE=6409]="LUMINANCE",J[J.LUMINANCE_ALPHA=6410]="LUMINANCE_ALPHA",J[J.DEPTH_COMPONENT=6402]="DEPTH_COMPONENT",J[J.DEPTH_STENCIL=34041]="DEPTH_STENCIL",J})(l$||{}),JQ=((J)=>{return J[J.TEXTURE_2D=3553]="TEXTURE_2D",J[J.TEXTURE_CUBE_MAP=34067]="TEXTURE_CUBE_MAP",J[J.TEXTURE_2D_ARRAY=35866]="TEXTURE_2D_ARRAY",J[J.TEXTURE_CUBE_MAP_POSITIVE_X=34069]="TEXTURE_CUBE_MAP_POSITIVE_X",J[J.TEXTURE_CUBE_MAP_NEGATIVE_X=34070]="TEXTURE_CUBE_MAP_NEGATIVE_X",J[J.TEXTURE_CUBE_MAP_POSITIVE_Y=34071]="TEXTURE_CUBE_MAP_POSITIVE_Y",J[J.TEXTURE_CUBE_MAP_NEGATIVE_Y=34072]="TEXTURE_CUBE_MAP_NEGATIVE_Y",J[J.TEXTURE_CUBE_MAP_POSITIVE_Z=34073]="TEXTURE_CUBE_MAP_POSITIVE_Z",J[J.TEXTURE_CUBE_MAP_NEGATIVE_Z=34074]="TEXTURE_CUBE_MAP_NEGATIVE_Z",J})(JQ||{}),o0=((J)=>{return J[J.UNSIGNED_BYTE=5121]="UNSIGNED_BYTE",J[J.UNSIGNED_SHORT=5123]="UNSIGNED_SHORT",J[J.UNSIGNED_SHORT_5_6_5=33635]="UNSIGNED_SHORT_5_6_5",J[J.UNSIGNED_SHORT_4_4_4_4=32819]="UNSIGNED_SHORT_4_4_4_4",J[J.UNSIGNED_SHORT_5_5_5_1=32820]="UNSIGNED_SHORT_5_5_5_1",J[J.UNSIGNED_INT=5125]="UNSIGNED_INT",J[J.UNSIGNED_INT_10F_11F_11F_REV=35899]="UNSIGNED_INT_10F_11F_11F_REV",J[J.UNSIGNED_INT_2_10_10_10_REV=33640]="UNSIGNED_INT_2_10_10_10_REV",J[J.UNSIGNED_INT_24_8=34042]="UNSIGNED_INT_24_8",J[J.UNSIGNED_INT_5_9_9_9_REV=35902]="UNSIGNED_INT_5_9_9_9_REV",J[J.BYTE=5120]="BYTE",J[J.SHORT=5122]="SHORT",J[J.INT=5124]="INT",J[J.FLOAT=5126]="FLOAT",J[J.FLOAT_32_UNSIGNED_INT_24_8_REV=36269]="FLOAT_32_UNSIGNED_INT_24_8_REV",J[J.HALF_FLOAT=36193]="HALF_FLOAT",J})(o0||{})});function BV(J){return GV[J]??GV.float32}var GV;var RV=A(()=>{c$();GV={uint8x2:o0.UNSIGNED_BYTE,uint8x4:o0.UNSIGNED_BYTE,sint8x2:o0.BYTE,sint8x4:o0.BYTE,unorm8x2:o0.UNSIGNED_BYTE,unorm8x4:o0.UNSIGNED_BYTE,snorm8x2:o0.BYTE,snorm8x4:o0.BYTE,uint16x2:o0.UNSIGNED_SHORT,uint16x4:o0.UNSIGNED_SHORT,sint16x2:o0.SHORT,sint16x4:o0.SHORT,unorm16x2:o0.UNSIGNED_SHORT,unorm16x4:o0.UNSIGNED_SHORT,snorm16x2:o0.SHORT,snorm16x4:o0.SHORT,float16x2:o0.HALF_FLOAT,float16x4:o0.HALF_FLOAT,float32:o0.FLOAT,float32x2:o0.FLOAT,float32x3:o0.FLOAT,float32x4:o0.FLOAT,uint32:o0.UNSIGNED_INT,uint32x2:o0.UNSIGNED_INT,uint32x3:o0.UNSIGNED_INT,uint32x4:o0.UNSIGNED_INT,sint32:o0.INT,sint32x2:o0.INT,sint32x3:o0.INT,sint32x4:o0.INT}});class AV{constructor(){this.vaoCache=Object.create(null)}destroy(){this.vaoCache=Object.create(null)}}class u${constructor(J){this._renderer=J,this._activeGeometry=null,this._activeVao=null,this.hasVao=!0,this.hasInstance=!0,this._managedGeometries=new KJ({renderer:J,type:"resource",onUnload:this.onGeometryUnload.bind(this),name:"glGeometry"})}contextChange(){let J=this.gl=this._renderer.gl;if(!this._renderer.context.supports.vertexArrayObject)throw Error("[PixiJS] Vertex Array Objects are not supported on this device");this.destroyAll(!0);let Q=this._renderer.context.extensions.vertexArrayObject;if(Q)J.createVertexArray=()=>Q.createVertexArrayOES(),J.bindVertexArray=(Z)=>Q.bindVertexArrayOES(Z),J.deleteVertexArray=(Z)=>Q.deleteVertexArrayOES(Z);let $=this._renderer.context.extensions.vertexAttribDivisorANGLE;if($)J.drawArraysInstanced=(Z,K,W,X)=>{$.drawArraysInstancedANGLE(Z,K,W,X)},J.drawElementsInstanced=(Z,K,W,X,H)=>{$.drawElementsInstancedANGLE(Z,K,W,X,H)},J.vertexAttribDivisor=(Z,K)=>$.vertexAttribDivisorANGLE(Z,K);this._activeGeometry=null,this._activeVao=null}bind(J,Q){let $=this.gl;this._activeGeometry=J;let Z=this.getVao(J,Q);if(this._activeVao!==Z)this._activeVao=Z,$.bindVertexArray(Z);this.updateBuffers()}resetState(){this.unbind()}updateBuffers(){let J=this._activeGeometry,Q=this._renderer.buffer;for(let $=0;$<J.buffers.length;$++){let Z=J.buffers[$];Q.updateBuffer(Z)}J._gcLastUsed=this._renderer.gc.now}checkCompatibility(J,Q){let $=J.attributes,Z=Q._attributeData;for(let K in Z)if(!$[K])throw Error(`shader and geometry incompatible, geometry missing the "${K}" attribute`)}getSignature(J,Q){let $=J.attributes,Z=Q._attributeData,K=["g",J.uid];for(let W in $)if(Z[W])K.push(W,Z[W].location);return K.join("-")}getVao(J,Q){return J._gpuData[this._renderer.uid]?.vaoCache[Q._key]||this.initGeometryVao(J,Q)}initGeometryVao(J,Q,$=!0){let Z=this._renderer.gl,K=this._renderer.buffer;this._renderer.shader._getProgramData(Q),this.checkCompatibility(J,Q);let W=this.getSignature(J,Q),X=J._gpuData[this._renderer.uid];if(!X)X=new AV,J._gpuData[this._renderer.uid]=X,this._managedGeometries.add(J);let H=X.vaoCache,q=H[W];if(q)return H[Q._key]=q,q;IV(J,Q._attributeData);let N=J.buffers;q=Z.createVertexArray(),Z.bindVertexArray(q);for(let Y=0;Y<N.length;Y++){let U=N[Y];K.bind(U)}return this.activateVao(J,Q),H[Q._key]=q,H[W]=q,Z.bindVertexArray(null),q}onGeometryUnload(J,Q=!1){let $=J._gpuData[this._renderer.uid];if(!$)return;let Z=$.vaoCache;if(!Q)for(let K in Z){if(this._activeVao!==Z[K])this.resetState();this.gl.deleteVertexArray(Z[K])}}destroyAll(J=!1){this._managedGeometries.removeAll(J)}activateVao(J,Q){let $=this._renderer.gl,Z=this._renderer.buffer,K=J.attributes;if(J.indexBuffer)Z.bind(J.indexBuffer);let W=null;for(let X in K){let H=K[X],q=H.buffer,N=Z.getGlBuffer(q),Y=Q._attributeData[X];if(Y){if(W!==N)Z.bind(q),W=N;let U=Y.location;$.enableVertexAttribArray(U);let V=q7(H.format),z=BV(H.format);if(Y.format?.substring(1,4)==="int")$.vertexAttribIPointer(U,V.size,z,H.stride,H.offset);else $.vertexAttribPointer(U,V.size,z,V.normalised,H.stride,H.offset);if(H.instance)if(this.hasInstance){let D=H.divisor??1;$.vertexAttribDivisor(U,D)}else throw Error("geometry error, GPU Instancing is not supported on this device")}}}draw(J,Q,$,Z){let{gl:K}=this._renderer,W=this._activeGeometry,X=n4[J||W.topology];if(Z??(Z=W.instanceCount),W.indexBuffer){let H=W.indexBuffer.data.BYTES_PER_ELEMENT,q=H===2?K.UNSIGNED_SHORT:K.UNSIGNED_INT;if(Z!==1)K.drawElementsInstanced(X,Q||W.indexBuffer.data.length,q,($||0)*H,Z);else K.drawElements(X,Q||W.indexBuffer.data.length,q,($||0)*H)}else if(Z!==1)K.drawArraysInstanced(X,$||0,Q||W.getSize(),Z);else K.drawArrays(X,$||0,Q||W.getSize());return this}unbind(){this.gl.bindVertexArray(null),this._activeVao=null,this._activeGeometry=null}destroy(){this._managedGeometries.destroy(),this._renderer=null,this.gl=null,this._activeVao=null,this._activeGeometry=null}}var n4;var CV=A(()=>{k0();C$();h9();LV();RV();n4={"point-list":0,"line-list":1,"line-strip":3,"triangle-list":4,"triangle-strip":5};u$.extension={type:[b.WebGLSystem],name:"geometry"}});var i4,q5=class J{constructor(Q){this.useBackBuffer=!1,this._useBackBufferThisRender=!1,this._renderer=Q}init(Q={}){let{useBackBuffer:$,antialias:Z}={...J.defaultOptions,...Q};if(this.useBackBuffer=$,this._antialias=Z,!this._renderer.context.supports.msaa)v0("antialiasing, is not supported on when using the back buffer"),this._antialias=!1;this._state=a6.for2d();let K=new B6({vertex:`
                attribute vec2 aPosition;
                out vec2 vUv;

                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);

                    vUv = (aPosition + 1.0) / 2.0;

                    // flip dem UVs
                    vUv.y = 1.0 - vUv.y;
                }`,fragment:`
                in vec2 vUv;
                out vec4 finalColor;

                uniform sampler2D uTexture;

                void main() {
                    finalColor = texture(uTexture, vUv);
                }`,name:"big-triangle"});this._bigTriangleShader=new A6({glProgram:K,resources:{uTexture:P0.WHITE.source}})}renderStart(Q){let $=this._renderer.renderTarget.getRenderTarget(Q.target);if(this._useBackBufferThisRender=this.useBackBuffer&&!!$.isRoot,this._useBackBufferThisRender){let Z=this._renderer.renderTarget.getRenderTarget(Q.target);this._targetTexture=Z.colorTexture,Q.target=this._getBackBufferTexture(Z.colorTexture)}}renderEnd(){this._presentBackBuffer()}_presentBackBuffer(){let Q=this._renderer;if(Q.renderTarget.finishRenderPass(),!this._useBackBufferThisRender)return;Q.renderTarget.bind(this._targetTexture,!1),this._bigTriangleShader.resources.uTexture=this._backBufferTexture.source,Q.encoder.draw({geometry:i4,shader:this._bigTriangleShader,state:this._state})}_getBackBufferTexture(Q){return this._backBufferTexture=this._backBufferTexture||new P0({source:new Q8({width:Q.width,height:Q.height,resolution:Q._resolution,antialias:this._antialias})}),this._backBufferTexture.source.resize(Q.width,Q.height,Q._resolution),this._backBufferTexture}destroy(){if(this._backBufferTexture)this._backBufferTexture.destroy(),this._backBufferTexture=null}},_V;var EV=A(()=>{k0();s8();O$();pJ();mJ();X6();i8();QJ();i4=new ZJ({attributes:{aPosition:[-1,-1,3,-1,-1,3]}});q5.extension={type:[b.WebGLSystem],name:"backBuffer",priority:1};q5.defaultOptions={useBackBuffer:!1};_V=q5});class s${constructor(J){this._colorMaskCache=15,this._renderer=J}setMask(J){if(this._colorMaskCache===J)return;this._colorMaskCache=J,this._renderer.gl.colorMask(!!(J&8),!!(J&4),!!(J&2),!!(J&1))}}var PV=A(()=>{k0();s$.extension={type:[b.WebGLSystem],name:"colorMask"}});class n${constructor(J){this.commandFinished=Promise.resolve(),this._renderer=J}setGeometry(J,Q){this._renderer.geometry.bind(J,Q.glProgram)}finishRenderPass(){}draw(J){let Q=this._renderer,{geometry:$,shader:Z,state:K,skipSync:W,topology:X,size:H,start:q,instanceCount:N}=J;if(Q.shader.bind(Z,W),Q.geometry.bind($,Q.shader._activeProgram),K)Q.state.set(K);Q.geometry.draw(X,H,q,N??$.instanceCount)}destroy(){this._renderer=null}}var jV=A(()=>{k0();n$.extension={type:[b.WebGLSystem],name:"encoder"}});class i${constructor(J){this._renderer=J}contextChange(){let J=this._renderer.gl;this.maxTextures=J.getParameter(J.MAX_TEXTURE_IMAGE_UNITS),this.maxBatchableTextures=M$(this.maxTextures,J);let Q=this._renderer.context.webGLVersion===2;this.maxUniformBindings=Q?J.getParameter(J.MAX_UNIFORM_BUFFER_BINDINGS):0}destroy(){}}var SV=A(()=>{k0();CW();i$.extension={type:[b.WebGLSystem],name:"limits"}});class N5{constructor(){this.width=-1,this.height=-1,this.msaa=!1,this._attachedMipLevel=0,this._attachedLayer=0,this.msaaRenderBuffer=[]}}var TV=()=>{};var b7;var yV=A(()=>{l9();b7=[];b7[j8.NONE]=void 0;b7[j8.DISABLED]={stencilWriteMask:0,stencilReadMask:0};b7[j8.RENDERING_MASK_ADD]={stencilFront:{compare:"equal",passOp:"increment-clamp"},stencilBack:{compare:"equal",passOp:"increment-clamp"}};b7[j8.RENDERING_MASK_REMOVE]={stencilFront:{compare:"equal",passOp:"decrement-clamp"},stencilBack:{compare:"equal",passOp:"decrement-clamp"}};b7[j8.MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"equal",passOp:"keep"},stencilBack:{compare:"equal",passOp:"keep"}};b7[j8.INVERSE_MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"not-equal",passOp:"keep"},stencilBack:{compare:"not-equal",passOp:"keep"}}});class o${constructor(J){this._stencilCache={enabled:!1,stencilReference:0,stencilMode:j8.NONE},this._renderTargetStencilState=Object.create(null),J.renderTarget.onRenderTargetChange.add(this)}contextChange(J){this._gl=J,this._comparisonFuncMapping={always:J.ALWAYS,never:J.NEVER,equal:J.EQUAL,"not-equal":J.NOTEQUAL,less:J.LESS,"less-equal":J.LEQUAL,greater:J.GREATER,"greater-equal":J.GEQUAL},this._stencilOpsMapping={keep:J.KEEP,zero:J.ZERO,replace:J.REPLACE,invert:J.INVERT,"increment-clamp":J.INCR,"decrement-clamp":J.DECR,"increment-wrap":J.INCR_WRAP,"decrement-wrap":J.DECR_WRAP},this.resetState()}onRenderTargetChange(J){if(this._activeRenderTarget===J)return;this._activeRenderTarget=J;let Q=this._renderTargetStencilState[J.uid];if(!Q)Q=this._renderTargetStencilState[J.uid]={stencilMode:j8.DISABLED,stencilReference:0};this.setStencilMode(Q.stencilMode,Q.stencilReference)}resetState(){this._stencilCache.enabled=!1,this._stencilCache.stencilMode=j8.NONE,this._stencilCache.stencilReference=0}setStencilMode(J,Q){let $=this._renderTargetStencilState[this._activeRenderTarget.uid],Z=this._gl,K=b7[J],W=this._stencilCache;if($.stencilMode=J,$.stencilReference=Q,J===j8.DISABLED){if(this._stencilCache.enabled)this._stencilCache.enabled=!1,Z.disable(Z.STENCIL_TEST);return}if(!this._stencilCache.enabled)this._stencilCache.enabled=!0,Z.enable(Z.STENCIL_TEST);if(J!==W.stencilMode||W.stencilReference!==Q)W.stencilMode=J,W.stencilReference=Q,Z.stencilFunc(this._comparisonFuncMapping[K.stencilBack.compare],Q,255),Z.stencilOp(Z.KEEP,Z.KEEP,this._stencilOpsMapping[K.stencilBack.passOp])}}var bV=A(()=>{k0();yV();l9();o$.extension={type:[b.WebGLSystem],name:"stencil"}});class Y5{constructor(J){this._syncFunctionHash=Object.create(null),this._adaptor=J,this._systemCheck()}_systemCheck(){if(!z$())throw Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}ensureUniformGroup(J){let Q=this.getUniformGroupData(J);J.buffer||(J.buffer=new C6({data:new Float32Array(Q.layout.size/4),usage:M8.UNIFORM|M8.COPY_DST}))}getUniformGroupData(J){return this._syncFunctionHash[J._signature]||this._initUniformGroup(J)}_initUniformGroup(J){let Q=J._signature,$=this._syncFunctionHash[Q];if(!$){let Z=Object.keys(J.uniformStructures).map((X)=>J.uniformStructures[X]),K=this._adaptor.createUboElements(Z),W=this._generateUboSync(K.uboElements);$=this._syncFunctionHash[Q]={layout:K,syncFunction:W}}return this._syncFunctionHash[Q]}_generateUboSync(J){return this._adaptor.generateUboSync(J)}syncUniformGroup(J,Q,$){let Z=this.getUniformGroupData(J);J.buffer||(J.buffer=new C6({data:new Float32Array(Z.layout.size/4),usage:M8.UNIFORM|M8.COPY_DST}));let K=null;if(!Q)Q=J.buffer.data,K=J.buffer.dataInt32;return $||($=0),Z.syncFunction(J.uniforms,Q,K,$),!0}updateUniformGroup(J){if(J.isStatic&&!J._dirtyId)return!1;J._dirtyId=0;let Q=this.syncUniformGroup(J);return J.buffer.update(),Q}destroy(){this._syncFunctionHash=null}}var vV=A(()=>{LW();g9();dJ()});function fV(J){let Q=J.map((W)=>({data:W,offset:0,size:0})),$=16,Z=0,K=0;for(let W=0;W<Q.length;W++){let X=Q[W];if(Z=U5[X.data.type],!Z)throw Error(`Unknown type ${X.data.type}`);if(X.data.size>1)Z=Math.max(Z,16)*X.data.size;let H=Z===12?16:Z;X.size=Z;let q=K%16;if(q>0&&16-q<H)K+=(16-q)%16;else K+=(Z-q%Z)%Z;X.offset=K,K+=Z}return K=Math.ceil(K/16)*16,{uboElements:Q,size:K}}var U5;var V5=A(()=>{U5={f32:4,i32:4,"vec2<f32>":8,"vec3<f32>":12,"vec4<f32>":16,"vec2<i32>":8,"vec3<i32>":12,"vec4<i32>":16,"mat2x2<f32>":32,"mat3x3<f32>":48,"mat4x4<f32>":64}});var U7;var O5=A(()=>{U7=[{type:"mat3x3<f32>",test:(J)=>{return J.value.a!==void 0},ubo:`
            var matrix = uv[name].toArray(true);
            data[offset] = matrix[0];
            data[offset + 1] = matrix[1];
            data[offset + 2] = matrix[2];
            data[offset + 4] = matrix[3];
            data[offset + 5] = matrix[4];
            data[offset + 6] = matrix[5];
            data[offset + 8] = matrix[6];
            data[offset + 9] = matrix[7];
            data[offset + 10] = matrix[8];
        `,uniform:`
            gl.uniformMatrix3fv(ud[name].location, false, uv[name].toArray(true));
        `},{type:"vec4<f32>",test:(J)=>J.type==="vec4<f32>"&&J.size===1&&J.value.width!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
            data[offset + 2] = v.width;
            data[offset + 3] = v.height;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height) {
                cv[0] = v.x;
                cv[1] = v.y;
                cv[2] = v.width;
                cv[3] = v.height;
                gl.uniform4f(ud[name].location, v.x, v.y, v.width, v.height);
            }
        `},{type:"vec2<f32>",test:(J)=>J.type==="vec2<f32>"&&J.size===1&&J.value.x!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y) {
                cv[0] = v.x;
                cv[1] = v.y;
                gl.uniform2f(ud[name].location, v.x, v.y);
            }
        `},{type:"vec4<f32>",test:(J)=>J.type==="vec4<f32>"&&J.size===1&&J.value.red!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
            data[offset + 3] = v.alpha;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                cv[3] = v.alpha;
                gl.uniform4f(ud[name].location, v.red, v.green, v.blue, v.alpha);
            }
        `},{type:"vec3<f32>",test:(J)=>J.type==="vec3<f32>"&&J.size===1&&J.value.red!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                gl.uniform3f(ud[name].location, v.red, v.green, v.blue);
            }
        `}]});function hV(J,Q,$,Z){let K=[`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `],W=0;for(let H=0;H<J.length;H++){let q=J[H],N=q.data.name,Y=!1,U=0;for(let V=0;V<U7.length;V++)if(U7[V].test(q.data)){U=q.offset/4,K.push(`name = "${N}";`,`offset += ${U-W};`,U7[V][Q]||U7[V].ubo),Y=!0;break}if(!Y)if(q.data.size>1)U=q.offset/4,K.push($(q,U-W));else{let V=Z[q.data.type];U=q.offset/4,K.push(`
                    v = uv.${N};
                    offset += ${U-W};
                    ${V};
                `)}W=U}let X=K.join(`
`);return Function("uv","data","dataInt32","offset",X)}var xV=A(()=>{O5()});function iJ(J,Q){return`
        for (let i = 0; i < ${J*Q}; i++) {
            data[offset + (((i / ${J})|0) * 4) + (i % ${J})] = v[i];
        }
    `}var F5,Iv;var gV=A(()=>{F5={f32:`
        data[offset] = v;`,i32:`
        dataInt32[offset] = v;`,"vec2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];`,"vec3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,"vec4<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,"vec2<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];`,"vec3<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];`,"vec4<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];
        dataInt32[offset + 3] = v[3];`,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,"mat3x3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,"mat4x4<f32>":`
        for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,"mat3x2<f32>":iJ(3,2),"mat4x2<f32>":iJ(4,2),"mat2x3<f32>":iJ(2,3),"mat4x3<f32>":iJ(4,3),"mat2x4<f32>":iJ(2,4),"mat3x4<f32>":iJ(3,4)},Iv={...F5,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `}});function pV(J,Q){let $=Math.max(U5[J.data.type]/16,1),Z=J.data.value.length/J.data.size,K=(4-Z%4)%4,W=J.data.type.indexOf("i32")>=0?"dataInt32":"data";return`
        v = uv.${J.data.name};
        offset += ${Q};

        arrayOffset = offset;

        t = 0;

        for(var i=0; i < ${J.data.size*$}; i++)
        {
            for(var j = 0; j < ${Z}; j++)
            {
                ${W}[arrayOffset++] = v[t++];
            }
            ${K!==0?`arrayOffset += ${K};`:""}
        }
    `}var mV=A(()=>{V5()});function dV(J){return hV(J,"uboStd40",pV,F5)}var lV=A(()=>{xV();gV();mV()});var a$;var cV=A(()=>{k0();vV();V5();lV();a$=class a$ extends Y5{constructor(){super({createUboElements:fV,generateUboSync:dV})}};a$.extension={type:[b.WebGLSystem],name:"ubo"}});class z5{constructor(){this._clearColorCache=[0,0,0,0],this._viewPortCache=new G8}init(J,Q){this._renderer=J,this._renderTargetSystem=Q,J.runners.contextChange.add(this)}contextChange(){this._clearColorCache=[0,0,0,0],this._viewPortCache=new G8;let J=this._renderer.gl;this._drawBuffersCache=[];for(let Q=1;Q<=16;Q++)this._drawBuffersCache[Q]=Array.from({length:Q},($,Z)=>J.COLOR_ATTACHMENT0+Z)}copyToTexture(J,Q,$,Z,K){let W=this._renderTargetSystem,X=this._renderer,H=W.getGpuRenderTarget(J),q=X.gl;return this.finishRenderPass(J),q.bindFramebuffer(q.FRAMEBUFFER,H.resolveTargetFramebuffer),X.texture.bind(Q,0),q.copyTexSubImage2D(q.TEXTURE_2D,0,K.x,K.y,$.x,$.y,Z.width,Z.height),Q}startRenderPass(J,Q=!0,$,Z,K=0,W=0){let X=this._renderTargetSystem,H=J.colorTexture,q=X.getGpuRenderTarget(J);if(W!==0&&this._renderer.context.webGLVersion<2)throw Error("[RenderTargetSystem] Rendering to array layers requires WebGL2.");if(K>0){if(q.msaa)throw Error("[RenderTargetSystem] Rendering to mip levels is not supported with MSAA render targets.");if(this._renderer.context.webGLVersion<2)throw Error("[RenderTargetSystem] Rendering to mip levels requires WebGL2.")}let N=Z.y;if(J.isRoot)N=H.pixelHeight-Z.height-Z.y;J.colorTextures.forEach((V)=>{this._renderer.texture.unbind(V)});let Y=this._renderer.gl;if(Y.bindFramebuffer(Y.FRAMEBUFFER,q.framebuffer),!J.isRoot&&(q._attachedMipLevel!==K||q._attachedLayer!==W))J.colorTextures.forEach((V,z)=>{let D=this._renderer.texture.getGlSource(V);if(D.target===Y.TEXTURE_2D){if(W!==0)throw Error("[RenderTargetSystem] layer must be 0 when rendering to 2D textures in WebGL.");Y.framebufferTexture2D(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0+z,Y.TEXTURE_2D,D.texture,K)}else if(D.target===Y.TEXTURE_2D_ARRAY){if(this._renderer.context.webGLVersion<2)throw Error("[RenderTargetSystem] Rendering to 2D array textures requires WebGL2.");Y.framebufferTextureLayer(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0+z,D.texture,K,W)}else if(D.target===Y.TEXTURE_CUBE_MAP){if(W<0||W>5)throw Error("[RenderTargetSystem] Cube map layer must be between 0 and 5.");Y.framebufferTexture2D(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0+z,Y.TEXTURE_CUBE_MAP_POSITIVE_X+W,D.texture,K)}else throw Error("[RenderTargetSystem] Unsupported texture target for render-to-layer in WebGL.")}),q._attachedMipLevel=K,q._attachedLayer=W;if(J.colorTextures.length>1)this._setDrawBuffers(J,Y);let U=this._viewPortCache;if(U.x!==Z.x||U.y!==N||U.width!==Z.width||U.height!==Z.height)U.x=Z.x,U.y=N,U.width=Z.width,U.height=Z.height,Y.viewport(Z.x,N,Z.width,Z.height);if(!q.depthStencilRenderBuffer&&(J.stencil||J.depth))this._initStencil(q);this.clear(J,Q,$)}finishRenderPass(J){let $=this._renderTargetSystem.getGpuRenderTarget(J);if(!$.msaa)return;let Z=this._renderer.gl;Z.bindFramebuffer(Z.FRAMEBUFFER,$.resolveTargetFramebuffer),Z.bindFramebuffer(Z.READ_FRAMEBUFFER,$.framebuffer),Z.blitFramebuffer(0,0,$.width,$.height,0,0,$.width,$.height,Z.COLOR_BUFFER_BIT,Z.NEAREST),Z.bindFramebuffer(Z.FRAMEBUFFER,$.framebuffer)}initGpuRenderTarget(J){let $=this._renderer.gl,Z=new N5;if(Z._attachedMipLevel=0,Z._attachedLayer=0,J.colorTexture instanceof k6)return this._renderer.context.ensureCanvasSize(J.colorTexture.resource),Z.framebuffer=null,Z;return this._initColor(J,Z),$.bindFramebuffer($.FRAMEBUFFER,null),Z}destroyGpuRenderTarget(J){let Q=this._renderer.gl;if(J.framebuffer)Q.deleteFramebuffer(J.framebuffer),J.framebuffer=null;if(J.resolveTargetFramebuffer)Q.deleteFramebuffer(J.resolveTargetFramebuffer),J.resolveTargetFramebuffer=null;if(J.depthStencilRenderBuffer)Q.deleteRenderbuffer(J.depthStencilRenderBuffer),J.depthStencilRenderBuffer=null;J.msaaRenderBuffer.forEach(($)=>{Q.deleteRenderbuffer($)}),J.msaaRenderBuffer=null}clear(J,Q,$,Z,K=0,W=0){if(!Q)return;if(W!==0)throw Error("[RenderTargetSystem] Clearing array layers is not supported in WebGL renderer.");let X=this._renderTargetSystem;if(typeof Q==="boolean")Q=Q?_6.ALL:_6.NONE;let H=this._renderer.gl;if(Q&_6.COLOR){$??($=X.defaultClearColor);let q=this._clearColorCache,N=$;if(q[0]!==N[0]||q[1]!==N[1]||q[2]!==N[2]||q[3]!==N[3])q[0]=N[0],q[1]=N[1],q[2]=N[2],q[3]=N[3],H.clearColor(N[0],N[1],N[2],N[3])}H.clear(Q)}resizeGpuRenderTarget(J){if(J.isRoot)return;let $=this._renderTargetSystem.getGpuRenderTarget(J);if(this._resizeColor(J,$),J.stencil||J.depth)this._resizeStencil($)}_initColor(J,Q){let $=this._renderer,Z=$.gl,K=Z.createFramebuffer();if(Q.resolveTargetFramebuffer=K,Z.bindFramebuffer(Z.FRAMEBUFFER,K),Q.width=J.colorTexture.source.pixelWidth,Q.height=J.colorTexture.source.pixelHeight,J.colorTextures.forEach((X,H)=>{let q=X.source;if(q.antialias)if($.context.supports.msaa)Q.msaa=!0;else v0("[RenderTexture] Antialiasing on textures is not supported in WebGL1");$.texture.bindSource(q,0);let N=$.texture.getGlSource(q),Y=N.texture;if(N.target===Z.TEXTURE_2D)Z.framebufferTexture2D(Z.FRAMEBUFFER,Z.COLOR_ATTACHMENT0+H,Z.TEXTURE_2D,Y,0);else if(N.target===Z.TEXTURE_2D_ARRAY){if($.context.webGLVersion<2)throw Error("[RenderTargetSystem] TEXTURE_2D_ARRAY requires WebGL2.");Z.framebufferTextureLayer(Z.FRAMEBUFFER,Z.COLOR_ATTACHMENT0+H,Y,0,0)}else if(N.target===Z.TEXTURE_CUBE_MAP)Z.framebufferTexture2D(Z.FRAMEBUFFER,Z.COLOR_ATTACHMENT0+H,Z.TEXTURE_CUBE_MAP_POSITIVE_X,Y,0);else throw Error("[RenderTargetSystem] Unsupported texture target for framebuffer attachment.")}),Q.msaa){let X=Z.createFramebuffer();Q.framebuffer=X,Z.bindFramebuffer(Z.FRAMEBUFFER,X),J.colorTextures.forEach((H,q)=>{let N=Z.createRenderbuffer();Q.msaaRenderBuffer[q]=N})}else Q.framebuffer=K;this._resizeColor(J,Q)}_resizeColor(J,Q){let $=J.colorTexture.source;if(Q.width=$.pixelWidth,Q.height=$.pixelHeight,Q._attachedMipLevel=0,Q._attachedLayer=0,J.colorTextures.forEach((Z,K)=>{if(K===0)return;Z.source.resize($.width,$.height,$._resolution)}),Q.msaa){let Z=this._renderer,K=Z.gl,W=Q.framebuffer;K.bindFramebuffer(K.FRAMEBUFFER,W),J.colorTextures.forEach((X,H)=>{let q=X.source;Z.texture.bindSource(q,0);let Y=Z.texture.getGlSource(q).internalFormat,U=Q.msaaRenderBuffer[H];K.bindRenderbuffer(K.RENDERBUFFER,U),K.renderbufferStorageMultisample(K.RENDERBUFFER,4,Y,q.pixelWidth,q.pixelHeight),K.framebufferRenderbuffer(K.FRAMEBUFFER,K.COLOR_ATTACHMENT0+H,K.RENDERBUFFER,U)})}}_initStencil(J){if(J.framebuffer===null)return;let Q=this._renderer.gl,$=Q.createRenderbuffer();J.depthStencilRenderBuffer=$,Q.bindRenderbuffer(Q.RENDERBUFFER,$),Q.framebufferRenderbuffer(Q.FRAMEBUFFER,Q.DEPTH_STENCIL_ATTACHMENT,Q.RENDERBUFFER,$),this._resizeStencil(J)}_resizeStencil(J){let Q=this._renderer.gl;if(Q.bindRenderbuffer(Q.RENDERBUFFER,J.depthStencilRenderBuffer),J.msaa)Q.renderbufferStorageMultisample(Q.RENDERBUFFER,4,Q.DEPTH24_STENCIL8,J.width,J.height);else Q.renderbufferStorage(Q.RENDERBUFFER,this._renderer.context.webGLVersion===2?Q.DEPTH24_STENCIL8:Q.DEPTH_STENCIL,J.width,J.height)}prerender(J){let Q=J.colorTexture.resource;if(this._renderer.context.multiView&&k6.test(Q))this._renderer.context.ensureCanvasSize(Q)}postrender(J){if(!this._renderer.context.multiView)return;if(k6.test(J.colorTexture.resource)){let Q=this._renderer.context.canvas,$=J.colorTexture;$.context2D.drawImage(Q,0,$.pixelHeight-Q.height)}}_setDrawBuffers(J,Q){let $=J.colorTextures.length,Z=this._drawBuffersCache[$];if(this._renderer.context.webGLVersion===1){let K=this._renderer.context.extensions.drawBuffers;if(!K)v0("[RenderTexture] This WebGL1 context does not support rendering to multiple targets");else K.drawBuffersWEBGL(Z)}else Q.drawBuffers(Z)}}var uV=A(()=>{_7();s8();v9();m9();TV()});var r$;var sV=A(()=>{k0();FV();uV();r$=class r$ extends W5{constructor(J){super(J);this.adaptor=new z5,this.adaptor.init(J,this)}};r$.extension={type:[b.WebGLSystem],name:"renderTarget"}});var QQ;var D5=A(()=>{O6();W6();QQ=class QQ extends _8{constructor({buffer:J,offset:Q,size:$}){super();this.uid=i0("buffer"),this._resourceType="bufferResource",this._touched=0,this._resourceId=i0("resource"),this._bufferResource=!0,this.destroyed=!1,this.buffer=J,this.offset=Q|0,this.size=$,this.buffer.on("change",this.onBufferChange,this)}onBufferChange(){this._resourceId=i0("resource"),this.emit("change",this)}destroy(J=!1){if(this.destroyed=!0,J)this.buffer.destroy();this.emit("change",this),this.buffer=null,this.removeAllListeners()}}});function nV(J,Q){let $=[],Z=[`
        var g = s.groups;
        var sS = r.shader;
        var p = s.glProgram;
        var ugS = r.uniformGroup;
        var resources;
    `],K=!1,W=0,X=Q._getProgramData(J.glProgram);for(let q in J.groups){let N=J.groups[q];$.push(`
            resources = g[${q}].resources;
        `);for(let Y in N.resources){let U=N.resources[Y];if(U instanceof o8)if(U.ubo){let V=J._uniformBindMap[q][Number(Y)];$.push(`
                        sS.bindUniformBlock(
                            resources[${Y}],
                            '${V}',
                            ${J.glProgram._uniformBlockData[V].index}
                        );
                    `)}else $.push(`
                        ugS.updateUniformGroup(resources[${Y}], p, sD);
                    `);else if(U instanceof QQ){let V=J._uniformBindMap[q][Number(Y)];$.push(`
                    sS.bindUniformBlock(
                        resources[${Y}],
                        '${V}',
                        ${J.glProgram._uniformBlockData[V].index}
                    );
                `)}else if(U instanceof Q8){let V=J._uniformBindMap[q][Y],z=X.uniformData[V];if(z){if(!K)K=!0,Z.push(`
                        var tS = r.texture;
                        `);Q._gl.uniform1i(z.location,W),$.push(`
                        tS.bind(resources[${Y}], ${W});
                    `),W++}}}}let H=[...Z,...$].join(`
`);return Function("r","s","sD",H)}var iV=A(()=>{D5();Y7();X6()});class k5{constructor(J,Q){this.program=J,this.uniformData=Q,this.uniformGroups={},this.uniformDirtyGroups={},this.uniformBlockBindings={}}destroy(){this.uniformData=null,this.uniformGroups=null,this.uniformDirtyGroups=null,this.uniformBlockBindings=null,this.program=null}}var oV=()=>{};function M5(J,Q,$){let Z=J.createShader(Q);return J.shaderSource(Z,$),J.compileShader(Z),Z}var aV=()=>{};function w5(J){let Q=Array(J);for(let $=0;$<Q.length;$++)Q[$]=!1;return Q}function t$(J,Q){switch(J){case"float":return 0;case"vec2":return new Float32Array(2*Q);case"vec3":return new Float32Array(3*Q);case"vec4":return new Float32Array(4*Q);case"int":case"uint":case"sampler2D":case"sampler2DArray":return 0;case"ivec2":return new Int32Array(2*Q);case"ivec3":return new Int32Array(3*Q);case"ivec4":return new Int32Array(4*Q);case"uvec2":return new Uint32Array(2*Q);case"uvec3":return new Uint32Array(3*Q);case"uvec4":return new Uint32Array(4*Q);case"bool":return!1;case"bvec2":return w5(2*Q);case"bvec3":return w5(3*Q);case"bvec4":return w5(4*Q);case"mat2":return new Float32Array([1,0,0,1]);case"mat3":return new Float32Array([1,0,0,0,1,0,0,0,1]);case"mat4":return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}return null}var I5=()=>{};function L5(J,Q){if(!e$){let $=Object.keys(rV);e$={};for(let Z=0;Z<$.length;++Z){let K=$[Z];e$[J[K]]=rV[K]}}return e$[Q]}function tV(J,Q){let $=L5(J,Q);return o4[$]||"float32"}var e$=null,rV,o4;var G5=A(()=>{rV={FLOAT:"float",FLOAT_VEC2:"vec2",FLOAT_VEC3:"vec3",FLOAT_VEC4:"vec4",INT:"int",INT_VEC2:"ivec2",INT_VEC3:"ivec3",INT_VEC4:"ivec4",UNSIGNED_INT:"uint",UNSIGNED_INT_VEC2:"uvec2",UNSIGNED_INT_VEC3:"uvec3",UNSIGNED_INT_VEC4:"uvec4",BOOL:"bool",BOOL_VEC2:"bvec2",BOOL_VEC3:"bvec3",BOOL_VEC4:"bvec4",FLOAT_MAT2:"mat2",FLOAT_MAT3:"mat3",FLOAT_MAT4:"mat4",SAMPLER_2D:"sampler2D",INT_SAMPLER_2D:"sampler2D",UNSIGNED_INT_SAMPLER_2D:"sampler2D",SAMPLER_CUBE:"samplerCube",INT_SAMPLER_CUBE:"samplerCube",UNSIGNED_INT_SAMPLER_CUBE:"samplerCube",SAMPLER_2D_ARRAY:"sampler2DArray",INT_SAMPLER_2D_ARRAY:"sampler2DArray",UNSIGNED_INT_SAMPLER_2D_ARRAY:"sampler2DArray"},o4={float:"float32",vec2:"float32x2",vec3:"float32x3",vec4:"float32x4",int:"sint32",ivec2:"sint32x2",ivec3:"sint32x3",ivec4:"sint32x4",uint:"uint32",uvec2:"uint32x2",uvec3:"uint32x3",uvec4:"uint32x4",bool:"uint32",bvec2:"uint32x2",bvec3:"uint32x3",bvec4:"uint32x4"}});function eV(J,Q,$=!1){let Z={},K=Q.getProgramParameter(J,Q.ACTIVE_ATTRIBUTES);for(let X=0;X<K;X++){let H=Q.getActiveAttrib(J,X);if(H.name.startsWith("gl_"))continue;let q=tV(Q,H.type);Z[H.name]={location:0,format:q,stride:q7(q).stride,offset:0,instance:!1,start:0}}let W=Object.keys(Z);if($){W.sort((X,H)=>X>H?1:-1);for(let X=0;X<W.length;X++)Z[W[X]].location=X,Q.bindAttribLocation(J,X,W[X]);Q.linkProgram(J)}else for(let X=0;X<W.length;X++)Z[W[X]].location=Q.getAttribLocation(J,W[X]);return Z}var JO=A(()=>{h9();G5()});function QO(J,Q){if(!Q.ACTIVE_UNIFORM_BLOCKS)return{};let $={},Z=Q.getProgramParameter(J,Q.ACTIVE_UNIFORM_BLOCKS);for(let K=0;K<Z;K++){let W=Q.getActiveUniformBlockName(J,K),X=Q.getUniformBlockIndex(J,W),H=Q.getActiveUniformBlockParameter(J,K,Q.UNIFORM_BLOCK_DATA_SIZE);$[W]={name:W,index:X,size:H}}return $}var $O=()=>{};function ZO(J,Q){let $={},Z=Q.getProgramParameter(J,Q.ACTIVE_UNIFORMS);for(let K=0;K<Z;K++){let W=Q.getActiveUniform(J,K),X=W.name.replace(/\[.*?\]$/,""),H=!!W.name.match(/\[.*?\]$/),q=L5(Q,W.type);$[X]={name:X,index:K,type:q,size:W.size,isArray:H,value:t$(q,W.size)}}return $}var KO=A(()=>{I5();G5()});function WO(J,Q){let $=J.getShaderSource(Q).split(`
`).map((N,Y)=>`${Y}: ${N}`),Z=J.getShaderInfoLog(Q),K=Z.split(`
`),W={},X=K.map((N)=>parseFloat(N.replace(/^ERROR\: 0\:([\d]+)\:.*$/,"$1"))).filter((N)=>{if(N&&!W[N])return W[N]=!0,!0;return!1}),H=[""];X.forEach((N)=>{$[N-1]=`%c${$[N-1]}%c`,H.push("background: #FF0000; color:#FFFFFF; font-size: 10px","font-size: 10px")});let q=$.join(`
`);H[0]=q,console.error(Z),console.groupCollapsed("click to view full shader code"),console.warn(...H),console.groupEnd()}function XO(J,Q,$,Z){if(!J.getProgramParameter(Q,J.LINK_STATUS)){if(!J.getShaderParameter($,J.COMPILE_STATUS))WO(J,$);if(!J.getShaderParameter(Z,J.COMPILE_STATUS))WO(J,Z);if(console.error("PixiJS Error: Could not initialize shader."),J.getProgramInfoLog(Q)!=="")console.warn("PixiJS Warning: gl.getProgramInfoLog()",J.getProgramInfoLog(Q))}}var HO=()=>{};function qO(J,Q){let $=M5(J,J.VERTEX_SHADER,Q.vertex),Z=M5(J,J.FRAGMENT_SHADER,Q.fragment),K=J.createProgram();J.attachShader(K,$),J.attachShader(K,Z);let W=Q.transformFeedbackVaryings;if(W)if(typeof J.transformFeedbackVaryings!=="function")v0("TransformFeedback is not supported but TransformFeedbackVaryings are given.");else J.transformFeedbackVaryings(K,W.names,W.bufferMode==="separate"?J.SEPARATE_ATTRIBS:J.INTERLEAVED_ATTRIBS);if(J.linkProgram(K),!J.getProgramParameter(K,J.LINK_STATUS))XO(J,K,$,Z);Q._attributeData=eV(K,J,!/^[ \t]*#[ \t]*version[ \t]+300[ \t]+es[ \t]*$/m.test(Q.vertex)),Q._uniformData=ZO(K,J),Q._uniformBlockData=QO(K,J),J.deleteShader($),J.deleteShader(Z);let X={};for(let q in Q._uniformData){let N=Q._uniformData[q];X[q]={location:J.getUniformLocation(K,q),value:t$(N.type,N.size)}}return new k5(K,X)}var NO=A(()=>{s8();oV();aV();I5();JO();$O();KO();HO()});class QZ{constructor(J){this._activeProgram=null,this._programDataHash=Object.create(null),this._shaderSyncFunctions=Object.create(null),this._renderer=J}contextChange(J){this._gl=J,this._programDataHash=Object.create(null),this._shaderSyncFunctions=Object.create(null),this._activeProgram=null}bind(J,Q){if(this._setProgram(J.glProgram),Q)return;JZ.textureCount=0,JZ.blockIndex=0;let $=this._shaderSyncFunctions[J.glProgram._key];if(!$)$=this._shaderSyncFunctions[J.glProgram._key]=this._generateShaderSync(J,this);this._renderer.buffer.nextBindBase(!!J.glProgram.transformFeedbackVaryings),$(this._renderer,J,JZ)}updateUniformGroup(J){this._renderer.uniformGroup.updateUniformGroup(J,this._activeProgram,JZ)}bindUniformBlock(J,Q,$=0){let Z=this._renderer.buffer,K=this._getProgramData(this._activeProgram),W=J._bufferResource;if(!W)this._renderer.ubo.updateUniformGroup(J);let X=J.buffer,H=Z.updateBuffer(X),q=Z.freeLocationForBufferBase(H);if(W){let{offset:Y,size:U}=J;if(Y===0&&U===X.data.byteLength)Z.bindBufferBase(H,q);else Z.bindBufferRange(H,q,Y)}else if(Z.getLastBindBaseLocation(H)!==q)Z.bindBufferBase(H,q);let N=this._activeProgram._uniformBlockData[Q].index;if(K.uniformBlockBindings[$]===q)return;K.uniformBlockBindings[$]=q,this._renderer.gl.uniformBlockBinding(K.program,N,q)}_setProgram(J){if(this._activeProgram===J)return;this._activeProgram=J;let Q=this._getProgramData(J);this._gl.useProgram(Q.program)}_getProgramData(J){return this._programDataHash[J._key]||this._createProgramData(J)}_createProgramData(J){let Q=J._key;return this._programDataHash[Q]=qO(this._gl,J),this._programDataHash[Q]}destroy(){for(let J of Object.keys(this._programDataHash))this._programDataHash[J].destroy();this._programDataHash=null,this._shaderSyncFunctions=null,this._activeProgram=null,this._renderer=null,this._gl=null}_generateShaderSync(J,Q){return nV(J,Q)}resetState(){this._activeProgram=null}}var JZ;var YO=A(()=>{k0();iV();NO();JZ={textureCount:0,blockIndex:0};QZ.extension={type:[b.WebGLSystem],name:"shader"}});var UO,VO;var OO=A(()=>{UO={f32:`if (cv !== v) {
            cu.value = v;
            gl.uniform1f(location, v);
        }`,"vec2<f32>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2f(location, v[0], v[1]);
        }`,"vec3<f32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3f(location, v[0], v[1], v[2]);
        }`,"vec4<f32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4f(location, v[0], v[1], v[2], v[3]);
        }`,i32:`if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,"vec2<i32>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2i(location, v[0], v[1]);
        }`,"vec3<i32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3i(location, v[0], v[1], v[2]);
        }`,"vec4<i32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }`,u32:`if (cv !== v) {
            cu.value = v;
            gl.uniform1ui(location, v);
        }`,"vec2<u32>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2ui(location, v[0], v[1]);
        }`,"vec3<u32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3ui(location, v[0], v[1], v[2]);
        }`,"vec4<u32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4ui(location, v[0], v[1], v[2], v[3]);
        }`,bool:`if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,"vec2<bool>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2i(location, v[0], v[1]);
        }`,"vec3<bool>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3i(location, v[0], v[1], v[2]);
        }`,"vec4<bool>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }`,"mat2x2<f32>":"gl.uniformMatrix2fv(location, false, v);","mat3x3<f32>":"gl.uniformMatrix3fv(location, false, v);","mat4x4<f32>":"gl.uniformMatrix4fv(location, false, v);"},VO={f32:"gl.uniform1fv(location, v);","vec2<f32>":"gl.uniform2fv(location, v);","vec3<f32>":"gl.uniform3fv(location, v);","vec4<f32>":"gl.uniform4fv(location, v);","mat2x2<f32>":"gl.uniformMatrix2fv(location, false, v);","mat3x3<f32>":"gl.uniformMatrix3fv(location, false, v);","mat4x4<f32>":"gl.uniformMatrix4fv(location, false, v);",i32:"gl.uniform1iv(location, v);","vec2<i32>":"gl.uniform2iv(location, v);","vec3<i32>":"gl.uniform3iv(location, v);","vec4<i32>":"gl.uniform4iv(location, v);",u32:"gl.uniform1iv(location, v);","vec2<u32>":"gl.uniform2iv(location, v);","vec3<u32>":"gl.uniform3iv(location, v);","vec4<u32>":"gl.uniform4iv(location, v);",bool:"gl.uniform1iv(location, v);","vec2<bool>":"gl.uniform2iv(location, v);","vec3<bool>":"gl.uniform3iv(location, v);","vec4<bool>":"gl.uniform4iv(location, v);"}});function FO(J,Q){let $=[`
        var v = null;
        var cv = null;
        var cu = null;
        var t = 0;
        var gl = renderer.gl;
        var name = null;
    `];for(let Z in J.uniforms){if(!Q[Z]){if(J.uniforms[Z]instanceof o8)if(J.uniforms[Z].ubo)$.push(`
                        renderer.shader.bindUniformBlock(uv.${Z}, "${Z}");
                    `);else $.push(`
                        renderer.shader.updateUniformGroup(uv.${Z});
                    `);else if(J.uniforms[Z]instanceof QQ)$.push(`
                        renderer.shader.bindBufferResource(uv.${Z}, "${Z}");
                    `);continue}let K=J.uniformStructures[Z],W=!1;for(let X=0;X<U7.length;X++){let H=U7[X];if(K.type===H.type&&H.test(K)){$.push(`name = "${Z}";`,U7[X].uniform),W=!0;break}}if(!W){let H=(K.size===1?UO:VO)[K.type].replace("location",`ud["${Z}"].location`);$.push(`
            cu = ud["${Z}"];
            cv = cu.value;
            v = uv["${Z}"];
            ${H};`)}}return Function("ud","uv","renderer","syncData",$.join(`
`))}var zO=A(()=>{D5();Y7();O5();OO()});class $Z{constructor(J){this._cache={},this._uniformGroupSyncHash={},this._renderer=J,this.gl=null,this._cache={}}contextChange(J){this.gl=J}updateUniformGroup(J,Q,$){let Z=this._renderer.shader._getProgramData(Q);if(!J.isStatic||J._dirtyId!==Z.uniformDirtyGroups[J.uid])Z.uniformDirtyGroups[J.uid]=J._dirtyId,this._getUniformSyncFunction(J,Q)(Z.uniformData,J.uniforms,this._renderer,$)}_getUniformSyncFunction(J,Q){return this._uniformGroupSyncHash[J._signature]?.[Q._key]||this._createUniformSyncFunction(J,Q)}_createUniformSyncFunction(J,Q){let $=this._uniformGroupSyncHash[J._signature]||(this._uniformGroupSyncHash[J._signature]={}),Z=this._getSignature(J,Q._uniformData,"u");if(!this._cache[Z])this._cache[Z]=this._generateUniformsSync(J,Q._uniformData);return $[Q._key]=this._cache[Z],$[Q._key]}_generateUniformsSync(J,Q){return FO(J,Q)}_getSignature(J,Q,$){let Z=J.uniforms,K=[`${$}-`];for(let W in Z)if(K.push(W),Q[W])K.push(Q[W].type);return K.join("-")}destroy(){this._renderer=null,this._cache=null}}var DO=A(()=>{k0();zO();$Z.extension={type:[b.WebGLSystem],name:"uniformGroup"}});function kO(J){let Q={};if(Q.normal=[J.ONE,J.ONE_MINUS_SRC_ALPHA],Q.add=[J.ONE,J.ONE],Q.multiply=[J.DST_COLOR,J.ONE_MINUS_SRC_ALPHA,J.ONE,J.ONE_MINUS_SRC_ALPHA],Q.screen=[J.ONE,J.ONE_MINUS_SRC_COLOR,J.ONE,J.ONE_MINUS_SRC_ALPHA],Q.none=[0,0],Q["normal-npm"]=[J.SRC_ALPHA,J.ONE_MINUS_SRC_ALPHA,J.ONE,J.ONE_MINUS_SRC_ALPHA],Q["add-npm"]=[J.SRC_ALPHA,J.ONE,J.ONE,J.ONE],Q["screen-npm"]=[J.SRC_ALPHA,J.ONE_MINUS_SRC_COLOR,J.ONE,J.ONE_MINUS_SRC_ALPHA],Q.erase=[J.ZERO,J.ONE_MINUS_SRC_ALPHA],!(J instanceof F8.get().getWebGLRenderingContext()))Q.min=[J.ONE,J.ONE,J.ONE,J.ONE,J.MIN,J.MIN],Q.max=[J.ONE,J.ONE,J.ONE,J.ONE,J.MAX,J.MAX];else{let Z=J.getExtension("EXT_blend_minmax");if(Z)Q.min=[J.ONE,J.ONE,J.ONE,J.ONE,Z.MIN_EXT,Z.MIN_EXT],Q.max=[J.ONE,J.ONE,J.ONE,J.ONE,Z.MAX_EXT,Z.MAX_EXT]}return Q}var MO=A(()=>{D6()});var a4=0,r4=1,t4=2,e4=3,Jk=4,Qk=5,wO=class J{constructor(Q){this._invertFrontFace=!1,this.gl=null,this.stateId=0,this.polygonOffset=0,this.blendMode="none",this._blendEq=!1,this.map=[],this.map[a4]=this.setBlend,this.map[r4]=this.setOffset,this.map[t4]=this.setCullFace,this.map[e4]=this.setDepthTest,this.map[Jk]=this.setFrontFace,this.map[Qk]=this.setDepthMask,this.checks=[],this.defaultState=a6.for2d(),Q.renderTarget.onRenderTargetChange.add(this)}onRenderTargetChange(Q){if(this._invertFrontFace=!Q.isRoot,this._cullFace)this.setFrontFace(this._frontFace);else this._frontFaceDirty=!0}contextChange(Q){this.gl=Q,this.blendModesMap=kO(Q),this.resetState()}set(Q){if(Q||(Q=this.defaultState),this.stateId!==Q.data){let $=this.stateId^Q.data,Z=0;while($){if($&1)this.map[Z].call(this,!!(Q.data&1<<Z));$>>=1,Z++}this.stateId=Q.data}for(let $=0;$<this.checks.length;$++)this.checks[$](this,Q)}forceState(Q){Q||(Q=this.defaultState);for(let $=0;$<this.map.length;$++)this.map[$].call(this,!!(Q.data&1<<$));for(let $=0;$<this.checks.length;$++)this.checks[$](this,Q);this.stateId=Q.data}setBlend(Q){this._updateCheck(J._checkBlendMode,Q),this.gl[Q?"enable":"disable"](this.gl.BLEND)}setOffset(Q){this._updateCheck(J._checkPolygonOffset,Q),this.gl[Q?"enable":"disable"](this.gl.POLYGON_OFFSET_FILL)}setDepthTest(Q){this.gl[Q?"enable":"disable"](this.gl.DEPTH_TEST)}setDepthMask(Q){this.gl.depthMask(Q)}setCullFace(Q){if(this._cullFace=Q,this.gl[Q?"enable":"disable"](this.gl.CULL_FACE),this._cullFace&&this._frontFaceDirty)this.setFrontFace(this._frontFace)}setFrontFace(Q){this._frontFace=Q,this._frontFaceDirty=!1;let $=this._invertFrontFace?!Q:Q;if(this._glFrontFace!==$)this._glFrontFace=$,this.gl.frontFace(this.gl[$?"CW":"CCW"])}setBlendMode(Q){if(!this.blendModesMap[Q])Q="normal";if(Q===this.blendMode)return;this.blendMode=Q;let $=this.blendModesMap[Q],Z=this.gl;if($.length===2)Z.blendFunc($[0],$[1]);else Z.blendFuncSeparate($[0],$[1],$[2],$[3]);if($.length===6)this._blendEq=!0,Z.blendEquationSeparate($[4],$[5]);else if(this._blendEq)this._blendEq=!1,Z.blendEquationSeparate(Z.FUNC_ADD,Z.FUNC_ADD)}setPolygonOffset(Q,$){this.gl.polygonOffset(Q,$)}resetState(){this._glFrontFace=!1,this._frontFace=!1,this._cullFace=!1,this._frontFaceDirty=!1,this._invertFrontFace=!1,this.gl.frontFace(this.gl.CCW),this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,!1),this.forceState(this.defaultState),this._blendEq=!0,this.blendMode="",this.setBlendMode("normal")}_updateCheck(Q,$){let Z=this.checks.indexOf(Q);if($&&Z===-1)this.checks.push(Q);else if(!$&&Z!==-1)this.checks.splice(Z,1)}static _checkBlendMode(Q,$){Q.setBlendMode($.blendMode)}static _checkPolygonOffset(Q,$){Q.setPolygonOffset(1,$.polygonOffset)}destroy(){this.gl=null,this.checks.length=0}},IO;var LO=A(()=>{k0();mJ();MO();wO.extension={type:[b.WebGLSystem],name:"state"};IO=wO});class B5{constructor(J){this.target=JQ.TEXTURE_2D,this._layerInitMask=0,this.texture=J,this.width=-1,this.height=-1,this.type=o0.UNSIGNED_BYTE,this.internalFormat=l$.RGBA,this.format=l$.RGBA,this.samplerType=0}destroy(){}}var GO=A(()=>{c$()});var BO;var RO=A(()=>{BO={id:"buffer",upload(J,Q,$,Z,K,W=!1){let X=K||Q.target;if(!W&&(Q.width===J.width&&Q.height===J.height))$.texSubImage2D(X,0,0,0,J.width,J.height,Q.format,Q.type,J.resource);else $.texImage2D(X,0,Q.internalFormat,J.width,J.height,0,Q.format,Q.type,J.resource);Q.width=J.width,Q.height=J.height}}});var $k,AO;var CO=A(()=>{$k={"bc1-rgba-unorm":!0,"bc1-rgba-unorm-srgb":!0,"bc2-rgba-unorm":!0,"bc2-rgba-unorm-srgb":!0,"bc3-rgba-unorm":!0,"bc3-rgba-unorm-srgb":!0,"bc4-r-unorm":!0,"bc4-r-snorm":!0,"bc5-rg-unorm":!0,"bc5-rg-snorm":!0,"bc6h-rgb-ufloat":!0,"bc6h-rgb-float":!0,"bc7-rgba-unorm":!0,"bc7-rgba-unorm-srgb":!0,"etc2-rgb8unorm":!0,"etc2-rgb8unorm-srgb":!0,"etc2-rgb8a1unorm":!0,"etc2-rgb8a1unorm-srgb":!0,"etc2-rgba8unorm":!0,"etc2-rgba8unorm-srgb":!0,"eac-r11unorm":!0,"eac-r11snorm":!0,"eac-rg11unorm":!0,"eac-rg11snorm":!0,"astc-4x4-unorm":!0,"astc-4x4-unorm-srgb":!0,"astc-5x4-unorm":!0,"astc-5x4-unorm-srgb":!0,"astc-5x5-unorm":!0,"astc-5x5-unorm-srgb":!0,"astc-6x5-unorm":!0,"astc-6x5-unorm-srgb":!0,"astc-6x6-unorm":!0,"astc-6x6-unorm-srgb":!0,"astc-8x5-unorm":!0,"astc-8x5-unorm-srgb":!0,"astc-8x6-unorm":!0,"astc-8x6-unorm-srgb":!0,"astc-8x8-unorm":!0,"astc-8x8-unorm-srgb":!0,"astc-10x5-unorm":!0,"astc-10x5-unorm-srgb":!0,"astc-10x6-unorm":!0,"astc-10x6-unorm-srgb":!0,"astc-10x8-unorm":!0,"astc-10x8-unorm-srgb":!0,"astc-10x10-unorm":!0,"astc-10x10-unorm-srgb":!0,"astc-12x10-unorm":!0,"astc-12x10-unorm-srgb":!0,"astc-12x12-unorm":!0,"astc-12x12-unorm-srgb":!0},AO={id:"compressed",upload(J,Q,$,Z,K,W){let X=K??Q.target;$.pixelStorei($.UNPACK_ALIGNMENT,4);let{pixelWidth:H,pixelHeight:q}=J,N=!!$k[J.format];for(let Y=0;Y<J.resource.length;Y++){let U=J.resource[Y];if(N)$.compressedTexImage2D(X,Y,Q.internalFormat,H,q,0,U);else $.texImage2D(X,Y,Q.internalFormat,H,q,0,Q.format,Q.type,U);H=Math.max(H>>1,1),q=Math.max(q>>1,1)}}}});function EO(J){return{id:"cube",upload(Q,$,Z,K){let W=Q.faces;for(let X=0;X<_O.length;X++){let H=_O[X],q=W[H];(J[q.uploadMethodId]||J.image).upload(q,$,Z,K,JQ.TEXTURE_CUBE_MAP_POSITIVE_X+X,($._layerInitMask&1<<X)===0),$._layerInitMask|=1<<X}$.width=Q.pixelWidth,$.height=Q.pixelHeight}}}var _O;var PO=A(()=>{c$();_O=["right","left","top","bottom","front","back"]});function Zk(J,Q,$,Z,K,W,X,H,q,N){if(!N){if(q)J.texImage2D(Q,0,$.internalFormat,Z,K,0,$.format,$.type,null);J.texSubImage2D(Q,0,0,0,W,X,$.format,$.type,H);return}if(!q){J.texSubImage2D(Q,0,0,0,$.format,$.type,H);return}J.texImage2D(Q,0,$.internalFormat,Z,K,0,$.format,$.type,H)}function Kk(J,Q,$,Z,K,W,X,H,q,N){if(!N){if(q)J.texImage2D(Q,0,$.internalFormat,Z,K,0,$.format,$.type,null);J.texSubImage2D(Q,0,0,0,$.format,$.type,H);return}if(!q){J.texSubImage2D(Q,0,0,0,$.format,$.type,H);return}J.texImage2D(Q,0,$.internalFormat,$.format,$.type,H)}var ZZ;var R5=A(()=>{ZZ={id:"image",upload(J,Q,$,Z,K,W=!1){let X=K||Q.target,H=J.pixelWidth,q=J.pixelHeight,N=J.resourceWidth,Y=J.resourceHeight,U=Z===2,V=W||Q.width!==H||Q.height!==q,z=N>=H&&Y>=q,D=J.resource;(U?Zk:Kk)($,X,Q,H,q,N,Y,D,V,z),Q.width=H,Q.height=q}}});var Wk,jO;var SO=A(()=>{kU();R5();Wk=DU(),jO={id:"video",upload(J,Q,$,Z,K,W=Wk){if(!J.isValid){let X=K??Q.target;$.texImage2D(X,0,Q.internalFormat,1,1,0,Q.format,Q.type,null);return}ZZ.upload(J,Q,$,Z,K,W)}}});var A5,TO,KZ,yO;var bO=A(()=>{A5={linear:9729,nearest:9728},TO={linear:{linear:9987,nearest:9985},nearest:{linear:9986,nearest:9984}},KZ={"clamp-to-edge":33071,repeat:10497,"mirror-repeat":33648},yO={never:512,less:513,equal:514,"less-equal":515,greater:516,"not-equal":517,"greater-equal":518,always:519}});function C5(J,Q,$,Z,K,W,X,H){let q=W;if(!H||J.addressModeU!=="repeat"||J.addressModeV!=="repeat"||J.addressModeW!=="repeat"){let N=KZ[X?"clamp-to-edge":J.addressModeU],Y=KZ[X?"clamp-to-edge":J.addressModeV],U=KZ[X?"clamp-to-edge":J.addressModeW];if(Q[K](q,Q.TEXTURE_WRAP_S,N),Q[K](q,Q.TEXTURE_WRAP_T,Y),Q.TEXTURE_WRAP_R)Q[K](q,Q.TEXTURE_WRAP_R,U)}if(!H||J.magFilter!=="linear")Q[K](q,Q.TEXTURE_MAG_FILTER,A5[J.magFilter]);if($){if(!H||J.mipmapFilter!=="linear"){let N=TO[J.minFilter][J.mipmapFilter];Q[K](q,Q.TEXTURE_MIN_FILTER,N)}}else Q[K](q,Q.TEXTURE_MIN_FILTER,A5[J.minFilter]);if(Z&&J.maxAnisotropy>1){let N=Math.min(J.maxAnisotropy,Q.getParameter(Z.MAX_TEXTURE_MAX_ANISOTROPY_EXT));Q[K](q,Z.TEXTURE_MAX_ANISOTROPY_EXT,N)}if(J.compare)Q[K](q,Q.TEXTURE_COMPARE_FUNC,yO[J.compare])}var vO=A(()=>{bO()});function fO(J){return{r8unorm:J.RED,r8snorm:J.RED,r8uint:J.RED,r8sint:J.RED,r16uint:J.RED,r16sint:J.RED,r16float:J.RED,rg8unorm:J.RG,rg8snorm:J.RG,rg8uint:J.RG,rg8sint:J.RG,r32uint:J.RED,r32sint:J.RED,r32float:J.RED,rg16uint:J.RG,rg16sint:J.RG,rg16float:J.RG,rgba8unorm:J.RGBA,"rgba8unorm-srgb":J.RGBA,rgba8snorm:J.RGBA,rgba8uint:J.RGBA,rgba8sint:J.RGBA,bgra8unorm:J.RGBA,"bgra8unorm-srgb":J.RGBA,rgb9e5ufloat:J.RGB,rgb10a2unorm:J.RGBA,rg11b10ufloat:J.RGB,rg32uint:J.RG,rg32sint:J.RG,rg32float:J.RG,rgba16uint:J.RGBA,rgba16sint:J.RGBA,rgba16float:J.RGBA,rgba32uint:J.RGBA,rgba32sint:J.RGBA,rgba32float:J.RGBA,stencil8:J.STENCIL_INDEX8,depth16unorm:J.DEPTH_COMPONENT,depth24plus:J.DEPTH_COMPONENT,"depth24plus-stencil8":J.DEPTH_STENCIL,depth32float:J.DEPTH_COMPONENT,"depth32float-stencil8":J.DEPTH_STENCIL}}var hO=()=>{};function xO(J,Q){let $={},Z=J.RGBA;if(!(J instanceof F8.get().getWebGLRenderingContext()))$={"rgba8unorm-srgb":J.SRGB8_ALPHA8,"bgra8unorm-srgb":J.SRGB8_ALPHA8},Z=J.RGBA8;else if(Q.srgb)$={"rgba8unorm-srgb":Q.srgb.SRGB8_ALPHA8_EXT,"bgra8unorm-srgb":Q.srgb.SRGB8_ALPHA8_EXT};return{r8unorm:J.R8,r8snorm:J.R8_SNORM,r8uint:J.R8UI,r8sint:J.R8I,r16uint:J.R16UI,r16sint:J.R16I,r16float:J.R16F,rg8unorm:J.RG8,rg8snorm:J.RG8_SNORM,rg8uint:J.RG8UI,rg8sint:J.RG8I,r32uint:J.R32UI,r32sint:J.R32I,r32float:J.R32F,rg16uint:J.RG16UI,rg16sint:J.RG16I,rg16float:J.RG16F,rgba8unorm:J.RGBA,...$,rgba8snorm:J.RGBA8_SNORM,rgba8uint:J.RGBA8UI,rgba8sint:J.RGBA8I,bgra8unorm:Z,rgb9e5ufloat:J.RGB9_E5,rgb10a2unorm:J.RGB10_A2,rg11b10ufloat:J.R11F_G11F_B10F,rg32uint:J.RG32UI,rg32sint:J.RG32I,rg32float:J.RG32F,rgba16uint:J.RGBA16UI,rgba16sint:J.RGBA16I,rgba16float:J.RGBA16F,rgba32uint:J.RGBA32UI,rgba32sint:J.RGBA32I,rgba32float:J.RGBA32F,stencil8:J.STENCIL_INDEX8,depth16unorm:J.DEPTH_COMPONENT16,depth24plus:J.DEPTH_COMPONENT24,"depth24plus-stencil8":J.DEPTH24_STENCIL8,depth32float:J.DEPTH_COMPONENT32F,"depth32float-stencil8":J.DEPTH32F_STENCIL8,...Q.s3tc?{"bc1-rgba-unorm":Q.s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT,"bc2-rgba-unorm":Q.s3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT,"bc3-rgba-unorm":Q.s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT}:{},...Q.s3tc_sRGB?{"bc1-rgba-unorm-srgb":Q.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT,"bc2-rgba-unorm-srgb":Q.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT,"bc3-rgba-unorm-srgb":Q.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}:{},...Q.rgtc?{"bc4-r-unorm":Q.rgtc.COMPRESSED_RED_RGTC1_EXT,"bc4-r-snorm":Q.rgtc.COMPRESSED_SIGNED_RED_RGTC1_EXT,"bc5-rg-unorm":Q.rgtc.COMPRESSED_RED_GREEN_RGTC2_EXT,"bc5-rg-snorm":Q.rgtc.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}:{},...Q.bptc?{"bc6h-rgb-float":Q.bptc.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT,"bc6h-rgb-ufloat":Q.bptc.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT,"bc7-rgba-unorm":Q.bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT,"bc7-rgba-unorm-srgb":Q.bptc.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT}:{},...Q.etc?{"etc2-rgb8unorm":Q.etc.COMPRESSED_RGB8_ETC2,"etc2-rgb8unorm-srgb":Q.etc.COMPRESSED_SRGB8_ETC2,"etc2-rgb8a1unorm":Q.etc.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2,"etc2-rgb8a1unorm-srgb":Q.etc.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2,"etc2-rgba8unorm":Q.etc.COMPRESSED_RGBA8_ETC2_EAC,"etc2-rgba8unorm-srgb":Q.etc.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC,"eac-r11unorm":Q.etc.COMPRESSED_R11_EAC,"eac-rg11unorm":Q.etc.COMPRESSED_SIGNED_RG11_EAC}:{},...Q.astc?{"astc-4x4-unorm":Q.astc.COMPRESSED_RGBA_ASTC_4x4_KHR,"astc-4x4-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR,"astc-5x4-unorm":Q.astc.COMPRESSED_RGBA_ASTC_5x4_KHR,"astc-5x4-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR,"astc-5x5-unorm":Q.astc.COMPRESSED_RGBA_ASTC_5x5_KHR,"astc-5x5-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR,"astc-6x5-unorm":Q.astc.COMPRESSED_RGBA_ASTC_6x5_KHR,"astc-6x5-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR,"astc-6x6-unorm":Q.astc.COMPRESSED_RGBA_ASTC_6x6_KHR,"astc-6x6-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR,"astc-8x5-unorm":Q.astc.COMPRESSED_RGBA_ASTC_8x5_KHR,"astc-8x5-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR,"astc-8x6-unorm":Q.astc.COMPRESSED_RGBA_ASTC_8x6_KHR,"astc-8x6-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR,"astc-8x8-unorm":Q.astc.COMPRESSED_RGBA_ASTC_8x8_KHR,"astc-8x8-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR,"astc-10x5-unorm":Q.astc.COMPRESSED_RGBA_ASTC_10x5_KHR,"astc-10x5-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR,"astc-10x6-unorm":Q.astc.COMPRESSED_RGBA_ASTC_10x6_KHR,"astc-10x6-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR,"astc-10x8-unorm":Q.astc.COMPRESSED_RGBA_ASTC_10x8_KHR,"astc-10x8-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR,"astc-10x10-unorm":Q.astc.COMPRESSED_RGBA_ASTC_10x10_KHR,"astc-10x10-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR,"astc-12x10-unorm":Q.astc.COMPRESSED_RGBA_ASTC_12x10_KHR,"astc-12x10-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR,"astc-12x12-unorm":Q.astc.COMPRESSED_RGBA_ASTC_12x12_KHR,"astc-12x12-unorm-srgb":Q.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR}:{}}}var gO=A(()=>{D6()});function pO(J){return{r8unorm:J.UNSIGNED_BYTE,r8snorm:J.BYTE,r8uint:J.UNSIGNED_BYTE,r8sint:J.BYTE,r16uint:J.UNSIGNED_SHORT,r16sint:J.SHORT,r16float:J.HALF_FLOAT,rg8unorm:J.UNSIGNED_BYTE,rg8snorm:J.BYTE,rg8uint:J.UNSIGNED_BYTE,rg8sint:J.BYTE,r32uint:J.UNSIGNED_INT,r32sint:J.INT,r32float:J.FLOAT,rg16uint:J.UNSIGNED_SHORT,rg16sint:J.SHORT,rg16float:J.HALF_FLOAT,rgba8unorm:J.UNSIGNED_BYTE,"rgba8unorm-srgb":J.UNSIGNED_BYTE,rgba8snorm:J.BYTE,rgba8uint:J.UNSIGNED_BYTE,rgba8sint:J.BYTE,bgra8unorm:J.UNSIGNED_BYTE,"bgra8unorm-srgb":J.UNSIGNED_BYTE,rgb9e5ufloat:J.UNSIGNED_INT_5_9_9_9_REV,rgb10a2unorm:J.UNSIGNED_INT_2_10_10_10_REV,rg11b10ufloat:J.UNSIGNED_INT_10F_11F_11F_REV,rg32uint:J.UNSIGNED_INT,rg32sint:J.INT,rg32float:J.FLOAT,rgba16uint:J.UNSIGNED_SHORT,rgba16sint:J.SHORT,rgba16float:J.HALF_FLOAT,rgba32uint:J.UNSIGNED_INT,rgba32sint:J.INT,rgba32float:J.FLOAT,stencil8:J.UNSIGNED_BYTE,depth16unorm:J.UNSIGNED_SHORT,depth24plus:J.UNSIGNED_INT,"depth24plus-stencil8":J.UNSIGNED_INT_24_8,depth32float:J.FLOAT,"depth32float-stencil8":J.FLOAT_32_UNSIGNED_INT_24_8_REV}}var mO=()=>{};function dO(J){return{"2d":J.TEXTURE_2D,cube:J.TEXTURE_CUBE_MAP,"1d":null,"3d":J?.TEXTURE_3D||null,"2d-array":J?.TEXTURE_2D_ARRAY||null,"cube-array":J?.TEXTURE_CUBE_MAP_ARRAY||null}}var lO=()=>{};class WZ{constructor(J){this._glSamplers=Object.create(null),this._boundTextures=[],this._activeTextureLocation=-1,this._boundSamplers=Object.create(null),this._premultiplyAlpha=!1,this._useSeparateSamplers=!1,this._renderer=J,this._managedTextures=new KJ({renderer:J,type:"resource",onUnload:this.onSourceUnload.bind(this),name:"glTexture"});let Q={image:ZZ,buffer:BO,video:jO,compressed:AO};this._uploads={...Q,cube:EO(Q)}}get managedTextures(){return Object.values(this._managedTextures.items)}contextChange(J){if(this._gl=J,!this._mapFormatToInternalFormat)this._mapFormatToInternalFormat=xO(J,this._renderer.context.extensions),this._mapFormatToType=pO(J),this._mapFormatToFormat=fO(J),this._mapViewDimensionToGlTarget=dO(J);this._managedTextures.removeAll(!0),this._glSamplers=Object.create(null),this._boundSamplers=Object.create(null),this._premultiplyAlpha=!1;for(let Q=0;Q<16;Q++)this.bind(P0.EMPTY,Q)}initSource(J){this.bind(J)}bind(J,Q=0){let $=J.source;if(J){if(this.bindSource($,Q),this._useSeparateSamplers)this._bindSampler($.style,Q)}else if(this.bindSource(null,Q),this._useSeparateSamplers)this._bindSampler(null,Q)}bindSource(J,Q=0){let $=this._gl;if(J._gcLastUsed=this._renderer.gc.now,this._boundTextures[Q]!==J){this._boundTextures[Q]=J,this._activateLocation(Q),J||(J=P0.EMPTY.source);let Z=this.getGlSource(J);$.bindTexture(Z.target,Z.texture)}}_bindSampler(J,Q=0){let $=this._gl;if(!J){this._boundSamplers[Q]=null,$.bindSampler(Q,null);return}let Z=this._getGlSampler(J);if(this._boundSamplers[Q]!==Z)this._boundSamplers[Q]=Z,$.bindSampler(Q,Z)}unbind(J){let Q=J.source,$=this._boundTextures,Z=this._gl;for(let K=0;K<$.length;K++)if($[K]===Q){this._activateLocation(K);let W=this.getGlSource(Q);Z.bindTexture(W.target,null),$[K]=null}}_activateLocation(J){if(this._activeTextureLocation!==J)this._activeTextureLocation=J,this._gl.activeTexture(this._gl.TEXTURE0+J)}_initSource(J){let Q=this._gl,$=new B5(Q.createTexture());if($.type=this._mapFormatToType[J.format],$.internalFormat=this._mapFormatToInternalFormat[J.format],$.format=this._mapFormatToFormat[J.format],$.target=this._mapViewDimensionToGlTarget[J.viewDimension],$.target===null)throw Error(`Unsupported view dimension: ${J.viewDimension} with this webgl version: ${this._renderer.context.webGLVersion}`);if(J.uploadMethodId==="cube")$.target=Q.TEXTURE_CUBE_MAP;if(J.autoGenerateMipmaps&&(this._renderer.context.supports.nonPowOf2mipmaps||J.isPowerOfTwo)){let K=Math.max(J.width,J.height);J.mipLevelCount=Math.floor(Math.log2(K))+1}if(J._gpuData[this._renderer.uid]=$,this._managedTextures.add(J))J.on("update",this.onSourceUpdate,this),J.on("resize",this.onSourceUpdate,this),J.on("styleChange",this.onStyleChange,this),J.on("updateMipmaps",this.onUpdateMipmaps,this);return this.onSourceUpdate(J),this.updateStyle(J,!1),$}onStyleChange(J){this.updateStyle(J,!1)}updateStyle(J,Q){let $=this._gl,Z=this.getGlSource(J);$.bindTexture(Z.target,Z.texture),this._boundTextures[this._activeTextureLocation]=J,C5(J.style,$,J.mipLevelCount>1,this._renderer.context.extensions.anisotropicFiltering,"texParameteri",Z.target,!this._renderer.context.supports.nonPowOf2wrapping&&!J.isPowerOfTwo,Q)}onSourceUnload(J,Q=!1){let $=J._gpuData[this._renderer.uid];if(!$)return;if(!Q)this.unbind(J),this._gl.deleteTexture($.texture);J.off("update",this.onSourceUpdate,this),J.off("resize",this.onSourceUpdate,this),J.off("styleChange",this.onStyleChange,this),J.off("updateMipmaps",this.onUpdateMipmaps,this)}onSourceUpdate(J){let Q=this._gl,$=this.getGlSource(J);Q.bindTexture($.target,$.texture),this._boundTextures[this._activeTextureLocation]=J;let Z=J.alphaMode==="premultiply-alpha-on-upload";if(this._premultiplyAlpha!==Z)this._premultiplyAlpha=Z,Q.pixelStorei(Q.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Z);if(this._uploads[J.uploadMethodId])this._uploads[J.uploadMethodId].upload(J,$,Q,this._renderer.context.webGLVersion);else if($.target===Q.TEXTURE_2D)this._initEmptyTexture2D($,J);else if($.target===Q.TEXTURE_2D_ARRAY)this._initEmptyTexture2DArray($,J);else if($.target===Q.TEXTURE_CUBE_MAP)this._initEmptyTextureCube($,J);else throw Error("[GlTextureSystem] Unsupported texture target for empty allocation.");if(this._applyMipRange($,J),J.autoGenerateMipmaps&&J.mipLevelCount>1)this.onUpdateMipmaps(J,!1)}onUpdateMipmaps(J,Q=!0){if(Q)this.bindSource(J,0);let $=this.getGlSource(J);this._gl.generateMipmap($.target)}_initEmptyTexture2D(J,Q){let $=this._gl;$.texImage2D($.TEXTURE_2D,0,J.internalFormat,Q.pixelWidth,Q.pixelHeight,0,J.format,J.type,null);let Z=Math.max(Q.pixelWidth>>1,1),K=Math.max(Q.pixelHeight>>1,1);for(let W=1;W<Q.mipLevelCount;W++)$.texImage2D($.TEXTURE_2D,W,J.internalFormat,Z,K,0,J.format,J.type,null),Z=Math.max(Z>>1,1),K=Math.max(K>>1,1)}_initEmptyTexture2DArray(J,Q){if(this._renderer.context.webGLVersion!==2)throw Error("[GlTextureSystem] TEXTURE_2D_ARRAY requires WebGL2.");let $=this._gl,Z=Math.max(Q.arrayLayerCount|0,1);$.texImage3D($.TEXTURE_2D_ARRAY,0,J.internalFormat,Q.pixelWidth,Q.pixelHeight,Z,0,J.format,J.type,null);let K=Math.max(Q.pixelWidth>>1,1),W=Math.max(Q.pixelHeight>>1,1);for(let X=1;X<Q.mipLevelCount;X++)$.texImage3D($.TEXTURE_2D_ARRAY,X,J.internalFormat,K,W,Z,0,J.format,J.type,null),K=Math.max(K>>1,1),W=Math.max(W>>1,1)}_initEmptyTextureCube(J,Q){let $=this._gl,Z=6;for(let X=0;X<6;X++)$.texImage2D($.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,J.internalFormat,Q.pixelWidth,Q.pixelHeight,0,J.format,J.type,null);let K=Math.max(Q.pixelWidth>>1,1),W=Math.max(Q.pixelHeight>>1,1);for(let X=1;X<Q.mipLevelCount;X++){for(let H=0;H<6;H++)$.texImage2D($.TEXTURE_CUBE_MAP_POSITIVE_X+H,X,J.internalFormat,K,W,0,J.format,J.type,null);K=Math.max(K>>1,1),W=Math.max(W>>1,1)}}_applyMipRange(J,Q){if(this._renderer.context.webGLVersion!==2)return;let $=this._gl,Z=Math.max((Q.mipLevelCount|0)-1,0);$.texParameteri(J.target,$.TEXTURE_BASE_LEVEL,0),$.texParameteri(J.target,$.TEXTURE_MAX_LEVEL,Z)}_initSampler(J){let Q=this._gl,$=this._gl.createSampler();return this._glSamplers[J._resourceId]=$,C5(J,Q,this._boundTextures[this._activeTextureLocation].mipLevelCount>1,this._renderer.context.extensions.anisotropicFiltering,"samplerParameteri",$,!1,!0),this._glSamplers[J._resourceId]}_getGlSampler(J){return this._glSamplers[J._resourceId]||this._initSampler(J)}getGlSource(J){return J._gcLastUsed=this._renderer.gc.now,J._gpuData[this._renderer.uid]||this._initSource(J)}generateCanvas(J){let{pixels:Q,width:$,height:Z}=this.getPixels(J),K=F8.get().createCanvas();K.width=$,K.height=Z;let W=K.getContext("2d");if(W){let X=W.createImageData($,Z);X.data.set(Q),W.putImageData(X,0,0)}return K}getPixels(J){let Q=J.source.resolution,$=J.frame,Z=Math.max(Math.round($.width*Q),1),K=Math.max(Math.round($.height*Q),1),W=new Uint8Array(Xk*Z*K),X=this._renderer,H=X.renderTarget.getRenderTarget(J),q=X.renderTarget.getGpuRenderTarget(H),N=X.gl;return N.bindFramebuffer(N.FRAMEBUFFER,q.resolveTargetFramebuffer),N.readPixels(Math.round($.x*Q),Math.round($.y*Q),Z,K,N.RGBA,N.UNSIGNED_BYTE,W),{pixels:new Uint8ClampedArray(W.buffer),width:Z,height:K}}destroy(){this._managedTextures.destroy(),this._glSamplers=null,this._boundTextures=null,this._boundSamplers=null,this._mapFormatToInternalFormat=null,this._mapFormatToType=null,this._mapFormatToFormat=null,this._uploads=null,this._renderer=null}resetState(){this._activeTextureLocation=-1,this._boundTextures.fill(P0.EMPTY.source),this._boundSamplers=Object.create(null);let J=this._gl;this._premultiplyAlpha=!1,J.pixelStorei(J.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this._premultiplyAlpha)}}var Xk=4;var cO=A(()=>{D6();k0();C$();i8();GO();RO();CO();PO();R5();SO();vO();hO();gO();mO();lO();WZ.extension={type:[b.WebGLSystem],name:"texture"}});class XZ{contextChange(J){let Q=new o8({uColor:{value:new Float32Array([1,1,1,1]),type:"vec4<f32>"},uTransformMatrix:{value:new R0,type:"mat3x3<f32>"},uRound:{value:0,type:"f32"}}),$=J.limits.maxBatchableTextures,Z=uJ({name:"graphics",bits:[L$,G$($),_$,sJ]});this.shader=new A6({glProgram:Z,resources:{localUniforms:Q,batchSamplers:R$($)}})}execute(J,Q){let $=Q.context,Z=$.customShader||this.shader,K=J.renderer,W=K.graphicsContext,{batcher:X,instructions:H}=W.getContextRenderData($);Z.groups[0]=K.globalUniforms.bindGroup,K.state.set(J.state),K.shader.bind(Z),K.geometry.bind(X.geometry,Z.glProgram);let q=H.instructions;for(let N=0;N<H.instructionSize;N++){let Y=q[N];if(Y.size){for(let U=0;U<Y.textures.count;U++)K.texture.bind(Y.textures.textures[U],U);K.geometry.draw(Y.topology,Y.size,Y.start)}}}destroy(){this.shader.destroy(!0),this.shader=null}}var uO=A(()=>{k0();E8();I$();bW();hW();lW();B$();xW();pJ();Y7();XZ.extension={type:[b.WebGLPipesAdaptor],name:"graphics"}});class HZ{init(){let J=uJ({name:"mesh",bits:[_$,IU,sJ]});this._shader=new A6({glProgram:J,resources:{uTexture:P0.EMPTY.source,textureUniforms:{uTextureMatrix:{type:"mat3x3<f32>",value:new R0}}}})}execute(J,Q){let $=J.renderer,Z=Q._shader;if(!Z){Z=this._shader;let K=Q.texture,W=K.source;Z.resources.uTexture=W,Z.resources.uSampler=W.style,Z.resources.textureUniforms.uniforms.uTextureMatrix=K.textureMatrix.mapCoord}else if(!Z.glProgram){v0("Mesh shader has no glProgram",Q.shader);return}Z.groups[100]=$.globalUniforms.bindGroup,Z.groups[101]=J.localUniformsBindGroup,$.encoder.draw({geometry:Q._geometry,shader:Z,state:Q.state})}destroy(){this._shader.destroy(!0),this._shader=null}}var sO=A(()=>{k0();E8();I$();lW();B$();LU();pJ();i8();s8();HZ.extension={type:[b.WebGLPipesAdaptor],name:"mesh"}});var Hk,qk,Nk,nO,iO,oO,qZ;var aO=A(()=>{k0();uO();sO();MU();DY();NV();$J();kV();wV();CV();EV();PV();jV();SV();bV();cV();sV();YO();DO();LO();cO();Hk=[...HV,a$,_V,MV,i$,d$,WZ,r$,u$,$Z,QZ,n$,IO,o$,s$],qk=[...qV],Nk=[E$,HZ,XZ],nO=[],iO=[],oO=[];n0.handleByNamedList(b.WebGLSystem,nO);n0.handleByNamedList(b.WebGLPipes,iO);n0.handleByNamedList(b.WebGLPipesAdaptor,oO);n0.add(...Hk,...qk,...Nk);qZ=class qZ extends zY{constructor(){let J={name:"webgl",type:q6.WEBGL,systems:nO,renderPipes:iO,renderPipeAdaptors:oO};super(J)}}});k0();var NY={extension:{type:b.Environment,name:"browser",priority:-1},test:()=>!0,load:async()=>{await Promise.resolve().then(() => (qY(),B4))}};k0();var UY={extension:{type:b.Environment,name:"webworker",priority:0},test:()=>typeof self<"u"&&self.WorkerGlobalScope!==void 0,load:async()=>{await Promise.resolve().then(() => (YY(),R4))}};k0();K$();oQ();aO();NW();o6();aQ();fJ();O6();n0.add(NY,UY);var $Q={sourceStylesheet:"src/styles/app.css",stylesheetOutputFile:"app.css",htmxNodeModuleBundle:"node_modules/htmx.org/dist/htmx.min.js",htmxPublicBundleFile:"vendor/htmx.min.js",htmxExtensionOracleIndicatorFile:"vendor/htmx-ext/oracle-indicator.js",htmxExtensionGameHudFile:"vendor/htmx-ext/game-hud.js",htmxExtensionFocusPanelFile:"vendor/htmx-ext/focus-panel.js",onnxPublicDirectory:"onnx",htmxExtensionsSourceDirectory:"src/htmx-extensions",playableGameClientEntryFile:"src/playable-game/game-client.ts",gameClientBundleFile:"game-client.js"};var oJ=(J,Q)=>{let $=`/${J.replace(/^\/+|\/+$/g,"")}`,Z=Q.replace(/^\/+/g,"");if(Z.length===0)return $;return`${$}/${Z}`},rO=(J,Q)=>{let $=J.replace(/^\/+|\/+$/g,""),Z=Q.replace(/^\/+/g,"");if($.length===0)return Z;if(Z.length===0)return $;return`${$}/${Z}`},tO=(J,Q)=>oJ(J,Q);var Yk=["en-US","zh-CN"],Uk=3000,Vk=180,Ok=240,Fk=40,zk=8,Dk=120,kk=230,Mk="prisma",wk=3600000,Ik=16,Lk=2500,Gk=12,Bk=6,Rk=3,Ak=500,Ck=640,_k=360,Ek=500,Pk=2000,jk=604800000,Sk="teaHouse",Tk=5000,yk=2500,bk="./.cache/hf-models",vk=2,fk=8000,hk=30000,xk=350,gk="http://localhost:11434",pk="llama3.2",mk="llava",dk=30000,lk=300000,ck="auto",uk=60000,sk="Xenova/modnet",nk="cha-jiang-source.png",ik="cha-jiang-sprite.png",ok="npc-sprites-source.png",ak="npc-sprites.png",rk="/public",tk="/assets",ek="/rmmz-pack",JM="public",QM="assets",$M="LOTFK_RMMZ_Agentic_Pack",ZM="/docs",KM="/game",WM="public/game",XM="silk",HM="max-w-6xl",qM="lotfk_session",NM="active",YM=7,UM="en-US",NZ=Bun.env.PUBLIC_ASSET_PREFIX??rk,VM=Bun.env.IMAGES_ASSET_PREFIX??tk,OM=Bun.env.RMMZ_PACK_PREFIX??ek,FM=Bun.env.PUBLIC_ASSET_DIR??JM,eO=Bun.env.IMAGES_ASSET_DIR??QM,zM=Bun.env.RMMZ_PACK_DIR??$M,QF=Bun.env.PLAYABLE_GAME_MOUNT_PATH??KM,$F=oJ(QF,"assets"),DM=Bun.env.PLAYABLE_GAME_SOURCE_DIRECTORY??WM,kM=Bun.env.STYLESHEET_PATH??oJ(NZ,$Q.stylesheetOutputFile),MM=Bun.env.HTMX_SCRIPT_PATH??oJ(NZ,$Q.htmxPublicBundleFile),wM=Bun.env.PLAYABLE_GAME_CLIENT_SCRIPT_PATH??oJ($F,$Q.gameClientBundleFile),IM=Bun.env.AI_ONNX_WASM_PATH??`${tO(NZ,$Q.onnxPublicDirectory)}/`,LM=Yk.map((J)=>({locale:J,normalizedLocale:J.toLowerCase(),normalizedLanguage:J.toLowerCase().split("-")[0]??J.toLowerCase()})),JF=(J,Q)=>{if(J===void 0)return Q;return J.toLowerCase()==="true"},$8=(J,Q,$)=>{if(J===void 0)return Q;let Z=Number.parseInt(J,10);if(Number.isNaN(Z))return Q;return Math.max(Z,$)},GM=(J)=>{if(J==="memory")return"memory";if(J==="prisma")return"prisma";return Mk},BM=(J)=>{if(J==="ollama"||J==="transformers"||J==="auto")return J;return ck},RM=(J)=>{return AM(J)??UM},AM=(J)=>{let Q=J?.trim().toLowerCase();if(!Q)return null;for(let $ of LM){if(Q.startsWith($.normalizedLocale))return $.locale;if(Q===$.normalizedLanguage)return $.locale;if(Q.startsWith(`${$.normalizedLanguage}-`))return $.locale}return null},_5={applicationName:Bun.env.APP_NAME??"Leaves of the Fallen Kingdom",applicationVersion:Bun.env.APP_VERSION??"1.0.0",host:Bun.env.HOST??"0.0.0.0",port:$8(Bun.env.PORT,Uk,1),defaultLocale:RM(Bun.env.DEFAULT_LOCALE),stylesheetPath:kM,htmxScriptPath:MM,staticAssets:{publicPrefix:NZ,assetsPrefix:VM,rmmzPackPrefix:OM,publicDirectory:FM,assetsDirectory:eO,rmmzPackDirectory:zM},api:{docsPath:Bun.env.API_DOCS_PATH??ZM},ui:{defaultTheme:Bun.env.APP_THEME??XM,maxContentWidthClass:Bun.env.MAX_CONTENT_WIDTH_CLASS??HM},playableGame:{mountPath:QF,assetPrefix:$F,sourceDirectory:DM,clientScriptPath:wM},auth:{sessionCookieName:Bun.env.SESSION_COOKIE_NAME??qM,sessionCookieValue:Bun.env.SESSION_COOKIE_VALUE??NM},oracle:{requireSession:JF(Bun.env.ORACLE_REQUIRE_SESSION,!1),responseDelayMs:$8(Bun.env.ORACLE_RESPONSE_DELAY_MS,Vk,0),maxQuestionLength:$8(Bun.env.ORACLE_MAX_QUESTION_LENGTH,Ok,1),answerHashMultiplier:$8(Bun.env.ORACLE_ANSWER_HASH_MULTIPLIER,YM,1)},game:{sessionStore:GM(Bun.env.GAME_SESSION_STORE),defaultSceneId:Bun.env.GAME_DEFAULT_SCENE_ID??Sk,sessionTtlMs:$8(Bun.env.GAME_SESSION_TTL_MS,wk,1000),tickMs:$8(Bun.env.GAME_TICK_MS,Ik,1),saveCooldownMs:$8(Bun.env.GAME_SAVE_COOLDOWN_MS,Lk,0),maxMovePerTick:$8(Bun.env.GAME_MAX_MOVE_PER_TICK,Gk,1),maxCommandsPerTick:$8(Bun.env.GAME_MAX_COMMANDS_PER_TICK,Bk,1),maxInteractionsPerTick:$8(Bun.env.GAME_MAX_INTERACTIONS_PER_TICK,Rk,1),maxChatMessageLength:$8(Bun.env.GAME_MAX_CHAT_MESSAGE_LENGTH,Ak,1),viewportWidth:$8(Bun.env.GAME_VIEWPORT_WIDTH,Ck,1),viewportHeight:$8(Bun.env.GAME_VIEWPORT_HEIGHT,_k,1),hudPollIntervalMs:$8(Bun.env.GAME_HUD_POLL_INTERVAL_MS,Ek,100),hudRetryDelayMs:$8(Bun.env.GAME_HUD_RETRY_MS,Pk,0),sessionPurgeIntervalMs:$8(Bun.env.GAME_SESSION_PURGE_INTERVAL_MS,60000,1000),sessionResumeWindowMs:$8(Bun.env.GAME_SESSION_RESUME_WINDOW_MS,jk,1000)},ai:{modelWarmupTimeoutMs:$8(Bun.env.AI_MODEL_WARMUP_TIMEOUT_MS,Tk,500),pipelineTimeoutMs:$8(Bun.env.AI_PIPELINE_TIMEOUT_MS,yk,500),transformersCacheDirectory:Bun.env.AI_TRANSFORMERS_CACHE_DIR??bk,onnxWasmPath:IM,onnxThreadCount:$8(Bun.env.AI_ONNX_THREAD_COUNT,vk,1),ollamaBaseUrl:Bun.env.OLLAMA_BASE_URL??gk,ollamaEnabled:JF(Bun.env.OLLAMA_ENABLED,!0),ollamaChatModel:Bun.env.OLLAMA_CHAT_MODEL??pk,ollamaVisionModel:Bun.env.OLLAMA_VISION_MODEL??mk,ollamaTimeoutMs:$8(Bun.env.OLLAMA_TIMEOUT_MS,dk,1000),ollamaKeepAliveMs:$8(Bun.env.OLLAMA_KEEP_ALIVE_MS,lk,0),preferredProvider:BM(Bun.env.AI_PREFERRED_PROVIDER),capabilityRefreshIntervalMs:$8(Bun.env.AI_CAPABILITY_REFRESH_INTERVAL_MS,uk,5000),ollamaAvailabilityTimeoutMs:$8(Bun.env.OLLAMA_AVAILABILITY_TIMEOUT_MS,3000,500),requestTimeoutMs:$8(Bun.env.AI_REQUEST_TIMEOUT_MS,fk,500),commandRetryBudgetMs:$8(Bun.env.AI_COMMAND_RETRY_BUDGET_MS,hk,1000),retryBackoffBaseMs:$8(Bun.env.AI_RETRY_BACKOFF_BASE_MS,xk,50)},spriteProcessing:{sourceDirectory:Bun.env.SPRITE_SOURCE_DIR??"assets/source",outputDirectory:Bun.env.SPRITE_OUTPUT_DIR??rO(eO,"images/sprites"),floodFillTolerance:$8(Bun.env.SPRITE_FLOOD_FILL_TOLERANCE,Fk,0),interiorGraySpreadThreshold:$8(Bun.env.SPRITE_INTERIOR_GRAY_SPREAD_THRESHOLD,zk,0),interiorGrayLuminanceMin:$8(Bun.env.SPRITE_INTERIOR_GRAY_LUMINANCE_MIN,Dk,0),interiorGrayLuminanceMax:$8(Bun.env.SPRITE_INTERIOR_GRAY_LUMINANCE_MAX,kk,0),aiModel:Bun.env.SPRITE_AI_MODEL??sk,chaJiangSourceFile:Bun.env.SPRITE_SOURCE_CHA_JIANG??nk,chaJiangOutputFile:Bun.env.SPRITE_OUTPUT_CHA_JIANG??ik,npcSheetSourceFile:Bun.env.SPRITE_SOURCE_NPC_SHEET??ok,npcSheetOutputFile:Bun.env.SPRITE_OUTPUT_NPC_SHEET??ak}};var ZF={home:"/",pitchDeck:"/pitch-deck",narrativeBible:"/narrative-bible",developmentPlan:"/dev-plan",game:_5.playableGame.mountPath,gameAssets:_5.playableGame.assetPrefix,gameApiSession:"/api/game/session",gameApiSessionRestore:"/api/game/session/:id",gameApiSessionJoin:"/api/game/session/:id/join",gameApiSessionClose:"/api/game/session/:id/close",gameApiSessionState:"/api/game/session/:id/state",gameApiSessionCommand:"/api/game/session/:id/command",gameApiSessionDialogue:"/api/game/session/:id/dialogue",gameApiSessionSave:"/api/game/session/:id/save",gameApiSessionHud:"/api/game/session/:id/hud",gameApiHudPartial:"/api/game/session/:id/partials/hud",gameApiDialoguePartial:"/api/game/session/:id/partials/dialogue",gameApiSessionWebSocket:"/api/game/session/:id/ws",oraclePartial:"/partials/oracle",oracleApi:"/api/oracle",healthApi:"/api/health",aiStatus:"/api/ai/status",aiHealth:"/api/ai/health",aiCapabilities:"/api/ai/capabilities",aiGenerateDialogue:"/api/ai/generate/dialogue",aiGenerateScene:"/api/ai/generate/scene",aiCritique:"/api/ai/critique",aiAssist:"/api/ai/assist",aiBuilderCapabilities:"/api/builder/ai/capabilities",aiBuilderTest:"/api/builder/ai/test",aiBuilderAssist:"/api/builder/ai/assist",aiBuilderCompose:"/api/builder/ai/compose",builder:"/builder",builderScenes:"/builder/scenes",builderNpcs:"/builder/npcs",builderDialogue:"/builder/dialogue",builderAssets:"/builder/assets",builderAi:"/builder/ai",builderApiScenes:"/api/builder/scenes",builderApiNpcs:"/api/builder/npcs",builderApiDialogue:"/api/builder/dialogue",builderApiAssets:"/api/builder/assets",builderApiAi:"/api/builder/ai"};var KF=(J,Q)=>J.replaceAll(/:([A-Za-z0-9_]+)/g,($,Z)=>{let K=Q[Z];return typeof K==="string"?encodeURIComponent(K):$});var CF="183";var _F=0,e5=1,EF=2;var YQ=1,PF=2,U9=3,V9=0,Y6=1,e6=2,J7=0,UQ=1,JX=2,QX=3,$X=4,jF=5;var O9=100,SF=101,TF=102,yF=103,bF=104,vF=200,fF=201,hF=202,xF=203,gF=204,pF=205,mF=206,dF=207,lF=208,cF=209,uF=210,sF=211,nF=212,iF=213,oF=214,aF=0,rF=1,tF=2,ZX=3,eF=4,Jz=5,Qz=6,$z=7,Zz=0,Kz=1,Wz=2,l6=0,KX=1,WX=2,XX=3,HX=4,qX=5,NX=6,YX=7;var F9=301,NJ=302,yZ=303,bZ=304,VQ=306,Xz=1000,vZ=1001,Hz=1002,m7=1003,qz=1004;var OQ=1005;var U6=1006,fZ=1007;var YJ=1008;var c6=1009,Nz=1010,Yz=1011,FQ=1012,UX=1013,d7=1014,w7=1015,I7=1016,VX=1017,OX=1018,z9=1020,Uz=35902,Vz=35899,Oz=1021,Fz=1022,Q7=1023,UJ=1026,VJ=1027,zz=1028,FX=1029,D9=1030,zX=1031;var DX=1033,hZ=33776,xZ=33777,gZ=33778,pZ=33779,kX=35840,MX=35841,wX=35842,IX=35843,LX=36196,GX=37492,BX=37496,RX=37488,AX=37489,CX=37490,_X=37491,EX=37808,PX=37809,jX=37810,SX=37811,TX=37812,yX=37813,bX=37814,vX=37815,fX=37816,hX=37817,xX=37818,gX=37819,pX=37820,mX=37821,dX=36492,lX=36494,cX=36495,uX=36283,sX=36284,nX=36285,iX=36286;var Dz=0,kz=1,OJ="",Mz="srgb",zQ="srgb-linear",oX="linear",z8="srgb";var wz=512,Iz=513,Lz=514,mZ=515,Gz=516,Bz=517,dZ=518,Rz=519;var aX="300 es",rX=2000;function CM(J){for(let Q=J.length-1;Q>=0;--Q)if(J[Q]>=65535)return!0;return!1}function _M(J){return ArrayBuffer.isView(J)&&!(J instanceof DataView)}function qQ(J){return document.createElementNS("http://www.w3.org/1999/xhtml",J)}function Az(){let J=qQ("canvas");return J.style.display="block",J}var WF={},Y9=null;function tX(...J){let Q="THREE."+J.shift();if(Y9)Y9("log",Q,...J);else console.log(Q,...J)}function Cz(J){let Q=J[0];if(typeof Q==="string"&&Q.startsWith("TSL:")){let $=J[1];if($&&$.isStackTrace)J[0]+=" "+$.getLocation();else J[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return J}function b0(...J){J=Cz(J);let Q="THREE."+J.shift();if(Y9)Y9("warn",Q,...J);else{let $=J[0];if($&&$.isStackTrace)console.warn($.getError(Q));else console.warn(Q,...J)}}function y0(...J){J=Cz(J);let Q="THREE."+J.shift();if(Y9)Y9("error",Q,...J);else{let $=J[0];if($&&$.isStackTrace)console.error($.getError(Q));else console.error(Q,...J)}}function NQ(...J){let Q=J.join(" ");if(Q in WF)return;WF[Q]=!0,b0(...J)}function _z(J,Q,$){return new Promise(function(Z,K){function W(){switch(J.clientWaitSync(Q,J.SYNC_FLUSH_COMMANDS_BIT,0)){case J.WAIT_FAILED:K();break;case J.TIMEOUT_EXPIRED:setTimeout(W,$);break;default:Z()}}setTimeout(W,$)})}var Ez={[0]:1,[2]:6,[4]:7,[3]:5,[1]:0,[6]:2,[7]:4,[5]:3};class l7{addEventListener(J,Q){if(this._listeners===void 0)this._listeners={};let $=this._listeners;if($[J]===void 0)$[J]=[];if($[J].indexOf(Q)===-1)$[J].push(Q)}hasEventListener(J,Q){let $=this._listeners;if($===void 0)return!1;return $[J]!==void 0&&$[J].indexOf(Q)!==-1}removeEventListener(J,Q){let $=this._listeners;if($===void 0)return;let Z=$[J];if(Z!==void 0){let K=Z.indexOf(Q);if(K!==-1)Z.splice(K,1)}}dispatchEvent(J){let Q=this._listeners;if(Q===void 0)return;let $=Q[J.type];if($!==void 0){J.target=this;let Z=$.slice(0);for(let K=0,W=Z.length;K<W;K++)Z[K].call(this,J);J.target=null}}}var a8=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var E5=Math.PI/180,TZ=180/Math.PI;function DQ(){let J=Math.random()*4294967295|0,Q=Math.random()*4294967295|0,$=Math.random()*4294967295|0,Z=Math.random()*4294967295|0;return(a8[J&255]+a8[J>>8&255]+a8[J>>16&255]+a8[J>>24&255]+"-"+a8[Q&255]+a8[Q>>8&255]+"-"+a8[Q>>16&15|64]+a8[Q>>24&255]+"-"+a8[$&63|128]+a8[$>>8&255]+"-"+a8[$>>16&255]+a8[$>>24&255]+a8[Z&255]+a8[Z>>8&255]+a8[Z>>16&255]+a8[Z>>24&255]).toLowerCase()}function s0(J,Q,$){return Math.max(Q,Math.min($,J))}function EM(J,Q){return(J%Q+Q)%Q}function P5(J,Q,$){return(1-$)*J+$*Q}function ZQ(J,Q){switch(Q.constructor){case Float32Array:return J;case Uint32Array:return J/4294967295;case Uint16Array:return J/65535;case Uint8Array:return J/255;case Int32Array:return Math.max(J/2147483647,-1);case Int16Array:return Math.max(J/32767,-1);case Int8Array:return Math.max(J/127,-1);default:throw Error("Invalid component type.")}}function N6(J,Q){switch(Q.constructor){case Float32Array:return J;case Uint32Array:return Math.round(J*4294967295);case Uint16Array:return Math.round(J*65535);case Uint8Array:return Math.round(J*255);case Int32Array:return Math.round(J*2147483647);case Int16Array:return Math.round(J*32767);case Int8Array:return Math.round(J*127);default:throw Error("Invalid component type.")}}class Z8{constructor(J=0,Q=0){Z8.prototype.isVector2=!0,this.x=J,this.y=Q}get width(){return this.x}set width(J){this.x=J}get height(){return this.y}set height(J){this.y=J}set(J,Q){return this.x=J,this.y=Q,this}setScalar(J){return this.x=J,this.y=J,this}setX(J){return this.x=J,this}setY(J){return this.y=J,this}setComponent(J,Q){switch(J){case 0:this.x=Q;break;case 1:this.y=Q;break;default:throw Error("index is out of range: "+J)}return this}getComponent(J){switch(J){case 0:return this.x;case 1:return this.y;default:throw Error("index is out of range: "+J)}}clone(){return new this.constructor(this.x,this.y)}copy(J){return this.x=J.x,this.y=J.y,this}add(J){return this.x+=J.x,this.y+=J.y,this}addScalar(J){return this.x+=J,this.y+=J,this}addVectors(J,Q){return this.x=J.x+Q.x,this.y=J.y+Q.y,this}addScaledVector(J,Q){return this.x+=J.x*Q,this.y+=J.y*Q,this}sub(J){return this.x-=J.x,this.y-=J.y,this}subScalar(J){return this.x-=J,this.y-=J,this}subVectors(J,Q){return this.x=J.x-Q.x,this.y=J.y-Q.y,this}multiply(J){return this.x*=J.x,this.y*=J.y,this}multiplyScalar(J){return this.x*=J,this.y*=J,this}divide(J){return this.x/=J.x,this.y/=J.y,this}divideScalar(J){return this.multiplyScalar(1/J)}applyMatrix3(J){let Q=this.x,$=this.y,Z=J.elements;return this.x=Z[0]*Q+Z[3]*$+Z[6],this.y=Z[1]*Q+Z[4]*$+Z[7],this}min(J){return this.x=Math.min(this.x,J.x),this.y=Math.min(this.y,J.y),this}max(J){return this.x=Math.max(this.x,J.x),this.y=Math.max(this.y,J.y),this}clamp(J,Q){return this.x=s0(this.x,J.x,Q.x),this.y=s0(this.y,J.y,Q.y),this}clampScalar(J,Q){return this.x=s0(this.x,J,Q),this.y=s0(this.y,J,Q),this}clampLength(J,Q){let $=this.length();return this.divideScalar($||1).multiplyScalar(s0($,J,Q))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(J){return this.x*J.x+this.y*J.y}cross(J){return this.x*J.y-this.y*J.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(J){let Q=Math.sqrt(this.lengthSq()*J.lengthSq());if(Q===0)return Math.PI/2;let $=this.dot(J)/Q;return Math.acos(s0($,-1,1))}distanceTo(J){return Math.sqrt(this.distanceToSquared(J))}distanceToSquared(J){let Q=this.x-J.x,$=this.y-J.y;return Q*Q+$*$}manhattanDistanceTo(J){return Math.abs(this.x-J.x)+Math.abs(this.y-J.y)}setLength(J){return this.normalize().multiplyScalar(J)}lerp(J,Q){return this.x+=(J.x-this.x)*Q,this.y+=(J.y-this.y)*Q,this}lerpVectors(J,Q,$){return this.x=J.x+(Q.x-J.x)*$,this.y=J.y+(Q.y-J.y)*$,this}equals(J){return J.x===this.x&&J.y===this.y}fromArray(J,Q=0){return this.x=J[Q],this.y=J[Q+1],this}toArray(J=[],Q=0){return J[Q]=this.x,J[Q+1]=this.y,J}fromBufferAttribute(J,Q){return this.x=J.getX(Q),this.y=J.getY(Q),this}rotateAround(J,Q){let $=Math.cos(Q),Z=Math.sin(Q),K=this.x-J.x,W=this.y-J.y;return this.x=K*$-W*Z+J.x,this.y=K*Z+W*$+J.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class L7{constructor(J=0,Q=0,$=0,Z=1){this.isQuaternion=!0,this._x=J,this._y=Q,this._z=$,this._w=Z}static slerpFlat(J,Q,$,Z,K,W,X){let H=$[Z+0],q=$[Z+1],N=$[Z+2],Y=$[Z+3],U=K[W+0],V=K[W+1],z=K[W+2],D=K[W+3];if(Y!==D||H!==U||q!==V||N!==z){let w=H*U+q*V+N*z+Y*D;if(w<0)U=-U,V=-V,z=-z,D=-D,w=-w;let F=1-X;if(w<0.9995){let O=Math.acos(w),G=Math.sin(O);F=Math.sin(F*O)/G,X=Math.sin(X*O)/G,H=H*F+U*X,q=q*F+V*X,N=N*F+z*X,Y=Y*F+D*X}else{H=H*F+U*X,q=q*F+V*X,N=N*F+z*X,Y=Y*F+D*X;let O=1/Math.sqrt(H*H+q*q+N*N+Y*Y);H*=O,q*=O,N*=O,Y*=O}}J[Q]=H,J[Q+1]=q,J[Q+2]=N,J[Q+3]=Y}static multiplyQuaternionsFlat(J,Q,$,Z,K,W){let X=$[Z],H=$[Z+1],q=$[Z+2],N=$[Z+3],Y=K[W],U=K[W+1],V=K[W+2],z=K[W+3];return J[Q]=X*z+N*Y+H*V-q*U,J[Q+1]=H*z+N*U+q*Y-X*V,J[Q+2]=q*z+N*V+X*U-H*Y,J[Q+3]=N*z-X*Y-H*U-q*V,J}get x(){return this._x}set x(J){this._x=J,this._onChangeCallback()}get y(){return this._y}set y(J){this._y=J,this._onChangeCallback()}get z(){return this._z}set z(J){this._z=J,this._onChangeCallback()}get w(){return this._w}set w(J){this._w=J,this._onChangeCallback()}set(J,Q,$,Z){return this._x=J,this._y=Q,this._z=$,this._w=Z,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(J){return this._x=J.x,this._y=J.y,this._z=J.z,this._w=J.w,this._onChangeCallback(),this}setFromEuler(J,Q=!0){let{_x:$,_y:Z,_z:K,_order:W}=J,X=Math.cos,H=Math.sin,q=X($/2),N=X(Z/2),Y=X(K/2),U=H($/2),V=H(Z/2),z=H(K/2);switch(W){case"XYZ":this._x=U*N*Y+q*V*z,this._y=q*V*Y-U*N*z,this._z=q*N*z+U*V*Y,this._w=q*N*Y-U*V*z;break;case"YXZ":this._x=U*N*Y+q*V*z,this._y=q*V*Y-U*N*z,this._z=q*N*z-U*V*Y,this._w=q*N*Y+U*V*z;break;case"ZXY":this._x=U*N*Y-q*V*z,this._y=q*V*Y+U*N*z,this._z=q*N*z+U*V*Y,this._w=q*N*Y-U*V*z;break;case"ZYX":this._x=U*N*Y-q*V*z,this._y=q*V*Y+U*N*z,this._z=q*N*z-U*V*Y,this._w=q*N*Y+U*V*z;break;case"YZX":this._x=U*N*Y+q*V*z,this._y=q*V*Y+U*N*z,this._z=q*N*z-U*V*Y,this._w=q*N*Y-U*V*z;break;case"XZY":this._x=U*N*Y-q*V*z,this._y=q*V*Y-U*N*z,this._z=q*N*z+U*V*Y,this._w=q*N*Y+U*V*z;break;default:b0("Quaternion: .setFromEuler() encountered an unknown order: "+W)}if(Q===!0)this._onChangeCallback();return this}setFromAxisAngle(J,Q){let $=Q/2,Z=Math.sin($);return this._x=J.x*Z,this._y=J.y*Z,this._z=J.z*Z,this._w=Math.cos($),this._onChangeCallback(),this}setFromRotationMatrix(J){let Q=J.elements,$=Q[0],Z=Q[4],K=Q[8],W=Q[1],X=Q[5],H=Q[9],q=Q[2],N=Q[6],Y=Q[10],U=$+X+Y;if(U>0){let V=0.5/Math.sqrt(U+1);this._w=0.25/V,this._x=(N-H)*V,this._y=(K-q)*V,this._z=(W-Z)*V}else if($>X&&$>Y){let V=2*Math.sqrt(1+$-X-Y);this._w=(N-H)/V,this._x=0.25*V,this._y=(Z+W)/V,this._z=(K+q)/V}else if(X>Y){let V=2*Math.sqrt(1+X-$-Y);this._w=(K-q)/V,this._x=(Z+W)/V,this._y=0.25*V,this._z=(H+N)/V}else{let V=2*Math.sqrt(1+Y-$-X);this._w=(W-Z)/V,this._x=(K+q)/V,this._y=(H+N)/V,this._z=0.25*V}return this._onChangeCallback(),this}setFromUnitVectors(J,Q){let $=J.dot(Q)+1;if($<0.00000001)if($=0,Math.abs(J.x)>Math.abs(J.z))this._x=-J.y,this._y=J.x,this._z=0,this._w=$;else this._x=0,this._y=-J.z,this._z=J.y,this._w=$;else this._x=J.y*Q.z-J.z*Q.y,this._y=J.z*Q.x-J.x*Q.z,this._z=J.x*Q.y-J.y*Q.x,this._w=$;return this.normalize()}angleTo(J){return 2*Math.acos(Math.abs(s0(this.dot(J),-1,1)))}rotateTowards(J,Q){let $=this.angleTo(J);if($===0)return this;let Z=Math.min(1,Q/$);return this.slerp(J,Z),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(J){return this._x*J._x+this._y*J._y+this._z*J._z+this._w*J._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let J=this.length();if(J===0)this._x=0,this._y=0,this._z=0,this._w=1;else J=1/J,this._x=this._x*J,this._y=this._y*J,this._z=this._z*J,this._w=this._w*J;return this._onChangeCallback(),this}multiply(J){return this.multiplyQuaternions(this,J)}premultiply(J){return this.multiplyQuaternions(J,this)}multiplyQuaternions(J,Q){let{_x:$,_y:Z,_z:K,_w:W}=J,X=Q._x,H=Q._y,q=Q._z,N=Q._w;return this._x=$*N+W*X+Z*q-K*H,this._y=Z*N+W*H+K*X-$*q,this._z=K*N+W*q+$*H-Z*X,this._w=W*N-$*X-Z*H-K*q,this._onChangeCallback(),this}slerp(J,Q){let{_x:$,_y:Z,_z:K,_w:W}=J,X=this.dot(J);if(X<0)$=-$,Z=-Z,K=-K,W=-W,X=-X;let H=1-Q;if(X<0.9995){let q=Math.acos(X),N=Math.sin(q);H=Math.sin(H*q)/N,Q=Math.sin(Q*q)/N,this._x=this._x*H+$*Q,this._y=this._y*H+Z*Q,this._z=this._z*H+K*Q,this._w=this._w*H+W*Q,this._onChangeCallback()}else this._x=this._x*H+$*Q,this._y=this._y*H+Z*Q,this._z=this._z*H+K*Q,this._w=this._w*H+W*Q,this.normalize();return this}slerpQuaternions(J,Q,$){return this.copy(J).slerp(Q,$)}random(){let J=2*Math.PI*Math.random(),Q=2*Math.PI*Math.random(),$=Math.random(),Z=Math.sqrt(1-$),K=Math.sqrt($);return this.set(Z*Math.sin(J),Z*Math.cos(J),K*Math.sin(Q),K*Math.cos(Q))}equals(J){return J._x===this._x&&J._y===this._y&&J._z===this._z&&J._w===this._w}fromArray(J,Q=0){return this._x=J[Q],this._y=J[Q+1],this._z=J[Q+2],this._w=J[Q+3],this._onChangeCallback(),this}toArray(J=[],Q=0){return J[Q]=this._x,J[Q+1]=this._y,J[Q+2]=this._z,J[Q+3]=this._w,J}fromBufferAttribute(J,Q){return this._x=J.getX(Q),this._y=J.getY(Q),this._z=J.getZ(Q),this._w=J.getW(Q),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(J){return this._onChangeCallback=J,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class g{constructor(J=0,Q=0,$=0){g.prototype.isVector3=!0,this.x=J,this.y=Q,this.z=$}set(J,Q,$){if($===void 0)$=this.z;return this.x=J,this.y=Q,this.z=$,this}setScalar(J){return this.x=J,this.y=J,this.z=J,this}setX(J){return this.x=J,this}setY(J){return this.y=J,this}setZ(J){return this.z=J,this}setComponent(J,Q){switch(J){case 0:this.x=Q;break;case 1:this.y=Q;break;case 2:this.z=Q;break;default:throw Error("index is out of range: "+J)}return this}getComponent(J){switch(J){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("index is out of range: "+J)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(J){return this.x=J.x,this.y=J.y,this.z=J.z,this}add(J){return this.x+=J.x,this.y+=J.y,this.z+=J.z,this}addScalar(J){return this.x+=J,this.y+=J,this.z+=J,this}addVectors(J,Q){return this.x=J.x+Q.x,this.y=J.y+Q.y,this.z=J.z+Q.z,this}addScaledVector(J,Q){return this.x+=J.x*Q,this.y+=J.y*Q,this.z+=J.z*Q,this}sub(J){return this.x-=J.x,this.y-=J.y,this.z-=J.z,this}subScalar(J){return this.x-=J,this.y-=J,this.z-=J,this}subVectors(J,Q){return this.x=J.x-Q.x,this.y=J.y-Q.y,this.z=J.z-Q.z,this}multiply(J){return this.x*=J.x,this.y*=J.y,this.z*=J.z,this}multiplyScalar(J){return this.x*=J,this.y*=J,this.z*=J,this}multiplyVectors(J,Q){return this.x=J.x*Q.x,this.y=J.y*Q.y,this.z=J.z*Q.z,this}applyEuler(J){return this.applyQuaternion(XF.setFromEuler(J))}applyAxisAngle(J,Q){return this.applyQuaternion(XF.setFromAxisAngle(J,Q))}applyMatrix3(J){let Q=this.x,$=this.y,Z=this.z,K=J.elements;return this.x=K[0]*Q+K[3]*$+K[6]*Z,this.y=K[1]*Q+K[4]*$+K[7]*Z,this.z=K[2]*Q+K[5]*$+K[8]*Z,this}applyNormalMatrix(J){return this.applyMatrix3(J).normalize()}applyMatrix4(J){let Q=this.x,$=this.y,Z=this.z,K=J.elements,W=1/(K[3]*Q+K[7]*$+K[11]*Z+K[15]);return this.x=(K[0]*Q+K[4]*$+K[8]*Z+K[12])*W,this.y=(K[1]*Q+K[5]*$+K[9]*Z+K[13])*W,this.z=(K[2]*Q+K[6]*$+K[10]*Z+K[14])*W,this}applyQuaternion(J){let Q=this.x,$=this.y,Z=this.z,K=J.x,W=J.y,X=J.z,H=J.w,q=2*(W*Z-X*$),N=2*(X*Q-K*Z),Y=2*(K*$-W*Q);return this.x=Q+H*q+W*Y-X*N,this.y=$+H*N+X*q-K*Y,this.z=Z+H*Y+K*N-W*q,this}project(J){return this.applyMatrix4(J.matrixWorldInverse).applyMatrix4(J.projectionMatrix)}unproject(J){return this.applyMatrix4(J.projectionMatrixInverse).applyMatrix4(J.matrixWorld)}transformDirection(J){let Q=this.x,$=this.y,Z=this.z,K=J.elements;return this.x=K[0]*Q+K[4]*$+K[8]*Z,this.y=K[1]*Q+K[5]*$+K[9]*Z,this.z=K[2]*Q+K[6]*$+K[10]*Z,this.normalize()}divide(J){return this.x/=J.x,this.y/=J.y,this.z/=J.z,this}divideScalar(J){return this.multiplyScalar(1/J)}min(J){return this.x=Math.min(this.x,J.x),this.y=Math.min(this.y,J.y),this.z=Math.min(this.z,J.z),this}max(J){return this.x=Math.max(this.x,J.x),this.y=Math.max(this.y,J.y),this.z=Math.max(this.z,J.z),this}clamp(J,Q){return this.x=s0(this.x,J.x,Q.x),this.y=s0(this.y,J.y,Q.y),this.z=s0(this.z,J.z,Q.z),this}clampScalar(J,Q){return this.x=s0(this.x,J,Q),this.y=s0(this.y,J,Q),this.z=s0(this.z,J,Q),this}clampLength(J,Q){let $=this.length();return this.divideScalar($||1).multiplyScalar(s0($,J,Q))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(J){return this.x*J.x+this.y*J.y+this.z*J.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(J){return this.normalize().multiplyScalar(J)}lerp(J,Q){return this.x+=(J.x-this.x)*Q,this.y+=(J.y-this.y)*Q,this.z+=(J.z-this.z)*Q,this}lerpVectors(J,Q,$){return this.x=J.x+(Q.x-J.x)*$,this.y=J.y+(Q.y-J.y)*$,this.z=J.z+(Q.z-J.z)*$,this}cross(J){return this.crossVectors(this,J)}crossVectors(J,Q){let{x:$,y:Z,z:K}=J,W=Q.x,X=Q.y,H=Q.z;return this.x=Z*H-K*X,this.y=K*W-$*H,this.z=$*X-Z*W,this}projectOnVector(J){let Q=J.lengthSq();if(Q===0)return this.set(0,0,0);let $=J.dot(this)/Q;return this.copy(J).multiplyScalar($)}projectOnPlane(J){return j5.copy(this).projectOnVector(J),this.sub(j5)}reflect(J){return this.sub(j5.copy(J).multiplyScalar(2*this.dot(J)))}angleTo(J){let Q=Math.sqrt(this.lengthSq()*J.lengthSq());if(Q===0)return Math.PI/2;let $=this.dot(J)/Q;return Math.acos(s0($,-1,1))}distanceTo(J){return Math.sqrt(this.distanceToSquared(J))}distanceToSquared(J){let Q=this.x-J.x,$=this.y-J.y,Z=this.z-J.z;return Q*Q+$*$+Z*Z}manhattanDistanceTo(J){return Math.abs(this.x-J.x)+Math.abs(this.y-J.y)+Math.abs(this.z-J.z)}setFromSpherical(J){return this.setFromSphericalCoords(J.radius,J.phi,J.theta)}setFromSphericalCoords(J,Q,$){let Z=Math.sin(Q)*J;return this.x=Z*Math.sin($),this.y=Math.cos(Q)*J,this.z=Z*Math.cos($),this}setFromCylindrical(J){return this.setFromCylindricalCoords(J.radius,J.theta,J.y)}setFromCylindricalCoords(J,Q,$){return this.x=J*Math.sin(Q),this.y=$,this.z=J*Math.cos(Q),this}setFromMatrixPosition(J){let Q=J.elements;return this.x=Q[12],this.y=Q[13],this.z=Q[14],this}setFromMatrixScale(J){let Q=this.setFromMatrixColumn(J,0).length(),$=this.setFromMatrixColumn(J,1).length(),Z=this.setFromMatrixColumn(J,2).length();return this.x=Q,this.y=$,this.z=Z,this}setFromMatrixColumn(J,Q){return this.fromArray(J.elements,Q*4)}setFromMatrix3Column(J,Q){return this.fromArray(J.elements,Q*3)}setFromEuler(J){return this.x=J._x,this.y=J._y,this.z=J._z,this}setFromColor(J){return this.x=J.r,this.y=J.g,this.z=J.b,this}equals(J){return J.x===this.x&&J.y===this.y&&J.z===this.z}fromArray(J,Q=0){return this.x=J[Q],this.y=J[Q+1],this.z=J[Q+2],this}toArray(J=[],Q=0){return J[Q]=this.x,J[Q+1]=this.y,J[Q+2]=this.z,J}fromBufferAttribute(J,Q){return this.x=J.getX(Q),this.y=J.getY(Q),this.z=J.getZ(Q),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let J=Math.random()*Math.PI*2,Q=Math.random()*2-1,$=Math.sqrt(1-Q*Q);return this.x=$*Math.cos(J),this.y=Q,this.z=$*Math.sin(J),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var j5=new g,XF=new L7;class x0{constructor(J,Q,$,Z,K,W,X,H,q){if(x0.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],J!==void 0)this.set(J,Q,$,Z,K,W,X,H,q)}set(J,Q,$,Z,K,W,X,H,q){let N=this.elements;return N[0]=J,N[1]=Z,N[2]=X,N[3]=Q,N[4]=K,N[5]=H,N[6]=$,N[7]=W,N[8]=q,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(J){let Q=this.elements,$=J.elements;return Q[0]=$[0],Q[1]=$[1],Q[2]=$[2],Q[3]=$[3],Q[4]=$[4],Q[5]=$[5],Q[6]=$[6],Q[7]=$[7],Q[8]=$[8],this}extractBasis(J,Q,$){return J.setFromMatrix3Column(this,0),Q.setFromMatrix3Column(this,1),$.setFromMatrix3Column(this,2),this}setFromMatrix4(J){let Q=J.elements;return this.set(Q[0],Q[4],Q[8],Q[1],Q[5],Q[9],Q[2],Q[6],Q[10]),this}multiply(J){return this.multiplyMatrices(this,J)}premultiply(J){return this.multiplyMatrices(J,this)}multiplyMatrices(J,Q){let $=J.elements,Z=Q.elements,K=this.elements,W=$[0],X=$[3],H=$[6],q=$[1],N=$[4],Y=$[7],U=$[2],V=$[5],z=$[8],D=Z[0],w=Z[3],F=Z[6],O=Z[1],G=Z[4],R=Z[7],B=Z[2],y=Z[5],C=Z[8];return K[0]=W*D+X*O+H*B,K[3]=W*w+X*G+H*y,K[6]=W*F+X*R+H*C,K[1]=q*D+N*O+Y*B,K[4]=q*w+N*G+Y*y,K[7]=q*F+N*R+Y*C,K[2]=U*D+V*O+z*B,K[5]=U*w+V*G+z*y,K[8]=U*F+V*R+z*C,this}multiplyScalar(J){let Q=this.elements;return Q[0]*=J,Q[3]*=J,Q[6]*=J,Q[1]*=J,Q[4]*=J,Q[7]*=J,Q[2]*=J,Q[5]*=J,Q[8]*=J,this}determinant(){let J=this.elements,Q=J[0],$=J[1],Z=J[2],K=J[3],W=J[4],X=J[5],H=J[6],q=J[7],N=J[8];return Q*W*N-Q*X*q-$*K*N+$*X*H+Z*K*q-Z*W*H}invert(){let J=this.elements,Q=J[0],$=J[1],Z=J[2],K=J[3],W=J[4],X=J[5],H=J[6],q=J[7],N=J[8],Y=N*W-X*q,U=X*H-N*K,V=q*K-W*H,z=Q*Y+$*U+Z*V;if(z===0)return this.set(0,0,0,0,0,0,0,0,0);let D=1/z;return J[0]=Y*D,J[1]=(Z*q-N*$)*D,J[2]=(X*$-Z*W)*D,J[3]=U*D,J[4]=(N*Q-Z*H)*D,J[5]=(Z*K-X*Q)*D,J[6]=V*D,J[7]=($*H-q*Q)*D,J[8]=(W*Q-$*K)*D,this}transpose(){let J,Q=this.elements;return J=Q[1],Q[1]=Q[3],Q[3]=J,J=Q[2],Q[2]=Q[6],Q[6]=J,J=Q[5],Q[5]=Q[7],Q[7]=J,this}getNormalMatrix(J){return this.setFromMatrix4(J).invert().transpose()}transposeIntoArray(J){let Q=this.elements;return J[0]=Q[0],J[1]=Q[3],J[2]=Q[6],J[3]=Q[1],J[4]=Q[4],J[5]=Q[7],J[6]=Q[2],J[7]=Q[5],J[8]=Q[8],this}setUvTransform(J,Q,$,Z,K,W,X){let H=Math.cos(K),q=Math.sin(K);return this.set($*H,$*q,-$*(H*W+q*X)+W+J,-Z*q,Z*H,-Z*(-q*W+H*X)+X+Q,0,0,1),this}scale(J,Q){return this.premultiply(S5.makeScale(J,Q)),this}rotate(J){return this.premultiply(S5.makeRotation(-J)),this}translate(J,Q){return this.premultiply(S5.makeTranslation(J,Q)),this}makeTranslation(J,Q){if(J.isVector2)this.set(1,0,J.x,0,1,J.y,0,0,1);else this.set(1,0,J,0,1,Q,0,0,1);return this}makeRotation(J){let Q=Math.cos(J),$=Math.sin(J);return this.set(Q,-$,0,$,Q,0,0,0,1),this}makeScale(J,Q){return this.set(J,0,0,0,Q,0,0,0,1),this}equals(J){let Q=this.elements,$=J.elements;for(let Z=0;Z<9;Z++)if(Q[Z]!==$[Z])return!1;return!0}fromArray(J,Q=0){for(let $=0;$<9;$++)this.elements[$]=J[$+Q];return this}toArray(J=[],Q=0){let $=this.elements;return J[Q]=$[0],J[Q+1]=$[1],J[Q+2]=$[2],J[Q+3]=$[3],J[Q+4]=$[4],J[Q+5]=$[5],J[Q+6]=$[6],J[Q+7]=$[7],J[Q+8]=$[8],J}clone(){return new this.constructor().fromArray(this.elements)}}var S5=new x0,HF=new x0().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),qF=new x0().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function PM(){let J={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(K,W,X){if(this.enabled===!1||W===X||!W||!X)return K;if(this.spaces[W].transfer==="srgb")K.r=M7(K.r),K.g=M7(K.g),K.b=M7(K.b);if(this.spaces[W].primaries!==this.spaces[X].primaries)K.applyMatrix3(this.spaces[W].toXYZ),K.applyMatrix3(this.spaces[X].fromXYZ);if(this.spaces[X].transfer==="srgb")K.r=N9(K.r),K.g=N9(K.g),K.b=N9(K.b);return K},workingToColorSpace:function(K,W){return this.convert(K,this.workingColorSpace,W)},colorSpaceToWorking:function(K,W){return this.convert(K,W,this.workingColorSpace)},getPrimaries:function(K){return this.spaces[K].primaries},getTransfer:function(K){if(K==="")return"linear";return this.spaces[K].transfer},getToneMappingMode:function(K){return this.spaces[K].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(K,W=this.workingColorSpace){return K.fromArray(this.spaces[W].luminanceCoefficients)},define:function(K){Object.assign(this.spaces,K)},_getMatrix:function(K,W,X){return K.copy(this.spaces[W].toXYZ).multiply(this.spaces[X].fromXYZ)},_getDrawingBufferColorSpace:function(K){return this.spaces[K].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(K=this.workingColorSpace){return this.spaces[K].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(K,W){return NQ("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),J.workingToColorSpace(K,W)},toWorkingColorSpace:function(K,W){return NQ("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),J.colorSpaceToWorking(K,W)}},Q=[0.64,0.33,0.3,0.6,0.15,0.06],$=[0.2126,0.7152,0.0722],Z=[0.3127,0.329];return J.define({["srgb-linear"]:{primaries:Q,whitePoint:Z,transfer:"linear",toXYZ:HF,fromXYZ:qF,luminanceCoefficients:$,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:Q,whitePoint:Z,transfer:"srgb",toXYZ:HF,fromXYZ:qF,luminanceCoefficients:$,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),J}var a0=PM();function M7(J){return J<0.04045?J*0.0773993808:Math.pow(J*0.9478672986+0.0521327014,2.4)}function N9(J){return J<0.0031308?J*12.92:1.055*Math.pow(J,0.41666)-0.055}var aJ;class eX{static getDataURL(J,Q="image/png"){if(/^data:/i.test(J.src))return J.src;if(typeof HTMLCanvasElement>"u")return J.src;let $;if(J instanceof HTMLCanvasElement)$=J;else{if(aJ===void 0)aJ=qQ("canvas");aJ.width=J.width,aJ.height=J.height;let Z=aJ.getContext("2d");if(J instanceof ImageData)Z.putImageData(J,0,0);else Z.drawImage(J,0,0,J.width,J.height);$=aJ}return $.toDataURL(Q)}static sRGBToLinear(J){if(typeof HTMLImageElement<"u"&&J instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&J instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&J instanceof ImageBitmap){let Q=qQ("canvas");Q.width=J.width,Q.height=J.height;let $=Q.getContext("2d");$.drawImage(J,0,0,J.width,J.height);let Z=$.getImageData(0,0,J.width,J.height),K=Z.data;for(let W=0;W<K.length;W++)K[W]=M7(K[W]/255)*255;return $.putImageData(Z,0,0),Q}else if(J.data){let Q=J.data.slice(0);for(let $=0;$<Q.length;$++)if(Q instanceof Uint8Array||Q instanceof Uint8ClampedArray)Q[$]=Math.floor(M7(Q[$]/255)*255);else Q[$]=M7(Q[$]);return{data:Q,width:J.width,height:J.height}}else return b0("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),J}}var jM=0;class kQ{constructor(J=null){this.isSource=!0,Object.defineProperty(this,"id",{value:jM++}),this.uuid=DQ(),this.data=J,this.dataReady=!0,this.version=0}getSize(J){let Q=this.data;if(typeof HTMLVideoElement<"u"&&Q instanceof HTMLVideoElement)J.set(Q.videoWidth,Q.videoHeight,0);else if(typeof VideoFrame<"u"&&Q instanceof VideoFrame)J.set(Q.displayHeight,Q.displayWidth,0);else if(Q!==null)J.set(Q.width,Q.height,Q.depth||0);else J.set(0,0,0);return J}set needsUpdate(J){if(J===!0)this.version++}toJSON(J){let Q=J===void 0||typeof J==="string";if(!Q&&J.images[this.uuid]!==void 0)return J.images[this.uuid];let $={uuid:this.uuid,url:""},Z=this.data;if(Z!==null){let K;if(Array.isArray(Z)){K=[];for(let W=0,X=Z.length;W<X;W++)if(Z[W].isDataTexture)K.push(T5(Z[W].image));else K.push(T5(Z[W]))}else K=T5(Z);$.url=K}if(!Q)J.images[this.uuid]=$;return $}}function T5(J){if(typeof HTMLImageElement<"u"&&J instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&J instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&J instanceof ImageBitmap)return eX.getDataURL(J);else if(J.data)return{data:Array.from(J.data),width:J.width,height:J.height,type:J.data.constructor.name};else return b0("Texture: Unable to serialize Texture."),{}}var SM=0,y5=new g;class e8 extends l7{constructor(J=e8.DEFAULT_IMAGE,Q=e8.DEFAULT_MAPPING,$=1001,Z=1001,K=1006,W=1008,X=1023,H=1009,q=e8.DEFAULT_ANISOTROPY,N=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:SM++}),this.uuid=DQ(),this.name="",this.source=new kQ(J),this.mipmaps=[],this.mapping=Q,this.channel=0,this.wrapS=$,this.wrapT=Z,this.magFilter=K,this.minFilter=W,this.anisotropy=q,this.format=X,this.internalFormat=null,this.type=H,this.offset=new Z8(0,0),this.repeat=new Z8(1,1),this.center=new Z8(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new x0,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=N,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=J&&J.depth&&J.depth>1?!0:!1,this.pmremVersion=0}get width(){return this.source.getSize(y5).x}get height(){return this.source.getSize(y5).y}get depth(){return this.source.getSize(y5).z}get image(){return this.source.data}set image(J=null){this.source.data=J}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(J,Q){this.updateRanges.push({start:J,count:Q})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(J){return this.name=J.name,this.source=J.source,this.mipmaps=J.mipmaps.slice(0),this.mapping=J.mapping,this.channel=J.channel,this.wrapS=J.wrapS,this.wrapT=J.wrapT,this.magFilter=J.magFilter,this.minFilter=J.minFilter,this.anisotropy=J.anisotropy,this.format=J.format,this.internalFormat=J.internalFormat,this.type=J.type,this.offset.copy(J.offset),this.repeat.copy(J.repeat),this.center.copy(J.center),this.rotation=J.rotation,this.matrixAutoUpdate=J.matrixAutoUpdate,this.matrix.copy(J.matrix),this.generateMipmaps=J.generateMipmaps,this.premultiplyAlpha=J.premultiplyAlpha,this.flipY=J.flipY,this.unpackAlignment=J.unpackAlignment,this.colorSpace=J.colorSpace,this.renderTarget=J.renderTarget,this.isRenderTargetTexture=J.isRenderTargetTexture,this.isArrayTexture=J.isArrayTexture,this.userData=JSON.parse(JSON.stringify(J.userData)),this.needsUpdate=!0,this}setValues(J){for(let Q in J){let $=J[Q];if($===void 0){b0(`Texture.setValues(): parameter '${Q}' has value of undefined.`);continue}let Z=this[Q];if(Z===void 0){b0(`Texture.setValues(): property '${Q}' does not exist.`);continue}if(Z&&$&&(Z.isVector2&&$.isVector2))Z.copy($);else if(Z&&$&&(Z.isVector3&&$.isVector3))Z.copy($);else if(Z&&$&&(Z.isMatrix3&&$.isMatrix3))Z.copy($);else this[Q]=$}}toJSON(J){let Q=J===void 0||typeof J==="string";if(!Q&&J.textures[this.uuid]!==void 0)return J.textures[this.uuid];let $={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(J).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)$.userData=this.userData;if(!Q)J.textures[this.uuid]=$;return $}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(J){if(this.mapping!==300)return J;if(J.applyMatrix3(this.matrix),J.x<0||J.x>1)switch(this.wrapS){case 1000:J.x=J.x-Math.floor(J.x);break;case 1001:J.x=J.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(J.x)%2)===1)J.x=Math.ceil(J.x)-J.x;else J.x=J.x-Math.floor(J.x);break}if(J.y<0||J.y>1)switch(this.wrapT){case 1000:J.y=J.y-Math.floor(J.y);break;case 1001:J.y=J.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(J.y)%2)===1)J.y=Math.ceil(J.y)-J.y;else J.y=J.y-Math.floor(J.y);break}if(this.flipY)J.y=1-J.y;return J}set needsUpdate(J){if(J===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(J){if(J===!0)this.pmremVersion++}}e8.DEFAULT_IMAGE=null;e8.DEFAULT_MAPPING=300;e8.DEFAULT_ANISOTROPY=1;class A8{constructor(J=0,Q=0,$=0,Z=1){A8.prototype.isVector4=!0,this.x=J,this.y=Q,this.z=$,this.w=Z}get width(){return this.z}set width(J){this.z=J}get height(){return this.w}set height(J){this.w=J}set(J,Q,$,Z){return this.x=J,this.y=Q,this.z=$,this.w=Z,this}setScalar(J){return this.x=J,this.y=J,this.z=J,this.w=J,this}setX(J){return this.x=J,this}setY(J){return this.y=J,this}setZ(J){return this.z=J,this}setW(J){return this.w=J,this}setComponent(J,Q){switch(J){case 0:this.x=Q;break;case 1:this.y=Q;break;case 2:this.z=Q;break;case 3:this.w=Q;break;default:throw Error("index is out of range: "+J)}return this}getComponent(J){switch(J){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("index is out of range: "+J)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(J){return this.x=J.x,this.y=J.y,this.z=J.z,this.w=J.w!==void 0?J.w:1,this}add(J){return this.x+=J.x,this.y+=J.y,this.z+=J.z,this.w+=J.w,this}addScalar(J){return this.x+=J,this.y+=J,this.z+=J,this.w+=J,this}addVectors(J,Q){return this.x=J.x+Q.x,this.y=J.y+Q.y,this.z=J.z+Q.z,this.w=J.w+Q.w,this}addScaledVector(J,Q){return this.x+=J.x*Q,this.y+=J.y*Q,this.z+=J.z*Q,this.w+=J.w*Q,this}sub(J){return this.x-=J.x,this.y-=J.y,this.z-=J.z,this.w-=J.w,this}subScalar(J){return this.x-=J,this.y-=J,this.z-=J,this.w-=J,this}subVectors(J,Q){return this.x=J.x-Q.x,this.y=J.y-Q.y,this.z=J.z-Q.z,this.w=J.w-Q.w,this}multiply(J){return this.x*=J.x,this.y*=J.y,this.z*=J.z,this.w*=J.w,this}multiplyScalar(J){return this.x*=J,this.y*=J,this.z*=J,this.w*=J,this}applyMatrix4(J){let Q=this.x,$=this.y,Z=this.z,K=this.w,W=J.elements;return this.x=W[0]*Q+W[4]*$+W[8]*Z+W[12]*K,this.y=W[1]*Q+W[5]*$+W[9]*Z+W[13]*K,this.z=W[2]*Q+W[6]*$+W[10]*Z+W[14]*K,this.w=W[3]*Q+W[7]*$+W[11]*Z+W[15]*K,this}divide(J){return this.x/=J.x,this.y/=J.y,this.z/=J.z,this.w/=J.w,this}divideScalar(J){return this.multiplyScalar(1/J)}setAxisAngleFromQuaternion(J){this.w=2*Math.acos(J.w);let Q=Math.sqrt(1-J.w*J.w);if(Q<0.0001)this.x=1,this.y=0,this.z=0;else this.x=J.x/Q,this.y=J.y/Q,this.z=J.z/Q;return this}setAxisAngleFromRotationMatrix(J){let Q,$,Z,K,W=0.01,X=0.1,H=J.elements,q=H[0],N=H[4],Y=H[8],U=H[1],V=H[5],z=H[9],D=H[2],w=H[6],F=H[10];if(Math.abs(N-U)<0.01&&Math.abs(Y-D)<0.01&&Math.abs(z-w)<0.01){if(Math.abs(N+U)<0.1&&Math.abs(Y+D)<0.1&&Math.abs(z+w)<0.1&&Math.abs(q+V+F-3)<0.1)return this.set(1,0,0,0),this;Q=Math.PI;let G=(q+1)/2,R=(V+1)/2,B=(F+1)/2,y=(N+U)/4,C=(Y+D)/4,j=(z+w)/4;if(G>R&&G>B)if(G<0.01)$=0,Z=0.707106781,K=0.707106781;else $=Math.sqrt(G),Z=y/$,K=C/$;else if(R>B)if(R<0.01)$=0.707106781,Z=0,K=0.707106781;else Z=Math.sqrt(R),$=y/Z,K=j/Z;else if(B<0.01)$=0.707106781,Z=0.707106781,K=0;else K=Math.sqrt(B),$=C/K,Z=j/K;return this.set($,Z,K,Q),this}let O=Math.sqrt((w-z)*(w-z)+(Y-D)*(Y-D)+(U-N)*(U-N));if(Math.abs(O)<0.001)O=1;return this.x=(w-z)/O,this.y=(Y-D)/O,this.z=(U-N)/O,this.w=Math.acos((q+V+F-1)/2),this}setFromMatrixPosition(J){let Q=J.elements;return this.x=Q[12],this.y=Q[13],this.z=Q[14],this.w=Q[15],this}min(J){return this.x=Math.min(this.x,J.x),this.y=Math.min(this.y,J.y),this.z=Math.min(this.z,J.z),this.w=Math.min(this.w,J.w),this}max(J){return this.x=Math.max(this.x,J.x),this.y=Math.max(this.y,J.y),this.z=Math.max(this.z,J.z),this.w=Math.max(this.w,J.w),this}clamp(J,Q){return this.x=s0(this.x,J.x,Q.x),this.y=s0(this.y,J.y,Q.y),this.z=s0(this.z,J.z,Q.z),this.w=s0(this.w,J.w,Q.w),this}clampScalar(J,Q){return this.x=s0(this.x,J,Q),this.y=s0(this.y,J,Q),this.z=s0(this.z,J,Q),this.w=s0(this.w,J,Q),this}clampLength(J,Q){let $=this.length();return this.divideScalar($||1).multiplyScalar(s0($,J,Q))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(J){return this.x*J.x+this.y*J.y+this.z*J.z+this.w*J.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(J){return this.normalize().multiplyScalar(J)}lerp(J,Q){return this.x+=(J.x-this.x)*Q,this.y+=(J.y-this.y)*Q,this.z+=(J.z-this.z)*Q,this.w+=(J.w-this.w)*Q,this}lerpVectors(J,Q,$){return this.x=J.x+(Q.x-J.x)*$,this.y=J.y+(Q.y-J.y)*$,this.z=J.z+(Q.z-J.z)*$,this.w=J.w+(Q.w-J.w)*$,this}equals(J){return J.x===this.x&&J.y===this.y&&J.z===this.z&&J.w===this.w}fromArray(J,Q=0){return this.x=J[Q],this.y=J[Q+1],this.z=J[Q+2],this.w=J[Q+3],this}toArray(J=[],Q=0){return J[Q]=this.x,J[Q+1]=this.y,J[Q+2]=this.z,J[Q+3]=this.w,J}fromBufferAttribute(J,Q){return this.x=J.getX(Q),this.y=J.getY(Q),this.z=J.getZ(Q),this.w=J.getW(Q),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class JH extends l7{constructor(J=1,Q=1,$={}){super();$=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},$),this.isRenderTarget=!0,this.width=J,this.height=Q,this.depth=$.depth,this.scissor=new A8(0,0,J,Q),this.scissorTest=!1,this.viewport=new A8(0,0,J,Q),this.textures=[];let Z={width:J,height:Q,depth:$.depth},K=new e8(Z),W=$.count;for(let X=0;X<W;X++)this.textures[X]=K.clone(),this.textures[X].isRenderTargetTexture=!0,this.textures[X].renderTarget=this;this._setTextureOptions($),this.depthBuffer=$.depthBuffer,this.stencilBuffer=$.stencilBuffer,this.resolveDepthBuffer=$.resolveDepthBuffer,this.resolveStencilBuffer=$.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=$.depthTexture,this.samples=$.samples,this.multiview=$.multiview}_setTextureOptions(J={}){let Q={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(J.mapping!==void 0)Q.mapping=J.mapping;if(J.wrapS!==void 0)Q.wrapS=J.wrapS;if(J.wrapT!==void 0)Q.wrapT=J.wrapT;if(J.wrapR!==void 0)Q.wrapR=J.wrapR;if(J.magFilter!==void 0)Q.magFilter=J.magFilter;if(J.minFilter!==void 0)Q.minFilter=J.minFilter;if(J.format!==void 0)Q.format=J.format;if(J.type!==void 0)Q.type=J.type;if(J.anisotropy!==void 0)Q.anisotropy=J.anisotropy;if(J.colorSpace!==void 0)Q.colorSpace=J.colorSpace;if(J.flipY!==void 0)Q.flipY=J.flipY;if(J.generateMipmaps!==void 0)Q.generateMipmaps=J.generateMipmaps;if(J.internalFormat!==void 0)Q.internalFormat=J.internalFormat;for(let $=0;$<this.textures.length;$++)this.textures[$].setValues(Q)}get texture(){return this.textures[0]}set texture(J){this.textures[0]=J}set depthTexture(J){if(this._depthTexture!==null)this._depthTexture.renderTarget=null;if(J!==null)J.renderTarget=this;this._depthTexture=J}get depthTexture(){return this._depthTexture}setSize(J,Q,$=1){if(this.width!==J||this.height!==Q||this.depth!==$){this.width=J,this.height=Q,this.depth=$;for(let Z=0,K=this.textures.length;Z<K;Z++)if(this.textures[Z].image.width=J,this.textures[Z].image.height=Q,this.textures[Z].image.depth=$,this.textures[Z].isData3DTexture!==!0)this.textures[Z].isArrayTexture=this.textures[Z].image.depth>1;this.dispose()}this.viewport.set(0,0,J,Q),this.scissor.set(0,0,J,Q)}clone(){return new this.constructor().copy(this)}copy(J){this.width=J.width,this.height=J.height,this.depth=J.depth,this.scissor.copy(J.scissor),this.scissorTest=J.scissorTest,this.viewport.copy(J.viewport),this.textures.length=0;for(let Q=0,$=J.textures.length;Q<$;Q++){this.textures[Q]=J.textures[Q].clone(),this.textures[Q].isRenderTargetTexture=!0,this.textures[Q].renderTarget=this;let Z=Object.assign({},J.textures[Q].image);this.textures[Q].source=new kQ(Z)}if(this.depthBuffer=J.depthBuffer,this.stencilBuffer=J.stencilBuffer,this.resolveDepthBuffer=J.resolveDepthBuffer,this.resolveStencilBuffer=J.resolveStencilBuffer,J.depthTexture!==null)this.depthTexture=J.depthTexture.clone();return this.samples=J.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class j6 extends JH{constructor(J=1,Q=1,$={}){super(J,Q,$);this.isWebGLRenderTarget=!0}}class lZ extends e8{constructor(J=null,Q=1,$=1,Z=1){super(null);this.isDataArrayTexture=!0,this.image={data:J,width:Q,height:$,depth:Z},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(J){this.layerUpdates.add(J)}clearLayerUpdates(){this.layerUpdates.clear()}}class QH extends e8{constructor(J=null,Q=1,$=1,Z=1){super(null);this.isData3DTexture=!0,this.image={data:J,width:Q,height:$,depth:Z},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class L8{constructor(J,Q,$,Z,K,W,X,H,q,N,Y,U,V,z,D,w){if(L8.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],J!==void 0)this.set(J,Q,$,Z,K,W,X,H,q,N,Y,U,V,z,D,w)}set(J,Q,$,Z,K,W,X,H,q,N,Y,U,V,z,D,w){let F=this.elements;return F[0]=J,F[4]=Q,F[8]=$,F[12]=Z,F[1]=K,F[5]=W,F[9]=X,F[13]=H,F[2]=q,F[6]=N,F[10]=Y,F[14]=U,F[3]=V,F[7]=z,F[11]=D,F[15]=w,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new L8().fromArray(this.elements)}copy(J){let Q=this.elements,$=J.elements;return Q[0]=$[0],Q[1]=$[1],Q[2]=$[2],Q[3]=$[3],Q[4]=$[4],Q[5]=$[5],Q[6]=$[6],Q[7]=$[7],Q[8]=$[8],Q[9]=$[9],Q[10]=$[10],Q[11]=$[11],Q[12]=$[12],Q[13]=$[13],Q[14]=$[14],Q[15]=$[15],this}copyPosition(J){let Q=this.elements,$=J.elements;return Q[12]=$[12],Q[13]=$[13],Q[14]=$[14],this}setFromMatrix3(J){let Q=J.elements;return this.set(Q[0],Q[3],Q[6],0,Q[1],Q[4],Q[7],0,Q[2],Q[5],Q[8],0,0,0,0,1),this}extractBasis(J,Q,$){if(this.determinant()===0)return J.set(1,0,0),Q.set(0,1,0),$.set(0,0,1),this;return J.setFromMatrixColumn(this,0),Q.setFromMatrixColumn(this,1),$.setFromMatrixColumn(this,2),this}makeBasis(J,Q,$){return this.set(J.x,Q.x,$.x,0,J.y,Q.y,$.y,0,J.z,Q.z,$.z,0,0,0,0,1),this}extractRotation(J){if(J.determinant()===0)return this.identity();let Q=this.elements,$=J.elements,Z=1/rJ.setFromMatrixColumn(J,0).length(),K=1/rJ.setFromMatrixColumn(J,1).length(),W=1/rJ.setFromMatrixColumn(J,2).length();return Q[0]=$[0]*Z,Q[1]=$[1]*Z,Q[2]=$[2]*Z,Q[3]=0,Q[4]=$[4]*K,Q[5]=$[5]*K,Q[6]=$[6]*K,Q[7]=0,Q[8]=$[8]*W,Q[9]=$[9]*W,Q[10]=$[10]*W,Q[11]=0,Q[12]=0,Q[13]=0,Q[14]=0,Q[15]=1,this}makeRotationFromEuler(J){let Q=this.elements,$=J.x,Z=J.y,K=J.z,W=Math.cos($),X=Math.sin($),H=Math.cos(Z),q=Math.sin(Z),N=Math.cos(K),Y=Math.sin(K);if(J.order==="XYZ"){let U=W*N,V=W*Y,z=X*N,D=X*Y;Q[0]=H*N,Q[4]=-H*Y,Q[8]=q,Q[1]=V+z*q,Q[5]=U-D*q,Q[9]=-X*H,Q[2]=D-U*q,Q[6]=z+V*q,Q[10]=W*H}else if(J.order==="YXZ"){let U=H*N,V=H*Y,z=q*N,D=q*Y;Q[0]=U+D*X,Q[4]=z*X-V,Q[8]=W*q,Q[1]=W*Y,Q[5]=W*N,Q[9]=-X,Q[2]=V*X-z,Q[6]=D+U*X,Q[10]=W*H}else if(J.order==="ZXY"){let U=H*N,V=H*Y,z=q*N,D=q*Y;Q[0]=U-D*X,Q[4]=-W*Y,Q[8]=z+V*X,Q[1]=V+z*X,Q[5]=W*N,Q[9]=D-U*X,Q[2]=-W*q,Q[6]=X,Q[10]=W*H}else if(J.order==="ZYX"){let U=W*N,V=W*Y,z=X*N,D=X*Y;Q[0]=H*N,Q[4]=z*q-V,Q[8]=U*q+D,Q[1]=H*Y,Q[5]=D*q+U,Q[9]=V*q-z,Q[2]=-q,Q[6]=X*H,Q[10]=W*H}else if(J.order==="YZX"){let U=W*H,V=W*q,z=X*H,D=X*q;Q[0]=H*N,Q[4]=D-U*Y,Q[8]=z*Y+V,Q[1]=Y,Q[5]=W*N,Q[9]=-X*N,Q[2]=-q*N,Q[6]=V*Y+z,Q[10]=U-D*Y}else if(J.order==="XZY"){let U=W*H,V=W*q,z=X*H,D=X*q;Q[0]=H*N,Q[4]=-Y,Q[8]=q*N,Q[1]=U*Y+D,Q[5]=W*N,Q[9]=V*Y-z,Q[2]=z*Y-V,Q[6]=X*N,Q[10]=D*Y+U}return Q[3]=0,Q[7]=0,Q[11]=0,Q[12]=0,Q[13]=0,Q[14]=0,Q[15]=1,this}makeRotationFromQuaternion(J){return this.compose(TM,J,yM)}lookAt(J,Q,$){let Z=this.elements;if(M6.subVectors(J,Q),M6.lengthSq()===0)M6.z=1;if(M6.normalize(),v7.crossVectors($,M6),v7.lengthSq()===0){if(Math.abs($.z)===1)M6.x+=0.0001;else M6.z+=0.0001;M6.normalize(),v7.crossVectors($,M6)}return v7.normalize(),YZ.crossVectors(M6,v7),Z[0]=v7.x,Z[4]=YZ.x,Z[8]=M6.x,Z[1]=v7.y,Z[5]=YZ.y,Z[9]=M6.y,Z[2]=v7.z,Z[6]=YZ.z,Z[10]=M6.z,this}multiply(J){return this.multiplyMatrices(this,J)}premultiply(J){return this.multiplyMatrices(J,this)}multiplyMatrices(J,Q){let $=J.elements,Z=Q.elements,K=this.elements,W=$[0],X=$[4],H=$[8],q=$[12],N=$[1],Y=$[5],U=$[9],V=$[13],z=$[2],D=$[6],w=$[10],F=$[14],O=$[3],G=$[7],R=$[11],B=$[15],y=Z[0],C=Z[4],j=Z[8],M=Z[12],E=Z[1],u=Z[5],_=Z[9],p=Z[13],n=Z[2],f=Z[6],i=Z[10],d=Z[14],m=Z[3],J0=Z[7],Q0=Z[11],U0=Z[15];return K[0]=W*y+X*E+H*n+q*m,K[4]=W*C+X*u+H*f+q*J0,K[8]=W*j+X*_+H*i+q*Q0,K[12]=W*M+X*p+H*d+q*U0,K[1]=N*y+Y*E+U*n+V*m,K[5]=N*C+Y*u+U*f+V*J0,K[9]=N*j+Y*_+U*i+V*Q0,K[13]=N*M+Y*p+U*d+V*U0,K[2]=z*y+D*E+w*n+F*m,K[6]=z*C+D*u+w*f+F*J0,K[10]=z*j+D*_+w*i+F*Q0,K[14]=z*M+D*p+w*d+F*U0,K[3]=O*y+G*E+R*n+B*m,K[7]=O*C+G*u+R*f+B*J0,K[11]=O*j+G*_+R*i+B*Q0,K[15]=O*M+G*p+R*d+B*U0,this}multiplyScalar(J){let Q=this.elements;return Q[0]*=J,Q[4]*=J,Q[8]*=J,Q[12]*=J,Q[1]*=J,Q[5]*=J,Q[9]*=J,Q[13]*=J,Q[2]*=J,Q[6]*=J,Q[10]*=J,Q[14]*=J,Q[3]*=J,Q[7]*=J,Q[11]*=J,Q[15]*=J,this}determinant(){let J=this.elements,Q=J[0],$=J[4],Z=J[8],K=J[12],W=J[1],X=J[5],H=J[9],q=J[13],N=J[2],Y=J[6],U=J[10],V=J[14],z=J[3],D=J[7],w=J[11],F=J[15],O=H*V-q*U,G=X*V-q*Y,R=X*U-H*Y,B=W*V-q*N,y=W*U-H*N,C=W*Y-X*N;return Q*(D*O-w*G+F*R)-$*(z*O-w*B+F*y)+Z*(z*G-D*B+F*C)-K*(z*R-D*y+w*C)}transpose(){let J=this.elements,Q;return Q=J[1],J[1]=J[4],J[4]=Q,Q=J[2],J[2]=J[8],J[8]=Q,Q=J[6],J[6]=J[9],J[9]=Q,Q=J[3],J[3]=J[12],J[12]=Q,Q=J[7],J[7]=J[13],J[13]=Q,Q=J[11],J[11]=J[14],J[14]=Q,this}setPosition(J,Q,$){let Z=this.elements;if(J.isVector3)Z[12]=J.x,Z[13]=J.y,Z[14]=J.z;else Z[12]=J,Z[13]=Q,Z[14]=$;return this}invert(){let J=this.elements,Q=J[0],$=J[1],Z=J[2],K=J[3],W=J[4],X=J[5],H=J[6],q=J[7],N=J[8],Y=J[9],U=J[10],V=J[11],z=J[12],D=J[13],w=J[14],F=J[15],O=Q*X-$*W,G=Q*H-Z*W,R=Q*q-K*W,B=$*H-Z*X,y=$*q-K*X,C=Z*q-K*H,j=N*D-Y*z,M=N*w-U*z,E=N*F-V*z,u=Y*w-U*D,_=Y*F-V*D,p=U*F-V*w,n=O*p-G*_+R*u+B*E-y*M+C*j;if(n===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let f=1/n;return J[0]=(X*p-H*_+q*u)*f,J[1]=(Z*_-$*p-K*u)*f,J[2]=(D*C-w*y+F*B)*f,J[3]=(U*y-Y*C-V*B)*f,J[4]=(H*E-W*p-q*M)*f,J[5]=(Q*p-Z*E+K*M)*f,J[6]=(w*R-z*C-F*G)*f,J[7]=(N*C-U*R+V*G)*f,J[8]=(W*_-X*E+q*j)*f,J[9]=($*E-Q*_-K*j)*f,J[10]=(z*y-D*R+F*O)*f,J[11]=(Y*R-N*y-V*O)*f,J[12]=(X*M-W*u-H*j)*f,J[13]=(Q*u-$*M+Z*j)*f,J[14]=(D*G-z*B-w*O)*f,J[15]=(N*B-Y*G+U*O)*f,this}scale(J){let Q=this.elements,$=J.x,Z=J.y,K=J.z;return Q[0]*=$,Q[4]*=Z,Q[8]*=K,Q[1]*=$,Q[5]*=Z,Q[9]*=K,Q[2]*=$,Q[6]*=Z,Q[10]*=K,Q[3]*=$,Q[7]*=Z,Q[11]*=K,this}getMaxScaleOnAxis(){let J=this.elements,Q=J[0]*J[0]+J[1]*J[1]+J[2]*J[2],$=J[4]*J[4]+J[5]*J[5]+J[6]*J[6],Z=J[8]*J[8]+J[9]*J[9]+J[10]*J[10];return Math.sqrt(Math.max(Q,$,Z))}makeTranslation(J,Q,$){if(J.isVector3)this.set(1,0,0,J.x,0,1,0,J.y,0,0,1,J.z,0,0,0,1);else this.set(1,0,0,J,0,1,0,Q,0,0,1,$,0,0,0,1);return this}makeRotationX(J){let Q=Math.cos(J),$=Math.sin(J);return this.set(1,0,0,0,0,Q,-$,0,0,$,Q,0,0,0,0,1),this}makeRotationY(J){let Q=Math.cos(J),$=Math.sin(J);return this.set(Q,0,$,0,0,1,0,0,-$,0,Q,0,0,0,0,1),this}makeRotationZ(J){let Q=Math.cos(J),$=Math.sin(J);return this.set(Q,-$,0,0,$,Q,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(J,Q){let $=Math.cos(Q),Z=Math.sin(Q),K=1-$,W=J.x,X=J.y,H=J.z,q=K*W,N=K*X;return this.set(q*W+$,q*X-Z*H,q*H+Z*X,0,q*X+Z*H,N*X+$,N*H-Z*W,0,q*H-Z*X,N*H+Z*W,K*H*H+$,0,0,0,0,1),this}makeScale(J,Q,$){return this.set(J,0,0,0,0,Q,0,0,0,0,$,0,0,0,0,1),this}makeShear(J,Q,$,Z,K,W){return this.set(1,$,K,0,J,1,W,0,Q,Z,1,0,0,0,0,1),this}compose(J,Q,$){let Z=this.elements,K=Q._x,W=Q._y,X=Q._z,H=Q._w,q=K+K,N=W+W,Y=X+X,U=K*q,V=K*N,z=K*Y,D=W*N,w=W*Y,F=X*Y,O=H*q,G=H*N,R=H*Y,B=$.x,y=$.y,C=$.z;return Z[0]=(1-(D+F))*B,Z[1]=(V+R)*B,Z[2]=(z-G)*B,Z[3]=0,Z[4]=(V-R)*y,Z[5]=(1-(U+F))*y,Z[6]=(w+O)*y,Z[7]=0,Z[8]=(z+G)*C,Z[9]=(w-O)*C,Z[10]=(1-(U+D))*C,Z[11]=0,Z[12]=J.x,Z[13]=J.y,Z[14]=J.z,Z[15]=1,this}decompose(J,Q,$){let Z=this.elements;J.x=Z[12],J.y=Z[13],J.z=Z[14];let K=this.determinant();if(K===0)return $.set(1,1,1),Q.identity(),this;let W=rJ.set(Z[0],Z[1],Z[2]).length(),X=rJ.set(Z[4],Z[5],Z[6]).length(),H=rJ.set(Z[8],Z[9],Z[10]).length();if(K<0)W=-W;g6.copy(this);let q=1/W,N=1/X,Y=1/H;return g6.elements[0]*=q,g6.elements[1]*=q,g6.elements[2]*=q,g6.elements[4]*=N,g6.elements[5]*=N,g6.elements[6]*=N,g6.elements[8]*=Y,g6.elements[9]*=Y,g6.elements[10]*=Y,Q.setFromRotationMatrix(g6),$.x=W,$.y=X,$.z=H,this}makePerspective(J,Q,$,Z,K,W,X=2000,H=!1){let q=this.elements,N=2*K/(Q-J),Y=2*K/($-Z),U=(Q+J)/(Q-J),V=($+Z)/($-Z),z,D;if(H)z=K/(W-K),D=W*K/(W-K);else if(X===2000)z=-(W+K)/(W-K),D=-2*W*K/(W-K);else if(X===2001)z=-W/(W-K),D=-W*K/(W-K);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+X);return q[0]=N,q[4]=0,q[8]=U,q[12]=0,q[1]=0,q[5]=Y,q[9]=V,q[13]=0,q[2]=0,q[6]=0,q[10]=z,q[14]=D,q[3]=0,q[7]=0,q[11]=-1,q[15]=0,this}makeOrthographic(J,Q,$,Z,K,W,X=2000,H=!1){let q=this.elements,N=2/(Q-J),Y=2/($-Z),U=-(Q+J)/(Q-J),V=-($+Z)/($-Z),z,D;if(H)z=1/(W-K),D=W/(W-K);else if(X===2000)z=-2/(W-K),D=-(W+K)/(W-K);else if(X===2001)z=-1/(W-K),D=-K/(W-K);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+X);return q[0]=N,q[4]=0,q[8]=0,q[12]=U,q[1]=0,q[5]=Y,q[9]=0,q[13]=V,q[2]=0,q[6]=0,q[10]=z,q[14]=D,q[3]=0,q[7]=0,q[11]=0,q[15]=1,this}equals(J){let Q=this.elements,$=J.elements;for(let Z=0;Z<16;Z++)if(Q[Z]!==$[Z])return!1;return!0}fromArray(J,Q=0){for(let $=0;$<16;$++)this.elements[$]=J[$+Q];return this}toArray(J=[],Q=0){let $=this.elements;return J[Q]=$[0],J[Q+1]=$[1],J[Q+2]=$[2],J[Q+3]=$[3],J[Q+4]=$[4],J[Q+5]=$[5],J[Q+6]=$[6],J[Q+7]=$[7],J[Q+8]=$[8],J[Q+9]=$[9],J[Q+10]=$[10],J[Q+11]=$[11],J[Q+12]=$[12],J[Q+13]=$[13],J[Q+14]=$[14],J[Q+15]=$[15],J}}var rJ=new g,g6=new L8,TM=new g(0,0,0),yM=new g(1,1,1),v7=new g,YZ=new g,M6=new g,NF=new L8,YF=new L7;class t6{constructor(J=0,Q=0,$=0,Z=t6.DEFAULT_ORDER){this.isEuler=!0,this._x=J,this._y=Q,this._z=$,this._order=Z}get x(){return this._x}set x(J){this._x=J,this._onChangeCallback()}get y(){return this._y}set y(J){this._y=J,this._onChangeCallback()}get z(){return this._z}set z(J){this._z=J,this._onChangeCallback()}get order(){return this._order}set order(J){this._order=J,this._onChangeCallback()}set(J,Q,$,Z=this._order){return this._x=J,this._y=Q,this._z=$,this._order=Z,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(J){return this._x=J._x,this._y=J._y,this._z=J._z,this._order=J._order,this._onChangeCallback(),this}setFromRotationMatrix(J,Q=this._order,$=!0){let Z=J.elements,K=Z[0],W=Z[4],X=Z[8],H=Z[1],q=Z[5],N=Z[9],Y=Z[2],U=Z[6],V=Z[10];switch(Q){case"XYZ":if(this._y=Math.asin(s0(X,-1,1)),Math.abs(X)<0.9999999)this._x=Math.atan2(-N,V),this._z=Math.atan2(-W,K);else this._x=Math.atan2(U,q),this._z=0;break;case"YXZ":if(this._x=Math.asin(-s0(N,-1,1)),Math.abs(N)<0.9999999)this._y=Math.atan2(X,V),this._z=Math.atan2(H,q);else this._y=Math.atan2(-Y,K),this._z=0;break;case"ZXY":if(this._x=Math.asin(s0(U,-1,1)),Math.abs(U)<0.9999999)this._y=Math.atan2(-Y,V),this._z=Math.atan2(-W,q);else this._y=0,this._z=Math.atan2(H,K);break;case"ZYX":if(this._y=Math.asin(-s0(Y,-1,1)),Math.abs(Y)<0.9999999)this._x=Math.atan2(U,V),this._z=Math.atan2(H,K);else this._x=0,this._z=Math.atan2(-W,q);break;case"YZX":if(this._z=Math.asin(s0(H,-1,1)),Math.abs(H)<0.9999999)this._x=Math.atan2(-N,q),this._y=Math.atan2(-Y,K);else this._x=0,this._y=Math.atan2(X,V);break;case"XZY":if(this._z=Math.asin(-s0(W,-1,1)),Math.abs(W)<0.9999999)this._x=Math.atan2(U,q),this._y=Math.atan2(X,K);else this._x=Math.atan2(-N,V),this._y=0;break;default:b0("Euler: .setFromRotationMatrix() encountered an unknown order: "+Q)}if(this._order=Q,$===!0)this._onChangeCallback();return this}setFromQuaternion(J,Q,$){return NF.makeRotationFromQuaternion(J),this.setFromRotationMatrix(NF,Q,$)}setFromVector3(J,Q=this._order){return this.set(J.x,J.y,J.z,Q)}reorder(J){return YF.setFromEuler(this),this.setFromQuaternion(YF,J)}equals(J){return J._x===this._x&&J._y===this._y&&J._z===this._z&&J._order===this._order}fromArray(J){if(this._x=J[0],this._y=J[1],this._z=J[2],J[3]!==void 0)this._order=J[3];return this._onChangeCallback(),this}toArray(J=[],Q=0){return J[Q]=this._x,J[Q+1]=this._y,J[Q+2]=this._z,J[Q+3]=this._order,J}_onChange(J){return this._onChangeCallback=J,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}t6.DEFAULT_ORDER="XYZ";class cZ{constructor(){this.mask=1}set(J){this.mask=(1<<J|0)>>>0}enable(J){this.mask|=1<<J|0}enableAll(){this.mask=-1}toggle(J){this.mask^=1<<J|0}disable(J){this.mask&=~(1<<J|0)}disableAll(){this.mask=0}test(J){return(this.mask&J.mask)!==0}isEnabled(J){return(this.mask&(1<<J|0))!==0}}var bM=0,UF=new g,tJ=new L7,V7=new L8,UZ=new g,KQ=new g,vM=new g,fM=new L7,VF=new g(1,0,0),OF=new g(0,1,0),FF=new g(0,0,1),zF={type:"added"},hM={type:"removed"},eJ={type:"childadded",child:null},b5={type:"childremoved",child:null};class J6 extends l7{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:bM++}),this.uuid=DQ(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=J6.DEFAULT_UP.clone();let J=new g,Q=new t6,$=new L7,Z=new g(1,1,1);function K(){$.setFromEuler(Q,!1)}function W(){Q.setFromQuaternion($,void 0,!1)}Q._onChange(K),$._onChange(W),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:J},rotation:{configurable:!0,enumerable:!0,value:Q},quaternion:{configurable:!0,enumerable:!0,value:$},scale:{configurable:!0,enumerable:!0,value:Z},modelViewMatrix:{value:new L8},normalMatrix:{value:new x0}}),this.matrix=new L8,this.matrixWorld=new L8,this.matrixAutoUpdate=J6.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=J6.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new cZ,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(J){if(this.matrixAutoUpdate)this.updateMatrix();this.matrix.premultiply(J),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(J){return this.quaternion.premultiply(J),this}setRotationFromAxisAngle(J,Q){this.quaternion.setFromAxisAngle(J,Q)}setRotationFromEuler(J){this.quaternion.setFromEuler(J,!0)}setRotationFromMatrix(J){this.quaternion.setFromRotationMatrix(J)}setRotationFromQuaternion(J){this.quaternion.copy(J)}rotateOnAxis(J,Q){return tJ.setFromAxisAngle(J,Q),this.quaternion.multiply(tJ),this}rotateOnWorldAxis(J,Q){return tJ.setFromAxisAngle(J,Q),this.quaternion.premultiply(tJ),this}rotateX(J){return this.rotateOnAxis(VF,J)}rotateY(J){return this.rotateOnAxis(OF,J)}rotateZ(J){return this.rotateOnAxis(FF,J)}translateOnAxis(J,Q){return UF.copy(J).applyQuaternion(this.quaternion),this.position.add(UF.multiplyScalar(Q)),this}translateX(J){return this.translateOnAxis(VF,J)}translateY(J){return this.translateOnAxis(OF,J)}translateZ(J){return this.translateOnAxis(FF,J)}localToWorld(J){return this.updateWorldMatrix(!0,!1),J.applyMatrix4(this.matrixWorld)}worldToLocal(J){return this.updateWorldMatrix(!0,!1),J.applyMatrix4(V7.copy(this.matrixWorld).invert())}lookAt(J,Q,$){if(J.isVector3)UZ.copy(J);else UZ.set(J,Q,$);let Z=this.parent;if(this.updateWorldMatrix(!0,!1),KQ.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)V7.lookAt(KQ,UZ,this.up);else V7.lookAt(UZ,KQ,this.up);if(this.quaternion.setFromRotationMatrix(V7),Z)V7.extractRotation(Z.matrixWorld),tJ.setFromRotationMatrix(V7),this.quaternion.premultiply(tJ.invert())}add(J){if(arguments.length>1){for(let Q=0;Q<arguments.length;Q++)this.add(arguments[Q]);return this}if(J===this)return y0("Object3D.add: object can't be added as a child of itself.",J),this;if(J&&J.isObject3D)J.removeFromParent(),J.parent=this,this.children.push(J),J.dispatchEvent(zF),eJ.child=J,this.dispatchEvent(eJ),eJ.child=null;else y0("Object3D.add: object not an instance of THREE.Object3D.",J);return this}remove(J){if(arguments.length>1){for(let $=0;$<arguments.length;$++)this.remove(arguments[$]);return this}let Q=this.children.indexOf(J);if(Q!==-1)J.parent=null,this.children.splice(Q,1),J.dispatchEvent(hM),b5.child=J,this.dispatchEvent(b5),b5.child=null;return this}removeFromParent(){let J=this.parent;if(J!==null)J.remove(this);return this}clear(){return this.remove(...this.children)}attach(J){if(this.updateWorldMatrix(!0,!1),V7.copy(this.matrixWorld).invert(),J.parent!==null)J.parent.updateWorldMatrix(!0,!1),V7.multiply(J.parent.matrixWorld);return J.applyMatrix4(V7),J.removeFromParent(),J.parent=this,this.children.push(J),J.updateWorldMatrix(!1,!0),J.dispatchEvent(zF),eJ.child=J,this.dispatchEvent(eJ),eJ.child=null,this}getObjectById(J){return this.getObjectByProperty("id",J)}getObjectByName(J){return this.getObjectByProperty("name",J)}getObjectByProperty(J,Q){if(this[J]===Q)return this;for(let $=0,Z=this.children.length;$<Z;$++){let W=this.children[$].getObjectByProperty(J,Q);if(W!==void 0)return W}return}getObjectsByProperty(J,Q,$=[]){if(this[J]===Q)$.push(this);let Z=this.children;for(let K=0,W=Z.length;K<W;K++)Z[K].getObjectsByProperty(J,Q,$);return $}getWorldPosition(J){return this.updateWorldMatrix(!0,!1),J.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(J){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(KQ,J,vM),J}getWorldScale(J){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(KQ,fM,J),J}getWorldDirection(J){this.updateWorldMatrix(!0,!1);let Q=this.matrixWorld.elements;return J.set(Q[8],Q[9],Q[10]).normalize()}raycast(){}traverse(J){J(this);let Q=this.children;for(let $=0,Z=Q.length;$<Z;$++)Q[$].traverse(J)}traverseVisible(J){if(this.visible===!1)return;J(this);let Q=this.children;for(let $=0,Z=Q.length;$<Z;$++)Q[$].traverseVisible(J)}traverseAncestors(J){let Q=this.parent;if(Q!==null)J(Q),Q.traverseAncestors(J)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let J=this.pivot;if(J!==null){let{x:Q,y:$,z:Z}=J,K=this.matrix.elements;K[12]+=Q-K[0]*Q-K[4]*$-K[8]*Z,K[13]+=$-K[1]*Q-K[5]*$-K[9]*Z,K[14]+=Z-K[2]*Q-K[6]*$-K[10]*Z}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(J){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||J){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,J=!0}let Q=this.children;for(let $=0,Z=Q.length;$<Z;$++)Q[$].updateMatrixWorld(J)}updateWorldMatrix(J,Q){let $=this.parent;if(J===!0&&$!==null)$.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);if(Q===!0){let Z=this.children;for(let K=0,W=Z.length;K<W;K++)Z[K].updateWorldMatrix(!1,!0)}}toJSON(J){let Q=J===void 0||typeof J==="string",$={};if(Q)J={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},$.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let Z={};if(Z.uuid=this.uuid,Z.type=this.type,this.name!=="")Z.name=this.name;if(this.castShadow===!0)Z.castShadow=!0;if(this.receiveShadow===!0)Z.receiveShadow=!0;if(this.visible===!1)Z.visible=!1;if(this.frustumCulled===!1)Z.frustumCulled=!1;if(this.renderOrder!==0)Z.renderOrder=this.renderOrder;if(this.static!==!1)Z.static=this.static;if(Object.keys(this.userData).length>0)Z.userData=this.userData;if(Z.layers=this.layers.mask,Z.matrix=this.matrix.toArray(),Z.up=this.up.toArray(),this.pivot!==null)Z.pivot=this.pivot.toArray();if(this.matrixAutoUpdate===!1)Z.matrixAutoUpdate=!1;if(this.morphTargetDictionary!==void 0)Z.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)Z.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(Z.type="InstancedMesh",Z.count=this.count,Z.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)Z.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(Z.type="BatchedMesh",Z.perObjectFrustumCulled=this.perObjectFrustumCulled,Z.sortObjects=this.sortObjects,Z.drawRanges=this._drawRanges,Z.reservedRanges=this._reservedRanges,Z.geometryInfo=this._geometryInfo.map((X)=>({...X,boundingBox:X.boundingBox?X.boundingBox.toJSON():void 0,boundingSphere:X.boundingSphere?X.boundingSphere.toJSON():void 0})),Z.instanceInfo=this._instanceInfo.map((X)=>({...X})),Z.availableInstanceIds=this._availableInstanceIds.slice(),Z.availableGeometryIds=this._availableGeometryIds.slice(),Z.nextIndexStart=this._nextIndexStart,Z.nextVertexStart=this._nextVertexStart,Z.geometryCount=this._geometryCount,Z.maxInstanceCount=this._maxInstanceCount,Z.maxVertexCount=this._maxVertexCount,Z.maxIndexCount=this._maxIndexCount,Z.geometryInitialized=this._geometryInitialized,Z.matricesTexture=this._matricesTexture.toJSON(J),Z.indirectTexture=this._indirectTexture.toJSON(J),this._colorsTexture!==null)Z.colorsTexture=this._colorsTexture.toJSON(J);if(this.boundingSphere!==null)Z.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)Z.boundingBox=this.boundingBox.toJSON()}function K(X,H){if(X[H.uuid]===void 0)X[H.uuid]=H.toJSON(J);return H.uuid}if(this.isScene){if(this.background){if(this.background.isColor)Z.background=this.background.toJSON();else if(this.background.isTexture)Z.background=this.background.toJSON(J).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)Z.environment=this.environment.toJSON(J).uuid}else if(this.isMesh||this.isLine||this.isPoints){Z.geometry=K(J.geometries,this.geometry);let X=this.geometry.parameters;if(X!==void 0&&X.shapes!==void 0){let H=X.shapes;if(Array.isArray(H))for(let q=0,N=H.length;q<N;q++){let Y=H[q];K(J.shapes,Y)}else K(J.shapes,H)}}if(this.isSkinnedMesh){if(Z.bindMode=this.bindMode,Z.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)K(J.skeletons,this.skeleton),Z.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let X=[];for(let H=0,q=this.material.length;H<q;H++)X.push(K(J.materials,this.material[H]));Z.material=X}else Z.material=K(J.materials,this.material);if(this.children.length>0){Z.children=[];for(let X=0;X<this.children.length;X++)Z.children.push(this.children[X].toJSON(J).object)}if(this.animations.length>0){Z.animations=[];for(let X=0;X<this.animations.length;X++){let H=this.animations[X];Z.animations.push(K(J.animations,H))}}if(Q){let X=W(J.geometries),H=W(J.materials),q=W(J.textures),N=W(J.images),Y=W(J.shapes),U=W(J.skeletons),V=W(J.animations),z=W(J.nodes);if(X.length>0)$.geometries=X;if(H.length>0)$.materials=H;if(q.length>0)$.textures=q;if(N.length>0)$.images=N;if(Y.length>0)$.shapes=Y;if(U.length>0)$.skeletons=U;if(V.length>0)$.animations=V;if(z.length>0)$.nodes=z}return $.object=Z,$;function W(X){let H=[];for(let q in X){let N=X[q];delete N.metadata,H.push(N)}return H}}clone(J){return new this.constructor().copy(this,J)}copy(J,Q=!0){if(this.name=J.name,this.up.copy(J.up),this.position.copy(J.position),this.rotation.order=J.rotation.order,this.quaternion.copy(J.quaternion),this.scale.copy(J.scale),J.pivot!==null)this.pivot=J.pivot.clone();if(this.matrix.copy(J.matrix),this.matrixWorld.copy(J.matrixWorld),this.matrixAutoUpdate=J.matrixAutoUpdate,this.matrixWorldAutoUpdate=J.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=J.matrixWorldNeedsUpdate,this.layers.mask=J.layers.mask,this.visible=J.visible,this.castShadow=J.castShadow,this.receiveShadow=J.receiveShadow,this.frustumCulled=J.frustumCulled,this.renderOrder=J.renderOrder,this.static=J.static,this.animations=J.animations.slice(),this.userData=JSON.parse(JSON.stringify(J.userData)),Q===!0)for(let $=0;$<J.children.length;$++){let Z=J.children[$];this.add(Z.clone())}return this}}J6.DEFAULT_UP=new g(0,1,0);J6.DEFAULT_MATRIX_AUTO_UPDATE=!0;J6.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class q9 extends J6{constructor(){super();this.isGroup=!0,this.type="Group"}}var xM={type:"move"};class MQ{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new q9,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new q9,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new g,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new g;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new q9,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new g,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new g;return this._grip}dispatchEvent(J){if(this._targetRay!==null)this._targetRay.dispatchEvent(J);if(this._grip!==null)this._grip.dispatchEvent(J);if(this._hand!==null)this._hand.dispatchEvent(J);return this}connect(J){if(J&&J.hand){let Q=this._hand;if(Q)for(let $ of J.hand.values())this._getHandJoint(Q,$)}return this.dispatchEvent({type:"connected",data:J}),this}disconnect(J){if(this.dispatchEvent({type:"disconnected",data:J}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(J,Q,$){let Z=null,K=null,W=null,X=this._targetRay,H=this._grip,q=this._hand;if(J&&Q.session.visibilityState!=="visible-blurred"){if(q&&J.hand){W=!0;for(let D of J.hand.values()){let w=Q.getJointPose(D,$),F=this._getHandJoint(q,D);if(w!==null)F.matrix.fromArray(w.transform.matrix),F.matrix.decompose(F.position,F.rotation,F.scale),F.matrixWorldNeedsUpdate=!0,F.jointRadius=w.radius;F.visible=w!==null}let N=q.joints["index-finger-tip"],Y=q.joints["thumb-tip"],U=N.position.distanceTo(Y.position),V=0.02,z=0.005;if(q.inputState.pinching&&U>V+z)q.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:J.handedness,target:this});else if(!q.inputState.pinching&&U<=V-z)q.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:J.handedness,target:this})}else if(H!==null&&J.gripSpace){if(K=Q.getPose(J.gripSpace,$),K!==null){if(H.matrix.fromArray(K.transform.matrix),H.matrix.decompose(H.position,H.rotation,H.scale),H.matrixWorldNeedsUpdate=!0,K.linearVelocity)H.hasLinearVelocity=!0,H.linearVelocity.copy(K.linearVelocity);else H.hasLinearVelocity=!1;if(K.angularVelocity)H.hasAngularVelocity=!0,H.angularVelocity.copy(K.angularVelocity);else H.hasAngularVelocity=!1}}if(X!==null){if(Z=Q.getPose(J.targetRaySpace,$),Z===null&&K!==null)Z=K;if(Z!==null){if(X.matrix.fromArray(Z.transform.matrix),X.matrix.decompose(X.position,X.rotation,X.scale),X.matrixWorldNeedsUpdate=!0,Z.linearVelocity)X.hasLinearVelocity=!0,X.linearVelocity.copy(Z.linearVelocity);else X.hasLinearVelocity=!1;if(Z.angularVelocity)X.hasAngularVelocity=!0,X.angularVelocity.copy(Z.angularVelocity);else X.hasAngularVelocity=!1;this.dispatchEvent(xM)}}}if(X!==null)X.visible=Z!==null;if(H!==null)H.visible=K!==null;if(q!==null)q.visible=W!==null;return this}_getHandJoint(J,Q){if(J.joints[Q.jointName]===void 0){let $=new q9;$.matrixAutoUpdate=!1,$.visible=!1,J.joints[Q.jointName]=$,J.add($)}return J.joints[Q.jointName]}}var Pz={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},f7={h:0,s:0,l:0},VZ={h:0,s:0,l:0};function v5(J,Q,$){if($<0)$+=1;if($>1)$-=1;if($<0.16666666666666666)return J+(Q-J)*6*$;if($<0.5)return Q;if($<0.6666666666666666)return J+(Q-J)*6*(0.6666666666666666-$);return J}class l0{constructor(J,Q,$){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(J,Q,$)}set(J,Q,$){if(Q===void 0&&$===void 0){let Z=J;if(Z&&Z.isColor)this.copy(Z);else if(typeof Z==="number")this.setHex(Z);else if(typeof Z==="string")this.setStyle(Z)}else this.setRGB(J,Q,$);return this}setScalar(J){return this.r=J,this.g=J,this.b=J,this}setHex(J,Q="srgb"){return J=Math.floor(J),this.r=(J>>16&255)/255,this.g=(J>>8&255)/255,this.b=(J&255)/255,a0.colorSpaceToWorking(this,Q),this}setRGB(J,Q,$,Z=a0.workingColorSpace){return this.r=J,this.g=Q,this.b=$,a0.colorSpaceToWorking(this,Z),this}setHSL(J,Q,$,Z=a0.workingColorSpace){if(J=EM(J,1),Q=s0(Q,0,1),$=s0($,0,1),Q===0)this.r=this.g=this.b=$;else{let K=$<=0.5?$*(1+Q):$+Q-$*Q,W=2*$-K;this.r=v5(W,K,J+0.3333333333333333),this.g=v5(W,K,J),this.b=v5(W,K,J-0.3333333333333333)}return a0.colorSpaceToWorking(this,Z),this}setStyle(J,Q="srgb"){function $(K){if(K===void 0)return;if(parseFloat(K)<1)b0("Color: Alpha component of "+J+" will be ignored.")}let Z;if(Z=/^(\w+)\(([^\)]*)\)/.exec(J)){let K,W=Z[1],X=Z[2];switch(W){case"rgb":case"rgba":if(K=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(X))return $(K[4]),this.setRGB(Math.min(255,parseInt(K[1],10))/255,Math.min(255,parseInt(K[2],10))/255,Math.min(255,parseInt(K[3],10))/255,Q);if(K=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(X))return $(K[4]),this.setRGB(Math.min(100,parseInt(K[1],10))/100,Math.min(100,parseInt(K[2],10))/100,Math.min(100,parseInt(K[3],10))/100,Q);break;case"hsl":case"hsla":if(K=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(X))return $(K[4]),this.setHSL(parseFloat(K[1])/360,parseFloat(K[2])/100,parseFloat(K[3])/100,Q);break;default:b0("Color: Unknown color model "+J)}}else if(Z=/^\#([A-Fa-f\d]+)$/.exec(J)){let K=Z[1],W=K.length;if(W===3)return this.setRGB(parseInt(K.charAt(0),16)/15,parseInt(K.charAt(1),16)/15,parseInt(K.charAt(2),16)/15,Q);else if(W===6)return this.setHex(parseInt(K,16),Q);else b0("Color: Invalid hex color "+J)}else if(J&&J.length>0)return this.setColorName(J,Q);return this}setColorName(J,Q="srgb"){let $=Pz[J.toLowerCase()];if($!==void 0)this.setHex($,Q);else b0("Color: Unknown color "+J);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(J){return this.r=J.r,this.g=J.g,this.b=J.b,this}copySRGBToLinear(J){return this.r=M7(J.r),this.g=M7(J.g),this.b=M7(J.b),this}copyLinearToSRGB(J){return this.r=N9(J.r),this.g=N9(J.g),this.b=N9(J.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(J="srgb"){return a0.workingToColorSpace(r8.copy(this),J),Math.round(s0(r8.r*255,0,255))*65536+Math.round(s0(r8.g*255,0,255))*256+Math.round(s0(r8.b*255,0,255))}getHexString(J="srgb"){return("000000"+this.getHex(J).toString(16)).slice(-6)}getHSL(J,Q=a0.workingColorSpace){a0.workingToColorSpace(r8.copy(this),Q);let{r:$,g:Z,b:K}=r8,W=Math.max($,Z,K),X=Math.min($,Z,K),H,q,N=(X+W)/2;if(X===W)H=0,q=0;else{let Y=W-X;switch(q=N<=0.5?Y/(W+X):Y/(2-W-X),W){case $:H=(Z-K)/Y+(Z<K?6:0);break;case Z:H=(K-$)/Y+2;break;case K:H=($-Z)/Y+4;break}H/=6}return J.h=H,J.s=q,J.l=N,J}getRGB(J,Q=a0.workingColorSpace){return a0.workingToColorSpace(r8.copy(this),Q),J.r=r8.r,J.g=r8.g,J.b=r8.b,J}getStyle(J="srgb"){a0.workingToColorSpace(r8.copy(this),J);let{r:Q,g:$,b:Z}=r8;if(J!=="srgb")return`color(${J} ${Q.toFixed(3)} ${$.toFixed(3)} ${Z.toFixed(3)})`;return`rgb(${Math.round(Q*255)},${Math.round($*255)},${Math.round(Z*255)})`}offsetHSL(J,Q,$){return this.getHSL(f7),this.setHSL(f7.h+J,f7.s+Q,f7.l+$)}add(J){return this.r+=J.r,this.g+=J.g,this.b+=J.b,this}addColors(J,Q){return this.r=J.r+Q.r,this.g=J.g+Q.g,this.b=J.b+Q.b,this}addScalar(J){return this.r+=J,this.g+=J,this.b+=J,this}sub(J){return this.r=Math.max(0,this.r-J.r),this.g=Math.max(0,this.g-J.g),this.b=Math.max(0,this.b-J.b),this}multiply(J){return this.r*=J.r,this.g*=J.g,this.b*=J.b,this}multiplyScalar(J){return this.r*=J,this.g*=J,this.b*=J,this}lerp(J,Q){return this.r+=(J.r-this.r)*Q,this.g+=(J.g-this.g)*Q,this.b+=(J.b-this.b)*Q,this}lerpColors(J,Q,$){return this.r=J.r+(Q.r-J.r)*$,this.g=J.g+(Q.g-J.g)*$,this.b=J.b+(Q.b-J.b)*$,this}lerpHSL(J,Q){this.getHSL(f7),J.getHSL(VZ);let $=P5(f7.h,VZ.h,Q),Z=P5(f7.s,VZ.s,Q),K=P5(f7.l,VZ.l,Q);return this.setHSL($,Z,K),this}setFromVector3(J){return this.r=J.x,this.g=J.y,this.b=J.z,this}applyMatrix3(J){let Q=this.r,$=this.g,Z=this.b,K=J.elements;return this.r=K[0]*Q+K[3]*$+K[6]*Z,this.g=K[1]*Q+K[4]*$+K[7]*Z,this.b=K[2]*Q+K[5]*$+K[8]*Z,this}equals(J){return J.r===this.r&&J.g===this.g&&J.b===this.b}fromArray(J,Q=0){return this.r=J[Q],this.g=J[Q+1],this.b=J[Q+2],this}toArray(J=[],Q=0){return J[Q]=this.r,J[Q+1]=this.g,J[Q+2]=this.b,J}fromBufferAttribute(J,Q){return this.r=J.getX(Q),this.g=J.getY(Q),this.b=J.getZ(Q),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var r8=new l0;l0.NAMES=Pz;class wQ{constructor(J,Q=0.00025){this.isFogExp2=!0,this.name="",this.color=new l0(J),this.density=Q}clone(){return new wQ(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class uZ extends J6{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new t6,this.environmentIntensity=1,this.environmentRotation=new t6,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(J,Q){if(super.copy(J,Q),J.background!==null)this.background=J.background.clone();if(J.environment!==null)this.environment=J.environment.clone();if(J.fog!==null)this.fog=J.fog.clone();if(this.backgroundBlurriness=J.backgroundBlurriness,this.backgroundIntensity=J.backgroundIntensity,this.backgroundRotation.copy(J.backgroundRotation),this.environmentIntensity=J.environmentIntensity,this.environmentRotation.copy(J.environmentRotation),J.overrideMaterial!==null)this.overrideMaterial=J.overrideMaterial.clone();return this.matrixAutoUpdate=J.matrixAutoUpdate,this}toJSON(J){let Q=super.toJSON(J);if(this.fog!==null)Q.object.fog=this.fog.toJSON();if(this.backgroundBlurriness>0)Q.object.backgroundBlurriness=this.backgroundBlurriness;if(this.backgroundIntensity!==1)Q.object.backgroundIntensity=this.backgroundIntensity;if(Q.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1)Q.object.environmentIntensity=this.environmentIntensity;return Q.object.environmentRotation=this.environmentRotation.toArray(),Q}}var p6=new g,O7=new g,f5=new g,F7=new g,J9=new g,Q9=new g,DF=new g,h5=new g,x5=new g,g5=new g,p5=new A8,m5=new A8,d5=new A8;class P6{constructor(J=new g,Q=new g,$=new g){this.a=J,this.b=Q,this.c=$}static getNormal(J,Q,$,Z){Z.subVectors($,Q),p6.subVectors(J,Q),Z.cross(p6);let K=Z.lengthSq();if(K>0)return Z.multiplyScalar(1/Math.sqrt(K));return Z.set(0,0,0)}static getBarycoord(J,Q,$,Z,K){p6.subVectors(Z,Q),O7.subVectors($,Q),f5.subVectors(J,Q);let W=p6.dot(p6),X=p6.dot(O7),H=p6.dot(f5),q=O7.dot(O7),N=O7.dot(f5),Y=W*q-X*X;if(Y===0)return K.set(0,0,0),null;let U=1/Y,V=(q*H-X*N)*U,z=(W*N-X*H)*U;return K.set(1-V-z,z,V)}static containsPoint(J,Q,$,Z){if(this.getBarycoord(J,Q,$,Z,F7)===null)return!1;return F7.x>=0&&F7.y>=0&&F7.x+F7.y<=1}static getInterpolation(J,Q,$,Z,K,W,X,H){if(this.getBarycoord(J,Q,$,Z,F7)===null){if(H.x=0,H.y=0,"z"in H)H.z=0;if("w"in H)H.w=0;return null}return H.setScalar(0),H.addScaledVector(K,F7.x),H.addScaledVector(W,F7.y),H.addScaledVector(X,F7.z),H}static getInterpolatedAttribute(J,Q,$,Z,K,W){return p5.setScalar(0),m5.setScalar(0),d5.setScalar(0),p5.fromBufferAttribute(J,Q),m5.fromBufferAttribute(J,$),d5.fromBufferAttribute(J,Z),W.setScalar(0),W.addScaledVector(p5,K.x),W.addScaledVector(m5,K.y),W.addScaledVector(d5,K.z),W}static isFrontFacing(J,Q,$,Z){return p6.subVectors($,Q),O7.subVectors(J,Q),p6.cross(O7).dot(Z)<0?!0:!1}set(J,Q,$){return this.a.copy(J),this.b.copy(Q),this.c.copy($),this}setFromPointsAndIndices(J,Q,$,Z){return this.a.copy(J[Q]),this.b.copy(J[$]),this.c.copy(J[Z]),this}setFromAttributeAndIndices(J,Q,$,Z){return this.a.fromBufferAttribute(J,Q),this.b.fromBufferAttribute(J,$),this.c.fromBufferAttribute(J,Z),this}clone(){return new this.constructor().copy(this)}copy(J){return this.a.copy(J.a),this.b.copy(J.b),this.c.copy(J.c),this}getArea(){return p6.subVectors(this.c,this.b),O7.subVectors(this.a,this.b),p6.cross(O7).length()*0.5}getMidpoint(J){return J.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(J){return P6.getNormal(this.a,this.b,this.c,J)}getPlane(J){return J.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(J,Q){return P6.getBarycoord(J,this.a,this.b,this.c,Q)}getInterpolation(J,Q,$,Z,K){return P6.getInterpolation(J,this.a,this.b,this.c,Q,$,Z,K)}containsPoint(J){return P6.containsPoint(J,this.a,this.b,this.c)}isFrontFacing(J){return P6.isFrontFacing(this.a,this.b,this.c,J)}intersectsBox(J){return J.intersectsTriangle(this)}closestPointToPoint(J,Q){let $=this.a,Z=this.b,K=this.c,W,X;J9.subVectors(Z,$),Q9.subVectors(K,$),h5.subVectors(J,$);let H=J9.dot(h5),q=Q9.dot(h5);if(H<=0&&q<=0)return Q.copy($);x5.subVectors(J,Z);let N=J9.dot(x5),Y=Q9.dot(x5);if(N>=0&&Y<=N)return Q.copy(Z);let U=H*Y-N*q;if(U<=0&&H>=0&&N<=0)return W=H/(H-N),Q.copy($).addScaledVector(J9,W);g5.subVectors(J,K);let V=J9.dot(g5),z=Q9.dot(g5);if(z>=0&&V<=z)return Q.copy(K);let D=V*q-H*z;if(D<=0&&q>=0&&z<=0)return X=q/(q-z),Q.copy($).addScaledVector(Q9,X);let w=N*z-V*Y;if(w<=0&&Y-N>=0&&V-z>=0)return DF.subVectors(K,Z),X=(Y-N)/(Y-N+(V-z)),Q.copy(Z).addScaledVector(DF,X);let F=1/(w+D+U);return W=D*F,X=U*F,Q.copy($).addScaledVector(J9,W).addScaledVector(Q9,X)}equals(J){return J.a.equals(this.a)&&J.b.equals(this.b)&&J.c.equals(this.c)}}class FJ{constructor(J=new g(1/0,1/0,1/0),Q=new g(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=J,this.max=Q}set(J,Q){return this.min.copy(J),this.max.copy(Q),this}setFromArray(J){this.makeEmpty();for(let Q=0,$=J.length;Q<$;Q+=3)this.expandByPoint(m6.fromArray(J,Q));return this}setFromBufferAttribute(J){this.makeEmpty();for(let Q=0,$=J.count;Q<$;Q++)this.expandByPoint(m6.fromBufferAttribute(J,Q));return this}setFromPoints(J){this.makeEmpty();for(let Q=0,$=J.length;Q<$;Q++)this.expandByPoint(J[Q]);return this}setFromCenterAndSize(J,Q){let $=m6.copy(Q).multiplyScalar(0.5);return this.min.copy(J).sub($),this.max.copy(J).add($),this}setFromObject(J,Q=!1){return this.makeEmpty(),this.expandByObject(J,Q)}clone(){return new this.constructor().copy(this)}copy(J){return this.min.copy(J.min),this.max.copy(J.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(J){return this.isEmpty()?J.set(0,0,0):J.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(J){return this.isEmpty()?J.set(0,0,0):J.subVectors(this.max,this.min)}expandByPoint(J){return this.min.min(J),this.max.max(J),this}expandByVector(J){return this.min.sub(J),this.max.add(J),this}expandByScalar(J){return this.min.addScalar(-J),this.max.addScalar(J),this}expandByObject(J,Q=!1){J.updateWorldMatrix(!1,!1);let $=J.geometry;if($!==void 0){let K=$.getAttribute("position");if(Q===!0&&K!==void 0&&J.isInstancedMesh!==!0)for(let W=0,X=K.count;W<X;W++){if(J.isMesh===!0)J.getVertexPosition(W,m6);else m6.fromBufferAttribute(K,W);m6.applyMatrix4(J.matrixWorld),this.expandByPoint(m6)}else{if(J.boundingBox!==void 0){if(J.boundingBox===null)J.computeBoundingBox();OZ.copy(J.boundingBox)}else{if($.boundingBox===null)$.computeBoundingBox();OZ.copy($.boundingBox)}OZ.applyMatrix4(J.matrixWorld),this.union(OZ)}}let Z=J.children;for(let K=0,W=Z.length;K<W;K++)this.expandByObject(Z[K],Q);return this}containsPoint(J){return J.x>=this.min.x&&J.x<=this.max.x&&J.y>=this.min.y&&J.y<=this.max.y&&J.z>=this.min.z&&J.z<=this.max.z}containsBox(J){return this.min.x<=J.min.x&&J.max.x<=this.max.x&&this.min.y<=J.min.y&&J.max.y<=this.max.y&&this.min.z<=J.min.z&&J.max.z<=this.max.z}getParameter(J,Q){return Q.set((J.x-this.min.x)/(this.max.x-this.min.x),(J.y-this.min.y)/(this.max.y-this.min.y),(J.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(J){return J.max.x>=this.min.x&&J.min.x<=this.max.x&&J.max.y>=this.min.y&&J.min.y<=this.max.y&&J.max.z>=this.min.z&&J.min.z<=this.max.z}intersectsSphere(J){return this.clampPoint(J.center,m6),m6.distanceToSquared(J.center)<=J.radius*J.radius}intersectsPlane(J){let Q,$;if(J.normal.x>0)Q=J.normal.x*this.min.x,$=J.normal.x*this.max.x;else Q=J.normal.x*this.max.x,$=J.normal.x*this.min.x;if(J.normal.y>0)Q+=J.normal.y*this.min.y,$+=J.normal.y*this.max.y;else Q+=J.normal.y*this.max.y,$+=J.normal.y*this.min.y;if(J.normal.z>0)Q+=J.normal.z*this.min.z,$+=J.normal.z*this.max.z;else Q+=J.normal.z*this.max.z,$+=J.normal.z*this.min.z;return Q<=-J.constant&&$>=-J.constant}intersectsTriangle(J){if(this.isEmpty())return!1;this.getCenter(WQ),FZ.subVectors(this.max,WQ),$9.subVectors(J.a,WQ),Z9.subVectors(J.b,WQ),K9.subVectors(J.c,WQ),h7.subVectors(Z9,$9),x7.subVectors(K9,Z9),WJ.subVectors($9,K9);let Q=[0,-h7.z,h7.y,0,-x7.z,x7.y,0,-WJ.z,WJ.y,h7.z,0,-h7.x,x7.z,0,-x7.x,WJ.z,0,-WJ.x,-h7.y,h7.x,0,-x7.y,x7.x,0,-WJ.y,WJ.x,0];if(!l5(Q,$9,Z9,K9,FZ))return!1;if(Q=[1,0,0,0,1,0,0,0,1],!l5(Q,$9,Z9,K9,FZ))return!1;return zZ.crossVectors(h7,x7),Q=[zZ.x,zZ.y,zZ.z],l5(Q,$9,Z9,K9,FZ)}clampPoint(J,Q){return Q.copy(J).clamp(this.min,this.max)}distanceToPoint(J){return this.clampPoint(J,m6).distanceTo(J)}getBoundingSphere(J){if(this.isEmpty())J.makeEmpty();else this.getCenter(J.center),J.radius=this.getSize(m6).length()*0.5;return J}intersect(J){if(this.min.max(J.min),this.max.min(J.max),this.isEmpty())this.makeEmpty();return this}union(J){return this.min.min(J.min),this.max.max(J.max),this}applyMatrix4(J){if(this.isEmpty())return this;return z7[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(J),z7[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(J),z7[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(J),z7[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(J),z7[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(J),z7[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(J),z7[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(J),z7[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(J),this.setFromPoints(z7),this}translate(J){return this.min.add(J),this.max.add(J),this}equals(J){return J.min.equals(this.min)&&J.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(J){return this.min.fromArray(J.min),this.max.fromArray(J.max),this}}var z7=[new g,new g,new g,new g,new g,new g,new g,new g],m6=new g,OZ=new FJ,$9=new g,Z9=new g,K9=new g,h7=new g,x7=new g,WJ=new g,WQ=new g,FZ=new g,zZ=new g,XJ=new g;function l5(J,Q,$,Z,K){for(let W=0,X=J.length-3;W<=X;W+=3){XJ.fromArray(J,W);let H=K.x*Math.abs(XJ.x)+K.y*Math.abs(XJ.y)+K.z*Math.abs(XJ.z),q=Q.dot(XJ),N=$.dot(XJ),Y=Z.dot(XJ);if(Math.max(-Math.max(q,N,Y),Math.min(q,N,Y))>H)return!1}return!0}var y8=new g,DZ=new Z8,gM=0;class K6{constructor(J,Q,$=!1){if(Array.isArray(J))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:gM++}),this.name="",this.array=J,this.itemSize=Q,this.count=J!==void 0?J.length/Q:0,this.normalized=$,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(J){if(J===!0)this.version++}setUsage(J){return this.usage=J,this}addUpdateRange(J,Q){this.updateRanges.push({start:J,count:Q})}clearUpdateRanges(){this.updateRanges.length=0}copy(J){return this.name=J.name,this.array=new J.array.constructor(J.array),this.itemSize=J.itemSize,this.count=J.count,this.normalized=J.normalized,this.usage=J.usage,this.gpuType=J.gpuType,this}copyAt(J,Q,$){J*=this.itemSize,$*=Q.itemSize;for(let Z=0,K=this.itemSize;Z<K;Z++)this.array[J+Z]=Q.array[$+Z];return this}copyArray(J){return this.array.set(J),this}applyMatrix3(J){if(this.itemSize===2)for(let Q=0,$=this.count;Q<$;Q++)DZ.fromBufferAttribute(this,Q),DZ.applyMatrix3(J),this.setXY(Q,DZ.x,DZ.y);else if(this.itemSize===3)for(let Q=0,$=this.count;Q<$;Q++)y8.fromBufferAttribute(this,Q),y8.applyMatrix3(J),this.setXYZ(Q,y8.x,y8.y,y8.z);return this}applyMatrix4(J){for(let Q=0,$=this.count;Q<$;Q++)y8.fromBufferAttribute(this,Q),y8.applyMatrix4(J),this.setXYZ(Q,y8.x,y8.y,y8.z);return this}applyNormalMatrix(J){for(let Q=0,$=this.count;Q<$;Q++)y8.fromBufferAttribute(this,Q),y8.applyNormalMatrix(J),this.setXYZ(Q,y8.x,y8.y,y8.z);return this}transformDirection(J){for(let Q=0,$=this.count;Q<$;Q++)y8.fromBufferAttribute(this,Q),y8.transformDirection(J),this.setXYZ(Q,y8.x,y8.y,y8.z);return this}set(J,Q=0){return this.array.set(J,Q),this}getComponent(J,Q){let $=this.array[J*this.itemSize+Q];if(this.normalized)$=ZQ($,this.array);return $}setComponent(J,Q,$){if(this.normalized)$=N6($,this.array);return this.array[J*this.itemSize+Q]=$,this}getX(J){let Q=this.array[J*this.itemSize];if(this.normalized)Q=ZQ(Q,this.array);return Q}setX(J,Q){if(this.normalized)Q=N6(Q,this.array);return this.array[J*this.itemSize]=Q,this}getY(J){let Q=this.array[J*this.itemSize+1];if(this.normalized)Q=ZQ(Q,this.array);return Q}setY(J,Q){if(this.normalized)Q=N6(Q,this.array);return this.array[J*this.itemSize+1]=Q,this}getZ(J){let Q=this.array[J*this.itemSize+2];if(this.normalized)Q=ZQ(Q,this.array);return Q}setZ(J,Q){if(this.normalized)Q=N6(Q,this.array);return this.array[J*this.itemSize+2]=Q,this}getW(J){let Q=this.array[J*this.itemSize+3];if(this.normalized)Q=ZQ(Q,this.array);return Q}setW(J,Q){if(this.normalized)Q=N6(Q,this.array);return this.array[J*this.itemSize+3]=Q,this}setXY(J,Q,$){if(J*=this.itemSize,this.normalized)Q=N6(Q,this.array),$=N6($,this.array);return this.array[J+0]=Q,this.array[J+1]=$,this}setXYZ(J,Q,$,Z){if(J*=this.itemSize,this.normalized)Q=N6(Q,this.array),$=N6($,this.array),Z=N6(Z,this.array);return this.array[J+0]=Q,this.array[J+1]=$,this.array[J+2]=Z,this}setXYZW(J,Q,$,Z,K){if(J*=this.itemSize,this.normalized)Q=N6(Q,this.array),$=N6($,this.array),Z=N6(Z,this.array),K=N6(K,this.array);return this.array[J+0]=Q,this.array[J+1]=$,this.array[J+2]=Z,this.array[J+3]=K,this}onUpload(J){return this.onUploadCallback=J,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let J={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};if(this.name!=="")J.name=this.name;if(this.usage!==35044)J.usage=this.usage;return J}}class sZ extends K6{constructor(J,Q,$){super(new Uint16Array(J),Q,$)}}class nZ extends K6{constructor(J,Q,$){super(new Uint32Array(J),Q,$)}}class d6 extends K6{constructor(J,Q,$){super(new Float32Array(J),Q,$)}}var pM=new FJ,XQ=new g,c5=new g;class k9{constructor(J=new g,Q=-1){this.isSphere=!0,this.center=J,this.radius=Q}set(J,Q){return this.center.copy(J),this.radius=Q,this}setFromPoints(J,Q){let $=this.center;if(Q!==void 0)$.copy(Q);else pM.setFromPoints(J).getCenter($);let Z=0;for(let K=0,W=J.length;K<W;K++)Z=Math.max(Z,$.distanceToSquared(J[K]));return this.radius=Math.sqrt(Z),this}copy(J){return this.center.copy(J.center),this.radius=J.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(J){return J.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(J){return J.distanceTo(this.center)-this.radius}intersectsSphere(J){let Q=this.radius+J.radius;return J.center.distanceToSquared(this.center)<=Q*Q}intersectsBox(J){return J.intersectsSphere(this)}intersectsPlane(J){return Math.abs(J.distanceToPoint(this.center))<=this.radius}clampPoint(J,Q){let $=this.center.distanceToSquared(J);if(Q.copy(J),$>this.radius*this.radius)Q.sub(this.center).normalize(),Q.multiplyScalar(this.radius).add(this.center);return Q}getBoundingBox(J){if(this.isEmpty())return J.makeEmpty(),J;return J.set(this.center,this.center),J.expandByScalar(this.radius),J}applyMatrix4(J){return this.center.applyMatrix4(J),this.radius=this.radius*J.getMaxScaleOnAxis(),this}translate(J){return this.center.add(J),this}expandByPoint(J){if(this.isEmpty())return this.center.copy(J),this.radius=0,this;XQ.subVectors(J,this.center);let Q=XQ.lengthSq();if(Q>this.radius*this.radius){let $=Math.sqrt(Q),Z=($-this.radius)*0.5;this.center.addScaledVector(XQ,Z/$),this.radius+=Z}return this}union(J){if(J.isEmpty())return this;if(this.isEmpty())return this.copy(J),this;if(this.center.equals(J.center)===!0)this.radius=Math.max(this.radius,J.radius);else c5.subVectors(J.center,this.center).setLength(J.radius),this.expandByPoint(XQ.copy(J.center).add(c5)),this.expandByPoint(XQ.copy(J.center).sub(c5));return this}equals(J){return J.center.equals(this.center)&&J.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(J){return this.radius=J.radius,this.center.fromArray(J.center),this}}var mM=0,E6=new L8,u5=new J6,W9=new g,w6=new FJ,HQ=new FJ,p8=new g;class I6 extends l7{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:mM++}),this.uuid=DQ(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(J){if(Array.isArray(J))this.index=new((CM(J))?nZ:sZ)(J,1);else this.index=J;return this}setIndirect(J,Q=0){return this.indirect=J,this.indirectOffset=Q,this}getIndirect(){return this.indirect}getAttribute(J){return this.attributes[J]}setAttribute(J,Q){return this.attributes[J]=Q,this}deleteAttribute(J){return delete this.attributes[J],this}hasAttribute(J){return this.attributes[J]!==void 0}addGroup(J,Q,$=0){this.groups.push({start:J,count:Q,materialIndex:$})}clearGroups(){this.groups=[]}setDrawRange(J,Q){this.drawRange.start=J,this.drawRange.count=Q}applyMatrix4(J){let Q=this.attributes.position;if(Q!==void 0)Q.applyMatrix4(J),Q.needsUpdate=!0;let $=this.attributes.normal;if($!==void 0){let K=new x0().getNormalMatrix(J);$.applyNormalMatrix(K),$.needsUpdate=!0}let Z=this.attributes.tangent;if(Z!==void 0)Z.transformDirection(J),Z.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this}applyQuaternion(J){return E6.makeRotationFromQuaternion(J),this.applyMatrix4(E6),this}rotateX(J){return E6.makeRotationX(J),this.applyMatrix4(E6),this}rotateY(J){return E6.makeRotationY(J),this.applyMatrix4(E6),this}rotateZ(J){return E6.makeRotationZ(J),this.applyMatrix4(E6),this}translate(J,Q,$){return E6.makeTranslation(J,Q,$),this.applyMatrix4(E6),this}scale(J,Q,$){return E6.makeScale(J,Q,$),this.applyMatrix4(E6),this}lookAt(J){return u5.lookAt(J),u5.updateMatrix(),this.applyMatrix4(u5.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(W9).negate(),this.translate(W9.x,W9.y,W9.z),this}setFromPoints(J){let Q=this.getAttribute("position");if(Q===void 0){let $=[];for(let Z=0,K=J.length;Z<K;Z++){let W=J[Z];$.push(W.x,W.y,W.z||0)}this.setAttribute("position",new d6($,3))}else{let $=Math.min(J.length,Q.count);for(let Z=0;Z<$;Z++){let K=J[Z];Q.setXYZ(Z,K.x,K.y,K.z||0)}if(J.length>Q.count)b0("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");Q.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new FJ;let J=this.attributes.position,Q=this.morphAttributes.position;if(J&&J.isGLBufferAttribute){y0("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new g(-1/0,-1/0,-1/0),new g(1/0,1/0,1/0));return}if(J!==void 0){if(this.boundingBox.setFromBufferAttribute(J),Q)for(let $=0,Z=Q.length;$<Z;$++){let K=Q[$];if(w6.setFromBufferAttribute(K),this.morphTargetsRelative)p8.addVectors(this.boundingBox.min,w6.min),this.boundingBox.expandByPoint(p8),p8.addVectors(this.boundingBox.max,w6.max),this.boundingBox.expandByPoint(p8);else this.boundingBox.expandByPoint(w6.min),this.boundingBox.expandByPoint(w6.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))y0('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new k9;let J=this.attributes.position,Q=this.morphAttributes.position;if(J&&J.isGLBufferAttribute){y0("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new g,1/0);return}if(J){let $=this.boundingSphere.center;if(w6.setFromBufferAttribute(J),Q)for(let K=0,W=Q.length;K<W;K++){let X=Q[K];if(HQ.setFromBufferAttribute(X),this.morphTargetsRelative)p8.addVectors(w6.min,HQ.min),w6.expandByPoint(p8),p8.addVectors(w6.max,HQ.max),w6.expandByPoint(p8);else w6.expandByPoint(HQ.min),w6.expandByPoint(HQ.max)}w6.getCenter($);let Z=0;for(let K=0,W=J.count;K<W;K++)p8.fromBufferAttribute(J,K),Z=Math.max(Z,$.distanceToSquared(p8));if(Q)for(let K=0,W=Q.length;K<W;K++){let X=Q[K],H=this.morphTargetsRelative;for(let q=0,N=X.count;q<N;q++){if(p8.fromBufferAttribute(X,q),H)W9.fromBufferAttribute(J,q),p8.add(W9);Z=Math.max(Z,$.distanceToSquared(p8))}}if(this.boundingSphere.radius=Math.sqrt(Z),isNaN(this.boundingSphere.radius))y0('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let J=this.index,Q=this.attributes;if(J===null||Q.position===void 0||Q.normal===void 0||Q.uv===void 0){y0("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:$,normal:Z,uv:K}=Q;if(this.hasAttribute("tangent")===!1)this.setAttribute("tangent",new K6(new Float32Array(4*$.count),4));let W=this.getAttribute("tangent"),X=[],H=[];for(let j=0;j<$.count;j++)X[j]=new g,H[j]=new g;let q=new g,N=new g,Y=new g,U=new Z8,V=new Z8,z=new Z8,D=new g,w=new g;function F(j,M,E){q.fromBufferAttribute($,j),N.fromBufferAttribute($,M),Y.fromBufferAttribute($,E),U.fromBufferAttribute(K,j),V.fromBufferAttribute(K,M),z.fromBufferAttribute(K,E),N.sub(q),Y.sub(q),V.sub(U),z.sub(U);let u=1/(V.x*z.y-z.x*V.y);if(!isFinite(u))return;D.copy(N).multiplyScalar(z.y).addScaledVector(Y,-V.y).multiplyScalar(u),w.copy(Y).multiplyScalar(V.x).addScaledVector(N,-z.x).multiplyScalar(u),X[j].add(D),X[M].add(D),X[E].add(D),H[j].add(w),H[M].add(w),H[E].add(w)}let O=this.groups;if(O.length===0)O=[{start:0,count:J.count}];for(let j=0,M=O.length;j<M;++j){let E=O[j],u=E.start,_=E.count;for(let p=u,n=u+_;p<n;p+=3)F(J.getX(p+0),J.getX(p+1),J.getX(p+2))}let G=new g,R=new g,B=new g,y=new g;function C(j){B.fromBufferAttribute(Z,j),y.copy(B);let M=X[j];G.copy(M),G.sub(B.multiplyScalar(B.dot(M))).normalize(),R.crossVectors(y,M);let u=R.dot(H[j])<0?-1:1;W.setXYZW(j,G.x,G.y,G.z,u)}for(let j=0,M=O.length;j<M;++j){let E=O[j],u=E.start,_=E.count;for(let p=u,n=u+_;p<n;p+=3)C(J.getX(p+0)),C(J.getX(p+1)),C(J.getX(p+2))}}computeVertexNormals(){let J=this.index,Q=this.getAttribute("position");if(Q!==void 0){let $=this.getAttribute("normal");if($===void 0)$=new K6(new Float32Array(Q.count*3),3),this.setAttribute("normal",$);else for(let U=0,V=$.count;U<V;U++)$.setXYZ(U,0,0,0);let Z=new g,K=new g,W=new g,X=new g,H=new g,q=new g,N=new g,Y=new g;if(J)for(let U=0,V=J.count;U<V;U+=3){let z=J.getX(U+0),D=J.getX(U+1),w=J.getX(U+2);Z.fromBufferAttribute(Q,z),K.fromBufferAttribute(Q,D),W.fromBufferAttribute(Q,w),N.subVectors(W,K),Y.subVectors(Z,K),N.cross(Y),X.fromBufferAttribute($,z),H.fromBufferAttribute($,D),q.fromBufferAttribute($,w),X.add(N),H.add(N),q.add(N),$.setXYZ(z,X.x,X.y,X.z),$.setXYZ(D,H.x,H.y,H.z),$.setXYZ(w,q.x,q.y,q.z)}else for(let U=0,V=Q.count;U<V;U+=3)Z.fromBufferAttribute(Q,U+0),K.fromBufferAttribute(Q,U+1),W.fromBufferAttribute(Q,U+2),N.subVectors(W,K),Y.subVectors(Z,K),N.cross(Y),$.setXYZ(U+0,N.x,N.y,N.z),$.setXYZ(U+1,N.x,N.y,N.z),$.setXYZ(U+2,N.x,N.y,N.z);this.normalizeNormals(),$.needsUpdate=!0}}normalizeNormals(){let J=this.attributes.normal;for(let Q=0,$=J.count;Q<$;Q++)p8.fromBufferAttribute(J,Q),p8.normalize(),J.setXYZ(Q,p8.x,p8.y,p8.z)}toNonIndexed(){function J(X,H){let{array:q,itemSize:N,normalized:Y}=X,U=new q.constructor(H.length*N),V=0,z=0;for(let D=0,w=H.length;D<w;D++){if(X.isInterleavedBufferAttribute)V=H[D]*X.data.stride+X.offset;else V=H[D]*N;for(let F=0;F<N;F++)U[z++]=q[V++]}return new K6(U,N,Y)}if(this.index===null)return b0("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let Q=new I6,$=this.index.array,Z=this.attributes;for(let X in Z){let H=Z[X],q=J(H,$);Q.setAttribute(X,q)}let K=this.morphAttributes;for(let X in K){let H=[],q=K[X];for(let N=0,Y=q.length;N<Y;N++){let U=q[N],V=J(U,$);H.push(V)}Q.morphAttributes[X]=H}Q.morphTargetsRelative=this.morphTargetsRelative;let W=this.groups;for(let X=0,H=W.length;X<H;X++){let q=W[X];Q.addGroup(q.start,q.count,q.materialIndex)}return Q}toJSON(){let J={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(J.uuid=this.uuid,J.type=this.type,this.name!=="")J.name=this.name;if(Object.keys(this.userData).length>0)J.userData=this.userData;if(this.parameters!==void 0){let H=this.parameters;for(let q in H)if(H[q]!==void 0)J[q]=H[q];return J}J.data={attributes:{}};let Q=this.index;if(Q!==null)J.data.index={type:Q.array.constructor.name,array:Array.prototype.slice.call(Q.array)};let $=this.attributes;for(let H in $){let q=$[H];J.data.attributes[H]=q.toJSON(J.data)}let Z={},K=!1;for(let H in this.morphAttributes){let q=this.morphAttributes[H],N=[];for(let Y=0,U=q.length;Y<U;Y++){let V=q[Y];N.push(V.toJSON(J.data))}if(N.length>0)Z[H]=N,K=!0}if(K)J.data.morphAttributes=Z,J.data.morphTargetsRelative=this.morphTargetsRelative;let W=this.groups;if(W.length>0)J.data.groups=JSON.parse(JSON.stringify(W));let X=this.boundingSphere;if(X!==null)J.data.boundingSphere=X.toJSON();return J}clone(){return new this.constructor().copy(this)}copy(J){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let Q={};this.name=J.name;let $=J.index;if($!==null)this.setIndex($.clone());let Z=J.attributes;for(let q in Z){let N=Z[q];this.setAttribute(q,N.clone(Q))}let K=J.morphAttributes;for(let q in K){let N=[],Y=K[q];for(let U=0,V=Y.length;U<V;U++)N.push(Y[U].clone(Q));this.morphAttributes[q]=N}this.morphTargetsRelative=J.morphTargetsRelative;let W=J.groups;for(let q=0,N=W.length;q<N;q++){let Y=W[q];this.addGroup(Y.start,Y.count,Y.materialIndex)}let X=J.boundingBox;if(X!==null)this.boundingBox=X.clone();let H=J.boundingSphere;if(H!==null)this.boundingSphere=H.clone();return this.drawRange.start=J.drawRange.start,this.drawRange.count=J.drawRange.count,this.userData=J.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}var dM=0;class G7 extends l7{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:dM++}),this.uuid=DQ(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new l0(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(J){if(this._alphaTest>0!==J>0)this.version++;this._alphaTest=J}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(J){if(J===void 0)return;for(let Q in J){let $=J[Q];if($===void 0){b0(`Material: parameter '${Q}' has value of undefined.`);continue}let Z=this[Q];if(Z===void 0){b0(`Material: '${Q}' is not a property of THREE.${this.type}.`);continue}if(Z&&Z.isColor)Z.set($);else if(Z&&Z.isVector3&&($&&$.isVector3))Z.copy($);else this[Q]=$}}toJSON(J){let Q=J===void 0||typeof J==="string";if(Q)J={textures:{},images:{}};let $={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if($.uuid=this.uuid,$.type=this.type,this.name!=="")$.name=this.name;if(this.color&&this.color.isColor)$.color=this.color.getHex();if(this.roughness!==void 0)$.roughness=this.roughness;if(this.metalness!==void 0)$.metalness=this.metalness;if(this.sheen!==void 0)$.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)$.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)$.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)$.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1)$.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)$.specular=this.specular.getHex();if(this.specularIntensity!==void 0)$.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)$.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)$.shininess=this.shininess;if(this.clearcoat!==void 0)$.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)$.clearcoatRoughness=this.clearcoatRoughness;if(this.clearcoatMap&&this.clearcoatMap.isTexture)$.clearcoatMap=this.clearcoatMap.toJSON(J).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)$.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(J).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)$.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(J).uuid,$.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)$.sheenColorMap=this.sheenColorMap.toJSON(J).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)$.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(J).uuid;if(this.dispersion!==void 0)$.dispersion=this.dispersion;if(this.iridescence!==void 0)$.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)$.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessRange!==void 0)$.iridescenceThicknessRange=this.iridescenceThicknessRange;if(this.iridescenceMap&&this.iridescenceMap.isTexture)$.iridescenceMap=this.iridescenceMap.toJSON(J).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)$.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(J).uuid;if(this.anisotropy!==void 0)$.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)$.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)$.anisotropyMap=this.anisotropyMap.toJSON(J).uuid;if(this.map&&this.map.isTexture)$.map=this.map.toJSON(J).uuid;if(this.matcap&&this.matcap.isTexture)$.matcap=this.matcap.toJSON(J).uuid;if(this.alphaMap&&this.alphaMap.isTexture)$.alphaMap=this.alphaMap.toJSON(J).uuid;if(this.lightMap&&this.lightMap.isTexture)$.lightMap=this.lightMap.toJSON(J).uuid,$.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)$.aoMap=this.aoMap.toJSON(J).uuid,$.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)$.bumpMap=this.bumpMap.toJSON(J).uuid,$.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)$.normalMap=this.normalMap.toJSON(J).uuid,$.normalMapType=this.normalMapType,$.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)$.displacementMap=this.displacementMap.toJSON(J).uuid,$.displacementScale=this.displacementScale,$.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)$.roughnessMap=this.roughnessMap.toJSON(J).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)$.metalnessMap=this.metalnessMap.toJSON(J).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)$.emissiveMap=this.emissiveMap.toJSON(J).uuid;if(this.specularMap&&this.specularMap.isTexture)$.specularMap=this.specularMap.toJSON(J).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)$.specularIntensityMap=this.specularIntensityMap.toJSON(J).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)$.specularColorMap=this.specularColorMap.toJSON(J).uuid;if(this.envMap&&this.envMap.isTexture){if($.envMap=this.envMap.toJSON(J).uuid,this.combine!==void 0)$.combine=this.combine}if(this.envMapRotation!==void 0)$.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)$.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)$.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)$.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)$.gradientMap=this.gradientMap.toJSON(J).uuid;if(this.transmission!==void 0)$.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)$.transmissionMap=this.transmissionMap.toJSON(J).uuid;if(this.thickness!==void 0)$.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)$.thicknessMap=this.thicknessMap.toJSON(J).uuid;if(this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0)$.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)$.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)$.size=this.size;if(this.shadowSide!==null)$.shadowSide=this.shadowSide;if(this.sizeAttenuation!==void 0)$.sizeAttenuation=this.sizeAttenuation;if(this.blending!==1)$.blending=this.blending;if(this.side!==0)$.side=this.side;if(this.vertexColors===!0)$.vertexColors=!0;if(this.opacity<1)$.opacity=this.opacity;if(this.transparent===!0)$.transparent=!0;if(this.blendSrc!==204)$.blendSrc=this.blendSrc;if(this.blendDst!==205)$.blendDst=this.blendDst;if(this.blendEquation!==100)$.blendEquation=this.blendEquation;if(this.blendSrcAlpha!==null)$.blendSrcAlpha=this.blendSrcAlpha;if(this.blendDstAlpha!==null)$.blendDstAlpha=this.blendDstAlpha;if(this.blendEquationAlpha!==null)$.blendEquationAlpha=this.blendEquationAlpha;if(this.blendColor&&this.blendColor.isColor)$.blendColor=this.blendColor.getHex();if(this.blendAlpha!==0)$.blendAlpha=this.blendAlpha;if(this.depthFunc!==3)$.depthFunc=this.depthFunc;if(this.depthTest===!1)$.depthTest=this.depthTest;if(this.depthWrite===!1)$.depthWrite=this.depthWrite;if(this.colorWrite===!1)$.colorWrite=this.colorWrite;if(this.stencilWriteMask!==255)$.stencilWriteMask=this.stencilWriteMask;if(this.stencilFunc!==519)$.stencilFunc=this.stencilFunc;if(this.stencilRef!==0)$.stencilRef=this.stencilRef;if(this.stencilFuncMask!==255)$.stencilFuncMask=this.stencilFuncMask;if(this.stencilFail!==7680)$.stencilFail=this.stencilFail;if(this.stencilZFail!==7680)$.stencilZFail=this.stencilZFail;if(this.stencilZPass!==7680)$.stencilZPass=this.stencilZPass;if(this.stencilWrite===!0)$.stencilWrite=this.stencilWrite;if(this.rotation!==void 0&&this.rotation!==0)$.rotation=this.rotation;if(this.polygonOffset===!0)$.polygonOffset=!0;if(this.polygonOffsetFactor!==0)$.polygonOffsetFactor=this.polygonOffsetFactor;if(this.polygonOffsetUnits!==0)$.polygonOffsetUnits=this.polygonOffsetUnits;if(this.linewidth!==void 0&&this.linewidth!==1)$.linewidth=this.linewidth;if(this.dashSize!==void 0)$.dashSize=this.dashSize;if(this.gapSize!==void 0)$.gapSize=this.gapSize;if(this.scale!==void 0)$.scale=this.scale;if(this.dithering===!0)$.dithering=!0;if(this.alphaTest>0)$.alphaTest=this.alphaTest;if(this.alphaHash===!0)$.alphaHash=!0;if(this.alphaToCoverage===!0)$.alphaToCoverage=!0;if(this.premultipliedAlpha===!0)$.premultipliedAlpha=!0;if(this.forceSinglePass===!0)$.forceSinglePass=!0;if(this.allowOverride===!1)$.allowOverride=!1;if(this.wireframe===!0)$.wireframe=!0;if(this.wireframeLinewidth>1)$.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!=="round")$.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!=="round")$.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading===!0)$.flatShading=!0;if(this.visible===!1)$.visible=!1;if(this.toneMapped===!1)$.toneMapped=!1;if(this.fog===!1)$.fog=!1;if(Object.keys(this.userData).length>0)$.userData=this.userData;function Z(K){let W=[];for(let X in K){let H=K[X];delete H.metadata,W.push(H)}return W}if(Q){let K=Z(J.textures),W=Z(J.images);if(K.length>0)$.textures=K;if(W.length>0)$.images=W}return $}clone(){return new this.constructor().copy(this)}copy(J){this.name=J.name,this.blending=J.blending,this.side=J.side,this.vertexColors=J.vertexColors,this.opacity=J.opacity,this.transparent=J.transparent,this.blendSrc=J.blendSrc,this.blendDst=J.blendDst,this.blendEquation=J.blendEquation,this.blendSrcAlpha=J.blendSrcAlpha,this.blendDstAlpha=J.blendDstAlpha,this.blendEquationAlpha=J.blendEquationAlpha,this.blendColor.copy(J.blendColor),this.blendAlpha=J.blendAlpha,this.depthFunc=J.depthFunc,this.depthTest=J.depthTest,this.depthWrite=J.depthWrite,this.stencilWriteMask=J.stencilWriteMask,this.stencilFunc=J.stencilFunc,this.stencilRef=J.stencilRef,this.stencilFuncMask=J.stencilFuncMask,this.stencilFail=J.stencilFail,this.stencilZFail=J.stencilZFail,this.stencilZPass=J.stencilZPass,this.stencilWrite=J.stencilWrite;let Q=J.clippingPlanes,$=null;if(Q!==null){let Z=Q.length;$=Array(Z);for(let K=0;K!==Z;++K)$[K]=Q[K].clone()}return this.clippingPlanes=$,this.clipIntersection=J.clipIntersection,this.clipShadows=J.clipShadows,this.shadowSide=J.shadowSide,this.colorWrite=J.colorWrite,this.precision=J.precision,this.polygonOffset=J.polygonOffset,this.polygonOffsetFactor=J.polygonOffsetFactor,this.polygonOffsetUnits=J.polygonOffsetUnits,this.dithering=J.dithering,this.alphaTest=J.alphaTest,this.alphaHash=J.alphaHash,this.alphaToCoverage=J.alphaToCoverage,this.premultipliedAlpha=J.premultipliedAlpha,this.forceSinglePass=J.forceSinglePass,this.allowOverride=J.allowOverride,this.visible=J.visible,this.toneMapped=J.toneMapped,this.userData=JSON.parse(JSON.stringify(J.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(J){if(J===!0)this.version++}}var D7=new g,s5=new g,kZ=new g,g7=new g,n5=new g,MZ=new g,i5=new g;class iZ{constructor(J=new g,Q=new g(0,0,-1)){this.origin=J,this.direction=Q}set(J,Q){return this.origin.copy(J),this.direction.copy(Q),this}copy(J){return this.origin.copy(J.origin),this.direction.copy(J.direction),this}at(J,Q){return Q.copy(this.origin).addScaledVector(this.direction,J)}lookAt(J){return this.direction.copy(J).sub(this.origin).normalize(),this}recast(J){return this.origin.copy(this.at(J,D7)),this}closestPointToPoint(J,Q){Q.subVectors(J,this.origin);let $=Q.dot(this.direction);if($<0)return Q.copy(this.origin);return Q.copy(this.origin).addScaledVector(this.direction,$)}distanceToPoint(J){return Math.sqrt(this.distanceSqToPoint(J))}distanceSqToPoint(J){let Q=D7.subVectors(J,this.origin).dot(this.direction);if(Q<0)return this.origin.distanceToSquared(J);return D7.copy(this.origin).addScaledVector(this.direction,Q),D7.distanceToSquared(J)}distanceSqToSegment(J,Q,$,Z){s5.copy(J).add(Q).multiplyScalar(0.5),kZ.copy(Q).sub(J).normalize(),g7.copy(this.origin).sub(s5);let K=J.distanceTo(Q)*0.5,W=-this.direction.dot(kZ),X=g7.dot(this.direction),H=-g7.dot(kZ),q=g7.lengthSq(),N=Math.abs(1-W*W),Y,U,V,z;if(N>0)if(Y=W*H-X,U=W*X-H,z=K*N,Y>=0)if(U>=-z)if(U<=z){let D=1/N;Y*=D,U*=D,V=Y*(Y+W*U+2*X)+U*(W*Y+U+2*H)+q}else U=K,Y=Math.max(0,-(W*U+X)),V=-Y*Y+U*(U+2*H)+q;else U=-K,Y=Math.max(0,-(W*U+X)),V=-Y*Y+U*(U+2*H)+q;else if(U<=-z)Y=Math.max(0,-(-W*K+X)),U=Y>0?-K:Math.min(Math.max(-K,-H),K),V=-Y*Y+U*(U+2*H)+q;else if(U<=z)Y=0,U=Math.min(Math.max(-K,-H),K),V=U*(U+2*H)+q;else Y=Math.max(0,-(W*K+X)),U=Y>0?K:Math.min(Math.max(-K,-H),K),V=-Y*Y+U*(U+2*H)+q;else U=W>0?-K:K,Y=Math.max(0,-(W*U+X)),V=-Y*Y+U*(U+2*H)+q;if($)$.copy(this.origin).addScaledVector(this.direction,Y);if(Z)Z.copy(s5).addScaledVector(kZ,U);return V}intersectSphere(J,Q){D7.subVectors(J.center,this.origin);let $=D7.dot(this.direction),Z=D7.dot(D7)-$*$,K=J.radius*J.radius;if(Z>K)return null;let W=Math.sqrt(K-Z),X=$-W,H=$+W;if(H<0)return null;if(X<0)return this.at(H,Q);return this.at(X,Q)}intersectsSphere(J){if(J.radius<0)return!1;return this.distanceSqToPoint(J.center)<=J.radius*J.radius}distanceToPlane(J){let Q=J.normal.dot(this.direction);if(Q===0){if(J.distanceToPoint(this.origin)===0)return 0;return null}let $=-(this.origin.dot(J.normal)+J.constant)/Q;return $>=0?$:null}intersectPlane(J,Q){let $=this.distanceToPlane(J);if($===null)return null;return this.at($,Q)}intersectsPlane(J){let Q=J.distanceToPoint(this.origin);if(Q===0)return!0;if(J.normal.dot(this.direction)*Q<0)return!0;return!1}intersectBox(J,Q){let $,Z,K,W,X,H,q=1/this.direction.x,N=1/this.direction.y,Y=1/this.direction.z,U=this.origin;if(q>=0)$=(J.min.x-U.x)*q,Z=(J.max.x-U.x)*q;else $=(J.max.x-U.x)*q,Z=(J.min.x-U.x)*q;if(N>=0)K=(J.min.y-U.y)*N,W=(J.max.y-U.y)*N;else K=(J.max.y-U.y)*N,W=(J.min.y-U.y)*N;if($>W||K>Z)return null;if(K>$||isNaN($))$=K;if(W<Z||isNaN(Z))Z=W;if(Y>=0)X=(J.min.z-U.z)*Y,H=(J.max.z-U.z)*Y;else X=(J.max.z-U.z)*Y,H=(J.min.z-U.z)*Y;if($>H||X>Z)return null;if(X>$||$!==$)$=X;if(H<Z||Z!==Z)Z=H;if(Z<0)return null;return this.at($>=0?$:Z,Q)}intersectsBox(J){return this.intersectBox(J,D7)!==null}intersectTriangle(J,Q,$,Z,K){n5.subVectors(Q,J),MZ.subVectors($,J),i5.crossVectors(n5,MZ);let W=this.direction.dot(i5),X;if(W>0){if(Z)return null;X=1}else if(W<0)X=-1,W=-W;else return null;g7.subVectors(this.origin,J);let H=X*this.direction.dot(MZ.crossVectors(g7,MZ));if(H<0)return null;let q=X*this.direction.dot(n5.cross(g7));if(q<0)return null;if(H+q>W)return null;let N=-X*g7.dot(i5);if(N<0)return null;return this.at(N/W,K)}applyMatrix4(J){return this.origin.applyMatrix4(J),this.direction.transformDirection(J),this}equals(J){return J.origin.equals(this.origin)&&J.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class oZ extends G7{constructor(J){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new l0(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new t6,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(J)}copy(J){return super.copy(J),this.color.copy(J.color),this.map=J.map,this.lightMap=J.lightMap,this.lightMapIntensity=J.lightMapIntensity,this.aoMap=J.aoMap,this.aoMapIntensity=J.aoMapIntensity,this.specularMap=J.specularMap,this.alphaMap=J.alphaMap,this.envMap=J.envMap,this.envMapRotation.copy(J.envMapRotation),this.combine=J.combine,this.reflectivity=J.reflectivity,this.refractionRatio=J.refractionRatio,this.wireframe=J.wireframe,this.wireframeLinewidth=J.wireframeLinewidth,this.wireframeLinecap=J.wireframeLinecap,this.wireframeLinejoin=J.wireframeLinejoin,this.fog=J.fog,this}}var kF=new L8,HJ=new iZ,wZ=new k9,MF=new g,IZ=new g,LZ=new g,GZ=new g,o5=new g,BZ=new g,wF=new g,RZ=new g;class u6 extends J6{constructor(J=new I6,Q=new oZ){super();this.isMesh=!0,this.type="Mesh",this.geometry=J,this.material=Q,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(J,Q){if(super.copy(J,Q),J.morphTargetInfluences!==void 0)this.morphTargetInfluences=J.morphTargetInfluences.slice();if(J.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},J.morphTargetDictionary);return this.material=Array.isArray(J.material)?J.material.slice():J.material,this.geometry=J.geometry,this}updateMorphTargets(){let Q=this.geometry.morphAttributes,$=Object.keys(Q);if($.length>0){let Z=Q[$[0]];if(Z!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let K=0,W=Z.length;K<W;K++){let X=Z[K].name||String(K);this.morphTargetInfluences.push(0),this.morphTargetDictionary[X]=K}}}}getVertexPosition(J,Q){let $=this.geometry,Z=$.attributes.position,K=$.morphAttributes.position,W=$.morphTargetsRelative;Q.fromBufferAttribute(Z,J);let X=this.morphTargetInfluences;if(K&&X){BZ.set(0,0,0);for(let H=0,q=K.length;H<q;H++){let N=X[H],Y=K[H];if(N===0)continue;if(o5.fromBufferAttribute(Y,J),W)BZ.addScaledVector(o5,N);else BZ.addScaledVector(o5.sub(Q),N)}Q.add(BZ)}return Q}raycast(J,Q){let $=this.geometry,Z=this.material,K=this.matrixWorld;if(Z===void 0)return;if($.boundingSphere===null)$.computeBoundingSphere();if(wZ.copy($.boundingSphere),wZ.applyMatrix4(K),HJ.copy(J.ray).recast(J.near),wZ.containsPoint(HJ.origin)===!1){if(HJ.intersectSphere(wZ,MF)===null)return;if(HJ.origin.distanceToSquared(MF)>(J.far-J.near)**2)return}if(kF.copy(K).invert(),HJ.copy(J.ray).applyMatrix4(kF),$.boundingBox!==null){if(HJ.intersectsBox($.boundingBox)===!1)return}this._computeIntersections(J,Q,HJ)}_computeIntersections(J,Q,$){let Z,K=this.geometry,W=this.material,X=K.index,H=K.attributes.position,q=K.attributes.uv,N=K.attributes.uv1,Y=K.attributes.normal,U=K.groups,V=K.drawRange;if(X!==null)if(Array.isArray(W))for(let z=0,D=U.length;z<D;z++){let w=U[z],F=W[w.materialIndex],O=Math.max(w.start,V.start),G=Math.min(X.count,Math.min(w.start+w.count,V.start+V.count));for(let R=O,B=G;R<B;R+=3){let y=X.getX(R),C=X.getX(R+1),j=X.getX(R+2);if(Z=AZ(this,F,J,$,q,N,Y,y,C,j),Z)Z.faceIndex=Math.floor(R/3),Z.face.materialIndex=w.materialIndex,Q.push(Z)}}else{let z=Math.max(0,V.start),D=Math.min(X.count,V.start+V.count);for(let w=z,F=D;w<F;w+=3){let O=X.getX(w),G=X.getX(w+1),R=X.getX(w+2);if(Z=AZ(this,W,J,$,q,N,Y,O,G,R),Z)Z.faceIndex=Math.floor(w/3),Q.push(Z)}}else if(H!==void 0)if(Array.isArray(W))for(let z=0,D=U.length;z<D;z++){let w=U[z],F=W[w.materialIndex],O=Math.max(w.start,V.start),G=Math.min(H.count,Math.min(w.start+w.count,V.start+V.count));for(let R=O,B=G;R<B;R+=3){let y=R,C=R+1,j=R+2;if(Z=AZ(this,F,J,$,q,N,Y,y,C,j),Z)Z.faceIndex=Math.floor(R/3),Z.face.materialIndex=w.materialIndex,Q.push(Z)}}else{let z=Math.max(0,V.start),D=Math.min(H.count,V.start+V.count);for(let w=z,F=D;w<F;w+=3){let O=w,G=w+1,R=w+2;if(Z=AZ(this,W,J,$,q,N,Y,O,G,R),Z)Z.faceIndex=Math.floor(w/3),Q.push(Z)}}}}function lM(J,Q,$,Z,K,W,X,H){let q;if(Q.side===1)q=Z.intersectTriangle(X,W,K,!0,H);else q=Z.intersectTriangle(K,W,X,Q.side===0,H);if(q===null)return null;RZ.copy(H),RZ.applyMatrix4(J.matrixWorld);let N=$.ray.origin.distanceTo(RZ);if(N<$.near||N>$.far)return null;return{distance:N,point:RZ.clone(),object:J}}function AZ(J,Q,$,Z,K,W,X,H,q,N){J.getVertexPosition(H,IZ),J.getVertexPosition(q,LZ),J.getVertexPosition(N,GZ);let Y=lM(J,Q,$,Z,IZ,LZ,GZ,wF);if(Y){let U=new g;if(P6.getBarycoord(wF,IZ,LZ,GZ,U),K)Y.uv=P6.getInterpolatedAttribute(K,H,q,N,U,new Z8);if(W)Y.uv1=P6.getInterpolatedAttribute(W,H,q,N,U,new Z8);if(X){if(Y.normal=P6.getInterpolatedAttribute(X,H,q,N,U,new g),Y.normal.dot(Z.direction)>0)Y.normal.multiplyScalar(-1)}let V={a:H,b:q,c:N,normal:new g,materialIndex:0};P6.getNormal(IZ,LZ,GZ,V.normal),Y.face=V,Y.barycoord=U}return Y}class $H extends e8{constructor(J=null,Q=1,$=1,Z,K,W,X,H,q=1003,N=1003,Y,U){super(null,W,X,H,q,N,Z,K,Y,U);this.isDataTexture=!0,this.image={data:J,width:Q,height:$},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var a5=new g,cM=new g,uM=new x0;class k7{constructor(J=new g(1,0,0),Q=0){this.isPlane=!0,this.normal=J,this.constant=Q}set(J,Q){return this.normal.copy(J),this.constant=Q,this}setComponents(J,Q,$,Z){return this.normal.set(J,Q,$),this.constant=Z,this}setFromNormalAndCoplanarPoint(J,Q){return this.normal.copy(J),this.constant=-Q.dot(this.normal),this}setFromCoplanarPoints(J,Q,$){let Z=a5.subVectors($,Q).cross(cM.subVectors(J,Q)).normalize();return this.setFromNormalAndCoplanarPoint(Z,J),this}copy(J){return this.normal.copy(J.normal),this.constant=J.constant,this}normalize(){let J=1/this.normal.length();return this.normal.multiplyScalar(J),this.constant*=J,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(J){return this.normal.dot(J)+this.constant}distanceToSphere(J){return this.distanceToPoint(J.center)-J.radius}projectPoint(J,Q){return Q.copy(J).addScaledVector(this.normal,-this.distanceToPoint(J))}intersectLine(J,Q){let $=J.delta(a5),Z=this.normal.dot($);if(Z===0){if(this.distanceToPoint(J.start)===0)return Q.copy(J.start);return null}let K=-(J.start.dot(this.normal)+this.constant)/Z;if(K<0||K>1)return null;return Q.copy(J.start).addScaledVector($,K)}intersectsLine(J){let Q=this.distanceToPoint(J.start),$=this.distanceToPoint(J.end);return Q<0&&$>0||$<0&&Q>0}intersectsBox(J){return J.intersectsPlane(this)}intersectsSphere(J){return J.intersectsPlane(this)}coplanarPoint(J){return J.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(J,Q){let $=Q||uM.getNormalMatrix(J),Z=this.coplanarPoint(a5).applyMatrix4(J),K=this.normal.applyMatrix3($).normalize();return this.constant=-Z.dot(K),this}translate(J){return this.constant-=J.dot(this.normal),this}equals(J){return J.normal.equals(this.normal)&&J.constant===this.constant}clone(){return new this.constructor().copy(this)}}var qJ=new k9,sM=new Z8(0.5,0.5),CZ=new g;class IQ{constructor(J=new k7,Q=new k7,$=new k7,Z=new k7,K=new k7,W=new k7){this.planes=[J,Q,$,Z,K,W]}set(J,Q,$,Z,K,W){let X=this.planes;return X[0].copy(J),X[1].copy(Q),X[2].copy($),X[3].copy(Z),X[4].copy(K),X[5].copy(W),this}copy(J){let Q=this.planes;for(let $=0;$<6;$++)Q[$].copy(J.planes[$]);return this}setFromProjectionMatrix(J,Q=2000,$=!1){let Z=this.planes,K=J.elements,W=K[0],X=K[1],H=K[2],q=K[3],N=K[4],Y=K[5],U=K[6],V=K[7],z=K[8],D=K[9],w=K[10],F=K[11],O=K[12],G=K[13],R=K[14],B=K[15];if(Z[0].setComponents(q-W,V-N,F-z,B-O).normalize(),Z[1].setComponents(q+W,V+N,F+z,B+O).normalize(),Z[2].setComponents(q+X,V+Y,F+D,B+G).normalize(),Z[3].setComponents(q-X,V-Y,F-D,B-G).normalize(),$)Z[4].setComponents(H,U,w,R).normalize(),Z[5].setComponents(q-H,V-U,F-w,B-R).normalize();else if(Z[4].setComponents(q-H,V-U,F-w,B-R).normalize(),Q===2000)Z[5].setComponents(q+H,V+U,F+w,B+R).normalize();else if(Q===2001)Z[5].setComponents(H,U,w,R).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+Q);return this}intersectsObject(J){if(J.boundingSphere!==void 0){if(J.boundingSphere===null)J.computeBoundingSphere();qJ.copy(J.boundingSphere).applyMatrix4(J.matrixWorld)}else{let Q=J.geometry;if(Q.boundingSphere===null)Q.computeBoundingSphere();qJ.copy(Q.boundingSphere).applyMatrix4(J.matrixWorld)}return this.intersectsSphere(qJ)}intersectsSprite(J){qJ.center.set(0,0,0);let Q=sM.distanceTo(J.center);return qJ.radius=0.7071067811865476+Q,qJ.applyMatrix4(J.matrixWorld),this.intersectsSphere(qJ)}intersectsSphere(J){let Q=this.planes,$=J.center,Z=-J.radius;for(let K=0;K<6;K++)if(Q[K].distanceToPoint($)<Z)return!1;return!0}intersectsBox(J){let Q=this.planes;for(let $=0;$<6;$++){let Z=Q[$];if(CZ.x=Z.normal.x>0?J.max.x:J.min.x,CZ.y=Z.normal.y>0?J.max.y:J.min.y,CZ.z=Z.normal.z>0?J.max.z:J.min.z,Z.distanceToPoint(CZ)<0)return!1}return!0}containsPoint(J){let Q=this.planes;for(let $=0;$<6;$++)if(Q[$].distanceToPoint(J)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class LQ extends G7{constructor(J){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new l0(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(J)}copy(J){return super.copy(J),this.color.copy(J.color),this.map=J.map,this.alphaMap=J.alphaMap,this.size=J.size,this.sizeAttenuation=J.sizeAttenuation,this.fog=J.fog,this}}var IF=new L8,t5=new iZ,_Z=new k9,EZ=new g;class aZ extends J6{constructor(J=new I6,Q=new LQ){super();this.isPoints=!0,this.type="Points",this.geometry=J,this.material=Q,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(J,Q){return super.copy(J,Q),this.material=Array.isArray(J.material)?J.material.slice():J.material,this.geometry=J.geometry,this}raycast(J,Q){let $=this.geometry,Z=this.matrixWorld,K=J.params.Points.threshold,W=$.drawRange;if($.boundingSphere===null)$.computeBoundingSphere();if(_Z.copy($.boundingSphere),_Z.applyMatrix4(Z),_Z.radius+=K,J.ray.intersectsSphere(_Z)===!1)return;IF.copy(Z).invert(),t5.copy(J.ray).applyMatrix4(IF);let X=K/((this.scale.x+this.scale.y+this.scale.z)/3),H=X*X,q=$.index,Y=$.attributes.position;if(q!==null){let U=Math.max(0,W.start),V=Math.min(q.count,W.start+W.count);for(let z=U,D=V;z<D;z++){let w=q.getX(z);EZ.fromBufferAttribute(Y,w),LF(EZ,w,H,Z,J,Q,this)}}else{let U=Math.max(0,W.start),V=Math.min(Y.count,W.start+W.count);for(let z=U,D=V;z<D;z++)EZ.fromBufferAttribute(Y,z),LF(EZ,z,H,Z,J,Q,this)}}updateMorphTargets(){let Q=this.geometry.morphAttributes,$=Object.keys(Q);if($.length>0){let Z=Q[$[0]];if(Z!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let K=0,W=Z.length;K<W;K++){let X=Z[K].name||String(K);this.morphTargetInfluences.push(0),this.morphTargetDictionary[X]=K}}}}}function LF(J,Q,$,Z,K,W,X){let H=t5.distanceSqToPoint(J);if(H<$){let q=new g;t5.closestPointToPoint(J,q),q.applyMatrix4(Z);let N=K.ray.origin.distanceTo(q);if(N<K.near||N>K.far)return;W.push({distance:N,distanceToRay:Math.sqrt(H),point:q,index:Q,face:null,faceIndex:null,barycoord:null,object:X})}}class rZ extends e8{constructor(J=[],Q=301,$,Z,K,W,X,H,q,N){super(J,Q,$,Z,K,W,X,H,q,N);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(J){this.image=J}}class zJ extends e8{constructor(J,Q,$=1014,Z,K,W,X=1003,H=1003,q,N=1026,Y=1){if(N!==1026&&N!==1027)throw Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let U={width:J,height:Q,depth:Y};super(U,Z,K,W,X,H,N,$,q);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(J){return super.copy(J),this.source=new kQ(Object.assign({},J.image)),this.compareFunction=J.compareFunction,this}toJSON(J){let Q=super.toJSON(J);if(this.compareFunction!==null)Q.compareFunction=this.compareFunction;return Q}}class ZH extends zJ{constructor(J,Q=1014,$=301,Z,K,W=1003,X=1003,H,q=1026){let N={width:J,height:J,depth:1},Y=[N,N,N,N,N,N];super(J,J,Q,$,Z,K,W,X,H,q);this.image=Y,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(J){this.image=J}}class tZ extends e8{constructor(J=null){super();this.sourceTexture=J,this.isExternalTexture=!0}copy(J){return super.copy(J),this.sourceTexture=J.sourceTexture,this}}class M9 extends I6{constructor(J=1,Q=1,$=1,Z=1,K=1,W=1){super();this.type="BoxGeometry",this.parameters={width:J,height:Q,depth:$,widthSegments:Z,heightSegments:K,depthSegments:W};let X=this;Z=Math.floor(Z),K=Math.floor(K),W=Math.floor(W);let H=[],q=[],N=[],Y=[],U=0,V=0;z("z","y","x",-1,-1,$,Q,J,W,K,0),z("z","y","x",1,-1,$,Q,-J,W,K,1),z("x","z","y",1,1,J,$,Q,Z,W,2),z("x","z","y",1,-1,J,$,-Q,Z,W,3),z("x","y","z",1,-1,J,Q,$,Z,K,4),z("x","y","z",-1,-1,J,Q,-$,Z,K,5),this.setIndex(H),this.setAttribute("position",new d6(q,3)),this.setAttribute("normal",new d6(N,3)),this.setAttribute("uv",new d6(Y,2));function z(D,w,F,O,G,R,B,y,C,j,M){let E=R/C,u=B/j,_=R/2,p=B/2,n=y/2,f=C+1,i=j+1,d=0,m=0,J0=new g;for(let Q0=0;Q0<i;Q0++){let U0=Q0*u-p;for(let _0=0;_0<f;_0++){let Y0=_0*E-_;J0[D]=Y0*O,J0[w]=U0*G,J0[F]=n,q.push(J0.x,J0.y,J0.z),J0[D]=0,J0[w]=0,J0[F]=y>0?1:-1,N.push(J0.x,J0.y,J0.z),Y.push(_0/C),Y.push(1-Q0/j),d+=1}}for(let Q0=0;Q0<j;Q0++)for(let U0=0;U0<C;U0++){let _0=U+U0+f*Q0,Y0=U+U0+f*(Q0+1),I8=U+(U0+1)+f*(Q0+1),X8=U+(U0+1)+f*Q0;H.push(_0,Y0,X8),H.push(Y0,I8,X8),m+=6}X.addGroup(V,m,M),V+=m,U+=d}}copy(J){return super.copy(J),this.parameters=Object.assign({},J.parameters),this}static fromJSON(J){return new M9(J.width,J.height,J.depth,J.widthSegments,J.heightSegments,J.depthSegments)}}class GQ extends I6{constructor(J=1,Q=1,$=1,Z=1){super();this.type="PlaneGeometry",this.parameters={width:J,height:Q,widthSegments:$,heightSegments:Z};let K=J/2,W=Q/2,X=Math.floor($),H=Math.floor(Z),q=X+1,N=H+1,Y=J/X,U=Q/H,V=[],z=[],D=[],w=[];for(let F=0;F<N;F++){let O=F*U-W;for(let G=0;G<q;G++){let R=G*Y-K;z.push(R,-O,0),D.push(0,0,1),w.push(G/X),w.push(1-F/H)}}for(let F=0;F<H;F++)for(let O=0;O<X;O++){let G=O+q*F,R=O+q*(F+1),B=O+1+q*(F+1),y=O+1+q*F;V.push(G,R,y),V.push(R,B,y)}this.setIndex(V),this.setAttribute("position",new d6(z,3)),this.setAttribute("normal",new d6(D,3)),this.setAttribute("uv",new d6(w,2))}copy(J){return super.copy(J),this.parameters=Object.assign({},J.parameters),this}static fromJSON(J){return new GQ(J.width,J.height,J.widthSegments,J.heightSegments)}}function DJ(J){let Q={};for(let $ in J){Q[$]={};for(let Z in J[$]){let K=J[$][Z];if(K&&(K.isColor||K.isMatrix3||K.isMatrix4||K.isVector2||K.isVector3||K.isVector4||K.isTexture||K.isQuaternion))if(K.isRenderTargetTexture)b0("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),Q[$][Z]=null;else Q[$][Z]=K.clone();else if(Array.isArray(K))Q[$][Z]=K.slice();else Q[$][Z]=K}}return Q}function Q6(J){let Q={};for(let $=0;$<J.length;$++){let Z=DJ(J[$]);for(let K in Z)Q[K]=Z[K]}return Q}function nM(J){let Q=[];for(let $=0;$<J.length;$++)Q.push(J[$].clone());return Q}function KH(J){let Q=J.getRenderTarget();if(Q===null)return J.outputColorSpace;if(Q.isXRRenderTarget===!0)return Q.texture.colorSpace;return a0.workingColorSpace}var jz={clone:DJ,merge:Q6},iM=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,oM=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class S6 extends G7{constructor(J){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=iM,this.fragmentShader=oM,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,J!==void 0)this.setValues(J)}copy(J){return super.copy(J),this.fragmentShader=J.fragmentShader,this.vertexShader=J.vertexShader,this.uniforms=DJ(J.uniforms),this.uniformsGroups=nM(J.uniformsGroups),this.defines=Object.assign({},J.defines),this.wireframe=J.wireframe,this.wireframeLinewidth=J.wireframeLinewidth,this.fog=J.fog,this.lights=J.lights,this.clipping=J.clipping,this.extensions=Object.assign({},J.extensions),this.glslVersion=J.glslVersion,this.defaultAttributeValues=Object.assign({},J.defaultAttributeValues),this.index0AttributeName=J.index0AttributeName,this.uniformsNeedUpdate=J.uniformsNeedUpdate,this}toJSON(J){let Q=super.toJSON(J);Q.glslVersion=this.glslVersion,Q.uniforms={};for(let Z in this.uniforms){let W=this.uniforms[Z].value;if(W&&W.isTexture)Q.uniforms[Z]={type:"t",value:W.toJSON(J).uuid};else if(W&&W.isColor)Q.uniforms[Z]={type:"c",value:W.getHex()};else if(W&&W.isVector2)Q.uniforms[Z]={type:"v2",value:W.toArray()};else if(W&&W.isVector3)Q.uniforms[Z]={type:"v3",value:W.toArray()};else if(W&&W.isVector4)Q.uniforms[Z]={type:"v4",value:W.toArray()};else if(W&&W.isMatrix3)Q.uniforms[Z]={type:"m3",value:W.toArray()};else if(W&&W.isMatrix4)Q.uniforms[Z]={type:"m4",value:W.toArray()};else Q.uniforms[Z]={value:W}}if(Object.keys(this.defines).length>0)Q.defines=this.defines;Q.vertexShader=this.vertexShader,Q.fragmentShader=this.fragmentShader,Q.lights=this.lights,Q.clipping=this.clipping;let $={};for(let Z in this.extensions)if(this.extensions[Z]===!0)$[Z]=!0;if(Object.keys($).length>0)Q.extensions=$;return Q}}class WH extends S6{constructor(J){super(J);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class XH extends G7{constructor(J){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(J)}copy(J){return super.copy(J),this.depthPacking=J.depthPacking,this.map=J.map,this.alphaMap=J.alphaMap,this.displacementMap=J.displacementMap,this.displacementScale=J.displacementScale,this.displacementBias=J.displacementBias,this.wireframe=J.wireframe,this.wireframeLinewidth=J.wireframeLinewidth,this}}class HH extends G7{constructor(J){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(J)}copy(J){return super.copy(J),this.map=J.map,this.alphaMap=J.alphaMap,this.displacementMap=J.displacementMap,this.displacementScale=J.displacementScale,this.displacementBias=J.displacementBias,this}}function PZ(J,Q){if(!J||J.constructor===Q)return J;if(typeof Q.BYTES_PER_ELEMENT==="number")return new Q(J);return Array.prototype.slice.call(J)}class kJ{constructor(J,Q,$,Z){this.parameterPositions=J,this._cachedIndex=0,this.resultBuffer=Z!==void 0?Z:new Q.constructor($),this.sampleValues=Q,this.valueSize=$,this.settings=null,this.DefaultSettings_={}}evaluate(J){let Q=this.parameterPositions,$=this._cachedIndex,Z=Q[$],K=Q[$-1];$:{J:{let W;Q:{Z:if(!(J<Z)){for(let X=$+2;;){if(Z===void 0){if(J<K)break Z;return $=Q.length,this._cachedIndex=$,this.copySampleValue_($-1)}if($===X)break;if(K=Z,Z=Q[++$],J<Z)break J}W=Q.length;break Q}if(!(J>=K)){let X=Q[1];if(J<X)$=2,K=X;for(let H=$-2;;){if(K===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if($===H)break;if(Z=K,K=Q[--$-1],J>=K)break J}W=$,$=0;break Q}break $}while($<W){let X=$+W>>>1;if(J<Q[X])W=X;else $=X+1}if(Z=Q[$],K=Q[$-1],K===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(Z===void 0)return $=Q.length,this._cachedIndex=$,this.copySampleValue_($-1)}this._cachedIndex=$,this.intervalChanged_($,K,Z)}return this.interpolate_($,K,J,Z)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(J){let Q=this.resultBuffer,$=this.sampleValues,Z=this.valueSize,K=J*Z;for(let W=0;W!==Z;++W)Q[W]=$[K+W];return Q}interpolate_(){throw Error("call to abstract method")}intervalChanged_(){}}class qH extends kJ{constructor(J,Q,$,Z){super(J,Q,$,Z);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(J,Q,$){let Z=this.parameterPositions,K=J-2,W=J+1,X=Z[K],H=Z[W];if(X===void 0)switch(this.getSettings_().endingStart){case 2401:K=J,X=2*Q-$;break;case 2402:K=Z.length-2,X=Q+Z[K]-Z[K+1];break;default:K=J,X=$}if(H===void 0)switch(this.getSettings_().endingEnd){case 2401:W=J,H=2*$-Q;break;case 2402:W=1,H=$+Z[1]-Z[0];break;default:W=J-1,H=Q}let q=($-Q)*0.5,N=this.valueSize;this._weightPrev=q/(Q-X),this._weightNext=q/(H-$),this._offsetPrev=K*N,this._offsetNext=W*N}interpolate_(J,Q,$,Z){let K=this.resultBuffer,W=this.sampleValues,X=this.valueSize,H=J*X,q=H-X,N=this._offsetPrev,Y=this._offsetNext,U=this._weightPrev,V=this._weightNext,z=($-Q)/(Z-Q),D=z*z,w=D*z,F=-U*w+2*U*D-U*z,O=(1+U)*w+(-1.5-2*U)*D+(-0.5+U)*z+1,G=(-1-V)*w+(1.5+V)*D+0.5*z,R=V*w-V*D;for(let B=0;B!==X;++B)K[B]=F*W[N+B]+O*W[q+B]+G*W[H+B]+R*W[Y+B];return K}}class NH extends kJ{constructor(J,Q,$,Z){super(J,Q,$,Z)}interpolate_(J,Q,$,Z){let K=this.resultBuffer,W=this.sampleValues,X=this.valueSize,H=J*X,q=H-X,N=($-Q)/(Z-Q),Y=1-N;for(let U=0;U!==X;++U)K[U]=W[q+U]*Y+W[H+U]*N;return K}}class YH extends kJ{constructor(J,Q,$,Z){super(J,Q,$,Z)}interpolate_(J){return this.copySampleValue_(J-1)}}class UH extends kJ{interpolate_(J,Q,$,Z){let K=this.resultBuffer,W=this.sampleValues,X=this.valueSize,H=J*X,q=H-X,N=this.settings||this.DefaultSettings_,Y=N.inTangents,U=N.outTangents;if(!Y||!U){let D=($-Q)/(Z-Q),w=1-D;for(let F=0;F!==X;++F)K[F]=W[q+F]*w+W[H+F]*D;return K}let V=X*2,z=J-1;for(let D=0;D!==X;++D){let w=W[q+D],F=W[H+D],O=z*V+D*2,G=U[O],R=U[O+1],B=J*V+D*2,y=Y[B],C=Y[B+1],j=($-Q)/(Z-Q),M,E,u,_,p;for(let n=0;n<8;n++){M=j*j,E=M*j,u=1-j,_=u*u,p=_*u;let i=p*Q+3*_*j*G+3*u*M*y+E*Z-$;if(Math.abs(i)<0.0000000001)break;let d=3*_*(G-Q)+6*u*j*(y-G)+3*M*(Z-y);if(Math.abs(d)<0.0000000001)break;j=j-i/d,j=Math.max(0,Math.min(1,j))}K[D]=p*w+3*_*j*R+3*u*M*C+E*F}return K}}class T6{constructor(J,Q,$,Z){if(J===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(Q===void 0||Q.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+J);this.name=J,this.times=PZ(Q,this.TimeBufferType),this.values=PZ($,this.ValueBufferType),this.setInterpolation(Z||this.DefaultInterpolation)}static toJSON(J){let Q=J.constructor,$;if(Q.toJSON!==this.toJSON)$=Q.toJSON(J);else{$={name:J.name,times:PZ(J.times,Array),values:PZ(J.values,Array)};let Z=J.getInterpolation();if(Z!==J.DefaultInterpolation)$.interpolation=Z}return $.type=J.ValueTypeName,$}InterpolantFactoryMethodDiscrete(J){return new YH(this.times,this.values,this.getValueSize(),J)}InterpolantFactoryMethodLinear(J){return new NH(this.times,this.values,this.getValueSize(),J)}InterpolantFactoryMethodSmooth(J){return new qH(this.times,this.values,this.getValueSize(),J)}InterpolantFactoryMethodBezier(J){let Q=new UH(this.times,this.values,this.getValueSize(),J);if(this.settings)Q.settings=this.settings;return Q}setInterpolation(J){let Q;switch(J){case 2300:Q=this.InterpolantFactoryMethodDiscrete;break;case 2301:Q=this.InterpolantFactoryMethodLinear;break;case 2302:Q=this.InterpolantFactoryMethodSmooth;break;case 2303:Q=this.InterpolantFactoryMethodBezier;break}if(Q===void 0){let $="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(J!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error($);return b0("KeyframeTrack:",$),this}return this.createInterpolant=Q,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(J){if(J!==0){let Q=this.times;for(let $=0,Z=Q.length;$!==Z;++$)Q[$]+=J}return this}scale(J){if(J!==1){let Q=this.times;for(let $=0,Z=Q.length;$!==Z;++$)Q[$]*=J}return this}trim(J,Q){let $=this.times,Z=$.length,K=0,W=Z-1;while(K!==Z&&$[K]<J)++K;while(W!==-1&&$[W]>Q)--W;if(++W,K!==0||W!==Z){if(K>=W)W=Math.max(W,1),K=W-1;let X=this.getValueSize();this.times=$.slice(K,W),this.values=this.values.slice(K*X,W*X)}return this}validate(){let J=!0,Q=this.getValueSize();if(Q-Math.floor(Q)!==0)y0("KeyframeTrack: Invalid value size in track.",this),J=!1;let $=this.times,Z=this.values,K=$.length;if(K===0)y0("KeyframeTrack: Track is empty.",this),J=!1;let W=null;for(let X=0;X!==K;X++){let H=$[X];if(typeof H==="number"&&isNaN(H)){y0("KeyframeTrack: Time is not a valid number.",this,X,H),J=!1;break}if(W!==null&&W>H){y0("KeyframeTrack: Out of order keys.",this,X,H,W),J=!1;break}W=H}if(Z!==void 0){if(_M(Z))for(let X=0,H=Z.length;X!==H;++X){let q=Z[X];if(isNaN(q)){y0("KeyframeTrack: Value is not a valid number.",this,X,q),J=!1;break}}}return J}optimize(){let J=this.times.slice(),Q=this.values.slice(),$=this.getValueSize(),Z=this.getInterpolation()===2302,K=J.length-1,W=1;for(let X=1;X<K;++X){let H=!1,q=J[X],N=J[X+1];if(q!==N&&(X!==1||q!==J[0]))if(!Z){let Y=X*$,U=Y-$,V=Y+$;for(let z=0;z!==$;++z){let D=Q[Y+z];if(D!==Q[U+z]||D!==Q[V+z]){H=!0;break}}}else H=!0;if(H){if(X!==W){J[W]=J[X];let Y=X*$,U=W*$;for(let V=0;V!==$;++V)Q[U+V]=Q[Y+V]}++W}}if(K>0){J[W]=J[K];for(let X=K*$,H=W*$,q=0;q!==$;++q)Q[H+q]=Q[X+q];++W}if(W!==J.length)this.times=J.slice(0,W),this.values=Q.slice(0,W*$);else this.times=J,this.values=Q;return this}clone(){let J=this.times.slice(),Q=this.values.slice(),Z=new this.constructor(this.name,J,Q);return Z.createInterpolant=this.createInterpolant,Z}}T6.prototype.ValueTypeName="";T6.prototype.TimeBufferType=Float32Array;T6.prototype.ValueBufferType=Float32Array;T6.prototype.DefaultInterpolation=2301;class MJ extends T6{constructor(J,Q,$){super(J,Q,$)}}MJ.prototype.ValueTypeName="bool";MJ.prototype.ValueBufferType=Array;MJ.prototype.DefaultInterpolation=2300;MJ.prototype.InterpolantFactoryMethodLinear=void 0;MJ.prototype.InterpolantFactoryMethodSmooth=void 0;class VH extends T6{constructor(J,Q,$,Z){super(J,Q,$,Z)}}VH.prototype.ValueTypeName="color";class OH extends T6{constructor(J,Q,$,Z){super(J,Q,$,Z)}}OH.prototype.ValueTypeName="number";class FH extends kJ{constructor(J,Q,$,Z){super(J,Q,$,Z)}interpolate_(J,Q,$,Z){let K=this.resultBuffer,W=this.sampleValues,X=this.valueSize,H=($-Q)/(Z-Q),q=J*X;for(let N=q+X;q!==N;q+=4)L7.slerpFlat(K,0,W,q-X,W,q,H);return K}}class eZ extends T6{constructor(J,Q,$,Z){super(J,Q,$,Z)}InterpolantFactoryMethodLinear(J){return new FH(this.times,this.values,this.getValueSize(),J)}}eZ.prototype.ValueTypeName="quaternion";eZ.prototype.InterpolantFactoryMethodSmooth=void 0;class wJ extends T6{constructor(J,Q,$){super(J,Q,$)}}wJ.prototype.ValueTypeName="string";wJ.prototype.ValueBufferType=Array;wJ.prototype.DefaultInterpolation=2300;wJ.prototype.InterpolantFactoryMethodLinear=void 0;wJ.prototype.InterpolantFactoryMethodSmooth=void 0;class zH extends T6{constructor(J,Q,$,Z){super(J,Q,$,Z)}}zH.prototype.ValueTypeName="vector";class DH{constructor(J,Q,$){let Z=this,K=!1,W=0,X=0,H=void 0,q=[];this.onStart=void 0,this.onLoad=J,this.onProgress=Q,this.onError=$,this._abortController=null,this.itemStart=function(N){if(X++,K===!1){if(Z.onStart!==void 0)Z.onStart(N,W,X)}K=!0},this.itemEnd=function(N){if(W++,Z.onProgress!==void 0)Z.onProgress(N,W,X);if(W===X){if(K=!1,Z.onLoad!==void 0)Z.onLoad()}},this.itemError=function(N){if(Z.onError!==void 0)Z.onError(N)},this.resolveURL=function(N){if(H)return H(N);return N},this.setURLModifier=function(N){return H=N,this},this.addHandler=function(N,Y){return q.push(N,Y),this},this.removeHandler=function(N){let Y=q.indexOf(N);if(Y!==-1)q.splice(Y,2);return this},this.getHandler=function(N){for(let Y=0,U=q.length;Y<U;Y+=2){let V=q[Y],z=q[Y+1];if(V.global)V.lastIndex=0;if(V.test(N))return z}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var Sz=new DH;class kH{constructor(J){if(this.manager=J!==void 0?J:Sz,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(J,Q){let $=this;return new Promise(function(Z,K){$.load(J,Z,Q,K)})}parse(){}setCrossOrigin(J){return this.crossOrigin=J,this}setWithCredentials(J){return this.withCredentials=J,this}setPath(J){return this.path=J,this}setResourcePath(J){return this.resourcePath=J,this}setRequestHeader(J){return this.requestHeader=J,this}abort(){return this}}kH.DEFAULT_MATERIAL_NAME="__DEFAULT";class JK extends J6{constructor(J,Q=1){super();this.isLight=!0,this.type="Light",this.color=new l0(J),this.intensity=Q}dispose(){this.dispatchEvent({type:"dispose"})}copy(J,Q){return super.copy(J,Q),this.color.copy(J.color),this.intensity=J.intensity,this}toJSON(J){let Q=super.toJSON(J);return Q.object.color=this.color.getHex(),Q.object.intensity=this.intensity,Q}}var r5=new L8,GF=new g,BF=new g;class Tz{constructor(J){this.camera=J,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Z8(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new L8,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new IQ,this._frameExtents=new Z8(1,1),this._viewportCount=1,this._viewports=[new A8(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(J){let Q=this.camera,$=this.matrix;if(GF.setFromMatrixPosition(J.matrixWorld),Q.position.copy(GF),BF.setFromMatrixPosition(J.target.matrixWorld),Q.lookAt(BF),Q.updateMatrixWorld(),r5.multiplyMatrices(Q.projectionMatrix,Q.matrixWorldInverse),this._frustum.setFromProjectionMatrix(r5,Q.coordinateSystem,Q.reversedDepth),Q.coordinateSystem===2001||Q.reversedDepth)$.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,1,0,0,0,0,1);else $.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);$.multiply(r5)}getViewport(J){return this._viewports[J]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(J){return this.camera=J.camera.clone(),this.intensity=J.intensity,this.bias=J.bias,this.radius=J.radius,this.autoUpdate=J.autoUpdate,this.needsUpdate=J.needsUpdate,this.normalBias=J.normalBias,this.blurSamples=J.blurSamples,this.mapSize.copy(J.mapSize),this.biasNode=J.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let J={};if(this.intensity!==1)J.intensity=this.intensity;if(this.bias!==0)J.bias=this.bias;if(this.normalBias!==0)J.normalBias=this.normalBias;if(this.radius!==1)J.radius=this.radius;if(this.mapSize.x!==512||this.mapSize.y!==512)J.mapSize=this.mapSize.toArray();return J.camera=this.camera.toJSON(!1).object,delete J.camera.matrix,J}}var jZ=new g,SZ=new L7,r6=new g;class QK extends J6{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new L8,this.projectionMatrix=new L8,this.projectionMatrixInverse=new L8,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(J,Q){return super.copy(J,Q),this.matrixWorldInverse.copy(J.matrixWorldInverse),this.projectionMatrix.copy(J.projectionMatrix),this.projectionMatrixInverse.copy(J.projectionMatrixInverse),this.coordinateSystem=J.coordinateSystem,this}getWorldDirection(J){return super.getWorldDirection(J).negate()}updateMatrixWorld(J){if(super.updateMatrixWorld(J),this.matrixWorld.decompose(jZ,SZ,r6),r6.x===1&&r6.y===1&&r6.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(jZ,SZ,r6.set(1,1,1)).invert()}updateWorldMatrix(J,Q){if(super.updateWorldMatrix(J,Q),this.matrixWorld.decompose(jZ,SZ,r6),r6.x===1&&r6.y===1&&r6.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(jZ,SZ,r6.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var p7=new g,RF=new Z8,AF=new Z8;class t8 extends QK{constructor(J=50,Q=1,$=0.1,Z=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=J,this.zoom=1,this.near=$,this.far=Z,this.focus=10,this.aspect=Q,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(J,Q){return super.copy(J,Q),this.fov=J.fov,this.zoom=J.zoom,this.near=J.near,this.far=J.far,this.focus=J.focus,this.aspect=J.aspect,this.view=J.view===null?null:Object.assign({},J.view),this.filmGauge=J.filmGauge,this.filmOffset=J.filmOffset,this}setFocalLength(J){let Q=0.5*this.getFilmHeight()/J;this.fov=TZ*2*Math.atan(Q),this.updateProjectionMatrix()}getFocalLength(){let J=Math.tan(E5*0.5*this.fov);return 0.5*this.getFilmHeight()/J}getEffectiveFOV(){return TZ*2*Math.atan(Math.tan(E5*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(J,Q,$){p7.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),Q.set(p7.x,p7.y).multiplyScalar(-J/p7.z),p7.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),$.set(p7.x,p7.y).multiplyScalar(-J/p7.z)}getViewSize(J,Q){return this.getViewBounds(J,RF,AF),Q.subVectors(AF,RF)}setViewOffset(J,Q,$,Z,K,W){if(this.aspect=J/Q,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=J,this.view.fullHeight=Q,this.view.offsetX=$,this.view.offsetY=Z,this.view.width=K,this.view.height=W,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let J=this.near,Q=J*Math.tan(E5*0.5*this.fov)/this.zoom,$=2*Q,Z=this.aspect*$,K=-0.5*Z,W=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:H,fullHeight:q}=W;K+=W.offsetX*Z/H,Q-=W.offsetY*$/q,Z*=W.width/H,$*=W.height/q}let X=this.filmOffset;if(X!==0)K+=J*X/this.getFilmWidth();this.projectionMatrix.makePerspective(K,K+Z,Q,Q-$,J,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(J){let Q=super.toJSON(J);if(Q.object.fov=this.fov,Q.object.zoom=this.zoom,Q.object.near=this.near,Q.object.far=this.far,Q.object.focus=this.focus,Q.object.aspect=this.aspect,this.view!==null)Q.object.view=Object.assign({},this.view);return Q.object.filmGauge=this.filmGauge,Q.object.filmOffset=this.filmOffset,Q}}class yz extends Tz{constructor(){super(new t8(90,1,0.5,500));this.isPointLightShadow=!0}}class $K extends JK{constructor(J,Q,$=0,Z=2){super(J,Q);this.isPointLight=!0,this.type="PointLight",this.distance=$,this.decay=Z,this.shadow=new yz}get power(){return this.intensity*4*Math.PI}set power(J){this.intensity=J/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(J,Q){return super.copy(J,Q),this.distance=J.distance,this.decay=J.decay,this.shadow=J.shadow.clone(),this}toJSON(J){let Q=super.toJSON(J);return Q.object.distance=this.distance,Q.object.decay=this.decay,Q.object.shadow=this.shadow.toJSON(),Q}}class ZK extends QK{constructor(J=-1,Q=1,$=1,Z=-1,K=0.1,W=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=J,this.right=Q,this.top=$,this.bottom=Z,this.near=K,this.far=W,this.updateProjectionMatrix()}copy(J,Q){return super.copy(J,Q),this.left=J.left,this.right=J.right,this.top=J.top,this.bottom=J.bottom,this.near=J.near,this.far=J.far,this.zoom=J.zoom,this.view=J.view===null?null:Object.assign({},J.view),this}setViewOffset(J,Q,$,Z,K,W){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=J,this.view.fullHeight=Q,this.view.offsetX=$,this.view.offsetY=Z,this.view.width=K,this.view.height=W,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let J=(this.right-this.left)/(2*this.zoom),Q=(this.top-this.bottom)/(2*this.zoom),$=(this.right+this.left)/2,Z=(this.top+this.bottom)/2,K=$-J,W=$+J,X=Z+Q,H=Z-Q;if(this.view!==null&&this.view.enabled){let q=(this.right-this.left)/this.view.fullWidth/this.zoom,N=(this.top-this.bottom)/this.view.fullHeight/this.zoom;K+=q*this.view.offsetX,W=K+q*this.view.width,X-=N*this.view.offsetY,H=X-N*this.view.height}this.projectionMatrix.makeOrthographic(K,W,X,H,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(J){let Q=super.toJSON(J);if(Q.object.zoom=this.zoom,Q.object.left=this.left,Q.object.right=this.right,Q.object.top=this.top,Q.object.bottom=this.bottom,Q.object.near=this.near,Q.object.far=this.far,this.view!==null)Q.object.view=Object.assign({},this.view);return Q}}class KK extends JK{constructor(J,Q){super(J,Q);this.isAmbientLight=!0,this.type="AmbientLight"}}var X9=-90,H9=1;class MH extends J6{constructor(J,Q,$){super();this.type="CubeCamera",this.renderTarget=$,this.coordinateSystem=null,this.activeMipmapLevel=0;let Z=new t8(X9,H9,J,Q);Z.layers=this.layers,this.add(Z);let K=new t8(X9,H9,J,Q);K.layers=this.layers,this.add(K);let W=new t8(X9,H9,J,Q);W.layers=this.layers,this.add(W);let X=new t8(X9,H9,J,Q);X.layers=this.layers,this.add(X);let H=new t8(X9,H9,J,Q);H.layers=this.layers,this.add(H);let q=new t8(X9,H9,J,Q);q.layers=this.layers,this.add(q)}updateCoordinateSystem(){let J=this.coordinateSystem,Q=this.children.concat(),[$,Z,K,W,X,H]=Q;for(let q of Q)this.remove(q);if(J===2000)$.up.set(0,1,0),$.lookAt(1,0,0),Z.up.set(0,1,0),Z.lookAt(-1,0,0),K.up.set(0,0,-1),K.lookAt(0,1,0),W.up.set(0,0,1),W.lookAt(0,-1,0),X.up.set(0,1,0),X.lookAt(0,0,1),H.up.set(0,1,0),H.lookAt(0,0,-1);else if(J===2001)$.up.set(0,-1,0),$.lookAt(-1,0,0),Z.up.set(0,-1,0),Z.lookAt(1,0,0),K.up.set(0,0,1),K.lookAt(0,1,0),W.up.set(0,0,-1),W.lookAt(0,-1,0),X.up.set(0,-1,0),X.lookAt(0,0,1),H.up.set(0,-1,0),H.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+J);for(let q of Q)this.add(q),q.updateMatrixWorld()}update(J,Q){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:$,activeMipmapLevel:Z}=this;if(this.coordinateSystem!==J.coordinateSystem)this.coordinateSystem=J.coordinateSystem,this.updateCoordinateSystem();let[K,W,X,H,q,N]=this.children,Y=J.getRenderTarget(),U=J.getActiveCubeFace(),V=J.getActiveMipmapLevel(),z=J.xr.enabled;J.xr.enabled=!1;let D=$.texture.generateMipmaps;$.texture.generateMipmaps=!1;let w=!1;if(J.isWebGLRenderer===!0)w=J.state.buffers.depth.getReversed();else w=J.reversedDepthBuffer;if(J.setRenderTarget($,0,Z),w&&J.autoClear===!1)J.clearDepth();if(J.render(Q,K),J.setRenderTarget($,1,Z),w&&J.autoClear===!1)J.clearDepth();if(J.render(Q,W),J.setRenderTarget($,2,Z),w&&J.autoClear===!1)J.clearDepth();if(J.render(Q,X),J.setRenderTarget($,3,Z),w&&J.autoClear===!1)J.clearDepth();if(J.render(Q,H),J.setRenderTarget($,4,Z),w&&J.autoClear===!1)J.clearDepth();if(J.render(Q,q),$.texture.generateMipmaps=D,J.setRenderTarget($,5,Z),w&&J.autoClear===!1)J.clearDepth();J.render(Q,N),J.setRenderTarget(Y,U,V),J.xr.enabled=z,$.texture.needsPMREMUpdate=!0}}class wH extends t8{constructor(J=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=J}}var IH="\\[\\]\\.:\\/",aM=new RegExp("["+IH+"]","g"),LH="[^"+IH+"]",rM="[^"+IH.replace("\\.","")+"]",tM=/((?:WC+[\/:])*)/.source.replace("WC",LH),eM=/(WCOD+)?/.source.replace("WCOD",rM),Jw=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",LH),Qw=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",LH),$w=new RegExp("^"+tM+eM+Jw+Qw+"$"),Zw=["material","materials","bones","map"];class bz{constructor(J,Q,$){let Z=$||W8.parseTrackName(Q);this._targetGroup=J,this._bindings=J.subscribe_(Q,Z)}getValue(J,Q){this.bind();let $=this._targetGroup.nCachedObjects_,Z=this._bindings[$];if(Z!==void 0)Z.getValue(J,Q)}setValue(J,Q){let $=this._bindings;for(let Z=this._targetGroup.nCachedObjects_,K=$.length;Z!==K;++Z)$[Z].setValue(J,Q)}bind(){let J=this._bindings;for(let Q=this._targetGroup.nCachedObjects_,$=J.length;Q!==$;++Q)J[Q].bind()}unbind(){let J=this._bindings;for(let Q=this._targetGroup.nCachedObjects_,$=J.length;Q!==$;++Q)J[Q].unbind()}}class W8{constructor(J,Q,$){this.path=Q,this.parsedPath=$||W8.parseTrackName(Q),this.node=W8.findNode(J,this.parsedPath.nodeName),this.rootNode=J,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(J,Q,$){if(!(J&&J.isAnimationObjectGroup))return new W8(J,Q,$);else return new W8.Composite(J,Q,$)}static sanitizeNodeName(J){return J.replace(/\s/g,"_").replace(aM,"")}static parseTrackName(J){let Q=$w.exec(J);if(Q===null)throw Error("PropertyBinding: Cannot parse trackName: "+J);let $={nodeName:Q[2],objectName:Q[3],objectIndex:Q[4],propertyName:Q[5],propertyIndex:Q[6]},Z=$.nodeName&&$.nodeName.lastIndexOf(".");if(Z!==void 0&&Z!==-1){let K=$.nodeName.substring(Z+1);if(Zw.indexOf(K)!==-1)$.nodeName=$.nodeName.substring(0,Z),$.objectName=K}if($.propertyName===null||$.propertyName.length===0)throw Error("PropertyBinding: can not parse propertyName from trackName: "+J);return $}static findNode(J,Q){if(Q===void 0||Q===""||Q==="."||Q===-1||Q===J.name||Q===J.uuid)return J;if(J.skeleton){let $=J.skeleton.getBoneByName(Q);if($!==void 0)return $}if(J.children){let $=function(K){for(let W=0;W<K.length;W++){let X=K[W];if(X.name===Q||X.uuid===Q)return X;let H=$(X.children);if(H)return H}return null},Z=$(J.children);if(Z)return Z}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(J,Q){J[Q]=this.targetObject[this.propertyName]}_getValue_array(J,Q){let $=this.resolvedProperty;for(let Z=0,K=$.length;Z!==K;++Z)J[Q++]=$[Z]}_getValue_arrayElement(J,Q){J[Q]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(J,Q){this.resolvedProperty.toArray(J,Q)}_setValue_direct(J,Q){this.targetObject[this.propertyName]=J[Q]}_setValue_direct_setNeedsUpdate(J,Q){this.targetObject[this.propertyName]=J[Q],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(J,Q){this.targetObject[this.propertyName]=J[Q],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(J,Q){let $=this.resolvedProperty;for(let Z=0,K=$.length;Z!==K;++Z)$[Z]=J[Q++]}_setValue_array_setNeedsUpdate(J,Q){let $=this.resolvedProperty;for(let Z=0,K=$.length;Z!==K;++Z)$[Z]=J[Q++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(J,Q){let $=this.resolvedProperty;for(let Z=0,K=$.length;Z!==K;++Z)$[Z]=J[Q++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(J,Q){this.resolvedProperty[this.propertyIndex]=J[Q]}_setValue_arrayElement_setNeedsUpdate(J,Q){this.resolvedProperty[this.propertyIndex]=J[Q],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(J,Q){this.resolvedProperty[this.propertyIndex]=J[Q],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(J,Q){this.resolvedProperty.fromArray(J,Q)}_setValue_fromArray_setNeedsUpdate(J,Q){this.resolvedProperty.fromArray(J,Q),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(J,Q){this.resolvedProperty.fromArray(J,Q),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(J,Q){this.bind(),this.getValue(J,Q)}_setValue_unbound(J,Q){this.bind(),this.setValue(J,Q)}bind(){let J=this.node,Q=this.parsedPath,$=Q.objectName,Z=Q.propertyName,K=Q.propertyIndex;if(!J)J=W8.findNode(this.rootNode,Q.nodeName),this.node=J;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!J){b0("PropertyBinding: No target node found for track: "+this.path+".");return}if($){let q=Q.objectIndex;switch($){case"materials":if(!J.material){y0("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!J.material.materials){y0("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}J=J.material.materials;break;case"bones":if(!J.skeleton){y0("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}J=J.skeleton.bones;for(let N=0;N<J.length;N++)if(J[N].name===q){q=N;break}break;case"map":if("map"in J){J=J.map;break}if(!J.material){y0("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!J.material.map){y0("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}J=J.material.map;break;default:if(J[$]===void 0){y0("PropertyBinding: Can not bind to objectName of node undefined.",this);return}J=J[$]}if(q!==void 0){if(J[q]===void 0){y0("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,J);return}J=J[q]}}let W=J[Z];if(W===void 0){let q=Q.nodeName;y0("PropertyBinding: Trying to update property for track: "+q+"."+Z+" but it wasn't found.",J);return}let X=this.Versioning.None;if(this.targetObject=J,J.isMaterial===!0)X=this.Versioning.NeedsUpdate;else if(J.isObject3D===!0)X=this.Versioning.MatrixWorldNeedsUpdate;let H=this.BindingType.Direct;if(K!==void 0){if(Z==="morphTargetInfluences"){if(!J.geometry){y0("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!J.geometry.morphAttributes){y0("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(J.morphTargetDictionary[K]!==void 0)K=J.morphTargetDictionary[K]}H=this.BindingType.ArrayElement,this.resolvedProperty=W,this.propertyIndex=K}else if(W.fromArray!==void 0&&W.toArray!==void 0)H=this.BindingType.HasFromToArray,this.resolvedProperty=W;else if(Array.isArray(W))H=this.BindingType.EntireArray,this.resolvedProperty=W;else this.propertyName=Z;this.getValue=this.GetterByBindingType[H],this.setValue=this.SetterByBindingTypeAndVersioning[H][X]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}W8.Composite=bz;W8.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};W8.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};W8.prototype.GetterByBindingType=[W8.prototype._getValue_direct,W8.prototype._getValue_array,W8.prototype._getValue_arrayElement,W8.prototype._getValue_toArray];W8.prototype.SetterByBindingTypeAndVersioning=[[W8.prototype._setValue_direct,W8.prototype._setValue_direct_setNeedsUpdate,W8.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[W8.prototype._setValue_array,W8.prototype._setValue_array_setNeedsUpdate,W8.prototype._setValue_array_setMatrixWorldNeedsUpdate],[W8.prototype._setValue_arrayElement,W8.prototype._setValue_arrayElement_setNeedsUpdate,W8.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[W8.prototype._setValue_fromArray,W8.prototype._setValue_fromArray_setNeedsUpdate,W8.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Ax=new Float32Array(1);function GH(J,Q,$,Z){let K=Kw(Z);switch($){case 1021:return J*Q;case 1028:return J*Q/K.components*K.byteLength;case 1029:return J*Q/K.components*K.byteLength;case 1030:return J*Q*2/K.components*K.byteLength;case 1031:return J*Q*2/K.components*K.byteLength;case 1022:return J*Q*3/K.components*K.byteLength;case 1023:return J*Q*4/K.components*K.byteLength;case 1033:return J*Q*4/K.components*K.byteLength;case 33776:case 33777:return Math.floor((J+3)/4)*Math.floor((Q+3)/4)*8;case 33778:case 33779:return Math.floor((J+3)/4)*Math.floor((Q+3)/4)*16;case 35841:case 35843:return Math.max(J,16)*Math.max(Q,8)/4;case 35840:case 35842:return Math.max(J,8)*Math.max(Q,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((J+3)/4)*Math.floor((Q+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((J+3)/4)*Math.floor((Q+3)/4)*16;case 37808:return Math.floor((J+3)/4)*Math.floor((Q+3)/4)*16;case 37809:return Math.floor((J+4)/5)*Math.floor((Q+3)/4)*16;case 37810:return Math.floor((J+4)/5)*Math.floor((Q+4)/5)*16;case 37811:return Math.floor((J+5)/6)*Math.floor((Q+4)/5)*16;case 37812:return Math.floor((J+5)/6)*Math.floor((Q+5)/6)*16;case 37813:return Math.floor((J+7)/8)*Math.floor((Q+4)/5)*16;case 37814:return Math.floor((J+7)/8)*Math.floor((Q+5)/6)*16;case 37815:return Math.floor((J+7)/8)*Math.floor((Q+7)/8)*16;case 37816:return Math.floor((J+9)/10)*Math.floor((Q+4)/5)*16;case 37817:return Math.floor((J+9)/10)*Math.floor((Q+5)/6)*16;case 37818:return Math.floor((J+9)/10)*Math.floor((Q+7)/8)*16;case 37819:return Math.floor((J+9)/10)*Math.floor((Q+9)/10)*16;case 37820:return Math.floor((J+11)/12)*Math.floor((Q+9)/10)*16;case 37821:return Math.floor((J+11)/12)*Math.floor((Q+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(J/4)*Math.ceil(Q/4)*16;case 36283:case 36284:return Math.ceil(J/4)*Math.ceil(Q/4)*8;case 36285:case 36286:return Math.ceil(J/4)*Math.ceil(Q/4)*16}throw Error(`Unable to determine texture byte length for ${$} format.`)}function Kw(J){switch(J){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${J}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"183"}}));if(typeof window<"u")if(window.__THREE__)b0("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="183";function ZD(){let J=null,Q=!1,$=null,Z=null;function K(W,X){$(W,X),Z=J.requestAnimationFrame(K)}return{start:function(){if(Q===!0)return;if($===null)return;Z=J.requestAnimationFrame(K),Q=!0},stop:function(){J.cancelAnimationFrame(Z),Q=!1},setAnimationLoop:function(W){$=W},setContext:function(W){J=W}}}function Ww(J){let Q=new WeakMap;function $(H,q){let{array:N,usage:Y}=H,U=N.byteLength,V=J.createBuffer();J.bindBuffer(q,V),J.bufferData(q,N,Y),H.onUploadCallback();let z;if(N instanceof Float32Array)z=J.FLOAT;else if(typeof Float16Array<"u"&&N instanceof Float16Array)z=J.HALF_FLOAT;else if(N instanceof Uint16Array)if(H.isFloat16BufferAttribute)z=J.HALF_FLOAT;else z=J.UNSIGNED_SHORT;else if(N instanceof Int16Array)z=J.SHORT;else if(N instanceof Uint32Array)z=J.UNSIGNED_INT;else if(N instanceof Int32Array)z=J.INT;else if(N instanceof Int8Array)z=J.BYTE;else if(N instanceof Uint8Array)z=J.UNSIGNED_BYTE;else if(N instanceof Uint8ClampedArray)z=J.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+N);return{buffer:V,type:z,bytesPerElement:N.BYTES_PER_ELEMENT,version:H.version,size:U}}function Z(H,q,N){let{array:Y,updateRanges:U}=q;if(J.bindBuffer(N,H),U.length===0)J.bufferSubData(N,0,Y);else{U.sort((z,D)=>z.start-D.start);let V=0;for(let z=1;z<U.length;z++){let D=U[V],w=U[z];if(w.start<=D.start+D.count+1)D.count=Math.max(D.count,w.start+w.count-D.start);else++V,U[V]=w}U.length=V+1;for(let z=0,D=U.length;z<D;z++){let w=U[z];J.bufferSubData(N,w.start*Y.BYTES_PER_ELEMENT,Y,w.start,w.count)}q.clearUpdateRanges()}q.onUploadCallback()}function K(H){if(H.isInterleavedBufferAttribute)H=H.data;return Q.get(H)}function W(H){if(H.isInterleavedBufferAttribute)H=H.data;let q=Q.get(H);if(q)J.deleteBuffer(q.buffer),Q.delete(H)}function X(H,q){if(H.isInterleavedBufferAttribute)H=H.data;if(H.isGLBufferAttribute){let Y=Q.get(H);if(!Y||Y.version<H.version)Q.set(H,{buffer:H.buffer,type:H.type,bytesPerElement:H.elementSize,version:H.version});return}let N=Q.get(H);if(N===void 0)Q.set(H,$(H,q));else if(N.version<H.version){if(N.size!==H.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");Z(N.buffer,H,q),N.version=H.version}}return{get:K,remove:W,update:X}}var Xw=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Hw=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,qw=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Nw=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yw=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Uw=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Vw=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Ow=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Fw=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,zw=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Dw=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,kw=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Mw=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ww=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Iw=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Lw=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Gw=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Bw=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Rw=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Aw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Cw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,_w=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Ew=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Pw=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,jw=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Sw=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Tw=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,yw=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,bw=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,vw=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,fw="gl_FragColor = linearToOutputTexel( gl_FragColor );",hw=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,xw=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,gw=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,pw=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,mw=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,dw=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,lw=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,cw=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,uw=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,sw=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,nw=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,iw=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ow=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,aw=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,rw=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,tw=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,ew=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,JI=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,QI=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,$I=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ZI=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,KI=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,WI=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,XI=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,HI=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,qI=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,NI=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,YI=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,UI=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,VI=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,OI=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,FI=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,zI=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,DI=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,kI=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,MI=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,wI=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,II=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,LI=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,GI=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,BI=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,RI=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,AI=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,CI=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,_I=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,EI=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,PI=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,jI=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,SI=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,TI=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,yI=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,bI=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,vI=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,fI=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,hI=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,xI=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,gI=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,pI=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,mI=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,dI=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,lI=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,cI=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,uI=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,sI=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,nI=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,iI=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,oI=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,aI=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,rI=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tI=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,eI=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,J2=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Q2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,$2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Z2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,K2=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,W2=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,X2=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,H2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,q2=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,N2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Y2=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,U2=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,V2=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,O2=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,F2=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,z2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,D2=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,k2=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,M2=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,w2=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,I2=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,L2=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,G2=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,B2=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,R2=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,A2=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,C2=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,_2=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,E2=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,P2=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,j2=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,S2=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,T2=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,y2=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,b2=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,v2=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,f2=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,h2=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,x2=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,g0={alphahash_fragment:Xw,alphahash_pars_fragment:Hw,alphamap_fragment:qw,alphamap_pars_fragment:Nw,alphatest_fragment:Yw,alphatest_pars_fragment:Uw,aomap_fragment:Vw,aomap_pars_fragment:Ow,batching_pars_vertex:Fw,batching_vertex:zw,begin_vertex:Dw,beginnormal_vertex:kw,bsdfs:Mw,iridescence_fragment:ww,bumpmap_pars_fragment:Iw,clipping_planes_fragment:Lw,clipping_planes_pars_fragment:Gw,clipping_planes_pars_vertex:Bw,clipping_planes_vertex:Rw,color_fragment:Aw,color_pars_fragment:Cw,color_pars_vertex:_w,color_vertex:Ew,common:Pw,cube_uv_reflection_fragment:jw,defaultnormal_vertex:Sw,displacementmap_pars_vertex:Tw,displacementmap_vertex:yw,emissivemap_fragment:bw,emissivemap_pars_fragment:vw,colorspace_fragment:fw,colorspace_pars_fragment:hw,envmap_fragment:xw,envmap_common_pars_fragment:gw,envmap_pars_fragment:pw,envmap_pars_vertex:mw,envmap_physical_pars_fragment:tw,envmap_vertex:dw,fog_vertex:lw,fog_pars_vertex:cw,fog_fragment:uw,fog_pars_fragment:sw,gradientmap_pars_fragment:nw,lightmap_pars_fragment:iw,lights_lambert_fragment:ow,lights_lambert_pars_fragment:aw,lights_pars_begin:rw,lights_toon_fragment:ew,lights_toon_pars_fragment:JI,lights_phong_fragment:QI,lights_phong_pars_fragment:$I,lights_physical_fragment:ZI,lights_physical_pars_fragment:KI,lights_fragment_begin:WI,lights_fragment_maps:XI,lights_fragment_end:HI,logdepthbuf_fragment:qI,logdepthbuf_pars_fragment:NI,logdepthbuf_pars_vertex:YI,logdepthbuf_vertex:UI,map_fragment:VI,map_pars_fragment:OI,map_particle_fragment:FI,map_particle_pars_fragment:zI,metalnessmap_fragment:DI,metalnessmap_pars_fragment:kI,morphinstance_vertex:MI,morphcolor_vertex:wI,morphnormal_vertex:II,morphtarget_pars_vertex:LI,morphtarget_vertex:GI,normal_fragment_begin:BI,normal_fragment_maps:RI,normal_pars_fragment:AI,normal_pars_vertex:CI,normal_vertex:_I,normalmap_pars_fragment:EI,clearcoat_normal_fragment_begin:PI,clearcoat_normal_fragment_maps:jI,clearcoat_pars_fragment:SI,iridescence_pars_fragment:TI,opaque_fragment:yI,packing:bI,premultiplied_alpha_fragment:vI,project_vertex:fI,dithering_fragment:hI,dithering_pars_fragment:xI,roughnessmap_fragment:gI,roughnessmap_pars_fragment:pI,shadowmap_pars_fragment:mI,shadowmap_pars_vertex:dI,shadowmap_vertex:lI,shadowmask_pars_fragment:cI,skinbase_vertex:uI,skinning_pars_vertex:sI,skinning_vertex:nI,skinnormal_vertex:iI,specularmap_fragment:oI,specularmap_pars_fragment:aI,tonemapping_fragment:rI,tonemapping_pars_fragment:tI,transmission_fragment:eI,transmission_pars_fragment:J2,uv_pars_fragment:Q2,uv_pars_vertex:$2,uv_vertex:Z2,worldpos_vertex:K2,background_vert:W2,background_frag:X2,backgroundCube_vert:H2,backgroundCube_frag:q2,cube_vert:N2,cube_frag:Y2,depth_vert:U2,depth_frag:V2,distance_vert:O2,distance_frag:F2,equirect_vert:z2,equirect_frag:D2,linedashed_vert:k2,linedashed_frag:M2,meshbasic_vert:w2,meshbasic_frag:I2,meshlambert_vert:L2,meshlambert_frag:G2,meshmatcap_vert:B2,meshmatcap_frag:R2,meshnormal_vert:A2,meshnormal_frag:C2,meshphong_vert:_2,meshphong_frag:E2,meshphysical_vert:P2,meshphysical_frag:j2,meshtoon_vert:S2,meshtoon_frag:T2,points_vert:y2,points_frag:b2,shadow_vert:v2,shadow_frag:f2,sprite_vert:h2,sprite_frag:x2},H0={common:{diffuse:{value:new l0(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new x0},alphaMap:{value:null},alphaMapTransform:{value:new x0},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new x0}},envmap:{envMap:{value:null},envMapRotation:{value:new x0},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new x0}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new x0}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new x0},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new x0},normalScale:{value:new Z8(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new x0},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new x0}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new x0}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new x0}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new l0(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new l0(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new x0},alphaTest:{value:0},uvTransform:{value:new x0}},sprite:{diffuse:{value:new l0(16777215)},opacity:{value:1},center:{value:new Z8(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new x0},alphaMap:{value:null},alphaMapTransform:{value:new x0},alphaTest:{value:0}}},Z7={basic:{uniforms:Q6([H0.common,H0.specularmap,H0.envmap,H0.aomap,H0.lightmap,H0.fog]),vertexShader:g0.meshbasic_vert,fragmentShader:g0.meshbasic_frag},lambert:{uniforms:Q6([H0.common,H0.specularmap,H0.envmap,H0.aomap,H0.lightmap,H0.emissivemap,H0.bumpmap,H0.normalmap,H0.displacementmap,H0.fog,H0.lights,{emissive:{value:new l0(0)},envMapIntensity:{value:1}}]),vertexShader:g0.meshlambert_vert,fragmentShader:g0.meshlambert_frag},phong:{uniforms:Q6([H0.common,H0.specularmap,H0.envmap,H0.aomap,H0.lightmap,H0.emissivemap,H0.bumpmap,H0.normalmap,H0.displacementmap,H0.fog,H0.lights,{emissive:{value:new l0(0)},specular:{value:new l0(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:g0.meshphong_vert,fragmentShader:g0.meshphong_frag},standard:{uniforms:Q6([H0.common,H0.envmap,H0.aomap,H0.lightmap,H0.emissivemap,H0.bumpmap,H0.normalmap,H0.displacementmap,H0.roughnessmap,H0.metalnessmap,H0.fog,H0.lights,{emissive:{value:new l0(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:g0.meshphysical_vert,fragmentShader:g0.meshphysical_frag},toon:{uniforms:Q6([H0.common,H0.aomap,H0.lightmap,H0.emissivemap,H0.bumpmap,H0.normalmap,H0.displacementmap,H0.gradientmap,H0.fog,H0.lights,{emissive:{value:new l0(0)}}]),vertexShader:g0.meshtoon_vert,fragmentShader:g0.meshtoon_frag},matcap:{uniforms:Q6([H0.common,H0.bumpmap,H0.normalmap,H0.displacementmap,H0.fog,{matcap:{value:null}}]),vertexShader:g0.meshmatcap_vert,fragmentShader:g0.meshmatcap_frag},points:{uniforms:Q6([H0.points,H0.fog]),vertexShader:g0.points_vert,fragmentShader:g0.points_frag},dashed:{uniforms:Q6([H0.common,H0.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:g0.linedashed_vert,fragmentShader:g0.linedashed_frag},depth:{uniforms:Q6([H0.common,H0.displacementmap]),vertexShader:g0.depth_vert,fragmentShader:g0.depth_frag},normal:{uniforms:Q6([H0.common,H0.bumpmap,H0.normalmap,H0.displacementmap,{opacity:{value:1}}]),vertexShader:g0.meshnormal_vert,fragmentShader:g0.meshnormal_frag},sprite:{uniforms:Q6([H0.sprite,H0.fog]),vertexShader:g0.sprite_vert,fragmentShader:g0.sprite_frag},background:{uniforms:{uvTransform:{value:new x0},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:g0.background_vert,fragmentShader:g0.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new x0}},vertexShader:g0.backgroundCube_vert,fragmentShader:g0.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:g0.cube_vert,fragmentShader:g0.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:g0.equirect_vert,fragmentShader:g0.equirect_frag},distance:{uniforms:Q6([H0.common,H0.displacementmap,{referencePosition:{value:new g},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:g0.distance_vert,fragmentShader:g0.distance_frag},shadow:{uniforms:Q6([H0.lights,H0.fog,{color:{value:new l0(0)},opacity:{value:1}}]),vertexShader:g0.shadow_vert,fragmentShader:g0.shadow_frag}};Z7.physical={uniforms:Q6([Z7.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new x0},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new x0},clearcoatNormalScale:{value:new Z8(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new x0},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new x0},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new x0},sheen:{value:0},sheenColor:{value:new l0(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new x0},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new x0},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new x0},transmissionSamplerSize:{value:new Z8},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new x0},attenuationDistance:{value:0},attenuationColor:{value:new l0(0)},specularColor:{value:new l0(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new x0},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new x0},anisotropyVector:{value:new Z8},anisotropyMap:{value:null},anisotropyMapTransform:{value:new x0}}]),vertexShader:g0.meshphysical_vert,fragmentShader:g0.meshphysical_frag};var WK={r:0,b:0,g:0},IJ=new t6,g2=new L8;function p2(J,Q,$,Z,K,W){let X=new l0(0),H=K===!0?0:1,q,N,Y=null,U=0,V=null;function z(G){let R=G.isScene===!0?G.background:null;if(R&&R.isTexture){let B=G.backgroundBlurriness>0;R=Q.get(R,B)}return R}function D(G){let R=!1,B=z(G);if(B===null)F(X,H);else if(B&&B.isColor)F(B,1),R=!0;let y=J.xr.getEnvironmentBlendMode();if(y==="additive")$.buffers.color.setClear(0,0,0,1,W);else if(y==="alpha-blend")$.buffers.color.setClear(0,0,0,0,W);if(J.autoClear||R)$.buffers.depth.setTest(!0),$.buffers.depth.setMask(!0),$.buffers.color.setMask(!0),J.clear(J.autoClearColor,J.autoClearDepth,J.autoClearStencil)}function w(G,R){let B=z(R);if(B&&(B.isCubeTexture||B.mapping===VQ)){if(N===void 0)N=new u6(new M9(1,1,1),new S6({name:"BackgroundCubeMaterial",uniforms:DJ(Z7.backgroundCube.uniforms),vertexShader:Z7.backgroundCube.vertexShader,fragmentShader:Z7.backgroundCube.fragmentShader,side:Y6,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),N.geometry.deleteAttribute("normal"),N.geometry.deleteAttribute("uv"),N.onBeforeRender=function(y,C,j){this.matrixWorld.copyPosition(j.matrixWorld)},Object.defineProperty(N.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),Z.update(N);if(IJ.copy(R.backgroundRotation),IJ.x*=-1,IJ.y*=-1,IJ.z*=-1,B.isCubeTexture&&B.isRenderTargetTexture===!1)IJ.y*=-1,IJ.z*=-1;if(N.material.uniforms.envMap.value=B,N.material.uniforms.flipEnvMap.value=B.isCubeTexture&&B.isRenderTargetTexture===!1?-1:1,N.material.uniforms.backgroundBlurriness.value=R.backgroundBlurriness,N.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,N.material.uniforms.backgroundRotation.value.setFromMatrix4(g2.makeRotationFromEuler(IJ)),N.material.toneMapped=a0.getTransfer(B.colorSpace)!==z8,Y!==B||U!==B.version||V!==J.toneMapping)N.material.needsUpdate=!0,Y=B,U=B.version,V=J.toneMapping;N.layers.enableAll(),G.unshift(N,N.geometry,N.material,0,0,null)}else if(B&&B.isTexture){if(q===void 0)q=new u6(new GQ(2,2),new S6({name:"BackgroundMaterial",uniforms:DJ(Z7.background.uniforms),vertexShader:Z7.background.vertexShader,fragmentShader:Z7.background.fragmentShader,side:V9,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),q.geometry.deleteAttribute("normal"),Object.defineProperty(q.material,"map",{get:function(){return this.uniforms.t2D.value}}),Z.update(q);if(q.material.uniforms.t2D.value=B,q.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,q.material.toneMapped=a0.getTransfer(B.colorSpace)!==z8,B.matrixAutoUpdate===!0)B.updateMatrix();if(q.material.uniforms.uvTransform.value.copy(B.matrix),Y!==B||U!==B.version||V!==J.toneMapping)q.material.needsUpdate=!0,Y=B,U=B.version,V=J.toneMapping;q.layers.enableAll(),G.unshift(q,q.geometry,q.material,0,0,null)}}function F(G,R){G.getRGB(WK,KH(J)),$.buffers.color.setClear(WK.r,WK.g,WK.b,R,W)}function O(){if(N!==void 0)N.geometry.dispose(),N.material.dispose(),N=void 0;if(q!==void 0)q.geometry.dispose(),q.material.dispose(),q=void 0}return{getClearColor:function(){return X},setClearColor:function(G,R=1){X.set(G),H=R,F(X,H)},getClearAlpha:function(){return H},setClearAlpha:function(G){H=G,F(X,H)},render:D,addToRenderList:w,dispose:O}}function m2(J,Q){let $=J.getParameter(J.MAX_VERTEX_ATTRIBS),Z={},K=V(null),W=K,X=!1;function H(_,p,n,f,i){let d=!1,m=U(_,f,n,p);if(W!==m)W=m,N(W.object);if(d=z(_,f,n,i),d)D(_,f,n,i);if(i!==null)Q.update(i,J.ELEMENT_ARRAY_BUFFER);if(d||X){if(X=!1,B(_,p,n,f),i!==null)J.bindBuffer(J.ELEMENT_ARRAY_BUFFER,Q.get(i).buffer)}}function q(){return J.createVertexArray()}function N(_){return J.bindVertexArray(_)}function Y(_){return J.deleteVertexArray(_)}function U(_,p,n,f){let i=f.wireframe===!0,d=Z[p.id];if(d===void 0)d={},Z[p.id]=d;let m=_.isInstancedMesh===!0?_.id:0,J0=d[m];if(J0===void 0)J0={},d[m]=J0;let Q0=J0[n.id];if(Q0===void 0)Q0={},J0[n.id]=Q0;let U0=Q0[i];if(U0===void 0)U0=V(q()),Q0[i]=U0;return U0}function V(_){let p=[],n=[],f=[];for(let i=0;i<$;i++)p[i]=0,n[i]=0,f[i]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:p,enabledAttributes:n,attributeDivisors:f,object:_,attributes:{},index:null}}function z(_,p,n,f){let i=W.attributes,d=p.attributes,m=0,J0=n.getAttributes();for(let Q0 in J0)if(J0[Q0].location>=0){let _0=i[Q0],Y0=d[Q0];if(Y0===void 0){if(Q0==="instanceMatrix"&&_.instanceMatrix)Y0=_.instanceMatrix;if(Q0==="instanceColor"&&_.instanceColor)Y0=_.instanceColor}if(_0===void 0)return!0;if(_0.attribute!==Y0)return!0;if(Y0&&_0.data!==Y0.data)return!0;m++}if(W.attributesNum!==m)return!0;if(W.index!==f)return!0;return!1}function D(_,p,n,f){let i={},d=p.attributes,m=0,J0=n.getAttributes();for(let Q0 in J0)if(J0[Q0].location>=0){let _0=d[Q0];if(_0===void 0){if(Q0==="instanceMatrix"&&_.instanceMatrix)_0=_.instanceMatrix;if(Q0==="instanceColor"&&_.instanceColor)_0=_.instanceColor}let Y0={};if(Y0.attribute=_0,_0&&_0.data)Y0.data=_0.data;i[Q0]=Y0,m++}W.attributes=i,W.attributesNum=m,W.index=f}function w(){let _=W.newAttributes;for(let p=0,n=_.length;p<n;p++)_[p]=0}function F(_){O(_,0)}function O(_,p){let{newAttributes:n,enabledAttributes:f,attributeDivisors:i}=W;if(n[_]=1,f[_]===0)J.enableVertexAttribArray(_),f[_]=1;if(i[_]!==p)J.vertexAttribDivisor(_,p),i[_]=p}function G(){let{newAttributes:_,enabledAttributes:p}=W;for(let n=0,f=p.length;n<f;n++)if(p[n]!==_[n])J.disableVertexAttribArray(n),p[n]=0}function R(_,p,n,f,i,d,m){if(m===!0)J.vertexAttribIPointer(_,p,n,i,d);else J.vertexAttribPointer(_,p,n,f,i,d)}function B(_,p,n,f){w();let i=f.attributes,d=n.getAttributes(),m=p.defaultAttributeValues;for(let J0 in d){let Q0=d[J0];if(Q0.location>=0){let U0=i[J0];if(U0===void 0){if(J0==="instanceMatrix"&&_.instanceMatrix)U0=_.instanceMatrix;if(J0==="instanceColor"&&_.instanceColor)U0=_.instanceColor}if(U0!==void 0){let{normalized:_0,itemSize:Y0}=U0,I8=Q.get(U0);if(I8===void 0)continue;let{buffer:X8,type:o,bytesPerElement:W0}=I8,z0=o===J.INT||o===J.UNSIGNED_INT||U0.gpuType===UX;if(U0.isInterleavedBufferAttribute){let V0=U0.data,S0=V0.stride,r0=U0.offset;if(V0.isInstancedInterleavedBuffer){for(let t0=0;t0<Q0.locationSize;t0++)O(Q0.location+t0,V0.meshPerAttribute);if(_.isInstancedMesh!==!0&&f._maxInstanceCount===void 0)f._maxInstanceCount=V0.meshPerAttribute*V0.count}else for(let t0=0;t0<Q0.locationSize;t0++)F(Q0.location+t0);J.bindBuffer(J.ARRAY_BUFFER,X8);for(let t0=0;t0<Q0.locationSize;t0++)R(Q0.location+t0,Y0/Q0.locationSize,o,_0,S0*W0,(r0+Y0/Q0.locationSize*t0)*W0,z0)}else{if(U0.isInstancedBufferAttribute){for(let V0=0;V0<Q0.locationSize;V0++)O(Q0.location+V0,U0.meshPerAttribute);if(_.isInstancedMesh!==!0&&f._maxInstanceCount===void 0)f._maxInstanceCount=U0.meshPerAttribute*U0.count}else for(let V0=0;V0<Q0.locationSize;V0++)F(Q0.location+V0);J.bindBuffer(J.ARRAY_BUFFER,X8);for(let V0=0;V0<Q0.locationSize;V0++)R(Q0.location+V0,Y0/Q0.locationSize,o,_0,Y0*W0,Y0/Q0.locationSize*V0*W0,z0)}}else if(m!==void 0){let _0=m[J0];if(_0!==void 0)switch(_0.length){case 2:J.vertexAttrib2fv(Q0.location,_0);break;case 3:J.vertexAttrib3fv(Q0.location,_0);break;case 4:J.vertexAttrib4fv(Q0.location,_0);break;default:J.vertexAttrib1fv(Q0.location,_0)}}}}G()}function y(){E();for(let _ in Z){let p=Z[_];for(let n in p){let f=p[n];for(let i in f){let d=f[i];for(let m in d)Y(d[m].object),delete d[m];delete f[i]}}delete Z[_]}}function C(_){if(Z[_.id]===void 0)return;let p=Z[_.id];for(let n in p){let f=p[n];for(let i in f){let d=f[i];for(let m in d)Y(d[m].object),delete d[m];delete f[i]}}delete Z[_.id]}function j(_){for(let p in Z){let n=Z[p];for(let f in n){let i=n[f];if(i[_.id]===void 0)continue;let d=i[_.id];for(let m in d)Y(d[m].object),delete d[m];delete i[_.id]}}}function M(_){for(let p in Z){let n=Z[p],f=_.isInstancedMesh===!0?_.id:0,i=n[f];if(i===void 0)continue;for(let d in i){let m=i[d];for(let J0 in m)Y(m[J0].object),delete m[J0];delete i[d]}if(delete n[f],Object.keys(n).length===0)delete Z[p]}}function E(){if(u(),X=!0,W===K)return;W=K,N(W.object)}function u(){K.geometry=null,K.program=null,K.wireframe=!1}return{setup:H,reset:E,resetDefaultState:u,dispose:y,releaseStatesOfGeometry:C,releaseStatesOfObject:M,releaseStatesOfProgram:j,initAttributes:w,enableAttribute:F,disableUnusedAttributes:G}}function d2(J,Q,$){let Z;function K(N){Z=N}function W(N,Y){J.drawArrays(Z,N,Y),$.update(Y,Z,1)}function X(N,Y,U){if(U===0)return;J.drawArraysInstanced(Z,N,Y,U),$.update(Y,Z,U)}function H(N,Y,U){if(U===0)return;Q.get("WEBGL_multi_draw").multiDrawArraysWEBGL(Z,N,0,Y,0,U);let z=0;for(let D=0;D<U;D++)z+=Y[D];$.update(z,Z,1)}function q(N,Y,U,V){if(U===0)return;let z=Q.get("WEBGL_multi_draw");if(z===null)for(let D=0;D<N.length;D++)X(N[D],Y[D],V[D]);else{z.multiDrawArraysInstancedWEBGL(Z,N,0,Y,0,V,0,U);let D=0;for(let w=0;w<U;w++)D+=Y[w]*V[w];$.update(D,Z,1)}}this.setMode=K,this.render=W,this.renderInstances=X,this.renderMultiDraw=H,this.renderMultiDrawInstances=q}function l2(J,Q,$,Z){let K;function W(){if(K!==void 0)return K;if(Q.has("EXT_texture_filter_anisotropic")===!0){let j=Q.get("EXT_texture_filter_anisotropic");K=J.getParameter(j.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else K=0;return K}function X(j){if(j!==Q7&&Z.convert(j)!==J.getParameter(J.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function H(j){let M=j===I7&&(Q.has("EXT_color_buffer_half_float")||Q.has("EXT_color_buffer_float"));if(j!==c6&&Z.convert(j)!==J.getParameter(J.IMPLEMENTATION_COLOR_READ_TYPE)&&j!==w7&&!M)return!1;return!0}function q(j){if(j==="highp"){if(J.getShaderPrecisionFormat(J.VERTEX_SHADER,J.HIGH_FLOAT).precision>0&&J.getShaderPrecisionFormat(J.FRAGMENT_SHADER,J.HIGH_FLOAT).precision>0)return"highp";j="mediump"}if(j==="mediump"){if(J.getShaderPrecisionFormat(J.VERTEX_SHADER,J.MEDIUM_FLOAT).precision>0&&J.getShaderPrecisionFormat(J.FRAGMENT_SHADER,J.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let N=$.precision!==void 0?$.precision:"highp",Y=q(N);if(Y!==N)b0("WebGLRenderer:",N,"not supported, using",Y,"instead."),N=Y;let U=$.logarithmicDepthBuffer===!0,V=$.reversedDepthBuffer===!0&&Q.has("EXT_clip_control"),z=J.getParameter(J.MAX_TEXTURE_IMAGE_UNITS),D=J.getParameter(J.MAX_VERTEX_TEXTURE_IMAGE_UNITS),w=J.getParameter(J.MAX_TEXTURE_SIZE),F=J.getParameter(J.MAX_CUBE_MAP_TEXTURE_SIZE),O=J.getParameter(J.MAX_VERTEX_ATTRIBS),G=J.getParameter(J.MAX_VERTEX_UNIFORM_VECTORS),R=J.getParameter(J.MAX_VARYING_VECTORS),B=J.getParameter(J.MAX_FRAGMENT_UNIFORM_VECTORS),y=J.getParameter(J.MAX_SAMPLES),C=J.getParameter(J.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:W,getMaxPrecision:q,textureFormatReadable:X,textureTypeReadable:H,precision:N,logarithmicDepthBuffer:U,reversedDepthBuffer:V,maxTextures:z,maxVertexTextures:D,maxTextureSize:w,maxCubemapSize:F,maxAttributes:O,maxVertexUniforms:G,maxVaryings:R,maxFragmentUniforms:B,maxSamples:y,samples:C}}function c2(J){let Q=this,$=null,Z=0,K=!1,W=!1,X=new k7,H=new x0,q={value:null,needsUpdate:!1};this.uniform=q,this.numPlanes=0,this.numIntersection=0,this.init=function(U,V){let z=U.length!==0||V||Z!==0||K;return K=V,Z=U.length,z},this.beginShadows=function(){W=!0,Y(null)},this.endShadows=function(){W=!1},this.setGlobalState=function(U,V){$=Y(U,V,0)},this.setState=function(U,V,z){let{clippingPlanes:D,clipIntersection:w,clipShadows:F}=U,O=J.get(U);if(!K||D===null||D.length===0||W&&!F)if(W)Y(null);else N();else{let G=W?0:Z,R=G*4,B=O.clippingState||null;q.value=B,B=Y(D,V,R,z);for(let y=0;y!==R;++y)B[y]=$[y];O.clippingState=B,this.numIntersection=w?this.numPlanes:0,this.numPlanes+=G}};function N(){if(q.value!==$)q.value=$,q.needsUpdate=Z>0;Q.numPlanes=Z,Q.numIntersection=0}function Y(U,V,z,D){let w=U!==null?U.length:0,F=null;if(w!==0){if(F=q.value,D!==!0||F===null){let O=z+w*4,G=V.matrixWorldInverse;if(H.getNormalMatrix(G),F===null||F.length<O)F=new Float32Array(O);for(let R=0,B=z;R!==w;++R,B+=4)X.copy(U[R]).applyMatrix4(G,H),X.normal.toArray(F,B),F[B+3]=X.constant}q.value=F,q.needsUpdate=!0}return Q.numPlanes=w,Q.numIntersection=0,F}}var c7=4,vz=[0.125,0.215,0.35,0.446,0.526,0.582],GJ=20,u2=256,BQ=new ZK,fz=new l0,BH=null,RH=0,AH=0,CH=!1,s2=new g;class PH{constructor(J){this._renderer=J,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(J,Q=0,$=0.1,Z=100,K={}){let{size:W=256,position:X=s2}=K;BH=this._renderer.getRenderTarget(),RH=this._renderer.getActiveCubeFace(),AH=this._renderer.getActiveMipmapLevel(),CH=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(W);let H=this._allocateTargets();if(H.depthBuffer=!0,this._sceneToCubeUV(J,$,Z,H,X),Q>0)this._blur(H,0,0,Q);return this._applyPMREM(H),this._cleanup(H),H}fromEquirectangular(J,Q=null){return this._fromTexture(J,Q)}fromCubemap(J,Q=null){return this._fromTexture(J,Q)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=gz(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=xz(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._dispose(),this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._backgroundBox!==null)this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose()}_setSize(J){this._lodMax=Math.floor(Math.log2(J)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._pingPongRenderTarget!==null)this._pingPongRenderTarget.dispose();for(let J=0;J<this._lodMeshes.length;J++)this._lodMeshes[J].geometry.dispose()}_cleanup(J){this._renderer.setRenderTarget(BH,RH,AH),this._renderer.xr.enabled=CH,J.scissorTest=!1,w9(J,0,0,J.width,J.height)}_fromTexture(J,Q){if(J.mapping===F9||J.mapping===NJ)this._setSize(J.image.length===0?16:J.image[0].width||J.image[0].image.width);else this._setSize(J.image.width/4);BH=this._renderer.getRenderTarget(),RH=this._renderer.getActiveCubeFace(),AH=this._renderer.getActiveMipmapLevel(),CH=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let $=Q||this._allocateTargets();return this._textureToCubeUV(J,$),this._applyPMREM($),this._cleanup($),$}_allocateTargets(){let J=3*Math.max(this._cubeSize,112),Q=4*this._cubeSize,$={magFilter:U6,minFilter:U6,generateMipmaps:!1,type:I7,format:Q7,colorSpace:zQ,depthBuffer:!1},Z=hz(J,Q,$);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==J||this._pingPongRenderTarget.height!==Q){if(this._pingPongRenderTarget!==null)this._dispose();this._pingPongRenderTarget=hz(J,Q,$);let{_lodMax:K}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=n2(K)),this._blurMaterial=o2(K,J,Q),this._ggxMaterial=i2(K,J,Q)}return Z}_compileMaterial(J){let Q=new u6(new I6,J);this._renderer.compile(Q,BQ)}_sceneToCubeUV(J,Q,$,Z,K){let H=new t8(90,1,Q,$),q=[1,-1,1,1,1,1],N=[1,1,1,-1,-1,-1],Y=this._renderer,U=Y.autoClear,V=Y.toneMapping;if(Y.getClearColor(fz),Y.toneMapping=l6,Y.autoClear=!1,Y.state.buffers.depth.getReversed())Y.setRenderTarget(Z),Y.clearDepth(),Y.setRenderTarget(null);if(this._backgroundBox===null)this._backgroundBox=new u6(new M9,new oZ({name:"PMREM.Background",side:Y6,depthWrite:!1,depthTest:!1}));let D=this._backgroundBox,w=D.material,F=!1,O=J.background;if(O){if(O.isColor)w.color.copy(O),J.background=null,F=!0}else w.color.copy(fz),F=!0;for(let G=0;G<6;G++){let R=G%3;if(R===0)H.up.set(0,q[G],0),H.position.set(K.x,K.y,K.z),H.lookAt(K.x+N[G],K.y,K.z);else if(R===1)H.up.set(0,0,q[G]),H.position.set(K.x,K.y,K.z),H.lookAt(K.x,K.y+N[G],K.z);else H.up.set(0,q[G],0),H.position.set(K.x,K.y,K.z),H.lookAt(K.x,K.y,K.z+N[G]);let B=this._cubeSize;if(w9(Z,R*B,G>2?B:0,B,B),Y.setRenderTarget(Z),F)Y.render(D,H);Y.render(J,H)}Y.toneMapping=V,Y.autoClear=U,J.background=O}_textureToCubeUV(J,Q){let $=this._renderer,Z=J.mapping===F9||J.mapping===NJ;if(Z){if(this._cubemapMaterial===null)this._cubemapMaterial=gz();this._cubemapMaterial.uniforms.flipEnvMap.value=J.isRenderTargetTexture===!1?-1:1}else if(this._equirectMaterial===null)this._equirectMaterial=xz();let K=Z?this._cubemapMaterial:this._equirectMaterial,W=this._lodMeshes[0];W.material=K;let X=K.uniforms;X.envMap.value=J;let H=this._cubeSize;w9(Q,0,0,3*H,2*H),$.setRenderTarget(Q),$.render(W,BQ)}_applyPMREM(J){let Q=this._renderer,$=Q.autoClear;Q.autoClear=!1;let Z=this._lodMeshes.length;for(let K=1;K<Z;K++)this._applyGGXFilter(J,K-1,K);Q.autoClear=$}_applyGGXFilter(J,Q,$){let Z=this._renderer,K=this._pingPongRenderTarget,W=this._ggxMaterial,X=this._lodMeshes[$];X.material=W;let H=W.uniforms,q=$/(this._lodMeshes.length-1),N=Q/(this._lodMeshes.length-1),Y=Math.sqrt(q*q-N*N),U=0+q*1.25,V=Y*U,{_lodMax:z}=this,D=this._sizeLods[$],w=3*D*($>z-c7?$-z+c7:0),F=4*(this._cubeSize-D);H.envMap.value=J.texture,H.roughness.value=V,H.mipInt.value=z-Q,w9(K,w,F,3*D,2*D),Z.setRenderTarget(K),Z.render(X,BQ),H.envMap.value=K.texture,H.roughness.value=0,H.mipInt.value=z-$,w9(J,w,F,3*D,2*D),Z.setRenderTarget(J),Z.render(X,BQ)}_blur(J,Q,$,Z,K){let W=this._pingPongRenderTarget;this._halfBlur(J,W,Q,$,Z,"latitudinal",K),this._halfBlur(W,J,$,$,Z,"longitudinal",K)}_halfBlur(J,Q,$,Z,K,W,X){let H=this._renderer,q=this._blurMaterial;if(W!=="latitudinal"&&W!=="longitudinal")y0("blur direction must be either latitudinal or longitudinal!");let N=3,Y=this._lodMeshes[Z];Y.material=q;let U=q.uniforms,V=this._sizeLods[$]-1,z=isFinite(K)?Math.PI/(2*V):2*Math.PI/(2*GJ-1),D=K/z,w=isFinite(K)?1+Math.floor(N*D):GJ;if(w>GJ)b0(`sigmaRadians, ${K}, is too large and will clip, as it requested ${w} samples when the maximum is set to ${GJ}`);let F=[],O=0;for(let C=0;C<GJ;++C){let j=C/D,M=Math.exp(-j*j/2);if(F.push(M),C===0)O+=M;else if(C<w)O+=2*M}for(let C=0;C<F.length;C++)F[C]=F[C]/O;if(U.envMap.value=J.texture,U.samples.value=w,U.weights.value=F,U.latitudinal.value=W==="latitudinal",X)U.poleAxis.value=X;let{_lodMax:G}=this;U.dTheta.value=z,U.mipInt.value=G-$;let R=this._sizeLods[Z],B=3*R*(Z>G-c7?Z-G+c7:0),y=4*(this._cubeSize-R);w9(Q,B,y,3*R,2*R),H.setRenderTarget(Q),H.render(Y,BQ)}}function n2(J){let Q=[],$=[],Z=[],K=J,W=J-c7+1+vz.length;for(let X=0;X<W;X++){let H=Math.pow(2,K);Q.push(H);let q=1/H;if(X>J-c7)q=vz[X-J+c7-1];else if(X===0)q=0;$.push(q);let N=1/(H-2),Y=-N,U=1+N,V=[Y,Y,U,Y,U,U,Y,Y,U,U,Y,U],z=6,D=6,w=3,F=2,O=1,G=new Float32Array(w*D*z),R=new Float32Array(F*D*z),B=new Float32Array(O*D*z);for(let C=0;C<z;C++){let j=C%3*2/3-1,M=C>2?0:-1,E=[j,M,0,j+0.6666666666666666,M,0,j+0.6666666666666666,M+1,0,j,M,0,j+0.6666666666666666,M+1,0,j,M+1,0];G.set(E,w*D*C),R.set(V,F*D*C);let u=[C,C,C,C,C,C];B.set(u,O*D*C)}let y=new I6;if(y.setAttribute("position",new K6(G,w)),y.setAttribute("uv",new K6(R,F)),y.setAttribute("faceIndex",new K6(B,O)),Z.push(new u6(y,null)),K>c7)K--}return{lodMeshes:Z,sizeLods:Q,sigmas:$}}function hz(J,Q,$){let Z=new j6(J,Q,$);return Z.texture.mapping=VQ,Z.texture.name="PMREM.cubeUv",Z.scissorTest=!0,Z}function w9(J,Q,$,Z,K){J.viewport.set(Q,$,Z,K),J.scissor.set(Q,$,Z,K)}function i2(J,Q,$){return new S6({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:u2,CUBEUV_TEXEL_WIDTH:1/Q,CUBEUV_TEXEL_HEIGHT:1/$,CUBEUV_MAX_MIP:`${J}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:HK(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:J7,depthTest:!1,depthWrite:!1})}function o2(J,Q,$){let Z=new Float32Array(GJ),K=new g(0,1,0);return new S6({name:"SphericalGaussianBlur",defines:{n:GJ,CUBEUV_TEXEL_WIDTH:1/Q,CUBEUV_TEXEL_HEIGHT:1/$,CUBEUV_MAX_MIP:`${J}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:Z},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:K}},vertexShader:HK(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:J7,depthTest:!1,depthWrite:!1})}function xz(){return new S6({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:HK(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:J7,depthTest:!1,depthWrite:!1})}function gz(){return new S6({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:HK(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:J7,depthTest:!1,depthWrite:!1})}function HK(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class TH extends j6{constructor(J=1,Q={}){super(J,J,Q);this.isWebGLCubeRenderTarget=!0;let $={width:J,height:J,depth:1},Z=[$,$,$,$,$,$];this.texture=new rZ(Z),this._setTextureOptions(Q),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(J,Q){this.texture.type=Q.type,this.texture.colorSpace=Q.colorSpace,this.texture.generateMipmaps=Q.generateMipmaps,this.texture.minFilter=Q.minFilter,this.texture.magFilter=Q.magFilter;let $={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},Z=new M9(5,5,5),K=new S6({name:"CubemapFromEquirect",uniforms:DJ($.uniforms),vertexShader:$.vertexShader,fragmentShader:$.fragmentShader,side:Y6,blending:J7});K.uniforms.tEquirect.value=Q;let W=new u6(Z,K),X=Q.minFilter;if(Q.minFilter===YJ)Q.minFilter=U6;return new MH(1,10,this).update(J,W),Q.minFilter=X,W.geometry.dispose(),W.material.dispose(),this}clear(J,Q=!0,$=!0,Z=!0){let K=J.getRenderTarget();for(let W=0;W<6;W++)J.setRenderTarget(this,W),J.clear(Q,$,Z);J.setRenderTarget(K)}}function a2(J){let Q=new WeakMap,$=new WeakMap,Z=null;function K(V,z=!1){if(V===null||V===void 0)return null;if(z)return X(V);return W(V)}function W(V){if(V&&V.isTexture){let z=V.mapping;if(z===yZ||z===bZ)if(Q.has(V)){let D=Q.get(V).texture;return H(D,V.mapping)}else{let D=V.image;if(D&&D.height>0){let w=new TH(D.height);return w.fromEquirectangularTexture(J,V),Q.set(V,w),V.addEventListener("dispose",N),H(w.texture,V.mapping)}else return null}}return V}function X(V){if(V&&V.isTexture){let z=V.mapping,D=z===yZ||z===bZ,w=z===F9||z===NJ;if(D||w){let F=$.get(V),O=F!==void 0?F.texture.pmremVersion:0;if(V.isRenderTargetTexture&&V.pmremVersion!==O){if(Z===null)Z=new PH(J);return F=D?Z.fromEquirectangular(V,F):Z.fromCubemap(V,F),F.texture.pmremVersion=V.pmremVersion,$.set(V,F),F.texture}else if(F!==void 0)return F.texture;else{let G=V.image;if(D&&G&&G.height>0||w&&G&&q(G)){if(Z===null)Z=new PH(J);return F=D?Z.fromEquirectangular(V):Z.fromCubemap(V),F.texture.pmremVersion=V.pmremVersion,$.set(V,F),V.addEventListener("dispose",Y),F.texture}else return null}}}return V}function H(V,z){if(z===yZ)V.mapping=F9;else if(z===bZ)V.mapping=NJ;return V}function q(V){let z=0,D=6;for(let w=0;w<D;w++)if(V[w]!==void 0)z++;return z===D}function N(V){let z=V.target;z.removeEventListener("dispose",N);let D=Q.get(z);if(D!==void 0)Q.delete(z),D.dispose()}function Y(V){let z=V.target;z.removeEventListener("dispose",Y);let D=$.get(z);if(D!==void 0)$.delete(z),D.dispose()}function U(){if(Q=new WeakMap,$=new WeakMap,Z!==null)Z.dispose(),Z=null}return{get:K,dispose:U}}function r2(J){let Q={};function $(Z){if(Q[Z]!==void 0)return Q[Z];let K=J.getExtension(Z);return Q[Z]=K,K}return{has:function(Z){return $(Z)!==null},init:function(){$("EXT_color_buffer_float"),$("WEBGL_clip_cull_distance"),$("OES_texture_float_linear"),$("EXT_color_buffer_half_float"),$("WEBGL_multisampled_render_to_texture"),$("WEBGL_render_shared_exponent")},get:function(Z){let K=$(Z);if(K===null)NQ("WebGLRenderer: "+Z+" extension not supported.");return K}}}function t2(J,Q,$,Z){let K={},W=new WeakMap;function X(U){let V=U.target;if(V.index!==null)Q.remove(V.index);for(let D in V.attributes)Q.remove(V.attributes[D]);V.removeEventListener("dispose",X),delete K[V.id];let z=W.get(V);if(z)Q.remove(z),W.delete(V);if(Z.releaseStatesOfGeometry(V),V.isInstancedBufferGeometry===!0)delete V._maxInstanceCount;$.memory.geometries--}function H(U,V){if(K[V.id]===!0)return V;return V.addEventListener("dispose",X),K[V.id]=!0,$.memory.geometries++,V}function q(U){let V=U.attributes;for(let z in V)Q.update(V[z],J.ARRAY_BUFFER)}function N(U){let V=[],z=U.index,D=U.attributes.position,w=0;if(D===void 0)return;if(z!==null){let G=z.array;w=z.version;for(let R=0,B=G.length;R<B;R+=3){let y=G[R+0],C=G[R+1],j=G[R+2];V.push(y,C,C,j,j,y)}}else{let G=D.array;w=D.version;for(let R=0,B=G.length/3-1;R<B;R+=3){let y=R+0,C=R+1,j=R+2;V.push(y,C,C,j,j,y)}}let F=new(D.count>=65535?nZ:sZ)(V,1);F.version=w;let O=W.get(U);if(O)Q.remove(O);W.set(U,F)}function Y(U){let V=W.get(U);if(V){let z=U.index;if(z!==null){if(V.version<z.version)N(U)}}else N(U);return W.get(U)}return{get:H,update:q,getWireframeAttribute:Y}}function e2(J,Q,$){let Z;function K(V){Z=V}let W,X;function H(V){W=V.type,X=V.bytesPerElement}function q(V,z){J.drawElements(Z,z,W,V*X),$.update(z,Z,1)}function N(V,z,D){if(D===0)return;J.drawElementsInstanced(Z,z,W,V*X,D),$.update(z,Z,D)}function Y(V,z,D){if(D===0)return;Q.get("WEBGL_multi_draw").multiDrawElementsWEBGL(Z,z,0,W,V,0,D);let F=0;for(let O=0;O<D;O++)F+=z[O];$.update(F,Z,1)}function U(V,z,D,w){if(D===0)return;let F=Q.get("WEBGL_multi_draw");if(F===null)for(let O=0;O<V.length;O++)N(V[O]/X,z[O],w[O]);else{F.multiDrawElementsInstancedWEBGL(Z,z,0,W,V,0,w,0,D);let O=0;for(let G=0;G<D;G++)O+=z[G]*w[G];$.update(O,Z,1)}}this.setMode=K,this.setIndex=H,this.render=q,this.renderInstances=N,this.renderMultiDraw=Y,this.renderMultiDrawInstances=U}function JL(J){let Q={geometries:0,textures:0},$={frame:0,calls:0,triangles:0,points:0,lines:0};function Z(W,X,H){switch($.calls++,X){case J.TRIANGLES:$.triangles+=H*(W/3);break;case J.LINES:$.lines+=H*(W/2);break;case J.LINE_STRIP:$.lines+=H*(W-1);break;case J.LINE_LOOP:$.lines+=H*W;break;case J.POINTS:$.points+=H*W;break;default:y0("WebGLInfo: Unknown draw mode:",X);break}}function K(){$.calls=0,$.triangles=0,$.points=0,$.lines=0}return{memory:Q,render:$,programs:null,autoReset:!0,reset:K,update:Z}}function QL(J,Q,$){let Z=new WeakMap,K=new A8;function W(X,H,q){let N=X.morphTargetInfluences,Y=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,U=Y!==void 0?Y.length:0,V=Z.get(H);if(V===void 0||V.count!==U){let E=function(){j.dispose(),Z.delete(H),H.removeEventListener("dispose",E)};if(V!==void 0)V.texture.dispose();let z=H.morphAttributes.position!==void 0,D=H.morphAttributes.normal!==void 0,w=H.morphAttributes.color!==void 0,F=H.morphAttributes.position||[],O=H.morphAttributes.normal||[],G=H.morphAttributes.color||[],R=0;if(z===!0)R=1;if(D===!0)R=2;if(w===!0)R=3;let B=H.attributes.position.count*R,y=1;if(B>Q.maxTextureSize)y=Math.ceil(B/Q.maxTextureSize),B=Q.maxTextureSize;let C=new Float32Array(B*y*4*U),j=new lZ(C,B,y,U);j.type=w7,j.needsUpdate=!0;let M=R*4;for(let u=0;u<U;u++){let _=F[u],p=O[u],n=G[u],f=B*y*4*u;for(let i=0;i<_.count;i++){let d=i*M;if(z===!0)K.fromBufferAttribute(_,i),C[f+d+0]=K.x,C[f+d+1]=K.y,C[f+d+2]=K.z,C[f+d+3]=0;if(D===!0)K.fromBufferAttribute(p,i),C[f+d+4]=K.x,C[f+d+5]=K.y,C[f+d+6]=K.z,C[f+d+7]=0;if(w===!0)K.fromBufferAttribute(n,i),C[f+d+8]=K.x,C[f+d+9]=K.y,C[f+d+10]=K.z,C[f+d+11]=n.itemSize===4?K.w:1}}V={count:U,texture:j,size:new Z8(B,y)},Z.set(H,V),H.addEventListener("dispose",E)}if(X.isInstancedMesh===!0&&X.morphTexture!==null)q.getUniforms().setValue(J,"morphTexture",X.morphTexture,$);else{let z=0;for(let w=0;w<N.length;w++)z+=N[w];let D=H.morphTargetsRelative?1:1-z;q.getUniforms().setValue(J,"morphTargetBaseInfluence",D),q.getUniforms().setValue(J,"morphTargetInfluences",N)}q.getUniforms().setValue(J,"morphTargetsTexture",V.texture,$),q.getUniforms().setValue(J,"morphTargetsTextureSize",V.size)}return{update:W}}function $L(J,Q,$,Z,K){let W=new WeakMap;function X(N){let Y=K.render.frame,U=N.geometry,V=Q.get(N,U);if(W.get(V)!==Y)Q.update(V),W.set(V,Y);if(N.isInstancedMesh){if(N.hasEventListener("dispose",q)===!1)N.addEventListener("dispose",q);if(W.get(N)!==Y){if($.update(N.instanceMatrix,J.ARRAY_BUFFER),N.instanceColor!==null)$.update(N.instanceColor,J.ARRAY_BUFFER);W.set(N,Y)}}if(N.isSkinnedMesh){let z=N.skeleton;if(W.get(z)!==Y)z.update(),W.set(z,Y)}return V}function H(){W=new WeakMap}function q(N){let Y=N.target;if(Y.removeEventListener("dispose",q),Z.releaseStatesOfObject(Y),$.remove(Y.instanceMatrix),Y.instanceColor!==null)$.remove(Y.instanceColor)}return{update:X,dispose:H}}var ZL={[KX]:"LINEAR_TONE_MAPPING",[WX]:"REINHARD_TONE_MAPPING",[XX]:"CINEON_TONE_MAPPING",[HX]:"ACES_FILMIC_TONE_MAPPING",[NX]:"AGX_TONE_MAPPING",[YX]:"NEUTRAL_TONE_MAPPING",[qX]:"CUSTOM_TONE_MAPPING"};function KL(J,Q,$,Z,K){let W=new j6(Q,$,{type:J,depthBuffer:Z,stencilBuffer:K}),X=new j6(Q,$,{type:I7,depthBuffer:!1,stencilBuffer:!1}),H=new I6;H.setAttribute("position",new d6([-1,3,0,-1,-1,0,3,-1,0],3)),H.setAttribute("uv",new d6([0,2,0,0,2,0],2));let q=new WH({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),N=new u6(H,q),Y=new ZK(-1,1,1,-1,0,1),U=null,V=null,z=!1,D,w=null,F=[],O=!1;this.setSize=function(G,R){W.setSize(G,R),X.setSize(G,R);for(let B=0;B<F.length;B++){let y=F[B];if(y.setSize)y.setSize(G,R)}},this.setEffects=function(G){F=G,O=F.length>0&&F[0].isRenderPass===!0;let{width:R,height:B}=W;for(let y=0;y<F.length;y++){let C=F[y];if(C.setSize)C.setSize(R,B)}},this.begin=function(G,R){if(z)return!1;if(G.toneMapping===l6&&F.length===0)return!1;if(w=R,R!==null){let{width:B,height:y}=R;if(W.width!==B||W.height!==y)this.setSize(B,y)}if(O===!1)G.setRenderTarget(W);return D=G.toneMapping,G.toneMapping=l6,!0},this.hasRenderPass=function(){return O},this.end=function(G,R){G.toneMapping=D,z=!0;let B=W,y=X;for(let C=0;C<F.length;C++){let j=F[C];if(j.enabled===!1)continue;if(j.render(G,y,B,R),j.needsSwap!==!1){let M=B;B=y,y=M}}if(U!==G.outputColorSpace||V!==G.toneMapping){if(U=G.outputColorSpace,V=G.toneMapping,q.defines={},a0.getTransfer(U)===z8)q.defines.SRGB_TRANSFER="";let C=ZL[V];if(C)q.defines[C]="";q.needsUpdate=!0}q.uniforms.tDiffuse.value=B.texture,G.setRenderTarget(w),G.render(N,Y),w=null,z=!1},this.isCompositing=function(){return z},this.dispose=function(){W.dispose(),X.dispose(),H.dispose(),q.dispose()}}var KD=new e8,jH=new zJ(1,1),WD=new lZ,XD=new QH,HD=new rZ,pz=[],mz=[],dz=new Float32Array(16),lz=new Float32Array(9),cz=new Float32Array(4);function I9(J,Q,$){let Z=J[0];if(Z<=0||Z>0)return J;let K=Q*$,W=pz[K];if(W===void 0)W=new Float32Array(K),pz[K]=W;if(Q!==0){Z.toArray(W,0);for(let X=1,H=0;X!==Q;++X)H+=$,J[X].toArray(W,H)}return W}function b8(J,Q){if(J.length!==Q.length)return!1;for(let $=0,Z=J.length;$<Z;$++)if(J[$]!==Q[$])return!1;return!0}function v8(J,Q){for(let $=0,Z=Q.length;$<Z;$++)J[$]=Q[$]}function qK(J,Q){let $=mz[Q];if($===void 0)$=new Int32Array(Q),mz[Q]=$;for(let Z=0;Z!==Q;++Z)$[Z]=J.allocateTextureUnit();return $}function WL(J,Q){let $=this.cache;if($[0]===Q)return;J.uniform1f(this.addr,Q),$[0]=Q}function XL(J,Q){let $=this.cache;if(Q.x!==void 0){if($[0]!==Q.x||$[1]!==Q.y)J.uniform2f(this.addr,Q.x,Q.y),$[0]=Q.x,$[1]=Q.y}else{if(b8($,Q))return;J.uniform2fv(this.addr,Q),v8($,Q)}}function HL(J,Q){let $=this.cache;if(Q.x!==void 0){if($[0]!==Q.x||$[1]!==Q.y||$[2]!==Q.z)J.uniform3f(this.addr,Q.x,Q.y,Q.z),$[0]=Q.x,$[1]=Q.y,$[2]=Q.z}else if(Q.r!==void 0){if($[0]!==Q.r||$[1]!==Q.g||$[2]!==Q.b)J.uniform3f(this.addr,Q.r,Q.g,Q.b),$[0]=Q.r,$[1]=Q.g,$[2]=Q.b}else{if(b8($,Q))return;J.uniform3fv(this.addr,Q),v8($,Q)}}function qL(J,Q){let $=this.cache;if(Q.x!==void 0){if($[0]!==Q.x||$[1]!==Q.y||$[2]!==Q.z||$[3]!==Q.w)J.uniform4f(this.addr,Q.x,Q.y,Q.z,Q.w),$[0]=Q.x,$[1]=Q.y,$[2]=Q.z,$[3]=Q.w}else{if(b8($,Q))return;J.uniform4fv(this.addr,Q),v8($,Q)}}function NL(J,Q){let $=this.cache,Z=Q.elements;if(Z===void 0){if(b8($,Q))return;J.uniformMatrix2fv(this.addr,!1,Q),v8($,Q)}else{if(b8($,Z))return;cz.set(Z),J.uniformMatrix2fv(this.addr,!1,cz),v8($,Z)}}function YL(J,Q){let $=this.cache,Z=Q.elements;if(Z===void 0){if(b8($,Q))return;J.uniformMatrix3fv(this.addr,!1,Q),v8($,Q)}else{if(b8($,Z))return;lz.set(Z),J.uniformMatrix3fv(this.addr,!1,lz),v8($,Z)}}function UL(J,Q){let $=this.cache,Z=Q.elements;if(Z===void 0){if(b8($,Q))return;J.uniformMatrix4fv(this.addr,!1,Q),v8($,Q)}else{if(b8($,Z))return;dz.set(Z),J.uniformMatrix4fv(this.addr,!1,dz),v8($,Z)}}function VL(J,Q){let $=this.cache;if($[0]===Q)return;J.uniform1i(this.addr,Q),$[0]=Q}function OL(J,Q){let $=this.cache;if(Q.x!==void 0){if($[0]!==Q.x||$[1]!==Q.y)J.uniform2i(this.addr,Q.x,Q.y),$[0]=Q.x,$[1]=Q.y}else{if(b8($,Q))return;J.uniform2iv(this.addr,Q),v8($,Q)}}function FL(J,Q){let $=this.cache;if(Q.x!==void 0){if($[0]!==Q.x||$[1]!==Q.y||$[2]!==Q.z)J.uniform3i(this.addr,Q.x,Q.y,Q.z),$[0]=Q.x,$[1]=Q.y,$[2]=Q.z}else{if(b8($,Q))return;J.uniform3iv(this.addr,Q),v8($,Q)}}function zL(J,Q){let $=this.cache;if(Q.x!==void 0){if($[0]!==Q.x||$[1]!==Q.y||$[2]!==Q.z||$[3]!==Q.w)J.uniform4i(this.addr,Q.x,Q.y,Q.z,Q.w),$[0]=Q.x,$[1]=Q.y,$[2]=Q.z,$[3]=Q.w}else{if(b8($,Q))return;J.uniform4iv(this.addr,Q),v8($,Q)}}function DL(J,Q){let $=this.cache;if($[0]===Q)return;J.uniform1ui(this.addr,Q),$[0]=Q}function kL(J,Q){let $=this.cache;if(Q.x!==void 0){if($[0]!==Q.x||$[1]!==Q.y)J.uniform2ui(this.addr,Q.x,Q.y),$[0]=Q.x,$[1]=Q.y}else{if(b8($,Q))return;J.uniform2uiv(this.addr,Q),v8($,Q)}}function ML(J,Q){let $=this.cache;if(Q.x!==void 0){if($[0]!==Q.x||$[1]!==Q.y||$[2]!==Q.z)J.uniform3ui(this.addr,Q.x,Q.y,Q.z),$[0]=Q.x,$[1]=Q.y,$[2]=Q.z}else{if(b8($,Q))return;J.uniform3uiv(this.addr,Q),v8($,Q)}}function wL(J,Q){let $=this.cache;if(Q.x!==void 0){if($[0]!==Q.x||$[1]!==Q.y||$[2]!==Q.z||$[3]!==Q.w)J.uniform4ui(this.addr,Q.x,Q.y,Q.z,Q.w),$[0]=Q.x,$[1]=Q.y,$[2]=Q.z,$[3]=Q.w}else{if(b8($,Q))return;J.uniform4uiv(this.addr,Q),v8($,Q)}}function IL(J,Q,$){let Z=this.cache,K=$.allocateTextureUnit();if(Z[0]!==K)J.uniform1i(this.addr,K),Z[0]=K;let W;if(this.type===J.SAMPLER_2D_SHADOW)jH.compareFunction=$.isReversedDepthBuffer()?dZ:mZ,W=jH;else W=KD;$.setTexture2D(Q||W,K)}function LL(J,Q,$){let Z=this.cache,K=$.allocateTextureUnit();if(Z[0]!==K)J.uniform1i(this.addr,K),Z[0]=K;$.setTexture3D(Q||XD,K)}function GL(J,Q,$){let Z=this.cache,K=$.allocateTextureUnit();if(Z[0]!==K)J.uniform1i(this.addr,K),Z[0]=K;$.setTextureCube(Q||HD,K)}function BL(J,Q,$){let Z=this.cache,K=$.allocateTextureUnit();if(Z[0]!==K)J.uniform1i(this.addr,K),Z[0]=K;$.setTexture2DArray(Q||WD,K)}function RL(J){switch(J){case 5126:return WL;case 35664:return XL;case 35665:return HL;case 35666:return qL;case 35674:return NL;case 35675:return YL;case 35676:return UL;case 5124:case 35670:return VL;case 35667:case 35671:return OL;case 35668:case 35672:return FL;case 35669:case 35673:return zL;case 5125:return DL;case 36294:return kL;case 36295:return ML;case 36296:return wL;case 35678:case 36198:case 36298:case 36306:case 35682:return IL;case 35679:case 36299:case 36307:return LL;case 35680:case 36300:case 36308:case 36293:return GL;case 36289:case 36303:case 36311:case 36292:return BL}}function AL(J,Q){J.uniform1fv(this.addr,Q)}function CL(J,Q){let $=I9(Q,this.size,2);J.uniform2fv(this.addr,$)}function _L(J,Q){let $=I9(Q,this.size,3);J.uniform3fv(this.addr,$)}function EL(J,Q){let $=I9(Q,this.size,4);J.uniform4fv(this.addr,$)}function PL(J,Q){let $=I9(Q,this.size,4);J.uniformMatrix2fv(this.addr,!1,$)}function jL(J,Q){let $=I9(Q,this.size,9);J.uniformMatrix3fv(this.addr,!1,$)}function SL(J,Q){let $=I9(Q,this.size,16);J.uniformMatrix4fv(this.addr,!1,$)}function TL(J,Q){J.uniform1iv(this.addr,Q)}function yL(J,Q){J.uniform2iv(this.addr,Q)}function bL(J,Q){J.uniform3iv(this.addr,Q)}function vL(J,Q){J.uniform4iv(this.addr,Q)}function fL(J,Q){J.uniform1uiv(this.addr,Q)}function hL(J,Q){J.uniform2uiv(this.addr,Q)}function xL(J,Q){J.uniform3uiv(this.addr,Q)}function gL(J,Q){J.uniform4uiv(this.addr,Q)}function pL(J,Q,$){let Z=this.cache,K=Q.length,W=qK($,K);if(!b8(Z,W))J.uniform1iv(this.addr,W),v8(Z,W);let X;if(this.type===J.SAMPLER_2D_SHADOW)X=jH;else X=KD;for(let H=0;H!==K;++H)$.setTexture2D(Q[H]||X,W[H])}function mL(J,Q,$){let Z=this.cache,K=Q.length,W=qK($,K);if(!b8(Z,W))J.uniform1iv(this.addr,W),v8(Z,W);for(let X=0;X!==K;++X)$.setTexture3D(Q[X]||XD,W[X])}function dL(J,Q,$){let Z=this.cache,K=Q.length,W=qK($,K);if(!b8(Z,W))J.uniform1iv(this.addr,W),v8(Z,W);for(let X=0;X!==K;++X)$.setTextureCube(Q[X]||HD,W[X])}function lL(J,Q,$){let Z=this.cache,K=Q.length,W=qK($,K);if(!b8(Z,W))J.uniform1iv(this.addr,W),v8(Z,W);for(let X=0;X!==K;++X)$.setTexture2DArray(Q[X]||WD,W[X])}function cL(J){switch(J){case 5126:return AL;case 35664:return CL;case 35665:return _L;case 35666:return EL;case 35674:return PL;case 35675:return jL;case 35676:return SL;case 5124:case 35670:return TL;case 35667:case 35671:return yL;case 35668:case 35672:return bL;case 35669:case 35673:return vL;case 5125:return fL;case 36294:return hL;case 36295:return xL;case 36296:return gL;case 35678:case 36198:case 36298:case 36306:case 35682:return pL;case 35679:case 36299:case 36307:return mL;case 35680:case 36300:case 36308:case 36293:return dL;case 36289:case 36303:case 36311:case 36292:return lL}}class qD{constructor(J,Q,$){this.id=J,this.addr=$,this.cache=[],this.type=Q.type,this.setValue=RL(Q.type)}}class ND{constructor(J,Q,$){this.id=J,this.addr=$,this.cache=[],this.type=Q.type,this.size=Q.size,this.setValue=cL(Q.type)}}class YD{constructor(J){this.id=J,this.seq=[],this.map={}}setValue(J,Q,$){let Z=this.seq;for(let K=0,W=Z.length;K!==W;++K){let X=Z[K];X.setValue(J,Q[X.id],$)}}}var _H=/(\w+)(\])?(\[|\.)?/g;function uz(J,Q){J.seq.push(Q),J.map[Q.id]=Q}function uL(J,Q,$){let Z=J.name,K=Z.length;_H.lastIndex=0;while(!0){let W=_H.exec(Z),X=_H.lastIndex,H=W[1],q=W[2]==="]",N=W[3];if(q)H=H|0;if(N===void 0||N==="["&&X+2===K){uz($,N===void 0?new qD(H,J,Q):new ND(H,J,Q));break}else{let U=$.map[H];if(U===void 0)U=new YD(H),uz($,U);$=U}}}class CQ{constructor(J,Q){this.seq=[],this.map={};let $=J.getProgramParameter(Q,J.ACTIVE_UNIFORMS);for(let W=0;W<$;++W){let X=J.getActiveUniform(Q,W),H=J.getUniformLocation(Q,X.name);uL(X,H,this)}let Z=[],K=[];for(let W of this.seq)if(W.type===J.SAMPLER_2D_SHADOW||W.type===J.SAMPLER_CUBE_SHADOW||W.type===J.SAMPLER_2D_ARRAY_SHADOW)Z.push(W);else K.push(W);if(Z.length>0)this.seq=Z.concat(K)}setValue(J,Q,$,Z){let K=this.map[Q];if(K!==void 0)K.setValue(J,$,Z)}setOptional(J,Q,$){let Z=Q[$];if(Z!==void 0)this.setValue(J,$,Z)}static upload(J,Q,$,Z){for(let K=0,W=Q.length;K!==W;++K){let X=Q[K],H=$[X.id];if(H.needsUpdate!==!1)X.setValue(J,H.value,Z)}}static seqWithValue(J,Q){let $=[];for(let Z=0,K=J.length;Z!==K;++Z){let W=J[Z];if(W.id in Q)$.push(W)}return $}}function sz(J,Q,$){let Z=J.createShader(Q);return J.shaderSource(Z,$),J.compileShader(Z),Z}var sL=37297,nL=0;function iL(J,Q){let $=J.split(`
`),Z=[],K=Math.max(Q-6,0),W=Math.min(Q+6,$.length);for(let X=K;X<W;X++){let H=X+1;Z.push(`${H===Q?">":" "} ${H}: ${$[X]}`)}return Z.join(`
`)}var nz=new x0;function oL(J){a0._getMatrix(nz,a0.workingColorSpace,J);let Q=`mat3( ${nz.elements.map(($)=>$.toFixed(4))} )`;switch(a0.getTransfer(J)){case oX:return[Q,"LinearTransferOETF"];case z8:return[Q,"sRGBTransferOETF"];default:return b0("WebGLProgram: Unsupported color space: ",J),[Q,"LinearTransferOETF"]}}function iz(J,Q,$){let Z=J.getShaderParameter(Q,J.COMPILE_STATUS),W=(J.getShaderInfoLog(Q)||"").trim();if(Z&&W==="")return"";let X=/ERROR: 0:(\d+)/.exec(W);if(X){let H=parseInt(X[1]);return $.toUpperCase()+`

`+W+`

`+iL(J.getShaderSource(Q),H)}else return W}function aL(J,Q){let $=oL(Q);return[`vec4 ${J}( vec4 value ) {`,`	return ${$[1]}( vec4( value.rgb * ${$[0]}, value.a ) );`,"}"].join(`
`)}var rL={[KX]:"Linear",[WX]:"Reinhard",[XX]:"Cineon",[HX]:"ACESFilmic",[NX]:"AgX",[YX]:"Neutral",[qX]:"Custom"};function tL(J,Q){let $=rL[Q];if($===void 0)return b0("WebGLProgram: Unsupported toneMapping:",Q),"vec3 "+J+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+J+"( vec3 color ) { return "+$+"ToneMapping( color ); }"}var XK=new g;function eL(){a0.getLuminanceCoefficients(XK);let J=XK.x.toFixed(4),Q=XK.y.toFixed(4),$=XK.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${J}, ${Q}, ${$} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function JG(J){return[J.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",J.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(AQ).join(`
`)}function QG(J){let Q=[];for(let $ in J){let Z=J[$];if(Z===!1)continue;Q.push("#define "+$+" "+Z)}return Q.join(`
`)}function $G(J,Q){let $={},Z=J.getProgramParameter(Q,J.ACTIVE_ATTRIBUTES);for(let K=0;K<Z;K++){let W=J.getActiveAttrib(Q,K),X=W.name,H=1;if(W.type===J.FLOAT_MAT2)H=2;if(W.type===J.FLOAT_MAT3)H=3;if(W.type===J.FLOAT_MAT4)H=4;$[X]={type:W.type,location:J.getAttribLocation(Q,X),locationSize:H}}return $}function AQ(J){return J!==""}function oz(J,Q){let $=Q.numSpotLightShadows+Q.numSpotLightMaps-Q.numSpotLightShadowsWithMaps;return J.replace(/NUM_DIR_LIGHTS/g,Q.numDirLights).replace(/NUM_SPOT_LIGHTS/g,Q.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,Q.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,$).replace(/NUM_RECT_AREA_LIGHTS/g,Q.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,Q.numPointLights).replace(/NUM_HEMI_LIGHTS/g,Q.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,Q.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,Q.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,Q.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,Q.numPointLightShadows)}function az(J,Q){return J.replace(/NUM_CLIPPING_PLANES/g,Q.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,Q.numClippingPlanes-Q.numClipIntersection)}var ZG=/^[ \t]*#include +<([\w\d./]+)>/gm;function SH(J){return J.replace(ZG,WG)}var KG=new Map;function WG(J,Q){let $=g0[Q];if($===void 0){let Z=KG.get(Q);if(Z!==void 0)$=g0[Z],b0('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',Q,Z);else throw Error("Can not resolve #include <"+Q+">")}return SH($)}var XG=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function rz(J){return J.replace(XG,HG)}function HG(J,Q,$,Z){let K="";for(let W=parseInt(Q);W<parseInt($);W++)K+=Z.replace(/\[\s*i\s*\]/g,"[ "+W+" ]").replace(/UNROLLED_LOOP_INDEX/g,W);return K}function tz(J){let Q=`precision ${J.precision} float;
	precision ${J.precision} int;
	precision ${J.precision} sampler2D;
	precision ${J.precision} samplerCube;
	precision ${J.precision} sampler3D;
	precision ${J.precision} sampler2DArray;
	precision ${J.precision} sampler2DShadow;
	precision ${J.precision} samplerCubeShadow;
	precision ${J.precision} sampler2DArrayShadow;
	precision ${J.precision} isampler2D;
	precision ${J.precision} isampler3D;
	precision ${J.precision} isamplerCube;
	precision ${J.precision} isampler2DArray;
	precision ${J.precision} usampler2D;
	precision ${J.precision} usampler3D;
	precision ${J.precision} usamplerCube;
	precision ${J.precision} usampler2DArray;
	`;if(J.precision==="highp")Q+=`
#define HIGH_PRECISION`;else if(J.precision==="mediump")Q+=`
#define MEDIUM_PRECISION`;else if(J.precision==="lowp")Q+=`
#define LOW_PRECISION`;return Q}var qG={[YQ]:"SHADOWMAP_TYPE_PCF",[U9]:"SHADOWMAP_TYPE_VSM"};function NG(J){return qG[J.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var YG={[F9]:"ENVMAP_TYPE_CUBE",[NJ]:"ENVMAP_TYPE_CUBE",[VQ]:"ENVMAP_TYPE_CUBE_UV"};function UG(J){if(J.envMap===!1)return"ENVMAP_TYPE_CUBE";return YG[J.envMapMode]||"ENVMAP_TYPE_CUBE"}var VG={[NJ]:"ENVMAP_MODE_REFRACTION"};function OG(J){if(J.envMap===!1)return"ENVMAP_MODE_REFLECTION";return VG[J.envMapMode]||"ENVMAP_MODE_REFLECTION"}var FG={[Zz]:"ENVMAP_BLENDING_MULTIPLY",[Kz]:"ENVMAP_BLENDING_MIX",[Wz]:"ENVMAP_BLENDING_ADD"};function zG(J){if(J.envMap===!1)return"ENVMAP_BLENDING_NONE";return FG[J.combine]||"ENVMAP_BLENDING_NONE"}function DG(J){let Q=J.envMapCubeUVHeight;if(Q===null)return null;let $=Math.log2(Q)-2,Z=1/Q;return{texelWidth:1/(3*Math.max(Math.pow(2,$),112)),texelHeight:Z,maxMip:$}}function kG(J,Q,$,Z){let K=J.getContext(),W=$.defines,X=$.vertexShader,H=$.fragmentShader,q=NG($),N=UG($),Y=OG($),U=zG($),V=DG($),z=JG($),D=QG(W),w=K.createProgram(),F,O,G=$.glslVersion?"#version "+$.glslVersion+`
`:"";if($.isRawShaderMaterial){if(F=["#define SHADER_TYPE "+$.shaderType,"#define SHADER_NAME "+$.shaderName,D].filter(AQ).join(`
`),F.length>0)F+=`
`;if(O=["#define SHADER_TYPE "+$.shaderType,"#define SHADER_NAME "+$.shaderName,D].filter(AQ).join(`
`),O.length>0)O+=`
`}else F=[tz($),"#define SHADER_TYPE "+$.shaderType,"#define SHADER_NAME "+$.shaderName,D,$.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",$.batching?"#define USE_BATCHING":"",$.batchingColor?"#define USE_BATCHING_COLOR":"",$.instancing?"#define USE_INSTANCING":"",$.instancingColor?"#define USE_INSTANCING_COLOR":"",$.instancingMorph?"#define USE_INSTANCING_MORPH":"",$.useFog&&$.fog?"#define USE_FOG":"",$.useFog&&$.fogExp2?"#define FOG_EXP2":"",$.map?"#define USE_MAP":"",$.envMap?"#define USE_ENVMAP":"",$.envMap?"#define "+Y:"",$.lightMap?"#define USE_LIGHTMAP":"",$.aoMap?"#define USE_AOMAP":"",$.bumpMap?"#define USE_BUMPMAP":"",$.normalMap?"#define USE_NORMALMAP":"",$.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",$.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",$.displacementMap?"#define USE_DISPLACEMENTMAP":"",$.emissiveMap?"#define USE_EMISSIVEMAP":"",$.anisotropy?"#define USE_ANISOTROPY":"",$.anisotropyMap?"#define USE_ANISOTROPYMAP":"",$.clearcoatMap?"#define USE_CLEARCOATMAP":"",$.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",$.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",$.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",$.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",$.specularMap?"#define USE_SPECULARMAP":"",$.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",$.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",$.roughnessMap?"#define USE_ROUGHNESSMAP":"",$.metalnessMap?"#define USE_METALNESSMAP":"",$.alphaMap?"#define USE_ALPHAMAP":"",$.alphaHash?"#define USE_ALPHAHASH":"",$.transmission?"#define USE_TRANSMISSION":"",$.transmissionMap?"#define USE_TRANSMISSIONMAP":"",$.thicknessMap?"#define USE_THICKNESSMAP":"",$.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",$.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",$.mapUv?"#define MAP_UV "+$.mapUv:"",$.alphaMapUv?"#define ALPHAMAP_UV "+$.alphaMapUv:"",$.lightMapUv?"#define LIGHTMAP_UV "+$.lightMapUv:"",$.aoMapUv?"#define AOMAP_UV "+$.aoMapUv:"",$.emissiveMapUv?"#define EMISSIVEMAP_UV "+$.emissiveMapUv:"",$.bumpMapUv?"#define BUMPMAP_UV "+$.bumpMapUv:"",$.normalMapUv?"#define NORMALMAP_UV "+$.normalMapUv:"",$.displacementMapUv?"#define DISPLACEMENTMAP_UV "+$.displacementMapUv:"",$.metalnessMapUv?"#define METALNESSMAP_UV "+$.metalnessMapUv:"",$.roughnessMapUv?"#define ROUGHNESSMAP_UV "+$.roughnessMapUv:"",$.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+$.anisotropyMapUv:"",$.clearcoatMapUv?"#define CLEARCOATMAP_UV "+$.clearcoatMapUv:"",$.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+$.clearcoatNormalMapUv:"",$.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+$.clearcoatRoughnessMapUv:"",$.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+$.iridescenceMapUv:"",$.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+$.iridescenceThicknessMapUv:"",$.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+$.sheenColorMapUv:"",$.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+$.sheenRoughnessMapUv:"",$.specularMapUv?"#define SPECULARMAP_UV "+$.specularMapUv:"",$.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+$.specularColorMapUv:"",$.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+$.specularIntensityMapUv:"",$.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+$.transmissionMapUv:"",$.thicknessMapUv?"#define THICKNESSMAP_UV "+$.thicknessMapUv:"",$.vertexTangents&&$.flatShading===!1?"#define USE_TANGENT":"",$.vertexColors?"#define USE_COLOR":"",$.vertexAlphas?"#define USE_COLOR_ALPHA":"",$.vertexUv1s?"#define USE_UV1":"",$.vertexUv2s?"#define USE_UV2":"",$.vertexUv3s?"#define USE_UV3":"",$.pointsUvs?"#define USE_POINTS_UV":"",$.flatShading?"#define FLAT_SHADED":"",$.skinning?"#define USE_SKINNING":"",$.morphTargets?"#define USE_MORPHTARGETS":"",$.morphNormals&&$.flatShading===!1?"#define USE_MORPHNORMALS":"",$.morphColors?"#define USE_MORPHCOLORS":"",$.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+$.morphTextureStride:"",$.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+$.morphTargetsCount:"",$.doubleSided?"#define DOUBLE_SIDED":"",$.flipSided?"#define FLIP_SIDED":"",$.shadowMapEnabled?"#define USE_SHADOWMAP":"",$.shadowMapEnabled?"#define "+q:"",$.sizeAttenuation?"#define USE_SIZEATTENUATION":"",$.numLightProbes>0?"#define USE_LIGHT_PROBES":"",$.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",$.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(AQ).join(`
`),O=[tz($),"#define SHADER_TYPE "+$.shaderType,"#define SHADER_NAME "+$.shaderName,D,$.useFog&&$.fog?"#define USE_FOG":"",$.useFog&&$.fogExp2?"#define FOG_EXP2":"",$.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",$.map?"#define USE_MAP":"",$.matcap?"#define USE_MATCAP":"",$.envMap?"#define USE_ENVMAP":"",$.envMap?"#define "+N:"",$.envMap?"#define "+Y:"",$.envMap?"#define "+U:"",V?"#define CUBEUV_TEXEL_WIDTH "+V.texelWidth:"",V?"#define CUBEUV_TEXEL_HEIGHT "+V.texelHeight:"",V?"#define CUBEUV_MAX_MIP "+V.maxMip+".0":"",$.lightMap?"#define USE_LIGHTMAP":"",$.aoMap?"#define USE_AOMAP":"",$.bumpMap?"#define USE_BUMPMAP":"",$.normalMap?"#define USE_NORMALMAP":"",$.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",$.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",$.emissiveMap?"#define USE_EMISSIVEMAP":"",$.anisotropy?"#define USE_ANISOTROPY":"",$.anisotropyMap?"#define USE_ANISOTROPYMAP":"",$.clearcoat?"#define USE_CLEARCOAT":"",$.clearcoatMap?"#define USE_CLEARCOATMAP":"",$.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",$.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",$.dispersion?"#define USE_DISPERSION":"",$.iridescence?"#define USE_IRIDESCENCE":"",$.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",$.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",$.specularMap?"#define USE_SPECULARMAP":"",$.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",$.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",$.roughnessMap?"#define USE_ROUGHNESSMAP":"",$.metalnessMap?"#define USE_METALNESSMAP":"",$.alphaMap?"#define USE_ALPHAMAP":"",$.alphaTest?"#define USE_ALPHATEST":"",$.alphaHash?"#define USE_ALPHAHASH":"",$.sheen?"#define USE_SHEEN":"",$.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",$.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",$.transmission?"#define USE_TRANSMISSION":"",$.transmissionMap?"#define USE_TRANSMISSIONMAP":"",$.thicknessMap?"#define USE_THICKNESSMAP":"",$.vertexTangents&&$.flatShading===!1?"#define USE_TANGENT":"",$.vertexColors||$.instancingColor?"#define USE_COLOR":"",$.vertexAlphas||$.batchingColor?"#define USE_COLOR_ALPHA":"",$.vertexUv1s?"#define USE_UV1":"",$.vertexUv2s?"#define USE_UV2":"",$.vertexUv3s?"#define USE_UV3":"",$.pointsUvs?"#define USE_POINTS_UV":"",$.gradientMap?"#define USE_GRADIENTMAP":"",$.flatShading?"#define FLAT_SHADED":"",$.doubleSided?"#define DOUBLE_SIDED":"",$.flipSided?"#define FLIP_SIDED":"",$.shadowMapEnabled?"#define USE_SHADOWMAP":"",$.shadowMapEnabled?"#define "+q:"",$.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",$.numLightProbes>0?"#define USE_LIGHT_PROBES":"",$.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",$.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",$.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",$.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",$.toneMapping!==l6?"#define TONE_MAPPING":"",$.toneMapping!==l6?g0.tonemapping_pars_fragment:"",$.toneMapping!==l6?tL("toneMapping",$.toneMapping):"",$.dithering?"#define DITHERING":"",$.opaque?"#define OPAQUE":"",g0.colorspace_pars_fragment,aL("linearToOutputTexel",$.outputColorSpace),eL(),$.useDepthPacking?"#define DEPTH_PACKING "+$.depthPacking:"",`
`].filter(AQ).join(`
`);if(X=SH(X),X=oz(X,$),X=az(X,$),H=SH(H),H=oz(H,$),H=az(H,$),X=rz(X),H=rz(H),$.isRawShaderMaterial!==!0)G=`#version 300 es
`,F=[z,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+F,O=["#define varying in",$.glslVersion===aX?"":"layout(location = 0) out highp vec4 pc_fragColor;",$.glslVersion===aX?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+O;let R=G+F+X,B=G+O+H,y=sz(K,K.VERTEX_SHADER,R),C=sz(K,K.FRAGMENT_SHADER,B);if(K.attachShader(w,y),K.attachShader(w,C),$.index0AttributeName!==void 0)K.bindAttribLocation(w,0,$.index0AttributeName);else if($.morphTargets===!0)K.bindAttribLocation(w,0,"position");K.linkProgram(w);function j(_){if(J.debug.checkShaderErrors){let p=K.getProgramInfoLog(w)||"",n=K.getShaderInfoLog(y)||"",f=K.getShaderInfoLog(C)||"",i=p.trim(),d=n.trim(),m=f.trim(),J0=!0,Q0=!0;if(K.getProgramParameter(w,K.LINK_STATUS)===!1)if(J0=!1,typeof J.debug.onShaderError==="function")J.debug.onShaderError(K,w,y,C);else{let U0=iz(K,y,"vertex"),_0=iz(K,C,"fragment");y0("THREE.WebGLProgram: Shader Error "+K.getError()+" - VALIDATE_STATUS "+K.getProgramParameter(w,K.VALIDATE_STATUS)+`

Material Name: `+_.name+`
Material Type: `+_.type+`

Program Info Log: `+i+`
`+U0+`
`+_0)}else if(i!=="")b0("WebGLProgram: Program Info Log:",i);else if(d===""||m==="")Q0=!1;if(Q0)_.diagnostics={runnable:J0,programLog:i,vertexShader:{log:d,prefix:F},fragmentShader:{log:m,prefix:O}}}K.deleteShader(y),K.deleteShader(C),M=new CQ(K,w),E=$G(K,w)}let M;this.getUniforms=function(){if(M===void 0)j(this);return M};let E;this.getAttributes=function(){if(E===void 0)j(this);return E};let u=$.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(u===!1)u=K.getProgramParameter(w,sL);return u},this.destroy=function(){Z.releaseStatesOfProgram(this),K.deleteProgram(w),this.program=void 0},this.type=$.shaderType,this.name=$.shaderName,this.id=nL++,this.cacheKey=Q,this.usedTimes=1,this.program=w,this.vertexShader=y,this.fragmentShader=C,this}var MG=0;class UD{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(J){let{vertexShader:Q,fragmentShader:$}=J,Z=this._getShaderStage(Q),K=this._getShaderStage($),W=this._getShaderCacheForMaterial(J);if(W.has(Z)===!1)W.add(Z),Z.usedTimes++;if(W.has(K)===!1)W.add(K),K.usedTimes++;return this}remove(J){let Q=this.materialCache.get(J);for(let $ of Q)if($.usedTimes--,$.usedTimes===0)this.shaderCache.delete($.code);return this.materialCache.delete(J),this}getVertexShaderID(J){return this._getShaderStage(J.vertexShader).id}getFragmentShaderID(J){return this._getShaderStage(J.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(J){let Q=this.materialCache,$=Q.get(J);if($===void 0)$=new Set,Q.set(J,$);return $}_getShaderStage(J){let Q=this.shaderCache,$=Q.get(J);if($===void 0)$=new VD(J),Q.set(J,$);return $}}class VD{constructor(J){this.id=MG++,this.code=J,this.usedTimes=0}}function wG(J,Q,$,Z,K,W){let X=new cZ,H=new UD,q=new Set,N=[],Y=new Map,U=Z.logarithmicDepthBuffer,V=Z.precision,z={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function D(M){if(q.add(M),M===0)return"uv";return`uv${M}`}function w(M,E,u,_,p){let n=_.fog,f=p.geometry,i=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?_.environment:null,d=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap,m=Q.get(M.envMap||i,d),J0=!!m&&m.mapping===VQ?m.image.height:null,Q0=z[M.type];if(M.precision!==null){if(V=Z.getMaxPrecision(M.precision),V!==M.precision)b0("WebGLProgram.getParameters:",M.precision,"not supported, using",V,"instead.")}let U0=f.morphAttributes.position||f.morphAttributes.normal||f.morphAttributes.color,_0=U0!==void 0?U0.length:0,Y0=0;if(f.morphAttributes.position!==void 0)Y0=1;if(f.morphAttributes.normal!==void 0)Y0=2;if(f.morphAttributes.color!==void 0)Y0=3;let I8,X8,o,W0;if(Q0){let H8=Z7[Q0];I8=H8.vertexShader,X8=H8.fragmentShader}else I8=M.vertexShader,X8=M.fragmentShader,H.update(M),o=H.getVertexShaderID(M),W0=H.getFragmentShaderID(M);let z0=J.getRenderTarget(),V0=J.state.buffers.depth.getReversed(),S0=p.isInstancedMesh===!0,r0=p.isBatchedMesh===!0,t0=!!M.map,e0=!!M.matcap,K8=!!m,U8=!!M.aoMap,c0=!!M.lightMap,S8=!!M.bumpMap,P=!!M.normalMap,m8=!!M.displacementMap,p0=!!M.emissiveMap,w8=!!M.metalnessMap,A0=!!M.roughnessMap,D8=M.anisotropy>0,L=M.clearcoat>0,k=M.dispersion>0,v=M.iridescence>0,s=M.sheen>0,t=M.transmission>0,c=D8&&!!M.anisotropyMap,D0=L&&!!M.clearcoatMap,X0=L&&!!M.clearcoatNormalMap,E0=L&&!!M.clearcoatRoughnessMap,T0=v&&!!M.iridescenceMap,e=v&&!!M.iridescenceThicknessMap,$0=s&&!!M.sheenColorMap,w0=s&&!!M.sheenRoughnessMap,j0=!!M.specularMap,O0=!!M.specularColorMap,m0=!!M.specularIntensityMap,S=t&&!!M.transmissionMap,Z0=t&&!!M.thicknessMap,K0=!!M.gradientMap,M0=!!M.alphaMap,a=M.alphaTest>0,r=!!M.alphaHash,I0=!!M.extensions,f0=l6;if(M.toneMapped){if(z0===null||z0.isXRRenderTarget===!0)f0=J.toneMapping}let k8={shaderID:Q0,shaderType:M.type,shaderName:M.name,vertexShader:I8,fragmentShader:X8,defines:M.defines,customVertexShaderID:o,customFragmentShaderID:W0,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:V,batching:r0,batchingColor:r0&&p._colorsTexture!==null,instancing:S0,instancingColor:S0&&p.instanceColor!==null,instancingMorph:S0&&p.morphTexture!==null,outputColorSpace:z0===null?J.outputColorSpace:z0.isXRRenderTarget===!0?z0.texture.colorSpace:zQ,alphaToCoverage:!!M.alphaToCoverage,map:t0,matcap:e0,envMap:K8,envMapMode:K8&&m.mapping,envMapCubeUVHeight:J0,aoMap:U8,lightMap:c0,bumpMap:S8,normalMap:P,displacementMap:m8,emissiveMap:p0,normalMapObjectSpace:P&&M.normalMapType===kz,normalMapTangentSpace:P&&M.normalMapType===Dz,metalnessMap:w8,roughnessMap:A0,anisotropy:D8,anisotropyMap:c,clearcoat:L,clearcoatMap:D0,clearcoatNormalMap:X0,clearcoatRoughnessMap:E0,dispersion:k,iridescence:v,iridescenceMap:T0,iridescenceThicknessMap:e,sheen:s,sheenColorMap:$0,sheenRoughnessMap:w0,specularMap:j0,specularColorMap:O0,specularIntensityMap:m0,transmission:t,transmissionMap:S,thicknessMap:Z0,gradientMap:K0,opaque:M.transparent===!1&&M.blending===UQ&&M.alphaToCoverage===!1,alphaMap:M0,alphaTest:a,alphaHash:r,combine:M.combine,mapUv:t0&&D(M.map.channel),aoMapUv:U8&&D(M.aoMap.channel),lightMapUv:c0&&D(M.lightMap.channel),bumpMapUv:S8&&D(M.bumpMap.channel),normalMapUv:P&&D(M.normalMap.channel),displacementMapUv:m8&&D(M.displacementMap.channel),emissiveMapUv:p0&&D(M.emissiveMap.channel),metalnessMapUv:w8&&D(M.metalnessMap.channel),roughnessMapUv:A0&&D(M.roughnessMap.channel),anisotropyMapUv:c&&D(M.anisotropyMap.channel),clearcoatMapUv:D0&&D(M.clearcoatMap.channel),clearcoatNormalMapUv:X0&&D(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:E0&&D(M.clearcoatRoughnessMap.channel),iridescenceMapUv:T0&&D(M.iridescenceMap.channel),iridescenceThicknessMapUv:e&&D(M.iridescenceThicknessMap.channel),sheenColorMapUv:$0&&D(M.sheenColorMap.channel),sheenRoughnessMapUv:w0&&D(M.sheenRoughnessMap.channel),specularMapUv:j0&&D(M.specularMap.channel),specularColorMapUv:O0&&D(M.specularColorMap.channel),specularIntensityMapUv:m0&&D(M.specularIntensityMap.channel),transmissionMapUv:S&&D(M.transmissionMap.channel),thicknessMapUv:Z0&&D(M.thicknessMap.channel),alphaMapUv:M0&&D(M.alphaMap.channel),vertexTangents:!!f.attributes.tangent&&(P||D8),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!f.attributes.color&&f.attributes.color.itemSize===4,pointsUvs:p.isPoints===!0&&!!f.attributes.uv&&(t0||M0),fog:!!n,useFog:M.fog===!0,fogExp2:!!n&&n.isFogExp2,flatShading:M.wireframe===!1&&(M.flatShading===!0||f.attributes.normal===void 0&&P===!1&&(M.isMeshLambertMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isMeshPhysicalMaterial)),sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:U,reversedDepthBuffer:V0,skinning:p.isSkinnedMesh===!0,morphTargets:f.morphAttributes.position!==void 0,morphNormals:f.morphAttributes.normal!==void 0,morphColors:f.morphAttributes.color!==void 0,morphTargetsCount:_0,morphTextureStride:Y0,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:W.numPlanes,numClipIntersection:W.numIntersection,dithering:M.dithering,shadowMapEnabled:J.shadowMap.enabled&&u.length>0,shadowMapType:J.shadowMap.type,toneMapping:f0,decodeVideoTexture:t0&&M.map.isVideoTexture===!0&&a0.getTransfer(M.map.colorSpace)===z8,decodeVideoTextureEmissive:p0&&M.emissiveMap.isVideoTexture===!0&&a0.getTransfer(M.emissiveMap.colorSpace)===z8,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===e6,flipSided:M.side===Y6,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:I0&&M.extensions.clipCullDistance===!0&&$.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(I0&&M.extensions.multiDraw===!0||r0)&&$.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:$.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return k8.vertexUv1s=q.has(1),k8.vertexUv2s=q.has(2),k8.vertexUv3s=q.has(3),q.clear(),k8}function F(M){let E=[];if(M.shaderID)E.push(M.shaderID);else E.push(M.customVertexShaderID),E.push(M.customFragmentShaderID);if(M.defines!==void 0)for(let u in M.defines)E.push(u),E.push(M.defines[u]);if(M.isRawShaderMaterial===!1)O(E,M),G(E,M),E.push(J.outputColorSpace);return E.push(M.customProgramCacheKey),E.join()}function O(M,E){M.push(E.precision),M.push(E.outputColorSpace),M.push(E.envMapMode),M.push(E.envMapCubeUVHeight),M.push(E.mapUv),M.push(E.alphaMapUv),M.push(E.lightMapUv),M.push(E.aoMapUv),M.push(E.bumpMapUv),M.push(E.normalMapUv),M.push(E.displacementMapUv),M.push(E.emissiveMapUv),M.push(E.metalnessMapUv),M.push(E.roughnessMapUv),M.push(E.anisotropyMapUv),M.push(E.clearcoatMapUv),M.push(E.clearcoatNormalMapUv),M.push(E.clearcoatRoughnessMapUv),M.push(E.iridescenceMapUv),M.push(E.iridescenceThicknessMapUv),M.push(E.sheenColorMapUv),M.push(E.sheenRoughnessMapUv),M.push(E.specularMapUv),M.push(E.specularColorMapUv),M.push(E.specularIntensityMapUv),M.push(E.transmissionMapUv),M.push(E.thicknessMapUv),M.push(E.combine),M.push(E.fogExp2),M.push(E.sizeAttenuation),M.push(E.morphTargetsCount),M.push(E.morphAttributeCount),M.push(E.numDirLights),M.push(E.numPointLights),M.push(E.numSpotLights),M.push(E.numSpotLightMaps),M.push(E.numHemiLights),M.push(E.numRectAreaLights),M.push(E.numDirLightShadows),M.push(E.numPointLightShadows),M.push(E.numSpotLightShadows),M.push(E.numSpotLightShadowsWithMaps),M.push(E.numLightProbes),M.push(E.shadowMapType),M.push(E.toneMapping),M.push(E.numClippingPlanes),M.push(E.numClipIntersection),M.push(E.depthPacking)}function G(M,E){if(X.disableAll(),E.instancing)X.enable(0);if(E.instancingColor)X.enable(1);if(E.instancingMorph)X.enable(2);if(E.matcap)X.enable(3);if(E.envMap)X.enable(4);if(E.normalMapObjectSpace)X.enable(5);if(E.normalMapTangentSpace)X.enable(6);if(E.clearcoat)X.enable(7);if(E.iridescence)X.enable(8);if(E.alphaTest)X.enable(9);if(E.vertexColors)X.enable(10);if(E.vertexAlphas)X.enable(11);if(E.vertexUv1s)X.enable(12);if(E.vertexUv2s)X.enable(13);if(E.vertexUv3s)X.enable(14);if(E.vertexTangents)X.enable(15);if(E.anisotropy)X.enable(16);if(E.alphaHash)X.enable(17);if(E.batching)X.enable(18);if(E.dispersion)X.enable(19);if(E.batchingColor)X.enable(20);if(E.gradientMap)X.enable(21);if(M.push(X.mask),X.disableAll(),E.fog)X.enable(0);if(E.useFog)X.enable(1);if(E.flatShading)X.enable(2);if(E.logarithmicDepthBuffer)X.enable(3);if(E.reversedDepthBuffer)X.enable(4);if(E.skinning)X.enable(5);if(E.morphTargets)X.enable(6);if(E.morphNormals)X.enable(7);if(E.morphColors)X.enable(8);if(E.premultipliedAlpha)X.enable(9);if(E.shadowMapEnabled)X.enable(10);if(E.doubleSided)X.enable(11);if(E.flipSided)X.enable(12);if(E.useDepthPacking)X.enable(13);if(E.dithering)X.enable(14);if(E.transmission)X.enable(15);if(E.sheen)X.enable(16);if(E.opaque)X.enable(17);if(E.pointsUvs)X.enable(18);if(E.decodeVideoTexture)X.enable(19);if(E.decodeVideoTextureEmissive)X.enable(20);if(E.alphaToCoverage)X.enable(21);M.push(X.mask)}function R(M){let E=z[M.type],u;if(E){let _=Z7[E];u=jz.clone(_.uniforms)}else u=M.uniforms;return u}function B(M,E){let u=Y.get(E);if(u!==void 0)++u.usedTimes;else u=new kG(J,E,M,K),N.push(u),Y.set(E,u);return u}function y(M){if(--M.usedTimes===0){let E=N.indexOf(M);N[E]=N[N.length-1],N.pop(),Y.delete(M.cacheKey),M.destroy()}}function C(M){H.remove(M)}function j(){H.dispose()}return{getParameters:w,getProgramCacheKey:F,getUniforms:R,acquireProgram:B,releaseProgram:y,releaseShaderCache:C,programs:N,dispose:j}}function IG(){let J=new WeakMap;function Q(X){return J.has(X)}function $(X){let H=J.get(X);if(H===void 0)H={},J.set(X,H);return H}function Z(X){J.delete(X)}function K(X,H,q){J.get(X)[H]=q}function W(){J=new WeakMap}return{has:Q,get:$,remove:Z,update:K,dispose:W}}function LG(J,Q){if(J.groupOrder!==Q.groupOrder)return J.groupOrder-Q.groupOrder;else if(J.renderOrder!==Q.renderOrder)return J.renderOrder-Q.renderOrder;else if(J.material.id!==Q.material.id)return J.material.id-Q.material.id;else if(J.materialVariant!==Q.materialVariant)return J.materialVariant-Q.materialVariant;else if(J.z!==Q.z)return J.z-Q.z;else return J.id-Q.id}function ez(J,Q){if(J.groupOrder!==Q.groupOrder)return J.groupOrder-Q.groupOrder;else if(J.renderOrder!==Q.renderOrder)return J.renderOrder-Q.renderOrder;else if(J.z!==Q.z)return Q.z-J.z;else return J.id-Q.id}function JD(){let J=[],Q=0,$=[],Z=[],K=[];function W(){Q=0,$.length=0,Z.length=0,K.length=0}function X(V){let z=0;if(V.isInstancedMesh)z+=2;if(V.isSkinnedMesh)z+=1;return z}function H(V,z,D,w,F,O){let G=J[Q];if(G===void 0)G={id:V.id,object:V,geometry:z,material:D,materialVariant:X(V),groupOrder:w,renderOrder:V.renderOrder,z:F,group:O},J[Q]=G;else G.id=V.id,G.object=V,G.geometry=z,G.material=D,G.materialVariant=X(V),G.groupOrder=w,G.renderOrder=V.renderOrder,G.z=F,G.group=O;return Q++,G}function q(V,z,D,w,F,O){let G=H(V,z,D,w,F,O);if(D.transmission>0)Z.push(G);else if(D.transparent===!0)K.push(G);else $.push(G)}function N(V,z,D,w,F,O){let G=H(V,z,D,w,F,O);if(D.transmission>0)Z.unshift(G);else if(D.transparent===!0)K.unshift(G);else $.unshift(G)}function Y(V,z){if($.length>1)$.sort(V||LG);if(Z.length>1)Z.sort(z||ez);if(K.length>1)K.sort(z||ez)}function U(){for(let V=Q,z=J.length;V<z;V++){let D=J[V];if(D.id===null)break;D.id=null,D.object=null,D.geometry=null,D.material=null,D.group=null}}return{opaque:$,transmissive:Z,transparent:K,init:W,push:q,unshift:N,finish:U,sort:Y}}function GG(){let J=new WeakMap;function Q(Z,K){let W=J.get(Z),X;if(W===void 0)X=new JD,J.set(Z,[X]);else if(K>=W.length)X=new JD,W.push(X);else X=W[K];return X}function $(){J=new WeakMap}return{get:Q,dispose:$}}function BG(){let J={};return{get:function(Q){if(J[Q.id]!==void 0)return J[Q.id];let $;switch(Q.type){case"DirectionalLight":$={direction:new g,color:new l0};break;case"SpotLight":$={position:new g,direction:new g,color:new l0,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":$={position:new g,color:new l0,distance:0,decay:0};break;case"HemisphereLight":$={direction:new g,skyColor:new l0,groundColor:new l0};break;case"RectAreaLight":$={color:new l0,position:new g,halfWidth:new g,halfHeight:new g};break}return J[Q.id]=$,$}}}function RG(){let J={};return{get:function(Q){if(J[Q.id]!==void 0)return J[Q.id];let $;switch(Q.type){case"DirectionalLight":$={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Z8};break;case"SpotLight":$={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Z8};break;case"PointLight":$={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Z8,shadowCameraNear:1,shadowCameraFar:1000};break}return J[Q.id]=$,$}}}var AG=0;function CG(J,Q){return(Q.castShadow?2:0)-(J.castShadow?2:0)+(Q.map?1:0)-(J.map?1:0)}function _G(J){let Q=new BG,$=RG(),Z={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let N=0;N<9;N++)Z.probe.push(new g);let K=new g,W=new L8,X=new L8;function H(N){let Y=0,U=0,V=0;for(let E=0;E<9;E++)Z.probe[E].set(0,0,0);let z=0,D=0,w=0,F=0,O=0,G=0,R=0,B=0,y=0,C=0,j=0;N.sort(CG);for(let E=0,u=N.length;E<u;E++){let _=N[E],p=_.color,n=_.intensity,f=_.distance,i=null;if(_.shadow&&_.shadow.map)if(_.shadow.map.texture.format===D9)i=_.shadow.map.texture;else i=_.shadow.map.depthTexture||_.shadow.map.texture;if(_.isAmbientLight)Y+=p.r*n,U+=p.g*n,V+=p.b*n;else if(_.isLightProbe){for(let d=0;d<9;d++)Z.probe[d].addScaledVector(_.sh.coefficients[d],n);j++}else if(_.isDirectionalLight){let d=Q.get(_);if(d.color.copy(_.color).multiplyScalar(_.intensity),_.castShadow){let m=_.shadow,J0=$.get(_);J0.shadowIntensity=m.intensity,J0.shadowBias=m.bias,J0.shadowNormalBias=m.normalBias,J0.shadowRadius=m.radius,J0.shadowMapSize=m.mapSize,Z.directionalShadow[z]=J0,Z.directionalShadowMap[z]=i,Z.directionalShadowMatrix[z]=_.shadow.matrix,G++}Z.directional[z]=d,z++}else if(_.isSpotLight){let d=Q.get(_);d.position.setFromMatrixPosition(_.matrixWorld),d.color.copy(p).multiplyScalar(n),d.distance=f,d.coneCos=Math.cos(_.angle),d.penumbraCos=Math.cos(_.angle*(1-_.penumbra)),d.decay=_.decay,Z.spot[w]=d;let m=_.shadow;if(_.map){if(Z.spotLightMap[y]=_.map,y++,m.updateMatrices(_),_.castShadow)C++}if(Z.spotLightMatrix[w]=m.matrix,_.castShadow){let J0=$.get(_);J0.shadowIntensity=m.intensity,J0.shadowBias=m.bias,J0.shadowNormalBias=m.normalBias,J0.shadowRadius=m.radius,J0.shadowMapSize=m.mapSize,Z.spotShadow[w]=J0,Z.spotShadowMap[w]=i,B++}w++}else if(_.isRectAreaLight){let d=Q.get(_);d.color.copy(p).multiplyScalar(n),d.halfWidth.set(_.width*0.5,0,0),d.halfHeight.set(0,_.height*0.5,0),Z.rectArea[F]=d,F++}else if(_.isPointLight){let d=Q.get(_);if(d.color.copy(_.color).multiplyScalar(_.intensity),d.distance=_.distance,d.decay=_.decay,_.castShadow){let m=_.shadow,J0=$.get(_);J0.shadowIntensity=m.intensity,J0.shadowBias=m.bias,J0.shadowNormalBias=m.normalBias,J0.shadowRadius=m.radius,J0.shadowMapSize=m.mapSize,J0.shadowCameraNear=m.camera.near,J0.shadowCameraFar=m.camera.far,Z.pointShadow[D]=J0,Z.pointShadowMap[D]=i,Z.pointShadowMatrix[D]=_.shadow.matrix,R++}Z.point[D]=d,D++}else if(_.isHemisphereLight){let d=Q.get(_);d.skyColor.copy(_.color).multiplyScalar(n),d.groundColor.copy(_.groundColor).multiplyScalar(n),Z.hemi[O]=d,O++}}if(F>0)if(J.has("OES_texture_float_linear")===!0)Z.rectAreaLTC1=H0.LTC_FLOAT_1,Z.rectAreaLTC2=H0.LTC_FLOAT_2;else Z.rectAreaLTC1=H0.LTC_HALF_1,Z.rectAreaLTC2=H0.LTC_HALF_2;Z.ambient[0]=Y,Z.ambient[1]=U,Z.ambient[2]=V;let M=Z.hash;if(M.directionalLength!==z||M.pointLength!==D||M.spotLength!==w||M.rectAreaLength!==F||M.hemiLength!==O||M.numDirectionalShadows!==G||M.numPointShadows!==R||M.numSpotShadows!==B||M.numSpotMaps!==y||M.numLightProbes!==j)Z.directional.length=z,Z.spot.length=w,Z.rectArea.length=F,Z.point.length=D,Z.hemi.length=O,Z.directionalShadow.length=G,Z.directionalShadowMap.length=G,Z.pointShadow.length=R,Z.pointShadowMap.length=R,Z.spotShadow.length=B,Z.spotShadowMap.length=B,Z.directionalShadowMatrix.length=G,Z.pointShadowMatrix.length=R,Z.spotLightMatrix.length=B+y-C,Z.spotLightMap.length=y,Z.numSpotLightShadowsWithMaps=C,Z.numLightProbes=j,M.directionalLength=z,M.pointLength=D,M.spotLength=w,M.rectAreaLength=F,M.hemiLength=O,M.numDirectionalShadows=G,M.numPointShadows=R,M.numSpotShadows=B,M.numSpotMaps=y,M.numLightProbes=j,Z.version=AG++}function q(N,Y){let U=0,V=0,z=0,D=0,w=0,F=Y.matrixWorldInverse;for(let O=0,G=N.length;O<G;O++){let R=N[O];if(R.isDirectionalLight){let B=Z.directional[U];B.direction.setFromMatrixPosition(R.matrixWorld),K.setFromMatrixPosition(R.target.matrixWorld),B.direction.sub(K),B.direction.transformDirection(F),U++}else if(R.isSpotLight){let B=Z.spot[z];B.position.setFromMatrixPosition(R.matrixWorld),B.position.applyMatrix4(F),B.direction.setFromMatrixPosition(R.matrixWorld),K.setFromMatrixPosition(R.target.matrixWorld),B.direction.sub(K),B.direction.transformDirection(F),z++}else if(R.isRectAreaLight){let B=Z.rectArea[D];B.position.setFromMatrixPosition(R.matrixWorld),B.position.applyMatrix4(F),X.identity(),W.copy(R.matrixWorld),W.premultiply(F),X.extractRotation(W),B.halfWidth.set(R.width*0.5,0,0),B.halfHeight.set(0,R.height*0.5,0),B.halfWidth.applyMatrix4(X),B.halfHeight.applyMatrix4(X),D++}else if(R.isPointLight){let B=Z.point[V];B.position.setFromMatrixPosition(R.matrixWorld),B.position.applyMatrix4(F),V++}else if(R.isHemisphereLight){let B=Z.hemi[w];B.direction.setFromMatrixPosition(R.matrixWorld),B.direction.transformDirection(F),w++}}}return{setup:H,setupView:q,state:Z}}function QD(J){let Q=new _G(J),$=[],Z=[];function K(Y){N.camera=Y,$.length=0,Z.length=0}function W(Y){$.push(Y)}function X(Y){Z.push(Y)}function H(){Q.setup($)}function q(Y){Q.setupView($,Y)}let N={lightsArray:$,shadowsArray:Z,camera:null,lights:Q,transmissionRenderTarget:{}};return{init:K,state:N,setupLights:H,setupLightsView:q,pushLight:W,pushShadow:X}}function EG(J){let Q=new WeakMap;function $(K,W=0){let X=Q.get(K),H;if(X===void 0)H=new QD(J),Q.set(K,[H]);else if(W>=X.length)H=new QD(J),X.push(H);else H=X[W];return H}function Z(){Q=new WeakMap}return{get:$,dispose:Z}}var PG=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,jG=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,SG=[new g(1,0,0),new g(-1,0,0),new g(0,1,0),new g(0,-1,0),new g(0,0,1),new g(0,0,-1)],TG=[new g(0,-1,0),new g(0,-1,0),new g(0,0,1),new g(0,0,-1),new g(0,-1,0),new g(0,-1,0)],$D=new L8,RQ=new g,EH=new g;function yG(J,Q,$){let Z=new IQ,K=new Z8,W=new Z8,X=new A8,H=new XH,q=new HH,N={},Y=$.maxTextureSize,U={[V9]:Y6,[Y6]:V9,[e6]:e6},V=new S6({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Z8},radius:{value:4}},vertexShader:PG,fragmentShader:jG}),z=V.clone();z.defines.HORIZONTAL_PASS=1;let D=new I6;D.setAttribute("position",new K6(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let w=new u6(D,V),F=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=YQ;let O=this.type;this.render=function(C,j,M){if(F.enabled===!1)return;if(F.autoUpdate===!1&&F.needsUpdate===!1)return;if(C.length===0)return;if(this.type===PF)b0("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=YQ;let E=J.getRenderTarget(),u=J.getActiveCubeFace(),_=J.getActiveMipmapLevel(),p=J.state;if(p.setBlending(J7),p.buffers.depth.getReversed()===!0)p.buffers.color.setClear(0,0,0,0);else p.buffers.color.setClear(1,1,1,1);p.buffers.depth.setTest(!0),p.setScissorTest(!1);let n=O!==this.type;if(n)j.traverse(function(f){if(f.material)if(Array.isArray(f.material))f.material.forEach((i)=>i.needsUpdate=!0);else f.material.needsUpdate=!0});for(let f=0,i=C.length;f<i;f++){let d=C[f],m=d.shadow;if(m===void 0){b0("WebGLShadowMap:",d,"has no shadow.");continue}if(m.autoUpdate===!1&&m.needsUpdate===!1)continue;K.copy(m.mapSize);let J0=m.getFrameExtents();if(K.multiply(J0),W.copy(m.mapSize),K.x>Y||K.y>Y){if(K.x>Y)W.x=Math.floor(Y/J0.x),K.x=W.x*J0.x,m.mapSize.x=W.x;if(K.y>Y)W.y=Math.floor(Y/J0.y),K.y=W.y*J0.y,m.mapSize.y=W.y}let Q0=J.state.buffers.depth.getReversed();if(m.camera._reversedDepth=Q0,m.map===null||n===!0){if(m.map!==null){if(m.map.depthTexture!==null)m.map.depthTexture.dispose(),m.map.depthTexture=null;m.map.dispose()}if(this.type===U9){if(d.isPointLight){b0("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}m.map=new j6(K.x,K.y,{format:D9,type:I7,minFilter:U6,magFilter:U6,generateMipmaps:!1}),m.map.texture.name=d.name+".shadowMap",m.map.depthTexture=new zJ(K.x,K.y,w7),m.map.depthTexture.name=d.name+".shadowMapDepth",m.map.depthTexture.format=UJ,m.map.depthTexture.compareFunction=null,m.map.depthTexture.minFilter=m7,m.map.depthTexture.magFilter=m7}else{if(d.isPointLight)m.map=new TH(K.x),m.map.depthTexture=new ZH(K.x,d7);else m.map=new j6(K.x,K.y),m.map.depthTexture=new zJ(K.x,K.y,d7);if(m.map.depthTexture.name=d.name+".shadowMap",m.map.depthTexture.format=UJ,this.type===YQ)m.map.depthTexture.compareFunction=Q0?dZ:mZ,m.map.depthTexture.minFilter=U6,m.map.depthTexture.magFilter=U6;else m.map.depthTexture.compareFunction=null,m.map.depthTexture.minFilter=m7,m.map.depthTexture.magFilter=m7}m.camera.updateProjectionMatrix()}let U0=m.map.isWebGLCubeRenderTarget?6:1;for(let _0=0;_0<U0;_0++){if(m.map.isWebGLCubeRenderTarget)J.setRenderTarget(m.map,_0),J.clear();else{if(_0===0)J.setRenderTarget(m.map),J.clear();let Y0=m.getViewport(_0);X.set(W.x*Y0.x,W.y*Y0.y,W.x*Y0.z,W.y*Y0.w),p.viewport(X)}if(d.isPointLight){let{camera:Y0,matrix:I8}=m,X8=d.distance||Y0.far;if(X8!==Y0.far)Y0.far=X8,Y0.updateProjectionMatrix();RQ.setFromMatrixPosition(d.matrixWorld),Y0.position.copy(RQ),EH.copy(Y0.position),EH.add(SG[_0]),Y0.up.copy(TG[_0]),Y0.lookAt(EH),Y0.updateMatrixWorld(),I8.makeTranslation(-RQ.x,-RQ.y,-RQ.z),$D.multiplyMatrices(Y0.projectionMatrix,Y0.matrixWorldInverse),m._frustum.setFromProjectionMatrix($D,Y0.coordinateSystem,Y0.reversedDepth)}else m.updateMatrices(d);Z=m.getFrustum(),B(j,M,m.camera,d,this.type)}if(m.isPointLightShadow!==!0&&this.type===U9)G(m,M);m.needsUpdate=!1}O=this.type,F.needsUpdate=!1,J.setRenderTarget(E,u,_)};function G(C,j){let M=Q.update(w);if(V.defines.VSM_SAMPLES!==C.blurSamples)V.defines.VSM_SAMPLES=C.blurSamples,z.defines.VSM_SAMPLES=C.blurSamples,V.needsUpdate=!0,z.needsUpdate=!0;if(C.mapPass===null)C.mapPass=new j6(K.x,K.y,{format:D9,type:I7});V.uniforms.shadow_pass.value=C.map.depthTexture,V.uniforms.resolution.value=C.mapSize,V.uniforms.radius.value=C.radius,J.setRenderTarget(C.mapPass),J.clear(),J.renderBufferDirect(j,null,M,V,w,null),z.uniforms.shadow_pass.value=C.mapPass.texture,z.uniforms.resolution.value=C.mapSize,z.uniforms.radius.value=C.radius,J.setRenderTarget(C.map),J.clear(),J.renderBufferDirect(j,null,M,z,w,null)}function R(C,j,M,E){let u=null,_=M.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(_!==void 0)u=_;else if(u=M.isPointLight===!0?q:H,J.localClippingEnabled&&j.clipShadows===!0&&Array.isArray(j.clippingPlanes)&&j.clippingPlanes.length!==0||j.displacementMap&&j.displacementScale!==0||j.alphaMap&&j.alphaTest>0||j.map&&j.alphaTest>0||j.alphaToCoverage===!0){let p=u.uuid,n=j.uuid,f=N[p];if(f===void 0)f={},N[p]=f;let i=f[n];if(i===void 0)i=u.clone(),f[n]=i,j.addEventListener("dispose",y);u=i}if(u.visible=j.visible,u.wireframe=j.wireframe,E===U9)u.side=j.shadowSide!==null?j.shadowSide:j.side;else u.side=j.shadowSide!==null?j.shadowSide:U[j.side];if(u.alphaMap=j.alphaMap,u.alphaTest=j.alphaToCoverage===!0?0.5:j.alphaTest,u.map=j.map,u.clipShadows=j.clipShadows,u.clippingPlanes=j.clippingPlanes,u.clipIntersection=j.clipIntersection,u.displacementMap=j.displacementMap,u.displacementScale=j.displacementScale,u.displacementBias=j.displacementBias,u.wireframeLinewidth=j.wireframeLinewidth,u.linewidth=j.linewidth,M.isPointLight===!0&&u.isMeshDistanceMaterial===!0){let p=J.properties.get(u);p.light=M}return u}function B(C,j,M,E,u){if(C.visible===!1)return;if(C.layers.test(j.layers)&&(C.isMesh||C.isLine||C.isPoints)){if((C.castShadow||C.receiveShadow&&u===U9)&&(!C.frustumCulled||Z.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(M.matrixWorldInverse,C.matrixWorld);let n=Q.update(C),f=C.material;if(Array.isArray(f)){let i=n.groups;for(let d=0,m=i.length;d<m;d++){let J0=i[d],Q0=f[J0.materialIndex];if(Q0&&Q0.visible){let U0=R(C,Q0,E,u);C.onBeforeShadow(J,C,j,M,n,U0,J0),J.renderBufferDirect(M,null,n,U0,C,J0),C.onAfterShadow(J,C,j,M,n,U0,J0)}}}else if(f.visible){let i=R(C,f,E,u);C.onBeforeShadow(J,C,j,M,n,i,null),J.renderBufferDirect(M,null,n,i,C,null),C.onAfterShadow(J,C,j,M,n,i,null)}}}let p=C.children;for(let n=0,f=p.length;n<f;n++)B(p[n],j,M,E,u)}function y(C){C.target.removeEventListener("dispose",y);for(let M in N){let E=N[M],u=C.target.uuid;if(u in E)E[u].dispose(),delete E[u]}}}function bG(J,Q){function $(){let S=!1,Z0=new A8,K0=null,M0=new A8(0,0,0,0);return{setMask:function(a){if(K0!==a&&!S)J.colorMask(a,a,a,a),K0=a},setLocked:function(a){S=a},setClear:function(a,r,I0,f0,k8){if(k8===!0)a*=f0,r*=f0,I0*=f0;if(Z0.set(a,r,I0,f0),M0.equals(Z0)===!1)J.clearColor(a,r,I0,f0),M0.copy(Z0)},reset:function(){S=!1,K0=null,M0.set(-1,0,0,0)}}}function Z(){let S=!1,Z0=!1,K0=null,M0=null,a=null;return{setReversed:function(r){if(Z0!==r){let I0=Q.get("EXT_clip_control");if(r)I0.clipControlEXT(I0.LOWER_LEFT_EXT,I0.ZERO_TO_ONE_EXT);else I0.clipControlEXT(I0.LOWER_LEFT_EXT,I0.NEGATIVE_ONE_TO_ONE_EXT);Z0=r;let f0=a;a=null,this.setClear(f0)}},getReversed:function(){return Z0},setTest:function(r){if(r)z0(J.DEPTH_TEST);else V0(J.DEPTH_TEST)},setMask:function(r){if(K0!==r&&!S)J.depthMask(r),K0=r},setFunc:function(r){if(Z0)r=Ez[r];if(M0!==r){switch(r){case aF:J.depthFunc(J.NEVER);break;case rF:J.depthFunc(J.ALWAYS);break;case tF:J.depthFunc(J.LESS);break;case ZX:J.depthFunc(J.LEQUAL);break;case eF:J.depthFunc(J.EQUAL);break;case Jz:J.depthFunc(J.GEQUAL);break;case Qz:J.depthFunc(J.GREATER);break;case $z:J.depthFunc(J.NOTEQUAL);break;default:J.depthFunc(J.LEQUAL)}M0=r}},setLocked:function(r){S=r},setClear:function(r){if(a!==r){if(a=r,Z0)r=1-r;J.clearDepth(r)}},reset:function(){S=!1,K0=null,M0=null,a=null,Z0=!1}}}function K(){let S=!1,Z0=null,K0=null,M0=null,a=null,r=null,I0=null,f0=null,k8=null;return{setTest:function(H8){if(!S)if(H8)z0(J.STENCIL_TEST);else V0(J.STENCIL_TEST)},setMask:function(H8){if(Z0!==H8&&!S)J.stencilMask(H8),Z0=H8},setFunc:function(H8,K7,s6){if(K0!==H8||M0!==K7||a!==s6)J.stencilFunc(H8,K7,s6),K0=H8,M0=K7,a=s6},setOp:function(H8,K7,s6){if(r!==H8||I0!==K7||f0!==s6)J.stencilOp(H8,K7,s6),r=H8,I0=K7,f0=s6},setLocked:function(H8){S=H8},setClear:function(H8){if(k8!==H8)J.clearStencil(H8),k8=H8},reset:function(){S=!1,Z0=null,K0=null,M0=null,a=null,r=null,I0=null,f0=null,k8=null}}}let W=new $,X=new Z,H=new K,q=new WeakMap,N=new WeakMap,Y={},U={},V=new WeakMap,z=[],D=null,w=!1,F=null,O=null,G=null,R=null,B=null,y=null,C=null,j=new l0(0,0,0),M=0,E=!1,u=null,_=null,p=null,n=null,f=null,i=J.getParameter(J.MAX_COMBINED_TEXTURE_IMAGE_UNITS),d=!1,m=0,J0=J.getParameter(J.VERSION);if(J0.indexOf("WebGL")!==-1)m=parseFloat(/^WebGL (\d)/.exec(J0)[1]),d=m>=1;else if(J0.indexOf("OpenGL ES")!==-1)m=parseFloat(/^OpenGL ES (\d)/.exec(J0)[1]),d=m>=2;let Q0=null,U0={},_0=J.getParameter(J.SCISSOR_BOX),Y0=J.getParameter(J.VIEWPORT),I8=new A8().fromArray(_0),X8=new A8().fromArray(Y0);function o(S,Z0,K0,M0){let a=new Uint8Array(4),r=J.createTexture();J.bindTexture(S,r),J.texParameteri(S,J.TEXTURE_MIN_FILTER,J.NEAREST),J.texParameteri(S,J.TEXTURE_MAG_FILTER,J.NEAREST);for(let I0=0;I0<K0;I0++)if(S===J.TEXTURE_3D||S===J.TEXTURE_2D_ARRAY)J.texImage3D(Z0,0,J.RGBA,1,1,M0,0,J.RGBA,J.UNSIGNED_BYTE,a);else J.texImage2D(Z0+I0,0,J.RGBA,1,1,0,J.RGBA,J.UNSIGNED_BYTE,a);return r}let W0={};W0[J.TEXTURE_2D]=o(J.TEXTURE_2D,J.TEXTURE_2D,1),W0[J.TEXTURE_CUBE_MAP]=o(J.TEXTURE_CUBE_MAP,J.TEXTURE_CUBE_MAP_POSITIVE_X,6),W0[J.TEXTURE_2D_ARRAY]=o(J.TEXTURE_2D_ARRAY,J.TEXTURE_2D_ARRAY,1,1),W0[J.TEXTURE_3D]=o(J.TEXTURE_3D,J.TEXTURE_3D,1,1),W.setClear(0,0,0,1),X.setClear(1),H.setClear(0),z0(J.DEPTH_TEST),X.setFunc(ZX),S8(!1),P(e5),z0(J.CULL_FACE),U8(J7);function z0(S){if(Y[S]!==!0)J.enable(S),Y[S]=!0}function V0(S){if(Y[S]!==!1)J.disable(S),Y[S]=!1}function S0(S,Z0){if(U[S]!==Z0){if(J.bindFramebuffer(S,Z0),U[S]=Z0,S===J.DRAW_FRAMEBUFFER)U[J.FRAMEBUFFER]=Z0;if(S===J.FRAMEBUFFER)U[J.DRAW_FRAMEBUFFER]=Z0;return!0}return!1}function r0(S,Z0){let K0=z,M0=!1;if(S){if(K0=V.get(Z0),K0===void 0)K0=[],V.set(Z0,K0);let a=S.textures;if(K0.length!==a.length||K0[0]!==J.COLOR_ATTACHMENT0){for(let r=0,I0=a.length;r<I0;r++)K0[r]=J.COLOR_ATTACHMENT0+r;K0.length=a.length,M0=!0}}else if(K0[0]!==J.BACK)K0[0]=J.BACK,M0=!0;if(M0)J.drawBuffers(K0)}function t0(S){if(D!==S)return J.useProgram(S),D=S,!0;return!1}let e0={[O9]:J.FUNC_ADD,[SF]:J.FUNC_SUBTRACT,[TF]:J.FUNC_REVERSE_SUBTRACT};e0[yF]=J.MIN,e0[bF]=J.MAX;let K8={[vF]:J.ZERO,[fF]:J.ONE,[hF]:J.SRC_COLOR,[gF]:J.SRC_ALPHA,[uF]:J.SRC_ALPHA_SATURATE,[lF]:J.DST_COLOR,[mF]:J.DST_ALPHA,[xF]:J.ONE_MINUS_SRC_COLOR,[pF]:J.ONE_MINUS_SRC_ALPHA,[cF]:J.ONE_MINUS_DST_COLOR,[dF]:J.ONE_MINUS_DST_ALPHA,[sF]:J.CONSTANT_COLOR,[nF]:J.ONE_MINUS_CONSTANT_COLOR,[iF]:J.CONSTANT_ALPHA,[oF]:J.ONE_MINUS_CONSTANT_ALPHA};function U8(S,Z0,K0,M0,a,r,I0,f0,k8,H8){if(S===J7){if(w===!0)V0(J.BLEND),w=!1;return}if(w===!1)z0(J.BLEND),w=!0;if(S!==jF){if(S!==F||H8!==E){if(O!==O9||B!==O9)J.blendEquation(J.FUNC_ADD),O=O9,B=O9;if(H8)switch(S){case UQ:J.blendFuncSeparate(J.ONE,J.ONE_MINUS_SRC_ALPHA,J.ONE,J.ONE_MINUS_SRC_ALPHA);break;case JX:J.blendFunc(J.ONE,J.ONE);break;case QX:J.blendFuncSeparate(J.ZERO,J.ONE_MINUS_SRC_COLOR,J.ZERO,J.ONE);break;case $X:J.blendFuncSeparate(J.DST_COLOR,J.ONE_MINUS_SRC_ALPHA,J.ZERO,J.ONE);break;default:y0("WebGLState: Invalid blending: ",S);break}else switch(S){case UQ:J.blendFuncSeparate(J.SRC_ALPHA,J.ONE_MINUS_SRC_ALPHA,J.ONE,J.ONE_MINUS_SRC_ALPHA);break;case JX:J.blendFuncSeparate(J.SRC_ALPHA,J.ONE,J.ONE,J.ONE);break;case QX:y0("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case $X:y0("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:y0("WebGLState: Invalid blending: ",S);break}G=null,R=null,y=null,C=null,j.set(0,0,0),M=0,F=S,E=H8}return}if(a=a||Z0,r=r||K0,I0=I0||M0,Z0!==O||a!==B)J.blendEquationSeparate(e0[Z0],e0[a]),O=Z0,B=a;if(K0!==G||M0!==R||r!==y||I0!==C)J.blendFuncSeparate(K8[K0],K8[M0],K8[r],K8[I0]),G=K0,R=M0,y=r,C=I0;if(f0.equals(j)===!1||k8!==M)J.blendColor(f0.r,f0.g,f0.b,k8),j.copy(f0),M=k8;F=S,E=!1}function c0(S,Z0){S.side===e6?V0(J.CULL_FACE):z0(J.CULL_FACE);let K0=S.side===Y6;if(Z0)K0=!K0;S8(K0),S.blending===UQ&&S.transparent===!1?U8(J7):U8(S.blending,S.blendEquation,S.blendSrc,S.blendDst,S.blendEquationAlpha,S.blendSrcAlpha,S.blendDstAlpha,S.blendColor,S.blendAlpha,S.premultipliedAlpha),X.setFunc(S.depthFunc),X.setTest(S.depthTest),X.setMask(S.depthWrite),W.setMask(S.colorWrite);let M0=S.stencilWrite;if(H.setTest(M0),M0)H.setMask(S.stencilWriteMask),H.setFunc(S.stencilFunc,S.stencilRef,S.stencilFuncMask),H.setOp(S.stencilFail,S.stencilZFail,S.stencilZPass);p0(S.polygonOffset,S.polygonOffsetFactor,S.polygonOffsetUnits),S.alphaToCoverage===!0?z0(J.SAMPLE_ALPHA_TO_COVERAGE):V0(J.SAMPLE_ALPHA_TO_COVERAGE)}function S8(S){if(u!==S){if(S)J.frontFace(J.CW);else J.frontFace(J.CCW);u=S}}function P(S){if(S!==_F){if(z0(J.CULL_FACE),S!==_)if(S===e5)J.cullFace(J.BACK);else if(S===EF)J.cullFace(J.FRONT);else J.cullFace(J.FRONT_AND_BACK)}else V0(J.CULL_FACE);_=S}function m8(S){if(S!==p){if(d)J.lineWidth(S);p=S}}function p0(S,Z0,K0){if(S){if(z0(J.POLYGON_OFFSET_FILL),n!==Z0||f!==K0){if(n=Z0,f=K0,X.getReversed())Z0=-Z0;J.polygonOffset(Z0,K0)}}else V0(J.POLYGON_OFFSET_FILL)}function w8(S){if(S)z0(J.SCISSOR_TEST);else V0(J.SCISSOR_TEST)}function A0(S){if(S===void 0)S=J.TEXTURE0+i-1;if(Q0!==S)J.activeTexture(S),Q0=S}function D8(S,Z0,K0){if(K0===void 0)if(Q0===null)K0=J.TEXTURE0+i-1;else K0=Q0;let M0=U0[K0];if(M0===void 0)M0={type:void 0,texture:void 0},U0[K0]=M0;if(M0.type!==S||M0.texture!==Z0){if(Q0!==K0)J.activeTexture(K0),Q0=K0;J.bindTexture(S,Z0||W0[S]),M0.type=S,M0.texture=Z0}}function L(){let S=U0[Q0];if(S!==void 0&&S.type!==void 0)J.bindTexture(S.type,null),S.type=void 0,S.texture=void 0}function k(){try{J.compressedTexImage2D(...arguments)}catch(S){y0("WebGLState:",S)}}function v(){try{J.compressedTexImage3D(...arguments)}catch(S){y0("WebGLState:",S)}}function s(){try{J.texSubImage2D(...arguments)}catch(S){y0("WebGLState:",S)}}function t(){try{J.texSubImage3D(...arguments)}catch(S){y0("WebGLState:",S)}}function c(){try{J.compressedTexSubImage2D(...arguments)}catch(S){y0("WebGLState:",S)}}function D0(){try{J.compressedTexSubImage3D(...arguments)}catch(S){y0("WebGLState:",S)}}function X0(){try{J.texStorage2D(...arguments)}catch(S){y0("WebGLState:",S)}}function E0(){try{J.texStorage3D(...arguments)}catch(S){y0("WebGLState:",S)}}function T0(){try{J.texImage2D(...arguments)}catch(S){y0("WebGLState:",S)}}function e(){try{J.texImage3D(...arguments)}catch(S){y0("WebGLState:",S)}}function $0(S){if(I8.equals(S)===!1)J.scissor(S.x,S.y,S.z,S.w),I8.copy(S)}function w0(S){if(X8.equals(S)===!1)J.viewport(S.x,S.y,S.z,S.w),X8.copy(S)}function j0(S,Z0){let K0=N.get(Z0);if(K0===void 0)K0=new WeakMap,N.set(Z0,K0);let M0=K0.get(S);if(M0===void 0)M0=J.getUniformBlockIndex(Z0,S.name),K0.set(S,M0)}function O0(S,Z0){let M0=N.get(Z0).get(S);if(q.get(Z0)!==M0)J.uniformBlockBinding(Z0,M0,S.__bindingPointIndex),q.set(Z0,M0)}function m0(){J.disable(J.BLEND),J.disable(J.CULL_FACE),J.disable(J.DEPTH_TEST),J.disable(J.POLYGON_OFFSET_FILL),J.disable(J.SCISSOR_TEST),J.disable(J.STENCIL_TEST),J.disable(J.SAMPLE_ALPHA_TO_COVERAGE),J.blendEquation(J.FUNC_ADD),J.blendFunc(J.ONE,J.ZERO),J.blendFuncSeparate(J.ONE,J.ZERO,J.ONE,J.ZERO),J.blendColor(0,0,0,0),J.colorMask(!0,!0,!0,!0),J.clearColor(0,0,0,0),J.depthMask(!0),J.depthFunc(J.LESS),X.setReversed(!1),J.clearDepth(1),J.stencilMask(4294967295),J.stencilFunc(J.ALWAYS,0,4294967295),J.stencilOp(J.KEEP,J.KEEP,J.KEEP),J.clearStencil(0),J.cullFace(J.BACK),J.frontFace(J.CCW),J.polygonOffset(0,0),J.activeTexture(J.TEXTURE0),J.bindFramebuffer(J.FRAMEBUFFER,null),J.bindFramebuffer(J.DRAW_FRAMEBUFFER,null),J.bindFramebuffer(J.READ_FRAMEBUFFER,null),J.useProgram(null),J.lineWidth(1),J.scissor(0,0,J.canvas.width,J.canvas.height),J.viewport(0,0,J.canvas.width,J.canvas.height),Y={},Q0=null,U0={},U={},V=new WeakMap,z=[],D=null,w=!1,F=null,O=null,G=null,R=null,B=null,y=null,C=null,j=new l0(0,0,0),M=0,E=!1,u=null,_=null,p=null,n=null,f=null,I8.set(0,0,J.canvas.width,J.canvas.height),X8.set(0,0,J.canvas.width,J.canvas.height),W.reset(),X.reset(),H.reset()}return{buffers:{color:W,depth:X,stencil:H},enable:z0,disable:V0,bindFramebuffer:S0,drawBuffers:r0,useProgram:t0,setBlending:U8,setMaterial:c0,setFlipSided:S8,setCullFace:P,setLineWidth:m8,setPolygonOffset:p0,setScissorTest:w8,activeTexture:A0,bindTexture:D8,unbindTexture:L,compressedTexImage2D:k,compressedTexImage3D:v,texImage2D:T0,texImage3D:e,updateUBOMapping:j0,uniformBlockBinding:O0,texStorage2D:X0,texStorage3D:E0,texSubImage2D:s,texSubImage3D:t,compressedTexSubImage2D:c,compressedTexSubImage3D:D0,scissor:$0,viewport:w0,reset:m0}}function vG(J,Q,$,Z,K,W,X){let H=Q.has("WEBGL_multisampled_render_to_texture")?Q.get("WEBGL_multisampled_render_to_texture"):null,q=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),N=new Z8,Y=new WeakMap,U,V=new WeakMap,z=!1;try{z=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(L){}function D(L,k){return z?new OffscreenCanvas(L,k):qQ("canvas")}function w(L,k,v){let s=1,t=D8(L);if(t.width>v||t.height>v)s=v/Math.max(t.width,t.height);if(s<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){let c=Math.floor(s*t.width),D0=Math.floor(s*t.height);if(U===void 0)U=D(c,D0);let X0=k?D(c,D0):U;return X0.width=c,X0.height=D0,X0.getContext("2d").drawImage(L,0,0,c,D0),b0("WebGLRenderer: Texture has been resized from ("+t.width+"x"+t.height+") to ("+c+"x"+D0+")."),X0}else{if("data"in L)b0("WebGLRenderer: Image in DataTexture is too big ("+t.width+"x"+t.height+").");return L}return L}function F(L){return L.generateMipmaps}function O(L){J.generateMipmap(L)}function G(L){if(L.isWebGLCubeRenderTarget)return J.TEXTURE_CUBE_MAP;if(L.isWebGL3DRenderTarget)return J.TEXTURE_3D;if(L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture)return J.TEXTURE_2D_ARRAY;return J.TEXTURE_2D}function R(L,k,v,s,t=!1){if(L!==null){if(J[L]!==void 0)return J[L];b0("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let c=k;if(k===J.RED){if(v===J.FLOAT)c=J.R32F;if(v===J.HALF_FLOAT)c=J.R16F;if(v===J.UNSIGNED_BYTE)c=J.R8}if(k===J.RED_INTEGER){if(v===J.UNSIGNED_BYTE)c=J.R8UI;if(v===J.UNSIGNED_SHORT)c=J.R16UI;if(v===J.UNSIGNED_INT)c=J.R32UI;if(v===J.BYTE)c=J.R8I;if(v===J.SHORT)c=J.R16I;if(v===J.INT)c=J.R32I}if(k===J.RG){if(v===J.FLOAT)c=J.RG32F;if(v===J.HALF_FLOAT)c=J.RG16F;if(v===J.UNSIGNED_BYTE)c=J.RG8}if(k===J.RG_INTEGER){if(v===J.UNSIGNED_BYTE)c=J.RG8UI;if(v===J.UNSIGNED_SHORT)c=J.RG16UI;if(v===J.UNSIGNED_INT)c=J.RG32UI;if(v===J.BYTE)c=J.RG8I;if(v===J.SHORT)c=J.RG16I;if(v===J.INT)c=J.RG32I}if(k===J.RGB_INTEGER){if(v===J.UNSIGNED_BYTE)c=J.RGB8UI;if(v===J.UNSIGNED_SHORT)c=J.RGB16UI;if(v===J.UNSIGNED_INT)c=J.RGB32UI;if(v===J.BYTE)c=J.RGB8I;if(v===J.SHORT)c=J.RGB16I;if(v===J.INT)c=J.RGB32I}if(k===J.RGBA_INTEGER){if(v===J.UNSIGNED_BYTE)c=J.RGBA8UI;if(v===J.UNSIGNED_SHORT)c=J.RGBA16UI;if(v===J.UNSIGNED_INT)c=J.RGBA32UI;if(v===J.BYTE)c=J.RGBA8I;if(v===J.SHORT)c=J.RGBA16I;if(v===J.INT)c=J.RGBA32I}if(k===J.RGB){if(v===J.UNSIGNED_INT_5_9_9_9_REV)c=J.RGB9_E5;if(v===J.UNSIGNED_INT_10F_11F_11F_REV)c=J.R11F_G11F_B10F}if(k===J.RGBA){let D0=t?oX:a0.getTransfer(s);if(v===J.FLOAT)c=J.RGBA32F;if(v===J.HALF_FLOAT)c=J.RGBA16F;if(v===J.UNSIGNED_BYTE)c=D0===z8?J.SRGB8_ALPHA8:J.RGBA8;if(v===J.UNSIGNED_SHORT_4_4_4_4)c=J.RGBA4;if(v===J.UNSIGNED_SHORT_5_5_5_1)c=J.RGB5_A1}if(c===J.R16F||c===J.R32F||c===J.RG16F||c===J.RG32F||c===J.RGBA16F||c===J.RGBA32F)Q.get("EXT_color_buffer_float");return c}function B(L,k){let v;if(L){if(k===null||k===d7||k===z9)v=J.DEPTH24_STENCIL8;else if(k===w7)v=J.DEPTH32F_STENCIL8;else if(k===FQ)v=J.DEPTH24_STENCIL8,b0("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(k===null||k===d7||k===z9)v=J.DEPTH_COMPONENT24;else if(k===w7)v=J.DEPTH_COMPONENT32F;else if(k===FQ)v=J.DEPTH_COMPONENT16;return v}function y(L,k){if(F(L)===!0||L.isFramebufferTexture&&L.minFilter!==m7&&L.minFilter!==U6)return Math.log2(Math.max(k.width,k.height))+1;else if(L.mipmaps!==void 0&&L.mipmaps.length>0)return L.mipmaps.length;else if(L.isCompressedTexture&&Array.isArray(L.image))return k.mipmaps.length;else return 1}function C(L){let k=L.target;if(k.removeEventListener("dispose",C),M(k),k.isVideoTexture)Y.delete(k)}function j(L){let k=L.target;k.removeEventListener("dispose",j),u(k)}function M(L){let k=Z.get(L);if(k.__webglInit===void 0)return;let v=L.source,s=V.get(v);if(s){let t=s[k.__cacheKey];if(t.usedTimes--,t.usedTimes===0)E(L);if(Object.keys(s).length===0)V.delete(v)}Z.remove(L)}function E(L){let k=Z.get(L);J.deleteTexture(k.__webglTexture);let v=L.source,s=V.get(v);delete s[k.__cacheKey],X.memory.textures--}function u(L){let k=Z.get(L);if(L.depthTexture)L.depthTexture.dispose(),Z.remove(L.depthTexture);if(L.isWebGLCubeRenderTarget)for(let s=0;s<6;s++){if(Array.isArray(k.__webglFramebuffer[s]))for(let t=0;t<k.__webglFramebuffer[s].length;t++)J.deleteFramebuffer(k.__webglFramebuffer[s][t]);else J.deleteFramebuffer(k.__webglFramebuffer[s]);if(k.__webglDepthbuffer)J.deleteRenderbuffer(k.__webglDepthbuffer[s])}else{if(Array.isArray(k.__webglFramebuffer))for(let s=0;s<k.__webglFramebuffer.length;s++)J.deleteFramebuffer(k.__webglFramebuffer[s]);else J.deleteFramebuffer(k.__webglFramebuffer);if(k.__webglDepthbuffer)J.deleteRenderbuffer(k.__webglDepthbuffer);if(k.__webglMultisampledFramebuffer)J.deleteFramebuffer(k.__webglMultisampledFramebuffer);if(k.__webglColorRenderbuffer){for(let s=0;s<k.__webglColorRenderbuffer.length;s++)if(k.__webglColorRenderbuffer[s])J.deleteRenderbuffer(k.__webglColorRenderbuffer[s])}if(k.__webglDepthRenderbuffer)J.deleteRenderbuffer(k.__webglDepthRenderbuffer)}let v=L.textures;for(let s=0,t=v.length;s<t;s++){let c=Z.get(v[s]);if(c.__webglTexture)J.deleteTexture(c.__webglTexture),X.memory.textures--;Z.remove(v[s])}Z.remove(L)}let _=0;function p(){_=0}function n(){let L=_;if(L>=K.maxTextures)b0("WebGLTextures: Trying to use "+L+" texture units while this GPU supports only "+K.maxTextures);return _+=1,L}function f(L){let k=[];return k.push(L.wrapS),k.push(L.wrapT),k.push(L.wrapR||0),k.push(L.magFilter),k.push(L.minFilter),k.push(L.anisotropy),k.push(L.internalFormat),k.push(L.format),k.push(L.type),k.push(L.generateMipmaps),k.push(L.premultiplyAlpha),k.push(L.flipY),k.push(L.unpackAlignment),k.push(L.colorSpace),k.join()}function i(L,k){let v=Z.get(L);if(L.isVideoTexture)w8(L);if(L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&v.__version!==L.version){let s=L.image;if(s===null)b0("WebGLRenderer: Texture marked for update but no image data found.");else if(s.complete===!1)b0("WebGLRenderer: Texture marked for update but image is incomplete");else{W0(v,L,k);return}}else if(L.isExternalTexture)v.__webglTexture=L.sourceTexture?L.sourceTexture:null;$.bindTexture(J.TEXTURE_2D,v.__webglTexture,J.TEXTURE0+k)}function d(L,k){let v=Z.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&v.__version!==L.version){W0(v,L,k);return}else if(L.isExternalTexture)v.__webglTexture=L.sourceTexture?L.sourceTexture:null;$.bindTexture(J.TEXTURE_2D_ARRAY,v.__webglTexture,J.TEXTURE0+k)}function m(L,k){let v=Z.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&v.__version!==L.version){W0(v,L,k);return}$.bindTexture(J.TEXTURE_3D,v.__webglTexture,J.TEXTURE0+k)}function J0(L,k){let v=Z.get(L);if(L.isCubeDepthTexture!==!0&&L.version>0&&v.__version!==L.version){z0(v,L,k);return}$.bindTexture(J.TEXTURE_CUBE_MAP,v.__webglTexture,J.TEXTURE0+k)}let Q0={[Xz]:J.REPEAT,[vZ]:J.CLAMP_TO_EDGE,[Hz]:J.MIRRORED_REPEAT},U0={[m7]:J.NEAREST,[qz]:J.NEAREST_MIPMAP_NEAREST,[OQ]:J.NEAREST_MIPMAP_LINEAR,[U6]:J.LINEAR,[fZ]:J.LINEAR_MIPMAP_NEAREST,[YJ]:J.LINEAR_MIPMAP_LINEAR},_0={[wz]:J.NEVER,[Rz]:J.ALWAYS,[Iz]:J.LESS,[mZ]:J.LEQUAL,[Lz]:J.EQUAL,[dZ]:J.GEQUAL,[Gz]:J.GREATER,[Bz]:J.NOTEQUAL};function Y0(L,k){if(k.type===w7&&Q.has("OES_texture_float_linear")===!1&&(k.magFilter===U6||k.magFilter===fZ||k.magFilter===OQ||k.magFilter===YJ||k.minFilter===U6||k.minFilter===fZ||k.minFilter===OQ||k.minFilter===YJ))b0("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(J.texParameteri(L,J.TEXTURE_WRAP_S,Q0[k.wrapS]),J.texParameteri(L,J.TEXTURE_WRAP_T,Q0[k.wrapT]),L===J.TEXTURE_3D||L===J.TEXTURE_2D_ARRAY)J.texParameteri(L,J.TEXTURE_WRAP_R,Q0[k.wrapR]);if(J.texParameteri(L,J.TEXTURE_MAG_FILTER,U0[k.magFilter]),J.texParameteri(L,J.TEXTURE_MIN_FILTER,U0[k.minFilter]),k.compareFunction)J.texParameteri(L,J.TEXTURE_COMPARE_MODE,J.COMPARE_REF_TO_TEXTURE),J.texParameteri(L,J.TEXTURE_COMPARE_FUNC,_0[k.compareFunction]);if(Q.has("EXT_texture_filter_anisotropic")===!0){if(k.magFilter===m7)return;if(k.minFilter!==OQ&&k.minFilter!==YJ)return;if(k.type===w7&&Q.has("OES_texture_float_linear")===!1)return;if(k.anisotropy>1||Z.get(k).__currentAnisotropy){let v=Q.get("EXT_texture_filter_anisotropic");J.texParameterf(L,v.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(k.anisotropy,K.getMaxAnisotropy())),Z.get(k).__currentAnisotropy=k.anisotropy}}}function I8(L,k){let v=!1;if(L.__webglInit===void 0)L.__webglInit=!0,k.addEventListener("dispose",C);let s=k.source,t=V.get(s);if(t===void 0)t={},V.set(s,t);let c=f(k);if(c!==L.__cacheKey){if(t[c]===void 0)t[c]={texture:J.createTexture(),usedTimes:0},X.memory.textures++,v=!0;t[c].usedTimes++;let D0=t[L.__cacheKey];if(D0!==void 0){if(t[L.__cacheKey].usedTimes--,D0.usedTimes===0)E(k)}L.__cacheKey=c,L.__webglTexture=t[c].texture}return v}function X8(L,k,v){return Math.floor(Math.floor(L/v)/k)}function o(L,k,v,s){let c=L.updateRanges;if(c.length===0)$.texSubImage2D(J.TEXTURE_2D,0,0,0,k.width,k.height,v,s,k.data);else{c.sort((e,$0)=>e.start-$0.start);let D0=0;for(let e=1;e<c.length;e++){let $0=c[D0],w0=c[e],j0=$0.start+$0.count,O0=X8(w0.start,k.width,4),m0=X8($0.start,k.width,4);if(w0.start<=j0+1&&O0===m0&&X8(w0.start+w0.count-1,k.width,4)===O0)$0.count=Math.max($0.count,w0.start+w0.count-$0.start);else++D0,c[D0]=w0}c.length=D0+1;let X0=J.getParameter(J.UNPACK_ROW_LENGTH),E0=J.getParameter(J.UNPACK_SKIP_PIXELS),T0=J.getParameter(J.UNPACK_SKIP_ROWS);J.pixelStorei(J.UNPACK_ROW_LENGTH,k.width);for(let e=0,$0=c.length;e<$0;e++){let w0=c[e],j0=Math.floor(w0.start/4),O0=Math.ceil(w0.count/4),m0=j0%k.width,S=Math.floor(j0/k.width),Z0=O0,K0=1;J.pixelStorei(J.UNPACK_SKIP_PIXELS,m0),J.pixelStorei(J.UNPACK_SKIP_ROWS,S),$.texSubImage2D(J.TEXTURE_2D,0,m0,S,Z0,1,v,s,k.data)}L.clearUpdateRanges(),J.pixelStorei(J.UNPACK_ROW_LENGTH,X0),J.pixelStorei(J.UNPACK_SKIP_PIXELS,E0),J.pixelStorei(J.UNPACK_SKIP_ROWS,T0)}}function W0(L,k,v){let s=J.TEXTURE_2D;if(k.isDataArrayTexture||k.isCompressedArrayTexture)s=J.TEXTURE_2D_ARRAY;if(k.isData3DTexture)s=J.TEXTURE_3D;let t=I8(L,k),c=k.source;$.bindTexture(s,L.__webglTexture,J.TEXTURE0+v);let D0=Z.get(c);if(c.version!==D0.__version||t===!0){$.activeTexture(J.TEXTURE0+v);let X0=a0.getPrimaries(a0.workingColorSpace),E0=k.colorSpace===OJ?null:a0.getPrimaries(k.colorSpace),T0=k.colorSpace===OJ||X0===E0?J.NONE:J.BROWSER_DEFAULT_WEBGL;J.pixelStorei(J.UNPACK_FLIP_Y_WEBGL,k.flipY),J.pixelStorei(J.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),J.pixelStorei(J.UNPACK_ALIGNMENT,k.unpackAlignment),J.pixelStorei(J.UNPACK_COLORSPACE_CONVERSION_WEBGL,T0);let e=w(k.image,!1,K.maxTextureSize);e=A0(k,e);let $0=W.convert(k.format,k.colorSpace),w0=W.convert(k.type),j0=R(k.internalFormat,$0,w0,k.colorSpace,k.isVideoTexture);Y0(s,k);let O0,m0=k.mipmaps,S=k.isVideoTexture!==!0,Z0=D0.__version===void 0||t===!0,K0=c.dataReady,M0=y(k,e);if(k.isDepthTexture){if(j0=B(k.format===VJ,k.type),Z0)if(S)$.texStorage2D(J.TEXTURE_2D,1,j0,e.width,e.height);else $.texImage2D(J.TEXTURE_2D,0,j0,e.width,e.height,0,$0,w0,null)}else if(k.isDataTexture)if(m0.length>0){if(S&&Z0)$.texStorage2D(J.TEXTURE_2D,M0,j0,m0[0].width,m0[0].height);for(let a=0,r=m0.length;a<r;a++)if(O0=m0[a],S){if(K0)$.texSubImage2D(J.TEXTURE_2D,a,0,0,O0.width,O0.height,$0,w0,O0.data)}else $.texImage2D(J.TEXTURE_2D,a,j0,O0.width,O0.height,0,$0,w0,O0.data);k.generateMipmaps=!1}else if(S){if(Z0)$.texStorage2D(J.TEXTURE_2D,M0,j0,e.width,e.height);if(K0)o(k,e,$0,w0)}else $.texImage2D(J.TEXTURE_2D,0,j0,e.width,e.height,0,$0,w0,e.data);else if(k.isCompressedTexture)if(k.isCompressedArrayTexture){if(S&&Z0)$.texStorage3D(J.TEXTURE_2D_ARRAY,M0,j0,m0[0].width,m0[0].height,e.depth);for(let a=0,r=m0.length;a<r;a++)if(O0=m0[a],k.format!==Q7)if($0!==null)if(S){if(K0)if(k.layerUpdates.size>0){let I0=GH(O0.width,O0.height,k.format,k.type);for(let f0 of k.layerUpdates){let k8=O0.data.subarray(f0*I0/O0.data.BYTES_PER_ELEMENT,(f0+1)*I0/O0.data.BYTES_PER_ELEMENT);$.compressedTexSubImage3D(J.TEXTURE_2D_ARRAY,a,0,0,f0,O0.width,O0.height,1,$0,k8)}k.clearLayerUpdates()}else $.compressedTexSubImage3D(J.TEXTURE_2D_ARRAY,a,0,0,0,O0.width,O0.height,e.depth,$0,O0.data)}else $.compressedTexImage3D(J.TEXTURE_2D_ARRAY,a,j0,O0.width,O0.height,e.depth,0,O0.data,0,0);else b0("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(S){if(K0)$.texSubImage3D(J.TEXTURE_2D_ARRAY,a,0,0,0,O0.width,O0.height,e.depth,$0,w0,O0.data)}else $.texImage3D(J.TEXTURE_2D_ARRAY,a,j0,O0.width,O0.height,e.depth,0,$0,w0,O0.data)}else{if(S&&Z0)$.texStorage2D(J.TEXTURE_2D,M0,j0,m0[0].width,m0[0].height);for(let a=0,r=m0.length;a<r;a++)if(O0=m0[a],k.format!==Q7)if($0!==null)if(S){if(K0)$.compressedTexSubImage2D(J.TEXTURE_2D,a,0,0,O0.width,O0.height,$0,O0.data)}else $.compressedTexImage2D(J.TEXTURE_2D,a,j0,O0.width,O0.height,0,O0.data);else b0("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(S){if(K0)$.texSubImage2D(J.TEXTURE_2D,a,0,0,O0.width,O0.height,$0,w0,O0.data)}else $.texImage2D(J.TEXTURE_2D,a,j0,O0.width,O0.height,0,$0,w0,O0.data)}else if(k.isDataArrayTexture)if(S){if(Z0)$.texStorage3D(J.TEXTURE_2D_ARRAY,M0,j0,e.width,e.height,e.depth);if(K0)if(k.layerUpdates.size>0){let a=GH(e.width,e.height,k.format,k.type);for(let r of k.layerUpdates){let I0=e.data.subarray(r*a/e.data.BYTES_PER_ELEMENT,(r+1)*a/e.data.BYTES_PER_ELEMENT);$.texSubImage3D(J.TEXTURE_2D_ARRAY,0,0,0,r,e.width,e.height,1,$0,w0,I0)}k.clearLayerUpdates()}else $.texSubImage3D(J.TEXTURE_2D_ARRAY,0,0,0,0,e.width,e.height,e.depth,$0,w0,e.data)}else $.texImage3D(J.TEXTURE_2D_ARRAY,0,j0,e.width,e.height,e.depth,0,$0,w0,e.data);else if(k.isData3DTexture)if(S){if(Z0)$.texStorage3D(J.TEXTURE_3D,M0,j0,e.width,e.height,e.depth);if(K0)$.texSubImage3D(J.TEXTURE_3D,0,0,0,0,e.width,e.height,e.depth,$0,w0,e.data)}else $.texImage3D(J.TEXTURE_3D,0,j0,e.width,e.height,e.depth,0,$0,w0,e.data);else if(k.isFramebufferTexture){if(Z0)if(S)$.texStorage2D(J.TEXTURE_2D,M0,j0,e.width,e.height);else{let{width:a,height:r}=e;for(let I0=0;I0<M0;I0++)$.texImage2D(J.TEXTURE_2D,I0,j0,a,r,0,$0,w0,null),a>>=1,r>>=1}}else if(m0.length>0){if(S&&Z0){let a=D8(m0[0]);$.texStorage2D(J.TEXTURE_2D,M0,j0,a.width,a.height)}for(let a=0,r=m0.length;a<r;a++)if(O0=m0[a],S){if(K0)$.texSubImage2D(J.TEXTURE_2D,a,0,0,$0,w0,O0)}else $.texImage2D(J.TEXTURE_2D,a,j0,$0,w0,O0);k.generateMipmaps=!1}else if(S){if(Z0){let a=D8(e);$.texStorage2D(J.TEXTURE_2D,M0,j0,a.width,a.height)}if(K0)$.texSubImage2D(J.TEXTURE_2D,0,0,0,$0,w0,e)}else $.texImage2D(J.TEXTURE_2D,0,j0,$0,w0,e);if(F(k))O(s);if(D0.__version=c.version,k.onUpdate)k.onUpdate(k)}L.__version=k.version}function z0(L,k,v){if(k.image.length!==6)return;let s=I8(L,k),t=k.source;$.bindTexture(J.TEXTURE_CUBE_MAP,L.__webglTexture,J.TEXTURE0+v);let c=Z.get(t);if(t.version!==c.__version||s===!0){$.activeTexture(J.TEXTURE0+v);let D0=a0.getPrimaries(a0.workingColorSpace),X0=k.colorSpace===OJ?null:a0.getPrimaries(k.colorSpace),E0=k.colorSpace===OJ||D0===X0?J.NONE:J.BROWSER_DEFAULT_WEBGL;J.pixelStorei(J.UNPACK_FLIP_Y_WEBGL,k.flipY),J.pixelStorei(J.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),J.pixelStorei(J.UNPACK_ALIGNMENT,k.unpackAlignment),J.pixelStorei(J.UNPACK_COLORSPACE_CONVERSION_WEBGL,E0);let T0=k.isCompressedTexture||k.image[0].isCompressedTexture,e=k.image[0]&&k.image[0].isDataTexture,$0=[];for(let r=0;r<6;r++){if(!T0&&!e)$0[r]=w(k.image[r],!0,K.maxCubemapSize);else $0[r]=e?k.image[r].image:k.image[r];$0[r]=A0(k,$0[r])}let w0=$0[0],j0=W.convert(k.format,k.colorSpace),O0=W.convert(k.type),m0=R(k.internalFormat,j0,O0,k.colorSpace),S=k.isVideoTexture!==!0,Z0=c.__version===void 0||s===!0,K0=t.dataReady,M0=y(k,w0);Y0(J.TEXTURE_CUBE_MAP,k);let a;if(T0){if(S&&Z0)$.texStorage2D(J.TEXTURE_CUBE_MAP,M0,m0,w0.width,w0.height);for(let r=0;r<6;r++){a=$0[r].mipmaps;for(let I0=0;I0<a.length;I0++){let f0=a[I0];if(k.format!==Q7)if(j0!==null)if(S){if(K0)$.compressedTexSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,I0,0,0,f0.width,f0.height,j0,f0.data)}else $.compressedTexImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,I0,m0,f0.width,f0.height,0,f0.data);else b0("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(S){if(K0)$.texSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,I0,0,0,f0.width,f0.height,j0,O0,f0.data)}else $.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,I0,m0,f0.width,f0.height,0,j0,O0,f0.data)}}}else{if(a=k.mipmaps,S&&Z0){if(a.length>0)M0++;let r=D8($0[0]);$.texStorage2D(J.TEXTURE_CUBE_MAP,M0,m0,r.width,r.height)}for(let r=0;r<6;r++)if(e){if(S){if(K0)$.texSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,0,0,$0[r].width,$0[r].height,j0,O0,$0[r].data)}else $.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,m0,$0[r].width,$0[r].height,0,j0,O0,$0[r].data);for(let I0=0;I0<a.length;I0++){let k8=a[I0].image[r].image;if(S){if(K0)$.texSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,I0+1,0,0,k8.width,k8.height,j0,O0,k8.data)}else $.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,I0+1,m0,k8.width,k8.height,0,j0,O0,k8.data)}}else{if(S){if(K0)$.texSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,0,0,j0,O0,$0[r])}else $.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,m0,j0,O0,$0[r]);for(let I0=0;I0<a.length;I0++){let f0=a[I0];if(S){if(K0)$.texSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,I0+1,0,0,j0,O0,f0.image[r])}else $.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,I0+1,m0,j0,O0,f0.image[r])}}}if(F(k))O(J.TEXTURE_CUBE_MAP);if(c.__version=t.version,k.onUpdate)k.onUpdate(k)}L.__version=k.version}function V0(L,k,v,s,t,c){let D0=W.convert(v.format,v.colorSpace),X0=W.convert(v.type),E0=R(v.internalFormat,D0,X0,v.colorSpace),T0=Z.get(k),e=Z.get(v);if(e.__renderTarget=k,!T0.__hasExternalTextures){let $0=Math.max(1,k.width>>c),w0=Math.max(1,k.height>>c);if(t===J.TEXTURE_3D||t===J.TEXTURE_2D_ARRAY)$.texImage3D(t,c,E0,$0,w0,k.depth,0,D0,X0,null);else $.texImage2D(t,c,E0,$0,w0,0,D0,X0,null)}if($.bindFramebuffer(J.FRAMEBUFFER,L),p0(k))H.framebufferTexture2DMultisampleEXT(J.FRAMEBUFFER,s,t,e.__webglTexture,0,m8(k));else if(t===J.TEXTURE_2D||t>=J.TEXTURE_CUBE_MAP_POSITIVE_X&&t<=J.TEXTURE_CUBE_MAP_NEGATIVE_Z)J.framebufferTexture2D(J.FRAMEBUFFER,s,t,e.__webglTexture,c);$.bindFramebuffer(J.FRAMEBUFFER,null)}function S0(L,k,v){if(J.bindRenderbuffer(J.RENDERBUFFER,L),k.depthBuffer){let s=k.depthTexture,t=s&&s.isDepthTexture?s.type:null,c=B(k.stencilBuffer,t),D0=k.stencilBuffer?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT;if(p0(k))H.renderbufferStorageMultisampleEXT(J.RENDERBUFFER,m8(k),c,k.width,k.height);else if(v)J.renderbufferStorageMultisample(J.RENDERBUFFER,m8(k),c,k.width,k.height);else J.renderbufferStorage(J.RENDERBUFFER,c,k.width,k.height);J.framebufferRenderbuffer(J.FRAMEBUFFER,D0,J.RENDERBUFFER,L)}else{let s=k.textures;for(let t=0;t<s.length;t++){let c=s[t],D0=W.convert(c.format,c.colorSpace),X0=W.convert(c.type),E0=R(c.internalFormat,D0,X0,c.colorSpace);if(p0(k))H.renderbufferStorageMultisampleEXT(J.RENDERBUFFER,m8(k),E0,k.width,k.height);else if(v)J.renderbufferStorageMultisample(J.RENDERBUFFER,m8(k),E0,k.width,k.height);else J.renderbufferStorage(J.RENDERBUFFER,E0,k.width,k.height)}}J.bindRenderbuffer(J.RENDERBUFFER,null)}function r0(L,k,v){let s=k.isWebGLCubeRenderTarget===!0;if($.bindFramebuffer(J.FRAMEBUFFER,L),!(k.depthTexture&&k.depthTexture.isDepthTexture))throw Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let t=Z.get(k.depthTexture);if(t.__renderTarget=k,!t.__webglTexture||k.depthTexture.image.width!==k.width||k.depthTexture.image.height!==k.height)k.depthTexture.image.width=k.width,k.depthTexture.image.height=k.height,k.depthTexture.needsUpdate=!0;if(s){if(t.__webglInit===void 0)t.__webglInit=!0,k.depthTexture.addEventListener("dispose",C);if(t.__webglTexture===void 0){t.__webglTexture=J.createTexture(),$.bindTexture(J.TEXTURE_CUBE_MAP,t.__webglTexture),Y0(J.TEXTURE_CUBE_MAP,k.depthTexture);let T0=W.convert(k.depthTexture.format),e=W.convert(k.depthTexture.type),$0;if(k.depthTexture.format===UJ)$0=J.DEPTH_COMPONENT24;else if(k.depthTexture.format===VJ)$0=J.DEPTH24_STENCIL8;for(let w0=0;w0<6;w0++)J.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+w0,0,$0,k.width,k.height,0,T0,e,null)}}else i(k.depthTexture,0);let c=t.__webglTexture,D0=m8(k),X0=s?J.TEXTURE_CUBE_MAP_POSITIVE_X+v:J.TEXTURE_2D,E0=k.depthTexture.format===VJ?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT;if(k.depthTexture.format===UJ)if(p0(k))H.framebufferTexture2DMultisampleEXT(J.FRAMEBUFFER,E0,X0,c,0,D0);else J.framebufferTexture2D(J.FRAMEBUFFER,E0,X0,c,0);else if(k.depthTexture.format===VJ)if(p0(k))H.framebufferTexture2DMultisampleEXT(J.FRAMEBUFFER,E0,X0,c,0,D0);else J.framebufferTexture2D(J.FRAMEBUFFER,E0,X0,c,0);else throw Error("Unknown depthTexture format")}function t0(L){let k=Z.get(L),v=L.isWebGLCubeRenderTarget===!0;if(k.__boundDepthTexture!==L.depthTexture){let s=L.depthTexture;if(k.__depthDisposeCallback)k.__depthDisposeCallback();if(s){let t=()=>{delete k.__boundDepthTexture,delete k.__depthDisposeCallback,s.removeEventListener("dispose",t)};s.addEventListener("dispose",t),k.__depthDisposeCallback=t}k.__boundDepthTexture=s}if(L.depthTexture&&!k.__autoAllocateDepthBuffer)if(v)for(let s=0;s<6;s++)r0(k.__webglFramebuffer[s],L,s);else{let s=L.texture.mipmaps;if(s&&s.length>0)r0(k.__webglFramebuffer[0],L,0);else r0(k.__webglFramebuffer,L,0)}else if(v){k.__webglDepthbuffer=[];for(let s=0;s<6;s++)if($.bindFramebuffer(J.FRAMEBUFFER,k.__webglFramebuffer[s]),k.__webglDepthbuffer[s]===void 0)k.__webglDepthbuffer[s]=J.createRenderbuffer(),S0(k.__webglDepthbuffer[s],L,!1);else{let t=L.stencilBuffer?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT,c=k.__webglDepthbuffer[s];J.bindRenderbuffer(J.RENDERBUFFER,c),J.framebufferRenderbuffer(J.FRAMEBUFFER,t,J.RENDERBUFFER,c)}}else{let s=L.texture.mipmaps;if(s&&s.length>0)$.bindFramebuffer(J.FRAMEBUFFER,k.__webglFramebuffer[0]);else $.bindFramebuffer(J.FRAMEBUFFER,k.__webglFramebuffer);if(k.__webglDepthbuffer===void 0)k.__webglDepthbuffer=J.createRenderbuffer(),S0(k.__webglDepthbuffer,L,!1);else{let t=L.stencilBuffer?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT,c=k.__webglDepthbuffer;J.bindRenderbuffer(J.RENDERBUFFER,c),J.framebufferRenderbuffer(J.FRAMEBUFFER,t,J.RENDERBUFFER,c)}}$.bindFramebuffer(J.FRAMEBUFFER,null)}function e0(L,k,v){let s=Z.get(L);if(k!==void 0)V0(s.__webglFramebuffer,L,L.texture,J.COLOR_ATTACHMENT0,J.TEXTURE_2D,0);if(v!==void 0)t0(L)}function K8(L){let k=L.texture,v=Z.get(L),s=Z.get(k);L.addEventListener("dispose",j);let t=L.textures,c=L.isWebGLCubeRenderTarget===!0,D0=t.length>1;if(!D0){if(s.__webglTexture===void 0)s.__webglTexture=J.createTexture();s.__version=k.version,X.memory.textures++}if(c){v.__webglFramebuffer=[];for(let X0=0;X0<6;X0++)if(k.mipmaps&&k.mipmaps.length>0){v.__webglFramebuffer[X0]=[];for(let E0=0;E0<k.mipmaps.length;E0++)v.__webglFramebuffer[X0][E0]=J.createFramebuffer()}else v.__webglFramebuffer[X0]=J.createFramebuffer()}else{if(k.mipmaps&&k.mipmaps.length>0){v.__webglFramebuffer=[];for(let X0=0;X0<k.mipmaps.length;X0++)v.__webglFramebuffer[X0]=J.createFramebuffer()}else v.__webglFramebuffer=J.createFramebuffer();if(D0)for(let X0=0,E0=t.length;X0<E0;X0++){let T0=Z.get(t[X0]);if(T0.__webglTexture===void 0)T0.__webglTexture=J.createTexture(),X.memory.textures++}if(L.samples>0&&p0(L)===!1){v.__webglMultisampledFramebuffer=J.createFramebuffer(),v.__webglColorRenderbuffer=[],$.bindFramebuffer(J.FRAMEBUFFER,v.__webglMultisampledFramebuffer);for(let X0=0;X0<t.length;X0++){let E0=t[X0];v.__webglColorRenderbuffer[X0]=J.createRenderbuffer(),J.bindRenderbuffer(J.RENDERBUFFER,v.__webglColorRenderbuffer[X0]);let T0=W.convert(E0.format,E0.colorSpace),e=W.convert(E0.type),$0=R(E0.internalFormat,T0,e,E0.colorSpace,L.isXRRenderTarget===!0),w0=m8(L);J.renderbufferStorageMultisample(J.RENDERBUFFER,w0,$0,L.width,L.height),J.framebufferRenderbuffer(J.FRAMEBUFFER,J.COLOR_ATTACHMENT0+X0,J.RENDERBUFFER,v.__webglColorRenderbuffer[X0])}if(J.bindRenderbuffer(J.RENDERBUFFER,null),L.depthBuffer)v.__webglDepthRenderbuffer=J.createRenderbuffer(),S0(v.__webglDepthRenderbuffer,L,!0);$.bindFramebuffer(J.FRAMEBUFFER,null)}}if(c){$.bindTexture(J.TEXTURE_CUBE_MAP,s.__webglTexture),Y0(J.TEXTURE_CUBE_MAP,k);for(let X0=0;X0<6;X0++)if(k.mipmaps&&k.mipmaps.length>0)for(let E0=0;E0<k.mipmaps.length;E0++)V0(v.__webglFramebuffer[X0][E0],L,k,J.COLOR_ATTACHMENT0,J.TEXTURE_CUBE_MAP_POSITIVE_X+X0,E0);else V0(v.__webglFramebuffer[X0],L,k,J.COLOR_ATTACHMENT0,J.TEXTURE_CUBE_MAP_POSITIVE_X+X0,0);if(F(k))O(J.TEXTURE_CUBE_MAP);$.unbindTexture()}else if(D0){for(let X0=0,E0=t.length;X0<E0;X0++){let T0=t[X0],e=Z.get(T0),$0=J.TEXTURE_2D;if(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)$0=L.isWebGL3DRenderTarget?J.TEXTURE_3D:J.TEXTURE_2D_ARRAY;if($.bindTexture($0,e.__webglTexture),Y0($0,T0),V0(v.__webglFramebuffer,L,T0,J.COLOR_ATTACHMENT0+X0,$0,0),F(T0))O($0)}$.unbindTexture()}else{let X0=J.TEXTURE_2D;if(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)X0=L.isWebGL3DRenderTarget?J.TEXTURE_3D:J.TEXTURE_2D_ARRAY;if($.bindTexture(X0,s.__webglTexture),Y0(X0,k),k.mipmaps&&k.mipmaps.length>0)for(let E0=0;E0<k.mipmaps.length;E0++)V0(v.__webglFramebuffer[E0],L,k,J.COLOR_ATTACHMENT0,X0,E0);else V0(v.__webglFramebuffer,L,k,J.COLOR_ATTACHMENT0,X0,0);if(F(k))O(X0);$.unbindTexture()}if(L.depthBuffer)t0(L)}function U8(L){let k=L.textures;for(let v=0,s=k.length;v<s;v++){let t=k[v];if(F(t)){let c=G(L),D0=Z.get(t).__webglTexture;$.bindTexture(c,D0),O(c),$.unbindTexture()}}}let c0=[],S8=[];function P(L){if(L.samples>0){if(p0(L)===!1){let{textures:k,width:v,height:s}=L,t=J.COLOR_BUFFER_BIT,c=L.stencilBuffer?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT,D0=Z.get(L),X0=k.length>1;if(X0)for(let T0=0;T0<k.length;T0++)$.bindFramebuffer(J.FRAMEBUFFER,D0.__webglMultisampledFramebuffer),J.framebufferRenderbuffer(J.FRAMEBUFFER,J.COLOR_ATTACHMENT0+T0,J.RENDERBUFFER,null),$.bindFramebuffer(J.FRAMEBUFFER,D0.__webglFramebuffer),J.framebufferTexture2D(J.DRAW_FRAMEBUFFER,J.COLOR_ATTACHMENT0+T0,J.TEXTURE_2D,null,0);$.bindFramebuffer(J.READ_FRAMEBUFFER,D0.__webglMultisampledFramebuffer);let E0=L.texture.mipmaps;if(E0&&E0.length>0)$.bindFramebuffer(J.DRAW_FRAMEBUFFER,D0.__webglFramebuffer[0]);else $.bindFramebuffer(J.DRAW_FRAMEBUFFER,D0.__webglFramebuffer);for(let T0=0;T0<k.length;T0++){if(L.resolveDepthBuffer){if(L.depthBuffer)t|=J.DEPTH_BUFFER_BIT;if(L.stencilBuffer&&L.resolveStencilBuffer)t|=J.STENCIL_BUFFER_BIT}if(X0){J.framebufferRenderbuffer(J.READ_FRAMEBUFFER,J.COLOR_ATTACHMENT0,J.RENDERBUFFER,D0.__webglColorRenderbuffer[T0]);let e=Z.get(k[T0]).__webglTexture;J.framebufferTexture2D(J.DRAW_FRAMEBUFFER,J.COLOR_ATTACHMENT0,J.TEXTURE_2D,e,0)}if(J.blitFramebuffer(0,0,v,s,0,0,v,s,t,J.NEAREST),q===!0){if(c0.length=0,S8.length=0,c0.push(J.COLOR_ATTACHMENT0+T0),L.depthBuffer&&L.resolveDepthBuffer===!1)c0.push(c),S8.push(c),J.invalidateFramebuffer(J.DRAW_FRAMEBUFFER,S8);J.invalidateFramebuffer(J.READ_FRAMEBUFFER,c0)}}if($.bindFramebuffer(J.READ_FRAMEBUFFER,null),$.bindFramebuffer(J.DRAW_FRAMEBUFFER,null),X0)for(let T0=0;T0<k.length;T0++){$.bindFramebuffer(J.FRAMEBUFFER,D0.__webglMultisampledFramebuffer),J.framebufferRenderbuffer(J.FRAMEBUFFER,J.COLOR_ATTACHMENT0+T0,J.RENDERBUFFER,D0.__webglColorRenderbuffer[T0]);let e=Z.get(k[T0]).__webglTexture;$.bindFramebuffer(J.FRAMEBUFFER,D0.__webglFramebuffer),J.framebufferTexture2D(J.DRAW_FRAMEBUFFER,J.COLOR_ATTACHMENT0+T0,J.TEXTURE_2D,e,0)}$.bindFramebuffer(J.DRAW_FRAMEBUFFER,D0.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.resolveDepthBuffer===!1&&q){let k=L.stencilBuffer?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT;J.invalidateFramebuffer(J.DRAW_FRAMEBUFFER,[k])}}}function m8(L){return Math.min(K.maxSamples,L.samples)}function p0(L){let k=Z.get(L);return L.samples>0&&Q.has("WEBGL_multisampled_render_to_texture")===!0&&k.__useRenderToTexture!==!1}function w8(L){let k=X.render.frame;if(Y.get(L)!==k)Y.set(L,k),L.update()}function A0(L,k){let{colorSpace:v,format:s,type:t}=L;if(L.isCompressedTexture===!0||L.isVideoTexture===!0)return k;if(v!==zQ&&v!==OJ)if(a0.getTransfer(v)===z8){if(s!==Q7||t!==c6)b0("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else y0("WebGLTextures: Unsupported texture color space:",v);return k}function D8(L){if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement)N.width=L.naturalWidth||L.width,N.height=L.naturalHeight||L.height;else if(typeof VideoFrame<"u"&&L instanceof VideoFrame)N.width=L.displayWidth,N.height=L.displayHeight;else N.width=L.width,N.height=L.height;return N}this.allocateTextureUnit=n,this.resetTextureUnits=p,this.setTexture2D=i,this.setTexture2DArray=d,this.setTexture3D=m,this.setTextureCube=J0,this.rebindTextures=e0,this.setupRenderTarget=K8,this.updateRenderTargetMipmap=U8,this.updateMultisampleRenderTarget=P,this.setupDepthRenderbuffer=t0,this.setupFrameBufferTexture=V0,this.useMultisampledRTT=p0,this.isReversedDepthBuffer=function(){return $.buffers.depth.getReversed()}}function fG(J,Q){function $(Z,K=OJ){let W,X=a0.getTransfer(K);if(Z===c6)return J.UNSIGNED_BYTE;if(Z===VX)return J.UNSIGNED_SHORT_4_4_4_4;if(Z===OX)return J.UNSIGNED_SHORT_5_5_5_1;if(Z===Uz)return J.UNSIGNED_INT_5_9_9_9_REV;if(Z===Vz)return J.UNSIGNED_INT_10F_11F_11F_REV;if(Z===Nz)return J.BYTE;if(Z===Yz)return J.SHORT;if(Z===FQ)return J.UNSIGNED_SHORT;if(Z===UX)return J.INT;if(Z===d7)return J.UNSIGNED_INT;if(Z===w7)return J.FLOAT;if(Z===I7)return J.HALF_FLOAT;if(Z===Oz)return J.ALPHA;if(Z===Fz)return J.RGB;if(Z===Q7)return J.RGBA;if(Z===UJ)return J.DEPTH_COMPONENT;if(Z===VJ)return J.DEPTH_STENCIL;if(Z===zz)return J.RED;if(Z===FX)return J.RED_INTEGER;if(Z===D9)return J.RG;if(Z===zX)return J.RG_INTEGER;if(Z===DX)return J.RGBA_INTEGER;if(Z===hZ||Z===xZ||Z===gZ||Z===pZ)if(X===z8)if(W=Q.get("WEBGL_compressed_texture_s3tc_srgb"),W!==null){if(Z===hZ)return W.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(Z===xZ)return W.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(Z===gZ)return W.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(Z===pZ)return W.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(W=Q.get("WEBGL_compressed_texture_s3tc"),W!==null){if(Z===hZ)return W.COMPRESSED_RGB_S3TC_DXT1_EXT;if(Z===xZ)return W.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(Z===gZ)return W.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(Z===pZ)return W.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(Z===kX||Z===MX||Z===wX||Z===IX)if(W=Q.get("WEBGL_compressed_texture_pvrtc"),W!==null){if(Z===kX)return W.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(Z===MX)return W.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(Z===wX)return W.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(Z===IX)return W.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(Z===LX||Z===GX||Z===BX||Z===RX||Z===AX||Z===CX||Z===_X)if(W=Q.get("WEBGL_compressed_texture_etc"),W!==null){if(Z===LX||Z===GX)return X===z8?W.COMPRESSED_SRGB8_ETC2:W.COMPRESSED_RGB8_ETC2;if(Z===BX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:W.COMPRESSED_RGBA8_ETC2_EAC;if(Z===RX)return W.COMPRESSED_R11_EAC;if(Z===AX)return W.COMPRESSED_SIGNED_R11_EAC;if(Z===CX)return W.COMPRESSED_RG11_EAC;if(Z===_X)return W.COMPRESSED_SIGNED_RG11_EAC}else return null;if(Z===EX||Z===PX||Z===jX||Z===SX||Z===TX||Z===yX||Z===bX||Z===vX||Z===fX||Z===hX||Z===xX||Z===gX||Z===pX||Z===mX)if(W=Q.get("WEBGL_compressed_texture_astc"),W!==null){if(Z===EX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:W.COMPRESSED_RGBA_ASTC_4x4_KHR;if(Z===PX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:W.COMPRESSED_RGBA_ASTC_5x4_KHR;if(Z===jX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:W.COMPRESSED_RGBA_ASTC_5x5_KHR;if(Z===SX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:W.COMPRESSED_RGBA_ASTC_6x5_KHR;if(Z===TX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:W.COMPRESSED_RGBA_ASTC_6x6_KHR;if(Z===yX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:W.COMPRESSED_RGBA_ASTC_8x5_KHR;if(Z===bX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:W.COMPRESSED_RGBA_ASTC_8x6_KHR;if(Z===vX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:W.COMPRESSED_RGBA_ASTC_8x8_KHR;if(Z===fX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:W.COMPRESSED_RGBA_ASTC_10x5_KHR;if(Z===hX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:W.COMPRESSED_RGBA_ASTC_10x6_KHR;if(Z===xX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:W.COMPRESSED_RGBA_ASTC_10x8_KHR;if(Z===gX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:W.COMPRESSED_RGBA_ASTC_10x10_KHR;if(Z===pX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:W.COMPRESSED_RGBA_ASTC_12x10_KHR;if(Z===mX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:W.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(Z===dX||Z===lX||Z===cX)if(W=Q.get("EXT_texture_compression_bptc"),W!==null){if(Z===dX)return X===z8?W.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:W.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(Z===lX)return W.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(Z===cX)return W.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(Z===uX||Z===sX||Z===nX||Z===iX)if(W=Q.get("EXT_texture_compression_rgtc"),W!==null){if(Z===uX)return W.COMPRESSED_RED_RGTC1_EXT;if(Z===sX)return W.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(Z===nX)return W.COMPRESSED_RED_GREEN_RGTC2_EXT;if(Z===iX)return W.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(Z===z9)return J.UNSIGNED_INT_24_8;return J[Z]!==void 0?J[Z]:null}return{convert:$}}var hG=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,xG=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class OD{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(J,Q){if(this.texture===null){let $=new tZ(J.texture);if(J.depthNear!==Q.depthNear||J.depthFar!==Q.depthFar)this.depthNear=J.depthNear,this.depthFar=J.depthFar;this.texture=$}}getMesh(J){if(this.texture!==null){if(this.mesh===null){let Q=J.cameras[0].viewport,$=new S6({vertexShader:hG,fragmentShader:xG,uniforms:{depthColor:{value:this.texture},depthWidth:{value:Q.z},depthHeight:{value:Q.w}}});this.mesh=new u6(new GQ(20,20),$)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class FD extends l7{constructor(J,Q){super();let $=this,Z=null,K=1,W=null,X="local-floor",H=1,q=null,N=null,Y=null,U=null,V=null,z=null,D=typeof XRWebGLBinding<"u",w=new OD,F={},O=Q.getContextAttributes(),G=null,R=null,B=[],y=[],C=new Z8,j=null,M=new t8;M.viewport=new A8;let E=new t8;E.viewport=new A8;let u=[M,E],_=new wH,p=null,n=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(o){let W0=B[o];if(W0===void 0)W0=new MQ,B[o]=W0;return W0.getTargetRaySpace()},this.getControllerGrip=function(o){let W0=B[o];if(W0===void 0)W0=new MQ,B[o]=W0;return W0.getGripSpace()},this.getHand=function(o){let W0=B[o];if(W0===void 0)W0=new MQ,B[o]=W0;return W0.getHandSpace()};function f(o){let W0=y.indexOf(o.inputSource);if(W0===-1)return;let z0=B[W0];if(z0!==void 0)z0.update(o.inputSource,o.frame,q||W),z0.dispatchEvent({type:o.type,data:o.inputSource})}function i(){Z.removeEventListener("select",f),Z.removeEventListener("selectstart",f),Z.removeEventListener("selectend",f),Z.removeEventListener("squeeze",f),Z.removeEventListener("squeezestart",f),Z.removeEventListener("squeezeend",f),Z.removeEventListener("end",i),Z.removeEventListener("inputsourceschange",d);for(let o=0;o<B.length;o++){let W0=y[o];if(W0===null)continue;y[o]=null,B[o].disconnect(W0)}p=null,n=null,w.reset();for(let o in F)delete F[o];J.setRenderTarget(G),V=null,U=null,Y=null,Z=null,R=null,X8.stop(),$.isPresenting=!1,J.setPixelRatio(j),J.setSize(C.width,C.height,!1),$.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(o){if(K=o,$.isPresenting===!0)b0("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(o){if(X=o,$.isPresenting===!0)b0("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return q||W},this.setReferenceSpace=function(o){q=o},this.getBaseLayer=function(){return U!==null?U:V},this.getBinding=function(){if(Y===null&&D)Y=new XRWebGLBinding(Z,Q);return Y},this.getFrame=function(){return z},this.getSession=function(){return Z},this.setSession=async function(o){if(Z=o,Z!==null){if(G=J.getRenderTarget(),Z.addEventListener("select",f),Z.addEventListener("selectstart",f),Z.addEventListener("selectend",f),Z.addEventListener("squeeze",f),Z.addEventListener("squeezestart",f),Z.addEventListener("squeezeend",f),Z.addEventListener("end",i),Z.addEventListener("inputsourceschange",d),O.xrCompatible!==!0)await Q.makeXRCompatible();if(j=J.getPixelRatio(),J.getSize(C),!(D&&("createProjectionLayer"in XRWebGLBinding.prototype))){let z0={antialias:O.antialias,alpha:!0,depth:O.depth,stencil:O.stencil,framebufferScaleFactor:K};V=new XRWebGLLayer(Z,Q,z0),Z.updateRenderState({baseLayer:V}),J.setPixelRatio(1),J.setSize(V.framebufferWidth,V.framebufferHeight,!1),R=new j6(V.framebufferWidth,V.framebufferHeight,{format:Q7,type:c6,colorSpace:J.outputColorSpace,stencilBuffer:O.stencil,resolveDepthBuffer:V.ignoreDepthValues===!1,resolveStencilBuffer:V.ignoreDepthValues===!1})}else{let z0=null,V0=null,S0=null;if(O.depth)S0=O.stencil?Q.DEPTH24_STENCIL8:Q.DEPTH_COMPONENT24,z0=O.stencil?VJ:UJ,V0=O.stencil?z9:d7;let r0={colorFormat:Q.RGBA8,depthFormat:S0,scaleFactor:K};Y=this.getBinding(),U=Y.createProjectionLayer(r0),Z.updateRenderState({layers:[U]}),J.setPixelRatio(1),J.setSize(U.textureWidth,U.textureHeight,!1),R=new j6(U.textureWidth,U.textureHeight,{format:Q7,type:c6,depthTexture:new zJ(U.textureWidth,U.textureHeight,V0,void 0,void 0,void 0,void 0,void 0,void 0,z0),stencilBuffer:O.stencil,colorSpace:J.outputColorSpace,samples:O.antialias?4:0,resolveDepthBuffer:U.ignoreDepthValues===!1,resolveStencilBuffer:U.ignoreDepthValues===!1})}R.isXRRenderTarget=!0,this.setFoveation(H),q=null,W=await Z.requestReferenceSpace(X),X8.setContext(Z),X8.start(),$.isPresenting=!0,$.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(Z!==null)return Z.environmentBlendMode},this.getDepthTexture=function(){return w.getDepthTexture()};function d(o){for(let W0=0;W0<o.removed.length;W0++){let z0=o.removed[W0],V0=y.indexOf(z0);if(V0>=0)y[V0]=null,B[V0].disconnect(z0)}for(let W0=0;W0<o.added.length;W0++){let z0=o.added[W0],V0=y.indexOf(z0);if(V0===-1){for(let r0=0;r0<B.length;r0++)if(r0>=y.length){y.push(z0),V0=r0;break}else if(y[r0]===null){y[r0]=z0,V0=r0;break}if(V0===-1)break}let S0=B[V0];if(S0)S0.connect(z0)}}let m=new g,J0=new g;function Q0(o,W0,z0){m.setFromMatrixPosition(W0.matrixWorld),J0.setFromMatrixPosition(z0.matrixWorld);let V0=m.distanceTo(J0),S0=W0.projectionMatrix.elements,r0=z0.projectionMatrix.elements,t0=S0[14]/(S0[10]-1),e0=S0[14]/(S0[10]+1),K8=(S0[9]+1)/S0[5],U8=(S0[9]-1)/S0[5],c0=(S0[8]-1)/S0[0],S8=(r0[8]+1)/r0[0],P=t0*c0,m8=t0*S8,p0=V0/(-c0+S8),w8=p0*-c0;if(W0.matrixWorld.decompose(o.position,o.quaternion,o.scale),o.translateX(w8),o.translateZ(p0),o.matrixWorld.compose(o.position,o.quaternion,o.scale),o.matrixWorldInverse.copy(o.matrixWorld).invert(),S0[10]===-1)o.projectionMatrix.copy(W0.projectionMatrix),o.projectionMatrixInverse.copy(W0.projectionMatrixInverse);else{let A0=t0+p0,D8=e0+p0,L=P-w8,k=m8+(V0-w8),v=K8*e0/D8*A0,s=U8*e0/D8*A0;o.projectionMatrix.makePerspective(L,k,v,s,A0,D8),o.projectionMatrixInverse.copy(o.projectionMatrix).invert()}}function U0(o,W0){if(W0===null)o.matrixWorld.copy(o.matrix);else o.matrixWorld.multiplyMatrices(W0.matrixWorld,o.matrix);o.matrixWorldInverse.copy(o.matrixWorld).invert()}this.updateCamera=function(o){if(Z===null)return;let{near:W0,far:z0}=o;if(w.texture!==null){if(w.depthNear>0)W0=w.depthNear;if(w.depthFar>0)z0=w.depthFar}if(_.near=E.near=M.near=W0,_.far=E.far=M.far=z0,p!==_.near||n!==_.far)Z.updateRenderState({depthNear:_.near,depthFar:_.far}),p=_.near,n=_.far;_.layers.mask=o.layers.mask|6,M.layers.mask=_.layers.mask&-5,E.layers.mask=_.layers.mask&-3;let V0=o.parent,S0=_.cameras;U0(_,V0);for(let r0=0;r0<S0.length;r0++)U0(S0[r0],V0);if(S0.length===2)Q0(_,M,E);else _.projectionMatrix.copy(M.projectionMatrix);_0(o,_,V0)};function _0(o,W0,z0){if(z0===null)o.matrix.copy(W0.matrixWorld);else o.matrix.copy(z0.matrixWorld),o.matrix.invert(),o.matrix.multiply(W0.matrixWorld);if(o.matrix.decompose(o.position,o.quaternion,o.scale),o.updateMatrixWorld(!0),o.projectionMatrix.copy(W0.projectionMatrix),o.projectionMatrixInverse.copy(W0.projectionMatrixInverse),o.isPerspectiveCamera)o.fov=TZ*2*Math.atan(1/o.projectionMatrix.elements[5]),o.zoom=1}this.getCamera=function(){return _},this.getFoveation=function(){if(U===null&&V===null)return;return H},this.setFoveation=function(o){if(H=o,U!==null)U.fixedFoveation=o;if(V!==null&&V.fixedFoveation!==void 0)V.fixedFoveation=o},this.hasDepthSensing=function(){return w.texture!==null},this.getDepthSensingMesh=function(){return w.getMesh(_)},this.getCameraTexture=function(o){return F[o]};let Y0=null;function I8(o,W0){if(N=W0.getViewerPose(q||W),z=W0,N!==null){let z0=N.views;if(V!==null)J.setRenderTargetFramebuffer(R,V.framebuffer),J.setRenderTarget(R);let V0=!1;if(z0.length!==_.cameras.length)_.cameras.length=0,V0=!0;for(let e0=0;e0<z0.length;e0++){let K8=z0[e0],U8=null;if(V!==null)U8=V.getViewport(K8);else{let S8=Y.getViewSubImage(U,K8);if(U8=S8.viewport,e0===0)J.setRenderTargetTextures(R,S8.colorTexture,S8.depthStencilTexture),J.setRenderTarget(R)}let c0=u[e0];if(c0===void 0)c0=new t8,c0.layers.enable(e0),c0.viewport=new A8,u[e0]=c0;if(c0.matrix.fromArray(K8.transform.matrix),c0.matrix.decompose(c0.position,c0.quaternion,c0.scale),c0.projectionMatrix.fromArray(K8.projectionMatrix),c0.projectionMatrixInverse.copy(c0.projectionMatrix).invert(),c0.viewport.set(U8.x,U8.y,U8.width,U8.height),e0===0)_.matrix.copy(c0.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale);if(V0===!0)_.cameras.push(c0)}let S0=Z.enabledFeatures;if(S0&&S0.includes("depth-sensing")&&Z.depthUsage=="gpu-optimized"&&D){Y=$.getBinding();let e0=Y.getDepthInformation(z0[0]);if(e0&&e0.isValid&&e0.texture)w.init(e0,Z.renderState)}if(S0&&S0.includes("camera-access")&&D){J.state.unbindTexture(),Y=$.getBinding();for(let e0=0;e0<z0.length;e0++){let K8=z0[e0].camera;if(K8){let U8=F[K8];if(!U8)U8=new tZ,F[K8]=U8;let c0=Y.getCameraImage(K8);U8.sourceTexture=c0}}}}for(let z0=0;z0<B.length;z0++){let V0=y[z0],S0=B[z0];if(V0!==null&&S0!==void 0)S0.update(V0,W0,q||W)}if(Y0)Y0(o,W0);if(W0.detectedPlanes)$.dispatchEvent({type:"planesdetected",data:W0});z=null}let X8=new ZD;X8.setAnimationLoop(I8),this.setAnimationLoop=function(o){Y0=o},this.dispose=function(){}}}var LJ=new t6,gG=new L8;function pG(J,Q){function $(F,O){if(F.matrixAutoUpdate===!0)F.updateMatrix();O.value.copy(F.matrix)}function Z(F,O){if(O.color.getRGB(F.fogColor.value,KH(J)),O.isFog)F.fogNear.value=O.near,F.fogFar.value=O.far;else if(O.isFogExp2)F.fogDensity.value=O.density}function K(F,O,G,R,B){if(O.isMeshBasicMaterial)W(F,O);else if(O.isMeshLambertMaterial){if(W(F,O),O.envMap)F.envMapIntensity.value=O.envMapIntensity}else if(O.isMeshToonMaterial)W(F,O),U(F,O);else if(O.isMeshPhongMaterial){if(W(F,O),Y(F,O),O.envMap)F.envMapIntensity.value=O.envMapIntensity}else if(O.isMeshStandardMaterial){if(W(F,O),V(F,O),O.isMeshPhysicalMaterial)z(F,O,B)}else if(O.isMeshMatcapMaterial)W(F,O),D(F,O);else if(O.isMeshDepthMaterial)W(F,O);else if(O.isMeshDistanceMaterial)W(F,O),w(F,O);else if(O.isMeshNormalMaterial)W(F,O);else if(O.isLineBasicMaterial){if(X(F,O),O.isLineDashedMaterial)H(F,O)}else if(O.isPointsMaterial)q(F,O,G,R);else if(O.isSpriteMaterial)N(F,O);else if(O.isShadowMaterial)F.color.value.copy(O.color),F.opacity.value=O.opacity;else if(O.isShaderMaterial)O.uniformsNeedUpdate=!1}function W(F,O){if(F.opacity.value=O.opacity,O.color)F.diffuse.value.copy(O.color);if(O.emissive)F.emissive.value.copy(O.emissive).multiplyScalar(O.emissiveIntensity);if(O.map)F.map.value=O.map,$(O.map,F.mapTransform);if(O.alphaMap)F.alphaMap.value=O.alphaMap,$(O.alphaMap,F.alphaMapTransform);if(O.bumpMap){if(F.bumpMap.value=O.bumpMap,$(O.bumpMap,F.bumpMapTransform),F.bumpScale.value=O.bumpScale,O.side===Y6)F.bumpScale.value*=-1}if(O.normalMap){if(F.normalMap.value=O.normalMap,$(O.normalMap,F.normalMapTransform),F.normalScale.value.copy(O.normalScale),O.side===Y6)F.normalScale.value.negate()}if(O.displacementMap)F.displacementMap.value=O.displacementMap,$(O.displacementMap,F.displacementMapTransform),F.displacementScale.value=O.displacementScale,F.displacementBias.value=O.displacementBias;if(O.emissiveMap)F.emissiveMap.value=O.emissiveMap,$(O.emissiveMap,F.emissiveMapTransform);if(O.specularMap)F.specularMap.value=O.specularMap,$(O.specularMap,F.specularMapTransform);if(O.alphaTest>0)F.alphaTest.value=O.alphaTest;let G=Q.get(O),R=G.envMap,B=G.envMapRotation;if(R){if(F.envMap.value=R,LJ.copy(B),LJ.x*=-1,LJ.y*=-1,LJ.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1)LJ.y*=-1,LJ.z*=-1;F.envMapRotation.value.setFromMatrix4(gG.makeRotationFromEuler(LJ)),F.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,F.reflectivity.value=O.reflectivity,F.ior.value=O.ior,F.refractionRatio.value=O.refractionRatio}if(O.lightMap)F.lightMap.value=O.lightMap,F.lightMapIntensity.value=O.lightMapIntensity,$(O.lightMap,F.lightMapTransform);if(O.aoMap)F.aoMap.value=O.aoMap,F.aoMapIntensity.value=O.aoMapIntensity,$(O.aoMap,F.aoMapTransform)}function X(F,O){if(F.diffuse.value.copy(O.color),F.opacity.value=O.opacity,O.map)F.map.value=O.map,$(O.map,F.mapTransform)}function H(F,O){F.dashSize.value=O.dashSize,F.totalSize.value=O.dashSize+O.gapSize,F.scale.value=O.scale}function q(F,O,G,R){if(F.diffuse.value.copy(O.color),F.opacity.value=O.opacity,F.size.value=O.size*G,F.scale.value=R*0.5,O.map)F.map.value=O.map,$(O.map,F.uvTransform);if(O.alphaMap)F.alphaMap.value=O.alphaMap,$(O.alphaMap,F.alphaMapTransform);if(O.alphaTest>0)F.alphaTest.value=O.alphaTest}function N(F,O){if(F.diffuse.value.copy(O.color),F.opacity.value=O.opacity,F.rotation.value=O.rotation,O.map)F.map.value=O.map,$(O.map,F.mapTransform);if(O.alphaMap)F.alphaMap.value=O.alphaMap,$(O.alphaMap,F.alphaMapTransform);if(O.alphaTest>0)F.alphaTest.value=O.alphaTest}function Y(F,O){F.specular.value.copy(O.specular),F.shininess.value=Math.max(O.shininess,0.0001)}function U(F,O){if(O.gradientMap)F.gradientMap.value=O.gradientMap}function V(F,O){if(F.metalness.value=O.metalness,O.metalnessMap)F.metalnessMap.value=O.metalnessMap,$(O.metalnessMap,F.metalnessMapTransform);if(F.roughness.value=O.roughness,O.roughnessMap)F.roughnessMap.value=O.roughnessMap,$(O.roughnessMap,F.roughnessMapTransform);if(O.envMap)F.envMapIntensity.value=O.envMapIntensity}function z(F,O,G){if(F.ior.value=O.ior,O.sheen>0){if(F.sheenColor.value.copy(O.sheenColor).multiplyScalar(O.sheen),F.sheenRoughness.value=O.sheenRoughness,O.sheenColorMap)F.sheenColorMap.value=O.sheenColorMap,$(O.sheenColorMap,F.sheenColorMapTransform);if(O.sheenRoughnessMap)F.sheenRoughnessMap.value=O.sheenRoughnessMap,$(O.sheenRoughnessMap,F.sheenRoughnessMapTransform)}if(O.clearcoat>0){if(F.clearcoat.value=O.clearcoat,F.clearcoatRoughness.value=O.clearcoatRoughness,O.clearcoatMap)F.clearcoatMap.value=O.clearcoatMap,$(O.clearcoatMap,F.clearcoatMapTransform);if(O.clearcoatRoughnessMap)F.clearcoatRoughnessMap.value=O.clearcoatRoughnessMap,$(O.clearcoatRoughnessMap,F.clearcoatRoughnessMapTransform);if(O.clearcoatNormalMap){if(F.clearcoatNormalMap.value=O.clearcoatNormalMap,$(O.clearcoatNormalMap,F.clearcoatNormalMapTransform),F.clearcoatNormalScale.value.copy(O.clearcoatNormalScale),O.side===Y6)F.clearcoatNormalScale.value.negate()}}if(O.dispersion>0)F.dispersion.value=O.dispersion;if(O.iridescence>0){if(F.iridescence.value=O.iridescence,F.iridescenceIOR.value=O.iridescenceIOR,F.iridescenceThicknessMinimum.value=O.iridescenceThicknessRange[0],F.iridescenceThicknessMaximum.value=O.iridescenceThicknessRange[1],O.iridescenceMap)F.iridescenceMap.value=O.iridescenceMap,$(O.iridescenceMap,F.iridescenceMapTransform);if(O.iridescenceThicknessMap)F.iridescenceThicknessMap.value=O.iridescenceThicknessMap,$(O.iridescenceThicknessMap,F.iridescenceThicknessMapTransform)}if(O.transmission>0){if(F.transmission.value=O.transmission,F.transmissionSamplerMap.value=G.texture,F.transmissionSamplerSize.value.set(G.width,G.height),O.transmissionMap)F.transmissionMap.value=O.transmissionMap,$(O.transmissionMap,F.transmissionMapTransform);if(F.thickness.value=O.thickness,O.thicknessMap)F.thicknessMap.value=O.thicknessMap,$(O.thicknessMap,F.thicknessMapTransform);F.attenuationDistance.value=O.attenuationDistance,F.attenuationColor.value.copy(O.attenuationColor)}if(O.anisotropy>0){if(F.anisotropyVector.value.set(O.anisotropy*Math.cos(O.anisotropyRotation),O.anisotropy*Math.sin(O.anisotropyRotation)),O.anisotropyMap)F.anisotropyMap.value=O.anisotropyMap,$(O.anisotropyMap,F.anisotropyMapTransform)}if(F.specularIntensity.value=O.specularIntensity,F.specularColor.value.copy(O.specularColor),O.specularColorMap)F.specularColorMap.value=O.specularColorMap,$(O.specularColorMap,F.specularColorMapTransform);if(O.specularIntensityMap)F.specularIntensityMap.value=O.specularIntensityMap,$(O.specularIntensityMap,F.specularIntensityMapTransform)}function D(F,O){if(O.matcap)F.matcap.value=O.matcap}function w(F,O){let G=Q.get(O).light;F.referencePosition.value.setFromMatrixPosition(G.matrixWorld),F.nearDistance.value=G.shadow.camera.near,F.farDistance.value=G.shadow.camera.far}return{refreshFogUniforms:Z,refreshMaterialUniforms:K}}function mG(J,Q,$,Z){let K={},W={},X=[],H=J.getParameter(J.MAX_UNIFORM_BUFFER_BINDINGS);function q(G,R){let B=R.program;Z.uniformBlockBinding(G,B)}function N(G,R){let B=K[G.id];if(B===void 0)D(G),B=Y(G),K[G.id]=B,G.addEventListener("dispose",F);let y=R.program;Z.updateUBOMapping(G,y);let C=Q.render.frame;if(W[G.id]!==C)V(G),W[G.id]=C}function Y(G){let R=U();G.__bindingPointIndex=R;let B=J.createBuffer(),y=G.__size,C=G.usage;return J.bindBuffer(J.UNIFORM_BUFFER,B),J.bufferData(J.UNIFORM_BUFFER,y,C),J.bindBuffer(J.UNIFORM_BUFFER,null),J.bindBufferBase(J.UNIFORM_BUFFER,R,B),B}function U(){for(let G=0;G<H;G++)if(X.indexOf(G)===-1)return X.push(G),G;return y0("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function V(G){let R=K[G.id],B=G.uniforms,y=G.__cache;J.bindBuffer(J.UNIFORM_BUFFER,R);for(let C=0,j=B.length;C<j;C++){let M=Array.isArray(B[C])?B[C]:[B[C]];for(let E=0,u=M.length;E<u;E++){let _=M[E];if(z(_,C,E,y)===!0){let p=_.__offset,n=Array.isArray(_.value)?_.value:[_.value],f=0;for(let i=0;i<n.length;i++){let d=n[i],m=w(d);if(typeof d==="number"||typeof d==="boolean")_.__data[0]=d,J.bufferSubData(J.UNIFORM_BUFFER,p+f,_.__data);else if(d.isMatrix3)_.__data[0]=d.elements[0],_.__data[1]=d.elements[1],_.__data[2]=d.elements[2],_.__data[3]=0,_.__data[4]=d.elements[3],_.__data[5]=d.elements[4],_.__data[6]=d.elements[5],_.__data[7]=0,_.__data[8]=d.elements[6],_.__data[9]=d.elements[7],_.__data[10]=d.elements[8],_.__data[11]=0;else d.toArray(_.__data,f),f+=m.storage/Float32Array.BYTES_PER_ELEMENT}J.bufferSubData(J.UNIFORM_BUFFER,p,_.__data)}}}J.bindBuffer(J.UNIFORM_BUFFER,null)}function z(G,R,B,y){let C=G.value,j=R+"_"+B;if(y[j]===void 0){if(typeof C==="number"||typeof C==="boolean")y[j]=C;else y[j]=C.clone();return!0}else{let M=y[j];if(typeof C==="number"||typeof C==="boolean"){if(M!==C)return y[j]=C,!0}else if(M.equals(C)===!1)return M.copy(C),!0}return!1}function D(G){let R=G.uniforms,B=0,y=16;for(let j=0,M=R.length;j<M;j++){let E=Array.isArray(R[j])?R[j]:[R[j]];for(let u=0,_=E.length;u<_;u++){let p=E[u],n=Array.isArray(p.value)?p.value:[p.value];for(let f=0,i=n.length;f<i;f++){let d=n[f],m=w(d),J0=B%y,Q0=J0%m.boundary,U0=J0+Q0;if(B+=Q0,U0!==0&&y-U0<m.storage)B+=y-U0;p.__data=new Float32Array(m.storage/Float32Array.BYTES_PER_ELEMENT),p.__offset=B,B+=m.storage}}}let C=B%y;if(C>0)B+=y-C;return G.__size=B,G.__cache={},this}function w(G){let R={boundary:0,storage:0};if(typeof G==="number"||typeof G==="boolean")R.boundary=4,R.storage=4;else if(G.isVector2)R.boundary=8,R.storage=8;else if(G.isVector3||G.isColor)R.boundary=16,R.storage=12;else if(G.isVector4)R.boundary=16,R.storage=16;else if(G.isMatrix3)R.boundary=48,R.storage=48;else if(G.isMatrix4)R.boundary=64,R.storage=64;else if(G.isTexture)b0("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else b0("WebGLRenderer: Unsupported uniform value type.",G);return R}function F(G){let R=G.target;R.removeEventListener("dispose",F);let B=X.indexOf(R.__bindingPointIndex);X.splice(B,1),J.deleteBuffer(K[R.id]),delete K[R.id],delete W[R.id]}function O(){for(let G in K)J.deleteBuffer(K[G]);X=[],K={},W={}}return{bind:q,update:N,dispose:O}}var dG=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),$7=null;function lG(){if($7===null)$7=new $H(dG,16,16,D9,I7),$7.name="DFG_LUT",$7.minFilter=U6,$7.magFilter=U6,$7.wrapS=vZ,$7.wrapT=vZ,$7.generateMipmaps=!1,$7.needsUpdate=!0;return $7}class yH{constructor(J={}){let{canvas:Q=Az(),context:$=null,depth:Z=!0,stencil:K=!1,alpha:W=!1,antialias:X=!1,premultipliedAlpha:H=!0,preserveDrawingBuffer:q=!1,powerPreference:N="default",failIfMajorPerformanceCaveat:Y=!1,reversedDepthBuffer:U=!1,outputBufferType:V=c6}=J;this.isWebGLRenderer=!0;let z;if($!==null){if(typeof WebGLRenderingContext<"u"&&$ instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");z=$.getContextAttributes().alpha}else z=W;let D=V,w=new Set([DX,zX,FX]),F=new Set([c6,d7,FQ,z9,VX,OX]),O=new Uint32Array(4),G=new Int32Array(4),R=null,B=null,y=[],C=[],j=null;this.domElement=Q,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=l6,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,E=!1;this._outputColorSpace=Mz;let u=0,_=0,p=null,n=-1,f=null,i=new A8,d=new A8,m=null,J0=new l0(0),Q0=0,U0=Q.width,_0=Q.height,Y0=1,I8=null,X8=null,o=new A8(0,0,U0,_0),W0=new A8(0,0,U0,_0),z0=!1,V0=new IQ,S0=!1,r0=!1,t0=new L8,e0=new g,K8=new A8,U8={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},c0=!1;function S8(){return p===null?Y0:1}let P=$;function m8(I,T){return Q.getContext(I,T)}try{let I={alpha:!0,depth:Z,stencil:K,antialias:X,premultipliedAlpha:H,preserveDrawingBuffer:q,powerPreference:N,failIfMajorPerformanceCaveat:Y};if("setAttribute"in Q)Q.setAttribute("data-engine",`three.js r${CF}`);if(Q.addEventListener("webglcontextlost",r,!1),Q.addEventListener("webglcontextrestored",I0,!1),Q.addEventListener("webglcontextcreationerror",f0,!1),P===null){if(P=m8("webgl2",I),P===null)if(m8("webgl2"))throw Error("Error creating WebGL context with your selected attributes.");else throw Error("Error creating WebGL context.")}}catch(I){throw y0("WebGLRenderer: "+I.message),I}let p0,w8,A0,D8,L,k,v,s,t,c,D0,X0,E0,T0,e,$0,w0,j0,O0,m0,S,Z0,K0;function M0(){if(p0=new r2(P),p0.init(),S=new fG(P,p0),w8=new l2(P,p0,J,S),A0=new bG(P,p0),w8.reversedDepthBuffer&&U)A0.buffers.depth.setReversed(!0);D8=new JL(P),L=new IG,k=new vG(P,p0,A0,L,w8,S,D8),v=new a2(M),s=new Ww(P),Z0=new m2(P,s),t=new t2(P,s,D8,Z0),c=new $L(P,t,s,Z0,D8),j0=new QL(P,w8,k),e=new c2(L),D0=new wG(M,v,p0,w8,Z0,e),X0=new pG(M,L),E0=new GG,T0=new EG(p0),w0=new p2(M,v,A0,c,z,H),$0=new yG(M,c,w8),K0=new mG(P,D8,w8,A0),O0=new d2(P,p0,D8),m0=new e2(P,p0,D8),D8.programs=D0.programs,M.capabilities=w8,M.extensions=p0,M.properties=L,M.renderLists=E0,M.shadowMap=$0,M.state=A0,M.info=D8}if(M0(),D!==c6)j=new KL(D,Q.width,Q.height,Z,K);let a=new FD(M,P);this.xr=a,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let I=p0.get("WEBGL_lose_context");if(I)I.loseContext()},this.forceContextRestore=function(){let I=p0.get("WEBGL_lose_context");if(I)I.restoreContext()},this.getPixelRatio=function(){return Y0},this.setPixelRatio=function(I){if(I===void 0)return;Y0=I,this.setSize(U0,_0,!1)},this.getSize=function(I){return I.set(U0,_0)},this.setSize=function(I,T,l=!0){if(a.isPresenting){b0("WebGLRenderer: Can't change size while VR device is presenting.");return}if(U0=I,_0=T,Q.width=Math.floor(I*Y0),Q.height=Math.floor(T*Y0),l===!0)Q.style.width=I+"px",Q.style.height=T+"px";if(j!==null)j.setSize(Q.width,Q.height);this.setViewport(0,0,I,T)},this.getDrawingBufferSize=function(I){return I.set(U0*Y0,_0*Y0).floor()},this.setDrawingBufferSize=function(I,T,l){U0=I,_0=T,Y0=l,Q.width=Math.floor(I*l),Q.height=Math.floor(T*l),this.setViewport(0,0,I,T)},this.setEffects=function(I){if(D===c6){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(I){for(let T=0;T<I.length;T++)if(I[T].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}j.setEffects(I||[])},this.getCurrentViewport=function(I){return I.copy(i)},this.getViewport=function(I){return I.copy(o)},this.setViewport=function(I,T,l,x){if(I.isVector4)o.set(I.x,I.y,I.z,I.w);else o.set(I,T,l,x);A0.viewport(i.copy(o).multiplyScalar(Y0).round())},this.getScissor=function(I){return I.copy(W0)},this.setScissor=function(I,T,l,x){if(I.isVector4)W0.set(I.x,I.y,I.z,I.w);else W0.set(I,T,l,x);A0.scissor(d.copy(W0).multiplyScalar(Y0).round())},this.getScissorTest=function(){return z0},this.setScissorTest=function(I){A0.setScissorTest(z0=I)},this.setOpaqueSort=function(I){I8=I},this.setTransparentSort=function(I){X8=I},this.getClearColor=function(I){return I.copy(w0.getClearColor())},this.setClearColor=function(){w0.setClearColor(...arguments)},this.getClearAlpha=function(){return w0.getClearAlpha()},this.setClearAlpha=function(){w0.setClearAlpha(...arguments)},this.clear=function(I=!0,T=!0,l=!0){let x=0;if(I){let h=!1;if(p!==null){let q0=p.texture.format;h=w.has(q0)}if(h){let q0=p.texture.type,F0=F.has(q0),N0=w0.getClearColor(),L0=w0.getClearAlpha(),B0=N0.r,h0=N0.g,d0=N0.b;if(F0)O[0]=B0,O[1]=h0,O[2]=d0,O[3]=L0,P.clearBufferuiv(P.COLOR,0,O);else G[0]=B0,G[1]=h0,G[2]=d0,G[3]=L0,P.clearBufferiv(P.COLOR,0,G)}else x|=P.COLOR_BUFFER_BIT}if(T)x|=P.DEPTH_BUFFER_BIT;if(l)x|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(x!==0)P.clear(x)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){Q.removeEventListener("webglcontextlost",r,!1),Q.removeEventListener("webglcontextrestored",I0,!1),Q.removeEventListener("webglcontextcreationerror",f0,!1),w0.dispose(),E0.dispose(),T0.dispose(),L.dispose(),v.dispose(),c.dispose(),Z0.dispose(),K0.dispose(),D0.dispose(),a.dispose(),a.removeEventListener("sessionstart",hH),a.removeEventListener("sessionend",xH),u7.stop()};function r(I){I.preventDefault(),tX("WebGLRenderer: Context Lost."),E=!0}function I0(){tX("WebGLRenderer: Context Restored."),E=!1;let I=D8.autoReset,T=$0.enabled,l=$0.autoUpdate,x=$0.needsUpdate,h=$0.type;M0(),D8.autoReset=I,$0.enabled=T,$0.autoUpdate=l,$0.needsUpdate=x,$0.type=h}function f0(I){y0("WebGLRenderer: A WebGL context could not be created. Reason: ",I.statusMessage)}function k8(I){let T=I.target;T.removeEventListener("dispose",k8),H8(T)}function H8(I){K7(I),L.remove(I)}function K7(I){let T=L.get(I).programs;if(T!==void 0){if(T.forEach(function(l){D0.releaseProgram(l)}),I.isShaderMaterial)D0.releaseShaderCache(I)}}this.renderBufferDirect=function(I,T,l,x,h,q0){if(T===null)T=U8;let F0=h.isMesh&&h.matrixWorld.determinant()<0,N0=wD(I,T,l,x,h);A0.setMaterial(x,F0);let L0=l.index,B0=1;if(x.wireframe===!0){if(L0=t.getWireframeAttribute(l),L0===void 0)return;B0=2}let h0=l.drawRange,d0=l.attributes.position,C0=h0.start*B0,q8=(h0.start+h0.count)*B0;if(q0!==null)C0=Math.max(C0,q0.start*B0),q8=Math.min(q8,(q0.start+q0.count)*B0);if(L0!==null)C0=Math.max(C0,0),q8=Math.min(q8,L0.count);else if(d0!==void 0&&d0!==null)C0=Math.max(C0,0),q8=Math.min(q8,d0.count);let P8=q8-C0;if(P8<0||P8===1/0)return;Z0.setup(h,x,N0,l,L0);let C8,N8=O0;if(L0!==null)C8=s.get(L0),N8=m0,N8.setIndex(C8);if(h.isMesh)if(x.wireframe===!0)A0.setLineWidth(x.wireframeLinewidth*S8()),N8.setMode(P.LINES);else N8.setMode(P.TRIANGLES);else if(h.isLine){let c8=x.linewidth;if(c8===void 0)c8=1;if(A0.setLineWidth(c8*S8()),h.isLineSegments)N8.setMode(P.LINES);else if(h.isLineLoop)N8.setMode(P.LINE_LOOP);else N8.setMode(P.LINE_STRIP)}else if(h.isPoints)N8.setMode(P.POINTS);else if(h.isSprite)N8.setMode(P.TRIANGLES);if(h.isBatchedMesh)if(h._multiDrawInstances!==null)NQ("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),N8.renderMultiDrawInstances(h._multiDrawStarts,h._multiDrawCounts,h._multiDrawCount,h._multiDrawInstances);else if(!p0.get("WEBGL_multi_draw")){let{_multiDrawStarts:c8,_multiDrawCounts:G0,_multiDrawCount:V6}=h,J8=L0?s.get(L0).bytesPerElement:1,y6=L.get(x).currentProgram.getUniforms();for(let n6=0;n6<V6;n6++)y6.setValue(P,"_gl_DrawID",n6),N8.render(c8[n6]/J8,G0[n6])}else N8.renderMultiDraw(h._multiDrawStarts,h._multiDrawCounts,h._multiDrawCount);else if(h.isInstancedMesh)N8.renderInstances(C0,P8,h.count);else if(l.isInstancedBufferGeometry){let c8=l._maxInstanceCount!==void 0?l._maxInstanceCount:1/0,G0=Math.min(l.instanceCount,c8);N8.renderInstances(C0,P8,G0)}else N8.render(C0,P8)};function s6(I,T,l){if(I.transparent===!0&&I.side===e6&&I.forceSinglePass===!1)I.side=Y6,I.needsUpdate=!0,PQ(I,T,l),I.side=V9,I.needsUpdate=!0,PQ(I,T,l),I.side=e6;else PQ(I,T,l)}this.compile=function(I,T,l=null){if(l===null)l=I;if(B=T0.get(l),B.init(T),C.push(B),l.traverseVisible(function(h){if(h.isLight&&h.layers.test(T.layers)){if(B.pushLight(h),h.castShadow)B.pushShadow(h)}}),I!==l)I.traverseVisible(function(h){if(h.isLight&&h.layers.test(T.layers)){if(B.pushLight(h),h.castShadow)B.pushShadow(h)}});B.setupLights();let x=new Set;return I.traverse(function(h){if(!(h.isMesh||h.isPoints||h.isLine||h.isSprite))return;let q0=h.material;if(q0)if(Array.isArray(q0))for(let F0=0;F0<q0.length;F0++){let N0=q0[F0];s6(N0,l,h),x.add(N0)}else s6(q0,l,h),x.add(q0)}),B=C.pop(),x},this.compileAsync=function(I,T,l=null){let x=this.compile(I,T,l);return new Promise((h)=>{function q0(){if(x.forEach(function(F0){if(L.get(F0).currentProgram.isReady())x.delete(F0)}),x.size===0){h(I);return}setTimeout(q0,10)}if(p0.get("KHR_parallel_shader_compile")!==null)q0();else setTimeout(q0,10)})};let UK=null;function MD(I){if(UK)UK(I)}function hH(){u7.stop()}function xH(){u7.start()}let u7=new ZD;if(u7.setAnimationLoop(MD),typeof self<"u")u7.setContext(self);this.setAnimationLoop=function(I){UK=I,a.setAnimationLoop(I),I===null?u7.stop():u7.start()},a.addEventListener("sessionstart",hH),a.addEventListener("sessionend",xH),this.render=function(I,T){if(T!==void 0&&T.isCamera!==!0){y0("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;let l=a.enabled===!0&&a.isPresenting===!0,x=j!==null&&(p===null||l)&&j.begin(M,p);if(I.matrixWorldAutoUpdate===!0)I.updateMatrixWorld();if(T.parent===null&&T.matrixWorldAutoUpdate===!0)T.updateMatrixWorld();if(a.enabled===!0&&a.isPresenting===!0&&(j===null||j.isCompositing()===!1)){if(a.cameraAutoUpdate===!0)a.updateCamera(T);T=a.getCamera()}if(I.isScene===!0)I.onBeforeRender(M,I,T,p);if(B=T0.get(I,C.length),B.init(T),C.push(B),t0.multiplyMatrices(T.projectionMatrix,T.matrixWorldInverse),V0.setFromProjectionMatrix(t0,rX,T.reversedDepth),r0=this.localClippingEnabled,S0=e.init(this.clippingPlanes,r0),R=E0.get(I,y.length),R.init(),y.push(R),a.enabled===!0&&a.isPresenting===!0){let F0=M.xr.getDepthSensingMesh();if(F0!==null)VK(F0,T,-1/0,M.sortObjects)}if(VK(I,T,0,M.sortObjects),R.finish(),M.sortObjects===!0)R.sort(I8,X8);if(c0=a.enabled===!1||a.isPresenting===!1||a.hasDepthSensing()===!1,c0)w0.addToRenderList(R,I);if(this.info.render.frame++,S0===!0)e.beginShadows();let h=B.state.shadowsArray;if($0.render(h,I,T),S0===!0)e.endShadows();if(this.info.autoReset===!0)this.info.reset();if((x&&j.hasRenderPass())===!1){let{opaque:F0,transmissive:N0}=R;if(B.setupLights(),T.isArrayCamera){let L0=T.cameras;if(N0.length>0)for(let B0=0,h0=L0.length;B0<h0;B0++){let d0=L0[B0];pH(F0,N0,I,d0)}if(c0)w0.render(I);for(let B0=0,h0=L0.length;B0<h0;B0++){let d0=L0[B0];gH(R,I,d0,d0.viewport)}}else{if(N0.length>0)pH(F0,N0,I,T);if(c0)w0.render(I);gH(R,I,T)}}if(p!==null&&_===0)k.updateMultisampleRenderTarget(p),k.updateRenderTargetMipmap(p);if(x)j.end(M);if(I.isScene===!0)I.onAfterRender(M,I,T);if(Z0.resetDefaultState(),n=-1,f=null,C.pop(),C.length>0){if(B=C[C.length-1],S0===!0)e.setGlobalState(M.clippingPlanes,B.state.camera)}else B=null;if(y.pop(),y.length>0)R=y[y.length-1];else R=null};function VK(I,T,l,x){if(I.visible===!1)return;if(I.layers.test(T.layers)){if(I.isGroup)l=I.renderOrder;else if(I.isLOD){if(I.autoUpdate===!0)I.update(T)}else if(I.isLight){if(B.pushLight(I),I.castShadow)B.pushShadow(I)}else if(I.isSprite){if(!I.frustumCulled||V0.intersectsSprite(I)){if(x)K8.setFromMatrixPosition(I.matrixWorld).applyMatrix4(t0);let F0=c.update(I),N0=I.material;if(N0.visible)R.push(I,F0,N0,l,K8.z,null)}}else if(I.isMesh||I.isLine||I.isPoints){if(!I.frustumCulled||V0.intersectsObject(I)){let F0=c.update(I),N0=I.material;if(x){if(I.boundingSphere!==void 0){if(I.boundingSphere===null)I.computeBoundingSphere();K8.copy(I.boundingSphere.center)}else{if(F0.boundingSphere===null)F0.computeBoundingSphere();K8.copy(F0.boundingSphere.center)}K8.applyMatrix4(I.matrixWorld).applyMatrix4(t0)}if(Array.isArray(N0)){let L0=F0.groups;for(let B0=0,h0=L0.length;B0<h0;B0++){let d0=L0[B0],C0=N0[d0.materialIndex];if(C0&&C0.visible)R.push(I,F0,C0,l,K8.z,d0)}}else if(N0.visible)R.push(I,F0,N0,l,K8.z,null)}}}let q0=I.children;for(let F0=0,N0=q0.length;F0<N0;F0++)VK(q0[F0],T,l,x)}function gH(I,T,l,x){let{opaque:h,transmissive:q0,transparent:F0}=I;if(B.setupLightsView(l),S0===!0)e.setGlobalState(M.clippingPlanes,l);if(x)A0.viewport(i.copy(x));if(h.length>0)EQ(h,T,l);if(q0.length>0)EQ(q0,T,l);if(F0.length>0)EQ(F0,T,l);A0.buffers.depth.setTest(!0),A0.buffers.depth.setMask(!0),A0.buffers.color.setMask(!0),A0.setPolygonOffset(!1)}function pH(I,T,l,x){if((l.isScene===!0?l.overrideMaterial:null)!==null)return;if(B.state.transmissionRenderTarget[x.id]===void 0){let C0=p0.has("EXT_color_buffer_half_float")||p0.has("EXT_color_buffer_float");B.state.transmissionRenderTarget[x.id]=new j6(1,1,{generateMipmaps:!0,type:C0?I7:c6,minFilter:YJ,samples:Math.max(4,w8.samples),stencilBuffer:K,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:a0.workingColorSpace})}let q0=B.state.transmissionRenderTarget[x.id],F0=x.viewport||i;q0.setSize(F0.z*M.transmissionResolutionScale,F0.w*M.transmissionResolutionScale);let N0=M.getRenderTarget(),L0=M.getActiveCubeFace(),B0=M.getActiveMipmapLevel();if(M.setRenderTarget(q0),M.getClearColor(J0),Q0=M.getClearAlpha(),Q0<1)M.setClearColor(16777215,0.5);if(M.clear(),c0)w0.render(l);let h0=M.toneMapping;M.toneMapping=l6;let d0=x.viewport;if(x.viewport!==void 0)x.viewport=void 0;if(B.setupLightsView(x),S0===!0)e.setGlobalState(M.clippingPlanes,x);if(EQ(I,l,x),k.updateMultisampleRenderTarget(q0),k.updateRenderTargetMipmap(q0),p0.has("WEBGL_multisampled_render_to_texture")===!1){let C0=!1;for(let q8=0,P8=T.length;q8<P8;q8++){let C8=T[q8],{object:N8,geometry:c8,material:G0,group:V6}=C8;if(G0.side===e6&&N8.layers.test(x.layers)){let J8=G0.side;G0.side=Y6,G0.needsUpdate=!0,mH(N8,l,x,c8,G0,V6),G0.side=J8,G0.needsUpdate=!0,C0=!0}}if(C0===!0)k.updateMultisampleRenderTarget(q0),k.updateRenderTargetMipmap(q0)}if(M.setRenderTarget(N0,L0,B0),M.setClearColor(J0,Q0),d0!==void 0)x.viewport=d0;M.toneMapping=h0}function EQ(I,T,l){let x=T.isScene===!0?T.overrideMaterial:null;for(let h=0,q0=I.length;h<q0;h++){let F0=I[h],{object:N0,geometry:L0,group:B0}=F0,h0=F0.material;if(h0.allowOverride===!0&&x!==null)h0=x;if(N0.layers.test(l.layers))mH(N0,T,l,L0,h0,B0)}}function mH(I,T,l,x,h,q0){if(I.onBeforeRender(M,T,l,x,h,q0),I.modelViewMatrix.multiplyMatrices(l.matrixWorldInverse,I.matrixWorld),I.normalMatrix.getNormalMatrix(I.modelViewMatrix),h.onBeforeRender(M,T,l,x,I,q0),h.transparent===!0&&h.side===e6&&h.forceSinglePass===!1)h.side=Y6,h.needsUpdate=!0,M.renderBufferDirect(l,T,x,h,I,q0),h.side=V9,h.needsUpdate=!0,M.renderBufferDirect(l,T,x,h,I,q0),h.side=e6;else M.renderBufferDirect(l,T,x,h,I,q0);I.onAfterRender(M,T,l,x,h,q0)}function PQ(I,T,l){if(T.isScene!==!0)T=U8;let x=L.get(I),h=B.state.lights,q0=B.state.shadowsArray,F0=h.state.version,N0=D0.getParameters(I,h.state,q0,T,l),L0=D0.getProgramCacheKey(N0),B0=x.programs;x.environment=I.isMeshStandardMaterial||I.isMeshLambertMaterial||I.isMeshPhongMaterial?T.environment:null,x.fog=T.fog;let h0=I.isMeshStandardMaterial||I.isMeshLambertMaterial&&!I.envMap||I.isMeshPhongMaterial&&!I.envMap;if(x.envMap=v.get(I.envMap||x.environment,h0),x.envMapRotation=x.environment!==null&&I.envMap===null?T.environmentRotation:I.envMapRotation,B0===void 0)I.addEventListener("dispose",k8),B0=new Map,x.programs=B0;let d0=B0.get(L0);if(d0!==void 0){if(x.currentProgram===d0&&x.lightsStateVersion===F0)return lH(I,N0),d0}else N0.uniforms=D0.getUniforms(I),I.onBeforeCompile(N0,M),d0=D0.acquireProgram(N0,L0),B0.set(L0,d0),x.uniforms=N0.uniforms;let C0=x.uniforms;if(!I.isShaderMaterial&&!I.isRawShaderMaterial||I.clipping===!0)C0.clippingPlanes=e.uniform;if(lH(I,N0),x.needsLights=LD(I),x.lightsStateVersion=F0,x.needsLights)C0.ambientLightColor.value=h.state.ambient,C0.lightProbe.value=h.state.probe,C0.directionalLights.value=h.state.directional,C0.directionalLightShadows.value=h.state.directionalShadow,C0.spotLights.value=h.state.spot,C0.spotLightShadows.value=h.state.spotShadow,C0.rectAreaLights.value=h.state.rectArea,C0.ltc_1.value=h.state.rectAreaLTC1,C0.ltc_2.value=h.state.rectAreaLTC2,C0.pointLights.value=h.state.point,C0.pointLightShadows.value=h.state.pointShadow,C0.hemisphereLights.value=h.state.hemi,C0.directionalShadowMatrix.value=h.state.directionalShadowMatrix,C0.spotLightMatrix.value=h.state.spotLightMatrix,C0.spotLightMap.value=h.state.spotLightMap,C0.pointShadowMatrix.value=h.state.pointShadowMatrix;return x.currentProgram=d0,x.uniformsList=null,d0}function dH(I){if(I.uniformsList===null){let T=I.currentProgram.getUniforms();I.uniformsList=CQ.seqWithValue(T.seq,I.uniforms)}return I.uniformsList}function lH(I,T){let l=L.get(I);l.outputColorSpace=T.outputColorSpace,l.batching=T.batching,l.batchingColor=T.batchingColor,l.instancing=T.instancing,l.instancingColor=T.instancingColor,l.instancingMorph=T.instancingMorph,l.skinning=T.skinning,l.morphTargets=T.morphTargets,l.morphNormals=T.morphNormals,l.morphColors=T.morphColors,l.morphTargetsCount=T.morphTargetsCount,l.numClippingPlanes=T.numClippingPlanes,l.numIntersection=T.numClipIntersection,l.vertexAlphas=T.vertexAlphas,l.vertexTangents=T.vertexTangents,l.toneMapping=T.toneMapping}function wD(I,T,l,x,h){if(T.isScene!==!0)T=U8;k.resetTextureUnits();let q0=T.fog,F0=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?T.environment:null,N0=p===null?M.outputColorSpace:p.isXRRenderTarget===!0?p.texture.colorSpace:zQ,L0=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,B0=v.get(x.envMap||F0,L0),h0=x.vertexColors===!0&&!!l.attributes.color&&l.attributes.color.itemSize===4,d0=!!l.attributes.tangent&&(!!x.normalMap||x.anisotropy>0),C0=!!l.morphAttributes.position,q8=!!l.morphAttributes.normal,P8=!!l.morphAttributes.color,C8=l6;if(x.toneMapped){if(p===null||p.isXRRenderTarget===!0)C8=M.toneMapping}let N8=l.morphAttributes.position||l.morphAttributes.normal||l.morphAttributes.color,c8=N8!==void 0?N8.length:0,G0=L.get(x),V6=B.state.lights;if(S0===!0){if(r0===!0||I!==f){let f8=I===f&&x.id===n;e.setState(x,I,f8)}}let J8=!1;if(x.version===G0.__version){if(G0.needsLights&&G0.lightsStateVersion!==V6.state.version)J8=!0;else if(G0.outputColorSpace!==N0)J8=!0;else if(h.isBatchedMesh&&G0.batching===!1)J8=!0;else if(!h.isBatchedMesh&&G0.batching===!0)J8=!0;else if(h.isBatchedMesh&&G0.batchingColor===!0&&h.colorTexture===null)J8=!0;else if(h.isBatchedMesh&&G0.batchingColor===!1&&h.colorTexture!==null)J8=!0;else if(h.isInstancedMesh&&G0.instancing===!1)J8=!0;else if(!h.isInstancedMesh&&G0.instancing===!0)J8=!0;else if(h.isSkinnedMesh&&G0.skinning===!1)J8=!0;else if(!h.isSkinnedMesh&&G0.skinning===!0)J8=!0;else if(h.isInstancedMesh&&G0.instancingColor===!0&&h.instanceColor===null)J8=!0;else if(h.isInstancedMesh&&G0.instancingColor===!1&&h.instanceColor!==null)J8=!0;else if(h.isInstancedMesh&&G0.instancingMorph===!0&&h.morphTexture===null)J8=!0;else if(h.isInstancedMesh&&G0.instancingMorph===!1&&h.morphTexture!==null)J8=!0;else if(G0.envMap!==B0)J8=!0;else if(x.fog===!0&&G0.fog!==q0)J8=!0;else if(G0.numClippingPlanes!==void 0&&(G0.numClippingPlanes!==e.numPlanes||G0.numIntersection!==e.numIntersection))J8=!0;else if(G0.vertexAlphas!==h0)J8=!0;else if(G0.vertexTangents!==d0)J8=!0;else if(G0.morphTargets!==C0)J8=!0;else if(G0.morphNormals!==q8)J8=!0;else if(G0.morphColors!==P8)J8=!0;else if(G0.toneMapping!==C8)J8=!0;else if(G0.morphTargetsCount!==c8)J8=!0}else J8=!0,G0.__version=x.version;let y6=G0.currentProgram;if(J8===!0)y6=PQ(x,T,h);let n6=!1,s7=!1,BJ=!1,V8=y6.getUniforms(),d8=G0.uniforms;if(A0.useProgram(y6.program))n6=!0,s7=!0,BJ=!0;if(x.id!==n)n=x.id,s7=!0;if(n6||f!==I){if(A0.buffers.depth.getReversed()&&I.reversedDepth!==!0)I._reversedDepth=!0,I.updateProjectionMatrix();V8.setValue(P,"projectionMatrix",I.projectionMatrix),V8.setValue(P,"viewMatrix",I.matrixWorldInverse);let R7=V8.map.cameraPosition;if(R7!==void 0)R7.setValue(P,e0.setFromMatrixPosition(I.matrixWorld));if(w8.logarithmicDepthBuffer)V8.setValue(P,"logDepthBufFC",2/(Math.log(I.far+1)/Math.LN2));if(x.isMeshPhongMaterial||x.isMeshToonMaterial||x.isMeshLambertMaterial||x.isMeshBasicMaterial||x.isMeshStandardMaterial||x.isShaderMaterial)V8.setValue(P,"isOrthographic",I.isOrthographicCamera===!0);if(f!==I)f=I,s7=!0,BJ=!0}if(G0.needsLights){if(V6.state.directionalShadowMap.length>0)V8.setValue(P,"directionalShadowMap",V6.state.directionalShadowMap,k);if(V6.state.spotShadowMap.length>0)V8.setValue(P,"spotShadowMap",V6.state.spotShadowMap,k);if(V6.state.pointShadowMap.length>0)V8.setValue(P,"pointShadowMap",V6.state.pointShadowMap,k)}if(h.isSkinnedMesh){V8.setOptional(P,h,"bindMatrix"),V8.setOptional(P,h,"bindMatrixInverse");let f8=h.skeleton;if(f8){if(f8.boneTexture===null)f8.computeBoneTexture();V8.setValue(P,"boneTexture",f8.boneTexture,k)}}if(h.isBatchedMesh){if(V8.setOptional(P,h,"batchingTexture"),V8.setValue(P,"batchingTexture",h._matricesTexture,k),V8.setOptional(P,h,"batchingIdTexture"),V8.setValue(P,"batchingIdTexture",h._indirectTexture,k),V8.setOptional(P,h,"batchingColorTexture"),h._colorsTexture!==null)V8.setValue(P,"batchingColorTexture",h._colorsTexture,k)}let B7=l.morphAttributes;if(B7.position!==void 0||B7.normal!==void 0||B7.color!==void 0)j0.update(h,l,y6);if(s7||G0.receiveShadow!==h.receiveShadow)G0.receiveShadow=h.receiveShadow,V8.setValue(P,"receiveShadow",h.receiveShadow);if((x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial)&&x.envMap===null&&T.environment!==null)d8.envMapIntensity.value=T.environmentIntensity;if(d8.dfgLUT!==void 0)d8.dfgLUT.value=lG();if(s7){if(V8.setValue(P,"toneMappingExposure",M.toneMappingExposure),G0.needsLights)ID(d8,BJ);if(q0&&x.fog===!0)X0.refreshFogUniforms(d8,q0);X0.refreshMaterialUniforms(d8,x,Y0,_0,B.state.transmissionRenderTarget[I.id]),CQ.upload(P,dH(G0),d8,k)}if(x.isShaderMaterial&&x.uniformsNeedUpdate===!0)CQ.upload(P,dH(G0),d8,k),x.uniformsNeedUpdate=!1;if(x.isSpriteMaterial)V8.setValue(P,"center",h.center);if(V8.setValue(P,"modelViewMatrix",h.modelViewMatrix),V8.setValue(P,"normalMatrix",h.normalMatrix),V8.setValue(P,"modelMatrix",h.matrixWorld),x.isShaderMaterial||x.isRawShaderMaterial){let f8=x.uniformsGroups;for(let R7=0,RJ=f8.length;R7<RJ;R7++){let cH=f8[R7];K0.update(cH,y6),K0.bind(cH,y6)}}return y6}function ID(I,T){I.ambientLightColor.needsUpdate=T,I.lightProbe.needsUpdate=T,I.directionalLights.needsUpdate=T,I.directionalLightShadows.needsUpdate=T,I.pointLights.needsUpdate=T,I.pointLightShadows.needsUpdate=T,I.spotLights.needsUpdate=T,I.spotLightShadows.needsUpdate=T,I.rectAreaLights.needsUpdate=T,I.hemisphereLights.needsUpdate=T}function LD(I){return I.isMeshLambertMaterial||I.isMeshToonMaterial||I.isMeshPhongMaterial||I.isMeshStandardMaterial||I.isShadowMaterial||I.isShaderMaterial&&I.lights===!0}this.getActiveCubeFace=function(){return u},this.getActiveMipmapLevel=function(){return _},this.getRenderTarget=function(){return p},this.setRenderTargetTextures=function(I,T,l){let x=L.get(I);if(x.__autoAllocateDepthBuffer=I.resolveDepthBuffer===!1,x.__autoAllocateDepthBuffer===!1)x.__useRenderToTexture=!1;L.get(I.texture).__webglTexture=T,L.get(I.depthTexture).__webglTexture=x.__autoAllocateDepthBuffer?void 0:l,x.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(I,T){let l=L.get(I);l.__webglFramebuffer=T,l.__useDefaultFramebuffer=T===void 0};let GD=P.createFramebuffer();this.setRenderTarget=function(I,T=0,l=0){p=I,u=T,_=l;let x=null,h=!1,q0=!1;if(I){let N0=L.get(I);if(N0.__useDefaultFramebuffer!==void 0){A0.bindFramebuffer(P.FRAMEBUFFER,N0.__webglFramebuffer),i.copy(I.viewport),d.copy(I.scissor),m=I.scissorTest,A0.viewport(i),A0.scissor(d),A0.setScissorTest(m),n=-1;return}else if(N0.__webglFramebuffer===void 0)k.setupRenderTarget(I);else if(N0.__hasExternalTextures)k.rebindTextures(I,L.get(I.texture).__webglTexture,L.get(I.depthTexture).__webglTexture);else if(I.depthBuffer){let h0=I.depthTexture;if(N0.__boundDepthTexture!==h0){if(h0!==null&&L.has(h0)&&(I.width!==h0.image.width||I.height!==h0.image.height))throw Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");k.setupDepthRenderbuffer(I)}}let L0=I.texture;if(L0.isData3DTexture||L0.isDataArrayTexture||L0.isCompressedArrayTexture)q0=!0;let B0=L.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget){if(Array.isArray(B0[T]))x=B0[T][l];else x=B0[T];h=!0}else if(I.samples>0&&k.useMultisampledRTT(I)===!1)x=L.get(I).__webglMultisampledFramebuffer;else if(Array.isArray(B0))x=B0[l];else x=B0;i.copy(I.viewport),d.copy(I.scissor),m=I.scissorTest}else i.copy(o).multiplyScalar(Y0).floor(),d.copy(W0).multiplyScalar(Y0).floor(),m=z0;if(l!==0)x=GD;if(A0.bindFramebuffer(P.FRAMEBUFFER,x))A0.drawBuffers(I,x);if(A0.viewport(i),A0.scissor(d),A0.setScissorTest(m),h){let N0=L.get(I.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+T,N0.__webglTexture,l)}else if(q0){let N0=T;for(let L0=0;L0<I.textures.length;L0++){let B0=L.get(I.textures[L0]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+L0,B0.__webglTexture,l,N0)}}else if(I!==null&&l!==0){let N0=L.get(I.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,N0.__webglTexture,l)}n=-1},this.readRenderTargetPixels=function(I,T,l,x,h,q0,F0,N0=0){if(!(I&&I.isWebGLRenderTarget)){y0("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let L0=L.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget&&F0!==void 0)L0=L0[F0];if(L0){A0.bindFramebuffer(P.FRAMEBUFFER,L0);try{let B0=I.textures[N0],h0=B0.format,d0=B0.type;if(I.textures.length>1)P.readBuffer(P.COLOR_ATTACHMENT0+N0);if(!w8.textureFormatReadable(h0)){y0("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!w8.textureTypeReadable(d0)){y0("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(T>=0&&T<=I.width-x&&(l>=0&&l<=I.height-h))P.readPixels(T,l,x,h,S.convert(h0),S.convert(d0),q0)}finally{let B0=p!==null?L.get(p).__webglFramebuffer:null;A0.bindFramebuffer(P.FRAMEBUFFER,B0)}}},this.readRenderTargetPixelsAsync=async function(I,T,l,x,h,q0,F0,N0=0){if(!(I&&I.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let L0=L.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget&&F0!==void 0)L0=L0[F0];if(L0)if(T>=0&&T<=I.width-x&&(l>=0&&l<=I.height-h)){A0.bindFramebuffer(P.FRAMEBUFFER,L0);let B0=I.textures[N0],h0=B0.format,d0=B0.type;if(I.textures.length>1)P.readBuffer(P.COLOR_ATTACHMENT0+N0);if(!w8.textureFormatReadable(h0))throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!w8.textureTypeReadable(d0))throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let C0=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,C0),P.bufferData(P.PIXEL_PACK_BUFFER,q0.byteLength,P.STREAM_READ),P.readPixels(T,l,x,h,S.convert(h0),S.convert(d0),0);let q8=p!==null?L.get(p).__webglFramebuffer:null;A0.bindFramebuffer(P.FRAMEBUFFER,q8);let P8=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await _z(P,P8,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,C0),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,q0),P.deleteBuffer(C0),P.deleteSync(P8),q0}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(I,T=null,l=0){let x=Math.pow(2,-l),h=Math.floor(I.image.width*x),q0=Math.floor(I.image.height*x),F0=T!==null?T.x:0,N0=T!==null?T.y:0;k.setTexture2D(I,0),P.copyTexSubImage2D(P.TEXTURE_2D,l,0,0,F0,N0,h,q0),A0.unbindTexture()};let BD=P.createFramebuffer(),RD=P.createFramebuffer();if(this.copyTextureToTexture=function(I,T,l=null,x=null,h=0,q0=0){let F0,N0,L0,B0,h0,d0,C0,q8,P8,C8=I.isCompressedTexture?I.mipmaps[q0]:I.image;if(l!==null)F0=l.max.x-l.min.x,N0=l.max.y-l.min.y,L0=l.isBox3?l.max.z-l.min.z:1,B0=l.min.x,h0=l.min.y,d0=l.isBox3?l.min.z:0;else{let d8=Math.pow(2,-h);if(F0=Math.floor(C8.width*d8),N0=Math.floor(C8.height*d8),I.isDataArrayTexture)L0=C8.depth;else if(I.isData3DTexture)L0=Math.floor(C8.depth*d8);else L0=1;B0=0,h0=0,d0=0}if(x!==null)C0=x.x,q8=x.y,P8=x.z;else C0=0,q8=0,P8=0;let N8=S.convert(T.format),c8=S.convert(T.type),G0;if(T.isData3DTexture)k.setTexture3D(T,0),G0=P.TEXTURE_3D;else if(T.isDataArrayTexture||T.isCompressedArrayTexture)k.setTexture2DArray(T,0),G0=P.TEXTURE_2D_ARRAY;else k.setTexture2D(T,0),G0=P.TEXTURE_2D;P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,T.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,T.unpackAlignment);let V6=P.getParameter(P.UNPACK_ROW_LENGTH),J8=P.getParameter(P.UNPACK_IMAGE_HEIGHT),y6=P.getParameter(P.UNPACK_SKIP_PIXELS),n6=P.getParameter(P.UNPACK_SKIP_ROWS),s7=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,C8.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,C8.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,B0),P.pixelStorei(P.UNPACK_SKIP_ROWS,h0),P.pixelStorei(P.UNPACK_SKIP_IMAGES,d0);let BJ=I.isDataArrayTexture||I.isData3DTexture,V8=T.isDataArrayTexture||T.isData3DTexture;if(I.isDepthTexture){let d8=L.get(I),B7=L.get(T),f8=L.get(d8.__renderTarget),R7=L.get(B7.__renderTarget);A0.bindFramebuffer(P.READ_FRAMEBUFFER,f8.__webglFramebuffer),A0.bindFramebuffer(P.DRAW_FRAMEBUFFER,R7.__webglFramebuffer);for(let RJ=0;RJ<L0;RJ++){if(BJ)P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,L.get(I).__webglTexture,h,d0+RJ),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,L.get(T).__webglTexture,q0,P8+RJ);P.blitFramebuffer(B0,h0,F0,N0,C0,q8,F0,N0,P.DEPTH_BUFFER_BIT,P.NEAREST)}A0.bindFramebuffer(P.READ_FRAMEBUFFER,null),A0.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(h!==0||I.isRenderTargetTexture||L.has(I)){let d8=L.get(I),B7=L.get(T);A0.bindFramebuffer(P.READ_FRAMEBUFFER,BD),A0.bindFramebuffer(P.DRAW_FRAMEBUFFER,RD);for(let f8=0;f8<L0;f8++){if(BJ)P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,d8.__webglTexture,h,d0+f8);else P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,d8.__webglTexture,h);if(V8)P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,B7.__webglTexture,q0,P8+f8);else P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,B7.__webglTexture,q0);if(h!==0)P.blitFramebuffer(B0,h0,F0,N0,C0,q8,F0,N0,P.COLOR_BUFFER_BIT,P.NEAREST);else if(V8)P.copyTexSubImage3D(G0,q0,C0,q8,P8+f8,B0,h0,F0,N0);else P.copyTexSubImage2D(G0,q0,C0,q8,B0,h0,F0,N0)}A0.bindFramebuffer(P.READ_FRAMEBUFFER,null),A0.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(V8)if(I.isDataTexture||I.isData3DTexture)P.texSubImage3D(G0,q0,C0,q8,P8,F0,N0,L0,N8,c8,C8.data);else if(T.isCompressedArrayTexture)P.compressedTexSubImage3D(G0,q0,C0,q8,P8,F0,N0,L0,N8,C8.data);else P.texSubImage3D(G0,q0,C0,q8,P8,F0,N0,L0,N8,c8,C8);else if(I.isDataTexture)P.texSubImage2D(P.TEXTURE_2D,q0,C0,q8,F0,N0,N8,c8,C8.data);else if(I.isCompressedTexture)P.compressedTexSubImage2D(P.TEXTURE_2D,q0,C0,q8,C8.width,C8.height,N8,C8.data);else P.texSubImage2D(P.TEXTURE_2D,q0,C0,q8,F0,N0,N8,c8,C8);if(P.pixelStorei(P.UNPACK_ROW_LENGTH,V6),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,J8),P.pixelStorei(P.UNPACK_SKIP_PIXELS,y6),P.pixelStorei(P.UNPACK_SKIP_ROWS,n6),P.pixelStorei(P.UNPACK_SKIP_IMAGES,s7),q0===0&&T.generateMipmaps)P.generateMipmap(G0);A0.unbindTexture()},this.initRenderTarget=function(I){if(L.get(I).__webglFramebuffer===void 0)k.setupRenderTarget(I)},this.initTexture=function(I){if(I.isCubeTexture)k.setTextureCube(I,0);else if(I.isData3DTexture)k.setTexture3D(I,0);else if(I.isDataArrayTexture||I.isCompressedArrayTexture)k.setTexture2DArray(I,0);else k.setTexture2D(I,0);A0.unbindTexture()},this.resetState=function(){u=0,_=0,p=null,A0.reset(),Z0.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return rX}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(J){this._outputColorSpace=J;let Q=this.getContext();Q.drawingBufferColorSpace=a0._getDrawingBufferColorSpace(J),Q.unpackColorSpace=a0._getUnpackColorSpace()}}var _Q=80,zD=8,bH=6,DD=0.002,uG=0.008,sG=0.003;class vH{renderer;scene=new uZ;camera;_leafGeometry=null;_leafMesh=null;_leafVelocities=null;_elapsedMs=0;constructor(J,Q){this.renderer=new yH({antialias:!1,stencil:!0,alpha:!0}),this.renderer.setSize(J,Q),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.camera=new t8(55,J/Q,0.1,100),this.camera.position.set(0,0,5)}getContext(){return this.renderer.getContext()}resize(J,Q){this.renderer.setSize(J,Q),this.camera.aspect=J/Q,this.camera.updateProjectionMatrix()}addTeaHouseEffects(){this.scene.fog=new wQ(1707269,0.04),this.scene.background=new l0(853762),this._buildLeafParticles(),this._buildLanternLights()}tick(J){this._elapsedMs+=J,this._updateLeaves(),this.renderer.resetState(),this.renderer.render(this.scene,this.camera)}dispose(){if(this._leafGeometry?.dispose(),this._leafMesh?.material instanceof G7)this._leafMesh.material.dispose();this.renderer.dispose()}_buildLeafParticles(){let J=new Float32Array(_Q*3),Q=new Float32Array(_Q*3),$=new Float32Array(_Q*3),Z=[new l0(12740893),new l0(15245351),new l0(9124367),new l0(13936723)];for(let K=0;K<_Q;K+=1){let W=K*3;J[W]=(Math.random()-0.5)*zD,J[W+1]=(Math.random()-0.5)*bH+3,J[W+2]=(Math.random()-0.5)*2,Q[W]=(Math.random()-0.5)*sG,Q[W+1]=-(DD+Math.random()*(uG-DD)),Q[W+2]=0;let X=Z[Math.floor(Math.random()*Z.length)];$[W]=X.r,$[W+1]=X.g,$[W+2]=X.b}this._leafGeometry=new I6,this._leafGeometry.setAttribute("position",new K6(J,3)),this._leafGeometry.setAttribute("color",new K6($,3)),this._leafMesh=new aZ(this._leafGeometry,new LQ({size:0.08,vertexColors:!0,transparent:!0,opacity:0.75,sizeAttenuation:!0})),this._leafVelocities=Q,this.scene.add(this._leafMesh)}_buildLanternLights(){let J=[[-2.5,1.5,1],[2.5,1.5,1],[0,2,0.5]];for(let[Q,$,Z]of J){let K=new $K(16755268,1.2,4);K.position.set(Q,$,Z),this.scene.add(K)}this.scene.add(new KK(3152392,0.4))}_updateLeaves(){if(!this._leafGeometry||!this._leafVelocities)return;let J=this._leafVelocities,Q=this._leafGeometry.getAttribute("position"),$=Q?.array;if(!($ instanceof Float32Array)||!Q)return;let Z=this._elapsedMs*0.001;for(let K=0;K<_Q;K+=1){let W=K*3,X=($[W]??0)+(J[W]??0)+Math.sin(Z+K*0.7)*0.0015,H=($[W+1]??0)+(J[W+1]??0),q=($[W+2]??0)+(J[W+2]??0);if($[W]=X,$[W+1]=H,$[W+2]=q,H<-bH/2-1)$[W]=(Math.random()-0.5)*zD,$[W+1]=bH/2+1,$[W+2]=(Math.random()-0.5)*2}Q.needsUpdate=!0}}var kD="lotfk:game:session-meta",L9=50,YK=60000,G9=(J)=>document.querySelector(J),nG=()=>{let J=G9('meta[name="game-session-id"]');if(!J)return null;let Q=J.dataset.sessionId?.trim();if(!Q)return null;let $=G9('meta[name="game-session-locale"]')?.dataset.gameSessionLocale??"en-US",Z=G9('meta[name="game-session-resume-token"]')?.dataset.sessionResumeToken??"",K=Number.parseInt(G9('meta[name="game-session-command-queue-depth"]')?.dataset.gameSessionCommandQueueDepth??"0",10)||0,W=Number.parseInt(G9('meta[name="game-session-version"]')?.dataset.gameSessionVersion??"1",10)||1,X=Number.parseInt(G9('meta[name="game-session-resume-window-ms"]')?.dataset.gameSessionResumeWindowMs??"",10)||YK,H={sessionId:Q,resumeToken:Z,locale:$,commandQueueDepth:K,version:W,expiresAtMs:Date.now()+Math.max(X,YK)},q=null;try{q=localStorage.getItem(kD)}catch{q=null}if(!q)return H;try{let N=JSON.parse(q);if(N.sessionId===Q&&N.locale.length>0&&N.resumeToken.length>0&&Number.isFinite(N.expiresAtMs)&&N.expiresAtMs>Date.now())return{...H,resumeToken:N.resumeToken,commandQueueDepth:N.commandQueueDepth,version:N.version,locale:N.locale,expiresAtMs:N.expiresAtMs}}catch{return H}return H},iG=(J)=>{try{localStorage.setItem(kD,JSON.stringify({...J,expiresAtMs:Math.max(J.expiresAtMs,Date.now()+YK)}))}catch{return}},oG=(J,Q)=>{let $=window.location.protocol==="https:"?"wss:":"ws:",Z=KF(ZF.gameApiSessionWebSocket,{id:J}),K=new URL(`${$}//${window.location.host}${Z}`);if(Q.length>0)K.searchParams.set("resumeToken",Q);return K.toString()},aG=(J)=>{if(typeof J!=="string"&&typeof J!=="object")return null;let Q=(()=>{if(typeof J==="string")try{return JSON.parse(J)}catch{return null}if(J instanceof ArrayBuffer||J instanceof Blob)return null;return J})();if(!Q||typeof Q!=="object")return null;let $=Q;if($.player&&$.npcs)return $;if($.state&&typeof $.state==="object")return $.state;return null},fH=(J,Q)=>{let $=J?.dataset.queueLabel??"queue";if(J){J.textContent=`${$}: ${Q}`;return}let Z=document.getElementById("game-session-meta");if(Z)Z.dataset.commandQueueDepth=String(Q)},NK=(J,Q,$)=>{if(!J)return;if(Q==="connecting"){J.textContent=J.dataset.connectingLabel??J.textContent??"";return}if(Q==="connected"){J.textContent=J.dataset.connectedLabel??J.textContent??"";return}let Z=J.dataset.disconnectedPrefix??J.textContent??"";J.textContent=typeof $==="number"?`${Z} (${$})`:Z},rG=async()=>{let J=document.getElementById("game-canvas-wrapper");if(!J)return;let Q=nG();if(!Q)return;let $=new vH(J.clientWidth,J.clientHeight);$.addTeaHouseEffects(),J.appendChild($.renderer.domElement);let Z=new qZ;await Z.init({context:$.getContext(),width:J.clientWidth,height:J.clientHeight,clearBeforeRender:!1,antialias:!1});let K=new R8,W=new Map,X=document.getElementById("game-command-queue"),H=document.getElementById("game-connection-status"),q=0,N=Q.commandQueueDepth,Y=null,U=null;fH(X,N),NK(H,"connecting");let V=new WebSocket(oG(Q.sessionId,Q.resumeToken));V.addEventListener("open",()=>{NK(H,"connected")}),V.addEventListener("message",(O)=>{let G=aG(O.data);if(!G)return;Y=U,U=G,N=Math.max(N-1,0),fH(X,N)}),V.addEventListener("close",(O)=>{NK(H,"disconnected",O.code)});let z=(O)=>{if(V.readyState!==WebSocket.OPEN)return;q+=1,V.send(JSON.stringify({commandId:crypto.randomUUID(),source:"ws",locale:Q.locale,sequenceId:q,timestamp:new Date().toISOString(),ttlMs:YK,command:O})),N+=1,fH(X,N)};window.addEventListener("resize",()=>{$.resize(J.clientWidth,J.clientHeight),Z.resize(J.clientWidth,J.clientHeight)});let D=new Set;window.addEventListener("keydown",(O)=>{if(O.ctrlKey||O.metaKey||O.altKey||O.repeat)return;if(D.add(O.key),O.key==="e"||O.key==="Enter"||O.key===" "){z({type:"interact"}),O.preventDefault();return}if(O.key==="Escape")z({type:"closeDialogue"}),O.preventDefault()}),window.addEventListener("keyup",(O)=>{D.delete(O.key)});let w=0,F=new l8;F.add((O)=>{let G=performance.now();if(G-w>L9){if(D.has("w")||D.has("ArrowUp"))z({type:"move",direction:"up",durationMs:L9});else if(D.has("s")||D.has("ArrowDown"))z({type:"move",direction:"down",durationMs:L9});else if(D.has("a")||D.has("ArrowLeft"))z({type:"move",direction:"left",durationMs:L9});else if(D.has("d")||D.has("ArrowRight"))z({type:"move",direction:"right",durationMs:L9});w=G}if(U)tG(U,Y,Math.min((G-w)/L9,1),W,K);$.tick(O.deltaMS),Z.resetState(),Z.render({container:K})}),F.start(),iG({sessionId:Q.sessionId,resumeToken:Q.resumeToken,locale:Q.locale,commandQueueDepth:N,version:Q.version,expiresAtMs:Q.expiresAtMs})},tG=(J,Q,$,Z,K)=>{let W=[J.player,...J.npcs];for(let X of W){let H=Z.get(X.id)??(()=>{let U=new x6;return U.anchor.set(0.5,1),K.addChild(U),Z.set(X.id,U),U})(),q=Q?.player.id===X.id?Q.player:Q?.npcs.find((U)=>U.id===X.id),N=q?.position.x??X.position.x,Y=q?.position.y??X.position.y;H.x=N+(X.position.x-N)*$-(J.camera.x??0),H.y=Y+(X.position.y-Y)*$-(J.camera.y??0)}K.children.sort((X,H)=>X.y-H.y)};rG().catch(()=>{NK(document.getElementById("game-connection-status"),"disconnected")});
