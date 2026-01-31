# CSS Organization Summary

## Changes Made

The CSS has been reorganized from a single monolithic `styles.css` into modular files for better clarity and maintainability:

### New CSS File Structure

1. **base.css** (Root level)
   - Theme variables (root)
   - Font-face definitions
   - Base document styles (body)
   - Window container styles
   - Title bar styles
   - Button and button-link styles
   - Generic anchor styling
   - Form controls (inputs & textareas)
   - Page layout helpers
   - **Used by:** All pages in the site

2. **index.css** (Root level)
   - List and list helper styles (`.custom-list`, `ul li`, etc.)
   - **Used by:** Home/index pages

3. **recipes/recipes.css** (Recipes directory)
   - Main title styles (`.main-title`)
   - Recipe title styles (`.recipe-title`)
   - **Used by:** Recipe listing page and all individual recipe pages

### Updated HTML Links

All HTML files have been updated to link to the appropriate CSS files:

- `recipes/index.html` → links to `../base.css` and `recipes.css`
- `about_me/index.html` → links to `../base.css`
- `recipes/kepta_duona/index.html` → links to `../../base.css` and `../recipes.css`
- `recipes/tinginys/index.html` → links to `../../base.css` and `../recipes.css`
- `recipes/surio_tortas/index.html` → links to `../../base.css` and `../recipes.css`
- `recipes/cirviniai_blynai/index.html` → links to `../../base.css` and `../recipes.css`
- `recipes/augusto_pyragas/index.html` → links to `../../base.css` and `../recipes.css`
- `recipes/zagareliai/zagareliai.html` → links to `../../base.css` and `../recipes.css`

## Benefits

- **Better organization**: CSS is grouped by purpose/location
- **Improved clarity**: Easier to find relevant styles for each section
- **Maintainability**: Changes to specific page styles don't affect others
- **Potential for optimization**: Can load only necessary styles per page

## Note

The original `styles.css` can be kept as a reference or removed if desired.
