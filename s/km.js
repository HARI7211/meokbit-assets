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
    const e = ed.editor; const esc = l => l.replace(/&/g,'&amp;').replace(/>/g,'&gt;'); const html = text.split(/\n\s*\n/).map(b => '<p>' + b.split('\n').map(esc).join('<br>') + '</p>').join('');
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
    if (blob) { log.push('pdf ' + await KM.files(B, 4, [['b/' + blob + '.bin', fname, 'application/pdf']], key)); await KM.S(6000); }
    return log; }
};
'KM ok';
