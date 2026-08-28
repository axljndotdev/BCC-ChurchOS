import { CMSButton } from '../../types';
import { Eye, EyeOff, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface ButtonEditorProps {
  label: string;
  button: CMSButton;
  onChange: (updatedButton: CMSButton) => void;
  allowStyle?: boolean;
}

const COMMON_PAGE_ROUTES = [
  { label: 'Home Page', value: '/' },
  { label: 'About BCC', value: '/about' },
  { label: 'Membership & Covenant', value: '/membership' },
  { label: 'Giving & Stewardship', value: '/give' },
  { label: 'Contact & Sanctuary Location', value: '/contact' },
  { label: 'Ministries & Fellowships', value: '/ministries' },
  { label: 'Resources & Downloads', value: '/resources' },
  { label: 'Live Stream Broadcast', value: '/live' },
  { label: 'Church Events Calendar', value: '/events' },
  { label: 'Sermons Library', value: '/sermons' },
  { label: 'Photo Gallery', value: '/gallery' },
  { label: 'Weekly Activities', value: '/activities' },
  { label: 'Prayer Wall', value: '/prayer' },
  { label: 'Articles & Blogs', value: '/blogs' },
  { label: 'Member Portal', value: '/member/dashboard' },
];

export default function ButtonEditor({
  label,
  button,
  onChange,
  allowStyle = true
}: ButtonEditorProps) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
      {/* Header with Visibility Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">{label}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            button.visible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
          }`}>
            {button.visible ? 'Visible' : 'Hidden'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...button, visible: !button.visible })}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
            button.visible
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
          }`}
        >
          {button.visible ? (
            <>
              <EyeOff className="h-3.5 w-3.5" /> Hide Button
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Show Button
            </>
          )}
        </button>
      </div>

      {button.visible && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Button Text */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Button Text / Label
            </label>
            <input
              type="text"
              value={button.label || ''}
              onChange={(e) => onChange({ ...button, label: e.target.value })}
              placeholder="e.g. Plan Your Visit"
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon font-medium"
            />
          </div>

          {/* Preset Link or Custom Link */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
              <span>Destination URL / Link</span>
              <LinkIcon className="h-3 w-3 text-slate-400" />
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={button.url || ''}
                onChange={(e) => onChange({ ...button, url: e.target.value })}
                placeholder="e.g. /about or https://..."
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon font-mono"
              />
              <select
                value={button.url}
                onChange={(e) => {
                  if (e.target.value) {
                    onChange({ ...button, url: e.target.value });
                  }
                }}
                className="w-full px-2 py-1 text-[11px] bg-slate-100 rounded-lg text-slate-600 border border-slate-200"
              >
                <option value="">Quick select church page...</option>
                {COMMON_PAGE_ROUTES.map(route => (
                  <option key={route.value} value={route.value}>
                    {route.label} ({route.value})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Button Style Variant */}
          {allowStyle && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Visual Style
              </label>
              <select
                value={button.style || 'primary'}
                onChange={(e) => onChange({ ...button, style: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-maroon"
              >
                <option value="primary">Maroon Solid (Primary)</option>
                <option value="secondary">Light / Dark Neutral (Secondary)</option>
                <option value="amber">Warm Amber Gold (Accent)</option>
                <option value="outline">Outlined Border</option>
                <option value="ghost">Ghost Text Link</option>
              </select>
            </div>
          )}

          {/* Open in New Tab Option */}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id={`newtab-${label}`}
              checked={button.openInNewTab || false}
              onChange={(e) => onChange({ ...button, openInNewTab: e.target.checked })}
              className="rounded border-slate-300 text-maroon focus:ring-maroon h-4 w-4"
            />
            <label htmlFor={`newtab-${label}`} className="text-xs text-slate-700 flex items-center gap-1 cursor-pointer">
              Open link in new tab <ExternalLink className="h-3 w-3 text-slate-400" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
