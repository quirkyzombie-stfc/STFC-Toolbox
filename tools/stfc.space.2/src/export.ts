import fs from "fs";
import stringify from "json-stringify-pretty-compact";

import { forEachShip, lookupName } from "./database";
import { ApiAllData, ApiCost } from "./types";

function addCost(
  data: ApiAllData,
  result: { [id: string]: number },
  cost: ApiCost[] | undefined,
  nameFilter: (name: string) => boolean
) {
  cost?.forEach((c) => {
    const name = lookupName(data.tmaterials, c.resource_id, "name");
    if (nameFilter(name)) {
      result[name] = (result[name] || 0) + c.amount;
    }
  });
  return result;
}

function exportShipScrappingData() {
  const data: ApiAllData = JSON.parse(
    fs.readFileSync("./out/all.json", "utf8")
  );
  const allData: {
    name: string;
    build_cost: { [key: string]: number };
    scrap_yield: { [key: string]: number };
  }[] = [];

  forEachShip(data, (id) => {
    const name = lookupName(data.tships, id, "name");
    const ddata = data.dship.find((x) => x.id === id);

    const build_cost: { [id: string]: number } = {};
    const nameFilter = (name: string) => name.indexOf("★") >= 0;

    addCost(data, build_cost, ddata?.build_cost, nameFilter);
    ddata?.tiers?.forEach((t) =>
      t.components.forEach((c) =>
        addCost(data, build_cost, c.build_cost, nameFilter)
      )
    );

    const scrap_yield = addCost(
      data,
      {},
      ddata?.scrap[ddata.scrap.length - 1]?.resources,
      nameFilter
    );

    allData.push({ name, build_cost, scrap_yield });
  });

  const relevantData = allData.filter(
    (x) =>
      Object.keys(x.scrap_yield).filter((k) => k.indexOf("4★") >= 0).length > 0
  );

  fs.writeFileSync(
    "./out/scrapping.json",
    stringify(relevantData, { maxLength: 80, indent: "  " })
  );
}

function exportResearchTimes() {
  const data: ApiAllData = JSON.parse(
    fs.readFileSync("./out/all.json", "utf8")
  );
  var totalSeconds = 0;
  const totalCost: { [key: string]: number } = {};

  data.dresearch.forEach((r) =>
    r.levels.forEach((l) => {
      totalSeconds += l.research_time_in_seconds;
      addCost(data, totalCost, l.costs, (_) => true);
    })
  );

  const result: { [key: string]: number } = {
    ...totalCost,
    seconds: totalSeconds,
  };

  const orderedResult = Object.keys(result)
    .sort()
    .reduce((obj, key) => {
      obj[key] = result[key];
      return obj;
    }, {} as { [key: string]: number });

  fs.writeFileSync("./out/research.json", stringify(orderedResult));
}

function exportMiningNodes() {
  const data: ApiAllData = JSON.parse(
    fs.readFileSync("./out/all.json", "utf8")
  );

  const result = data.dsystem.flatMap((s) => {
    const name = lookupName(data.tsystems, s.id, "name");
    const mines: any[] = [];
    s.mines.forEach(m => {
      const item = {
        name: name,
        material: lookupName(data.tmaterials, m.resource, "name"),
        rate: m.rate,
        amount: m.amount,
      }
      if (mines.find(x => x.material === item.material && x.rate === item.rate && x.amount === item.amount) === undefined) {
        mines.push(item);
      }
    });
    return mines;
  });

  fs.writeFileSync("./out/mines.json", stringify(result, {maxLength: 120}));
}

exportShipScrappingData();
exportResearchTimes();
exportMiningNodes();
