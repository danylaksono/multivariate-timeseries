function processDataCumulative(data, groupingKeys, aggregationKeys) {
  // Aggregate data first
  const uniqueData = new Map();

  for (const item of data) {
    // Create a composite key from the values of the grouping keys
    const compositeKey = groupingKeys.map((key) => item[key]).join("|");

    if (!uniqueData.has(compositeKey)) {
      uniqueData.set(compositeKey, []);
    }

    uniqueData.get(compositeKey).push(item);
  }

  const aggregatedData = [];

  for (const [compositeKey, items] of uniqueData.entries()) {
    const aggregatedItem = {
      compositeKey, // Store the composite key for reference
      count: items.length, // Number of items in this group
    };

    // Aggregate the specified keys
    for (const key of aggregationKeys) {
      let total = 0;
      for (const item of items) {
        if (key in item) {
          total += item[key];
        }
      }
      aggregatedItem[key] = total;
    }

    aggregatedData.push(aggregatedItem);
  }

  // Determine the range of years
  const years = new Set(
    aggregatedData.map((item) => Number(item.compositeKey.split("|")[1]))
  );
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  // Create a map to hold the restructured data by year and budget
  const dataByYearAndBudget = new Map();

  // Iterate over the aggregated data
  aggregatedData.forEach((item) => {
    const [budget, yearString] = item.compositeKey.split("|");
    const year = Number(yearString);
    const compositeKey = `${year}|${budget}`;

    if (!dataByYearAndBudget.has(compositeKey)) {
      dataByYearAndBudget.set(compositeKey, { year, budget });
    }

    const yearAndBudgetData = dataByYearAndBudget.get(compositeKey);

    aggregationKeys.forEach((key) => {
      if (key in item) {
        yearAndBudgetData[key] = (yearAndBudgetData[key] || 0) + item[key];
      }
    });

    dataByYearAndBudget.set(compositeKey, yearAndBudgetData);
  });

  // Calculate cumulative values for each budget
  const budgets = new Set(
    aggregatedData.map((item) => item.compositeKey.split("|")[0])
  );

  budgets.forEach((budget) => {
    let cumulativeValues = {};
    const sortedYears = Array.from(years).sort((a, b) => a - b);

    for (const year of sortedYears) {
      const compositeKey = `${year}|${budget}`;

      if (dataByYearAndBudget.has(compositeKey)) {
        const currentData = dataByYearAndBudget.get(compositeKey);

        aggregationKeys.forEach((key) => {
          const currentValue = currentData[key] || 0;
          const previousValue = cumulativeValues[key] || 0;
          cumulativeValues[key] = currentValue + previousValue;
          currentData[key] = cumulativeValues[key];
        });

        dataByYearAndBudget.set(compositeKey, currentData);
      }
    }
  });

  // Convert the map back to an array and sort by year
  const sortedData = Array.from(dataByYearAndBudget.values()).sort(
    (a, b) => a.year - b.year
  );

  return sortedData;
}

function processData(
  data,
  groupingKeys,
  aggregationKeys,
  aggregationType = "average"
) {
  // Aggregate data first
  const uniqueData = new Map();

  for (const item of data) {
    // Create a composite key from the values of the grouping keys
    const compositeKey = groupingKeys.map((key) => item[key]).join("|");

    if (!uniqueData.has(compositeKey)) {
      uniqueData.set(compositeKey, []);
    }

    uniqueData.get(compositeKey).push(item);
  }

  const aggregatedData = [];

  for (const [compositeKey, items] of uniqueData.entries()) {
    const aggregatedItem = {
      compositeKey, // Store the composite key for reference
      count: items.length, // Number of items in this group
    };

    // Aggregate the specified keys
    for (const key of aggregationKeys) {
      let total = 0;
      for (const item of items) {
        if (key in item) {
          total += item[key];
        }
      }

      if (aggregationType === "average") {
        const average = total / items.length || 0; // Default to 0 if no data
        aggregatedItem[key] = average;
      } else if (aggregationType === "sum") {
        aggregatedItem[key] = total;
      }
    }

    aggregatedData.push(aggregatedItem);
  }

  // Determine the range of years
  const years = new Set(
    aggregatedData.map((item) => Number(item.compositeKey.split("|")[1]))
  );
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  // Create a map to hold the restructured data by year and budget
  const dataByYearAndBudget = new Map();

  // Iterate over the aggregated data
  aggregatedData.forEach((item) => {
    const [budget, yearString] = item.compositeKey.split("|");
    const year = Number(yearString);
    const compositeKey = `${year}|${budget}`;

    if (!dataByYearAndBudget.has(compositeKey)) {
      dataByYearAndBudget.set(compositeKey, { year, budget });
    }

    const yearAndBudgetData = dataByYearAndBudget.get(compositeKey);

    aggregationKeys.forEach((key) => {
      if (key in item) {
        yearAndBudgetData[key] = (yearAndBudgetData[key] || 0) + item[key];
      }
    });

    dataByYearAndBudget.set(compositeKey, yearAndBudgetData);
  });

  // Fill in missing years for each budget
  const budgets = new Set(
    aggregatedData.map((item) => item.compositeKey.split("|")[0])
  );

  budgets.forEach((budget) => {
    for (let year = minYear; year <= maxYear; year++) {
      const compositeKey = `${year}|${budget}`;

      if (!dataByYearAndBudget.has(compositeKey)) {
        const newEntry = { year, budget };

        aggregationKeys.forEach((key) => {
          newEntry[key] = 0; // Set all keyToVisualize values to 0 for missing years
        });

        dataByYearAndBudget.set(compositeKey, newEntry);
      }
    }
  });

  // Convert the map back to an array and sort by year
  const sortedData = Array.from(dataByYearAndBudget.values()).sort(
    (a, b) => a.year - b.year
  );

  return sortedData;
}

export { processDataCumulative, processData };
