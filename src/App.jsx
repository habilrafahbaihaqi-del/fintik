import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./pages/Auth"; // <-- Import Auth Baru
import History from "./pages/History";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import {
  HouseLine,
  Receipt,
  ChartPieSlice,
  GearSix,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  X,
  CaretDown,
  Tag,
  Clock,
  User,
} from "@phosphor-icons/react";

export default function App() {
  // STATE AUTENTIKASI
  const [session, setSession] = useState(null);

  const [currentPath, setCurrentPath] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "pengeluaran",
    category_id: "",
  });

  // CEK SESI LOGIN SAAT APLIKASI DIMUAT
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // HANYA TARIK DATA JIKA ADA SESI (USER SUDAH LOGIN)
  useEffect(() => {
    if (session) {
      fetchInitialData();
    }
  }, [session]);

  async function fetchInitialData() {
    setLoading(true);
    await Promise.all([fetchTransactions(), fetchCategories()]);
    setLoading(false);
  }

  // ... (FUNGSI FETCH DAN INSERT TETAP SAMA SEPERTI SEBELUMNYA) ...
  async function fetchTransactions() {
    const { data } = await supabase
      .from("transactions")
      .select(`*, categories (name, icon, color)`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      const formatted = data.map((trx) => {
        const dateObj = new Date(trx.created_at);
        return {
          id: trx.id,
          name: trx.description,
          categoryName: trx.categories?.name || "Umum",
          rawAmount: Number(trx.amount),
          formattedAmount:
            trx.type === "pemasukan"
              ? `+Rp ${Number(trx.amount).toLocaleString("id-ID")}`
              : `-Rp ${Number(trx.amount).toLocaleString("id-ID")}`,
          date: dateObj.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          time: dateObj.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          type: trx.type === "pemasukan" ? "in" : "out",
          rawDate: trx.created_at,
        };
      });
      setTransactions(formatted);
    }
  }

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("*");
    if (data) setCategories(data);
  }

  async function handleAddTransaction(e) {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category_id)
      return;
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("transactions").insert([
        {
          amount: parseFloat(formData.amount),
          description: formData.description,
          type: formData.type,
          category_id: formData.category_id,
          // user_id: session.user.id <-- Nanti ini diaktifkan jika RLS Database sudah mengunci per user
        },
      ]);
      if (error) throw error;
      setIsModalOpen(false);
      setFormData({
        amount: "",
        description: "",
        type: "pengeluaran",
        category_id: "",
      });
      fetchTransactions();
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type,
  );
  const totalIn = transactions
    .filter((t) => t.type === "in")
    .reduce((acc, curr) => acc + curr.rawAmount, 0);
  const totalOut = transactions
    .filter((t) => t.type === "out")
    .reduce((acc, curr) => acc + curr.rawAmount, 0);
  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  // --- RENDER HALAMAN ---
  // JIKA BELUM LOGIN, TAMPILKAN HALAMAN AUTH
  if (!session) {
    return <Auth />;
  }

  // AMBIL DATA PROFIL DARI SESI SUPABASE DENGAN SANGAT AMAN
  const userData = session?.user?.user_metadata || {};
  const displayPhoto = userData?.avatar_url || "";
  const displayName =
    userData?.full_name || session?.user?.email?.split("@")[0] || "User";

  const TransactionCard = ({ trx }) => (
    <div
      key={trx.id}
      className="flex justify-between items-center bg-slate-900/30 backdrop-blur-xl border border-slate-800/40 p-4 rounded-3xl hover:bg-slate-900/60 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${trx.type === "in" ? "bg-teal-500/10 text-teal-400" : "bg-red-500/10 text-red-400"}`}
        >
          {trx.type === "in" ? (
            <ArrowDownRight size={24} weight="duotone" />
          ) : (
            <ArrowUpRight size={24} weight="duotone" />
          )}
        </div>
        <div>
          <p className="font-bold text-slate-100 mb-0.5">{trx.name}</p>
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
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 p-6 z-10">
        <h1 className="text-2xl font-black text-teal-400 mb-10 tracking-wide">
          Fintik.
        </h1>
        <nav className="flex flex-col gap-4">
          <button
            onClick={() => setCurrentPath("dashboard")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${currentPath === "dashboard" ? "bg-teal-500/10 text-teal-400" : "text-slate-400 hover:text-slate-100"}`}
          >
            <HouseLine
              size={24}
              weight={currentPath === "dashboard" ? "fill" : "duotone"}
            />
            <span className="font-bold">Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentPath("history")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${currentPath === "history" ? "bg-teal-500/10 text-teal-400" : "text-slate-400 hover:text-slate-100"}`}
          >
            <Receipt
              size={24}
              weight={currentPath === "history" ? "fill" : "duotone"}
            />
            <span className="font-bold">Riwayat</span>
          </button>
          <button
            onClick={() => setCurrentPath("statistics")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${currentPath === "statistics" ? "bg-teal-500/10 text-teal-400" : "text-slate-400 hover:text-slate-100"}`}
          >
            <ChartPieSlice
              size={24}
              weight={currentPath === "statistics" ? "fill" : "duotone"}
            />
            <span className="font-bold">Statistik</span>
          </button>
          <button
            onClick={() => setCurrentPath("settings")}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all mt-auto ${currentPath === "settings" ? "bg-teal-500/10 text-teal-400" : "text-slate-400 hover:text-slate-100"}`}
          >
            <GearSix
              size={24}
              weight={currentPath === "settings" ? "fill" : "duotone"}
            />
            <span className="font-bold">Pengaturan</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto pb-28 md:pb-6 p-6 md:p-10 relative">
        {/* HEADER */}
        <header
          className={`flex justify-between items-center ${currentPath === "dashboard" ? "mb-8" : "mb-2 md:mb-8"}`}
        >
          <div
            className={`${currentPath === "dashboard" ? "flex items-center gap-4" : "hidden md:flex items-center gap-4 opacity-0 pointer-events-none"}`}
          >
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Profil"
                className="w-12 h-12 rounded-full border-2 border-slate-800 object-cover shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                <User size={24} className="text-slate-400" weight="duotone" />
              </div>
            )}
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Selamat sore,
              </p>
              <h2 className="text-2xl font-black text-white">{displayName}</h2>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 px-6 rounded-2xl transition-all shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <Plus size={20} weight="bold" />
            <span>Transaksi</span>
          </button>
        </header>

        {/* VIEW ROUTER */}
        {currentPath === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-gradient-to-br from-teal-500 to-emerald-700 rounded-[32px] p-7 shadow-[0_20px_50px_rgba(45,212,191,0.25)] border-t border-white/20 mb-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
              <p className="text-teal-50/80 text-sm mb-1 font-bold tracking-wide uppercase">
                Saldo Saat Ini
              </p>
              <h3 className="text-4xl font-black text-white mb-8 tracking-tighter">
                {loading ? "..." : formatRupiah(totalIn - totalOut)}
              </h3>
              <div className="flex gap-4">
                <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                    <ArrowDownRight
                      size={18}
                      weight="bold"
                      className="text-white"
                    />
                  </div>
                  <p className="text-[10px] font-black uppercase text-teal-100/60 mb-1">
                    Masuk
                  </p>
                  <p className="text-sm font-bold text-white truncate">
                    {formatRupiah(totalIn)}
                  </p>
                </div>
                <div className="flex-1 bg-gradient-to-br from-rose-500/10 to-red-600/5 backdrop-blur-md rounded-2xl p-4 border border-rose-500/20">
                  <div className="bg-rose-500/20 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                    <ArrowUpRight
                      size={18}
                      weight="bold"
                      className="text-rose-400"
                    />
                  </div>
                  <p className="text-[10px] font-black uppercase text-rose-200/60 mb-1">
                    Keluar
                  </p>
                  <p className="text-sm font-bold text-white truncate">
                    {formatRupiah(totalOut)}
                  </p>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-lg font-black text-slate-100 tracking-tight mb-6">
                Transaksi Terakhir
              </h3>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-slate-600 py-10 animate-pulse font-bold tracking-widest uppercase text-xs">
                    Singkronisasi Data...
                  </p>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-slate-500 py-4 font-medium">
                    Belum ada transaksi.
                  </p>
                ) : (
                  transactions
                    .slice(0, 5)
                    .map((trx) => <TransactionCard key={trx.id} trx={trx} />)
                )}
              </div>
            </section>
          </div>
        )}

        {currentPath === "history" && (
          <History
            transactions={transactions}
            loading={loading}
            formatRupiah={formatRupiah}
          />
        )}
        {currentPath === "statistics" && (
          <Statistics transactions={transactions} formatRupiah={formatRupiah} />
        )}
        {currentPath === "settings" && (
          <Settings
            categories={categories}
            fetchCategories={fetchCategories}
            userSession={session}
          />
        )}

        {currentPath !== "settings" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="md:hidden fixed bottom-28 right-6 bg-teal-500 text-slate-950 p-4 rounded-[24px] shadow-[0_20px_40px_rgba(45,212,191,0.3)] active:scale-90 transition-all z-40 ring-4 ring-slate-950"
          >
            <Plus size={32} weight="bold" />
          </button>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-slate-950/80 backdrop-blur-2xl border-t border-slate-900/50 flex justify-around items-center p-4 pb-10 z-50">
        <button
          onClick={() => setCurrentPath("dashboard")}
          className="flex flex-col items-center transition-all active:scale-90"
        >
          <HouseLine
            size={30}
            weight={currentPath === "dashboard" ? "fill" : "duotone"}
            className={
              currentPath === "dashboard" ? "text-teal-400" : "text-slate-600"
            }
          />
        </button>
        <button
          onClick={() => setCurrentPath("history")}
          className="flex flex-col items-center transition-all active:scale-90"
        >
          <Receipt
            size={30}
            weight={currentPath === "history" ? "fill" : "duotone"}
            className={
              currentPath === "history" ? "text-teal-400" : "text-slate-600"
            }
          />
        </button>
        <button
          onClick={() => setCurrentPath("statistics")}
          className="flex flex-col items-center transition-all active:scale-90"
        >
          <ChartPieSlice
            size={30}
            weight={currentPath === "statistics" ? "fill" : "duotone"}
            className={
              currentPath === "statistics" ? "text-teal-400" : "text-slate-600"
            }
          />
        </button>
        <button
          onClick={() => setCurrentPath("settings")}
          className="flex flex-col items-center transition-all active:scale-90"
        >
          <GearSix
            size={30}
            weight={currentPath === "settings" ? "fill" : "duotone"}
            className={
              currentPath === "settings" ? "text-teal-400" : "text-slate-600"
            }
          />
        </button>
      </nav>

      {/* MODAL POPUP */}
      {/* ... (SISA KODE MODAL TAMBAH TRANSAKSI TETAP SAMA) ... */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 p-8 rounded-t-[40px] md:rounded-[40px] w-full max-w-lg shadow-2xl relative animate-in slide-in-from-bottom-20 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 md:hidden opacity-50"></div>
            <h3 className="text-2xl font-black text-white mb-8 tracking-tighter">
              Input Keuangan
            </h3>

            <form onSubmit={handleAddTransaction} className="space-y-6">
              <div className="flex bg-slate-950 p-1.5 rounded-[20px] border border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      type: "pengeluaran",
                      category_id: "",
                    })
                  }
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${formData.type === "pengeluaran" ? "bg-rose-500/20 text-rose-400 shadow-lg" : "text-slate-600"}`}
                >
                  Keluar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      type: "pemasukan",
                      category_id: "",
                    })
                  }
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${formData.type === "pemasukan" ? "bg-teal-500/20 text-teal-400 shadow-lg" : "text-slate-600"}`}
                >
                  Masuk
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">
                  Nominal (IDR)
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full bg-slate-950 border-2 border-slate-800 text-white font-black text-2xl rounded-2xl px-6 py-4 focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-900"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">
                    Kategori
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border-2 border-slate-800 text-slate-200 font-bold rounded-2xl px-4 py-4 appearance-none focus:outline-none focus:border-teal-500/50 transition-all cursor-pointer text-sm"
                    >
                      <option value="" disabled>
                        Pilih...
                      </option>
                      {filteredCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <CaretDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">
                    Catatan
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-slate-950 border-2 border-slate-800 text-slate-200 font-bold rounded-2xl px-4 py-4 focus:outline-none focus:border-teal-500/50 transition-all text-sm"
                    placeholder="Makan malam..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-[0.25em] py-5 rounded-2xl shadow-xl shadow-teal-500/30 active:scale-95 transition-all disabled:opacity-50 mt-4"
              >
                {isSubmitting ? "Syncing..." : "Simpan Transaksi"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
