import { useCallback, useEffect, useRef, useState } from 'react'

const POSTS_API = 'https://jsonplaceholder.typicode.com/posts'
const TARGET_TOTAL = 1100

export function toPost(
  raw: { id: number; title: string; body: string },
  syntheticId?: number,
): Post {
  const id = syntheticId ?? raw.id
  return {
    id,
    title: raw.title,
    body: raw.body,
    imageUrl: `https://picsum.photos/200/200?random=${id}`,
  }
}

export function useMyListData() {
  const [list, setList] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const seedRef = useRef<Post[]>([])
  const nextIdRef = useRef(101)

  const fetchPosts = useCallback((onDone?: () => void) => {
    fetch(POSTS_API)
      .then((res) => res.json())
      .then((raw: { id: number; title: string; body: string }[]) => {
        const posts = raw.map((r) => toPost(r))
        seedRef.current = posts
        nextIdRef.current = 101
        setList(posts)
      })
      .catch(() => setList([]))
      .finally(() => onDone?.())
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchPosts(() => setLoading(false))
  }, [fetchPosts])

  const refresh = useCallback(
    () =>
      new Promise<void>((resolve) => {
        fetchPosts(resolve)
      }),
    [fetchPosts],
  )

  const loadMore = useCallback(() => {
    const seed = seedRef.current
    if (seed.length === 0 || list.length >= TARGET_TOTAL) return
    setLoadingMore(true)
    const nextId = nextIdRef.current
    const newItems: Post[] = seed.map((p, i) =>
      toPost({ id: p.id, title: p.title, body: p.body }, nextId + i),
    )
    nextIdRef.current = nextId + seed.length
    setList((prev) => prev.concat(newItems))
    setLoadingMore(false)
  }, [list.length])

  const hasMore = list.length < TARGET_TOTAL

  return { list, loading, loadingMore, loadMore, hasMore, refresh }
}
