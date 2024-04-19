---
title: Dashboard
theme: dashboard
toc: false
sql:
  scenarios: ./data/formatted_cbe_scenarios.csv
---

## Gridded-glyphmaps for Multivariate Timeseries

```sql display
select * from scenarios order by "year" limit 100;
```

```sql display
select distinct CAST("year" AS VARCHAR) as types, count(distinct CAST("year" AS VARCHAR)) as year
from scenarios
group by year;
-- Order by CAST("Year" AS VARCHAR);
```
