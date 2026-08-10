import InnerPageLayout from '@/components/layout/InnerPage';

export default function Page() {
  return <InnerPageLayout title="Guardians Zone" subtitle="Information and resources for parents and guardians">
    <div className="space-y-4">{[{t:"Parent-Teacher Meetings",d:"Regular PTMs are held to discuss student progress. Dates are communicated via notice and SMS."},{t:"Online Fee Payment",d:"Fees can be paid online through the parent portal or at the school office."},{t:"Student Progress Reports",d:"Quarterly progress reports are issued. Parents can track attendance and marks through the school app."},{t:"School Transport",d:"GPS-enabled buses with trained drivers. Routes cover major areas of Sultanpur."},{t:"Safety & Security",d:"CCTV surveillance, security guards, and strict visitor management system ensure student safety."}].map((item,i)=>(<div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200"><h4 className="font-bold text-sm mb-1">{item.t}</h4><p className="text-xs text-gray-500">{item.d}</p></div>))}</div>
  </InnerPageLayout>;
}