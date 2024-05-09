import { csvFormat, csvParse } from "d3-dsv";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const cbe_scenarios_file = await readFile(
  fileURLToPath(import.meta.resolve("./formatted_cbe_scenarios2.csv")),
  "utf8"
);

const cbe_geo_lookup_file = await readFile(
  fileURLToPath(import.meta.resolve("./cbe_geo_lookup.csv")),
  "utf8"
);

const cbe_scenarios = csvParse(cbe_scenarios_file).filter(
  (d) => d["year"] < 2034
);

// const cbe_scenarios = csvParse(cbe_scenarios_file, (d) => {
//   return {
//     ...d,
//     uprn: d.uprn.toString(),
//     year: +d.year,
//     labour_cost: Number(d["labour_cost"]),
//     material_cost: Number(d["material_cost"]),
//     heat_demand_kw: +d["heat_demand_kw"],
//     annual_generation_kwh: +d["annual_generation_kwh"],
//     ev_input_kw: +d["ev_input_kw"],
//   };
// }).filter((d) => d["year"] < 2034);

const cbe_geo_lookup = csvParse(cbe_geo_lookup_file, (d) => {
  return {
    ...d,
    uprn: d.UPRN.toString(),
    Latitude: +d.Latitude,
    Longitude: +d.Longitude,
  };
});

//check
// console.warn("cbe_scenarios", cbe_scenarios);

// lookups
const ashp_lookup = {
  2: {
    "Carbon Saved (1 Year) (kg CO2)": 501.462963,
    "Carbon Saved (5 Years) (kg CO2)": 2155.77109,
    "Carbon Saved (10 Years) (kg CO2)": 2854.831246,
    "Carbon Saved (15 Years) (kg CO2)": 3721.218941,
  },
  3: {
    "Carbon Saved (1 Year) (kg CO2)": 752.1944444,
    "Carbon Saved (5 Years) (kg CO2)": 3233.656635,
    "Carbon Saved (10 Years) (kg CO2)": 4282.24687,
    "Carbon Saved (15 Years) (kg CO2)": 5581.828411,
  },
  4: {
    "Carbon Saved (1 Year) (kg CO2)": 1002.925926,
    "Carbon Saved (5 Years) (kg CO2)": 4311.54218,
    "Carbon Saved (10 Years) (kg CO2)": 5709.662493,
    "Carbon Saved (15 Years) (kg CO2)": 7442.437881,
  },
  5: {
    "Carbon Saved (1 Year) (kg CO2)": 1253.657407,
    "Carbon Saved (5 Years) (kg CO2)": 5389.427725,
    "Carbon Saved (10 Years) (kg CO2)": 7137.078116,
    "Carbon Saved (15 Years) (kg CO2)": 9303.047352,
  },
  6: {
    "Carbon Saved (1 Year) (kg CO2)": 1504.388889,
    "Carbon Saved (5 Years) (kg CO2)": 6467.31327,
    "Carbon Saved (10 Years) (kg CO2)": 8564.493739,
    "Carbon Saved (15 Years) (kg CO2)": 11163.65682,
  },
  7: {
    "Carbon Saved (1 Year) (kg CO2)": 1755.12037,
    "Carbon Saved (5 Years) (kg CO2)": 7545.198815,
    "Carbon Saved (10 Years) (kg CO2)": 9991.909362,
    "Carbon Saved (15 Years) (kg CO2)": 13024.26629,
  },
  8: {
    "Carbon Saved (1 Year) (kg CO2)": 2005.851852,
    "Carbon Saved (5 Years) (kg CO2)": 8623.08436,
    "Carbon Saved (10 Years) (kg CO2)": 11419.32499,
    "Carbon Saved (15 Years) (kg CO2)": 14884.87576,
  },
  9: {
    "Carbon Saved (1 Year) (kg CO2)": 2256.583333,
    "Carbon Saved (5 Years) (kg CO2)": 9700.969905,
    "Carbon Saved (10 Years) (kg CO2)": 12846.74061,
    "Carbon Saved (15 Years) (kg CO2)": 16745.48523,
  },
  10: {
    "Carbon Saved (1 Year) (kg CO2)": 2507.314815,
    "Carbon Saved (5 Years) (kg CO2)": 10778.85545,
    "Carbon Saved (10 Years) (kg CO2)": 14274.15623,
    "Carbon Saved (15 Years) (kg CO2)": 18606.0947,
  },
  11: {
    "Carbon Saved (1 Year) (kg CO2)": 2758.046296,
    "Carbon Saved (5 Years) (kg CO2)": 11856.741,
    "Carbon Saved (10 Years) (kg CO2)": 15701.57186,
    "Carbon Saved (15 Years) (kg CO2)": 20466.70417,
  },
  12: {
    "Carbon Saved (1 Year) (kg CO2)": 3008.777778,
    "Carbon Saved (5 Years) (kg CO2)": 12934.62654,
    "Carbon Saved (10 Years) (kg CO2)": 17128.98748,
    "Carbon Saved (15 Years) (kg CO2)": 22327.31364,
  },
  13: {
    "Carbon Saved (1 Year) (kg CO2)": 3259.509259,
    "Carbon Saved (5 Years) (kg CO2)": 14012.51209,
    "Carbon Saved (10 Years) (kg CO2)": 18556.4031,
    "Carbon Saved (15 Years) (kg CO2)": 24187.92311,
  },
  14: {
    "Carbon Saved (1 Year) (kg CO2)": 3510.240741,
    "Carbon Saved (5 Years) (kg CO2)": 15090.39763,
    "Carbon Saved (10 Years) (kg CO2)": 19983.81872,
    "Carbon Saved (15 Years) (kg CO2)": 26048.53258,
  },
  15: {
    "Carbon Saved (1 Year) (kg CO2)": 3760.972222,
    "Carbon Saved (5 Years) (kg CO2)": 16168.28318,
    "Carbon Saved (10 Years) (kg CO2)": 21411.23435,
    "Carbon Saved (15 Years) (kg CO2)": 27909.14206,
  },
  16: {
    "Carbon Saved (1 Year) (kg CO2)": 4011.703704,
    "Carbon Saved (5 Years) (kg CO2)": 17246.16872,
    "Carbon Saved (10 Years) (kg CO2)": 22838.64997,
    "Carbon Saved (15 Years) (kg CO2)": 29769.75153,
  },
};

const ev_lookup = {
  2.3: {
    "Carbon Saved (1 Year) (kg CO2)": 2037.449048,
    "Carbon Saved (5 Years) (kg CO2)": 8758.919559,
    "Carbon Saved (10 Years) (kg CO2)": 11599.20798,
    "Carbon Saved (15 Years) (kg CO2)": 15119.34988,
  },
  7: {
    "Carbon Saved (1 Year) (kg CO2)": 2037.449048,
    "Carbon Saved (5 Years) (kg CO2)": 8758.919559,
    "Carbon Saved (10 Years) (kg CO2)": 11599.20798,
    "Carbon Saved (15 Years) (kg CO2)": 15119.34988,
  },
  11: {
    "Carbon Saved (1 Year) (kg CO2)": 2444.938857,
    "Carbon Saved (5 Years) (kg CO2)": 10510.70347,
    "Carbon Saved (10 Years) (kg CO2)": 13919.04958,
    "Carbon Saved (15 Years) (kg CO2)": 18143.21985,
  },
  22: {
    "Carbon Saved (1 Year) (kg CO2)": 10187.24524,
    "Carbon Saved (5 Years) (kg CO2)": 43794.59779,
    "Carbon Saved (10 Years) (kg CO2)": 57996.03992,
    "Carbon Saved (15 Years) (kg CO2)": 75596.74938,
  },
  50: {
    "Carbon Saved (1 Year) (kg CO2)": 42786.43,
    "Carbon Saved (5 Years) (kg CO2)": 183937.3107,
    "Carbon Saved (10 Years) (kg CO2)": 243583.3677,
    "Carbon Saved (15 Years) (kg CO2)": 317506.3474,
  },
  150: {
    "Carbon Saved (1 Year) (kg CO2)": 156883.5767,
    "Carbon Saved (5 Years) (kg CO2)": 674436.806,
    "Carbon Saved (10 Years) (kg CO2)": 893139.0148,
    "Carbon Saved (15 Years) (kg CO2)": 1164189.94,
  },
};

function getCarbonSaved(lookup, firstYear, currentYear, sizeInKwp) {
  const selectedLookup = lookup[sizeInKwp];
  if (!selectedLookup) {
    return null;
  }

  const yearsFromFirstYear = currentYear - firstYear;

  if (yearsFromFirstYear === 0) {
    return selectedLookup["Carbon Saved (1 Year) (kg CO2)"];
  } else if (yearsFromFirstYear >= 1 && yearsFromFirstYear < 5) {
    const lowerValue = selectedLookup["Carbon Saved (1 Year) (kg CO2)"];
    const upperValue = selectedLookup["Carbon Saved (5 Years) (kg CO2)"];
    const ratio = yearsFromFirstYear / 5;
    return lowerValue + (upperValue - lowerValue) * ratio;
  } else if (yearsFromFirstYear >= 5 && yearsFromFirstYear < 10) {
    const lowerValue = selectedLookup["Carbon Saved (5 Years) (kg CO2)"];
    const upperValue = selectedLookup["Carbon Saved (10 Years) (kg CO2)"];
    const ratio = (yearsFromFirstYear - 5) / 5;
    return lowerValue + (upperValue - lowerValue) * ratio;
  } else if (yearsFromFirstYear >= 10 && yearsFromFirstYear < 15) {
    const lowerValue = selectedLookup["Carbon Saved (10 Years) (kg CO2)"];
    const upperValue = selectedLookup["Carbon Saved (15 Years) (kg CO2)"];
    const ratio = (yearsFromFirstYear - 10) / 5;
    return lowerValue + (upperValue - lowerValue) * ratio;
  } else if (yearsFromFirstYear >= 15) {
    return selectedLookup["Carbon Saved (15 Years) (kg CO2)"];
  }
}

const processed = await cbe_scenarios.map((row) => {
  const modified = {
    ...row,
    total_cost: row["labour_cost"] + row["material_cost"],
    ashp_carbon_saved: getCarbonSaved(
      ashp_lookup,
      2024,
      row["year"],
      row["heat_demand_kw"]
    ),
    ev_carbon_saved: getCarbonSaved(
      ev_lookup,
      2024,
      row["year"],
      row["ev_input_kw"]
    ),
    pv_carbon_saved: row["annual_generation_kwh"]
      ? row["annual_generation_kwh"] * 0.193
      : null,
  };
  return modified;
});
//   .map((row) => {
//     const matchingLookupEntry = cbe_geo_lookup.find(
//       (lookupRow) => lookupRow.uprn === row.uprn
//     );

//     // Check if a match is found
//     if (matchingLookupEntry) {
//       // Destructure latitude and longitude from lookup
//       const { Latitude: lat, Longitude: lon } = matchingLookupEntry;
//       return {
//         ...row,
//         lat,
//         lon,
//       };
//     } else {
//       // Handle scenario where no matching UPRN is found (optional)
//       console.warn(`No matching UPRN found for: ${row.uprn}`);
//       // You can return a modified row with null/default values for lat/lon here
//       return { ...row, lat: null, lon: null };
//     }
//   });

// console.warn(processed);

// stdout csv
process.stdout.write(csvFormat(processed));
