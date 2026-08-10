# ZenMux Pi model protocol selection

## Context

ZenMux can expose a model through more than one language-model protocol. The initial Pi extension configured `openai-completions` at provider level, which forced every discovered model through Chat Completions and discarded the gateway's richer protocol support.

Pi requires one `api` implementation for each resolved model and does not automatically retry a request through a different protocol. The extension therefore needs a deterministic selection policy.

## Decision

For each model, select the first advertised compatible protocol in this order:

1. `anthropic-messages`
2. `openai-responses`
3. `openai-completions`

The resolver accepts ZenMux and Pi aliases such as `messages`, `responses`, and `chat.completions`. Discovery uses `/api/frontend/model/available/list`, whose `endpoints[].adapters[].api` fields describe the protocols actually configured for each model. Models without a language-model adapter are excluded from Pi.

The protocol-specific standard catalogs remain useful to external clients but are not sufficient for this decision: `/api/v1/models` lists Chat Completions-compatible models and `/api/anthropic/v1/models` lists Anthropic-compatible models. Neither response describes all adapters on one model. The rich frontend catalog is therefore the source of truth for Pi discovery. The local fallback model defaults to `anthropic-messages` when discovery itself is unavailable.

Protocol selection also controls the base URL. Anthropic Messages uses `https://zenmux.ai/api/anthropic`, allowing the Anthropic SDK to call `/api/anthropic/v1/messages`. Responses and Chat Completions continue to use `https://zenmux.ai/api/v1`. Self-hosted deployments can override the Anthropic base independently with `ZENMUX_ANTHROPIC_BASE_URL`.

## Compatibility

- OAuth and Bearer-token authentication are unchanged.
- Responses and Chat Completions keep the existing `https://zenmux.ai/api/v1` base URL.
- Models that advertise only Chat Completions continue to use it.
- If Responses is advertised but Anthropic Messages is not, the model uses Responses.
- Existing installations receive the behavior after updating the package and reloading Pi.

## Verification

Unit tests cover priority order, aliases, missing metadata, and endpoint-adapter discovery. Package validation also runs Node syntax checking before the tests.
