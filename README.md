# HiTerratech website

Static, dependency-free, bilingual (TH/EN) site for HiTerratech Co., Ltd. No build step: the repo root is the site.

```
index.html      page
css/style.css   styles
js/main.js      language switch, reveal-on-scroll, hero canvas, effects
images/         logo, favicon, photos
404.html        not-found page (served automatically by both hosts)
_headers        Cloudflare Pages security + cache headers (ignored by GitHub Pages)
robots.txt, sitemap.xml
.nojekyll       tells GitHub Pages to serve files as-is
```

## Preview locally

```sh
python -m http.server 8080
# open http://localhost:8080
```

## Deploy — Cloudflare Pages

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Framework preset: **None**. Build command: *(leave empty)*. Build output directory: `/` (or `.`).
4. Save and deploy. Add `hiterratech.com` under **Custom domains**.

## Deploy — GitHub Pages

1. Repo → **Settings → Pages**.
2. Source: **Deploy from a branch** → `main` / `/ (root)`.
3. The site appears at `https://<user>.github.io/<repo>/` (all asset paths are relative, so the sub-path works).

> A custom domain can only point at one host. If `hiterratech.com` is on Cloudflare Pages, use the `github.io` URL for GitHub Pages as a mirror/preview.
> `404.html` uses root-relative paths (`/css…`), which is right for a custom domain but will look unstyled on a `github.io/<repo>/` sub-path.

## Editing content

All text is bilingual: every string appears twice, as `<span class="th">…</span><span class="en">…</span>`. Edit both.
