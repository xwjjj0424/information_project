
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 40, right: 40, bottom: 60, left: 80 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.json("data/a1-cars.json").then(data => {
  const filtered = data.filter(d => d.Horsepower != null && d.Weight != null);

  const x = d3.scaleLinear()
    .domain(d3.extent(filtered, d => d.Horsepower))
    .range([0, innerWidth])
    .nice();

  const y = d3.scaleLinear()
    .domain(d3.extent(filtered, d => d.Weight))
    .range([innerHeight, 0])
    .nice();

  const color = d3.scaleOrdinal()
    .domain(["American", "European", "Japanese"])
    .range(["steelblue", "orange", "green"]);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g")
    .call(d3.axisLeft(y));

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

  const circles = g.selectAll("circle")
    .data(filtered)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Horsepower))
    .attr("cy", d => y(d.Weight))
    .attr("r", 5)
    .attr("fill", d => color(d.Origin))
    .attr("opacity", 0.7)
    .attr("class", d => "dot origin-" + d.Origin)
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<strong>${d.Car}</strong><br>Horsepower: ${d.Horsepower}<br>Weight: ${d.Weight}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(300).style("opacity", 0);
    });

  // x-y label
  svg.append("text")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Horsepower");

  svg.append("text")
    .attr("transform", `rotate(-90)`)
    .attr("x", -margin.top - innerHeight / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Weight");

  // point example
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 120}, ${margin.top})`);

  const categories = [...new Set(filtered.map(d => d.Origin))];

  legend.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .text("Origin")
    .style("font-weight", "bold")
    .style("font-size", "13px");

  const activeCategory = { "American": true, "European": true, "Japanese": true };

  categories.forEach((category, i) => {
    const yOffset = i * 25;

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", yOffset)
      .attr("r", 6)
      .attr("fill", color(category));

    legend.append("text")
      .attr("x", 12)
      .attr("y", yOffset + 4)
      .text(category)
      .style("font-size", "12px")
      .style("cursor", "pointer")
      .attr("alignment-baseline", "middle")
      .on("click", () => {
        activeCategory[category] = !activeCategory[category];
        g.selectAll("circle")
          .attr("display", d => activeCategory[d.Origin] ? "inline" : "none");
      });
  });
});
