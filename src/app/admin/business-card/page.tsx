import { Metadata } from 'next';
import BusinessCardDesigner from '@/components/admin/BusinessCardDesigner';

export const metadata: Metadata = {
  title: 'Business Card Designer | Pholio',
  description: 'Design your digital business card',
};

export default function BusinessCardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Card Designer</h1>
        <p className="text-muted-foreground">
          Customize how your digital business card looks when shared.
        </p>
      </div>
      <BusinessCardDesigner />
    </div>
  );
}
