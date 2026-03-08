import Image from 'next/image'

export function Navbar({ children }: { children?: React.ReactNode }) {
	return (
		<nav className="w-full bg-gradient-to-r from-[var(--color_white)] to-[var(--color_white_tinted)] shadow-lg">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo / root button */}
					<div className="flex-shrink-0">
						<a href="http://localhost:3000" className="text-[var(--color_red)] text-xl font-bold"><Image src='/Logo_Horizontal_wtext.svg' alt="AIDWAY Logo" width={180} height={0}/></a>
					</div>
					
					<div className="flex items-center gap-6">
						{children}
					</div>
				</div>
			</div>
		</nav>
	);
}