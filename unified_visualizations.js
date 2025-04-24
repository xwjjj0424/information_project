(function() {
    // Initialize tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    Promise.all([
        d3.json("data/a1-cars.json"),
        d3.csv("data/a1-cars.csv")
    ]).then(([jsonData, csvData]) => {
        initializeScatterplot(jsonData);
        initializeHeatmap(jsonData);
        initializeBarChart(csvData);
        initializePCP(csvData);
    });

    // Scatterplot Implementation
    function initializeScatterplot(data) {
        const margin = { top: 40, right: 40, bottom: 60, left: 80 };
        const width = 700 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#scatterplot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Horsepower))
            .range([0, width])
            .nice();

        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Weight))
            .range([height, 0])
            .nice();

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => x(d.Horsepower))
            .attr("cy", d => y(d.Weight))
            .attr("r", 5)
            .attr("fill", d => ({American: "steelblue", European: "orange", Japanese: "green"}[d.Origin]))
            .on("mouseover", (event, d) => {
                tooltip.transition().style("opacity", 1);
                tooltip.html(`<strong>${d.Car}</strong><br>HP: ${d.Horsepower}<br>Weight: ${d.Weight}`)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mouseout", () => tooltip.style("opacity", 0));
    }

    // Heatmap Implementation
    function initializeHeatmap(data) {
        const margin = { top: 80, right: 30, bottom: 30, left: 80 };
        const width = 500 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#heatmap")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const features = ["MPG", "Horsepower", "Weight", "Acceleration", "Displacement"];

        const filtered = data.filter(d =>
            features.every(f => d[f] != null && !isNaN(d[f]))
        );

        const vectors = {};
        features.forEach(f => {
            vectors[f] = filtered.map(d => +d[f]);
        });

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
        .attr("y", 6)
        .attr("width", innerWidth)
        .attr("height", 2)
        .style("fill", "url(#linear-gradient)");

    svg.append("text")
        .attr("x", margin.left)
        .attr("y", 5)
        .text("-1")
        .style("font-size", "12px")
        .attr("text-anchor", "start");

    svg.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", 5)
        .text("0")
        .style("font-size", "12px")
        .attr("text-anchor", "middle");

    svg.append("text")
        .attr("x", margin.left + innerWidth)
        .attr("y", 5)
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
    }

    // Bar Chart Implementation
    function initializeBarChart(data) {
        const margin = { top: 60, right: 0, bottom: 60, left: 60 };
        const width = 700 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

          // Calculate average MPG per Origin country
        /*const avgData = Array.from(
            d3.rollup(
            data,
            v => d3.mean(v, d => d.MPG),
            d => d.Origin),
            ([origin, avg]) => ({ origin, avg })
        );*/

        const avgData = d3.rollups(data, 
            v => d3.mean(v, d => d.MPG), 
            d => d.Origin
        ).map(([origin, avg]) => ({ origin, avg }));

        const svg = d3.select("#bar-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Rest of bar chart code from bar.js
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

    }

    // PCP Implementation
    function initializePCP(data) {
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const width = 1000 - margin.left - margin.right;
        const height = 5000 - margin.top - margin.bottom;

        const container = d3.select("#pcp-cont");
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

        var svg = container.append('pcp-chart')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

          const dimensions = data.columns;
          const columnTypes = {};
          let colorScale;

          dimensions.forEach(dim => {
            const numericValues = data.map(d => +d[dim]).filter(v => !isNaN(v));
            columnTypes[dim] = numericValues.length === data.length ? 
              'numerical' : 'categorical';
          });

          const processedData = data.map(d => {
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

    }
})();
