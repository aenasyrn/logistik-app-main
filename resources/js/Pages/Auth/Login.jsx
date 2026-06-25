// resources/js/Pages/Auth/Login.jsx
import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Package, Lock, Mail, LogIn } from "lucide-react";
import InputError from '@/Components/InputError';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const handleLogin = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden bg-gray-50">
            <Head title="Log in - LogistikKu" />
            
            {/* Background Image dengan Opacity Rendah & Blur Tinggi */}
            <div 
                className="absolute inset-0 z-0 scale-110"
                style={{
                    backgroundImage: "url('/Jakoneberjaya.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 0.15,
                    filter: "blur(20px)"
                }}
            ></div>

            {/* Konten Utama */}
            <div className="relative z-10 w-full sm:max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex bg-green-600 p-3.5 rounded-3xl mb-4 shadow-lg shadow-blue-200">
                        <Package className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
                        LogistikKu
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                        Sistem Informasi Manajemen Barang
                    </p>
                </div>

                {/* Kartu Form: Sangat bersih, putih, dengan shadow lembut */}
                <div className="bg-white/90 backdrop-blur-sm py-10 px-6 shadow-2xl shadow-gray-200/70 border border-gray-100 sm:rounded-3xl sm:px-12">
                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-xl">
                            {status}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                    placeholder="email"
                                    autoComplete="username"
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center items-center gap-2.5 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-green-500/30 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all active:scale-[0.98]"
                        >
                            {processing ? (
                                "Memproses..."
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" /> Masuk ke Sistem
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                <p className="text-center mt-8 text-xs text-gray-500">
                    © {new Date().getFullYear()} Alzi Rahmana Putra. All rights reserved.
                </p>
            </div>
        </div>
    );
}
