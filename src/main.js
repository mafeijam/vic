import Vue from 'vue'
Vue.config.silent = true
Vue.directive('ripple', {
  bind(el, { arg }) {
    let circle, size, x, y

    let element = $(el)

    let colors = {
      blue: 'rgba(0, 137, 167, .2)',
      white: 'rgba(255, 255, 255, .5)'
    }

    element.click(e => {
      element.addClass('ripple')
      if (element.find('.ripple-circle').length == 0) {
        element.prepend('<span class="ripple-circle"></span>')
      }

      circle = element.find('.ripple-circle')
      circle.removeClass('ripple-effect')

      circle.css('background', colors[arg])

      size = Math.max(element.outerWidth(), element.outerHeight())
      circle.css({height: size, width: size})

      x = e.pageX - element.offset().left - circle.width()/2
      y = e.pageY - element.offset().top - circle.height()/2

      circle.css({top: y, left: x}).addClass('ripple-effect')
    })
  }
})

new Vue({
  el: '#app',
  data: {
    new: {}
  },
  render: h => h(require('./App'))
})
