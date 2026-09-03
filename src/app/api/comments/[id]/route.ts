import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← PERBAIKAN: params adalah Promise
) {
  try {
    // PERBAIKAN: await params untuk mendapatkan id
    const { id: commentId } = await params;

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Get comment
    const commentRef = adminDb.collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const commentData = commentDoc.data();

    // Check ownership
    if (commentData?.authorId !== decodedToken.uid) {
      return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 });
    }

    // Delete comment
    await commentRef.delete();
    console.log('✅ Comment deleted:', commentId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}