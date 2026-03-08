
export function SuperButton({ name, path, variant }: { name: string, path: string, variant: number }) {

	var formatting = ""; 

	switch (variant) {
		case 0:
			formatting = "text-[var(--color_red)] hover:text-[var(--color_red_tinted)] hover:bg-[var(--color_white_tinted)]"
			break;
		case 1:
			formatting = "text-[var(--color_white)] bg-[var(--color_red)] hover:bg-[var(--color_red_tinted)]"
			break;
		default:
			break;
	}

	return (
		<a 
			href={path} 
			className={"px-3 py-2 rounded-lg transition-colors duration-200 font-medium " + formatting}
		>
			{name}
		</a>
	);
}