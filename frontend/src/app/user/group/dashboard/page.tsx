"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'
import QRCode from 'qrcode'

export default function GroupDashboard() {
	const router = useRouter()

	// Auth guard
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const correspondentID = localStorage.getItem("correspondentID")
			if (!correspondentID) router.push('/group/login')
		}
	}, [router])

	// Camp access gate
	const [campAccessCode, setCampAccessCode] = useState("")
	const [isUnlocked, setIsUnlocked] = useState(false)
	const [codeError, setCodeError] = useState("")
	const [codeLoading, setCodeLoading] = useState(false)

	// Auto-unlock if ?code= in URL (QR scan — treat as pre-verified)
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const code = params.get("code")
		if (code) {
			setCampAccessCode(code.toUpperCase())
			setIsUnlocked(true)
		}
	}, [])

	async function handleContinue(e: React.FormEvent) {
		e.preventDefault()
		const code = campAccessCode.trim().toUpperCase()
		if (!code) return
		setCodeError("")
		setCodeLoading(true)
		try {
			const res = await fetch('/api/verify-camp-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ campCode: code }),
			})
			const data = await res.json()
			if (data.valid) {
				setCampAccessCode(code)
				setIsUnlocked(true)
			} else {
				setCodeError(data.error || "Invalid camp code. Please check and try again.")
			}
		} catch {
			setCodeError("Could not verify code. Please try again.")
		} finally {
			setCodeLoading(false)
		}
	}

	// QR Code – URL uses /landing (no /user/ prefix; middleware adds it on user subdomain)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [qrGenerated, setQrGenerated] = useState(false)
	const [campUrl, setCampUrl] = useState("")
	const [campFormUrl, setCampFormUrl] = useState("")

	useEffect(() => {
		if (isUnlocked && typeof window !== 'undefined') {
			setCampUrl(`${window.location.origin}/landing?code=${encodeURIComponent(campAccessCode)}`)
			// Strip subdomain (e.g. user.localhost → localhost) so the form link
			// doesn't get double-rewritten by the middleware
			const rootHost = window.location.hostname.replace(/^[^.]+\./, '')
			const port = window.location.port ? `:${window.location.port}` : ''
			setCampFormUrl(`${window.location.protocol}//${rootHost}${port}/test/camp?code=${encodeURIComponent(campAccessCode)}`)
		}
	}, [isUnlocked, campAccessCode])

	async function generateQR() {
		if (!canvasRef.current || !campUrl) return
		await QRCode.toCanvas(canvasRef.current, campUrl, { width: 200, margin: 2 })
		setQrGenerated(true)
	}

	function downloadQR() {
		if (!canvasRef.current) return
		const link = document.createElement("a")
		link.download = `camp-${campAccessCode}-qr.png`
		link.href = canvasRef.current.toDataURL("image/png")
		link.click()
	}

	return (
		<>
			<Navbar>
				<SuperButton name="Log out" path="/group/logout" variant={0} />
			</Navbar>

			<div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

				{!isUnlocked ? (
					/* Step 1: camp code */
					<section className="bg-white rounded-lg border border-gray-200 p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">Camp Access</h2>
						<form onSubmit={handleContinue} className="space-y-3">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Camp Access Code</label>
								<input
									className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--color_red)] focus:outline-none"
									value={campAccessCode}
									onChange={e => { setCampAccessCode(e.target.value); setCodeError("") }}
									placeholder="e.g. CAMP01"
								/>
							</div>
							{codeError && (
								<div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{codeError}</div>
							)}
							<button
								type="submit"
								disabled={codeLoading}
								className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								{codeLoading ? "Verifying…" : "Continue"}
							</button>
						</form>
					</section>
				) : (
					<>
						{/* Active camp badge */}
						<div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center justify-between">
							<span>Active camp code: <strong className="font-mono">{campAccessCode}</strong></span>
							<button
								onClick={() => { setIsUnlocked(false); setQrGenerated(false) }}
								className="text-xs text-[var(--color_red)] underline ml-4"
							>
								Switch camp
							</button>
						</div>

						{/* QR Code */}
						<section className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold text-gray-800 mb-2">Generate Camp Form QR Code</h2>
							<p className="text-sm text-gray-500 mb-4">
								Links residents to the choice page pre-loaded with camp code <strong>{campAccessCode}</strong>.
							</p>
							<button
								onClick={generateQR}
								className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors mb-2"
							>
								Generate QR Code
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
									className="rounded-lg border border-gray-200"
								/>
								{!qrGenerated && (
									<div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400">
										No QR code generated yet
									</div>
								)}
								{qrGenerated && campUrl && (
									<div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
										Links to: <strong>{campUrl}</strong>
									</div>
								)}
							</div>
						</section>

						{/* Chatbot — /chatbot → middleware rewrites to /user/chatbot ✅ */}
						<section className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold text-gray-800 mb-2">AI Health Assistant</h2>
							<p className="text-sm text-gray-500 mb-4">
								Open the AI chatbot to collect detailed product needs through a guided conversation.
							</p>
							<a href="/chatbot">
								<button className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors">
									Go to Chatbot
								</button>
							</a>
						</section>

						{/* Submit Request form — /submitRequest → /user/submitRequest ✅ */}
						<section className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold text-gray-800 mb-2">Open Camp Form</h2>
							<p className="text-sm text-gray-500 mb-4">
								Open the request form pre-loaded with camp code <strong>{campAccessCode}</strong>.
							</p>
							<a href={campFormUrl || `/test/camp?code=${encodeURIComponent(campAccessCode)}`}>
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