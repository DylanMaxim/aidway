import { Navbar } from '@/components/user/navbar'

export default function Home() {
	return (
<>
	<Navbar/>
	<h2 className="text-black py-5 rounded-lg font-semibold">Periods don't stop in a crisis.</h2>
	<p>AIDWAY aims to deliver period products during humanitarian disasters. Find out how to help.</p>

	<p>To register with us...</p>
	<ol>
		<li>Users in a camp must register with a charity.</li>
		<li>A charity should register with us, and they will receive an access code.</li>
		<li>Each camp will have a unique access code.</li>
		<li>All users in different camps will be able to submit a request form to request what products will be need.</li>
	</ol>

</>
);}