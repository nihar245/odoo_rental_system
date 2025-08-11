import React, { useRef, useState } from 'react';
import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';
import { Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    line1: user?.address?.line1 ?? '',
    city: user?.address?.city ?? '',
    state: user?.address?.state ?? '',
    zip: user?.address?.zip ?? '',
    country: user?.address?.country ?? '',
  });

  const onSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: form.name,
      email: form.email,
      address: {
        line1: form.line1,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
      },
    });
    alert('Profile updated');
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
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input className="input-field" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Street, Apartment" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input className="input-field" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
            <input className="input-field" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input className="input-field" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
        </div>

        <button className="btn-primary">Save Changes</button>
      </form>
    </Layout>
  );
};

export default ProfilePage;
