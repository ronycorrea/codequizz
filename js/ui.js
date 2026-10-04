export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths = {
  logout:'M9 4H4v16h5m6-12 4 4-4 4m-7-4h11',
  menu:'M4 6h16M4 12h16M4 18h16', expand:'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5',
  arrow:'M5 12h14m-5-5 5 5-5 5', back:'M19 12H5m5-5-5 5 5 5', play:'m9 5 11 7-11 7Z',
  home:'m3 10 9-7 9 7v10h-6v-7H9v7H3Z', world:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z',
  trophy:'M8 3h8v8a4 4 0 0 1-8 0ZM8 5H4v3c0 3 2 4 4 4m8-7h4v3c0 3-2 4-4 4m-4 3v6m-4 0h8',
  target:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-5 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  chart:'M4 20h16M7 16v-5m5 5V5m5 11V8', settings:'M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  sound:'m3 9 5 0 5-4v14l-5-4H3Zm13-1c3 2 3 6 0 8m3-11c5 4 5 10 0 14', mute:'m3 9 5 0 5-4v14l-5-4H3Zm14 0 5 6m0-6-5 6',
  user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2', lock:'M6 10h12v11H6Zm3 0V6a3 3 0 0 1 6 0v4',
  coin:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-6-4h-5v8h5', check:'m5 12 4 4L19 6', close:'m6 6 12 12M18 6 6 18',
  bolt:'m13 2-9 12h7l-1 8 10-12h-7Z', bulb:'M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0l-1 2H9Z',
  skip:'m4 5 10 7L4 19Zm14 0v14', flag:'M5 21V3h14l-3 4 3 4H5', help:'M9 8a3 3 0 1 1 5 3c-2 1-2 2-2 3m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', upload:'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5', trash:'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7', code:'m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18', star:'m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4L3 9.7l6.2-.9Z'
};
export const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.code}"/></svg>`;
export const starRow = count => `<span class="stars" aria-label="${count} de 3 estrelas">${[0,1,2].map(i => icon('star', i < count ? 'filled' : 'empty')).join('')}</span>`;
export function avatar(id, cls = '') {
  const android = id === 'android';
  return `<span class="avatar ${android ? 'android' : ''} ${cls}" aria-hidden="true"><svg viewBox="0 0 64 64" shape-rendering="crispEdges"><path fill="${android ? '#4fb99b' : '#8061da'}" d="M12 8h40v44H12z"/><path fill="${android ? '#c5f4df' : '#ffd1a3'}" d="M20 16h24v24H20z"/><path fill="#27213f" d="M24 24h4v8h-4zm12 0h4v8h-4zM28 36h8v4h-8z"/><path fill="${android ? '#217e70' : '#4d36a3'}" d="M16 44h32v12H16z"/><path fill="#f8edbd" d="M28 44h8v8h-8z"/>${android ? '<path fill="#4fb99b" d="M28 4h8v8h-8zM8 20h4v16H8zm44 0h4v16h-4z"/>' : '<path fill="#4d36a3" d="M16 12h32v8H16zM16 20h8v4h-8z"/>'}</svg></span>`;
}
export function island(visual = 'camp', cls = '') {
  const colors = {camp:['#6e62d8','#504696','#9be0c5','#bdebdc'],fort:['#8b83ad','#615a83','#d5ccec','#e8e2f4'],city:['#3caaa8','#287b8b','#a6e1dc','#cff3ef'],lab:['#7384d7','#4d62b0','#bbd1ff','#dfebff'],dimension:['#c473b3','#81529d','#edbedf','#f8dced']}[visual];
  return `<svg class="island ${cls}" viewBox="0 0 500 360" fill="none" aria-hidden="true"><ellipse cx="250" cy="320" rx="165" ry="20" fill="#252140" opacity=".08"/><path d="m65 209 185-94 185 94-185 99Z" fill="${colors[2]}"/><path d="m65 209 185 99v43L65 252Z" fill="${colors[0]}"/><path d="m250 308 185-99v43l-185 99Z" fill="${colors[1]}"/><path d="m82 211 168-84 168 84-168 85Z" fill="${colors[3]}"/><path d="m145 248 111-53 85 44" stroke="white" stroke-width="14"/><path d="m145 248 111-53 85 44" stroke="${colors[0]}" stroke-width="2" stroke-dasharray="5 9"/>
  <path d="m191 127 79-40 79 40-79 40Z" fill="#e9e5fc"/><path d="m191 127 79 40v71l-79-40Z" fill="#b7a9ef"/><path d="m270 167 79-40v71l-79 40Z" fill="#8b74d6"/><path d="m200 112 70-35 70 35-70 36Z" fill="#fff"/><path d="m200 112 70 36v16l-70-36Z" fill="#d6cef8"/><path d="m270 148 70-36v16l-70 36Z" fill="#a69bdd"/>
  <path d="m215 139 40 20v32l-40-20Z" fill="#3b345e"/><path d="m222 152 8 4-8 4m20-2 8 4-8 4" stroke="#bdf4dd" stroke-width="3"/><path d="m296 175 29-15v31l-29 15Z" fill="#4b3b80"/><path d="m300 177 6-3v5l-6 3Z" fill="#ffd175"/><path d="m282 80 0-38 35 14-35 14" fill="#f79860" stroke="#56467b" stroke-width="3"/>
  <g fill="#46a789"><path d="m125 192 0-43 22-11 0 43Z"/><path d="m147 181 22 11v-43l-22-11Z" fill="#268a78"/><path d="m125 149 22-11 22 11-22 12Z" fill="#88d7b7"/><path d="m365 219 0-43 22-11 0 43Z"/><path d="m387 208 22 11v-43l-22-11Z" fill="#268a78"/><path d="m365 176 22-11 22 11-22 12Z" fill="#88d7b7"/></g>
  <path d="m116 253 15-8 15 8-15 8Z" fill="#fbb26b"/><path d="m116 253 15 8v10l-15-8Z" fill="#e59151"/><path d="m131 261 15-8v10l-15 8Z" fill="#c87846"/><path d="m352 117 13-7 13 7-13 7Z" fill="#c5b8f6"/><path d="m352 117 13 7v14l-13-7Z" fill="#a58be2"/><path d="m365 124 13-7v14l-13 7Z" fill="#7e65c0"/>
  <path d="M88 86h28m-14-14v28M400 77h20m-10-10v20" stroke="#b6a6e8" stroke-width="3"/><rect x="112" y="112" width="8" height="8" fill="#f2b264"/><rect x="420" y="155" width="7" height="7" fill="#a38bde"/></svg>`;
}
export function toast(message) { const n = document.querySelector('#notice'); n.textContent = message; n.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { n.hidden = true; }, 6000); }
