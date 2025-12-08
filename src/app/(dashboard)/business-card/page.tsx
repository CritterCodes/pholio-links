import { Metadata } from 'next';
import BusinessCardDesigner from '@/components/dashboard/BusinessCardDesigner';

export const metadata: Metadata = {
  title: 'Business Card Designer | Pholio',
  description: 'Design your digital business card',
};

export default function BusinessCardPage() {
  return (
    <div className="space-y-6">
      <BusinessCardDesigner />
    </div>
  );
}
