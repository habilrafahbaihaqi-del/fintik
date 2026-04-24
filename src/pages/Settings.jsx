import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  User,
  Tag,
  LockKey,
  FloppyDisk,
  Trash,
  Plus,
  UploadSimple,
  Info,
  SignOut,
  Eye,
  EyeSlash,
  CheckCircle,
  ChatText, // Ikon baru untuk feedback
  ArrowSquareOut, // Ikon baru untuk link eksternal
} from "@phosphor-icons/react";

export default function Settings({ categories, fetchCategories, userSession }) {
  const [activeTab, setActiveTab] = useState("profil");

  // --- STATE PROFIL ---
  const userData = userSession?.user?.user_metadata || {};
  const [tempName, setTempName] = useState(userData.full_name || "");
  const [tempPhoto, setTempPhoto] = useState(userData.avatar_url || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- STATE KATEGORI ---
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("pengeluaran");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // --- STATE KEAMANAN ---
  const isGoogleUser = userSession?.user?.app_metadata?.provider === "google";
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Visibilitas Password
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // --- HANDLER UPLOAD FOTO (DENGAN LIMIT 2MB) ---
  const handlePhotoUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        return alert("Harap unggah file berupa gambar (JPG, PNG, dll).");
      }

      if (file.size > 2 * 1024 * 1024) {
        return alert("Ukuran foto terlalu besar! Maksimal 2MB.");
      }

      setUploadingImage(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${userSession.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setTempPhoto(data.publicUrl);
    } catch (error) {
      alert("Gagal mengunggah foto: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: tempName, avatar_url: tempPhoto },
      });
      if (error) throw error;
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- HANDLER KATEGORI ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      setIsSavingCategory(true);
      const { error } = await supabase.from("categories").insert([
        {
          name: newCategoryName,
          type: newCategoryType,
          icon: "Tag",
          color: newCategoryType === "pengeluaran" ? "#f43f5e" : "#14b8a6",
        },
      ]);
      if (error) throw error;
      setNewCategoryName("");
      fetchCategories();
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Yakin hapus kategori ini?")) return;
    try {
      await supabase.from("categories").delete().eq("id", id);
      fetchCategories();
    } catch (error) {
      console.error(error.message);
    }
  };

  // --- HANDLER KEAMANAN ---
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: userSession.user.email,
        password: currentPassword,
      });

      if (error)
        throw new Error("Kata sandi saat ini salah. Silakan coba lagi.");

      setIsPasswordVerified(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      return alert("Kata sandi baru dan verifikasi tidak cocok.");
    }

    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!regex.test(newPassword)) {
      return alert(
        "Kata sandi harus minimal 8 karakter, serta mengandung kombinasi huruf, angka, dan karakter spesial/simbol.",
      );
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      alert("Kata sandi berhasil diperbarui!");
      setIsPasswordVerified(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2 md:mt-0 pb-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">
            Pengaturan
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Sesuaikan preferensi akun Anda.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-slate-900 border border-slate-800 text-rose-400 p-3 rounded-2xl hover:bg-slate-800 hover:text-rose-300 transition-colors"
        >
          <SignOut size={20} weight="bold" />
        </button>
      </div>

      {/* TABS */}
      <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 mb-8 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("profil")}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "profil" ? "bg-teal-500/20 text-teal-400 shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
        >
          <User size={16} weight="bold" /> Profil
        </button>
        <button
          onClick={() => setActiveTab("kategori")}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "kategori" ? "bg-teal-500/20 text-teal-400 shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
        >
          <Tag size={16} weight="bold" /> Kategori
        </button>
        <button
          onClick={() => setActiveTab("keamanan")}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "keamanan" ? "bg-teal-500/20 text-teal-400 shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
        >
          <LockKey size={16} weight="bold" /> Keamanan
        </button>
      </div>

      {/* --- TAB PROFIL --- */}
      {activeTab === "profil" && (
        <section className="bg-slate-900/50 border border-slate-800 p-5 md:p-8 rounded-[32px] animate-in fade-in zoom-in-95">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col items-center mb-6 relative">
              <label className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-900 shadow-xl overflow-hidden mb-4 flex items-center justify-center relative group cursor-pointer active:scale-95 transition-transform">
                {tempPhoto ? (
                  <img
                    src={tempPhoto}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-slate-500" weight="duotone" />
                )}

                <div
                  className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${uploadingImage ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  {uploadingImage ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <UploadSimple
                      size={24}
                      className="text-white"
                      weight="bold"
                    />
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingImage}
                />
              </label>

              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center">
                {uploadingImage
                  ? "Mengunggah..."
                  : "Klik Foto untuk Ubah (Maks 2MB)"}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">
                Nama Panggilan
              </label>
              <input
                type="text"
                required
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-800 text-white font-bold rounded-2xl px-4 py-4 focus:outline-none focus:border-teal-500/50 transition-all text-sm"
                placeholder="Masukkan nama..."
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile || uploadingImage}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-[0.25em] py-4 rounded-2xl shadow-xl shadow-teal-500/30 active:scale-95 transition-all disabled:opacity-50"
            >
              <FloppyDisk size={18} weight="bold" />{" "}
              {isSavingProfile ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>

          {/* --- SECTION SARAN & KRITIK --- */}
          <div className="mt-8 pt-8 border-t border-slate-800/80">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/5 border border-indigo-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-3 rounded-xl">
                  <ChatText
                    size={24}
                    className="text-indigo-400"
                    weight="duotone"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Saran & Kritik
                  </h4>
                  <p className="text-xs text-slate-400">
                    Bantu kami membuat Fintik jadi lebih baik.
                  </p>
                </div>
              </div>
              <a
                href="https://forms.gle/w6wfzQQKVTF8FPH4A"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors whitespace-nowrap active:scale-95"
              >
                Isi Formulir <ArrowSquareOut size={16} weight="bold" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* --- TAB KATEGORI --- */}
      {activeTab === "kategori" && (
        <section className="bg-slate-900/50 border border-slate-800 p-5 md:p-8 rounded-[32px] animate-in fade-in zoom-in-95">
          <form
            onSubmit={handleAddCategory}
            className="mb-8 p-4 bg-slate-950 rounded-2xl border border-slate-800/50"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500/50 text-sm"
                placeholder="Nama Kategori"
              />
              <select
                value={newCategoryType}
                onChange={(e) => setNewCategoryType(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500/50 text-sm cursor-pointer"
              >
                <option value="pengeluaran">Pengeluaran</option>
                <option value="pemasukan">Pemasukan</option>
              </select>
              <button
                type="submit"
                disabled={isSavingCategory}
                className="bg-teal-500 text-slate-950 p-3 rounded-xl hover:bg-teal-400 font-bold flex justify-center transition-all disabled:opacity-50"
              >
                <Plus size={20} weight="bold" />
              </button>
            </div>
          </form>
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 ml-1">
                Kategori Pengeluaran
              </h4>
              <div className="space-y-2">
                {categories
                  .filter((c) => c.type === "pengeluaran")
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-xl border border-slate-800/50"
                    >
                      <span className="text-sm font-bold text-slate-200">
                        {cat.name}
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash size={18} weight="bold" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-3 ml-1">
                Kategori Pemasukan
              </h4>
              <div className="space-y-2">
                {categories
                  .filter((c) => c.type === "pemasukan")
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-xl border border-slate-800/50"
                    >
                      <span className="text-sm font-bold text-slate-200">
                        {cat.name}
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash size={18} weight="bold" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- TAB KEAMANAN --- */}
      {activeTab === "keamanan" && (
        <section className="bg-slate-900/50 border border-slate-800 p-5 md:p-8 rounded-[32px] animate-in fade-in zoom-in-95">
          {isGoogleUser ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <LockKey
                  size={28}
                  className="text-slate-500"
                  weight="duotone"
                />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                Akun Google
              </h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Pengaturan kata sandi dinonaktifkan karena Anda masuk
                menggunakan akun Google.
              </p>
            </div>
          ) : !isPasswordVerified ? (
            // TAHAP 1: FORM VERIFIKASI KATA SANDI LAMA
            <form
              className="space-y-5 animate-in fade-in slide-in-from-right-4"
              onSubmit={handleVerifyPassword}
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LockKey size={20} className="text-slate-400" />
                </div>
                <h3 className="text-white font-bold">Verifikasi Identitas</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Masukkan kata sandi saat ini untuk melanjutkan.
                </p>
              </div>
              <div className="relative">
                <input
                  type={showCurrentPwd ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-teal-500/50 text-sm placeholder:text-slate-700"
                  placeholder="Kata sandi saat ini"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showCurrentPwd ? <Eye size={20} /> : <EyeSlash size={20} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl transition-all disabled:opacity-50"
              >
                {isVerifying ? "Memverifikasi..." : "Lanjutkan"}
              </button>
            </form>
          ) : (
            // TAHAP 2: FORM INPUT KATA SANDI BARU
            <form
              className="space-y-5 animate-in fade-in slide-in-from-right-4"
              onSubmit={handleUpdatePassword}
            >
              <div className="flex items-center gap-3 mb-6 bg-teal-500/10 p-3 rounded-xl border border-teal-500/20">
                <CheckCircle
                  size={24}
                  className="text-teal-400"
                  weight="fill"
                />
                <p className="text-teal-400 text-xs font-bold">
                  Verifikasi berhasil. Silakan buat kata sandi baru.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-teal-500/50 text-sm"
                    placeholder="Minimal 8 karakter unik"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showNewPwd ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-teal-500/50 text-sm"
                    placeholder="Ulangi kata sandi baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPwd ? (
                      <Eye size={20} />
                    ) : (
                      <EyeSlash size={20} />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-bold tracking-wide mt-2 ml-1">
                  *Min. 8 karakter, kombinasi huruf, angka & simbol.
                </p>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl mt-6 transition-all disabled:opacity-50"
              >
                {isUpdatingPassword ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
              </button>
            </form>
          )}
        </section>
      )}

      {/* --- INFO VERSI APLIKASI --- */}
      <div className="mt-12 text-center flex flex-col items-center justify-center opacity-50">
        <Info size={24} className="text-slate-500 mb-2" weight="duotone" />
        <p className="text-xs font-bold text-slate-500 tracking-widest">
          FINTIK APP
        </p>
        <p className="text-[10px] text-slate-600 font-mono mt-1">
          Versi 1.0.0-MVP
        </p>
      </div>
    </div>
  );
}
