# Söhn (self-hosted)

Replace the placeholder `.woff2` files in this directory with your licensed **Söhn** cuts from Order Type Foundry (or your vendor).

Expected filenames (used by `next/font/local` in `src/app/layout.tsx`):

| File | Weight |
|------|--------|
| `Sohn-Regular.woff2` | 400 |
| `Sohn-Medium.woff2` | 500 |
| `Sohn-SemiBold.woff2` | 600 |
| `Sohn-Bold.woff2` | 700 |

If your files use different names (e.g. `Sohn-Buch.woff2`), update the `src` array in `layout.tsx` to match.

**Note:** The committed placeholders are temporary Geist subsets so CI/build succeeds until real Söhn files are added.
