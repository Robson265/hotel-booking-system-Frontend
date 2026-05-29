import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const CheckEmail: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="check-email-container">
      <div className="email-icon">📧</div>
      <h2>Check Your Email</h2>
      <p>
        We've sent a verification link to <strong>{email}</strong>
      </p>
      <p>
        Please check your inbox and click the verification link to activate your account.
      </p>
      <p className="note">
        Didn't receive the email? Check your spam folder or 
        <Link to="/resend-verification"> request a new link</Link>
      </p>
      <Link to="/login" className="button">
        Back to Login
      </Link>
    </div>
  );
};

export default CheckEmail;