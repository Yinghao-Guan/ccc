import type { ChapterId, TransitionId } from '@/lib/brushChoreography'

type Props = {
  from: ChapterId
  to: ChapterId
}

export default function Transition({ from, to }: Props) {
  const id: TransitionId = `${from}-to-${to}` as TransitionId
  return (
    <div
      className="story-transition"
      data-story-transition={id}
      data-from={from}
      data-to={to}
      aria-hidden="true"
    />
  )
}
