import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { User } from 'App/Models'
import { uuid, isUuid } from 'uuidv4'

export default class File extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @attachment({
    folder: 'attachments',
  })
  public attachment: AttachmentContract

  @column()
  public name: string

  @column()
  public isPublic: boolean

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static generateUuid(instance: File) {
    if (!instance.id || !isUuid(instance.id)) {
      instance.id = uuid()
    }
  }
}
