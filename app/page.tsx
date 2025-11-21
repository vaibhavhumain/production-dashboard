"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface BusSheetRow {
  ["Chassi Name"]: string;
  ["TOTAL BUS WORK"]?: string;
  [key: string]: any;
}

export default function Dashboard() {
  const [rawData, setRawData] = useState<BusSheetRow[]>([]);
  const [view, setView] = useState<"Normal" | "Ascending" | "Descending">(
    "Normal"
  );

  const API_URL =
    "https://opensheet.elk.sh/1PiArZhuPYdslTQzdxMLvrFGh-Jsa5LLVs2P8_Kc9--I/Sheet1";

  useEffect(() => {
    const savedView = localStorage.getItem("gc_view");
    if (savedView) {
      setView(savedView as "Normal" | "Ascending" | "Descending");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("gc_view", view);
  }, [view]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await axios.get<BusSheetRow[]>(API_URL);
      setRawData(res.data);
    } catch (err) {
      console.error("Error loading sheet", err);
    }
  };

  const getNumber = (value?: string) => {
    if (!value) return 0;
    return parseFloat(String(value).replace("%", ""));
  };

  const sortedData = [...rawData].sort((a, b) => {
    const A = getNumber(a["TOTAL BUS WORK"]);
    const B = getNumber(b["TOTAL BUS WORK"]);
    if (view === "Ascending") return A - B;
    if (view === "Descending") return B - A;
    return 0;
  });

  const chartData = {
    labels: sortedData.map((d) => d["Chassi Name"]),
    datasets: [
      {
        label: "Total Work Done (%)",
        data: sortedData.map((d) => getNumber(d["TOTAL BUS WORK"])),
        backgroundColor: "#3b82f6",
        borderColor: "#1d4ed8",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w mx-auto px-6 py-10">
      <div className="card shadow-xl p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Gobind Coach Production Dashboard
        </h1>

        <div className="mb-6">
          <label className="mr-4 font-semibold text-lg">Select View:</label>

          <select
            value={view}
            onChange={(e) =>
              setView(e.target.value as "Normal" | "Ascending" | "Descending")
            }
            className="px-4 py-2 border rounded-lg bg-white text-black shadow-sm"
          >
            <option value="Normal">Normal Order</option>
            <option value="Ascending">Ascending (Low → High)</option>
            <option value="Descending">Descending (High → Low)</option>
          </select>
        </div>

        <div className="w-full h-[500px] bg-white rounded-xl p-4 shadow-md">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                datalabels: {
                  anchor: "end",
                  align: "top",
                  color: "#000",
                  font: {
                    weight: "bold",
                    size: 12,
                  },
                  formatter: (value: number) => value + "%",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
