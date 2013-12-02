

(function(module) {
	'use strict';
	var redisClient,
		redis = require('redis'),
		winston = require('winston'),
		nconf = require('nconf'),
		redis_socket_or_host = nconf.get('redis:host'),
		utils = require('./../../public/src/utils.js');

	if (redis_socket_or_host && redis_socket_or_host.indexOf('/')>=0) {
		/* If redis.host contains a path name character, use the unix dom sock connection. ie, /tmp/redis.sock */
		redisClient = redis.createClient(nconf.get('redis:host'));
	} else {
		/* Else, connect over tcp/ip */
		redisClient = redis.createClient(nconf.get('redis:port'), nconf.get('redis:host'));
	}

	if (nconf.get('redis:password')) {
		redisClient.auth(nconf.get('redis:password'));
	}

	var db = parseInt(nconf.get('redis:database'), 10);

	if (db){
		redisClient.select(db, function(error) {
			if(error) {
				winston.error("NodeBB could not connect to your Redis database. Redis returned the following error: " + error.message);
				process.exit();
			}
		});
	}

	/*
	 * A possibly more efficient way of doing multiple sismember calls
	 */
	function sismembers(key, needles, callback) {
		var tempkey = key + ':temp:' + utils.generateUUID();
		redisClient.sadd(tempkey, needles, function() {
			redisClient.sinter(key, tempkey, function(err, data) {
				redisClient.del(tempkey);
				callback(err, data);
			});
		});
	};

	//
	// Exported functions
	//
	module.getFileName = function(callback) {
		var multi = redisClient.multi();

		multi.config('get', 'dir');
		multi.config('get', 'dbfilename');
		multi.exec(function (err, results) {
			if (err) {
				return callback(err);
			}

			results = results.reduce(function (memo, config) {
				memo[config[0]] = config[1];
				return memo;
			}, {});

			var dbFile = path.join(results.dir, results.dbfilename);
			callback(null, dbFile);
		});
	}


	module.setObject = function(key, data, callback) {
		redisClient.hmset(key, data, callback);
	}

	module.setObjectField = function(key, field, callback) {
		redisClient.hset(key, field, callback)
	}

	module.getObject = function(key, callback) {
		redisClient.hgetall(key, callback)
	}

	module.getObjectField = function(key, field, callback) {
		module.getObjectFields(key, [field], function(err, data) {
			if(err) {
				return callback(err);
			}

			callback(null, data[field]);
		});
	}

	module.getObjectFields = function(key, fields, callback) {
		redisClient.hmget(key, fields, function(err, data) {
			if(err) {
				return callback(err, null);
			}

			var returnData = {};

			for (var i = 0, ii = fields.length; i < ii; ++i) {
				returnData[fields[i]] = data[i];
			}

			callback(null, returnData);
		});
	}

	module.deleteObjectField = function(key, field, callback) {
		redisClient.hdel(key, field, callback);
	}

	module.incrObjectField = function(key, field, callback) {
		redisClient.hincrby(key, field, 1, callback);
	}

	module.incrObjectFieldBy = function(key, field, value, callback) {
		redisClient.hincrby(key, field, value, callback);
	}

	module.setAdd = function(key, value, callback) {
		redisClient.sadd(key, value, callback);
	}

	module.setRemove = function(key, value, callback) {
		redisClient.srem(key, value, callback);
	}

	module.isSetMember = function(key, value, callback) {
		redisClient.sismember(key, value, callback);
	}

	module.getSetMembers = function(key, callback) {
		redisClient.smembers(key, callback);
	}

	module.sortedSetAdd = function(key, score, value, callback) {
		redisClient.zadd(key, score, value, callback);
	}

	module.sortedSetRemove = function(key, value, callback) {
		redisClient.zrem(key, value, callback);
	}





}(exports));
