<script setup>
/**
 * 自定义语言切换器
 *
 * 背景：默认切换器假设各语种目录结构镜像（docs/en/foo.md ↔ docs/foo.md），
 * 但本站中文文档在 docs/constitution/（路由 /constitution/），其他 7 语种在
 * docs/<code>/（路由 /<code>/），结构不对称，默认切换器生成的链接必然 404。
 *
 * 本组件按「路由 basename 映射」生成链接：
 *   - 当前页是宪章/译文文档（路径形如 /constitution/00-xxx.html 或 /en/00-xxx.html）：
 *     目标链接 = /<目标语种目录>/<同名 basename>.html（中文目标为 /constitution/<basename>.html）
 *     所有语种共享同一路由文件名（含全角 ％ 的处理与 VitePress 消毒一致）。
 *   - 其他页面（首页/诸天/沙盘/翻译进度等，无译文版本）：跳到该语种的第一篇文档。
 */
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useData, useRoute } from 'vitepress'

const { site, localeIndex } = useData()
const route = useRoute()

const LOCALE_META = [
  { key: 'root', code: 'zh', dir: 'constitution', label: '简体中文', firstDoc: '00-衡元宙宇宙总览' },
  { key: 'en', code: 'en', dir: 'en', label: 'English', firstDoc: '00-衡元宙宇宙总览' },
  { key: 'fr', code: 'fr', dir: 'fr', label: 'Français', firstDoc: '00-衡元宙宇宙总览' },
  { key: 'ru', code: 'ru', dir: 'ru', label: 'Русский', firstDoc: '00-衡元宙宇宙总览' },
  { key: 'hi', code: 'hi', dir: 'hi', label: 'हिन्दी', firstDoc: '00-衡元宙宇宙总览' },
  { key: 'es', code: 'es', dir: 'es', label: 'Español', firstDoc: '00-衡元宙宇宙总览' },
  { key: 'ar', code: 'ar', dir: 'ar', label: 'العربية', firstDoc: '00-衡元宙宇宙总览' },
  { key: 'ja', code: 'ja', dir: 'ja', label: '日本語', firstDoc: '00-衡元宙宇宙总览' },
]

/** 去除 base 前缀后的页面路径 */
function rawPath() {
  let p = route.path || '/'
  const base = site.value.base || '/'
  if (base !== '/' && p.startsWith(base)) p = p.slice(base.length - 1)
  if (!p.startsWith('/')) p = '/' + p
  return p
}

/** 从路径中提取文档 basename（含 .html），非文档页返回 null */
function docBasename(p) {
  const m = /^\/(?:constitution|en|fr|ru|hi|es|ar|ja)\/([^/]+\.html)$/.exec(p)
  return m ? m[1] : null
}

function linkFor(meta) {
  const base = rawPath()
  const name = docBasename(base)
  const doc = name || `${meta.firstDoc}.html`
  const path = meta.key === 'root' ? `/constitution/${doc}` : `/${meta.key}/${doc}`
  return (site.value.base || '/').replace(/\/$/, '') + path
}

const currentMeta = computed(
  () => LOCALE_META.find((m) => m.key === localeIndex.value) || LOCALE_META[0],
)

const links = computed(() =>
  LOCALE_META.filter((m) => m.key !== localeIndex.value).map((m) => ({
    label: m.label,
    link: linkFor(m),
  })),
)

const open = ref(false)
const rootEl = ref(null)

function toggle() {
  open.value = !open.value
}

function onDocClick(e) {
  if (!rootEl.value || rootEl.value.contains(e.target)) return
  open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div ref="rootEl" class="custom-lang-switcher" :class="{ open }">
    <button
      class="lang-btn"
      type="button"
      :aria-label="currentMeta.label"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="toggle"
    >
      <span class="lang-icon" aria-hidden="true">A</span>
      <span class="lang-label">{{ currentMeta.label }}</span>
      <svg class="lang-caret" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          d="M6 9l6 6 6-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <Transition name="lang-fade">
      <ul v-if="open" class="lang-menu">
        <li v-for="l in links" :key="l.link">
          <a :href="l.link">{{ l.label }}</a>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.custom-lang-switcher {
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 12px;
}
.lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  height: 32px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.25s, background-color 0.25s;
}
.lang-btn:hover {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
}
.lang-icon {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.lang-caret {
  color: var(--vp-c-text-2);
  transition: transform 0.25s;
}
.open .lang-caret {
  transform: rotate(180deg);
}
.lang-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 40;
  min-width: 132px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  box-shadow: var(--vp-shadow-3);
}
.lang-menu a {
  display: block;
  padding: 6px 10px;
  border-radius: 6px;
  color: var(--vp-c-text-1);
  font-size: 13px;
  text-decoration: none;
  white-space: nowrap;
}
.lang-menu a:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}
.lang-fade-enter-active,
.lang-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.lang-fade-enter-from,
.lang-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
/* 移动端（抽屉菜单）里也放一份 */
@media (max-width: 959px) {
  .custom-lang-switcher {
    margin-left: 0;
  }
  .lang-menu {
    right: auto;
    left: 0;
  }
}
</style>
