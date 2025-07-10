'use client';

import { useState } from 'react';
import { MarkdownEditor } from '../../../../components/MarkdownEditor';
import { MarkdownContent } from '../../../../components/MarkdownContent';
import PhoneNumberInput from '../../../../components/PhoneNumberInput';
import CountrySelect from '../../../../components/CountrySelect';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X
} from 'lucide-react';

export default function UserProfileHeader({ 
  user, 
  isOwnProfile, 
  postCounts, 
  totalLikes, 
  totalComments,
  onSave 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    bio: user.bio || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || '',
    address: {
      city: user.address?.city || '',
      country: user.address?.country || ''
    }
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!editForm.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!editForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!editForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const success = await onSave(editForm);
      if (success) {
        setIsEditing(false);
      }
    } catch (err) {
      setErrors({ submit: 'Network error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      bio: user.bio || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
      address: {
        city: user.address?.city || '',
        country: user.address?.country || ''
      }
    });
    setIsEditing(false);
    setErrors({});
  };

  const getUserFullName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.username || user.email;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneNumberInput
                  value={editForm.phone}
                  onChange={(value) => setEditForm({ ...editForm, phone: value || '' })}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  International format with country code
                </p>
              </div>
              
              <div>
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={editForm.avatarUrl}
                  onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <CountrySelect
                    value={editForm.address.country}
                    onChange={(value) => setEditForm({ 
                      ...editForm, 
                      address: { ...editForm.address, country: value }
                    })}
                    placeholder="Select your country"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={editForm.address.city}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      address: { ...editForm.address, city: e.target.value }
                    })}
                    placeholder="Ho Chi Minh City"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <div className="mt-1">
                  <MarkdownEditor
                    value={editForm.bio}
                    onChange={(value) => setEditForm({ ...editForm, bio: value || '' })}
                    preview="live"
                    hideToolbar={false}
                    data-color-mode="auto"
                    placeholder="Tell us about yourself using Markdown..."
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You can use Markdown formatting in your bio
                </p>
              </div>
              
              {errors.submit && (
                <div className="text-red-500 dark:text-red-400 text-sm">{errors.submit}</div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button 
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                {user.avatarUrl && (
                  <img 
                    src={user.avatarUrl} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full mr-4 object-cover"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {getUserFullName(user)}
                  </h1>
                  <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {formatDate(user.createdAt)}
                </div>
                {user.phone && (
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📞</span>
                    {user.phone}
                  </div>
                )}
                {(user.address?.city || user.address?.country) && (
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📍</span>
                    {[user.address?.country, user.address?.city].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
              
              {user.bio && (
                <div className="prose dark:prose-invert prose-sm max-w-none mb-4">
                  <MarkdownContent content={user.bio} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {isOwnProfile ? postCounts.total : postCounts.published}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {isOwnProfile ? 'Total Posts' : 'Posts'}
          </div>
          {isOwnProfile && postCounts.draft > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {postCounts.published} published, {postCounts.draft} draft
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalLikes}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Likes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalComments}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Comments</div>
        </div>
      </div>
      
      {/* Edit Profile Button */}
      {isOwnProfile && !isEditing && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button 
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}
