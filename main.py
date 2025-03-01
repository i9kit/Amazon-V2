import discord
import sqlite3
import os

from assets import modals
import config
from discord.ext import commands
from discord import app_commands


client = commands.Bot(command_prefix=config.settings['Prefix'],
                      intents=discord.Intents.all())




#Дроб Даун Меню ---------------------------------------------------------------------------------------------------------
#Мое дроб дун меню для статистики - создание
class MyDropDownSelect(discord.ui.Select): #
  def __init__(self):
    options= [
      discord.SelectOption(label='Изменить название страны', value='1', emoji='🛑'),
      discord.SelectOption(label='Изменить флаг страны', value='2', emoji='🚩'),
      discord.SelectOption(label='Изменить лидера страны', value='3', emoji='🧑‍💼'),
      discord.SelectOption(label='Изменить описание страны', value='4', emoji='🗺️'),
      discord.SelectOption(label='Изменить форму правления страны', value='5', emoji='🗳️'),
      discord.SelectOption(label='Изменить идеологию страны', value='6', emoji='📢'),
      discord.SelectOption(label='Изменить религию страны', value='7', emoji='✝️')
    ]
    super().__init__(placeholder='Настройки страны', options=options)

  async def callback(self, interaction: discord.Interaction):  
        if self.values[0] == '1':
          await interaction.response.send_modal(modals.ModalName())
        elif self.values[0] == '2':
          await interaction.response.send_modal(modals.ModalFlag())
        elif self.values[0] == '3':
          await interaction.response.send_modal(modals.ModalHead())
        elif self.values[0] == '4':
          await interaction.response.send_modal(modals.ModalDesc())
        elif self.values[0] == '5':
          await interaction.response.send_modal(modals.ModalForm())
        elif self.values[0] == '6':
          await interaction.response.send_modal(modals.ModalIdeol())
        elif self.values[0] == '7':
          await interaction.response.send_modal(modals.ModalRelig())


#Мое дроб дун меню для статистики - вывод
class MyDropDownView(discord.ui.View): 
  def __init__(self):
    super().__init__()
    self.add_item(MyDropDownSelect())
#Дроб Даун Меню ---------------------------------------------------------------------------------------------------------



#Команда для бота при его запуске
@client.event
async def on_ready():

  db = sqlite3.connect('database.db')
  cursor = db.cursor()
  synced = await client.tree.sync()
  print( str(len(synced)) + f'Команда со / включены.')

  cursor.execute("""CREATE TABLE IF NOT EXISTS users(
    id INT PRIMARY KEY,
    mention TEXT,
    name_country TEXT,
    name TEXT, 
    nick TEXT,
    head TEXT,
    description TEXT,
    flag CHAR,
    form TEXT, 
    ideol TEXT, 
    relig TEXT,
    organis TEXT, 
    alie TEXT  
    )""")

  for guild in client.guilds:
    for member in guild.members:
      if cursor.execute(f"SELECT id FROM users WHERE id = {member.id}", ).fetchone() is None:
        cursor.execute("INSERT INTO users VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", (member.id, f'<@{member.id}>', 'Не указано', f'{member.name}', f'{member.nick}', 'Не указан', 'Не указано', '', 'Не указана', 'Не указана', 'Не указана', 'Не состоит', 'Не состоит'))
      else:
        pass

  for file in os.listdir("./cogs"):
    if file.endswith(".py"):
        filename = file[:-3]
        try:
            await client.load_extension(f"cogs.{filename}")
            print(f"- {filename} ✅ ")
        except:
            print(f"- {filename} ❌ ")


  db.commit()
  cursor.close()
  db.close()


#Заполнение игрока в таблицу при заходе на сервер
@client.event
async def on_member_join(member):
  db = sqlite3.connect('database.db')
  cursor = db.cursor()

  if cursor.execute(f"SELECT id FROM users WHERE id = {member.id}", ).fetchone() is None:
    cursor.execute("INSERT INTO users VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", (member.id, f'<@{member.id}>', '', f'{member.name}', f'{member.nick}', 'Не указан', 'Не указано', '', 'Не указана', 'Не указана', 'Не указана', 'Не состоит', 'Не состоит'))
  else:
    pass

  db.commit()
  cursor.close()
  db.commit()


#Команда для добавления названия страны
@client.tree.command(name='set-statics', description='Добавить статистику стране')
@app_commands.default_permissions(administrator = True)
@app_commands.rename(member='участник', name='название', head='лидер', description='описание', flag='флаг', form='форма_правления', ideologia='идеология', religia='религия')
@app_commands.describe(member= 'Выберите участника', name= 'Укажите название страны', head= 'Укажите главу страны', description= 'Укажите описание страны', flag= 'Прямая ссылка на флаг', form= 'Укажите форму правления страны', ideologia= 'Укажите идеологию страны', religia= 'Укажите религию страны')
async def set_settings(interaction: discord.Interaction, member:discord.Member, name: str= None, head: str= None, description: str= None, flag: str= None, form: str= None, ideologia: str= None, religia: str= None):
  #Подключение базы данных
  db = sqlite3.connect('database.db')
  cursor = db.cursor()

  #Блок кода для того чтобы None не выводило
  if name is None:
    name = 'Не указано'
  if head is None:
    head = 'Не указан'
  if description is None:
    description = 'Не указано'
  if form is None:
    form = 'Не указана'
  if ideologia is None:
    ideologia = 'Не указана' 
  if religia is None:
    religia = 'Не указана'
  #Блок кода для того чтобы None не выводило

  #Подключение автора сообщение(чтоб айдишник брать) и кода сервера
  sql = (f"UPDATE users SET name_country = ?, head = ?, description = ?, flag = ?, form = ?, ideol = ?, relig = ? WHERE id = ? ")  #Создание команды на обнолвение базы данных
  val = (str(name), str(head), str(description), str(flag), str(form), str(ideologia), str(religia), member.id)  #Переменные для занесения их в базу данных

  cursor.execute(sql, val)  #Команда для занесения

  db.commit()  #Подтверждения базы данных

  embed = discord.Embed(description=f"Вы успешно статистику страны", colour=discord.Colour.green())
  embed.set_author(name=f"Добавление статистики стране",icon_url= f"https://cdn.discordapp.com/attachments/851493045307965444/1102975978013216858/32b5f387704100d0.png")

  await interaction.response.send_message(embed=embed)  #Отправка сообщений на что вы поменяли

  #Отключение базы данных
  cursor.close()
  db.close()



#Команда для добавления организаии
@client.tree.command(name='organ', description='Изменение организации')
@app_commands.rename(arg='организация', member='участник')
@app_commands.describe(arg= 'Выберите организацию', member='Выберите участника')
async def edit_organis(interaction : discord.Interaction, arg:str, member:discord.Member=None):

  #Подключение базы данных
  db = sqlite3.connect('database.db')
  cursor = db.cursor()

  #Подключение автора сообщение(чтоб айдишник брать)
  if member == None:
    member = interaction.user

  sql = (f"UPDATE users SET organis = ? WHERE id = ? ")  #Создание команды на обнолвение базы данных
  val = (str(arg), member.id)  #Переменные для занесения их в базу данных

  cursor.execute(sql, val)  #Команда для занесения

  db.commit()  #Подтверждения базы данных

  embed = discord.Embed(description=f"Вы успешно вступили в огранизацию: \n **{arg}**", colour=discord.Colour.green())
  embed.set_author(
    name=f"Добавление организации",
    icon_url=
    f"https://cdn.discordapp.com/attachments/851493045307965444/1102975978013216858/32b5f387704100d0.png"
  )

  await interaction.response.send_message(embed=embed)
  #Отключение базы данных
  cursor.close()
  db.close()


#Команда для добавления альянса
@client.tree.command(name= 'alie', description='Изменение альянса')
@app_commands.rename(arg='альянс', member='участник')
@app_commands.describe(arg= 'Выберите альянс', member='Выберите участника')
async def edit_alie(interaction : discord.Interaction, arg:str, member:discord.Member=None):
  #Подключение базы данных
  db = sqlite3.connect('database.db')
  cursor = db.cursor()

  #Подключение автора сообщение(чтоб айдишник брать)
  if member is None:
    member = interaction.user

  sql = (f"UPDATE users SET alie = ? WHERE id = ? ")  #Создание команды на обнолвение базы данных
  val = (str(arg), member.id)  #Переменные для занесения их в базу данных

  cursor.execute(sql, val)  #Команда для занесения


  db.commit()  #Подтверждения базы данных

  embed = discord.Embed(description=f"Вы успешно вступили в альянс: \n **{arg}**", colour=discord.Colour.green())
  embed.set_author(
    name=f"Добавление альянса",
    icon_url=
    f"https://cdn.discordapp.com/attachments/851493045307965444/1102975978013216858/32b5f387704100d0.png"
  )

  await interaction.response.send_message(embed=embed)  #Отправка сообщений на что вы поменяли

  #Отключение базы данных
  cursor.close()
  db.close()


#Команда для отображения статистики
@client.tree.command(name='stats', description='Посмотреть вашу статистику')
@app_commands.rename(member='участник')
@app_commands.describe(member='Выберите участника')
async def stats(interaction : discord.Interaction, member:discord.Member=None):

  #Подключение базы данных
  db = sqlite3.connect('database.db')
  cursor = db.cursor()

  #Подключение автора сообщение(чтоб айдишник брать)
  if member is None:
    member = interaction.user
    
  #Делание списка из таблицы данных
  cursor.execute(f"SELECT name_country, nick, head, description, flag, form, ideol, relig, organis, alie FROM users WHERE id = {member.id}")
  user = cursor.fetchone()
    
    #Из списка в переменные
  try:
    name_country = user[0]
    nick = user[1]
    head = user[2]
    description = user[3]
    flag = user[4]
    form = user[5]
    ideol = user[6]
    relig = user[7]
    organis = user[8]
    alie = user[9]
  except:
      pass 

  #Вывод     
  embed = discord.Embed(colour=discord.Colour.blue())
  embed.set_author(name=f"Статистика {nick}",icon_url=f"https://cdn.discordapp.com/attachments/851493045307965444/1102975978013216858/32b5f387704100d0.png")
  embed.set_thumbnail(url=f"{flag}")
  embed.add_field(
    name=f"Основная информация",
    value=
    f">>> Название страны: **{name_country}** \n Флаг страны: Справа \n Лидер страны: **{head}** \n Описание страны: **{description}** \n Форма правления страны: **{form}** \n Идеология страны: **{ideol}** \n Религия страны: **{relig}** \n Организации страны: **{organis}** \n Альянсы страны: **{alie}** \n")

  try:
    await interaction.response.send_message(embed=embed, view=MyDropDownView()) #Отправка сообщений на что вы поменяли 
  except:
    embed = discord.Embed(colour=discord.Colour.blue(), description=f'**Ваша статистика не смогла вывеститься на экран по неизветсным нам причинам. \n Попробуйте изменить название|флаг|описание вашей страны.**')
    embed.set_author(name=f"Ошибка",icon_url=f"https://cdn.discordapp.com/attachments/851493045307965444/1102975978013216858/32b5f387704100d0.png")

    await interaction.response.send_message(embed=embed, view=MyDropDownView())
  
  #Отключение базы данных
  cursor.close()
  db.close()     


client.run(token=config.settings['Token'])     