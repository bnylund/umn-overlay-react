import { RocketLeague } from '../../types'
import style from './goal.module.scss'

export const GoalScored: React.FC<any> = (props: { team: RocketLeague.Team; transition: boolean }) => {
  return (
    <div
      className={style.goal}
      data-transition={props.transition ? 'true' : 'false'}
      style={{
        backgroundColor: props.team.colors.primary,
        boxShadow: `inset 0px 0px 25px ${props.team.colors.secondary}`,
        color: props.team.colors.secondary,
      }}
    >
      <img src={props.team.avatar} />
      <p>GOAL!</p>
    </div>
  )
}
