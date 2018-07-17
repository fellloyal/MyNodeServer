var mqtt = require('mqtt');
var log4js = require('log4js');
log4js.configure({
    appenders: {
      out: { type: 'stdout' },//设置是否在控制台打印日志
      info: { type: 'file', filename: './logs/info.log' },
      
    },
    categories: {
      default: { appenders: [ 'out', 'info' ], level: 'info' }//去掉'out'。控制台不打印日志
    }
  });
  
  var logger = log4js.getLogger('info'); 

  

var client  = mqtt.connect('mqtt://127.0.0.1');

client.on('connect', function () {
  client.subscribe('OilServer/#')
  //client.publish('oilPrice', 'Hello mqtt')
  logger.info('Server Connected');
})

client.on('message', function (topic, message) {
  // message is Buffer

  console.log(topic.toString());
  console.log(message.toString());
  logger.info('Server get Message');
  client.publish('Client/PC0000001', 'Server Answer');
 
  // client.end();
})

console.log('okok!!!');
