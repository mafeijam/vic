<template lang="pug">
  .row.flex-top
    .col.is-6
      .panel.info
        .panel-body
          .row
            .col.is-2 Email:
            .col.is-7: input(type="text" v-model="email" @keyup="checkEmail")
            .col.is-3
              input#e-statement(type="checkbox"  v-model="eStatement")
              label(for="e-statement") e-statement
          .row
            .col.is-2 Phone 1:
            .col.is-7: input(type="text" v-model="phone1")
          .row.flex-top
            .col.is-2.address Address:
            .col.is-7: textarea(v-model="address")
            .col.is-3
              .mb-10
                input#hold-mail(type="checkbox"  v-model="holdMail")
                label(for="hold-mail") Hold mail
              div
                input#return-mail(type="checkbox"  v-model="returnMail")
                label(for="return-mail") Return mail
    .col.is-6
      .panel.info
        .panel-body.min-h
          .row
            .col.is-3
              select2(:disabled="none", :options="availableOptions" v-model="fields.selected")
            .col.is-3
              button.primary(v-ripple:white="" @click="add")
                i.fa.fa-plus.mr-8/ add contact
          .row.fadeIn.transition(:id="getId(i)" v-for="(key, i) in showContacts")
            .col.is-2 {{ getName(key) }}:
            .col.is-7: input(type="text" v-model="extraContacts[key].value")
            .col.is-2: button.danger.small-btn(@click="remove(key, i)" v-ripple:white=""): i.fa.fa-trash
</template>

<script>
import { debounce, includes } from 'lodash'
import Select2 from './Select2'
export default {
  components: { Select2 },

  data() {
    return {
      none: false,
      email: '',
      eStatement: false,
      phone1: '',
      address: '',
      holdMail: false,
      returnMail: false,
      fields: {
        options: [
          {id: 'none', text: '-- select one --'},
          {id: 'phone2', text: 'Phone 2'},
          {id: 'phone3', text: 'Phone 3'},
          {id: 'fax', text: 'Fax'},
          {id: 'remark1', text: 'Remark 1'},
          {id: 'remark2', text: 'Remark 2'},
          {id: 'remark3', text: 'Remark 3'}
        ],
        selected: 'none',
        rows: [{selected: 0, value: ''}]
      },
      extraContacts: {
        none: {
          show: false
        },
        phone2: {
          show: false,
          value: ''
        },
        phone3: {
          show: false,
          value: ''
        },
        fax: {
          show: false,
          value: ''
        },
        remark1: {
          show: false,
          value: ''
        },
        remark2: {
          show: false,
          value: ''
        },
        remark3: {
          show: false,
          value: ''
        },
      },
      showContacts: []
    }
  },

  computed: {
    availableOptions() {
      let options = this.fields.options.filter(v => !this.extraContacts[v.id].show)
      let none = false
      if (options.length == 1) {
        options = [{id: 'none', text: 'no more options'}]
        none = true
      }
      this.none = none
      return options
    }
  },

  watch: {
    holdMail(val) {
      this.returnMail = !val
    },

    returnMail(val) {
      this.holdMail = !val
    },

    extraContacts: {
      handler(val) {
        Object.keys(val).map(key => {
          if (val[key].show && !includes(this.showContacts, key))
            this.showContacts.push(key)
          else if (!val[key].show  && includes(this.showContacts, key))
            this.showContacts.splice(this.showContacts.indexOf(key), 1)
        })
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    add() {
      let key = this.fields.selected
      if (key != 'none') {
        this.extraContacts[key].show = true
        this.fields.selected = 'none'
      }
    },

    remove(key, i) {
      $(`#c-row-${i}`).addClass('fadeDown')

      setTimeout(() => {
        this.extraContacts[key].show = false
        this.fields.selected = 'none'
      }, 400)
    },

    checkEmail: debounce(function(e){
      if (e.target.value.trim()) {
        this.eStatement = true
      } else {
        this.eStatement = false
      }
    }, 500),

    getId(i) {
      return `c-row-${i}`
    },

    getName(e) {
      return this.fields.options.filter(v => v.id == e)[0].text
    }
  }
}
</script>

<style lang="stylus" scoped>
  .address
    margin-top 3px
</style>
