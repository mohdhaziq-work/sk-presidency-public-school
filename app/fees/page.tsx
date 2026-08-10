import InnerPageLayout from '@/components/layout/InnerPage';

export default function Page() {
  return <InnerPageLayout title="Fees Structure" subtitle="Transparent fee details for all classes">
    <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-gray-50"><tr>{["Class","Admission Fee","Tuition Fee (Monthly)","Annual Charges","Total (Yearly)"].map(h=><th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-gray-400">{h}</th>)}</tr></thead><tbody>{[["Nursery-LKG","₹3,000","₹800","₹2,000","₹12,600"],["UKG","₹3,000","₹900","₹2,500","₹14,300"],["1ST-5TH","₹4,000","₹1,100","₹3,000","₹18,200"],["6TH-8TH","₹5,000","₹1,300","₹3,500","₹22,100"],["9TH-10TH","₹6,000","₹1,500","₹4,000","₹26,000"],["11TH-12TH","₹7,000","₹1,700","₹4,500","₹30,400"]].map((r,i)=>(<tr key={i} className="border-t border-gray-100"><td className="px-3 py-2 font-medium">{r[0]}</td>{r.slice(1).map((c,j)=><td key={j} className="px-3 py-2">{c}</td>)}</tr>))}</tbody></table></div><p className="text-[10px] text-gray-400 mt-3">Fees are subject to revision. Contact school office for detailed breakup.</p>
  </InnerPageLayout>;
}