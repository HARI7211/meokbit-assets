// Kmong e-book gig filler. usage in page: await KM.fill(sha, key, code)  (code e.g. 'KIST_R')
window.KM = {
  S: ms => new Promise(r => setTimeout(r, ms)),
  setv(el, v) { const p = el.tagName == 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('blur', { bubbles: true })); },
  async files(B, idx, items, key) { const dt = new DataTransfer();
    for (const [path, name, type] of items) { let buf = await (await fetch(B + path)).arrayBuffer();
      if (key) { const k = await crypto.subtle.importKey('raw', Uint8Array.from(atob(key), c => c.charCodeAt(0)), 'AES-GCM', false, ['decrypt']);
        buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(buf.slice(0, 12)) }, k, buf.slice(12)); }
      dt.items.add(new File([buf], name, { type })); }
    const inp = document.querySelectorAll('input[type=file]')[idx]; inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); return dt.files.length; },
  async desc(text) { const ed = document.querySelector('.tiptap.ProseMirror'); ed.focus();
    const e = ed.editor; const esc = l => l.replace(/&/g,'&amp;').replace(/>/g,'&gt;'); const html = text.split('\n').map(l => '<p>' + esc(l) + '</p>').join('');
    if (e) { e.commands.setContent(html, true); return 'editor'; }
    document.execCommand('selectAll'); const dt = new DataTransfer(); dt.setData('text/html', html); dt.setData('text/plain', text);
    ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); return 'paste'; },
  async fill(sha, key, code, blob, fname) { const B = 'https://raw.githubusercontent.com/HARI7211/meokbit-assets/' + sha + '/';
    const c = await (await fetch(B + 'c/' + code + '.json')).json(); const log = [];
    log.push(await KM.desc(c.desc));
    KM.setv(document.querySelector('textarea[name="TYPE_CONTENTS_LIST_EBOOK.valueData.description"]'), c.toc);
    KM.setv(document.querySelector('textarea[name="PACKAGE_OPTION_GROUP.valueData.packages.0.values.0.packageValue"]'), c.pkg_title);
    KM.setv(document.querySelector('textarea[name="PACKAGE_OPTION_GROUP.valueData.packages.1.values.0.packageValue"]'), c.pkg_desc);
    const ti = [...document.querySelectorAll('input[type=text]')].filter(x => x.className.includes('flex-1'));
    KM.setv(ti[0], String(c.pages)); KM.setv(ti[3], String(c.price));
    KM.setv(document.querySelector('textarea[placeholder^="결제 후 안내"]'), c.after);
    const main = document.querySelectorAll('input[type=file]')[0];
    log.push('main ' + await KM.files(B, 0, [['i/' + code + '_main.png', code + '_main.png', 'image/png']]));
    await KM.S(2500);
    const pv = []; for (let i = 1; i <= c.prev; i++) pv.push(['i/' + code + '_p' + i + '.jpg', code + '_p' + i + '.jpg', 'image/jpeg']);
    log.push('prev ' + await KM.files(B, 3, pv)); await KM.S(4000);
    if (blob) { log.push('pdf ' + await KM.files(B, 4, [['b/' + blob + '.bin', fname, /\.zip$/.test(fname) ? 'application/zip' : 'application/pdf']], key)); await KM.S(6000); }
    return log; }
};

KM.click = el => { el.scrollIntoView({block:'center'}); el.click(); };
KM.leaf = (root, txt) => [...root.querySelectorAll('*')].find(x => x.children.length == 0 && x.innerText && x.innerText.trim() == txt);
KM.pick = async (labelTxt, optTxt) => { const b = [...document.querySelectorAll('label')].find(x => x.innerText.includes(labelTxt)).closest('button');
  b.click(); await KM.S(700); const o = [...document.querySelectorAll('[data-tippy-root]')].map(t => KM.leaf(t, optTxt)).find(Boolean); if (!o) throw 'no opt ' + optTxt; o.click(); await KM.S(700); };
KM.step1 = async (title) => { const t = document.querySelector('input[placeholder="제목을 입력해 주세요"]'); KM.setv(t, title); await KM.S(400);
  await KM.pick('1차 카테고리', '전자책'); await KM.pick('2차 카테고리', '취업·시험·자격증 전자책'); await KM.pick('3차 카테고리', '공기업·공공기관 취업 전자책');
  [...document.querySelectorAll('button')].find(x => x.innerText.trim() == '다음').click();
  for (let i = 0; i < 30 && !/edit\/\d+/.test(location.href); i++) await KM.S(500); await KM.S(2500); return location.href; };
KM.extras = async () => { const cb = document.querySelector('input[type=checkbox]'); if (cb && cb.checked) { cb.closest('label,div').click(); await KM.S(600); if (cb.checked) cb.click(); await KM.S(600); }
  const inp = document.getElementById('react-select-gig-metadata-1-input'); inp.focus();
  inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, bubbles: true })); await KM.S(700);
  const o = [...document.querySelectorAll('[id^=react-select-gig-metadata-1-option]')].find(x => x.innerText.trim() == 'PDF'); if (o) o.click(); await KM.S(600); inp.blur();
  return cb ? cb.checked : null; };
KM.save = async () => { [...document.querySelectorAll('button')].find(x => x.innerText.trim() == '임시 저장하기').click();
  for (let i = 0; i < 20; i++) { await KM.S(500); if (document.body.innerText.includes('저장됐어요')) return 'saved'; } return 'nosave'; };
KM.state = () => { const sec = i => { let p = document.querySelectorAll('input[type=file]')[i]; for (let k = 0; k < 6; k++) p = p.parentElement; return p; };
  return { main: sec(0).querySelectorAll('img').length, prev: sec(3).querySelectorAll('img').length, pdf: (sec(4).innerText.match(/[^\n]+\.(pdf|zip)/) || [''])[0],
    vals: [...document.querySelectorAll('input[type=text]')].map(x => x.value).join('|'), pkg: document.querySelector('input[type=checkbox]')?.checked,
    fmt: document.getElementById('react-select-gig-metadata-1-input').closest('[class*=-container]').innerText }; };
KM.create = async (sha, key, code, blob, fname, title) => { const u = await KM.step1(title); const r = await KM.fill(sha, key, code, blob, fname); const pk = await KM.extras(); await KM.S(1000);
  const st = KM.state(); const sv = await KM.save(); return { u, r, pk, st, sv }; };
'KM ok';
