// resources/js/Pages/Auth/Register.jsx
import React, { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Eye, EyeOff, ShieldCheck, RotateCw } from "lucide-react";
import InputError from '@/Components/InputError';
import axios from 'axios';

export default function Register({ captchaSvg }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [captchaImage, setCaptchaImage] = useState(captchaSvg || '');
    const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'logistic_officer',
        password: '',
        password_confirmation: '',
        captcha: '',
    });

    const refreshCaptcha = async () => {
        setIsRefreshingCaptcha(true);
        try {
            const res = await axios.get(route('captcha.refresh'));
            if (res.data && res.data.captchaSvg) {
                setCaptchaImage(res.data.captchaSvg);
                setData('captcha', '');
            }
        } catch (err) {
            console.error("Gagal refresh captcha", err);
        } finally {
            setIsRefreshingCaptcha(false);
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onError: () => {
                refreshCaptcha();
            },
        });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#18392b] relative overflow-hidden font-sans select-none">
            <Head title="Registrasi Akun - SMARTLOG" />

            {/* ── Background Bokeh Bulat Sesuai Referensi Gambar ── */}
            <div className="absolute top-10 left-12 w-36 h-36 rounded-full bg-emerald-500/10 blur-xl pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-16 w-80 h-80 rounded-full bg-emerald-300/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 left-10 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none"></div>
            <div className="absolute top-8 right-24 w-28 h-28 rounded-full bg-emerald-400/10 blur-lg pointer-events-none"></div>
            
            {/* Lingkaran bokeh transparan yang lebih tegas */}
            <div className="absolute top-6 left-1/4 w-16 h-16 rounded-full border border-emerald-400/15 bg-emerald-400/5 pointer-events-none"></div>
            <div className="absolute bottom-16 right-1/4 w-24 h-24 rounded-full border border-emerald-400/15 bg-emerald-400/5 pointer-events-none"></div>
            <div className="absolute bottom-32 left-8 w-14 h-14 rounded-full border border-emerald-400/15 bg-emerald-400/5 pointer-events-none"></div>

            {/* ── Card Utama Registrasi ── */}
            <div className="w-full max-w-5xl min-h-[660px] bg-[#1c4432] rounded-[32px] sm:rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-emerald-800/40 relative overflow-hidden flex flex-col lg:flex-row z-10">
                
                {/* ── SISI KIRI: Background Putih Solid (Garis Lurus) ── */}
                <div className="w-full lg:w-1/2 relative z-10 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12">
                    
                    {/* Header Sisi Kiri: Logo Instansi / Institusi */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo-pegadaian.png"
                            alt="Logo Instansi"
                            className="h-10 sm:h-11 object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <div className="border-l-2 border-gray-200 pl-3">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-800 tracking-wider uppercase leading-tight">
                                DEPARTEMEN LOGISTIK & UMUM
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-none mt-0.5">
                                Smart Logistics Information System
                            </p>
                        </div>
                    </div>

                    {/* Area Tengah: Ilustrasi dengan Logo Website SMARTLOG didalam Blob Hijau Pastel */}
                    <div className="my-8 lg:my-auto flex flex-col items-center justify-center relative">
                        {/* Lingkaran-lingkaran ornamen di sekitar blob */}
                        <div className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-[#d8ebe2]/60 blur-[1px]"></div>
                        <div className="absolute top-10 right-4 w-6 h-6 rounded-full bg-[#d8ebe2]/80"></div>
                        <div className="absolute -bottom-3 left-10 w-5 h-5 rounded-full bg-[#cde4d9]/70"></div>
                        <div className="absolute bottom-8 -right-2 w-4 h-4 rounded-full bg-[#d8ebe2]"></div>

                        {/* Bentuk Blob Hijau Pastel Organik */}
                        <div className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-[48px] bg-gradient-to-tr from-[#d5ede1] via-[#e5f5ed] to-[#edf8f2] flex flex-col items-center justify-center p-6 shadow-inner relative border border-[#cbe5d7]">
                            
                            {/* Titik-titik dekoratif menyerupai salju/bokeh di dalam ilustrasi */}
                            <div className="absolute top-6 left-8 w-3 h-3 rounded-full bg-white/80"></div>
                            <div className="absolute top-12 right-10 w-2 h-2 rounded-full bg-white/70"></div>
                            <div className="absolute bottom-12 left-10 w-2.5 h-2.5 rounded-full bg-white/80"></div>
                            <div className="absolute bottom-8 right-14 w-3.5 h-3.5 rounded-full bg-white/90"></div>

                            {/* Logo Website Utama SMARTLOG */}
                            <div className="relative z-10 flex flex-col items-center group cursor-default">
                                <img
                                    src="/logo-smartlog.png"
                                    alt="SMARTLOG Logo"
                                    className="w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="mt-2 text-center">
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0d5c3a]">
                                        SMART<span className="text-[#3bbf6e]">LOG</span>
                                    </h2>
                                    <p className="text-[11px] sm:text-xs font-semibold text-gray-600 tracking-wide">
                                        Smart Logistics Information System
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Sisi Kiri: Copyright */}
                    <div className="pt-2 text-center lg:text-left">
                        <p className="text-[11px] text-gray-500 font-medium">
                            © {new Date().getFullYear()} SMARTLOG • Departemen Logistik & Umum
                        </p>
                    </div>
                </div>

                {/* ── SISI KANAN: Form Registrasi Tema Hijau Gelap ── */}
                <div className="w-full lg:w-1/2 relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-10 bg-[#1c4432]">
                    
                    {/* Area Form */}
                    <div className="w-full max-w-md mx-auto my-auto">
                        
                        {/* Judul Register */}
                        <div className="mb-4">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                Register
                            </h1>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-3 sm:space-y-3.5">
                            
                            {/* Field Nama Lengkap */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-emerald-100/90 mb-1 pl-1">
                                    Nama Lengkap
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-5 py-2.5 sm:py-3 bg-[#122e20]/80 border border-emerald-800/60 rounded-full text-white placeholder-emerald-300/30 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 transition-all shadow-inner"
                                        placeholder="Nama Lengkap Anda"
                                        autoComplete="name"
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-1 pl-3 text-red-300 text-xs" />
                            </div>

                            {/* Field Email */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-emerald-100/90 mb-1 pl-1">
                                    Alamat Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-5 py-2.5 sm:py-3 bg-[#122e20]/80 border border-emerald-800/60 rounded-full text-white placeholder-emerald-300/30 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 transition-all shadow-inner"
                                        placeholder="nama@email.com"
                                        autoComplete="username"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1 pl-3 text-red-300 text-xs" />
                            </div>

                            {/* Field Pilihan Peran (Role) */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-emerald-100/90 mb-1 pl-1">
                                    Pilihan Peran (Role)
                                </label>
                                <div className="relative">
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-4 py-2.5 sm:py-3 bg-[#122e20] border border-emerald-700/70 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 transition-all shadow-sm cursor-pointer"
                                    >
                                        <option value="logistic_officer" className="bg-[#122e20] text-white">Logistik Officer</option>
                                        <option value="guest" className="bg-[#122e20] text-white">Guest / Tamu</option>
                                        <option value="admin" className="bg-[#122e20] text-white">Administrator</option>
                                    </select>
                                </div>
                                <InputError message={errors.role} className="mt-1 pl-3 text-red-300 text-xs" />
                            </div>

                            {/* Grid 2 Kolom: Password & Konfirmasi Password */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-medium text-emerald-100/90 mb-1 pl-1">
                                        Kata Sandi
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full pl-4 pr-10 py-2.5 bg-[#122e20]/80 border border-emerald-800/60 rounded-full text-white placeholder-emerald-300/30 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 transition-all shadow-inner"
                                            placeholder="Min. 8 karakter"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-300/60 hover:text-emerald-200 focus:outline-none transition-colors cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1 pl-2 text-red-300 text-xs" />
                                </div>

                                {/* Konfirmasi Password */}
                                <div>
                                    <label className="block text-xs font-medium text-emerald-100/90 mb-1 pl-1">
                                        Konfirmasi Sandi
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswordConfirm ? "text" : "password"}
                                            required
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="w-full pl-4 pr-10 py-2.5 bg-[#122e20]/80 border border-emerald-800/60 rounded-full text-white placeholder-emerald-300/30 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 transition-all shadow-inner"
                                            placeholder="Ulangi sandi"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-300/60 hover:text-emerald-200 focus:outline-none transition-colors cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-1 pl-2 text-red-300 text-xs" />
                                </div>
                            </div>

                            {/* Field Captcha Keamanan SMARTLOG */}
                            <div className="pt-0.5">
                                <label className="block text-xs font-medium text-emerald-100/90 mb-1 pl-1 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    Kode Keamanan (Captcha)
                                </label>

                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-white rounded-2xl p-1 overflow-hidden shadow-xs flex-1 flex justify-center border border-emerald-300/30">
                                        {captchaImage ? (
                                            <img
                                                src={captchaImage}
                                                alt="Kode Keamanan"
                                                className="h-9 w-full max-w-[190px] object-contain"
                                            />
                                        ) : (
                                            <div className="h-9 flex items-center text-xs text-gray-400">Memuat captcha...</div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={refreshCaptcha}
                                        disabled={isRefreshingCaptcha}
                                        className="h-9 w-9 rounded-full border border-emerald-700/60 bg-[#122e20] hover:bg-[#163a29] active:scale-95 transition-all text-emerald-200 flex items-center justify-center cursor-pointer shrink-0 shadow-xs"
                                        title="Acak / Perbarui Captcha"
                                    >
                                        <RotateCw className={`w-3.5 h-3.5 ${isRefreshingCaptcha ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={data.captcha}
                                    onChange={(e) => setData('captcha', e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2 bg-[#122e20]/80 border border-emerald-800/60 rounded-full focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 transition-all text-xs sm:text-sm text-white tracking-widest font-mono font-bold text-center placeholder:text-emerald-300/30 placeholder:font-sans placeholder:tracking-normal uppercase shadow-inner"
                                    placeholder="Ketik kode di atas"
                                    autoComplete="off"
                                />
                                <InputError message={errors.captcha} className="mt-1 pl-3 text-red-300 text-xs" />
                            </div>

                            {/* Tombol Submit Register (Pill Teal/Sage Green Khas Gambar) */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 sm:py-3.5 px-6 rounded-full bg-[#569784] hover:bg-[#488775] active:scale-[0.98] text-white font-semibold text-sm sm:text-base shadow-lg shadow-black/20 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 disabled:opacity-70 transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {processing ? "Memproses..." : "Register"}
                                </button>
                            </div>

                            {/* Link Kembali ke Login */}
                            <div className="text-center pt-2">
                                <p className="text-xs sm:text-sm text-emerald-200/80">
                                    Already have an account?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-emerald-300 font-semibold underline hover:text-white transition-colors"
                                    >
                                        Login
                                    </Link>
                                </p>
                            </div>

                        </form>
                    </div>

                </div>

            </div>
        </div>
    );
}
