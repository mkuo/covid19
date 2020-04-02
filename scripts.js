// parse csv file, including date column
const parseCsv = async (fileName) => {
    return new Promise(resolve => {
        Papa.parse(fileName, {
            header: true,
            download: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: results => {
                results.data.forEach(d => {
                    d.date = moment(d.date, 'YYYY-MM-DD')
                });
                resolve(results.data);
            }
        });
    });
};

// populate data in table
const populateTable = (data) => {
    data.sort((a, b) => {
        return b.date - a.date
    })
    data.forEach((d, idx) => {
        // add color for striped rows
        const background = idx % 2 == 0 ? 'bg-light' : 'bg-white'
        const tableRef = document.getElementById('data-table').
            getElementsByTagName('tbody')[0];
        const newRow = tableRef.insertRow(tableRef.rows.length);
        newRow.classList.add(background)
        const html =
            `<td>${moment(d.date).format('ddd M/D')}</td>` +
            `<td>${d.new_cases}</td>` +
            `<td>${d.new_deaths}</td>` +
            `<td>${d.total_cases}</td>` +
            `<td>${d.total_deaths}</td>`
        newRow.innerHTML = html;
    });
};

const chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

const drawChart = (element, y0, y1, data) => {
    var xValues = []
    var y0Values = []
    var y1Values = []
    data.forEach(d => {
        xValues.push(d.date)
        y0Values.push(d[y0])
        y1Values.push(d[y1])
    })

    const y0Label = y0.replace('_', ' ')
    const y1Label = y1.replace('_', ' ')

    const lineChartData = {
        labels: xValues,
        datasets: [{
            label: y0Label,
            borderColor: chartColors.red,
            backgroundColor: chartColors.red,
            fill: false,
            data: y0Values,
            yAxisID: 'y-axis-0',
        }, {
            label: y1Label,
            borderColor: chartColors.blue,
            backgroundColor: chartColors.blue,
            fill: false,
            data: y1Values,
            yAxisID: 'y-axis-2'
        }]
    };

    const ctx = document.getElementById(element).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: lineChartData,
        options: {
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            title: { display: false },
            legend: { display: false },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        tooltipFormat: 'ddd M/D'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'date'
                    }
                }],
                yAxes: [{
                    type: 'linear',
                    display: true,
                    position: 'left',
                    id: 'y-axis-0',
                    ticks: { fontColor: chartColors.red },
                    scaleLabel: {
                        display: true,
                        fontColor: chartColors.red,
                        labelString: y0Label
                    }
                }, {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    gridLines: { drawOnChartArea: false },
                    ticks: { fontColor: chartColors.blue },
                    scaleLabel: {
                        display: true,
                        fontColor: chartColors.blue,
                        labelString: y1Label
                    }
                }],
            }
        }
    });
};

const updateLastUpdated = (data) => {
    const maxDate = moment.max(
        data.map(d => { return d.date })
    );
    const formattedDate = moment(maxDate).format('dddd, LL');
    const html = `<p class="my-0 text-muted">Last updated ${formattedDate}</p>`;
    const headline = document.getElementById('headline');
    headline.insertAdjacentHTML('afterend', html);
}

// populate data from csv to webpage
const populateCsv = async (fileName) => {
    const data = await parseCsv(fileName);
    updateLastUpdated(data);
    drawChart('chart-cases', 'total_cases', 'new_cases', data);
    drawChart('chart-deaths', 'total_deaths', 'new_deaths', data);
    populateTable(data);
}

// run javascript after page loads
window.onload = () => {
    populateCsv('san-francisco.csv');
};
