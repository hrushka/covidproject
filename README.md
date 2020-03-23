# covidproject.org

The goal of this project is to make it easier for other similar mapping and modeling projects to have easy access to updated information relating to the spread of COVID-19. 

**The project itself has 4 parts**:

- Write parsers for each locality — ***In progress***
- Design an populate a database with structured data on a regular cadence
- Develop a feed to make the full dataset publcally accessible
- Develop a public API for specific queries

## How to get going

1. Make sure you have [node.js](https://nodejs.org/en/download/) installed

2. Clone the repo

3. Install the [Serverless](https://serverless.com/) framework globally

   ```bash
   npm i serverless --global
   ```

4. Install the dependencies

   ```bash
   npm i
   ```

## How to test the parsers

To run any parser, first, make sure it's configured in the *serverless.yaml* file.

```yaml
functions:
  update_us_ak:
    handler: us_ak.parse
  update_us_al:
    handler: us_al.parse
  update_us_az:
    handler: us_az.parse
  update_us_il:
    handler: us_il.parse
```

Then you can execute any parser locally by calling the following command. Below is an example of Alaska.

```bash
serverless invoke local --function update_us_az
```

