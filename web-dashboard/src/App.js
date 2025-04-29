import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

function App() {
  const [labTests, setLabTests] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    axios.get('http://localhost:3002/labtests')
      .then(response => setLabTests(response.data))
      .catch(error => console.error('Error fetching lab test data:', error));
  }, []);

  const filteredLabTests = labTests.filter(test => {
    const hospitalMatch = selectedHospital ? test.hospital_name === selectedHospital : true;
    const testTypeMatch = selectedTestType ? test.test_type === selectedTestType : true;
    const collectionDate = new Date(test.collection_time);
    const startDateMatch = startDate ? collectionDate >= startDate : true;
    const endDateMatch = endDate ? collectionDate <= endDate : true;
    return hospitalMatch && testTypeMatch && startDateMatch && endDateMatch;
  });

  const slaBreachCount = filteredLabTests.filter(test => test.sla_breach).length;
  const slaOnTimeCount = filteredLabTests.length - slaBreachCount;

  const lineOrBarChartData = {
    labels: filteredLabTests.map(test => new Date(test.collection_time).toLocaleDateString()),
    datasets: [
      {
        label: 'SLA Breach (1 = Breach, 0 = On Time)',
        data: filteredLabTests.map(test => test.sla_breach ? 1 : 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'SLA Breach Trend Over Time' },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutBounce',
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: value => value === 1 ? 'Breach' : (value === 0 ? 'On Time' : ''),
        },
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6,
      },
      line: {
        tension: 0.3,
      }
    }
  };

  const pieChartData = {
    labels: ['Breach', 'On Time'],
    datasets: [
      {
        label: 'SLA Status',
        data: [slaBreachCount, slaOnTimeCount],
        backgroundColor: ['#dc3545', '#198754'],
        hoverOffset: 4,
      },
    ],
  };

  const matrixKeys = [...new Set(filteredLabTests.map(test => `${test.hospital_name} | ${test.test_type}`))];
  const matrixData = {
    labels: matrixKeys,
    datasets: [
      {
        label: 'Test Volume',
        data: matrixKeys.map(key =>
          filteredLabTests.filter(test =>
            `${test.hospital_name} | ${test.test_type}` === key
          ).length
        ),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
    ],
  };

  const matrixOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000 },
  };

  const hospitalRiskScores = {};
  filteredLabTests.forEach(test => {
    if (!hospitalRiskScores[test.hospital_name]) {
      hospitalRiskScores[test.hospital_name] = { breaches: 0, total: 0 };
    }
    if (test.sla_breach) {
      hospitalRiskScores[test.hospital_name].breaches++;
    }
    hospitalRiskScores[test.hospital_name].total++;
  });

  const riskScoreList = Object.entries(hospitalRiskScores).map(([hospital, stats]) => ({
    hospital,
    riskScore: stats.total > 0 ? (stats.breaches / stats.total) * 100 : 0
  })).sort((a, b) => b.riskScore - a.riskScore);

  const mostBreachedHospital = riskScoreList.length > 0 ? riskScoreList[0].hospital : 'N/A';
  const mostPopularTestType = () => {
    const testCounts = {};
    filteredLabTests.forEach(test => {
      testCounts[test.test_type] = (testCounts[test.test_type] || 0) + 1;
    });
    const sorted = Object.entries(testCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'N/A';
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">🌐 Global Lab Test Dashboard</h1>

      {/* KPI Cards */}
      <div className="row text-center mb-5">
        <div className="col-md-4">
          <div className="card bg-primary text-white mb-3">
            <div className="card-body">
              <h5 className="card-title">Total Lab Tests</h5>
              <h3>{filteredLabTests.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white mb-3">
            <div className="card-body">
              <h5 className="card-title">SLA Breach %</h5>
              <h3>
                {filteredLabTests.length > 0
                  ? ((slaBreachCount / filteredLabTests.length) * 100).toFixed(1) + "%"
                  : "0%"}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white mb-3">
            <div className="card-body">
              <h5 className="card-title">Avg Days Since Collection</h5>
              <h3>
                {filteredLabTests.length > 0
                  ? (
                    filteredLabTests.reduce((sum, test) => {
                      const collectionDate = new Date(test.collection_time);
                      const today = new Date();
                      const diff = (today - collectionDate) / (1000 * 3600 * 24);
                      return sum + diff;
                    }, 0) / filteredLabTests.length
                  ).toFixed(1) + " days"
                  : "0 days"}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <select className="form-select" value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)}>
            <option value="">All Hospitals</option>
            {Array.from(new Set(labTests.map(test => test.hospital_name))).map((hospital, index) => (
              <option key={index} value={hospital}>{hospital}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-3">
          <select className="form-select" value={selectedTestType} onChange={(e) => setSelectedTestType(e.target.value)}>
            <option value="">All Test Types</option>
            {Array.from(new Set(labTests.map(test => test.test_type))).map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2 mb-3">
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="form-control" placeholderText="Start Date" />
        </div>
        <div className="col-md-2 mb-3">
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="form-control" placeholderText="End Date" />
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="text-center mb-4">
        <button className="btn btn-outline-secondary" onClick={() => {
          setSelectedHospital('');
          setSelectedTestType('');
          setStartDate(null);
          setEndDate(null);
        }}>
          Clear Filters
        </button>
      </div>

      {/* Chart Switcher */}
      <div className="text-center mb-3">
        <button className="btn btn-info me-2" onClick={() => setChartType('line')}>📈 Line Chart</button>
        <button className="btn btn-warning" onClick={() => setChartType('bar')}>📊 Bar Chart</button>
      </div>

      {/* Dynamic Chart */}
      <div className="mb-5" style={{ height: '450px' }}>
        <h4 className="text-center mb-3">SLA Breach Trend ({chartType.toUpperCase()})</h4>
        {chartType === 'line' ? (
          <Line data={lineOrBarChartData} options={chartOptions} />
        ) : (
          <Bar data={lineOrBarChartData} options={chartOptions} />
        )}
      </div>

      {/* Pie Chart */}
      <div className="mb-5">
        <h4 className="text-center mb-3">SLA Breach Distribution</h4>
        <div className="d-flex justify-content-center">
          <Pie data={pieChartData} />
        </div>
      </div>

      {/* Matrix Bar Chart */}
      <div className="mb-5" style={{ height: '450px' }}>
        <h4 className="text-center mb-3">Test Volume by Hospital and Test Type</h4>
        <Bar data={matrixData} options={matrixOptions} />
      </div>

      {/* Smart Insights */}
      <div className="mb-5">
        <h4 className="text-center mb-4">🔎 Smart Insights</h4>
        <div className="text-center">
          <p><strong>Most Breached Hospital:</strong> {mostBreachedHospital}</p>
          <p><strong>Most Popular Test Type:</strong> {mostPopularTestType()}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-responsive">
        <h4 className="text-center mb-3">Detailed Lab Test Data</h4>
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Hospital</th>
              <th>Test Type</th>
              <th>Collection Time</th>
              <th>SLA Breach</th>
            </tr>
          </thead>
          <tbody>
            {filteredLabTests.map(test => {
              const hospitalStats = hospitalRiskScores[test.hospital_name] || { breaches: 0, total: 0 };
              const breachRate = hospitalStats.total > 0 ? (hospitalStats.breaches / hospitalStats.total) * 100 : 0;
              return (
                <tr key={test.id}>
                  <td>{test.id}</td>
                  <td>
                    {test.hospital_name}{" "}
                    {breachRate > 60 && <span className="badge bg-danger ms-2">🔥 High Risk</span>}
                  </td>
                  <td>{test.test_type}</td>
                  <td>{new Date(test.collection_time).toLocaleString()}</td>
                  <td>
                    {test.sla_breach ? (
                      <span className="badge bg-danger">Breach</span>
                    ) : (
                      <span className="badge bg-success">On Time</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
