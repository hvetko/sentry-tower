/**
 * Query model
 *
 * @param queryText - query string
 * @constructor
 */
function Query(queryText) {
	this.text = queryText;
	this.project = null;
	this.queryUrl = null;
	this.queryApiUrl = null;

	this.results = [];

	this.setProject = function (project) {
		this.project = project;
	};

	this.setQueryUrl = function (queryUrl) {
		this.queryUrl = queryUrl;
	};

	this.setQueryApiUrl = function (queryApiUrl) {
		this.queryApiUrl = queryApiUrl;
	};

	this.setResults = function (sentryApiResults) {
		this.results = sentryApiResults;
	};
}
