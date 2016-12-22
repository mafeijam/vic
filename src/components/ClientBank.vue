<template lang="pug">
  .panel.info
    .panel-body
      .row
        .col.is-2.offset-3.text-lg.bold Bank Name
        .col.is-2.text-lg.bold Account Number
      .row(v-for="(bank, i) in banks")
        .col.is-1 Bank {{ i+1 }} ({{ bank.ccy }})
        .col.is-2
          select2(:options="options" v-model="bank.id")
            option(value="none") -- select one --
        .col.is-2: input(type="text" v-model="selected[i].name")
        .col.is-4: input(type="text" v-model="selected[i].number")
</template>

<script>
import Select2 from './Select2'
export default {
  components: { Select2 },

  data() {
    return {
      banks: [
        {id: 'none', ccy: 'HKD'},
        {id: 'none', ccy: 'HKD'},
        {id: 'none', ccy: 'USD'},
        {id: 'none', ccy: 'CNY'},
        {id: 'none', ccy: 'CNY'}
      ],
      selected: [
        {number: '', name: ''},
        {number: '', name: ''},
        {number: '', name: ''},
        {number: '', name: ''},
        {number: '', name: ''}
      ],
      options: [
        {id: 'hsbc', text: 'HSBC'},
        {id: 'hsb', text: 'HSB'},
        {id: 'boc012', text: 'BOC 012'},
        {id: 'boc014', text: 'BOC 014'},
        {id: 'other', text: 'Other bank'}
      ],
      bankCode: {
        none: {code: '', name: ''},
        hsbc: {code: '004', name: 'HSBC'},
        hsb: {code: '024', name: 'Hang Seng Bank'},
        boc012: {code: '012', name: 'Bank of China (HK)'},
        boc014: {code: '014', name: 'Bank of China (HK)'},
        other: {code: '', name: ''}
      }
    }
  },

  watch: {
    banks: {
      handler(val, old) {
        val.map((v, k) => {
          if (k <= 1 && v.id) {
            if (this.selected[k].number.length > 3 && v.id != 'none') return

            this.selected[k].number = this.bankCode[v.id].code
            this.selected[k].name = this.bankCode[v.id].name
          }
        })
      },
      deep: true
    }
  }
}
</script>
