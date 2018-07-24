
var mqtt = require('mqtt'); //生成MQTT对象

var log4js = require('log4js');//生成日志对象

var MongoClient = require('mongodb').MongoClient; //生成MongoDb对象

var mysql = require('mysql');//生成mysql对象

var fs = require('fs');//得到file对象

var myCrypto = require('./formatSign');



var mysqlConnection;//声明mysql连接对象

var configData;//声明系统配置文件对象



var mqttClient;//mqtt连接对象



/*
var doQuery = function doQuery(sql, callback) {
  this.getConnection(function (err, connection) {
    connection.query(sql, function () {
      callback.apply(connection, arguments);
      connection.release();
    });
  })
}.bind(pool)
*/

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
    mysqlConnection.end();

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

    mqttClient.subscribe('FillinToPc/#');
    logger.info('    订阅 转发加注设备到管控 Topic FillingToPc/# ');
    mqttClient.subscribe('SensorToPc/#');
    logger.info('    订阅 转发传感器到管控 Topic SensorToPc/# ');

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






function splitTopic(topic) {
  let strArray = topic.split("/");

  return strArray;


}

function IsChecked(messageJson) {

  let messageJsonTest = messageJson;
  if (!messageJsonTest.hasOwnProperty("signature")) {
    logger.info("不是合法协议格式,缺少签名");
    return false;
  }

  if (!messageJsonTest.hasOwnProperty("version")) {
    logger.info("不是合法协议格式,缺少版本");
    return false;
  }

  if (!messageJsonTest.hasOwnProperty("nonce")) {
    logger.info("不是合法协议格式,缺少随机数");
    return false;
  }

  if (!messageJsonTest.hasOwnProperty("timeStamp")) {
    logger.info("不是合法协议格式,缺少时间戳");
    return false;
  }

  if (!messageJsonTest.hasOwnProperty("body")) {
    logger.info("不是合法协议格式,缺少数据体");
    return false;
  }

  return true;
}

var messageHandler = function (topic, message) {

  var topicArray;//主题根据 / 分解后的数组
  var messageJson;//payload 解析为JSON字符串

  topicArray = topic.toString();




  messageJson = message.toString("utf8");

  logger.info("topic : " + topicArray);
  logger.info("message : " + messageJson);
  topicArray = splitTopic(topicArray);

  var mongodbId = [topicArray[0], topicArray[1], topicArray[2], topicArray[3]];
  mongodbId = mongodbId.join("/");
  logger.info("mongodbId : " + mongodbId);


  topicArray.forEach(function (item, index) {
    logger.info("topic[" + index + "]" + " = " + item)
  });


  try {
    messageJsonTested = JSON.parse(messageJson);

  }
  catch (err) {
    logger.info("payload 不是合法JSON格式 ");
    return;
  }



  if (!IsChecked(messageJsonTested))  //检查内容是否符合要求
  {
    return;
  }



  for (var name in messageJsonTested) {
    if (messageJsonTested.hasOwnProperty(name)) {
      logger.info(name.toString() + "=" + messageJsonTested[name]);
    }
  }

  var messageObj = new Object();
  messageObj._id = mongodbId;
  messageObj.json = messageJsonTested;


var mongoPormise = new Promise((resolve, reject) => {

  resolve('ok');

})

mongoPormise.then((value) => {
  MongoClient.connect(configData.mongoDbConfig.mongoDbServerUrl, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("oilmgdb");
    var whereStr = { "_id": 'mongodbId' };  // 查询条件
    dbo.collection("ClientInfo").find(whereStr).toArray(function (err, result) {
      if (err) throw err;
      logger.info("ClientInfo查询:" + result);
     
      if (result.length == 0) {
        dbo.collection("ClientInfo").insertOne(messageObj, function (err, res) {
          if (err) throw err;
          console.log("文档插入成功");
          db.close();
        })
      }else
      {

      }
      

    });
  })

}).then((value) => {
    
  })






  logger.info('\n');



}

process.on('SIGINT', function () {
  logger.info("进程收到 SIGINT 信号 准备退出!");

  process.exit(0);
});


