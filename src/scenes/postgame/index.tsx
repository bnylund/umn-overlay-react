import { useState, useEffect } from 'react'
import { useServices } from '../../hooks/services'
import { Base } from '../../types'
import style from './postgame.module.scss'
import umn from '../../assets/umn.png'

export const Postgame: React.FC<any> = (props: any) => {
  const [show, setShow] = useState(false)
  const { websocket, events, transition } = useServices()
  const [refresh, setRefresh] = useState(false)
  const [m, setMatch] = useState<Base.Match>(websocket.match)
  const [match, setMatchSave] = useState<Base.Match>(websocket.match)

  // Event handlers go in here
  useEffect(() => {
    const sceneVisibility = (name: string, state: boolean, transition: boolean = false) => {
      if (name === 'Postgame') {
        setShow(state)
      }
    }
    // Manual show/hide from control board
    events.on('scene:visibility', sceneVisibility)

    websocket.registerScene('Postgame')

    const updateState = (state: Base.Match) => {
      setMatch(state)
    }

    const gameEvent = (event: { event: string; data: any }) => {
      const { event: ev, data } = event
      if (ev === 'game:match_ended') {
        setMatchSave(m)
      } else if (ev === 'game:podium_start') {
        setTimeout(() => {
          transition(() => {
            setShow(true)
            events.emit('scene:visibility', 'Match', false, false)
          })
        }, 4500)
      } else if (ev === 'game:pre_countdown_begin') {
        setShow(false)
      }
    }

    /*setTimeout(() => {
      transition(() => {
        console.log('SWITCH!')
        setShow(true)
      })
    }, 1500)*/

    websocket.io.on('update state', updateState)
    websocket.io.on('game event', gameEvent)

    return () => {
      websocket.io.off('update state', updateState)
      websocket.io.off('game event', gameEvent)
      events.off('scene:visibility', sceneVisibility)
    }
  }, [refresh])

  if (!match.game || !show) return null

  return (
    <div className={style.postgame}>
      <div className={style.top}>
        <div className={style.team}>
          <p>{match.game.teams[0].name}</p>
          <div className={style.series}>
            {new Array(Math.ceil(match.bestOf / 2)).fill(0).map((val, index) => {
              return (
                <div
                  key={`postgame-team0series-${index}`}
                  data-active={match.game!.teams[0].series > index ? 'true' : 'false'}
                ></div>
              )
            })}
          </div>
        </div>
        <div className={style.overview}>
          <img src={match.game.teams[0].avatar} />
          <p>{`${match.game.teams[0].score} - ${match.game.teams[1].score}`}</p>
          <img src={match.game.teams[1].avatar} />
        </div>
        <div className={style.team}>
          <p>{match.game.teams[1].name}</p>
          <div className={style.series}>
            {new Array(Math.ceil(match.bestOf / 2)).fill(0).map((val, index) => {
              return (
                <div
                  key={`postgame-team1series-${index}`}
                  data-active={match.game!.teams[1].series > index ? 'true' : 'false'}
                ></div>
              )
            })}
          </div>
        </div>
      </div>
      <div className={style.middle}>
        <div className={style.players}>
          <div className={style.nameRow}>
            {match.game.teams[0].players.map((val) => {
              const team = match.game!.teams[0]
              return (
                <div
                  style={{
                    color: team.colors.secondary,
                    backgroundImage: getPlayerNameBackgroundImage(team.colors.primary, team.colors.secondary),
                  }}
                  key={`postgame-name-${val.id}`}
                >
                  <p>{val.name}</p>
                </div>
              )
            })}
          </div>
          <div className={style.table}>
            {match.game.teams[0].players.map((val) => {
              const team = match.game!.teams[0]
              return (
                <div key={`postgame-stats-${val.id}`} className={style.statsCol}>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.goals}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.assists}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.saves}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.shots}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{((val.shots === 0 ? 0 : val.goals / val.shots) * 100).toFixed(0)}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.demos}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.score}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className={style.stats}>
          <div>
            <hr />
            <p>GOALS</p>
            <hr />
          </div>
          <div>
            <hr />
            <p>ASSISTS</p>
            <hr />
          </div>
          <div>
            <hr />
            <p>SAVES</p>
            <hr />
          </div>
          <div>
            <hr />
            <p>SHOTS</p>
            <hr />
          </div>
          <div>
            <hr />
            <p>SHOT %</p>
            <hr />
          </div>
          <div>
            <hr />
            <p>DEMOS</p>
            <hr />
          </div>
          <div>
            <hr />
            <p>SCORE</p>
            <hr />
          </div>
        </div>
        <div className={style.players}>
          <div className={style.nameRow}>
            {match.game.teams[1].players.map((val) => {
              const team = match.game!.teams[1]
              return (
                <div
                  style={{
                    color: team.colors.secondary,
                    backgroundImage: getPlayerNameBackgroundImage(team.colors.primary, team.colors.secondary),
                  }}
                  key={`postgame-name-${val.id}`}
                >
                  <p>{val.name}</p>
                </div>
              )
            })}
          </div>
          <div className={style.table}>
            {match.game.teams[1].players.map((val) => {
              const team = match.game!.teams[1]
              return (
                <div key={`postgame-stats-${val.id}`} className={style.statsCol}>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.goals}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.assists}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.saves}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.shots}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{((val.shots === 0 ? 0 : val.goals / val.shots) * 100).toFixed(0)}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.demos}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: team.colors.primary,
                      color: team.colors.secondary,
                      boxShadow: `0px 0px 3px 5px inset ${team.colors.secondary}`,
                    }}
                  >
                    <p>{val.score}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className={style.bottom}>
        <img src={umn} />
      </div>
    </div>
  )
}

const getPlayerNameBackgroundImage = (primary: string, secondary: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="50" width="150" viewBox="0 0 150 50" version="1.1">
      <defs><filter id="inset-shadow">
        <feOffset dx="10" dy="10"/>
        <feGaussianBlur stdDeviation="15"  result="offset-blur"/>
        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
        <feFlood flood-color="${secondary}" flood-opacity="1" result="color"/>
        <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
        <feComponentTransfer in="shadow" result="shadow">
            <feFuncA type="linear" slope=".9"/>
        </feComponentTransfer>
    </filter></defs>
      <polygon fill="${secondary}a" stroke="${primary}" points="25,0 150,0 125,50 0,50" filter="url(#inset-shadow)" />
    </svg>
  `
  return `url('data:image/svg+xml;base64,${window.btoa(svg)}')`
}
