'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
	{
		href: '/',
		label: '홈',
		icon: (
			<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={2}
					d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
				/>
			</svg>
		),
	},
	{
		href: '/search/bus',
		label: '버스검색',
		icon: (
			<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={2}
					d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
				/>
			</svg>
		),
	},
	{
		href: '/map',
		label: '지도',
		icon: (
			<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={2}
					d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
				/>
				<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
			</svg>
		),
	},
	{
		href: '/favorites',
		label: '즐겨찾기',
		icon: (
			<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={2}
					d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
				/>
			</svg>
		),
	},
];

export default function BottomNav() {
	const pathname = usePathname();

	return (
		<nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200'>
			<div className='max-w-lg mx-auto px-4'>
				<div className='flex justify-around'>
					{navItems.map((item) => {
						const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex flex-col items-center py-2 px-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
								{item.icon}
								<span className='text-xs mt-1'>{item.label}</span>
							</Link>
						);
					})}
				</div>
			</div>
			{/* iOS Safe Area 여백 */}
			<div className='pb-safe' />
		</nav>
	);
}
