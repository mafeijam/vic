<template lang="pug">
  .container.pt-10
    .flex.flex-between.mb-10
      h1.no-mb Client Information
      .menu
        button.danger.mr-8(v-show="getLoad" @click="duplicate" v-ripple:white="")
          .fa.fa-files-o.mr-8/ duplicate
        button.warning.mr-8(@click="createNew" v-ripple:white="")
          .fa.fa-file-o.mr-8/ new
        button.success.mr-8(@click="save" v-ripple:white="")
          .fa.fa-floppy-o.mr-8(v-if="!saving")/ save
          .fa.fa-circle-o-notch.fa-spin.mr-8(v-else)/
        button.primary.mr-8(@click="load" v-ripple:white="")
          .fa.fa-database.mr-8/ load
        input(type="text" v-model="getCode" style="width: 200px" @keyup.enter="load")
    client-details(ref="details")

    .tabs-wrapper
      span.tabs(:class="isActive('contact')" @click="changeTab('contact')") Contact
      span.tabs(:class="isActive('account')" @click="changeTab('account')") Account
      span.tabs(:class="isActive('bank')" @click="changeTab('bank')") Bank
      span.tabs(:class="isActive('setting')" @click="changeTab('setting')") Setting

    client-contact(v-show="isTab('contact')" ref="contact")
    client-account(:load="getLoad" v-show="isTab('account')" ref="account")
    client-bank(v-show="isTab('bank')" ref="banks")
    client-setting(v-show="isTab('setting')" ref="setting")
</template>

<script>
import { merge, padStart, omit } from 'lodash'
import firebase from './firebase'
import Select2 from './components/Select2'
import ClientDetails from './components/ClientDetails'
import ClientContact from './components/ClientContact'
import ClientBank from './components/ClientBank'
import ClientAccount from './components/ClientAccount'
import ClientSetting from './components/ClientSetting'
import './vendor/datepicker/bootstrap-datepicker.min'
import swal from './vendor/sweetalert/sweetalert2.js'
export default {
  name: 'App',
  components: { Select2, ClientDetails, ClientContact, ClientBank, ClientAccount, ClientSetting },
  data () {
    return {
      client: {},
      banks: {},
      account: {},
      contact: {},
      setting: {},
      tab: 'contact',
      getCode: null,
      getLoad: false,
      counter: null,
      saving: false
    }
  },

  mounted() {
    this.client = this.$refs.details.$data
    this.banks = this.$refs.banks.$data
    this.account = this.$refs.account.$data
    this.contact = this.$refs.contact.$data
    this.setting = this.$refs.setting.$data
    this.$root.new = $.extend(true, {}, this.$data)
    $(document).on('animationend', e => $('body').find('*').removeClass('fadeIn fadeDown ripple-effect'))
    this.getCounter()
  },

  methods: {
    isTab(tab) {
      return this.tab == tab
    },

    isActive(tab) {
      return { active: this.tab == tab }
    },

    changeTab(tab) {
      this.tab = tab
    },

    duplicate() {
      this.getLoad = false
      this.getCounter()
      merge(omit(this.$data, ['setting.options']), omit(this.$root.new, ['client', 'contact', 'banks']))
    },

    createNew() {
      this.getLoad = false
      merge(this.$data, this.$root.new)
      this.$refs.account.cash.rebates.splice(1, 10)
      this.$refs.setting.extra = []
      this.$refs.contact.showContacts = []
      this.getCounter()
    },

    mergeData(r) {
      let options = [
        {id: 'active', text: 'Active'},
        {id: 'suspended', text: 'Suspended'},
        {id: 'closed', text: 'Closed'}
      ]

      this.getLoad = true
      this.$refs.contact.fields.rows.splice(1, 10)
      $.map(['cash', 'rolling', 'margin'], v => {
        this.$refs.account[v].rebates.splice(1, 10)
        r.account[v].tab = 'market'
      })
      r.account.view = 'cash'

      merge(this.$refs.details.$data, r.client)
      merge(this.$refs.banks.$data, r.banks)
      merge(this.$refs.account.$data, r.account)
      merge(this.$refs.contact.$data, r.contact)
      merge(this.$refs.setting.$data, r.setting)

      $.map(r.account, (v, k) => {
        if (v.status && v.status.selected != 'inactive') {
          this.$refs.account.$data[k].status.options = options
        }
      })
    },

    save() {
      //$.post('http://192.168.99.100/clients', this.$data, r => console.log(r))

      if (this.client.code == null) return
      this.saving = true
      let ok = false

      $.map(this.account, v => {
        if (v.status && v.status.selected != 'inactive') {
          ok = v.code != ''
        }
      })

      if (!ok) {
        return swal({type: 'error', text: 'missing account code'})
      }

      firebase('get', this.client.code, {}, r => {
        if (r && !this.getLoad) {
          return swal({type:'warning', text: 'Duplicated Client Code'})
        }

        firebase('put', this.client.code, this.$data, r => {
          this.mergeData(r)
          swal({type: 'success', text: 'Client Saved'})
          this.saving = false
        })

        if (!this.getLoad) {
          this.counter++
          firebase('put', 'code', this.counter)
        }
      })
    },

    load() {
      if (!this.getCode) return

      firebase('get', padStart(this.getCode, 5, '0'), {}, r => {
        if (!r) return swal({type: 'error', text: 'Client Not Found'})
        this.mergeData(r)
      })
    },

    getCounter() {
      firebase('get', 'code', {}, r => {
        if (!r) {
          this.client.code = '00001'
          this.counter = 1
          firebase('put', 'code', 1, r => console.log(r))
        } else {
          this.client.code = padStart(r, 5, '0')
          this.counter = r
        }
      })
    }
  }
}
</script>

<style lang="stylus" src="./stylus/app.styl"></style>
