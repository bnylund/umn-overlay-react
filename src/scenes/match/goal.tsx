import { RocketLeague } from '../../types'
import style from './goal.module.scss'

export const GoalScored: React.FC<any> = (props: { team: RocketLeague.Team; transition: boolean }) => {
  return (
    <div className={style.goal} data-transition={props.transition ? 'true' : 'false'}>
      <img src={props.team.avatar} />
      <p>GOAL!</p>
    </div>
  )
}
