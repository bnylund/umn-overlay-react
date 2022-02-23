import { useState, useEffect } from 'react'
import { useWebsocket } from '../../hooks/services'
import { Base, RocketLeague } from '../../types'
import style from './match.module.scss'

export const Player: React.FC<any> = (props: {
  showCam: boolean
  cams: {
    url: string
    color: string
    team: number
    name: string
  }[]
}) => {
  const ws = useWebsocket()
  const [match, setMatch] = useState<Base.Match>(ws.match)
  const [refresh, setRefresh] = useState(false)

  if (!match.game) return null

  useEffect(() => {
    const updateState = (state: Base.Match) => {
      setMatch(state)
    }

    ws.io.on('update state', updateState)

    return () => {
      ws.io.off('update state', updateState)
    }
  }, [refresh])

  // Don't do any transitions if no target is found.
  const { player, team } = findTarget(match.game)
  if (!player || match.game.isReplay) return null

  return (
    <div className={style.player} style={{ backgroundColor: team.colors.primary, color: team.colors.secondary }}>
      <p>{player.name}</p>
      {props.cams.map((val, index) => {
        return (
          <div
            key={`playercam-${val.name}`}
            className={style.playerCam}
            style={{
              display: val.name.toLowerCase() === player.name.toLowerCase() && props.showCam ? 'initial' : 'none',
            }}
          >
            <div style={{ borderColor: team.colors.primary }}>
              <iframe width="368" height="207" src={val.url} allow="autoplay"></iframe>
            </div>
          </div>
        )
      })}

      <div style={{ zIndex: '10', position: 'relative' }}>
        <div className={style.tags} style={{ color: team.colors.primary, backgroundColor: team.colors.secondary }}>
          <p>GOALS</p>
          <p>ASSISTS</p>
          <p>SAVES</p>
          <p>SHOTS</p>
          <p>SCORE</p>
        </div>
        <div className={style.stats} style={{ backgroundColor: team.colors.primary }}>
          <p>{player.goals}</p>
          <p>{player.assists}</p>
          <p>{player.saves}</p>
          <p>{player.shots}</p>
          <p>{player.score}</p>
        </div>
      </div>
    </div>
  )
}

const findTarget = (game: RocketLeague.Game) => {
  let target = { team: game.teams[0], player: game.teams[0].players.find((x: any) => x.id === game.target) }
  if (!target.player)
    target = { team: game.teams[1], player: game.teams[1].players.find((x: any) => x.id === game.target) }
  return target
}
