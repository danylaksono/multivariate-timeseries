---
title: Data Exploration
sidebar: false
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

# Data Exploration

Before going through the glyph design, we'll explore the data to see what it contains, how many variables, etc.

## Exploratory data analysis

The following displays all the data:

```js
const scenarios = await FileAttachment(
  "./data/formatted_cbe_scenarios.csv"
).csv({
  typed: true,
});

display(Inputs.table(scenarios));
```

### Inspecting the data

Here is all the data visualised using arrow

```js
const selectLSOA = view(
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

```sql id=byLSOA
SELECT
  budget,
  lsoa,
  year,
  technology,
  SUM(material_cost) AS total_material_cost,
  SUM(labour_cost) AS total_labour_cost,
  SUM(material_cost + labour_cost) AS total_cost,
FROM scenariosdb
where lsoa = ${selectLSOA}
GROUP BY budget, year, lsoa, technology
```

```js
// Inputs.table(byLSOA);
```

```js
display(
  Plot.plot({
    width: width,
    height: 500,
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
        y: "total_cost",
        fill: "budget",
        tip: true,
      }),
      Plot.ruleY([0]),
    ],
  })
);
```

### Group by Budgets

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

### Group by Technology

```js
const groupbyTechnology = Object.values(
  scenarios.reduce((acc, obj) => {
    let key = `${obj.budget}-${obj.lsoa}-${obj.year}-${obj.technology}`;
    if (!acc[key]) {
      acc[key] = {
        budget: obj.budget,
        lsoa: obj.lsoa,
        year: obj.year,
        technology: obj.technology,
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
display(groupbyTechnology);
```

```js
// const grouped = d3.group(
//   scenarios,
//   (d) => d.budget,
//   (d) => d.lsoa,
//   (d) => d.year,
//   (d) => d.technology
// );

// const nested = Array.from(grouped, ([budget, lsoas]) => ({
//   budget,
//   lsoas: Array.from(lsoas, ([lsoa, years]) => ({
//     lsoa,
//     years: Array.from(years, ([year, technologies]) => ({
//       year,
//       technologies: Array.from(technologies, ([technology, data]) => ({
//         technology,
//         total_material_cost: d3.sum(data, (d) => d.material_cost),
//         total_labour_cost: d3.sum(data, (d) => d.labour_cost),
//         total_cost: d3.sum(data, (d) => d.material_cost + d.labour_cost),
//       })),
//     })),
//   })),
// }));

// const result2 = Array.from(grouped, ([budget, lsoaMap]) =>
//   Array.from(lsoaMap, ([lsoa, yearMap]) =>
//     Array.from(yearMap, ([year, techMap]) =>
//       Array.from(techMap, ([technology, data]) => ({
//         budget,
//         lsoa,
//         year,
//         technology,
//         total_material_cost: d3.sum(data, (d) => d.material_cost),
//         total_labour_cost: d3.sum(data, (d) => d.labour_cost),
//         total_cost: d3.sum(data, (d) => d.material_cost + d.labour_cost),
//       }))
//     ).flat()
//   ).flat()
// ).flat();

const filteredScenario = d3.filter(
  scenarios,
  (d) =>
    (d.material_cost !== null && d.labour_cost !== null) ||
    d.hasOwnProperty("year")
);

// const grouped = d3.rollup(
//   filteredScenario,
//   (v) => d3.sum(v, (d) => d.material_cost || 0), // Handle null or empty values
//   (v) => d3.sum(v, (d) => d.labour_cost || 0), // Handle null or empty values
//   (d) => d.budget,
//   (d) => d.lsoa,
//   (d) => d.year,
//   (d) => d.technology
// );

// const result2 = Array.from(grouped, ([budget, lsoaMap]) =>
//   Array.from(lsoaMap, ([lsoa, yearMap]) =>
//     Array.from(yearMap, ([year, techMap]) =>
//       Array.from(techMap, ([technology, values]) => {
//         const [total_material_cost, total_labour_cost] = Array.isArray(values)
//           ? values
//           : [0, 0];
//         return {
//           budget,
//           lsoa,
//           year,
//           technology,
//           total_material_cost,
//           total_labour_cost,
//           total_cost: total_material_cost + total_labour_cost,
//         };
//       })
//     ).flat()
//   ).flat()
// ).flat();

display(filteredScenario);
```

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

// const selectTechnology = view(
//   Inputs.select(
//     scenarios.map((d) => d.technology),
//     {
//       value: "E01017987",
//       label: "Technology",
//       sort: true,
//       unique: true,
//     }
//   )
// );
```

```js
const bands = 7;
const step = d3.max(alldata, (d) => d.total_cost) / bands;

display(
  Plot.plot({
    // height: 720,
    width: width,
    axis: null,
    y: { domain: [0, step] },
    color: { legend: true },
    // color: { scheme: "YlGnBu" },
    facet: { data: alldata, y: "technology" },
    marks: [
      // d3.range(bands).map((i) =>
      //   Plot.areaY(groupbyTechnology, {
      //     x: "year",
      //     y: (d) => d.total_cost - i * step,
      //     fill: i,
      //     clip: true,
      //   })
      // ),

      Plot.lineY(
        alldata, //.filter((d) => d.lsoa === selectLSOA2),
        {
          x: "year",
          y: selectCost2,
          sort: "year",
          stroke: "budget",
          marker: true,
          tip: true,
        }
      ),
      Plot.text(
        alldata,
        Plot.selectFirst({
          text: "technology",
          frameAnchor: "top-left",
          dx: 6,
          dy: 6,
        })
      ),
      Plot.frame(),
    ],
  })
);
```

## Glyph Designs

### Small multiples

<figure style="max-width: 100%;">
  <canvas id="glyph1" width="960" height="400"></canvas>
</figure>

```js
// flower petals
function drawCascadingPetal(ctx, length, angle, color1, color2) {
  ctx.save();
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    length / 4 + Math.random() * 5,
    -length / 2 - Math.random() * 10,
    length / 2,
    -length / 3 + Math.random() * 5,
    length,
    0
  );
  ctx.bezierCurveTo(
    length / 2,
    length / 3 + Math.random() * 5,
    length / 4 + Math.random() * 5,
    length / 2 + Math.random() * 10,
    0,
    0
  );
  // add stroke
  ctx.strokeStyle = "rgba(206, 0, 245, 0.6)"; //"purple";
  ctx.stroke();
  ctx.closePath();

  // Gradient for depth
  const gradient = ctx.createLinearGradient(0, 0, length + 10, 0);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;

  ctx.fill();
  ctx.restore();
}

// draw!

{
  const canvas = document.querySelector("#glyph1");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const numPetals = 8;

  const petalLengths = Array(numPetals).fill(180);

  // Draw cascading petals with gradients
  for (let i = 0; i < numPetals; i++) {
    const angle = (i * Math.PI * 2) / numPetals;
    const color1 = "rgba(254, 95, 177, 0.75)"; //"lightpink";
    const color2 = "rgba(245, 0, 127, 0.8)"; //"hotpink";
    drawCascadingPetal(ctx, petalLengths[i], angle, color1, color2);
  }

  // Draw the center
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2);
  ctx.fill();
}
```

### Nightingale chart

### Radial Barchart
