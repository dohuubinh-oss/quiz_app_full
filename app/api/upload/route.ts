
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }

  // Chuyển đổi tệp thành Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Tạo một tên tệp duy nhất để tránh ghi đè
  const fileExtension = path.extname(file.name);
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = `${uniqueSuffix}${fileExtension}`;

  // Xác định đường dẫn đích
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  const relativePath = `/uploads/${filename}`;
  const fullPath = path.join(uploadDir, filename);

  try {
    // Đảm bảo thư mục đích tồn tại
    await mkdir(uploadDir, { recursive: true });

    // Ghi tệp vào hệ thống tệp
    await writeFile(fullPath, buffer);

    // Trả về đường dẫn công khai
    return NextResponse.json({ success: true, path: relativePath });

  } catch (error) {
    console.error('Failed to save file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file' }, { status: 500 });
  }
}
