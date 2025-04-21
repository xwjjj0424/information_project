const margin = { top: 60, right: 0, bottom: 60, left: 60 };
const totalWidth = 400;
const totalHeight = 400;
const width = totalWidth - margin.left - margin.right;
const height = totalHeight - margin.top - margin.bottom;

const svg = d3.select("body")
  .append("svg")
  .attr("width", totalWidth)
  .attr("height", totalHeight)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("data/a1-cars.csv", d => ({
  MPG: +d.MPG,
  Origin: d.Origin
})).then(data => {
  // Calculate average MPG per Origin country
  const avgData = Array.from(
    d3.rollup(
      data,
      v => d3.mean(v, d => d.MPG),
      d => d.Origin
    ),
    ([origin, avg]) => ({ origin, avg })
  );

  /*if (avgData[0].Origin) {
    const origins = [...new Set(avgData.map(d => d.origin))];
    colorScale = d3.scaleOrdinal()
        .domain(origins)
        .range(d3.schemeCategory10);
  }*/

  const xScale = d3.scaleBand()
    .domain(avgData.map(d => d.origin))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(avgData, d => d.avg)])
    .range([height, 0]);

  svg.selectAll("rect")
    .data(avgData)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.origin))
    .attr("y", d => yScale(d.avg))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d.avg))
    .attr("fill", "steelblue");
    //.attr("fill", d => colorScale ? colorScale(d.Origin) : 'steelblue');

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 35)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Origin");

  svg.append("g")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -height / 2)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Average MPG");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Average MPG by Origin");
}).catch(error => {
  console.error("Error loading the CSV file:", error);
});
