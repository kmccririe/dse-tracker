# Acme Corp — DSE Profile

*Last updated: 2026-06-09 09:14:00*

---

## 2026-06-09

Reviewed open cases with the customer. Triaged two new P2 tickets related to pipeline backpressure under high ingest load. Escalated one to engineering with reproduction steps.

---

## 2026-06-06

Weekly sync call — covered upgrade readiness for 4.6 → 4.7. Customer has concerns about the new PQ behavior; sent internal doc and scheduled a follow-up.

Opened case 00041234 for intermittent worker crashes seen after the 4.6.1 upgrade. Pulled diag bundle and identified high ELU on worker 2 correlating with a misconfigured regex in the main pipeline.

---

## 2026-06-05

Investigated case 00041100 — customer seeing dropped events on their Splunk HEC output. Root cause: output queue depth misconfigured at 1000 (default) against a slow HEC endpoint. Recommended PQ enablement and sent config snippet.

---

## 2026-06-04

Upgrade planning session — walked through pre-upgrade checklist, reviewed their current config for known breaking changes. No blockers identified. Targeting upgrade window for June 14th.

---
