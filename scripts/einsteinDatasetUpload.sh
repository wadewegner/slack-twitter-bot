curl -X POST -H "Authorization: Bearer " -H "Cache-Control: no-cache" -H "Content-Type: multipart/form-data" -F "data=@/Users/wade.wegner/Projects/Github/WadeWegner/slack-twitter-bot/assets/categorized_tweets.csv" -F "type=text-intent"   https://api.einstein.ai/v2/language/datasets/upload