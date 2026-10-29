# Objectives

## Objective MO-1

| Field | Value |
|---|---|
| What is measured | Latency of GET /api/annotation-analytics/tasks/1/class-counts |
| How | curl.exe, 1 warm-up not counted, 5 timed runs, HTTP Basic auth, local Docker stack |
| Target | Median of 5 runs <= 200 ms |
| Conditions | Local Docker stack on WSL2. Run A was a noisy baseline taken right after the UI image build; docker stats showed eight CVAT worker containers at 20-49% CPU each. Run B had the eight worker containers stopped and a 30 s wait. |
| Not included | Network latency over the internet, browser rendering time |

## Hardware and base

Hardware and base: Intel Core i7-6600U 2.60GHz, 2 cores / 4 logical; RAM 16,245 MB; Windows 10 Enterprise build 19045; Docker Desktop on WSL2 capped at 8 GB; CVAT base commit a81ed252dce15b805d5a544116cf98005e42f257. Dataset: COCO val2017 first 1000 images, 8109 shapes (8022 polygon, 87 mask), 79 classes with shapes, 0 tracks, 0 tags.

## Results

Target set before measuring: median of 5 runs <= 200 ms. Result: MISSED.

### Run A (noisy baseline)

Taken right after the UI image build; docker stats showed eight CVAT worker containers at 20-49% CPU each.

```
Warm-up: HTTP 200
Run 1: HTTP 200 - 4441.37 ms
Run 2: HTTP 200 - 8013.08 ms
Run 3: HTTP 200 - 6378.61 ms
Run 4: HTTP 200 - 6789.26 ms
Run 5: HTTP 200 - 6150.03 ms
Median: 6378.61 ms
Min: 4441.37 ms
Max: 8013.08 ms
```

- Median: 6378.61 ms
- Spread: min 4441.37 ms, max 8013.08 ms
- Status: All HTTP 200

### Run B (quiet run)

The eight worker containers stopped, 30 s wait.

```
Warm-up: HTTP 200
Run 1: HTTP 200 - 1775.76 ms
Run 2: HTTP 200 - 1475.94 ms
Run 3: HTTP 200 - 2205.66 ms
Run 4: HTTP 200 - 1181.19 ms
Run 5: HTTP 200 - 906.4 ms
Median: 1475.94 ms
Min: 906.4 ms
Max: 2205.66 ms
```

- Median: 1475.94 ms
- Spread: min 906.4 ms, max 2205.66 ms
- Status: All HTTP 200

## Diagnosis

- EXPLAIN ANALYZE of the equivalent SQL in Postgres: execution time 131.252 ms, planning time 43.780 ms, index scans, 8109 rows aggregated into 79.
- The trivial endpoint GET /api/server/about, same Basic auth, took 8.56 s, 7.62 s and 4.83 s during Run A conditions. Not measured quiet.
- The query itself is about 131 ms, and a trivial endpoint is as slow as mine, so most of the latency is outside my query. The exact cause (Basic-auth password hashing, OPA, CPU contention) was not established. I do not claim any specific cause.

