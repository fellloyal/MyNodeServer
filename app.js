
var mqtt = require('mqtt'); //生成MQTT对象

var log4js = require('log4js');//生成日志对象

var MongoClient = require('mongodb').MongoClient; //生成MongoDb对象

var url  ="mongodb://127.0.0.1"
var dbo ;//数据库连接对象
MongoClient.connect(url,function(err,db){
  if(err) throw err;
  console.log("mongodb 数据库连接成功");
  dbo = db.db("oilmgdb");
  
});


//配置日志输出
log4js.configure({
    appenders: {
      
      out: { type: 'stdout' },//设置是否在控制台打印日志
      info: {type: 'dateFile',
        filename: 'logs/log',
        pattern: '_yyyy-MM-dd.log',
        alwaysIncludePattern: true,
        category: 'dateFileLog'      },
      },

        categories: {
      default: { appenders: [ 'out', 'info' ], level: 'info' }//去掉'out'。控制台不打印日志
    }
  });
  
  var logger = log4js.getLogger('info'); 

  
//mqtt连接对象
var client  = mqtt.connect('mqtt://127.0.0.1');

function ConnectMqttHandler()
{
  client.subscribe('OilServer/#')
  //client.publish('oilPrice', 'Hello mqtt')
  logger.info('Server Connected');
  console.log("mqtt 服务器连接成功") 
}
//定义连接mqtt服务器事件
client.on('connect',  ConnectMqttHandler());


//收到mqtt 消息事件
client.on('message', function (topic, message) {
  // message is Buffer

  console.log(topic.toString());
  console.log(message.toString());
  logger.info('Server get Message');
  client.publish('Client/PC0000001', 'Server Answer');
   var myobj = {topic:topic,message:message.toString()};
  dbo.collection("tradeId").insertOne(myobj,function(err,res){
    if(err) throw err;
  })
 
  // client.end();
})

console.log('系统开始监听!!!');
