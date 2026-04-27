import { NextResponse } from 'next/server';
import { getIntersections } from '@/lib/data';

export async function GET() {
  const intersections = await getIntersections();
  return NextResponse.json(intersections);
}
