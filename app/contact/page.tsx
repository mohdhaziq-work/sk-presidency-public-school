import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Contact"><div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="text-sm leading-relaxed text-gray-700 space-y-3">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-bold mb-2">SK Presidency Public School</h3>
          <p className="text-xs text-gray-500 mb-2">Founded by Dr. Shrikant Upadhyaya Educational and Charitable Trust</p>
          <p><strong>CBSE Affiliation Number: 2133231</strong></p>
          <p><strong>Shri Rajesh Upadhyaya, Manager</strong></p>
          <p>Faizabad-Sultanpur Bypass, Near Gomti Bridge,</p>
          <p>Odara, Sultanpur</p>
          <p>Pincode: 228001, Uttar Pradesh</p>
          <p>Phone: 8601735757, 8601738180</p>
          <p>E-mail: office@skpresidency.com, hrskpps@gmail.com</p>
          <p>Web: skpresidency.com</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <a href="/Prospectus.pdf" className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition">Download Prospectus</a>
          <a href="/AdmissionForm.pdf" className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-200 transition">Admission Form</a>
        </div>
      </div>
      <div className="flex items-center justify-center"><img src="https://skpresidency.com/images/section-pic/contact.jpg" alt="Contact" className="rounded-xl w-full max-w-sm shadow-md" /></div>
    </div></InnerPageLayout>;
}