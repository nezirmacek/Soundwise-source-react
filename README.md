# Soundwise

A marketplace for short-form audio courses in business and personal development.

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install
```

### Configure Postgres database (locally)
1. install postgres
     ```brew install postgresql```
2. initialize postgres and restart everytime computer starts
     ```pg_ctl -D /usr/local/var/postgres start && brew services start postgresql```
3. (for restart postgres server:)
     ```postgres -D /usr/local/var/postgres```
4. create a user called root
     ```createuser --pwprompt root```
   (when prompted for password, just hit n, and then enter)
5. create a database called soundwise
     ```createdb -Oroot -Eutf8 soundwise```
OR
```
sudo apt-add-repository ppa:pitti/postgresql
sudo apt-get update
sudo apt-get install postgresql-9.2
sudo -u postgres psql
    CREATE DATABASE soundwise;
    CREATE USER root WITH password '111';
    GRANT ALL ON DATABASE soundwise TO root;
```
ctrl+d OR \q+enter

To connect to database:
    ```psql soundwise```
See all tables:
    `\dt`
Drop the table called 'Soundcasts':
    `drop table "Soundcasts";`
See table content of table 'Users':
    `select * from "Users";`

### setup strongloop api
```
node server/bin/create-lb-tables.js
node server/bin/automigrate.js
```

#### Issues

#####- wrong buffer length:
node_modules/microm/dist/microm.js:3125
change
self.buffer = new ArrayBuffer(view);
to
self.buffer = new ArrayBuffer(view.buffer.byteLength);

#####- Error: Cannot resolve module 'fs' in /home/developer/www/SoundwiseCMS_web/node_modules/request/lib:
open node_modules/request/lib/har.js
and remove
var fs = require('fs')
because fs is the default nodejs package

### Start the Server

```
npm run-script start:server
```

### Start the webpack bundle compiler

```
npm run-script start
```

### Compile JSX

```
npm run-script build
```

### Start loppback api

```
node .
```

### Directories
- Front end code is under `/client`
- Audio player controls are in `/client/components/course_section.js` and `/client/containers/player_bar.js`

### URL format
- Course landing page: `localhost:8080/courses/120`
- Course page: `localhost:8080/myprograms/120`

## api
```
sudo npm i -g strongloop
cd api/
npm i
node .
```

### issues:

####- express-fileuploader module changes files names when upload to aws s3:
api/node_modules/express-fileuploader/lib/index.js:91-93
```
var uid = uuid.v1(),
    ext = path.extname(file.name);
file.name = uid + ext;
```
comment these 3 strings

### Loopback terminal scenario

SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:model Users
? Enter the model name: Users
? Select the data-source to attach Users to: db (postgresql)
? Select model's base class PersistedModel
? Expose Users via the REST API? Yes
? Custom plural form (used to build REST URL):
? Common model or server only? server
Let's add some Users properties now.

Enter an empty property name when done.
? Property name: userId
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another Users property.
Enter an empty property name when done.
? Property name: firstName
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another Users property.
Enter an empty property name when done.
? Property name: lastName
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another Users property.
Enter an empty property name when done.
? Property name: picURL
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:model Episodes
? Enter the model name: Episodes
? Select the data-source to attach Episodes to: db (postgresql)
? Select model's base class PersistedModel
? Expose Episodes via the REST API? Yes
? Custom plural form (used to build REST URL):
? Common model or server only? server
Let's add some Episodes properties now.

Enter an empty property name when done.
? Property name: soundcastId
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another Episodes property.
Enter an empty property name when done.
? Property name: publisherId
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another Episodes property.
Enter an empty property name when done.
? Property name: episodeId
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another Episodes property.
Enter an empty property name when done.
? Property name: title
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another Episodes property.
Enter an empty property name when done.
? Property name: soundcastTitle
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:model Soundcasts
? Enter the model name: Soundcasts
? Select the data-source to attach Soundcasts to: db (postgresql)
? Select model's base class PersistedModel
? Expose Soundcasts via the REST API? Yes
? Custom plural form (used to build REST URL):
? Common model or server only? server
Let's add some Soundcasts properties now.

Enter an empty property name when done.
? Property name: soundcastId
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another Soundcasts property.
Enter an empty property name when done.
? Property name: publisherId
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another Soundcasts property.
Enter an empty property name when done.
? Property name: title
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:model ListeningSessions
? Enter the model name: ListeningSessions
? Select the data-source to attach ListeningSessions to: db (postgresql)
? Select model's base class PersistedModel
? Expose ListeningSessions via the REST API? Yes
? Custom plural form (used to build REST URL):
? Common model or server only? server
Let's add some ListeningSessions properties now.

Enter an empty property name when done.
? Property name: soundcastId
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another ListeningSessions property.
Enter an empty property name when done.
? Property name: publisherId
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another ListeningSessions property.
Enter an empty property name when done.
? Property name: episodeId
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another ListeningSessions property.
Enter an empty property name when done.
? Property name: userId
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another ListeningSessions property.
Enter an empty property name when done.
? Property name: date
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another ListeningSessions property.
Enter an empty property name when done.
? Property name: startPosition
   invoke   loopback:property
? Property type: number
? Required? Yes
? Default value[leave blank for none]:

Let's add another ListeningSessions property.
Enter an empty property name when done.
? Property name: endPosition
   invoke   loopback:property
? Property type: number
? Required? Yes
? Default value[leave blank for none]:

Let's add another ListeningSessions property.
Enter an empty property name when done.
? Property name: sessionDuration
   invoke   loopback:property
? Property type: number
? Required? Yes
? Default value[leave blank for none]:

Let's add another ListeningSessions property.
Enter an empty property name when done.
? Property name: percentCompleted
   invoke   loopback:property
? Property type: number
? Required? Yes
? Default value[leave blank for none]:

➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: Episodes
? Relation type: belongs to
? Choose a model to create a relationship with: Soundcasts
? Enter the property name for the relation: soundcast
? Optionally enter a custom foreign key: soundcastId
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: Soundcasts
? Relation type: has many
? Choose a model to create a relationship with: Episodes
? Enter the property name for the relation: episodes
? Optionally enter a custom foreign key:
? Require a through model? No
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: Users
? Relation type: has many
? Choose a model to create a relationship with: Soundcasts
? Enter the property name for the relation: soundcasts
? Optionally enter a custom foreign key: soundcastId
? Require a through model? Yes
? Choose a through model: (other)
? Enter the model name: UserSoundcast
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: Soundcasts
? Relation type: has many
? Choose a model to create a relationship with: Users
? Enter the property name for the relation: users
? Optionally enter a custom foreign key: userId
? Require a through model? Yes
? Choose a through model: (other)
? Enter the model name: UserSoundcast
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: Users
? Relation type: has many
? Choose a model to create a relationship with: Episodes
? Enter the property name for the relation: episodes
? Optionally enter a custom foreign key: episodeId
? Require a through model? Yes
? Choose a through model: (other)
? Enter the model name: UserEpisode
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: Episodes
? Relation type: has many
? Choose a model to create a relationship with: Users
? Enter the property name for the relation: users
? Optionally enter a custom foreign key: userId
? Require a through model? Yes
? Choose a through model: (other)
? Enter the model name: UserEpisode
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: ListeningSessions
? Relation type: belongs to
? Choose a model to create a relationship with: Soundcasts
? Enter the property name for the relation: soundcast
? Optionally enter a custom foreign key: soundcastId
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: Soundcasts
? Relation type: has many
? Choose a model to create a relationship with: ListeningSessions
? Enter the property name for the relation: listeningSessions
? Optionally enter a custom foreign key:
? Require a through model? No
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: ListeningSessions
? Relation type: belongs to
? Choose a model to create a relationship with: Episodes
? Enter the property name for the relation: episode
? Optionally enter a custom foreign key: episodeId
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: Episodes
? Relation type: has many
? Choose a model to create a relationship with: ListeningSessions
? Enter the property name for the relation: listeningSessions
? Optionally enter a custom foreign key:
? Require a through model? No
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: ListeningSessions
? Relation type: belongs to
? Choose a model to create a relationship with: Users
? Enter the property name for the relation: user
? Optionally enter a custom foreign key: userId
➜  SoundwiseCMS_web git:(feature/api-integration) ✗ slc loopback:relation
? Select the model to create the relationship from: Users
? Relation type: has many
? Choose a model to create a relationship with: ListeningSessions
? Enter the property name for the relation: listeningSessions
? Optionally enter a custom foreign key:
? Require a through model? No
