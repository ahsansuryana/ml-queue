# UI/UX Design System — SAS

## 1. Design Overview

| Aspek | Keputusan | Alasan |
|---|---|---|
| Product Type | Dashboard tool untuk streamer gaming | Queue management real-time |
| Target User | Streamer MLBB (18-30, gaming community) | Butuh workflow cepat, minimal distraksi |
| Use Context | Dipakai **sambil live streaming** | Dark mode wajib, font besar, kontras tinggi |
| Platform | Web (React + Tailwind) + OBS Overlay (HTML statis) | Akses via browser, overlay via OBS Browser Source |

---

## 2. Design Style

| Elemen | Pilihan | Rationale |
|---|---|---|
| **Style** | Dark-first, Minimalist + Gaming Accent | Nyaman di mata saat streaming malam |
| **Layout** | Sidebar + Main (desktop), Bottom nav (mobile) | Hierarki jelas: queue sebagai fokus utama |
| **Surface** | Flat dengan subtle border (bukan shadow besar) | Gaming aesthetic, clean, no visual noise |
| **Mood** | Professional, energetic, real-time | Streamer butuh informasi cepat tanpa kebingungan |

---

## 3. Color System

### Token Map

```css
/* Base */
--bg-primary:    #0a0a0b    /* Darkest background */
--bg-surface:    #141517    /* Card / container */
--bg-surface-2:  #1c1d20    /* Input / hover state */
--bg-surface-3:  #23252a    /* Elevated / active */

/* Border */
--border:        #2a2b30    /* Subtle divider */
--border-hover:  #3a3b42    /* Hover border */

/* Text */
--text-primary:   #f1f5f9    /* High emphasis */
--text-secondary: #94a3b8    /* Medium emphasis */
--text-muted:     #64748b    /* Low emphasis / placeholder */

/* Semantic */
--queue-fast:    #06b6d4    /* Cyan-500 — FASTRACK */
--queue-normal:  #8b5cf6    /* Violet-500 — NORMAL */
--success:       #22c55e    /* Green-500 */
--danger:        #ef4444    /* Red-500 — SKIP */
--warning:       #f59e0b    /* Amber-500 */
--info:          #3b82f6    /* Blue-500 */
```

### Usage Rules

| Warna | Untuk | Contrast Ratio |
|---|---|---|
| `text-primary` on `bg-primary` | Body text | 15.4:1 (AAA) |
| `text-secondary` on `bg-surface` | Labels, timestamps | 7.5:1 (AAA) |
| `text-muted` on `bg-surface` | Placeholder, disabled | 4.6:1 (AA) |
| `queue-fast` on `bg-surface` | FASTRACK badge | 5.2:1 (AA) |
| `queue-normal` on `bg-surface` | NORMAL badge | 3.8:1 (hanya untuk badge kecil) |

---

## 4. Typography

### Type Scale

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

--text-xs:   12px;  /* Badge, secondary label */
--text-sm:   13px;  /* Muted info, timestamp */
--text-base: 14px;  /* Body, queue items */
--text-lg:   16px;  /* Card title */
--text-xl:   20px;  /* Section heading */
--text-2xl:  24px;  /* Page title */
```

### Monospace Usage (tabular numbers)

Queue data (ID ML, timestamp, amounts) menggunakan **JetBrains Mono** dengan `font-variant-numeric: tabular-nums` agar angka sejajar vertikal.

### Hierarchy

| Level | Font | Size | Weight | Letter-spacing |
|---|---|---|---|---|
| Page Title | Inter | 24px | 700 | -0.02em |
| Section Title | Inter | 18px | 600 | -0.01em |
| Card Title | Inter | 14px | 600 | 0 |
| Queue Name | Inter | 14px | 500 | 0 |
| Timestamp | JetBrains Mono | 13px | 400 | 0 |
| ID ML Player | JetBrains Mono | 13px | 500 | 0.5px |
| Badge | Inter | 11px | 600 | 0.5px |

---

## 5. Components

### 5.1 Queue Card

Setiap player di queue dirender sebagai card horizontal:

```
┌──────────────────────────────────────────────────────┐
│ [FAST] 12345678  JohnDoe                   10:32     │
│                                        ⛔ SKIP 🔄 PULL│
└──────────────────────────────────────────────────────┘
```

- **Badge**: `FAST` = cyan bg, `NORM` = violet bg (pill shape, uppercase, 11px)
- **ID ML**: monospace, muted
- **Name**: primary text, semibold
- **Timestamp**: monospace, muted, right-aligned
- **Actions**: SKIP (red outline), PULL (ghost button, hidden until hover)

### 5.2 Current Batch (Group)

4 slot yang akan main:

```
┌──────────────────────────────────────────┐
│  CURRENT BATCH                           │
│                                          │
│  Slot 1  [FAST] JohnDoe        ⛔ ✅     │
│  Slot 2  [NORM] PlayerB        ⛔ ✅     │
│  Slot 3  [NORM] PlayerC        ⛔ ✅     │
│  Slot 4  ⏳ Waiting...                    │
│                                          │
│         [ CONFIRM GROUP ]                │
└──────────────────────────────────────────┘
```

- 4 slot di-grid 2×2 (desktop) atau vertical stack (mobile)
- Slot kosong: dashed border + "Waiting..."
- Tombol CONFIRM: full-width, primary cyan, disabled sampai 4 slot terisi

### 5.3 Prediction Log Table

```
┌────────┬──────────┬──────────┬────────┬────────────┐
│ Message│ Prediksi │ Koreksi  │ Status │ Action     │
├────────┼──────────┼──────────┼────────┼────────────┤
│ fastrk │ NORMAL ❌│ FAST ✅  │ FIXED  │ [View]     │
│ semgt  │ QUEUE ❌ │ SUPPORT  │ FIXED  │ [View]     │
│ 123456 │ QUEUE ✅ │ -        │ AUTO   │ —          │
└────────┴──────────┴──────────┴────────┴────────────┘
```

- Prediksi benar: green checkmark
- Prediksi salah: red X + highlight row
- Koreksi: italic, secondary text
- Row bisa diklik untuk detail + koreksi

### 5.4 Buttons

| Variant | Style | Use |
|---|---|---|
| Primary | bg cyan, white text | CONFIRM, Save |
| Danger Outline | border red, red text, transparent bg | SKIP |
| Ghost | no bg, text secondary | PULL, Cancel |
| Icon | 32×32, subtle hover bg | Edit, Delete |

### 5.5 Badges

| Variant | Style |
|---|---|
| FASTRACK | bg cyan/10, text cyan, uppercase |
| NORMAL | bg violet/10, text violet, uppercase |

### 5.6 Input & Forms

- Dark surface (`bg-surface-2`), border subtle
- Focus: cyan ring (2px)
- Helper text: text-muted 12px
- Error: red border + red helper text
- Toggle switch untuk ON/OFF (forward webhook)

---

## 6. Layout

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] SAS                             Avatar Streamer  │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │  Main Area                                   │
│ 230px    │                                              │
│          │  ┌─ Current Batch ────────────────────────┐  │
│ Dashboard│  │  Slot 1   Slot 2                       │  │
│ Queue    │  │  Slot 3   Slot 4                       │  │
│ Players  │  │           [CONFIRM]                    │  │
│ Log      │  └────────────────────────────────────────┘  │
│ Settings │  ┌─ Queue List ───────────────────────────┐  │
│          │  │ [FAST] 12345 John   10:30  ⛔🔄       │  │
│          │  │ [NORM] 67890 Jane   10:32  ⛔🔄       │  │
│          │  │ ...                                    │  │
│          │  └────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────┘
```

### Mobile (<768px)

- Sidebar collapse → hamburger menu
- Bottom navigation: Queue | Players | Log | Settings
- Batch & queue list full width

---

## 7. OBS Overlay

### Spesifikasi

| Aspek | Detail |
|---|---|
| Ukuran | 800×200px (horizontal bar) |
| Format | HTML/CSS/JS statis |
| Font | 22px + (terbaca di 720p) |
| Background | `rgba(10, 10, 11, 0.85)` |
| Update | WebSocket + fallback polling 5s |

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ANTRIAN MABAR                          3 menunggu       │
│                                                          │
│  1. JohnDoe    [FAST]  ID: 12345678     ⏳ 10:32        │
│  2. PlayerB    [NORM]  ID: 87654321     ⏳ 10:30        │
│  3. PlayerC    [NORM]  ID: 11223344     ⏳ 10:35        │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Interaction & Animation

| Elemen | Event | Animasi | Durasi |
|---|---|---|---|
| Queue Card | New entry | Flash highlight (cyan) di border | 300ms |
| Queue Card | SKIP | Slide right + fade out, card bawah slide up | 200ms |
| Queue Card | PULL | Slide up ke posisi 1 | 250ms |
| Confirm | Click | Scale (1.02→1) + glow | 200ms |
| Badge | Type change | Color transition | 150ms |
| Table row | Hover | Subtle bg change | 100ms |
| New data | WebSocket | Gentle pulse di header | 150ms |

### Easing

```css
--ease-in:  cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

- Enter: ease-out
- Exit: ease-in (lebih cepat, ±60% durasi enter)
- Micro-interactions: ease-in-out

### Reduced Motion

Semua animasi dibungkus `@media (prefers-reduced-motion: reduce)`:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 9. Accessibility

| Kriteria | Standar | Implementasi |
|---|---|---|
| Color contrast | AA (4.5:1) minimum | Semua token sudah diukur |
| Touch target | ≥44×44px | Tombol minimal 44px height |
| Keyboard nav | Tab order visual | Sidebar → Batch → Queue → Actions |
| Focus ring | Visible 2px cyan | `focus-visible:ring-2 ring-cyan-500` |
| Screen reader | aria-label, role | Queue items live region `aria-live="polite"` |
| Reduced motion | prefers-reduced-motion | Semua animasi di-disable |

---

## 10. Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Desktop | ≥1024px | Sidebar + Main |
| Tablet | 768-1023px | Collapsed sidebar + Bottom nav |
| Mobile | <768px | Full width + Bottom nav |

### Mobile Adaptations

- Bottom nav: Dashboard, Queue, Players, Settings
- Current batch: single column stack
- Queue list: swipe-to-action (skip/pull)
- Prediction log: collapsed card view (bukan tabel)

---

## 11. Design Tokens Summary

```css
:root {
  /* Colors */
  --color-bg-primary: #0a0a0b;
  --color-bg-surface: #141517;
  --color-bg-surface-2: #1c1d20;
  --color-bg-surface-3: #23252a;
  --color-border: #2a2b30;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  --color-accent-fast: #06b6d4;
  --color-accent-normal: #8b5cf6;
  --color-success: #22c55e;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing (4px base) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px;
  --space-8: 32px; --space-10: 40px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.4);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.5);

  /* Z-index */
  --z-dropdown: 50;
  --z-modal: 100;
  --z-toast: 150;
}
```
