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
### setup test publisher and transactions:
```
node server/bin/create-test-data.js
```

### SSL certificate renewal
- every three months, need to renew certificate (cron job set up for auto-renewal, but need to check regularly, just to make sure)
```
sudo certbot --nginx -d mysoundwise.com -d www.mysoundwise.com
```
For reference, see https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-14-04

#### Issues

##### - wrong buffer length:
node_modules/microm/dist/microm.js:3125
change
self.buffer = new ArrayBuffer(view);
to
self.buffer = new ArrayBuffer(view.buffer.byteLength);

##### - Error: Cannot resolve module 'fs' in /home/developer/www/SoundwiseCMS_web/node_modules/request/lib:
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

### Start the webpack bundle compiler in dev mode (stripe testing)

```
NODE_ENV=dev npm run-script start
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

## recreate db
```
sudo -u postgres psql
    drop database "soundwise";
    CREATE DATABASE soundwise;
    GRANT ALL ON DATABASE soundwise TO root;
node database/index.js
node server/bin/create-lb-tables.js
node .
```

### Issues:

#### - express-fileuploader module changes files names when upload to aws s3:
api/node_modules/express-fileuploader/lib/index.js:91-93
```
var uid = uuid.v1(),
    ext = path.extname(file.name);
file.name = uid + ext;
```
comment these 3 strings

#### - webpack watch not recompiling files on changes
solution https://webpack.js.org/configuration/watch/#not-enough-watchers

#### - progress-label.js:13 Uncaught TypeError: Cannot read property 'number' of undefined
fix: edit *node_modules/react-progress-label/dist/progress-label.js*
and add after   *var React = require('react');*   :
```
React.PropTypes = require('prop-types');
React.createClass = require('create-react-class');
```


## Archiving in xcode shows 'duplicate symbol error' because of conflicts in cocoapod

Follow instructions in this:
https://github.com/facebook/react-native/issues/12814

1. Open your [yourproject].xcworkspace
2. Select your Pods project
3. In TARGETS delete React.
4. Clean (Product > Clean) & archive/build/whatever.
