import style from './match.module.scss'

export const PlayerCams: React.FC<any> = (props: {
  cams: { url: string; color: string; team: number }[]
  show: boolean
}) => {
  const { cams, show } = props
  return (
    <div className={style.cams}>
      <div data-show={show ? 'true' : 'false'}>
        {cams.map((val, index) => {
          if (val.team !== 0) return null
          return (
            <div
              key={`cam-${val.url}-${val.team}-${index}`}
              style={{
                borderColor: val.color,
              }}
            >
              <iframe height="153" width="272" src={val.url} allow="autoplay" />
            </div>
          )
        })}
      </div>
      <div data-show={show ? 'true' : 'false'}>
        {cams.map((val, index) => {
          if (val.team !== 1) return null
          return (
            <div
              key={`cam-${val.url}-${val.team}-${index}`}
              style={{
                borderColor: val.color,
              }}
            >
              <iframe height="153" width="272" src={val.url} allow="autoplay" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
