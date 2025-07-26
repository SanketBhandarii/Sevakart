import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Phone, MapPin, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || ''
  });

  const handleSave = () => {
    // In a real app, this would update the user profile via API
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      location: currentUser?.location || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">Profile</h1>
        <p className="text-text-gray">Manage your account information</p>
      </div>

      <div className="max-w-2xl">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-dark">Account Information</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-text-gray hover:bg-gray-50 flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                />
              ) : (
                <p className="text-text-dark bg-gray-50 p-3 rounded-lg">{currentUser?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                />
              ) : (
                <p className="text-text-dark bg-gray-50 p-3 rounded-lg">+91 {currentUser?.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                <MapPin className="inline h-4 w-4 mr-2" />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="input-field"
                />
              ) : (
                <p className="text-text-dark bg-gray-50 p-3 rounded-lg">{currentUser?.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Account Type
              </label>
              <p className="text-text-dark bg-gray-50 p-3 rounded-lg capitalize">{currentUser?.role}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mt-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4">Business Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary-purple/10 rounded-lg">
              <p className="text-2xl font-bold text-primary-purple">24</p>
              <p className="text-sm text-text-gray">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-2xl font-bold text-success">₹12,450</p>
              <p className="text-sm text-text-gray">This Month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;