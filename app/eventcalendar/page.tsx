import InnerPageLayout from '@/components/layout/InnerPage';

export default function Page() {
  return (
    <InnerPageLayout title="Events">
      <div className="space-y-8">

        {/* 1 -> Plant Tree Campaign */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 text-green-700">Plant Tree campaign organised by HDFC Bank Team Sultanpur</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://www.skpresidency.com/images/section-pic/events/planttree-campaign/${i}.jpg`}
                alt={`Plant Tree ${i}`} className="rounded-xl w-full shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all" />
            ))}
          </div>
        </div>

        {/* 2 -> Mango Day */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 text-amber-700">Mango Day celebrated on 14th July, 2023</h3>
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {[1,2].map(i => (
              <img key={i} src={`https://www.skpresidency.com/images/section-pic/events/mango-day-14072023/${i}.jpg`}
                alt={`Mango Day ${i}`} className="rounded-xl w-full shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all" />
            ))}
          </div>
        </div>

        {/* 3 -> Global Handwashing Day */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-3 text-blue-700">Global Handwashing Day observed on 15th October, 2020</h3>
          <p className="text-sm text-gray-600 leading-relaxed">Global Handwashing Day activities performed by the students on Thursday, 15th October, 2020. Awareness towards safety from various infection (specially CORONA) that spread through germs present in our hands. Keep hands clean and be safe.</p>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            {[
              {id:'M7M1I3DdhuM',title:'Global sanitization day 2020'},
              {id:'Wf1h0o_BFFs',title:'Global Hand Sanitization Day 2020'},
              {id:'CfNruN27tp4',title:'Golbal Hand Sanitization Day 2020'},
            ].map(v => (
              <div key={v.id} className="rounded-xl overflow-hidden border border-gray-200">
                <div className="aspect-video"><iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${v.id}`} title={v.title} allowFullScreen className="w-full h-full"/></div>
                <div className="p-2 bg-gray-50 text-xs text-gray-500">{v.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 -> ISRO Competition */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-3 text-purple-700">Appreciation for ISRO CYBER COMPETITION</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">Congratulations to one of our students of class VIII <strong>Deepanshi Gupta</strong> who participated in ISRO CYBER COMPETITION (Model making). Her project was selected by ISRO and she has received an Appreciation certificate.</p>
          <img src="https://www.skpresidency.com/images/section-pic/events/isro-certificate.jpg" alt="ISRO Certificate" className="rounded-xl max-w-md shadow-md" />
        </div>

        {/* 5 -> Republic Day 2020 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 text-orange-700">Republic Day celebrated on 26th January, 2020</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({length:23},(_,i)=>i+1).map(i => (
              <img key={i} src={`https://www.skpresidency.com/images/section-pic/events/republicday-2020/${i}.jpg`}
                alt={`Republic Day ${i}`} className="rounded-lg w-full aspect-square object-cover shadow-sm hover:shadow-md hover:scale-105 transition-all" />
            ))}
          </div>
        </div>

        {/* 6 -> Annual Exhibition Dec 2019 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 text-teal-700">Annual Exhibition held on 15th December, 2019</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {Array.from({length:11},(_,i)=>i+1).map(i => (
              <img key={i} src={`https://www.skpresidency.com/images/section-pic/events/annual-exhibition-dec-2019/${i}.jpg`}
                alt={`Exhibition ${i}`} className="rounded-lg w-full aspect-square object-cover shadow-sm hover:shadow-md hover:scale-105 transition-all" />
            ))}
          </div>
        </div>

        {/* 7 -> Republic Day 2019 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 text-orange-700">Republic Day celebrated on 26th January, 2019</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://www.skpresidency.com/images/section-pic/events/republicday-2019/${i}.jpg`}
                alt={`Republic Day 2019 ${i}`} className="rounded-xl w-full shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all" />
            ))}
          </div>
        </div>

        {/* 8 -> Red Day */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-3 text-red-700">Red Day celebrated on 22nd November, 2018</h3>
          <p className="text-sm text-gray-600 leading-relaxed">The tiny tots of SK Presidency Public School celebrated Red Day with great enthusiasm. Students and teachers came dressed in red attire. The classrooms were decorated with red balloons and objects. Children were taught about the significance of the colour red through various fun-filled activities.</p>
        </div>

      </div>
    </InnerPageLayout>
  );
}
