# Login guide

The login handler is `handleLogin`, in `src/app.js:3`.
The session limit is `MAX_SESSIONS`, set at `src/app.js:12`.
Retries are capped in src/app.js:500.
The old flow lived in `src/gone.js`.
The key is read from `src/config.js:2` as `API_KEY`.
See [the readme](../README.md) for setup.
The handlers live under `src/`.
The module is linked as [src/app.js](../src/app.js), its label naming it from the root.
Requests send `application/json`, times are in `Asia/Tokyo`, and the page is at `/login`.
The shared code comes from `@acme/utils`, and the database listens on 127.0.0.1:5432.
The helper is `slugify` in `lib/util.js:1`, written relative to its package.
The same file, elided, is `.../lib/util.js`.
A link written from the root but not from here is [broken when clicked](src/app.js).
The root-relative link [to the module](/src/app.js) resolves from the repository root.
The root-relative link [to an old page](/docs/old.md) is missing, not outside.
The root-relative link [to the readme](/README.md) is the root readme, whatever the code root.
The notes are [in Japanese](notes/仕様.txt), [with a space](notes/a%20b.txt) and [titled](../README.md "Readme").
The same note [in brackets](<notes/a b.txt>).

```
Not a citation inside a fence: src/nothing.js:1
```
