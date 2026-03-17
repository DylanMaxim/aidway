"use client"

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'

function SubmitRequestContent() {

	const router = useRouter()
	const searchParams = useSearchParams()
	const [step, setStep] = useState(1)
	const [code, setCode] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [textInput, setTextInput] = useState('')
	const [isListening, setIsListening] = useState(false)
	const recognitionRef = useRef<any>(null)

	// Check URL for existing ID on mount
	useEffect(() => {
		if (!searchParams) return;

		const urlId = searchParams.get('id')
		if (urlId) {
			// Validate ID format (XXX-XXX)
			const formattedId = urlId.toUpperCase()
			if (/^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(formattedId)) {
				setCode(formattedId)
				setStep(2) // Skip to step 2
			}
		}
	}, [searchParams])

	// Initialize speech recognition
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

			if (SpeechRecognition) {
				recognitionRef.current = new SpeechRecognition()
				recognitionRef.current.continuous = false
				recognitionRef.current.interimResults = false
				recognitionRef.current.lang = 'en-US'

				recognitionRef.current.onresult = (event: any) => {
					const transcript = event.results[0][0].transcript
					setTextInput(prev => prev + (prev ? ' ' : '') + transcript)
					setIsListening(false)
				}

				recognitionRef.current.onerror = (event: any) => {
					console.error('Speech recognition error:', event.error)
					setError('Speech recognition error: ' + event.error)
					setIsListening(false)
				}

				recognitionRef.current.onend = () => {
					setIsListening(false)
				}
			}
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop()
			}
		}
	}, [])

	// Format code input as XXX-XXX
	const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
		if (value.length > 3) {
			value = value.slice(0, 3) + '-' + value.slice(3, 6)
		}
		setCode(value)
	}

	// Verify code with endpoint and update URL
	const handleCodeSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		// Update URL with the code
		router.push(`/submitRequest?id=${code}`, { scroll: false })

		setStep(2)
		return

		// Uncomment when API is ready
		/*
		setLoading(true)
		try {
			const response = await fetch('/api/verify-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code }),
			})
			const data = await response.json()
			if (data.valid) {
				router.push(`/user/submitRequest?id=${code}`, { scroll: false })
				setStep(2)
			} else {
				setError('Invalid code. Please try again.')
			}
		} catch (err) {
			setError('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
		*/
	}

	// Toggle speech recognition
	const toggleSpeechRecognition = () => {
		if (!recognitionRef.current) {
			setError('Speech recognition is not supported in your browser')
			return
		}

		if (isListening) {
			recognitionRef.current.stop()
			setIsListening(false)
		} else {
			setError('')
			recognitionRef.current.start()
			setIsListening(true)
		}
	}

	// Submit final form
	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError("")

		try {
			const payload = {
				campAccessCode: code.trim(),
				userText: textInput.trim()
			}

			const res = await fetch("/api/submit-request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			})

			const data = await res.json()

			if (!res.ok) {
				setError("Submission failed.")
				return
			}

			alert("Request submitted successfully!")

			// reset form
			setTextInput("")
			router.push("/user/submitRequest")
			setStep(1)
			setCode("")

		} catch (err) {
			console.error(err)
			setError("Submission failed.")
		} finally {
			setLoading(false)
		}
	}

	// Go back to step 1 and clear URL parameter
	const handleBackToCode = () => {
		router.push('/user/submitRequest')
		setStep(1)
		setCode('')
	}

	return (
		<>
			<Navbar>
				<SuperButton name="Back" path="/" variant={0} />
			</Navbar>
			<div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
				<div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
					{step === 1 ? (
						// Step 1: Code Entry
						<div>
							<h1 className="text-2xl font-bold text-gray-800 mb-2">Enter Access Code</h1>
							<p className="text-gray-600 mb-6">Please enter your code in the format XXX-XXX</p>

							<form onSubmit={handleCodeSubmit}>
								<div className="mb-4">
									<input
										type="text"
										value={code}
										onChange={handleCodeChange}
										placeholder="XXX-XXX"
										maxLength={7}
										className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[var(--color_red)] focus:outline-none text-center text-xl font-mono tracking-wider"
										required
									/>
								</div>

								{error && (
									<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
										{error}
									</div>
								)}

								<button
									type="submit"
									disabled={loading || code.length !== 7}
									className="w-full bg-[var(--color_red)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									{loading ? 'Verifying...' : 'Continue'}
								</button>
							</form>
						</div>
					) : (
						// Step 2: Text Input with Speech-to-Text
						<div>
							<button
								onClick={handleBackToCode}
								className="text-[var(--color_red)] mb-4 hover:underline"
							>
								← Back to code entry
							</button>

							<h1 className="text-2xl font-bold text-gray-800 mb-2">Describe Your Request</h1>
							<p className="text-gray-600 mb-4">Type or speak your request details</p>
							<p className="text-sm text-gray-500 mb-6">Code: <span className="font-mono font-bold">{code}</span></p>

							<form onSubmit={handleFormSubmit}>
								<div className="mb-4">
									<textarea
										value={textInput}
										onChange={(e) => setTextInput(e.target.value)}
										placeholder="Enter your request details here..."
										rows={6}
										className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[var(--color_red)] focus:outline-none resize-none"
										required
									/>
								</div>

								{/* Speech-to-Text Button */}
								<div className="mb-4">
									<button
										type="button"
										onClick={toggleSpeechRecognition}
										className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isListening
											? 'bg-red-500 text-white hover:bg-red-600'
											: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
											}`}
									>
										{isListening ? (
											<>
												<span className="animate-pulse">🎤</span>
												<span>Listening...</span>
											</>
										) : (
											<>
												<span>🎤</span>
												<span>Speak Your Request</span>
											</>
										)}
									</button>
									<p className="text-sm text-gray-500 mt-2 text-center">
										Click to speak, your words will be added to the text above
									</p>
								</div>

								{error && (
									<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
										{error}
									</div>
								)}

								<button
									type="submit"
									disabled={loading || textInput.trim().length === 0}
									className="w-full bg-[var(--color_red)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									{loading ? 'Submitting...' : 'Submit Request'}
								</button>
							</form>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default function SubmitRequestPage() {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
			<SubmitRequestContent />
		</Suspense>
	)
}