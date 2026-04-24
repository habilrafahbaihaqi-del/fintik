import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  EnvelopeSimple,
  LockKey,
  GoogleLogo,
  ChartLineUp,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Data Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Visibilitas Password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fungsi validasi menggunakan Regex
  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(pwd);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validasi Khusus Pendaftaran
    if (!isLogin) {
      if (password !== confirmPassword) {
        alert(
          "Kata sandi dan verifikasi kata sandi tidak cocok. Silakan periksa kembali.",
        );
        return;
      }
      if (!validatePassword(password)) {
        alert(
          "Kata sandi harus minimal 8 karakter, serta mengandung kombinasi huruf, angka, dan karakter spesial/simbol.",
        );
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Proses Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Proses Register
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        alert(
          "Pendaftaran berhasil! Silakan login menggunakan akun yang baru saja dibuat.",
        );
        setIsLogin(true);
        // Reset password fields setelah daftar
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Efek Latar Belakang */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-slate-800 p-8 rounded-[40px] shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center justify-center mb-6">
          {/* Logo Gambar Anda */}
          <img
            src="/logo.png"
            alt="Fintik Logo"
            className="w-24 h-24 object-contain drop-shadow-[0_10px_20px_rgba(45,212,191,0.3)] mb-4"
          />
          {/* Teks Logo */}
          <h1 className="text-4xl font-black text-white text-center tracking-tighter">
            Fintik.
          </h1>
        </div>
        <p className="text-slate-400 text-center text-sm font-medium mb-8">
          {isLogin
            ? "Selamat datang kembali!"
            : "Mulai atur keuanganmu hari ini."}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Input Nama (Hanya muncul saat Daftar) */}
          {!isLogin && (
            <div className="relative animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-4 pr-4 py-3.5 focus:outline-none focus:border-teal-500 transition-colors text-sm"
                placeholder="Nama Panggilan"
              />
            </div>
          )}

          <div className="relative">
            <EnvelopeSimple
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-teal-500 transition-colors text-sm"
              placeholder="Email Anda"
            />
          </div>

          {/* Input Password dengan Toggle Mata */}
          <div className="relative">
            <LockKey
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-12 pr-12 py-3.5 focus:outline-none focus:border-teal-500 transition-colors text-sm"
              placeholder="Kata Sandi"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
            </button>
          </div>

          {/* Konfirmasi Password & Teks Bantuan (Hanya muncul saat Daftar) */}
          {!isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="relative">
                <LockKey
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-12 pr-12 py-3.5 focus:outline-none focus:border-teal-500 transition-colors text-sm"
                  placeholder="Verifikasi Kata Sandi"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeSlash size={20} />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-bold tracking-wide ml-2">
                *Min. 8 karakter, kombinasi huruf, angka & simbol.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm uppercase tracking-[0.1em] py-4 rounded-2xl active:scale-95 transition-all mt-2 disabled:opacity-50"
          >
            {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Atau
          </span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        <button
          onClick={signInWithGoogle}
          type="button"
          className="w-full mt-6 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white flex items-center justify-center gap-3 py-3.5 rounded-2xl active:scale-95 transition-all font-bold text-sm"
        >
          <GoogleLogo size={20} weight="bold" /> Lanjutkan dengan Google
        </button>

        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-teal-400 font-bold hover:underline"
          >
            {isLogin ? "Daftar sekarang" : "Masuk di sini"}
          </button>
        </p>
      </div>
    </div>
  );
}
