import { NextResponse } from "next/server";
const API_URL = process.env.MANGAFLUX_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://api.manga.kenncode.me";
export const dynamic = "force-dynamic";
export async function GET(request: Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params;
 const source=new URL(request.url).searchParams.get("source")?.trim()||"mangadex";
 if(!/^[a-z0-9-]{1,40}$/.test(source)||!id||id.length>500)return NextResponse.json({error:"INVALID_REQUEST"},{status:400});
 try{
  const response=await fetch(`${API_URL.replace(/\/$/,"")}/api/manga/${encodeURIComponent(source)}/${encodeURIComponent(id)}/identity`,{cache:"no-store",signal:AbortSignal.timeout(15000)});
  return new NextResponse(await response.text(),{status:response.status,headers:{"content-type":"application/json","cache-control":"private, no-store"}});
 }catch{return NextResponse.json({error:"API_UNAVAILABLE"},{status:502})}
}