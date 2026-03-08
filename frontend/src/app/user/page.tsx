import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'

export default function Home() {
	return (
<>
	<Navbar><>
		<SuperButton name="Request Supplies" path="/submitRequest" variant={1}></SuperButton>
		<SuperButton name="Manage group" path="/group" variant={1}></SuperButton>
	</></Navbar>

	<h1 className="text-red-700 text-center pt-3 rounded-lg font-sans font-bold text-2xl border-1-4 pl-3 mb-6">
		Periods don't stop in a crisis.
	</h1>
	<p className="text-gray-700 text-base text-center leading-relaxed mb-5 font-sans">
		AIDWAY aims to deliver period products during humanitarian disasters. Find out how to help.
	</p>

	<div className="bg-white border border-red-200 rounded-xl p-6 mb-6 shadow-sm">
	<h2 className="text-red-700 rounded-lg font-semibold text-lg">To register with us...</h2>
	<ol className="list-decimal list-inside space-y-3 text-red-800">
		<li>Users in a camp must register with a charity.</li>
		<li>A charity should register with us, and they will receive an access code.</li>
		<li>Each camp will have a unique access code.</li>
		<li>All users in different camps will be able to submit a request form.</li>
	</ol>
	</div>

	<div className="bg-white border border-red-200 rounded-xl p-6 mb-6 shadow-sm">
	<h2 className="text-red-700 rounded-lg font-semibold text-lg"> After registration...</h2>
	<ol className="list-decimal list-inside space-y-3 text-red-800">
		<li>After each camp receives an access code, each camp will be assigned a camp correspondent.</li>
		<li>The camp correspondent will ensure that each user on the camp receives the products they requested.</li>
		<li>When products are ordered, they will be delivered on a monthly basis.</li>
	</ol>
	</div>

</>
);}