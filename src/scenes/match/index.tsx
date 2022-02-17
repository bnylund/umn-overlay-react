import { useEffect, useState } from 'react'
import { useSpring, animated } from 'react-spring'
import { useServices } from '../../hooks/services'

import { RocketLeague } from '../../types/Live'
import { Boost } from './boost'
import style from './match.module.scss'
import { Scorebug } from './scorebug'

export const Match = (props: any) => {
  const [animation, setAnimation] = useState(0) // 0: don't animate, 1: animate in, 2: animate out
  const [show, setShow] = useState(false) // Show by default?
  const { websocket, events } = useServices()

  const game = websocket.match.game ? (websocket.match.game as RocketLeague.Game) : undefined

  // Event handlers go in here
  useEffect(() => {
    // Manual show/hide from control board
    events.on('scene:visibility', (name: string, state: boolean, transition: boolean = false) => {
      if (name === 'Match') {
        // transition in/out accordingly
        if (transition) {
          setShow(true)
          setAnimation(state ? 1 : 2)
        } else {
          setShow(state)
        }
      }
    })

    // Allowed types: string, number, boolean, Team, Player, League, Season, Match, Game
    // If no datafeed is present, no data can be supplied to this scene, but the CB can
    // still display an option to show/hide this scene. If you don't call registerScene,
    // the scene can still be used as intended, but it won't show up in the CB.
    websocket.registerScene('Match', {
      data: {
        cams: [
          {
            name: 'string',
            url: 'string',
          },
        ],
      },
      buttons: [
        {
          name: 'Show Player Cameras',
          handler: () => {
            // Show player cams
          },
        },
        {
          name: 'Hide Player Cameras',
          handler: () => {
            // Hide player cams
          },
        },
      ],
      // Data from CB comes in here
      handler: (data: any) => {},
    })

    // Check for game events to transition as well if you want auto-transitions:
    // websocket.io.on('game:event', (data) => {})
  })

  // Animation stuff https://react-spring.io/basics
  const animProps = useSpring({
    from: {
      opacity: 0,
      marginLeft: -50,
    },
    to: {
      opacity: 1,
      marginLeft: 0,
    },
    reset: animation !== 0, // If we want to animate
    reverse: animation === 2, // reverse if out
    onRest: () => {
      if (show && animation === 2) {
        // only hide div after hide transition
        setShow(false)
      }
      setAnimation(0)
    },
  })

  //return <animated.div hidden={!show} style={animProps} className={style.testScene}></animated.div>

  return (
    <div className={style.match}>
      <Scorebug />
      <Boost />
    </div>
  )
}
