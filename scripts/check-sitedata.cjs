const fs = require('fs')
const html = fs.readFileSync(process.env.SITEPAGE, 'utf8')
const m = html.match(/window\.__VP_SITE_DATA__=JSON\.parse\("(.*?)"\)/)
if (!m) { console.log('NO MATCH'); process.exit(1) }
// unescape the JSON.parse string content: it's a JS string literal escaped into HTML
const inner = JSON.parse('"' + m[1] + '"')
const parsed = JSON.parse(inner)
const tc = parsed.themeConfig || {}
console.log('themeConfig keys:', Object.keys(tc).join(','))
console.log('locales keys:', Object.keys(parsed.locales || {}).join(','))
console.log('locales.root keys:', Object.keys((parsed.locales || {}).root || {}).join(','))
console.log('locales.root.themeConfig keys:', Object.keys(((parsed.locales || {}).root || {}).themeConfig || {}).join(','))
console.log('nav texts:', tc.nav ? tc.nav.map((n) => n.text).join('/') : 'MISSING')
console.log('sidebar groups:', tc.sidebar ? tc.sidebar.length : 'MISSING')
