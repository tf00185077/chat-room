import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, password, avatarUrl } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: '名稱和密碼為必填項' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密碼長度至少需要 6 個字元' },
        { status: 400 }
      );
    }

    // 檢查用戶名是否已存在
    const existingUser = await prisma.user.findFirst({
      where: { name },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '該用戶名已被使用' },
        { status: 400 }
      );
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 創建新用戶
    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        avatarUrl: avatarUrl || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    }) as { id: number; name: string; avatarUrl: string };

    return NextResponse.json({
      message: '註冊成功',
      user: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: '註冊失敗，請重試' },
      { status: 500 }
    );
  }
}
