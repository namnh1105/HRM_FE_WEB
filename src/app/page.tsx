'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const HomePage = () => {

    console.log(process.env.NEXT_PUBLIC_API_BASE_URL);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
                <div className="text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Hệ thống HRM
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Quản lý nhân sự hiệu quả - Nâng cao năng suất và phát triển con người
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-blue-600 text-3xl mb-4">👥</div>
                            <h3 className="text-lg font-semibold mb-2">Quản lý nhân viên</h3>
                            <p className="text-gray-600">Thông tin chi tiết và hồ sơ nhân viên</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-green-600 text-3xl mb-4">⏰</div>
                            <h3 className="text-lg font-semibold mb-2">Chấm công</h3>
                            <p className="text-gray-600">Theo dõi thời gian làm việc và chuyên cần</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-purple-600 text-3xl mb-4">💰</div>
                            <h3 className="text-lg font-semibold mb-2">Tính lương</h3>
                            <p className="text-gray-600">Quản lý lương và phúc lợi nhân viên</p>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default HomePage;