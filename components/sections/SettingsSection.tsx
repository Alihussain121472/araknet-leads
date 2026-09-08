import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Shield, 
  Bell, 
  Calendar, 
  Save, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { UserSettings } from '@/lib/types';
import { COUNTRIES_AND_CITIES } from '@/lib/constants';

interface SettingsSectionProps {
  onSaveSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ onSaveSettings }) => {
  const [settings, setSettings] = useState<UserSettings>({
    user_id: 'default_user',
    google_places_api_key: '',
    serpapi_api_key: '',
    apify_api_key: '',
    openai_api_key: '',
    schedule_enabled: false,
    schedule_frequency: 'daily',
    schedule_country: 'United States',
    schedule_city: 'Austin',
    schedule_industry: 'All',
    notify_on_complete: false,
    notification_email: '',
  });

  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) setSettings(data.settings);
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSaveSettings(settings); } catch { setSaveError('Settings could not be saved. Please retry.'); setSaving(false); return; }
    setSaveError('');
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {saveError && <p role="alert" className="text-rose-400">{saveError}</p>}
      {/* API Key Vault */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            Directory API Keys
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Keys are stored privately on the server and masked on retrieval. Without directory keys, searches use OpenStreetMap. App and website quality assessments require manual verification.
          </p>
        </div>

        <div className="space-y-4">
          {/* Google Places API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Google Places API Key (Primary Directory)
              </label>
              <a
                href="https://console.cloud.google.com/google/maps-apis/overview"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Get Google Places Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={settings.google_places_api_key || ''}
                onChange={(e) => setSettings({ ...settings, google_places_api_key: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* SerpAPI Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                SerpAPI Key (Fallback Google Maps Scraper)
              </label>
              <a
                href="https://serpapi.com/manage-api-key"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Get SerpAPI Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="e.g. 84bfb8d..."
              value={settings.serpapi_api_key || ''}
              onChange={(e) => setSettings({ ...settings, serpapi_api_key: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>


        </div>
      </div>

      {/* Scheduled Automation Settings */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Agent Schedule Configuration
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Automate weekly or daily market discovery runs to continuously fill your leads pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Default Target Country</label>
            <select
              value={settings.schedule_country}
              onChange={(e) => setSettings({ ...settings, schedule_country: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {Object.keys(COUNTRIES_AND_CITIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Default Target City</label>
            <input
              type="text"
              value={settings.schedule_city}
              onChange={(e) => setSettings({ ...settings, schedule_city: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-400">Scoring and suggested services use directory data and industry rules. Email alerts and AI-generated pitches are not enabled.</p>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>

        {saveSuccess && (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Settings saved successfully!
          </span>
        )}
      </div>
    </form>
  );
};
