import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Store, Lock, Mail, User } from "lucide-react";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"vendor" | "supplier">("vendor"); // Optional UI use
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Valid email is required";
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const user = await login(email, password, role); // Firebase email login
      if (user) {
        toast.success("Login successful!");
        navigate(
          role === "vendor" ? "/vendor/dashboard" : "/supplier/dashboard"
        );
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Store className="h-12 w-12 text-primary-purple" />
              <span className="text-3xl font-bold text-text-dark">
                SevaKart
              </span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-text-dark">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-text-gray">Sign in to your account</p>
        </div>

        <div className="glass-card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-dark mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-gray" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`input-field pl-10 ${
                    errors.email ? "border-danger" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-dark mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-gray" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`input-field pl-10 ${
                    errors.password ? "border-danger" : ""
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger">{errors.password}</p>
              )}
            </div>

            {/* Optional Role Selection */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-3">
                Login as
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="vendor"
                    checked={role === "vendor"}
                    onChange={(e) =>
                      setRole(e.target.value as "vendor" | "supplier")
                    }
                    className="h-4 w-4 text-primary-purple focus:ring-primary-purple/20 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-text-dark">
                    Street Vendor
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="supplier"
                    checked={role === "supplier"}
                    onChange={(e) =>
                      setRole(e.target.value as "vendor" | "supplier")
                    }
                    className="h-4 w-4 text-primary-purple focus:ring-primary-purple/20 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-text-dark">Supplier</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <User size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Link to Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-gray">
              New user?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-purple hover:text-primary-purple/80"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
