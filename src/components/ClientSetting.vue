<template lang="pug">
  .panel.info
    .panel-body.min-h
      .row
        .col.is-2
          select2(:disabled="none", :options="availableOptions" v-model="setting.selected")
        .col.is-2
          button.primary(v-ripple:white="" @click="add")
            i.fa.fa-plus.mr-8/ add setting
      .row.fadeIn.transition(:id="getId(i)" v-for="(key, i) in showSetting")
        .col.is-2 {{ getName(key) }}
        .col.is-2(v-if="isType(key, 'select')")
          select2(:options="fields[key].options" v-model="fields[key].selected" ref="settings")
        .col.is-2(v-if="isType(key, 'date')")
          datepicker(v-model="fields[key].value" v-show="fields[key].show" ref="settings")
        .col.is-2: button.danger.small-btn(@click="remove(key, i)" v-ripple:white=""): i.fa.fa-trash
</template>

<script>
import { includes } from 'lodash'
import Select2 from './Select2'
import Datepicker from './Datepicker'

export default {
  components: { Select2, Datepicker },

  data() {
    return {
      none: false,
      setting: {
        options: [
          {id: 'none', text: '-- select one --'},
          {id: 'aml', text: 'AML Check'},
          {id: 'money', text: 'Money Laundering'},
          {id: 'risk', text: 'Client Risk Assessment'},
          {id: 'movement', text: 'Last Movement'},
          {id: 'pro', text: 'Professional Investor'}
        ],
        selected: 'none'
      },

      fields: {
        none: {
          show: false
        },
        aml: {
          show: true,
          options: [
            {id: 'yes', text: 'Yes'},
            {id: 'no', text: 'No'}
          ],
          selected: 'yes',
          type: 'select'
        },
        money: {
          show: true,
          options: [
            {id: 'yes', text: 'Yes'},
            {id: 'no', text: 'No'}
          ],
          selected: 'no',
          type: 'select'
        },
        risk: {
          show: true,
          options: [
            {id: 'yes', text: 'Yes'},
            {id: 'no', text: 'No'}
          ],
          selected: 'yes',
          type: 'select'
        },
        movement: {
          show: false,
          value: new Date,
          type: 'date'
        },
        pro: {
          show: false,
          options: [
            {id: 'yes', text: 'Yes'},
            {id: 'no', text: 'No'}
          ],
          selected: 'yes',
          type: 'select'
        },
      },

      showSetting: []
    }
  },

  computed: {
    availableOptions() {
      let options = this.setting.options.filter(v => !this.fields[v.id].show)
      let none = false
      if (options.length == 1) {
        options = [{id: 'none', text: 'no more options'}]
        none = true
      }
      this.none = none
      return options
    },
  },

  watch: {
    fields: {
      handler(val) {
        Object.keys(val).map(key => {
          if (val[key].show && !includes(this.showSetting, key))
            this.showSetting.push(key)
          else if (!val[key].show  && includes(this.showSetting, key))
            this.showSetting.splice(this.showSetting.indexOf(key), 1)

          this.$nextTick(() => {
            this.$refs.settings.map(v => {
              if(v.dp)
                $(v.dp).datepicker('update', v.value).trigger('changeDate')
              else
                $(v.$el).val(v.value).trigger('change')
            })
          })
        })
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    isType(key, type) {
      return this.fields[key].type == type
    },

    add() {
      let key = this.setting.selected
      if (key != 'none') {
        this.fields[key].show = true
        this.setting.selected = 'none'
      }
    },

    remove(key, i) {
      $(`#s-row-${i}`).addClass('fadeDown')

      setTimeout(() => {
        this.fields[key].show = false
        this.setting.selected = 'none'
      }, 400)

    },

    getName(e) {
      return this.setting.options.filter(v => v.id == e)[0].text
    },

    getId(i) {
      return `s-row-${i}`
    }
  }
}
</script>
