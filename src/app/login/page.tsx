'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useLoginMutation } from "@/store/api/authApi";
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/features/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    // Form validation
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string | undefined}>({});
    
    const dispatch = useDispatch();
    const router = useRouter();
      // API response states
    const [login, { isLoading }] = useLoginMutation();
    const [apiResponse, setApiResponse] = useState<{
        status: 'idle' | 'success' | 'error';
        message: string;
    }>({
        status: 'idle',
        message: '',
    });

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Clear validation error when user types
        setValidationErrors(prev => ({
            ...prev,
            [name]: undefined
        }));
        
        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Reset API response on user input
        if (apiResponse.status !== 'idle') {
            setApiResponse({
                status: 'idle',
                message: ''
            });
        }
    };    
    const validateForm = () => {
        const errors: {[key: string]: string | undefined} = {};
        
        // Username validation
        if (!formData.username.trim()) {
            errors.username = 'Vui lòng nhập tên đăng nhập';
        }
        
        // Password validation
        if (!formData.password) {
            errors.password = 'Vui lòng nhập mật khẩu';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };    
    const handleSubmit = async () => {
        // Reset previous response
        setApiResponse({
            status: 'idle',
            message: ''
        });
        
        if (!validateForm()) {
            return;
        }        
          try {
            // Reset form errors first
            setValidationErrors({});
            
            // Call login API
            const result = await login({
                username: formData.username,
                password: formData.password
            }).unwrap();
            
            console.log('API Response:', result);
            
            // Set success state if API returns success
            if (result && result.success) {
                // Store the user credentials in Redux
                dispatch(setCredentials(result.data));
                
                setApiResponse({
                    status: 'success',
                    message: 'Đăng nhập thành công!'
                });
                
                // Redirect to home page after successful login
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                // Handle case where API returns failure but doesn't throw
                setApiResponse({
                    status: 'error',                
                    message: result.message || 'Đăng nhập không thành công'
                });            }} catch (error: unknown) {
            // Log the error for debugging
            console.error('Login Error:', error);
            
            // Đơn giản hóa xử lý lỗi - chỉ hiển thị thông báo lỗi CORS hoặc lỗi kết nối
            let errorMessage = 'Có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại sau.';
            
            // Nếu có thông báo lỗi từ API, hiển thị nó
            if (typeof error === 'object' && error !== null) {
                const err = error as Record<string, unknown>;
                if (err.data && typeof err.data === 'object') {
                    const data = err.data as Record<string, unknown>;
                    if (data.message && typeof data.message === 'string') {
                        errorMessage = data.message;
                    }
                }
            }
            
            setApiResponse({
                status: 'error',
                message: errorMessage
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Chào mừng trở lại
                    </h1>
                    <p className="text-gray-600">
                        Đăng nhập để tiếp tục
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    {/* API Response Messages */}
                    {apiResponse.status === 'success' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-sm font-medium">{apiResponse.message}</p>
                        </div>
                    )}
                    
                    {apiResponse.status === 'error' && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm font-medium">{apiResponse.message}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên đăng nhập
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`w-full pl-11 pr-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        validationErrors.username 
                                            ? 'border-red-300 bg-red-50' 
                                            : 'border-gray-300 bg-gray-50 focus:bg-white'
                                    }`}
                                    placeholder="your.email@example.com"
                                />
                                {validationErrors.username && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                                )}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full pl-11 pr-11 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        validationErrors.password 
                                            ? 'border-red-300 bg-red-50' 
                                            : 'border-gray-300 bg-gray-50 focus:bg-white'
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {validationErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                            )}
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                                Quên mật khẩu?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Đăng nhập</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Toggle Mode */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Chưa có tài khoản?
                            <Link href="/register" className="ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>Bằng cách tiếp tục, bạn đồng ý với</p>
                    <div className="space-x-4 mt-1">
                        <button className="hover:text-gray-700 transition-colors">
                            Điều khoản dịch vụ
                        </button>
                        <span>•</span>
                        <button className="hover:text-gray-700 transition-colors">
                            Chính sách bảo mật
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
