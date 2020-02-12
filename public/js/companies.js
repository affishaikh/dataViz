const drawCompanies = (companies, metaForViz) => {
  const chartSize = { width: 800, height: 600 };
  const margin = { left: 100, right: 10, top: 10, bottom: 150 };
  const width = chartSize.width - margin.left - margin.right;
  const height = chartSize.height - margin.top - margin.bottom;
  const colors = d3.scaleOrdinal(d3.schemeCategory10);

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

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(d => `${d}Rs`)
    .ticks(3);

  const xAxis = d3.axisBottom(x);

  const svg = d3
    .select("#chart-area")
    .append("svg")
    .attr("class", "chart-svg")
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  const g = svg
    .append("g")
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

  const rects = g.selectAll("rect").data(companies);

  rects
    .enter()
    .append("rect")
    .attr("x", c => x(c.Name))
    .attr("y", c => y(c[metaForViz.key]))
    .attr("width", x.bandwidth)
    .attr("height", c => y(0) - y(c[metaForViz.key]))
    .attr("fill", c => colors(c[metaForViz.key]));

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  g.selectAll(".x-axis text")
    .attr("x", -5)
    .attr("y", 10)
    .attr("transform", "rotate(-40)");
};

const updatCompanies = (companies, meta) => {
  const chartSize = { width: 800, height: 600 };
  const margin = { left: 100, right: 10, top: 10, bottom: 150 };
  const width = chartSize.width - margin.left - margin.right;
  const height = chartSize.height - margin.top - margin.bottom;
  const colors = d3.scaleOrdinal(d3.schemeCategory10);
  const y = d3
    .scaleLinear()
    .domain([0, _.maxBy(companies, meta.key)[meta.key]])
    .range([height, 0]);

  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(companies, "Name"))
    .paddingInner(0.3)
    .paddingOuter(0.3);

  d3.select(".y.axis-label").text(meta.yAxisLabel);

  d3.selectAll("rect")
    .data(companies)
    .attr("x", c => x(c.Name))
    .attr("y", c => y(c[meta.key]))
    .attr("width", x.bandwidth)
    .attr("height", c => y(0) - y(c[meta.key]))
    .attr("fill", c => colors(c[meta.key]));
};

const drawChart = companies => {
  let i = 1;
  const metasForViz = [
    { key: "CMP", yAxisLabel: "CMP (Rs)" },
    { key: "PE", yAxisLabel: "PE (Rs)" },
    { key: "MarketCap", yAxisLabel: "MarketCap (Rs)" }
  ];
  drawCompanies(companies, metasForViz[0]);
  setInterval(() => {
    updatCompanies(companies, metasForViz[i++ % 3]);
  }, 2000);
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
