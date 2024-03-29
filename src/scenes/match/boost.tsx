import { useState, useEffect } from 'react'
import { useWebsocket } from '../../hooks/services'
import { Base, RocketLeague } from '../../types'
import style from './match.module.scss'

export const Boost: React.FC<any> = (props: { stroke?: number; progress?: number; radius?: number }) => {
  const ws = useWebsocket()
  const [match, setMatch] = useState<Base.Match>(ws.match)
  const [refresh, setRefresh] = useState(false)

  if (!match.game) return null

  useEffect(() => {
    const updateState = (state: Base.Match) => {
      setMatch(state)
    }

    ws.io.on('match:update_state', updateState)

    return () => {
      ws.io.off('match:update_state', updateState)
    }
  }, [refresh])

  const { player, team } = findTarget(match.game)
  if (!player || match.game.isReplay || match.game.hasWinner) return null

  const stroke = props.stroke ?? 15
  const radius = props.radius ?? 140
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  return (
    <div className={style.boost}>
      <svg height={radius * 2} width={radius * 2}>
        <image
          href={team.info ? team.info.avatar : ''}
          height={radius + 30}
          width={radius + 30}
          x={(radius - 30) / 2}
          y={(radius - 30) / 2}
          style={{ opacity: '0.2', objectFit: 'contain' }}
        />
        <circle
          id="match-backring"
          stroke="#000000aa"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset: '0' }}
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          id="match-ring"
          stroke={team.info ? team.info.colors.secondary : '#ffffff'}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset: ((100 - player.boost) / 100) * circumference }}
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          id="match-team-secondary"
          cx="50%"
          cy="50%"
          r={normalizedRadius - stroke / 2}
          fill={`${team.info ? team.info.colors.primary : '#444444'}99`}
        />
        <text
          id="boost-amount"
          x="50%"
          y="50%"
          textAnchor="middle"
          fill={team.info ? team.info.colors.secondary : '#ffffff'}
          fontSize="75px"
          fontFamily="Arial"
          style={{ textShadow: '1px 1px 10px black' }}
          dy=".3em"
        >
          {player.boost}
        </text>
      </svg>
    </div>
  )
}

const findTarget = (game: RocketLeague.Game) => {
  let target = { team: game.teams[0], player: game.teams[0].players.find((x: any) => x.id === game.target) }
  if (!target.player)
    target = { team: game.teams[1], player: game.teams[1].players.find((x: any) => x.id === game.target) }
  return target
}
