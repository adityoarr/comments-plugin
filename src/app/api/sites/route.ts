import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    const snapshot = await adminDb.collection('sites')
      .where('ownerId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const sites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ sites });
  } catch (error) {
    console.error('GET /api/sites error:', error);
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    const body = await request.json();
    const { siteName, domain } = body;

    if (!siteName || !domain) {
      return NextResponse.json({ error: 'Site name and domain are required' }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    const siteRef = adminDb.collection('sites').doc();
    const now = Timestamp.now();

    const siteData = {
      id: siteRef.id,
      ownerId: uid,
      siteName,
      domain: domain.toLowerCase(),
      allowedDomains: [domain.toLowerCase()],
      createdAt: now,
      updatedAt: now,
      settings: {
        moderationEnabled: false,
        allowAnonymous: true,
        maxCommentLength: 2000,
      },
    };

    await siteRef.set(siteData);

    return NextResponse.json({
      ...siteData,
      createdAt: now.toDate().toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/sites error:', error);
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
  }
}