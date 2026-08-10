import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Notice Board"><div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <h4 className="font-bold text-blue-800 mb-2 text-lg">Registration Open For Session 2026-2027</h4>
        <p className="text-blue-700">For any information please contact <strong>86017 35757, 86017 38180</strong></p>
      </div>
      <div className="bg-white rounded-xl p-5 border">
        <h4 className="font-bold mb-2">Prospectus 2026-27</h4>
        <a href="/Prospectus.pdf" className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:underline">Click for Prospectus 2026-27</a>
      </div>
      <div className="bg-white rounded-xl p-5 border">
        <h4 className="font-bold mb-2 text-green-700">The school has been approved for XII standard classes.</h4>
      </div>
      <hr className="border-gray-200" />
      <div className="bg-gray-50 rounded-xl p-5 border">
        <h4 className="font-bold mb-2">Mandatory Public Disclosure</h4>
        <a href="/mandatory-disclosure" className="text-blue-600 font-semibold text-sm hover:underline">Click for Mandatory Public Disclosure</a>
      </div>
    </div></InnerPageLayout>;
}