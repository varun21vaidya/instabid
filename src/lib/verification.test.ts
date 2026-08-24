import assert from 'node:assert/strict';
import test from 'node:test';

import { checkBioChallenge } from './verification';

test('production verification rejects demo success unless explicitly enabled', async () => {
  const result = await checkBioChallenge('example_user', 'instabid-abc123');
  assert.equal(result.success, false);
  assert.match(result.message, /public/i);
});
