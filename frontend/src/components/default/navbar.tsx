import Image from 'next/image'

export function Navbar() {
	return (
		<nav className="w-full bg-gradient-to-r from-[var(--color_white)] to-[var(--color_white_tinted)] shadow-lg">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo / root button */}
					<div className="flex-shrink-0">
						<a href="http://localhost:3000" className="text-[var(--color_red)] text-xl font-bold"><Image src='/Logo_Horizontal_wtext.svg' alt="AIDWAY Logo" width={180} height={0}/></a>
					</div>
					
					{/* Nav Links */}
					<div className="flex items-center gap-6">
						<a 
							href="/" 
							className="text-[var(--color_red)] hover:text-[var(--color_red_tinted)] px-3 py-2 rounded-lg hover:bg-[var(--color_white_tinted)] transition-colors duration-200 font-medium"
						>
							Home
						</a>
						<a 
							href="http://user.localhost:3000" 
							className="bg-[var(--color_red)] text-[var(--color_white)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--color_red_tinted)] transition-all duration-200 shadow-md hover:shadow-lg"
						>
							Request Help
						</a>
						<a 
							href="http://admin.localhost:3000"
							className="bg-[var(--color_red)] text-[var(--color_white)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--color_red_tinted)] transition-all duration-200 shadow-md hover:shadow-lg"
						>
							Group dashboard
						</a>
						<a 
							href="http://charity.localhost:3000" 
							className="bg-[var(--color_red)] text-[var(--color_white)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--color_red_tinted)] transition-all duration-200 shadow-md hover:shadow-lg"
						>
							Charity dashboard
						</a>
					</div>
				</div>
			</div>
		</nav>
	);
}