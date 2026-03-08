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

	// Access code state
	const [generatedCode, setGeneratedCode] = useState("")
	const [copied, setCopied] = useState(false)

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

	// ── Generate access code ──────────────────────────────────────────────
	async function generateCampAccessCode() {
		const value = Math.floor(Math.random() * 0xffffff)
		const code = value.toString(16).toUpperCase().padStart(6, "0")

		try {
			const rawCodes = localStorage.getItem("validCampAccessCodes")
			const existing = rawCodes ? JSON.parse(rawCodes) : []
			const codeSet = new Set(Array.isArray(existing) ? existing : [])
			codeSet.add(code)
			localStorage.setItem("validCampAccessCodes", JSON.stringify([...codeSet]))
		} catch (e) {
			console.error("Failed to store access code locally:", e)
		}

		// Persist to Firestore so correspondents can verify it
		try {
			await fetch('/api/register-camp-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ campCode: code }),
			})
		} catch (e) {
			console.error("Failed to persist camp code to Firebase:", e)
		}

		setGeneratedCode(code)
		setCampId(code)
		setCopied(false)
	}

	function copyCode() {
		if (!generatedCode) return
		navigator.clipboard.writeText(generatedCode)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
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

	return (
		<>
			<Navbar>
				<SuperButton name="Log out" path="/logout" variant={0} />
			</Navbar>

			<div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

				{/* ── Generate Camp Access Code ── */}
				<section className="bg-white rounded-lg border border-gray-200 p-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">Generate Camp Access Code</h2>
					<button
						onClick={generateCampAccessCode}
						className="w-full bg-[var(--color_red)] text-white py-2.5 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors"
					>
						Generate Camp Access Code
					</button>
					<div className="flex items-center gap-3 mt-3">
						<div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm font-semibold tracking-widest">
							{generatedCode || "No code generated yet"}
						</div>
						{generatedCode && (
							<button
								onClick={copyCode}
								className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${copied
									? 'bg-green-700 text-white border-green-700'
									: 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
									}`}
							>
								{copied ? "Copied!" : "Copy"}
							</button>
						)}
					</div>
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

			</div>
		</>
	)
}