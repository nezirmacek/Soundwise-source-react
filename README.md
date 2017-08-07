# Soundwise

A marketplace for short-form audio courses in business and personal development.

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install
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

## To-dos:
- [ ] Fix audio player bug (for chrome)
- [ ] Fix potential Facebook log in error (no redirect after log in)
- [ ] Add loading indicator between when "play" button is clicked and a lesson is ready to play
- [ ] Add loading indicator before images are loaded in "cheat sheet"
- [ ] Add course catalog page
- [ ] Add course file uploader
