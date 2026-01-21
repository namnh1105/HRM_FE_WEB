'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';
import { useRegisterMutation } from "@/store/api/authApi";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
    const router = useRouter();
    
    // Form state
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        givenName: '',
        familyName: ''
    });

    // Form validation
    const [validationErrors, setValidationErrors] = useState<{
        username?: string;
        password?: string;
        givenName?: string;
        familyName?: string;
    }>({});
    
    // API response state
    const [register, { isLoading }] = useRegisterMutation();
    const [apiResponse, setApiResponse] = useState<{
        status: 'idle' | 'success' | 'error';
        message: string;
    }>({
        status: 'idle',
        message: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Reset API response when user starts typing
        if (apiResponse.status !== 'idle') {
            setApiResponse({
                status: 'idle',
                message: '',
            });
        }
        
        // Xóa lỗi validation khi người dùng nhập lại
        setValidationErrors({
            ...validationErrors,
            [e.target.name]: undefined
        });
        
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async () => {
        // Reset API response
        setApiResponse({
            status: 'idle',
            message: '',
        });
        
        // Validate form
        const errors: {username?: string; password?: string; givenName?: string; familyName?: string} = {};
        
        if (!formData.username.trim()) {
            errors.username = 'Vui lòng nhập tên đăng nhập';
        }
        
        if (!formData.password) {
            errors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        
        if (!formData.givenName.trim()) {
            errors.givenName = 'Vui lòng nhập tên';
        }
        
        if (!formData.familyName.trim()) {
            errors.familyName = 'Vui lòng nhập họ';
        }
        
        // If there are validation errors, show them and stop
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            const result = await register({
                username: formData.username,
                password: formData.password,
                givenName: formData.givenName,
                familyName: formData.familyName
            }).unwrap();
            
            // Chỉ hiển thị thông báo thành công và chuyển hướng khi API trả về thành công
            if (result && result.success) {
                setApiResponse({
                    status: 'success',
                    message: 'Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...',
                });
                
                // Tự động chuyển sang trang đăng nhập sau 2 giây
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                // API trả về success = false
                setApiResponse({
                    status: 'error',                message: result.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.',
                });
            }
        } catch (error: unknown) {
            console.error('Register error:', error);
            
            let errorMessage = 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.';
            
            if (typeof error === 'object' && error !== null) {
                const err = error as Record<string, unknown>;
                if (err.data && typeof err.data === 'object' && err.data !== null) {
                    const data = err.data as Record<string, unknown>;
                    if (data.message && typeof data.message === 'string') {
                        errorMessage = data.message;
                    }
                }
            }
            
            setApiResponse({
                status: 'error',
                message: errorMessage,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Tạo tài khoản
                    </h1>
                    <p className="text-gray-600">
                        Điền thông tin để tạo tài khoản mới
                    </p>
                </div>                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    {/* Success Message */}
                    {apiResponse.status === 'success' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-sm font-medium">{apiResponse.message}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {apiResponse.status === 'error' && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm font-medium">{apiResponse.message}</p>
                        </div>
                    )}
                    <div className="space-y-6">
                        {/* Register fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="familyName"
                                        value={formData.familyName}
                                        onChange={handleInputChange}
                                        className={`w-full pl-11 pr-4 py-3 border ${validationErrors.familyName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-white`}
                                        placeholder="Nguyễn"
                                        required
                                    />
                                </div>
                                {validationErrors.familyName && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.familyName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="givenName"
                                        value={formData.givenName}
                                        onChange={handleInputChange}
                                        className={`w-full pl-11 pr-4 py-3 border ${validationErrors.givenName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-white`}
                                        placeholder="Văn A"
                                        required
                                    />
                                </div>
                                {validationErrors.givenName && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.givenName}</p>
                                )}
                            </div>
                        </div>

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
                                    className={`w-full pl-11 pr-4 py-3 border ${validationErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-white`}
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>
                            {validationErrors.username && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                            )}
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
                                    className={`w-full pl-11 pr-11 py-3 border ${validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-white`}
                                    placeholder="••••••••"
                                    required
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
                                    <UserPlus className="w-5 h-5" />
                                    <span>Tạo tài khoản</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Toggle Mode */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Đã có tài khoản?
                            <Link href="/login" className="ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                Đăng nhập
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

export default RegisterPage;
