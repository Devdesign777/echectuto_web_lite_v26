# EC-CLOUD-07 — Atomic mission finalization

A validated mission now has one intended PostgreSQL transaction boundary: `finalize_validated_mission_attempt`.

It locks/validates the attempt, marks it passed, claims the `(user_id, mission_id)` first-completion key, computes the v191 ETS ratio from the server-owned mission reward, increments balances, and writes ledger rows. A replay records completion of its attempt but receives zero principal reward.

The function accepts no XP/ETS/star amount from the browser and is not executable by `anon` or `authenticated`; it is reserved for the trusted server `service_role`.

The application use case validates evidence before entering this transaction and consumes the reward/balance returned by the database rather than calculating an authoritative balance in the client.
