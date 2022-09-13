import style from './match.module.scss'

export const PlayerCams: React.FC<any> = (props: {
  cams: {
    vdo_id: string
    color: string
    team: number
    platform_id: string
  }[]
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
              key={`cam-${val.vdo_id}-${val.team}-${index}`}
              style={{
                borderColor: val.color,
              }}
            >
              <iframe
                height="153"
                width="272"
                src={`https://vdo.ninja/?view=${val.vdo_id}&cleanoutput&autostart&transparent&noheader&deafen`}
                allow="autoplay"
              />
            </div>
          )
        })}
      </div>
      <div data-show={show ? 'true' : 'false'}>
        {cams.map((val, index) => {
          if (val.team !== 1) return null
          return (
            <div
              key={`cam-${val.vdo_id}-${val.team}-${index}`}
              style={{
                borderColor: val.color,
              }}
            >
              <iframe
                height="153"
                width="272"
                src={`https://vdo.ninja/?view=${val.vdo_id}&cleanoutput&autostart&transparent&noheader&deafen`}
                allow="autoplay"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
