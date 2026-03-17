"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'
import QRCode from 'qrcode'

export default function GroupDashboard() {
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [campID, setCampID] = useState("")
	const [correspondentData, setCorrespondentData] = useState<any>(null)

	// QR Code state
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [qrGenerated, setQrGenerated] = useState(false)
	const [campUrl, setCampUrl] = useState("")
	const [code, setCode] = useState<string | null>(null)
	// const [campFormUrl, setCampFormUrl] = useState("")

	// Fetch correspondent data on mount
	useEffect(() => {
		async function loadCorrespondent() {
			if (typeof window === 'undefined') return

			const correspondentID = localStorage.getItem("correspondentID")

			if (!correspondentID) {
				router.push('/user/group/login')
				return
			}

			setLoading(true)
			setError("")

			try {
				// Fetch correspondent document from Firebase
				const response = await fetch(`/api/correspondent/get?id=${correspondentID}`)
				const data = await response.json()

				if (!response.ok || !data.success) {
					setError(data.error || "Failed to load correspondent data")
					return
				}

				setCorrespondentData(data.correspondent)

				// Get camp ID from correspondent data
				const code = data.correspondent.campID
				if (!code) {
					setError("No camp ID assigned to this correspondent")
					return
				}

				setCampID(code.toUpperCase())

			} catch (err) {
				console.error("Error loading correspondent:", err)
				setError("Failed to load correspondent data. Please try again.")
			} finally {
				setLoading(false)
			}
		}

		loadCorrespondent()
	}, [router])

	// Generate QR URLs when camp ID is loaded
	useEffect(() => {
		if (!campID) return

		async function fetchCode() {
			try {
				const res = await fetch(`/api/camp_formcode?id=${encodeURIComponent(campID)}`)
				const data = await res.json()

				if (!res.ok || !data.success) {
					setError("Failed to generate form code")
					return
				}

				setCode(data.code)

				const origin = window.location.origin
				//http://user.localhost:3000/submitRequest?id=TL5-5RK
				setCampUrl(`${origin}/user/submitRequest?id=${encodeURIComponent(`${data.code.slice(0, 3)}-${data.code.slice(3, 6)}`)}`)

				const rootHost = window.location.hostname.replace(/^[^.]+\./, '')
				const port = window.location.port ? `:${window.location.port}` : ''
				// setCampFormUrl(`${window.location.protocol}//${rootHost}${port}/test/camp?code=${encodeURIComponent(data.code)}`)

			} catch (err) {
				console.error(err)
				setError("Failed to generate form code")
			}
		}

		fetchCode()

	}, [campID])

	async function generateQR() {
		if (!canvasRef.current || !campUrl) return
		await QRCode.toCanvas(canvasRef.current, campUrl, { width: 200, margin: 2 })
		setQrGenerated(true)
	}

	function downloadQR() {
		if (!canvasRef.current) return
		const link = document.createElement("a")
		link.download = `camp-${campID}-qr.png`
		link.href = canvasRef.current.toDataURL("image/png")
		link.click()
	}

	return (
		<>
			<Navbar>
				<SuperButton name="Log out" path="/user/group/logout" variant={0} />
			</Navbar>

			<div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

				{loading ? (
					/* Loading state */
					<section className="bg-white rounded-lg border border-gray-200 p-6">
						<div className="flex items-center justify-center py-8">
							<div className="text-center">
								<div className="animate-spin text-4xl mb-4">⏳</div>
								<p className="text-gray-600">Loading dashboard...</p>
							</div>
						</div>
					</section>
				) : error ? (
					/* Error state */
					<section className="bg-white rounded-lg border border-gray-200 p-6">
						<div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
							<h3 className="font-semibold mb-2">Error</h3>
							<p className="text-sm">{error}</p>
						</div>
						<button
							onClick={() => router.push('/user/group/login')}
							className="mt-4 w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors"
						>
							Return to Login
						</button>
					</section>
				) : (
					<>
						{/* Correspondent info badge */}
						<div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
							<div className="flex items-center justify-between mb-2">
								<span className="text-gray-600">Correspondent:</span>
								<strong>{correspondentData?.name || 'Unknown'}</strong>
							</div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-gray-600">Email:</span>
								<span className="text-gray-800">{correspondentData?.email}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-600">Camp ID:</span>
								<strong className="font-mono">{campID}</strong>
							</div>
						</div>

						{/* QR Code */}
						<section className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold text-gray-800 mb-2">Generate Camp Form QR Code</h2>
							<p className="text-sm text-gray-500 mb-4">
								Links residents to the choice page pre-loaded with a one-day form token.
							</p>
							<button
								onClick={generateQR}
								className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors mb-2"
							>
								Generate form code and QR Code
							</button>
							{qrGenerated && (
								<button
									onClick={downloadQR}
									className="w-full bg-white text-gray-800 border border-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
								>
									Download QR Code (PNG)
								</button>
							)}
							<div className="mt-4 flex flex-col gap-3">
								<canvas
									ref={canvasRef}
									style={{ display: qrGenerated ? 'block' : 'none' }}
									className="rounded-lg border border-gray-200 mx-auto"
								/>
								{!qrGenerated && (
									<div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400">
										No QR code generated yet
									</div>
								)}
								{qrGenerated && code && (
									<p className='mx-auto font-bold'>CODE : {code}</p>
								)}
								{qrGenerated && campUrl && (
									<div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm break-all">
										Links to: <strong>{campUrl}</strong>
									</div>
								)}
							</div>
						</section>

						{/* Chatbot */}
						<section className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold text-gray-800 mb-2">AI Health Assistant</h2>
							<p className="text-sm text-gray-500 mb-4">
								Open the AI chatbot to collect detailed product needs through a guided conversation.
							</p>
							<a href="/user/chatbot">
								<button className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors">
									Go to Chatbot
								</button>
							</a>
						</section>

						{/* Submit Request form */}
						<section className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold text-gray-800 mb-2">Open Camp Form</h2>
							<p className="text-sm text-gray-500 mb-4">
								Open the request form pre-loaded with camp ID <strong>{campID}</strong>.
							</p>
							<a href={campUrl || `/test/camp?code=${encodeURIComponent(campID)}`}>
								<button className="w-full bg-white text-gray-800 border border-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
									Open Camp Form
								</button>
							</a>
						</section>
					</>
				)}
			</div>
		</>
	)
}
