import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sanitizeContentServer } from '@/lib/sanitize';
import { checkRateLimits } from '@/lib/rate-limit';
import { createCommentSchema } from '@/lib/validations';

// ============================================
// GET HANDLER - Support Widget & Dashboard
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const filter = searchParams.get('filter'); // 'all' | 'pending' | 'approved' | 'spam'
    const dashboardMode = searchParams.get('dashboard') === 'true';

    // MODE 1: Dashboard Mode (requires authentication)
    if (dashboardMode) {
      return await getDashboardComments(request, filter);
    }

    // MODE 2: Widget Mode (public, fetch by threadId)
    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
    }

    console.log('📥 Fetching comments for thread:', threadId);

    const snapshot = await adminDb.collection('comments')
      .where('threadId', '==', threadId)
      .where('status', '==', 'approved') // Only show approved comments
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    console.log(`✅ Found ${comments.length} comments`);

    return NextResponse.json({ comments, nextCursor: null });
  } catch (error) {
    console.error('❌ GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// Helper function untuk dashboard comments
async function getDashboardComments(request: NextRequest, filter: string | null) {
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
  const uid = decodedClaims.uid;

  // Get user's sites
  const sitesSnapshot = await adminDb.collection('sites')
    .where('ownerId', '==', uid)
    .get();

  const siteIds = sitesSnapshot.docs.map(doc => doc.id);

  if (siteIds.length === 0) {
    return NextResponse.json({ comments: [] });
  }

  // Build query
  let query = adminDb.collection('comments')
    .where('siteId', 'in', siteIds)
    .orderBy('createdAt', 'desc')
    .limit(50);

  // Apply filter
  if (filter && filter !== 'all') {
    query = query.where('status', '==', filter);
  }

  const snapshot = await query.get();
  const comments = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate().toISOString(),
  }));

  return NextResponse.json({ comments });
}

// ============================================
// POST HANDLER - Create Comment
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { threadId, content, firebaseIdToken, siteId } = validation.data;

    // Verify site ownership if siteId provided
    if (siteId) {
      const siteRef = adminDb.collection('sites').doc(siteId);
      const siteDoc = await siteRef.get();
      
      if (!siteDoc.exists) {
        return NextResponse.json({ error: 'Invalid site' }, { status: 400 });
      }
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
      console.log('✅ Token verified for UID:', decodedToken.uid);
    } catch (err) {
      console.error('❌ Token verification failed:', err);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check rate limits
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimits(ip, decodedToken.uid, threadId);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: { 'Retry-After': '60' }
        }
      );
    }

    // Sanitize content
    const sanitizedContent = sanitizeContentServer(content);

    // Create comment
    const newCommentRef = adminDb.collection('comments').doc();
    const now = Timestamp.now();

    const commentData = {
      id: newCommentRef.id,
      threadId,
      siteId: siteId || null,
      authorId: decodedToken.uid,
      authorName: 'Anonymous',
      content: sanitizedContent,
      isAnonymous: true,
      status: 'approved' as const,
      createdAt: now,
      updatedAt: now,
    };

    await newCommentRef.set(commentData);
    console.log('✅ Comment created:', newCommentRef.id);

    return NextResponse.json({
      ...commentData,
      createdAt: now.toDate().toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// ============================================
// PATCH HANDLER - Moderate Comment (Dashboard)
// ============================================
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    // Get request body
    const body = await request.json();
    const { status } = body;

    if (!status || !['approved', 'pending', 'spam'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get comment
    const commentRef = adminDb.collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const commentData = commentDoc.data();

    // Verify site ownership
    if (!commentData?.siteId) {
      return NextResponse.json({ error: 'Comment has no site association' }, { status: 400 });
    }

    const siteRef = adminDb.collection('sites').doc(commentData.siteId);
    const siteDoc = await siteRef.get();

    if (!siteDoc.exists || siteDoc.data()?.ownerId !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update comment status
    await commentRef.update({
      status,
      updatedAt: Timestamp.now(),
    });

    console.log(`✅ Comment ${commentId} status updated to: ${status}`);

    return NextResponse.json({ 
      success: true, 
      comment: { id: commentId, status }
    });

  } catch (error) {
    console.error('❌ PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// ============================================
// DELETE HANDLER - Delete Comment
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

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

// ============================================
// OPTIONS HANDLER - CORS
// ============================================
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-App-Check-Token',
    }
  });
}