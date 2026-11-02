// The page the map WebView loads: Yandex Maps JS API 2.1 (the backend's loader URL, with coordorder=longlat so every coordinate is
// [longitude, latitude] like the backend's), the markers drawn from what React Native sends, and events posted back:
// ready · bounds (bbox + zoom, debounced) · marker (seller id) · pick (a tapped point, in pick mode) · error.
// Names reach the map only as escaped text, never as HTML.
export function mapHtml(o: { loaderUrl: string; center: [number, number]; zoom: number; debounceMs: number; pick?: boolean }): string {
  const sep = o.loaderUrl.includes("?") ? "&" : "?";
  const loader = /coordorder=/.test(o.loaderUrl) ? o.loaderUrl : `${o.loaderUrl}${sep}coordorder=longlat`;
  const cfg = JSON.stringify({ center: o.center, zoom: o.zoom, debounce: o.debounceMs, pick: !!o.pick });
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>html,body,#map{margin:0;padding:0;width:100%;height:100%;background:#E8EEF6;overflow:hidden}</style>
<script>
var CFG=${cfg};
function post(o){try{window.ReactNativeWebView.postMessage(JSON.stringify(o))}catch(e){}}
window.onerror=function(){post({type:"error",where:"script"})};
setTimeout(function(){if(!window.ymaps)post({type:"error",where:"timeout"})},15000);
</script>
<script src="${loader.replace(/"/g, "&quot;")}" onerror="post({type:'error',where:'loader'})"></script>
</head><body><div id="map"></div><script>
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var map,layer,meMark,pickMark,selected=null,lastList=[];
function bounds(){if(!map)return;var b=map.getBounds();post({type:"bounds",bbox:[b[0][0],b[0][1],b[1][0],b[1][1]],zoom:map.getZoom()})}
function draw(){
  if(!map)return;layer.removeAll();
  lastList.forEach(function(m){
    var isC=m.kind==="cluster";
    var pm=new ymaps.Placemark([m.lon,m.lat],{hintContent:esc(m.title),iconContent:isC?String(m.count):""},{preset:isC?"islands#darkBlueCircleIcon":(m.id===selected?"islands#redDotIcon":(m.verified?"islands#blueDotIcon":"islands#grayDotIcon"))});
    pm.events.add("click",function(){
      if(isC){ if(m.bbox){map.setBounds([[m.bbox[0],m.bbox[1]],[m.bbox[2],m.bbox[3]]],{checkZoomRange:true,duration:250})}else{map.setCenter([m.lon,m.lat],Math.min(map.getZoom()+2,19),{duration:250})} return; }
      selected=m.id;draw();post({type:"marker",id:m.id});
    });
    layer.add(pm);
  });
}
window.lexgo={
  setMarkers:function(list,sel){lastList=list||[];selected=sel||null;draw()},
  select:function(id){selected=id;draw()},
  setPickMode:function(on){CFG.pick=!!on},
  setMe:function(p){if(!map)return;if(meMark){map.geoObjects.remove(meMark);meMark=null}if(p){meMark=new ymaps.Placemark([p.lon,p.lat],{},{preset:"islands#geolocationIcon"});map.geoObjects.add(meMark)}},
  setPick:function(p){if(!map)return;if(pickMark){map.geoObjects.remove(pickMark);pickMark=null}if(p){pickMark=new ymaps.Placemark([p.lon,p.lat],{},{preset:"islands#redCircleDotIcon"});map.geoObjects.add(pickMark)}},
  center:function(lon,lat,zoom){if(map)map.setCenter([lon,lat],zoom||map.getZoom(),{duration:300})},
  fit:function(pts){if(!map||!pts||!pts.length)return;if(pts.length===1){map.setCenter(pts[0],14,{duration:300});return}
    var a=pts[0][0],b=pts[0][1],c=a,d=b;pts.forEach(function(p){a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1])});
    map.setBounds([[a,b],[c,d]],{checkZoomRange:true,zoomMargin:48,duration:300})}
};
if(window.ymaps){ymaps.ready(function(){
  try{
    map=new ymaps.Map("map",{center:CFG.center,zoom:CFG.zoom,controls:["zoomControl"]},{suppressMapOpenBlock:true,yandexMapDisablePoiInteractivity:true});
    layer=new ymaps.GeoObjectCollection();map.geoObjects.add(layer);
    var t=null;map.events.add("boundschange",function(){clearTimeout(t);t=setTimeout(bounds,CFG.debounce)});
    map.events.add("click",function(e){if(!CFG.pick)return;var c=e.get("coords");window.lexgo.setPick({lon:c[0],lat:c[1]});post({type:"pick",lon:c[0],lat:c[1]})});
    post({type:"ready"});bounds();
  }catch(e){post({type:"error",where:"init"})}
})}
</script></body></html>`;
}
