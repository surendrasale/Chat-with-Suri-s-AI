import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  signInWithGoogle, 
  signUpWithEmail, 
  signInWithEmail, 
  resetPassword, 
  logOut 
} from '../config/firebase';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  SIGNUP_START: 'SIGNUP_START',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_FAILURE: 'SIGNUP_FAILURE',
  GOOGLE_LOGIN_START: 'GOOGLE_LOGIN_START',
  GOOGLE_LOGIN_SUCCESS: 'GOOGLE_LOGIN_SUCCESS',
  GOOGLE_LOGIN_FAILURE: 'GOOGLE_LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.SIGNUP_START:
    case AUTH_ACTIONS.GOOGLE_LOGIN_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.SIGNUP_SUCCESS:
    case AUTH_ACTIONS.GOOGLE_LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.SIGNUP_FAILURE:
    case AUTH_ACTIONS.GOOGLE_LOGIN_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
          
          const response = await axios.get('/api/auth/me');
          
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: { user: response.data.user }
          });
        } catch (error) {
          console.error('Load user error:', error);
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAILURE,
            payload: error.response?.data?.message || 'Failed to load user'
          });
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: null
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });

      toast.success('Login successful!');
      return { success: true };

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Signup function
  const signup = async (email, password, confirmPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SIGNUP_START });

      const response = await axios.post('/api/auth/signup', {
        email,
        password,
        confirmPassword
      });

      dispatch({
        type: AUTH_ACTIONS.SIGNUP_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });

      toast.success('Account created successfully!');
      return { success: true };

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Google Login function
  const loginWithGoogle = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.GOOGLE_LOGIN_START });

      const result = await signInWithGoogle();
      
      if (result.success) {
        // Send Firebase token to backend for verification and user creation
        const response = await axios.post('/api/auth/google', {
          firebaseToken: result.token,
          user: {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            uid: result.user.uid
          }
        });

        dispatch({
          type: AUTH_ACTIONS.GOOGLE_LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token
          }
        });

        toast.success('Google login successful!');
        return { success: true };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Google login failed';
      
      dispatch({
        type: AUTH_ACTIONS.GOOGLE_LOGIN_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Firebase Email Signup
  const signupWithFirebase = async (email, password, confirmPassword) => {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      dispatch({ type: AUTH_ACTIONS.SIGNUP_START });

      const result = await signUpWithEmail(email, password);
      
      if (result.success) {
        // Send Firebase token to backend
        const response = await axios.post('/api/auth/firebase-signup', {
          firebaseToken: result.token,
          user: {
            email: result.user.email,
            uid: result.user.uid
          }
        });

        dispatch({
          type: AUTH_ACTIONS.SIGNUP_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token
          }
        });

        toast.success('Account created successfully!');
        return { success: true };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Firebase Email Login
  const loginWithFirebase = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const result = await signInWithEmail(email, password);
      
      if (result.success) {
        // Send Firebase token to backend
        const response = await axios.post('/api/auth/firebase-login', {
          firebaseToken: result.token,
          user: {
            email: result.user.email,
            uid: result.user.uid
          }
        });

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token
          }
        });

        toast.success('Login successful!');
        return { success: true };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Forgot Password function
  const forgotPassword = async (email) => {
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        toast.success(result.message);
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to send reset email';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logOut(); // Firebase logout
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT }); // Force logout even if Firebase fails
      toast.success('Logged out successfully');
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    signup,
    loginWithGoogle,
    signupWithFirebase,
    loginWithFirebase,
    forgotPassword,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};