import React from 'react';
import { Clock, ShieldAlert, CigaretteOff, UserCheck } from 'lucide-react';

export interface PropertyDetailDescriptionProps {
  description: string;
}

interface PolicyItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}

const POLICIES = [
  { icon: Clock, title: 'Waktu Check-in & Check-out', desc: 'Check-in mulai 14:00 WIB • Check-out maksimal 12:00 WIB' },
  { icon: UserCheck, title: 'Identitas Tamu', desc: 'Wajib menunjukkan kartu identitas resmi (KTP/Paspor) valid.' },
  { icon: CigaretteOff, title: 'Bebas Asap Rokok', desc: 'Dilarang merokok di dalam kamar dan area tertutup.' },
  { icon: ShieldAlert, title: 'Kebijakan Kebisingan', desc: 'Waktu tenang berlaku mulai pukul 22:00 WIB.' },
];

function PolicyItem({ icon: Icon, title, desc }: PolicyItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-primary-100/60 flex items-center justify-center text-primary-700 flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h4 className="text-xs sm:text-sm font-semibold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function AboutSection({ description }: { description: string }) {
  return (
    <div>
      <h2 id="deskripsi-properti" className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
        Tentang Properti
      </h2>
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line space-y-2">
        {description}
      </div>
    </div>
  );
}

function PoliciesSection() {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
        Kebijakan & Peraturan Menginap
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {POLICIES.map((p) => (
          <PolicyItem key={p.title} icon={p.icon} title={p.title} desc={p.desc} />
        ))}
      </div>
    </div>
  );
}

export function PropertyDetailDescription({
  description,
}: PropertyDetailDescriptionProps): React.JSX.Element {
  return (
    <section aria-labelledby="deskripsi-properti" className="py-6 border-b border-gray-100 flex flex-col gap-6">
      <AboutSection description={description} />
      <PoliciesSection />
    </section>
  );
}
