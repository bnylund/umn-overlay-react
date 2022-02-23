import { useEffect, useState } from 'react'
import { useWebsocket } from '../../hooks/services'
import { Base } from '../../types'
import { GoalScored } from './goal'
import style from './match.module.scss'

export const Scorebug: React.FC<any> = () => {
  const ws = useWebsocket()
  const [match, setMatch] = useState<Base.Match>(ws.match)
  const [goalspeed, setGoalspeed] = useState(0)
  const [show, setShow] = useState(false)
  const [goal, setGoal] = useState(-1)
  const [showGoal, setShowGoal] = useState(false)
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    const updateState = (state: Base.Match) => {
      setMatch(state)
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
      } else if (event.event === 'game:initialized') {
        setShow(true)
      } else if (event.event === 'game:match_ended') {
        setShow(false)
      }
    }

    ws.io.on('update state', updateState)
    ws.io.on('game event', gameEvent)

    /*setTimeout(() => {
      setGoal(1)
      setTimeout(() => {
        setGoal(0)
        if (match.game) setMatch({ ...match, game: { ...match.game, isReplay: true } })
      }, 3000)
    }, 3000)*/

    return () => {
      ws.io.off('update state', updateState)
      ws.io.off('game event', gameEvent)
    }
  }, [refresh])

  if (!match.game) return null

  return (
    <div key="match-scorebug" className={style.scorebug} data-show={show ? 'true' : 'false'}>
      <div className={style.clock} data-show={show}>
        <p>{getClockDisplay(match.game.time) ?? ''}</p>
      </div>
      <div className={style.teams}>
        <div className={style.team} data-goal={showGoal ? '1' : '0'}>
          <div
            style={{
              backgroundColor: match.game.teams[0].colors.primary,
              color: match.game.teams[0].colors.secondary,
            }}
          >
            <p>{match.game.teams[0].name}</p>
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
              backgroundColor: match.game.teams[0].colors.secondary,
              color: match.game.teams[0].colors.primary,
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
              backgroundColor: match.game.teams[1].colors.primary,
              color: match.game.teams[1].colors.secondary,
            }}
          >
            <p>{match.game.teams[1].name}</p>
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
              backgroundColor: match.game.teams[1].colors.secondary,
              color: match.game.teams[1].colors.primary,
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
  if (!time) return '5:00'

  var nonOTfull = Math.ceil(time) // Rocket League time rounds up, round game time up

  // Non Overtime less than a minute to display ms in RL time format
  if (nonOTfull < 61 && isOT == false && String(time).includes('.') === true) {
    return secondsToTime(time, true)
  }

  // Overtime
  else if (isOT == true && String(time).includes('.') === true) {
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
