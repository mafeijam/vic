<template lang="pug">
  select
    slot
</template>

<script>
export default {
  props: ['options', 'value'],

  mounted() {
    $(this.$el).val(this.value).select2({
      data: this.options,
      minimumResultsForSearch: 8
    }).on('change', e => this.$emit('input', e.target.value))
  },

  destroyed() {
    $(this.$el).off().select2('destroy')
  },

  watch: {
    value(val) {
      $(this.$el).val(val).trigger('change')
      this.$emit('input', val)
    },

    options: {
      handler(val) {
        let v = this.value ? this.value : 'inactive'
        $(this.$el).html('').select2({
          data: val,
          minimumResultsForSearch: 8
        }).val(v).trigger('change')
      },
      deep: true
    }
  }
}
</script>
