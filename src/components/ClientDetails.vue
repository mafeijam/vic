<template lang="pug">
  .panel.default
    .panel-header Details
    .panel-body
      .row
        .col.is-1 Code:
        .col.is-2: input.bold(disabled type="text" v-model="code")
        .col.is-1 Prefix:
        .col.is-2
          select2(:options="prefix.options" v-model="prefix.selected")
            option(value="0") -- select one --
        .col.is-1 Full Name:
        .col.is-4: input(type="text" v-model="fullName")
        .col.is-1.flex(v-if="type.selected == 'company'")
          input#house(type="checkbox" v-model="house")
          label(for="house") House
        .col.is-1.flex(v-else)
          input#staff(type="checkbox" v-model="staff")
          label(for="staff") Staff
      .row
        .col.is-1 Type:
        .col.is-2
          select2(:options="type.options" v-model="type.selected")
            option(value="0") -- select one --
        .col.is-1 Country:
        .col.is-2
          select2(:options="country.options" v-model="country.selected")
            option(value="0") -- select one --
        .col.is-1 Chinese Name:
        .col.is-4: input(type="text" v-model="chiName")
      .row
        .col.is-1 Resident ID:
        .col.is-2: input(:disabled="notCompany" type="text" v-model="id")
        .col.is-1 Birthday:
        .col.is-2: datepicker(:disabled="notCompany" v-model="birthday")
        .col.is-1 Cheuqe Name:
        .col.is-4: input(type="text" v-model="chqName")
      .row
        .col.is-1 Registration No.:
        .col.is-2: input(:disabled="isCompany" type="text" v-model="registration")
        .col.is-1 Est Date:
        .col.is-2: datepicker(:disabled="isCompany" v-model="estDate")
        .col.is-1 AE:
        .col.is-2
          select2(:options="ae.options" v-model="ae.selected")
            option(value="0") -- select one --
      .row
        .col.is-1 US Citizen:
        .col.is-2.flex
          input#us-cit-yes(type="radio" value="yes" v-model="isUSCit")
          label(for="us-cit-yes") Yes
          input#us-cit-no(type="radio" value="no" v-model="isUSCit")
          label(for="us-cit-no") No
        .col.is-1 US Tax Resident:
        .col.is-2.flex
          input#us-tax-yes(type="radio" value="yes" v-model="isUSTax")
          label(for="us-tax-yes") Yes
          input#us-tax-no(type="radio" value="no" v-model="isUSTax")
          label(for="us-tax-no") No
        .col.is-1 W8 Form:
        .col.is-4.flex
          input#w8-yes(type="radio" value="yes" v-model="w8")
          label(for="w8-yes") Yes
          datepicker.mr-8(:disabled="w8 == 'no'" v-model="w8Date" for="w8")
          input#w8-no(type="radio" value="no" v-model="w8")
          label(for="w8-no") No

</template>

<script>
import Select2 from './Select2'
import Datepicker from './Datepicker'
export default {
  components: { Select2, Datepicker },

  data() {
    return {
      code: '',
      fullName: '',
      chiName: '',
      chqName: '',
      staff: false,
      house: false,
      id: '',
      birthday: '',
      estDate: '',
      registration: '',
      type: {
        options: [
          {id: 'individual', text: 'Individual'},
          {id: 'join', text: 'Join'},
          {id: 'company', text: 'Company'}
        ],
        selected: 0
      },
      prefix: {
        options: [
          {id: 'mr', text: 'Mr'},
          {id: 'mrs', text: 'Mrs'},
          {id: 'ms', text: 'Ms'}
        ],
        selected: 0
      },
      country: {
        options: [
          {id: 'HKG', text: 'Hong Kong'},
          {id: 'CHN', text: 'China'}
        ],
        selected: 0
      },
      ae: {
        options: [
          {id: '01', text: '01 Foo'},
          {id: '02', text: '02 Bar'},
          {id: '03', text: '03 Qoo'}
        ],
        selected: 0
      },
      isUSCit: 'no',
      isUSTax: 'no',
      w8: 'no',
      w8Date: '',
      isCompany: false,
      notCompany: false
    }
  },

  watch: {
    'type.selected': {
      handler(val) {
        if (val == 'company') {
          this.staff = false
          this.isCompany = false
          this.notCompany = true
          this.id = ''
        } else {
          this.house = false
          this.isCompany = true
          this.notCompany = false
          this.registration = ''
        }

        if (val == '0') {
          this.isCompany = false
          this.notCompany = false
        }
      }
    }
  }
}
</script>
