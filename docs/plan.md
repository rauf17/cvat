# Plan

Started: 2026-10-29 13:18 PKT (acknowledgement email sent). Hard deadline 21:18. Aiming to submit by about 17:15.

Base: fork rauf17/cvat, branch dev-test01, cloned from CVAT commit a81ed252dce15b805d5a544116cf98005e42f257.
Note: the default branch of this fork is `develop`, so "main of my own fork" in the brief means `develop`. The PR goes dev-test01 -> develop on rauf17/cvat only.

Environment: Windows 10 Enterprise 19045, 16 GB RAM (WSL2 capped at 8 GB), Docker Desktop. Dataset: COCO val2017, first 1000 images (sorted by file name), annotations filtered to those images. Imported into task 1 as 8109 shapes (8022 polygons, 87 masks), 0 tracks, 0 tags, 79 classes with at least one shape.

## Order of work (budget about 4 hours, not the full 8)

| Step | Items | Estimate |
|---|---|---|
| Plan + Definition of Done, committed first | - | 30 min |
| `test` Django app, endpoint, CVAT login + task permission, curl proof | 1, 5 | 1 h |
| UI page, bar chart, empty and error states | 2, 3, 4 | 1 h 15 min |
| Speed objective: 5 runs, raw output, Objectives doc | 6 | 30 min |
| Final docs, Loom rehearsal and recording, PR, reply email | - | 45 min |

## Decided to skip (and why)

- Items 8 and 9 (live updates over WebSocket, reconnect). CVAT serves its API over HTTP and saves annotations in bulk operations, so a database save signal would not reliably fire per change. Doing it properly needs a push channel plus a change-notification path, which does not fit in the time I am giving this. Skipped, will be listed in the Definition of Done as not done.
- Item 7 (filter or grouping) only if items 1 to 6 are finished early. Candidate: filter by shape type.
- Tracks and tags are not counted. This dataset has none (verified in the database), so counting shapes is correct here. Documented as a scope limit.

## Plan changes

(Dated notes are added here when the plan changes, with the reason.)
