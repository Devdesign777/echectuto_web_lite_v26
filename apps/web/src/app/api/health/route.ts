import { NextResponse } from 'next/server'; import { cloudConfigured } from '@/lib/config/env';
export const dynamic='force-dynamic';
export async function GET(){ return NextResponse.json({service:'echectuto-web',status:'ok',cloudConfigured:cloudConfigured(),timestamp:new Date().toISOString()},{status:200,headers:{'Cache-Control':'no-store'}}); }
