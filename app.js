
var mqtt = require('mqtt'); //生成MQTT对象

var log4js = require('log4js');//生成日志对象

var MongoClient = require('mongodb').MongoClient; //生成MongoDb对象

var mysql = require('mysql');//生成mysql对象

var fs = require('fs');//得到file对象



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

    mqttClient.subscribe('Station/#');
    logger.info('    订阅 站点 Topic Station/# ');
    mqttClient.subscribe('Filling/#');
    logger.info('    订阅 加注设备 Topic Filling/# ');
    mqttClient.subscribe('Sensor/#');
    logger.info('    订阅 传感器 Topic Sensor/# ');

    logger.info('\n');
  })
  .then((value) => {

    //收到mqtt 消息事件
    mqttClient.on('message', function (topic, message) {
      // message is Buffer

      console.log(topic.toString());
      console.log(message.toString("utf8"));
      logger.info('Server get Message');
      mqttClient.publish('Client/PC0000001', 'Server Answer');
      var myobj = { topic: topic, message: message.toString() };
      dbo.collection("tradeId").insertOne(myobj, function (err, res) {
        if (err) throw err;
      })

      // client.end();
    })

  })

  .catch(function (error) {
    logger.info(error);
  });










process.on('SIGINT', function () {
  logger.info("进程收到 SIGINT 信号 准备退出!");

  process.exit(0);
});

console.log('系统开始监听!!!');
