import style from './not-found.module.scss'

export const NotFound: React.FC = () => {
  return (
    <div className={style.notfound}>
      <p>404 |</p>
      <p>Not Found</p>
    </div>
  )
}
