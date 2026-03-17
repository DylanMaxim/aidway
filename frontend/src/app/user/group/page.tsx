"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
	const router = useRouter()

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const correspondentID = localStorage.getItem("correspondentID")
			if (correspondentID) {
				router.push('/user/group/dashboard')
			} else {
				router.push('/user/group/login')
			}
		}
	}, [router])


	return <div>Loading...</div>
}