import { Navbar } from '@/components/user/navbar'

export default function Home() {
	return (
<>
	<Navbar/>

	<h2 className="text-red py-5 rounded-lg font-sans font-semibold text-xl">Periods don't stop in a crisis.</h2>
	<p>AIDWAY aims to deliver period products during humanitarian disasters. Find out how to help.</p>

	<p className="text-red text-base font-sans">To register with us...</p>
	<ol className="text-red text-base font-sans">
		<li>1. Users in a camp must register with a charity.</li>
		<li>2. A charity should register with us, and they will receive an access code.</li>
		<li>3. Each camp will have a unique access code.</li>
		<li>4. All users in different camps will be able to submit a request form to request what products will be need.</li>
	</ol>

</>
);}