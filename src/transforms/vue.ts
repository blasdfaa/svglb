import type { TemplateGenerator } from '../utils'

const vueTemplate: TemplateGenerator = {
  extension: 'vue',
  generateComponent(svg) {
    return `
<template>
  ${svg}
</template>

<script lang="ts">
defineProps<{
  class?: string;
  style?: string | Record<string, string>;
  width?: string | number;
  height?: string | number;
}>();
</script>
`
  },
}

export default vueTemplate
