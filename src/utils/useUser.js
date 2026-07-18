import * as React from 'react'
import { useSession } from '@auth/create/react'

const useUser = () => {
  const { data: session, status } = useSession()
  const id = session?.user?.id

  const [user, setUser] = React.useState(session?.user ?? null)

  const fetchUser = React.useCallback(async (session) => {
    return session?.user
  }, [])

  const refetchUser = React.useCallback(() => {
    if (process.env.NEXT_PUBLIC_CREATE_ENV === 'PRODUCTION') {
      if (id) {
        fetchUser(session).then(setUser)
      } else {
        setUser(null)
      }
    }
  }, [fetchUser, id, session])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- refetchUser is an async effect trigger
  React.useEffect(refetchUser, [refetchUser])

  if (process.env.NEXT_PUBLIC_CREATE_ENV !== 'PRODUCTION') {
    return {
      user,
      data: session?.user || null,
      loading: status === 'loading',
      refetch: refetchUser,
    }
  }
  return {
    user,
    data: user,
    loading: status === 'loading' || (status === 'authenticated' && !user),
    refetch: refetchUser,
  }
}

export { useUser }

export default useUser
