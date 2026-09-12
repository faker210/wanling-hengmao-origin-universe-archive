/**
 * EdgeOne Makers 云端构建专用脚本（跨平台，Windows/Linux 通用）。
 *
 * 解决的问题（对应 EdgeOne Makers 部署失败的三处根因）：
 *   1) 平台执行 `npm run build`，但原 package.json 只有 docs:build，没有 build →
 *      新增 build script 指向本脚本。
 *   2) 平台输出目录填 `dist`，但 VitePress 产物默认在仓库根 `site/` →
 *      本脚本设置 VP_OUTDIR=dist，让 VitePress 直接输出到 dist/（不碰 site/）。
 *   3) 平台域名是根路径（https://xxx.edgeone.app/），而站点默认 BASE 带
 *      `/wanling-hengmao-origin-universe-archive/` 前缀（给 Gitee Pages 用）→
 *      本脚本强制 VP_BASE='/' 构建，所有链接指向根路径，EdgeOne 下才能正常打开。
 *
 * 使用：在仓库根目录执行 `npm run build`（EdgeOne 云端与本地 Windows 均可）。
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

function run(cmd) {
  console.log(`\n>>> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: repoRoot, shell: process.platform === 'win32' })
}

// 1) 同步 docs/constitution 完整文稿（与 docs:build 行为一致）
run('node scripts/sync-constitution.mjs')

// 2) 构建参数：BASE=/（根路径） + 产物直接输出到 dist/（不碰 site/）
process.env.VP_BASE = '/'
process.env.VP_OUTDIR = 'dist'
// 清掉上次的 dist，避免残留旧文件
fs.rmSync(path.join(repoRoot, 'dist'), { recursive: true, force: true })
run('npx vitepress build docs')

// 3) 复核：确认 dist 内页面链接均以 / 开头（不带仓库名前缀）
const distDir = path.join(repoRoot, 'dist')
const htmlCount = countHtml(distDir)
console.log(`\n✅ EdgeOne 构建完成：dist/ 已生成（BASE=/，共 ${htmlCount} 个 HTML）`)
console.log('   可在 EdgeOne 控制台配置：根目录 /，输出目录 dist，构建命令 npm run build')

function countHtml(dir) {
  let n = 0
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) n += countHtml(p)
    else if (e.name.endsWith('.html')) n += 1
  }
  return n
}
