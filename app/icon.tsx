import { ImageResponse } from 'next/og';

export const size = {
	width: 512,
	height: 512,
};
export const contentType = 'image/png';

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					fontSize: 280,
					background: '#3B82F6',
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: '22%',
				}}>
				<svg
					width='320'
					height='320'
					viewBox='0 0 24 24'
					fill='none'
					stroke='white'
					strokeWidth='1.5'
					strokeLinecap='round'
					strokeLinejoin='round'>
					<path d='M8 6v6' />
					<path d='M16 6v6' />
					<path d='M2 12h20' />
					<path d='M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z' />
					<circle cx='7' cy='17' r='1.5' fill='white' />
					<circle cx='17' cy='17' r='1.5' fill='white' />
				</svg>
			</div>
		),
		{
			...size,
		},
	);
}
