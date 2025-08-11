import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

interface GeneralSettings { companyName: string; timezone: string; currency: string; }
interface NotificationSettings { email: boolean; sms: boolean; app: boolean; }

const SettingsPage: React.FC = () => {
  const [general, setGeneral] = useState<GeneralSettings>({ companyName: '', timezone: 'Asia/Kolkata', currency: 'INR' });
  const [notify, setNotify] = useState<NotificationSettings>({ email: true, sms: false, app: true });

  useEffect(() => {
    try {
      const g = JSON.parse(localStorage.getItem('settings_general') || 'null');
      const n = JSON.parse(localStorage.getItem('settings_notify') || 'null');
      if (g) setGeneral(g);
      if (n) setNotify(n);
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem('settings_general', JSON.stringify(general));
    localStorage.setItem('settings_notify', JSON.stringify(notify));
    alert('Settings saved');
  };

  return (
    <Layout title="Settings" showTabs={true} activeTab="settings">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
              <input value={general.companyName} onChange={(e) => setGeneral({ ...general, companyName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
              <select value={general.timezone} onChange={(e) => setGeneral({ ...general, timezone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select value={general.currency} onChange={(e) => setGeneral({ ...general, currency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={notify.email} onChange={(e) => setNotify({ ...notify, email: e.target.checked })} />
              <span>Email Notifications</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={notify.sms} onChange={(e) => setNotify({ ...notify, sms: e.target.checked })} />
              <span>SMS Notifications</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={notify.app} onChange={(e) => setNotify({ ...notify, app: e.target.checked })} />
              <span>App Notifications</span>
            </label>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={save} className="btn-primary">Save Settings</button>
      </div>
    </Layout>
  );
};

export default SettingsPage;


