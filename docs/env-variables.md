# Using environment variables

**IMPORTANT**

Be **extremely** careful when using `process.env`. As a rule of thumb the bundle code should never have to access `process.env`. If you feel you will need to use an `.env` variable please make sure you post this in the `eng-rxp` channel.

`env` variables are not available at runtime by default. Using [`babel-plugin-inline-dotenv`](https://github.com/brysgo/babel-plugin-inline-dotenv) we can inline the variables into the app bundle so they are available in our code.

## `.env-base` vs `.env`

`.env-base` is the base file for environment variables in developer local machines. In order to specify or change an environment variable first we need to create `.env` file using the `.env-base` as the initial template.

```bash
cp .env-base .env
```

Then you can specify custom values for development
