import React, { useState, useEffect, useCallback } from 'react';
import { fetchUserData, updateUserProfile } from '@/services/api';
import { validateEmail, validatePhone } from '@/utils/validation';
import { useDebounce } from '@/hooks/useDebounce';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive' | 'suspended';
  metadata?: {
    lastLogin?: string;
    preferences?: Record<string, unknown>;
  };
}

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
  readonly?: boolean;
  theme?: 'light' | 'dark';
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUpdate,
  readonly = false,
  theme = 'light',
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const debouncedEmail = useDebounce(formData.email || '', 500);

  useEffect(() => {
    loadUser();
  }, [userId]);

  useEffect(() => {
    if (debouncedEmail && editMode) {
      validateEmailField(debouncedEmail);
    }
  }, [debouncedEmail]);

  const loadUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserData(userId);
      setUser(data);
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const validateEmailField = async (email: string) => {
    if (!validateEmail(email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Invalid email format' }));
    } else {
      setValidationErrors(prev => {
        const { email: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email || !validateEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Invalid phone format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = useCallback((field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleRoleChange = (role: User['role']) => {
    if (user?.role === 'admin' || readonly) {
      return;
    }
    setFormData(prev => ({ ...prev, role }));
  };

  const handleStatusToggle = () => {
    if (readonly) return;
    
    const newStatus = formData.status === 'active' ? 'inactive' : 'active';
    setFormData(prev => ({ ...prev, status: newStatus }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await updateUserProfile(userId, formData);
      setUser(updatedUser);
      setEditMode(false);
      onUpdate?.(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(user || {});
    setValidationErrors({});
    setEditMode(false);
  };

  const getRoleBadgeColor = (role: User['role']): string => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'user':
        return 'blue';
      case 'guest':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusBadgeColor = (status: User['status']): string => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'yellow';
      case 'suspended':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatLastLogin = (lastLogin?: string): string => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (loading && !user) {
    return <div className="spinner">Loading...</div>;
  }

  if (error && !user) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={loadUser}>Retry</button>
      </div>
    );
  }

  if (!user) {
    return <div className="empty-state">No user found</div>;
  }

  return (
    <div className={`user-profile ${theme}`} data-testid="user-profile">
      <div className="profile-header">
        <h2>{user.name}</h2>
        <div className="badges">
          <span className={`badge ${getRoleBadgeColor(user.role)}`}>
            {user.role}
          </span>
          <span className={`badge ${getStatusBadgeColor(user.status)}`}>
            {user.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={editMode ? formData.name || '' : user.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!editMode || loading}
            aria-invalid={!!validationErrors.name}
          />
          {validationErrors.name && (
            <span className="error-text">{validationErrors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={editMode ? formData.email || '' : user.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!editMode || loading}
            aria-invalid={!!validationErrors.email}
          />
          {validationErrors.email && (
            <span className="error-text">{validationErrors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={editMode ? formData.phone || '' : user.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!editMode || loading}
            aria-invalid={!!validationErrors.phone}
          />
          {validationErrors.phone && (
            <span className="error-text">{validationErrors.phone}</span>
          )}
        </div>

        {editMode && (
          <>
            <div className="form-group">
              <label>Role</label>
              <div className="radio-group">
                {(['admin', 'user', 'guest'] as const).map((role) => (
                  <label key={role}>
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={() => handleRoleChange(role)}
                      disabled={user.role === 'admin' || loading}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.status === 'active'}
                  onChange={handleStatusToggle}
                  disabled={loading}
                />
                Active Status
              </label>
            </div>
          </>
        )}

        <div className="metadata">
          <p>Last Login: {formatLastLogin(user.metadata?.lastLogin)}</p>
        </div>

        {!readonly && (
          <div className="actions">
            {editMode ? (
              <>
                <button
                  type="submit"
                  disabled={loading || Object.keys(validationErrors).length > 0}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
