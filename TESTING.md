# Testing

Notes and some useful tips for testing

## General tips

If you sign up for new account, please use a REAL email address

If you create new soundcasts for testing, please set published = false in firebase

## Running in test mode

Comment out *new webpack.optimize.UglifyJsPlugin(),* line in *webpack.config.js* and run:
```
NODE_ENV=dev node --inspect server/server.js
NODE_ENV=dev npm run-script start
```

## Account

To obtain user's id:
```
firebase.auth().currentUser.uid
```

To delete already existing account you need to relogin (in browser) and run:
```
firebase.auth().currentUser.delete().then(function() { console.log(1) }).catch(function(error) { console.log(error) });
```

## Testing soundcasts

http://localhost:3000/soundcasts/1512247726161s - single (with available coupon code *tryitfree*)
http://localhost:3000/soundcasts/1519180882673s - bundle

## Testing signup_options

Test feed url:  http://foundersnextdoor.com/feed/podcast/ 

## Stripe

Set up test *stripe_key* in *config.js*:
```
module.exports.stripe_key = 'sk_test_1H5f9Kkve63WNpxgaGVYekT4';
```

You can test new user checkout with a test credit card number 4242424242424242.

Expiration date must be in future. CVC code can be any three digits.

Test stripe_id:

*cus_Ce5IdSGT4Bs1br* (- *users/${USER_ID}/stripe_id* fb node)


Test stripe_id for payouts:

*acct_1BZSpfI4Klp9ZG1K* (- *publishers/${USER_ID}/stripe_user_id* fb node)*

\* - Note: comment *inviteListeners* call in *app_signup.js* (other files?)

