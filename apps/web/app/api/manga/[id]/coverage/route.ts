import { NextResponse } from "next/server";
const API_URL = process.env.MANGAFLUX_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://api.manga.kenncode.me";
export const dynamic = "force-dynamic";
export async function GET(request: Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const query=new URL(request.url).searchParams;
  const source=query.get("source")?.trim()||"mangadex";
  const language=query.get("language")?.trim()||"en";
  if(!/^[a-z0-9-]{1,40}$/.test(source)||!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/i.test(language)||!id||id.length>500)
    return NextResponse.json({error:"INVALID_REQUEST"},{status:400});
  try{
    const endpoint=`${API_URL.replace(/\/$/,"")}/api/manga/${encodeURIComponent(source)}/${encodeURIComponent(id)}/coverage?language=${encodeURIComponent(language)}`;
    const upstream=await fetch(endpoint,{cache:"no-store",signal:AbortSignal.timeout(25000)});
    return new NextResponse(await upstream.text(),{status:upstream.status,headers:{"content-type":"application/json","cache-control":"private, no-store"}});
  }catch{
    return NextResponse.json({error:"API_UNAVAILABLE",message:"Source coverage is temporarily unavailable."},{status:502});
  }
}
