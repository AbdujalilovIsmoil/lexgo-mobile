const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

// Escape what could close the inline <script> or break a JS string literal.
const safeJson = (v: unknown): string => JSON.stringify(v).replace(/</g, "\\u003c").split(LS).join("\\u2028").split(PS).join("\\u2029");

const HEAD = "function post(t,d){try{window.ReactNativeWebView.postMessage(JSON.stringify({t:t,d:d}))}catch(e){}}";
const EVENTS = `{
 onAppReady:function(){post('app')},
 onDocumentReady:function(){post('ready')},
 onDocumentStateChange:function(e){post('dirty',!!(e&&e.data))},
 onError:function(e){post('error',e&&e.data&&(e.data.errorDescription||e.data.errorCode)||'')},
 onRequestClose:function(){post('close')}
}`;

// The page the WebView loads: OnlyOffice's own api.js from the document server and a DocEditor built from the
// server's config, untouched. Only browser-side `events` are added (they are not part of what the server signs).
// The desktop editor needs ~640 px: on a phone the page is laid out that wide and scaled down (pinch to zoom in).
// (The mobile editor type would fit, but needs a commercial Document Server licence — this server is Community.)
export const EDITOR_MIN_WIDTH = 640;

export function buildEditorHtml(serverUrl: string, config: Record<string, unknown>, narrow = true): string {
  const width = narrow ? `width=${EDITOR_MIN_WIDTH}` : "width=device-width";
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="${width},user-scalable=yes,viewport-fit=cover">
<style>html,body{margin:0;height:100%;overflow:hidden;background:#fff}#ed{width:100%;height:100%}</style>
<script>${HEAD}</script></head><body><div id="ed"></div>
<script src="${serverUrl}/web-apps/apps/api/documents/api.js" onerror="post('fail','api')"></script>
<script>(function(){
if(!window.DocsAPI){post('fail','api');return}
var cfg=${safeJson(config)};
cfg.events=${EVENTS};
try{window.__ed=new DocsAPI.DocEditor('ed',cfg)}catch(e){post('fail','init')}
})();</script></body></html>`;
}
