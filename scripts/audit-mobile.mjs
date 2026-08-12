import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = join(root, '.audit-mobile');
const profile = join(output, 'chrome-profile');
const baseUrl = process.argv[2] || 'http://localhost:4173';
const width = Number(process.argv[3] || 393);
const height = Number(process.argv[4] || 852);
const port = Number(process.env.CQ_AUDIT_PORT || 9337);
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const defaultPages = [
  'index.html', 'problems.html', 'puzzles.html', 'daily-challenge.html',
  'openings.html', 'learn.html', 'course-library.html', 'course.html',
  'training-game.html', 'training-target.html', 'entrainement.html',
  'analysis.html', 'game-view.html', 'coach.html', 'progress.html',
  'profile.html', 'shop.html', 'secret-levels.html', 'settings.html'
];
const requestedPages = process.argv.slice(5);
const pages = requestedPages.length ? requestedPages : defaultPages;

await rm(output, { recursive: true, force: true });
await mkdir(profile, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--disable-extensions', '--disable-background-networking',
  '--disable-breakpad', '--disable-crash-reporter', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore' });

const delay = ms => new Promise(resolveDelay => setTimeout(resolveDelay, ms));
let version;
for (let attempt = 0; attempt < 50; attempt += 1) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`);
    if (response.ok) { version = await response.json(); break; }
  } catch {}
  await delay(100);
}
if (!version) throw new Error('Chrome DevTools Protocol indisponible.');

async function inspectPage(page) {
  const pageUrl = `${baseUrl.replace(/\/$/, '')}/${page}?cqAudit=${Date.now()}`;
  const target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' }).then(response => response.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let commandId = 0;
  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener('open', resolveOpen, { once: true });
    socket.addEventListener('error', rejectOpen, { once: true });
  });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve: resolveCommand, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolveCommand(message.result);
  });
  const command = (method, params = {}) => new Promise((resolveCommand, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve: resolveCommand, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

  await command('Page.enable');
  await command('Runtime.enable');
  await command('Network.enable');
  await command('Network.clearBrowserCache');
  await command('Network.setCacheDisabled', { cacheDisabled: true });
  await command('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: true,
    screenWidth: width, screenHeight: height,
    screenOrientation: { type: 'portraitPrimary', angle: 0 }
  });
  await command('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__cqAuditErrors=[];
    addEventListener('error',event=>window.__cqAuditErrors.push({type:'error',message:event.message,source:event.filename,line:event.lineno}));
    addEventListener('unhandledrejection',event=>window.__cqAuditErrors.push({type:'rejection',message:String(event.reason&&event.reason.message||event.reason)}));
  ` });
  await command('Page.navigate', { url: pageUrl });
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const state = await command('Runtime.evaluate', { expression: `document.readyState`, returnByValue: true });
    if (state.result.value === 'complete') break;
    await delay(100);
  }
  await delay(900);

  const expression = `(() => {
    const rect = element => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { left:+box.left.toFixed(1), top:+box.top.toFixed(1), right:+box.right.toFixed(1), bottom:+box.bottom.toFixed(1), width:+box.width.toFixed(1), height:+box.height.toFixed(1), position:style.position, display:style.display, visibility:style.visibility };
    };
    const visible = element => {
      const box = element.getBoundingClientRect(), style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && +style.opacity !== 0 && box.width > 0 && box.height > 0;
    };
    const outside = [...document.querySelectorAll('a,button,input,select,textarea,[role="button"]')]
      .filter(visible).map(element => ({ tag:element.tagName, id:element.id, cls:element.className?.toString().slice(0,80), text:(element.textContent||element.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' ').slice(0,60), box:rect(element) }))
      .filter(item => item.box.left < -1 || item.box.right > innerWidth + 1);
    const nav = document.querySelector('nav.tabbar');
    const navBox = rect(nav);
    const roots = [...document.body.children].filter(element => element !== nav && visible(element)).slice(0,8).map(element => ({ tag:element.tagName, id:element.id, cls:element.className?.toString().slice(0,90), box:rect(element) }));
    return {
      viewport:{ width:innerWidth, height:innerHeight, visualWidth:visualViewport?.width, visualHeight:visualViewport?.height, scale:visualViewport?.scale },
      document:{ clientWidth:document.documentElement.clientWidth, scrollWidth:document.documentElement.scrollWidth, scrollHeight:document.documentElement.scrollHeight, bodyWidth:document.body.getBoundingClientRect().width, bodyScrollWidth:document.body.scrollWidth, bodyScrollHeight:document.body.scrollHeight },
      bodyClass:document.body.className,
      navigation:{ script:[...document.scripts].find(script=>script.src.includes('navigation.js'))?.src||null, stylesheet:[...document.styleSheets].map(sheet=>sheet.href).find(href=>href?.includes('navigation.css'))||null, version:window.QUEST_NAVIGATION_VERSION||null },
      errors:window.__cqAuditErrors||[],
      nav:navBox && { ...navBox, gapBottom:+(innerHeight-navBox.bottom).toFixed(1), safe:getComputedStyle(document.documentElement).getPropertyValue('--cq-tabbar-safe-bottom').trim() },
      roots, outside
    };
  })()`;
  const evaluated = await command('Runtime.evaluate', { expression, returnByValue: true });
  const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true });
  await writeFile(join(output, page.replace('.html', '.png')), Buffer.from(screenshot.data, 'base64'));
  socket.close();
  fetch(`http://127.0.0.1:${port}/json/close/${target.id}`, { signal: AbortSignal.timeout(500) }).catch(() => {});
  return { page, ...evaluated.result.value };
}

const results = [];
try {
  for (const page of pages) {
    try { results.push(await inspectPage(page)); }
    catch (error) { results.push({ page, error: error.message }); }
    await writeFile(join(output, 'report.json'), JSON.stringify(results, null, 2));
  }
  await writeFile(join(output, 'report.json'), JSON.stringify(results, null, 2));
  const summary = results.map(result => ({
    page: result.page,
    viewport: result.viewport ? `${result.viewport.width}x${result.viewport.height}` : 'error',
    scrollWidth: result.document?.scrollWidth,
    navGap: result.nav?.gapBottom,
    navTop: result.nav?.top,
    outside: result.outside?.length,
    error: result.error
  }));
  console.table(summary);
} finally {
  chrome.kill();
  setTimeout(() => process.exit(0), 150).unref();
}
