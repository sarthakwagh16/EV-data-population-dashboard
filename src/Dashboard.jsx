import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Bar, Line, Pie } from 'react-chartjs-2'; 
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js'; 
import { CircularProgress, Grid, Paper, Typography, Box } from '@mui/material'; 
import './dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [lineChartData, setLineChartData] = useState({});
  const [trendChartData, setTrendChartData] = useState({});
  const [pieChartData, setPieChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse('/data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setData(result.data);

        const makes = result.data.map(item => item.Make);
        const makeCount = makes.reduce((acc, make) => {
          acc[make] = (acc[make] || 0) + 1;
          return acc;
        }, {});

        const barData = {
          labels: Object.keys(makeCount),
          datasets: [
            {
              label: 'Number of Electric Vehicles',
              data: Object.values(makeCount),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
          height: 250,
          width: 250,
        };
        setChartData(barData);

        const modelYears = Array.from(new Set(result.data.map(item => item['Model Year'])));
        const rangeByYear = modelYears.map(year => {
          const evsInYear = result.data.filter(item => item['Model Year'] === year);
          const averageRange = evsInYear.reduce((sum, ev) => sum + ev['Electric Range'], 0) / evsInYear.length;
          return averageRange;
        });

        const lineData = {
          labels: modelYears,
          datasets: [
            {
              label: 'Average Electric Range by Year',
              data: rangeByYear,
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
              tension: 0.1,
            },
          ],
        };
        setLineChartData(lineData);

        const vehicleTypeByYear = result.data.reduce((acc, item) => {
          const year = item['Model Year'];
          const type = item['Electric Vehicle Type'];
          if (!acc[year]) {
            acc[year] = {};
          }
          acc[year][type] = (acc[year][type] || 0) + 1;
          return acc;
        }, {});

        const trendYears = Object.keys(vehicleTypeByYear).sort();
        const vehicleTypes = Array.from(new Set(result.data.map(item => item['Electric Vehicle Type'])));

        const trendData = {
          labels: trendYears,
          datasets: vehicleTypes.map(type => ({
            label: type,
            data: trendYears.map(year => vehicleTypeByYear[year][type] || 0),
            fill: false,
            borderColor: getRandomColor(),
            tension: 0.1,
          })),
        };
        setTrendChartData(trendData);

        const vehicleTypesCount = result.data.reduce((acc, item) => {
          const type = item['Electric Vehicle Type'];
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        const pieData = {
          labels: Object.keys(vehicleTypesCount),
          datasets: [
            {
              label: 'Electric Vehicle Type Distribution',
              data: Object.values(vehicleTypesCount),
              backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
              ],
              borderWidth: 1,
            },
          ],
        };
        setPieChartData(pieData);

        setLoading(false);
      },
      error: (err) => {
        console.error('Error parsing CSV:', err);
        setLoading(false);
      },
    });
  }, []);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  if (loading) {
    return <CircularProgress />;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    height: 250,
    width: 250,
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
    aspectRatio: 2, 
    height: 250,
    width: 250,
  };

  return (
    <Box sx={{ padding: '10px', color: 'info.primary',  bgcolor: 'text.disabled'}}>
      <Typography variant="h4" gutterBottom align="center" fontFamily={'Monospace'}>
        Electric Vehicle Population Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom align="center">
              EV Distribution by Make
            </Typography>
            <Bar data={chartData} options={chartOptions} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom align="center">
              Average Electric Range by Model Year
            </Typography>
            <Line data={lineChartData} options={chartOptions} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom align="center">
              Trend of Electric Vehicle Types by Year
            </Typography>
            <Line data={trendChartData} options={chartOptions} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <Paper elevation={3} sx={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom align="center">
              Distribution of Electric Vehicle Types
            </Typography>
            <Pie data={pieChartData} options={pieChartOptions} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
