import { notFound } from 'next/navigation';
import { getFormsCollection, getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import PublicFormRenderer from '@/components/forms/PublicFormRenderer';
import { Form, User } from '@/types';

interface PublicFormPageProps {
  params: Promise<{
    username: string;
    formId: string;
  }>;
}

async function getFormAndUser(username: string, formId: string) {
  if (!ObjectId.isValid(formId)) return null;

  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ username }) as unknown as User;

  if (!user) return null;

  const formsCollection = await getFormsCollection();
  const form = await formsCollection.findOne({ 
    _id: new ObjectId(formId),
    userId: user._id,
    isActive: true
  }) as unknown as Form;

  if (!form) return null;

  return { form, user };
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { username, formId } = await params;
  const data = await getFormAndUser(username, formId);

  if (!data) {
    notFound();
  }

  const { form, user } = data;

  // Increment view count
  const formsCollection = await getFormsCollection();
  await formsCollection.updateOne(
    { _id: form._id },
    { $inc: { views: 1 } }
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          {user.profile.profileImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profile.profileImage}
              alt={user.profile.name}
              className="mx-auto h-16 w-16 rounded-full object-cover mb-4"
            />
          )}
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {form.title}
          </h2>
          {form.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {form.description}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <PublicFormRenderer form={form} />
        </div>
      </div>
    </div>
  );
}
