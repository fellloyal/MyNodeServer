
var mqtt = require('mqtt'); //生成MQTT对象

var log4js = require('log4js');//生成日志对象

var MongoClient = require('mongodb').MongoClient; //生成MongoDb对象


//配置日志输出
log4js.configure({
  replaceConsole: true,
  appenders: {

    out: { type: 'stdout' },//设置是否在控制台打印日志

    info: {
      type: 'dateFile', //设置向日志文件输出日志
      filename: 'logs/log',
      pattern: '_yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      category: 'dateFileLog'
    },
  },

  categories: {
    default: { appenders: ['out', 'info'], level: 'info' }
  }
});

var logger = log4js.getLogger('info');
logger.info("------------------启动服务程序--------------------------")


var url = "mongodb://127.0.0.1"
var dbo;//数据库连接对象
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  logger.info("mongodb 数据库连接成功");
  dbo = db.db("oilmgdb");

});



//mqtt连接对象
var client = mqtt.connect('mqtt://127.0.0.1');

var ConnectMqttHandler = function () {
  
  client.subscribe('Station/#');
  client.subscribe('Filling/#');
  client.subscribe('Sensor/#');

  //client.publish('oilPrice', 'Hello mqtt')
  logger.info('mqtt 服务器连接成功');
  
}
//定义连接mqtt服务器事件
client.on('connect', ConnectMqttHandler);


//收到mqtt 消息事件
client.on('message', function (topic, message) {
  // message is Buffer

  console.log(topic.toString());
  console.log(message.toString());
  logger.info('Server get Message');
  client.publish('Client/PC0000001', 'Server Answer');
  var myobj = { topic: topic, message: message.toString() };
  dbo.collection("tradeId").insertOne(myobj, function (err, res) {
    if (err) throw err;
  })

  // client.end();
})

console.log('系统开始监听!!!');
