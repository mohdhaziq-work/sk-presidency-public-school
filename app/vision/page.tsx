import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Vision & Mission"><div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
        <h3 className="font-bold text-blue-800 mb-2">Our Mission</h3>
        <p className="text-sm text-blue-700">To prepare the future generations with academic excellence and practical skill sets needed to face global challenges and lead the country into the world of the future.</p>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5">
        <h3 className="font-bold text-emerald-800 mb-2">Our Vision</h3>
        <p className="text-sm text-emerald-700">To establish ourselves as a leading school providing education of highest standards with integrity, consistency and due diligence.</p>
      </div>
    </div>
    <h3 className="font-bold mb-3">Our Sincere Efforts Are</h3>
    <ul className="list-disc ml-5 space-y-2 text-sm leading-relaxed">
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