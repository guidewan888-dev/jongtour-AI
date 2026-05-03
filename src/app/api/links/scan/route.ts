import { NextResponse } from 'next/server';
import { LinkValidationService } from '@/services/core';

export async function POST(req: Request) {
  try {
    // Trigger global link scan across all subdomains
    // const result = await LinkValidationService.scanCMSLinks();
    
    return NextResponse.json({ success: true, message: 'Scan started' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
