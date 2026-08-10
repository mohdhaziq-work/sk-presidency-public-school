import InnerPageLayout from '@/components/layout/InnerPage';

export default function Page() {
  return <InnerPageLayout title="Mandatory Public Disclosure" subtitle="As per CBSE guidelines">
    <p className="mb-4">The following information is disclosed as per CBSE Affiliation Bye-Laws and the Right to Education Act.</p><div className="space-y-3">{[{l:"School Name",v:"SK Presidency Public School"},{l:"Affiliation No",v:"2133231"},{l:"School Code",v:"70891"},{l:"Address",v:"Vill. Odara, Faizabad Sultanpur Bypass, Near Tantia Nagar, Sultanpur, UP — 228001"},{l:"Principal",v:"Mr. S M Mishra"},{l:"Phone",v:"86017 35757"},{l:"Email",v:"hrskpps@gmail.com"},{l:"Website",v:"www.skpresidency.com"},{l:"Trust",v:"Dr. Shrikant Upadhyaya Educational & Charitable Trust"}].map((r,i)=>(<div key={i} className="flex gap-4 py-2 border-b border-gray-100"><span className="w-28 text-[10px] font-bold uppercase text-gray-400 flex-shrink-0">{r.l}</span><span className="text-xs font-medium">{r.v}</span></div>))}</div>
  </InnerPageLayout>;
}