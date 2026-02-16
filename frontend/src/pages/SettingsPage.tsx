import { useState } from 'react';
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Shield,
  Leaf,
  ExternalLink,
  Check,
  Crown,
  Sparkles,
} from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['2 sources', '500 files', '5 rules', '50 AI categorizations/mo', 'Basic search'],
    color: '#8f8575',
    current: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    features: ['10 sources', '50,000 files', '100 rules', '500 AI categorizations/mo', 'Smart search', 'File conversion', 'Scheduled automation', 'Priority support'],
    color: '#d4ad2e',
    current: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    features: ['Unlimited sources', 'Unlimited files', 'Unlimited rules', '5,000 AI categorizations/mo', 'Crossover memory', 'Custom integrations', 'Dedicated support', 'SSO / SAML', 'Audit logs'],
    color: '#a83830',
    current: false,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'eco', label: 'Eco Settings', icon: Leaf },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-earth-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-gold-400" aria-hidden="true" />
          Settings
        </h1>
        <p className="text-sm text-charcoal-300 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2" role="tablist" aria-label="Settings sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gold-500/15 text-gold-300'
                : 'text-charcoal-300 hover:bg-charcoal-800/30 hover:text-earth-200'
            }`}
          >
            <tab.icon className="w-4 h-4" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-6 space-y-5" id="panel-profile" role="tabpanel" aria-label="Profile settings">
          <h2 className="text-lg font-semibold text-earth-200">Profile Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-charcoal-200 mb-1">Display Name</label>
              <input id="display-name" type="text" className="input-field" defaultValue="Audrey Evans" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-200 mb-1">Email</label>
              <input id="email" type="email" className="input-field" defaultValue="audrey@glowstarlabs.com" disabled />
            </div>
          </div>
          <button className="btn-primary">Save Changes</button>
        </div>
      )}

      {/* Billing tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6" id="panel-billing" role="tabpanel" aria-label="Billing settings">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`glass-panel p-6 relative ${tier.current ? 'border-glow-gold' : ''}`}
                style={tier.current ? { borderColor: 'rgba(212,173,46,0.3)' } : {}}
                role="region"
                aria-label={`${tier.name} plan`}
              >
                {tier.current && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-success flex items-center gap-1 px-3">
                      <Crown className="w-3 h-3" aria-hidden="true" />
                      Current Plan
                    </span>
                  </div>
                )}
                <div className="text-center mb-4 pt-2">
                  <h3 className="text-lg font-bold" style={{ color: tier.color }}>{tier.name}</h3>
                  <p className="text-2xl font-bold text-earth-100 mt-1">
                    {tier.price}
                    <span className="text-sm text-charcoal-400 font-normal">{tier.period}</span>
                  </p>
                </div>
                <ul className="space-y-2 mb-6" role="list">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-charcoal-200">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: tier.color }} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {tier.current ? (
                  <button className="btn-secondary w-full" disabled>Current Plan</button>
                ) : (
                  <button className="btn-primary w-full">
                    {tier.price === '$0' ? 'Downgrade' : 'Upgrade'}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="glass-panel p-4 text-center">
            <p className="text-xs text-charcoal-400">
              Payment processing provided by{' '}
              <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:text-gold-400 underline" aria-label="Stripe (opens in new tab)">
                Stripe
              </a>
              . Secure, encrypted, PCI-compliant.
            </p>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <div className="glass-panel p-6 space-y-5" id="panel-notifications" role="tabpanel" aria-label="Notification settings">
          <h2 className="text-lg font-semibold text-earth-200">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { id: 'notify-sync', label: 'Sync completed', description: 'Notify when a source scan or sync finishes' },
              { id: 'notify-duplicate', label: 'Duplicates found', description: 'Alert when new duplicates are detected' },
              { id: 'notify-rule', label: 'Rule triggered', description: 'Notify when a routing rule processes files' },
              { id: 'notify-ai', label: 'AI categorization', description: 'Notify when AI finishes categorizing files' },
              { id: 'notify-error', label: 'Errors', description: 'Alert on sync errors or connection issues' },
            ].map((item) => (
              <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-charcoal-800/20 cursor-pointer transition-colors">
                <input type="checkbox" id={item.id} defaultChecked className="mt-1 rounded border-charcoal-600" />
                <div>
                  <p className="text-sm font-medium text-earth-200">{item.label}</p>
                  <p className="text-xs text-charcoal-400">{item.description}</p>
                </div>
              </label>
            ))}
          </div>
          <button className="btn-primary">Save Preferences</button>
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="glass-panel p-6 space-y-5" id="panel-security" role="tabpanel" aria-label="Security settings">
          <h2 className="text-lg font-semibold text-earth-200">Security</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-charcoal-200 mb-1">Current Password</label>
              <input id="current-password" type="password" className="input-field" />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-charcoal-200 mb-1">New Password</label>
              <input id="new-password" type="password" className="input-field" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-charcoal-200 mb-1">Confirm New Password</label>
              <input id="confirm-password" type="password" className="input-field" />
            </div>
          </div>
          <button className="btn-primary">Update Password</button>

          <div className="pt-4 border-t border-charcoal-800/30">
            <h3 className="text-sm font-medium text-earth-200 mb-3">Connected Accounts</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900/30">
                <span className="text-sm text-charcoal-200">Google Account</span>
                <span className="badge-success">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900/30">
                <span className="text-sm text-charcoal-200">GitHub Account</span>
                <span className="badge-success">Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Eco tab */}
      {activeTab === 'eco' && (
        <div className="glass-panel p-6 space-y-5" id="panel-eco" role="tabpanel" aria-label="Eco settings">
          <h2 className="text-lg font-semibold text-earth-200 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-forest-500" aria-hidden="true" />
            Carbon Efficiency Settings
          </h2>
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-charcoal-800/20 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1 rounded border-charcoal-600" />
              <div>
                <p className="text-sm font-medium text-earth-200">Enable carbon tracking</p>
                <p className="text-xs text-charcoal-400">Track estimated CO2 emissions from API calls and data transfers</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-charcoal-800/20 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1 rounded border-charcoal-600" />
              <div>
                <p className="text-sm font-medium text-earth-200">Eco-mode scheduling</p>
                <p className="text-xs text-charcoal-400">Schedule heavy processing during off-peak energy hours</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-charcoal-800/20 cursor-pointer">
              <input type="checkbox" className="mt-1 rounded border-charcoal-600" />
              <div>
                <p className="text-sm font-medium text-earth-200">Minimal data transfer mode</p>
                <p className="text-xs text-charcoal-400">Reduce API payload sizes and compress transfers</p>
              </div>
            </label>
          </div>
          <button className="btn-primary">Save Eco Settings</button>
        </div>
      )}

      {/* GlowStarLabs ecosystem link */}
      <div className="glass-panel p-4 text-center">
        <p className="text-xs text-charcoal-400">
          Part of the{' '}
          <a
            href="https://meetaudreyevans.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-500 hover:text-gold-400 inline-flex items-center gap-1"
            aria-label="Visit GlowStarLabs ecosystem hub (opens in new tab)"
          >
            GlowStarLabs / Audrey Evans Ecosystem
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </p>
      </div>
    </div>
  );
}
