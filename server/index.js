/* eslint consistent-return:0 import/order:0 */
import '@babel/polyfill';
import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import request from 'request';

import logger from './logger';
import router from './router';

import argv from './argv';
import port from './port';
import { connect } from './config/db';
import { configJWTStrategy } from './api/middlewares/passport-jwt';
import { initNotificationService } from './api/resources/Notification/notification.service';
import '../server/api/common/prototype';
import i18next, { TFunction } from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import Backend from 'i18next-fs-backend';

import { enTranslation } from './locales/en/translation.js';
import { viTranslation } from './locales/vi/translation.js';
import cluster from 'cluster';
import cors from 'cors';

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
};

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    debug: false,
    lng: 'vi',
    resources: resources,
    ns: ['translation'],
    defaultNS: 'translation',
    allowMultiLoading: true,
    fallbackLng: 'vi',
    preload: ['vi'],
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

function startServer(isInitWorker) {
  console.log(`Worker ${process.pid} started`, 'INIT_WORKER', isInitWorker);
  connect(isInitWorker);

  const app = express();

  app.use(i18nextMiddleware.handle(i18next));

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 1000000 }));

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
  app.use('/api', router);

  // Set up CORS middleware for your Express app
  app.use(cors());

  app.use(passport.initialize());
  configJWTStrategy();

// get the intended host and port number, use localhost and port 8080 if not provided
  const customHost = argv.host || process.env.HOST;
  const host = customHost || null; // Let http.Server use its default IPv6/4 host
  const prettyHost = customHost || 'localhost';

// use the gzipped bundle
  app.get('*.js', (req, res, next) => {
    req.url = req.url + '.gz'; // eslint-disable-line
    res.set('Content-Encoding', 'gzip');
    next();
  });

// Start your app.
  const server = app.listen(port, host, async err => {
    if (err) {
      return logger.error(err.message);
    }
    logger.appStarted(port, prettyHost);
  });

  initNotificationService(server);
  const v8 = require('v8');
  const totalHeapSize = v8.getHeapStatistics().total_available_size;
  const totalHeapSizeGb = (totalHeapSize / 1024 / 1024 / 1024).toFixed(2);
  console.log('totalHeapSizeGb: ', totalHeapSizeGb);
}

function isInitWorker() {
  return process.env.INIT_WORKER;
}

exports.isInitWorker = isInitWorker;

if (process.env.NODE_ENV !== 'production') {
  startServer(true);
} else {
  const cluster = require('cluster');
  const totalCPUs = require('os').cpus().length;
  if (cluster.isMaster) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Master ${process.pid} is running`);
    let initWorkerPID = 0;

    function runInitWorker() {
      const firstWorker = cluster.fork({ ...process.env, INIT_WORKER: true }); // Dùng init Worker để initDb và run Job, dùng INIT_WORKER để phân biết khi xử lý
      initWorkerPID = firstWorker.process.pid;
    }

    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
      if (i === 0) {
        runInitWorker();
      } else {
        cluster.fork();
      }
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      console.log('Let\'s fork another worker!');
      if (worker.process.pid === initWorkerPID) {
        runInitWorker();
      } else {
        cluster.fork();
      }
    });
  } else {
    startServer(isInitWorker());
  }
}
