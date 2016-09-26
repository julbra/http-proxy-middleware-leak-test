(function () {
  'use strict';

  var gulp = require('gulp');
  var browserSync = require('browser-sync').create();
  var proxy = require('http-proxy-middleware');
  var WebSocketServer = require('ws').Server;
  var express = require('express');
  var http = require('http');

  var app = express();
  var server = http.createServer(app);

  var port = 3000;

  app.get('/', function (req, res) {
    res.send('Hello World!');
  });

  server.listen(port, function () {
    console.log('Example server listening on port', port);
  });

  var webSocketServer = new WebSocketServer({server: server, path: '/websocket'});
  webSocketServer.on('connection', function connection(webSocketClient) {
    console.log('Client opened a WebSocket connection!');
    webSocketClient.on('message', function incoming(data) {
      console.log('Received message from WebSocket client:', data);
    });
    webSocketClient.on('close', function close(code, message) {
      console.log('Client closed WebSocket connection - Code: ' + code + (message ? ' - Message: ' + message : ''));
    });

    // Let's be polite with our new client
    webSocketClient.send('Hello WebSocket client!');
  });


  gulp.task('default', function (callback) {
    var proxyMiddleware = proxy('/', {
      ws: true,
      prependPath: false,
      target: 'http://localhost:' + port,
      changeOrigin: true,
      logLevel: 'debug'
    });

    browserSync.init({
      server: {
        baseDir: ".",
        middleware: [proxyMiddleware]
      },
      ghostMode: false,
      port: port + 100
    }, function () {
      callback();
    });
  });

  gulp.task('express', function (callback) {
    var app2 = express();
    var server2 = http.createServer(app2);
    var proxyMiddleware = proxy({
      ws: true,
      prependPath: false,
      target: 'http://localhost:' + port,
      changeOrigin: true,
      logLevel: 'debug'
    });
    app2.use('/', proxyMiddleware);
    server2.listen(port + 1, function () {
      console.log('Example server2 listening on port', port + 1);
      callback();
    });
  });

})();
