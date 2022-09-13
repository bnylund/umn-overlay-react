import { useState, useEffect } from 'react'
import { useWebsocket } from '../../hooks/services'
import { Base, RocketLeague } from '../../types'
import style from './match.module.scss'

export const Player: React.FC<any> = (props: {
  showCam: boolean
  cams: {
    vdo_id: string
    color: string
    team: number
    platform_id: string
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

    ws.io.on('match:update_state', updateState)

    return () => {
      ws.io.off('match:update_state', updateState)
    }
  }, [refresh])

  // Don't do any transitions if no target is found.
  const { player, team } = findTarget(match.game)
  if (!player || match.game.isReplay || match.game.hasWinner) return null

  return (
    <div
      className={style.player}
      style={{
        backgroundColor: team.info ? team.info.colors.primary : '#444444',
        color: team.info ? team.info.colors.secondary : '#ffffff',
      }}
    >
      <p>{player.name}</p>
      {props.cams.map((val, index) => {
        return (
          <div
            key={`playercam-${val.platform_id}-${val.vdo_id}`}
            className={style.playerCam}
            style={{
              display: val.platform_id === player.primaryID && props.showCam ? 'initial' : 'none',
            }}
          >
            <div style={{ borderColor: team.info ? team.info.colors.primary : '#444444' }}>
              <iframe
                width="368"
                height="207"
                src={`https://vdo.ninja/?view=${val.vdo_id}&cleanoutput&autostart&transparent&noheader&deafen`}
                allow="autoplay"
              ></iframe>
            </div>
          </div>
        )
      })}

      <div style={{ zIndex: '10', position: 'relative' }}>
        <div
          className={style.tags}
          style={{
            color: team.info ? team.info.colors.primary : '#444444',
            backgroundColor: team.info ? team.info.colors.secondary : '#ffffff',
          }}
        >
          <p>GOALS</p>
          <p>ASSISTS</p>
          <p>SAVES</p>
          <p>SHOTS</p>
          <p>SCORE</p>
        </div>
        <div className={style.stats} style={{ backgroundColor: team.info ? team.info.colors.primary : '#444444' }}>
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
