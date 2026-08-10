import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Vision & Mission"><div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <h3 className="font-bold text-blue-800 text-lg mb-2">Our Mission</h3>
        <p className="text-blue-700 leading-relaxed">To prepare the future generations with academic excellence and practical skill sets needed to face global challenges and lead the country into the world of the future.</p>
      </div>
      <div><img src="https://skpresidency.com/images/section-pic/mission-pic.jpg" alt="Mission" className="rounded-xl w-full shadow-md" /></div>
    </div>
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 mb-6">
      <h3 className="font-bold text-emerald-800 text-lg mb-2">Our Vision</h3>
      <p className="text-emerald-700 leading-relaxed">To establish ourselves as a leading school providing education of highest standards with integrity, consistency and due diligence.</p>
    </div>
    <h3 className="font-bold text-lg mb-3">Our sincere efforts are</h3>
    <ul className="list-disc ml-5 space-y-2 text-sm leading-relaxed text-gray-700">
      <li>Help students become mature, value-oriented citizens</li>
      <li>Encourage them to continually strive for excellence</li>
      <li>Dispose them to value freedom and use it judiciously</li>
      <li>Teach them to be courageous and firm on principles</li>
      <li>Inspire them to be selfless while serving others</li>
      <li>Instil in them the drive and will to initiate social change</li>
      <li>Train them to acquire good habits, sense of cleanliness and orderliness so as to prepare them to become a good citizen</li>
      <li>Teach them good English to be at par international standard</li>
    </ul></InnerPageLayout>;
}