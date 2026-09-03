import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    const siteRef = adminDb.collection('sites').doc(params.id);
    const siteDoc = await siteRef.get();

    if (!siteDoc.exists) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const siteData = siteDoc.data();
    if (siteData?.ownerId !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      site: {
        id: siteDoc.id,
        ...siteData,
      },
    });
  } catch (error) {
    console.error('GET /api/sites/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch site' }, { status: 500 });
  }
}