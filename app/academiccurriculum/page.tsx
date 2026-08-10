import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Academic Curriculum" subtitle="CBSE Curriculum — Play Group to Class XII"><p className="mb-4">Our school follows the Central Board of Secondary Education (CBSE) curriculum, which is recognized nationwide for its balanced approach to academics and co-curricular activities.</p>
<div className="grid sm:grid-cols-2 gap-4 mb-5">
  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4"><h4 className="font-bold text-blue-800 mb-1">Pre-Primary (Play Group — UKG)</h4><p className="text-sm text-blue-700">Play-based learning with focus on motor skills, language development, and social interaction.</p></div>
  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4"><h4 className="font-bold text-emerald-800 mb-1">Primary (1ST — 5TH)</h4><p className="text-sm text-emerald-700">Foundation in English, Hindi, Mathematics, EVS, and Computer Science.</p></div>
  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4"><h4 className="font-bold text-amber-800 mb-1">Middle (6TH — 8TH)</h4><p className="text-sm text-amber-700">Introduction to Sciences, Social Studies, and Sanskrit with project-based learning.</p></div>
  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4"><h4 className="font-bold text-purple-800 mb-1">Secondary & Sr. Secondary (9TH — 12TH)</h4><p className="text-sm text-purple-700">Stream selection: Science, Commerce, Humanities. Board exam preparation with mock tests.</p></div>
</div></InnerPageLayout>;
}