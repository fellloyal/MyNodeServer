var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://127.0.0.1')

client.on('connect', function () {
  client.subscribe('OilServer/#')
  //client.publish('oilPrice', 'Hello mqtt')
})

client.on('message', function (topic, message) {
  // message is Buffer

  console.log(topic.toString());
  console.log(message.toString());

  client.publish('Client/PC0000001', 'Server Answer');
 
  // client.end();
})

console.log('Program end!!!');