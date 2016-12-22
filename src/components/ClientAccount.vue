<template lang="pug">
  .panel.info
    .panel-body
      .row
        .col.is-12.menu
          button.mr-8(:class="cashClass" v-ripple:white="" @click="changeView('cash')") Cash
          button.mr-8(:class="rollingClass" @click="changeView('rolling')" v-ripple:white="") Rolling
          button(:class="marginClass" @click="changeView('margin')" v-ripple:white="") Margin
      div(v-show="isView('cash')")
        .row
          .col.is-1 Type:
          .col.is-2: input.cash(type="text" value="Cash" disabled)
          .col.is-1 Account No.:
          .col.is-2: input.bold(:disabled="checkStatus('cash')" type="text" v-model="cash.code")
          .col.is-1 Status:
          .col.is-2
            select2(:options="cash.status.options" v-model="cash.status.selected" ref="cash")
          .col.is-2
            button.danger(@click="copyRolling" v-ripple:white="" v-show="rolling.status.selected != 'inactive'")
              .fa.fa-clone.mr-8/ copy rolling
        div(v-show="cash.status.selected != 'inactive'")
          .row
            .col.is-1 Open Date:
            .col.is-2: datepicker(v-model="cash.openDate" ref="cashOpenDate")
            .col.is-1 Suspend Date:
            .col.is-2: datepicker(:disabled="isStatus('cash', 'suspended')" v-model="cash.suspendDate" ref="cashSuspendDate")
            .col.is-1 Close Date:
            .col.is-2: datepicker(:disabled="isStatus('cash', 'closed')" v-model="cash.closeDate" ref="cashCloseDate")
          .row
            .col.is-1 Authorized:
            .col.is-5: input(type="text" v-model="cash.authorized")
            .col.is-3
              input#c-discretionary(type="checkbox" v-model="cash.discretionary")
              label(for="c-discretionary") Discretionary Account

          .tabs-wrapper.info.mb-10
            span.tabs.tabs--info(:class="isActive('cash', 'market')" @click="changeTab('cash', 'market')") Market
            span.tabs.tabs--info(:class="isActive('cash', 'brokerage')" @click="changeTab('cash', 'brokerage')") Brokerage
            span.tabs.tabs--info(:class="isActive('cash', 'rebate')" @click="changeTab('cash', 'rebate')") Rebate
            span.tabs.tabs--info(:class="isActive('cash', 'interest')" @click="changeTab('cash', 'interest')") Interest
          .row
            .col.max-h(v-show="isTab('cash', 'market')")
              .row(v-for="(market, i) in cash.markets")
                .col.is-1
                  span.text-lg.bold {{ market.id.toUpperCase() }}
                .col.is-1
                  input(:id="market.id" type="checkbox" v-model="cash.markets[i].active", :disabled="notGlobal(market.id)")
                  label(:for="market.id") active
                .col.is-2(v-show="market.active") Cash Settlement:
                .col.is-2(v-show="market.active")
                  select2(:options="settlement.options.cash", :disabled="market.id !== 'hkg'"
                  v-model="market.settlement.cash")
                .col.is-2(v-show="market.active") Dividend Settlement:
                .col.is-2(v-show="market.active")
                  select2(:options="settlement.options.dividend", :disabled="market.id !== 'hkg'"
                  v-model="market.settlement.dividend")

            .col.max-h(v-show="isTab('cash', 'brokerage')")
              .row.row-no
                .col.is-5.offset-1.text-lg.bold Manual Input
                .col.is-5.text-lg.bold Other Channel
              .row.flex-top.bb(v-for="(market, i) in cashActiveMarkets")
                .col.is-1
                  span.text-lg.bold {{ market.id.toUpperCase() }}
                .col.is-5
                  .row(v-for="brokerage in cash.brokerages[market.id]")
                    .col
                      .ccy Currency: {{ brokerage.currency }}
                      .row
                        .col.is-1 Min:
                        .col.is-4: input(type="text", :value="getBrokerageSetting(brokerage.manual, 'min')"
                        @input="updateBrokerageM(brokerage, 'min', $event)")
                        .col.is-1 Rate:
                        .col.is-4
                          .percent-addon
                            input(type="text", :value="getBrokerageSetting(brokerage.manual, 'rate')"
                            @input="updateBrokerageM(brokerage, 'rate', $event)")
                            .fa.fa-percent
                .col.is-5
                  .row(v-for="brokerage in cash.brokerages[market.id]")
                    .col
                      .ccy Currency: {{ brokerage.currency }}
                      .row
                        .col.is-1 Min:
                        .col.is-4: input(type="text", :value="getBrokerageSetting(brokerage.other, 'min')"
                        @input="updateBrokerageO(brokerage, 'min', $event)")
                        .col.is-1 Rate:
                        .col.is-4
                          .percent-addon
                            input(type="text", :value="getBrokerageSetting(brokerage.other, 'rate')"
                            @input="updateBrokerageO(brokerage, 'rate', $event)")
                            .fa.fa-percent

            .col.max-h(v-show="isTab('cash', 'rebate')")
              .row.row-no
                button.primary(@click="addRebateMarket('cash')")
                  i.fa.fa-plus.mr-8/ add market
              .row.fadeIn.transition(:id="'ca-row-'+i" v-for="(rebate, i) in cash.rebates")
                .col.is-1 Market:
                .col.is-2
                  select2(:options="cashActiveMarketsSelect2" v-model="cash.rebates[i].market" ref="cashRebateMarket")
                .col.is-1 Calculation:
                .col.is-2
                  select2(:options="rebate.options" v-model="cash.rebates[i].selected" ref="cashRebate")
                .col.is-1 IPO Rebate:
                .col.is-2
                  .percent-addon
                    input(:disabled="notHKG(cash.rebates[i].market)" type="text" v-model="cash.rebates[i].ipoRebate")
                    .fa.fa-percent
                .col.is-1(v-show="i > 0"): button.danger.small-btn(@click="removeRebateMarket('cash', i)"): .fa.fa-trash

            .col.max-h(v-show="isTab('cash', 'interest')")
              .row
                .col.is-2.text-lg.bold Status
                .col.is-2.text-lg.bold Reach
                .col.is-2.text-lg.bold Rate
              .row
                .col.is-2 Credit
                .col.is-2: input(type="text", :value="getInterestReachSetting('cr', 'cash')"
                            @input="updateInterestReach('cr', 'cash', $event)")
                .col.is-2
                  .percent-addon
                    input(type="text", :value="getInterestRateSetting('cr', 'cash')"
                    @input="updateInterestRate('cr', 'cash', $event)")
                    .fa.fa-percent
              .row
                .col.is-2 Debit
                .col.is-2: input(type="text", :value="getInterestReachSetting('dr', 'cash')"
                            @input="updateInterestReach('dr', 'cash', $event)")
                .col.is-2
                  .percent-addon
                    input(type="text", :value="getInterestRateSetting('dr', 'cash')"
                    @input="updateInterestRate('dr', 'cash', $event)")
                    .fa.fa-percent
              .row
                .col.is-2 Penalty Interest
                .col.is-2: input(type="text", :value="getInterestReachSetting('pi', 'cash')"
                            @input="updateInterestReach('pi', 'cash', $event)")
                .col.is-2
                  .percent-addon
                    input(type="text", :value="getInterestRateSetting('pi', 'cash')"
                    @input="updateInterestRate('pi', 'cash', $event)")
                    .fa.fa-percent

      //- ********************************* -//
      //- ********** end of cash ********** -//
      //- ********************************* -//

      div(v-show="isView('rolling')")
        .row
          .col.is-1 Type:
          .col.is-2: input.rolling(type="text" value="Rolling" disabled)
          .col.is-1 Account No.:
          .col.is-2: input.bold(:disabled="checkStatus('rolling')" type="text" v-model="rolling.code")
          .col.is-1 Status:
          .col.is-2
            select2(:options="rolling.status.options" v-model="rolling.status.selected" ref="rolling")
          .col.is-2
            button.danger(@click="copyCash" v-ripple:white="" v-show="cash.status.selected != 'inactive'")
              .fa.fa-clone.mr-8/ copy cash
        div(v-show="rolling.status.selected != 'inactive'")
          .row
            .col.is-1 Open Date:
            .col.is-2: datepicker(v-model="rolling.openDate" ref="rollingOpenDate")
            .col.is-1 Authority Date:
            .col.is-2: datepicker(v-model="rolling.authDate" ref="rollingAuthDate")
          .row
            .col.is-1 Suspend Date:
            .col.is-2: datepicker(:disabled="isStatus('rolling', 'suspended')" v-model="rolling.suspendDate" ref="rollingSuspendDate")
            .col.is-1 Close Date:
            .col.is-2: datepicker(:disabled="isStatus('rolling', 'closed')" v-model="rolling.closeDate" ref="rollingCloseDate")
          .row
            .col.is-1 Authorized:
            .col.is-5: input(type="text" v-model="rolling.authorized")
            .col.is-3
              input#r-discretionary(type="checkbox" v-model="rolling.discretionary")
              label(for="r-discretionary") Discretionary Account

          .tabs-wrapper.info.mb-10
            span.tabs.tabs--info(:class="isActive('rolling', 'market')" @click="changeTab('rolling', 'market')") Market
            span.tabs.tabs--info(:class="isActive('rolling', 'brokerage')" @click="changeTab('rolling', 'brokerage')") Brokerage
            span.tabs.tabs--info(:class="isActive('rolling', 'rebate')" @click="changeTab('rolling', 'rebate')") Rebate
            span.tabs.tabs--info(:class="isActive('rolling', 'interest')" @click="changeTab('rolling', 'interest')") Interest
          .row
            .col.max-hm(v-show="isTab('rolling', 'market')")
              .row(v-for="(market, i) in rolling.markets")
                .col.is-1
                  span.text-lg.bold {{ market.id.toUpperCase() }}
                .col.is-1
                  input(:id="'r-'+market.id" type="checkbox" v-model="rolling.markets[i].active", :disabled="notGlobal(market.id)")
                  label(:for="'r-'+market.id") active
                .col.is-2(v-show="market.active") Cash Settlement:
                .col.is-2(v-show="market.active")
                  select2(:options="settlement.options.cash", :disabled="market.id !== 'hkg'"
                  v-model="market.settlement.cash")
                .col.is-2(v-show="market.active") Dividend Settlement:
                .col.is-2(v-show="market.active")
                  select2(:options="settlement.options.dividend", :disabled="market.id !== 'hkg'"
                  v-model="market.settlement.dividend")

            .col.max-hm(v-show="isTab('rolling', 'brokerage')")
              .row.row-no
                .col.is-5.offset-1.text-lg.bold Manual Input
                .col.is-5.text-lg.bold Other Channel
              .row.flex-top.bb(v-for="(market, i) in rollingActiveMarkets")
                .col.is-1
                  span.text-lg.bold {{ market.id.toUpperCase() }}
                .col.is-5
                  .row(v-for="brokerage in rolling.brokerages[market.id]")
                    .col
                      .ccy Currency: {{ brokerage.currency }}
                      .row
                        .col.is-1 Min:
                        .col.is-4: input(type="text", :value="getBrokerageSetting(brokerage.manual, 'min')"
                        @input="updateBrokerageM(brokerage, 'min', $event)")
                        .col.is-1 Rate:
                        .col.is-4
                          .percent-addon
                            input(type="text", :value="getBrokerageSetting(brokerage.manual, 'rate')"
                            @input="updateBrokerageM(brokerage, 'rate', $event)")
                            .fa.fa-percent
                .col.is-5
                  .row(v-for="brokerage in rolling.brokerages[market.id]")
                    .col
                      .ccy Currency: {{ brokerage.currency }}
                      .row
                        .col.is-1 Min:
                        .col.is-4: input(type="text", :value="getBrokerageSetting(brokerage.other, 'min')"
                        @input="updateBrokerageO(brokerage, 'min', $event)")
                        .col.is-1 Rate:
                        .col.is-4
                          .percent-addon
                            input(type="text", :value="getBrokerageSetting(brokerage.other, 'rate')"
                            @input="updateBrokerageO(brokerage, 'rate', $event)")
                            .fa.fa-percent

            .col.max-hm(v-show="isTab('rolling', 'rebate')")
              .row.row-no
                button.primary(@click="addRebateMarket('rolling')")
                  i.fa.fa-plus.mr-8/ add market
              .row.fadeIn.transition(:id="'ra-row-'+i" v-for="(rebate, i) in rolling.rebates")
                .col.is-1 Market:
                .col.is-2
                  select2(:options="rollingActiveMarketsSelect2" v-model="rolling.rebates[i].market" ref="rollingRebateMarket")
                .col.is-1 Calculation:
                .col.is-2
                  select2(:options="rebate.options" v-model="rolling.rebates[i].selected" ref="rollingRebate")
                .col.is-1 IPO Rebate:
                .col.is-2
                  .percent-addon
                    input(:disabled="notHKG(rolling.rebates[i].market)" type="text" v-model="rolling.rebates[i].ipoRebate")
                    .fa.fa-percent
                .col.is-1(v-show="i > 0"): button.danger.small-btn(@click="removeRebateMarket('rolling', i)"): .fa.fa-trash

            .col.max-hm(v-show="isTab('rolling', 'interest')")
              .row
                .col.is-2.text-lg.bold Status
                .col.is-2.text-lg.bold Reach
                .col.is-2.text-lg.bold Rate
              .row
                .col.is-2 Credit
                .col.is-2: input(type="text", :value="getInterestReachSetting('cr', 'rolling')"
                            @input="updateInterestReach('cr', 'rolling', $event)")
                .col.is-2
                  .percent-addon
                    input(type="text", :value="getInterestRateSetting('cr', 'rolling')"
                    @input="updateInterestRate('cr', 'rolling', $event)")
                    .fa.fa-percent
              .row
                .col.is-2 Debit
                .col.is-2: input(type="text", :value="getInterestReachSetting('dr', 'rolling')"
                            @input="updateInterestReach('dr', 'rolling', $event)")
                .col.is-2
                  .percent-addon
                    input(type="text", :value="getInterestRateSetting('dr', 'rolling')"
                    @input="updateInterestRate('dr', 'rolling', $event)")
                    .fa.fa-percent
              .row
                .col.is-2 Penalty Interest
                .col.is-2: input(type="text", :value="getInterestReachSetting('pi', 'rolling')"
                            @input="updateInterestReach('pi', 'rolling', $event)")
                .col.is-2
                  .percent-addon
                    input(type="text", :value="getInterestRateSetting('pi', 'rolling')"
                    @input="updateInterestRate('pi', 'rolling', $event)")
                    .fa.fa-percent
      //- ********************************* -//
      //- ******** end of rolling ********* -//
      //- ********************************* -//

      div(v-show="isView('margin')")
        .row
          .col.is-1 Type:
          .col.is-2: input.margin(type="text" value="Margin" disabled)
          .col.is-1 Account No.:
          .col.is-2: input.bold(:disabled="checkStatus('margin')" type="text" v-model="margin.code")
          .col.is-1 Status:
          .col.is-2
            select2(:options="margin.status.options" v-model="margin.status.selected" ref="margin")
          .col.is-3
            button.danger.mr-8(@click="copyCashM" v-ripple:white="" v-show="cash.status.selected != 'inactive'")
              .fa.fa-clone.mr-8/ copy cash
            button.danger(@click="copyRollingM" v-ripple:white="" v-show="rolling.status.selected != 'inactive'")
              .fa.fa-clone.mr-8/ copy rolling
        div(v-show="margin.status.selected != 'inactive'")
          .row
            .col.is-1 Open Date:
            .col.is-2: datepicker(v-model="margin.openDate" ref="marginOpenDate")
            .col.is-1 Authority Date:
            .col.is-2: datepicker(v-model="margin.authDate" ref="marginAuthDate")
            .col.is-1 Margin Limit:
            .col.is-2
              number-input(v-model="margin.limit")
          .row
            .col.is-1 Suspend Date:
            .col.is-2: datepicker(:disabled="isStatus('margin', 'suspended')" v-model="margin.suspendDate" ref="marginSuspendDate")
            .col.is-1 Close Date:
            .col.is-2: datepicker(:disabled="isStatus('margin', 'closed')" v-model="margin.closeDate" ref="marginCloseDate")
          .row
            .col.is-1 Authorized:
            .col.is-5: input(type="text" v-model="margin.authorized")
            .col.is-3
              input#m-discretionary(type="checkbox" v-model="margin.discretionary")
              label(for="m-discretionary") Discretionary Account

          .tabs-wrapper.info.mb-10
            span.tabs.tabs--info(:class="isActive('margin', 'market')" @click="changeTab('margin', 'market')") Market
            span.tabs.tabs--info(:class="isActive('margin', 'brokerage')" @click="changeTab('margin', 'brokerage')") Brokerage
            span.tabs.tabs--info(:class="isActive('margin', 'rebate')" @click="changeTab('margin', 'rebate')") Rebate
            span.tabs.tabs--info(:class="isActive('margin', 'interest')" @click="changeTab('margin', 'interest')") Interest
          .row
            .col.max-hm(v-show="isTab('margin', 'market')")
              .row(v-for="(market, i) in margin.markets")
                .col.is-1
                  span.text-lg.bold {{ market.id.toUpperCase() }}
                .col.is-1
                  input(:id="'m-'+market.id" type="checkbox" v-model="margin.markets[i].active" disabled)
                  label(:for="'m-'+market.id") active
                .col.is-2(v-show="market.active") Cash Settlement:
                .col.is-2(v-show="market.active")
                  select2(:options="settlement.options.cash" disabled)
                .col.is-2(v-show="market.active") Dividend Settlement:
                .col.is-2(v-show="market.active")
                  select2(:options="settlement.options.dividend" disabled)

            .col.max-hm(v-show="isTab('margin', 'brokerage')")
              .row.row-no
                .col.is-5.offset-1.text-lg.bold Manual Input
                .col.is-5.text-lg.bold Other Channel
              .row.flex-top.bb(v-for="(market, i) in margin.markets")
                .col.is-1
                  span.text-lg.bold {{ market.id.toUpperCase() }}
                .col.is-5
                  .row(v-for="brokerage in margin.brokerages[market.id]")
                    .col
                      .ccy Currency: {{ brokerage.currency }}
                      .row
                        .col.is-1 Min:
                        .col.is-4: input(type="text", :value="getBrokerageSetting(brokerage.manual, 'min')"
                        @input="updateBrokerageM(brokerage, 'min', $event)")
                        .col.is-1 Rate:
                        .col.is-4
                          .percent-addon
                            input(type="text", :value="getBrokerageSetting(brokerage.manual, 'rate')"
                            @input="updateBrokerageM(brokerage, 'rate', $event)")
                            .fa.fa-percent
                .col.is-5
                  .row(v-for="brokerage in margin.brokerages[market.id]")
                    .col
                      .ccy Currency: {{ brokerage.currency }}
                      .row
                        .col.is-1 Min:
                        .col.is-4: input(type="text", :value="getBrokerageSetting(brokerage.other, 'min')"
                        @input="updateBrokerageO(brokerage, 'min', $event)")
                        .col.is-1 Rate:
                        .col.is-4
                          .percent-addon
                            input(type="text", :value="getBrokerageSetting(brokerage.other, 'rate')"
                            @input="updateBrokerageO(brokerage, 'rate', $event)")
                            .fa.fa-percent

            .col.max-hm(v-show="isTab('margin', 'rebate')")
              .row.row-no
                button.primary(@click="addRebateMarket('margin')")
                  i.fa.fa-plus.mr-8/ add market
              .row.fadeIn.transition(:id="'ra-row-'+i" v-for="(rebate, i) in margin.rebates")
                .col.is-1 Market:
                .col.is-2
                  select2(:options="marginActiveMarketsSelect2" v-model="margin.rebates[i].market" ref="marginRebateMarket")
                .col.is-1 Calculation:
                .col.is-2
                  select2(:options="rebate.options" v-model="margin.rebates[i].selected" ref="marginRebate")
                .col.is-1 IPO Rebate:
                .col.is-2
                  .percent-addon
                    input(:disabled="notHKG(margin.rebates[i].market)" type="text" v-model="margin.rebates[i].ipoRebate")
                    .fa.fa-percent
                .col.is-1(v-show="i > 0"): button.danger.small-btn(@click="removeRebateMarket('margin', i)"): .fa.fa-trash

            .col.max-hm(v-show="isTab('margin', 'interest')")
              .row
                .col.is-2.text-lg.bold Status
                .col.is-2.text-lg.bold Reach
                .col.is-2.text-lg.bold Rate
              .row
                .col.is-2 Credit
                .col.is-2: input(type="text", :value="getInterestReachSetting('cr', 'margin')"
                            @input="updateInterestReach('cr', 'margin', $event)")
                .col.is-2
                  .percent-addon
                    input(type="text", :value="getInterestRateSetting('cr', 'margin')"
                    @input="updateInterestRate('cr', 'margin', $event)")
                    .fa.fa-percent
              .row
                .col.is-2 Debit
                .col.is-2: input(type="text", :value="getInterestReachSetting('dr', 'margin')"
                            @input="updateInterestReach('dr', 'margin', $event)")
                .col.is-2
                  .percent-addon
                    input(type="text", :value="getInterestRateSetting('dr', 'margin')"
                    @input="updateInterestRate('dr', 'margin', $event)")
                    .fa.fa-percent
              .row
                .col.is-2 Penalty Interest
                .col.is-2: input(type="text", :value="getInterestReachSetting('pi', 'margin')"
                            @input="updateInterestReach('pi', 'margin', $event)")
                .col.is-2
                  .percent-addon
                    input(type="text", :value="getInterestRateSetting('pi', 'margin')"
                    @input="updateInterestRate('pi', 'margin', $event)")
                    .fa.fa-percent

</template>

<script>
import { merge, pick } from 'lodash'
import Select2 from './Select2'
import Datepicker from './Datepicker'
import NumberInput from './NumberInput'
import stub from '../stub'

export default {
  components: { Select2, Datepicker, NumberInput },

  props: ['load'],

  data() {
    return {
      view: 'cash',
      cash: $.extend(true, {}, stub),
      rolling: $.extend(true, {
        authDate: null
      }, stub),
      margin: $.extend(true, {
        authDate: null,
        limit: 0
      }, stub),
      settlement: {
        options: {
          cash: [
            {id: 'auto', text: 'Auto Settlement'},
            {id: 'cheque', text: 'Cheque'}
          ],
          dividend: [
            {id: 'auto', text: 'Auto Settlement'},
            {id: 'cheque', text: 'Cheque'},
            {id: 'autopay', text: 'Autopay'}
          ]
        }
      }
    }
  },

  computed: {
    cashClass() {
      return this.cash.status.selected
    },

    rollingClass() {
      return this.rolling.status.selected
    },

    marginClass() {
      return this.margin.status.selected
    },

    cashActiveMarkets() {
      return this.cash.markets.filter(v => v.active)
    },

    cashActiveMarketsSelect2() {
      let options = [{id: 'all', text: 'ALL'}]
      this.cash.markets.filter(v => v.active).map(v => {
        options.push({id: v.id, text: v.id.toUpperCase()})
      })
      return options
    },

    rollingActiveMarkets() {
      return this.rolling.markets.filter(v => v.active)
    },

    rollingActiveMarketsSelect2() {
      let options = [{id: 'all', text: 'ALL'}]
      this.rolling.markets.filter(v => v.active).map(v => {
        options.push({id: v.id, text: v.id.toUpperCase()})
      })
      return options
    },

    marginActiveMarketsSelect2() {
      let options = [{id: 'all', text: 'ALL'}]
      this.margin.markets.map(v => {
        options.push({id: v.id, text: v.id.toUpperCase()})
      })
      return options
    }
  },

  created() {
    this.margin.markets = this.margin.markets.slice(0, 3)
  },

  mounted() {
    $(this.$refs.cash.$el).val('active').trigger('change')
    $(this.$refs.cashOpenDate.dp).datepicker('update', new Date).trigger('changeDate')

    $(this.$refs.cashRebate[0].$el).val('vc_35').trigger('change')
    $(this.$refs.rollingRebate[0].$el).val('vc_35').trigger('change')
    $(this.$refs.marginRebate[0].$el).val('vc_35').trigger('change')
  },

  watch: {
    'cash.status.selected': {
      handler(val) {
        if (val == 'active' || val == 'suspended' && this.rolling.status.selected != 'closed' && !this.load) {
          $(this.$refs.rolling.$el).val('inactive').trigger('change')
        }

        if (val == 'inactive') {
          $(this.$refs.cashOpenDate.dp).datepicker('update', '').trigger('changeDate')
          if (!this.load)
            this.cash.code = ''
        }

        if (val == 'active' && this.cash.openDate == '') {
          $(this.$refs.cashOpenDate.dp).datepicker('update', new Date).trigger('changeDate')
        }

        if (val == 'suspended') {
          $(this.$refs.cashSuspendDate.dp).datepicker('update', new Date).trigger('changeDate')
        }

        if (val == 'closed') {
          $(this.$refs.cashCloseDate.dp).datepicker('update', new Date).trigger('changeDate')
        }
      }
    },

    'cash.rebates': {
      handler(val) {
        val.map((v, k) => {
          if (/hkg|all/.test(v.market) == false) {
            this.cash.rebates[k].ipoRebate = ''
          } else if (v.selected == 'vc_0'){
            this.cash.rebates[k].ipoRebate = '0'
          } else {
            this.cash.rebates[k].ipoRebate = v.selected.replace('vc_', '0.')
          }

          this.$nextTick(() => {
            $(this.$refs.cashRebate[k].$el).val(v.selected).trigger('change')
            $(this.$refs.cashRebateMarket[k].$el).val(this.cash.rebates[k].market).trigger('change')
          })
        })
      },
      deep: true
    },

    'cash.markets': {
      handler(val) {
        this.cash.rebates.splice(1, 10)
        this.cash.rebates[0].market = 'all'
      },
      deep: true
    },

    'cash.code': {
      handler(val) {
        if (this.load) return
        let status = val.trim() ? 'active' : 'inactive'
        $(this.$refs.cash.$el).val(status).trigger('change')
      }
    },

    'rolling.status.selected': {
      handler(val) {
        if (val == 'active' || val == 'suspended' && this.cash.status.selected != 'closed' && !this.load) {
          $(this.$refs.cash.$el).val('inactive').trigger('change')
        }

        if (val == 'inactive') {
          $(this.$refs.rollingOpenDate.dp).datepicker('update', '').trigger('changeDate')
          if (!this.load)
            this.rolling.code = ''
        }

        if (val == 'active' && this.rolling.openDate == '') {
          $(this.$refs.rollingOpenDate.dp).datepicker('update', new Date).trigger('changeDate')
          let year = new Date().getFullYear()
          $(this.$refs.rollingAuthDate.dp).datepicker('update', '31/12/'+year).trigger('changeDate')
        }

        if (val == 'suspended') {
          $(this.$refs.rollingSuspendDate.dp).datepicker('update', new Date).trigger('changeDate')
        }

        if (val == 'closed') {
          $(this.$refs.rollingCloseDate.dp).datepicker('update', new Date).trigger('changeDate')
          $(this.$refs.rollingAuthDate.dp).datepicker('update', new Date).trigger('changeDate')
        }
      }
    },

    'rolling.rebates': {
      handler(val) {
        val.map((v, k) => {
          if (/hkg|all/.test(v.market) == false) {
            this.rolling.rebates[k].ipoRebate = ''
          } else if (v.selected == 'vc_0'){
            this.rolling.rebates[k].ipoRebate = '0'
          } else {
            this.rolling.rebates[k].ipoRebate = v.selected.replace('vc_', '0.')
          }

          this.$nextTick(() => {
            $(this.$refs.rollingRebate[k].$el).val(v.selected).trigger('change')
            $(this.$refs.rollingRebateMarket[k].$el).val(this.rolling.rebates[k].market).trigger('change')
          })
        })
      },
      deep: true
    },

    'rolling.markets': {
      handler(val) {
        this.rolling.rebates.splice(1, 10)
        this.rolling.rebates[0].market = 'all'
      },
      deep: true
    },

    'rolling.code': {
      handler(val) {
        if (this.load) return
        let status = val.trim() ? 'active' : 'inactive'
        $(this.$refs.rolling.$el).val(status).trigger('change')
      }
    },

    'margin.status.selected': {
      handler(val) {
        if (val == 'active' && this.margin.openDate == '') {
          $(this.$refs.marginOpenDate.dp).datepicker('update', new Date).trigger('changeDate')
          let year = new Date().getFullYear()
          $(this.$refs.marginAuthDate.dp).datepicker('update', '31/12/'+year).trigger('changeDate')
        }

        if (val == 'inactive') {
          $(this.$refs.marginOpenDate.dp).datepicker('update', '').trigger('changeDate')
          if (!this.load)
            this.margin.code = ''
        }

        if (val == 'suspended') {
          $(this.$refs.marginSuspendDate.dp).datepicker('update', new Date).trigger('changeDate')
        }

        if (val == 'closed') {
          $(this.$refs.marginCloseDate.dp).datepicker('update', new Date).trigger('changeDate')
          $(this.$refs.marginAuthDate.dp).datepicker('update', new Date).trigger('changeDate')
        }
      }
    },

    'margin.rebates': {
      handler(val) {
        val.map((v, k) => {
          if (/hkg|all/.test(v.market) == false) {
            this.margin.rebates[k].ipoRebate = ''
          } else if (v.selected == 'vc_0'){
            this.margin.rebates[k].ipoRebate = '0'
          } else {
            this.margin.rebates[k].ipoRebate = v.selected.replace('vc_', '0.')
          }

          this.$nextTick(() => {
            $(this.$refs.marginRebate[k].$el).val(v.selected).trigger('change')
            $(this.$refs.marginRebateMarket[k].$el).val(this.margin.rebates[k].market).trigger('change')
          })
        })
      },
      deep: true
    },

    'margin.code': {
      handler(val) {
        let status = val.trim() ? 'active' : 'inactive'
        $(this.$refs.margin.$el).val(status).trigger('change')
      }
    }
  },

  methods: {
    changeView(v) {
      this.view = v
    },

    isView(v) {
      return this.view == v
    },

    isTab(acc, tab) {
      return this[acc].tab == tab
    },

    isActive(acc, tab) {
      return { 'active-info': this[acc].tab == tab }
    },

    changeTab(acc, tab) {
      this[acc].tab = tab
    },

    notGlobal(market) {
      return /hkg|sha|sza/.test(market)
    },

    notHKG(market, i) {
      return /hkg|all/.test(market) == false
    },

    isStatus(acc, status) {
      if (this[acc].status.selected == 'active') return true

      return this[acc].status.selected !== status
    },

    updateBrokerageM(brokerage, key, e) {
      brokerage.manual.setting[key] = e.target.value
    },

    updateBrokerageO(brokerage, key, e) {
      brokerage.other.setting[key] = e.target.value
    },

    updateInterestRate(key, type, e) {
      this[type].interests[key].setting.rate = e.target.value
    },

    updateInterestReach(key, type, e) {
      this[type].interests[key].setting.reach = e.target.value
    },

    addRebateMarket(type) {
      let key = `${type}ActiveMarketsSelect2`
      if (this[type].rebates.length < this[key].length) {
        this[type].rebates.push({
          options: [
            {id: 'vc_0', text: 'AE 0%, Company 100%'},
            {id: 'vc_35', text: 'AE 35%, Company 65%'},
            {id: 'vc_40', text: 'AE 40%, Company 60%'},
            {id: 'vc_50', text: 'AE 50%, Company 50%'},
            {id: 'vc_60', text: 'AE 60%, Company 40%'},
          ],
          selected: 'vc_35',
          ipoRebate: 0.35,
          market: 'all'
        })
      }
    },

    removeRebateMarket(type, i) {
      let row = ''
      switch (type) {
        case 'cash':
          row = `#ca-row-${i}`
          break
        case 'cash':
          row = `#ra-row-${i}`
          break
        case 'cash':
          row = `#ma-row-${i}`
          break
      }
      $(row).addClass('fadeDown')
      setTimeout(() => this[type].rebates.splice(i, 1), 450)
    },

    getBrokerageSetting(brokerage, key) {
      return brokerage.setting[key].trim() ? brokerage.setting[key] : brokerage.default[key]
    },

    getInterestRateSetting(key, type) {
      return this[type].interests[key].setting.rate.trim() ?
      this[type].interests[key].setting.rate :
      this[type].interests[key].default.rate
    },

    getInterestReachSetting(key, type) {
      return this[type].interests[key].setting.reach.trim() ?
      this[type].interests[key].setting.reach :
      this[type].interests[key].default.reach
    },

    checkStatus(type) {
      if (this[type].status.options.length > 3) {
        return false
      }

      return this.load && this[type].status.selected != 'inactive'
    },

    copyCash() {
      merge(this.rolling, pick(this.cash, ['code', 'markets', 'brokerages', 'rebates']))
      if (this.rolling.status.selected == 'inactive') {
        this.rolling.status.selected = 'active'
      }
    },

    copyRolling() {
      merge(this.cash, pick(this.rolling, ['code', 'markets', 'brokerages', 'rebates']))
      if (this.cash.status.selected == 'inactive') {
        this.cash.status.selected = 'active'
      }
    },

    copyCashM() {
      merge(this.margin, pick(this.cash, ['code', 'brokerages', 'rebates']))
      if (/^m/i.test(this.margin.code) == false) {
        this.margin.code = 'M'+this.margin.code
      }

      if (this.margin.status.selected == 'inactive') {
        this.margin.status.selected = 'active'
      }
    },

    copyRollingM() {
      merge(this.margin, pick(this.rolling, ['code', 'brokerages', 'rebates']))
      if (/^m/i.test(this.margin.code) == false) {
        this.margin.code = 'M'+this.margin.code
      }

      if (this.margin.status.selected == 'inactive') {
        this.margin.status.selected = 'active'
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  .bb
    padding 10px 0
    margin-left 0
    margin-right 0
    &:nth-child(odd)
      background-color lighten(#51A8DD, 90%)
      border-left 3px solid #255359
    &:nth-child(even)
      background-color lighten(#51A8DD, 96%)
      border-left 3px solid #255359

  .cash
    background-color lighten(#005CAF, 90%)
    color darken(#005CAF, 50%)
    font-weight 700

  .rolling
    background-color lighten(#FC9F4D, 75%)
    color darken(#FC9F4D, 50%)
    font-weight 700

  .margin
    background-color lighten(#EFBB24, 80%)
    color darken(#EFBB24, 50%)
    font-weight 700

  .active
    background-color #86C166
    color #FFFFFB
    &:hover
      background-color darken(#86C166, 20%)

  .inactive
    background-color lighten(#91989F, 70%)
    color darken(#91989F, 10%)
    &:hover
      background-color lighten(#91989F, 50%)

  .closed
    background-color #9F353A
    color #FFFFFB
    &:hover
      background-color darken(#9F353A, 20%)

  .suspended
    background-color #8A6BBE
    color #FFFFFB
    &:hover
      background-color darken(#8A6BBE, 20%)

  .ccy
    background-color lighten(#255359, 80%)
    font-weight 800
    color darken(#77969A, 60%)
    padding 3px 5px
    width 100px
    border-radius 2px
    text-align center
    margin-bottom 8px

  .max-h
    max-height 320px
    min-height 320px
    overflow-y auto

  .max-hm
    max-height 280px
    min-height 280px
    overflow-y auto

  .row-no
    margin-left 0
    margin-right 0

  .percent-addon
    position relative
    & > .fa.fa-percent
      position absolute
      top 9px
      right 9px
</style>
