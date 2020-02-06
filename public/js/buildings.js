const drawBuildings = buildings => {
  const width = 400;
  const height = 400;
  const y = d3
    .scaleLinear()
    .domain([0, 1000])
    .range([0, 400]);

  x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(buildings, "name"))
    .paddingInner(0.3)
    .paddingOuter(0.3);

  const toLine = b => `<strong>${b.name}</strong> <i>${b.height}</i>`;
  document.querySelector("#chart-area").innerHTML = buildings
    .map(toLine)
    .join("<hr/>");

  const svg = d3
    .select("#chart-data")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const rects = svg.selectAll("rect").data(buildings);

  newRects = rects
    .enter()
    .append("rect")
    .attr("x", b => x(b.name))
    .attr("y", 0)
    .attr("width", x.bandwidth)
    .attr("height", b => y(b.height))
    .attr("fill", "grey");

  console.log(newRects);
};
const main = () => {
  d3.json("data/buildings.json").then(drawBuildings);
};
window.onload = main;
