import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const NEO_BASE = [
  'border-2',
  'font-extrabold',
  'rounded-[10px]',
  'active:translate-y-[3px]',
];

function variantValues(src) {
  const out = {};
  for (const m of src.matchAll(/(\w+):\s*["']([^"']*)["']/g)) out[m[1]] = m[2];
  return out;
}

function buttonBlocks(src) {
  return src.split('<Button').slice(1).map((b) => b.slice(0, b.indexOf('</Button>')));
}

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith('.tsx')) acc.push(p);
  }
  return acc;
}

describe('neo-scope: button.tsx kembali ke default, neo hanya via variant', () => {
  const btn = read('components/ui/button.tsx');

  it('T1 base dikembalikan ke pra-neo', () => {
    assert.ok(btn.includes('rounded-4xl'), 'base harus rounded-4xl');
    assert.ok(btn.includes('font-medium'), 'base harus font-medium');
    assert.ok(
      btn.includes('active:not-aria-[haspopup]:translate-y-px'),
      'base harus translate-y-px',
    );
    assert.ok(!btn.includes('rounded-[10px]'), 'base tidak boleh rounded-[10px]');
    assert.ok(!btn.includes('font-extrabold'), 'tidak boleh font-extrabold');
    assert.ok(
      !btn.includes('active:translate-y-[3px]'),
      'tidak boleh active:translate-y-[3px]',
    );
  });

  it('T2 variant default/outline/secondary bebas token neo', () => {
    const v = variantValues(btn);
    for (const name of ['default', 'outline', 'secondary']) {
      assert.ok(v[name], `variant ${name} harus ada`);
      assert.ok(!v[name].includes('ink-900'), `${name} tidak boleh ink-900`);
      assert.ok(!v[name].includes('shadow-button'), `${name} tidak boleh shadow-button`);
    }
  });

  it('T3 variant neobrutalism utuh (tidak berubah)', () => {
    const v = variantValues(btn);
    for (const cls of ['border-ink-900', 'bg-primary', 'text-ink-900', 'shadow-button']) {
      assert.ok(v.neobrutalism.includes(cls), `neobrutalism harus memuat ${cls}`);
    }
  });

  it('T4 ghost/destructive/link tidak berubah', () => {
    const v = variantValues(btn);
    assert.equal(
      v.ghost,
      'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground',
    );
    assert.equal(
      v.destructive,
      'bg-destructive/40 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20',
    );
    assert.equal(v.link, 'text-primary underline-offset-4 hover:underline');
  });
});

describe('neo-scope: pin eksplisit di area freeze (landing/auth)', () => {
  it('T5 Hero CTA primer+sekunder di-pin ke visual neo', () => {
    const hero = read('components/landing/Hero.tsx');
    const blocks = buttonBlocks(hero);
    assert.equal(blocks.length, 2, 'Hero harus punya 2 Button');
    for (const b of blocks) {
      assert.ok(b.includes('variant="neobrutalism"'), 'Hero Button harus neobrutalism');
      for (const cls of NEO_BASE) assert.ok(b.includes(cls), `Hero Button harus ${cls}`);
    }
    assert.ok(blocks[1].includes('bg-paper-white'), 'CTA sekunder bg-paper-white');
  });

  it('T6 Navbar Login/Redeem di-pin ke visual neo', () => {
    const nav = read('components/shared/Navbar.tsx');
    const blocks = buttonBlocks(nav);
    assert.equal(blocks.length, 4, 'Navbar harus punya 4 Button');
    for (const b of blocks) {
      assert.ok(b.includes('variant="neobrutalism"'), 'Navbar Button harus neobrutalism');
      for (const cls of NEO_BASE) assert.ok(b.includes(cls), `Navbar Button harus ${cls}`);
    }
    const login = blocks.filter((b) => b.includes('Login'));
    const redeem = blocks.filter((b) => b.includes('Redeem'));
    assert.equal(login.length, 2);
    assert.equal(redeem.length, 2);
    for (const b of login) assert.ok(b.includes('bg-paper-white'), 'Login bg-paper-white');
    for (const b of redeem) {
      assert.ok(b.includes('text-primary-foreground'), 'Redeem text-primary-foreground');
    }
  });

  it('T7 OauthButton tidak lagi outline soft (diganti T16)', () => {
    const oauth = read('components/shared/OauthButton.tsx');
    assert.ok(!oauth.includes('variant="outline"'), 'outline soft harus hilang');
    assert.ok(!oauth.includes('shadow-xs'), 'shadow-xs harus hilang');
  });

  it('T8 authSubmitButtonClassName memulihkan base neo', () => {
    const c = read('components/auth/constants.ts');
    // rounded-xl sudah ada sejak awal (menimpa radius base) — dipertahankan.
    for (const cls of ['border-2', 'font-extrabold', 'active:translate-y-[3px]', 'rounded-xl']) {
      assert.ok(c.includes(cls), `constants harus memuat ${cls}`);
    }
    assert.ok(!c.includes('rounded-[10px]'), 'constants tetap rounded-xl, bukan [10px]');
  });

  it('T11 tidak ada Button default/outline/secondary di direktori freeze', () => {
    const allow = new Set(['neobrutalism', 'ghost', 'destructive', 'link']);
    const dirs = [
      'pages/landing',
      'pages/auth',
      'components/landing',
      'components/auth',
      'components/layouts',
    ];
    const bad = [];
    for (const d of dirs) {
      for (const f of walk(join(ROOT, d))) {
        const src = readFileSync(f, 'utf8');
        for (const b of buttonBlocks(src)) {
          const m = b.match(/variant="([^"]+)"/);
          if (!m) bad.push(`${f} (tanpa variant = default)`);
          else if (!allow.has(m[1])) bad.push(`${f} (variant="${m[1]}")`);
        }
      }
    }
    assert.deepEqual(bad, [], `pemakaian non-neo di area freeze:\n${bad.join('\n')}`);
  });
});

describe('neo-scope addendum: input neo khusus auth', () => {
  const inp = read('components/ui/input.tsx');

  it('T12 input default verbatim soft (dashboard aman)', () => {
    assert.ok(inp.includes('inputVariants'), 'input.tsx harus mengekspor inputVariants');
    const v = variantValues(inp);
    assert.ok(v.default, 'variant default harus ada');
    for (const cls of ['border-input', 'bg-card', 'rounded-xl']) {
      assert.ok(v.default.includes(cls), `default harus memuat ${cls}`);
    }
    assert.ok(!v.default.includes('ink-900'), 'default tidak boleh ink-900');
    assert.ok(!v.default.includes('shadow-button'), 'default tidak boleh shadow-button');
  });

  it('T13 variant auth neo (tanpa translate)', () => {
    const v = variantValues(inp);
    assert.ok(v.auth, 'variant auth harus ada');
    for (const cls of ['border-ink-900', 'bg-paper-white', 'shadow-button']) {
      assert.ok(v.auth.includes(cls), `auth harus memuat ${cls}`);
    }
    assert.ok(!v.auth.includes('translate'), 'input auth tidak boleh translate');
  });

  it('T14 variant="auth" hanya dipakai di 4 halaman auth', () => {
    const expected = [
      'pages/auth/ForgotPass.tsx',
      'pages/auth/Login.tsx',
      'pages/auth/Register.tsx',
      'pages/auth/ResetPass.tsx',
    ];
    const found = [];
    for (const f of walk(ROOT)) {
      if (readFileSync(f, 'utf8').includes('variant="auth"')) {
        found.push(f.slice(ROOT.length + 1));
      }
    }
    assert.deepEqual(found.sort(), expected, `pemakai variant="auth":\n${found.join('\n')}`);
    assert.ok(
      read('components/ui/input.tsx').includes('auth:'),
      'input.tsx harus mendefinisikan variant auth',
    );
    assert.ok(
      read('components/shared/Input.tsx').includes("'auth'"),
      'GlobalInput harus mendukung auth',
    );
  });

  it('T15 authInputClassName pensiun total', () => {
    const bad = [];
    for (const f of walk(ROOT)) {
      if (readFileSync(f, 'utf8').includes('authInputClassName')) bad.push(f);
    }
    assert.deepEqual(bad, [], `masih merujuk authInputClassName:\n${bad.join('\n')}`);
  });

  it('T16 OauthButton neo sejajar tombol Login', () => {
    const oauth = read('components/shared/OauthButton.tsx');
    const blocks = buttonBlocks(oauth);
    assert.equal(blocks.length, 2, 'OauthButton harus punya 2 Button');
    for (const b of blocks) {
      assert.ok(b.includes('variant="neobrutalism"'), 'harus neobrutalism');
      assert.ok(b.includes('bg-paper-white'), 'harus bg-paper-white');
      assert.ok(b.includes('border-2'), 'harus border-2');
      assert.ok(b.includes('font-extrabold'), 'harus font-extrabold');
    }
  });

  it('T17 toggle password kembali soft tanpa border (keputusan user)', () => {
    const t = read('components/auth/AuthPasswordToggleButton.tsx');
    assert.ok(t.includes('text-muted-foreground'), 'harus text-muted-foreground');
    assert.ok(t.includes('hover:bg-muted'), 'harus hover:bg-muted');
    assert.ok(!t.includes('border-ink-900'), 'tidak boleh border-ink-900');
    assert.ok(!t.includes('shadow-button'), 'tidak boleh shadow-button');
    assert.ok(!t.includes('bg-paper-white'), 'tidak boleh bg-paper-white');
  });

  it('T18 input auth flat saat fokus (keputusan user)', () => {
    const v = variantValues(read('components/ui/input.tsx'));
    assert.ok(v.auth.includes('focus:shadow-none'), 'fokus harus flat (shadow-none)');
    assert.ok(v.auth.includes('focus:border-ink-900'), 'fokus harus border ink');
    assert.ok(!v.auth.includes('ring'), 'tidak boleh ada ring apa pun');
    assert.ok(!v.auth.includes('focus-visible'), 'fokus harus selalu nyala, bukan focus-visible saja');
  });
});

describe('neo-scope: invariant penjaga', () => {
  it('T9 token CSS neo dipertahankan', () => {
    const css = readFileSync(join(ROOT, 'index.css'), 'utf8');
    assert.ok(css.includes('shadow-button'), 'index.css harus punya shadow-button');
    assert.ok(css.includes('ink-900'), 'index.css harus punya ink-900');
  });

  it('T10 dashboard bebas token neo', () => {
    const bad = [];
    for (const d of ['pages/admin', 'pages/mentor', 'pages/student']) {
      for (const f of walk(join(ROOT, d))) {
        const src = readFileSync(f, 'utf8');
        if (src.includes('ink-900') || src.includes('shadow-button')) bad.push(f);
      }
    }
    assert.deepEqual(bad, [], `dashboard mengandung token neo:\n${bad.join('\n')}`);
  });
});
