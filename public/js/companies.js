const colors = d3.scaleOrdinal(d3.schemeCategory10);
const slow = () =>
  d3
    .transition()
    .duration(750)
    .ease(d3.easeLinear);

const drawCompanies = (companies, metaForViz) => {
  const chartSize = { width: 800, height: 600 };
  const margin = { left: 100, right: 10, top: 10, bottom: 150 };
  const width = chartSize.width - margin.left - margin.right;
  const height = chartSize.height - margin.top - margin.bottom;

  const y = d3
    .scaleLinear()
    .domain([0, _.maxBy(companies, metaForViz.key)[metaForViz.key]])
    .range([height, 0]);

  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(companies, "Name"))
    .paddingInner(0.3)
    .paddingOuter(0.3);

  const yAxis = d3.axisLeft(y).tickFormat(d => d + " Rs");

  const xAxis = d3.axisBottom(x);

  const svg = d3
    .select("#chart-area")
    .append("svg")
    .attr("class", "chart-svg")
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  const g = svg
    .append("g")
    .attr("class", "rects")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Companies");

  g.append("text")
    .attr("class", "y axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text(metaForViz.yAxisLabel);

  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  const rects = g.selectAll("rect").data(companies, c => c.Name);

  rects
    .enter()
    .append("rect")
    .attr("x", c => x(c.Name))
    .attr("y", c => y(c[metaForViz.key]))
    .attr("width", x.bandwidth)
    .attr("height", c => y(0) - y(c[metaForViz.key]))
    .attr("fill", c => colors(c.Name));

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  g.selectAll(".x-axis text")
    .attr("x", -5)
    .attr("y", 10)
    .attr("transform", "rotate(-40)");
};

const percentageFormat = d => `${d}%`;
const ruppessFormat = d => `${d / 1000}k Cr Rs`;
const formats = {
  MarketCap: ruppessFormat,
  DivYld: percentageFormat,
  PE: percentageFormat
};

const updatCompanies = (companies, meta) => {
  const chartSize = { width: 800, height: 600 };
  const margin = { left: 100, right: 10, top: 10, bottom: 150 };
  const width = chartSize.width - margin.left - margin.right;
  const height = chartSize.height - margin.top - margin.bottom;
  const maxValue = _.get(_.maxBy(companies, meta.key), meta.key, 0);
  const y = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([height, 0]);

  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(companies, "Name"))
    .paddingInner(0.3)
    .paddingOuter(0.3);

  const xAxis = d3.axisBottom(x);

  const yAxis = d3.axisLeft(y).tickFormat(formats[meta.key]);

  d3.select(".y-axis").call(yAxis);

  d3.select(".x-axis").call(xAxis);

  d3.select(".y.axis-label").text(meta.yAxisLabel);

  d3.selectAll("rect")
    .data(companies, c => c.Name)
    .exit()
    .remove();

  d3.select(".rects")
    .selectAll("rect")
    .data(companies, c => c.Name)
    .enter()
    .append("rect")
    .attr("x", c => x(c.Name))
    .attr("y", y(0))
    .attr("width", x.bandwidth);

  d3.selectAll("rect")
    .attr("fill", c => colors(c.Name))
    .transition(slow())
    .attr("width", x.bandwidth)
    .attr("x", c => x(c.Name))
    .attr("y", c => y(c[meta.key]))
    .attr("height", c => {
      console.log(c.Name, " ", y(0) - y(c[meta.key]));
      return y(0) - y(c[meta.key]);
    });
};

const drawChart = companies => {
  let i = 1;
  const metasForViz = [
    { key: "CMP", yAxisLabel: "CMP" },
    { key: "PE", yAxisLabel: "PE" },
    { key: "MarketCap", yAxisLabel: "MarketCap" },
    { key: "DivYld", yAxisLabel: "DivYld" }
  ];
  drawCompanies(companies, metasForViz[0]);
  setInterval(() => {
    updatCompanies(companies, metasForViz[i++ % metasForViz.length]);
  }, 1000);

  frequentlyMoveCompanies(companies, []);
};

const frequentlyMoveCompanies = (src, dest) => {
  setInterval(() => {
    const c = src.shift();
    if (c) dest.push(c);
    else [src, dest] = [dest, src];
  }, 1000);
};

const main = () => {
  d3.csv("data/companies.csv", c => {
    return {
      ...c,
      CMP: +c.CMP
    };
  }).then(drawChart);
};
window.onload = main;
