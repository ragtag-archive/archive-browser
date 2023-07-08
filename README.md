# archive-browser

Frontend for [Ragtag Archive](https://archive.ragtag.moe).

## Maintenance status

Ragtag Archive (the backend and this repository) is currently feature-frozen
until there is sufficient manpower to undo the accumulated technical debt.

## Deploy

Check out [aonahara/archive-docker](https://gitlab.com/aonahara/archive-docker)
to quickly set up a local copy of Ragtag Archive.

If you want to use this frontend for your own purposes, you can check the config
file at
[`modules/shared/config.ts`](https://github.com/ragtag-archive/archive-browser/blob/master/modules/shared/config.ts),
and make appropriate changes to connect it to your backend. For more info, read
[`doc/DEPLOY.md`](https://github.com/ragtag-archive/archive-browser/blob/master/doc/DEPLOY.md).

Note that this project only includes the web interface, and does not include
other parts such as archival tools. You should use your own tools to archive and
index content.
