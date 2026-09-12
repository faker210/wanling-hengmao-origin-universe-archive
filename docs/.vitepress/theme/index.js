/**
 * 术语悬浮弹窗 —— 主题增强
 *
 * 功能：
 *   1) 页面渲染完成后，在正文（.vp-doc / 首页内容区）中自动扫描 AUTO_TERMS 词表，
 *      将专有名词包裹为 <span class="term-pop">，鼠标悬浮/键盘聚焦弹出词条解释。
 *   2) 阿拉伯语（/ar/）页面自动设置 RTL 排版方向。
 *   3) 词表与释义见 ../glossary.js，可自由增删。
 */
import DefaultTheme from 'vitepress/theme'
import { inBrowser } from 'vitepress'
import { GLOSSARY, AUTO_TERMS } from '../glossary.js'
import Layout from './Layout.vue'
import './style.css'

const SORTED_TERMS = [...AUTO_TERMS].sort((a, b) => b.length - a.length)

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 从左到右、当前位置优先最长词的分词（保证"阿赖耶锚点"优先于"锚点"等） */
function splitByTerms(text, terms) {
  const out = []
  const n = text.length
  let i = 0
  let buf = ''
  while (i < n) {
    let matched = null
    for (const t of terms) {
      if (text.startsWith(t, i)) {
        matched = t
        break
      }
    }
    if (matched) {
      if (buf) {
        out.push({ text: buf })
        buf = ''
      }
      out.push({ term: matched })
      i += matched.length
    } else {
      buf += text[i]
      i++
    }
  }
  if (buf) out.push({ text: buf })
  return out
}

/** 在给定容器内为正文文本节点装饰术语（幂等：已装饰成功则跳过，内容被重置则重试） */
function decorate(container) {
  if (!container) return
  // Vue 水合/路由切换可能重置正文内容但保留容器元素：只有容器里真的还有
  // term-pop 才算装饰完成；否则（水合覆盖了 SSR 阶段的装饰）需要重新装饰。
  if (container.__termDecorated && container.querySelector('.term-pop')) return
  container.__termDecorated = true

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement
      if (!p) return NodeFilter.FILTER_REJECT
      const tag = p.tagName
      if (/^(A|CODE|PRE|SCRIPT|STYLE|H1|H2|H3|H4|H5|H6|TITLE|TEXTAREA)$/.test(tag)) {
        return NodeFilter.FILTER_REJECT
      }
      if (tag === 'SPAN' && p.classList.contains('term-pop')) return NodeFilter.FILTER_REJECT
      if (tag === 'SPAN' && String(p.className || '').includes('term-')) return NodeFilter.FILTER_REJECT
      if (!node.nodeValue || !/[\u4e00-\u9fff]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes = []
  while (walker.nextNode()) textNodes.push(walker.currentNode)

  for (const node of textNodes) {
    const parts = splitByTerms(node.nodeValue, SORTED_TERMS)
    if (parts.length === 1) continue
    const frag = document.createDocumentFragment()
    for (const part of parts) {
      if (part.term) {
        const def = GLOSSARY[part.term]
        if (!def) continue
        const span = document.createElement('span')
        span.className = 'term-pop'
        span.tabIndex = 0
        const text = document.createElement('span')
        text.className = 'term-text'
        text.textContent = part.term
        const tip = document.createElement('span')
        tip.className = 'term-tip'
        tip.textContent = def.def
        span.appendChild(text)
        span.appendChild(tip)
        frag.appendChild(span)
      } else {
        frag.appendChild(document.createTextNode(part.text))
      }
    }
    node.parentNode.replaceChild(frag, node)
  }
}

/** 找到当前页面的正文容器并装饰 */
function decoratePage() {
  if (!inBrowser) return
  const container =
    document.querySelector('.vp-doc') ||
    document.querySelector('.VPHome .vp-doc') ||
    document.querySelector('.VPContent .container') ||
    document.querySelector('.VPContent')
  if (container) decorate(container)
}

/** 阿拉伯语页面切换 RTL */
function applyRtl() {
  if (!inBrowser) return
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const dir = path.includes('/ar/') ? 'rtl' : 'ltr'
  if (document.documentElement.dir !== dir) document.documentElement.dir = dir
}

function scheduleDecorate() {
  setTimeout(() => {
    applyRtl()
    decoratePage()
  }, 50)
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp() {
    if (!inBrowser) return

    // 首次加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scheduleDecorate)
    } else {
      scheduleDecorate()
    }

    // 兜底：水合完成后再补几次装饰（避免水合覆盖 SSR 阶段装饰后不再触发）
    for (const delay of [600, 1500, 3000]) {
      setTimeout(() => {
        applyRtl()
        decoratePage()
      }, delay)
    }

    // 路由切换后内容由 VitePress 动态替换，用 MutationObserver 兜底捕捉
    let timer = null
    const observer = new MutationObserver(() => {
      if (timer) return
      timer = setTimeout(() => {
        timer = null
        applyRtl()
        decoratePage()
      }, 80)
    })
    observer.observe(document.body, { childList: true, subtree: true })
  },
}
