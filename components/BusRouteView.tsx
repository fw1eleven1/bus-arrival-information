'use client';

import Link from 'next/link';

interface BusRouteViewProps {
  stops: any[];
  routeName: string;
}

export default function BusRouteView({ stops, routeName }: BusRouteViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{routeName} 노선도</h2>
        <p className="text-sm text-gray-500">총 {stops.length}개 정류장</p>
      </div>

      <div className="relative">
        {/* 세로 라인 */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="py-2">
          {stops.map((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === stops.length - 1;
            // carno 필드가 있으면 버스가 해당 정류장에 있음
            const hasBus = !!stop.carno;

            return (
              <Link
                key={`${stop.nodeid || stop.bstopid}-${index}`}
                href={`/stop/${stop.nodeid || stop.bstopid}?name=${encodeURIComponent(stop.bstopnm || '')}`}
              >
                <div
                  className={`relative flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${
                    hasBus ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* 정류장 점 */}
                  <div
                    className={`relative z-10 w-4 h-4 rounded-full border-2 ${
                      hasBus
                        ? 'bg-blue-500 border-blue-500'
                        : isFirst || isLast
                        ? 'bg-red-500 border-red-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {hasBus && (
                      <div className="absolute -top-1 -left-1 w-6 h-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      </div>
                    )}
                  </div>

                  {/* 정류장 정보 */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          hasBus ? 'text-blue-600' : 'text-gray-900'
                        }`}
                      >
                        {stop.bstopnm}
                      </span>
                      {(isFirst || isLast) && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          {isFirst ? '기점' : '종점'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {stop.arsno && `ARS ${stop.arsno}`}
                    </div>
                  </div>

                  {/* 버스 아이콘 */}
                  {hasBus && (
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm2 11a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                        </svg>
                        <span>{stop.carno}</span>
                      </div>
                      {(stop.lowplate === 1 || stop.lowplate === '1') && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                          저상
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
