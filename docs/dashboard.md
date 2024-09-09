---
title: Scenario Visualisation
theme: dashboard
sidebar: false
toc: false
---

```js
import * as d3 from "npm:d3";
import { Mutable } from "npm:@observablehq/stdlib";
import { glyphMap } from "./components/gridded-glyphmaps/index.min.js";
import { Slider, MultiSelect, MantineProvider } from "npm:@mantine/core";

import { processDataCumulative, processData } from "./components/helper.js";
import { colours, colourMapping } from "./components/config.js";
```

<!-------- Stylesheets -------->
<!-- <link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bulma@1.0.0/css/bulma.min.css"
> -->

<style>
body, html {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>

<!-------- Data -------->

```js
const griddedDataFile = FileAttachment(
  "data/cbe_scenarios_reformatted.csv"
).csv({
  typed: true,
});
```

```js
const griddedData = griddedDataFile.filter((d) => d.lat !== null);
```

<!--------- Panels --------->

```js
function useState(value) {
  const state = Mutable(value);
  const setState = (value) => (state.value = value);
  return [state, setState];
}
const [selected, setSelected] = useState(["react"]);
const [nnvalue, setNN] = useState(0);
```

```js
const n = html`<input type="range" step="10" min="10" max="150" />`;
const nn = Generators.input(n);
```


```js
const carbonSavedInput = Inputs.checkbox(
  ["ashp_carbonsaved", "ev_carbonsaved", "pv_carbonsaved"],
  {
    // label: "Carbon Saved",
    value: ["ashp_carbonsaved", "pv_carbonsaved", "ev_carbonsaved"],
  }
);
const carbonSaved = Generators.input(carbonSavedInput);

const costsInput = Inputs.checkbox(
  ["labour_cost", "material_cost"],
  {
    // label: "Costs",
  }
);
const costs = Generators.input(costsInput);

const budgetToVisualiseInput = Inputs.radio(
  ["capped500k", "capped15000k", "Uncapped"],
  {
    // label: "Budgets",
    value: "capped15000k",
  }
);
const budgetToVisualise = Generators.input(budgetToVisualiseInput);

const glyphModeInput = Inputs.select(
  [
    "Stacked Area Chart",
    "Stream graph",
    "Normalised Area Chart",
    "Mirrored Area Chart",
    "Line Chart",
  ],
  {
    label: "Glyph Mode",
    value: "Stacked Area Chart",
  }
);
const glyphMode = Generators.input(glyphModeInput);

const gridSizeInput = Inputs.range([10, 100], { step: 10, value: 60 });
gridSizeInput.number.style["max-width"] = "50px";
//gridSizeInput.querySelector("label").style["min-width"] = "160px";
const gridSize = Generators.input(gridSizeInput);

const cumulativeInput = Inputs.toggle({ value: false });
const cumulative = Generators.input(cumulativeInput);

const normaliseInput = Inputs.toggle({ value: false });
const normalise = Generators.input(cumulativeInput);
```

<!-------- Plots -------->

<!-------- Input Panels -------->
<div class="grid grid-cols-4" style="margin:5px">
    <div class="card grid-colspan-1">
        <h2 style="padding-bottom:15px">Carbon saved: </h2>
        ${carbonSavedInput}
        <h2 style="padding-top:15px;padding-bottom:15px">Costs: </h2>
        ${costsInput}
        <h2 style="padding-top:15px; padding-bottom:15px">Budgets: </h2>
        ${budgetToVisualiseInput}
        <hr>
        <h2 style="padding-bottom:15px">Glyph mode: </h2>
        ${glyphModeInput}
        <h2 style="padding-bottom:15px">Grid Size: </h2>
        <span>${gridSizeInput} </span>
        <hr>
        <h2 style="padding-bottom:15px">Cumulative? ${cumulativeInput}</h2>
    </div>
    <div class="card glyphmaps grid-colspan-3" style="padding:8px; height:92vh;">
     ${resize((width, height) => drawGlyphmaps({ width, height }))}
    </div>
</div>

<!--------- Glyphmap Main Functions --------->

```js
function drawGlyphmaps({ width, height } = {}) {
  return glyphMap({
    data: griddedData,
    getLocationFn: (row) => [row.lon, row.lat],
    cellSize: gridSize, //60, // setGridSize(),
    mapType: "CartoPositron", //"CartoPositron",
    discretisationShape: "grid",

    width: width,
    height: height,
    tileWidth: 150,
    initbb: [
      0.068638841385944, 52.1579417014909, 0.184552035598734, 52.2372295579635,
    ],
    greyscale: true,

    glyph: {
      // initFn: initFn,
      aggrFn: appendRecordsAggrFn,
      postAggrFn: postAggrFn,
      drawFn: interactiveDrawFn(glyphMode),
      postDrawFn: drawLegend,
      //   tooltipTextFn: (cell) => {
      //     const filteredData = cell.averages.filter(
      //       (item) => item.budget === budgetToVisualise
      //     );
      //     setState(filteredData);
      //     return "";
      //   },
    },
  });
}
```

<!--------- Glyphs Drawing Functions --------->

```js
function drawFnStreams(cell, x, y, cellSize, ctx, global, panel) {
  if (!cell) return;
  const padding = 2;
  // ctx.globalAlpha = 0.8;

  var grid_long = cellSize - padding * 2;
  var grid_wide = cellSize - padding * 2;
  //draw cell background
  const boundary = cell.getBoundary(padding);
  // console.log("boundary: ", boundary);
  ctx.fillStyle = "#cccb";
  ctx.beginPath();
  ctx.moveTo(boundary[0][0], boundary[0][1]);
  for (let i = 1; i < boundary.length; i++)
    ctx.lineTo(boundary[i][0], boundary[i][1]);
  ctx.closePath();
  ctx.fill();

  // draw the data
  const filteredData = cell.averages.filter(
    (item) => item.budget === budgetToVisualise
  );

  // console.log(filteredData);

  const keysToVisualize = selectedParameters; //["labour_cost", "material_cost", "total_cost"];
  drawStreamgraph(ctx, x, y, cellSize, filteredData, 2, keysToVisualize);
}
```

```js
function drawAreaChart(
  ctx,
  centerX,
  centerY,
  cellSize,
  data = [],
  padding = 2,
  keysToVisualize
) {
  const drawWidth = cellSize - 2 * padding;
  const drawHeight = cellSize - 2 * padding;

  // Adjust the x scale to fit within the cell
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => new Date(d.year)))
    .range([centerX - drawWidth / 2, centerX + drawWidth / 2]);

  // Calculate the y scale based on the total sum of all keys for each year
  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, (d) =>
        keysToVisualize.reduce((sum, key) => sum + d[key], 0)
      ),
    ])
    .range([centerY + drawHeight / 2, centerY - drawHeight / 2]);

  const stack = d3.stack().keys(keysToVisualize).order(d3.stackOrderNone);

  const series = stack(data);

  // Define the curve function
  const curve = d3.curveBumpX;

  // Drawing
  series.forEach((s) => {
    ctx.beginPath();
    const area = d3
      .area()
      .x((d) => xScale(new Date(d.data.year)))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(curve);

    area.context(ctx)(s);
    ctx.fillStyle = colourMapping[s.key];
    ctx.fill();
  });
}
```

```js
function drawAreachartStack(
  ctx,
  centerX,
  centerY,
  cellSize,
  data = [],
  padding = 2,
  keysToVisualize
) {
  const drawWidth = cellSize - 2 * padding;
  const drawHeight = cellSize - 2 * padding;

  // Adjust the x scale to fit within the cell
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => new Date(d.year)))
    .range([centerX - drawWidth / 2, centerX + drawWidth / 2]);

  // Calculate the y scale based on normalized percentages
  const yScale = d3
    .scaleLinear()
    .domain([0, 1]) // Domain is 0 to 1 for normalized values
    .range([centerY + drawHeight / 2, centerY - drawHeight / 2]);

  const stack = d3.stack().keys(keysToVisualize).order(d3.stackOrderNone);

  // Normalize the data
  const normalizedData = data.map((d) => {
    const total = keysToVisualize.reduce((sum, key) => sum + d[key], 0);
    return {
      ...d,
      ...keysToVisualize.reduce((acc, key) => {
        acc[key] = d[key] / total;
        return acc;
      }, {}),
    };
  });

  const series = stack(normalizedData);

  // Define the curve function
  const curve = d3.curveBumpX;

  // Drawing
  series.forEach((s) => {
    ctx.beginPath();
    const area = d3
      .area()
      .x((d) => xScale(new Date(d.data.year)))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(curve);

    area.context(ctx)(s);
    ctx.fillStyle = colourMapping[s.key]; // colours[s.index];//`hsl(${(s.index / series.length) * 360}, 80%, 60%)`;
    ctx.fill();
  });
}
```

```js
function drawLineChart(
  ctx,
  centerX,
  centerY,
  cellSize,
  data = [],
  padding = 2,
  keysToVisualize
) {
  const drawWidth = cellSize - 2 * padding;
  const drawHeight = cellSize - 2 * padding;

  // Filter out years without any data
  const filteredData = data.filter((d) =>
    keysToVisualize.some((key) => d[key] !== undefined)
  );

  // Adjust the x scale to fit within the cell
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(filteredData, (d) => new Date(d.year)))
    .range([centerX - drawWidth / 2, centerX + drawWidth / 2]);

  // Calculate the y scale based on the total sum of all keys for each year
  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(filteredData, (d) =>
        keysToVisualize.reduce((sum, key) => sum + (d[key] || 0), 0)
      ),
    ])
    .range([centerY + drawHeight / 2, centerY - drawHeight / 2]);

  // Draw lines for each key-data series
  keysToVisualize.forEach((key, i) => {
    const color = colourMapping[key]; // colours[i];

    const dataPoints = filteredData.map((d) => ({
      x: xScale(new Date(d.year)),
      y: yScale(d[key] || 0), // Handle undefined values
    }));

    if (dataPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(dataPoints[0].x, dataPoints[0].y);
      for (let j = 1; j < dataPoints.length; j++) {
        ctx.lineTo(dataPoints[j].x, dataPoints[j].y);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });
}
```

```js
function drawStreamgraph(
  ctx,
  centerX,
  centerY,
  cellSize,
  data = [],
  padding = 2,
  keysToVisualize
) {
  const drawWidth = cellSize - 2 * padding;
  const drawHeight = cellSize - 2 * padding;

  // Adjust the x scale to fit within the cell
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => new Date(d.year)))
    .range([
      centerX - drawWidth / 2 + padding,
      centerX + drawWidth / 2 - padding,
    ]);

  // Calculate the maximum sum of all keys for each year
  const maxSum = d3.max(data, (d) =>
    keysToVisualize.reduce((sum, key) => sum + d[key], 0)
  );

  // Calculate the y scale based on the total sum of all keys and the available cell height
  const maxHeight = drawHeight / 2;
  const yScale = d3
    .scaleLinear()
    .domain([-maxSum, maxSum])
    .range([centerY + maxHeight, centerY - maxHeight])
    .nice();

  const stack = d3
    .stack()
    .keys(keysToVisualize)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetSilhouette);

  const series = stack(data);

  // Define the curve function
  const curve = d3.curveBumpX;

  // Drawing
  series.forEach((s) => {
    ctx.beginPath();
    const area = d3
      .area()
      .x((d) => xScale(new Date(d.data.year)))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(curve);
    area.context(ctx)(s);
    ctx.fillStyle = colourMapping[s.key]; // colours[s.index]; // `hsl(${(s.index / series.length) * 360}, 80%, 60%)`;
    ctx.fill();
  });
}
```

```js
function drawStreamgraphMirror(
  ctx,
  centerX,
  centerY,
  cellSize,
  data = [],
  padding = 2,
  keysToVisualize = []
) {
  const drawWidth = cellSize - 2 * padding;
  const drawHeight = cellSize - 2 * padding;

  // Adjust the x scale to fit within the cell
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => new Date(d.year)))
    .range([
      centerX - drawWidth / 2 + padding,
      centerX + drawWidth / 2 - padding,
    ]);

  // Calculate the maximum sum of all keys for each year
  const maxSum = d3.max(data, (d) =>
    keysToVisualize.reduce((sum, key) => sum + Math.abs(d[key]), 0)
  );

  // Calculate the y scale based on the total sum of all keys and the available cell height
  const maxHeight = drawHeight / 2;
  const yScale = d3
    .scaleLinear()
    .domain([-maxSum, maxSum])
    .range([-maxHeight, maxHeight])
    .nice();

  const upwardKeys = keysToVisualize.filter((key) =>
    ["labour_cost", "material_cost", "total_cost"].includes(key)
  );
  const downwardKeys = keysToVisualize.filter((key) =>
    ["ashp_carbonsaved", "ev_carbonsaved", "pv_carbonsaved"].includes(key)
  );

  const upwardStack = d3.stack().keys(upwardKeys).order(d3.stackOrderNone);
  const downwardStack = d3.stack().keys(downwardKeys).order(d3.stackOrderNone);

  const upwardSeries = upwardStack(data);
  const downwardSeries = downwardStack(data);

  // Define the curve function
  const curve = d3.curveBumpX;

  // Drawing upward series
  upwardSeries.forEach((s) => {
    ctx.beginPath();
    const area = d3
      .area()
      .x((d) => xScale(new Date(d.data.year)))
      .y0((d) => centerY + yScale(d[0]))
      .y1((d) => centerY + yScale(d[1]))
      .curve(curve);
    area.context(ctx)(s);
    ctx.fillStyle = colourMapping[s.key]; //colours[s.index];
    ctx.fill();
  });

  // Drawing downward series
  downwardSeries.forEach((s) => {
    ctx.beginPath();
    const area = d3
      .area()
      .x((d) => xScale(new Date(d.data.year)))
      .y0((d) => centerY - yScale(d[0]))
      .y1((d) => centerY - yScale(d[1]))
      .curve(curve);
    area.context(ctx)(s);
    ctx.fillStyle = colourMapping[s.key]; //colours[s.index + upwardKeys.length];
    ctx.fill();
  });
}
```

<!--------- Glyphmaps Helper Functions --------->

```js
// const setglyphmode = () => {
//   glyphMode;
//   drawGlyphmaps().setGlyph({
//     drawFn: interactiveDrawFn(glyphMode),
//   });
//   //   drawGlyphmaps.setGlyph({
//   //     drawFn: interactiveDrawFn(glyphMode),
//   //   });
// };
```

```js
function interactiveDrawFn(mode) {
  return function drawFn(cell, x, y, cellSize, ctx, global, panel) {
    if (!cell) return;
    const padding = 2;
    // ctx.globalAlpha = 0.5;

    var grid_long = cellSize - padding * 2;
    var grid_wide = cellSize - padding * 2;

    //draw cell background
    const boundary = cell.getBoundary(padding);
    // console.log("boundary: ", boundary);
    ctx.fillStyle = "#cccb";
    ctx.beginPath();
    ctx.moveTo(boundary[0][0], boundary[0][1]);
    for (let i = 1; i < boundary.length; i++)
      ctx.lineTo(boundary[i][0], boundary[i][1]);
    ctx.closePath();
    ctx.fill();

    // draw the data
    const filteredData = cell.averages.filter(
      (item) => item.budget === budgetToVisualise
    );

    // console.log(filteredData);

    const keysToVisualize = selectedParameters; //["labour_cost", "material_cost", "total_cost"];

    if (mode == "Line Chart") {
      drawLineChart(ctx, x, y, cellSize, filteredData, 2, keysToVisualize);
    } else if (mode == "Stream graph") {
      drawStreamgraph(ctx, x, y, cellSize, filteredData, 2, keysToVisualize);
    } else if (mode == "Normalised Area Chart") {
      drawAreachartStack(ctx, x, y, cellSize, filteredData, 2, keysToVisualize);
    } else if (mode == "Stacked Area Chart") {
      drawAreaChart(ctx, x, y, cellSize, filteredData, 2, keysToVisualize);
    } else if (mode == "Mirrored Area Chart") {
      drawStreamgraphMirror(
        ctx,
        x,
        y,
        cellSize,
        filteredData,
        2,
        keysToVisualize
      );
    }
  };
}
```

```js
function postAggrFn(cells, cellSize, global, panel) {
  for (const cell of cells) {
    cell.averages = [];
    // const keysToVisualize = ["labour_cost", "material_cost", "total_cost"];
    if (cell.records) {
      if (cumulative) {
        cell.averages = processDataCumulative(
          cell.records,
          ["budget", "year"],
          selectedParameters,
          "sum"
        );
      } else {
        cell.averages = processData(
          cell.records,
          ["budget", "year"],
          selectedParameters,
          "sum"
        );
      }
    }
  }
}
```

```js
function appendRecordsAggrFn(cell, row, weight, global, panel) {
  //   console.log("appendrecords");
  if (!cell.records) cell.records = []; //if the cell doesn't currently have a records property, make one
  cell.records.push(row);
}
```

<!--------- Dashboard helpers --------->

```js
const selectedParameters = carbonSaved.concat(costs);
// display(selectedParameters);
```

```js
function setState(value) {
  const state = Mutable(value);
  const setState = (value) => (state.value = value);
  return [state, setState];
}

function setGridSize(value) {
  const state = Mutable(value);
  const setState = (value) => (state.value = value);
  return [state, setState];
}
```

```js
function drawLegend(grid, cellSize, ctx, global, panel) {
  ctx.font = "10px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const maxTextWidth = d3.max(
    selectedParameters.map((item) => ctx.measureText(item).width)
  );

  const x = panel.getWidth() - maxTextWidth - 20;
  let y = panel.getHeight() - selectedParameters.length * 15;

  ctx.fillStyle = "#fff8";
  ctx.fillRect(x, y, maxTextWidth + 15, selectedParameters.length * 15);

  for (let i = 0; i < selectedParameters.length; i++) {
    const parameter = selectedParameters[i];
    const color = colourMapping[parameter] || colours[i]; // Use color mapping if available, otherwise use default colors

    ctx.fillStyle = color;
    ctx.fillRect(x, y, 10, 10);

    ctx.fillStyle = "#333";
    ctx.fillText(parameter, x + 15, y + 5);

    y += 15;
  }
}
```
