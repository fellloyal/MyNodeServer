
var events = require('events');
var eventsEmitter = new events.EventEmitter();

var connectHandler = function connected(){
    console.log('connect success');
    eventsEmitter.emit('data_received');
}

eventsEmitter.on('connection',connectHandler);

eventsEmitter.on('data_received',function(){
    console.log('data receive success!!!');

});
eventsEmitter.emit('connection');
console.log('program end!!!');

