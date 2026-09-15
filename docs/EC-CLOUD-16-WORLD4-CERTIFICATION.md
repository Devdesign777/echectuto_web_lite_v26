# EC-CLOUD-16 — First remediation batch: World 04

## Goal
Replace the five target-only World 04 lessons with server-owned chess positions whose pedagogical claim is mechanically verifiable.

## Certified batch
- `world4-1` — check recognition is represented by a king actually in check; the accepted move must leave check.
- `world4-2` — escape-square control ends in checkmate.
- `world4-3` — genuine back-rank mate with the black king boxed by its own pawns.
- `world4-4` — queen/king coordination ends in checkmate.
- `world4-5` — a distinct rook/bishop mating net ends in checkmate.

Rewards preserve the v191 values: 180 / 190 / 210 / 230 / 260 XP.

## Security / pedagogy gate
The authoritative chess validator now supports semantic objectives `escape_check`, `give_check`, and `mate_in_one`. Matching the expected coordinates is no longer sufficient when a semantic objective is declared: the resulting board must actually satisfy that chess condition.

The legacy v191 UI remains unchanged in this step. These certified definitions belong to the new server catalog and will be wired into the migrated gameplay later.
