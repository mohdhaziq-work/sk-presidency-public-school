import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="About Our School" subtitle="Founded 2013 — Dr. Shrikant Upadhyaya Educational & Charitable Trust"><p className="mb-4">SK Presidency Public School is a CBSE-affiliated (2133231) Senior Secondary School located in Sultanpur, Uttar Pradesh. Founded in 2013 under the Dr. Shrikant Upadhyaya Educational and Charitable Trust, the school has grown into a premier educational institution serving students from Play Group to Class XII.</p>
<div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
  <h3 className="font-bold text-blue-800 mb-2">Our Mission</h3>
  <p className="text-blue-700 text-sm">To provide world-class education that nurtures academic excellence, character building, and holistic development in every child. We believe education goes beyond textbooks — it shapes future leaders.</p>
</div>
<h3 className="font-bold mb-2">School Infrastructure</h3>
<ul className="list-disc ml-5 space-y-1 mb-4 text-sm">
  <li>Spacious, well-ventilated classrooms with smart boards</li>
  <li>Science laboratories for Physics, Chemistry, and Biology</li>
  <li>Computer lab with high-speed internet</li>
  <li>Library with 5000+ books and digital resources</li>
  <li>Sports grounds for cricket, football, volleyball</li>
  <li>Indoor activity rooms for art, music, and dance</li>
</ul>
<h3 className="font-bold mb-2">Academics</h3>
<p className="mb-4">We follow the CBSE curriculum with a strong emphasis on conceptual understanding and practical application. Regular assessments, remedial classes, and parent-teacher meetings ensure every student receives individual attention.</p>
<div className="grid sm:grid-cols-3 gap-3 mb-4 text-center">
  <div className="bg-gray-50 rounded-xl p-4"><div className="text-2xl font-extrabold text-blue-600">800+</div><div className="text-[10px] font-bold uppercase text-gray-400 mt-1">Students</div></div>
  <div className="bg-gray-50 rounded-xl p-4"><div className="text-2xl font-extrabold text-blue-600">40+</div><div className="text-[10px] font-bold uppercase text-gray-400 mt-1">Teachers</div></div>
  <div className="bg-gray-50 rounded-xl p-4"><div className="text-2xl font-extrabold text-blue-600">15+</div><div className="text-[10px] font-bold uppercase text-gray-400 mt-1">Years</div></div>
</div></InnerPageLayout>;
}