import { ReactNode } from "react";
export default function Card({ title, subtitle, children, cta }:{ title:string; subtitle?:string; children?:ReactNode; cta?:{label:string; href:string} }){
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-4">
        <div><h3 className="text-lg font-semibold">{title}</h3>{subtitle && <p className="text-sm text-fg-muted">{subtitle}</p>}</div>
        {cta && <a className="btn btn-ghost" href={cta.href}>{cta.label}</a>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
