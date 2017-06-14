function Settings() {

	/*************************************************
	 * Settings
	 *************************************************/

	/**
	 * Save options
	 */
	this.saveOptions = function () {
		var self = this;
		var options = {
			sentryToken: $('#sentry-api-token').val(),
			sentryUrl: $('#sentry-url').val(),
			sentryCheckInterval: $('#sentry-check-interval').val() * 1000 // Converting to milliseconds
		};

		chrome.storage.local.set({
			sentryOptions: options
		}, function () {
			self.showMessage('Saved');
		});
	};

	/**
	 * Restores option values
	 */
	this.restoreOptions = function () {
		var self = this;

		$('#sentry-organizations').empty();
		$('#sentry-projects').empty();
		$('#sentry-project-organization').empty();
		$('#sentry-query-project').empty();
		$('#sentry-queries').empty();

		var manifestData = chrome.runtime.getManifest();
		$('#version').text('v' + manifestData.version);

		chrome.storage.local.get({
			'sentryOptions': {
				'sentryToken': null,
				'sentryUrl': null,
				'sentryCheckInterval': 60000
			},
			'sentryProjects': [],
			'sentryOrganizations': [],
			'sentryQueries': []
		}, function (items) {
			if (items.sentryOptions) {
				$('#sentry-api-token').val(items.sentryOptions.sentryToken);
				$('#sentry-url').val(items.sentryOptions.sentryUrl);
				$('#sentry-check-interval').val(items.sentryOptions.sentryCheckInterval / 1000); // Converting from milliseconds
			}

			$.each(items.sentryOrganizations, function (index, organizationName) {
				self.addNewOrganizationToLists(organizationName);
			});

			$.each(items.sentryProjects, function (index, projectName) {
				self.addNewProjectToLists(projectName);
			});

			$.each(items.sentryQueries, function (project, queries) {
				$.each(queries, function (text, query) {
					self.addNewQueryToLists(query);
				});
			});
		});
	};

	/*************************************************
	 * Organizations
	 *************************************************/

	/**
	 *
	 */
	this.saveNewOrganization = function () {
		var self = this;
		var newOrganizationName = $('#sentry-organization').val().trim();

		if (!newOrganizationName) {
			throw new Error("Organization name cannot be empty.");
		}

		chrome.storage.local.get(['sentryOrganizations'], function (items) {
			var organizations = [];
			if (items.sentryOrganizations) {
				organizations = items.sentryOrganizations;
			}

			organizations.push(newOrganizationName);
			chrome.storage.local.set({sentryOrganizations: organizations});

			self.addNewOrganizationToLists(newOrganizationName);
			self.showMessage('Organization is saved.');
			self.toggleDivs('sentry-existing-organizations', 'new-organization');

			$('#sentry-organization').val('');
		});
	};

	/**
	 * Adds organization to list of all organizations and to add-new-project dropdown
	 *
	 * @param {String} organizationName
	 */
	this.addNewOrganizationToLists = function (organizationName) {
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
	};

	/**
	 * Deletes organization from storage and option page lists
	 *
	 * @param {String} organizationName
	 */
	this.deleteOrganization = function (organizationName) {
		var self = this;
		chrome.storage.local.get(['sentryOrganizations'], function (items) {
			var organizations = [];

			$.each(items.sentryOrganizations, function (index, organization) {
				if (organizationName !== organization) {
					organizations.push(organization);
				}
			});

			chrome.storage.local.set({sentryOrganizations: organizations});
			self.restoreOptions();
		});
	};

	/*************************************************
	 * Projects
	 *************************************************/

	/**
	 *
	 */
	this.saveNewProject = function () {
		var self = this;
		var organizationName = $('#sentry-project-organization').val().trim();
		var newProjectName = $('#sentry-project').val().trim();

		if (!newProjectName) {
			throw new Error("Project name cannot be empty.");
		}

		newProjectName = organizationName + '/' + newProjectName;
		chrome.storage.local.get(['sentryProjects'], function (items) {
			var projects = [];
			if (items.sentryProjects) {
				projects = items.sentryProjects;
			}

			projects.push(newProjectName);

			chrome.storage.local.set({sentryProjects: projects});

			self.addNewProjectToLists(newProjectName);
			self.showMessage('Project is saved.');
			self.toggleDivs('sentry-existing-projects', 'new-project');

			$('#sentry-project').val('');
		});
	};

	/**
	 * Adds project to list of all projects and to add-new-query dropdown
	 *
	 * @param {String} projectName
	 */
	this.addNewProjectToLists = function (projectName) {
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
	};

	/**
	 * Deletes project from storage and lists
	 *
	 * @param {String} projectName
	 */
	this.deleteProject = function (projectName) {
		var self = this;
		chrome.storage.local.get(['sentryProjects'], function (items) {
			var projects = [];

			$.each(items.sentryProjects, function (index, project) {
				if (projectName !== project) {
					projects.push(project);
				}
			});

			chrome.storage.local.set({sentryProjects: projects});

			self.restoreOptions();
		});
	};

	/*************************************************
	 * Queries
	 *************************************************/

	/**
	 *
	 */
	this.saveNewQuery = function () {
		/**
		 *
		 * @param {Array<String>} paths
		 *
		 * @returns {String}
		 */
		function getPath(paths) {
			var path = '';
			for (var i = 0; i < paths.length; i++) {
				var pathElement = paths[i].trim();
				if (!pathElement) {
					continue;
				}

				if (pathElement.charAt(0) === '/') {
					pathElement = pathElement.substring(1);
				}

				if ((i + 1) !== paths.length && pathElement.charAt(pathElement.length - 1) !== '/') {
					pathElement += '/';
				}

				path += pathElement;
			}

			return path;
		}

		var self = this;

		var queryText = $('#sentry-query').val().trim();
		var sentryUrl = $('#sentry-url').val();

		if (!sentryUrl) {
			throw new Error("Sentry URL cannot be empty.");
		}

		if (!queryText) {
			throw new Error("Query cannot be empty.");
		}

		var query = new Query(queryText);
		var project = $('#sentry-query-project').val().trim();

		var queryApiUrl = getPath([
			sentryUrl,
			'/api/0/projects/',
			project,
			'/issues/',
			'?query=' + encodeURIComponent(queryText).replace(/%20/g, '+')
		]);

		var queryUrl = getPath([
			sentryUrl,
			project,
			'?query=' + encodeURIComponent(queryText).replace(/%20/g, '+')
		]);

		query.setProject(project);
		query.setQueryApiUrl(queryApiUrl);
		query.setQueryUrl(queryUrl);

		chrome.storage.local.get(['sentryQueries'], function (items) {
			var queries = {};

			if (items.sentryQueries) {
				queries = items.sentryQueries;
			}

			if (!queries[query.project]) {
				queries[query.project] = {}
			}

			queries[query.project][query.text] = query;
			chrome.storage.local.set({sentryQueries: queries});

			self.addNewQueryToLists(query);
			self.showMessage('Query is saved.');
			self.toggleDivs('sentry-existing-queries', 'new-query');

			$('#sentry-query').val('');

			var background = new BackgroundHandler();
			background.run();
		});
	};

	/**
	 * Add query to the query list
	 *
	 * @param {Query} query
	 */
	this.addNewQueryToLists = function (query) {
		var self = this;
		var queryTextHTML = '<span class="gray">[' + query.project + ']</span> ' + query.text + '</span>';

		$('#sentry-queries').append(
			$('<li>').append(
				$('<span>').html(queryTextHTML).append(
					$('<span>').attr('class', 'close-x').append("x").on('click', function () {
						self.deleteQuery(query.text);
					})
				)
			));
	};

	this.addQueryAddon = function (element) {
		var queryText = $('#sentry-query');
		var newQuery = queryText.val().trim() + ' ' + element.text().trim();
		queryText.val(newQuery.trim() + ' ');
		queryText.focus();
	};

	/**
	 * Deletes query from storage and list
	 *
	 * @param {String} queryText
	 */
	this.deleteQuery = function (queryText) {
		var self = this;

		chrome.storage.local.get(['sentryQueries'], function (items) {
			var cleanedQueries = {};

			$.each(items.sentryQueries, function (project, /* Array<Query>*/ queries) {
				$.each(queries, function (text, /* Query */ query) {
					if (queryText !== text) {
						if (!(project in cleanedQueries)) {
							cleanedQueries[project] = {}
						}

						cleanedQueries[project][text] = query;
					}
				});
			});

			chrome.storage.local.set({
				sentryQueries: cleanedQueries
			});

			self.restoreOptions();
		});
	};

	/*************************************************
	 * Page UI
	 *************************************************/

	this.showDiv = function (id) {
		$('#' + id).show('slide');
	};

	this.hideDiv = function (id) {
		$('#' + id).hide('slide');
	};

	this.toggleDivs = function (openId, closeId) {
		this.showDiv(openId);
		this.hideDiv(closeId);
	};

	this.showMessage = function (message) {
		var self = this;
		$('#update-msg').text(message);
		this.showDiv('update-msg');
		setTimeout(function () {
			self.hideDiv('update-msg');
		}, 3000);
	}
}

var settings = new Settings();

$('.opener').click(function () {
	var id = $(this).attr('data-related');
	settings.showDiv(id);
});

$('.toggler-button').click(function () {
	var openId = $(this).attr('data-open');
	var closeId = $(this).attr('data-close');
	settings.toggleDivs(openId, closeId);
});

$('.closer').click(function () {
	var id = $(this).attr('data-related');
	settings.hideDiv(id);
});

$('#save').click(function () {
	settings.saveOptions();
});

$('#new-organization-save').click(function () {
	try {
		settings.saveNewOrganization();
	} catch (error) {
		settings.showMessage('ERROR: ' + error);
		console.error(error);
	}
});

$('#new-project-save').click(function () {
	try {
		settings.saveNewProject();
	} catch (error) {
		settings.showMessage('ERROR: ' + error);
		console.error(error);
	}
});

$('#new-query-save').click(function () {
	try {
		settings.saveNewQuery();
	} catch (error) {
		settings.showMessage('ERROR: ' + error);
		console.error(error);
	}
});

$('.add-to-query').click(function () {
	settings.addQueryAddon($(this));
});

$(document).ready(function () {
	settings.restoreOptions();
});
