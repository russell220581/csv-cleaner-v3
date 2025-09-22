import { useState } from 'react';
import { Mail, User, Shield, Edit3, Trash2, Save, X } from 'lucide-react';

function UserItem({ user, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleSave = async () => {
    await onUpdate(user._id, {
      name: editedUser.name,
      email: editedUser.email,
      role: editedUser.role,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="user-item">
      <div className="user-info">
        <div className="user-avatar">
          <User size={20} />
        </div>

        <div className="user-details">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editedUser.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="form-input-sm"
              />
              <input
                type="email"
                value={editedUser.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="form-input-sm"
              />
            </>
          ) : (
            <>
              <h4>{user.name}</h4>
              <p>
                <Mail size={14} />
                {user.email}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="user-role">
        {isEditing ? (
          <select
            value={editedUser.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="form-input-sm"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        ) : (
          <span className={`role-badge role-${user.role}`}>
            <Shield size={14} />
            {user.role}
          </span>
        )}
      </div>

      <div className="user-actions">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="btn btn-success btn-sm">
              <Save size={14} />
            </button>
            <button onClick={handleCancel} className="btn btn-secondary btn-sm">
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary btn-sm"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(user._id)}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default UserItem;
