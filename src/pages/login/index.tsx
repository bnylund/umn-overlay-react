/*

  Login:
    - Requires email, password, server
    - first check for valid email/password on relay express api
    - If both tests pass, redirect to /

*/
import { useEffect } from 'react'
import { useServices } from '../../hooks/services'
import style from './login.module.scss'

export const Login: React.FC<any> = (props: any) => {
  //console.log('logging in...')
  const { auth, websocket } = useServices()
  useEffect(() => {
    auth
      .login('bnylund19@gmail.com', 'test_password')
      .then((user) => {
        console.log('logged in:', user)
        //websocket.connect('SERVER')
      })
      .catch((err) => {
        console.log(err)
      })
  })

  return (
    <div className={style.login}>
      <p>Login</p>
    </div>
  )
}
