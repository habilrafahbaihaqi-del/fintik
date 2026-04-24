import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import { CalendarBlank, TrendUp, TrendDown } from "@phosphor-icons/react";

export default function Statistics({ transactions, formatRupiah }) {
  const today = new Date().toISOString().split("T")[0];
  const [barEndDate, setBarEndDate] = useState(today);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [donutMonth, setDonutMonth] = useState(currentMonth);

  // --- LOGIKA DATA: GRAFIK BATANG ---
  const barChartData = useMemo(() => {
    const data = [];
    const end = new Date(barEndDate);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const displayDate = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });

      const dayTrx = transactions.filter((t) => t.rawDate.startsWith(dateStr));
      const totalIn = dayTrx
        .filter((t) => t.type === "in")
        .reduce((sum, t) => sum + t.rawAmount, 0);
      const totalOut = dayTrx
        .filter((t) => t.type === "out")
        .reduce((sum, t) => sum + t.rawAmount, 0);

      data.push({ date: displayDate, Masuk: totalIn, Keluar: totalOut });
    }
    return data;
  }, [transactions, barEndDate]);

  // --- LOGIKA DATA: CHART DONAT ---
  const { expenseData, incomeData, totalExpense, totalIncome } = useMemo(() => {
    const monthTrx = transactions.filter((t) =>
      t.rawDate.startsWith(donutMonth),
    );
    const expenses = {};
    const incomes = {};
    let tExpense = 0;
    let tIncome = 0;

    monthTrx.forEach((trx) => {
      if (trx.type === "out") {
        expenses[trx.categoryName] =
          (expenses[trx.categoryName] || 0) + trx.rawAmount;
        tExpense += trx.rawAmount;
      } else {
        incomes[trx.categoryName] =
          (incomes[trx.categoryName] || 0) + trx.rawAmount;
        tIncome += trx.rawAmount;
      }
    });

    const formatData = (obj) =>
      Object.keys(obj)
        .map((key) => ({ name: key, value: obj[key] }))
        .sort((a, b) => b.value - a.value);

    return {
      expenseData: formatData(expenses),
      incomeData: formatData(incomes),
      totalExpense: tExpense,
      totalIncome: tIncome,
    };
  }, [transactions, donutMonth]);

  const EXPENSE_COLORS = [
    "#fb7185",
    "#f43f5e",
    "#e11d48",
    "#be123c",
    "#9f1239",
  ];
  const INCOME_COLORS = ["#2dd4bf", "#14b8a6", "#0d9488", "#0f766e", "#115e59"];

  // Fungsi untuk menampilkan angka utuh standar (Contoh: 1.500.000) di atas grafik
  const formatStandardLabel = (val) => {
    if (val === 0) return "";
    return new Intl.NumberFormat("id-ID").format(val);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-xl z-50">
          <p className="font-bold text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm font-semibold mb-1"
            >
              <div
                className="w-3 h-3 rounded-full shadow-inner"
                style={{ backgroundColor: entry.color || entry.payload.fill }}
              />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="text-white ml-auto pl-4">
                {formatRupiah(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2 md:mt-0 pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tighter">
          Statistik
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Analisis arus kas Anda dalam bentuk visual.
        </p>
      </div>

      {/* --- GRAFIK BATANG --- */}
      <section className="bg-slate-900/50 border border-slate-800 p-4 md:p-5 rounded-[32px] mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-white">Arus Kas Harian</h3>
          <div className="relative">
            <CalendarBlank
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="date"
              value={barEndDate}
              onChange={(e) => setBarEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-[10px] sm:text-xs font-bold rounded-xl pl-8 pr-2 py-2 focus:outline-none focus:border-teal-500 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Wadah Grafik yang Diperbaiki (Menggunakan style 100% agar Recharts tidak error) */}
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            {/* Margin diatur ulang: top diperbesar untuk LabelList, left disesuaikan untuk angka jutaan */}
            <BarChart
              data={barChartData}
              margin={{ top: 25, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={1} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={1} />
                  <stop offset="95%" stopColor="#be123c" stopOpacity={1} />
                </linearGradient>
                <filter
                  id="shadow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="4"
                    floodColor="#000000"
                    floodOpacity="0.5"
                  />
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                dy={10}
              />

              {/* YAxis dengan format utuh. Width 65px agar angka panjang seperti '15.000.000' muat */}
              <YAxis
                stroke="#64748b"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                width={65}
                tickFormatter={(val) =>
                  new Intl.NumberFormat("id-ID").format(val)
                }
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#1e293b", opacity: 0.4 }}
              />

              <Bar
                dataKey="Masuk"
                fill="url(#colorIn)"
                radius={[4, 4, 0, 0]}
                filter="url(#shadow)"
              >
                <LabelList
                  dataKey="Masuk"
                  position="top"
                  fill="#2dd4bf"
                  fontSize={8}
                  fontWeight="bold"
                  formatter={formatStandardLabel}
                />
              </Bar>

              <Bar
                dataKey="Keluar"
                fill="url(#colorOut)"
                radius={[4, 4, 0, 0]}
                filter="url(#shadow)"
              >
                <LabelList
                  dataKey="Keluar"
                  position="top"
                  fill="#fb7185"
                  fontSize={8}
                  fontWeight="bold"
                  formatter={formatStandardLabel}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- FILTER BULAN CHART DONAT --- */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-lg font-black text-white">Analisis Kategori</h3>
        <div className="relative">
          <CalendarBlank
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="month"
            value={donutMonth}
            onChange={(e) => setDonutMonth(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-teal-500 [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DONAT: PENGELUARAN */}
        <section className="bg-slate-900/50 border border-slate-800 p-5 rounded-[32px] flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 w-full">
            <div className="bg-rose-500/20 p-2 rounded-lg">
              <TrendDown size={18} className="text-rose-400" weight="bold" />
            </div>
            <h4 className="font-bold text-white">Pengeluaran</h4>
          </div>

          {expenseData.length === 0 ? (
            <p className="text-slate-500 text-sm py-16">
              Tidak ada data bulan ini.
            </p>
          ) : (
            <div className="h-[220px] w-full relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Total
                </span>
                <span className="text-lg font-black text-rose-400">
                  {formatRupiah(totalExpense)}
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter
                      id="pieShadow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="10"
                        stdDeviation="10"
                        floodColor="#000000"
                        floodOpacity="0.6"
                      />
                    </filter>
                  </defs>
                  <Pie
                    data={expenseData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    filter="url(#pieShadow)"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {expenseData.map((entry, index) => {
              const percentage =
                totalExpense > 0
                  ? Math.round((entry.value / totalExpense) * 100)
                  : 0;
              return (
                <div
                  key={index}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 bg-slate-950/50 px-2.5 py-1 rounded-full border border-slate-800"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        EXPENSE_COLORS[index % EXPENSE_COLORS.length],
                    }}
                  ></span>
                  {entry.name}{" "}
                  <span className="text-slate-500">({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* DONAT: PEMASUKAN */}
        <section className="bg-slate-900/50 border border-slate-800 p-5 rounded-[32px] flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 w-full">
            <div className="bg-teal-500/20 p-2 rounded-lg">
              <TrendUp size={18} className="text-teal-400" weight="bold" />
            </div>
            <h4 className="font-bold text-white">Pemasukan</h4>
          </div>

          {incomeData.length === 0 ? (
            <p className="text-slate-500 text-sm py-16">
              Tidak ada data bulan ini.
            </p>
          ) : (
            <div className="h-[220px] w-full relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Total
                </span>
                <span className="text-lg font-black text-teal-400">
                  {formatRupiah(totalIncome)}
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    filter="url(#pieShadow)"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {incomeData.map((entry, index) => {
              const percentage =
                totalIncome > 0
                  ? Math.round((entry.value / totalIncome) * 100)
                  : 0;
              return (
                <div
                  key={index}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 bg-slate-950/50 px-2.5 py-1 rounded-full border border-slate-800"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        INCOME_COLORS[index % INCOME_COLORS.length],
                    }}
                  ></span>
                  {entry.name}{" "}
                  <span className="text-slate-500">({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
