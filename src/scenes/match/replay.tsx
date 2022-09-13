import { useState, useEffect } from 'react'
import { useWebsocket } from '../../hooks/services'
import { Base, RocketLeague } from '../../types'
import style from './replay.module.scss'

export const Replay: React.FC<any> = (props: any) => {
  const ws = useWebsocket()
  const [match, setMatch] = useState<Base.Match>(ws.match)
  const [goal, setGoal] = useState<any>(null)
  const [assister, setAssister] = useState<string>('')
  const [show, setShow] = useState(false)
  const [refresh, setRefresh] = useState(false)

  if (!match.game) return null

  useEffect(() => {
    const updateState = (state: Base.Match) => {
      setMatch(state)
    }

    const gameEvent = (event: { event: string; data: any }) => {
      if (event.event === 'game:goal_scored') {
        setGoal(event.data)
      }

      if (event.event === 'game:replay_start') {
        setShow(true)
      } else if (event.event === 'game:replay_end') {
        setShow(false)
        setTimeout(() => {
          setGoal(null)
          setAssister('')
        }, 1000)
      }

      if (event.event === 'game:statfeed_event') {
        if (event.data.type === 'Assist') {
          setAssister(event.data.main_target.name)
        }
      }
    }

    ws.io.on('match:update_state', updateState)
    ws.io.on('game:event', gameEvent)

    return () => {
      ws.io.off('match:update_state', updateState)
      ws.io.off('game:event', gameEvent)
    }
  }, [refresh])

  if (!match.game || !goal) return null
  const { team } = findPlayerName(match.game, goal.scorer.name)

  return (
    <div
      className={style.replay}
      style={{
        backgroundColor: `${team.info ? team.info.colors.primary : '#444444'}99`,
        color: team.info ? team.info.colors.secondary : '#ffffff',
      }}
      data-show={show ? 'true' : 'false'}
    >
      <div className={style.tab}>
        <div style={{ backgroundColor: `${team.info ? team.info.colors.primary : '#444444'}99` }}>
          <p>GOAL</p>
        </div>
        <div>{goal ? <p>{goal.scorer.name}</p> : null}</div>
      </div>
      <div className={style.replayText}>
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="#f008" />
        </svg>
        <p>REPLAY</p>
      </div>
      <div className={style.tab} data-show={assister.length === 0 ? 'false' : 'true'}>
        <div style={{ backgroundColor: `${team.info ? team.info.colors.primary : '#444444'}99` }}>
          <p>ASSIST</p>
        </div>
        <div>
          <p>{assister}</p>
        </div>
      </div>
    </div>
  )
}

const findPlayerName = (game: RocketLeague.Game, name: string) => {
  let target = { team: game.teams[0], player: game.teams[0].players.find((x: any) => x.name === name) }
  if (!target.player) target = { team: game.teams[1], player: game.teams[1].players.find((x: any) => x.name === name) }
  return target
}
