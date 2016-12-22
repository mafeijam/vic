<template lang="pug">
  input(type="text" @input="format" ref="input")
</template>

<script>
export default {
  props: ['value'],

  methods: {
    format(e) {
        let reset = e.target.value.replace(/,/g, '')
        let r = reset.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
        this.$refs.input.value = r
        this.$emit('input', r)
    }
  },

  watch: {
    value(val) {
      this.$refs.input.value = val
    }
  }
}
</script>
