import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="School Sports"><div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="text-sm leading-relaxed text-gray-700">
          <h3 className="font-bold text-lg mb-2">Indoors and Outdoors</h3>
          <p className="mb-3">Hard work has no alternative; at S K Presidency Public School children are taught this reality and a wide spectrum of sports and games activities are an inherent part of the school's curriculum. The importance of sports and games in school encompasses more than just the benefit of physical activity. Increases in self-esteem and mental alertness make school sports and games necessary for every school age child.</p>
          <p>At S K Presidency Public School we give utmost importance to sports.</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 border">
          <h4 className="font-bold mb-2">Sports Offered</h4>
          <ul className="list-disc ml-5 text-sm text-gray-700 columns-2">
            <li>Athletics</li><li>Football</li><li>Badminton</li><li>Cricket</li><li>Volleyball</li><li>Basketball</li><li>Carom</li><li>Chess</li><li>Table Tennis</li>
          </ul>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">Every year an event of annual sports competition is held where the four houses of the school compete in different disciplines, segments and sports to emerge as the champion house. Our goal is to foster a life-long interest in physical activity and healthy living through both competition and fun.</p>
      <div className="grid grid-cols-3 gap-3"><img src="https://skpresidency.com/images/section-pic/school-sports-1.jpg" className="rounded-lg w-full" alt="" /><img src="https://skpresidency.com/images/section-pic/school-sports-2.jpg" className="rounded-lg w-full" alt="" /><img src="https://skpresidency.com/images/section-pic/school-sports-3.jpg" className="rounded-lg w-full" alt="" /><img src="https://skpresidency.com/images/section-pic/school-sports-4.jpg" className="rounded-lg w-full" alt="" /><img src="https://skpresidency.com/images/section-pic/school-sports-5.jpg" className="rounded-lg w-full" alt="" /><img src="https://skpresidency.com/images/section-pic/school-sports-6.jpg" className="rounded-lg w-full" alt="" /></div>
    </div></InnerPageLayout>;
}