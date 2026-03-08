import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'

export default function Home() {
	return (
<>
	<Navbar><>
		<SuperButton name="Request Supplies" path="/submitRequest" variant={1}></SuperButton>
		<SuperButton name="Manage group" path="/group" variant={1}></SuperButton>
	</></Navbar>
	<h3>A period doesn't stop with a crisis.</h3>
	<p>AIDWAY aims to deliver period products during humanitarian disasters. Around the world, women, girls, and people who menstruate require sanitary products more than other types of products to manage their periods safely and with dignity.</p>
</>
);}