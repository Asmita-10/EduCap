import { Settings, Bell, Download, Database, Mail } from "lucide-react";

const AdminSettingsPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-[var(--primary)] tracking-tight">
              Platform Settings
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Configure automated alerts, event triggers, and database export preferences.
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-7 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-lg font-bold font-['Outfit'] text-[var(--primary)]">
              Email Notifications
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/60">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-semibold text-sm text-[var(--primary)]">New Student Signups</p>
                  <p className="text-xs text-gray-500">Receive an instant email summary when a new user registers</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-[var(--accent)] rounded-full relative cursor-pointer shadow-inner">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/60">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-semibold text-sm text-[var(--primary)]">Tier Upgrades</p>
                  <p className="text-xs text-gray-500">Receive alerts when a user subscribes to Plus or Pro</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-[var(--accent)] rounded-full relative cursor-pointer shadow-inner">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/60">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-semibold text-sm text-[var(--primary)]">Subscription Cancellations</p>
                  <p className="text-xs text-gray-500">Notify the team when a recurring plan is set to cancel</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-7">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-lg font-bold font-['Outfit'] text-[var(--primary)]">
              Data Management & Backup
            </h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Export raw records for external business intelligence and audits.
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[var(--primary)] rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer shadow-sm">
            <Download className="w-4 h-4 text-gray-500" />
            Export Users (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
