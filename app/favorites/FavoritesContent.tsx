'use client';

import Link from 'next/link';
import { useFavorites } from '@/lib/hooks/useFavorites';
import Loading from '@/components/Loading';

export default function FavoritesContent() {
  const { favorites, loading, error, removeFavorite } = useFavorites();

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFavorite(id);
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  const busFavorites = favorites.filter((f) => f.type === 'bus');
  const stopFavorites = favorites.filter((f) => f.type === 'stop');

  return (
    <div className="p-4">
      {/* 헤더 */}
      <div className="py-4">
        <h1 className="text-xl font-bold text-gray-900">즐겨찾기</h1>
        <p className="text-sm text-gray-500">자주 이용하는 버스와 정류장</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <p>즐겨찾기가 없습니다</p>
          <p className="text-sm mt-2">
            버스나 정류장 페이지에서 별 아이콘을 눌러 추가하세요
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 버스 즐겨찾기 */}
          {busFavorites.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                버스 ({busFavorites.length})
              </h2>
              <div className="space-y-2">
                {busFavorites.map((fav) => (
                  <Link key={fav.id} href={`/bus/${fav.targetId}`}>
                    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm2 11a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">
                          {fav.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleRemove(fav.id, e)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 정류장 즐겨찾기 */}
          {stopFavorites.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                정류장 ({stopFavorites.length})
              </h2>
              <div className="space-y-2">
                {stopFavorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/stop/${fav.targetId}?name=${encodeURIComponent(fav.name)}`}
                  >
                    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">
                          {fav.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleRemove(fav.id, e)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
