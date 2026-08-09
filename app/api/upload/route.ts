import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const file = fd.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (file.size > 10*1024*1024) return NextResponse.json({ error: 'Too large (max 10MB)' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const b64 = Buffer.from(bytes).toString('base64');
    const mime = file.type || 'image/png';

    // Try ImgBB
    const IMGBB_KEY = process.env.IMGBB_API_KEY;
    if (IMGBB_KEY) {
      try {
        const ibf = new FormData(); ibf.append('image', b64);
        const ir = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: ibf });
        const id = await ir.json();
        if (id.success && id.data) return NextResponse.json({ url: id.data.url, thumb: id.data.thumb?.url || id.data.url, originalName: file.name, size: file.size, type: file.type, source: 'imgbb' });
      } catch (e) {}
    }

    return NextResponse.json({ url: `data:${mime};base64,${b64}`, thumb: `data:${mime};base64,${b64}`, originalName: file.name, size: file.size, type: file.type, source: 'base64' });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
