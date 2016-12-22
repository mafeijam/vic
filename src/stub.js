export default {
  code: '',
  openDate: '',
  suspendDate: '',
  closeDate: '',
  authorized: '',
  discretionary: false,
  status: {
    options: [
      {id: 'inactive', text: 'Inactive'},
      {id: 'active', text: 'Active'},
      {id: 'suspended', text: 'Suspended'},
      {id: 'closed', text: 'Closed'}
    ],
    selected: 'inactive'
  },
  markets: createMarkets(
    ['hkg', 'sha', 'sza', 'usa', 'can', 'ukg', 'jpn', 'aus', 'sgx'],
    [true, true, true]),
  brokerages: {
    hkg: createBrokerage(['HKD', 'CNY'], 100, 0.25),
    sha: createBrokerage(['CNY'], 100, 0.1),
    sza: createBrokerage(['CNY'], 100, 0.1),
    usa: createBrokerage(['USD'], 30, 0.25),
    can: createBrokerage(['CAD'], 50, 0.3),
    ukg: createBrokerage(['GBP'], 40, 0.35),
    jpn: createBrokerage(['JPY'], 3500, 0.3),
    aus: createBrokerage(['AUD'], 50, 0.35),
    sgx: createBrokerage(['SGD', 'USD'], 40, 0.25)
  },
  rebates: [
    {
      options: createRebate(['0', '35', '40', '50', '60']),
      selected: 'vc_35',
      ipoRebate: '0.35',
      market: 'all'
    }
  ],
  interests: {
    cr: createDefault({
          reach: '0',
          rate: '0.025'
        }),
    dr: createDefault({
          reach: '1000',
          rate: '7.25'
        }),
    pi: createDefault({
          reach: '0',
          rate: '7.75'
        })
  },
  tab: 'market'
}

function createDefault(obj) {
  let setting = {}
  Object.keys(obj).map(k => setting[k] = '')

  return {
    default: obj,
    setting
  }
}

function createBrokerage(currencies, defaultmin, defaultRate) {
  let brokerages = []

  currencies.map(currency => {
    brokerages.push({
        currency,
        manual: createDefault({
                  min: defaultmin,
                  rate: defaultRate
                }),
        other: createDefault({
                  min: defaultmin,
                  rate: defaultRate
                })
      })
  })

  return brokerages
}

function createMarkets(markets, options) {
  let allMarkets = []
  markets.map((id, k) => {
    allMarkets.push({
      id,
      active: options[k] || false,
      settlement: {
        cash: 'auto',
        dividend: 'auto'
      }
    })
  })

  return allMarkets
}

function createRebate(options) {
  let rebates = []
  options.map(v => {
    let c = 100 - parseInt(v)
    rebates.push({
      id: `vc_${v}`,
      text: `AE ${v}%, Company ${c}%`
    })
  })

  return rebates
}
