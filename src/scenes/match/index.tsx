import { useEffect, useState } from 'react'
import { useServices } from '../../hooks/services'

import { Base, RocketLeague } from '../../types/Live'
import { Boost } from './boost'
import style from './match.module.scss'
import { Player } from './player'
import { PlayerCams } from './playercams'
import { Replay } from './replay'
import { Scorebug } from './scorebug'
import { Statfeed } from './statfeed'

export const Match = (props: any) => {
  const [show, setShow] = useState(false) // Show by default?
  const { websocket, events, transition } = useServices()
  const [refresh, setRefresh] = useState(false)
  const [match, setMatch] = useState<Base.Match>(websocket.match)

  const [cams, setCams] = useState<
    {
      vdo_id: string
      color: string
      team: number
      platform_id: string
    }[]
  >([
    /*{
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 0,
      name: 'Imp',
      platform_id: '76561198247336622',
    },
    {
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 0,
      name: 'Boomer',
      platform_id: '76561198247336622',
    },
    {
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 0,
      name: 'Poncho',
      platform_id: '76561198247336622',
    },*/
  ])
  // https://vdo.ninja/?push=g2aAY29
  const [camMode, setCamMode] = useState(2) // -1: Disabled, 0: Hidden, 1: All, 2: Player

  // Event handlers go in here
  useEffect(() => {
    const sceneVisibility = (name: string, state: boolean, transition_: boolean = false) => {
      if (name === 'Match') {
        if (transition_) {
          transition(() => {
            setShow(state)
            events.emit('scene:visibility', 'Postgame', false, false)
          })
        } else {
          setShow(state)
        }
      }
    }

    // Manual show/hide from control board
    events.on('scene:visibility', sceneVisibility)

    websocket.registerScene('Match', {
      data: {
        cams: [
          {
            color: 'String',
            vdo_id: 'String',
            team: 'Number',
            platform_id: 'String',
          },
        ],
      },
      buttons: [
        /*{
          name: 'Show Player Cameras',
          handler: () => {
            setCamMode(1)
          },
        },
        {
          name: 'Hide Player Cameras',
          handler: () => {
            setCamMode(0)
          },
        },
        {
          name: 'Disable Player Cameras',
          handler: () => {
            setCamMode(-1)
          },
        },*/
      ],
      // Data from CB comes in here
      handler: (data: any) => {
        console.log('got data: ', data)
        setCams(data.cams)
      },
    })

    /*setTimeout(() => {
      setCamMode(2)
    }, 1000)*/

    const updateState = (state: Base.Match) => {
      //console.log(state)
      setMatch(state)
      match.game = state.game
    }

    const hide = (delay: number) => {
      setTimeout(() => {
        sceneVisibility('Match', false, false)
      }, delay)
    }

    const gameEvent = (event: { event: string; data: any }) => {
      //console.log(event)
      const { event: ev, data } = event
      if (ev === 'game:goal_scored') {
        if (camMode !== -1) setCamMode(1)
      } else if (ev === 'game:replay_end') {
        if (camMode !== -1) setCamMode(2)
      } else if (ev === 'game:initialized') {
        sceneVisibility('Match', true, true)
      } else if (ev === 'game:match_destroyed') {
        hide(0)
      }
    }

    websocket.io.on('match:update_state', updateState)
    websocket.io.on('game:event', gameEvent)

    return () => {
      websocket.io.off('match:update_state', updateState)
      websocket.io.off('game:event', gameEvent)
      events.off('scene:visibility', sceneVisibility)
    }
  }, [refresh])

  if (!match.game || !show) return null

  return (
    <div className={style.match}>
      {cams.map((val, index) => {
        return (
          <link
            key={`preload-${`https://vdo.ninja/?view=${val.vdo_id}&cleanoutput&autostart&transparent&noheader&deafen`}`}
            rel="preload"
            href={`https://vdo.ninja/?view=${val.vdo_id}&cleanoutput&autostart&transparent&noheader&deafen`}
            as="document"
          />
        )
      })}
      {match.game
        ? match.game.teams.map((val) => {
            if (!val.info) return null
            return <link key={`preload-teamav-${val.info._id}`} rel="preload" href={val.info.avatar} as="image" />
          })
        : null}
      <Scorebug />
      <Boost />
      <Statfeed />
      <PlayerCams cams={cams} show={camMode === 1} />
      <Player showCam={camMode === 2} cams={cams} />
      <Replay />
    </div>
  )
}
