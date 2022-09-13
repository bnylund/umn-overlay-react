import { useEffect, useRef, useState } from 'react'
import { useWebsocket } from '../../hooks/services'
import { Base, RocketLeague } from '../../types'
import { v4 as uuidv4 } from 'uuid'
import style from './match.module.scss'

export const Statfeed: React.FC<any> = (props: any) => {
  const ref = useRef<HTMLDivElement>(null)

  const ws = useWebsocket()
  const [match, setMatch] = useState<Base.Match>(ws.match)
  const [refresh, setRefresh] = useState(false)

  if (!match.game) return null

  const addEvent = (player: string, color: string, stat: string) => {
    if (!ref.current) return
    var html = `
        <p style="background-color: ${color} !important;">${player}</p>
        <p data-name="true">${stat}</p>`

    var child = document.createElement('div')
    child.classList.add('match-event')
    child.innerHTML = html
    child.id = uuidv4()
    ref.current.appendChild(child)

    child.classList.add('animate__animated', 'animate__fadeInLeft')

    setTimeout(function () {
      child.classList.add('animate__animated', 'animate__fadeOutRight')

      child.addEventListener('animationend', () => {
        child.remove()
      })
    }, 4000)
  }

  const addDemoEvent = (left_name: string, left_color: string, right_name: string, right_color: string) => {
    if (!ref.current) return
    var html = `
        <p style="background-color: ${left_color} !important;">${left_name}</p>
        <p data-name="true">DEMO</p>
        <p style="background-color: ${right_color} !important;">${right_name}</p>`
    var child = document.createElement('div')
    child.classList.add('row', 'match-event')
    child.id = uuidv4()
    child.innerHTML = html
    ref.current.appendChild(child)

    child.classList.add('animate__animated', 'animate__fadeInLeft')

    setTimeout(function () {
      child.classList.add('animate__animated', 'animate__fadeOutRight')

      child.addEventListener('animationend', () => {
        child.remove()
      })
    }, 4000)
  }

  useEffect(() => {
    const updateState = (state: Base.Match) => {
      setMatch(state)
    }

    const gameEvent = (event: { event: string; data: any }) => {
      if (!match.game) return

      if (event.event === 'game:statfeed_event') {
        const { data } = event
        const stat = getName(data.type)

        if (stat === 'Demo') {
          let { player: mainPlayer, team: mainTeam } = findPlayer(match.game, data['main_target']['id'])
          let { player: secondaryTarget, team: secondaryTeam } = findPlayer(match.game, data['secondary_target']['id'])
          if (mainPlayer && secondaryTarget) {
            addDemoEvent(
              data['main_target']['name'],
              mainTeam.info ? mainTeam.info.colors.primary : '#444444',
              data['secondary_target']['name'],
              secondaryTeam.info ? secondaryTeam.info.colors.primary : '#444444',
            )
          }
        } else {
          const { player, team } = findPlayer(match.game, data['main_target']['id'])
          if (player && team) {
            addEvent(data['main_target']['name'], team.info ? team.info.colors.primary : '#ffffff', stat)
          }
        }
      }
    }

    ws.io.on('game:event', gameEvent)
    ws.io.on('match:update_state', updateState)

    /*setTimeout(() => {
      if (!match.game) return
      addDemoEvent(
        match.game.teams[0].players[0].name,
        match.game.teams[0].colors.primary,
        match.game.teams[1].players[0].name,
        match.game.teams[1].colors.primary,
      )
      addEvent(match.game.teams[0].players[0].name, match.game.teams[0].colors.primary, 'Clear')
      addEvent(match.game.teams[0].players[0].name, match.game.teams[0].colors.primary, 'Epic Save')
    }, 1000)*/

    return () => {
      ws.io.off('match:update_state', updateState)
      ws.io.off('game:event', gameEvent)
    }
  }, [refresh])

  return <div className={style.statfeed} ref={ref}></div>
}

const findPlayer = (game: RocketLeague.Game, id: string) => {
  let target = { team: game.teams[0], player: game.teams[0].players.find((x: any) => x.id === id) }
  if (!target.player) target = { team: game.teams[1], player: game.teams[1].players.find((x: any) => x.id === id) }
  return target
}

const getName = (type: string) => {
  if (type === 'Shot on Goal') return 'Shot'
  if (type === 'Demolition') return 'Demo'
  if (type === 'Clear Ball') return 'Clear'
  return type
}

const getOffset = (el: HTMLDivElement) => {
  const rect = el.getBoundingClientRect()
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  }
}
