import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found');
      return;
    }

    const verifyEmail = async () => {
      try {
        console.log('Verifying email with token:', token);
        const response = await api.post('/auth/verify-email', { token });
        console.log('Verification response:', response.data);
        
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className="auth-layout">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>Verifying Your Email...</h2>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            margin: '20px auto',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid var(--clr-gold, #1A2744)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Please wait while we verify your account...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="auth-layout">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ marginBottom: '10px' }}>Email Verified!</h2>
          <p style={{ color: 'var(--clr-text-muted)', marginBottom: '20px' }}>
            {message}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>
            Redirecting to login page...
          </p>
          <Link to="/login" style={{
            display: 'inline-block',
            marginTop: '20px',
            color: 'var(--clr-gold)',
            textDecoration: 'none'
          }}>
            Click here if not redirected
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
        <h2 style={{ marginBottom: '10px' }}>Verification Failed</h2>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '20px' }}>
          {message}
        </p>
        <Link to="/resend-verification" style={{
          display: 'inline-block',
          color: 'var(--clr-gold)',
          textDecoration: 'none'
        }}>
          Request a new verification link
        </Link>
      </div>
    </div>
  );
}