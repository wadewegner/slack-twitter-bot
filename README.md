# slack-twitter-bot

A simple slack bot that will keep track of tweets and post to a room. It also uses the Einstein Sentiment API to determine if it's positive, negative, or neutral. It's designed to run in Heroku.

You'll want to setup the following environment variables for this to work (this is formatted for VS Code "env"):

    "DATABASE_URL": "",
    "SLACKTOKEN": "",
    "SLACKNAME": "SFDX Bot",
    "CONSUMERKEY": "",
    "CONSUMERSECRET": "",
    "ACCESSTOKEN": "",
    "ACCESSTOKENSECRET": "",
    "SEARCHTERMS": "#SalesforceDX OR #SFDX OR SalesforceDX OR SFDX",
    "SEARCHRESULTCOUNT": 1,
    "LOOPINTERVAL": "2",
    "LOCAL": "",
    "EINSTEIN_VISION_PRIVATE_KEY": "",
    "EINSTEIN_VISION_ACCOUNT_ID": ""

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