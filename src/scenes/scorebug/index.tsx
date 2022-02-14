import { useEffect, useState } from 'react'
import { useSpring, animated } from 'react-spring'
import { useServices } from '../../hooks/services'

import { RocketLeague } from '../../types/Live'
import style from './scorebug.module.scss'

export const Scorebug = (props: any) => {
  const [animation, setAnimation] = useState(0) // 0: don't animate, 1: animate in, 2: animate out
  const [show, setShow] = useState(false) // Show by default?
  const { websocket, events } = useServices()

  const game = websocket.match.game ? (websocket.match.game as RocketLeague.Game) : undefined

  // Event handlers go in here
  useEffect(() => {
    // Manual show/hide from control board
    events.on('scene:visibility', (name: string, state: boolean, transition: boolean = false) => {
      if (name === 'TestScene') {
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
    websocket.registerScene('Test Scene', {
      format: {
        match_title: 'string',
        background: 'string',
        show_teams: 'boolean',
        teams: [
          {
            name: 'string',
            series: 'number',
            players: [
              {
                name: 'string',
                score: 'number',
              },
            ],
          },
        ],
      },
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

  return (
    <animated.div hidden={!show} style={animProps} className={style.testScene}>
      <p>Test Scene {game ? game.time : ''}</p>
    </animated.div>
  )
}
