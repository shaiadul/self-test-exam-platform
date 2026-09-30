# Frontend Component & Mobile-First UX Guidelines

This guide defines design standards, spacing scales, and responsive patterns for creating new pages and UI components across the Self-Test Exam Platform.

---

## 1. Core Principles

1. **Mobile-First Realities**:
   - Mobile viewports typically measure **360px to 400px** in width.
   - The outer application container (`DashboardLayoutClient.tsx`) already applies `p-3.5 sm:p-5`.
   - Any unconditional inner card padding like `p-6` (24px) or `p-8` (32px) consumes up to **64px** of horizontal space, leaving less than 300px for content, which breaks buttons and crushes form fields.

2. **Rule of Thumb for Spacing**:
   - **NEVER** use fixed desktop padding (`p-5`, `p-6`, `p-8`) without a mobile breakpoint override (`sm:`).
   - Use `p-3.5 sm:p-5` or `p-3.5 sm:p-4` for cards and form sections.
   - Use `gap-4 sm:gap-6` for multi-column grids.

---

## 2. Standard Spacing & Sizing Scale

| Component Element | Recommended Responsive Classes | Anti-Pattern to Avoid |
| :--- | :--- | :--- |
| **Page Root Container** | `<PageContainer className="space-y-4 sm:space-y-6">` | `space-y-8` / `space-y-10` |
| **Card / Form Section** | `p-3.5 sm:p-5` or `p-3.5 sm:p-4` | Fixed `p-5`, `p-6`, or `p-8` |
| **Card Section Headers** | `px-3.5 sm:px-4 py-2.5 sm:py-3` | Fixed `px-6 py-4` |
| **Two-Column Form Grid** | `grid grid-cols-1 sm:grid-cols-2 gap-4` | Fixed `gap-6` on mobile |
| **Page Layout Grid (4/8 or 7/5)** | `grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6` | Fixed `gap-8` on mobile |
| **Cards Grid (e.g. Exam Packs)** | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5` | Fixed `gap-6` |
| **Modal Dialog Container** | `p-4 sm:p-6 max-w-md w-full` | Fixed `p-8` |
| **Buttons (HUD / Header)** | `!text-xs !py-1.5 !px-3.5 !rounded` | Large fixed button heights |

---

## 3. Form Bottom Action Bar (Submit / Cancel HUD)

When building any form, create/edit view, or settings page, **always** use the standardized responsive HUD pattern.

### Why This Pattern?
- On **mobile (< 640px)**: The container stacks vertically (`flex-col`), centers status text, and spreads buttons evenly (`w-full sm:w-auto`), preventing button wrapping or text truncation.
- On **desktop (≥ 640px)**: The container switches to a horizontal row (`sm:flex-row`), aligning the info notice on the left and actions on the right (`sm:justify-between`, `sm:justify-end`).

### Blueprint Code

```tsx
import { PrimaryBtn } from "@/components/ui/PrimaryBtn";
import { OutlineBtn } from "@/components/ui/OutlineBtn";
import { FaSave } from "react-icons/fa";
import { useRouter } from "next/navigation";

// Inside your form component:
const router = useRouter();

<div className="rounded bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-center sm:justify-between mx-auto gap-3">
  <div className="text-xs text-slate-500">
    Ready to save your changes
  </div>

  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
    <OutlineBtn
      type="button"
      onClick={() => router.back()}
      className="!text-xs !py-1.5 !px-3.5 !rounded"
    >
      Cancel
    </OutlineBtn>

    <PrimaryBtn
      type="submit"
      disabled={loading}
      className="!text-xs !py-1.5 !px-4 gap-1.5 !rounded shadow-2xs"
    >
      {loading ? (
        <>
          <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
          <span>Saving…</span>
        </>
      ) : (
        <>
          <FaSave className="text-[11px]" />
          <span>Save Changes</span>
        </>
      )}
    </PrimaryBtn>
  </div>
</div>
```

---

## 4. Top Header Command Strip Pattern

Every dashboard subpage should include a responsive command strip with an icon back button and breadcrumb/status badge:

```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
  <div className="flex items-center gap-3">
    <OutlineBtn
      onClick={() => router.back()}
      className="!p-2 !rounded !text-slate-600 hover:!text-primary shadow-2xs border-slate-200 cursor-pointer"
      title="Back"
    >
      <FaArrowLeft className="text-xs" />
    </OutlineBtn>
    <div>
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
        Page Title
      </h1>
      <p className="text-xs text-slate-500 font-medium mt-0.5">
        Sub-description or instructions for this screen.
      </p>
    </div>
  </div>

  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
    Active Status Badge
  </span>
</div>
```

---

## 5. Desktop Table vs. Mobile Cards Pattern

Raw HTML tables without horizontal responsiveness break layout on mobile devices. Always implement the dual-view pattern:

```tsx
<div className="bg-white rounded border border-slate-200/80 shadow-2xs overflow-hidden">
  {/* Header */}
  <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
      Records ({items.length})
    </span>
  </div>

  {/* 1. Desktop Table (Hidden on Mobile) */}
  <div className="hidden sm:block overflow-x-auto">
    <table className="w-full text-left border-collapse">
      {/* <thead> and <tbody> with px-4 py-3 */}
    </table>
  </div>

  {/* 2. Mobile Cards (Visible only on Mobile) */}
  <div className="block sm:hidden divide-y divide-slate-100">
    {items.map((item) => (
      <div key={item.id} className="p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-bold text-xs text-slate-900">{item.title}</span>
          <span className="text-[10px] font-mono text-slate-400">#{item.id}</span>
        </div>
        {/* Actions row */}
      </div>
    ))}
  </div>
</div>
```

---

## 6. Modal Dialogs Pattern

Modal overlays must remain scrollable and well-padded on short or narrow phone screens:

```tsx
<div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4">
  <div className="bg-white max-w-md w-full rounded p-4 sm:p-6 border border-slate-200/80 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
    {/* Modal Header */}
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <h3 className="text-sm font-bold text-slate-900">Modal Header</h3>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
        <FaTimes className="text-xs" />
      </button>
    </div>

    {/* Content */}
    <div className="space-y-3">
      {/* Inputs */}
    </div>

    {/* Modal Action Buttons */}
    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
      <OutlineBtn onClick={onClose} className="!text-xs !py-1.5 !px-3.5 !rounded">
        Cancel
      </OutlineBtn>
      <PrimaryBtn onClick={onConfirm} className="!text-xs !py-1.5 !px-4 !rounded">
        Confirm
      </PrimaryBtn>
    </div>
  </div>
</div>
```

---

## 7. Checklist When Creating a New Component

Before submitting code for review, verify:

- [ ] **No Unconditional Desktop Padding**: Did you replace fixed `p-5` / `p-6` with `p-3.5 sm:p-5` or `p-3.5 sm:p-4`?
- [ ] **Responsive Stacking**: Do horizontal button groups have `flex-col sm:flex-row` and `w-full sm:w-auto`?
- [ ] **Grid Breakpoints**: Do multi-column inputs use `grid-cols-1 sm:grid-cols-2` or `md:grid-cols-2`?
- [ ] **Input & Select Heights**: Are you using `@/components/ui/Input` and `@/components/ui/CustomSelect` rather than raw unstyled elements?
- [ ] **Mobile Testing**: Test your component at **360px viewport width** in browser dev tools to ensure no horizontal scrollbars appear.
- [ ] **Build Validation**: Run `npm run build` to ensure all TypeScript types and exports are error-free.
