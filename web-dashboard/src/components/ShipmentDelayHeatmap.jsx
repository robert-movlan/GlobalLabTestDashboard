import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ShipmentDelayHeatmap = () => {
  const [shipmentData, setShipmentData] = useState([]);

  useEffect(() => {
    fetch("/data/shipment_delay.json")
      .then((res) => res.json())
      .then((data) => setShipmentData(data));
  }, []);

  const chartData = {
    labels: shipmentData.map((d) => d.shipment_id),
    datasets: [
      {
        label: "Delay Risk (%)",
        data: shipmentData.map((d) => d.predicted_delay_risk * 100),
        backgroundColor: shipmentData.map((d) => {
          if (d.predicted_delay_risk > 0.75) return "red";
          if (d.predicted_delay_risk > 0.4) return "orange";
          return "green";
        }),
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const shipment = shipmentData[index];
            return [
              `Risk: ${Math.round(shipment.predicted_delay_risk * 100)}%`,
              `Carrier: ${shipment.carrier}`,
              `Region: ${shipment.region}`,
              `Product: ${shipment.product}`,
              `Expected: ${shipment.expected_delivery}`,
              `Actual: ${shipment.actual_delivery}`,
              `Delayed: ${shipment.actual_delay ? "Yes" : "No"}`
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Delay Risk (%)",
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "auto" }}>
      <h2>📦 Shipment Delay Risk Analysis</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ShipmentDelayHeatmap;
