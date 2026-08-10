import InnerPageLayout from '@/components/layout/InnerPage';

export default function Page() {
  return <InnerPageLayout title="Event Calendar" subtitle="Upcoming school events and activities">
    <div className="space-y-3">{[{m:"April 2026",e:[{d:"5",t:"New Session Begins",c:"bg-green-50 text-green-700"},{d:"14",t:"Ambedkar Jayanti Celebration",c:"bg-blue-50 text-blue-700"}]},{m:"May 2026",e:[{d:"1",t:"Labour Day — Holiday",c:"bg-red-50 text-red-700"},{d:"15-31",t:"Summer Vacation",c:"bg-amber-50 text-amber-700"}]},{m:"August 2026",e:[{d:"15",t:"Independence Day Celebration",c:"bg-orange-50 text-orange-700"},{d:"20",t:"Parent-Teacher Meeting",c:"bg-purple-50 text-purple-700"}]}].map((m,i)=>(<div key={i} className="bg-gray-50 rounded-xl p-4"><h4 className="font-bold text-sm mb-2">{m.m}</h4>{m.e.map((e,j)=>(<div key={j} className="flex gap-3 items-start py-1.5"><span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded w-16 text-center">{e.d}</span><span className="text-xs">{e.t}</span></div>))}</div>))}</div>
  </InnerPageLayout>;
}