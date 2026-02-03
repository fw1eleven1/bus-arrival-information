import Link from 'next/link';

interface ArrivalInfoProps {
	arrival: any;
}

export default function ArrivalInfo({ arrival }: ArrivalInfoProps) {
	const getTimeDisplay = (minutes: string | number) => {
		if (minutes === '운행대기' || minutes === '운행종료') return String(minutes);
		const min = typeof minutes === 'string' ? parseInt(minutes) : minutes;
		if (isNaN(min) || min <= 0) return '곧 도착';
		if (min === 1) return '1분';
		return `${min}분`;
	};

	const getBusTypeColor = (bustype: string) => {
		if (bustype?.includes('급행')) return 'bg-red-500';
		if (bustype?.includes('좌석')) return 'bg-blue-500';
		if (bustype?.includes('마을')) return 'bg-yellow-500';
		return 'bg-green-500'; // 일반
	};

	// API 응답 필드: lineno(버스번호), min1(앞차 도착시간), station1(앞차 정거장), lowplate1(앞차 저상)
	const busNo = arrival.lineno;
	const min1 = arrival.min1;
	const station1 = arrival.station1;
	const lowplate1 = arrival.lowplate1;
	const min2 = arrival.min2;
	const station2 = arrival.station2;

	return (
		<Link href={`/bus/${arrival.lineid}`} className='block'>
			<div className='p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors'>
				{/* 버스 정보 헤더 */}
				<div className='flex items-center gap-3 mb-3'>
					<div
						className={`${getBusTypeColor(arrival.bustype)} text-white px-3 py-1 rounded-full text-sm font-bold min-w-[60px] text-center`}>
						{busNo}
					</div>
					<span className='text-xs text-gray-500'>{arrival.bustype}</span>
				</div>

				{/* 앞차 정보 */}
				<div className='flex items-center justify-between mb-2'>
					<div className='flex items-center gap-2'>
						<span className='text-xs text-gray-400'>앞차</span>
						{(lowplate1 === 1 || lowplate1 === '1') && (
							<span className='text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded'>저상</span>
						)}
						{station1 && <span className='text-xs text-gray-500'>{station1}정거장 전</span>}
					</div>
					<div
						className={`text-lg font-bold ${
							(typeof min1 === 'number' && min1 <= 3) || min1 === '1' || min1 === '2' || min1 === '3'
								? 'text-red-500'
								: 'text-gray-900'
						}`}>
						{getTimeDisplay(min1)}
					</div>
				</div>

				{/* 뒷차 정보 */}
				{min2 && (
					<div className='flex items-center justify-between pt-2 border-t border-gray-100'>
						<div className='flex items-center gap-2'>
							<span className='text-xs text-gray-400'>뒷차</span>
							{station2 && <span className='text-xs text-gray-500'>{station2}정거장 전</span>}
						</div>
						<div className='text-gray-600'>{getTimeDisplay(min2)}</div>
					</div>
				)}
			</div>
		</Link>
	);
}
