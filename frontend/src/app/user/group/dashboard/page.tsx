import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'
import Image from "next/image";

export default function Dashboard() {
	const code = "24EB7S"

	return (
<>
	<Navbar>
		<SuperButton name="Log out" path="/logout" variant={0}/>
	</Navbar>


	<Image 
		src={'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + code}
		alt="QR_code"
		loading="eager"
		width={128}
		height={128}
		className="object-cover"
		priority
	/>
</>
);}