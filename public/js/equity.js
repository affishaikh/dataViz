const chartSize = { width: 1040, height: 800 };
const margin = { left: 100, right: 10, top: 10, bottom: 150 };
const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;

const initChart = function() {
  const svg = d3
    .select("#chart-area")
    .append("svg")
    .attr("class", "chart-svg")
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  const g = svg
    .append("g")
    .attr("class", "equity")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Time");

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

  g.append("text")
    .attr("class", "y axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text("Price");

  g.append("g").attr("class", "y-axis");
};

const drawChart = function(quotes) {
  const startDate = new Date(_.first(quotes).Date);
  const closeDate = new Date(_.last(quotes).Date);

  const x = d3
    .scaleTime()
    .domain([startDate, closeDate])
    .range([0, width]);

  const xAxis = d3.axisBottom(x);

  const y = d3
    .scaleLinear()
    .domain([_.minBy(quotes, "Close").Close, _.maxBy(quotes, "Close").Close])
    .range([height, 0]);

  const yAxis = d3.axisLeft(y).tickFormat(d => d + " Rs");

  d3.select(".x-axis").call(xAxis);
  d3.select(".y-axis").call(yAxis);

  const g = d3.select(".equity");

  const line = d3
    .line()
    .x(q => x(new Date(q.Date)))
    .y(q => y(q.Close));

  g.append("path")
    .attr("class", "close")
    .attr("d", line(quotes));

  const newQuotes = calculateSMA(quotes);

  g.append("path")
    .attr("class", "sma")
    .attr("d", line(newQuotes.slice(100)));
};

const calculateSMA = function(quotes) {
  const first100 = _.take(quotes, 100);
  const after100 = quotes.slice(100);
  return first100.concat(
    after100.map((q, i) => {
      const SMA =
        quotes
          .slice(i, i + 100)
          .map(p => p.Close)
          .reduce((x, y) => x + y, 0) / 100;

      return { ...q, SMA };
    })
  );
};

const parse = function({ Date, Volume, AdjClose, ...Rest }) {
  const res = {};
  _.forEach(Rest, (v, k) => {
    res[k] = +v;
  });
  return { ...res, Date };
};

const main = function() {
  d3.csv("data/nifty.csv", parse).then(e => {
    initChart(e);
    drawChart(e);
  });
};

window.onload = main;
