```js
function appendRecordsAggrFn(cell, row, weight, global, panel) {
  if (!cell.records) cell.records = []; //if the cell doesn't currently have a records property, make one
  cell.records.push(row);

  if (!cell.records) cell.records = {}; //if the cell doesn't currently have a records property, make one
  // cell.records.push(row); //append the record
  const {
    lsoa,
    postcode,
    lat,
    lon,
    budget,
    year,
    technology,
    labour_cost,
    material_cost,
    total_cost,
    ashp_carbon_saved,
    ev_carbon_saved,
    pv_carbon_saved,
  } = row;

  // aggregate the data by buget and year
  // const key = `${row.technology}-${row.budget}-${row.year}`;
  const key = `${row.budget}-${row.year}`;
  if (!cell.records[key]) {
    cell.records[key] = [];
  }
  cell.records[key].push({
    labour_cost,
    material_cost,
    total_cost,
    ashp_carbon_saved,
    ev_carbon_saved,
    pv_carbon_saved,
  });
  // console.log(cell.records);
}
```

```js
function postAggrFn(cells, cellSize, global, panel) {
  // console.log("data", cells[0]);
  const formattedData = {};
  const startYear = 2024;
  const endYear = 2034;
  for (let year = startYear; year <= endYear; year++) {
    for (const budget of ["capped500k", "capped15000k", "Uncapped"]) {
      if (!formattedData[budget]) {
        formattedData[budget] = [];
      }
      formattedData[budget].push({
        year,
        total_cost: 0,
        ashp_carbonsaved: 0,
        ev_carbonsaved: 0,
        pv_carbonsaved: 0,
      });
    }
  }
  // console.log("formattedData", formattedData);

  // // loop in cells
  for (const cell of cells) {
    if (!cell.formattedData) cell.formattedData = formattedData;
    if (cell.records) {
      // console.log(cell.records);
      for (const [key, dataPoints] of Object.entries(cell.records)) {
        // const [technology, budget, year] = key.split("-");
        const [budget, year] = key.split("-");

        // aggregate all values
        const labourCost = dataPoints.reduce(
          (sum, point) => sum + point.labour_cost,
          0
        );
        const materialCost = dataPoints.reduce(
          (sum, point) => sum + point.material_cost,
          0
        );
        const totalCost = dataPoints.reduce(
          (sum, point) => sum + point.total_cost,
          0
        );
        const ashpCarbonSaved = dataPoints.reduce(
          (sum, point) => sum + (point.ashp_carbon_saved || 0),
          0
        );
        const evCarbonSaved = dataPoints.reduce(
          (sum, point) => sum + (point.ev_carbon_saved || 0),
          0
        );
        const pvCarbonSaved = dataPoints.reduce(
          (sum, point) => sum + (point.pv_carbon_saved || 0),
          0
        );
        // console.log(year);
        const yearIndex = year - startYear;
        cell.formattedData[budget][yearIndex] = {
          year: parseInt(year),
          labour_cost: labourCost,
          material_cost: materialCost,
          total_cost: totalCost,
          ashp_carbonsaved: ashpCarbonSaved,
          ev_carbonsaved: evCarbonSaved,
          pv_carbonsaved: pvCarbonSaved,
        };
      }
    }
    // console.log(cell.formattedData);
  }
}
```
