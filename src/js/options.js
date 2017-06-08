var SentryTower = SentryTower || {};

SentryTower.Options = {
	storage: null,
	logger: null,
	sentryUrl: null,

	init: function () {
		var self = this;
		
		SentryTower.storageHandler.storage.get(['sentryOptions'], function (result) {
			self.sentryUrl = result.sentryOptions.sentryUrl;
		});
	},

	/**
	 * Save options
	 */
	saveOptions: function () {
		var self = this;
		var options = {
			sentryToken: $('#sentry-api-token').val(),
			//TODO: trim /
			sentryUrl: $('#sentry-url').val(),
			sentryCheckInterval: $('#sentry-check-interval').val() * 1000, // Converting to milliseconds
			isLogEnabled: $('#enable-log').is(':checked')
		};

		SentryTower.storageHandler.storage.set({
			sentryOptions: options
		}, function () {
			self.showMessage('Saved');
			console.log($('#enable-log').is(':checked'));

			self.logger.info('Saved options');
		});
	},

	/**
	 * Restores option values
	 */
	restoreOptions: function () {
		var self = this;
		$('#sentry-organizations').empty();
		$('#sentry-projects').empty();
		$('#sentry-project-organization').empty();
		$('#sentry-query-project').empty();
		$('#sentry-queries').empty();
		SentryTower.storageHandler.storage.get(['sentryOptions', 'sentryProjects', 'sentryOrganizations', 'sentryQueries', 'log'], function (items) {
			if (items.sentryOptions) {
				$('#sentry-api-token').val(items.sentryOptions.sentryToken);
				$('#sentry-url').val(items.sentryOptions.sentryUrl);
				$('#sentry-check-interval').val(items.sentryOptions.sentryCheckInterval / 1000); // Converting from milliseconds
				$('#enable-log').prop('checked', items.sentryOptions.isLogEnabled);
			}

			$.each(items.sentryOrganizations, function (index, organizationName) {
				self.addNewOrganizationToLists(organizationName);
			});

			$.each(items.sentryProjects, function (index, projectName) {
				self.addNewProjectToLists(projectName);
			});

			$.each(items.sentryQueries, function (index, query) {
				self.addNewQueryToLists(query);
			});

			if (items.log && Object.keys(items.log).length > 2) {
				$('#log-warning').show();
				$('#log-counter').text(Object.keys(items.log).length);
			}
		});
	},

	/*************************************************
	 * Organizations
	 *************************************************/

	/**
	 *
	 */
	saveNewOrganization: function () {
		var self = this;
		var newOrganizationName = $('#sentry-organization').val().trim();

		if (newOrganizationName) {
			SentryTower.storageHandler.storage.get(['sentryOrganizations'], function (items) {
				var organizations = [];
				if (items.sentryOrganizations) {
					organizations = items.sentryOrganizations;
				}

				organizations.push(newOrganizationName);
				SentryTower.storageHandler.storage.set({sentryOrganizations: organizations});
				self.addNewOrganizationToLists(newOrganizationName);
				self.showMessage('Organization is saved.');
				self.toggleDivs('sentry-existing-organizations', 'new-organization');

				$('#sentry-organization').val('');
			});

		} else {
			this.showMessage('ERROR: Organization name cannot be empty.');
		}
	},

	/**
	 * Adds organization to list of all organizations and to add-new-project dropdown
	 *
	 * @param organizationName
	 */
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

		$('#sentry-project-organization').append(
			$('<option>').text(organizationName)
		);
	},

	/**
	 * Deletes organization from storage and option page lists
	 *
	 * @param organizationName
	 */
	deleteOrganization: function (organizationName) {
		var self = this;
		SentryTower.storageHandler.storage.get(['sentryOrganizations'], function (items) {
			var organizations = [];

			$.each(items.sentryOrganizations, function (index, organization) {
				if (organizationName !== organization) {
					organizations.push(organization);
				}
			});

			SentryTower.storageHandler.storage.set({sentryOrganizations: organizations});
			self.restoreOptions();
		});
	},

	/*************************************************
	 * Projects
	 *************************************************/

	/**
	 *
	 */
	saveNewProject: function () {
		var self = this;
		var organizationName = $('#sentry-project-organization').val().trim();
		var newProjectName = $('#sentry-project').val().trim();

		if (newProjectName) {
			newProjectName = organizationName + '/' + newProjectName;
			SentryTower.storageHandler.storage.get(['sentryProjects'], function (items) {
				var projects = [];
				if (items.sentryProjects) {
					projects = items.sentryProjects;
				}

				projects.push(newProjectName);
				SentryTower.storageHandler.storage.set({sentryProjects: projects});
				self.addNewProjectToLists(newProjectName);
				self.showMessage('Project is saved.');
				self.toggleDivs('sentry-existing-projects', 'new-project');

				$('#sentry-project').val('');
			});

		} else {
			this.showMessage('ERROR: Project name cannot be empty.');
		}
	},

	/**
	 * Adds project to list of all projects and to add-new-query dropdown
	 *
	 * @param projectName
	 */
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

	/**
	 * Deletes project from storage and lists
	 *
	 * @param projectName
	 */
	deleteProject: function (projectName) {
		var self = this;
		SentryTower.storageHandler.storage.get(['sentryProjects'], function (items) {
			var projects = [];

			$.each(items.sentryProjects, function (index, project) {
				if (projectName !== project) {
					projects.push(project);
				}
			});

			SentryTower.storageHandler.storage.set({sentryProjects: projects});
			self.restoreOptions();
		});
	},

	/*************************************************
	 * Queries
	 *************************************************/

	/**
	 *
	 */
	saveNewQuery: function () {
		var self = this;

		var newQuery = {
			query: $('#sentry-query').val().trim(),
			project: $('#sentry-query-project').val().trim()
		};

		if (!self.sentryUrl) {
			// TODO: process error
			// TODO: warning. prevent saving without URL
		}

		var apiUrl = self.sentryUrl + '/api/0/projects/' + newQuery.project + '/issues/?query=' + encodeURIComponent(newQuery.query).replace(/%20/g, '+');
		var url = self.sentryUrl + '/' + newQuery.project + '/?query=' + encodeURIComponent(newQuery.query).replace(/%20/g, '+');

		newQuery.apiUrl = apiUrl;
		newQuery.url = url;

		if (newQuery.query) {
			SentryTower.storageHandler.storage.get(['sentryQueries'], function (items) {
				var queries = [];
				if (items.sentryQueries) {
					queries = items.sentryQueries;
				}

				queries.push(newQuery);
				SentryTower.storageHandler.storage.set({sentryQueries: queries});
				self.addNewQueryToLists(newQuery);
				self.showMessage('Query is saved.');
				self.toggleDivs('sentry-existing-queries', 'new-query');

				$('#sentry-query').val('');
			});

		} else {
			this.showMessage('ERROR: Query cannot be empty.');
		}
	},

	/**
	 * Add query to the query list
	 *
	 * @param query
	 */
	addNewQueryToLists: function (query) {
		var self = this;
		var queryText = '<span class="gray">[' + query.project + ']</span> ' + query.query + '</span>';

		$('#sentry-queries').append(
			$('<li>').append(
				$('<span>').html(queryText).append(
					$('<span>').attr('class', 'close-x').append("x").on('click', function () {
						self.deleteQuery(query.query);
					})
				)
			));
	},

	/**
	 * Deletes query from storage and list
	 *
	 * @param queryText
	 */
	deleteQuery: function (queryText) {
		var self = this;
		SentryTower.storageHandler.storage.get(['sentryQueries', 'results'], function (items) {
			var cleanedQueries = [];
			var cleanedResults = {};

			$.each(items.sentryQueries, function (index, query) {
				if (queryText !== query.query) {
					cleanedQueries.push(query);
				}
			});

			$.each(items.results, function (project, results) {
				var cleanedResult = {};
				$.each(results, function (queryURL, result) {
					if (queryText !== result.query.query) {
						cleanedResult[queryURL] = result;
					}
				});
				cleanedResults[project] = cleanedResult;
			});

			SentryTower.storageHandler.storage.set({
				sentryQueries: cleanedQueries,
				results: cleanedResults
			});

			self.restoreOptions();
		});
	},

	/*************************************************
	 * Log
	 *************************************************/

	refreshLog: function () {
		SentryTower.storageHandler.storage.get(['log'], function (items) {
			var logDiv = $('#log');
			logDiv.empty();

			if (Object.keys(items.log).length > 0) {
				$.each(items.log, function (index, query) {
					var logText = logDiv.html();
					logDiv.html(logText + index + ' - ' + query + '<br/>');
				});
			} else {
				logDiv.text('Nothing here for now...');
			}
		});
	},

	emptyLog: function () {
		SentryTower.logger.emptyLog();
		this.refreshLog();
	},

	/*************************************************
	 * Page UI
	 *************************************************/

	showDiv: function (id) {
		$('#' + id).show('slide');
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

$('#new-query-save').click(function () {
	SentryTower.Options.saveNewQuery();
});

$('#show-log').click(function () {
	SentryTower.Options.refreshLog();
});

$('#empty-log').click(function () {
	SentryTower.Options.emptyLog();
});

$(document).ready(function () {
	SentryTower.Options.restoreOptions();
});
