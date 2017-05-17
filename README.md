# slack-twitter-bot
A simple slack bot that will keep track of tweets and post to a room.

You'll want to setup the following environment variables for this to work (this is formatted for VS Code "env"):

    "HOST": "",
    "PORT": "",
    "USER": "",
    "PASSWORD": "",
    "DATABASE": "",
    "SLACKTOKEN": "",
    "SLACKNAME": "Twitter integration from Wade",
    "CONSUMERKEY": "",
    "CONSUMERSECRET": "",
    "ACCESSTOKEN": "",
    "ACCESSTOKENSECRET": "",
    "SEARCHTERMS": "#SalesforceDX OR #SFDX OR SalesforceDX OR SFDX",
    "LOOPINTERVAL": "2"

As you can see, I'm using a Heroku worker and a Postgres database. Run this script to create it:

    CREATE TABLE posted_tweets(
       id integer,
       url text,
       created_at timestamp SET DEFAULT now(),
       id_str text,
       PRIMARY KEY( id )
    );

    CREATE UNIQUE INDEX posted_tweets_pkey ON posted_tweets USING btree (id)
    CREATE UNIQUE INDEX posted_tweets_url_key ON posted_tweets USING btree (url)
  
That's pretty much it! Simple, simple.
