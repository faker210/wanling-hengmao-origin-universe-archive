/**
 * ============================================================
 * 衡元宙 · 锚点共生文明设定文库 —— VitePress 主配置
 * ============================================================
 * 部署目标：Gitee Pages 免费版（纯静态，无后端）
 * 仓库名：wanling-hengmao-origin-universe-archive（Pages 访问地址为
 *         https://lihanlin-wanling.gitee.io/wanling-hengmao-origin-universe-archive/）
 *
 * 目录约定（兼容仓库现有 md 路径）：
 *   docs/constitution/        —— 100 份中文宪章文稿（00-99）+ 术语对照表 + 配套细则
 *   docs/<lang>/              —— 语种译文（en/fr/ru/hi/es/ar/ja 等，文件名与中文版一致）
 *   docs/index.md             —— 首页
 *   docs/multiverse/          —— 诸天角色推演板块
 *   docs/sandbox/             —— 交互沙盘入口页（内嵌 public/sandbox/sandbox.html）
 *   docs/public/              —— VitePress 静态资源目录（原样复制到产物根）
 *
 * 构建命令（在仓库根执行）：
 *   npm install
 *   npm run docs:build        # 先同步 docs/constitution，再构建，产物输出到仓库根 site/
 *
 * 修改要点：
 *   1) 若 Gitee 仓库名不是 wanling-hengmao-origin-universe-archive，改 BASE 常量（见下）。
 *   2) 语种列表在 LOCALES 中维护；侧边栏按目录实际存在的文件自动生成，不会出现死链。
 */
import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// docs/.vitepress/ → 仓库根
const repoRoot = path.resolve(__dirname, '..', '..')
const docsDir = path.join(repoRoot, 'docs')

/**
 * 站点根路径（base）。
 * Gitee Pages 项目页地址为 https://<用户名>.gitee.io/<仓库名>/，base 必须等于 "/<仓库名>/"。
 * 本地想要以根路径预览可执行：PowerShell 里先 `$env:VP_BASE="/"` 再 `npm run docs:build`。
 */
const BASE = process.env.VP_BASE || '/wanling-hengmao-origin-universe-archive/'

/* ------------------------------------------------------------------ */
/* 语种与导航文案                                                        */
/* ------------------------------------------------------------------ */

const LOCALES = [
  { code: 'zh', label: '简体中文', lang: 'zh-CN', dir: 'constitution', prefix: '/constitution', firstDoc: '00-衡元宙宇宙总览' },
  { code: 'en', label: 'English', lang: 'en', dir: 'en', prefix: '/en', firstDoc: '00-衡元宙宇宙总览' },
  { code: 'fr', label: 'Français', lang: 'fr', dir: 'fr', prefix: '/fr', firstDoc: '00-衡元宙宇宙总览' },
  { code: 'ru', label: 'Русский', lang: 'ru', dir: 'ru', prefix: '/ru', firstDoc: '00-衡元宙宇宙总览' },
  { code: 'hi', label: 'हिन्दी', lang: 'hi', dir: 'hi', prefix: '/hi', firstDoc: '00-衡元宙宇宙总览' },
  { code: 'es', label: 'Español', lang: 'es', dir: 'es', prefix: '/es', firstDoc: '00-衡元宙宇宙总览' },
  { code: 'ar', label: 'العربية', lang: 'ar', dir: 'ar', prefix: '/ar', firstDoc: '00-衡元宙宇宙总览' },
  { code: 'ja', label: '日本語', lang: 'ja', dir: 'ja', prefix: '/ja', firstDoc: '00-衡元宙宇宙总览' },
]

const NAV_LABELS = {
  home: { zh: '首页', en: 'Home', fr: 'Accueil', ru: 'Главная', hi: 'होम', es: 'Inicio', ar: 'الرئيسية', ja: 'ホーム' },
  library: { zh: '宪章文库', en: 'Constitution', fr: 'Constitution', ru: 'Хартия', hi: 'संविधान', es: 'Constitución', ar: 'الدستور', ja: '憲章文庫' },
  multiverse: { zh: '诸天推演', en: 'Multiverse', fr: 'Multivers', ru: 'Мультивселенная', hi: 'बहुब्रह्मांड', es: 'Multiverso', ar: 'الأكوان المتعددة', ja: '諸天推演' },
  sandbox: { zh: '交互沙盘', en: 'Sandbox', fr: 'Bac à sable', ru: 'Песочница', hi: 'सैंडबॉक्स', es: 'Simulador', ar: 'المحاكاة', ja: '沙盤シミュレーター' },
  dashboard: { zh: '翻译进度', en: 'Translation Progress', fr: 'Avancement des traductions', ru: 'Прогресс перевода', hi: 'अनुवाद प्रगति', es: 'Progreso de traducción', ar: 'تقدم الترجمة', ja: '翻訳進捗', bn: 'অনুবাদের অগ্রগতি', de: 'Übersetzungsfortschritt', id: 'Progres Terjemahan', pt: 'Progresso de tradução', sw: 'Maendeleo ya Tafsiri', ur: 'ترجمے کی پیشرفت', vi: 'Tiến độ dịch thuật' },
}

const CHARTER_SUPPLEMENT_GROUP = {
  zh: '配套细则（三百阿赖耶锚点律法体系）',
  en: 'Charter Supplements (300 Alaya Anchors)',
  fr: 'Annexes de la Charte (300 Ancres Alaya)',
  ru: 'Дополнения к хартии (300 якорей Алая)',
  hi: 'चार्टर परिशिष्ट (300 आलय लंगर)',
  es: 'Suplementos de la Carta (300 Anclas Alaya)',
  ar: 'ملاحق الميثاق (300 مرساة ألايا)',
  ja: '憲章配套細則（三百阿頼耶錨点律法体系）',
}

const GLOSSARY_GROUP = {
  zh: '术语对照表（15 语种）',
  en: 'Glossary (15 languages)',
  fr: 'Glossaire (15 langues)',
  ru: 'Глоссарий (15 языков)',
  hi: 'शब्दावली (15 भाषाएँ)',
  es: 'Glosario (15 idiomas)',
  ar: 'المعجم (15 لغة)',
  ja: '用語対照表（15言語）',
}

/* ------------------------------------------------------------------ */
/* 侧边栏自动生成                                                        */
/* ------------------------------------------------------------------ */

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

const MODULE_L10N = {
  总纲与核心设定: { zh: '总纲与核心设定', en: 'General Principles & Core Settings', fr: 'Principes Généraux et Cadre Fondamental', ru: 'Общие принципы и ядро мироустройства', hi: 'सामान्य सिद्धांत एवं मूल सेटिंग्स', es: 'Principios Generales y Marco Fundamental', ar: 'المبادئ العامة والإعدادات الأساسية', ja: '総綱と核心設定' },
  宇宙法则与修炼体系: { zh: '宇宙法则与修炼体系', en: 'Cosmic Laws & Cultivation Systems', fr: 'Lois Cosmiques et Systèmes de Culture', ru: 'Космические законы и системы культивации', hi: 'ब्रह्मांडीय नियम एवं साधना प्रणालियाँ', es: 'Leyes Cósmicas y Sistemas de Cultivo', ar: 'قوانين الكون وأنظمة الزراعة', ja: '宇宙法則と修練体系' },
  锚点机制与共生原理: { zh: '锚点机制与共生原理', en: 'Anchor Mechanics & Symbiosis', fr: 'Mécanique des Ancres et Symbiose', ru: 'Механика якорей и симбиоз', hi: 'लंगर तंत्र एवं सहजीवन', es: 'Mecánica del Ancla y Simbiosis', ar: 'آلية المرساة والتكافل', ja: '錨点機制と共生原理' },
  文明分型与社会制度: { zh: '文明分型与社会制度', en: 'Civilization Types & Social Systems', fr: 'Types de Civilisation et Systèmes Sociaux', ru: 'Типы цивилизаций и общественные системы', hi: 'सभ्यता प्रकार एवं सामाजिक व्यवस्थाएँ', es: 'Tipos de Civilización y Sistemas Sociales', ar: 'أنماط الحضارة والنظم الاجتماعية', ja: '文明分型と社会制度' },
  法律体系与治理框架: { zh: '法律体系与治理框架', en: 'Legal System & Governance', fr: 'Système Juridique et Gouvernance', ru: 'Правовая система и управление', hi: 'कानूनी व्यवस्था एवं शासन', es: 'Sistema Legal y Gobernanza', ar: 'النظام القانوني والحوكمة', ja: '法律体系と治理枠組み' },
  种族与生命形态: { zh: '种族与生命形态', en: 'Races & Life Forms', fr: 'Races et Formes de Vie', ru: 'Расы и формы жизни', hi: 'जातियाँ एवं जीवन रूप', es: 'Razas y Formas de Vida', ar: 'الأجناس وأشكال الحياة', ja: '種族と生命形態' },
  技术与能量体系: { zh: '技术与能量体系', en: 'Technology & Energy Systems', fr: 'Technologies et Systèmes Énergétiques', ru: 'Технологии и энергетические системы', hi: 'प्रौद्योगिकी एवं ऊर्जा प्रणालियाँ', es: 'Tecnología y Sistemas Energéticos', ar: 'التقنية وأنظمة الطاقة', ja: '技術とエネルギー体系' },
  历史纪元与重大事件: { zh: '历史纪元与重大事件', en: 'Epochs & Major Events', fr: 'Époques et Événements Majeurs', ru: 'Эпохи и ключевые события', hi: 'युग एवं प्रमुख घटनाएँ', es: 'Épocas y Grandes Acontecimientos', ar: 'العصور والأحداث الكبرى', ja: '歴史紀元と重大事件' },
  跨位面交互与时间规则: { zh: '跨位面交互与时间规则', en: 'Cross-Plane Interaction & Time Rules', fr: 'Interactions Inter-Plans et Règles Temporelles', ru: 'Межплоскостные взаимодействия и правила времени', hi: 'अंतर-विमान संपर्क एवं समय नियम', es: 'Interacción Transplanar y Reglas Temporales', ar: 'التفاعل عبر المستويات وقواعد الزمن', ja: '跨位面交互と時間規則' },
  附录与参考资料: { zh: '附录与参考资料', en: 'Appendices & References', fr: 'Annexes et Références', ru: 'Приложения и справочники', hi: 'परिशिष्ट एवं संदर्भ', es: 'Apéndices y Referencias', ar: 'الملاحق والمراجع', ja: '付録と参考資料' },
}

const SUPPLEMENT_FILES = [
  ['charter-supplement-01', '配套细则·第一辑（阿赖耶锚点律法）', 'Supplement I (Alaya Anchor Law)'],
  ['charter-supplement-02', '配套细则·第二辑（虚拟宇宙沙盘）', 'Supplement II (Virtual Cosmos Sandbox)'],
  ['charter-vulnerability-01', '宪章漏洞审查·红队报告', 'Charter Vulnerability Review (Red Team)'],
]

/**
 * 文件名含半角 "%" 的文档（23-20%激活战略规划、75-20%激活战略实施）：
 * VitePress 会把输出文件名与路由中的半角 "%" 消毒为全角 "％"（见 hashmap.json 键），
 * 因此侧边栏链接必须指向全角 "％" 路由，否则 404。源文件路径保持不变（兼容仓库现有路径）。
 */
const PCT_FILES = {
  '23-20%激活战略规划': '23-20％激活战略规划',
  '75-20%激活战略实施': '75-20％激活战略实施',
}

/** 读取目录下全部 md 文件名（不含扩展名） */
function listMd(baseDir) {
  if (!fs.existsSync(baseDir)) return []
  return fs
    .readdirSync(baseDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

/** 从文件名解析两位编号，非编号文件返回 null */
function docNumber(name) {
  const m = /^(\d{2})-/.exec(name)
  return m ? parseInt(m[1], 10) : null
}

function linkOf(locale, name) {
  const mapped = PCT_FILES[name]
  return mapped
    ? `${locale.prefix}/${mapped}.html`
    : `${locale.prefix}/${encodeURI(name)}.html`
}

/** 为一个语种构建侧边栏（只包含该语种目录里真实存在的文件） */
function buildSidebar(locale) {
  const code = locale.code
  const names = listMd(path.join(docsDir, locale.dir))

  const groups = MODULES.map((mod) => {
    const items = names
      .filter((n) => {
        const k = docNumber(n)
        return k !== null && k >= mod.start && k <= mod.end
      })
      .sort((a, b) => docNumber(a) - docNumber(b))
      .map((n) => ({
        text: n.replace(/^\d{2}-/, ''),
        link: linkOf(locale, n),
      }))
    if (!items.length) return null
    const label = MODULE_L10N[mod.key][code] || mod.key
    return {
      text: `${label}（${String(mod.start).padStart(2, '0')}-${String(mod.end).padStart(2, '0')}）`,
      collapsed: mod.start >= 10,
      items,
    }
  }).filter(Boolean)

  // 配套细则（三百阿赖耶锚点律法体系），仅当对应文件存在时展示
  // law-core.md 位于 docs 根目录（中文独立大章节），对中文侧边栏一并纳入
  const rootNames = listMd(docsDir)
  const suppItems = SUPPLEMENT_FILES
    .filter(([file]) => names.includes(file) || (code === 'zh' && rootNames.includes(file)))
    .map(([file, zhTitle]) => ({
      text: code === 'zh' ? zhTitle : file.replace(/-/g, ' '),
      link: names.includes(file) ? linkOf(locale, file) : `/${file}.html`,
    }))
  if (suppItems.length) {
    groups.push({
      text: CHARTER_SUPPLEMENT_GROUP[code] || CHARTER_SUPPLEMENT_GROUP.zh,
      collapsed: true,
      items: suppItems,
    })
  }

  // 术语对照表（glossary.md），仅当文件存在时展示
  if (names.includes('glossary')) {
    groups.push({
      text: GLOSSARY_GROUP[code] || GLOSSARY_GROUP.zh,
      items: [{ text: 'glossary', link: linkOf(locale, 'glossary') }],
    })
  }

  return groups
}

/** 为一个语种构建顶部导航 */
function buildNav(locale) {
  const code = locale.code
  const first = linkOf(locale, locale.firstDoc)
  const home = { text: NAV_LABELS.home[code] || 'Home', link: '/' }
  const library = { text: NAV_LABELS.library[code] || 'Constitution', link: first, activeMatch: `^${locale.prefix}/` }
  const multiverse = { text: NAV_LABELS.multiverse[code] || 'Multiverse', link: '/multiverse/', activeMatch: '^/multiverse/' }
  const sandbox = { text: NAV_LABELS.sandbox[code] || 'Sandbox', link: '/sandbox/', activeMatch: '^/sandbox/' }
  const dashboard = { text: NAV_LABELS.dashboard[code] || NAV_LABELS.dashboard.zh, link: '/dashboard/', activeMatch: '^/dashboard/' }
  return [home, library, multiverse, sandbox, dashboard]
}

/* ------------------------------------------------------------------ */
/* locales 配置（themeConfig.locales）                                  */
/* ------------------------------------------------------------------ */

// themeConfig.locales 仅保留语种标签，供右上角语言切换器使用
const themeLocales = {}
for (const locale of LOCALES) {
  const key = locale.code === 'zh' ? 'root' : locale.code
  themeLocales[key] = { label: locale.label, lang: locale.lang }
}

/* ------------------------------------------------------------------ */
/* 导出配置                                                             */
/* ------------------------------------------------------------------ */

export default defineConfig({
  title: '衡元宙 · 锚点共生文明文库',
  description:
    '万灵衡锚本源宙（衡元宙）官方设定文库：锚点共生文明 100 份宪章文档、多语种译文、诸天角色推演与文明路线交互沙盘。反掠夺，倡共生。',
  lang: 'zh-CN',
/**
 * 顶层 locales —— VitePress i18n 的必需配置（官方结构）。
 * 每个语种条目的 themeConfig 提供该语种的 nav / sidebar，
 * VitePress 会按当前路由把对应语种的 themeConfig 浅合并进站点 themeConfig。
 */
  locales: Object.fromEntries(
    LOCALES.map((l) => {
      const key = l.code === 'zh' ? 'root' : l.code
      const entry = { label: l.label, lang: l.lang }
      if (l.code === 'ar') entry.dir = 'rtl' // 阿拉伯语 RTL 排版
      if (l.code !== 'zh') entry.link = linkOf(l, l.firstDoc)
      entry.themeConfig = { nav: buildNav(l), sidebar: buildSidebar(l) }
      return [key, entry]
    }),
  ),
  base: BASE,
  cleanUrls: false,
  ignoreDeadLinks: true,
  srcDir: docsDir,
  // 产物目录：默认仓库根/site（Gitee Pages 部署目录）；
  // 腾讯云 EdgeOne 构建（npm run build）时由 scripts/edgeone-build.mjs 设置
  // VP_OUTDIR=dist，产物直接输出到仓库根/dist，互不污染。
  outDir: process.env.VP_OUTDIR
    ? path.resolve(repoRoot, process.env.VP_OUTDIR)
    : path.join(repoRoot, 'site'),

  head: [
    ['meta', { name: 'keywords', content: '衡元宙,锚点共生文明,万灵衡锚本源宙,掠夺式修炼体系,万族共进,升维,设定文库' }],
    ['meta', { property: 'og:title', content: '衡元宙 · 锚点共生文明文库' }],
    ['meta', { property: 'og:description', content: '反掠夺，倡共生 —— 锚点共生文明全套设定文档、多语种译文与交互沙盘。' }],
    [
      'link',
      {
        rel: 'icon',
        href: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2215%22 fill=%22%230b1220%22/%3E%3Cpath d=%22M16 5v18M10 11l6-6 6 6M7 23h18%22 stroke=%22%23f0c06a%22 stroke-width=%222.4%22 fill=%22none%22 stroke-linecap=%22round%22/%3E%3C/svg%3E',
      },
    ],
  ],

  themeConfig: {
    logo: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2215%22 fill=%22%230b1220%22/%3E%3Cpath d=%22M16 5v18M10 11l6-6 6 6M7 23h18%22 stroke=%22%23f0c06a%22 stroke-width=%222.4%22 fill=%22none%22 stroke-linecap=%22round%22/%3E%3C/svg%3E',
    siteTitle: '衡元宙 · 锚点共生文明文库',
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文库', buttonAriaLabel: '搜索文库' },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '清除搜索词',
                backButtonTitle: '关闭搜索',
                noResultsText: '未找到相关文档',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
              },
            },
          },
        },
      },
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: false,
    footer: {
      message: '反掠夺 · 倡共生 · 多劳多得 · 自生自长 · 人人有路 · 万族共进',
      copyright: '衡元宙（万灵衡锚本源宙）官方设定文库 · 现实为基的虚构思想实验',
    },
    locales: themeLocales,
  },
})

