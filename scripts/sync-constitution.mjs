/**
 * 同步脚本：保证 VitePress 源目录 docs/constitution 内存在完整的宪章文稿。
 *
 * 背景：仓库历史版本把 100 份中文宪章文稿放在仓库根目录（00-99.md），
 * 而本站点的 VitePress 源根是 docs/，宪章文稿约定位于 docs/constitution/。
 * 本脚本在构建前检查：若 docs/constitution 中缺少对应文件，则从仓库根目录
 * 复制补齐；已存在的文件一律跳过（不覆盖），兼容"仓库已自带 docs/constitution"的情况。
 *
 * 复制清单：
 *   - 00-99 编号宪章文档（00-衡元宙宇宙总览.md ... 99-文档版本与维护说明.md）
 *   - glossary.md（15 语种术语对照表）
 *   - charter-supplement-01.md / charter-supplement-02.md（三百阿赖耶锚点律法体系配套细则）
 *   - charter-vulnerability-01.md（宪章漏洞审查·红队报告）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const docsDir = path.join(repoRoot, 'docs')
const targetDir = path.join(docsDir, 'constitution')

const EXTRA_FILES = [
  'glossary.md',
  'charter-supplement-01.md',
  'charter-supplement-02.md',
  'charter-vulnerability-01.md',
]

function collectNumberedDocs() {
  if (!fs.existsSync(repoRoot)) return []
  return fs
    .readdirSync(repoRoot)
    .filter((f) => /^\d{2}-.+\.md$/.test(f))
    .sort()
}

function main() {
  fs.mkdirSync(targetDir, { recursive: true })

  const toCopy = [...collectNumberedDocs(), ...EXTRA_FILES]
  let copied = 0
  let skipped = 0
  let missing = 0

  for (const file of toCopy) {
    const src = path.join(repoRoot, file)
    const dst = path.join(targetDir, file)
    if (!fs.existsSync(src)) {
      // 根目录没有该文件：若目标已有则视为正常，否则记录缺失（不阻断构建）
      if (!fs.existsSync(dst)) missing++
      continue
    }
    if (fs.existsSync(dst)) {
      skipped++
      continue
    }
    fs.copyFileSync(src, dst)
    copied++
  }

  const total = fs.readdirSync(targetDir).filter((f) => f.endsWith('.md')).length
  console.log(
    `[sync-constitution] docs/constitution 共 ${total} 个 md 文件；本次复制 ${copied}，跳过已有 ${skipped}，缺失 ${missing}。`,
  )
  if (missing > 0) {
    console.warn(`[sync-constitution] 警告：有 ${missing} 个文件在仓库根目录与目标目录中都不存在，请检查源文档是否完整。`)
  }
}

main()
