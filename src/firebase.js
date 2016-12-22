export default function(method, key, data, cb) {
  $.ajax({
    method,
    url: `https://mafei.firebaseio.com/clients/${key}.json`,
    data: JSON.stringify(data)
  }).done(cb)
}
