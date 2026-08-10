import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Admissions" subtitle="Session 2026-2027 — Now Open"><div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-5"><p className="text-green-800 font-semibold text-sm">Admissions are currently OPEN for the academic session 2026-2027 for all classes from Play Group to Class XII.</p></div>
<h3 className="font-bold mb-2">How to Apply</h3>
<ol className="list-decimal ml-5 space-y-2 mb-4 text-sm">
  <li>Visit the school office to collect the admission form (or download below)</li>
  <li>Fill the form completely and attach required documents</li>
  <li>Submit the form at the school office with registration fee</li>
  <li>Interaction/entrance test date will be communicated</li>
  <li>Selected candidates will be notified for fee payment</li>
</ol>
<h3 className="font-bold mb-2">Required Documents</h3>
<ul className="list-disc ml-5 space-y-1 mb-4 text-sm">
  <li>Birth Certificate (original + copy)</li>
  <li>2 passport-size photographs</li>
  <li>Previous class report card (for Class 1 and above)</li>
  <li>Transfer Certificate (for Class 2 and above)</li>
  <li>Aadhar Card copy of student and parent</li>
</ul>
<div className="flex gap-3 flex-wrap"><a href="https://www.skpresidency.com/Prospectus.pdf" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-blue-700 transition">Download Prospectus</a><a href="https://www.skpresidency.com/AdmissionForm.pdf" className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-200 transition">Download Admission Form</a></div></InnerPageLayout>;
}