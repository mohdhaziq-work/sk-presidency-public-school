import InnerPageLayout from '@/components/layout/InnerPage';

export default function Page() {
  return <InnerPageLayout title="Governing Body" subtitle="Leadership and management of SK Presidency Public School">
    <p className="mb-4">The school is managed by <strong>Dr. Shrikant Upadhyaya Educational and Charitable Trust</strong>, a registered trust dedicated to providing quality education in Sultanpur.</p><div className="grid sm:grid-cols-2 gap-4">{["Chairman","Secretary","Treasurer","Manager","Principal","Vice Principal"].map((r,i)=>(<div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">{r[0]}</div><div><div className="font-semibold text-xs">{r}</div><div className="text-[10px] text-gray-400">Dr. Shrikant Upadhyaya Educational Trust</div></div></div>))}</div><p className="text-sm text-gray-500 mt-4">The governing body meets quarterly to review academic progress, infrastructure development, and student welfare initiatives.</p>
  </InnerPageLayout>;
}