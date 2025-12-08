import { NextRequest, NextResponse } from 'next/server';
import { getFormsCollection, getFormSubmissionsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const formsCollection = await getFormsCollection();
    const form = await formsCollection.findOne({ _id: new ObjectId(id) });

    if (!form) {
      return new NextResponse('Form not found', { status: 404 });
    }

    if (!form.isActive) {
      return new NextResponse('Form is not active', { status: 400 });
    }

    const body = await request.json();
    
    // Validate required fields
    for (const field of form.fields) {
      if (field.required && !body[field.id]) {
        return new NextResponse(`Field ${field.label} is required`, { status: 400 });
      }
    }

    const submissionsCollection = await getFormSubmissionsCollection();
    await submissionsCollection.insertOne({
      formId: new ObjectId(id),
      data: body,
      submittedAt: new Date(),
      viewed: false
    });

    // Increment submission count
    await formsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { submissionsCount: 1 } }
    );

    return NextResponse.json({ success: true, message: form.successMessage });
  } catch (error) {
    console.error('Error submitting form:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
