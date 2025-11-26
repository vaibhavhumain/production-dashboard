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
  const [summary, setSummary] = useState({
    date: "",
    manpower: "",
    drivers: "",
    supervisors: "",
  });

  const [page, setPage] = useState(0);
  const pageSize = 20;

  const [view, setView] = useState<"Normal" | "Ascending" | "Descending">(
    "Normal"
  );

  // Format today EXACTLY like Sheet → 26-11-2025
  const getToday = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // BUS DATA SHEET
  const API_URL =
    "https://opensheet.elk.sh/1PiArZhuPYdslTQzdxMLvrFGh-Jsa5LLVs2P8_Kc9--I/Sheet1";

  // MANPOWER DAILY SUMMARY SHEET
  const SUMMARY_URL =
    "https://opensheet.elk.sh/1PiArZhuPYdslTQzdxMLvrFGh-Jsa5LLVs2P8_Kc9--I/Sheet1";


  // Load saved view on first render
  useEffect(() => {
    const saved = localStorage.getItem("gc_view");
    if (saved) setView(saved as any);
  }, []);

  // Save view preference
  useEffect(() => {
    localStorage.setItem("gc_view", view);
  }, [view]);

  // Load both sheets every 20 seconds
  useEffect(() => {
    loadData();
    loadSummary();

    const interval = setInterval(() => {
      loadData();
      loadSummary();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // LOAD BUS DATA
  const loadData = async () => {
    try {
      const res = await axios.get<BusSheetRow[]>(API_URL);
      setRawData(res.data);
    } catch (err) {
      console.error("Error loading bus sheet", err);
    }
  };

  // LOAD MANPOWER SUMMARY
  const loadSummary = async () => {
    try {
      const res = await axios.get<any[]>(SUMMARY_URL);
      const today = getToday();

      const row = res.data.find((r) => String(r["DATE"]).trim() === today);

      if (row) {
        setSummary({
          date: row["DATE"] || today,
          manpower: row["MANPOWER PRESENT"] || "0",
          drivers: row["DRIVERS PRESENT"] || "0",
          supervisors: row["SUPERVISORS PRESENT"] || "0",
        });
      } else {
        setSummary({
          date: today,
          manpower: "Not Found",
          drivers: "Not Found",
          supervisors: "Not Found",
        });
      }
    } catch (err) {
      console.error("Error loading summary", err);
    }
  };

  // CLEAN NUMBER
  const getNumber = (value?: string) => {
    if (!value) return 0;
    return parseFloat(String(value).replace("%", ""));
  };

  // SORT LOGIC
  const sortedData = [...rawData].sort((a, b) => {
    const A = getNumber(a["TOTAL BUS WORK"]);
    const B = getNumber(b["TOTAL BUS WORK"]);

    if (view === "Ascending") return A - B;
    if (view === "Descending") return B - A;
    return 0;
  });

  // WORK STATUS COLOR
  const getWorkStatus = (row: any) => {
    const key = Object.keys(row).find(
      (k) =>
        typeof row[k] === "string" &&
        ["yes", "no"].includes(row[k].trim().toLowerCase())
    );
    if (!key) return "no";
    return row[key].trim().toLowerCase();
  };

  // Pagination Slice
  const visibleData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  // CHART DATA
  const chartData = {
    labels: visibleData.map((d) => d["Chassi Name"]),
    datasets: [
      {
        label: "Total Work Done (%)",
        data: visibleData.map((d) => getNumber(d["TOTAL BUS WORK"])),
        backgroundColor: visibleData.map((d) =>
          getWorkStatus(d) === "yes"
            ? "rgba(34,197,94,0.8)" // green
            : "rgba(239,68,68,0.8)" // red
        ),
        borderColor: visibleData.map((d) =>
          getWorkStatus(d) === "yes"
            ? "rgba(21,128,61,1)"
            : "rgba(185,28,28,1)"
        ),
        borderWidth: 1,
      },
    ],
  };

return (
  <div className="max-w mx-auto px-6 py-10">
    {/* HEADER ROW: Logout, Total Buses, Manpower Summary */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      {/* Logout Button */}
      <button
        onClick={() => {
          window.location.href = "/login";
        }}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold shadow"
      >
        Logout
      </button>

      {/* Total Buses in Production */}
      <div className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow font-semibold text-lg">
        Total Buses in Production: {sortedData.length}
      </div>

      {/* Manpower Summary Card */}
      <div className="px-5 py-3 bg-black text-white rounded-xl shadow font-semibold text-md">
        <div>Date: {summary.date}</div>
        <div>Manpower Present: {summary.manpower}</div>
        <div>Drivers Present: {summary.drivers}</div>
        <div>Supervisors Present: {summary.supervisors}</div>
      </div>
    </div>

    {/* DASHBOARD CARD */}
    <div className="card shadow-xl p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Gobind Coach Production Dashboard
      </h1>

      {/* View Selector */}
      <div className="mb-6">
        <label className="mr-4 font-semibold text-lg">Select View:</label>
        <select
          value={view}
          onChange={(e) => setView(e.target.value as any)}
          className="px-4 py-2 border rounded-lg bg-white text-black shadow-sm"
        >
          <option value="Normal">Normal Order</option>
          <option value="Ascending">Ascending (Low → High)</option>
          <option value="Descending">Descending (High → Low)</option>
        </select>
      </div>

      {/* Chart */}
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
                font: { weight: "bold", size: 12 },
                formatter: (value: number) => value + "%",
              },
            },
            scales: {
              y: { beginAtZero: true, max: 100 },
            },
          }}
        />
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className={`px-4 py-2 rounded-lg text-white font-semibold 
            ${page === 0 ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          Previous
        </button>

        <button
          disabled={(page + 1) * pageSize >= sortedData.length}
          onClick={() => setPage(page + 1)}
          className={`px-4 py-2 rounded-lg text-white font-semibold 
            ${(page + 1) * pageSize >= sortedData.length
              ? "bg-gray-400"
              : "bg-green-600 hover:bg-green-700"}`}
        >
          Next
        </button>
      </div>
    </div>
  </div>
);
}
