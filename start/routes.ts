/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ response }) => {
  return response.redirect().toRoute('login-form')
})

Route.group(() => {
  Route.get('/login', 'AuthenticationController.loginForm').as('login-form')
  Route.post('/login', 'AuthenticationController.login')
  Route.get('/signup', 'AuthenticationController.signupForm').as('signup-form')
  Route.post('/signup', 'AuthenticationController.signup')

  Route.get('/logout', 'AuthenticationController.logout').as('logout').middleware('silentAuth')
})

Route.resource('files', 'FilesController')
  .only(['index', 'show', 'store'])
  .middleware({
    index: 'auth',
    store: 'auth',
    show: 'silentAuth',
  })
  .where('id', Route.matchers.uuid())

Route.post('files/:id/delete/', 'FilesController.destroy')
  .as('files.destroy')
  .middleware('auth')
  .where('id', Route.matchers.uuid())

Route.on('*').render('errors/not-found')
