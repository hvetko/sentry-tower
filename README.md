# Sentry Tower

Sentry Tower is open source extension for Google Chrome. It is meant to be addition for [Sentry](https://github.com/getsentry/sentry).

Save queries you'd like to track and Sentry Tower will show notification every time when any of saved queries has new error in Sentry.

In case you missed out the notification, error counts are displayed in the icon bar and more details can be seen by clicking the icon.

## Install

Install and set up instructions can be found in [The Doc](instructions.md).

## Usage - Image is Worth a Thousand Words

### Notification

Notification like this one pops out every time new error is noticed in Sentry.

### Icon and error count

Disabled icon - Sentry Tower is not running.

Red error count - you do have errors that you haven't seen in Sentry. Displayed number represents count of such errors.

Blue error count - you have seen all errors in Sentry. Displayed number represents count of all errors.

### Popup

Click on the icon in the icon bar to open popup.

Popup holds overview of all monitored errors with unseen/seen counts. Click on any row to open query in Sentry.
