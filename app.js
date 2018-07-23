
var mqtt = require('mqtt'); //生成MQTT对象

var log4js = require('log4js');//生成日志对象

var MongoClient = require('mongodb').MongoClient; //生成MongoDb对象

var mysql = require('mysql');//生成mysql对象

var fs = require('fs');//得到file对象

var myCrypto = require('./formatSign');



var mysqlConnection;//声明mysql连接对象

var configData;//声明系统配置文件对象


var dbo;//mongoDb数据库连接对象


var mqttClient;//mqtt连接对象


//------从日志开始初始化------使用promise语法
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





function splitTopic(topic)
{
  let strArray = topic.split("/");

  return strArray;


}

var messageHandler = function (topic, message) {

  var topicArray;//主题根据 / 分解后的数组
  logger.info("topic : "+topic.toString());
  logger.info("message : "+ message.toString("utf8"));
  topicArray = splitTopic(topic.toString());
  
  topicArray.forEach(function(item,index)  {
    logger.info("topic["+index+"]"+" = " + item)
  })

  logger.info('\n');
  


}





var promiseCodes = new Promise((resolve, reject) => {

  configData = fs.readFileSync("./appConfig.json");

  resolve('ok');

})

promiseCodes.then((value) => {
  configData = JSON.parse(configData);

})
  .then((value) => {

    return mysql.createConnection({

      host: configData.mysqlConfig.mysqlServerUrl,
      user: configData.mysqlConfig.mysqlUserName,
      password: configData.mysqlConfig.mysqlPassword,
      database: configData.mysqlConfig.mysqlDataBaseName
    });

  })

  .then((value) => {
    mysqlConnection = value;

    mysqlConnection.connect();

  })
  .then((value) => {
    logger.info("mysql server url : " + configData.mysqlConfig.mysqlServerUrl, );
    logger.info("mysql 数据库名 : " + configData.mysqlConfig.mysqlDataBaseName);

    logger.info("mysql 数据库连接成功");
    logger.info('\n');



  })
  .then((value) => {
    logger.info("mongoDb server url : " + configData.mongoDbConfig.mongoDbServerUrl);
    logger.info("mongoDb 数据集名 : " + configData.mongoDbConfig.mongoCollectionName);

    MongoClient.connect(configData.mongoDbConfig.mongoDbServerUrl, { useNewUrlParser: true });
  })
  .then((value) => {
    logger.info("mongodb 服务器连接成功");
    logger.info('\n');
  })
  .then((value) => {
    return mqtt.connect('mqtt://127.0.0.1');

  })
  .then((value) => {
    logger.info('mqtt 服务器连接成功');
    mqttClient = value;

    mqttClient.subscribe('Pc/#');
    logger.info('    订阅 站点 Topic Pc/# ');
    mqttClient.subscribe('Filling/#');
    logger.info('    订阅 加注设备 Topic Filling/# ');
    mqttClient.subscribe('Sensor/#');
    logger.info('    订阅 传感器 Topic Sensor/# ');

   
  })
  .then((value) => {

    //收到mqtt 消息事件
    mqttClient.on('message', messageHandler);
    logger.info('  注册消息处理事件');
    logger.info('\n');

  })
  .then((value) => {

    //收到mqtt 消息事件
    logger.info('系统开始监听!!!');
  })

  .catch(function (error) {
    logger.info(error);
  });





process.on('SIGINT', function () {
  logger.info("进程收到 SIGINT 信号 准备退出!");

  process.exit(0);
});


