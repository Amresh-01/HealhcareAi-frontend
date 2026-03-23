import { useState } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip, Legend, PieChart, Pie, Cell
} from "recharts";

import { Activity, Heart, Moon, Droplets } from "lucide-react";

// Data
const weeklyHealthData = [
  { day: "Mon", heartRate: 72, steps: 8500, sleep: 7.2, water: 2.1 },
  { day: "Tue", heartRate: 75, steps: 10200, sleep: 6.8, water: 2.4 },
  { day: "Wed", heartRate: 68, steps: 6800, sleep: 7.5, water: 2.0 },
  { day: "Thu", heartRate: 71, steps: 9100, sleep: 8.0, water: 2.5 },
  { day: "Fri", heartRate: 74, steps: 11500, sleep: 6.5, water: 2.2 },
  { day: "Sat", heartRate: 69, steps: 7200, sleep: 8.5, water: 1.8 },
  { day: "Sun", heartRate: 70, steps: 5400, sleep: 9.0, water: 2.3 },
];

const symptomCategories = [
  { name: "Headache", value: 35, color: "#6366f1" },
  { name: "Fatigue", value: 25, color: "#22c55e" },
  { name: "Sleep Issues", value: 20, color: "#f59e0b" },
  { name: "Stress", value: 15, color: "#ec4899" },
];

// ======================
// 🔹 MAIN CHART
// ======================
export function HealthInsightsChart() {
  const [tab, setTab] = useState("heartRate");

  return (
    <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
      <h2>Health Insights</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["heartRate", "steps", "sleep", "water"].map((t) => (
          <button key={t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Heart Rate */}
      {tab === "heartRate" && (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={weeklyHealthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Area dataKey="heartRate" stroke="#ef4444" fill="#fecaca" />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Steps */}
      {tab === "steps" && (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyHealthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="steps" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Sleep */}
      {tab === "sleep" && (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={weeklyHealthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Area dataKey="sleep" stroke="#8b5cf6" fill="#ddd6fe" />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Water */}
      {tab === "water" && (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyHealthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="water" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ======================
// 🔹 PIE CHART
// ======================
export function SymptomDistributionChart() {
  return (
    <div style={{ border: "1px solid #ccc", padding: 20, marginTop: 20 }}>
      <h3>Symptom Distribution</h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={symptomCategories} dataKey="value">
            {symptomCategories.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ======================
// 🔹 LINE CHART
// ======================
export function MonthlyTrendsChart() {
  const data = [
    { week: "W1", steps: 7800, sleep: 7.2 },
    { week: "W2", steps: 8200, sleep: 7.5 },
    { week: "W3", steps: 8900, sleep: 7.8 },
    { week: "W4", steps: 9500, sleep: 8.0 },
  ];

  return (
    <div style={{ border: "1px solid #ccc", padding: 20, marginTop: 20 }}>
      <h3>Monthly Trends</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line dataKey="steps" stroke="#3b82f6" />
          <Line dataKey="sleep" stroke="#8b5cf6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}