---
title: Data Exploration
# sidebar: false
toc: true
sql:
  scenariosdb: ./data/formatted_cbe_scenarios.csv
---

```sql id=alldata
SELECT
budget,
lsoa,
year,
technology,
SUM(material_cost) AS total_material_cost,
SUM(labour_cost) AS total_labour_cost,
SUM(material_cost + labour_cost) AS total_cost,
FROM scenariosdb
GROUP BY budget, year, lsoa, technology
```

<!-- # Data Exploration -->

## Exploratory data analysis

Before going through the glyph design, we'll explore the data to see what it contains, how many variables, etc.
The following displays all the data:

```js
const scenarios = await FileAttachment(
  "./data/formatted_cbe_scenarios.csv"
).csv({
  typed: true,
});

const cbe_scenarios = await FileAttachment("./data/data_processing.csv").csv({
  typed: true,
});

const searched = view(Inputs.search(scenarios));

display(cbe_scenarios);
```

```js
display(Inputs.table(searched));
```

## Group by Budgets

The main variable to display is the **budget**, which represent each scenario's budget over time. We can see for example how the progression of one LSOA (Local Super Output Area) budget looks like over the years:

```js
const groupbyBudget = Object.values(
  scenarios.reduce((acc, obj) => {
    let key = `${obj.budget}-${obj.lsoa}-${obj.year}`; // create a composite key
    if (!acc[key]) {
      acc[key] = {
        budget: obj.budget,
        lsoa: obj.lsoa,
        year: obj.year,
        total_material_cost: 0,
        total_labour_cost: 0,
        total_cost: 0,
      };
    }
    acc[key].total_material_cost += obj.material_cost;
    acc[key].total_labour_cost += obj.labour_cost;
    acc[key].total_cost += obj.material_cost + obj.labour_cost;
    return acc;
  }, {})
);
```

```js
const selectCost1 = view(
  Inputs.select(["total_material_cost", "total_labour_cost", "total_cost"], {
    value: "total_cost",
    label: "Cost",
    sort: true,
    unique: true,
  })
);

const selectLSOA1 = view(
  Inputs.select(
    scenarios.map((d) => d.lsoa),
    {
      value: "E01017987",
      label: "LSOA",
      sort: true,
      unique: true,
    }
  )
);
```

```js
display(
  Plot.plot({
    width: width,
    marginLeft: 80,
    grid: true,
    color: { legend: true },
    marks: [
      Plot.ruleY([0]),
      Plot.lineY(
        groupbyBudget.filter((d) => d.lsoa === selectLSOA1),
        {
          x: "year",
          y: selectCost1,
          sort: "year",
          stroke: "budget",
          marker: true,
          tip: true,
        }
      ),
    ],
  })
);
```

## Group by Technology

We preprocess the data to obtain data grouped by technology for each LSOA and budget:

```sql id=byLSOA display
SELECT
  budget,
  lsoa,
  year,
  technology,
  SUM(material_cost) AS total_material_cost,
  SUM(labour_cost) AS total_labour_cost,
  SUM(material_cost + labour_cost) AS total_cost,
FROM scenariosdb
where lsoa = ${selectLSOA2}
GROUP BY budget, year, lsoa, technology
```

```js
display([...byLSOA]);
```

Here is all the data visualised

```js
const selectCost2 = view(
  Inputs.select(["total_material_cost", "total_labour_cost", "total_cost"], {
    value: "total_cost",
    label: "Cost",
    sort: true,
    unique: true,
  })
);

const selectLSOA2 = view(
  Inputs.select(
    scenarios.map((d) => d.lsoa),
    {
      value: "E01017987",
      label: "LSOA",
      sort: true,
      unique: true,
    }
  )
);
```

```js
display(
  Plot.plot({
    width: width,
    height: 600,
    color: { legend: true },
    marginLeft: 80,
    marginRight: 80,
    facet: { data: byLSOA, y: "technology" },
    x: {
      // label: "Year",
      tickFormat: (d) => d.toString(),
    },
    y: {
      grid: true,
      transform: (d) => d / 1000,
      label: "Cost (thousand)",
    },
    marks: [
      Plot.barY(byLSOA, {
        x: "year",
        y: selectCost2, //"total_cost",
        fill: "budget",
        tip: true,
      }),
      Plot.ruleY([0]),
    ],
  })
);
```
