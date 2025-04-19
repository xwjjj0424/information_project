// Add required styles
d3.select(document.head).append('style')
  .text(`
    .axis { cursor: move; }
    .axis text { font-size: 12px; fill: black; }
    .line { stroke-width: 1; opacity: 0.4; }
    .slider-container { margin: 20px; }
    .slider-label { font-family: Arial; margin-left: 10px; }
  `);

const margin = { top: 30, right: 20, bottom: 20, left: 100 };
const width = 1000 - margin.left - margin.right;
const height = 5000 - margin.top - margin.bottom;

const container = d3.select(document.body).append('div');

const sliderContainer = container.append('div')
  .attr('class', 'slider-container');

const slider = sliderContainer.append('input')
  .attr('type', 'range')
  .attr('min', 1)
  .attr('max', 100)
  .attr('value', 100)
  .style('width', '300px');

sliderContainer.append('span')
  .attr('class', 'slider-label')
  .text('100%');

const svg = container.append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);



d3.csv("data/a1-cars.csv").then(function(rawData) {
  const dimensions = rawData.columns;
  const columnTypes = {};
  let colorScale;

  dimensions.forEach(dim => {
    const numericValues = rawData.map(d => +d[dim]).filter(v => !isNaN(v));
    columnTypes[dim] = numericValues.length === rawData.length ? 
      'numerical' : 'categorical';
  });

  const processedData = rawData.map(d => {
    dimensions.forEach(dim => {
      d[dim] = columnTypes[dim] === 'numerical' ? 
        +d[dim] : d[dim].toString();
    });
    return d;
  });

  // Create color scale for origin
  if (processedData[0].Origin) {
    const origins = [...new Set(processedData.map(d => d.origin))];
    colorScale = d3.scaleOrdinal() //["American", "European", "Japanese"], ["red", "green", "steelblue"])
      .domain(origins)
      .range(d3.schemeCategory10);
  }

  let shuffledData = shuffle([...processedData]);

  const yScales = {};
  dimensions.forEach(dim => {
    if (columnTypes[dim] === 'numerical') {
      yScales[dim] = d3.scaleLinear()
        .domain(d3.extent(processedData, d => d[dim]))
        .range([height, 0]);
    } else {
      const categories = Array.from(new Set(processedData.map(d => d[dim]))).sort();
      yScales[dim] = d3.scalePoint()
        .domain(categories)
        .range([height, 0])
        .padding(0.5);
    }
  });

  const axisGroups = svg.selectAll(".axis")
    .data(dimensions)
    .enter().append("g")
    .attr("class", "axis")
    .attr("data-dimension", d => d)
    .attr("transform", (d, i) => `translate(${(width / (dimensions.length - 1)) * i},0)`)
    .call(d3.drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded));

  axisGroups.each(function(d) {
    const axis = columnTypes[d] === 'numerical' ? 
      d3.axisLeft(yScales[d]) : 
      d3.axisLeft(yScales[d]).tickSize(0);
      
    d3.select(this).call(axis)
      .append("text")
      .attr("class", "label")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(d);
  });

  updateDisplay(100);

  slider.on('input', function() {
    const percentage = +this.value;
    d3.select('.slider-label').text(`${percentage}%`);
    updateDisplay(percentage);
  });

  function updateDisplay(percentage) {
    const sampleSize = Math.round((percentage / 100) * shuffledData.length);
    const sampleData = shuffledData.slice(0, sampleSize);

    const paths = svg.selectAll('.line')
      .data(sampleData, (d, i) => i + d.origin); 

    paths.exit().remove();

    console.log(paths)

    paths.enter()
      .append('path')
      .attr('class', 'line')
      .style('stroke', d => colorScale ? colorScale(d.Origin) : 'steelblue')
      .style('opacity', 0.4)
      .merge(paths)
      .attr('d', d => generatePath(d))
      .attr("fill", "none");
  }

  function generatePath(d) {
    const sortedAxes = getSortedAxes();
    return d3.line()(sortedAxes.map(axis => {
      return [axis.x, yScales[axis.dim](d[axis.dim])];
    }));
  }

  function getSortedAxes() {
    return svg.selectAll(".axis").nodes().map(node => {
      const transform = d3.select(node).attr("transform");
      const x = +transform.split(/[()]/)[1].split(",")[0];
      return {
        dim: d3.select(node).attr("data-dimension"),
        x: x
      };
    }).sort((a, b) => a.x - b.x);
  }

  function dragStarted(event) {
    d3.select(this).raise().classed("active", true);
  }

  function dragged(event) {
    const newX = Math.max(0, Math.min(width, event.x));
    d3.select(this).attr("transform", `translate(${newX},0)`);
    svg.selectAll('.line').attr('d', d => generatePath(d));
  }

  function dragEnded(event) {
    d3.select(this).classed("active", false);
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
});
