export default function Stat({ label, value, hint }:{ label:string; value:string; hint?:string }){
  return (<div className="card p-5"><div className="text-sm text-fg-muted">{label}</div><div className="text-3xl font-semibold mt-1">{value}</div>{hint && <div className="text-xs text-fg-muted mt-2">{hint}</div>}</div>);
}
