import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="About the School"><div className="grid md:grid-cols-2 gap-6 mb-6">
      <div>
        <p className="mb-3 text-sm leading-relaxed">The School is a place where children are encouraged to say <em>"I see it, I get it, I can do it."</em> Environment should be created to make the siblings grow in conducive ambience. Power of expression, power of writing and power of imagining make a child to develop. It all starts with the preparatory stages till the end of adolescence. The school is having Play Group to Standard XII classes.</p>
        <p className="mb-3 text-sm leading-relaxed">We, at S K Presidency Public School, are dedicated to provide each of our students with complete learning experience. A combination of world class academic curriculum along with varied co-curricular and sporting activities will enrich them as well as develop their personalities keeping a balance between discipline and fun.</p>
      </div>
      <div className="bg-gray-100 rounded-xl flex items-center justify-center min-h-[200px] text-gray-400 text-sm">📷 About School Image</div>
    </div>
    <h3 className="font-bold mb-2">Our Objectives</h3>
    <ul className="list-disc ml-5 space-y-1.5 mb-4 text-sm leading-relaxed">
      <li>Our primary aim is to impart to our students a sound moral education based on the rules and the principles. Our primary aim is to educate our future generation within a dynamic system with academic excellence and help the students naturally become value oriented citizens.</li>
      <li>Educate, then to continually strive for excellence.</li>
      <li>Train them to acquire good habits, a sense of cleanliness, orderliness and to become a good and responsible citizen.</li>
      <li>Teach them to be courageous and firm.</li>
      <li>Attain self reliance through a balance of freedom and discipline within the body, mind and spirit.</li>
    </ul>
    <p className="text-sm leading-relaxed mb-4">Time is the most valuable thing a person can spend. At S K Presidency Public School, a student gets every opportunity for exploration. Knowledge, challenges and excellence along with valuable virtues of life and time are the most important ones. Students spend a well-planned and balanced day in the school involving curricular and co-curricular activities. We, at S K Presidency Public School, are dedicated to ensure that every aspect of a child in his or her formative years are taken care of. Their health, their education, their persona and their values. Our libraries and labs are the window to the world for the students. The smart classes make studies more interesting and lucid for them. Frequent workshops and seminars keep the students and teachers upbeat and enhance the valued situation.</p></InnerPageLayout>;
}