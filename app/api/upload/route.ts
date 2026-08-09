import { NextRequest, NextResponse } from 'next/server';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Try ImgBB if API key available
    if (IMGBB_API_KEY) {
      try {
        const imgbbForm = new FormData();
        imgbbForm.append('image', base64);
        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST', body: imgbbForm,
        });
        const imgbbData = await imgbbRes.json();
        if (imgbbData.success && imgbbData.data) {
          return NextResponse.json({
            url: imgbbData.data.url,
            thumb: imgbbData.data.thumb?.url || imgbbData.data.url,
            originalName: file.name,
            size: file.size,
            type: file.type,
            source: 'imgbb',
          });
        }
      } catch (e) { /* fallback to base64 */ }
    }

    // Base64 fallback
    const mime = file.type || 'image/png';
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      thumb: dataUrl,
      originalName: file.name,
      size: file.size,
      type: file.type,
      source: 'base64',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
  }
}
