"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Edition={source:string;mangaId:string;sourceTitle:string;mappingMethod:string};
type Identity={canonicalId:string;displayTitle:string;editions:Edition[]};
export default function CanonicalEditions({source,mangaId}:{source:string;mangaId:string}){
 const [data,setData]=useState<Identity|null>(null);
 useEffect(()=>{let active=true;setData(null);const controller=new AbortController();
  fetch(`/api/manga/${encodeURIComponent(mangaId)}/identity?source=${encodeURIComponent(source)}`,{cache:"no-store",signal:controller.signal}).then(async r=>r.ok?await r.json():null).then(v=>{if(active)setData(v)}).catch(()=>{});
  return()=>{active=false;controller.abort()};
 },[source,mangaId]);
 if(!data)return null;
 return <section className="panel" aria-label="MangaFlux canonical manga sources">
  <p className="eyebrow">MangaFlux title identity</p>
  <h2>{data.displayTitle}</h2>
  <p className="muted">Available reviewed source editions ({data.editions.length}). Each source keeps its own chapter list, bookmarks, and reading progress.</p>
  <div className="tag-row">{data.editions.map(edition=><Link className="tag tag-link" key={edition.source+":"+edition.mangaId} href={`/manga/${encodeURIComponent(edition.mangaId)}?source=${encodeURIComponent(edition.source)}`} aria-current={edition.source===source&&edition.mangaId===mangaId?"page":undefined}>
   {edition.source==="mangadex"?"MangaDex":edition.source==="mangaster"?"MangaSter":edition.source} · {edition.sourceTitle}{edition.source===source&&edition.mangaId===mangaId?" (current)":""}
  </Link>)}</div>
 </section>;
}