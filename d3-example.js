function drawScatterPlot() {
    d3.json('data/a1-cars.json').then(data => {
        console.log(data);

        const width = 800;
        const height = 600;
        const padding = {
            top: 60,
            right: 60,
            bottom: 60,
            left: 60
        }
        const svg = d3.select('svg');

        // Data cleaning
        data = data.filter(d => d.MPG && d.Horsepower);
        const countries = data.map(d => d.Origin);
        const uniqueCountries = Array.from(new Set(countries));
        console.log(uniqueCountries);

        const xScale = d3.scaleLinear()
            .domain([40, d3.max(data, d => d.Horsepower) + 10])
            .range([padding.left, width - padding.right]);
        const yScale = d3.scaleLinear()
            .domain([5, d3.max(data, d => d.MPG) + 10])
            .range([height - padding.bottom, padding.top]);
        const colroScale = d3.scaleOrdinal()
            .domain(uniqueCountries)
            .range(['red', 'green', 'blue']);

        svg.selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', (d, i) => xScale(d.Horsepower))
            .attr('cy', d => yScale(d.MPG))
            .attr('base_r', 4)
            .attr('r', 4)
            .attr('fill', d => colroScale(d.Origin))
            .attr('stroke', 'black')
            .style('opacity', 0.8)
            .style('cursor', 'pointer')
            .on('click', function (evt, d) {
                console.log(d);
            })
            .on('mouseover', function (evt, d) {
                d3.select(this)
                    .transition().duration(100)
                    .attr('r', this.getAttribute('base_r') * 2)
                    .style('opacity', 1);
            })
            .on('mouseout', function (evt, d) {
                d3.select(this)
                    .transition().duration(100)
                    .attr('r', this.getAttribute('base_r'))
                    .style('opacity', 0.8);
            });

        // Axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        svg.append('g')
            .attr('transform', `translate(0, ${height - padding.bottom})`)
            .call(xAxis);
        svg.append('g')
            .attr('transform', `translate(${padding.left}, 0)`)
            .call(yAxis);

        // Labels
        svg.append('text')
            .text('Horsepower')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .style('text-anchor', 'middle')
            .style('font-size', 12);
        svg.append('text')
            .text('MPG')
            .attr('x', -height / 2)
            .attr('y', 20)
            .attr('transform', 'rotate(-90)')
            .style('text-anchor', 'middle')
            .style('font-size', 12);

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - padding.right}, ${padding.top})`);
        uniqueCountries.forEach((country, i) => {
            const legendRow = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);
            legendRow.append('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('fill', colroScale(country));
            legendRow.append('text')
                .text(country)
                .attr('x', -10)
                .attr('y', 10)
                .style('text-anchor', 'end')
                .style('font-size', 12);
        })
    });
}

function drawBarchart() {
    d3.json('data/a1-cars.json').then(data => {
        // Create histogram
        console.log(data);
        const hist = {}
        for (let d of data) {
            if (d.Cylinders in hist) {
                hist[d.Cylinders]++;
            } else {
                hist[d.Cylinders] = 1;
            }
        }
        console.log(hist);

        const padding = {
            top: 60,
            right: 60,
            bottom: 60,
            left: 60
        }
        const width = 800;
        const height = 600;
        const svg = d3.select('svg');
        const xScale = d3.scaleBand()
            .domain(Object.keys(hist)) // [3, 4, 5, 6, 8]
            .range([padding.left, width - padding.right])
            .padding(0.3);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(Object.values(hist))])
            .range([height - padding.bottom, padding.top]);

        svg.selectAll('rect')
            .data(Object.entries(hist)) // {3: 4, 4: 204, 5: 103, 6: 84, 8: 103} = > [[3, 4], [4, 204], [5, 103], [6, 84], [8, 103]]
            .join('rect')
            .attr('x', d => xScale(d[0]))
            .attr('y', d => yScale(d[1]))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - padding.bottom - yScale(d[1]))
            .attr('fill', 'steelblue')
            .attr('stroke', 'black')
            .style('cursor', 'pointer')
            .on('click', function (evt, d) {
                console.log(evt);
                console.log(d)
            })
            .on('mouseover', function (evt, d) {
                d3.select(this)
                    .transition().duration(100)
                    .attr('fill', 'orange');
            })
            .on('mouseout', function (evt, d) {
                d3.select(this)
                    .transition().duration(100)
                    .attr('fill', 'steelblue');
            });
        
        // Axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        svg.append('g')
            .attr('transform', `translate(0, ${height - padding.bottom})`)
            .call(xAxis);
        svg.append('g')
            .attr('transform', `translate(${padding.left}, 0)`)
            .call(yAxis);

        // Labels
        svg.append('text')
            .text('Cylinders')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .style('text-anchor', 'middle')
            .style('font-size', 12);
        svg.append('text')
            .text('Count')
            .attr('x', -height / 2)
            .attr('y', 20)
            .attr('transform', 'rotate(-90)')
            .style('text-anchor', 'middle')
            .style('font-size', 12);
    })
}

window.addEventListener('load', drawScatterPlot);
