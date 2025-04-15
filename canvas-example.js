function test() {
    const canvas = document.querySelector('#canvas');
    
    // get rendering context of canvas
    const ctx = canvas.getContext('2d');

    // draw basic shapes
    // Rectangles
    ctx.fillStyle = "red";
    ctx.fillRect(10, 10, 40, 40);

    ctx.strokeStyle = "green";
    ctx.lineWidth = 4;
    ctx.strokeRect(100, 10, 40, 40);

    ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    ctx.fillRect(200, 10, 60, 60)

    // Path
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 200);
    ctx.lineTo(200, 300);
    ctx.lineTo(300, 200);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath(); // Smiling face
    ctx.arc(500, 200, 50, 0, Math.PI * 2, true); // Outer circle
    ctx.moveTo(535, 200);
    ctx.arc(500, 200, 35, 0, Math.PI, false); // Mouth (clockwise)
    ctx.moveTo(490, 190);
    ctx.arc(485, 190, 5, 0, Math.PI * 2, true); // Left eye
    ctx.moveTo(520, 190);
    ctx.arc(515, 190, 5, 0, Math.PI * 2, true); // Right eye
    ctx.stroke();
}

function drawBarChart() {
    fetch("data/a1-cars.json")
        .then(response => response.json())
        .then(data => {
            console.log(data);

            // Create histogram of cylindars
            const hist = {}
            for(let d of data) {
                if(d.Cylinders in hist) {
                    hist[d.Cylinders]++;
                } else {
                    hist[d.Cylinders] = 1;
                }
            }

            console.log(hist)

            // Getting canvas and drawing context
            const canvas = document.querySelector("#canvas");
            const ctx = canvas.getContext('2d');
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const padding = {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40
            }

            // Draw x axis
            ctx.textAlign = "center";
            ctx.font = "16px snas-serif";
            ctx.strokeStyle = 'black';
            ctx.beginPath()
            ctx.moveTo(padding.left, canvasHeight - padding.bottom)
            ctx.lineTo(canvasWidth - padding.right, canvasHeight - padding.bottom);
            ctx.stroke();
            
            const keys = Object.keys(hist);
            keys.sort();
            const unitWidth = (canvasWidth - padding.left - padding.right) / keys.length;
            for(let i=0; i < keys.length; i++) {
                const anchor = padding.left + (unitWidth * (i + 1)) - (unitWidth / 2);
                ctx.fillText(keys[i], anchor, canvasHeight - padding.bottom + 20);
            }

            // Draw y axis
            ctx.beginPath()
            ctx.moveTo(padding.left, canvasHeight - padding.bottom)
            ctx.lineTo(padding.left, padding.top)
            ctx.stroke()

            // Draw bars
            const values = keys.map(k => hist[k])
            const valueMax = Math.max(...values)
            const maxHeight = canvasHeight - padding.top - padding.bottom - 50;
            const barGap = 60;
            for(let i=0; i < keys.length; i++) {
                const barHeight = maxHeight * (values[i] / valueMax);
                ctx.fillStyle = "#364fc7";
                ctx.fillRect(
                    padding.left + i * unitWidth + barGap / 2, 
                    canvasHeight - padding.bottom - barHeight,
                    unitWidth - barGap,
                    barHeight)

                // Draw the number on top of bar
                ctx.fillStyle = "black"
                ctx.fillText(values[i], 
                    padding.left + (unitWidth * (i + 1)) - (unitWidth / 2), 
                    canvasHeight - padding.bottom - barHeight - 8)
            }
        })
}


window.addEventListener('load', drawBarChart)
