# pi-zenmux-oauth

Use [ZenMux](https://zenmux.ai) models in Pi with OAuth 2.0 Authorization Code + PKCE. The extension registers the `zenmux` provider, discovers the current model catalog, and refreshes OAuth tokens with rotation.

## Install

Install the package with Pi:

```bash
pi install npm:@zenmux/pi-zenmux-oauth
```

Start Pi and sign in:

```text
/login zenmux
```

Pi opens the ZenMux authorization page in your browser. After approval, the browser redirects to a temporary loopback listener on `127.0.0.1`. Return to Pi, run `/model`, and select a ZenMux model.

## How authentication works

- The extension automatically registers a native public OAuth client on first use.
- Authorization uses PKCE with `S256`; no client secret is stored or distributed.
- The OAuth client ID is cached per authorization-server origin in `~/.pi/zenmux-oauth-clients.json`.
- Access and refresh tokens are managed by Pi's provider credential store.
- Refresh tokens rotate on every refresh.
- Model requests use the OAuth access token as a Bearer token. ZenMux API keys are not exposed to the extension.

The package requests only these scopes:

- `inference:invoke`
- `offline_access`

## Configuration

Production works without additional configuration. These environment variables are available for development and self-hosted testing:

| Variable | Default | Purpose |
| --- | --- | --- |
| `ZENMUX_OAUTH_ORIGIN` | `https://zenmux.ai` | OAuth authorization server origin |
| `ZENMUX_API_BASE_URL` | `https://zenmux.ai/api/v1` | OpenAI-compatible API base URL |
| `ZENMUX_TEST_MODEL` | `deepseek/deepseek-v4-flash` | Fallback model when discovery is unavailable |
| `ZENMUX_OAUTH_CLIENT_ID` | none | Reuse a pre-registered public client instead of automatic registration |

## Local development

Load the extension directly:

```bash
pi -e ./index.mjs
```

Run against the ZenMux pre-release OAuth environment:

```bash
npm run dev
```

Validate the source and inspect the npm tarball before publishing:

```bash
npm test
npm pack --dry-run
```

## Security

Pi packages execute with the permissions of the Pi process. Review package source before installation. This extension listens only on an ephemeral `127.0.0.1` port during OAuth authorization and verifies the returned OAuth state before exchanging the authorization code.

## License

MIT
