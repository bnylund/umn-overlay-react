import { RocketLeague } from '../../types'
import style from './goal.module.scss'

export const GoalScored: React.FC<any> = (props: { team: RocketLeague.Team; transition: boolean }) => {
  if (props.team.info)
    return (
      <div
        className={style.goal}
        data-transition={props.transition ? 'true' : 'false'}
        style={{
          backgroundColor: props.team.info.colors.primary,
          boxShadow: `inset 0px 0px 25px ${props.team.info.colors.secondary}`,
          color: props.team.info.colors.secondary,
        }}
      >
        <img src={props.team.info.avatar} />
        <p>GOAL!</p>
      </div>
    )

  return null
}
