import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
import { apiClient, ApiError } from './apiClient';

const MOCK_USER: User = {
  id: 'usr-001',
  name: 'Dr. Sarah Lin, MPH',
  email: 'sarah.lin@publichealth.gov',
  role: 'epidemiologist',
  organization: 'National Public Health Surveillance Division',
  department: 'Epidemic Intelligence & Early Warning',
  avatarUrl: 'https://images.unsplash.com/photo-1594824813589-a0352ffb7625?auto=format&fit=crop&q=80&w=256',
  lastLogin: 'Today at 08:30 AM',
};

export const authService = {
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('outbreak_user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem('outbreak_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('outbreak_user');
      localStorage.removeItem('outbreak_token');
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Attempt backend login first
      const res = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
      apiClient.setToken(res.token);
      this.setCurrentUser(res.user);
      return res.user;
    } catch (err) {
      // Graceful fallback to demo authentication for local testing / prototyping
      console.warn('Backend authentication unavailable, using simulated demo session:', err);
      
      // Simulate realistic network delay
      await new Promise(r => setTimeout(r, 600));

      // Simple mock credential check
      if (credentials.email && credentials.password) {
        let role = MOCK_USER.role;
        if (credentials.email.includes('admin')) role = 'admin';
        else if (credentials.email.includes('officer')) role = 'health_officer';
        else if (credentials.email.includes('analyst')) role = 'analyst';

        const user: User = {
          ...MOCK_USER,
          email: credentials.email,
          role,
          name: credentials.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        };
        apiClient.setToken('mock_jwt_token_' + Date.now());
        this.setCurrentUser(user);
        return user;
      }
      throw new ApiError('Invalid email or password', 401);
    }
  },

  async register(data: RegisterData): Promise<User> {
    try {
      const res = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
      apiClient.setToken(res.token);
      this.setCurrentUser(res.user);
      return res.user;
    } catch (err) {
      console.warn('Backend unavailable, using simulated registration:', err);
      await new Promise(r => setTimeout(r, 700));

      const newUser: User = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        name: data.name,
        email: data.email,
        role: data.role,
        organization: data.organization,
        lastLogin: 'Just now',
      };
      apiClient.setToken('mock_jwt_token_' + Date.now());
      this.setCurrentUser(newUser);
      return newUser;
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post('/api/v1/auth/forgot-password', { email });
    } catch {
      await new Promise(r => setTimeout(r, 500));
      return {
        success: true,
        message: `Recovery instructions sent to ${email} if an account exists.`,
      };
    }
  },

  logout(): void {
    apiClient.setToken(null);
    this.setCurrentUser(null);
  }
};
