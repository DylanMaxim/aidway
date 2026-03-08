"use client"

import { useState } from 'react'
import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'

export default function SubmitRequestPage() {
	const [step, setStep] = useState(1)
	const [code, setCode] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [selectedOptions, setSelectedOptions] = useState<string[]>([])

	// Format code input as XXX-XXX
	const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
		if (value.length > 3) {
			value = value.slice(0, 3) + '-' + value.slice(3, 6)
		}
		setCode(value)
	}

	// Verify code with endpoint
	const handleCodeSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		setStep(2)
		return;

		setLoading(true)

		try {
			const response = await fetch('/api/verify-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code }),
			})

			const data = await response.json()

			if (data.valid) {
				setStep(2)
			} else {
				setError('Invalid code. Please try again.')
			}
		} catch (err) {
			setError('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	// Handle checkbox selection
	const handleCheckboxChange = (option: string) => {
		setSelectedOptions(prev =>
			prev.includes(option)
				? prev.filter(item => item !== option)
				: [...prev, option]
		)
	}

	// Submit final form
	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const response = await fetch('/api/submit-form', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code, options: selectedOptions }),
			})

			if (response.ok) {
				alert('Form submitted successfully!')
				// Reset form
				setStep(1)
				setCode('')
				setSelectedOptions([])
			}
		} catch (err) {
			setError('Submission failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<Navbar><>
				<SuperButton name="Back" path="/" variant={0}></SuperButton>
			</></Navbar>
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
						// Step 2: Checkbox Form
						<div>
							<button
								onClick={() => setStep(1)}
								className="text-[var(--color_red)] mb-4 hover:underline"
							>
								← Back to code entry
							</button>

							<h1 className="text-2xl font-bold text-gray-800 mb-2">Select Options</h1>
							<p className="text-gray-600 mb-6">Choose all that apply</p>

							<form onSubmit={handleFormSubmit}>
								<div className="space-y-3 mb-6">
									{['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'].map((option) => (
										<label
											key={option}
											className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-[var(--color_red)] cursor-pointer transition-colors"
										>
											<input
												type="checkbox"
												checked={selectedOptions.includes(option)}
												onChange={() => handleCheckboxChange(option)}
												className="w-5 h-5 text-[var(--color_red)] rounded focus:ring-[var(--color_red)] cursor-pointer"
											/>
											<span className="ml-3 text-gray-700 font-medium">{option}</span>
										</label>
									))}
								</div>

								{error && (
									<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
										{error}
									</div>
								)}

								<button
									type="submit"
									disabled={loading || selectedOptions.length === 0}
									className="w-full bg-[var(--color_red)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									{loading ? 'Submitting...' : 'Submit Form'}
								</button>
							</form>
						</div>
					)}
				</div>
			</div>
		</>
	)
}