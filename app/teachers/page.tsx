import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Teachers"><div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="text-sm leading-relaxed text-gray-700">
        <p className="mb-3">In SK Presidency, we are proud to have a group of highly dedicated team of teachers headed by an able Principal. Specially trained teachers are being inducted from Kerala to practice fluent English. These teachers are the driving force behind school's success in terms of student strength and reputation.</p>
        <p>We acknowledge the contribution of our dear teachers for the growth of the school. We thank them for accepting and imbibing our ethos, values and philosophy of leading by examples in their professional and private lives as responsible teachers having a special place in Indian society.</p>
      </div>
      <div className="flex items-center justify-center"><img src="https://skpresidency.com/images/section-pic/teacher-1.jpg" alt="Teachers" className="rounded-xl w-full max-w-sm shadow-md" /></div>
    </div>
    <img src="https://skpresidency.com/images/section-pic/teacher-2.jpg" alt="Teachers Group" className="rounded-xl w-full shadow-md mt-2" /></InnerPageLayout>;
}