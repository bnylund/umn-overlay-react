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
      url: string
      color: string
      team: number
      name: string
    }[]
  >([
    /*{
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 0,
      name: 'chez',
    },
    {
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 0,
      name: 'Bismo',
    },
    {
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 0,
      name: 'Mom',
    },
    {
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 1,
      name: 'Lege',
    },
    {
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 1,
      name: 'Rad',
    },*/
    {
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 0,
      name: 'Saltie',
    },
    {
      url: 'https://vdo.ninja/?view=CfhMrq3&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 0,
      name: 'Mom',
    },
    {
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 0,
      name: 'Merlin',
    },
    {
      url: 'https://vdo.ninja/?view=CfhMrq3&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 1,
      name: 'Boomer',
    },
    {
      url: 'https://vdo.ninja/?view=g2aAY29&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 1,
      name: 'C-Block',
    },
    {
      url: 'https://vdo.ninja/?view=CfhMrq3&cleanoutput&autostart&transparent&noheader',
      color: '#7a0019',
      team: 1,
      name: 'Tex',
    },
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
            color: 'string',
            url: 'string',
            team: 'number',
            name: 'string',
          },
        ],
      },
      buttons: [
        {
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
        },
      ],
      // Data from CB comes in here
      handler: (data: any) => {
        setCams(data.cams)
      },
    })

    /*setTimeout(() => {
      setCamMode(2)
    }, 1000)*/

    const updateState = (state: Base.Match) => {
      setMatch(state)
    }

    const gameEvent = (event: { event: string; data: any }) => {
      const { event: ev, data } = event
      if (ev === 'game:goal_scored') {
        if (camMode !== -1) setCamMode(1)
      } else if (ev === 'game:replay_end') {
        if (camMode !== -1) setCamMode(2)
      }
    }

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
    <div className={style.match}>
      {cams.map((val, index) => {
        return <link key={`preload-${val.name}`} rel="preload" href={val.url} as="document" />
      })}
      <Scorebug />
      <Boost />
      <Statfeed />
      <PlayerCams cams={cams} show={camMode === 1} />
      <Player showCam={camMode === 2} cams={cams} />
      <Replay />
    </div>
  )
}
