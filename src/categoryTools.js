var	Groups = require('./groups'),
	User = require('./user'),

	async = require('async'),

	CategoryTools = {};

CategoryTools.privileges = function(cid, uid, callback) {
	async.parallel({
		"+r": function(next) {
			var	key = 'cid:' + cid + ':privileges:+r';
			Groups.exists(key, function(err, exists) {
				if (exists) {
					async.parallel({
						isMember: function(next) {
							Groups.isMemberByGroupName(uid, key, next);
						},
						isEmpty: function(next) {
							Groups.isEmptyByGroupName(key, next);
						}
					}, next);
				} else {
					next(null, {
						isMember: false,
						isEmpty: true
					});
				}
			});
		},
		"+w": function(next) {
			var	key = 'cid:' + cid + ':privileges:+w';
			Groups.exists(key, function(err, exists) {
				if (exists) {
					async.parallel({
						isMember: function(next) {
							Groups.isMemberByGroupName(uid, key, next);
						},
						isEmpty: function(next) {
							Groups.isEmptyByGroupName(key, next);
						}
					}, next);
				} else {
					next(null, {
						isMember: false,
						isEmpty: true
					});
				}
			});
		},
		moderator: function(next) {
			User.isModerator(uid, cid, next);
		},
		admin: function(next) {
			User.isAdministrator(uid, next);
		}
	}, function(err, privileges) {
		callback(err, !privileges ? null : {
			"+r": privileges['+r'].isMember,
			"+w": privileges['+w'].isMember,
			read: (privileges['+r'].isMember || privileges['+r'].isEmpty) || privileges.moderator || privileges.admin,
			write: (privileges['+w'].isMember || privileges['+w'].isEmpty) || privileges.moderator || privileges.admin,
			editable: privileges.moderator || privileges.admin,
			view_deleted: privileges.moderator || privileges.admin
		});
	});
};

module.exports = CategoryTools;