import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Phone, Lock, User, MapPin, Mail } from 'lucide-react';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'vendor' as 'vendor' | 'supplier',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { register, googleSignIn } = useAuth();
  const navigate = useNavigate();

  // ✅ Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone || formData.phone.length !== 10)
      newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Valid email is required';
    if (!formData.password || formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit registration form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        location: formData.location
      });

      if (user) {
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

  // ✅ Handle field input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value
    }));
  };

  // ✅ Google Sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await googleSignIn();
      if (user) {
        toast.success('Signed in with Google!');
        navigate('/vendor/dashboard');
      } else {
        toast.error('Google Sign-in failed');
      }
    } catch (error) {
      toast.error('Google Sign-in error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Title */}
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

        {/* Registration Form */}
        <div className="glass-card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`input-field ${errors.name ? 'border-danger' : ''}`}
              />
              {errors.name && <p className="text-danger text-sm">{errors.name}</p>}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Phone</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit number"
                className={`input-field ${errors.phone ? 'border-danger' : ''}`}
              />
              {errors.phone && <p className="text-danger text-sm">{errors.phone}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`input-field ${errors.email ? 'border-danger' : ''}`}
              />
              {errors.email && <p className="text-danger text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Min 6 characters"
                className={`input-field ${errors.password ? 'border-danger' : ''}`}
              />
              {errors.password && <p className="text-danger text-sm">{errors.password}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-3">Register as</label>
              <div className="flex space-x-4">
                {['vendor', 'supplier'].map(r => (
                  <label key={r} className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={formData.role === r}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-purple border-gray-300"
                    />
                    <span className="ml-2">{r === 'vendor' ? 'Street Vendor' : 'Supplier'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Field */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter your city"
                className={`input-field ${errors.location ? 'border-danger' : ''}`}
              />
              {errors.location && <p className="text-danger text-sm">{errors.location}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex justify-center items-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>

            {/* Google Sign-in Button */}
            <button type="button" onClick={handleGoogleSignIn} className="mt-3 w-full btn-secondary">
              Sign in with Google
            </button>
          </form>

          {/* Login Redirect */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-gray">
              Already have an account? <Link to="/login" className="text-primary-purple">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
