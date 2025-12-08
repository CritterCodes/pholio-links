'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import FormEditor from '@/components/forms/FormEditor';
import { Form } from '@/types';

export default function EditFormPage() {
  const params = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchForm(params.id as string);
    }
  }, [params.id]);

  const fetchForm = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm(data);
      }
    } catch (error) {
      console.error('Failed to fetch form');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!form) {
    return <div>Form not found</div>;
  }

  return <FormEditor initialData={form} />;
}
