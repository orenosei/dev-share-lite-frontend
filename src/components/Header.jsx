import React from 'react'
import Link from 'next/link'
import { FaSearch } from 'react-icons/fa'

function Header() {
    return (
        <header className="bg-gray-800 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo/Brand */}
                <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold">DevShareLite</Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-6">
                    <Link href="/" className="hover:text-blue-300 transition-colors">Home</Link>
                    <Link href="/explore" className="hover:text-blue-300 transition-colors">Explore</Link>
                    <Link href="/create" className="hover:text-blue-300 transition-colors">Create</Link>
                    <Link href="/about" className="hover:text-blue-300 transition-colors">About</Link>
                </nav>
                
                {/* Search Bar */}
                <div className="hidden md:flex relative mx-4 flex-grow max-w-md">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                        <FaSearch />
                    </button>
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link href="/login" className="hover:text-blue-300 transition-colors">Log In</Link>
                    <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors">Sign Up</Link>
                </div>
            </div>
        </header>
    )
}

export default Header