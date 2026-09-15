import test from 'node:test';
import assert from 'node:assert/strict';
import { definitionSha256, evaluateCertificationCandidate, isOfficiallyRewardable } from '../../src/server/domain/missions/certification.mjs';

const draft = { id:'m1', status:'draft', definition:{b:2,a:1} };

test('canonical definition hash is stable across key order', () => {
  assert.equal(definitionSha256({a:1,b:2}), definitionSha256({b:2,a:1}));
});
test('draft with matching successful audit can be certified', () => {
  const audit={passed:true,definitionSha256:definitionSha256(draft.definition)};
  assert.equal(evaluateCertificationCandidate(draft,audit).decision,'certify');
});
test('failed audit quarantines candidate', () => {
  assert.equal(evaluateCertificationCandidate(draft,{passed:false,reason:'PEDAGOGY_MISMATCH'}).decision,'quarantine');
});
test('definition mutation after audit quarantines candidate', () => {
  const audit={passed:true,definitionSha256:definitionSha256({a:999})};
  assert.equal(evaluateCertificationCandidate(draft,audit).reason,'DEFINITION_CHANGED_AFTER_AUDIT');
});
test('only certified enabled missions are officially rewardable', () => {
  assert.equal(isOfficiallyRewardable({status:'draft'}),false);
  assert.equal(isOfficiallyRewardable({status:'quarantined'}),false);
  assert.equal(isOfficiallyRewardable({status:'certified',enabled:false}),false);
  assert.equal(isOfficiallyRewardable({status:'certified',enabled:true}),true);
});
