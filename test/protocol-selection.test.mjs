import assert from 'node:assert/strict';
import test from 'node:test';

import {
  productionOAuthClientId,
  resolvePiApi,
  resolvePiBaseUrl,
  toPiModel,
} from '../index.mjs';

test('ships one stable production OAuth public client', () => {
  assert.equal(productionOAuthClientId, 'zpc_-6SsDHPARf6Rg5TTzbvlOQka');
});

test('prefers Anthropic Messages over Responses and Chat Completions', () => {
  assert.equal(
    resolvePiApi({ supported_endpoint_types: ['chat.completions', 'responses', 'messages'] }),
    'anthropic-messages',
  );
});

test('uses Responses when Anthropic Messages is unavailable', () => {
  assert.equal(
    resolvePiApi({ protocols: ['chat-completions', 'openai-responses'] }),
    'openai-responses',
  );
});

test('uses Chat Completions when it is the only advertised protocol', () => {
  assert.equal(resolvePiApi({ api: 'chat.completions' }), 'openai-completions');
});

test('defaults to Anthropic Messages when discovery has no protocol metadata', () => {
  assert.equal(resolvePiApi({}), 'anthropic-messages');
  assert.equal(toPiModel({ id: 'deepseek/deepseek-v4-flash' }).api, 'anthropic-messages');
});

test('reads endpoint adapter metadata', () => {
  assert.equal(
    resolvePiApi({ endpoints: [{ adapters: [{ api: 'responses' }, { api: 'messages' }] }] }),
    'anthropic-messages',
  );
});

test('maps the rich ZenMux model catalog shape', () => {
  const model = toPiModel({
    slug: 'example/model',
    name: 'Example Model',
    input_modalities: ['text'],
    endpoints: [
      { adapters: [{ api: 'chat.completions' }] },
      {
        context_length: 262144,
        supports_reasoning: 1,
        adapters: [{ api: 'responses' }, { api: 'messages' }],
      },
    ],
  });

  assert.equal(model.id, 'example/model');
  assert.equal(model.name, 'ZenMux · Example Model');
  assert.equal(model.api, 'anthropic-messages');
  assert.equal(model.contextWindow, 262144);
  assert.equal(model.reasoning, true);
});

test('maps every supported ZenMux reasoning mode', () => {
  for (const supportsReasoning of [1, 2, 3]) {
    assert.equal(
      toPiModel({ id: `example/reasoning-${supportsReasoning}`, endpoints: [{ supports_reasoning: supportsReasoning }] })
        .reasoning,
      true,
    );
  }

  assert.equal(toPiModel({ id: 'example/no-reasoning', endpoints: [{ supports_reasoning: 0 }] }).reasoning, false);
});

test('uses the ZenMux Anthropic base URL for Messages', () => {
  assert.equal(resolvePiBaseUrl('anthropic-messages'), 'https://zenmux.ai/api/anthropic');
  assert.equal(resolvePiBaseUrl('openai-responses'), 'https://zenmux.ai/api/v1');
  assert.equal(resolvePiBaseUrl('openai-completions'), 'https://zenmux.ai/api/v1');
});
