
const svg = d3.select("svg");

const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 80, right: 30, bottom: 30, left: 80 };

const innerWidth = 400;
const innerHeight = 400;


const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

function pearsonCorrelation(x, y) {
  const meanX = d3.mean(x);
  const meanY = d3.mean(y);
  const diffX = x.map(val => val - meanX);
  const diffY = y.map(val => val - meanY);

  const numerator = d3.sum(diffX.map((dx, i) => dx * diffY[i]));
  const denominator = Math.sqrt(
    d3.sum(diffX.map(dx => dx * dx)) * d3.sum(diffY.map(dy => dy * dy))
  );

  return denominator === 0 ? 0 : numerator / denominator;
}


// 添加交互按钮
const controls = d3.select("body").append("div").style("margin", "10px");


controls.append("button")
  .text("Export PNG")
  .on("click", () => {
    const svgNode = document.querySelector("svg");
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgNode);

    const canvas = document.createElement("canvas");
    canvas.width = svgNode.viewBox.baseVal.width || svgNode.width.baseVal.value;
    canvas.height = svgNode.viewBox.baseVal.height || svgNode.height.baseVal.value;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = "heatmap.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
  });

d3.json("data/a1-cars.json").then(data => {
  const features = ["MPG", "Horsepower", "Weight", "Acceleration", "Displacement"];

  const filtered = data.filter(d =>
    features.every(f => d[f] != null && !isNaN(d[f]))
  );

  const vectors = {};
  features.forEach(f => {
    vectors[f] = filtered.map(d => +d[f]);
  });

  const correlationMatrix = [];
  for (let i = 0; i < features.length; i++) {
    for (let j = 0; j < features.length; j++) {
      const f1 = features[i];
      const f2 = features[j];
      const corr = pearsonCorrelation(vectors[f1], vectors[f2]);
      correlationMatrix.push({ feature1: f1, feature2: f2, value: +corr.toFixed(2) });
    }
  }

  const x = d3.scaleBand().domain(features).range([0, innerWidth]).padding(0.05);
  const y = d3.scaleBand().domain(features).range([0, innerHeight]).padding(0.05);
  const color = d3.scaleSequential(d3.interpolateRdBu).domain([1, -1]);

  
  // 添加颜色图例（color legend）
  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient
    .attr("x1", "0%")
    .attr("x2", "100%")
    .selectAll("stop")
    .data([
      { offset: "0%", color: color(-1) },
      { offset: "50%", color: color(0) },
      { offset: "100%", color: color(1) }
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  svg.append("rect")
    .attr("x", margin.left)
    .attr("y", 30)
    .attr("width", innerWidth)
    .attr("height", 10)
    .style("fill", "url(#linear-gradient)");

  svg.append("text")
    .attr("x", margin.left)
    .attr("y", 25)
    .text("-1")
    .style("font-size", "12px")
    .attr("text-anchor", "start");

  svg.append("text")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", 25)
    .text("0")
    .style("font-size", "12px")
    .attr("text-anchor", "middle");

  svg.append("text")
    .attr("x", margin.left + innerWidth)
    .attr("y", 25)
    .text("1")
    .style("font-size", "12px")
    .attr("text-anchor", "end");
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g").call(d3.axisTop(x))
    .selectAll("text").attr("transform", "rotate(-45)").style("text-anchor", "start");
  g.append("g").call(d3.axisLeft(y));

  g.selectAll("rect")
    .data(correlationMatrix)
    .enter()
    .append("rect")
    .attr("x", d => x(d.feature1))
    .attr("y", d => y(d.feature2))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", d => color(d.value))
    .attr("class", "cell")
    
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`<strong>${d.feature1} × ${d.feature2}</strong><br>Correlation: ${d.value}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");

      g.append("text")
        .attr("class", "temp-label")
        .attr("x", x(d.feature1) + x.bandwidth() / 2)
        .attr("y", y(d.feature2) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-size", "10px")
        .text(d.value);
    })
    .on("mouseout", () => {
      tooltip.transition().duration(300).style("opacity", 0);
      g.selectAll(".temp-label").remove();
    });

});
