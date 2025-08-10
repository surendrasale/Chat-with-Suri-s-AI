import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { signupWithFirebase, loginWithGoogle, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signupWithFirebase(
      formData.email, 
      formData.password, 
      formData.confirmPassword
    );
    if (result.success) {
      navigate('/chat');
    }
  };

  const handleGoogleSignup = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      navigate('/chat');
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="heading">Sign Up</div>
        <form className="form" onSubmit={handleSubmit}>
          <input 
            required 
            className="input" 
            type="email" 
            name="email" 
            id="email" 
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
          />
          <input 
            required 
            className="input" 
            type="password" 
            name="password" 
            id="password" 
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            minLength="6"
          />
          <input 
            required 
            className="input" 
            type="password" 
            name="confirmPassword" 
            id="confirmPassword" 
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength="6"
          />
          <input 
            className="login-button" 
            type="submit" 
            value={loading ? "Creating Account..." : "Sign Up"}
            disabled={loading}
          />
        </form>
        <div className="social-account-container">
          <span className="title">Or</span>
          <div className="social-accounts">
            <button
              type="button"
              className="button"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285F4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34A853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                ></path>
                <path
                  fill="#EB4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
        <span className="agreement">
          <Link to="/login">Already have an account? Sign In</Link>
        </span>
      </div>
    </div>
  );
};


export default Signup;