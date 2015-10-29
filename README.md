# NodeBB Override Login with Meteor Accounts

NodeBB Plugin that allows users to login with accounts database of a Meteor app, to facilitate website integration. Accounts in the database should have at least username/email/password fields. The password should be hashed in compliance with accounts-password Meteor package.

## How to Install

1. npm install --save nodebb-plugin-meteor-accounts
1. Add `"meteorAccountsDbUrl": "mongodb://xxxxxxxxxxx"` into config.json, where the mongodb url refers to your Meteor accounts database.
1. ./nodebb start
1. Log on the site with an administrator account.
1. On admin dashboard page, click "EXTEND" -> "Plugins". Then under "Installed Plugins" activate "nodebb-plugin-meteor-accounts".

This plugin works in this way:

1. First check your Meteor accounts database against the username and password provided.
1. If matched then look for the username in nodebb accounts database.
  1. If the username is found, then login right away.
  1. If the username isn't found in nodebb accounts database, then create a user in nodebb accounts database and login.

This implies:

1. You must have a user in Meteor accounts database with the same username as the administrator (before activating this plugin). Otherwise you can no longer log on the site as administrator.
1. Since accounts registered on the nodebb site won't be synchronized to Meteor accounts database, all registration should happen on the Meteor site. You'd better disable registration on the nodebb site, or point "Register" link to your Meteor site registration page.
1. Deleting a user on admin dashboard page won't delete it in Meteor accounts database. If the user log on again the account will be recreated in nodebb accounts database. But banning a user works.

NOTE Once this plugin is activated, all future login actions will go through your Meteor accounts database, including the administrator account. In case you are not ready to switch to Meteor accounts database, but no longer able to log on the site to deactivate the plugin, you can run command `./nodebb reset -p nodebb-plugin-meteor-accounts`

## Trouble?

Please report issues on https://github.com/limingth/nodebb-plugin-meteor-accounts/issues
