# Definition of Done

Each line is ticked at the end with a number or a link beside it. A line without evidence counts as not done.

- [x] Endpoint returns correct per-class counts, compared with a SQL query on the same task: the endpoint returns 79 classes with total 8109, matching SQL (SELECT COUNT(DISTINCT label_id), COUNT(*) FROM engine_labeledshape gives 79 and 8109). Top classes match: person 2499, chair 466, car 416, bottle 218, book 213.
- [x] No login is refused, and a logged-in user without access to the task is refused (curl output for both): curl, GET /api/annotation-analytics/tasks/1/class-counts: no login -> HTTP 401 "Authentication credentials were not provided."; user tester with no access -> HTTP 403 "You do not have permission to perform this action."; admin -> HTTP 200 with JSON.
- [x] Page calls the endpoint and shows the counts as a bar chart (screenshot): chart screenshot at chart.png (C:\Users\AR\Desktop\chart.png). The page is at /tasks/:id/annotation-counts with a button "Annotation counts" on the task page.
- [ ] MO-1 measured, 5 runs, raw output saved, median and spread reported. Target set before measuring: median of 5 runs <= 200 ms: target missed. Run A median 6378.61 ms, Run B median 1475.94 ms. The query itself took 131.252 ms in Postgres; remaining latency is outside the query.
- [x] Hardware and commit SHA recorded in docs/objectives.md: recorded in docs/objectives.md (Intel Core i7-6600U 2.60GHz, 2 cores / 4 logical; RAM 16,245 MB; Windows 10 Enterprise build 19045; Docker Desktop on WSL2 capped at 8 GB; CVAT base commit a81ed252dce15b805d5a544116cf98005e42f257).
- [x] Decision record written at the end of docs/plan.md: recorded at the end of docs/plan.md.
- [x] Everything not finished is listed here, with the reason: see Not finished list below.

## Not finished

- Item 7 (filter or grouping): not done; prioritized core pipeline, endpoint correctness, auth, UI integration, and performance benchmarking within the available time budget.
- Item 8 (WebSocket live updates): not done; CVAT saves annotations in bulk operations over HTTP, so database save signals do not reliably fire per change. A push channel and notification architecture did not fit the available time.
- Item 9 (WebSocket reconnect): not done; depends on item 8.
