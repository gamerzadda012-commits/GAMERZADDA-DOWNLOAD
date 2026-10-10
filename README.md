# GAMERZADDA Download Landing Page (HTML + CSS + JavaScript)

## Files
- `index.html` — page structure and SEO metadata
- `style.css` — responsive light-blue, green and red gaming design
- `script.js` — mobile menu, APK download handler and progress UI

## Before publishing
1. Put the real APK at `app/downloads/gamerzadda.apk` under the website document root. The download button is configured to use `/app/downloads/gamerzadda.apk`.
2. If the APK uses a different domain and you want in-page download progress, configure that APK server's CORS response and `Content-Length` header. Otherwise the page falls back to the browser-managed download.
3. Replace `https://download.example.com/` in `index.html` with the final public URL of this download page (canonical, JSON-LD). Do not use the app/backend domain by mistake.
4. Replace sample preview cards with real, approved app screenshots before publishing.
5. Add a real favicon and Open Graph image at `assets/favicon.png` and `assets/og-image.jpg`, or remove those tags until the files exist.
6. Confirm app version, file size, compatibility and support details. Do not publish unverified claims.

## Run locally
Open `index.html` in a browser. For more accurate fetch/download testing, run a local static server instead of opening the file directly.

## SEO checklist
- Keep one clear H1 and useful unique page copy.
- Add `robots.txt` and `sitemap.xml` using the final domain.
- Verify the final domain in Google Search Console and submit the sitemap.
- Use a real HTTPS domain, compressed screenshots, and a valid APK URL.
- Do not expect any language or schema to guarantee a #1 ranking.
