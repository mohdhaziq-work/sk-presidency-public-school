import InnerPageLayout from '@/components/layout/InnerPage';

export default function Page() {
  return <InnerPageLayout title="Students Zone" subtitle="Activities, clubs and student engagement">
    <div className="grid sm:grid-cols-2 gap-4">{[{t:"Cultural Activities",d:"Annual function, dance competitions, singing, drama, and talent shows."},{t:"Science Club",d:"Science exhibitions, model making, quizzes, and innovation challenges."},{t:"Literary Club",d:"Debates, essay writing, poetry recitation, and public speaking."},{t:"Art & Craft",d:"Drawing, painting, sculpture, origami, and creative workshops."},{t:"Eco Club",d:"Tree plantation drives, cleanliness campaigns, and environmental awareness."},{t:"Student Council",d:"Elected student representatives for leadership development and school governance."}].map((c,i)=>(<div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-md transition"><h4 className="font-bold text-sm">{c.t}</h4><p className="text-xs text-gray-500 mt-1">{c.d}</p></div>))}</div>
  </InnerPageLayout>;
}