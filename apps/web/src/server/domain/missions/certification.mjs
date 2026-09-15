import { createHash } from 'node:crypto';

export const CERTIFICATION_STATUSES = Object.freeze(['draft','certified','quarantined','retired']);

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function definitionSha256(definition) {
  return createHash('sha256').update(canonicalJson(definition)).digest('hex');
}

export function evaluateCertificationCandidate(candidate, audit) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('candidate is required');
  if (candidate.status !== 'draft') return { decision:'reject', reason:'ONLY_DRAFT_CAN_BE_CERTIFIED' };
  if (!audit || audit.passed !== true) return { decision:'quarantine', reason:audit?.reason ?? 'AUDIT_NOT_PASSED' };
  if (audit.definitionSha256 !== definitionSha256(candidate.definition)) {
    return { decision:'quarantine', reason:'DEFINITION_CHANGED_AFTER_AUDIT' };
  }
  return { decision:'certify', reason:'AUDIT_PASSED' };
}

export function isOfficiallyRewardable(mission) {
  return Boolean(mission && mission.status === 'certified' && mission.enabled !== false);
}
