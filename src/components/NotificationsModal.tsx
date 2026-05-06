import BaseModal from './BaseModal';
import Button from './Button';
import { Phone } from 'lucide-react';
import { useStore } from '../store';
import Badge from './Badge';

interface Lead {
  phone: string;
  created_at: string;
}

/**
 * NOTIFICATIONS MODAL (Diamond Edition)
 * -----------------------------------------------------------
 * Admin-only view for visitor leads capture.
 * Professional B2B layout with direct action triggers.
 */
export default function NotificationsModal({
  isOpen,
  onClose,
  isStatic = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  isStatic?: boolean;
}) {
  const { settings } = useStore();
  
  // Leads stored in JSONB array: [{ phone: '...', created_at: '...' }]
  const leads: Lead[] = (settings?.visitor_leads as Lead[]) || [];

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
  };

  const handleWhatsapp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent("Merhaba, numara bırakmıştınız. Sizinle iletişime geçmek istedik.");
    window.open(`https://wa.me/90${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      isStatic={isStatic}
      title="BİLDİRİMLER"
    >
      <div className="flex flex-col gap-6 py-2">
        <div className="space-y-3">
          {leads.length === 0 ? (
            <div className="py-20 text-center bg-stone-50 rounded-[2.5rem] border border-stone-100/50">
              <p className="text-stone-300 font-black text-[10px] tracking-[0.3em] uppercase">Henüz bildirim yok</p>
            </div>
          ) : (
            [...leads].reverse().map((lead, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-5 bg-white border border-stone-100 rounded-[1.5rem] group hover:border-stone-900 transition-all shadow-sm hover:shadow-xl"
              >
                <div className="flex flex-col gap-1 mr-4">
                  <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">
                    {new Date(lead.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" showDot={true} pulse={true} size="xs" />
                    <span className="text-[13px] font-black text-stone-900 tracking-widest">
                      {lead.phone}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => handleWhatsapp(lead.phone)}
                    variant="whatsapp"
                    mode="circle"
                    className="!w-12 !h-12 !rounded-2xl shadow-lg shadow-green-100"
                    icon={
                      <svg viewBox="0 0 24 24" className="fill-current w-6 h-6">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.633 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    }
                  />
                  <Button
                    onClick={() => handleCall(lead.phone)}
                    variant="phone"
                    mode="circle"
                    className="!w-12 !h-12 !rounded-2xl shadow-lg shadow-blue-100"
                    icon={<Phone size={20} fill="currentColor" />}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </BaseModal>
  );
}
