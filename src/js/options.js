var SentryTower = SentryTower || {};

SentryTower.Options = {
	storage: null,

	init: function () {
		this.storage = SentryTower.storageHandler;
		this.storage.init();
	},

	saveOptions: function () {
		var self = this;
		var options = {
			sentryToken: document.getElementById('sentry-api-token').value,
			sentryUrl: document.getElementById('sentry-url').value,
			sentryAPIUrl: document.getElementById('sentry-url').value + "",
			sentryCheckInterval: document.getElementById('sentry-check-interval').value
		};

		this.storage.storage.set({
			sentryOptions: options
		}, function () {
			this.showMessage('Saved');
		});
	},

	restoreOptions: function () {
		this.storage.storage.get(['sentryOptions'], function (items) {
			document.getElementById('sentry-api-token').value = items.sentryOptions.sentryToken;
			document.getElementById('sentry-url').value = items.sentryOptions.sentryUrl;
			document.getElementById('sentry-check-interval').value = items.sentryOptions.sentryCheckInterval;
		});
	},

	saveNewProject: function () {
		var newProject = $('#new-project-save');
		var newProjectName = newProject.text();

		if (newProjectName) {

		} else {

		}
	},

	showDiv: function (id) {
		$('#' + id).show('slide');
		//TODO: Delete input content
	},

	hideDiv: function (id) {
		$('#' + id).hide('slide');
	},

	showMessage: function (message) {
		$('#update-msg').text(message);
		self.showDiv('update-msg');
		setTimeout(function () {
			self.hideDiv('update-msg');
		}, 1000);
	}
};

// document.addEventListener('DOMContentLoaded', restoreOptions);

SentryTower.Options.init();

$('.opener').click(function () {
	var id = $(this).attr('data-related');
	SentryTower.Options.showDiv(id);
});

$('.closer').click(function () {
	var id = $(this).attr('data-related');
	SentryTower.Options.hideDiv(id);
});

$('#save').click(function () {
	SentryTower.Options.saveOptions();
});

$('#new-project-save').click(function () {
	SentryTower.Options.saveNewProject();
});

$( document ).ready(function() {
	SentryTower.Options.restoreOptions();
});
