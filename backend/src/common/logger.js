/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

import bunyan from 'bunyan';
import RotatingFileStream from 'bunyan-rotating-file-stream';
import makeDir from 'make-dir';

import { envVal } from './env-val';

import { recordFormatter } from './record-formatter';

import { obscureObject, handleErrorObject, logCtx } from './logger-utils';
import { addTimeFnsToBunyan } from './enhance-bunyan';

const cloudEnv = envVal('CLOUD_ENV', 'UNKNOWN');
const syslogHost = envVal('SYSLOG_HOST', '');
const nodeEnv = envVal('NODE_ENV', 'development');

let syslogEnabled;
let syslogAddress;
let syslogPort;

const elasticLogHost = envVal('ELASTIC_LOG_HOST', '');

let elasticLogEnabled;
const obscureFields = [
  'socSecNumber',
  'token',
  'Token',
  'key',
  'Key',
  'authorization',
  'Authorization',
  'ssn',
  'password',
];

const containsAnyObscureFields = rec =>
  rec.socSecNumber ||
  rec.token ||
  rec.Token ||
  rec.key ||
  rec.Key ||
  rec.authorization ||
  rec.Authorization ||
  rec.ssn ||
  rec.password;

if (syslogHost !== '') {
  // For some reason, `bunyan-syslog` opens a server on port `42459`
  // this prevents the migration script to actually exit, so the
  // next script is never executed. This makes the PR to fail.
  //
  // ```
  // - Servers:
  // - 0.0.0.0:42459 (UDP)
  // ```
  //
  // Why is this server open, I really don't know,
  // but I was able to find it using the module
  // [wtfnode](https://www.npmjs.com/package/wtfnode).
  //
  // So now the logs will only be sent to the syslog
  // server when the env variable `SYSLOG_ENABLED`
  // is set to `true`. This is currently only happening
  // when the app is launch in production mode
  // (using `npm start`).
  //
  syslogEnabled = envVal('SYSLOG_ENABLED', false);
  [syslogAddress, syslogPort] = syslogHost.split(':');
}

if (elasticLogHost !== '') {
  elasticLogEnabled = envVal('ELASTIC_LOG_ENABLED', false);
}

const serializeSensitive = (obj, properties = obscureFields) => obscureObject(obj, properties);

const overrideEmit = level => {
  const logLevel = bunyan.levelFromName[level];
  const oldEmit = bunyan.prototype._emit;

  bunyan.prototype._emit = function overrideLevel(origRec, noEmit) {
    const { ctx, ...rest } = origRec;
    let rec = { ...logCtx(ctx), ...rest };

    if (noEmit || rec.level < logLevel) {
      return '';
    }

    if (rec.sensitiveData) {
      rec.sensitiveData = serializeSensitive(rec.sensitiveData);
    }

    if (containsAnyObscureFields(rec)) rec = serializeSensitive(rec);

    // TODO:
    // serialize sensitive should not depend on the data on the request
    // this should be done by the logger-middleware request serializer
    if (rec.req && rec.req.body) {
      rec.req.body = serializeSensitive(rec.req.body, rec.req.obscureBody);
    }

    rec = handleErrorObject(rec);

    return oldEmit.apply(this, [rec, noEmit]);
  };
};

addTimeFnsToBunyan(bunyan);

const dir = './logs/';

export const create = (name, useStdOut, src, level) => {
  overrideEmit(level);

  if (useStdOut) {
    // override internal bunyan ._emit method
    // to be able to produce human readable logs
    const logLevel = bunyan.levelFromName[level];
    const oldEmit = bunyan.prototype._emit;
    bunyan.prototype._emit = function overrideLevel(...args) {
      const origRec = args[0];
      const { ctx, ...rec } = origRec;
      const newRec = { ...logCtx(ctx), ...rec };

      const noEmit = args[1];

      if (!noEmit && newRec.level >= logLevel) {
        const logArgs = recordFormatter.format(newRec, name);

        console.log(...logArgs);
      }

      return oldEmit.apply(this, args);
    };
  }

  const getStreams = () => {
    const logKeepDays = envVal('RED_LOG_KEEP_DAYS', 3);
    const isPR = envVal('isPR', false);
    const shouldZipLogFiles = !isPR;
    const streams = [
      {
        type: 'raw',
        stream: new RotatingFileStream({
          path: `${dir}${name}.log`,
          period: '1d',
          totalFiles: logKeepDays,
          gzip: shouldZipLogFiles,
        }),
      },
    ];

    if (syslogEnabled) {
      const bsyslog = require('bunyan-syslog'); // eslint-disable-line
      streams.push({
        type: 'raw',
        stream: bsyslog.createBunyanStream({
          type: 'udp',
          facility: bsyslog.local0,
          host: syslogAddress,
          port: parseInt(syslogPort, 10),
        }),
      });
    }

    if (elasticLogEnabled) {
      // it is better to do a lazy require of bunyan-elasticsearch,
      // to avoid any code to be autoexecuted when it is not needed
      const ElasticsearchLogger = require('bunyan-elasticsearch');

      const esStream = new ElasticsearchLogger({
        // switching to env variable to avoid to depend on a given config module
        // since this file is also loaded from the other services
        indexPattern: envVal('ELASTIC_LOG_PATTERN', '[logstash-]YYYY.MM.DD'),
        type: 'logs',
        host: elasticLogHost,
      });

      esStream.on('error', err => {
        console.log('Elasticsearch logging stream error:', err.stack);
      });

      streams.push({
        stream: esStream,
      });
    }

    return streams;
  };

  return bunyan.createLogger({
    name,
    level,
    src,
    serializers: { ...bunyan.stdSerializers, error: bunyan.stdSerializers.err, e: bunyan.stdSerializers.err },
    streams: getStreams(),
    cloudEnv,
  });
};

let loggerInstance;

export const logger = new Proxy(
  {},
  {
    get(obj, key) {
      if (!loggerInstance) throw new Error('logger instance not found. Forgot to call initLogger?');
      if (key === 'child') {
        return (...args) => loggerInstance[key](...args);
      }
      return loggerInstance[key];
    },
  },
);

export const initLogger = async () => {
  await makeDir('./logs');

  loggerInstance = create(
    envVal('RED_PROCESS_NAME', 'unknown-process'),
    envVal('RED_LOGGER_USE_STDOUT', true),
    envVal('RED_LOGGER_SRC', nodeEnv !== 'production'),
    envVal('RED_LOG_LEVEL', 'trace'),
  );

  return loggerInstance;
};
