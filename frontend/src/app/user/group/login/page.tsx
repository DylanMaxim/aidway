import { Correspondent_Login } from '@/components/default/login'
import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'

export default function LoginPage() {
	return (<>
		<Navbar>
			<SuperButton name="Back" path="/" variant={0} />
		</Navbar>
		<Correspondent_Login/>
</>
);}