"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'
import Image from 'next/image'

export function Charity_Login() {
	const router = useRouter()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [showPassword, setShowPassword] = useState(false)

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const charityID = localStorage.getItem("charityID")
			if (charityID) {
				router.push('/dashboard')
			}
		}
	}, [router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const response = await fetch('/api/charity_login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			})

			const data = await response.json()

			if (response.ok) {
				// Redirect to charity dashboard
				localStorage.setItem("charityID", data.user.id);
				router.push('/dashboard')
			} else {
				setError(data.message || 'Invalid credentials')
			}
		} catch (err) {
			setError('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
					{/* Logo */}
					<div className="flex justify-center mb-6">
						<Image
							src='/Logo_Horizontal_wtext.svg'
							alt="AIDWAY Logo"
							width={150}
							height={50}
							className="h-auto w-auto"
						/>
					</div>

					{/* Title */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Charity Login</h1>
						<p className="text-gray-600">Access your organization's dashboard</p>
					</div>

					{/* Login Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Email Input */}
						<div>
							<label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
								Email Address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="charity@organization.org"
								className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[var(--color_red)] focus:outline-none transition-colors"
								required
							/>
						</div>

						{/* Password Input */}
						<div>
							<label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[var(--color_red)] focus:outline-none transition-colors pr-12"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
								>
									{showPassword ? (
										<span className="text-xl">👁️</span>
									) : (
										<span className="text-xl">🙈</span>
									)}
								</button>
							</div>
						</div>

						{/* Remember Me & Forgot Password */}
						<div className="flex items-center justify-between">
							<label className="flex items-center">
								<input
									type="checkbox"
									className="w-4 h-4 text-[var(--color_red)] border-gray-300 rounded focus:ring-[var(--color_red)]"
								/>
								<span className="ml-2 text-sm text-gray-600">Remember me</span>
							</label>
							<a href="/charity/forgot-password" className="text-sm text-[var(--color_red)] hover:text-[var(--color_red_tinted)] font-medium">
								Forgot password?
							</a>
						</div>

						{/* Error Message */}
						{error && (
							<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
								{error}
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-[var(--color_red)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<span className="animate-spin">⏳</span>
									Signing in...
								</span>
							) : (
								'Sign In'
							)}
						</button>
					</form>

					{/* Divider */}
					<div className="mt-8 mb-6 flex items-center">
						<div className="flex-1 border-t border-gray-300"></div>
						<span className="px-4 text-sm text-gray-500">OR</span>
						<div className="flex-1 border-t border-gray-300"></div>
					</div>

					{/* Register Link */}
					<div className="text-center">
						<p className="text-gray-600">
							Don't have an account?{' '}
							<a href="mailto:support@aidway.org" className="text-[var(--color_red)] hover:text-[var(--color_red_tinted)] font-semibold">
								Contact us to register your charity!
							</a>
						</p>
					</div>

					{/* Help Text
					<div className="mt-6 p-4 bg-gray-50 rounded-lg">
						<p className="text-sm text-gray-600 text-center">
							Need help? Contact us at{' '}
							<a href="mailto:support@aidway.org" className="text-[var(--color_red)] hover:underline">
								support@aidway.org
							</a>
						</p>
					</div> */}
				</div>
			</div>
		</>
	)
}

export function Correspondent_Login() {
	const router = useRouter()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [showPassword, setShowPassword] = useState(false)

	const [accessCode, setAccessCode] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const correspondentID = localStorage.getItem("correspondentID")
			if (correspondentID) {
				router.push('/group/dashboard')
			}
		}
	}, [router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const response = await fetch('/api/correspondent_login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			})

			const data = await response.json()

			if (response.ok) {
				// Redirect to correspondent dashboard
				localStorage.setItem("correspondentID", data.user.id);
				router.push('/group/dashboard')
			} else {
				setError(data.message || 'Invalid credentials')
			}
		} catch (err) {
			setError('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	const handleActivate = async (e: React.FormEvent) => {
		e.preventDefault()

		if (password !== confirmPassword) {
			alert("Passwords do not match")
			return
		}

		setLoading(true)

		try {
			const res = await fetch("/api/activate-account", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accessCode,
					password
				})
			})

			const data = await res.json()

			if (!res.ok) {
				alert(data.error || "Activation failed")
				return
			}

			alert("Account activated!")

		} catch (err) {
			console.error(err)
			alert("Something went wrong")
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
					{/* Logo */}
					<div className="flex justify-center mb-6">
						<Image
							src='/Logo_Horizontal_wtext.svg'
							alt="AIDWAY Logo"
							width={150}
							height={50}
							className="h-auto w-auto"
						/>
					</div>

					{/* Title */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Correspondent Login</h1>
						<p className="text-gray-600">Access your organization's dashboard</p>
					</div>

					{/* Login Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Email Input */}
						<div>
							<label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
								Email Address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="correspondent@email.com"
								className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[var(--color_red)] focus:outline-none transition-colors"
								required
							/>
						</div>

						{/* Password Input */}
						<div>
							<label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[var(--color_red)] focus:outline-none transition-colors pr-12"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
								>
									{showPassword ? (
										<span className="text-xl">👁️</span>
									) : (
										<span className="text-xl">🙈</span>
									)}
								</button>
							</div>
						</div>

						{/* Remember Me & Forgot Password */}
						<div className="flex items-center justify-between">
							<label className="flex items-center">
								<input
									type="checkbox"
									className="w-4 h-4 text-[var(--color_red)] border-gray-300 rounded focus:ring-[var(--color_red)]"
								/>
								<span className="ml-2 text-sm text-gray-600">Remember me</span>
							</label>
							<a href="/correspondent/forgot-password" className="text-sm text-[var(--color_red)] hover:text-[var(--color_red_tinted)] font-medium">
								Forgot password?
							</a>
						</div>

						{/* Error Message */}
						{error && (
							<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
								{error}
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-[var(--color_red)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<span className="animate-spin">⏳</span>
									Signing in...
								</span>
							) : (
								'Sign In'
							)}
						</button>
					</form>

					
					{/* Divider */}
					<div className="mt-8 mb-6 flex items-center">
						<div className="flex-1 border-t border-gray-300"></div>
						<span className="px-4 text-sm text-gray-500">OR</span>
						<div className="flex-1 border-t border-gray-300"></div>
					</div>
							
					<p className='mb-2 font-bold'>Activate correspondent account</p>

					<form onSubmit={handleActivate}>
						<div className="space-y-4">

							{/* Access Code */}
							<div>
								<label
									htmlFor="access_code"
									className="block text-sm font-semibold text-gray-700 mb-2"
								>
									One time access code
								</label>

								<input
									id="access_code"
									type="text"
									value={accessCode}
									onChange={(e) => {
										let value = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()

										if (value.length > 4) {
											value = value.slice(0, 4) + "-" + value.slice(4, 8)
										}

										setAccessCode(value)
									}}
									placeholder="XXXX-XXXX"
									maxLength={9}
									className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[var(--color_red)] focus:outline-none transition-colors"
									required
								/>
							</div>

							{/* Password */}
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-semibold text-gray-700 mb-2"
								>
									Password
								</label>

								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter your password"
									className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[var(--color_red)] focus:outline-none transition-colors"
									required
								/>
							</div>

							{/* Confirm Password */}
							<div>
								<label
									htmlFor="confirm_password"
									className="block text-sm font-semibold text-gray-700 mb-2"
								>
									Confirm password
								</label>

								<input
									id="confirm_password"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Re-enter your password"
									className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[var(--color_red)] focus:outline-none transition-colors"
									required
								/>
							</div>

							{/* Activate Button */}
							<button
								type="submit"
								disabled={loading || password !== confirmPassword}
								className="w-full bg-[var(--color_red)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color_red_tinted)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
							>
								{loading ? (
									<span className="flex items-center justify-center gap-2">
										<span className="animate-spin">⏳</span>
										Activating...
									</span>
								) : (
									"Activate Account"
								)}
							</button>

						</div>
					</form>

					{/* Divider */}
					<div className="mt-8 mb-6 flex items-center">
						<div className="flex-1 border-t border-gray-300"></div>
						<span className="px-4 text-sm text-gray-500">OR</span>
						<div className="flex-1 border-t border-gray-300"></div>
					</div>

					{/* Register Link */}
					<div className="text-center">
						<p className="text-gray-600">
							Don't have an account?{' '}
							<a href="mailto:support@aidway.org" className="text-[var(--color_red)] hover:text-[var(--color_red_tinted)] font-semibold">
								Contact us or one of our partners to register your group
							</a>
						</p>
					</div>

					{/* Help Text
					<div className="mt-6 p-4 bg-gray-50 rounded-lg">
						<p className="text-sm text-gray-600 text-center">
							Need help? Contact us at{' '}
							<a href="mailto:support@aidway.org" className="text-[var(--color_red)] hover:underline">
								support@aidway.org
							</a>
						</p>
					</div> */}
				</div>
			</div>
		</>
	)
}