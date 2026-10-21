import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
}

const openWindow = (targetUrl: string) => window.open(targetUrl, '_blank', 'noopener,noreferrer');

const getSocialUrl = (type: string, text: string, url: string, title: string) => {
  if (type === 'wa') return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
  if (type === 'fb') return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  if (type === 'tw') return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
};

function useCopyUrl(url: string) {
  const [copied, setCopied] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const copyUrl = async (msg = 'Tautan berhasil disalin!') => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setInfoMsg(msg);
      setTimeout(() => { setCopied(false); setInfoMsg(''); }, 3000);
    } catch {
      setInfoMsg('Gagal menyalin tautan');
    }
  };
  return { copied, infoMsg, copyUrl };
}

function useShareChannels(title: string, customUrl?: string) {
  const url = customUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const text = `Lihat penginapan menarik "${title}" di SinggahIn!`;
  const { copied, infoMsg, copyUrl } = useCopyUrl(url);
  const handleInstagram = () => { copyUrl('Tautan disalin! Membuka Instagram...'); setTimeout(() => openWindow('https://www.instagram.com/'), 600); };
  const share = (t: string) => openWindow(getSocialUrl(t, text, url, title));
  return {
    url, copied, infoMsg, copyUrl, handleInstagram,
    handleWhatsApp: () => share('wa'), handleFacebook: () => share('fb'),
    handleTwitter: () => share('tw'), handleEmail: () => share('mail')
  };
}

interface ChannelItem { name: string; icon: React.ComponentType<{ className?: string }>; color: string; action: () => void; }

function ChannelBtn({ item }: { item: ChannelItem }) {
  const Icon = item.icon;
  return (
    <button type="button" onClick={item.action} className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${item.color}`} aria-label={`Bagikan ke ${item.name}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{item.name}</span>
    </button>
  );
}

function ShareChannelButtons(p: ReturnType<typeof useShareChannels>): React.JSX.Element {
  const items: ChannelItem[] = [
    { name: 'WhatsApp', icon: MessageCircle, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200', action: p.handleWhatsApp },
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200', action: p.handleFacebook },
    { name: 'Twitter / X', icon: Twitter, color: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200', action: p.handleTwitter },
    { name: 'Instagram', icon: Instagram, color: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200', action: p.handleInstagram },
    { name: 'Email', icon: Mail, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200', action: p.handleEmail },
  ];
  return <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">{items.map((i) => <ChannelBtn key={i.name} item={i} />)}</div>;
}

function CopyLinkBar({ url, copied, onCopy }: { url: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 truncate select-all">{url}</div>
      <button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors" aria-label="Salin tautan">
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Tersalin' : 'Salin'}</span>
      </button>
    </div>
  );
}

function ShareModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
      <div>
        <h3 id="share-modal-title" className="text-base font-bold text-gray-900">Bagikan Properti</h3>
        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[240px]">{title}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Tutup modal" className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

function ShareModalContent({ title, onClose, s }: { title: string; onClose: () => void; s: ReturnType<typeof useShareChannels> }) {
  return (
    <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl relative border border-gray-100">
      <ShareModalHeader title={title} onClose={onClose} />
      <ShareChannelButtons {...s} />
      {s.infoMsg && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2 mb-2">{s.infoMsg}</p>}
      <CopyLinkBar url={s.url} copied={s.copied} onCopy={() => s.copyUrl()} />
    </div>
  );
}

export function ShareModal({ isOpen, onClose, title, url }: ShareModalProps): React.JSX.Element | null {
  const s = useShareChannels(title, url);
  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="share-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ShareModalContent title={title} onClose={onClose} s={s} />
    </div>
  );
}
