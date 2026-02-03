import Link from 'next/link';

interface BusListProps {
	buses: any[];
	onBusClick?: () => void;
}

export default function BusList({ buses, onBusClick }: BusListProps) {
	if (buses.length === 0) {
		return <div className='text-center py-8 text-gray-500'>검색 결과가 없습니다.</div>;
	}

	const getBusTypeColor = (bustype: string) => {
		if (bustype?.includes('급행')) return 'bg-red-500';
		if (bustype?.includes('좌석')) return 'bg-blue-500';
		if (bustype?.includes('마을')) return 'bg-yellow-500';
		return 'bg-green-500'; // 일반
	};

	return (
		<div className='space-y-3'>
			{buses.map((bus: any, index: number) => (
				<Link key={bus.lineid || index} href={`/bus/${bus.lineid}`} className='block' onClick={onBusClick}>
					<div className='bg-white rounded-lg shadow-sm border border-gray-300 p-4 hover:bg-gray-50 transition-colors'>
						<div className='flex items-center gap-3 mb-2'>
							<div className={`${getBusTypeColor(bus.bustype)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
								{bus.buslinenum}
							</div>
							<span className='text-xs text-gray-500'>{bus.bustype}</span>
						</div>
						<div className='text-sm text-gray-600'>
							{bus.startpoint} → {bus.endpoint}
						</div>
						{bus.headway && <div className='text-xs text-gray-400 mt-1'>배차간격: {bus.headway}분</div>}
					</div>
				</Link>
			))}
		</div>
	);
}
