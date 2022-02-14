// External Dependencies
import { get as LSGet, set as LSSet, remove as LSRemove } from 'local-storage'
import { BehaviorSubject, Observable } from 'rxjs'
import axios, { AxiosResponse } from 'axios'

// Project Dependencies
import User from '../types/User'

export class AuthService {
  private user: User
  private currentUserSource: BehaviorSubject<User>
  public currentUser: Observable<User>

  constructor() {
    this.user = this.getUser()
    this.currentUserSource = new BehaviorSubject<any>(this.user)
    this.currentUser = this.currentUserSource.asObservable()

    this.currentUserSource.next(this.user)
  }

  getUser(): User {
    return LSGet<User>('user') ? ({ ...LSGet<User>('user'), loggedIn: true } as User) : ({ loggedIn: false } as User)
  }

  getToken(): string {
    return LSGet<string>('token') ?? ''
  }

  updateLocalUser(creds: Credentials): void {
    // Update Local Storage
    LSSet('token', creds.token)
    LSSet('user', creds.user)

    // Push update to subscribers
    this.user = { ...creds.user, loggedIn: true }
    this.currentUserSource.next(this.user)
  }

  login(email: string, password: string): Promise<User> {
    return axios({
      method: 'post',
      url: `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/login`,
      data: {
        email,
        password,
      },
    }).then((res: AxiosResponse<any>) => {
      this.updateLocalUser({
        token: res.data.token,
        user: res.data.user,
      })

      return res.data.user
    })
  }

  signup(data: { email: string; firstname: string; lastname: string; password: string; code: string }): Promise<User> {
    return axios({
      method: 'post',
      url: `${process.env.REACT_APP_BACKEND_URL}/api/v1/users`,
      data,
    }).then((res: AxiosResponse<any>) => {
      this.updateLocalUser({
        token: res.data.token,
        user: res.data.user,
      })

      return res.data.user
    })
  }

  logout(): void {
    LSRemove('user')
    LSRemove('token')
    this.user = { loggedIn: false } as User
    this.currentUserSource.next(this.user)
  }
}

export interface Credentials {
  user: User
  token: string
}
