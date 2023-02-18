import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { User } from 'App/Models'

export default class AuthenticationController {
  public async loginForm({ view }: HttpContextContract) {
    return view.render('login')
  }

  public async login({ request, response, auth, session }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        username: schema.string(),
        password: schema.string(),
      }),
    })

    try {
      await auth.attempt(data.username, data.password)

      return response.redirect().toRoute('files.index')
    } catch (e) {
      console.error(e)

      session.flash('errorMessage', 'Incorrect credentials!')

      return response.redirect().toRoute('login-form')
    }
  }

  public async signupForm({ view }: HttpContextContract) {
    return view.render('signup')
  }

  public async signup({ request, response, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        username: schema.string({}, [
          rules.maxLength(64),
          rules.minLength(3),
          rules.unique({
            table: User.table,
            column: 'username',
            caseInsensitive: true,
          }),
        ]),
        password: schema.string({}, [
          rules.maxLength(64),
          rules.minLength(6),
          rules.confirmed('confirm_password'),
        ]),
      }),
    })

    const user = await User.create(data)

    await auth.login(user)

    return response.redirect().toRoute('files.index')
  }

  public async logout({ auth, response }: HttpContextContract) {
    if (auth.isAuthenticated) {
      await auth.logout()
    }

    return response.redirect().toRoute('login-form')
  }
}
