import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Facilities"><div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="space-y-4 text-sm leading-relaxed text-gray-700">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-bold mb-1">Medical</h4>
          <p>We have a sickroom equipped with all necessary First Aid and medications to provide students the needed care and treatment in cases of emergency.</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-bold mb-1">Canteen</h4>
          <p>The campus proudly boasts of its bright and spacious canteen which not only serves healthy and gourmet food for students, but also serves as a place of laughter and conversation.</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-bold mb-1">Health & Hygiene</h4>
          <p>We at S K Presidency Public School provide extra attention to hygiene. A scientifically preplanned concealed sewage system, frequently placed waste-bins and regular cleaning ensures the cleanliness standard of the campus. The abundance of green in campus is our treasured asset.</p>
        </div>
      </div>
      <div className="flex items-center justify-center"><img src="https://skpresidency.com/images/section-pic/facility-1.jpg" alt="Facility" className="rounded-xl w-full max-w-sm shadow-md" /></div>
    </div>
    <div className="grid md:grid-cols-2 gap-6 mb-4">
      <div className="space-y-4 text-sm leading-relaxed text-gray-700">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-bold mb-1">Security & CCTV</h4>
          <p>The campus is secured with trained security professionals and the whole area is covered under CCTV surveillance to ensure everyone's security within the campus.</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-bold mb-1">Workshops and Seminars</h4>
          <p>Students, Teachers, Management — We organize various workshops frequently for different needs of the students and teachers. We believe in keeping pace with the changing times and upgrading ourselves. Therefore we pay close attention to the students, teachers and also the parents to ensure all round development.</p>
        </div>
      </div>
      <div className="flex items-center justify-center"><img src="https://skpresidency.com/images/section-pic/facility-2.jpg" alt="Facility" className="rounded-xl w-full max-w-sm shadow-md" /></div>
    </div>
    <div className="grid grid-cols-2 gap-3 mt-4">
      <img src="https://skpresidency.com/images/section-pic/facility-3.jpg" className="rounded-lg w-full" alt="" />
      <img src="https://skpresidency.com/images/section-pic/about-7.jpg" className="rounded-lg w-full" alt="" />
      <img src="https://skpresidency.com/images/section-pic/about-8.jpg" className="rounded-lg w-full" alt="" />
    </div></InnerPageLayout>;
}