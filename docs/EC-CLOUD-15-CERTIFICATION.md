# EC-CLOUD-15 — Official mission certification pipeline

Mission versions move through `draft -> certified` only after a passing audit tied to the exact SHA-256 definition. Failed or stale audits lead to quarantine. Certification and quarantine functions are privileged and unavailable to browser roles.

The authoritative completion use case now refuses official progression/rewards unless the resolved mission is both enabled and `certified`. This makes certification a technical reward gate, not merely editorial metadata.

A later content pass can repair the legacy missions flagged by EC-CLOUD-14, create new immutable versions, audit them, then certify them without rewriting historical attempts.
