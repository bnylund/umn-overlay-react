import { useEffect, useState } from 'react'
import { useWebsocket } from '../../hooks/services'
import { Base } from '../../types'
import { GoalScored } from './goal'
import style from './match.module.scss'

export const Scorebug: React.FC<any> = (props: { show: boolean }) => {
  const ws = useWebsocket()
  const [match, setMatch] = useState<Base.Match>(ws.match)
  const [goalspeed, setGoalspeed] = useState(0)
  const [show, setShow] = useState(props.show)
  const [goal, setGoal] = useState(-1)
  const [showGoal, setShowGoal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [clock, setClock] = useState('5:00')

  useEffect(() => {
    const updateState = (state: Base.Match) => {
      setMatch(state)
      if (state.game) {
        const c = getClockDisplay(state.game.time, state.game.isOT)

        if (state.game.isOT && state.game.time === 0) {
          setClock('+0:00')
          return
        }

        if (c) {
          if (!state.game.isOT && state.game.time < 61 && c.includes('0:')) return

          if (c === '0:0') return

          if (state.game.isOT && !c.includes('+')) return

          //console.log(c)
          setClock(c)
        }
      }
    }

    const gameEvent = (event: { event: string; data: any }) => {
      if (event.event === 'game:goal_scored') {
        setGoalspeed(event.data.goalspeed * 0.621371) // Save as MPH
        setGoal(event.data.scorer.teamnum)
        setShowGoal(true)
        setTimeout(() => {
          setShowGoal(false)
          setTimeout(() => {
            setGoal(0)
          }, 2000)
        }, 3000)
      } else if (event.event === 'game:clock_started') {
        setShow(true)
      } else if (event.event === 'game:match_ended') {
        setShow(false)
      } else if (event.event === 'game:match_destroyed') {
        setShow(false)
      }
    }

    ws.io.on('match:update_state', updateState)
    ws.io.on('game:event', gameEvent)

    /*setTimeout(() => {
      setGoal(1)
      setTimeout(() => {
        setGoal(0)
        if (match.game) setMatch({ ...match, game: { ...match.game, isReplay: true } })
      }, 3000)
    }, 3000)*/

    return () => {
      ws.io.off('match:update_state', updateState)
      ws.io.off('game:event', gameEvent)
    }
  }, [refresh])

  if (!match.game) return null

  return (
    <div key="match-scorebug" className={style.scorebug} data-show={show ? 'true' : 'false'}>
      <div className={style.clock} data-show={show}>
        <p>{clock}</p>
      </div>
      <div className={style.teams}>
        <div className={style.team} data-goal={showGoal ? '1' : '0'}>
          <div
            style={{
              backgroundColor: match.game.teams[0].info ? match.game.teams[0].info.colors.primary : '#444444',
              color: match.game.teams[0].info ? match.game.teams[0].info.colors.secondary : '#ffffff',
            }}
          >
            <p>{match.game.teams[0].info ? match.game.teams[0].info.name : `HOME TEAM`}</p>
            <div className={style.series}>
              {new Array(Math.ceil(match.bestOf / 2)).fill(0).map((val, index) => {
                return (
                  <div
                    key={`scorebug-hteam-series-${index}`}
                    data-active={match.game!.teams[0].series >= index + 1 ? 'true' : 'false'}
                  ></div>
                )
              })}
            </div>
          </div>
          <div
            className={style.score}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: match.game.teams[0].info ? match.game.teams[0].info.colors.secondary : '#ffffff',
              color: match.game.teams[0].info ? match.game.teams[0].info.colors.primary : '#444444',
            }}
          >
            <p style={{ margin: 0, padding: 0, fontSize: '54px', fontWeight: 'bolder', zIndex: '9' }}>
              {match.game.teams[0].score}
            </p>
          </div>
        </div>
        <div className={style.team} data-goal={showGoal ? '2' : '0'}>
          <div
            style={{
              backgroundColor: match.game.teams[1].info ? match.game.teams[1].info.colors.primary : '#444444',
              color: match.game.teams[1].info ? match.game.teams[1].info.colors.secondary : '#ffffff',
            }}
          >
            <p>{match.game.teams[1].info ? match.game.teams[1].info.name : `AWAY TEAM`}</p>
            <div className={style.series}>
              {new Array(Math.ceil(match.bestOf / 2)).fill(0).map((val, index) => {
                return (
                  <div
                    key={`scorebug-ateam-series-${index}`}
                    data-active={match.game!.teams[1].series >= index + 1 ? 'true' : 'false'}
                  ></div>
                )
              })}
            </div>
          </div>
          <div
            className={style.score}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: match.game.teams[1].info ? match.game.teams[1].info.colors.secondary : '#ffffff',
              color: match.game.teams[1].info ? match.game.teams[1].info.colors.primary : '#444444',
            }}
          >
            <p style={{ margin: 0, padding: 0, fontSize: '54px', fontWeight: 'bolder', zIndex: '9' }}>
              {match.game.teams[1].score}
            </p>
          </div>
        </div>
      </div>
      <GoalScored team={goal === 0 ? match.game.teams[0] : match.game.teams[1]} transition={showGoal} />
      <div data-replay={match.game.isReplay ? 'true' : 'false'} className={style.goalspeed}>
        <p>Goal Speed: {goalspeed.toFixed(0)} MPH</p>
      </div>
    </div>
  )
}

function secondsToTime(seconds: number, showMs: boolean, isOT = false) {
  if (seconds > 599) {
    return new Date(seconds * 1000).toISOString().substr(showMs ? 17 : 14, 5)
  } else if (seconds < 10 && !isOT) {
    return new Date(seconds * 1000).toISOString().substr(showMs ? 18 : 15, 3)
  } else {
    return new Date(seconds * 1000).toISOString().substr(showMs ? 17 : 15, 4)
  }
}

function getClockDisplay(time?: number, isOT: boolean = false) {
  if (!time) return undefined

  var nonOTfull = Math.ceil(time) // Rocket League time rounds up, round game time up

  // Non Overtime less than a minute to display ms in RL time format
  if (nonOTfull < 61 && !isOT && String(time).includes('.') === true) {
    return secondsToTime(time, true)
  }

  // Overtime
  else if (isOT && String(time).includes('.') === true) {
    return '+' + secondsToTime(nonOTfull, false, true)
  } else if (isOT && time === 0) {
    return '+0:00'
  }

  // Set game time to 5 minutes at start of match
  else if (String(time).includes('.') === false && time === 300 && isOT === false) {
    return secondsToTime(time, false)
  }

  // Non overtime non less than a minute time
  else {
    return secondsToTime(nonOTfull, false)
  }
}
