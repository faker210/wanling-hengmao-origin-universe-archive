/**
 * 翻译进度看板状态生成脚本
 * ============================================================
 * 扫描 docs/<lang> 下各语种译文文件，与 docs/zh（100 份中文宪章原文）逐篇比对，
 * 输出看板数据源 docs/public/dashboard/status.json（构建后位于站点 /dashboard/status.json）。
 *
 * 状态判定规则（可复现）：
 *   - zh            ：原文基准，恒为 done
 *   - 文件不存在     ：todo（待翻译）
 *   - 存在且字节数 >= max(500, zhSize * 0.2) ：done（已完成）
 *   - 存在但字节数 < 上述阈值 ：progress（进行中，通常是占位/空壳文件）
 *
 * 用法：node scripts/gen-dashboard-status.mjs
 * 建议在每次翻译批次（如 30~39 批）落地后重跑，刷新看板数据。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const docsDir = path.join(repoRoot, 'docs')
const outFile = path.join(repoRoot, 'docs', 'public', 'dashboard', 'status.json')

/** 语种展示信息（顺序即看板列顺序：先 8 个已配置语种，再按字母序补充新语种） */
const LANGUAGES = [
  { code: 'zh', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ru', label: 'Русский' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
  { code: 'ja', label: '日本語' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'de', label: 'Deutsch' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'pt', label: 'Português' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'ur', label: 'اردو' },
  { code: 'vi', label: 'Tiếng Việt' },
]

/** 10 个文档模块（与 .vitepress/config.js 的 MODULES 保持一致） */
const MODULES = [
  { key: '总纲与核心设定', start: 0, end: 9 },
  { key: '宇宙法则与修炼体系', start: 10, end: 19 },
  { key: '锚点机制与共生原理', start: 20, end: 29 },
  { key: '文明分型与社会制度', start: 30, end: 39 },
  { key: '法律体系与治理框架', start: 40, end: 49 },
  { key: '种族与生命形态', start: 50, end: 59 },
  { key: '技术与能量体系', start: 60, end: 69 },
  { key: '历史纪元与重大事件', start: 70, end: 79 },
  { key: '跨位面交互与时间规则', start: 80, end: 89 },
  { key: '附录与参考资料', start: 90, end: 99 },
]

function moduleOf(num) {
  return MODULES.find((m) => num >= m.start && num <= m.end)?.key ?? '其他'
}

/** 读取目录下全部编号文档：{ num, title, zhSize } */
function collectDocs() {
  const zhDir = path.join(docsDir, 'zh')
  if (!fs.existsSync(zhDir)) throw new Error(`缺少中文原文目录：${zhDir}`)
  return fs
    .readdirSync(zhDir)
    .filter((f) => /^\d{2}-.+\.md$/.test(f))
    .sort()
    .map((f) => {
      const m = /^(\d{2})-(.+)\.md$/.exec(f)
      return {
        num: m[1],
        title: m[2],
        zhSize: fs.statSync(path.join(zhDir, f)).size,
      }
    })
}

function judgeStatus(langCode, num, zhSize) {
  if (langCode === 'zh') return 'done'
  const dir = path.join(docsDir, langCode)
  if (!fs.existsSync(dir)) return 'todo'
  const file = fs
    .readdirSync(dir)
    .find((f) => f.startsWith(`${num}-`) && f.endsWith('.md'))
  if (!file) return 'todo'
  const size = fs.statSync(path.join(dir, file)).size
  const threshold = Math.max(500, Math.round(zhSize * 0.2))
  return size >= threshold ? 'done' : 'progress'
}

function main() {
  const docs = collectDocs()

  // 检测实际存在的语种目录（与 LANGUAGES 求并集，避免漏掉未登记目录）
  const realDirs = fs
    .readdirSync(docsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
  const langCodes = [...new Set([...LANGUAGES.map((l) => l.code), ...realDirs])].filter((c) => /^[a-z]{2}$/.test(c))
  const languages = langCodes
    .map((code) => LANGUAGES.find((l) => l.code === code))
    .filter(Boolean)
    .map((l) => ({ ...l, native: l.label }))

  const docEntries = docs.map((d) => {
    const status = {}
    for (const l of languages) status[l.code] = judgeStatus(l.code, d.num, d.zhSize)
    return {
      num: d.num,
      title: d.title,
      module: moduleOf(parseInt(d.num, 10)),
      zhSize: d.zhSize,
      status,
    }
  })

  // 汇总统计
  let done = 0
  let progress = 0
  let todo = 0
  const langStats = languages.map((l) => {
    let d = 0
    let p = 0
    let t = 0
    for (const e of docEntries) {
      const s = e.status[l.code]
      if (s === 'done') d++
      else if (s === 'progress') p++
      else t++
    }
    done += d
    progress += p
    todo += t
    return { code: l.code, label: l.label, done: d, progress: p, todo: t, total: d + p + t }
  })

  const payload = {
    schema: 1,
    generatedAt: new Date().toISOString(),
    summary: { docs: docEntries.length, languages: languages.length, done, progress, todo },
    languages,
    langStats,
    modules: MODULES,
    docs: docEntries,
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf-8')

  console.log(`[gen-dashboard-status] 文档 ${payload.summary.docs} 篇 × 语种 ${payload.summary.languages} 个`)
  console.log(`[gen-dashboard-status] 总状态：done=${done} progress=${progress} todo=${todo}`)
  for (const s of langStats) {
    console.log(
      `  ${s.code.padEnd(3)} done=${String(s.done).padStart(3)} progress=${String(s.progress).padStart(3)} todo=${String(s.todo).padStart(3)}`,
    )
  }
  console.log(`[gen-dashboard-status] 已写入 ${outFile}`)
}

main()
