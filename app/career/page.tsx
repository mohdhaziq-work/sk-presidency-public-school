import InnerPageLayout from '@/components/layout/InnerPage';

export default function Page() {
  return <InnerPageLayout title="Careers" subtitle="Join our team of dedicated educators">
    <p className="mb-4">SK Presidency Public School is always looking for passionate, qualified educators and staff who share our vision of excellence in education.</p><div className="bg-blue-50 rounded-xl p-5 mb-5"><h3 className="font-bold text-blue-800 mb-2">Current Openings</h3><ul className="list-disc ml-5 space-y-2 text-sm text-blue-700"><li>PGT English — MA + B.Ed, 3+ years experience</li><li>TGT Mathematics — B.Sc + B.Ed, 2+ years experience</li><li>PRT All Subjects — Graduate + D.El.Ed</li><li>Computer Teacher — BCA/MCA</li><li>Physical Education Trainer — B.P.Ed</li></ul></div><p className="mb-2"><strong>How to Apply:</strong> Send your resume to hrskpps@gmail.com or visit the school office with your CV and certificates.</p>
  </InnerPageLayout>;
}