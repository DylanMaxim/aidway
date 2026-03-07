export function Navbar() {
	return (
		<nav className="w-full bg-gradient-to-r from-[var(--color_white)] to-[var(--color_white_tinted)] shadow-lg">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo/Brand */}
					<div className="flex-shrink-0">
						<span className="text-[var(--color_red)] text-xl font-bold">Logo</span>
					</div>
					
					{/* Nav Links */}
					<div className="flex items-center gap-6">
						<a 
							href="/" 
							className="text-[var(--color_red)] hover:text-gray-100 transition-colors duration-200 font-medium"
						>
							Home
						</a>
						<a 
							href="/submitRequest" 
							className="bg-[var(--color_red)] text-[var(--color_white)] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg"
						>
							Submit Form
						</a>
					</div>
				</div>
			</div>
		</nav>
	);
}