"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
	const router = useRouter()

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const charityID = localStorage.getItem("charityID")
			if (charityID) {
				router.push('/charity/dashboard')
			} else {
				router.push('/charity/login')
			}
		}
	}, [router])


	// if (localStorage.getItem("charityID")) {
	// 	useEffect(() => {
	// 		router.push('/dashboard')
	// 	}, [router])
	// } else {
	// 	useEffect(() => {
	// 		router.push('/login')
	// 	}, [router])
	// }

	return <div>Loading...</div>
}