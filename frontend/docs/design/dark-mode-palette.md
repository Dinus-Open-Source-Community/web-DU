# 1. Token CSS Resmi (`.dark`)

Salin dan gantikan blok `.dark` pada `src/index.css` dengan token berikut:

```
.dark {
  color-scheme: dark;

  /* --- Surface / Paper Hierarchy --- */
  --background: #09090b;            /* Latar kanvas utama aplikasi (Zinc 950) */
  --foreground: #f4f4f5;            /* Teks utama (Zinc 100 - hindari putih murni) */
  --card: #121215;                  /* Permukaan kartu/modal (elevated) */
  --card-foreground: #f4f4f5;
  --popover: #18181b;               /* Dropdown, popover, tooltip */
  --popover-foreground: #f4f4f5;
  --secondary: #1f1f23;             /* Tombol sekunder & pill */
  --secondary-foreground: #f4f4f5;
  --muted: #1f1f23;                 /* Latar placeholder & hover ringan */
  --muted-foreground: #a1a1aa;      /* Teks sekunder/keterangan (Zinc 400) */
  --text-secondary: #a1a1aa;

  /* --- Paper Aliases (Selaras app-shell-tokens) --- */
  --color-paper-offwhite: #09090b;  /* App background */
  --color-paper-white: #121215;     /* Card background */
  --color-paper-paper: #1c1c21;     /* Header tabel / sub-surface */
  --color-paper-panel: #27272a;     /* Panel aktif / input surface */

  /* --- Ink / Text Hierarchy (WCAG Contrast Safe) --- */
  --color-ink-900: #f4f4f5;         /* Heading & judul penting */
  --color-ink-800: #e4e4e7;         /* Body teks kontras tinggi */
  --color-ink-700: #d4d4d8;         /* Label input / sub-heading */
  --color-ink-600: #a1a1aa;         /* Deskripsi & teks sekunder */
  --color-ink-500: #71717a;         /* Meta info, timestamp, placeholder */
  --color-ink-400: #52525b;         /* Disabled state & ikon non-aktif */

  /* --- Brand & Interactive --- */
  --primary: #13a8ff;
  --primary-foreground: #050914;    /* Teks gelap kontras di atas tombol biru */
  --color-brand-blue: #13a8ff;
  --color-brand-hover: #38bdf8;
  --color-brand-soft: rgba(19, 168, 255, 0.15); /* Container biru redup */
  --color-brand-ink: #7dd3fc;                   /* Teks di atas brand-soft */

  /* --- Feedback & Status --- */
  --destructive: #f43f5e;
  --destructive-foreground: #ffffff;
  --border: #27272a;                /* Garis batas umum (Zinc 800) */
  --input: #27272a;
  --ring: #13a8ff;
  --color-line-light: #27272a;
  --color-line-medium: #3f3f46;

  /* --- Playful Sticky Notes (Dark Tuned) --- */
  --color-note-mint: #064e3b;       /* Teks pasangannya: #6ee7b7 */
  --color-note-yellow: #453503;     /* Teks pasangannya: #fef08a */
  --color-note-peach: #431407;      /* Teks pasangannya: #fdba74 */
  --color-note-pink: #500724;       /* Teks pasangannya: #f472b6 */
  --color-note-sky: #082f49;        /* Teks pasangannya: #7dd3fc */
  --color-note-lavender: #2e1065;   /* Teks pasangannya: #c4b5fd */

  /* --- Neobrutalism Shadows & Depth --- */
  --shadow-paper: 0 12px 28px rgba(0, 0, 0, 0.65);
  --shadow-button: 0 3px 0 #000000;
  --shadow-button-hover: 0 5px 0 #000000;
  --shadow-button-pressed: 0 1px 0 #000000;
  --shadow-nav: 0 6px 20px rgba(0, 0, 0, 0.5);

  /* --- Sidebar Tokens --- */
  --sidebar: #0c0c0e;
  --sidebar-foreground: #f4f4f5;
  --sidebar-primary: #13a8ff;
  --sidebar-primary-foreground: #050914;
  --sidebar-accent: #1f1f23;
  --sidebar-accent-foreground: #f4f4f5;
  --sidebar-border: #27272a;
  --sidebar-ring: #13a8ff;
}
```

---

## 2. Tabel Perbandingan Nilai Warna (Light vs Dark)

| Peruntukan | Token CSS | Nilai Light | Nilai Dark | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **Latar Canvas** | `--background` / `--color-paper-offwhite` | `#FBFCFD` | `#09090B` | Zinc 950 murni |
| **Latar Card** | `--card` / `--color-paper-white` | `#FFFFFF` | `#121215` | Elevated surface |
| **Latar Sub-panel** | `--secondary` / `--color-paper-paper` | `#F6F7F8` | `#1C1C21` | Table header / section strip |
| **Latar Input / Hover** | `--muted` / `--color-paper-panel` | `#F1F3F5` | `#27272A` | Form field background |
| **Teks Utama** | `--foreground` / `--color-ink-900` | `#050914` | `#F4F4F5` | Kontras 14:1 di latar gelap |
| **Teks Sekunder** | `--muted-foreground` / `--color-ink-600` | `#56657A` | `#A1A1AA` | Zinc 400 |
| **Garis / Border** | `--border` / `--color-line-light` | `#E5E8EC` | `#27272A` | Zinc 800 subtle line |
| **Border Tegas** | `--color-line-medium` | `#CBD2DA` | `#3F3F46` | Border fokus / separator aktif |
| **Sticky Note Mint** | `--color-note-mint` | `#A8EFCF` | `#064E3B` | Emerald tua (teks: `#6ee7b7`) |
| **Sticky Note Yellow** | `--color-note-yellow` | `#FFEF9D` | `#453503` | Amber tua (teks: `#fef08a`) |
| **Sticky Note Peach** | `--color-note-peach` | `#FFC4A6` | `#431407` | Orange tua (teks: `#fdba74`) |
| **Sticky Note Pink** | `--color-note-pink` | `#F4A6CD` | `#500724` | Rose tua (teks: `#f472b6`) |
| **Sticky Note Sky** | `--color-note-sky` | `#BCEEFF` | `#082F49` | Sky tua (teks: `#7dd3fc`) |
| **Shadow Tombol Neo** | `--shadow-button` | `0 3px 0 #0B1018` | `0 3px 0 #000000` | Tetap tegas dengan border terang |

---

## 3. Panduan Tugas Developer (Aturan Eksekusi)

### DO (Wajib Dilakukan)

1. **Gunakan Semantic Tokens**:
    - Ganti semua `bg-white` menjadi `bg-card` atau `bg-paper-white`.
    - Ganti `text-slate-900`, `text-black` menjadi `text-foreground` atau `text-ink-900`.
    - Ganti `border-slate-200`, `border-gray-200` menjadi `border-border` atau `border-line-light`.
2. **Perbaiki Grid Background Dashboard**:
    - Di `src/lib/design/app-shell-tokens.ts`:\
      export const appDashboardGridOverlayStyle: CSSProperties = {\
        backgroundImage:\
         'linear-gradient(to right, var(--color-line-medium) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line-medium) 1px, transparent 1px)',\
        backgroundSize: '24px 24px',\
      }
3. **Pemasangan Warna Badge / Sticky Notes**:
    - Jangan biarkan badge hanya diset `bg-note-yellow` tanpa kelas teks khusus, karena `text-ink-900` di dark mode akan menjadi putih (putih di atas kuning = tidak terbaca).
    - Selalu pasangkan warna latar note dengan teks berpasangan:
        - `bg-note-mint text-emerald-300 border-emerald-800/40`
        - `bg-note-yellow text-amber-200 border-amber-800/40`
        - `bg-note-peach text-orange-200 border-orange-800/40`
