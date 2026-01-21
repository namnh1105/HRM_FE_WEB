'use client';
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const DashboardPage = () => {
  const stats = [
    { title: 'Tổng nhân viên', value: '248', icon: '👥', color: 'bg-blue-500' },
    { title: 'Có mặt hôm nay', value: '231', icon: '✅', color: 'bg-green-500' },
    { title: 'Nghỉ phép', value: '12', icon: '🏖️', color: 'bg-yellow-500' },
    { title: 'Đi trễ', value: '5', icon: '⏰', color: 'bg-red-500' },
  ];

  const quickActions = [
    { title: 'Thêm nhân viên mới', href: '/employees/add', icon: '➕', color: 'bg-blue-600' },
    { title: 'Chấm công', href: '/attendance', icon: '⏱️', color: 'bg-green-600' },
    { title: 'Tính lương', href: '/payroll', icon: '💰', color: 'bg-purple-600' },
    { title: 'Báo cáo', href: '/reports', icon: '📊', color: 'bg-orange-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Tổng quan hệ thống quản lý nhân sự</p>
          </div>

          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-full text-white text-xl mr-4`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Thao tác nhanh */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-3`}
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="font-medium">{action.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Hoạt động gần đây */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Nhân viên mới</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    NV
                  </div>
                  <div>
                    <p className="font-medium">Nguyễn Văn An</p>
                    <p className="text-sm text-gray-600">Phòng IT - Hôm qua</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    TT
                  </div>
                  <div>
                    <p className="font-medium">Trần Thị Bình</p>
                    <p className="text-sm text-gray-600">Phòng Marketing - 2 ngày trước</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông báo</h2>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="font-medium text-yellow-800">Nhắc nhở</p>
                  <p className="text-sm text-yellow-700">Cần xử lý đơn xin nghỉ phép của 3 nhân viên</p>
                </div>
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                  <p className="font-medium text-blue-800">Cập nhật</p>
                  <p className="text-sm text-blue-700">Báo cáo lương tháng 12 đã sẵn sàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;