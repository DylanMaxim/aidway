"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'

const CampMap = dynamic(() => import('../../test/charity/CampMap'), { ssr: false })

function getHeatmapColor(count: number): string {
	if (count >= 11) return "#ef4444"
	if (count >= 6) return "#fb923c"
	if (count >= 3) return "#fdba74"
	if (count >= 1) return "#fef3c7"
	return "#f9fafb"
}

export default function Dashboard() {
	const router = useRouter()

	// Auth guard
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const charityID = localStorage.getItem("charityID")
			if (!charityID) router.push('/login')
		}
	}, [router])

	// Create camp form state
	const [campName, setCampName] = useState("")
	const [campLocation, setCampLocation] = useState("")
	const [correspondentName, setCorrespondentName] = useState("")
	const [correspondentEmail, setCorrespondentEmail] = useState("")
	const [creatingCamp, setCreatingCamp] = useState(false)
	const [createError, setCreateError] = useState("")
	const [createdCampCode, setCreatedCampCode] = useState("")

	// Camp summary state
	const [campId, setCampId] = useState("")
	const [summaryResponse, setSummaryResponse] = useState<any>(null)

	// Prediction state
	const [predictionCampId, setPredictionCampId] = useState("")
	const [predictionResponse, setPredictionResponse] = useState<any>(null)

	// Heatmap state
	const [heatmapData, setHeatmapData] = useState<any>(null)

	// Camp map state
	const [campMapData, setCampMapData] = useState<any>(null)

	// Fulfil order state
	const [fulfilCampId, setFulfilCampId] = useState("")
	const [fulfilledCampOrders, setFulfilledCampOrders] = useState<string[]>([])

	// Load fulfilled orders from localStorage
	useEffect(() => {
		if (typeof window === 'undefined') return
		try {
			const raw = localStorage.getItem("fulfilledCampOrders")
			const parsed = raw ? JSON.parse(raw) : []
			setFulfilledCampOrders(Array.isArray(parsed) ? parsed : [])
		} catch (error) {
			console.error("Failed to load fulfilled orders:", error)
			setFulfilledCampOrders([])
		}
	}, [])

	// ── Create New Camp ──────────────────────────────────────────────
	async function handleCreateCamp(e: React.FormEvent) {
		e.preventDefault()
		setCreateError("")
		setCreatingCamp(true)
		setCreatedCampCode("")

		try {
			const response = await fetch('/api/create-camp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					campName,
					campLocation,
					correspondentName,
					correspondentEmail,
					charityID: localStorage.getItem("charityID")
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				setCreateError(data.error || "Failed to create camp")
				return
			}

			// Success - show camp code
			setCreatedCampCode(data.campCode)
			
			// Clear form
			setCampName("")
			setCampLocation("")
			setCorrespondentName("")
			setCorrespondentEmail("")

			alert(`Camp created successfully!\n\nCamp Code: ${data.campCode}\n\nA one-time access code has been emailed to ${correspondentEmail}`)

		} catch (err) {
			console.error("Error creating camp:", err)
			setCreateError("Something went wrong. Please try again.")
		} finally {
			setCreatingCamp(false)
		}
	}

	// ── Camp summary ──────────────────────────────────────────────────────
	async function handleSummaryFetch(e: React.FormEvent) {
		e.preventDefault()
		const res = await fetch(`/api/camp-summary?campId=${encodeURIComponent(campId)}`)
		const data = await res.json()
		setSummaryResponse(data)
	}

	// ── Pad demand prediction ─────────────────────────────────────────────
	async function handlePredictionFetch(e: React.FormEvent) {
		e.preventDefault()
		const res = await fetch(`/api/predict-pad-demand?campId=${encodeURIComponent(predictionCampId)}`)
		const data = await res.json()
		setPredictionResponse(data)
	}

	// ── Heatmap ───────────────────────────────────────────────────────────
	async function handleHeatmapLoad() {
		const res = await fetch('/api/heatmap-data')
		const data = await res.json()
		setHeatmapData(data)
	}

	// ── Camp map ──────────────────────────────────────────────────────────
	async function handleCampMapLoad() {
		const res = await fetch('/api/camp-map-data')
		const data = await res.json()
		setCampMapData(data)
	}

	// ── Fulfil order (frontend-only) ──────────────────────────────────────
	function handleFulfilOrder() {
		const normalizedCampId = fulfilCampId.trim()
		if (!normalizedCampId) {
			alert("Please enter a camp ID")
			return
		}

		const updated = [...new Set([...fulfilledCampOrders, normalizedCampId])]
		setFulfilledCampOrders(updated)
		localStorage.setItem("fulfilledCampOrders", JSON.stringify(updated))
		alert(`Order for camp ${normalizedCampId} has been marked as fulfilled`)
		setFulfilCampId("")
	}

	return (
		<>
			<Navbar>
				<SuperButton name="Log out" path="/logout" variant={0} />
			</Navbar>

			<div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

				{/* ── Create New Camp ── */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-2">Create New Camp</h2>
					<p className="text-sm text-gray-600 mb-4">
						Register a new camp and send access credentials to the correspondent
					</p>

					<form onSubmit={handleCreateCamp} className="space-y-4">
						{/* Camp Details */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Camp Name
								</label>
								<input
									type="text"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--color_red)] focus:outline-none"
									value={campName}
									onChange={e => setCampName(e.target.value)}
									placeholder="e.g. Refugee Camp Alpha"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Camp Location
								</label>
								<input
									type="text"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--color_red)] focus:outline-none"
									value={campLocation}
									onChange={e => setCampLocation(e.target.value)}
									placeholder="e.g. Northern Region"
									required
								/>
							</div>
						</div>

						{/* Correspondent Details */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Correspondent Name
								</label>
								<input
									type="text"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--color_red)] focus:outline-none"
									value={correspondentName}
									onChange={e => setCorrespondentName(e.target.value)}
									placeholder="e.g. John Doe"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Correspondent Email
								</label>
								<input
									type="email"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--color_red)] focus:outline-none"
									value={correspondentEmail}
									onChange={e => setCorrespondentEmail(e.target.value)}
									placeholder="correspondent@email.com"
									required
								/>
							</div>
						</div>

						{/* Error Message */}
						{createError && (
							<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
								{createError}
							</div>
						)}

						{/* Created Camp Code Display */}
						{createdCampCode && (
							<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
								<p className="text-sm font-semibold text-green-800 mb-2">
									✅ Camp created successfully!
								</p>
								<div className="flex items-center gap-2">
									<span className="text-sm text-green-700">Camp Code:</span>
									<span className="font-mono font-bold text-green-900 text-lg">
										{createdCampCode}
									</span>
								</div>
								<p className="text-xs text-green-600 mt-2">
									A one-time access code has been sent to {correspondentEmail}
								</p>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={creatingCamp}
							className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							{creatingCamp ? (
								<span className="flex items-center justify-center gap-2">
									<span className="animate-spin">⏳</span>
									Creating Camp...
								</span>
							) : (
								'Create Camp & Send Credentials'
							)}
						</button>
					</form>
				</section>

				{/* ── Camp Summary ── */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">Camp Summary Lookup</h2>
					<form onSubmit={handleSummaryFetch} className="space-y-3">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Camp ID</label>
							<input
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--color_red)] focus:outline-none"
								value={campId}
								onChange={e => setCampId(e.target.value)}
								placeholder="Enter camp ID"
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors"
						>
							Fetch Summary
						</button>
					</form>
					{summaryResponse && (
						<div className="mt-4">
							<p className="text-sm font-medium text-gray-700 mb-1">Summary Response</p>
							<pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono">
								{JSON.stringify(summaryResponse, null, 2)}
							</pre>
						</div>
					)}
				</section>

				{/* ── Pad Demand Prediction ── */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">Pad Demand Prediction</h2>
					<form onSubmit={handlePredictionFetch} className="space-y-3">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Camp ID</label>
							<input
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--color_red)] focus:outline-none"
								value={predictionCampId}
								onChange={e => setPredictionCampId(e.target.value)}
								placeholder="Enter camp ID"
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors"
						>
							Predict Next Month Pad Demand
						</button>
					</form>
					{predictionResponse && (
						<div className="mt-4">
							<p className="text-sm font-medium text-gray-700 mb-1">Prediction Response</p>
							<pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono">
								{JSON.stringify(predictionResponse, null, 2)}
							</pre>
						</div>
					)}
				</section>

				{/* ── Demand Heatmap ── */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">Demand Heatmap</h2>
					<button
						onClick={handleHeatmapLoad}
						className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors"
					>
						Load Heatmap
					</button>
					<p className="text-xs text-gray-500 mt-2">0 = none &nbsp;|&nbsp; 1–2 = low &nbsp;|&nbsp; 3–5 = medium &nbsp;|&nbsp; 6–10 = high &nbsp;|&nbsp; 11+ = critical</p>

					{heatmapData && (
						<div className="mt-4 overflow-x-auto">
							<table className="w-full border-collapse text-xs min-w-[640px]">
								<thead>
									<tr>
										<th className="border border-gray-300 px-2 py-1.5 bg-gray-50 text-left">Camp ID</th>
										{(heatmapData.catalogItems || []).map((item: string) => (
											<th key={item} className="border border-gray-300 px-2 py-1.5 bg-gray-50 text-left">{item}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{(heatmapData.rows || []).map((row: any) => (
										<tr key={row.campId}>
											<td className="border border-gray-300 px-2 py-1.5">{row.campId}</td>
											{(heatmapData.catalogItems || []).map((item: string) => {
												const value = row.counts?.[item] ?? 0
												return (
													<td
														key={`${row.campId}-${item}`}
														className="border border-gray-300 px-2 py-1.5"
														style={{ background: getHeatmapColor(value) }}
													>
														{value}
													</td>
												)
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>

				{/* ── Camp Map ── */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-1">Camp Map</h2>
					<p className="text-xs text-gray-500 mb-4">Demo-only synthetic pinpoints for visualization.</p>
					<button
						onClick={handleCampMapLoad}
						className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors"
					>
						Load Camp Map
					</button>
					{campMapData && (
						<div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
							<CampMap camps={campMapData.camps || []} />
						</div>
					)}
				</section>

				{/* ── Fulfil Order ── */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">Fulfil Order</h2>
					<div className="space-y-3">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Camp ID</label>
							<input
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--color_red)] focus:outline-none"
								value={fulfilCampId}
								onChange={e => setFulfilCampId(e.target.value)}
								placeholder="Enter camp ID / access code"
							/>
						</div>
						<button
							type="button"
							onClick={handleFulfilOrder}
							className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors"
						>
							Fulfil Order
						</button>
					</div>

					<div className="mt-4">
						<h3 className="text-sm font-medium text-gray-700 mb-2">Fulfilled Orders</h3>
						{fulfilledCampOrders.length === 0 ? (
							<p className="text-sm text-gray-500">No fulfilled orders yet.</p>
						) : (
							<ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
								{fulfilledCampOrders.map((id) => (
									<li key={id}>{id}</li>
								))}
							</ul>
						)}
					</div>
				</section>

			</div>
		</>
	)
}
