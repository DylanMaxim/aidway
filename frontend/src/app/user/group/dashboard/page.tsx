import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'

export default function Dashboard() {
	return (
<>
	<Navbar>
		<SuperButton name="Log out" path="/logout" variant={0}/>
	</Navbar>
</>
);}