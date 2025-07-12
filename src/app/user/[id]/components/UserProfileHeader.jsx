'use client';

import { useState } from 'react';
import { MarkdownEditor } from '../../../../components/MarkdownEditor';
import { MarkdownContent } from '../../../../components/MarkdownContent';
import PhoneNumberInput from '../../../../components/PhoneNumberInput';
import CountrySelect from '../../../../components/CountrySelect';
import AvatarUpload from '../../../../components/AvatarUpload';
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
  const [currentAvatar, setCurrentAvatar] = useState(user.avatarUrl || '');
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

  const handleAvatarUpdated = (newAvatarUrl) => {
    setCurrentAvatar(newAvatarUrl);
    setEditForm(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
    // Trigger parent component update if needed
    if (onSave) {
      onSave({ ...editForm, avatarUrl: newAvatarUrl });
    }
  };

  const handleAvatarDeleted = () => {
    setCurrentAvatar('');
    setEditForm(prev => ({ ...prev, avatarUrl: '' }));
    // Trigger parent component update if needed
    if (onSave) {
      onSave({ ...editForm, avatarUrl: '' });
    }
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 max-w-full overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">{/* min-w-0 prevents flex item from overflowing */}
          {isEditing ? (
            <div className="space-y-4">
              {/* Name fields - responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className={`${errors.firstName ? 'border-red-500' : ''} text-sm`}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 dark:text-red-400 text-xs">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className={`${errors.lastName ? 'border-red-500' : ''} text-sm`}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 dark:text-red-400 text-xs">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              {/* Email field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={`${errors.email ? 'border-red-500' : ''} text-sm`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs">{errors.email}</p>
                )}
              </div>
              
              {/* Phone field */}
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <PhoneNumberInput
                  value={editForm.phone}
                  onChange={(value) => setEditForm({ ...editForm, phone: value || '' })}
                  placeholder="Enter your phone number"
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  International format with country code
                </p>
              </div>
              
              {/* Avatar field */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">Profile Photo</Label>
                <AvatarUpload
                  userId={user.id}
                  currentAvatarUrl={currentAvatar}
                  onAvatarUpdated={handleAvatarUpdated}
                  onAvatarDeleted={handleAvatarDeleted}
                />
              </div>
              
              {/* Location fields - responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                  <CountrySelect
                    value={editForm.address.country}
                    onChange={(value) => setEditForm({ 
                      ...editForm, 
                      address: { ...editForm.address, country: value }
                    })}
                    placeholder="Select country"
                    className="text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-sm font-medium">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={editForm.address.city}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      address: { ...editForm.address, city: e.target.value }
                    })}
                    placeholder="Enter your city"
                    className="text-sm"
                  />
                </div>
              </div>
              
              {/* Bio field */}
              <div className="space-y-1">
                <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                <div className="border rounded-md">
                  <MarkdownEditor
                    value={editForm.bio}
                    onChange={(value) => setEditForm({ ...editForm, bio: value || '' })}
                    preview="live"
                    hideToolbar={false}
                    data-color-mode="auto"
                    placeholder="Tell us about yourself using Markdown..."
                    className="min-h-[120px]"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You can use Markdown formatting in your bio
                </p>
              </div>
              
              {errors.submit && (
                <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {errors.submit}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button 
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {/* User header with avatar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                {currentAvatar && (
                  <img 
                    src={currentAvatar} 
                    alt="Avatar" 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 mx-auto sm:mx-0"
                  />
                )}
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 break-words">
                    {getUserFullName(user)}
                  </h1>
                  <div className="text-sm text-gray-500 dark:text-gray-400 break-all">@{user.username}</div>
                </div>
              </div>
              
              {/* User details */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center flex-wrap gap-1">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="break-all">{user.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 flex-shrink-0">📞</span>
                    <span className="break-all">{user.phone}</span>
                  </div>
                )}
                {(user.address?.city || user.address?.country) && (
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 flex-shrink-0">📍</span>
                    <span className="break-words">
                      {[user.address?.country, user.address?.city].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Bio */}
              {user.bio && (
                <div className="prose dark:prose-invert prose-sm max-w-none mb-4 break-words">
                  <MarkdownContent content={user.bio} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {isOwnProfile ? postCounts.total : postCounts.published}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {isOwnProfile ? 'Total Posts' : 'Posts'}
          </div>
          {isOwnProfile && postCounts.draft > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {postCounts.published} published, {postCounts.draft} draft
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalLikes}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Total Likes</div>
        </div>
        <div className="text-center pb-4">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalComments}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Total Comments</div>
        </div>
      </div>
      
      {/* Edit Profile Button */}
      {isOwnProfile && !isEditing && (
        <div className="flex justify-center sm:justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button 
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}
