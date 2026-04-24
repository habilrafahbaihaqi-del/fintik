import { useState } from "react";
import {
  MagnifyingGlass,
  ArrowDownRight,
  ArrowUpRight,
  Tag,
  Clock,
  CalendarBlank,
} from "@phosphor-icons/react";

export default function History({ transactions, loading, formatRupiah }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredTransactions = transactions.filter((trx) => {
    const matchSearch =
      trx.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchDate = true;
    if (startDate && endDate) {
      const trxDate = new Date(trx.rawDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchDate = trxDate >= start && trxDate <= end;
    }

    return matchSearch && matchDate;
  });

  const groupedTransactions = filteredTransactions.reduce((acc, trx) => {
    if (!acc[trx.date]) acc[trx.date] = [];
    acc[trx.date].push(trx);
    return acc;
  }, {});

  const getRelativeDate = (dateString) => {
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterday = yesterdayObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    if (dateString === today) return "Hari Ini";
    if (dateString === yesterday) return "Kemarin";
    return dateString;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2 md:mt-0">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tighter">
          Riwayat
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Lacak semua aktivitas keuanganmu di sini.
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-4 md:p-5 rounded-[24px] mb-8 space-y-4">
        <div className="relative">
          <MagnifyingGlass
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
          />
        </div>

        {/* Filter Tanggal dirapikan untuk Mobile */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <CalendarBlank
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hidden sm:block"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2 sm:pl-9 py-3 focus:outline-none focus:border-teal-500/50 transition-colors text-[10px] sm:text-xs [color-scheme:dark]"
            />
          </div>
          <span className="text-slate-600 font-bold text-sm">-</span>
          <div className="flex-1 relative">
            <CalendarBlank
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hidden sm:block"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2 sm:pl-9 py-3 focus:outline-none focus:border-teal-500/50 transition-colors text-[10px] sm:text-xs [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-600 py-10 animate-pulse font-bold tracking-widest uppercase text-xs">
          Menarik Data Riwayat...
        </p>
      ) : Object.keys(groupedTransactions).length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-500 font-medium text-sm">
            Tidak ada transaksi yang ditemukan.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedTransactions).map((dateStr) => (
            <div
              key={dateStr}
              className="animate-in fade-in zoom-in-95 duration-500"
            >
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2 border-b border-slate-800/50 pb-2">
                {getRelativeDate(dateStr)}
              </h4>
              <div className="space-y-4">
                {groupedTransactions[dateStr].map((trx) => (
                  <div
                    key={trx.id}
                    className="flex justify-between items-center bg-slate-900/30 backdrop-blur-xl border border-slate-800/40 p-4 rounded-3xl hover:bg-slate-900/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${trx.type === "in" ? "bg-teal-500/10 text-teal-400" : "bg-rose-500/10 text-rose-400"}`}
                      >
                        {trx.type === "in" ? (
                          <ArrowDownRight size={24} weight="duotone" />
                        ) : (
                          <ArrowUpRight size={24} weight="duotone" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 mb-0.5">
                          {trx.name}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                            <Tag size={12} weight="fill" /> {trx.categoryName}
                          </span>
                          <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                            <Clock size={12} weight="bold" /> {trx.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p
                      className={`font-black tracking-tight text-lg ${trx.type === "in" ? "text-teal-400" : "text-white"}`}
                    >
                      {trx.formattedAmount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
