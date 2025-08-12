import React, { useRef, useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';
import { Camera, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  // Parse address from user data
  useEffect(() => {
    if (user?.address) {
      const addressParts = user.address.split(', ');
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        address: addressParts[0] || '',
        city: addressParts[1] || '',
        state: addressParts[2] || '',
        zip: addressParts[3] || '',
        country: addressParts[4] || '',
      }));
    }
  }, [user]);

  const onSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    
    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('phone_number', form.phone_number);
      fd.append('address', form.address);
      fd.append('city', form.city);
      fd.append('state', form.state);
      fd.append('zip', form.zip);
      fd.append('country', form.country);
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await fetch('http://localhost:8000/api/v1/users/update-profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
        body: fd,
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || 'Failed to update profile');

      // Update local user context
      const fullAddress = [form.address, form.city, form.state, form.zip, form.country].filter(Boolean).join(', ');
    updateUser({
      name: form.name,
      email: form.email,
        address: fullAddress,
        avatarUrl: payload?.data?.user?.avatar_image_url || user?.avatarUrl,
      });

      alert('Profile updated successfully');
      setAvatarFile(null);
    } catch (error: any) {
      alert(error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Profile">
      <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
        <div className="flex items-center space-x-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Avatar</div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full"
            >
              <Camera size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onSelectAvatar} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                className="input-field" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                className="input-field" 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              className="input-field" 
              value={form.phone_number} 
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input 
              className="input-field" 
              value={form.address} 
              onChange={(e) => setForm({ ...form, address: e.target.value })} 
              placeholder="Street, Apartment"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input 
              className="input-field" 
              value={form.city} 
              onChange={(e) => setForm({ ...form, city: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input 
              className="input-field" 
              value={form.state} 
              onChange={(e) => setForm({ ...form, state: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
            <input 
              className="input-field" 
              value={form.zip} 
              onChange={(e) => setForm({ ...form, zip: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input 
              className="input-field" 
              value={form.country} 
              onChange={(e) => setForm({ ...form, country: e.target.value })} 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary flex items-center space-x-2"
        >
          <Save size={16} />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </form>
    </Layout>
  );
};

export default ProfilePage;
