import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: '/api',
});

const AppShell = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/user/profile');
      if (data.success) {
        setUser(data.userdata);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors and continue
    }
    setUser(null);
    toast.success('You have been logged out.');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="card loading-card">Loading your account…</div>
      </div>
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">AuthFlow</div>
        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <button className="ghost-button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage refreshUser={refreshUser} />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage refreshUser={refreshUser} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<ProtectedRoute user={user}><DashboardPage user={user} refreshUser={refreshUser} /></ProtectedRoute>} />
        </Routes>
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

const HomePage = ({ user }) => (
  <section className="hero">
    <div className="hero-card">
      <span className="eyebrow">Secure, polished authentication</span>
      <h1>Build trust with a beautiful auth experience.</h1>
      <p>Register, sign in, verify your account, and reset your password without leaving the app.</p>
      <div className="hero-actions">
        {user ? (
          <NavLink className="button primary" to="/dashboard">
            Open dashboard
          </NavLink>
        ) : (
          <>
            <NavLink className="button primary" to="/register">
              Create account
            </NavLink>
            <NavLink className="button secondary" to="/login">
              Sign in
            </NavLink>
          </>
        )}
      </div>
    </div>

    <div className="feature-grid">
      <div className="card feature-card">
        <h3>Fast onboarding</h3>
        <p>Start with a clean registration flow that feels effortless.</p>
      </div>
      <div className="card feature-card">
        <h3>Email verification</h3>
        <p>Guide users through account confirmation with one-time codes.</p>
      </div>
      <div className="card feature-card">
        <h3>Password recovery</h3>
        <p>Let users reset access securely without leaving the app.</p>
      </div>
    </div>
  </section>
);

const LoginPage = ({ refreshUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.success) {
        toast.success('Welcome back!');
        await refreshUser();
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Unable to sign in.');
      }
    } catch {
      toast.error('Unable to sign in right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="card auth-card">
        <h2>Sign in</h2>
        <p className="muted">Welcome back. Access your account and continue safely.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="email" name="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" required />
          <input type="password" name="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" required />
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="helper-links">
          <NavLink to="/forgot-password">Forgot password?</NavLink>
          <NavLink to="/register">Create account</NavLink>
        </p>
      </div>
    </section>
  );
};

const RegisterPage = ({ refreshUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/register', form);
      if (data.success) {
        toast.success('Account created successfully.');
        await refreshUser();
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Unable to create account.');
      }
    } catch {
      toast.error('Unable to create account right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="card auth-card">
        <h2>Create account</h2>
        <p className="muted">Join today and take full control of your account.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" required />
          <input type="email" name="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" required />
          <input type="password" name="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" required />
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="helper-links">
          <NavLink to="/login">Already have an account?</NavLink>
        </p>
      </div>
    </section>
  );
};

const ForgotPasswordPage = () => {
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '' });
  const [step, setStep] = useState('email');
  const [submitting, setSubmitting] = useState(false);

  const requestOtp = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/send-reset-otp', { email: form.email });
      if (data.success) {
        toast.success('A reset code has been sent.');
        setStep('reset');
      } else {
        toast.error(data.message || 'Could not send reset code.');
      }
    } catch {
      toast.error('Unable to send reset code right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      if (data.success) {
        toast.success('Password updated successfully.');
        setStep('done');
      } else {
        toast.error(data.message || 'Unable to change password.');
      }
    } catch {
      toast.error('Unable to reset password right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="card auth-card">
        <h2>Reset password</h2>
        <p className="muted">Enter your email to receive a one-time code, then create a new password.</p>
        {step === 'email' ? (
          <form onSubmit={requestOtp} className="auth-form">
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" required />
            <button className="button primary" type="submit" disabled={submitting}>
              {submitting ? 'Sending code...' : 'Send reset code'}
            </button>
          </form>
        ) : step === 'reset' ? (
          <form onSubmit={resetPassword} className="auth-form">
            <input type="text" value={form.otp} onChange={(event) => setForm({ ...form, otp: event.target.value })} placeholder="Verification code" required />
            <input type="password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} placeholder="New password" required />
            <button className="button primary" type="submit" disabled={submitting}>
              {submitting ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        ) : (
          <div className="success-card">
            <h3>Password updated</h3>
            <p>You can now sign in with the new password.</p>
            <NavLink className="button primary" to="/login">Go to login</NavLink>
          </div>
        )}
      </div>
    </section>
  );
};

const DashboardPage = ({ user, refreshUser }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [processing, setProcessing] = useState(false);

  const sendVerification = async () => {
    setProcessing(true);
    try {
      const { data } = await api.post('/auth/send-verify-otp', { userId: user.id });
      if (data.success) {
        toast.success('Verification code sent.');
        setOtpSent(true);
      } else {
        toast.error(data.message || 'Could not send code.');
      }
    } catch {
      toast.error('Unable to send verification code.');
    } finally {
      setProcessing(false);
    }
  };

  const verifyAccount = async (event) => {
    event.preventDefault();
    setProcessing(true);
    try {
      const { data } = await api.post('/auth/verify-account', { userId: user.id, otp });
      if (data.success) {
        toast.success('Account verified successfully!');
        await refreshUser();
        setOtpSent(false);
        setOtp('');
      } else {
        toast.error(data.message || 'Invalid verification code.');
      }
    } catch {
      toast.error('Unable to verify account right now.');
    } finally {
      setProcessing(false);
    }
  };

  const sendResetCode = async () => {
    setProcessing(true);
    try {
      const { data } = await api.post('/auth/send-reset-otp', { email: user.email });
      if (data.success) {
        toast.success('A reset code has been sent to your email.');
      } else {
        toast.error(data.message || 'Could not send reset code.');
      }
    } catch {
      toast.error('Unable to send reset code right now.');
    } finally {
      setProcessing(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setProcessing(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: user.email,
        otp,
        newPassword,
      });
      if (data.success) {
        toast.success('Password updated successfully.');
        setOtp('');
        setNewPassword('');
      } else {
        toast.error(data.message || 'Unable to change password.');
      }
    } catch {
      toast.error('Unable to reset password right now.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="dashboard-grid">
      <div className="card dashboard-card">
        <h2>Welcome, {user.username}</h2>
        <p className="muted">Your account is {user.isAccountVerified ? 'verified' : 'pending verification'}.</p>
        <ul className="profile-list">
          <li>
            <strong>Email</strong>
            <span>{user.email}</span>
          </li>
          <li>
            <strong>Status</strong>
            <span>{user.isAccountVerified ? 'Verified' : 'Needs verification'}</span>
          </li>
        </ul>

        {!user.isAccountVerified && (
          <div className="inline-actions">
            <button className="button secondary" type="button" onClick={sendVerification} disabled={processing}>
              Send verification code
            </button>
            {otpSent && (
              <form className="inline-form" onSubmit={verifyAccount}>
                <input type="text" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Verification code" required />
                <button className="button primary" type="submit" disabled={processing}>
                  Verify account
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="card dashboard-card">
        <h3>Reset password</h3>
        <p className="muted">Use a one-time code to change your password securely.</p>
        <div className="auth-form">
          <button className="button secondary" type="button" onClick={sendResetCode} disabled={processing}>
            Send reset code
          </button>
          <form onSubmit={resetPassword} className="auth-form">
            <input type="text" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Verification code" required />
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" required />
            <button className="button primary" type="submit" disabled={processing}>
              Update password
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;