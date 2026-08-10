import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Contact"><div className="grid md:grid-cols-2 gap-6">
      <div>
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <h3 className="font-bold text-sm mb-2">SK Presidency Public School</h3>
          <p className="text-xs text-gray-500 mb-3">Founded by Dr. Shrikant Upadhyaya Educational and Charitable Trust</p>
          <div className="space-y-2 text-xs">
            <div><span className="font-semibold">CBSE Affiliation Number:</span> <span className="font-bold text-blue-600">2133231</span></div>
            <div><span className="font-semibold">Manager:</span> Shri Rajesh Upadhyaya</div>
            <div><span className="font-semibold">Address:</span> Faizabad-Sultanpur Bypass, Near Gomti Bridge, Odara, Sultanpur</div>
            <div><span className="font-semibold">Pincode:</span> 228001, Uttar Pradesh</div>
            <div><span className="font-semibold">Phone:</span> 8601735757, 8601738180</div>
            <div><span className="font-semibold">E-mail:</span> office@skpresidency.com, hrskpps@gmail.com</div>
            <div><span className="font-semibold">Web:</span> skpresidency.com</div>
          </div>
        </div>
        <div className="flex gap-3">
          <a href="/Prospectus.pdf" className="text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Download Prospectus</a>
          <a href="/AdmissionForm.pdf" className="text-xs font-semibold bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">Admission Form</a>
        </div>
      </div>
      <div className="bg-gray-100 rounded-xl flex items-center justify-center min-h-[250px] text-gray-400 text-sm">📷 Contact Image</div>
    </div></InnerPageLayout>;
}