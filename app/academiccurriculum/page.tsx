import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Academic Curriculum"><div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">Pre Primary I</h3>
          <ul className="list-disc ml-5 space-y-1 text-sm text-blue-700">
            <li>The Foundation stage - lot of activities: story-telling, number and word games, colouring and painting, craft and design, imaginative play, music, dance and singing, observation of nature etc. all for a happy child.</li>
            <li>Admission following the second birthday</li>
            <li>Flexible routine in pre-kindergarten</li>
            <li>Qualified staff and support assistants</li>
            <li>Teaching-Learning by PLAY-WAY method</li>
            <li>Stimulating surroundings/learning environment inside and outside the classroom</li>
            <li>End result: learning, sharing and caring, growing more inquisitiveness</li>
          </ul>
        </div>
        <div><img src="https://skpresidency.com/images/section-pic/classes-1.jpg" alt="Pre Primary" className="rounded-xl w-full shadow-md" /></div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div><img src="https://skpresidency.com/images/section-pic/classes-2.jpg" alt="Pre Primary II" className="rounded-xl w-full shadow-md" /></div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
          <h3 className="font-bold text-emerald-800 mb-2">Pre Primary II</h3>
          <ul className="list-disc ml-5 space-y-1 text-sm text-emerald-700">
            <li>Innovative teaching</li>
            <li>Continuous assessment</li>
            <li>Activity based Teaching-learning program, field trips</li>
            <li>Core Subjects - English, Mathematics, Science, Social Studies, Computer, Aerobics, Games and Art & Music</li>
            <li>Develop literary and numerical skills, attitude, independence, sharing and caring</li>
            <li>Good manners and acceptable behaviour</li>
          </ul>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <h3 className="font-bold text-amber-800 mb-2">Middle School - Class VI - VIII</h3>
          <ul className="list-disc ml-5 space-y-1 text-sm text-amber-700">
            <li>Broad and balanced outlook</li>
            <li>Relevant to the current world scenario</li>
            <li>Continuous and progressive assessment</li>
            <li>Core Subjects - English, Mathematics, Science, Social Studies, Computer, Art & Music, Aerobics and Games</li>
            <li>Focus on - use of library, experimentation, individual projects, group work and presentation, games and sports, gardening and other co-curriculum activities</li>
            <li>Continued development of literary & numerical skill, independence, sharing & caring, good manners</li>
          </ul>
        </div>
        <div><img src="https://skpresidency.com/images/section-pic/classes-3.jpg" alt="Middle School" className="rounded-xl w-full shadow-md" /></div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-5">
          <h4 className="font-bold mb-2">Age Limits</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">{['Nursery: 2 years+','Preparatory: 3 years+','Kindergarten: 4 years+','Std I: 5 years+','Std II: 6 years+','Std III: 7 years+','Std IV: 8 years+','Std V: 9 years+','Std VI: 10 years+','Std VII: 11 years+','Std VIII: 12 years+'].map(a=><div key={a} className="flex justify-between bg-gray-50 px-3 py-1.5 rounded"><span className="font-medium">{a.split(':')[0]}</span><span>{a.split(':')[1]}</span></div>)}</div>
        </div>
        <div className="bg-white border rounded-xl p-5 space-y-3">
          <div><h4 className="font-bold mb-1">Houses</h4><p className="text-sm text-gray-600">The Students are divided into 4 Houses — <span className="font-semibold text-green-700">Earth</span>, <span className="font-semibold text-red-600">Fire</span>, <span className="font-semibold text-blue-600">Water</span>, <span className="font-semibold text-amber-600">Air</span>. This promotes a spirit of healthy competition, tolerance and a sense of cohesion among the students.</p></div>
          <div><h4 className="font-bold mb-1">Activities</h4><p className="text-sm text-gray-600">The School provides every possible opportunity for students to take part in co-curricular activities like sports, art, elocution, quiz etc. SK Presidency Public School also inspires the students to take part in competitive forums and different activities.</p></div>
        </div>
      </div>
    </div></InnerPageLayout>;
}