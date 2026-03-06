var _D=Object.create;var{getPrototypeOf:CD,defineProperty:nH,getOwnPropertyNames:ED}=Object;var PD=Object.prototype.hasOwnProperty;function jD(J){return this[J]}var SD,TD,yD=(J,$,Q)=>{var Z=J!=null&&typeof J==="object";if(Z){var K=$?SD??=new WeakMap:TD??=new WeakMap,W=K.get(J);if(W)return W}Q=J!=null?_D(CD(J)):{};let X=$||!J||!J.__esModule?nH(Q,"default",{value:J,enumerable:!0}):Q;for(let H of ED(J))if(!PD.call(X,H))nH(X,H,{get:jD.bind(J,H),enumerable:!0});if(Z)K.set(J,X);return X};var bD=(J,$)=>()=>($||J(($={exports:{}}).exports,$),$.exports);var A=(J,$)=>()=>(J&&($=J(J=0)),$);var b,FK=(J)=>{if(typeof J==="function"||typeof J==="object"&&J.extension){if(!J.extension)throw Error("Extension class must have an extension object");J={...typeof J.extension!=="object"?{type:J.extension}:J.extension,ref:J}}if(typeof J==="object")J={...J};else throw Error("Invalid extension type");if(typeof J.type==="string")J.type=[J.type];return J},S$=(J,$)=>FK(J).priority??$,n0;var k0=A(()=>{b=((J)=>{return J.Application="application",J.WebGLPipes="webgl-pipes",J.WebGLPipesAdaptor="webgl-pipes-adaptor",J.WebGLSystem="webgl-system",J.WebGPUPipes="webgpu-pipes",J.WebGPUPipesAdaptor="webgpu-pipes-adaptor",J.WebGPUSystem="webgpu-system",J.CanvasSystem="canvas-system",J.CanvasPipesAdaptor="canvas-pipes-adaptor",J.CanvasPipes="canvas-pipes",J.Asset="asset",J.LoadParser="load-parser",J.ResolveParser="resolve-parser",J.CacheParser="cache-parser",J.DetectionParser="detection-parser",J.MaskEffect="mask-effect",J.BlendMode="blend-mode",J.TextureSource="texture-source",J.Environment="environment",J.ShapeBuilder="shape-builder",J.Batcher="batcher",J})(b||{}),n0={_addHandlers:{},_removeHandlers:{},_queue:{},remove(...J){return J.map(FK).forEach(($)=>{$.type.forEach((Q)=>this._removeHandlers[Q]?.($))}),this},add(...J){return J.map(FK).forEach(($)=>{$.type.forEach((Q)=>{let Z=this._addHandlers,K=this._queue;if(!Z[Q])K[Q]=K[Q]||[],K[Q]?.push($);else Z[Q]?.($)})}),this},handle(J,$,Q){let Z=this._addHandlers,K=this._removeHandlers;if(Z[J]||K[J])throw Error(`Extension type ${J} already has a handler`);Z[J]=$,K[J]=Q;let W=this._queue;if(W[J])W[J]?.forEach((X)=>$(X)),delete W[J];return this},handleByMap(J,$){return this.handle(J,(Q)=>{if(Q.name)$[Q.name]=Q.ref},(Q)=>{if(Q.name)delete $[Q.name]})},handleByNamedList(J,$,Q=-1){return this.handle(J,(Z)=>{if($.findIndex((W)=>W.name===Z.name)>=0)return;$.push({name:Z.name,value:Z.ref}),$.sort((W,X)=>S$(X.value,Q)-S$(W.value,Q))},(Z)=>{let K=$.findIndex((W)=>W.name===Z.name);if(K!==-1)$.splice(K,1)})},handleByList(J,$,Q=-1){return this.handle(J,(Z)=>{if($.includes(Z.ref))return;$.push(Z.ref),$.sort((K,W)=>S$(W,Q)-S$(K,Q))},(Z)=>{let K=$.indexOf(Z.ref);if(K!==-1)$.splice(K,1)})},mixin(J,...$){for(let Q of $)Object.defineProperties(J.prototype,Object.getOwnPropertyDescriptors(Q))}}});var oH=bD((HL,zK)=>{var vD=Object.prototype.hasOwnProperty,Q6="~";function B9(){}if(Object.create){if(B9.prototype=Object.create(null),!new B9().__proto__)Q6=!1}function fD(J,$,Q){this.fn=J,this.context=$,this.once=Q||!1}function iH(J,$,Q,Z,K){if(typeof Q!=="function")throw TypeError("The listener must be a function");var W=new fD(Q,Z||J,K),X=Q6?Q6+$:$;if(!J._events[X])J._events[X]=W,J._eventsCount++;else if(!J._events[X].fn)J._events[X].push(W);else J._events[X]=[J._events[X],W];return J}function T$(J,$){if(--J._eventsCount===0)J._events=new B9;else delete J._events[$]}function u8(){this._events=new B9,this._eventsCount=0}u8.prototype.eventNames=function(){var $=[],Q,Z;if(this._eventsCount===0)return $;for(Z in Q=this._events)if(vD.call(Q,Z))$.push(Q6?Z.slice(1):Z);if(Object.getOwnPropertySymbols)return $.concat(Object.getOwnPropertySymbols(Q));return $};u8.prototype.listeners=function($){var Q=Q6?Q6+$:$,Z=this._events[Q];if(!Z)return[];if(Z.fn)return[Z.fn];for(var K=0,W=Z.length,X=Array(W);K<W;K++)X[K]=Z[K].fn;return X};u8.prototype.listenerCount=function($){var Q=Q6?Q6+$:$,Z=this._events[Q];if(!Z)return 0;if(Z.fn)return 1;return Z.length};u8.prototype.emit=function($,Q,Z,K,W,X){var H=Q6?Q6+$:$;if(!this._events[H])return!1;var q=this._events[H],Y=arguments.length,N,U;if(q.fn){if(q.once)this.removeListener($,q.fn,void 0,!0);switch(Y){case 1:return q.fn.call(q.context),!0;case 2:return q.fn.call(q.context,Q),!0;case 3:return q.fn.call(q.context,Q,Z),!0;case 4:return q.fn.call(q.context,Q,Z,K),!0;case 5:return q.fn.call(q.context,Q,Z,K,W),!0;case 6:return q.fn.call(q.context,Q,Z,K,W,X),!0}for(U=1,N=Array(Y-1);U<Y;U++)N[U-1]=arguments[U];q.fn.apply(q.context,N)}else{var V=q.length,z;for(U=0;U<V;U++){if(q[U].once)this.removeListener($,q[U].fn,void 0,!0);switch(Y){case 1:q[U].fn.call(q[U].context);break;case 2:q[U].fn.call(q[U].context,Q);break;case 3:q[U].fn.call(q[U].context,Q,Z);break;case 4:q[U].fn.call(q[U].context,Q,Z,K);break;default:if(!N)for(z=1,N=Array(Y-1);z<Y;z++)N[z-1]=arguments[z];q[U].fn.apply(q[U].context,N)}}}return!0};u8.prototype.on=function($,Q,Z){return iH(this,$,Q,Z,!1)};u8.prototype.once=function($,Q,Z){return iH(this,$,Q,Z,!0)};u8.prototype.removeListener=function($,Q,Z,K){var W=Q6?Q6+$:$;if(!this._events[W])return this;if(!Q)return T$(this,W),this;var X=this._events[W];if(X.fn){if(X.fn===Q&&(!K||X.once)&&(!Z||X.context===Z))T$(this,W)}else{for(var H=0,q=[],Y=X.length;H<Y;H++)if(X[H].fn!==Q||K&&!X[H].once||Z&&X[H].context!==Z)q.push(X[H]);if(q.length)this._events[W]=q.length===1?q[0]:q;else T$(this,W)}return this};u8.prototype.removeAllListeners=function($){var Q;if($){if(Q=Q6?Q6+$:$,this._events[Q])T$(this,Q)}else this._events=new B9,this._eventsCount=0;return this};u8.prototype.off=u8.prototype.removeListener;u8.prototype.addListener=u8.prototype.on;u8.prefixed=Q6;u8.EventEmitter=u8;if(typeof zK<"u")zK.exports=u8});var aH,C8;var O6=A(()=>{aH=yD(oH(),1),C8=aH.default});var hD,W7=function(J){return typeof J=="string"?J.length>0:typeof J=="number"},h8=function(J,$,Q){return $===void 0&&($=0),Q===void 0&&(Q=Math.pow(10,$)),Math.round(Q*J)/Q+0},G6=function(J,$,Q){return $===void 0&&($=0),Q===void 0&&(Q=1),J>Q?Q:J>$?J:$},Kq=function(J){return(J=isFinite(J)?J%360:0)>0?J:J+360},rH=function(J){return{r:G6(J.r,0,255),g:G6(J.g,0,255),b:G6(J.b,0,255),a:G6(J.a)}},DK=function(J){return{r:h8(J.r),g:h8(J.g),b:h8(J.b),a:h8(J.a,3)}},xD,y$=function(J){var $=J.toString(16);return $.length<2?"0"+$:$},Wq=function(J){var{r:$,g:Q,b:Z,a:K}=J,W=Math.max($,Q,Z),X=W-Math.min($,Q,Z),H=X?W===$?(Q-Z)/X:W===Q?2+(Z-$)/X:4+($-Q)/X:0;return{h:60*(H<0?H+6:H),s:W?X/W*100:0,v:W/255*100,a:K}},Xq=function(J){var{h:$,s:Q,v:Z,a:K}=J;$=$/360*6,Q/=100,Z/=100;var W=Math.floor($),X=Z*(1-Q),H=Z*(1-($-W)*Q),q=Z*(1-(1-$+W)*Q),Y=W%6;return{r:255*[Z,H,X,X,q,Z][Y],g:255*[q,Z,Z,H,X,X][Y],b:255*[X,X,q,Z,Z,H][Y],a:K}},tH=function(J){return{h:Kq(J.h),s:G6(J.s,0,100),l:G6(J.l,0,100),a:G6(J.a)}},eH=function(J){return{h:h8(J.h),s:h8(J.s),l:h8(J.l),a:h8(J.a,3)}},Jq=function(J){return Xq((Q=($=J).s,{h:$.h,s:(Q*=((Z=$.l)<50?Z:100-Z)/100)>0?2*Q/(Z+Q)*100:0,v:Z+Q,a:$.a}));var $,Q,Z},A9=function(J){return{h:($=Wq(J)).h,s:(K=(200-(Q=$.s))*(Z=$.v)/100)>0&&K<200?Q*Z/100/(K<=100?K:200-K)*100:0,l:K/2,a:$.a};var $,Q,Z,K},gD,pD,mD,dD,wK,$q=function(J,$){for(var Q=0;Q<$.length;Q++){var Z=$[Q][0](J);if(Z)return[Z,$[Q][1]]}return[null,void 0]},lD=function(J){return typeof J=="string"?$q(J.trim(),wK.string):typeof J=="object"&&J!==null?$q(J,wK.object):[null,void 0]},kK=function(J,$){var Q=A9(J);return{h:Q.h,s:G6(Q.s+100*$,0,100),l:Q.l,a:Q.a}},IK=function(J){return(299*J.r+587*J.g+114*J.b)/1000/255},Qq=function(J,$){var Q=A9(J);return{h:Q.h,s:Q.s,l:G6(Q.l+100*$,0,100),a:Q.a}},MK,b6=function(J){return J instanceof MK?J:new MK(J)},Zq,Hq=function(J){J.forEach(function($){Zq.indexOf($)<0&&($(MK,wK),Zq.push($))})};var qq=A(()=>{hD={grad:0.9,turn:360,rad:360/(2*Math.PI)},xD=/^#([0-9a-f]{3,8})$/i,gD=/^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*,\s*([+-]?\d*\.?\d+)%\s*,\s*([+-]?\d*\.?\d+)%\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,pD=/^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s+([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)%\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,mD=/^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,dD=/^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,wK={string:[[function(J){var $=xD.exec(J);return $?(J=$[1]).length<=4?{r:parseInt(J[0]+J[0],16),g:parseInt(J[1]+J[1],16),b:parseInt(J[2]+J[2],16),a:J.length===4?h8(parseInt(J[3]+J[3],16)/255,2):1}:J.length===6||J.length===8?{r:parseInt(J.substr(0,2),16),g:parseInt(J.substr(2,2),16),b:parseInt(J.substr(4,2),16),a:J.length===8?h8(parseInt(J.substr(6,2),16)/255,2):1}:null:null},"hex"],[function(J){var $=mD.exec(J)||dD.exec(J);return $?$[2]!==$[4]||$[4]!==$[6]?null:rH({r:Number($[1])/($[2]?0.39215686274509803:1),g:Number($[3])/($[4]?0.39215686274509803:1),b:Number($[5])/($[6]?0.39215686274509803:1),a:$[7]===void 0?1:Number($[7])/($[8]?100:1)}):null},"rgb"],[function(J){var $=gD.exec(J)||pD.exec(J);if(!$)return null;var Q,Z,K=tH({h:(Q=$[1],Z=$[2],Z===void 0&&(Z="deg"),Number(Q)*(hD[Z]||1)),s:Number($[3]),l:Number($[4]),a:$[5]===void 0?1:Number($[5])/($[6]?100:1)});return Jq(K)},"hsl"]],object:[[function(J){var{r:$,g:Q,b:Z,a:K}=J,W=K===void 0?1:K;return W7($)&&W7(Q)&&W7(Z)?rH({r:Number($),g:Number(Q),b:Number(Z),a:Number(W)}):null},"rgb"],[function(J){var{h:$,s:Q,l:Z,a:K}=J,W=K===void 0?1:K;if(!W7($)||!W7(Q)||!W7(Z))return null;var X=tH({h:Number($),s:Number(Q),l:Number(Z),a:Number(W)});return Jq(X)},"hsl"],[function(J){var{h:$,s:Q,v:Z,a:K}=J,W=K===void 0?1:K;if(!W7($)||!W7(Q)||!W7(Z))return null;var X=function(H){return{h:Kq(H.h),s:G6(H.s,0,100),v:G6(H.v,0,100),a:G6(H.a)}}({h:Number($),s:Number(Q),v:Number(Z),a:Number(W)});return Xq(X)},"hsv"]]},MK=function(){function J($){this.parsed=lD($)[0],this.rgba=this.parsed||{r:0,g:0,b:0,a:1}}return J.prototype.isValid=function(){return this.parsed!==null},J.prototype.brightness=function(){return h8(IK(this.rgba),2)},J.prototype.isDark=function(){return IK(this.rgba)<0.5},J.prototype.isLight=function(){return IK(this.rgba)>=0.5},J.prototype.toHex=function(){return $=DK(this.rgba),Q=$.r,Z=$.g,K=$.b,X=(W=$.a)<1?y$(h8(255*W)):"","#"+y$(Q)+y$(Z)+y$(K)+X;var $,Q,Z,K,W,X},J.prototype.toRgb=function(){return DK(this.rgba)},J.prototype.toRgbString=function(){return $=DK(this.rgba),Q=$.r,Z=$.g,K=$.b,(W=$.a)<1?"rgba("+Q+", "+Z+", "+K+", "+W+")":"rgb("+Q+", "+Z+", "+K+")";var $,Q,Z,K,W},J.prototype.toHsl=function(){return eH(A9(this.rgba))},J.prototype.toHslString=function(){return $=eH(A9(this.rgba)),Q=$.h,Z=$.s,K=$.l,(W=$.a)<1?"hsla("+Q+", "+Z+"%, "+K+"%, "+W+")":"hsl("+Q+", "+Z+"%, "+K+"%)";var $,Q,Z,K,W},J.prototype.toHsv=function(){return $=Wq(this.rgba),{h:h8($.h),s:h8($.s),v:h8($.v),a:h8($.a,3)};var $},J.prototype.invert=function(){return b6({r:255-($=this.rgba).r,g:255-$.g,b:255-$.b,a:$.a});var $},J.prototype.saturate=function($){return $===void 0&&($=0.1),b6(kK(this.rgba,$))},J.prototype.desaturate=function($){return $===void 0&&($=0.1),b6(kK(this.rgba,-$))},J.prototype.grayscale=function(){return b6(kK(this.rgba,-1))},J.prototype.lighten=function($){return $===void 0&&($=0.1),b6(Qq(this.rgba,$))},J.prototype.darken=function($){return $===void 0&&($=0.1),b6(Qq(this.rgba,-$))},J.prototype.rotate=function($){return $===void 0&&($=15),this.hue(this.hue()+$)},J.prototype.alpha=function($){return typeof $=="number"?b6({r:(Q=this.rgba).r,g:Q.g,b:Q.b,a:$}):h8(this.rgba.a,3);var Q},J.prototype.hue=function($){var Q=A9(this.rgba);return typeof $=="number"?b6({h:$,s:Q.s,l:Q.l,a:Q.a}):h8(Q.h)},J.prototype.isEqual=function($){return this.toHex()===b6($).toHex()},J}(),Zq=[]});function GK(J,$){var Q={white:"#ffffff",bisque:"#ffe4c4",blue:"#0000ff",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",antiquewhite:"#faebd7",aqua:"#00ffff",azure:"#f0ffff",whitesmoke:"#f5f5f5",papayawhip:"#ffefd5",plum:"#dda0dd",blanchedalmond:"#ffebcd",black:"#000000",gold:"#ffd700",goldenrod:"#daa520",gainsboro:"#dcdcdc",cornsilk:"#fff8dc",cornflowerblue:"#6495ed",burlywood:"#deb887",aquamarine:"#7fffd4",beige:"#f5f5dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkkhaki:"#bdb76b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",peachpuff:"#ffdab9",darkmagenta:"#8b008b",darkred:"#8b0000",darkorchid:"#9932cc",darkorange:"#ff8c00",darkslateblue:"#483d8b",gray:"#808080",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",deeppink:"#ff1493",deepskyblue:"#00bfff",wheat:"#f5deb3",firebrick:"#b22222",floralwhite:"#fffaf0",ghostwhite:"#f8f8ff",darkviolet:"#9400d3",magenta:"#ff00ff",green:"#008000",dodgerblue:"#1e90ff",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",blueviolet:"#8a2be2",forestgreen:"#228b22",lawngreen:"#7cfc00",indianred:"#cd5c5c",indigo:"#4b0082",fuchsia:"#ff00ff",brown:"#a52a2a",maroon:"#800000",mediumblue:"#0000cd",lightcoral:"#f08080",darkturquoise:"#00ced1",lightcyan:"#e0ffff",ivory:"#fffff0",lightyellow:"#ffffe0",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",linen:"#faf0e6",mediumaquamarine:"#66cdaa",lemonchiffon:"#fffacd",lime:"#00ff00",khaki:"#f0e68c",mediumseagreen:"#3cb371",limegreen:"#32cd32",mediumspringgreen:"#00fa9a",lightskyblue:"#87cefa",lightblue:"#add8e6",midnightblue:"#191970",lightpink:"#ffb6c1",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",mintcream:"#f5fffa",lightslategray:"#778899",lightslategrey:"#778899",navajowhite:"#ffdead",navy:"#000080",mediumvioletred:"#c71585",powderblue:"#b0e0e6",palegoldenrod:"#eee8aa",oldlace:"#fdf5e6",paleturquoise:"#afeeee",mediumturquoise:"#48d1cc",mediumorchid:"#ba55d3",rebeccapurple:"#663399",lightsteelblue:"#b0c4de",mediumslateblue:"#7b68ee",thistle:"#d8bfd8",tan:"#d2b48c",orchid:"#da70d6",mediumpurple:"#9370db",purple:"#800080",pink:"#ffc0cb",skyblue:"#87ceeb",springgreen:"#00ff7f",palegreen:"#98fb98",red:"#ff0000",yellow:"#ffff00",slateblue:"#6a5acd",lavenderblush:"#fff0f5",peru:"#cd853f",palevioletred:"#db7093",violet:"#ee82ee",teal:"#008080",slategray:"#708090",slategrey:"#708090",aliceblue:"#f0f8ff",darkseagreen:"#8fbc8f",darkolivegreen:"#556b2f",greenyellow:"#adff2f",seagreen:"#2e8b57",seashell:"#fff5ee",tomato:"#ff6347",silver:"#c0c0c0",sienna:"#a0522d",lavender:"#e6e6fa",lightgreen:"#90ee90",orange:"#ffa500",orangered:"#ff4500",steelblue:"#4682b4",royalblue:"#4169e1",turquoise:"#40e0d0",yellowgreen:"#9acd32",salmon:"#fa8072",saddlebrown:"#8b4513",sandybrown:"#f4a460",rosybrown:"#bc8f8f",darksalmon:"#e9967a",lightgoldenrodyellow:"#fafad2",snow:"#fffafa",lightgrey:"#d3d3d3",lightgray:"#d3d3d3",dimgray:"#696969",dimgrey:"#696969",olivedrab:"#6b8e23",olive:"#808000"},Z={};for(var K in Q)Z[Q[K]]=K;var W={};J.prototype.toName=function(X){if(!(this.rgba.a||this.rgba.r||this.rgba.g||this.rgba.b))return"transparent";var H,q,Y=Z[this.toHex()];if(Y)return Y;if(X==null?void 0:X.closest){var N=this.toRgb(),U=1/0,V="black";if(!W.length)for(var z in Q)W[z]=new J(Q[z]).toRgb();for(var D in Q){var w=(H=N,q=W[D],Math.pow(H.r-q.r,2)+Math.pow(H.g-q.g,2)+Math.pow(H.b-q.b,2));w<U&&(U=w,V=D)}return V}},$.string.push([function(X){var H=X.toLowerCase(),q=H==="transparent"?"#0000":Q[H];return q?new J(q).toRgb():null},"name"])}var _J=class J{constructor($=16777215){this._value=null,this._components=new Float32Array(4),this._components.fill(1),this._int=16777215,this.value=$}get red(){return this._components[0]}get green(){return this._components[1]}get blue(){return this._components[2]}get alpha(){return this._components[3]}setValue($){return this.value=$,this}set value($){if($ instanceof J)this._value=this._cloneSource($._value),this._int=$._int,this._components.set($._components);else if($===null)throw Error("Cannot set Color#value to null");else if(this._value===null||!this._isSourceEqual(this._value,$))this._value=this._cloneSource($),this._normalize(this._value)}get value(){return this._value}_cloneSource($){if(typeof $==="string"||typeof $==="number"||$ instanceof Number||$===null)return $;else if(Array.isArray($)||ArrayBuffer.isView($))return $.slice(0);else if(typeof $==="object"&&$!==null)return{...$};return $}_isSourceEqual($,Q){let Z=typeof $;if(Z!==typeof Q)return!1;else if(Z==="number"||Z==="string"||$ instanceof Number)return $===Q;else if(Array.isArray($)&&Array.isArray(Q)||ArrayBuffer.isView($)&&ArrayBuffer.isView(Q)){if($.length!==Q.length)return!1;return $.every((W,X)=>W===Q[X])}else if($!==null&&Q!==null){let W=Object.keys($),X=Object.keys(Q);if(W.length!==X.length)return!1;return W.every((H)=>$[H]===Q[H])}return $===Q}toRgba(){let[$,Q,Z,K]=this._components;return{r:$,g:Q,b:Z,a:K}}toRgb(){let[$,Q,Z]=this._components;return{r:$,g:Q,b:Z}}toRgbaString(){let[$,Q,Z]=this.toUint8RgbArray();return`rgba(${$},${Q},${Z},${this.alpha})`}toUint8RgbArray($){let[Q,Z,K]=this._components;if(!this._arrayRgb)this._arrayRgb=[];return $||($=this._arrayRgb),$[0]=Math.round(Q*255),$[1]=Math.round(Z*255),$[2]=Math.round(K*255),$}toArray($){if(!this._arrayRgba)this._arrayRgba=[];$||($=this._arrayRgba);let[Q,Z,K,W]=this._components;return $[0]=Q,$[1]=Z,$[2]=K,$[3]=W,$}toRgbArray($){if(!this._arrayRgb)this._arrayRgb=[];$||($=this._arrayRgb);let[Q,Z,K]=this._components;return $[0]=Q,$[1]=Z,$[2]=K,$}toNumber(){return this._int}toBgrNumber(){let[$,Q,Z]=this.toUint8RgbArray();return(Z<<16)+(Q<<8)+$}toLittleEndianNumber(){let $=this._int;return($>>16)+($&65280)+(($&255)<<16)}multiply($){let[Q,Z,K,W]=J._temp.setValue($)._components;return this._components[0]*=Q,this._components[1]*=Z,this._components[2]*=K,this._components[3]*=W,this._refreshInt(),this._value=null,this}premultiply($,Q=!0){if(Q)this._components[0]*=$,this._components[1]*=$,this._components[2]*=$;return this._components[3]=$,this._refreshInt(),this._value=null,this}toPremultiplied($,Q=!0){if($===1)return-16777216+this._int;if($===0)return Q?0:this._int;let Z=this._int>>16&255,K=this._int>>8&255,W=this._int&255;if(Q)Z=Z*$+0.5|0,K=K*$+0.5|0,W=W*$+0.5|0;return($*255<<24)+(Z<<16)+(K<<8)+W}toHex(){let $=this._int.toString(16);return`#${"000000".substring(0,6-$.length)+$}`}toHexa(){let Q=Math.round(this._components[3]*255).toString(16);return this.toHex()+"00".substring(0,2-Q.length)+Q}setAlpha($){return this._components[3]=this._clamp($),this}_normalize($){let Q,Z,K,W;if((typeof $==="number"||$ instanceof Number)&&$>=0&&$<=16777215){let X=$;Q=(X>>16&255)/255,Z=(X>>8&255)/255,K=(X&255)/255,W=1}else if((Array.isArray($)||$ instanceof Float32Array)&&$.length>=3&&$.length<=4)$=this._clamp($),[Q,Z,K,W=1]=$;else if(($ instanceof Uint8Array||$ instanceof Uint8ClampedArray)&&$.length>=3&&$.length<=4)$=this._clamp($,0,255),[Q,Z,K,W=255]=$,Q/=255,Z/=255,K/=255,W/=255;else if(typeof $==="string"||typeof $==="object"){if(typeof $==="string"){let H=J.HEX_PATTERN.exec($);if(H)$=`#${H[2]}`}let X=b6($);if(X.isValid())({r:Q,g:Z,b:K,a:W}=X.rgba),Q/=255,Z/=255,K/=255}if(Q!==void 0)this._components[0]=Q,this._components[1]=Z,this._components[2]=K,this._components[3]=W,this._refreshInt();else throw Error(`Unable to convert color ${$}`)}_refreshInt(){this._clamp(this._components);let[$,Q,Z]=this._components;this._int=($*255<<16)+(Q*255<<8)+(Z*255|0)}_clamp($,Q=0,Z=1){if(typeof $==="number")return Math.min(Math.max($,Q),Z);return $.forEach((K,W)=>{$[W]=Math.min(Math.max(K,Q),Z)}),$}static isColorLike($){return typeof $==="number"||typeof $==="string"||$ instanceof Number||$ instanceof J||Array.isArray($)||$ instanceof Uint8Array||$ instanceof Uint8ClampedArray||$ instanceof Float32Array||$.r!==void 0&&$.g!==void 0&&$.b!==void 0||$.r!==void 0&&$.g!==void 0&&$.b!==void 0&&$.a!==void 0||$.h!==void 0&&$.s!==void 0&&$.l!==void 0||$.h!==void 0&&$.s!==void 0&&$.l!==void 0&&$.a!==void 0||$.h!==void 0&&$.s!==void 0&&$.v!==void 0||$.h!==void 0&&$.s!==void 0&&$.v!==void 0&&$.a!==void 0}},R6;var _9=A(()=>{qq();Hq([GK]);_J.shared=new _J;_J._temp=new _J;_J.HEX_PATTERN=/^(#|0x)?(([a-f0-9]{3}){1,2}([a-f0-9]{2})?)$/i;R6=_J});var Yq;var Nq=A(()=>{Yq={cullArea:null,cullable:!1,cullableChildren:!0}});var Uq,Vq,Oq;var RK=A(()=>{Uq=Math.PI*2,Vq=180/Math.PI,Oq=Math.PI/180});class O8{constructor(J=0,$=0){this.x=0,this.y=0,this.x=J,this.y=$}clone(){return new O8(this.x,this.y)}copyFrom(J){return this.set(J.x,J.y),this}copyTo(J){return J.set(this.x,this.y),J}equals(J){return J.x===this.x&&J.y===this.y}set(J=0,$=J){return this.x=J,this.y=$,this}toString(){return`[pixi.js/math:Point x=${this.x} y=${this.y}]`}static get shared(){return LK.x=0,LK.y=0,LK}}var LK;var _7=A(()=>{LK=new O8});class B0{constructor(J=1,$=0,Q=0,Z=1,K=0,W=0){this.array=null,this.a=J,this.b=$,this.c=Q,this.d=Z,this.tx=K,this.ty=W}fromArray(J){this.a=J[0],this.b=J[1],this.c=J[3],this.d=J[4],this.tx=J[2],this.ty=J[5]}set(J,$,Q,Z,K,W){return this.a=J,this.b=$,this.c=Q,this.d=Z,this.tx=K,this.ty=W,this}toArray(J,$){if(!this.array)this.array=new Float32Array(9);let Q=$||this.array;if(J)Q[0]=this.a,Q[1]=this.b,Q[2]=0,Q[3]=this.c,Q[4]=this.d,Q[5]=0,Q[6]=this.tx,Q[7]=this.ty,Q[8]=1;else Q[0]=this.a,Q[1]=this.c,Q[2]=this.tx,Q[3]=this.b,Q[4]=this.d,Q[5]=this.ty,Q[6]=0,Q[7]=0,Q[8]=1;return Q}apply(J,$){$=$||new O8;let{x:Q,y:Z}=J;return $.x=this.a*Q+this.c*Z+this.tx,$.y=this.b*Q+this.d*Z+this.ty,$}applyInverse(J,$){$=$||new O8;let Q=this.a,Z=this.b,K=this.c,W=this.d,X=this.tx,H=this.ty,q=1/(Q*W+K*-Z),Y=J.x,N=J.y;return $.x=W*q*Y+-K*q*N+(H*K-X*W)*q,$.y=Q*q*N+-Z*q*Y+(-H*Q+X*Z)*q,$}translate(J,$){return this.tx+=J,this.ty+=$,this}scale(J,$){return this.a*=J,this.d*=$,this.c*=J,this.b*=$,this.tx*=J,this.ty*=$,this}rotate(J){let $=Math.cos(J),Q=Math.sin(J),Z=this.a,K=this.c,W=this.tx;return this.a=Z*$-this.b*Q,this.b=Z*Q+this.b*$,this.c=K*$-this.d*Q,this.d=K*Q+this.d*$,this.tx=W*$-this.ty*Q,this.ty=W*Q+this.ty*$,this}append(J){let $=this.a,Q=this.b,Z=this.c,K=this.d;return this.a=J.a*$+J.b*Z,this.b=J.a*Q+J.b*K,this.c=J.c*$+J.d*Z,this.d=J.c*Q+J.d*K,this.tx=J.tx*$+J.ty*Z+this.tx,this.ty=J.tx*Q+J.ty*K+this.ty,this}appendFrom(J,$){let{a:Q,b:Z,c:K,d:W,tx:X,ty:H}=J,q=$.a,Y=$.b,N=$.c,U=$.d;return this.a=Q*q+Z*N,this.b=Q*Y+Z*U,this.c=K*q+W*N,this.d=K*Y+W*U,this.tx=X*q+H*N+$.tx,this.ty=X*Y+H*U+$.ty,this}setTransform(J,$,Q,Z,K,W,X,H,q){return this.a=Math.cos(X+q)*K,this.b=Math.sin(X+q)*K,this.c=-Math.sin(X-H)*W,this.d=Math.cos(X-H)*W,this.tx=J-(Q*this.a+Z*this.c),this.ty=$-(Q*this.b+Z*this.d),this}prepend(J){let $=this.tx;if(J.a!==1||J.b!==0||J.c!==0||J.d!==1){let Q=this.a,Z=this.c;this.a=Q*J.a+this.b*J.c,this.b=Q*J.b+this.b*J.d,this.c=Z*J.a+this.d*J.c,this.d=Z*J.b+this.d*J.d}return this.tx=$*J.a+this.ty*J.c+J.tx,this.ty=$*J.b+this.ty*J.d+J.ty,this}decompose(J){let $=this.a,Q=this.b,Z=this.c,K=this.d,W=J.pivot,X=-Math.atan2(-Z,K),H=Math.atan2(Q,$),q=Math.abs(X+H);if(q<0.00001||Math.abs(Uq-q)<0.00001)J.rotation=H,J.skew.x=J.skew.y=0;else J.rotation=0,J.skew.x=X,J.skew.y=H;return J.scale.x=Math.sqrt($*$+Q*Q),J.scale.y=Math.sqrt(Z*Z+K*K),J.position.x=this.tx+(W.x*$+W.y*Z),J.position.y=this.ty+(W.x*Q+W.y*K),J}invert(){let J=this.a,$=this.b,Q=this.c,Z=this.d,K=this.tx,W=J*Z-$*Q;return this.a=Z/W,this.b=-$/W,this.c=-Q/W,this.d=J/W,this.tx=(Q*this.ty-Z*K)/W,this.ty=-(J*this.ty-$*K)/W,this}isIdentity(){return this.a===1&&this.b===0&&this.c===0&&this.d===1&&this.tx===0&&this.ty===0}identity(){return this.a=1,this.b=0,this.c=0,this.d=1,this.tx=0,this.ty=0,this}clone(){let J=new B0;return J.a=this.a,J.b=this.b,J.c=this.c,J.d=this.d,J.tx=this.tx,J.ty=this.ty,J}copyTo(J){return J.a=this.a,J.b=this.b,J.c=this.c,J.d=this.d,J.tx=this.tx,J.ty=this.ty,J}copyFrom(J){return this.a=J.a,this.b=J.b,this.c=J.c,this.d=J.d,this.tx=J.tx,this.ty=J.ty,this}equals(J){return J.a===this.a&&J.b===this.b&&J.c===this.c&&J.d===this.d&&J.tx===this.tx&&J.ty===this.ty}toString(){return`[pixi.js:Matrix a=${this.a} b=${this.b} c=${this.c} d=${this.d} tx=${this.tx} ty=${this.ty}]`}static get IDENTITY(){return sD.identity()}static get shared(){return uD.identity()}}var uD,sD;var E8=A(()=>{RK();_7();uD=new B0,sD=new B0});class x8{constructor(J,$,Q){this._x=$||0,this._y=Q||0,this._observer=J}clone(J){return new x8(J??this._observer,this._x,this._y)}set(J=0,$=J){if(this._x!==J||this._y!==$)this._x=J,this._y=$,this._observer._onUpdate(this);return this}copyFrom(J){if(this._x!==J.x||this._y!==J.y)this._x=J.x,this._y=J.y,this._observer._onUpdate(this);return this}copyTo(J){return J.set(this._x,this._y),J}equals(J){return J.x===this._x&&J.y===this._y}toString(){return`[pixi.js/math:ObservablePoint x=${this._x} y=${this._y} scope=${this._observer}]`}get x(){return this._x}set x(J){if(this._x!==J)this._x=J,this._observer._onUpdate(this)}get y(){return this._y}set y(J){if(this._y!==J)this._y=J,this._observer._onUpdate(this)}}var BK=()=>{};function i0(J="default"){if(AK[J]===void 0)AK[J]=-1;return++AK[J]}var AK;var W6=A(()=>{AK={default:-1}});var Fq,Z6="8.0.0",CJ,u0=(J,$,Q=3)=>{if(CJ.quiet||Fq.has($))return;let Z=Error().stack,K=`${$}
Deprecated since v${J}`,W=typeof console.groupCollapsed==="function"&&!CJ.noColor;if(typeof Z>"u")console.warn("PixiJS Deprecation Warning: ",K);else if(Z=Z.split(`
`).splice(Q).join(`
`),W)console.groupCollapsed("%cPixiJS Deprecation Warning: %c%s","color:#614108;background:#fffbe6","font-weight:normal;color:#614108;background:#fffbe6",K),console.warn(Z),console.groupEnd();else console.warn("PixiJS Deprecation Warning: ",K),console.warn(Z);Fq.add($)};var F6=A(()=>{Fq=new Set,CJ={quiet:!1,noColor:!1};Object.defineProperties(u0,{quiet:{get:()=>CJ.quiet,set:(J)=>{CJ.quiet=J},enumerable:!0,configurable:!1},noColor:{get:()=>CJ.noColor,set:(J)=>{CJ.noColor=J},enumerable:!0,configurable:!1}})});function v0(...J){if(_K===zq)return;if(_K++,_K===zq)console.warn("PixiJS Warning: too many warnings, no more warnings will be reported to the console by PixiJS.");else console.warn("PixiJS Warning: ",...J)}var _K=0,zq=500;var s8=()=>{};var i6;var EJ=A(()=>{i6={_registeredResources:new Set,register(J){this._registeredResources.add(J)},unregister(J){this._registeredResources.delete(J)},release(){this._registeredResources.forEach((J)=>J.clear())},get registeredCount(){return this._registeredResources.size},isRegistered(J){return this._registeredResources.has(J)},reset(){this._registeredResources.clear()}}});class CK{constructor(J,$){if(this._pool=[],this._count=0,this._index=0,this._classType=J,$)this.prepopulate($)}prepopulate(J){for(let $=0;$<J;$++)this._pool[this._index++]=new this._classType;this._count+=J}get(J){let $;if(this._index>0)$=this._pool[--this._index];else $=new this._classType,this._count++;return $.init?.(J),$}return(J){J.reset?.(),this._pool[this._index++]=J}get totalSize(){return this._count}get totalFree(){return this._index}get totalUsed(){return this._count-this._index}clear(){if(this._pool.length>0&&this._pool[0].destroy)for(let J=0;J<this._index;J++)this._pool[J].destroy();this._pool.length=0,this._count=0,this._index=0}}var Dq=()=>{};class kq{constructor(){this._poolsByClass=new Map}prepopulate(J,$){this.getPool(J).prepopulate($)}get(J,$){return this.getPool(J).get($)}return(J){this.getPool(J.constructor).return(J)}getPool(J){if(!this._poolsByClass.has(J))this._poolsByClass.set(J,new CK(J));return this._poolsByClass.get(J)}stats(){let J={};return this._poolsByClass.forEach(($)=>{let Q=J[$._classType.name]?$._classType.name+$._classType.ID:$._classType.name;J[Q]={free:$.totalFree,used:$.totalUsed,size:$.totalSize}}),J}clear(){this._poolsByClass.forEach((J)=>J.clear()),this._poolsByClass.clear()}}var n8;var PJ=A(()=>{EJ();Dq();n8=new kq;i6.register(n8)});var Iq;var wq=A(()=>{F6();Iq={get isCachedAsTexture(){return!!this.renderGroup?.isCachedAsTexture},cacheAsTexture(J){if(typeof J==="boolean"&&J===!1)this.disableRenderGroup();else this.enableRenderGroup(),this.renderGroup.enableCacheAsTexture(J===!0?{}:J)},updateCacheTexture(){this.renderGroup?.updateCacheTexture()},get cacheAsBitmap(){return this.isCachedAsTexture},set cacheAsBitmap(J){u0("v8.6.0","cacheAsBitmap is deprecated, use cacheAsTexture instead."),this.cacheAsTexture(J)}}});function b$(J,$,Q){let Z=J.length,K;if($>=Z||Q===0)return;Q=$+Q>Z?Z-$:Q;let W=Z-Q;for(K=$;K<W;++K)J[K]=J[K+Q];J.length=W}var EK=()=>{};var Mq;var Gq=A(()=>{EK();F6();Mq={allowChildren:!0,removeChildren(J=0,$){let Q=$??this.children.length,Z=Q-J,K=[];if(Z>0&&Z<=Q){for(let X=Q-1;X>=J;X--){let H=this.children[X];if(!H)continue;K.push(H),H.parent=null}b$(this.children,J,Q);let W=this.renderGroup||this.parentRenderGroup;if(W)W.removeChildren(K);for(let X=0;X<K.length;++X){let H=K[X];H.parentRenderLayer?.detach(H),this.emit("childRemoved",H,this,X),K[X].emit("removed",this)}if(K.length>0)this._didViewChangeTick++;return K}else if(Z===0&&this.children.length===0)return K;throw RangeError("removeChildren: numeric values are outside the acceptable range.")},removeChildAt(J){let $=this.getChildAt(J);return this.removeChild($)},getChildAt(J){if(J<0||J>=this.children.length)throw Error(`getChildAt: Index (${J}) does not exist.`);return this.children[J]},setChildIndex(J,$){if($<0||$>=this.children.length)throw Error(`The index ${$} supplied is out of bounds ${this.children.length}`);this.getChildIndex(J),this.addChildAt(J,$)},getChildIndex(J){let $=this.children.indexOf(J);if($===-1)throw Error("The supplied Container must be a child of the caller");return $},addChildAt(J,$){if(!this.allowChildren)u0(Z6,"addChildAt: Only Containers will be allowed to add children in v8.0.0");let{children:Q}=this;if($<0||$>Q.length)throw Error(`${J}addChildAt: The index ${$} supplied is out of bounds ${Q.length}`);if(J.parent){let K=J.parent.children.indexOf(J);if(J.parent===this&&K===$)return J;if(K!==-1)J.parent.children.splice(K,1)}if($===Q.length)Q.push(J);else Q.splice($,0,J);J.parent=this,J.didChange=!0,J._updateFlags=15;let Z=this.renderGroup||this.parentRenderGroup;if(Z)Z.addChild(J);if(this.sortableChildren)this.sortDirty=!0;return this.emit("childAdded",J,this,$),J.emit("added",this),J},swapChildren(J,$){if(J===$)return;let Q=this.getChildIndex(J),Z=this.getChildIndex($);this.children[Q]=$,this.children[Z]=J;let K=this.renderGroup||this.parentRenderGroup;if(K)K.structureDidChange=!0;this._didContainerChangeTick++},removeFromParent(){this.parent?.removeChild(this)},reparentChild(...J){if(J.length===1)return this.reparentChildAt(J[0],this.children.length);return J.forEach(($)=>this.reparentChildAt($,this.children.length)),J[0]},reparentChildAt(J,$){if(J.parent===this)return this.setChildIndex(J,$),J;let Q=J.worldTransform.clone();J.removeFromParent(),this.addChildAt(J,$);let Z=this.worldTransform.clone();return Z.invert(),Q.prepend(Z),J.setFromMatrix(Q),J},replaceChild(J,$){J.updateLocalTransform(),this.addChildAt($,this.getChildIndex(J)),$.setFromMatrix(J.localTransform),$.updateLocalTransform(),this.removeChild(J)}}});var Rq;var Lq=A(()=>{Rq={collectRenderables(J,$,Q){if(this.parentRenderLayer&&this.parentRenderLayer!==Q||this.globalDisplayStatus<7||!this.includeInBuild)return;if(this.sortableChildren)this.sortChildren();if(this.isSimple)this.collectRenderablesSimple(J,$,Q);else if(this.renderGroup)$.renderPipes.renderGroup.addRenderGroup(this.renderGroup,J);else this.collectRenderablesWithEffects(J,$,Q)},collectRenderablesSimple(J,$,Q){let Z=this.children,K=Z.length;for(let W=0;W<K;W++)Z[W].collectRenderables(J,$,Q)},collectRenderablesWithEffects(J,$,Q){let{renderPipes:Z}=$;for(let K=0;K<this.effects.length;K++){let W=this.effects[K];Z[W.pipe].push(W,this,J)}this.collectRenderablesSimple(J,$,Q);for(let K=this.effects.length-1;K>=0;K--){let W=this.effects[K];Z[W.pipe].pop(W,this,J)}}}});class C7{constructor(){this.pipe="filter",this.priority=1}destroy(){for(let J=0;J<this.filters.length;J++)this.filters[J].destroy();this.filters=null,this.filterArea=null}}var v$=()=>{};class Bq{constructor(){this._effectClasses=[],this._tests=[],this._initialized=!1}init(){if(this._initialized)return;this._initialized=!0,this._effectClasses.forEach((J)=>{this.add({test:J.test,maskClass:J})})}add(J){this._tests.push(J)}getMaskEffect(J){if(!this._initialized)this.init();for(let $=0;$<this._tests.length;$++){let Q=this._tests[$];if(Q.test(J))return n8.get(Q.maskClass,J)}return J}returnMaskEffect(J){n8.return(J)}}var f$;var Aq=A(()=>{k0();PJ();f$=new Bq;n0.handleByList(b.MaskEffect,f$._effectClasses)});var _q;var Cq=A(()=>{v$();Aq();_q={_maskEffect:null,_maskOptions:{inverse:!1},_filterEffect:null,effects:[],_markStructureAsChanged(){let J=this.renderGroup||this.parentRenderGroup;if(J)J.structureDidChange=!0},addEffect(J){if(this.effects.indexOf(J)!==-1)return;this.effects.push(J),this.effects.sort((Q,Z)=>Q.priority-Z.priority),this._markStructureAsChanged(),this._updateIsSimple()},removeEffect(J){let $=this.effects.indexOf(J);if($===-1)return;this.effects.splice($,1),this._markStructureAsChanged(),this._updateIsSimple()},set mask(J){let $=this._maskEffect;if($?.mask===J)return;if($)this.removeEffect($),f$.returnMaskEffect($),this._maskEffect=null;if(J===null||J===void 0)return;this._maskEffect=f$.getMaskEffect(J),this.addEffect(this._maskEffect)},get mask(){return this._maskEffect?.mask},setMask(J){if(this._maskOptions={...this._maskOptions,...J},J.mask)this.mask=J.mask;this._markStructureAsChanged()},set filters(J){if(!Array.isArray(J)&&J)J=[J];let $=this._filterEffect||(this._filterEffect=new C7);J=J;let Q=J?.length>0,Z=$.filters?.length>0,K=Q!==Z;if(J=Array.isArray(J)?J.slice(0):J,$.filters=Object.freeze(J),K)if(Q)this.addEffect($);else this.removeEffect($),$.filters=J??null},get filters(){return this._filterEffect?.filters},set filterArea(J){this._filterEffect||(this._filterEffect=new C7),this._filterEffect.filterArea=J},get filterArea(){return this._filterEffect?.filterArea}}});var Eq;var Pq=A(()=>{F6();Eq={label:null,get name(){return u0(Z6,"Container.name property has been removed, use Container.label instead"),this.label},set name(J){u0(Z6,"Container.name property has been removed, use Container.label instead"),this.label=J},getChildByName(J,$=!1){return this.getChildByLabel(J,$)},getChildByLabel(J,$=!1){let Q=this.children;for(let Z=0;Z<Q.length;Z++){let K=Q[Z];if(K.label===J||J instanceof RegExp&&J.test(K.label))return K}if($)for(let Z=0;Z<Q.length;Z++){let W=Q[Z].getChildByLabel(J,!0);if(W)return W}return null},getChildrenByLabel(J,$=!1,Q=[]){let Z=this.children;for(let K=0;K<Z.length;K++){let W=Z[K];if(W.label===J||J instanceof RegExp&&J.test(W.label))Q.push(W)}if($)for(let K=0;K<Z.length;K++)Z[K].getChildrenByLabel(J,!0,Q);return Q}}});class R8{constructor(J=0,$=0,Q=0,Z=0){this.type="rectangle",this.x=Number(J),this.y=Number($),this.width=Number(Q),this.height=Number(Z)}get left(){return this.x}get right(){return this.x+this.width}get top(){return this.y}get bottom(){return this.y+this.height}isEmpty(){return this.left===this.right||this.top===this.bottom}static get EMPTY(){return new R8(0,0,0,0)}clone(){return new R8(this.x,this.y,this.width,this.height)}copyFromBounds(J){return this.x=J.minX,this.y=J.minY,this.width=J.maxX-J.minX,this.height=J.maxY-J.minY,this}copyFrom(J){return this.x=J.x,this.y=J.y,this.width=J.width,this.height=J.height,this}copyTo(J){return J.copyFrom(this),J}contains(J,$){if(this.width<=0||this.height<=0)return!1;if(J>=this.x&&J<this.x+this.width){if($>=this.y&&$<this.y+this.height)return!0}return!1}strokeContains(J,$,Q,Z=0.5){let{width:K,height:W}=this;if(K<=0||W<=0)return!1;let X=this.x,H=this.y,q=Q*(1-Z),Y=Q-q,N=X-q,U=X+K+q,V=H-q,z=H+W+q,D=X+Y,w=X+K-Y,F=H+Y,O=H+W-Y;return J>=N&&J<=U&&$>=V&&$<=z&&!(J>D&&J<w&&$>F&&$<O)}intersects(J,$){if(!$){let j=this.x<J.x?J.x:this.x;if((this.right>J.right?J.right:this.right)<=j)return!1;let E=this.y<J.y?J.y:this.y;return(this.bottom>J.bottom?J.bottom:this.bottom)>E}let Q=this.left,Z=this.right,K=this.top,W=this.bottom;if(Z<=Q||W<=K)return!1;let X=h$[0].set(J.left,J.top),H=h$[1].set(J.left,J.bottom),q=h$[2].set(J.right,J.top),Y=h$[3].set(J.right,J.bottom);if(q.x<=X.x||H.y<=X.y)return!1;let N=Math.sign($.a*$.d-$.b*$.c);if(N===0)return!1;if($.apply(X,X),$.apply(H,H),$.apply(q,q),$.apply(Y,Y),Math.max(X.x,H.x,q.x,Y.x)<=Q||Math.min(X.x,H.x,q.x,Y.x)>=Z||Math.max(X.y,H.y,q.y,Y.y)<=K||Math.min(X.y,H.y,q.y,Y.y)>=W)return!1;let U=N*(H.y-X.y),V=N*(X.x-H.x),z=U*Q+V*K,D=U*Z+V*K,w=U*Q+V*W,F=U*Z+V*W;if(Math.max(z,D,w,F)<=U*X.x+V*X.y||Math.min(z,D,w,F)>=U*Y.x+V*Y.y)return!1;let O=N*(X.y-q.y),R=N*(q.x-X.x),B=O*Q+R*K,L=O*Z+R*K,y=O*Q+R*W,_=O*Z+R*W;if(Math.max(B,L,y,_)<=O*X.x+R*X.y||Math.min(B,L,y,_)>=O*Y.x+R*Y.y)return!1;return!0}pad(J=0,$=J){return this.x-=J,this.y-=$,this.width+=J*2,this.height+=$*2,this}fit(J){let $=Math.max(this.x,J.x),Q=Math.min(this.x+this.width,J.x+J.width),Z=Math.max(this.y,J.y),K=Math.min(this.y+this.height,J.y+J.height);return this.x=$,this.width=Math.max(Q-$,0),this.y=Z,this.height=Math.max(K-Z,0),this}ceil(J=1,$=0.001){let Q=Math.ceil((this.x+this.width-$)*J)/J,Z=Math.ceil((this.y+this.height-$)*J)/J;return this.x=Math.floor((this.x+$)*J)/J,this.y=Math.floor((this.y+$)*J)/J,this.width=Q-this.x,this.height=Z-this.y,this}scale(J,$=J){return this.x*=J,this.y*=$,this.width*=J,this.height*=$,this}enlarge(J){let $=Math.min(this.x,J.x),Q=Math.max(this.x+this.width,J.x+J.width),Z=Math.min(this.y,J.y),K=Math.max(this.y+this.height,J.y+J.height);return this.x=$,this.width=Q-$,this.y=Z,this.height=K-Z,this}getBounds(J){return J||(J=new R8),J.copyFrom(this),J}containsRect(J){if(this.width<=0||this.height<=0)return!1;let{x:$,y:Q}=J,Z=J.x+J.width,K=J.y+J.height;return $>=this.x&&$<this.x+this.width&&Q>=this.y&&Q<this.y+this.height&&Z>=this.x&&Z<this.x+this.width&&K>=this.y&&K<this.y+this.height}set(J,$,Q,Z){return this.x=J,this.y=$,this.width=Q,this.height=Z,this}toString(){return`[pixi.js/math:Rectangle x=${this.x} y=${this.y} width=${this.width} height=${this.height}]`}}var h$;var E7=A(()=>{_7();h$=[new O8,new O8,new O8,new O8]});class L8{constructor(J=1/0,$=1/0,Q=-1/0,Z=-1/0){this.minX=1/0,this.minY=1/0,this.maxX=-1/0,this.maxY=-1/0,this.matrix=jq,this.minX=J,this.minY=$,this.maxX=Q,this.maxY=Z}isEmpty(){return this.minX>this.maxX||this.minY>this.maxY}get rectangle(){if(!this._rectangle)this._rectangle=new R8;let J=this._rectangle;if(this.minX>this.maxX||this.minY>this.maxY)J.x=0,J.y=0,J.width=0,J.height=0;else J.copyFromBounds(this);return J}clear(){return this.minX=1/0,this.minY=1/0,this.maxX=-1/0,this.maxY=-1/0,this.matrix=jq,this}set(J,$,Q,Z){this.minX=J,this.minY=$,this.maxX=Q,this.maxY=Z}addFrame(J,$,Q,Z,K){K||(K=this.matrix);let{a:W,b:X,c:H,d:q,tx:Y,ty:N}=K,U=this.minX,V=this.minY,z=this.maxX,D=this.maxY,w=W*J+H*$+Y,F=X*J+q*$+N;if(w<U)U=w;if(F<V)V=F;if(w>z)z=w;if(F>D)D=F;if(w=W*Q+H*$+Y,F=X*Q+q*$+N,w<U)U=w;if(F<V)V=F;if(w>z)z=w;if(F>D)D=F;if(w=W*J+H*Z+Y,F=X*J+q*Z+N,w<U)U=w;if(F<V)V=F;if(w>z)z=w;if(F>D)D=F;if(w=W*Q+H*Z+Y,F=X*Q+q*Z+N,w<U)U=w;if(F<V)V=F;if(w>z)z=w;if(F>D)D=F;this.minX=U,this.minY=V,this.maxX=z,this.maxY=D}addRect(J,$){this.addFrame(J.x,J.y,J.x+J.width,J.y+J.height,$)}addBounds(J,$){this.addFrame(J.minX,J.minY,J.maxX,J.maxY,$)}addBoundsMask(J){this.minX=this.minX>J.minX?this.minX:J.minX,this.minY=this.minY>J.minY?this.minY:J.minY,this.maxX=this.maxX<J.maxX?this.maxX:J.maxX,this.maxY=this.maxY<J.maxY?this.maxY:J.maxY}applyMatrix(J){let $=this.minX,Q=this.minY,Z=this.maxX,K=this.maxY,{a:W,b:X,c:H,d:q,tx:Y,ty:N}=J,U=W*$+H*Q+Y,V=X*$+q*Q+N;this.minX=U,this.minY=V,this.maxX=U,this.maxY=V,U=W*Z+H*Q+Y,V=X*Z+q*Q+N,this.minX=U<this.minX?U:this.minX,this.minY=V<this.minY?V:this.minY,this.maxX=U>this.maxX?U:this.maxX,this.maxY=V>this.maxY?V:this.maxY,U=W*$+H*K+Y,V=X*$+q*K+N,this.minX=U<this.minX?U:this.minX,this.minY=V<this.minY?V:this.minY,this.maxX=U>this.maxX?U:this.maxX,this.maxY=V>this.maxY?V:this.maxY,U=W*Z+H*K+Y,V=X*Z+q*K+N,this.minX=U<this.minX?U:this.minX,this.minY=V<this.minY?V:this.minY,this.maxX=U>this.maxX?U:this.maxX,this.maxY=V>this.maxY?V:this.maxY}fit(J){if(this.minX<J.left)this.minX=J.left;if(this.maxX>J.right)this.maxX=J.right;if(this.minY<J.top)this.minY=J.top;if(this.maxY>J.bottom)this.maxY=J.bottom;return this}fitBounds(J,$,Q,Z){if(this.minX<J)this.minX=J;if(this.maxX>$)this.maxX=$;if(this.minY<Q)this.minY=Q;if(this.maxY>Z)this.maxY=Z;return this}pad(J,$=J){return this.minX-=J,this.maxX+=J,this.minY-=$,this.maxY+=$,this}ceil(){return this.minX=Math.floor(this.minX),this.minY=Math.floor(this.minY),this.maxX=Math.ceil(this.maxX),this.maxY=Math.ceil(this.maxY),this}clone(){return new L8(this.minX,this.minY,this.maxX,this.maxY)}scale(J,$=J){return this.minX*=J,this.minY*=$,this.maxX*=J,this.maxY*=$,this}get x(){return this.minX}set x(J){let $=this.maxX-this.minX;this.minX=J,this.maxX=J+$}get y(){return this.minY}set y(J){let $=this.maxY-this.minY;this.minY=J,this.maxY=J+$}get width(){return this.maxX-this.minX}set width(J){this.maxX=this.minX+J}get height(){return this.maxY-this.minY}set height(J){this.maxY=this.minY+J}get left(){return this.minX}get right(){return this.maxX}get top(){return this.minY}get bottom(){return this.maxY}get isPositive(){return this.maxX-this.minX>0&&this.maxY-this.minY>0}get isValid(){return this.minX+this.minY!==1/0}addVertexData(J,$,Q,Z){let K=this.minX,W=this.minY,X=this.maxX,H=this.maxY;Z||(Z=this.matrix);let{a:q,b:Y,c:N,d:U,tx:V,ty:z}=Z;for(let D=$;D<Q;D+=2){let w=J[D],F=J[D+1],O=q*w+N*F+V,R=Y*w+U*F+z;K=O<K?O:K,W=R<W?R:W,X=O>X?O:X,H=R>H?R:H}this.minX=K,this.minY=W,this.maxX=X,this.maxY=H}containsPoint(J,$){if(this.minX<=J&&this.minY<=$&&this.maxX>=J&&this.maxY>=$)return!0;return!1}toString(){return`[pixi.js:Bounds minX=${this.minX} minY=${this.minY} maxX=${this.maxX} maxY=${this.maxY} width=${this.width} height=${this.height}]`}copyFrom(J){return this.minX=J.minX,this.minY=J.minY,this.maxX=J.maxX,this.maxY=J.maxY,this}}var jq;var v6=A(()=>{E8();E7();jq=new B0});var T8,z6;var i7=A(()=>{E8();PJ();v6();T8=n8.getPool(B0),z6=n8.getPool(L8)});var nD,Sq;var Tq=A(()=>{E8();v6();i7();nD=new B0,Sq={getFastGlobalBounds(J,$){if($||($=new L8),$.clear(),this._getGlobalBoundsRecursive(!!J,$,this.parentRenderLayer),!$.isValid)$.set(0,0,0,0);let Q=this.renderGroup||this.parentRenderGroup;return $.applyMatrix(Q.worldTransform),$},_getGlobalBoundsRecursive(J,$,Q){let Z=$;if(J&&this.parentRenderLayer&&this.parentRenderLayer!==Q)return;if(this.localDisplayStatus!==7||!this.measurable)return;let K=!!this.effects.length;if(this.renderGroup||K)Z=z6.get().clear();if(this.boundsArea)$.addRect(this.boundsArea,this.worldTransform);else{if(this.renderPipeId){let X=this.bounds;Z.addFrame(X.minX,X.minY,X.maxX,X.maxY,this.groupTransform)}let W=this.children;for(let X=0;X<W.length;X++)W[X]._getGlobalBoundsRecursive(J,Z,Q)}if(K){let W=!1,X=this.renderGroup||this.parentRenderGroup;for(let H=0;H<this.effects.length;H++)if(this.effects[H].addBounds){if(!W)W=!0,Z.applyMatrix(X.worldTransform);this.effects[H].addBounds(Z,!0)}if(W)Z.applyMatrix(X.worldTransform.copyTo(nD).invert());$.addBounds(Z),z6.return(Z)}else if(this.renderGroup)$.addBounds(Z,this.relativeGroupTransform),z6.return(Z)}}});function jJ(J,$,Q){Q.clear();let Z,K;if(J.parent)if(!$)K=T8.get().identity(),Z=x$(J,K);else Z=J.parent.worldTransform;else Z=B0.IDENTITY;if(yq(J,Q,Z,$),K)T8.return(K);if(!Q.isValid)Q.set(0,0,0,0);return Q}function yq(J,$,Q,Z){if(!J.visible||!J.measurable)return;let K;if(!Z)J.updateLocalTransform(),K=T8.get(),K.appendFrom(J.localTransform,Q);else K=J.worldTransform;let W=$,X=!!J.effects.length;if(X)$=z6.get().clear();if(J.boundsArea)$.addRect(J.boundsArea,K);else{let H=J.bounds;if(H&&!H.isEmpty())$.matrix=K,$.addBounds(H);for(let q=0;q<J.children.length;q++)yq(J.children[q],$,K,Z)}if(X){for(let H=0;H<J.effects.length;H++)J.effects[H].addBounds?.($);W.addBounds($,B0.IDENTITY),z6.return($)}if(!Z)T8.return(K)}function x$(J,$){let Q=J.parent;if(Q)x$(Q,$),Q.updateLocalTransform(),$.append(Q.localTransform);return $}var C9=A(()=>{E8();i7()});function bq(J,$){if(J===16777215||!$)return $;if($===16777215||!J)return J;let Q=J>>16&255,Z=J>>8&255,K=J&255,W=$>>16&255,X=$>>8&255,H=$&255,q=Q*W/255|0,Y=Z*X/255|0,N=K*H/255|0;return(q<<16)+(Y<<8)+N}var vq=()=>{};function SJ(J,$){if(J===fq)return $;if($===fq)return J;return bq(J,$)}var fq=16777215;var PK=A(()=>{vq()});function E9(J){return((J&255)<<16)+(J&65280)+(J>>16&255)}var hq;var xq=A(()=>{E8();C9();i7();PK();hq={getGlobalAlpha(J){if(J){if(this.renderGroup)return this.renderGroup.worldAlpha;if(this.parentRenderGroup)return this.parentRenderGroup.worldAlpha*this.alpha;return this.alpha}let $=this.alpha,Q=this.parent;while(Q)$*=Q.alpha,Q=Q.parent;return $},getGlobalTransform(J=new B0,$){if($)return J.copyFrom(this.worldTransform);this.updateLocalTransform();let Q=x$(this,T8.get().identity());return J.appendFrom(this.localTransform,Q),T8.return(Q),J},getGlobalTint(J){if(J){if(this.renderGroup)return E9(this.renderGroup.worldColor);if(this.parentRenderGroup)return E9(SJ(this.localColor,this.parentRenderGroup.worldColor));return this.tint}let $=this.localColor,Q=this.parent;while(Q)$=SJ($,Q.localColor),Q=Q.parent;return E9($)}}});function TJ(J,$,Q){if($.clear(),Q||(Q=B0.IDENTITY),gq(J,$,Q,J,!0),!$.isValid)$.set(0,0,0,0);return $}function gq(J,$,Q,Z,K){let W;if(!K){if(!J.visible||!J.measurable)return;J.updateLocalTransform();let q=J.localTransform;W=T8.get(),W.appendFrom(q,Q)}else W=T8.get(),W=Q.copyTo(W);let X=$,H=!!J.effects.length;if(H)$=z6.get().clear();if(J.boundsArea)$.addRect(J.boundsArea,W);else{if(J.renderPipeId)$.matrix=W,$.addBounds(J.bounds);let q=J.children;for(let Y=0;Y<q.length;Y++)gq(q[Y],$,W,Z,!1)}if(H){for(let q=0;q<J.effects.length;q++)J.effects[q].addLocalBounds?.($,Z);X.addBounds($,B0.IDENTITY),z6.return($)}T8.return(W)}var g$=A(()=>{E8();i7()});function jK(J,$){let Q=J.children;for(let Z=0;Z<Q.length;Z++){let K=Q[Z],W=K.uid,X=(K._didViewChangeTick&65535)<<16|K._didContainerChangeTick&65535,H=$.index;if($.data[H]!==W||$.data[H+1]!==X)$.data[$.index]=W,$.data[$.index+1]=X,$.didChange=!0;if($.index=H+2,K.children.length)jK(K,$)}return $.didChange}var pq=()=>{};var iD,mq;var dq=A(()=>{E8();v6();C9();g$();pq();iD=new B0,mq={_localBoundsCacheId:-1,_localBoundsCacheData:null,_setWidth(J,$){let Q=Math.sign(this.scale.x)||1;if($!==0)this.scale.x=J/$*Q;else this.scale.x=Q},_setHeight(J,$){let Q=Math.sign(this.scale.y)||1;if($!==0)this.scale.y=J/$*Q;else this.scale.y=Q},getLocalBounds(){if(!this._localBoundsCacheData)this._localBoundsCacheData={data:[],index:1,didChange:!1,localBounds:new L8};let J=this._localBoundsCacheData;if(J.index=1,J.didChange=!1,J.data[0]!==this._didViewChangeTick)J.didChange=!0,J.data[0]=this._didViewChangeTick;if(jK(this,J),J.didChange)TJ(this,J.localBounds,iD);return J.localBounds},getBounds(J,$){return jJ(this,J,$||new L8)}}});var lq;var cq=A(()=>{lq={_onRender:null,set onRender(J){let $=this.renderGroup||this.parentRenderGroup;if(!J){if(this._onRender)$?.removeOnRender(this);this._onRender=null;return}if(!this._onRender)$?.addOnRender(this);this._onRender=J},get onRender(){return this._onRender}}});function oD(J,$){return J._zIndex-$._zIndex}var uq;var sq=A(()=>{uq={_zIndex:0,sortDirty:!1,sortableChildren:!1,get zIndex(){return this._zIndex},set zIndex(J){if(this._zIndex===J)return;this._zIndex=J,this.depthOfChildModified()},depthOfChildModified(){if(this.parent)this.parent.sortableChildren=!0,this.parent.sortDirty=!0;if(this.parentRenderGroup)this.parentRenderGroup.structureDidChange=!0},sortChildren(){if(!this.sortDirty)return;this.sortDirty=!1,this.children.sort(oD)}}});var nq;var iq=A(()=>{_7();i7();nq={getGlobalPosition(J=new O8,$=!1){if(this.parent)this.parent.toGlobal(this._position,J,$);else J.x=this._position.x,J.y=this._position.y;return J},toGlobal(J,$,Q=!1){let Z=this.getGlobalTransform(T8.get(),Q);return $=Z.apply(J,$),T8.return(Z),$},toLocal(J,$,Q,Z){if($)J=$.toGlobal(J,Q,Z);let K=this.getGlobalTransform(T8.get(),Z);return Q=K.applyInverse(J,Q),T8.return(K),Q}}});class SK{constructor(){this.uid=i0("instructionSet"),this.instructions=[],this.instructionSize=0,this.renderables=[],this.gcTick=0}reset(){this.instructionSize=0}destroy(){this.instructions.length=0,this.renderables.length=0,this.renderPipes=null,this.gcTick=0}add(J){this.instructions[this.instructionSize++]=J}log(){this.instructions.length=this.instructionSize,console.table(this.instructions,["type","action"])}}var oq=A(()=>{W6()});function TK(J){return J+=J===0?1:0,--J,J|=J>>>1,J|=J>>>2,J|=J>>>4,J|=J>>>8,J|=J>>>16,J+1}function yK(J){return!(J&J-1)&&!!J}var bK=()=>{};function aq(J){let $={};for(let Q in J)if(J[Q]!==void 0)$[Q]=J[Q];return $}var rq=()=>{};function aD(J){let $=tq[J];if($===void 0)tq[J]=i0("resource");return $}var tq,eq,yJ;var p$=A(()=>{O6();W6();F6();tq=Object.create(null);eq=class J extends C8{constructor($={}){super();this._resourceType="textureSampler",this._touched=0,this._maxAnisotropy=1,this.destroyed=!1,$={...J.defaultOptions,...$},this.addressMode=$.addressMode,this.addressModeU=$.addressModeU??this.addressModeU,this.addressModeV=$.addressModeV??this.addressModeV,this.addressModeW=$.addressModeW??this.addressModeW,this.scaleMode=$.scaleMode,this.magFilter=$.magFilter??this.magFilter,this.minFilter=$.minFilter??this.minFilter,this.mipmapFilter=$.mipmapFilter??this.mipmapFilter,this.lodMinClamp=$.lodMinClamp,this.lodMaxClamp=$.lodMaxClamp,this.compare=$.compare,this.maxAnisotropy=$.maxAnisotropy??1}set addressMode($){this.addressModeU=$,this.addressModeV=$,this.addressModeW=$}get addressMode(){return this.addressModeU}set wrapMode($){u0(Z6,"TextureStyle.wrapMode is now TextureStyle.addressMode"),this.addressMode=$}get wrapMode(){return this.addressMode}set scaleMode($){this.magFilter=$,this.minFilter=$,this.mipmapFilter=$}get scaleMode(){return this.magFilter}set maxAnisotropy($){if(this._maxAnisotropy=Math.min($,16),this._maxAnisotropy>1)this.scaleMode="linear"}get maxAnisotropy(){return this._maxAnisotropy}get _resourceId(){return this._sharedResourceId||this._generateResourceId()}update(){this._sharedResourceId=null,this.emit("change",this)}_generateResourceId(){let $=`${this.addressModeU}-${this.addressModeV}-${this.addressModeW}-${this.magFilter}-${this.minFilter}-${this.mipmapFilter}-${this.lodMinClamp}-${this.lodMaxClamp}-${this.compare}-${this._maxAnisotropy}`;return this._sharedResourceId=aD($),this._resourceId}destroy(){this.destroyed=!0,this.emit("destroy",this),this.emit("change",this),this.removeAllListeners()}};eq.defaultOptions={addressMode:"clamp-to-edge",scaleMode:"linear"};yJ=eq});var J1,$8;var X6=A(()=>{O6();bK();rq();W6();p$();J1=class J extends C8{constructor($={}){super();if(this.options=$,this._gpuData=Object.create(null),this._gcLastUsed=-1,this.uid=i0("textureSource"),this._resourceType="textureSource",this._resourceId=i0("resource"),this.uploadMethodId="unknown",this._resolution=1,this.pixelWidth=1,this.pixelHeight=1,this.width=1,this.height=1,this.sampleCount=1,this.mipLevelCount=1,this.autoGenerateMipmaps=!1,this.format="rgba8unorm",this.dimension="2d",this.viewDimension="2d",this.arrayLayerCount=1,this.antialias=!1,this._touched=0,this._batchTick=-1,this._textureBindLocation=-1,$={...J.defaultOptions,...$},this.label=$.label??"",this.resource=$.resource,this.autoGarbageCollect=$.autoGarbageCollect,this._resolution=$.resolution,$.width)this.pixelWidth=$.width*this._resolution;else this.pixelWidth=this.resource?this.resourceWidth??1:1;if($.height)this.pixelHeight=$.height*this._resolution;else this.pixelHeight=this.resource?this.resourceHeight??1:1;this.width=this.pixelWidth/this._resolution,this.height=this.pixelHeight/this._resolution,this.format=$.format,this.dimension=$.dimensions,this.viewDimension=$.viewDimension??$.dimensions,this.arrayLayerCount=$.arrayLayerCount,this.mipLevelCount=$.mipLevelCount,this.autoGenerateMipmaps=$.autoGenerateMipmaps,this.sampleCount=$.sampleCount,this.antialias=$.antialias,this.alphaMode=$.alphaMode,this.style=new yJ(aq($)),this.destroyed=!1,this._refreshPOT()}get source(){return this}get style(){return this._style}set style($){if(this.style===$)return;this._style?.off("change",this._onStyleChange,this),this._style=$,this._style?.on("change",this._onStyleChange,this),this._onStyleChange()}set maxAnisotropy($){this._style.maxAnisotropy=$}get maxAnisotropy(){return this._style.maxAnisotropy}get addressMode(){return this._style.addressMode}set addressMode($){this._style.addressMode=$}get repeatMode(){return this._style.addressMode}set repeatMode($){this._style.addressMode=$}get magFilter(){return this._style.magFilter}set magFilter($){this._style.magFilter=$}get minFilter(){return this._style.minFilter}set minFilter($){this._style.minFilter=$}get mipmapFilter(){return this._style.mipmapFilter}set mipmapFilter($){this._style.mipmapFilter=$}get lodMinClamp(){return this._style.lodMinClamp}set lodMinClamp($){this._style.lodMinClamp=$}get lodMaxClamp(){return this._style.lodMaxClamp}set lodMaxClamp($){this._style.lodMaxClamp=$}_onStyleChange(){this.emit("styleChange",this)}update(){if(this.resource){let $=this._resolution;if(this.resize(this.resourceWidth/$,this.resourceHeight/$))return}this.emit("update",this)}destroy(){if(this.destroyed=!0,this.unload(),this.emit("destroy",this),this._style)this._style.destroy(),this._style=null;this.uploadMethodId=null,this.resource=null,this.removeAllListeners()}unload(){this._resourceId=i0("resource"),this.emit("change",this),this.emit("unload",this);for(let $ in this._gpuData)this._gpuData[$]?.destroy?.();this._gpuData=Object.create(null)}get resourceWidth(){let{resource:$}=this;return $.naturalWidth||$.videoWidth||$.displayWidth||$.width}get resourceHeight(){let{resource:$}=this;return $.naturalHeight||$.videoHeight||$.displayHeight||$.height}get resolution(){return this._resolution}set resolution($){if(this._resolution===$)return;this._resolution=$,this.width=this.pixelWidth/$,this.height=this.pixelHeight/$}resize($,Q,Z){Z||(Z=this._resolution),$||($=this.width),Q||(Q=this.height);let K=Math.round($*Z),W=Math.round(Q*Z);if(this.width=K/Z,this.height=W/Z,this._resolution=Z,this.pixelWidth===K&&this.pixelHeight===W)return!1;return this._refreshPOT(),this.pixelWidth=K,this.pixelHeight=W,this.emit("resize",this),this._resourceId=i0("resource"),this.emit("change",this),!0}updateMipmaps(){if(this.autoGenerateMipmaps&&this.mipLevelCount>1)this.emit("updateMipmaps",this)}set wrapMode($){this._style.wrapMode=$}get wrapMode(){return this._style.wrapMode}set scaleMode($){this._style.scaleMode=$}get scaleMode(){return this._style.scaleMode}_refreshPOT(){this.isPowerOfTwo=yK(this.pixelWidth)&&yK(this.pixelHeight)}static test($){throw Error("Unimplemented")}};J1.defaultOptions={resolution:1,format:"bgra8unorm",alphaMode:"premultiply-alpha-on-upload",dimensions:"2d",viewDimension:"2d",arrayLayerCount:1,mipLevelCount:1,autoGenerateMipmaps:!1,sampleCount:1,antialias:!1,autoGarbageCollect:!1};$8=J1});function rD(){for(let J=0;J<16;J++){let $=[];vK.push($);for(let Q=0;Q<16;Q++){let Z=m$(o7[J]*o7[Q]+r7[J]*a7[Q]),K=m$(a7[J]*o7[Q]+t7[J]*a7[Q]),W=m$(o7[J]*r7[Q]+r7[J]*t7[Q]),X=m$(a7[J]*r7[Q]+t7[J]*t7[Q]);for(let H=0;H<16;H++)if(o7[H]===Z&&a7[H]===K&&r7[H]===W&&t7[H]===X){$.push(H);break}}}for(let J=0;J<16;J++){let $=new B0;$.set(o7[J],a7[J],r7[J],t7[J],0,0),$1.push($)}}var o7,a7,r7,t7,vK,$1,m$,N8;var Q1=A(()=>{E8();o7=[1,1,0,-1,-1,-1,0,1,1,1,0,-1,-1,-1,0,1],a7=[0,1,1,1,0,-1,-1,-1,0,1,1,1,0,-1,-1,-1],r7=[0,-1,-1,-1,0,1,1,1,0,1,1,1,0,-1,-1,-1],t7=[1,1,0,-1,-1,-1,0,1,-1,-1,0,1,1,1,0,-1],vK=[],$1=[],m$=Math.sign;rD();N8={E:0,SE:1,S:2,SW:3,W:4,NW:5,N:6,NE:7,MIRROR_VERTICAL:8,MAIN_DIAGONAL:10,MIRROR_HORIZONTAL:12,REVERSE_DIAGONAL:14,uX:(J)=>o7[J],uY:(J)=>a7[J],vX:(J)=>r7[J],vY:(J)=>t7[J],inv:(J)=>{if(J&8)return J&15;return-J&7},add:(J,$)=>vK[J][$],sub:(J,$)=>vK[J][N8.inv($)],rotate180:(J)=>J^4,isVertical:(J)=>(J&3)===2,byDirection:(J,$)=>{if(Math.abs(J)*2<=Math.abs($)){if($>=0)return N8.S;return N8.N}else if(Math.abs($)*2<=Math.abs(J)){if(J>0)return N8.E;return N8.W}else if($>0){if(J>0)return N8.SE;return N8.SW}else if(J>0)return N8.NE;return N8.NW},matrixAppendRotationInv:(J,$,Q=0,Z=0,K=0,W=0)=>{let X=$1[N8.inv($)],H=X.a,q=X.b,Y=X.c,N=X.d,U=Q-Math.min(0,H*K,Y*W,H*K+Y*W),V=Z-Math.min(0,q*K,N*W,q*K+N*W),z=J.a,D=J.b,w=J.c,F=J.d;J.a=H*z+q*w,J.b=H*D+q*F,J.c=Y*z+N*w,J.d=Y*D+N*F,J.tx=U*z+V*w+J.tx,J.ty=U*D+V*F+J.ty},transformRectCoords:(J,$,Q,Z)=>{let{x:K,y:W,width:X,height:H}=J,{x:q,y:Y,width:N,height:U}=$;if(Q===N8.E)return Z.set(K+q,W+Y,X,H),Z;else if(Q===N8.S)return Z.set(N-W-H+q,K+Y,H,X);else if(Q===N8.W)return Z.set(N-K-X+q,U-W-H+Y,X,H);else if(Q===N8.N)return Z.set(W+q,U-K-X+Y,H,X);return Z.set(K+q,W+Y,X,H)}}});var fK=()=>{};var Z1=()=>{};var bJ;var hK=A(()=>{k0();X6();bJ=class bJ extends $8{constructor(J){let $=J.resource||new Float32Array(J.width*J.height*4),Q=J.format;if(!Q)if($ instanceof Float32Array)Q="rgba32float";else if($ instanceof Int32Array)Q="rgba32uint";else if($ instanceof Uint32Array)Q="rgba32uint";else if($ instanceof Int16Array)Q="rgba16uint";else if($ instanceof Uint16Array)Q="rgba16uint";else if($ instanceof Int8Array)Q="bgra8unorm";else Q="bgra8unorm";super({...J,resource:$,format:Q});this.uploadMethodId="buffer"}static test(J){return J instanceof Int8Array||J instanceof Uint8Array||J instanceof Uint8ClampedArray||J instanceof Int16Array||J instanceof Uint16Array||J instanceof Int32Array||J instanceof Uint32Array||J instanceof Float32Array}};bJ.extension=b.TextureSource});class P9{constructor(J,$){if(this.mapCoord=new B0,this.uClampFrame=new Float32Array(4),this.uClampOffset=new Float32Array(2),this._textureID=-1,this._updateID=0,this.clampOffset=0,typeof $>"u")this.clampMargin=J.width<10?0:0.5;else this.clampMargin=$;this.isSimple=!1,this.texture=J}get texture(){return this._texture}set texture(J){if(this.texture===J)return;this._texture?.removeListener("update",this.update,this),this._texture=J,this._texture.addListener("update",this.update,this),this.update()}multiplyUvs(J,$){if($===void 0)$=J;let Q=this.mapCoord;for(let Z=0;Z<J.length;Z+=2){let K=J[Z],W=J[Z+1];$[Z]=K*Q.a+W*Q.c+Q.tx,$[Z+1]=K*Q.b+W*Q.d+Q.ty}return $}update(){let J=this._texture;this._updateID++;let $=J.uvs;this.mapCoord.set($.x1-$.x0,$.y1-$.y0,$.x3-$.x0,$.y3-$.y0,$.x0,$.y0);let{orig:Q,trim:Z}=J;if(Z)K1.set(Q.width/Z.width,0,0,Q.height/Z.height,-Z.x/Z.width,-Z.y/Z.height),this.mapCoord.append(K1);let K=J.source,W=this.uClampFrame,X=this.clampMargin/K._resolution,H=this.clampOffset/K._resolution;return W[0]=(J.frame.x+X+H)/K.width,W[1]=(J.frame.y+X+H)/K.height,W[2]=(J.frame.x+J.frame.width-X+H)/K.width,W[3]=(J.frame.y+J.frame.height-X+H)/K.height,this.uClampOffset[0]=this.clampOffset/K.pixelWidth,this.uClampOffset[1]=this.clampOffset/K.pixelHeight,this.isSimple=J.frame.width===K.width&&J.frame.height===K.height&&J.rotate===0,!0}}var K1;var xK=A(()=>{E8();K1=new B0});var P0;var i8=A(()=>{O6();Q1();E7();W6();F6();Z1();hK();X6();xK();P0=class P0 extends C8{constructor({source:J,label:$,frame:Q,orig:Z,trim:K,defaultAnchor:W,defaultBorders:X,rotate:H,dynamic:q}={}){super();if(this.uid=i0("texture"),this.uvs={x0:0,y0:0,x1:0,y1:0,x2:0,y2:0,x3:0,y3:0},this.frame=new R8,this.noFrame=!1,this.dynamic=!1,this.isTexture=!0,this.label=$,this.source=J?.source??new $8,this.noFrame=!Q,Q)this.frame.copyFrom(Q);else{let{width:Y,height:N}=this._source;this.frame.width=Y,this.frame.height=N}this.orig=Z||this.frame,this.trim=K,this.rotate=H??0,this.defaultAnchor=W,this.defaultBorders=X,this.destroyed=!1,this.dynamic=q||!1,this.updateUvs()}set source(J){if(this._source)this._source.off("resize",this.update,this);this._source=J,J.on("resize",this.update,this),this.emit("update",this)}get source(){return this._source}get textureMatrix(){if(!this._textureMatrix)this._textureMatrix=new P9(this);return this._textureMatrix}get width(){return this.orig.width}get height(){return this.orig.height}updateUvs(){let{uvs:J,frame:$}=this,{width:Q,height:Z}=this._source,K=$.x/Q,W=$.y/Z,X=$.width/Q,H=$.height/Z,q=this.rotate;if(q){let Y=X/2,N=H/2,U=K+Y,V=W+N;q=N8.add(q,N8.NW),J.x0=U+Y*N8.uX(q),J.y0=V+N*N8.uY(q),q=N8.add(q,2),J.x1=U+Y*N8.uX(q),J.y1=V+N*N8.uY(q),q=N8.add(q,2),J.x2=U+Y*N8.uX(q),J.y2=V+N*N8.uY(q),q=N8.add(q,2),J.x3=U+Y*N8.uX(q),J.y3=V+N*N8.uY(q)}else J.x0=K,J.y0=W,J.x1=K+X,J.y1=W,J.x2=K+X,J.y2=W+H,J.x3=K,J.y3=W+H}destroy(J=!1){if(this._source){if(this._source.off("resize",this.update,this),J)this._source.destroy(),this._source=null}this._textureMatrix=null,this.destroyed=!0,this.emit("destroy",this),this.removeAllListeners()}update(){if(this.noFrame)this.frame.width=this._source.width,this.frame.height=this._source.height;this.updateUvs(),this.emit("update",this)}get baseTexture(){return u0(Z6,"Texture.baseTexture is now Texture.source"),this._source}};P0.EMPTY=new P0({label:"EMPTY",source:new $8({label:"EMPTY"})});P0.EMPTY.destroy=fK;P0.WHITE=new P0({source:new bJ({resource:new Uint8Array([255,255,255,255]),width:1,height:1,alphaMode:"premultiply-alpha-on-upload",label:"WHITE"}),label:"WHITE"});P0.WHITE.destroy=fK});class W1{constructor(J){this._poolKeyHash=Object.create(null),this._texturePool={},this.textureOptions=J||{},this.enableFullScreen=!1,this.textureStyle=new yJ(this.textureOptions)}createTexture(J,$,Q){let Z=new $8({...this.textureOptions,width:J,height:$,resolution:1,antialias:Q,autoGarbageCollect:!1});return new P0({source:Z,label:`texturePool_${tD++}`})}getOptimalTexture(J,$,Q=1,Z){let K=Math.ceil(J*Q-0.000001),W=Math.ceil($*Q-0.000001);K=TK(K),W=TK(W);let X=(K<<17)+(W<<1)+(Z?1:0);if(!this._texturePool[X])this._texturePool[X]=[];let H=this._texturePool[X].pop();if(!H)H=this.createTexture(K,W,Z);return H.source._resolution=Q,H.source.width=K/Q,H.source.height=W/Q,H.source.pixelWidth=K,H.source.pixelHeight=W,H.frame.x=0,H.frame.y=0,H.frame.width=J,H.frame.height=$,H.updateUvs(),this._poolKeyHash[H.uid]=X,H}getSameSizeTexture(J,$=!1){let Q=J.source;return this.getOptimalTexture(J.width,J.height,Q._resolution,$)}returnTexture(J,$=!1){let Q=this._poolKeyHash[J.uid];if($)J.source.style=this.textureStyle;this._texturePool[Q].push(J)}clear(J){if(J=J!==!1,J)for(let $ in this._texturePool){let Q=this._texturePool[$];if(Q)for(let Z=0;Z<Q.length;Z++)Q[Z].destroy(!0)}this._texturePool={}}}var tD=0,g8;var j9=A(()=>{bK();EJ();X6();i8();p$();g8=new W1;i6.register(g8)});class vJ{constructor(){this.renderPipeId="renderGroup",this.root=null,this.canBundle=!1,this.renderGroupParent=null,this.renderGroupChildren=[],this.worldTransform=new B0,this.worldColorAlpha=4294967295,this.worldColor=16777215,this.worldAlpha=1,this.childrenToUpdate=Object.create(null),this.updateTick=0,this.gcTick=0,this.childrenRenderablesToUpdate={list:[],index:0},this.structureDidChange=!0,this.instructionSet=new SK,this._onRenderContainers=[],this.textureNeedsUpdate=!0,this.isCachedAsTexture=!1,this._matrixDirty=7}init(J){if(this.root=J,J._onRender)this.addOnRender(J);J.didChange=!0;let $=J.children;for(let Q=0;Q<$.length;Q++){let Z=$[Q];Z._updateFlags=15,this.addChild(Z)}}enableCacheAsTexture(J={}){this.textureOptions=J,this.isCachedAsTexture=!0,this.textureNeedsUpdate=!0}disableCacheAsTexture(){if(this.isCachedAsTexture=!1,this.texture)g8.returnTexture(this.texture,!0),this.texture=null}updateCacheTexture(){this.textureNeedsUpdate=!0;let J=this._parentCacheAsTextureRenderGroup;if(J&&!J.textureNeedsUpdate)J.updateCacheTexture()}reset(){this.renderGroupChildren.length=0;for(let J in this.childrenToUpdate){let $=this.childrenToUpdate[J];$.list.fill(null),$.index=0}this.childrenRenderablesToUpdate.index=0,this.childrenRenderablesToUpdate.list.fill(null),this.root=null,this.updateTick=0,this.structureDidChange=!0,this._onRenderContainers.length=0,this.renderGroupParent=null,this.disableCacheAsTexture()}get localTransform(){return this.root.localTransform}addRenderGroupChild(J){if(J.renderGroupParent)J.renderGroupParent._removeRenderGroupChild(J);J.renderGroupParent=this,this.renderGroupChildren.push(J)}_removeRenderGroupChild(J){let $=this.renderGroupChildren.indexOf(J);if($>-1)this.renderGroupChildren.splice($,1);J.renderGroupParent=null}addChild(J){if(this.structureDidChange=!0,J.parentRenderGroup=this,J.updateTick=-1,J.parent===this.root)J.relativeRenderGroupDepth=1;else J.relativeRenderGroupDepth=J.parent.relativeRenderGroupDepth+1;if(J.didChange=!0,this.onChildUpdate(J),J.renderGroup){this.addRenderGroupChild(J.renderGroup);return}if(J._onRender)this.addOnRender(J);let $=J.children;for(let Q=0;Q<$.length;Q++)this.addChild($[Q])}removeChild(J){if(this.structureDidChange=!0,J._onRender){if(!J.renderGroup)this.removeOnRender(J)}if(J.parentRenderGroup=null,J.renderGroup){this._removeRenderGroupChild(J.renderGroup);return}let $=J.children;for(let Q=0;Q<$.length;Q++)this.removeChild($[Q])}removeChildren(J){for(let $=0;$<J.length;$++)this.removeChild(J[$])}onChildUpdate(J){let $=this.childrenToUpdate[J.relativeRenderGroupDepth];if(!$)$=this.childrenToUpdate[J.relativeRenderGroupDepth]={index:0,list:[]};$.list[$.index++]=J}updateRenderable(J){if(J.globalDisplayStatus<7)return;this.instructionSet.renderPipes[J.renderPipeId].updateRenderable(J),J.didViewUpdate=!1}onChildViewUpdate(J){this.childrenRenderablesToUpdate.list[this.childrenRenderablesToUpdate.index++]=J}get isRenderable(){return this.root.localDisplayStatus===7&&this.worldAlpha>0}addOnRender(J){this._onRenderContainers.push(J)}removeOnRender(J){this._onRenderContainers.splice(this._onRenderContainers.indexOf(J),1)}runOnRender(J){for(let $=0;$<this._onRenderContainers.length;$++)this._onRenderContainers[$]._onRender(J)}destroy(){this.disableCacheAsTexture(),this.renderGroupParent=null,this.root=null,this.childrenRenderablesToUpdate=null,this.childrenToUpdate=null,this.renderGroupChildren=null,this._onRenderContainers=null,this.instructionSet=null}getChildren(J=[]){let $=this.root.children;for(let Q=0;Q<$.length;Q++)this._getChildren($[Q],J);return J}_getChildren(J,$=[]){if($.push(J),J.renderGroup)return $;let Q=J.children;for(let Z=0;Z<Q.length;Z++)this._getChildren(Q[Z],$);return $}invalidateMatrices(){this._matrixDirty=7}get inverseWorldTransform(){if((this._matrixDirty&1)===0)return this._inverseWorldTransform;return this._matrixDirty&=-2,this._inverseWorldTransform||(this._inverseWorldTransform=new B0),this._inverseWorldTransform.copyFrom(this.worldTransform).invert()}get textureOffsetInverseTransform(){if((this._matrixDirty&2)===0)return this._textureOffsetInverseTransform;return this._matrixDirty&=-3,this._textureOffsetInverseTransform||(this._textureOffsetInverseTransform=new B0),this._textureOffsetInverseTransform.copyFrom(this.inverseWorldTransform).translate(-this._textureBounds.x,-this._textureBounds.y)}get inverseParentTextureTransform(){if((this._matrixDirty&4)===0)return this._inverseParentTextureTransform;this._matrixDirty&=-5;let J=this._parentCacheAsTextureRenderGroup;if(J)return this._inverseParentTextureTransform||(this._inverseParentTextureTransform=new B0),this._inverseParentTextureTransform.copyFrom(this.worldTransform).prepend(J.inverseWorldTransform).translate(-J._textureBounds.x,-J._textureBounds.y);return this.worldTransform}get cacheToLocalTransform(){if(this.isCachedAsTexture)return this.textureOffsetInverseTransform;if(!this._parentCacheAsTextureRenderGroup)return null;return this._parentCacheAsTextureRenderGroup.textureOffsetInverseTransform}}var gK=A(()=>{E8();oq();j9()});function X1(J,$,Q={}){for(let Z in $)if(!Q[Z]&&$[Z]!==void 0)J[Z]=$[Z]}var H1=()=>{};var pK,d$,mK,l$,fJ=1,S9=2,e7=4,B8;var o6=A(()=>{O6();_9();Nq();k0();E8();RK();BK();W6();F6();s8();PJ();wq();Gq();Lq();Cq();Pq();Tq();xq();dq();cq();sq();iq();gK();H1();pK=new x8(null),d$=new x8(null),mK=new x8(null,1,1),l$=new x8(null);B8=class B8 extends C8{constructor(J={}){super();this.uid=i0("renderable"),this._updateFlags=15,this.renderGroup=null,this.parentRenderGroup=null,this.parentRenderGroupIndex=0,this.didChange=!1,this.didViewUpdate=!1,this.relativeRenderGroupDepth=0,this.children=[],this.parent=null,this.includeInBuild=!0,this.measurable=!0,this.isSimple=!0,this.parentRenderLayer=null,this.updateTick=-1,this.localTransform=new B0,this.relativeGroupTransform=new B0,this.groupTransform=this.relativeGroupTransform,this.destroyed=!1,this._position=new x8(this,0,0),this._scale=mK,this._pivot=d$,this._origin=l$,this._skew=pK,this._cx=1,this._sx=0,this._cy=0,this._sy=1,this._rotation=0,this.localColor=16777215,this.localAlpha=1,this.groupAlpha=1,this.groupColor=16777215,this.groupColorAlpha=4294967295,this.localBlendMode="inherit",this.groupBlendMode="normal",this.localDisplayStatus=7,this.globalDisplayStatus=7,this._didContainerChangeTick=0,this._didViewChangeTick=0,this._didLocalTransformChangeId=-1,this.effects=[],X1(this,J,{children:!0,parent:!0,effects:!0}),J.children?.forEach(($)=>this.addChild($)),J.parent?.addChild(this)}static mixin(J){u0("8.8.0","Container.mixin is deprecated, please use extensions.mixin instead."),n0.mixin(B8,J)}set _didChangeId(J){this._didViewChangeTick=J>>12&4095,this._didContainerChangeTick=J&4095}get _didChangeId(){return this._didContainerChangeTick&4095|(this._didViewChangeTick&4095)<<12}addChild(...J){if(!this.allowChildren)u0(Z6,"addChild: Only Containers will be allowed to add children in v8.0.0");if(J.length>1){for(let Z=0;Z<J.length;Z++)this.addChild(J[Z]);return J[0]}let $=J[0],Q=this.renderGroup||this.parentRenderGroup;if($.parent===this){if(this.children.splice(this.children.indexOf($),1),this.children.push($),Q)Q.structureDidChange=!0;return $}if($.parent)$.parent.removeChild($);if(this.children.push($),this.sortableChildren)this.sortDirty=!0;if($.parent=this,$.didChange=!0,$._updateFlags=15,Q)Q.addChild($);if(this.emit("childAdded",$,this,this.children.length-1),$.emit("added",this),this._didViewChangeTick++,$._zIndex!==0)$.depthOfChildModified();return $}removeChild(...J){if(J.length>1){for(let Z=0;Z<J.length;Z++)this.removeChild(J[Z]);return J[0]}let $=J[0],Q=this.children.indexOf($);if(Q>-1){if(this._didViewChangeTick++,this.children.splice(Q,1),this.renderGroup)this.renderGroup.removeChild($);else if(this.parentRenderGroup)this.parentRenderGroup.removeChild($);if($.parentRenderLayer)$.parentRenderLayer.detach($);$.parent=null,this.emit("childRemoved",$,this,Q),$.emit("removed",this)}return $}_onUpdate(J){if(J){if(J===this._skew)this._updateSkew()}if(this._didContainerChangeTick++,this.didChange)return;if(this.didChange=!0,this.parentRenderGroup)this.parentRenderGroup.onChildUpdate(this)}set isRenderGroup(J){if(!!this.renderGroup===J)return;if(J)this.enableRenderGroup();else this.disableRenderGroup()}get isRenderGroup(){return!!this.renderGroup}enableRenderGroup(){if(this.renderGroup)return;let J=this.parentRenderGroup;J?.removeChild(this),this.renderGroup=n8.get(vJ,this),this.groupTransform=B0.IDENTITY,J?.addChild(this),this._updateIsSimple()}disableRenderGroup(){if(!this.renderGroup)return;let J=this.parentRenderGroup;J?.removeChild(this),n8.return(this.renderGroup),this.renderGroup=null,this.groupTransform=this.relativeGroupTransform,J?.addChild(this),this._updateIsSimple()}_updateIsSimple(){this.isSimple=!this.renderGroup&&this.effects.length===0}get worldTransform(){if(this._worldTransform||(this._worldTransform=new B0),this.renderGroup)this._worldTransform.copyFrom(this.renderGroup.worldTransform);else if(this.parentRenderGroup)this._worldTransform.appendFrom(this.relativeGroupTransform,this.parentRenderGroup.worldTransform);return this._worldTransform}get x(){return this._position.x}set x(J){this._position.x=J}get y(){return this._position.y}set y(J){this._position.y=J}get position(){return this._position}set position(J){this._position.copyFrom(J)}get rotation(){return this._rotation}set rotation(J){if(this._rotation!==J)this._rotation=J,this._onUpdate(this._skew)}get angle(){return this.rotation*Vq}set angle(J){this.rotation=J*Oq}get pivot(){if(this._pivot===d$)this._pivot=new x8(this,0,0);return this._pivot}set pivot(J){if(this._pivot===d$){if(this._pivot=new x8(this,0,0),this._origin!==l$)v0("Setting both a pivot and origin on a Container is not recommended. This can lead to unexpected behavior if not handled carefully.")}typeof J==="number"?this._pivot.set(J):this._pivot.copyFrom(J)}get skew(){if(this._skew===pK)this._skew=new x8(this,0,0);return this._skew}set skew(J){if(this._skew===pK)this._skew=new x8(this,0,0);this._skew.copyFrom(J)}get scale(){if(this._scale===mK)this._scale=new x8(this,1,1);return this._scale}set scale(J){if(this._scale===mK)this._scale=new x8(this,0,0);if(typeof J==="string")J=parseFloat(J);typeof J==="number"?this._scale.set(J):this._scale.copyFrom(J)}get origin(){if(this._origin===l$)this._origin=new x8(this,0,0);return this._origin}set origin(J){if(this._origin===l$){if(this._origin=new x8(this,0,0),this._pivot!==d$)v0("Setting both a pivot and origin on a Container is not recommended. This can lead to unexpected behavior if not handled carefully.")}typeof J==="number"?this._origin.set(J):this._origin.copyFrom(J)}get width(){return Math.abs(this.scale.x*this.getLocalBounds().width)}set width(J){let $=this.getLocalBounds().width;this._setWidth(J,$)}get height(){return Math.abs(this.scale.y*this.getLocalBounds().height)}set height(J){let $=this.getLocalBounds().height;this._setHeight(J,$)}getSize(J){if(!J)J={};let $=this.getLocalBounds();return J.width=Math.abs(this.scale.x*$.width),J.height=Math.abs(this.scale.y*$.height),J}setSize(J,$){let Q=this.getLocalBounds();if(typeof J==="object")$=J.height??J.width,J=J.width;else $??($=J);J!==void 0&&this._setWidth(J,Q.width),$!==void 0&&this._setHeight($,Q.height)}_updateSkew(){let J=this._rotation,$=this._skew;this._cx=Math.cos(J+$._y),this._sx=Math.sin(J+$._y),this._cy=-Math.sin(J-$._x),this._sy=Math.cos(J-$._x)}updateTransform(J){return this.position.set(typeof J.x==="number"?J.x:this.position.x,typeof J.y==="number"?J.y:this.position.y),this.scale.set(typeof J.scaleX==="number"?J.scaleX||1:this.scale.x,typeof J.scaleY==="number"?J.scaleY||1:this.scale.y),this.rotation=typeof J.rotation==="number"?J.rotation:this.rotation,this.skew.set(typeof J.skewX==="number"?J.skewX:this.skew.x,typeof J.skewY==="number"?J.skewY:this.skew.y),this.pivot.set(typeof J.pivotX==="number"?J.pivotX:this.pivot.x,typeof J.pivotY==="number"?J.pivotY:this.pivot.y),this.origin.set(typeof J.originX==="number"?J.originX:this.origin.x,typeof J.originY==="number"?J.originY:this.origin.y),this}setFromMatrix(J){J.decompose(this)}updateLocalTransform(){let J=this._didContainerChangeTick;if(this._didLocalTransformChangeId===J)return;this._didLocalTransformChangeId=J;let $=this.localTransform,Q=this._scale,Z=this._pivot,K=this._origin,W=this._position,X=Q._x,H=Q._y,q=Z._x,Y=Z._y,N=-K._x,U=-K._y;$.a=this._cx*X,$.b=this._sx*X,$.c=this._cy*H,$.d=this._sy*H,$.tx=W._x-(q*$.a+Y*$.c)+(N*$.a+U*$.c)-N,$.ty=W._y-(q*$.b+Y*$.d)+(N*$.b+U*$.d)-U}set alpha(J){if(J===this.localAlpha)return;this.localAlpha=J,this._updateFlags|=fJ,this._onUpdate()}get alpha(){return this.localAlpha}set tint(J){let Q=R6.shared.setValue(J??16777215).toBgrNumber();if(Q===this.localColor)return;this.localColor=Q,this._updateFlags|=fJ,this._onUpdate()}get tint(){return E9(this.localColor)}set blendMode(J){if(this.localBlendMode===J)return;if(this.parentRenderGroup)this.parentRenderGroup.structureDidChange=!0;this._updateFlags|=S9,this.localBlendMode=J,this._onUpdate()}get blendMode(){return this.localBlendMode}get visible(){return!!(this.localDisplayStatus&2)}set visible(J){let $=J?2:0;if((this.localDisplayStatus&2)===$)return;if(this.parentRenderGroup)this.parentRenderGroup.structureDidChange=!0;this._updateFlags|=e7,this.localDisplayStatus^=2,this._onUpdate()}get culled(){return!(this.localDisplayStatus&4)}set culled(J){let $=J?0:4;if((this.localDisplayStatus&4)===$)return;if(this.parentRenderGroup)this.parentRenderGroup.structureDidChange=!0;this._updateFlags|=e7,this.localDisplayStatus^=4,this._onUpdate()}get renderable(){return!!(this.localDisplayStatus&1)}set renderable(J){let $=J?1:0;if((this.localDisplayStatus&1)===$)return;if(this._updateFlags|=e7,this.localDisplayStatus^=1,this.parentRenderGroup)this.parentRenderGroup.structureDidChange=!0;this._onUpdate()}get isRenderable(){return this.localDisplayStatus===7&&this.groupAlpha>0}destroy(J=!1){if(this.destroyed)return;this.destroyed=!0;let $;if(this.children.length)$=this.removeChildren(0,this.children.length);if(this.removeFromParent(),this.parent=null,this._maskEffect=null,this._filterEffect=null,this.effects=null,this._position=null,this._scale=null,this._pivot=null,this._origin=null,this._skew=null,this.emit("destroyed",this),this.removeAllListeners(),(typeof J==="boolean"?J:J?.children)&&$)for(let Z=0;Z<$.length;++Z)$[Z].destroy(J);this.renderGroup?.destroy(),this.renderGroup=null}};n0.mixin(B8,Mq,Sq,nq,lq,mq,_q,Eq,uq,Yq,Iq,hq,Rq)});var P7;var c$=A(()=>{P7=((J)=>{return J[J.INTERACTION=50]="INTERACTION",J[J.HIGH=25]="HIGH",J[J.NORMAL=0]="NORMAL",J[J.LOW=-25]="LOW",J[J.UTILITY=-50]="UTILITY",J})(P7||{})});class T9{constructor(J,$=null,Q=0,Z=!1){this.next=null,this.previous=null,this._destroyed=!1,this._fn=J,this._context=$,this.priority=Q,this._once=Z}match(J,$=null){return this._fn===J&&this._context===$}emit(J){if(this._fn)if(this._context)this._fn.call(this._context,J);else this._fn(J);let $=this.next;if(this._once)this.destroy(!0);if(this._destroyed)this.next=null;return $}connect(J){if(this.previous=J,J.next)J.next.previous=this;this.next=J.next,J.next=this}destroy(J=!1){if(this._destroyed=!0,this._fn=null,this._context=null,this.previous)this.previous.next=this.next;if(this.next)this.next.previous=this.previous;let $=this.next;return this.next=J?null:$,this.previous=null,$}}var q1=()=>{};var Y1=class J{constructor(){this.autoStart=!1,this.deltaTime=1,this.lastTime=-1,this.speed=1,this.started=!1,this._requestId=null,this._maxElapsedMS=100,this._minElapsedMS=0,this._protected=!1,this._lastFrame=-1,this._head=new T9(null,null,1/0),this.deltaMS=1/J.targetFPMS,this.elapsedMS=1/J.targetFPMS,this._tick=($)=>{if(this._requestId=null,this.started){if(this.update($),this.started&&this._requestId===null&&this._head.next)this._requestId=requestAnimationFrame(this._tick)}}}_requestIfNeeded(){if(this._requestId===null&&this._head.next)this.lastTime=performance.now(),this._lastFrame=this.lastTime,this._requestId=requestAnimationFrame(this._tick)}_cancelIfNeeded(){if(this._requestId!==null)cancelAnimationFrame(this._requestId),this._requestId=null}_startIfPossible(){if(this.started)this._requestIfNeeded();else if(this.autoStart)this.start()}add($,Q,Z=P7.NORMAL){return this._addListener(new T9($,Q,Z))}addOnce($,Q,Z=P7.NORMAL){return this._addListener(new T9($,Q,Z,!0))}_addListener($){let Q=this._head.next,Z=this._head;if(!Q)$.connect(Z);else{while(Q){if($.priority>Q.priority){$.connect(Z);break}Z=Q,Q=Q.next}if(!$.previous)$.connect(Z)}return this._startIfPossible(),this}remove($,Q){let Z=this._head.next;while(Z)if(Z.match($,Q))Z=Z.destroy();else Z=Z.next;if(!this._head.next)this._cancelIfNeeded();return this}get count(){if(!this._head)return 0;let $=0,Q=this._head;while(Q=Q.next)$++;return $}start(){if(!this.started)this.started=!0,this._requestIfNeeded()}stop(){if(this.started)this.started=!1,this._cancelIfNeeded()}destroy(){if(!this._protected){this.stop();let $=this._head.next;while($)$=$.destroy(!0);this._head.destroy(),this._head=null}}update($=performance.now()){let Q;if($>this.lastTime){if(Q=this.elapsedMS=$-this.lastTime,Q>this._maxElapsedMS)Q=this._maxElapsedMS;if(Q*=this.speed,this._minElapsedMS){let W=$-this._lastFrame|0;if(W<this._minElapsedMS)return;this._lastFrame=$-W%this._minElapsedMS}this.deltaMS=Q,this.deltaTime=this.deltaMS*J.targetFPMS;let Z=this._head,K=Z.next;while(K)K=K.emit(this);if(!Z.next)this._cancelIfNeeded()}else this.deltaTime=this.deltaMS=this.elapsedMS=0;this.lastTime=$}get FPS(){return 1000/this.elapsedMS}get minFPS(){return 1000/this._maxElapsedMS}set minFPS($){let Q=Math.min(this.maxFPS,$),Z=Math.min(Math.max(0,Q)/1000,J.targetFPMS);this._maxElapsedMS=1/Z}get maxFPS(){if(this._minElapsedMS)return Math.round(1000/this._minElapsedMS);return 0}set maxFPS($){if($===0)this._minElapsedMS=0;else{let Q=Math.max(this.minFPS,$);this._minElapsedMS=1/(Q/1000)}}static get shared(){if(!J._shared){let $=J._shared=new J;$.autoStart=!0,$._protected=!0}return J._shared}static get system(){if(!J._system){let $=J._system=new J;$.autoStart=!0,$._protected=!0}return J._system}},l8;var hJ=A(()=>{c$();q1();Y1.targetFPMS=0.06;l8=Y1});class dK{constructor(J){if(this._lastTransform="",this._observer=null,this._tickerAttached=!1,this.updateTranslation=()=>{if(!this._canvas)return;let $=this._canvas.getBoundingClientRect(),Q=this._canvas.width,Z=this._canvas.height,K=$.width/Q*this._renderer.resolution,W=$.height/Z*this._renderer.resolution,X=$.left,H=$.top,q=`translate(${X}px, ${H}px) scale(${K}, ${W})`;if(q!==this._lastTransform)this._domElement.style.transform=q,this._lastTransform=q},this._domElement=J.domElement,this._renderer=J.renderer,globalThis.OffscreenCanvas&&this._renderer.canvas instanceof OffscreenCanvas)return;this._canvas=this._renderer.canvas,this._attachObserver()}get canvas(){return this._canvas}ensureAttached(){if(!this._domElement.parentNode&&this._canvas.parentNode)this._canvas.parentNode.appendChild(this._domElement),this.updateTranslation()}_attachObserver(){if("ResizeObserver"in globalThis){if(this._observer)this._observer.disconnect(),this._observer=null;this._observer=new ResizeObserver((J)=>{for(let $ of J){if($.target!==this._canvas)continue;let Q=this.canvas.width,Z=this.canvas.height,K=$.contentRect.width/Q*this._renderer.resolution,W=$.contentRect.height/Z*this._renderer.resolution;if(this._lastScaleX!==K||this._lastScaleY!==W)this.updateTranslation(),this._lastScaleX=K,this._lastScaleY=W}}),this._observer.observe(this._canvas)}else if(!this._tickerAttached)l8.shared.add(this.updateTranslation,this,P7.HIGH)}destroy(){if(this._observer)this._observer.disconnect(),this._observer=null;else if(this._tickerAttached)l8.shared.remove(this.updateTranslation);this._domElement=null,this._renderer=null,this._canvas=null,this._tickerAttached=!1,this._lastTransform="",this._lastScaleX=null,this._lastScaleY=null}}var N1=A(()=>{c$();hJ()});class j7{constructor(J){this.bubbles=!0,this.cancelBubble=!0,this.cancelable=!1,this.composed=!1,this.defaultPrevented=!1,this.eventPhase=j7.prototype.NONE,this.propagationStopped=!1,this.propagationImmediatelyStopped=!1,this.layer=new O8,this.page=new O8,this.NONE=0,this.CAPTURING_PHASE=1,this.AT_TARGET=2,this.BUBBLING_PHASE=3,this.manager=J}get layerX(){return this.layer.x}get layerY(){return this.layer.y}get pageX(){return this.page.x}get pageY(){return this.page.y}get data(){return this}composedPath(){if(this.manager&&(!this.path||this.path[this.path.length-1]!==this.target))this.path=this.target?this.manager.propagationPath(this.target):[];return this.path}initEvent(J,$,Q){throw Error("initEvent() is a legacy DOM API. It is not implemented in the Federated Events API.")}initUIEvent(J,$,Q,Z,K){throw Error("initUIEvent() is a legacy DOM API. It is not implemented in the Federated Events API.")}preventDefault(){if(this.nativeEvent instanceof Event&&this.nativeEvent.cancelable)this.nativeEvent.preventDefault();this.defaultPrevented=!0}stopImmediatePropagation(){this.propagationImmediatelyStopped=!0}stopPropagation(){this.propagationStopped=!0}}var u$=A(()=>{_7()});function eD(J){return function($){return $.test(J)}}function y9(J){var $={userAgent:"",platform:"",maxTouchPoints:0};if(!J&&typeof navigator<"u")$={userAgent:navigator.userAgent,platform:navigator.platform,maxTouchPoints:navigator.maxTouchPoints||0};else if(typeof J==="string")$.userAgent=J;else if(J&&J.userAgent)$={userAgent:J.userAgent,platform:J.platform,maxTouchPoints:J.maxTouchPoints||0};var Q=$.userAgent,Z=Q.split("[FBAN");if(typeof Z[1]<"u")Q=Z[0];if(Z=Q.split("Twitter"),typeof Z[1]<"u")Q=Z[0];var K=eD(Q),W={apple:{phone:K(lK)&&!K(X7),ipod:K(U1),tablet:!K(lK)&&(K(V1)||G1($))&&!K(X7),universal:K(O1),device:(K(lK)||K(U1)||K(V1)||K(O1)||G1($))&&!K(X7)},amazon:{phone:K(xJ),tablet:!K(xJ)&&K(s$),device:K(xJ)||K(s$)},android:{phone:!K(X7)&&K(xJ)||!K(X7)&&K(cK),tablet:!K(X7)&&!K(xJ)&&!K(cK)&&(K(s$)||K(F1)),device:!K(X7)&&(K(xJ)||K(s$)||K(cK)||K(F1))||K(/\bokhttp\b/i)},windows:{phone:K(X7),tablet:K(z1),device:K(X7)||K(z1)},other:{blackberry:K(D1),blackberry10:K(k1),opera:K(I1),firefox:K(M1),chrome:K(w1),device:K(D1)||K(k1)||K(I1)||K(M1)||K(w1)},any:!1,phone:!1,tablet:!1};return W.any=W.apple.device||W.android.device||W.windows.device||W.other.device,W.phone=W.apple.phone||W.android.phone||W.windows.phone,W.tablet=W.apple.tablet||W.android.tablet||W.windows.tablet,W}var lK,U1,V1,O1,cK,F1,xJ,s$,X7,z1,D1,k1,I1,w1,M1,G1=function(J){return typeof J<"u"&&J.platform==="MacIntel"&&typeof J.maxTouchPoints==="number"&&J.maxTouchPoints>1&&typeof MSStream>"u"};var uK=A(()=>{lK=/iPhone/i,U1=/iPod/i,V1=/iPad/i,O1=/\biOS-universal(?:.+)Mac\b/i,cK=/\bAndroid(?:.+)Mobile\b/i,F1=/Android/i,xJ=/(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i,s$=/Silk/i,X7=/Windows Phone/i,z1=/\bWindows(?:.+)ARM\b/i,D1=/BlackBerry/i,k1=/BB10/i,I1=/Opera Mini/i,w1=/\b(CriOS|Chrome)(?:.+)Mobile/i,M1=/Mobile(?:.+)Firefox\b/i});var R1=A(()=>{uK();uK()});var J4,L1;var B1=A(()=>{R1();J4=y9.default??y9,L1=J4(globalThis.navigator)});var $4=9,A1=100,Q4=0,Z4=0,_1=2,C1=1,K4=-1000,W4=-1000,X4=2,sK=class J{constructor($,Q=L1){if(this._mobileInfo=Q,this.debug=!1,this._activateOnTab=!0,this._deactivateOnMouseMove=!0,this._isActive=!1,this._isMobileAccessibility=!1,this._div=null,this._pools={},this._renderId=0,this._children=[],this._androidUpdateCount=0,this._androidUpdateFrequency=500,this._isRunningTests=!1,this._boundOnKeyDown=this._onKeyDown.bind(this),this._boundOnMouseMove=this._onMouseMove.bind(this),this._hookDiv=null,Q.tablet||Q.phone)this._createTouchHook();this._renderer=$}get isActive(){return this._isActive}get isMobileAccessibility(){return this._isMobileAccessibility}get hookDiv(){return this._hookDiv}get div(){return this._div}_createTouchHook(){let $=document.createElement("button");$.style.width=`${C1}px`,$.style.height=`${C1}px`,$.style.position="absolute",$.style.top=`${K4}px`,$.style.left=`${W4}px`,$.style.zIndex=X4.toString(),$.style.backgroundColor="#FF0000",$.title="select to enable accessibility for this content",$.addEventListener("focus",()=>{this._isMobileAccessibility=!0,this._activate(),this._destroyTouchHook()}),document.body.appendChild($),this._hookDiv=$}_destroyTouchHook(){if(!this._hookDiv)return;document.body.removeChild(this._hookDiv),this._hookDiv=null}_activate(){if(this._isActive)return;if(this._isActive=!0,!this._div)this._div=document.createElement("div"),this._div.style.position="absolute",this._div.style.top=`${Q4}px`,this._div.style.left=`${Z4}px`,this._div.style.pointerEvents="none",this._div.style.zIndex=_1.toString(),this._canvasObserver=new dK({domElement:this._div,renderer:this._renderer});if(this._activateOnTab)globalThis.addEventListener("keydown",this._boundOnKeyDown,!1);if(this._deactivateOnMouseMove)globalThis.document.addEventListener("mousemove",this._boundOnMouseMove,!0);let $=this._renderer.view.canvas;if(!$.parentNode){let Q=new MutationObserver(()=>{if($.parentNode)Q.disconnect(),this._canvasObserver.ensureAttached(),this._initAccessibilitySetup()});Q.observe(document.body,{childList:!0,subtree:!0})}else this._canvasObserver.ensureAttached(),this._initAccessibilitySetup()}_initAccessibilitySetup(){if(this._renderer.runners.postrender.add(this),this._renderer.lastObjectRendered)this._updateAccessibleObjects(this._renderer.lastObjectRendered)}_deactivate(){if(!this._isActive||this._isMobileAccessibility)return;if(this._isActive=!1,globalThis.document.removeEventListener("mousemove",this._boundOnMouseMove,!0),this._activateOnTab)globalThis.addEventListener("keydown",this._boundOnKeyDown,!1);this._renderer.runners.postrender.remove(this);for(let $ of this._children){if($._accessibleDiv?.parentNode)$._accessibleDiv.parentNode.removeChild($._accessibleDiv),$._accessibleDiv=null;$._accessibleActive=!1}for(let $ in this._pools)this._pools[$].forEach((Z)=>{if(Z.parentNode)Z.parentNode.removeChild(Z)}),delete this._pools[$];if(this._div?.parentNode)this._div.parentNode.removeChild(this._div);this._pools={},this._children=[]}_updateAccessibleObjects($){if(!$.visible||!$.accessibleChildren)return;if($.accessible){if(!$._accessibleActive)this._addChild($);$._renderId=this._renderId}let Q=$.children;if(Q)for(let Z=0;Z<Q.length;Z++)this._updateAccessibleObjects(Q[Z])}init($){let Z={accessibilityOptions:{...J.defaultOptions,...$?.accessibilityOptions||{}}};if(this.debug=Z.accessibilityOptions.debug,this._activateOnTab=Z.accessibilityOptions.activateOnTab,this._deactivateOnMouseMove=Z.accessibilityOptions.deactivateOnMouseMove,Z.accessibilityOptions.enabledByDefault)this._activate();this._renderer.runners.postrender.remove(this)}postrender(){let $=performance.now();if(this._mobileInfo.android.device&&$<this._androidUpdateCount)return;if(this._androidUpdateCount=$+this._androidUpdateFrequency,(!this._renderer.renderingToScreen||!this._renderer.view.canvas)&&!this._isRunningTests)return;let Q=new Set;if(this._renderer.lastObjectRendered){this._updateAccessibleObjects(this._renderer.lastObjectRendered);for(let Z of this._children)if(Z._renderId===this._renderId)Q.add(this._children.indexOf(Z))}for(let Z=this._children.length-1;Z>=0;Z--){let K=this._children[Z];if(!Q.has(Z)){if(K._accessibleDiv&&K._accessibleDiv.parentNode)K._accessibleDiv.parentNode.removeChild(K._accessibleDiv),this._getPool(K.accessibleType).push(K._accessibleDiv),K._accessibleDiv=null;K._accessibleActive=!1,b$(this._children,Z,1)}}if(this._renderer.renderingToScreen)this._canvasObserver.ensureAttached();for(let Z=0;Z<this._children.length;Z++){let K=this._children[Z];if(!K._accessibleActive||!K._accessibleDiv)continue;let W=K._accessibleDiv,X=K.hitArea||K.getBounds().rectangle;if(K.hitArea){let H=K.worldTransform;W.style.left=`${H.tx+X.x*H.a}px`,W.style.top=`${H.ty+X.y*H.d}px`,W.style.width=`${X.width*H.a}px`,W.style.height=`${X.height*H.d}px`}else this._capHitArea(X),W.style.left=`${X.x}px`,W.style.top=`${X.y}px`,W.style.width=`${X.width}px`,W.style.height=`${X.height}px`}this._renderId++}_updateDebugHTML($){$.innerHTML=`type: ${$.type}</br> title : ${$.title}</br> tabIndex: ${$.tabIndex}`}_capHitArea($){if($.x<0)$.width+=$.x,$.x=0;if($.y<0)$.height+=$.y,$.y=0;let{width:Q,height:Z}=this._renderer;if($.x+$.width>Q)$.width=Q-$.x;if($.y+$.height>Z)$.height=Z-$.y}_addChild($){let Z=this._getPool($.accessibleType).pop();if(Z)Z.innerHTML="",Z.removeAttribute("title"),Z.removeAttribute("aria-label"),Z.tabIndex=0;else{if($.accessibleType==="button")Z=document.createElement("button");else if(Z=document.createElement($.accessibleType),Z.style.cssText=`
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
                    `,$.accessibleText)Z.innerText=$.accessibleText;if(Z.style.width=`${A1}px`,Z.style.height=`${A1}px`,Z.style.backgroundColor=this.debug?"rgba(255,255,255,0.5)":"transparent",Z.style.position="absolute",Z.style.zIndex=_1.toString(),Z.style.borderStyle="none",navigator.userAgent.toLowerCase().includes("chrome"))Z.setAttribute("aria-live","off");else Z.setAttribute("aria-live","polite");if(navigator.userAgent.match(/rv:.*Gecko\//))Z.setAttribute("aria-relevant","additions");else Z.setAttribute("aria-relevant","text");Z.addEventListener("click",this._onClick.bind(this)),Z.addEventListener("focus",this._onFocus.bind(this)),Z.addEventListener("focusout",this._onFocusOut.bind(this))}if(Z.style.pointerEvents=$.accessiblePointerEvents,Z.type=$.accessibleType,$.accessibleTitle&&$.accessibleTitle!==null)Z.title=$.accessibleTitle;else if(!$.accessibleHint||$.accessibleHint===null)Z.title=`container ${$.tabIndex}`;if($.accessibleHint&&$.accessibleHint!==null)Z.setAttribute("aria-label",$.accessibleHint);if($.interactive)Z.tabIndex=$.tabIndex;else Z.tabIndex=0;if(this.debug)this._updateDebugHTML(Z);$._accessibleActive=!0,$._accessibleDiv=Z,Z.container=$,this._children.push($),this._div.appendChild($._accessibleDiv)}_dispatchEvent($,Q){let{container:Z}=$.target,K=this._renderer.events.rootBoundary,W=Object.assign(new j7(K),{target:Z});K.rootTarget=this._renderer.lastObjectRendered,Q.forEach((X)=>K.dispatchEvent(W,X))}_onClick($){this._dispatchEvent($,["click","pointertap","tap"])}_onFocus($){if(!$.target.getAttribute("aria-live"))$.target.setAttribute("aria-live","assertive");this._dispatchEvent($,["mouseover"])}_onFocusOut($){if(!$.target.getAttribute("aria-live"))$.target.setAttribute("aria-live","polite");this._dispatchEvent($,["mouseout"])}_onKeyDown($){if($.keyCode!==$4||!this._activateOnTab)return;this._activate()}_onMouseMove($){if($.movementX===0&&$.movementY===0)return;this._deactivate()}destroy(){this._deactivate(),this._destroyTouchHook(),this._canvasObserver?.destroy(),this._canvasObserver=null,this._div=null,this._pools=null,this._children=null,this._renderer=null,this._hookDiv=null,globalThis.removeEventListener("keydown",this._boundOnKeyDown),this._boundOnKeyDown=null,globalThis.document.removeEventListener("mousemove",this._boundOnMouseMove,!0),this._boundOnMouseMove=null}setAccessibilityEnabled($){if($)this._activate();else this._deactivate()}_getPool($){if(!this._pools[$])this._pools[$]=[];return this._pools[$]}},E1;var P1=A(()=>{N1();u$();k0();B1();EK();sK.extension={type:[b.WebGLSystem,b.WebGPUSystem],name:"accessibility"};sK.defaultOptions={enabledByDefault:!1,debug:!1,activateOnTab:!0,deactivateOnMouseMove:!0};E1=sK});var j1;var S1=A(()=>{j1={accessible:!1,accessibleTitle:null,accessibleHint:null,tabIndex:0,accessibleType:"button",accessibleText:null,accessiblePointerEvents:"auto",accessibleChildren:!0,_accessibleActive:!1,_accessibleDiv:null,_renderId:-1}});var T1=A(()=>{k0();o6();P1();S1();n0.add(E1);n0.mixin(B8,j1)});class y1{constructor(){this.interactionFrequency=10,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}init(J){this.removeTickerListener(),this.events=J,this.interactionFrequency=10,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}get pauseUpdate(){return this._pauseUpdate}set pauseUpdate(J){this._pauseUpdate=J}addTickerListener(){if(this._tickerAdded||!this.domElement)return;l8.system.add(this._tickerUpdate,this,P7.INTERACTION),this._tickerAdded=!0}removeTickerListener(){if(!this._tickerAdded)return;l8.system.remove(this._tickerUpdate,this),this._tickerAdded=!1}pointerMoved(){this._didMove=!0}_update(){if(!this.domElement||this._pauseUpdate)return;if(this._didMove){this._didMove=!1;return}let J=this.events._rootPointerEvent;if(this.events.supportsTouchEvents&&J.pointerType==="touch")return;globalThis.document.dispatchEvent(this.events.supportsPointerEvents?new PointerEvent("pointermove",{clientX:J.clientX,clientY:J.clientY,pointerType:J.pointerType,pointerId:J.pointerId}):new MouseEvent("mousemove",{clientX:J.clientX,clientY:J.clientY}))}_tickerUpdate(J){if(this._deltaTime+=J.deltaTime,this._deltaTime<this.interactionFrequency)return;this._deltaTime=0,this._update()}destroy(){this.removeTickerListener(),this.events=null,this.domElement=null,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}}var f6;var nK=A(()=>{c$();hJ();f6=new y1});var S7;var n$=A(()=>{_7();u$();S7=class S7 extends j7{constructor(){super(...arguments);this.client=new O8,this.movement=new O8,this.offset=new O8,this.global=new O8,this.screen=new O8}get clientX(){return this.client.x}get clientY(){return this.client.y}get x(){return this.clientX}get y(){return this.clientY}get movementX(){return this.movement.x}get movementY(){return this.movement.y}get offsetX(){return this.offset.x}get offsetY(){return this.offset.y}get globalX(){return this.global.x}get globalY(){return this.global.y}get screenX(){return this.screen.x}get screenY(){return this.screen.y}getLocalPosition(J,$,Q){return J.worldTransform.applyInverse(Q||this.global,$)}getModifierState(J){return"getModifierState"in this.nativeEvent&&this.nativeEvent.getModifierState(J)}initMouseEvent(J,$,Q,Z,K,W,X,H,q,Y,N,U,V,z,D){throw Error("Method not implemented.")}}});var H6;var iK=A(()=>{n$();H6=class H6 extends S7{constructor(){super(...arguments);this.width=0,this.height=0,this.isPrimary=!1}getCoalescedEvents(){if(this.type==="pointermove"||this.type==="mousemove"||this.type==="touchmove")return[this];return[]}getPredictedEvents(){throw Error("getPredictedEvents is not supported!")}}});var H7;var oK=A(()=>{n$();H7=class H7 extends S7{constructor(){super(...arguments);this.DOM_DELTA_PIXEL=0,this.DOM_DELTA_LINE=1,this.DOM_DELTA_PAGE=2}};H7.DOM_DELTA_PIXEL=0;H7.DOM_DELTA_LINE=1;H7.DOM_DELTA_PAGE=2});class aK{constructor(J){this.dispatch=new C8,this.moveOnAll=!1,this.enableGlobalMoveEvents=!0,this.mappingState={trackingData:{}},this.eventPool=new Map,this._allInteractiveElements=[],this._hitElements=[],this._isPointerMoveEvent=!1,this.rootTarget=J,this.hitPruneFn=this.hitPruneFn.bind(this),this.hitTestFn=this.hitTestFn.bind(this),this.mapPointerDown=this.mapPointerDown.bind(this),this.mapPointerMove=this.mapPointerMove.bind(this),this.mapPointerOut=this.mapPointerOut.bind(this),this.mapPointerOver=this.mapPointerOver.bind(this),this.mapPointerUp=this.mapPointerUp.bind(this),this.mapPointerUpOutside=this.mapPointerUpOutside.bind(this),this.mapWheel=this.mapWheel.bind(this),this.mappingTable={},this.addEventMapping("pointerdown",this.mapPointerDown),this.addEventMapping("pointermove",this.mapPointerMove),this.addEventMapping("pointerout",this.mapPointerOut),this.addEventMapping("pointerleave",this.mapPointerOut),this.addEventMapping("pointerover",this.mapPointerOver),this.addEventMapping("pointerup",this.mapPointerUp),this.addEventMapping("pointerupoutside",this.mapPointerUpOutside),this.addEventMapping("wheel",this.mapWheel)}addEventMapping(J,$){if(!this.mappingTable[J])this.mappingTable[J]=[];this.mappingTable[J].push({fn:$,priority:0}),this.mappingTable[J].sort((Q,Z)=>Q.priority-Z.priority)}dispatchEvent(J,$){J.propagationStopped=!1,J.propagationImmediatelyStopped=!1,this.propagate(J,$),this.dispatch.emit($||J.type,J)}mapEvent(J){if(!this.rootTarget)return;let $=this.mappingTable[J.type];if($)for(let Q=0,Z=$.length;Q<Z;Q++)$[Q].fn(J);else v0(`[EventBoundary]: Event mapping not defined for ${J.type}`)}hitTest(J,$){f6.pauseUpdate=!0;let Z=this._isPointerMoveEvent&&this.enableGlobalMoveEvents?"hitTestMoveRecursive":"hitTestRecursive",K=this[Z](this.rootTarget,this.rootTarget.eventMode,q4.set(J,$),this.hitTestFn,this.hitPruneFn);return K&&K[0]}propagate(J,$){if(!J.target)return;let Q=J.composedPath();J.eventPhase=J.CAPTURING_PHASE;for(let Z=0,K=Q.length-1;Z<K;Z++)if(J.currentTarget=Q[Z],this.notifyTarget(J,$),J.propagationStopped||J.propagationImmediatelyStopped)return;if(J.eventPhase=J.AT_TARGET,J.currentTarget=J.target,this.notifyTarget(J,$),J.propagationStopped||J.propagationImmediatelyStopped)return;J.eventPhase=J.BUBBLING_PHASE;for(let Z=Q.length-2;Z>=0;Z--)if(J.currentTarget=Q[Z],this.notifyTarget(J,$),J.propagationStopped||J.propagationImmediatelyStopped)return}all(J,$,Q=this._allInteractiveElements){if(Q.length===0)return;J.eventPhase=J.BUBBLING_PHASE;let Z=Array.isArray($)?$:[$];for(let K=Q.length-1;K>=0;K--)Z.forEach((W)=>{J.currentTarget=Q[K],this.notifyTarget(J,W)})}propagationPath(J){let $=[J];for(let Q=0;Q<H4&&(J!==this.rootTarget&&J.parent);Q++){if(!J.parent)throw Error("Cannot find propagation path to disconnected target");$.push(J.parent),J=J.parent}return $.reverse(),$}hitTestMoveRecursive(J,$,Q,Z,K,W=!1){let X=!1;if(this._interactivePrune(J))return null;if(J.eventMode==="dynamic"||$==="dynamic")f6.pauseUpdate=!1;if(J.interactiveChildren&&J.children){let Y=J.children;for(let N=Y.length-1;N>=0;N--){let U=Y[N],V=this.hitTestMoveRecursive(U,this._isInteractive($)?$:U.eventMode,Q,Z,K,W||K(J,Q));if(V){if(V.length>0&&!V[V.length-1].parent)continue;let z=J.isInteractive();if(V.length>0||z){if(z)this._allInteractiveElements.push(J);V.push(J)}if(this._hitElements.length===0)this._hitElements=V;X=!0}}}let H=this._isInteractive($),q=J.isInteractive();if(q&&q)this._allInteractiveElements.push(J);if(W||this._hitElements.length>0)return null;if(X)return this._hitElements;if(H&&(!K(J,Q)&&Z(J,Q)))return q?[J]:[];return null}hitTestRecursive(J,$,Q,Z,K){if(this._interactivePrune(J)||K(J,Q))return null;if(J.eventMode==="dynamic"||$==="dynamic")f6.pauseUpdate=!1;if(J.interactiveChildren&&J.children){let H=J.children,q=Q;for(let Y=H.length-1;Y>=0;Y--){let N=H[Y],U=this.hitTestRecursive(N,this._isInteractive($)?$:N.eventMode,q,Z,K);if(U){if(U.length>0&&!U[U.length-1].parent)continue;let V=J.isInteractive();if(U.length>0||V)U.push(J);return U}}}let W=this._isInteractive($),X=J.isInteractive();if(W&&Z(J,Q))return X?[J]:[];return null}_isInteractive(J){return J==="static"||J==="dynamic"}_interactivePrune(J){if(!J||!J.visible||!J.renderable||!J.measurable)return!0;if(J.eventMode==="none")return!0;if(J.eventMode==="passive"&&!J.interactiveChildren)return!0;return!1}hitPruneFn(J,$){if(J.hitArea){if(J.worldTransform.applyInverse($,b9),!J.hitArea.contains(b9.x,b9.y))return!0}if(J.effects&&J.effects.length)for(let Q=0;Q<J.effects.length;Q++){let Z=J.effects[Q];if(Z.containsPoint){if(!Z.containsPoint($,this.hitTestFn))return!0}}return!1}hitTestFn(J,$){if(J.hitArea)return!0;if(J?.containsPoint)return J.worldTransform.applyInverse($,b9),J.containsPoint(b9);return!1}notifyTarget(J,$){if(!J.currentTarget.isInteractive())return;$??($=J.type);let Q=`on${$}`;J.currentTarget[Q]?.(J);let Z=J.eventPhase===J.CAPTURING_PHASE||J.eventPhase===J.AT_TARGET?`${$}capture`:$;if(this._notifyListeners(J,Z),J.eventPhase===J.AT_TARGET)this._notifyListeners(J,$)}mapPointerDown(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}let $=this.createPointerEvent(J);if(this.dispatchEvent($,"pointerdown"),$.pointerType==="touch")this.dispatchEvent($,"touchstart");else if($.pointerType==="mouse"||$.pointerType==="pen"){let Z=$.button===2;this.dispatchEvent($,Z?"rightdown":"mousedown")}let Q=this.trackingData(J.pointerId);Q.pressTargetsByButton[J.button]=$.composedPath(),this.freeEvent($)}mapPointerMove(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}this._allInteractiveElements.length=0,this._hitElements.length=0,this._isPointerMoveEvent=!0;let $=this.createPointerEvent(J);this._isPointerMoveEvent=!1;let Q=$.pointerType==="mouse"||$.pointerType==="pen",Z=this.trackingData(J.pointerId),K=this.findMountedTarget(Z.overTargets);if(Z.overTargets?.length>0&&K!==$.target){let H=J.type==="mousemove"?"mouseout":"pointerout",q=this.createPointerEvent(J,H,K);if(this.dispatchEvent(q,"pointerout"),Q)this.dispatchEvent(q,"mouseout");if(!$.composedPath().includes(K)){let Y=this.createPointerEvent(J,"pointerleave",K);Y.eventPhase=Y.AT_TARGET;while(Y.target&&!$.composedPath().includes(Y.target)){if(Y.currentTarget=Y.target,this.notifyTarget(Y),Q)this.notifyTarget(Y,"mouseleave");Y.target=Y.target.parent}this.freeEvent(Y)}this.freeEvent(q)}if(K!==$.target){let H=J.type==="mousemove"?"mouseover":"pointerover",q=this.clonePointerEvent($,H);if(this.dispatchEvent(q,"pointerover"),Q)this.dispatchEvent(q,"mouseover");let Y=K?.parent;while(Y&&Y!==this.rootTarget.parent){if(Y===$.target)break;Y=Y.parent}if(!Y||Y===this.rootTarget.parent){let U=this.clonePointerEvent($,"pointerenter");U.eventPhase=U.AT_TARGET;while(U.target&&U.target!==K&&U.target!==this.rootTarget.parent){if(U.currentTarget=U.target,this.notifyTarget(U),Q)this.notifyTarget(U,"mouseenter");U.target=U.target.parent}this.freeEvent(U)}this.freeEvent(q)}let W=[],X=this.enableGlobalMoveEvents??!0;if(this.moveOnAll?W.push("pointermove"):this.dispatchEvent($,"pointermove"),X&&W.push("globalpointermove"),$.pointerType==="touch")this.moveOnAll?W.splice(1,0,"touchmove"):this.dispatchEvent($,"touchmove"),X&&W.push("globaltouchmove");if(Q)this.moveOnAll?W.splice(1,0,"mousemove"):this.dispatchEvent($,"mousemove"),X&&W.push("globalmousemove"),this.cursor=$.target?.cursor;if(W.length>0)this.all($,W);this._allInteractiveElements.length=0,this._hitElements.length=0,Z.overTargets=$.composedPath(),this.freeEvent($)}mapPointerOver(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}let $=this.trackingData(J.pointerId),Q=this.createPointerEvent(J),Z=Q.pointerType==="mouse"||Q.pointerType==="pen";if(this.dispatchEvent(Q,"pointerover"),Z)this.dispatchEvent(Q,"mouseover");if(Q.pointerType==="mouse")this.cursor=Q.target?.cursor;let K=this.clonePointerEvent(Q,"pointerenter");K.eventPhase=K.AT_TARGET;while(K.target&&K.target!==this.rootTarget.parent){if(K.currentTarget=K.target,this.notifyTarget(K),Z)this.notifyTarget(K,"mouseenter");K.target=K.target.parent}$.overTargets=Q.composedPath(),this.freeEvent(Q),this.freeEvent(K)}mapPointerOut(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}let $=this.trackingData(J.pointerId);if($.overTargets){let Q=J.pointerType==="mouse"||J.pointerType==="pen",Z=this.findMountedTarget($.overTargets),K=this.createPointerEvent(J,"pointerout",Z);if(this.dispatchEvent(K),Q)this.dispatchEvent(K,"mouseout");let W=this.createPointerEvent(J,"pointerleave",Z);W.eventPhase=W.AT_TARGET;while(W.target&&W.target!==this.rootTarget.parent){if(W.currentTarget=W.target,this.notifyTarget(W),Q)this.notifyTarget(W,"mouseleave");W.target=W.target.parent}$.overTargets=null,this.freeEvent(K),this.freeEvent(W)}this.cursor=null}mapPointerUp(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}let $=performance.now(),Q=this.createPointerEvent(J);if(this.dispatchEvent(Q,"pointerup"),Q.pointerType==="touch")this.dispatchEvent(Q,"touchend");else if(Q.pointerType==="mouse"||Q.pointerType==="pen"){let X=Q.button===2;this.dispatchEvent(Q,X?"rightup":"mouseup")}let Z=this.trackingData(J.pointerId),K=this.findMountedTarget(Z.pressTargetsByButton[J.button]),W=K;if(K&&!Q.composedPath().includes(K)){let X=K;while(X&&!Q.composedPath().includes(X)){if(Q.currentTarget=X,this.notifyTarget(Q,"pointerupoutside"),Q.pointerType==="touch")this.notifyTarget(Q,"touchendoutside");else if(Q.pointerType==="mouse"||Q.pointerType==="pen"){let H=Q.button===2;this.notifyTarget(Q,H?"rightupoutside":"mouseupoutside")}X=X.parent}delete Z.pressTargetsByButton[J.button],W=X}if(W){let X=this.clonePointerEvent(Q,"click");if(X.target=W,X.path=null,!Z.clicksByButton[J.button])Z.clicksByButton[J.button]={clickCount:0,target:X.target,timeStamp:$};let H=Z.clicksByButton[J.button];if(H.target===X.target&&$-H.timeStamp<200)++H.clickCount;else H.clickCount=1;if(H.target=X.target,H.timeStamp=$,X.detail=H.clickCount,X.pointerType==="mouse"){let q=X.button===2;this.dispatchEvent(X,q?"rightclick":"click")}else if(X.pointerType==="touch")this.dispatchEvent(X,"tap");this.dispatchEvent(X,"pointertap"),this.freeEvent(X)}this.freeEvent(Q)}mapPointerUpOutside(J){if(!(J instanceof H6)){v0("EventBoundary cannot map a non-pointer event as a pointer event");return}let $=this.trackingData(J.pointerId),Q=this.findMountedTarget($.pressTargetsByButton[J.button]),Z=this.createPointerEvent(J);if(Q){let K=Q;while(K){if(Z.currentTarget=K,this.notifyTarget(Z,"pointerupoutside"),Z.pointerType==="touch")this.notifyTarget(Z,"touchendoutside");else if(Z.pointerType==="mouse"||Z.pointerType==="pen")this.notifyTarget(Z,Z.button===2?"rightupoutside":"mouseupoutside");K=K.parent}delete $.pressTargetsByButton[J.button]}this.freeEvent(Z)}mapWheel(J){if(!(J instanceof H7)){v0("EventBoundary cannot map a non-wheel event as a wheel event");return}let $=this.createWheelEvent(J);this.dispatchEvent($),this.freeEvent($)}findMountedTarget(J){if(!J)return null;let $=J[0];for(let Q=1;Q<J.length;Q++)if(J[Q].parent===$)$=J[Q];else break;return $}createPointerEvent(J,$,Q){let Z=this.allocateEvent(H6);if(this.copyPointerData(J,Z),this.copyMouseData(J,Z),this.copyData(J,Z),Z.nativeEvent=J.nativeEvent,Z.originalEvent=J,Z.target=Q??this.hitTest(Z.global.x,Z.global.y)??this._hitElements[0],typeof $==="string")Z.type=$;return Z}createWheelEvent(J){let $=this.allocateEvent(H7);return this.copyWheelData(J,$),this.copyMouseData(J,$),this.copyData(J,$),$.nativeEvent=J.nativeEvent,$.originalEvent=J,$.target=this.hitTest($.global.x,$.global.y),$}clonePointerEvent(J,$){let Q=this.allocateEvent(H6);return Q.nativeEvent=J.nativeEvent,Q.originalEvent=J.originalEvent,this.copyPointerData(J,Q),this.copyMouseData(J,Q),this.copyData(J,Q),Q.target=J.target,Q.path=J.composedPath().slice(),Q.type=$??Q.type,Q}copyWheelData(J,$){$.deltaMode=J.deltaMode,$.deltaX=J.deltaX,$.deltaY=J.deltaY,$.deltaZ=J.deltaZ}copyPointerData(J,$){if(!(J instanceof H6&&$ instanceof H6))return;$.pointerId=J.pointerId,$.width=J.width,$.height=J.height,$.isPrimary=J.isPrimary,$.pointerType=J.pointerType,$.pressure=J.pressure,$.tangentialPressure=J.tangentialPressure,$.tiltX=J.tiltX,$.tiltY=J.tiltY,$.twist=J.twist}copyMouseData(J,$){if(!(J instanceof S7&&$ instanceof S7))return;$.altKey=J.altKey,$.button=J.button,$.buttons=J.buttons,$.client.copyFrom(J.client),$.ctrlKey=J.ctrlKey,$.metaKey=J.metaKey,$.movement.copyFrom(J.movement),$.screen.copyFrom(J.screen),$.shiftKey=J.shiftKey,$.global.copyFrom(J.global)}copyData(J,$){$.isTrusted=J.isTrusted,$.srcElement=J.srcElement,$.timeStamp=performance.now(),$.type=J.type,$.detail=J.detail,$.view=J.view,$.which=J.which,$.layer.copyFrom(J.layer),$.page.copyFrom(J.page)}trackingData(J){if(!this.mappingState.trackingData[J])this.mappingState.trackingData[J]={pressTargetsByButton:{},clicksByButton:{},overTarget:null};return this.mappingState.trackingData[J]}allocateEvent(J){if(!this.eventPool.has(J))this.eventPool.set(J,[]);let $=this.eventPool.get(J).pop()||new J(this);return $.eventPhase=$.NONE,$.currentTarget=null,$.defaultPrevented=!1,$.path=null,$.target=null,$}freeEvent(J){if(J.manager!==this)throw Error("It is illegal to free an event not managed by this EventBoundary!");let $=J.constructor;if(!this.eventPool.has($))this.eventPool.set($,[]);this.eventPool.get($).push(J)}_notifyListeners(J,$){let Q=J.currentTarget._events[$];if(!Q)return;if("fn"in Q){if(Q.once)J.currentTarget.removeListener($,Q.fn,void 0,!0);Q.fn.call(Q.context,J)}else for(let Z=0,K=Q.length;Z<K&&!J.propagationImmediatelyStopped;Z++){if(Q[Z].once)J.currentTarget.removeListener($,Q[Z].fn,void 0,!0);Q[Z].fn.call(Q[Z].context,J)}}}var H4=2048,q4,b9;var b1=A(()=>{O6();_7();s8();nK();n$();iK();oK();q4=new O8,b9=new O8});var Y4=1,N4,rK=class J{constructor($){this.supportsTouchEvents="ontouchstart"in globalThis,this.supportsPointerEvents=!!globalThis.PointerEvent,this.domElement=null,this.resolution=1,this.renderer=$,this.rootBoundary=new aK(null),f6.init(this),this.autoPreventDefault=!0,this._eventsAdded=!1,this._rootPointerEvent=new H6(null),this._rootWheelEvent=new H7(null),this.cursorStyles={default:"inherit",pointer:"pointer"},this.features=new Proxy({...J.defaultEventFeatures},{set:(Q,Z,K)=>{if(Z==="globalMove")this.rootBoundary.enableGlobalMoveEvents=K;return Q[Z]=K,!0}}),this._onPointerDown=this._onPointerDown.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._onPointerUp=this._onPointerUp.bind(this),this._onPointerOverOut=this._onPointerOverOut.bind(this),this.onWheel=this.onWheel.bind(this)}static get defaultEventMode(){return this._defaultEventMode}init($){let{canvas:Q,resolution:Z}=this.renderer;this.setTargetElement(Q),this.resolution=Z,J._defaultEventMode=$.eventMode??"passive",Object.assign(this.features,$.eventFeatures??{}),this.rootBoundary.enableGlobalMoveEvents=this.features.globalMove}resolutionChange($){this.resolution=$}destroy(){f6.destroy(),this.setTargetElement(null),this.renderer=null,this._currentCursor=null}setCursor($){$||($="default");let Q=!0;if(globalThis.OffscreenCanvas&&this.domElement instanceof OffscreenCanvas)Q=!1;if(this._currentCursor===$)return;this._currentCursor=$;let Z=this.cursorStyles[$];if(Z)switch(typeof Z){case"string":if(Q)this.domElement.style.cursor=Z;break;case"function":Z($);break;case"object":if(Q)Object.assign(this.domElement.style,Z);break}else if(Q&&typeof $==="string"&&!Object.prototype.hasOwnProperty.call(this.cursorStyles,$))this.domElement.style.cursor=$}get pointer(){return this._rootPointerEvent}_onPointerDown($){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let Q=this._normalizeToPointerData($);if(this.autoPreventDefault&&Q[0].isNormalized){if($.cancelable||!("cancelable"in $))$.preventDefault()}for(let Z=0,K=Q.length;Z<K;Z++){let W=Q[Z],X=this._bootstrapEvent(this._rootPointerEvent,W);this.rootBoundary.mapEvent(X)}this.setCursor(this.rootBoundary.cursor)}_onPointerMove($){if(!this.features.move)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered,f6.pointerMoved();let Q=this._normalizeToPointerData($);for(let Z=0,K=Q.length;Z<K;Z++){let W=this._bootstrapEvent(this._rootPointerEvent,Q[Z]);this.rootBoundary.mapEvent(W)}this.setCursor(this.rootBoundary.cursor)}_onPointerUp($){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let Q=$.target;if($.composedPath&&$.composedPath().length>0)Q=$.composedPath()[0];let Z=Q!==this.domElement?"outside":"",K=this._normalizeToPointerData($);for(let W=0,X=K.length;W<X;W++){let H=this._bootstrapEvent(this._rootPointerEvent,K[W]);H.type+=Z,this.rootBoundary.mapEvent(H)}this.setCursor(this.rootBoundary.cursor)}_onPointerOverOut($){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let Q=this._normalizeToPointerData($);for(let Z=0,K=Q.length;Z<K;Z++){let W=this._bootstrapEvent(this._rootPointerEvent,Q[Z]);this.rootBoundary.mapEvent(W)}this.setCursor(this.rootBoundary.cursor)}onWheel($){if(!this.features.wheel)return;let Q=this.normalizeWheelEvent($);this.rootBoundary.rootTarget=this.renderer.lastObjectRendered,this.rootBoundary.mapEvent(Q)}setTargetElement($){this._removeEvents(),this.domElement=$,f6.domElement=$,this._addEvents()}_addEvents(){if(this._eventsAdded||!this.domElement)return;f6.addTickerListener();let $=this.domElement.style;if($){if(globalThis.navigator.msPointerEnabled)$.msContentZooming="none",$.msTouchAction="none";else if(this.supportsPointerEvents)$.touchAction="none"}if(this.supportsPointerEvents)globalThis.document.addEventListener("pointermove",this._onPointerMove,!0),this.domElement.addEventListener("pointerdown",this._onPointerDown,!0),this.domElement.addEventListener("pointerleave",this._onPointerOverOut,!0),this.domElement.addEventListener("pointerover",this._onPointerOverOut,!0),globalThis.addEventListener("pointerup",this._onPointerUp,!0);else if(globalThis.document.addEventListener("mousemove",this._onPointerMove,!0),this.domElement.addEventListener("mousedown",this._onPointerDown,!0),this.domElement.addEventListener("mouseout",this._onPointerOverOut,!0),this.domElement.addEventListener("mouseover",this._onPointerOverOut,!0),globalThis.addEventListener("mouseup",this._onPointerUp,!0),this.supportsTouchEvents)this.domElement.addEventListener("touchstart",this._onPointerDown,!0),this.domElement.addEventListener("touchend",this._onPointerUp,!0),this.domElement.addEventListener("touchmove",this._onPointerMove,!0);this.domElement.addEventListener("wheel",this.onWheel,{passive:!0,capture:!0}),this._eventsAdded=!0}_removeEvents(){if(!this._eventsAdded||!this.domElement)return;f6.removeTickerListener();let $=this.domElement.style;if($){if(globalThis.navigator.msPointerEnabled)$.msContentZooming="",$.msTouchAction="";else if(this.supportsPointerEvents)$.touchAction=""}if(this.supportsPointerEvents)globalThis.document.removeEventListener("pointermove",this._onPointerMove,!0),this.domElement.removeEventListener("pointerdown",this._onPointerDown,!0),this.domElement.removeEventListener("pointerleave",this._onPointerOverOut,!0),this.domElement.removeEventListener("pointerover",this._onPointerOverOut,!0),globalThis.removeEventListener("pointerup",this._onPointerUp,!0);else if(globalThis.document.removeEventListener("mousemove",this._onPointerMove,!0),this.domElement.removeEventListener("mousedown",this._onPointerDown,!0),this.domElement.removeEventListener("mouseout",this._onPointerOverOut,!0),this.domElement.removeEventListener("mouseover",this._onPointerOverOut,!0),globalThis.removeEventListener("mouseup",this._onPointerUp,!0),this.supportsTouchEvents)this.domElement.removeEventListener("touchstart",this._onPointerDown,!0),this.domElement.removeEventListener("touchend",this._onPointerUp,!0),this.domElement.removeEventListener("touchmove",this._onPointerMove,!0);this.domElement.removeEventListener("wheel",this.onWheel,!0),this.domElement=null,this._eventsAdded=!1}mapPositionToPoint($,Q,Z){let K=this.domElement.isConnected?this.domElement.getBoundingClientRect():{x:0,y:0,width:this.domElement.width,height:this.domElement.height,left:0,top:0},W=1/this.resolution;$.x=(Q-K.left)*(this.domElement.width/K.width)*W,$.y=(Z-K.top)*(this.domElement.height/K.height)*W}_normalizeToPointerData($){let Q=[];if(this.supportsTouchEvents&&$ instanceof TouchEvent)for(let Z=0,K=$.changedTouches.length;Z<K;Z++){let W=$.changedTouches[Z];if(typeof W.button>"u")W.button=0;if(typeof W.buttons>"u")W.buttons=1;if(typeof W.isPrimary>"u")W.isPrimary=$.touches.length===1&&$.type==="touchstart";if(typeof W.width>"u")W.width=W.radiusX||1;if(typeof W.height>"u")W.height=W.radiusY||1;if(typeof W.tiltX>"u")W.tiltX=0;if(typeof W.tiltY>"u")W.tiltY=0;if(typeof W.pointerType>"u")W.pointerType="touch";if(typeof W.pointerId>"u")W.pointerId=W.identifier||0;if(typeof W.pressure>"u")W.pressure=W.force||0.5;if(typeof W.twist>"u")W.twist=0;if(typeof W.tangentialPressure>"u")W.tangentialPressure=0;if(typeof W.layerX>"u")W.layerX=W.offsetX=W.clientX;if(typeof W.layerY>"u")W.layerY=W.offsetY=W.clientY;W.isNormalized=!0,W.type=$.type,Q.push(W)}else if(!globalThis.MouseEvent||$ instanceof MouseEvent&&(!this.supportsPointerEvents||!($ instanceof globalThis.PointerEvent))){let Z=$;if(typeof Z.isPrimary>"u")Z.isPrimary=!0;if(typeof Z.width>"u")Z.width=1;if(typeof Z.height>"u")Z.height=1;if(typeof Z.tiltX>"u")Z.tiltX=0;if(typeof Z.tiltY>"u")Z.tiltY=0;if(typeof Z.pointerType>"u")Z.pointerType="mouse";if(typeof Z.pointerId>"u")Z.pointerId=Y4;if(typeof Z.pressure>"u")Z.pressure=0.5;if(typeof Z.twist>"u")Z.twist=0;if(typeof Z.tangentialPressure>"u")Z.tangentialPressure=0;Z.isNormalized=!0,Q.push(Z)}else Q.push($);return Q}normalizeWheelEvent($){let Q=this._rootWheelEvent;return this._transferMouseData(Q,$),Q.deltaX=$.deltaX,Q.deltaY=$.deltaY,Q.deltaZ=$.deltaZ,Q.deltaMode=$.deltaMode,this.mapPositionToPoint(Q.screen,$.clientX,$.clientY),Q.global.copyFrom(Q.screen),Q.offset.copyFrom(Q.screen),Q.nativeEvent=$,Q.type=$.type,Q}_bootstrapEvent($,Q){if($.originalEvent=null,$.nativeEvent=Q,$.pointerId=Q.pointerId,$.width=Q.width,$.height=Q.height,$.isPrimary=Q.isPrimary,$.pointerType=Q.pointerType,$.pressure=Q.pressure,$.tangentialPressure=Q.tangentialPressure,$.tiltX=Q.tiltX,$.tiltY=Q.tiltY,$.twist=Q.twist,this._transferMouseData($,Q),this.mapPositionToPoint($.screen,Q.clientX,Q.clientY),$.global.copyFrom($.screen),$.offset.copyFrom($.screen),$.isTrusted=Q.isTrusted,$.type==="pointerleave")$.type="pointerout";if($.type.startsWith("mouse"))$.type=$.type.replace("mouse","pointer");if($.type.startsWith("touch"))$.type=N4[$.type]||$.type;return $}_transferMouseData($,Q){$.isTrusted=Q.isTrusted,$.srcElement=Q.srcElement,$.timeStamp=performance.now(),$.type=Q.type,$.altKey=Q.altKey,$.button=Q.button,$.buttons=Q.buttons,$.client.x=Q.clientX,$.client.y=Q.clientY,$.ctrlKey=Q.ctrlKey,$.metaKey=Q.metaKey,$.movement.x=Q.movementX,$.movement.y=Q.movementY,$.page.x=Q.pageX,$.page.y=Q.pageY,$.relatedTarget=null,$.shiftKey=Q.shiftKey}},i$;var tK=A(()=>{k0();b1();nK();iK();oK();N4={touchstart:"pointerdown",touchend:"pointerup",touchendoutside:"pointerupoutside",touchmove:"pointermove",touchcancel:"pointercancel"};rK.extension={name:"events",type:[b.WebGLSystem,b.CanvasSystem,b.WebGPUSystem],priority:-1};rK.defaultEventFeatures={move:!0,globalMove:!0,click:!0,wheel:!0};i$=rK});var v1;var f1=A(()=>{tK();u$();v1={onclick:null,onmousedown:null,onmouseenter:null,onmouseleave:null,onmousemove:null,onglobalmousemove:null,onmouseout:null,onmouseover:null,onmouseup:null,onmouseupoutside:null,onpointercancel:null,onpointerdown:null,onpointerenter:null,onpointerleave:null,onpointermove:null,onglobalpointermove:null,onpointerout:null,onpointerover:null,onpointertap:null,onpointerup:null,onpointerupoutside:null,onrightclick:null,onrightdown:null,onrightup:null,onrightupoutside:null,ontap:null,ontouchcancel:null,ontouchend:null,ontouchendoutside:null,ontouchmove:null,onglobaltouchmove:null,ontouchstart:null,onwheel:null,get interactive(){return this.eventMode==="dynamic"||this.eventMode==="static"},set interactive(J){this.eventMode=J?"static":"passive"},_internalEventMode:void 0,get eventMode(){return this._internalEventMode??i$.defaultEventMode},set eventMode(J){this._internalEventMode=J},isInteractive(){return this.eventMode==="static"||this.eventMode==="dynamic"},interactiveChildren:!0,hitArea:null,addEventListener(J,$,Q){let Z=typeof Q==="boolean"&&Q||typeof Q==="object"&&Q.capture,K=typeof Q==="object"?Q.signal:void 0,W=typeof Q==="object"?Q.once===!0:!1,X=typeof $==="function"?void 0:$;J=Z?`${J}capture`:J;let H=typeof $==="function"?$:$.handleEvent,q=this;if(K)K.addEventListener("abort",()=>{q.off(J,H,X)});if(W)q.once(J,H,X);else q.on(J,H,X)},removeEventListener(J,$,Q){let Z=typeof Q==="boolean"&&Q||typeof Q==="object"&&Q.capture,K=typeof $==="function"?void 0:$;J=Z?`${J}capture`:J,$=typeof $==="function"?$:$.handleEvent,this.off(J,$,K)},dispatchEvent(J){if(!(J instanceof j7))throw Error("Container cannot propagate events outside of the Federated Events API");return J.defaultPrevented=!1,J.path=null,J.target=this,J.manager.dispatchEvent(J),!J.defaultPrevented}}});var h1=A(()=>{k0();o6();tK();f1();n0.add(i$);n0.mixin(B8,v1)});var eK;var x1=A(()=>{eK=((J)=>{return J[J.Low=0]="Low",J[J.Normal=1]="Normal",J[J.High=2]="High",J})(eK||{})});var g1;var p1=A(()=>{g1={createCanvas:(J,$)=>{let Q=document.createElement("canvas");return Q.width=J,Q.height=$,Q},createImage:()=>new Image,getCanvasRenderingContext2D:()=>CanvasRenderingContext2D,getWebGLRenderingContext:()=>WebGLRenderingContext,getNavigator:()=>navigator,getBaseUrl:()=>document.baseURI??window.location.href,getFontFaceSet:()=>document.fonts,fetch:(J,$)=>fetch(J,$),parseXML:(J)=>{return new DOMParser().parseFromString(J,"text/xml")}}});var m1,F8;var D6=A(()=>{p1();m1=g1,F8={get(){return m1},set(J){m1=J}}});function h6(J){if(typeof J!=="string")throw TypeError(`Path must be a string. Received ${JSON.stringify(J)}`)}function v9(J){return J.split("?")[0].split("#")[0]}function U4(J){return J.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function V4(J,$,Q){return J.replace(new RegExp(U4($),"g"),Q)}function O4(J,$){let Q="",Z=0,K=-1,W=0,X=-1;for(let H=0;H<=J.length;++H){if(H<J.length)X=J.charCodeAt(H);else if(X===47)break;else X=47;if(X===47){if(K===H-1||W===1);else if(K!==H-1&&W===2){if(Q.length<2||Z!==2||Q.charCodeAt(Q.length-1)!==46||Q.charCodeAt(Q.length-2)!==46){if(Q.length>2){let q=Q.lastIndexOf("/");if(q!==Q.length-1){if(q===-1)Q="",Z=0;else Q=Q.slice(0,q),Z=Q.length-1-Q.lastIndexOf("/");K=H,W=0;continue}}else if(Q.length===2||Q.length===1){Q="",Z=0,K=H,W=0;continue}}if($){if(Q.length>0)Q+="/..";else Q="..";Z=2}}else{if(Q.length>0)Q+=`/${J.slice(K+1,H)}`;else Q=J.slice(K+1,H);Z=H-K-1}K=H,W=0}else if(X===46&&W!==-1)++W;else W=-1}return Q}var JJ;var J5=A(()=>{D6();JJ={toPosix(J){return V4(J,"\\","/")},isUrl(J){return/^https?:/.test(this.toPosix(J))},isDataUrl(J){return/^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i.test(J)},isBlobUrl(J){return J.startsWith("blob:")},hasProtocol(J){return/^[^/:]+:/.test(this.toPosix(J))},getProtocol(J){h6(J),J=this.toPosix(J);let $=/^file:\/\/\//.exec(J);if($)return $[0];let Q=/^[^/:]+:\/{0,2}/.exec(J);if(Q)return Q[0];return""},toAbsolute(J,$,Q){if(h6(J),this.isDataUrl(J)||this.isBlobUrl(J))return J;let Z=v9(this.toPosix($??F8.get().getBaseUrl())),K=v9(this.toPosix(Q??this.rootname(Z)));if(J=this.toPosix(J),J.startsWith("/"))return JJ.join(K,J.slice(1));return this.isAbsolute(J)?J:this.join(Z,J)},normalize(J){if(h6(J),J.length===0)return".";if(this.isDataUrl(J)||this.isBlobUrl(J))return J;J=this.toPosix(J);let $="",Q=J.startsWith("/");if(this.hasProtocol(J))$=this.rootname(J),J=J.slice($.length);let Z=J.endsWith("/");if(J=O4(J,!1),J.length>0&&Z)J+="/";if(Q)return`/${J}`;return $+J},isAbsolute(J){if(h6(J),J=this.toPosix(J),this.hasProtocol(J))return!0;return J.startsWith("/")},join(...J){if(J.length===0)return".";let $;for(let Q=0;Q<J.length;++Q){let Z=J[Q];if(h6(Z),Z.length>0)if($===void 0)$=Z;else{let K=J[Q-1]??"";if(this.joinExtensions.includes(this.extname(K).toLowerCase()))$+=`/../${Z}`;else $+=`/${Z}`}}if($===void 0)return".";return this.normalize($)},dirname(J){if(h6(J),J.length===0)return".";J=this.toPosix(J);let $=J.charCodeAt(0),Q=$===47,Z=-1,K=!0,W=this.getProtocol(J),X=J;J=J.slice(W.length);for(let H=J.length-1;H>=1;--H)if($=J.charCodeAt(H),$===47){if(!K){Z=H;break}}else K=!1;if(Z===-1)return Q?"/":this.isUrl(X)?W+J:W;if(Q&&Z===1)return"//";return W+J.slice(0,Z)},rootname(J){h6(J),J=this.toPosix(J);let $="";if(J.startsWith("/"))$="/";else $=this.getProtocol(J);if(this.isUrl(J)){let Q=J.indexOf("/",$.length);if(Q!==-1)$=J.slice(0,Q);else $=J;if(!$.endsWith("/"))$+="/"}return $},basename(J,$){if(h6(J),$)h6($);J=v9(this.toPosix(J));let Q=0,Z=-1,K=!0,W;if($!==void 0&&$.length>0&&$.length<=J.length){if($.length===J.length&&$===J)return"";let X=$.length-1,H=-1;for(W=J.length-1;W>=0;--W){let q=J.charCodeAt(W);if(q===47){if(!K){Q=W+1;break}}else{if(H===-1)K=!1,H=W+1;if(X>=0)if(q===$.charCodeAt(X)){if(--X===-1)Z=W}else X=-1,Z=H}}if(Q===Z)Z=H;else if(Z===-1)Z=J.length;return J.slice(Q,Z)}for(W=J.length-1;W>=0;--W)if(J.charCodeAt(W)===47){if(!K){Q=W+1;break}}else if(Z===-1)K=!1,Z=W+1;if(Z===-1)return"";return J.slice(Q,Z)},extname(J){h6(J),J=v9(this.toPosix(J));let $=-1,Q=0,Z=-1,K=!0,W=0;for(let X=J.length-1;X>=0;--X){let H=J.charCodeAt(X);if(H===47){if(!K){Q=X+1;break}continue}if(Z===-1)K=!1,Z=X+1;if(H===46){if($===-1)$=X;else if(W!==1)W=1}else if($!==-1)W=-1}if($===-1||Z===-1||W===0||W===1&&$===Z-1&&$===Q+1)return"";return J.slice($,Z)},parse(J){h6(J);let $={root:"",dir:"",base:"",ext:"",name:""};if(J.length===0)return $;J=v9(this.toPosix(J));let Q=J.charCodeAt(0),Z=this.isAbsolute(J),K,W="";if($.root=this.rootname(J),Z||this.hasProtocol(J))K=1;else K=0;let X=-1,H=0,q=-1,Y=!0,N=J.length-1,U=0;for(;N>=K;--N){if(Q=J.charCodeAt(N),Q===47){if(!Y){H=N+1;break}continue}if(q===-1)Y=!1,q=N+1;if(Q===46){if(X===-1)X=N;else if(U!==1)U=1}else if(X!==-1)U=-1}if(X===-1||q===-1||U===0||U===1&&X===q-1&&X===H+1){if(q!==-1)if(H===0&&Z)$.base=$.name=J.slice(1,q);else $.base=$.name=J.slice(H,q)}else{if(H===0&&Z)$.name=J.slice(1,X),$.base=J.slice(1,q);else $.name=J.slice(H,X),$.base=J.slice(H,q);$.ext=J.slice(X,q)}if($.dir=this.dirname(J),W)$.dir=W+$.dir;return $},sep:"/",delimiter:":",joinExtensions:[".html"]}});var T7=(J,$,Q=!1)=>{if(!Array.isArray(J))J=[J];if(!$)return J;return J.map((Z)=>{if(typeof Z==="string"||Q)return $(Z);return Z})};var $5=()=>{};function d1(J,$,Q,Z,K){let W=$[Q];for(let X=0;X<W.length;X++){let H=W[X];if(Q<$.length-1)d1(J.replace(Z[Q],H),$,Q+1,Z,K);else K.push(J.replace(Z[Q],H))}}function l1(J){let $=/\{(.*?)\}/g,Q=J.match($),Z=[];if(Q){let K=[];Q.forEach((W)=>{let X=W.substring(1,W.length-1).split(",");K.push(X)}),d1(J,K,0,Q,Z)}else Z.push(J);return Z}var c1=()=>{};var Q5=(J)=>!Array.isArray(J);var u1=()=>{};class o${constructor(){this._defaultBundleIdentifierOptions={connector:"-",createBundleAssetId:(J,$)=>`${J}${this._bundleIdConnector}${$}`,extractAssetIdFromBundle:(J,$)=>$.replace(`${J}${this._bundleIdConnector}`,"")},this._bundleIdConnector=this._defaultBundleIdentifierOptions.connector,this._createBundleAssetId=this._defaultBundleIdentifierOptions.createBundleAssetId,this._extractAssetIdFromBundle=this._defaultBundleIdentifierOptions.extractAssetIdFromBundle,this._assetMap={},this._preferredOrder=[],this._parsers=[],this._resolverHash={},this._bundles={}}setBundleIdentifier(J){if(this._bundleIdConnector=J.connector??this._bundleIdConnector,this._createBundleAssetId=J.createBundleAssetId??this._createBundleAssetId,this._extractAssetIdFromBundle=J.extractAssetIdFromBundle??this._extractAssetIdFromBundle,this._extractAssetIdFromBundle("foo",this._createBundleAssetId("foo","bar"))!=="bar")throw Error("[Resolver] GenerateBundleAssetId are not working correctly")}prefer(...J){J.forEach(($)=>{if(this._preferredOrder.push($),!$.priority)$.priority=Object.keys($.params)}),this._resolverHash={}}set basePath(J){this._basePath=J}get basePath(){return this._basePath}set rootPath(J){this._rootPath=J}get rootPath(){return this._rootPath}get parsers(){return this._parsers}reset(){this.setBundleIdentifier(this._defaultBundleIdentifierOptions),this._assetMap={},this._preferredOrder=[],this._resolverHash={},this._rootPath=null,this._basePath=null,this._manifest=null,this._bundles={},this._defaultSearchParams=null}setDefaultSearchParams(J){if(typeof J==="string")this._defaultSearchParams=J;else{let $=J;this._defaultSearchParams=Object.keys($).map((Q)=>`${encodeURIComponent(Q)}=${encodeURIComponent($[Q])}`).join("&")}}getAlias(J){let{alias:$,src:Q}=J;return T7($||Q,(K)=>{if(typeof K==="string")return K;if(Array.isArray(K))return K.map((W)=>W?.src??W);if(K?.src)return K.src;return K},!0)}addManifest(J){if(this._manifest)v0("[Resolver] Manifest already exists, this will be overwritten");this._manifest=J,J.bundles.forEach(($)=>{this.addBundle($.name,$.assets)})}addBundle(J,$){let Q=[],Z=$;if(!Array.isArray($))Z=Object.entries($).map(([K,W])=>{if(typeof W==="string"||Array.isArray(W))return{alias:K,src:W};return{alias:K,...W}});Z.forEach((K)=>{let{src:W,alias:X}=K,H;if(typeof X==="string"){let q=this._createBundleAssetId(J,X);Q.push(q),H=[X,q]}else{let q=X.map((Y)=>this._createBundleAssetId(J,Y));Q.push(...q),H=[...X,...q]}this.add({...K,...{alias:H,src:W}})}),this._bundles[J]=Q}add(J){let $=[];if(Array.isArray(J))$.push(...J);else $.push(J);let Q;Q=(K)=>{if(this.hasKey(K))v0(`[Resolver] already has key: ${K} overwriting`)},T7($).forEach((K)=>{let{src:W}=K,{data:X,format:H,loadParser:q,parser:Y}=K,N=T7(W).map((D)=>{if(typeof D==="string")return l1(D);return Array.isArray(D)?D:[D]}),U=this.getAlias(K);Array.isArray(U)?U.forEach(Q):Q(U);let V=[],z=(D)=>{let w=this._parsers.find((F)=>F.test(D));return{src:D,...w?.parse(D)}};N.forEach((D)=>{D.forEach((w)=>{let F={};if(typeof w!=="object")F=z(w);else{if(X=w.data??X,H=w.format??H,w.loadParser||w.parser)q=w.loadParser??q,Y=w.parser??Y;F={...z(w.src),...w}}if(!U)throw Error(`[Resolver] alias is undefined for this asset: ${F.src}`);F=this._buildResolvedAsset(F,{aliases:U,data:X,format:H,loadParser:q,parser:Y,progressSize:K.progressSize}),V.push(F)})}),U.forEach((D)=>{this._assetMap[D]=V})})}resolveBundle(J){let $=Q5(J);J=T7(J);let Q={};return J.forEach((Z)=>{let K=this._bundles[Z];if(K){let W=this.resolve(K),X={};for(let H in W){let q=W[H];X[this._extractAssetIdFromBundle(Z,H)]=q}Q[Z]=X}}),$?Q[J[0]]:Q}resolveUrl(J){let $=this.resolve(J);if(typeof J!=="string"){let Q={};for(let Z in $)Q[Z]=$[Z].src;return Q}return $.src}resolve(J){let $=Q5(J);J=T7(J);let Q={};return J.forEach((Z)=>{if(!this._resolverHash[Z])if(this._assetMap[Z]){let K=this._assetMap[Z],W=this._getPreferredOrder(K);W?.priority.forEach((X)=>{W.params[X].forEach((H)=>{let q=K.filter((Y)=>{if(Y[X])return Y[X]===H;return!1});if(q.length)K=q})}),this._resolverHash[Z]=K[0]}else this._resolverHash[Z]=this._buildResolvedAsset({alias:[Z],src:Z},{});Q[Z]=this._resolverHash[Z]}),$?Q[J[0]]:Q}hasKey(J){return!!this._assetMap[J]}hasBundle(J){return!!this._bundles[J]}_getPreferredOrder(J){for(let $=0;$<J.length;$++){let Q=J[$],Z=this._preferredOrder.find((K)=>K.params.format.includes(Q.format));if(Z)return Z}return this._preferredOrder[0]}_appendDefaultSearchParams(J){if(!this._defaultSearchParams)return J;let $=/\?/.test(J)?"&":"?";return`${J}${$}${this._defaultSearchParams}`}_buildResolvedAsset(J,$){let{aliases:Q,data:Z,loadParser:K,parser:W,format:X,progressSize:H}=$;if(this._basePath||this._rootPath)J.src=JJ.toAbsolute(J.src,this._basePath,this._rootPath);if(J.alias=Q??J.alias??[J.src],J.src=this._appendDefaultSearchParams(J.src),J.data={...Z||{},...J.data},J.loadParser=K??J.loadParser,J.parser=W??J.parser,J.format=X??J.format??F4(J.src),H!==void 0)J.progressSize=H;return J}}function F4(J){return J.split(".").pop().split("?").shift().split("#").shift()}var s1=A(()=>{s8();J5();$5();c1();u1();o$.RETINA_PREFIX=/@([0-9\.]+)x/});var Z5=(J,$)=>{let Q=$.split("?")[1];if(Q)J+=`?${Q}`;return J};var n1=()=>{};var i1=class J{constructor($,Q){this.linkedSheets=[];let Z=$;if($?.source instanceof $8)Z={texture:$,data:Q};let{texture:K,data:W,cachePrefix:X=""}=Z;this.cachePrefix=X,this._texture=K instanceof P0?K:null,this.textureSource=K.source,this.textures={},this.animations={},this.data=W;let H=parseFloat(W.meta.scale);if(H)this.resolution=H,K.source.resolution=this.resolution;else this.resolution=K.source._resolution;this._frames=this.data.frames,this._frameKeys=Object.keys(this._frames),this._batchIndex=0,this._callback=null}parse(){return new Promise(($)=>{if(this._callback=$,this._batchIndex=0,this._frameKeys.length<=J.BATCH_SIZE)this._processFrames(0),this._processAnimations(),this._parseComplete();else this._nextBatch()})}parseSync(){return this._processFrames(0,!0),this._processAnimations(),this.textures}_processFrames($,Q=!1){let Z=$,K=Q?1/0:J.BATCH_SIZE;while(Z-$<K&&Z<this._frameKeys.length){let W=this._frameKeys[Z],X=this._frames[W],H=X.frame;if(H){let q=null,Y=null,N=X.trimmed!==!1&&X.sourceSize?X.sourceSize:X.frame,U=new R8(0,0,Math.floor(N.w)/this.resolution,Math.floor(N.h)/this.resolution);if(X.rotated)q=new R8(Math.floor(H.x)/this.resolution,Math.floor(H.y)/this.resolution,Math.floor(H.h)/this.resolution,Math.floor(H.w)/this.resolution);else q=new R8(Math.floor(H.x)/this.resolution,Math.floor(H.y)/this.resolution,Math.floor(H.w)/this.resolution,Math.floor(H.h)/this.resolution);if(X.trimmed!==!1&&X.spriteSourceSize)Y=new R8(Math.floor(X.spriteSourceSize.x)/this.resolution,Math.floor(X.spriteSourceSize.y)/this.resolution,Math.floor(H.w)/this.resolution,Math.floor(H.h)/this.resolution);this.textures[W]=new P0({source:this.textureSource,frame:q,orig:U,trim:Y,rotate:X.rotated?2:0,defaultAnchor:X.anchor,defaultBorders:X.borders,label:W.toString()})}Z++}}_processAnimations(){let $=this.data.animations||{};for(let Q in $){this.animations[Q]=[];for(let Z=0;Z<$[Q].length;Z++){let K=$[Q][Z];this.animations[Q].push(this.textures[K])}}}_parseComplete(){let $=this._callback;this._callback=null,this._batchIndex=0,$.call(this,this.textures)}_nextBatch(){this._processFrames(this._batchIndex*J.BATCH_SIZE),this._batchIndex++,setTimeout(()=>{if(this._batchIndex*J.BATCH_SIZE<this._frameKeys.length)this._nextBatch();else this._processAnimations(),this._parseComplete()},0)}destroy($=!1){for(let Q in this.textures)this.textures[Q].destroy();if(this._frames=null,this._frameKeys=null,this.data=null,this.textures=null,$)this._texture?.destroy(),this.textureSource.destroy();this._texture=null,this.textureSource=null,this.linkedSheets=[]}},K5;var o1=A(()=>{E7();X6();i8();i1.BATCH_SIZE=1000;K5=i1});function a1(J,$,Q){let Z={};if(J.forEach((K)=>{Z[K]=$}),Object.keys($.textures).forEach((K)=>{Z[`${$.cachePrefix}${K}`]=$.textures[K]}),!Q){let K=JJ.dirname(J[0]);$.linkedSheets.forEach((W,X)=>{let H=a1([`${K}/${$.data.meta.related_multi_packs[X]}`],W,!0);Object.assign(Z,H)})}return Z}var z4,r1;var t1=A(()=>{x1();s1();n1();k0();i8();J5();o1();z4=["jpg","png","jpeg","avif","webp","basis","etc2","bc7","bc6h","bc5","bc4","bc3","bc2","bc1","eac","astc"];r1={extension:b.Asset,cache:{test:(J)=>J instanceof K5,getCacheableAssets:(J,$)=>a1(J,$,!1)},resolver:{extension:{type:b.ResolveParser,name:"resolveSpritesheet"},test:(J)=>{let Q=J.split("?")[0].split("."),Z=Q.pop(),K=Q.pop();return Z==="json"&&z4.includes(K)},parse:(J)=>{let $=J.split(".");return{resolution:parseFloat(o$.RETINA_PREFIX.exec(J)?.[1]??"1"),format:$[$.length-2],src:J}}},loader:{name:"spritesheetLoader",id:"spritesheet",extension:{type:b.LoadParser,priority:eK.Normal,name:"spritesheetLoader"},async testParse(J,$){return JJ.extname($.src).toLowerCase()===".json"&&!!J.frames},async parse(J,$,Q){let{texture:Z,imageFilename:K,textureOptions:W,cachePrefix:X}=$?.data??{},H=JJ.dirname($.src);if(H&&H.lastIndexOf("/")!==H.length-1)H+="/";let q;if(Z instanceof P0)q=Z;else{let U=Z5(H+(K??J.meta.image),$.src);q=(await Q.load([{src:U,data:W}]))[U]}let Y=new K5({texture:q.source,data:J,cachePrefix:X});await Y.parse();let N=J?.meta?.related_multi_packs;if(Array.isArray(N)){let U=[];for(let z of N){if(typeof z!=="string")continue;let D=H+z;if($.data?.ignoreMultiPack)continue;D=Z5(D,$.src),U.push(Q.load({src:D,data:{textureOptions:W,ignoreMultiPack:!0}}))}let V=await Promise.all(U);Y.linkedSheets=V,V.forEach((z)=>{z.linkedSheets=[Y].concat(Y.linkedSheets.filter((D)=>D!==z))})}return Y},async unload(J,$,Q){await Q.unload(J.textureSource._sourceOrigin),J.destroy(!1)}}}});var a$=A(()=>{k0();t1();n0.add(r1)});function e1(J,$,Q){let{width:Z,height:K}=Q.orig,W=Q.trim;if(W){let{width:X,height:H}=W;J.minX=W.x-$._x*Z,J.maxX=J.minX+X,J.minY=W.y-$._y*K,J.maxY=J.minY+H}else J.minX=-$._x*Z,J.maxX=J.minX+Z,J.minY=-$._y*K,J.maxY=J.minY+K}var JY=()=>{};var W5;var $Y=A(()=>{v6();o6();W5=class W5 extends B8{constructor(J){super(J);this.canBundle=!0,this.allowChildren=!1,this._roundPixels=0,this._lastUsed=-1,this._gpuData=Object.create(null),this.autoGarbageCollect=!0,this._gcLastUsed=-1,this._bounds=new L8(0,1,0,0),this._boundsDirty=!0,this.autoGarbageCollect=J.autoGarbageCollect??!0}get bounds(){if(!this._boundsDirty)return this._bounds;return this.updateBounds(),this._boundsDirty=!1,this._bounds}get roundPixels(){return!!this._roundPixels}set roundPixels(J){this._roundPixels=J?1:0}containsPoint(J){let $=this.bounds,{x:Q,y:Z}=J;return Q>=$.minX&&Q<=$.maxX&&Z>=$.minY&&Z<=$.maxY}onViewUpdate(){if(this._didViewChangeTick++,this._boundsDirty=!0,this.didViewUpdate)return;this.didViewUpdate=!0;let J=this.renderGroup||this.parentRenderGroup;if(J)J.onChildViewUpdate(this)}unload(){this.emit("unload",this);for(let J in this._gpuData)this._gpuData[J]?.destroy();this._gpuData=Object.create(null),this.onViewUpdate()}destroy(J){this.unload(),super.destroy(J),this._bounds=null}collectRenderablesSimple(J,$,Q){let{renderPipes:Z}=$;Z.blendMode.pushBlendMode(this,this.groupBlendMode,J);let W=Z[this.renderPipeId];if(W?.addRenderable)W.addRenderable(this,J);this.didViewUpdate=!1;let X=this.children,H=X.length;for(let q=0;q<H;q++)X[q].collectRenderables(J,$,Q);Z.blendMode.popBlendMode(J)}}});var x6;var r$=A(()=>{BK();i8();JY();F6();$Y();x6=class x6 extends W5{constructor(J=P0.EMPTY){if(J instanceof P0)J={texture:J};let{texture:$=P0.EMPTY,anchor:Q,roundPixels:Z,width:K,height:W,...X}=J;super({label:"Sprite",...X});if(this.renderPipeId="sprite",this.batched=!0,this._visualBounds={minX:0,maxX:1,minY:0,maxY:0},this._anchor=new x8({_onUpdate:()=>{this.onViewUpdate()}}),Q)this.anchor=Q;else if($.defaultAnchor)this.anchor=$.defaultAnchor;if(this.texture=$,this.allowChildren=!1,this.roundPixels=Z??!1,K!==void 0)this.width=K;if(W!==void 0)this.height=W}static from(J,$=!1){if(J instanceof P0)return new x6(J);return new x6(P0.from(J,$))}set texture(J){J||(J=P0.EMPTY);let $=this._texture;if($===J)return;if($&&$.dynamic)$.off("update",this.onViewUpdate,this);if(J.dynamic)J.on("update",this.onViewUpdate,this);if(this._texture=J,this._width)this._setWidth(this._width,this._texture.orig.width);if(this._height)this._setHeight(this._height,this._texture.orig.height);this.onViewUpdate()}get texture(){return this._texture}get visualBounds(){return e1(this._visualBounds,this._anchor,this._texture),this._visualBounds}get sourceBounds(){return u0("8.6.1","Sprite.sourceBounds is deprecated, use visualBounds instead."),this.visualBounds}updateBounds(){let J=this._anchor,$=this._texture,Q=this._bounds,{width:Z,height:K}=$.orig;Q.minX=-J._x*Z,Q.maxX=Q.minX+Z,Q.minY=-J._y*K,Q.maxY=Q.minY+K}destroy(J=!1){if(super.destroy(J),typeof J==="boolean"?J:J?.texture){let Q=typeof J==="boolean"?J:J?.textureSource;this._texture.destroy(Q)}this._texture=null,this._visualBounds=null,this._bounds=null,this._anchor=null}get anchor(){return this._anchor}set anchor(J){typeof J==="number"?this._anchor.set(J):this._anchor.copyFrom(J)}get width(){return Math.abs(this.scale.x)*this._texture.orig.width}set width(J){this._setWidth(J,this._texture.orig.width),this._width=J}get height(){return Math.abs(this.scale.y)*this._texture.orig.height}set height(J){this._setHeight(J,this._texture.orig.height),this._height=J}getSize(J){return J||(J={}),J.width=Math.abs(this.scale.x)*this._texture.orig.width,J.height=Math.abs(this.scale.y)*this._texture.orig.height,J}setSize(J,$){if(typeof J==="object")$=J.height??J.width,J=J.width;else $??($=J);J!==void 0&&this._setWidth(J,this._texture.orig.width),$!==void 0&&this._setHeight($,this._texture.orig.height)}}});function t$(J,$,Q){let Z=D4;J.measurable=!0,jJ(J,Q,Z),$.addBoundsMask(Z),J.measurable=!1}var D4;var X5=A(()=>{v6();C9();D4=new L8});function e$(J,$,Q){let Z=z6.get();J.measurable=!0;let K=T8.get().identity(),W=QY(J,Q,K);TJ(J,Z,W),J.measurable=!1,$.addBoundsMask(Z),T8.return(K),z6.return(Z)}function QY(J,$,Q){if(!J)return v0("Mask bounds, renderable is not inside the root container"),Q;if(J!==$)QY(J.parent,$,Q),J.updateLocalTransform(),Q.append(J.localTransform);return Q}var H5=A(()=>{g$();i7();s8()});class JQ{constructor(J){if(this.priority=0,this.inverse=!1,this.pipe="alphaMask",J?.mask)this.init(J.mask)}init(J){this.mask=J,this.renderMaskToTexture=!(J instanceof x6),this.mask.renderable=this.renderMaskToTexture,this.mask.includeInBuild=!this.renderMaskToTexture,this.mask.measurable=!1}reset(){if(this.mask===null)return;this.mask.measurable=!0,this.mask=null}addBounds(J,$){if(!this.inverse)t$(this.mask,J,$)}addLocalBounds(J,$){e$(this.mask,J,$)}containsPoint(J,$){let Q=this.mask;return $(Q,J)}destroy(){this.reset()}static test(J){return J instanceof x6}}var ZY=A(()=>{k0();r$();X5();H5();JQ.extension=b.MaskEffect});class $Q{constructor(J){if(this.priority=0,this.pipe="colorMask",J?.mask)this.init(J.mask)}init(J){this.mask=J}destroy(){}static test(J){return typeof J==="number"}}var KY=A(()=>{k0();$Q.extension=b.MaskEffect});class QQ{constructor(J){if(this.priority=0,this.pipe="stencilMask",J?.mask)this.init(J.mask)}init(J){this.mask=J,this.mask.includeInBuild=!1,this.mask.measurable=!1}reset(){if(this.mask===null)return;this.mask.measurable=!0,this.mask.includeInBuild=!0,this.mask=null}addBounds(J,$){t$(this.mask,J,$)}addLocalBounds(J,$){e$(this.mask,J,$)}containsPoint(J,$){let Q=this.mask;return $(Q,J)}destroy(){this.reset()}static test(J){return J instanceof B8}}var WY=A(()=>{k0();o6();X5();H5();QQ.extension=b.MaskEffect});var k6;var f9=A(()=>{D6();k0();X6();k6=class k6 extends $8{constructor(J){if(!J.resource)J.resource=F8.get().createCanvas();if(!J.width){if(J.width=J.resource.width,!J.autoDensity)J.width/=J.resolution}if(!J.height){if(J.height=J.resource.height,!J.autoDensity)J.height/=J.resolution}super(J);this.uploadMethodId="image",this.autoDensity=J.autoDensity,this.resizeCanvas(),this.transparent=!!J.transparent}resizeCanvas(){if(this.autoDensity&&"style"in this.resource)this.resource.style.width=`${this.width}px`,this.resource.style.height=`${this.height}px`;if(this.resource.width!==this.pixelWidth||this.resource.height!==this.pixelHeight)this.resource.width=this.pixelWidth,this.resource.height=this.pixelHeight}resize(J=this.width,$=this.height,Q=this._resolution){let Z=super.resize(J,$,Q);if(Z)this.resizeCanvas();return Z}static test(J){return globalThis.HTMLCanvasElement&&J instanceof HTMLCanvasElement||globalThis.OffscreenCanvas&&J instanceof OffscreenCanvas}get context2D(){return this._context2D||(this._context2D=this.resource.getContext("2d"))}};k6.extension=b.TextureSource});var ZQ;var XY=A(()=>{k0();X6();ZQ=class ZQ extends $8{constructor(J){super(J);this.uploadMethodId="image",this.autoGarbageCollect=!0}static test(J){return globalThis.HTMLImageElement&&J instanceof HTMLImageElement||typeof ImageBitmap<"u"&&J instanceof ImageBitmap||globalThis.VideoFrame&&J instanceof VideoFrame}};ZQ.extension=b.TextureSource});async function HY(){return q5??(q5=(async()=>{let $=F8.get().createCanvas(1,1).getContext("webgl");if(!$)return"premultiply-alpha-on-upload";let Q=await new Promise((X)=>{let H=document.createElement("video");H.onloadeddata=()=>X(H),H.onerror=()=>X(null),H.autoplay=!1,H.crossOrigin="anonymous",H.preload="auto",H.src="data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAHTEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggG97AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBArqBApqBAlPAgQFVsIRVuYEBElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dcfngQCgwqGggQAAAIJJg0IAABAAFgA4JBwYSgAAICAAEb///4r+AAB1oZ2mm+6BAaWWgkmDQgAAEAAWADgkHBhKAAAgIABIQBxTu2uRu4+zgQC3iveBAfGCAXHwgQM=",H.load()});if(!Q)return"premultiply-alpha-on-upload";let Z=$.createTexture();$.bindTexture($.TEXTURE_2D,Z);let K=$.createFramebuffer();$.bindFramebuffer($.FRAMEBUFFER,K),$.framebufferTexture2D($.FRAMEBUFFER,$.COLOR_ATTACHMENT0,$.TEXTURE_2D,Z,0),$.pixelStorei($.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),$.pixelStorei($.UNPACK_COLORSPACE_CONVERSION_WEBGL,$.NONE),$.texImage2D($.TEXTURE_2D,0,$.RGBA,$.RGBA,$.UNSIGNED_BYTE,Q);let W=new Uint8Array(4);return $.readPixels(0,0,1,1,$.RGBA,$.UNSIGNED_BYTE,W),$.deleteFramebuffer(K),$.deleteTexture(Z),$.getExtension("WEBGL_lose_context")?.loseContext(),W[0]<=W[3]?"premultiplied-alpha":"premultiply-alpha-on-upload"})()),q5}var q5;var qY=A(()=>{D6()});var KQ,YY;var NY=A(()=>{k0();hJ();qY();X6();KQ=class J extends $8{constructor($){super($);if(this.isReady=!1,this.uploadMethodId="video",$={...J.defaultOptions,...$},this._autoUpdate=!0,this._isConnectedToTicker=!1,this._updateFPS=$.updateFPS||0,this._msToNextUpdate=0,this.autoPlay=$.autoPlay!==!1,this.alphaMode=$.alphaMode??"premultiply-alpha-on-upload",this._videoFrameRequestCallback=this._videoFrameRequestCallback.bind(this),this._videoFrameRequestCallbackHandle=null,this._load=null,this._resolve=null,this._reject=null,this._onCanPlay=this._onCanPlay.bind(this),this._onCanPlayThrough=this._onCanPlayThrough.bind(this),this._onError=this._onError.bind(this),this._onPlayStart=this._onPlayStart.bind(this),this._onPlayStop=this._onPlayStop.bind(this),this._onSeeked=this._onSeeked.bind(this),$.autoLoad!==!1)this.load()}updateFrame(){if(this.destroyed)return;if(this._updateFPS){let $=l8.shared.elapsedMS*this.resource.playbackRate;this._msToNextUpdate=Math.floor(this._msToNextUpdate-$)}if(!this._updateFPS||this._msToNextUpdate<=0)this._msToNextUpdate=this._updateFPS?Math.floor(1000/this._updateFPS):0;if(this.isValid)this.update()}_videoFrameRequestCallback(){if(this.updateFrame(),this.destroyed)this._videoFrameRequestCallbackHandle=null;else this._videoFrameRequestCallbackHandle=this.resource.requestVideoFrameCallback(this._videoFrameRequestCallback)}get isValid(){return!!this.resource.videoWidth&&!!this.resource.videoHeight}async load(){if(this._load)return this._load;let $=this.resource,Q=this.options;if(($.readyState===$.HAVE_ENOUGH_DATA||$.readyState===$.HAVE_FUTURE_DATA)&&$.width&&$.height)$.complete=!0;if($.addEventListener("play",this._onPlayStart),$.addEventListener("pause",this._onPlayStop),$.addEventListener("seeked",this._onSeeked),!this._isSourceReady()){if(!Q.preload)$.addEventListener("canplay",this._onCanPlay);$.addEventListener("canplaythrough",this._onCanPlayThrough),$.addEventListener("error",this._onError,!0)}else this._mediaReady();return this.alphaMode=await HY(),this._load=new Promise((Z,K)=>{if(this.isValid)Z(this);else{if(this._resolve=Z,this._reject=K,Q.preloadTimeoutMs!==void 0)this._preloadTimeout=setTimeout(()=>{this._onError(new ErrorEvent(`Preload exceeded timeout of ${Q.preloadTimeoutMs}ms`))});$.load()}}),this._load}_onError($){if(this.resource.removeEventListener("error",this._onError,!0),this.emit("error",$),this._reject)this._reject($),this._reject=null,this._resolve=null}_isSourcePlaying(){let $=this.resource;return!$.paused&&!$.ended}_isSourceReady(){return this.resource.readyState>2}_onPlayStart(){if(!this.isValid)this._mediaReady();this._configureAutoUpdate()}_onPlayStop(){this._configureAutoUpdate()}_onSeeked(){if(this._autoUpdate&&!this._isSourcePlaying())this._msToNextUpdate=0,this.updateFrame(),this._msToNextUpdate=0}_onCanPlay(){this.resource.removeEventListener("canplay",this._onCanPlay),this._mediaReady()}_onCanPlayThrough(){if(this.resource.removeEventListener("canplaythrough",this._onCanPlay),this._preloadTimeout)clearTimeout(this._preloadTimeout),this._preloadTimeout=void 0;this._mediaReady()}_mediaReady(){let $=this.resource;if(this.isValid)this.isReady=!0,this.resize($.videoWidth,$.videoHeight);if(this._msToNextUpdate=0,this.updateFrame(),this._msToNextUpdate=0,this._resolve)this._resolve(this),this._resolve=null,this._reject=null;if(this._isSourcePlaying())this._onPlayStart();else if(this.autoPlay)this.resource.play()}destroy(){this._configureAutoUpdate();let $=this.resource;if($)$.removeEventListener("play",this._onPlayStart),$.removeEventListener("pause",this._onPlayStop),$.removeEventListener("seeked",this._onSeeked),$.removeEventListener("canplay",this._onCanPlay),$.removeEventListener("canplaythrough",this._onCanPlayThrough),$.removeEventListener("error",this._onError,!0),$.pause(),$.src="",$.load();super.destroy()}get autoUpdate(){return this._autoUpdate}set autoUpdate($){if($!==this._autoUpdate)this._autoUpdate=$,this._configureAutoUpdate()}get updateFPS(){return this._updateFPS}set updateFPS($){if($!==this._updateFPS)this._updateFPS=$,this._configureAutoUpdate()}_configureAutoUpdate(){if(this._autoUpdate&&this._isSourcePlaying())if(!this._updateFPS&&this.resource.requestVideoFrameCallback){if(this._isConnectedToTicker)l8.shared.remove(this.updateFrame,this),this._isConnectedToTicker=!1,this._msToNextUpdate=0;if(this._videoFrameRequestCallbackHandle===null)this._videoFrameRequestCallbackHandle=this.resource.requestVideoFrameCallback(this._videoFrameRequestCallback)}else{if(this._videoFrameRequestCallbackHandle!==null)this.resource.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle),this._videoFrameRequestCallbackHandle=null;if(!this._isConnectedToTicker)l8.shared.add(this.updateFrame,this),this._isConnectedToTicker=!0,this._msToNextUpdate=0}else{if(this._videoFrameRequestCallbackHandle!==null)this.resource.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle),this._videoFrameRequestCallbackHandle=null;if(this._isConnectedToTicker)l8.shared.remove(this.updateFrame,this),this._isConnectedToTicker=!1,this._msToNextUpdate=0}}static test($){return globalThis.HTMLVideoElement&&$ instanceof HTMLVideoElement}};KQ.extension=b.TextureSource;KQ.defaultOptions={...$8.defaultOptions,autoLoad:!0,autoPlay:!0,updateFPS:0,crossorigin:!0,loop:!1,muted:!0,playsinline:!0,preload:!1};KQ.MIME_TYPES={ogv:"video/ogg",mov:"video/quicktime",m4v:"video/mp4"};YY=KQ});class UY{constructor(){this._parsers=[],this._cache=new Map,this._cacheMap=new Map}reset(){this._cacheMap.clear(),this._cache.clear()}has(J){return this._cache.has(J)}get(J){let $=this._cache.get(J);if(!$)v0(`[Assets] Asset id ${J} was not found in the Cache`);return $}set(J,$){let Q=T7(J),Z;for(let H=0;H<this.parsers.length;H++){let q=this.parsers[H];if(q.test($)){Z=q.getCacheableAssets(Q,$);break}}let K=new Map(Object.entries(Z||{}));if(!Z)Q.forEach((H)=>{K.set(H,$)});let W=[...K.keys()],X={cacheKeys:W,keys:Q};Q.forEach((H)=>{this._cacheMap.set(H,X)}),W.forEach((H)=>{let q=Z?Z[H]:$;if(this._cache.has(H)&&this._cache.get(H)!==q)v0("[Cache] already has key:",H);this._cache.set(H,K.get(H))})}remove(J){if(!this._cacheMap.has(J)){v0(`[Assets] Asset id ${J} was not found in the Cache`);return}let $=this._cacheMap.get(J);$.cacheKeys.forEach((Z)=>{this._cache.delete(Z)}),$.keys.forEach((Z)=>{this._cacheMap.delete(Z)})}get parsers(){return this._parsers}}var $J;var VY=A(()=>{s8();$5();$J=new UY});function OY(J={}){let $=J&&J.resource,Q=$?J.resource:J,Z=$?J:{resource:J};for(let K=0;K<Y5.length;K++){let W=Y5[K];if(W.test(Q))return new W(Z)}throw Error(`Could not find a source type for resource: ${Z.resource}`)}function FY(J={},$=!1){let Q=J&&J.resource,Z=Q?J.resource:J,K=Q?J:{resource:J};if(!$&&$J.has(Z))return $J.get(Z);let W=new P0({source:OY(K)});if(W.on("destroy",()=>{if($J.has(Z))$J.remove(Z)}),!$)$J.set(Z,W);return W}function zY(J,$=!1){if(typeof J==="string")return $J.get(J);else if(J instanceof $8)return new P0({source:J});return FY(J,$)}var Y5;var N5=A(()=>{VY();k0();X6();i8();Y5=[];n0.handleByList(b.TextureSource,Y5);P0.from=zY;$8.from=OY});var WQ=A(()=>{k0();ZY();KY();WY();hK();f9();XY();NY();N5();n0.add(JQ,$Q,QQ,YY,ZQ,k6,bJ)});class XQ{constructor(J){this._renderer=J}push(J,$,Q){this._renderer.renderPipes.batch.break(Q),Q.add({renderPipeId:"filter",canBundle:!1,action:"pushFilter",container:$,filterEffect:J})}pop(J,$,Q){this._renderer.renderPipes.batch.break(Q),Q.add({renderPipeId:"filter",action:"popFilter",canBundle:!1})}execute(J){if(J.action==="pushFilter")this._renderer.filter.push(J);else if(J.action==="popFilter")this._renderer.filter.pop()}destroy(){this._renderer=null}}var DY=A(()=>{k0();XQ.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"filter"}});function gJ(J,$){let Q=kY[J];if(Q===void 0){if(U5[$]===void 0)U5[$]=1;kY[J]=Q=U5[$]++}return Q}var U5,kY;var HQ=A(()=>{U5=Object.create(null),kY=Object.create(null)});function YQ(){if(!qQ||qQ?.isContextLost())qQ=F8.get().createCanvas().getContext("webgl",{});return qQ}var qQ;var V5=A(()=>{D6()});function IY(){if(!NQ){NQ="mediump";let J=YQ();if(J){if(J.getShaderPrecisionFormat)NQ=J.getShaderPrecisionFormat(J.FRAGMENT_SHADER,J.HIGH_FLOAT).precision?"highp":"mediump"}}return NQ}var NQ;var wY=A(()=>{V5()});function MY(J,$,Q){if($)return J;if(Q)return J=J.replace("out vec4 finalColor;",""),`

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
        `}var GY=()=>{};function RY(J,$,Q){let Z=Q?$.maxSupportedFragmentPrecision:$.maxSupportedVertexPrecision;if(J.substring(0,9)!=="precision"){let K=Q?$.requestedFragmentPrecision:$.requestedVertexPrecision;if(K==="highp"&&Z!=="highp")K="mediump";return`precision ${K} float;
${J}`}else if(Z!=="highp"&&J.substring(0,15)==="precision highp")return J.replace("precision highp","precision mediump");return J}var LY=()=>{};function BY(J,$){if(!$)return J;return`#version 300 es
${J}`}var AY=()=>{};function _Y(J,{name:$="pixi-program"},Q=!0){$=$.replace(/\s+/g,"-"),$+=Q?"-fragment":"-vertex";let Z=Q?k4:I4;if(Z[$])Z[$]++,$+=`-${Z[$]}`;else Z[$]=1;if(J.indexOf("#define SHADER_NAME")!==-1)return J;return`${`#define SHADER_NAME ${$}`}
${J}`}var k4,I4;var CY=A(()=>{k4={},I4={}});function EY(J,$){if(!$)return J;return J.replace("#version 300 es","")}var PY=()=>{};var O5,h9,jY=class J{constructor($){$={...J.defaultOptions,...$};let Q=$.fragment.indexOf("#version 300 es")!==-1,Z={stripVersion:Q,ensurePrecision:{requestedFragmentPrecision:$.preferredFragmentPrecision,requestedVertexPrecision:$.preferredVertexPrecision,maxSupportedVertexPrecision:"highp",maxSupportedFragmentPrecision:IY()},setProgramName:{name:$.name},addProgramDefines:Q,insertVersion:Q},K=$.fragment,W=$.vertex;Object.keys(O5).forEach((X)=>{let H=Z[X];K=O5[X](K,H,!0),W=O5[X](W,H,!1)}),this.fragment=K,this.vertex=W,this.transformFeedbackVaryings=$.transformFeedbackVaryings,this._key=gJ(`${this.vertex}:${this.fragment}`,"gl-program")}destroy(){this.fragment=null,this.vertex=null,this._attributeData=null,this._uniformData=null,this._uniformBlockData=null,this.transformFeedbackVaryings=null,h9[this._cacheKey]=null}static from($){let Q=`${$.vertex}:${$.fragment}`;if(!h9[Q])h9[Q]=new J($),h9[Q]._cacheKey=Q;return h9[Q]}},L6;var QJ=A(()=>{HQ();wY();GY();LY();AY();CY();PY();O5={stripVersion:EY,ensurePrecision:RY,addProgramDefines:MY,setProgramName:_Y,insertVersion:BY},h9=Object.create(null);jY.defaultOptions={preferredVertexPrecision:"highp",preferredFragmentPrecision:"mediump"};L6=jY});function q7(J){return SY[J]??SY.float32}var SY;var x9=A(()=>{SY={uint8x2:{size:2,stride:2,normalised:!1},uint8x4:{size:4,stride:4,normalised:!1},sint8x2:{size:2,stride:2,normalised:!1},sint8x4:{size:4,stride:4,normalised:!1},unorm8x2:{size:2,stride:2,normalised:!0},unorm8x4:{size:4,stride:4,normalised:!0},snorm8x2:{size:2,stride:2,normalised:!0},snorm8x4:{size:4,stride:4,normalised:!0},uint16x2:{size:2,stride:4,normalised:!1},uint16x4:{size:4,stride:8,normalised:!1},sint16x2:{size:2,stride:4,normalised:!1},sint16x4:{size:4,stride:8,normalised:!1},unorm16x2:{size:2,stride:4,normalised:!0},unorm16x4:{size:4,stride:8,normalised:!0},snorm16x2:{size:2,stride:4,normalised:!0},snorm16x4:{size:4,stride:8,normalised:!0},float16x2:{size:2,stride:4,normalised:!1},float16x4:{size:4,stride:8,normalised:!1},float32:{size:1,stride:4,normalised:!1},float32x2:{size:2,stride:8,normalised:!1},float32x3:{size:3,stride:12,normalised:!1},float32x4:{size:4,stride:16,normalised:!1},uint32:{size:1,stride:4,normalised:!1},uint32x2:{size:2,stride:8,normalised:!1},uint32x3:{size:3,stride:12,normalised:!1},uint32x4:{size:4,stride:16,normalised:!1},sint32:{size:1,stride:4,normalised:!1},sint32x2:{size:2,stride:8,normalised:!1},sint32x3:{size:3,stride:12,normalised:!1},sint32x4:{size:4,stride:16,normalised:!1}}});function yY(J,$){let Q;while((Q=TY.exec(J))!==null){let Z=w4[Q[3]]??"float32";$[Q[2]]={location:parseInt(Q[1],10),format:Z,stride:q7(Z).stride,offset:0,instance:!1,start:0}}TY.lastIndex=0}function M4(J){return J.replace(/\/\/.*$/gm,"").replace(/\/\*[\s\S]*?\*\//g,"")}function bY({source:J,entryPoint:$}){let Q={},Z=M4(J),K=Z.indexOf(`fn ${$}(`);if(K===-1)return Q;let W=Z.indexOf("->",K);if(W===-1)return Q;let X=Z.substring(K,W);if(yY(X,Q),Object.keys(Q).length===0){let H=X.match(/\(\s*\w+\s*:\s*(\w+)/);if(H){let q=H[1],Y=new RegExp(`struct\\s+${q}\\s*\\{([^}]+)\\}`,"s"),N=Z.match(Y);if(N)yY(N[1],Q)}}return Q}var w4,TY;var vY=A(()=>{x9();w4={f32:"float32","vec2<f32>":"float32x2","vec3<f32>":"float32x3","vec4<f32>":"float32x4",vec2f:"float32x2",vec3f:"float32x3",vec4f:"float32x4",i32:"sint32","vec2<i32>":"sint32x2","vec3<i32>":"sint32x3","vec4<i32>":"sint32x4",vec2i:"sint32x2",vec3i:"sint32x3",vec4i:"sint32x4",u32:"uint32","vec2<u32>":"uint32x2","vec3<u32>":"uint32x3","vec4<u32>":"uint32x4",vec2u:"uint32x2",vec3u:"uint32x3",vec4u:"uint32x4",bool:"uint32","vec2<bool>":"uint32x2","vec3<bool>":"uint32x3","vec4<bool>":"uint32x4"},TY=/@location\((\d+)\)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)(?:,|\s|\)|$)/g});function UQ(J){let $=/(^|[^/])@(group|binding)\(\d+\)[^;]+;/g,Q=/@group\((\d+)\)/,Z=/@binding\((\d+)\)/,K=/var(<[^>]+>)? (\w+)/,W=/:\s*([\w<>]+)/,X=/struct\s+(\w+)\s*{([^}]+)}/g,H=/(\w+)\s*:\s*([\w\<\>]+)/g,q=/struct\s+(\w+)/,Y=J.match($)?.map((U)=>({group:parseInt(U.match(Q)[1],10),binding:parseInt(U.match(Z)[1],10),name:U.match(K)[2],isUniform:U.match(K)[1]==="<uniform>",type:U.match(W)[1]}));if(!Y)return{groups:[],structs:[]};let N=J.match(X)?.map((U)=>{let V=U.match(q)[1],z=U.match(H).reduce((D,w)=>{let[F,O]=w.split(":");return D[F.trim()]=O.trim(),D},{});if(!z)return null;return{name:V,members:z}}).filter(({name:U})=>Y.some((V)=>V.type===U||V.type.includes(`<${U}>`)))??[];return{groups:Y,structs:N}}var fY=()=>{};var y7;var hY=A(()=>{y7=((J)=>{return J[J.VERTEX=1]="VERTEX",J[J.FRAGMENT=2]="FRAGMENT",J[J.COMPUTE=4]="COMPUTE",J})(y7||{})});function xY({groups:J}){let $=[];for(let Q=0;Q<J.length;Q++){let Z=J[Q];if(!$[Z.group])$[Z.group]=[];if(Z.isUniform)$[Z.group].push({binding:Z.binding,visibility:y7.VERTEX|y7.FRAGMENT,buffer:{type:"uniform"}});else if(Z.type==="sampler")$[Z.group].push({binding:Z.binding,visibility:y7.FRAGMENT,sampler:{type:"filtering"}});else if(Z.type==="texture_2d"||Z.type.startsWith("texture_2d<"))$[Z.group].push({binding:Z.binding,visibility:y7.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d",multisampled:!1}});else if(Z.type==="texture_2d_array"||Z.type.startsWith("texture_2d_array<"))$[Z.group].push({binding:Z.binding,visibility:y7.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d-array",multisampled:!1}});else if(Z.type==="texture_cube"||Z.type.startsWith("texture_cube<"))$[Z.group].push({binding:Z.binding,visibility:y7.FRAGMENT,texture:{sampleType:"float",viewDimension:"cube",multisampled:!1}})}for(let Q=0;Q<$.length;Q++)$[Q]||($[Q]=[]);return $}var gY=A(()=>{hY()});function pY({groups:J}){let $=[];for(let Q=0;Q<J.length;Q++){let Z=J[Q];if(!$[Z.group])$[Z.group]={};$[Z.group][Z.name]=Z.binding}return $}var mY=()=>{};function dY(J,$){let Q=new Set,Z=new Set,K=[...J.structs,...$.structs].filter((X)=>{if(Q.has(X.name))return!1;return Q.add(X.name),!0}),W=[...J.groups,...$.groups].filter((X)=>{let H=`${X.name}-${X.binding}`;if(Z.has(H))return!1;return Z.add(H),!0});return{structs:K,groups:W}}var lY=()=>{};class B6{constructor(J){this._layoutKey=0,this._attributeLocationsKey=0;let{fragment:$,vertex:Q,layout:Z,gpuLayout:K,name:W}=J;if(this.name=W,this.fragment=$,this.vertex=Q,$.source===Q.source){let X=UQ($.source);this.structsAndGroups=X}else{let X=UQ(Q.source),H=UQ($.source);this.structsAndGroups=dY(X,H)}this.layout=Z??pY(this.structsAndGroups),this.gpuLayout=K??xY(this.structsAndGroups),this.autoAssignGlobalUniforms=this.layout[0]?.globalUniforms!==void 0,this.autoAssignLocalUniforms=this.layout[1]?.localUniforms!==void 0,this._generateProgramKey()}_generateProgramKey(){let{vertex:J,fragment:$}=this,Q=J.source+$.source+J.entryPoint+$.entryPoint;this._layoutKey=gJ(Q,"program")}get attributeData(){return this._attributeData??(this._attributeData=bY(this.vertex)),this._attributeData}destroy(){this.gpuLayout=null,this.layout=null,this.structsAndGroups=null,this.fragment=null,this.vertex=null,g9[this._cacheKey]=null}static from(J){let $=`${J.vertex.source}:${J.fragment.source}:${J.fragment.entryPoint}:${J.vertex.entryPoint}`;if(!g9[$])g9[$]=new B6(J),g9[$]._cacheKey=$;return g9[$]}}var g9;var pJ=A(()=>{HQ();vY();fY();gY();mY();lY();g9=Object.create(null)});class Y7{constructor(J){this.resources=Object.create(null),this._dirty=!0;let $=0;for(let Q in J){let Z=J[Q];this.setResource(Z,$++)}this._updateKey()}_updateKey(){if(!this._dirty)return;this._dirty=!1;let J=[],$=0;for(let Q in this.resources)J[$++]=this.resources[Q]._resourceId;this._key=J.join("|")}setResource(J,$){let Q=this.resources[$];if(J===Q)return;if(Q)J.off?.("change",this.onResourceChange,this);J.on?.("change",this.onResourceChange,this),this.resources[$]=J,this._dirty=!0}getResource(J){return this.resources[J]}_touch(J,$){let Q=this.resources;for(let Z in Q)Q[Z]._gcLastUsed=J,Q[Z]._touched=$}destroy(){let J=this.resources;for(let $ in J)J[$]?.off?.("change",this.onResourceChange,this);this.resources=null}onResourceChange(J){if(this._dirty=!0,J.destroyed){let $=this.resources;for(let Q in $)if($[Q]===J)$[Q]=null}else this._updateKey()}}var VQ=()=>{};var q6;var ZJ=A(()=>{q6=((J)=>{return J[J.WEBGL=1]="WEBGL",J[J.WEBGPU=2]="WEBGPU",J[J.CANVAS=4]="CANVAS",J[J.BOTH=3]="BOTH",J})(q6||{})});var F5,cY;var uY=A(()=>{F5=["f32","i32","vec2<f32>","vec3<f32>","vec4<f32>","mat2x2<f32>","mat3x3<f32>","mat4x4<f32>","mat3x2<f32>","mat4x2<f32>","mat2x3<f32>","mat4x3<f32>","mat2x4<f32>","mat3x4<f32>","vec2<i32>","vec3<i32>","vec4<i32>"],cY=F5.reduce((J,$)=>{return J[$]=!0,J},{})});function sY(J,$){switch(J){case"f32":return 0;case"vec2<f32>":return new Float32Array(2*$);case"vec3<f32>":return new Float32Array(3*$);case"vec4<f32>":return new Float32Array(4*$);case"mat2x2<f32>":return new Float32Array([1,0,0,1]);case"mat3x3<f32>":return new Float32Array([1,0,0,0,1,0,0,0,1]);case"mat4x4<f32>":return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}return null}var nY=()=>{};var iY=class J{constructor($,Q){this._touched=0,this.uid=i0("uniform"),this._resourceType="uniformGroup",this._resourceId=i0("resource"),this.isUniformGroup=!0,this._dirtyId=0,this.destroyed=!1,Q={...J.defaultOptions,...Q},this.uniformStructures=$;let Z={};for(let K in $){let W=$[K];if(W.name=K,W.size=W.size??1,!cY[W.type]){let X=W.type.match(/^array<(\w+(?:<\w+>)?),\s*(\d+)>$/);if(X){let[,H,q]=X;throw Error(`Uniform type ${W.type} is not supported. Use type: '${H}', size: ${q} instead.`)}throw Error(`Uniform type ${W.type} is not supported. Supported uniform types are: ${F5.join(", ")}`)}W.value??(W.value=sY(W.type,W.size)),Z[K]=W.value}this.uniforms=Z,this._dirtyId=1,this.ubo=Q.ubo,this.isStatic=Q.isStatic,this._signature=gJ(Object.keys(Z).map((K)=>`${K}-${$[K].type}`).join("-"),"uniform-group")}update(){this._dirtyId++}},o8;var N7=A(()=>{W6();HQ();uY();nY();iY.defaultOptions={ubo:!1,isStatic:!1};o8=iY});var A6;var mJ=A(()=>{O6();W6();QJ();VQ();pJ();ZJ();N7();A6=class A6 extends C8{constructor(J){super();this.uid=i0("shader"),this._uniformBindMap=Object.create(null),this._ownedBindGroups=[],this._destroyed=!1;let{gpuProgram:$,glProgram:Q,groups:Z,resources:K,compatibleRenderers:W,groupMap:X}=J;if(this.gpuProgram=$,this.glProgram=Q,W===void 0){if(W=0,$)W|=q6.WEBGPU;if(Q)W|=q6.WEBGL}this.compatibleRenderers=W;let H={};if(!K&&!Z)K={};if(K&&Z)throw Error("[Shader] Cannot have both resources and groups");else if(!$&&Z&&!X)throw Error("[Shader] No group map or WebGPU shader provided - consider using resources instead.");else if(!$&&Z&&X)for(let q in X)for(let Y in X[q]){let N=X[q][Y];H[N]={group:q,binding:Y,name:N}}else if($&&Z&&!X){let q=$.structsAndGroups.groups;X={},q.forEach((Y)=>{X[Y.group]=X[Y.group]||{},X[Y.group][Y.binding]=Y.name,H[Y.name]=Y})}else if(K){if(Z={},X={},$)$.structsAndGroups.groups.forEach((N)=>{X[N.group]=X[N.group]||{},X[N.group][N.binding]=N.name,H[N.name]=N});let q=0;for(let Y in K){if(H[Y])continue;if(!Z[99])Z[99]=new Y7,this._ownedBindGroups.push(Z[99]);H[Y]={group:99,binding:q,name:Y},X[99]=X[99]||{},X[99][q]=Y,q++}for(let Y in K){let N=Y,U=K[Y];if(!U.source&&!U._resourceType)U=new o8(U);let V=H[N];if(V){if(!Z[V.group])Z[V.group]=new Y7,this._ownedBindGroups.push(Z[V.group]);Z[V.group].setResource(U,V.binding)}}}this.groups=Z,this._uniformBindMap=X,this.resources=this._buildResourceAccessor(Z,H)}addResource(J,$,Q){var Z,K;if((Z=this._uniformBindMap)[$]||(Z[$]={}),(K=this._uniformBindMap[$])[Q]||(K[Q]=J),!this.groups[$])this.groups[$]=new Y7,this._ownedBindGroups.push(this.groups[$])}_buildResourceAccessor(J,$){let Q={};for(let Z in $){let K=$[Z];Object.defineProperty(Q,K.name,{get(){return J[K.group].getResource(K.binding)},set(W){J[K.group].setResource(W,K.binding)}})}return Q}destroy(J=!1){if(this._destroyed)return;if(this._destroyed=!0,this.emit("destroy",this),J)this.gpuProgram?.destroy(),this.glProgram?.destroy();this.gpuProgram=null,this.glProgram=null,this.removeAllListeners(),this._uniformBindMap=null,this._ownedBindGroups.forEach(($)=>{$.destroy()}),this._ownedBindGroups=null,this.resources=null,this.groups=null}static from(J){let{gpu:$,gl:Q,...Z}=J,K,W;if($)K=B6.from($);if(Q)W=L6.from(Q);return new A6({gpuProgram:K,glProgram:W,...Z})}}});var G4,z5=class J{constructor(){this.data=0,this.blendMode="normal",this.polygonOffset=0,this.blend=!0,this.depthMask=!0}get blend(){return!!(this.data&1)}set blend($){if(!!(this.data&1)!==$)this.data^=1}get offsets(){return!!(this.data&2)}set offsets($){if(!!(this.data&2)!==$)this.data^=2}set cullMode($){if($==="none"){this.culling=!1;return}this.culling=!0,this.clockwiseFrontFace=$==="front"}get cullMode(){if(!this.culling)return"none";return this.clockwiseFrontFace?"front":"back"}get culling(){return!!(this.data&4)}set culling($){if(!!(this.data&4)!==$)this.data^=4}get depthTest(){return!!(this.data&8)}set depthTest($){if(!!(this.data&8)!==$)this.data^=8}get depthMask(){return!!(this.data&32)}set depthMask($){if(!!(this.data&32)!==$)this.data^=32}get clockwiseFrontFace(){return!!(this.data&16)}set clockwiseFrontFace($){if(!!(this.data&16)!==$)this.data^=16}get blendMode(){return this._blendMode}set blendMode($){this.blend=$!=="none",this._blendMode=$,this._blendModeId=G4[$]||0}get polygonOffset(){return this._polygonOffset}set polygonOffset($){this.offsets=!!$,this._polygonOffset=$}toString(){return`[pixi.js/core:State blendMode=${this.blendMode} clockwiseFrontFace=${this.clockwiseFrontFace} culling=${this.culling} depthMask=${this.depthMask} polygonOffset=${this.polygonOffset}]`}static for2d(){let $=new J;return $.depthTest=!1,$.blend=!0,$}},a6;var dJ=A(()=>{G4={normal:0,add:1,multiply:2,screen:3,overlay:4,erase:5,"normal-npm":6,"add-npm":7,"screen-npm":8,min:9,max:10};z5.default2d=z5.for2d();a6=z5});var oY,OQ;var D5=A(()=>{QJ();pJ();mJ();dJ();oY=class J extends A6{constructor($){$={...J.defaultOptions,...$};super($);if(this.enabled=!0,this._state=a6.for2d(),this.blendMode=$.blendMode,this.padding=$.padding,typeof $.antialias==="boolean")this.antialias=$.antialias?"on":"off";else this.antialias=$.antialias;if(this.resolution=$.resolution,this.blendRequired=$.blendRequired,this.clipToViewport=$.clipToViewport,this.addResource("uTexture",0,1),$.blendRequired)this.addResource("uBackTexture",0,3)}apply($,Q,Z,K){$.applyFilter(this,Q,Z,K)}get blendMode(){return this._state.blendMode}set blendMode($){this._state.blendMode=$}static from($){let{gpu:Q,gl:Z,...K}=$,W,X;if(Q)W=B6.from(Q);if(Z)X=L6.from(Z);return new J({gpuProgram:W,glProgram:X,...K})}};oY.defaultOptions={blendMode:"normal",resolution:1,padding:0,antialias:"off",blendRequired:!1,clipToViewport:!0};OQ=oY});var aY=`in vec2 aPosition;
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
`;var rY=()=>{};var tY=`in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
void main() {
    finalColor = texture(uTexture, vTextureCoord);
}
`;var eY=()=>{};var k5=`struct GlobalFilterUniforms {
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
`;var JN=()=>{};var I5;var $N=A(()=>{QJ();pJ();D5();rY();eY();JN();I5=class I5 extends OQ{constructor(){let J=B6.from({vertex:{source:k5,entryPoint:"mainVertex"},fragment:{source:k5,entryPoint:"mainFragment"},name:"passthrough-filter"}),$=L6.from({vertex:aY,fragment:tY,name:"passthrough-filter"});super({gpuProgram:J,glProgram:$})}}});var I8;var lJ=A(()=>{I8=((J)=>{return J[J.MAP_READ=1]="MAP_READ",J[J.MAP_WRITE=2]="MAP_WRITE",J[J.COPY_SRC=4]="COPY_SRC",J[J.COPY_DST=8]="COPY_DST",J[J.INDEX=16]="INDEX",J[J.VERTEX=32]="VERTEX",J[J.UNIFORM=64]="UNIFORM",J[J.STORAGE=128]="STORAGE",J[J.INDIRECT=256]="INDIRECT",J[J.QUERY_RESOLVE=512]="QUERY_RESOLVE",J[J.STATIC=1024]="STATIC",J})(I8||{})});var _6;var p9=A(()=>{O6();W6();lJ();_6=class _6 extends C8{constructor(J){let{data:$,size:Q}=J,{usage:Z,label:K,shrinkToFit:W}=J;super();if(this._gpuData=Object.create(null),this._gcLastUsed=-1,this.autoGarbageCollect=!0,this.uid=i0("buffer"),this._resourceType="buffer",this._resourceId=i0("resource"),this._touched=0,this._updateID=1,this._dataInt32=null,this.shrinkToFit=!0,this.destroyed=!1,$ instanceof Array)$=new Float32Array($);this._data=$,Q??(Q=$?.byteLength);let X=!!$;this.descriptor={size:Q,usage:Z,mappedAtCreation:X,label:K},this.shrinkToFit=W??!0}get data(){return this._data}set data(J){this.setDataWithSize(J,J.length,!0)}get dataInt32(){if(!this._dataInt32)this._dataInt32=new Int32Array(this.data.buffer);return this._dataInt32}get static(){return!!(this.descriptor.usage&I8.STATIC)}set static(J){if(J)this.descriptor.usage|=I8.STATIC;else this.descriptor.usage&=~I8.STATIC}setDataWithSize(J,$,Q){if(this._updateID++,this._updateSize=$*J.BYTES_PER_ELEMENT,this._data===J){if(Q)this.emit("update",this);return}let Z=this._data;if(this._data=J,this._dataInt32=null,!Z||Z.length!==J.length){if(!this.shrinkToFit&&Z&&J.byteLength<Z.byteLength){if(Q)this.emit("update",this)}else this.descriptor.size=J.byteLength,this._resourceId=i0("resource"),this.emit("change",this);return}if(Q)this.emit("update",this)}update(J){this._updateSize=J??this._updateSize,this._updateID++,this.emit("update",this)}unload(){this.emit("unload",this);for(let J in this._gpuData)this._gpuData[J]?.destroy();this._gpuData=Object.create(null)}destroy(){this.destroyed=!0,this.unload(),this.emit("destroy",this),this.emit("change",this),this._data=null,this.descriptor=null,this.removeAllListeners()}}});function w5(J,$){if(!(J instanceof _6)){let Q=$?I8.INDEX:I8.VERTEX;if(J instanceof Array)if($)J=new Uint32Array(J),Q=I8.INDEX|I8.COPY_DST;else J=new Float32Array(J),Q=I8.VERTEX|I8.COPY_DST;J=new _6({data:J,label:$?"index-mesh-buffer":"vertex-mesh-buffer",usage:Q})}return J}var QN=A(()=>{p9();lJ()});function ZN(J,$,Q){let Z=J.getAttribute($);if(!Z)return Q.minX=0,Q.minY=0,Q.maxX=0,Q.maxY=0,Q;let K=Z.buffer.data,W=1/0,X=1/0,H=-1/0,q=-1/0,Y=K.BYTES_PER_ELEMENT,N=(Z.offset||0)/Y,U=(Z.stride||8)/Y;for(let V=N;V<K.length;V+=U){let z=K[V],D=K[V+1];if(z>H)H=z;if(D>q)q=D;if(z<W)W=z;if(D<X)X=D}return Q.minX=W,Q.minY=X,Q.maxX=H,Q.maxY=q,Q}var KN=()=>{};function R4(J){if(J instanceof _6||Array.isArray(J)||J.BYTES_PER_ELEMENT)J={buffer:J};return J.buffer=w5(J.buffer,!1),J}var KJ;var FQ=A(()=>{O6();v6();W6();p9();QN();KN();KJ=class KJ extends C8{constructor(J={}){super();this._gpuData=Object.create(null),this.autoGarbageCollect=!0,this._gcLastUsed=-1,this.uid=i0("geometry"),this._layoutKey=0,this.instanceCount=1,this._bounds=new L8,this._boundsDirty=!0;let{attributes:$,indexBuffer:Q,topology:Z}=J;if(this.buffers=[],this.attributes={},$)for(let K in $)this.addAttribute(K,$[K]);if(this.instanceCount=J.instanceCount??1,Q)this.addIndex(Q);this.topology=Z||"triangle-list"}onBufferUpdate(){this._boundsDirty=!0,this.emit("update",this)}getAttribute(J){return this.attributes[J]}getIndex(){return this.indexBuffer}getBuffer(J){return this.getAttribute(J).buffer}getSize(){for(let J in this.attributes){let $=this.attributes[J];return $.buffer.data.length/($.stride/4||$.size)}return 0}addAttribute(J,$){let Q=R4($);if(this.buffers.indexOf(Q.buffer)===-1)this.buffers.push(Q.buffer),Q.buffer.on("update",this.onBufferUpdate,this),Q.buffer.on("change",this.onBufferUpdate,this);this.attributes[J]=Q}addIndex(J){this.indexBuffer=w5(J,!0),this.buffers.push(this.indexBuffer)}get bounds(){if(!this._boundsDirty)return this._bounds;return this._boundsDirty=!1,ZN(this,"aPosition",this._bounds)}unload(){this.emit("unload",this);for(let J in this._gpuData)this._gpuData[J]?.destroy();this._gpuData=Object.create(null)}destroy(J=!1){if(this.emit("destroy",this),this.removeAllListeners(),J)this.buffers.forEach(($)=>$.destroy());this.unload(),this.indexBuffer?.destroy(),this.attributes=null,this.buffers=null,this.indexBuffer=null,this._bounds=null}}});function XN(J,$){$.clear();let Q=$.matrix;for(let Z=0;Z<J.length;Z++){let K=J[Z];if(K.globalDisplayStatus<7)continue;let W=K.renderGroup??K.parentRenderGroup;if(W?.isCachedAsTexture)$.matrix=WN.copyFrom(W.textureOffsetInverseTransform).append(K.worldTransform);else if(W?._parentCacheAsTextureRenderGroup)$.matrix=WN.copyFrom(W._parentCacheAsTextureRenderGroup.inverseWorldTransform).append(K.groupTransform);else $.matrix=K.worldTransform;$.addBounds(K.bounds)}return $.matrix=Q,$}var WN;var HN=A(()=>{E8();WN=new B0});class qN{constructor(){this.skip=!1,this.inputTexture=null,this.backTexture=null,this.filters=null,this.bounds=new L8,this.container=null,this.blendRequired=!1,this.outputRenderSurface=null,this.globalFrame={x:0,y:0,width:0,height:0},this.firstEnabledIndex=-1,this.lastEnabledIndex=-1}}class zQ{constructor(J){this._filterStackIndex=0,this._filterStack=[],this._filterGlobalUniforms=new o8({uInputSize:{value:new Float32Array(4),type:"vec4<f32>"},uInputPixel:{value:new Float32Array(4),type:"vec4<f32>"},uInputClamp:{value:new Float32Array(4),type:"vec4<f32>"},uOutputFrame:{value:new Float32Array(4),type:"vec4<f32>"},uGlobalFrame:{value:new Float32Array(4),type:"vec4<f32>"},uOutputTexture:{value:new Float32Array(4),type:"vec4<f32>"}}),this._globalFilterBindGroup=new Y7({}),this.renderer=J}get activeBackTexture(){return this._activeFilterData?.backTexture}push(J){let $=this.renderer,Q=J.filterEffect.filters,Z=this._pushFilterData();Z.skip=!1,Z.filters=Q,Z.container=J.container,Z.outputRenderSurface=$.renderTarget.renderSurface;let K=$.renderTarget.renderTarget.colorTexture.source,W=K.resolution,X=K.antialias;if(Q.every((V)=>!V.enabled)){Z.skip=!0;return}let H=Z.bounds;if(this._calculateFilterArea(J,H),this._calculateFilterBounds(Z,$.renderTarget.rootViewPort,X,W,1),Z.skip)return;let q=this._getPreviousFilterData(),Y=this._findFilterResolution(W),N=0,U=0;if(q)N=q.bounds.minX,U=q.bounds.minY;this._calculateGlobalFrame(Z,N,U,Y,K.width,K.height),this._setupFilterTextures(Z,H,$,q)}generateFilteredTexture({texture:J,filters:$}){let Q=this._pushFilterData();this._activeFilterData=Q,Q.skip=!1,Q.filters=$;let Z=J.source,K=Z.resolution,W=Z.antialias;if($.every((V)=>!V.enabled))return Q.skip=!0,J;let X=Q.bounds;if(X.addRect(J.frame),this._calculateFilterBounds(Q,X.rectangle,W,K,0),Q.skip)return J;let H=K,q=0,Y=0;this._calculateGlobalFrame(Q,q,Y,H,Z.width,Z.height),Q.outputRenderSurface=g8.getOptimalTexture(X.width,X.height,Q.resolution,Q.antialias),Q.backTexture=P0.EMPTY,Q.inputTexture=J,this.renderer.renderTarget.finishRenderPass(),this._applyFiltersToTexture(Q,!0);let U=Q.outputRenderSurface;return U.source.alphaMode="premultiplied-alpha",U}pop(){let J=this.renderer,$=this._popFilterData();if($.skip)return;if(J.globalUniforms.pop(),J.renderTarget.finishRenderPass(),this._activeFilterData=$,this._applyFiltersToTexture($,!1),$.blendRequired)g8.returnTexture($.backTexture);g8.returnTexture($.inputTexture)}getBackTexture(J,$,Q){let Z=J.colorTexture.source._resolution,K=g8.getOptimalTexture($.width,$.height,Z,!1),W=$.minX,X=$.minY;if(Q)W-=Q.minX,X-=Q.minY;W=Math.floor(W*Z),X=Math.floor(X*Z);let H=Math.ceil($.width*Z),q=Math.ceil($.height*Z);return this.renderer.renderTarget.copyToTexture(J,K,{x:W,y:X},{width:H,height:q},{x:0,y:0}),K}applyFilter(J,$,Q,Z){let K=this.renderer,W=this._activeFilterData,H=W.outputRenderSurface===Q,q=K.renderTarget.rootRenderTarget.colorTexture.source._resolution,Y=this._findFilterResolution(q),N=0,U=0;if(H){let z=this._findPreviousFilterOffset();N=z.x,U=z.y}this._updateFilterUniforms($,Q,W,N,U,Y,H,Z);let V=J.enabled?J:this._getPassthroughFilter();this._setupBindGroupsAndRender(V,$,K)}calculateSpriteMatrix(J,$){let Q=this._activeFilterData,Z=J.set(Q.inputTexture._source.width,0,0,Q.inputTexture._source.height,Q.bounds.minX,Q.bounds.minY),K=$.worldTransform.copyTo(B0.shared),W=$.renderGroup||$.parentRenderGroup;if(W&&W.cacheToLocalTransform)K.prepend(W.cacheToLocalTransform);return K.invert(),Z.prepend(K),Z.scale(1/$.texture.orig.width,1/$.texture.orig.height),Z.translate($.anchor.x,$.anchor.y),Z}destroy(){this._passthroughFilter?.destroy(!0),this._passthroughFilter=null}_getPassthroughFilter(){return this._passthroughFilter??(this._passthroughFilter=new I5),this._passthroughFilter}_setupBindGroupsAndRender(J,$,Q){if(Q.renderPipes.uniformBatch){let Z=Q.renderPipes.uniformBatch.getUboResource(this._filterGlobalUniforms);this._globalFilterBindGroup.setResource(Z,0)}else this._globalFilterBindGroup.setResource(this._filterGlobalUniforms,0);if(this._globalFilterBindGroup.setResource($.source,1),this._globalFilterBindGroup.setResource($.source.style,2),J.groups[0]=this._globalFilterBindGroup,Q.encoder.draw({geometry:L4,shader:J,state:J._state,topology:"triangle-list"}),Q.type===q6.WEBGL)Q.renderTarget.finishRenderPass()}_setupFilterTextures(J,$,Q,Z){if(J.backTexture=P0.EMPTY,J.inputTexture=g8.getOptimalTexture($.width,$.height,J.resolution,J.antialias),J.blendRequired){Q.renderTarget.finishRenderPass();let K=Q.renderTarget.getRenderTarget(J.outputRenderSurface);J.backTexture=this.getBackTexture(K,$,Z?.bounds)}Q.renderTarget.bind(J.inputTexture,!0),Q.globalUniforms.push({offset:$})}_calculateGlobalFrame(J,$,Q,Z,K,W){let X=J.globalFrame;X.x=$*Z,X.y=Q*Z,X.width=K*Z,X.height=W*Z}_updateFilterUniforms(J,$,Q,Z,K,W,X,H){let q=this._filterGlobalUniforms.uniforms,Y=q.uOutputFrame,N=q.uInputSize,U=q.uInputPixel,V=q.uInputClamp,z=q.uGlobalFrame,D=q.uOutputTexture;if(X)Y[0]=Q.bounds.minX-Z,Y[1]=Q.bounds.minY-K;else Y[0]=0,Y[1]=0;Y[2]=J.frame.width,Y[3]=J.frame.height,N[0]=J.source.width,N[1]=J.source.height,N[2]=1/N[0],N[3]=1/N[1],U[0]=J.source.pixelWidth,U[1]=J.source.pixelHeight,U[2]=1/U[0],U[3]=1/U[1],V[0]=0.5*U[2],V[1]=0.5*U[3],V[2]=J.frame.width*N[2]-0.5*U[2],V[3]=J.frame.height*N[3]-0.5*U[3];let w=this.renderer.renderTarget.rootRenderTarget.colorTexture;if(z[0]=Z*W,z[1]=K*W,z[2]=w.source.width*W,z[3]=w.source.height*W,$ instanceof P0)$.source.resource=null;let F=this.renderer.renderTarget.getRenderTarget($);if(this.renderer.renderTarget.bind($,!!H),$ instanceof P0)D[0]=$.frame.width,D[1]=$.frame.height;else D[0]=F.width,D[1]=F.height;D[2]=F.isRoot?-1:1,this._filterGlobalUniforms.update()}_findFilterResolution(J){let $=this._filterStackIndex-1;while($>0&&this._filterStack[$].skip)--$;return $>0&&this._filterStack[$].inputTexture?this._filterStack[$].inputTexture.source._resolution:J}_findPreviousFilterOffset(){let J=0,$=0,Q=this._filterStackIndex;while(Q>0){Q--;let Z=this._filterStack[Q];if(!Z.skip){J=Z.bounds.minX,$=Z.bounds.minY;break}}return{x:J,y:$}}_calculateFilterArea(J,$){if(J.renderables)XN(J.renderables,$);else if(J.filterEffect.filterArea)$.clear(),$.addRect(J.filterEffect.filterArea),$.applyMatrix(J.container.worldTransform);else J.container.getFastGlobalBounds(!0,$);if(J.container){let Z=(J.container.renderGroup||J.container.parentRenderGroup).cacheToLocalTransform;if(Z)$.applyMatrix(Z)}}_applyFiltersToTexture(J,$){let{inputTexture:Q,bounds:Z,filters:K,firstEnabledIndex:W,lastEnabledIndex:X}=J;if(this._globalFilterBindGroup.setResource(Q.source.style,2),this._globalFilterBindGroup.setResource(J.backTexture.source,3),W===X)K[W].apply(this,Q,J.outputRenderSurface,$);else{let H=J.inputTexture,q=g8.getOptimalTexture(Z.width,Z.height,H.source._resolution,!1),Y=q;for(let N=W;N<X;N++){let U=K[N];if(!U.enabled)continue;U.apply(this,H,Y,!0);let V=H;H=Y,Y=V}K[X].apply(this,H,J.outputRenderSurface,$),g8.returnTexture(q)}}_calculateFilterBounds(J,$,Q,Z,K){let W=this.renderer,X=J.bounds,H=J.filters,q=1/0,Y=0,N=!0,U=!1,V=!1,z=!0,D=-1,w=-1;for(let F=0;F<H.length;F++){let O=H[F];if(!O.enabled)continue;if(D===-1)D=F;if(w=F,q=Math.min(q,O.resolution==="inherit"?Z:O.resolution),Y+=O.padding,O.antialias==="off")N=!1;else if(O.antialias==="inherit")N&&(N=Q);if(!O.clipToViewport)z=!1;if(!(O.compatibleRenderers&W.type)){V=!1;break}if(O.blendRequired&&!(W.backBuffer?.useBackBuffer??!0)){v0("Blend filter requires backBuffer on WebGL renderer to be enabled. Set `useBackBuffer: true` in the renderer options."),V=!1;break}V=!0,U||(U=O.blendRequired)}if(!V){J.skip=!0;return}if(z)X.fitBounds(0,$.width/Z,0,$.height/Z);if(X.scale(q).ceil().scale(1/q).pad((Y|0)*K),!X.isPositive){J.skip=!0;return}J.antialias=N,J.resolution=q,J.blendRequired=U,J.firstEnabledIndex=D,J.lastEnabledIndex=w}_popFilterData(){return this._filterStackIndex--,this._filterStack[this._filterStackIndex]}_getPreviousFilterData(){let J,$=this._filterStackIndex-1;while($>0)if($--,J=this._filterStack[$],!J.skip)break;return J}_pushFilterData(){let J=this._filterStack[this._filterStackIndex];if(!J)J=this._filterStack[this._filterStackIndex]=new qN;return this._filterStackIndex++,J}}var L4;var YN=A(()=>{k0();$N();E8();VQ();FQ();N7();i8();j9();ZJ();v6();HN();s8();L4=new KJ({attributes:{aPosition:{buffer:new Float32Array([0,0,1,0,1,1,0,1]),format:"float32x2",stride:8,offset:0}},indexBuffer:new Uint32Array([0,1,2,0,2,3])});zQ.extension={type:[b.WebGLSystem,b.WebGPUSystem],name:"filter"}});var M5=A(()=>{k0();DY();YN();n0.add(zQ);n0.add(XQ)});var B4={};var NN=A(()=>{T1();h1();a$();WQ();M5()});var A4={};var VN=A(()=>{a$();WQ();M5()});async function FN(J){if(J)return;for(let $=0;$<G5.length;$++){let Q=G5[$];if(Q.value.test()){await Q.value.load();return}}}var G5;var zN=A(()=>{k0();G5=[];n0.handleByNamedList(b.Environment,G5)});function DQ(){if(typeof m9==="boolean")return m9;try{m9=Function("param1","param2","param3","return param1[param2] === param3;")({a:"b"},"a","b")===!0}catch(J){m9=!1}return m9}var m9;var R5=()=>{};var C6;var d9=A(()=>{C6=((J)=>{return J[J.NONE=0]="NONE",J[J.COLOR=16384]="COLOR",J[J.STENCIL=1024]="STENCIL",J[J.DEPTH=256]="DEPTH",J[J.COLOR_DEPTH=16640]="COLOR_DEPTH",J[J.COLOR_STENCIL=17408]="COLOR_STENCIL",J[J.DEPTH_STENCIL=1280]="DEPTH_STENCIL",J[J.ALL=17664]="ALL",J})(C6||{})});class l9{constructor(J){this.items=[],this._name=J}emit(J,$,Q,Z,K,W,X,H){let{name:q,items:Y}=this;for(let N=0,U=Y.length;N<U;N++)Y[N][q](J,$,Q,Z,K,W,X,H);return this}add(J){if(J[this._name])this.remove(J),this.items.push(J);return this}remove(J){let $=this.items.indexOf(J);if($!==-1)this.items.splice($,1);return this}contains(J){return this.items.indexOf(J)!==-1}removeAll(){return this.items.length=0,this}destroy(){this.removeAll(),this.items=null,this._name=null}get empty(){return this.items.length===0}get name(){return this._name}}var L5=()=>{};var _4,DN,kN;var IN=A(()=>{_9();zN();o6();R5();W6();F6();EJ();d9();L5();O6();_4=["init","destroy","contextChange","resolutionChange","resetState","renderEnd","renderStart","render","update","postrender","prerender"],DN=class J extends C8{constructor($){super();this.tick=0,this.uid=i0("renderer"),this.runners=Object.create(null),this.renderPipes=Object.create(null),this._initOptions={},this._systemsHash=Object.create(null),this.type=$.type,this.name=$.name,this.config=$;let Q=[..._4,...this.config.runners??[]];this._addRunners(...Q),this._unsafeEvalCheck()}async init($={}){let Q=$.skipExtensionImports===!0?!0:$.manageImports===!1;await FN(Q),this._addSystems(this.config.systems),this._addPipes(this.config.renderPipes,this.config.renderPipeAdaptors);for(let Z in this._systemsHash)$={...this._systemsHash[Z].constructor.defaultOptions,...$};$={...J.defaultOptions,...$},this._roundPixels=$.roundPixels?1:0;for(let Z=0;Z<this.runners.init.items.length;Z++)await this.runners.init.items[Z].init($);this._initOptions=$}render($,Q){this.tick++;let Z=$;if(Z instanceof B8){if(Z={container:Z},Q)u0(Z6,"passing a second argument is deprecated, please use render options instead"),Z.target=Q.renderTexture}if(Z.target||(Z.target=this.view.renderTarget),Z.target===this.view.renderTarget)this._lastObjectRendered=Z.container,Z.clearColor??(Z.clearColor=this.background.colorRgba),Z.clear??(Z.clear=this.background.clearBeforeRender);if(Z.clearColor){let K=Array.isArray(Z.clearColor)&&Z.clearColor.length===4;Z.clearColor=K?Z.clearColor:R6.shared.setValue(Z.clearColor).toArray()}if(!Z.transform)Z.container.updateLocalTransform(),Z.transform=Z.container.localTransform;if(!Z.container.visible)return;Z.container.enableRenderGroup(),this.runners.prerender.emit(Z),this.runners.renderStart.emit(Z),this.runners.render.emit(Z),this.runners.renderEnd.emit(Z),this.runners.postrender.emit(Z)}resize($,Q,Z){let K=this.view.resolution;if(this.view.resize($,Q,Z),this.emit("resize",this.view.screen.width,this.view.screen.height,this.view.resolution),Z!==void 0&&Z!==K)this.runners.resolutionChange.emit(Z)}clear($={}){let Q=this;$.target||($.target=Q.renderTarget.renderTarget),$.clearColor||($.clearColor=this.background.colorRgba),$.clear??($.clear=C6.ALL);let{clear:Z,clearColor:K,target:W,mipLevel:X,layer:H}=$;R6.shared.setValue(K??this.background.colorRgba),Q.renderTarget.clear(W,Z,R6.shared.toArray(),X??0,H??0)}get resolution(){return this.view.resolution}set resolution($){this.view.resolution=$,this.runners.resolutionChange.emit($)}get width(){return this.view.texture.frame.width}get height(){return this.view.texture.frame.height}get canvas(){return this.view.canvas}get lastObjectRendered(){return this._lastObjectRendered}get renderingToScreen(){return this.renderTarget.renderingToScreen}get screen(){return this.view.screen}_addRunners(...$){$.forEach((Q)=>{this.runners[Q]=new l9(Q)})}_addSystems($){let Q;for(Q in $){let Z=$[Q];this._addSystem(Z.value,Z.name)}}_addSystem($,Q){let Z=new $(this);if(this[Q])throw Error(`Whoops! The name "${Q}" is already in use`);this[Q]=Z,this._systemsHash[Q]=Z;for(let K in this.runners)this.runners[K].add(Z);return this}_addPipes($,Q){let Z=Q.reduce((K,W)=>{return K[W.name]=W.value,K},{});$.forEach((K)=>{let{value:W,name:X}=K,H=Z[X];this.renderPipes[X]=new W(this,H?new H:null),this.runners.destroy.add(this.renderPipes[X])})}destroy($=!1){if(this.runners.destroy.items.reverse(),this.runners.destroy.emit($),$===!0||typeof $==="object"&&$.releaseGlobalResources)i6.release();Object.values(this.runners).forEach((Q)=>{Q.destroy()}),this._systemsHash=null,this.renderPipes=null}generateTexture($){return this.textureGenerator.generateTexture($)}get roundPixels(){return!!this._roundPixels}_unsafeEvalCheck(){if(!DQ())throw Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}resetState(){this.runners.resetState.emit()}};DN.defaultOptions={resolution:1,failIfMajorPerformanceCaveat:!1,roundPixels:!1};kN=DN});var cJ="8.16.0";var B5=A(()=>{O6()});class wN{static init(){globalThis.__PIXI_APP_INIT__?.(this,cJ)}static destroy(){}}class kQ{constructor(J){this._renderer=J}init(){globalThis.__PIXI_RENDERER_INIT__?.(this._renderer,cJ)}destroy(){this._renderer=null}}var MN=A(()=>{k0();B5();wN.extension=b.Application;kQ.extension={type:[b.WebGLSystem,b.WebGPUSystem],name:"initHook",priority:-10}});class IQ{constructor(J){if(typeof J==="number")this.rawBinaryData=new ArrayBuffer(J);else if(J instanceof Uint8Array)this.rawBinaryData=J.buffer;else this.rawBinaryData=J;this.uint32View=new Uint32Array(this.rawBinaryData),this.float32View=new Float32Array(this.rawBinaryData),this.size=this.rawBinaryData.byteLength}get int8View(){if(!this._int8View)this._int8View=new Int8Array(this.rawBinaryData);return this._int8View}get uint8View(){if(!this._uint8View)this._uint8View=new Uint8Array(this.rawBinaryData);return this._uint8View}get int16View(){if(!this._int16View)this._int16View=new Int16Array(this.rawBinaryData);return this._int16View}get int32View(){if(!this._int32View)this._int32View=new Int32Array(this.rawBinaryData);return this._int32View}get float64View(){if(!this._float64Array)this._float64Array=new Float64Array(this.rawBinaryData);return this._float64Array}get bigUint64View(){if(!this._bigUint64Array)this._bigUint64Array=new BigUint64Array(this.rawBinaryData);return this._bigUint64Array}view(J){return this[`${J}View`]}destroy(){this.rawBinaryData=null,this.uint32View=null,this.float32View=null,this.uint16View=null,this._int8View=null,this._uint8View=null,this._int16View=null,this._int32View=null,this._float64Array=null,this._bigUint64Array=null}static sizeOf(J){switch(J){case"int8":case"uint8":return 1;case"int16":case"uint16":return 2;case"int32":case"uint32":case"float32":return 4;default:throw Error(`${J} isn't a valid view type`)}}}var GN=()=>{};function A5(J,$,Q,Z){if(Q??(Q=0),Z??(Z=Math.min(J.byteLength-Q,$.byteLength)),!(Q&7)&&!(Z&7)){let K=Z/8;new Float64Array($,0,K).set(new Float64Array(J,Q,K))}else if(!(Q&3)&&!(Z&3)){let K=Z/4;new Float32Array($,0,K).set(new Float32Array(J,Q,K))}else new Uint8Array($).set(new Uint8Array(J,Q,Z))}var RN=()=>{};var LN,j8;var c9=A(()=>{LN={normal:"normal-npm",add:"add-npm",screen:"screen-npm"},j8=((J)=>{return J[J.DISABLED=0]="DISABLED",J[J.RENDERING_MASK_ADD=1]="RENDERING_MASK_ADD",J[J.MASK_ACTIVE=2]="MASK_ACTIVE",J[J.INVERSE_MASK_ACTIVE=3]="INVERSE_MASK_ACTIVE",J[J.RENDERING_MASK_REMOVE=4]="RENDERING_MASK_REMOVE",J[J.NONE=5]="NONE",J})(j8||{})});function _5(J,$){if($.alphaMode==="no-premultiply-alpha")return LN[J]||J;return J}var BN=A(()=>{c9()});function E4(J){let $="";for(let Q=0;Q<J;++Q){if(Q>0)$+=`
else `;if(Q<J-1)$+=`if(test == ${Q}.0){}`}return $}function wQ(J,$){if(J===0)throw Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");let Q=$.createShader($.FRAGMENT_SHADER);try{while(!0){let Z=C4.replace(/%forloop%/gi,E4(J));if($.shaderSource(Q,Z),$.compileShader(Q),!$.getShaderParameter(Q,$.COMPILE_STATUS))J=J/2|0;else break}}finally{$.deleteShader(Q)}return J}var C4;var C5=A(()=>{C4=["precision mediump float;","void main(void){","float test = 0.1;","%forloop%","gl_FragColor = vec4(0.0);","}"].join(`
`)});function AN(){if(uJ)return uJ;let J=YQ();return uJ=J.getParameter(J.MAX_TEXTURE_IMAGE_UNITS),uJ=wQ(uJ,J),J.getExtension("WEBGL_lose_context")?.loseContext(),uJ}var uJ=null;var _N=A(()=>{V5();C5()});class E5{constructor(){this.ids=Object.create(null),this.textures=[],this.count=0}clear(){for(let J=0;J<this.count;J++){let $=this.textures[J];this.textures[J]=null,this.ids[$.uid]=null}this.count=0}}var CN=()=>{};class jN{constructor(){this.renderPipeId="batch",this.action="startBatch",this.start=0,this.size=0,this.textures=new E5,this.blendMode="normal",this.topology="triangle-strip",this.canBundle=!0}destroy(){this.textures=null,this.gpuBindGroup=null,this.bindGroup=null,this.batcher=null,this.elements=null}}function EN(){return MQ>0?s9[--MQ]:new jN}function PN(J){J.elements=null,s9[MQ++]=J}var s9,MQ=0,u9=0,SN=class J{constructor($){if(this.uid=i0("batcher"),this.dirty=!0,this.batchIndex=0,this.batches=[],this._elements=[],$={...J.defaultOptions,...$},!$.maxTextures)u0("v8.8.0","maxTextures is a required option for Batcher now, please pass it in the options"),$.maxTextures=AN();let{maxTextures:Q,attributesInitialSize:Z,indicesInitialSize:K}=$;this.attributeBuffer=new IQ(Z*4),this.indexBuffer=new Uint16Array(K),this.maxTextures=Q}begin(){this.elementSize=0,this.elementStart=0,this.indexSize=0,this.attributeSize=0;for(let $=0;$<this.batchIndex;$++)PN(this.batches[$]);this.batchIndex=0,this._batchIndexStart=0,this._batchIndexSize=0,this.dirty=!0}add($){this._elements[this.elementSize++]=$,$._indexStart=this.indexSize,$._attributeStart=this.attributeSize,$._batcher=this,this.indexSize+=$.indexSize,this.attributeSize+=$.attributeSize*this.vertexSize}checkAndUpdateTexture($,Q){let Z=$._batch.textures.ids[Q._source.uid];if(!Z&&Z!==0)return!1;return $._textureId=Z,$.texture=Q,!0}updateElement($){this.dirty=!0;let Q=this.attributeBuffer;if($.packAsQuad)this.packQuadAttributes($,Q.float32View,Q.uint32View,$._attributeStart,$._textureId);else this.packAttributes($,Q.float32View,Q.uint32View,$._attributeStart,$._textureId)}break($){let Q=this._elements;if(!Q[this.elementStart])return;let Z=EN(),K=Z.textures;K.clear();let W=Q[this.elementStart],X=_5(W.blendMode,W.texture._source),H=W.topology;if(this.attributeSize*4>this.attributeBuffer.size)this._resizeAttributeBuffer(this.attributeSize*4);if(this.indexSize>this.indexBuffer.length)this._resizeIndexBuffer(this.indexSize);let q=this.attributeBuffer.float32View,Y=this.attributeBuffer.uint32View,N=this.indexBuffer,U=this._batchIndexSize,V=this._batchIndexStart,z="startBatch",D=[],w=this.maxTextures;for(let F=this.elementStart;F<this.elementSize;++F){let O=Q[F];Q[F]=null;let B=O.texture._source,L=_5(O.blendMode,B),y=X!==L||H!==O.topology;if(B._batchTick===u9&&!y){if(O._textureId=B._textureBindLocation,U+=O.indexSize,O.packAsQuad)this.packQuadAttributes(O,q,Y,O._attributeStart,O._textureId),this.packQuadIndex(N,O._indexStart,O._attributeStart/this.vertexSize);else this.packAttributes(O,q,Y,O._attributeStart,O._textureId),this.packIndex(O,N,O._indexStart,O._attributeStart/this.vertexSize);O._batch=Z,D.push(O);continue}if(B._batchTick=u9,K.count>=w||y)this._finishBatch(Z,V,U-V,K,X,H,$,z,D),z="renderBatch",V=U,X=L,H=O.topology,Z=EN(),K=Z.textures,K.clear(),D=[],++u9;if(O._textureId=B._textureBindLocation=K.count,K.ids[B.uid]=K.count,K.textures[K.count++]=B,O._batch=Z,D.push(O),U+=O.indexSize,O.packAsQuad)this.packQuadAttributes(O,q,Y,O._attributeStart,O._textureId),this.packQuadIndex(N,O._indexStart,O._attributeStart/this.vertexSize);else this.packAttributes(O,q,Y,O._attributeStart,O._textureId),this.packIndex(O,N,O._indexStart,O._attributeStart/this.vertexSize)}if(K.count>0)this._finishBatch(Z,V,U-V,K,X,H,$,z,D),V=U,++u9;this.elementStart=this.elementSize,this._batchIndexStart=V,this._batchIndexSize=U}_finishBatch($,Q,Z,K,W,X,H,q,Y){$.gpuBindGroup=null,$.bindGroup=null,$.action=q,$.batcher=this,$.textures=K,$.blendMode=W,$.topology=X,$.start=Q,$.size=Z,$.elements=Y,++u9,this.batches[this.batchIndex++]=$,H.add($)}finish($){this.break($)}ensureAttributeBuffer($){if($*4<=this.attributeBuffer.size)return;this._resizeAttributeBuffer($*4)}ensureIndexBuffer($){if($<=this.indexBuffer.length)return;this._resizeIndexBuffer($)}_resizeAttributeBuffer($){let Q=Math.max($,this.attributeBuffer.size*2),Z=new IQ(Q);A5(this.attributeBuffer.rawBinaryData,Z.rawBinaryData),this.attributeBuffer=Z}_resizeIndexBuffer($){let Q=this.indexBuffer,Z=Math.max($,Q.length*1.5);Z+=Z%2;let K=Z>65535?new Uint32Array(Z):new Uint16Array(Z);if(K.BYTES_PER_ELEMENT!==Q.BYTES_PER_ELEMENT)for(let W=0;W<Q.length;W++)K[W]=Q[W];else A5(Q.buffer,K.buffer);this.indexBuffer=K}packQuadIndex($,Q,Z){$[Q]=Z+0,$[Q+1]=Z+1,$[Q+2]=Z+2,$[Q+3]=Z+0,$[Q+4]=Z+2,$[Q+5]=Z+3}packIndex($,Q,Z,K){let{indices:W,indexSize:X,indexOffset:H,attributeOffset:q}=$;for(let Y=0;Y<X;Y++)Q[Z++]=K+W[Y+H]-q}destroy($={}){if(this.batches===null)return;for(let Q=0;Q<this.batchIndex;Q++)PN(this.batches[Q]);if(this.batches=null,this.geometry.destroy(!0),this.geometry=null,$.shader)this.shader?.destroy(),this.shader=null;for(let Q=0;Q<this._elements.length;Q++)if(this._elements[Q])this._elements[Q]._batch=null;this._elements=null,this.indexBuffer=null,this.attributeBuffer.destroy(),this.attributeBuffer=null}},TN;var yN=A(()=>{W6();GN();F6();EJ();RN();BN();_N();CN();s9=[];i6.register({clear:()=>{if(s9.length>0){for(let J of s9)if(J)J.destroy()}s9.length=0,MQ=0}});SN.defaultOptions={maxTextures:null,attributesInitialSize:4,indicesInitialSize:6};TN=SN});var P4,j4,P5;var bN=A(()=>{p9();lJ();FQ();P4=new Float32Array(1),j4=new Uint32Array(1);P5=class P5 extends KJ{constructor(){let $=new _6({data:P4,label:"attribute-batch-buffer",usage:I8.VERTEX|I8.COPY_DST,shrinkToFit:!1}),Q=new _6({data:j4,label:"index-batch-buffer",usage:I8.INDEX|I8.COPY_DST,shrinkToFit:!1}),Z=24;super({attributes:{aPosition:{buffer:$,format:"float32x2",stride:24,offset:0},aUV:{buffer:$,format:"float32x2",stride:24,offset:8},aColor:{buffer:$,format:"unorm8x4",stride:24,offset:16},aTextureIdAndRound:{buffer:$,format:"uint16x2",stride:24,offset:20}},indexBuffer:Q})}}});function j5(J,$,Q){if(J)for(let Z in J){let K=Z.toLocaleLowerCase(),W=$[K];if(W){let X=J[Z];if(Z==="header")X=X.replace(/@in\s+[^;]+;\s*/g,"").replace(/@out\s+[^;]+;\s*/g,"");if(Q)W.push(`//----${Q}----//`);W.push(X)}else v0(`${Z} placement hook does not exist in shader`)}}var vN=A(()=>{s8()});function S5(J){let $={};return(J.match(S4)?.map((Z)=>Z.replace(/[{()}]/g,""))??[]).forEach((Z)=>{$[Z]=[]}),$}var S4;var fN=A(()=>{S4=/\{\{(.*?)\}\}/g});function hN(J,$){let Q,Z=/@in\s+([^;]+);/g;while((Q=Z.exec(J))!==null)$.push(Q[1])}function T5(J,$,Q=!1){let Z=[];hN($,Z),J.forEach((H)=>{if(H.header)hN(H.header,Z)});let K=Z;if(Q)K.sort();let W=K.map((H,q)=>`       @location(${q}) ${H},`).join(`
`),X=$.replace(/@in\s+[^;]+;\s*/g,"");return X=X.replace("{{in}}",`
${W}
`),X}var xN=()=>{};function gN(J,$){let Q,Z=/@out\s+([^;]+);/g;while((Q=Z.exec(J))!==null)$.push(Q[1])}function T4(J){let Q=/\b(\w+)\s*:/g.exec(J);return Q?Q[1]:""}function y4(J){let $=/@.*?\s+/g;return J.replace($,"")}function pN(J,$){let Q=[];gN($,Q),J.forEach((q)=>{if(q.header)gN(q.header,Q)});let Z=0,K=Q.sort().map((q)=>{if(q.indexOf("builtin")>-1)return q;return`@location(${Z++}) ${q}`}).join(`,
`),W=Q.sort().map((q)=>`       var ${y4(q)};`).join(`
`),X=`return VSOutput(
            ${Q.sort().map((q)=>` ${T4(q)}`).join(`,
`)});`,H=$.replace(/@out\s+[^;]+;\s*/g,"");return H=H.replace("{{struct}}",`
${K}
`),H=H.replace("{{start}}",`
${W}
`),H=H.replace("{{return}}",`
${X}
`),H}var mN=()=>{};function y5(J,$){let Q=J;for(let Z in $){let K=$[Z];if(K.join(`
`).length)Q=Q.replace(`{{${Z}}}`,`//-----${Z} START-----//
${K.join(`
`)}
//----${Z} FINISH----//`);else Q=Q.replace(`{{${Z}}}`,"")}return Q}var dN=()=>{};function lN({template:J,bits:$}){let Q=uN(J,$);if(b7[Q])return b7[Q];let{vertex:Z,fragment:K}=v4(J,$);return b7[Q]=sN(Z,K,$),b7[Q]}function cN({template:J,bits:$}){let Q=uN(J,$);if(b7[Q])return b7[Q];return b7[Q]=sN(J.vertex,J.fragment,$),b7[Q]}function v4(J,$){let Q=$.map((X)=>X.vertex).filter((X)=>!!X),Z=$.map((X)=>X.fragment).filter((X)=>!!X),K=T5(Q,J.vertex,!0);K=pN(Q,K);let W=T5(Z,J.fragment,!0);return{vertex:K,fragment:W}}function uN(J,$){return $.map((Q)=>{if(!b5.has(Q))b5.set(Q,b4++);return b5.get(Q)}).sort((Q,Z)=>Q-Z).join("-")+J.vertex+J.fragment}function sN(J,$,Q){let Z=S5(J),K=S5($);return Q.forEach((W)=>{j5(W.vertex,Z,W.name),j5(W.fragment,K,W.name)}),{vertex:y5(J,Z),fragment:y5($,K)}}var b7,b5,b4=0;var nN=A(()=>{vN();fN();xN();mN();dN();b7=Object.create(null),b5=new Map});var iN=`
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
`,oN=`
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
`,aN=`
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
`,rN=`

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
`;var tN=()=>{};var eN,JU;var $U=A(()=>{eN={name:"global-uniforms-bit",vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}},JU={name:"global-uniforms-bit",vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}}});function QU({bits:J,name:$}){let Q=lN({template:{fragment:oN,vertex:iN},bits:[eN,...J]});return B6.from({name:$,vertex:{source:Q.vertex,entryPoint:"main"},fragment:{source:Q.fragment,entryPoint:"main"}})}function sJ({bits:J,name:$}){return new L6({name:$,...cN({template:{vertex:aN,fragment:rN},bits:[JU,...J]})})}var GQ=A(()=>{QJ();pJ();nN();tN();$U()});var ZU,RQ;var v5=A(()=>{ZU={name:"color-bit",vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},RQ={name:"color-bit",vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}}});function f4(J){let $=[];if(J===1)$.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;"),$.push("@group(1) @binding(1) var textureSampler1: sampler;");else{let Q=0;for(let Z=0;Z<J;Z++)$.push(`@group(1) @binding(${Q++}) var textureSource${Z+1}: texture_2d<f32>;`),$.push(`@group(1) @binding(${Q++}) var textureSampler${Z+1}: sampler;`)}return $.join(`
`)}function h4(J){let $=[];if(J===1)$.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");else{$.push("switch vTextureId {");for(let Q=0;Q<J;Q++){if(Q===J-1)$.push("  default:{");else $.push(`  case ${Q}:{`);$.push(`      outColor = textureSampleGrad(textureSource${Q+1}, textureSampler${Q+1}, vUV, uvDx, uvDy);`),$.push("      break;}")}$.push("}")}return $.join(`
`)}function KU(J){if(!f5[J])f5[J]={name:"texture-batch-bit",vertex:{header:`
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

                ${f4(J)}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${h4(J)}
            `}};return f5[J]}function x4(J){let $=[];for(let Q=0;Q<J;Q++){if(Q>0)$.push("else");if(Q<J-1)$.push(`if(vTextureId < ${Q}.5)`);$.push("{"),$.push(`	outColor = texture(uTextures[${Q}], vUV);`),$.push("}")}return $.join(`
`)}function LQ(J){if(!h5[J])h5[J]={name:"texture-batch-bit",vertex:{header:`
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

                ${x4(J)}
            `}};return h5[J]}var f5,h5;var x5=A(()=>{f5={};h5={}});var WU,nJ;var BQ=A(()=>{WU={name:"round-pixels-bit",vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},nJ={name:"round-pixels-bit",vertex:{header:`
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}}});function AQ(J){let $=XU[J];if($)return $;let Q=new Int32Array(J);for(let Z=0;Z<J;Z++)Q[Z]=Z;return $=XU[J]=new o8({uTextures:{value:Q,type:"i32",size:J}},{isStatic:!0}),$}var XU;var g5=A(()=>{N7();XU={}});var _Q;var HU=A(()=>{GQ();v5();x5();BQ();g5();mJ();_Q=class _Q extends A6{constructor(J){let $=sJ({name:"batch",bits:[RQ,LQ(J),nJ]}),Q=QU({name:"batch",bits:[ZU,KU(J),WU]});super({glProgram:$,gpuProgram:Q,resources:{batchSamplers:AQ(J)}});this.maxTextures=J}}});var n9=null,qU,p5;var YU=A(()=>{k0();yN();bN();HU();qU=class J extends TN{constructor($){super($);this.geometry=new P5,this.name=J.extension.name,this.vertexSize=6,n9??(n9=new _Q($.maxTextures)),this.shader=n9}packAttributes($,Q,Z,K,W){let X=W<<16|$.roundPixels&65535,H=$.transform,q=H.a,Y=H.b,N=H.c,U=H.d,V=H.tx,z=H.ty,{positions:D,uvs:w}=$,F=$.color,O=$.attributeOffset,R=O+$.attributeSize;for(let B=O;B<R;B++){let L=B*2,y=D[L],_=D[L+1];Q[K++]=q*y+N*_+V,Q[K++]=U*_+Y*y+z,Q[K++]=w[L],Q[K++]=w[L+1],Z[K++]=F,Z[K++]=X}}packQuadAttributes($,Q,Z,K,W){let{texture:X,transform:H}=$,q=H.a,Y=H.b,N=H.c,U=H.d,V=H.tx,z=H.ty,D=$.bounds,w=D.maxX,F=D.minX,O=D.maxY,R=D.minY,B=X.uvs,L=$.color,y=W<<16|$.roundPixels&65535;Q[K+0]=q*F+N*R+V,Q[K+1]=U*R+Y*F+z,Q[K+2]=B.x0,Q[K+3]=B.y0,Z[K+4]=L,Z[K+5]=y,Q[K+6]=q*w+N*R+V,Q[K+7]=U*R+Y*w+z,Q[K+8]=B.x1,Q[K+9]=B.y1,Z[K+10]=L,Z[K+11]=y,Q[K+12]=q*w+N*O+V,Q[K+13]=U*O+Y*w+z,Q[K+14]=B.x2,Q[K+15]=B.y2,Z[K+16]=L,Z[K+17]=y,Q[K+18]=q*F+N*O+V,Q[K+19]=U*O+Y*F+z,Q[K+20]=B.x3,Q[K+21]=B.y3,Z[K+22]=L,Z[K+23]=y}_updateMaxTextures($){if(this.shader.maxTextures===$)return;n9=new _Q($),this.shader=n9}destroy(){this.shader=null,super.destroy()}};qU.extension={type:[b.Batcher],name:"default"};p5=qU});class WJ{constructor(J){this.items=Object.create(null);let{renderer:$,type:Q,onUnload:Z,priority:K,name:W}=J;this._renderer=$,$.gc.addResourceHash(this,"items",Q,K??0),this._onUnload=Z,this.name=W}add(J){if(this.items[J.uid])return!1;return this.items[J.uid]=J,J.once("unload",this.remove,this),J._gcLastUsed=this._renderer.gc.now,!0}remove(J,...$){if(!this.items[J.uid])return;let Q=J._gpuData[this._renderer.uid];if(!Q)return;this._onUnload?.(J,...$),Q.destroy(),J._gpuData[this._renderer.uid]=null,this.items[J.uid]=null}removeAll(...J){Object.values(this.items).forEach(($)=>$&&this.remove($,...J))}destroy(...J){this.removeAll(...J),this.items=Object.create(null),this._renderer=null,this._onUnload=null}}var CQ=()=>{};var NU=`in vec2 vMaskCoord;
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
`;var UU=()=>{};var VU=`in vec2 aPosition;

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
`;var OU=()=>{};var m5=`struct GlobalFilterUniforms {
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
`;var FU=()=>{};var d5;var zU=A(()=>{E8();QJ();pJ();N7();xK();D5();UU();OU();FU();d5=class d5 extends OQ{constructor(J){let{sprite:$,...Q}=J,Z=new P9($.texture),K=new o8({uFilterMatrix:{value:new B0,type:"mat3x3<f32>"},uMaskClamp:{value:Z.uClampFrame,type:"vec4<f32>"},uAlpha:{value:1,type:"f32"},uInverse:{value:J.inverse?1:0,type:"f32"}}),W=B6.from({vertex:{source:m5,entryPoint:"mainVertex"},fragment:{source:m5,entryPoint:"mainFragment"}}),X=L6.from({vertex:VU,fragment:NU,name:"mask-filter"});super({...Q,gpuProgram:W,glProgram:X,clipToViewport:!1,resources:{filterUniforms:K,uMaskTexture:$.texture.source}});this.sprite=$,this._textureMatrix=Z}set inverse(J){this.resources.filterUniforms.uniforms.uInverse=J?1:0}get inverse(){return this.resources.filterUniforms.uniforms.uInverse===1}apply(J,$,Q,Z){this._textureMatrix.texture=this.sprite.texture,J.calculateSpriteMatrix(this.resources.filterUniforms.uniforms.uFilterMatrix,this.sprite).prepend(this._textureMatrix.mapCoord),this.resources.uMaskTexture=this.sprite.texture.source,J.applyFilter(this,$,Q,Z)}}});function DU(J,$,Q){let Z=(J>>24&255)/255;$[Q++]=(J&255)/255*Z,$[Q++]=(J>>8&255)/255*Z,$[Q++]=(J>>16&255)/255*Z,$[Q++]=Z}var kU=()=>{};var l5,AS,EQ;var c5=A(()=>{l5={name:"local-uniform-bit",vertex:{header:`

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
        `}},AS={...l5,vertex:{...l5.vertex,header:l5.vertex.header.replace("group(1)","group(2)")}},EQ={name:"local-uniform-bit",vertex:{header:`

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
        `}}});class i9{constructor(){this.batcherName="default",this.topology="triangle-list",this.attributeSize=4,this.indexSize=6,this.packAsQuad=!0,this.roundPixels=0,this._attributeStart=0,this._batcher=null,this._batch=null}get blendMode(){return this.renderable.groupBlendMode}get color(){return this.renderable.groupColorAlpha}reset(){this.renderable=null,this.texture=null,this._batcher=null,this._batch=null,this.bounds=null}destroy(){this.reset()}}var u5=()=>{};function IU(){let{userAgent:J}=F8.get().getNavigator();return/^((?!chrome|android).)*safari/i.test(J)}var wU=A(()=>{D6()});class PQ{constructor(){this._tempState=a6.for2d(),this._didUploadHash={}}init(J){J.renderer.runners.contextChange.add(this)}contextChange(){this._didUploadHash={}}start(J,$,Q){let Z=J.renderer,K=this._didUploadHash[Q.uid];if(Z.shader.bind(Q,K),!K)this._didUploadHash[Q.uid]=!0;Z.shader.updateUniformGroup(Z.globalUniforms.uniformGroup),Z.geometry.bind($,Q.glProgram)}execute(J,$){let Q=J.renderer;this._tempState.blendMode=$.blendMode,Q.state.set(this._tempState);let Z=$.textures.textures;for(let K=0;K<$.textures.count;K++)Q.texture.bind(Z[K],K);Q.geometry.draw($.topology,$.size,$.start)}}var MU=A(()=>{k0();dJ();PQ.extension={type:[b.WebGLPipesAdaptor],name:"batch"}});var s5=class J{constructor($,Q){this.state=a6.for2d(),this._batchersByInstructionSet=Object.create(null),this._activeBatches=Object.create(null),this.renderer=$,this._adaptor=Q,this._adaptor.init?.(this)}static getBatcher($){return new this._availableBatchers[$]}buildStart($){let Q=this._batchersByInstructionSet[$.uid];if(!Q)Q=this._batchersByInstructionSet[$.uid]=Object.create(null),Q.default||(Q.default=new p5({maxTextures:this.renderer.limits.maxBatchableTextures}));this._activeBatches=Q,this._activeBatch=this._activeBatches.default;for(let Z in this._activeBatches)this._activeBatches[Z].begin()}addToBatch($,Q){if(this._activeBatch.name!==$.batcherName){this._activeBatch.break(Q);let Z=this._activeBatches[$.batcherName];if(!Z)Z=this._activeBatches[$.batcherName]=J.getBatcher($.batcherName),Z.begin();this._activeBatch=Z}this._activeBatch.add($)}break($){this._activeBatch.break($)}buildEnd($){this._activeBatch.break($);let Q=this._activeBatches;for(let Z in Q){let K=Q[Z],W=K.geometry;W.indexBuffer.setDataWithSize(K.indexBuffer,K.indexSize,!0),W.buffers[0].setDataWithSize(K.attributeBuffer.float32View,K.attributeSize,!1)}}upload($){let Q=this._batchersByInstructionSet[$.uid];for(let Z in Q){let K=Q[Z],W=K.geometry;if(K.dirty)K.dirty=!1,W.buffers[0].update(K.attributeSize*4)}}execute($){if($.action==="startBatch"){let Q=$.batcher,Z=Q.geometry,K=Q.shader;this._adaptor.start(this,Z,K)}this._adaptor.execute(this,$)}destroy(){this.state=null,this.renderer=null,this._adaptor=null;for(let $ in this._activeBatches)this._activeBatches[$].destroy();this._activeBatches=null}},n5;var GU=A(()=>{k0();dJ();YU();s5.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"batch"};s5._availableBatchers=Object.create(null);n5=s5;n0.handleByMap(b.Batcher,n5._availableBatchers);n0.add(p5)});var RU;var LU=A(()=>{RU={name:"texture-bit",vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;


        `,main:`
            outColor = texture(uTexture, vUV);
        `}}});class jQ{constructor(J){this._activeMaskStage=[],this._renderer=J}push(J,$,Q){let Z=this._renderer;if(Z.renderPipes.batch.break(Q),Q.add({renderPipeId:"alphaMask",action:"pushMaskBegin",mask:J,inverse:$._maskOptions.inverse,canBundle:!1,maskedContainer:$}),J.inverse=$._maskOptions.inverse,J.renderMaskToTexture){let K=J.mask;K.includeInBuild=!0,K.collectRenderables(Q,Z,null),K.includeInBuild=!1}Z.renderPipes.batch.break(Q),Q.add({renderPipeId:"alphaMask",action:"pushMaskEnd",mask:J,maskedContainer:$,inverse:$._maskOptions.inverse,canBundle:!1})}pop(J,$,Q){this._renderer.renderPipes.batch.break(Q),Q.add({renderPipeId:"alphaMask",action:"popMaskEnd",mask:J,inverse:$._maskOptions.inverse,canBundle:!1})}execute(J){let $=this._renderer,Q=J.mask.renderMaskToTexture;if(J.action==="pushMaskBegin"){let Z=n8.get(BU);if(Z.inverse=J.inverse,Q){J.mask.mask.measurable=!0;let K=jJ(J.mask.mask,!0,g4);J.mask.mask.measurable=!1,K.ceil();let W=$.renderTarget.renderTarget.colorTexture.source,X=g8.getOptimalTexture(K.width,K.height,W._resolution,W.antialias);$.renderTarget.push(X,!0),$.globalUniforms.push({offset:K,worldColor:4294967295});let H=Z.sprite;H.texture=X,H.worldTransform.tx=K.minX,H.worldTransform.ty=K.minY,this._activeMaskStage.push({filterEffect:Z,maskedContainer:J.maskedContainer,filterTexture:X})}else Z.sprite=J.mask.mask,this._activeMaskStage.push({filterEffect:Z,maskedContainer:J.maskedContainer})}else if(J.action==="pushMaskEnd"){let Z=this._activeMaskStage[this._activeMaskStage.length-1];if(Q){if($.type===q6.WEBGL)$.renderTarget.finishRenderPass();$.renderTarget.pop(),$.globalUniforms.pop()}$.filter.push({renderPipeId:"filter",action:"pushFilter",container:Z.maskedContainer,filterEffect:Z.filterEffect,canBundle:!1})}else if(J.action==="popMaskEnd"){$.filter.pop();let Z=this._activeMaskStage.pop();if(Q)g8.returnTexture(Z.filterTexture);n8.return(Z.filterEffect)}}destroy(){this._renderer=null,this._activeMaskStage=null}}var g4,BU;var AU=A(()=>{k0();v$();zU();v6();C9();r$();PJ();i8();j9();ZJ();g4=new L8;BU=class BU extends C7{constructor(){super();this.filters=[new d5({sprite:new x6(P0.EMPTY),inverse:!1,resolution:"inherit",antialias:"inherit"})]}get sprite(){return this.filters[0].sprite}set sprite(J){this.filters[0].sprite=J}get inverse(){return this.filters[0].inverse}set inverse(J){this.filters[0].inverse=J}};jQ.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"alphaMask"}});class SQ{constructor(J){this._colorStack=[],this._colorStackIndex=0,this._currentColor=0,this._renderer=J}buildStart(){this._colorStack[0]=15,this._colorStackIndex=1,this._currentColor=15}push(J,$,Q){this._renderer.renderPipes.batch.break(Q);let K=this._colorStack;K[this._colorStackIndex]=K[this._colorStackIndex-1]&J.mask;let W=this._colorStack[this._colorStackIndex];if(W!==this._currentColor)this._currentColor=W,Q.add({renderPipeId:"colorMask",colorMask:W,canBundle:!1});this._colorStackIndex++}pop(J,$,Q){this._renderer.renderPipes.batch.break(Q);let K=this._colorStack;this._colorStackIndex--;let W=K[this._colorStackIndex-1];if(W!==this._currentColor)this._currentColor=W,Q.add({renderPipeId:"colorMask",colorMask:W,canBundle:!1})}execute(J){this._renderer.colorMask.setMask(J.colorMask)}destroy(){this._renderer=null,this._colorStack=null}}var _U=A(()=>{k0();SQ.extension={type:[b.WebGLPipes,b.WebGPUPipes],name:"colorMask"}});class TQ{constructor(J){this._maskStackHash={},this._maskHash=new WeakMap,this._renderer=J}push(J,$,Q){var Z;let K=J,W=this._renderer;W.renderPipes.batch.break(Q),W.renderPipes.blendMode.setBlendMode(K.mask,"none",Q),Q.add({renderPipeId:"stencilMask",action:"pushMaskBegin",mask:J,inverse:$._maskOptions.inverse,canBundle:!1});let X=K.mask;if(X.includeInBuild=!0,!this._maskHash.has(K))this._maskHash.set(K,{instructionsStart:0,instructionsLength:0});let H=this._maskHash.get(K);H.instructionsStart=Q.instructionSize,X.collectRenderables(Q,W,null),X.includeInBuild=!1,W.renderPipes.batch.break(Q),Q.add({renderPipeId:"stencilMask",action:"pushMaskEnd",mask:J,inverse:$._maskOptions.inverse,canBundle:!1});let q=Q.instructionSize-H.instructionsStart-1;H.instructionsLength=q;let Y=W.renderTarget.renderTarget.uid;(Z=this._maskStackHash)[Y]??(Z[Y]=0)}pop(J,$,Q){let Z=J,K=this._renderer;K.renderPipes.batch.break(Q),K.renderPipes.blendMode.setBlendMode(Z.mask,"none",Q),Q.add({renderPipeId:"stencilMask",action:"popMaskBegin",inverse:$._maskOptions.inverse,canBundle:!1});let W=this._maskHash.get(J);for(let X=0;X<W.instructionsLength;X++)Q.instructions[Q.instructionSize++]=Q.instructions[W.instructionsStart++];Q.add({renderPipeId:"stencilMask",action:"popMaskEnd",canBundle:!1})}execute(J){var $;let Q=this._renderer,Z=Q,K=Q.renderTarget.renderTarget.uid,W=($=this._maskStackHash)[K]??($[K]=0);if(J.action==="pushMaskBegin")Z.renderTarget.ensureDepthStencil(),Z.stencil.setStencilMode(j8.RENDERING_MASK_ADD,W),W++,Z.colorMask.setMask(0);else if(J.action==="pushMaskEnd"){if(J.inverse)Z.stencil.setStencilMode(j8.INVERSE_MASK_ACTIVE,W);else Z.stencil.setStencilMode(j8.MASK_ACTIVE,W);Z.colorMask.setMask(15)}else if(J.action==="popMaskBegin"){if(Z.colorMask.setMask(0),W!==0)Z.stencil.setStencilMode(j8.RENDERING_MASK_REMOVE,W);else Z.renderTarget.clear(null,C6.STENCIL),Z.stencil.setStencilMode(j8.DISABLED,W);W--}else if(J.action==="popMaskEnd"){if(J.inverse)Z.stencil.setStencilMode(j8.INVERSE_MASK_ACTIVE,W);else Z.stencil.setStencilMode(j8.MASK_ACTIVE,W);Z.colorMask.setMask(15)}this._maskStackHash[K]=W}destroy(){this._renderer=null,this._maskStackHash=null,this._maskHash=null}}var CU=A(()=>{k0();d9();c9();TQ.extension={type:[b.WebGLPipes,b.WebGPUPipes],name:"stencilMask"}});class yQ{constructor(J){this._renderer=J}updateRenderable(){}destroyRenderable(){}validateRenderable(){return!1}addRenderable(J,$){this._renderer.renderPipes.batch.break($),$.add(J)}execute(J){if(!J.isRenderable)return;J.render(this._renderer)}destroy(){this._renderer=null}}var EU=A(()=>{k0();yQ.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"customRender"}});function o9(J,$){let Q=J.instructionSet,Z=Q.instructions;for(let K=0;K<Q.instructionSize;K++){let W=Z[K];$[W.renderPipeId].execute(W)}}var i5=()=>{};class bQ{constructor(J){this._renderer=J}addRenderGroup(J,$){if(J.isCachedAsTexture)this._addRenderableCacheAsTexture(J,$);else this._addRenderableDirect(J,$)}execute(J){if(!J.isRenderable)return;if(J.isCachedAsTexture)this._executeCacheAsTexture(J);else this._executeDirect(J)}destroy(){this._renderer=null}_addRenderableDirect(J,$){if(this._renderer.renderPipes.batch.break($),J._batchableRenderGroup)n8.return(J._batchableRenderGroup),J._batchableRenderGroup=null;$.add(J)}_addRenderableCacheAsTexture(J,$){let Q=J._batchableRenderGroup??(J._batchableRenderGroup=n8.get(i9));Q.renderable=J.root,Q.transform=J.root.relativeGroupTransform,Q.texture=J.texture,Q.bounds=J._textureBounds,$.add(J),this._renderer.renderPipes.blendMode.pushBlendMode(J,J.root.groupBlendMode,$),this._renderer.renderPipes.batch.addToBatch(Q,$),this._renderer.renderPipes.blendMode.popBlendMode($)}_executeCacheAsTexture(J){if(J.textureNeedsUpdate){J.textureNeedsUpdate=!1;let $=new B0().translate(-J._textureBounds.x,-J._textureBounds.y);this._renderer.renderTarget.push(J.texture,!0,null,J.texture.frame),this._renderer.globalUniforms.push({worldTransformMatrix:$,worldColor:4294967295,offset:{x:0,y:0}}),o9(J,this._renderer.renderPipes),this._renderer.renderTarget.finishRenderPass(),this._renderer.renderTarget.pop(),this._renderer.globalUniforms.pop()}J._batchableRenderGroup._batcher.updateElement(J._batchableRenderGroup),J._batchableRenderGroup._batcher.geometry.buffers[0].update()}_executeDirect(J){this._renderer.globalUniforms.push({worldTransformMatrix:J.inverseParentTextureTransform,worldColor:J.worldColorAlpha}),o9(J,this._renderer.renderPipes),this._renderer.globalUniforms.pop()}}var PU=A(()=>{k0();E8();PJ();u5();i5();bQ.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"renderGroup"}});class vQ{constructor(J){this._renderer=J}addRenderable(J,$){let Q=this._getGpuSprite(J);if(J.didViewUpdate)this._updateBatchableSprite(J,Q);this._renderer.renderPipes.batch.addToBatch(Q,$)}updateRenderable(J){let $=this._getGpuSprite(J);if(J.didViewUpdate)this._updateBatchableSprite(J,$);$._batcher.updateElement($)}validateRenderable(J){let $=this._getGpuSprite(J);return!$._batcher.checkAndUpdateTexture($,J._texture)}_updateBatchableSprite(J,$){$.bounds=J.visualBounds,$.texture=J._texture}_getGpuSprite(J){return J._gpuData[this._renderer.uid]||this._initGPUSprite(J)}_initGPUSprite(J){let $=new i9;return $.renderable=J,$.transform=J.groupTransform,$.texture=J._texture,$.bounds=J.visualBounds,$.roundPixels=this._renderer._roundPixels|J._roundPixels,J._gpuData[this._renderer.uid]=$,$}destroy(){this._renderer=null}}var jU=A(()=>{k0();u5();vQ.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"sprite"}});class fQ{constructor(J){this._blendModeStack=[],this._isAdvanced=!1,this._filterHash=Object.create(null),this._renderer=J,this._renderer.runners.prerender.add(this)}prerender(){this._activeBlendMode="normal",this._isAdvanced=!1}pushBlendMode(J,$,Q){this._blendModeStack.push($),this.setBlendMode(J,$,Q)}popBlendMode(J){this._blendModeStack.pop();let $=this._blendModeStack[this._activeBlendMode.length-1]??"normal";this.setBlendMode(null,$,J)}setBlendMode(J,$,Q){let Z=J instanceof vJ;if(this._activeBlendMode===$){if(this._isAdvanced&&J&&!Z)this._renderableList?.push(J);return}if(this._isAdvanced)this._endAdvancedBlendMode(Q);if(this._activeBlendMode=$,!J)return;if(this._isAdvanced=!!a9[$],this._isAdvanced)this._beginAdvancedBlendMode(J,Q)}_beginAdvancedBlendMode(J,$){this._renderer.renderPipes.batch.break($);let Q=this._activeBlendMode;if(!a9[Q]){v0(`Unable to assign BlendMode: '${Q}'. You may want to include: import 'pixi.js/advanced-blend-modes'`);return}let Z=this._ensureFilterEffect(Q),K=J instanceof vJ,W={renderPipeId:"filter",action:"pushFilter",filterEffect:Z,renderables:K?null:[J],container:K?J.root:null,canBundle:!1};this._renderableList=W.renderables,$.add(W)}_ensureFilterEffect(J){let $=this._filterHash[J];if(!$)$=this._filterHash[J]=new C7,$.filters=[new a9[J]];return $}_endAdvancedBlendMode(J){this._isAdvanced=!1,this._renderableList=null,this._renderer.renderPipes.batch.break(J),J.add({renderPipeId:"filter",action:"popFilter",canBundle:!1})}buildStart(){this._isAdvanced=!1}buildEnd(J){if(!this._isAdvanced)return;this._endAdvancedBlendMode(J)}destroy(){this._renderer=null,this._renderableList=null;for(let J in this._filterHash)this._filterHash[J].destroy();this._filterHash=null}}var a9;var SU=A(()=>{k0();v$();gK();s8();a9={};n0.handle(b.BlendMode,(J)=>{if(!J.name)throw Error("BlendMode extension must have a name property");a9[J.name]=J.ref},(J)=>{delete a9[J.name]});fQ.extension={type:[b.WebGLPipes,b.WebGPUPipes,b.CanvasPipes],name:"blendMode"}});function r9(J,$){$||($=0);for(let Q=$;Q<J.length;Q++)if(J[Q])J[Q]=null;else break}var o5=()=>{};function a5(J,$=!1){m4(J);let Q=J.childrenToUpdate,Z=J.updateTick++;for(let K in Q){let W=Number(K),X=Q[K],H=X.list,q=X.index;for(let Y=0;Y<q;Y++){let N=H[Y];if(N.parentRenderGroup===J&&N.relativeRenderGroupDepth===W)bU(N,Z,0)}r9(H,q),X.index=0}if($)for(let K=0;K<J.renderGroupChildren.length;K++)a5(J.renderGroupChildren[K],$)}function m4(J){let $=J.root,Q;if(J.renderGroupParent){let Z=J.renderGroupParent;J.worldTransform.appendFrom($.relativeGroupTransform,Z.worldTransform),J.worldColor=SJ($.groupColor,Z.worldColor),Q=$.groupAlpha*Z.worldAlpha}else J.worldTransform.copyFrom($.localTransform),J.worldColor=$.localColor,Q=$.localAlpha;Q=Q<0?0:Q>1?1:Q,J.worldAlpha=Q,J.worldColorAlpha=J.worldColor+((Q*255|0)<<24)}function bU(J,$,Q){if($===J.updateTick)return;J.updateTick=$,J.didChange=!1;let Z=J.localTransform;J.updateLocalTransform();let K=J.parent;if(K&&!K.renderGroup){if(Q|=J._updateFlags,J.relativeGroupTransform.appendFrom(Z,K.relativeGroupTransform),Q&TU)yU(J,K,Q)}else if(Q=J._updateFlags,J.relativeGroupTransform.copyFrom(Z),Q&TU)yU(J,p4,Q);if(!J.renderGroup){let W=J.children,X=W.length;for(let Y=0;Y<X;Y++)bU(W[Y],$,Q);let H=J.parentRenderGroup,q=J;if(q.renderPipeId&&!H.structureDidChange)H.updateRenderable(q)}}function yU(J,$,Q){if(Q&fJ){J.groupColor=SJ(J.localColor,$.groupColor);let Z=J.localAlpha*$.groupAlpha;Z=Z<0?0:Z>1?1:Z,J.groupAlpha=Z,J.groupColorAlpha=J.groupColor+((Z*255|0)<<24)}if(Q&S9)J.groupBlendMode=J.localBlendMode==="inherit"?$.groupBlendMode:J.localBlendMode;if(Q&e7)J.globalDisplayStatus=J.localDisplayStatus&$.globalDisplayStatus;J._updateFlags=0}var p4,TU;var vU=A(()=>{o6();o5();PK();p4=new B8,TU=e7|fJ|S9});function fU(J,$){let{list:Q}=J.childrenRenderablesToUpdate,Z=!1;for(let K=0;K<J.childrenRenderablesToUpdate.index;K++){let W=Q[K];if(Z=$[W.renderPipeId].validateRenderable(W),Z)break}return J.structureDidChange=Z,Z}var hU=()=>{};class hQ{constructor(J){this._renderer=J}render({container:J,transform:$}){let Q=J.parent,Z=J.renderGroup.renderGroupParent;J.parent=null,J.renderGroup.renderGroupParent=null;let K=this._renderer,W=d4;if($)W.copyFrom(J.renderGroup.localTransform),J.renderGroup.localTransform.copyFrom($);let X=K.renderPipes;if(this._updateCachedRenderGroups(J.renderGroup,null),this._updateRenderGroups(J.renderGroup),K.globalUniforms.start({worldTransformMatrix:$?J.renderGroup.localTransform:J.renderGroup.worldTransform,worldColor:J.renderGroup.worldColorAlpha}),o9(J.renderGroup,X),X.uniformBatch)X.uniformBatch.renderEnd();if($)J.renderGroup.localTransform.copyFrom(W);J.parent=Q,J.renderGroup.renderGroupParent=Z}destroy(){this._renderer=null}_updateCachedRenderGroups(J,$){if(J._parentCacheAsTextureRenderGroup=$,J.isCachedAsTexture){if(!J.textureNeedsUpdate)return;$=J}for(let Q=J.renderGroupChildren.length-1;Q>=0;Q--)this._updateCachedRenderGroups(J.renderGroupChildren[Q],$);if(J.invalidateMatrices(),J.isCachedAsTexture){if(J.textureNeedsUpdate){let Q=J.root.getLocalBounds(),Z=this._renderer,K=J.textureOptions.resolution||Z.view.resolution,W=J.textureOptions.antialias??Z.view.antialias,X=J.textureOptions.scaleMode??"linear",H=J.texture;if(Q.ceil(),J.texture)g8.returnTexture(J.texture,!0);let q=g8.getOptimalTexture(Q.width,Q.height,K,W);if(q._source.style=new yJ({scaleMode:X}),J.texture=q,J._textureBounds||(J._textureBounds=new L8),J._textureBounds.copyFrom(Q),H!==J.texture){if(J.renderGroupParent)J.renderGroupParent.structureDidChange=!0}}}else if(J.texture)g8.returnTexture(J.texture,!0),J.texture=null}_updateRenderGroups(J){let $=this._renderer,Q=$.renderPipes;if(J.runOnRender($),J.instructionSet.renderPipes=Q,!J.structureDidChange)fU(J,Q);else r9(J.childrenRenderablesToUpdate.list,0);if(a5(J),J.structureDidChange)J.structureDidChange=!1,this._buildInstructions(J,$);else this._updateRenderables(J);if(J.childrenRenderablesToUpdate.index=0,$.renderPipes.batch.upload(J.instructionSet),J.isCachedAsTexture&&!J.textureNeedsUpdate)return;for(let Z=0;Z<J.renderGroupChildren.length;Z++)this._updateRenderGroups(J.renderGroupChildren[Z])}_updateRenderables(J){let{list:$,index:Q}=J.childrenRenderablesToUpdate;for(let Z=0;Z<Q;Z++){let K=$[Z];if(K.didViewUpdate)J.updateRenderable(K)}r9($,Q)}_buildInstructions(J,$){let{root:Q,instructionSet:Z}=J;Z.reset();let K=$.renderPipes?$:$.batch.renderer,W=K.renderPipes;if(W.batch.buildStart(Z),W.blendMode.buildStart(),W.colorMask.buildStart(),Q.sortableChildren)Q.sortChildren();Q.collectRenderablesWithEffects(Z,K,null),W.batch.buildEnd(Z),W.blendMode.buildEnd(Z)}}var d4;var xU=A(()=>{k0();E8();j9();p$();v6();o5();i5();vU();hU();d4=new B0;hQ.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"renderGroup"}});var r5=class J{constructor(){this.clearBeforeRender=!0,this._backgroundColor=new R6(0),this.color=this._backgroundColor,this.alpha=1}init($){$={...J.defaultOptions,...$},this.clearBeforeRender=$.clearBeforeRender,this.color=$.background||$.backgroundColor||this._backgroundColor,this.alpha=$.backgroundAlpha,this._backgroundColor.setAlpha($.backgroundAlpha)}get color(){return this._backgroundColor}set color($){if(R6.shared.setValue($).alpha<1&&this._backgroundColor.alpha===1)v0("Cannot set a transparent background on an opaque canvas. To enable transparency, set backgroundAlpha < 1 when initializing your Application.");this._backgroundColor.setValue($)}get alpha(){return this._backgroundColor.alpha}set alpha($){this._backgroundColor.setAlpha($)}get colorRgba(){return this._backgroundColor.toArray()}destroy(){}},gU;var pU=A(()=>{_9();k0();s8();r5.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"background",priority:0};r5.defaultOptions={backgroundAlpha:1,backgroundColor:0,clearBeforeRender:!0};gU=r5});var t5,e5=class J{constructor($){this._renderer=$}_normalizeOptions($,Q={}){if($ instanceof B8||$ instanceof P0)return{target:$,...Q};return{...Q,...$}}async image($){let Q=F8.get().createImage();return Q.src=await this.base64($),Q}async base64($){$=this._normalizeOptions($,J.defaultImageOptions);let{format:Q,quality:Z}=$,K=this.canvas($);if(K.toBlob!==void 0)return new Promise((W,X)=>{K.toBlob((H)=>{if(!H){X(Error("ICanvas.toBlob failed!"));return}let q=new FileReader;q.onload=()=>W(q.result),q.onerror=X,q.readAsDataURL(H)},t5[Q],Z)});if(K.toDataURL!==void 0)return K.toDataURL(t5[Q],Z);if(K.convertToBlob!==void 0){let W=await K.convertToBlob({type:t5[Q],quality:Z});return new Promise((X,H)=>{let q=new FileReader;q.onload=()=>X(q.result),q.onerror=H,q.readAsDataURL(W)})}throw Error("Extract.base64() requires ICanvas.toDataURL, ICanvas.toBlob, or ICanvas.convertToBlob to be implemented")}canvas($){$=this._normalizeOptions($);let Q=$.target,Z=this._renderer;if(Q instanceof P0)return Z.texture.generateCanvas(Q);let K=Z.textureGenerator.generateTexture($),W=Z.texture.generateCanvas(K);return K.destroy(!0),W}pixels($){$=this._normalizeOptions($);let Q=$.target,Z=this._renderer,K=Q instanceof P0?Q:Z.textureGenerator.generateTexture($),W=Z.texture.getPixels(K);if(Q instanceof B8)K.destroy(!0);return W}texture($){if($=this._normalizeOptions($),$.target instanceof P0)return $.target;return this._renderer.textureGenerator.generateTexture($)}download($){$=this._normalizeOptions($);let Q=this.canvas($),Z=document.createElement("a");Z.download=$.filename??"image.png",Z.href=Q.toDataURL("image/png"),document.body.appendChild(Z),Z.click(),document.body.removeChild(Z)}log($){let Q=$.width??200;$=this._normalizeOptions($);let Z=this.canvas($),K=Z.toDataURL();console.log(`[Pixi Texture] ${Z.width}px ${Z.height}px`);let W=["font-size: 1px;",`padding: ${Q}px 300px;`,`background: url(${K}) no-repeat;`,"background-size: contain;"].join(" ");console.log("%c ",W)}destroy(){this._renderer=null}},mU;var dU=A(()=>{D6();k0();o6();i8();t5={png:"image/png",jpg:"image/jpeg",webp:"image/webp"};e5.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"extract"};e5.defaultImageOptions={format:"png",quality:1};mU=e5});var xQ;var lU=A(()=>{X6();i8();xQ=class xQ extends P0{static create(J){let{dynamic:$,...Q}=J;return new xQ({source:new $8(Q),dynamic:$??!1})}resize(J,$,Q){return this.source.resize(J,$,Q),this}}});class gQ{constructor(J){this._renderer=J}generateTexture(J){if(J instanceof B8)J={target:J,frame:void 0,textureSourceOptions:{},resolution:void 0};let $=J.resolution||this._renderer.resolution,Q=J.antialias||this._renderer.view.antialias,Z=J.target,K=J.clearColor;if(K)K=Array.isArray(K)&&K.length===4?K:R6.shared.setValue(K).toArray();else K=u4;let W=J.frame?.copyTo(l4)||TJ(Z,c4).rectangle;W.width=Math.max(W.width,1/$)|0,W.height=Math.max(W.height,1/$)|0;let X=xQ.create({...J.textureSourceOptions,width:W.width,height:W.height,resolution:$,antialias:Q}),H=B0.shared.translate(-W.x,-W.y);return this._renderer.render({container:Z,transform:H,target:X,clearColor:K}),X.source.updateMipmaps(),X}destroy(){this._renderer=null}}var l4,c4,u4;var cU=A(()=>{_9();k0();E8();E7();v6();g$();o6();lU();l4=new R8,c4=new L8,u4=[0,0,0,0];gQ.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"textureGenerator"}});function uU(J){let $=!1;for(let Z in J)if(J[Z]==null){$=!0;break}if(!$)return J;let Q=Object.create(null);for(let Z in J){let K=J[Z];if(K)Q[Z]=K}return Q}function sU(J){let $=0;for(let Q=0;Q<J.length;Q++)if(J[Q]==null)$++;else J[Q-$]=J[Q];return J.length-=$,J}var nU=()=>{};var JW=class J{constructor($){this._managedResources=[],this._managedResourceHashes=[],this._managedCollections=[],this._ready=!1,this._renderer=$}init($){$={...J.defaultOptions,...$},this.maxUnusedTime=$.gcMaxUnusedTime,this._frequency=$.gcFrequency,this.enabled=$.gcActive,this.now=performance.now()}get enabled(){return!!this._handler}set enabled($){if(this.enabled===$)return;if($)this._handler=this._renderer.scheduler.repeat(()=>{this._ready=!0},this._frequency,!1),this._collectionsHandler=this._renderer.scheduler.repeat(()=>{for(let Q of this._managedCollections){let{context:Z,collection:K,type:W}=Q;if(W==="hash")Z[K]=uU(Z[K]);else Z[K]=sU(Z[K])}},this._frequency);else this._renderer.scheduler.cancel(this._handler),this._renderer.scheduler.cancel(this._collectionsHandler),this._handler=0,this._collectionsHandler=0}prerender({container:$}){this.now=performance.now(),$.renderGroup.gcTick=this._renderer.tick++,this._updateInstructionGCTick($.renderGroup,$.renderGroup.gcTick)}postrender(){if(!this._ready||!this.enabled)return;this.run(),this._ready=!1}_updateInstructionGCTick($,Q){$.instructionSet.gcTick=Q,$.gcTick=Q;for(let Z of $.renderGroupChildren)this._updateInstructionGCTick(Z,Q)}addCollection($,Q,Z){this._managedCollections.push({context:$,collection:Q,type:Z})}addResource($,Q){if($._gcLastUsed!==-1){$._gcLastUsed=this.now,$._onTouch?.(this.now);return}let Z=this._managedResources.length;$._gcData={index:Z,type:Q},$._gcLastUsed=this.now,$._onTouch?.(this.now),$.once("unload",this.removeResource,this),this._managedResources.push($)}removeResource($){let Q=$._gcData;if(!Q)return;let Z=Q.index,K=this._managedResources.length-1;if(Z!==K){let W=this._managedResources[K];this._managedResources[Z]=W,W._gcData.index=Z}this._managedResources.length--,$._gcData=null,$._gcLastUsed=-1}addResourceHash($,Q,Z,K=0){this._managedResourceHashes.push({context:$,hash:Q,type:Z,priority:K}),this._managedResourceHashes.sort((W,X)=>W.priority-X.priority)}run(){let $=performance.now(),Q=this._managedResourceHashes;for(let K of Q)this.runOnHash(K,$);let Z=0;for(let K=0;K<this._managedResources.length;K++){let W=this._managedResources[K];Z=this.runOnResource(W,$,Z)}this._managedResources.length=Z}updateRenderableGCTick($,Q){let Z=$.renderGroup??$.parentRenderGroup,K=Z?.instructionSet?.gcTick??-1;if((Z?.gcTick??0)===K)$._gcLastUsed=Q,$._onTouch?.(Q)}runOnResource($,Q,Z){let K=$._gcData;if(K.type==="renderable")this.updateRenderableGCTick($,Q);if(Q-$._gcLastUsed<this.maxUnusedTime||!$.autoGarbageCollect)this._managedResources[Z]=$,K.index=Z,Z++;else $.unload(),$._gcData=null,$._gcLastUsed=-1,$.off("unload",this.removeResource,this);return Z}_createHashClone($,Q){let Z=Object.create(null);for(let K in $){if(K===Q)break;if($[K]!==null)Z[K]=$[K]}return Z}runOnHash($,Q){let{context:Z,hash:K,type:W}=$,X=Z[K],H=null,q=0;for(let Y in X){let N=X[Y];if(N===null){if(q++,q===1e4&&!H)H=this._createHashClone(X,Y);continue}if(N._gcLastUsed===-1){if(N._gcLastUsed=Q,N._onTouch?.(Q),H)H[Y]=N;continue}if(W==="renderable")this.updateRenderableGCTick(N,Q);if(!(Q-N._gcLastUsed<this.maxUnusedTime)&&N.autoGarbageCollect){if(!H)if(q+1!==1e4)X[Y]=null,q++;else H=this._createHashClone(X,Y);if(W==="renderable"){let V=N,z=V.renderGroup??V.parentRenderGroup;if(z)z.structureDidChange=!0}N.unload(),N._gcData=null,N._gcLastUsed=-1}else if(H)H[Y]=N}if(H)Z[K]=H}destroy(){this.enabled=!1,this._managedResources.forEach(($)=>{$.off("unload",this.removeResource,this)}),this._managedResources.length=0,this._managedResourceHashes.length=0,this._managedCollections.length=0,this._renderer=null}},iU;var oU=A(()=>{k0();nU();JW.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"gc",priority:0};JW.defaultOptions={gcActive:!0,gcMaxUnusedTime:60000,gcFrequency:30000};iU=JW});class pQ{constructor(J){this._stackIndex=0,this._globalUniformDataStack=[],this._uniformsPool=[],this._activeUniforms=[],this._bindGroupPool=[],this._activeBindGroups=[],this._renderer=J}reset(){this._stackIndex=0;for(let J=0;J<this._activeUniforms.length;J++)this._uniformsPool.push(this._activeUniforms[J]);for(let J=0;J<this._activeBindGroups.length;J++)this._bindGroupPool.push(this._activeBindGroups[J]);this._activeUniforms.length=0,this._activeBindGroups.length=0}start(J){this.reset(),this.push(J)}bind({size:J,projectionMatrix:$,worldTransformMatrix:Q,worldColor:Z,offset:K}){let W=this._renderer.renderTarget.renderTarget,X=this._stackIndex?this._globalUniformDataStack[this._stackIndex-1]:{projectionData:W,worldTransformMatrix:new B0,worldColor:4294967295,offset:new O8},H={projectionMatrix:$||this._renderer.renderTarget.projectionMatrix,resolution:J||W.size,worldTransformMatrix:Q||X.worldTransformMatrix,worldColor:Z||X.worldColor,offset:K||X.offset,bindGroup:null},q=this._uniformsPool.pop()||this._createUniforms();this._activeUniforms.push(q);let Y=q.uniforms;Y.uProjectionMatrix=H.projectionMatrix,Y.uResolution=H.resolution,Y.uWorldTransformMatrix.copyFrom(H.worldTransformMatrix),Y.uWorldTransformMatrix.tx-=H.offset.x,Y.uWorldTransformMatrix.ty-=H.offset.y,DU(H.worldColor,Y.uWorldColorAlpha,0),q.update();let N;if(this._renderer.renderPipes.uniformBatch)N=this._renderer.renderPipes.uniformBatch.getUniformBindGroup(q,!1);else N=this._bindGroupPool.pop()||new Y7,this._activeBindGroups.push(N),N.setResource(q,0);H.bindGroup=N,this._currentGlobalUniformData=H}push(J){this.bind(J),this._globalUniformDataStack[this._stackIndex++]=this._currentGlobalUniformData}pop(){if(this._currentGlobalUniformData=this._globalUniformDataStack[--this._stackIndex-1],this._renderer.type===q6.WEBGL)this._currentGlobalUniformData.bindGroup.resources[0].update()}get bindGroup(){return this._currentGlobalUniformData.bindGroup}get globalUniformData(){return this._currentGlobalUniformData}get uniformGroup(){return this._currentGlobalUniformData.bindGroup.resources[0]}_createUniforms(){return new o8({uProjectionMatrix:{value:new B0,type:"mat3x3<f32>"},uWorldTransformMatrix:{value:new B0,type:"mat3x3<f32>"},uWorldColorAlpha:{value:new Float32Array(4),type:"vec4<f32>"},uResolution:{value:[0,0],type:"vec2<f32>"}},{isStatic:!0})}destroy(){this._renderer=null,this._globalUniformDataStack.length=0,this._uniformsPool.length=0,this._activeUniforms.length=0,this._bindGroupPool.length=0,this._activeBindGroups.length=0,this._currentGlobalUniformData=null}}var aU=A(()=>{k0();E8();_7();kU();VQ();ZJ();N7();pQ.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"globalUniforms"}});class mQ{constructor(){this._tasks=[],this._offset=0}init(){l8.system.add(this._update,this)}repeat(J,$,Q=!0){let Z=s4++,K=0;if(Q)this._offset+=1000,K=this._offset;return this._tasks.push({func:J,duration:$,start:performance.now(),offset:K,last:performance.now(),repeat:!0,id:Z}),Z}cancel(J){for(let $=0;$<this._tasks.length;$++)if(this._tasks[$].id===J){this._tasks.splice($,1);return}}_update(){let J=performance.now();for(let $=0;$<this._tasks.length;$++){let Q=this._tasks[$];if(J-Q.offset-Q.last>=Q.duration){let Z=J-Q.start;Q.func(Z),Q.last=J}}}destroy(){l8.system.remove(this._update,this),this._tasks.length=0}}var s4=1;var rU=A(()=>{k0();hJ();mQ.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"scheduler",priority:0}});function eU(J){if(tU)return;if(F8.get().getNavigator().userAgent.toLowerCase().indexOf("chrome")>-1){let $=[`%c  %c  %c  %c  %c PixiJS %c v${cJ} (${J}) http://www.pixijs.com/

`,"background: #E72264; padding:5px 0;","background: #6CA2EA; padding:5px 0;","background: #B5D33D; padding:5px 0;","background: #FED23F; padding:5px 0;","color: #FFFFFF; background: #E72264; padding:5px 0;","color: #E72264; background: #FFFFFF; padding:5px 0;"];globalThis.console.log(...$)}else if(globalThis.console)globalThis.console.log(`PixiJS ${cJ} - ${J} - http://www.pixijs.com/`);tU=!0}var tU=!1;var JV=A(()=>{D6();B5()});class t9{constructor(J){this._renderer=J}init(J){if(J.hello){let $=this._renderer.name;if(this._renderer.type===q6.WEBGL)$+=` ${this._renderer.context.webGLVersion}`;eU($)}}}var $V=A(()=>{k0();JV();ZJ();t9.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"hello",priority:-2};t9.defaultOptions={hello:!1}});var $W=class J{constructor($){this._renderer=$}init($){$={...J.defaultOptions,...$},this.maxUnusedTime=$.renderableGCMaxUnusedTime}get enabled(){return u0("8.15.0","RenderableGCSystem.enabled is deprecated, please use the GCSystem.enabled instead."),this._renderer.gc.enabled}set enabled($){u0("8.15.0","RenderableGCSystem.enabled is deprecated, please use the GCSystem.enabled instead."),this._renderer.gc.enabled=$}addManagedHash($,Q){u0("8.15.0","RenderableGCSystem.addManagedHash is deprecated, please use the GCSystem.addCollection instead."),this._renderer.gc.addCollection($,Q,"hash")}addManagedArray($,Q){u0("8.15.0","RenderableGCSystem.addManagedArray is deprecated, please use the GCSystem.addCollection instead."),this._renderer.gc.addCollection($,Q,"array")}addRenderable($){u0("8.15.0","RenderableGCSystem.addRenderable is deprecated, please use the GCSystem instead."),this._renderer.gc.addResource($,"renderable")}run(){u0("8.15.0","RenderableGCSystem.run is deprecated, please use the GCSystem instead."),this._renderer.gc.run()}destroy(){this._renderer=null}},QV;var ZV=A(()=>{k0();F6();$W.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"renderableGC",priority:0};$W.defaultOptions={renderableGCActive:!0,renderableGCMaxUnusedTime:60000,renderableGCFrequency:30000};QV=$W});var QW=class J{get count(){return this._renderer.tick}get checkCount(){return this._checkCount}set checkCount($){u0("8.15.0","TextureGCSystem.run is deprecated, please use the GCSystem instead."),this._checkCount=$}get maxIdle(){return this._renderer.gc.maxUnusedTime/1000*60}set maxIdle($){u0("8.15.0","TextureGCSystem.run is deprecated, please use the GCSystem instead."),this._renderer.gc.maxUnusedTime=$/60*1000}get checkCountMax(){return Math.floor(this._renderer.gc._frequency/1000)}set checkCountMax($){u0("8.15.0","TextureGCSystem.run is deprecated, please use the GCSystem instead.")}get active(){return this._renderer.gc.enabled}set active($){u0("8.15.0","TextureGCSystem.run is deprecated, please use the GCSystem instead."),this._renderer.gc.enabled=$}constructor($){this._renderer=$,this._checkCount=0}init($){if($.textureGCActive!==J.defaultOptions.textureGCActive)this.active=$.textureGCActive;if($.textureGCMaxIdle!==J.defaultOptions.textureGCMaxIdle)this.maxIdle=$.textureGCMaxIdle;if($.textureGCCheckCountMax!==J.defaultOptions.textureGCCheckCountMax)this.checkCountMax=$.textureGCCheckCountMax}run(){u0("8.15.0","TextureGCSystem.run is deprecated, please use the GCSystem instead."),this._renderer.gc.run()}destroy(){this._renderer=null}},KV;var WV=A(()=>{k0();F6();QW.extension={type:[b.WebGLSystem,b.WebGPUSystem],name:"textureGC"};QW.defaultOptions={textureGCActive:!0,textureGCAMaxIdle:null,textureGCMaxIdle:3600,textureGCCheckCountMax:600};KV=QW});var XV=class J{constructor($={}){if(this.uid=i0("renderTarget"),this.colorTextures=[],this.dirtyId=0,this.isRoot=!1,this._size=new Float32Array(2),this._managedColorTextures=!1,$={...J.defaultOptions,...$},this.stencil=$.stencil,this.depth=$.depth,this.isRoot=$.isRoot,typeof $.colorTextures==="number"){this._managedColorTextures=!0;for(let Q=0;Q<$.colorTextures;Q++)this.colorTextures.push(new $8({width:$.width,height:$.height,resolution:$.resolution,antialias:$.antialias}))}else{this.colorTextures=[...$.colorTextures.map((Z)=>Z.source)];let Q=this.colorTexture.source;this.resize(Q.width,Q.height,Q._resolution)}if(this.colorTexture.source.on("resize",this.onSourceResize,this),$.depthStencilTexture||this.stencil)if($.depthStencilTexture instanceof P0||$.depthStencilTexture instanceof $8)this.depthStencilTexture=$.depthStencilTexture.source;else this.ensureDepthStencilTexture()}get size(){let $=this._size;return $[0]=this.pixelWidth,$[1]=this.pixelHeight,$}get width(){return this.colorTexture.source.width}get height(){return this.colorTexture.source.height}get pixelWidth(){return this.colorTexture.source.pixelWidth}get pixelHeight(){return this.colorTexture.source.pixelHeight}get resolution(){return this.colorTexture.source._resolution}get colorTexture(){return this.colorTextures[0]}onSourceResize($){this.resize($.width,$.height,$._resolution,!0)}ensureDepthStencilTexture(){if(!this.depthStencilTexture)this.depthStencilTexture=new $8({width:this.width,height:this.height,resolution:this.resolution,format:"depth24plus-stencil8",autoGenerateMipmaps:!1,antialias:!1,mipLevelCount:1})}resize($,Q,Z=this.resolution,K=!1){if(this.dirtyId++,this.colorTextures.forEach((W,X)=>{if(K&&X===0)return;W.source.resize($,Q,Z)}),this.depthStencilTexture)this.depthStencilTexture.source.resize($,Q,Z)}destroy(){if(this.colorTexture.source.off("resize",this.onSourceResize,this),this._managedColorTextures)this.colorTextures.forEach(($)=>{$.destroy()});if(this.depthStencilTexture)this.depthStencilTexture.destroy(),delete this.depthStencilTexture}},e9;var ZW=A(()=>{W6();X6();i8();XV.defaultOptions={width:0,height:0,resolution:1,colorTextures:1,stencil:!1,depth:!1,antialias:!1,isRoot:!1};e9=XV});function dQ(J,$){if(!iJ.has(J)){let Q=new P0({source:new k6({resource:J,...$})}),Z=()=>{if(iJ.get(J)===Q)iJ.delete(J)};Q.once("destroy",Z),Q.source.once("destroy",Z),iJ.set(J,Q)}return iJ.get(J)}var iJ;var KW=A(()=>{EJ();f9();i8();iJ=new Map;i6.register(iJ)});var WW=class J{get autoDensity(){return this.texture.source.autoDensity}set autoDensity($){this.texture.source.autoDensity=$}get resolution(){return this.texture.source._resolution}set resolution($){this.texture.source.resize(this.texture.source.width,this.texture.source.height,$)}init($){if($={...J.defaultOptions,...$},$.view)u0(Z6,"ViewSystem.view has been renamed to ViewSystem.canvas"),$.canvas=$.view;this.screen=new R8(0,0,$.width,$.height),this.canvas=$.canvas||F8.get().createCanvas(),this.antialias=!!$.antialias,this.texture=dQ(this.canvas,$),this.renderTarget=new e9({colorTextures:[this.texture],depth:!!$.depth,isRoot:!0}),this.texture.source.transparent=$.backgroundAlpha<1,this.resolution=$.resolution}resize($,Q,Z){this.texture.source.resize($,Q,Z),this.screen.width=this.texture.frame.width,this.screen.height=this.texture.frame.height}destroy($=!1){if((typeof $==="boolean"?$:!!$?.removeView)&&this.canvas.parentNode)this.canvas.parentNode.removeChild(this.canvas);this.texture.destroy()}},HV;var qV=A(()=>{D6();k0();E7();F6();ZW();KW();WW.extension={type:[b.WebGLSystem,b.WebGPUSystem,b.CanvasSystem],name:"view",priority:0};WW.defaultOptions={width:800,height:600,autoDensity:!1,antialias:!1};HV=WW});var YV,NV;var UV=A(()=>{EU();PU();xU();jU();MN();GU();AU();_U();CU();pU();SU();dU();cU();oU();aU();rU();$V();ZV();WV();qV();YV=[gU,pQ,t9,HV,hQ,iU,KV,gQ,mU,kQ,QV,mQ],NV=[fQ,n5,vQ,bQ,jQ,TQ,SQ,yQ]});function VV(J,$,Q,Z,K,W){let X=W?1:-1;return J.identity(),J.a=1/Z*2,J.d=X*(1/K*2),J.tx=-1-$*J.a,J.ty=-X-Q*J.d,J}var OV=()=>{};function FV(J){let $=J.colorTexture.source.resource;return globalThis.HTMLCanvasElement&&$ instanceof HTMLCanvasElement&&document.body.contains($)}var zV=()=>{};class XW{constructor(J){this.rootViewPort=new R8,this.viewport=new R8,this.mipLevel=0,this.layer=0,this.onRenderTargetChange=new l9("onRenderTargetChange"),this.projectionMatrix=new B0,this.defaultClearColor=[0,0,0,0],this._renderSurfaceToRenderTargetHash=new Map,this._gpuRenderTargetHash=Object.create(null),this._renderTargetStack=[],this._renderer=J,J.gc.addCollection(this,"_gpuRenderTargetHash","hash")}finishRenderPass(){this.adaptor.finishRenderPass(this.renderTarget)}renderStart({target:J,clear:$,clearColor:Q,frame:Z,mipLevel:K,layer:W}){this._renderTargetStack.length=0,this.push(J,$,Q,Z,K??0,W??0),this.rootViewPort.copyFrom(this.viewport),this.rootRenderTarget=this.renderTarget,this.renderingToScreen=FV(this.rootRenderTarget),this.adaptor.prerender?.(this.rootRenderTarget)}postrender(){this.adaptor.postrender?.(this.rootRenderTarget)}bind(J,$=!0,Q,Z,K=0,W=0){let X=this.getRenderTarget(J),H=this.renderTarget!==X;this.renderTarget=X,this.renderSurface=J;let q=this.getGpuRenderTarget(X);if(X.pixelWidth!==q.width||X.pixelHeight!==q.height)this.adaptor.resizeGpuRenderTarget(X),q.width=X.pixelWidth,q.height=X.pixelHeight;let Y=X.colorTexture,N=this.viewport,U=Y.arrayLayerCount||1;if((W|0)!==W)W|=0;if(W<0||W>=U)throw Error(`[RenderTargetSystem] layer ${W} is out of bounds (arrayLayerCount=${U}).`);this.mipLevel=K|0,this.layer=W|0;let V=Math.max(Y.pixelWidth>>K,1),z=Math.max(Y.pixelHeight>>K,1);if(!Z&&J instanceof P0)Z=J.frame;if(Z){let D=Y._resolution,w=1<<Math.max(K|0,0),F=Z.x*D+0.5|0,O=Z.y*D+0.5|0,R=Z.width*D+0.5|0,B=Z.height*D+0.5|0,L=Math.floor(F/w),y=Math.floor(O/w),_=Math.ceil(R/w),j=Math.ceil(B/w);L=Math.min(Math.max(L,0),V-1),y=Math.min(Math.max(y,0),z-1),_=Math.min(Math.max(_,1),V-L),j=Math.min(Math.max(j,1),z-y),N.x=L,N.y=y,N.width=_,N.height=j}else N.x=0,N.y=0,N.width=V,N.height=z;if(VV(this.projectionMatrix,0,0,N.width/Y.resolution,N.height/Y.resolution,!X.isRoot),this.adaptor.startRenderPass(X,$,Q,N,K,W),H)this.onRenderTargetChange.emit(X);return X}clear(J,$=C6.ALL,Q,Z=this.mipLevel,K=this.layer){if(!$)return;if(J)J=this.getRenderTarget(J);this.adaptor.clear(J||this.renderTarget,$,Q,this.viewport,Z,K)}contextChange(){this._gpuRenderTargetHash=Object.create(null)}push(J,$=C6.ALL,Q,Z,K=0,W=0){let X=this.bind(J,$,Q,Z,K,W);return this._renderTargetStack.push({renderTarget:X,frame:Z,mipLevel:K,layer:W}),X}pop(){this._renderTargetStack.pop();let J=this._renderTargetStack[this._renderTargetStack.length-1];this.bind(J.renderTarget,!1,null,J.frame,J.mipLevel,J.layer)}getRenderTarget(J){if(J.isTexture)J=J.source;return this._renderSurfaceToRenderTargetHash.get(J)??this._initRenderTarget(J)}copyToTexture(J,$,Q,Z,K){if(Q.x<0)Z.width+=Q.x,K.x-=Q.x,Q.x=0;if(Q.y<0)Z.height+=Q.y,K.y-=Q.y,Q.y=0;let{pixelWidth:W,pixelHeight:X}=J;return Z.width=Math.min(Z.width,W-Q.x),Z.height=Math.min(Z.height,X-Q.y),this.adaptor.copyToTexture(J,$,Q,Z,K)}ensureDepthStencil(){if(!this.renderTarget.stencil)this.renderTarget.stencil=!0,this.adaptor.startRenderPass(this.renderTarget,!1,null,this.viewport,0,this.layer)}destroy(){this._renderer=null,this._renderSurfaceToRenderTargetHash.forEach((J,$)=>{if(J!==$)J.destroy()}),this._renderSurfaceToRenderTargetHash.clear(),this._gpuRenderTargetHash=Object.create(null)}_initRenderTarget(J){let $=null;if(k6.test(J))J=dQ(J).source;if(J instanceof e9)$=J;else if(J instanceof $8){if($=new e9({colorTextures:[J]}),J.source instanceof k6)$.isRoot=!0;J.once("destroy",()=>{$.destroy(),this._renderSurfaceToRenderTargetHash.delete(J);let Q=this._gpuRenderTargetHash[$.uid];if(Q)this._gpuRenderTargetHash[$.uid]=null,this.adaptor.destroyGpuRenderTarget(Q)})}return this._renderSurfaceToRenderTargetHash.set(J,$),$}getGpuRenderTarget(J){return this._gpuRenderTargetHash[J.uid]||(this._gpuRenderTargetHash[J.uid]=this.adaptor.initGpuRenderTarget(J))}resetState(){this.renderTarget=null,this.renderSurface=null}}var DV=A(()=>{E8();E7();d9();OV();L5();f9();X6();i8();KW();zV();ZW()});var J$;var kV=A(()=>{J$=((J)=>{return J[J.ELEMENT_ARRAY_BUFFER=34963]="ELEMENT_ARRAY_BUFFER",J[J.ARRAY_BUFFER=34962]="ARRAY_BUFFER",J[J.UNIFORM_BUFFER=35345]="UNIFORM_BUFFER",J})(J$||{})});class HW{constructor(J,$){this._lastBindBaseLocation=-1,this._lastBindCallId=-1,this.buffer=J||null,this.updateID=-1,this.byteLength=-1,this.type=$}destroy(){this.buffer=null,this.updateID=-1,this.byteLength=-1,this.type=-1,this._lastBindBaseLocation=-1,this._lastBindCallId=-1}}var IV=()=>{};class lQ{constructor(J){this._boundBufferBases=Object.create(null),this._minBaseLocation=0,this._nextBindBaseIndex=this._minBaseLocation,this._bindCallId=0,this._renderer=J,this._managedBuffers=new WJ({renderer:J,type:"resource",onUnload:this.onBufferUnload.bind(this),name:"glBuffer"})}destroy(){this._managedBuffers.destroy(),this._renderer=null,this._gl=null,this._boundBufferBases={}}contextChange(){this._gl=this._renderer.gl,this.destroyAll(!0),this._maxBindings=this._renderer.limits.maxUniformBindings}getGlBuffer(J){return J._gcLastUsed=this._renderer.gc.now,J._gpuData[this._renderer.uid]||this.createGLBuffer(J)}bind(J){let{_gl:$}=this,Q=this.getGlBuffer(J);$.bindBuffer(Q.type,Q.buffer)}bindBufferBase(J,$){let{_gl:Q}=this;if(this._boundBufferBases[$]!==J)this._boundBufferBases[$]=J,J._lastBindBaseLocation=$,Q.bindBufferBase(Q.UNIFORM_BUFFER,$,J.buffer)}nextBindBase(J){if(this._bindCallId++,this._minBaseLocation=0,J){if(this._boundBufferBases[0]=null,this._minBaseLocation=1,this._nextBindBaseIndex<1)this._nextBindBaseIndex=1}}freeLocationForBufferBase(J){let $=this.getLastBindBaseLocation(J);if($>=this._minBaseLocation)return J._lastBindCallId=this._bindCallId,$;let Q=0,Z=this._nextBindBaseIndex;while(Q<2){if(Z>=this._maxBindings)Z=this._minBaseLocation,Q++;let K=this._boundBufferBases[Z];if(K&&K._lastBindCallId===this._bindCallId){Z++;continue}break}if($=Z,this._nextBindBaseIndex=Z+1,Q>=2)return-1;return J._lastBindCallId=this._bindCallId,this._boundBufferBases[$]=null,$}getLastBindBaseLocation(J){let $=J._lastBindBaseLocation;if(this._boundBufferBases[$]===J)return $;return-1}bindBufferRange(J,$,Q,Z){let{_gl:K}=this;Q||(Q=0),$||($=0),this._boundBufferBases[$]=null,K.bindBufferRange(K.UNIFORM_BUFFER,$||0,J.buffer,Q*256,Z||256)}updateBuffer(J){let{_gl:$}=this,Q=this.getGlBuffer(J);if(J._updateID===Q.updateID)return Q;Q.updateID=J._updateID,$.bindBuffer(Q.type,Q.buffer);let Z=J.data,K=J.descriptor.usage&I8.STATIC?$.STATIC_DRAW:$.DYNAMIC_DRAW;if(Z)if(Q.byteLength>=Z.byteLength)$.bufferSubData(Q.type,0,Z,0,J._updateSize/Z.BYTES_PER_ELEMENT);else Q.byteLength=Z.byteLength,$.bufferData(Q.type,Z,K);else Q.byteLength=J.descriptor.size,$.bufferData(Q.type,Q.byteLength,K);return Q}destroyAll(J=!1){this._managedBuffers.removeAll(J)}onBufferUnload(J,$=!1){let Q=J._gpuData[this._renderer.uid];if(!Q)return;if(!$)this._gl.deleteBuffer(Q.buffer)}createGLBuffer(J){let{_gl:$}=this,Q=J$.ARRAY_BUFFER;if(J.descriptor.usage&I8.INDEX)Q=J$.ELEMENT_ARRAY_BUFFER;else if(J.descriptor.usage&I8.UNIFORM)Q=J$.UNIFORM_BUFFER;let Z=new HW($.createBuffer(),Q);return J._gpuData[this._renderer.uid]=Z,this._managedBuffers.add(J),Z}resetState(){this._boundBufferBases=Object.create(null)}}var wV=A(()=>{k0();CQ();lJ();kV();IV();lQ.extension={type:[b.WebGLSystem],name:"buffer"}});var qW=class J{constructor($){this.supports={uint32Indices:!0,uniformBufferObject:!0,vertexArrayObject:!0,srgbTextures:!0,nonPowOf2wrapping:!0,msaa:!0,nonPowOf2mipmaps:!0},this._renderer=$,this.extensions=Object.create(null),this.handleContextLost=this.handleContextLost.bind(this),this.handleContextRestored=this.handleContextRestored.bind(this)}get isLost(){return!this.gl||this.gl.isContextLost()}contextChange($){this.gl=$,this._renderer.gl=$}init($){$={...J.defaultOptions,...$};let Q=this.multiView=$.multiView;if($.context&&Q)v0("Renderer created with both a context and multiview enabled. Disabling multiView as both cannot work together."),Q=!1;if(Q)this.canvas=F8.get().createCanvas(this._renderer.canvas.width,this._renderer.canvas.height);else this.canvas=this._renderer.view.canvas;if($.context)this.initFromContext($.context);else{let Z=this._renderer.background.alpha<1,K=$.premultipliedAlpha??!0,W=$.antialias&&!this._renderer.backBuffer.useBackBuffer;this.createContext($.preferWebGLVersion,{alpha:Z,premultipliedAlpha:K,antialias:W,stencil:!0,preserveDrawingBuffer:$.preserveDrawingBuffer,powerPreference:$.powerPreference??"default"})}}ensureCanvasSize($){if(!this.multiView){if($!==this.canvas)v0("multiView is disabled, but targetCanvas is not the main canvas");return}let{canvas:Q}=this;if(Q.width<$.width||Q.height<$.height)Q.width=Math.max($.width,$.width),Q.height=Math.max($.height,$.height)}initFromContext($){this.gl=$,this.webGLVersion=$ instanceof F8.get().getWebGLRenderingContext()?1:2,this.getExtensions(),this.validateContext($),this._renderer.runners.contextChange.emit($);let Q=this._renderer.view.canvas;Q.addEventListener("webglcontextlost",this.handleContextLost,!1),Q.addEventListener("webglcontextrestored",this.handleContextRestored,!1)}createContext($,Q){let Z,K=this.canvas;if($===2)Z=K.getContext("webgl2",Q);if(!Z){if(Z=K.getContext("webgl",Q),!Z)throw Error("This browser does not support WebGL. Try using the canvas renderer")}this.gl=Z,this.initFromContext(this.gl)}getExtensions(){let{gl:$}=this,Q={anisotropicFiltering:$.getExtension("EXT_texture_filter_anisotropic"),floatTextureLinear:$.getExtension("OES_texture_float_linear"),s3tc:$.getExtension("WEBGL_compressed_texture_s3tc"),s3tc_sRGB:$.getExtension("WEBGL_compressed_texture_s3tc_srgb"),etc:$.getExtension("WEBGL_compressed_texture_etc"),etc1:$.getExtension("WEBGL_compressed_texture_etc1"),pvrtc:$.getExtension("WEBGL_compressed_texture_pvrtc")||$.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),atc:$.getExtension("WEBGL_compressed_texture_atc"),astc:$.getExtension("WEBGL_compressed_texture_astc"),bptc:$.getExtension("EXT_texture_compression_bptc"),rgtc:$.getExtension("EXT_texture_compression_rgtc"),loseContext:$.getExtension("WEBGL_lose_context")};if(this.webGLVersion===1)this.extensions={...Q,drawBuffers:$.getExtension("WEBGL_draw_buffers"),depthTexture:$.getExtension("WEBGL_depth_texture"),vertexArrayObject:$.getExtension("OES_vertex_array_object")||$.getExtension("MOZ_OES_vertex_array_object")||$.getExtension("WEBKIT_OES_vertex_array_object"),uint32ElementIndex:$.getExtension("OES_element_index_uint"),floatTexture:$.getExtension("OES_texture_float"),floatTextureLinear:$.getExtension("OES_texture_float_linear"),textureHalfFloat:$.getExtension("OES_texture_half_float"),textureHalfFloatLinear:$.getExtension("OES_texture_half_float_linear"),vertexAttribDivisorANGLE:$.getExtension("ANGLE_instanced_arrays"),srgb:$.getExtension("EXT_sRGB")};else{this.extensions={...Q,colorBufferFloat:$.getExtension("EXT_color_buffer_float")};let Z=$.getExtension("WEBGL_provoking_vertex");if(Z)Z.provokingVertexWEBGL(Z.FIRST_VERTEX_CONVENTION_WEBGL)}}handleContextLost($){if($.preventDefault(),this._contextLossForced)this._contextLossForced=!1,setTimeout(()=>{if(this.gl.isContextLost())this.extensions.loseContext?.restoreContext()},0)}handleContextRestored(){this.getExtensions(),this._renderer.runners.contextChange.emit(this.gl)}destroy(){let $=this._renderer.view.canvas;this._renderer=null,$.removeEventListener("webglcontextlost",this.handleContextLost),$.removeEventListener("webglcontextrestored",this.handleContextRestored),this.gl.useProgram(null),this.extensions.loseContext?.loseContext()}forceContextLoss(){this.extensions.loseContext?.loseContext(),this._contextLossForced=!0}validateContext($){let Q=$.getContextAttributes();if(Q&&!Q.stencil)v0("Provided WebGL context does not have a stencil buffer, masks may not render correctly");let Z=this.supports,K=this.webGLVersion===2,W=this.extensions;if(Z.uint32Indices=K||!!W.uint32ElementIndex,Z.uniformBufferObject=K,Z.vertexArrayObject=K||!!W.vertexArrayObject,Z.srgbTextures=K||!!W.srgb,Z.nonPowOf2wrapping=K,Z.nonPowOf2mipmaps=K,Z.msaa=K,!Z.uint32Indices)v0("Provided WebGL context does not support 32 index buffer, large scenes may not render correctly")}},MV;var GV=A(()=>{D6();k0();s8();qW.extension={type:[b.WebGLSystem],name:"context"};qW.defaultOptions={context:null,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:void 0,preferWebGLVersion:2,multiView:!1};MV=qW});function RV(J,$){for(let Q in J.attributes){let Z=J.attributes[Q],K=$[Q];if(K)Z.format??(Z.format=K.format),Z.offset??(Z.offset=K.offset),Z.instance??(Z.instance=K.instance);else v0(`Attribute ${Q} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`)}n4(J)}function n4(J){let{buffers:$,attributes:Q}=J,Z={},K={};for(let W in $){let X=$[W];Z[X.uid]=0,K[X.uid]=0}for(let W in Q){let X=Q[W];Z[X.buffer.uid]+=q7(X.format).stride}for(let W in Q){let X=Q[W];X.stride??(X.stride=Z[X.buffer.uid]),X.start??(X.start=K[X.buffer.uid]),K[X.buffer.uid]+=q7(X.format).stride}}var LV=A(()=>{s8();x9()});var cQ,$$,o0;var uQ=A(()=>{cQ=((J)=>{return J[J.RGBA=6408]="RGBA",J[J.RGB=6407]="RGB",J[J.RG=33319]="RG",J[J.RED=6403]="RED",J[J.RGBA_INTEGER=36249]="RGBA_INTEGER",J[J.RGB_INTEGER=36248]="RGB_INTEGER",J[J.RG_INTEGER=33320]="RG_INTEGER",J[J.RED_INTEGER=36244]="RED_INTEGER",J[J.ALPHA=6406]="ALPHA",J[J.LUMINANCE=6409]="LUMINANCE",J[J.LUMINANCE_ALPHA=6410]="LUMINANCE_ALPHA",J[J.DEPTH_COMPONENT=6402]="DEPTH_COMPONENT",J[J.DEPTH_STENCIL=34041]="DEPTH_STENCIL",J})(cQ||{}),$$=((J)=>{return J[J.TEXTURE_2D=3553]="TEXTURE_2D",J[J.TEXTURE_CUBE_MAP=34067]="TEXTURE_CUBE_MAP",J[J.TEXTURE_2D_ARRAY=35866]="TEXTURE_2D_ARRAY",J[J.TEXTURE_CUBE_MAP_POSITIVE_X=34069]="TEXTURE_CUBE_MAP_POSITIVE_X",J[J.TEXTURE_CUBE_MAP_NEGATIVE_X=34070]="TEXTURE_CUBE_MAP_NEGATIVE_X",J[J.TEXTURE_CUBE_MAP_POSITIVE_Y=34071]="TEXTURE_CUBE_MAP_POSITIVE_Y",J[J.TEXTURE_CUBE_MAP_NEGATIVE_Y=34072]="TEXTURE_CUBE_MAP_NEGATIVE_Y",J[J.TEXTURE_CUBE_MAP_POSITIVE_Z=34073]="TEXTURE_CUBE_MAP_POSITIVE_Z",J[J.TEXTURE_CUBE_MAP_NEGATIVE_Z=34074]="TEXTURE_CUBE_MAP_NEGATIVE_Z",J})($$||{}),o0=((J)=>{return J[J.UNSIGNED_BYTE=5121]="UNSIGNED_BYTE",J[J.UNSIGNED_SHORT=5123]="UNSIGNED_SHORT",J[J.UNSIGNED_SHORT_5_6_5=33635]="UNSIGNED_SHORT_5_6_5",J[J.UNSIGNED_SHORT_4_4_4_4=32819]="UNSIGNED_SHORT_4_4_4_4",J[J.UNSIGNED_SHORT_5_5_5_1=32820]="UNSIGNED_SHORT_5_5_5_1",J[J.UNSIGNED_INT=5125]="UNSIGNED_INT",J[J.UNSIGNED_INT_10F_11F_11F_REV=35899]="UNSIGNED_INT_10F_11F_11F_REV",J[J.UNSIGNED_INT_2_10_10_10_REV=33640]="UNSIGNED_INT_2_10_10_10_REV",J[J.UNSIGNED_INT_24_8=34042]="UNSIGNED_INT_24_8",J[J.UNSIGNED_INT_5_9_9_9_REV=35902]="UNSIGNED_INT_5_9_9_9_REV",J[J.BYTE=5120]="BYTE",J[J.SHORT=5122]="SHORT",J[J.INT=5124]="INT",J[J.FLOAT=5126]="FLOAT",J[J.FLOAT_32_UNSIGNED_INT_24_8_REV=36269]="FLOAT_32_UNSIGNED_INT_24_8_REV",J[J.HALF_FLOAT=36193]="HALF_FLOAT",J})(o0||{})});function AV(J){return BV[J]??BV.float32}var BV;var _V=A(()=>{uQ();BV={uint8x2:o0.UNSIGNED_BYTE,uint8x4:o0.UNSIGNED_BYTE,sint8x2:o0.BYTE,sint8x4:o0.BYTE,unorm8x2:o0.UNSIGNED_BYTE,unorm8x4:o0.UNSIGNED_BYTE,snorm8x2:o0.BYTE,snorm8x4:o0.BYTE,uint16x2:o0.UNSIGNED_SHORT,uint16x4:o0.UNSIGNED_SHORT,sint16x2:o0.SHORT,sint16x4:o0.SHORT,unorm16x2:o0.UNSIGNED_SHORT,unorm16x4:o0.UNSIGNED_SHORT,snorm16x2:o0.SHORT,snorm16x4:o0.SHORT,float16x2:o0.HALF_FLOAT,float16x4:o0.HALF_FLOAT,float32:o0.FLOAT,float32x2:o0.FLOAT,float32x3:o0.FLOAT,float32x4:o0.FLOAT,uint32:o0.UNSIGNED_INT,uint32x2:o0.UNSIGNED_INT,uint32x3:o0.UNSIGNED_INT,uint32x4:o0.UNSIGNED_INT,sint32:o0.INT,sint32x2:o0.INT,sint32x3:o0.INT,sint32x4:o0.INT}});class CV{constructor(){this.vaoCache=Object.create(null)}destroy(){this.vaoCache=Object.create(null)}}class sQ{constructor(J){this._renderer=J,this._activeGeometry=null,this._activeVao=null,this.hasVao=!0,this.hasInstance=!0,this._managedGeometries=new WJ({renderer:J,type:"resource",onUnload:this.onGeometryUnload.bind(this),name:"glGeometry"})}contextChange(){let J=this.gl=this._renderer.gl;if(!this._renderer.context.supports.vertexArrayObject)throw Error("[PixiJS] Vertex Array Objects are not supported on this device");this.destroyAll(!0);let $=this._renderer.context.extensions.vertexArrayObject;if($)J.createVertexArray=()=>$.createVertexArrayOES(),J.bindVertexArray=(Z)=>$.bindVertexArrayOES(Z),J.deleteVertexArray=(Z)=>$.deleteVertexArrayOES(Z);let Q=this._renderer.context.extensions.vertexAttribDivisorANGLE;if(Q)J.drawArraysInstanced=(Z,K,W,X)=>{Q.drawArraysInstancedANGLE(Z,K,W,X)},J.drawElementsInstanced=(Z,K,W,X,H)=>{Q.drawElementsInstancedANGLE(Z,K,W,X,H)},J.vertexAttribDivisor=(Z,K)=>Q.vertexAttribDivisorANGLE(Z,K);this._activeGeometry=null,this._activeVao=null}bind(J,$){let Q=this.gl;this._activeGeometry=J;let Z=this.getVao(J,$);if(this._activeVao!==Z)this._activeVao=Z,Q.bindVertexArray(Z);this.updateBuffers()}resetState(){this.unbind()}updateBuffers(){let J=this._activeGeometry,$=this._renderer.buffer;for(let Q=0;Q<J.buffers.length;Q++){let Z=J.buffers[Q];$.updateBuffer(Z)}J._gcLastUsed=this._renderer.gc.now}checkCompatibility(J,$){let Q=J.attributes,Z=$._attributeData;for(let K in Z)if(!Q[K])throw Error(`shader and geometry incompatible, geometry missing the "${K}" attribute`)}getSignature(J,$){let Q=J.attributes,Z=$._attributeData,K=["g",J.uid];for(let W in Q)if(Z[W])K.push(W,Z[W].location);return K.join("-")}getVao(J,$){return J._gpuData[this._renderer.uid]?.vaoCache[$._key]||this.initGeometryVao(J,$)}initGeometryVao(J,$,Q=!0){let Z=this._renderer.gl,K=this._renderer.buffer;this._renderer.shader._getProgramData($),this.checkCompatibility(J,$);let W=this.getSignature(J,$),X=J._gpuData[this._renderer.uid];if(!X)X=new CV,J._gpuData[this._renderer.uid]=X,this._managedGeometries.add(J);let H=X.vaoCache,q=H[W];if(q)return H[$._key]=q,q;RV(J,$._attributeData);let Y=J.buffers;q=Z.createVertexArray(),Z.bindVertexArray(q);for(let N=0;N<Y.length;N++){let U=Y[N];K.bind(U)}return this.activateVao(J,$),H[$._key]=q,H[W]=q,Z.bindVertexArray(null),q}onGeometryUnload(J,$=!1){let Q=J._gpuData[this._renderer.uid];if(!Q)return;let Z=Q.vaoCache;if(!$)for(let K in Z){if(this._activeVao!==Z[K])this.resetState();this.gl.deleteVertexArray(Z[K])}}destroyAll(J=!1){this._managedGeometries.removeAll(J)}activateVao(J,$){let Q=this._renderer.gl,Z=this._renderer.buffer,K=J.attributes;if(J.indexBuffer)Z.bind(J.indexBuffer);let W=null;for(let X in K){let H=K[X],q=H.buffer,Y=Z.getGlBuffer(q),N=$._attributeData[X];if(N){if(W!==Y)Z.bind(q),W=Y;let U=N.location;Q.enableVertexAttribArray(U);let V=q7(H.format),z=AV(H.format);if(N.format?.substring(1,4)==="int")Q.vertexAttribIPointer(U,V.size,z,H.stride,H.offset);else Q.vertexAttribPointer(U,V.size,z,V.normalised,H.stride,H.offset);if(H.instance)if(this.hasInstance){let D=H.divisor??1;Q.vertexAttribDivisor(U,D)}else throw Error("geometry error, GPU Instancing is not supported on this device")}}}draw(J,$,Q,Z){let{gl:K}=this._renderer,W=this._activeGeometry,X=i4[J||W.topology];if(Z??(Z=W.instanceCount),W.indexBuffer){let H=W.indexBuffer.data.BYTES_PER_ELEMENT,q=H===2?K.UNSIGNED_SHORT:K.UNSIGNED_INT;if(Z!==1)K.drawElementsInstanced(X,$||W.indexBuffer.data.length,q,(Q||0)*H,Z);else K.drawElements(X,$||W.indexBuffer.data.length,q,(Q||0)*H)}else if(Z!==1)K.drawArraysInstanced(X,Q||0,$||W.getSize(),Z);else K.drawArrays(X,Q||0,$||W.getSize());return this}unbind(){this.gl.bindVertexArray(null),this._activeVao=null,this._activeGeometry=null}destroy(){this._managedGeometries.destroy(),this._renderer=null,this.gl=null,this._activeVao=null,this._activeGeometry=null}}var i4;var EV=A(()=>{k0();CQ();x9();LV();_V();i4={"point-list":0,"line-list":1,"line-strip":3,"triangle-list":4,"triangle-strip":5};sQ.extension={type:[b.WebGLSystem],name:"geometry"}});var o4,YW=class J{constructor($){this.useBackBuffer=!1,this._useBackBufferThisRender=!1,this._renderer=$}init($={}){let{useBackBuffer:Q,antialias:Z}={...J.defaultOptions,...$};if(this.useBackBuffer=Q,this._antialias=Z,!this._renderer.context.supports.msaa)v0("antialiasing, is not supported on when using the back buffer"),this._antialias=!1;this._state=a6.for2d();let K=new L6({vertex:`
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
                }`,name:"big-triangle"});this._bigTriangleShader=new A6({glProgram:K,resources:{uTexture:P0.WHITE.source}})}renderStart($){let Q=this._renderer.renderTarget.getRenderTarget($.target);if(this._useBackBufferThisRender=this.useBackBuffer&&!!Q.isRoot,this._useBackBufferThisRender){let Z=this._renderer.renderTarget.getRenderTarget($.target);this._targetTexture=Z.colorTexture,$.target=this._getBackBufferTexture(Z.colorTexture)}}renderEnd(){this._presentBackBuffer()}_presentBackBuffer(){let $=this._renderer;if($.renderTarget.finishRenderPass(),!this._useBackBufferThisRender)return;$.renderTarget.bind(this._targetTexture,!1),this._bigTriangleShader.resources.uTexture=this._backBufferTexture.source,$.encoder.draw({geometry:o4,shader:this._bigTriangleShader,state:this._state})}_getBackBufferTexture($){return this._backBufferTexture=this._backBufferTexture||new P0({source:new $8({width:$.width,height:$.height,resolution:$._resolution,antialias:this._antialias})}),this._backBufferTexture.source.resize($.width,$.height,$._resolution),this._backBufferTexture}destroy(){if(this._backBufferTexture)this._backBufferTexture.destroy(),this._backBufferTexture=null}},PV;var jV=A(()=>{k0();s8();FQ();mJ();dJ();X6();i8();QJ();o4=new KJ({attributes:{aPosition:[-1,-1,3,-1,-1,3]}});YW.extension={type:[b.WebGLSystem],name:"backBuffer",priority:1};YW.defaultOptions={useBackBuffer:!1};PV=YW});class nQ{constructor(J){this._colorMaskCache=15,this._renderer=J}setMask(J){if(this._colorMaskCache===J)return;this._colorMaskCache=J,this._renderer.gl.colorMask(!!(J&8),!!(J&4),!!(J&2),!!(J&1))}}var SV=A(()=>{k0();nQ.extension={type:[b.WebGLSystem],name:"colorMask"}});class iQ{constructor(J){this.commandFinished=Promise.resolve(),this._renderer=J}setGeometry(J,$){this._renderer.geometry.bind(J,$.glProgram)}finishRenderPass(){}draw(J){let $=this._renderer,{geometry:Q,shader:Z,state:K,skipSync:W,topology:X,size:H,start:q,instanceCount:Y}=J;if($.shader.bind(Z,W),$.geometry.bind(Q,$.shader._activeProgram),K)$.state.set(K);$.geometry.draw(X,H,q,Y??Q.instanceCount)}destroy(){this._renderer=null}}var TV=A(()=>{k0();iQ.extension={type:[b.WebGLSystem],name:"encoder"}});class oQ{constructor(J){this._renderer=J}contextChange(){let J=this._renderer.gl;this.maxTextures=J.getParameter(J.MAX_TEXTURE_IMAGE_UNITS),this.maxBatchableTextures=wQ(this.maxTextures,J);let $=this._renderer.context.webGLVersion===2;this.maxUniformBindings=$?J.getParameter(J.MAX_UNIFORM_BUFFER_BINDINGS):0}destroy(){}}var yV=A(()=>{k0();C5();oQ.extension={type:[b.WebGLSystem],name:"limits"}});class NW{constructor(){this.width=-1,this.height=-1,this.msaa=!1,this._attachedMipLevel=0,this._attachedLayer=0,this.msaaRenderBuffer=[]}}var bV=()=>{};var v7;var vV=A(()=>{c9();v7=[];v7[j8.NONE]=void 0;v7[j8.DISABLED]={stencilWriteMask:0,stencilReadMask:0};v7[j8.RENDERING_MASK_ADD]={stencilFront:{compare:"equal",passOp:"increment-clamp"},stencilBack:{compare:"equal",passOp:"increment-clamp"}};v7[j8.RENDERING_MASK_REMOVE]={stencilFront:{compare:"equal",passOp:"decrement-clamp"},stencilBack:{compare:"equal",passOp:"decrement-clamp"}};v7[j8.MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"equal",passOp:"keep"},stencilBack:{compare:"equal",passOp:"keep"}};v7[j8.INVERSE_MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"not-equal",passOp:"keep"},stencilBack:{compare:"not-equal",passOp:"keep"}}});class aQ{constructor(J){this._stencilCache={enabled:!1,stencilReference:0,stencilMode:j8.NONE},this._renderTargetStencilState=Object.create(null),J.renderTarget.onRenderTargetChange.add(this)}contextChange(J){this._gl=J,this._comparisonFuncMapping={always:J.ALWAYS,never:J.NEVER,equal:J.EQUAL,"not-equal":J.NOTEQUAL,less:J.LESS,"less-equal":J.LEQUAL,greater:J.GREATER,"greater-equal":J.GEQUAL},this._stencilOpsMapping={keep:J.KEEP,zero:J.ZERO,replace:J.REPLACE,invert:J.INVERT,"increment-clamp":J.INCR,"decrement-clamp":J.DECR,"increment-wrap":J.INCR_WRAP,"decrement-wrap":J.DECR_WRAP},this.resetState()}onRenderTargetChange(J){if(this._activeRenderTarget===J)return;this._activeRenderTarget=J;let $=this._renderTargetStencilState[J.uid];if(!$)$=this._renderTargetStencilState[J.uid]={stencilMode:j8.DISABLED,stencilReference:0};this.setStencilMode($.stencilMode,$.stencilReference)}resetState(){this._stencilCache.enabled=!1,this._stencilCache.stencilMode=j8.NONE,this._stencilCache.stencilReference=0}setStencilMode(J,$){let Q=this._renderTargetStencilState[this._activeRenderTarget.uid],Z=this._gl,K=v7[J],W=this._stencilCache;if(Q.stencilMode=J,Q.stencilReference=$,J===j8.DISABLED){if(this._stencilCache.enabled)this._stencilCache.enabled=!1,Z.disable(Z.STENCIL_TEST);return}if(!this._stencilCache.enabled)this._stencilCache.enabled=!0,Z.enable(Z.STENCIL_TEST);if(J!==W.stencilMode||W.stencilReference!==$)W.stencilMode=J,W.stencilReference=$,Z.stencilFunc(this._comparisonFuncMapping[K.stencilBack.compare],$,255),Z.stencilOp(Z.KEEP,Z.KEEP,this._stencilOpsMapping[K.stencilBack.passOp])}}var fV=A(()=>{k0();vV();c9();aQ.extension={type:[b.WebGLSystem],name:"stencil"}});class UW{constructor(J){this._syncFunctionHash=Object.create(null),this._adaptor=J,this._systemCheck()}_systemCheck(){if(!DQ())throw Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}ensureUniformGroup(J){let $=this.getUniformGroupData(J);J.buffer||(J.buffer=new _6({data:new Float32Array($.layout.size/4),usage:I8.UNIFORM|I8.COPY_DST}))}getUniformGroupData(J){return this._syncFunctionHash[J._signature]||this._initUniformGroup(J)}_initUniformGroup(J){let $=J._signature,Q=this._syncFunctionHash[$];if(!Q){let Z=Object.keys(J.uniformStructures).map((X)=>J.uniformStructures[X]),K=this._adaptor.createUboElements(Z),W=this._generateUboSync(K.uboElements);Q=this._syncFunctionHash[$]={layout:K,syncFunction:W}}return this._syncFunctionHash[$]}_generateUboSync(J){return this._adaptor.generateUboSync(J)}syncUniformGroup(J,$,Q){let Z=this.getUniformGroupData(J);J.buffer||(J.buffer=new _6({data:new Float32Array(Z.layout.size/4),usage:I8.UNIFORM|I8.COPY_DST}));let K=null;if(!$)$=J.buffer.data,K=J.buffer.dataInt32;return Q||(Q=0),Z.syncFunction(J.uniforms,$,K,Q),!0}updateUniformGroup(J){if(J.isStatic&&!J._dirtyId)return!1;J._dirtyId=0;let $=this.syncUniformGroup(J);return J.buffer.update(),$}destroy(){this._syncFunctionHash=null}}var hV=A(()=>{R5();p9();lJ()});function xV(J){let $=J.map((W)=>({data:W,offset:0,size:0})),Q=16,Z=0,K=0;for(let W=0;W<$.length;W++){let X=$[W];if(Z=VW[X.data.type],!Z)throw Error(`Unknown type ${X.data.type}`);if(X.data.size>1)Z=Math.max(Z,16)*X.data.size;let H=Z===12?16:Z;X.size=Z;let q=K%16;if(q>0&&16-q<H)K+=(16-q)%16;else K+=(Z-q%Z)%Z;X.offset=K,K+=Z}return K=Math.ceil(K/16)*16,{uboElements:$,size:K}}var VW;var OW=A(()=>{VW={f32:4,i32:4,"vec2<f32>":8,"vec3<f32>":12,"vec4<f32>":16,"vec2<i32>":8,"vec3<i32>":12,"vec4<i32>":16,"mat2x2<f32>":32,"mat3x3<f32>":48,"mat4x4<f32>":64}});var U7;var FW=A(()=>{U7=[{type:"mat3x3<f32>",test:(J)=>{return J.value.a!==void 0},ubo:`
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
        `}]});function gV(J,$,Q,Z){let K=[`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `],W=0;for(let H=0;H<J.length;H++){let q=J[H],Y=q.data.name,N=!1,U=0;for(let V=0;V<U7.length;V++)if(U7[V].test(q.data)){U=q.offset/4,K.push(`name = "${Y}";`,`offset += ${U-W};`,U7[V][$]||U7[V].ubo),N=!0;break}if(!N)if(q.data.size>1)U=q.offset/4,K.push(Q(q,U-W));else{let V=Z[q.data.type];U=q.offset/4,K.push(`
                    v = uv.${Y};
                    offset += ${U-W};
                    ${V};
                `)}W=U}let X=K.join(`
`);return Function("uv","data","dataInt32","offset",X)}var pV=A(()=>{FW()});function oJ(J,$){return`
        for (let i = 0; i < ${J*$}; i++) {
            data[offset + (((i / ${J})|0) * 4) + (i % ${J})] = v[i];
        }
    `}var zW,_v;var mV=A(()=>{zW={f32:`
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
        }`,"mat3x2<f32>":oJ(3,2),"mat4x2<f32>":oJ(4,2),"mat2x3<f32>":oJ(2,3),"mat4x3<f32>":oJ(4,3),"mat2x4<f32>":oJ(2,4),"mat3x4<f32>":oJ(3,4)},_v={...zW,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `}});function dV(J,$){let Q=Math.max(VW[J.data.type]/16,1),Z=J.data.value.length/J.data.size,K=(4-Z%4)%4,W=J.data.type.indexOf("i32")>=0?"dataInt32":"data";return`
        v = uv.${J.data.name};
        offset += ${$};

        arrayOffset = offset;

        t = 0;

        for(var i=0; i < ${J.data.size*Q}; i++)
        {
            for(var j = 0; j < ${Z}; j++)
            {
                ${W}[arrayOffset++] = v[t++];
            }
            ${K!==0?`arrayOffset += ${K};`:""}
        }
    `}var lV=A(()=>{OW()});function cV(J){return gV(J,"uboStd40",dV,zW)}var uV=A(()=>{pV();mV();lV()});var rQ;var sV=A(()=>{k0();hV();OW();uV();rQ=class rQ extends UW{constructor(){super({createUboElements:xV,generateUboSync:cV})}};rQ.extension={type:[b.WebGLSystem],name:"ubo"}});class DW{constructor(){this._clearColorCache=[0,0,0,0],this._viewPortCache=new R8}init(J,$){this._renderer=J,this._renderTargetSystem=$,J.runners.contextChange.add(this)}contextChange(){this._clearColorCache=[0,0,0,0],this._viewPortCache=new R8;let J=this._renderer.gl;this._drawBuffersCache=[];for(let $=1;$<=16;$++)this._drawBuffersCache[$]=Array.from({length:$},(Q,Z)=>J.COLOR_ATTACHMENT0+Z)}copyToTexture(J,$,Q,Z,K){let W=this._renderTargetSystem,X=this._renderer,H=W.getGpuRenderTarget(J),q=X.gl;return this.finishRenderPass(J),q.bindFramebuffer(q.FRAMEBUFFER,H.resolveTargetFramebuffer),X.texture.bind($,0),q.copyTexSubImage2D(q.TEXTURE_2D,0,K.x,K.y,Q.x,Q.y,Z.width,Z.height),$}startRenderPass(J,$=!0,Q,Z,K=0,W=0){let X=this._renderTargetSystem,H=J.colorTexture,q=X.getGpuRenderTarget(J);if(W!==0&&this._renderer.context.webGLVersion<2)throw Error("[RenderTargetSystem] Rendering to array layers requires WebGL2.");if(K>0){if(q.msaa)throw Error("[RenderTargetSystem] Rendering to mip levels is not supported with MSAA render targets.");if(this._renderer.context.webGLVersion<2)throw Error("[RenderTargetSystem] Rendering to mip levels requires WebGL2.")}let Y=Z.y;if(J.isRoot)Y=H.pixelHeight-Z.height-Z.y;J.colorTextures.forEach((V)=>{this._renderer.texture.unbind(V)});let N=this._renderer.gl;if(N.bindFramebuffer(N.FRAMEBUFFER,q.framebuffer),!J.isRoot&&(q._attachedMipLevel!==K||q._attachedLayer!==W))J.colorTextures.forEach((V,z)=>{let D=this._renderer.texture.getGlSource(V);if(D.target===N.TEXTURE_2D){if(W!==0)throw Error("[RenderTargetSystem] layer must be 0 when rendering to 2D textures in WebGL.");N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+z,N.TEXTURE_2D,D.texture,K)}else if(D.target===N.TEXTURE_2D_ARRAY){if(this._renderer.context.webGLVersion<2)throw Error("[RenderTargetSystem] Rendering to 2D array textures requires WebGL2.");N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+z,D.texture,K,W)}else if(D.target===N.TEXTURE_CUBE_MAP){if(W<0||W>5)throw Error("[RenderTargetSystem] Cube map layer must be between 0 and 5.");N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+z,N.TEXTURE_CUBE_MAP_POSITIVE_X+W,D.texture,K)}else throw Error("[RenderTargetSystem] Unsupported texture target for render-to-layer in WebGL.")}),q._attachedMipLevel=K,q._attachedLayer=W;if(J.colorTextures.length>1)this._setDrawBuffers(J,N);let U=this._viewPortCache;if(U.x!==Z.x||U.y!==Y||U.width!==Z.width||U.height!==Z.height)U.x=Z.x,U.y=Y,U.width=Z.width,U.height=Z.height,N.viewport(Z.x,Y,Z.width,Z.height);if(!q.depthStencilRenderBuffer&&(J.stencil||J.depth))this._initStencil(q);this.clear(J,$,Q)}finishRenderPass(J){let Q=this._renderTargetSystem.getGpuRenderTarget(J);if(!Q.msaa)return;let Z=this._renderer.gl;Z.bindFramebuffer(Z.FRAMEBUFFER,Q.resolveTargetFramebuffer),Z.bindFramebuffer(Z.READ_FRAMEBUFFER,Q.framebuffer),Z.blitFramebuffer(0,0,Q.width,Q.height,0,0,Q.width,Q.height,Z.COLOR_BUFFER_BIT,Z.NEAREST),Z.bindFramebuffer(Z.FRAMEBUFFER,Q.framebuffer)}initGpuRenderTarget(J){let Q=this._renderer.gl,Z=new NW;if(Z._attachedMipLevel=0,Z._attachedLayer=0,J.colorTexture instanceof k6)return this._renderer.context.ensureCanvasSize(J.colorTexture.resource),Z.framebuffer=null,Z;return this._initColor(J,Z),Q.bindFramebuffer(Q.FRAMEBUFFER,null),Z}destroyGpuRenderTarget(J){let $=this._renderer.gl;if(J.framebuffer)$.deleteFramebuffer(J.framebuffer),J.framebuffer=null;if(J.resolveTargetFramebuffer)$.deleteFramebuffer(J.resolveTargetFramebuffer),J.resolveTargetFramebuffer=null;if(J.depthStencilRenderBuffer)$.deleteRenderbuffer(J.depthStencilRenderBuffer),J.depthStencilRenderBuffer=null;J.msaaRenderBuffer.forEach((Q)=>{$.deleteRenderbuffer(Q)}),J.msaaRenderBuffer=null}clear(J,$,Q,Z,K=0,W=0){if(!$)return;if(W!==0)throw Error("[RenderTargetSystem] Clearing array layers is not supported in WebGL renderer.");let X=this._renderTargetSystem;if(typeof $==="boolean")$=$?C6.ALL:C6.NONE;let H=this._renderer.gl;if($&C6.COLOR){Q??(Q=X.defaultClearColor);let q=this._clearColorCache,Y=Q;if(q[0]!==Y[0]||q[1]!==Y[1]||q[2]!==Y[2]||q[3]!==Y[3])q[0]=Y[0],q[1]=Y[1],q[2]=Y[2],q[3]=Y[3],H.clearColor(Y[0],Y[1],Y[2],Y[3])}H.clear($)}resizeGpuRenderTarget(J){if(J.isRoot)return;let Q=this._renderTargetSystem.getGpuRenderTarget(J);if(this._resizeColor(J,Q),J.stencil||J.depth)this._resizeStencil(Q)}_initColor(J,$){let Q=this._renderer,Z=Q.gl,K=Z.createFramebuffer();if($.resolveTargetFramebuffer=K,Z.bindFramebuffer(Z.FRAMEBUFFER,K),$.width=J.colorTexture.source.pixelWidth,$.height=J.colorTexture.source.pixelHeight,J.colorTextures.forEach((X,H)=>{let q=X.source;if(q.antialias)if(Q.context.supports.msaa)$.msaa=!0;else v0("[RenderTexture] Antialiasing on textures is not supported in WebGL1");Q.texture.bindSource(q,0);let Y=Q.texture.getGlSource(q),N=Y.texture;if(Y.target===Z.TEXTURE_2D)Z.framebufferTexture2D(Z.FRAMEBUFFER,Z.COLOR_ATTACHMENT0+H,Z.TEXTURE_2D,N,0);else if(Y.target===Z.TEXTURE_2D_ARRAY){if(Q.context.webGLVersion<2)throw Error("[RenderTargetSystem] TEXTURE_2D_ARRAY requires WebGL2.");Z.framebufferTextureLayer(Z.FRAMEBUFFER,Z.COLOR_ATTACHMENT0+H,N,0,0)}else if(Y.target===Z.TEXTURE_CUBE_MAP)Z.framebufferTexture2D(Z.FRAMEBUFFER,Z.COLOR_ATTACHMENT0+H,Z.TEXTURE_CUBE_MAP_POSITIVE_X,N,0);else throw Error("[RenderTargetSystem] Unsupported texture target for framebuffer attachment.")}),$.msaa){let X=Z.createFramebuffer();$.framebuffer=X,Z.bindFramebuffer(Z.FRAMEBUFFER,X),J.colorTextures.forEach((H,q)=>{let Y=Z.createRenderbuffer();$.msaaRenderBuffer[q]=Y})}else $.framebuffer=K;this._resizeColor(J,$)}_resizeColor(J,$){let Q=J.colorTexture.source;if($.width=Q.pixelWidth,$.height=Q.pixelHeight,$._attachedMipLevel=0,$._attachedLayer=0,J.colorTextures.forEach((Z,K)=>{if(K===0)return;Z.source.resize(Q.width,Q.height,Q._resolution)}),$.msaa){let Z=this._renderer,K=Z.gl,W=$.framebuffer;K.bindFramebuffer(K.FRAMEBUFFER,W),J.colorTextures.forEach((X,H)=>{let q=X.source;Z.texture.bindSource(q,0);let N=Z.texture.getGlSource(q).internalFormat,U=$.msaaRenderBuffer[H];K.bindRenderbuffer(K.RENDERBUFFER,U),K.renderbufferStorageMultisample(K.RENDERBUFFER,4,N,q.pixelWidth,q.pixelHeight),K.framebufferRenderbuffer(K.FRAMEBUFFER,K.COLOR_ATTACHMENT0+H,K.RENDERBUFFER,U)})}}_initStencil(J){if(J.framebuffer===null)return;let $=this._renderer.gl,Q=$.createRenderbuffer();J.depthStencilRenderBuffer=Q,$.bindRenderbuffer($.RENDERBUFFER,Q),$.framebufferRenderbuffer($.FRAMEBUFFER,$.DEPTH_STENCIL_ATTACHMENT,$.RENDERBUFFER,Q),this._resizeStencil(J)}_resizeStencil(J){let $=this._renderer.gl;if($.bindRenderbuffer($.RENDERBUFFER,J.depthStencilRenderBuffer),J.msaa)$.renderbufferStorageMultisample($.RENDERBUFFER,4,$.DEPTH24_STENCIL8,J.width,J.height);else $.renderbufferStorage($.RENDERBUFFER,this._renderer.context.webGLVersion===2?$.DEPTH24_STENCIL8:$.DEPTH_STENCIL,J.width,J.height)}prerender(J){let $=J.colorTexture.resource;if(this._renderer.context.multiView&&k6.test($))this._renderer.context.ensureCanvasSize($)}postrender(J){if(!this._renderer.context.multiView)return;if(k6.test(J.colorTexture.resource)){let $=this._renderer.context.canvas,Q=J.colorTexture;Q.context2D.drawImage($,0,Q.pixelHeight-$.height)}}_setDrawBuffers(J,$){let Q=J.colorTextures.length,Z=this._drawBuffersCache[Q];if(this._renderer.context.webGLVersion===1){let K=this._renderer.context.extensions.drawBuffers;if(!K)v0("[RenderTexture] This WebGL1 context does not support rendering to multiple targets");else K.drawBuffersWEBGL(Z)}else $.drawBuffers(Z)}}var nV=A(()=>{E7();s8();f9();d9();bV()});var tQ;var iV=A(()=>{k0();DV();nV();tQ=class tQ extends XW{constructor(J){super(J);this.adaptor=new DW,this.adaptor.init(J,this)}};tQ.extension={type:[b.WebGLSystem],name:"renderTarget"}});var Q$;var kW=A(()=>{O6();W6();Q$=class Q$ extends C8{constructor({buffer:J,offset:$,size:Q}){super();this.uid=i0("buffer"),this._resourceType="bufferResource",this._touched=0,this._resourceId=i0("resource"),this._bufferResource=!0,this.destroyed=!1,this.buffer=J,this.offset=$|0,this.size=Q,this.buffer.on("change",this.onBufferChange,this)}onBufferChange(){this._resourceId=i0("resource"),this.emit("change",this)}destroy(J=!1){if(this.destroyed=!0,J)this.buffer.destroy();this.emit("change",this),this.buffer=null,this.removeAllListeners()}}});function oV(J,$){let Q=[],Z=[`
        var g = s.groups;
        var sS = r.shader;
        var p = s.glProgram;
        var ugS = r.uniformGroup;
        var resources;
    `],K=!1,W=0,X=$._getProgramData(J.glProgram);for(let q in J.groups){let Y=J.groups[q];Q.push(`
            resources = g[${q}].resources;
        `);for(let N in Y.resources){let U=Y.resources[N];if(U instanceof o8)if(U.ubo){let V=J._uniformBindMap[q][Number(N)];Q.push(`
                        sS.bindUniformBlock(
                            resources[${N}],
                            '${V}',
                            ${J.glProgram._uniformBlockData[V].index}
                        );
                    `)}else Q.push(`
                        ugS.updateUniformGroup(resources[${N}], p, sD);
                    `);else if(U instanceof Q$){let V=J._uniformBindMap[q][Number(N)];Q.push(`
                    sS.bindUniformBlock(
                        resources[${N}],
                        '${V}',
                        ${J.glProgram._uniformBlockData[V].index}
                    );
                `)}else if(U instanceof $8){let V=J._uniformBindMap[q][N],z=X.uniformData[V];if(z){if(!K)K=!0,Z.push(`
                        var tS = r.texture;
                        `);$._gl.uniform1i(z.location,W),Q.push(`
                        tS.bind(resources[${N}], ${W});
                    `),W++}}}}let H=[...Z,...Q].join(`
`);return Function("r","s","sD",H)}var aV=A(()=>{kW();N7();X6()});class IW{constructor(J,$){this.program=J,this.uniformData=$,this.uniformGroups={},this.uniformDirtyGroups={},this.uniformBlockBindings={}}destroy(){this.uniformData=null,this.uniformGroups=null,this.uniformDirtyGroups=null,this.uniformBlockBindings=null,this.program=null}}var rV=()=>{};function wW(J,$,Q){let Z=J.createShader($);return J.shaderSource(Z,Q),J.compileShader(Z),Z}var tV=()=>{};function MW(J){let $=Array(J);for(let Q=0;Q<$.length;Q++)$[Q]=!1;return $}function eQ(J,$){switch(J){case"float":return 0;case"vec2":return new Float32Array(2*$);case"vec3":return new Float32Array(3*$);case"vec4":return new Float32Array(4*$);case"int":case"uint":case"sampler2D":case"sampler2DArray":return 0;case"ivec2":return new Int32Array(2*$);case"ivec3":return new Int32Array(3*$);case"ivec4":return new Int32Array(4*$);case"uvec2":return new Uint32Array(2*$);case"uvec3":return new Uint32Array(3*$);case"uvec4":return new Uint32Array(4*$);case"bool":return!1;case"bvec2":return MW(2*$);case"bvec3":return MW(3*$);case"bvec4":return MW(4*$);case"mat2":return new Float32Array([1,0,0,1]);case"mat3":return new Float32Array([1,0,0,0,1,0,0,0,1]);case"mat4":return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}return null}var GW=()=>{};function RW(J,$){if(!JZ){let Q=Object.keys(eV);JZ={};for(let Z=0;Z<Q.length;++Z){let K=Q[Z];JZ[J[K]]=eV[K]}}return JZ[$]}function JO(J,$){let Q=RW(J,$);return a4[Q]||"float32"}var JZ=null,eV,a4;var LW=A(()=>{eV={FLOAT:"float",FLOAT_VEC2:"vec2",FLOAT_VEC3:"vec3",FLOAT_VEC4:"vec4",INT:"int",INT_VEC2:"ivec2",INT_VEC3:"ivec3",INT_VEC4:"ivec4",UNSIGNED_INT:"uint",UNSIGNED_INT_VEC2:"uvec2",UNSIGNED_INT_VEC3:"uvec3",UNSIGNED_INT_VEC4:"uvec4",BOOL:"bool",BOOL_VEC2:"bvec2",BOOL_VEC3:"bvec3",BOOL_VEC4:"bvec4",FLOAT_MAT2:"mat2",FLOAT_MAT3:"mat3",FLOAT_MAT4:"mat4",SAMPLER_2D:"sampler2D",INT_SAMPLER_2D:"sampler2D",UNSIGNED_INT_SAMPLER_2D:"sampler2D",SAMPLER_CUBE:"samplerCube",INT_SAMPLER_CUBE:"samplerCube",UNSIGNED_INT_SAMPLER_CUBE:"samplerCube",SAMPLER_2D_ARRAY:"sampler2DArray",INT_SAMPLER_2D_ARRAY:"sampler2DArray",UNSIGNED_INT_SAMPLER_2D_ARRAY:"sampler2DArray"},a4={float:"float32",vec2:"float32x2",vec3:"float32x3",vec4:"float32x4",int:"sint32",ivec2:"sint32x2",ivec3:"sint32x3",ivec4:"sint32x4",uint:"uint32",uvec2:"uint32x2",uvec3:"uint32x3",uvec4:"uint32x4",bool:"uint32",bvec2:"uint32x2",bvec3:"uint32x3",bvec4:"uint32x4"}});function $O(J,$,Q=!1){let Z={},K=$.getProgramParameter(J,$.ACTIVE_ATTRIBUTES);for(let X=0;X<K;X++){let H=$.getActiveAttrib(J,X);if(H.name.startsWith("gl_"))continue;let q=JO($,H.type);Z[H.name]={location:0,format:q,stride:q7(q).stride,offset:0,instance:!1,start:0}}let W=Object.keys(Z);if(Q){W.sort((X,H)=>X>H?1:-1);for(let X=0;X<W.length;X++)Z[W[X]].location=X,$.bindAttribLocation(J,X,W[X]);$.linkProgram(J)}else for(let X=0;X<W.length;X++)Z[W[X]].location=$.getAttribLocation(J,W[X]);return Z}var QO=A(()=>{x9();LW()});function ZO(J,$){if(!$.ACTIVE_UNIFORM_BLOCKS)return{};let Q={},Z=$.getProgramParameter(J,$.ACTIVE_UNIFORM_BLOCKS);for(let K=0;K<Z;K++){let W=$.getActiveUniformBlockName(J,K),X=$.getUniformBlockIndex(J,W),H=$.getActiveUniformBlockParameter(J,K,$.UNIFORM_BLOCK_DATA_SIZE);Q[W]={name:W,index:X,size:H}}return Q}var KO=()=>{};function WO(J,$){let Q={},Z=$.getProgramParameter(J,$.ACTIVE_UNIFORMS);for(let K=0;K<Z;K++){let W=$.getActiveUniform(J,K),X=W.name.replace(/\[.*?\]$/,""),H=!!W.name.match(/\[.*?\]$/),q=RW($,W.type);Q[X]={name:X,index:K,type:q,size:W.size,isArray:H,value:eQ(q,W.size)}}return Q}var XO=A(()=>{GW();LW()});function HO(J,$){let Q=J.getShaderSource($).split(`
`).map((Y,N)=>`${N}: ${Y}`),Z=J.getShaderInfoLog($),K=Z.split(`
`),W={},X=K.map((Y)=>parseFloat(Y.replace(/^ERROR\: 0\:([\d]+)\:.*$/,"$1"))).filter((Y)=>{if(Y&&!W[Y])return W[Y]=!0,!0;return!1}),H=[""];X.forEach((Y)=>{Q[Y-1]=`%c${Q[Y-1]}%c`,H.push("background: #FF0000; color:#FFFFFF; font-size: 10px","font-size: 10px")});let q=Q.join(`
`);H[0]=q,console.error(Z),console.groupCollapsed("click to view full shader code"),console.warn(...H),console.groupEnd()}function qO(J,$,Q,Z){if(!J.getProgramParameter($,J.LINK_STATUS)){if(!J.getShaderParameter(Q,J.COMPILE_STATUS))HO(J,Q);if(!J.getShaderParameter(Z,J.COMPILE_STATUS))HO(J,Z);if(console.error("PixiJS Error: Could not initialize shader."),J.getProgramInfoLog($)!=="")console.warn("PixiJS Warning: gl.getProgramInfoLog()",J.getProgramInfoLog($))}}var YO=()=>{};function NO(J,$){let Q=wW(J,J.VERTEX_SHADER,$.vertex),Z=wW(J,J.FRAGMENT_SHADER,$.fragment),K=J.createProgram();J.attachShader(K,Q),J.attachShader(K,Z);let W=$.transformFeedbackVaryings;if(W)if(typeof J.transformFeedbackVaryings!=="function")v0("TransformFeedback is not supported but TransformFeedbackVaryings are given.");else J.transformFeedbackVaryings(K,W.names,W.bufferMode==="separate"?J.SEPARATE_ATTRIBS:J.INTERLEAVED_ATTRIBS);if(J.linkProgram(K),!J.getProgramParameter(K,J.LINK_STATUS))qO(J,K,Q,Z);$._attributeData=$O(K,J,!/^[ \t]*#[ \t]*version[ \t]+300[ \t]+es[ \t]*$/m.test($.vertex)),$._uniformData=WO(K,J),$._uniformBlockData=ZO(K,J),J.deleteShader(Q),J.deleteShader(Z);let X={};for(let q in $._uniformData){let Y=$._uniformData[q];X[q]={location:J.getUniformLocation(K,q),value:eQ(Y.type,Y.size)}}return new IW(K,X)}var UO=A(()=>{s8();rV();tV();GW();QO();KO();XO();YO()});class QZ{constructor(J){this._activeProgram=null,this._programDataHash=Object.create(null),this._shaderSyncFunctions=Object.create(null),this._renderer=J}contextChange(J){this._gl=J,this._programDataHash=Object.create(null),this._shaderSyncFunctions=Object.create(null),this._activeProgram=null}bind(J,$){if(this._setProgram(J.glProgram),$)return;$Z.textureCount=0,$Z.blockIndex=0;let Q=this._shaderSyncFunctions[J.glProgram._key];if(!Q)Q=this._shaderSyncFunctions[J.glProgram._key]=this._generateShaderSync(J,this);this._renderer.buffer.nextBindBase(!!J.glProgram.transformFeedbackVaryings),Q(this._renderer,J,$Z)}updateUniformGroup(J){this._renderer.uniformGroup.updateUniformGroup(J,this._activeProgram,$Z)}bindUniformBlock(J,$,Q=0){let Z=this._renderer.buffer,K=this._getProgramData(this._activeProgram),W=J._bufferResource;if(!W)this._renderer.ubo.updateUniformGroup(J);let X=J.buffer,H=Z.updateBuffer(X),q=Z.freeLocationForBufferBase(H);if(W){let{offset:N,size:U}=J;if(N===0&&U===X.data.byteLength)Z.bindBufferBase(H,q);else Z.bindBufferRange(H,q,N)}else if(Z.getLastBindBaseLocation(H)!==q)Z.bindBufferBase(H,q);let Y=this._activeProgram._uniformBlockData[$].index;if(K.uniformBlockBindings[Q]===q)return;K.uniformBlockBindings[Q]=q,this._renderer.gl.uniformBlockBinding(K.program,Y,q)}_setProgram(J){if(this._activeProgram===J)return;this._activeProgram=J;let $=this._getProgramData(J);this._gl.useProgram($.program)}_getProgramData(J){return this._programDataHash[J._key]||this._createProgramData(J)}_createProgramData(J){let $=J._key;return this._programDataHash[$]=NO(this._gl,J),this._programDataHash[$]}destroy(){for(let J of Object.keys(this._programDataHash))this._programDataHash[J].destroy();this._programDataHash=null,this._shaderSyncFunctions=null,this._activeProgram=null,this._renderer=null,this._gl=null}_generateShaderSync(J,$){return oV(J,$)}resetState(){this._activeProgram=null}}var $Z;var VO=A(()=>{k0();aV();UO();$Z={textureCount:0,blockIndex:0};QZ.extension={type:[b.WebGLSystem],name:"shader"}});var OO,FO;var zO=A(()=>{OO={f32:`if (cv !== v) {
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
        }`,"mat2x2<f32>":"gl.uniformMatrix2fv(location, false, v);","mat3x3<f32>":"gl.uniformMatrix3fv(location, false, v);","mat4x4<f32>":"gl.uniformMatrix4fv(location, false, v);"},FO={f32:"gl.uniform1fv(location, v);","vec2<f32>":"gl.uniform2fv(location, v);","vec3<f32>":"gl.uniform3fv(location, v);","vec4<f32>":"gl.uniform4fv(location, v);","mat2x2<f32>":"gl.uniformMatrix2fv(location, false, v);","mat3x3<f32>":"gl.uniformMatrix3fv(location, false, v);","mat4x4<f32>":"gl.uniformMatrix4fv(location, false, v);",i32:"gl.uniform1iv(location, v);","vec2<i32>":"gl.uniform2iv(location, v);","vec3<i32>":"gl.uniform3iv(location, v);","vec4<i32>":"gl.uniform4iv(location, v);",u32:"gl.uniform1iv(location, v);","vec2<u32>":"gl.uniform2iv(location, v);","vec3<u32>":"gl.uniform3iv(location, v);","vec4<u32>":"gl.uniform4iv(location, v);",bool:"gl.uniform1iv(location, v);","vec2<bool>":"gl.uniform2iv(location, v);","vec3<bool>":"gl.uniform3iv(location, v);","vec4<bool>":"gl.uniform4iv(location, v);"}});function DO(J,$){let Q=[`
        var v = null;
        var cv = null;
        var cu = null;
        var t = 0;
        var gl = renderer.gl;
        var name = null;
    `];for(let Z in J.uniforms){if(!$[Z]){if(J.uniforms[Z]instanceof o8)if(J.uniforms[Z].ubo)Q.push(`
                        renderer.shader.bindUniformBlock(uv.${Z}, "${Z}");
                    `);else Q.push(`
                        renderer.shader.updateUniformGroup(uv.${Z});
                    `);else if(J.uniforms[Z]instanceof Q$)Q.push(`
                        renderer.shader.bindBufferResource(uv.${Z}, "${Z}");
                    `);continue}let K=J.uniformStructures[Z],W=!1;for(let X=0;X<U7.length;X++){let H=U7[X];if(K.type===H.type&&H.test(K)){Q.push(`name = "${Z}";`,U7[X].uniform),W=!0;break}}if(!W){let H=(K.size===1?OO:FO)[K.type].replace("location",`ud["${Z}"].location`);Q.push(`
            cu = ud["${Z}"];
            cv = cu.value;
            v = uv["${Z}"];
            ${H};`)}}return Function("ud","uv","renderer","syncData",Q.join(`
`))}var kO=A(()=>{kW();N7();FW();zO()});class ZZ{constructor(J){this._cache={},this._uniformGroupSyncHash={},this._renderer=J,this.gl=null,this._cache={}}contextChange(J){this.gl=J}updateUniformGroup(J,$,Q){let Z=this._renderer.shader._getProgramData($);if(!J.isStatic||J._dirtyId!==Z.uniformDirtyGroups[J.uid])Z.uniformDirtyGroups[J.uid]=J._dirtyId,this._getUniformSyncFunction(J,$)(Z.uniformData,J.uniforms,this._renderer,Q)}_getUniformSyncFunction(J,$){return this._uniformGroupSyncHash[J._signature]?.[$._key]||this._createUniformSyncFunction(J,$)}_createUniformSyncFunction(J,$){let Q=this._uniformGroupSyncHash[J._signature]||(this._uniformGroupSyncHash[J._signature]={}),Z=this._getSignature(J,$._uniformData,"u");if(!this._cache[Z])this._cache[Z]=this._generateUniformsSync(J,$._uniformData);return Q[$._key]=this._cache[Z],Q[$._key]}_generateUniformsSync(J,$){return DO(J,$)}_getSignature(J,$,Q){let Z=J.uniforms,K=[`${Q}-`];for(let W in Z)if(K.push(W),$[W])K.push($[W].type);return K.join("-")}destroy(){this._renderer=null,this._cache=null}}var IO=A(()=>{k0();kO();ZZ.extension={type:[b.WebGLSystem],name:"uniformGroup"}});function wO(J){let $={};if($.normal=[J.ONE,J.ONE_MINUS_SRC_ALPHA],$.add=[J.ONE,J.ONE],$.multiply=[J.DST_COLOR,J.ONE_MINUS_SRC_ALPHA,J.ONE,J.ONE_MINUS_SRC_ALPHA],$.screen=[J.ONE,J.ONE_MINUS_SRC_COLOR,J.ONE,J.ONE_MINUS_SRC_ALPHA],$.none=[0,0],$["normal-npm"]=[J.SRC_ALPHA,J.ONE_MINUS_SRC_ALPHA,J.ONE,J.ONE_MINUS_SRC_ALPHA],$["add-npm"]=[J.SRC_ALPHA,J.ONE,J.ONE,J.ONE],$["screen-npm"]=[J.SRC_ALPHA,J.ONE_MINUS_SRC_COLOR,J.ONE,J.ONE_MINUS_SRC_ALPHA],$.erase=[J.ZERO,J.ONE_MINUS_SRC_ALPHA],!(J instanceof F8.get().getWebGLRenderingContext()))$.min=[J.ONE,J.ONE,J.ONE,J.ONE,J.MIN,J.MIN],$.max=[J.ONE,J.ONE,J.ONE,J.ONE,J.MAX,J.MAX];else{let Z=J.getExtension("EXT_blend_minmax");if(Z)$.min=[J.ONE,J.ONE,J.ONE,J.ONE,Z.MIN_EXT,Z.MIN_EXT],$.max=[J.ONE,J.ONE,J.ONE,J.ONE,Z.MAX_EXT,Z.MAX_EXT]}return $}var MO=A(()=>{D6()});var r4=0,t4=1,e4=2,Jk=3,$k=4,Qk=5,GO=class J{constructor($){this._invertFrontFace=!1,this.gl=null,this.stateId=0,this.polygonOffset=0,this.blendMode="none",this._blendEq=!1,this.map=[],this.map[r4]=this.setBlend,this.map[t4]=this.setOffset,this.map[e4]=this.setCullFace,this.map[Jk]=this.setDepthTest,this.map[$k]=this.setFrontFace,this.map[Qk]=this.setDepthMask,this.checks=[],this.defaultState=a6.for2d(),$.renderTarget.onRenderTargetChange.add(this)}onRenderTargetChange($){if(this._invertFrontFace=!$.isRoot,this._cullFace)this.setFrontFace(this._frontFace);else this._frontFaceDirty=!0}contextChange($){this.gl=$,this.blendModesMap=wO($),this.resetState()}set($){if($||($=this.defaultState),this.stateId!==$.data){let Q=this.stateId^$.data,Z=0;while(Q){if(Q&1)this.map[Z].call(this,!!($.data&1<<Z));Q>>=1,Z++}this.stateId=$.data}for(let Q=0;Q<this.checks.length;Q++)this.checks[Q](this,$)}forceState($){$||($=this.defaultState);for(let Q=0;Q<this.map.length;Q++)this.map[Q].call(this,!!($.data&1<<Q));for(let Q=0;Q<this.checks.length;Q++)this.checks[Q](this,$);this.stateId=$.data}setBlend($){this._updateCheck(J._checkBlendMode,$),this.gl[$?"enable":"disable"](this.gl.BLEND)}setOffset($){this._updateCheck(J._checkPolygonOffset,$),this.gl[$?"enable":"disable"](this.gl.POLYGON_OFFSET_FILL)}setDepthTest($){this.gl[$?"enable":"disable"](this.gl.DEPTH_TEST)}setDepthMask($){this.gl.depthMask($)}setCullFace($){if(this._cullFace=$,this.gl[$?"enable":"disable"](this.gl.CULL_FACE),this._cullFace&&this._frontFaceDirty)this.setFrontFace(this._frontFace)}setFrontFace($){this._frontFace=$,this._frontFaceDirty=!1;let Q=this._invertFrontFace?!$:$;if(this._glFrontFace!==Q)this._glFrontFace=Q,this.gl.frontFace(this.gl[Q?"CW":"CCW"])}setBlendMode($){if(!this.blendModesMap[$])$="normal";if($===this.blendMode)return;this.blendMode=$;let Q=this.blendModesMap[$],Z=this.gl;if(Q.length===2)Z.blendFunc(Q[0],Q[1]);else Z.blendFuncSeparate(Q[0],Q[1],Q[2],Q[3]);if(Q.length===6)this._blendEq=!0,Z.blendEquationSeparate(Q[4],Q[5]);else if(this._blendEq)this._blendEq=!1,Z.blendEquationSeparate(Z.FUNC_ADD,Z.FUNC_ADD)}setPolygonOffset($,Q){this.gl.polygonOffset($,Q)}resetState(){this._glFrontFace=!1,this._frontFace=!1,this._cullFace=!1,this._frontFaceDirty=!1,this._invertFrontFace=!1,this.gl.frontFace(this.gl.CCW),this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,!1),this.forceState(this.defaultState),this._blendEq=!0,this.blendMode="",this.setBlendMode("normal")}_updateCheck($,Q){let Z=this.checks.indexOf($);if(Q&&Z===-1)this.checks.push($);else if(!Q&&Z!==-1)this.checks.splice(Z,1)}static _checkBlendMode($,Q){$.setBlendMode(Q.blendMode)}static _checkPolygonOffset($,Q){$.setPolygonOffset(1,Q.polygonOffset)}destroy(){this.gl=null,this.checks.length=0}},RO;var LO=A(()=>{k0();dJ();MO();GO.extension={type:[b.WebGLSystem],name:"state"};RO=GO});class BW{constructor(J){this.target=$$.TEXTURE_2D,this._layerInitMask=0,this.texture=J,this.width=-1,this.height=-1,this.type=o0.UNSIGNED_BYTE,this.internalFormat=cQ.RGBA,this.format=cQ.RGBA,this.samplerType=0}destroy(){}}var BO=A(()=>{uQ()});var AO;var _O=A(()=>{AO={id:"buffer",upload(J,$,Q,Z,K,W=!1){let X=K||$.target;if(!W&&($.width===J.width&&$.height===J.height))Q.texSubImage2D(X,0,0,0,J.width,J.height,$.format,$.type,J.resource);else Q.texImage2D(X,0,$.internalFormat,J.width,J.height,0,$.format,$.type,J.resource);$.width=J.width,$.height=J.height}}});var Zk,CO;var EO=A(()=>{Zk={"bc1-rgba-unorm":!0,"bc1-rgba-unorm-srgb":!0,"bc2-rgba-unorm":!0,"bc2-rgba-unorm-srgb":!0,"bc3-rgba-unorm":!0,"bc3-rgba-unorm-srgb":!0,"bc4-r-unorm":!0,"bc4-r-snorm":!0,"bc5-rg-unorm":!0,"bc5-rg-snorm":!0,"bc6h-rgb-ufloat":!0,"bc6h-rgb-float":!0,"bc7-rgba-unorm":!0,"bc7-rgba-unorm-srgb":!0,"etc2-rgb8unorm":!0,"etc2-rgb8unorm-srgb":!0,"etc2-rgb8a1unorm":!0,"etc2-rgb8a1unorm-srgb":!0,"etc2-rgba8unorm":!0,"etc2-rgba8unorm-srgb":!0,"eac-r11unorm":!0,"eac-r11snorm":!0,"eac-rg11unorm":!0,"eac-rg11snorm":!0,"astc-4x4-unorm":!0,"astc-4x4-unorm-srgb":!0,"astc-5x4-unorm":!0,"astc-5x4-unorm-srgb":!0,"astc-5x5-unorm":!0,"astc-5x5-unorm-srgb":!0,"astc-6x5-unorm":!0,"astc-6x5-unorm-srgb":!0,"astc-6x6-unorm":!0,"astc-6x6-unorm-srgb":!0,"astc-8x5-unorm":!0,"astc-8x5-unorm-srgb":!0,"astc-8x6-unorm":!0,"astc-8x6-unorm-srgb":!0,"astc-8x8-unorm":!0,"astc-8x8-unorm-srgb":!0,"astc-10x5-unorm":!0,"astc-10x5-unorm-srgb":!0,"astc-10x6-unorm":!0,"astc-10x6-unorm-srgb":!0,"astc-10x8-unorm":!0,"astc-10x8-unorm-srgb":!0,"astc-10x10-unorm":!0,"astc-10x10-unorm-srgb":!0,"astc-12x10-unorm":!0,"astc-12x10-unorm-srgb":!0,"astc-12x12-unorm":!0,"astc-12x12-unorm-srgb":!0},CO={id:"compressed",upload(J,$,Q,Z,K,W){let X=K??$.target;Q.pixelStorei(Q.UNPACK_ALIGNMENT,4);let{pixelWidth:H,pixelHeight:q}=J,Y=!!Zk[J.format];for(let N=0;N<J.resource.length;N++){let U=J.resource[N];if(Y)Q.compressedTexImage2D(X,N,$.internalFormat,H,q,0,U);else Q.texImage2D(X,N,$.internalFormat,H,q,0,$.format,$.type,U);H=Math.max(H>>1,1),q=Math.max(q>>1,1)}}}});function jO(J){return{id:"cube",upload($,Q,Z,K){let W=$.faces;for(let X=0;X<PO.length;X++){let H=PO[X],q=W[H];(J[q.uploadMethodId]||J.image).upload(q,Q,Z,K,$$.TEXTURE_CUBE_MAP_POSITIVE_X+X,(Q._layerInitMask&1<<X)===0),Q._layerInitMask|=1<<X}Q.width=$.pixelWidth,Q.height=$.pixelHeight}}}var PO;var SO=A(()=>{uQ();PO=["right","left","top","bottom","front","back"]});function Kk(J,$,Q,Z,K,W,X,H,q,Y){if(!Y){if(q)J.texImage2D($,0,Q.internalFormat,Z,K,0,Q.format,Q.type,null);J.texSubImage2D($,0,0,0,W,X,Q.format,Q.type,H);return}if(!q){J.texSubImage2D($,0,0,0,Q.format,Q.type,H);return}J.texImage2D($,0,Q.internalFormat,Z,K,0,Q.format,Q.type,H)}function Wk(J,$,Q,Z,K,W,X,H,q,Y){if(!Y){if(q)J.texImage2D($,0,Q.internalFormat,Z,K,0,Q.format,Q.type,null);J.texSubImage2D($,0,0,0,Q.format,Q.type,H);return}if(!q){J.texSubImage2D($,0,0,0,Q.format,Q.type,H);return}J.texImage2D($,0,Q.internalFormat,Q.format,Q.type,H)}var KZ;var AW=A(()=>{KZ={id:"image",upload(J,$,Q,Z,K,W=!1){let X=K||$.target,H=J.pixelWidth,q=J.pixelHeight,Y=J.resourceWidth,N=J.resourceHeight,U=Z===2,V=W||$.width!==H||$.height!==q,z=Y>=H&&N>=q,D=J.resource;(U?Kk:Wk)(Q,X,$,H,q,Y,N,D,V,z),$.width=H,$.height=q}}});var Xk,TO;var yO=A(()=>{wU();AW();Xk=IU(),TO={id:"video",upload(J,$,Q,Z,K,W=Xk){if(!J.isValid){let X=K??$.target;Q.texImage2D(X,0,$.internalFormat,1,1,0,$.format,$.type,null);return}KZ.upload(J,$,Q,Z,K,W)}}});var _W,bO,WZ,vO;var fO=A(()=>{_W={linear:9729,nearest:9728},bO={linear:{linear:9987,nearest:9985},nearest:{linear:9986,nearest:9984}},WZ={"clamp-to-edge":33071,repeat:10497,"mirror-repeat":33648},vO={never:512,less:513,equal:514,"less-equal":515,greater:516,"not-equal":517,"greater-equal":518,always:519}});function CW(J,$,Q,Z,K,W,X,H){let q=W;if(!H||J.addressModeU!=="repeat"||J.addressModeV!=="repeat"||J.addressModeW!=="repeat"){let Y=WZ[X?"clamp-to-edge":J.addressModeU],N=WZ[X?"clamp-to-edge":J.addressModeV],U=WZ[X?"clamp-to-edge":J.addressModeW];if($[K](q,$.TEXTURE_WRAP_S,Y),$[K](q,$.TEXTURE_WRAP_T,N),$.TEXTURE_WRAP_R)$[K](q,$.TEXTURE_WRAP_R,U)}if(!H||J.magFilter!=="linear")$[K](q,$.TEXTURE_MAG_FILTER,_W[J.magFilter]);if(Q){if(!H||J.mipmapFilter!=="linear"){let Y=bO[J.minFilter][J.mipmapFilter];$[K](q,$.TEXTURE_MIN_FILTER,Y)}}else $[K](q,$.TEXTURE_MIN_FILTER,_W[J.minFilter]);if(Z&&J.maxAnisotropy>1){let Y=Math.min(J.maxAnisotropy,$.getParameter(Z.MAX_TEXTURE_MAX_ANISOTROPY_EXT));$[K](q,Z.TEXTURE_MAX_ANISOTROPY_EXT,Y)}if(J.compare)$[K](q,$.TEXTURE_COMPARE_FUNC,vO[J.compare])}var hO=A(()=>{fO()});function xO(J){return{r8unorm:J.RED,r8snorm:J.RED,r8uint:J.RED,r8sint:J.RED,r16uint:J.RED,r16sint:J.RED,r16float:J.RED,rg8unorm:J.RG,rg8snorm:J.RG,rg8uint:J.RG,rg8sint:J.RG,r32uint:J.RED,r32sint:J.RED,r32float:J.RED,rg16uint:J.RG,rg16sint:J.RG,rg16float:J.RG,rgba8unorm:J.RGBA,"rgba8unorm-srgb":J.RGBA,rgba8snorm:J.RGBA,rgba8uint:J.RGBA,rgba8sint:J.RGBA,bgra8unorm:J.RGBA,"bgra8unorm-srgb":J.RGBA,rgb9e5ufloat:J.RGB,rgb10a2unorm:J.RGBA,rg11b10ufloat:J.RGB,rg32uint:J.RG,rg32sint:J.RG,rg32float:J.RG,rgba16uint:J.RGBA,rgba16sint:J.RGBA,rgba16float:J.RGBA,rgba32uint:J.RGBA,rgba32sint:J.RGBA,rgba32float:J.RGBA,stencil8:J.STENCIL_INDEX8,depth16unorm:J.DEPTH_COMPONENT,depth24plus:J.DEPTH_COMPONENT,"depth24plus-stencil8":J.DEPTH_STENCIL,depth32float:J.DEPTH_COMPONENT,"depth32float-stencil8":J.DEPTH_STENCIL}}var gO=()=>{};function pO(J,$){let Q={},Z=J.RGBA;if(!(J instanceof F8.get().getWebGLRenderingContext()))Q={"rgba8unorm-srgb":J.SRGB8_ALPHA8,"bgra8unorm-srgb":J.SRGB8_ALPHA8},Z=J.RGBA8;else if($.srgb)Q={"rgba8unorm-srgb":$.srgb.SRGB8_ALPHA8_EXT,"bgra8unorm-srgb":$.srgb.SRGB8_ALPHA8_EXT};return{r8unorm:J.R8,r8snorm:J.R8_SNORM,r8uint:J.R8UI,r8sint:J.R8I,r16uint:J.R16UI,r16sint:J.R16I,r16float:J.R16F,rg8unorm:J.RG8,rg8snorm:J.RG8_SNORM,rg8uint:J.RG8UI,rg8sint:J.RG8I,r32uint:J.R32UI,r32sint:J.R32I,r32float:J.R32F,rg16uint:J.RG16UI,rg16sint:J.RG16I,rg16float:J.RG16F,rgba8unorm:J.RGBA,...Q,rgba8snorm:J.RGBA8_SNORM,rgba8uint:J.RGBA8UI,rgba8sint:J.RGBA8I,bgra8unorm:Z,rgb9e5ufloat:J.RGB9_E5,rgb10a2unorm:J.RGB10_A2,rg11b10ufloat:J.R11F_G11F_B10F,rg32uint:J.RG32UI,rg32sint:J.RG32I,rg32float:J.RG32F,rgba16uint:J.RGBA16UI,rgba16sint:J.RGBA16I,rgba16float:J.RGBA16F,rgba32uint:J.RGBA32UI,rgba32sint:J.RGBA32I,rgba32float:J.RGBA32F,stencil8:J.STENCIL_INDEX8,depth16unorm:J.DEPTH_COMPONENT16,depth24plus:J.DEPTH_COMPONENT24,"depth24plus-stencil8":J.DEPTH24_STENCIL8,depth32float:J.DEPTH_COMPONENT32F,"depth32float-stencil8":J.DEPTH32F_STENCIL8,...$.s3tc?{"bc1-rgba-unorm":$.s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT,"bc2-rgba-unorm":$.s3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT,"bc3-rgba-unorm":$.s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT}:{},...$.s3tc_sRGB?{"bc1-rgba-unorm-srgb":$.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT,"bc2-rgba-unorm-srgb":$.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT,"bc3-rgba-unorm-srgb":$.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}:{},...$.rgtc?{"bc4-r-unorm":$.rgtc.COMPRESSED_RED_RGTC1_EXT,"bc4-r-snorm":$.rgtc.COMPRESSED_SIGNED_RED_RGTC1_EXT,"bc5-rg-unorm":$.rgtc.COMPRESSED_RED_GREEN_RGTC2_EXT,"bc5-rg-snorm":$.rgtc.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}:{},...$.bptc?{"bc6h-rgb-float":$.bptc.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT,"bc6h-rgb-ufloat":$.bptc.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT,"bc7-rgba-unorm":$.bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT,"bc7-rgba-unorm-srgb":$.bptc.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT}:{},...$.etc?{"etc2-rgb8unorm":$.etc.COMPRESSED_RGB8_ETC2,"etc2-rgb8unorm-srgb":$.etc.COMPRESSED_SRGB8_ETC2,"etc2-rgb8a1unorm":$.etc.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2,"etc2-rgb8a1unorm-srgb":$.etc.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2,"etc2-rgba8unorm":$.etc.COMPRESSED_RGBA8_ETC2_EAC,"etc2-rgba8unorm-srgb":$.etc.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC,"eac-r11unorm":$.etc.COMPRESSED_R11_EAC,"eac-rg11unorm":$.etc.COMPRESSED_SIGNED_RG11_EAC}:{},...$.astc?{"astc-4x4-unorm":$.astc.COMPRESSED_RGBA_ASTC_4x4_KHR,"astc-4x4-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR,"astc-5x4-unorm":$.astc.COMPRESSED_RGBA_ASTC_5x4_KHR,"astc-5x4-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR,"astc-5x5-unorm":$.astc.COMPRESSED_RGBA_ASTC_5x5_KHR,"astc-5x5-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR,"astc-6x5-unorm":$.astc.COMPRESSED_RGBA_ASTC_6x5_KHR,"astc-6x5-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR,"astc-6x6-unorm":$.astc.COMPRESSED_RGBA_ASTC_6x6_KHR,"astc-6x6-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR,"astc-8x5-unorm":$.astc.COMPRESSED_RGBA_ASTC_8x5_KHR,"astc-8x5-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR,"astc-8x6-unorm":$.astc.COMPRESSED_RGBA_ASTC_8x6_KHR,"astc-8x6-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR,"astc-8x8-unorm":$.astc.COMPRESSED_RGBA_ASTC_8x8_KHR,"astc-8x8-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR,"astc-10x5-unorm":$.astc.COMPRESSED_RGBA_ASTC_10x5_KHR,"astc-10x5-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR,"astc-10x6-unorm":$.astc.COMPRESSED_RGBA_ASTC_10x6_KHR,"astc-10x6-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR,"astc-10x8-unorm":$.astc.COMPRESSED_RGBA_ASTC_10x8_KHR,"astc-10x8-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR,"astc-10x10-unorm":$.astc.COMPRESSED_RGBA_ASTC_10x10_KHR,"astc-10x10-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR,"astc-12x10-unorm":$.astc.COMPRESSED_RGBA_ASTC_12x10_KHR,"astc-12x10-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR,"astc-12x12-unorm":$.astc.COMPRESSED_RGBA_ASTC_12x12_KHR,"astc-12x12-unorm-srgb":$.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR}:{}}}var mO=A(()=>{D6()});function dO(J){return{r8unorm:J.UNSIGNED_BYTE,r8snorm:J.BYTE,r8uint:J.UNSIGNED_BYTE,r8sint:J.BYTE,r16uint:J.UNSIGNED_SHORT,r16sint:J.SHORT,r16float:J.HALF_FLOAT,rg8unorm:J.UNSIGNED_BYTE,rg8snorm:J.BYTE,rg8uint:J.UNSIGNED_BYTE,rg8sint:J.BYTE,r32uint:J.UNSIGNED_INT,r32sint:J.INT,r32float:J.FLOAT,rg16uint:J.UNSIGNED_SHORT,rg16sint:J.SHORT,rg16float:J.HALF_FLOAT,rgba8unorm:J.UNSIGNED_BYTE,"rgba8unorm-srgb":J.UNSIGNED_BYTE,rgba8snorm:J.BYTE,rgba8uint:J.UNSIGNED_BYTE,rgba8sint:J.BYTE,bgra8unorm:J.UNSIGNED_BYTE,"bgra8unorm-srgb":J.UNSIGNED_BYTE,rgb9e5ufloat:J.UNSIGNED_INT_5_9_9_9_REV,rgb10a2unorm:J.UNSIGNED_INT_2_10_10_10_REV,rg11b10ufloat:J.UNSIGNED_INT_10F_11F_11F_REV,rg32uint:J.UNSIGNED_INT,rg32sint:J.INT,rg32float:J.FLOAT,rgba16uint:J.UNSIGNED_SHORT,rgba16sint:J.SHORT,rgba16float:J.HALF_FLOAT,rgba32uint:J.UNSIGNED_INT,rgba32sint:J.INT,rgba32float:J.FLOAT,stencil8:J.UNSIGNED_BYTE,depth16unorm:J.UNSIGNED_SHORT,depth24plus:J.UNSIGNED_INT,"depth24plus-stencil8":J.UNSIGNED_INT_24_8,depth32float:J.FLOAT,"depth32float-stencil8":J.FLOAT_32_UNSIGNED_INT_24_8_REV}}var lO=()=>{};function cO(J){return{"2d":J.TEXTURE_2D,cube:J.TEXTURE_CUBE_MAP,"1d":null,"3d":J?.TEXTURE_3D||null,"2d-array":J?.TEXTURE_2D_ARRAY||null,"cube-array":J?.TEXTURE_CUBE_MAP_ARRAY||null}}var uO=()=>{};class XZ{constructor(J){this._glSamplers=Object.create(null),this._boundTextures=[],this._activeTextureLocation=-1,this._boundSamplers=Object.create(null),this._premultiplyAlpha=!1,this._useSeparateSamplers=!1,this._renderer=J,this._managedTextures=new WJ({renderer:J,type:"resource",onUnload:this.onSourceUnload.bind(this),name:"glTexture"});let $={image:KZ,buffer:AO,video:TO,compressed:CO};this._uploads={...$,cube:jO($)}}get managedTextures(){return Object.values(this._managedTextures.items)}contextChange(J){if(this._gl=J,!this._mapFormatToInternalFormat)this._mapFormatToInternalFormat=pO(J,this._renderer.context.extensions),this._mapFormatToType=dO(J),this._mapFormatToFormat=xO(J),this._mapViewDimensionToGlTarget=cO(J);this._managedTextures.removeAll(!0),this._glSamplers=Object.create(null),this._boundSamplers=Object.create(null),this._premultiplyAlpha=!1;for(let $=0;$<16;$++)this.bind(P0.EMPTY,$)}initSource(J){this.bind(J)}bind(J,$=0){let Q=J.source;if(J){if(this.bindSource(Q,$),this._useSeparateSamplers)this._bindSampler(Q.style,$)}else if(this.bindSource(null,$),this._useSeparateSamplers)this._bindSampler(null,$)}bindSource(J,$=0){let Q=this._gl;if(J._gcLastUsed=this._renderer.gc.now,this._boundTextures[$]!==J){this._boundTextures[$]=J,this._activateLocation($),J||(J=P0.EMPTY.source);let Z=this.getGlSource(J);Q.bindTexture(Z.target,Z.texture)}}_bindSampler(J,$=0){let Q=this._gl;if(!J){this._boundSamplers[$]=null,Q.bindSampler($,null);return}let Z=this._getGlSampler(J);if(this._boundSamplers[$]!==Z)this._boundSamplers[$]=Z,Q.bindSampler($,Z)}unbind(J){let $=J.source,Q=this._boundTextures,Z=this._gl;for(let K=0;K<Q.length;K++)if(Q[K]===$){this._activateLocation(K);let W=this.getGlSource($);Z.bindTexture(W.target,null),Q[K]=null}}_activateLocation(J){if(this._activeTextureLocation!==J)this._activeTextureLocation=J,this._gl.activeTexture(this._gl.TEXTURE0+J)}_initSource(J){let $=this._gl,Q=new BW($.createTexture());if(Q.type=this._mapFormatToType[J.format],Q.internalFormat=this._mapFormatToInternalFormat[J.format],Q.format=this._mapFormatToFormat[J.format],Q.target=this._mapViewDimensionToGlTarget[J.viewDimension],Q.target===null)throw Error(`Unsupported view dimension: ${J.viewDimension} with this webgl version: ${this._renderer.context.webGLVersion}`);if(J.uploadMethodId==="cube")Q.target=$.TEXTURE_CUBE_MAP;if(J.autoGenerateMipmaps&&(this._renderer.context.supports.nonPowOf2mipmaps||J.isPowerOfTwo)){let K=Math.max(J.width,J.height);J.mipLevelCount=Math.floor(Math.log2(K))+1}if(J._gpuData[this._renderer.uid]=Q,this._managedTextures.add(J))J.on("update",this.onSourceUpdate,this),J.on("resize",this.onSourceUpdate,this),J.on("styleChange",this.onStyleChange,this),J.on("updateMipmaps",this.onUpdateMipmaps,this);return this.onSourceUpdate(J),this.updateStyle(J,!1),Q}onStyleChange(J){this.updateStyle(J,!1)}updateStyle(J,$){let Q=this._gl,Z=this.getGlSource(J);Q.bindTexture(Z.target,Z.texture),this._boundTextures[this._activeTextureLocation]=J,CW(J.style,Q,J.mipLevelCount>1,this._renderer.context.extensions.anisotropicFiltering,"texParameteri",Z.target,!this._renderer.context.supports.nonPowOf2wrapping&&!J.isPowerOfTwo,$)}onSourceUnload(J,$=!1){let Q=J._gpuData[this._renderer.uid];if(!Q)return;if(!$)this.unbind(J),this._gl.deleteTexture(Q.texture);J.off("update",this.onSourceUpdate,this),J.off("resize",this.onSourceUpdate,this),J.off("styleChange",this.onStyleChange,this),J.off("updateMipmaps",this.onUpdateMipmaps,this)}onSourceUpdate(J){let $=this._gl,Q=this.getGlSource(J);$.bindTexture(Q.target,Q.texture),this._boundTextures[this._activeTextureLocation]=J;let Z=J.alphaMode==="premultiply-alpha-on-upload";if(this._premultiplyAlpha!==Z)this._premultiplyAlpha=Z,$.pixelStorei($.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Z);if(this._uploads[J.uploadMethodId])this._uploads[J.uploadMethodId].upload(J,Q,$,this._renderer.context.webGLVersion);else if(Q.target===$.TEXTURE_2D)this._initEmptyTexture2D(Q,J);else if(Q.target===$.TEXTURE_2D_ARRAY)this._initEmptyTexture2DArray(Q,J);else if(Q.target===$.TEXTURE_CUBE_MAP)this._initEmptyTextureCube(Q,J);else throw Error("[GlTextureSystem] Unsupported texture target for empty allocation.");if(this._applyMipRange(Q,J),J.autoGenerateMipmaps&&J.mipLevelCount>1)this.onUpdateMipmaps(J,!1)}onUpdateMipmaps(J,$=!0){if($)this.bindSource(J,0);let Q=this.getGlSource(J);this._gl.generateMipmap(Q.target)}_initEmptyTexture2D(J,$){let Q=this._gl;Q.texImage2D(Q.TEXTURE_2D,0,J.internalFormat,$.pixelWidth,$.pixelHeight,0,J.format,J.type,null);let Z=Math.max($.pixelWidth>>1,1),K=Math.max($.pixelHeight>>1,1);for(let W=1;W<$.mipLevelCount;W++)Q.texImage2D(Q.TEXTURE_2D,W,J.internalFormat,Z,K,0,J.format,J.type,null),Z=Math.max(Z>>1,1),K=Math.max(K>>1,1)}_initEmptyTexture2DArray(J,$){if(this._renderer.context.webGLVersion!==2)throw Error("[GlTextureSystem] TEXTURE_2D_ARRAY requires WebGL2.");let Q=this._gl,Z=Math.max($.arrayLayerCount|0,1);Q.texImage3D(Q.TEXTURE_2D_ARRAY,0,J.internalFormat,$.pixelWidth,$.pixelHeight,Z,0,J.format,J.type,null);let K=Math.max($.pixelWidth>>1,1),W=Math.max($.pixelHeight>>1,1);for(let X=1;X<$.mipLevelCount;X++)Q.texImage3D(Q.TEXTURE_2D_ARRAY,X,J.internalFormat,K,W,Z,0,J.format,J.type,null),K=Math.max(K>>1,1),W=Math.max(W>>1,1)}_initEmptyTextureCube(J,$){let Q=this._gl,Z=6;for(let X=0;X<6;X++)Q.texImage2D(Q.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,J.internalFormat,$.pixelWidth,$.pixelHeight,0,J.format,J.type,null);let K=Math.max($.pixelWidth>>1,1),W=Math.max($.pixelHeight>>1,1);for(let X=1;X<$.mipLevelCount;X++){for(let H=0;H<6;H++)Q.texImage2D(Q.TEXTURE_CUBE_MAP_POSITIVE_X+H,X,J.internalFormat,K,W,0,J.format,J.type,null);K=Math.max(K>>1,1),W=Math.max(W>>1,1)}}_applyMipRange(J,$){if(this._renderer.context.webGLVersion!==2)return;let Q=this._gl,Z=Math.max(($.mipLevelCount|0)-1,0);Q.texParameteri(J.target,Q.TEXTURE_BASE_LEVEL,0),Q.texParameteri(J.target,Q.TEXTURE_MAX_LEVEL,Z)}_initSampler(J){let $=this._gl,Q=this._gl.createSampler();return this._glSamplers[J._resourceId]=Q,CW(J,$,this._boundTextures[this._activeTextureLocation].mipLevelCount>1,this._renderer.context.extensions.anisotropicFiltering,"samplerParameteri",Q,!1,!0),this._glSamplers[J._resourceId]}_getGlSampler(J){return this._glSamplers[J._resourceId]||this._initSampler(J)}getGlSource(J){return J._gcLastUsed=this._renderer.gc.now,J._gpuData[this._renderer.uid]||this._initSource(J)}generateCanvas(J){let{pixels:$,width:Q,height:Z}=this.getPixels(J),K=F8.get().createCanvas();K.width=Q,K.height=Z;let W=K.getContext("2d");if(W){let X=W.createImageData(Q,Z);X.data.set($),W.putImageData(X,0,0)}return K}getPixels(J){let $=J.source.resolution,Q=J.frame,Z=Math.max(Math.round(Q.width*$),1),K=Math.max(Math.round(Q.height*$),1),W=new Uint8Array(Hk*Z*K),X=this._renderer,H=X.renderTarget.getRenderTarget(J),q=X.renderTarget.getGpuRenderTarget(H),Y=X.gl;return Y.bindFramebuffer(Y.FRAMEBUFFER,q.resolveTargetFramebuffer),Y.readPixels(Math.round(Q.x*$),Math.round(Q.y*$),Z,K,Y.RGBA,Y.UNSIGNED_BYTE,W),{pixels:new Uint8ClampedArray(W.buffer),width:Z,height:K}}destroy(){this._managedTextures.destroy(),this._glSamplers=null,this._boundTextures=null,this._boundSamplers=null,this._mapFormatToInternalFormat=null,this._mapFormatToType=null,this._mapFormatToFormat=null,this._uploads=null,this._renderer=null}resetState(){this._activeTextureLocation=-1,this._boundTextures.fill(P0.EMPTY.source),this._boundSamplers=Object.create(null);let J=this._gl;this._premultiplyAlpha=!1,J.pixelStorei(J.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this._premultiplyAlpha)}}var Hk=4;var sO=A(()=>{D6();k0();CQ();i8();BO();_O();EO();SO();AW();yO();hO();gO();mO();lO();uO();XZ.extension={type:[b.WebGLSystem],name:"texture"}});class HZ{contextChange(J){let $=new o8({uColor:{value:new Float32Array([1,1,1,1]),type:"vec4<f32>"},uTransformMatrix:{value:new B0,type:"mat3x3<f32>"},uRound:{value:0,type:"f32"}}),Q=J.limits.maxBatchableTextures,Z=sJ({name:"graphics",bits:[RQ,LQ(Q),EQ,nJ]});this.shader=new A6({glProgram:Z,resources:{localUniforms:$,batchSamplers:AQ(Q)}})}execute(J,$){let Q=$.context,Z=Q.customShader||this.shader,K=J.renderer,W=K.graphicsContext,{batcher:X,instructions:H}=W.getContextRenderData(Q);Z.groups[0]=K.globalUniforms.bindGroup,K.state.set(J.state),K.shader.bind(Z),K.geometry.bind(X.geometry,Z.glProgram);let q=H.instructions;for(let Y=0;Y<H.instructionSize;Y++){let N=q[Y];if(N.size){for(let U=0;U<N.textures.count;U++)K.texture.bind(N.textures.textures[U],U);K.geometry.draw(N.topology,N.size,N.start)}}}destroy(){this.shader.destroy(!0),this.shader=null}}var nO=A(()=>{k0();E8();GQ();v5();x5();c5();BQ();g5();mJ();N7();HZ.extension={type:[b.WebGLPipesAdaptor],name:"graphics"}});class qZ{init(){let J=sJ({name:"mesh",bits:[EQ,RU,nJ]});this._shader=new A6({glProgram:J,resources:{uTexture:P0.EMPTY.source,textureUniforms:{uTextureMatrix:{type:"mat3x3<f32>",value:new B0}}}})}execute(J,$){let Q=J.renderer,Z=$._shader;if(!Z){Z=this._shader;let K=$.texture,W=K.source;Z.resources.uTexture=W,Z.resources.uSampler=W.style,Z.resources.textureUniforms.uniforms.uTextureMatrix=K.textureMatrix.mapCoord}else if(!Z.glProgram){v0("Mesh shader has no glProgram",$.shader);return}Z.groups[100]=Q.globalUniforms.bindGroup,Z.groups[101]=J.localUniformsBindGroup,Q.encoder.draw({geometry:$._geometry,shader:Z,state:$.state})}destroy(){this._shader.destroy(!0),this._shader=null}}var iO=A(()=>{k0();E8();GQ();c5();BQ();LU();mJ();i8();s8();qZ.extension={type:[b.WebGLPipesAdaptor],name:"mesh"}});var qk,Yk,Nk,oO,aO,rO,YZ;var tO=A(()=>{k0();nO();iO();MU();IN();UV();ZJ();wV();GV();EV();jV();SV();TV();yV();fV();sV();iV();VO();IO();LO();sO();qk=[...YV,rQ,PV,MV,oQ,lQ,XZ,tQ,sQ,ZZ,QZ,iQ,RO,aQ,nQ],Yk=[...NV],Nk=[PQ,qZ,HZ],oO=[],aO=[],rO=[];n0.handleByNamedList(b.WebGLSystem,oO);n0.handleByNamedList(b.WebGLPipes,aO);n0.handleByNamedList(b.WebGLPipesAdaptor,rO);n0.add(...qk,...Yk,...Nk);YZ=class YZ extends kN{constructor(){let J={name:"webgl",type:q6.WEBGL,systems:oO,renderPipes:aO,renderPipeAdaptors:rO};super(J)}}});k0();var UN={extension:{type:b.Environment,name:"browser",priority:-1},test:()=>!0,load:async()=>{await Promise.resolve().then(() => (NN(),B4))}};k0();var ON={extension:{type:b.Environment,name:"webworker",priority:0},test:()=>typeof self<"u"&&self.WorkerGlobalScope!==void 0,load:async()=>{await Promise.resolve().then(() => (VN(),A4))}};k0();WQ();a$();tO();N5();o6();r$();hJ();O6();n0.add(UN,ON);var Z$={sourceStylesheet:"src/styles/app.css",stylesheetOutputFile:"app.css",htmxNodeModuleBundle:"node_modules/htmx.org/dist/htmx.min.js",htmxPublicBundleFile:"vendor/htmx.min.js",htmxExtensionsOutputDirectory:"vendor/htmx-ext",htmxExtensionOracleIndicatorFile:"vendor/htmx-ext/oracle-indicator.js",htmxExtensionGameHudFile:"vendor/htmx-ext/game-hud.js",htmxExtensionFocusPanelFile:"vendor/htmx-ext/focus-panel.js",onnxPublicDirectory:"onnx",htmxExtensionsSourceDirectory:"src/htmx-extensions",playableGameClientEntryFile:"src/playable-game/game-client.ts",gameClientBundleFile:"game-client.js"};var aJ=(J,$)=>{let Q=`/${J.replace(/^\/+|\/+$/g,"")}`,Z=$.replace(/^\/+/g,"");if(Z.length===0)return Q;return`${Q}/${Z}`};var eO=(J,$)=>aJ(J,$);var Uk=["en-US","zh-CN"],Vk=3000,Ok=180,Fk=240,zk="prisma",Dk=3600000,kk=16,Ik=2500,wk=12,Mk=6,Gk=3,Rk=500,Lk=640,Bk=360,Ak=500,_k=2000,Ck=604800000,Ek="teaHouse",Pk=!1,jk=5000,Sk=2500,Tk="./.cache/hf-models",yk="./.cache/hf-models",bk=2,vk=16000,fk=6291456,hk=8000,xk=30000,gk=350,pk="http://localhost:11434",mk="llama3.2",dk="llava",lk=30000,ck=300000,uk="auto",sk=60000,nk="Xenova/distilbert-base-uncased-finetuned-sst-2-english",ik="Xenova/gpt2",ok="Xenova/gpt2",ak="Xenova/all-MiniLM-L6-v2",rk="onnx-community/whisper-tiny.en",tk="Xenova/speecht5_tts",ek="https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin",J2="/public",$2="/assets",Q2="/rmmz-pack",Z2="public",K2="assets",W2="LOTFK_RMMZ_Agentic_Pack",X2="/docs",H2="/game",q2="public/game",Y2="silk",N2="max-w-6xl",U2="lotfk_session",V2=604800,O2=7,F2="en-US",NZ=Bun.env.PUBLIC_ASSET_PREFIX??J2,z2=Bun.env.IMAGES_ASSET_PREFIX??$2,D2=Bun.env.RMMZ_PACK_PREFIX??Q2,k2=Bun.env.PUBLIC_ASSET_DIR??Z2,I2=Bun.env.IMAGES_ASSET_DIR??K2,w2=Bun.env.RMMZ_PACK_DIR??W2,JF=Bun.env.PLAYABLE_GAME_MOUNT_PATH??H2,$F=aJ(JF,"assets"),M2=Bun.env.PLAYABLE_GAME_SOURCE_DIRECTORY??q2,G2=Bun.env.STYLESHEET_PATH??aJ(NZ,Z$.stylesheetOutputFile),R2=Bun.env.HTMX_SCRIPT_PATH??aJ(NZ,Z$.htmxPublicBundleFile),L2=Bun.env.PLAYABLE_GAME_CLIENT_SCRIPT_PATH??aJ($F,Z$.gameClientBundleFile),B2=Bun.env.AI_ONNX_WASM_PATH??`${eO(NZ,Z$.onnxPublicDirectory)}/`,A2=Uk.map((J)=>({locale:J,normalizedLocale:J.toLowerCase(),normalizedLanguage:J.toLowerCase().split("-")[0]??J.toLowerCase()})),V7=(J,$)=>{if(J===void 0)return $;return J.toLowerCase()==="true"},Z8=(J,$,Q)=>{if(J===void 0)return $;let Z=Number.parseInt(J,10);if(Number.isNaN(Z))return $;return Math.max(Z,Q)},_2=(J)=>{if(J==="memory")return"memory";if(J==="prisma")return"prisma";return zk},C2=(J)=>{if(J==="ollama"||J==="transformers"||J==="auto")return J;return uk},E2=(J)=>{return P2(J)??F2},P2=(J)=>{let $=J?.trim().toLowerCase();if(!$)return null;for(let Q of A2){if($.startsWith(Q.normalizedLocale))return Q.locale;if($===Q.normalizedLanguage)return Q.locale;if($.startsWith(`${Q.normalizedLanguage}-`))return Q.locale}return null},j2=Bun.env.APP_NAME??"Leaves of the Fallen Kingdom",S2=Bun.env.APP_VERSION??"1.0.0",EW={applicationName:j2,applicationVersion:S2,host:Bun.env.HOST??"0.0.0.0",port:Z8(Bun.env.PORT,Vk,1),defaultLocale:E2(Bun.env.DEFAULT_LOCALE),stylesheetPath:G2,htmxScriptPath:R2,staticAssets:{publicPrefix:NZ,assetsPrefix:z2,rmmzPackPrefix:D2,publicDirectory:k2,assetsDirectory:I2,rmmzPackDirectory:w2},api:{docsPath:Bun.env.API_DOCS_PATH??X2},ui:{defaultTheme:Bun.env.APP_THEME??Y2,maxContentWidthClass:Bun.env.MAX_CONTENT_WIDTH_CLASS??N2},playableGame:{mountPath:JF,assetPrefix:$F,sourceDirectory:M2,clientScriptPath:L2},auth:{sessionCookieName:Bun.env.SESSION_COOKIE_NAME??U2,sessionMaxAgeSeconds:Z8(Bun.env.SESSION_MAX_AGE_SECONDS,V2,1)},oracle:{requireSession:V7(Bun.env.ORACLE_REQUIRE_SESSION,!1),responseDelayMs:Z8(Bun.env.ORACLE_RESPONSE_DELAY_MS,Ok,0),maxQuestionLength:Z8(Bun.env.ORACLE_MAX_QUESTION_LENGTH,Fk,1),answerHashMultiplier:Z8(Bun.env.ORACLE_ANSWER_HASH_MULTIPLIER,O2,1)},game:{sessionStore:_2(Bun.env.GAME_SESSION_STORE),defaultSceneId:Bun.env.GAME_DEFAULT_SCENE_ID??Ek,sessionTtlMs:Z8(Bun.env.GAME_SESSION_TTL_MS,Dk,1000),tickMs:Z8(Bun.env.GAME_TICK_MS,kk,1),saveCooldownMs:Z8(Bun.env.GAME_SAVE_COOLDOWN_MS,Ik,0),maxMovePerTick:Z8(Bun.env.GAME_MAX_MOVE_PER_TICK,wk,1),maxCommandsPerTick:Z8(Bun.env.GAME_MAX_COMMANDS_PER_TICK,Mk,1),maxInteractionsPerTick:Z8(Bun.env.GAME_MAX_INTERACTIONS_PER_TICK,Gk,1),maxChatMessageLength:Z8(Bun.env.GAME_MAX_CHAT_MESSAGE_LENGTH,Rk,1),viewportWidth:Z8(Bun.env.GAME_VIEWPORT_WIDTH,Lk,1),viewportHeight:Z8(Bun.env.GAME_VIEWPORT_HEIGHT,Bk,1),hudPollIntervalMs:Z8(Bun.env.GAME_HUD_POLL_INTERVAL_MS,Ak,100),hudRetryDelayMs:Z8(Bun.env.GAME_HUD_RETRY_MS,_k,0),sessionPurgeIntervalMs:Z8(Bun.env.GAME_SESSION_PURGE_INTERVAL_MS,60000,1000),sessionResumeWindowMs:Z8(Bun.env.GAME_SESSION_RESUME_WINDOW_MS,Ck,1000)},ai:{warmupOnBoot:V7(Bun.env.AI_WARMUP_ON_BOOT,Pk),modelWarmupTimeoutMs:Z8(Bun.env.AI_MODEL_WARMUP_TIMEOUT_MS,jk,500),pipelineTimeoutMs:Z8(Bun.env.AI_PIPELINE_TIMEOUT_MS,Sk,500),transformersCacheDirectory:Bun.env.AI_TRANSFORMERS_CACHE_DIR??Tk,transformersLocalModelPath:Bun.env.AI_TRANSFORMERS_LOCAL_MODEL_PATH??yk,transformersAllowRemoteModels:V7(Bun.env.AI_ALLOW_REMOTE_MODELS,!0),transformersAllowLocalModels:V7(Bun.env.AI_ALLOW_LOCAL_MODELS,!0),onnxWasmPath:B2,onnxThreadCount:Z8(Bun.env.AI_ONNX_THREAD_COUNT,bk,1),onnxProxyEnabled:V7(Bun.env.AI_ONNX_PROXY_ENABLED,!1),ollamaBaseUrl:Bun.env.OLLAMA_BASE_URL??pk,ollamaEnabled:V7(Bun.env.OLLAMA_ENABLED,!0),ollamaChatModel:Bun.env.OLLAMA_CHAT_MODEL??mk,ollamaVisionModel:Bun.env.OLLAMA_VISION_MODEL??dk,ollamaTimeoutMs:Z8(Bun.env.OLLAMA_TIMEOUT_MS,lk,1000),ollamaKeepAliveMs:Z8(Bun.env.OLLAMA_KEEP_ALIVE_MS,ck,0),preferredProvider:C2(Bun.env.AI_PREFERRED_PROVIDER),capabilityRefreshIntervalMs:Z8(Bun.env.AI_CAPABILITY_REFRESH_INTERVAL_MS,sk,5000),ollamaAvailabilityTimeoutMs:Z8(Bun.env.OLLAMA_AVAILABILITY_TIMEOUT_MS,3000,500),requestTimeoutMs:Z8(Bun.env.AI_REQUEST_TIMEOUT_MS,hk,500),commandRetryBudgetMs:Z8(Bun.env.AI_COMMAND_RETRY_BUDGET_MS,xk,1000),retryBackoffBaseMs:Z8(Bun.env.AI_RETRY_BACKOFF_BASE_MS,gk,50),localSentimentModel:Bun.env.AI_LOCAL_SENTIMENT_MODEL??nk,localTextGenerationModel:Bun.env.AI_LOCAL_TEXT_GENERATION_MODEL??ik,localNpcDialogueModel:Bun.env.AI_LOCAL_NPC_DIALOGUE_MODEL??ok,localEmbeddingModel:Bun.env.AI_LOCAL_EMBEDDING_MODEL??ak,localSpeechToTextModel:Bun.env.AI_LOCAL_SPEECH_TO_TEXT_MODEL??rk,localTextToSpeechModel:Bun.env.AI_LOCAL_TEXT_TO_SPEECH_MODEL??tk,localSpeechToTextEnabled:V7(Bun.env.AI_LOCAL_STT_ENABLED,!0),localTextToSpeechEnabled:V7(Bun.env.AI_LOCAL_TTS_ENABLED,!0),localEmbeddingsEnabled:V7(Bun.env.AI_LOCAL_EMBEDDINGS_ENABLED,!0),audioInputSampleRateHz:Z8(Bun.env.AI_AUDIO_INPUT_SAMPLE_RATE_HZ,vk,8000),audioUploadMaxBytes:Z8(Bun.env.AI_AUDIO_UPLOAD_MAX_BYTES,fk,1024),textToSpeechSpeakerEmbeddings:Bun.env.AI_LOCAL_TTS_SPEAKER_EMBEDDINGS??ek}};var QF={home:"/",pitchDeck:"/pitch-deck",narrativeBible:"/narrative-bible",developmentPlan:"/dev-plan",game:EW.playableGame.mountPath,gameAssets:EW.playableGame.assetPrefix,gameApiSession:"/api/game/session",gameApiSessionRestore:"/api/game/session/:id",gameApiSessionJoin:"/api/game/session/:id/join",gameApiSessionClose:"/api/game/session/:id/close",gameApiSessionState:"/api/game/session/:id/state",gameApiSessionCommand:"/api/game/session/:id/command",gameApiSessionDialogue:"/api/game/session/:id/dialogue",gameApiSessionSave:"/api/game/session/:id/save",gameApiSessionHud:"/api/game/session/:id/hud",gameApiHudPartial:"/api/game/session/:id/partials/hud",gameApiDialoguePartial:"/api/game/session/:id/partials/dialogue",gameApiSessionWebSocket:"/api/game/session/:id/ws",oraclePartial:"/partials/oracle",oracleApi:"/api/oracle",healthApi:"/api/health",aiStatus:"/api/ai/status",aiHealth:"/api/ai/health",aiCapabilities:"/api/ai/capabilities",aiCatalog:"/api/ai/catalog",aiGenerateDialogue:"/api/ai/generate/dialogue",aiGenerateScene:"/api/ai/generate/scene",aiAssist:"/api/ai/assist",aiTranscribe:"/api/ai/audio/transcribe",aiSynthesize:"/api/ai/audio/synthesize",aiBuilderCapabilities:"/api/builder/ai/capabilities",aiBuilderTest:"/api/builder/ai/test",aiBuilderAssist:"/api/builder/ai/assist",aiBuilderCompose:"/api/builder/ai/compose",builder:"/builder",builderScenes:"/builder/scenes",builderNpcs:"/builder/npcs",builderDialogue:"/builder/dialogue",builderAssets:"/builder/assets",builderAi:"/builder/ai",builderApiScenes:"/api/builder/scenes",builderApiNpcs:"/api/builder/npcs",builderApiDialogue:"/api/builder/dialogue"};var ZF=(J,$)=>J.replaceAll(/:([A-Za-z0-9_]+)/g,(Q,Z)=>{let K=$[Z];return typeof K==="string"?encodeURIComponent(K):Q});var KF=(J)=>{try{return localStorage.getItem(J)}catch{return null}},WF=(J,$)=>{try{return localStorage.setItem(J,$),!0}catch{return!1}};var PW=(J,$)=>{try{return JSON.parse(J)}catch{return $}};var CF="183";var EF=0,$X=1,PF=2;var U$=1,jF=2,V9=3,O9=0,N6=1,e6=2,J7=0,V$=1,QX=2,ZX=3,KX=4,SF=5;var F9=100,TF=101,yF=102,bF=103,vF=104,fF=200,hF=201,xF=202,gF=203,pF=204,mF=205,dF=206,lF=207,cF=208,uF=209,sF=210,nF=211,iF=212,oF=213,aF=214,rF=0,tF=1,eF=2,WX=3,Jz=4,$z=5,Qz=6,Zz=7,Kz=0,Wz=1,Xz=2,l6=0,XX=1,HX=2,qX=3,YX=4,NX=5,UX=6,VX=7;var z9=301,NJ=302,bZ=303,vZ=304,O$=306,Hz=1000,fZ=1001,qz=1002,d7=1003,Yz=1004;var F$=1005;var U6=1006,hZ=1007;var UJ=1008;var c6=1009,Nz=1010,Uz=1011,z$=1012,OX=1013,l7=1014,M7=1015,G7=1016,FX=1017,zX=1018,D9=1020,Vz=35902,Oz=35899,Fz=1021,zz=1022,$7=1023,VJ=1026,OJ=1027,Dz=1028,DX=1029,k9=1030,kX=1031;var IX=1033,xZ=33776,gZ=33777,pZ=33778,mZ=33779,wX=35840,MX=35841,GX=35842,RX=35843,LX=36196,BX=37492,AX=37496,_X=37488,CX=37489,EX=37490,PX=37491,jX=37808,SX=37809,TX=37810,yX=37811,bX=37812,vX=37813,fX=37814,hX=37815,xX=37816,gX=37817,pX=37818,mX=37819,dX=37820,lX=37821,cX=36492,uX=36494,sX=36495,nX=36283,iX=36284,oX=36285,aX=36286;var kz=0,Iz=1,FJ="",wz="srgb",D$="srgb-linear",rX="linear",z8="srgb";var Mz=512,Gz=513,Rz=514,dZ=515,Lz=516,Bz=517,lZ=518,Az=519;var tX="300 es",eX=2000;function T2(J){for(let $=J.length-1;$>=0;--$)if(J[$]>=65535)return!0;return!1}function y2(J){return ArrayBuffer.isView(J)&&!(J instanceof DataView)}function Y$(J){return document.createElementNS("http://www.w3.org/1999/xhtml",J)}function _z(){let J=Y$("canvas");return J.style.display="block",J}var XF={},U9=null;function JH(...J){let $="THREE."+J.shift();if(U9)U9("log",$,...J);else console.log($,...J)}function Cz(J){let $=J[0];if(typeof $==="string"&&$.startsWith("TSL:")){let Q=J[1];if(Q&&Q.isStackTrace)J[0]+=" "+Q.getLocation();else J[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return J}function b0(...J){J=Cz(J);let $="THREE."+J.shift();if(U9)U9("warn",$,...J);else{let Q=J[0];if(Q&&Q.isStackTrace)console.warn(Q.getError($));else console.warn($,...J)}}function y0(...J){J=Cz(J);let $="THREE."+J.shift();if(U9)U9("error",$,...J);else{let Q=J[0];if(Q&&Q.isStackTrace)console.error(Q.getError($));else console.error($,...J)}}function N$(...J){let $=J.join(" ");if($ in XF)return;XF[$]=!0,b0(...J)}function Ez(J,$,Q){return new Promise(function(Z,K){function W(){switch(J.clientWaitSync($,J.SYNC_FLUSH_COMMANDS_BIT,0)){case J.WAIT_FAILED:K();break;case J.TIMEOUT_EXPIRED:setTimeout(W,Q);break;default:Z()}}setTimeout(W,Q)})}var Pz={[0]:1,[2]:6,[4]:7,[3]:5,[1]:0,[6]:2,[7]:4,[5]:3};class c7{addEventListener(J,$){if(this._listeners===void 0)this._listeners={};let Q=this._listeners;if(Q[J]===void 0)Q[J]=[];if(Q[J].indexOf($)===-1)Q[J].push($)}hasEventListener(J,$){let Q=this._listeners;if(Q===void 0)return!1;return Q[J]!==void 0&&Q[J].indexOf($)!==-1}removeEventListener(J,$){let Q=this._listeners;if(Q===void 0)return;let Z=Q[J];if(Z!==void 0){let K=Z.indexOf($);if(K!==-1)Z.splice(K,1)}}dispatchEvent(J){let $=this._listeners;if($===void 0)return;let Q=$[J.type];if(Q!==void 0){J.target=this;let Z=Q.slice(0);for(let K=0,W=Z.length;K<W;K++)Z[K].call(this,J);J.target=null}}}var a8=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var jW=Math.PI/180,yZ=180/Math.PI;function k$(){let J=Math.random()*4294967295|0,$=Math.random()*4294967295|0,Q=Math.random()*4294967295|0,Z=Math.random()*4294967295|0;return(a8[J&255]+a8[J>>8&255]+a8[J>>16&255]+a8[J>>24&255]+"-"+a8[$&255]+a8[$>>8&255]+"-"+a8[$>>16&15|64]+a8[$>>24&255]+"-"+a8[Q&63|128]+a8[Q>>8&255]+"-"+a8[Q>>16&255]+a8[Q>>24&255]+a8[Z&255]+a8[Z>>8&255]+a8[Z>>16&255]+a8[Z>>24&255]).toLowerCase()}function s0(J,$,Q){return Math.max($,Math.min(Q,J))}function b2(J,$){return(J%$+$)%$}function SW(J,$,Q){return(1-Q)*J+Q*$}function K$(J,$){switch($.constructor){case Float32Array:return J;case Uint32Array:return J/4294967295;case Uint16Array:return J/65535;case Uint8Array:return J/255;case Int32Array:return Math.max(J/2147483647,-1);case Int16Array:return Math.max(J/32767,-1);case Int8Array:return Math.max(J/127,-1);default:throw Error("Invalid component type.")}}function Y6(J,$){switch($.constructor){case Float32Array:return J;case Uint32Array:return Math.round(J*4294967295);case Uint16Array:return Math.round(J*65535);case Uint8Array:return Math.round(J*255);case Int32Array:return Math.round(J*2147483647);case Int16Array:return Math.round(J*32767);case Int8Array:return Math.round(J*127);default:throw Error("Invalid component type.")}}class Q8{constructor(J=0,$=0){Q8.prototype.isVector2=!0,this.x=J,this.y=$}get width(){return this.x}set width(J){this.x=J}get height(){return this.y}set height(J){this.y=J}set(J,$){return this.x=J,this.y=$,this}setScalar(J){return this.x=J,this.y=J,this}setX(J){return this.x=J,this}setY(J){return this.y=J,this}setComponent(J,$){switch(J){case 0:this.x=$;break;case 1:this.y=$;break;default:throw Error("index is out of range: "+J)}return this}getComponent(J){switch(J){case 0:return this.x;case 1:return this.y;default:throw Error("index is out of range: "+J)}}clone(){return new this.constructor(this.x,this.y)}copy(J){return this.x=J.x,this.y=J.y,this}add(J){return this.x+=J.x,this.y+=J.y,this}addScalar(J){return this.x+=J,this.y+=J,this}addVectors(J,$){return this.x=J.x+$.x,this.y=J.y+$.y,this}addScaledVector(J,$){return this.x+=J.x*$,this.y+=J.y*$,this}sub(J){return this.x-=J.x,this.y-=J.y,this}subScalar(J){return this.x-=J,this.y-=J,this}subVectors(J,$){return this.x=J.x-$.x,this.y=J.y-$.y,this}multiply(J){return this.x*=J.x,this.y*=J.y,this}multiplyScalar(J){return this.x*=J,this.y*=J,this}divide(J){return this.x/=J.x,this.y/=J.y,this}divideScalar(J){return this.multiplyScalar(1/J)}applyMatrix3(J){let $=this.x,Q=this.y,Z=J.elements;return this.x=Z[0]*$+Z[3]*Q+Z[6],this.y=Z[1]*$+Z[4]*Q+Z[7],this}min(J){return this.x=Math.min(this.x,J.x),this.y=Math.min(this.y,J.y),this}max(J){return this.x=Math.max(this.x,J.x),this.y=Math.max(this.y,J.y),this}clamp(J,$){return this.x=s0(this.x,J.x,$.x),this.y=s0(this.y,J.y,$.y),this}clampScalar(J,$){return this.x=s0(this.x,J,$),this.y=s0(this.y,J,$),this}clampLength(J,$){let Q=this.length();return this.divideScalar(Q||1).multiplyScalar(s0(Q,J,$))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(J){return this.x*J.x+this.y*J.y}cross(J){return this.x*J.y-this.y*J.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(J){let $=Math.sqrt(this.lengthSq()*J.lengthSq());if($===0)return Math.PI/2;let Q=this.dot(J)/$;return Math.acos(s0(Q,-1,1))}distanceTo(J){return Math.sqrt(this.distanceToSquared(J))}distanceToSquared(J){let $=this.x-J.x,Q=this.y-J.y;return $*$+Q*Q}manhattanDistanceTo(J){return Math.abs(this.x-J.x)+Math.abs(this.y-J.y)}setLength(J){return this.normalize().multiplyScalar(J)}lerp(J,$){return this.x+=(J.x-this.x)*$,this.y+=(J.y-this.y)*$,this}lerpVectors(J,$,Q){return this.x=J.x+($.x-J.x)*Q,this.y=J.y+($.y-J.y)*Q,this}equals(J){return J.x===this.x&&J.y===this.y}fromArray(J,$=0){return this.x=J[$],this.y=J[$+1],this}toArray(J=[],$=0){return J[$]=this.x,J[$+1]=this.y,J}fromBufferAttribute(J,$){return this.x=J.getX($),this.y=J.getY($),this}rotateAround(J,$){let Q=Math.cos($),Z=Math.sin($),K=this.x-J.x,W=this.y-J.y;return this.x=K*Q-W*Z+J.x,this.y=K*Z+W*Q+J.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class R7{constructor(J=0,$=0,Q=0,Z=1){this.isQuaternion=!0,this._x=J,this._y=$,this._z=Q,this._w=Z}static slerpFlat(J,$,Q,Z,K,W,X){let H=Q[Z+0],q=Q[Z+1],Y=Q[Z+2],N=Q[Z+3],U=K[W+0],V=K[W+1],z=K[W+2],D=K[W+3];if(N!==D||H!==U||q!==V||Y!==z){let w=H*U+q*V+Y*z+N*D;if(w<0)U=-U,V=-V,z=-z,D=-D,w=-w;let F=1-X;if(w<0.9995){let O=Math.acos(w),R=Math.sin(O);F=Math.sin(F*O)/R,X=Math.sin(X*O)/R,H=H*F+U*X,q=q*F+V*X,Y=Y*F+z*X,N=N*F+D*X}else{H=H*F+U*X,q=q*F+V*X,Y=Y*F+z*X,N=N*F+D*X;let O=1/Math.sqrt(H*H+q*q+Y*Y+N*N);H*=O,q*=O,Y*=O,N*=O}}J[$]=H,J[$+1]=q,J[$+2]=Y,J[$+3]=N}static multiplyQuaternionsFlat(J,$,Q,Z,K,W){let X=Q[Z],H=Q[Z+1],q=Q[Z+2],Y=Q[Z+3],N=K[W],U=K[W+1],V=K[W+2],z=K[W+3];return J[$]=X*z+Y*N+H*V-q*U,J[$+1]=H*z+Y*U+q*N-X*V,J[$+2]=q*z+Y*V+X*U-H*N,J[$+3]=Y*z-X*N-H*U-q*V,J}get x(){return this._x}set x(J){this._x=J,this._onChangeCallback()}get y(){return this._y}set y(J){this._y=J,this._onChangeCallback()}get z(){return this._z}set z(J){this._z=J,this._onChangeCallback()}get w(){return this._w}set w(J){this._w=J,this._onChangeCallback()}set(J,$,Q,Z){return this._x=J,this._y=$,this._z=Q,this._w=Z,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(J){return this._x=J.x,this._y=J.y,this._z=J.z,this._w=J.w,this._onChangeCallback(),this}setFromEuler(J,$=!0){let{_x:Q,_y:Z,_z:K,_order:W}=J,X=Math.cos,H=Math.sin,q=X(Q/2),Y=X(Z/2),N=X(K/2),U=H(Q/2),V=H(Z/2),z=H(K/2);switch(W){case"XYZ":this._x=U*Y*N+q*V*z,this._y=q*V*N-U*Y*z,this._z=q*Y*z+U*V*N,this._w=q*Y*N-U*V*z;break;case"YXZ":this._x=U*Y*N+q*V*z,this._y=q*V*N-U*Y*z,this._z=q*Y*z-U*V*N,this._w=q*Y*N+U*V*z;break;case"ZXY":this._x=U*Y*N-q*V*z,this._y=q*V*N+U*Y*z,this._z=q*Y*z+U*V*N,this._w=q*Y*N-U*V*z;break;case"ZYX":this._x=U*Y*N-q*V*z,this._y=q*V*N+U*Y*z,this._z=q*Y*z-U*V*N,this._w=q*Y*N+U*V*z;break;case"YZX":this._x=U*Y*N+q*V*z,this._y=q*V*N+U*Y*z,this._z=q*Y*z-U*V*N,this._w=q*Y*N-U*V*z;break;case"XZY":this._x=U*Y*N-q*V*z,this._y=q*V*N-U*Y*z,this._z=q*Y*z+U*V*N,this._w=q*Y*N+U*V*z;break;default:b0("Quaternion: .setFromEuler() encountered an unknown order: "+W)}if($===!0)this._onChangeCallback();return this}setFromAxisAngle(J,$){let Q=$/2,Z=Math.sin(Q);return this._x=J.x*Z,this._y=J.y*Z,this._z=J.z*Z,this._w=Math.cos(Q),this._onChangeCallback(),this}setFromRotationMatrix(J){let $=J.elements,Q=$[0],Z=$[4],K=$[8],W=$[1],X=$[5],H=$[9],q=$[2],Y=$[6],N=$[10],U=Q+X+N;if(U>0){let V=0.5/Math.sqrt(U+1);this._w=0.25/V,this._x=(Y-H)*V,this._y=(K-q)*V,this._z=(W-Z)*V}else if(Q>X&&Q>N){let V=2*Math.sqrt(1+Q-X-N);this._w=(Y-H)/V,this._x=0.25*V,this._y=(Z+W)/V,this._z=(K+q)/V}else if(X>N){let V=2*Math.sqrt(1+X-Q-N);this._w=(K-q)/V,this._x=(Z+W)/V,this._y=0.25*V,this._z=(H+Y)/V}else{let V=2*Math.sqrt(1+N-Q-X);this._w=(W-Z)/V,this._x=(K+q)/V,this._y=(H+Y)/V,this._z=0.25*V}return this._onChangeCallback(),this}setFromUnitVectors(J,$){let Q=J.dot($)+1;if(Q<0.00000001)if(Q=0,Math.abs(J.x)>Math.abs(J.z))this._x=-J.y,this._y=J.x,this._z=0,this._w=Q;else this._x=0,this._y=-J.z,this._z=J.y,this._w=Q;else this._x=J.y*$.z-J.z*$.y,this._y=J.z*$.x-J.x*$.z,this._z=J.x*$.y-J.y*$.x,this._w=Q;return this.normalize()}angleTo(J){return 2*Math.acos(Math.abs(s0(this.dot(J),-1,1)))}rotateTowards(J,$){let Q=this.angleTo(J);if(Q===0)return this;let Z=Math.min(1,$/Q);return this.slerp(J,Z),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(J){return this._x*J._x+this._y*J._y+this._z*J._z+this._w*J._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let J=this.length();if(J===0)this._x=0,this._y=0,this._z=0,this._w=1;else J=1/J,this._x=this._x*J,this._y=this._y*J,this._z=this._z*J,this._w=this._w*J;return this._onChangeCallback(),this}multiply(J){return this.multiplyQuaternions(this,J)}premultiply(J){return this.multiplyQuaternions(J,this)}multiplyQuaternions(J,$){let{_x:Q,_y:Z,_z:K,_w:W}=J,X=$._x,H=$._y,q=$._z,Y=$._w;return this._x=Q*Y+W*X+Z*q-K*H,this._y=Z*Y+W*H+K*X-Q*q,this._z=K*Y+W*q+Q*H-Z*X,this._w=W*Y-Q*X-Z*H-K*q,this._onChangeCallback(),this}slerp(J,$){let{_x:Q,_y:Z,_z:K,_w:W}=J,X=this.dot(J);if(X<0)Q=-Q,Z=-Z,K=-K,W=-W,X=-X;let H=1-$;if(X<0.9995){let q=Math.acos(X),Y=Math.sin(q);H=Math.sin(H*q)/Y,$=Math.sin($*q)/Y,this._x=this._x*H+Q*$,this._y=this._y*H+Z*$,this._z=this._z*H+K*$,this._w=this._w*H+W*$,this._onChangeCallback()}else this._x=this._x*H+Q*$,this._y=this._y*H+Z*$,this._z=this._z*H+K*$,this._w=this._w*H+W*$,this.normalize();return this}slerpQuaternions(J,$,Q){return this.copy(J).slerp($,Q)}random(){let J=2*Math.PI*Math.random(),$=2*Math.PI*Math.random(),Q=Math.random(),Z=Math.sqrt(1-Q),K=Math.sqrt(Q);return this.set(Z*Math.sin(J),Z*Math.cos(J),K*Math.sin($),K*Math.cos($))}equals(J){return J._x===this._x&&J._y===this._y&&J._z===this._z&&J._w===this._w}fromArray(J,$=0){return this._x=J[$],this._y=J[$+1],this._z=J[$+2],this._w=J[$+3],this._onChangeCallback(),this}toArray(J=[],$=0){return J[$]=this._x,J[$+1]=this._y,J[$+2]=this._z,J[$+3]=this._w,J}fromBufferAttribute(J,$){return this._x=J.getX($),this._y=J.getY($),this._z=J.getZ($),this._w=J.getW($),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(J){return this._onChangeCallback=J,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class g{constructor(J=0,$=0,Q=0){g.prototype.isVector3=!0,this.x=J,this.y=$,this.z=Q}set(J,$,Q){if(Q===void 0)Q=this.z;return this.x=J,this.y=$,this.z=Q,this}setScalar(J){return this.x=J,this.y=J,this.z=J,this}setX(J){return this.x=J,this}setY(J){return this.y=J,this}setZ(J){return this.z=J,this}setComponent(J,$){switch(J){case 0:this.x=$;break;case 1:this.y=$;break;case 2:this.z=$;break;default:throw Error("index is out of range: "+J)}return this}getComponent(J){switch(J){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("index is out of range: "+J)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(J){return this.x=J.x,this.y=J.y,this.z=J.z,this}add(J){return this.x+=J.x,this.y+=J.y,this.z+=J.z,this}addScalar(J){return this.x+=J,this.y+=J,this.z+=J,this}addVectors(J,$){return this.x=J.x+$.x,this.y=J.y+$.y,this.z=J.z+$.z,this}addScaledVector(J,$){return this.x+=J.x*$,this.y+=J.y*$,this.z+=J.z*$,this}sub(J){return this.x-=J.x,this.y-=J.y,this.z-=J.z,this}subScalar(J){return this.x-=J,this.y-=J,this.z-=J,this}subVectors(J,$){return this.x=J.x-$.x,this.y=J.y-$.y,this.z=J.z-$.z,this}multiply(J){return this.x*=J.x,this.y*=J.y,this.z*=J.z,this}multiplyScalar(J){return this.x*=J,this.y*=J,this.z*=J,this}multiplyVectors(J,$){return this.x=J.x*$.x,this.y=J.y*$.y,this.z=J.z*$.z,this}applyEuler(J){return this.applyQuaternion(HF.setFromEuler(J))}applyAxisAngle(J,$){return this.applyQuaternion(HF.setFromAxisAngle(J,$))}applyMatrix3(J){let $=this.x,Q=this.y,Z=this.z,K=J.elements;return this.x=K[0]*$+K[3]*Q+K[6]*Z,this.y=K[1]*$+K[4]*Q+K[7]*Z,this.z=K[2]*$+K[5]*Q+K[8]*Z,this}applyNormalMatrix(J){return this.applyMatrix3(J).normalize()}applyMatrix4(J){let $=this.x,Q=this.y,Z=this.z,K=J.elements,W=1/(K[3]*$+K[7]*Q+K[11]*Z+K[15]);return this.x=(K[0]*$+K[4]*Q+K[8]*Z+K[12])*W,this.y=(K[1]*$+K[5]*Q+K[9]*Z+K[13])*W,this.z=(K[2]*$+K[6]*Q+K[10]*Z+K[14])*W,this}applyQuaternion(J){let $=this.x,Q=this.y,Z=this.z,K=J.x,W=J.y,X=J.z,H=J.w,q=2*(W*Z-X*Q),Y=2*(X*$-K*Z),N=2*(K*Q-W*$);return this.x=$+H*q+W*N-X*Y,this.y=Q+H*Y+X*q-K*N,this.z=Z+H*N+K*Y-W*q,this}project(J){return this.applyMatrix4(J.matrixWorldInverse).applyMatrix4(J.projectionMatrix)}unproject(J){return this.applyMatrix4(J.projectionMatrixInverse).applyMatrix4(J.matrixWorld)}transformDirection(J){let $=this.x,Q=this.y,Z=this.z,K=J.elements;return this.x=K[0]*$+K[4]*Q+K[8]*Z,this.y=K[1]*$+K[5]*Q+K[9]*Z,this.z=K[2]*$+K[6]*Q+K[10]*Z,this.normalize()}divide(J){return this.x/=J.x,this.y/=J.y,this.z/=J.z,this}divideScalar(J){return this.multiplyScalar(1/J)}min(J){return this.x=Math.min(this.x,J.x),this.y=Math.min(this.y,J.y),this.z=Math.min(this.z,J.z),this}max(J){return this.x=Math.max(this.x,J.x),this.y=Math.max(this.y,J.y),this.z=Math.max(this.z,J.z),this}clamp(J,$){return this.x=s0(this.x,J.x,$.x),this.y=s0(this.y,J.y,$.y),this.z=s0(this.z,J.z,$.z),this}clampScalar(J,$){return this.x=s0(this.x,J,$),this.y=s0(this.y,J,$),this.z=s0(this.z,J,$),this}clampLength(J,$){let Q=this.length();return this.divideScalar(Q||1).multiplyScalar(s0(Q,J,$))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(J){return this.x*J.x+this.y*J.y+this.z*J.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(J){return this.normalize().multiplyScalar(J)}lerp(J,$){return this.x+=(J.x-this.x)*$,this.y+=(J.y-this.y)*$,this.z+=(J.z-this.z)*$,this}lerpVectors(J,$,Q){return this.x=J.x+($.x-J.x)*Q,this.y=J.y+($.y-J.y)*Q,this.z=J.z+($.z-J.z)*Q,this}cross(J){return this.crossVectors(this,J)}crossVectors(J,$){let{x:Q,y:Z,z:K}=J,W=$.x,X=$.y,H=$.z;return this.x=Z*H-K*X,this.y=K*W-Q*H,this.z=Q*X-Z*W,this}projectOnVector(J){let $=J.lengthSq();if($===0)return this.set(0,0,0);let Q=J.dot(this)/$;return this.copy(J).multiplyScalar(Q)}projectOnPlane(J){return TW.copy(this).projectOnVector(J),this.sub(TW)}reflect(J){return this.sub(TW.copy(J).multiplyScalar(2*this.dot(J)))}angleTo(J){let $=Math.sqrt(this.lengthSq()*J.lengthSq());if($===0)return Math.PI/2;let Q=this.dot(J)/$;return Math.acos(s0(Q,-1,1))}distanceTo(J){return Math.sqrt(this.distanceToSquared(J))}distanceToSquared(J){let $=this.x-J.x,Q=this.y-J.y,Z=this.z-J.z;return $*$+Q*Q+Z*Z}manhattanDistanceTo(J){return Math.abs(this.x-J.x)+Math.abs(this.y-J.y)+Math.abs(this.z-J.z)}setFromSpherical(J){return this.setFromSphericalCoords(J.radius,J.phi,J.theta)}setFromSphericalCoords(J,$,Q){let Z=Math.sin($)*J;return this.x=Z*Math.sin(Q),this.y=Math.cos($)*J,this.z=Z*Math.cos(Q),this}setFromCylindrical(J){return this.setFromCylindricalCoords(J.radius,J.theta,J.y)}setFromCylindricalCoords(J,$,Q){return this.x=J*Math.sin($),this.y=Q,this.z=J*Math.cos($),this}setFromMatrixPosition(J){let $=J.elements;return this.x=$[12],this.y=$[13],this.z=$[14],this}setFromMatrixScale(J){let $=this.setFromMatrixColumn(J,0).length(),Q=this.setFromMatrixColumn(J,1).length(),Z=this.setFromMatrixColumn(J,2).length();return this.x=$,this.y=Q,this.z=Z,this}setFromMatrixColumn(J,$){return this.fromArray(J.elements,$*4)}setFromMatrix3Column(J,$){return this.fromArray(J.elements,$*3)}setFromEuler(J){return this.x=J._x,this.y=J._y,this.z=J._z,this}setFromColor(J){return this.x=J.r,this.y=J.g,this.z=J.b,this}equals(J){return J.x===this.x&&J.y===this.y&&J.z===this.z}fromArray(J,$=0){return this.x=J[$],this.y=J[$+1],this.z=J[$+2],this}toArray(J=[],$=0){return J[$]=this.x,J[$+1]=this.y,J[$+2]=this.z,J}fromBufferAttribute(J,$){return this.x=J.getX($),this.y=J.getY($),this.z=J.getZ($),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let J=Math.random()*Math.PI*2,$=Math.random()*2-1,Q=Math.sqrt(1-$*$);return this.x=Q*Math.cos(J),this.y=$,this.z=Q*Math.sin(J),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var TW=new g,HF=new R7;class x0{constructor(J,$,Q,Z,K,W,X,H,q){if(x0.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],J!==void 0)this.set(J,$,Q,Z,K,W,X,H,q)}set(J,$,Q,Z,K,W,X,H,q){let Y=this.elements;return Y[0]=J,Y[1]=Z,Y[2]=X,Y[3]=$,Y[4]=K,Y[5]=H,Y[6]=Q,Y[7]=W,Y[8]=q,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(J){let $=this.elements,Q=J.elements;return $[0]=Q[0],$[1]=Q[1],$[2]=Q[2],$[3]=Q[3],$[4]=Q[4],$[5]=Q[5],$[6]=Q[6],$[7]=Q[7],$[8]=Q[8],this}extractBasis(J,$,Q){return J.setFromMatrix3Column(this,0),$.setFromMatrix3Column(this,1),Q.setFromMatrix3Column(this,2),this}setFromMatrix4(J){let $=J.elements;return this.set($[0],$[4],$[8],$[1],$[5],$[9],$[2],$[6],$[10]),this}multiply(J){return this.multiplyMatrices(this,J)}premultiply(J){return this.multiplyMatrices(J,this)}multiplyMatrices(J,$){let Q=J.elements,Z=$.elements,K=this.elements,W=Q[0],X=Q[3],H=Q[6],q=Q[1],Y=Q[4],N=Q[7],U=Q[2],V=Q[5],z=Q[8],D=Z[0],w=Z[3],F=Z[6],O=Z[1],R=Z[4],B=Z[7],L=Z[2],y=Z[5],_=Z[8];return K[0]=W*D+X*O+H*L,K[3]=W*w+X*R+H*y,K[6]=W*F+X*B+H*_,K[1]=q*D+Y*O+N*L,K[4]=q*w+Y*R+N*y,K[7]=q*F+Y*B+N*_,K[2]=U*D+V*O+z*L,K[5]=U*w+V*R+z*y,K[8]=U*F+V*B+z*_,this}multiplyScalar(J){let $=this.elements;return $[0]*=J,$[3]*=J,$[6]*=J,$[1]*=J,$[4]*=J,$[7]*=J,$[2]*=J,$[5]*=J,$[8]*=J,this}determinant(){let J=this.elements,$=J[0],Q=J[1],Z=J[2],K=J[3],W=J[4],X=J[5],H=J[6],q=J[7],Y=J[8];return $*W*Y-$*X*q-Q*K*Y+Q*X*H+Z*K*q-Z*W*H}invert(){let J=this.elements,$=J[0],Q=J[1],Z=J[2],K=J[3],W=J[4],X=J[5],H=J[6],q=J[7],Y=J[8],N=Y*W-X*q,U=X*H-Y*K,V=q*K-W*H,z=$*N+Q*U+Z*V;if(z===0)return this.set(0,0,0,0,0,0,0,0,0);let D=1/z;return J[0]=N*D,J[1]=(Z*q-Y*Q)*D,J[2]=(X*Q-Z*W)*D,J[3]=U*D,J[4]=(Y*$-Z*H)*D,J[5]=(Z*K-X*$)*D,J[6]=V*D,J[7]=(Q*H-q*$)*D,J[8]=(W*$-Q*K)*D,this}transpose(){let J,$=this.elements;return J=$[1],$[1]=$[3],$[3]=J,J=$[2],$[2]=$[6],$[6]=J,J=$[5],$[5]=$[7],$[7]=J,this}getNormalMatrix(J){return this.setFromMatrix4(J).invert().transpose()}transposeIntoArray(J){let $=this.elements;return J[0]=$[0],J[1]=$[3],J[2]=$[6],J[3]=$[1],J[4]=$[4],J[5]=$[7],J[6]=$[2],J[7]=$[5],J[8]=$[8],this}setUvTransform(J,$,Q,Z,K,W,X){let H=Math.cos(K),q=Math.sin(K);return this.set(Q*H,Q*q,-Q*(H*W+q*X)+W+J,-Z*q,Z*H,-Z*(-q*W+H*X)+X+$,0,0,1),this}scale(J,$){return this.premultiply(yW.makeScale(J,$)),this}rotate(J){return this.premultiply(yW.makeRotation(-J)),this}translate(J,$){return this.premultiply(yW.makeTranslation(J,$)),this}makeTranslation(J,$){if(J.isVector2)this.set(1,0,J.x,0,1,J.y,0,0,1);else this.set(1,0,J,0,1,$,0,0,1);return this}makeRotation(J){let $=Math.cos(J),Q=Math.sin(J);return this.set($,-Q,0,Q,$,0,0,0,1),this}makeScale(J,$){return this.set(J,0,0,0,$,0,0,0,1),this}equals(J){let $=this.elements,Q=J.elements;for(let Z=0;Z<9;Z++)if($[Z]!==Q[Z])return!1;return!0}fromArray(J,$=0){for(let Q=0;Q<9;Q++)this.elements[Q]=J[Q+$];return this}toArray(J=[],$=0){let Q=this.elements;return J[$]=Q[0],J[$+1]=Q[1],J[$+2]=Q[2],J[$+3]=Q[3],J[$+4]=Q[4],J[$+5]=Q[5],J[$+6]=Q[6],J[$+7]=Q[7],J[$+8]=Q[8],J}clone(){return new this.constructor().fromArray(this.elements)}}var yW=new x0,qF=new x0().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),YF=new x0().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function v2(){let J={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(K,W,X){if(this.enabled===!1||W===X||!W||!X)return K;if(this.spaces[W].transfer==="srgb")K.r=w7(K.r),K.g=w7(K.g),K.b=w7(K.b);if(this.spaces[W].primaries!==this.spaces[X].primaries)K.applyMatrix3(this.spaces[W].toXYZ),K.applyMatrix3(this.spaces[X].fromXYZ);if(this.spaces[X].transfer==="srgb")K.r=N9(K.r),K.g=N9(K.g),K.b=N9(K.b);return K},workingToColorSpace:function(K,W){return this.convert(K,this.workingColorSpace,W)},colorSpaceToWorking:function(K,W){return this.convert(K,W,this.workingColorSpace)},getPrimaries:function(K){return this.spaces[K].primaries},getTransfer:function(K){if(K==="")return"linear";return this.spaces[K].transfer},getToneMappingMode:function(K){return this.spaces[K].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(K,W=this.workingColorSpace){return K.fromArray(this.spaces[W].luminanceCoefficients)},define:function(K){Object.assign(this.spaces,K)},_getMatrix:function(K,W,X){return K.copy(this.spaces[W].toXYZ).multiply(this.spaces[X].fromXYZ)},_getDrawingBufferColorSpace:function(K){return this.spaces[K].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(K=this.workingColorSpace){return this.spaces[K].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(K,W){return N$("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),J.workingToColorSpace(K,W)},toWorkingColorSpace:function(K,W){return N$("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),J.colorSpaceToWorking(K,W)}},$=[0.64,0.33,0.3,0.6,0.15,0.06],Q=[0.2126,0.7152,0.0722],Z=[0.3127,0.329];return J.define({["srgb-linear"]:{primaries:$,whitePoint:Z,transfer:"linear",toXYZ:qF,fromXYZ:YF,luminanceCoefficients:Q,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:$,whitePoint:Z,transfer:"srgb",toXYZ:qF,fromXYZ:YF,luminanceCoefficients:Q,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),J}var a0=v2();function w7(J){return J<0.04045?J*0.0773993808:Math.pow(J*0.9478672986+0.0521327014,2.4)}function N9(J){return J<0.0031308?J*12.92:1.055*Math.pow(J,0.41666)-0.055}var rJ;class $H{static getDataURL(J,$="image/png"){if(/^data:/i.test(J.src))return J.src;if(typeof HTMLCanvasElement>"u")return J.src;let Q;if(J instanceof HTMLCanvasElement)Q=J;else{if(rJ===void 0)rJ=Y$("canvas");rJ.width=J.width,rJ.height=J.height;let Z=rJ.getContext("2d");if(J instanceof ImageData)Z.putImageData(J,0,0);else Z.drawImage(J,0,0,J.width,J.height);Q=rJ}return Q.toDataURL($)}static sRGBToLinear(J){if(typeof HTMLImageElement<"u"&&J instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&J instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&J instanceof ImageBitmap){let $=Y$("canvas");$.width=J.width,$.height=J.height;let Q=$.getContext("2d");Q.drawImage(J,0,0,J.width,J.height);let Z=Q.getImageData(0,0,J.width,J.height),K=Z.data;for(let W=0;W<K.length;W++)K[W]=w7(K[W]/255)*255;return Q.putImageData(Z,0,0),$}else if(J.data){let $=J.data.slice(0);for(let Q=0;Q<$.length;Q++)if($ instanceof Uint8Array||$ instanceof Uint8ClampedArray)$[Q]=Math.floor(w7($[Q]/255)*255);else $[Q]=w7($[Q]);return{data:$,width:J.width,height:J.height}}else return b0("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),J}}var f2=0;class I${constructor(J=null){this.isSource=!0,Object.defineProperty(this,"id",{value:f2++}),this.uuid=k$(),this.data=J,this.dataReady=!0,this.version=0}getSize(J){let $=this.data;if(typeof HTMLVideoElement<"u"&&$ instanceof HTMLVideoElement)J.set($.videoWidth,$.videoHeight,0);else if(typeof VideoFrame<"u"&&$ instanceof VideoFrame)J.set($.displayHeight,$.displayWidth,0);else if($!==null)J.set($.width,$.height,$.depth||0);else J.set(0,0,0);return J}set needsUpdate(J){if(J===!0)this.version++}toJSON(J){let $=J===void 0||typeof J==="string";if(!$&&J.images[this.uuid]!==void 0)return J.images[this.uuid];let Q={uuid:this.uuid,url:""},Z=this.data;if(Z!==null){let K;if(Array.isArray(Z)){K=[];for(let W=0,X=Z.length;W<X;W++)if(Z[W].isDataTexture)K.push(bW(Z[W].image));else K.push(bW(Z[W]))}else K=bW(Z);Q.url=K}if(!$)J.images[this.uuid]=Q;return Q}}function bW(J){if(typeof HTMLImageElement<"u"&&J instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&J instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&J instanceof ImageBitmap)return $H.getDataURL(J);else if(J.data)return{data:Array.from(J.data),width:J.width,height:J.height,type:J.data.constructor.name};else return b0("Texture: Unable to serialize Texture."),{}}var h2=0,vW=new g;class e8 extends c7{constructor(J=e8.DEFAULT_IMAGE,$=e8.DEFAULT_MAPPING,Q=1001,Z=1001,K=1006,W=1008,X=1023,H=1009,q=e8.DEFAULT_ANISOTROPY,Y=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:h2++}),this.uuid=k$(),this.name="",this.source=new I$(J),this.mipmaps=[],this.mapping=$,this.channel=0,this.wrapS=Q,this.wrapT=Z,this.magFilter=K,this.minFilter=W,this.anisotropy=q,this.format=X,this.internalFormat=null,this.type=H,this.offset=new Q8(0,0),this.repeat=new Q8(1,1),this.center=new Q8(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new x0,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=Y,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=J&&J.depth&&J.depth>1?!0:!1,this.pmremVersion=0}get width(){return this.source.getSize(vW).x}get height(){return this.source.getSize(vW).y}get depth(){return this.source.getSize(vW).z}get image(){return this.source.data}set image(J=null){this.source.data=J}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(J,$){this.updateRanges.push({start:J,count:$})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(J){return this.name=J.name,this.source=J.source,this.mipmaps=J.mipmaps.slice(0),this.mapping=J.mapping,this.channel=J.channel,this.wrapS=J.wrapS,this.wrapT=J.wrapT,this.magFilter=J.magFilter,this.minFilter=J.minFilter,this.anisotropy=J.anisotropy,this.format=J.format,this.internalFormat=J.internalFormat,this.type=J.type,this.offset.copy(J.offset),this.repeat.copy(J.repeat),this.center.copy(J.center),this.rotation=J.rotation,this.matrixAutoUpdate=J.matrixAutoUpdate,this.matrix.copy(J.matrix),this.generateMipmaps=J.generateMipmaps,this.premultiplyAlpha=J.premultiplyAlpha,this.flipY=J.flipY,this.unpackAlignment=J.unpackAlignment,this.colorSpace=J.colorSpace,this.renderTarget=J.renderTarget,this.isRenderTargetTexture=J.isRenderTargetTexture,this.isArrayTexture=J.isArrayTexture,this.userData=JSON.parse(JSON.stringify(J.userData)),this.needsUpdate=!0,this}setValues(J){for(let $ in J){let Q=J[$];if(Q===void 0){b0(`Texture.setValues(): parameter '${$}' has value of undefined.`);continue}let Z=this[$];if(Z===void 0){b0(`Texture.setValues(): property '${$}' does not exist.`);continue}if(Z&&Q&&(Z.isVector2&&Q.isVector2))Z.copy(Q);else if(Z&&Q&&(Z.isVector3&&Q.isVector3))Z.copy(Q);else if(Z&&Q&&(Z.isMatrix3&&Q.isMatrix3))Z.copy(Q);else this[$]=Q}}toJSON(J){let $=J===void 0||typeof J==="string";if(!$&&J.textures[this.uuid]!==void 0)return J.textures[this.uuid];let Q={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(J).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)Q.userData=this.userData;if(!$)J.textures[this.uuid]=Q;return Q}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(J){if(this.mapping!==300)return J;if(J.applyMatrix3(this.matrix),J.x<0||J.x>1)switch(this.wrapS){case 1000:J.x=J.x-Math.floor(J.x);break;case 1001:J.x=J.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(J.x)%2)===1)J.x=Math.ceil(J.x)-J.x;else J.x=J.x-Math.floor(J.x);break}if(J.y<0||J.y>1)switch(this.wrapT){case 1000:J.y=J.y-Math.floor(J.y);break;case 1001:J.y=J.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(J.y)%2)===1)J.y=Math.ceil(J.y)-J.y;else J.y=J.y-Math.floor(J.y);break}if(this.flipY)J.y=1-J.y;return J}set needsUpdate(J){if(J===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(J){if(J===!0)this.pmremVersion++}}e8.DEFAULT_IMAGE=null;e8.DEFAULT_MAPPING=300;e8.DEFAULT_ANISOTROPY=1;class A8{constructor(J=0,$=0,Q=0,Z=1){A8.prototype.isVector4=!0,this.x=J,this.y=$,this.z=Q,this.w=Z}get width(){return this.z}set width(J){this.z=J}get height(){return this.w}set height(J){this.w=J}set(J,$,Q,Z){return this.x=J,this.y=$,this.z=Q,this.w=Z,this}setScalar(J){return this.x=J,this.y=J,this.z=J,this.w=J,this}setX(J){return this.x=J,this}setY(J){return this.y=J,this}setZ(J){return this.z=J,this}setW(J){return this.w=J,this}setComponent(J,$){switch(J){case 0:this.x=$;break;case 1:this.y=$;break;case 2:this.z=$;break;case 3:this.w=$;break;default:throw Error("index is out of range: "+J)}return this}getComponent(J){switch(J){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("index is out of range: "+J)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(J){return this.x=J.x,this.y=J.y,this.z=J.z,this.w=J.w!==void 0?J.w:1,this}add(J){return this.x+=J.x,this.y+=J.y,this.z+=J.z,this.w+=J.w,this}addScalar(J){return this.x+=J,this.y+=J,this.z+=J,this.w+=J,this}addVectors(J,$){return this.x=J.x+$.x,this.y=J.y+$.y,this.z=J.z+$.z,this.w=J.w+$.w,this}addScaledVector(J,$){return this.x+=J.x*$,this.y+=J.y*$,this.z+=J.z*$,this.w+=J.w*$,this}sub(J){return this.x-=J.x,this.y-=J.y,this.z-=J.z,this.w-=J.w,this}subScalar(J){return this.x-=J,this.y-=J,this.z-=J,this.w-=J,this}subVectors(J,$){return this.x=J.x-$.x,this.y=J.y-$.y,this.z=J.z-$.z,this.w=J.w-$.w,this}multiply(J){return this.x*=J.x,this.y*=J.y,this.z*=J.z,this.w*=J.w,this}multiplyScalar(J){return this.x*=J,this.y*=J,this.z*=J,this.w*=J,this}applyMatrix4(J){let $=this.x,Q=this.y,Z=this.z,K=this.w,W=J.elements;return this.x=W[0]*$+W[4]*Q+W[8]*Z+W[12]*K,this.y=W[1]*$+W[5]*Q+W[9]*Z+W[13]*K,this.z=W[2]*$+W[6]*Q+W[10]*Z+W[14]*K,this.w=W[3]*$+W[7]*Q+W[11]*Z+W[15]*K,this}divide(J){return this.x/=J.x,this.y/=J.y,this.z/=J.z,this.w/=J.w,this}divideScalar(J){return this.multiplyScalar(1/J)}setAxisAngleFromQuaternion(J){this.w=2*Math.acos(J.w);let $=Math.sqrt(1-J.w*J.w);if($<0.0001)this.x=1,this.y=0,this.z=0;else this.x=J.x/$,this.y=J.y/$,this.z=J.z/$;return this}setAxisAngleFromRotationMatrix(J){let $,Q,Z,K,W=0.01,X=0.1,H=J.elements,q=H[0],Y=H[4],N=H[8],U=H[1],V=H[5],z=H[9],D=H[2],w=H[6],F=H[10];if(Math.abs(Y-U)<0.01&&Math.abs(N-D)<0.01&&Math.abs(z-w)<0.01){if(Math.abs(Y+U)<0.1&&Math.abs(N+D)<0.1&&Math.abs(z+w)<0.1&&Math.abs(q+V+F-3)<0.1)return this.set(1,0,0,0),this;$=Math.PI;let R=(q+1)/2,B=(V+1)/2,L=(F+1)/2,y=(Y+U)/4,_=(N+D)/4,j=(z+w)/4;if(R>B&&R>L)if(R<0.01)Q=0,Z=0.707106781,K=0.707106781;else Q=Math.sqrt(R),Z=y/Q,K=_/Q;else if(B>L)if(B<0.01)Q=0.707106781,Z=0,K=0.707106781;else Z=Math.sqrt(B),Q=y/Z,K=j/Z;else if(L<0.01)Q=0.707106781,Z=0.707106781,K=0;else K=Math.sqrt(L),Q=_/K,Z=j/K;return this.set(Q,Z,K,$),this}let O=Math.sqrt((w-z)*(w-z)+(N-D)*(N-D)+(U-Y)*(U-Y));if(Math.abs(O)<0.001)O=1;return this.x=(w-z)/O,this.y=(N-D)/O,this.z=(U-Y)/O,this.w=Math.acos((q+V+F-1)/2),this}setFromMatrixPosition(J){let $=J.elements;return this.x=$[12],this.y=$[13],this.z=$[14],this.w=$[15],this}min(J){return this.x=Math.min(this.x,J.x),this.y=Math.min(this.y,J.y),this.z=Math.min(this.z,J.z),this.w=Math.min(this.w,J.w),this}max(J){return this.x=Math.max(this.x,J.x),this.y=Math.max(this.y,J.y),this.z=Math.max(this.z,J.z),this.w=Math.max(this.w,J.w),this}clamp(J,$){return this.x=s0(this.x,J.x,$.x),this.y=s0(this.y,J.y,$.y),this.z=s0(this.z,J.z,$.z),this.w=s0(this.w,J.w,$.w),this}clampScalar(J,$){return this.x=s0(this.x,J,$),this.y=s0(this.y,J,$),this.z=s0(this.z,J,$),this.w=s0(this.w,J,$),this}clampLength(J,$){let Q=this.length();return this.divideScalar(Q||1).multiplyScalar(s0(Q,J,$))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(J){return this.x*J.x+this.y*J.y+this.z*J.z+this.w*J.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(J){return this.normalize().multiplyScalar(J)}lerp(J,$){return this.x+=(J.x-this.x)*$,this.y+=(J.y-this.y)*$,this.z+=(J.z-this.z)*$,this.w+=(J.w-this.w)*$,this}lerpVectors(J,$,Q){return this.x=J.x+($.x-J.x)*Q,this.y=J.y+($.y-J.y)*Q,this.z=J.z+($.z-J.z)*Q,this.w=J.w+($.w-J.w)*Q,this}equals(J){return J.x===this.x&&J.y===this.y&&J.z===this.z&&J.w===this.w}fromArray(J,$=0){return this.x=J[$],this.y=J[$+1],this.z=J[$+2],this.w=J[$+3],this}toArray(J=[],$=0){return J[$]=this.x,J[$+1]=this.y,J[$+2]=this.z,J[$+3]=this.w,J}fromBufferAttribute(J,$){return this.x=J.getX($),this.y=J.getY($),this.z=J.getZ($),this.w=J.getW($),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class QH extends c7{constructor(J=1,$=1,Q={}){super();Q=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},Q),this.isRenderTarget=!0,this.width=J,this.height=$,this.depth=Q.depth,this.scissor=new A8(0,0,J,$),this.scissorTest=!1,this.viewport=new A8(0,0,J,$),this.textures=[];let Z={width:J,height:$,depth:Q.depth},K=new e8(Z),W=Q.count;for(let X=0;X<W;X++)this.textures[X]=K.clone(),this.textures[X].isRenderTargetTexture=!0,this.textures[X].renderTarget=this;this._setTextureOptions(Q),this.depthBuffer=Q.depthBuffer,this.stencilBuffer=Q.stencilBuffer,this.resolveDepthBuffer=Q.resolveDepthBuffer,this.resolveStencilBuffer=Q.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=Q.depthTexture,this.samples=Q.samples,this.multiview=Q.multiview}_setTextureOptions(J={}){let $={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(J.mapping!==void 0)$.mapping=J.mapping;if(J.wrapS!==void 0)$.wrapS=J.wrapS;if(J.wrapT!==void 0)$.wrapT=J.wrapT;if(J.wrapR!==void 0)$.wrapR=J.wrapR;if(J.magFilter!==void 0)$.magFilter=J.magFilter;if(J.minFilter!==void 0)$.minFilter=J.minFilter;if(J.format!==void 0)$.format=J.format;if(J.type!==void 0)$.type=J.type;if(J.anisotropy!==void 0)$.anisotropy=J.anisotropy;if(J.colorSpace!==void 0)$.colorSpace=J.colorSpace;if(J.flipY!==void 0)$.flipY=J.flipY;if(J.generateMipmaps!==void 0)$.generateMipmaps=J.generateMipmaps;if(J.internalFormat!==void 0)$.internalFormat=J.internalFormat;for(let Q=0;Q<this.textures.length;Q++)this.textures[Q].setValues($)}get texture(){return this.textures[0]}set texture(J){this.textures[0]=J}set depthTexture(J){if(this._depthTexture!==null)this._depthTexture.renderTarget=null;if(J!==null)J.renderTarget=this;this._depthTexture=J}get depthTexture(){return this._depthTexture}setSize(J,$,Q=1){if(this.width!==J||this.height!==$||this.depth!==Q){this.width=J,this.height=$,this.depth=Q;for(let Z=0,K=this.textures.length;Z<K;Z++)if(this.textures[Z].image.width=J,this.textures[Z].image.height=$,this.textures[Z].image.depth=Q,this.textures[Z].isData3DTexture!==!0)this.textures[Z].isArrayTexture=this.textures[Z].image.depth>1;this.dispose()}this.viewport.set(0,0,J,$),this.scissor.set(0,0,J,$)}clone(){return new this.constructor().copy(this)}copy(J){this.width=J.width,this.height=J.height,this.depth=J.depth,this.scissor.copy(J.scissor),this.scissorTest=J.scissorTest,this.viewport.copy(J.viewport),this.textures.length=0;for(let $=0,Q=J.textures.length;$<Q;$++){this.textures[$]=J.textures[$].clone(),this.textures[$].isRenderTargetTexture=!0,this.textures[$].renderTarget=this;let Z=Object.assign({},J.textures[$].image);this.textures[$].source=new I$(Z)}if(this.depthBuffer=J.depthBuffer,this.stencilBuffer=J.stencilBuffer,this.resolveDepthBuffer=J.resolveDepthBuffer,this.resolveStencilBuffer=J.resolveStencilBuffer,J.depthTexture!==null)this.depthTexture=J.depthTexture.clone();return this.samples=J.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class j6 extends QH{constructor(J=1,$=1,Q={}){super(J,$,Q);this.isWebGLRenderTarget=!0}}class cZ extends e8{constructor(J=null,$=1,Q=1,Z=1){super(null);this.isDataArrayTexture=!0,this.image={data:J,width:$,height:Q,depth:Z},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(J){this.layerUpdates.add(J)}clearLayerUpdates(){this.layerUpdates.clear()}}class ZH extends e8{constructor(J=null,$=1,Q=1,Z=1){super(null);this.isData3DTexture=!0,this.image={data:J,width:$,height:Q,depth:Z},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class G8{constructor(J,$,Q,Z,K,W,X,H,q,Y,N,U,V,z,D,w){if(G8.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],J!==void 0)this.set(J,$,Q,Z,K,W,X,H,q,Y,N,U,V,z,D,w)}set(J,$,Q,Z,K,W,X,H,q,Y,N,U,V,z,D,w){let F=this.elements;return F[0]=J,F[4]=$,F[8]=Q,F[12]=Z,F[1]=K,F[5]=W,F[9]=X,F[13]=H,F[2]=q,F[6]=Y,F[10]=N,F[14]=U,F[3]=V,F[7]=z,F[11]=D,F[15]=w,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new G8().fromArray(this.elements)}copy(J){let $=this.elements,Q=J.elements;return $[0]=Q[0],$[1]=Q[1],$[2]=Q[2],$[3]=Q[3],$[4]=Q[4],$[5]=Q[5],$[6]=Q[6],$[7]=Q[7],$[8]=Q[8],$[9]=Q[9],$[10]=Q[10],$[11]=Q[11],$[12]=Q[12],$[13]=Q[13],$[14]=Q[14],$[15]=Q[15],this}copyPosition(J){let $=this.elements,Q=J.elements;return $[12]=Q[12],$[13]=Q[13],$[14]=Q[14],this}setFromMatrix3(J){let $=J.elements;return this.set($[0],$[3],$[6],0,$[1],$[4],$[7],0,$[2],$[5],$[8],0,0,0,0,1),this}extractBasis(J,$,Q){if(this.determinant()===0)return J.set(1,0,0),$.set(0,1,0),Q.set(0,0,1),this;return J.setFromMatrixColumn(this,0),$.setFromMatrixColumn(this,1),Q.setFromMatrixColumn(this,2),this}makeBasis(J,$,Q){return this.set(J.x,$.x,Q.x,0,J.y,$.y,Q.y,0,J.z,$.z,Q.z,0,0,0,0,1),this}extractRotation(J){if(J.determinant()===0)return this.identity();let $=this.elements,Q=J.elements,Z=1/tJ.setFromMatrixColumn(J,0).length(),K=1/tJ.setFromMatrixColumn(J,1).length(),W=1/tJ.setFromMatrixColumn(J,2).length();return $[0]=Q[0]*Z,$[1]=Q[1]*Z,$[2]=Q[2]*Z,$[3]=0,$[4]=Q[4]*K,$[5]=Q[5]*K,$[6]=Q[6]*K,$[7]=0,$[8]=Q[8]*W,$[9]=Q[9]*W,$[10]=Q[10]*W,$[11]=0,$[12]=0,$[13]=0,$[14]=0,$[15]=1,this}makeRotationFromEuler(J){let $=this.elements,Q=J.x,Z=J.y,K=J.z,W=Math.cos(Q),X=Math.sin(Q),H=Math.cos(Z),q=Math.sin(Z),Y=Math.cos(K),N=Math.sin(K);if(J.order==="XYZ"){let U=W*Y,V=W*N,z=X*Y,D=X*N;$[0]=H*Y,$[4]=-H*N,$[8]=q,$[1]=V+z*q,$[5]=U-D*q,$[9]=-X*H,$[2]=D-U*q,$[6]=z+V*q,$[10]=W*H}else if(J.order==="YXZ"){let U=H*Y,V=H*N,z=q*Y,D=q*N;$[0]=U+D*X,$[4]=z*X-V,$[8]=W*q,$[1]=W*N,$[5]=W*Y,$[9]=-X,$[2]=V*X-z,$[6]=D+U*X,$[10]=W*H}else if(J.order==="ZXY"){let U=H*Y,V=H*N,z=q*Y,D=q*N;$[0]=U-D*X,$[4]=-W*N,$[8]=z+V*X,$[1]=V+z*X,$[5]=W*Y,$[9]=D-U*X,$[2]=-W*q,$[6]=X,$[10]=W*H}else if(J.order==="ZYX"){let U=W*Y,V=W*N,z=X*Y,D=X*N;$[0]=H*Y,$[4]=z*q-V,$[8]=U*q+D,$[1]=H*N,$[5]=D*q+U,$[9]=V*q-z,$[2]=-q,$[6]=X*H,$[10]=W*H}else if(J.order==="YZX"){let U=W*H,V=W*q,z=X*H,D=X*q;$[0]=H*Y,$[4]=D-U*N,$[8]=z*N+V,$[1]=N,$[5]=W*Y,$[9]=-X*Y,$[2]=-q*Y,$[6]=V*N+z,$[10]=U-D*N}else if(J.order==="XZY"){let U=W*H,V=W*q,z=X*H,D=X*q;$[0]=H*Y,$[4]=-N,$[8]=q*Y,$[1]=U*N+D,$[5]=W*Y,$[9]=V*N-z,$[2]=z*N-V,$[6]=X*Y,$[10]=D*N+U}return $[3]=0,$[7]=0,$[11]=0,$[12]=0,$[13]=0,$[14]=0,$[15]=1,this}makeRotationFromQuaternion(J){return this.compose(x2,J,g2)}lookAt(J,$,Q){let Z=this.elements;if(I6.subVectors(J,$),I6.lengthSq()===0)I6.z=1;if(I6.normalize(),f7.crossVectors(Q,I6),f7.lengthSq()===0){if(Math.abs(Q.z)===1)I6.x+=0.0001;else I6.z+=0.0001;I6.normalize(),f7.crossVectors(Q,I6)}return f7.normalize(),UZ.crossVectors(I6,f7),Z[0]=f7.x,Z[4]=UZ.x,Z[8]=I6.x,Z[1]=f7.y,Z[5]=UZ.y,Z[9]=I6.y,Z[2]=f7.z,Z[6]=UZ.z,Z[10]=I6.z,this}multiply(J){return this.multiplyMatrices(this,J)}premultiply(J){return this.multiplyMatrices(J,this)}multiplyMatrices(J,$){let Q=J.elements,Z=$.elements,K=this.elements,W=Q[0],X=Q[4],H=Q[8],q=Q[12],Y=Q[1],N=Q[5],U=Q[9],V=Q[13],z=Q[2],D=Q[6],w=Q[10],F=Q[14],O=Q[3],R=Q[7],B=Q[11],L=Q[15],y=Z[0],_=Z[4],j=Z[8],I=Z[12],E=Z[1],u=Z[5],C=Z[9],p=Z[13],n=Z[2],f=Z[6],i=Z[10],d=Z[14],m=Z[3],J0=Z[7],$0=Z[11],U0=Z[15];return K[0]=W*y+X*E+H*n+q*m,K[4]=W*_+X*u+H*f+q*J0,K[8]=W*j+X*C+H*i+q*$0,K[12]=W*I+X*p+H*d+q*U0,K[1]=Y*y+N*E+U*n+V*m,K[5]=Y*_+N*u+U*f+V*J0,K[9]=Y*j+N*C+U*i+V*$0,K[13]=Y*I+N*p+U*d+V*U0,K[2]=z*y+D*E+w*n+F*m,K[6]=z*_+D*u+w*f+F*J0,K[10]=z*j+D*C+w*i+F*$0,K[14]=z*I+D*p+w*d+F*U0,K[3]=O*y+R*E+B*n+L*m,K[7]=O*_+R*u+B*f+L*J0,K[11]=O*j+R*C+B*i+L*$0,K[15]=O*I+R*p+B*d+L*U0,this}multiplyScalar(J){let $=this.elements;return $[0]*=J,$[4]*=J,$[8]*=J,$[12]*=J,$[1]*=J,$[5]*=J,$[9]*=J,$[13]*=J,$[2]*=J,$[6]*=J,$[10]*=J,$[14]*=J,$[3]*=J,$[7]*=J,$[11]*=J,$[15]*=J,this}determinant(){let J=this.elements,$=J[0],Q=J[4],Z=J[8],K=J[12],W=J[1],X=J[5],H=J[9],q=J[13],Y=J[2],N=J[6],U=J[10],V=J[14],z=J[3],D=J[7],w=J[11],F=J[15],O=H*V-q*U,R=X*V-q*N,B=X*U-H*N,L=W*V-q*Y,y=W*U-H*Y,_=W*N-X*Y;return $*(D*O-w*R+F*B)-Q*(z*O-w*L+F*y)+Z*(z*R-D*L+F*_)-K*(z*B-D*y+w*_)}transpose(){let J=this.elements,$;return $=J[1],J[1]=J[4],J[4]=$,$=J[2],J[2]=J[8],J[8]=$,$=J[6],J[6]=J[9],J[9]=$,$=J[3],J[3]=J[12],J[12]=$,$=J[7],J[7]=J[13],J[13]=$,$=J[11],J[11]=J[14],J[14]=$,this}setPosition(J,$,Q){let Z=this.elements;if(J.isVector3)Z[12]=J.x,Z[13]=J.y,Z[14]=J.z;else Z[12]=J,Z[13]=$,Z[14]=Q;return this}invert(){let J=this.elements,$=J[0],Q=J[1],Z=J[2],K=J[3],W=J[4],X=J[5],H=J[6],q=J[7],Y=J[8],N=J[9],U=J[10],V=J[11],z=J[12],D=J[13],w=J[14],F=J[15],O=$*X-Q*W,R=$*H-Z*W,B=$*q-K*W,L=Q*H-Z*X,y=Q*q-K*X,_=Z*q-K*H,j=Y*D-N*z,I=Y*w-U*z,E=Y*F-V*z,u=N*w-U*D,C=N*F-V*D,p=U*F-V*w,n=O*p-R*C+B*u+L*E-y*I+_*j;if(n===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let f=1/n;return J[0]=(X*p-H*C+q*u)*f,J[1]=(Z*C-Q*p-K*u)*f,J[2]=(D*_-w*y+F*L)*f,J[3]=(U*y-N*_-V*L)*f,J[4]=(H*E-W*p-q*I)*f,J[5]=($*p-Z*E+K*I)*f,J[6]=(w*B-z*_-F*R)*f,J[7]=(Y*_-U*B+V*R)*f,J[8]=(W*C-X*E+q*j)*f,J[9]=(Q*E-$*C-K*j)*f,J[10]=(z*y-D*B+F*O)*f,J[11]=(N*B-Y*y-V*O)*f,J[12]=(X*I-W*u-H*j)*f,J[13]=($*u-Q*I+Z*j)*f,J[14]=(D*R-z*L-w*O)*f,J[15]=(Y*L-N*R+U*O)*f,this}scale(J){let $=this.elements,Q=J.x,Z=J.y,K=J.z;return $[0]*=Q,$[4]*=Z,$[8]*=K,$[1]*=Q,$[5]*=Z,$[9]*=K,$[2]*=Q,$[6]*=Z,$[10]*=K,$[3]*=Q,$[7]*=Z,$[11]*=K,this}getMaxScaleOnAxis(){let J=this.elements,$=J[0]*J[0]+J[1]*J[1]+J[2]*J[2],Q=J[4]*J[4]+J[5]*J[5]+J[6]*J[6],Z=J[8]*J[8]+J[9]*J[9]+J[10]*J[10];return Math.sqrt(Math.max($,Q,Z))}makeTranslation(J,$,Q){if(J.isVector3)this.set(1,0,0,J.x,0,1,0,J.y,0,0,1,J.z,0,0,0,1);else this.set(1,0,0,J,0,1,0,$,0,0,1,Q,0,0,0,1);return this}makeRotationX(J){let $=Math.cos(J),Q=Math.sin(J);return this.set(1,0,0,0,0,$,-Q,0,0,Q,$,0,0,0,0,1),this}makeRotationY(J){let $=Math.cos(J),Q=Math.sin(J);return this.set($,0,Q,0,0,1,0,0,-Q,0,$,0,0,0,0,1),this}makeRotationZ(J){let $=Math.cos(J),Q=Math.sin(J);return this.set($,-Q,0,0,Q,$,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(J,$){let Q=Math.cos($),Z=Math.sin($),K=1-Q,W=J.x,X=J.y,H=J.z,q=K*W,Y=K*X;return this.set(q*W+Q,q*X-Z*H,q*H+Z*X,0,q*X+Z*H,Y*X+Q,Y*H-Z*W,0,q*H-Z*X,Y*H+Z*W,K*H*H+Q,0,0,0,0,1),this}makeScale(J,$,Q){return this.set(J,0,0,0,0,$,0,0,0,0,Q,0,0,0,0,1),this}makeShear(J,$,Q,Z,K,W){return this.set(1,Q,K,0,J,1,W,0,$,Z,1,0,0,0,0,1),this}compose(J,$,Q){let Z=this.elements,K=$._x,W=$._y,X=$._z,H=$._w,q=K+K,Y=W+W,N=X+X,U=K*q,V=K*Y,z=K*N,D=W*Y,w=W*N,F=X*N,O=H*q,R=H*Y,B=H*N,L=Q.x,y=Q.y,_=Q.z;return Z[0]=(1-(D+F))*L,Z[1]=(V+B)*L,Z[2]=(z-R)*L,Z[3]=0,Z[4]=(V-B)*y,Z[5]=(1-(U+F))*y,Z[6]=(w+O)*y,Z[7]=0,Z[8]=(z+R)*_,Z[9]=(w-O)*_,Z[10]=(1-(U+D))*_,Z[11]=0,Z[12]=J.x,Z[13]=J.y,Z[14]=J.z,Z[15]=1,this}decompose(J,$,Q){let Z=this.elements;J.x=Z[12],J.y=Z[13],J.z=Z[14];let K=this.determinant();if(K===0)return Q.set(1,1,1),$.identity(),this;let W=tJ.set(Z[0],Z[1],Z[2]).length(),X=tJ.set(Z[4],Z[5],Z[6]).length(),H=tJ.set(Z[8],Z[9],Z[10]).length();if(K<0)W=-W;g6.copy(this);let q=1/W,Y=1/X,N=1/H;return g6.elements[0]*=q,g6.elements[1]*=q,g6.elements[2]*=q,g6.elements[4]*=Y,g6.elements[5]*=Y,g6.elements[6]*=Y,g6.elements[8]*=N,g6.elements[9]*=N,g6.elements[10]*=N,$.setFromRotationMatrix(g6),Q.x=W,Q.y=X,Q.z=H,this}makePerspective(J,$,Q,Z,K,W,X=2000,H=!1){let q=this.elements,Y=2*K/($-J),N=2*K/(Q-Z),U=($+J)/($-J),V=(Q+Z)/(Q-Z),z,D;if(H)z=K/(W-K),D=W*K/(W-K);else if(X===2000)z=-(W+K)/(W-K),D=-2*W*K/(W-K);else if(X===2001)z=-W/(W-K),D=-W*K/(W-K);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+X);return q[0]=Y,q[4]=0,q[8]=U,q[12]=0,q[1]=0,q[5]=N,q[9]=V,q[13]=0,q[2]=0,q[6]=0,q[10]=z,q[14]=D,q[3]=0,q[7]=0,q[11]=-1,q[15]=0,this}makeOrthographic(J,$,Q,Z,K,W,X=2000,H=!1){let q=this.elements,Y=2/($-J),N=2/(Q-Z),U=-($+J)/($-J),V=-(Q+Z)/(Q-Z),z,D;if(H)z=1/(W-K),D=W/(W-K);else if(X===2000)z=-2/(W-K),D=-(W+K)/(W-K);else if(X===2001)z=-1/(W-K),D=-K/(W-K);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+X);return q[0]=Y,q[4]=0,q[8]=0,q[12]=U,q[1]=0,q[5]=N,q[9]=0,q[13]=V,q[2]=0,q[6]=0,q[10]=z,q[14]=D,q[3]=0,q[7]=0,q[11]=0,q[15]=1,this}equals(J){let $=this.elements,Q=J.elements;for(let Z=0;Z<16;Z++)if($[Z]!==Q[Z])return!1;return!0}fromArray(J,$=0){for(let Q=0;Q<16;Q++)this.elements[Q]=J[Q+$];return this}toArray(J=[],$=0){let Q=this.elements;return J[$]=Q[0],J[$+1]=Q[1],J[$+2]=Q[2],J[$+3]=Q[3],J[$+4]=Q[4],J[$+5]=Q[5],J[$+6]=Q[6],J[$+7]=Q[7],J[$+8]=Q[8],J[$+9]=Q[9],J[$+10]=Q[10],J[$+11]=Q[11],J[$+12]=Q[12],J[$+13]=Q[13],J[$+14]=Q[14],J[$+15]=Q[15],J}}var tJ=new g,g6=new G8,x2=new g(0,0,0),g2=new g(1,1,1),f7=new g,UZ=new g,I6=new g,NF=new G8,UF=new R7;class t6{constructor(J=0,$=0,Q=0,Z=t6.DEFAULT_ORDER){this.isEuler=!0,this._x=J,this._y=$,this._z=Q,this._order=Z}get x(){return this._x}set x(J){this._x=J,this._onChangeCallback()}get y(){return this._y}set y(J){this._y=J,this._onChangeCallback()}get z(){return this._z}set z(J){this._z=J,this._onChangeCallback()}get order(){return this._order}set order(J){this._order=J,this._onChangeCallback()}set(J,$,Q,Z=this._order){return this._x=J,this._y=$,this._z=Q,this._order=Z,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(J){return this._x=J._x,this._y=J._y,this._z=J._z,this._order=J._order,this._onChangeCallback(),this}setFromRotationMatrix(J,$=this._order,Q=!0){let Z=J.elements,K=Z[0],W=Z[4],X=Z[8],H=Z[1],q=Z[5],Y=Z[9],N=Z[2],U=Z[6],V=Z[10];switch($){case"XYZ":if(this._y=Math.asin(s0(X,-1,1)),Math.abs(X)<0.9999999)this._x=Math.atan2(-Y,V),this._z=Math.atan2(-W,K);else this._x=Math.atan2(U,q),this._z=0;break;case"YXZ":if(this._x=Math.asin(-s0(Y,-1,1)),Math.abs(Y)<0.9999999)this._y=Math.atan2(X,V),this._z=Math.atan2(H,q);else this._y=Math.atan2(-N,K),this._z=0;break;case"ZXY":if(this._x=Math.asin(s0(U,-1,1)),Math.abs(U)<0.9999999)this._y=Math.atan2(-N,V),this._z=Math.atan2(-W,q);else this._y=0,this._z=Math.atan2(H,K);break;case"ZYX":if(this._y=Math.asin(-s0(N,-1,1)),Math.abs(N)<0.9999999)this._x=Math.atan2(U,V),this._z=Math.atan2(H,K);else this._x=0,this._z=Math.atan2(-W,q);break;case"YZX":if(this._z=Math.asin(s0(H,-1,1)),Math.abs(H)<0.9999999)this._x=Math.atan2(-Y,q),this._y=Math.atan2(-N,K);else this._x=0,this._y=Math.atan2(X,V);break;case"XZY":if(this._z=Math.asin(-s0(W,-1,1)),Math.abs(W)<0.9999999)this._x=Math.atan2(U,q),this._y=Math.atan2(X,K);else this._x=Math.atan2(-Y,V),this._y=0;break;default:b0("Euler: .setFromRotationMatrix() encountered an unknown order: "+$)}if(this._order=$,Q===!0)this._onChangeCallback();return this}setFromQuaternion(J,$,Q){return NF.makeRotationFromQuaternion(J),this.setFromRotationMatrix(NF,$,Q)}setFromVector3(J,$=this._order){return this.set(J.x,J.y,J.z,$)}reorder(J){return UF.setFromEuler(this),this.setFromQuaternion(UF,J)}equals(J){return J._x===this._x&&J._y===this._y&&J._z===this._z&&J._order===this._order}fromArray(J){if(this._x=J[0],this._y=J[1],this._z=J[2],J[3]!==void 0)this._order=J[3];return this._onChangeCallback(),this}toArray(J=[],$=0){return J[$]=this._x,J[$+1]=this._y,J[$+2]=this._z,J[$+3]=this._order,J}_onChange(J){return this._onChangeCallback=J,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}t6.DEFAULT_ORDER="XYZ";class uZ{constructor(){this.mask=1}set(J){this.mask=(1<<J|0)>>>0}enable(J){this.mask|=1<<J|0}enableAll(){this.mask=-1}toggle(J){this.mask^=1<<J|0}disable(J){this.mask&=~(1<<J|0)}disableAll(){this.mask=0}test(J){return(this.mask&J.mask)!==0}isEnabled(J){return(this.mask&(1<<J|0))!==0}}var p2=0,VF=new g,eJ=new R7,O7=new G8,VZ=new g,W$=new g,m2=new g,d2=new R7,OF=new g(1,0,0),FF=new g(0,1,0),zF=new g(0,0,1),DF={type:"added"},l2={type:"removed"},J9={type:"childadded",child:null},fW={type:"childremoved",child:null};class J6 extends c7{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:p2++}),this.uuid=k$(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=J6.DEFAULT_UP.clone();let J=new g,$=new t6,Q=new R7,Z=new g(1,1,1);function K(){Q.setFromEuler($,!1)}function W(){$.setFromQuaternion(Q,void 0,!1)}$._onChange(K),Q._onChange(W),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:J},rotation:{configurable:!0,enumerable:!0,value:$},quaternion:{configurable:!0,enumerable:!0,value:Q},scale:{configurable:!0,enumerable:!0,value:Z},modelViewMatrix:{value:new G8},normalMatrix:{value:new x0}}),this.matrix=new G8,this.matrixWorld=new G8,this.matrixAutoUpdate=J6.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=J6.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new uZ,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(J){if(this.matrixAutoUpdate)this.updateMatrix();this.matrix.premultiply(J),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(J){return this.quaternion.premultiply(J),this}setRotationFromAxisAngle(J,$){this.quaternion.setFromAxisAngle(J,$)}setRotationFromEuler(J){this.quaternion.setFromEuler(J,!0)}setRotationFromMatrix(J){this.quaternion.setFromRotationMatrix(J)}setRotationFromQuaternion(J){this.quaternion.copy(J)}rotateOnAxis(J,$){return eJ.setFromAxisAngle(J,$),this.quaternion.multiply(eJ),this}rotateOnWorldAxis(J,$){return eJ.setFromAxisAngle(J,$),this.quaternion.premultiply(eJ),this}rotateX(J){return this.rotateOnAxis(OF,J)}rotateY(J){return this.rotateOnAxis(FF,J)}rotateZ(J){return this.rotateOnAxis(zF,J)}translateOnAxis(J,$){return VF.copy(J).applyQuaternion(this.quaternion),this.position.add(VF.multiplyScalar($)),this}translateX(J){return this.translateOnAxis(OF,J)}translateY(J){return this.translateOnAxis(FF,J)}translateZ(J){return this.translateOnAxis(zF,J)}localToWorld(J){return this.updateWorldMatrix(!0,!1),J.applyMatrix4(this.matrixWorld)}worldToLocal(J){return this.updateWorldMatrix(!0,!1),J.applyMatrix4(O7.copy(this.matrixWorld).invert())}lookAt(J,$,Q){if(J.isVector3)VZ.copy(J);else VZ.set(J,$,Q);let Z=this.parent;if(this.updateWorldMatrix(!0,!1),W$.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)O7.lookAt(W$,VZ,this.up);else O7.lookAt(VZ,W$,this.up);if(this.quaternion.setFromRotationMatrix(O7),Z)O7.extractRotation(Z.matrixWorld),eJ.setFromRotationMatrix(O7),this.quaternion.premultiply(eJ.invert())}add(J){if(arguments.length>1){for(let $=0;$<arguments.length;$++)this.add(arguments[$]);return this}if(J===this)return y0("Object3D.add: object can't be added as a child of itself.",J),this;if(J&&J.isObject3D)J.removeFromParent(),J.parent=this,this.children.push(J),J.dispatchEvent(DF),J9.child=J,this.dispatchEvent(J9),J9.child=null;else y0("Object3D.add: object not an instance of THREE.Object3D.",J);return this}remove(J){if(arguments.length>1){for(let Q=0;Q<arguments.length;Q++)this.remove(arguments[Q]);return this}let $=this.children.indexOf(J);if($!==-1)J.parent=null,this.children.splice($,1),J.dispatchEvent(l2),fW.child=J,this.dispatchEvent(fW),fW.child=null;return this}removeFromParent(){let J=this.parent;if(J!==null)J.remove(this);return this}clear(){return this.remove(...this.children)}attach(J){if(this.updateWorldMatrix(!0,!1),O7.copy(this.matrixWorld).invert(),J.parent!==null)J.parent.updateWorldMatrix(!0,!1),O7.multiply(J.parent.matrixWorld);return J.applyMatrix4(O7),J.removeFromParent(),J.parent=this,this.children.push(J),J.updateWorldMatrix(!1,!0),J.dispatchEvent(DF),J9.child=J,this.dispatchEvent(J9),J9.child=null,this}getObjectById(J){return this.getObjectByProperty("id",J)}getObjectByName(J){return this.getObjectByProperty("name",J)}getObjectByProperty(J,$){if(this[J]===$)return this;for(let Q=0,Z=this.children.length;Q<Z;Q++){let W=this.children[Q].getObjectByProperty(J,$);if(W!==void 0)return W}return}getObjectsByProperty(J,$,Q=[]){if(this[J]===$)Q.push(this);let Z=this.children;for(let K=0,W=Z.length;K<W;K++)Z[K].getObjectsByProperty(J,$,Q);return Q}getWorldPosition(J){return this.updateWorldMatrix(!0,!1),J.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(J){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(W$,J,m2),J}getWorldScale(J){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(W$,d2,J),J}getWorldDirection(J){this.updateWorldMatrix(!0,!1);let $=this.matrixWorld.elements;return J.set($[8],$[9],$[10]).normalize()}raycast(){}traverse(J){J(this);let $=this.children;for(let Q=0,Z=$.length;Q<Z;Q++)$[Q].traverse(J)}traverseVisible(J){if(this.visible===!1)return;J(this);let $=this.children;for(let Q=0,Z=$.length;Q<Z;Q++)$[Q].traverseVisible(J)}traverseAncestors(J){let $=this.parent;if($!==null)J($),$.traverseAncestors(J)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let J=this.pivot;if(J!==null){let{x:$,y:Q,z:Z}=J,K=this.matrix.elements;K[12]+=$-K[0]*$-K[4]*Q-K[8]*Z,K[13]+=Q-K[1]*$-K[5]*Q-K[9]*Z,K[14]+=Z-K[2]*$-K[6]*Q-K[10]*Z}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(J){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||J){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,J=!0}let $=this.children;for(let Q=0,Z=$.length;Q<Z;Q++)$[Q].updateMatrixWorld(J)}updateWorldMatrix(J,$){let Q=this.parent;if(J===!0&&Q!==null)Q.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);if($===!0){let Z=this.children;for(let K=0,W=Z.length;K<W;K++)Z[K].updateWorldMatrix(!1,!0)}}toJSON(J){let $=J===void 0||typeof J==="string",Q={};if($)J={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},Q.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let Z={};if(Z.uuid=this.uuid,Z.type=this.type,this.name!=="")Z.name=this.name;if(this.castShadow===!0)Z.castShadow=!0;if(this.receiveShadow===!0)Z.receiveShadow=!0;if(this.visible===!1)Z.visible=!1;if(this.frustumCulled===!1)Z.frustumCulled=!1;if(this.renderOrder!==0)Z.renderOrder=this.renderOrder;if(this.static!==!1)Z.static=this.static;if(Object.keys(this.userData).length>0)Z.userData=this.userData;if(Z.layers=this.layers.mask,Z.matrix=this.matrix.toArray(),Z.up=this.up.toArray(),this.pivot!==null)Z.pivot=this.pivot.toArray();if(this.matrixAutoUpdate===!1)Z.matrixAutoUpdate=!1;if(this.morphTargetDictionary!==void 0)Z.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)Z.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(Z.type="InstancedMesh",Z.count=this.count,Z.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)Z.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(Z.type="BatchedMesh",Z.perObjectFrustumCulled=this.perObjectFrustumCulled,Z.sortObjects=this.sortObjects,Z.drawRanges=this._drawRanges,Z.reservedRanges=this._reservedRanges,Z.geometryInfo=this._geometryInfo.map((X)=>({...X,boundingBox:X.boundingBox?X.boundingBox.toJSON():void 0,boundingSphere:X.boundingSphere?X.boundingSphere.toJSON():void 0})),Z.instanceInfo=this._instanceInfo.map((X)=>({...X})),Z.availableInstanceIds=this._availableInstanceIds.slice(),Z.availableGeometryIds=this._availableGeometryIds.slice(),Z.nextIndexStart=this._nextIndexStart,Z.nextVertexStart=this._nextVertexStart,Z.geometryCount=this._geometryCount,Z.maxInstanceCount=this._maxInstanceCount,Z.maxVertexCount=this._maxVertexCount,Z.maxIndexCount=this._maxIndexCount,Z.geometryInitialized=this._geometryInitialized,Z.matricesTexture=this._matricesTexture.toJSON(J),Z.indirectTexture=this._indirectTexture.toJSON(J),this._colorsTexture!==null)Z.colorsTexture=this._colorsTexture.toJSON(J);if(this.boundingSphere!==null)Z.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)Z.boundingBox=this.boundingBox.toJSON()}function K(X,H){if(X[H.uuid]===void 0)X[H.uuid]=H.toJSON(J);return H.uuid}if(this.isScene){if(this.background){if(this.background.isColor)Z.background=this.background.toJSON();else if(this.background.isTexture)Z.background=this.background.toJSON(J).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)Z.environment=this.environment.toJSON(J).uuid}else if(this.isMesh||this.isLine||this.isPoints){Z.geometry=K(J.geometries,this.geometry);let X=this.geometry.parameters;if(X!==void 0&&X.shapes!==void 0){let H=X.shapes;if(Array.isArray(H))for(let q=0,Y=H.length;q<Y;q++){let N=H[q];K(J.shapes,N)}else K(J.shapes,H)}}if(this.isSkinnedMesh){if(Z.bindMode=this.bindMode,Z.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)K(J.skeletons,this.skeleton),Z.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let X=[];for(let H=0,q=this.material.length;H<q;H++)X.push(K(J.materials,this.material[H]));Z.material=X}else Z.material=K(J.materials,this.material);if(this.children.length>0){Z.children=[];for(let X=0;X<this.children.length;X++)Z.children.push(this.children[X].toJSON(J).object)}if(this.animations.length>0){Z.animations=[];for(let X=0;X<this.animations.length;X++){let H=this.animations[X];Z.animations.push(K(J.animations,H))}}if($){let X=W(J.geometries),H=W(J.materials),q=W(J.textures),Y=W(J.images),N=W(J.shapes),U=W(J.skeletons),V=W(J.animations),z=W(J.nodes);if(X.length>0)Q.geometries=X;if(H.length>0)Q.materials=H;if(q.length>0)Q.textures=q;if(Y.length>0)Q.images=Y;if(N.length>0)Q.shapes=N;if(U.length>0)Q.skeletons=U;if(V.length>0)Q.animations=V;if(z.length>0)Q.nodes=z}return Q.object=Z,Q;function W(X){let H=[];for(let q in X){let Y=X[q];delete Y.metadata,H.push(Y)}return H}}clone(J){return new this.constructor().copy(this,J)}copy(J,$=!0){if(this.name=J.name,this.up.copy(J.up),this.position.copy(J.position),this.rotation.order=J.rotation.order,this.quaternion.copy(J.quaternion),this.scale.copy(J.scale),J.pivot!==null)this.pivot=J.pivot.clone();if(this.matrix.copy(J.matrix),this.matrixWorld.copy(J.matrixWorld),this.matrixAutoUpdate=J.matrixAutoUpdate,this.matrixWorldAutoUpdate=J.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=J.matrixWorldNeedsUpdate,this.layers.mask=J.layers.mask,this.visible=J.visible,this.castShadow=J.castShadow,this.receiveShadow=J.receiveShadow,this.frustumCulled=J.frustumCulled,this.renderOrder=J.renderOrder,this.static=J.static,this.animations=J.animations.slice(),this.userData=JSON.parse(JSON.stringify(J.userData)),$===!0)for(let Q=0;Q<J.children.length;Q++){let Z=J.children[Q];this.add(Z.clone())}return this}}J6.DEFAULT_UP=new g(0,1,0);J6.DEFAULT_MATRIX_AUTO_UPDATE=!0;J6.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Y9 extends J6{constructor(){super();this.isGroup=!0,this.type="Group"}}var c2={type:"move"};class w${constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new Y9,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new Y9,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new g,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new g;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new Y9,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new g,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new g;return this._grip}dispatchEvent(J){if(this._targetRay!==null)this._targetRay.dispatchEvent(J);if(this._grip!==null)this._grip.dispatchEvent(J);if(this._hand!==null)this._hand.dispatchEvent(J);return this}connect(J){if(J&&J.hand){let $=this._hand;if($)for(let Q of J.hand.values())this._getHandJoint($,Q)}return this.dispatchEvent({type:"connected",data:J}),this}disconnect(J){if(this.dispatchEvent({type:"disconnected",data:J}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(J,$,Q){let Z=null,K=null,W=null,X=this._targetRay,H=this._grip,q=this._hand;if(J&&$.session.visibilityState!=="visible-blurred"){if(q&&J.hand){W=!0;for(let D of J.hand.values()){let w=$.getJointPose(D,Q),F=this._getHandJoint(q,D);if(w!==null)F.matrix.fromArray(w.transform.matrix),F.matrix.decompose(F.position,F.rotation,F.scale),F.matrixWorldNeedsUpdate=!0,F.jointRadius=w.radius;F.visible=w!==null}let Y=q.joints["index-finger-tip"],N=q.joints["thumb-tip"],U=Y.position.distanceTo(N.position),V=0.02,z=0.005;if(q.inputState.pinching&&U>V+z)q.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:J.handedness,target:this});else if(!q.inputState.pinching&&U<=V-z)q.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:J.handedness,target:this})}else if(H!==null&&J.gripSpace){if(K=$.getPose(J.gripSpace,Q),K!==null){if(H.matrix.fromArray(K.transform.matrix),H.matrix.decompose(H.position,H.rotation,H.scale),H.matrixWorldNeedsUpdate=!0,K.linearVelocity)H.hasLinearVelocity=!0,H.linearVelocity.copy(K.linearVelocity);else H.hasLinearVelocity=!1;if(K.angularVelocity)H.hasAngularVelocity=!0,H.angularVelocity.copy(K.angularVelocity);else H.hasAngularVelocity=!1}}if(X!==null){if(Z=$.getPose(J.targetRaySpace,Q),Z===null&&K!==null)Z=K;if(Z!==null){if(X.matrix.fromArray(Z.transform.matrix),X.matrix.decompose(X.position,X.rotation,X.scale),X.matrixWorldNeedsUpdate=!0,Z.linearVelocity)X.hasLinearVelocity=!0,X.linearVelocity.copy(Z.linearVelocity);else X.hasLinearVelocity=!1;if(Z.angularVelocity)X.hasAngularVelocity=!0,X.angularVelocity.copy(Z.angularVelocity);else X.hasAngularVelocity=!1;this.dispatchEvent(c2)}}}if(X!==null)X.visible=Z!==null;if(H!==null)H.visible=K!==null;if(q!==null)q.visible=W!==null;return this}_getHandJoint(J,$){if(J.joints[$.jointName]===void 0){let Q=new Y9;Q.matrixAutoUpdate=!1,Q.visible=!1,J.joints[$.jointName]=Q,J.add(Q)}return J.joints[$.jointName]}}var jz={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},h7={h:0,s:0,l:0},OZ={h:0,s:0,l:0};function hW(J,$,Q){if(Q<0)Q+=1;if(Q>1)Q-=1;if(Q<0.16666666666666666)return J+($-J)*6*Q;if(Q<0.5)return $;if(Q<0.6666666666666666)return J+($-J)*6*(0.6666666666666666-Q);return J}class l0{constructor(J,$,Q){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(J,$,Q)}set(J,$,Q){if($===void 0&&Q===void 0){let Z=J;if(Z&&Z.isColor)this.copy(Z);else if(typeof Z==="number")this.setHex(Z);else if(typeof Z==="string")this.setStyle(Z)}else this.setRGB(J,$,Q);return this}setScalar(J){return this.r=J,this.g=J,this.b=J,this}setHex(J,$="srgb"){return J=Math.floor(J),this.r=(J>>16&255)/255,this.g=(J>>8&255)/255,this.b=(J&255)/255,a0.colorSpaceToWorking(this,$),this}setRGB(J,$,Q,Z=a0.workingColorSpace){return this.r=J,this.g=$,this.b=Q,a0.colorSpaceToWorking(this,Z),this}setHSL(J,$,Q,Z=a0.workingColorSpace){if(J=b2(J,1),$=s0($,0,1),Q=s0(Q,0,1),$===0)this.r=this.g=this.b=Q;else{let K=Q<=0.5?Q*(1+$):Q+$-Q*$,W=2*Q-K;this.r=hW(W,K,J+0.3333333333333333),this.g=hW(W,K,J),this.b=hW(W,K,J-0.3333333333333333)}return a0.colorSpaceToWorking(this,Z),this}setStyle(J,$="srgb"){function Q(K){if(K===void 0)return;if(parseFloat(K)<1)b0("Color: Alpha component of "+J+" will be ignored.")}let Z;if(Z=/^(\w+)\(([^\)]*)\)/.exec(J)){let K,W=Z[1],X=Z[2];switch(W){case"rgb":case"rgba":if(K=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(X))return Q(K[4]),this.setRGB(Math.min(255,parseInt(K[1],10))/255,Math.min(255,parseInt(K[2],10))/255,Math.min(255,parseInt(K[3],10))/255,$);if(K=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(X))return Q(K[4]),this.setRGB(Math.min(100,parseInt(K[1],10))/100,Math.min(100,parseInt(K[2],10))/100,Math.min(100,parseInt(K[3],10))/100,$);break;case"hsl":case"hsla":if(K=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(X))return Q(K[4]),this.setHSL(parseFloat(K[1])/360,parseFloat(K[2])/100,parseFloat(K[3])/100,$);break;default:b0("Color: Unknown color model "+J)}}else if(Z=/^\#([A-Fa-f\d]+)$/.exec(J)){let K=Z[1],W=K.length;if(W===3)return this.setRGB(parseInt(K.charAt(0),16)/15,parseInt(K.charAt(1),16)/15,parseInt(K.charAt(2),16)/15,$);else if(W===6)return this.setHex(parseInt(K,16),$);else b0("Color: Invalid hex color "+J)}else if(J&&J.length>0)return this.setColorName(J,$);return this}setColorName(J,$="srgb"){let Q=jz[J.toLowerCase()];if(Q!==void 0)this.setHex(Q,$);else b0("Color: Unknown color "+J);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(J){return this.r=J.r,this.g=J.g,this.b=J.b,this}copySRGBToLinear(J){return this.r=w7(J.r),this.g=w7(J.g),this.b=w7(J.b),this}copyLinearToSRGB(J){return this.r=N9(J.r),this.g=N9(J.g),this.b=N9(J.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(J="srgb"){return a0.workingToColorSpace(r8.copy(this),J),Math.round(s0(r8.r*255,0,255))*65536+Math.round(s0(r8.g*255,0,255))*256+Math.round(s0(r8.b*255,0,255))}getHexString(J="srgb"){return("000000"+this.getHex(J).toString(16)).slice(-6)}getHSL(J,$=a0.workingColorSpace){a0.workingToColorSpace(r8.copy(this),$);let{r:Q,g:Z,b:K}=r8,W=Math.max(Q,Z,K),X=Math.min(Q,Z,K),H,q,Y=(X+W)/2;if(X===W)H=0,q=0;else{let N=W-X;switch(q=Y<=0.5?N/(W+X):N/(2-W-X),W){case Q:H=(Z-K)/N+(Z<K?6:0);break;case Z:H=(K-Q)/N+2;break;case K:H=(Q-Z)/N+4;break}H/=6}return J.h=H,J.s=q,J.l=Y,J}getRGB(J,$=a0.workingColorSpace){return a0.workingToColorSpace(r8.copy(this),$),J.r=r8.r,J.g=r8.g,J.b=r8.b,J}getStyle(J="srgb"){a0.workingToColorSpace(r8.copy(this),J);let{r:$,g:Q,b:Z}=r8;if(J!=="srgb")return`color(${J} ${$.toFixed(3)} ${Q.toFixed(3)} ${Z.toFixed(3)})`;return`rgb(${Math.round($*255)},${Math.round(Q*255)},${Math.round(Z*255)})`}offsetHSL(J,$,Q){return this.getHSL(h7),this.setHSL(h7.h+J,h7.s+$,h7.l+Q)}add(J){return this.r+=J.r,this.g+=J.g,this.b+=J.b,this}addColors(J,$){return this.r=J.r+$.r,this.g=J.g+$.g,this.b=J.b+$.b,this}addScalar(J){return this.r+=J,this.g+=J,this.b+=J,this}sub(J){return this.r=Math.max(0,this.r-J.r),this.g=Math.max(0,this.g-J.g),this.b=Math.max(0,this.b-J.b),this}multiply(J){return this.r*=J.r,this.g*=J.g,this.b*=J.b,this}multiplyScalar(J){return this.r*=J,this.g*=J,this.b*=J,this}lerp(J,$){return this.r+=(J.r-this.r)*$,this.g+=(J.g-this.g)*$,this.b+=(J.b-this.b)*$,this}lerpColors(J,$,Q){return this.r=J.r+($.r-J.r)*Q,this.g=J.g+($.g-J.g)*Q,this.b=J.b+($.b-J.b)*Q,this}lerpHSL(J,$){this.getHSL(h7),J.getHSL(OZ);let Q=SW(h7.h,OZ.h,$),Z=SW(h7.s,OZ.s,$),K=SW(h7.l,OZ.l,$);return this.setHSL(Q,Z,K),this}setFromVector3(J){return this.r=J.x,this.g=J.y,this.b=J.z,this}applyMatrix3(J){let $=this.r,Q=this.g,Z=this.b,K=J.elements;return this.r=K[0]*$+K[3]*Q+K[6]*Z,this.g=K[1]*$+K[4]*Q+K[7]*Z,this.b=K[2]*$+K[5]*Q+K[8]*Z,this}equals(J){return J.r===this.r&&J.g===this.g&&J.b===this.b}fromArray(J,$=0){return this.r=J[$],this.g=J[$+1],this.b=J[$+2],this}toArray(J=[],$=0){return J[$]=this.r,J[$+1]=this.g,J[$+2]=this.b,J}fromBufferAttribute(J,$){return this.r=J.getX($),this.g=J.getY($),this.b=J.getZ($),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var r8=new l0;l0.NAMES=jz;class M${constructor(J,$=0.00025){this.isFogExp2=!0,this.name="",this.color=new l0(J),this.density=$}clone(){return new M$(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class sZ extends J6{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new t6,this.environmentIntensity=1,this.environmentRotation=new t6,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(J,$){if(super.copy(J,$),J.background!==null)this.background=J.background.clone();if(J.environment!==null)this.environment=J.environment.clone();if(J.fog!==null)this.fog=J.fog.clone();if(this.backgroundBlurriness=J.backgroundBlurriness,this.backgroundIntensity=J.backgroundIntensity,this.backgroundRotation.copy(J.backgroundRotation),this.environmentIntensity=J.environmentIntensity,this.environmentRotation.copy(J.environmentRotation),J.overrideMaterial!==null)this.overrideMaterial=J.overrideMaterial.clone();return this.matrixAutoUpdate=J.matrixAutoUpdate,this}toJSON(J){let $=super.toJSON(J);if(this.fog!==null)$.object.fog=this.fog.toJSON();if(this.backgroundBlurriness>0)$.object.backgroundBlurriness=this.backgroundBlurriness;if(this.backgroundIntensity!==1)$.object.backgroundIntensity=this.backgroundIntensity;if($.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1)$.object.environmentIntensity=this.environmentIntensity;return $.object.environmentRotation=this.environmentRotation.toArray(),$}}var p6=new g,F7=new g,xW=new g,z7=new g,$9=new g,Q9=new g,kF=new g,gW=new g,pW=new g,mW=new g,dW=new A8,lW=new A8,cW=new A8;class P6{constructor(J=new g,$=new g,Q=new g){this.a=J,this.b=$,this.c=Q}static getNormal(J,$,Q,Z){Z.subVectors(Q,$),p6.subVectors(J,$),Z.cross(p6);let K=Z.lengthSq();if(K>0)return Z.multiplyScalar(1/Math.sqrt(K));return Z.set(0,0,0)}static getBarycoord(J,$,Q,Z,K){p6.subVectors(Z,$),F7.subVectors(Q,$),xW.subVectors(J,$);let W=p6.dot(p6),X=p6.dot(F7),H=p6.dot(xW),q=F7.dot(F7),Y=F7.dot(xW),N=W*q-X*X;if(N===0)return K.set(0,0,0),null;let U=1/N,V=(q*H-X*Y)*U,z=(W*Y-X*H)*U;return K.set(1-V-z,z,V)}static containsPoint(J,$,Q,Z){if(this.getBarycoord(J,$,Q,Z,z7)===null)return!1;return z7.x>=0&&z7.y>=0&&z7.x+z7.y<=1}static getInterpolation(J,$,Q,Z,K,W,X,H){if(this.getBarycoord(J,$,Q,Z,z7)===null){if(H.x=0,H.y=0,"z"in H)H.z=0;if("w"in H)H.w=0;return null}return H.setScalar(0),H.addScaledVector(K,z7.x),H.addScaledVector(W,z7.y),H.addScaledVector(X,z7.z),H}static getInterpolatedAttribute(J,$,Q,Z,K,W){return dW.setScalar(0),lW.setScalar(0),cW.setScalar(0),dW.fromBufferAttribute(J,$),lW.fromBufferAttribute(J,Q),cW.fromBufferAttribute(J,Z),W.setScalar(0),W.addScaledVector(dW,K.x),W.addScaledVector(lW,K.y),W.addScaledVector(cW,K.z),W}static isFrontFacing(J,$,Q,Z){return p6.subVectors(Q,$),F7.subVectors(J,$),p6.cross(F7).dot(Z)<0?!0:!1}set(J,$,Q){return this.a.copy(J),this.b.copy($),this.c.copy(Q),this}setFromPointsAndIndices(J,$,Q,Z){return this.a.copy(J[$]),this.b.copy(J[Q]),this.c.copy(J[Z]),this}setFromAttributeAndIndices(J,$,Q,Z){return this.a.fromBufferAttribute(J,$),this.b.fromBufferAttribute(J,Q),this.c.fromBufferAttribute(J,Z),this}clone(){return new this.constructor().copy(this)}copy(J){return this.a.copy(J.a),this.b.copy(J.b),this.c.copy(J.c),this}getArea(){return p6.subVectors(this.c,this.b),F7.subVectors(this.a,this.b),p6.cross(F7).length()*0.5}getMidpoint(J){return J.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(J){return P6.getNormal(this.a,this.b,this.c,J)}getPlane(J){return J.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(J,$){return P6.getBarycoord(J,this.a,this.b,this.c,$)}getInterpolation(J,$,Q,Z,K){return P6.getInterpolation(J,this.a,this.b,this.c,$,Q,Z,K)}containsPoint(J){return P6.containsPoint(J,this.a,this.b,this.c)}isFrontFacing(J){return P6.isFrontFacing(this.a,this.b,this.c,J)}intersectsBox(J){return J.intersectsTriangle(this)}closestPointToPoint(J,$){let Q=this.a,Z=this.b,K=this.c,W,X;$9.subVectors(Z,Q),Q9.subVectors(K,Q),gW.subVectors(J,Q);let H=$9.dot(gW),q=Q9.dot(gW);if(H<=0&&q<=0)return $.copy(Q);pW.subVectors(J,Z);let Y=$9.dot(pW),N=Q9.dot(pW);if(Y>=0&&N<=Y)return $.copy(Z);let U=H*N-Y*q;if(U<=0&&H>=0&&Y<=0)return W=H/(H-Y),$.copy(Q).addScaledVector($9,W);mW.subVectors(J,K);let V=$9.dot(mW),z=Q9.dot(mW);if(z>=0&&V<=z)return $.copy(K);let D=V*q-H*z;if(D<=0&&q>=0&&z<=0)return X=q/(q-z),$.copy(Q).addScaledVector(Q9,X);let w=Y*z-V*N;if(w<=0&&N-Y>=0&&V-z>=0)return kF.subVectors(K,Z),X=(N-Y)/(N-Y+(V-z)),$.copy(Z).addScaledVector(kF,X);let F=1/(w+D+U);return W=D*F,X=U*F,$.copy(Q).addScaledVector($9,W).addScaledVector(Q9,X)}equals(J){return J.a.equals(this.a)&&J.b.equals(this.b)&&J.c.equals(this.c)}}class zJ{constructor(J=new g(1/0,1/0,1/0),$=new g(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=J,this.max=$}set(J,$){return this.min.copy(J),this.max.copy($),this}setFromArray(J){this.makeEmpty();for(let $=0,Q=J.length;$<Q;$+=3)this.expandByPoint(m6.fromArray(J,$));return this}setFromBufferAttribute(J){this.makeEmpty();for(let $=0,Q=J.count;$<Q;$++)this.expandByPoint(m6.fromBufferAttribute(J,$));return this}setFromPoints(J){this.makeEmpty();for(let $=0,Q=J.length;$<Q;$++)this.expandByPoint(J[$]);return this}setFromCenterAndSize(J,$){let Q=m6.copy($).multiplyScalar(0.5);return this.min.copy(J).sub(Q),this.max.copy(J).add(Q),this}setFromObject(J,$=!1){return this.makeEmpty(),this.expandByObject(J,$)}clone(){return new this.constructor().copy(this)}copy(J){return this.min.copy(J.min),this.max.copy(J.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(J){return this.isEmpty()?J.set(0,0,0):J.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(J){return this.isEmpty()?J.set(0,0,0):J.subVectors(this.max,this.min)}expandByPoint(J){return this.min.min(J),this.max.max(J),this}expandByVector(J){return this.min.sub(J),this.max.add(J),this}expandByScalar(J){return this.min.addScalar(-J),this.max.addScalar(J),this}expandByObject(J,$=!1){J.updateWorldMatrix(!1,!1);let Q=J.geometry;if(Q!==void 0){let K=Q.getAttribute("position");if($===!0&&K!==void 0&&J.isInstancedMesh!==!0)for(let W=0,X=K.count;W<X;W++){if(J.isMesh===!0)J.getVertexPosition(W,m6);else m6.fromBufferAttribute(K,W);m6.applyMatrix4(J.matrixWorld),this.expandByPoint(m6)}else{if(J.boundingBox!==void 0){if(J.boundingBox===null)J.computeBoundingBox();FZ.copy(J.boundingBox)}else{if(Q.boundingBox===null)Q.computeBoundingBox();FZ.copy(Q.boundingBox)}FZ.applyMatrix4(J.matrixWorld),this.union(FZ)}}let Z=J.children;for(let K=0,W=Z.length;K<W;K++)this.expandByObject(Z[K],$);return this}containsPoint(J){return J.x>=this.min.x&&J.x<=this.max.x&&J.y>=this.min.y&&J.y<=this.max.y&&J.z>=this.min.z&&J.z<=this.max.z}containsBox(J){return this.min.x<=J.min.x&&J.max.x<=this.max.x&&this.min.y<=J.min.y&&J.max.y<=this.max.y&&this.min.z<=J.min.z&&J.max.z<=this.max.z}getParameter(J,$){return $.set((J.x-this.min.x)/(this.max.x-this.min.x),(J.y-this.min.y)/(this.max.y-this.min.y),(J.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(J){return J.max.x>=this.min.x&&J.min.x<=this.max.x&&J.max.y>=this.min.y&&J.min.y<=this.max.y&&J.max.z>=this.min.z&&J.min.z<=this.max.z}intersectsSphere(J){return this.clampPoint(J.center,m6),m6.distanceToSquared(J.center)<=J.radius*J.radius}intersectsPlane(J){let $,Q;if(J.normal.x>0)$=J.normal.x*this.min.x,Q=J.normal.x*this.max.x;else $=J.normal.x*this.max.x,Q=J.normal.x*this.min.x;if(J.normal.y>0)$+=J.normal.y*this.min.y,Q+=J.normal.y*this.max.y;else $+=J.normal.y*this.max.y,Q+=J.normal.y*this.min.y;if(J.normal.z>0)$+=J.normal.z*this.min.z,Q+=J.normal.z*this.max.z;else $+=J.normal.z*this.max.z,Q+=J.normal.z*this.min.z;return $<=-J.constant&&Q>=-J.constant}intersectsTriangle(J){if(this.isEmpty())return!1;this.getCenter(X$),zZ.subVectors(this.max,X$),Z9.subVectors(J.a,X$),K9.subVectors(J.b,X$),W9.subVectors(J.c,X$),x7.subVectors(K9,Z9),g7.subVectors(W9,K9),XJ.subVectors(Z9,W9);let $=[0,-x7.z,x7.y,0,-g7.z,g7.y,0,-XJ.z,XJ.y,x7.z,0,-x7.x,g7.z,0,-g7.x,XJ.z,0,-XJ.x,-x7.y,x7.x,0,-g7.y,g7.x,0,-XJ.y,XJ.x,0];if(!uW($,Z9,K9,W9,zZ))return!1;if($=[1,0,0,0,1,0,0,0,1],!uW($,Z9,K9,W9,zZ))return!1;return DZ.crossVectors(x7,g7),$=[DZ.x,DZ.y,DZ.z],uW($,Z9,K9,W9,zZ)}clampPoint(J,$){return $.copy(J).clamp(this.min,this.max)}distanceToPoint(J){return this.clampPoint(J,m6).distanceTo(J)}getBoundingSphere(J){if(this.isEmpty())J.makeEmpty();else this.getCenter(J.center),J.radius=this.getSize(m6).length()*0.5;return J}intersect(J){if(this.min.max(J.min),this.max.min(J.max),this.isEmpty())this.makeEmpty();return this}union(J){return this.min.min(J.min),this.max.max(J.max),this}applyMatrix4(J){if(this.isEmpty())return this;return D7[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(J),D7[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(J),D7[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(J),D7[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(J),D7[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(J),D7[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(J),D7[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(J),D7[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(J),this.setFromPoints(D7),this}translate(J){return this.min.add(J),this.max.add(J),this}equals(J){return J.min.equals(this.min)&&J.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(J){return this.min.fromArray(J.min),this.max.fromArray(J.max),this}}var D7=[new g,new g,new g,new g,new g,new g,new g,new g],m6=new g,FZ=new zJ,Z9=new g,K9=new g,W9=new g,x7=new g,g7=new g,XJ=new g,X$=new g,zZ=new g,DZ=new g,HJ=new g;function uW(J,$,Q,Z,K){for(let W=0,X=J.length-3;W<=X;W+=3){HJ.fromArray(J,W);let H=K.x*Math.abs(HJ.x)+K.y*Math.abs(HJ.y)+K.z*Math.abs(HJ.z),q=$.dot(HJ),Y=Q.dot(HJ),N=Z.dot(HJ);if(Math.max(-Math.max(q,Y,N),Math.min(q,Y,N))>H)return!1}return!0}var y8=new g,kZ=new Q8,u2=0;class K6{constructor(J,$,Q=!1){if(Array.isArray(J))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:u2++}),this.name="",this.array=J,this.itemSize=$,this.count=J!==void 0?J.length/$:0,this.normalized=Q,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(J){if(J===!0)this.version++}setUsage(J){return this.usage=J,this}addUpdateRange(J,$){this.updateRanges.push({start:J,count:$})}clearUpdateRanges(){this.updateRanges.length=0}copy(J){return this.name=J.name,this.array=new J.array.constructor(J.array),this.itemSize=J.itemSize,this.count=J.count,this.normalized=J.normalized,this.usage=J.usage,this.gpuType=J.gpuType,this}copyAt(J,$,Q){J*=this.itemSize,Q*=$.itemSize;for(let Z=0,K=this.itemSize;Z<K;Z++)this.array[J+Z]=$.array[Q+Z];return this}copyArray(J){return this.array.set(J),this}applyMatrix3(J){if(this.itemSize===2)for(let $=0,Q=this.count;$<Q;$++)kZ.fromBufferAttribute(this,$),kZ.applyMatrix3(J),this.setXY($,kZ.x,kZ.y);else if(this.itemSize===3)for(let $=0,Q=this.count;$<Q;$++)y8.fromBufferAttribute(this,$),y8.applyMatrix3(J),this.setXYZ($,y8.x,y8.y,y8.z);return this}applyMatrix4(J){for(let $=0,Q=this.count;$<Q;$++)y8.fromBufferAttribute(this,$),y8.applyMatrix4(J),this.setXYZ($,y8.x,y8.y,y8.z);return this}applyNormalMatrix(J){for(let $=0,Q=this.count;$<Q;$++)y8.fromBufferAttribute(this,$),y8.applyNormalMatrix(J),this.setXYZ($,y8.x,y8.y,y8.z);return this}transformDirection(J){for(let $=0,Q=this.count;$<Q;$++)y8.fromBufferAttribute(this,$),y8.transformDirection(J),this.setXYZ($,y8.x,y8.y,y8.z);return this}set(J,$=0){return this.array.set(J,$),this}getComponent(J,$){let Q=this.array[J*this.itemSize+$];if(this.normalized)Q=K$(Q,this.array);return Q}setComponent(J,$,Q){if(this.normalized)Q=Y6(Q,this.array);return this.array[J*this.itemSize+$]=Q,this}getX(J){let $=this.array[J*this.itemSize];if(this.normalized)$=K$($,this.array);return $}setX(J,$){if(this.normalized)$=Y6($,this.array);return this.array[J*this.itemSize]=$,this}getY(J){let $=this.array[J*this.itemSize+1];if(this.normalized)$=K$($,this.array);return $}setY(J,$){if(this.normalized)$=Y6($,this.array);return this.array[J*this.itemSize+1]=$,this}getZ(J){let $=this.array[J*this.itemSize+2];if(this.normalized)$=K$($,this.array);return $}setZ(J,$){if(this.normalized)$=Y6($,this.array);return this.array[J*this.itemSize+2]=$,this}getW(J){let $=this.array[J*this.itemSize+3];if(this.normalized)$=K$($,this.array);return $}setW(J,$){if(this.normalized)$=Y6($,this.array);return this.array[J*this.itemSize+3]=$,this}setXY(J,$,Q){if(J*=this.itemSize,this.normalized)$=Y6($,this.array),Q=Y6(Q,this.array);return this.array[J+0]=$,this.array[J+1]=Q,this}setXYZ(J,$,Q,Z){if(J*=this.itemSize,this.normalized)$=Y6($,this.array),Q=Y6(Q,this.array),Z=Y6(Z,this.array);return this.array[J+0]=$,this.array[J+1]=Q,this.array[J+2]=Z,this}setXYZW(J,$,Q,Z,K){if(J*=this.itemSize,this.normalized)$=Y6($,this.array),Q=Y6(Q,this.array),Z=Y6(Z,this.array),K=Y6(K,this.array);return this.array[J+0]=$,this.array[J+1]=Q,this.array[J+2]=Z,this.array[J+3]=K,this}onUpload(J){return this.onUploadCallback=J,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let J={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};if(this.name!=="")J.name=this.name;if(this.usage!==35044)J.usage=this.usage;return J}}class nZ extends K6{constructor(J,$,Q){super(new Uint16Array(J),$,Q)}}class iZ extends K6{constructor(J,$,Q){super(new Uint32Array(J),$,Q)}}class d6 extends K6{constructor(J,$,Q){super(new Float32Array(J),$,Q)}}var s2=new zJ,H$=new g,sW=new g;class I9{constructor(J=new g,$=-1){this.isSphere=!0,this.center=J,this.radius=$}set(J,$){return this.center.copy(J),this.radius=$,this}setFromPoints(J,$){let Q=this.center;if($!==void 0)Q.copy($);else s2.setFromPoints(J).getCenter(Q);let Z=0;for(let K=0,W=J.length;K<W;K++)Z=Math.max(Z,Q.distanceToSquared(J[K]));return this.radius=Math.sqrt(Z),this}copy(J){return this.center.copy(J.center),this.radius=J.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(J){return J.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(J){return J.distanceTo(this.center)-this.radius}intersectsSphere(J){let $=this.radius+J.radius;return J.center.distanceToSquared(this.center)<=$*$}intersectsBox(J){return J.intersectsSphere(this)}intersectsPlane(J){return Math.abs(J.distanceToPoint(this.center))<=this.radius}clampPoint(J,$){let Q=this.center.distanceToSquared(J);if($.copy(J),Q>this.radius*this.radius)$.sub(this.center).normalize(),$.multiplyScalar(this.radius).add(this.center);return $}getBoundingBox(J){if(this.isEmpty())return J.makeEmpty(),J;return J.set(this.center,this.center),J.expandByScalar(this.radius),J}applyMatrix4(J){return this.center.applyMatrix4(J),this.radius=this.radius*J.getMaxScaleOnAxis(),this}translate(J){return this.center.add(J),this}expandByPoint(J){if(this.isEmpty())return this.center.copy(J),this.radius=0,this;H$.subVectors(J,this.center);let $=H$.lengthSq();if($>this.radius*this.radius){let Q=Math.sqrt($),Z=(Q-this.radius)*0.5;this.center.addScaledVector(H$,Z/Q),this.radius+=Z}return this}union(J){if(J.isEmpty())return this;if(this.isEmpty())return this.copy(J),this;if(this.center.equals(J.center)===!0)this.radius=Math.max(this.radius,J.radius);else sW.subVectors(J.center,this.center).setLength(J.radius),this.expandByPoint(H$.copy(J.center).add(sW)),this.expandByPoint(H$.copy(J.center).sub(sW));return this}equals(J){return J.center.equals(this.center)&&J.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(J){return this.radius=J.radius,this.center.fromArray(J.center),this}}var n2=0,E6=new G8,nW=new J6,X9=new g,w6=new zJ,q$=new zJ,p8=new g;class M6 extends c7{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:n2++}),this.uuid=k$(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(J){if(Array.isArray(J))this.index=new((T2(J))?iZ:nZ)(J,1);else this.index=J;return this}setIndirect(J,$=0){return this.indirect=J,this.indirectOffset=$,this}getIndirect(){return this.indirect}getAttribute(J){return this.attributes[J]}setAttribute(J,$){return this.attributes[J]=$,this}deleteAttribute(J){return delete this.attributes[J],this}hasAttribute(J){return this.attributes[J]!==void 0}addGroup(J,$,Q=0){this.groups.push({start:J,count:$,materialIndex:Q})}clearGroups(){this.groups=[]}setDrawRange(J,$){this.drawRange.start=J,this.drawRange.count=$}applyMatrix4(J){let $=this.attributes.position;if($!==void 0)$.applyMatrix4(J),$.needsUpdate=!0;let Q=this.attributes.normal;if(Q!==void 0){let K=new x0().getNormalMatrix(J);Q.applyNormalMatrix(K),Q.needsUpdate=!0}let Z=this.attributes.tangent;if(Z!==void 0)Z.transformDirection(J),Z.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this}applyQuaternion(J){return E6.makeRotationFromQuaternion(J),this.applyMatrix4(E6),this}rotateX(J){return E6.makeRotationX(J),this.applyMatrix4(E6),this}rotateY(J){return E6.makeRotationY(J),this.applyMatrix4(E6),this}rotateZ(J){return E6.makeRotationZ(J),this.applyMatrix4(E6),this}translate(J,$,Q){return E6.makeTranslation(J,$,Q),this.applyMatrix4(E6),this}scale(J,$,Q){return E6.makeScale(J,$,Q),this.applyMatrix4(E6),this}lookAt(J){return nW.lookAt(J),nW.updateMatrix(),this.applyMatrix4(nW.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(X9).negate(),this.translate(X9.x,X9.y,X9.z),this}setFromPoints(J){let $=this.getAttribute("position");if($===void 0){let Q=[];for(let Z=0,K=J.length;Z<K;Z++){let W=J[Z];Q.push(W.x,W.y,W.z||0)}this.setAttribute("position",new d6(Q,3))}else{let Q=Math.min(J.length,$.count);for(let Z=0;Z<Q;Z++){let K=J[Z];$.setXYZ(Z,K.x,K.y,K.z||0)}if(J.length>$.count)b0("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");$.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new zJ;let J=this.attributes.position,$=this.morphAttributes.position;if(J&&J.isGLBufferAttribute){y0("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new g(-1/0,-1/0,-1/0),new g(1/0,1/0,1/0));return}if(J!==void 0){if(this.boundingBox.setFromBufferAttribute(J),$)for(let Q=0,Z=$.length;Q<Z;Q++){let K=$[Q];if(w6.setFromBufferAttribute(K),this.morphTargetsRelative)p8.addVectors(this.boundingBox.min,w6.min),this.boundingBox.expandByPoint(p8),p8.addVectors(this.boundingBox.max,w6.max),this.boundingBox.expandByPoint(p8);else this.boundingBox.expandByPoint(w6.min),this.boundingBox.expandByPoint(w6.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))y0('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new I9;let J=this.attributes.position,$=this.morphAttributes.position;if(J&&J.isGLBufferAttribute){y0("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new g,1/0);return}if(J){let Q=this.boundingSphere.center;if(w6.setFromBufferAttribute(J),$)for(let K=0,W=$.length;K<W;K++){let X=$[K];if(q$.setFromBufferAttribute(X),this.morphTargetsRelative)p8.addVectors(w6.min,q$.min),w6.expandByPoint(p8),p8.addVectors(w6.max,q$.max),w6.expandByPoint(p8);else w6.expandByPoint(q$.min),w6.expandByPoint(q$.max)}w6.getCenter(Q);let Z=0;for(let K=0,W=J.count;K<W;K++)p8.fromBufferAttribute(J,K),Z=Math.max(Z,Q.distanceToSquared(p8));if($)for(let K=0,W=$.length;K<W;K++){let X=$[K],H=this.morphTargetsRelative;for(let q=0,Y=X.count;q<Y;q++){if(p8.fromBufferAttribute(X,q),H)X9.fromBufferAttribute(J,q),p8.add(X9);Z=Math.max(Z,Q.distanceToSquared(p8))}}if(this.boundingSphere.radius=Math.sqrt(Z),isNaN(this.boundingSphere.radius))y0('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let J=this.index,$=this.attributes;if(J===null||$.position===void 0||$.normal===void 0||$.uv===void 0){y0("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:Q,normal:Z,uv:K}=$;if(this.hasAttribute("tangent")===!1)this.setAttribute("tangent",new K6(new Float32Array(4*Q.count),4));let W=this.getAttribute("tangent"),X=[],H=[];for(let j=0;j<Q.count;j++)X[j]=new g,H[j]=new g;let q=new g,Y=new g,N=new g,U=new Q8,V=new Q8,z=new Q8,D=new g,w=new g;function F(j,I,E){q.fromBufferAttribute(Q,j),Y.fromBufferAttribute(Q,I),N.fromBufferAttribute(Q,E),U.fromBufferAttribute(K,j),V.fromBufferAttribute(K,I),z.fromBufferAttribute(K,E),Y.sub(q),N.sub(q),V.sub(U),z.sub(U);let u=1/(V.x*z.y-z.x*V.y);if(!isFinite(u))return;D.copy(Y).multiplyScalar(z.y).addScaledVector(N,-V.y).multiplyScalar(u),w.copy(N).multiplyScalar(V.x).addScaledVector(Y,-z.x).multiplyScalar(u),X[j].add(D),X[I].add(D),X[E].add(D),H[j].add(w),H[I].add(w),H[E].add(w)}let O=this.groups;if(O.length===0)O=[{start:0,count:J.count}];for(let j=0,I=O.length;j<I;++j){let E=O[j],u=E.start,C=E.count;for(let p=u,n=u+C;p<n;p+=3)F(J.getX(p+0),J.getX(p+1),J.getX(p+2))}let R=new g,B=new g,L=new g,y=new g;function _(j){L.fromBufferAttribute(Z,j),y.copy(L);let I=X[j];R.copy(I),R.sub(L.multiplyScalar(L.dot(I))).normalize(),B.crossVectors(y,I);let u=B.dot(H[j])<0?-1:1;W.setXYZW(j,R.x,R.y,R.z,u)}for(let j=0,I=O.length;j<I;++j){let E=O[j],u=E.start,C=E.count;for(let p=u,n=u+C;p<n;p+=3)_(J.getX(p+0)),_(J.getX(p+1)),_(J.getX(p+2))}}computeVertexNormals(){let J=this.index,$=this.getAttribute("position");if($!==void 0){let Q=this.getAttribute("normal");if(Q===void 0)Q=new K6(new Float32Array($.count*3),3),this.setAttribute("normal",Q);else for(let U=0,V=Q.count;U<V;U++)Q.setXYZ(U,0,0,0);let Z=new g,K=new g,W=new g,X=new g,H=new g,q=new g,Y=new g,N=new g;if(J)for(let U=0,V=J.count;U<V;U+=3){let z=J.getX(U+0),D=J.getX(U+1),w=J.getX(U+2);Z.fromBufferAttribute($,z),K.fromBufferAttribute($,D),W.fromBufferAttribute($,w),Y.subVectors(W,K),N.subVectors(Z,K),Y.cross(N),X.fromBufferAttribute(Q,z),H.fromBufferAttribute(Q,D),q.fromBufferAttribute(Q,w),X.add(Y),H.add(Y),q.add(Y),Q.setXYZ(z,X.x,X.y,X.z),Q.setXYZ(D,H.x,H.y,H.z),Q.setXYZ(w,q.x,q.y,q.z)}else for(let U=0,V=$.count;U<V;U+=3)Z.fromBufferAttribute($,U+0),K.fromBufferAttribute($,U+1),W.fromBufferAttribute($,U+2),Y.subVectors(W,K),N.subVectors(Z,K),Y.cross(N),Q.setXYZ(U+0,Y.x,Y.y,Y.z),Q.setXYZ(U+1,Y.x,Y.y,Y.z),Q.setXYZ(U+2,Y.x,Y.y,Y.z);this.normalizeNormals(),Q.needsUpdate=!0}}normalizeNormals(){let J=this.attributes.normal;for(let $=0,Q=J.count;$<Q;$++)p8.fromBufferAttribute(J,$),p8.normalize(),J.setXYZ($,p8.x,p8.y,p8.z)}toNonIndexed(){function J(X,H){let{array:q,itemSize:Y,normalized:N}=X,U=new q.constructor(H.length*Y),V=0,z=0;for(let D=0,w=H.length;D<w;D++){if(X.isInterleavedBufferAttribute)V=H[D]*X.data.stride+X.offset;else V=H[D]*Y;for(let F=0;F<Y;F++)U[z++]=q[V++]}return new K6(U,Y,N)}if(this.index===null)return b0("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let $=new M6,Q=this.index.array,Z=this.attributes;for(let X in Z){let H=Z[X],q=J(H,Q);$.setAttribute(X,q)}let K=this.morphAttributes;for(let X in K){let H=[],q=K[X];for(let Y=0,N=q.length;Y<N;Y++){let U=q[Y],V=J(U,Q);H.push(V)}$.morphAttributes[X]=H}$.morphTargetsRelative=this.morphTargetsRelative;let W=this.groups;for(let X=0,H=W.length;X<H;X++){let q=W[X];$.addGroup(q.start,q.count,q.materialIndex)}return $}toJSON(){let J={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(J.uuid=this.uuid,J.type=this.type,this.name!=="")J.name=this.name;if(Object.keys(this.userData).length>0)J.userData=this.userData;if(this.parameters!==void 0){let H=this.parameters;for(let q in H)if(H[q]!==void 0)J[q]=H[q];return J}J.data={attributes:{}};let $=this.index;if($!==null)J.data.index={type:$.array.constructor.name,array:Array.prototype.slice.call($.array)};let Q=this.attributes;for(let H in Q){let q=Q[H];J.data.attributes[H]=q.toJSON(J.data)}let Z={},K=!1;for(let H in this.morphAttributes){let q=this.morphAttributes[H],Y=[];for(let N=0,U=q.length;N<U;N++){let V=q[N];Y.push(V.toJSON(J.data))}if(Y.length>0)Z[H]=Y,K=!0}if(K)J.data.morphAttributes=Z,J.data.morphTargetsRelative=this.morphTargetsRelative;let W=this.groups;if(W.length>0)J.data.groups=JSON.parse(JSON.stringify(W));let X=this.boundingSphere;if(X!==null)J.data.boundingSphere=X.toJSON();return J}clone(){return new this.constructor().copy(this)}copy(J){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let $={};this.name=J.name;let Q=J.index;if(Q!==null)this.setIndex(Q.clone());let Z=J.attributes;for(let q in Z){let Y=Z[q];this.setAttribute(q,Y.clone($))}let K=J.morphAttributes;for(let q in K){let Y=[],N=K[q];for(let U=0,V=N.length;U<V;U++)Y.push(N[U].clone($));this.morphAttributes[q]=Y}this.morphTargetsRelative=J.morphTargetsRelative;let W=J.groups;for(let q=0,Y=W.length;q<Y;q++){let N=W[q];this.addGroup(N.start,N.count,N.materialIndex)}let X=J.boundingBox;if(X!==null)this.boundingBox=X.clone();let H=J.boundingSphere;if(H!==null)this.boundingSphere=H.clone();return this.drawRange.start=J.drawRange.start,this.drawRange.count=J.drawRange.count,this.userData=J.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}var i2=0;class L7 extends c7{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:i2++}),this.uuid=k$(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new l0(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(J){if(this._alphaTest>0!==J>0)this.version++;this._alphaTest=J}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(J){if(J===void 0)return;for(let $ in J){let Q=J[$];if(Q===void 0){b0(`Material: parameter '${$}' has value of undefined.`);continue}let Z=this[$];if(Z===void 0){b0(`Material: '${$}' is not a property of THREE.${this.type}.`);continue}if(Z&&Z.isColor)Z.set(Q);else if(Z&&Z.isVector3&&(Q&&Q.isVector3))Z.copy(Q);else this[$]=Q}}toJSON(J){let $=J===void 0||typeof J==="string";if($)J={textures:{},images:{}};let Q={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(Q.uuid=this.uuid,Q.type=this.type,this.name!=="")Q.name=this.name;if(this.color&&this.color.isColor)Q.color=this.color.getHex();if(this.roughness!==void 0)Q.roughness=this.roughness;if(this.metalness!==void 0)Q.metalness=this.metalness;if(this.sheen!==void 0)Q.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)Q.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)Q.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)Q.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1)Q.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)Q.specular=this.specular.getHex();if(this.specularIntensity!==void 0)Q.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)Q.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)Q.shininess=this.shininess;if(this.clearcoat!==void 0)Q.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)Q.clearcoatRoughness=this.clearcoatRoughness;if(this.clearcoatMap&&this.clearcoatMap.isTexture)Q.clearcoatMap=this.clearcoatMap.toJSON(J).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)Q.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(J).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)Q.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(J).uuid,Q.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)Q.sheenColorMap=this.sheenColorMap.toJSON(J).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)Q.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(J).uuid;if(this.dispersion!==void 0)Q.dispersion=this.dispersion;if(this.iridescence!==void 0)Q.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)Q.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessRange!==void 0)Q.iridescenceThicknessRange=this.iridescenceThicknessRange;if(this.iridescenceMap&&this.iridescenceMap.isTexture)Q.iridescenceMap=this.iridescenceMap.toJSON(J).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)Q.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(J).uuid;if(this.anisotropy!==void 0)Q.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)Q.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)Q.anisotropyMap=this.anisotropyMap.toJSON(J).uuid;if(this.map&&this.map.isTexture)Q.map=this.map.toJSON(J).uuid;if(this.matcap&&this.matcap.isTexture)Q.matcap=this.matcap.toJSON(J).uuid;if(this.alphaMap&&this.alphaMap.isTexture)Q.alphaMap=this.alphaMap.toJSON(J).uuid;if(this.lightMap&&this.lightMap.isTexture)Q.lightMap=this.lightMap.toJSON(J).uuid,Q.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)Q.aoMap=this.aoMap.toJSON(J).uuid,Q.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)Q.bumpMap=this.bumpMap.toJSON(J).uuid,Q.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)Q.normalMap=this.normalMap.toJSON(J).uuid,Q.normalMapType=this.normalMapType,Q.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)Q.displacementMap=this.displacementMap.toJSON(J).uuid,Q.displacementScale=this.displacementScale,Q.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)Q.roughnessMap=this.roughnessMap.toJSON(J).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)Q.metalnessMap=this.metalnessMap.toJSON(J).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)Q.emissiveMap=this.emissiveMap.toJSON(J).uuid;if(this.specularMap&&this.specularMap.isTexture)Q.specularMap=this.specularMap.toJSON(J).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)Q.specularIntensityMap=this.specularIntensityMap.toJSON(J).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)Q.specularColorMap=this.specularColorMap.toJSON(J).uuid;if(this.envMap&&this.envMap.isTexture){if(Q.envMap=this.envMap.toJSON(J).uuid,this.combine!==void 0)Q.combine=this.combine}if(this.envMapRotation!==void 0)Q.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)Q.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)Q.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)Q.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)Q.gradientMap=this.gradientMap.toJSON(J).uuid;if(this.transmission!==void 0)Q.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)Q.transmissionMap=this.transmissionMap.toJSON(J).uuid;if(this.thickness!==void 0)Q.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)Q.thicknessMap=this.thicknessMap.toJSON(J).uuid;if(this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0)Q.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)Q.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)Q.size=this.size;if(this.shadowSide!==null)Q.shadowSide=this.shadowSide;if(this.sizeAttenuation!==void 0)Q.sizeAttenuation=this.sizeAttenuation;if(this.blending!==1)Q.blending=this.blending;if(this.side!==0)Q.side=this.side;if(this.vertexColors===!0)Q.vertexColors=!0;if(this.opacity<1)Q.opacity=this.opacity;if(this.transparent===!0)Q.transparent=!0;if(this.blendSrc!==204)Q.blendSrc=this.blendSrc;if(this.blendDst!==205)Q.blendDst=this.blendDst;if(this.blendEquation!==100)Q.blendEquation=this.blendEquation;if(this.blendSrcAlpha!==null)Q.blendSrcAlpha=this.blendSrcAlpha;if(this.blendDstAlpha!==null)Q.blendDstAlpha=this.blendDstAlpha;if(this.blendEquationAlpha!==null)Q.blendEquationAlpha=this.blendEquationAlpha;if(this.blendColor&&this.blendColor.isColor)Q.blendColor=this.blendColor.getHex();if(this.blendAlpha!==0)Q.blendAlpha=this.blendAlpha;if(this.depthFunc!==3)Q.depthFunc=this.depthFunc;if(this.depthTest===!1)Q.depthTest=this.depthTest;if(this.depthWrite===!1)Q.depthWrite=this.depthWrite;if(this.colorWrite===!1)Q.colorWrite=this.colorWrite;if(this.stencilWriteMask!==255)Q.stencilWriteMask=this.stencilWriteMask;if(this.stencilFunc!==519)Q.stencilFunc=this.stencilFunc;if(this.stencilRef!==0)Q.stencilRef=this.stencilRef;if(this.stencilFuncMask!==255)Q.stencilFuncMask=this.stencilFuncMask;if(this.stencilFail!==7680)Q.stencilFail=this.stencilFail;if(this.stencilZFail!==7680)Q.stencilZFail=this.stencilZFail;if(this.stencilZPass!==7680)Q.stencilZPass=this.stencilZPass;if(this.stencilWrite===!0)Q.stencilWrite=this.stencilWrite;if(this.rotation!==void 0&&this.rotation!==0)Q.rotation=this.rotation;if(this.polygonOffset===!0)Q.polygonOffset=!0;if(this.polygonOffsetFactor!==0)Q.polygonOffsetFactor=this.polygonOffsetFactor;if(this.polygonOffsetUnits!==0)Q.polygonOffsetUnits=this.polygonOffsetUnits;if(this.linewidth!==void 0&&this.linewidth!==1)Q.linewidth=this.linewidth;if(this.dashSize!==void 0)Q.dashSize=this.dashSize;if(this.gapSize!==void 0)Q.gapSize=this.gapSize;if(this.scale!==void 0)Q.scale=this.scale;if(this.dithering===!0)Q.dithering=!0;if(this.alphaTest>0)Q.alphaTest=this.alphaTest;if(this.alphaHash===!0)Q.alphaHash=!0;if(this.alphaToCoverage===!0)Q.alphaToCoverage=!0;if(this.premultipliedAlpha===!0)Q.premultipliedAlpha=!0;if(this.forceSinglePass===!0)Q.forceSinglePass=!0;if(this.allowOverride===!1)Q.allowOverride=!1;if(this.wireframe===!0)Q.wireframe=!0;if(this.wireframeLinewidth>1)Q.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!=="round")Q.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!=="round")Q.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading===!0)Q.flatShading=!0;if(this.visible===!1)Q.visible=!1;if(this.toneMapped===!1)Q.toneMapped=!1;if(this.fog===!1)Q.fog=!1;if(Object.keys(this.userData).length>0)Q.userData=this.userData;function Z(K){let W=[];for(let X in K){let H=K[X];delete H.metadata,W.push(H)}return W}if($){let K=Z(J.textures),W=Z(J.images);if(K.length>0)Q.textures=K;if(W.length>0)Q.images=W}return Q}clone(){return new this.constructor().copy(this)}copy(J){this.name=J.name,this.blending=J.blending,this.side=J.side,this.vertexColors=J.vertexColors,this.opacity=J.opacity,this.transparent=J.transparent,this.blendSrc=J.blendSrc,this.blendDst=J.blendDst,this.blendEquation=J.blendEquation,this.blendSrcAlpha=J.blendSrcAlpha,this.blendDstAlpha=J.blendDstAlpha,this.blendEquationAlpha=J.blendEquationAlpha,this.blendColor.copy(J.blendColor),this.blendAlpha=J.blendAlpha,this.depthFunc=J.depthFunc,this.depthTest=J.depthTest,this.depthWrite=J.depthWrite,this.stencilWriteMask=J.stencilWriteMask,this.stencilFunc=J.stencilFunc,this.stencilRef=J.stencilRef,this.stencilFuncMask=J.stencilFuncMask,this.stencilFail=J.stencilFail,this.stencilZFail=J.stencilZFail,this.stencilZPass=J.stencilZPass,this.stencilWrite=J.stencilWrite;let $=J.clippingPlanes,Q=null;if($!==null){let Z=$.length;Q=Array(Z);for(let K=0;K!==Z;++K)Q[K]=$[K].clone()}return this.clippingPlanes=Q,this.clipIntersection=J.clipIntersection,this.clipShadows=J.clipShadows,this.shadowSide=J.shadowSide,this.colorWrite=J.colorWrite,this.precision=J.precision,this.polygonOffset=J.polygonOffset,this.polygonOffsetFactor=J.polygonOffsetFactor,this.polygonOffsetUnits=J.polygonOffsetUnits,this.dithering=J.dithering,this.alphaTest=J.alphaTest,this.alphaHash=J.alphaHash,this.alphaToCoverage=J.alphaToCoverage,this.premultipliedAlpha=J.premultipliedAlpha,this.forceSinglePass=J.forceSinglePass,this.allowOverride=J.allowOverride,this.visible=J.visible,this.toneMapped=J.toneMapped,this.userData=JSON.parse(JSON.stringify(J.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(J){if(J===!0)this.version++}}var k7=new g,iW=new g,IZ=new g,p7=new g,oW=new g,wZ=new g,aW=new g;class oZ{constructor(J=new g,$=new g(0,0,-1)){this.origin=J,this.direction=$}set(J,$){return this.origin.copy(J),this.direction.copy($),this}copy(J){return this.origin.copy(J.origin),this.direction.copy(J.direction),this}at(J,$){return $.copy(this.origin).addScaledVector(this.direction,J)}lookAt(J){return this.direction.copy(J).sub(this.origin).normalize(),this}recast(J){return this.origin.copy(this.at(J,k7)),this}closestPointToPoint(J,$){$.subVectors(J,this.origin);let Q=$.dot(this.direction);if(Q<0)return $.copy(this.origin);return $.copy(this.origin).addScaledVector(this.direction,Q)}distanceToPoint(J){return Math.sqrt(this.distanceSqToPoint(J))}distanceSqToPoint(J){let $=k7.subVectors(J,this.origin).dot(this.direction);if($<0)return this.origin.distanceToSquared(J);return k7.copy(this.origin).addScaledVector(this.direction,$),k7.distanceToSquared(J)}distanceSqToSegment(J,$,Q,Z){iW.copy(J).add($).multiplyScalar(0.5),IZ.copy($).sub(J).normalize(),p7.copy(this.origin).sub(iW);let K=J.distanceTo($)*0.5,W=-this.direction.dot(IZ),X=p7.dot(this.direction),H=-p7.dot(IZ),q=p7.lengthSq(),Y=Math.abs(1-W*W),N,U,V,z;if(Y>0)if(N=W*H-X,U=W*X-H,z=K*Y,N>=0)if(U>=-z)if(U<=z){let D=1/Y;N*=D,U*=D,V=N*(N+W*U+2*X)+U*(W*N+U+2*H)+q}else U=K,N=Math.max(0,-(W*U+X)),V=-N*N+U*(U+2*H)+q;else U=-K,N=Math.max(0,-(W*U+X)),V=-N*N+U*(U+2*H)+q;else if(U<=-z)N=Math.max(0,-(-W*K+X)),U=N>0?-K:Math.min(Math.max(-K,-H),K),V=-N*N+U*(U+2*H)+q;else if(U<=z)N=0,U=Math.min(Math.max(-K,-H),K),V=U*(U+2*H)+q;else N=Math.max(0,-(W*K+X)),U=N>0?K:Math.min(Math.max(-K,-H),K),V=-N*N+U*(U+2*H)+q;else U=W>0?-K:K,N=Math.max(0,-(W*U+X)),V=-N*N+U*(U+2*H)+q;if(Q)Q.copy(this.origin).addScaledVector(this.direction,N);if(Z)Z.copy(iW).addScaledVector(IZ,U);return V}intersectSphere(J,$){k7.subVectors(J.center,this.origin);let Q=k7.dot(this.direction),Z=k7.dot(k7)-Q*Q,K=J.radius*J.radius;if(Z>K)return null;let W=Math.sqrt(K-Z),X=Q-W,H=Q+W;if(H<0)return null;if(X<0)return this.at(H,$);return this.at(X,$)}intersectsSphere(J){if(J.radius<0)return!1;return this.distanceSqToPoint(J.center)<=J.radius*J.radius}distanceToPlane(J){let $=J.normal.dot(this.direction);if($===0){if(J.distanceToPoint(this.origin)===0)return 0;return null}let Q=-(this.origin.dot(J.normal)+J.constant)/$;return Q>=0?Q:null}intersectPlane(J,$){let Q=this.distanceToPlane(J);if(Q===null)return null;return this.at(Q,$)}intersectsPlane(J){let $=J.distanceToPoint(this.origin);if($===0)return!0;if(J.normal.dot(this.direction)*$<0)return!0;return!1}intersectBox(J,$){let Q,Z,K,W,X,H,q=1/this.direction.x,Y=1/this.direction.y,N=1/this.direction.z,U=this.origin;if(q>=0)Q=(J.min.x-U.x)*q,Z=(J.max.x-U.x)*q;else Q=(J.max.x-U.x)*q,Z=(J.min.x-U.x)*q;if(Y>=0)K=(J.min.y-U.y)*Y,W=(J.max.y-U.y)*Y;else K=(J.max.y-U.y)*Y,W=(J.min.y-U.y)*Y;if(Q>W||K>Z)return null;if(K>Q||isNaN(Q))Q=K;if(W<Z||isNaN(Z))Z=W;if(N>=0)X=(J.min.z-U.z)*N,H=(J.max.z-U.z)*N;else X=(J.max.z-U.z)*N,H=(J.min.z-U.z)*N;if(Q>H||X>Z)return null;if(X>Q||Q!==Q)Q=X;if(H<Z||Z!==Z)Z=H;if(Z<0)return null;return this.at(Q>=0?Q:Z,$)}intersectsBox(J){return this.intersectBox(J,k7)!==null}intersectTriangle(J,$,Q,Z,K){oW.subVectors($,J),wZ.subVectors(Q,J),aW.crossVectors(oW,wZ);let W=this.direction.dot(aW),X;if(W>0){if(Z)return null;X=1}else if(W<0)X=-1,W=-W;else return null;p7.subVectors(this.origin,J);let H=X*this.direction.dot(wZ.crossVectors(p7,wZ));if(H<0)return null;let q=X*this.direction.dot(oW.cross(p7));if(q<0)return null;if(H+q>W)return null;let Y=-X*p7.dot(aW);if(Y<0)return null;return this.at(Y/W,K)}applyMatrix4(J){return this.origin.applyMatrix4(J),this.direction.transformDirection(J),this}equals(J){return J.origin.equals(this.origin)&&J.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class aZ extends L7{constructor(J){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new l0(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new t6,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(J)}copy(J){return super.copy(J),this.color.copy(J.color),this.map=J.map,this.lightMap=J.lightMap,this.lightMapIntensity=J.lightMapIntensity,this.aoMap=J.aoMap,this.aoMapIntensity=J.aoMapIntensity,this.specularMap=J.specularMap,this.alphaMap=J.alphaMap,this.envMap=J.envMap,this.envMapRotation.copy(J.envMapRotation),this.combine=J.combine,this.reflectivity=J.reflectivity,this.refractionRatio=J.refractionRatio,this.wireframe=J.wireframe,this.wireframeLinewidth=J.wireframeLinewidth,this.wireframeLinecap=J.wireframeLinecap,this.wireframeLinejoin=J.wireframeLinejoin,this.fog=J.fog,this}}var IF=new G8,qJ=new oZ,MZ=new I9,wF=new g,GZ=new g,RZ=new g,LZ=new g,rW=new g,BZ=new g,MF=new g,AZ=new g;class u6 extends J6{constructor(J=new M6,$=new aZ){super();this.isMesh=!0,this.type="Mesh",this.geometry=J,this.material=$,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(J,$){if(super.copy(J,$),J.morphTargetInfluences!==void 0)this.morphTargetInfluences=J.morphTargetInfluences.slice();if(J.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},J.morphTargetDictionary);return this.material=Array.isArray(J.material)?J.material.slice():J.material,this.geometry=J.geometry,this}updateMorphTargets(){let $=this.geometry.morphAttributes,Q=Object.keys($);if(Q.length>0){let Z=$[Q[0]];if(Z!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let K=0,W=Z.length;K<W;K++){let X=Z[K].name||String(K);this.morphTargetInfluences.push(0),this.morphTargetDictionary[X]=K}}}}getVertexPosition(J,$){let Q=this.geometry,Z=Q.attributes.position,K=Q.morphAttributes.position,W=Q.morphTargetsRelative;$.fromBufferAttribute(Z,J);let X=this.morphTargetInfluences;if(K&&X){BZ.set(0,0,0);for(let H=0,q=K.length;H<q;H++){let Y=X[H],N=K[H];if(Y===0)continue;if(rW.fromBufferAttribute(N,J),W)BZ.addScaledVector(rW,Y);else BZ.addScaledVector(rW.sub($),Y)}$.add(BZ)}return $}raycast(J,$){let Q=this.geometry,Z=this.material,K=this.matrixWorld;if(Z===void 0)return;if(Q.boundingSphere===null)Q.computeBoundingSphere();if(MZ.copy(Q.boundingSphere),MZ.applyMatrix4(K),qJ.copy(J.ray).recast(J.near),MZ.containsPoint(qJ.origin)===!1){if(qJ.intersectSphere(MZ,wF)===null)return;if(qJ.origin.distanceToSquared(wF)>(J.far-J.near)**2)return}if(IF.copy(K).invert(),qJ.copy(J.ray).applyMatrix4(IF),Q.boundingBox!==null){if(qJ.intersectsBox(Q.boundingBox)===!1)return}this._computeIntersections(J,$,qJ)}_computeIntersections(J,$,Q){let Z,K=this.geometry,W=this.material,X=K.index,H=K.attributes.position,q=K.attributes.uv,Y=K.attributes.uv1,N=K.attributes.normal,U=K.groups,V=K.drawRange;if(X!==null)if(Array.isArray(W))for(let z=0,D=U.length;z<D;z++){let w=U[z],F=W[w.materialIndex],O=Math.max(w.start,V.start),R=Math.min(X.count,Math.min(w.start+w.count,V.start+V.count));for(let B=O,L=R;B<L;B+=3){let y=X.getX(B),_=X.getX(B+1),j=X.getX(B+2);if(Z=_Z(this,F,J,Q,q,Y,N,y,_,j),Z)Z.faceIndex=Math.floor(B/3),Z.face.materialIndex=w.materialIndex,$.push(Z)}}else{let z=Math.max(0,V.start),D=Math.min(X.count,V.start+V.count);for(let w=z,F=D;w<F;w+=3){let O=X.getX(w),R=X.getX(w+1),B=X.getX(w+2);if(Z=_Z(this,W,J,Q,q,Y,N,O,R,B),Z)Z.faceIndex=Math.floor(w/3),$.push(Z)}}else if(H!==void 0)if(Array.isArray(W))for(let z=0,D=U.length;z<D;z++){let w=U[z],F=W[w.materialIndex],O=Math.max(w.start,V.start),R=Math.min(H.count,Math.min(w.start+w.count,V.start+V.count));for(let B=O,L=R;B<L;B+=3){let y=B,_=B+1,j=B+2;if(Z=_Z(this,F,J,Q,q,Y,N,y,_,j),Z)Z.faceIndex=Math.floor(B/3),Z.face.materialIndex=w.materialIndex,$.push(Z)}}else{let z=Math.max(0,V.start),D=Math.min(H.count,V.start+V.count);for(let w=z,F=D;w<F;w+=3){let O=w,R=w+1,B=w+2;if(Z=_Z(this,W,J,Q,q,Y,N,O,R,B),Z)Z.faceIndex=Math.floor(w/3),$.push(Z)}}}}function o2(J,$,Q,Z,K,W,X,H){let q;if($.side===1)q=Z.intersectTriangle(X,W,K,!0,H);else q=Z.intersectTriangle(K,W,X,$.side===0,H);if(q===null)return null;AZ.copy(H),AZ.applyMatrix4(J.matrixWorld);let Y=Q.ray.origin.distanceTo(AZ);if(Y<Q.near||Y>Q.far)return null;return{distance:Y,point:AZ.clone(),object:J}}function _Z(J,$,Q,Z,K,W,X,H,q,Y){J.getVertexPosition(H,GZ),J.getVertexPosition(q,RZ),J.getVertexPosition(Y,LZ);let N=o2(J,$,Q,Z,GZ,RZ,LZ,MF);if(N){let U=new g;if(P6.getBarycoord(MF,GZ,RZ,LZ,U),K)N.uv=P6.getInterpolatedAttribute(K,H,q,Y,U,new Q8);if(W)N.uv1=P6.getInterpolatedAttribute(W,H,q,Y,U,new Q8);if(X){if(N.normal=P6.getInterpolatedAttribute(X,H,q,Y,U,new g),N.normal.dot(Z.direction)>0)N.normal.multiplyScalar(-1)}let V={a:H,b:q,c:Y,normal:new g,materialIndex:0};P6.getNormal(GZ,RZ,LZ,V.normal),N.face=V,N.barycoord=U}return N}class KH extends e8{constructor(J=null,$=1,Q=1,Z,K,W,X,H,q=1003,Y=1003,N,U){super(null,W,X,H,q,Y,Z,K,N,U);this.isDataTexture=!0,this.image={data:J,width:$,height:Q},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var tW=new g,a2=new g,r2=new x0;class I7{constructor(J=new g(1,0,0),$=0){this.isPlane=!0,this.normal=J,this.constant=$}set(J,$){return this.normal.copy(J),this.constant=$,this}setComponents(J,$,Q,Z){return this.normal.set(J,$,Q),this.constant=Z,this}setFromNormalAndCoplanarPoint(J,$){return this.normal.copy(J),this.constant=-$.dot(this.normal),this}setFromCoplanarPoints(J,$,Q){let Z=tW.subVectors(Q,$).cross(a2.subVectors(J,$)).normalize();return this.setFromNormalAndCoplanarPoint(Z,J),this}copy(J){return this.normal.copy(J.normal),this.constant=J.constant,this}normalize(){let J=1/this.normal.length();return this.normal.multiplyScalar(J),this.constant*=J,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(J){return this.normal.dot(J)+this.constant}distanceToSphere(J){return this.distanceToPoint(J.center)-J.radius}projectPoint(J,$){return $.copy(J).addScaledVector(this.normal,-this.distanceToPoint(J))}intersectLine(J,$){let Q=J.delta(tW),Z=this.normal.dot(Q);if(Z===0){if(this.distanceToPoint(J.start)===0)return $.copy(J.start);return null}let K=-(J.start.dot(this.normal)+this.constant)/Z;if(K<0||K>1)return null;return $.copy(J.start).addScaledVector(Q,K)}intersectsLine(J){let $=this.distanceToPoint(J.start),Q=this.distanceToPoint(J.end);return $<0&&Q>0||Q<0&&$>0}intersectsBox(J){return J.intersectsPlane(this)}intersectsSphere(J){return J.intersectsPlane(this)}coplanarPoint(J){return J.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(J,$){let Q=$||r2.getNormalMatrix(J),Z=this.coplanarPoint(tW).applyMatrix4(J),K=this.normal.applyMatrix3(Q).normalize();return this.constant=-Z.dot(K),this}translate(J){return this.constant-=J.dot(this.normal),this}equals(J){return J.normal.equals(this.normal)&&J.constant===this.constant}clone(){return new this.constructor().copy(this)}}var YJ=new I9,t2=new Q8(0.5,0.5),CZ=new g;class G${constructor(J=new I7,$=new I7,Q=new I7,Z=new I7,K=new I7,W=new I7){this.planes=[J,$,Q,Z,K,W]}set(J,$,Q,Z,K,W){let X=this.planes;return X[0].copy(J),X[1].copy($),X[2].copy(Q),X[3].copy(Z),X[4].copy(K),X[5].copy(W),this}copy(J){let $=this.planes;for(let Q=0;Q<6;Q++)$[Q].copy(J.planes[Q]);return this}setFromProjectionMatrix(J,$=2000,Q=!1){let Z=this.planes,K=J.elements,W=K[0],X=K[1],H=K[2],q=K[3],Y=K[4],N=K[5],U=K[6],V=K[7],z=K[8],D=K[9],w=K[10],F=K[11],O=K[12],R=K[13],B=K[14],L=K[15];if(Z[0].setComponents(q-W,V-Y,F-z,L-O).normalize(),Z[1].setComponents(q+W,V+Y,F+z,L+O).normalize(),Z[2].setComponents(q+X,V+N,F+D,L+R).normalize(),Z[3].setComponents(q-X,V-N,F-D,L-R).normalize(),Q)Z[4].setComponents(H,U,w,B).normalize(),Z[5].setComponents(q-H,V-U,F-w,L-B).normalize();else if(Z[4].setComponents(q-H,V-U,F-w,L-B).normalize(),$===2000)Z[5].setComponents(q+H,V+U,F+w,L+B).normalize();else if($===2001)Z[5].setComponents(H,U,w,B).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+$);return this}intersectsObject(J){if(J.boundingSphere!==void 0){if(J.boundingSphere===null)J.computeBoundingSphere();YJ.copy(J.boundingSphere).applyMatrix4(J.matrixWorld)}else{let $=J.geometry;if($.boundingSphere===null)$.computeBoundingSphere();YJ.copy($.boundingSphere).applyMatrix4(J.matrixWorld)}return this.intersectsSphere(YJ)}intersectsSprite(J){YJ.center.set(0,0,0);let $=t2.distanceTo(J.center);return YJ.radius=0.7071067811865476+$,YJ.applyMatrix4(J.matrixWorld),this.intersectsSphere(YJ)}intersectsSphere(J){let $=this.planes,Q=J.center,Z=-J.radius;for(let K=0;K<6;K++)if($[K].distanceToPoint(Q)<Z)return!1;return!0}intersectsBox(J){let $=this.planes;for(let Q=0;Q<6;Q++){let Z=$[Q];if(CZ.x=Z.normal.x>0?J.max.x:J.min.x,CZ.y=Z.normal.y>0?J.max.y:J.min.y,CZ.z=Z.normal.z>0?J.max.z:J.min.z,Z.distanceToPoint(CZ)<0)return!1}return!0}containsPoint(J){let $=this.planes;for(let Q=0;Q<6;Q++)if($[Q].distanceToPoint(J)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class R$ extends L7{constructor(J){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new l0(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(J)}copy(J){return super.copy(J),this.color.copy(J.color),this.map=J.map,this.alphaMap=J.alphaMap,this.size=J.size,this.sizeAttenuation=J.sizeAttenuation,this.fog=J.fog,this}}var GF=new G8,JX=new oZ,EZ=new I9,PZ=new g;class rZ extends J6{constructor(J=new M6,$=new R$){super();this.isPoints=!0,this.type="Points",this.geometry=J,this.material=$,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(J,$){return super.copy(J,$),this.material=Array.isArray(J.material)?J.material.slice():J.material,this.geometry=J.geometry,this}raycast(J,$){let Q=this.geometry,Z=this.matrixWorld,K=J.params.Points.threshold,W=Q.drawRange;if(Q.boundingSphere===null)Q.computeBoundingSphere();if(EZ.copy(Q.boundingSphere),EZ.applyMatrix4(Z),EZ.radius+=K,J.ray.intersectsSphere(EZ)===!1)return;GF.copy(Z).invert(),JX.copy(J.ray).applyMatrix4(GF);let X=K/((this.scale.x+this.scale.y+this.scale.z)/3),H=X*X,q=Q.index,N=Q.attributes.position;if(q!==null){let U=Math.max(0,W.start),V=Math.min(q.count,W.start+W.count);for(let z=U,D=V;z<D;z++){let w=q.getX(z);PZ.fromBufferAttribute(N,w),RF(PZ,w,H,Z,J,$,this)}}else{let U=Math.max(0,W.start),V=Math.min(N.count,W.start+W.count);for(let z=U,D=V;z<D;z++)PZ.fromBufferAttribute(N,z),RF(PZ,z,H,Z,J,$,this)}}updateMorphTargets(){let $=this.geometry.morphAttributes,Q=Object.keys($);if(Q.length>0){let Z=$[Q[0]];if(Z!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let K=0,W=Z.length;K<W;K++){let X=Z[K].name||String(K);this.morphTargetInfluences.push(0),this.morphTargetDictionary[X]=K}}}}}function RF(J,$,Q,Z,K,W,X){let H=JX.distanceSqToPoint(J);if(H<Q){let q=new g;JX.closestPointToPoint(J,q),q.applyMatrix4(Z);let Y=K.ray.origin.distanceTo(q);if(Y<K.near||Y>K.far)return;W.push({distance:Y,distanceToRay:Math.sqrt(H),point:q,index:$,face:null,faceIndex:null,barycoord:null,object:X})}}class tZ extends e8{constructor(J=[],$=301,Q,Z,K,W,X,H,q,Y){super(J,$,Q,Z,K,W,X,H,q,Y);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(J){this.image=J}}class DJ extends e8{constructor(J,$,Q=1014,Z,K,W,X=1003,H=1003,q,Y=1026,N=1){if(Y!==1026&&Y!==1027)throw Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let U={width:J,height:$,depth:N};super(U,Z,K,W,X,H,Y,Q,q);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(J){return super.copy(J),this.source=new I$(Object.assign({},J.image)),this.compareFunction=J.compareFunction,this}toJSON(J){let $=super.toJSON(J);if(this.compareFunction!==null)$.compareFunction=this.compareFunction;return $}}class WH extends DJ{constructor(J,$=1014,Q=301,Z,K,W=1003,X=1003,H,q=1026){let Y={width:J,height:J,depth:1},N=[Y,Y,Y,Y,Y,Y];super(J,J,$,Q,Z,K,W,X,H,q);this.image=N,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(J){this.image=J}}class eZ extends e8{constructor(J=null){super();this.sourceTexture=J,this.isExternalTexture=!0}copy(J){return super.copy(J),this.sourceTexture=J.sourceTexture,this}}class w9 extends M6{constructor(J=1,$=1,Q=1,Z=1,K=1,W=1){super();this.type="BoxGeometry",this.parameters={width:J,height:$,depth:Q,widthSegments:Z,heightSegments:K,depthSegments:W};let X=this;Z=Math.floor(Z),K=Math.floor(K),W=Math.floor(W);let H=[],q=[],Y=[],N=[],U=0,V=0;z("z","y","x",-1,-1,Q,$,J,W,K,0),z("z","y","x",1,-1,Q,$,-J,W,K,1),z("x","z","y",1,1,J,Q,$,Z,W,2),z("x","z","y",1,-1,J,Q,-$,Z,W,3),z("x","y","z",1,-1,J,$,Q,Z,K,4),z("x","y","z",-1,-1,J,$,-Q,Z,K,5),this.setIndex(H),this.setAttribute("position",new d6(q,3)),this.setAttribute("normal",new d6(Y,3)),this.setAttribute("uv",new d6(N,2));function z(D,w,F,O,R,B,L,y,_,j,I){let E=B/_,u=L/j,C=B/2,p=L/2,n=y/2,f=_+1,i=j+1,d=0,m=0,J0=new g;for(let $0=0;$0<i;$0++){let U0=$0*u-p;for(let C0=0;C0<f;C0++){let N0=C0*E-C;J0[D]=N0*O,J0[w]=U0*R,J0[F]=n,q.push(J0.x,J0.y,J0.z),J0[D]=0,J0[w]=0,J0[F]=y>0?1:-1,Y.push(J0.x,J0.y,J0.z),N.push(C0/_),N.push(1-$0/j),d+=1}}for(let $0=0;$0<j;$0++)for(let U0=0;U0<_;U0++){let C0=U+U0+f*$0,N0=U+U0+f*($0+1),M8=U+(U0+1)+f*($0+1),X8=U+(U0+1)+f*$0;H.push(C0,N0,X8),H.push(N0,M8,X8),m+=6}X.addGroup(V,m,I),V+=m,U+=d}}copy(J){return super.copy(J),this.parameters=Object.assign({},J.parameters),this}static fromJSON(J){return new w9(J.width,J.height,J.depth,J.widthSegments,J.heightSegments,J.depthSegments)}}class L$ extends M6{constructor(J=1,$=1,Q=1,Z=1){super();this.type="PlaneGeometry",this.parameters={width:J,height:$,widthSegments:Q,heightSegments:Z};let K=J/2,W=$/2,X=Math.floor(Q),H=Math.floor(Z),q=X+1,Y=H+1,N=J/X,U=$/H,V=[],z=[],D=[],w=[];for(let F=0;F<Y;F++){let O=F*U-W;for(let R=0;R<q;R++){let B=R*N-K;z.push(B,-O,0),D.push(0,0,1),w.push(R/X),w.push(1-F/H)}}for(let F=0;F<H;F++)for(let O=0;O<X;O++){let R=O+q*F,B=O+q*(F+1),L=O+1+q*(F+1),y=O+1+q*F;V.push(R,B,y),V.push(B,L,y)}this.setIndex(V),this.setAttribute("position",new d6(z,3)),this.setAttribute("normal",new d6(D,3)),this.setAttribute("uv",new d6(w,2))}copy(J){return super.copy(J),this.parameters=Object.assign({},J.parameters),this}static fromJSON(J){return new L$(J.width,J.height,J.widthSegments,J.heightSegments)}}function kJ(J){let $={};for(let Q in J){$[Q]={};for(let Z in J[Q]){let K=J[Q][Z];if(K&&(K.isColor||K.isMatrix3||K.isMatrix4||K.isVector2||K.isVector3||K.isVector4||K.isTexture||K.isQuaternion))if(K.isRenderTargetTexture)b0("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),$[Q][Z]=null;else $[Q][Z]=K.clone();else if(Array.isArray(K))$[Q][Z]=K.slice();else $[Q][Z]=K}}return $}function $6(J){let $={};for(let Q=0;Q<J.length;Q++){let Z=kJ(J[Q]);for(let K in Z)$[K]=Z[K]}return $}function e2(J){let $=[];for(let Q=0;Q<J.length;Q++)$.push(J[Q].clone());return $}function XH(J){let $=J.getRenderTarget();if($===null)return J.outputColorSpace;if($.isXRRenderTarget===!0)return $.texture.colorSpace;return a0.workingColorSpace}var Sz={clone:kJ,merge:$6},JI=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,$I=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class S6 extends L7{constructor(J){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=JI,this.fragmentShader=$I,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,J!==void 0)this.setValues(J)}copy(J){return super.copy(J),this.fragmentShader=J.fragmentShader,this.vertexShader=J.vertexShader,this.uniforms=kJ(J.uniforms),this.uniformsGroups=e2(J.uniformsGroups),this.defines=Object.assign({},J.defines),this.wireframe=J.wireframe,this.wireframeLinewidth=J.wireframeLinewidth,this.fog=J.fog,this.lights=J.lights,this.clipping=J.clipping,this.extensions=Object.assign({},J.extensions),this.glslVersion=J.glslVersion,this.defaultAttributeValues=Object.assign({},J.defaultAttributeValues),this.index0AttributeName=J.index0AttributeName,this.uniformsNeedUpdate=J.uniformsNeedUpdate,this}toJSON(J){let $=super.toJSON(J);$.glslVersion=this.glslVersion,$.uniforms={};for(let Z in this.uniforms){let W=this.uniforms[Z].value;if(W&&W.isTexture)$.uniforms[Z]={type:"t",value:W.toJSON(J).uuid};else if(W&&W.isColor)$.uniforms[Z]={type:"c",value:W.getHex()};else if(W&&W.isVector2)$.uniforms[Z]={type:"v2",value:W.toArray()};else if(W&&W.isVector3)$.uniforms[Z]={type:"v3",value:W.toArray()};else if(W&&W.isVector4)$.uniforms[Z]={type:"v4",value:W.toArray()};else if(W&&W.isMatrix3)$.uniforms[Z]={type:"m3",value:W.toArray()};else if(W&&W.isMatrix4)$.uniforms[Z]={type:"m4",value:W.toArray()};else $.uniforms[Z]={value:W}}if(Object.keys(this.defines).length>0)$.defines=this.defines;$.vertexShader=this.vertexShader,$.fragmentShader=this.fragmentShader,$.lights=this.lights,$.clipping=this.clipping;let Q={};for(let Z in this.extensions)if(this.extensions[Z]===!0)Q[Z]=!0;if(Object.keys(Q).length>0)$.extensions=Q;return $}}class HH extends S6{constructor(J){super(J);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class qH extends L7{constructor(J){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(J)}copy(J){return super.copy(J),this.depthPacking=J.depthPacking,this.map=J.map,this.alphaMap=J.alphaMap,this.displacementMap=J.displacementMap,this.displacementScale=J.displacementScale,this.displacementBias=J.displacementBias,this.wireframe=J.wireframe,this.wireframeLinewidth=J.wireframeLinewidth,this}}class YH extends L7{constructor(J){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(J)}copy(J){return super.copy(J),this.map=J.map,this.alphaMap=J.alphaMap,this.displacementMap=J.displacementMap,this.displacementScale=J.displacementScale,this.displacementBias=J.displacementBias,this}}function jZ(J,$){if(!J||J.constructor===$)return J;if(typeof $.BYTES_PER_ELEMENT==="number")return new $(J);return Array.prototype.slice.call(J)}class IJ{constructor(J,$,Q,Z){this.parameterPositions=J,this._cachedIndex=0,this.resultBuffer=Z!==void 0?Z:new $.constructor(Q),this.sampleValues=$,this.valueSize=Q,this.settings=null,this.DefaultSettings_={}}evaluate(J){let $=this.parameterPositions,Q=this._cachedIndex,Z=$[Q],K=$[Q-1];Q:{J:{let W;$:{Z:if(!(J<Z)){for(let X=Q+2;;){if(Z===void 0){if(J<K)break Z;return Q=$.length,this._cachedIndex=Q,this.copySampleValue_(Q-1)}if(Q===X)break;if(K=Z,Z=$[++Q],J<Z)break J}W=$.length;break $}if(!(J>=K)){let X=$[1];if(J<X)Q=2,K=X;for(let H=Q-2;;){if(K===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(Q===H)break;if(Z=K,K=$[--Q-1],J>=K)break J}W=Q,Q=0;break $}break Q}while(Q<W){let X=Q+W>>>1;if(J<$[X])W=X;else Q=X+1}if(Z=$[Q],K=$[Q-1],K===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(Z===void 0)return Q=$.length,this._cachedIndex=Q,this.copySampleValue_(Q-1)}this._cachedIndex=Q,this.intervalChanged_(Q,K,Z)}return this.interpolate_(Q,K,J,Z)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(J){let $=this.resultBuffer,Q=this.sampleValues,Z=this.valueSize,K=J*Z;for(let W=0;W!==Z;++W)$[W]=Q[K+W];return $}interpolate_(){throw Error("call to abstract method")}intervalChanged_(){}}class NH extends IJ{constructor(J,$,Q,Z){super(J,$,Q,Z);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(J,$,Q){let Z=this.parameterPositions,K=J-2,W=J+1,X=Z[K],H=Z[W];if(X===void 0)switch(this.getSettings_().endingStart){case 2401:K=J,X=2*$-Q;break;case 2402:K=Z.length-2,X=$+Z[K]-Z[K+1];break;default:K=J,X=Q}if(H===void 0)switch(this.getSettings_().endingEnd){case 2401:W=J,H=2*Q-$;break;case 2402:W=1,H=Q+Z[1]-Z[0];break;default:W=J-1,H=$}let q=(Q-$)*0.5,Y=this.valueSize;this._weightPrev=q/($-X),this._weightNext=q/(H-Q),this._offsetPrev=K*Y,this._offsetNext=W*Y}interpolate_(J,$,Q,Z){let K=this.resultBuffer,W=this.sampleValues,X=this.valueSize,H=J*X,q=H-X,Y=this._offsetPrev,N=this._offsetNext,U=this._weightPrev,V=this._weightNext,z=(Q-$)/(Z-$),D=z*z,w=D*z,F=-U*w+2*U*D-U*z,O=(1+U)*w+(-1.5-2*U)*D+(-0.5+U)*z+1,R=(-1-V)*w+(1.5+V)*D+0.5*z,B=V*w-V*D;for(let L=0;L!==X;++L)K[L]=F*W[Y+L]+O*W[q+L]+R*W[H+L]+B*W[N+L];return K}}class UH extends IJ{constructor(J,$,Q,Z){super(J,$,Q,Z)}interpolate_(J,$,Q,Z){let K=this.resultBuffer,W=this.sampleValues,X=this.valueSize,H=J*X,q=H-X,Y=(Q-$)/(Z-$),N=1-Y;for(let U=0;U!==X;++U)K[U]=W[q+U]*N+W[H+U]*Y;return K}}class VH extends IJ{constructor(J,$,Q,Z){super(J,$,Q,Z)}interpolate_(J){return this.copySampleValue_(J-1)}}class OH extends IJ{interpolate_(J,$,Q,Z){let K=this.resultBuffer,W=this.sampleValues,X=this.valueSize,H=J*X,q=H-X,Y=this.settings||this.DefaultSettings_,N=Y.inTangents,U=Y.outTangents;if(!N||!U){let D=(Q-$)/(Z-$),w=1-D;for(let F=0;F!==X;++F)K[F]=W[q+F]*w+W[H+F]*D;return K}let V=X*2,z=J-1;for(let D=0;D!==X;++D){let w=W[q+D],F=W[H+D],O=z*V+D*2,R=U[O],B=U[O+1],L=J*V+D*2,y=N[L],_=N[L+1],j=(Q-$)/(Z-$),I,E,u,C,p;for(let n=0;n<8;n++){I=j*j,E=I*j,u=1-j,C=u*u,p=C*u;let i=p*$+3*C*j*R+3*u*I*y+E*Z-Q;if(Math.abs(i)<0.0000000001)break;let d=3*C*(R-$)+6*u*j*(y-R)+3*I*(Z-y);if(Math.abs(d)<0.0000000001)break;j=j-i/d,j=Math.max(0,Math.min(1,j))}K[D]=p*w+3*C*j*B+3*u*I*_+E*F}return K}}class T6{constructor(J,$,Q,Z){if(J===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if($===void 0||$.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+J);this.name=J,this.times=jZ($,this.TimeBufferType),this.values=jZ(Q,this.ValueBufferType),this.setInterpolation(Z||this.DefaultInterpolation)}static toJSON(J){let $=J.constructor,Q;if($.toJSON!==this.toJSON)Q=$.toJSON(J);else{Q={name:J.name,times:jZ(J.times,Array),values:jZ(J.values,Array)};let Z=J.getInterpolation();if(Z!==J.DefaultInterpolation)Q.interpolation=Z}return Q.type=J.ValueTypeName,Q}InterpolantFactoryMethodDiscrete(J){return new VH(this.times,this.values,this.getValueSize(),J)}InterpolantFactoryMethodLinear(J){return new UH(this.times,this.values,this.getValueSize(),J)}InterpolantFactoryMethodSmooth(J){return new NH(this.times,this.values,this.getValueSize(),J)}InterpolantFactoryMethodBezier(J){let $=new OH(this.times,this.values,this.getValueSize(),J);if(this.settings)$.settings=this.settings;return $}setInterpolation(J){let $;switch(J){case 2300:$=this.InterpolantFactoryMethodDiscrete;break;case 2301:$=this.InterpolantFactoryMethodLinear;break;case 2302:$=this.InterpolantFactoryMethodSmooth;break;case 2303:$=this.InterpolantFactoryMethodBezier;break}if($===void 0){let Q="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(J!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(Q);return b0("KeyframeTrack:",Q),this}return this.createInterpolant=$,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(J){if(J!==0){let $=this.times;for(let Q=0,Z=$.length;Q!==Z;++Q)$[Q]+=J}return this}scale(J){if(J!==1){let $=this.times;for(let Q=0,Z=$.length;Q!==Z;++Q)$[Q]*=J}return this}trim(J,$){let Q=this.times,Z=Q.length,K=0,W=Z-1;while(K!==Z&&Q[K]<J)++K;while(W!==-1&&Q[W]>$)--W;if(++W,K!==0||W!==Z){if(K>=W)W=Math.max(W,1),K=W-1;let X=this.getValueSize();this.times=Q.slice(K,W),this.values=this.values.slice(K*X,W*X)}return this}validate(){let J=!0,$=this.getValueSize();if($-Math.floor($)!==0)y0("KeyframeTrack: Invalid value size in track.",this),J=!1;let Q=this.times,Z=this.values,K=Q.length;if(K===0)y0("KeyframeTrack: Track is empty.",this),J=!1;let W=null;for(let X=0;X!==K;X++){let H=Q[X];if(typeof H==="number"&&isNaN(H)){y0("KeyframeTrack: Time is not a valid number.",this,X,H),J=!1;break}if(W!==null&&W>H){y0("KeyframeTrack: Out of order keys.",this,X,H,W),J=!1;break}W=H}if(Z!==void 0){if(y2(Z))for(let X=0,H=Z.length;X!==H;++X){let q=Z[X];if(isNaN(q)){y0("KeyframeTrack: Value is not a valid number.",this,X,q),J=!1;break}}}return J}optimize(){let J=this.times.slice(),$=this.values.slice(),Q=this.getValueSize(),Z=this.getInterpolation()===2302,K=J.length-1,W=1;for(let X=1;X<K;++X){let H=!1,q=J[X],Y=J[X+1];if(q!==Y&&(X!==1||q!==J[0]))if(!Z){let N=X*Q,U=N-Q,V=N+Q;for(let z=0;z!==Q;++z){let D=$[N+z];if(D!==$[U+z]||D!==$[V+z]){H=!0;break}}}else H=!0;if(H){if(X!==W){J[W]=J[X];let N=X*Q,U=W*Q;for(let V=0;V!==Q;++V)$[U+V]=$[N+V]}++W}}if(K>0){J[W]=J[K];for(let X=K*Q,H=W*Q,q=0;q!==Q;++q)$[H+q]=$[X+q];++W}if(W!==J.length)this.times=J.slice(0,W),this.values=$.slice(0,W*Q);else this.times=J,this.values=$;return this}clone(){let J=this.times.slice(),$=this.values.slice(),Z=new this.constructor(this.name,J,$);return Z.createInterpolant=this.createInterpolant,Z}}T6.prototype.ValueTypeName="";T6.prototype.TimeBufferType=Float32Array;T6.prototype.ValueBufferType=Float32Array;T6.prototype.DefaultInterpolation=2301;class wJ extends T6{constructor(J,$,Q){super(J,$,Q)}}wJ.prototype.ValueTypeName="bool";wJ.prototype.ValueBufferType=Array;wJ.prototype.DefaultInterpolation=2300;wJ.prototype.InterpolantFactoryMethodLinear=void 0;wJ.prototype.InterpolantFactoryMethodSmooth=void 0;class FH extends T6{constructor(J,$,Q,Z){super(J,$,Q,Z)}}FH.prototype.ValueTypeName="color";class zH extends T6{constructor(J,$,Q,Z){super(J,$,Q,Z)}}zH.prototype.ValueTypeName="number";class DH extends IJ{constructor(J,$,Q,Z){super(J,$,Q,Z)}interpolate_(J,$,Q,Z){let K=this.resultBuffer,W=this.sampleValues,X=this.valueSize,H=(Q-$)/(Z-$),q=J*X;for(let Y=q+X;q!==Y;q+=4)R7.slerpFlat(K,0,W,q-X,W,q,H);return K}}class JK extends T6{constructor(J,$,Q,Z){super(J,$,Q,Z)}InterpolantFactoryMethodLinear(J){return new DH(this.times,this.values,this.getValueSize(),J)}}JK.prototype.ValueTypeName="quaternion";JK.prototype.InterpolantFactoryMethodSmooth=void 0;class MJ extends T6{constructor(J,$,Q){super(J,$,Q)}}MJ.prototype.ValueTypeName="string";MJ.prototype.ValueBufferType=Array;MJ.prototype.DefaultInterpolation=2300;MJ.prototype.InterpolantFactoryMethodLinear=void 0;MJ.prototype.InterpolantFactoryMethodSmooth=void 0;class kH extends T6{constructor(J,$,Q,Z){super(J,$,Q,Z)}}kH.prototype.ValueTypeName="vector";class IH{constructor(J,$,Q){let Z=this,K=!1,W=0,X=0,H=void 0,q=[];this.onStart=void 0,this.onLoad=J,this.onProgress=$,this.onError=Q,this._abortController=null,this.itemStart=function(Y){if(X++,K===!1){if(Z.onStart!==void 0)Z.onStart(Y,W,X)}K=!0},this.itemEnd=function(Y){if(W++,Z.onProgress!==void 0)Z.onProgress(Y,W,X);if(W===X){if(K=!1,Z.onLoad!==void 0)Z.onLoad()}},this.itemError=function(Y){if(Z.onError!==void 0)Z.onError(Y)},this.resolveURL=function(Y){if(H)return H(Y);return Y},this.setURLModifier=function(Y){return H=Y,this},this.addHandler=function(Y,N){return q.push(Y,N),this},this.removeHandler=function(Y){let N=q.indexOf(Y);if(N!==-1)q.splice(N,2);return this},this.getHandler=function(Y){for(let N=0,U=q.length;N<U;N+=2){let V=q[N],z=q[N+1];if(V.global)V.lastIndex=0;if(V.test(Y))return z}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var Tz=new IH;class wH{constructor(J){if(this.manager=J!==void 0?J:Tz,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(J,$){let Q=this;return new Promise(function(Z,K){Q.load(J,Z,$,K)})}parse(){}setCrossOrigin(J){return this.crossOrigin=J,this}setWithCredentials(J){return this.withCredentials=J,this}setPath(J){return this.path=J,this}setResourcePath(J){return this.resourcePath=J,this}setRequestHeader(J){return this.requestHeader=J,this}abort(){return this}}wH.DEFAULT_MATERIAL_NAME="__DEFAULT";class $K extends J6{constructor(J,$=1){super();this.isLight=!0,this.type="Light",this.color=new l0(J),this.intensity=$}dispose(){this.dispatchEvent({type:"dispose"})}copy(J,$){return super.copy(J,$),this.color.copy(J.color),this.intensity=J.intensity,this}toJSON(J){let $=super.toJSON(J);return $.object.color=this.color.getHex(),$.object.intensity=this.intensity,$}}var eW=new G8,LF=new g,BF=new g;class yz{constructor(J){this.camera=J,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Q8(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new G8,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new G$,this._frameExtents=new Q8(1,1),this._viewportCount=1,this._viewports=[new A8(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(J){let $=this.camera,Q=this.matrix;if(LF.setFromMatrixPosition(J.matrixWorld),$.position.copy(LF),BF.setFromMatrixPosition(J.target.matrixWorld),$.lookAt(BF),$.updateMatrixWorld(),eW.multiplyMatrices($.projectionMatrix,$.matrixWorldInverse),this._frustum.setFromProjectionMatrix(eW,$.coordinateSystem,$.reversedDepth),$.coordinateSystem===2001||$.reversedDepth)Q.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,1,0,0,0,0,1);else Q.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);Q.multiply(eW)}getViewport(J){return this._viewports[J]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(J){return this.camera=J.camera.clone(),this.intensity=J.intensity,this.bias=J.bias,this.radius=J.radius,this.autoUpdate=J.autoUpdate,this.needsUpdate=J.needsUpdate,this.normalBias=J.normalBias,this.blurSamples=J.blurSamples,this.mapSize.copy(J.mapSize),this.biasNode=J.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let J={};if(this.intensity!==1)J.intensity=this.intensity;if(this.bias!==0)J.bias=this.bias;if(this.normalBias!==0)J.normalBias=this.normalBias;if(this.radius!==1)J.radius=this.radius;if(this.mapSize.x!==512||this.mapSize.y!==512)J.mapSize=this.mapSize.toArray();return J.camera=this.camera.toJSON(!1).object,delete J.camera.matrix,J}}var SZ=new g,TZ=new R7,r6=new g;class QK extends J6{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new G8,this.projectionMatrix=new G8,this.projectionMatrixInverse=new G8,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(J,$){return super.copy(J,$),this.matrixWorldInverse.copy(J.matrixWorldInverse),this.projectionMatrix.copy(J.projectionMatrix),this.projectionMatrixInverse.copy(J.projectionMatrixInverse),this.coordinateSystem=J.coordinateSystem,this}getWorldDirection(J){return super.getWorldDirection(J).negate()}updateMatrixWorld(J){if(super.updateMatrixWorld(J),this.matrixWorld.decompose(SZ,TZ,r6),r6.x===1&&r6.y===1&&r6.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(SZ,TZ,r6.set(1,1,1)).invert()}updateWorldMatrix(J,$){if(super.updateWorldMatrix(J,$),this.matrixWorld.decompose(SZ,TZ,r6),r6.x===1&&r6.y===1&&r6.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(SZ,TZ,r6.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var m7=new g,AF=new Q8,_F=new Q8;class t8 extends QK{constructor(J=50,$=1,Q=0.1,Z=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=J,this.zoom=1,this.near=Q,this.far=Z,this.focus=10,this.aspect=$,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(J,$){return super.copy(J,$),this.fov=J.fov,this.zoom=J.zoom,this.near=J.near,this.far=J.far,this.focus=J.focus,this.aspect=J.aspect,this.view=J.view===null?null:Object.assign({},J.view),this.filmGauge=J.filmGauge,this.filmOffset=J.filmOffset,this}setFocalLength(J){let $=0.5*this.getFilmHeight()/J;this.fov=yZ*2*Math.atan($),this.updateProjectionMatrix()}getFocalLength(){let J=Math.tan(jW*0.5*this.fov);return 0.5*this.getFilmHeight()/J}getEffectiveFOV(){return yZ*2*Math.atan(Math.tan(jW*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(J,$,Q){m7.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),$.set(m7.x,m7.y).multiplyScalar(-J/m7.z),m7.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),Q.set(m7.x,m7.y).multiplyScalar(-J/m7.z)}getViewSize(J,$){return this.getViewBounds(J,AF,_F),$.subVectors(_F,AF)}setViewOffset(J,$,Q,Z,K,W){if(this.aspect=J/$,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=J,this.view.fullHeight=$,this.view.offsetX=Q,this.view.offsetY=Z,this.view.width=K,this.view.height=W,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let J=this.near,$=J*Math.tan(jW*0.5*this.fov)/this.zoom,Q=2*$,Z=this.aspect*Q,K=-0.5*Z,W=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:H,fullHeight:q}=W;K+=W.offsetX*Z/H,$-=W.offsetY*Q/q,Z*=W.width/H,Q*=W.height/q}let X=this.filmOffset;if(X!==0)K+=J*X/this.getFilmWidth();this.projectionMatrix.makePerspective(K,K+Z,$,$-Q,J,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(J){let $=super.toJSON(J);if($.object.fov=this.fov,$.object.zoom=this.zoom,$.object.near=this.near,$.object.far=this.far,$.object.focus=this.focus,$.object.aspect=this.aspect,this.view!==null)$.object.view=Object.assign({},this.view);return $.object.filmGauge=this.filmGauge,$.object.filmOffset=this.filmOffset,$}}class bz extends yz{constructor(){super(new t8(90,1,0.5,500));this.isPointLightShadow=!0}}class ZK extends $K{constructor(J,$,Q=0,Z=2){super(J,$);this.isPointLight=!0,this.type="PointLight",this.distance=Q,this.decay=Z,this.shadow=new bz}get power(){return this.intensity*4*Math.PI}set power(J){this.intensity=J/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(J,$){return super.copy(J,$),this.distance=J.distance,this.decay=J.decay,this.shadow=J.shadow.clone(),this}toJSON(J){let $=super.toJSON(J);return $.object.distance=this.distance,$.object.decay=this.decay,$.object.shadow=this.shadow.toJSON(),$}}class KK extends QK{constructor(J=-1,$=1,Q=1,Z=-1,K=0.1,W=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=J,this.right=$,this.top=Q,this.bottom=Z,this.near=K,this.far=W,this.updateProjectionMatrix()}copy(J,$){return super.copy(J,$),this.left=J.left,this.right=J.right,this.top=J.top,this.bottom=J.bottom,this.near=J.near,this.far=J.far,this.zoom=J.zoom,this.view=J.view===null?null:Object.assign({},J.view),this}setViewOffset(J,$,Q,Z,K,W){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=J,this.view.fullHeight=$,this.view.offsetX=Q,this.view.offsetY=Z,this.view.width=K,this.view.height=W,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let J=(this.right-this.left)/(2*this.zoom),$=(this.top-this.bottom)/(2*this.zoom),Q=(this.right+this.left)/2,Z=(this.top+this.bottom)/2,K=Q-J,W=Q+J,X=Z+$,H=Z-$;if(this.view!==null&&this.view.enabled){let q=(this.right-this.left)/this.view.fullWidth/this.zoom,Y=(this.top-this.bottom)/this.view.fullHeight/this.zoom;K+=q*this.view.offsetX,W=K+q*this.view.width,X-=Y*this.view.offsetY,H=X-Y*this.view.height}this.projectionMatrix.makeOrthographic(K,W,X,H,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(J){let $=super.toJSON(J);if($.object.zoom=this.zoom,$.object.left=this.left,$.object.right=this.right,$.object.top=this.top,$.object.bottom=this.bottom,$.object.near=this.near,$.object.far=this.far,this.view!==null)$.object.view=Object.assign({},this.view);return $}}class WK extends $K{constructor(J,$){super(J,$);this.isAmbientLight=!0,this.type="AmbientLight"}}var H9=-90,q9=1;class MH extends J6{constructor(J,$,Q){super();this.type="CubeCamera",this.renderTarget=Q,this.coordinateSystem=null,this.activeMipmapLevel=0;let Z=new t8(H9,q9,J,$);Z.layers=this.layers,this.add(Z);let K=new t8(H9,q9,J,$);K.layers=this.layers,this.add(K);let W=new t8(H9,q9,J,$);W.layers=this.layers,this.add(W);let X=new t8(H9,q9,J,$);X.layers=this.layers,this.add(X);let H=new t8(H9,q9,J,$);H.layers=this.layers,this.add(H);let q=new t8(H9,q9,J,$);q.layers=this.layers,this.add(q)}updateCoordinateSystem(){let J=this.coordinateSystem,$=this.children.concat(),[Q,Z,K,W,X,H]=$;for(let q of $)this.remove(q);if(J===2000)Q.up.set(0,1,0),Q.lookAt(1,0,0),Z.up.set(0,1,0),Z.lookAt(-1,0,0),K.up.set(0,0,-1),K.lookAt(0,1,0),W.up.set(0,0,1),W.lookAt(0,-1,0),X.up.set(0,1,0),X.lookAt(0,0,1),H.up.set(0,1,0),H.lookAt(0,0,-1);else if(J===2001)Q.up.set(0,-1,0),Q.lookAt(-1,0,0),Z.up.set(0,-1,0),Z.lookAt(1,0,0),K.up.set(0,0,1),K.lookAt(0,1,0),W.up.set(0,0,-1),W.lookAt(0,-1,0),X.up.set(0,-1,0),X.lookAt(0,0,1),H.up.set(0,-1,0),H.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+J);for(let q of $)this.add(q),q.updateMatrixWorld()}update(J,$){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:Q,activeMipmapLevel:Z}=this;if(this.coordinateSystem!==J.coordinateSystem)this.coordinateSystem=J.coordinateSystem,this.updateCoordinateSystem();let[K,W,X,H,q,Y]=this.children,N=J.getRenderTarget(),U=J.getActiveCubeFace(),V=J.getActiveMipmapLevel(),z=J.xr.enabled;J.xr.enabled=!1;let D=Q.texture.generateMipmaps;Q.texture.generateMipmaps=!1;let w=!1;if(J.isWebGLRenderer===!0)w=J.state.buffers.depth.getReversed();else w=J.reversedDepthBuffer;if(J.setRenderTarget(Q,0,Z),w&&J.autoClear===!1)J.clearDepth();if(J.render($,K),J.setRenderTarget(Q,1,Z),w&&J.autoClear===!1)J.clearDepth();if(J.render($,W),J.setRenderTarget(Q,2,Z),w&&J.autoClear===!1)J.clearDepth();if(J.render($,X),J.setRenderTarget(Q,3,Z),w&&J.autoClear===!1)J.clearDepth();if(J.render($,H),J.setRenderTarget(Q,4,Z),w&&J.autoClear===!1)J.clearDepth();if(J.render($,q),Q.texture.generateMipmaps=D,J.setRenderTarget(Q,5,Z),w&&J.autoClear===!1)J.clearDepth();J.render($,Y),J.setRenderTarget(N,U,V),J.xr.enabled=z,Q.texture.needsPMREMUpdate=!0}}class GH extends t8{constructor(J=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=J}}var RH="\\[\\]\\.:\\/",QI=new RegExp("["+RH+"]","g"),LH="[^"+RH+"]",ZI="[^"+RH.replace("\\.","")+"]",KI=/((?:WC+[\/:])*)/.source.replace("WC",LH),WI=/(WCOD+)?/.source.replace("WCOD",ZI),XI=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",LH),HI=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",LH),qI=new RegExp("^"+KI+WI+XI+HI+"$"),YI=["material","materials","bones","map"];class vz{constructor(J,$,Q){let Z=Q||W8.parseTrackName($);this._targetGroup=J,this._bindings=J.subscribe_($,Z)}getValue(J,$){this.bind();let Q=this._targetGroup.nCachedObjects_,Z=this._bindings[Q];if(Z!==void 0)Z.getValue(J,$)}setValue(J,$){let Q=this._bindings;for(let Z=this._targetGroup.nCachedObjects_,K=Q.length;Z!==K;++Z)Q[Z].setValue(J,$)}bind(){let J=this._bindings;for(let $=this._targetGroup.nCachedObjects_,Q=J.length;$!==Q;++$)J[$].bind()}unbind(){let J=this._bindings;for(let $=this._targetGroup.nCachedObjects_,Q=J.length;$!==Q;++$)J[$].unbind()}}class W8{constructor(J,$,Q){this.path=$,this.parsedPath=Q||W8.parseTrackName($),this.node=W8.findNode(J,this.parsedPath.nodeName),this.rootNode=J,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(J,$,Q){if(!(J&&J.isAnimationObjectGroup))return new W8(J,$,Q);else return new W8.Composite(J,$,Q)}static sanitizeNodeName(J){return J.replace(/\s/g,"_").replace(QI,"")}static parseTrackName(J){let $=qI.exec(J);if($===null)throw Error("PropertyBinding: Cannot parse trackName: "+J);let Q={nodeName:$[2],objectName:$[3],objectIndex:$[4],propertyName:$[5],propertyIndex:$[6]},Z=Q.nodeName&&Q.nodeName.lastIndexOf(".");if(Z!==void 0&&Z!==-1){let K=Q.nodeName.substring(Z+1);if(YI.indexOf(K)!==-1)Q.nodeName=Q.nodeName.substring(0,Z),Q.objectName=K}if(Q.propertyName===null||Q.propertyName.length===0)throw Error("PropertyBinding: can not parse propertyName from trackName: "+J);return Q}static findNode(J,$){if($===void 0||$===""||$==="."||$===-1||$===J.name||$===J.uuid)return J;if(J.skeleton){let Q=J.skeleton.getBoneByName($);if(Q!==void 0)return Q}if(J.children){let Q=function(K){for(let W=0;W<K.length;W++){let X=K[W];if(X.name===$||X.uuid===$)return X;let H=Q(X.children);if(H)return H}return null},Z=Q(J.children);if(Z)return Z}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(J,$){J[$]=this.targetObject[this.propertyName]}_getValue_array(J,$){let Q=this.resolvedProperty;for(let Z=0,K=Q.length;Z!==K;++Z)J[$++]=Q[Z]}_getValue_arrayElement(J,$){J[$]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(J,$){this.resolvedProperty.toArray(J,$)}_setValue_direct(J,$){this.targetObject[this.propertyName]=J[$]}_setValue_direct_setNeedsUpdate(J,$){this.targetObject[this.propertyName]=J[$],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(J,$){this.targetObject[this.propertyName]=J[$],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(J,$){let Q=this.resolvedProperty;for(let Z=0,K=Q.length;Z!==K;++Z)Q[Z]=J[$++]}_setValue_array_setNeedsUpdate(J,$){let Q=this.resolvedProperty;for(let Z=0,K=Q.length;Z!==K;++Z)Q[Z]=J[$++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(J,$){let Q=this.resolvedProperty;for(let Z=0,K=Q.length;Z!==K;++Z)Q[Z]=J[$++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(J,$){this.resolvedProperty[this.propertyIndex]=J[$]}_setValue_arrayElement_setNeedsUpdate(J,$){this.resolvedProperty[this.propertyIndex]=J[$],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(J,$){this.resolvedProperty[this.propertyIndex]=J[$],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(J,$){this.resolvedProperty.fromArray(J,$)}_setValue_fromArray_setNeedsUpdate(J,$){this.resolvedProperty.fromArray(J,$),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(J,$){this.resolvedProperty.fromArray(J,$),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(J,$){this.bind(),this.getValue(J,$)}_setValue_unbound(J,$){this.bind(),this.setValue(J,$)}bind(){let J=this.node,$=this.parsedPath,Q=$.objectName,Z=$.propertyName,K=$.propertyIndex;if(!J)J=W8.findNode(this.rootNode,$.nodeName),this.node=J;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!J){b0("PropertyBinding: No target node found for track: "+this.path+".");return}if(Q){let q=$.objectIndex;switch(Q){case"materials":if(!J.material){y0("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!J.material.materials){y0("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}J=J.material.materials;break;case"bones":if(!J.skeleton){y0("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}J=J.skeleton.bones;for(let Y=0;Y<J.length;Y++)if(J[Y].name===q){q=Y;break}break;case"map":if("map"in J){J=J.map;break}if(!J.material){y0("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!J.material.map){y0("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}J=J.material.map;break;default:if(J[Q]===void 0){y0("PropertyBinding: Can not bind to objectName of node undefined.",this);return}J=J[Q]}if(q!==void 0){if(J[q]===void 0){y0("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,J);return}J=J[q]}}let W=J[Z];if(W===void 0){let q=$.nodeName;y0("PropertyBinding: Trying to update property for track: "+q+"."+Z+" but it wasn't found.",J);return}let X=this.Versioning.None;if(this.targetObject=J,J.isMaterial===!0)X=this.Versioning.NeedsUpdate;else if(J.isObject3D===!0)X=this.Versioning.MatrixWorldNeedsUpdate;let H=this.BindingType.Direct;if(K!==void 0){if(Z==="morphTargetInfluences"){if(!J.geometry){y0("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!J.geometry.morphAttributes){y0("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(J.morphTargetDictionary[K]!==void 0)K=J.morphTargetDictionary[K]}H=this.BindingType.ArrayElement,this.resolvedProperty=W,this.propertyIndex=K}else if(W.fromArray!==void 0&&W.toArray!==void 0)H=this.BindingType.HasFromToArray,this.resolvedProperty=W;else if(Array.isArray(W))H=this.BindingType.EntireArray,this.resolvedProperty=W;else this.propertyName=Z;this.getValue=this.GetterByBindingType[H],this.setValue=this.SetterByBindingTypeAndVersioning[H][X]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}W8.Composite=vz;W8.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};W8.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};W8.prototype.GetterByBindingType=[W8.prototype._getValue_direct,W8.prototype._getValue_array,W8.prototype._getValue_arrayElement,W8.prototype._getValue_toArray];W8.prototype.SetterByBindingTypeAndVersioning=[[W8.prototype._setValue_direct,W8.prototype._setValue_direct_setNeedsUpdate,W8.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[W8.prototype._setValue_array,W8.prototype._setValue_array_setNeedsUpdate,W8.prototype._setValue_array_setMatrixWorldNeedsUpdate],[W8.prototype._setValue_arrayElement,W8.prototype._setValue_arrayElement_setNeedsUpdate,W8.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[W8.prototype._setValue_fromArray,W8.prototype._setValue_fromArray_setNeedsUpdate,W8.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var yx=new Float32Array(1);function BH(J,$,Q,Z){let K=NI(Z);switch(Q){case 1021:return J*$;case 1028:return J*$/K.components*K.byteLength;case 1029:return J*$/K.components*K.byteLength;case 1030:return J*$*2/K.components*K.byteLength;case 1031:return J*$*2/K.components*K.byteLength;case 1022:return J*$*3/K.components*K.byteLength;case 1023:return J*$*4/K.components*K.byteLength;case 1033:return J*$*4/K.components*K.byteLength;case 33776:case 33777:return Math.floor((J+3)/4)*Math.floor(($+3)/4)*8;case 33778:case 33779:return Math.floor((J+3)/4)*Math.floor(($+3)/4)*16;case 35841:case 35843:return Math.max(J,16)*Math.max($,8)/4;case 35840:case 35842:return Math.max(J,8)*Math.max($,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((J+3)/4)*Math.floor(($+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((J+3)/4)*Math.floor(($+3)/4)*16;case 37808:return Math.floor((J+3)/4)*Math.floor(($+3)/4)*16;case 37809:return Math.floor((J+4)/5)*Math.floor(($+3)/4)*16;case 37810:return Math.floor((J+4)/5)*Math.floor(($+4)/5)*16;case 37811:return Math.floor((J+5)/6)*Math.floor(($+4)/5)*16;case 37812:return Math.floor((J+5)/6)*Math.floor(($+5)/6)*16;case 37813:return Math.floor((J+7)/8)*Math.floor(($+4)/5)*16;case 37814:return Math.floor((J+7)/8)*Math.floor(($+5)/6)*16;case 37815:return Math.floor((J+7)/8)*Math.floor(($+7)/8)*16;case 37816:return Math.floor((J+9)/10)*Math.floor(($+4)/5)*16;case 37817:return Math.floor((J+9)/10)*Math.floor(($+5)/6)*16;case 37818:return Math.floor((J+9)/10)*Math.floor(($+7)/8)*16;case 37819:return Math.floor((J+9)/10)*Math.floor(($+9)/10)*16;case 37820:return Math.floor((J+11)/12)*Math.floor(($+9)/10)*16;case 37821:return Math.floor((J+11)/12)*Math.floor(($+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(J/4)*Math.ceil($/4)*16;case 36283:case 36284:return Math.ceil(J/4)*Math.ceil($/4)*8;case 36285:case 36286:return Math.ceil(J/4)*Math.ceil($/4)*16}throw Error(`Unable to determine texture byte length for ${Q} format.`)}function NI(J){switch(J){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${J}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"183"}}));if(typeof window<"u")if(window.__THREE__)b0("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="183";function KD(){let J=null,$=!1,Q=null,Z=null;function K(W,X){Q(W,X),Z=J.requestAnimationFrame(K)}return{start:function(){if($===!0)return;if(Q===null)return;Z=J.requestAnimationFrame(K),$=!0},stop:function(){J.cancelAnimationFrame(Z),$=!1},setAnimationLoop:function(W){Q=W},setContext:function(W){J=W}}}function UI(J){let $=new WeakMap;function Q(H,q){let{array:Y,usage:N}=H,U=Y.byteLength,V=J.createBuffer();J.bindBuffer(q,V),J.bufferData(q,Y,N),H.onUploadCallback();let z;if(Y instanceof Float32Array)z=J.FLOAT;else if(typeof Float16Array<"u"&&Y instanceof Float16Array)z=J.HALF_FLOAT;else if(Y instanceof Uint16Array)if(H.isFloat16BufferAttribute)z=J.HALF_FLOAT;else z=J.UNSIGNED_SHORT;else if(Y instanceof Int16Array)z=J.SHORT;else if(Y instanceof Uint32Array)z=J.UNSIGNED_INT;else if(Y instanceof Int32Array)z=J.INT;else if(Y instanceof Int8Array)z=J.BYTE;else if(Y instanceof Uint8Array)z=J.UNSIGNED_BYTE;else if(Y instanceof Uint8ClampedArray)z=J.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+Y);return{buffer:V,type:z,bytesPerElement:Y.BYTES_PER_ELEMENT,version:H.version,size:U}}function Z(H,q,Y){let{array:N,updateRanges:U}=q;if(J.bindBuffer(Y,H),U.length===0)J.bufferSubData(Y,0,N);else{U.sort((z,D)=>z.start-D.start);let V=0;for(let z=1;z<U.length;z++){let D=U[V],w=U[z];if(w.start<=D.start+D.count+1)D.count=Math.max(D.count,w.start+w.count-D.start);else++V,U[V]=w}U.length=V+1;for(let z=0,D=U.length;z<D;z++){let w=U[z];J.bufferSubData(Y,w.start*N.BYTES_PER_ELEMENT,N,w.start,w.count)}q.clearUpdateRanges()}q.onUploadCallback()}function K(H){if(H.isInterleavedBufferAttribute)H=H.data;return $.get(H)}function W(H){if(H.isInterleavedBufferAttribute)H=H.data;let q=$.get(H);if(q)J.deleteBuffer(q.buffer),$.delete(H)}function X(H,q){if(H.isInterleavedBufferAttribute)H=H.data;if(H.isGLBufferAttribute){let N=$.get(H);if(!N||N.version<H.version)$.set(H,{buffer:H.buffer,type:H.type,bytesPerElement:H.elementSize,version:H.version});return}let Y=$.get(H);if(Y===void 0)$.set(H,Q(H,q));else if(Y.version<H.version){if(Y.size!==H.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");Z(Y.buffer,H,q),Y.version=H.version}}return{get:K,remove:W,update:X}}var VI=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,OI=`#ifdef USE_ALPHAHASH
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
#endif`,FI=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,zI=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,DI=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,kI=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,II=`#ifdef USE_AOMAP
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
#endif`,wI=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,MI=`#ifdef USE_BATCHING
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
#endif`,GI=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,RI=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,LI=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,BI=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,AI=`#ifdef USE_IRIDESCENCE
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
#endif`,_I=`#ifdef USE_BUMPMAP
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
#endif`,CI=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,EI=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,PI=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,jI=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,SI=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,TI=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,yI=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,bI=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,vI=`#define PI 3.141592653589793
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
} // validated`,fI=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,hI=`vec3 transformedNormal = objectNormal;
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
#endif`,xI=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,gI=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,pI=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,mI=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,dI="gl_FragColor = linearToOutputTexel( gl_FragColor );",lI=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,cI=`#ifdef USE_ENVMAP
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
#endif`,uI=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,sI=`#ifdef USE_ENVMAP
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
#endif`,nI=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,iI=`#ifdef USE_ENVMAP
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
#endif`,oI=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,aI=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,rI=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,tI=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,eI=`#ifdef USE_GRADIENTMAP
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
}`,Jw=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,$w=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Qw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Zw=`uniform bool receiveShadow;
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
#endif`,Kw=`#ifdef USE_ENVMAP
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
#endif`,Ww=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Xw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Hw=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,qw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Yw=`PhysicalMaterial material;
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
#endif`,Nw=`uniform sampler2D dfgLUT;
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
}`,Uw=`
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
#endif`,Vw=`#if defined( RE_IndirectDiffuse )
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
#endif`,Ow=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Fw=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,zw=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Dw=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,kw=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Iw=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ww=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Mw=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Gw=`#if defined( USE_POINTS_UV )
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
#endif`,Rw=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Lw=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Bw=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Aw=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,_w=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Cw=`#ifdef USE_MORPHTARGETS
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
#endif`,Ew=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Pw=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,jw=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Sw=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Tw=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,yw=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,bw=`#ifdef USE_NORMALMAP
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
#endif`,vw=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,fw=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,hw=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,xw=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,gw=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,pw=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,mw=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,dw=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,lw=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,cw=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,uw=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,sw=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,nw=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,iw=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ow=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,aw=`float getShadowMask() {
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
}`,rw=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,tw=`#ifdef USE_SKINNING
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
#endif`,ew=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,JM=`#ifdef USE_SKINNING
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
#endif`,$M=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,QM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ZM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,KM=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,WM=`#ifdef USE_TRANSMISSION
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
#endif`,XM=`#ifdef USE_TRANSMISSION
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
#endif`,HM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,qM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,YM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,NM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,UM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,VM=`uniform sampler2D t2D;
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
}`,OM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,FM=`#ifdef ENVMAP_TYPE_CUBE
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
}`,zM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,DM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kM=`#include <common>
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
}`,IM=`#if DEPTH_PACKING == 3200
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
}`,wM=`#define DISTANCE
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
}`,MM=`#define DISTANCE
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
}`,GM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,RM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,LM=`uniform float scale;
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
}`,BM=`uniform vec3 diffuse;
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
}`,AM=`#include <common>
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
}`,_M=`uniform vec3 diffuse;
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
}`,CM=`#define LAMBERT
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
}`,EM=`#define LAMBERT
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
}`,PM=`#define MATCAP
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
}`,jM=`#define MATCAP
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
}`,SM=`#define NORMAL
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
}`,TM=`#define NORMAL
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
}`,yM=`#define PHONG
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
}`,bM=`#define PHONG
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
}`,vM=`#define STANDARD
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
}`,fM=`#define STANDARD
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
}`,hM=`#define TOON
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
}`,xM=`#define TOON
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
}`,gM=`uniform float size;
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
}`,pM=`uniform vec3 diffuse;
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
}`,mM=`#include <common>
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
}`,dM=`uniform vec3 color;
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
}`,lM=`uniform float rotation;
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
}`,cM=`uniform vec3 diffuse;
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
}`,g0={alphahash_fragment:VI,alphahash_pars_fragment:OI,alphamap_fragment:FI,alphamap_pars_fragment:zI,alphatest_fragment:DI,alphatest_pars_fragment:kI,aomap_fragment:II,aomap_pars_fragment:wI,batching_pars_vertex:MI,batching_vertex:GI,begin_vertex:RI,beginnormal_vertex:LI,bsdfs:BI,iridescence_fragment:AI,bumpmap_pars_fragment:_I,clipping_planes_fragment:CI,clipping_planes_pars_fragment:EI,clipping_planes_pars_vertex:PI,clipping_planes_vertex:jI,color_fragment:SI,color_pars_fragment:TI,color_pars_vertex:yI,color_vertex:bI,common:vI,cube_uv_reflection_fragment:fI,defaultnormal_vertex:hI,displacementmap_pars_vertex:xI,displacementmap_vertex:gI,emissivemap_fragment:pI,emissivemap_pars_fragment:mI,colorspace_fragment:dI,colorspace_pars_fragment:lI,envmap_fragment:cI,envmap_common_pars_fragment:uI,envmap_pars_fragment:sI,envmap_pars_vertex:nI,envmap_physical_pars_fragment:Kw,envmap_vertex:iI,fog_vertex:oI,fog_pars_vertex:aI,fog_fragment:rI,fog_pars_fragment:tI,gradientmap_pars_fragment:eI,lightmap_pars_fragment:Jw,lights_lambert_fragment:$w,lights_lambert_pars_fragment:Qw,lights_pars_begin:Zw,lights_toon_fragment:Ww,lights_toon_pars_fragment:Xw,lights_phong_fragment:Hw,lights_phong_pars_fragment:qw,lights_physical_fragment:Yw,lights_physical_pars_fragment:Nw,lights_fragment_begin:Uw,lights_fragment_maps:Vw,lights_fragment_end:Ow,logdepthbuf_fragment:Fw,logdepthbuf_pars_fragment:zw,logdepthbuf_pars_vertex:Dw,logdepthbuf_vertex:kw,map_fragment:Iw,map_pars_fragment:ww,map_particle_fragment:Mw,map_particle_pars_fragment:Gw,metalnessmap_fragment:Rw,metalnessmap_pars_fragment:Lw,morphinstance_vertex:Bw,morphcolor_vertex:Aw,morphnormal_vertex:_w,morphtarget_pars_vertex:Cw,morphtarget_vertex:Ew,normal_fragment_begin:Pw,normal_fragment_maps:jw,normal_pars_fragment:Sw,normal_pars_vertex:Tw,normal_vertex:yw,normalmap_pars_fragment:bw,clearcoat_normal_fragment_begin:vw,clearcoat_normal_fragment_maps:fw,clearcoat_pars_fragment:hw,iridescence_pars_fragment:xw,opaque_fragment:gw,packing:pw,premultiplied_alpha_fragment:mw,project_vertex:dw,dithering_fragment:lw,dithering_pars_fragment:cw,roughnessmap_fragment:uw,roughnessmap_pars_fragment:sw,shadowmap_pars_fragment:nw,shadowmap_pars_vertex:iw,shadowmap_vertex:ow,shadowmask_pars_fragment:aw,skinbase_vertex:rw,skinning_pars_vertex:tw,skinning_vertex:ew,skinnormal_vertex:JM,specularmap_fragment:$M,specularmap_pars_fragment:QM,tonemapping_fragment:ZM,tonemapping_pars_fragment:KM,transmission_fragment:WM,transmission_pars_fragment:XM,uv_pars_fragment:HM,uv_pars_vertex:qM,uv_vertex:YM,worldpos_vertex:NM,background_vert:UM,background_frag:VM,backgroundCube_vert:OM,backgroundCube_frag:FM,cube_vert:zM,cube_frag:DM,depth_vert:kM,depth_frag:IM,distance_vert:wM,distance_frag:MM,equirect_vert:GM,equirect_frag:RM,linedashed_vert:LM,linedashed_frag:BM,meshbasic_vert:AM,meshbasic_frag:_M,meshlambert_vert:CM,meshlambert_frag:EM,meshmatcap_vert:PM,meshmatcap_frag:jM,meshnormal_vert:SM,meshnormal_frag:TM,meshphong_vert:yM,meshphong_frag:bM,meshphysical_vert:vM,meshphysical_frag:fM,meshtoon_vert:hM,meshtoon_frag:xM,points_vert:gM,points_frag:pM,shadow_vert:mM,shadow_frag:dM,sprite_vert:lM,sprite_frag:cM},H0={common:{diffuse:{value:new l0(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new x0},alphaMap:{value:null},alphaMapTransform:{value:new x0},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new x0}},envmap:{envMap:{value:null},envMapRotation:{value:new x0},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new x0}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new x0}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new x0},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new x0},normalScale:{value:new Q8(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new x0},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new x0}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new x0}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new x0}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new l0(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new l0(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new x0},alphaTest:{value:0},uvTransform:{value:new x0}},sprite:{diffuse:{value:new l0(16777215)},opacity:{value:1},center:{value:new Q8(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new x0},alphaMap:{value:null},alphaMapTransform:{value:new x0},alphaTest:{value:0}}},Z7={basic:{uniforms:$6([H0.common,H0.specularmap,H0.envmap,H0.aomap,H0.lightmap,H0.fog]),vertexShader:g0.meshbasic_vert,fragmentShader:g0.meshbasic_frag},lambert:{uniforms:$6([H0.common,H0.specularmap,H0.envmap,H0.aomap,H0.lightmap,H0.emissivemap,H0.bumpmap,H0.normalmap,H0.displacementmap,H0.fog,H0.lights,{emissive:{value:new l0(0)},envMapIntensity:{value:1}}]),vertexShader:g0.meshlambert_vert,fragmentShader:g0.meshlambert_frag},phong:{uniforms:$6([H0.common,H0.specularmap,H0.envmap,H0.aomap,H0.lightmap,H0.emissivemap,H0.bumpmap,H0.normalmap,H0.displacementmap,H0.fog,H0.lights,{emissive:{value:new l0(0)},specular:{value:new l0(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:g0.meshphong_vert,fragmentShader:g0.meshphong_frag},standard:{uniforms:$6([H0.common,H0.envmap,H0.aomap,H0.lightmap,H0.emissivemap,H0.bumpmap,H0.normalmap,H0.displacementmap,H0.roughnessmap,H0.metalnessmap,H0.fog,H0.lights,{emissive:{value:new l0(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:g0.meshphysical_vert,fragmentShader:g0.meshphysical_frag},toon:{uniforms:$6([H0.common,H0.aomap,H0.lightmap,H0.emissivemap,H0.bumpmap,H0.normalmap,H0.displacementmap,H0.gradientmap,H0.fog,H0.lights,{emissive:{value:new l0(0)}}]),vertexShader:g0.meshtoon_vert,fragmentShader:g0.meshtoon_frag},matcap:{uniforms:$6([H0.common,H0.bumpmap,H0.normalmap,H0.displacementmap,H0.fog,{matcap:{value:null}}]),vertexShader:g0.meshmatcap_vert,fragmentShader:g0.meshmatcap_frag},points:{uniforms:$6([H0.points,H0.fog]),vertexShader:g0.points_vert,fragmentShader:g0.points_frag},dashed:{uniforms:$6([H0.common,H0.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:g0.linedashed_vert,fragmentShader:g0.linedashed_frag},depth:{uniforms:$6([H0.common,H0.displacementmap]),vertexShader:g0.depth_vert,fragmentShader:g0.depth_frag},normal:{uniforms:$6([H0.common,H0.bumpmap,H0.normalmap,H0.displacementmap,{opacity:{value:1}}]),vertexShader:g0.meshnormal_vert,fragmentShader:g0.meshnormal_frag},sprite:{uniforms:$6([H0.sprite,H0.fog]),vertexShader:g0.sprite_vert,fragmentShader:g0.sprite_frag},background:{uniforms:{uvTransform:{value:new x0},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:g0.background_vert,fragmentShader:g0.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new x0}},vertexShader:g0.backgroundCube_vert,fragmentShader:g0.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:g0.cube_vert,fragmentShader:g0.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:g0.equirect_vert,fragmentShader:g0.equirect_frag},distance:{uniforms:$6([H0.common,H0.displacementmap,{referencePosition:{value:new g},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:g0.distance_vert,fragmentShader:g0.distance_frag},shadow:{uniforms:$6([H0.lights,H0.fog,{color:{value:new l0(0)},opacity:{value:1}}]),vertexShader:g0.shadow_vert,fragmentShader:g0.shadow_frag}};Z7.physical={uniforms:$6([Z7.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new x0},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new x0},clearcoatNormalScale:{value:new Q8(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new x0},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new x0},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new x0},sheen:{value:0},sheenColor:{value:new l0(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new x0},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new x0},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new x0},transmissionSamplerSize:{value:new Q8},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new x0},attenuationDistance:{value:0},attenuationColor:{value:new l0(0)},specularColor:{value:new l0(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new x0},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new x0},anisotropyVector:{value:new Q8},anisotropyMap:{value:null},anisotropyMapTransform:{value:new x0}}]),vertexShader:g0.meshphysical_vert,fragmentShader:g0.meshphysical_frag};var XK={r:0,b:0,g:0},GJ=new t6,uM=new G8;function sM(J,$,Q,Z,K,W){let X=new l0(0),H=K===!0?0:1,q,Y,N=null,U=0,V=null;function z(R){let B=R.isScene===!0?R.background:null;if(B&&B.isTexture){let L=R.backgroundBlurriness>0;B=$.get(B,L)}return B}function D(R){let B=!1,L=z(R);if(L===null)F(X,H);else if(L&&L.isColor)F(L,1),B=!0;let y=J.xr.getEnvironmentBlendMode();if(y==="additive")Q.buffers.color.setClear(0,0,0,1,W);else if(y==="alpha-blend")Q.buffers.color.setClear(0,0,0,0,W);if(J.autoClear||B)Q.buffers.depth.setTest(!0),Q.buffers.depth.setMask(!0),Q.buffers.color.setMask(!0),J.clear(J.autoClearColor,J.autoClearDepth,J.autoClearStencil)}function w(R,B){let L=z(B);if(L&&(L.isCubeTexture||L.mapping===O$)){if(Y===void 0)Y=new u6(new w9(1,1,1),new S6({name:"BackgroundCubeMaterial",uniforms:kJ(Z7.backgroundCube.uniforms),vertexShader:Z7.backgroundCube.vertexShader,fragmentShader:Z7.backgroundCube.fragmentShader,side:N6,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),Y.geometry.deleteAttribute("normal"),Y.geometry.deleteAttribute("uv"),Y.onBeforeRender=function(y,_,j){this.matrixWorld.copyPosition(j.matrixWorld)},Object.defineProperty(Y.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),Z.update(Y);if(GJ.copy(B.backgroundRotation),GJ.x*=-1,GJ.y*=-1,GJ.z*=-1,L.isCubeTexture&&L.isRenderTargetTexture===!1)GJ.y*=-1,GJ.z*=-1;if(Y.material.uniforms.envMap.value=L,Y.material.uniforms.flipEnvMap.value=L.isCubeTexture&&L.isRenderTargetTexture===!1?-1:1,Y.material.uniforms.backgroundBlurriness.value=B.backgroundBlurriness,Y.material.uniforms.backgroundIntensity.value=B.backgroundIntensity,Y.material.uniforms.backgroundRotation.value.setFromMatrix4(uM.makeRotationFromEuler(GJ)),Y.material.toneMapped=a0.getTransfer(L.colorSpace)!==z8,N!==L||U!==L.version||V!==J.toneMapping)Y.material.needsUpdate=!0,N=L,U=L.version,V=J.toneMapping;Y.layers.enableAll(),R.unshift(Y,Y.geometry,Y.material,0,0,null)}else if(L&&L.isTexture){if(q===void 0)q=new u6(new L$(2,2),new S6({name:"BackgroundMaterial",uniforms:kJ(Z7.background.uniforms),vertexShader:Z7.background.vertexShader,fragmentShader:Z7.background.fragmentShader,side:O9,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),q.geometry.deleteAttribute("normal"),Object.defineProperty(q.material,"map",{get:function(){return this.uniforms.t2D.value}}),Z.update(q);if(q.material.uniforms.t2D.value=L,q.material.uniforms.backgroundIntensity.value=B.backgroundIntensity,q.material.toneMapped=a0.getTransfer(L.colorSpace)!==z8,L.matrixAutoUpdate===!0)L.updateMatrix();if(q.material.uniforms.uvTransform.value.copy(L.matrix),N!==L||U!==L.version||V!==J.toneMapping)q.material.needsUpdate=!0,N=L,U=L.version,V=J.toneMapping;q.layers.enableAll(),R.unshift(q,q.geometry,q.material,0,0,null)}}function F(R,B){R.getRGB(XK,XH(J)),Q.buffers.color.setClear(XK.r,XK.g,XK.b,B,W)}function O(){if(Y!==void 0)Y.geometry.dispose(),Y.material.dispose(),Y=void 0;if(q!==void 0)q.geometry.dispose(),q.material.dispose(),q=void 0}return{getClearColor:function(){return X},setClearColor:function(R,B=1){X.set(R),H=B,F(X,H)},getClearAlpha:function(){return H},setClearAlpha:function(R){H=R,F(X,H)},render:D,addToRenderList:w,dispose:O}}function nM(J,$){let Q=J.getParameter(J.MAX_VERTEX_ATTRIBS),Z={},K=V(null),W=K,X=!1;function H(C,p,n,f,i){let d=!1,m=U(C,f,n,p);if(W!==m)W=m,Y(W.object);if(d=z(C,f,n,i),d)D(C,f,n,i);if(i!==null)$.update(i,J.ELEMENT_ARRAY_BUFFER);if(d||X){if(X=!1,L(C,p,n,f),i!==null)J.bindBuffer(J.ELEMENT_ARRAY_BUFFER,$.get(i).buffer)}}function q(){return J.createVertexArray()}function Y(C){return J.bindVertexArray(C)}function N(C){return J.deleteVertexArray(C)}function U(C,p,n,f){let i=f.wireframe===!0,d=Z[p.id];if(d===void 0)d={},Z[p.id]=d;let m=C.isInstancedMesh===!0?C.id:0,J0=d[m];if(J0===void 0)J0={},d[m]=J0;let $0=J0[n.id];if($0===void 0)$0={},J0[n.id]=$0;let U0=$0[i];if(U0===void 0)U0=V(q()),$0[i]=U0;return U0}function V(C){let p=[],n=[],f=[];for(let i=0;i<Q;i++)p[i]=0,n[i]=0,f[i]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:p,enabledAttributes:n,attributeDivisors:f,object:C,attributes:{},index:null}}function z(C,p,n,f){let i=W.attributes,d=p.attributes,m=0,J0=n.getAttributes();for(let $0 in J0)if(J0[$0].location>=0){let C0=i[$0],N0=d[$0];if(N0===void 0){if($0==="instanceMatrix"&&C.instanceMatrix)N0=C.instanceMatrix;if($0==="instanceColor"&&C.instanceColor)N0=C.instanceColor}if(C0===void 0)return!0;if(C0.attribute!==N0)return!0;if(N0&&C0.data!==N0.data)return!0;m++}if(W.attributesNum!==m)return!0;if(W.index!==f)return!0;return!1}function D(C,p,n,f){let i={},d=p.attributes,m=0,J0=n.getAttributes();for(let $0 in J0)if(J0[$0].location>=0){let C0=d[$0];if(C0===void 0){if($0==="instanceMatrix"&&C.instanceMatrix)C0=C.instanceMatrix;if($0==="instanceColor"&&C.instanceColor)C0=C.instanceColor}let N0={};if(N0.attribute=C0,C0&&C0.data)N0.data=C0.data;i[$0]=N0,m++}W.attributes=i,W.attributesNum=m,W.index=f}function w(){let C=W.newAttributes;for(let p=0,n=C.length;p<n;p++)C[p]=0}function F(C){O(C,0)}function O(C,p){let{newAttributes:n,enabledAttributes:f,attributeDivisors:i}=W;if(n[C]=1,f[C]===0)J.enableVertexAttribArray(C),f[C]=1;if(i[C]!==p)J.vertexAttribDivisor(C,p),i[C]=p}function R(){let{newAttributes:C,enabledAttributes:p}=W;for(let n=0,f=p.length;n<f;n++)if(p[n]!==C[n])J.disableVertexAttribArray(n),p[n]=0}function B(C,p,n,f,i,d,m){if(m===!0)J.vertexAttribIPointer(C,p,n,i,d);else J.vertexAttribPointer(C,p,n,f,i,d)}function L(C,p,n,f){w();let i=f.attributes,d=n.getAttributes(),m=p.defaultAttributeValues;for(let J0 in d){let $0=d[J0];if($0.location>=0){let U0=i[J0];if(U0===void 0){if(J0==="instanceMatrix"&&C.instanceMatrix)U0=C.instanceMatrix;if(J0==="instanceColor"&&C.instanceColor)U0=C.instanceColor}if(U0!==void 0){let{normalized:C0,itemSize:N0}=U0,M8=$.get(U0);if(M8===void 0)continue;let{buffer:X8,type:o,bytesPerElement:W0}=M8,z0=o===J.INT||o===J.UNSIGNED_INT||U0.gpuType===OX;if(U0.isInterleavedBufferAttribute){let V0=U0.data,S0=V0.stride,r0=U0.offset;if(V0.isInstancedInterleavedBuffer){for(let t0=0;t0<$0.locationSize;t0++)O($0.location+t0,V0.meshPerAttribute);if(C.isInstancedMesh!==!0&&f._maxInstanceCount===void 0)f._maxInstanceCount=V0.meshPerAttribute*V0.count}else for(let t0=0;t0<$0.locationSize;t0++)F($0.location+t0);J.bindBuffer(J.ARRAY_BUFFER,X8);for(let t0=0;t0<$0.locationSize;t0++)B($0.location+t0,N0/$0.locationSize,o,C0,S0*W0,(r0+N0/$0.locationSize*t0)*W0,z0)}else{if(U0.isInstancedBufferAttribute){for(let V0=0;V0<$0.locationSize;V0++)O($0.location+V0,U0.meshPerAttribute);if(C.isInstancedMesh!==!0&&f._maxInstanceCount===void 0)f._maxInstanceCount=U0.meshPerAttribute*U0.count}else for(let V0=0;V0<$0.locationSize;V0++)F($0.location+V0);J.bindBuffer(J.ARRAY_BUFFER,X8);for(let V0=0;V0<$0.locationSize;V0++)B($0.location+V0,N0/$0.locationSize,o,C0,N0*W0,N0/$0.locationSize*V0*W0,z0)}}else if(m!==void 0){let C0=m[J0];if(C0!==void 0)switch(C0.length){case 2:J.vertexAttrib2fv($0.location,C0);break;case 3:J.vertexAttrib3fv($0.location,C0);break;case 4:J.vertexAttrib4fv($0.location,C0);break;default:J.vertexAttrib1fv($0.location,C0)}}}}R()}function y(){E();for(let C in Z){let p=Z[C];for(let n in p){let f=p[n];for(let i in f){let d=f[i];for(let m in d)N(d[m].object),delete d[m];delete f[i]}}delete Z[C]}}function _(C){if(Z[C.id]===void 0)return;let p=Z[C.id];for(let n in p){let f=p[n];for(let i in f){let d=f[i];for(let m in d)N(d[m].object),delete d[m];delete f[i]}}delete Z[C.id]}function j(C){for(let p in Z){let n=Z[p];for(let f in n){let i=n[f];if(i[C.id]===void 0)continue;let d=i[C.id];for(let m in d)N(d[m].object),delete d[m];delete i[C.id]}}}function I(C){for(let p in Z){let n=Z[p],f=C.isInstancedMesh===!0?C.id:0,i=n[f];if(i===void 0)continue;for(let d in i){let m=i[d];for(let J0 in m)N(m[J0].object),delete m[J0];delete i[d]}if(delete n[f],Object.keys(n).length===0)delete Z[p]}}function E(){if(u(),X=!0,W===K)return;W=K,Y(W.object)}function u(){K.geometry=null,K.program=null,K.wireframe=!1}return{setup:H,reset:E,resetDefaultState:u,dispose:y,releaseStatesOfGeometry:_,releaseStatesOfObject:I,releaseStatesOfProgram:j,initAttributes:w,enableAttribute:F,disableUnusedAttributes:R}}function iM(J,$,Q){let Z;function K(Y){Z=Y}function W(Y,N){J.drawArrays(Z,Y,N),Q.update(N,Z,1)}function X(Y,N,U){if(U===0)return;J.drawArraysInstanced(Z,Y,N,U),Q.update(N,Z,U)}function H(Y,N,U){if(U===0)return;$.get("WEBGL_multi_draw").multiDrawArraysWEBGL(Z,Y,0,N,0,U);let z=0;for(let D=0;D<U;D++)z+=N[D];Q.update(z,Z,1)}function q(Y,N,U,V){if(U===0)return;let z=$.get("WEBGL_multi_draw");if(z===null)for(let D=0;D<Y.length;D++)X(Y[D],N[D],V[D]);else{z.multiDrawArraysInstancedWEBGL(Z,Y,0,N,0,V,0,U);let D=0;for(let w=0;w<U;w++)D+=N[w]*V[w];Q.update(D,Z,1)}}this.setMode=K,this.render=W,this.renderInstances=X,this.renderMultiDraw=H,this.renderMultiDrawInstances=q}function oM(J,$,Q,Z){let K;function W(){if(K!==void 0)return K;if($.has("EXT_texture_filter_anisotropic")===!0){let j=$.get("EXT_texture_filter_anisotropic");K=J.getParameter(j.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else K=0;return K}function X(j){if(j!==$7&&Z.convert(j)!==J.getParameter(J.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function H(j){let I=j===G7&&($.has("EXT_color_buffer_half_float")||$.has("EXT_color_buffer_float"));if(j!==c6&&Z.convert(j)!==J.getParameter(J.IMPLEMENTATION_COLOR_READ_TYPE)&&j!==M7&&!I)return!1;return!0}function q(j){if(j==="highp"){if(J.getShaderPrecisionFormat(J.VERTEX_SHADER,J.HIGH_FLOAT).precision>0&&J.getShaderPrecisionFormat(J.FRAGMENT_SHADER,J.HIGH_FLOAT).precision>0)return"highp";j="mediump"}if(j==="mediump"){if(J.getShaderPrecisionFormat(J.VERTEX_SHADER,J.MEDIUM_FLOAT).precision>0&&J.getShaderPrecisionFormat(J.FRAGMENT_SHADER,J.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let Y=Q.precision!==void 0?Q.precision:"highp",N=q(Y);if(N!==Y)b0("WebGLRenderer:",Y,"not supported, using",N,"instead."),Y=N;let U=Q.logarithmicDepthBuffer===!0,V=Q.reversedDepthBuffer===!0&&$.has("EXT_clip_control"),z=J.getParameter(J.MAX_TEXTURE_IMAGE_UNITS),D=J.getParameter(J.MAX_VERTEX_TEXTURE_IMAGE_UNITS),w=J.getParameter(J.MAX_TEXTURE_SIZE),F=J.getParameter(J.MAX_CUBE_MAP_TEXTURE_SIZE),O=J.getParameter(J.MAX_VERTEX_ATTRIBS),R=J.getParameter(J.MAX_VERTEX_UNIFORM_VECTORS),B=J.getParameter(J.MAX_VARYING_VECTORS),L=J.getParameter(J.MAX_FRAGMENT_UNIFORM_VECTORS),y=J.getParameter(J.MAX_SAMPLES),_=J.getParameter(J.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:W,getMaxPrecision:q,textureFormatReadable:X,textureTypeReadable:H,precision:Y,logarithmicDepthBuffer:U,reversedDepthBuffer:V,maxTextures:z,maxVertexTextures:D,maxTextureSize:w,maxCubemapSize:F,maxAttributes:O,maxVertexUniforms:R,maxVaryings:B,maxFragmentUniforms:L,maxSamples:y,samples:_}}function aM(J){let $=this,Q=null,Z=0,K=!1,W=!1,X=new I7,H=new x0,q={value:null,needsUpdate:!1};this.uniform=q,this.numPlanes=0,this.numIntersection=0,this.init=function(U,V){let z=U.length!==0||V||Z!==0||K;return K=V,Z=U.length,z},this.beginShadows=function(){W=!0,N(null)},this.endShadows=function(){W=!1},this.setGlobalState=function(U,V){Q=N(U,V,0)},this.setState=function(U,V,z){let{clippingPlanes:D,clipIntersection:w,clipShadows:F}=U,O=J.get(U);if(!K||D===null||D.length===0||W&&!F)if(W)N(null);else Y();else{let R=W?0:Z,B=R*4,L=O.clippingState||null;q.value=L,L=N(D,V,B,z);for(let y=0;y!==B;++y)L[y]=Q[y];O.clippingState=L,this.numIntersection=w?this.numPlanes:0,this.numPlanes+=R}};function Y(){if(q.value!==Q)q.value=Q,q.needsUpdate=Z>0;$.numPlanes=Z,$.numIntersection=0}function N(U,V,z,D){let w=U!==null?U.length:0,F=null;if(w!==0){if(F=q.value,D!==!0||F===null){let O=z+w*4,R=V.matrixWorldInverse;if(H.getNormalMatrix(R),F===null||F.length<O)F=new Float32Array(O);for(let B=0,L=z;B!==w;++B,L+=4)X.copy(U[B]).applyMatrix4(R,H),X.normal.toArray(F,L),F[L+3]=X.constant}q.value=F,q.needsUpdate=!0}return $.numPlanes=w,$.numIntersection=0,F}}var u7=4,fz=[0.125,0.215,0.35,0.446,0.526,0.582],LJ=20,rM=256,B$=new KK,hz=new l0,AH=null,_H=0,CH=0,EH=!1,tM=new g;class SH{constructor(J){this._renderer=J,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(J,$=0,Q=0.1,Z=100,K={}){let{size:W=256,position:X=tM}=K;AH=this._renderer.getRenderTarget(),_H=this._renderer.getActiveCubeFace(),CH=this._renderer.getActiveMipmapLevel(),EH=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(W);let H=this._allocateTargets();if(H.depthBuffer=!0,this._sceneToCubeUV(J,Q,Z,H,X),$>0)this._blur(H,0,0,$);return this._applyPMREM(H),this._cleanup(H),H}fromEquirectangular(J,$=null){return this._fromTexture(J,$)}fromCubemap(J,$=null){return this._fromTexture(J,$)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=pz(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=gz(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._dispose(),this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._backgroundBox!==null)this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose()}_setSize(J){this._lodMax=Math.floor(Math.log2(J)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._pingPongRenderTarget!==null)this._pingPongRenderTarget.dispose();for(let J=0;J<this._lodMeshes.length;J++)this._lodMeshes[J].geometry.dispose()}_cleanup(J){this._renderer.setRenderTarget(AH,_H,CH),this._renderer.xr.enabled=EH,J.scissorTest=!1,M9(J,0,0,J.width,J.height)}_fromTexture(J,$){if(J.mapping===z9||J.mapping===NJ)this._setSize(J.image.length===0?16:J.image[0].width||J.image[0].image.width);else this._setSize(J.image.width/4);AH=this._renderer.getRenderTarget(),_H=this._renderer.getActiveCubeFace(),CH=this._renderer.getActiveMipmapLevel(),EH=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let Q=$||this._allocateTargets();return this._textureToCubeUV(J,Q),this._applyPMREM(Q),this._cleanup(Q),Q}_allocateTargets(){let J=3*Math.max(this._cubeSize,112),$=4*this._cubeSize,Q={magFilter:U6,minFilter:U6,generateMipmaps:!1,type:G7,format:$7,colorSpace:D$,depthBuffer:!1},Z=xz(J,$,Q);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==J||this._pingPongRenderTarget.height!==$){if(this._pingPongRenderTarget!==null)this._dispose();this._pingPongRenderTarget=xz(J,$,Q);let{_lodMax:K}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=eM(K)),this._blurMaterial=$G(K,J,$),this._ggxMaterial=JG(K,J,$)}return Z}_compileMaterial(J){let $=new u6(new M6,J);this._renderer.compile($,B$)}_sceneToCubeUV(J,$,Q,Z,K){let H=new t8(90,1,$,Q),q=[1,-1,1,1,1,1],Y=[1,1,1,-1,-1,-1],N=this._renderer,U=N.autoClear,V=N.toneMapping;if(N.getClearColor(hz),N.toneMapping=l6,N.autoClear=!1,N.state.buffers.depth.getReversed())N.setRenderTarget(Z),N.clearDepth(),N.setRenderTarget(null);if(this._backgroundBox===null)this._backgroundBox=new u6(new w9,new aZ({name:"PMREM.Background",side:N6,depthWrite:!1,depthTest:!1}));let D=this._backgroundBox,w=D.material,F=!1,O=J.background;if(O){if(O.isColor)w.color.copy(O),J.background=null,F=!0}else w.color.copy(hz),F=!0;for(let R=0;R<6;R++){let B=R%3;if(B===0)H.up.set(0,q[R],0),H.position.set(K.x,K.y,K.z),H.lookAt(K.x+Y[R],K.y,K.z);else if(B===1)H.up.set(0,0,q[R]),H.position.set(K.x,K.y,K.z),H.lookAt(K.x,K.y+Y[R],K.z);else H.up.set(0,q[R],0),H.position.set(K.x,K.y,K.z),H.lookAt(K.x,K.y,K.z+Y[R]);let L=this._cubeSize;if(M9(Z,B*L,R>2?L:0,L,L),N.setRenderTarget(Z),F)N.render(D,H);N.render(J,H)}N.toneMapping=V,N.autoClear=U,J.background=O}_textureToCubeUV(J,$){let Q=this._renderer,Z=J.mapping===z9||J.mapping===NJ;if(Z){if(this._cubemapMaterial===null)this._cubemapMaterial=pz();this._cubemapMaterial.uniforms.flipEnvMap.value=J.isRenderTargetTexture===!1?-1:1}else if(this._equirectMaterial===null)this._equirectMaterial=gz();let K=Z?this._cubemapMaterial:this._equirectMaterial,W=this._lodMeshes[0];W.material=K;let X=K.uniforms;X.envMap.value=J;let H=this._cubeSize;M9($,0,0,3*H,2*H),Q.setRenderTarget($),Q.render(W,B$)}_applyPMREM(J){let $=this._renderer,Q=$.autoClear;$.autoClear=!1;let Z=this._lodMeshes.length;for(let K=1;K<Z;K++)this._applyGGXFilter(J,K-1,K);$.autoClear=Q}_applyGGXFilter(J,$,Q){let Z=this._renderer,K=this._pingPongRenderTarget,W=this._ggxMaterial,X=this._lodMeshes[Q];X.material=W;let H=W.uniforms,q=Q/(this._lodMeshes.length-1),Y=$/(this._lodMeshes.length-1),N=Math.sqrt(q*q-Y*Y),U=0+q*1.25,V=N*U,{_lodMax:z}=this,D=this._sizeLods[Q],w=3*D*(Q>z-u7?Q-z+u7:0),F=4*(this._cubeSize-D);H.envMap.value=J.texture,H.roughness.value=V,H.mipInt.value=z-$,M9(K,w,F,3*D,2*D),Z.setRenderTarget(K),Z.render(X,B$),H.envMap.value=K.texture,H.roughness.value=0,H.mipInt.value=z-Q,M9(J,w,F,3*D,2*D),Z.setRenderTarget(J),Z.render(X,B$)}_blur(J,$,Q,Z,K){let W=this._pingPongRenderTarget;this._halfBlur(J,W,$,Q,Z,"latitudinal",K),this._halfBlur(W,J,Q,Q,Z,"longitudinal",K)}_halfBlur(J,$,Q,Z,K,W,X){let H=this._renderer,q=this._blurMaterial;if(W!=="latitudinal"&&W!=="longitudinal")y0("blur direction must be either latitudinal or longitudinal!");let Y=3,N=this._lodMeshes[Z];N.material=q;let U=q.uniforms,V=this._sizeLods[Q]-1,z=isFinite(K)?Math.PI/(2*V):2*Math.PI/(2*LJ-1),D=K/z,w=isFinite(K)?1+Math.floor(Y*D):LJ;if(w>LJ)b0(`sigmaRadians, ${K}, is too large and will clip, as it requested ${w} samples when the maximum is set to ${LJ}`);let F=[],O=0;for(let _=0;_<LJ;++_){let j=_/D,I=Math.exp(-j*j/2);if(F.push(I),_===0)O+=I;else if(_<w)O+=2*I}for(let _=0;_<F.length;_++)F[_]=F[_]/O;if(U.envMap.value=J.texture,U.samples.value=w,U.weights.value=F,U.latitudinal.value=W==="latitudinal",X)U.poleAxis.value=X;let{_lodMax:R}=this;U.dTheta.value=z,U.mipInt.value=R-Q;let B=this._sizeLods[Z],L=3*B*(Z>R-u7?Z-R+u7:0),y=4*(this._cubeSize-B);M9($,L,y,3*B,2*B),H.setRenderTarget($),H.render(N,B$)}}function eM(J){let $=[],Q=[],Z=[],K=J,W=J-u7+1+fz.length;for(let X=0;X<W;X++){let H=Math.pow(2,K);$.push(H);let q=1/H;if(X>J-u7)q=fz[X-J+u7-1];else if(X===0)q=0;Q.push(q);let Y=1/(H-2),N=-Y,U=1+Y,V=[N,N,U,N,U,U,N,N,U,U,N,U],z=6,D=6,w=3,F=2,O=1,R=new Float32Array(w*D*z),B=new Float32Array(F*D*z),L=new Float32Array(O*D*z);for(let _=0;_<z;_++){let j=_%3*2/3-1,I=_>2?0:-1,E=[j,I,0,j+0.6666666666666666,I,0,j+0.6666666666666666,I+1,0,j,I,0,j+0.6666666666666666,I+1,0,j,I+1,0];R.set(E,w*D*_),B.set(V,F*D*_);let u=[_,_,_,_,_,_];L.set(u,O*D*_)}let y=new M6;if(y.setAttribute("position",new K6(R,w)),y.setAttribute("uv",new K6(B,F)),y.setAttribute("faceIndex",new K6(L,O)),Z.push(new u6(y,null)),K>u7)K--}return{lodMeshes:Z,sizeLods:$,sigmas:Q}}function xz(J,$,Q){let Z=new j6(J,$,Q);return Z.texture.mapping=O$,Z.texture.name="PMREM.cubeUv",Z.scissorTest=!0,Z}function M9(J,$,Q,Z,K){J.viewport.set($,Q,Z,K),J.scissor.set($,Q,Z,K)}function JG(J,$,Q){return new S6({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:rM,CUBEUV_TEXEL_WIDTH:1/$,CUBEUV_TEXEL_HEIGHT:1/Q,CUBEUV_MAX_MIP:`${J}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:qK(),fragmentShader:`

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
		`,blending:J7,depthTest:!1,depthWrite:!1})}function $G(J,$,Q){let Z=new Float32Array(LJ),K=new g(0,1,0);return new S6({name:"SphericalGaussianBlur",defines:{n:LJ,CUBEUV_TEXEL_WIDTH:1/$,CUBEUV_TEXEL_HEIGHT:1/Q,CUBEUV_MAX_MIP:`${J}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:Z},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:K}},vertexShader:qK(),fragmentShader:`

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
		`,blending:J7,depthTest:!1,depthWrite:!1})}function gz(){return new S6({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:qK(),fragmentShader:`

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
		`,blending:J7,depthTest:!1,depthWrite:!1})}function pz(){return new S6({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:qK(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:J7,depthTest:!1,depthWrite:!1})}function qK(){return`

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
	`}class bH extends j6{constructor(J=1,$={}){super(J,J,$);this.isWebGLCubeRenderTarget=!0;let Q={width:J,height:J,depth:1},Z=[Q,Q,Q,Q,Q,Q];this.texture=new tZ(Z),this._setTextureOptions($),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(J,$){this.texture.type=$.type,this.texture.colorSpace=$.colorSpace,this.texture.generateMipmaps=$.generateMipmaps,this.texture.minFilter=$.minFilter,this.texture.magFilter=$.magFilter;let Q={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},Z=new w9(5,5,5),K=new S6({name:"CubemapFromEquirect",uniforms:kJ(Q.uniforms),vertexShader:Q.vertexShader,fragmentShader:Q.fragmentShader,side:N6,blending:J7});K.uniforms.tEquirect.value=$;let W=new u6(Z,K),X=$.minFilter;if($.minFilter===UJ)$.minFilter=U6;return new MH(1,10,this).update(J,W),$.minFilter=X,W.geometry.dispose(),W.material.dispose(),this}clear(J,$=!0,Q=!0,Z=!0){let K=J.getRenderTarget();for(let W=0;W<6;W++)J.setRenderTarget(this,W),J.clear($,Q,Z);J.setRenderTarget(K)}}function QG(J){let $=new WeakMap,Q=new WeakMap,Z=null;function K(V,z=!1){if(V===null||V===void 0)return null;if(z)return X(V);return W(V)}function W(V){if(V&&V.isTexture){let z=V.mapping;if(z===bZ||z===vZ)if($.has(V)){let D=$.get(V).texture;return H(D,V.mapping)}else{let D=V.image;if(D&&D.height>0){let w=new bH(D.height);return w.fromEquirectangularTexture(J,V),$.set(V,w),V.addEventListener("dispose",Y),H(w.texture,V.mapping)}else return null}}return V}function X(V){if(V&&V.isTexture){let z=V.mapping,D=z===bZ||z===vZ,w=z===z9||z===NJ;if(D||w){let F=Q.get(V),O=F!==void 0?F.texture.pmremVersion:0;if(V.isRenderTargetTexture&&V.pmremVersion!==O){if(Z===null)Z=new SH(J);return F=D?Z.fromEquirectangular(V,F):Z.fromCubemap(V,F),F.texture.pmremVersion=V.pmremVersion,Q.set(V,F),F.texture}else if(F!==void 0)return F.texture;else{let R=V.image;if(D&&R&&R.height>0||w&&R&&q(R)){if(Z===null)Z=new SH(J);return F=D?Z.fromEquirectangular(V):Z.fromCubemap(V),F.texture.pmremVersion=V.pmremVersion,Q.set(V,F),V.addEventListener("dispose",N),F.texture}else return null}}}return V}function H(V,z){if(z===bZ)V.mapping=z9;else if(z===vZ)V.mapping=NJ;return V}function q(V){let z=0,D=6;for(let w=0;w<D;w++)if(V[w]!==void 0)z++;return z===D}function Y(V){let z=V.target;z.removeEventListener("dispose",Y);let D=$.get(z);if(D!==void 0)$.delete(z),D.dispose()}function N(V){let z=V.target;z.removeEventListener("dispose",N);let D=Q.get(z);if(D!==void 0)Q.delete(z),D.dispose()}function U(){if($=new WeakMap,Q=new WeakMap,Z!==null)Z.dispose(),Z=null}return{get:K,dispose:U}}function ZG(J){let $={};function Q(Z){if($[Z]!==void 0)return $[Z];let K=J.getExtension(Z);return $[Z]=K,K}return{has:function(Z){return Q(Z)!==null},init:function(){Q("EXT_color_buffer_float"),Q("WEBGL_clip_cull_distance"),Q("OES_texture_float_linear"),Q("EXT_color_buffer_half_float"),Q("WEBGL_multisampled_render_to_texture"),Q("WEBGL_render_shared_exponent")},get:function(Z){let K=Q(Z);if(K===null)N$("WebGLRenderer: "+Z+" extension not supported.");return K}}}function KG(J,$,Q,Z){let K={},W=new WeakMap;function X(U){let V=U.target;if(V.index!==null)$.remove(V.index);for(let D in V.attributes)$.remove(V.attributes[D]);V.removeEventListener("dispose",X),delete K[V.id];let z=W.get(V);if(z)$.remove(z),W.delete(V);if(Z.releaseStatesOfGeometry(V),V.isInstancedBufferGeometry===!0)delete V._maxInstanceCount;Q.memory.geometries--}function H(U,V){if(K[V.id]===!0)return V;return V.addEventListener("dispose",X),K[V.id]=!0,Q.memory.geometries++,V}function q(U){let V=U.attributes;for(let z in V)$.update(V[z],J.ARRAY_BUFFER)}function Y(U){let V=[],z=U.index,D=U.attributes.position,w=0;if(D===void 0)return;if(z!==null){let R=z.array;w=z.version;for(let B=0,L=R.length;B<L;B+=3){let y=R[B+0],_=R[B+1],j=R[B+2];V.push(y,_,_,j,j,y)}}else{let R=D.array;w=D.version;for(let B=0,L=R.length/3-1;B<L;B+=3){let y=B+0,_=B+1,j=B+2;V.push(y,_,_,j,j,y)}}let F=new(D.count>=65535?iZ:nZ)(V,1);F.version=w;let O=W.get(U);if(O)$.remove(O);W.set(U,F)}function N(U){let V=W.get(U);if(V){let z=U.index;if(z!==null){if(V.version<z.version)Y(U)}}else Y(U);return W.get(U)}return{get:H,update:q,getWireframeAttribute:N}}function WG(J,$,Q){let Z;function K(V){Z=V}let W,X;function H(V){W=V.type,X=V.bytesPerElement}function q(V,z){J.drawElements(Z,z,W,V*X),Q.update(z,Z,1)}function Y(V,z,D){if(D===0)return;J.drawElementsInstanced(Z,z,W,V*X,D),Q.update(z,Z,D)}function N(V,z,D){if(D===0)return;$.get("WEBGL_multi_draw").multiDrawElementsWEBGL(Z,z,0,W,V,0,D);let F=0;for(let O=0;O<D;O++)F+=z[O];Q.update(F,Z,1)}function U(V,z,D,w){if(D===0)return;let F=$.get("WEBGL_multi_draw");if(F===null)for(let O=0;O<V.length;O++)Y(V[O]/X,z[O],w[O]);else{F.multiDrawElementsInstancedWEBGL(Z,z,0,W,V,0,w,0,D);let O=0;for(let R=0;R<D;R++)O+=z[R]*w[R];Q.update(O,Z,1)}}this.setMode=K,this.setIndex=H,this.render=q,this.renderInstances=Y,this.renderMultiDraw=N,this.renderMultiDrawInstances=U}function XG(J){let $={geometries:0,textures:0},Q={frame:0,calls:0,triangles:0,points:0,lines:0};function Z(W,X,H){switch(Q.calls++,X){case J.TRIANGLES:Q.triangles+=H*(W/3);break;case J.LINES:Q.lines+=H*(W/2);break;case J.LINE_STRIP:Q.lines+=H*(W-1);break;case J.LINE_LOOP:Q.lines+=H*W;break;case J.POINTS:Q.points+=H*W;break;default:y0("WebGLInfo: Unknown draw mode:",X);break}}function K(){Q.calls=0,Q.triangles=0,Q.points=0,Q.lines=0}return{memory:$,render:Q,programs:null,autoReset:!0,reset:K,update:Z}}function HG(J,$,Q){let Z=new WeakMap,K=new A8;function W(X,H,q){let Y=X.morphTargetInfluences,N=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,U=N!==void 0?N.length:0,V=Z.get(H);if(V===void 0||V.count!==U){let E=function(){j.dispose(),Z.delete(H),H.removeEventListener("dispose",E)};if(V!==void 0)V.texture.dispose();let z=H.morphAttributes.position!==void 0,D=H.morphAttributes.normal!==void 0,w=H.morphAttributes.color!==void 0,F=H.morphAttributes.position||[],O=H.morphAttributes.normal||[],R=H.morphAttributes.color||[],B=0;if(z===!0)B=1;if(D===!0)B=2;if(w===!0)B=3;let L=H.attributes.position.count*B,y=1;if(L>$.maxTextureSize)y=Math.ceil(L/$.maxTextureSize),L=$.maxTextureSize;let _=new Float32Array(L*y*4*U),j=new cZ(_,L,y,U);j.type=M7,j.needsUpdate=!0;let I=B*4;for(let u=0;u<U;u++){let C=F[u],p=O[u],n=R[u],f=L*y*4*u;for(let i=0;i<C.count;i++){let d=i*I;if(z===!0)K.fromBufferAttribute(C,i),_[f+d+0]=K.x,_[f+d+1]=K.y,_[f+d+2]=K.z,_[f+d+3]=0;if(D===!0)K.fromBufferAttribute(p,i),_[f+d+4]=K.x,_[f+d+5]=K.y,_[f+d+6]=K.z,_[f+d+7]=0;if(w===!0)K.fromBufferAttribute(n,i),_[f+d+8]=K.x,_[f+d+9]=K.y,_[f+d+10]=K.z,_[f+d+11]=n.itemSize===4?K.w:1}}V={count:U,texture:j,size:new Q8(L,y)},Z.set(H,V),H.addEventListener("dispose",E)}if(X.isInstancedMesh===!0&&X.morphTexture!==null)q.getUniforms().setValue(J,"morphTexture",X.morphTexture,Q);else{let z=0;for(let w=0;w<Y.length;w++)z+=Y[w];let D=H.morphTargetsRelative?1:1-z;q.getUniforms().setValue(J,"morphTargetBaseInfluence",D),q.getUniforms().setValue(J,"morphTargetInfluences",Y)}q.getUniforms().setValue(J,"morphTargetsTexture",V.texture,Q),q.getUniforms().setValue(J,"morphTargetsTextureSize",V.size)}return{update:W}}function qG(J,$,Q,Z,K){let W=new WeakMap;function X(Y){let N=K.render.frame,U=Y.geometry,V=$.get(Y,U);if(W.get(V)!==N)$.update(V),W.set(V,N);if(Y.isInstancedMesh){if(Y.hasEventListener("dispose",q)===!1)Y.addEventListener("dispose",q);if(W.get(Y)!==N){if(Q.update(Y.instanceMatrix,J.ARRAY_BUFFER),Y.instanceColor!==null)Q.update(Y.instanceColor,J.ARRAY_BUFFER);W.set(Y,N)}}if(Y.isSkinnedMesh){let z=Y.skeleton;if(W.get(z)!==N)z.update(),W.set(z,N)}return V}function H(){W=new WeakMap}function q(Y){let N=Y.target;if(N.removeEventListener("dispose",q),Z.releaseStatesOfObject(N),Q.remove(N.instanceMatrix),N.instanceColor!==null)Q.remove(N.instanceColor)}return{update:X,dispose:H}}var YG={[XX]:"LINEAR_TONE_MAPPING",[HX]:"REINHARD_TONE_MAPPING",[qX]:"CINEON_TONE_MAPPING",[YX]:"ACES_FILMIC_TONE_MAPPING",[UX]:"AGX_TONE_MAPPING",[VX]:"NEUTRAL_TONE_MAPPING",[NX]:"CUSTOM_TONE_MAPPING"};function NG(J,$,Q,Z,K){let W=new j6($,Q,{type:J,depthBuffer:Z,stencilBuffer:K}),X=new j6($,Q,{type:G7,depthBuffer:!1,stencilBuffer:!1}),H=new M6;H.setAttribute("position",new d6([-1,3,0,-1,-1,0,3,-1,0],3)),H.setAttribute("uv",new d6([0,2,0,0,2,0],2));let q=new HH({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),Y=new u6(H,q),N=new KK(-1,1,1,-1,0,1),U=null,V=null,z=!1,D,w=null,F=[],O=!1;this.setSize=function(R,B){W.setSize(R,B),X.setSize(R,B);for(let L=0;L<F.length;L++){let y=F[L];if(y.setSize)y.setSize(R,B)}},this.setEffects=function(R){F=R,O=F.length>0&&F[0].isRenderPass===!0;let{width:B,height:L}=W;for(let y=0;y<F.length;y++){let _=F[y];if(_.setSize)_.setSize(B,L)}},this.begin=function(R,B){if(z)return!1;if(R.toneMapping===l6&&F.length===0)return!1;if(w=B,B!==null){let{width:L,height:y}=B;if(W.width!==L||W.height!==y)this.setSize(L,y)}if(O===!1)R.setRenderTarget(W);return D=R.toneMapping,R.toneMapping=l6,!0},this.hasRenderPass=function(){return O},this.end=function(R,B){R.toneMapping=D,z=!0;let L=W,y=X;for(let _=0;_<F.length;_++){let j=F[_];if(j.enabled===!1)continue;if(j.render(R,y,L,B),j.needsSwap!==!1){let I=L;L=y,y=I}}if(U!==R.outputColorSpace||V!==R.toneMapping){if(U=R.outputColorSpace,V=R.toneMapping,q.defines={},a0.getTransfer(U)===z8)q.defines.SRGB_TRANSFER="";let _=YG[V];if(_)q.defines[_]="";q.needsUpdate=!0}q.uniforms.tDiffuse.value=L.texture,R.setRenderTarget(w),R.render(Y,N),w=null,z=!1},this.isCompositing=function(){return z},this.dispose=function(){W.dispose(),X.dispose(),H.dispose(),q.dispose()}}var WD=new e8,TH=new DJ(1,1),XD=new cZ,HD=new ZH,qD=new tZ,mz=[],dz=[],lz=new Float32Array(16),cz=new Float32Array(9),uz=new Float32Array(4);function G9(J,$,Q){let Z=J[0];if(Z<=0||Z>0)return J;let K=$*Q,W=mz[K];if(W===void 0)W=new Float32Array(K),mz[K]=W;if($!==0){Z.toArray(W,0);for(let X=1,H=0;X!==$;++X)H+=Q,J[X].toArray(W,H)}return W}function b8(J,$){if(J.length!==$.length)return!1;for(let Q=0,Z=J.length;Q<Z;Q++)if(J[Q]!==$[Q])return!1;return!0}function v8(J,$){for(let Q=0,Z=$.length;Q<Z;Q++)J[Q]=$[Q]}function YK(J,$){let Q=dz[$];if(Q===void 0)Q=new Int32Array($),dz[$]=Q;for(let Z=0;Z!==$;++Z)Q[Z]=J.allocateTextureUnit();return Q}function UG(J,$){let Q=this.cache;if(Q[0]===$)return;J.uniform1f(this.addr,$),Q[0]=$}function VG(J,$){let Q=this.cache;if($.x!==void 0){if(Q[0]!==$.x||Q[1]!==$.y)J.uniform2f(this.addr,$.x,$.y),Q[0]=$.x,Q[1]=$.y}else{if(b8(Q,$))return;J.uniform2fv(this.addr,$),v8(Q,$)}}function OG(J,$){let Q=this.cache;if($.x!==void 0){if(Q[0]!==$.x||Q[1]!==$.y||Q[2]!==$.z)J.uniform3f(this.addr,$.x,$.y,$.z),Q[0]=$.x,Q[1]=$.y,Q[2]=$.z}else if($.r!==void 0){if(Q[0]!==$.r||Q[1]!==$.g||Q[2]!==$.b)J.uniform3f(this.addr,$.r,$.g,$.b),Q[0]=$.r,Q[1]=$.g,Q[2]=$.b}else{if(b8(Q,$))return;J.uniform3fv(this.addr,$),v8(Q,$)}}function FG(J,$){let Q=this.cache;if($.x!==void 0){if(Q[0]!==$.x||Q[1]!==$.y||Q[2]!==$.z||Q[3]!==$.w)J.uniform4f(this.addr,$.x,$.y,$.z,$.w),Q[0]=$.x,Q[1]=$.y,Q[2]=$.z,Q[3]=$.w}else{if(b8(Q,$))return;J.uniform4fv(this.addr,$),v8(Q,$)}}function zG(J,$){let Q=this.cache,Z=$.elements;if(Z===void 0){if(b8(Q,$))return;J.uniformMatrix2fv(this.addr,!1,$),v8(Q,$)}else{if(b8(Q,Z))return;uz.set(Z),J.uniformMatrix2fv(this.addr,!1,uz),v8(Q,Z)}}function DG(J,$){let Q=this.cache,Z=$.elements;if(Z===void 0){if(b8(Q,$))return;J.uniformMatrix3fv(this.addr,!1,$),v8(Q,$)}else{if(b8(Q,Z))return;cz.set(Z),J.uniformMatrix3fv(this.addr,!1,cz),v8(Q,Z)}}function kG(J,$){let Q=this.cache,Z=$.elements;if(Z===void 0){if(b8(Q,$))return;J.uniformMatrix4fv(this.addr,!1,$),v8(Q,$)}else{if(b8(Q,Z))return;lz.set(Z),J.uniformMatrix4fv(this.addr,!1,lz),v8(Q,Z)}}function IG(J,$){let Q=this.cache;if(Q[0]===$)return;J.uniform1i(this.addr,$),Q[0]=$}function wG(J,$){let Q=this.cache;if($.x!==void 0){if(Q[0]!==$.x||Q[1]!==$.y)J.uniform2i(this.addr,$.x,$.y),Q[0]=$.x,Q[1]=$.y}else{if(b8(Q,$))return;J.uniform2iv(this.addr,$),v8(Q,$)}}function MG(J,$){let Q=this.cache;if($.x!==void 0){if(Q[0]!==$.x||Q[1]!==$.y||Q[2]!==$.z)J.uniform3i(this.addr,$.x,$.y,$.z),Q[0]=$.x,Q[1]=$.y,Q[2]=$.z}else{if(b8(Q,$))return;J.uniform3iv(this.addr,$),v8(Q,$)}}function GG(J,$){let Q=this.cache;if($.x!==void 0){if(Q[0]!==$.x||Q[1]!==$.y||Q[2]!==$.z||Q[3]!==$.w)J.uniform4i(this.addr,$.x,$.y,$.z,$.w),Q[0]=$.x,Q[1]=$.y,Q[2]=$.z,Q[3]=$.w}else{if(b8(Q,$))return;J.uniform4iv(this.addr,$),v8(Q,$)}}function RG(J,$){let Q=this.cache;if(Q[0]===$)return;J.uniform1ui(this.addr,$),Q[0]=$}function LG(J,$){let Q=this.cache;if($.x!==void 0){if(Q[0]!==$.x||Q[1]!==$.y)J.uniform2ui(this.addr,$.x,$.y),Q[0]=$.x,Q[1]=$.y}else{if(b8(Q,$))return;J.uniform2uiv(this.addr,$),v8(Q,$)}}function BG(J,$){let Q=this.cache;if($.x!==void 0){if(Q[0]!==$.x||Q[1]!==$.y||Q[2]!==$.z)J.uniform3ui(this.addr,$.x,$.y,$.z),Q[0]=$.x,Q[1]=$.y,Q[2]=$.z}else{if(b8(Q,$))return;J.uniform3uiv(this.addr,$),v8(Q,$)}}function AG(J,$){let Q=this.cache;if($.x!==void 0){if(Q[0]!==$.x||Q[1]!==$.y||Q[2]!==$.z||Q[3]!==$.w)J.uniform4ui(this.addr,$.x,$.y,$.z,$.w),Q[0]=$.x,Q[1]=$.y,Q[2]=$.z,Q[3]=$.w}else{if(b8(Q,$))return;J.uniform4uiv(this.addr,$),v8(Q,$)}}function _G(J,$,Q){let Z=this.cache,K=Q.allocateTextureUnit();if(Z[0]!==K)J.uniform1i(this.addr,K),Z[0]=K;let W;if(this.type===J.SAMPLER_2D_SHADOW)TH.compareFunction=Q.isReversedDepthBuffer()?lZ:dZ,W=TH;else W=WD;Q.setTexture2D($||W,K)}function CG(J,$,Q){let Z=this.cache,K=Q.allocateTextureUnit();if(Z[0]!==K)J.uniform1i(this.addr,K),Z[0]=K;Q.setTexture3D($||HD,K)}function EG(J,$,Q){let Z=this.cache,K=Q.allocateTextureUnit();if(Z[0]!==K)J.uniform1i(this.addr,K),Z[0]=K;Q.setTextureCube($||qD,K)}function PG(J,$,Q){let Z=this.cache,K=Q.allocateTextureUnit();if(Z[0]!==K)J.uniform1i(this.addr,K),Z[0]=K;Q.setTexture2DArray($||XD,K)}function jG(J){switch(J){case 5126:return UG;case 35664:return VG;case 35665:return OG;case 35666:return FG;case 35674:return zG;case 35675:return DG;case 35676:return kG;case 5124:case 35670:return IG;case 35667:case 35671:return wG;case 35668:case 35672:return MG;case 35669:case 35673:return GG;case 5125:return RG;case 36294:return LG;case 36295:return BG;case 36296:return AG;case 35678:case 36198:case 36298:case 36306:case 35682:return _G;case 35679:case 36299:case 36307:return CG;case 35680:case 36300:case 36308:case 36293:return EG;case 36289:case 36303:case 36311:case 36292:return PG}}function SG(J,$){J.uniform1fv(this.addr,$)}function TG(J,$){let Q=G9($,this.size,2);J.uniform2fv(this.addr,Q)}function yG(J,$){let Q=G9($,this.size,3);J.uniform3fv(this.addr,Q)}function bG(J,$){let Q=G9($,this.size,4);J.uniform4fv(this.addr,Q)}function vG(J,$){let Q=G9($,this.size,4);J.uniformMatrix2fv(this.addr,!1,Q)}function fG(J,$){let Q=G9($,this.size,9);J.uniformMatrix3fv(this.addr,!1,Q)}function hG(J,$){let Q=G9($,this.size,16);J.uniformMatrix4fv(this.addr,!1,Q)}function xG(J,$){J.uniform1iv(this.addr,$)}function gG(J,$){J.uniform2iv(this.addr,$)}function pG(J,$){J.uniform3iv(this.addr,$)}function mG(J,$){J.uniform4iv(this.addr,$)}function dG(J,$){J.uniform1uiv(this.addr,$)}function lG(J,$){J.uniform2uiv(this.addr,$)}function cG(J,$){J.uniform3uiv(this.addr,$)}function uG(J,$){J.uniform4uiv(this.addr,$)}function sG(J,$,Q){let Z=this.cache,K=$.length,W=YK(Q,K);if(!b8(Z,W))J.uniform1iv(this.addr,W),v8(Z,W);let X;if(this.type===J.SAMPLER_2D_SHADOW)X=TH;else X=WD;for(let H=0;H!==K;++H)Q.setTexture2D($[H]||X,W[H])}function nG(J,$,Q){let Z=this.cache,K=$.length,W=YK(Q,K);if(!b8(Z,W))J.uniform1iv(this.addr,W),v8(Z,W);for(let X=0;X!==K;++X)Q.setTexture3D($[X]||HD,W[X])}function iG(J,$,Q){let Z=this.cache,K=$.length,W=YK(Q,K);if(!b8(Z,W))J.uniform1iv(this.addr,W),v8(Z,W);for(let X=0;X!==K;++X)Q.setTextureCube($[X]||qD,W[X])}function oG(J,$,Q){let Z=this.cache,K=$.length,W=YK(Q,K);if(!b8(Z,W))J.uniform1iv(this.addr,W),v8(Z,W);for(let X=0;X!==K;++X)Q.setTexture2DArray($[X]||XD,W[X])}function aG(J){switch(J){case 5126:return SG;case 35664:return TG;case 35665:return yG;case 35666:return bG;case 35674:return vG;case 35675:return fG;case 35676:return hG;case 5124:case 35670:return xG;case 35667:case 35671:return gG;case 35668:case 35672:return pG;case 35669:case 35673:return mG;case 5125:return dG;case 36294:return lG;case 36295:return cG;case 36296:return uG;case 35678:case 36198:case 36298:case 36306:case 35682:return sG;case 35679:case 36299:case 36307:return nG;case 35680:case 36300:case 36308:case 36293:return iG;case 36289:case 36303:case 36311:case 36292:return oG}}class YD{constructor(J,$,Q){this.id=J,this.addr=Q,this.cache=[],this.type=$.type,this.setValue=jG($.type)}}class ND{constructor(J,$,Q){this.id=J,this.addr=Q,this.cache=[],this.type=$.type,this.size=$.size,this.setValue=aG($.type)}}class UD{constructor(J){this.id=J,this.seq=[],this.map={}}setValue(J,$,Q){let Z=this.seq;for(let K=0,W=Z.length;K!==W;++K){let X=Z[K];X.setValue(J,$[X.id],Q)}}}var PH=/(\w+)(\])?(\[|\.)?/g;function sz(J,$){J.seq.push($),J.map[$.id]=$}function rG(J,$,Q){let Z=J.name,K=Z.length;PH.lastIndex=0;while(!0){let W=PH.exec(Z),X=PH.lastIndex,H=W[1],q=W[2]==="]",Y=W[3];if(q)H=H|0;if(Y===void 0||Y==="["&&X+2===K){sz(Q,Y===void 0?new YD(H,J,$):new ND(H,J,$));break}else{let U=Q.map[H];if(U===void 0)U=new UD(H),sz(Q,U);Q=U}}}class C${constructor(J,$){this.seq=[],this.map={};let Q=J.getProgramParameter($,J.ACTIVE_UNIFORMS);for(let W=0;W<Q;++W){let X=J.getActiveUniform($,W),H=J.getUniformLocation($,X.name);rG(X,H,this)}let Z=[],K=[];for(let W of this.seq)if(W.type===J.SAMPLER_2D_SHADOW||W.type===J.SAMPLER_CUBE_SHADOW||W.type===J.SAMPLER_2D_ARRAY_SHADOW)Z.push(W);else K.push(W);if(Z.length>0)this.seq=Z.concat(K)}setValue(J,$,Q,Z){let K=this.map[$];if(K!==void 0)K.setValue(J,Q,Z)}setOptional(J,$,Q){let Z=$[Q];if(Z!==void 0)this.setValue(J,Q,Z)}static upload(J,$,Q,Z){for(let K=0,W=$.length;K!==W;++K){let X=$[K],H=Q[X.id];if(H.needsUpdate!==!1)X.setValue(J,H.value,Z)}}static seqWithValue(J,$){let Q=[];for(let Z=0,K=J.length;Z!==K;++Z){let W=J[Z];if(W.id in $)Q.push(W)}return Q}}function nz(J,$,Q){let Z=J.createShader($);return J.shaderSource(Z,Q),J.compileShader(Z),Z}var tG=37297,eG=0;function JR(J,$){let Q=J.split(`
`),Z=[],K=Math.max($-6,0),W=Math.min($+6,Q.length);for(let X=K;X<W;X++){let H=X+1;Z.push(`${H===$?">":" "} ${H}: ${Q[X]}`)}return Z.join(`
`)}var iz=new x0;function $R(J){a0._getMatrix(iz,a0.workingColorSpace,J);let $=`mat3( ${iz.elements.map((Q)=>Q.toFixed(4))} )`;switch(a0.getTransfer(J)){case rX:return[$,"LinearTransferOETF"];case z8:return[$,"sRGBTransferOETF"];default:return b0("WebGLProgram: Unsupported color space: ",J),[$,"LinearTransferOETF"]}}function oz(J,$,Q){let Z=J.getShaderParameter($,J.COMPILE_STATUS),W=(J.getShaderInfoLog($)||"").trim();if(Z&&W==="")return"";let X=/ERROR: 0:(\d+)/.exec(W);if(X){let H=parseInt(X[1]);return Q.toUpperCase()+`

`+W+`

`+JR(J.getShaderSource($),H)}else return W}function QR(J,$){let Q=$R($);return[`vec4 ${J}( vec4 value ) {`,`	return ${Q[1]}( vec4( value.rgb * ${Q[0]}, value.a ) );`,"}"].join(`
`)}var ZR={[XX]:"Linear",[HX]:"Reinhard",[qX]:"Cineon",[YX]:"ACESFilmic",[UX]:"AgX",[VX]:"Neutral",[NX]:"Custom"};function KR(J,$){let Q=ZR[$];if(Q===void 0)return b0("WebGLProgram: Unsupported toneMapping:",$),"vec3 "+J+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+J+"( vec3 color ) { return "+Q+"ToneMapping( color ); }"}var HK=new g;function WR(){a0.getLuminanceCoefficients(HK);let J=HK.x.toFixed(4),$=HK.y.toFixed(4),Q=HK.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${J}, ${$}, ${Q} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function XR(J){return[J.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",J.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(_$).join(`
`)}function HR(J){let $=[];for(let Q in J){let Z=J[Q];if(Z===!1)continue;$.push("#define "+Q+" "+Z)}return $.join(`
`)}function qR(J,$){let Q={},Z=J.getProgramParameter($,J.ACTIVE_ATTRIBUTES);for(let K=0;K<Z;K++){let W=J.getActiveAttrib($,K),X=W.name,H=1;if(W.type===J.FLOAT_MAT2)H=2;if(W.type===J.FLOAT_MAT3)H=3;if(W.type===J.FLOAT_MAT4)H=4;Q[X]={type:W.type,location:J.getAttribLocation($,X),locationSize:H}}return Q}function _$(J){return J!==""}function az(J,$){let Q=$.numSpotLightShadows+$.numSpotLightMaps-$.numSpotLightShadowsWithMaps;return J.replace(/NUM_DIR_LIGHTS/g,$.numDirLights).replace(/NUM_SPOT_LIGHTS/g,$.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,$.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,Q).replace(/NUM_RECT_AREA_LIGHTS/g,$.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,$.numPointLights).replace(/NUM_HEMI_LIGHTS/g,$.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,$.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,$.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,$.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,$.numPointLightShadows)}function rz(J,$){return J.replace(/NUM_CLIPPING_PLANES/g,$.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,$.numClippingPlanes-$.numClipIntersection)}var YR=/^[ \t]*#include +<([\w\d./]+)>/gm;function yH(J){return J.replace(YR,UR)}var NR=new Map;function UR(J,$){let Q=g0[$];if(Q===void 0){let Z=NR.get($);if(Z!==void 0)Q=g0[Z],b0('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',$,Z);else throw Error("Can not resolve #include <"+$+">")}return yH(Q)}var VR=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function tz(J){return J.replace(VR,OR)}function OR(J,$,Q,Z){let K="";for(let W=parseInt($);W<parseInt(Q);W++)K+=Z.replace(/\[\s*i\s*\]/g,"[ "+W+" ]").replace(/UNROLLED_LOOP_INDEX/g,W);return K}function ez(J){let $=`precision ${J.precision} float;
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
	`;if(J.precision==="highp")$+=`
#define HIGH_PRECISION`;else if(J.precision==="mediump")$+=`
#define MEDIUM_PRECISION`;else if(J.precision==="lowp")$+=`
#define LOW_PRECISION`;return $}var FR={[U$]:"SHADOWMAP_TYPE_PCF",[V9]:"SHADOWMAP_TYPE_VSM"};function zR(J){return FR[J.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var DR={[z9]:"ENVMAP_TYPE_CUBE",[NJ]:"ENVMAP_TYPE_CUBE",[O$]:"ENVMAP_TYPE_CUBE_UV"};function kR(J){if(J.envMap===!1)return"ENVMAP_TYPE_CUBE";return DR[J.envMapMode]||"ENVMAP_TYPE_CUBE"}var IR={[NJ]:"ENVMAP_MODE_REFRACTION"};function wR(J){if(J.envMap===!1)return"ENVMAP_MODE_REFLECTION";return IR[J.envMapMode]||"ENVMAP_MODE_REFLECTION"}var MR={[Kz]:"ENVMAP_BLENDING_MULTIPLY",[Wz]:"ENVMAP_BLENDING_MIX",[Xz]:"ENVMAP_BLENDING_ADD"};function GR(J){if(J.envMap===!1)return"ENVMAP_BLENDING_NONE";return MR[J.combine]||"ENVMAP_BLENDING_NONE"}function RR(J){let $=J.envMapCubeUVHeight;if($===null)return null;let Q=Math.log2($)-2,Z=1/$;return{texelWidth:1/(3*Math.max(Math.pow(2,Q),112)),texelHeight:Z,maxMip:Q}}function LR(J,$,Q,Z){let K=J.getContext(),W=Q.defines,X=Q.vertexShader,H=Q.fragmentShader,q=zR(Q),Y=kR(Q),N=wR(Q),U=GR(Q),V=RR(Q),z=XR(Q),D=HR(W),w=K.createProgram(),F,O,R=Q.glslVersion?"#version "+Q.glslVersion+`
`:"";if(Q.isRawShaderMaterial){if(F=["#define SHADER_TYPE "+Q.shaderType,"#define SHADER_NAME "+Q.shaderName,D].filter(_$).join(`
`),F.length>0)F+=`
`;if(O=["#define SHADER_TYPE "+Q.shaderType,"#define SHADER_NAME "+Q.shaderName,D].filter(_$).join(`
`),O.length>0)O+=`
`}else F=[ez(Q),"#define SHADER_TYPE "+Q.shaderType,"#define SHADER_NAME "+Q.shaderName,D,Q.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",Q.batching?"#define USE_BATCHING":"",Q.batchingColor?"#define USE_BATCHING_COLOR":"",Q.instancing?"#define USE_INSTANCING":"",Q.instancingColor?"#define USE_INSTANCING_COLOR":"",Q.instancingMorph?"#define USE_INSTANCING_MORPH":"",Q.useFog&&Q.fog?"#define USE_FOG":"",Q.useFog&&Q.fogExp2?"#define FOG_EXP2":"",Q.map?"#define USE_MAP":"",Q.envMap?"#define USE_ENVMAP":"",Q.envMap?"#define "+N:"",Q.lightMap?"#define USE_LIGHTMAP":"",Q.aoMap?"#define USE_AOMAP":"",Q.bumpMap?"#define USE_BUMPMAP":"",Q.normalMap?"#define USE_NORMALMAP":"",Q.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",Q.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",Q.displacementMap?"#define USE_DISPLACEMENTMAP":"",Q.emissiveMap?"#define USE_EMISSIVEMAP":"",Q.anisotropy?"#define USE_ANISOTROPY":"",Q.anisotropyMap?"#define USE_ANISOTROPYMAP":"",Q.clearcoatMap?"#define USE_CLEARCOATMAP":"",Q.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",Q.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",Q.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",Q.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",Q.specularMap?"#define USE_SPECULARMAP":"",Q.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",Q.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",Q.roughnessMap?"#define USE_ROUGHNESSMAP":"",Q.metalnessMap?"#define USE_METALNESSMAP":"",Q.alphaMap?"#define USE_ALPHAMAP":"",Q.alphaHash?"#define USE_ALPHAHASH":"",Q.transmission?"#define USE_TRANSMISSION":"",Q.transmissionMap?"#define USE_TRANSMISSIONMAP":"",Q.thicknessMap?"#define USE_THICKNESSMAP":"",Q.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",Q.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",Q.mapUv?"#define MAP_UV "+Q.mapUv:"",Q.alphaMapUv?"#define ALPHAMAP_UV "+Q.alphaMapUv:"",Q.lightMapUv?"#define LIGHTMAP_UV "+Q.lightMapUv:"",Q.aoMapUv?"#define AOMAP_UV "+Q.aoMapUv:"",Q.emissiveMapUv?"#define EMISSIVEMAP_UV "+Q.emissiveMapUv:"",Q.bumpMapUv?"#define BUMPMAP_UV "+Q.bumpMapUv:"",Q.normalMapUv?"#define NORMALMAP_UV "+Q.normalMapUv:"",Q.displacementMapUv?"#define DISPLACEMENTMAP_UV "+Q.displacementMapUv:"",Q.metalnessMapUv?"#define METALNESSMAP_UV "+Q.metalnessMapUv:"",Q.roughnessMapUv?"#define ROUGHNESSMAP_UV "+Q.roughnessMapUv:"",Q.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+Q.anisotropyMapUv:"",Q.clearcoatMapUv?"#define CLEARCOATMAP_UV "+Q.clearcoatMapUv:"",Q.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+Q.clearcoatNormalMapUv:"",Q.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+Q.clearcoatRoughnessMapUv:"",Q.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+Q.iridescenceMapUv:"",Q.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+Q.iridescenceThicknessMapUv:"",Q.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+Q.sheenColorMapUv:"",Q.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+Q.sheenRoughnessMapUv:"",Q.specularMapUv?"#define SPECULARMAP_UV "+Q.specularMapUv:"",Q.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+Q.specularColorMapUv:"",Q.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+Q.specularIntensityMapUv:"",Q.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+Q.transmissionMapUv:"",Q.thicknessMapUv?"#define THICKNESSMAP_UV "+Q.thicknessMapUv:"",Q.vertexTangents&&Q.flatShading===!1?"#define USE_TANGENT":"",Q.vertexColors?"#define USE_COLOR":"",Q.vertexAlphas?"#define USE_COLOR_ALPHA":"",Q.vertexUv1s?"#define USE_UV1":"",Q.vertexUv2s?"#define USE_UV2":"",Q.vertexUv3s?"#define USE_UV3":"",Q.pointsUvs?"#define USE_POINTS_UV":"",Q.flatShading?"#define FLAT_SHADED":"",Q.skinning?"#define USE_SKINNING":"",Q.morphTargets?"#define USE_MORPHTARGETS":"",Q.morphNormals&&Q.flatShading===!1?"#define USE_MORPHNORMALS":"",Q.morphColors?"#define USE_MORPHCOLORS":"",Q.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+Q.morphTextureStride:"",Q.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+Q.morphTargetsCount:"",Q.doubleSided?"#define DOUBLE_SIDED":"",Q.flipSided?"#define FLIP_SIDED":"",Q.shadowMapEnabled?"#define USE_SHADOWMAP":"",Q.shadowMapEnabled?"#define "+q:"",Q.sizeAttenuation?"#define USE_SIZEATTENUATION":"",Q.numLightProbes>0?"#define USE_LIGHT_PROBES":"",Q.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",Q.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(_$).join(`
`),O=[ez(Q),"#define SHADER_TYPE "+Q.shaderType,"#define SHADER_NAME "+Q.shaderName,D,Q.useFog&&Q.fog?"#define USE_FOG":"",Q.useFog&&Q.fogExp2?"#define FOG_EXP2":"",Q.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",Q.map?"#define USE_MAP":"",Q.matcap?"#define USE_MATCAP":"",Q.envMap?"#define USE_ENVMAP":"",Q.envMap?"#define "+Y:"",Q.envMap?"#define "+N:"",Q.envMap?"#define "+U:"",V?"#define CUBEUV_TEXEL_WIDTH "+V.texelWidth:"",V?"#define CUBEUV_TEXEL_HEIGHT "+V.texelHeight:"",V?"#define CUBEUV_MAX_MIP "+V.maxMip+".0":"",Q.lightMap?"#define USE_LIGHTMAP":"",Q.aoMap?"#define USE_AOMAP":"",Q.bumpMap?"#define USE_BUMPMAP":"",Q.normalMap?"#define USE_NORMALMAP":"",Q.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",Q.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",Q.emissiveMap?"#define USE_EMISSIVEMAP":"",Q.anisotropy?"#define USE_ANISOTROPY":"",Q.anisotropyMap?"#define USE_ANISOTROPYMAP":"",Q.clearcoat?"#define USE_CLEARCOAT":"",Q.clearcoatMap?"#define USE_CLEARCOATMAP":"",Q.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",Q.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",Q.dispersion?"#define USE_DISPERSION":"",Q.iridescence?"#define USE_IRIDESCENCE":"",Q.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",Q.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",Q.specularMap?"#define USE_SPECULARMAP":"",Q.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",Q.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",Q.roughnessMap?"#define USE_ROUGHNESSMAP":"",Q.metalnessMap?"#define USE_METALNESSMAP":"",Q.alphaMap?"#define USE_ALPHAMAP":"",Q.alphaTest?"#define USE_ALPHATEST":"",Q.alphaHash?"#define USE_ALPHAHASH":"",Q.sheen?"#define USE_SHEEN":"",Q.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",Q.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",Q.transmission?"#define USE_TRANSMISSION":"",Q.transmissionMap?"#define USE_TRANSMISSIONMAP":"",Q.thicknessMap?"#define USE_THICKNESSMAP":"",Q.vertexTangents&&Q.flatShading===!1?"#define USE_TANGENT":"",Q.vertexColors||Q.instancingColor?"#define USE_COLOR":"",Q.vertexAlphas||Q.batchingColor?"#define USE_COLOR_ALPHA":"",Q.vertexUv1s?"#define USE_UV1":"",Q.vertexUv2s?"#define USE_UV2":"",Q.vertexUv3s?"#define USE_UV3":"",Q.pointsUvs?"#define USE_POINTS_UV":"",Q.gradientMap?"#define USE_GRADIENTMAP":"",Q.flatShading?"#define FLAT_SHADED":"",Q.doubleSided?"#define DOUBLE_SIDED":"",Q.flipSided?"#define FLIP_SIDED":"",Q.shadowMapEnabled?"#define USE_SHADOWMAP":"",Q.shadowMapEnabled?"#define "+q:"",Q.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",Q.numLightProbes>0?"#define USE_LIGHT_PROBES":"",Q.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",Q.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",Q.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",Q.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",Q.toneMapping!==l6?"#define TONE_MAPPING":"",Q.toneMapping!==l6?g0.tonemapping_pars_fragment:"",Q.toneMapping!==l6?KR("toneMapping",Q.toneMapping):"",Q.dithering?"#define DITHERING":"",Q.opaque?"#define OPAQUE":"",g0.colorspace_pars_fragment,QR("linearToOutputTexel",Q.outputColorSpace),WR(),Q.useDepthPacking?"#define DEPTH_PACKING "+Q.depthPacking:"",`
`].filter(_$).join(`
`);if(X=yH(X),X=az(X,Q),X=rz(X,Q),H=yH(H),H=az(H,Q),H=rz(H,Q),X=tz(X),H=tz(H),Q.isRawShaderMaterial!==!0)R=`#version 300 es
`,F=[z,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+F,O=["#define varying in",Q.glslVersion===tX?"":"layout(location = 0) out highp vec4 pc_fragColor;",Q.glslVersion===tX?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+O;let B=R+F+X,L=R+O+H,y=nz(K,K.VERTEX_SHADER,B),_=nz(K,K.FRAGMENT_SHADER,L);if(K.attachShader(w,y),K.attachShader(w,_),Q.index0AttributeName!==void 0)K.bindAttribLocation(w,0,Q.index0AttributeName);else if(Q.morphTargets===!0)K.bindAttribLocation(w,0,"position");K.linkProgram(w);function j(C){if(J.debug.checkShaderErrors){let p=K.getProgramInfoLog(w)||"",n=K.getShaderInfoLog(y)||"",f=K.getShaderInfoLog(_)||"",i=p.trim(),d=n.trim(),m=f.trim(),J0=!0,$0=!0;if(K.getProgramParameter(w,K.LINK_STATUS)===!1)if(J0=!1,typeof J.debug.onShaderError==="function")J.debug.onShaderError(K,w,y,_);else{let U0=oz(K,y,"vertex"),C0=oz(K,_,"fragment");y0("THREE.WebGLProgram: Shader Error "+K.getError()+" - VALIDATE_STATUS "+K.getProgramParameter(w,K.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+i+`
`+U0+`
`+C0)}else if(i!=="")b0("WebGLProgram: Program Info Log:",i);else if(d===""||m==="")$0=!1;if($0)C.diagnostics={runnable:J0,programLog:i,vertexShader:{log:d,prefix:F},fragmentShader:{log:m,prefix:O}}}K.deleteShader(y),K.deleteShader(_),I=new C$(K,w),E=qR(K,w)}let I;this.getUniforms=function(){if(I===void 0)j(this);return I};let E;this.getAttributes=function(){if(E===void 0)j(this);return E};let u=Q.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(u===!1)u=K.getProgramParameter(w,tG);return u},this.destroy=function(){Z.releaseStatesOfProgram(this),K.deleteProgram(w),this.program=void 0},this.type=Q.shaderType,this.name=Q.shaderName,this.id=eG++,this.cacheKey=$,this.usedTimes=1,this.program=w,this.vertexShader=y,this.fragmentShader=_,this}var BR=0;class VD{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(J){let{vertexShader:$,fragmentShader:Q}=J,Z=this._getShaderStage($),K=this._getShaderStage(Q),W=this._getShaderCacheForMaterial(J);if(W.has(Z)===!1)W.add(Z),Z.usedTimes++;if(W.has(K)===!1)W.add(K),K.usedTimes++;return this}remove(J){let $=this.materialCache.get(J);for(let Q of $)if(Q.usedTimes--,Q.usedTimes===0)this.shaderCache.delete(Q.code);return this.materialCache.delete(J),this}getVertexShaderID(J){return this._getShaderStage(J.vertexShader).id}getFragmentShaderID(J){return this._getShaderStage(J.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(J){let $=this.materialCache,Q=$.get(J);if(Q===void 0)Q=new Set,$.set(J,Q);return Q}_getShaderStage(J){let $=this.shaderCache,Q=$.get(J);if(Q===void 0)Q=new OD(J),$.set(J,Q);return Q}}class OD{constructor(J){this.id=BR++,this.code=J,this.usedTimes=0}}function AR(J,$,Q,Z,K,W){let X=new uZ,H=new VD,q=new Set,Y=[],N=new Map,U=Z.logarithmicDepthBuffer,V=Z.precision,z={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function D(I){if(q.add(I),I===0)return"uv";return`uv${I}`}function w(I,E,u,C,p){let n=C.fog,f=p.geometry,i=I.isMeshStandardMaterial||I.isMeshLambertMaterial||I.isMeshPhongMaterial?C.environment:null,d=I.isMeshStandardMaterial||I.isMeshLambertMaterial&&!I.envMap||I.isMeshPhongMaterial&&!I.envMap,m=$.get(I.envMap||i,d),J0=!!m&&m.mapping===O$?m.image.height:null,$0=z[I.type];if(I.precision!==null){if(V=Z.getMaxPrecision(I.precision),V!==I.precision)b0("WebGLProgram.getParameters:",I.precision,"not supported, using",V,"instead.")}let U0=f.morphAttributes.position||f.morphAttributes.normal||f.morphAttributes.color,C0=U0!==void 0?U0.length:0,N0=0;if(f.morphAttributes.position!==void 0)N0=1;if(f.morphAttributes.normal!==void 0)N0=2;if(f.morphAttributes.color!==void 0)N0=3;let M8,X8,o,W0;if($0){let H8=Z7[$0];M8=H8.vertexShader,X8=H8.fragmentShader}else M8=I.vertexShader,X8=I.fragmentShader,H.update(I),o=H.getVertexShaderID(I),W0=H.getFragmentShaderID(I);let z0=J.getRenderTarget(),V0=J.state.buffers.depth.getReversed(),S0=p.isInstancedMesh===!0,r0=p.isBatchedMesh===!0,t0=!!I.map,e0=!!I.matcap,K8=!!m,U8=!!I.aoMap,c0=!!I.lightMap,S8=!!I.bumpMap,P=!!I.normalMap,m8=!!I.displacementMap,p0=!!I.emissiveMap,w8=!!I.metalnessMap,A0=!!I.roughnessMap,D8=I.anisotropy>0,G=I.clearcoat>0,k=I.dispersion>0,v=I.iridescence>0,s=I.sheen>0,t=I.transmission>0,c=D8&&!!I.anisotropyMap,D0=G&&!!I.clearcoatMap,X0=G&&!!I.clearcoatNormalMap,E0=G&&!!I.clearcoatRoughnessMap,T0=v&&!!I.iridescenceMap,e=v&&!!I.iridescenceThicknessMap,Q0=s&&!!I.sheenColorMap,w0=s&&!!I.sheenRoughnessMap,j0=!!I.specularMap,O0=!!I.specularColorMap,m0=!!I.specularIntensityMap,S=t&&!!I.transmissionMap,Z0=t&&!!I.thicknessMap,K0=!!I.gradientMap,I0=!!I.alphaMap,a=I.alphaTest>0,r=!!I.alphaHash,M0=!!I.extensions,f0=l6;if(I.toneMapped){if(z0===null||z0.isXRRenderTarget===!0)f0=J.toneMapping}let k8={shaderID:$0,shaderType:I.type,shaderName:I.name,vertexShader:M8,fragmentShader:X8,defines:I.defines,customVertexShaderID:o,customFragmentShaderID:W0,isRawShaderMaterial:I.isRawShaderMaterial===!0,glslVersion:I.glslVersion,precision:V,batching:r0,batchingColor:r0&&p._colorsTexture!==null,instancing:S0,instancingColor:S0&&p.instanceColor!==null,instancingMorph:S0&&p.morphTexture!==null,outputColorSpace:z0===null?J.outputColorSpace:z0.isXRRenderTarget===!0?z0.texture.colorSpace:D$,alphaToCoverage:!!I.alphaToCoverage,map:t0,matcap:e0,envMap:K8,envMapMode:K8&&m.mapping,envMapCubeUVHeight:J0,aoMap:U8,lightMap:c0,bumpMap:S8,normalMap:P,displacementMap:m8,emissiveMap:p0,normalMapObjectSpace:P&&I.normalMapType===Iz,normalMapTangentSpace:P&&I.normalMapType===kz,metalnessMap:w8,roughnessMap:A0,anisotropy:D8,anisotropyMap:c,clearcoat:G,clearcoatMap:D0,clearcoatNormalMap:X0,clearcoatRoughnessMap:E0,dispersion:k,iridescence:v,iridescenceMap:T0,iridescenceThicknessMap:e,sheen:s,sheenColorMap:Q0,sheenRoughnessMap:w0,specularMap:j0,specularColorMap:O0,specularIntensityMap:m0,transmission:t,transmissionMap:S,thicknessMap:Z0,gradientMap:K0,opaque:I.transparent===!1&&I.blending===V$&&I.alphaToCoverage===!1,alphaMap:I0,alphaTest:a,alphaHash:r,combine:I.combine,mapUv:t0&&D(I.map.channel),aoMapUv:U8&&D(I.aoMap.channel),lightMapUv:c0&&D(I.lightMap.channel),bumpMapUv:S8&&D(I.bumpMap.channel),normalMapUv:P&&D(I.normalMap.channel),displacementMapUv:m8&&D(I.displacementMap.channel),emissiveMapUv:p0&&D(I.emissiveMap.channel),metalnessMapUv:w8&&D(I.metalnessMap.channel),roughnessMapUv:A0&&D(I.roughnessMap.channel),anisotropyMapUv:c&&D(I.anisotropyMap.channel),clearcoatMapUv:D0&&D(I.clearcoatMap.channel),clearcoatNormalMapUv:X0&&D(I.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:E0&&D(I.clearcoatRoughnessMap.channel),iridescenceMapUv:T0&&D(I.iridescenceMap.channel),iridescenceThicknessMapUv:e&&D(I.iridescenceThicknessMap.channel),sheenColorMapUv:Q0&&D(I.sheenColorMap.channel),sheenRoughnessMapUv:w0&&D(I.sheenRoughnessMap.channel),specularMapUv:j0&&D(I.specularMap.channel),specularColorMapUv:O0&&D(I.specularColorMap.channel),specularIntensityMapUv:m0&&D(I.specularIntensityMap.channel),transmissionMapUv:S&&D(I.transmissionMap.channel),thicknessMapUv:Z0&&D(I.thicknessMap.channel),alphaMapUv:I0&&D(I.alphaMap.channel),vertexTangents:!!f.attributes.tangent&&(P||D8),vertexColors:I.vertexColors,vertexAlphas:I.vertexColors===!0&&!!f.attributes.color&&f.attributes.color.itemSize===4,pointsUvs:p.isPoints===!0&&!!f.attributes.uv&&(t0||I0),fog:!!n,useFog:I.fog===!0,fogExp2:!!n&&n.isFogExp2,flatShading:I.wireframe===!1&&(I.flatShading===!0||f.attributes.normal===void 0&&P===!1&&(I.isMeshLambertMaterial||I.isMeshPhongMaterial||I.isMeshStandardMaterial||I.isMeshPhysicalMaterial)),sizeAttenuation:I.sizeAttenuation===!0,logarithmicDepthBuffer:U,reversedDepthBuffer:V0,skinning:p.isSkinnedMesh===!0,morphTargets:f.morphAttributes.position!==void 0,morphNormals:f.morphAttributes.normal!==void 0,morphColors:f.morphAttributes.color!==void 0,morphTargetsCount:C0,morphTextureStride:N0,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:W.numPlanes,numClipIntersection:W.numIntersection,dithering:I.dithering,shadowMapEnabled:J.shadowMap.enabled&&u.length>0,shadowMapType:J.shadowMap.type,toneMapping:f0,decodeVideoTexture:t0&&I.map.isVideoTexture===!0&&a0.getTransfer(I.map.colorSpace)===z8,decodeVideoTextureEmissive:p0&&I.emissiveMap.isVideoTexture===!0&&a0.getTransfer(I.emissiveMap.colorSpace)===z8,premultipliedAlpha:I.premultipliedAlpha,doubleSided:I.side===e6,flipSided:I.side===N6,useDepthPacking:I.depthPacking>=0,depthPacking:I.depthPacking||0,index0AttributeName:I.index0AttributeName,extensionClipCullDistance:M0&&I.extensions.clipCullDistance===!0&&Q.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(M0&&I.extensions.multiDraw===!0||r0)&&Q.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:Q.has("KHR_parallel_shader_compile"),customProgramCacheKey:I.customProgramCacheKey()};return k8.vertexUv1s=q.has(1),k8.vertexUv2s=q.has(2),k8.vertexUv3s=q.has(3),q.clear(),k8}function F(I){let E=[];if(I.shaderID)E.push(I.shaderID);else E.push(I.customVertexShaderID),E.push(I.customFragmentShaderID);if(I.defines!==void 0)for(let u in I.defines)E.push(u),E.push(I.defines[u]);if(I.isRawShaderMaterial===!1)O(E,I),R(E,I),E.push(J.outputColorSpace);return E.push(I.customProgramCacheKey),E.join()}function O(I,E){I.push(E.precision),I.push(E.outputColorSpace),I.push(E.envMapMode),I.push(E.envMapCubeUVHeight),I.push(E.mapUv),I.push(E.alphaMapUv),I.push(E.lightMapUv),I.push(E.aoMapUv),I.push(E.bumpMapUv),I.push(E.normalMapUv),I.push(E.displacementMapUv),I.push(E.emissiveMapUv),I.push(E.metalnessMapUv),I.push(E.roughnessMapUv),I.push(E.anisotropyMapUv),I.push(E.clearcoatMapUv),I.push(E.clearcoatNormalMapUv),I.push(E.clearcoatRoughnessMapUv),I.push(E.iridescenceMapUv),I.push(E.iridescenceThicknessMapUv),I.push(E.sheenColorMapUv),I.push(E.sheenRoughnessMapUv),I.push(E.specularMapUv),I.push(E.specularColorMapUv),I.push(E.specularIntensityMapUv),I.push(E.transmissionMapUv),I.push(E.thicknessMapUv),I.push(E.combine),I.push(E.fogExp2),I.push(E.sizeAttenuation),I.push(E.morphTargetsCount),I.push(E.morphAttributeCount),I.push(E.numDirLights),I.push(E.numPointLights),I.push(E.numSpotLights),I.push(E.numSpotLightMaps),I.push(E.numHemiLights),I.push(E.numRectAreaLights),I.push(E.numDirLightShadows),I.push(E.numPointLightShadows),I.push(E.numSpotLightShadows),I.push(E.numSpotLightShadowsWithMaps),I.push(E.numLightProbes),I.push(E.shadowMapType),I.push(E.toneMapping),I.push(E.numClippingPlanes),I.push(E.numClipIntersection),I.push(E.depthPacking)}function R(I,E){if(X.disableAll(),E.instancing)X.enable(0);if(E.instancingColor)X.enable(1);if(E.instancingMorph)X.enable(2);if(E.matcap)X.enable(3);if(E.envMap)X.enable(4);if(E.normalMapObjectSpace)X.enable(5);if(E.normalMapTangentSpace)X.enable(6);if(E.clearcoat)X.enable(7);if(E.iridescence)X.enable(8);if(E.alphaTest)X.enable(9);if(E.vertexColors)X.enable(10);if(E.vertexAlphas)X.enable(11);if(E.vertexUv1s)X.enable(12);if(E.vertexUv2s)X.enable(13);if(E.vertexUv3s)X.enable(14);if(E.vertexTangents)X.enable(15);if(E.anisotropy)X.enable(16);if(E.alphaHash)X.enable(17);if(E.batching)X.enable(18);if(E.dispersion)X.enable(19);if(E.batchingColor)X.enable(20);if(E.gradientMap)X.enable(21);if(I.push(X.mask),X.disableAll(),E.fog)X.enable(0);if(E.useFog)X.enable(1);if(E.flatShading)X.enable(2);if(E.logarithmicDepthBuffer)X.enable(3);if(E.reversedDepthBuffer)X.enable(4);if(E.skinning)X.enable(5);if(E.morphTargets)X.enable(6);if(E.morphNormals)X.enable(7);if(E.morphColors)X.enable(8);if(E.premultipliedAlpha)X.enable(9);if(E.shadowMapEnabled)X.enable(10);if(E.doubleSided)X.enable(11);if(E.flipSided)X.enable(12);if(E.useDepthPacking)X.enable(13);if(E.dithering)X.enable(14);if(E.transmission)X.enable(15);if(E.sheen)X.enable(16);if(E.opaque)X.enable(17);if(E.pointsUvs)X.enable(18);if(E.decodeVideoTexture)X.enable(19);if(E.decodeVideoTextureEmissive)X.enable(20);if(E.alphaToCoverage)X.enable(21);I.push(X.mask)}function B(I){let E=z[I.type],u;if(E){let C=Z7[E];u=Sz.clone(C.uniforms)}else u=I.uniforms;return u}function L(I,E){let u=N.get(E);if(u!==void 0)++u.usedTimes;else u=new LR(J,E,I,K),Y.push(u),N.set(E,u);return u}function y(I){if(--I.usedTimes===0){let E=Y.indexOf(I);Y[E]=Y[Y.length-1],Y.pop(),N.delete(I.cacheKey),I.destroy()}}function _(I){H.remove(I)}function j(){H.dispose()}return{getParameters:w,getProgramCacheKey:F,getUniforms:B,acquireProgram:L,releaseProgram:y,releaseShaderCache:_,programs:Y,dispose:j}}function _R(){let J=new WeakMap;function $(X){return J.has(X)}function Q(X){let H=J.get(X);if(H===void 0)H={},J.set(X,H);return H}function Z(X){J.delete(X)}function K(X,H,q){J.get(X)[H]=q}function W(){J=new WeakMap}return{has:$,get:Q,remove:Z,update:K,dispose:W}}function CR(J,$){if(J.groupOrder!==$.groupOrder)return J.groupOrder-$.groupOrder;else if(J.renderOrder!==$.renderOrder)return J.renderOrder-$.renderOrder;else if(J.material.id!==$.material.id)return J.material.id-$.material.id;else if(J.materialVariant!==$.materialVariant)return J.materialVariant-$.materialVariant;else if(J.z!==$.z)return J.z-$.z;else return J.id-$.id}function JD(J,$){if(J.groupOrder!==$.groupOrder)return J.groupOrder-$.groupOrder;else if(J.renderOrder!==$.renderOrder)return J.renderOrder-$.renderOrder;else if(J.z!==$.z)return $.z-J.z;else return J.id-$.id}function $D(){let J=[],$=0,Q=[],Z=[],K=[];function W(){$=0,Q.length=0,Z.length=0,K.length=0}function X(V){let z=0;if(V.isInstancedMesh)z+=2;if(V.isSkinnedMesh)z+=1;return z}function H(V,z,D,w,F,O){let R=J[$];if(R===void 0)R={id:V.id,object:V,geometry:z,material:D,materialVariant:X(V),groupOrder:w,renderOrder:V.renderOrder,z:F,group:O},J[$]=R;else R.id=V.id,R.object=V,R.geometry=z,R.material=D,R.materialVariant=X(V),R.groupOrder=w,R.renderOrder=V.renderOrder,R.z=F,R.group=O;return $++,R}function q(V,z,D,w,F,O){let R=H(V,z,D,w,F,O);if(D.transmission>0)Z.push(R);else if(D.transparent===!0)K.push(R);else Q.push(R)}function Y(V,z,D,w,F,O){let R=H(V,z,D,w,F,O);if(D.transmission>0)Z.unshift(R);else if(D.transparent===!0)K.unshift(R);else Q.unshift(R)}function N(V,z){if(Q.length>1)Q.sort(V||CR);if(Z.length>1)Z.sort(z||JD);if(K.length>1)K.sort(z||JD)}function U(){for(let V=$,z=J.length;V<z;V++){let D=J[V];if(D.id===null)break;D.id=null,D.object=null,D.geometry=null,D.material=null,D.group=null}}return{opaque:Q,transmissive:Z,transparent:K,init:W,push:q,unshift:Y,finish:U,sort:N}}function ER(){let J=new WeakMap;function $(Z,K){let W=J.get(Z),X;if(W===void 0)X=new $D,J.set(Z,[X]);else if(K>=W.length)X=new $D,W.push(X);else X=W[K];return X}function Q(){J=new WeakMap}return{get:$,dispose:Q}}function PR(){let J={};return{get:function($){if(J[$.id]!==void 0)return J[$.id];let Q;switch($.type){case"DirectionalLight":Q={direction:new g,color:new l0};break;case"SpotLight":Q={position:new g,direction:new g,color:new l0,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":Q={position:new g,color:new l0,distance:0,decay:0};break;case"HemisphereLight":Q={direction:new g,skyColor:new l0,groundColor:new l0};break;case"RectAreaLight":Q={color:new l0,position:new g,halfWidth:new g,halfHeight:new g};break}return J[$.id]=Q,Q}}}function jR(){let J={};return{get:function($){if(J[$.id]!==void 0)return J[$.id];let Q;switch($.type){case"DirectionalLight":Q={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q8};break;case"SpotLight":Q={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q8};break;case"PointLight":Q={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q8,shadowCameraNear:1,shadowCameraFar:1000};break}return J[$.id]=Q,Q}}}var SR=0;function TR(J,$){return($.castShadow?2:0)-(J.castShadow?2:0)+($.map?1:0)-(J.map?1:0)}function yR(J){let $=new PR,Q=jR(),Z={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let Y=0;Y<9;Y++)Z.probe.push(new g);let K=new g,W=new G8,X=new G8;function H(Y){let N=0,U=0,V=0;for(let E=0;E<9;E++)Z.probe[E].set(0,0,0);let z=0,D=0,w=0,F=0,O=0,R=0,B=0,L=0,y=0,_=0,j=0;Y.sort(TR);for(let E=0,u=Y.length;E<u;E++){let C=Y[E],p=C.color,n=C.intensity,f=C.distance,i=null;if(C.shadow&&C.shadow.map)if(C.shadow.map.texture.format===k9)i=C.shadow.map.texture;else i=C.shadow.map.depthTexture||C.shadow.map.texture;if(C.isAmbientLight)N+=p.r*n,U+=p.g*n,V+=p.b*n;else if(C.isLightProbe){for(let d=0;d<9;d++)Z.probe[d].addScaledVector(C.sh.coefficients[d],n);j++}else if(C.isDirectionalLight){let d=$.get(C);if(d.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let m=C.shadow,J0=Q.get(C);J0.shadowIntensity=m.intensity,J0.shadowBias=m.bias,J0.shadowNormalBias=m.normalBias,J0.shadowRadius=m.radius,J0.shadowMapSize=m.mapSize,Z.directionalShadow[z]=J0,Z.directionalShadowMap[z]=i,Z.directionalShadowMatrix[z]=C.shadow.matrix,R++}Z.directional[z]=d,z++}else if(C.isSpotLight){let d=$.get(C);d.position.setFromMatrixPosition(C.matrixWorld),d.color.copy(p).multiplyScalar(n),d.distance=f,d.coneCos=Math.cos(C.angle),d.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),d.decay=C.decay,Z.spot[w]=d;let m=C.shadow;if(C.map){if(Z.spotLightMap[y]=C.map,y++,m.updateMatrices(C),C.castShadow)_++}if(Z.spotLightMatrix[w]=m.matrix,C.castShadow){let J0=Q.get(C);J0.shadowIntensity=m.intensity,J0.shadowBias=m.bias,J0.shadowNormalBias=m.normalBias,J0.shadowRadius=m.radius,J0.shadowMapSize=m.mapSize,Z.spotShadow[w]=J0,Z.spotShadowMap[w]=i,L++}w++}else if(C.isRectAreaLight){let d=$.get(C);d.color.copy(p).multiplyScalar(n),d.halfWidth.set(C.width*0.5,0,0),d.halfHeight.set(0,C.height*0.5,0),Z.rectArea[F]=d,F++}else if(C.isPointLight){let d=$.get(C);if(d.color.copy(C.color).multiplyScalar(C.intensity),d.distance=C.distance,d.decay=C.decay,C.castShadow){let m=C.shadow,J0=Q.get(C);J0.shadowIntensity=m.intensity,J0.shadowBias=m.bias,J0.shadowNormalBias=m.normalBias,J0.shadowRadius=m.radius,J0.shadowMapSize=m.mapSize,J0.shadowCameraNear=m.camera.near,J0.shadowCameraFar=m.camera.far,Z.pointShadow[D]=J0,Z.pointShadowMap[D]=i,Z.pointShadowMatrix[D]=C.shadow.matrix,B++}Z.point[D]=d,D++}else if(C.isHemisphereLight){let d=$.get(C);d.skyColor.copy(C.color).multiplyScalar(n),d.groundColor.copy(C.groundColor).multiplyScalar(n),Z.hemi[O]=d,O++}}if(F>0)if(J.has("OES_texture_float_linear")===!0)Z.rectAreaLTC1=H0.LTC_FLOAT_1,Z.rectAreaLTC2=H0.LTC_FLOAT_2;else Z.rectAreaLTC1=H0.LTC_HALF_1,Z.rectAreaLTC2=H0.LTC_HALF_2;Z.ambient[0]=N,Z.ambient[1]=U,Z.ambient[2]=V;let I=Z.hash;if(I.directionalLength!==z||I.pointLength!==D||I.spotLength!==w||I.rectAreaLength!==F||I.hemiLength!==O||I.numDirectionalShadows!==R||I.numPointShadows!==B||I.numSpotShadows!==L||I.numSpotMaps!==y||I.numLightProbes!==j)Z.directional.length=z,Z.spot.length=w,Z.rectArea.length=F,Z.point.length=D,Z.hemi.length=O,Z.directionalShadow.length=R,Z.directionalShadowMap.length=R,Z.pointShadow.length=B,Z.pointShadowMap.length=B,Z.spotShadow.length=L,Z.spotShadowMap.length=L,Z.directionalShadowMatrix.length=R,Z.pointShadowMatrix.length=B,Z.spotLightMatrix.length=L+y-_,Z.spotLightMap.length=y,Z.numSpotLightShadowsWithMaps=_,Z.numLightProbes=j,I.directionalLength=z,I.pointLength=D,I.spotLength=w,I.rectAreaLength=F,I.hemiLength=O,I.numDirectionalShadows=R,I.numPointShadows=B,I.numSpotShadows=L,I.numSpotMaps=y,I.numLightProbes=j,Z.version=SR++}function q(Y,N){let U=0,V=0,z=0,D=0,w=0,F=N.matrixWorldInverse;for(let O=0,R=Y.length;O<R;O++){let B=Y[O];if(B.isDirectionalLight){let L=Z.directional[U];L.direction.setFromMatrixPosition(B.matrixWorld),K.setFromMatrixPosition(B.target.matrixWorld),L.direction.sub(K),L.direction.transformDirection(F),U++}else if(B.isSpotLight){let L=Z.spot[z];L.position.setFromMatrixPosition(B.matrixWorld),L.position.applyMatrix4(F),L.direction.setFromMatrixPosition(B.matrixWorld),K.setFromMatrixPosition(B.target.matrixWorld),L.direction.sub(K),L.direction.transformDirection(F),z++}else if(B.isRectAreaLight){let L=Z.rectArea[D];L.position.setFromMatrixPosition(B.matrixWorld),L.position.applyMatrix4(F),X.identity(),W.copy(B.matrixWorld),W.premultiply(F),X.extractRotation(W),L.halfWidth.set(B.width*0.5,0,0),L.halfHeight.set(0,B.height*0.5,0),L.halfWidth.applyMatrix4(X),L.halfHeight.applyMatrix4(X),D++}else if(B.isPointLight){let L=Z.point[V];L.position.setFromMatrixPosition(B.matrixWorld),L.position.applyMatrix4(F),V++}else if(B.isHemisphereLight){let L=Z.hemi[w];L.direction.setFromMatrixPosition(B.matrixWorld),L.direction.transformDirection(F),w++}}}return{setup:H,setupView:q,state:Z}}function QD(J){let $=new yR(J),Q=[],Z=[];function K(N){Y.camera=N,Q.length=0,Z.length=0}function W(N){Q.push(N)}function X(N){Z.push(N)}function H(){$.setup(Q)}function q(N){$.setupView(Q,N)}let Y={lightsArray:Q,shadowsArray:Z,camera:null,lights:$,transmissionRenderTarget:{}};return{init:K,state:Y,setupLights:H,setupLightsView:q,pushLight:W,pushShadow:X}}function bR(J){let $=new WeakMap;function Q(K,W=0){let X=$.get(K),H;if(X===void 0)H=new QD(J),$.set(K,[H]);else if(W>=X.length)H=new QD(J),X.push(H);else H=X[W];return H}function Z(){$=new WeakMap}return{get:Q,dispose:Z}}var vR=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,fR=`uniform sampler2D shadow_pass;
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
}`,hR=[new g(1,0,0),new g(-1,0,0),new g(0,1,0),new g(0,-1,0),new g(0,0,1),new g(0,0,-1)],xR=[new g(0,-1,0),new g(0,-1,0),new g(0,0,1),new g(0,0,-1),new g(0,-1,0),new g(0,-1,0)],ZD=new G8,A$=new g,jH=new g;function gR(J,$,Q){let Z=new G$,K=new Q8,W=new Q8,X=new A8,H=new qH,q=new YH,Y={},N=Q.maxTextureSize,U={[O9]:N6,[N6]:O9,[e6]:e6},V=new S6({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Q8},radius:{value:4}},vertexShader:vR,fragmentShader:fR}),z=V.clone();z.defines.HORIZONTAL_PASS=1;let D=new M6;D.setAttribute("position",new K6(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let w=new u6(D,V),F=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=U$;let O=this.type;this.render=function(_,j,I){if(F.enabled===!1)return;if(F.autoUpdate===!1&&F.needsUpdate===!1)return;if(_.length===0)return;if(this.type===jF)b0("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=U$;let E=J.getRenderTarget(),u=J.getActiveCubeFace(),C=J.getActiveMipmapLevel(),p=J.state;if(p.setBlending(J7),p.buffers.depth.getReversed()===!0)p.buffers.color.setClear(0,0,0,0);else p.buffers.color.setClear(1,1,1,1);p.buffers.depth.setTest(!0),p.setScissorTest(!1);let n=O!==this.type;if(n)j.traverse(function(f){if(f.material)if(Array.isArray(f.material))f.material.forEach((i)=>i.needsUpdate=!0);else f.material.needsUpdate=!0});for(let f=0,i=_.length;f<i;f++){let d=_[f],m=d.shadow;if(m===void 0){b0("WebGLShadowMap:",d,"has no shadow.");continue}if(m.autoUpdate===!1&&m.needsUpdate===!1)continue;K.copy(m.mapSize);let J0=m.getFrameExtents();if(K.multiply(J0),W.copy(m.mapSize),K.x>N||K.y>N){if(K.x>N)W.x=Math.floor(N/J0.x),K.x=W.x*J0.x,m.mapSize.x=W.x;if(K.y>N)W.y=Math.floor(N/J0.y),K.y=W.y*J0.y,m.mapSize.y=W.y}let $0=J.state.buffers.depth.getReversed();if(m.camera._reversedDepth=$0,m.map===null||n===!0){if(m.map!==null){if(m.map.depthTexture!==null)m.map.depthTexture.dispose(),m.map.depthTexture=null;m.map.dispose()}if(this.type===V9){if(d.isPointLight){b0("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}m.map=new j6(K.x,K.y,{format:k9,type:G7,minFilter:U6,magFilter:U6,generateMipmaps:!1}),m.map.texture.name=d.name+".shadowMap",m.map.depthTexture=new DJ(K.x,K.y,M7),m.map.depthTexture.name=d.name+".shadowMapDepth",m.map.depthTexture.format=VJ,m.map.depthTexture.compareFunction=null,m.map.depthTexture.minFilter=d7,m.map.depthTexture.magFilter=d7}else{if(d.isPointLight)m.map=new bH(K.x),m.map.depthTexture=new WH(K.x,l7);else m.map=new j6(K.x,K.y),m.map.depthTexture=new DJ(K.x,K.y,l7);if(m.map.depthTexture.name=d.name+".shadowMap",m.map.depthTexture.format=VJ,this.type===U$)m.map.depthTexture.compareFunction=$0?lZ:dZ,m.map.depthTexture.minFilter=U6,m.map.depthTexture.magFilter=U6;else m.map.depthTexture.compareFunction=null,m.map.depthTexture.minFilter=d7,m.map.depthTexture.magFilter=d7}m.camera.updateProjectionMatrix()}let U0=m.map.isWebGLCubeRenderTarget?6:1;for(let C0=0;C0<U0;C0++){if(m.map.isWebGLCubeRenderTarget)J.setRenderTarget(m.map,C0),J.clear();else{if(C0===0)J.setRenderTarget(m.map),J.clear();let N0=m.getViewport(C0);X.set(W.x*N0.x,W.y*N0.y,W.x*N0.z,W.y*N0.w),p.viewport(X)}if(d.isPointLight){let{camera:N0,matrix:M8}=m,X8=d.distance||N0.far;if(X8!==N0.far)N0.far=X8,N0.updateProjectionMatrix();A$.setFromMatrixPosition(d.matrixWorld),N0.position.copy(A$),jH.copy(N0.position),jH.add(hR[C0]),N0.up.copy(xR[C0]),N0.lookAt(jH),N0.updateMatrixWorld(),M8.makeTranslation(-A$.x,-A$.y,-A$.z),ZD.multiplyMatrices(N0.projectionMatrix,N0.matrixWorldInverse),m._frustum.setFromProjectionMatrix(ZD,N0.coordinateSystem,N0.reversedDepth)}else m.updateMatrices(d);Z=m.getFrustum(),L(j,I,m.camera,d,this.type)}if(m.isPointLightShadow!==!0&&this.type===V9)R(m,I);m.needsUpdate=!1}O=this.type,F.needsUpdate=!1,J.setRenderTarget(E,u,C)};function R(_,j){let I=$.update(w);if(V.defines.VSM_SAMPLES!==_.blurSamples)V.defines.VSM_SAMPLES=_.blurSamples,z.defines.VSM_SAMPLES=_.blurSamples,V.needsUpdate=!0,z.needsUpdate=!0;if(_.mapPass===null)_.mapPass=new j6(K.x,K.y,{format:k9,type:G7});V.uniforms.shadow_pass.value=_.map.depthTexture,V.uniforms.resolution.value=_.mapSize,V.uniforms.radius.value=_.radius,J.setRenderTarget(_.mapPass),J.clear(),J.renderBufferDirect(j,null,I,V,w,null),z.uniforms.shadow_pass.value=_.mapPass.texture,z.uniforms.resolution.value=_.mapSize,z.uniforms.radius.value=_.radius,J.setRenderTarget(_.map),J.clear(),J.renderBufferDirect(j,null,I,z,w,null)}function B(_,j,I,E){let u=null,C=I.isPointLight===!0?_.customDistanceMaterial:_.customDepthMaterial;if(C!==void 0)u=C;else if(u=I.isPointLight===!0?q:H,J.localClippingEnabled&&j.clipShadows===!0&&Array.isArray(j.clippingPlanes)&&j.clippingPlanes.length!==0||j.displacementMap&&j.displacementScale!==0||j.alphaMap&&j.alphaTest>0||j.map&&j.alphaTest>0||j.alphaToCoverage===!0){let p=u.uuid,n=j.uuid,f=Y[p];if(f===void 0)f={},Y[p]=f;let i=f[n];if(i===void 0)i=u.clone(),f[n]=i,j.addEventListener("dispose",y);u=i}if(u.visible=j.visible,u.wireframe=j.wireframe,E===V9)u.side=j.shadowSide!==null?j.shadowSide:j.side;else u.side=j.shadowSide!==null?j.shadowSide:U[j.side];if(u.alphaMap=j.alphaMap,u.alphaTest=j.alphaToCoverage===!0?0.5:j.alphaTest,u.map=j.map,u.clipShadows=j.clipShadows,u.clippingPlanes=j.clippingPlanes,u.clipIntersection=j.clipIntersection,u.displacementMap=j.displacementMap,u.displacementScale=j.displacementScale,u.displacementBias=j.displacementBias,u.wireframeLinewidth=j.wireframeLinewidth,u.linewidth=j.linewidth,I.isPointLight===!0&&u.isMeshDistanceMaterial===!0){let p=J.properties.get(u);p.light=I}return u}function L(_,j,I,E,u){if(_.visible===!1)return;if(_.layers.test(j.layers)&&(_.isMesh||_.isLine||_.isPoints)){if((_.castShadow||_.receiveShadow&&u===V9)&&(!_.frustumCulled||Z.intersectsObject(_))){_.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,_.matrixWorld);let n=$.update(_),f=_.material;if(Array.isArray(f)){let i=n.groups;for(let d=0,m=i.length;d<m;d++){let J0=i[d],$0=f[J0.materialIndex];if($0&&$0.visible){let U0=B(_,$0,E,u);_.onBeforeShadow(J,_,j,I,n,U0,J0),J.renderBufferDirect(I,null,n,U0,_,J0),_.onAfterShadow(J,_,j,I,n,U0,J0)}}}else if(f.visible){let i=B(_,f,E,u);_.onBeforeShadow(J,_,j,I,n,i,null),J.renderBufferDirect(I,null,n,i,_,null),_.onAfterShadow(J,_,j,I,n,i,null)}}}let p=_.children;for(let n=0,f=p.length;n<f;n++)L(p[n],j,I,E,u)}function y(_){_.target.removeEventListener("dispose",y);for(let I in Y){let E=Y[I],u=_.target.uuid;if(u in E)E[u].dispose(),delete E[u]}}}function pR(J,$){function Q(){let S=!1,Z0=new A8,K0=null,I0=new A8(0,0,0,0);return{setMask:function(a){if(K0!==a&&!S)J.colorMask(a,a,a,a),K0=a},setLocked:function(a){S=a},setClear:function(a,r,M0,f0,k8){if(k8===!0)a*=f0,r*=f0,M0*=f0;if(Z0.set(a,r,M0,f0),I0.equals(Z0)===!1)J.clearColor(a,r,M0,f0),I0.copy(Z0)},reset:function(){S=!1,K0=null,I0.set(-1,0,0,0)}}}function Z(){let S=!1,Z0=!1,K0=null,I0=null,a=null;return{setReversed:function(r){if(Z0!==r){let M0=$.get("EXT_clip_control");if(r)M0.clipControlEXT(M0.LOWER_LEFT_EXT,M0.ZERO_TO_ONE_EXT);else M0.clipControlEXT(M0.LOWER_LEFT_EXT,M0.NEGATIVE_ONE_TO_ONE_EXT);Z0=r;let f0=a;a=null,this.setClear(f0)}},getReversed:function(){return Z0},setTest:function(r){if(r)z0(J.DEPTH_TEST);else V0(J.DEPTH_TEST)},setMask:function(r){if(K0!==r&&!S)J.depthMask(r),K0=r},setFunc:function(r){if(Z0)r=Pz[r];if(I0!==r){switch(r){case rF:J.depthFunc(J.NEVER);break;case tF:J.depthFunc(J.ALWAYS);break;case eF:J.depthFunc(J.LESS);break;case WX:J.depthFunc(J.LEQUAL);break;case Jz:J.depthFunc(J.EQUAL);break;case $z:J.depthFunc(J.GEQUAL);break;case Qz:J.depthFunc(J.GREATER);break;case Zz:J.depthFunc(J.NOTEQUAL);break;default:J.depthFunc(J.LEQUAL)}I0=r}},setLocked:function(r){S=r},setClear:function(r){if(a!==r){if(a=r,Z0)r=1-r;J.clearDepth(r)}},reset:function(){S=!1,K0=null,I0=null,a=null,Z0=!1}}}function K(){let S=!1,Z0=null,K0=null,I0=null,a=null,r=null,M0=null,f0=null,k8=null;return{setTest:function(H8){if(!S)if(H8)z0(J.STENCIL_TEST);else V0(J.STENCIL_TEST)},setMask:function(H8){if(Z0!==H8&&!S)J.stencilMask(H8),Z0=H8},setFunc:function(H8,K7,s6){if(K0!==H8||I0!==K7||a!==s6)J.stencilFunc(H8,K7,s6),K0=H8,I0=K7,a=s6},setOp:function(H8,K7,s6){if(r!==H8||M0!==K7||f0!==s6)J.stencilOp(H8,K7,s6),r=H8,M0=K7,f0=s6},setLocked:function(H8){S=H8},setClear:function(H8){if(k8!==H8)J.clearStencil(H8),k8=H8},reset:function(){S=!1,Z0=null,K0=null,I0=null,a=null,r=null,M0=null,f0=null,k8=null}}}let W=new Q,X=new Z,H=new K,q=new WeakMap,Y=new WeakMap,N={},U={},V=new WeakMap,z=[],D=null,w=!1,F=null,O=null,R=null,B=null,L=null,y=null,_=null,j=new l0(0,0,0),I=0,E=!1,u=null,C=null,p=null,n=null,f=null,i=J.getParameter(J.MAX_COMBINED_TEXTURE_IMAGE_UNITS),d=!1,m=0,J0=J.getParameter(J.VERSION);if(J0.indexOf("WebGL")!==-1)m=parseFloat(/^WebGL (\d)/.exec(J0)[1]),d=m>=1;else if(J0.indexOf("OpenGL ES")!==-1)m=parseFloat(/^OpenGL ES (\d)/.exec(J0)[1]),d=m>=2;let $0=null,U0={},C0=J.getParameter(J.SCISSOR_BOX),N0=J.getParameter(J.VIEWPORT),M8=new A8().fromArray(C0),X8=new A8().fromArray(N0);function o(S,Z0,K0,I0){let a=new Uint8Array(4),r=J.createTexture();J.bindTexture(S,r),J.texParameteri(S,J.TEXTURE_MIN_FILTER,J.NEAREST),J.texParameteri(S,J.TEXTURE_MAG_FILTER,J.NEAREST);for(let M0=0;M0<K0;M0++)if(S===J.TEXTURE_3D||S===J.TEXTURE_2D_ARRAY)J.texImage3D(Z0,0,J.RGBA,1,1,I0,0,J.RGBA,J.UNSIGNED_BYTE,a);else J.texImage2D(Z0+M0,0,J.RGBA,1,1,0,J.RGBA,J.UNSIGNED_BYTE,a);return r}let W0={};W0[J.TEXTURE_2D]=o(J.TEXTURE_2D,J.TEXTURE_2D,1),W0[J.TEXTURE_CUBE_MAP]=o(J.TEXTURE_CUBE_MAP,J.TEXTURE_CUBE_MAP_POSITIVE_X,6),W0[J.TEXTURE_2D_ARRAY]=o(J.TEXTURE_2D_ARRAY,J.TEXTURE_2D_ARRAY,1,1),W0[J.TEXTURE_3D]=o(J.TEXTURE_3D,J.TEXTURE_3D,1,1),W.setClear(0,0,0,1),X.setClear(1),H.setClear(0),z0(J.DEPTH_TEST),X.setFunc(WX),S8(!1),P($X),z0(J.CULL_FACE),U8(J7);function z0(S){if(N[S]!==!0)J.enable(S),N[S]=!0}function V0(S){if(N[S]!==!1)J.disable(S),N[S]=!1}function S0(S,Z0){if(U[S]!==Z0){if(J.bindFramebuffer(S,Z0),U[S]=Z0,S===J.DRAW_FRAMEBUFFER)U[J.FRAMEBUFFER]=Z0;if(S===J.FRAMEBUFFER)U[J.DRAW_FRAMEBUFFER]=Z0;return!0}return!1}function r0(S,Z0){let K0=z,I0=!1;if(S){if(K0=V.get(Z0),K0===void 0)K0=[],V.set(Z0,K0);let a=S.textures;if(K0.length!==a.length||K0[0]!==J.COLOR_ATTACHMENT0){for(let r=0,M0=a.length;r<M0;r++)K0[r]=J.COLOR_ATTACHMENT0+r;K0.length=a.length,I0=!0}}else if(K0[0]!==J.BACK)K0[0]=J.BACK,I0=!0;if(I0)J.drawBuffers(K0)}function t0(S){if(D!==S)return J.useProgram(S),D=S,!0;return!1}let e0={[F9]:J.FUNC_ADD,[TF]:J.FUNC_SUBTRACT,[yF]:J.FUNC_REVERSE_SUBTRACT};e0[bF]=J.MIN,e0[vF]=J.MAX;let K8={[fF]:J.ZERO,[hF]:J.ONE,[xF]:J.SRC_COLOR,[pF]:J.SRC_ALPHA,[sF]:J.SRC_ALPHA_SATURATE,[cF]:J.DST_COLOR,[dF]:J.DST_ALPHA,[gF]:J.ONE_MINUS_SRC_COLOR,[mF]:J.ONE_MINUS_SRC_ALPHA,[uF]:J.ONE_MINUS_DST_COLOR,[lF]:J.ONE_MINUS_DST_ALPHA,[nF]:J.CONSTANT_COLOR,[iF]:J.ONE_MINUS_CONSTANT_COLOR,[oF]:J.CONSTANT_ALPHA,[aF]:J.ONE_MINUS_CONSTANT_ALPHA};function U8(S,Z0,K0,I0,a,r,M0,f0,k8,H8){if(S===J7){if(w===!0)V0(J.BLEND),w=!1;return}if(w===!1)z0(J.BLEND),w=!0;if(S!==SF){if(S!==F||H8!==E){if(O!==F9||L!==F9)J.blendEquation(J.FUNC_ADD),O=F9,L=F9;if(H8)switch(S){case V$:J.blendFuncSeparate(J.ONE,J.ONE_MINUS_SRC_ALPHA,J.ONE,J.ONE_MINUS_SRC_ALPHA);break;case QX:J.blendFunc(J.ONE,J.ONE);break;case ZX:J.blendFuncSeparate(J.ZERO,J.ONE_MINUS_SRC_COLOR,J.ZERO,J.ONE);break;case KX:J.blendFuncSeparate(J.DST_COLOR,J.ONE_MINUS_SRC_ALPHA,J.ZERO,J.ONE);break;default:y0("WebGLState: Invalid blending: ",S);break}else switch(S){case V$:J.blendFuncSeparate(J.SRC_ALPHA,J.ONE_MINUS_SRC_ALPHA,J.ONE,J.ONE_MINUS_SRC_ALPHA);break;case QX:J.blendFuncSeparate(J.SRC_ALPHA,J.ONE,J.ONE,J.ONE);break;case ZX:y0("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case KX:y0("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:y0("WebGLState: Invalid blending: ",S);break}R=null,B=null,y=null,_=null,j.set(0,0,0),I=0,F=S,E=H8}return}if(a=a||Z0,r=r||K0,M0=M0||I0,Z0!==O||a!==L)J.blendEquationSeparate(e0[Z0],e0[a]),O=Z0,L=a;if(K0!==R||I0!==B||r!==y||M0!==_)J.blendFuncSeparate(K8[K0],K8[I0],K8[r],K8[M0]),R=K0,B=I0,y=r,_=M0;if(f0.equals(j)===!1||k8!==I)J.blendColor(f0.r,f0.g,f0.b,k8),j.copy(f0),I=k8;F=S,E=!1}function c0(S,Z0){S.side===e6?V0(J.CULL_FACE):z0(J.CULL_FACE);let K0=S.side===N6;if(Z0)K0=!K0;S8(K0),S.blending===V$&&S.transparent===!1?U8(J7):U8(S.blending,S.blendEquation,S.blendSrc,S.blendDst,S.blendEquationAlpha,S.blendSrcAlpha,S.blendDstAlpha,S.blendColor,S.blendAlpha,S.premultipliedAlpha),X.setFunc(S.depthFunc),X.setTest(S.depthTest),X.setMask(S.depthWrite),W.setMask(S.colorWrite);let I0=S.stencilWrite;if(H.setTest(I0),I0)H.setMask(S.stencilWriteMask),H.setFunc(S.stencilFunc,S.stencilRef,S.stencilFuncMask),H.setOp(S.stencilFail,S.stencilZFail,S.stencilZPass);p0(S.polygonOffset,S.polygonOffsetFactor,S.polygonOffsetUnits),S.alphaToCoverage===!0?z0(J.SAMPLE_ALPHA_TO_COVERAGE):V0(J.SAMPLE_ALPHA_TO_COVERAGE)}function S8(S){if(u!==S){if(S)J.frontFace(J.CW);else J.frontFace(J.CCW);u=S}}function P(S){if(S!==EF){if(z0(J.CULL_FACE),S!==C)if(S===$X)J.cullFace(J.BACK);else if(S===PF)J.cullFace(J.FRONT);else J.cullFace(J.FRONT_AND_BACK)}else V0(J.CULL_FACE);C=S}function m8(S){if(S!==p){if(d)J.lineWidth(S);p=S}}function p0(S,Z0,K0){if(S){if(z0(J.POLYGON_OFFSET_FILL),n!==Z0||f!==K0){if(n=Z0,f=K0,X.getReversed())Z0=-Z0;J.polygonOffset(Z0,K0)}}else V0(J.POLYGON_OFFSET_FILL)}function w8(S){if(S)z0(J.SCISSOR_TEST);else V0(J.SCISSOR_TEST)}function A0(S){if(S===void 0)S=J.TEXTURE0+i-1;if($0!==S)J.activeTexture(S),$0=S}function D8(S,Z0,K0){if(K0===void 0)if($0===null)K0=J.TEXTURE0+i-1;else K0=$0;let I0=U0[K0];if(I0===void 0)I0={type:void 0,texture:void 0},U0[K0]=I0;if(I0.type!==S||I0.texture!==Z0){if($0!==K0)J.activeTexture(K0),$0=K0;J.bindTexture(S,Z0||W0[S]),I0.type=S,I0.texture=Z0}}function G(){let S=U0[$0];if(S!==void 0&&S.type!==void 0)J.bindTexture(S.type,null),S.type=void 0,S.texture=void 0}function k(){try{J.compressedTexImage2D(...arguments)}catch(S){y0("WebGLState:",S)}}function v(){try{J.compressedTexImage3D(...arguments)}catch(S){y0("WebGLState:",S)}}function s(){try{J.texSubImage2D(...arguments)}catch(S){y0("WebGLState:",S)}}function t(){try{J.texSubImage3D(...arguments)}catch(S){y0("WebGLState:",S)}}function c(){try{J.compressedTexSubImage2D(...arguments)}catch(S){y0("WebGLState:",S)}}function D0(){try{J.compressedTexSubImage3D(...arguments)}catch(S){y0("WebGLState:",S)}}function X0(){try{J.texStorage2D(...arguments)}catch(S){y0("WebGLState:",S)}}function E0(){try{J.texStorage3D(...arguments)}catch(S){y0("WebGLState:",S)}}function T0(){try{J.texImage2D(...arguments)}catch(S){y0("WebGLState:",S)}}function e(){try{J.texImage3D(...arguments)}catch(S){y0("WebGLState:",S)}}function Q0(S){if(M8.equals(S)===!1)J.scissor(S.x,S.y,S.z,S.w),M8.copy(S)}function w0(S){if(X8.equals(S)===!1)J.viewport(S.x,S.y,S.z,S.w),X8.copy(S)}function j0(S,Z0){let K0=Y.get(Z0);if(K0===void 0)K0=new WeakMap,Y.set(Z0,K0);let I0=K0.get(S);if(I0===void 0)I0=J.getUniformBlockIndex(Z0,S.name),K0.set(S,I0)}function O0(S,Z0){let I0=Y.get(Z0).get(S);if(q.get(Z0)!==I0)J.uniformBlockBinding(Z0,I0,S.__bindingPointIndex),q.set(Z0,I0)}function m0(){J.disable(J.BLEND),J.disable(J.CULL_FACE),J.disable(J.DEPTH_TEST),J.disable(J.POLYGON_OFFSET_FILL),J.disable(J.SCISSOR_TEST),J.disable(J.STENCIL_TEST),J.disable(J.SAMPLE_ALPHA_TO_COVERAGE),J.blendEquation(J.FUNC_ADD),J.blendFunc(J.ONE,J.ZERO),J.blendFuncSeparate(J.ONE,J.ZERO,J.ONE,J.ZERO),J.blendColor(0,0,0,0),J.colorMask(!0,!0,!0,!0),J.clearColor(0,0,0,0),J.depthMask(!0),J.depthFunc(J.LESS),X.setReversed(!1),J.clearDepth(1),J.stencilMask(4294967295),J.stencilFunc(J.ALWAYS,0,4294967295),J.stencilOp(J.KEEP,J.KEEP,J.KEEP),J.clearStencil(0),J.cullFace(J.BACK),J.frontFace(J.CCW),J.polygonOffset(0,0),J.activeTexture(J.TEXTURE0),J.bindFramebuffer(J.FRAMEBUFFER,null),J.bindFramebuffer(J.DRAW_FRAMEBUFFER,null),J.bindFramebuffer(J.READ_FRAMEBUFFER,null),J.useProgram(null),J.lineWidth(1),J.scissor(0,0,J.canvas.width,J.canvas.height),J.viewport(0,0,J.canvas.width,J.canvas.height),N={},$0=null,U0={},U={},V=new WeakMap,z=[],D=null,w=!1,F=null,O=null,R=null,B=null,L=null,y=null,_=null,j=new l0(0,0,0),I=0,E=!1,u=null,C=null,p=null,n=null,f=null,M8.set(0,0,J.canvas.width,J.canvas.height),X8.set(0,0,J.canvas.width,J.canvas.height),W.reset(),X.reset(),H.reset()}return{buffers:{color:W,depth:X,stencil:H},enable:z0,disable:V0,bindFramebuffer:S0,drawBuffers:r0,useProgram:t0,setBlending:U8,setMaterial:c0,setFlipSided:S8,setCullFace:P,setLineWidth:m8,setPolygonOffset:p0,setScissorTest:w8,activeTexture:A0,bindTexture:D8,unbindTexture:G,compressedTexImage2D:k,compressedTexImage3D:v,texImage2D:T0,texImage3D:e,updateUBOMapping:j0,uniformBlockBinding:O0,texStorage2D:X0,texStorage3D:E0,texSubImage2D:s,texSubImage3D:t,compressedTexSubImage2D:c,compressedTexSubImage3D:D0,scissor:Q0,viewport:w0,reset:m0}}function mR(J,$,Q,Z,K,W,X){let H=$.has("WEBGL_multisampled_render_to_texture")?$.get("WEBGL_multisampled_render_to_texture"):null,q=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),Y=new Q8,N=new WeakMap,U,V=new WeakMap,z=!1;try{z=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(G){}function D(G,k){return z?new OffscreenCanvas(G,k):Y$("canvas")}function w(G,k,v){let s=1,t=D8(G);if(t.width>v||t.height>v)s=v/Math.max(t.width,t.height);if(s<1)if(typeof HTMLImageElement<"u"&&G instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&G instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&G instanceof ImageBitmap||typeof VideoFrame<"u"&&G instanceof VideoFrame){let c=Math.floor(s*t.width),D0=Math.floor(s*t.height);if(U===void 0)U=D(c,D0);let X0=k?D(c,D0):U;return X0.width=c,X0.height=D0,X0.getContext("2d").drawImage(G,0,0,c,D0),b0("WebGLRenderer: Texture has been resized from ("+t.width+"x"+t.height+") to ("+c+"x"+D0+")."),X0}else{if("data"in G)b0("WebGLRenderer: Image in DataTexture is too big ("+t.width+"x"+t.height+").");return G}return G}function F(G){return G.generateMipmaps}function O(G){J.generateMipmap(G)}function R(G){if(G.isWebGLCubeRenderTarget)return J.TEXTURE_CUBE_MAP;if(G.isWebGL3DRenderTarget)return J.TEXTURE_3D;if(G.isWebGLArrayRenderTarget||G.isCompressedArrayTexture)return J.TEXTURE_2D_ARRAY;return J.TEXTURE_2D}function B(G,k,v,s,t=!1){if(G!==null){if(J[G]!==void 0)return J[G];b0("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+G+"'")}let c=k;if(k===J.RED){if(v===J.FLOAT)c=J.R32F;if(v===J.HALF_FLOAT)c=J.R16F;if(v===J.UNSIGNED_BYTE)c=J.R8}if(k===J.RED_INTEGER){if(v===J.UNSIGNED_BYTE)c=J.R8UI;if(v===J.UNSIGNED_SHORT)c=J.R16UI;if(v===J.UNSIGNED_INT)c=J.R32UI;if(v===J.BYTE)c=J.R8I;if(v===J.SHORT)c=J.R16I;if(v===J.INT)c=J.R32I}if(k===J.RG){if(v===J.FLOAT)c=J.RG32F;if(v===J.HALF_FLOAT)c=J.RG16F;if(v===J.UNSIGNED_BYTE)c=J.RG8}if(k===J.RG_INTEGER){if(v===J.UNSIGNED_BYTE)c=J.RG8UI;if(v===J.UNSIGNED_SHORT)c=J.RG16UI;if(v===J.UNSIGNED_INT)c=J.RG32UI;if(v===J.BYTE)c=J.RG8I;if(v===J.SHORT)c=J.RG16I;if(v===J.INT)c=J.RG32I}if(k===J.RGB_INTEGER){if(v===J.UNSIGNED_BYTE)c=J.RGB8UI;if(v===J.UNSIGNED_SHORT)c=J.RGB16UI;if(v===J.UNSIGNED_INT)c=J.RGB32UI;if(v===J.BYTE)c=J.RGB8I;if(v===J.SHORT)c=J.RGB16I;if(v===J.INT)c=J.RGB32I}if(k===J.RGBA_INTEGER){if(v===J.UNSIGNED_BYTE)c=J.RGBA8UI;if(v===J.UNSIGNED_SHORT)c=J.RGBA16UI;if(v===J.UNSIGNED_INT)c=J.RGBA32UI;if(v===J.BYTE)c=J.RGBA8I;if(v===J.SHORT)c=J.RGBA16I;if(v===J.INT)c=J.RGBA32I}if(k===J.RGB){if(v===J.UNSIGNED_INT_5_9_9_9_REV)c=J.RGB9_E5;if(v===J.UNSIGNED_INT_10F_11F_11F_REV)c=J.R11F_G11F_B10F}if(k===J.RGBA){let D0=t?rX:a0.getTransfer(s);if(v===J.FLOAT)c=J.RGBA32F;if(v===J.HALF_FLOAT)c=J.RGBA16F;if(v===J.UNSIGNED_BYTE)c=D0===z8?J.SRGB8_ALPHA8:J.RGBA8;if(v===J.UNSIGNED_SHORT_4_4_4_4)c=J.RGBA4;if(v===J.UNSIGNED_SHORT_5_5_5_1)c=J.RGB5_A1}if(c===J.R16F||c===J.R32F||c===J.RG16F||c===J.RG32F||c===J.RGBA16F||c===J.RGBA32F)$.get("EXT_color_buffer_float");return c}function L(G,k){let v;if(G){if(k===null||k===l7||k===D9)v=J.DEPTH24_STENCIL8;else if(k===M7)v=J.DEPTH32F_STENCIL8;else if(k===z$)v=J.DEPTH24_STENCIL8,b0("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(k===null||k===l7||k===D9)v=J.DEPTH_COMPONENT24;else if(k===M7)v=J.DEPTH_COMPONENT32F;else if(k===z$)v=J.DEPTH_COMPONENT16;return v}function y(G,k){if(F(G)===!0||G.isFramebufferTexture&&G.minFilter!==d7&&G.minFilter!==U6)return Math.log2(Math.max(k.width,k.height))+1;else if(G.mipmaps!==void 0&&G.mipmaps.length>0)return G.mipmaps.length;else if(G.isCompressedTexture&&Array.isArray(G.image))return k.mipmaps.length;else return 1}function _(G){let k=G.target;if(k.removeEventListener("dispose",_),I(k),k.isVideoTexture)N.delete(k)}function j(G){let k=G.target;k.removeEventListener("dispose",j),u(k)}function I(G){let k=Z.get(G);if(k.__webglInit===void 0)return;let v=G.source,s=V.get(v);if(s){let t=s[k.__cacheKey];if(t.usedTimes--,t.usedTimes===0)E(G);if(Object.keys(s).length===0)V.delete(v)}Z.remove(G)}function E(G){let k=Z.get(G);J.deleteTexture(k.__webglTexture);let v=G.source,s=V.get(v);delete s[k.__cacheKey],X.memory.textures--}function u(G){let k=Z.get(G);if(G.depthTexture)G.depthTexture.dispose(),Z.remove(G.depthTexture);if(G.isWebGLCubeRenderTarget)for(let s=0;s<6;s++){if(Array.isArray(k.__webglFramebuffer[s]))for(let t=0;t<k.__webglFramebuffer[s].length;t++)J.deleteFramebuffer(k.__webglFramebuffer[s][t]);else J.deleteFramebuffer(k.__webglFramebuffer[s]);if(k.__webglDepthbuffer)J.deleteRenderbuffer(k.__webglDepthbuffer[s])}else{if(Array.isArray(k.__webglFramebuffer))for(let s=0;s<k.__webglFramebuffer.length;s++)J.deleteFramebuffer(k.__webglFramebuffer[s]);else J.deleteFramebuffer(k.__webglFramebuffer);if(k.__webglDepthbuffer)J.deleteRenderbuffer(k.__webglDepthbuffer);if(k.__webglMultisampledFramebuffer)J.deleteFramebuffer(k.__webglMultisampledFramebuffer);if(k.__webglColorRenderbuffer){for(let s=0;s<k.__webglColorRenderbuffer.length;s++)if(k.__webglColorRenderbuffer[s])J.deleteRenderbuffer(k.__webglColorRenderbuffer[s])}if(k.__webglDepthRenderbuffer)J.deleteRenderbuffer(k.__webglDepthRenderbuffer)}let v=G.textures;for(let s=0,t=v.length;s<t;s++){let c=Z.get(v[s]);if(c.__webglTexture)J.deleteTexture(c.__webglTexture),X.memory.textures--;Z.remove(v[s])}Z.remove(G)}let C=0;function p(){C=0}function n(){let G=C;if(G>=K.maxTextures)b0("WebGLTextures: Trying to use "+G+" texture units while this GPU supports only "+K.maxTextures);return C+=1,G}function f(G){let k=[];return k.push(G.wrapS),k.push(G.wrapT),k.push(G.wrapR||0),k.push(G.magFilter),k.push(G.minFilter),k.push(G.anisotropy),k.push(G.internalFormat),k.push(G.format),k.push(G.type),k.push(G.generateMipmaps),k.push(G.premultiplyAlpha),k.push(G.flipY),k.push(G.unpackAlignment),k.push(G.colorSpace),k.join()}function i(G,k){let v=Z.get(G);if(G.isVideoTexture)w8(G);if(G.isRenderTargetTexture===!1&&G.isExternalTexture!==!0&&G.version>0&&v.__version!==G.version){let s=G.image;if(s===null)b0("WebGLRenderer: Texture marked for update but no image data found.");else if(s.complete===!1)b0("WebGLRenderer: Texture marked for update but image is incomplete");else{W0(v,G,k);return}}else if(G.isExternalTexture)v.__webglTexture=G.sourceTexture?G.sourceTexture:null;Q.bindTexture(J.TEXTURE_2D,v.__webglTexture,J.TEXTURE0+k)}function d(G,k){let v=Z.get(G);if(G.isRenderTargetTexture===!1&&G.version>0&&v.__version!==G.version){W0(v,G,k);return}else if(G.isExternalTexture)v.__webglTexture=G.sourceTexture?G.sourceTexture:null;Q.bindTexture(J.TEXTURE_2D_ARRAY,v.__webglTexture,J.TEXTURE0+k)}function m(G,k){let v=Z.get(G);if(G.isRenderTargetTexture===!1&&G.version>0&&v.__version!==G.version){W0(v,G,k);return}Q.bindTexture(J.TEXTURE_3D,v.__webglTexture,J.TEXTURE0+k)}function J0(G,k){let v=Z.get(G);if(G.isCubeDepthTexture!==!0&&G.version>0&&v.__version!==G.version){z0(v,G,k);return}Q.bindTexture(J.TEXTURE_CUBE_MAP,v.__webglTexture,J.TEXTURE0+k)}let $0={[Hz]:J.REPEAT,[fZ]:J.CLAMP_TO_EDGE,[qz]:J.MIRRORED_REPEAT},U0={[d7]:J.NEAREST,[Yz]:J.NEAREST_MIPMAP_NEAREST,[F$]:J.NEAREST_MIPMAP_LINEAR,[U6]:J.LINEAR,[hZ]:J.LINEAR_MIPMAP_NEAREST,[UJ]:J.LINEAR_MIPMAP_LINEAR},C0={[Mz]:J.NEVER,[Az]:J.ALWAYS,[Gz]:J.LESS,[dZ]:J.LEQUAL,[Rz]:J.EQUAL,[lZ]:J.GEQUAL,[Lz]:J.GREATER,[Bz]:J.NOTEQUAL};function N0(G,k){if(k.type===M7&&$.has("OES_texture_float_linear")===!1&&(k.magFilter===U6||k.magFilter===hZ||k.magFilter===F$||k.magFilter===UJ||k.minFilter===U6||k.minFilter===hZ||k.minFilter===F$||k.minFilter===UJ))b0("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(J.texParameteri(G,J.TEXTURE_WRAP_S,$0[k.wrapS]),J.texParameteri(G,J.TEXTURE_WRAP_T,$0[k.wrapT]),G===J.TEXTURE_3D||G===J.TEXTURE_2D_ARRAY)J.texParameteri(G,J.TEXTURE_WRAP_R,$0[k.wrapR]);if(J.texParameteri(G,J.TEXTURE_MAG_FILTER,U0[k.magFilter]),J.texParameteri(G,J.TEXTURE_MIN_FILTER,U0[k.minFilter]),k.compareFunction)J.texParameteri(G,J.TEXTURE_COMPARE_MODE,J.COMPARE_REF_TO_TEXTURE),J.texParameteri(G,J.TEXTURE_COMPARE_FUNC,C0[k.compareFunction]);if($.has("EXT_texture_filter_anisotropic")===!0){if(k.magFilter===d7)return;if(k.minFilter!==F$&&k.minFilter!==UJ)return;if(k.type===M7&&$.has("OES_texture_float_linear")===!1)return;if(k.anisotropy>1||Z.get(k).__currentAnisotropy){let v=$.get("EXT_texture_filter_anisotropic");J.texParameterf(G,v.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(k.anisotropy,K.getMaxAnisotropy())),Z.get(k).__currentAnisotropy=k.anisotropy}}}function M8(G,k){let v=!1;if(G.__webglInit===void 0)G.__webglInit=!0,k.addEventListener("dispose",_);let s=k.source,t=V.get(s);if(t===void 0)t={},V.set(s,t);let c=f(k);if(c!==G.__cacheKey){if(t[c]===void 0)t[c]={texture:J.createTexture(),usedTimes:0},X.memory.textures++,v=!0;t[c].usedTimes++;let D0=t[G.__cacheKey];if(D0!==void 0){if(t[G.__cacheKey].usedTimes--,D0.usedTimes===0)E(k)}G.__cacheKey=c,G.__webglTexture=t[c].texture}return v}function X8(G,k,v){return Math.floor(Math.floor(G/v)/k)}function o(G,k,v,s){let c=G.updateRanges;if(c.length===0)Q.texSubImage2D(J.TEXTURE_2D,0,0,0,k.width,k.height,v,s,k.data);else{c.sort((e,Q0)=>e.start-Q0.start);let D0=0;for(let e=1;e<c.length;e++){let Q0=c[D0],w0=c[e],j0=Q0.start+Q0.count,O0=X8(w0.start,k.width,4),m0=X8(Q0.start,k.width,4);if(w0.start<=j0+1&&O0===m0&&X8(w0.start+w0.count-1,k.width,4)===O0)Q0.count=Math.max(Q0.count,w0.start+w0.count-Q0.start);else++D0,c[D0]=w0}c.length=D0+1;let X0=J.getParameter(J.UNPACK_ROW_LENGTH),E0=J.getParameter(J.UNPACK_SKIP_PIXELS),T0=J.getParameter(J.UNPACK_SKIP_ROWS);J.pixelStorei(J.UNPACK_ROW_LENGTH,k.width);for(let e=0,Q0=c.length;e<Q0;e++){let w0=c[e],j0=Math.floor(w0.start/4),O0=Math.ceil(w0.count/4),m0=j0%k.width,S=Math.floor(j0/k.width),Z0=O0,K0=1;J.pixelStorei(J.UNPACK_SKIP_PIXELS,m0),J.pixelStorei(J.UNPACK_SKIP_ROWS,S),Q.texSubImage2D(J.TEXTURE_2D,0,m0,S,Z0,1,v,s,k.data)}G.clearUpdateRanges(),J.pixelStorei(J.UNPACK_ROW_LENGTH,X0),J.pixelStorei(J.UNPACK_SKIP_PIXELS,E0),J.pixelStorei(J.UNPACK_SKIP_ROWS,T0)}}function W0(G,k,v){let s=J.TEXTURE_2D;if(k.isDataArrayTexture||k.isCompressedArrayTexture)s=J.TEXTURE_2D_ARRAY;if(k.isData3DTexture)s=J.TEXTURE_3D;let t=M8(G,k),c=k.source;Q.bindTexture(s,G.__webglTexture,J.TEXTURE0+v);let D0=Z.get(c);if(c.version!==D0.__version||t===!0){Q.activeTexture(J.TEXTURE0+v);let X0=a0.getPrimaries(a0.workingColorSpace),E0=k.colorSpace===FJ?null:a0.getPrimaries(k.colorSpace),T0=k.colorSpace===FJ||X0===E0?J.NONE:J.BROWSER_DEFAULT_WEBGL;J.pixelStorei(J.UNPACK_FLIP_Y_WEBGL,k.flipY),J.pixelStorei(J.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),J.pixelStorei(J.UNPACK_ALIGNMENT,k.unpackAlignment),J.pixelStorei(J.UNPACK_COLORSPACE_CONVERSION_WEBGL,T0);let e=w(k.image,!1,K.maxTextureSize);e=A0(k,e);let Q0=W.convert(k.format,k.colorSpace),w0=W.convert(k.type),j0=B(k.internalFormat,Q0,w0,k.colorSpace,k.isVideoTexture);N0(s,k);let O0,m0=k.mipmaps,S=k.isVideoTexture!==!0,Z0=D0.__version===void 0||t===!0,K0=c.dataReady,I0=y(k,e);if(k.isDepthTexture){if(j0=L(k.format===OJ,k.type),Z0)if(S)Q.texStorage2D(J.TEXTURE_2D,1,j0,e.width,e.height);else Q.texImage2D(J.TEXTURE_2D,0,j0,e.width,e.height,0,Q0,w0,null)}else if(k.isDataTexture)if(m0.length>0){if(S&&Z0)Q.texStorage2D(J.TEXTURE_2D,I0,j0,m0[0].width,m0[0].height);for(let a=0,r=m0.length;a<r;a++)if(O0=m0[a],S){if(K0)Q.texSubImage2D(J.TEXTURE_2D,a,0,0,O0.width,O0.height,Q0,w0,O0.data)}else Q.texImage2D(J.TEXTURE_2D,a,j0,O0.width,O0.height,0,Q0,w0,O0.data);k.generateMipmaps=!1}else if(S){if(Z0)Q.texStorage2D(J.TEXTURE_2D,I0,j0,e.width,e.height);if(K0)o(k,e,Q0,w0)}else Q.texImage2D(J.TEXTURE_2D,0,j0,e.width,e.height,0,Q0,w0,e.data);else if(k.isCompressedTexture)if(k.isCompressedArrayTexture){if(S&&Z0)Q.texStorage3D(J.TEXTURE_2D_ARRAY,I0,j0,m0[0].width,m0[0].height,e.depth);for(let a=0,r=m0.length;a<r;a++)if(O0=m0[a],k.format!==$7)if(Q0!==null)if(S){if(K0)if(k.layerUpdates.size>0){let M0=BH(O0.width,O0.height,k.format,k.type);for(let f0 of k.layerUpdates){let k8=O0.data.subarray(f0*M0/O0.data.BYTES_PER_ELEMENT,(f0+1)*M0/O0.data.BYTES_PER_ELEMENT);Q.compressedTexSubImage3D(J.TEXTURE_2D_ARRAY,a,0,0,f0,O0.width,O0.height,1,Q0,k8)}k.clearLayerUpdates()}else Q.compressedTexSubImage3D(J.TEXTURE_2D_ARRAY,a,0,0,0,O0.width,O0.height,e.depth,Q0,O0.data)}else Q.compressedTexImage3D(J.TEXTURE_2D_ARRAY,a,j0,O0.width,O0.height,e.depth,0,O0.data,0,0);else b0("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(S){if(K0)Q.texSubImage3D(J.TEXTURE_2D_ARRAY,a,0,0,0,O0.width,O0.height,e.depth,Q0,w0,O0.data)}else Q.texImage3D(J.TEXTURE_2D_ARRAY,a,j0,O0.width,O0.height,e.depth,0,Q0,w0,O0.data)}else{if(S&&Z0)Q.texStorage2D(J.TEXTURE_2D,I0,j0,m0[0].width,m0[0].height);for(let a=0,r=m0.length;a<r;a++)if(O0=m0[a],k.format!==$7)if(Q0!==null)if(S){if(K0)Q.compressedTexSubImage2D(J.TEXTURE_2D,a,0,0,O0.width,O0.height,Q0,O0.data)}else Q.compressedTexImage2D(J.TEXTURE_2D,a,j0,O0.width,O0.height,0,O0.data);else b0("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(S){if(K0)Q.texSubImage2D(J.TEXTURE_2D,a,0,0,O0.width,O0.height,Q0,w0,O0.data)}else Q.texImage2D(J.TEXTURE_2D,a,j0,O0.width,O0.height,0,Q0,w0,O0.data)}else if(k.isDataArrayTexture)if(S){if(Z0)Q.texStorage3D(J.TEXTURE_2D_ARRAY,I0,j0,e.width,e.height,e.depth);if(K0)if(k.layerUpdates.size>0){let a=BH(e.width,e.height,k.format,k.type);for(let r of k.layerUpdates){let M0=e.data.subarray(r*a/e.data.BYTES_PER_ELEMENT,(r+1)*a/e.data.BYTES_PER_ELEMENT);Q.texSubImage3D(J.TEXTURE_2D_ARRAY,0,0,0,r,e.width,e.height,1,Q0,w0,M0)}k.clearLayerUpdates()}else Q.texSubImage3D(J.TEXTURE_2D_ARRAY,0,0,0,0,e.width,e.height,e.depth,Q0,w0,e.data)}else Q.texImage3D(J.TEXTURE_2D_ARRAY,0,j0,e.width,e.height,e.depth,0,Q0,w0,e.data);else if(k.isData3DTexture)if(S){if(Z0)Q.texStorage3D(J.TEXTURE_3D,I0,j0,e.width,e.height,e.depth);if(K0)Q.texSubImage3D(J.TEXTURE_3D,0,0,0,0,e.width,e.height,e.depth,Q0,w0,e.data)}else Q.texImage3D(J.TEXTURE_3D,0,j0,e.width,e.height,e.depth,0,Q0,w0,e.data);else if(k.isFramebufferTexture){if(Z0)if(S)Q.texStorage2D(J.TEXTURE_2D,I0,j0,e.width,e.height);else{let{width:a,height:r}=e;for(let M0=0;M0<I0;M0++)Q.texImage2D(J.TEXTURE_2D,M0,j0,a,r,0,Q0,w0,null),a>>=1,r>>=1}}else if(m0.length>0){if(S&&Z0){let a=D8(m0[0]);Q.texStorage2D(J.TEXTURE_2D,I0,j0,a.width,a.height)}for(let a=0,r=m0.length;a<r;a++)if(O0=m0[a],S){if(K0)Q.texSubImage2D(J.TEXTURE_2D,a,0,0,Q0,w0,O0)}else Q.texImage2D(J.TEXTURE_2D,a,j0,Q0,w0,O0);k.generateMipmaps=!1}else if(S){if(Z0){let a=D8(e);Q.texStorage2D(J.TEXTURE_2D,I0,j0,a.width,a.height)}if(K0)Q.texSubImage2D(J.TEXTURE_2D,0,0,0,Q0,w0,e)}else Q.texImage2D(J.TEXTURE_2D,0,j0,Q0,w0,e);if(F(k))O(s);if(D0.__version=c.version,k.onUpdate)k.onUpdate(k)}G.__version=k.version}function z0(G,k,v){if(k.image.length!==6)return;let s=M8(G,k),t=k.source;Q.bindTexture(J.TEXTURE_CUBE_MAP,G.__webglTexture,J.TEXTURE0+v);let c=Z.get(t);if(t.version!==c.__version||s===!0){Q.activeTexture(J.TEXTURE0+v);let D0=a0.getPrimaries(a0.workingColorSpace),X0=k.colorSpace===FJ?null:a0.getPrimaries(k.colorSpace),E0=k.colorSpace===FJ||D0===X0?J.NONE:J.BROWSER_DEFAULT_WEBGL;J.pixelStorei(J.UNPACK_FLIP_Y_WEBGL,k.flipY),J.pixelStorei(J.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),J.pixelStorei(J.UNPACK_ALIGNMENT,k.unpackAlignment),J.pixelStorei(J.UNPACK_COLORSPACE_CONVERSION_WEBGL,E0);let T0=k.isCompressedTexture||k.image[0].isCompressedTexture,e=k.image[0]&&k.image[0].isDataTexture,Q0=[];for(let r=0;r<6;r++){if(!T0&&!e)Q0[r]=w(k.image[r],!0,K.maxCubemapSize);else Q0[r]=e?k.image[r].image:k.image[r];Q0[r]=A0(k,Q0[r])}let w0=Q0[0],j0=W.convert(k.format,k.colorSpace),O0=W.convert(k.type),m0=B(k.internalFormat,j0,O0,k.colorSpace),S=k.isVideoTexture!==!0,Z0=c.__version===void 0||s===!0,K0=t.dataReady,I0=y(k,w0);N0(J.TEXTURE_CUBE_MAP,k);let a;if(T0){if(S&&Z0)Q.texStorage2D(J.TEXTURE_CUBE_MAP,I0,m0,w0.width,w0.height);for(let r=0;r<6;r++){a=Q0[r].mipmaps;for(let M0=0;M0<a.length;M0++){let f0=a[M0];if(k.format!==$7)if(j0!==null)if(S){if(K0)Q.compressedTexSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,M0,0,0,f0.width,f0.height,j0,f0.data)}else Q.compressedTexImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,M0,m0,f0.width,f0.height,0,f0.data);else b0("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(S){if(K0)Q.texSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,M0,0,0,f0.width,f0.height,j0,O0,f0.data)}else Q.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,M0,m0,f0.width,f0.height,0,j0,O0,f0.data)}}}else{if(a=k.mipmaps,S&&Z0){if(a.length>0)I0++;let r=D8(Q0[0]);Q.texStorage2D(J.TEXTURE_CUBE_MAP,I0,m0,r.width,r.height)}for(let r=0;r<6;r++)if(e){if(S){if(K0)Q.texSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,0,0,Q0[r].width,Q0[r].height,j0,O0,Q0[r].data)}else Q.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,m0,Q0[r].width,Q0[r].height,0,j0,O0,Q0[r].data);for(let M0=0;M0<a.length;M0++){let k8=a[M0].image[r].image;if(S){if(K0)Q.texSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,M0+1,0,0,k8.width,k8.height,j0,O0,k8.data)}else Q.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,M0+1,m0,k8.width,k8.height,0,j0,O0,k8.data)}}else{if(S){if(K0)Q.texSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,0,0,j0,O0,Q0[r])}else Q.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,m0,j0,O0,Q0[r]);for(let M0=0;M0<a.length;M0++){let f0=a[M0];if(S){if(K0)Q.texSubImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,M0+1,0,0,j0,O0,f0.image[r])}else Q.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+r,M0+1,m0,j0,O0,f0.image[r])}}}if(F(k))O(J.TEXTURE_CUBE_MAP);if(c.__version=t.version,k.onUpdate)k.onUpdate(k)}G.__version=k.version}function V0(G,k,v,s,t,c){let D0=W.convert(v.format,v.colorSpace),X0=W.convert(v.type),E0=B(v.internalFormat,D0,X0,v.colorSpace),T0=Z.get(k),e=Z.get(v);if(e.__renderTarget=k,!T0.__hasExternalTextures){let Q0=Math.max(1,k.width>>c),w0=Math.max(1,k.height>>c);if(t===J.TEXTURE_3D||t===J.TEXTURE_2D_ARRAY)Q.texImage3D(t,c,E0,Q0,w0,k.depth,0,D0,X0,null);else Q.texImage2D(t,c,E0,Q0,w0,0,D0,X0,null)}if(Q.bindFramebuffer(J.FRAMEBUFFER,G),p0(k))H.framebufferTexture2DMultisampleEXT(J.FRAMEBUFFER,s,t,e.__webglTexture,0,m8(k));else if(t===J.TEXTURE_2D||t>=J.TEXTURE_CUBE_MAP_POSITIVE_X&&t<=J.TEXTURE_CUBE_MAP_NEGATIVE_Z)J.framebufferTexture2D(J.FRAMEBUFFER,s,t,e.__webglTexture,c);Q.bindFramebuffer(J.FRAMEBUFFER,null)}function S0(G,k,v){if(J.bindRenderbuffer(J.RENDERBUFFER,G),k.depthBuffer){let s=k.depthTexture,t=s&&s.isDepthTexture?s.type:null,c=L(k.stencilBuffer,t),D0=k.stencilBuffer?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT;if(p0(k))H.renderbufferStorageMultisampleEXT(J.RENDERBUFFER,m8(k),c,k.width,k.height);else if(v)J.renderbufferStorageMultisample(J.RENDERBUFFER,m8(k),c,k.width,k.height);else J.renderbufferStorage(J.RENDERBUFFER,c,k.width,k.height);J.framebufferRenderbuffer(J.FRAMEBUFFER,D0,J.RENDERBUFFER,G)}else{let s=k.textures;for(let t=0;t<s.length;t++){let c=s[t],D0=W.convert(c.format,c.colorSpace),X0=W.convert(c.type),E0=B(c.internalFormat,D0,X0,c.colorSpace);if(p0(k))H.renderbufferStorageMultisampleEXT(J.RENDERBUFFER,m8(k),E0,k.width,k.height);else if(v)J.renderbufferStorageMultisample(J.RENDERBUFFER,m8(k),E0,k.width,k.height);else J.renderbufferStorage(J.RENDERBUFFER,E0,k.width,k.height)}}J.bindRenderbuffer(J.RENDERBUFFER,null)}function r0(G,k,v){let s=k.isWebGLCubeRenderTarget===!0;if(Q.bindFramebuffer(J.FRAMEBUFFER,G),!(k.depthTexture&&k.depthTexture.isDepthTexture))throw Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let t=Z.get(k.depthTexture);if(t.__renderTarget=k,!t.__webglTexture||k.depthTexture.image.width!==k.width||k.depthTexture.image.height!==k.height)k.depthTexture.image.width=k.width,k.depthTexture.image.height=k.height,k.depthTexture.needsUpdate=!0;if(s){if(t.__webglInit===void 0)t.__webglInit=!0,k.depthTexture.addEventListener("dispose",_);if(t.__webglTexture===void 0){t.__webglTexture=J.createTexture(),Q.bindTexture(J.TEXTURE_CUBE_MAP,t.__webglTexture),N0(J.TEXTURE_CUBE_MAP,k.depthTexture);let T0=W.convert(k.depthTexture.format),e=W.convert(k.depthTexture.type),Q0;if(k.depthTexture.format===VJ)Q0=J.DEPTH_COMPONENT24;else if(k.depthTexture.format===OJ)Q0=J.DEPTH24_STENCIL8;for(let w0=0;w0<6;w0++)J.texImage2D(J.TEXTURE_CUBE_MAP_POSITIVE_X+w0,0,Q0,k.width,k.height,0,T0,e,null)}}else i(k.depthTexture,0);let c=t.__webglTexture,D0=m8(k),X0=s?J.TEXTURE_CUBE_MAP_POSITIVE_X+v:J.TEXTURE_2D,E0=k.depthTexture.format===OJ?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT;if(k.depthTexture.format===VJ)if(p0(k))H.framebufferTexture2DMultisampleEXT(J.FRAMEBUFFER,E0,X0,c,0,D0);else J.framebufferTexture2D(J.FRAMEBUFFER,E0,X0,c,0);else if(k.depthTexture.format===OJ)if(p0(k))H.framebufferTexture2DMultisampleEXT(J.FRAMEBUFFER,E0,X0,c,0,D0);else J.framebufferTexture2D(J.FRAMEBUFFER,E0,X0,c,0);else throw Error("Unknown depthTexture format")}function t0(G){let k=Z.get(G),v=G.isWebGLCubeRenderTarget===!0;if(k.__boundDepthTexture!==G.depthTexture){let s=G.depthTexture;if(k.__depthDisposeCallback)k.__depthDisposeCallback();if(s){let t=()=>{delete k.__boundDepthTexture,delete k.__depthDisposeCallback,s.removeEventListener("dispose",t)};s.addEventListener("dispose",t),k.__depthDisposeCallback=t}k.__boundDepthTexture=s}if(G.depthTexture&&!k.__autoAllocateDepthBuffer)if(v)for(let s=0;s<6;s++)r0(k.__webglFramebuffer[s],G,s);else{let s=G.texture.mipmaps;if(s&&s.length>0)r0(k.__webglFramebuffer[0],G,0);else r0(k.__webglFramebuffer,G,0)}else if(v){k.__webglDepthbuffer=[];for(let s=0;s<6;s++)if(Q.bindFramebuffer(J.FRAMEBUFFER,k.__webglFramebuffer[s]),k.__webglDepthbuffer[s]===void 0)k.__webglDepthbuffer[s]=J.createRenderbuffer(),S0(k.__webglDepthbuffer[s],G,!1);else{let t=G.stencilBuffer?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT,c=k.__webglDepthbuffer[s];J.bindRenderbuffer(J.RENDERBUFFER,c),J.framebufferRenderbuffer(J.FRAMEBUFFER,t,J.RENDERBUFFER,c)}}else{let s=G.texture.mipmaps;if(s&&s.length>0)Q.bindFramebuffer(J.FRAMEBUFFER,k.__webglFramebuffer[0]);else Q.bindFramebuffer(J.FRAMEBUFFER,k.__webglFramebuffer);if(k.__webglDepthbuffer===void 0)k.__webglDepthbuffer=J.createRenderbuffer(),S0(k.__webglDepthbuffer,G,!1);else{let t=G.stencilBuffer?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT,c=k.__webglDepthbuffer;J.bindRenderbuffer(J.RENDERBUFFER,c),J.framebufferRenderbuffer(J.FRAMEBUFFER,t,J.RENDERBUFFER,c)}}Q.bindFramebuffer(J.FRAMEBUFFER,null)}function e0(G,k,v){let s=Z.get(G);if(k!==void 0)V0(s.__webglFramebuffer,G,G.texture,J.COLOR_ATTACHMENT0,J.TEXTURE_2D,0);if(v!==void 0)t0(G)}function K8(G){let k=G.texture,v=Z.get(G),s=Z.get(k);G.addEventListener("dispose",j);let t=G.textures,c=G.isWebGLCubeRenderTarget===!0,D0=t.length>1;if(!D0){if(s.__webglTexture===void 0)s.__webglTexture=J.createTexture();s.__version=k.version,X.memory.textures++}if(c){v.__webglFramebuffer=[];for(let X0=0;X0<6;X0++)if(k.mipmaps&&k.mipmaps.length>0){v.__webglFramebuffer[X0]=[];for(let E0=0;E0<k.mipmaps.length;E0++)v.__webglFramebuffer[X0][E0]=J.createFramebuffer()}else v.__webglFramebuffer[X0]=J.createFramebuffer()}else{if(k.mipmaps&&k.mipmaps.length>0){v.__webglFramebuffer=[];for(let X0=0;X0<k.mipmaps.length;X0++)v.__webglFramebuffer[X0]=J.createFramebuffer()}else v.__webglFramebuffer=J.createFramebuffer();if(D0)for(let X0=0,E0=t.length;X0<E0;X0++){let T0=Z.get(t[X0]);if(T0.__webglTexture===void 0)T0.__webglTexture=J.createTexture(),X.memory.textures++}if(G.samples>0&&p0(G)===!1){v.__webglMultisampledFramebuffer=J.createFramebuffer(),v.__webglColorRenderbuffer=[],Q.bindFramebuffer(J.FRAMEBUFFER,v.__webglMultisampledFramebuffer);for(let X0=0;X0<t.length;X0++){let E0=t[X0];v.__webglColorRenderbuffer[X0]=J.createRenderbuffer(),J.bindRenderbuffer(J.RENDERBUFFER,v.__webglColorRenderbuffer[X0]);let T0=W.convert(E0.format,E0.colorSpace),e=W.convert(E0.type),Q0=B(E0.internalFormat,T0,e,E0.colorSpace,G.isXRRenderTarget===!0),w0=m8(G);J.renderbufferStorageMultisample(J.RENDERBUFFER,w0,Q0,G.width,G.height),J.framebufferRenderbuffer(J.FRAMEBUFFER,J.COLOR_ATTACHMENT0+X0,J.RENDERBUFFER,v.__webglColorRenderbuffer[X0])}if(J.bindRenderbuffer(J.RENDERBUFFER,null),G.depthBuffer)v.__webglDepthRenderbuffer=J.createRenderbuffer(),S0(v.__webglDepthRenderbuffer,G,!0);Q.bindFramebuffer(J.FRAMEBUFFER,null)}}if(c){Q.bindTexture(J.TEXTURE_CUBE_MAP,s.__webglTexture),N0(J.TEXTURE_CUBE_MAP,k);for(let X0=0;X0<6;X0++)if(k.mipmaps&&k.mipmaps.length>0)for(let E0=0;E0<k.mipmaps.length;E0++)V0(v.__webglFramebuffer[X0][E0],G,k,J.COLOR_ATTACHMENT0,J.TEXTURE_CUBE_MAP_POSITIVE_X+X0,E0);else V0(v.__webglFramebuffer[X0],G,k,J.COLOR_ATTACHMENT0,J.TEXTURE_CUBE_MAP_POSITIVE_X+X0,0);if(F(k))O(J.TEXTURE_CUBE_MAP);Q.unbindTexture()}else if(D0){for(let X0=0,E0=t.length;X0<E0;X0++){let T0=t[X0],e=Z.get(T0),Q0=J.TEXTURE_2D;if(G.isWebGL3DRenderTarget||G.isWebGLArrayRenderTarget)Q0=G.isWebGL3DRenderTarget?J.TEXTURE_3D:J.TEXTURE_2D_ARRAY;if(Q.bindTexture(Q0,e.__webglTexture),N0(Q0,T0),V0(v.__webglFramebuffer,G,T0,J.COLOR_ATTACHMENT0+X0,Q0,0),F(T0))O(Q0)}Q.unbindTexture()}else{let X0=J.TEXTURE_2D;if(G.isWebGL3DRenderTarget||G.isWebGLArrayRenderTarget)X0=G.isWebGL3DRenderTarget?J.TEXTURE_3D:J.TEXTURE_2D_ARRAY;if(Q.bindTexture(X0,s.__webglTexture),N0(X0,k),k.mipmaps&&k.mipmaps.length>0)for(let E0=0;E0<k.mipmaps.length;E0++)V0(v.__webglFramebuffer[E0],G,k,J.COLOR_ATTACHMENT0,X0,E0);else V0(v.__webglFramebuffer,G,k,J.COLOR_ATTACHMENT0,X0,0);if(F(k))O(X0);Q.unbindTexture()}if(G.depthBuffer)t0(G)}function U8(G){let k=G.textures;for(let v=0,s=k.length;v<s;v++){let t=k[v];if(F(t)){let c=R(G),D0=Z.get(t).__webglTexture;Q.bindTexture(c,D0),O(c),Q.unbindTexture()}}}let c0=[],S8=[];function P(G){if(G.samples>0){if(p0(G)===!1){let{textures:k,width:v,height:s}=G,t=J.COLOR_BUFFER_BIT,c=G.stencilBuffer?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT,D0=Z.get(G),X0=k.length>1;if(X0)for(let T0=0;T0<k.length;T0++)Q.bindFramebuffer(J.FRAMEBUFFER,D0.__webglMultisampledFramebuffer),J.framebufferRenderbuffer(J.FRAMEBUFFER,J.COLOR_ATTACHMENT0+T0,J.RENDERBUFFER,null),Q.bindFramebuffer(J.FRAMEBUFFER,D0.__webglFramebuffer),J.framebufferTexture2D(J.DRAW_FRAMEBUFFER,J.COLOR_ATTACHMENT0+T0,J.TEXTURE_2D,null,0);Q.bindFramebuffer(J.READ_FRAMEBUFFER,D0.__webglMultisampledFramebuffer);let E0=G.texture.mipmaps;if(E0&&E0.length>0)Q.bindFramebuffer(J.DRAW_FRAMEBUFFER,D0.__webglFramebuffer[0]);else Q.bindFramebuffer(J.DRAW_FRAMEBUFFER,D0.__webglFramebuffer);for(let T0=0;T0<k.length;T0++){if(G.resolveDepthBuffer){if(G.depthBuffer)t|=J.DEPTH_BUFFER_BIT;if(G.stencilBuffer&&G.resolveStencilBuffer)t|=J.STENCIL_BUFFER_BIT}if(X0){J.framebufferRenderbuffer(J.READ_FRAMEBUFFER,J.COLOR_ATTACHMENT0,J.RENDERBUFFER,D0.__webglColorRenderbuffer[T0]);let e=Z.get(k[T0]).__webglTexture;J.framebufferTexture2D(J.DRAW_FRAMEBUFFER,J.COLOR_ATTACHMENT0,J.TEXTURE_2D,e,0)}if(J.blitFramebuffer(0,0,v,s,0,0,v,s,t,J.NEAREST),q===!0){if(c0.length=0,S8.length=0,c0.push(J.COLOR_ATTACHMENT0+T0),G.depthBuffer&&G.resolveDepthBuffer===!1)c0.push(c),S8.push(c),J.invalidateFramebuffer(J.DRAW_FRAMEBUFFER,S8);J.invalidateFramebuffer(J.READ_FRAMEBUFFER,c0)}}if(Q.bindFramebuffer(J.READ_FRAMEBUFFER,null),Q.bindFramebuffer(J.DRAW_FRAMEBUFFER,null),X0)for(let T0=0;T0<k.length;T0++){Q.bindFramebuffer(J.FRAMEBUFFER,D0.__webglMultisampledFramebuffer),J.framebufferRenderbuffer(J.FRAMEBUFFER,J.COLOR_ATTACHMENT0+T0,J.RENDERBUFFER,D0.__webglColorRenderbuffer[T0]);let e=Z.get(k[T0]).__webglTexture;Q.bindFramebuffer(J.FRAMEBUFFER,D0.__webglFramebuffer),J.framebufferTexture2D(J.DRAW_FRAMEBUFFER,J.COLOR_ATTACHMENT0+T0,J.TEXTURE_2D,e,0)}Q.bindFramebuffer(J.DRAW_FRAMEBUFFER,D0.__webglMultisampledFramebuffer)}else if(G.depthBuffer&&G.resolveDepthBuffer===!1&&q){let k=G.stencilBuffer?J.DEPTH_STENCIL_ATTACHMENT:J.DEPTH_ATTACHMENT;J.invalidateFramebuffer(J.DRAW_FRAMEBUFFER,[k])}}}function m8(G){return Math.min(K.maxSamples,G.samples)}function p0(G){let k=Z.get(G);return G.samples>0&&$.has("WEBGL_multisampled_render_to_texture")===!0&&k.__useRenderToTexture!==!1}function w8(G){let k=X.render.frame;if(N.get(G)!==k)N.set(G,k),G.update()}function A0(G,k){let{colorSpace:v,format:s,type:t}=G;if(G.isCompressedTexture===!0||G.isVideoTexture===!0)return k;if(v!==D$&&v!==FJ)if(a0.getTransfer(v)===z8){if(s!==$7||t!==c6)b0("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else y0("WebGLTextures: Unsupported texture color space:",v);return k}function D8(G){if(typeof HTMLImageElement<"u"&&G instanceof HTMLImageElement)Y.width=G.naturalWidth||G.width,Y.height=G.naturalHeight||G.height;else if(typeof VideoFrame<"u"&&G instanceof VideoFrame)Y.width=G.displayWidth,Y.height=G.displayHeight;else Y.width=G.width,Y.height=G.height;return Y}this.allocateTextureUnit=n,this.resetTextureUnits=p,this.setTexture2D=i,this.setTexture2DArray=d,this.setTexture3D=m,this.setTextureCube=J0,this.rebindTextures=e0,this.setupRenderTarget=K8,this.updateRenderTargetMipmap=U8,this.updateMultisampleRenderTarget=P,this.setupDepthRenderbuffer=t0,this.setupFrameBufferTexture=V0,this.useMultisampledRTT=p0,this.isReversedDepthBuffer=function(){return Q.buffers.depth.getReversed()}}function dR(J,$){function Q(Z,K=FJ){let W,X=a0.getTransfer(K);if(Z===c6)return J.UNSIGNED_BYTE;if(Z===FX)return J.UNSIGNED_SHORT_4_4_4_4;if(Z===zX)return J.UNSIGNED_SHORT_5_5_5_1;if(Z===Vz)return J.UNSIGNED_INT_5_9_9_9_REV;if(Z===Oz)return J.UNSIGNED_INT_10F_11F_11F_REV;if(Z===Nz)return J.BYTE;if(Z===Uz)return J.SHORT;if(Z===z$)return J.UNSIGNED_SHORT;if(Z===OX)return J.INT;if(Z===l7)return J.UNSIGNED_INT;if(Z===M7)return J.FLOAT;if(Z===G7)return J.HALF_FLOAT;if(Z===Fz)return J.ALPHA;if(Z===zz)return J.RGB;if(Z===$7)return J.RGBA;if(Z===VJ)return J.DEPTH_COMPONENT;if(Z===OJ)return J.DEPTH_STENCIL;if(Z===Dz)return J.RED;if(Z===DX)return J.RED_INTEGER;if(Z===k9)return J.RG;if(Z===kX)return J.RG_INTEGER;if(Z===IX)return J.RGBA_INTEGER;if(Z===xZ||Z===gZ||Z===pZ||Z===mZ)if(X===z8)if(W=$.get("WEBGL_compressed_texture_s3tc_srgb"),W!==null){if(Z===xZ)return W.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(Z===gZ)return W.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(Z===pZ)return W.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(Z===mZ)return W.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(W=$.get("WEBGL_compressed_texture_s3tc"),W!==null){if(Z===xZ)return W.COMPRESSED_RGB_S3TC_DXT1_EXT;if(Z===gZ)return W.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(Z===pZ)return W.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(Z===mZ)return W.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(Z===wX||Z===MX||Z===GX||Z===RX)if(W=$.get("WEBGL_compressed_texture_pvrtc"),W!==null){if(Z===wX)return W.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(Z===MX)return W.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(Z===GX)return W.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(Z===RX)return W.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(Z===LX||Z===BX||Z===AX||Z===_X||Z===CX||Z===EX||Z===PX)if(W=$.get("WEBGL_compressed_texture_etc"),W!==null){if(Z===LX||Z===BX)return X===z8?W.COMPRESSED_SRGB8_ETC2:W.COMPRESSED_RGB8_ETC2;if(Z===AX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:W.COMPRESSED_RGBA8_ETC2_EAC;if(Z===_X)return W.COMPRESSED_R11_EAC;if(Z===CX)return W.COMPRESSED_SIGNED_R11_EAC;if(Z===EX)return W.COMPRESSED_RG11_EAC;if(Z===PX)return W.COMPRESSED_SIGNED_RG11_EAC}else return null;if(Z===jX||Z===SX||Z===TX||Z===yX||Z===bX||Z===vX||Z===fX||Z===hX||Z===xX||Z===gX||Z===pX||Z===mX||Z===dX||Z===lX)if(W=$.get("WEBGL_compressed_texture_astc"),W!==null){if(Z===jX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:W.COMPRESSED_RGBA_ASTC_4x4_KHR;if(Z===SX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:W.COMPRESSED_RGBA_ASTC_5x4_KHR;if(Z===TX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:W.COMPRESSED_RGBA_ASTC_5x5_KHR;if(Z===yX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:W.COMPRESSED_RGBA_ASTC_6x5_KHR;if(Z===bX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:W.COMPRESSED_RGBA_ASTC_6x6_KHR;if(Z===vX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:W.COMPRESSED_RGBA_ASTC_8x5_KHR;if(Z===fX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:W.COMPRESSED_RGBA_ASTC_8x6_KHR;if(Z===hX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:W.COMPRESSED_RGBA_ASTC_8x8_KHR;if(Z===xX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:W.COMPRESSED_RGBA_ASTC_10x5_KHR;if(Z===gX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:W.COMPRESSED_RGBA_ASTC_10x6_KHR;if(Z===pX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:W.COMPRESSED_RGBA_ASTC_10x8_KHR;if(Z===mX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:W.COMPRESSED_RGBA_ASTC_10x10_KHR;if(Z===dX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:W.COMPRESSED_RGBA_ASTC_12x10_KHR;if(Z===lX)return X===z8?W.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:W.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(Z===cX||Z===uX||Z===sX)if(W=$.get("EXT_texture_compression_bptc"),W!==null){if(Z===cX)return X===z8?W.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:W.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(Z===uX)return W.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(Z===sX)return W.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(Z===nX||Z===iX||Z===oX||Z===aX)if(W=$.get("EXT_texture_compression_rgtc"),W!==null){if(Z===nX)return W.COMPRESSED_RED_RGTC1_EXT;if(Z===iX)return W.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(Z===oX)return W.COMPRESSED_RED_GREEN_RGTC2_EXT;if(Z===aX)return W.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(Z===D9)return J.UNSIGNED_INT_24_8;return J[Z]!==void 0?J[Z]:null}return{convert:Q}}var lR=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,cR=`
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

}`;class FD{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(J,$){if(this.texture===null){let Q=new eZ(J.texture);if(J.depthNear!==$.depthNear||J.depthFar!==$.depthFar)this.depthNear=J.depthNear,this.depthFar=J.depthFar;this.texture=Q}}getMesh(J){if(this.texture!==null){if(this.mesh===null){let $=J.cameras[0].viewport,Q=new S6({vertexShader:lR,fragmentShader:cR,uniforms:{depthColor:{value:this.texture},depthWidth:{value:$.z},depthHeight:{value:$.w}}});this.mesh=new u6(new L$(20,20),Q)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class zD extends c7{constructor(J,$){super();let Q=this,Z=null,K=1,W=null,X="local-floor",H=1,q=null,Y=null,N=null,U=null,V=null,z=null,D=typeof XRWebGLBinding<"u",w=new FD,F={},O=$.getContextAttributes(),R=null,B=null,L=[],y=[],_=new Q8,j=null,I=new t8;I.viewport=new A8;let E=new t8;E.viewport=new A8;let u=[I,E],C=new GH,p=null,n=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(o){let W0=L[o];if(W0===void 0)W0=new w$,L[o]=W0;return W0.getTargetRaySpace()},this.getControllerGrip=function(o){let W0=L[o];if(W0===void 0)W0=new w$,L[o]=W0;return W0.getGripSpace()},this.getHand=function(o){let W0=L[o];if(W0===void 0)W0=new w$,L[o]=W0;return W0.getHandSpace()};function f(o){let W0=y.indexOf(o.inputSource);if(W0===-1)return;let z0=L[W0];if(z0!==void 0)z0.update(o.inputSource,o.frame,q||W),z0.dispatchEvent({type:o.type,data:o.inputSource})}function i(){Z.removeEventListener("select",f),Z.removeEventListener("selectstart",f),Z.removeEventListener("selectend",f),Z.removeEventListener("squeeze",f),Z.removeEventListener("squeezestart",f),Z.removeEventListener("squeezeend",f),Z.removeEventListener("end",i),Z.removeEventListener("inputsourceschange",d);for(let o=0;o<L.length;o++){let W0=y[o];if(W0===null)continue;y[o]=null,L[o].disconnect(W0)}p=null,n=null,w.reset();for(let o in F)delete F[o];J.setRenderTarget(R),V=null,U=null,N=null,Z=null,B=null,X8.stop(),Q.isPresenting=!1,J.setPixelRatio(j),J.setSize(_.width,_.height,!1),Q.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(o){if(K=o,Q.isPresenting===!0)b0("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(o){if(X=o,Q.isPresenting===!0)b0("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return q||W},this.setReferenceSpace=function(o){q=o},this.getBaseLayer=function(){return U!==null?U:V},this.getBinding=function(){if(N===null&&D)N=new XRWebGLBinding(Z,$);return N},this.getFrame=function(){return z},this.getSession=function(){return Z},this.setSession=async function(o){if(Z=o,Z!==null){if(R=J.getRenderTarget(),Z.addEventListener("select",f),Z.addEventListener("selectstart",f),Z.addEventListener("selectend",f),Z.addEventListener("squeeze",f),Z.addEventListener("squeezestart",f),Z.addEventListener("squeezeend",f),Z.addEventListener("end",i),Z.addEventListener("inputsourceschange",d),O.xrCompatible!==!0)await $.makeXRCompatible();if(j=J.getPixelRatio(),J.getSize(_),!(D&&("createProjectionLayer"in XRWebGLBinding.prototype))){let z0={antialias:O.antialias,alpha:!0,depth:O.depth,stencil:O.stencil,framebufferScaleFactor:K};V=new XRWebGLLayer(Z,$,z0),Z.updateRenderState({baseLayer:V}),J.setPixelRatio(1),J.setSize(V.framebufferWidth,V.framebufferHeight,!1),B=new j6(V.framebufferWidth,V.framebufferHeight,{format:$7,type:c6,colorSpace:J.outputColorSpace,stencilBuffer:O.stencil,resolveDepthBuffer:V.ignoreDepthValues===!1,resolveStencilBuffer:V.ignoreDepthValues===!1})}else{let z0=null,V0=null,S0=null;if(O.depth)S0=O.stencil?$.DEPTH24_STENCIL8:$.DEPTH_COMPONENT24,z0=O.stencil?OJ:VJ,V0=O.stencil?D9:l7;let r0={colorFormat:$.RGBA8,depthFormat:S0,scaleFactor:K};N=this.getBinding(),U=N.createProjectionLayer(r0),Z.updateRenderState({layers:[U]}),J.setPixelRatio(1),J.setSize(U.textureWidth,U.textureHeight,!1),B=new j6(U.textureWidth,U.textureHeight,{format:$7,type:c6,depthTexture:new DJ(U.textureWidth,U.textureHeight,V0,void 0,void 0,void 0,void 0,void 0,void 0,z0),stencilBuffer:O.stencil,colorSpace:J.outputColorSpace,samples:O.antialias?4:0,resolveDepthBuffer:U.ignoreDepthValues===!1,resolveStencilBuffer:U.ignoreDepthValues===!1})}B.isXRRenderTarget=!0,this.setFoveation(H),q=null,W=await Z.requestReferenceSpace(X),X8.setContext(Z),X8.start(),Q.isPresenting=!0,Q.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(Z!==null)return Z.environmentBlendMode},this.getDepthTexture=function(){return w.getDepthTexture()};function d(o){for(let W0=0;W0<o.removed.length;W0++){let z0=o.removed[W0],V0=y.indexOf(z0);if(V0>=0)y[V0]=null,L[V0].disconnect(z0)}for(let W0=0;W0<o.added.length;W0++){let z0=o.added[W0],V0=y.indexOf(z0);if(V0===-1){for(let r0=0;r0<L.length;r0++)if(r0>=y.length){y.push(z0),V0=r0;break}else if(y[r0]===null){y[r0]=z0,V0=r0;break}if(V0===-1)break}let S0=L[V0];if(S0)S0.connect(z0)}}let m=new g,J0=new g;function $0(o,W0,z0){m.setFromMatrixPosition(W0.matrixWorld),J0.setFromMatrixPosition(z0.matrixWorld);let V0=m.distanceTo(J0),S0=W0.projectionMatrix.elements,r0=z0.projectionMatrix.elements,t0=S0[14]/(S0[10]-1),e0=S0[14]/(S0[10]+1),K8=(S0[9]+1)/S0[5],U8=(S0[9]-1)/S0[5],c0=(S0[8]-1)/S0[0],S8=(r0[8]+1)/r0[0],P=t0*c0,m8=t0*S8,p0=V0/(-c0+S8),w8=p0*-c0;if(W0.matrixWorld.decompose(o.position,o.quaternion,o.scale),o.translateX(w8),o.translateZ(p0),o.matrixWorld.compose(o.position,o.quaternion,o.scale),o.matrixWorldInverse.copy(o.matrixWorld).invert(),S0[10]===-1)o.projectionMatrix.copy(W0.projectionMatrix),o.projectionMatrixInverse.copy(W0.projectionMatrixInverse);else{let A0=t0+p0,D8=e0+p0,G=P-w8,k=m8+(V0-w8),v=K8*e0/D8*A0,s=U8*e0/D8*A0;o.projectionMatrix.makePerspective(G,k,v,s,A0,D8),o.projectionMatrixInverse.copy(o.projectionMatrix).invert()}}function U0(o,W0){if(W0===null)o.matrixWorld.copy(o.matrix);else o.matrixWorld.multiplyMatrices(W0.matrixWorld,o.matrix);o.matrixWorldInverse.copy(o.matrixWorld).invert()}this.updateCamera=function(o){if(Z===null)return;let{near:W0,far:z0}=o;if(w.texture!==null){if(w.depthNear>0)W0=w.depthNear;if(w.depthFar>0)z0=w.depthFar}if(C.near=E.near=I.near=W0,C.far=E.far=I.far=z0,p!==C.near||n!==C.far)Z.updateRenderState({depthNear:C.near,depthFar:C.far}),p=C.near,n=C.far;C.layers.mask=o.layers.mask|6,I.layers.mask=C.layers.mask&-5,E.layers.mask=C.layers.mask&-3;let V0=o.parent,S0=C.cameras;U0(C,V0);for(let r0=0;r0<S0.length;r0++)U0(S0[r0],V0);if(S0.length===2)$0(C,I,E);else C.projectionMatrix.copy(I.projectionMatrix);C0(o,C,V0)};function C0(o,W0,z0){if(z0===null)o.matrix.copy(W0.matrixWorld);else o.matrix.copy(z0.matrixWorld),o.matrix.invert(),o.matrix.multiply(W0.matrixWorld);if(o.matrix.decompose(o.position,o.quaternion,o.scale),o.updateMatrixWorld(!0),o.projectionMatrix.copy(W0.projectionMatrix),o.projectionMatrixInverse.copy(W0.projectionMatrixInverse),o.isPerspectiveCamera)o.fov=yZ*2*Math.atan(1/o.projectionMatrix.elements[5]),o.zoom=1}this.getCamera=function(){return C},this.getFoveation=function(){if(U===null&&V===null)return;return H},this.setFoveation=function(o){if(H=o,U!==null)U.fixedFoveation=o;if(V!==null&&V.fixedFoveation!==void 0)V.fixedFoveation=o},this.hasDepthSensing=function(){return w.texture!==null},this.getDepthSensingMesh=function(){return w.getMesh(C)},this.getCameraTexture=function(o){return F[o]};let N0=null;function M8(o,W0){if(Y=W0.getViewerPose(q||W),z=W0,Y!==null){let z0=Y.views;if(V!==null)J.setRenderTargetFramebuffer(B,V.framebuffer),J.setRenderTarget(B);let V0=!1;if(z0.length!==C.cameras.length)C.cameras.length=0,V0=!0;for(let e0=0;e0<z0.length;e0++){let K8=z0[e0],U8=null;if(V!==null)U8=V.getViewport(K8);else{let S8=N.getViewSubImage(U,K8);if(U8=S8.viewport,e0===0)J.setRenderTargetTextures(B,S8.colorTexture,S8.depthStencilTexture),J.setRenderTarget(B)}let c0=u[e0];if(c0===void 0)c0=new t8,c0.layers.enable(e0),c0.viewport=new A8,u[e0]=c0;if(c0.matrix.fromArray(K8.transform.matrix),c0.matrix.decompose(c0.position,c0.quaternion,c0.scale),c0.projectionMatrix.fromArray(K8.projectionMatrix),c0.projectionMatrixInverse.copy(c0.projectionMatrix).invert(),c0.viewport.set(U8.x,U8.y,U8.width,U8.height),e0===0)C.matrix.copy(c0.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale);if(V0===!0)C.cameras.push(c0)}let S0=Z.enabledFeatures;if(S0&&S0.includes("depth-sensing")&&Z.depthUsage=="gpu-optimized"&&D){N=Q.getBinding();let e0=N.getDepthInformation(z0[0]);if(e0&&e0.isValid&&e0.texture)w.init(e0,Z.renderState)}if(S0&&S0.includes("camera-access")&&D){J.state.unbindTexture(),N=Q.getBinding();for(let e0=0;e0<z0.length;e0++){let K8=z0[e0].camera;if(K8){let U8=F[K8];if(!U8)U8=new eZ,F[K8]=U8;let c0=N.getCameraImage(K8);U8.sourceTexture=c0}}}}for(let z0=0;z0<L.length;z0++){let V0=y[z0],S0=L[z0];if(V0!==null&&S0!==void 0)S0.update(V0,W0,q||W)}if(N0)N0(o,W0);if(W0.detectedPlanes)Q.dispatchEvent({type:"planesdetected",data:W0});z=null}let X8=new KD;X8.setAnimationLoop(M8),this.setAnimationLoop=function(o){N0=o},this.dispose=function(){}}}var RJ=new t6,uR=new G8;function sR(J,$){function Q(F,O){if(F.matrixAutoUpdate===!0)F.updateMatrix();O.value.copy(F.matrix)}function Z(F,O){if(O.color.getRGB(F.fogColor.value,XH(J)),O.isFog)F.fogNear.value=O.near,F.fogFar.value=O.far;else if(O.isFogExp2)F.fogDensity.value=O.density}function K(F,O,R,B,L){if(O.isMeshBasicMaterial)W(F,O);else if(O.isMeshLambertMaterial){if(W(F,O),O.envMap)F.envMapIntensity.value=O.envMapIntensity}else if(O.isMeshToonMaterial)W(F,O),U(F,O);else if(O.isMeshPhongMaterial){if(W(F,O),N(F,O),O.envMap)F.envMapIntensity.value=O.envMapIntensity}else if(O.isMeshStandardMaterial){if(W(F,O),V(F,O),O.isMeshPhysicalMaterial)z(F,O,L)}else if(O.isMeshMatcapMaterial)W(F,O),D(F,O);else if(O.isMeshDepthMaterial)W(F,O);else if(O.isMeshDistanceMaterial)W(F,O),w(F,O);else if(O.isMeshNormalMaterial)W(F,O);else if(O.isLineBasicMaterial){if(X(F,O),O.isLineDashedMaterial)H(F,O)}else if(O.isPointsMaterial)q(F,O,R,B);else if(O.isSpriteMaterial)Y(F,O);else if(O.isShadowMaterial)F.color.value.copy(O.color),F.opacity.value=O.opacity;else if(O.isShaderMaterial)O.uniformsNeedUpdate=!1}function W(F,O){if(F.opacity.value=O.opacity,O.color)F.diffuse.value.copy(O.color);if(O.emissive)F.emissive.value.copy(O.emissive).multiplyScalar(O.emissiveIntensity);if(O.map)F.map.value=O.map,Q(O.map,F.mapTransform);if(O.alphaMap)F.alphaMap.value=O.alphaMap,Q(O.alphaMap,F.alphaMapTransform);if(O.bumpMap){if(F.bumpMap.value=O.bumpMap,Q(O.bumpMap,F.bumpMapTransform),F.bumpScale.value=O.bumpScale,O.side===N6)F.bumpScale.value*=-1}if(O.normalMap){if(F.normalMap.value=O.normalMap,Q(O.normalMap,F.normalMapTransform),F.normalScale.value.copy(O.normalScale),O.side===N6)F.normalScale.value.negate()}if(O.displacementMap)F.displacementMap.value=O.displacementMap,Q(O.displacementMap,F.displacementMapTransform),F.displacementScale.value=O.displacementScale,F.displacementBias.value=O.displacementBias;if(O.emissiveMap)F.emissiveMap.value=O.emissiveMap,Q(O.emissiveMap,F.emissiveMapTransform);if(O.specularMap)F.specularMap.value=O.specularMap,Q(O.specularMap,F.specularMapTransform);if(O.alphaTest>0)F.alphaTest.value=O.alphaTest;let R=$.get(O),B=R.envMap,L=R.envMapRotation;if(B){if(F.envMap.value=B,RJ.copy(L),RJ.x*=-1,RJ.y*=-1,RJ.z*=-1,B.isCubeTexture&&B.isRenderTargetTexture===!1)RJ.y*=-1,RJ.z*=-1;F.envMapRotation.value.setFromMatrix4(uR.makeRotationFromEuler(RJ)),F.flipEnvMap.value=B.isCubeTexture&&B.isRenderTargetTexture===!1?-1:1,F.reflectivity.value=O.reflectivity,F.ior.value=O.ior,F.refractionRatio.value=O.refractionRatio}if(O.lightMap)F.lightMap.value=O.lightMap,F.lightMapIntensity.value=O.lightMapIntensity,Q(O.lightMap,F.lightMapTransform);if(O.aoMap)F.aoMap.value=O.aoMap,F.aoMapIntensity.value=O.aoMapIntensity,Q(O.aoMap,F.aoMapTransform)}function X(F,O){if(F.diffuse.value.copy(O.color),F.opacity.value=O.opacity,O.map)F.map.value=O.map,Q(O.map,F.mapTransform)}function H(F,O){F.dashSize.value=O.dashSize,F.totalSize.value=O.dashSize+O.gapSize,F.scale.value=O.scale}function q(F,O,R,B){if(F.diffuse.value.copy(O.color),F.opacity.value=O.opacity,F.size.value=O.size*R,F.scale.value=B*0.5,O.map)F.map.value=O.map,Q(O.map,F.uvTransform);if(O.alphaMap)F.alphaMap.value=O.alphaMap,Q(O.alphaMap,F.alphaMapTransform);if(O.alphaTest>0)F.alphaTest.value=O.alphaTest}function Y(F,O){if(F.diffuse.value.copy(O.color),F.opacity.value=O.opacity,F.rotation.value=O.rotation,O.map)F.map.value=O.map,Q(O.map,F.mapTransform);if(O.alphaMap)F.alphaMap.value=O.alphaMap,Q(O.alphaMap,F.alphaMapTransform);if(O.alphaTest>0)F.alphaTest.value=O.alphaTest}function N(F,O){F.specular.value.copy(O.specular),F.shininess.value=Math.max(O.shininess,0.0001)}function U(F,O){if(O.gradientMap)F.gradientMap.value=O.gradientMap}function V(F,O){if(F.metalness.value=O.metalness,O.metalnessMap)F.metalnessMap.value=O.metalnessMap,Q(O.metalnessMap,F.metalnessMapTransform);if(F.roughness.value=O.roughness,O.roughnessMap)F.roughnessMap.value=O.roughnessMap,Q(O.roughnessMap,F.roughnessMapTransform);if(O.envMap)F.envMapIntensity.value=O.envMapIntensity}function z(F,O,R){if(F.ior.value=O.ior,O.sheen>0){if(F.sheenColor.value.copy(O.sheenColor).multiplyScalar(O.sheen),F.sheenRoughness.value=O.sheenRoughness,O.sheenColorMap)F.sheenColorMap.value=O.sheenColorMap,Q(O.sheenColorMap,F.sheenColorMapTransform);if(O.sheenRoughnessMap)F.sheenRoughnessMap.value=O.sheenRoughnessMap,Q(O.sheenRoughnessMap,F.sheenRoughnessMapTransform)}if(O.clearcoat>0){if(F.clearcoat.value=O.clearcoat,F.clearcoatRoughness.value=O.clearcoatRoughness,O.clearcoatMap)F.clearcoatMap.value=O.clearcoatMap,Q(O.clearcoatMap,F.clearcoatMapTransform);if(O.clearcoatRoughnessMap)F.clearcoatRoughnessMap.value=O.clearcoatRoughnessMap,Q(O.clearcoatRoughnessMap,F.clearcoatRoughnessMapTransform);if(O.clearcoatNormalMap){if(F.clearcoatNormalMap.value=O.clearcoatNormalMap,Q(O.clearcoatNormalMap,F.clearcoatNormalMapTransform),F.clearcoatNormalScale.value.copy(O.clearcoatNormalScale),O.side===N6)F.clearcoatNormalScale.value.negate()}}if(O.dispersion>0)F.dispersion.value=O.dispersion;if(O.iridescence>0){if(F.iridescence.value=O.iridescence,F.iridescenceIOR.value=O.iridescenceIOR,F.iridescenceThicknessMinimum.value=O.iridescenceThicknessRange[0],F.iridescenceThicknessMaximum.value=O.iridescenceThicknessRange[1],O.iridescenceMap)F.iridescenceMap.value=O.iridescenceMap,Q(O.iridescenceMap,F.iridescenceMapTransform);if(O.iridescenceThicknessMap)F.iridescenceThicknessMap.value=O.iridescenceThicknessMap,Q(O.iridescenceThicknessMap,F.iridescenceThicknessMapTransform)}if(O.transmission>0){if(F.transmission.value=O.transmission,F.transmissionSamplerMap.value=R.texture,F.transmissionSamplerSize.value.set(R.width,R.height),O.transmissionMap)F.transmissionMap.value=O.transmissionMap,Q(O.transmissionMap,F.transmissionMapTransform);if(F.thickness.value=O.thickness,O.thicknessMap)F.thicknessMap.value=O.thicknessMap,Q(O.thicknessMap,F.thicknessMapTransform);F.attenuationDistance.value=O.attenuationDistance,F.attenuationColor.value.copy(O.attenuationColor)}if(O.anisotropy>0){if(F.anisotropyVector.value.set(O.anisotropy*Math.cos(O.anisotropyRotation),O.anisotropy*Math.sin(O.anisotropyRotation)),O.anisotropyMap)F.anisotropyMap.value=O.anisotropyMap,Q(O.anisotropyMap,F.anisotropyMapTransform)}if(F.specularIntensity.value=O.specularIntensity,F.specularColor.value.copy(O.specularColor),O.specularColorMap)F.specularColorMap.value=O.specularColorMap,Q(O.specularColorMap,F.specularColorMapTransform);if(O.specularIntensityMap)F.specularIntensityMap.value=O.specularIntensityMap,Q(O.specularIntensityMap,F.specularIntensityMapTransform)}function D(F,O){if(O.matcap)F.matcap.value=O.matcap}function w(F,O){let R=$.get(O).light;F.referencePosition.value.setFromMatrixPosition(R.matrixWorld),F.nearDistance.value=R.shadow.camera.near,F.farDistance.value=R.shadow.camera.far}return{refreshFogUniforms:Z,refreshMaterialUniforms:K}}function nR(J,$,Q,Z){let K={},W={},X=[],H=J.getParameter(J.MAX_UNIFORM_BUFFER_BINDINGS);function q(R,B){let L=B.program;Z.uniformBlockBinding(R,L)}function Y(R,B){let L=K[R.id];if(L===void 0)D(R),L=N(R),K[R.id]=L,R.addEventListener("dispose",F);let y=B.program;Z.updateUBOMapping(R,y);let _=$.render.frame;if(W[R.id]!==_)V(R),W[R.id]=_}function N(R){let B=U();R.__bindingPointIndex=B;let L=J.createBuffer(),y=R.__size,_=R.usage;return J.bindBuffer(J.UNIFORM_BUFFER,L),J.bufferData(J.UNIFORM_BUFFER,y,_),J.bindBuffer(J.UNIFORM_BUFFER,null),J.bindBufferBase(J.UNIFORM_BUFFER,B,L),L}function U(){for(let R=0;R<H;R++)if(X.indexOf(R)===-1)return X.push(R),R;return y0("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function V(R){let B=K[R.id],L=R.uniforms,y=R.__cache;J.bindBuffer(J.UNIFORM_BUFFER,B);for(let _=0,j=L.length;_<j;_++){let I=Array.isArray(L[_])?L[_]:[L[_]];for(let E=0,u=I.length;E<u;E++){let C=I[E];if(z(C,_,E,y)===!0){let p=C.__offset,n=Array.isArray(C.value)?C.value:[C.value],f=0;for(let i=0;i<n.length;i++){let d=n[i],m=w(d);if(typeof d==="number"||typeof d==="boolean")C.__data[0]=d,J.bufferSubData(J.UNIFORM_BUFFER,p+f,C.__data);else if(d.isMatrix3)C.__data[0]=d.elements[0],C.__data[1]=d.elements[1],C.__data[2]=d.elements[2],C.__data[3]=0,C.__data[4]=d.elements[3],C.__data[5]=d.elements[4],C.__data[6]=d.elements[5],C.__data[7]=0,C.__data[8]=d.elements[6],C.__data[9]=d.elements[7],C.__data[10]=d.elements[8],C.__data[11]=0;else d.toArray(C.__data,f),f+=m.storage/Float32Array.BYTES_PER_ELEMENT}J.bufferSubData(J.UNIFORM_BUFFER,p,C.__data)}}}J.bindBuffer(J.UNIFORM_BUFFER,null)}function z(R,B,L,y){let _=R.value,j=B+"_"+L;if(y[j]===void 0){if(typeof _==="number"||typeof _==="boolean")y[j]=_;else y[j]=_.clone();return!0}else{let I=y[j];if(typeof _==="number"||typeof _==="boolean"){if(I!==_)return y[j]=_,!0}else if(I.equals(_)===!1)return I.copy(_),!0}return!1}function D(R){let B=R.uniforms,L=0,y=16;for(let j=0,I=B.length;j<I;j++){let E=Array.isArray(B[j])?B[j]:[B[j]];for(let u=0,C=E.length;u<C;u++){let p=E[u],n=Array.isArray(p.value)?p.value:[p.value];for(let f=0,i=n.length;f<i;f++){let d=n[f],m=w(d),J0=L%y,$0=J0%m.boundary,U0=J0+$0;if(L+=$0,U0!==0&&y-U0<m.storage)L+=y-U0;p.__data=new Float32Array(m.storage/Float32Array.BYTES_PER_ELEMENT),p.__offset=L,L+=m.storage}}}let _=L%y;if(_>0)L+=y-_;return R.__size=L,R.__cache={},this}function w(R){let B={boundary:0,storage:0};if(typeof R==="number"||typeof R==="boolean")B.boundary=4,B.storage=4;else if(R.isVector2)B.boundary=8,B.storage=8;else if(R.isVector3||R.isColor)B.boundary=16,B.storage=12;else if(R.isVector4)B.boundary=16,B.storage=16;else if(R.isMatrix3)B.boundary=48,B.storage=48;else if(R.isMatrix4)B.boundary=64,B.storage=64;else if(R.isTexture)b0("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else b0("WebGLRenderer: Unsupported uniform value type.",R);return B}function F(R){let B=R.target;B.removeEventListener("dispose",F);let L=X.indexOf(B.__bindingPointIndex);X.splice(L,1),J.deleteBuffer(K[B.id]),delete K[B.id],delete W[B.id]}function O(){for(let R in K)J.deleteBuffer(K[R]);X=[],K={},W={}}return{bind:q,update:Y,dispose:O}}var iR=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Q7=null;function oR(){if(Q7===null)Q7=new KH(iR,16,16,k9,G7),Q7.name="DFG_LUT",Q7.minFilter=U6,Q7.magFilter=U6,Q7.wrapS=fZ,Q7.wrapT=fZ,Q7.generateMipmaps=!1,Q7.needsUpdate=!0;return Q7}class vH{constructor(J={}){let{canvas:$=_z(),context:Q=null,depth:Z=!0,stencil:K=!1,alpha:W=!1,antialias:X=!1,premultipliedAlpha:H=!0,preserveDrawingBuffer:q=!1,powerPreference:Y="default",failIfMajorPerformanceCaveat:N=!1,reversedDepthBuffer:U=!1,outputBufferType:V=c6}=J;this.isWebGLRenderer=!0;let z;if(Q!==null){if(typeof WebGLRenderingContext<"u"&&Q instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");z=Q.getContextAttributes().alpha}else z=W;let D=V,w=new Set([IX,kX,DX]),F=new Set([c6,l7,z$,D9,FX,zX]),O=new Uint32Array(4),R=new Int32Array(4),B=null,L=null,y=[],_=[],j=null;this.domElement=$,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=l6,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,E=!1;this._outputColorSpace=wz;let u=0,C=0,p=null,n=-1,f=null,i=new A8,d=new A8,m=null,J0=new l0(0),$0=0,U0=$.width,C0=$.height,N0=1,M8=null,X8=null,o=new A8(0,0,U0,C0),W0=new A8(0,0,U0,C0),z0=!1,V0=new G$,S0=!1,r0=!1,t0=new G8,e0=new g,K8=new A8,U8={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},c0=!1;function S8(){return p===null?N0:1}let P=Q;function m8(M,T){return $.getContext(M,T)}try{let M={alpha:!0,depth:Z,stencil:K,antialias:X,premultipliedAlpha:H,preserveDrawingBuffer:q,powerPreference:Y,failIfMajorPerformanceCaveat:N};if("setAttribute"in $)$.setAttribute("data-engine",`three.js r${CF}`);if($.addEventListener("webglcontextlost",r,!1),$.addEventListener("webglcontextrestored",M0,!1),$.addEventListener("webglcontextcreationerror",f0,!1),P===null){if(P=m8("webgl2",M),P===null)if(m8("webgl2"))throw Error("Error creating WebGL context with your selected attributes.");else throw Error("Error creating WebGL context.")}}catch(M){throw y0("WebGLRenderer: "+M.message),M}let p0,w8,A0,D8,G,k,v,s,t,c,D0,X0,E0,T0,e,Q0,w0,j0,O0,m0,S,Z0,K0;function I0(){if(p0=new ZG(P),p0.init(),S=new dR(P,p0),w8=new oM(P,p0,J,S),A0=new pR(P,p0),w8.reversedDepthBuffer&&U)A0.buffers.depth.setReversed(!0);D8=new XG(P),G=new _R,k=new mR(P,p0,A0,G,w8,S,D8),v=new QG(I),s=new UI(P),Z0=new nM(P,s),t=new KG(P,s,D8,Z0),c=new qG(P,t,s,Z0,D8),j0=new HG(P,w8,k),e=new aM(G),D0=new AR(I,v,p0,w8,Z0,e),X0=new sR(I,G),E0=new ER,T0=new bR(p0),w0=new sM(I,v,A0,c,z,H),Q0=new gR(I,c,w8),K0=new nR(P,D8,w8,A0),O0=new iM(P,p0,D8),m0=new WG(P,p0,D8),D8.programs=D0.programs,I.capabilities=w8,I.extensions=p0,I.properties=G,I.renderLists=E0,I.shadowMap=Q0,I.state=A0,I.info=D8}if(I0(),D!==c6)j=new NG(D,$.width,$.height,Z,K);let a=new zD(I,P);this.xr=a,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let M=p0.get("WEBGL_lose_context");if(M)M.loseContext()},this.forceContextRestore=function(){let M=p0.get("WEBGL_lose_context");if(M)M.restoreContext()},this.getPixelRatio=function(){return N0},this.setPixelRatio=function(M){if(M===void 0)return;N0=M,this.setSize(U0,C0,!1)},this.getSize=function(M){return M.set(U0,C0)},this.setSize=function(M,T,l=!0){if(a.isPresenting){b0("WebGLRenderer: Can't change size while VR device is presenting.");return}if(U0=M,C0=T,$.width=Math.floor(M*N0),$.height=Math.floor(T*N0),l===!0)$.style.width=M+"px",$.style.height=T+"px";if(j!==null)j.setSize($.width,$.height);this.setViewport(0,0,M,T)},this.getDrawingBufferSize=function(M){return M.set(U0*N0,C0*N0).floor()},this.setDrawingBufferSize=function(M,T,l){U0=M,C0=T,N0=l,$.width=Math.floor(M*l),$.height=Math.floor(T*l),this.setViewport(0,0,M,T)},this.setEffects=function(M){if(D===c6){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let T=0;T<M.length;T++)if(M[T].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}j.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(i)},this.getViewport=function(M){return M.copy(o)},this.setViewport=function(M,T,l,x){if(M.isVector4)o.set(M.x,M.y,M.z,M.w);else o.set(M,T,l,x);A0.viewport(i.copy(o).multiplyScalar(N0).round())},this.getScissor=function(M){return M.copy(W0)},this.setScissor=function(M,T,l,x){if(M.isVector4)W0.set(M.x,M.y,M.z,M.w);else W0.set(M,T,l,x);A0.scissor(d.copy(W0).multiplyScalar(N0).round())},this.getScissorTest=function(){return z0},this.setScissorTest=function(M){A0.setScissorTest(z0=M)},this.setOpaqueSort=function(M){M8=M},this.setTransparentSort=function(M){X8=M},this.getClearColor=function(M){return M.copy(w0.getClearColor())},this.setClearColor=function(){w0.setClearColor(...arguments)},this.getClearAlpha=function(){return w0.getClearAlpha()},this.setClearAlpha=function(){w0.setClearAlpha(...arguments)},this.clear=function(M=!0,T=!0,l=!0){let x=0;if(M){let h=!1;if(p!==null){let q0=p.texture.format;h=w.has(q0)}if(h){let q0=p.texture.type,F0=F.has(q0),Y0=w0.getClearColor(),G0=w0.getClearAlpha(),L0=Y0.r,h0=Y0.g,d0=Y0.b;if(F0)O[0]=L0,O[1]=h0,O[2]=d0,O[3]=G0,P.clearBufferuiv(P.COLOR,0,O);else R[0]=L0,R[1]=h0,R[2]=d0,R[3]=G0,P.clearBufferiv(P.COLOR,0,R)}else x|=P.COLOR_BUFFER_BIT}if(T)x|=P.DEPTH_BUFFER_BIT;if(l)x|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(x!==0)P.clear(x)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){$.removeEventListener("webglcontextlost",r,!1),$.removeEventListener("webglcontextrestored",M0,!1),$.removeEventListener("webglcontextcreationerror",f0,!1),w0.dispose(),E0.dispose(),T0.dispose(),G.dispose(),v.dispose(),c.dispose(),Z0.dispose(),K0.dispose(),D0.dispose(),a.dispose(),a.removeEventListener("sessionstart",gH),a.removeEventListener("sessionend",pH),s7.stop()};function r(M){M.preventDefault(),JH("WebGLRenderer: Context Lost."),E=!0}function M0(){JH("WebGLRenderer: Context Restored."),E=!1;let M=D8.autoReset,T=Q0.enabled,l=Q0.autoUpdate,x=Q0.needsUpdate,h=Q0.type;I0(),D8.autoReset=M,Q0.enabled=T,Q0.autoUpdate=l,Q0.needsUpdate=x,Q0.type=h}function f0(M){y0("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function k8(M){let T=M.target;T.removeEventListener("dispose",k8),H8(T)}function H8(M){K7(M),G.remove(M)}function K7(M){let T=G.get(M).programs;if(T!==void 0){if(T.forEach(function(l){D0.releaseProgram(l)}),M.isShaderMaterial)D0.releaseShaderCache(M)}}this.renderBufferDirect=function(M,T,l,x,h,q0){if(T===null)T=U8;let F0=h.isMesh&&h.matrixWorld.determinant()<0,Y0=MD(M,T,l,x,h);A0.setMaterial(x,F0);let G0=l.index,L0=1;if(x.wireframe===!0){if(G0=t.getWireframeAttribute(l),G0===void 0)return;L0=2}let h0=l.drawRange,d0=l.attributes.position,_0=h0.start*L0,q8=(h0.start+h0.count)*L0;if(q0!==null)_0=Math.max(_0,q0.start*L0),q8=Math.min(q8,(q0.start+q0.count)*L0);if(G0!==null)_0=Math.max(_0,0),q8=Math.min(q8,G0.count);else if(d0!==void 0&&d0!==null)_0=Math.max(_0,0),q8=Math.min(q8,d0.count);let P8=q8-_0;if(P8<0||P8===1/0)return;Z0.setup(h,x,Y0,l,G0);let _8,Y8=O0;if(G0!==null)_8=s.get(G0),Y8=m0,Y8.setIndex(_8);if(h.isMesh)if(x.wireframe===!0)A0.setLineWidth(x.wireframeLinewidth*S8()),Y8.setMode(P.LINES);else Y8.setMode(P.TRIANGLES);else if(h.isLine){let c8=x.linewidth;if(c8===void 0)c8=1;if(A0.setLineWidth(c8*S8()),h.isLineSegments)Y8.setMode(P.LINES);else if(h.isLineLoop)Y8.setMode(P.LINE_LOOP);else Y8.setMode(P.LINE_STRIP)}else if(h.isPoints)Y8.setMode(P.POINTS);else if(h.isSprite)Y8.setMode(P.TRIANGLES);if(h.isBatchedMesh)if(h._multiDrawInstances!==null)N$("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Y8.renderMultiDrawInstances(h._multiDrawStarts,h._multiDrawCounts,h._multiDrawCount,h._multiDrawInstances);else if(!p0.get("WEBGL_multi_draw")){let{_multiDrawStarts:c8,_multiDrawCounts:R0,_multiDrawCount:V6}=h,J8=G0?s.get(G0).bytesPerElement:1,y6=G.get(x).currentProgram.getUniforms();for(let n6=0;n6<V6;n6++)y6.setValue(P,"_gl_DrawID",n6),Y8.render(c8[n6]/J8,R0[n6])}else Y8.renderMultiDraw(h._multiDrawStarts,h._multiDrawCounts,h._multiDrawCount);else if(h.isInstancedMesh)Y8.renderInstances(_0,P8,h.count);else if(l.isInstancedBufferGeometry){let c8=l._maxInstanceCount!==void 0?l._maxInstanceCount:1/0,R0=Math.min(l.instanceCount,c8);Y8.renderInstances(_0,P8,R0)}else Y8.render(_0,P8)};function s6(M,T,l){if(M.transparent===!0&&M.side===e6&&M.forceSinglePass===!1)M.side=N6,M.needsUpdate=!0,j$(M,T,l),M.side=O9,M.needsUpdate=!0,j$(M,T,l),M.side=e6;else j$(M,T,l)}this.compile=function(M,T,l=null){if(l===null)l=M;if(L=T0.get(l),L.init(T),_.push(L),l.traverseVisible(function(h){if(h.isLight&&h.layers.test(T.layers)){if(L.pushLight(h),h.castShadow)L.pushShadow(h)}}),M!==l)M.traverseVisible(function(h){if(h.isLight&&h.layers.test(T.layers)){if(L.pushLight(h),h.castShadow)L.pushShadow(h)}});L.setupLights();let x=new Set;return M.traverse(function(h){if(!(h.isMesh||h.isPoints||h.isLine||h.isSprite))return;let q0=h.material;if(q0)if(Array.isArray(q0))for(let F0=0;F0<q0.length;F0++){let Y0=q0[F0];s6(Y0,l,h),x.add(Y0)}else s6(q0,l,h),x.add(q0)}),L=_.pop(),x},this.compileAsync=function(M,T,l=null){let x=this.compile(M,T,l);return new Promise((h)=>{function q0(){if(x.forEach(function(F0){if(G.get(F0).currentProgram.isReady())x.delete(F0)}),x.size===0){h(M);return}setTimeout(q0,10)}if(p0.get("KHR_parallel_shader_compile")!==null)q0();else setTimeout(q0,10)})};let VK=null;function wD(M){if(VK)VK(M)}function gH(){s7.stop()}function pH(){s7.start()}let s7=new KD;if(s7.setAnimationLoop(wD),typeof self<"u")s7.setContext(self);this.setAnimationLoop=function(M){VK=M,a.setAnimationLoop(M),M===null?s7.stop():s7.start()},a.addEventListener("sessionstart",gH),a.addEventListener("sessionend",pH),this.render=function(M,T){if(T!==void 0&&T.isCamera!==!0){y0("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;let l=a.enabled===!0&&a.isPresenting===!0,x=j!==null&&(p===null||l)&&j.begin(I,p);if(M.matrixWorldAutoUpdate===!0)M.updateMatrixWorld();if(T.parent===null&&T.matrixWorldAutoUpdate===!0)T.updateMatrixWorld();if(a.enabled===!0&&a.isPresenting===!0&&(j===null||j.isCompositing()===!1)){if(a.cameraAutoUpdate===!0)a.updateCamera(T);T=a.getCamera()}if(M.isScene===!0)M.onBeforeRender(I,M,T,p);if(L=T0.get(M,_.length),L.init(T),_.push(L),t0.multiplyMatrices(T.projectionMatrix,T.matrixWorldInverse),V0.setFromProjectionMatrix(t0,eX,T.reversedDepth),r0=this.localClippingEnabled,S0=e.init(this.clippingPlanes,r0),B=E0.get(M,y.length),B.init(),y.push(B),a.enabled===!0&&a.isPresenting===!0){let F0=I.xr.getDepthSensingMesh();if(F0!==null)OK(F0,T,-1/0,I.sortObjects)}if(OK(M,T,0,I.sortObjects),B.finish(),I.sortObjects===!0)B.sort(M8,X8);if(c0=a.enabled===!1||a.isPresenting===!1||a.hasDepthSensing()===!1,c0)w0.addToRenderList(B,M);if(this.info.render.frame++,S0===!0)e.beginShadows();let h=L.state.shadowsArray;if(Q0.render(h,M,T),S0===!0)e.endShadows();if(this.info.autoReset===!0)this.info.reset();if((x&&j.hasRenderPass())===!1){let{opaque:F0,transmissive:Y0}=B;if(L.setupLights(),T.isArrayCamera){let G0=T.cameras;if(Y0.length>0)for(let L0=0,h0=G0.length;L0<h0;L0++){let d0=G0[L0];dH(F0,Y0,M,d0)}if(c0)w0.render(M);for(let L0=0,h0=G0.length;L0<h0;L0++){let d0=G0[L0];mH(B,M,d0,d0.viewport)}}else{if(Y0.length>0)dH(F0,Y0,M,T);if(c0)w0.render(M);mH(B,M,T)}}if(p!==null&&C===0)k.updateMultisampleRenderTarget(p),k.updateRenderTargetMipmap(p);if(x)j.end(I);if(M.isScene===!0)M.onAfterRender(I,M,T);if(Z0.resetDefaultState(),n=-1,f=null,_.pop(),_.length>0){if(L=_[_.length-1],S0===!0)e.setGlobalState(I.clippingPlanes,L.state.camera)}else L=null;if(y.pop(),y.length>0)B=y[y.length-1];else B=null};function OK(M,T,l,x){if(M.visible===!1)return;if(M.layers.test(T.layers)){if(M.isGroup)l=M.renderOrder;else if(M.isLOD){if(M.autoUpdate===!0)M.update(T)}else if(M.isLight){if(L.pushLight(M),M.castShadow)L.pushShadow(M)}else if(M.isSprite){if(!M.frustumCulled||V0.intersectsSprite(M)){if(x)K8.setFromMatrixPosition(M.matrixWorld).applyMatrix4(t0);let F0=c.update(M),Y0=M.material;if(Y0.visible)B.push(M,F0,Y0,l,K8.z,null)}}else if(M.isMesh||M.isLine||M.isPoints){if(!M.frustumCulled||V0.intersectsObject(M)){let F0=c.update(M),Y0=M.material;if(x){if(M.boundingSphere!==void 0){if(M.boundingSphere===null)M.computeBoundingSphere();K8.copy(M.boundingSphere.center)}else{if(F0.boundingSphere===null)F0.computeBoundingSphere();K8.copy(F0.boundingSphere.center)}K8.applyMatrix4(M.matrixWorld).applyMatrix4(t0)}if(Array.isArray(Y0)){let G0=F0.groups;for(let L0=0,h0=G0.length;L0<h0;L0++){let d0=G0[L0],_0=Y0[d0.materialIndex];if(_0&&_0.visible)B.push(M,F0,_0,l,K8.z,d0)}}else if(Y0.visible)B.push(M,F0,Y0,l,K8.z,null)}}}let q0=M.children;for(let F0=0,Y0=q0.length;F0<Y0;F0++)OK(q0[F0],T,l,x)}function mH(M,T,l,x){let{opaque:h,transmissive:q0,transparent:F0}=M;if(L.setupLightsView(l),S0===!0)e.setGlobalState(I.clippingPlanes,l);if(x)A0.viewport(i.copy(x));if(h.length>0)P$(h,T,l);if(q0.length>0)P$(q0,T,l);if(F0.length>0)P$(F0,T,l);A0.buffers.depth.setTest(!0),A0.buffers.depth.setMask(!0),A0.buffers.color.setMask(!0),A0.setPolygonOffset(!1)}function dH(M,T,l,x){if((l.isScene===!0?l.overrideMaterial:null)!==null)return;if(L.state.transmissionRenderTarget[x.id]===void 0){let _0=p0.has("EXT_color_buffer_half_float")||p0.has("EXT_color_buffer_float");L.state.transmissionRenderTarget[x.id]=new j6(1,1,{generateMipmaps:!0,type:_0?G7:c6,minFilter:UJ,samples:Math.max(4,w8.samples),stencilBuffer:K,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:a0.workingColorSpace})}let q0=L.state.transmissionRenderTarget[x.id],F0=x.viewport||i;q0.setSize(F0.z*I.transmissionResolutionScale,F0.w*I.transmissionResolutionScale);let Y0=I.getRenderTarget(),G0=I.getActiveCubeFace(),L0=I.getActiveMipmapLevel();if(I.setRenderTarget(q0),I.getClearColor(J0),$0=I.getClearAlpha(),$0<1)I.setClearColor(16777215,0.5);if(I.clear(),c0)w0.render(l);let h0=I.toneMapping;I.toneMapping=l6;let d0=x.viewport;if(x.viewport!==void 0)x.viewport=void 0;if(L.setupLightsView(x),S0===!0)e.setGlobalState(I.clippingPlanes,x);if(P$(M,l,x),k.updateMultisampleRenderTarget(q0),k.updateRenderTargetMipmap(q0),p0.has("WEBGL_multisampled_render_to_texture")===!1){let _0=!1;for(let q8=0,P8=T.length;q8<P8;q8++){let _8=T[q8],{object:Y8,geometry:c8,material:R0,group:V6}=_8;if(R0.side===e6&&Y8.layers.test(x.layers)){let J8=R0.side;R0.side=N6,R0.needsUpdate=!0,lH(Y8,l,x,c8,R0,V6),R0.side=J8,R0.needsUpdate=!0,_0=!0}}if(_0===!0)k.updateMultisampleRenderTarget(q0),k.updateRenderTargetMipmap(q0)}if(I.setRenderTarget(Y0,G0,L0),I.setClearColor(J0,$0),d0!==void 0)x.viewport=d0;I.toneMapping=h0}function P$(M,T,l){let x=T.isScene===!0?T.overrideMaterial:null;for(let h=0,q0=M.length;h<q0;h++){let F0=M[h],{object:Y0,geometry:G0,group:L0}=F0,h0=F0.material;if(h0.allowOverride===!0&&x!==null)h0=x;if(Y0.layers.test(l.layers))lH(Y0,T,l,G0,h0,L0)}}function lH(M,T,l,x,h,q0){if(M.onBeforeRender(I,T,l,x,h,q0),M.modelViewMatrix.multiplyMatrices(l.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),h.onBeforeRender(I,T,l,x,M,q0),h.transparent===!0&&h.side===e6&&h.forceSinglePass===!1)h.side=N6,h.needsUpdate=!0,I.renderBufferDirect(l,T,x,h,M,q0),h.side=O9,h.needsUpdate=!0,I.renderBufferDirect(l,T,x,h,M,q0),h.side=e6;else I.renderBufferDirect(l,T,x,h,M,q0);M.onAfterRender(I,T,l,x,h,q0)}function j$(M,T,l){if(T.isScene!==!0)T=U8;let x=G.get(M),h=L.state.lights,q0=L.state.shadowsArray,F0=h.state.version,Y0=D0.getParameters(M,h.state,q0,T,l),G0=D0.getProgramCacheKey(Y0),L0=x.programs;x.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?T.environment:null,x.fog=T.fog;let h0=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;if(x.envMap=v.get(M.envMap||x.environment,h0),x.envMapRotation=x.environment!==null&&M.envMap===null?T.environmentRotation:M.envMapRotation,L0===void 0)M.addEventListener("dispose",k8),L0=new Map,x.programs=L0;let d0=L0.get(G0);if(d0!==void 0){if(x.currentProgram===d0&&x.lightsStateVersion===F0)return uH(M,Y0),d0}else Y0.uniforms=D0.getUniforms(M),M.onBeforeCompile(Y0,I),d0=D0.acquireProgram(Y0,G0),L0.set(G0,d0),x.uniforms=Y0.uniforms;let _0=x.uniforms;if(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)_0.clippingPlanes=e.uniform;if(uH(M,Y0),x.needsLights=RD(M),x.lightsStateVersion=F0,x.needsLights)_0.ambientLightColor.value=h.state.ambient,_0.lightProbe.value=h.state.probe,_0.directionalLights.value=h.state.directional,_0.directionalLightShadows.value=h.state.directionalShadow,_0.spotLights.value=h.state.spot,_0.spotLightShadows.value=h.state.spotShadow,_0.rectAreaLights.value=h.state.rectArea,_0.ltc_1.value=h.state.rectAreaLTC1,_0.ltc_2.value=h.state.rectAreaLTC2,_0.pointLights.value=h.state.point,_0.pointLightShadows.value=h.state.pointShadow,_0.hemisphereLights.value=h.state.hemi,_0.directionalShadowMatrix.value=h.state.directionalShadowMatrix,_0.spotLightMatrix.value=h.state.spotLightMatrix,_0.spotLightMap.value=h.state.spotLightMap,_0.pointShadowMatrix.value=h.state.pointShadowMatrix;return x.currentProgram=d0,x.uniformsList=null,d0}function cH(M){if(M.uniformsList===null){let T=M.currentProgram.getUniforms();M.uniformsList=C$.seqWithValue(T.seq,M.uniforms)}return M.uniformsList}function uH(M,T){let l=G.get(M);l.outputColorSpace=T.outputColorSpace,l.batching=T.batching,l.batchingColor=T.batchingColor,l.instancing=T.instancing,l.instancingColor=T.instancingColor,l.instancingMorph=T.instancingMorph,l.skinning=T.skinning,l.morphTargets=T.morphTargets,l.morphNormals=T.morphNormals,l.morphColors=T.morphColors,l.morphTargetsCount=T.morphTargetsCount,l.numClippingPlanes=T.numClippingPlanes,l.numIntersection=T.numClipIntersection,l.vertexAlphas=T.vertexAlphas,l.vertexTangents=T.vertexTangents,l.toneMapping=T.toneMapping}function MD(M,T,l,x,h){if(T.isScene!==!0)T=U8;k.resetTextureUnits();let q0=T.fog,F0=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?T.environment:null,Y0=p===null?I.outputColorSpace:p.isXRRenderTarget===!0?p.texture.colorSpace:D$,G0=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,L0=v.get(x.envMap||F0,G0),h0=x.vertexColors===!0&&!!l.attributes.color&&l.attributes.color.itemSize===4,d0=!!l.attributes.tangent&&(!!x.normalMap||x.anisotropy>0),_0=!!l.morphAttributes.position,q8=!!l.morphAttributes.normal,P8=!!l.morphAttributes.color,_8=l6;if(x.toneMapped){if(p===null||p.isXRRenderTarget===!0)_8=I.toneMapping}let Y8=l.morphAttributes.position||l.morphAttributes.normal||l.morphAttributes.color,c8=Y8!==void 0?Y8.length:0,R0=G.get(x),V6=L.state.lights;if(S0===!0){if(r0===!0||M!==f){let f8=M===f&&x.id===n;e.setState(x,M,f8)}}let J8=!1;if(x.version===R0.__version){if(R0.needsLights&&R0.lightsStateVersion!==V6.state.version)J8=!0;else if(R0.outputColorSpace!==Y0)J8=!0;else if(h.isBatchedMesh&&R0.batching===!1)J8=!0;else if(!h.isBatchedMesh&&R0.batching===!0)J8=!0;else if(h.isBatchedMesh&&R0.batchingColor===!0&&h.colorTexture===null)J8=!0;else if(h.isBatchedMesh&&R0.batchingColor===!1&&h.colorTexture!==null)J8=!0;else if(h.isInstancedMesh&&R0.instancing===!1)J8=!0;else if(!h.isInstancedMesh&&R0.instancing===!0)J8=!0;else if(h.isSkinnedMesh&&R0.skinning===!1)J8=!0;else if(!h.isSkinnedMesh&&R0.skinning===!0)J8=!0;else if(h.isInstancedMesh&&R0.instancingColor===!0&&h.instanceColor===null)J8=!0;else if(h.isInstancedMesh&&R0.instancingColor===!1&&h.instanceColor!==null)J8=!0;else if(h.isInstancedMesh&&R0.instancingMorph===!0&&h.morphTexture===null)J8=!0;else if(h.isInstancedMesh&&R0.instancingMorph===!1&&h.morphTexture!==null)J8=!0;else if(R0.envMap!==L0)J8=!0;else if(x.fog===!0&&R0.fog!==q0)J8=!0;else if(R0.numClippingPlanes!==void 0&&(R0.numClippingPlanes!==e.numPlanes||R0.numIntersection!==e.numIntersection))J8=!0;else if(R0.vertexAlphas!==h0)J8=!0;else if(R0.vertexTangents!==d0)J8=!0;else if(R0.morphTargets!==_0)J8=!0;else if(R0.morphNormals!==q8)J8=!0;else if(R0.morphColors!==P8)J8=!0;else if(R0.toneMapping!==_8)J8=!0;else if(R0.morphTargetsCount!==c8)J8=!0}else J8=!0,R0.__version=x.version;let y6=R0.currentProgram;if(J8===!0)y6=j$(x,T,h);let n6=!1,n7=!1,BJ=!1,V8=y6.getUniforms(),d8=R0.uniforms;if(A0.useProgram(y6.program))n6=!0,n7=!0,BJ=!0;if(x.id!==n)n=x.id,n7=!0;if(n6||f!==M){if(A0.buffers.depth.getReversed()&&M.reversedDepth!==!0)M._reversedDepth=!0,M.updateProjectionMatrix();V8.setValue(P,"projectionMatrix",M.projectionMatrix),V8.setValue(P,"viewMatrix",M.matrixWorldInverse);let A7=V8.map.cameraPosition;if(A7!==void 0)A7.setValue(P,e0.setFromMatrixPosition(M.matrixWorld));if(w8.logarithmicDepthBuffer)V8.setValue(P,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2));if(x.isMeshPhongMaterial||x.isMeshToonMaterial||x.isMeshLambertMaterial||x.isMeshBasicMaterial||x.isMeshStandardMaterial||x.isShaderMaterial)V8.setValue(P,"isOrthographic",M.isOrthographicCamera===!0);if(f!==M)f=M,n7=!0,BJ=!0}if(R0.needsLights){if(V6.state.directionalShadowMap.length>0)V8.setValue(P,"directionalShadowMap",V6.state.directionalShadowMap,k);if(V6.state.spotShadowMap.length>0)V8.setValue(P,"spotShadowMap",V6.state.spotShadowMap,k);if(V6.state.pointShadowMap.length>0)V8.setValue(P,"pointShadowMap",V6.state.pointShadowMap,k)}if(h.isSkinnedMesh){V8.setOptional(P,h,"bindMatrix"),V8.setOptional(P,h,"bindMatrixInverse");let f8=h.skeleton;if(f8){if(f8.boneTexture===null)f8.computeBoneTexture();V8.setValue(P,"boneTexture",f8.boneTexture,k)}}if(h.isBatchedMesh){if(V8.setOptional(P,h,"batchingTexture"),V8.setValue(P,"batchingTexture",h._matricesTexture,k),V8.setOptional(P,h,"batchingIdTexture"),V8.setValue(P,"batchingIdTexture",h._indirectTexture,k),V8.setOptional(P,h,"batchingColorTexture"),h._colorsTexture!==null)V8.setValue(P,"batchingColorTexture",h._colorsTexture,k)}let B7=l.morphAttributes;if(B7.position!==void 0||B7.normal!==void 0||B7.color!==void 0)j0.update(h,l,y6);if(n7||R0.receiveShadow!==h.receiveShadow)R0.receiveShadow=h.receiveShadow,V8.setValue(P,"receiveShadow",h.receiveShadow);if((x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial)&&x.envMap===null&&T.environment!==null)d8.envMapIntensity.value=T.environmentIntensity;if(d8.dfgLUT!==void 0)d8.dfgLUT.value=oR();if(n7){if(V8.setValue(P,"toneMappingExposure",I.toneMappingExposure),R0.needsLights)GD(d8,BJ);if(q0&&x.fog===!0)X0.refreshFogUniforms(d8,q0);X0.refreshMaterialUniforms(d8,x,N0,C0,L.state.transmissionRenderTarget[M.id]),C$.upload(P,cH(R0),d8,k)}if(x.isShaderMaterial&&x.uniformsNeedUpdate===!0)C$.upload(P,cH(R0),d8,k),x.uniformsNeedUpdate=!1;if(x.isSpriteMaterial)V8.setValue(P,"center",h.center);if(V8.setValue(P,"modelViewMatrix",h.modelViewMatrix),V8.setValue(P,"normalMatrix",h.normalMatrix),V8.setValue(P,"modelMatrix",h.matrixWorld),x.isShaderMaterial||x.isRawShaderMaterial){let f8=x.uniformsGroups;for(let A7=0,AJ=f8.length;A7<AJ;A7++){let sH=f8[A7];K0.update(sH,y6),K0.bind(sH,y6)}}return y6}function GD(M,T){M.ambientLightColor.needsUpdate=T,M.lightProbe.needsUpdate=T,M.directionalLights.needsUpdate=T,M.directionalLightShadows.needsUpdate=T,M.pointLights.needsUpdate=T,M.pointLightShadows.needsUpdate=T,M.spotLights.needsUpdate=T,M.spotLightShadows.needsUpdate=T,M.rectAreaLights.needsUpdate=T,M.hemisphereLights.needsUpdate=T}function RD(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return u},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return p},this.setRenderTargetTextures=function(M,T,l){let x=G.get(M);if(x.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,x.__autoAllocateDepthBuffer===!1)x.__useRenderToTexture=!1;G.get(M.texture).__webglTexture=T,G.get(M.depthTexture).__webglTexture=x.__autoAllocateDepthBuffer?void 0:l,x.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,T){let l=G.get(M);l.__webglFramebuffer=T,l.__useDefaultFramebuffer=T===void 0};let LD=P.createFramebuffer();this.setRenderTarget=function(M,T=0,l=0){p=M,u=T,C=l;let x=null,h=!1,q0=!1;if(M){let Y0=G.get(M);if(Y0.__useDefaultFramebuffer!==void 0){A0.bindFramebuffer(P.FRAMEBUFFER,Y0.__webglFramebuffer),i.copy(M.viewport),d.copy(M.scissor),m=M.scissorTest,A0.viewport(i),A0.scissor(d),A0.setScissorTest(m),n=-1;return}else if(Y0.__webglFramebuffer===void 0)k.setupRenderTarget(M);else if(Y0.__hasExternalTextures)k.rebindTextures(M,G.get(M.texture).__webglTexture,G.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let h0=M.depthTexture;if(Y0.__boundDepthTexture!==h0){if(h0!==null&&G.has(h0)&&(M.width!==h0.image.width||M.height!==h0.image.height))throw Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");k.setupDepthRenderbuffer(M)}}let G0=M.texture;if(G0.isData3DTexture||G0.isDataArrayTexture||G0.isCompressedArrayTexture)q0=!0;let L0=G.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget){if(Array.isArray(L0[T]))x=L0[T][l];else x=L0[T];h=!0}else if(M.samples>0&&k.useMultisampledRTT(M)===!1)x=G.get(M).__webglMultisampledFramebuffer;else if(Array.isArray(L0))x=L0[l];else x=L0;i.copy(M.viewport),d.copy(M.scissor),m=M.scissorTest}else i.copy(o).multiplyScalar(N0).floor(),d.copy(W0).multiplyScalar(N0).floor(),m=z0;if(l!==0)x=LD;if(A0.bindFramebuffer(P.FRAMEBUFFER,x))A0.drawBuffers(M,x);if(A0.viewport(i),A0.scissor(d),A0.setScissorTest(m),h){let Y0=G.get(M.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+T,Y0.__webglTexture,l)}else if(q0){let Y0=T;for(let G0=0;G0<M.textures.length;G0++){let L0=G.get(M.textures[G0]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+G0,L0.__webglTexture,l,Y0)}}else if(M!==null&&l!==0){let Y0=G.get(M.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,Y0.__webglTexture,l)}n=-1},this.readRenderTargetPixels=function(M,T,l,x,h,q0,F0,Y0=0){if(!(M&&M.isWebGLRenderTarget)){y0("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let G0=G.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&F0!==void 0)G0=G0[F0];if(G0){A0.bindFramebuffer(P.FRAMEBUFFER,G0);try{let L0=M.textures[Y0],h0=L0.format,d0=L0.type;if(M.textures.length>1)P.readBuffer(P.COLOR_ATTACHMENT0+Y0);if(!w8.textureFormatReadable(h0)){y0("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!w8.textureTypeReadable(d0)){y0("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(T>=0&&T<=M.width-x&&(l>=0&&l<=M.height-h))P.readPixels(T,l,x,h,S.convert(h0),S.convert(d0),q0)}finally{let L0=p!==null?G.get(p).__webglFramebuffer:null;A0.bindFramebuffer(P.FRAMEBUFFER,L0)}}},this.readRenderTargetPixelsAsync=async function(M,T,l,x,h,q0,F0,Y0=0){if(!(M&&M.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let G0=G.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&F0!==void 0)G0=G0[F0];if(G0)if(T>=0&&T<=M.width-x&&(l>=0&&l<=M.height-h)){A0.bindFramebuffer(P.FRAMEBUFFER,G0);let L0=M.textures[Y0],h0=L0.format,d0=L0.type;if(M.textures.length>1)P.readBuffer(P.COLOR_ATTACHMENT0+Y0);if(!w8.textureFormatReadable(h0))throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!w8.textureTypeReadable(d0))throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let _0=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,_0),P.bufferData(P.PIXEL_PACK_BUFFER,q0.byteLength,P.STREAM_READ),P.readPixels(T,l,x,h,S.convert(h0),S.convert(d0),0);let q8=p!==null?G.get(p).__webglFramebuffer:null;A0.bindFramebuffer(P.FRAMEBUFFER,q8);let P8=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Ez(P,P8,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,_0),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,q0),P.deleteBuffer(_0),P.deleteSync(P8),q0}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,T=null,l=0){let x=Math.pow(2,-l),h=Math.floor(M.image.width*x),q0=Math.floor(M.image.height*x),F0=T!==null?T.x:0,Y0=T!==null?T.y:0;k.setTexture2D(M,0),P.copyTexSubImage2D(P.TEXTURE_2D,l,0,0,F0,Y0,h,q0),A0.unbindTexture()};let BD=P.createFramebuffer(),AD=P.createFramebuffer();if(this.copyTextureToTexture=function(M,T,l=null,x=null,h=0,q0=0){let F0,Y0,G0,L0,h0,d0,_0,q8,P8,_8=M.isCompressedTexture?M.mipmaps[q0]:M.image;if(l!==null)F0=l.max.x-l.min.x,Y0=l.max.y-l.min.y,G0=l.isBox3?l.max.z-l.min.z:1,L0=l.min.x,h0=l.min.y,d0=l.isBox3?l.min.z:0;else{let d8=Math.pow(2,-h);if(F0=Math.floor(_8.width*d8),Y0=Math.floor(_8.height*d8),M.isDataArrayTexture)G0=_8.depth;else if(M.isData3DTexture)G0=Math.floor(_8.depth*d8);else G0=1;L0=0,h0=0,d0=0}if(x!==null)_0=x.x,q8=x.y,P8=x.z;else _0=0,q8=0,P8=0;let Y8=S.convert(T.format),c8=S.convert(T.type),R0;if(T.isData3DTexture)k.setTexture3D(T,0),R0=P.TEXTURE_3D;else if(T.isDataArrayTexture||T.isCompressedArrayTexture)k.setTexture2DArray(T,0),R0=P.TEXTURE_2D_ARRAY;else k.setTexture2D(T,0),R0=P.TEXTURE_2D;P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,T.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,T.unpackAlignment);let V6=P.getParameter(P.UNPACK_ROW_LENGTH),J8=P.getParameter(P.UNPACK_IMAGE_HEIGHT),y6=P.getParameter(P.UNPACK_SKIP_PIXELS),n6=P.getParameter(P.UNPACK_SKIP_ROWS),n7=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,_8.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,_8.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,L0),P.pixelStorei(P.UNPACK_SKIP_ROWS,h0),P.pixelStorei(P.UNPACK_SKIP_IMAGES,d0);let BJ=M.isDataArrayTexture||M.isData3DTexture,V8=T.isDataArrayTexture||T.isData3DTexture;if(M.isDepthTexture){let d8=G.get(M),B7=G.get(T),f8=G.get(d8.__renderTarget),A7=G.get(B7.__renderTarget);A0.bindFramebuffer(P.READ_FRAMEBUFFER,f8.__webglFramebuffer),A0.bindFramebuffer(P.DRAW_FRAMEBUFFER,A7.__webglFramebuffer);for(let AJ=0;AJ<G0;AJ++){if(BJ)P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,G.get(M).__webglTexture,h,d0+AJ),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,G.get(T).__webglTexture,q0,P8+AJ);P.blitFramebuffer(L0,h0,F0,Y0,_0,q8,F0,Y0,P.DEPTH_BUFFER_BIT,P.NEAREST)}A0.bindFramebuffer(P.READ_FRAMEBUFFER,null),A0.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(h!==0||M.isRenderTargetTexture||G.has(M)){let d8=G.get(M),B7=G.get(T);A0.bindFramebuffer(P.READ_FRAMEBUFFER,BD),A0.bindFramebuffer(P.DRAW_FRAMEBUFFER,AD);for(let f8=0;f8<G0;f8++){if(BJ)P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,d8.__webglTexture,h,d0+f8);else P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,d8.__webglTexture,h);if(V8)P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,B7.__webglTexture,q0,P8+f8);else P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,B7.__webglTexture,q0);if(h!==0)P.blitFramebuffer(L0,h0,F0,Y0,_0,q8,F0,Y0,P.COLOR_BUFFER_BIT,P.NEAREST);else if(V8)P.copyTexSubImage3D(R0,q0,_0,q8,P8+f8,L0,h0,F0,Y0);else P.copyTexSubImage2D(R0,q0,_0,q8,L0,h0,F0,Y0)}A0.bindFramebuffer(P.READ_FRAMEBUFFER,null),A0.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(V8)if(M.isDataTexture||M.isData3DTexture)P.texSubImage3D(R0,q0,_0,q8,P8,F0,Y0,G0,Y8,c8,_8.data);else if(T.isCompressedArrayTexture)P.compressedTexSubImage3D(R0,q0,_0,q8,P8,F0,Y0,G0,Y8,_8.data);else P.texSubImage3D(R0,q0,_0,q8,P8,F0,Y0,G0,Y8,c8,_8);else if(M.isDataTexture)P.texSubImage2D(P.TEXTURE_2D,q0,_0,q8,F0,Y0,Y8,c8,_8.data);else if(M.isCompressedTexture)P.compressedTexSubImage2D(P.TEXTURE_2D,q0,_0,q8,_8.width,_8.height,Y8,_8.data);else P.texSubImage2D(P.TEXTURE_2D,q0,_0,q8,F0,Y0,Y8,c8,_8);if(P.pixelStorei(P.UNPACK_ROW_LENGTH,V6),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,J8),P.pixelStorei(P.UNPACK_SKIP_PIXELS,y6),P.pixelStorei(P.UNPACK_SKIP_ROWS,n6),P.pixelStorei(P.UNPACK_SKIP_IMAGES,n7),q0===0&&T.generateMipmaps)P.generateMipmap(R0);A0.unbindTexture()},this.initRenderTarget=function(M){if(G.get(M).__webglFramebuffer===void 0)k.setupRenderTarget(M)},this.initTexture=function(M){if(M.isCubeTexture)k.setTextureCube(M,0);else if(M.isData3DTexture)k.setTexture3D(M,0);else if(M.isDataArrayTexture||M.isCompressedArrayTexture)k.setTexture2DArray(M,0);else k.setTexture2D(M,0);A0.unbindTexture()},this.resetState=function(){u=0,C=0,p=null,A0.reset(),Z0.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return eX}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(J){this._outputColorSpace=J;let $=this.getContext();$.drawingBufferColorSpace=a0._getDrawingBufferColorSpace(J),$.unpackColorSpace=a0._getUnpackColorSpace()}}var E$=80,DD=8,fH=6,kD=0.002,rR=0.008,tR=0.003;class hH{renderer;scene=new sZ;camera;_leafGeometry=null;_leafMesh=null;_leafVelocities=null;_elapsedMs=0;constructor(J,$){this.renderer=new vH({antialias:!1,stencil:!0,alpha:!0}),this.renderer.setSize(J,$),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.camera=new t8(55,J/$,0.1,100),this.camera.position.set(0,0,5)}getContext(){return this.renderer.getContext()}resize(J,$){this.renderer.setSize(J,$),this.camera.aspect=J/$,this.camera.updateProjectionMatrix()}addTeaHouseEffects(){this.scene.fog=new M$(1707269,0.04),this.scene.background=new l0(853762),this._buildLeafParticles(),this._buildLanternLights()}tick(J){this._elapsedMs+=J,this._updateLeaves(),this.renderer.resetState(),this.renderer.render(this.scene,this.camera)}dispose(){if(this._leafGeometry?.dispose(),this._leafMesh?.material instanceof L7)this._leafMesh.material.dispose();this.renderer.dispose()}_buildLeafParticles(){let J=new Float32Array(E$*3),$=new Float32Array(E$*3),Q=new Float32Array(E$*3),Z=[new l0(12740893),new l0(15245351),new l0(9124367),new l0(13936723)];for(let K=0;K<E$;K+=1){let W=K*3;J[W]=(Math.random()-0.5)*DD,J[W+1]=(Math.random()-0.5)*fH+3,J[W+2]=(Math.random()-0.5)*2,$[W]=(Math.random()-0.5)*tR,$[W+1]=-(kD+Math.random()*(rR-kD)),$[W+2]=0;let X=Z[Math.floor(Math.random()*Z.length)];Q[W]=X.r,Q[W+1]=X.g,Q[W+2]=X.b}this._leafGeometry=new M6,this._leafGeometry.setAttribute("position",new K6(J,3)),this._leafGeometry.setAttribute("color",new K6(Q,3)),this._leafMesh=new rZ(this._leafGeometry,new R$({size:0.08,vertexColors:!0,transparent:!0,opacity:0.75,sizeAttenuation:!0})),this._leafVelocities=$,this.scene.add(this._leafMesh)}_buildLanternLights(){let J=[[-2.5,1.5,1],[2.5,1.5,1],[0,2,0.5]];for(let[$,Q,Z]of J){let K=new ZK(16755268,1.2,4);K.position.set($,Q,Z),this.scene.add(K)}this.scene.add(new WK(3152392,0.4))}_updateLeaves(){if(!this._leafGeometry||!this._leafVelocities)return;let J=this._leafVelocities,$=this._leafGeometry.getAttribute("position"),Q=$?.array;if(!(Q instanceof Float32Array)||!$)return;let Z=this._elapsedMs*0.001;for(let K=0;K<E$;K+=1){let W=K*3,X=(Q[W]??0)+(J[W]??0)+Math.sin(Z+K*0.7)*0.0015,H=(Q[W+1]??0)+(J[W+1]??0),q=(Q[W+2]??0)+(J[W+2]??0);if(Q[W]=X,Q[W+1]=H,Q[W+2]=q,H<-fH/2-1)Q[W]=(Math.random()-0.5)*DD,Q[W+1]=fH/2+1,Q[W+2]=(Math.random()-0.5)*2}$.needsUpdate=!0}}var ID="lotfk:game:session-meta",R9=50,UK=60000,L9=(J)=>document.querySelector(J),eR=()=>{let J=L9('meta[name="game-session-id"]');if(!J)return null;let $=J.dataset.sessionId?.trim();if(!$)return null;let Q=L9('meta[name="game-session-locale"]')?.dataset.gameSessionLocale??"en-US",Z=L9('meta[name="game-session-resume-token"]')?.dataset.sessionResumeToken??"",K=Number.parseInt(L9('meta[name="game-session-command-queue-depth"]')?.dataset.gameSessionCommandQueueDepth??"0",10)||0,W=Number.parseInt(L9('meta[name="game-session-version"]')?.dataset.gameSessionVersion??"1",10)||1,X=Number.parseInt(L9('meta[name="game-session-resume-window-ms"]')?.dataset.gameSessionResumeWindowMs??"",10)||UK,H={sessionId:$,resumeToken:Z,locale:Q,commandQueueDepth:K,version:W,expiresAtMs:Date.now()+Math.max(X,UK)},q=KF(ID);if(!q)return H;let Y=PW(q,null);if(Y?.sessionId===$&&Y.locale.length>0&&Y.resumeToken.length>0&&Number.isFinite(Y.expiresAtMs)&&Y.expiresAtMs>Date.now())return{...H,resumeToken:Y.resumeToken,commandQueueDepth:Y.commandQueueDepth,version:Y.version,locale:Y.locale,expiresAtMs:Y.expiresAtMs};return H},JL=(J)=>{WF(ID,JSON.stringify({...J,expiresAtMs:Math.max(J.expiresAtMs,Date.now()+UK)}))},$L=(J,$)=>{let Q=window.location.protocol==="https:"?"wss:":"ws:",Z=ZF(QF.gameApiSessionWebSocket,{id:J}),K=new URL(`${Q}//${window.location.host}${Z}`);if($.length>0)K.searchParams.set("resumeToken",$);return K.toString()},QL=(J)=>{if(typeof J!=="string"&&typeof J!=="object")return null;if(J instanceof ArrayBuffer||J instanceof Blob)return null;let $=typeof J==="string"?PW(J,null):J;if(!$||typeof $!=="object")return null;let Q=$;if(Q.player&&Q.npcs)return Q;if(Q.state&&typeof Q.state==="object")return Q.state;return null},xH=(J,$)=>{let Q=J?.dataset.queueLabel??"queue";if(J){J.textContent=`${Q}: ${$}`;return}let Z=document.getElementById("game-session-meta");if(Z)Z.dataset.commandQueueDepth=String($)},NK=(J,$,Q)=>{if(!J)return;if($==="connecting"){J.textContent=J.dataset.connectingLabel??J.textContent??"";return}if($==="connected"){J.textContent=J.dataset.connectedLabel??J.textContent??"";return}let Z=J.dataset.disconnectedPrefix??J.textContent??"";J.textContent=typeof Q==="number"?`${Z} (${Q})`:Z},ZL=async()=>{let J=document.getElementById("game-canvas-wrapper");if(!J)return;let $=eR();if(!$)return;let Q=new hH(J.clientWidth,J.clientHeight);Q.addTeaHouseEffects(),J.appendChild(Q.renderer.domElement);let Z=new YZ;await Z.init({context:Q.getContext(),width:J.clientWidth,height:J.clientHeight,clearBeforeRender:!1,antialias:!1});let K=new B8,W=new Map,X=document.getElementById("game-command-queue"),H=document.getElementById("game-connection-status"),q=0,Y=$.commandQueueDepth,N=null,U=null;xH(X,Y),NK(H,"connecting");let V=new WebSocket($L($.sessionId,$.resumeToken));V.addEventListener("open",()=>{NK(H,"connected")}),V.addEventListener("message",(O)=>{let R=QL(O.data);if(!R)return;N=U,U=R,Y=Math.max(Y-1,0),xH(X,Y)}),V.addEventListener("close",(O)=>{NK(H,"disconnected",O.code)});let z=(O)=>{if(V.readyState!==WebSocket.OPEN)return;q+=1,V.send(JSON.stringify({commandId:crypto.randomUUID(),source:"ws",locale:$.locale,sequenceId:q,timestamp:new Date().toISOString(),ttlMs:UK,command:O})),Y+=1,xH(X,Y)};window.addEventListener("resize",()=>{Q.resize(J.clientWidth,J.clientHeight),Z.resize(J.clientWidth,J.clientHeight)});let D=new Set;window.addEventListener("keydown",(O)=>{if(O.ctrlKey||O.metaKey||O.altKey||O.repeat)return;if(D.add(O.key),O.key==="e"||O.key==="Enter"||O.key===" "){z({type:"interact"}),O.preventDefault();return}if(O.key==="Escape")z({type:"closeDialogue"}),O.preventDefault()}),window.addEventListener("keyup",(O)=>{D.delete(O.key)});let w=0,F=new l8;F.add((O)=>{let R=performance.now();if(R-w>R9){if(D.has("w")||D.has("ArrowUp"))z({type:"move",direction:"up",durationMs:R9});else if(D.has("s")||D.has("ArrowDown"))z({type:"move",direction:"down",durationMs:R9});else if(D.has("a")||D.has("ArrowLeft"))z({type:"move",direction:"left",durationMs:R9});else if(D.has("d")||D.has("ArrowRight"))z({type:"move",direction:"right",durationMs:R9});w=R}if(U)KL(U,N,Math.min((R-w)/R9,1),W,K);Q.tick(O.deltaMS),Z.resetState(),Z.render({container:K})}),F.start(),JL({sessionId:$.sessionId,resumeToken:$.resumeToken,locale:$.locale,commandQueueDepth:Y,version:$.version,expiresAtMs:$.expiresAtMs})},KL=(J,$,Q,Z,K)=>{let W=[J.player,...J.npcs];for(let X of W){let H=Z.get(X.id)??(()=>{let U=new x6;return U.anchor.set(0.5,1),K.addChild(U),Z.set(X.id,U),U})(),q=$?.player.id===X.id?$.player:$?.npcs.find((U)=>U.id===X.id),Y=q?.position.x??X.position.x,N=q?.position.y??X.position.y;H.x=Y+(X.position.x-Y)*Q-(J.camera.x??0),H.y=N+(X.position.y-N)*Q-(J.camera.y??0)}K.children.sort((X,H)=>X.y-H.y)};ZL().catch(()=>{NK(document.getElementById("game-connection-status"),"disconnected")});
