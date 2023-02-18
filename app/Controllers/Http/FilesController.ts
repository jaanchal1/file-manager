import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { File } from 'App/Models'

export default class FilesController {
  public async index({ view, auth }: HttpContextContract) {
    const user = auth.user!

    await user.load('files', (query) => query.orderBy('createdAt', 'desc'))

    return view.render('files/list', {
      files: user.files,
    })
  }

  public async store({ auth, request, response, session }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        file: schema.file({
          size: 1024 * 1024 * 25, // limit to 25 mb
        }),
        name: schema.string.nullableAndOptional({}, [rules.maxLength(200)]),
        is_public: schema.boolean.nullableAndOptional(),
      }),
    })

    const file = await auth.user!.related('files').create({
      name: data.name || data.file.clientName,
      attachment: Attachment.fromFile(data.file),
      isPublic: !!data.is_public,
    })

    session.flash('createdFile', file.toJSON())

    return response.redirect().toRoute('files.index')
  }

  public async show({ auth, params, view }: HttpContextContract) {
    const user = auth.user

    const file = await File.query().where('id', params.id).first()

    if (!file || (!file.isPublic && file.userId !== user?.id)) {
      return view.render('errors/not-found')
    }

    if (file.userId === user?.id) {
      file.$setRelated('user', user)
    } else {
      await file.load('user')
    }

    return view.render('files/view', {
      file,
    })
  }

  public async destroy({ params, auth, response, view, session }: HttpContextContract) {
    const user = auth.user!

    const file = await user.related('files').query().where('id', params.id).first()

    if (!file) {
      return view.render('errors/not-found')
    }

    await file.delete()

    session.flash('deletedFile', file.toJSON())

    return response.redirect().toRoute('files.index')
  }
}
