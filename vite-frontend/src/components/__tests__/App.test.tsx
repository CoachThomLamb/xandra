import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserRole } from '../../firebaseConfig';

// Mock Firebase auth and config
vi.mock('firebase/auth');
vi.mock('../../firebaseConfig', () => ({
  auth: {},
  db: {},
  getUserRole: vi.fn().mockResolvedValue('user')
}));

describe('App Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('should not show logout button when user is not logged in', () => {
    // Mock the auth state as not logged in
    (onAuthStateChanged as vi.Mock).mockImplementation((auth, callback) => {
      callback(null);
      return vi.fn(); // Return the unsubscribe function
    });

    render(<App />);
    
    // Check that the logout button is not present
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    expect(screen.getByText('Login with Popup')).toBeInTheDocument();
  });

  it('should show logout button when user is logged in', () => {
    // Mock the auth state as logged in
    const mockUser = { uid: 'test-user-123' };
    (onAuthStateChanged as vi.Mock).mockImplementation((auth, callback) => {
      callback(mockUser);
      return vi.fn(); // Return the unsubscribe function
    });

    render(<App />);
    
    // Check that the logout button is present
    expect(screen.getByText('Logout')).toBeInTheDocument();
    // And login button is not present
    expect(screen.queryByText('Login with Popup')).not.toBeInTheDocument();
  });

  it('should show admin link when user is an admin', async () => {
    // Mock the auth state as logged in with admin role
    const mockUser = { uid: 'admin-user-123' };
    (onAuthStateChanged as vi.Mock).mockImplementation((auth, callback) => {
      callback(mockUser);
      return vi.fn(); // Return the unsubscribe function
    });
    
    // Mock the getUserRole to return 'admin'
    (getUserRole as vi.Mock).mockResolvedValue('admin');

    render(<App />);
    
    // Wait for admin link to appear (it's fetched asynchronously)
    const adminLink = await screen.findByText('Admin Dashboard');
    
    expect(adminLink).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
