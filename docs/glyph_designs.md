---
title: Glyph Design
# sidebar: false
toc: true
sql:
  scenariosdb: ./data/formatted_cbe_scenarios.csv
---

# Glyph Designs

test canvas

```js
const dummyData = [
  {
    budget: "capped15000k",
    lsoa: "E01017987",
    year: 2024,
    technology: "heat pumps",
    total_material_cost: 37743.8,
    total_labour_cost: 13600,
    total_cost: 51343.8,
  },
  {
    budget: "capped15000k",
    lsoa: "E01017987",
    year: 2026,
    technology: "insulation",
    total_material_cost: 49763.78000000001,
    total_labour_cost: 41359.12,
    total_cost: 91122.9,
  },
];
```

## Radial Barchart

<figure style="max-width: 100%;">
  <canvas id="glyph3" width="300" height="300"></canvas>
</figure>

```js
// local canvas variables
function drawTimeseries(ctx, x, y, data = dummyData, padding = 2) {
  const cellSize = ctx.canvas.width;
  const centerX = x;
  const centerY = y;

  // maximum radius based on glyph cell size
  const radius = (cellSize - 2 * padding) / 2;
  const innerRadius = radius / 5;

  // sectors
  const numSectors = 3; // budget.length()
  const sectorAngle = (2 * Math.PI) / numSectors;
  // segment inside sectors
  const numSegments = 4; // technology.length()
  const segmentRadius = radius / 5; // 1/5 of the radius
  const segmentAngle = sectorAngle / numSegments;
  // part inside segments
  const partNumber = 22;
  const partRadius = radius / partNumber;

  for (let i = 0; i < numSectors; i++) {
    let sectorStartAngle = i * sectorAngle - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    let startAngle = i * sectorAngle - Math.PI / 2;
    let endAngle = startAngle + sectorAngle;
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = `hsl(${(i / numSectors) * 360}, 80%, 60%)`;
    ctx.fill();

    // draw each segment within the sector
    for (let j = 0; j < numSegments; j++) {
      ctx.beginPath();
      ctx.lineWidth = 0.15;
      ctx.strokeStyle = "black";
      let startAngle = sectorStartAngle + j * segmentAngle;
      let endAngle = startAngle + segmentAngle;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();
      ctx.closePath();

      for (let k = 0; k < partNumber; k++) {
        ctx.beginPath();
        ctx.lineWidth = 0.2;
        ctx.strokeStyle = "black";
        ctx.arc(centerX, centerY, partRadius * (k + 1), startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
        ctx.closePath();
      }
    }
  }

  // inner circle
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}
```

```js
function drawTimeseries2(ctx, x, y, data = dummyData, padding = 2) {
  const cellSize = ctx.canvas.width;
  const centerX = x;
  const centerY = y;

  // maximum radius based on glyph cell size
  const radius = (cellSize - 2 * padding) / 2;
  const innerRadius = radius / 5;

  const gapAngle = (3 * Math.PI) / 180; // 3 degree gap

  // sectors
  const numSectors = 3; // budget.length()
  //   const sectorAngle = (2 * Math.PI) / numSectors;
  const sectorAngle = (2 * Math.PI) / numSectors - gapAngle; // Subtract gapAngle from sectorAngle
  // segment inside sectors
  const numSegments = 4; // technology.length()
  const segmentAngle = sectorAngle / numSegments;
  // part inside segments
  const partNumber = 22;
  const partRadius = (radius - innerRadius) / partNumber;

  for (let i = 0; i < numSectors; i++) {
    // let sectorStartAngle = i * sectorAngle - Math.PI / 2;
    let sectorStartAngle = i * (sectorAngle + gapAngle) - Math.PI / 2;

    // draw the sector
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    // let startAngle = i * sectorAngle - Math.PI / 2;
    let startAngle = i * (sectorAngle + gapAngle) - Math.PI / 2;
    let endAngle = startAngle + sectorAngle;
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = `hsl(${(i / numSectors) * 360}, 80%, 60%)`;
    ctx.fill();

    // draw each segment within the sector
    for (let j = 0; j < numSegments; j++) {
      let startAngle = sectorStartAngle + j * segmentAngle;
      let endAngle = startAngle + segmentAngle;

      // draw each part within the segment
      for (let k = 0; k < partNumber; k++) {
        ctx.beginPath();
        ctx.lineWidth = 0.2;
        // ctx.strokeStyle = "black";
        ctx.arc(
          centerX,
          centerY,
          innerRadius + partRadius * (k + 1),
          startAngle,
          endAngle
        );
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
        ctx.closePath();
      }
    }
  }

  // inner circle
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}
```

```js
{
  const canvas = document.querySelector("#glyph3");
  const ctx = canvas.getContext("2d");
  // canvas.width = width;
  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  drawTimeseries2(ctx, centerX, centerY, dummyData);
}
```

---

## Small multiples

<figure style="max-width: 100%;">
  <canvas id="glyph1" width="300" height="300"></canvas>
</figure>

```js

```

## Nightingale chart

<figure style="max-width: 100%;">
  <canvas id="glyph2" width="300" height="300"></canvas>
</figure>

```js
// draw function here

// draw!
{
  const canvas = document.querySelector("#glyph2");
  const ctx = canvas.getContext("2d");
  // canvas.width = width;
  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radius = canvas.width / 2;
  const numSectors = 3;
  const sectorAngle = (Math.PI * 2) / numSectors;

  ctx.translate(canvas.width / 2, canvas.height / 2);

  for (let i = 0; i < numSectors; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.arc(0, 0, radius, 0, sectorAngle);
    ctx.closePath();
    ctx.fillStyle = `hsl(${(i / numSectors) * 360}, 50%, 50%)`;
    ctx.fill();
    ctx.rotate(sectorAngle);
  }
}
```

## Experiments

<figure style="max-width: 100%;">
  <canvas id="myCanvas" width="300" height="300"></canvas>
</figure>

```js
var myCanvas = document.getElementById("myCanvas");
myCanvas.width = 500;
myCanvas.height = 500;

var ctx = myCanvas.getContext("2d");

var myBarchart = new BarChart({
  canvas: myCanvas,
  padding: 40,
  gridScale: 5,
  gridColor: "black",
  data: {
    "Classical Music": 16,
    "Alternative Rock": 12,
    Pop: 18,
    Jazz: 32,
  },
  colors: ["#a55ca5", "#67b6c7", "#bccd7a", "#eb9743"],
});
myBarchart.draw();
```

<figure style="max-width: 100%;">
  <canvas id="myCanvas2" width="300" height="300"></canvas>
</figure>

```js
function drawBarChart(
  ctx,
  x,
  y,
  cellSize,
  data, // Aggregated data
  colours,
  background,
  padding = 0
) {
  const gap = 2; // Gap between categories
  let lastCategory = null;

  // calculate maximum absolute weight for positioning
  const maxAbsoluteWeight = Math.max(...Object.values(weights).map(Math.abs));

  // calculate total width of bars based on weights
  const totalBarWidth = Object.values(weights).reduce(
    (sum, weight) => sum + Math.abs(weight),
    0
  );

  const availableWidth =
    cellSize -
    2 * maxAbsoluteWeight -
    gap * (categories.length - 1) - // + 15; // the 15 px offset, from observable (?)
    2 * padding;

  // Calculate starting position for the first bar from the bottom of the cell
  let currentX = x - availableWidth / 2 + padding - 5; // not sure why observable have certain offset to the canvas
  let barY = y + cellSize / 2 - padding; // Start from the bottom of the cell

  // Iterate over each parameter and draw its bar
  selected_parameters.forEach((parameter, i) => {
    const value = data[parameter]; // Access value from aggregated data
    const color = colours[i];
    const weight = weights[parameter];
    const category = categories.find((c) => c.parameter === parameter).category;

    // Calculate bar width based on weight and total bar width
    let barWidth = (Math.abs(weight) * availableWidth) / totalBarWidth;

    const minBarWidth = 1;
    barWidth = Math.max(barWidth, minBarWidth);

    // Calculate bar height based on value and full cell height
    const barHeight = (value / 100) * (cellSize - 2 * padding); // Use full cell height

    // Add a gap if the category has changed
    if (lastCategory && lastCategory !== category) {
      currentX += gap;
    }
    lastCategory = category;

    // Draw the bar
    ctx.fillStyle = color;
    ctx.fillRect(currentX, barY, barWidth, -barHeight); // Draw solid bar with negative height

    // Draw a thick  border for negative weights
    if (weight < 0) {
      // ctx.save();
      const pattern = ctx.createPattern(canvasPattern, "repeat");
      ctx.fillStyle = pattern;
      ctx.fillRect(currentX, barY, barWidth, -barHeight);
      // ctx.fill();
      // ctx.restore();

      // stroke
      ctx.lineWidth = 1;
      ctx.strokeStyle = "white"; // white border on negative weight
      ctx.strokeRect(currentX - padding, barY, barWidth, -barHeight);
    }

    // Update starting position for the next bar
    currentX += barWidth;
  });
}
```

<!--

<figure style="max-width: 100%;">
  <canvas id="flower" width="400" height="400"></canvas>
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
  const canvas = document.querySelector("#flower");
  const ctx = canvas.getContext("2d");
  // canvas.width = width;
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
``` -->
