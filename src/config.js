const configValues = {
  apiUrl: {
    development: 'http://localhost:4000/api/',
    production: 'https://api.tr4ceable.com/api/'
  }
};

export default Object.defineProperties({}, Object.keys(configValues).reduce((agg, curr) =>
  ({
    ...agg,
    [curr]: {
      get: () => configValues[curr][process.env.NODE_ENV]
    }
  }), {})
);

