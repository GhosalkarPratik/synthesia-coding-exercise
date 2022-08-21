# Solution
## The SQS approach
I have opted to use AWS SQS to queue incoming requests and process them. The queue acts as both the datastore and helps with retrying the messages after specific intervals of time. The queue also helps smooth out irregular traffic which might hit the rate limit barrier. The job of the implemented `/crypto/sign` endpoint is only to queue input requests as messages in the queue. A background process which starts as soon as the server starts listening, starts polling for a message every 6 sec (10 times per min rate limit). This polled message is then tried on the `/crypto/sign` endpoint. If the message passes, then the webhook is called with POST containing the original message and its signature in request body. If the message fails, exponential retries are used for max. 5 times then the message is deleted.

## Steps
### `/crypto/sign` endpoint:
1. Recieve the message and webhook url from query params
2. Validate input params
3. Create an SQS message with original message and webhook url in its body.

### `/crypto/verify` endpoint:
1. Recieve the message and signature from query params
2. Validate input params
3. Call the internal `/crypto/verify` endpoint
  a. If response code is 200, send back 200 with a message
  b. If response code is 400, send back 400 with a message

### Background message processing:
1. Poll for one SQS message every 6 sec (10 times per min rate limit).
2. If SQS message is found parse the message, webhook url, recieve count and receipt handle from the SQS message.
3. Call the internal `/crypto/sign` endpoint to sign the message
  a. If response is 200 with signature, call the webhook url with the original message and signature
  b. If the response is 502 or 429, increase the visibility timeout for the SQS message and wait for its next try.
  c. If more than 5 retries, delete the  SQS message from the queue.


# How to run
1. Clone the project.
2. Update the api key value in `config/default.json` file.
2. Run `docker-compose build && docker-compose up`

## Example API calls:
Sign: http://localhost:3000/crypto/sign?message={your-message}&webhookUrl={your-webhook-url}
Verify: http://localhost:3000/crypto/verify?message={your-message}&signature={signature-from-sign-call}
