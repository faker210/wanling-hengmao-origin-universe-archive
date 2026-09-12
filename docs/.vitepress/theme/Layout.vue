<script setup>
/**
 * 自定义 Layout：在默认主题的导航栏注入自定义语言切换器，
 * 并隐藏默认切换器（其链接在本站不对称目录结构下必然失效）。
 */
import DefaultTheme from 'vitepress/theme'
import LangSwitcher from './LangSwitcher.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after>
      <LangSwitcher />
    </template>
    <template #nav-screen-content-after>
      <LangSwitcher />
    </template>
  </DefaultTheme.Layout>
</template>
