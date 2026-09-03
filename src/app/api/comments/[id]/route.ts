import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { z } from 'zod';

const deleteCommentSchema = z.object({
  firebaseIdToken: z.string().min(10),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const body = await request.json();
    const validation = deleteCommentSchema.safeParse(body);

    if (!validation.success) {
      // FIX: Use validation.error.issues instead of validation.error.errors
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues }, 
        { status: 400 }
      );
    }

    const { firebaseIdToken } = validation.data;

    // 1. Verify Authentication
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Comment to Verify Ownership
    const commentRef = adminDb.collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const commentData = commentDoc.data();

    // SECURITY RATIONALE: Strict ownership check.
    // A user can only delete a comment if their verified UID matches the authorId stored in the database.
    // (In a full SaaS, you would also add: `|| isAdmin(decodedToken.uid)`)
    if (commentData?.authorId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own comments' }, { status: 403 });
    }

    // 3. Delete the comment
    await commentRef.delete();

    return NextResponse.json({ success: true, message: 'Comment deleted' });

  } catch (error) {
    console.error('DELETE /api/comments/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}