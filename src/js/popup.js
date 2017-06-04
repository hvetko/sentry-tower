var SentryTower = SentryTower || {};

SentryTower.popupHandler = {
	storage: null,

	init: function () {
		this.storage = SentryTower.storageHandler;
	},

	formatLargeCounts: function (count) {
		return (count > 999) ? '1k+' : count;
	},

	/**
	 * Add single result to watchlist
	 *
	 * @param query
	 * @param unseenCount
	 * @param seenCount
	 */
	addWatchlistItem: function (query, unseenCount, seenCount) {
		var watchlist = $('#watchlist');

		var item = $("#list-template-item").clone();
		item.children('.unseen-count').text(unseenCount);
		item.children('.seen-count').text(seenCount);
		item.children('.query').children('a').text(query);
		item.children('.query').text(query);

		item.appendTo(watchlist);
	},

	/**
	 * Create fresh watchlist based on results from storage
	 */
	setWatchList: function () {
		var self = this;

		this.storage.storage.get('results', function (results) {
			$('#watchlist').empty();

			if (!$.isEmptyObject(results.results)) {
				$('#loader').hide();

				$.each(results.results, function (query, result) {
					var unseenCount = self.formatLargeCounts(result.unreadCount);
					var seenCount = (result.count - result.unreadCount);

					self.addWatchlistItem(query, unseenCount, seenCount);
				});
			}
		});
	},

	/**
	 * Helper function to open Options page
	 */
	openOptionsPage: function () {
		window.open(chrome.extension.getURL("html/options.html"), '_blank');
	}

};

var popup = SentryTower.popupHandler;
popup.init();

document.addEventListener('DOMContentLoaded', popup.setWatchList());

$('#option-link').click(function () {
	popup.openOptionsPage();
});
