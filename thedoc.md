# Sentry Tower - The Doc

```
It is expected that you already have access to Sentry instance that is up and running.
```

## Install

Install the latest stable version from [Google Chrome Web Store](https://chrome.google.com/webstore/detail/sentry-tower/ffdnegbkngfbbjehegalehmkbknmlkmj).

## Setup

Once Sentry Tower is installed, the settings page opens.
In case that it needs to be opened again, click on the Sentry Tower icon in the Chrome icon bar and choose "Settings" from the bottom of popup.

Initially, you'll need to set up *Sentry API Token* , *Sentry URL*, *Check Interval*, *Organizations* and *Projects*.
Then you can start adding *Queries* when needed.

_For the purpose of this manual we'll use `https://sentry.example.com/production/api-service/` URL as example._

### Sentry API Token

Set up and copy Sentry API auth token from your Sentry account. It's recommended to create _read-only_ token just for Sentry Tower.
To access it, log in to Sentry, click your user avatar and then choose `API` from the menu.

More info on [Sentry API Reference](https://docs.sentry.io/api/) page.

### Sentry URL

Enter the *base URL* where your Sentry is running. For our example it's `https://sentry.example.com/`.

### Check Interval

Number of seconds between Sentry Tower checks.

### Organizations

Enter the Organization *Short name* (slug). Short name value is the organization as seen in the URL, lowercase letters, without spaces.

For our example it's `production`.

If your organization's name is `API Staging`, then the organization short name is `api-staging`.

Check the _Organization Settings_ page in Sentry or URL in your browser if not sure.

### Projects

Choose the matching Organization from drop-down and enter the Project short name (slug).
Similar as in Organizations, project slug value is the organization as seen in the URL, lowercase letters, without spaces.

For our example, Project name is `API Service` and slug value is `api-service`. Check the URL in your browser if not sure.

### Queries

Enter full query from Sentry search, just copy/paste the value you use in Sentry web interface.
Feel free to use all the search keywords Sentry is using.

Examples:

* `is:unresolved mail`
* `is:unresolved site:www.example.com shutdown:1`
* `is:unresolved assigned:me`

## Use

Once you have all set up, click the Sentry Tower icon from the icon bar and check the `Run Tower, run!` box.
Notifications on unread issues should start coming.

Use this box to turn Sentry Tower on or off.
