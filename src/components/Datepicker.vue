<template lang="pug">
  .date-addon
    input(:disabled="disabled" type="text" ref="dp" placeholder="dd-mm-yyyy")
    .fa.fa-calendar
</template>

<script>
export default {
  props: ['value', 'disabled', 'for'],

  data() {
    return {
      dp: null
    }
  },

  mounted() {
    this.dp = $(this.$refs.dp).datepicker({
      orientation: 'bottom',
      clearBtn: true,
      format: 'dd-mm-yyyy',
      todayBtn: 'linked',
      todayHighlight: true,
      autoclose: true
    }).on('hide changeDate', e => this.$emit('input', e.target.value))
  },

  destroyed() {
    $(this.$el).off().datepicker('destroy')
  },

  watch: {
    disabled(val) {
      if (val) {
        return this.dp.datepicker('update', '').trigger('changeDate')
      }

      if (this.for == 'w8' && !val) {
        this.dp.datepicker('update', new Date).trigger('changeDate')
      }
    },

    value(val) {
      if (val == '')
        this.dp.datepicker('update', val).trigger('changeDate')
      else if (val && val.length >= 10)
        this.dp.datepicker('update', val).trigger('changeDate')
    }
  }
}
</script>

<style lang="stylus">
  .date-addon
    position relative
    & > .fa.fa-calendar
      position absolute
      top 9px
      right 9px
</style>
