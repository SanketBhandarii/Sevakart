import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Phone, Lock, User, MapPin } from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'vendor' as 'vendor' | 'supplier',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone || formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const success = await register(formData);
      
      if (success) {
        toast.success('Registration successful! Welcome to SevaKart!');
        navigate(formData.role === 'vendor' ? '/vendor/dashboard' : '/supplier/dashboard');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Store className="h-12 w-12 text-primary-purple" />
              <span className="text-3xl font-bold text-text-dark">SevaKart</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-text-dark">Create account</h2>
          <p className="mt-2 text-sm text-text-gray">Join our marketplace today</p>
        </div>

        <div className="glass-card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-text-gray" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`input-field pl-10 ${errors.name ? 'border-danger' : ''}`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-text-gray" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  className={`input-field pl-10 ${errors.phone ? 'border-danger' : ''}`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-gray" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password (min 6 characters)"
                  className={`input-field pl-10 ${errors.password ? 'border-danger' : ''}`}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-3">
                Register as
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="vendor"
                    checked={formData.role === 'vendor'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-purple focus:ring-primary-purple/20 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-text-dark">Street Vendor</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="supplier"
                    checked={formData.role === 'supplier'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-purple focus:ring-primary-purple/20 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-text-dark">Supplier</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text-dark mb-2">
                Location/City
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-text-gray" />
                </div>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                  className={`input-field pl-10 ${errors.location ? 'border-danger' : ''}`}
                />
              </div>
              {errors.location && <p className="mt-1 text-sm text-danger">{errors.location}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <User size={20} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-gray">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-purple hover:text-primary-purple/80">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;