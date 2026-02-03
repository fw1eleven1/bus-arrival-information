import Link from 'next/link';

export default function HomePage() {
	return (
		<div className='p-4'>
			{/* 헤더 */}
			<div className='py-6 text-center'>
				<h1 className='text-2xl font-bold text-gray-900'>부산 버스</h1>
				<p className='text-gray-500 mt-1'>실시간 도착 정보</p>
			</div>

			{/* 검색 방식 선택 */}
			<div className='space-y-4 mt-6'>
				<Link href='/search/bus' className='block'>
					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-300 hover:border-blue-300 hover:shadow-md transition-all'>
						<div className='flex items-center gap-4'>
							<div className='bg-blue-100 p-3 rounded-full'>
								<svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
									/>
								</svg>
							</div>
							<div>
								<h2 className='text-lg font-bold text-gray-900'>버스번호로 검색</h2>
								<p className='text-sm text-gray-500'>버스 번호를 입력하여 노선 정보를 확인하세요</p>
							</div>
						</div>
					</div>
				</Link>

				<Link href='/map' className='block'>
					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-300 hover:border-green-300 hover:shadow-md transition-all'>
						<div className='flex items-center gap-4'>
							<div className='bg-green-100 p-3 rounded-full'>
								<svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
									/>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
								</svg>
							</div>
							<div>
								<h2 className='text-lg font-bold text-gray-900'>내 주변 정류장</h2>
								<p className='text-sm text-gray-500'>지도에서 주변 정류장을 찾아보세요</p>
							</div>
						</div>
					</div>
				</Link>

				<Link href='/favorites' className='block'>
					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-300 hover:border-yellow-300 hover:shadow-md transition-all'>
						<div className='flex items-center gap-4'>
							<div className='bg-yellow-100 p-3 rounded-full'>
								<svg className='w-8 h-8 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
									/>
								</svg>
							</div>
							<div>
								<h2 className='text-lg font-bold text-gray-900'>즐겨찾기</h2>
								<p className='text-sm text-gray-500'>자주 이용하는 버스와 정류장을 저장하세요</p>
							</div>
						</div>
					</div>
				</Link>
			</div>

			{/* 안내 */}
			<div className='mt-8 p-4 bg-blue-50 rounded-lg'>
				<p className='text-sm text-blue-700'>
					<span className='font-medium'>30초마다 자동 갱신</span>되어 실시간 버스 위치를 확인할 수 있습니다.
				</p>
			</div>
		</div>
	);
}
