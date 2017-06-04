var SentryTower = SentryTower || {};

SentryTower.Options = {
	storage: null,

	init: function () {
		this.storage = SentryTower.storageHandler;
		this.storage.init();
	},

	/**
	 *
	 */
	saveOptions: function () {
		var self = this;
		var options = {
			sentryToken: document.getElementById('sentry-api-token').value,
			sentryUrl: document.getElementById('sentry-url').value,
			sentryAPIUrl: document.getElementById('sentry-url').value + "",
			sentryCheckInterval: document.getElementById('sentry-check-interval').value * 1000 // Converting to milliseconds
		};

		this.storage.storage.set({
			sentryOptions: options
		}, function () {
			self.showMessage('Saved');
		});
	},

	restoreOptions: function () {
		var self = this;
		this.storage.storage.get(['sentryOptions', 'sentryProjects', 'sentryOrganizations'], function (items) {
			document.getElementById('sentry-api-token').value = items.sentryOptions.sentryToken;
			document.getElementById('sentry-url').value = items.sentryOptions.sentryUrl;
			document.getElementById('sentry-check-interval').value = items.sentryOptions.sentryCheckInterval / 1000; // Converting from milliseconds

			$.each(items.sentryOrganizations, function (index, organizationName) {
				self.addNewOrganizationToLists(organizationName);
			});

			$.each(items.sentryProjects, function (index, projectName) {
				self.addNewProjectToLists(projectName);
			});
		});
	},

	saveNewOrganization: function () {
		var self = this;
		var newOrganizationName = $('#sentry-organization').val().trim();

		if (newOrganizationName) {
			this.storage.storage.get(['sentryOrganizations'], function (items) {
				var organizations = [];
				if (items.sentryOrganizations) {
					organizations = items.sentryOrganizations;
				}

				organizations.push(newOrganizationName);
				self.storage.storage.set({sentryOrganizations: organizations});
				self.addNewOrganizationToLists(newOrganizationName);
				self.showMessage('Organization is saved.');
				self.toggleDivs('sentry-existing-organizations', 'new-organization');
			});

		} else {
			this.showMessage('ERROR: Organization name cannot be empty.');
		}
	},

	addNewOrganizationToLists: function (organizationName) {
		var self = this;
		$('#sentry-organizations').append(
			$('<li>').append(
				$('<span>').text(organizationName).append(
					$('<span>').attr('class', 'close-x').append("x").on('click', function () {
						self.deleteOrganization(organizationName);
					})
				)
			));
	},

	deleteOrganization: function (organizationName) {
		console.log('del', organizationName);
		//remove from projects list
		//remove from query dropdown
	},

	saveNewProject: function () {
		var self = this;
		var newProjectName = $('#sentry-project').val().trim();

		if (newProjectName) {
			this.storage.storage.get(['sentryProjects'], function (items) {
				var projects = [];
				if (items.sentryProjects) {
					projects = items.sentryProjects;
				}

				projects.push(newProjectName);
				self.storage.storage.set({sentryProjects: projects});
				self.addNewProjectToLists(newProjectName);
				self.showMessage('Project is saved.');
				self.toggleDivs('sentry-existing-projects', 'new-project');
			});

		} else {
			this.showMessage('ERROR: Project name cannot be empty.');
		}
	},

	addNewProjectToLists: function (projectName) {
		var self = this;
		$('#sentry-projects').append(
			$('<li>').append(
				$('<span>').text(projectName).append(
					$('<span>').attr('class', 'close-x').append("x").on('click', function () {
						self.deleteProject(projectName);
					})
				)
			));
		$('#sentry-query-project').append(
			$('<option>').text(projectName)
		);
	},

	deleteProject: function (projectName) {
		console.log('del', projectName);
		//remove from projects list
		//remove from query dropdown
	},

	showDiv: function (id) {
		$('#' + id).show('slide');
		//TODO: Delete input content
	},

	hideDiv: function (id) {
		$('#' + id).hide('slide');
	},

	toggleDivs: function (openId, closeId) {
		this.showDiv(openId);
		this.hideDiv(closeId);
	},

	showMessage: function (message) {
		var self = this;
		$('#update-msg').text(message);
		this.showDiv('update-msg');
		setTimeout(function () {
			self.hideDiv('update-msg');
		}, 3000);
	}
};

// document.addEventListener('DOMContentLoaded', restoreOptions);

SentryTower.Options.init();

$('.opener').click(function () {
	var id = $(this).attr('data-related');
	SentryTower.Options.showDiv(id);
});

$('.toggler-button').click(function () {
	var openId = $(this).attr('data-open');
	var closeId = $(this).attr('data-close');
	SentryTower.Options.toggleDivs(openId, closeId);
});

$('.closer').click(function () {
	var id = $(this).attr('data-related');
	SentryTower.Options.hideDiv(id);
});

$('#save').click(function () {
	SentryTower.Options.saveOptions();
});

$('#new-organization-save').click(function () {
	SentryTower.Options.saveNewOrganization();
});

$('#new-project-save').click(function () {
	SentryTower.Options.saveNewProject();
});

$(document).ready(function () {
	SentryTower.Options.restoreOptions();
});
