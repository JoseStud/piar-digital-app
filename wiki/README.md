# wiki/ — source for the GitHub wiki

This folder is the canonical source for the project's GitHub wiki at
`https://github.com/JoseStud/piar-digital-app/wiki`. Wiki edits made
through GitHub's web UI will be overwritten on the next sync from this
folder, so changes go through PRs against this folder.

## Layout

GitHub wiki convention: every top-level `.md` file becomes a wiki page.
The filename (with hyphens) becomes the page name. `Home.md` is the
landing page. `_Sidebar.md` is shown on every page.

All page content is in **Spanish** because the audience is Colombian
educators, IT staff, and evaluators. This README is in English because
it is for developers maintaining the wiki source.

## Pushing to the live wiki

```bash
# 1. Clone the wiki repo (one-time setup)
git clone https://github.com/JoseStud/piar-digital-app.wiki.git ../piar-wiki

# 2. Sync the markdown files
rsync -av --delete --exclude README.md wiki/ ../piar-wiki/

# 3. Commit and push from the wiki repo
cd ../piar-wiki
git add .
git commit -m "Sync wiki content from main repo"
git push
```

A small `scripts/sync-wiki.sh` script could automate this — TODO if
the wiki update cadence becomes high.

## Image references

Pages reference images like `![alt](images/foo.png)` for screenshots
that have not yet been added. The image filenames are listed in a TODO
block at the bottom of each page that needs them.
