'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import type { Favorite } from '@/types';

const COLLECTION_NAME = 'favorites';

// 익명 사용자 ID (localStorage에 저장)
function getAnonymousUserId(): string {
  if (typeof window === 'undefined') return '';

  let userId = localStorage.getItem('anonymous_user_id');
  if (!userId) {
    userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_user_id', userId);
  }
  return userId;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 즐겨찾기 목록 실시간 구독
  useEffect(() => {
    const userId = getAnonymousUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Favorite[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Favorite);
        });
        // 최신순 정렬
        items.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
        setFavorites(items);
        setLoading(false);
      },
      (err) => {
        console.error('즐겨찾기 조회 오류:', err);
        setError('즐겨찾기를 불러올 수 없습니다.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 즐겨찾기 추가
  const addFavorite = useCallback(
    async (type: 'bus' | 'stop', targetId: string, name: string) => {
      const userId = getAnonymousUserId();
      if (!userId) return;

      try {
        const db = getFirebaseDb();
        await addDoc(collection(db, COLLECTION_NAME), {
          userId,
          type,
          targetId,
          name,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('즐겨찾기 추가 오류:', err);
        throw err;
      }
    },
    []
  );

  // 즐겨찾기 삭제
  const removeFavorite = useCallback(async (favoriteId: string) => {
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, COLLECTION_NAME, favoriteId));
    } catch (err) {
      console.error('즐겨찾기 삭제 오류:', err);
      throw err;
    }
  }, []);

  // 즐겨찾기 여부 확인
  const isFavorite = useCallback(
    (type: 'bus' | 'stop', targetId: string) => {
      return favorites.some(
        (fav) => fav.type === type && fav.targetId === targetId
      );
    },
    [favorites]
  );

  // 즐겨찾기 ID 찾기
  const getFavoriteId = useCallback(
    (type: 'bus' | 'stop', targetId: string) => {
      const fav = favorites.find(
        (f) => f.type === type && f.targetId === targetId
      );
      return fav?.id || null;
    },
    [favorites]
  );

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavoriteId,
  };
}
