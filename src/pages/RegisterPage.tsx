import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setAuth } from '../store/authSlice';
import { Input, Button } from '../components';
import apiService from '../services/api';
import { toast } from 'sonner';

interface FormData {
  name: string;
  email: string;
  contact_no: string;
  company_name: string;
  password: string;
  confirm_password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  contact_no?: string;
  password?: string;
  confirm_password?: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    contact_no: '',
    company_name: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.contact_no.trim()) {
      newErrors.contact_no = 'Contact number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.contact_no)) {
      newErrors.contact_no = 'Invalid contact number format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirm_password, ...registerData } = formData;
      const response = await apiService.register(registerData);
      dispatch(setAuth({ user: response.user, token: response.token }));
      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join SchemaCraft to start designing databases</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label="Name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <Input
                label="Contact Number"
                name="contact_no"
                type="tel"
                placeholder="+1234567890"
                value={formData.contact_no}
                onChange={handleChange}
                required
              />
              {errors.contact_no && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_no}</p>
              )}
            </div>

            <div>
              <Input
                label="Company Name (Optional)"
                name="company_name"
                type="text"
                placeholder="Acme Inc."
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <Input
                label="Confirm Password"
                name="confirm_password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
